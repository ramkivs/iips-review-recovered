/**
 * G-3 binding-sourced owner context tests.
 *
 * Authority: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.1 item 6.
 * Required observable result: a binding-derived context with a **fail-closed** tenant
 * hint, and **no caller substitution**.
 *
 * The strongest form of "no header/cookie/query/body reading" is structural: the
 * module accepts no request object at all. These tests assert that structurally (the
 * signature and the imports) *and* behaviourally (a caller-shaped input changes
 * nothing), so the property cannot be lost by a future refactor that adds a
 * parameter.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

import {
  BINDING_PRECONDITION_SETTING,
  describeOwnerContextProvenance,
  IPC_TENANT_HINT_SETTING,
  assertHintNotOnWire,
  isOwnerContextEstablished,
  ownerContextFromBinding,
  readBindingPrecondition,
  readLocalTenantHint,
  TENANT_HINT_MAX_LENGTH,
  type OwnerContext,
} from './ownerContextFromBinding.js';

function sourceOf(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

/* ------------------------------------------------------------------ *
 * Fail closed by default
 * ------------------------------------------------------------------ */

describe('owner context — fail closed', () => {
  it('is NOT_ESTABLISHED when no precondition is supplied at all', () => {
    for (const precondition of [undefined, null, {}, { bindingProvisioned: false }]) {
      const context = ownerContextFromBinding(precondition as never, {});
      expect(context.state, JSON.stringify(precondition)).toBe('NOT_ESTABLISHED');
      expect(context.established).toBe(false);
      expect(context.bindingProvisioned).toBe(false);
      expect(context.reason).toBe('BINDING_NOT_PROVISIONED');
      expect(isOwnerContextEstablished(context)).toBe(false);
    }
  });

  it('refuses a precondition that is merely truthy-looking rather than exactly true', () => {
    // A string, a number or a nested object must not establish an owner context.
    for (const value of ['true', 1, 'yes', [true], { bindingProvisioned: 'true' }]) {
      const context = ownerContextFromBinding({ bindingProvisioned: value } as never, {});
      expect(context.established, JSON.stringify(value)).toBe(false);
      expect(context.state).toBe('NOT_ESTABLISHED');
    }
  });

  it('is established only for an explicit bindingProvisioned: true', () => {
    const context = ownerContextFromBinding({ bindingProvisioned: true }, {});
    expect(context.state).toBe('IPD_BINDING_RESOLVED');
    expect(context.established).toBe(true);
    expect(context.reason).toBe('BINDING_PROVISIONED');
    expect(isOwnerContextEstablished(context)).toBe(true);
    // Even then the source is the binding, never a caller.
    expect(context.source).toBe('IPD_A2_BINDING');
  });

  it('readBindingPrecondition accepts only an explicit affirmative setting', () => {
    expect(readBindingPrecondition({}).bindingProvisioned).toBe(false);
    expect(readBindingPrecondition({ [BINDING_PRECONDITION_SETTING]: '' }).bindingProvisioned).toBe(false);
    expect(readBindingPrecondition({ [BINDING_PRECONDITION_SETTING]: 'maybe' }).bindingProvisioned).toBe(false);
    for (const value of ['true', 'TRUE', ' true ', '1', 'yes', 'YES']) {
      expect(
        readBindingPrecondition({ [BINDING_PRECONDITION_SETTING]: value }).bindingProvisioned,
        value,
      ).toBe(true);
    }
    expect(BINDING_PRECONDITION_SETTING).toBe('IIPS_G3_IPC_BINDING_PROVISIONED');
  });

  it('an established context still authorizes nothing — it records provenance only', () => {
    const context = ownerContextFromBinding({ bindingProvisioned: true }, {});
    // No owner identity is present to authorize with.
    const serialized = JSON.stringify(context);
    for (const forbidden of ['applicationUserId', 'tenantId', 'principal', 'credential', 'scope']) {
      expect(serialized, `the context must not carry ${forbidden}`).not.toContain(forbidden);
    }
    expect(Object.keys(context).sort()).toEqual(
      ['bindingProvisioned', 'established', 'reason', 'source', 'state', 'tenantHint'].sort(),
    );
  });
});

/* ------------------------------------------------------------------ *
 * No caller substitution
 * ------------------------------------------------------------------ */

