/**
 * D-2 — nil-by-disclosure semantics.
 *
 * The defect: a filer that presents no borrowings line at all was spelled exactly like a filer whose filing
 * could not be read (`MISSING: NOT_REPORTED`), so a debt-free issuer had no way into a debt position except an
 * invented zero — which was refused, correctly. These tests pin the six states, the one aggregation that admits
 * a declared nil, and the guarantee that nothing else turns absence into zero.
 *
 * The counter-tests required by the work item are marked `[required]`.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { assessCompany } from '../../src/investment/assessment/engine';
import type { CapitalStructure } from '../../src/investment/assessment/types';
import { checkObservation } from '../../src/investment/contracts/invariants';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import {
  isPresent,
  missing,
  nilByDisclosure,
  notComputable,
  present,
  type NumericObservation,
  type Observation,
} from '../../src/investment/contracts/observation';
import { deriveLineItems } from '../../src/investment/fundamentals/derive';
import type { NormalizedPeriod } from '../../src/investment/fundamentals/types';
import { buildDatasetContent, hasQuotedWording, parseNilCell } from '../../src/investment/ingestion/builder';
import { parseCsv } from '../../src/investment/ingestion/csv';
import { TECH_ANNUAL, TECH_ISSUER, annualPeriod, techAssessmentInput, techDataset } from './assessmentFixtures';
import { referenceInputs } from './fixtures';

const M = 1_000_000;
const LATEST = '2026-03-31';
const FILING = { kind: 'FILING' as const, ref: 'FIL-TECH-FY26', filedAt: '2026-05-20' };

/* ------------------------------------------------------------------ helpers */

/**
 * A synthetic declared nil. The `statement` is the filer's wording, which the contract now requires: a fixture can
 * invent one, a filing cannot. Nothing here is evidence about any real company.
 */
const nil = (
  periodEnd = LATEST,
  statement = 'the filer states that it has no borrowings at the reporting date',
): NumericObservation => nilByDisclosure(FILING, { periodEnd, statement });

/**
 * The technology fixture with values overridden (`undefined` deletes an item). `scope: 'newest'` touches only the
 * latest period; `scope: 'all'` touches every period, which is how "this item is nowhere in the dataset" has to be
 * expressed — a component that merely moves to an older period is a period mismatch, not an absence.
 */
function techPeriods(
  overrides: Partial<Record<LineItemId, NumericObservation>>,
  scope: 'newest' | 'all' = 'newest',
): NormalizedPeriod[] {
  return TECH_ANNUAL.map((spec) => {
    const base = annualPeriod(TECH_ISSUER, spec);
    if (scope === 'newest' && spec.periodEnd !== LATEST) return base;
    const values: Partial<Record<LineItemId, NumericObservation>> = { ...base.values };
    for (const [id, observation] of Object.entries(overrides) as [LineItemId, NumericObservation | undefined][]) {
      if (observation === undefined) delete values[id];
      else values[id] = observation;
    }
    return { ...base, values, derived: deriveLineItems(values, spec.periodEnd).values };
  });
}

const DEBT: readonly LineItemId[] = [
  'SHORT_TERM_BORROWINGS',
  'CURRENT_MATURITIES_OF_LONG_TERM_DEBT',
  'LONG_TERM_BORROWINGS',
  'LEASE_LIABILITIES',
];

function capitalOf(periods: readonly NormalizedPeriod[]): CapitalStructure {
  const { payload } = assessCompany(techAssessmentInput({ dataset: techDataset({ periods }) }));
  return payload.fundamentals.capitalStructure;
}

function payloadOf(periods: readonly NormalizedPeriod[]) {
  return assessCompany(techAssessmentInput({ dataset: techDataset({ periods }) })).payload;
}

