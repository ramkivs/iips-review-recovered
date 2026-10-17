/**
 * G-2 Gate B — SAME-HOST IPC CLIENT (IRR side).
 *
 * AUTHORITY: `IIPS-V3-G2-IRR-GATE-B-D4-IMPLEMENTATION-AUTHORITY-PA-DECISION-RENDERED-2026-10-17-01`
 * (D-4 `ACCEPT`, exact §15 wording), on the designated IRR baseline `10584439…` and the
 * designated implementation ref `refs/heads/gate-b/local-principal-ipc-implementation`.
 * Scope is exactly the eight-file set of that act; this file is one of the four sources.
 *
 * WHAT THIS MODULE IS
 *   A dependency-free client for the IPD-owned, single-principal, same-host IPC endpoint
 *   (`L-IPC-1` C1–C5). Windows named pipe for the deployment; POSIX domain socket for dev/CI.
 *   It performs exactly ONE request per operation, with strict framing, hard size caps and a
 *   single deadline, and it fails closed — no retry, no alternate surface, no fallback.
 *
 * WHAT THIS MODULE CANNOT DO (binding properties)
 *   1. It cannot speak TCP, HTTP, TLS, mTLS or OIDC: `IpcEndpoint.kind` is the closed set
 *      `'pipe' | 'unix'`, and no host/port/URL form parses as an endpoint.
 *   2. It cannot send identity, authority or scope. Every payload is scanned before a byte is
 *      encoded (`IPC_FORBIDDEN_WIRE_KEYS`); a forbidden key aborts the exchange before any
 *      connection is made. This is C3: the arrival of the request on the endpoint *is* the
 *      principal; IRR supplies no principal, owner, tenant, membership or portfolio-scope value.
 *   3. It cannot produce or consume bytes before a complete, valid request frame exists: the
 *      socket is opened only after the frame is encoded, and nothing is written before `connect`.
 *   4. It cannot keep state: no cache, no queue, no journal, no store (C11). No response is
 *      retained beyond the caller's promise.
 *   5. It never interprets a response as identity. Transport success means "the peer answered
 *      with a well-formed frame"; it is not an authentication result.
 *
 * FRAMING (strict, versioned)
 *   request  := uint32-be length | UTF-8 JSON `{ protocol: 1, operation, payload }`
 *   response := uint32-be length | UTF-8 JSON object
 *   The declared length must fit its cap; the received byte count must equal exactly
 *   `4 + declared` — a short frame, an over-long frame, trailing bytes, a non-object body or
 *   malformed JSON is a protocol violation and fails closed.
 *
 * FAIL-CLOSED (C6)
 *   Absent endpoint, refused connection, reset, timeout, malformed frame and oversized frame all
 *   produce `IpcTransportError`. The adapter maps every transport failure to the existing
 *   closed refusal vocabulary; transport failure reasons are diagnostics for tests, never an
 *   HTTP surface and never an owner-existence signal.
 */

import * as net from 'node:net';

/** Wire protocol revision. A change requires its own governed act. */
export const IPC_PROTOCOL_VERSION = 1;

/** uint32 big-endian length prefix. */
export const IPC_FRAME_HEADER_BYTES = 4;

/** Hard request-size cap (frame body, excluding the 4-byte header). */
export const IPC_MAX_REQUEST_BYTES = 256 * 1024;

/** Hard response-size cap (frame body, excluding the 4-byte header). */
export const IPC_MAX_RESPONSE_BYTES = 1024 * 1024;

/** Maximum accepted endpoint-path length (malformed-input limit). */
export const IPC_MAX_ENDPOINT_LENGTH = 512;

/** Conservative POSIX `sun_path` margin for Unix domain sockets. */
export const IPC_MAX_UNIX_PATH_LENGTH = 100;

/** Single deadline covering connect + write + response by default. */
export const IPC_DEFAULT_TIMEOUT_MS = 2_000;

