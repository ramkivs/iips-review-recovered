/**
 * G-3 same-host IPC client tests.
 *
 * Authority: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.1 item 5.
 * Required observable result: **framing**, **caps**, **timeouts**, **no authority
 * fields on the wire**, and **no write retry**.
 *
 * Round-trip cases run against a real local UNIX-socket server created in an OS
 * temporary directory and removed afterwards. That server is a *test fixture*
 * standing in for IPD's endpoint; it is not part of the product, and IRR itself
 * creates no listener. Nothing is written inside the repository worktree.
 *
 * @vitest-environment node
 */
import { describe, it, expect, afterEach, afterAll } from 'vitest';
import net from 'node:net';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  callIpc,
  encodeRequestFrame,
  findRefusedWireKeys,
  findResponseDisclosedKeys,
  IPC_CALLER_IDENTITY_KEYS,
  IPC_CANONICAL_IDENTITY_KEYS,
  IPC_ENDPOINT_SETTING,
  IPC_LENGTH_PREFIX_BYTES,
  IPC_MAX_SCAN_DEPTH,
  IPC_OPERATIONS,
  IPC_PROTOCOL_VERSION,
  IPC_READ_OPERATIONS,
  IPC_REFUSED_WIRE_KEYS,
  IPC_REQUEST_MAX_BYTES,
  IPC_RESERVED_OPERATIONS,
  IPC_RESPONSE_MAX_BYTES,
  IPC_STATE_DIR_SETTING,
  IPC_TIMEOUT_MS,
  IPC_WRITE_OPERATIONS,
  IpcClientError,
  IpcWireAuthorityError,
  isWriteOperation,
  parseResponseFrame,
  resolveIpcEndpoint,
  type IpcEndpointTarget,
} from './ipcClient.js';

/* ------------------------------------------------------------------ *
 * Local test endpoint (fixture only — the product creates no listener)
 * ------------------------------------------------------------------ */

const tempDirs: string[] = [];
const openEndpoints: Array<{ close: () => Promise<void> }> = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'iips-g3-irr-ipc-'));
  tempDirs.push(dir);
  return dir;
}

interface TestEndpoint {
  readonly path: string;
  readonly target: IpcEndpointTarget;
  /** Number of connections accepted, so "nothing was sent" is provable. */
  connections(): number;
  close(): Promise<void>;
}

/** Builds one length-prefixed frame, exactly as contract v1 specifies. */
function frameOf(value: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(value), 'utf8');
  const prefix = Buffer.allocUnsafe(IPC_LENGTH_PREFIX_BYTES);
  prefix.writeUInt32BE(body.byteLength, 0);
  return Buffer.concat([prefix, body]);
}

/**
 * Starts a local socket that responds to the first request frame using `respond`.
 * `respond` receives the decoded request (or `null` when none arrived) and the
 * socket, and decides what — if anything — to write back.
 */
