/**
 * F-3 owner-context resolver — resolution lifecycle, validation and failure behaviour.
 *
 * This is the fail-closed evidence for the mechanism: every class of absent, malformed, invalid or
 * integrity-tampered carrier yields NO owner context, and the successful class yields exactly the
 * approved pair and nothing else.
 *
 * @vitest-environment node
 */
import { describe, it, expect, afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';

import {
  APPROVED_OWNER_USER_ID,
  APPROVED_TENANT_ID,
  CANONICAL_CARRIER_TEXT,
  OWNER_CONTEXT_CARRIER_FILENAME,
  OWNER_CONTEXT_CARRIER_SHA256,
  materialiseOwnerContextCarrier,
} from './owner-context-carrier';
import {
  OWNER_CONTEXT_MAX_CARRIER_BYTES,
  OWNER_CONTEXT_MAX_VALUE_LENGTH,
  OWNER_CONTEXT_PATH_ENV,
  evaluateOwnerContext,
  ownerContextCarrierPath,
  resolveOwnerContext,
  validateCarrierBytes,
} from './owner-context-resolver';

const temporaryDirs: string[] = [];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-owner-resolver-'));
  temporaryDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

/** Environment carrying a materialised carrier in a fresh temporary directory. */
function envWithCarrier(): NodeJS.ProcessEnv {
  const target = materialiseOwnerContextCarrier(tempDir());
  return { [OWNER_CONTEXT_PATH_ENV]: target };
}

/** Digest of an arbitrary synthetic document, for exercising gate 2 independently of gate 1. */
function digestOf(text: string): string {
  return createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}

/** A structurally valid synthetic carrier text with an override applied. */
function synthetic(overrides: Record<string, unknown> = {}): string {
  const base = {
    carrierSchemaVersion: 1,
    ownerUserId: APPROVED_OWNER_USER_ID,
    tenantId: APPROVED_TENANT_ID,
    governedBy: {
      recordId: 'IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01',
      recordPath: 'docs/integration/IIPS_v3.0_OWNER_CONTEXT_F1_F2_VALUE_ACT.md',
      recordBlob: 'f90c9325f49d33f378f3fc0936c28f4979164b2e',
      decisionDate: '2026-10-12',
    },
    ...overrides,
  };
  return `${JSON.stringify(base, null, 2)}\n`;
}

describe('F-3 resolver — path seam', () => {
  it('reads only the server-owned environment variable and never defaults', () => {
    expect(ownerContextCarrierPath({})).toBeNull();
    expect(ownerContextCarrierPath({ [OWNER_CONTEXT_PATH_ENV]: '' })).toBeNull();
    expect(ownerContextCarrierPath({ [OWNER_CONTEXT_PATH_ENV]: '/tmp/x.json' })).toBe('/tmp/x.json');
    // A request-shaped environment is irrelevant: nothing else is consulted.
    expect(ownerContextCarrierPath({ tenantId: 'x', ownerUserId: 'y' })).toBeNull();
  });
});

describe('F-3 resolver — absent and unreadable carrier (fail closed)', () => {
  it('returns no context when the seam is not configured', () => {
    expect(evaluateOwnerContext({})).toEqual({
      ok: false,
      reason: 'path-not-configured',
      context: null,
    });
    expect(resolveOwnerContext({})).toBeNull();
  });

  it('returns no context when the carrier file does not exist', () => {
    const env = { [OWNER_CONTEXT_PATH_ENV]: path.join(tempDir(), 'absent.json') };
    expect(evaluateOwnerContext(env).reason).toBe('carrier-unreadable');
    expect(resolveOwnerContext(env)).toBeNull();
  });

  it('returns no context when the path addresses a directory', () => {
    const env = { [OWNER_CONTEXT_PATH_ENV]: tempDir() };
    expect(evaluateOwnerContext(env).reason).toBe('carrier-unreadable');
    expect(resolveOwnerContext(env)).toBeNull();
  });

  it('returns no context for an empty file', () => {
    const dir = tempDir();
    const target = path.join(dir, OWNER_CONTEXT_CARRIER_FILENAME);
    fs.writeFileSync(target, '');
    expect(evaluateOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target }).reason).toBe('carrier-empty');
    expect(resolveOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target })).toBeNull();
  });

  it('returns no context for an oversized file (malformed-input limit)', () => {
    const dir = tempDir();
    const target = path.join(dir, OWNER_CONTEXT_CARRIER_FILENAME);
    fs.writeFileSync(target, 'x'.repeat(OWNER_CONTEXT_MAX_CARRIER_BYTES + 1));
    expect(evaluateOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target }).reason).toBe('carrier-too-large');
    expect(resolveOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target })).toBeNull();
  });
});

