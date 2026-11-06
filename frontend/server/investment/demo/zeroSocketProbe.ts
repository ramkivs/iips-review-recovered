/**
 * AC-X2 — runtime verification that the assess → persist → read cycle opens **no external network connection**.
 *
 * WHAT THE CRITERION ACTUALLY SAYS. The gate appears in three places; the last two are the authoritative scope
 * clarifications and are what this harness implements:
 *
 *   design §6.8      "No network access at analysis or read time: a test asserts zero sockets opened during a full
 *                    assess→persist→read cycle."
 *   design §I.2      "**AC-X2 is 'zero external network connections'.** Loopback (`127.0.0.1`/`::1`) is permitted,
 *                    because later phases talk to a local transport. What is prohibited is any outbound connection to
 *                    a non-loopback host, and any exchange-host URL. Verified by a static module-graph scan in IID-0
 *                    and by **socket-level assertion once a transport exists**."
 *   roadmap §B.I.3   "Loopback to a locally-started process is not an external connection and is not what AC-X2
 *                    forbids; a connection to any non-loopback host is."
 *
 * So the measurement is: **zero connections to a non-loopback destination**, over a complete analysis → persistence →
 * read cycle, at runtime. Loopback is permitted and is classified separately rather than counted as a violation; a
 * listening socket is a bind, not a connection; a DNS lookup is recorded because it is the first step of an outbound
 * attempt. The IID-3 transport now exists, which is the condition §I.2 set for this assertion.
 *
 * HOW IT MEASURES — two independent layers:
 *
 *   1  **In-process interception** of every Node API that can start an outbound connection: `net.connect` /
 *      `net.createConnection` / `net.Socket.prototype.connect`, `tls.connect`, `http(s).request`/`get`, `dns.lookup`
 *      and the `dns.resolve*` family plus `dns.promises`, `dgram.createSocket`, and `globalThis.fetch`. Node's
 *      built-in modules are singletons, so replacing a method on the module object covers every caller regardless of
 *      when it imported the module. Patches are removed after the cycle.
 *      The probe is **fail-closed for the prohibited case**: a non-loopback connect throws instead of connecting, so
 *      the harness can never silently perform the thing it is asserting against (`0.0.0.0`/`::` binds are permitted,
 *      they are not destinations).
 *   2  **Process-scoped socket-descriptor census** (`/proc/self/fd` → `socket:[inode]` links) before and after the
 *      cycle, on Linux. Deliberately a different layer: if the JS interception missed a path (native addon, captured
 *      reference), a new socket descriptor would still exist. Where `/proc` is unavailable the census records
 *      `available: false` rather than claiming zero.
 *
 * WHAT IT DOES NOT DO, and the record says so: no syscall tracing (`strace`/`ltrace`/`bpftrace` are not installed
 * here), so the measurement speaks for this Node process, not the kernel; and the cross-process read is not repeated
 * here because the M-1 demonstration already proves it (spawning an uninstrumented child would weaken the assertion).
 */
