/**
 * IIPS v3.0 — F-3 owner-context resolver.
 *
 * Establishes the server-owned owner context for the single-user IRR application by reading the
 * governed carrier file through a SERVER-OWNED PATH SEAM, validating it, and verifying its
 * integrity binding. It returns either the approved `(tenantId, ownerUserId)` pair or `null`.
 *
 * WHAT THIS MODULE CANNOT DO (binding properties)
 *   1. It cannot return any pair other than the approved literals: the parsed values are compared
 *      against `APPROVED_TENANT_ID` / `APPROVED_OWNER_USER_ID` after the integrity digest matches.
 *   2. It cannot infer, derive, generate, default or substitute an identity. There is no request
 *      argument, no header, no cookie, no browser state and no fallback anywhere in its input.
 *   3. It performs no I/O other than reading the one server-owned carrier path. It creates no
 *      directory, writes no file, and repairs nothing.
 *   4. Its only failure output is `null`. It never throws for carrier conditions: absent path,
 *      absent/unreadable file, empty file, oversize file, integrity mismatch, malformed grammar and
 *      invalid values are all `null`.
 *
 * FAIL-CLOSED WIRING (F1/F2/F3 §4.3(3)) `null` is consumed by the owner-scoped transports as the
 * existing HTTP `503 owner-context-unavailable` response. No owner-scoped data is read or changed.
 *
 * RESOLUTION LIFECYCLE Resolution is PER REQUEST and uncached. Rationale: the carrier is a small
 * local file, and per-request resolution removes every stale-cache failure mode — a carrier that
 * becomes absent, malformed or integrity-mismatched takes effect on the very next request, and
 * recovery (restoring the authorised carrier) likewise takes effect immediately, with no restart.
 * This is the NP-04 per-request pattern that F1/F2/F3 §4.5(2) records as acceptable.
 *
 * PATTERN PRECEDENT The path seam mirrors `serverOwnedDatabasePath()` /
 * `IIPS_NP04_DATABASE_PATH` (`frontend/server/reports/persistence-port.ts`): read from the
 * server-owned process environment, never from a request; an absent value means "this process has
 * no governed owner context", which fails closed.
 */
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import {
  APPROVED_OWNER_USER_ID,
  APPROVED_TENANT_ID,
  CANONICAL_CARRIER_TEXT,
  GOVERNING_RECORD_ID,
  GOVERNING_RECORD_PATH,
  OWNER_CONTEXT_CARRIER_SCHEMA_VERSION,
  OWNER_CONTEXT_CARRIER_SHA256,
} from './owner-context-carrier';

/**
 * The server-owned environment variable naming the owner-context carrier file.
 *
 * Read from the process environment only. It is never a request parameter, header, cookie or body
 * field, and it is never defaulted: with no configured path this process simply has no governed
 * owner context.
 */
export const OWNER_CONTEXT_PATH_ENV = 'IIPS_OWNER_CONTEXT_PATH';

/** Maximum accepted length of each governed partition value (malformed-input limit). */
export const OWNER_CONTEXT_MAX_VALUE_LENGTH = 128;

/** Maximum accepted carrier file size in bytes (malformed-input limit). */
export const OWNER_CONTEXT_MAX_CARRIER_BYTES = 4096;

/** The established owner context. Partition semantics only — never an authorization credential. */
export interface OwnerContext {
  readonly tenantId: string;
  readonly ownerUserId: string;
}

/** Why a resolution attempt produced no owner context. Diagnostic only — never sent over HTTP. */
export type OwnerContextFailureReason =
  | 'path-not-configured'
  | 'carrier-unreadable'
  | 'carrier-empty'
  | 'carrier-too-large'
  | 'integrity-mismatch'
  | 'malformed-json'
  | 'malformed-grammar'
  | 'invalid-value';

/** Outcome of one resolution attempt, including the non-disclosing failure reason. */
export interface OwnerContextResolution {
  readonly ok: boolean;
  readonly reason: OwnerContextFailureReason | 'ok';
  readonly context: OwnerContext | null;
}

function fail(reason: OwnerContextFailureReason): OwnerContextResolution {
  return { ok: false, reason, context: null };
}

/** Read the server-owned carrier path. Returns `null` unless it is a non-empty string. */
export function ownerContextCarrierPath(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env[OWNER_CONTEXT_PATH_ENV];
  if (typeof raw !== 'string' || raw.length === 0) return null;
  return raw;
}

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function hasExactKeys(v: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(v);
  return actual.length === keys.length && keys.every((k) => Object.prototype.hasOwnProperty.call(v, k));
}

/** A governed partition value: non-empty bounded string, no NUL (compound dedup-key component). */
function isValidPartitionValue(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    v.length > 0 &&
    v.length <= OWNER_CONTEXT_MAX_VALUE_LENGTH &&
    !v.includes('\u0000')
  );
}

