/**
 * W10 — field resolution.
 *
 * Turns one `FieldMapping` plus one issuer's governed dataset into one `FieldQualification`. Nothing here
 * scores anything: a field either resolves to a value with evidence a reader can re-perform, or it
 * refuses with a code that names why. Every refusal path is exercised by the W10 suite.
 *
 * The resolver consumes the existing contracts rather than re-deriving them:
 *  - `operatingMetrics.ts` supplies the canonical unit, range, source-class floor and cross-field checks;
 *  - `assessment/capitalStructure.ts` supplies gross debt, so the W07 declared-nil and one-instant rules
 *    apply unchanged and a missing `CURRENT_INVESTMENTS` / `PREFERENCE_CAPITAL` cannot leak in as a zero;
 *  - `assessment/periods.ts` supplies the period views and the derived-item lookup used by the declared
 *    derivations.
 */
import type { MetricId, MetricIssue } from '../contracts/operatingMetrics';
import { OPERATING_METRICS, satisfiesMinimumSourceClass, validateMetricValue } from '../contracts/operatingMetrics';
import type { LineItemId } from '../contracts/lineItems';
import type { NumericObservation } from '../contracts/observation';
import { isPresent } from '../contracts/observation';
import { periodObservation } from '../assessment/periods';
import { buildCapitalStructure } from '../assessment/capitalStructure';
import type { CapitalStructure, FinancialPeriodView, SeriesSelection } from '../assessment/types';
import type { DatasetContent } from '../fundamentals/types';
import { DERIVATIONS } from './mapping';
import type {
  DerivationId,
  FieldEvidence,
  FieldMapping,
  FieldOutcome,
  FieldQualification,
  QualificationCode,
  QualificationContext,
  QualificationPolicy,
} from './types';
import { daysBetween, isFiniteNumber, snapshotObservation, type NumericalObservationSnapshot } from './evidence';

/** Result of resolving one field, before requirement/engine aggregation. */
export interface Resolution {
  readonly outcome: FieldOutcome;
  readonly value: number | string | boolean | null;
  readonly unit: string | null;
  readonly codes: readonly QualificationCode[];
  readonly evidence: FieldEvidence | null;
  readonly note: string;
}

const round6 = (value: number): number => Number(value.toFixed(6));

const EMPTY_EVIDENCE: FieldEvidence = Object.freeze({
  periodEnd: null,
  periodStart: null,
  statementScope: null,
  basis: null,
  presence: null,
  reason: null,
  source: null,
  filingRef: null,
  filedAt: null,
  sourceClass: null,
  sourceValue: null,
  components: [],
});

function refuse(outcome: FieldOutcome, code: QualificationCode, note: string, evidence: FieldEvidence | null = null): Resolution {
  return { outcome, value: null, unit: null, codes: [code], evidence, note };
}

function mapMetricIssue(issue: MetricIssue): QualificationCode {
  switch (issue.code) {
    case 'UNIT_MISMATCH':
      return 'FIELD_UNIT_MISMATCH';
    case 'OUT_OF_RANGE':
      return 'FIELD_OUT_OF_RANGE';
    case 'MISSING_VALUE':
      return 'FIELD_NON_FINITE';
    case 'CROSS_FIELD_VIOLATION':
      return 'FIELD_CROSS_FIELD_VIOLATION';
    case 'SOURCE_CLASS_TOO_WEAK':
      return 'FIELD_SOURCE_CLASS_TOO_WEAK';
    case 'UNKNOWN_METRIC':
    default:
      return 'FIELD_SOURCE_UNSUPPORTED';
  }
}

/** Basis/presence gates shared by direct observations and derivation inputs. */
function observationRefusal(observation: NumericObservation, policy: QualificationPolicy): QualificationCode | null {
  if (observation.presence === 'IMPUTED' && !policy.allowImputedObservations) return 'FIELD_IMPUTED_NOT_PERMITTED';
  if (observation.basis === 'IMPUTED' && !policy.allowImputedObservations) return 'FIELD_IMPUTED_NOT_PERMITTED';
  if (observation.presence === 'NIL_BY_DISCLOSURE') return 'FIELD_NIL_NOT_ZERO';
  return null;
}

