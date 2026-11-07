/**
 * `L-039` — the cash side of the enterprise-to-equity bridge, and the evidence that KEC International prints no
 * current-investments caption.
 *
 * The limitation, as the register states it: `cashAndInvestments` is the sum of cash and cash equivalents **and current
 * investments**, and it refuses unless both carry a number or a quoted nil. A consolidated balance sheet is under no
 * obligation to print a current-investments caption, so an issuer can report cash, borrowings, leases *and* current
 * maturities in full and still have no net debt, no enterprise-to-equity conversion, no enterprise-derived per-share
 * value, no `FINANCIAL_LEVERAGE` dimension and no `netDebtToEbitda`.
 *
 * This file holds two different things together:
 *
 *   1. **The evidence.** KEC's consolidated statements print no current-investments caption in FY2024, FY2025 or
 *      FY2026 — the asset block enumerates four current financial-asset captions and investments is not one of them,
 *      Note 10 is headed "Non-current:" only, Note 54's instrument-level classification names exactly one investment
 *      line and it is non-current, and the cash-flow statement shows no investment purchase or sale. So the value is
 *      genuinely absent, `NOT_REPORTED` is the correct observation, and `L-039` stays `OPEN`.
 *   2. **The gate.** The refusal is a property of the *evidence*, not of the code: a dataset that carries the caption —
 *      as a reported number, a reported zero, or a declared nil — closes the bridge and produces a per-share value.
 *
 * Nothing here rounds an absence to zero, and nothing here resolves a limitation by wishing it away.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { assessCompany } from '../../src/investment/assessment/engine';
import type { CompanyAssessmentPayload } from '../../src/investment/assessment/types';
import { nilByDisclosure, present } from '../../src/investment/contracts/observation';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import type { DatasetContent, NormalizedPeriod } from '../../src/investment/fundamentals/types';
import { techAssessmentInput, techDataset } from './assessmentFixtures';

const ROOT = resolve(process.cwd(), '..');
const BUNDLE = join(ROOT, 'evidence', 'real-issuer', 'WI8-L039-CASH-SIDE-2026-11-07');
const WI8 = join(ROOT, 'evidence', 'real-issuer', 'WI8-INDUSTRIALS-KEC-2026-11-07');

const read = (path: string): string => readFileSync(join(BUNDLE, path), 'utf8');
const readJson = (path: string): any => JSON.parse(read(path));
const flat = (text: string): string => text.replace(/[ \t]+/g, ' ').trim();
/** The page's text without this repository's provenance header, so an assertion never matches the header's prose. */
const body = (text: string): string => text.split('\n').filter((line) => !line.startsWith('#')).join('\n');
const sha256 = (data: string | Buffer): string => createHash('sha256').update(data).digest('hex');

const pageMap = readJson('source/page-map.json');
const sourceBytes = readJson('source/source-bytes.json');
const determination = readJson('determination-l039.json');
const readback = readJson('runs/03-readback.json');
const payload = JSON.parse(readFileSync(join(WI8, 'artifact', 'assessment-payload-kec-wi8-l040-corrected.json'), 'utf8'));

const DATASET_VERSION = 'sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab';
const PAYLOAD_DIGEST = 'fc50c53e08814d7851d7b9bb569ddf1eb4eec19ad7508c3c16db9b13a943f370';
const FY26_SHA = 'ba638897313ac1fe5b7da42d7a95dac5f9efec1d1a203f88d9f963622ba3c820';
const FY25_SHA = '29dfdf83bd8e7915500a7fd9447a0782af651cc0f2ea43bd8e05ee9ea46ce1c6';

/** The four captions the consolidated current-asset block actually prints, in printed order. */
const CURRENT_ASSET_CAPTIONS = [
  '(i) Trade receivables',
  '(ii) Cash and cash equivalents',
  '(iii) Bank balances other than (ii) above',
  '(iv) Other financial assets',
];

/* ------------------------------------------------------- the evidence, as text */