function startTestEndpoint(
  respond: (request: unknown, socket: net.Socket) => void,
): Promise<TestEndpoint> {
  return new Promise((resolveStart, rejectStart) => {
    const path = join(makeTempDir(), 'ipd-test.sock');
    let accepted = 0;
    const live: net.Socket[] = [];
    // `allowHalfOpen: true` lets the fixture accept a request and then say nothing,
    // which is what a timeout case needs. With Node's default (false) the server
    // auto-ends its side the moment the client half-closes, and a timeout would be
    // indistinguishable from a Class P refusal.
    const server = net.createServer({ allowHalfOpen: true }, (socket) => {
      accepted += 1;
      live.push(socket);
      const chunks: Buffer[] = [];
      socket.on('data', (chunk: Buffer) => chunks.push(chunk));
      socket.on('error', () => undefined);
      socket.on('end', () => {
        const buffer = Buffer.concat(chunks);
        let request: unknown = null;
        if (buffer.byteLength >= IPC_LENGTH_PREFIX_BYTES) {
          const declared = buffer.readUInt32BE(0);
          if (buffer.byteLength >= IPC_LENGTH_PREFIX_BYTES + declared) {
            try {
              request = JSON.parse(
                buffer.subarray(IPC_LENGTH_PREFIX_BYTES, IPC_LENGTH_PREFIX_BYTES + declared).toString('utf8'),
              );
            } catch {
              request = null;
            }
          }
        }
        try {
          respond(request, socket);
        } catch {
          socket.destroy();
        }
      });
    });
    server.once('error', (error: Error) => rejectStart(error));
    server.listen({ path }, () => {
      const endpoint: TestEndpoint = {
        path,
        target: { kind: 'unix-socket', path, source: 'absolute-path' },
        connections: () => accepted,
        close: () =>
          new Promise<void>((resolveClose) => {
            // Release any connection the fixture deliberately left open.
            for (const socket of live) socket.destroy();
            live.length = 0;
            server.close(() => resolveClose());
          }),
      };
      openEndpoints.push(endpoint);
      resolveStart(endpoint);
    });
  });
}

afterEach(async () => {
  while (openEndpoints.length > 0) {
    const endpoint = openEndpoints.pop();
    await endpoint?.close();
  }
});

afterAll(() => {
  // Every socket and store used above lives in an OS temporary directory; nothing is
  // written inside the repository worktree.
  for (const dir of tempDirs) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* best effort cleanup of a temporary directory */
    }
  }
});

/* ------------------------------------------------------------------ *
 * Contract v1 constants
 * ------------------------------------------------------------------ */

describe('ipcClient — contract v1 constants', () => {
  it('fixes the wire version, prefix width and both size caps', () => {
    expect(IPC_PROTOCOL_VERSION).toBe(1);
    expect(IPC_LENGTH_PREFIX_BYTES).toBe(4);
    expect(IPC_REQUEST_MAX_BYTES).toBe(64 * 1024);
    expect(IPC_RESPONSE_MAX_BYTES).toBe(256 * 1024);
    expect(IPC_TIMEOUT_MS).toBe(5_000);
    expect(IPC_ENDPOINT_SETTING).toBe('IIPS_G2_IPC_ENDPOINT');
  });

  it('fixes the closed operation set: three reads, four writes, one reserved', () => {
    expect([...IPC_READ_OPERATIONS].sort()).toEqual([
      'portfolio.get',
      'portfolio.list',
      'portfolio.revisions',
    ]);
    expect([...IPC_WRITE_OPERATIONS].sort()).toEqual([
      'portfolio.create',
      'portfolio.delete',
      'portfolio.reset',
      'portfolio.save',
    ]);
    expect(IPC_OPERATIONS).toHaveLength(7);
    expect([...IPC_RESERVED_OPERATIONS]).toEqual(['portfolio.analytics']);
    expect(IPC_OPERATIONS).not.toContain('portfolio.analytics');
    for (const op of IPC_WRITE_OPERATIONS) expect(isWriteOperation(op)).toBe(true);
    for (const op of IPC_READ_OPERATIONS) expect(isWriteOperation(op)).toBe(false);
  });

  it('refuses the reserved analytics operation locally rather than sending it', () => {
    expect(() =>
      encodeRequestFrame({ v: 1, op: 'portfolio.analytics' } as never),
    ).toThrow(IpcClientError);
    try {
      encodeRequestFrame({ v: 1, op: 'portfolio.analytics' } as never);
    } catch (error) {
      expect((error as IpcClientError).kind).toBe('UNKNOWN_OPERATION');
    }
  });
});

/* ------------------------------------------------------------------ *
 * Framing
 * ------------------------------------------------------------------ */

