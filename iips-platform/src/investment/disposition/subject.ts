/**
 * IID-4 — `DispositionSubject` construction and the invariants that keep the two kinds apart (R-8).
 *
 * The whole point of R-8 is that a candidate is **not** a holding that happens to be empty. So this
 * module does three things and nothing else:
 *
 *   - builds a `HELD` subject only from real position facts, requiring a position key derived from the
 *     portfolio and security (never accepted from the caller verbatim);
 *   - builds a `CANDIDATE` subject with `quantities: 'NOT_APPLICABLE'` and no position key;
 *   - refuses the two crossings that would silently fabricate authority: a candidate carrying position
 *     facts, and a held subject without them.
 *
 * The chain scope each kind may use is fixed here too (`hd:` / `hc:`), so that AC-4.3 ("a candidate
 * appears only on `hc:` chains") is a property of the subject, not a rule a caller has to remember.
 */
import { parseIssuerId, parseSecurityId, positionKey } from '../contracts/ids';
import type { IssuerId, SecurityId } from '../contracts/ids';
import type { NumericObservation } from '../contracts/observation';
import type {
  CandidateSubjectFacts,
  HeldSubjectFacts,
  IdentityState,
  SecurityClassDisposition,
  SecurityState,
  SubjectFacts,
} from './types';

export const SUBJECT_REJECTIONS = Object.freeze([
  'PORTFOLIO_ID_REQUIRED',
  'POSITION_FACTS_FORBIDDEN',
  'POSITION_FACTS_REQUIRED',
  'SECURITY_ID_INVALID',
  'ISSUER_ID_INVALID',
  'SECURITY_CLASS_INVALID',
  'QUANTITIES_MUST_BE_NOT_APPLICABLE',
  'CONTEXT_PORTFOLIO_INVALID',
] as const);

export type SubjectRejection = (typeof SUBJECT_REJECTIONS)[number];

export class SubjectError extends Error {
  constructor(message: string, readonly reason: SubjectRejection, readonly detail: Readonly<Record<string, unknown>> = {}) {
    super(message);
    this.name = 'SubjectError';
  }
}

const SECURITY_CLASSES: readonly SecurityClassDisposition[] = Object.freeze([
  'EQUITY',
  'OUT_OF_SCOPE_SECURITY',
  'UNLISTED',
  'FOREIGN_ISSUER',
]);

const SECURITY_STATES: readonly SecurityState[] = Object.freeze(['ACTIVE', 'MERGED', 'DELISTED', 'SUSPENDED', 'UNKNOWN']);
const IDENTITY_STATES: readonly IdentityState[] = Object.freeze(['RESOLVED', 'UNRESOLVED', 'AMBIGUOUS']);

function requireString(value: unknown, field: string, reason: SubjectRejection): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new SubjectError(`${field} must be a non-empty string`, reason, { field, value });
  }
  return value;
}

function requireObservation(value: unknown, field: string): NumericObservation {
  if (value === null || typeof value !== 'object' || !('presence' in (value as Record<string, unknown>))) {
    throw new SubjectError(`${field} must be an Observation`, 'POSITION_FACTS_REQUIRED', { field });
  }
  return value as NumericObservation;
}

export interface HeldSubjectInput {
  readonly portfolioId: string;
  readonly securityId: string;
  readonly issuerId: string;
  readonly symbol: string;
  readonly exchange: 'NSE' | 'BSE';
  readonly securityClass: SecurityClassDisposition;
  readonly heldAsOf: string;
  readonly identityState: IdentityState;
  readonly securityState?: SecurityState;
  readonly quantities: {
    readonly quantity: NumericObservation;
    readonly averageCost: NumericObservation;
    readonly marketValue: NumericObservation;
    readonly unrealisedGainPct: NumericObservation;
  };
}

/**
 * Build a held subject.
 *
 * The position key is DERIVED (`positionKey(portfolioId, securityId)`), never accepted, so two artefacts
 * cannot disagree about which position they describe.
 */
