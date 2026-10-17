/**
 * Gate B — same-host IPC client: strict framing, caps, timeouts, fail-closed absence, and the
 * wire-form assertion that NO identity/scope field is ever sent.
 *
 * Offline only: a local POSIX socket server stands in for the IPD-owned endpoint. No IPD code,
 * no database, no credential and no portfolio store is involved.
 *
 * @vitest-environment node
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as net from 'node:net';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  IPC_DEFAULT_TIMEOUT_MS,
  IPC_FRAME_HEADER_BYTES,
  IPC_MAX_REQUEST_BYTES,
  IPC_MAX_RESPONSE_BYTES,
  IPC_PIPE_PREFIX,
  IpcTransportError,
  buildIpcRequest,
  decodeIpcFrame,
  encodeRequestFrame,
  exchange,
  findForbiddenWireKeys,
  parseIpcEndpoint,
} from './ipcClient.js';

const servers: net.Server[] = [];
const tempDirs: string[] = [];

afterEach(async () => {
  for (const server of servers.splice(0)) {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function tempSocketPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-gate-b-ipc-'));
  tempDirs.push(dir);
  return path.join(dir, 'ipd-endpoint.sock');
}

function frame(value: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(value), 'utf8');
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);
  return Buffer.concat([header, body]);
}

interface TestEndpointServer {
  readonly endpoint: { kind: 'unix'; path: string };
  readonly received: Buffer[];
  readonly connections: () => number;
}

/**
 * Starts a Unix-socket stand-in. `onRequest` is called exactly once, after a complete request
 * frame has arrived; `received` holds every byte the client sent.
 */
async function startServer(onRequest: (socket: net.Socket, request: unknown) => void): Promise<TestEndpointServer> {
  const socketPath = tempSocketPath();
  const received: Buffer[] = [];
  let connections = 0;
  const server = net.createServer(socket => {
    connections += 1;
    let responded = false;
    socket.on('data', (chunk: Buffer | string) => {
      received.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const all = Buffer.concat(received);
      if (responded || all.length < IPC_FRAME_HEADER_BYTES) return;
      const declared = all.readUInt32BE(0);
      if (all.length < IPC_FRAME_HEADER_BYTES + declared) return;
      responded = true;
      const request = JSON.parse(all.subarray(IPC_FRAME_HEADER_BYTES, IPC_FRAME_HEADER_BYTES + declared).toString('utf8'));
      onRequest(socket, request);
    });
    socket.on('error', () => undefined);
  });
  servers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(socketPath, () => resolve());
  });
  return { endpoint: { kind: 'unix', path: socketPath }, received, connections: () => connections };
}

function sentFrames(received: readonly Buffer[]): Buffer[] {
  const all = Buffer.concat(received);
  const frames: Buffer[] = [];
  let offset = 0;
  while (offset + IPC_FRAME_HEADER_BYTES <= all.length) {
    const declared = all.readUInt32BE(offset);
    if (offset + IPC_FRAME_HEADER_BYTES + declared > all.length) break;
    frames.push(all.subarray(offset, offset + IPC_FRAME_HEADER_BYTES + declared));
    offset += IPC_FRAME_HEADER_BYTES + declared;
  }
  return frames;
}