/** Minimal periods CSV: the metadata columns plus the line items these tests exercise. */
const PERIOD_COLUMNS = [
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
  'REVENUE_FROM_OPERATIONS',
  'SHORT_TERM_BORROWINGS',
  'CURRENT_MATURITIES_OF_LONG_TERM_DEBT',
  'LONG_TERM_BORROWINGS',
  'LEASE_LIABILITIES',
  'CASH_AND_CASH_EQUIVALENTS',
  'NET_DEBT',
];

/** Quote only where the grammar needs it, so a nil declaration carrying prose survives the round trip. */
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function periodRow(cells: Record<string, string>): string {
  const base: Record<string, string> = {
    issuer_id: TECH_ISSUER,
    period_type: 'ANNUAL',
    fiscal_year: '2026',
    period_start: '2025-04-01',
    period_end: LATEST,
    statement_scope: 'CONSOLIDATED',
    taxonomy: 'in-fin/1.0.0',
    basis: 'AS_FILED',
    filing_ref: 'FIL-TECH-FY26',
    filed_at: '2026-05-20',
    source_scale: 'CRORE',
    REVENUE_FROM_OPERATIONS: '14600',
    SHORT_TERM_BORROWINGS: '380',
    CURRENT_MATURITIES_OF_LONG_TERM_DEBT: '0',
    LONG_TERM_BORROWINGS: '900',
    LEASE_LIABILITIES: '260',
    CASH_AND_CASH_EQUIVALENTS: '2100',
  };
  const merged = { ...base, ...cells };
  return PERIOD_COLUMNS.map((column) => csvCell(merged[column] ?? '')).join(',');
}

/** The row under test names its own issuer, so the reference roster is replaced rather than supplemented. */
function csvInputs(issuerId: string, legalName: string, text: string) {
  return referenceInputs({
    issuers: [
      {
        issuerId,
        legalName,
        issuerKeyBasis: 'CIN',
        sector: 'Technology',
        subSegment: null,
        reportingCurrency: 'INR',
        fiscalYearEnd: '03-31',
      },
    ],
    securities: [],
    listings: [],
    corporateActions: [],
    prices: [],
    // The reference XBRL instance and its operating metrics belong to another issuer; keeping them would put a
    // second, unrelated period in front of the row under test.
    xbrlFiles: [],
    operatingMetricsCsv: null,
    periodCsv: { name: 'periods.csv', text },
  });
}

function builtFromRows(rows: readonly string[]) {
  return buildDatasetContent(
    csvInputs(TECH_ISSUER, 'Aarav Systems Limited', `${PERIOD_COLUMNS.join(',')}\n${rows.join('\n')}\n`),
  );
}


/* ---------------------------------------------------------------------- A */

