/**
 * L-037 — the retrieval-evidence contract: a deep-page read has to prove itself, and a failed fetch has to stay a
 * failure.
 *
 * `L-037` records that every in-process reader stops at a printed-page cap, so wording beyond the cap is unread — and
 * that unread wording is not evidence of absence. WI-6A-S2 then read both reports end to end from outside the process,
 * which proved the bytes are reachable but left the capability bespoke: each bundle carried its own guard, so a new
 * bundle could cite an unextracted page, quote a refused fetch, renumber a printed page, or claim a complete read of
 * three pages, and nothing would notice.
 *
 * These tests exercise the reusable contract on the real WI-6A-S2 bundle and on deliberately damaged copies of it. The
 * poisoned copies are made in a temporary directory; the committed bundle is never modified.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { readRetrievalBundle } from '../../src/investment/sources/retrievalBundle';
import {
  normalisePageText,
  parseProvenanceHeader,
  verifyRetrievalEvidence,
} from '../../src/investment/sources/retrievalEvidence';
import { run as runCli } from '../../src/investment/cli/verify-retrieval-evidence';

const BUNDLE = resolve(
  process.cwd(),
  '..',
  'evidence',
  'real-issuer',
  'WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07',
);
const NOTE27_FY24 = 'source/fy24-consolidated-note-27-capital-management.txt';

interface Change {
  sourceBytes?: (file: Record<string, any>) => void;
  pageMap?: (file: Record<string, any>) => void;
  quotes?: (file: Record<string, any>) => void;
  /** Rewrite an extract; return the text unchanged to leave it alone. */
  extract?: (file: string, text: string) => string;
}