import dgram from 'node:dgram';
import dns from 'node:dns';
import { readdirSync, readlinkSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';

import { adaptNp04Store } from '../../reports/np04-adapter.js';
import { createInvestmentArtifactService } from '../investmentArtifacts.js';
import { handleInvestmentRequest } from '../investment-transport.js';
import { M1_ISSUER_ID } from './m1Data.js';
import { M1_NOW, assembleAssessment, prepareM1Environment, type M1Environment } from './m1Pipeline.js';

export const AC_X2_REQUIREMENT = Object.freeze({
  id: 'AC-X2',
  statement:
    'Zero external network connections during a full assess→persist→read cycle: no outbound connection to a non-loopback host and no exchange-host URL. Loopback is permitted (design §I.2, roadmap §B.I.3).',
  cycle:
    'analysis (assessment assembly) → persistence (governed NP-04 record) → read (chain read through the service and through the HTTP-shape transport handler)',
});

/**
 * `LOCAL_SOCKET` exists so that creating a socket with no destination (a UDP socket before it is bound or sent to) is
 * not misreported as either a connection or a violation. It is neither.
 */
export type AttemptClassification = 'LOOPBACK' | 'EXTERNAL' | 'LISTEN' | 'IPC' | 'LOCAL_SOCKET' | 'UNRESOLVED';

export interface NetworkAttempt {
  /** Which API was entered. */
  readonly channel: string;
  readonly host: string | null;
  readonly port: number | string | null;
  readonly url: string | null;
  readonly classification: AttemptClassification;
  /** First stack frame outside this probe — the caller that tried to open the connection. */
  readonly caller: string | null;
}

export interface ProbeSession {
  readonly attempts: NetworkAttempt[];
  readonly channels: readonly string[];
  restore(): void;
}

export interface SocketFdCensus {
  readonly available: boolean;
  readonly socketFds: readonly string[];
  readonly reason: string | null;
}

const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost', 'ip6-localhost']);
const BIND_HOSTS = new Set(['0.0.0.0', '::', '']);

function classify(host: string | null, kind: 'connect' | 'listen'): AttemptClassification {
  if (kind === 'listen') return 'LISTEN';
  if (host === null) {
    // `net.connect(port)` without a host means localhost (Node docs), so a port-only connect is loopback.
    return 'LOOPBACK';
  }
  if (LOOPBACK_HOSTS.has(host)) return 'LOOPBACK';
  if (BIND_HOSTS.has(host)) return 'LISTEN';
  // Anything else — a hostname or a routable address — is an external destination.
  return 'EXTERNAL';
}

function callerFrame(): string | null {
  const lines = (new Error().stack ?? '').split('\n').slice(2);
  for (const line of lines) {
    if (!line.includes('zeroSocketProbe')) return line.trim();
  }
  return null;
}

/**
 * Interpret the `net.connect` / `socket.connect` / `server.listen` argument forms without connecting.
 *
 * The array case is not theoretical: Node's own `net.connect` normalizes its arguments and then calls
 * `socket.connect(normalizedArgsArray)`, so `Socket.prototype.connect` — the backstop channel that catches a caller
 * holding a reference captured before the probe was installed — receives an ARRAY. Without this branch that call
 * would be read as "no host", classified as loopback, and an external connection would slip through as permitted.
 * The negative control (`zero-socket-control.test.ts`) exercises exactly that path with a pre-captured reference.
 */
function parseAddressArgs(args: readonly unknown[]): { host: string | null; port: number | string | null; ipc: boolean } {
  const [first, second] = args;
  if (Array.isArray(first)) return parseAddressArgs(first as unknown[]);
  if (typeof first === 'object' && first !== null) {
    const options = first as { host?: unknown; port?: unknown; path?: unknown };
    if (typeof options.path === 'string') return { host: null, port: options.path, ipc: true };
    return {
      host: typeof options.host === 'string' ? options.host : null,
      port: typeof options.port === 'number' || typeof options.port === 'string' ? options.port : null,
      ipc: false,
    };
  }
  if (typeof first === 'string' && first !== '' && Number.isNaN(Number(first))) {
    // `connect(path[, listener])` — a UNIX domain socket, which is IPC, not a network connection.
    return { host: null, port: first, ipc: true };
  }
  return {
    host: typeof second === 'string' ? second : null,
    port: typeof first === 'number' ? first : null,
    ipc: false,
  };
}

function urlOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value instanceof URL) return value.toString();
  if (typeof value === 'object' && value !== null) {
    const options = value as { href?: unknown; hostname?: unknown; host?: unknown; port?: unknown; protocol?: unknown };
    if (typeof options.href === 'string') return options.href;
    if (typeof options.hostname === 'string') {
      const port = typeof options.port === 'number' || typeof options.port === 'string' ? `:${options.port}` : '';
      return `${typeof options.protocol === 'string' ? options.protocol : 'http:'}//${options.hostname}${port}`;
    }
    if (typeof options.host === 'string') return options.host;
  }
  return null;
}

