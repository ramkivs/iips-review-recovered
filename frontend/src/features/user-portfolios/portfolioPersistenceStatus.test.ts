/**
 * Persistence-status derivation tests.
 *
 * The four states this surface may display are presentation decisions over IPD's
 * stored facts, so the tests pin each decision to the exact stored values that
 * produce it — including the case that used to be wrong: an INITIAL revision that
 * already carries persisted holdings while IPD reports `isSaved: false`.
 */
import { describe, expect, it } from 'vitest';
import type { UserPortfolioRead, UserPortfolioRevision, UserPortfolioView } from '../../api/userPortfolios';
import {
  derivePortfolioPersistence,
  rejectedRevisionsNote,
} from './portfolioPersistenceStatus';

function view(overrides: Partial<UserPortfolioView> = {}): UserPortfolioView {
  return {
    portfolioId: 'pf-alpha',
    portfolioName: 'Primary Portfolio',
    revision: 1,
    holdings: [],
    totalMarketValue: 0,
    totalHoldingsCount: 0,
    weightSumPercentage: 0,
    lastUpdated: '2026-11-08T09:15:00.000Z',
    provenanceDigest: '',
    isSaved: false,
    contributions: [],
    ...overrides,
  };
}

function readOf(portfolio: UserPortfolioView, rejectedHoldings = 0): UserPortfolioRead {
  return { portfolio, holdingSourceIndices: portfolio.holdings.map((_, index) => index), rejectedHoldings, rejectedContributions: 0 };
}

function revision(overrides: Partial<UserPortfolioRevision> = {}): UserPortfolioRevision {
  return {
    revision: 1,
    operation: 'INITIAL',
    totalMarketValue: 0,
    provenanceDigest: '',
    holdingsCount: 0,
    createdAt: '2026-11-08T09:15:00.000Z',
    ...overrides,
  };
}

describe('derivePortfolioPersistence — the four presentation states', () => {
  it('INITIAL with zero holdings is EMPTY', () => {
    const observation = derivePortfolioPersistence({
      read: readOf(view({ revision: 1, totalHoldingsCount: 0 })),
      history: [revision({ revision: 1, operation: 'INITIAL', holdingsCount: 0 })],
    });
    expect(observation.status).toBe('EMPTY');
    expect(observation.operation).toBe('INITIAL');
    expect(observation.revision).toBe(1);
    expect(observation.committedAt).toBe('2026-11-08T09:15:00.000Z');
    expect(observation.concurrentRevisionObservation).toBe(false);
  });

  it('INITIAL with persisted holdings is PERSISTED even when isSaved is false', () => {
    // The correctness fix: a first broker import commits as INITIAL with holdings, so
    // IPD reports isSaved=false while the holdings are in fact durable.
    const observation = derivePortfolioPersistence({
      read: readOf(view({
        revision: 1,
        totalHoldingsCount: 2,
        totalMarketValue: 13000,
        weightSumPercentage: 100,
        isSaved: false,
        provenanceDigest: 'a'.repeat(64),
      })),
      history: [revision({ revision: 1, operation: 'INITIAL', holdingsCount: 2, totalMarketValue: 13000 })],
    });
    expect(observation.status).toBe('PERSISTED');
    expect(observation.operation).toBe('INITIAL');
    expect(observation.explanation).toMatch(/isSaved=false/);
  });

  it('MERGE is UPDATED', () => {
    const observation = derivePortfolioPersistence({
      read: readOf(view({ revision: 2, totalHoldingsCount: 3, isSaved: true })),
      history: [
        revision({ revision: 1, operation: 'INITIAL', holdingsCount: 2 }),
        revision({ revision: 2, operation: 'MERGE', holdingsCount: 3, createdAt: '2026-11-09T10:00:00.000Z' }),
      ],
    });
    expect(observation.status).toBe('UPDATED');
    expect(observation.operation).toBe('MERGE');
    expect(observation.committedAt).toBe('2026-11-09T10:00:00.000Z');
  });

  it('REPLACE is UPDATED', () => {
    const observation = derivePortfolioPersistence({
      read: readOf(view({ revision: 3, totalHoldingsCount: 5, isSaved: true })),
      history: [revision({ revision: 3, operation: 'REPLACE', holdingsCount: 5 })],
    });
    expect(observation.status).toBe('UPDATED');
    expect(observation.operation).toBe('REPLACE');
  });

  it('RESET is EMPTY, because a reset clears the portfolio', () => {
    const observation = derivePortfolioPersistence({
      read: readOf(view({ revision: 4, totalHoldingsCount: 0, isSaved: false })),
      history: [revision({ revision: 4, operation: 'RESET', holdingsCount: 0 })],
    });
    expect(observation.status).toBe('EMPTY');
    expect(observation.operation).toBe('RESET');
  });

  it('DELETE reports UNAVAILABLE rather than an empty portfolio', () => {
    const observation = derivePortfolioPersistence({
      read: readOf(view({ revision: 5, totalHoldingsCount: 0 })),
      history: [revision({ revision: 5, operation: 'DELETE', holdingsCount: 0 })],
    });
    expect(observation.status).toBe('UNAVAILABLE');
    expect(observation.explanation).toMatch(/deletion/);
  });
});