describe('F-3 resolver — integrity binding (gate 1)', () => {
  it('rejects a value edit carried out in place in the local carrier', () => {
    const target = materialiseOwnerContextCarrier(tempDir());
    fs.writeFileSync(target, CANONICAL_CARRIER_TEXT.replace(APPROVED_TENANT_ID, 'irr-domain-99999999'));
    expect(evaluateOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target }).reason).toBe('integrity-mismatch');
    expect(resolveOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target })).toBeNull();
  });

  it('rejects a semantically identical but non-canonical reformat', () => {
    const target = materialiseOwnerContextCarrier(tempDir());
    const reformatted = `${JSON.stringify(JSON.parse(CANONICAL_CARRIER_TEXT))}\n`;
    expect(reformatted).not.toBe(CANONICAL_CARRIER_TEXT);
    fs.writeFileSync(target, reformatted);
    expect(evaluateOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target }).reason).toBe('integrity-mismatch');
    expect(resolveOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target })).toBeNull();
  });

  it('rejects whitespace-only deviations such as a doubled trailing newline', () => {
    const target = materialiseOwnerContextCarrier(tempDir());
    fs.writeFileSync(target, `${CANONICAL_CARRIER_TEXT}\n`);
    expect(evaluateOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target }).reason).toBe('integrity-mismatch');
    expect(resolveOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target })).toBeNull();
  });

  it('rejects a doc-comment style JSON edit that keeps the same key order', () => {
    const target = materialiseOwnerContextCarrier(tempDir());
    fs.writeFileSync(target, CANONICAL_CARRIER_TEXT.replace('  "tenantId"', '   "tenantId"'));
    expect(resolveOwnerContext({ [OWNER_CONTEXT_PATH_ENV]: target })).toBeNull();
  });

  it('accepts exactly the canonical bytes', () => {
    const env = envWithCarrier();
    const resolution = evaluateOwnerContext(env);
    expect(resolution.ok).toBe(true);
    expect(resolution.reason).toBe('ok');
  });
});