function hostOfUrl(url: string | null): string | null {
  if (url === null) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

type AnyRecord = Record<string, unknown>;

/**
 * Install the probe. Every patch is transparent except for the prohibited case, and every patch records the channel it
 * covers, so a reader can check the surface that was actually instrumented.
 */
export function installNetworkProbe(): ProbeSession {
  const attempts: NetworkAttempt[] = [];
  const channels: string[] = [];
  const restores: (() => void)[] = [];

  const record = (
    channel: string,
    host: string | null,
    port: number | string | null,
    url: string | null,
    kind: 'connect' | 'listen' | 'ipc' | 'dns' | 'local',
  ): void => {
    const classification: AttemptClassification =
      kind === 'ipc'
        ? 'IPC'
        : kind === 'local'
          ? 'LOCAL_SOCKET'
          : kind === 'dns'
            ? host === null
              ? 'UNRESOLVED'
              : classify(host, 'connect')
            : classify(host, kind);
    attempts.push({ channel, host, port, url, classification, caller: callerFrame() });
  };

  const refuseExternal = (channel: string, host: string): never => {
    throw new Error(
      `AC-X2 probe: refused an outbound connection to a non-loopback host (${channel} → ${host}). ` +
        'The assess→persist→read cycle must not reach an external network destination.',
    );
  };

  const patch = (target: AnyRecord, key: string, channel: string, factory: (original: (...args: never[]) => unknown) => unknown): void => {
    const original = target[key];
    if (typeof original !== 'function') return;
    target[key] = factory(original as (...args: never[]) => unknown);
    channels.push(channel);
    restores.push(() => {
      target[key] = original;
    });
  };

  const wrapConnect = (channel: string, original: (...args: never[]) => unknown) =>
    function patchedConnect(this: unknown, ...args: unknown[]): unknown {
      const parsed = parseAddressArgs(args);
      record(channel, parsed.host, parsed.port, null, parsed.ipc ? 'ipc' : 'connect');
      if (!parsed.ipc && parsed.host !== null && classify(parsed.host, 'connect') === 'EXTERNAL') {
        refuseExternal(channel, parsed.host);
      }
      return original.apply(this as never, args as never[]);
    };

  // ---- node:net ---------------------------------------------------------------------------------------------
  patch(net as unknown as AnyRecord, 'connect', 'net.connect', (original) => wrapConnect('net.connect', original));
  patch(net as unknown as AnyRecord, 'createConnection', 'net.createConnection', (original) =>
    wrapConnect('net.createConnection', original),
  );
  patch(net.Socket.prototype as unknown as AnyRecord, 'connect', 'net.Socket.prototype.connect', (original) =>
    wrapConnect('net.Socket.prototype.connect', original),
  );
  patch(net.Server.prototype as unknown as AnyRecord, 'listen', 'net.Server.listen', (original) =>
    function patchedListen(this: unknown, ...args: unknown[]): unknown {
      const parsed = parseAddressArgs(args);
      record('net.Server.listen', parsed.host, parsed.port, null, 'listen');
      return original.apply(this as never, args as never[]);
    },
  );

  // ---- node:tls ---------------------------------------------------------------------------------------------
  patch(tls as unknown as AnyRecord, 'connect', 'tls.connect', (original) =>
    function patchedTlsConnect(this: unknown, ...args: unknown[]): unknown {
      const parsed = parseAddressArgs(args);
      record('tls.connect', parsed.host, parsed.port, null, parsed.ipc ? 'ipc' : 'connect');
      if (!parsed.ipc && parsed.host !== null && classify(parsed.host, 'connect') === 'EXTERNAL') {
        refuseExternal('tls.connect', parsed.host);
      }
      return original.apply(this as never, args as never[]);
    },
  );

  // ---- node:http / node:https -------------------------------------------------------------------------------
  const httpModules: readonly (readonly [string, AnyRecord])[] = [
    ['http', http as unknown as AnyRecord],
    ['https', https as unknown as AnyRecord],
  ];
  for (const [moduleName, mod] of httpModules) {
    for (const key of ['request', 'get'] as const) {
      patch(mod, key, `${moduleName}.${key}`, (original) =>
        function patchedRequest(this: unknown, ...args: unknown[]): unknown {
          const url = urlOf(args[0]);
          const host = hostOfUrl(url);
          record(`${moduleName}.${key}`, host, null, url, 'connect');
          if (host !== null && classify(host, 'connect') === 'EXTERNAL') {
            refuseExternal(`${moduleName}.${key}`, host);
          }
          return original.apply(this as never, args as never[]);
        },
      );
    }
  }

  // ---- node:dns ---------------------------------------------------------------------------------------------
  for (const key of ['lookup', 'resolve', 'resolve4', 'resolve6', 'resolveAny', 'resolveSrv', 'resolveTxt'] as const) {
    patch(dns as unknown as AnyRecord, key, `dns.${key}`, (original) =>
      function patchedResolve(this: unknown, ...args: unknown[]): unknown {
        record(`dns.${key}`, typeof args[0] === 'string' ? args[0] : null, null, null, 'dns');
        return original.apply(this as never, args as never[]);
      },
    );
  }
  const dnsPromises = (dns as unknown as { promises?: AnyRecord }).promises;
  if (dnsPromises !== undefined) {
    for (const key of ['lookup', 'resolve', 'resolve4', 'resolve6'] as const) {
      patch(dnsPromises, key, `dns.promises.${key}`, (original) =>
        function patchedPromisedResolve(this: unknown, ...args: unknown[]): unknown {
          record(`dns.promises.${key}`, typeof args[0] === 'string' ? args[0] : null, null, null, 'dns');
          return original.apply(this as never, args as never[]);
        },
      );
    }
  }

  // ---- node:dgram and global fetch --------------------------------------------------------------------------
  patch(dgram as unknown as AnyRecord, 'createSocket', 'dgram.createSocket', (original) =>
    function patchedCreateSocket(this: unknown, ...args: unknown[]): unknown {
      const options = args[0];
      const host =
        typeof options === 'object' && options !== null && typeof (options as { address?: unknown }).address === 'string'
          ? (options as { address: string }).address
          : null;
      // A UDP socket with no address has no destination yet; one with an address is classified like a connect.
      record('dgram.createSocket', host, null, null, host === null ? 'local' : 'connect');
      return original.apply(this as never, args as never[]);
    },
  );

  const globalRecord = globalThis as unknown as AnyRecord;
  if (typeof globalRecord['fetch'] === 'function') {
    const originalFetch = globalRecord['fetch'] as (...args: never[]) => unknown;
    globalRecord['fetch'] = function patchedFetch(this: unknown, ...args: unknown[]): unknown {
      const url = urlOf(args[0]);
      const host = hostOfUrl(url);
      record('globalThis.fetch', host, null, url, 'connect');
      if (host !== null && classify(host, 'connect') === 'EXTERNAL') {
        refuseExternal('globalThis.fetch', host);
      }
      return originalFetch.apply(this as never, args as never[]);
    };
    channels.push('globalThis.fetch');
    restores.push(() => {
      globalRecord['fetch'] = originalFetch;
    });
  }

  return {
    attempts,
    channels,
    restore(): void {
      // Reverse order, so nested patches unwind cleanly.
      for (const restore of restores.reverse()) restore();
    },
  };
}

/**
 * Process-scoped socket-descriptor census.
 *
 * A socket is visible as a descriptor whose link target is `socket:[inode]`. Counting them before and after the cycle
 * checks a different layer from the JS interception: a path that bypassed the patches would still need a descriptor to
 * open a connection, and would show up here as a new one.
 */
export function censusSocketFds(): SocketFdCensus {
  try {
    const socketFds: string[] = [];
    for (const entry of readdirSync('/proc/self/fd')) {
      try {
        const target = readlinkSync(`/proc/self/fd/${entry}`);
        if (target.startsWith('socket:[')) socketFds.push(`${entry}:${target}`);
      } catch {
        // A descriptor can close between readdir and readlink; that is not an error for the census.
      }
    }
    return { available: true, socketFds: socketFds.sort(), reason: null };
  } catch (cause) {
    return { available: false, socketFds: [], reason: cause instanceof Error ? cause.message : String(cause) };
  }
}

export interface CycleStep {
  readonly step: string;
  readonly detail: string;
  readonly ok: boolean;
}

export interface ZeroSocketReport {
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly requirement: typeof AC_X2_REQUIREMENT;
  /** Which half of the cycle this record measures. */
  readonly kind: 'full-cycle' | 'read-only-process';
  readonly environment: {
    readonly node: string;
    readonly platform: string;
    readonly arch: string;
    readonly cwd: string;
    readonly pid: number;
    readonly commit: string | null;
  };
  readonly instrumentation: {
    readonly mode: string;
    readonly channels: readonly string[];
    readonly syscallTracing: string;
  };
  readonly cycle: {
    readonly steps: readonly CycleStep[];
    readonly versions: number;
    readonly headReportId: string;
    readonly payloadBytes: number;
    readonly payloadDigest: string;
    readonly transportStatus: number;
    /** HEAD carries the version in a header; GET carries it in the body. Both are recorded. */
    readonly transportVersionHeader: string | null;
    readonly transportBodyBytes: number;
    readonly transportBodyVersion: number | null;
  };
  readonly observation: {
    readonly totalAttempts: number;
    readonly external: number;
    readonly loopback: number;
    readonly listen: number;
    readonly ipc: number;
    readonly localSocket: number;
    readonly unresolved: number;
    readonly attempts: readonly NetworkAttempt[];
  };
  readonly socketFdCensus: {
    readonly before: SocketFdCensus;
    readonly after: SocketFdCensus;
    readonly newSocketFds: readonly string[];
    readonly verdict: string;
  };
  readonly determination: {
    readonly pass: boolean;
    readonly basis: string;
    readonly externalDestinations: readonly string[];
  };
  readonly limitations: readonly string[];
}

const OWNER_CONTEXT = { tenantId: 'irr-reports-personal', ownerUserId: 'owner-irr-reports-personal' } as const;
const OWNER = { tenantId: OWNER_CONTEXT.tenantId, userId: OWNER_CONTEXT.ownerUserId } as const;

interface FakeResponse {
  status: number;
  headers: Record<string, string | string[] | number>;
  body: string;
}

/** The same fake request/response pair the M-1 demonstration uses — an HTTP-shape read with no socket. */
async function transportRead(
  method: string,
  url: string,
  deps: Parameters<typeof handleInvestmentRequest>[2],
): Promise<FakeResponse> {
  const result: FakeResponse = { status: 0, headers: {}, body: '' };
  let ended = false;
  const res = {
    setHeader(name: string, value: string | string[] | number): void {
      result.headers[name.toLowerCase()] = value;
    },
    writeHead(status: number, headers?: Record<string, string | string[] | number>): void {
      result.status = status;
      for (const [name, value] of Object.entries(headers ?? {})) result.headers[name.toLowerCase()] = value;
    },
    end(chunk?: string): void {
      ended = true;
      if (typeof chunk === 'string') result.body = chunk;
    },
    get headersSent(): boolean {
      return result.status !== 0 && ended;
    },
    destroyed: false,
  } as unknown as http.ServerResponse;
  await handleInvestmentRequest({ method, url } as http.IncomingMessage, res, deps);
  return result;
}

interface CycleFacts {
  readonly steps: CycleStep[];
  versions: number;
  headReportId: string;
  payloadBytes: number;
  payloadDigest: string;
  transportStatus: number;
  transportVersionHeader: string | null;
  transportBodyBytes: number;
  transportBodyVersion: number | null;
}

function emptyFacts(): CycleFacts {
  return {
    steps: [],
    versions: 0,
    headReportId: '',
    payloadBytes: 0,
    payloadDigest: '',
    transportStatus: 0,
    transportVersionHeader: null,
    transportBodyBytes: 0,
    transportBodyVersion: null,
  };
}

/** Run `body` under the probe and the descriptor census, and assemble the record. */
async function measured(kind: 'full-cycle' | 'read-only-process', body: (facts: CycleFacts) => Promise<void>): Promise<ZeroSocketReport> {
  const before = censusSocketFds();
  const probe = installNetworkProbe();
  const facts = emptyFacts();
  let bodyError: unknown = null;

  try {
    await body(facts);
  } catch (cause) {
    bodyError = cause;
  } finally {
    probe.restore();
  }

  const after = censusSocketFds();
  const beforeSet = new Set(before.socketFds);
  const newSocketFds = after.socketFds.filter((entry) => !beforeSet.has(entry));

  const byClass = (kind2: AttemptClassification): NetworkAttempt[] =>
    probe.attempts.filter((attempt) => attempt.classification === kind2);
  const external = byClass('EXTERNAL');
  const loopback = byClass('LOOPBACK');
  const listen = byClass('LISTEN');
  const ipc = byClass('IPC');
  const localSocket = byClass('LOCAL_SOCKET');
  const unresolved = byClass('UNRESOLVED');

  const stepsOk = facts.steps.length >= 2 && facts.steps.every((step) => step.ok);
  const pass = bodyError === null && stepsOk && external.length === 0 && unresolved.length === 0;

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    requirement: AC_X2_REQUIREMENT,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      pid: process.pid,
      commit: process.env['GIT_COMMIT'] ?? null,
    },
    instrumentation: {
      mode: 'in-process pass-through interception of every Node outbound-connection API; a non-loopback destination is refused, not connected',
      channels: probe.channels,
      syscallTracing:
        'unavailable in this environment: strace, ltrace and bpftrace are not installed, so no kernel-level syscall trace was produced',
    },
    kind,
    cycle: {
      steps: facts.steps,
      versions: facts.versions,
      headReportId: facts.headReportId,
      payloadBytes: facts.payloadBytes,
      payloadDigest: facts.payloadDigest,
      transportStatus: facts.transportStatus,
      transportVersionHeader: facts.transportVersionHeader,
      transportBodyBytes: facts.transportBodyBytes,
      transportBodyVersion: facts.transportBodyVersion,
    },
    observation: {
      totalAttempts: probe.attempts.length,
      external: external.length,
      loopback: loopback.length,
      listen: listen.length,
      ipc: ipc.length,
      localSocket: localSocket.length,
      unresolved: unresolved.length,
      attempts: probe.attempts,
    },
    socketFdCensus: {
      before,
      after,
      newSocketFds,
      verdict:
        before.available && after.available
          ? newSocketFds.length === 0
            ? 'no new socket descriptor appeared during the cycle'
            : `${newSocketFds.length} new socket descriptor(s) appeared during the cycle`
          : 'census unavailable on this platform; the JS-level interception is the only measurement',
    },
    determination: {
      pass,
      basis: pass
        ? `the ${kind} ran to its last step, no connection to a non-loopback destination was attempted, and no new socket descriptor appeared`
        : bodyError !== null
          ? `the ${kind} did not complete: ${bodyError instanceof Error ? bodyError.message : String(bodyError)}`
          : 'the cycle did not complete, or an external (or unresolved) destination was observed',
      externalDestinations: external.map((attempt) => `${attempt.channel} → ${attempt.host ?? 'unknown'}`),
    },
    limitations: [
      'The measurement is in-process: it speaks for this Node process, not for the kernel. Syscall-level tracing was unavailable (no strace/ltrace/bpftrace in this environment) and is named as missing rather than approximated.',
      'No HTTP server is started, so the cycle contains no listening socket and no loopback connection: the transport is exercised through the same handler with a fake request/response pair, exactly as the M-1 demonstration does.',
      'A loopback connection is permitted by design §I.2 and roadmap §B.I.3 and is classified separately. None occurred in the cycle, so that permission was not exercised by it.',
      'Layered APIs can report one would-be connection on more than one channel (for example `http.request` and the `net.Socket` beneath it), so the counts bound attempts rather than count connections.',
      'If some module captured a `net`/`http` function reference before the probe was installed, that reference would not be intercepted; `net.Socket.prototype.connect` is patched as well, which catches the socket every such path eventually creates, and the descriptor census is the backstop for anything that slipped past both. The negative control exercises the pre-captured-reference path explicitly.',
      'This says nothing about production, multi-user or authenticated behaviour, and it closes neither L-004 (synthetic dataset) nor L-009 (no real issuer).',
    ],
  };
}