function evidenceOf(
  view: FinancialPeriodView | null,
  observation: NumericObservation,
  components: readonly NumericalObservationSnapshot[] = [],
  sourceClass: string | null = null,
): FieldEvidence {
  return Object.freeze({
    periodEnd: view?.periodEnd ?? observation.periodEnd ?? null,
    periodStart: view?.periodStart ?? null,
    statementScope: view?.statementScope ?? null,
    basis: observation.basis ?? view?.basis ?? null,
    presence: observation.presence,
    reason: observation.reason ?? null,
    source:
      observation.source === undefined
        ? null
        : Object.freeze({
            kind: observation.source.kind,
            ref: observation.source.ref,
            ...(observation.source.sha256 === undefined ? {} : { sha256: observation.source.sha256 }),
            ...(observation.source.locator === undefined ? {} : { locator: observation.source.locator }),
          }),
    filingRef: observation.filingRef ?? view?.filingRef ?? null,
    filedAt: view?.filedAt ?? null,
    sourceClass,
    sourceValue: observation.presence === 'PRESENT' ? observation.value : null,
    components: Object.freeze([...components]),
  });
}

/** One issuer's resolution context: period views, W07 capital structure and per-derivation memo. */
export class FieldResolver {
  private readonly memo = new Map<DerivationId, Resolution>();
  private capitalStructure: CapitalStructure | null = null;
  private capitalStructureBuilt = false;

  constructor(
    private readonly content: DatasetContent,
    private readonly context: QualificationContext,
    private readonly series: SeriesSelection | null,
    private readonly target: FinancialPeriodView | null,
    private readonly prior: FinancialPeriodView | null,
  ) {}

  resolve(mapping: FieldMapping): Resolution {
    const requirement = mapping.requirement;
    const isAdvisory = requirement === 'DECISION_FLAG';
    const isConditional = requirement === 'CONDITIONAL';

    if (requirement === 'DECLARED_UNUSED') {
      return {
        outcome: 'NOT_EVALUATED',
        value: null,
        unit: null,
        codes: [],
        evidence: null,
        note: 'Declared in the frozen interface but not read by the scoring or decision path; published for auditability only, so nothing depends on its resolution.',
      };
    }

    if (mapping.status === 'UNMAPPED') {
      if (isAdvisory) {
        return {
          outcome: 'OPTIONAL_ABSENT',
          value: null,
          unit: null,
          codes: ['FIELD_DECISION_FLAG_UNSUPPORTED'],
          evidence: null,
          note: `No governed source exists for this decision flag (${mapping.evidenceSource}). The engine will run without it; that limitation is published and is never read as evidence that no adverse event occurred.`,
        };
      }
      if (isConditional) {
        return {
          outcome: 'OPTIONAL_ABSENT',
          value: null,
          unit: null,
          codes: ['FIELD_CONDITIONAL_INPUT_DEFAULTED'],
          evidence: null,
          note: `No governed source exists for this conditional input (${mapping.evidenceSource}); the frozen engine’s documented fallback applies and the limitation is recorded.`,
        };
      }
      return refuse('UNSUPPORTED', 'FIELD_SOURCE_UNSUPPORTED', `No governed source exists for this required input: ${mapping.evidenceSource}.`);
    }

    if (mapping.status === 'CONFLICT') {
      if (isAdvisory || isConditional) {
        return {
          outcome: 'OPTIONAL_ABSENT',
          value: null,
          unit: null,
          codes: ['FIELD_SEMANTIC_CONFLICT'],
          evidence: null,
          note: `Calibration conflict recorded; the input is not required for readiness but the conflict is published: ${mapping.calibrationImplication}`,
        };
      }
      return refuse('CONFLICT', 'FIELD_SEMANTIC_CONFLICT', mapping.calibrationImplication);
    }

    if (this.target === null) {
      return refuse('MISSING', 'ENGINE_NO_CONSOLIDATED_PERIOD', 'The issuer has no annual period at the required statement scope, so no field can resolve.');
    }

    const stale = this.stalenessRefusal(mapping);
    if (stale !== null) return stale;

    if (mapping.source.kind === 'OPERATING_METRIC') return this.resolveMetric(mapping, mapping.source.metricId);
    if (mapping.source.kind === 'ISSUER_SUBSECTOR') return this.resolveSelector(mapping);
    if (mapping.source.kind === 'DERIVATION') return this.resolveDerivation(mapping, mapping.source.derivationId);
    return refuse('UNSUPPORTED', 'FIELD_SOURCE_UNSUPPORTED', 'No governed source exists for this required input.');
  }

