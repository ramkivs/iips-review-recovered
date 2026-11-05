/**
 * IIPS v3.0 — CAP-02 U1 AMEND-01 broker-import evidence owner resolver.
 *
 * Establishes the server-owned owner context for the single admitted evidence-retrieval route on the
 * single-user IRR application, by reading the governed carrier file through the SERVER-OWNED PATH
 * SEAM `IIPS_BROKER_EVIDENCE_OWNER_PATH`, validating it, and verifying its integrity binding.
 *
 * Authority: `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` §8.2(7)–(10) and
 * §3.7. Shape mirrors the NP-06 R1 resolver (`../reports-owner-resolver.ts`).
 *
 * PROPERTIES (act §3.7(4))
 *   1. Returns ONLY the approved `(irr-personal-073dd1c8, owner-4dc756b3)` pair, or `null`. There is
 *      no second scope: the tenant key is a mechanical necessity of PF-1's two-key equality
 *      partition, fixed to one permanent personal value — NOT multi-tenant infrastructure (§3.9).
 *   2. Never infers, defaults, or accepts client-supplied identity. NO header, cookie, token,
 *      credential or query value is an identity source (§8.2(10)).
 *   3. Performs UNCACHED per-request evaluation, so removing or restoring the carrier file takes
 *      effect immediately without a restart.
 *   4. FAILS CLOSED (`null`) on every missing, unreadable, oversized, malformed, invalid or
 *      digest-mismatched carrier condition. The caller maps `null` to HTTP 503
 *      owner-context-unavailable — never a 500, never a diagnostic.
 *   5. The failure reasons below are DIAGNOSTIC ONLY and are never disclosed over HTTP (§8.1(5)).
 */
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';

import {
  APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
  APPROVED_BROKER_EVIDENCE_TENANT_ID,
  BROKER_EVIDENCE_GOVERNING_RECORD_ID,
  BROKER_EVIDENCE_GOVERNING_RECORD_PATH,
  BROKER_EVIDENCE_OWNER_CARRIER_SHA256,
  BROKER_EVIDENCE_OWNER_CARRIER_SCHEMA_VERSION,
} from './brokerImportEvidenceOwnerCarrier.js';

/**
 * Server-owned environment variable naming the broker-import evidence owner carrier file.
 *
 * DELIBERATELY DISTINCT from `IIPS_OWNER_CONTEXT_PATH` (F-3) and `IIPS_REPORTS_OWNER_PATH`
 * (NP-06 R1). NP-06 R1 §1 prohibits aliasing one governed carrier to another, so this route resolves
 * its scope from its own carrier and never borrows a neighbour's.
 */
export const BROKER_EVIDENCE_OWNER_PATH_ENV = 'IIPS_BROKER_EVIDENCE_OWNER_PATH';

/** Maximum accepted length of each governed partition value. */
export const BROKER_EVIDENCE_OWNER_MAX_VALUE_LENGTH = 128;

/** Maximum accepted carrier file size in bytes. */
export const BROKER_EVIDENCE_OWNER_MAX_CARRIER_BYTES = 4096;

/**
 * The established broker-import evidence owner context.
 *
 * PARTITION SEMANTICS ONLY — never an authorization credential, never a principal.
 */
export interface BrokerEvidenceOwnerContext {
  readonly tenantId: string;
  readonly ownerUserId: string;
}

/** Diagnostic failure reasons for resolver evaluation (NEVER disclosed over HTTP). */
export type BrokerEvidenceOwnerFailureReason =
  | 'path-not-configured'
  | 'carrier-unreadable'
  | 'carrier-empty'
  | 'carrier-too-large'
  | 'integrity-mismatch'
  | 'malformed-json'
  | 'malformed-grammar'
  | 'invalid-value';

export interface BrokerEvidenceOwnerResolution {
  readonly ok: boolean;
  readonly reason: BrokerEvidenceOwnerFailureReason | 'ok';
  readonly context: BrokerEvidenceOwnerContext | null;
}

