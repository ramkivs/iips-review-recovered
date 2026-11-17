/**
 * `S4-R3` — statement freshness as a **reusable capability**, not a per-issuer date check.
 *
 * WHY THIS FILE EXISTS
 *   `S4-R3` was recorded as "all three issuers exceed the freshness window". That is a measurement of three issuers;
 *   the item is about the capability. The questions a future holding raises are the ones this file pins, and none of
 *   them is about Infosys, Marico or KEC:
 *
 *     • is the *valuation basis* and the *newest reported period* the same thing? (no — and the payload used to publish
 *       only one of them);
 *     • is a **period end** a **filing date**? (no — a late filing must not make an old period current);
 *     • is "no annual period" fresh? (it used to be: staleness was computed from `annual[0]` and fell back to zero
 *       days, i.e. fresh, when the series held only quarters);
 *     • does a missing year or quarter look like a shorter series? (it used to, and every consumer read it as
 *       continuous).
 *
 *   The rules are period algebra: nothing below names an issuer, a sector, a year or a fiscal-year end. Almost every
 *   case is a **synthetic issuer** that exists nowhere in this repository, pushed through the real ingestion CLI; the
 *   last `describe` re-runs the admitted population and the O3-admitted refresh candidate.
 *
 * WHAT THIS FILE DOES NOT DO
 *   It does not relax a threshold, lift a confidence cap, admit an issuer, install a dataset or claim that any issuer
 *   is current. `freshness-policy/1.0.0`'s windows are read from the policy, not restated here, and the decisive case
 *   is the one that asserts an issuer with a 48-day-old quarter is still **stale**, because the valuation rests on a
 *   231-day-old annual period.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, describe, test } from 'node:test';

import { assessFreshness, periodSequenceGaps, quarterFiscalYear } from '../../src/investment/assessment/freshness';
import { assessCompany } from '../../src/investment/assessment/engine';
import { selectSeries } from '../../src/investment/assessment/periods';
import { VALUATION_POLICY } from '../../src/investment/assessment/policy';
import { FRESHNESS_POLICY_VERSION, type CompanyAssessmentPayload, type SeriesSelection } from '../../src/investment/assessment/types';
import type { SectorName } from '../../src/investment/contracts/operatingMetrics';
import { run as ingest } from '../../src/investment/cli/ingest';
import { readDataset } from '../../src/investment/ingestion/writer';
import { buildInvestmentCoverageReport } from '../../src/investment/coverage/investmentCoverage';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
/** The recorded `S4-R3` measurement clock. Ages in this file are relative to it, never to the wall clock. */
const CLOCK = '2026-11-14';
const NOW = `${CLOCK}T00:00:00.000Z`;
const WINDOWS = VALUATION_POLICY.freshness;

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
 * A minimal series builder. `assessFreshness` takes the same `SeriesSelection` the engine builds, so the
 * rules can be exercised without a dataset — and the dataset cases below prove the engine agrees.
 * ================================================================================================== */

type PeriodType = 'ANNUAL' | 'QUARTER' | 'TTM';

interface PeriodSpec {
  readonly periodType: PeriodType;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly filedAt: string;
  readonly basis?: 'AS_FILED' | 'RESTATED';
  readonly quarterForm?: 'YTD' | 'DISCRETE';
}

function periodOf(spec: PeriodSpec) {
  return {
    periodEnd: spec.periodEnd,
    periodStart: spec.periodStart,
    fiscalYear: Number(spec.periodEnd.slice(0, 4)),
    periodType: spec.periodType,
    statementScope: 'CONSOLIDATED' as const,
    quarterForm: spec.quarterForm ?? null,
    basis: spec.basis ?? ('AS_FILED' as const),
    filedAt: spec.filedAt,
    filingRef: `filing-${spec.periodEnd}-${spec.basis ?? 'AS_FILED'}`,
    values: {},
    derived: {},
  };
}

/** Newest first, as the engine receives them: `selectSeries` sorts annual periods descending. */
function seriesOf(specs: { annual?: PeriodSpec[]; quarterly?: PeriodSpec[]; ttm?: PeriodSpec | null }): SeriesSelection {
  const annual = [...(specs.annual ?? [])]
    .sort((a, b) => (a.periodEnd < b.periodEnd ? 1 : -1))
    .map((spec) => periodOf({ ...spec, periodType: 'ANNUAL' }));
  const quarterly = [...(specs.quarterly ?? [])]
    .sort((a, b) => (a.periodEnd < b.periodEnd ? -1 : 1))
    .map((spec) => periodOf({ ...spec, periodType: 'QUARTER' }));
  return {
    statementScope: 'CONSOLIDATED',
    scopeSubstitution: false,
    annual,
    quarterly,
    ttm: specs.ttm === undefined || specs.ttm === null ? null : periodOf({ ...specs.ttm, periodType: 'TTM' }),
    excludedForScope: [],
    notes: [],
  };
}

const fresh = (series: SeriesSelection, clock = CLOCK) =>
  assessFreshness({ series, clock, windows: WINDOWS, policyVersion: FRESHNESS_POLICY_VERSION });

