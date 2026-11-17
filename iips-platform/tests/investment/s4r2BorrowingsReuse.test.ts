/**
 * `S4-R2` — the borrowing block as a **reusable capability**, not an Infosys patch.
 *
 * WHY THIS FILE EXISTS
 *   `S4-R2` was recorded as "Infosys' borrowings were never transcribed, so net debt is not derivable and
 *   Technology's `EV_EBITDA` is withheld". Repairing one issuer's CSV would close the item and teach the product
 *   nothing: the next holding arrives with its own Schedule III layout, its own way of saying "we have no borrowings",
 *   and possibly a borrowing line for only one of its three periods. What has to be true is that the *grammar*, the
 *   *aggregation* and the *assessment* already handle every one of those shapes for an issuer nobody has seen yet.
 *
 *   So this suite is written the other way round from an issuer fix. Almost every case below is a **synthetic issuer**
 *   built in a temporary directory and pushed through the real ingestion CLI: a company that does not exist, has no
 *   evidence bundle, and appears nowhere in the repository. If any of these tests needed a code change to pass for that
 *   issuer, the capability would not be reusable and `S4-R2` would not be closed — which is exactly what the last
 *   case in this file asserts by inspection of the source.
 *
 * THE FOUR STATES A BORROWING CELL CAN HOLD, and why they are not interchangeable
 *   - a **number** — the filer reported an amount (`PRESENT`);
 *   - **`NIL: <wording>`** — the filer said, in words, that the item is nil (`NIL_BY_DISCLOSURE`, never a zero, and it
 *     must quote the wording and carry the filing reference);
 *   - **blank** — nothing was transcribed (`MISSING: NOT_REPORTED`);
 *   - **`0`** — a reported zero, which is a measurement and stays `PRESENT` with a source (Marico's FY2023 current
 *     maturities are the real instance of this in the admitted population).
 *   A blank cell is the one that must never drift into the third state's arithmetic: an untranscribed borrowing is not
 *   a debt-free company.
 *
 * WHAT THIS FILE DOES NOT DO
 *   It does not admit an issuer, install a dataset, change a valuation formula, move a threshold, or assert anything
 *   about a real company's worth. The synthetic rows are round numbers chosen so the arithmetic is checkable by hand.
 *
 * THE REAL ISSUER, SEPARATELY
 *   The last `describe` runs the actual corrected Infosys bundle and pins what changed and what deliberately did not.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, describe, test } from 'node:test';

import { assessCompany } from '../../src/investment/assessment/engine';
import { buildCapitalStructure } from '../../src/investment/assessment/capitalStructure';
import { selectSeries } from '../../src/investment/assessment/periods';
import type { CompanyAssessmentPayload } from '../../src/investment/assessment/types';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import type { SectorName } from '../../src/investment/contracts/operatingMetrics';
import type { NumericObservation } from '../../src/investment/contracts/observation';
import { run as ingest } from '../../src/investment/cli/ingest';
import { readDataset } from '../../src/investment/ingestion/writer';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const AS_OF = '2026-11-14';
const NOW = `${AS_OF}T00:00:00.000Z`;

const temporaries: string[] = [];
after(() => {
  for (const dir of temporaries.splice(0)) rmSync(dir, { recursive: true, force: true });
});
function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temporaries.push(dir);
  return dir;
}

/* ================================================================================================== *
 * SYNTHETIC ISSUERS — nobody. Two of them, so "a new eligible issuer" is not a figure of speech: the
 * second one is added to a CSV that already carries the first, and neither appears in any roster file
 * in this repository.
 * ================================================================================================== */

const ALPHA = {
  issuerId: 'IN:CIN:U72200KA2020PLC000777',
  legalName: 'Alpha Synthetic Technologies Limited',
  isin: 'INE555A01007',
  securityId: 'IN:ISIN:INE555A01007',
} as const;

const BETA = {
  issuerId: 'IN:CIN:U72900MH2021PLC000902',
  legalName: 'Beta Synthetic Systems Limited',
  isin: 'INE777B01005',
  securityId: 'IN:ISIN:INE777B01005',
} as const;

function roster(issuer: { issuerId: string; legalName: string; isin: string; securityId: string }): unknown {
  return {
    issuers: [
      {
        issuerId: issuer.issuerId,
        legalName: issuer.legalName,
        issuerKeyBasis: 'CIN',
        sector: 'Technology',
        subSegment: null,
        reportingCurrency: 'INR',
        fiscalYearEnd: '03-31',
      },
    ],
    securities: [
      {
        securityId: issuer.securityId,
        issuerId: issuer.issuerId,
        instrumentType: 'EQUITY',
        status: 'ASSESSABLE',
        statusReason: null,
      },
    ],
    listings: [
      {
        listingId: `IN:NSE:${issuer.isin}:EQ:EQUITY`,
        securityId: issuer.securityId,
        issuerId: issuer.issuerId,
        exchange: 'NSE',
        // Distinct per issuer: two rows with one symbol on one exchange are an ambiguous listing, and rightly refused.
        symbol: issuer.isin.slice(-4),
        series: 'EQ',
        instrumentType: 'EQUITY',
        effectiveFrom: '2020-06-01',
        effectiveTo: null,
      },
    ],
  };
}

