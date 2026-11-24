/**
 * W20 — pure monetary-coverage gate (Section K acceptance side).
 *
 * Consumes the existing W13 producer output (`PositionValuationReport`, schema
 * `iips.w13.position-valuation/v1`) and evaluates the Section K monetary-coverage
 * gate per the merged interface contract
 * (`docs/integration/W12-VALUATION-METHODOLOGY-TECHNICAL-DESIGN-2026-11-23.md` §12).
 *
 * OWNERSHIP BOUNDARIES (held by this module):
 *  - W20 owns ONLY the gate arithmetic and the acceptance output. It does NOT
 *    re-qualify observations, does NOT re-derive or upgrade IPD freshness verdicts
 *    (consumed verbatim from `observation.freshnessVerdict` via the W13 status),
 *    and does NOT duplicate W13 valuation logic — it reads the report's raw
 *    `quantity` and `observation.ltp` fields.
 *  - All gate inputs are UNROUNDED. `round2` here is presentation-only.
 *  - No D1/D2/D3/θM/max-age/multiplier policy is invented: θM is an injected
 *    parameter that is UNESTABLISHED unless explicitly supplied; unknown exposure
 *    is null, never zero; no multiplier is applied (none exists in the data model);
 *    no observation-age limit is applied.
 *
 * Result vocabulary (contract §12.6): PASS / FAIL only when θM is established AND
 * the denominator is exact AND the eligible population is non-empty AND a single
 * currency spans the valued positions; otherwise BLOCKED with reason codes.
 * `|E| = 0` is NOT_APPLICABLE — never 100 %. Indeterminate results are never
 * presented as a percentage.
 */
import { POSITION_VALUATION_SCHEMA, type PositionValuationEntry, type PositionValuationReport } from './positionValuation';
import type { CapturedRevisionRef } from '../market-data/dhanRevisionCoverage';

export const W20_GATE_SCHEMA = 'iips.w20.monetary-coverage-gate/v1';

export type W20GateResultKind = 'PASS' | 'FAIL' | 'BLOCKED';

export type W20BlockedReason =
  | 'SCHEMA_OR_REFUSAL' // wrong/unknown report schema, malformed input, or producer-refusal shape
  | 'EMPTY_POPULATION' // |E| = 0 → NOT_APPLICABLE, never 100 %
  | 'NO_SINGLE_CURRENCY' // valued positions span >1 currency; no cross-currency aggregation is supported
  | 'DENOMINATOR_INDETERMINATE' // unknown exposure (or zero total) in the eligible population → exact D blocked
  | 'THETA_M_UNESTABLISHED'; // θM has no established value → gate cannot open

export interface W20ObservationAudit {
  readonly asOf: string | null;
  readonly receivedAt: string | null;
  readonly evaluatedAt: string | null;
  readonly freshnessVerdict: string;
  readonly providerQualification: string | null;
  readonly lineageHash: string | null;
  readonly sourceClassification: string | null;
}

export interface W20HoldingAudit {
  readonly rowId: string;
  readonly securityId: string | null;
  readonly status: string;
  readonly quantity: number;
  /** |quantity| × ltp, UNROUNDED, for VALUED positions; null (unknown) otherwise — never 0. */
  readonly grossExposureUnrounded: number | null;
  /** Why exposure is unknown: the W13 status, or a defensive input check. */
  readonly unknownExposureReason: string | null;
  /** Signed value, round2 — presentation only, never a gate input. */
  readonly signedObservedValuePresentation: number | null;
  readonly currency: string | null;
  /** Observation provenance echoed verbatim (timestamps never re-fabricated). */
  readonly observation: W20ObservationAudit | null;
  /** t − asOf in milliseconds, computed in UTC; null when either timestamp is absent/unparsable. */
  readonly ageAtTms: number | null;
  /** True when the holding is in the eligible population E (active, any status). */
  readonly inPopulationE: boolean;
  /** No multiplier source exists in the data model; none is applied. */
  readonly unitMultiplier: 'NOT_ESTABLISHED';
}

export interface W20PerCurrencyAggregate {
  readonly currency: string;
  readonly eligible: number;
  readonly valued: number;
  readonly unknownExposure: number;
  /** Σ |quantity| × ltp over VALUED positions of this currency, unrounded. */
  readonly numeratorUnrounded: number;
}

export interface W20GateOptions {
  /** Established θM value. null/undefined/non-finite = UNESTABLISHED (production default). */
  readonly thetaM?: number | null;
  /** Valuation instant t. Defaults to the report's own `evaluatedAt` (contract §12.5 baseline). */
  readonly valuationInstant?: string;
}

