/**
 * IID-3 — investment artifact contracts.
 *
 * The persistence chain boundary, the read transport and the operator CLI all agree on exactly these
 * two things: what a scope token is, and what report types exist. Nothing here performs I/O.
 */
export {
  SCOPE_TOKEN_PREFIXES,
  SCOPE_TOKEN_PATTERN,
  SCOPE_TOKEN_MAX_SUBJECT_LENGTH,
  SCOPE_TOKEN_REJECTIONS,
  ScopeTokenError,
  assertScopeToken,
  companyScopeToken,
  isScopeToken,
  reportTypeForPrefix,
  validateReportTypeForScope,
  validateScopeToken,
  REPORT_TYPE_REGISTRY,
  REPORT_TYPES,
  isRegisteredReportType,
} from './scopeToken';
export type {
  ReportType,
  ScopeTokenAccepted,
  ScopeTokenPrefix,
  ScopeTokenRejected,
  ScopeTokenRejection,
  ScopeTokenResult,
  ScopeTokenSubjectKind,
} from './scopeToken';
