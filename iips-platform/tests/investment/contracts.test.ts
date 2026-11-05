/**
 * IID-0 — contract tests: identity, observation, invariants, disposition, periods, metrics.
 *
 * These are the "cannot be got wrong quietly" checks: a sector reference can never be an issuer, a
 * missing value can never be zero, insufficient evidence can never produce a verdict.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  IdError,
  isSectorReferenceId,
  isValidIsin,
  parseIssuerId,
  parseListingId,
  listingId,
  listingParts,
} from '../../src/investment/contracts/ids';
import {
  imputed,
  isPresent,
  missing,
  present,
  valueOrNull,
  type Observation,
} from '../../src/investment/contracts/observation';
import { ContractViolation, checkConclusion, checkObservation, gateAggregate } from '../../src/investment/contracts/invariants';
import { HELD_VERBS, CANDIDATE_VERBS, verbsFor, subjectScope } from '../../src/investment/contracts/disposition';
import { LINE_ITEMS, LINE_ITEM_IDS, requireLineItem, violatesSignRule } from '../../src/investment/contracts/lineItems';
import { ttmFromQuarters, toDiscreteQuarter, scaleToInr, periodKey, type PeriodIdentity } from '../../src/investment/contracts/period';
import { crossFieldIssues, validateMetricValue, satisfiesMinimumSourceClass, OPERATING_METRICS } from '../../src/investment/contracts/operatingMetrics';

const SRC = { kind: 'FILING' as const, ref: 'FIL-1' };

describe('identity', () => {
  test('a sector reference is rejected as an issuer, by pattern and by parser', () => {
    assert.equal(isSectorReferenceId('Banking-H1'), true);
    assert.throws(() => parseIssuerId('Banking-H1'), (error: unknown) => {
      assert.ok(error instanceof IdError);
      assert.equal(error.code, 'SECTOR_REFERENCE_NOT_A_COMPANY');
      return true;
    });
  });

  test('issuer ids require a real key basis and a valid ISIN check digit', () => {
    assert.equal(parseIssuerId('IN:EQISIN:IN0000000011'), 'IN:EQISIN:IN0000000011');
    assert.throws(() => parseIssuerId('IN:EQISIN:IN0000000012'), /check digit/);
    assert.throws(() => parseIssuerId('INFY'), /IN:CIN|IN:EQISIN/);
    assert.equal(isValidIsin('IN0000000011'), true);
  });

  test('a listing id carries exchange, symbol, series and instrument type', () => {
    const listing = parseListingId('IN:NSE:INFY:EQ:EQUITY');
    assert.equal(listing, 'IN:NSE:INFY:EQ:EQUITY');
    assert.deepEqual(listingParts(listing), {
      exchange: 'NSE',
      symbol: 'INFY',
      series: 'EQ',
      instrumentType: 'EQUITY',
    });
    assert.throws(() => parseListingId('IN:NSE:INFY'), (error: unknown) => {
      assert.ok(error instanceof IdError);
      assert.equal(error.code, 'INCOMPLETE_LISTING_ID');
      return true;
    });
    // Same symbol, different instrument class: distinct listings, never merged.
    assert.notEqual(
      listingId({ exchange: 'NSE', symbol: 'INFY', series: 'EQ', instrumentType: 'EQUITY' }),
      listingId({ exchange: 'NSE', symbol: 'INFY', series: 'EQ', instrumentType: 'WARRANT' }),
    );
    assert.throws(() => parseListingId('IN:NSE:INFY:EQ:CRYPTO'), /instrument/i);
  });
});

describe('observation', () => {
  test('a missing value is missing, and null — never zero', () => {
    const absent = missing('NOT_REPORTED');
    assert.equal(absent.value, null);
    assert.equal(absent.presence, 'MISSING');
    assert.equal(valueOrNull(absent), null);
    assert.equal(isPresent(absent), false);
    assert.notEqual(valueOrNull(absent), 0);
  });

  test('an observation may not carry a value unless it is present or explicitly imputed', () => {
    const broken = { value: 42, presence: 'MISSING', reason: 'NOT_REPORTED' } as unknown as Observation<number>;
    const violations = checkObservation(broken, 'test');
    assert.ok(violations.length > 0, 'INV-1 must reject a missing observation that carries a value');
  });

  test('imputation is legal only with a method and an assumption reference', () => {
    const ok = imputed(10, 'carry-forward', 'assumption-1', SRC);
    assert.equal(checkObservation(ok, 'test').length, 0);
    const bad = { value: 10, presence: 'IMPUTED', source: SRC, basis: 'IMPUTED' } as unknown as Observation<number>;
    assert.ok(checkObservation(bad, 'test').length > 0, 'INV-6 must reject an unexplained imputation');
  });
});

describe('invariants', () => {
  test('an aggregate is withheld when any declared input is unusable, and names the input', () => {
    const gated = gateAggregate({
      compute: () => 999,
      requiredInputs: [
        { path: 'revenue', observation: present(100, SRC) },
        { path: 'ebitda', observation: missing('NOT_REPORTED') },
      ],
    });
    assert.equal(gated.withheld, true);
    assert.deepEqual(gated.withheld === true ? gated.unmetInputs : [], ['ebitda']);
  });

  test('the aggregate is computed only when every input is usable', () => {
    const gated = gateAggregate({
      compute: () => 42,
      requiredInputs: [{ path: 'revenue', observation: present(100, SRC) }],
    });
    assert.equal(gated.withheld, false);
    assert.equal(gated.withheld === false ? gated.value : null, 42);
  });

  test('INSUFFICIENT evidence cannot produce a verdict in either direction', () => {
    assert.throws(
      () => {
        const violations = checkConclusion({ adequacy: 'INSUFFICIENT', verb: 'RETAIN', intrinsicAvailable: false });
        if (violations.length > 0) throw new ContractViolation(violations);
      },
      (error: unknown) => {
        assert.ok(error instanceof ContractViolation);
        assert.ok(error.violations.some((violation) => violation.invariant === 'CONCL-1'));
        return true;
      },
    );
    assert.equal(checkConclusion({ adequacy: 'INSUFFICIENT', verb: null, intrinsicAvailable: false }).length, 0);
  });

  test('a negative verb requires positive evidence, not absence of evidence', () => {
    const violations = checkConclusion({ adequacy: 'SUFFICIENT', verb: 'AVOID', intrinsicAvailable: true });
    assert.ok(violations.some((violation) => violation.invariant === 'CONCL-2'));
    const evidenced = checkConclusion({
      adequacy: 'SUFFICIENT',
      verb: 'AVOID',
      intrinsicAvailable: true,
      disqualifierEvidenceIds: ['FIL-1#GOING_CONCERN'],
    });
    assert.equal(evidenced.length, 0);
  });

  test('a price-versus-value claim requires a computed intrinsic value', () => {
    const violations = checkConclusion({
      adequacy: 'PARTIAL',
      verb: 'WATCH',
      intrinsicAvailable: false,
      makesValuationClaim: true,
    });
    assert.ok(violations.some((violation) => violation.message === undefined || violation.invariant === 'CONCL-1'));
  });
});

describe('disposition vocabulary', () => {
  test('held and candidate vocabularies are disjoint and exhaustive for their scope', () => {
    for (const verb of HELD_VERBS) assert.equal((CANDIDATE_VERBS as readonly string[]).includes(verb), false);
    assert.deepEqual(verbsFor('HELD'), [...HELD_VERBS]);
    assert.deepEqual(verbsFor('CANDIDATE'), [...CANDIDATE_VERBS]);
  });

  test('a held position and a new candidate have distinct subject scopes', () => {
    const held = subjectScope({ kind: 'HELD', portfolioId: 'P1', securityId: 'IN:ISIN:IN0000000011' });
    const candidate = subjectScope({ kind: 'CANDIDATE', securityId: 'IN:ISIN:IN0000000011' });
    assert.notEqual(held, candidate);
    assert.match(held, /^hd:P1\//);
  });
});

describe('line items', () => {
  test('the table is closed and rejects unknown ids', () => {
    assert.throws(() => requireLineItem('NOT_A_LINE_ITEM'));
    assert.ok(LINE_ITEM_IDS.length > 40);
    assert.equal(LINE_ITEMS.REVENUE_FROM_OPERATIONS.reported, true);
  });

  test('derived items are not reportable and sign rules are enforced', () => {
    assert.equal(LINE_ITEMS.EBITDA.reported, false);
    assert.equal(violatesSignRule('REVENUE_FROM_OPERATIONS', -1), true);
    assert.equal(violatesSignRule('EPS_BASIC', -3.5), false);
  });
});

describe('periods', () => {
  test('a cumulative quarter becomes discrete only by subtraction from the prior YTD of the same year', () => {
    const q3 = toDiscreteQuarter(
      { value: 300, fiscalYear: 2026, quarterIndex: 3, statementScope: 'CONSOLIDATED', quarterForm: 'YTD' },
      { value: 190, fiscalYear: 2026, quarterIndex: 2, statementScope: 'CONSOLIDATED', quarterForm: 'YTD' },
      SRC,
    );
    assert.equal(q3.value, 110);
    assert.equal(q3.basis, 'DERIVED');

    const crossYear = toDiscreteQuarter(
      { value: 300, fiscalYear: 2026, quarterIndex: 1, statementScope: 'CONSOLIDATED', quarterForm: 'YTD' },
      { value: 280, fiscalYear: 2025, quarterIndex: 4, statementScope: 'CONSOLIDATED', quarterForm: 'YTD' },
      SRC,
    );
    assert.equal(crossYear.value, 300, 'Q1 YTD is already discrete');

    const unsupported = toDiscreteQuarter(
      { value: 900, fiscalYear: 2026, quarterIndex: 4, statementScope: 'CONSOLIDATED', quarterForm: 'YTD' },
      { value: 700, fiscalYear: 2026, quarterIndex: 2, statementScope: 'CONSOLIDATED', quarterForm: 'YTD' },
      SRC,
    );
    assert.equal(unsupported.value, null);
    assert.equal(unsupported.presence, 'NOT_COMPUTABLE');
    assert.equal(unsupported.reason, 'DERIVATION_NOT_SUPPORTED');
  });

  test('TTM refuses to be approximated from fewer than four usable quarters', () => {
    const three = ttmFromQuarters([present(1, SRC), present(2, SRC), present(3, SRC)], SRC);
    assert.equal(three.value, null);
    assert.equal(three.reason, 'INSUFFICIENT_HISTORY');
    const four = ttmFromQuarters([present(1, SRC), present(2, SRC), present(3, SRC), present(4, SRC)], SRC);
    assert.equal(four.value, 10);
  });

  test('scaling is explicit and recorded, and the period key is stable', () => {
    const scaled = scaleToInr(12500, 'CRORE');
    assert.equal(scaled.value, 125_000_000_000);
    assert.deepEqual(scaled.scaleApplied, { from: 'CRORE', to: 'UNIT', factor: 10_000_000 });
    const period: PeriodIdentity = {
      fiscalYear: 2026,
      periodType: 'ANNUAL',
      periodStart: '2025-04-01',
      periodEnd: '2026-03-31',
      statementScope: 'CONSOLIDATED',
    };
    assert.equal(periodKey('ISS', period), periodKey('ISS', { ...period }));
  });
});

describe('operating metrics', () => {
  test('range and unit validation reject implausible observations', () => {
    assert.deepEqual(validateMetricValue('BM_NIM', 3.1, 'PERCENT'), []);
    assert.equal(validateMetricValue('BM_NIM', 3.1, 'INR')[0]?.code, 'UNIT_MISMATCH');
    assert.equal(validateMetricValue('BM_NIM', 140, 'PERCENT')[0]?.code, 'OUT_OF_RANGE');
  });

  test('cross-field checks catch what a range check cannot, and name the metrics involved',
    () => {
      const issues = crossFieldIssues([
        { metricId: 'BM_GNPA', value: 2.4 },
        { metricId: 'BM_NNPA', value: 3.1 },
      ]);
      assert.equal(issues.length, 1);
      assert.equal(issues[0]?.code, 'CROSS_FIELD_VIOLATION');
      assert.deepEqual(issues[0]?.metrics, ['BM_GNPA', 'BM_NNPA']);
    });

  test('a vendor observation cannot satisfy a method that demands an operator-entered metric', () => {
    assert.equal(satisfiesMinimumSourceClass('VENDOR', 'OPERATOR_ENTERED'), false);
    assert.equal(satisfiesMinimumSourceClass('OPERATOR_ENTERED', 'OPERATOR_ENTERED'), true);
    assert.equal(OPERATING_METRICS.HM_REVPAR.sector, 'Hospitality');
  });
});
