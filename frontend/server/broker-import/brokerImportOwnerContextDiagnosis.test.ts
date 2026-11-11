/**
 * CAP-02 broker import — why `owner-context-unavailable` was returned, and whether
 * that response is the correct one.
 *
 * This file exists because the route answers ONE opaque body for three different
 * conditions. These tests pin, for each condition:
 *
 *   - WHICH layer rejects it;
 *   - whether an IPC call is made at all;
 *   - the exact status and error code the browser receives;
 *   - and — after this change — the classified cause the operator's log records.
 *
 * The classification is a SERVER-LOG concern only. Every test below also asserts
 * that the HTTP response is byte-for-byte the same opaque body as before, so no
 * change here can leak a reason to the browser.
 *
 * Simulation boundary: these tests inject `callIpc` and `env`. They prove IRR's
 * behaviour for each condition. They say nothing about which condition the
 * operator's host is actually in — that is what the Windows script reports.
 *
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { handleBrokerImportRequest } from './brokerImportHttp.js';
import { OWNER_CONTEXT_UNAVAILABLE } from '../owner-context-unavailable.js';
import { IpcClientError, IpcWireAuthorityError, type IpcCallResult, type IpcOperation } from '../user-portfolio/ipcClient.js';
import { classifyLocalIpcRefusal } from './brokerImportOwnerContextDiagnosis.js';
import { IPC_REQUEST_MAX_BYTES, resolveIpcEndpoint } from '../user-portfolio/ipcClient.js';

const DIGEST = 'c'.repeat(64);
const LINEAGE = 'd'.repeat(64);
const HOLDINGS_PATH = '/api/broker-import/E2E_SYNTHETIC/holdings';
const REVISION_PATH = '/api/broker-import/DEFAULT_PORTFOLIO/revision';

/** The real Stage 4 body the browser sends: provenance, no owner, no identity claim. */
function stage4Body(overrides: Record<string, unknown> = {}) {
  return {
    expectedRevision: 0,
    mode: 'MERGE',
    holdings: [{
      symbol: 'INFY',
      isin: 'INE009A01021',
      exchange: 'NSE',
      quantity: 5,
      averageBuyPrice: 1500,
      currentPrice: 1600,
      marketValue: 8000,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'DHAN',
      lineageDigest: LINEAGE,
    }],
    contentDigest: DIGEST,
    fileName: 'synthetic-infy.csv',
    sourceBroker: 'DHAN',
    importedAt: '2026-11-08T09:15:00.000Z',
    ...overrides,
  };
}

function committed(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    disposition: 'SAVED_NEW_BATCH',
    revision: 1,
    noOp: false,
    storeEffect: 'REVISION_COMMITTED',
    holdingsPersisted: 1,
    totalMarketValue: 8000,
    contributions: 1,
    message: 'The import was committed as a new batch.',
    ...overrides,
  };
}

const openServers: http.Server[] = [];
const warnings: string[] = [];

beforeEach(() => {
  warnings.length = 0;
  vi.spyOn(console, 'warn').mockImplementation((line: unknown) => { warnings.push(String(line)); });
});
afterEach(() => {
  while (openServers.length > 0) openServers.pop()?.close();
  vi.restoreAllMocks();
});

interface Handled {
  readonly status: number;
  readonly json: Record<string, unknown> | null;
  readonly calls: readonly { op: IpcOperation; payload: Record<string, unknown> | undefined }[];
  readonly log: readonly string[];
}

async function callCommit(options: {
  readonly ipc?: IpcCallResult | Error;
  readonly env?: NodeJS.ProcessEnv;
} = {}): Promise<Handled> {
  return call(HOLDINGS_PATH, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1', 'sec-fetch-site': 'same-origin' },
    body: JSON.stringify(stage4Body()),
  }, options);
}

async function callRevision(options: {
  readonly ipc?: IpcCallResult | Error;
  readonly env?: NodeJS.ProcessEnv;
} = {}): Promise<Handled> {
  return call(REVISION_PATH, {
    method: 'GET',
    headers: { origin: 'http://127.0.0.1', 'sec-fetch-site': 'same-origin' },
  }, options);
}