/** Upper bound on a caller-selected deadline. */
export const IPC_MAX_TIMEOUT_MS = 30_000;

/** Windows named-pipe namespace prefix. */
export const IPC_PIPE_PREFIX = '\\\\.\\pipe\\';

/**
 * Closed transport kinds. TCP is not representable by design: IRR exposes no network surface
 * for owner-scoped operations and never falls back to one (C1, C2, C8).
 */
export type IpcTransportKind = 'pipe' | 'unix';

/** A provisioned same-host endpoint. Opaque to IRR; never derived from a request. */
export interface IpcEndpoint {
  readonly kind: IpcTransportKind;
  readonly path: string;
}

/** Non-disclosing transport failure classes (diagnostics only — never an HTTP surface). */
export type IpcFailureKind =
  | 'endpoint-unavailable'
  | 'timeout'
  | 'protocol-violation'
  | 'request-too-large'
  | 'response-too-large'
  | 'forbidden-field';

/**
 * A failed exchange. Carries a class only: no path, no peer detail, no request or response bytes.
 * Callers must map it to the closed `G2FailureReason` vocabulary; it is never an owner signal.
 */
export class IpcTransportError extends Error {
  constructor(readonly kind: IpcFailureKind) {
    super('Same-host IPC exchange failed.');
    this.name = 'IpcTransportError';
  }
}

/**
 * Caller-supplied authority that may not cross this boundary (C3, C7, C12).
 *
 * The list deliberately includes the DP-1/F-3 owner-context names, the tenant/scope names and
 * the C12 canonical-identity names: none of them is a wire field on this path, and the endpoint
 * binding — not a payload — is the identity source.
 */
export const IPC_FORBIDDEN_WIRE_KEYS: readonly string[] = Object.freeze([
  'principal', 'owner', 'ownerUserId', 'ownership',
  'tenant', 'tenantId', 'tenantHint', 'membership', 'memberships',
  'scope', 'portfolioScope',
  'userId', 'user', 'subject', 'roles', 'role',
  'applicationUserId', 'mappingId', 'endpointId',
  'companyId', 'runtimeCompanyId', 'identityStatus', 'resolutionDisposition',
]);

/** One request frame. `payload` is `null` when the operation carries no parameters. */
export interface IpcRequest {
  readonly protocol: typeof IPC_PROTOCOL_VERSION;
  readonly operation: string;
  readonly payload: Readonly<Record<string, unknown>> | null;
}

/** Optional per-exchange limits. Values are validated and capped; defaults apply otherwise. */
export interface IpcExchangeOptions {
  readonly timeoutMs?: number;
  readonly maxRequestBytes?: number;
  readonly maxResponseBytes?: number;
}

/** Operation names are a closed, boring shape; anything else is a programming error. */
const OPERATION_PATTERN = /^[a-z][A-Za-z0-9]{0,63}$/;

/** True for a plain data record (no arrays, no class instances, no null). */
function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Validates a provisioned endpoint path.
 *
 * Returns `null` for anything that is not a named pipe or an absolute POSIX socket path —
 * including `host:port`, URLs, relative paths and control characters. No default is supplied.
 */
export function parseIpcEndpoint(value: unknown): IpcEndpoint | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0 || value.length > IPC_MAX_ENDPOINT_LENGTH) return null;
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;
  if (value.startsWith(IPC_PIPE_PREFIX)) {
    const pipeName = value.slice(IPC_PIPE_PREFIX.length);
    if (pipeName.length === 0) return null;
    if (pipeName.startsWith('\\')) return null;
    return Object.freeze({ kind: 'pipe' as const, path: value });
  }
  // A scheme or a host:port pair is never an endpoint on this path.
  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)) return null;
  if (!value.startsWith('/')) return null;
  if (value.length > IPC_MAX_UNIX_PATH_LENGTH) return null;
  return Object.freeze({ kind: 'unix' as const, path: value });
}

