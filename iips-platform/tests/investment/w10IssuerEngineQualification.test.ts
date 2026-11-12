/**
 * W10 — issuer-to-engine qualification behaviour.
 *
 * One issuer, thirteen engines, and every refusal path that matters: absence, nil-as-number, staleness,
 * scope, period, unit, range, validation, weak provenance, imputation, cross-field contradiction,
 * derivation gates and the W07 capital-structure safeguards. Each test asserts the machine-readable
 * outcome and the field-level code, not prose.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TRACKED_ENGINE_PROFILES,
  IssuerQualificationError,
  canonicalJson,
  qualifyIssuerToEngines,
  type EngineQualificationProfile,
  type IssuerEngineQualificationReport,
} from '../../src/investment/qualification';
import {
  AS_OF,
  BANK,
  BANK_METRICS,
  BANK_PERIODS,
  FILING,
  FY25,
  FY26,
  KEC_LIKE,
  bankDataset,
  dataset,
  fieldOf,
  filed,
  industrialsDataset,
  issuer,
  metricRecord,
  period,
} from './w10Fixtures';

const CLOSING = { allowClosingBalanceRatioDerivations: true } as const;

function bank(metrics = BANK_METRICS, periods = BANK_PERIODS, asOf = AS_OF): IssuerEngineQualificationReport {
  return qualifyIssuerToEngines({
    content: bankDataset({ metrics, periods }),
    issuerId: BANK,
    asOf,
    engineIds: ['sector.banking'],
    policy: CLOSING,
  });
}

const BASELINE: Record<string, number> = Object.freeze({
  BM_NIM: 3.2,
  BM_CASA: 40,
  BM_GNPA: 2.5,
  BM_NNPA: 0.8,
  BM_CET1: 12,
  BM_CAR: 16,
});

/** Rebuild the six banking metrics, replacing only the named ones from their evidence baseline. */
function bankWith(overrides: Partial<Record<string, Partial<Parameters<typeof metricRecord>[0]>>>): typeof BANK_METRICS {
  return BANK_METRICS.map((record) => {
    const override = overrides[record.metricId];
    if (override === undefined) return record;
    return metricRecord({
      issuerId: BANK,
      metricId: record.metricId,
      value: BASELINE[record.metricId] as number,
      periodEnd: FY26.periodEnd,
      ...override,
    });
  });
}

describe('W10 qualification — the qualified baseline', () => {
  test('a fully evidenced banking issuer qualifies, with every required input resolved', () => {
    const report = bank();
    const engine = report.engines[0]!;
    assert.equal(engine.engineId, 'sector.banking');
    assert.equal(engine.state, 'QUALIFIED');
    assert.equal(engine.requiredInputs, 8);
    assert.equal(engine.requiredResolved, 8);
    assert.deepEqual(engine.codes, []);
    assert.equal(fieldOf(report, 'sector.banking', 'BM-003').outcome, 'RESOLVED');
    assert.equal(fieldOf(report, 'sector.banking', 'BM-004').outcome, 'RESOLVED');
    assert.equal(fieldOf(report, 'sector.banking', 'BM-006').outcome, 'RESOLVED');
  });

  test('the qualification carries no score, verdict, rank or recommendation of any kind', () => {
    const report = bank();
    const serialised = canonicalJson(report);
    for (const forbidden of ['"score"', '"verdict"', '"recommendation"', '"rating"', '"targetPrice"', '"composite"']) {
      assert.equal(serialised.includes(forbidden), false, `qualification report must not contain ${forbidden}`);
    }
  });

  test('all thirteen certified engines are evaluated; only the issuer’s sector is applicable', () => {
    const report = qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, policy: CLOSING });
    assert.equal(report.engines.length, 13);
    assert.equal(report.summary.enginesApplicable, 1);
    assert.equal(report.summary.enginesNotApplicable, 12);
    const applicable = report.engines.filter((engine) => engine.sectorApplicable);
    assert.deepEqual(applicable.map((engine) => engine.engineId), ['sector.banking']);
    for (const engine of report.engines.filter((candidate) => !candidate.sectorApplicable)) {
      assert.equal(engine.state, 'NOT_APPLICABLE');
      assert.deepEqual(engine.codes, ['ENGINE_SECTOR_MISMATCH']);
      assert.equal(engine.fields.every((field) => field.outcome === 'NOT_EVALUATED'), true);
    }
  });

  test('resolved fields publish governed evidence: period, scope, basis, source reference and code-free outcome', () => {
    const report = bank();
    const field = fieldOf(report, 'sector.banking', 'BM-003') as unknown as {
      outcome: string;
      value: number;
      codes: string[];
      evidence: { periodEnd: string; statementScope: string; basis: string; source: { ref: string }; presence: string; sourceClass: string | null };
    };
    assert.equal(field.outcome, 'RESOLVED');
    assert.equal(field.value, 3.2);
    assert.deepEqual(field.codes, []);
    assert.equal(field.evidence.periodEnd, FY26.periodEnd);
    assert.equal(field.evidence.statementScope, 'CONSOLIDATED');
    assert.equal(field.evidence.basis, 'AS_FILED');
    assert.equal(field.evidence.source.ref, `W10-TEST:BM_NIM:${FY26.periodEnd}`);
    assert.equal(field.evidence.filingRef, FILING.ref);
    assert.equal(field.evidence.presence, 'PRESENT');
    assert.equal(field.evidence.sourceClass, 'OPERATOR_ENTERED');
  });

  test('the report is deterministic across runs and independent of input ordering of the metrics array', () => {
    const one = bank();
    const two = bank([...BANK_METRICS].reverse());
    assert.equal(canonicalJson(one), canonicalJson(two));
  });
});

