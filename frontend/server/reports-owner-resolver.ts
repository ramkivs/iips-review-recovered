/**
 * IIPS v3.0 — NP-06 Reports owner resolver.
 *
 * Establishes the server-owned owner context for Reports on the single-user IRR application by
 * reading the governed carrier file through the SERVER-OWNED PATH SEAM `IIPS_REPORTS_OWNER_PATH`,
 * validating it, and verifying its integrity binding.
 *
 * PROPERTIES
 *   1. Returns ONLY the approved `(irr-reports-personal, owner-irr-reports-personal)` pair or `null`.
 *   2. Never infers, defaults, or accepts client-supplied identity.
 *   3. Performs uncached per-request evaluation.
 *   4. Fails closed (`null`) on any missing, invalid, or mismatched carrier condition.
 */
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import {
  APPROVED_REPORTS_OWNER_USER_ID,
  APPROVED_REPORTS_TENANT_ID,
  CANONICAL_REPORTS_CARRIER_TEXT,
  GOVERNING_RECORD_ID,
  GOVERNING_RECORD_PATH,
  REPORTS_OWNER_CARRIER_SCHEMA_VERSION,
  REPORTS_OWNER_CARRIER_SHA256,
} from './reports-owner-carrier';

/** Server-owned environment variable naming the Reports owner carrier file. */
export const REPORTS_OWNER_PATH_ENV = 'IIPS_REPORTS_OWNER_PATH';

/** Maximum accepted length of each governed partition value. */
export const REPORTS_OWNER_MAX_VALUE_LENGTH = 128;

/** Maximum accepted carrier file size in bytes. */
export const REPORTS_OWNER_MAX_CARRIER_BYTES = 4096;

/** The established Reports owner context. Partition semantics only — never an authorization credential. */
export interface ReportsOwnerContext {
  readonly tenantId: string;
  readonly ownerUserId: string;
}

/** Diagnostic failure reasons for resolver evaluation (never disclosed over HTTP). */
export type ReportsOwnerFailureReason =
  | 'path-not-configured'
  | 'carrier-unreadable'
  | 'carrier-empty'
  | 'carrier-too-large'
  | 'integrity-mismatch'
  | 'malformed-json'
  | 'malformed-grammar'
  | 'invalid-value';

export interface ReportsOwnerResolution {
  readonly ok: boolean;
  readonly reason: ReportsOwnerFailureReason | 'ok';
  readonly context: ReportsOwnerContext | null;
}

function fail(reason: ReportsOwnerFailureReason): ReportsOwnerResolution {
  return { ok: false, reason, context: null };
}

/** Read the server-owned Reports carrier path from process environment. */
export function reportsOwnerCarrierPath(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env[REPORTS_OWNER_PATH_ENV];
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

function isValidPartitionValue(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    v.length > 0 &&
    v.length <= REPORTS_OWNER_MAX_VALUE_LENGTH &&
    !v.includes('\u0000')
  );
}

/**
 * Validate carrier bytes against the expected integrity digest.
 */
export function validateReportsCarrierBytes(
  bytes: Buffer,
  expectedSha256: string = REPORTS_OWNER_CARRIER_SHA256,
): ReportsOwnerResolution {
  if (bytes.length === 0) return fail('carrier-empty');
  if (bytes.length > REPORTS_OWNER_MAX_CARRIER_BYTES) return fail('carrier-too-large');

  // Gate 1 — integrity binding.
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== expectedSha256) return fail('integrity-mismatch');

  // Gate 2 — canonical grammar, audit trail, and approved pair.
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
  if (parsed.carrierSchemaVersion !== REPORTS_OWNER_CARRIER_SCHEMA_VERSION) {
    return fail('malformed-grammar');
  }
  if (!isValidPartitionValue(parsed.ownerUserId) || !isValidPartitionValue(parsed.tenantId)) {
    return fail('malformed-grammar');
  }

  const governedBy = parsed.governedBy;
  if (!isPlainRecord(governedBy)) return fail('malformed-grammar');
  if (!hasExactKeys(governedBy, ['recordId', 'recordPath', 'decisionDate'])) {
    return fail('malformed-grammar');
  }
  if (
    governedBy.recordId !== GOVERNING_RECORD_ID ||
    governedBy.recordPath !== GOVERNING_RECORD_PATH ||
    !isValidPartitionValue(governedBy.decisionDate)
  ) {
    return fail('malformed-grammar');
  }

  // Resolver may return ONLY the approved pair.
  if (
    parsed.tenantId !== APPROVED_REPORTS_TENANT_ID ||
    parsed.ownerUserId !== APPROVED_REPORTS_OWNER_USER_ID
  ) {
    return fail('invalid-value');
  }

  return {
    ok: true,
    reason: 'ok',
    context: Object.freeze({
      tenantId: APPROVED_REPORTS_TENANT_ID,
      ownerUserId: APPROVED_REPORTS_OWNER_USER_ID,
    }),
  };
}

/**
 * Perform one uncached resolution attempt and report diagnostic outcome.
 */
export function evaluateReportsOwnerContext(
  env: NodeJS.ProcessEnv = process.env,
): ReportsOwnerResolution {
  const carrierPath = reportsOwnerCarrierPath(env);
  if (carrierPath === null) return fail('path-not-configured');

  let bytes: Buffer;
  try {
    bytes = fs.readFileSync(carrierPath);
  } catch {
    return fail('carrier-unreadable');
  }

  return validateReportsCarrierBytes(bytes, REPORTS_OWNER_CARRIER_SHA256);
}

/**
 * Resolve the established Reports owner context, or return `null`.
 */
export function resolveReportsOwnerContext(
  env: NodeJS.ProcessEnv = process.env,
): ReportsOwnerContext | null {
  return evaluateReportsOwnerContext(env).context;
}