export interface W20MonetaryCoverageGateOutput {
  readonly schema: typeof W20_GATE_SCHEMA;
  /** Echoed verbatim — acceptance is bound to this exact captured revision. */
  readonly capture: CapturedRevisionRef;
  /** C: the single valuation currency, or null when not singular (mixed). */
  readonly reportingCurrency: string | null;
  /** t: the recorded valuation instant. */
  readonly valuationInstant: string;
  readonly thetaM: { readonly status: 'UNESTABLISHED' } | { readonly status: 'ESTABLISHED'; readonly value: number };
  readonly population: {
    readonly eligible: number;
    readonly valued: number;
    readonly unknownExposure: number;
    readonly inactive: number;
  };
  readonly perCurrency: readonly W20PerCurrencyAggregate[];
  readonly aggregates: {
    /** N over VALUED positions of the single currency C, unrounded; null when no single C. */
    readonly numeratorUnrounded: number | null;
    /** D = Σ gross over E, unrounded, ONLY when every eligible holding is valued; else null. */
    readonly denominatorUnrounded: number | null;
    readonly denominatorExact: boolean;
    /** N / D, unrounded, only when D is exact and D > 0; else null. Never fabricated. */
    readonly coverageRatioUnrounded: number | null;
    /** round2(ratio × 100) — presentation only. */
    readonly coverageRatioPresentationPct: number | null;
  };
  readonly holdings: readonly W20HoldingAudit[];
  readonly result: W20GateResultKind;
  readonly reasonCodes: readonly W20BlockedReason[];
  /** Echoed from the W13 report; W20 never resolves these. */
  readonly openMethodologyDecisions: readonly string[];
}

/** Presentation-only rounding (2 decimals). Gate arithmetic never uses this. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseTimeMs(value: string | null | undefined): number | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

function auditObservation(entry: PositionValuationEntry, tMs: number | null): { audit: W20ObservationAudit | null; ageAtTms: number | null } {
  if (entry.status !== 'VALUED' || entry.observation === null) return { audit: null, ageAtTms: null };
  const o = entry.observation;
  const asOfMs = parseTimeMs(o.asOf);
  return {
    audit: {
      asOf: o.asOf,
      receivedAt: o.receivedAt,
      evaluatedAt: o.evaluatedAt,
      freshnessVerdict: o.freshnessVerdict,
      providerQualification: o.providerQualification,
      lineageHash: o.lineageHash,
      sourceClassification: o.sourceClassification,
    },
    ageAtTms: tMs !== null && asOfMs !== null ? tMs - asOfMs : null,
  };
}

/**
 * Pure Section K monetary-coverage gate over a W13 `PositionValuationReport`.
 * Deterministic, read-only, no I/O. Contract: W12 design §12.
 */