describe('W10 qualification — fail closed on absent, invalid or unusable evidence', () => {
  test('a missing operating metric refuses and blocks the engine', () => {
    const metrics = BANK_METRICS.filter((record) => record.metricId !== 'BM_NIM');
    const report = bank(metrics);
    const field = fieldOf(report, 'sector.banking', 'BM-003');
    assert.equal(field.outcome, 'MISSING');
    assert.equal(field.value, null);
    assert.deepEqual(field.codes, ['FIELD_METRIC_ABSENT']);
    assert.equal(report.engines[0]!.state, 'NOT_QUALIFIED');
    assert.deepEqual(report.engines[0]!.codes, ['ENGINE_REQUIRED_INPUT_UNRESOLVED']);
    assert.equal(report.engines[0]!.requiredResolved, 7);
  });

  test('an unvalidated metric refuses rather than being treated as usable', () => {
    const report = bank(bankWith({ BM_NIM: { validation: 'UNVALIDATED' } }));
    const field = fieldOf(report, 'sector.banking', 'BM-003');
    assert.equal(field.outcome, 'INVALID');
    assert.deepEqual(field.codes, ['FIELD_METRIC_UNVALIDATED']);
  });

  test('a metric with a conflicting validation state refuses', () => {
    const report = bank(bankWith({ BM_CASA: { validation: 'CONFLICT' } }));
    assert.equal(fieldOf(report, 'sector.banking', 'BM-004').outcome, 'CONFLICT');
    assert.deepEqual(fieldOf(report, 'sector.banking', 'BM-004').codes, ['FIELD_METRIC_CONFLICT']);
  });

  test('a unit that differs from the canonical metric unit refuses', () => {
    const report = bank(bankWith({ BM_NIM: { unit: 'INR_CRORE' as never } }));
    const field = fieldOf(report, 'sector.banking', 'BM-003');
    assert.equal(field.outcome, 'INVALID');
    assert.deepEqual(field.codes, ['FIELD_UNIT_MISMATCH']);
  });

  test('a value outside the contract range refuses', () => {
    const report = bank(bankWith({ BM_CASA: { value: 140 } }));
    const field = fieldOf(report, 'sector.banking', 'BM-004');
    assert.equal(field.outcome, 'INVALID');
    assert.deepEqual(field.codes, ['FIELD_OUT_OF_RANGE']);
  });

  test('a metric filed at the wrong statement scope refuses', () => {
    const report = bank(bankWith({ BM_CASA: { scope: 'STANDALONE' } }));
    const field = fieldOf(report, 'sector.banking', 'BM-004');
    assert.equal(field.outcome, 'SCOPE_MISMATCH');
    assert.deepEqual(field.codes, ['FIELD_SCOPE_MISMATCH']);
  });

  test('a metric filed for a different period refuses', () => {
    const report = bank(bankWith({ BM_CASA: { periodEnd: FY25.periodEnd } }));
    const field = fieldOf(report, 'sector.banking', 'BM-004');
    assert.equal(field.outcome, 'PERIOD_MISMATCH');
    assert.deepEqual(field.codes, ['FIELD_PERIOD_MISMATCH']);
  });

  test('a nil-by-disclosure metric is never read as zero', () => {
    const report = bank(bankWith({ BM_CASA: { value: null, nilStatement: 'The bank has no CASA deposits.' } }));
    const field = fieldOf(report, 'sector.banking', 'BM-004');
    assert.equal(field.outcome, 'NIL_NOT_ZERO');
    assert.equal(field.value, null);
    assert.deepEqual(field.codes, ['FIELD_NIL_NOT_ZERO']);
  });

  test('an imputed observation is refused even when present', () => {
    const report = bank(bankWith({ BM_CASA: { value: 41, imputedValue: true } }));
    const field = fieldOf(report, 'sector.banking', 'BM-004');
    assert.equal(field.outcome, 'INVALID');
    assert.deepEqual(field.codes, ['FIELD_IMPUTED_NOT_PERMITTED']);
  });

  test('a statement older than the frozen freshness window is stale, and the window is published', () => {
    const report = bank(BANK_METRICS, BANK_PERIODS, '2026-11-12');
    const field = fieldOf(report, 'sector.banking', 'BM-005');
    assert.equal(field.outcome, 'STALE');
    assert.deepEqual(field.codes, ['FIELD_STALE']);
    assert.match(field.note, /226 days/);
    assert.match(field.note, /200 days/);
    assert.equal(report.engines[0]!.state, 'NOT_QUALIFIED');
    assert.deepEqual(report.engines[0]!.codes, ['ENGINE_REQUIRED_INPUT_UNRESOLVED']);
  });

  test('no consolidated annual period fails the engine explicitly', () => {
    const standaloneOnly = BANK_PERIODS.map((entry) => ({ ...entry, period: { ...entry.period, statementScope: 'STANDALONE' as const } }));
    const report = bank(BANK_METRICS, standaloneOnly);
    assert.equal(report.periodEnd, null);
    assert.equal(report.statementScope, null);
    assert.deepEqual(report.engines[0]!.codes, ['ENGINE_NO_CONSOLIDATED_PERIOD', 'ENGINE_REQUIRED_INPUT_UNRESOLVED']);
    assert.equal(report.engines[0]!.state, 'NOT_QUALIFIED');
    assert.equal(fieldOf(report, 'sector.banking', 'BM-003').outcome, 'MISSING');
  });
});