describe('L-039 — the filing prints no current-investments caption (evidence, not inference)', () => {
  test('the consolidated balance sheet enumerates four current financial-asset captions, none of them investments', () => {
    const page = flat(body(read('source/fy26-consolidated-balance-sheet-pdf-page117.txt')));
    const start = page.indexOf('(2) Current Assets');
    const end = page.indexOf('(c) Contract assets');
    assert.ok(start > 0 && end > start, 'the current-asset block was not located on the balance-sheet page');
    const block = page.slice(start, end);
    for (const caption of CURRENT_ASSET_CAPTIONS) {
      assert.ok(block.includes(caption), `${caption} is not in the current-asset block`);
    }
    assert.equal(/Investments/i.test(block), false, 'the current-asset block prints an investments caption after all');
    // ...while the NON-current block does print one, which is why the absence above is a finding and not a mis-read.
    const nonCurrent = page.slice(page.indexOf('(1) Non-Current Assets'), start);
    assert.ok(nonCurrent.includes('(i) Investments'), 'the non-current investments caption is missing from the page');
  });

  test('the FY2024-25 report prints the same four captions for FY2025 and FY2024', () => {
    const page = flat(body(read('source/fy25-consolidated-balance-sheet-pdf-page110.txt')));
    const start = page.indexOf('(2) Current Assets');
    const end = page.indexOf('(c) Contract assets');
    assert.ok(start > 0 && end > start);
    const block = page.slice(start, end);
    for (const caption of CURRENT_ASSET_CAPTIONS) {
      assert.ok(block.includes(caption), `${caption} is not in the FY2025/FY2024 current-asset block`);
    }
    assert.equal(/Investments/i.test(block), false, 'FY2025 or FY2024 prints a current-investments caption');
  });

  test('Note 10 is headed "Non-current:" only, and its amount is sub-rounding', () => {
    const page = flat(body(read('source/fy26-notes-09-to-10-intangible-assets-and-investments-pdf-page129.txt')));
    const start = page.indexOf('NOTE 10 - INVESTMENTS');
    assert.ok(start > 0, 'Note 10 is not on the page cited for it');
    const note = page.slice(start);
    assert.ok(note.includes('Non-current:'), 'Note 10 no longer starts with the Non-current heading');
    assert.equal(/Current investments/i.test(page), false, 'the note names current investments');
    assert.ok(note.includes('less than rounding off norms adopted by the Group'), 'the asterisk footnote is missing');
    assert.ok(note.includes('RP Goenka Group of Companies'), 'the only investment in the note is not identified');
  });

  test('Note 18 is bank balances, itemised: earmarked dividend, a 3-to-12-month deposit, and margin money', () => {
    const page = flat(body(read('source/fy26-notes-15-to-18-inventories-cash-and-bank-balances-pdf-page131.txt')));
    assert.ok(page.includes('NOTE 18 - BANK BALANCES OTHER THAN CASH AND CASH EQUIVALENTS'));
    for (const fragment of [
      'Earmarked balances with banks - unpaid dividend accounts',
      'Bank deposit with original maturity of more than 3 months but less than 12',
      'Balances with banks to the extent held as margin money or security against the',
    ]) {
      assert.ok(flat(page).includes(flat(fragment)), `Note 18 no longer itemises: ${fragment}`);
    }
    assert.ok(page.includes('3.06') && page.includes('3.20') && page.includes('94.41'), 'Note 18 amounts are missing');
    assert.ok(page.includes('100.67') && page.includes('110.24'), 'Note 18 does not tie to the balance sheet');
    assert.ok(page.includes('NOTE 17 - CASH AND CASH EQUIVALENTS'), 'Note 17 is not on the page');
    assert.equal(/Current investments/i.test(page), false, 'the cash and bank notes name current investments');
  });

  test('Note 19 is deposits, accrued interest, insurance claims, derivatives and reimbursables', () => {
    const page = flat(body(read('source/fy26-note-19-other-financial-assets-pdf-page132.txt')));
    assert.ok(page.includes('NOTE 19 - OTHER FINANCIAL ASSETS'));
    assert.ok(page.includes('Sundry deposits'));
    assert.ok(page.includes('Interest accrued on fixed deposits'));
    assert.ok(page.includes('Mark to market gain on forward and commodity contracts'));
    assert.equal(/Current investments|mutual fund/i.test(page), false, 'other financial assets contain an investment');
  });

  test('the Ind AS 107 classification names exactly one investment line, and it is non-current', () => {
    const page = flat(body(read('source/fy26-note-54-ind-as-107-financial-instrument-classification-pdf-page145.txt')));
    assert.ok(page.includes('NOTE 54 DISCLOSURE AS PER IND AS 107'));
    assert.ok(page.includes('Non-current investment'), 'the non-current investment line is missing');
    assert.ok(page.includes('Cash and bank balances'), 'the cash and bank balances line is missing');
    // "Non-current investment" contains the two words "current investment"; strip it before testing for a CURRENT line.
    assert.equal(/current investment/i.test(page.replace(/non-current investment/gi, '')), false,
      'a current investment line appears in the classification');
  });

  test('the cash-flow statement has no investment purchase or sale line', () => {
    // The sheet carries the operating and investing columns side by side, so the extracted text interleaves them and
    // no contiguous "investing block" can be sliced out. The assertion is therefore about the page as a whole: it prints
    // the investing captions the Group actually used, and the word "investment" does not occur anywhere on it — while
    // "INVESTING ACTIVITIES" (a section heading, not a caption) does.
    for (const file of [
      'source/fy26-consolidated-cash-flow-operating-and-investing-pdf-page118.txt',
      'source/fy25-consolidated-cash-flow-operating-and-investing-pdf-page111.txt',
    ]) {
      const page = flat(body(read(file))).replace(/\s+/g, ' ');
      assert.ok(page.includes('CASH FLOW FROM INVESTING ACTIVITIES'), `${file} has no investing section`);
      assert.ok(
        page.includes('Capital expenditure on property, plant and equipment and intangible assets') ||
          page.includes('Capital expenditure on property, plant and equipment'),
        `${file} does not print the capital-expenditure caption`,
      );
      assert.ok(page.includes('Bank balances (including non-current) not considered as cash'), `${file} lost the cash reconciliation line`);
      assert.equal(/investments?\b/i.test(page), false, `${file} carries an investment caption`);
    }
  });

  test('the search over all 421 pages is recorded, and explains every "current investment" hit', () => {
    const log = read('source/caption-search-log.txt');
    assert.ok(log.includes(FY26_SHA), 'the log does not name the FY2025-26 bytes');
    assert.ok(log.includes(FY25_SHA), 'the log does not name the FY2024-25 bytes');
    assert.ok(log.includes('215 pages') || log.includes('(215 pages)'), 'the log does not state the page count searched');
    assert.equal(log.includes('ballistic'), false);
    // The only pages the log flags for "current investment" are the Ind AS 107 classification sheets, whose extracts
    // are shipped and show a NON-current investment line and cash and bank balances — i.e. the hit is classified.
    for (const line of log.split('\n')) {
      if (!line.includes('current_investment=')) continue;
      assert.match(line, /^fy2[56] p\d+: /, `unexpected hit line: ${line}`);
      assert.ok(Number(line.match(/current_investment=(\d+)/)![1]) >= 1);
    }
  });

  test('the determination says no mapping was applied and no dataset moved', () => {
    assert.equal(determination.outcome.mappingApplied, false);
    assert.equal(determination.outcome.datasetChanged, false);
    assert.equal(determination.outcome.payloadChanged, false);
    assert.match(String(determination.outcome.limitationStatus), /^OPEN/);
    assert.deepEqual(determination.acceptedMappings, []);
    assert.ok(Array.isArray(determination.rejectedMappings) && determination.rejectedMappings.length >= 4);
    for (const entry of determination.rejectedMappings as any[]) {
      assert.equal(typeof entry.candidate, 'string');
      assert.equal(typeof entry.whyRejected, 'string');
    }
    // every examined caption carries a page a reader can turn to
    for (const entry of determination.captionsExamined as any[]) {
      assert.ok(entry.pdfPage > 0, `${entry.caption} has no PDF page`);
      assert.ok(entry.disposition.length > 10, `${entry.caption} has no disposition`);
    }
    assert.equal(determination.integrity.datasetVersionBefore, DATASET_VERSION);
    assert.equal(determination.integrity.datasetVersionAfter, DATASET_VERSION);
    assert.equal(determination.integrity.payloadDigestBefore, PAYLOAD_DIGEST);
    assert.equal(determination.integrity.payloadDigestAfter, PAYLOAD_DIGEST);
  });

  test('the source bytes are the two reports, by hash and size, with the absent third recorded', () => {
    assert.equal(sourceBytes.documents.fy26.sha256, FY26_SHA);
    assert.equal(sourceBytes.documents.fy26.bytes, 18_566_481);
    assert.equal(sourceBytes.documents.fy26.pages, 215);
    assert.equal(sourceBytes.documents.fy25.sha256, FY25_SHA);
    assert.equal(sourceBytes.documents.fy25.bytes, 14_873_309);
    assert.equal(sourceBytes.documents.fy25.pages, 206);
    assert.equal((sourceBytes.rejectedRoutes as string[]).length, 1);
    assert.match(String(sourceBytes.rejectedRoutes[0]), /KEC_Annual_Report_2023-24\.pdf/);
    assert.match(String(sourceBytes.rejectedRoutes[0]), /404/);
  });
});

