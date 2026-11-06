/**
 * IID-0 — observation and missing-value contract.
 *
 * A number is never "absent by being zero". Every numeric in an IID artefact is an
 * `Observation`, whose `value` is `null` unless its presence states otherwise, and whose
 * missing form always carries a closed-vocabulary reason.
 *
 * ## The semantic states, and how they are spelled here
 *
 * "Nil" and "not disclosed" used to share one spelling, so a debt-free issuer could only enter a debt
 * position by inventing zeros. The vocabulary is now these six states; every one of them is distinguishable
 * in an artefact, and only the first carries a value:
 *
 * | State | Spelling | Meaning |
 * | --- | --- | --- |
 * | `REPORTED_VALUE` | `presence: 'PRESENT'` + `value` | disclosed as a number, **including an explicitly reported zero** |
 * | `NIL_BY_DISCLOSURE` | `presence: 'NIL_BY_DISCLOSURE'` + `reason: 'DECLARED_NIL_IN_SOURCE'` + `source` + `periodEnd` | the source establishes the item is nil / not applicable |
 * | `NOT_REPORTED` | `presence: 'MISSING'` + `reason: 'NOT_REPORTED'` | the item is not disclosed |
 * | `SOURCE_UNAVAILABLE` | `presence: 'MISSING'` + `reason: 'FILING_UNAVAILABLE'` / `'PERIOD_NOT_COVERED'` / `'STATEMENT_OUT_OF_SCOPE'` | the source could not be obtained |
 * | `UNMAPPED` | `presence: 'MISSING'` + `reason: 'NOT_TAGGED_IN_FILING'` | a source figure exists with no applicable canonical mapping |
 * | `NOT_COMPUTABLE` | `presence: 'NOT_COMPUTABLE'` + `reason` | a calculation cannot run because its prerequisites are incomplete or unsupported |
 *
 * The distinctions that matter for correctness:
 *
 *  - **`NIL_BY_DISCLOSURE` is not `PRESENT`.** `value` is `null`, `isPresent()` is false, and every existing
 *    consumer therefore treats it as no number at all. A nil may contribute zero only inside an aggregation
 *    that states that permission explicitly (see `assessment/capitalStructure.ts`), and the nil observation
 *    itself is published unchanged, with its filing reference and period.
 *  - **`NIL_BY_DISCLOSURE` is not `MISSING`.** A nil is a positive statement by the filer; a missing value is
 *    the absence of any statement. Treating the second as the first is how inferred zeros get into a dataset,
 *    and it is refused here by construction: `nilByDisclosure()` demands provenance.
 *  - **An explicitly reported zero stays a reported zero** (`PRESENT`, value `0`, with a source) and is never
 *    re-spelled as nil — the two are different claims about the source and are kept apart.
 *
 * Invariants INV-1 … INV-4 and INV-7 are enforced in `invariants.ts`; this module only constructs.
 */

/** How a value came to be (or failed to be). Closed. */
export type Presence =
  | 'PRESENT'
  | 'MISSING'
  | 'NOT_APPLICABLE'
  | 'NOT_COMPUTABLE'
  | 'IMPUTED'
  /** Positive statement by the source that the item is nil / not applicable. Never a value. */
  | 'NIL_BY_DISCLOSURE';

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
  | 'POLICY_INPUTS_UNAVAILABLE'
  /** The reason attached to a `NIL_BY_DISCLOSURE` observation: the source says the item is nil. */
  | 'DECLARED_NIL_IN_SOURCE';

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

export interface NilDisclosureContext {
  /** The reporting period the declaration belongs to. Required: a nil without a period is unusable. */
  readonly periodEnd: string;
  readonly basis?: Basis;
  readonly filingRef?: string;
  readonly note?: string;
}

/**
 * A positive statement by the source that the item is nil or not applicable.
 *
 * This is the ONLY way to express "the filer told us there is nothing here". It deliberately produces no
 * numeric value: `value` is `null`, so no existing consumer can mistake it for a number, and the provenance it
 * demands (a source reference and the period end) is enforced here rather than left to callers. An inferred
 * zero is never expressible through this constructor.
 */
export function nilByDisclosure(source: SourceRef, context: NilDisclosureContext): NumericObservation {
  if (source === undefined || source === null || typeof source.ref !== 'string' || source.ref.trim() === '') {
    throw new TypeError('NIL_BY_DISCLOSURE requires a source reference naming where the nil is stated');
  }
  if (typeof context.periodEnd !== 'string' || context.periodEnd.trim() === '') {
    throw new TypeError('NIL_BY_DISCLOSURE requires the reporting period end it was declared for');
  }
  return {
    value: null,
    presence: 'NIL_BY_DISCLOSURE',
    reason: 'DECLARED_NIL_IN_SOURCE',
    source,
    periodEnd: context.periodEnd,
    basis: context.basis ?? 'AS_FILED',
    ...(context.filingRef === undefined ? {} : { filingRef: context.filingRef }),
    ...(context.note === undefined ? {} : { note: context.note }),
  };
}

/** True only for a positive declaration of nil. Never true for a reported zero. */
export function isNilByDisclosure(observation: Observation<unknown>): boolean {
  return observation.presence === 'NIL_BY_DISCLOSURE';
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