describe('W10 qualification — cross-field contradictions fail the engine', () => {
  test('NNPA above GNPA fails both fields and the engine', () => {
    const report = bank(bankWith({ BM_NNPA: { value: 4.2 } }));
    assert.deepEqual(report.engines[0]!.codes, ['ENGINE_CROSS_FIELD_VIOLATION', 'ENGINE_REQUIRED_INPUT_UNRESOLVED']);
    assert.equal(report.engines[0]!.state, 'NOT_QUALIFIED');
    for (const fieldName of ['BM-005', 'BM-006']) {
      const field = fieldOf(report, 'sector.banking', fieldName);
      assert.equal(field.outcome, 'INVALID');
      assert.ok(field.codes.includes('FIELD_CROSS_FIELD_VIOLATION'));
      assert.match(field.note, /NNPA/);
    }
  });

  test('CET1 above the capital adequacy ratio fails both fields', () => {
    const report = bank(bankWith({ BM_CET1: { value: 19 } }));
    const field = fieldOf(report, 'sector.banking', 'BM-014');
    assert.equal(field.outcome, 'INVALID');
    assert.ok(field.codes.includes('FIELD_CROSS_FIELD_VIOLATION'));
    assert.ok(report.engines[0]!.codes.includes('ENGINE_CROSS_FIELD_VIOLATION'));
  });
});