export function heldSubject(input: HeldSubjectInput): HeldSubjectFacts {
  const portfolioId = requireString(input?.portfolioId, 'portfolioId', 'PORTFOLIO_ID_REQUIRED');
  const securityId = parseSecurityId(requireString(input?.securityId, 'securityId', 'SECURITY_ID_INVALID')) as SecurityId;
  const issuerId = parseIssuerId(requireString(input?.issuerId, 'issuerId', 'ISSUER_ID_INVALID')) as IssuerId;
  if (!SECURITY_CLASSES.includes(input.securityClass)) {
    throw new SubjectError('securityClass is not in the closed set', 'SECURITY_CLASS_INVALID', {
      securityClass: input.securityClass,
    });
  }
  const securityState = input.securityState ?? 'UNKNOWN';
  if (!SECURITY_STATES.includes(securityState)) {
    throw new SubjectError('securityState is not in the closed set', 'SECURITY_CLASS_INVALID', { securityState });
  }
  if (!IDENTITY_STATES.includes(input.identityState)) {
    throw new SubjectError('identityState is not in the closed set', 'SECURITY_CLASS_INVALID', {
      identityState: input.identityState,
    });
  }
  const quantities = input.quantities ?? ({} as HeldSubjectInput['quantities']);
  return Object.freeze({
    kind: 'HELD' as const,
    portfolioId,
    positionKey: String(positionKey(portfolioId, securityId)),
    securityId,
    issuerId,
    symbol: requireString(input.symbol, 'symbol', 'SECURITY_ID_INVALID'),
    exchange: input.exchange,
    securityClass: input.securityClass,
    heldAsOf: requireString(input.heldAsOf, 'heldAsOf', 'SECURITY_ID_INVALID'),
    identityState: input.identityState,
    securityState,
    quantities: Object.freeze({
      quantity: requireObservation(quantities.quantity, 'quantities.quantity'),
      averageCost: requireObservation(quantities.averageCost, 'quantities.averageCost'),
      marketValue: requireObservation(quantities.marketValue, 'quantities.marketValue'),
      unrealisedGainPct: requireObservation(quantities.unrealisedGainPct, 'quantities.unrealisedGainPct'),
    }),
  });
}

export interface CandidateSubjectInput {
  readonly issuerId: string;
  readonly securityId: string;
  readonly contextPortfolioId?: string | null;
  readonly origin: 'WATCHLIST' | 'ROSTER' | 'SCREEN';
  readonly symbol: string;
  readonly exchange: 'NSE' | 'BSE';
  readonly securityClass: SecurityClassDisposition;
  readonly identityState: IdentityState;
  readonly securityState?: SecurityState;
  /**
   * Optional so the common call is simply "a candidate". When supplied it must be the literal
   * `'NOT_APPLICABLE'`; any other value is a caller trying to give a candidate position facts.
   */
  readonly quantities?: 'NOT_APPLICABLE';
  /** Rejected if present: a candidate has no position key. */
  readonly positionKey?: never;
}

/**
 * Build a candidate subject.
 *
 * `quantities` is the literal `NOT_APPLICABLE`. A candidate with a number — even zero — would be a
 * holding, and calling it a candidate would let "no position" and "empty position" share one shape.
 */
export function candidateSubject(input: CandidateSubjectInput): CandidateSubjectFacts {
  const issuerId = parseIssuerId(requireString(input?.issuerId, 'issuerId', 'ISSUER_ID_INVALID')) as IssuerId;
  const securityId = parseSecurityId(requireString(input?.securityId, 'securityId', 'SECURITY_ID_INVALID')) as SecurityId;
  if (input.positionKey !== undefined) {
    throw new SubjectError('a candidate must not carry a positionKey', 'POSITION_FACTS_FORBIDDEN');
  }
  if (typeof input.quantities !== 'undefined' && input.quantities !== 'NOT_APPLICABLE') {
    throw new SubjectError("a candidate's quantities must be the literal 'NOT_APPLICABLE'", 'QUANTITIES_MUST_BE_NOT_APPLICABLE', {
      quantities: input.quantities,
    });
  }
  const contextPortfolioId = input.contextPortfolioId ?? null;
  if (contextPortfolioId !== null && typeof contextPortfolioId !== 'string') {
    throw new SubjectError('contextPortfolioId must be a string or null', 'CONTEXT_PORTFOLIO_INVALID');
  }
  if (contextPortfolioId !== null && contextPortfolioId.length === 0) {
    throw new SubjectError('contextPortfolioId must be null or non-empty', 'CONTEXT_PORTFOLIO_INVALID');
  }
  if (!['WATCHLIST', 'ROSTER', 'SCREEN'].includes(input.origin)) {
    throw new SubjectError('origin is not in the closed set', 'SECURITY_CLASS_INVALID', { origin: input.origin });
  }
  if (!SECURITY_CLASSES.includes(input.securityClass)) {
    throw new SubjectError('securityClass is not in the closed set', 'SECURITY_CLASS_INVALID', {
      securityClass: input.securityClass,
    });
  }
  const securityState = input.securityState ?? 'UNKNOWN';
  if (!SECURITY_STATES.includes(securityState)) {
    throw new SubjectError('securityState is not in the closed set', 'SECURITY_CLASS_INVALID', { securityState });
  }
  if (!IDENTITY_STATES.includes(input.identityState)) {
    throw new SubjectError('identityState is not in the closed set', 'SECURITY_CLASS_INVALID', {
      identityState: input.identityState,
    });
  }
  return Object.freeze({
    kind: 'CANDIDATE' as const,
    issuerId,
    securityId,
    contextPortfolioId,
    origin: input.origin,
    symbol: requireString(input.symbol, 'symbol', 'SECURITY_ID_INVALID'),
    exchange: input.exchange,
    securityClass: input.securityClass,
    identityState: input.identityState,
    securityState,
    quantities: 'NOT_APPLICABLE' as const,
  });
}

