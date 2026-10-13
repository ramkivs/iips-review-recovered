/**
 * G-2 durable user-portfolio owner-context boundary helpers.
 *
 * The first-party HTTP handler currently returns `503 owner-context-unavailable` for every
 * recognized owner-scoped operation and does not call this module. These helpers remain only as
 * domain-contract validation: they do not authenticate requests, inspect credentials, infer an
 * owner, or provision identities. `deriveTenantHint` validates an already supplied trusted caller
 * context and fails closed when it lacks a tenant; it does not establish that context.
 *
 * Re-enabling any owner-scoped HTTP operation requires a separately established and authorized
 * non-authentication ownership source. No such source is implemented here.
 */
import type { Principal } from '../../../iips-platform/src/distributed/EnterpriseRuntime.js';
import {
  G2Error, G2_UNRESOLVED_WRITE_MESSAGE, isNonBlankString, validateHoldingsShape,
  type G2UnresolvedHoldingEvidence,
} from './userPortfolioContract.js';

/**
 * Derives the tenant hint for ONE seam call from the authenticated principal.
 *
 * This is the ONLY tenant source the seam admits. The value is a HINT: G24
 * validates it against ACTIVE memberships and fails closed on mismatch. A
 * principal without a tenant denies HERE (never with a default, never with a
 * client-supplied substitute).
 */
export function deriveTenantHint(principal: Principal): string {
  if (!principal || !isNonBlankString(principal.tenantId)) {
    throw new G2Error('FORBIDDEN', 'No authoritative tenant: access denied.');
  }
  return principal.tenantId;
}

/**
 * Client-supplied TENANT claims. A foreign value is a cross-tenant attempt and
 * must be refused 403 (audited DENY via `authorizeMutation`); a same-tenant
 * value is still client-supplied identity and must be refused 400. Either way
 * the value NEVER becomes the seam's tenant hint.
 */
export const G2_TENANT_CLAIM_KEYS: readonly string[] = ['tenantId', 'tenant'];

/**
 * Client-supplied identity/ownership fields. Never authoritative; always refused
 * (400). `companyId` / `runtimeCompanyId` are prohibited by standing program
 * constraint and are refused here so no prohibited identifier can reach an
 * authorization decision or cross the seam.
 */
export const G2_IDENTITY_CLAIM_KEYS: readonly string[] = [
  'userId', 'user', 'subject', 'principal', 'roles', 'role', 'owner', 'ownership',
  'applicationUserId', 'mappingId',
  'companyId', 'runtimeCompanyId', 'identityStatus', 'resolutionDisposition',
];

/**
 * Client-supplied DURABLE identity / lifecycle fields. Refused (400) wherever a
 * caller could supply them: instance identity, revisioning, and provenance are
 * assigned by G24 and addressed by path, never by caller declaration.
 */
export const G2_DURABLE_IDENTITY_KEYS: readonly string[] = [
  'portfolioId', 'revision', 'provenanceDigest', 'savedAt', 'lastUpdated',
  'totalMarketValue', 'weightSumPercentage', 'holdingsSavedCount', 'isSaved',
  'totalHoldingsCount', 'disposition', 'isDuplicate',
];

/** Classification of client-supplied keys for the transport's refusal logic. */
export interface G2ClaimClassification {
  readonly tenantClaim?: string;
  readonly identityKeys: readonly string[];
  readonly durableKeys: readonly string[];
}

/**
 * Splits client-supplied keys into a usable tenant claim and forbidden fields.
 * Pure inspection — the transport decides 400 vs 403 from the result.
 */
export function classifyG2Claims(source: Record<string, unknown>): G2ClaimClassification {
  const identityKeys: string[] = [];
  const durableKeys: string[] = [];
  let tenantClaim: string | undefined;
  for (const key of Object.keys(source)) {
    if ((G2_TENANT_CLAIM_KEYS as readonly string[]).includes(key)) {
      const value = source[key];
      if (typeof value === 'string' && value.length > 0) tenantClaim = value;
      else identityKeys.push(key);
    } else if ((G2_IDENTITY_CLAIM_KEYS as readonly string[]).includes(key)) {
      identityKeys.push(key);
    } else if ((G2_DURABLE_IDENTITY_KEYS as readonly string[]).includes(key)) {
      durableKeys.push(key);
    }
  }
  return { tenantClaim, identityKeys, durableKeys };
}

/**
 * GC-D2 / 2F accepts data evidence, never caller identity/disposition authority.
 * Presence is refused even for undefined/empty claims. Restrict inspection to
 * plain data records: no prototype claims, accessors or client callbacks.
 */
export function assertNoG2CallerAuthority(source: unknown): asserts source is Record<string, unknown> {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new G2Error('INVALID_REQUEST', 'Portfolio evidence must be a data object.');
  }
  const prototype = Object.getPrototypeOf(source);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new G2Error('INVALID_REQUEST', 'Portfolio evidence must be a plain data object.');
  }
  const descriptors = Object.getOwnPropertyDescriptors(source);
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!('value' in descriptor)) {
      throw new G2Error('INVALID_REQUEST', 'Portfolio evidence cannot contain accessors.');
    }
    if ([...G2_TENANT_CLAIM_KEYS, ...G2_IDENTITY_CLAIM_KEYS, ...G2_DURABLE_IDENTITY_KEYS].includes(key)) {
      throw new G2Error('INVALID_REQUEST', 'Caller-supplied portfolio identity/disposition is not authoritative.');
    }
  }
}

const NATIVE_EVIDENCE_FIELDS = [
  'symbol', 'isin', 'exchange', 'quantity', 'averageBuyPrice', 'currentPrice',
  'marketValue', 'weightPercentage', 'active', 'sourceBroker', 'lineageDigest', 'rawIdentifier',
] as const;

/**
 * Pure, non-serializing evidence projection under effective GC-D2 (§9.4).
 * Retains native bytes/absence; no ticker/ISIN/company equivalence, defaults,
 * key composition, caller callbacks, merging or persistence. Returned records
 * are explicitly UNRESOLVED and omit companyId and resolutionDisposition.
 * This helper supplies no ownership, credential or successful-write authority.
 */
export function prepareUnresolvedHoldingEvidence(holdings: unknown): readonly G2UnresolvedHoldingEvidence[] {
  if (!Array.isArray(holdings)) {
    throw new G2Error('INVALID_REQUEST', 'A holdings array is required.');
  }
  for (const holding of holdings) assertNoG2CallerAuthority(holding);
  const validated = validateHoldingsShape(holdings);
  return Object.freeze(validated.map(holding => {
    const evidence: Record<string, unknown> = {};
    for (const field of NATIVE_EVIDENCE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(holding, field) && holding[field] !== undefined) {
        evidence[field] = holding[field];
      }
    }
    evidence.identityStatus = 'UNRESOLVED';
    return Object.freeze(evidence) as unknown as G2UnresolvedHoldingEvidence;
  }));
}

/**
 * No successful-write identity policy exists. Refuse EVERY batch (including
 * empty/ambiguous evidence) before any serializer, scope derivation or port
 * invocation. A later governed contract must explicitly replace this policy;
 * neither a literal companyId nor a bypass declaration can unlock it.
 */
export function refuseUnresolvedPortfolioWrite(): never {
  throw new G2Error('INVALID_REQUEST', G2_UNRESOLVED_WRITE_MESSAGE);
}