describe('W10 qualification — statement-derived inputs and the W07 capital structure', () => {
  test('closing-balance ROA/ROE are refused by default policy and permitted only when the policy allows it', () => {
    const blockedReport = qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, engineIds: ['sector.banking'] });
    for (const fieldName of ['BM-001', 'BM-002']) {
      const field = fieldOf(blockedReport, 'sector.banking', fieldName);
      assert.equal(field.outcome, 'DERIVATION_NOT_PERMITTED');
      assert.deepEqual(field.codes, ['FIELD_DERIVATION_NOT_PERMITTED']);
    }
    assert.equal(blockedReport.engines[0]!.state, 'NOT_QUALIFIED');

    const allowed = bank();
    assert.equal(fieldOf(allowed, 'sector.banking', 'BM-001').outcome, 'RESOLVED');
    assert.equal(fieldOf(allowed, 'sector.banking', 'BM-001').value, 1);
    assert.equal(fieldOf(allowed, 'sector.banking', 'BM-002').value, 12);
    assert.ok(allowed.limitations.some((line) => /Closing-balance ROA\/ROE derivations are ENABLED/.test(line)));
  });

  test('debt/EBITDA resolves from W07 gross debt and never substitutes net debt', () => {
    const report = qualifyIssuerToEngines({ content: industrialsDataset(), issuerId: KEC_LIKE, asOf: AS_OF });
    const engine = report.engines.find((candidate) => candidate.engineId === 'sector.industrials')!;
    assert.equal(engine.state, 'NOT_QUALIFIED', 'the Industrials archetype selector has no authorized source, so the engine cannot be qualified');
    const field = fieldOf(report, 'sector.industrials', 'debtEbitda') as unknown as {
      outcome: string;
      value: number;
      evidence: { source: { ref: string } };
      transformation: string;
    };
    assert.equal(field.outcome, 'RESOLVED');
    assert.equal(field.value, Number((450 / 170).toFixed(6)));
    assert.match(field.transformation, /GROSS_DEBT ÷ EBITDA/);
    assert.match(field.transformation, /capital-structure\/1\.0\.0/);
    assert.equal(engine.fields.some((candidate) => candidate.field === 'NET_DEBT'), false);
  });

  test('missing borrowings refuse the ratio instead of silently using the prior year’s balance sheet', () => {
    const report = qualifyIssuerToEngines({ content: industrialsDataset({ omitBorrowings: true }), issuerId: KEC_LIKE, asOf: AS_OF });
    const field = fieldOf(report, 'sector.industrials', 'debtEbitda');
    assert.equal(field.outcome, 'PERIOD_MISMATCH');
    assert.equal(field.value, null);
    assert.deepEqual(field.codes, ['FIELD_PERIOD_MISMATCH']);
    assert.match(field.note, /prior year’s debt is not substituted/);
    assert.match(field.note, /2025-03-31/);
  });

  test('a missing EBITDA blocks the leverage derivation while leaving the rest of the engine evaluated', () => {
    const content = industrialsDataset();
    const periods = content.periods.map((entry) => (entry.period.periodEnd === FY26.periodEnd ? { ...entry, derived: {} } : entry));
    const report = qualifyIssuerToEngines({ content: { ...content, periods }, issuerId: KEC_LIKE, asOf: AS_OF });
    const field = fieldOf(report, 'sector.industrials', 'ebitdaMargin');
    assert.equal(field.outcome, 'DERIVATION_BLOCKED');
    assert.deepEqual(field.codes, ['FIELD_DERIVATION_INPUT_MISSING']);
  });

  test('a zero or negative denominator refuses rather than inverting the ratio', () => {
    const zeroRevenue = qualifyIssuerToEngines({
      content: industrialsDataset({ revenue: 0 }),
      issuerId: KEC_LIKE,
      asOf: AS_OF,
    });
    const zeroField = fieldOf(zeroRevenue, 'sector.industrials', 'ebitdaMargin');
    assert.equal(zeroField.outcome, 'DERIVATION_BLOCKED');
    assert.deepEqual(zeroField.codes, ['FIELD_ZERO_DENOMINATOR']);

    const negativeEbitda = qualifyIssuerToEngines({
      content: industrialsDataset({ ebitda: -50 }),
      issuerId: KEC_LIKE,
      asOf: AS_OF,
    });
    const negativeField = fieldOf(negativeEbitda, 'sector.industrials', 'debtEbitda');
    assert.equal(negativeField.outcome, 'DERIVATION_BLOCKED');
    assert.deepEqual(negativeField.codes, ['FIELD_NEGATIVE_BASE']);
  });

  test('revenue growth needs the immediately preceding fiscal year, not any older period', () => {
    const content = industrialsDataset();
    const periods = content.periods.filter((entry) => entry.period.periodEnd !== FY25.periodEnd);
    const report = qualifyIssuerToEngines({ content: { ...content, periods }, issuerId: KEC_LIKE, asOf: AS_OF });
    const field = fieldOf(report, 'sector.industrials', 'revenueGrowth');
    assert.equal(field.outcome, 'DERIVATION_BLOCKED');
    assert.match(field.note, /no prior annual period|prior annual period ends/);
  });
});

