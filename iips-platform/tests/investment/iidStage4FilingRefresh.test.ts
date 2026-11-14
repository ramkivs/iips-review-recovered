/**
 * IID Stage 4 — S4-R3 additive filing refresh.
 *
 * This suite holds the candidate refresh to the design record
 * `IID-STAGE4-S4-R3-REFRESH-DESIGN-2026-11-14.md`:
 *
 *   1. the new Marico/KEC figures come from committed verbatim extracts or the committed XBRL instance;
 *   2. historical rosters and parsed historical periods are unchanged, and the historical host digest still builds;
 *   3. the real CLI builds one candidate dataset with 11 annual + 2 quarterly periods and zero issues;
 *   4. the coverage read path counts the contract token `QUARTER` (the S4-R3 read-path regression);
 *   5. the real assessment code still measures freshness from the latest ANNUAL period, so staleness is not lifted;
 *   6. unsupported KEC fields remain NOT_REPORTED, including the L-039 machine zero and the half-year cash flow.
 *
 * No assessment artefact is minted or persisted. The candidate is built in a temporary root only.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { run as ingest } from '../../src/investment/cli/ingest';
import { run as provision } from '../../src/investment/cli/provision-identity';
import { readDataset } from '../../src/investment/ingestion/writer';
import { loadInputBundle } from '../../src/investment/cli/ingest';
import { assertMergeableInputBundles } from '../../src/investment/ingestion/multiInput';
import { parsePeriodCsv } from '../../src/investment/ingestion/builder';
import { deriveLineItems } from '../../src/investment/fundamentals/derive';
import { loadIdentitySourcesFromDir } from '../../src/investment/identity/sources';
import { assessCompany } from '../../src/investment/assessment/engine';
import { selectSeries, periodObservation } from '../../src/investment/assessment/periods';
import { buildInvestmentCoverageReport } from '../../src/investment/coverage/investmentCoverage';
import {
  handleInvestmentCoverageRequest,
  INVESTMENT_COVERAGE_ROUTES,
} from '../../src/investment/coverage/investmentCoverageEndpoint';
import type { SectorName } from '../../src/investment/contracts/operatingMetrics';
import type { NormalizedPeriod } from '../../src/investment/fundamentals/types';
import type { IdentitySources } from '../../src/investment/identity/types';

const ROOT = join(__dirname, '..', '..', '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const BUNDLE = join(EVIDENCE, 'S4-R3-FILING-REFRESH-2026-11-14');
const WI7 = join(EVIDENCE, 'WI7-CONSUMER-MARICO-2026-11-07');
const WI8 = join(EVIDENCE, 'WI8-INDUSTRIALS-KEC-2026-11-07');
const REL1 = join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06');
const L038 = join(EVIDENCE, 'WI12-L038-PREFERENCE-CAPITAL-2026-11-08');
const L039 = join(EVIDENCE, 'WI12-L039-CURRENT-INVESTMENTS-2026-11-05');

const AS_OF = '2026-11-14';
const NOW = `${AS_OF}T00:00:00.000Z`;
const INFOSYS = 'IN:CIN:L85110KA1981PLC013115';
const MARICO = 'IN:CIN:L15140MH1988PLC049208';
const KEC = 'IN:CIN:L45200MH2005PLC152061';
const HOST_DATASET_VERSION = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83';
const CANDIDATE_DATASET_VERSION = 'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b';

const CANDIDATE_INPUTS = [
  join(REL1, 'ingest-input'),
  join(BUNDLE, 'ingest-input', 'marico'),
  join(BUNDLE, 'ingest-input', 'kec'),
];
const ADMITTED_INPUTS = [
  join(REL1, 'ingest-input'),
  join(WI7, 'ingest-input'),
  join(WI8, 'ingest-input'),
];
const ADMITTED_IDENTITY = [
  join(REL1, 'identity'),
  join(WI7, 'ingest-input', 'identity'),
  join(WI8, 'ingest-input', 'identity'),
];

const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();
const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>;
const pageMap = readJson(join(BUNDLE, 'source', 'page-map.json'));
const extraction = readJson(join(BUNDLE, 'data-extraction.json'));
const selection = readJson(join(BUNDLE, 'source-selection.json'));
const xbrlFacts = readJson(join(BUNDLE, 'source', 'kec-q2-fy27-selected-xbrl-facts.json'));

function csvRows(path: string): Record<string, string>[] {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).filter((line) => line.trim() !== '');
  const header = lines[0]!.split(',');
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row: Record<string, string> = {};
    header.forEach((name, index) => { row[name.trim()] = (cells[index] ?? '').trim(); });
    return row;
  });
}

function parsedPeriods(path: string): NormalizedPeriod[] {
  return parsePeriodCsv({ name: path.split('/').pop()!, text: readFileSync(path, 'utf8') }).periods;
}

let dataRoot = '';
let installed: ReturnType<typeof readDataset> | null = null;
let published: IdentitySources | null = null;
let assessments: ReturnType<typeof assessCompany>[] = [];

function coverageReport(asOf = AS_OF) {
  assert.ok(installed !== null);
  return buildInvestmentCoverageReport({
    asOf,
    generatedAt: NOW,
    manifest: installed.manifest,
    issuers: installed.content.issuers,
    securities: installed.content.securities,
    periods: installed.content.periods,
    prices: installed.content.prices,
    operatingMetrics: installed.content.operatingMetrics,
    issues: installed.content.issues,
    identitySourcesAvailable: true,
    identitySourceDetail: null,
  });
}

function payloadFor(issuerId: string) {
  const found = assessments.find((entry) => entry.payload.subject.issuerId === issuerId);
  assert.ok(found, `assessment for ${issuerId}`);
  return found.payload;
}

before(() => {
  dataRoot = mkdtempSync(join(tmpdir(), 'iid-s4-r3-refresh-'));
  const ingestCode = ingest([
    ...CANDIDATE_INPUTS.flatMap((dir) => ['--input', dir]),
    '--dataset-dir', join(dataRoot, 'investment', 'dataset'),
    '--now', NOW,
  ]);
  assert.equal(ingestCode, 0, 'the candidate must ingest through the real CLI');
  const provisionCode = provision([
    ...ADMITTED_IDENTITY.flatMap((dir) => ['--source', dir]),
    '--data-root', dataRoot,
    '--execute',
  ]);
  assert.equal(provisionCode, 0, 'the admitted identity set must publish into the temporary root');
  installed = readDataset(join(dataRoot, 'investment', 'dataset'));
  const identity = loadIdentitySourcesFromDir(join(dataRoot, 'investment', 'identity'));
  assert.equal(identity.available, true);
  if (identity.available) published = identity.sources;
  assessments = installed.content.issuers.map((issuer) => {
    const security = installed!.content.securities.find((entry) => entry.issuerId === issuer.issuerId)!;
    return assessCompany({
      issuerId: issuer.issuerId,
      legalName: issuer.legalName,
      sector: issuer.sector as SectorName,
      sectorSubsegment: issuer.subSegment,
      securityId: security.securityId,
      dataset: installed!.content,
      datasetVersion: installed!.manifest.datasetVersion,
      contentDigest: installed!.manifest.contentDigest,
      provider: installed!.manifest.provider,
      identity: {
        bindingRef: `identity:${issuer.issuerId}`,
        rosterVersion: String(published!.versions.rosterVersion),
        listingMapVersion: String(published!.versions.listingMapVersion),
        corporateActionTableVersion: String(published!.versions.corporateActionTableVersion),
      },
      generatedAt: NOW,
      knownAsOf: AS_OF,
    });
  });
});

after(() => {
  if (dataRoot !== '') rmSync(dataRoot, { recursive: true, force: true });
});

describe('S4-R3 — committed source excerpts and selected XBRL facts', () => {
  it('every page excerpt is digested and is a verbatim block of its committed origin report', () => {
    for (const entry of Object.values(pageMap) as Record<string, any>[]) {
      const text = readFileSync(join(BUNDLE, entry.file), 'utf8');
      assert.equal(sha256(text), entry.sha256, `${entry.file} digest drift`);
      assert.equal(Buffer.byteLength(text), entry.bytes);
      const origin = readFileSync(join(ROOT, entry.originReport), 'utf8');
      assert.equal(sha256(origin), entry.originReportSha256);
      const start = origin.indexOf(entry.beginMarker) + entry.beginMarker.length;
      const stop = origin.indexOf(entry.endMarker, start);
      assert.ok(start >= entry.beginMarker.length && stop > start, `${entry.file} origin block missing`);
      const body = origin.slice(start, stop);
      assert.ok(text.endsWith(body), `${entry.file} is not the verbatim origin block`);
      assert.ok(text.includes(entry.originReportSha256), `${entry.file} does not name its origin digest`);
    }
  });

  it('every populated new CSV cell has a printed form or XBRL fact that verifies against the committed source', () => {
    const pageTexts = new Map<string, string>();
    for (const [key, entry] of Object.entries(pageMap) as [string, Record<string, any>][]) {
      pageTexts.set(key, flat(readFileSync(join(BUNDLE, entry.file), 'utf8')));
    }
    const factIndex = new Map<string, string>(
      (xbrlFacts.facts as Record<string, any>[]).map((fact) => [`${fact.contextRef}/${fact.name}`, fact.value]),
    );
    let checked = 0;
    for (const issuer of [extraction.marico, extraction.kec]) {
      for (const period of Object.values(issuer.periods) as Record<string, any>[]) {
        for (const [lineItem, entry] of Object.entries(period.items) as [string, Record<string, any>][]) {
          const locator = String(entry.locator);
          if (locator.startsWith('kec-q2-xbrl#')) {
            const key = locator.slice('kec-q2-xbrl#'.length);
            const raw = factIndex.get(key);
            assert.ok(raw !== undefined, `${lineItem}: missing XBRL fact ${key}`);
            const tag = key.split('/')[1]!;
            const expected = tag.startsWith('BasicEarnings') || tag.startsWith('DilutedEarnings')
              ? Number(raw)
              : Number(raw) / 10_000_000;
            assert.equal(Number(entry.value), expected, `${lineItem}: crore conversion from ${key}`);
          } else {
            const haystack = flat(locator.split('+').map((part) => pageTexts.get(part.split('#', 1)[0]!) ?? '').join(' '));
            const forms = Array.isArray(entry.printed) ? entry.printed : [entry.printed];
            for (const form of forms) assert.ok(haystack.includes(flat(String(form))), `${lineItem}: printed form absent: ${form}`);
          }
          checked += 1;
        }
      }
    }
    assert.ok(checked >= 90, `expected the full new transcription to be checked, saw ${checked}`);
  });

  it('the September XBRL raw bytes and contexts are the committed ones, and the refused zero stays raw evidence only', () => {
    const compressed = readFileSync(join(ROOT, xbrlFacts.source));
    assert.equal(sha256(compressed), xbrlFacts.compressedSha256);
    assert.equal(compressed.length, xbrlFacts.compressedBytes);
    const contexts = Object.fromEntries((xbrlFacts.contexts as Record<string, any>[]).map((ctx) => [ctx.id, ctx]));
    assert.deepEqual(contexts.OneD, { id: 'OneD', startDate: '2026-07-01', endDate: '2026-09-30', instant: null });
    assert.deepEqual(contexts.OneI, { id: 'OneI', startDate: null, endDate: null, instant: '2026-09-30' });
    assert.deepEqual(contexts.FourD, { id: 'FourD', startDate: '2026-04-01', endDate: '2026-09-30', instant: null });
    const zero = (xbrlFacts.facts as Record<string, any>[]).find((fact) => fact.name === 'CurrentInvestments' && fact.contextRef === 'OneI');
    assert.ok(zero);
    assert.equal(zero.value, '0');
    assert.ok(extraction.kec.periods['2026-09-30'].notReported.CURRENT_INVESTMENTS.includes('L-039'));
    assert.equal(extraction.kec.periods['2026-09-30'].items.CURRENT_INVESTMENTS, undefined);
  });

  it('Infosys is recorded as open with no committed newer source, not silently refreshed', () => {
    assert.equal(selection.infosys.status, 'OPEN_NO_COMMITTED_NEWER_SOURCE');
    assert.equal(selection.infosys.newestCommittedPeriodEnd, '2024-03-31');
    assert.equal(selection.historicalBundlesModified, false);
    assert.equal(selection.network, 'NONE');
  });
});

describe('S4-R3 — historical preservation and the candidate input shape', () => {
  it('the refreshed rosters are byte-for-byte copies of the admitted rosters', () => {
    assert.deepEqual(
      readFileSync(join(BUNDLE, 'ingest-input', 'marico', 'roster.json')),
      readFileSync(join(WI7, 'ingest-input', 'roster.json')),
    );
    assert.deepEqual(
      readFileSync(join(BUNDLE, 'ingest-input', 'kec', 'roster.json')),
      readFileSync(join(WI8, 'ingest-input', 'roster.json')),
    );
  });

  it('the admitted historical periods parse identically inside the refreshed CSVs', () => {
    const maricoOld = parsedPeriods(join(WI7, 'ingest-input', 'periods.csv'));
    const maricoNew = parsedPeriods(join(BUNDLE, 'ingest-input', 'marico', 'periods.csv'));
    const oldEnds = new Set(maricoOld.map((period) => period.period.periodEnd));
    assert.deepEqual(maricoNew.filter((period) => oldEnds.has(period.period.periodEnd)), maricoOld);
    assert.equal(maricoNew.length, maricoOld.length + 2);

    const kecOld = parsedPeriods(join(WI8, 'ingest-input', 'periods.csv'));
    const kecNew = parsedPeriods(join(BUNDLE, 'ingest-input', 'kec', 'periods.csv'));
    const kecOldEnds = new Set(kecOld.map((period) => period.period.periodEnd));
    assert.deepEqual(kecNew.filter((period) => kecOldEnds.has(period.period.periodEnd)), kecOld);
    assert.equal(kecNew.length, kecOld.length + 2);
  });

  it('the original admitted inputs still reproduce the historical host dataset version', () => {
    const temp = mkdtempSync(join(tmpdir(), 'iid-s4-r3-host-pin-'));
    try {
      const code = ingest([
        ...ADMITTED_INPUTS.flatMap((dir) => ['--input', dir]),
        '--dataset-dir', join(temp, 'dataset'),
        '--now', NOW,
      ]);
      assert.equal(code, 0);
      assert.equal(readDataset(join(temp, 'dataset')).manifest.datasetVersion, HOST_DATASET_VERSION);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it('a refreshed issuer directory cannot be merged alongside its historical bundle; it replaces that input once', () => {
    assert.throws(
      () => assertMergeableInputBundles([
        loadInputBundle(join(WI7, 'ingest-input')),
        loadInputBundle(join(BUNDLE, 'ingest-input', 'marico')),
      ]),
      /DUPLICATE_ISSUER/,
    );
    assert.throws(
      () => assertMergeableInputBundles([
        loadInputBundle(join(WI8, 'ingest-input')),
        loadInputBundle(join(BUNDLE, 'ingest-input', 'kec')),
      ]),
      /DUPLICATE_ISSUER/,
    );
  });
});

describe('S4-R3 — the candidate dataset built by the real CLI', () => {
  it('has the pinned candidate version, 3 issuers, 11 annual periods, 2 quarterly periods and zero issues', () => {
    assert.ok(installed !== null);
    assert.equal(installed.manifest.datasetVersion, CANDIDATE_DATASET_VERSION);
    assert.equal(installed.manifest.contentDigest, CANDIDATE_DATASET_VERSION);
    assert.equal(installed.content.issuers.length, 3);
    assert.equal(installed.content.periods.length, 13);
    assert.equal(installed.content.periods.filter((period) => period.period.periodType === 'ANNUAL').length, 11);
    assert.equal(installed.content.periods.filter((period) => period.period.periodType === 'QUARTER').length, 2);
    assert.deepEqual(installed.content.issues, []);
    assert.equal(installed.manifest.coverage.quarterlyPeriods, 2);
    assert.equal(installed.manifest.coverage.annualPeriods, 11);
  });

  it('adds only the supported periods: Marico FY2025/FY2026 annual, KEC Q1/Q2 FY27 discrete quarters', () => {
    assert.ok(installed !== null);
    const marico = installed.content.periods.filter((period) => period.issuerId === MARICO);
    const kec = installed.content.periods.filter((period) => period.issuerId === KEC);
    assert.deepEqual(marico.filter((p) => p.period.periodType === 'ANNUAL').map((p) => p.period.periodEnd).sort(),
      ['2022-03-31', '2023-03-31', '2024-03-31', '2025-03-31', '2026-03-31']);
    const quarters = kec.filter((p) => p.period.periodType === 'QUARTER');
    assert.deepEqual(quarters.map((p) => [p.period.periodStart, p.period.periodEnd, p.period.quarterForm, p.period.quarterIndex]), [
      ['2026-04-01', '2026-06-30', 'DISCRETE', 1],
      ['2026-07-01', '2026-09-30', 'DISCRETE', 2],
    ]);
    assert.ok(quarters.every((p) => p.period.statementScope === 'CONSOLIDATED' && p.taxonomy === 'INDAS' && p.sourceScale === 'CRORE'));
  });

  it('every derived value on the four new periods recomputes from its own reported inputs', () => {
    assert.ok(installed !== null);
    const newPeriods = installed.content.periods.filter((period) =>
      (period.issuerId === MARICO && ['2025-03-31', '2026-03-31'].includes(period.period.periodEnd)) ||
      (period.issuerId === KEC && period.period.periodType === 'QUARTER'),
    );
    assert.equal(newPeriods.length, 4);
    for (const period of newPeriods) {
      const recomputed = deriveLineItems(period.values, period.period.periodEnd);
      assert.deepEqual(period.derived, recomputed.values, `${period.issuerId}/${period.period.periodEnd}`);
    }
  });

  it('the coverage read path reports quarterlyPeriods > 0 on the dataset and on KEC’s issuer row', () => {
    const report = coverageReport();
    assert.equal(report.dataset.quarterlyPeriods, 2);
    assert.equal(report.measuredSectors, 3);
    assert.equal(report.totalSectors, 13);
    assert.equal(report.outstandingSectors.length, 10);
    assert.deepEqual(report.offVocabularyIssuers, []);
    assert.equal(report.counts.observed, 3);
    assert.ok(report.issuers.every((row) => row.state === 'COVERED'));
    const kec = report.issuers.find((row) => row.issuerId === KEC)!;
    assert.equal(kec.annualPeriods, 3);
    assert.equal(kec.quarterlyPeriods, 2);
    assert.equal(kec.latestPeriodEnd, '2026-09-30');
    const marico = report.issuers.find((row) => row.issuerId === MARICO)!;
    assert.equal(marico.annualPeriods, 5);
    assert.equal(marico.quarterlyPeriods, 0);
    assert.equal(marico.latestPeriodEnd, '2026-03-31');
  });

  it('the served investment-coverage route carries the same quarterly count, and withheld methods keep reasons', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: `${INVESTMENT_COVERAGE_ROUTES.json}?asOf=${AS_OF}` },
      { readInvestmentCoverage: (asOf) => coverageReport(asOf), today: () => AS_OF },
    );
    assert.ok(response);
    assert.equal(response.status, 200);
    const body = JSON.parse(response.body) as ReturnType<typeof coverageReport>;
    assert.equal(body.dataset.quarterlyPeriods, 2);
    assert.equal(body.issuers.find((row) => row.issuerId === KEC)!.quarterlyPeriods, 2);
    for (const sector of body.sectors) {
      for (const method of sector.methods) {
        if (method.state === 'WITHHELD') assert.ok(method.reason, `${sector.sector}/${method.methodId} withheld without reason`);
      }
    }
  });
});

describe('S4-R3 — assessment freshness is not lifted by quarterly data or by a still-stale annual', () => {
  it('Infosys remains 958 days stale; Marico improves to 228 but remains stale; KEC remains 228 annual days stale', () => {
    const expected: Record<string, { dataAsOf: string; stalenessDays: number; quarterlyPeriods: number }> = {
      [INFOSYS]: { dataAsOf: '2024-03-31', stalenessDays: 958, quarterlyPeriods: 0 },
      [MARICO]: { dataAsOf: '2026-03-31', stalenessDays: 228, quarterlyPeriods: 0 },
      [KEC]: { dataAsOf: '2026-03-31', stalenessDays: 228, quarterlyPeriods: 2 },
    };
    for (const [issuerId, want] of Object.entries(expected)) {
      const payload = payloadFor(issuerId);
      assert.equal(payload.asOf.dataAsOf, want.dataAsOf, issuerId);
      assert.equal(payload.asOf.stalenessDays, want.stalenessDays, issuerId);
      assert.equal(payload.asOf.staleBeyondPolicy, true, issuerId);
      assert.equal(payload.data.series.quarterlyPeriods, want.quarterlyPeriods, issuerId);
      assert.ok(payload.quality.flags.some((flag: any) => flag.code === 'STALE_STATEMENTS'), issuerId);
      assert.ok(payload.confidence.caps.includes('STALE_DATA'), issuerId);
      assert.equal(payload.quality.verdict, 'MATERIAL_CONCERNS', issuerId);
    }
  });

  it('annual completeness remains sufficient with 100% required-field coverage and no missing required fields', () => {
    for (const issuerId of [INFOSYS, MARICO, KEC]) {
      const payload = payloadFor(issuerId);
      assert.equal(payload.completeness.adequacy, 'SUFFICIENT', issuerId);
      assert.equal(payload.completeness.requiredFieldCoveragePct, 1, issuerId);
      assert.deepEqual(payload.completeness.missingFields, [], issuerId);
    }
  });

  it('KEC’s quarterly series is discrete, does not invent TTM, and keeps the as-filed Q2 profit rather than a YTD subtraction', () => {
    assert.ok(installed !== null);
    const series = selectSeries(installed.content.periods, KEC);
    assert.equal(series.quarterly.length, 2);
    assert.equal(series.ttm, null);
    const q2 = series.quarterly[1]!;
    assert.equal(q2.periodEnd, '2026-09-30');
    assert.equal(q2.quarterForm, 'DISCRETE');
    assert.equal(periodObservation(q2, 'REVENUE_FROM_OPERATIONS').value, 54_677_100_000);
    assert.equal(periodObservation(q2, 'NET_PROFIT').value, 297_400_000);
    assert.equal(periodObservation(q2, 'EPS_DILUTED').value, 1.12);
    assert.equal(periodObservation(q2, 'OPERATING_CASH_FLOW').presence, 'MISSING');
  });
});

describe('S4-R3 — transcription arithmetic and explicit refusals', () => {
  it('Marico’s new annual rows reconcile on the printed numbers and record operator sums as sums', () => {
    for (const period of Object.values(extraction.marico.periods) as Record<string, any>[]) {
      const value = (id: string) => Number(period.items[id].value);
      assert.equal(value('REVENUE_FROM_OPERATIONS') + value('OTHER_INCOME'), value('TOTAL_INCOME'));
      assert.equal(value('PROFIT_BEFORE_TAX') - value('TAX_EXPENSE'), value('NET_PROFIT'));
      assert.equal(value('EQUITY_ATTRIBUTABLE_TO_OWNERS') + value('NON_CONTROLLING_INTEREST'), value('TOTAL_EQUITY'));
      assert.equal(value('OPERATING_CASH_FLOW') + value('INVESTING_CASH_FLOW') + value('FINANCING_CASH_FLOW'), value('NET_CASH_FLOW'));
      assert.equal(period.items.TRADE_PAYABLES.basis, 'OPERATOR_SUM');
      assert.equal(period.items.LEASE_LIABILITIES.basis, 'OPERATOR_SUM');
    }
    const fy25 = extraction.marico.periods['2025-03-31'];
    const fy26 = extraction.marico.periods['2026-03-31'];
    assert.equal(fy25.items.TRADE_PAYABLES.value, '1363');
    assert.equal(fy26.items.TRADE_PAYABLES.value, '1634');
    assert.equal(fy25.items.LEASE_LIABILITIES.value, '175');
    assert.equal(fy26.items.LEASE_LIABILITIES.value, '202');
    assert.equal(fy25.notReported.LONG_TERM_BORROWINGS.length > 0, true);
    assert.equal(fy26.items.LONG_TERM_BORROWINGS.value, '0');
    assert.equal(extraction.crossChecks.maricoFY25AsFiledVsFY26Comparative.TOTAL_ASSETS['FY25 current column'], '8338');
    assert.equal(extraction.crossChecks.maricoFY25AsFiledVsFY26Comparative.TOTAL_ASSETS['FY26 comparative column'], '8332');
    assert.ok(installed !== null);
    const asFiledFY25 = installed.content.periods.find((period) => period.issuerId === MARICO && period.period.periodEnd === '2025-03-31')!;
    assert.equal(asFiledFY25.values.TOTAL_ASSETS?.value, 83_380_000_000, 'FY2025 stays as filed in the FY2025 report, not the FY2026 comparative');
  });

  it('KEC Q2 uses the printed PPE split, not the XBRL aggregate that includes right-of-use assets', () => {
    assert.ok(installed !== null);
    const q2 = selectSeries(installed.content.periods, KEC).quarterly.find((period) => period.periodEnd === '2026-09-30')!;
    const ppe = periodObservation(q2, 'PROPERTY_PLANT_AND_EQUIPMENT').value;
    assert.ok(ppe !== null && Math.abs(ppe - 12_706_300_000) < 1e-5, `printed PPE 1270.63 crore, got ${ppe}`);
    const cross = extraction.crossChecks.kecQ2PPE;
    assert.equal(Number(cross.printedPPE) + Number(cross.printedRightOfUseAsset), Number(cross.xbrlPropertyPlantAndEquipment));
  });

  it('KEC’s unsupported quarterly fields remain NOT_REPORTED, and half-year cash flow is not assigned to Q2', () => {
    assert.ok(installed !== null);
    const quarters = installed.content.periods.filter((period) => period.issuerId === KEC && period.period.periodType === 'QUARTER');
    for (const quarter of quarters) {
      for (const id of ['CURRENT_INVESTMENTS', 'LEASE_LIABILITIES', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'NON_CONTROLLING_INTEREST', 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS', 'OPERATING_CASH_FLOW', 'CAPITAL_EXPENDITURE', 'INVESTING_CASH_FLOW', 'FINANCING_CASH_FLOW'] as const) {
        const observation = quarter.values[id];
        assert.ok(observation === undefined || observation.presence === 'MISSING', `${quarter.period.periodEnd}/${id} must not be populated`);
        if (observation !== undefined) assert.equal(observation.reason, 'NOT_REPORTED');
      }
    }
    const q1 = quarters.find((period) => period.period.periodEnd === '2026-06-30')!;
    for (const id of ['TOTAL_ASSETS', 'TOTAL_EQUITY', 'CASH_AND_CASH_EQUIVALENTS'] as const) {
      assert.equal(q1.values[id]?.presence, 'MISSING', `Q1 has no balance sheet: ${id}`);
    }
    const fourD = (xbrlFacts.facts as Record<string, any>[]).find((fact) => fact.contextRef === 'FourD' && fact.name === 'CashFlowsFromUsedInOperatingActivities');
    assert.ok(fourD);
    assert.equal(fourD.value, '-4003700000');
    assert.equal(extraction.crossChecks.kecQ2CashFlow.disposition.includes('not ingested'), true);
  });

  it('the candidate CSVs contain no fabricated zero for the refused KEC fields', () => {
    const rows = csvRows(join(BUNDLE, 'ingest-input', 'kec', 'periods.csv')).filter((row) => row.period_type === 'QUARTER');
    assert.equal(rows.length, 2);
    for (const row of rows) {
      for (const column of ['CURRENT_INVESTMENTS', 'LEASE_LIABILITIES', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'NON_CONTROLLING_INTEREST', 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS', 'OPERATING_CASH_FLOW', 'CAPITAL_EXPENDITURE', 'INVESTING_CASH_FLOW', 'FINANCING_CASH_FLOW']) {
        assert.equal(row[column], '', `${row.period_end}/${column} must be blank, not zero`);
      }
    }
  });
});