/**
 * The columns this suite writes, in order. Round numbers in ₹ crore: revenue 100,000, PBT 20,000, D&A 4,000,
 * finance costs 1,000 — so EBITDA is 25,000 by hand, and the debt side is chosen to make net debt exactly −22,000
 * crore: 8,000 + 2,000 + 1,000 + 2,000 − (30,000 + 5,000).
 */
const COLUMNS = [
  'REVENUE_FROM_OPERATIONS',
  'OTHER_INCOME',
  'EMPLOYEE_BENEFIT_EXPENSE',
  'OTHER_EXPENSES',
  'FINANCE_COSTS',
  'DEPRECIATION_AND_AMORTISATION',
  'PROFIT_BEFORE_TAX',
  'TAX_EXPENSE',
  'NET_PROFIT',
  'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS',
  'EPS_BASIC',
  'EPS_DILUTED',
  'TOTAL_ASSETS',
  'TOTAL_EQUITY',
  'EQUITY_ATTRIBUTABLE_TO_OWNERS',
  'NON_CONTROLLING_INTEREST',
  'CASH_AND_CASH_EQUIVALENTS',
  'CURRENT_INVESTMENTS',
  'TRADE_RECEIVABLES',
  'TRADE_PAYABLES',
  'PROPERTY_PLANT_AND_EQUIPMENT',
  'CAPITAL_WORK_IN_PROGRESS',
  'GOODWILL',
  'INTANGIBLE_ASSETS',
  'OPERATING_CASH_FLOW',
  'CAPITAL_EXPENDITURE',
  'INVESTING_CASH_FLOW',
  'FINANCING_CASH_FLOW',
  'DIVIDENDS_PAID',
  'INCOME_TAX_PAID',
  'LEASE_LIABILITIES',
  'LONG_TERM_BORROWINGS',
  'SHORT_TERM_BORROWINGS',
  'CURRENT_MATURITIES_OF_LONG_TERM_DEBT',
  'PREFERENCE_CAPITAL',
] as const;

type Column = (typeof COLUMNS)[number];

/** One synthetic year. `scale` shrinks the older years so the three periods are not identical by accident. */
function syntheticYear(scale = 1): Record<Column, string> {
  const n = (value: number): string => String(Math.round(value * scale));
  return {
    REVENUE_FROM_OPERATIONS: n(100000),
    OTHER_INCOME: n(2000),
    EMPLOYEE_BENEFIT_EXPENSE: n(40000),
    OTHER_EXPENSES: n(10000),
    FINANCE_COSTS: n(1000),
    DEPRECIATION_AND_AMORTISATION: n(4000),
    PROFIT_BEFORE_TAX: n(20000),
    TAX_EXPENSE: n(5000),
    NET_PROFIT: n(15000),
    NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: n(15000),
    EPS_BASIC: n(50),
    EPS_DILUTED: n(50),
    TOTAL_ASSETS: n(200000),
    TOTAL_EQUITY: n(120000),
    EQUITY_ATTRIBUTABLE_TO_OWNERS: n(118000),
    NON_CONTROLLING_INTEREST: n(2000),
    CASH_AND_CASH_EQUIVALENTS: n(30000),
    CURRENT_INVESTMENTS: n(5000),
    TRADE_RECEIVABLES: n(12000),
    TRADE_PAYABLES: n(8000),
    PROPERTY_PLANT_AND_EQUIPMENT: n(60000),
    CAPITAL_WORK_IN_PROGRESS: n(2000),
    GOODWILL: n(3000),
    INTANGIBLE_ASSETS: n(1000),
    OPERATING_CASH_FLOW: n(18000),
    CAPITAL_EXPENDITURE: n(6000),
    INVESTING_CASH_FLOW: n(-9000),
    FINANCING_CASH_FLOW: n(-4000),
    DIVIDENDS_PAID: n(3000),
    INCOME_TAX_PAID: n(5000),
    LEASE_LIABILITIES: n(2000),
    LONG_TERM_BORROWINGS: n(8000),
    SHORT_TERM_BORROWINGS: n(2000),
    CURRENT_MATURITIES_OF_LONG_TERM_DEBT: n(1000),
    PREFERENCE_CAPITAL: n(500),
  };
}

interface RowSpec {
  readonly issuerId: string;
  readonly fiscalYear: number;
  readonly periodEnd: string;
  readonly periodStart: string;
  /** Overrides, applied after `syntheticYear`: a number, a nil cell, or `''` for "nothing was transcribed". */
  readonly cells?: Partial<Record<Column, string>>;
  readonly scale?: number;
}