/* ---------------------------------------------- the payload, and the zero control */

describe('L-039 — the payload refuses the cash side and publishes no substitute for it', () => {
  const structure = payload.fundamentals.capitalStructure;

  test('gross debt and cash are published; current investments, cash-and-investments and net debt are not', () => {
    assert.equal(structure.grossDebt.presence, 'PRESENT');
    assert.equal(structure.grossDebt.value, 53_777_600_000);
    assert.equal(structure.components.cashAndCashEquivalents.presence, 'PRESENT');
    assert.equal(structure.components.cashAndCashEquivalents.value, 4_112_600_000);
    for (const [name, observation] of [
      ['currentInvestments', structure.components.currentInvestments],
      ['cashAndInvestments', structure.cashAndInvestments],
      ['netDebt', structure.netDebt],
    ] as const) {
      assert.equal(observation.presence, 'MISSING', `${name} is not MISSING`);
      assert.equal(observation.reason, 'NOT_REPORTED', `${name} carries the wrong reason`);
      assert.equal(observation.value, null, `${name} carries a number`);
    }
  });

  test('gross debt minus cash is published nowhere in the payload', () => {
    const numbers: number[] = [];
    const walk = (node: unknown): void => {
      if (typeof node === 'number') numbers.push(node);
      else if (Array.isArray(node)) node.forEach(walk);
      else if (node !== null && typeof node === 'object') Object.values(node).forEach(walk);
    };
    walk(payload);
    const substituted = 53_777_600_000 - 4_112_600_000; // 49,665,000,000 — what a zero for current investments would read
    assert.equal(numbers.includes(substituted), false, 'a zero-substituted net debt is published in the payload');
    assert.equal(readback.zeroSubstitutionControl.grossDebtLessCash, substituted);
    assert.equal(readback.zeroSubstitutionControl.publishedAnywhereInPayload, false);
  });

  test('every output that depends on the bridge stays withheld', () => {
    const methods = Object.fromEntries((payload.valuation.methods as any[]).map((m: any) => [m.methodId, m]));
    assert.equal(payload.valuation.intrinsic, null);
    assert.equal(methods.DCF_FCFF.output.perShareMid.presence, 'NOT_COMPUTABLE');
    assert.match(String(methods.DCF_FCFF.output.perShareMid.note), /blocked by netDebt/);
    assert.equal(methods.EV_EBITDA.applicable, false);
    assert.match(String(methods.EV_EBITDA.notApplicableReason), /CAPITAL_STRUCTURE_INCOMPLETE/);
    assert.equal(methods.EV_REVENUE.applicable, false);
    assert.match(String(methods.EV_REVENUE.notApplicableReason), /MANDATORY_METRIC_MISSING/);
    assert.equal((payload.valuation.sensitivity as any[])[0].withheld.presence, 'NOT_COMPUTABLE');
    assert.equal(payload.valuation.marginOfSafety.refusal, 'NO_PRICE_OBSERVATION');
    assert.equal(payload.dividends.netDebtToEbitda.presence, 'NOT_COMPUTABLE');
    const leverage = (payload.risk.evaluation.dimensions as any[]).find((d) => d.dimensionId === 'FINANCIAL_LEVERAGE');
    assert.equal(leverage.status, 'NOT_EVALUABLE');
    assert.match(String(leverage.statement), /netDebt/);
  });

  test('the re-run reproduced both digests, and the bundle is internally consistent', () => {
    assert.equal(readback.digestMatch, true);
    assert.equal(readback.payloadDigestStored, PAYLOAD_DIGEST);
    assert.equal(readback.payloadDigestRecomputed, `sha256:${PAYLOAD_DIGEST}`);
    assert.equal(readback.payloadBytes, 52_760);
    assert.equal(readback.chainLength, 1);
    const manifest = readJson('digests.json');
    const files = manifest.files as Record<string, { sha256: string; bytes: number }>;
    assert.ok(Object.keys(files).length >= 18, 'the L-039 manifest lost files');
    for (const [file, entry] of Object.entries(files)) {
      const data = readFileSync(join(BUNDLE, file));
      assert.equal(sha256(data), entry.sha256, `${file} digest drift`);
      assert.equal(data.byteLength, entry.bytes, `${file} byte length drift`);
    }
    assert.equal(files['determination-l039.json'] !== undefined, true);
    // The manifest is complete: every shipped file is digested, except the manifest itself and the post-manifest
    // verification run, which cannot be inside the manifest it verifies.
    const shipped: string[] = [];
    const walkDir = (dir: string, prefix: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
        if (entry.isDirectory()) walkDir(join(dir, entry.name), rel);
        else shipped.push(rel);
      }
    };
    walkDir(BUNDLE, '');
    const undigested = shipped.filter((f) => f !== 'digests.json' && !f.startsWith('runs/06-') && files[f] === undefined);
    assert.deepEqual(undigested, [], 'files shipped without a digest');
    // provenance: every shipped page names its source PDF, its bytes and its extractor
    for (const file of Object.keys(pageMap.pages) as string[]) {
      if (file === 'caption-search-log.txt') continue;
      const text = read(join('source', file));
      assert.match(text, /^# [^\n]+\n# What this page is:/, `${file} has no provenance header`);
      assert.ok(text.includes('# source PDF: KEC_Annual_Report_'), `${file} does not name its source PDF`);
      assert.ok(text.includes('pdftotext -layout'), `${file} does not name its extractor`);
      assert.ok(text.includes(FY26_SHA) || text.includes(FY25_SHA), `${file} does not name its source bytes`);
    }
  });
});