describe('ipcClient — framing', () => {
  it('encodes uint32 big-endian length + UTF-8 JSON of exactly v/op/payload/requestId', () => {
    const encoded = encodeRequestFrame({
      v: 1,
      op: 'portfolio.get',
      payload: { portfolioId: 'p-1' },
      requestId: 'corr-1',
    });
    const declared = encoded.readUInt32BE(0);
    expect(declared).toBe(encoded.byteLength - IPC_LENGTH_PREFIX_BYTES);
    expect(JSON.parse(encoded.subarray(IPC_LENGTH_PREFIX_BYTES).toString('utf8'))).toEqual({
      v: 1,
      op: 'portfolio.get',
      payload: { portfolioId: 'p-1' },
      requestId: 'corr-1',
    });
  });

  it('omits payload and requestId when absent, rather than sending nulls', () => {
    const encoded = encodeRequestFrame({ v: 1, op: 'portfolio.list' });
    const decoded = JSON.parse(encoded.subarray(IPC_LENGTH_PREFIX_BYTES).toString('utf8')) as Record<string, unknown>;
    expect(Object.keys(decoded).sort()).toEqual(['op', 'v']);
    expect('payload' in decoded).toBe(false);
    expect('requestId' in decoded).toBe(false);
  });

  it('refuses an unexpected envelope key, a wrong version and an unknown operation', () => {
    const cases: Array<[unknown, string]> = [
      [{ v: 1, op: 'portfolio.list', tenantId: 'x' }, 'CALLER_SUPPLIED_AUTHORITY'],
      [{ v: 2, op: 'portfolio.list' }, 'MALFORMED_ENVELOPE'],
      [{ v: 1, op: 'portfolio.list', extra: 1 }, 'MALFORMED_ENVELOPE'],
      [{ v: 1, op: 'portfolio.purge' }, 'UNKNOWN_OPERATION'],
      [{ v: 1, op: '' }, 'UNKNOWN_OPERATION'],
    ];
    for (const [envelope, kind] of cases) {
      try {
        encodeRequestFrame(envelope as never);
        throw new Error(`expected a refusal for ${JSON.stringify(envelope)}`);
      } catch (error) {
        expect(error, JSON.stringify(envelope)).toBeInstanceOf(IpcClientError);
        expect((error as IpcClientError).kind, JSON.stringify(envelope)).toBe(kind);
      }
    }
  });

  it('parses a success and an outcome response frame, and refuses anything else', () => {
    const success = parseResponseFrame({ v: 1, ok: true, op: 'portfolio.list', result: [] });
    expect(success.ok).toBe(true);

    const outcome = parseResponseFrame({
      v: 1,
      ok: false,
      op: 'portfolio.get',
      outcome: 'RESOURCE_UNAVAILABLE',
    });
    expect(outcome.ok).toBe(false);

    for (const bad of [
      null,
      42,
      'x',
      [],
      { ok: true, op: 'portfolio.list', result: [] }, // no v
      { v: 2, ok: true, op: 'portfolio.list', result: [] }, // wrong v
      { v: 1, op: 'portfolio.list', result: [] }, // no ok
      { v: 1, ok: true, op: 'portfolio.list', result: [], extra: 1 }, // unexpected key
      { v: 1, ok: false, op: 'portfolio.list' }, // no outcome
    ]) {
      expect(() => parseResponseFrame(bad), JSON.stringify(bad)).toThrow(IpcClientError);
    }
  });

  it('refuses a response that discloses an owner-scoped identifier (OC-6)', () => {
    expect(() =>
      parseResponseFrame({
        v: 1,
        ok: true,
        op: 'portfolio.get',
        result: { portfolioId: 'p', applicationUserId: 'principal-a' },
      }),
    ).toThrow(/discloses an owner-scoped identifier/);
    expect(() =>
      parseResponseFrame({ v: 1, ok: true, op: 'portfolio.list', result: [], tenantId: 'leaked' }),
    ).toThrow(IpcClientError);
  });

  it('accepts IPD-resolved canonical identity inbound, which IRR may receive but never assert', () => {
    // A holding view legitimately carries companyId / identityStatus /
    // resolutionDisposition: IPD resolved them. Refusing those inbound would reject
    // every valid portfolio view; the outbound set is what C7 governs.
    const parsed = parseResponseFrame({
      v: 1,
      ok: true,
      op: 'portfolio.get',
      result: {
        portfolioId: 'p',
        holdings: [{ symbol: 'RELIANCE', companyId: 'C1', identityStatus: 'RESOLVED' }],
      },
    });
    expect(parsed.ok).toBe(true);
    expect(findResponseDisclosedKeys(parsed)).toEqual([]);
    expect(findRefusedWireKeys({ holdings: [{ companyId: 'C1' }] })).toEqual(['companyId']);
  });
});

