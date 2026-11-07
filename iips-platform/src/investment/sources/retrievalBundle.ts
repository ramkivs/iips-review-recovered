/**
 * Reading a retrieval bundle off disk, in the shape the evidence bundles already use (`L-037`).
 *
 * The WI-6A-S2 bundle settled the format by being the first to produce it: `source/source-bytes.json` (what was
 * fetched, how large, which sha256, how many pages), `source/page-map.json` (which PDF page each extract came from,
 * which printed pages that sheet carries), `source/quotes-verified.json` (the wording, its digest, and the page it was
 * read from), and one text file per extracted page carrying its own provenance header.
 *
 * This reader maps those records onto the verifier's contract without changing them. It deliberately does not invent
 * anything a record does not say: a document whose record carries no digit hash is not "retrieved", a page that is not
 * in the page map is not "extracted", and a quotation that is not marked as read is not read.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  type PageEvidence,
  type QuotationEvidenceClass,
  type RetrievalBundle,
  type RetrievalQuotation,
  type RetrievalStatus,
  type RetrievedDocument,
} from './retrievalEvidence';

interface SourceBytesFile {
  readonly documents?: readonly Record<string, any>[];
}
interface PageMapFile {
  readonly entries?: readonly Record<string, any>[];
}
interface QuotesFile {
  readonly quotations?: readonly Record<string, any>[];
}

const statusOf = (document: Record<string, any>): RetrievalStatus => {
  const declared = typeof document.status === 'string' ? document.status : undefined;
  if (declared !== undefined) return declared as RetrievalStatus;
  // The WI-6A-S2 records carry no explicit status: a 200 with bytes and a digest is a retrieval, and anything else is
  // a refusal by the host that answered.
  if (document.httpStatus === 200 && typeof document.sha256 === 'string' && typeof document.bytes === 'number') {
    return 'RETRIEVED';
  }
  return typeof document.httpStatus === 'number' ? 'REFUSED_BY_HOST' : 'NO_ROUTE';
};

const evidenceClassOf = (quotation: Record<string, any>): QuotationEvidenceClass => {
  if (typeof quotation.evidenceClass === 'string') {
    if (quotation.evidenceClass === 'READ_IN_THIS_RUN') return 'READ_IN_THIS_RUN';
    if (quotation.evidenceClass === 'READ_PREVIOUSLY') return 'READ_PREVIOUSLY';
  }
  return quotation.readByThisRun === true ? 'READ_IN_THIS_RUN' : 'REPORTED_NOT_READ';
};

export interface LoadedRetrievalBundle {
  readonly bundle: RetrievalBundle;
  readonly readExtract: (file: string) => string;
}

/** Read `<dir>/source/{source-bytes,page-map,quotes-verified}.json` into the verifier's contract. */
export function readRetrievalBundle(dir: string): LoadedRetrievalBundle {
  const source = (name: string) => JSON.parse(readFileSync(join(dir, 'source', name), 'utf8')) as Record<string, any>;
  const sourceBytes = source('source-bytes.json') as SourceBytesFile;
  const pageMap = source('page-map.json') as PageMapFile;
  const quotes = source('quotes-verified.json') as QuotesFile;

  const entries = pageMap.entries ?? [];
  const documents: RetrievedDocument[] = (sourceBytes.documents ?? []).map((document) => {
    const pagesExtracted = entries
      .filter((entry) => entry.document === document.document)
      .map((entry) => Number(entry.pdfPageIndex))
      .filter((index) => Number.isInteger(index));
    return {
      id: String(document.id),
      document: String(document.document),
      url: String(document.url),
      status: statusOf(document),
      httpStatus: typeof document.httpStatus === 'number' ? document.httpStatus : null,
      bytes: typeof document.bytes === 'number' ? document.bytes : null,
      sha256: typeof document.sha256 === 'string' ? document.sha256 : null,
      pagesTotal: typeof document.pdfinfo?.Pages === 'number' ? document.pdfinfo.Pages : null,
      pagesExtracted,
      // A record may declare a complete read; the verifier checks the claim rather than believing it.
      completeness: document.completeness === 'COMPLETE' ? 'COMPLETE' : 'TARGETED',
      route: typeof document.host === 'string' ? document.host : undefined,
    };
  });

  const idByTitle = new Map(documents.map((document) => [document.document, document.id]));
  const pages: PageEvidence[] = entries.map((entry) => ({
    documentId: idByTitle.get(String(entry.document)) ?? `unknown:${String(entry.document)}`,
    pdfPageIndex: Number(entry.pdfPageIndex),
    printedPages: String(entry.printedPages),
    file: String(entry.file),
  }));

  const quotations: RetrievalQuotation[] = (quotes.quotations ?? []).map((quotation) => ({
    id: String(quotation.id),
    documentId: idByTitle.get(String(quotation.document)) ?? `unknown:${String(quotation.document)}`,
    evidenceClass: evidenceClassOf(quotation),
    quotedWording: String(quotation.quotedWording),
    quotedWordingSha256: String(quotation.quotedWordingSha256),
    pdfPageIndex: Number(quotation.pdfPageIndex),
    printedPages: typeof quotation.printedPages === 'string' ? quotation.printedPages : undefined,
    pageFile: typeof quotation.pageFile === 'string' ? quotation.pageFile : undefined,
  }));

  return {
    bundle: { documents, pages, quotations },
    readExtract: (file: string) => readFileSync(join(dir, file), 'utf8'),
  };
}