describe('W10 qualification — selectors and engine applicability', () => {
  const technology = (subSegment: string) =>
    dataset({
      issuers: [issuer({ issuerId: BANK, legalName: 'Aarav Systems Limited (synthetic)', sector: 'Technology', subSegment })],
      periods: [
        period({ issuerId: BANK, fiscal: FY26, values: { REVENUE_FROM_OPERATIONS: filed(1_000, FY26.periodEnd), NET_PROFIT: filed(100, FY26.periodEnd), TOTAL_EQUITY: filed(800, FY26.periodEnd) } }),
        period({ issuerId: BANK, fiscal: FY25, values: { REVENUE_FROM_OPERATIONS: filed(900, FY25.periodEnd), NET_PROFIT: filed(90, FY25.periodEnd), TOTAL_EQUITY: filed(700, FY25.periodEnd), PROFIT_BEFORE_TAX: filed(120, FY25.periodEnd), FINANCE_COSTS: filed(5, FY25.periodEnd) } }),
      ],
      operatingMetrics: [
        metricRecord({ issuerId: BANK, metricId: 'TM_IT_SERVICES_REVENUE_SHARE', value: 40, periodEnd: FY26.periodEnd }),
      ],
    });

  test('an issuer subsegment that normalises into the engine vocabulary resolves the selector', () => {
    const report = qualifyIssuerToEngines({ content: technology('IT services'), issuerId: BANK, asOf: AS_OF, engineIds: ['sector.technology'] });
    const field = fieldOf(report, 'sector.technology', 'subsegment');
    assert.equal(field.outcome, 'RESOLVED');
    assert.equal(field.value, 'it-services');
  });

  test('an issuer subsegment outside the engine vocabulary refuses the selector and the engine', () => {
    const report = qualifyIssuerToEngines({ content: technology('Specialty chemicals'), issuerId: BANK, asOf: AS_OF, engineIds: ['sector.technology'] });
    const field = fieldOf(report, 'sector.technology', 'subsegment');
    assert.equal(field.outcome, 'SELECTOR_UNRESOLVED');
    assert.deepEqual(field.codes, ['FIELD_SELECTOR_UNRESOLVED']);
    assert.equal(report.engines[0]!.state, 'NOT_QUALIFIED');
  });

  test('every other sector fails closed on the same fully-evidenced dataset', () => {
    const sectors = TRACKED_ENGINE_PROFILES.map((profile) => profile.sectorFamily).filter((sector) => sector !== 'Banking');
    for (const sector of sectors) {
      const profile = TRACKED_ENGINE_PROFILES.find((candidate) => candidate.sectorFamily === sector)!;
      const content = bankDataset();
      const report = qualifyIssuerToEngines({
        content: { ...content, issuers: [{ ...content.issuers[0]!, sector }] },
        issuerId: BANK,
        asOf: AS_OF,
        engineIds: [profile.engineId],
        policy: CLOSING,
      });
      const engine = report.engines[0]!;
      assert.equal(engine.sectorApplicable, true, sector);
      assert.equal(engine.state, 'NOT_QUALIFIED', `${sector} must not be certifiable from banking evidence`);
      assert.ok(engine.fields.some((field) => field.requirement === 'REQUIRED' && field.outcome !== 'RESOLVED'), sector);
    }
  });
});