/* ------------------------------------------------------------------ *
 * Caps
 * ------------------------------------------------------------------ */

describe('ipcClient — caps', () => {
  it('refuses an oversize request locally and opens no socket', async () => {
    const endpoint = await startTestEndpoint((_request, socket) => socket.destroy());
    const oversized = { portfolioId: 'x'.repeat(IPC_REQUEST_MAX_BYTES) };
    try {
      encodeRequestFrame({ v: 1, op: 'portfolio.get', payload: oversized });
      throw new Error('expected a refusal');
    } catch (error) {
      expect((error as IpcClientError).kind).toBe('REQUEST_OVERSIZE');
    }
    await expect(callIpc('portfolio.get', oversized, { target: endpoint.target })).rejects.toBeInstanceOf(
      IpcClientError,
    );
    expect(endpoint.connections()).toBe(0);
  });

  it('accepts a request exactly at the cap and refuses one byte over', () => {
    // Build a body of exactly 64 KiB.
    const envelope = { v: 1, op: 'portfolio.get', payload: { portfolioId: '' } };
    const base = Buffer.byteLength(JSON.stringify(envelope), 'utf8');
    const atCap = { ...envelope, payload: { portfolioId: 'x'.repeat(IPC_REQUEST_MAX_BYTES - base) } };
    expect(Buffer.byteLength(JSON.stringify(atCap), 'utf8')).toBe(IPC_REQUEST_MAX_BYTES);
    expect(() => encodeRequestFrame(atCap)).not.toThrow();

    const overCap = { ...envelope, payload: { portfolioId: 'x'.repeat(IPC_REQUEST_MAX_BYTES - base + 1) } };
    expect(() => encodeRequestFrame(overCap)).toThrow(IpcClientError);
  });

  it('refuses a response declaring more than 256 KiB and reports outcome-unknown', async () => {
    const endpoint = await startTestEndpoint((_request, socket) => {
      const prefix = Buffer.allocUnsafe(IPC_LENGTH_PREFIX_BYTES);
      prefix.writeUInt32BE(IPC_RESPONSE_MAX_BYTES + 1, 0);
      socket.end(prefix);
    });
    const result = await callIpc('portfolio.list', undefined, {
      target: endpoint.target,
      timeoutMs: 500,
    });
    expect(result.kind).toBe('OUTCOME_UNKNOWN');
    if (result.kind === 'OUTCOME_UNKNOWN') {
      expect(result.reason).toBe('TRANSPORT_FAULT');
      expect(result.retried).toBe(false);
    }
  });

  it('refuses a response whose bytes exceed the cap without buffering past it', async () => {
    const endpoint = await startTestEndpoint((_request, socket) => {
      // Declare a legal length, then flood past the cap.
      const prefix = Buffer.allocUnsafe(IPC_LENGTH_PREFIX_BYTES);
      prefix.writeUInt32BE(IPC_RESPONSE_MAX_BYTES, 0);
      socket.write(prefix);
      socket.write(Buffer.alloc(IPC_RESPONSE_MAX_BYTES + 1024, 0x78));
      socket.end();
    });
    const result = await callIpc('portfolio.list', undefined, {
      target: endpoint.target,
      timeoutMs: 500,
    });
    expect(result.kind).toBe('OUTCOME_UNKNOWN');
  });
});