/** An annual period `days` before the clock, with a filing made `lag` days after its period end. */
function annualAgo(days: number, lag = 30): PeriodSpec {
  const end = new Date(Date.parse(`${CLOCK}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
  const filed = new Date(Date.parse(`${end}T00:00:00Z`) + lag * 86_400_000).toISOString().slice(0, 10);
  return { periodType: 'ANNUAL', periodStart: `${Number(end.slice(0, 4)) - 1}-04-01`, periodEnd: end, filedAt: filed };
}

describe('S4-R3 — the freshness rules are period algebra', () => {
  test('a period end inside the window is FRESH, and the basis is the annual period', () => {
    const block = fresh(seriesOf({ annual: [annualAgo(100)] }));
    assert.equal(block.status, 'FRESH');
    assert.equal(block.valuationBasisKind, 'ANNUAL');
    assert.deepEqual(block.reasons, []);
    assert.equal(block.valuationBasis?.daysSincePeriodEnd, 100);
    assert.equal(block.valuationBasis?.withinPnlWindow, true);
    assert.equal(block.windows.pnlDays, WINDOWS.pnlDays);
    assert.equal(block.policyVersion, FRESHNESS_POLICY_VERSION);
  });

  test('a period end beyond the window is STALE, and says which window it broke', () => {
    const block = fresh(seriesOf({ annual: [annualAgo(WINDOWS.pnlDays + 31)] }));
    assert.equal(block.status, 'STALE');
    assert.deepEqual(block.reasons, ['VALUATION_BASIS_BEYOND_PNL_WINDOW']);
    assert.equal(block.valuationBasis?.withinPnlWindow, false);
    // The balance-sheet window is the wider one; a period can be beyond the P&L window and inside this one.
    assert.equal(block.valuationBasis?.withinBalanceSheetWindow, WINDOWS.balanceSheetDays >= WINDOWS.pnlDays + 31);
  });

  test('fresh information beside a stale valuation basis: both are published, neither stands for the other', () => {
    /* The real shape: an annual period 231 days old, and two quarters since. */
    const annual = annualAgo(231, 46);
    const block = fresh(
      seriesOf({
        annual: [annual],
        quarterly: [
          { periodType: 'QUARTER', periodStart: '2026-04-01', periodEnd: '2026-06-30', filedAt: '2026-08-10', quarterForm: 'DISCRETE' },
          { periodType: 'QUARTER', periodStart: '2026-04-01', periodEnd: '2026-09-30', filedAt: '2026-11-02', quarterForm: 'DISCRETE' },
        ],
      }),
    );
    assert.equal(block.status, 'STALE', 'the valuation basis decides the verdict');
    assert.equal(block.valuationBasis?.periodType, 'ANNUAL');
    assert.equal(block.valuationBasis?.daysSincePeriodEnd, 231);
    assert.equal(block.latestReported?.periodType, 'QUARTER');
    assert.equal(block.latestReported?.periodEnd, '2026-09-30');
    assert.equal(block.latestReported?.daysSincePeriodEnd, 45);
    assert.equal(block.latestReported?.withinPnlWindow, true);
    assert.deepEqual(block.reasons, ['VALUATION_BASIS_BEYOND_PNL_WINDOW']);
    // The two facts are different facts. A payload that published only one of them could not say this.
    assert.notEqual(block.valuationBasis?.periodEnd, block.latestReported?.periodEnd);
  });

  test('a period end is not a filing date: a late filing does not make an old period current', () => {
    /*
     * Same period end, two publication dates 300 days apart. Freshness must not move: the policy measures the
     * statement, not the lag. This is the failure mode a "days since we learned it" shortcut would produce.
     */
    const old = { periodType: 'ANNUAL' as const, periodStart: '2022-04-01', periodEnd: '2023-03-31' };
    const earlyFiling = fresh(seriesOf({ annual: [{ ...old, filedAt: '2023-05-01' }] }));
    const lateFiling = fresh(seriesOf({ annual: [{ ...old, filedAt: CLOCK }] }));
    assert.equal(earlyFiling.status, 'STALE');
    assert.equal(lateFiling.status, 'STALE');
    assert.equal(earlyFiling.valuationBasis?.daysSincePeriodEnd, lateFiling.valuationBasis?.daysSincePeriodEnd);
    assert.notEqual(earlyFiling.valuationBasis?.daysSinceFiling, lateFiling.valuationBasis?.daysSinceFiling);
    assert.equal(lateFiling.valuationBasis?.filedAt, CLOCK);
    assert.equal(lateFiling.valuationBasis?.periodEnd, '2023-03-31');
  });

  test('a period that ends after the clock is contradictory data, not freshness', () => {
    /*
     * The age of a future-dated period clamps at zero days, so without this rule a row dated a year ahead read as
     * **maximally fresh** — the exact failure mode this module exists to prevent. A period that has not ended cannot
     * have a freshness verdict: the status is `UNKNOWN`, the engine's `staleBeyondPolicy` is therefore true, and the
     * payload fails closed rather than open.
     */
    const future = { periodType: 'ANNUAL' as const, periodStart: '2027-04-01', periodEnd: '2028-03-31', filedAt: '2028-05-01' };
    const block = fresh(seriesOf({ annual: [future] }));
    assert.equal(block.valuationBasis?.periodEnd, '2028-03-31');
    assert.equal(block.valuationBasis?.futurePeriodEnd, true);
    assert.equal(block.valuationBasis?.daysSincePeriodEnd, 0, 'the age is clamped, which is why the flag must decide');
    assert.equal(block.status, 'UNKNOWN');
    assert.deepEqual(block.reasons, ['FUTURE_PERIOD_END']);
    assert.notEqual(block.status, 'FRESH');
    // A period that ends *on* the clock is not future-dated: same-day reporting is inside every window.
    const sameDay = fresh(seriesOf({ annual: [{ ...future, periodEnd: CLOCK, filedAt: CLOCK }] }));
    assert.equal(sameDay.valuationBasis?.futurePeriodEnd, false);
    assert.equal(sameDay.status, 'FRESH');
  });

  test('no annual period is not "fresh": a quarters-only series names its fallback basis', () => {
    /*
     * Before `S4-R3` this series produced `stalenessDays = 0` and no `STALE_STATEMENTS` flag, because the engine read
     * `annual[0]` and treated `undefined` as "today". That is the false negative this test exists to prevent.
     */
    const quarter = { periodType: 'QUARTER' as const, periodStart: '2026-07-01', periodEnd: '2026-09-30', filedAt: '2026-11-02', quarterForm: 'DISCRETE' as const };
    const within = fresh(seriesOf({ quarterly: [quarter] }));
    assert.equal(within.valuationBasisKind, 'QUARTER');
    assert.equal(within.status, 'FRESH', 'the newest quarter is inside the window, so the age is real, not zero-by-omission');
    assert.ok(within.reasons.includes('NO_ANNUAL_PERIOD_FOR_VALUATION'));
    assert.equal(within.latest.ANNUAL, null);

    const ancient = fresh(
      seriesOf({
        quarterly: [{ ...quarter, periodStart: '2021-07-01', periodEnd: '2021-09-30', filedAt: '2021-11-02' }],
      }),
    );
    assert.equal(ancient.status, 'STALE', 'a quarters-only series can be stale too');
    assert.deepEqual(ancient.reasons, ['VALUATION_BASIS_BEYOND_PNL_WINDOW', 'NO_ANNUAL_PERIOD_FOR_VALUATION']);
  });

  test('a series with no period at all is UNKNOWN, never FRESH', () => {
    const block = fresh(seriesOf({}));
    assert.equal(block.status, 'UNKNOWN');
    assert.equal(block.valuationBasis, null);
    assert.equal(block.valuationBasisKind, 'NONE');
    assert.deepEqual(block.reasons, ['NO_PERIOD_REPORTED']);
    assert.equal(block.latestReported, null);
  });

  test('the clock is the caller’s, so one series measured at two clocks moves only where the window is crossed', () => {
    const series = seriesOf({ annual: [annualAgo(190, 40)] });
    const atClock = fresh(series);
    const later = fresh(series, new Date(Date.parse(`${CLOCK}T00:00:00Z`) + 30 * 86_400_000).toISOString().slice(0, 10));
    assert.equal(atClock.status, 'FRESH');
    assert.equal(later.status, 'STALE', 'no policy change: the same series crosses the 200-day window');
    assert.equal(later.valuationBasis?.periodEnd, atClock.valuationBasis?.periodEnd);
    assert.equal(later.valuationBasis?.filedAt, atClock.valuationBasis?.filedAt);
    assert.equal(later.windows.pnlDays, atClock.windows.pnlDays);
  });
});

describe('S4-R3 — a missing period is a gap, not a shorter series', () => {
  const annualFor = (fiscalYears: readonly number[]): PeriodSpec[] =>
    fiscalYears.map((fiscalYear) => ({
      periodType: 'ANNUAL',
      periodStart: `${fiscalYear - 1}-04-01`,
      periodEnd: `${fiscalYear}-03-31`,
      filedAt: `${fiscalYear}-05-20`,
    }));

  test('a missing fiscal year is reported, and no period is interpolated', () => {
    const series = seriesOf({ annual: annualFor([2022, 2023, 2025]) });
    const gaps = periodSequenceGaps(series);
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0]?.periodType, 'ANNUAL');
    assert.deepEqual(gaps[0]?.missing, ['FY2024']);
    assert.deepEqual(gaps[0]?.between, ['FY2023', 'FY2025']);
    // The series still holds exactly the three periods that were filed: a gap is a statement about absence.
    assert.equal(series.annual.length, 3);
    assert.equal(series.annual.some((period) => period.periodEnd === '2024-03-31'), false);
  });

  test('a contiguous fiscal-year sequence has no gap', () => {
    assert.deepEqual(periodSequenceGaps(seriesOf({ annual: annualFor([2023, 2024, 2025, 2026]) })), []);
  });

  test('a missing quarter is reported; a contiguous quarter sequence is not', () => {
    const quarter = (start: string, end: string, filedAt: string): PeriodSpec => ({
      periodType: 'QUARTER',
      periodStart: start,
      periodEnd: end,
      filedAt,
      quarterForm: 'DISCRETE',
    });
    const gapped = seriesOf({
      // Both rows carry the fiscal-year start, which is how a discrete quarter is addressed in this contract; the
      // quarter index is the span from that start, so Q1 and Q3 are distinguishable and Q2 is visibly absent.
      quarterly: [quarter('2026-04-01', '2026-06-30', '2026-08-10'), quarter('2026-04-01', '2026-12-31', '2027-02-05')],
    });
    const gaps = periodSequenceGaps(gapped);
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0]?.periodType, 'QUARTER');
    assert.deepEqual(gaps[0]?.missing, ['FY2027-Q2']);

    const contiguous = seriesOf({
      quarterly: [quarter('2026-04-01', '2026-06-30', '2026-08-10'), quarter('2026-07-01', '2026-09-30', '2026-11-02')],
    });
    assert.deepEqual(periodSequenceGaps(contiguous), []);
  });

  test('a fiscal year is named for the year it ends, so quarters of one April–March year group together', () => {
    // Q1–Q3 of an April–March year end in the calendar year before the fiscal year ends. Grouping by the end date
    // would split the year in two and invent a gap; grouping by the start date does not.
    assert.equal(quarterFiscalYear('2025-04-01'), 2026);
    assert.equal(quarterFiscalYear('2025-10-01'), 2026);
    assert.equal(quarterFiscalYear('2026-01-01'), 2026);
    assert.equal(quarterFiscalYear('2025-01-01'), 2025, 'a January year start is labelled with its own year');
    const aprilMarchYear = seriesOf({
      quarterly: [
        { periodType: 'QUARTER', periodStart: '2025-04-01', periodEnd: '2025-06-30', filedAt: '2025-08-10', quarterForm: 'DISCRETE' },
        { periodType: 'QUARTER', periodStart: '2025-04-01', periodEnd: '2025-09-30', filedAt: '2025-11-10', quarterForm: 'DISCRETE' },
        { periodType: 'QUARTER', periodStart: '2025-04-01', periodEnd: '2025-12-31', filedAt: '2026-02-10', quarterForm: 'DISCRETE' },
        { periodType: 'QUARTER', periodStart: '2025-04-01', periodEnd: '2026-03-31', filedAt: '2026-05-10', quarterForm: 'DISCRETE' },
      ],
    });
    assert.deepEqual(periodSequenceGaps(aprilMarchYear), []);
  });
});

/* ================================================================================================== *
 * SYNTHETIC ISSUERS — nobody. The CSV shape is the S4-R2 suite's, extended with quarter rows.
 * ================================================================================================== */

const GAMMA = {
  issuerId: 'IN:CIN:U74999TN2019PLC000123',
  legalName: 'Gamma Synthetic Industries Limited',
  isin: 'INE424C01018',
  securityId: 'IN:ISIN:INE424C01018',
} as const;

const COLUMNS = [
  'REVENUE_FROM_OPERATIONS', 'OTHER_INCOME', 'EMPLOYEE_BENEFIT_EXPENSE', 'OTHER_EXPENSES', 'FINANCE_COSTS',
  'DEPRECIATION_AND_AMORTISATION', 'PROFIT_BEFORE_TAX', 'TAX_EXPENSE', 'NET_PROFIT',
  'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS', 'EPS_BASIC', 'EPS_DILUTED', 'TOTAL_ASSETS', 'TOTAL_EQUITY',
  'EQUITY_ATTRIBUTABLE_TO_OWNERS', 'NON_CONTROLLING_INTEREST', 'CASH_AND_CASH_EQUIVALENTS', 'CURRENT_INVESTMENTS',
  'TRADE_RECEIVABLES', 'TRADE_PAYABLES', 'PROPERTY_PLANT_AND_EQUIPMENT', 'CAPITAL_WORK_IN_PROGRESS', 'GOODWILL',
  'INTANGIBLE_ASSETS', 'OPERATING_CASH_FLOW', 'CAPITAL_EXPENDITURE', 'INVESTING_CASH_FLOW', 'FINANCING_CASH_FLOW',
  'DIVIDENDS_PAID', 'INCOME_TAX_PAID', 'LEASE_LIABILITIES', 'LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS',
  'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'PREFERENCE_CAPITAL',
] as const;
type Column = (typeof COLUMNS)[number];

const QUARTER_COLUMNS = ['period_type', 'fiscal_year', 'period_start', 'period_end', 'statement_scope', 'taxonomy', 'basis', 'filing_ref', 'filed_at', 'source_scale', 'quarter_form', 'quarter_index'];
const HEADER = ['issuer_id', ...QUARTER_COLUMNS, ...COLUMNS].join(',');

function cells(scale = 1): Record<Column, string> {
  const n = (value: number): string => String(Math.round(value * scale));
  return {
    REVENUE_FROM_OPERATIONS: n(100000), OTHER_INCOME: n(2000), EMPLOYEE_BENEFIT_EXPENSE: n(40000),
    OTHER_EXPENSES: n(10000), FINANCE_COSTS: n(1000), DEPRECIATION_AND_AMORTISATION: n(4000),
    PROFIT_BEFORE_TAX: n(20000), TAX_EXPENSE: n(5000), NET_PROFIT: n(15000),
    NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: n(15000), EPS_BASIC: n(50), EPS_DILUTED: n(50), TOTAL_ASSETS: n(200000),
    TOTAL_EQUITY: n(120000), EQUITY_ATTRIBUTABLE_TO_OWNERS: n(118000), NON_CONTROLLING_INTEREST: n(2000),
    CASH_AND_CASH_EQUIVALENTS: n(30000), CURRENT_INVESTMENTS: n(5000), TRADE_RECEIVABLES: n(12000),
    TRADE_PAYABLES: n(8000), PROPERTY_PLANT_AND_EQUIPMENT: n(60000), CAPITAL_WORK_IN_PROGRESS: n(2000),
    GOODWILL: n(3000), INTANGIBLE_ASSETS: n(1000), OPERATING_CASH_FLOW: n(18000), CAPITAL_EXPENDITURE: n(6000),
    INVESTING_CASH_FLOW: n(-9000), FINANCING_CASH_FLOW: n(-4000), DIVIDENDS_PAID: n(3000), INCOME_TAX_PAID: n(5000),
    LEASE_LIABILITIES: n(2000), LONG_TERM_BORROWINGS: n(8000), SHORT_TERM_BORROWINGS: n(2000),
    CURRENT_MATURITIES_OF_LONG_TERM_DEBT: n(1000), PREFERENCE_CAPITAL: n(500),
  };
}

interface RowSpec {
  readonly issuerId: string;
  readonly periodType: 'ANNUAL' | 'QUARTER';
  readonly fiscalYear: number;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly periodStartUntranscribed?: boolean;
  readonly filedAt: string;
  readonly basis?: 'AS_FILED' | 'RESTATED';
  readonly quarterForm?: 'YTD' | 'DISCRETE';
  readonly quarterIndex?: number;
  readonly scale?: number;
}

function csvRow(spec: RowSpec): string {
  const values = cells(spec.scale ?? 1);
  const head = [
    spec.issuerId,
    spec.periodType,
    String(spec.fiscalYear),
    spec.periodStart,
    spec.periodEnd,
    'CONSOLIDATED',
    'INDAS',
    spec.basis ?? 'AS_FILED',
    `SYNTH-${spec.periodType}-${spec.periodEnd}${spec.basis === 'RESTATED' ? '-R' : ''}`,
    spec.filedAt,
    'CRORE',
    spec.periodType === 'QUARTER' ? (spec.quarterForm ?? 'DISCRETE') : '',
    spec.periodType === 'QUARTER' ? String(spec.quarterIndex ?? 1) : '',
  ];
  return [...head, ...COLUMNS.map((column) => values[column])].join(',');
}

function roster(): unknown {
  return {
    issuers: [
      {
        issuerId: GAMMA.issuerId,
        legalName: GAMMA.legalName,
        issuerKeyBasis: 'CIN',
        sector: 'Industrials',
        subSegment: null,
        reportingCurrency: 'INR',
        fiscalYearEnd: '03-31',
      },
    ],
    securities: [
      { securityId: GAMMA.securityId, issuerId: GAMMA.issuerId, instrumentType: 'EQUITY', status: 'ASSESSABLE', statusReason: null },
    ],
    listings: [
      {
        listingId: `IN:NSE:${GAMMA.isin}:EQ:EQUITY`,
        securityId: GAMMA.securityId,
        issuerId: GAMMA.issuerId,
        exchange: 'NSE',
        symbol: GAMMA.isin.slice(-4),
        series: 'EQ',
        instrumentType: 'EQUITY',
        effectiveFrom: '2019-06-01',
        effectiveTo: null,
      },
    ],
  };
}

function bundle(rows: readonly RowSpec[]): string {
  const dir = tempDir('s4r3-bundle-');
  writeFileSync(join(dir, 'roster.json'), JSON.stringify(roster(), null, 2));
  writeFileSync(join(dir, 'periods.csv'), [HEADER, ...rows.map(csvRow)].join('\n') + '\n');
  return dir;
}

function install(inputs: readonly string[], label: string) {
  const dir = join(tempDir(`s4r3-dataset-${label}-`), 'dataset');
  const code = ingest([...inputs.flatMap((input) => ['--input', input]), '--dataset-dir', dir, '--now', NOW]);
  return { dir, code, dataset: code === 0 ? readDataset(dir) : null };
}

function assess(
  installed: NonNullable<ReturnType<typeof install>['dataset']>,
  issuerId: string,
  identity: { rosterVersion: string; listingMapVersion: string; corporateActionTableVersion: string } = {
    rosterVersion: 'sha256:synthetic',
    listingMapVersion: 'sha256:synthetic',
    corporateActionTableVersion: 'sha256:synthetic',
  },
): CompanyAssessmentPayload {
  const issuer = installed.content.issuers.find((entry) => entry.issuerId === issuerId);
  const security = installed.content.securities.find((entry) => entry.issuerId === issuerId);
  assert.ok(issuer !== undefined && security !== undefined, `${issuerId} must be in the dataset`);
  const { payload, violations } = assessCompany({
    issuerId,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: security.securityId,
    dataset: installed.content,
    datasetVersion: installed.manifest.datasetVersion,
    contentDigest: installed.manifest.contentDigest,
    provider: installed.manifest.provider,
    identity: { bindingRef: `identity:${issuerId}`, ...identity },
    generatedAt: NOW,
    knownAsOf: CLOCK,
  });
  assert.deepEqual(violations, [], 'the synthetic assessment must satisfy the engine invariants');
  return payload;
}

/** A three-year annual history with two quarters of the current fiscal year on top. */
function annualPlusQuarters(options: { quarters?: boolean; gap?: boolean; stale?: boolean } = {}): RowSpec[] {
  const rows: RowSpec[] = [
    { issuerId: GAMMA.issuerId, periodType: 'ANNUAL', fiscalYear: 2026, periodStart: '2025-04-01', periodEnd: '2026-03-31', filedAt: '2026-05-16' },
    { issuerId: GAMMA.issuerId, periodType: 'ANNUAL', fiscalYear: 2025, periodStart: '2024-04-01', periodEnd: '2025-03-31', filedAt: '2025-05-16', scale: 0.9 },
    { issuerId: GAMMA.issuerId, periodType: 'ANNUAL', fiscalYear: 2024, periodStart: '2023-04-01', periodEnd: '2024-03-31', filedAt: '2024-05-16', scale: 0.8 },
  ];
  if (options.quarters !== false) {
    rows.push({
      issuerId: GAMMA.issuerId, periodType: 'QUARTER', fiscalYear: 2027, periodStart: '2026-04-01', periodEnd: '2026-06-30',
      filedAt: '2026-08-10', quarterForm: 'DISCRETE', quarterIndex: 1, scale: 0.3,
    });
    rows.push({
      issuerId: GAMMA.issuerId, periodType: 'QUARTER', fiscalYear: 2027, periodStart: '2026-04-01',
      periodEnd: options.gap === true ? '2026-12-31' : '2026-09-30',
      filedAt: '2026-11-02', quarterForm: 'DISCRETE', quarterIndex: options.gap === true ? 3 : 2, scale: 0.3,
    });
  }
  if (options.stale === true) {
    // Everything shifts three years back, so both limbs are outside the window.
    return rows.map((row) => ({
      ...row,
      fiscalYear: row.fiscalYear - 3,
      periodStart: `${Number(row.periodStart.slice(0, 4)) - 3}${row.periodStart.slice(4)}`,
      periodEnd: `${Number(row.periodEnd.slice(0, 4)) - 3}${row.periodEnd.slice(4)}`,
      filedAt: `${Number(row.filedAt.slice(0, 4)) - 3}${row.filedAt.slice(4)}`,
    }));
  }
  return rows;
}

describe('S4-R3 — a new issuer with quarterly data, through the real ingestion CLI', () => {
  test('is processed with no issuer-specific code, and the coverage row carries the same freshness', () => {
    const installed = install([bundle(annualPlusQuarters())], 'gamma');
    assert.equal(installed.code, 0, 'the synthetic bundle must ingest');
    const dataset = installed.dataset!;
    assert.equal(dataset.content.issuers.length, 1);
    assert.equal(dataset.manifest.coverage.annualPeriods, 3);
    assert.equal(dataset.manifest.coverage.quarterlyPeriods, 2);

    const payload = assess(dataset, GAMMA.issuerId);
    assert.equal(payload.data.series.quarterlyPeriods, 2);
    assert.equal(payload.fundamentals.annual[0]?.periodEnd, '2026-03-31');

    const series = selectSeries(dataset.content.periods, GAMMA.issuerId);
    const block = assessFreshness({ series, clock: CLOCK, windows: WINDOWS, policyVersion: FRESHNESS_POLICY_VERSION });
    assert.equal(block.valuationBasis?.periodEnd, '2026-03-31', 'the valuation basis is the annual period');
    assert.equal(block.latestReported?.periodEnd, '2026-09-30', 'the newest reported period is the quarter');
    assert.equal(block.status, 'STALE');

    /* The coverage read model reports the same decomposition, from the same module. */
    const report = buildInvestmentCoverageReport({
      asOf: CLOCK,
      generatedAt: NOW,
      manifest: dataset.manifest,
      issuers: dataset.content.issuers,
      securities: dataset.content.securities,
      periods: dataset.content.periods,
      prices: dataset.content.prices,
      operatingMetrics: dataset.content.operatingMetrics,
      issues: dataset.content.issues,
      identitySourcesAvailable: false,
    });
    const row = report.issuers.find((entry) => entry.issuerId === GAMMA.issuerId);
    assert.ok(row !== undefined);
    assert.equal(row.freshness.status, block.status);
    assert.deepEqual(row.freshness.reasons, [...block.reasons]);
    assert.equal(row.freshness.valuationBasis?.periodEnd, block.valuationBasis?.periodEnd);
    assert.equal(row.freshness.latestReported?.periodEnd, block.latestReported?.periodEnd);
    assert.equal(row.freshness.latestReported?.filedAt, block.latestReported?.filedAt);
    assert.equal(row.freshness.sequenceGapCount, 0);
    assert.equal(row.freshness.policyVersion, FRESHNESS_POLICY_VERSION);
    // The pre-existing scope-agnostic fields are untouched and still say what they said.
    assert.equal(row.latestPeriodEnd, '2026-09-30');
    assert.equal(row.quarterlyPeriods, 2);
  });

  test('the newest quarter does not make the annual basis fresh — the withholding is unchanged', () => {
    const payload = assess(install([bundle(annualPlusQuarters())], 'gamma-stale-flag').dataset!, GAMMA.issuerId);
    assert.equal(payload.asOf.dataAsOf, '2026-03-31', 'the published data-as-of is the valuation basis');
    assert.ok(payload.asOf.stalenessDays > WINDOWS.pnlDays);
    assert.equal(payload.asOf.staleBeyondPolicy, true);
    assert.ok(payload.quality.flags.some((flag) => flag.code === 'STALE_STATEMENTS'));
    assert.ok(payload.confidence.caps.includes('STALE_DATA'));
  });

  test('a missing quarter is not fabricated, and the gap is a published flag', () => {
    const installed = install([bundle(annualPlusQuarters({ gap: true }))], 'gamma-gap');
    assert.equal(installed.code, 0);
    const dataset = installed.dataset!;
    assert.equal(dataset.manifest.coverage.quarterlyPeriods, 2, 'two quarters were filed; two are stored');

    const series = selectSeries(dataset.content.periods, GAMMA.issuerId);
    const block = assessFreshness({ series, clock: CLOCK, windows: WINDOWS, policyVersion: FRESHNESS_POLICY_VERSION });
    assert.equal(block.sequenceGaps.length, 1);
    assert.deepEqual(block.sequenceGaps[0]?.missing, ['FY2027-Q2']);

    const payload = assess(dataset, GAMMA.issuerId);
    const flag = payload.quality.flags.find((entry) => entry.code === 'PERIOD_SEQUENCE_GAP');
    assert.ok(flag !== undefined, 'a gapped series must say so');
    assert.equal(flag?.severity, 'MEDIUM');
    // Nothing was interpolated: the quarter list holds exactly the two filed ends, and no Q2 appears anywhere.
    assert.deepEqual(payload.fundamentals.quarterly.map((period) => period.periodEnd), ['2026-06-30', '2026-12-31']);
    assert.equal(JSON.stringify(payload.fundamentals.quarterly).includes('2026-09-30'), false);
  });

  test('an issuer with annual-only data carries no quarterly periods and no gap', () => {
    const dataset = install([bundle(annualPlusQuarters({ quarters: false }))], 'gamma-annual').dataset!;
    const payload = assess(dataset, GAMMA.issuerId);
    assert.equal(payload.data.series.quarterlyPeriods, 0);
    assert.equal(payload.quality.flags.some((flag) => flag.code === 'PERIOD_SEQUENCE_GAP'), false);
    assert.equal(payload.asOf.dataAsOf, '2026-03-31');
  });

  test('an issuer whose every period is outside the window stays stale on both limbs', () => {
    const dataset = install([bundle(annualPlusQuarters({ stale: true }))], 'gamma-stale').dataset!;
    const series = selectSeries(dataset.content.periods, GAMMA.issuerId);
    const block = assessFreshness({ series, clock: CLOCK, windows: WINDOWS, policyVersion: FRESHNESS_POLICY_VERSION });
    assert.equal(block.status, 'STALE');
    assert.equal(block.valuationBasis?.withinPnlWindow, false);
    assert.equal(block.latestReported?.withinPnlWindow, false);
    const payload = assess(dataset, GAMMA.issuerId);
    assert.equal(payload.asOf.staleBeyondPolicy, true);
  });

  test('a revised filing keeps the as-filed period beside it, and the series prefers the restatement', () => {
    const rows: RowSpec[] = [
      ...annualPlusQuarters({ quarters: false }),
      // The same period end, restated: a new filing, a different basis, both retained.
      { issuerId: GAMMA.issuerId, periodType: 'ANNUAL', fiscalYear: 2026, periodStart: '2025-04-01', periodEnd: '2026-03-31', filedAt: '2026-09-30', basis: 'RESTATED', scale: 1.1 },
    ];
    const dataset = install([bundle(rows)], 'gamma-restated').dataset!;
    const periodAtRestatedEnd = dataset.content.periods.filter(
      (period) =>
        period.issuerId === GAMMA.issuerId && period.period.periodEnd === '2026-03-31' && period.period.periodType === 'ANNUAL',
    );
    assert.equal(periodAtRestatedEnd.length, 2, 'as filed and restated are both kept');
    assert.deepEqual(periodAtRestatedEnd.map((period) => period.basis).sort(), ['AS_FILED', 'RESTATED']);

    const series = selectSeries(dataset.content.periods, GAMMA.issuerId);
    assert.equal(series.annual[0]?.basis, 'RESTATED', 'the restatement is the comparable series');
    const block = assessFreshness({ series, clock: CLOCK, windows: WINDOWS, policyVersion: FRESHNESS_POLICY_VERSION });
    assert.equal(block.valuationBasis?.basis, 'RESTATED');
    assert.equal(block.valuationBasis?.filedAt, '2026-09-30', 'the publication date of the figure in use');

    const payload = assess(dataset, GAMMA.issuerId);
    assert.ok(payload.data.restatements.length > 0, 'the as-filed figure stays disclosed');
    assert.equal(payload.data.restatements[0]?.periodEnd, '2026-03-31');
  });

  test('a quarter whose fiscal year contradicts its own period end is refused before publication', () => {
    const rows = annualPlusQuarters().map((row) =>
      row.periodType === 'QUARTER' && row.periodEnd === '2026-09-30' ? { ...row, fiscalYear: 2029 } : row,
    );
    const installed = install([bundle(rows)], 'gamma-bad-fy');
    assert.equal(installed.code, 1, 'a contradictory fiscal year must not be published');
    assert.equal(installed.dataset, null);
  });
});

/* ================================================================================================== *
 * The real population — what the capability says about the issuers that actually exist.
 * ================================================================================================== */

const ADMITTED_S4R3_INPUTS = [
  join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06', 'ingest-input'),
  join(EVIDENCE, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'marico'),
  join(EVIDENCE, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'kec'),
];

const INFOSYS = 'IN:CIN:L85110KA1981PLC013115';
const MARICO = 'IN:CIN:L15140MH1988PLC049208';
const KEC = 'IN:CIN:L45200MH2005PLC152061';

describe('S4-R3 — the admitted population, measured', () => {
  test('the O3-admitted S4-R3 candidate reproduces its recorded digest', () => {
    const installed = install(ADMITTED_S4R3_INPUTS, 's4r3-admitted');
    assert.equal(installed.code, 0);
    assert.equal(
      installed.dataset!.manifest.datasetVersion,
      'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b',
      'the candidate the O3 re-admission binds must still be the one these inputs produce',
    );
    assert.equal(installed.dataset!.manifest.coverage.quarterlyPeriods, 2);
  });

  test('per-issuer freshness on the admitted candidate: a fresh quarter beside a stale annual basis', () => {
    const dataset = install(ADMITTED_S4R3_INPUTS, 's4r3-freshness').dataset!;
    const facts = Object.fromEntries(
      [INFOSYS, MARICO, KEC].map((issuerId) => {
        const series = selectSeries(dataset.content.periods, issuerId);
        const block = assessFreshness({ series, clock: CLOCK, windows: WINDOWS, policyVersion: FRESHNESS_POLICY_VERSION });
        return [
          issuerId,
          {
            status: block.status,
            basis: [block.valuationBasis?.periodType, block.valuationBasis?.periodEnd, block.valuationBasis?.daysSincePeriodEnd],
            latest: [block.latestReported?.periodType, block.latestReported?.periodEnd, block.latestReported?.daysSincePeriodEnd],
            gaps: block.sequenceGaps.length,
          },
        ];
      }),
    );
    // Infosys: the Stage 3 bundle, unchanged, and still the oldest series in the population.
    assert.deepEqual(facts[INFOSYS], { status: 'STALE', basis: ['ANNUAL', '2024-03-31', 958], latest: ['ANNUAL', '2024-03-31', 958], gaps: 0 });
    // Marico: refreshed to FY2026, still beyond the 200-day window at this clock.
    assert.deepEqual(facts[MARICO], { status: 'STALE', basis: ['ANNUAL', '2026-03-31', 228], latest: ['ANNUAL', '2026-03-31', 228], gaps: 0 });
    // KEC: two quarters since the annual period — the newest information is 43 days old and the basis is 228.
    assert.deepEqual(facts[KEC], { status: 'STALE', basis: ['ANNUAL', '2026-03-31', 228], latest: ['QUARTER', '2026-09-30', 45], gaps: 0 });
    for (const issuerId of [INFOSYS, MARICO, KEC]) assert.equal(facts[issuerId]?.gaps, 0, `${issuerId} has no sequence gap`);
  });

  test('the freshness refactor does not move a byte of the S4-R2 assessment payload', () => {
    /*
     * The engine now takes `dataAsOf`, `stalenessDays` and `staleBeyondPolicy` from `assessFreshness` instead of
     * computing them inline. For a series with an annual period the arithmetic is the same, so the recorded S4-R2
     * payload must reproduce exactly — this is the regression control for the refactor itself.
     */
    const installed = install(
      [
        join(EVIDENCE, 'S4-R2-INFOSYS-BORROWINGS-2026-11-17', 'ingest-input'),
        join(EVIDENCE, 'WI7-CONSUMER-MARICO-2026-11-07', 'ingest-input'),
        join(EVIDENCE, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input'),
      ],
      's4r2-regression',
    ).dataset!;
    assert.equal(installed.manifest.datasetVersion, 'sha256:69bbc14e99cea0e24be568fa923971e7c0536009ab19056f09bf272d437c6fe2');
    // The identity block is part of the payload, so the recorded digest is reproducible only with the same one.
    const payload = assess(installed, INFOSYS, {
      rosterVersion: 'sha256:admitted',
      listingMapVersion: 'sha256:admitted',
      corporateActionTableVersion: 'sha256:admitted',
    });
    const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    assert.equal(
      digest,
      '925b403622c9b667152effa64539036a8cbcea40229ef2b36c7f148c210e471e',
      'the payload recorded by S4-R2 must still be the payload this code produces',
    );
  });

  test('the real bundles are read, never written: the admitted inputs still hash as recorded', () => {
    const sha = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex');
    assert.equal(sha(join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06', 'ingest-input', 'periods.csv')),
      'e2cdba2042a55fc3352e85b8384e014f669e1472deb9011e7be2babd4fbc745c');
    assert.equal(sha(join(EVIDENCE, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'kec', 'periods.csv')),
      'ff6e62fde3ec80143a759d2200cdd0f8fae64fc7113b9cb1da691b2baa37e46b');
    assert.equal(sha(join(EVIDENCE, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'marico', 'periods.csv')),
      'df2e1d7182b9aa9d50ab2907342dc2f17330a1ac13fec5ad96a44fff68e41669');
  });
});
