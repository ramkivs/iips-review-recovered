/**
 * Portfolio persistence-status derivation — an IRR PRESENTATION decision over
 * IPD's authoritative revision facts.
 *
 * IPD publishes no "persistence status" field. It publishes, per revision, the
 * stored `operation` (INITIAL | MERGE | REPLACE | RESET | DELETE), the stored
 * `holdings_count` and the commit instant. This module maps those facts onto the
 * four states this surface is allowed to display. It invents nothing: every
 * state below is traceable to a stored value on the wire.
 *
 * THE CORRECTNESS FIX THIS ENCAPSULATES
 *   IPD's `isSaved` is derived from the current revision's operation alone
 *   (`INITIAL`/`RESET` ⇒ false). A portfolio created by a first broker import or
 *   a first manual save is committed as operation `INITIAL` **with holdings
 *   persisted**, so `isSaved` is false while the holdings are durable. Rendering
 *   that portfolio as "not committed" is wrong. The decision below therefore uses
 *   the stored operation AND the revision's holdings count — never `isSaved`.
 *
 * CONCURRENCY
 *   The detail read and the revision-history read are two separate reads. A write
 *   can land between them, so the history may not contain an entry for the
 *   revision the detail reported (or may carry a different holdings count). That
 *   disagreement is reported as an observation discrepancy — it is never silently
 *   reconciled, and no state is guessed from it.
 */
import type { UserPortfolioRead, UserPortfolioRevision } from '../../api/userPortfolios';

export type PortfolioPersistenceStatus = 'EMPTY' | 'PERSISTED' | 'UPDATED' | 'UNAVAILABLE';

export type PortfolioRevisionOperation = UserPortfolioRevision['operation'];

export interface PortfolioPersistenceObservation {
  readonly status: PortfolioPersistenceStatus;
  /** The revision the detail read reported — authoritative even when the history is unavailable. */
  readonly revision: number | null;
  /** The stored operation of that revision; null when the history could not be observed. */
  readonly operation: PortfolioRevisionOperation | null;
  /** The stored commit instant of that revision; null when it could not be observed. */
  readonly committedAt: string | null;
  /** Plain-language explanation of exactly which facts produced this state. */
  readonly explanation: string;
  /** True when the two reads disagree, so the state is withheld rather than guessed. */
  readonly concurrentRevisionObservation: boolean;
}

export interface PortfolioPersistenceInput {
  /** The detail read; null while it is in flight (renders as loading, never as empty). */
  readonly read: UserPortfolioRead | null;
  /** The revision history; null when that read failed or has not completed. */
  readonly history: readonly UserPortfolioRevision[] | null;
  /** History entries that were refused as malformed — disclosed, never dropped silently. */
  readonly rejectedRevisions?: number;
}

function unavailable(explanation: string, revision: number | null, concurrent = false): PortfolioPersistenceObservation {
  return {
    status: 'UNAVAILABLE',
    revision,
    operation: null,
    committedAt: null,
    explanation,
    concurrentRevisionObservation: concurrent,
  };
}

/**
 * Derives the presentation state from the stored operation of the CURRENT revision.
 *
 * `isSaved` is deliberately not an input: it cannot distinguish "empty initial
 * revision" from "initial revision that already holds persisted holdings".
 */
export function derivePortfolioPersistence(input: PortfolioPersistenceInput): PortfolioPersistenceObservation {
  const { read, history } = input;
  if (read === null) {
    return unavailable('The portfolio read has not completed, so no persistence state is reported.', null);
  }
  const view = read.portfolio;
  if (history === null) {
    return unavailable(
      'The revision history could not be read, so the persistence state is not reported. The revision below is the one the portfolio read reported.',
      view.revision,
    );
  }
  const entry = history.find((item) => item.revision === view.revision);
  const latest = history.reduce<number | null>((max, item) => (max === null || item.revision > max ? item.revision : max), null);

  if (entry === undefined) {
    if (history.length === 0) {
      return unavailable(
        'The revision history is empty, so the persistence state is not reported.',
        view.revision,
      );
    }
    return unavailable(
      `The portfolio read reported revision ${String(view.revision)} but the revision history ends at ${String(latest)}; `
        + 'another write may have landed between the two reads. Refresh to observe a consistent pair — the state is not guessed.',
      view.revision,
      true,
    );
  }

  // A history that has moved beyond the revision the detail read reported means the
  // metrics on this surface describe an older revision than the store currently holds.
  // That is a disagreement between the two reads: it is disclosed, never reconciled.
  if (latest !== null && latest > view.revision) {
    return unavailable(
      `The portfolio read reported revision ${String(view.revision)} but the store is already at revision ${String(latest)}; `
        + 'another write landed between the two reads. The values on this surface describe revision '
        + `${String(view.revision)}. Refresh to observe a consistent pair — the state is not guessed.`,
      view.revision,
      true,
    );
  }

  if (entry.holdingsCount !== view.totalHoldingsCount) {
    return unavailable(
      `Revision ${String(entry.revision)} stores ${String(entry.holdingsCount)} holding(s) but the portfolio read reports `
        + `${String(view.totalHoldingsCount)}; another write may have landed between the two reads. Refresh to observe a `
        + 'consistent pair — the state is not guessed.',
      view.revision,
      true,
    );
  }

  const committedAt = entry.createdAt;
  const base = {
    revision: view.revision,
    operation: entry.operation,
    committedAt,
    concurrentRevisionObservation: false,
  };

  switch (entry.operation) {
    case 'INITIAL':
      // An INITIAL revision with persisted holdings IS persisted, whatever `isSaved` says.
      return entry.holdingsCount === 0
        ? {
          ...base,
          status: 'EMPTY',
          explanation: `Revision ${String(entry.revision)} is the stored INITIAL revision and holds 0 constituents, so the portfolio is empty.`,
        }
        : {
          ...base,
          status: 'PERSISTED',
          explanation:
            `Revision ${String(entry.revision)} is the stored INITIAL revision and already carries ${String(entry.holdingsCount)} persisted `
            + 'constituent(s). IPD reports isSaved=false for an INITIAL revision; that flag describes the operation, not whether holdings exist.',
        };
    case 'MERGE':
    case 'REPLACE':
      return {
        ...base,
        status: 'UPDATED',
        explanation:
          `Revision ${String(entry.revision)} is a stored ${entry.operation} over an existing portfolio, so the portfolio was updated.`,
      };
    case 'RESET':
      return {
        ...base,
        status: 'EMPTY',
        explanation:
          `Revision ${String(entry.revision)} is a stored RESET, which cleared the portfolio to 0 constituents.`,
      };
    case 'DELETE':
      return unavailable(
        `Revision ${String(entry.revision)} records a deletion, so no portfolio state is served.`,
        view.revision,
      );
    default:
      return unavailable(
        `Revision ${String(entry.revision)} carries an operation this surface does not present, so no state is claimed.`,
        view.revision,
      );
  }
}

/**
 * Plain-language note for refused history entries. Refusals are counted and
 * disclosed; they never change the derived state and are never presented as an
 * IPD-reported integrity verdict.
 */
export function rejectedRevisionsNote(count: number): string | null {
  if (count <= 0) return null;
  return count === 1
    ? '1 revision-history record could not be read and is not shown.'
    : `${String(count)} revision-history records could not be read and are not shown.`;
}
