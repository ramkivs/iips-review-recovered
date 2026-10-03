/**
 * NP-12 N4-A9 Increment 1 — ScreenExecution envelope.
 *
 * Authority: NP-12-N4-A6-CONTRACT-SPECIFICATION.md §§7–9 (frozen), bounded by
 * NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md §11 (`A9-D01`).
 *
 * Consumes a SUPPLIED Screen Member Evaluation Input. It does not call a sector engine,
 * construct a missing member value, retrieve a fixture value as a production value,
 * synthesize a `companyId`, repair producer data, infer unavailable growth from a numeric
 * zero, or reach through the boundary to obtain source values.
 *
 * Member ordering consumes the governed G5 comparator VERBATIM from the frozen population
 * boundary. No replacement comparator is created and no second ordering policy exists
 * (A6 §12 normative, `A6-IMPL-09`).
 *
 * Structural/execution-level failure is kept strictly distinct from member-level
 * invalidity (A6 §7.4, D-A2-5, A5-D08). The `FAILED` execution-status branch is NOT
 * implemented: `A8-S-03` is an unresolved governance gap, so a structural failure is
 * raised as a typed error and never emitted, defined, or hashed as a canonical result
 * (A9 §11.6). No `resultId` is ever produced for a structurally failed execution.
 */

import type { ScreenDefinition } from '../definition/ScreenDefinition';
import {
  compareMembers,
  populationIdentity,
  type PopulationMember,
} from '../population/ScreeningPopulation';
import {
  executionIdFrom,
  isLowercaseHex64,
  memberInputHash,
  type ExecutionMemberBinding,
} from './CanonicalFormats';
import {
  admitMember,
  type AdmittedMember,
} from './ScreenMemberInput';
import {
  EVALUATOR_ID,
  EVALUATOR_VERSION,
  EXECUTION_SEMANTICS_VERSION,
  evaluateMember,
  type EvaluablePredicate,
  type PredicateOutcome,
} from './ScreenEvaluator';
import { ScreenResult, screenResultFromExecution } from './ScreenResult';

/** Governed execution-level (structural) failure codes (A6 §7.4 structural table). */
export type ScreenExecutionErrorCode =
  | 'EXECUTION_DEFINITION_INVALID'
  | 'EXECUTION_POPULATION_MISMATCH'
  | 'EXECUTION_CONTRACT_MALFORMED'
  | 'EXECUTION_IDENTITY_INVALID';

/** Fail-closed structural failure. Never carries a member-level error code. */
export class ScreenExecutionError extends Error {
  constructor(readonly code: ScreenExecutionErrorCode, message: string) {
    super(message);
    this.name = 'ScreenExecutionError';
  }
}

/** The supplied execution envelope. `timestamp` / `requestId` are audit-only. */
export interface ScreenExecutionInput {
  /** A Screen Definition already bound to its independently verified population identity. */
  readonly definition: ScreenDefinition;
  /** The supplied Screen Member Evaluation Input, in any order. */
  readonly members: readonly unknown[];
  /** REQUIRED as provenance; EXCLUDED from every identity preimage (A6-DR-03). */
  readonly timestamp?: string;
  /** OPTIONAL audit-only; EXCLUDED from every identity preimage (A6-DR-02). */
  readonly requestId?: string;
}

/** A member bound into the execution, in canonical G5 order. */
export interface BoundMember extends AdmittedMember {
  /** SHA-256 of the `NP12MBR` v01 preimage (A6 §8.3). */
  readonly inputHash: string;
}

/** The completed ScreenExecution: canonical content plus its deterministic identity. */
export interface ScreenExecution {
  readonly executionId: string;
  readonly definitionId: string;
  readonly version: string;
  readonly definitionDigest: string;
  readonly populationIdentity: string;
  readonly evaluatorId: string;
  readonly evaluatorVersion: string;
  readonly executionSemanticsVersion: string;
  /** Canonically G5-ordered bound members; length equals the bound population size. */
  readonly members: readonly BoundMember[];
  readonly memberCount: number;
  /** Audit-only provenance, carried alongside and never inside any preimage. */
  readonly timestamp?: string;
  readonly requestId?: string;
}

/** The governed G5-ordered `(sector, referenceId, inputHash)` bindings of A6 §9.2. */
export function executionBindings(members: readonly BoundMember[]): ExecutionMemberBinding[] {
  return members.map((member) => ({
    sector: member.sector,
    referenceId: member.referenceId,
    inputHash: member.inputHash,
  }));
}

/**
 * The canonical predicate keys of a Screen Definition, already in the frozen §5.3 order.
 * Only the exact fixed-point key is recovered here, by exact integer arithmetic over the
 * published canonical operand text — never by parsing a binary floating point.
 */