async function call(
  path: string,
  init: { method: string; headers?: Record<string, string>; body?: string },
  options: { readonly ipc?: IpcCallResult | Error; readonly env?: NodeJS.ProcessEnv },
): Promise<Handled> {
  const calls: { op: IpcOperation; payload: Record<string, unknown> | undefined }[] = [];
  const deps = {
    env: options.env ?? ({ IIPS_G3_IPC_BINDING_PROVISIONED: 'true' } as NodeJS.ProcessEnv),
    identityQualification: () => ({ admitted: true as const }),
    saveAdapterDeps: {
      callIpc: (async (op: IpcOperation, payload: Record<string, unknown> | undefined) => {
        calls.push({ op, payload });
        if (options.ipc instanceof Error) throw options.ipc;
        if (options.ipc === undefined) return { kind: 'OUTCOME_UNKNOWN', write: true, reason: 'timeout' } as unknown as IpcCallResult;
        return options.ipc;
      }) as never,
    },
  };
  const server = http.createServer((req, res) => { void handleBrokerImportRequest(req, res, deps); });
  openServers.push(server);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as AddressInfo).port;
  const response = await fetch(`http://127.0.0.1:${port}${path}`, init as RequestInit);
  const text = await response.text();
  let json: Record<string, unknown> | null = null;
  try { json = JSON.parse(text) as Record<string, unknown>; } catch { json = null; }
  return {
    status: response.status,
    json,
    calls,
    log: [...warnings],
  };
}

const successFrame = (result: unknown): IpcCallResult =>
  ({ kind: 'SUCCESS', frame: { v: 1, ok: true, op: 'portfolio.importBroker', result }, bytesReceived: 200 } as unknown as IpcCallResult);
const classP = (): IpcCallResult =>
  ({ kind: 'CLASS_P', bytesReceived: 0 } as unknown as IpcCallResult);
const classA = (outcome: string): IpcCallResult =>
  ({ kind: 'CLASS_A', frame: { v: 1, ok: false, op: 'portfolio.importBroker', outcome }, bytesReceived: 80 } as unknown as IpcCallResult);

/** The browser-visible response for every `owner-context-unavailable` case is identical. */
function expectOpaqueOwnerContext(handled: Handled): void {
  expect(handled.status).toBe(503);
  expect(handled.json).toEqual(OWNER_CONTEXT_UNAVAILABLE);
}

/** Drives the legacy `portfolio.save` adapter branch of the same route. */
async function callLegacy(options: {
  readonly ipc?: IpcCallResult | Error;
  readonly env?: NodeJS.ProcessEnv;
} = {}): Promise<Handled> {
  return call(
    HOLDINGS_PATH,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1', 'sec-fetch-site': 'same-origin' },
      // No `fileName` / `sourceBroker` / `importedAt`: `isStage4Body` routes this
      // to the legacy `portfolio.save` adapter, and the legacy DTO key set admits
      // no provenance field at all.
      body: JSON.stringify({
        expectedRevision: 0,
        mode: 'MERGE',
        holdings: [{
          symbol: 'RELIANCE',
          isin: 'INE002A01018',
          exchange: 'NSE',
          quantity: 10,
          averageBuyPrice: 1400,
          currentPrice: 1500,
          marketValue: 15000,
        }],
      }),
    },
    options,
  );
}

/* ------------------------------------------------------------------ *
 * 1. The happy path — a valid owner context reaches IPD dispatch
 * ------------------------------------------------------------------ */

describe('case 12 — a valid owner context reaches portfolio.importBroker dispatch', () => {
  it('commits: one IPC call, IPD’s receipt relayed, no owner-context log line', async () => {
    const handled = await callCommit({ ipc: successFrame(committed()) });
    expect(handled.status).toBe(200);
    expect(handled.calls).toHaveLength(1);
    expect(handled.calls[0].op).toBe('portfolio.importBroker');
    expect(handled.json).toEqual(committed());
    expect(handled.log).toEqual([]);
  });

  it('the payload carries provenance and no owner, tenant or canonical-identity claim', async () => {
    const handled = await callCommit({ ipc: successFrame(committed()) });
    const wire = JSON.stringify(handled.calls[0].payload);
    expect(wire).toContain(DIGEST);
    expect(wire).not.toMatch(/ownerUserId|tenantId|canonicalOwnerId|companyId|identityStatus|securityId/);
  });
});

