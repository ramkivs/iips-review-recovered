/**
 * IID — retrieval evidence: the contract that makes a deep-page read checkable offline (`L-037`).
 *
 * `L-037` records that deep pages of large Indian issuer annual reports are capped by the readers available inside the
 * investigating environment, and it states the rule that follows: **absence of wording beyond the retrieval cap is not
 * evidence of absence**. Until now that rule lived in prose, and each evidence bundle was checked by a test written for
 * that bundle. That is enough to keep one bundle honest and useless for the next one: a new bundle could cite a page it
 * never extracted, quote a document whose fetch was refused, renumber a printed page, or claim a complete read of a
 * document it read three pages of — and nothing in this repository would notice.
 *
 * This module is the reusable half of the answer. It does not fetch anything and it does not parse PDFs: it checks the
 * **records a retrieval produces** against each other and against the committed page extracts, so that
 *
 *   1. a quotation marked READ must come from a page the bundle actually extracted;
 *   2. that page must belong to a document whose retrieval status is `RETRIEVED`, with its byte count and sha256;
 *   3. the page's own provenance header must agree with the document record, the page map and the quotation — the four
 *      artifacts cannot drift apart without being noticed;
 *   4. a document claiming a complete read must list every page, and a targeted read must say which pages it took;
 *   5. a page cannot be renumbered, printed pages cannot be mapped twice, and a quote has to be present in the extract
 *      it is attributed to, with its recorded digest.
 *
 * What it deliberately does not do: it never converts an unread page into an absence, a nil or a zero, and it never
 * reports a retrieval as successful. A bundle whose document status is `REFUSED_BY_HOST`, `NO_ROUTE`, `TRUNCATED` or
 * `MALFORMED` can carry no READ quotation at all — which is `L-037`'s rule, expressed as a refusal rather than as a
 * sentence in a README.
 *
 * Vocabulary is closed, the checks are total over the records supplied, and the verifier performs no I/O beyond the
 * extract files it is handed, writes nothing, and returns the same report for the same input.
 */

import { createHash } from 'node:crypto';

/** How a retrieval ended. Closed. Only `RETRIEVED` may back a quotation. */
export type RetrievalStatus =
  /** The bytes were obtained; `bytes`, `sha256` and `pagesTotal` are mandatory. */
  | 'RETRIEVED'
  /** The host answered and refused (403/429/bot protection, an archive that will not serve the file). */
  | 'REFUSED_BY_HOST'
  /** Nothing reached the host at all: no egress, DNS failure, TLS blocked at TCP. */
  | 'NO_ROUTE'
  /** Bytes arrived but are incomplete or do not hash to a whole document. */
  | 'TRUNCATED'
  /** Bytes arrived and are not a readable document (broken PDF, encrypted, zero pages). */
  | 'MALFORMED'
  /** Deliberately not attempted in this work item. */
  | 'NOT_ATTEMPTED';

export const RETRIEVAL_STATUSES: readonly RetrievalStatus[] = Object.freeze([
  'RETRIEVED',
  'REFUSED_BY_HOST',
  'NO_ROUTE',
  'TRUNCATED',
  'MALFORMED',
  'NOT_ATTEMPTED',
]);

/** Whether the bundle read every page of the document or only the pages it needed. */
export type RetrievalCompleteness = 'COMPLETE' | 'TARGETED';

export interface RetrievedDocument {
  readonly id: string;
  /** The printed title, which is also what the extracts' provenance headers carry. */
  readonly document: string;
  readonly url: string;
  readonly status: RetrievalStatus;
  readonly httpStatus?: number | null;
  /** Byte length of the document as retrieved. Mandatory for `RETRIEVED`. */
  readonly bytes?: number | null;
  /** Hex sha256 of the document as retrieved. Mandatory for `RETRIEVED`. */
  readonly sha256?: string | null;
  /** Page count reported by the document itself (e.g. `pdfinfo`). Mandatory for `RETRIEVED`. */
  readonly pagesTotal?: number | null;
  /** The PDF page indices (1-based) this bundle extracted. A subset of `1..pagesTotal`. */
  readonly pagesExtracted: readonly number[];
  /** `COMPLETE` claims every page; it is checked, not believed. */
  readonly completeness?: RetrievalCompleteness;
  /** Free-text route description kept as evidence, never used for control flow. */
  readonly route?: string;
  /** For a failed retrieval: the closed-ish class of failure, as observed. */
  readonly failureClass?: string;
}