function fail(reason: BrokerEvidenceOwnerFailureReason): BrokerEvidenceOwnerResolution {
  return { ok: false, reason, context: null };
}

/** Read the server-owned carrier path from process environment. Empty or absent ⇒ not configured. */
export function brokerEvidenceOwnerCarrierPath(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env[BROKER_EVIDENCE_OWNER_PATH_ENV];
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
    v.length <= BROKER_EVIDENCE_OWNER_MAX_VALUE_LENGTH &&
    !v.includes('\u0000')
  );
}

/**
 * Validate carrier bytes against the expected integrity digest, then against the act's grammar and
 * the approved pair.
 *
 * Gate order is load-bearing: the DIGEST is checked first, so a carrier that is not the authorised
 * materialisation is rejected without its contents ever being interpreted.
 */
export function validateBrokerEvidenceCarrierBytes(
  bytes: Buffer,
  expectedSha256: string = BROKER_EVIDENCE_OWNER_CARRIER_SHA256,
): BrokerEvidenceOwnerResolution {
  if (bytes.length === 0) return fail('carrier-empty');
  if (bytes.length > BROKER_EVIDENCE_OWNER_MAX_CARRIER_BYTES) return fail('carrier-too-large');

  // Gate 1 — integrity binding (act §3.7(3)).
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
  if (parsed.carrierSchemaVersion !== BROKER_EVIDENCE_OWNER_CARRIER_SCHEMA_VERSION) {
    return fail('malformed-grammar');
  }
  if (
    !isValidPartitionValue(parsed.ownerUserId) ||
    !isValidPartitionValue(parsed.tenantId)
  ) {
    return fail('malformed-grammar');
  }

  const governedBy = parsed.governedBy;
  if (!isPlainRecord(governedBy)) return fail('malformed-grammar');
  if (!hasExactKeys(governedBy, ['recordId', 'recordPath', 'decisionDate'])) {
    return fail('malformed-grammar');
  }
  if (
    governedBy.recordId !== BROKER_EVIDENCE_GOVERNING_RECORD_ID ||
    governedBy.recordPath !== BROKER_EVIDENCE_GOVERNING_RECORD_PATH ||
    !isValidPartitionValue(governedBy.decisionDate)
  ) {
    return fail('malformed-grammar');
  }

  // The resolver may return ONLY the approved pair. Anything else is refused, not adapted.
  if (
    parsed.tenantId !== APPROVED_BROKER_EVIDENCE_TENANT_ID ||
    parsed.ownerUserId !== APPROVED_BROKER_EVIDENCE_OWNER_USER_ID
  ) {
    return fail('invalid-value');
  }

  return {
    ok: true,
    reason: 'ok',
    context: Object.freeze({
      tenantId: APPROVED_BROKER_EVIDENCE_TENANT_ID,
      ownerUserId: APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
    }),
  };
}

/** Perform ONE uncached resolution attempt and report the diagnostic outcome. */
export function evaluateBrokerEvidenceOwnerContext(
  env: NodeJS.ProcessEnv = process.env,
): BrokerEvidenceOwnerResolution {
  const carrierPath = brokerEvidenceOwnerCarrierPath(env);
  if (carrierPath === null) return fail('path-not-configured');

  let bytes: Buffer;
  try {
    bytes = fs.readFileSync(carrierPath);
  } catch {
    return fail('carrier-unreadable');
  }

  return validateBrokerEvidenceCarrierBytes(bytes, BROKER_EVIDENCE_OWNER_CARRIER_SHA256);
}

/** Resolve the established owner context, or return `null` (fail closed). */
export function resolveBrokerEvidenceOwnerContext(
  env: NodeJS.ProcessEnv = process.env,
): BrokerEvidenceOwnerContext | null {
  return evaluateBrokerEvidenceOwnerContext(env).context;
}