/**
 * Validate carrier bytes against an expected integrity digest.
 *
 * TWO INDEPENDENT GATES, both fail closed:
 *   gate 1 — integrity: the bytes must hash to `expectedSha256`;
 *   gate 2 — grammar/value: the document must be exactly the authorised grammar and must carry
 *            exactly the approved pair.
 *
 * Gate 1 precedes gate 2, so in production — where `expectedSha256` is always the pinned
 * `OWNER_CONTEXT_CARRIER_SHA256` — gate 2 is defence in depth: content that has not already been
 * authorised can never reach the parser. Gate 2 is nevertheless a real, independently exercised
 * control, because it is the gate that would apply to a future authorised carrier whose grammar was
 * mis-specified, and because it keeps the "may return only the approved pair" property explicit.
 *
 * `expectedSha256` is an explicit parameter solely so that gate 2 is testable against synthetic
 * documents; no runtime path other than `evaluateOwnerContext` calls this, and that one always
 * passes the pinned constant. Nothing in the transports can influence it.
 */
export function validateCarrierBytes(
  bytes: Buffer,
  expectedSha256: string,
): OwnerContextResolution {
  if (bytes.length === 0) return fail('carrier-empty');
  if (bytes.length > OWNER_CONTEXT_MAX_CARRIER_BYTES) return fail('carrier-too-large');

  // Gate 1 — integrity binding. Unrecognised bytes are never parsed as governance input.
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== expectedSha256) return fail('integrity-mismatch');

  // Gate 2 — canonical grammar, audit trail, and the approved pair.
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString('utf8'));
  } catch {
    return fail('malformed-json');
  }
  if (!isPlainRecord(parsed)) return fail('malformed-grammar');

  if (!hasExactKeys(parsed, ['carrierSchemaVersion', 'ownerUserId', 'tenantId', 'governedBy'])) {
    return fail('malformed-grammar');
  }
  if (parsed.carrierSchemaVersion !== OWNER_CONTEXT_CARRIER_SCHEMA_VERSION) {
    return fail('malformed-grammar');
  }
  if (!isValidPartitionValue(parsed.ownerUserId) || !isValidPartitionValue(parsed.tenantId)) {
    return fail('malformed-grammar');
  }

  // Audit/evidence trail (F-3 property 6). Verified structurally; never trusted as authority.
  const governedBy = parsed.governedBy;
  if (!isPlainRecord(governedBy)) return fail('malformed-grammar');
  if (!hasExactKeys(governedBy, ['recordId', 'recordPath', 'recordBlob', 'decisionDate'])) {
    return fail('malformed-grammar');
  }
  if (
    governedBy.recordId !== GOVERNING_RECORD_ID ||
    governedBy.recordPath !== GOVERNING_RECORD_PATH ||
    !isValidPartitionValue(governedBy.recordBlob) ||
    !isValidPartitionValue(governedBy.decisionDate)
  ) {
    return fail('malformed-grammar');
  }

  // The resolver may return ONLY the approved pair (value act §4). Not equal ⇒ not established.
  if (parsed.tenantId !== APPROVED_TENANT_ID || parsed.ownerUserId !== APPROVED_OWNER_USER_ID) {
    return fail('invalid-value');
  }

  return {
    ok: true,
    reason: 'ok',
    context: Object.freeze({ tenantId: APPROVED_TENANT_ID, ownerUserId: APPROVED_OWNER_USER_ID }),
  };
}

/**
 * Perform one uncached resolution attempt and report both the outcome and a diagnostic reason.
 *
 * The reason is for server-side operators, evidence and tests only. It is deliberately NOT
 * surfaced through any transport: an owner-scoped route answers exactly `503
 * owner-context-unavailable` whether the carrier is absent, malformed, invalid or tampered with.
 */
export function evaluateOwnerContext(env: NodeJS.ProcessEnv = process.env): OwnerContextResolution {
  const carrierPath = ownerContextCarrierPath(env);
  if (carrierPath === null) return fail('path-not-configured');

  let bytes: Buffer;
  try {
    bytes = fs.readFileSync(carrierPath);
  } catch {
    // Absent, a directory, a permission failure, a dangling path — all identical: no owner context.
    return fail('carrier-unreadable');
  }

  return validateCarrierBytes(bytes, OWNER_CONTEXT_CARRIER_SHA256);
}

/**
 * Resolve the server-owned owner context, or `null` when it cannot be validly established.
 *
 * This is the single entry point used by the owner-scoped transports. `null` ⇒ the caller responds
 * `503 owner-context-unavailable`.
 */
export function resolveOwnerContext(env: NodeJS.ProcessEnv = process.env): OwnerContext | null {
  return evaluateOwnerContext(env).context;
}

/** The canonical carrier text this resolver accepts — for materialisation, recovery and evidence. */
export const CANONICAL_CARRIER = CANONICAL_CARRIER_TEXT;
