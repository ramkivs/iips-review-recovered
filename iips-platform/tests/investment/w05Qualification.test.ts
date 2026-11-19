/**
 * W05-C/W05-D — dataset qualification and the qualification-threshold mechanism.
 *
 * Acceptance tests: 3 (unknown rights cannot qualify), 5 (stale), 6 (missing periods and
 * incomplete statements), 7 (standalone vs consolidated), 8 (missing/nil/zero/unmapped distinct),
 * 9 (accounting limitations retained and consequential), 10 (reproducible from recorded
 * evidence and rules) — plus the threshold mechanism: documented, testable, configurable, and
 * never treated as approved; the separate entitlement and retention verdicts carried through
 * qualification; and coverage by analytical method (disclosure only, provisional pending W10).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_QUALIFICATION_POLICY,
  effectiveRightsStatus,
  qualifyIssuerDataset,
  qualificationFromEvidence,
  rightsBlockOf,
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
import { SECTOR_METHODS } from '../../src/investment/coverage/methodMatrix';
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
  return rightsBlockOf(syntheticRightsRecord(AS_OF_FRESH));
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

    const qualification = qualify({ rights: rightsBlockOf(unknownRights) });

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
        ...rightsBlockOf(unknownRights),
        manifestRightsState: 'UNKNOWN',
        datasetClass: 'UNKNOWN',
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
    // The impact statement keeps the two censuses apart: the only measurement on record is the
    // historical one over the Dhan CSV, and nothing is claimed as measured against revision 1.
    assert.match(threshold.provenance.impact, /0 of 65 ISIN-resolved rows of the published 68-row Dhan CSV/);
    assert.match(threshold.provenance.impact, /No financial-data coverage of the W04 revision-1 holdings \(64 holdings\) has been measured/);
    assert.doesNotMatch(threshold.provenance.impact, /0 of 64/, 'no 0-of-64 figure is presented: revision 1 was never processed');
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
    // ARITHMETIC CHECK WITH ILLUSTRATIVE INPUTS — not a measurement. The numbers are typed in here
    // (64 is the size of the W04 revision-1 census); no revision-1 holding was processed and this
    // test is no evidence of real coverage. It shows only that the function never admits more
    // holdings with data than holdings whose identity passed.
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

  test('the θF condition is evaluated on the unrounded ratio and never opens on an empty denominator', () => {
    // Synthetic mechanism values only — not an asserted θF.
    const asserted = (value: number) => ({
      ...THETA_F,
      assertionStatus: 'ASSERTED_FROM_OBSERVED_EVIDENCE' as const,
      value,
    });

    // 1999 of 2000 is 99.95%. It DISPLAYS as 100.0 but does not reach 100: rounding is display only.
    const justBelow = financialRatio({ identityPassedHoldings: 2000, holdingsWithFinancialData: 1999, totalHoldings: 2000 });
    assert.equal(justBelow.percent, 100, 'the displayed figure rounds up');
    assert.equal(evaluateW20Gate(justBelow, asserted(100)).open, false, 'the gate does not evaluate the rounded figure');
    const exactly = financialRatio({ identityPassedHoldings: 2000, holdingsWithFinancialData: 2000, totalHoldings: 2000 });
    assert.equal(evaluateW20Gate(exactly, asserted(100)).open, true);

    // An empty denominator is "not applicable", never 100% and never a pass — even at θF = 0.
    const empty = financialRatio({ identityPassedHoldings: 0, holdingsWithFinancialData: 0, totalHoldings: 0 });
    const emptyGate = evaluateW20Gate(empty, asserted(0));
    assert.equal(emptyGate.open, false);
    assert.match(emptyGate.reason, /not applicable/);
    assert.match(emptyGate.reason, /fail closed/);
  });
});

describe('W05 — entitlement and retention stay separate through qualification', () => {
  test('the evidence snapshot carries both verdicts and their reasons beside the combined status', () => {
    const record = operatorAssertedRightsRecord(AS_OF_FRESH, { RETENTION: 'UNKNOWN' });
    assert.equal(record.entitlementStatus, 'ELIGIBLE_LOCAL_PERSONAL_USE');
    assert.equal(record.retentionStatus, 'UNKNOWN');

    const qualification = qualify({ rights: rightsBlockOf(record) });
    const rights = qualification.evidence.rights;

    // Nothing is dropped at the qualification seam: entitlement is still visibly satisfied and
    // retention is still visibly the verdict that fails.
    assert.equal(rights.status, 'UNKNOWN');
    assert.equal(rights.entitlementStatus, 'ELIGIBLE_LOCAL_PERSONAL_USE');
    assert.equal(rights.entitlementReason, record.entitlementReason);
    assert.equal(rights.retentionStatus, 'UNKNOWN');
    assert.equal(rights.retentionReason, record.retentionReason);
    assert.match(rights.retentionReason, /retention fails closed/);

    // The combined fail-closed result and its accepted wording are unchanged.
    const gate = qualification.gates.find((entry) => entry.gate === 'RIGHTS_ELIGIBLE')!;
    assert.equal(gate.passed, false);
    assert.equal(gate.reason, record.statusReason);
    assert.deepEqual(qualificationFromEvidence(qualification.evidence), qualification, 'both verdicts are part of the reproducible evidence');
  });

  test('entitlement failing with retention satisfied is equally visible, and equally fails closed', () => {
    const record = operatorAssertedRightsRecord(AS_OF_FRESH, { ANALYSIS: 'NOT_PERMITTED' });
    const qualification = qualify({ rights: rightsBlockOf(record) });
    const rights = qualification.evidence.rights;
    assert.equal(rights.entitlementStatus, 'RESTRICTED');
    assert.equal(rights.retentionStatus, 'ELIGIBLE_LOCAL_PERSONAL_USE');
    assert.equal(rights.status, 'RESTRICTED');
    assert.ok(qualification.failedGates.includes('RIGHTS_ELIGIBLE'));
  });

  test('a rights block whose combined status is more permissive than a separate verdict fails closed', () => {
    const eligible = rightsSummary();
    assert.equal(effectiveRightsStatus(eligible), 'ELIGIBLE_LOCAL_PERSONAL_USE');

    // A hand-built block claiming ELIGIBLE overall while retention is unknown is inconsistent.
    const inconsistent = { ...eligible, retentionStatus: 'UNKNOWN' as const, retentionReason: 'retention not verified' };
    assert.equal(effectiveRightsStatus(inconsistent), 'UNKNOWN');
    const qualification = qualify({ rights: inconsistent });
    const gate = qualification.gates.find((entry) => entry.gate === 'RIGHTS_ELIGIBLE')!;
    assert.equal(gate.passed, false);
    assert.match(gate.reason, /more permissive than its separate verdicts/);
    assert.match(gate.reason, /fails closed/);
    assert.equal(
      applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'VALUATION_INPUT').decision,
      'BELOW_THRESHOLD',
    );

    // RESTRICTED in either verdict is never outranked by an ELIGIBLE combined status.
    assert.equal(effectiveRightsStatus({ ...eligible, entitlementStatus: 'RESTRICTED' }), 'RESTRICTED');
    // UNKNOWN is the worst and wins over RESTRICTED.
    assert.equal(effectiveRightsStatus({ ...eligible, entitlementStatus: 'RESTRICTED', retentionStatus: 'UNKNOWN' }), 'UNKNOWN');
  });

  test('a rights block with a verdict missing altogether is never read as permission', () => {
    // An evidence snapshot recorded without the separate verdicts (or with a value outside the
    // vocabulary) cannot be shown to have had retention assessed: it fails closed.
    const { retentionStatus: _retention, ...withoutRetention } = rightsSummary();
    const damaged = withoutRetention as unknown as ReturnType<typeof rightsSummary>;
    assert.equal(effectiveRightsStatus(damaged), 'UNKNOWN');
    assert.ok(qualify({ rights: damaged }).failedGates.includes('RIGHTS_ELIGIBLE'));

    const offVocabulary = { ...rightsSummary(), entitlementStatus: 'FINE' } as unknown as ReturnType<typeof rightsSummary>;
    assert.equal(effectiveRightsStatus(offVocabulary), 'UNKNOWN');
  });
});

describe('W05 — coverage by analytical method: the roadmap method dimension, disclosure only', () => {
  test('each method the governed matrix declares for the sector is measured against the dataset', () => {
    const qualification = qualify();
    const block = qualification.methodCoverage;

    assert.equal(block.requirementStatus, 'PROVISIONAL_PENDING_W10', 'method requirements are never presented as settled');
    assert.match(block.note, /provisional pending W10/);
    assert.match(block.note, /not a gate/);
    assert.equal(block.sector, 'Technology');
    assert.equal(block.sectorDeterminable, true);
    assert.equal(block.seriesScope, qualification.seriesScope);

    // The methods are the governed matrix's, in its order — nothing is invented here.
    const declared = SECTOR_METHODS.Technology;
    assert.deepEqual(block.methods.map((method) => method.methodId), declared.map((requirement) => requirement.methodId));
    for (const [index, method] of block.methods.entries()) {
      assert.deepEqual(method.requiredLineItems, [...declared[index]!.lineItems]);
      assert.deepEqual(method.requiredMetricIds, [...declared[index]!.metrics]);
      assert.equal(method.role, declared[index]!.role);
      assert.equal(method.latestPeriodEnd, '2026-03-31');
    }
    // Method coverage is NOT dataset qualification. This dataset meets the per-dataset ruleset,
    // yet one declared method is not covered: the fixture carries no NET_DEBT, which EV/EBITDA
    // declares. The absent input stays absent — it is not read as zero to make the method pass.
    const covered = block.methods.filter((method) => method.latestPeriodQualified).map((method) => method.methodId);
    assert.deepEqual(covered, ['DCF_FCFF', 'PE_RELATIVE', 'EV_REVENUE']);
    const evEbitda = block.methods.find((method) => method.methodId === 'EV_EBITDA')!;
    assert.ok(evEbitda.requiredLineItems.includes('NET_DEBT'));
    assert.equal(evEbitda.latestPeriodQualified, false);
    assert.deepEqual(evEbitda.qualifyingPeriodEnds, []);
    assert.equal(
      applyQualificationThreshold(qualification, DATASET_QUALIFICATION_THRESHOLD, 'VALUATION_INPUT').decision,
      'MEETS_THRESHOLD',
      'the per-dataset ruleset result is unchanged by the method disclosure',
    );
    assert.match(block.note, /3 of 4 method\(s\) declared for Technology/);
    assert.deepEqual(qualificationFromEvidence(qualification.evidence).methodCoverage, block, 'method coverage is reproducible from the evidence');
  });

  test('a method is distinguished from its neighbours: a missing input fails only the methods that declare it', () => {
    // EPS_DILUTED is declared by the P/E method only. Missing must stay missing — never zero.
    const periods = threeCompleteAnnuals(ISSUER_A).map((period) =>
      period.period.periodEnd === '2026-03-31'
        ? annualPeriod(ISSUER_A, 2026, completeItems({ EPS_DILUTED: syntheticMissing('NOT_REPORTED') }))
        : period,
    );
    const block = qualify({ periods }).methodCoverage;
    const byId = new Map(block.methods.map((method) => [method.methodId, method]));

    const pe = byId.get('PE_RELATIVE')!;
    assert.ok(pe.requiredLineItems.includes('EPS_DILUTED'));
    assert.equal(pe.latestPeriodQualified, false, 'a missing declared input does not qualify the method');
    assert.ok(!pe.qualifyingPeriodEnds.includes('2026-03-31'));
    assert.ok(pe.qualifyingPeriodEnds.length > 0, 'earlier periods that hold the input are still reported, as history');

    const dcf = byId.get('DCF_FCFF')!;
    assert.ok(!dcf.requiredLineItems.includes('EPS_DILUTED'));
    assert.equal(dcf.latestPeriodQualified, true, 'a method that does not declare the input is unaffected');
  });

  test('a method needing an operating metric is not covered when the metric is absent', () => {
    const evRevenue = SECTOR_METHODS.Technology.find((requirement) => requirement.methodId === 'EV_REVENUE')!;
    assert.ok(evRevenue.metrics.length > 0, 'the fixture method declares operating metrics');
    const dropped = evRevenue.metrics[0]!;
    const metrics = completeMetrics(ISSUER_A, 'Technology').filter((metric) => metric.metricId !== dropped);

    const block = qualify({ operatingMetrics: metrics }).methodCoverage;
    const byId = new Map(block.methods.map((method) => [method.methodId, method]));
    assert.equal(byId.get('EV_REVENUE')!.latestPeriodQualified, false);
    assert.equal(byId.get('DCF_FCFF')!.latestPeriodQualified, true);
  });

  test('method coverage is a disclosure: it adds no gate and changes no qualification result', () => {
    const complete = qualify();
    const periods = threeCompleteAnnuals(ISSUER_A).map((period) =>
      period.period.periodEnd === '2026-03-31'
        ? annualPeriod(ISSUER_A, 2026, completeItems({ EPS_DILUTED: syntheticMissing('NOT_REPORTED') }))
        : period,
    );
    const partial = qualify({ periods });

    assert.deepEqual(
      partial.gates.map((entry) => entry.gate),
      complete.gates.map((entry) => entry.gate),
      'no method gate exists',
    );
    assert.ok(!partial.gates.some((entry) => /METHOD/.test(entry.gate)));
    assert.ok(partial.methodCoverage.methods.some((method) => !method.latestPeriodQualified));
  });

  test('an unrecorded or off-vocabulary sector names no methods and claims no method coverage', () => {
    for (const sector of [null, 'Space-Tourism']) {
      const block = qualify({ sector }).methodCoverage;
      assert.equal(block.sectorDeterminable, false);
      assert.deepEqual(block.methods, []);
      assert.equal(block.requirementStatus, 'PROVISIONAL_PENDING_W10');
      assert.match(block.note, /cannot be determined and no method coverage is claimed/);
    }
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