export function evaluateMonetaryCoverageGate(
  report: PositionValuationReport,
  options: W20GateOptions = {},
): W20MonetaryCoverageGateOutput {
  const thetaMEstablished = isFiniteNumber(options.thetaM) ? options.thetaM : null;
  const valuationInstant = options.valuationInstant ?? report.evaluatedAt;
  const tMs = parseTimeMs(valuationInstant);

  const base = {
    schema: W20_GATE_SCHEMA as typeof W20_GATE_SCHEMA,
    capture: report.capture,
    valuationInstant,
    thetaM: thetaMEstablished === null
      ? { status: 'UNESTABLISHED' as const }
      : { status: 'ESTABLISHED' as const, value: thetaMEstablished },
    openMethodologyDecisions: report.openMethodologyDecisions ?? [],
  };

  // (1) schema / shape refusal — fail closed, minimal audit.
  if (report.schema !== POSITION_VALUATION_SCHEMA || !Array.isArray(report.positions)) {
    return {
      ...base,
      reportingCurrency: null,
      population: { eligible: 0, valued: 0, unknownExposure: 0, inactive: 0 },
      perCurrency: [],
      aggregates: {
        numeratorUnrounded: null,
        denominatorUnrounded: null,
        denominatorExact: false,
        coverageRatioUnrounded: null,
        coverageRatioPresentationPct: null,
      },
      holdings: [],
      result: 'BLOCKED',
      reasonCodes: ['SCHEMA_OR_REFUSAL'],
    };
  }

  const entries = report.positions;
  const eligible = entries.filter((e) => e.status !== 'POSITION_INACTIVE');
  const inactiveCount = entries.length - eligible.length;

  // Cross-check the producer's own totals (fail closed on disagreement).
  const totalsConsistent =
    report.totals.positions === entries.length && report.totals.active === eligible.length && report.totals.inactive === inactiveCount;

  const holdings: W20HoldingAudit[] = entries.map((entry) => {
    const inE = entry.status !== 'POSITION_INACTIVE';
    const { audit, ageAtTms } = auditObservation(entry, tMs);
    if (entry.status === 'VALUED' && isFiniteNumber(entry.quantity) && entry.observation !== null && isFiniteNumber(entry.observation.ltp)) {
      return {
        rowId: entry.rowId,
        securityId: entry.securityId,
        status: entry.status,
        quantity: entry.quantity,
        grossExposureUnrounded: Math.abs(entry.quantity) * entry.observation.ltp,
        unknownExposureReason: null,
        signedObservedValuePresentation: round2(entry.quantity * entry.observation.ltp),
        currency: entry.observation.quoteCurrency,
        observation: audit,
        ageAtTms,
        inPopulationE: inE,
        unitMultiplier: 'NOT_ESTABLISHED',
      };
    }
    return {
      rowId: entry.rowId,
      securityId: entry.securityId,
      status: entry.status,
      quantity: entry.quantity,
      grossExposureUnrounded: null,
      unknownExposureReason: entry.status === 'VALUED' ? 'NON_FINITE_INPUT' : entry.status,
      signedObservedValuePresentation: null,
      currency: null,
      observation: audit,
      ageAtTms,
      inPopulationE: inE,
      unitMultiplier: 'NOT_ESTABLISHED',
    };
  });

  const valued = holdings.filter((h) => h.inPopulationE && h.grossExposureUnrounded !== null);
  const unknownInE = eligible.length - valued.length;
  const grossByRow = new Map(holdings.map((h) => [h.rowId, h.grossExposureUnrounded] as const));

  // Per-currency aggregates (never summed across currencies).
  const byCurrency = new Map<string, { currency: string; eligible: number; valued: number; unknownExposure: number; numeratorUnrounded: number }>();
  for (const h of holdings) {
    if (!h.inPopulationE) continue;
    const cur = h.currency ?? 'UNKNOWN';
    const agg = byCurrency.get(cur) ?? { currency: cur, eligible: 0, valued: 0, unknownExposure: 0, numeratorUnrounded: 0 };
    agg.eligible += 1;
    if (h.grossExposureUnrounded !== null) {
      agg.valued += 1;
      agg.numeratorUnrounded += h.grossExposureUnrounded;
    } else {
      agg.unknownExposure += 1;
    }
    byCurrency.set(cur, agg);
  }
  const perCurrency = [...byCurrency.values()].sort((a, b) => a.currency.localeCompare(b.currency));

  const valuedCurrencies = [...new Set(valued.map((h) => h.currency))];
  const mixed = valuedCurrencies.length > 1 || report.totals.mixedCurrencies;
  const singleCurrency = valuedCurrencies.length === 1 && !report.totals.mixedCurrencies ? valuedCurrencies[0] : null;

  // Malformed valued inputs (negative or non-finite price) → refuse.
  const malformedValued = entries.some(
    (e) => e.status === 'VALUED' && e.observation !== null && (!isFiniteNumber(e.observation.ltp) || e.observation.ltp < 0 || !isFiniteNumber(e.quantity)),
  );

  const numerator = singleCurrency !== null ? valued.reduce((s, h) => s + (h.grossExposureUnrounded ?? 0), 0) : null;
  const denominatorExact = !malformedValued && unknownInE === 0 && eligible.length > 0;
  const denominator = denominatorExact ? eligible.reduce((s, h) => s + (grossByRow.get(h.rowId) ?? 0), 0) : null;
  const ratio =
    singleCurrency !== null && denominator !== null && denominator > 0 ? (numerator as number) / denominator : null;

  const reasons: W20BlockedReason[] = [];
  if (!totalsConsistent || malformedValued) reasons.push('SCHEMA_OR_REFUSAL');
  if (eligible.length === 0) reasons.push('EMPTY_POPULATION');
  if (mixed && eligible.length > 0) reasons.push('NO_SINGLE_CURRENCY');
  if (eligible.length > 0 && (!denominatorExact || denominator === null || denominator <= 0)) reasons.push('DENOMINATOR_INDETERMINATE');
  if (thetaMEstablished === null) reasons.push('THETA_M_UNESTABLISHED');

  let result: W20GateResultKind;
  if (reasons.length > 0) {
    result = 'BLOCKED';
  } else {
    // All gate inputs exact, θM established, single currency, non-empty population.
    // Comparison rule (mechanics only — the θM VALUE remains unestablished in production):
    // PASS when the unrounded coverage ratio is at least θM.
    result = (ratio as number) >= (thetaMEstablished as number) ? 'PASS' : 'FAIL';
  }

  return {
    ...base,
    reportingCurrency: singleCurrency,
    population: { eligible: eligible.length, valued: valued.length, unknownExposure: unknownInE, inactive: inactiveCount },
    perCurrency,
    aggregates: {
      numeratorUnrounded: numerator,
      denominatorUnrounded: denominator,
      denominatorExact,
      coverageRatioUnrounded: ratio,
      coverageRatioPresentationPct: ratio === null ? null : round2(ratio * 100),
    },
    holdings,
    result,
    reasonCodes: reasons,
  };
}