/* ------------------------------------- the gate is the evidence, never the code */

type Dataset = DatasetContent;

function withoutItem(item: LineItemId): Dataset {
  const dataset = techDataset();
  return {
    ...dataset,
    periods: dataset.periods.map((period: NormalizedPeriod) => {
      if (!(item in period.values)) return period;
      const values = { ...period.values } as Record<string, unknown>;
      delete values[item];
      return { ...period, values } as NormalizedPeriod;
    }),
  };
}

function withValue(item: LineItemId, value: number): Dataset {
  const dataset = techDataset();
  return {
    ...dataset,
    periods: dataset.periods.map((period: NormalizedPeriod) => {
      const existing = period.values[item];
      if (existing === undefined) return period; // quarterly periods do not carry the balance-sheet item
      return {
        ...period,
        values: {
          ...period.values,
          [item]: present(value, existing.source!, { basis: 'AS_FILED', periodEnd: period.period.periodEnd }),
        } as NormalizedPeriod['values'],
      };
    }),
  };
}

function withDeclaredNil(item: LineItemId, statement: string): Dataset {
  const dataset = techDataset();
  return {
    ...dataset,
    periods: dataset.periods.map((period: NormalizedPeriod) => {
      const existing = period.values[item];
      if (existing === undefined) return period;
      return {
        ...period,
        values: {
          ...period.values,
          [item]: nilByDisclosure(existing.source!, { periodEnd: period.period.periodEnd, statement }),
        } as NormalizedPeriod['values'],
      };
    }),
  };
}

