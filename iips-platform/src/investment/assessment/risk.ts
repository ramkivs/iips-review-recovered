/**
 * IID-2 — risk taxonomy factors, generated deterministically.
 *
 * Each factor is a stated, testable proposition backed by observations, with no prose that the numbers do
 * not support. Severity and likelihood follow published thresholds, so two runs on the same data produce the
 * same factor list — and a reader can disagree with a threshold without having to guess what it was.
 *
 * ## D-3 — every dimension is reported, not only the ones that fail
 *
 * The taxonomy used to publish a factor only when a dimension *failed*. A pass emitted nothing, and so did a
 * dimension whose input was missing, which left the aggregate unable to tell "evaluated and passed" from
 * "could not be evaluated": both came out as `POLICY_INPUTS_UNAVAILABLE`. On a real issuer that reads as if the
 * whole risk assessment had been unavailable when in fact several dimensions had been evaluated and passed.
 *
 * Every dimension now produces a `RiskDimensionResult` whatever its outcome, carrying its own measurement
 * (`PRESENT` when evaluated, the absence with its reason otherwise), the threshold applied, the inputs whose
 * absence blocked it, and the factor id if it raised one. On top of that, `evaluation` publishes the aggregate
 * `completeness` (how much of the applicable taxonomy ran) separately from the `disposition` (what it found),
 * so a partial evaluation can never be read as a pass and a pass can never be read as completeness.
 *
 * What this does **not** do: it changes no threshold, no severity, no likelihood, no factor statement and no
 * aggregate formula. A dimension that produced no factor before still produces none; the difference is that the
 * artefact now says which kind of "none" it is.
 */
import type { MissingReason, NumericObservation } from '../contracts/observation';
import { notComputable, present } from '../contracts/observation';
import { periodObservation } from './periods';
import { isCyclicalSector, isRegulatedSector } from './moat';
import type {
  CapitalStructure,
  FinancialPeriodView,
  RiskBlock,
  RiskDimensionId,
  RiskDimensionResult,
  RiskDimensionStatus,
  RiskEvaluation,
  RiskEvaluationCompleteness,
  RiskFactor,
  RiskPolicyDisposition,
  SectorName,
  SeriesSelection,
} from './types';

const DERIVED = { kind: 'DERIVED' as const, ref: 'risk-taxonomy/1.1.0' };

/** One dimension's outcome and the factor it raised, if any. */
interface DimensionOutcome {
  readonly dimension: RiskDimensionResult;
  readonly factor: RiskFactor | null;
}

/** An input the dimension needs, its payload path, and whether it must be strictly positive to divide by it. */
interface Prerequisite {
  readonly path: string;
  readonly observation: NumericObservation;
  readonly positive?: boolean;
}

/**
 * Why a dimension cannot be evaluated, or `null` when its prerequisites are met.
 *
 * The reason is the **first absent input's own reason** — not a generic code — so a dimension blocked by an
 * undisclosed line item says `NOT_REPORTED` and one blocked by an uncovered period says `PERIOD_NOT_COVERED`.
 * Every absent input is named, because one reason can cover several of them.
 */
function blockingReason(
  prerequisites: readonly Prerequisite[],
): { readonly reason: MissingReason; readonly inputs: readonly string[] } | null {
  const absent = prerequisites.filter(
    (entry) => entry.observation.presence !== 'PRESENT' && entry.observation.presence !== 'IMPUTED',
  );
  if (absent.length > 0) {
    const reason = absent[0]?.observation.reason ?? 'NOT_REPORTED';
    return { reason, inputs: absent.map((entry) => entry.path) };
  }
  const nonPositive = prerequisites.filter(
    (entry) => entry.positive === true && !((entry.observation.value ?? 0) > 0),
  );
  if (nonPositive.length > 0) {
    const zero = nonPositive.some((entry) => (entry.observation.value ?? 0) === 0);
    return {
      reason: zero ? 'DIVISION_BY_ZERO' : 'NEGATIVE_BASE',
      inputs: nonPositive.map((entry) => entry.path),
    };
  }
  return null;
}

