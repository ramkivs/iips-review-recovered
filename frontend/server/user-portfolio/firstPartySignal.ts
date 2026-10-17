/**
 * G-2 Gate B — C9 FIRST-PARTY SIGNAL (CSRF HARDENING ONLY).
 *
 * AUTHORITY: `IIPS-V3-G2-IRR-GATE-B-D4-IMPLEMENTATION-AUTHORITY-PA-DECISION-RENDERED-2026-10-17-01`
 * (D-4 `ACCEPT`), on the designated IRR baseline `10584439…` and the designated implementation
 * ref `refs/heads/gate-b/local-principal-ipc-implementation`. One of the four approved sources.
 *
 * WHAT THIS IS
 *   The `L-IPC-1` C9 hardening helper: a first-party signal derived from `Origin` and
 *   `Sec-Fetch-Site`, checked for consistency with the request `Host`. It exists to make a
 *   cross-site state-changing request fail closed.
 *
 * WHAT THIS IS NOT — BINDING
 *   1. It is NOT authentication. It establishes no principal, no session, no owner, no tenant and
 *      no role, and no result may be recorded as an authentication or authorization decision.
 *      Every result carries `authentication: false` so a caller cannot silently promote it.
 *   2. It reads ONLY `Origin`, `Sec-Fetch-Site` and `Host`. It never reads `Cookie`,
 *      `Authorization`, a body, a query parameter or any caller-supplied identity field.
 *   3. It does not relax the HTTP 503 `owner-context-unavailable` fence. Gate B wires this helper
 *      to nothing; route admission remains Gate D and write policy remains Gate E.
 *
 * RULES (strict, fail closed)
 *   - `Sec-Fetch-Site` must be exactly `same-origin`. Absent, `same-site`, `cross-site`, `none`
 *     and any unknown value are not first-party.
 *   - `Origin` must be a single, well-formed `http(s)` origin, present in the configured
 *     allowlist (exact match on the serialized origin), and its host must equal the request
 *     `Host` header. `Origin: null`, a list value, a path/query-bearing value, a non-HTTP scheme
 *     and a missing `Host` all fail closed.
 *   - The helper returns a decision; it never throws and never mutates its input.
 */

import type http from 'node:http';

/** This helper hardens against cross-site requests; it is never an authentication mechanism. */
export const FIRST_PARTY_SIGNAL_PURPOSE = 'csrf-hardening-only' as const;

/** Why a request is not first-party. Diagnostic only; a denial must not depend on the reason. */
export type FirstPartySignalFailure =
  | 'origin-absent'
  | 'origin-malformed'
  | 'origin-not-allowed'
  | 'origin-host-mismatch'
  | 'sec-fetch-site-absent'
  | 'sec-fetch-site-not-same-origin';

/**
 * Closed decision. `authentication: false` is part of the result on purpose: a truthy
 * `firstParty` flag is CSRF context, never proof of who the caller is.
 */
export type FirstPartySignalResult =
  | { readonly firstParty: true; readonly origin: string; readonly authentication: false }
  | { readonly firstParty: false; readonly reason: FirstPartySignalFailure; readonly authentication: false };

/** Configuration. `allowedOrigins` are compared exactly, after URL normalization. */
export interface FirstPartySignalOptions {
  readonly allowedOrigins: readonly string[];
}

/** Returns the single string value of a header, or `null` when absent/repeated/non-string. */
function singleHeader(value: string | string[] | undefined): string | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0) return null;
  return value;
}

/** Normalizes one configured origin; `null` for anything that is not a bare http(s) origin. */
function normalizeOrigin(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return null;
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (parsed.origin === 'null') return null;
  if (parsed.pathname !== '/' || parsed.search !== '' || parsed.hash !== '') return null;
  if (parsed.username !== '' || parsed.password !== '') return null;
  return parsed.origin;
}

/**
 * Evaluates the first-party signal for one request.
 *
 * Pure, non-throwing and non-authenticating. A `firstParty: false` result is the fail-closed
 * outcome; callers must not substitute another signal for it.
 */
export function evaluateFirstPartySignal(
  headers: http.IncomingHttpHeaders,
  options: FirstPartySignalOptions,
): FirstPartySignalResult {
  const deny = (reason: FirstPartySignalFailure): FirstPartySignalResult =>
    Object.freeze({ firstParty: false as const, reason, authentication: false as const });

  const originHeader = singleHeader(headers?.origin);
  if (originHeader === null) return deny('origin-absent');
  const origin = normalizeOrigin(originHeader);
  if (origin === null) return deny('origin-malformed');

  const allowed = new Set<string>();
  for (const candidate of options?.allowedOrigins ?? []) {
    const normalized = normalizeOrigin(candidate);
    if (normalized !== null) allowed.add(normalized);
  }
  if (!allowed.has(origin)) return deny('origin-not-allowed');

  const hostHeader = singleHeader(headers?.host);
  if (hostHeader === null) return deny('origin-host-mismatch');
  if (hostHeader !== hostHeader.trim() || /\s/.test(hostHeader)) return deny('origin-host-mismatch');
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return deny('origin-malformed');
  }
  if (originHost.toLowerCase() !== hostHeader.toLowerCase()) return deny('origin-host-mismatch');

  const secFetchSite = singleHeader(headers?.['sec-fetch-site']);
  if (secFetchSite === null) return deny('sec-fetch-site-absent');
  if (secFetchSite.trim().toLowerCase() !== 'same-origin') return deny('sec-fetch-site-not-same-origin');

  return Object.freeze({ firstParty: true as const, origin, authentication: false as const });
}

/**
 * Convenience boolean for a state-changing call site.
 *
 * `false` means "do not proceed". `true` still means nothing about identity: it only says the
 * request shape is consistent with a same-origin, first-party browser request.
 */
export function isFirstPartyStateChange(
  headers: http.IncomingHttpHeaders,
  options: FirstPartySignalOptions,
): boolean {
  return evaluateFirstPartySignal(headers, options).firstParty;
}
