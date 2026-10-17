/**
 * Gate B — owner context sourced from the provisioned same-host IPC endpoint binding.
 *
 * Covers the amended DP-1 source attribution: server-owned input only, no default, no inference,
 * a tenant hint that remains a hint and fails closed, and per-call resolution (no stale cache).
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import {
  G2_BINDING_MAX_TENANT_HINT_LENGTH,
  G2_IPC_ENDPOINT_ENV,
  G2_IPC_TENANT_HINT_ENV,
  G2_OWNER_CONTEXT_SOURCE,
  isValidTenantHint,
  resolveOwnerContextFromBinding,
} from './ownerContextFromBinding.js';
import { IPC_PIPE_PREFIX } from './ipcClient.js';

const VALID = Object.freeze({
  [G2_IPC_ENDPOINT_ENV]: '/run/iips/g2-ipd.sock',
  [G2_IPC_TENANT_HINT_ENV]: 'irr-domain-4b82d6e1',
});

describe('Gate B — owner context from the IPC endpoint binding', () => {
  it('resolves a complete provisioned binding and labels its source', () => {
    const resolution = resolveOwnerContextFromBinding(VALID);

    expect(resolution.ok).toBe(true);
    if (!resolution.ok) throw new Error('expected an owner context');
    expect(resolution.context.source).toBe(G2_OWNER_CONTEXT_SOURCE);
    expect(resolution.context.endpoint).toEqual({ kind: 'unix', path: '/run/iips/g2-ipd.sock' });
    expect(resolution.context.scope).toEqual({ tenantHint: 'irr-domain-4b82d6e1' });
    expect(Object.isFrozen(resolution.context)).toBe(true);
    expect(Object.isFrozen(resolution.context.scope)).toBe(true);
  });

  it('accepts a named pipe endpoint', () => {
    const resolution = resolveOwnerContextFromBinding({
      ...VALID,
      [G2_IPC_ENDPOINT_ENV]: `${IPC_PIPE_PREFIX}iips-g2-ipd`,
    });

    expect(resolution.ok).toBe(true);
    if (!resolution.ok) throw new Error('expected an owner context');
    expect(resolution.context.endpoint.kind).toBe('pipe');
  });

  it('fails closed when the binding is absent or blank — never a default', () => {
    expect(resolveOwnerContextFromBinding({})).toEqual({ ok: false, reason: 'binding-not-configured' });
    expect(resolveOwnerContextFromBinding({ [G2_IPC_ENDPOINT_ENV]: '   ', [G2_IPC_TENANT_HINT_ENV]: 't' }))
      .toEqual({ ok: false, reason: 'binding-not-configured' });
    expect(resolveOwnerContextFromBinding({ [G2_IPC_ENDPOINT_ENV]: '/run/a.sock' }))
      .toEqual({ ok: false, reason: 'binding-not-configured' });
    expect(resolveOwnerContextFromBinding({ [G2_IPC_TENANT_HINT_ENV]: 't' }))
      .toEqual({ ok: false, reason: 'binding-not-configured' });
  });

  it('fails closed on an endpoint that is not a same-host pipe or absolute socket', () => {
    for (const endpoint of ['relative.sock', '127.0.0.1:9000', 'http://127.0.0.1:9000/', '', `${IPC_PIPE_PREFIX}`]) {
      expect(resolveOwnerContextFromBinding({ ...VALID, [G2_IPC_ENDPOINT_ENV]: endpoint }))
        .toEqual({ ok: false, reason: endpoint === '' ? 'binding-not-configured' : 'binding-endpoint-invalid' });
    }
  });

  it('fails closed on a padded, oversized or control-character tenant hint', () => {
    const invalidHints = [
      ' irr-domain',
      'irr-domain ',
      'a'.repeat(G2_BINDING_MAX_TENANT_HINT_LENGTH + 1),
      'irr\u0000domain',
      '   ',
    ];
    for (const hint of invalidHints) {
      const resolution = resolveOwnerContextFromBinding({ ...VALID, [G2_IPC_TENANT_HINT_ENV]: hint });
      expect(resolution.ok).toBe(false);
      if (resolution.ok) continue;
      expect(resolution.reason).toBe(hint.trim().length === 0 ? 'binding-not-configured' : 'binding-tenant-hint-invalid');
    }
  });

  it('never derives the tenant hint from the endpoint path', () => {
    const resolution = resolveOwnerContextFromBinding({
      [G2_IPC_ENDPOINT_ENV]: `${IPC_PIPE_PREFIX}tenant-hint`,
      [G2_IPC_TENANT_HINT_ENV]: 'irr-domain-4b82d6e1',
    });

    expect(resolution.ok).toBe(true);
    if (!resolution.ok) throw new Error('expected an owner context');
    expect(resolution.context.scope.tenantHint).not.toContain(IPC_PIPE_PREFIX);
    expect(resolution.context.scope.tenantHint).not.toBe(resolution.context.endpoint.path);
  });

  it('resolves per call — a changed or revoked binding takes effect immediately', () => {
    const first = resolveOwnerContextFromBinding(VALID);
    const second = resolveOwnerContextFromBinding({ ...VALID, [G2_IPC_TENANT_HINT_ENV]: 'irr-domain-revoked' });
    const third = resolveOwnerContextFromBinding({});

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!second.ok) throw new Error('expected an owner context');
    expect(second.context.scope.tenantHint).toBe('irr-domain-revoked');
    expect(third).toEqual({ ok: false, reason: 'binding-not-configured' });
  });

  it('classifies tenant hints strictly', () => {
    expect(isValidTenantHint('irr-domain-4b82d6e1')).toBe(true);
    expect(isValidTenantHint(' irr-domain-4b82d6e1')).toBe(false);
    expect(isValidTenantHint('')).toBe(false);
    expect(isValidTenantHint('a'.repeat(G2_BINDING_MAX_TENANT_HINT_LENGTH))).toBe(true);
    expect(isValidTenantHint('a'.repeat(G2_BINDING_MAX_TENANT_HINT_LENGTH + 1))).toBe(false);
    expect(isValidTenantHint(undefined)).toBe(false);
  });
});