describe('W10 qualification — request validation and public contract', () => {
  test('an unknown issuer is refused by name', () => {
    assert.throws(() => qualifyIssuerToEngines({ content: bankDataset(), issuerId: 'IN:EQISIN:IN0000000000', asOf: AS_OF }), (error: unknown) => {
      assert.ok(error instanceof IssuerQualificationError);
      assert.equal(error.code, 'ISSUER_NOT_FOUND');
      return true;
    });
  });

  test('a malformed asOf is refused', () => {
    for (const asOf of ['', '30-09-2026', '2026-13-01', 'not-a-date']) {
      assert.throws(() => qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf }), (error: unknown) => {
        assert.ok(error instanceof IssuerQualificationError);
        assert.equal(error.code, 'REQUEST_INVALID');
        return true;
      });
    }
  });

  test('an unknown engine id is refused rather than silently dropped', () => {
    assert.throws(
      () => qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, engineIds: ['sector.telecom', 'sector.spaceship'] as never }),
      (error: unknown) => {
        assert.ok(error instanceof IssuerQualificationError);
        assert.equal(error.code, 'ENGINE_UNKNOWN');
        return true;
      },
    );
  });

  test('pinning an unevidenced period is refused instead of falling back to the latest period', () => {
    assert.throws(
      () => qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, periodEnd: '2024-03-31' }),
      (error: unknown) => {
        assert.ok(error instanceof IssuerQualificationError);
        assert.equal(error.code, 'REQUEST_INVALID');
        return true;
      },
    );
    const pinned = qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, periodEnd: FY25.periodEnd, engineIds: ['sector.banking'], policy: CLOSING });
    assert.equal(pinned.periodEnd, FY25.periodEnd);
  });

  test('the evaluator is data-driven: a caller-supplied minimal profile is honoured', () => {
    const banking = TRACKED_ENGINE_PROFILES.find((profile) => profile.engineId === 'sector.banking')!;
    const minimal: EngineQualificationProfile = {
      ...banking,
      engineId: 'sector.banking',
      fields: banking.fields.filter((field) => field.field === 'BM-005'),
    };
    const report = qualifyIssuerToEngines({ content: bankDataset(), issuerId: BANK, asOf: AS_OF, profiles: [minimal] });
    assert.equal(report.engines.length, 1);
    assert.equal(report.engines[0]!.requiredInputs, 1);
    assert.equal(report.engines[0]!.state, 'QUALIFIED');
    assert.equal(report.summary.fieldsEvaluated, 1);
  });

  test('summary counts reconcile with the engine and field records', () => {
    const report = bank();
    const fields = report.engines.flatMap((engine) => engine.fields);
    assert.equal(report.summary.enginesEvaluated, report.engines.length);
    assert.equal(report.summary.fieldsEvaluated, fields.length);
    assert.equal(
      report.summary.fieldsResolved + report.summary.fieldsUnsupported + report.summary.fieldsConflicting + report.summary.fieldsMissing +
        report.summary.fieldsStale + report.summary.fieldsInvalid + report.summary.fieldsNotEvaluated + report.summary.fieldsOptionalAbsent,
      fields.length,
    );
  });

  test('the report is frozen: callers cannot mutate the published qualification', () => {
    const report = bank();
    assert.equal(Object.isFrozen(report), true);
    assert.equal(Object.isFrozen(report.engines), true);
    assert.equal(Object.isFrozen(report.engines[0]!.fields), true);
    assert.equal(Object.isFrozen(report.summary), true);
  });
});