function notEvaluated(
  dimensionId: RiskDimensionId,
  category: RiskFactor['category'],
  threshold: string,
  blocked: { readonly reason: MissingReason; readonly inputs: readonly string[] },
): DimensionOutcome {
  return {
    dimension: {
      dimensionId,
      category,
      status: 'NOT_EVALUABLE',
      measurement: notComputable(blocked.reason),
      threshold,
      factorId: null,
      unavailableInputs: blocked.inputs,
      statement: `Not evaluated: ${blocked.reason} for ${blocked.inputs.join(', ')}.`,
    },
    factor: null,
  };
}

function severityFrom(value: number, thresholds: readonly [number, 1 | 2 | 3 | 4 | 5][]): 1 | 2 | 3 | 4 | 5 {
  for (const [threshold, severity] of thresholds) {
    if (value >= threshold) return severity;
  }
  return 1;
}

export interface RiskInputs {
  readonly series: SeriesSelection;
  readonly structure: CapitalStructure;
  readonly sector: SectorName;
}

const LEVERAGE_THRESHOLD = 'concern at net debt / EBITDA ≥ 3.00×';
const CASH_CONVERSION_THRESHOLD = 'concern below 80% operating cash flow / net profit (severity 4 below 50%)';
const CAPEX_INTENSITY_THRESHOLD = 'concern above 20% capital expenditure / revenue (severity 4 above 35%)';

/* ------------------------------------------------------------- company dimensions */

function leverageDimension(structure: CapitalStructure, latest: FinancialPeriodView): DimensionOutcome {
  const ebitda = periodObservation(latest, 'EBITDA');
  const blocked = blockingReason([
    { path: 'fundamentals.capitalStructure.netDebt', observation: structure.netDebt },
    { path: 'fundamentals.annual[0].EBITDA', observation: ebitda, positive: true },
  ]);
  if (blocked !== null) return notEvaluated('FINANCIAL_LEVERAGE', 'FINANCIAL', LEVERAGE_THRESHOLD, blocked);

  const leverage = (structure.netDebt.value ?? 0) / (ebitda.value ?? 1);
  const measurement = present(leverage, DERIVED, { basis: 'DERIVED' });
  const severity = severityFrom(leverage, [
    [6, 5],
    [4, 4],
    [3, 3],
    [2, 2],
  ]);
  if (severity >= 3) {
    const factor: RiskFactor = {
      riskId: 'RISK-FINANCIAL-LEVERAGE',
      category: 'FINANCIAL',
      severity,
      likelihood: severity >= 4 ? 4 : 3,
      status: 'ONGOING',
      statement: `Net debt is ${leverage.toFixed(2)}× EBITDA, above the 3× policy threshold for a comfortable balance sheet.`,
      evidence: [{ ref: 'fundamentals.capitalStructure.netDebt', observation: structure.netDebt }, { ref: 'fundamentals.annual[0].EBITDA', observation: ebitda }],
    };
    return {
      dimension: {
        dimensionId: 'FINANCIAL_LEVERAGE',
        category: 'FINANCIAL',
        status: 'CONCERN',
        measurement,
        threshold: LEVERAGE_THRESHOLD,
        factorId: factor.riskId,
        unavailableInputs: [],
        statement: factor.statement,
      },
      factor,
    };
  }
  return {
    dimension: {
      dimensionId: 'FINANCIAL_LEVERAGE',
      category: 'FINANCIAL',
      status: 'PASSED',
      measurement,
      threshold: LEVERAGE_THRESHOLD,
      factorId: null,
      unavailableInputs: [],
      statement: `Net debt is ${leverage.toFixed(2)}× EBITDA, below the 3× policy threshold.`,
    },
    factor: null,
  };
}