/**
 * Finds forbidden authority keys anywhere in a would-be payload.
 *
 * Pure inspection. Bounded depth and a visited set keep a hostile/cyclic object from hanging
 * the scan; the caller turns any hit into a fail-closed `forbidden-field` error.
 */
export function findForbiddenWireKeys(value: unknown, forbidden: readonly string[] = IPC_FORBIDDEN_WIRE_KEYS): readonly string[] {
  const hits: string[] = [];
  const visited = new WeakSet<object>();
  const walk = (node: unknown, prefix: string, depth: number): void => {
    if (depth > 8) return;
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${prefix}[${index}]`, depth + 1));
      return;
    }
    if (!isPlainRecord(node)) return;
    if (visited.has(node)) return;
    visited.add(node);
    for (const key of Object.keys(node)) {
      const path = prefix.length === 0 ? key : `${prefix}.${key}`;
      if (forbidden.includes(key)) hits.push(path);
      walk(node[key], path, depth + 1);
    }
  };
  walk(value, '', 0);
  return Object.freeze(hits);
}

/**
 * Builds and validates ONE request value. Throws `forbidden-field` before any encoding when the
 * payload carries authority, and `protocol-violation` for a non-record payload.
 */
export function buildIpcRequest(operation: string, payload?: Readonly<Record<string, unknown>>): IpcRequest {
  if (typeof operation !== 'string' || !OPERATION_PATTERN.test(operation)) {
    throw new IpcTransportError('protocol-violation');
  }
  if (payload !== undefined && !isPlainRecord(payload)) {
    throw new IpcTransportError('protocol-violation');
  }
  if (payload !== undefined && findForbiddenWireKeys(payload).length > 0) {
    throw new IpcTransportError('forbidden-field');
  }
  return Object.freeze({
    protocol: IPC_PROTOCOL_VERSION,
    operation,
    payload: payload === undefined ? null : payload,
  });
}

/** Encodes any JSON value as one length-prefixed frame, enforcing the byte cap. */
export function encodeIpcFrame(value: unknown, maxBytes: number = IPC_MAX_REQUEST_BYTES): Buffer {
  let text: string;
  try {
    const encoded = JSON.stringify(value);
    if (typeof encoded !== 'string') throw new Error('not-serializable');
    text = encoded;
  } catch {
    throw new IpcTransportError('protocol-violation');
  }
  const body = Buffer.from(text, 'utf8');
  if (body.length > maxBytes) throw new IpcTransportError('request-too-large');
  const frame = Buffer.allocUnsafe(IPC_FRAME_HEADER_BYTES + body.length);
  frame.writeUInt32BE(body.length, 0);
  body.copy(frame, IPC_FRAME_HEADER_BYTES);
  return frame;
}

/**
 * Decodes exactly one response frame.
 *
 * Strict: the buffer must contain the header, the declared body, and nothing else. The body must
 * be a JSON object. Any deviation is a protocol violation (fail closed).
 */
export function decodeIpcFrame(frame: Buffer, maxBytes: number = IPC_MAX_RESPONSE_BYTES): Record<string, unknown> {
  if (!Buffer.isBuffer(frame) || frame.length < IPC_FRAME_HEADER_BYTES) {
    throw new IpcTransportError('protocol-violation');
  }
  const declared = frame.readUInt32BE(0);
  if (declared > maxBytes) throw new IpcTransportError('response-too-large');
  if (frame.length !== IPC_FRAME_HEADER_BYTES + declared) throw new IpcTransportError('protocol-violation');
  let parsed: unknown;
  try {
    parsed = JSON.parse(frame.subarray(IPC_FRAME_HEADER_BYTES).toString('utf8'));
  } catch {
    throw new IpcTransportError('protocol-violation');
  }
  if (!isPlainRecord(parsed)) throw new IpcTransportError('protocol-violation');
  return parsed;
}

/** Encodes one validated request frame (validates the payload's authority scan first). */
export function encodeRequestFrame(
  operation: string,
  payload?: Readonly<Record<string, unknown>>,
  maxBytes: number = IPC_MAX_REQUEST_BYTES,
): Buffer {
  return encodeIpcFrame(buildIpcRequest(operation, payload), maxBytes);
}

/** Resolves a caller-provided cap to a safe value (never above the hard ceiling). */
function resolveCap(value: unknown, fallback: number, ceiling: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= ceiling
    ? value
    : fallback;
}

/**
 * Performs exactly ONE same-host IPC exchange.
 *
 * Sequence: validate + encode (no socket yet) → connect (nothing written before `connect`) →
 * write the single request frame → read exactly one response frame → resolve its JSON object.
 * There is no retry, no second request, no alternate endpoint and no fallback.
 */
export async function exchange(
  operation: string,
  payload: Readonly<Record<string, unknown>> | undefined,
  endpoint: IpcEndpoint,
  options: IpcExchangeOptions = {},
): Promise<unknown> {
  const maxRequestBytes = resolveCap(options.maxRequestBytes, IPC_MAX_REQUEST_BYTES, IPC_MAX_REQUEST_BYTES);
  const maxResponseBytes = resolveCap(options.maxResponseBytes, IPC_MAX_RESPONSE_BYTES, IPC_MAX_RESPONSE_BYTES);
  const timeoutMs = resolveCap(options.timeoutMs, IPC_DEFAULT_TIMEOUT_MS, IPC_MAX_TIMEOUT_MS);
  const frame = encodeRequestFrame(operation, payload, maxRequestBytes);

  const parsed = endpoint && typeof endpoint === 'object' ? parseIpcEndpoint(endpoint.path) : null;
  if (!parsed || parsed.kind !== endpoint.kind) {
    throw new IpcTransportError('endpoint-unavailable');
  }

  return await new Promise<unknown>((resolve, reject) => {
    let settled = false;
    let requestWritten = false;
    const chunks: Buffer[] = [];
    let received = 0;
    let declared: number | null = null;

    const socket = net.connect({ path: parsed.path });
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (error?: Error, value?: unknown): void => {
      if (settled) return;
      settled = true;
      if (timer !== undefined) clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else resolve(value);
    };

    timer = setTimeout(() => finish(new IpcTransportError('timeout')), timeoutMs);

    socket.once('connect', () => {
      // The ONLY write of the exchange. Nothing was written before this point.
      requestWritten = true;
      try {
        socket.write(frame);
      } catch {
        finish(new IpcTransportError('endpoint-unavailable'));
      }
    });

    socket.on('data', (chunk: Buffer) => {
      if (!requestWritten) {
        finish(new IpcTransportError('protocol-violation'));
        return;
      }
      chunks.push(chunk);
      received += chunk.length;
      if (declared === null && received >= IPC_FRAME_HEADER_BYTES) {
        declared = Buffer.concat(chunks, received).readUInt32BE(0);
        if (declared > maxResponseBytes) {
          finish(new IpcTransportError('response-too-large'));
          return;
        }
      }
      if (declared !== null && received >= IPC_FRAME_HEADER_BYTES + declared) {
        if (received !== IPC_FRAME_HEADER_BYTES + declared) {
          finish(new IpcTransportError('protocol-violation'));
          return;
        }
        try {
          finish(undefined, decodeIpcFrame(Buffer.concat(chunks, received), maxResponseBytes));
        } catch (error) {
          finish(error instanceof IpcTransportError ? error : new IpcTransportError('protocol-violation'));
        }
      }
    });

    // Absent, refusing, resetting and closing peers are indistinguishable to callers (C6).
    socket.on('error', () => finish(new IpcTransportError('endpoint-unavailable')));
    socket.on('close', () => finish(new IpcTransportError('endpoint-unavailable')));
  });
}
