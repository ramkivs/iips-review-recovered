/**
 * W17 — user-facing portfolio modes: ACTUAL / REFERENCE / DEGRADED.
 *
 * Pure mode semantics over the existing contracts (W09 revision-bearing read,
 * W13 valuation coverage, W16 provenance envelope). No data is fabricated and no
 * mode silently substitutes for another: every decision carries explicit reasons
 * and an explicit `missing` list for display.
 *
 *   ACTUAL     — an actual portfolio read exists AND every active position carries a
 *                qualified observation (W13: valued === active, no unresolved/stale/
 *                unavailable/unknown/unreadable). Only then may the UI claim "actual".
 *   REFERENCE  — a persisted read exists (revision + provenance digest + source dates)
 *                but there is NO qualified-observation evidence at all (W06/W13 actual
 *                measurement not available). Displayed as reference/persisted data,
 *                clearly labelled, never as live.
 *   DEGRADED   — a read exists but required observations or coverage are incomplete
 *                (partial coverage, stale/unavailable/UNKNOWN/unreadable observations,
 *                unresolved identities) or the read itself is unavailable. Available
 *                information is shown with the missing items named explicitly.
 */

export type PortfolioMode = 'ACTUAL' | 'REFERENCE' | 'DEGRADED';

/** W13-style coverage counts, when an actual valuation/observation pass exists. */
export interface ModeCoverageInput {
  readonly activePositions: number;
  readonly valuedPositions: number;
  readonly unresolvedIdentity: number;
  readonly staleObservations: number;
  readonly unavailableObservations: number;
  readonly unknownObservations: number;
  readonly unreadableStatus: number;
}

export interface PortfolioModeInput {
  /** Whether an actual portfolio read (W09 contract) is present. */
  readonly readPresent: boolean;
  readonly revision: number | null;
  readonly provenanceDigest: string | null;
  /** Read/source timestamp (W09 observedAt / capture capturedAt), when known. */
  readonly observedAt: string | null;
  /** Qualified-observation coverage, or null when no observation evidence exists. */
  readonly coverage: ModeCoverageInput | null;
}

export interface PortfolioModeDecision {
  readonly mode: PortfolioMode;
  readonly reasons: readonly string[];
  /** Explicitly missing or unavailable items — displayed, never hidden. */
  readonly missing: readonly string[];
}

export function selectPortfolioMode(input: PortfolioModeInput): PortfolioModeDecision {
  const missing: string[] = [];

  if (!input.readPresent || input.revision === null || !Number.isInteger(input.revision)) {
    return {
      mode: 'DEGRADED',
      reasons: ['no actual portfolio read available'],
      missing: ['portfolio read', 'revision identity', ...missing],
    };
  }

  if (!input.provenanceDigest || input.provenanceDigest.trim() === '') {
    missing.push('provenance digest');
  }
  if (!input.observedAt) {
    missing.push('read/source timestamp');
  }

  const coverage = input.coverage;
  if (coverage !== null && coverage.activePositions === 0) {
    // A read exists but the revision holds no active positions: nothing to observe —
    // persisted reference display, never ACTUAL.
    return {
      mode: 'REFERENCE',
      reasons: [`persisted revision ${input.revision} holds no active positions`, 'nothing to observe — reference display'],
      missing,
    };
  }
  if (coverage === null) {
    // Persisted reference data exists, but no qualified-observation evidence:
    // REFERENCE, never ACTUAL.
    return {
      mode: 'REFERENCE',
      reasons: [
        `persisted revision ${input.revision} available with source identity`,
        'no qualified-observation coverage exists — actual mode is not claimable',
      ],
      missing: [...missing, 'qualified observations'],
    };
  }

  const unqualified =
    coverage.unresolvedIdentity +
    coverage.staleObservations +
    coverage.unavailableObservations +
    coverage.unknownObservations +
    coverage.unreadableStatus +
    Math.max(0, coverage.activePositions - coverage.valuedPositions);

  const identityComplete = Boolean(input.provenanceDigest && input.provenanceDigest.trim() !== '') && input.observedAt !== null;
  if (
    coverage.activePositions > 0 &&
    coverage.valuedPositions === coverage.activePositions &&
    unqualified === 0 &&
    identityComplete
  ) {
    return {
      mode: 'ACTUAL',
      reasons: [
        `actual read at revision ${input.revision}`,
        `all ${coverage.activePositions} active position(s) carry qualified observations`,
      ],
      missing,
    };
  }
  if (identityComplete === false && coverage.valuedPositions === coverage.activePositions && unqualified === 0 && coverage.activePositions > 0) {
    // Full coverage but identity/provenance incomplete: never claim ACTUAL.
    return {
      mode: 'DEGRADED',
      reasons: ['coverage complete but revision identity/provenance is incomplete — actual mode is not claimable'],
      missing,
    };
  }

  const parts: string[] = [];
  if (coverage.activePositions - coverage.valuedPositions > 0) {
    parts.push(`${coverage.activePositions - coverage.valuedPositions} active position(s) without a qualified observation`);
  }
  if (coverage.unresolvedIdentity > 0) parts.push(`${coverage.unresolvedIdentity} unresolved identit${coverage.unresolvedIdentity === 1 ? 'y' : 'ies'}`);
  if (coverage.staleObservations > 0) parts.push(`${coverage.staleObservations} stale observation(s)`);
  if (coverage.unavailableObservations > 0) parts.push(`${coverage.unavailableObservations} unavailable observation(s)`);
  if (coverage.unknownObservations > 0) parts.push(`${coverage.unknownObservations} observation(s) UNKNOWN (none exists)`);
  if (coverage.unreadableStatus > 0) parts.push(`${coverage.unreadableStatus} unreadable freshness status(es)`);

  return {
    mode: 'DEGRADED',
    reasons: [`actual read at revision ${input.revision} but coverage is incomplete`],
    missing: [...missing, ...parts],
  };
}

/** Display label + symbol + semantic color per mode (non-color-only: symbol + label always paired). */
export const MODE_PRESENTATION: Record<PortfolioMode, { label: string; symbol: string; colorVar: string }> = {
  ACTUAL: { label: 'ACTUAL', symbol: '●', colorVar: 'var(--color-status-positive)' },
  REFERENCE: { label: 'REFERENCE', symbol: '◐', colorVar: 'var(--color-status-informational)' },
  DEGRADED: { label: 'DEGRADED', symbol: '○', colorVar: 'var(--color-status-warning)' },
};