describe('Gate B — IPC client framing', () => {
  it('sends exactly one framed request and resolves exactly one framed response', async () => {
    const server = await startServer((socket, request) => {
      expect(request).toEqual({ protocol: 1, operation: 'listPortfolios', payload: null });
      socket.end(frame({ status: 200, body: { portfolios: [] } }));
    });

    const response = await exchange('listPortfolios', undefined, server.endpoint);

    expect(response).toEqual({ status: 200, body: { portfolios: [] } });
    expect(server.connections()).toBe(1);
    const frames = sentFrames(server.received);
    expect(frames).toHaveLength(1);
    expect(frames[0].length).toBe(IPC_FRAME_HEADER_BYTES + frames[0].readUInt32BE(0));
  });

  it('carries only an allowlisted portfolioId on the wire — no identity, owner, tenant or scope', async () => {
    const server = await startServer((socket) => {
      socket.end(frame({ status: 200, body: { revisions: [] } }));
    });

    await exchange('revisionHistory', { portfolioId: 'pf-1' }, server.endpoint);

    const [outbound] = sentFrames(server.received);
    const wire = JSON.parse(outbound.subarray(IPC_FRAME_HEADER_BYTES).toString('utf8'));
    expect(Object.keys(wire).sort()).toEqual(['operation', 'payload', 'protocol']);
    expect(Object.keys(wire.payload)).toEqual(['portfolioId']);
    const text = outbound.toString('utf8');
    for (const key of ['tenantHint', 'tenantId', 'scope', 'principal', 'owner', 'applicationUserId', 'membership', 'companyId']) {
      expect(text).not.toContain(key);
    }
  });

  it('refuses a forbidden authority field BEFORE opening any connection', async () => {
    const server = await startServer(() => undefined);

    await expect(
      exchange('getPortfolio', { portfolioId: 'pf-1', tenantHint: 'irr-domain' }, server.endpoint),
    ).rejects.toMatchObject({ name: 'IpcTransportError', kind: 'forbidden-field' });

    expect(server.connections()).toBe(0);
    expect(server.received).toHaveLength(0);
  });

  it('refuses a request over the hard cap before opening any connection', async () => {
    const server = await startServer(() => undefined);

    await expect(
      exchange('getPortfolio', { portfolioId: 'x'.repeat(IPC_MAX_REQUEST_BYTES + 1) }, server.endpoint),
    ).rejects.toMatchObject({ name: 'IpcTransportError', kind: 'request-too-large' });

    expect(server.connections()).toBe(0);
  });
});

describe('Gate B — IPC client fail-closed behaviour', () => {
  it('fails closed when the endpoint is absent', async () => {
    const endpoint = { kind: 'unix' as const, path: path.join(path.dirname(tempSocketPath()), 'absent.sock') };

    await expect(exchange('listPortfolios', undefined, endpoint, { timeoutMs: 500 }))
      .rejects.toMatchObject({ name: 'IpcTransportError', kind: 'endpoint-unavailable' });
  });

  it('fails closed on timeout without sending a second request', async () => {
    const server = await startServer(() => undefined); // accepts, never answers

    await expect(exchange('listPortfolios', undefined, server.endpoint, { timeoutMs: 80 }))
      .rejects.toMatchObject({ name: 'IpcTransportError', kind: 'timeout' });

    expect(server.connections()).toBe(1);
    expect(sentFrames(server.received)).toHaveLength(1);
  });

  it('fails closed when the peer closes without a response', async () => {
    const server = await startServer((socket) => socket.destroy());

    await expect(exchange('listPortfolios', undefined, server.endpoint, { timeoutMs: 500 }))
      .rejects.toMatchObject({ name: 'IpcTransportError', kind: 'endpoint-unavailable' });
  });

  it('fails closed when the declared response length exceeds the cap', async () => {
    const server = await startServer((socket) => {
      const header = Buffer.alloc(4);
      header.writeUInt32BE(IPC_MAX_RESPONSE_BYTES + 1, 0);
      socket.write(header);
    });

    await expect(exchange('listPortfolios', undefined, server.endpoint, { timeoutMs: 500 }))
      .rejects.toMatchObject({ name: 'IpcTransportError', kind: 'response-too-large' });
  });

  it('fails closed on trailing bytes after the response frame (exactly one response)', async () => {
    const server = await startServer((socket) => {
      socket.write(Buffer.concat([
        frame({ status: 200, body: { portfolios: [] } }),
        frame({ status: 200, body: { portfolios: [] } }),
      ]));
    });

    await expect(exchange('listPortfolios', undefined, server.endpoint, { timeoutMs: 500 }))
      .rejects.toMatchObject({ name: 'IpcTransportError', kind: 'protocol-violation' });
  });

  it('fails closed on malformed JSON and on a non-object response body', async () => {
    const malformed = await startServer((socket) => {
      const body = Buffer.from('{not json', 'utf8');
      const header = Buffer.alloc(4);
      header.writeUInt32BE(body.length, 0);
      socket.write(Buffer.concat([header, body]));
    });
    await expect(exchange('listPortfolios', undefined, malformed.endpoint, { timeoutMs: 500 }))
      .rejects.toMatchObject({ kind: 'protocol-violation' });

    const arrayBody = await startServer((socket) => socket.write(frame([1, 2, 3])));
    await expect(exchange('listPortfolios', undefined, arrayBody.endpoint, { timeoutMs: 500 }))
      .rejects.toMatchObject({ kind: 'protocol-violation' });
  });

  it('fails closed on an endpoint that is not a pipe or an absolute socket path', async () => {
    const tcpShaped = { kind: 'unix' as const, path: '127.0.0.1:9000' };
    const spoofedKind = { kind: 'pipe' as const, path: '/tmp/sock.sock' };

    await expect(exchange('listPortfolios', undefined, tcpShaped, { timeoutMs: 200 }))
      .rejects.toMatchObject({ kind: 'endpoint-unavailable' });
    await expect(exchange('listPortfolios', undefined, spoofedKind, { timeoutMs: 200 }))
      .rejects.toMatchObject({ kind: 'endpoint-unavailable' });
  });
});

