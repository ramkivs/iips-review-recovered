/**
 * W05-C/W05-D — dataset qualification and the qualification-threshold mechanism.
 *
 * Acceptance tests: 3 (unknown rights cannot qualify), 5 (stale), 6 (missing periods and
 * incomplete statements), 7 (standalone vs consolidated), 8 (missing/nil/zero/unmapped distinct),
 * 9 (accounting limitations retained and consequential), 10 (reproducible from recorded
 * evidence and rules) — plus the threshold mechanism: documented, testable, configurable, and
 * never treated as approved.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_QUALIFICATION_POLICY,
  qualifyIssuerDataset,
  qualificationFromEvidence,
  type IssuerDatasetQualification,
  type QualificationInput,
} from '../../src/investment/lifecycle/qualification';
import {
  DATASET_QUALIFICATION_THRESHOLD,
  THETA_F,
  applyQualificationThreshold,
  evaluateW20Gate,
  financialRatio,
  type QualificationThreshold,
} from '../../src/investment/lifecycle/threshold';
import { rightsRecordFromManifest } from '../../src/investment/lifecycle/rightsRecord';
import { present } from '../../src/investment/contracts/observation';
import { sectorRequirements } from '../../src/investment/coverage/measure';
import {
  ISSUER_A,
  annualPeriod,
  completeItems,
  completeMetrics,
  operatorAssertedRightsRecord,
  quarterPeriod,
  syntheticMissing,
  syntheticNil,
  syntheticRightsRecord,
  threeCompleteAnnuals,
} from './w05LifecycleFixture';

const AS_OF_FRESH = '2026-09-15'; // FY2026 (ended 2026-03-31) is 168 days old — inside the 200-day P&L window
const AS_OF_STALE = '2026-11-17'; // the same period is 231 days old — outside it

function rightsSummary() {
  const record = syntheticRightsRecord(AS_OF_FRESH);
  return {
    manifestRightsState: record.manifestRightsState,
    datasetClass: record.datasetClass,
    status: record.status,
    statusReason: record.statusReason,
    acquisitionMethod: record.evidence.acquisitionMethod,
  };
}

function qualify(overrides: Partial<QualificationInput> = {}, asOf: string = AS_OF_FRESH): IssuerDatasetQualification {
  return qualifyIssuerDataset({
    dataset: {
      datasetVersion: 'sha256:1111111111111111111111111111111111111111111111111111111111111111',
      datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1',
      provider: 'w05-synthetic-fixture',
      licence: 'synthetic; not redistributable',
      importRunId: 'run-w05-synthetic',
      lastImportAt: '2026-09-10T00:00:00.000Z',
      dataAsOf: '2026-09-10',
      knownAsOf: '2026-09-10',
    },
    issuerId: ISSUER_A,
    sector: 'Technology',
    periods: threeCompleteAnnuals(ISSUER_A),
    operatingMetrics: completeMetrics(ISSUER_A, 'Technology'),
    issues: [],
    integrity: { ok: true, detail: null },
    rights: rightsSummary(),
    asOf,
    ...overrides,
  });
}

describe('W05 — dataset qualification: a successful import is not qualification', () => {
  test('test 3 — a dataset with unknown rights cannot qualify', () => {
    const unknownRights = rightsRecordFromManifest(undefined, AS_OF_FRESH);
    assert.equal(unknownRights.status, 'UNKNOWN');

    const qualification = qualify({
      rights: {
        manifestRightsState: unknownRights.manifestRightsState,
        datasetClass: unknownRights.datasetClass,
        status: unknownRights.status,
        statusReason: unknownRights.statusReason,
        acquisitionMethod: unknownRights.evidence.acquisitionMethod,
      },
    });

    assert.equal(qualification.technicallyValid, true, 'the import itself is valid');
    assert.ok(qualification.failedGates.includes('RIGHTS_ELIGIBLE'));
    const decision = applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'VALUATION_INPUT');
    assert.equal(decision.decision, 'BELOW_THRESHOLD');
    assert.ok(decision.failedGates.includes('RIGHTS_ELIGIBLE'));
  });

  test('a fresh, complete dataset that merely imported successfully still fails qualification when rights are unknown', () => {
    const unknownRights = rightsRecordFromManifest({ state: 'UNKNOWN', basis: '', note: '' }, AS_OF_FRESH);
    const qualification = qualify({
      rights: {
        manifestRightsState: 'UNKNOWN',
        datasetClass: 'UNKNOWN',
        status: unknownRights.status,
        statusReason: unknownRights.statusReason,
        acquisitionMethod: 'UNKNOWN',
      },
    });
    assert.equal(qualification.technicallyValid, true);
    assert.equal(qualification.freshness.status, 'FRESH');
    assert.equal(qualification.completeness.adequacy, 'SUFFICIENT');
    assert.ok(qualification.failedGates.length > 0, 'technically valid is not qualified');
  });

  test('test 5 — a stale dataset is identified and cannot silently appear current', () => {
    const qualification = qualify({}, AS_OF_STALE);

    assert.equal(qualification.freshness.status, 'STALE');
    assert.ok(qualification.freshness.reasons.includes('VALUATION_BASIS_BEYOND_PNL_WINDOW'));
    assert.ok(qualification.failedGates.includes('FRESH_WITHIN_POLICY'));
    const staleFlag = qualification.quality.flags.find((flag) => flag.code === 'STALE_STATEMENTS');
    assert.ok(staleFlag, 'the stale condition is recorded as a named quality flag');
    assert.equal(staleFlag.severity, 'HIGH');
    assert.ok(qualification.accountingLimitations.some((finding) => finding.code === 'STALE_STATEMENTS'));

    // The staleness is dated, so a reader can see HOW stale rather than a bare "old".
    assert.equal(qualification.freshness.valuationBasis?.periodEnd, '2026-03-31');
    assert.ok((qualification.freshness.valuationBasis?.daysSincePeriodEnd ?? 0) > 200);

    const decision = applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'VALUATION_INPUT');
    assert.equal(decision.decision, 'BELOW_THRESHOLD');
    assert.ok(decision.failedGates.includes('FRESH_WITHIN_POLICY'));
  });

  test('test 6 — missing financial periods and incomplete statements are reported accurately', () => {
    // FY2024 and FY2026 only: FY2025 is absent from the series, and the latest period lacks items.
    const partial = completeItems({
      REVENUE_FROM_OPERATIONS: syntheticMissing('NOT_REPORTED'),
      EBITDA: syntheticMissing('NOT_REPORTED'),
      TOTAL_ASSETS: syntheticMissing('NOT_TAGGED_IN_FILING'),
      OPERATING_CASH_FLOW: syntheticMissing('NOT_REPORTED'),
    });
    const qualification = qualify({
      periods: [
        annualPeriod(ISSUER_A, 2024, completeItems()),
        annualPeriod(ISSUER_A, 2026, partial),
      ],
    });

    const gap = qualification.freshness.sequenceGaps.find((entry) => entry.periodType === 'ANNUAL');
    assert.ok(gap, 'the missing FY2025 is reported as a sequence gap, never interpolated');
    assert.deepEqual(gap.missing, ['FY2025']);
    assert.deepEqual(gap.between, ['FY2024', 'FY2026']);

    assert.ok(qualification.completeness.missingFields.length > 0);
    assert.ok(
      qualification.completeness.missingFields.some(
        (field) => field.periodEnd === '2026-03-31' && field.reason === 'NOT_REPORTED',
      ),
      'a missing field names its period and its reason',
    );
    assert.ok(qualification.failedGates.includes('STATEMENTS_ADEQUATE'));
    assert.notEqual(qualification.completeness.adequacy, 'SUFFICIENT');
  });

  test('test 7 — standalone and consolidated datasets are not incorrectly interchanged', () => {
    // Mixed scopes in one dataset: the consolidated series wins and the standalone period is excluded BY NAME.
    const mixed = qualify({
      periods: [
        ...threeCompleteAnnuals(ISSUER_A),
        annualPeriod(ISSUER_A, 2026, completeItems(), { scope: 'STANDALONE' }),
      ],
    });
    assert.equal(mixed.seriesScope, 'CONSOLIDATED');
    assert.equal(mixed.scopeSubstitution, false);
    assert.ok(mixed.freshness.sequenceGaps.length === 0);
    assert.ok(
      mixed.accountingLimitations.some((finding) => finding.code === 'PERIODS_EXCLUDED_FOR_SCOPE'),
      'the excluded standalone period is disclosed',
    );
    assert.ok(mixed.evidence.periods.some((period) => period.period.statementScope === 'STANDALONE'));
    assert.ok(!mixed.periodsCovered.annual.includes('2026-03-31:STANDALONE'));

    // Standalone-only: the substitution is recorded and the series is never presented as consolidated.
    const standalone = qualify({
      periods: threeCompleteAnnuals(ISSUER_A, { scope: 'STANDALONE' }),
    });
    assert.equal(standalone.seriesScope, 'STANDALONE');
    assert.equal(standalone.scopeSubstitution, true);
    assert.ok(standalone.accountingLimitations.some((finding) => finding.code === 'STANDALONE_SERIES_SUBSTITUTED'));

    // The two datasets stay distinct: one never satisfies the other's basis silently.
    assert.notEqual(mixed.seriesScope, standalone.seriesScope);
  });

  test('test 8 — missing, nil, zero and unmapped values remain distinct', () => {
    // A reported zero is a value: present, and zero — never missing, never nil.
    const zeroCapex = { ...completeItems().CAPITAL_EXPENDITURE!, value: 0 };
    const latest = annualPeriod(ISSUER_A, 2026, completeItems({
      REVENUE_FROM_OPERATIONS: syntheticMissing('NOT_REPORTED'),
      NET_PROFIT: syntheticNil('2026-03-31'),
      TOTAL_EQUITY: syntheticMissing('NOT_TAGGED_IN_FILING'),
      CAPITAL_EXPENDITURE: zeroCapex,
    }));

    const qualification = qualify({ periods: [annualPeriod(ISSUER_A, 2024, completeItems()), annualPeriod(ISSUER_A, 2025, completeItems()), latest] });

    assert.equal(qualification.valueSemantics.zero, 1, 'a reported zero is counted as zero');
    assert.equal(qualification.valueSemantics.nilByDisclosure, 1, 'a nil disclosure is counted as nil');
    assert.equal(qualification.valueSemantics.missingNotReported, 1, 'an unreported item is counted as missing-not-reported');
    assert.equal(qualification.valueSemantics.missingNotTagged, 1, 'an untagged item is counted as missing-not-tagged (unmapped)');
    assert.equal(qualification.valueSemantics.presentNonZero, 23);

    // The underlying observations are untouched: nothing was converted into anything else.
    const annual2026 = qualification.evidence.periods.find((period) => period.period.periodEnd === '2026-03-31')!;
    assert.equal(annual2026.values.NET_PROFIT?.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(annual2026.values.NET_PROFIT?.value, null, 'a nil is never a number');
    assert.equal(annual2026.values.REVENUE_FROM_OPERATIONS?.presence, 'MISSING');
    assert.equal(annual2026.values.REVENUE_FROM_OPERATIONS?.value, null);
    assert.equal(annual2026.values.CAPITAL_EXPENDITURE?.presence, 'PRESENT');
    assert.equal(annual2026.values.CAPITAL_EXPENDITURE?.value, 0, 'a zero stays a zero');
    assert.equal(annual2026.values.TOTAL_EQUITY?.reason, 'NOT_TAGGED_IN_FILING');
  });

  test('test 9 — accounting limitations are retained and affect qualification where required', () => {
    const negativeEquity = completeItems({ TOTAL_EQUITY: { ...completeItems().TOTAL_EQUITY!, value: -50 } });
    const restated = annualPeriod(ISSUER_A, 2026, negativeEquity, { basis: 'RESTATED', restatementOf: 'SYNTHETIC-FY2026' });
    const qualification = qualify({ periods: [annualPeriod(ISSUER_A, 2024, completeItems()), annualPeriod(ISSUER_A, 2025, completeItems()), restated] });

    const negative = qualification.accountingLimitations.find((finding) => finding.code === 'NEGATIVE_EQUITY');
    assert.ok(negative, 'the negative equity limitation is retained');
    assert.equal(negative.severity, 'BLOCKING');
    const restatement = qualification.accountingLimitations.find((finding) => finding.code === 'RESTATEMENT_PRESENT');
    assert.ok(restatement, 'the restatement is retained');
    assert.equal(restatement.severity, 'LIMITATION');

    assert.ok(qualification.failedGates.includes('NO_BLOCKING_ACCOUNTING_LIMITATIONS'));

    // It affects qualification WHERE REQUIRED: valuation input is refused; the gate list per purpose
    // is the threshold's documented mapping.
    const valuation = applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'VALUATION_INPUT');
    assert.equal(valuation.decision, 'BELOW_THRESHOLD');
    assert.ok(valuation.failedGates.includes('NO_BLOCKING_ACCOUNTING_LIMITATIONS'));
    const statements = applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'STATEMENT_ANALYSIS');
    assert.ok(
      statements.gateOutcomes.every((outcome) => outcome.gate !== 'NO_BLOCKING_ACCOUNTING_LIMITATIONS'),
      'the statement-analysis purpose does not require the no-blocking-limitations gate — the difference is explicit, not hidden',
    );
  });

  test('test 10 — qualification results are reproducible from recorded evidence and rules', () => {
    const first = qualify();
    const second = qualify();

    assert.deepEqual(first, second, 'the same inputs produce the identical result');
    assert.equal(first.evidenceDigest, second.evidenceDigest, 'the evidence digest is the reproduction key');

    // The result re-derives from the recorded evidence alone — no source files, no clock, no store.
    const recomputed = qualificationFromEvidence(first.evidence);
    assert.deepEqual(recomputed, first, 'the assessment is a pure function of the recorded evidence snapshot');

    assert.equal(first.ruleset, 'qualification/1.0.0');
    assert.equal(first.policy.valuationPolicyVersion, 'valuation-policy/1.0.0');
  });
});

describe('W05 — the per-dataset qualification ruleset is documented and testable, and it is NOT θF', () => {
  test('the ruleset states its role and carries no approval axis of any kind', () => {
    const threshold = DATASET_QUALIFICATION_THRESHOLD;
    assert.ok(!('approvalStatus' in threshold), 'no approval status exists on the per-dataset ruleset');
    assert.match(threshold.provenance.role, /NOT θF/);
    assert.match(threshold.provenance.role, /not a per-dataset qualification threshold/);
    assert.match(threshold.provenance.role, /no product-owner approval dependency/);
    assert.ok(threshold.provenance.rationale.length > 0);
    assert.ok(threshold.provenance.impact.length > 0);
    assert.match(threshold.provenance.impact, /0 of 64 holdings/);
    // The numeric gates are the ALREADY-GOVERNED policy values, not new inventions.
    assert.equal(threshold.policy.adequacy.minimumAnnualPeriods, DEFAULT_QUALIFICATION_POLICY.adequacy.minimumAnnualPeriods);
    assert.equal(threshold.policy.adequacy.sufficientFieldCoveragePct, DEFAULT_QUALIFICATION_POLICY.adequacy.sufficientFieldCoveragePct);
    assert.equal(threshold.policy.freshness.pnlDays, DEFAULT_QUALIFICATION_POLICY.freshness.pnlDays);
  });

  test('meeting the ruleset is a per-dataset technical result, never an approval', () => {
    const qualification = qualify();
    const application = applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'VALUATION_INPUT');

    assert.equal(application.decision, 'MEETS_THRESHOLD');
    assert.ok(!('approvalStatus' in application), 'no approval axis exists on the application');
    assert.match(application.explanation, /not θF and confers no approval/);
    assert.equal(application.evidenceDigest, qualification.evidenceDigest);
  });

  test('the threshold is configurable, and a configuration mismatch refuses to decide', () => {
    const stricter: QualificationThreshold = {
      ...DATASET_QUALIFICATION_THRESHOLD,
      thresholdId: 'W05-THF-TEST-STRICTER',
      policy: {
        ...DATASET_QUALIFICATION_THRESHOLD.policy,
        adequacy: { ...DATASET_QUALIFICATION_THRESHOLD.policy.adequacy, minimumAnnualPeriods: 5 },
      },
    };
    const application = applyQualificationThreshold(qualify(), stricter, 'VALUATION_INPUT');
    assert.equal(application.decision, 'CONFIGURATION_MISMATCH');
    assert.match(application.explanation, /re-run the qualification under the ruleset configuration/);
  });

  test('the application is reproducible and explainable', () => {
    const qualification = qualify();
    const first = applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'PRICE_SENSITIVE_ANALYSIS');
    const second = applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'PRICE_SENSITIVE_ANALYSIS');
    assert.deepEqual(first, second);
    for (const outcome of first.gateOutcomes) {
      assert.match(first.explanation, new RegExp(`${outcome.gate}=(PASS|FAIL)`));
    }
    assert.equal(first.gateOutcomes.length, DATASET_QUALIFICATION_THRESHOLD.requiredGates.PRICE_SENSITIVE_ANALYSIS.length);
  });

  test('quarterly periods are identified and distinguished from annual periods', () => {
    const periods = [
      ...threeCompleteAnnuals(ISSUER_A),
      quarterPeriod(ISSUER_A, 2026, 1, '2025-04-01', '2025-06-30', completeItems()),
      quarterPeriod(ISSUER_A, 2026, 2, '2025-07-01', '2025-09-30', completeItems()),
    ];
    const qualification = qualify({ periods });

    assert.equal(qualification.periodsCovered.annual.length, 3);
    assert.equal(qualification.periodsCovered.quarterly.length, 2);
    assert.ok(qualification.periodsCovered.quarterly.includes('2025-06-30'));
    const gate = qualification.gates.find((entry) => entry.gate === 'PERIODS_IDENTIFIED');
    assert.equal(gate?.passed, true);
  });

  test('an operator-asserted rights record with full permission supports eligibility; a purpose denied restricts it', () => {
    const eligible = operatorAssertedRightsRecord(AS_OF_FRESH);
    assert.equal(eligible.status, 'ELIGIBLE_LOCAL_PERSONAL_USE');

    const restricted = operatorAssertedRightsRecord(AS_OF_FRESH, { ANALYSIS: 'NOT_PERMITTED' });
    assert.equal(restricted.status, 'RESTRICTED');
    assert.match(restricted.statusReason, /ANALYSIS/);

    const expired = operatorAssertedRightsRecord(AS_OF_FRESH, {}, { expiry: '2026-01-01', reviewBy: 'operator' });
    assert.equal(expired.status, 'RESTRICTED');
    assert.match(expired.statusReason, /expired|review/i);

    // Retention is verified ALONGSIDE entitlement: a fully entitled record with unverified
    // retention fails closed on retention alone, and the two verdicts stay separately visible.
    const unverifiedRetention = operatorAssertedRightsRecord(AS_OF_FRESH, { RETENTION: 'UNKNOWN' });
    assert.equal(unverifiedRetention.status, 'UNKNOWN');
    assert.equal(unverifiedRetention.entitlementStatus, 'ELIGIBLE_LOCAL_PERSONAL_USE');
    assert.equal(unverifiedRetention.retentionStatus, 'UNKNOWN');
    assert.match(unverifiedRetention.retentionReason, /retention fails closed/);
  });
});

describe('W05 — θF is the portfolio-wide ratio that gates W20: not a per-dataset threshold, not a W05 condition', () => {
  test('θF carries the roadmap semantics verbatim and asserts no value', () => {
    assert.equal(THETA_F.semantics, 'PORTFOLIO_WIDE_RATIO');
    assert.equal(THETA_F.gates, 'W20');
    assert.equal(THETA_F.isW05Condition, false);
    assert.equal(THETA_F.isPerDatasetQualificationThreshold, false);
    assert.equal(THETA_F.assertionStatus, 'NO_DEFENSIBLE_VALUE_ASSERTED');
    assert.equal(THETA_F.value, null, 'no defensible value can yet be asserted, so none is asserted');
    assert.equal(THETA_F.settingRule, 'SET_FROM_OBSERVED_EVIDENCE_UNDER_THE_STANDING_GRANT');
    assert.match(THETA_F.note, /not a per-dataset qualification threshold/);
    assert.match(THETA_F.note, /not a W05 condition/);
    assert.match(THETA_F.note, /No product-owner approval dependency/);
  });

  test('the W20 gate fails closed while no defensible θF value is asserted', () => {
    const ratio = financialRatio({ identityPassedHoldings: 4, holdingsWithFinancialData: 3, totalHoldings: 64 });
    const gate = evaluateW20Gate(ratio);
    assert.equal(gate.open, false);
    assert.equal(gate.thetaFAssertionStatus, 'NO_DEFENSIBLE_VALUE_ASSERTED');
    assert.match(gate.reason, /no defensible θF value can yet be asserted/);
    assert.match(gate.reason, /fail closed/);
  });

  test('a holding contributes to the financial ratio only if its own identity passes', () => {
    // 64 holdings (the W04 revision-1 denominator), one identity-passed holding with data:
    // the numerator is therefore at most one — exactly the roadmap rule.
    const ratio = financialRatio({ identityPassedHoldings: 1, holdingsWithFinancialData: 1, totalHoldings: 64 });
    assert.equal(ratio.numerator, 1);
    assert.equal(ratio.denominator, 64);
    assert.equal(ratio.percent, 1.6);
    assert.match(ratio.numeratorRule, /only if its own identity passes/);
    assert.throws(
      () => financialRatio({ identityPassedHoldings: 1, holdingsWithFinancialData: 2, totalHoldings: 64 }),
      /only if its own identity passes/,
      'inputs violating the identity rule are refused, never silently clamped',
    );
    const none = financialRatio({ identityPassedHoldings: 0, holdingsWithFinancialData: 0, totalHoldings: 64 });
    assert.equal(none.percent, 0);
  });

  test('the gate mechanism itself is testable once θF is asserted from observed evidence (synthetic values only)', () => {
    // Mechanism check with synthetic numbers — NOT an asserted θF value and not a claim: the
    // authoritative position remains "no defensible value can yet be asserted".
    const syntheticAsserted = {
      ...THETA_F,
      assertionStatus: 'ASSERTED_FROM_OBSERVED_EVIDENCE' as const,
      value: 50,
    };
    const reaching = financialRatio({ identityPassedHoldings: 4, holdingsWithFinancialData: 2, totalHoldings: 4 });
    assert.equal(evaluateW20Gate(reaching, syntheticAsserted).open, true);
    const below = financialRatio({ identityPassedHoldings: 4, holdingsWithFinancialData: 1, totalHoldings: 4 });
    assert.equal(evaluateW20Gate(below, syntheticAsserted).open, false);
    assert.equal(THETA_F.value, null, 'the exported θF record itself asserts no value');
  });
});

describe('W05 — required operating-metric completeness is assessed, not assumed', () => {
  test('a sector-required metric with no report fails the metric gate and is named', () => {
    const required = sectorRequirements('Technology').metrics;
    assert.ok(required.length > 0, 'the fixture sector has governed metric requirements');
    const dropped = required[0]!;
    const incompleteMetrics = completeMetrics(ISSUER_A, 'Technology').filter((metric) => metric.metricId !== dropped);

    const qualification = qualify({ operatingMetrics: incompleteMetrics });

    assert.equal(qualification.metricCompleteness.sectorDeterminable, true);
    assert.equal(
      qualification.metricCompleteness.requiredSetStatus,
      'PROVISIONAL_PENDING_W10',
      'the required-metric SET is provisional pending W10 and is never presented as settled',
    );
    assert.match(qualification.metricCompleteness.note, /provisional pending W10/);
    assert.deepEqual(qualification.metricCompleteness.missingMetricIds, [dropped]);
    assert.equal(qualification.metricCompleteness.reportedMetricIds.length, required.length - 1);
    assert.match(qualification.metricCompleteness.note, new RegExp(dropped));
    const gate = qualification.gates.find((entry) => entry.gate === 'REQUIRED_METRICS_PRESENT')!;
    assert.equal(gate.passed, false);

    // It is consequential WHERE REQUIRED: valuation input is refused; statement analysis is not.
    const valuation = applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'VALUATION_INPUT');
    assert.equal(valuation.decision, 'BELOW_THRESHOLD');
    assert.ok(valuation.failedGates.includes('REQUIRED_METRICS_PRESENT'));
    const statements = applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'STATEMENT_ANALYSIS');
    assert.equal(statements.decision, 'MEETS_THRESHOLD');
  });

  test('a nil disclosure or reported zero is a report — missing stays distinct', () => {
    const required = sectorRequirements('Technology').metrics;
    const nilId = required[0]!;
    const zeroId = required[1] ?? required[0]!;
    const metrics = completeMetrics(ISSUER_A, 'Technology', {
      [nilId]: syntheticNil('2026-03-31'),
      [zeroId]: present(0, { kind: 'FILING', ref: 'w05-synthetic-fixture' }),
    });

    const qualification = qualify({ operatingMetrics: metrics });

    // Both count as REPORTS: the metric gate passes even though one is nil and one is zero.
    assert.equal(qualification.metricCompleteness.missingMetricIds.length, 0);
    const gate = qualification.gates.find((entry) => entry.gate === 'REQUIRED_METRICS_PRESENT')!;
    assert.equal(gate.passed, true);
    assert.equal(qualification.metricCompleteness.observationCounts.nilByDisclosure, 1);
    assert.equal(qualification.metricCompleteness.observationCounts.zero, 1);

    // And a metric with no observation at all is missing — never nil, never zero.
    const withoutAny = completeMetrics(ISSUER_A, 'Technology').filter((metric) => metric.metricId !== nilId);
    const missing = qualify({ operatingMetrics: withoutAny });
    assert.equal(missing.metricCompleteness.missingMetricIds.length, 1);
    assert.equal(missing.metricCompleteness.observationCounts.missing, 0, 'absence is a missing REQUIRED metric, not a missing observation');
  });

  test('an unrecorded or off-vocabulary sector fails the metric gate closed', () => {
    const unknown = qualify({ sector: null, operatingMetrics: completeMetrics(ISSUER_A, 'Technology') });
    const gate = unknown.gates.find((entry) => entry.gate === 'REQUIRED_METRICS_PRESENT')!;
    assert.equal(gate.passed, false);
    assert.match(gate.reason, /cannot be established|fails closed/);
    assert.equal(unknown.metricCompleteness.sectorDeterminable, false);
    assert.deepEqual(unknown.metricCompleteness.requiredMetricIds, []);

    const offVocabulary = qualify({ sector: 'Space-Tourism', operatingMetrics: [] });
    assert.equal(offVocabulary.metricCompleteness.sectorDeterminable, false);
    assert.ok(offVocabulary.failedGates.includes('REQUIRED_METRICS_PRESENT'));
  });

  test('the metric assessment is part of the reproducible evidence', () => {
    const qualification = qualify();
    assert.equal(qualification.metricCompleteness.reportedMetricIds.length, sectorRequirements('Technology').metrics.length);
    assert.ok(qualification.evidence.operatingMetrics.length > 0, 'metric observations are retained in the evidence snapshot');
    assert.deepEqual(qualificationFromEvidence(qualification.evidence), qualification);
    const gate = qualification.gates.find((entry) => entry.gate === 'REQUIRED_METRICS_PRESENT')!;
    assert.equal(gate.passed, true);
  });
});
