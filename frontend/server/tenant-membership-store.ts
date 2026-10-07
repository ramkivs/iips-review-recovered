/**
 * Program v3.0 — G3: IIPS-owned TenantDirectory (durable, authoritative).
 *
 * Implements the `TenantDirectory` seam consumed by `SecuredExecutor` (secured-executor.ts:26,
 * invoked at :41) against durable server-side state, replacing the hardcoded `ADMIN_DIRECTORY`
 * fixture as the production authority.
 *
 * AUTHORITY BASIS (all in IRR):
 *  - G3 governance        : PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_GOVERNANCE_DECISION.md
 *  - G3 substrate         : PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_SUBSTRATE_TECHNICAL_AUTHORITY.md
 *                           (filesystem-backed durable store; NP-04 explicitly NOT used)
 *  - G3-DEP-3 mutation    : PROGRAM_v3.0_G3_DEP3_MUTATION_AUTHORITY_AMENDMENT_DECISION.md
 *                           (lookup READ ONLY; assignment/revocation BOUNDED)
 *  - G3-DEP-1 reassignment: PROGRAM_v3.0_G3_DEP1_TENANT_REASSIGNMENT_POLICY_DECISION.md
 *                           (cross-tenant reassignment NOT AUTHORIZED; fail closed)
 *  - G3-DEP-2 service     : PROGRAM_v3.0_G3_DEP2_IMPLEMENTING_SERVICE_DESIGNATION.md
 *  - G3-B implementation  : PROGRAM_v3.0_G3B_TENANTDIRECTORY_IMPLEMENTATION_AUTHORITY.md
 *
 * G3-DEP-1 is binding: a membership transition that would move a `userId` from one tenant to
 * another is a REASSIGNMENT and is refused. There is no composition of revoke+assign that
 * performs a reassignment: `revoke` leaves the user unresolvable, and `assign` on a user that
 * still holds a membership is refused as a duplicate.
 *
 * Fail-closed everywhere: an absent, unreadable, malformed, or checksum-mismatched state denies
 * resolution. There is no default tenant and no fallback to a fixture.
 *
 * NOT in scope and deliberately absent: `companyId`, `runtimeCompanyId`, client-supplied tenant
 * authority, tenant creation/deletion, quota, roles, permission policy, Keycloak mutation, and any
 * interaction with NP-04 or IPD.
 */
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { TenantDirectory } from './secured-executor';

/** A governed membership decision outcome. */
export type MembershipFailure =
  | 'no-valid-tenant'
  | 'membership-state-unavailable'
  | 'membership-state-corrupt'
  | 'invalid-user'
  | 'invalid-tenant'
  | 'duplicate-membership'
  | 'tenant-reassignment-forbidden'
  | 'membership-not-found';

export class MembershipError extends Error {
  constructor(
    readonly code: MembershipFailure,
    message: string,
  ) {
    super(message);
    this.name = 'MembershipError';
  }
}

interface MembershipFile {
  readonly schema: 'iips.tenant-membership/1';
  /** userId -> tenantId. A userId appears at most once (unique membership by userId). */
  readonly memberships: Readonly<Record<string, string>>;
  /** SHA-256 over the canonical memberships payload. Detects tampering/corruption. */
  readonly checksum: string;
}

function canonical(memberships: Record<string, string>): string {
  // Deterministic key order so the checksum is stable across writes and restarts.
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(memberships).sort()) sorted[key] = memberships[key];
  return JSON.stringify(sorted);
}