/* ------------------------------------------------------------------ *
 * No authority field on the wire (OC-7 / C7)
 * ------------------------------------------------------------------ */

describe('ipcClient — no authority field ever reaches the wire', () => {
  it('refuses the 29 certified caller-identity keys plus the C7 additions', () => {
    expect(IPC_CALLER_IDENTITY_KEYS).toHaveLength(29);
    expect(new Set(IPC_CALLER_IDENTITY_KEYS).size).toBe(29);
    expect([...IPC_CANONICAL_IDENTITY_KEYS].sort()).toEqual([
      'companyId',
      'identityStatus',
      'resolutionDisposition',
      'runtimeCompanyId',
      'tenantHint',
      'tenantId',
    ]);
    expect(IPC_REFUSED_WIRE_KEYS.length).toBe(29 + 5); // tenantId is already among the 29
    for (const key of IPC_CALLER_IDENTITY_KEYS) {
      expect(IPC_REFUSED_WIRE_KEYS).toContain(key);
    }
  });

  it('refuses every refused key at top level, in options, and nested in holdings — with NO socket opened', async () => {
    const endpoint = await startTestEndpoint((_request, socket) => socket.destroy());

    for (const key of IPC_REFUSED_WIRE_KEYS) {
      const placements: Array<Record<string, unknown>> = [
        { [key]: 'smuggled' },
        { options: { [key]: 'smuggled' } },
        { holdings: [{ symbol: 'X', [key]: 'smuggled' }] },
      ];
      for (const payload of placements) {
        try {
          await callIpc('portfolio.save', payload, { target: endpoint.target, timeoutMs: 200 });
          throw new Error(`expected a refusal for ${key} in ${JSON.stringify(payload)}`);
        } catch (error) {
          expect(error, `${key}: ${JSON.stringify(payload)}`).toBeInstanceOf(IpcWireAuthorityError);
          expect((error as IpcClientError).kind).toBe('CALLER_SUPPLIED_AUTHORITY');
          expect((error as IpcWireAuthorityError).refusedKeys).toContain(key);
        }
      }
    }
    // Nothing was ever sent: not one connection was accepted.
    expect(endpoint.connections()).toBe(0);
  });

  it('reports key NAMES only, never the caller-supplied values', () => {
    const found = findRefusedWireKeys({ token: 'super-secret-value', tenantId: 'secret-tenant' });
    expect(found).toEqual(['tenantId', 'token']);
    expect(JSON.stringify(found)).not.toContain('super-secret-value');
    expect(JSON.stringify(found)).not.toContain('secret-tenant');
  });

  it('refuses a structure nested deeper than the scan limit rather than skipping it', () => {
    let deep: Record<string, unknown> = { tenantId: 'buried' };
    for (let i = 0; i < IPC_MAX_SCAN_DEPTH + 4; i += 1) deep = { level: deep };
    const found = findRefusedWireKeys(deep);
    expect(found.length).toBeGreaterThan(0);
  });

  it('accepts a clean payload — the scanner does not over-refuse', () => {
    expect(
      findRefusedWireKeys({
        portfolioId: 'p-1',
        expectedRevision: 3,
        mode: 'MERGE',
        holdings: [{ symbol: 'RELIANCE', isin: 'INE002A01018', quantity: 10, currentPrice: 2600 }],
      }),
    ).toEqual([]);
    expect(() =>
      encodeRequestFrame({
        v: 1,
        op: 'portfolio.save',
        payload: {
          portfolioId: 'p-1',
          expectedRevision: 3,
          holdings: [{ symbol: 'RELIANCE', quantity: 10, currentPrice: 2600 }],
        },
      }),
    ).not.toThrow();
  });

  it('the client module creates no listener and reads no credential', () => {
    const source = readFileSync(new URL('./ipcClient.ts', import.meta.url), 'utf8');
    expect(source).toContain("createConnection");
    expect(source).not.toContain('createServer');
    expect(source).not.toContain('.listen(');
    expect(source).not.toContain("from 'node:http'");
    expect(source).not.toContain("from 'node:https'");
    expect(source).not.toContain('process.env.AUTHORIZATION');
  });
});