/** One extracted page: the committed text file and where it sits in the document. */
export interface PageEvidence {
  readonly documentId: string;
  readonly pdfPageIndex: number;
  /** The printed page numbers printed on that sheet, e.g. `304-305` for a two-up spread. */
  readonly printedPages: string;
  /** Path of the committed extract, relative to the bundle root. */
  readonly file: string;
}

export type QuotationEvidenceClass =
  /** Read in this work item, from the extracted page. The only class that asserts a page was read. */
  | 'READ_IN_THIS_RUN'
  /** Read in an earlier, cited work item. */
  | 'READ_PREVIOUSLY'
  /** Reported by someone else and NOT read here. Cannot support a finding about the wording. */
  | 'REPORTED_NOT_READ';

export interface RetrievalQuotation {
  readonly id: string;
  readonly documentId: string;
  readonly evidenceClass: QuotationEvidenceClass;
  readonly quotedWording: string;
  readonly quotedWordingSha256: string;
  readonly pdfPageIndex: number;
  readonly printedPages?: string;
  readonly pageFile?: string;
}

export interface RetrievalBundle {
  readonly documents: readonly RetrievedDocument[];
  readonly pages: readonly PageEvidence[];
  readonly quotations: readonly RetrievalQuotation[];
}

export interface RetrievalViolation {
  readonly code: string;
  readonly path: string;
  readonly detail: string;
}

export interface RetrievalReport {
  readonly ok: boolean;
  readonly violations: readonly RetrievalViolation[];
  readonly summary: {
    readonly documents: number;
    readonly retrieved: number;
    readonly pages: number;
    readonly quotations: number;
    /** How many quotations assert a read (READ_IN_THIS_RUN or READ_PREVIOUSLY). REPORTED_NOT_READ is never one. */
    readonly quotationsRead: number;
    readonly coverage: readonly { readonly documentId: string; readonly extracted: number; readonly total: number }[];
  };
}

/** A provenance header, as every committed page extract carries it. */
export interface ProvenanceHeader {
  readonly documentTitle: string;
  readonly sourceUrl: string;
  readonly sourceBytes: number;
  readonly sourceSha256: string;
  readonly pdfPageIndex: number;
  readonly pdfPages: number;
  readonly printedPages: string;
}

const HEADER_TITLE = /^#\s*(?!#)(.+?)\s*$/;
const HEADER_URL = /^#\s*Source PDF:\s*(\S+)\s*$/m;
const HEADER_BYTES = /^#\s*Source bytes:\s*([\d,]+)\s*bytes,\s*sha256\s*([0-9a-f]{64})\s*$/m;
const HEADER_PAGES = /^#\s*PDF page index:\s*(\d+)\s*of\s*(\d+)\s+Printed page numbers on this sheet:\s*(.+?)\s*$/m;

const sha256Like = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);

/** `pdftotext -layout` output keeps the sheet's two columns interleaved, so comparison is whitespace-insensitive. */
export const normalisePageText = (text: string): string => text.replace(/\s+/g, ' ').trim();

/**
 * Read the provenance header that every page extract must carry. A missing or malformed header is a refusal, never a
 * default: a page whose own header cannot be read cannot be tied to a document or a page number.
 */
export function parseProvenanceHeader(text: string): ProvenanceHeader {
  const title = HEADER_TITLE.exec(text.split('\n')[0] ?? '');
  const url = HEADER_URL.exec(text);
  const bytes = HEADER_BYTES.exec(text);
  const pages = HEADER_PAGES.exec(text);
  const missing = [
    title === null ? 'document title' : null,
    url === null ? 'Source PDF' : null,
    bytes === null ? 'Source bytes + sha256' : null,
    pages === null ? 'PDF page index / printed page numbers' : null,
  ].filter((entry): entry is string => entry !== null);
  if (missing.length > 0) {
    throw new Error(`provenance header is missing ${missing.join(', ')}`);
  }
  return {
    documentTitle: title![1]!,
    sourceUrl: url![1]!,
    sourceBytes: Number(bytes![1]!.replace(/,/g, '')),
    sourceSha256: bytes![2]!,
    pdfPageIndex: Number(pages![1]!),
    pdfPages: Number(pages![2]!),
    printedPages: pages![3]!,
  };
}

export interface VerificationOptions {
  /** Read a committed extract. Supplied by the caller so the verifier itself performs no filesystem access. */
  readonly readExtract: (file: string) => string;
}

const HEX64 = /^[0-9a-f]{64}$/;