function checksumOf(memberships: Record<string, string>): string {
  return createHash('sha256').update(canonical(memberships), 'utf8').digest('hex');
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Durable, IIPS-owned tenant membership store.
 *
 * Mutations are single-relation and atomic: the new state is written to a temporary file, flushed,
 * and atomically renamed over the authoritative file. A failed or interrupted write therefore
 * leaves the prior committed state intact — never a partially-applied membership set.
 */
export class FileTenantDirectory implements TenantDirectory {
  private readonly file: string;

  constructor(options: { readonly path: string }) {
    if (!isNonEmptyString(options.path)) throw new MembershipError('membership-state-unavailable', 'membership path is required');
    this.file = options.path;
  }

  /** Read committed state, or throw a fail-closed error. Never returns partial/default state. */
  private read(): Record<string, string> {
    if (!existsSync(this.file)) {
      // An absent directory is an unresolvable membership, never an implicit default.
      throw new MembershipError('membership-state-unavailable', 'membership state is not present');
    }
    let raw: string;
    try {
      raw = readFileSync(this.file, 'utf8');
    } catch (cause) {
      throw new MembershipError('membership-state-unavailable', `membership state is unreadable: ${String(cause)}`);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new MembershipError('membership-state-corrupt', 'membership state is not valid JSON');
    }
    if (typeof parsed !== 'object' || parsed === null) {
      throw new MembershipError('membership-state-corrupt', 'membership state has an unexpected shape');
    }
    const candidate = parsed as Partial<MembershipFile>;
    if (candidate.schema !== 'iips.tenant-membership/1') {
      throw new MembershipError('membership-state-corrupt', 'membership state schema is unrecognised');
    }
    const memberships = candidate.memberships;
    if (typeof memberships !== 'object' || memberships === null || Array.isArray(memberships)) {
      throw new MembershipError('membership-state-corrupt', 'membership state memberships are malformed');
    }
    const out: Record<string, string> = {};
    for (const [userId, tenantId] of Object.entries(memberships)) {
      if (!isNonEmptyString(userId) || !isNonEmptyString(tenantId)) {
        throw new MembershipError('membership-state-corrupt', 'membership state contains a malformed entry');
      }
      out[userId] = tenantId;
    }
    // Integrity: a checksum mismatch is corruption, not a recoverable condition.
    if (candidate.checksum !== checksumOf(out)) {
      throw new MembershipError('membership-state-corrupt', 'membership state checksum mismatch');
    }
    return out;
  }

  /** Atomically commit new state. */
  private write(memberships: Record<string, string>): void {
    const payload: MembershipFile = {
      schema: 'iips.tenant-membership/1',
      memberships: JSON.parse(canonical(memberships)) as Record<string, string>,
      checksum: checksumOf(memberships),
    };
    mkdirSync(dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${randomUUID()}.tmp`;
    try {
      writeFileSync(tmp, JSON.stringify(payload), 'utf8');
      renameSync(tmp, this.file); // atomic replace on the same filesystem
    } catch (cause) {
      try {
        if (existsSync(tmp)) unlinkSync(tmp);
      } catch {
        // A cleanup failure must not mask the original cause.
      }
      throw new MembershipError('membership-state-unavailable', `membership state is not writable: ${String(cause)}`);
    }
  }

  /**
   * Read path — `TenantDirectory` seam consumed by `SecuredExecutor.authenticate`.
   *
   * `candidateTenant` is the untrusted IdP-claim value. It is validated against authoritative
   * state and NEVER used as the source of truth. A mismatch denies.
   */
  tenantForUser(userId: string, candidateTenant: unknown): { tenantId: string } | null {
    if (!isNonEmptyString(userId)) return null;
    const memberships = this.read(); // throws -> fail closed
    const authoritative = memberships[userId];
    if (authoritative === undefined) return null;
    // Server-side validation: the claim must agree with authoritative state.
    if (!isNonEmptyString(candidateTenant) || candidateTenant !== authoritative) return null;
    return { tenantId: authoritative };
  }

  /** Authoritative tenant for a user, or null. Ignores any candidate claim. */
  membershipOf(userId: string): string | null {
    if (!isNonEmptyString(userId)) return null;
    return this.read()[userId] ?? null;
  }

  /**
   * BOUNDED MUTATION — assignment.
   *
   * Refuses a duplicate membership rather than silently overwriting, and refuses any write that
   * would move an existing user to a different tenant (a reassignment, per G3-DEP-1).
   */
  assign(userId: string, tenantId: string): void {
    if (!isNonEmptyString(userId)) throw new MembershipError('invalid-user', 'userId must be a non-empty string');
    if (!isNonEmptyString(tenantId)) throw new MembershipError('invalid-tenant', 'tenantId must be a non-empty string');
    const memberships = this.read();
    const existing = memberships[userId];
    if (existing !== undefined) {
      if (existing === tenantId) {
        // No silent overwrite, and no no-op that would mask an attempted reassignment.
        throw new MembershipError('duplicate-membership', 'user already holds a membership in this tenant');
      }
      throw new MembershipError('tenant-reassignment-forbidden', 'cross-tenant reassignment is not authorized');
    }
    this.write({ ...memberships, [userId]: tenantId });
  }

  /** BOUNDED MUTATION — revocation. Removing a membership never migrates owned resources. */
  revoke(userId: string): void {
    if (!isNonEmptyString(userId)) throw new MembershipError('invalid-user', 'userId must be a non-empty string');
    const memberships = this.read();
    if (memberships[userId] === undefined) {
      throw new MembershipError('membership-not-found', 'user holds no membership');
    }
    const next = { ...memberships };
    delete next[userId];
    this.write(next);
  }

  /** Provision initial state. Used to create a directory; refuses to clobber existing state. */
  static provision(path: string, memberships: Record<string, string> = {}): FileTenantDirectory {
    const directory = new FileTenantDirectory({ path });
    if (existsSync(path)) {
      throw new MembershipError('duplicate-membership', 'membership state already exists');
    }
    for (const [userId, tenantId] of Object.entries(memberships)) {
      if (!isNonEmptyString(userId) || !isNonEmptyString(tenantId)) {
        throw new MembershipError('invalid-tenant', 'provisioned membership is malformed');
      }
    }
    directory.write(memberships);
    return directory;
  }
}