describe('A — the six states are distinguishable, and a nil cannot exist without provenance', () => {
  test('a declared nil carries no value, a positive reason, its source and its period', () => {
    const observation = nil(LATEST, 'the Group has no borrowings as at March 31, 2026');
    assert.equal(observation.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(observation.reason, 'DECLARED_NIL_IN_SOURCE');
    assert.equal(observation.value, null);
    assert.equal(isPresent(observation), false, 'a nil is never a value');
    assert.equal(observation.source?.ref, 'FIL-TECH-FY26');
    assert.equal(observation.periodEnd, LATEST);
    assert.equal(observation.note, 'the Group has no borrowings as at March 31, 2026', 'the filer wording travels with it');
    assert.deepEqual(checkObservation(observation, 'test'), [], 'INV-7 is satisfied by construction');
  });

  test('a reported zero and a declared nil are different claims and stay distinguishable', () => {
    const reportedZero = present(0, FILING, { periodEnd: LATEST });
    const declaredNil = nil();
    assert.equal(reportedZero.presence, 'PRESENT');
    assert.equal(reportedZero.value, 0);
    assert.equal(declaredNil.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(declaredNil.value, null);
    assert.notEqual(reportedZero.presence, declaredNil.presence);
    assert.equal(reportedZero.reason, undefined, 'a reported zero needs no reason');
    assert.equal(declaredNil.reason, 'DECLARED_NIL_IN_SOURCE');
  });

  test('the three absentee states keep their own spelling', () => {
    const states: Array<[string, Observation<number>]> = [
      ['NOT_REPORTED', missing('NOT_REPORTED')],
      ['SOURCE_UNAVAILABLE', missing('FILING_UNAVAILABLE')],
      ['UNMAPPED', missing('NOT_TAGGED_IN_FILING')],
      ['NOT_COMPUTABLE', notComputable('INSUFFICIENT_HISTORY')],
      ['NIL_BY_DISCLOSURE', nil()],
    ];
    for (const [label, observation] of states) {
      assert.equal(isPresent(observation), false, `${label} must not be present`);
      assert.equal(observation.value, null, `${label} must carry no value`);
    }
    const spellings = new Set(states.map(([, observation]) => `${observation.presence}:${observation.reason ?? ''}`));
    assert.equal(spellings.size, states.length, 'no two states share a spelling');
  });

  test('a nil without a period end, with no source, or with no quoted wording is refused at construction (INV-7)', () => {
    assert.throws(
      () => nilByDisclosure({ kind: 'FILING', ref: '  ' }, { periodEnd: LATEST, statement: 'nil' }),
      /source reference/,
    );
    assert.throws(() => nilByDisclosure(FILING, { periodEnd: '   ', statement: 'nil' }), /reporting period end/);
    assert.throws(
      () => nilByDisclosure(FILING, { periodEnd: LATEST, statement: '   ' }),
      /source wording/,
      'an omitted line has no wording to quote, so it cannot be a nil',
    );
  });

  test('the invariant checker rejects a hand-built nil that has lost its provenance', () => {
    const broken = {
      value: null,
      presence: 'NIL_BY_DISCLOSURE',
      reason: 'NOT_REPORTED',
    } as unknown as Observation<number>;
    const violations = checkObservation(broken, 'components.longTermBorrowings');
    assert.equal(
      violations.filter((violation) => violation.invariant === 'INV-7').length,
      4,
      'no source, no period, no quoted wording, and the wrong reason',
    );
  });
});

/* ---------------------------------------------------------------------- B */

describe('B — the operator input path keeps NIL, blank and 0 apart', () => {
  test('the cell grammar accepts NIL and NIL: <what the filing says>, and nothing looser', () => {
    assert.deepEqual(parseNilCell('NIL'), { isNil: true });
    assert.deepEqual(parseNilCell('  nil  '), { isNil: true });
    assert.deepEqual(parseNilCell('NIL: no borrowings line'), { isNil: true, note: 'no borrowings line' });
    assert.deepEqual(parseNilCell('NIL:'), { isNil: true });
    for (const rejected of ['', '0', 'NILP', 'NIL BY POLICY', 'n.a.']) {
      assert.equal(parseNilCell(rejected).isNil, false, `"${rejected}" must not be read as a nil`);
    }
    // The prefix alone is never enough: the wording is what makes the cell usable.
    assert.equal(hasQuotedWording(parseNilCell('NIL')), false);
    assert.equal(hasQuotedWording(parseNilCell('NIL:   ')), false);
    assert.equal(hasQuotedWording(parseNilCell('NIL: the Group has no borrowings')), true);
  });

  test('NIL becomes a provenance-bearing nil; blank stays NOT_REPORTED; 0 stays a reported zero', () => {
    const dataset = builtFromRows([
      periodRow({
        LONG_TERM_BORROWINGS: 'NIL: the balance sheet presents no long-term borrowings',
        SHORT_TERM_BORROWINGS: '',
        CURRENT_MATURITIES_OF_LONG_TERM_DEBT: '0',
      }),
    ]);
    const values = dataset.periods[0]!.values;
    const longTerm = values.LONG_TERM_BORROWINGS!;
    assert.equal(longTerm.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(longTerm.reason, 'DECLARED_NIL_IN_SOURCE');
    assert.equal(longTerm.value, null);
    assert.equal(longTerm.filingRef, 'FIL-TECH-FY26');
    assert.equal(longTerm.note, 'the balance sheet presents no long-term borrowings', 'the filer wording travels with it');
    assert.equal(values.SHORT_TERM_BORROWINGS!.presence, 'MISSING');
    assert.equal(values.SHORT_TERM_BORROWINGS!.reason, 'NOT_REPORTED');
    assert.equal(values.CURRENT_MATURITIES_OF_LONG_TERM_DEBT!.presence, 'PRESENT');
    assert.equal(values.CURRENT_MATURITIES_OF_LONG_TERM_DEBT!.value, 0);
  });

  test('[required] a nil cell with no quoted filing wording is refused, so an omitted line cannot become a nil', () => {
    for (const bare of ['NIL', 'NIL:']) {
      const dataset = builtFromRows([periodRow({ LONG_TERM_BORROWINGS: bare })]);
      assert.ok(
        dataset.issues.some((issue) => issue.code === 'NIL_WITHOUT_QUOTED_WORDING' && issue.severity === 'ERROR'),
        `"${bare}" must be an ingestion error`,
      );
      assert.equal(
        dataset.periods[0]!.values.LONG_TERM_BORROWINGS?.presence,
        'MISSING',
        'the cell degrades to not-reported; it never becomes a declared nil',
      );
      assert.equal(dataset.periods[0]!.values.LONG_TERM_BORROWINGS?.reason, 'NOT_REPORTED');
    }
  });

  test('a nil on a derived item is an error, not a value', () => {
    const dataset = builtFromRows([periodRow({ NET_DEBT: 'NIL: the Group presents no net debt' })]);
    assert.ok(dataset.issues.some((issue) => issue.code === 'NIL_ON_DERIVED_ITEM' && issue.severity === 'ERROR'));
    assert.notEqual(dataset.periods[0]!.values.NET_DEBT?.presence, 'NIL_BY_DISCLOSURE');
  });

  test('a nil with no filing reference is refused rather than accepted without provenance', () => {
    const dataset = builtFromRows([
      periodRow({ filing_ref: '', LONG_TERM_BORROWINGS: 'NIL: the Group presents no long-term borrowings' }),
    ]);
    assert.ok(dataset.issues.some((issue) => issue.code === 'NIL_WITHOUT_PROVENANCE'));
    assert.equal(dataset.periods[0]!.values.LONG_TERM_BORROWINGS?.presence, 'MISSING');
  });

  test('[required] a row that both reports and declares nil for the same item is an error, and neither is used', () => {
    const dataset = builtFromRows([
      periodRow({ LONG_TERM_BORROWINGS: 'NIL: the Group presents no long-term borrowings' }),
      periodRow({ LONG_TERM_BORROWINGS: '900' }),
    ]);
    assert.ok(dataset.issues.some((issue) => issue.code === 'CONFLICTING_OBSERVATION' && issue.severity === 'ERROR'));
    for (const period of dataset.periods) {
      const observation = period.values.LONG_TERM_BORROWINGS!;
      assert.equal(observation.presence, 'NOT_COMPUTABLE', 'the surviving row never wins');
      assert.equal(observation.reason, 'SOURCE_CONFLICT_UNRESOLVED');
      assert.equal(observation.value, null);
    }
  });

  test('a conflicting dataset blocks the debt position instead of resolving it', () => {
    const dataset = builtFromRows([
      periodRow({ LONG_TERM_BORROWINGS: 'NIL: the Group presents no long-term borrowings' }),
      periodRow({ LONG_TERM_BORROWINGS: '900' }),
    ]);
    const { payload } = assessCompany(
      techAssessmentInput({ dataset: techDataset({ periods: dataset.periods }) }),
    );
    const capital = payload.fundamentals.capitalStructure;
    assert.equal(capital.grossDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(capital.grossDebt.reason, 'SOURCE_CONFLICT_UNRESOLVED');
    assert.equal(capital.netDebt.presence, 'NOT_COMPUTABLE');
  });
});

/* ---------------------------------------------------------------------- C */

describe('C — the four debt components aggregate under one stated permission', () => {
  test('[required] all four declared nil establishes a complete, zero gross debt with provenance', () => {
    const overrides = Object.fromEntries(DEBT.map((id) => [id, nil()])) as Partial<Record<LineItemId, NumericObservation>>;
    const capital = capitalOf(techPeriods(overrides));
    assert.equal(capital.grossDebt.presence, 'PRESENT');
    assert.equal(capital.grossDebt.value, 0);
    assert.match(capital.grossDebt.note ?? '', /declared nil/i);
    for (const id of DEBT) {
      const name = {
        SHORT_TERM_BORROWINGS: 'shortTermBorrowings',
        CURRENT_MATURITIES_OF_LONG_TERM_DEBT: 'currentMaturities',
        LONG_TERM_BORROWINGS: 'longTermBorrowings',
        LEASE_LIABILITIES: 'leaseLiabilities',
      }[id]!;
      assert.equal(capital.components[name]!.presence, 'NIL_BY_DISCLOSURE', 'the nil observation is not rewritten');
      assert.equal(capital.components[name]!.source?.ref, 'FIL-TECH-FY26');
      assert.equal(capital.components[name]!.periodEnd, LATEST);
    }
    assert.equal(capital.netDebt.presence, 'PRESENT');
    assert.equal(capital.netDebt.value, -(2_100 * M + 600 * M), 'net debt is minus the cash and investments');
  });

  test('[required] four reported zeros are not nils: the aggregate is the same number from different claims', () => {
    const zero = present(0, FILING, { periodEnd: LATEST });
    const overrides = Object.fromEntries(DEBT.map((id) => [id, zero])) as Partial<Record<LineItemId, NumericObservation>>;
    const capital = capitalOf(techPeriods(overrides));
    assert.equal(capital.grossDebt.presence, 'PRESENT');
    assert.equal(capital.grossDebt.value, 0);
    assert.equal(capital.grossDebt.note, undefined, 'nothing was declared nil, so nothing is named');
    assert.equal(capital.components.longTermBorrowings!.presence, 'PRESENT');
  });

  test('[required] a debt-bearing issuer is unchanged: reported borrowings aggregate exactly as before', () => {
    const capital = capitalOf(TECH_ANNUAL.map((spec) => annualPeriod(TECH_ISSUER, spec)));
    assert.equal(capital.grossDebt.presence, 'PRESENT');
    assert.equal(capital.grossDebt.value, 1_540 * M, '380 + 0 + 900 + 260 million');
    assert.equal(capital.netDebt.presence, 'PRESENT');
    assert.equal(capital.netDebt.value, -1_160 * M);
    assert.equal(capital.grossDebt.note, undefined);
    assert.ok(DEBT.every((id) => capital.components[
      {
        SHORT_TERM_BORROWINGS: 'shortTermBorrowings',
        CURRENT_MATURITIES_OF_LONG_TERM_DEBT: 'currentMaturities',
        LONG_TERM_BORROWINGS: 'longTermBorrowings',
        LEASE_LIABILITIES: 'leaseLiabilities',
      }[id]!
    ]!.presence === 'PRESENT'), 'no component was re-spelled as nil for a filer that reports them');
  });

  test('[required] mixed positive and nil components aggregate, and only the nil ones are named', () => {
    const capital = capitalOf(techPeriods({ SHORT_TERM_BORROWINGS: nil(), LEASE_LIABILITIES: nil() }));
    assert.equal(capital.grossDebt.presence, 'PRESENT');
    assert.equal(capital.grossDebt.value, 900 * M, 'long-term borrowings only');
    assert.match(capital.grossDebt.note ?? '', /shortTermBorrowings/);
    assert.match(capital.grossDebt.note ?? '', /leaseLiabilities/);
    assert.doesNotMatch(capital.grossDebt.note ?? '', /longTermBorrowings/);
  });

  test('[required] one component not reported still blocks the debt position', () => {
    const capital = capitalOf(techPeriods({ LONG_TERM_BORROWINGS: undefined }, 'all'));
    assert.equal(capital.grossDebt.presence, 'MISSING');
    assert.equal(capital.grossDebt.reason, 'NOT_REPORTED');
    assert.equal(capital.netDebt.presence, 'MISSING');
  });

  test('[required] one component whose source is unavailable still blocks the debt position', () => {
    const capital = capitalOf(techPeriods({ LONG_TERM_BORROWINGS: missing('FILING_UNAVAILABLE') }, 'all'));
    assert.equal(capital.grossDebt.presence, 'MISSING');
    assert.equal(capital.grossDebt.reason, 'FILING_UNAVAILABLE', 'the real reason survives, not NOT_REPORTED');
    assert.equal(capital.components.longTermBorrowings!.reason, 'FILING_UNAVAILABLE');
  });

  test('[required] one unmapped component still blocks the debt position', () => {
    const capital = capitalOf(techPeriods({ CURRENT_MATURITIES_OF_LONG_TERM_DEBT: missing('NOT_TAGGED_IN_FILING') }, 'all'));
    assert.equal(capital.grossDebt.presence, 'MISSING');
    assert.equal(capital.grossDebt.reason, 'NOT_TAGGED_IN_FILING');
  });

  test('[required] a conflicting disclosure blocks the debt position instead of being resolved', () => {
    const capital = capitalOf(
      techPeriods({ SHORT_TERM_BORROWINGS: notComputable('SOURCE_CONFLICT_UNRESOLVED') }, 'all'),
    );
    assert.equal(capital.grossDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(capital.grossDebt.reason, 'SOURCE_CONFLICT_UNRESOLVED');
  });

  test('[required] components from different reporting periods are refused, never summed silently', () => {
    // Leases disappear from the newest period, so they resolve to FY2025 while the borrowings resolve to FY2026.
    const capital = capitalOf(techPeriods({ LEASE_LIABILITIES: undefined }));
    assert.equal(capital.grossDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(capital.grossDebt.reason, 'PERIOD_MISMATCH');
    assert.match(capital.grossDebt.note ?? '', /different period ends/);
    assert.equal(capital.components.leaseLiabilities!.periodEnd, '2025-03-31');
    assert.equal(capital.netDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(capital.netDebt.reason, 'PERIOD_MISMATCH');
  });
});

/* ---------------------------------------------------------------------- D */

describe('D — downstream calculations consume the aggregate only when it is qualified', () => {
  const debtFree = (): NormalizedPeriod[] =>
    techPeriods(
      Object.fromEntries(DEBT.map((id) => [id, nil()])) as Partial<Record<LineItemId, NumericObservation>>,
    );

  test('[required] a debt-free issuer now reaches the enterprise-to-equity bridge and per-share values', () => {
    const payload = payloadOf(debtFree());
    const method = (id: string) => payload.valuation.methods.find((entry) => entry.methodId === id)!;
    assert.equal(method('DCF_FCFF').applicable, true);
    assert.equal(method('EV_EBITDA').applicable, true);
    assert.equal(method('DCF_FCFF').output?.perShareMid.presence, 'PRESENT');
    assert.equal(method('EV_EBITDA').output?.perShareMid.presence, 'PRESENT');
    assert.notEqual(payload.valuation.intrinsic, null, 'an intrinsic range exists once the bridge resolves');
    assert.equal(payload.valuation.intrinsic!.perShare.mid.presence, 'PRESENT');
  });

  test('the declared-nil debt is disclosed in the payload prose, with its consequence', () => {
    const payload = payloadOf(debtFree());
    const line = payload.limitations.find((entry) => /declared nil/i.test(entry));
    assert.ok(line, 'the permission is stated where a reader will see it');
    assert.match(line!, /shortTermBorrowings|longTermBorrowings|leaseLiabilities/);
    assert.match(line!, /still block/);
  });

  test('moat, leverage and dividend cover consume the resolved block rather than a partial bridge', () => {
    const payload = payloadOf(debtFree());
    assert.notEqual(payload.moat.classification, 'INSUFFICIENT_EVIDENCE');
    assert.equal(payload.moat.roicWaccSpread.spread.presence, 'PRESENT');
    assert.equal(payload.dividends.netDebtToEbitda.presence, 'PRESENT');
  });

  test('[required] an unreported component keeps every dependent calculation unavailable', () => {
    const payload = payloadOf(techPeriods({ LONG_TERM_BORROWINGS: undefined }, 'all'));
    const dcf = payload.valuation.methods.find((entry) => entry.methodId === 'DCF_FCFF')!;
    assert.notEqual(dcf.output?.perShareMid.presence, 'PRESENT');
    assert.equal(payload.valuation.intrinsic, null);
    assert.notEqual(payload.moat.roicWaccSpread.spread.presence, 'PRESENT');
  });

  test('[required] a period mismatch withholds rather than blending two balance sheets', () => {
    const payload = payloadOf(techPeriods({ LEASE_LIABILITIES: undefined }));
    const dcf = payload.valuation.methods.find((entry) => entry.methodId === 'DCF_FCFF')!;
    assert.equal(dcf.output?.perShareMid.presence, 'NOT_COMPUTABLE');
    assert.equal(payload.valuation.intrinsic, null);
    assert.ok(payload.limitations.some((entry) => /Net debt could not be derived \(PERIOD_MISMATCH\)/.test(entry)));
  });
});

/* ---------------------------------------------------------------------- E */
describe('E — the Work Item 1 filing states nothing about borrowings, so the components stay NOT_REPORTED', () => {
  const evidenceDir = join(process.cwd(), '..', 'evidence', 'real-issuer', 'REL-1-INFOSYS-2026-11-06');
  const periodCsvText = (): string => readFileSync(join(evidenceDir, 'ingest-input', 'periods.csv'), 'utf8');
  const BORROWINGS: readonly LineItemId[] = [
    'SHORT_TERM_BORROWINGS',
    'CURRENT_MATURITIES_OF_LONG_TERM_DEBT',
    'LONG_TERM_BORROWINGS',
  ];

  /** Append columns carrying `cell` for every row. Used to show what a declaration would or would not do. */
  function withColumns(header: readonly string[], rows: readonly (readonly string[])[], columns: readonly string[], cell: string) {
    const added = columns.filter((column) => !header.includes(column));
    const fullHeader = [...header, ...added];
    const body = rows.map((row) => [...row, ...added.map(() => cell)].map(csvCell).join(','));
    return `${fullHeader.map(csvCell).join(',')}\n${body.join('\n')}\n`;
  }

  function built(text: string) {
    return buildDatasetContent(csvInputs('IN:CIN:L85110KA1981PLC013115', 'Infosys Limited', text));
  }

  const capitalOfDataset = (periods: readonly NormalizedPeriod[]) => {
    const { payload } = assessCompany(
      techAssessmentInput({
        issuerId: 'IN:CIN:L85110KA1981PLC013115',
        legalName: 'Infosys Limited',
        securityId: 'IN:ISIN:INE009A01021',
        dataset: techDataset({ periods: [...periods], prices: [], corporateActions: [], metrics: [] }),
      }),
    );
    return payload.fundamentals.capitalStructure;
  };

  test('[required] the filed facts are expressible without an inferred zero: borrowings are NOT_REPORTED, leases are reported', () => {
    const dataset = built(periodCsvText());
    assert.deepEqual(
      dataset.issues.filter((issue) => issue.severity === 'ERROR'),
      [],
      'the Work Item 1 input is unchanged and ingests cleanly',
    );
    const capital = capitalOfDataset(dataset.periods);

    assert.equal(capital.leaseTreatment, 'IND_AS_116_CAPITALISED');
    assert.equal(capital.components.leaseLiabilities!.presence, 'PRESENT');
    assert.equal(capital.components.leaseLiabilities!.value, 83_590_000_000, '8,359 crore of Ind AS 116 lease liabilities');

    for (const name of ['shortTermBorrowings', 'currentMaturities', 'longTermBorrowings', 'preferenceCapital'] as const) {
      const observation = capital.components[name]!;
      assert.equal(observation.presence, 'MISSING', `${name}: an omitted line is not a declaration`);
      assert.equal(observation.reason, 'NOT_REPORTED', `${name}: the filing never says the item is nil`);
      assert.equal(observation.value, null, `${name}: and it is certainly not a zero`);
    }

    assert.equal(capital.grossDebt.presence, 'MISSING');
    assert.equal(capital.grossDebt.reason, 'NOT_REPORTED', 'gross debt stays blocked, exactly as before D-2');
    assert.equal(capital.netDebt.presence, 'MISSING');
    assert.equal(capital.netDebt.reason, 'NOT_REPORTED');

    const dcf = payloadOf([...dataset.periods]).valuation.methods.find((entry) => entry.methodId === 'DCF_FCFF')!;
    assert.notEqual(dcf.output?.perShareMid.presence, 'PRESENT', 'the bridge stays blocked for want of a filed debt position');
    assert.equal(payloadOf([...dataset.periods]).valuation.intrinsic, null);
  });

  test('[required] the filing cannot be upgraded to a nil by typing NIL: an unquoted declaration is rejected', () => {
    const table = parseCsv(periodCsvText());
    const text = withColumns(table.header, table.rows, BORROWINGS, 'NIL');
    const dataset = built(text);

    const refusals = dataset.issues.filter((issue) => issue.code === 'NIL_WITHOUT_QUOTED_WORDING');
    assert.equal(refusals.length, BORROWINGS.length * dataset.periods.length, 'every bare NIL cell is an error');
    for (const period of dataset.periods) {
      for (const id of BORROWINGS) {
        assert.equal(period.values[id]?.presence, 'MISSING');
        assert.equal(period.values[id]?.reason, 'NOT_REPORTED');
      }
    }
    assert.equal(capitalOfDataset(dataset.periods).grossDebt.reason, 'NOT_REPORTED');
  });

  test('the difference is a quoted statement, not an absent line: only an asserted nil produces the lease-only gross debt', () => {
    // This is a mechanism demonstration on the same facts, NOT a claim about the filing: the wording below does not
    // appear anywhere in the FY24 consolidated statements, which is exactly why the filed classification is
    // NOT_REPORTED.
    const table = parseCsv(periodCsvText());
    const text = withColumns(table.header, table.rows, BORROWINGS, 'NIL: the Group has no borrowings (demonstration only)');
    const dataset = built(text);

    assert.deepEqual(dataset.issues.filter((issue) => issue.severity === 'ERROR'), []);
    const capital = capitalOfDataset(dataset.periods);
    assert.equal(capital.grossDebt.presence, 'PRESENT');
    assert.equal(capital.grossDebt.value, 83_590_000_000, 'three nil components contribute zero; leases are the whole total');
    assert.match(capital.grossDebt.note ?? '', /shortTermBorrowings, currentMaturities, longTermBorrowings/);
    assert.doesNotMatch(capital.grossDebt.note ?? '', /leaseLiabilities/, 'the reported lease line is not a nil');
  });
});