function checkDocument(
  document: RetrievedDocument,
  violations: RetrievalViolation[],
): void {
  const path = `documents[${document.id}]`;
  if (!RETRIEVAL_STATUSES.includes(document.status)) {
    violations.push({
      code: 'DOCUMENT_STATUS_INVALID',
      path,
      detail: `status "${String(document.status)}" is not one of ${RETRIEVAL_STATUSES.join('|')}`,
    });
    return;
  }
  if (document.status !== 'RETRIEVED') {
    // A failed retrieval may still record what it saw; it may not claim bytes it does not have.
    if (document.status === 'TRUNCATED' && document.bytes !== undefined && document.bytes !== null && document.bytes <= 0) {
      violations.push({ code: 'DOCUMENT_STATUS_INVALID', path, detail: 'a truncated retrieval records no bytes' });
    }
    return;
  }
  if (typeof document.bytes !== 'number' || !Number.isFinite(document.bytes) || document.bytes <= 0) {
    violations.push({ code: 'DOCUMENT_BYTES_MISSING', path, detail: 'a RETRIEVED document must record its byte length' });
  }
  if (!sha256Like(document.sha256)) {
    violations.push({ code: 'DOCUMENT_DIGEST_MISSING', path, detail: 'a RETRIEVED document must record its sha256' });
  }
  if (typeof document.pagesTotal !== 'number' || !Number.isFinite(document.pagesTotal) || document.pagesTotal < 1) {
    violations.push({ code: 'DOCUMENT_PAGE_COUNT_MISSING', path, detail: 'a RETRIEVED document must record its page count' });
    return;
  }
  const extracted = document.pagesExtracted ?? [];
  if (extracted.length === 0) {
    violations.push({ code: 'DOCUMENT_NO_PAGES_EXTRACTED', path, detail: 'a RETRIEVED document must record the pages extracted' });
  }
  if (new Set(extracted).size !== extracted.length) {
    violations.push({ code: 'DOCUMENT_PAGES_EXTRACTED_DUPLICATED', path, detail: 'the extracted page list repeats a page' });
  }
  for (const index of extracted) {
    if (!Number.isInteger(index) || index < 1 || index > document.pagesTotal) {
      violations.push({
        code: 'PAGE_OUTSIDE_DOCUMENT',
        path: `${path}.pagesExtracted`,
        detail: `page ${index} is outside 1..${document.pagesTotal}`,
      });
    }
  }
  if (document.completeness === 'COMPLETE') {
    const expected = Array.from({ length: document.pagesTotal }, (_, i) => i + 1);
    const missing = expected.filter((index) => !extracted.includes(index));
    if (missing.length > 0) {
      violations.push({
        code: 'COMPLETE_READ_UNSUPPORTED',
        path,
        detail: `claims a complete read but ${missing.length} of ${document.pagesTotal} pages have no extract (first: ${missing[0]})`,
      });
    }
  } else if (document.completeness !== undefined && document.completeness !== 'TARGETED') {
    violations.push({
      code: 'DOCUMENT_COMPLETENESS_INVALID',
      path,
      detail: `completeness "${String(document.completeness)}" is not COMPLETE|TARGETED`,
    });
  }
}