function csvRow(spec: RowSpec): string {
  const values = { ...syntheticYear(spec.scale ?? 1), ...(spec.cells ?? {}) };
  const head = [
    spec.issuerId,
    'ANNUAL',
    String(spec.fiscalYear),
    spec.periodStart,
    spec.periodEnd,
    'CONSOLIDATED',
    'INDAS',
    'AS_FILED',
    `SYNTH-${spec.issuerId.slice(-6)}-FY${String(spec.fiscalYear).slice(-2)}`,
    spec.periodEnd,
    'CRORE',
  ];
  return [...head, ...COLUMNS.map((column) => values[column])].join(',');
}

const HEADER = [
  'issuer_id',
  'period_type',
  'fiscal_year',
  'period_start',
  'period_end',
  'statement_scope',
  'taxonomy',
  'basis',
  'filing_ref',
  'filed_at',
  'source_scale',
  ...COLUMNS,
].join(',');

/**
 * A three-year synthetic history for one issuer.
 *
 * `latestCells` touches only the newest year — the shape that produces a *period mismatch* (the component resolves to
 * an older balance sheet than its neighbours). `allCells` touches every year — the shape that produces an *absence*
 * (nothing anywhere in the series carries the line). The two are deliberately different tests: one is a debt side that
 * cannot be assembled at one instant, the other is a debt side that does not exist, and neither is a zero.
 */
function threeYears(
  issuerId: string,
  latestCells: Partial<Record<Column, string>> = {},
  latestScale = 1,
  allCells: Partial<Record<Column, string>> = {},
): RowSpec[] {
  return [
    { issuerId, fiscalYear: 2026, periodStart: '2025-04-01', periodEnd: '2026-03-31', cells: { ...allCells, ...latestCells }, scale: latestScale },
    { issuerId, fiscalYear: 2025, periodStart: '2024-04-01', periodEnd: '2025-03-31', cells: allCells, scale: 0.9 },
    { issuerId, fiscalYear: 2024, periodStart: '2023-04-01', periodEnd: '2024-03-31', cells: allCells, scale: 0.8 },
  ];
}

/** Write a bundle (`roster.json` + `periods.csv`) for one or more issuers and return its directory. */
function bundle(
  issuers: readonly { issuerId: string; legalName: string; isin: string; securityId: string }[],
  rows: readonly RowSpec[],
): string {
  const dir = tempDir('s4r2-bundle-');
  if (issuers.length === 1) {
    writeFileSync(join(dir, 'roster.json'), JSON.stringify(roster(issuers[0]), null, 2));
  } else {
    const merged = issuers.map((issuer) => roster(issuer) as { issuers: unknown[]; securities: unknown[]; listings: unknown[] });
    writeFileSync(
      join(dir, 'roster.json'),
      JSON.stringify(
        {
          issuers: merged.flatMap((entry) => entry.issuers),
          securities: merged.flatMap((entry) => entry.securities),
          listings: merged.flatMap((entry) => entry.listings),
        },
        null,
        2,
      ),
    );
  }
  writeFileSync(join(dir, 'periods.csv'), [HEADER, ...rows.map(csvRow)].join('\n') + '\n');
  return dir;
}

interface Installed {
  readonly dir: string;
  readonly dataset: ReturnType<typeof readDataset>;
}

function install(inputs: readonly string[], label: string): Installed {
  const dir = join(tempDir(`s4r2-dataset-${label}-`), 'dataset');
  const code = ingest([...inputs.flatMap((input) => ['--input', input]), '--dataset-dir', dir, '--now', NOW]);
  assert.equal(code, 0, `ingestion of ${label} must succeed`);
  return { dir, dataset: readDataset(dir) };
}

function assess(
  installed: Installed,
  issuerId: string,
  sector: SectorName = 'Technology',
): CompanyAssessmentPayload {
  const issuer = installed.dataset.content.issuers.find((entry) => entry.issuerId === issuerId);
  const security = installed.dataset.content.securities.find((entry) => entry.issuerId === issuerId);
  assert.ok(issuer !== undefined && security !== undefined, `${issuerId} must be in the dataset`);
  const { payload, violations } = assessCompany({
    issuerId,
    legalName: issuer.legalName,
    sector,
    sectorSubsegment: issuer.subSegment,
    securityId: security.securityId,
    dataset: installed.dataset.content,
    datasetVersion: installed.dataset.manifest.datasetVersion,
    contentDigest: installed.dataset.manifest.contentDigest,
    provider: installed.dataset.manifest.provider,
    identity: {
      bindingRef: `identity:${issuerId}`,
      rosterVersion: 'sha256:synthetic',
      listingMapVersion: 'sha256:synthetic',
      corporateActionTableVersion: 'sha256:synthetic',
    },
    generatedAt: NOW,
    knownAsOf: AS_OF,
  });
  assert.deepEqual(violations, [], 'a synthetic fixture must not violate an assessment invariant');
  return payload;
}