  /** Freshness is evaluated before resolution so a stale period refuses once, with one code. */
  private stalenessRefusal(mapping: FieldMapping): Resolution | null {
    const view = this.target;
    if (view === null) return null;
    const age = daysBetween(view.periodEnd, this.context.asOf);
    const limit = mapping.freshnessKind === 'BALANCE_SHEET' ? this.context.policy.balanceSheetFreshnessDays : this.context.policy.pnlFreshnessDays;
    if (age === null) {
      return refuse('INVALID', 'FIELD_PERIOD_MISMATCH', `The period end '${view.periodEnd}' is not a usable ISO date, so freshness cannot be established.`);
    }
    if (age < 0) {
      return refuse('INVALID', 'FIELD_OBSERVED_IN_FUTURE', `The period end ${view.periodEnd} is after the evaluation clock ${this.context.asOf}.`);
    }
    if (age > limit) {
      return refuse(
        'STALE',
        'FIELD_STALE',
        `The latest period end ${view.periodEnd} is ${age} days before ${this.context.asOf}; the ${mapping.freshnessKind === 'BALANCE_SHEET' ? 'balance-sheet' : 'P&L'} window is ${limit} days (${mapping.freshness}).`,
        {
          ...EMPTY_EVIDENCE,
          periodEnd: view.periodEnd,
          periodStart: view.periodStart,
          statementScope: view.statementScope,
          basis: view.basis,
          presence: 'MISSING',
          reason: 'PERIOD_NOT_COVERED',
          filingRef: view.filingRef,
          filedAt: view.filedAt,
        },
      );
    }
    if (view.basis === 'RESTATED' && !this.context.policy.allowRestatedPeriods) {
      return refuse('INVALID', 'FIELD_RESTATEMENT_NOT_PERMITTED', 'The period is a restatement and the qualification policy refuses restated periods.');
    }
    return null;
  }

