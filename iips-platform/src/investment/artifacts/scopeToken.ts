/**
 * IID-3 — investment scope tokens and the closed report-type registry.
 *
 * NP-04 accepts any non-empty `portfolioId`. It therefore cannot be the thing that decides whether a
 * scope token is admissible, and relying on it to do so would push a validation obligation across the
 * repository boundary into the store. Validation is IRR-side, before any store call.
 *
 * A scope token has the form `<prefix>:<subject>`, where the prefix comes from a CLOSED set and the
 * remainder is a bounded, character-restricted subject. The token is the *persistence chain* identity
 * component: one token + one report type = one logical artifact chain. It is deliberately independent
 * of content, date, digest or version — see the IID-3 composition module for why.
 *
 * NAMESPACE NOTE. `hc:` here is the portfolio-level ("holding collection") prefix. The IID-2 payload
 * carries its own `artifact.subjectScope` (`hc:<issuerId>`), which labels the SUBJECT inside the
 * payload and is not a chain identity. A company assessment's chain scope is `co:<issuerId>`. The two
 * are different namespaces on purpose: one names a chain, the other names what the payload is about.
 */

/** The closed prefix set. A prefix outside this set is rejected, never defaulted. */
export const SCOPE_TOKEN_PREFIXES = Object.freeze({
  /** A company/issuer assessment chain. */
  co: 'ISSUER',
  /** A holding-disposition chain. */
  hd: 'HOLDING',
  /** A portfolio-level chain (holding collection). */
  hc: 'PORTFOLIO',
  /** An investment change-report chain. */
  icr: 'INVESTMENT_CHANGE_REPORT',
} as const);

export type ScopeTokenPrefix = keyof typeof SCOPE_TOKEN_PREFIXES;
export type ScopeTokenSubjectKind = (typeof SCOPE_TOKEN_PREFIXES)[ScopeTokenPrefix];

/**
 * `<2-4 lowercase letters>:<1-120 chars of [A-Za-z0-9:+._/-]>`.
 *
 * Trailing/leading whitespace can never match because whitespace is not in the subject class, and an
 * empty subject can never match because the quantifier requires at least one character.
 */
export const SCOPE_TOKEN_PATTERN = /^[a-z]{2,4}:[A-Za-z0-9:+._/-]{1,120}$/;

/** Maximum subject length, enforced separately so the rejection names the actual defect. */
export const SCOPE_TOKEN_MAX_SUBJECT_LENGTH = 120;

/** Closed rejection vocabulary. A caller can switch on this without parsing prose. */
export const SCOPE_TOKEN_REJECTIONS = Object.freeze([
  'NOT_A_STRING',
  'EMPTY',
  'WHITESPACE_ONLY',
  'MALFORMED',
  'UNRECOGNISED_PREFIX',
  'SUBJECT_TOO_LONG',
] as const);

export type ScopeTokenRejection = (typeof SCOPE_TOKEN_REJECTIONS)[number];

export interface ScopeTokenAccepted {
  readonly ok: true;
  readonly token: string;
  readonly prefix: ScopeTokenPrefix;
  readonly subjectKind: ScopeTokenSubjectKind;
  readonly subject: string;
}

export interface ScopeTokenRejected {
  readonly ok: false;
  readonly reason: ScopeTokenRejection;
  readonly detail: string;
}

export type ScopeTokenResult = ScopeTokenAccepted | ScopeTokenRejected;

/** Raised by the asserting form, for call sites that treat an invalid token as a programming error. */
export class ScopeTokenError extends Error {
  constructor(message: string, readonly reason: ScopeTokenRejection, readonly token: unknown) {
    super(message);
    this.name = 'ScopeTokenError';
  }
}

function reject(reason: ScopeTokenRejection, detail: string): ScopeTokenRejected {
  return { ok: false, reason, detail };
}

/**
 * Validate a scope token.
 *
 * Order matters and is observable: the reason names the FIRST defect, so "empty" is never reported as
 * "malformed". Whitespace-only is its own reason because a blank token is the exact shape a
 * stringly-typed caller produces by accident, and it must not be reported as a mere syntax error.
 */