/**
 * The latest annual period's observation of an item, from the payload the product publishes.
 * `fundamentals.annual` is published newest-first, so index 0 is the latest period — the instant every
 * capital-structure component is read from.
 */
function latestObservation(payload: CompanyAssessmentPayload, item: LineItemId): NumericObservation | undefined {
  return payload.fundamentals.annual[0]?.values[item];
}

function method(payload: CompanyAssessmentPayload, methodId: string) {
  const found = payload.valuation.methods.find((entry) => entry.methodId === methodId);
  assert.ok(found !== undefined, `${methodId} must be considered for Technology`);
  return found;
}

const CRORE = 10_000_000;

/* ================================================================================================== *
 * 1. Complete borrowing data — ingested, aggregated and consumed by the valuation.
 * ================================================================================================== */
describe('S4-R2 — complete borrowing data is ingested and consumed', () => {
  const installed = install([bundle([ALPHA], threeYears(ALPHA.issuerId))], 'complete');
  const payload = assess(installed, ALPHA.issuerId);

  test('all four debt components and preference capital are PRESENT with the filed amounts', () => {
    for (const [item, crores] of [
      ['LONG_TERM_BORROWINGS', 8000],
      ['SHORT_TERM_BORROWINGS', 2000],
      ['CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 1000],
      ['LEASE_LIABILITIES', 2000],
      ['PREFERENCE_CAPITAL', 500],
    ] as [LineItemId, number][]) {
      const observation = latestObservation(payload, item);
      assert.equal(observation?.presence, 'PRESENT', `${item} must be PRESENT`);
      assert.equal(observation?.value, crores * CRORE, `${item} must carry the filed amount`);
      assert.ok(observation?.source !== undefined && observation.source !== null, `${item} must carry its source`);
    }
  });

  test('net debt resolves to the aggregate the four components and the cash side imply', () => {
    const structure = buildCapitalStructure(selectSeries(installed.dataset.content.periods, ALPHA.issuerId), {
      asOf: NOW,
      datasetSchema: installed.dataset.manifest.datasetSchema,
    });
    assert.equal(structure.grossDebt.presence, 'PRESENT');
    assert.equal(structure.grossDebt.value, 13000 * CRORE);
    assert.equal(structure.cashAndInvestments.value, 35000 * CRORE);
    assert.equal(structure.netDebt.presence, 'PRESENT');
    assert.equal(structure.netDebt.value, -22000 * CRORE, '13,000 − 35,000 crore');
  });

  test('the derived NET_DEBT line item is present for the period as well', () => {
    const latest = payload.fundamentals.annual[0];
    const derived = latest.derived.NET_DEBT;
    assert.equal(derived?.presence, 'PRESENT', 'the derivation set sees all three of its inputs');
    assert.equal(derived?.value, -20000 * CRORE, '8,000 + 2,000 − 30,000 crore');
  });

  test('EV_EBITDA is applied and produces a per-share value from those inputs', () => {
    const ev = method(payload, 'EV_EBITDA');
    assert.equal(ev.applicable, true);
    assert.equal(ev.notApplicableReason, null);
    const netDebtInput = ev.inputs.find((input) => input.name === 'netDebt');
    assert.equal(netDebtInput?.observation.presence, 'PRESENT');
    assert.equal(netDebtInput?.observation.value, -22000 * CRORE);
    assert.equal(ev.output?.perShareMid.presence, 'PRESENT', 'a complete bridge yields a per-share figure');
    assert.ok((ev.output?.perShareMid.value ?? 0) > 0);
  });
});

/* ================================================================================================== *
 * 2 and 3. Missing borrowings stay missing — the issuer-specific shape `S4-R2` was opened for.
 * ================================================================================================== */
describe('S4-R2 — a borrowing that was not transcribed stays explicitly missing', () => {
  for (const [item, label] of [
    ['LONG_TERM_BORROWINGS', 'long-term borrowings'],
    ['SHORT_TERM_BORROWINGS', 'short-term borrowings'],
  ] as [Column, string][]) {
    test(`missing ${label}: the cell is MISSING/NOT_REPORTED and the bridge refuses`, () => {
      const installed = install(
        [bundle([ALPHA], threeYears(ALPHA.issuerId, {}, 1, { [item]: '' }))],
        `missing-${item}`,
      );
      const payload = assess(installed, ALPHA.issuerId);

      const observation = latestObservation(payload, item);
      assert.equal(observation?.presence, 'MISSING', `${item} must be MISSING, not a number`);
      assert.equal(observation?.reason, 'NOT_REPORTED', 'a blank cell is an untranscribed line, and says so');

      const structure = buildCapitalStructure(selectSeries(installed.dataset.content.periods, ALPHA.issuerId), {
        asOf: NOW,
        datasetSchema: installed.dataset.manifest.datasetSchema,
      });
      assert.equal(structure.netDebt.presence, 'MISSING');
      assert.equal((structure.netDebt as { reason?: string }).reason, 'NOT_REPORTED');
      assert.equal(structure.grossDebt.presence, 'MISSING');

      const ev = method(payload, 'EV_EBITDA');
      assert.equal(ev.applicable, false, 'an incomplete debt side withholds the enterprise-value method');
      assert.match(String(ev.notApplicableReason), /CAPITAL_STRUCTURE_INCOMPLETE/);

      const dcf = method(payload, 'DCF_FCFF');
      const perShare = dcf.output?.perShareMid as unknown as { presence: string; note?: string } | undefined;
      assert.equal(perShare?.presence, 'NOT_COMPUTABLE', 'the bridge refuses rather than zeroing the gap');
      assert.match(String(perShare?.note), /blocked by netDebt/);
    });
  }

  test('a component present in an older period but absent from the newest is a PERIOD_MISMATCH, not an absence', () => {
    const installed = install(
      [bundle([ALPHA], threeYears(ALPHA.issuerId, { LONG_TERM_BORROWINGS: '' }))],
      'mixed-instant',
    );
    const payload = assess(installed, ALPHA.issuerId);
    const structure = payload.fundamentals.capitalStructure;
    assert.equal(structure.netDebt.presence, 'NOT_COMPUTABLE');
    assert.equal((structure.netDebt as { reason?: string }).reason, 'PERIOD_MISMATCH');
    assert.equal(structure.netDebt.value, null);
    assert.match(String((structure.netDebt as { note?: string }).note), /resolve to different period ends/);
    assert.equal(method(payload, 'EV_EBITDA').applicable, false);
  });
});

/* ================================================================================================== *
 * 4. Missing is never zero — asserted at every place a zero could hide.
 * ================================================================================================== */
describe('S4-R2 — an untranscribed borrowing is never interpreted as zero', () => {
  const installed = install(
    [bundle([ALPHA], threeYears(ALPHA.issuerId, {}, 1, { LONG_TERM_BORROWINGS: '' }))],
    'not-zero',
  );
  const payload = assess(installed, ALPHA.issuerId);

  test('no observation anywhere reports the missing item as a present zero', () => {
    for (const period of payload.fundamentals.annual) {
      const observation = period.values.LONG_TERM_BORROWINGS;
      assert.equal(observation?.presence, 'MISSING');
      assert.equal(observation?.value, null, 'a MISSING observation carries no value at all');
      assert.notEqual(observation?.presence, 'PRESENT', 'and certainly not a reported zero');
    }
  });

  test('the derived NET_DEBT is absent rather than computed from a substituted zero', () => {
    const zeroSubstituted = 0 + 2000 - 30000; // what a silent zero would have produced, in ₹ crore
    for (const period of payload.fundamentals.annual) {
      const derived = period.derived.NET_DEBT;
      assert.equal(derived, undefined, 'the derivation refuses: an unreported input is not zero');
      assert.notEqual(derived?.value, zeroSubstituted * CRORE);
    }
    assert.equal(payload.fundamentals.capitalStructure.netDebt.value, null);
  });

  test('the published limitation says which input is missing, instead of publishing a number', () => {
    const text = payload.limitations.join(' ');
    assert.match(text, /Net debt could not be derived/);
    assert.match(text, /NOT_REPORTED/);
  });
});

/* ================================================================================================== *
 * 5. Invalid units and invalid periods are refused, and nothing is written.
 * ================================================================================================== */
describe('S4-R2 — invalid units or periods are rejected or withheld safely', () => {
  test('an unknown source scale is refused and no dataset is written', () => {
    const bad = bundle([ALPHA], threeYears(ALPHA.issuerId));
    const csv = readFileSync(join(bad, 'periods.csv'), 'utf8').replace(',CRORE,', ',LAKH-CRORE,');
    writeFileSync(join(bad, 'periods.csv'), csv);

    const dir = join(tempDir('s4r2-invalid-scale-'), 'dataset');
    const code = ingest(['--input', bad, '--dataset-dir', dir, '--now', NOW]);
    assert.equal(code, 1, 'an uninterpretable scale is not an ingestion issue; the run fails');
    assert.throws(() => readDataset(dir), 'nothing may be published from an unreadable input');
  });

  test('a fiscal year that contradicts its own period end is refused', () => {
    const rows = threeYears(ALPHA.issuerId);
    // FY2026's period end is 2026-03-31; labelling that row 2025 is the transcription slip this guards against.
    const contradictory: RowSpec[] = [{ ...rows[0], fiscalYear: 2025 }, rows[1], rows[2]];
    const bad = bundle([ALPHA], contradictory);

    const dir = join(tempDir('s4r2-invalid-period-'), 'dataset');
    const code = ingest(['--input', bad, '--dataset-dir', dir, '--now', NOW]);
    assert.equal(code, 1, 'a row that is two years at once is refused');
    assert.throws(() => readDataset(dir));
  });

  test('with --allow-errors the offending row is withheld and the rest is published', () => {
    const rows = threeYears(ALPHA.issuerId);
    const contradictory: RowSpec[] = [{ ...rows[0], fiscalYear: 2025 }, rows[1], rows[2]];
    const bad = bundle([ALPHA], contradictory);

    const dir = join(tempDir('s4r2-allow-errors-'), 'dataset');
    const code = ingest(['--input', bad, '--dataset-dir', dir, '--now', NOW, '--allow-errors']);
    assert.equal(code, 0);
    const dataset = readDataset(dir);
    const periods = dataset.content.periods.filter((period) => period.issuerId === ALPHA.issuerId);
    assert.deepEqual(
      periods.map((period) => period.period.periodEnd).sort(),
      ['2024-03-31', '2025-03-31'],
      'the contradictory row is not stored; the two consistent rows are',
    );
  });
});

/* ================================================================================================== *
 * 6. A new eligible issuer, with no issuer-specific code.
 * ================================================================================================== */
describe('S4-R2 — a new issuer uses the same mechanism without issuer-specific code', () => {
  const installed = install(
    [bundle([ALPHA, BETA], [...threeYears(ALPHA.issuerId), ...threeYears(BETA.issuerId, {}, 1.25)])],
    'two-issuers',
  );

  test('two issuers in one bundle are both ingested, and each is assessed on its own numbers', () => {
    const alpha = assess(installed, ALPHA.issuerId);
    const beta = assess(installed, BETA.issuerId);
    assert.equal(latestObservation(alpha, 'LONG_TERM_BORROWINGS')?.value, 8000 * CRORE);
    assert.equal(latestObservation(beta, 'LONG_TERM_BORROWINGS')?.value, 10000 * CRORE);
    assert.equal(method(alpha, 'EV_EBITDA').applicable, true);
    assert.equal(method(beta, 'EV_EBITDA').applicable, true);
    assert.notEqual(
      method(alpha, 'EV_EBITDA').output?.perShareMid.value,
      method(beta, 'EV_EBITDA').output?.perShareMid.value,
      'the mechanism is shared; the answers are not',
    );
  });

  test('one issuer having no borrowings does not change how the other is treated', () => {
    const nilCell =
      'NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: the group had no borrowings at the reporting date';
    const mixed = install(
      [
        bundle(
          [ALPHA, BETA],
          [...threeYears(ALPHA.issuerId, { LONG_TERM_BORROWINGS: nilCell, SHORT_TERM_BORROWINGS: nilCell }), ...threeYears(BETA.issuerId)],
        ),
      ],
      'mixed-nil',
    );
    const alpha = assess(mixed, ALPHA.issuerId);
    const beta = assess(mixed, BETA.issuerId);
    assert.equal(latestObservation(alpha, 'LONG_TERM_BORROWINGS')?.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(latestObservation(beta, 'LONG_TERM_BORROWINGS')?.presence, 'PRESENT');
    assert.equal(method(alpha, 'EV_EBITDA').applicable, true, 'a declared nil is a statement, not a gap');
    assert.equal(method(beta, 'EV_EBITDA').applicable, true);
  });

  test('the borrowing, derivation and capital-structure code names no issuer at all', () => {
    /**
     * Comments are stripped first. The prose in these modules explains itself with real examples ("the Infosys bundle
     * declares 44 columns"), and that is documentation, not branching: what must be absent is a decision taken on an
     * issuer's identity.
     */
    const withoutComments = (text: string): string =>
      text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');
    const sources = [
      'src/investment/contracts/lineItems.ts',
      'src/investment/contracts/nilBinding.ts',
      'src/investment/ingestion/builder.ts',
      'src/investment/fundamentals/derive.ts',
      'src/investment/assessment/capitalStructure.ts',
      'src/investment/assessment/methods.ts',
    ];
    for (const relative of sources) {
      const text = withoutComments(readFileSync(join(ROOT, 'iips-platform', relative), 'utf8'));
      for (const identifier of [ALPHA.issuerId, BETA.issuerId, ALPHA.isin, BETA.isin, 'INFY', 'L85110KA1981PLC013115', 'Infosys', 'Marico', 'KEC']) {
        assert.equal(
          text.includes(identifier),
          false,
          `${relative} must not know the issuer ${identifier}: the capability is the grammar, not the company`,
        );
      }
    }
  });
});

/* ================================================================================================== *
 * 7. No regression for the issuers already measured.
 * ================================================================================================== */
describe('S4-R2 — the issuers already measured do not move', () => {
  const MARICO = 'IN:CIN:L15140MH1988PLC049208';
  const KEC = 'IN:CIN:L45200MH2005PLC152061';
  const MARICO_INPUT = join(EVIDENCE, 'WI7-CONSUMER-MARICO-2026-11-07', 'ingest-input');
  const KEC_INPUT = join(EVIDENCE, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input');

  /**
   * The pre-`S4-R2` Infosys input, reconstructed by dropping the four columns this work item added. Reconstructing it
   * rather than keeping a second copy of the bundle means the "before" side is derived from the "after" side by a rule
   * a reader can check, and `REL-1`'s committed bytes stay the historical record they are.
   */
  function preS4R2InfosysInput(): string {
    const corrected = join(EVIDENCE, 'S4-R2-INFOSYS-BORROWINGS-2026-11-17', 'ingest-input');
    const dir = tempDir('s4r2-rel1-shape-');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'roster.json'), readFileSync(join(corrected, 'roster.json')));
    const added = ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'PREFERENCE_CAPITAL'];
    const lines = readFileSync(join(corrected, 'periods.csv'), 'utf8').split('\n').filter((line) => line !== '');
    const keep = lines[0].split(',').length - added.length;
    writeFileSync(
      join(dir, 'periods.csv'),
      lines.map((line) => line.split(',').slice(0, keep).join(',')).join('\n') + '\n',
    );
    return dir;
  }

  const before = install([preS4R2InfosysInput(), MARICO_INPUT, KEC_INPUT], 'before');
  const after = install([join(EVIDENCE, 'S4-R2-INFOSYS-BORROWINGS-2026-11-17', 'ingest-input'), MARICO_INPUT, KEC_INPUT], 'after');

  /** Everything except the dataset's own identity, which is expected to move. */
  function comparable(payload: CompanyAssessmentPayload): unknown {
    const { fundamentals, valuation, quality, confidence, completeness, risk, moat, dividends, limitations } = payload;
    return { fundamentals, valuation, quality, confidence, completeness, risk, moat, dividends, limitations };
  }

  for (const [label, issuerId, sector] of [
    ['Marico', MARICO, 'Consumer'],
    ['KEC', KEC, 'Industrials'],
  ] as [string, string, SectorName][]) {
    test(`${label}'s assessment is byte-identical before and after the correction`, () => {
      const beforePayload = assess(before, issuerId, sector);
      const afterPayload = assess(after, issuerId, sector);
      assert.notEqual(before.dataset.manifest.datasetVersion, after.dataset.manifest.datasetVersion, 'the dataset did move');
      assert.deepEqual(comparable(afterPayload), comparable(beforePayload));
    });
  }

  test("Infosys is the only issuer whose payload changes, and only where the borrowings reach", () => {
    const infosys = 'IN:CIN:L85110KA1981PLC013115';
    const beforePayload = assess(before, infosys);
    const afterPayload = assess(after, infosys);

    const methodIds = beforePayload.valuation.methods.map((entry) => entry.methodId);
    const applicableBefore = beforePayload.valuation.methods.filter((entry) => entry.applicable).map((entry) => entry.methodId);
    const applicableAfter = afterPayload.valuation.methods.filter((entry) => entry.applicable).map((entry) => entry.methodId);
    assert.deepEqual(methodIds, afterPayload.valuation.methods.map((entry) => entry.methodId), 'the method set is unchanged');
    assert.deepEqual(applicableBefore, ['DCF_FCFF', 'PE_RELATIVE']);
    assert.deepEqual(applicableAfter, ['DCF_FCFF', 'PE_RELATIVE', 'EV_EBITDA']);

    /*
     * The policy did not move: same selection policy, same roles, same method identities. What moved is the data —
     * the bridge can now be crossed, so the intrinsic range that was withheld becomes published. That is the whole
     * point, and it is asserted as the difference rather than smoothed away.
     */
    assert.equal(
      afterPayload.valuation.methodSelection.policyVersion,
      beforePayload.valuation.methodSelection.policyVersion,
    );
    assert.deepEqual(
      afterPayload.valuation.methodSelection.considered.map((entry) => [entry.methodId, entry.role]),
      beforePayload.valuation.methodSelection.considered.map((entry) => [entry.methodId, entry.role]),
    );
    assert.equal(beforePayload.valuation.intrinsic, null, 'with the debt side missing there is no intrinsic range');
    assert.notEqual(afterPayload.valuation.intrinsic, null, 'with it resolved there is one');
  });
});

