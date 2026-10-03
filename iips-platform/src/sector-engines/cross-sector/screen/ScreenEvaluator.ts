/**
 * NP-12 N4-A9 Increment 1 — Screen evaluator.
 *
 * Authority: NP-12-N4-A6-CONTRACT-SPECIFICATION.md §7.3 (frozen), bounded by
 * NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md §11 (`A9-D01`).
 *
 * Predicate evaluation over the `conviction` / `quality` / `growth` fixed-point keys for
 * the five governed operators `lt` / `lte` / `gt` / `gte` / `eq`. Comparison is exact
 * integer arithmetic on the fixed-point key `q` — never binary floating point.
 *
 * Growth semantics (A6-DR-01 Option C, preserving the observable behaviour of N3 §7):
 *   - a growth predicate is satisfied only if availability is `AVAILABLE` AND `q ≠ 0`
 *     AND the governed numeric comparison holds;
 *   - if availability is `UNAVAILABLE`, every growth predicate fails;
 *   - if availability is `AVAILABLE` and `q = 0`, every growth predicate fails.
 * Availability is never reconstructed from the numeric value, and no second sentinel is
 * introduced. `renorm()` is not consulted, altered, or reimplemented here.
 *
 * The predicate collection is a flat AND. An explicitly supplied empty collection is
 * match-all over valid members (D-A2-5 §8.2.7). Contradictory predicates simply produce
 * an empty result: the frozen byte grammar forbids any contradiction detector or logical
 * simplifier, and none is implemented.
 */

import type { ScreeningOperator } from '../definition/ScreenDefinition';
import type { AdmittedMember } from './ScreenMemberInput';

/** A canonical predicate as published by the frozen Screen Definition grammar. */
export interface EvaluablePredicate {
  readonly field: 'conviction' | 'quality' | 'growth';
  readonly operator: ScreeningOperator;
  /** Exact fixed-point key `q` of the canonical operand. */
  readonly q: bigint;
}

/** Outcome of evaluating one predicate collection against one member. */
export type PredicateOutcome = 'MATCH' | 'NO_MATCH';

/**
 * The assigned evaluator identity (`A6-U-02` / `A6-U-03` / `A6-U-04`).
 *
 * These are explicit, deterministic, stable, configuration-independent literals. They
 * contain no timestamp, no randomness, no process state, and no environment input, so
 * they are byte-identical on every run, node, and configuration. The exact values are
 * recorded in the implementation record and asserted by test.
 */
export const EVALUATOR_ID = 'NP12-SCREEN-EVALUATOR';
export const EVALUATOR_VERSION = '01';
export const EXECUTION_SEMANTICS_VERSION = '01';

/** The governed operator set, in the frozen §5.3 operator order. */
export const SCREEN_OPERATORS: readonly ScreeningOperator[] = ['eq', 'gt', 'gte', 'lt', 'lte'];

/** The exact fixed-point comparison of the five governed operators. */
export function compareQ(memberQ: bigint, operandQ: bigint, operator: ScreeningOperator): boolean {
  switch (operator) {
    case 'lt':
      return memberQ < operandQ;
    case 'lte':
      return memberQ <= operandQ;
    case 'gt':
      return memberQ > operandQ;
    case 'gte':
      return memberQ >= operandQ;
    case 'eq':
      return memberQ === operandQ;
    default:
      return false;
  }
}

/** Resolve a member's exact fixed-point key for a governed screening field. */
export function memberKey(member: AdmittedMember, field: EvaluablePredicate['field']): bigint | null {
  switch (field) {
    case 'conviction':
      return member.convictionQ;
    case 'quality':
      return member.qualityQ;
    default:
      return member.growthQ;
  }
}

/**
 * A growth predicate is satisfied only under the explicit AVAILABLE-and-non-zero rule of
 * A6 §7.3. Unavailable growth and available numeric zero both fail every growth operator.
 */
export function growthPredicateSatisfied(
  member: AdmittedMember,
  operator: ScreeningOperator,
  operandQ: bigint,
): boolean {
  if (member.growthAvailability !== 'AVAILABLE') return false;
  const q = member.growthQ;
  if (q === null || q === 0n) return false;
  return compareQ(q, operandQ, operator);
}

/**
 * Evaluate a canonical predicate collection against one admitted member.
 *
 * An invalid member never matches: it does not silently participate and does not match
 * any predicate (A5-D08, D-A2-4). An explicitly empty collection is match-all, which
 * likewise applies to valid members only.
 */
export function evaluateMember(
  member: AdmittedMember,
  predicates: readonly EvaluablePredicate[],
): PredicateOutcome {
  if (member.status !== 'VALID') return 'NO_MATCH';
  for (const predicate of predicates) {
    if (predicate.field === 'growth') {
      if (!growthPredicateSatisfied(member, predicate.operator, predicate.q)) return 'NO_MATCH';
      continue;
    }
    const q = memberKey(member, predicate.field);
    // A VALID member always carries an exact key for conviction and quality.
    if (q === null || !compareQ(q, predicate.q, predicate.operator)) return 'NO_MATCH';
  }
  return 'MATCH';
}