  private resolveMetric(mapping: FieldMapping, metricId: MetricId): Resolution {
    const meta = OPERATING_METRICS[metricId];
    const target = this.target as FinancialPeriodView;
    const records = this.content.operatingMetrics.filter(
      (record) => record.issuerId === this.context.issuerId && record.metricId === metricId,
    );

    if (records.length === 0) {
      return refuse(
        'MISSING',
        'FIELD_METRIC_ABSENT',
        `No ${metricId} record exists for this issuer; the canonical metric is not populated, and absence is not zero.`,
      );
    }

    const atPeriod = records.filter((record) => record.periodEnd === target.periodEnd);
    if (atPeriod.length === 0) {
      const observed = [...new Set(records.map((record) => record.periodEnd))].sort();
      return refuse(
        'PERIOD_MISMATCH',
        'FIELD_PERIOD_MISMATCH',
        `${metricId} exists only for period(s) ${observed.join(', ')}; the qualified period is ${target.periodEnd}. A metric from another period is not substituted.`,
      );
    }

    const atScope = atPeriod.filter((record) => record.statementScope === this.context.policy.requiredStatementScope);
    if (atScope.length === 0) {
      return refuse(
        'SCOPE_MISMATCH',
        'FIELD_SCOPE_MISMATCH',
        `${metricId} exists for ${target.periodEnd} only at another statement scope; ${this.context.policy.requiredStatementScope} is required and a standalone figure is not substituted.`,
      );
    }

    const distinct = [...new Set(atScope.map((record) => `${String(record.observation.value)}|${record.validation}|${record.sourceClass}`))];
    if (distinct.length > 1) {
      return refuse(
        'INVALID',
        'FIELD_METRIC_AMBIGUOUS',
        `${metricId} has ${atScope.length} conflicting records at ${target.periodEnd}: ${distinct.join(' vs ')}. Qualification refuses to choose between them.`,
      );
    }

    const record = atScope[0]!;
    const observation = record.observation;
    const observedEvidence = evidenceOf(target, observation, [snapshotObservation(metricId, observation)], record.sourceClass);
    const metricEvidence = Object.freeze({
      ...observedEvidence,
      source: Object.freeze({ kind: 'OPERATING_METRIC', ref: record.sourceRef }),
    });

    if (record.validation !== 'VALID') {
      return refuse(
        record.validation === 'CONFLICT' ? 'CONFLICT' : 'INVALID',
        record.validation === 'CONFLICT' ? 'FIELD_METRIC_CONFLICT' : 'FIELD_METRIC_UNVALIDATED',
        `${metricId} is present but its validation state is ${record.validation}; an unvalidated or contested metric cannot satisfy a required input.`,
        metricEvidence,
      );
    }

    const presenceRefusal = observationRefusal(observation, this.context.policy);
    if (presenceRefusal !== null) {
      return refuse(
        presenceRefusal === 'FIELD_NIL_NOT_ZERO' ? 'NIL_NOT_ZERO' : 'INVALID',
        presenceRefusal,
        presenceRefusal === 'FIELD_NIL_NOT_ZERO'
          ? `${metricId} is a positive declaration of nil; a nil is not a number and is never read as zero.`
          : `${metricId} is imputed (or carries an imputed basis); the qualification policy refuses imputed observations.`,
        metricEvidence,
      );
    }

    if (!isPresent(observation) || !isFiniteNumber(observation.value)) {
      return refuse(
        'MISSING',
        'FIELD_OBSERVATION_MISSING',
        `${metricId} is not a present finite number (presence=${observation.presence}${observation.reason === undefined ? '' : `, reason=${observation.reason}`}).`,
        metricEvidence,
      );
    }

    const floor = this.context.policy.minimumOperatingMetricSourceClass ?? meta.minimumSourceClass;
    if (!satisfiesMinimumSourceClass(record.sourceClass, floor)) {
      return refuse(
        'INVALID',
        'FIELD_SOURCE_CLASS_TOO_WEAK',
        `${metricId} is sourced as ${record.sourceClass}; the floor for this input is ${floor}.`,
        metricEvidence,
      );
    }

    const issues = validateMetricValue(metricId, observation.value, record.unit);
    if (issues.length > 0) {
      return refuse(
        'INVALID',
        mapMetricIssue(issues[0]!),
        `${metricId} failed canonical validation: ${issues.map((issue) => issue.detail).join('; ')}`,
        metricEvidence,
      );
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(record.observedAt)) {
      const observedAge = daysBetween(record.observedAt, this.context.asOf);
      if (observedAge !== null && observedAge < 0) {
        return refuse('INVALID', 'FIELD_OBSERVED_IN_FUTURE', `${metricId} was observed at ${record.observedAt}, after the evaluation clock ${this.context.asOf}.`, metricEvidence);
      }
    }

    return {
      outcome: 'RESOLVED',
      value: observation.value,
      unit: record.unit,
      codes: [],
      evidence: metricEvidence,
      note: `Canonical ${metricId} (${record.unit}) from ${record.sourceClass}, validation=${record.validation}, statement scope ${record.statementScope}.`,
    };
  }

