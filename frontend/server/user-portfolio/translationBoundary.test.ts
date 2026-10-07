/**
 * G-2 Durable User Portfolio — TRANSLATION BOUNDARY TESTS.
 *
 * Verifies the D-2 §8 translation contract in executable form: the principal is
 * the ONLY tenant source (no default, no substitution); client-supplied identity,
 * tenant, and durable-identity fields are classified for refusal; and the offline
 * provisioning attestation has a validated shape. Nothing here resolves, stores,
 * or equates identifiers across domains — that is the assertion.
 *
 * Case IDs: G2T-01 … (translation).
 *
 * @vitest-environment node
 */
import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import {
  G2_DURABLE_IDENTITY_KEYS,
  G2_IDENTITY_CLAIM_KEYS,
  G2_TENANT_CLAIM_KEYS,
  classifyG2Claims,
  deriveTenantHint,
  validateProvisioningRecord,
} from './translationBoundary.js';
import { G2Error } from './userPortfolioContract.js';

const PRINCIPAL = { userId: 'analyst-a', tenantId: 'tenant-A', roles: ['analyst'] as const };

describe('G2T — tenant-hint derivation', () => {
  it('G2T-01 derives the hint solely from the authenticated principal', () => {
    assert.equal(deriveTenantHint(PRINCIPAL as unknown as Parameters<typeof deriveTenantHint>[0]), 'tenant-A');
  });

  it('G2T-02 denies a principal without an authoritative tenant (no default)', () => {
    for (const bad of [
      { userId: 'u', tenantId: '', roles: [] },
      { userId: 'u', tenantId: '   ', roles: [] },
      { userId: 'u', roles: [] },
      null,
      undefined,
    ]) {
      assert.throws(
        () => deriveTenantHint(bad as never),
        (error: unknown) => error instanceof G2Error && error.reason === 'FORBIDDEN',
      );
    }
  });
});

describe('G2T — claim classification', () => {
  it('G2T-10 forbids the prohibited and cross-domain identifiers', () => {
    for (const key of ['companyId', 'runtimeCompanyId', 'applicationUserId', 'mappingId', 'userId', 'owner']) {
      assert.ok((G2_IDENTITY_CLAIM_KEYS as readonly string[]).includes(key), key);
    }
    assert.ok((G2_TENANT_CLAIM_KEYS as readonly string[]).includes('tenantId'));
    for (const key of ['portfolioId', 'revision', 'provenanceDigest', 'disposition']) {
      assert.ok((G2_DURABLE_IDENTITY_KEYS as readonly string[]).includes(key), key);
    }
  });

  it('G2T-11 classifies client-supplied keys for refusal', () => {
    assert.deepEqual(classifyG2Claims({ mode: 'MERGE', holdings: [] }), {
      tenantClaim: undefined,
      identityKeys: [],
      durableKeys: [],
    });
    const t = classifyG2Claims({ tenantId: 'tenant-B' });
    assert.equal(t.tenantClaim, 'tenant-B');
    const ti = classifyG2Claims({ tenantId: 42 });
    assert.deepEqual(ti.identityKeys, ['tenantId']);
    const i = classifyG2Claims({ userId: 'u', companyId: 'C1' });
    assert.deepEqual([...i.identityKeys].sort(), ['companyId', 'userId']);
    const d = classifyG2Claims({ revision: 3, portfolioId: 'P-1' });
    assert.deepEqual([...d.durableKeys].sort(), ['portfolioId', 'revision']);
  });
});

describe('G2T — offline provisioning attestation', () => {
  const record = {
    issuer: 'https://idp.local/realms/iips',
    subject: 'sub-1',
    applicationUserId: 'app-user-1',
    tenantId: 'tenant-A',
    mappingId: 'map-1',
    lifecycleState: 'ACTIVE',
    attestedAt: '2026-10-07T00:00:00.000Z',
    actor: 'operator-1',
    context: 'ticket-1',
  };

  it('G2T-20 accepts a well-formed attestation', () => {
    assert.deepEqual(validateProvisioningRecord(record), record);
  });

  it('G2T-21 rejects malformed attestations fail-closed', () => {
    const bad: unknown[] = [
      null, 'x', [],
      { ...record, issuer: '' },
      { ...record, subject: '  ' },
      { ...record, applicationUserId: undefined },
      { ...record, lifecycleState: 'APPROVED-PENDING' },
      { ...record, attestedAt: 'not-a-date' },
      { ...record, actor: '' },
      { ...record, context: 42 },
    ];
    for (const candidate of bad) {
      assert.throws(
        () => validateProvisioningRecord(candidate),
        (error: unknown) => error instanceof G2Error && error.reason === 'INVALID_REQUEST',
      );
    }
  });
});