describe('owner context — no caller substitution', () => {
  it('the module imports no http type and reads no request', () => {
    const source = sourceOf('./ownerContextFromBinding.ts');
    expect(source).not.toContain("from 'node:http'");
    expect(source).not.toContain('IncomingMessage');
    expect(source).not.toContain('ServerResponse');
    // No request-shaped property access anywhere.
    for (const forbidden of ['req.headers', 'req.url', 'req.cookies', 'request.headers', '.query', 'readBody']) {
      expect(source, `must not read ${forbidden}`).not.toContain(forbidden);
    }
  });

  it('the only admissible source is the IPD A-2 binding, and nothing is transmitted', () => {
    const provenance = describeOwnerContextProvenance();
    expect(provenance.admissibleSource).toBe('IPD_A2_BINDING');
    expect(provenance.transmittedFields).toEqual([]);
    for (const inadmissible of [
      'http-header',
      'cookie',
      'query-parameter',
      'request-body',
      'authorization-credential',
      'session',
      'caller-assertion',
      'inferred-default',
    ]) {
      expect(provenance.inadmissibleSources).toContain(inadmissible);
    }
  });

  it('a caller-supplied owner claim cannot enter the context, because no parameter accepts one', () => {
    // There is no argument through which an owner, tenant or principal could be
    // passed. Attempting to smuggle one via the precondition object is ignored.
    const smuggled = {
      bindingProvisioned: true,
      applicationUserId: 'attacker',
      tenantId: 'attacker-tenant',
      principal: 'attacker',
    } as never;
    const context = ownerContextFromBinding(smuggled, {});
    const serialized = JSON.stringify(context);
    expect(serialized).not.toContain('attacker');
    expect(context).not.toHaveProperty('applicationUserId');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('principal');
  });

  it('two calls with the same precondition agree, and no result is cached between them', () => {
    const a: OwnerContext = ownerContextFromBinding({ bindingProvisioned: true }, {});
    const b: OwnerContext = ownerContextFromBinding({ bindingProvisioned: true }, {});
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    // A changed precondition is observed on the very next call: nothing is memoized.
    const c = ownerContextFromBinding({ bindingProvisioned: false }, {});
    expect(c.established).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * The IRR-local tenant hint: read locally, never transmitted
 * ------------------------------------------------------------------ */

describe('owner context — the tenant hint is IRR-local and never transmitted', () => {
  it('is absent unless explicitly configured', () => {
    expect(readLocalTenantHint({})).toBeNull();
    expect(readLocalTenantHint({ [IPC_TENANT_HINT_SETTING]: '' })).toBeNull();
    expect(readLocalTenantHint({ [IPC_TENANT_HINT_SETTING]: '   ' })).toBeNull();
  });

  it('is read and normalized when configured, and carried on the context for local use', () => {
    const env = { [IPC_TENANT_HINT_SETTING]: ' personal-tenant-1 ' };
    expect(readLocalTenantHint(env)).toBe('personal-tenant-1');
    const context = ownerContextFromBinding({ bindingProvisioned: true }, env);
    expect(context.tenantHint).toBe('personal-tenant-1');
    // A hint on the context is still not an owner, and still establishes nothing.
    expect(context.source).toBe('IPD_A2_BINDING');
  });

  it('rejects a hint that is over-long or shaped like anything but a plain local label', () => {
    expect(readLocalTenantHint({ [IPC_TENANT_HINT_SETTING]: 'x'.repeat(TENANT_HINT_MAX_LENGTH + 1) })).toBeNull();
    for (const bad of ['a b', 'a/b', 'a;b', 'a=b', 'a\nb', 'tenant:evil', '{"t":1}']) {
      expect(readLocalTenantHint({ [IPC_TENANT_HINT_SETTING]: bad }), JSON.stringify(bad)).toBeNull();
    }
    expect(TENANT_HINT_MAX_LENGTH).toBe(64);
  });

  it('assertHintNotOnWire refuses a hint key at any depth, and passes a clean payload', () => {
    expect(() => assertHintNotOnWire({})).not.toThrow();
    expect(() => assertHintNotOnWire({ portfolioId: 'p', expectedRevision: 1 })).not.toThrow();
    expect(() =>
      assertHintNotOnWire({ holdings: [{ symbol: 'RELIANCE', quantity: 1 }] }),
    ).not.toThrow();

    for (const payload of [
      { tenantHint: 'personal-tenant-1' },
      { tenant_hint: 'personal-tenant-1' },
      { 'x-ipd-tenant-id': 'personal-tenant-1' },
      { ipdTenantHint: 'personal-tenant-1' },
      { options: { tenantHint: 'nested' } },
      { holdings: [{ symbol: 'X', tenantHint: 'nested-in-array' }] },
      { a: { b: { c: { tenantHint: 'deep' } } } },
    ]) {
      expect(() => assertHintNotOnWire(payload), JSON.stringify(payload)).toThrow(
        /must never be transmitted/,
      );
    }
  });

  it('the refusal names the offending key but never its value', () => {
    try {
      assertHintNotOnWire({ tenantHint: 'super-secret-tenant-value' });
      throw new Error('expected a refusal');
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain('tenantHint');
      expect(message).not.toContain('super-secret-tenant-value');
    }
  });

  it('there is no tenant-hint TRANSMISSION constant — §5.2 forbids one', () => {
    // The setting name exists so an operator can configure a LOCAL hint; nothing
    // exports a header name, a payload key or a wire constant for it.
    expect(IPC_TENANT_HINT_SETTING).toBe('IIPS_G2_IPC_TENANT_HINT');
    const source = sourceOf('./ownerContextFromBinding.ts');
    expect(source).not.toContain('G2_TENANT_HEADER');
    expect(source).not.toContain('x-ipd-tenant-id: ');
    // The contract seam gained only the endpoint setting.
    const contract = sourceOf('./userPortfolioContract.ts');
    expect(contract).toContain("G2_IPC_ENDPOINT_SETTING = 'IIPS_G2_IPC_ENDPOINT'");
    expect(contract).not.toContain('IPC_TENANT_HINT');
    expect(contract).not.toContain('TENANT_HINT_TRANSMISSION');
  });
});