  private resolveSelector(mapping: FieldMapping): Resolution {
    const vocabulary = mapping.source.kind === 'ISSUER_SUBSECTOR' ? mapping.source.vocabulary : [];
    const issuer = this.content.issuers.find((candidate) => candidate.issuerId === this.context.issuerId);
    const raw = issuer?.subSegment ?? null;
    const normalised = normaliseClassification(raw);
    if (normalised === null || !vocabulary.includes(normalised)) {
      return {
        outcome: 'SELECTOR_UNRESOLVED',
        value: null,
        unit: null,
        codes: ['FIELD_SELECTOR_UNRESOLVED'],
        evidence: { ...EMPTY_EVIDENCE, sourceValue: raw },
        note:
          raw === null
            ? 'The issuer record carries no subSegment classification, so the engine’s segment selector cannot be resolved (the frozen engine would fall back to a default or throw).'
            : `The issuer’s subSegment '${raw}' is not a member of the engine’s closed vocabulary [${vocabulary.join(', ')}]; no fuzzy or partial match is attempted.`,
      };
    }
    return {
      outcome: 'RESOLVED',
      value: normalised,
      unit: 'ENUM',
      codes: [],
      evidence: { ...EMPTY_EVIDENCE, sourceValue: raw, source: { kind: 'DATASET', ref: 'roster.subSegment' } },
      note: `Issuer classification '${raw}' normalised to '${normalised}', an exact member of the engine vocabulary.`,
    };
  }

  private resolveDerivation(_mapping: FieldMapping, derivationId: DerivationId): Resolution {
    const memoised = this.memo.get(derivationId);
    if (memoised !== undefined) return memoised;
    const resolved = this.computeDerivation(derivationId);
    this.memo.set(derivationId, resolved);
    return resolved;
  }

