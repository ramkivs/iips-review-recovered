/**
 * IID-0 — invariant enforcement.
 *
 * INV-1  value === null  ⟺  presence is neither PRESENT nor IMPUTED
 * INV-2  MISSING / NOT_APPLICABLE / NOT_COMPUTABLE  ⇒  a closed-vocabulary reason
 * INV-3  PRESENT  ⇒  a source reference (a zero is legal only as a sourced zero)
 * INV-4  IMPUTED  ⇒  method + assumption reference
 * INV-5  a derived aggregate is null unless every declared required input is present, and
 *        names the unmet set when it is withheld
 * INV-6  an imputed input may only be consumed by a method that declares `allowsImputation`
 *
 * Plus the conclusion guard required by design of record Part III §I.5: absence of evidence may
 * never become a negative conclusion.
 */
import { isPresent, type MissingReason, type Observation } from './observation';
import type { CandidateVerb, DispositionVerb } from './disposition';

export type InvariantId = 'INV-1' | 'INV-2' | 'INV-3' | 'INV-4' | 'INV-5' | 'INV-6' | 'CONCL-1' | 'CONCL-2';

export interface Violation {
  readonly invariant: InvariantId;
  readonly path: string;
  readonly detail: string;
}

export class ContractViolation extends Error {
  constructor(readonly violations: readonly Violation[]) {
    super(`contract violation: ${violations.map((v) => `${v.invariant}@${v.path}`).join(', ')}`);
    this.name = 'ContractViolation';
  }
}

/** Collect every violation for one observation. Non-throwing. */
export function checkObservation(observation: Observation<unknown>, path: string): Violation[] {
  const violations: Violation[] = [];
  const statesValue = observation.presence === 'PRESENT' || observation.presence === 'IMPUTED';
  const hasValue = observation.value !== null && observation.value !== undefined;

  if (statesValue !== hasValue) {
    violations.push({
      invariant: 'INV-1',
      path,
      detail: `presence "${observation.presence}" with ${hasValue ? 'a' : 'no'} value`,
    });
  }
  if (!statesValue && observation.reason === undefined) {
    violations.push({ invariant: 'INV-2', path, detail: `presence "${observation.presence}" without a reason` });
  }
  if (observation.presence === 'PRESENT' && observation.source === undefined) {
    violations.push({ invariant: 'INV-3', path, detail: 'PRESENT without a source reference' });
  }
  if (observation.presence === 'IMPUTED') {
    if (observation.imputation === undefined) {
      violations.push({ invariant: 'INV-4', path, detail: 'IMPUTED without an imputation record' });
    }
    if (observation.source === undefined) {
      violations.push({ invariant: 'INV-3', path, detail: 'IMPUTED without a source reference' });
    }
  }
  if (typeof observation.value === 'number' && !Number.isFinite(observation.value)) {
    violations.push({ invariant: 'INV-1', path, detail: 'non-finite numeric value' });
  }
  return violations;
}

export function assertObservation(observation: Observation<unknown>, path: string): void {
  const violations = checkObservation(observation, path);
  if (violations.length > 0) throw new ContractViolation(violations);
}

export function assertObservations(entries: readonly (readonly [string, Observation<unknown>])[]): void {
  const violations = entries.flatMap(([path, observation]) => checkObservation(observation, path));
  if (violations.length > 0) throw new ContractViolation(violations);
}

/* ------------------------------------------------------------------ INV-5 */

export interface AggregateGate<T> {
  /** The proposed aggregate, or a thunk producing it only when the gate passes. */
  readonly compute: () => T;
  readonly requiredInputs: readonly { readonly path: string; readonly observation: Observation<unknown> }[];
  readonly allowsImputation?: boolean;
}

export type GateResult<T> =
  | { readonly withheld: false; readonly value: T }
  | { readonly withheld: true; readonly unmetInputs: readonly string[]; readonly reasons: readonly MissingReason[] };

/**
 * INV-5/INV-6 gate. The aggregate is computed only when every declared input is usable; otherwise the
 * result is withheld and names exactly which inputs were missing. Nothing is approximated.
 */
export function gateAggregate<T>(gate: AggregateGate<T>): GateResult<T> {
  const unmet: string[] = [];
  const reasons: MissingReason[] = [];
  for (const input of gate.requiredInputs) {
    const usable =
      isPresent(input.observation) &&
      (input.observation.presence !== 'IMPUTED' || gate.allowsImputation === true);
    if (!usable) {
      unmet.push(input.path);
      reasons.push(
        input.observation.reason ??
          (input.observation.presence === 'IMPUTED' ? 'OPERATING_METRIC_UNVALIDATED' : 'NOT_REPORTED'),
      );
    }
  }
  if (unmet.length > 0) return { withheld: true, unmetInputs: unmet, reasons };
  return { withheld: false, value: gate.compute() };
}

/* -------------------------------------------------------------- conclusion */

export type Adequacy = 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';

export interface ConclusionContext {
  readonly adequacy: Adequacy;
  readonly verb: DispositionVerb | CandidateVerb | null;
  /** Independently evidenced disqualifier (an as-filed fact), if the verb is a negative one. */
  readonly disqualifierEvidenceIds?: readonly string[];
  readonly intrinsicAvailable: boolean;
  /** True when the rationale makes a price-versus-value statement. */
  readonly makesValuationClaim?: boolean;
}

const NEGATIVE_VERBS: readonly (DispositionVerb | CandidateVerb)[] = ['AVOID', 'AVOID_CANDIDATE'];

/**
 * CONCL-1: insufficient evidence can never produce a conclusion in either direction.
 * CONCL-2: a negative verb requires positively evidenced disqualification, never mere absence.
 */
export function checkConclusion(context: ConclusionContext, path = 'disposition'): Violation[] {
  const violations: Violation[] = [];
  const isNegative = context.verb !== null && NEGATIVE_VERBS.includes(context.verb);

  if (context.adequacy === 'INSUFFICIENT' && context.verb !== null) {
    violations.push({
      invariant: 'CONCL-1',
      path,
      detail: `adequacy INSUFFICIENT must yield no verdict, received "${context.verb}"`,
    });
  }
  if (isNegative) {
    const evidence = context.disqualifierEvidenceIds ?? [];
    if (evidence.length === 0) {
      violations.push({
        invariant: 'CONCL-2',
        path,
        detail: `"${String(context.verb)}" requires an evidenced disqualifier; absence of evidence is not one`,
      });
    }
  }
  if (context.makesValuationClaim === true && !context.intrinsicAvailable) {
    violations.push({
      invariant: 'CONCL-1',
      path,
      detail: 'a price-versus-value claim requires a computed intrinsic value',
    });
  }
  return violations;
}

export function assertConclusion(context: ConclusionContext, path = 'disposition'): void {
  const violations = checkConclusion(context, path);
  if (violations.length > 0) throw new ContractViolation(violations);
}