function checkPage(
  page: PageEvidence,
  documents: Map<string, RetrievedDocument>,
  seen: Map<string, PageEvidence>,
  calibration: Map<string, string>,
  options: VerificationOptions,
  violations: RetrievalViolation[],
): ProvenanceHeader | undefined {
  const path = `pages[${page.documentId}#${page.pdfPageIndex}]`;
  const document = documents.get(page.documentId);
  if (document === undefined) {
    violations.push({ code: 'PAGE_UNKNOWN_DOCUMENT', path, detail: `no document record for "${page.documentId}"` });
    return undefined;
  }
  if (document.status !== 'RETRIEVED') {
    violations.push({
      code: 'PAGE_WITHOUT_RETRIEVAL',
      path,
      detail: `a page extract cannot exist for a ${document.status} document`,
    });
  }
  if (typeof document.pagesTotal === 'number' && (page.pdfPageIndex < 1 || page.pdfPageIndex > document.pagesTotal)) {
    violations.push({
      code: 'PAGE_OUTSIDE_DOCUMENT',
      path,
      detail: `page ${page.pdfPageIndex} is outside 1..${document.pagesTotal}`,
    });
  }
  const key = `${page.documentId}#${page.pdfPageIndex}`;
  if (seen.has(key)) {
    violations.push({ code: 'PAGE_DUPLICATED', path, detail: 'the same PDF page is recorded twice' });
  }
  seen.set(key, page);
  if (typeof page.printedPages !== 'string' || page.printedPages.trim() === '') {
    violations.push({ code: 'PRINTED_PAGES_MISSING', path, detail: 'a page must record the printed page numbers printed on it' });
  }
  // A printed page number identifies exactly one sheet; two sheets printing the same number is a calibration error.
  const calibrationKey = `${page.documentId}#${page.printedPages}`;
  const other = calibration.get(calibrationKey);
  if (other !== undefined && other !== String(page.pdfPageIndex)) {
    violations.push({
      code: 'CALIBRATION_DUPLICATE',
      path,
      detail: `printed page(s) ${page.printedPages} are mapped to PDF pages ${other} and ${page.pdfPageIndex}`,
    });
  }
  calibration.set(calibrationKey, String(page.pdfPageIndex));

  let text: string;
  try {
    text = options.readExtract(page.file);
  } catch {
    violations.push({ code: 'PAGE_FILE_UNREADABLE', path, detail: `cannot read "${page.file}"` });
    return undefined;
  }
  let header: ProvenanceHeader;
  try {
    header = parseProvenanceHeader(text);
  } catch (cause) {
    violations.push({ code: 'HEADER_MALFORMED', path, detail: String((cause as Error).message) });
    return undefined;
  }
  if (header.documentTitle !== document.document) {
    violations.push({
      code: 'HEADER_DOCUMENT_MISMATCH',
      path,
      detail: `the extract names "${header.documentTitle}" but the record names "${document.document}"`,
    });
  }
  if (header.pdfPageIndex !== page.pdfPageIndex) {
    violations.push({
      code: 'HEADER_PAGE_INDEX_MISMATCH',
      path,
      detail: `the extract says page ${header.pdfPageIndex}, the record says ${page.pdfPageIndex}`,
    });
  }
  if (typeof document.pagesTotal === 'number' && header.pdfPages !== document.pagesTotal) {
    violations.push({
      code: 'HEADER_PAGE_COUNT_MISMATCH',
      path,
      detail: `the extract says the document has ${header.pdfPages} pages, the record says ${document.pagesTotal}`,
    });
  }
  if (header.printedPages !== page.printedPages) {
    violations.push({
      code: 'HEADER_PRINTED_PAGES_MISMATCH',
      path,
      detail: `the extract prints "${header.printedPages}", the record says "${page.printedPages}"`,
    });
  }
  if (sha256Like(document.sha256) && header.sourceSha256 !== document.sha256) {
    violations.push({
      code: 'HEADER_SOURCE_DIGEST_MISMATCH',
      path,
      detail: `the extract was taken from sha256 ${header.sourceSha256.slice(0, 16)}…, the record from ${document.sha256.slice(0, 16)}…`,
    });
  }
  if (typeof document.bytes === 'number' && header.sourceBytes !== document.bytes) {
    violations.push({
      code: 'HEADER_SOURCE_BYTES_MISMATCH',
      path,
      detail: `the extract was taken from ${header.sourceBytes} bytes, the record says ${document.bytes}`,
    });
  }
  return header;
}

