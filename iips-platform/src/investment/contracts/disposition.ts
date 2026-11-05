/**
 * IID-0 — closed disposition vocabulary and subject model.
 *
 * Two vocabularies, deliberately separate (design of record Part I §A1.1, corrected by Part II §R-8):
 * a held position can be held/raised/lowered/exited; a candidate can only be initiated, watched or
 * declined. "RETAIN" for a zero position would let two different meanings share one word.
 *
 * A disposition is an investment assessment, never a trade instruction (Part II §R-10). Nothing in this
 * module, or in any IID artefact, expresses an order, a quantity, a price or a timing.
 */
import type { IssuerId, PositionKey, SecurityId } from './ids';

export const HELD_VERBS = ['RETAIN', 'ACCUMULATE', 'REDUCE', 'AVOID'] as const;
export type DispositionVerb = (typeof HELD_VERBS)[number];

export const CANDIDATE_VERBS = ['INITIATE', 'WATCH', 'AVOID_CANDIDATE'] as const;
export type CandidateVerb = (typeof CANDIDATE_VERBS)[number];

export type AnyVerb = DispositionVerb | CandidateVerb;

/**
 * Conservatism order, used for downward-only capping (mirrors the frozen sector engines' CAP_RANK
 * precedence pattern without importing or modifying them). A cap takes the minimum rank.
 */
export const VERB_RANK: Readonly<Record<AnyVerb, number>> = Object.freeze({
  AVOID: 1,
  AVOID_CANDIDATE: 1,
  REDUCE: 2,
  RETAIN: 3,
  WATCH: 3,
  INITIATE: 4,
  ACCUMULATE: 4,
});

/** Verbs that increase exposure. These may never rest on PARTIAL evidence (Part II §R-9). */
export function isExposureIncreasing(verb: AnyVerb): boolean {
  return verb === 'ACCUMULATE' || verb === 'INITIATE';
}

export function isNegative(verb: AnyVerb): boolean {
  return verb === 'AVOID' || verb === 'AVOID_CANDIDATE';
}

export function isHeldVerb(verb: string): verb is DispositionVerb {
  return (HELD_VERBS as readonly string[]).includes(verb);
}

export function isCandidateVerb(verb: string): verb is CandidateVerb {
  return (CANDIDATE_VERBS as readonly string[]).includes(verb);
}

/** The exact meaning applied, versioned with the disposition policy. */
export const VERB_DEFINITIONS: Readonly<Record<AnyVerb, string>> = Object.freeze({
  RETAIN:
    'Continue to own at approximately the current weight; nothing in the evidence justifies changing it.',
  ACCUMULATE:
    'Increase exposure toward a higher target band because price is below assessed intrinsic value by more than policy requires, and the company passes the quality and evidence tests.',
  REDUCE:
    'Decrease exposure toward a lower target band while continuing to own, because price exceeds assessed value, the position exceeds a limit, or a specific deterioration has occurred.',
  AVOID:
    'The evidence no longer supports continued ownership. This is not an instruction to sell, and implies no timing, price or quantity.',
  INITIATE:
    'Meets the same evidence tests as ACCUMULATE, from a zero position, and fits within the sector limit.',
  WATCH:
    'No disqualifying condition, but the evidence or the price does not yet justify a position.',
  AVOID_CANDIDATE:
    'Fails the minimum investment criteria; the evidence does not support initiating a position.',
});

export const INTERPRETATION = Object.freeze({
  nature: 'INVESTMENT_ASSESSMENT' as const,
  notAnInstruction:
    'This is an investment assessment, not a trade instruction, order, or recommendation to transact at a price or time.',
  noExecutionPath: true as const,
});

/* ----------------------------------------------------------------- subject */

export interface HeldSubject {
  readonly kind: 'HELD';
  readonly portfolioId: string;
  readonly positionKey: PositionKey;
  readonly securityId: SecurityId;
  readonly issuerId: IssuerId;
}

export interface CandidateSubject {
  readonly kind: 'CANDIDATE';
  readonly issuerId: IssuerId;
  readonly securityId: SecurityId;
  /** May be null: a candidate need not belong to any portfolio. */
  readonly contextPortfolioId: string | null;
  readonly origin: 'WATCHLIST' | 'ROSTER' | 'SCREEN';
}

export type DispositionSubject = HeldSubject | CandidateSubject;

export function subjectScope(subject: DispositionSubject): string {
  if (subject.kind === 'HELD') return `hd:${subject.portfolioId}/${subject.securityId}`;
  return `hc:${subject.contextPortfolioId ?? 'none'}/${subject.securityId}`;
}

export function verbsFor(kind: DispositionSubject['kind']): readonly AnyVerb[] {
  return kind === 'HELD' ? HELD_VERBS : CANDIDATE_VERBS;
}