  private computeDerivation(derivationId: DerivationId): Resolution {
    const view = this.target;
    if (view === null) {
      return refuse('MISSING', 'ENGINE_NO_CONSOLIDATED_PERIOD', 'No annual consolidated period exists, so no derivation can run.');
    }
    const definition = DERIVATIONS[derivationId];
    if (definition.policyGate === 'CLOSING_BALANCE_DENOMINATOR' && !this.context.policy.allowClosingBalanceRatioDerivations) {
      return refuse(
        'DERIVATION_NOT_PERMITTED',
        'FIELD_DERIVATION_NOT_PERMITTED',
        `${derivationId} is a closing-balance ratio and the qualification policy does not permit that declared deviation (${definition.deviation ?? 'averaging basis not established'}).`,
      );
    }

    const input = (item: LineItemId): NumericObservation => periodObservation(view, item);
    const components: NumericalObservationSnapshot[] = [];
    const snapshotOf = (item: LineItemId, observation: NumericObservation): void => {
      components.push(snapshotObservation(item, observation));
    };
    const blocked = (note: string): Resolution =>
      refuse('DERIVATION_BLOCKED', 'FIELD_DERIVATION_INPUT_MISSING', `${derivationId} cannot run: ${note}`, {
        ...EMPTY_EVIDENCE,
        periodEnd: view.periodEnd,
        periodStart: view.periodStart,
        statementScope: view.statementScope,
        basis: 'DERIVED',
        presence: 'NOT_COMPUTABLE',
        reason: 'DERIVATION_NOT_SUPPORTED',
        components,
      });

    const usable = (observation: NumericObservation, item: LineItemId): boolean => {
      if (observation.presence === 'IMPUTED' && !this.context.policy.allowImputedObservations) return false;
      if (observation.presence === 'NIL_BY_DISCLOSURE') return false;
      return observation.presence === 'PRESENT' && isFiniteNumber(observation.value);
    };

    const finish = (value: number, unit: string, note: string, primary: NumericObservation): Resolution => ({
      outcome: 'RESOLVED',
      value: round6(value),
      unit,
      codes: [],
      evidence: {
        ...evidenceOf(view, primary, components),
        basis: 'DERIVED',
        presence: 'DERIVED',
        source: { kind: 'DERIVED', ref: `w10-derivation/${derivationId}` },
        sourceValue: null,
      },
      note,
    });

    if (derivationId === 'EBITDA_MARGIN_PCT') {
      const ebitda = input('EBITDA');
      const revenue = input('REVENUE_FROM_OPERATIONS');
      snapshotOf('EBITDA', ebitda);
      snapshotOf('REVENUE_FROM_OPERATIONS', revenue);
      const missingInputs = [
        ...(usable(ebitda, 'EBITDA') ? [] : ['EBITDA']),
        ...(usable(revenue, 'REVENUE_FROM_OPERATIONS') ? [] : ['REVENUE_FROM_OPERATIONS']),
      ];
      if (missingInputs.length > 0) return blocked(`input(s) ${missingInputs.join(', ')} are not present as numbers in ${view.periodEnd}.`);
      const revenueValue = revenue.value as number;
      if (revenueValue === 0) return refuse('DERIVATION_BLOCKED', 'FIELD_ZERO_DENOMINATOR', `${derivationId} divides by revenue from operations, which is reported as zero.`);
      if (revenueValue < 0) return refuse('DERIVATION_BLOCKED', 'FIELD_NEGATIVE_BASE', `${derivationId} divides by a negative revenue base (${revenueValue}).`);
      return finish((100 * (ebitda.value as number)) / revenueValue, 'PERCENT', `100 × EBITDA (${ebitda.value}) ÷ revenue (${revenueValue}) at ${view.periodEnd}.`, ebitda);
    }

    if (derivationId === 'REVENUE_GROWTH_YOY_PCT') {
      const revenue = input('REVENUE_FROM_OPERATIONS');
      snapshotOf('REVENUE_FROM_OPERATIONS', revenue);
      if (!usable(revenue, 'REVENUE_FROM_OPERATIONS')) return blocked(`revenue from operations is not present as a number in ${view.periodEnd}.`);
      const previous = this.prior;
      if (previous === null) return blocked(`no prior annual period is available for ${view.periodEnd}.`);
      const previousRevenue = periodObservation(previous, 'REVENUE_FROM_OPERATIONS');
      snapshotOf('REVENUE_FROM_OPERATIONS', previousRevenue);
      if (previous.fiscalYear !== view.fiscalYear - 1) {
        return blocked(`the prior annual period ends ${previous.periodEnd} (FY${previous.fiscalYear}), which is not the immediately preceding fiscal year of FY${view.fiscalYear}.`);
      }
      if (previous.statementScope !== view.statementScope) {
        return refuse('SCOPE_MISMATCH', 'FIELD_SCOPE_MISMATCH', `${derivationId} would mix ${view.statementScope} and ${previous.statementScope} periods.`);
      }
      if (!usable(previousRevenue, 'REVENUE_FROM_OPERATIONS')) {
        return blocked(`prior-period revenue (${previous.periodEnd}) is not present as a number.`);
      }
      const previousValue = previousRevenue.value as number;
      if (previousValue === 0) return refuse('DERIVATION_BLOCKED', 'FIELD_ZERO_DENOMINATOR', `${derivationId} divides by prior revenue, which is reported as zero.`);
      if (previousValue < 0) return refuse('DERIVATION_BLOCKED', 'FIELD_NEGATIVE_BASE', `${derivationId} divides by a negative prior revenue base (${previousValue}).`);
      const growth = (100 * ((revenue.value as number) - previousValue)) / previousValue;
      return finish(growth, 'PERCENT', `100 × (${revenue.value} − ${previousValue}) ÷ ${previousValue} across ${previous.periodEnd} → ${view.periodEnd}.`, revenue);
    }

    if (derivationId === 'GROSS_DEBT_TO_EBITDA_X') {
      const ebitda = input('EBITDA');
      snapshotOf('EBITDA', ebitda);
      if (!usable(ebitda, 'EBITDA')) return blocked(`EBITDA is not present as a number in ${view.periodEnd}.`);
      const structure = this.structure();
      if (structure === null) return blocked('the W07 capital-structure block could not be built from this dataset.');
      const grossDebt = structure.grossDebt;
      components.push(snapshotObservation('GROSS_DEBT', grossDebt));
      if (grossDebt.presence !== 'PRESENT' || !isFiniteNumber(grossDebt.value)) {
        return refuse(
          'DERIVATION_BLOCKED',
          'FIELD_DERIVATION_INPUT_MISSING',
          `The W07 gross-debt aggregate is ${grossDebt.presence}${grossDebt.reason === undefined ? '' : ` (${grossDebt.reason})`}; absence is never zero, and net debt is not substituted. ${grossDebt.note ?? ''}`.trim(),
          { ...EMPTY_EVIDENCE, periodEnd: view.periodEnd, statementScope: view.statementScope, basis: 'DERIVED', presence: grossDebt.presence, reason: grossDebt.reason ?? null, components },
        );
      }
      // The W07 aggregate carries no period of its own: its instant is the one its four components share. If that
      // instant is not the period the EBITDA comes from (for example because this year's borrowings are missing and
      // W07 falls back to the last year that reported them), the multiple would divide this year's earnings by last
      // year's debt. Refuse rather than publish it.
      const debtInstants = ['shortTermBorrowings', 'currentMaturities', 'longTermBorrowings', 'leaseLiabilities'].map(
        (name) => structure.components[name]?.periodEnd ?? null,
      );
      const debtInstant = new Set(debtInstants).size === 1 ? debtInstants[0] ?? null : null;
      if (debtInstant !== view.periodEnd) {
        return refuse(
          'PERIOD_MISMATCH',
          'FIELD_PERIOD_MISMATCH',
          `The gross-debt aggregate is evidenced at ${debtInstant ?? 'no single balance-sheet instant'} (${debtInstants.map((period) => period ?? 'not reported').join(', ')}) while EBITDA is for ${view.periodEnd}; the W07 one-instant rule and the qualified period both refuse to mix balance sheets, and the prior year’s debt is not substituted.`,
          { ...EMPTY_EVIDENCE, periodEnd: view.periodEnd, statementScope: view.statementScope, basis: 'DERIVED', presence: grossDebt.presence, reason: grossDebt.reason ?? null, components },
        );
      }
      const ebitdaValue = ebitda.value as number;
      if (ebitdaValue === 0) return refuse('DERIVATION_BLOCKED', 'FIELD_ZERO_DENOMINATOR', `${derivationId} divides by EBITDA, which is zero.`);
      if (ebitdaValue < 0) return refuse('DERIVATION_BLOCKED', 'FIELD_NEGATIVE_BASE', `${derivationId} divides by negative EBITDA (${ebitdaValue}); a leverage multiple is undefined.`);
      return finish((grossDebt.value as number) / ebitdaValue, 'TIMES', `W07 gross debt ${grossDebt.value} ÷ EBITDA ${ebitdaValue} at ${view.periodEnd}. ${grossDebt.note ?? ''}`.trim(), grossDebt);
    }

    if (derivationId === 'NET_PROFIT_TO_ASSETS_PCT' || derivationId === 'NET_PROFIT_TO_EQUITY_PCT') {
      const profit = input('NET_PROFIT');
      const denominatorItem: LineItemId = derivationId === 'NET_PROFIT_TO_ASSETS_PCT' ? 'TOTAL_ASSETS' : 'TOTAL_EQUITY';
      const denominator = input(denominatorItem);
      snapshotOf('NET_PROFIT', profit);
      snapshotOf(denominatorItem, denominator);
      if (!usable(profit, 'NET_PROFIT')) return blocked(`net profit is not present as a number in ${view.periodEnd}.`);
      if (!usable(denominator, denominatorItem)) return blocked(`${denominatorItem} is not present as a number in ${view.periodEnd}.`);
      const denominatorValue = denominator.value as number;
      if (denominatorValue === 0) return refuse('DERIVATION_BLOCKED', 'FIELD_ZERO_DENOMINATOR', `${derivationId} divides by ${denominatorItem}, which is zero.`);
      if (denominatorValue < 0) return refuse('DERIVATION_BLOCKED', 'FIELD_NEGATIVE_BASE', `${derivationId} divides by a negative ${denominatorItem} (${denominatorValue}).`);
      return finish((100 * (profit.value as number)) / denominatorValue, 'PERCENT', `100 × net profit (${profit.value}) ÷ ${denominatorItem} (${denominatorValue}) at ${view.periodEnd}; closing-balance denominator is a declared deviation.`, profit);
    }

    if (derivationId === 'OPERATING_MARGIN_PCT') {
      const ebit = input('EBIT');
      const revenue = input('REVENUE_FROM_OPERATIONS');
      snapshotOf('EBIT', ebit);
      snapshotOf('REVENUE_FROM_OPERATIONS', revenue);
      if (!usable(ebit, 'EBIT')) return blocked(`EBIT is not present as a number in ${view.periodEnd}.`);
      if (!usable(revenue, 'REVENUE_FROM_OPERATIONS')) return blocked(`revenue from operations is not present as a number in ${view.periodEnd}.`);
      const revenueValue = revenue.value as number;
      if (revenueValue === 0) return refuse('DERIVATION_BLOCKED', 'FIELD_ZERO_DENOMINATOR', `${derivationId} divides by revenue, which is zero.`);
      if (revenueValue < 0) return refuse('DERIVATION_BLOCKED', 'FIELD_NEGATIVE_BASE', `${derivationId} divides by a negative revenue base (${revenueValue}).`);
      return finish((100 * (ebit.value as number)) / revenueValue, 'PERCENT', `100 × EBIT (${ebit.value}) ÷ revenue (${revenueValue}) at ${view.periodEnd}.`, ebit);
    }

    // CAPEX_TO_REVENUE_PCT
    const capex = input('CAPITAL_EXPENDITURE');
    const revenue = input('REVENUE_FROM_OPERATIONS');
    snapshotOf('CAPITAL_EXPENDITURE', capex);
    snapshotOf('REVENUE_FROM_OPERATIONS', revenue);
    if (!usable(capex, 'CAPITAL_EXPENDITURE')) return blocked(`capital expenditure is not present as a number in ${view.periodEnd}; a missing capex is not nil capex.`);
    if (!usable(revenue, 'REVENUE_FROM_OPERATIONS')) return blocked(`revenue from operations is not present as a number in ${view.periodEnd}.`);
    const revenueValue = revenue.value as number;
    if (revenueValue === 0) return refuse('DERIVATION_BLOCKED', 'FIELD_ZERO_DENOMINATOR', `${derivationId} divides by revenue, which is zero.`);
    if (revenueValue < 0) return refuse('DERIVATION_BLOCKED', 'FIELD_NEGATIVE_BASE', `${derivationId} divides by a negative revenue base (${revenueValue}).`);
    if ((capex.value as number) < 0) return refuse('DERIVATION_BLOCKED', 'FIELD_NEGATIVE_BASE', `capital expenditure is negative (${capex.value}); the line item is a positive magnitude.`);
    return finish((100 * (capex.value as number)) / revenueValue, 'PERCENT', `100 × capex (${capex.value}) ÷ revenue (${revenueValue}) at ${view.periodEnd}.`, capex);
  }

  private structure(): CapitalStructure | null {
    if (this.capitalStructureBuilt) return this.capitalStructure;
    this.capitalStructureBuilt = true;
    if (this.series === null) return null;
    this.capitalStructure = buildCapitalStructure(this.series, {
      asOf: this.context.asOf,
      ...(this.content.datasetSchema === undefined ? {} : { datasetSchema: this.content.datasetSchema }),
    });
    return this.capitalStructure;
  }
}

/** Case/separator normalisation used by selector fields. Exact vocabulary membership only. */
export function normaliseClassification(raw: string | null): string | null {
  if (raw === null) return null;
  const normalised = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalised === '' ? null : normalised;
}

/** Turn a resolution into the published field record. */
export function fieldQualification(mapping: FieldMapping, resolution: Resolution): FieldQualification {
  return Object.freeze({
    engineId: mapping.engineId,
    field: mapping.field,
    label: mapping.label,
    requirement: mapping.requirement,
    status: mapping.status,
    transformation: mapping.transformation,
    outcome: resolution.outcome,
    value: resolution.value,
    unit: resolution.unit,
    codes: Object.freeze([...resolution.codes]),
    evidence: resolution.evidence,
    note: resolution.note,
  });
}