function checkQuotation(
  quotation: RetrievalQuotation,
  documents: Map<string, RetrievedDocument>,
  pages: Map<string, PageEvidence>,
  options: VerificationOptions,
  violations: RetrievalViolation[],
): void {
  const path = `quotations[${quotation.id}]`;
  if (!['READ_IN_THIS_RUN', 'READ_PREVIOUSLY', 'REPORTED_NOT_READ'].includes(quotation.evidenceClass)) {
    violations.push({
      code: 'QUOTATION_EVIDENCE_CLASS_INVALID',
      path,
      detail: `evidenceClass "${String(quotation.evidenceClass)}" is not READ_IN_THIS_RUN|READ_PREVIOUSLY|REPORTED_NOT_READ`,
    });
  }
  if (!HEX64.test(quotation.quotedWordingSha256)) {
    violations.push({ code: 'QUOTE_DIGEST_MALFORMED', path, detail: 'quotedWordingSha256 is not a hex sha256' });
  } else {
    // The digest is of the wording itself; a record that carries both must agree with itself.
    if (createHash('sha256').update(quotation.quotedWording, 'utf8').digest('hex') !== quotation.quotedWordingSha256) {
      violations.push({
        code: 'QUOTE_DIGEST_MISMATCH',
        path,
        detail: 'the recorded digest is not the digest of the recorded wording',
      });
    }
  }
  const document = documents.get(quotation.documentId);
  if (document === undefined) {
    violations.push({ code: 'QUOTE_UNKNOWN_DOCUMENT', path, detail: `no document record for "${quotation.documentId}"` });
    return;
  }
  if (quotation.evidenceClass === 'REPORTED_NOT_READ') {
    // Not read here: it may cite a document, but it may not claim a page whose extract does not exist, and it can
    // never become a finding — that rule lives in the register, and this verifier simply does not bless it as read.
    return;
  }
  // L-037, mechanised: a quotation marked READ may only stand on a page this bundle extracted from a RETRIEVED
  // document. An unread page, a refused fetch or a truncated file can never be read evidence.
  if (document.status !== 'RETRIEVED') {
    violations.push({
      code: 'QUOTE_FROM_UNRETRIEVED_DOCUMENT',
      path,
      detail: `the quotation is marked ${quotation.evidenceClass} but the document is ${document.status}`,
    });
    return;
  }
  const pageKey = `${quotation.documentId}#${quotation.pdfPageIndex}`;
  const page = pages.get(pageKey);
  if (page === undefined) {
    const extracted = document.pagesExtracted ?? [];
    violations.push({
      code: 'QUOTE_PAGE_NOT_EXTRACTED',
      path,
      detail: `page ${quotation.pdfPageIndex} has no extract in this bundle (extracted: ${extracted.join(', ') || 'none'})`,
    });
    return;
  }
  if (quotation.pageFile !== undefined && quotation.pageFile !== page.file) {
    violations.push({
      code: 'QUOTE_PAGE_FILE_MISMATCH',
      path,
      detail: `the quotation cites "${quotation.pageFile}", the page record says "${page.file}"`,
    });
  }
  if (quotation.printedPages !== undefined && quotation.printedPages !== page.printedPages) {
    violations.push({
      code: 'QUOTE_PRINTED_PAGES_MISMATCH',
      path,
      detail: `the quotation says "${quotation.printedPages}", the page record says "${page.printedPages}"`,
    });
  }
  let text: string;
  try {
    text = options.readExtract(page.file);
  } catch {
    violations.push({ code: 'PAGE_FILE_UNREADABLE', path, detail: `cannot read "${page.file}"` });
    return;
  }
  if (!normalisePageText(text).includes(normalisePageText(quotation.quotedWording))) {
    violations.push({
      code: 'QUOTE_ABSENT_FROM_PAGE',
      path,
      detail: 'the quoted wording is not present in the page extract it is attributed to',
    });
  }
}

/**
 * Verify a retrieval bundle. Pure: same input, same report; performs no writes and reads only the extracts it is handed.
 */
export function verifyRetrievalEvidence(bundle: RetrievalBundle, options: VerificationOptions): RetrievalReport {
  const violations: RetrievalViolation[] = [];
  const documents = new Map<string, RetrievedDocument>();
  for (const document of bundle.documents) {
    if (documents.has(document.id)) {
      violations.push({ code: 'DOCUMENT_DUPLICATED', path: `documents[${document.id}]`, detail: 'document id is not unique' });
    }
    documents.set(document.id, document);
    checkDocument(document, violations);
  }
  const pages = new Map<string, PageEvidence>();
  const calibration = new Map<string, string>();
  for (const page of bundle.pages) {
    checkPage(page, documents, pages, calibration, options, violations);
  }
  // A document may not quietly claim an extract the page map does not hold: the two records describe the same sheets.
  for (const document of bundle.documents) {
    for (const index of document.pagesExtracted ?? []) {
      if (!pages.has(`${document.id}#${index}`)) {
        violations.push({
          code: 'DOCUMENT_PAGE_WITHOUT_RECORD',
          path: `documents[${document.id}].pagesExtracted`,
          detail: `page ${index} is claimed as extracted but the page map holds no record of it`,
        });
      }
    }
  }
  for (const quotation of bundle.quotations) {
    checkQuotation(quotation, documents, pages, options, violations);
  }
  const coverage = bundle.documents.map((document) => ({
    documentId: document.id,
    extracted: (document.pagesExtracted ?? []).length,
    total: typeof document.pagesTotal === 'number' ? document.pagesTotal : 0,
  }));
  return {
    ok: violations.length === 0,
    violations,
    summary: {
      documents: bundle.documents.length,
      retrieved: bundle.documents.filter((document) => document.status === 'RETRIEVED').length,
      pages: bundle.pages.length,
      quotations: bundle.quotations.length,
      quotationsRead: bundle.quotations.filter(
        (quotation) => quotation.evidenceClass === 'READ_IN_THIS_RUN' || quotation.evidenceClass === 'READ_PREVIOUSLY',
      ).length,
      coverage,
    },
  };
}