/** Copy the real bundle, mutate one record, and hand back the verifier's verdict. */
function mutate(change: Change): { codes: string[]; ok: boolean; quotationsRead: number } {
  const dir = mkdtempSync(join(tmpdir(), 'l037-'));
  try {
    cpSync(BUNDLE, dir, { recursive: true });
    const edit = (name: string, apply?: (file: Record<string, any>) => void) => {
      if (apply === undefined) return;
      const path = join(dir, 'source', name);
      const file = JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>;
      apply(file);
      writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`);
    };
    edit('source-bytes.json', change.sourceBytes);
    edit('page-map.json', change.pageMap);
    edit('quotes-verified.json', change.quotes);
    if (change.extract !== undefined) {
      const pageMap = JSON.parse(readFileSync(join(dir, 'source', 'page-map.json'), 'utf8')) as {
        entries: { file: string }[];
      };
      for (const entry of pageMap.entries) {
        const path = join(dir, entry.file);
        writeFileSync(path, change.extract(entry.file, readFileSync(path, 'utf8')));
      }
    }
    const loaded = readRetrievalBundle(dir);
    const report = verifyRetrievalEvidence(loaded.bundle, { readExtract: loaded.readExtract });
    return {
      codes: report.violations.map((violation) => violation.code),
      ok: report.ok,
      quotationsRead: report.summary.quotationsRead,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('L-037 retrieval evidence — the real bundle verifies', () => {
  const loaded = readRetrievalBundle(BUNDLE);
  const report = verifyRetrievalEvidence(loaded.bundle, { readExtract: loaded.readExtract });

  test('WI-6A-S2 passes the reusable contract unchanged', () => {
    assert.deepEqual(report.violations, []);
    assert.equal(report.ok, true);
  });

  test('both reports are RETRIEVED with bytes and digests, and the extract list is the page map', () => {
    assert.equal(report.summary.documents, 2);
    assert.equal(report.summary.retrieved, 2);
    for (const document of loaded.bundle.documents) {
      assert.equal(document.status, 'RETRIEVED');
      assert.match(String(document.sha256), /^[0-9a-f]{64}$/);
      assert.ok((document.bytes ?? 0) > 1_000_000);
      assert.deepEqual(
        document.pagesExtracted,
        loaded.bundle.pages.filter((page) => page.documentId === document.id).map((page) => page.pdfPageIndex),
      );
    }
    assert.equal(report.summary.pages, 11);
    assert.equal(report.summary.quotations, 2);
    assert.equal(report.summary.quotationsRead, 2);
  });

  test('the coverage is reported honestly — 11 extracted pages of 347, not "all"', () => {
    const coverage = report.summary.coverage;
    assert.equal(coverage.length, 2);
    assert.equal(
      coverage.reduce((sum, entry) => sum + entry.extracted, 0),
      11,
    );
    assert.equal(
      coverage.reduce((sum, entry) => sum + entry.total, 0),
      347,
    );
  });
});

describe('L-037 retrieval evidence — a quote cannot stand on a page that was not read', () => {
  test('a quotation on a document whose fetch was refused is refused', () => {
    const { codes, ok } = mutate({
      sourceBytes: (file) => {
        file.documents[0].httpStatus = 403;
        file.documents[0].sha256 = null;
        file.documents[0].bytes = null;
      },
    });
    assert.equal(ok, false);
    assert.ok(codes.includes('QUOTE_FROM_UNRETRIEVED_DOCUMENT'));
  });

  test('a quotation on a page the bundle never extracted is refused', () => {
    const { codes } = mutate({
      pageMap: (file) => {
        file.entries = file.entries.filter((entry: any) => entry.pdfPageIndex !== 154);
      },
      quotes: (file) => {
        file.quotations = file.quotations.filter((quotation: any) => quotation.pdfPageIndex !== 154);
      },
    });
    assert.ok(codes.includes('DOCUMENT_PAGE_WITHOUT_RECORD') === false);
    const second = mutate({
      pageMap: (file) => {
        file.entries = file.entries.filter((entry: any) => entry.pdfPageIndex !== 154);
      },
    });
    assert.ok(second.codes.includes('QUOTE_PAGE_NOT_EXTRACTED'));
  });

  test('a quotation marked REPORTED_NOT_READ is accepted but is never counted as read', () => {
    const { ok, quotationsRead, codes } = mutate({
      quotes: (file) => {
        file.quotations[0].evidenceClass = 'REPORTED_NOT_READ';
        delete file.quotations[0].readByThisRun;
      },
    });
    assert.equal(ok, true);
    assert.deepEqual(codes, []);
    assert.equal(quotationsRead, 1);
  });
});

describe('L-037 retrieval evidence — provenance cannot drift', () => {
  test('an extract whose header names another document is refused', () => {
    const { codes } = mutate({
      extract: (file, text) =>
        file === NOTE27_FY24
          ? text.replace(
              /^# Zensar .*$/m,
              '# Zensar Technologies Limited — Integrated Annual Report 2022-23',
            )
          : text,
    });
    assert.ok(codes.includes('HEADER_DOCUMENT_MISMATCH'));
  });

  test('a printed page number renumbered in the record is refused', () => {
    const { codes } = mutate({
      pageMap: (file) => {
        file.entries[0].printedPages = '999-1000';
      },
    });
    assert.ok(codes.includes('HEADER_PRINTED_PAGES_MISMATCH'));
  });

  test('a PDF page index renumbered in the record is refused', () => {
    const { codes } = mutate({
      pageMap: (file) => {
        file.entries[0].pdfPageIndex = 154 + 1;
      },
    });
    assert.ok(codes.includes('HEADER_PAGE_INDEX_MISMATCH'));
  });

  test('a quotation whose recorded digest does not match its wording is refused', () => {
    const { codes } = mutate({
      quotes: (file) => {
        file.quotations[0].quotedWordingSha256 = 'f'.repeat(64);
      },
    });
    assert.ok(codes.includes('QUOTE_DIGEST_MISMATCH'));
  });

  test('a quotation whose wording is not in the extract it cites is refused', () => {
    const { codes } = mutate({
      extract: (file, text) =>
        file === NOTE27_FY24 ? text.replace(/external borrowings/gi, 'external funding') : text,
    });
    assert.ok(codes.includes('QUOTE_ABSENT_FROM_PAGE'));
  });

  test('the same printed page cannot be mapped to two different PDF sheets', () => {
    const { codes } = mutate({
      pageMap: (file) => {
        file.entries[1].printedPages = '304-305';
      },
    });
    assert.ok(codes.includes('CALIBRATION_DUPLICATE'));
  });

  test('an extract that has lost its provenance header cannot be tied to anything', () => {
    const { codes } = mutate({
      extract: (file, text) => (file === NOTE27_FY24 ? text.replace(/^# Source bytes:.*$/m, '') : text),
    });
    assert.ok(codes.includes('HEADER_MALFORMED'));
  });
});

describe('L-037 retrieval evidence — a read cannot be overstated', () => {
  test('a document cannot claim a complete read while pages are missing', () => {
    const loaded = readRetrievalBundle(BUNDLE);
    const broken = {
      ...loaded.bundle,
      documents: loaded.bundle.documents.map((document) => ({ ...document, completeness: 'COMPLETE' as const })),
    };
    const report = verifyRetrievalEvidence(broken, { readExtract: loaded.readExtract });
    assert.ok(report.violations.some((violation) => violation.code === 'COMPLETE_READ_UNSUPPORTED'));
  });

  test('a document cannot claim an extracted page the page map does not hold', () => {
    const loaded = readRetrievalBundle(BUNDLE);
    const broken = {
      ...loaded.bundle,
      documents: loaded.bundle.documents.map((document, index) =>
        index === 0 ? { ...document, pagesExtracted: [...document.pagesExtracted, 92] } : document,
      ),
    };
    const report = verifyRetrievalEvidence(broken, { readExtract: loaded.readExtract });
    assert.ok(report.violations.some((violation) => violation.code === 'DOCUMENT_PAGE_WITHOUT_RECORD'));
  });

  test('a bundle of failed retrievals reports zero retrieved — never empty evidence', () => {
    const loaded = readRetrievalBundle(BUNDLE);
    const failed = {
      documents: loaded.bundle.documents.map((document) => ({
        ...document,
        status: 'REFUSED_BY_HOST' as const,
        bytes: null,
        sha256: null,
        pagesExtracted: [],
      })),
      pages: [],
      quotations: [],
    };
    const report = verifyRetrievalEvidence(failed, { readExtract: loaded.readExtract });
    assert.deepEqual(report.violations, []);
    assert.equal(report.summary.retrieved, 0);
    assert.equal(report.summary.quotationsRead, 0);
    assert.equal(report.summary.pages, 0);
    // Nothing is manufactured from the failure: no coverage, no nil, no zero.
    assert.deepEqual(
      report.summary.coverage.map((entry) => entry.extracted),
      [0, 0],
    );
  });

  test('an extract cannot exist for a document whose fetch was refused', () => {
    const { codes } = mutate({
      sourceBytes: (file) => {
        file.documents[1].httpStatus = 429;
        file.documents[1].sha256 = null;
        file.documents[1].bytes = null;
      },
    });
    assert.ok(codes.includes('PAGE_WITHOUT_RETRIEVAL'));
    // The refusal itself is a recorded outcome, not a defect: nothing claims bytes for it.
    assert.equal(codes.includes('DOCUMENT_BYTES_MISSING'), false);
    assert.equal(codes.includes('DOCUMENT_DIGEST_MISSING'), false);
  });
});

describe('L-037 retrieval evidence — header parsing and normalisation', () => {
  test('the S2 header parses to a document, a page index, a page count and a printed locator', () => {
    const header = parseProvenanceHeader(readFileSync(join(BUNDLE, NOTE27_FY24), 'utf8'));
    assert.equal(header.documentTitle, 'Zensar Technologies Limited — Integrated Annual Report 2023-24');
    assert.equal(header.pdfPageIndex, 154);
    assert.equal(header.pdfPages, 167);
    assert.equal(header.printedPages, '304-305');
    assert.equal(header.sourceBytes, 10813579);
    assert.equal(header.sourceSha256, 'd52cc3af3b074f5b288d7f887cca0887a046e7f2b04abebfb4ab1fd45035990d');
  });

  test('a header with no digest is not a header', () => {
    const text = readFileSync(join(BUNDLE, NOTE27_FY24), 'utf8');
    assert.throws(() => parseProvenanceHeader(text.replace(/^# Source bytes:.*$/m, '')), /provenance header is missing/);
  });

  test('normalisation folds the layout spacing a two-up sheet introduces, and nothing else', () => {
    assert.equal(normalisePageText('a  b\tc\nlong  dash'), 'a b c long dash');
    assert.equal(normalisePageText('Consolidated  Note 27'), 'Consolidated Note 27');
  });
});

describe('L-037 retrieval evidence — the CLI gate', () => {
  test('passes on the real bundle and refuses a damaged copy', () => {
    assert.equal(runCli([BUNDLE]), 0);
    const dir = mkdtempSync(join(tmpdir(), 'l037-cli-'));
    try {
      cpSync(BUNDLE, dir, { recursive: true });
      const path = join(dir, 'source', 'quotes-verified.json');
      const file = JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>;
      file.quotations[0].quotedWordingSha256 = 'f'.repeat(64);
      writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`);
      assert.equal(runCli([dir]), 1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('a missing directory is an unusable bundle, not a pass', () => {
    assert.equal(runCli([join(tmpdir(), 'l037-does-not-exist')]), 2);
  });
});

/**
 * The WI-10 bundle itself: it must stay verifiable, its control must stay refused, and it must not talk the register
 * into a status the evidence does not support.
 */
describe('L-037 — the WI-10 bundle and the register agree', () => {
  const WI10 = resolve(process.cwd(), '..', 'evidence', 'real-issuer', 'WI10-L037-DEEP-PAGE-RETRIEVAL-2026-11-07');
  const REGISTER = resolve(
    process.cwd(),
    '..',
    'docs',
    'integration',
    'IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md',
  );

  test('the negative control is refused, and says so in its own run record', () => {
    assert.equal(runCli([join(WI10, 'control', 'fabricated-claim')]), 1);
    const record = readFileSync(join(WI10, 'runs', '02-control-verdict.txt'), 'utf8');
    assert.match(record, /exit=1/);
    for (const code of [
      'COMPLETE_READ_UNSUPPORTED',
      'QUOTE_PAGE_NOT_EXTRACTED',
      'QUOTE_FROM_UNRETRIEVED_DOCUMENT',
      'PAGE_WITHOUT_RETRIEVAL',
    ]) {
      assert.match(record, new RegExp(code), `the control verdict must name ${code}`);
    }
  });

  test('the bundle determination says PARTIALLY RESOLVED and keeps the external items open', () => {
    const determination = JSON.parse(readFileSync(join(WI10, 'determination.json'), 'utf8')) as Record<string, any>;
    assert.equal(determination.determination.status, 'PARTIALLY_RESOLVED');
    const byId = new Map<string, Record<string, any>>(
      determination.residualItems.map((item: Record<string, any>) => [item.id, item]),
    );
    assert.equal(byId.get('R-037-04')?.status, 'RESOLVED');
    assert.equal(byId.get('R-037-06')?.status, 'RESOLVED');
    assert.equal(byId.get('R-037-08')?.status, 'RESOLVED');
    assert.match(String(byId.get('R-037-01')?.status), /OPEN/);
    assert.match(String(byId.get('R-037-02')?.status), /OPEN/);
    assert.match(String(byId.get('R-037-03')?.status), /OPEN/);
    assert.match(String(byId.get('R-037-07')?.status), /OPEN/);
    assert.equal(byId.get('R-037-05')?.status, 'PARTIALLY_RESOLVED');
  });

  test('no probe in the access record is read as an absence', () => {
    const access = JSON.parse(readFileSync(join(WI10, 'access', 'attempts.json'), 'utf8')) as Record<string, any>;
    assert.ok(access.attempts.length >= 5);
    for (const attempt of access.attempts) {
      if (attempt.curlExitCode === 0) continue;
      assert.equal(attempt.interpretation, 'NO_ROUTE');
      assert.equal(attempt.httpCode, '000');
    }
    assert.ok(access.notClaimed.some((line: string) => /no disclosure|carry no disclosure/i.test(line)));
  });

  test('the register records L-037 as PARTIALLY RESOLVED and leaves the other statuses alone', () => {
    const register = readFileSync(REGISTER, 'utf8');
    assert.match(register, /## 17\.21 WI-10 — `L-037`/);
    assert.match(register, /\*\*Status: `L-037` → `PARTIALLY RESOLVED`\.\*\*/);
    assert.match(register, /absence of wording beyond the retrieval cap is not evidence of absence/);
    for (const status of ['`L-038` **`OPEN`**', '`L-036` remains **`PARTIALLY RESOLVED`**']) {
      assert.ok(register.includes(status), `the register must still say ${status}`);
    }
  });

  test('the bundle manifest re-hashes clean, excluding itself and the clean-clone run it cannot cover', () => {
    const manifest = JSON.parse(readFileSync(join(WI10, 'digests.json'), 'utf8')) as {
      note: string;
      files: { path: string; bytes: number; sha256: string }[];
    };
    assert.match(manifest.note, /excludes/i);
    assert.ok(manifest.files.length >= 5);
    for (const file of manifest.files) {
      assert.notEqual(file.path, 'digests.json');
      const bytes = readFileSync(join(WI10, file.path));
      assert.equal(bytes.length, file.bytes, `${file.path} byte length`);
      assert.equal(createDigest(bytes), file.sha256, `${file.path} sha256`);
    }
  });
});

function createDigest(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}