/* ------------------------------------------------------------------ *
 * Endpoint resolution — local only, fail closed
 * ------------------------------------------------------------------ */

describe('ipcClient — endpoint resolution is local-only and fail-closed', () => {
  it('refuses a missing, blank, relative, URL or host:port setting', () => {
    const cases: Array<Record<string, string>> = [
      {},
      { [IPC_ENDPOINT_SETTING]: '' },
      { [IPC_ENDPOINT_SETTING]: '   ' },
      { [IPC_ENDPOINT_SETTING]: 'relative/path.sock' },
      { [IPC_ENDPOINT_SETTING]: 'http://127.0.0.1:8787/ipc' },
      { [IPC_ENDPOINT_SETTING]: 'https://example.com/ipc' },
      { [IPC_ENDPOINT_SETTING]: 'tcp://127.0.0.1:5432' },
      { [IPC_ENDPOINT_SETTING]: '127.0.0.1:8787' },
      { [IPC_ENDPOINT_SETTING]: 'localhost:9000' },
    ];
    for (const env of cases) {
      try {
        resolveIpcEndpoint(env, 'linux');
        throw new Error(`expected a refusal for ${JSON.stringify(env)}`);
      } catch (error) {
        expect(error, JSON.stringify(env)).toBeInstanceOf(IpcClientError);
        expect((error as IpcClientError).kind).toBe('ENDPOINT_NOT_CONFIGURED');
      }
    }
  });

  it('accepts an absolute POSIX path verbatim', () => {
    const target = resolveIpcEndpoint(
      { [IPC_ENDPOINT_SETTING]: '/run/iips/ipd.sock' },
      'linux',
    );
    expect(target).toEqual({ kind: 'unix-socket', path: '/run/iips/ipd.sock', source: 'absolute-path' });
  });

  it('resolves a bare name against the operator-local state directory', () => {
    const target = resolveIpcEndpoint(
      {
        [IPC_ENDPOINT_SETTING]: 'iips-ipd-user-portfolio-v1',
        [IPC_STATE_DIR_SETTING]: '/var/lib/iips/state/',
      },
      'linux',
    );
    expect(target.kind).toBe('unix-socket');
    expect(target.path).toBe('/var/lib/iips/state/iips-ipd-user-portfolio-v1.sock');
    expect(target.source).toBe('name-in-state-directory');
  });

  it('refuses a bare name with no state directory, a relative directory, or an unsafe name', () => {
    expect(() => resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: 'name-only' }, 'linux')).toThrow(IpcClientError);
    expect(() =>
      resolveIpcEndpoint(
        { [IPC_ENDPOINT_SETTING]: 'name-only', [IPC_STATE_DIR_SETTING]: 'relative/dir' },
        'linux',
      ),
    ).toThrow(IpcClientError);
    for (const name of ['../escape', 'a/b', 'a\\b', '..', 'with space']) {
      expect(
        () => resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: name, [IPC_STATE_DIR_SETTING]: '/tmp/x' }, 'linux'),
        name,
      ).toThrow(IpcClientError);
    }
  });

  it('resolves the Windows named-pipe shape and refuses a cross-platform mix', () => {
    const pipe = resolveIpcEndpoint(
      { [IPC_ENDPOINT_SETTING]: 'iips-ipd-user-portfolio-v1', [IPC_STATE_DIR_SETTING]: 'C:\\state' },
      'win32',
    );
    expect(pipe.kind).toBe('windows-named-pipe');
    expect(pipe.path).toBe('\\\\.\\pipe\\iips-ipd-user-portfolio-v1');

    const absolutePipe = resolveIpcEndpoint(
      { [IPC_ENDPOINT_SETTING]: '\\\\.\\pipe\\custom' },
      'win32',
    );
    expect(absolutePipe.kind).toBe('windows-named-pipe');

    // A named pipe is not a POSIX endpoint, and a POSIX path is not a pipe.
    expect(() => resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: '\\\\.\\pipe\\x' }, 'linux')).toThrow(IpcClientError);
    expect(() =>
      resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: '/run/iips/ipd.sock' }, 'win32'),
    ).toThrow(IpcClientError);
  });

  it('reads configuration per call — a changed setting is observed immediately (OC-5)', () => {
    const first = resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: '/a/one.sock' }, 'linux');
    const second = resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: '/b/two.sock' }, 'linux');
    expect(first.path).toBe('/a/one.sock');
    expect(second.path).toBe('/b/two.sock');
    expect(first).not.toBe(second);
  });
});