export function definitionPredicates(definition: ScreenDefinition): EvaluablePredicate[] {
  return definition.predicates.map((predicate) => {
    const dot = predicate.operand.indexOf('.');
    const whole = dot === -1 ? predicate.operand : predicate.operand.slice(0, dot);
    const fraction = dot === -1 ? '' : predicate.operand.slice(dot + 1);
    return {
      field: predicate.field,
      operator: predicate.operator,
      q: BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0')),
    };
  });
}

function populationMember(member: AdmittedMember): PopulationMember {
  return { sector: member.sector as PopulationMember['sector'], referenceId: member.referenceId };
}

/**
 * Execute the Screen over a supplied member evaluation input.
 *
 * Throws `ScreenExecutionError` for structural invalidity. On success returns the
 * execution and its COMPLETED-branch result.
 */
export function executeScreen(input: unknown): { execution: ScreenExecution; result: ScreenResult } {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new ScreenExecutionError('EXECUTION_CONTRACT_MALFORMED', 'Screen execution input must be a record');
  }
  const request = input as Record<string, unknown>;
  const definition = request.definition as ScreenDefinition | undefined;
  if (
    definition === null
    || typeof definition !== 'object'
    || typeof (definition as ScreenDefinition).sha256 !== 'function'
    || typeof (definition as ScreenDefinition).predicates !== 'object'
  ) {
    throw new ScreenExecutionError('EXECUTION_DEFINITION_INVALID', 'A Screen Definition is required');
  }

  const definitionDigest = definition.sha256();
  const boundPopulationIdentity = definition.populationIdentity;
  if (!isLowercaseHex64(boundPopulationIdentity)) {
    throw new ScreenExecutionError(
      'EXECUTION_IDENTITY_INVALID',
      'Population identity must be 64 lowercase hexadecimal text octets',
    );
  }

  const supplied = request.members;
  if (!Array.isArray(supplied)) {
    throw new ScreenExecutionError(
      'EXECUTION_CONTRACT_MALFORMED',
      'Supplied Screen members must be an explicit array',
    );
  }

  // Admission: structural violations fail the execution; member-value violations do not.
  const admitted: AdmittedMember[] = [];
  for (const entry of supplied) {
    const outcome = admitMember(entry);
    if (outcome.structural !== null) {
      throw new ScreenExecutionError('EXECUTION_CONTRACT_MALFORMED', outcome.structural.message);
    }
    if (outcome.member !== null) admitted.push(outcome.member);
  }

  // G5 — canonical ordering by (normalized sector, reference identifier), consumed verbatim.
  const ordered = [...admitted].sort((a, b) => compareMembers(populationMember(a), populationMember(b)));

  // Exact population binding and exact member coverage (D-A2-5 §8.2.4/§8.2.5): the
  // governed G4 membership-only identity over the G5-ordered supplied member set must
  // equal the identity the Screen Definition is bound to. A missing member, an extra
  // member not in the bound population, or a duplicate all fail closed here.
  const derivedIdentity = populationIdentity(ordered.map(populationMember));
  if (derivedIdentity !== boundPopulationIdentity) {
    throw new ScreenExecutionError(
      'EXECUTION_POPULATION_MISMATCH',
      'Supplied members do not exactly cover the bound population (missing, extra, or duplicate member)',
    );
  }

  const bound: BoundMember[] = ordered.map((member) => ({
    ...member,
    inputHash: memberInputHash(member, boundPopulationIdentity),
  }));

  const execution: ScreenExecution = {
    executionId: executionIdFrom(
      {
        definitionId: definition.definitionId,
        version: definition.version,
        definitionDigest,
        populationIdentity: boundPopulationIdentity,
        evaluatorId: EVALUATOR_ID,
        evaluatorVersion: EVALUATOR_VERSION,
        executionSemanticsVersion: EXECUTION_SEMANTICS_VERSION,
      },
      executionBindings(bound),
    ),
    definitionId: definition.definitionId,
    version: definition.version,
    definitionDigest,
    populationIdentity: boundPopulationIdentity,
    evaluatorId: EVALUATOR_ID,
    evaluatorVersion: EVALUATOR_VERSION,
    executionSemanticsVersion: EXECUTION_SEMANTICS_VERSION,
    members: Object.freeze(bound),
    memberCount: bound.length,
    ...(typeof request.timestamp === 'string' ? { timestamp: request.timestamp } : {}),
    ...(typeof request.requestId === 'string' ? { requestId: request.requestId } : {}),
  };

  const result = screenResultFromExecution(execution, definitionPredicates(definition));
  return { execution, result };
}

/** Evaluate one bound member against a canonical predicate collection. */
export function evaluateBoundMember(
  member: BoundMember,
  predicates: readonly EvaluablePredicate[],
): PredicateOutcome {
  return evaluateMember(member, predicates);
}
