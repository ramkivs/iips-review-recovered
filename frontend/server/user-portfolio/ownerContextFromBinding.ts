/**
 * G-3 binding-sourced owner context (IRR side).
 *
 * Authority: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.1 item 2,
 * implementing accepted wire contract v1 OC-1…OC-7 and the G2-D4 reading of the
 * DP-1 §6.4 tenant-hint wording.
 *
 * THE PROVENANCE RULE
 *   The owner of a durable user-portfolio call is resolved **by IPD**, per request,
 *   from IPD's own single `ACTIVE` A-2 local-principal binding and its one `ACTIVE`
 *   membership (OC-2). IRR does not resolve an owner, does not hold one, and cannot
 *   supply one. This module's whole job is to make that structural rather than
 *   aspirational.
 *
 * WHAT IS DELIBERATELY ABSENT
 *   - **No request parameter.** No function here accepts an HTTP request object, a
 *     header map, a cookie jar, a query object or a body. Nothing can be read from a
 *     caller because nothing caller-shaped is in scope. This module imports no HTTP
 *     type at all.
 *   - **No owner fields.** `OwnerContext` carries no `applicationUserId`, no
 *     `tenantId`, no principal, no credential and no scope. There is no field a
 *     caller could substitute, so "no caller substitution" holds by construction
 *     rather than by validation.
 *   - **No transmitted tenant hint.** The IRR-local hint below is read for local
 *     diagnostics only and is **never** placed on the wire. `assertHintNotOnWire`
 *     exists so that invariant is enforced at the send boundary and testable.
 *
 * FAIL CLOSED
 *   IRR's configuration is limited to the endpoint setting plus an IRR-local
 *   "binding provisioned" precondition (OC-3). That precondition defaults to
 *   **false**: unless an operator has affirmatively established it, the owner context
 *   is `NOT_ESTABLISHED` and no call is justified. At this act the precondition is
 *   false, because Gate A′ provisioning is APPROVED and **NOT EXECUTED** — IPD's
 *   binding tables are empty and IPD refuses every request Class P.
 *
 * NOT AUTHENTICATION
 *   An established owner context is not a credential, not a session and not an
 *   authorization. It records *where* an owner would come from. IPD remains the only
 *   authority, and the `/api/user-portfolios*` routes stay HTTP `503
 *   owner-context-unavailable` until a separate Gate 5 admission act lifts named
 *   operations (§5.6).
 */

/* ------------------------------------------------------------------ *
 * The IRR-local tenant hint
 * ------------------------------------------------------------------ */

/**
 * Name of the IRR-local tenant-hint setting (contract v1 OC-3; G2-D4).
 *
 * It is **IRR-local and never transmitted**. There is deliberately no corresponding
 * wire constant, no header name and no payload key for it: `userPortfolioContract.ts`
 * gained only the endpoint-setting constant, and §5.2 forbids a tenant-hint
 * transmission constant. IPD derives the tenant from its own `ACTIVE` membership;
 * a hint from IRR would be a caller-supplied tenant claim and is refused Class P.
 */
export const IPC_TENANT_HINT_SETTING = 'IIPS_G2_IPC_TENANT_HINT';

/** Longest accepted hint; anything longer is treated as absent. */
export const TENANT_HINT_MAX_LENGTH = 64;

/**
 * Reads the IRR-local tenant hint for **local diagnostics only**.
 *
 * Returns `null` when unset, blank, over-long or shaped like anything other than a
 * plain local label. Never throws, and never produces a value that may be sent.
 */
export function readLocalTenantHint(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env[IPC_TENANT_HINT_SETTING];
  if (typeof raw !== 'string') return null;
  const hint = raw.trim();
  if (hint.length === 0 || hint.length > TENANT_HINT_MAX_LENGTH) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(hint)) return null;
  return hint;
}

/**
 * Asserts that no tenant hint (or any other owner-scoped claim) is present on an
 * outbound payload. Called at the send boundary; throws rather than sanitizing,
 * because silently stripping a claim would hide a bug in the caller.
 */
export function assertHintNotOnWire(payload: unknown): void {
  const found = scanForHintKeys(payload);
  if (found.length > 0) {
    throw new Error(
      `the IRR-local tenant hint must never be transmitted (found: ${found.join(', ')})`,
    );
  }
}

/** Lower-cased, so the comparison below cannot be defeated by header casing. */
const HINT_SHAPED_KEYS: readonly string[] = [
  'tenanthint',
  'tenant_hint',
  'x-ipd-tenant-id',
  'ipdtenanthint',
];

function scanForHintKeys(value: unknown, depth = 0): string[] {
  if (depth > 12 || value === null || typeof value !== 'object') return [];
  const found = new Set<string>();
  if (Array.isArray(value)) {
    for (const item of value) {
      for (const key of scanForHintKeys(item, depth + 1)) found.add(key);
    }
    return Array.from(found).sort();
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (HINT_SHAPED_KEYS.includes(key.toLowerCase())) found.add(key);
    for (const nested of scanForHintKeys(record[key], depth + 1)) found.add(nested);
  }
  return Array.from(found).sort();
}