describe('F-3 resolver — grammar, audit trail and value gate (gate 2)', () => {
  it('rejects a document that is not JSON', () => {
    expect(validateCarrierBytes(Buffer.from('not json\n'), digestOf('not json\n')).reason).toBe('malformed-json');
  });

  it('rejects a JSON document that is not an object', () => {
    const text = '[]\n';
    expect(validateCarrierBytes(Buffer.from(text), digestOf(text)).reason).toBe('malformed-grammar');
  });

  it('rejects an unexpected extra key', () => {
    const text = synthetic({ extra: 'x' });
    expect(validateCarrierBytes(Buffer.from(text), digestOf(text)).reason).toBe('malformed-grammar');
  });

  it('rejects a missing key', () => {
    const text = '{\n  "carrierSchemaVersion": 1\n}\n';
    expect(validateCarrierBytes(Buffer.from(text), digestOf(text)).reason).toBe('malformed-grammar');
  });

  it('rejects an unsupported carrier schema version', () => {
    const text = synthetic({ carrierSchemaVersion: 2 });
    expect(validateCarrierBytes(Buffer.from(text), digestOf(text)).reason).toBe('malformed-grammar');
  });

  it('rejects a non-string, empty or NUL-bearing partition value', () => {
    for (const bad of [123, '', 'bad\u0000value', 'x'.repeat(OWNER_CONTEXT_MAX_VALUE_LENGTH + 1)]) {
      const text = synthetic({ ownerUserId: bad });
      expect(validateCarrierBytes(Buffer.from(text), digestOf(text)).reason).toBe('malformed-grammar');
    }
  });

  it('rejects a missing or malformed audit-trail block', () => {
    for (const bad of [undefined, 'x', [], { recordId: 'other' }]) {
      const text = synthetic({ governedBy: bad });
      expect(validateCarrierBytes(Buffer.from(text), digestOf(text)).reason).toBe('malformed-grammar');
    }
  });

  it('rejects an audit-trail block naming a different governing record', () => {
    const text = synthetic({
      governedBy: {
        recordId: 'IIPS-V3-SOME-OTHER-RECORD',
        recordPath: 'docs/integration/other.md',
        recordBlob: 'x',
        decisionDate: '2026-10-12',
      },
    });
    expect(validateCarrierBytes(Buffer.from(text), digestOf(text)).reason).toBe('malformed-grammar');
  });

  it('rejects a well-formed carrier proposing a different owner or tenant (invalid-value)', () => {
    for (const overrides of [{ ownerUserId: 'owner-00000000' }, { tenantId: 'irr-domain-00000000' }]) {
      const text = synthetic(overrides);
      expect(validateCarrierBytes(Buffer.from(text), digestOf(text)).reason).toBe('invalid-value');
      expect(validateCarrierBytes(Buffer.from(text), digestOf(text)).context).toBeNull();
    }
  });

  it('cannot return any pair other than the approved one, even for a self-consistent carrier', () => {
    const text = synthetic({ ownerUserId: 'owner-deadbeef', tenantId: 'irr-domain-deadbeef' });
    const result = validateCarrierBytes(Buffer.from(text), digestOf(text));
    expect(result.ok).toBe(false);
    expect(result.context).toBeNull();
  });
});

describe('F-3 resolver — successful resolution', () => {
  it('returns exactly the approved pair and nothing else', () => {
    const env = envWithCarrier();
    const context = resolveOwnerContext(env);
    expect(context).toEqual({ tenantId: APPROVED_TENANT_ID, ownerUserId: APPROVED_OWNER_USER_ID });
    expect(Object.keys(context as object).sort()).toEqual(['ownerUserId', 'tenantId']);
    expect(Object.isFrozen(context)).toBe(true);
  });

  it('is uncached: each attempt re-reads the carrier, so tampering takes effect immediately', () => {
    const env = envWithCarrier();
    expect(resolveOwnerContext(env)).not.toBeNull();
    fs.writeFileSync(env[OWNER_CONTEXT_PATH_ENV] as string, 'stale\n');
    expect(resolveOwnerContext(env)).toBeNull();
  });

  it('is uncached: recovery takes effect immediately without a restart', () => {
    const target = materialiseOwnerContextCarrier(tempDir());
    const env = { [OWNER_CONTEXT_PATH_ENV]: target };
    fs.writeFileSync(target, 'broken\n');
    expect(resolveOwnerContext(env)).toBeNull();
    materialiseOwnerContextCarrier(path.dirname(target));
    expect(resolveOwnerContext(env)).not.toBeNull();
    expect(resolveOwnerContext(env)?.tenantId).toBe(APPROVED_TENANT_ID);
  });

  it('never consults a request-shaped environment or the process environment by accident', () => {
    // The default parameter is `process.env`; an explicitly scoped environment is fully isolated.
    const poisoned: NodeJS.ProcessEnv = { ...process.env, ownerUserId: 'owner-attacker' };
    expect(resolveOwnerContext(poisoned)).toBeNull();
  });
});

describe('F-3 resolver — carrier digest is bound to the pinned constant', () => {
  it('accepts the canonical bytes and rejects the same document under a different expectation', () => {
    const bytes = Buffer.from(CANONICAL_CARRIER_TEXT, 'utf8');
    expect(validateCarrierBytes(bytes, OWNER_CONTEXT_CARRIER_SHA256).ok).toBe(true);
    expect(validateCarrierBytes(bytes, digestOf('other')).reason).toBe('integrity-mismatch');
  });
});