/* ================================================================================================== *
 * The real issuer — the corrected Infosys bundle, and the historical one beside it.
 * ================================================================================================== */
describe('S4-R2 — the Infosys correction, from the authorised filing', () => {
  const INFOSYS = 'IN:CIN:L85110KA1981PLC013115';
  const CORRECTED = join(EVIDENCE, 'S4-R2-INFOSYS-BORROWINGS-2026-11-17', 'ingest-input');
  const HISTORICAL = join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06', 'ingest-input');
  const installed = install([CORRECTED], 'infosys-corrected');
  const payload = assess(installed, INFOSYS);

  test('FY2024 carries the filing sentence as a declared nil for all three borrowing components', () => {
    const latest = payload.fundamentals.annual.find((period) => period.periodEnd === '2024-03-31');
    assert.ok(latest !== undefined);
    for (const item of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT'] as LineItemId[]) {
      const observation = latest.values[item];
      assert.equal(observation?.presence, 'NIL_BY_DISCLOSURE', `${item} is a declared nil`);
      assert.equal(observation?.value, null, 'a declared nil is never a number');
      assert.equal(observation?.reason, 'DECLARED_NIL_IN_SOURCE');
      assert.equal(observation?.note, 'The Group has no outstanding borrowings.', 'the filer’s own words');
      assert.equal(observation?.source?.ref, 'INFY-INDAS-CONSOL-FY24', 'the filing reference travels with it');
      assert.equal(observation?.periodEnd, '2024-03-31');
      const binding = (observation as { nilBinding?: { section: string; class: string; scope: string } }).nilBinding;
      assert.deepEqual(
        { section: binding?.section, class: binding?.class, scope: binding?.scope },
        { section: 'BS', class: 'BORROWINGS', scope: 'CONSOLIDATED_GROUP' },
      );
    }
  });

  test('preference capital is a cross-scope declared nil, and the acknowledgement is published', () => {
    const latest = payload.fundamentals.annual.find((period) => period.periodEnd === '2024-03-31')!;
    const observation = latest.values.PREFERENCE_CAPITAL;
    assert.equal(observation?.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(observation?.value, null);
    const binding = (observation as { nilBinding?: { class: string; scope: string; acknowledgedBy?: string } }).nilBinding;
    assert.equal(binding?.class, 'PREFERENCE_SHARE_CAPITAL');
    assert.equal(binding?.scope, 'STANDALONE_COMPANY', 'the sentence speaks for the Company, not the Group');
    assert.equal(binding?.acknowledgedBy, 'WI5-preference-capital-review', 'and the mapping is acknowledged, not silent');
  });

  test('FY2023 and FY2022 are NOT_REPORTED, not nil and not zero', () => {
    for (const periodEnd of ['2023-03-31', '2022-03-31']) {
      const period = payload.fundamentals.annual.find((entry) => entry.periodEnd === periodEnd)!;
      for (const item of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'PREFERENCE_CAPITAL'] as LineItemId[]) {
        assert.equal(period.values[item]?.presence, 'MISSING', `${item} at ${periodEnd}`);
        assert.equal(period.values[item]?.reason, 'NOT_REPORTED');
        assert.equal(period.values[item]?.value, null);
      }
    }
  });

  test('net debt resolves to −₹19,342 crore — the figure the WI-3 record computed independently', () => {
    const structure = payload.fundamentals.capitalStructure;
    assert.equal(structure.grossDebt.presence, 'PRESENT');
    assert.equal(structure.grossDebt.value, 8359 * CRORE, 'leases only: the filing says there are no borrowings');
    assert.equal(structure.cashAndInvestments.value, 27701 * CRORE);
    assert.equal(structure.netDebt.presence, 'PRESENT');
    assert.equal(structure.netDebt.value, -19342 * CRORE);
  });

  test('Technology EV_EBITDA is now applied, and the intrinsic range is published', () => {
    const ev = method(payload, 'EV_EBITDA');
    assert.equal(ev.applicable, true, 'the S4-R2 acceptance criterion');
    assert.equal(ev.notApplicableReason, null);
    assert.equal(ev.output?.perShareMid.presence, 'PRESENT');
    assert.ok(Math.abs((ev.output?.perShareMid.value ?? 0) - 1133.9484469942438) < 1e-9);

    const evRevenue = method(payload, 'EV_REVENUE');
    assert.equal(evRevenue.applicable, false, 'and the metric-gated method is still withheld, for its own reason');
    assert.match(String(evRevenue.notApplicableReason), /MANDATORY_METRIC_MISSING/);

    assert.equal(payload.valuation.intrinsic?.withheld ?? null, null, 'the intrinsic range is no longer withheld');
    assert.ok(Math.abs((payload.valuation.intrinsic?.perShare.mid.value ?? 0) - 1088.972274952081) < 1e-9);
  });

  test('the historical REL-1 bundle is untouched and still says what it said', () => {
    const historical = readFileSync(join(HISTORICAL, 'periods.csv'), 'utf8');
    const header = historical.split('\n')[0].split(',');
    for (const column of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'PREFERENCE_CAPITAL']) {
      assert.equal(header.includes(column), false, `REL-1 must not be rewritten by S4-R2 (${column})`);
    }
    /* And the dataset it still produces cannot resolve net debt — the "before" state, preserved. */
    const historicalDataset = install([HISTORICAL], 'infosys-historical');
    const historicalPayload = assess(historicalDataset, INFOSYS);
    assert.equal(historicalPayload.fundamentals.capitalStructure.netDebt.presence, 'MISSING');
    assert.equal(method(historicalPayload, 'EV_EBITDA').applicable, false);
    assert.equal(historicalPayload.valuation.intrinsic, null);
  });
});