/** The chain scope token a subject must be filed under. The prefix IS the kind discriminator. */
export function subjectChainScope(subject: SubjectFacts): string {
  if (subject.kind === 'HELD') return `hd:${subject.portfolioId}/${subject.securityId}`;
  return `hc:${subject.contextPortfolioId ?? 'none'}/${subject.securityId}`;
}

/**
 * Chain scopes built from identities alone, for READ paths that must address a chain without constructing a
 * whole subject. They are the same strings `subjectChainScope` produces, which is the property that keeps a
 * read from missing a write.
 */
export function holdingChainScope(portfolioId: string, securityId: string): string {
  if (typeof portfolioId !== 'string' || portfolioId.trim().length === 0) {
    throw new SubjectError('portfolio id is required', 'PORTFOLIO_ID_REQUIRED', { portfolioId });
  }
  return `hd:${portfolioId.trim()}/${parseSecurityId(securityId)}`;
}

export function candidateChainScope(contextPortfolioId: string | null, securityId: string): string {
  const context = contextPortfolioId === null || contextPortfolioId.trim().length === 0 ? 'none' : contextPortfolioId.trim();
  return `hc:${context}/${parseSecurityId(securityId)}`;
}

/** The payload's own subject label. Never a chain identity (L-011). */
export function subjectPayloadScope(subject: SubjectFacts): string {
  return subject.kind === 'HELD' ? `hdp:${subject.positionKey}` : `hcp:${subject.issuerId}/${subject.securityId}`;
}

/**
 * Assert that a subject and a chain scope agree about the kind.
 *
 * This is what makes AC-4.3 structural: a candidate cannot be filed on an `hd:` chain (and a held
 * position cannot be filed on `hc:`), because the prefix must match the subject kind before any write.
 */
export function assertSubjectScopeAgreement(subject: SubjectFacts, scopeToken: string): void {
  const expectedPrefix = subject.kind === 'HELD' ? 'hd' : 'hc';
  const prefix = typeof scopeToken === 'string' ? scopeToken.slice(0, scopeToken.indexOf(':')) : '';
  if (prefix !== expectedPrefix) {
    throw new SubjectError(
      `a ${subject.kind} subject must be filed on a "${expectedPrefix}:" chain scope`,
      subject.kind === 'CANDIDATE' ? 'POSITION_FACTS_FORBIDDEN' : 'POSITION_FACTS_REQUIRED',
      { subjectKind: subject.kind, scopeToken, expectedPrefix },
    );
  }
  if (scopeToken !== subjectChainScope(subject)) {
    throw new SubjectError('scope token does not name this subject', 'SECURITY_ID_INVALID', {
      expected: subjectChainScope(subject),
      actual: scopeToken,
    });
  }
}

export function assertCandidateHasNoPositionFacts(facts: Record<string, unknown>): void {
  for (const forbidden of ['positionKey', 'quantity', 'averageCost', 'marketValue']) {
    if (Object.prototype.hasOwnProperty.call(facts, forbidden) && facts[forbidden] !== undefined) {
      throw new SubjectError(`a candidate must not carry ${forbidden}`, 'POSITION_FACTS_FORBIDDEN', { forbidden });
    }
  }
}