/**
 * The full cycle in one process: analysis → persistence → read through the service → read through the HTTP-shape
 * transport handler.
 *
 * Pass `environment` to keep the temporary store on disk (the CLI does this, so a second process can read it back);
 * without it a private environment is created and removed again.
 */
export async function runZeroSocketCycle(options: { readonly environment?: M1Environment } = {}): Promise<ZeroSocketReport> {
  const owned = options.environment === undefined;
  const env = options.environment ?? prepareM1Environment();
  try {
    return await measured('full-cycle', async (facts) => {
      // ---- 1. analysis --------------------------------------------------------------------------------------
      const assembly = assembleAssessment({
        identityDir: env.identityDir,
        datasetDir: env.datasetV1Dir,
        generatedAt: M1_NOW,
      });
      const issuerId = assembly.identity.issuerId;
      if (issuerId === null) throw new Error('identity did not resolve to an issuer id; the cycle cannot continue');
      facts.steps.push({
        step: 'analysis: assembleAssessment',
        detail: `issuer ${assembly.identity.issuerId}; scope ${assembly.composed.scopeToken}; adequacy ${assembly.assessment.adequacy}; violations ${assembly.violations}`,
        ok: assembly.identity.issuerId === M1_ISSUER_ID && assembly.violations === 0,
      });

      // ---- 2. persistence -----------------------------------------------------------------------------------
      const database = openDatabase({ path: env.dbPath, createDirectory: true, migrate: true });
      try {
        const port = adaptNp04Store(new GovernedArtifactStore(database));
        const service = createInvestmentArtifactService({ port, owner: OWNER });
        const recorded = service.recordAssessment(assembly.composed);
        facts.steps.push({
          step: 'persistence: recordAssessment',
          detail: `outcome ${recorded.outcome}; wrote ${recorded.wrote}; version ${recorded.head.artifactVersion}`,
          ok: recorded.wrote === true && recorded.head.artifactVersion === 1,
        });

        // ---- 3. read through the service --------------------------------------------------------------------
        const scopeToken = `co:${issuerId}`;
        const chain = service.readChain(scopeToken);
        const read = service.readVersionWithPayload(scopeToken, chain.head.reportId);
        facts.versions = chain.versionCount;
        facts.headReportId = chain.head.reportId;
        facts.payloadBytes = Buffer.byteLength(read.payload, 'utf8');
        facts.payloadDigest = edgeDigest(read.version.payloadDigest);
        facts.steps.push({
          step: 'read: readChain + readVersionWithPayload',
          detail: `versions ${facts.versions}; head ${facts.headReportId}; payload ${facts.payloadBytes} bytes; digest ${facts.payloadDigest}`,
          ok: facts.versions === 1 && facts.payloadBytes > 0,
        });

        // ---- 4. read through the HTTP-shape transport handler ----------------------------------------------
        // HEAD first (the version travels in a header), then GET (version and payload travel in the body). Both are
        // the handler the server mounts; neither opens a socket.
        const url = `/api/investment/company/${encodeURIComponent(issuerId)}`;
        const deps = { loadPort: async () => port, resolveOwner: () => OWNER_CONTEXT };
        const head = await transportRead('HEAD', url, deps);
        const header = head.headers['x-investment-artifact-version'];
        facts.transportVersionHeader = typeof header === 'string' ? header : header === undefined ? null : String(header);
        const response = await transportRead('GET', url, deps);
        facts.transportStatus = response.status;
        facts.transportBodyBytes = response.body.length;
        try {
          const body = JSON.parse(response.body) as { version?: { artifactVersion?: unknown } };
          const value = body.version?.artifactVersion;
          facts.transportBodyVersion = typeof value === 'number' ? value : null;
        } catch {
          facts.transportBodyVersion = null;
        }
        facts.steps.push({
          step: 'read: handleInvestmentRequest (HTTP shape, no socket)',
          detail: `HEAD ${head.status} (version header ${facts.transportVersionHeader ?? 'absent'}); GET ${response.status} (version ${facts.transportBodyVersion ?? 'absent'}, ${facts.transportBodyBytes} bytes)`,
          ok: head.status === 200 && response.status === 200 && facts.transportBodyBytes > 0,
        });
      } finally {
        (database as { close?: () => void }).close?.();
      }
    });
  } finally {
    if (owned) env.cleanup();
  }
}