describe('Gate B — IPC client pure helpers', () => {
  it('parses a named pipe and an absolute socket path, and refuses every other form', () => {
    expect(parseIpcEndpoint(`${IPC_PIPE_PREFIX}iips-g2-ipd`)).toEqual({ kind: 'pipe', path: `${IPC_PIPE_PREFIX}iips-g2-ipd` });
    expect(parseIpcEndpoint('/run/iips/g2.sock')).toEqual({ kind: 'unix', path: '/run/iips/g2.sock' });
    expect(parseIpcEndpoint(`${IPC_PIPE_PREFIX}`)).toBeNull();
    expect(parseIpcEndpoint('g2.sock')).toBeNull();
    expect(parseIpcEndpoint('127.0.0.1:9000')).toBeNull();
    expect(parseIpcEndpoint('http://127.0.0.1:9000/')).toBeNull();
    expect(parseIpcEndpoint('')).toBeNull();
    expect(parseIpcEndpoint('/run/ii\u0000ps.sock')).toBeNull();
    expect(parseIpcEndpoint(`/${'a'.repeat(200)}`)).toBeNull();
    expect(parseIpcEndpoint(42)).toBeNull();
  });

  it('builds a versioned request and finds nested forbidden keys', () => {
    expect(buildIpcRequest('listPortfolios')).toEqual({ protocol: 1, operation: 'listPortfolios', payload: null });
    expect(findForbiddenWireKeys({ portfolioId: 'pf-1' })).toEqual([]);
    expect(findForbiddenWireKeys({ holdings: [{ companyId: 'c-1' }] })).toEqual(['holdings[0].companyId']);
    expect(() => buildIpcRequest('bad operation')).toThrow(IpcTransportError);
    expect(() => buildIpcRequest('getPortfolio', { scope: { tenantHint: 't' } })).toThrow(IpcTransportError);
  });

  it('encodes and decodes strict frames only', () => {
    const encoded = encodeRequestFrame('listPortfolios');
    expect(decodeIpcFrame(encoded)).toEqual({ protocol: 1, operation: 'listPortfolios', payload: null });
    expect(() => decodeIpcFrame(encoded.subarray(0, 2))).toThrow(IpcTransportError);
    expect(() => decodeIpcFrame(Buffer.concat([encoded, Buffer.from('x')]))).toThrow(IpcTransportError);
    expect(() => decodeIpcFrame(encoded, 1)).toThrow(IpcTransportError);
  });

  it('uses a bounded default deadline', () => {
    expect(IPC_DEFAULT_TIMEOUT_MS).toBeGreaterThan(0);
    expect(IPC_DEFAULT_TIMEOUT_MS).toBeLessThanOrEqual(30_000);
  });
});