function conversionDimension(latest: FinancialPeriodView): DimensionOutcome {
  const ocf = periodObservation(latest, 'OPERATING_CASH_FLOW');
  const pat = periodObservation(latest, 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS');
  const blocked = blockingReason([
    { path: 'fundamentals.annual[0].OPERATING_CASH_FLOW', observation: ocf },
    { path: 'fundamentals.annual[0].NET_PROFIT_ATTRIBUTABLE_TO_OWNERS', observation: pat, positive: true },
  ]);
  if (blocked !== null) {
    return notEvaluated('EARNINGS_QUALITY_CASH_CONVERSION', 'EARNINGS_QUALITY', CASH_CONVERSION_THRESHOLD, blocked);
  }

  const conversion = (ocf.value ?? 0) / (pat.value ?? 1);
  const measurement = present(conversion, DERIVED, { basis: 'DERIVED' });
  if (conversion < 0.8) {
    const factor: RiskFactor = {
      riskId: 'RISK-EARNINGS-QUALITY-CASH-CONVERSION',
      category: 'EARNINGS_QUALITY',
      severity: conversion < 0.5 ? 4 : 3,
      likelihood: 3,
      status: 'ONGOING',
      statement: `Operating cash flow covers only ${(conversion * 100).toFixed(0)}% of reported profit, so earnings are not converting to cash.`,
      evidence: [{ ref: 'fundamentals.annual[0].OPERATING_CASH_FLOW', observation: ocf }, { ref: 'fundamentals.annual[0].NET_PROFIT_ATTRIBUTABLE_TO_OWNERS', observation: pat }],
    };
    return {
      dimension: {
        dimensionId: 'EARNINGS_QUALITY_CASH_CONVERSION',
        category: 'EARNINGS_QUALITY',
        status: 'CONCERN',
        measurement,
        threshold: CASH_CONVERSION_THRESHOLD,
        factorId: factor.riskId,
        unavailableInputs: [],
        statement: factor.statement,
      },
      factor,
    };
  }
  return {
    dimension: {
      dimensionId: 'EARNINGS_QUALITY_CASH_CONVERSION',
      category: 'EARNINGS_QUALITY',
      status: 'PASSED',
      measurement,
      threshold: CASH_CONVERSION_THRESHOLD,
      factorId: null,
      unavailableInputs: [],
      statement: `Operating cash flow covers ${(conversion * 100).toFixed(0)}% of reported profit, at or above the 80% policy floor.`,
    },
    factor: null,
  };
}

function intensityDimension(latest: FinancialPeriodView): DimensionOutcome {
  const revenue = periodObservation(latest, 'REVENUE_FROM_OPERATIONS');
  const capex = periodObservation(latest, 'CAPITAL_EXPENDITURE');
  const blocked = blockingReason([
    { path: 'fundamentals.annual[0].REVENUE_FROM_OPERATIONS', observation: revenue, positive: true },
    { path: 'fundamentals.annual[0].CAPITAL_EXPENDITURE', observation: capex },
  ]);
  if (blocked !== null) {
    return notEvaluated('CAPITAL_ALLOCATION_CAPEX_INTENSITY', 'CAPITAL_ALLOCATION', CAPEX_INTENSITY_THRESHOLD, blocked);
  }

  const intensity = (capex.value ?? 0) / (revenue.value ?? 1);
  const measurement = present(intensity, DERIVED, { basis: 'DERIVED' });
  if (intensity > 0.2) {
    const factor: RiskFactor = {
      riskId: 'RISK-CAPITAL-ALLOCATION-CAPEX-INTENSITY',
      category: 'CAPITAL_ALLOCATION',
      severity: intensity > 0.35 ? 4 : 3,
      likelihood: 3,
      status: 'ONGOING',
      statement: `Capital expenditure is ${(intensity * 100).toFixed(0)}% of revenue, so returns depend on the assets being built earning their cost of capital.`,
      evidence: [{ ref: 'fundamentals.annual[0].CAPITAL_EXPENDITURE', observation: capex }, { ref: 'fundamentals.annual[0].REVENUE_FROM_OPERATIONS', observation: revenue }],
    };
    return {
      dimension: {
        dimensionId: 'CAPITAL_ALLOCATION_CAPEX_INTENSITY',
        category: 'CAPITAL_ALLOCATION',
        status: 'CONCERN',
        measurement,
        threshold: CAPEX_INTENSITY_THRESHOLD,
        factorId: factor.riskId,
        unavailableInputs: [],
        statement: factor.statement,
      },
      factor,
    };
  }
  return {
    dimension: {
      dimensionId: 'CAPITAL_ALLOCATION_CAPEX_INTENSITY',
      category: 'CAPITAL_ALLOCATION',
      status: 'PASSED',
      measurement,
      threshold: CAPEX_INTENSITY_THRESHOLD,
      factorId: null,
      unavailableInputs: [],
      statement: `Capital expenditure is ${(intensity * 100).toFixed(0)}% of revenue, at or below the 20% policy ceiling.`,
    },
    factor: null,
  };
}

export function buildRisk(input: RiskInputs): RiskBlock {
  const latest: FinancialPeriodView | undefined = input.series.annual[0];
  const outcomes: DimensionOutcome[] = [];

  /* ---------------------------------------------------------------- financial */

  /* No annual period at all blocks every company dimension on the *period*, not on a line item: reporting
   * `NOT_REPORTED` there would name the wrong absent thing. */
  if (latest === undefined) {
    const noPeriod = { reason: 'PERIOD_NOT_COVERED' as MissingReason, inputs: ['fundamentals.annual[0]'] };
    outcomes.push(notEvaluated('FINANCIAL_LEVERAGE', 'FINANCIAL', LEVERAGE_THRESHOLD, noPeriod));
    outcomes.push(
      notEvaluated('EARNINGS_QUALITY_CASH_CONVERSION', 'EARNINGS_QUALITY', CASH_CONVERSION_THRESHOLD, noPeriod),
    );
    outcomes.push(
      notEvaluated('CAPITAL_ALLOCATION_CAPEX_INTENSITY', 'CAPITAL_ALLOCATION', CAPEX_INTENSITY_THRESHOLD, noPeriod),
    );
  } else {
    outcomes.push(leverageDimension(input.structure, latest));
    outcomes.push(conversionDimension(latest));
    outcomes.push(intensityDimension(latest));
  }

  /* ---------------------------------------------------------------- sector priors */

  const regulated = isRegulatedSector(input.sector);
  if (regulated) {
    const factor: RiskFactor = {
      riskId: 'RISK-REGULATORY-SECTOR',
      category: 'REGULATORY_LEGAL',
      severity: 3,
      likelihood: 4,
      status: 'ONGOING',
      statement: `${input.sector} earnings are set inside a regulatory framework, so a rule change re-prices the business independently of operating performance.`,
      evidence: [],
    };
    outcomes.push({
      dimension: {
        dimensionId: 'REGULATORY_FRAMEWORK',
        category: 'REGULATORY_LEGAL',
        status: 'CONCERN',
        measurement: null,
        threshold: 'standing concern for a regulated sector',
        factorId: factor.riskId,
        unavailableInputs: [],
        statement: factor.statement,
      },
      factor,
    });
  } else {
    outcomes.push({
      dimension: {
        dimensionId: 'REGULATORY_FRAMEWORK',
        category: 'REGULATORY_LEGAL',
        status: 'NOT_APPLICABLE',
        measurement: null,
        threshold: 'standing concern for a regulated sector',
        factorId: null,
        unavailableInputs: [],
        statement: `${input.sector} is not a regulated sector, so the regulatory-framework prior does not apply.`,
      },
      factor: null,
    });
  }

  const cyclical = isCyclicalSector(input.sector);
  if (cyclical) {
    const factor: RiskFactor = {
      riskId: 'RISK-CYCLICALITY-SECTOR',
      category: 'CYCLICALITY',
      severity: 3,
      likelihood: 4,
      status: 'ONGOING',
      statement: `${input.sector} demand is cyclical, so a single year's margin is not a sustainable earnings base.`,
      evidence: [],
    };
    outcomes.push({
      dimension: {
        dimensionId: 'CYCLICALITY',
        category: 'CYCLICALITY',
        status: 'CONCERN',
        measurement: null,
        threshold: 'standing concern for a cyclical sector',
        factorId: factor.riskId,
        unavailableInputs: [],
        statement: factor.statement,
      },
      factor,
    });
  } else {
    outcomes.push({
      dimension: {
        dimensionId: 'CYCLICALITY',
        category: 'CYCLICALITY',
        status: 'NOT_APPLICABLE',
        measurement: null,
        threshold: 'standing concern for a cyclical sector',
        factorId: null,
        unavailableInputs: [],
        statement: `${input.sector} is not classified as cyclical, so the cyclicality prior does not apply.`,
      },
      factor: null,
    });
  }

  /* ------------------------------------------------------------------ aggregate */

  const factors = outcomes.map((outcome) => outcome.factor).filter((factor): factor is RiskFactor => factor !== null);
  const dimensions = outcomes.map((outcome) => outcome.dimension);
  const evaluation = summarise(dimensions, factors);
  const aggregate = aggregateObservation(evaluation, factors);

  return { factors, aggregate, evaluation };
}

/** Count the outcomes, then read completeness and disposition off them — never off the factor list alone. */
function summarise(dimensions: readonly RiskDimensionResult[], factors: readonly RiskFactor[]): RiskEvaluation {
  const count = (status: RiskDimensionStatus): number => dimensions.filter((entry) => entry.status === status).length;
  const notApplicable = count('NOT_APPLICABLE');
  const applicable = dimensions.length - notApplicable;
  const passed = count('PASSED');
  const concerns = count('CONCERN');
  const notEvaluable = count('NOT_EVALUABLE');
  const evaluated = passed + concerns;

  const completeness: RiskEvaluationCompleteness =
    applicable === 0 || evaluated === 0 ? 'NONE' : notEvaluable === 0 ? 'COMPLETE' : 'PARTIAL';

  const disposition: RiskPolicyDisposition =
    concerns > 0 ? 'CONCERNS' : completeness === 'COMPLETE' ? 'PASSED' : 'INDETERMINATE';

  const counts = { applicable, evaluated, passed, concerns, notEvaluable, notApplicable };
  const plural = (n: number, noun: string): string => `${n} ${noun}${n === 1 ? '' : 's'}`;

  let note: string;
  if (completeness === 'COMPLETE') {
    note =
      concerns === 0
        ? `All ${plural(applicable, 'applicable risk dimension')} ${applicable === 1 ? 'was' : 'were'} evaluated and none crossed a policy threshold. That is a result of this taxonomy on these inputs, not a statement that no risk exists.`
        : `All ${plural(applicable, 'applicable risk dimension')} ${applicable === 1 ? 'was' : 'were'} evaluated; ${concerns} raised a concern and ${plural(factors.length, 'factor')} ${factors.length === 1 ? 'is' : 'are'} published.`;
  } else if (completeness === 'PARTIAL') {
    note =
      concerns === 0
        ? `${evaluated} of ${plural(applicable, 'applicable risk dimension')} ${applicable === 1 ? 'was' : 'were'} evaluated and ${notEvaluable} could not be. No concern was raised by the dimensions that ran, and a partial evaluation is not a pass: the dimension${notEvaluable === 1 ? '' : 's'} that could not be evaluated ${notEvaluable === 1 ? 'is' : 'are'} reported with ${notEvaluable === 1 ? 'its' : 'their'} blocking inputs.`
        : `${evaluated} of ${plural(applicable, 'applicable risk dimension')} ${applicable === 1 ? 'was' : 'were'} evaluated and ${notEvaluable} could not be. ${concerns} raised a concern; the evaluation is partial, so the absence of a factor elsewhere is not a pass.`;
  } else {
    note = `No applicable risk dimension could be evaluated (${notEvaluable} of ${applicable} blocked), so this assessment makes no risk conclusion at all.`;
  }

  return { dimensions, counts, completeness, disposition, note };
}

/**
 * The published score: the mean severity × likelihood of the factors, and nothing else.
 *
 * With no factor there is no mean to take, so the aggregate stays non-computable and its reason says which
 * kind of empty this is — complete evaluation (`NO_RISK_FACTOR_IDENTIFIED`), partial evaluation
 * (`RISK_EVALUATION_PARTIAL`), or nothing evaluated at all (`POLICY_INPUTS_UNAVAILABLE`, the pre-D-3 code,
 * which is accurate only in the last case). A score of 0 is never emitted: the formula's minimum is 1, so a 0
 * would be a number the taxonomy cannot produce.
 */
function aggregateObservation(evaluation: RiskEvaluation, factors: readonly RiskFactor[]): NumericObservation {
  if (factors.length > 0) {
    return present(
      factors.reduce((sum, factor) => sum + factor.severity * factor.likelihood, 0) / factors.length,
      DERIVED,
      { basis: 'DERIVED' },
    );
  }
  if (evaluation.completeness === 'COMPLETE') return notComputable('NO_RISK_FACTOR_IDENTIFIED');
  if (evaluation.completeness === 'PARTIAL') return notComputable('RISK_EVALUATION_PARTIAL');
  return notComputable('POLICY_INPUTS_UNAVAILABLE');
}
