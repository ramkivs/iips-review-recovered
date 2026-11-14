/**
 * W10 — evidence snapshots.
 *
 * A qualification refusal must be re-performable from the report alone: a reader has to see which
 * observation was offered, at which period and scope, with which presence state and which source
 * reference. These helpers copy that much out of an `Observation` without inventing anything the
 * observation does not carry.
 */
import type { NumericObservation } from '../contracts/observation';

/** Plain, serialisable snapshot of one numeric observation. */
export interface NumericalObservationSnapshot {
  readonly name: string;
  readonly presence: string;
  readonly reason: string | null;
  readonly value: number | null;
  readonly periodEnd: string | null;
  readonly basis: string | null;
  readonly sourceRef: string | null;
  readonly filingRef: string | null;
}

export function snapshotObservation(name: string, observation: NumericObservation): NumericalObservationSnapshot {
  return Object.freeze({
    name,
    presence: observation.presence,
    reason: observation.reason ?? null,
    value: observation.presence === 'PRESENT' ? observation.value : null,
    periodEnd: observation.periodEnd ?? null,
    basis: observation.basis ?? null,
    sourceRef: observation.source === undefined ? null : `${observation.source.kind}:${observation.source.ref}`,
    filingRef: observation.filingRef ?? null,
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar days from `earlier` to `later`; `null` when either date is not an ISO `YYYY-MM-DD`. */
export function daysBetween(earlier: string | null, later: string | null): number | null {
  if (earlier === null || later === null) return null;
  if (!/^\d{4}-\d{2}-\d{2}/.test(earlier) || !/^\d{4}-\d{2}-\d{2}/.test(later)) return null;
  const from = Date.parse(`${earlier.slice(0, 10)}T00:00:00.000Z`);
  const to = Date.parse(`${later.slice(0, 10)}T00:00:00.000Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.round((to - from) / DAY_MS);
}

/** True only for a finite JavaScript number. */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