/* ------------------------------------------------------------------ *
 * 2. The three conditions that produce the SAME opaque 503
 * ------------------------------------------------------------------ */

describe('the three conditions behind one opaque response', () => {
  it('case 7 — binding flag false: rejected BEFORE IPC, logged as owner-precondition-not-established', async () => {
    const handled = await callCommit({ env: { IIPS_G3_IPC_BINDING_PROVISIONED: 'false' } as NodeJS.ProcessEnv });
    expectOpaqueOwnerContext(handled);
    expect(handled.calls).toHaveLength(0);
    expect(handled.log.join('\n')).toContain('cause=owner-precondition-not-established');
  });

  it('case 7b — binding flag absent entirely: same rejection, same log', async () => {
    const handled = await callCommit({ env: {} as NodeJS.ProcessEnv });
    expectOpaqueOwnerContext(handled);
    expect(handled.calls).toHaveLength(0);
    expect(handled.log.join('\n')).toContain('cause=owner-precondition-not-established');
  });

  it('case 2/3/4/5/6/8 — a LOCAL pre-send refusal is reported as owner-context but logged as ipc-local-refusal', async () => {
    // Endpoint not configured: the most common local cause, and the one the old
    // log could not distinguish from an IPD refusal.
    const handled = await callCommit({ ipc: new IpcClientError('ENDPOINT_NOT_CONFIGURED', 'IIPS_G2_IPC_ENDPOINT is not set') });
    expectOpaqueOwnerContext(handled);
    // The call was attempted: the refusal happens inside the client, before the socket.
    expect(handled.calls).toHaveLength(1);
    expect(handled.log.join('\n')).toContain('cause=ipc-local-refusal');
    expect(handled.log.join('\n')).toContain('local-refusal=ENDPOINT_NOT_CONFIGURED');
    // The configured value and the message text never reach the log.
    expect(handled.log.join('\n')).not.toContain('IIPS_G2_IPC_ENDPOINT is not set');
  });

  it('case 9/10 — IPD Class P (connected, zero bytes) is reported as owner-context and logged as ipc-class-p-refusal', async () => {
    const handled = await callCommit({ ipc: classP() });
    expectOpaqueOwnerContext(handled);
    expect(handled.calls).toHaveLength(1);
    expect(handled.log.join('\n')).toContain('cause=ipc-class-p-refusal');
    expect(handled.log.join('\n')).not.toContain('ipc-local-refusal');
  });

  it('a lost or unusable acknowledgement is NOT reported as owner-context', async () => {
    // OUTCOME_UNKNOWN has its own response; it must never be relabelled owner-context,
    // because the write may have committed.
    const handled = await callCommit({ ipc: { kind: 'OUTCOME_UNKNOWN', write: true, reason: 'timeout' } as unknown as IpcCallResult });
    expect(handled.status).toBe(503);
    expect(handled.json).toEqual({ outcome: 'OUTCOME_UNKNOWN', retried: false });
    expect(handled.log).toEqual([]);
  });

  it('case 11 — an IPD refusal WITH a frame is relayed by its own code, never as owner-context', async () => {
    const handled = await callCommit({ ipc: classA('WRITE_NOT_AUTHORIZED') });
    expect(handled.status).toBe(503);
    expect(handled.json).toEqual({ outcome: 'WRITE_NOT_AUTHORIZED', storeEffect: 'NONE' });
    expect(handled.log).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * 3. The revision read — the same three conditions, same discipline
 * ------------------------------------------------------------------ */

describe('the revision read reports the same way', () => {
  it('a local refusal on the read path is logged, not invented as an owner condition', async () => {
    const handled = await callRevision({ ipc: new IpcClientError('ENDPOINT_NOT_CONFIGURED', 'no endpoint') });
    expectOpaqueOwnerContext(handled);
    expect(handled.log.join('\n')).toContain('stage=revision-read');
    expect(handled.log.join('\n')).toContain('local-refusal=ENDPOINT_NOT_CONFIGURED');
  });

  it('Class P on the read path is logged as ipc-class-p-refusal', async () => {
    const handled = await callRevision({ ipc: classP() });
    expectOpaqueOwnerContext(handled);
    expect(handled.log.join('\n')).toContain('cause=ipc-class-p-refusal');
  });
});

/* ------------------------------------------------------------------ *
 * 4. The classifier itself: closed vocabulary, never a message
 * ------------------------------------------------------------------ */

describe('classifyLocalIpcRefusal', () => {
  it('maps every local client error kind onto the closed logging vocabulary', () => {
    const cases: ReadonlyArray<readonly [string, string]> = [
      ['ENDPOINT_NOT_CONFIGURED', 'ENDPOINT_NOT_CONFIGURED'],
      ['REQUEST_OVERSIZE', 'REQUEST_OVERSIZE'],
      ['MALFORMED_ENVELOPE', 'MALFORMED_ENVELOPE'],
      ['UNKNOWN_OPERATION', 'UNKNOWN_OPERATION'],
      ['TRANSPORT_FAULT', 'TRANSPORT_FAULT'],
      ['RESPONSE_OVERSIZE', 'TRANSPORT_FAULT'],
      ['CALLER_SUPPLIED_AUTHORITY', 'REQUEST_REFUSED'],
    ];
    for (const [kind, expected] of cases) {
      expect(classifyLocalIpcRefusal(new IpcClientError(kind as never, 'message text')), kind).toBe(expected);
    }
  });

  it('records an unrecognised error as unclassified and never logs its message', () => {
    expect(classifyLocalIpcRefusal(new Error('socket hang up at /secret/path'))).toBe('unclassified-local-refusal');
    expect(classifyLocalIpcRefusal(undefined)).toBe('unclassified-local-refusal');
    expect(classifyLocalIpcRefusal(new IpcWireAuthorityError(['tenantId']))).toBe('REQUEST_REFUSED');
  });

  it('a refused authority key on the wire is logged as a category, with no key value', async () => {
    const handled = await callCommit({ ipc: new IpcWireAuthorityError(['ownerUserId']) });
    expectOpaqueOwnerContext(handled);
    expect(handled.log.join('\n')).toContain('local-refusal=REQUEST_REFUSED');
    expect(handled.log.join('\n')).not.toContain('ownerUserId');
  });
});

/* ------------------------------------------------------------------ *
 * 5. Non-disclosure: the response body never gains a reason
 * ------------------------------------------------------------------ */

describe('non-disclosure is preserved', () => {
  it('the opaque body is identical across all three causes', async () => {
    const precondition = await callCommit({ env: {} as NodeJS.ProcessEnv });
    const local = await callCommit({ ipc: new IpcClientError('ENDPOINT_NOT_CONFIGURED', 'no endpoint') });
    const remote = await callCommit({ ipc: classP() });
    expect(local.json).toEqual(precondition.json);
    expect(remote.json).toEqual(precondition.json);
    // The body carries no cause, no code and no stage.
    for (const body of [precondition, local, remote]) {
      expect(JSON.stringify(body.json)).not.toMatch(/endpoint|class-p|precondition|local-refusal/i);
    }
  });
});

/* ------------------------------------------------------------------ *
 * 6. Windows endpoint and payload size — two local causes that CAN be
 *    eliminated in the sandbox without the operator's host.
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * 7. The legacy `portfolio.save` adapter path is classified too.
 *    It is refused by the identity-qualification gate before it can carry a
 *    broker-observed write, but it still emits the same opaque 503 on a local
 *    refusal or an IPD Class P. The stage name keeps the operator from being
 *    told a Stage-4 cause for a legacy-path response.
 * ------------------------------------------------------------------ */

describe('the legacy portfolio.save adapter path is classified as its own stage', () => {
  it('a local refusal on the legacy path is logged as stage=legacy-commit', async () => {
    const handled = await callLegacy({ ipc: new IpcClientError('ENDPOINT_NOT_CONFIGURED', 'no endpoint') });
    expectOpaqueOwnerContext(handled);
    expect(handled.log.join('\n')).toContain('stage=legacy-commit');
    expect(handled.log.join('\n')).toContain('local-refusal=ENDPOINT_NOT_CONFIGURED');
  });

  it('Class P on the legacy path is logged as stage=legacy-commit, cause=ipc-class-p-refusal', async () => {
    const handled = await callLegacy({ ipc: classP() });
    expectOpaqueOwnerContext(handled);
    expect(handled.log.join('\n')).toContain('stage=legacy-commit');
    expect(handled.log.join('\n')).toContain('cause=ipc-class-p-refusal');
  });
});

describe('Windows named-pipe endpoint resolution (simulated win32)', () => {
  /**
   * `resolveIpcEndpoint` takes the target platform explicitly so a Windows shape is
   * validated by Windows rules even when exercised here. This is a SIMULATION: it
   * proves the operator's configured value is accepted by IRR's own resolver, which
   * removes "endpoint format rejected" from the candidate list.
   */
  it('accepts the operator’s named-pipe value on win32', () => {
    const target = resolveIpcEndpoint(
      { IIPS_G2_IPC_ENDPOINT: '\\\\.\\pipe\\iips-user-portfolio-v1' } as NodeJS.ProcessEnv,
      'win32',
    );
    expect(target).toEqual({
      kind: 'windows-named-pipe',
      path: '\\\\.\\pipe\\iips-user-portfolio-v1',
      source: 'absolute-path',
    });
  });

  it('accepts the bare pipe name when a state directory is configured', () => {
    const target = resolveIpcEndpoint(
      {
        IIPS_G2_IPC_ENDPOINT: 'iips-user-portfolio-v1',
        IIPS_G3_LOCAL_STATE_DIR: 'C:\\iips-data\\state',
      } as NodeJS.ProcessEnv,
      'win32',
    );
    expect(target.kind).toBe('windows-named-pipe');
    expect(target.path).toBe('\\\\.\\pipe\\iips-user-portfolio-v1');
  });

  it('refuses a missing endpoint, a bare name with no state directory, and a pipe value on POSIX', () => {
    const refused: ReadonlyArray<readonly [NodeJS.ProcessEnv, NodeJS.Platform]> = [
      [{} as NodeJS.ProcessEnv, 'win32'],
      [{ IIPS_G2_IPC_ENDPOINT: 'iips-user-portfolio-v1' } as NodeJS.ProcessEnv, 'win32'],
      [{ IIPS_G2_IPC_ENDPOINT: '\\\\.\\pipe\\iips-user-portfolio-v1' } as NodeJS.ProcessEnv, 'linux'],
      [{ IIPS_G2_IPC_ENDPOINT: 'https://example.test/ipc' } as NodeJS.ProcessEnv, 'win32'],
      [{ IIPS_G2_IPC_ENDPOINT: '127.0.0.1:8791' } as NodeJS.ProcessEnv, 'win32'],
    ];
    for (const [env, platform] of refused) {
      expect(() => resolveIpcEndpoint(env, platform), JSON.stringify(env)).toThrow();
      expect(classifyLocalIpcRefusal(caughtOf(() => resolveIpcEndpoint(env, platform))))
        .toBe('ENDPOINT_NOT_CONFIGURED');
    }
  });
});

describe('a 64-row Stage 4 request is not oversize', () => {
  it('the encoded request for 64 resolved rows stays under the 64 KiB cap', () => {
    const holdings = Array.from({ length: 64 }, (_unused, index) => ({
      symbol: `SYM${String(index)}`,
      isin: 'INE009A01021',
      exchange: 'NSE',
      quantity: 5,
      averageBuyPrice: 1500,
      currentPrice: 1600,
      marketValue: 8000,
      weightPercentage: 1.5625,
      active: true,
      sourceBroker: 'DHAN',
      lineageDigest: LINEAGE,
    }));
    const bytes = Buffer.byteLength(JSON.stringify({
      v: 1,
      op: 'portfolio.importBroker',
      payload: { portfolioId: 'DEFAULT_PORTFOLIO', ...stage4Body({ holdings }) },
      requestId: 'r',
    }), 'utf8');
    // Recorded, not assumed: a 64-row import is well inside the cap, so
    // REQUEST_OVERSIZE is not a plausible cause for this incident.
    expect(bytes).toBeLessThan(IPC_REQUEST_MAX_BYTES);
  });
});

function caughtOf(work: () => unknown): unknown {
  try { work(); return undefined; } catch (error) { return error; }
}