describe('derivePortfolioPersistence — unavailable and concurrent observations', () => {
  it('an absent portfolio read yields UNAVAILABLE, never EMPTY', () => {
    const observation = derivePortfolioPersistence({ read: null, history: [revision()] });
    expect(observation.status).toBe('UNAVAILABLE');
    expect(observation.revision).toBeNull();
    expect(observation.operation).toBeNull();
  });

  it('a failed history read yields UNAVAILABLE but still reports the observed revision', () => {
    const observation = derivePortfolioPersistence({ read: readOf(view({ revision: 7 })), history: null });
    expect(observation.status).toBe('UNAVAILABLE');
    expect(observation.revision).toBe(7);
    expect(observation.operation).toBeNull();
    expect(observation.explanation).toMatch(/revision history could not be read/);
  });

  it('an empty history yields UNAVAILABLE and does not read as an empty portfolio', () => {
    const observation = derivePortfolioPersistence({ read: readOf(view({ revision: 1 })), history: [] });
    expect(observation.status).toBe('UNAVAILABLE');
    expect(observation.explanation).toMatch(/history is empty/);
  });

  it('a history that does not contain the observed revision reports the discrepancy instead of guessing', () => {
    const observation = derivePortfolioPersistence({
      read: readOf(view({ revision: 4, totalHoldingsCount: 3 })),
      history: [revision({ revision: 1, holdingsCount: 1 }), revision({ revision: 2, holdingsCount: 2 })],
    });
    expect(observation.status).toBe('UNAVAILABLE');
    expect(observation.concurrentRevisionObservation).toBe(true);
    expect(observation.explanation).toContain('revision 4');
    expect(observation.explanation).toContain('ends at 2');
  });

  it('a history entry whose holdings count disagrees with the detail read is not reconciled', () => {
    const observation = derivePortfolioPersistence({
      read: readOf(view({ revision: 2, totalHoldingsCount: 5 })),
      history: [revision({ revision: 2, operation: 'MERGE', holdingsCount: 3 })],
    });
    expect(observation.status).toBe('UNAVAILABLE');
    expect(observation.concurrentRevisionObservation).toBe(true);
    expect(observation.explanation).toContain('3');
    expect(observation.explanation).toContain('5');
  });

  it('a deleted-revision history is never read as an empty portfolio', () => {
    const observation = derivePortfolioPersistence({ read: null, history: [] });
    expect(observation.status).toBe('UNAVAILABLE');
  });
});

describe('rejectedRevisionsNote', () => {
  it('stays silent when nothing was refused and discloses the count otherwise', () => {
    expect(rejectedRevisionsNote(0)).toBeNull();
    expect(rejectedRevisionsNote(1)).toMatch(/1 revision-history record/);
    expect(rejectedRevisionsNote(4)).toMatch(/4 revision-history records/);
  });
});