/* ------------------------------------------------------------------ *
 * Round trip: success, Class A, Class P
 * ------------------------------------------------------------------ */

describe('ipcClient — one request, at most one response', () => {
  it('returns SUCCESS for a well-formed success frame', async () => {
    const endpoint = await startTestEndpoint((request, socket) => {
      socket.end(
        frameOf({
          v: 1,
          ok: true,
          op: (request as { op: string }).op,
          requestId: (request as { requestId?: string }).requestId,
          result: [],
        }),
      );
    });
    const result = await callIpc('portfolio.list', undefined, {
      target: endpoint.target,
      requestId: 'corr-42',
      timeoutMs: 500,
    });
    expect(result.kind).toBe('SUCCESS');
    if (result.kind === 'SUCCESS') {
      expect(result.frame.op).toBe('portfolio.list');
      expect(result.frame.requestId).toBe('corr-42');
      expect(result.frame.result).toEqual([]);
      expect(result.bytesReceived).toBeGreaterThan(0);
    }
    expect(endpoint.connections()).toBe(1);
  });

  it('returns CLASS_A for a typed outcome frame, carrying no invented reason', async () => {
    const endpoint = await startTestEndpoint((request, socket) => {
      socket.end(
        frameOf({
          v: 1,
          ok: false,
          op: (request as { op: string }).op,
          outcome: 'RESOURCE_UNAVAILABLE',
        }),
      );
    });
    const result = await callIpc('portfolio.get', { portfolioId: 'p-1' }, {
      target: endpoint.target,
      timeoutMs: 500,
    });
    expect(result.kind).toBe('CLASS_A');
    if (result.kind === 'CLASS_A') {
      expect(result.frame.outcome).toBe('RESOURCE_UNAVAILABLE');
      expect(result.frame.ok).toBe(false);
    }
  });

  it('returns CLASS_P with ZERO bytes and NO reason when the peer closes silently', async () => {
    const endpoint = await startTestEndpoint((_request, socket) => socket.destroy());
    const result = await callIpc('portfolio.list', undefined, {
      target: endpoint.target,
      timeoutMs: 500,
    });
    expect(result.kind).toBe('CLASS_P');
    if (result.kind === 'CLASS_P') {
      expect(result.bytesReceived).toBe(0);
      // IRR cannot know which Class P reason applied, and invents none.
      expect(result.reason).toBeNull();
    }
  });

  it('sends exactly one request frame per connection', async () => {
    const seen: unknown[] = [];
    const endpoint = await startTestEndpoint((request, socket) => {
      seen.push(request);
      socket.end(frameOf({ v: 1, ok: true, op: 'portfolio.list', result: [] }));
    });
    await callIpc('portfolio.list', undefined, { target: endpoint.target, timeoutMs: 500 });
    expect(endpoint.connections()).toBe(1);
    expect(seen).toEqual([{ v: 1, op: 'portfolio.list' }]);
  });
});