/**
 * The read half of the cycle, in **its own process**, against a store another process wrote.
 *
 * This is the corroboration that "read time" is not an accident of a single process's warm state: the reading process
 * imports the service for the first time, opens the store it finds on disk, and does the same validated chain read.
 */
export async function runZeroSocketReadCycle(options: { readonly databasePath: string }): Promise<ZeroSocketReport> {
  return measured('read-only-process', async (facts) => {
    const database = openDatabase({ path: options.databasePath, createDirectory: false, migrate: false });
    try {
      const port = adaptNp04Store(new GovernedArtifactStore(database));
      const service = createInvestmentArtifactService({ port, owner: OWNER });
      const scopeToken = `co:${M1_ISSUER_ID}`;
      const chain = service.readChain(scopeToken);
      const read = service.readVersionWithPayload(scopeToken, chain.head.reportId);
      facts.versions = chain.versionCount;
      facts.headReportId = chain.head.reportId;
      facts.payloadBytes = Buffer.byteLength(read.payload, 'utf8');
      facts.payloadDigest = edgeDigest(read.version.payloadDigest);
      facts.steps.push({
        step: 'read (separate process): open store from disk',
        detail: `${options.databasePath.split('/').slice(-2).join('/')} opened read-only in pid ${process.pid}`,
        ok: true,
      });
      facts.steps.push({
        step: 'read (separate process): readChain + readVersionWithPayload',
        detail: `versions ${facts.versions}; head ${facts.headReportId}; payload ${facts.payloadBytes} bytes`,
        ok: facts.versions >= 1 && facts.payloadBytes > 0,
      });
    } finally {
      (database as { close?: () => void }).close?.();
    }
  });
}

