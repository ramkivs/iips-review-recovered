/**
 * IID-0 — observation and missing-value contract.
 *
 * A number is never "absent by being zero". Every numeric in an IID artefact is an
 * `Observation`, whose `value` is `null` unless its presence states otherwise, and whose
 * missing form always carries a closed-vocabulary reason.
 *
 * Invariants INV-1 … INV-4 are enforced in `invariants.ts`; this module only constructs.
 */

/** How a value came to be (or failed to be). Closed. */
export type Presence = 'PRESENT' | 'MISSING' | 'NOT_APPLICABLE' | 'NOT_COMPUTABLE' | 'IMPUTED';

/** Why a value is absent. Closed — prose belongs in `note`, not here. */
export type MissingReason =
  | 'NOT_REPORTED'
  | 'NOT_TAGGED_IN_FILING'
  | 'PERIOD_NOT_COVERED'
  | 'FILING_UNAVAILABLE'
  | 'STATEMENT_OUT_OF_SCOPE'
  | 'DIVISION_BY_ZERO'
  | 'NEGATIVE_BASE'
  | 'INSUFFICIENT_HISTORY'
  | 'DERIVATION_NOT_SUPPORTED'
  | 'SECTOR_METHOD_NOT_APPLICABLE'
  | 'SECURITY_CLASS_EXCLUDED'
  | 'SOURCE_CONFLICT_UNRESOLVED'
  | 'PERIOD_MISMATCH'
  | 'SCOPE_MISMATCH'
  | 'SHARE_COUNT_PERIOD_MISMATCH'
  | 'PRICE_STALE'
  | 'PRICE_UNAVAILABLE'
  | 'OPERATING_METRIC_MISSING'
  | 'OPERATING_METRIC_UNVALIDATED'
  | 'POLICY_INPUTS_UNAVAILABLE';

/** Where a value came from. `OPERATOR_ENTRY` and `VENDOR_ENTRY` require a locator. */
export type SourceKind =
  | 'FILING'
  | 'DATASET'
  | 'DERIVED'
  | 'OPERATOR_ENTRY'
  | 'VENDOR_ENTRY'
  | 'MARKET_PRICE'
  | 'POLICY';

export interface SourceRef {
  readonly kind: SourceKind;
  /** Stable reference: filing id, dataset path id, derivation id, or document id. */
  readonly ref: string;
  readonly sha256?: string;
  readonly filedAt?: string;
  /** Page / table / note locator for operator- or vendor-entered values. */
  readonly locator?: string;
}

export type Basis = 'AS_FILED' | 'RESTATED' | 'DERIVED' | 'IMPUTED';

export interface Imputation {
  readonly method: string;
  readonly assumptionRef: string;
}

export interface Observation<T> {
  readonly value: T | null;
  readonly presence: Presence;
  readonly reason?: MissingReason;
  readonly source?: SourceRef;
  readonly periodEnd?: string;
  readonly basis?: Basis;
  readonly filingRef?: string;
  readonly imputation?: Imputation;
  /** Free text, never used for control flow. */
  readonly note?: string;
}

export type NumericObservation = Observation<number>;

interface ObservationContext {
  readonly periodEnd?: string;
  readonly basis?: Basis;
  readonly filingRef?: string;
  readonly note?: string;
}

export function present<T>(
  value: T,
  source: SourceRef,
  context: ObservationContext = {},
): Observation<T> {
  return {
    value,
    presence: 'PRESENT',
    source,
    ...(context.periodEnd === undefined ? {} : { periodEnd: context.periodEnd }),
    ...(context.basis === undefined ? {} : { basis: context.basis }),
    ...(context.filingRef === undefined ? {} : { filingRef: context.filingRef }),
    ...(context.note === undefined ? {} : { note: context.note }),
  };
}

export function missing<T = number>(
  reason: MissingReason,
  context: ObservationContext = {},
): Observation<T> {
  return {
    value: null,
    presence: 'MISSING',
    reason,
    ...(context.periodEnd === undefined ? {} : { periodEnd: context.periodEnd }),
    ...(context.note === undefined ? {} : { note: context.note }),
  };
}

export function notApplicable<T = number>(
  reason: MissingReason,
  context: ObservationContext = {},
): Observation<T> {
  return { ...missing<T>(reason, context), presence: 'NOT_APPLICABLE' };
}

export function notComputable<T = number>(
  reason: MissingReason,
  context: ObservationContext = {},
): Observation<T> {
  return { ...missing<T>(reason, context), presence: 'NOT_COMPUTABLE' };
}

/**
 * An explicitly imputed value. Legal only with a recorded method and an assumption reference —
 * and any consumer must declare `allowsImputation` and take the confidence penalty (INV-6).
 */
export function imputed<T>(
  value: T,
  method: string,
  assumptionRef: string,
  source: SourceRef,
  context: ObservationContext = {},
): Observation<T> {
  return {
    value,
    presence: 'IMPUTED',
    source,
    basis: 'IMPUTED',
    imputation: { method, assumptionRef },
    ...(context.periodEnd === undefined ? {} : { periodEnd: context.periodEnd }),
    ...(context.filingRef === undefined ? {} : { filingRef: context.filingRef }),
    ...(context.note === undefined ? {} : { note: context.note }),
  };
}

export function isPresent<T>(observation: Observation<T>): observation is Observation<T> & { value: T } {
  return (observation.presence === 'PRESENT' || observation.presence === 'IMPUTED') && observation.value !== null;
}

export function isAbsent(observation: Observation<unknown>): boolean {
  return !isPresent(observation);
}

/** The value when usable, otherwise `null`. Never substitutes a default. */
export function valueOrNull<T>(observation: Observation<T> | undefined): T | null {
  return observation !== undefined && isPresent(observation) ? observation.value : null;
}