/* ------------------------------------------------------------------ *
 * Timeouts and no retry
 * ------------------------------------------------------------------ */

describe('ipcClient — timeouts are outcome-unknown and never retried', () => {
  it('reports OUTCOME_UNKNOWN on timeout for a read', async () => {
    // The peer accepts and never answers.
    const endpoint = await startTestEndpoint(() => undefined);
    const result = await callIpc('portfolio.get', { portfolioId: 'p-1' }, {
      target: endpoint.target,
      timeoutMs: 60,
    });
    expect(result.kind).toBe('OUTCOME_UNKNOWN');
    if (result.kind === 'OUTCOME_UNKNOWN') {
      expect(result.reason).toBe('TIMEOUT');
      expect(result.op).toBe('portfolio.get');
      expect(result.write).toBe(false);
      expect(result.retried).toBe(false);
    }
    // Exactly one attempt: no retry happened inside the client.
    expect(endpoint.connections()).toBe(1);
  });

  it('marks a timed-out WRITE as outcome-unknown, flagged as a write, and does not retry', async () => {
    const endpoint = await startTestEndpoint(() => undefined);
    for (const op of IPC_WRITE_OPERATIONS) {
      const result = await callIpc(op, { portfolioId: 'p-1', expectedRevision: 1 }, {
        target: endpoint.target,
        timeoutMs: 60,
      });
      expect(result.kind, op).toBe('OUTCOME_UNKNOWN');
      if (result.kind === 'OUTCOME_UNKNOWN') {
        expect(result.write, op).toBe(true);
        expect(result.retried, op).toBe(false);
        expect(result.reason, op).toBe('TIMEOUT');
      }
    }
    // One connection per call and no more: four writes, four attempts.
    expect(endpoint.connections()).toBe(IPC_WRITE_OPERATIONS.length);
  });

  it('reports a transport fault as outcome-unknown and does not retry', async () => {
    // Nothing is listening at this path.
    const target: IpcEndpointTarget = {
      kind: 'unix-socket',
      path: join(makeTempDir(), 'absent.sock'),
      source: 'absolute-path',
    };
    const result = await callIpc('portfolio.save', { portfolioId: 'p', expectedRevision: 1 }, {
      target,
      timeoutMs: 200,
    });
    expect(result.kind).toBe('OUTCOME_UNKNOWN');
    if (result.kind === 'OUTCOME_UNKNOWN') {
      expect(result.reason).toBe('TRANSPORT_FAULT');
      expect(result.write).toBe(true);
      expect(result.retried).toBe(false);
    }
  });

  it('reports a truncated response as outcome-unknown rather than as a refusal', async () => {
    const endpoint = await startTestEndpoint((_request, socket) => {
      socket.write(Buffer.from([0x00, 0x00, 0x00, 0x20, 0x7b])); // declares 32 bytes, sends 1
      socket.end();
    });
    const result = await callIpc('portfolio.list', undefined, { target: endpoint.target, timeoutMs: 500 });
    expect(result.kind).toBe('OUTCOME_UNKNOWN');
    if (result.kind === 'OUTCOME_UNKNOWN') expect(result.reason).toBe('TRANSPORT_FAULT');
  });

  it('a malformed JSON response is a transport fault, never data', async () => {
    const endpoint = await startTestEndpoint((_request, socket) => {
      const body = Buffer.from('{ not json', 'utf8');
      const prefix = Buffer.allocUnsafe(IPC_LENGTH_PREFIX_BYTES);
      prefix.writeUInt32BE(body.byteLength, 0);
      socket.end(Buffer.concat([prefix, body]));
    });
    const result = await callIpc('portfolio.list', undefined, { target: endpoint.target, timeoutMs: 500 });
    expect(result.kind).toBe('OUTCOME_UNKNOWN');
  });
});