/* ------------------------------------------------------------------ *
 * Owner context
 * ------------------------------------------------------------------ */

/**
 * Where an owner context comes from. There is exactly one admissible source.
 *
 * The union has one member on purpose: adding a header-, cookie-, query- or
 * body-derived source would require changing this type, which is the point at which
 * a reviewer must notice.
 */
export type OwnerContextSource = 'IPD_A2_BINDING';

export type OwnerContextState =
  /** No binding precondition is established; nothing may be called. */
  | 'NOT_ESTABLISHED'
  /** IRR's local precondition reports IPD holds a provisioned binding. */
  | 'IPD_BINDING_RESOLVED';

export type OwnerContextReason = 'BINDING_PROVISIONED' | 'BINDING_NOT_PROVISIONED';

/**
 * The owner context for a durable user-portfolio call.
 *
 * Carries **no owner identity**. IPD resolves the owner itself, per request, and
 * never discloses it back (OC-6). IRR therefore has nothing to hold, nothing to
 * cache and nothing to substitute.
 */
export interface OwnerContext {
  readonly state: OwnerContextState;
  readonly source: OwnerContextSource;
  readonly reason: OwnerContextReason;
  /**
   * IRR's local precondition, read per call (OC-5). It records that an operator
   * established a binding; it is **not** proof of one and confers nothing.
   */
  readonly bindingProvisioned: boolean;
  /** IRR-local hint for diagnostics. **Never transmitted.** */
  readonly tenantHint: string | null;
  /** True only when a call is justified. False ⇒ fail closed. */
  readonly established: boolean;
}

/**
 * IRR's local precondition input.
 *
 * The only admissible evidence that a binding exists. It is a boolean supplied by
 * server-owned configuration — not by a request — so no caller can set it.
 */
export interface BindingPrecondition {
  readonly bindingProvisioned: boolean;
}

/**
 * Derives the owner context from the binding precondition.
 *
 * Takes no request, reads no header, cookie, query or body, and accepts no owner,
 * tenant, principal or scope argument. Fail closed: anything other than an explicit
 * `bindingProvisioned: true` yields `NOT_ESTABLISHED`.
 */
export function ownerContextFromBinding(
  precondition: BindingPrecondition | undefined | null,
  env: NodeJS.ProcessEnv = process.env,
): OwnerContext {
  const provisioned = precondition?.bindingProvisioned === true;
  const tenantHint = readLocalTenantHint(env);

  if (!provisioned) {
    return {
      state: 'NOT_ESTABLISHED',
      source: 'IPD_A2_BINDING',
      reason: 'BINDING_NOT_PROVISIONED',
      bindingProvisioned: false,
      tenantHint,
      established: false,
    };
  }

  return {
    state: 'IPD_BINDING_RESOLVED',
    source: 'IPD_A2_BINDING',
    reason: 'BINDING_PROVISIONED',
    bindingProvisioned: true,
    tenantHint,
    // Established means a call is *justified*, not that it is authorized: IPD still
    // resolves the binding per request and still refuses every write under W-1.
    established: true,
  };
}

/**
 * Reads the binding precondition from server-owned configuration.
 *
 * Accepts only an explicit affirmative value. Anything absent, blank or not exactly
 * `true`/`1`/`yes` is `false`, so the default posture is fail-closed and no
 * misconfiguration can establish an owner context.
 */
export function readBindingPrecondition(
  env: NodeJS.ProcessEnv = process.env,
): BindingPrecondition {
  const raw = env[BINDING_PRECONDITION_SETTING];
  const affirmative = typeof raw === 'string' && ['true', '1', 'yes'].includes(raw.trim().toLowerCase());
  return { bindingProvisioned: affirmative };
}

/**
 * Name of the IRR-local "binding provisioned" precondition setting — the second and
 * last item of IRR's server-owned configuration (OC-3).
 */
export const BINDING_PRECONDITION_SETTING = 'IIPS_G3_IPC_BINDING_PROVISIONED';

/** True when a call is justified by the owner context. */
export function isOwnerContextEstablished(context: OwnerContext): boolean {
  return context.established === true && context.state === 'IPD_BINDING_RESOLVED';
}

/**
 * Fixed provenance vocabulary, for documentation and tests.
 *
 * States the single admissible owner source and the sources that are **not**
 * admissible, so a future change has to contradict an explicit record.
 */
export function describeOwnerContextProvenance(): Readonly<{
  admissibleSource: OwnerContextSource;
  inadmissibleSources: readonly string[];
  transmittedFields: readonly string[];
}> {
  return {
    admissibleSource: 'IPD_A2_BINDING',
    inadmissibleSources: [
      'http-header',
      'cookie',
      'query-parameter',
      'request-body',
      'authorization-credential',
      'session',
      'caller-assertion',
      'inferred-default',
    ],
    // Nothing identity-shaped crosses the wire in either direction.
    transmittedFields: [],
  };
}