const run = (dataset: Dataset): CompanyAssessmentPayload => assessCompany(techAssessmentInput({ dataset })).payload;

describe('L-039 — reported zero, declared nil and absence are three different things', () => {
  test('the caption absent: the bridge refuses, exactly as it does for KEC', () => {
    const payload = run(withoutItem('CURRENT_INVESTMENTS'));
    const structure = payload.fundamentals.capitalStructure;
    assert.equal(structure.components.currentInvestments.presence, 'MISSING');
    assert.equal(structure.components.currentInvestments.reason, 'NOT_REPORTED');
    assert.equal(structure.cashAndInvestments.presence, 'MISSING');
    assert.equal(structure.netDebt.presence, 'MISSING');
    assert.equal(payload.valuation.intrinsic, null);
    assert.equal(payload.valuation.methods.find((m) => m.methodId === 'DCF_FCFF')!.output!.perShareMid.presence, 'NOT_COMPUTABLE');
  });

  test('a reported current-investments NUMBER closes the bridge and produces a per-share value', () => {
    const baseline = run(techDataset());
    const structure = baseline.fundamentals.capitalStructure;
    assert.equal(structure.components.currentInvestments.presence, 'PRESENT');
    assert.equal(structure.netDebt.presence, 'PRESENT');
    assert.equal(baseline.valuation.methods.find((m) => m.methodId === 'DCF_FCFF')!.output!.perShareMid.presence, 'PRESENT');
  });

  test('a reported ZERO closes it too — a zero is information, an absence is not', () => {
    const payload = run(withValue('CURRENT_INVESTMENTS', 0));
    const structure = payload.fundamentals.capitalStructure;
    assert.equal(structure.components.currentInvestments.presence, 'PRESENT');
    assert.equal(structure.components.currentInvestments.value, 0);
    assert.equal(structure.netDebt.presence, 'PRESENT');
    assert.equal(structure.netDebt.value, structure.grossDebt.value! - structure.components.cashAndCashEquivalents.value!);
    assert.equal(payload.valuation.methods.find((m) => m.methodId === 'DCF_FCFF')!.output!.perShareMid.presence, 'PRESENT');
  });

  test('a DECLARED NIL is recorded with the filer words, and the cash sum does not yet treat it as zero', () => {
    // The debt aggregation contract (`grossDebtOf`) counts a declared nil as zero and names it in a note; the cash
    // aggregation (`sum`) propagates the nil instead. This test pins the behaviour that exists, so that changing it has
    // to be a deliberate, documented decision rather than an accident of some later edit. It is recorded in the
    // determination as the second owner decision that would narrow `L-039`.
    const statement = 'The Group had no current investments as at the year end';
    const payload = run(withDeclaredNil('CURRENT_INVESTMENTS', statement));
    const structure = payload.fundamentals.capitalStructure;
    assert.equal(structure.components.currentInvestments.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(structure.components.currentInvestments.value, null);
    assert.match(String(structure.components.currentInvestments.note), /no current investments/);
    assert.equal(structure.cashAndInvestments.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(structure.netDebt.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(structure.netDebt.value, null, 'a declared nil produced a net-debt number');
  });
});
