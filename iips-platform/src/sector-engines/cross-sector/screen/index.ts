/**
 * NP-12 N4-A9 Increment 1 — Screen-side runtime module barrel.
 *
 * Authority: NP-12-N4-A6-CONTRACT-SPECIFICATION.md (frozen), bounded by
 * NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md §11 (`A9-D01`).
 *
 * This barrel is NEW and is confined to the new `screen/` directory. The existing
 * cross-sector barrel `../index.ts` is deliberately NOT modified (`A9-D02`, §11.9): the
 * frozen N4-SD `decimal()` is neither exported, re-exported, nor relocated, and no existing
 * export is added, removed, or changed.
 */

export {
  CANONICAL_SCREEN_SECTORS,
  DECIMAL_MAX_Q,
  DECIMAL_SCALE,
  MAX_FRACTION_DIGITS,
  ScreenMemberValueError,
  admitMember,
  canonicalDecimalText,
  inspectCanonicalDecimal,
  memberErrorCodeFor,
  requireCanonicalDecimal,
  type AdmittedMember,
  type CanonicalDecimalRejection,
  type CanonicalDecimalResult,
  type GrowthAvailability,
  type MemberErrorCode,
  type MemberValidationStatus,
  type ScreenMemberInput,
} from './ScreenMemberInput';

export {
  AVAILABILITY_OCTET_AVAILABLE,
  AVAILABILITY_OCTET_UNAVAILABLE,
  EXECUTION_STATUS_COMPLETED,
  FORMAT_VERSION,
  HEADER_EXE,
  HEADER_MBR,
  HEADER_RES,
  executionIdFrom,
  executionPreimage,
  growthComponent,
  isLowercaseHex64,
  memberInputHash,
  memberPreimage,
  resultIdFrom,
  resultPreimage,
  sha256Hex,
  text,
  u32be,
  utf8ByteLength,
  type ExecutionMemberBinding,
  type MemberResultStatus,
  type ResultMemberBinding,
} from './CanonicalFormats';

export {
  EVALUATOR_ID,
  EVALUATOR_VERSION,
  EXECUTION_SEMANTICS_VERSION,
  SCREEN_OPERATORS,
  compareQ,
  evaluateMember,
  growthPredicateSatisfied,
  memberKey,
  type EvaluablePredicate,
  type PredicateOutcome,
} from './ScreenEvaluator';

export {
  ScreenExecutionError,
  definitionPredicates,
  executeScreen,
  executionBindings,
  type BoundMember,
  type ScreenExecution,
  type ScreenExecutionErrorCode,
  type ScreenExecutionInput,
} from './ScreenExecution';

export {
  ScreenResult,
  assertCompletedBranch,
  screenResultFromExecution,
  type MemberResult,
} from './ScreenResult';