export function validateScopeToken(value: unknown): ScopeTokenResult {
  if (typeof value !== 'string') return reject('NOT_A_STRING', 'scope token must be a string');
  if (value.length === 0) return reject('EMPTY', 'scope token is empty');
  if (value.trim().length === 0) return reject('WHITESPACE_ONLY', 'scope token is whitespace only');
  if (value !== value.trim()) {
    return reject('MALFORMED', 'scope token must not carry leading or trailing whitespace');
  }

  const separator = value.indexOf(':');
  if (separator <= 0) return reject('MALFORMED', 'scope token must be "<prefix>:<subject>"');
  const prefix = value.slice(0, separator);
  const subject = value.slice(separator + 1);

  if (!/^[a-z]{2,4}$/.test(prefix)) {
    return reject('MALFORMED', 'prefix must be 2-4 lowercase letters');
  }
  if (!Object.prototype.hasOwnProperty.call(SCOPE_TOKEN_PREFIXES, prefix)) {
    return reject('UNRECOGNISED_PREFIX', `prefix "${prefix}" is not in the closed set`);
  }
  if (subject.length === 0) return reject('MALFORMED', 'scope token subject is empty');
  if (subject.length > SCOPE_TOKEN_MAX_SUBJECT_LENGTH) {
    return reject('SUBJECT_TOO_LONG', `subject exceeds ${SCOPE_TOKEN_MAX_SUBJECT_LENGTH} characters`);
  }
  if (!SCOPE_TOKEN_PATTERN.test(value)) {
    return reject('MALFORMED', 'subject contains a character outside [A-Za-z0-9:+._/-]');
  }

  return {
    ok: true,
    token: value,
    prefix: prefix as ScopeTokenPrefix,
    subjectKind: SCOPE_TOKEN_PREFIXES[prefix as ScopeTokenPrefix],
    subject,
  };
}

/** Asserting form. Throws `ScopeTokenError` with the same closed reason vocabulary. */
export function assertScopeToken(value: unknown): ScopeTokenAccepted {
  const result = validateScopeToken(value);
  if (result.ok) return result;
  throw new ScopeTokenError(`invalid scope token (${result.reason}): ${result.detail}`, result.reason, value);
}

/** True when the value is an admissible scope token. Never throws. */
export function isScopeToken(value: unknown): value is string {
  return validateScopeToken(value).ok;
}

/**
 * The chain scope token for a company assessment: `co:<issuerId>`.
 *
 * The issuer identifier is inserted verbatim — no case folding, no normalisation — because a scope
 * token is an identity, and two spellings of one issuer must not silently map to two chains. An
 * issuer id that cannot form a valid token is rejected here rather than truncated into one.
 */
export function companyScopeToken(issuerId: unknown): string {
  if (typeof issuerId !== 'string' || issuerId.length === 0) {
    throw new ScopeTokenError('issuerId must be a non-empty string', 'EMPTY', issuerId);
  }
  const token = `co:${issuerId}`;
  assertScopeToken(token);
  return token;
}

/* ------------------------------------------------------------------ report types */

/**
 * The closed report-type registry.
 *
 * `scopePrefix` ties a report type to the ONLY scope prefix it may be stored under, which is what makes
 * a "different report type" test meaningful: a change report cannot be filed against a company scope.
 */
export const REPORT_TYPE_REGISTRY = Object.freeze({
  'investment.company-assessment': Object.freeze({
    subjectKind: 'ISSUER',
    scopePrefix: 'co',
    routeSegment: 'company',
  }),
  'investment.holding-disposition': Object.freeze({
    subjectKind: 'HOLDING',
    scopePrefix: 'hd',
    routeSegment: 'holding',
  }),
  'investment.change-report': Object.freeze({
    subjectKind: 'PORTFOLIO',
    scopePrefix: 'icr',
    routeSegment: 'change',
  }),
} as const);

export type ReportType = keyof typeof REPORT_TYPE_REGISTRY;

export const REPORT_TYPES: readonly ReportType[] = Object.freeze(
  Object.keys(REPORT_TYPE_REGISTRY) as ReportType[],
);

export function isRegisteredReportType(value: unknown): value is ReportType {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(REPORT_TYPE_REGISTRY, value);
}

/** The report type a scope prefix may be used with. Closed: an unknown prefix has no report type. */
export function reportTypeForPrefix(prefix: ScopeTokenPrefix): ReportType {
  const entry = (Object.keys(REPORT_TYPE_REGISTRY) as ReportType[]).find(
    (type) => REPORT_TYPE_REGISTRY[type].scopePrefix === prefix,
  );
  if (entry === undefined) {
    throw new ScopeTokenError(`no report type registered for prefix "${prefix}"`, 'UNRECOGNISED_PREFIX', prefix);
  }
  return entry;
}

/** Validate that a report type and a scope token belong together. */
export function validateReportTypeForScope(
  reportType: unknown,
  scopeToken: unknown,
): { readonly ok: true; readonly reportType: ReportType; readonly scope: ScopeTokenAccepted }
  | { readonly ok: false; readonly reason: string; readonly detail: string } {
  if (!isRegisteredReportType(reportType)) {
    return { ok: false, reason: 'UNREGISTERED_REPORT_TYPE', detail: `report type "${String(reportType)}" is not in the closed registry` };
  }
  const scope = validateScopeToken(scopeToken);
  if (!scope.ok) {
    return { ok: false, reason: scope.reason, detail: scope.detail };
  }
  const expected = REPORT_TYPE_REGISTRY[reportType].scopePrefix;
  if (scope.prefix !== expected) {
    return {
      ok: false,
      reason: 'REPORT_TYPE_SCOPE_MISMATCH',
      detail: `report type "${reportType}" requires a "${expected}:" scope, received "${scope.prefix}:"`,
    };
  }
  return { ok: true, reportType, scope };
}
