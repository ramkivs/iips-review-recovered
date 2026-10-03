/**
 * NP-12 N4-A9 Increment 1 — ScreenResult model and identity.
 *
 * Authority: NP-12-N4-A6-CONTRACT-SPECIFICATION.md §10 (frozen), bounded by
 * NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md §11 (`A9-D01`, §11.6).
 *
 * COMPLETED branch only. The governed status vocabulary is
 * `executionStatus ∈ { "COMPLETED", "FAILED" }` (A6 §10.2), but `A8-S-03` — canonical
 * FAILED-result identity — is an UNRESOLVED governance gap. This module therefore:
 *   - never emits, defines, or hashes an `executionStatus = "FAILED"` result;
 *   - never emits a fabricated zero-member canonical FAILED result;
 *   - never hashes a partial FAILED result;
 *   - never creates a `resultId` for a structurally failed execution.
 * Structural failure is raised by `ScreenExecution` as a typed error before any result
 * identity exists, so no FAILED identity is ever minted and the open question stays open.
 *
 * Member-level statuses `MATCH` / `NO_MATCH` / `INVALID_MEMBER`, the §10.4 counts, and the
 * §10.5 COMPLETED result shapes are implemented as published.
 */

import {
  EXECUTION_STATUS_COMPLETED,
  resultIdFrom,
  type MemberResultStatus,
  type ResultMemberBinding,
} from './CanonicalFormats';
import type { MemberErrorCode } from './ScreenMemberInput';
import { evaluateMember, type EvaluablePredicate } from './ScreenEvaluator';
import type { ScreenExecution } from './ScreenExecution';

/** A per-member result frame, in canonical G5 order. */
export interface MemberResult {
  readonly sector: string;
  readonly referenceId: string;
  readonly memberResultStatus: MemberResultStatus;
  /** The governed §7.4 member error code, or `''` when status ≠ INVALID_MEMBER. */
  readonly memberErrorCode: MemberErrorCode | '';
}

/** The completed ScreenResult and its deterministic identity. */
export interface ScreenResult {
  readonly resultId: string;
  readonly executionId: string;
  /** Always the governed `COMPLETED` token in this increment. */
  readonly executionStatus: typeof EXECUTION_STATUS_COMPLETED;
  readonly totalPopulationCount: number;
  readonly matchedCount: number;
  readonly memberResultCount: number;
  /** Canonically G5-ordered member results (A6 §12). */
  readonly members: readonly MemberResult[];
}

/** Re-exported so callers can name the canonical binding shape. */
export type { ResultMemberBinding };

/**
 * Guard that makes the FAILED exclusion structural rather than conventional: a result is
 * only ever constructed for the COMPLETED branch. Because `ScreenExecution` raises a typed
 * error for structural failure, this branch is unreachable for a failed execution, and no
 * `resultId` can exist for one.
 */
export function assertCompletedBranch(executionStatus: string): void {
  if (executionStatus !== EXECUTION_STATUS_COMPLETED) {
    throw new RangeError(
      'A8-S-03 is an unresolved governance gap: no FAILED execution result may be emitted, defined, or hashed',
    );
  }
}

/**
 * Derive the COMPLETED result of a completed execution.
 *
 * Member results are emitted in the execution's canonical G5 order and are never re-sorted
 * here (A6 §12 normative). An INVALID_MEMBER never matches, is counted in
 * `totalPopulationCount`, and is never counted in `matchedCount`, so the invariant
 * `matchedCount + nonMatchCount + invalidCount = totalPopulationCount` holds by
 * construction (A6 §10.4, A5-D08).
 */
export function screenResultFromExecution(
  execution: ScreenExecution,
  predicates: readonly EvaluablePredicate[],
): ScreenResult {
  assertCompletedBranch(EXECUTION_STATUS_COMPLETED);

  const members: MemberResult[] = execution.members.map((member) => {
    if (member.status === 'INVALID_MEMBER') {
      return {
        sector: member.sector,
        referenceId: member.referenceId,
        memberResultStatus: 'INVALID_MEMBER' as MemberResultStatus,
        memberErrorCode: member.errorCode as MemberErrorCode,
      };
    }
    return {
      sector: member.sector,
      referenceId: member.referenceId,
      memberResultStatus: evaluateMember(member, predicates) as MemberResultStatus,
      memberErrorCode: '' as MemberErrorCode,
    };
  });

  const matchedCount = members.filter((member) => member.memberResultStatus === 'MATCH').length;

  return {
    resultId: resultIdFrom(
      {
        executionId: execution.executionId,
        totalPopulationCount: execution.memberCount,
        matchedCount,
      },
      members.map((member) => ({
        sector: member.sector,
        referenceId: member.referenceId,
        memberResultStatus: member.memberResultStatus,
        memberErrorCode: member.memberErrorCode,
      })),
    ),
    executionId: execution.executionId,
    executionStatus: EXECUTION_STATUS_COMPLETED,
    totalPopulationCount: execution.memberCount,
    matchedCount,
    memberResultCount: members.length,
    members: Object.freeze(members),
  };
}
