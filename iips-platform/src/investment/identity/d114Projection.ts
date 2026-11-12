/**
 * D114 series-aware `securityIdentity` validation and lossless projection for IRR.
 *
 * Mirrors IPD's governed `D114SecurityIdentity` contract (`ISIN:<isin>:<series>`,
 * `isinAuthority: 'NON_AUTHORITATIVE'`) without importing IPD server modules into the
 * pure platform layer.
 *
 * Rules enforced here:
 *   1. `securityIdentity === undefined` -> flat compatibility path (`isin` / `series` as supplied, or null).
 *   2. `securityIdentity === null`      -> explicitly unresolved upstream (`null` is NOT malformed; no series or
 *                                          exchange is inferred).
 *   3. Valid `D114SecurityIdentity`     -> lossless projection of `securityId`, `isin`, `series`, `isinAuthority`,
 *                                          provided any co-supplied flat `isin` / `series` agrees.
 *   4. Malformed or conflicting object  -> explicit rejection (`MALFORMED` or `CONFLICT`) so the resolver refuses
 *                                          fail-closed rather than silently falling back to `symbol + exchange`.
 */
import type { ResolutionState, UnresolvedReason } from './types';

export const D114_SECURITY_ID_PREFIX = 'ISIN' as const;
export const D114_ISIN_AUTHORITY = 'NON_AUTHORITATIVE' as const;
export const D114_ISIN_LENGTH = 12;
export const D114_ISIN_PATTERN = /^[A-Za-z0-9]{12}$/;

export interface D114SecurityIdentity {
  readonly securityId: string;
  readonly isin: string;
  readonly series: string;
  readonly isinAuthority: typeof D114_ISIN_AUTHORITY;
}

export interface SecurityIdentityRejection {
  readonly kind: 'MALFORMED' | 'CONFLICT';
  readonly detail: string;
}

export type ObservationOutcomeClass = 'RESOLVED' | 'UNRESOLVED' | 'REJECTED';

export interface D114ProjectionResult {
  readonly kind: 'absent' | 'unresolved_null' | 'populated' | 'rejected';
  readonly isin: string | null;
  readonly series: string | null;
  readonly securityIdentity: D114SecurityIdentity | null | undefined;
  readonly rejection: SecurityIdentityRejection | null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeOptionalToken(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** Validates the exact canonical `ISIN:<isin>:<series>` composite identifier grammar. */
export function isD114SecurityId(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const segments = value.split(':');
  if (segments.length !== 3) return false;
  const [prefix, isin, series] = segments as [string, string, string];
  return (
    prefix === D114_SECURITY_ID_PREFIX &&
    isin.length === D114_ISIN_LENGTH &&
    D114_ISIN_PATTERN.test(isin) &&
    series.length > 0 &&
    series === series.trim()
  );
}

/** Validates a nested D114 `securityIdentity` object and returns either the frozen value or a specific reason. */
export function validateD114SecurityIdentity(
  value: unknown,
): { readonly ok: true; readonly value: D114SecurityIdentity } | { readonly ok: false; readonly detail: string } {
  if (!isPlainObject(value)) {
    return { ok: false, detail: 'D114 securityIdentity must be a JSON object when present and non-null' };
  }
  const { securityId, isin, series, isinAuthority } = value;
  if (isinAuthority !== D114_ISIN_AUTHORITY) {
    return {
      ok: false,
      detail: 'D114 securityIdentity.isinAuthority must be "NON_AUTHORITATIVE"',
    };
  }
  if (typeof isin !== 'string' || isin !== isin.trim() || !D114_ISIN_PATTERN.test(isin)) {
    return {
      ok: false,
      detail: 'D114 securityIdentity.isin must be a trimmed 12-character alphanumeric string',
    };
  }
  if (typeof series !== 'string' || series.length === 0 || series !== series.trim() || series.includes(':')) {
    return {
      ok: false,
      detail: 'D114 securityIdentity.series must be a non-empty trimmed series token',
    };
  }
  const expectedSecurityId = `${D114_SECURITY_ID_PREFIX}:${isin}:${series}`;
  if (typeof securityId !== 'string' || !isD114SecurityId(securityId) || securityId !== expectedSecurityId) {
    return {
      ok: false,
      detail: `D114 securityIdentity.securityId must equal "${expectedSecurityId}"`,
    };
  }
  return {
    ok: true,
    value: Object.freeze({
      securityId,
      isin,
      series,
      isinAuthority: D114_ISIN_AUTHORITY,
    }),
  };
}

export function isD114SecurityIdentity(value: unknown): value is D114SecurityIdentity {
  return validateD114SecurityIdentity(value).ok;
}

/**
 * Project D114 `securityIdentity` alongside optional legacy flat fields without lossy flattening or silent fallback.
 */
export function projectD114SecurityIdentity(input: {
  readonly securityIdentity?: unknown;
  readonly flatIsin?: string | null;
  readonly flatSeries?: string | null;
}): D114ProjectionResult {
  const flatIsin = normalizeOptionalToken(input.flatIsin);
  const flatSeries = normalizeOptionalToken(input.flatSeries);

  if (input.securityIdentity === undefined) {
    return {
      kind: 'absent',
      isin: flatIsin,
      series: flatSeries,
      securityIdentity: undefined,
      rejection: null,
    };
  }

  if (input.securityIdentity === null) {
    return {
      kind: 'unresolved_null',
      isin: flatIsin,
      series: flatSeries,
      securityIdentity: null,
      rejection: null,
    };
  }

  const validated = validateD114SecurityIdentity(input.securityIdentity);
  if (!validated.ok) {
    return {
      kind: 'rejected',
      isin: null,
      series: null,
      securityIdentity: null,
      rejection: {
        kind: 'MALFORMED',
        detail: validated.detail,
      },
    };
  }

  const d114 = validated.value;
  if (flatIsin !== null && flatIsin.toUpperCase() !== d114.isin.toUpperCase()) {
    return {
      kind: 'rejected',
      isin: null,
      series: null,
      securityIdentity: null,
      rejection: {
        kind: 'CONFLICT',
        detail: `flat isin "${flatIsin.toUpperCase()}" conflicts with securityIdentity.isin "${d114.isin.toUpperCase()}"`,
      },
    };
  }

  if (flatSeries !== null && flatSeries.toUpperCase() !== d114.series.toUpperCase()) {
    return {
      kind: 'rejected',
      isin: null,
      series: null,
      securityIdentity: null,
      rejection: {
        kind: 'CONFLICT',
        detail: `flat series "${flatSeries.toUpperCase()}" conflicts with securityIdentity.series "${d114.series.toUpperCase()}"`,
      },
    };
  }

  return {
    kind: 'populated',
    isin: d114.isin.toUpperCase(),
    series: d114.series.toUpperCase(),
    securityIdentity: d114,
    rejection: null,
  };
}

/**
 * Distinguishes resolved, genuinely unresolved, and explicitly rejected identity observations.
 */
export function classifyObservationOutcome(
  state: ResolutionState,
  reason: UnresolvedReason | null,
): ObservationOutcomeClass {
  if (state === 'RESOLVED') return 'RESOLVED';
  if (
    state === 'REJECTED_MALFORMED_ISIN' ||
    state === 'ISSUER_KEY_CONFLICT' ||
    reason === 'SECTOR_REFERENCE_NOT_AN_IDENTITY'
  ) {
    return 'REJECTED';
  }
  return 'UNRESOLVED';
}