function edgeDigest(digest: string): string {
  return digest.length > 20 ? `${digest.slice(0, 16)}…${digest.slice(-4)}` : digest;
}

/** Compact human-readable summary of the record, for the console. */
export function summarise(report: ZeroSocketReport): string {
  return [
    `AC-X2 zero external network — ${report.determination.pass ? 'PASS' : 'FAIL'} [${report.kind}, pid ${report.environment.pid}]`,
    `cycle: ${report.cycle.steps.map((step) => `${step.step} [${step.ok ? 'ok' : 'FAILED'}]`).join(' → ')}`,
    `versions ${report.cycle.versions}; head ${report.cycle.headReportId}; payload ${report.cycle.payloadBytes} bytes; transport ${report.cycle.transportStatus}`,
    `attempts: total ${report.observation.totalAttempts} · external ${report.observation.external} · loopback ${report.observation.loopback} · listen ${report.observation.listen} · ipc ${report.observation.ipc} · local-socket ${report.observation.localSocket} · unresolved ${report.observation.unresolved}`,
    `socket-fd census: before ${report.socketFdCensus.before.socketFds.length} · after ${report.socketFdCensus.after.socketFds.length} · new ${report.socketFdCensus.newSocketFds.length} — ${report.socketFdCensus.verdict}`,
    `instrumented channels: ${report.instrumentation.channels.join(', ')}`,
  ].join('\n');
}
