/**
 * G-2 Gate B — OWNER CONTEXT FROM THE PROVISIONED IPC ENDPOINT BINDING (IRR side).
 *
 * AUTHORITY: `IIPS-V3-G2-IRR-GATE-B-D4-IMPLEMENTATION-AUTHORITY-PA-DECISION-RENDERED-2026-10-17-01`
 * (D-4 `ACCEPT`), on the designated IRR baseline `10584439…` and the designated implementation
 * ref `refs/heads/gate-b/local-principal-ipc-implementation`. One of the four approved sources.
 *
 * AMENDED DP-1 SOURCE ATTRIBUTION (§6.4 of the DP-1 amendment `c71661a1…`)
 *   The owner context is sourced from the provisioned same-host IPC endpoint binding — never
 *   from a caller, a browser, a header, a cookie, a query parameter, a request body or an
 *   OIDC-derived `(issuer, subject)`. The binding is materialised as server-owned process
 *   configuration by the separate IPD provisioning act; IRR reads that configuration only.
 *
 *   The tenant value carried here remains a HINT, exactly as DP-1 specifies. It is not a
 *   credential, not an authorization decision and not an identity assertion: IPD validates it
 *   against the provisioned `local_principal_bindings` state (A-2) and fails closed on any
 *   mismatch. This module never sends the hint over the wire — `ipcClient` refuses it as a
 *   forbidden field — and it never derives an identity from the endpoint path.
 *
 * BINDING PROPERTIES
 *   1. Server-owned input only: the function accepts a server-owned environment record. It has
 *      no request-shaped parameter, so a caller cannot pass browser or caller data into it.
 *   2. No default, no inference, no substitution: absent, blank, unsafe or malformed values
 *      resolve to a typed non-disclosing failure. Nothing is generated or repaired.
 *   3. No throw for binding conditions: every absent/invalid configuration is returned as a
 *      fail-closed resolution (the same discipline as the F-3 owner-context resolver).
 *   4. No cache: resolution is per call, so a revoked or changed binding takes effect
 *      immediately and a stale binding cannot be re-used.
 *   5. No store (C11): this module reads two provisioned environment values. It creates no
 *      file, table, cache-of-record or side channel, and holds no portfolio data.
 *
 * FAIL-CLOSED (C5.1–C5.5, C6)
 *   A resolution failure means "this process has no governed owner context". The caller must not
 *   fall back to another surface, another identity or a default — there is nowhere to fall back to.
 */

import { parseIpcEndpoint, type IpcEndpoint } from './ipcClient.js';
import type { G2Scope } from './userPortfolioPort.js';
import { isNonBlankString } from './userPortfolioContract.js';

/**
 * Server-owned environment variable naming the provisioned same-host endpoint.
 * A named pipe (`\\.\pipe\…`) for the deployment; an absolute POSIX socket path for dev/CI.
 */
export const G2_IPC_ENDPOINT_ENV = 'IIPS_G2_IPC_ENDPOINT';

/**
 * Server-owned environment variable carrying the provisioned tenant hint.
 *
 * The value materialises the tenant already present in the IPD-owned binding record (A-2); it is
 * never a caller-supplied tenant and never a second source of tenant authority.
 */
export const G2_IPC_TENANT_HINT_ENV = 'IIPS_G2_IPC_TENANT_HINT';

/** The amended DP-1 source label. Downstream artifacts must carry it verbatim. */
export const G2_OWNER_CONTEXT_SOURCE = 'provisioned-ipc-endpoint-binding' as const;

/** Maximum accepted tenant-hint length (malformed-input limit). */
export const G2_BINDING_MAX_TENANT_HINT_LENGTH = 128;

/**
 * The only input this module accepts: a server-owned environment record (normally `process.env`).
 * It is deliberately NOT `http.IncomingHttpHeaders` and not any request-derived shape.
 */
export type ServerOwnedBindingEnvironment = Readonly<Record<string, string | undefined>>;

/** Why a binding resolution produced no owner context. Diagnostic only — never an HTTP surface. */
export type OwnerContextBindingFailureReason =
  | 'binding-not-configured'
  | 'binding-endpoint-invalid'
  | 'binding-tenant-hint-invalid';

/** The established owner context. Partition context only — never an authorization credential. */
export interface OwnerContextFromBinding {
  readonly source: typeof G2_OWNER_CONTEXT_SOURCE;
  readonly endpoint: IpcEndpoint;
  readonly scope: G2Scope;
}

/** Closed, fail-closed resolution result. */
export type OwnerContextBindingResolution =
  | { readonly ok: true; readonly context: OwnerContextFromBinding }
  | { readonly ok: false; readonly reason: OwnerContextBindingFailureReason };

/**
 * True when `value` is an admissible provisioned tenant hint.
 *
 * Strict by design: non-blank, bounded, no surrounding whitespace, no control characters.
 * A padded or exotic value is refused rather than trimmed — there is no leniency on this path.
 */
export function isValidTenantHint(value: unknown): value is string {
  if (!isNonBlankString(value)) return false;
  if (value.length > G2_BINDING_MAX_TENANT_HINT_LENGTH) return false;
  if (value !== value.trim()) return false;
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;
  return true;
}

/**
 * Resolves the owner context from the provisioned IPC endpoint binding.
 *
 * Reads ONLY the two server-owned values named above. Performs no I/O, creates nothing, caches
 * nothing, throws nothing and defaults nothing. `ok: false` is the fail-closed outcome.
 */
export function resolveOwnerContextFromBinding(
  env: ServerOwnedBindingEnvironment = process.env,
): OwnerContextBindingResolution {
  const rawEndpoint = env[G2_IPC_ENDPOINT_ENV];
  const rawTenantHint = env[G2_IPC_TENANT_HINT_ENV];

  if (!isNonBlankString(rawEndpoint) || !isNonBlankString(rawTenantHint)) {
    return Object.freeze({ ok: false as const, reason: 'binding-not-configured' as const });
  }

  const endpoint = parseIpcEndpoint(rawEndpoint);
  if (!endpoint) {
    return Object.freeze({ ok: false as const, reason: 'binding-endpoint-invalid' as const });
  }

  if (!isValidTenantHint(rawTenantHint)) {
    return Object.freeze({ ok: false as const, reason: 'binding-tenant-hint-invalid' as const });
  }

  return Object.freeze({
    ok: true as const,
    context: Object.freeze({
      source: G2_OWNER_CONTEXT_SOURCE,
      endpoint,
      scope: Object.freeze({ tenantHint: rawTenantHint }),
    }),
  });
}
