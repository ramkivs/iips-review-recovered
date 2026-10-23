/**
 * G-3 same-host IPC client (IRR side).
 *
 * Authority: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.1 item 1,
 * implementing accepted IPD-owned wire contract v1 (transport/framing T-1…T-8,
 * owner-context provenance OC-1…OC-7).
 *
 * WHAT THIS MODULE IS
 *   The IRR half of the same-host IPC boundary: it frames one request, sends it to
 *   IPD's local endpoint, and reads at most one response frame. It is a *client*.
 *   It creates **no** listener of any kind — no TCP, no HTTP, no URL, no socket
 *   server — and it never stores a credential.
 *
 * WHAT IT DELIBERATELY CANNOT DO
 *   - **Put an authority field on the wire.** OC-7/C7 is re-enforced here, before
 *     send, by `encodeRequestFrame`, which refuses to encode an envelope carrying any
 *     owner, tenant, principal, credential, scope, session or canonical-identity key
 *     — at any nesting depth. The refusal is a thrown `IpcWireAuthorityError`, so
 *     there is no code path that transmits one. Re-enforcement is not trust in IPD:
 *     IPD refuses independently, and a bug on either side cannot become a disclosure.
 *   - **Retry.** Exactly one connection attempt per call. A write is never
 *     auto-retried, because a retry could duplicate a commit whose outcome is
 *     unknown.
 *   - **Claim an outcome it did not observe.** A timeout is reported as
 *     `OUTCOME_UNKNOWN`, not as a failure and not as a success: the write may or may
 *     not have committed upstream.
 *   - **Distinguish Class P causes.** IPD emits zero bytes and closes for every
 *     pre-authorization refusal, and records the reason only in its own bounded
 *     local sink. IRR therefore observes `bytesReceived: 0` and **no reason**. That
 *     is C6 non-disclosure working as designed, not missing information; this module
 *     invents no reason to fill the gap.
 *
 * CONFIGURATION (OC-3/OC-4/OC-5)
 *   IRR's server-owned configuration is limited to the endpoint setting
 *   `IIPS_G2_IPC_ENDPOINT` plus the IRR-local binding precondition in
 *   `ownerContextFromBinding.ts`. The endpoint name is **not** a credential: knowing
 *   it authorizes nothing, because IPD resolves the owner from its own single
 *   `ACTIVE` A-2 binding on every request (OC-2). Configuration is read **per call**
 *   (OC-5) and never cached.
 *
 *   The setting is accepted in either of two explicit forms, because contract v1
 *   fixes the *name* but not whether an operator records a bare endpoint name or a
 *   full local path:
 *     - an **absolute local path** — used verbatim; or
 *     - a **bare endpoint name** — resolved against `IIPS_G3_LOCAL_STATE_DIR` to
 *       `<dir>/<name>.sock` on POSIX, or `\\.\pipe\<name>` on Windows.
 *   Anything else (a relative path, a `host:port`, a URL, a missing value) is
 *   refused. This module never guesses a location and never falls back to a network
 *   target.
 *
 * WINDOWS CAVEAT: named-pipe behaviour and its ACL/DACL are Gate 4 host-only
 * evidence and remain UNVERIFIED from this environment. Only the POSIX path is
 * exercised in CI.
 */
import { createConnection, type Socket } from 'node:net';
import { posix as posixPath, win32 as win32Path } from 'node:path';

import { G2_IPC_ENDPOINT_SETTING } from './userPortfolioContract.js';

/* ------------------------------------------------------------------ *
 * Contract v1 constants (transport / framing)
 * ------------------------------------------------------------------ */

/** Wire protocol version. Only `1` exists; there is no negotiation (T-3, V-2). */
export const IPC_PROTOCOL_VERSION = 1;

/** uint32 big-endian length prefix. */
export const IPC_LENGTH_PREFIX_BYTES = 4;

/** Request cap: 64 KiB (T-4). */
export const IPC_REQUEST_MAX_BYTES = 64 * 1024;

/** Response cap: 256 KiB (T-4). */
export const IPC_RESPONSE_MAX_BYTES = 256 * 1024;

/** Per-call timeout: 5 s. Expiry is outcome-unknown, never a retry. */
export const IPC_TIMEOUT_MS = 5_000;

/** Re-exported so the single authorized setting name has one definition. */
export const IPC_ENDPOINT_SETTING = G2_IPC_ENDPOINT_SETTING;

/**
 * Operator-local directory used only when the endpoint setting holds a bare name.
 * It is a **location**, never an authorization.
 */
export const IPC_STATE_DIR_SETTING = 'IIPS_G3_LOCAL_STATE_DIR';

/* ------------------------------------------------------------------ *
 * The closed operation set
 * ------------------------------------------------------------------ */

export type IpcOperation =
  | 'portfolio.list'
  | 'portfolio.get'
  | 'portfolio.revisions'
  | 'portfolio.create'
  | 'portfolio.save'
  | 'portfolio.reset'
  | 'portfolio.delete';

/** The three reads. */
export const IPC_READ_OPERATIONS: readonly IpcOperation[] = [
  'portfolio.list',
  'portfolio.get',
  'portfolio.revisions',
];

/**
 * The four writes. **Defined but not authorized**: IPD refuses every one with zero
 * store effect while the W-1 conjunction is unmet.
 */
export const IPC_WRITE_OPERATIONS: readonly IpcOperation[] = [
  'portfolio.create',
  'portfolio.save',
  'portfolio.reset',
  'portfolio.delete',
];

export const IPC_OPERATIONS: readonly IpcOperation[] = [
  ...IPC_READ_OPERATIONS,
  ...IPC_WRITE_OPERATIONS,
];

/**
 * Reserved, never dispatched, and refused by IPD as `UNKNOWN_OPERATION` —
 * indistinguishably from any other unknown operation. IRR must not send it.
 */
export const IPC_RESERVED_OPERATIONS: readonly string[] = ['portfolio.analytics'];

export function isWriteOperation(op: string): boolean {
  return (IPC_WRITE_OPERATIONS as readonly string[]).includes(op);
}

/* ------------------------------------------------------------------ *
 * Error vocabulary
 * ------------------------------------------------------------------ */

/** Class P reasons. IRR knows these exist but can never observe which one applied. */
export type IpcClassPReason =
  | 'MALFORMED_FRAME'
  | 'OVERSIZE_FRAME'
  | 'PROTOCOL_VERSION_UNSUPPORTED'
  | 'UNKNOWN_OPERATION'
  | 'CALLER_SUPPLIED_AUTHORITY'
  | 'BINDING_ABSENT'
  | 'BINDING_INVALID'
  | 'CAPACITY_EXCEEDED'
  | 'IDLE_TIMEOUT';

/** Class A outcomes — typed, non-disclosing, emitted only after authorization. */
export type IpcClassAOutcome =
  | 'RESOURCE_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'REVISION_CONFLICT'
  | 'REFUSED_UNRESOLVED_IDENTITY'
  | 'REFUSED_STORE_GUARD'
  | 'WRITE_NOT_AUTHORIZED'
  | 'UNAVAILABLE';

export type IpcErrorKind =
  /** The endpoint setting is absent or not a local target. */
  | 'ENDPOINT_NOT_CONFIGURED'
  /** The request would carry an authority field; it was never sent. */
  | 'CALLER_SUPPLIED_AUTHORITY'
  /** The envelope shape or protocol version is not the one v1 fixes. */
  | 'MALFORMED_ENVELOPE'
  /** The operation is outside the closed v1 set, or is reserved. */
  | 'UNKNOWN_OPERATION'
  /** The encoded request exceeds the 64 KiB cap; it was never sent. */
  | 'REQUEST_OVERSIZE'
  /** The declared response length exceeds the 256 KiB cap. */
  | 'RESPONSE_OVERSIZE'
  /** The transport could not be opened, or the peer faulted. */
  | 'TRANSPORT_FAULT';

/** A local, pre-send refusal. Nothing reached the wire. */
export class IpcClientError extends Error {
  constructor(
    readonly kind: IpcErrorKind,
    message: string,
    /** The refused key names, when `kind` is `CALLER_SUPPLIED_AUTHORITY`. */
    readonly refusedKeys: readonly string[] = [],
  ) {
    super(message);
    this.name = 'IpcClientError';
  }
}

/** Specialization used where the authority refusal deserves its own type. */
export class IpcWireAuthorityError extends IpcClientError {
  constructor(refusedKeys: readonly string[]) {
    super(
      'CALLER_SUPPLIED_AUTHORITY',
      'the request carries a caller-supplied authority field and was not sent',
      refusedKeys,
    );
    this.name = 'IpcWireAuthorityError';
  }
}

/* ------------------------------------------------------------------ *
 * OC-7 / C7 — authority keys that may never cross the wire
 * ------------------------------------------------------------------ */

/**
 * The certified 29 IPD caller-identity keys, transcribed from the accepted contract
 * vocabulary. IRR keeps its own copy because re-enforcement (OC-7) must not depend
 * on the peer's implementation being present, correct or reachable.
 */
export const IPC_CALLER_IDENTITY_KEYS: readonly string[] = [
  'owner',
  'ownerId',
  'tenant',
  'tenantId',
  'applicationUserId',
  'applicationUser',
  'userId',
  'user',
  'principal',
  'principalId',
  'membership',
  'membershipId',
  'credential',
  'credentials',
  'password',
  'secret',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'authHeader',
  'claims',
  'scope',
  'scopes',
  'role',
  'roles',
  'identity',
  'sessionId',
  'applicationPrincipal',
];

/**
 * The C7 additions: canonical-identity and tenant-hint claims. A holding carrying
 * `companyId` or `identityStatus` would be a caller assertion of canonical identity,
 * which IPD resolves itself (Gate E W-6).
 */
export const IPC_CANONICAL_IDENTITY_KEYS: readonly string[] = [
  'companyId',
  'runtimeCompanyId',
  'identityStatus',
  'resolutionDisposition',
  'tenantHint',
  'tenantId',
];

/** Every key refused on the wire: the union, de-duplicated. */
export const IPC_REFUSED_WIRE_KEYS: readonly string[] = Array.from(
  new Set([...IPC_CALLER_IDENTITY_KEYS, ...IPC_CANONICAL_IDENTITY_KEYS]),
).sort();

/** Maximum nesting depth scanned; deeper structures are refused. */
export const IPC_MAX_SCAN_DEPTH = 12;

/**
 * Deeply scans a value for keys drawn from `keySet`.
 *
 * Scans objects, arrays and nested `options`/`holdings` alike: a shallow check would
 * leave a smuggling route open. Returns sorted, de-duplicated key **names** only —
 * never values, which could carry a caller's claim into a log.
 */
export function findKeysFrom(
  value: unknown,
  keySet: readonly string[],
  depth = 0,
): string[] {
  if (depth > IPC_MAX_SCAN_DEPTH) return ['(depth-limit-exceeded)'];
  if (value === null || typeof value !== 'object') return [];

  const found = new Set<string>();
  if (Array.isArray(value)) {
    for (const item of value) {
      for (const key of findKeysFrom(item, keySet, depth + 1)) found.add(key);
    }
    return Array.from(found).sort();
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (keySet.includes(key)) found.add(key);
    for (const nested of findKeysFrom(record[key], keySet, depth + 1)) found.add(nested);
  }
  return Array.from(found).sort();
}

/**
 * Refused **outbound** authority keys (OC-7/C7): the full union, including the
 * canonical-identity fields, because IRR may not assert a canonical identity.
 */
export function findRefusedWireKeys(value: unknown): string[] {
  return findKeysFrom(value, IPC_REFUSED_WIRE_KEYS);
}

/**
 * Refused **inbound** disclosure keys (OC-6): owner, tenant, principal, credential,
 * scope and session identifiers.
 *
 * Deliberately narrower than the outbound set. A response legitimately carries
 * IPD-resolved canonical identity on its holdings — `companyId`, `identityStatus`,
 * `resolutionDisposition` — which is exactly what IRR is entitled to *receive* and
 * what it may never *assert* (Gate E W-6). Refusing those inbound would reject every
 * valid portfolio view; refusing an owner or tenant identifier inbound is required.
 */
export function findResponseDisclosedKeys(value: unknown): string[] {
  return findKeysFrom(value, IPC_CALLER_IDENTITY_KEYS);
}

/* ------------------------------------------------------------------ *
 * Endpoint resolution (OC-3/OC-5) — local only, fail closed
 * ------------------------------------------------------------------ */

export interface IpcEndpointTarget {
  /** `unix-socket` on POSIX, `windows-named-pipe` on Windows. */
  readonly kind: 'unix-socket' | 'windows-named-pipe';
  /** The local path to connect to. Never a host, port or URL. */
  readonly path: string;
  /** Which form the setting took, for diagnostics. */
  readonly source: 'absolute-path' | 'name-in-state-directory';
}

/**
 * Resolves the local endpoint from operator configuration, **per call**.
 *
 * Refuses a missing value, a relative path, a `host:port`, a URL, a bare name with
 * no state directory, and an unsafe name. There is no default endpoint and no
 * network fallback: an unresolvable endpoint means the call is not made.
 */
export function resolveIpcEndpoint(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
): IpcEndpointTarget {
  const raw = env[IPC_ENDPOINT_SETTING];
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new IpcClientError(
      'ENDPOINT_NOT_CONFIGURED',
      `${IPC_ENDPOINT_SETTING} is not set; no IPC call can be made`,
    );
  }
  const value = raw.trim();

  // A URL or host:port is never a local endpoint target.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) || value.includes('://')) {
    throw new IpcClientError('ENDPOINT_NOT_CONFIGURED', 'the endpoint setting must not be a URL');
  }
  if (/^[^/\\]+:\d+$/.test(value)) {
    throw new IpcClientError('ENDPOINT_NOT_CONFIGURED', 'the endpoint setting must not be a host:port');
  }

  const isAbsoluteTarget = platform === 'win32' ? win32Path.isAbsolute : posixPath.isAbsolute;
  if (isAbsoluteTarget(value)) {
    if (platform === 'win32') {
      if (!value.startsWith('\\\\.\\pipe\\')) {
        throw new IpcClientError(
          'ENDPOINT_NOT_CONFIGURED',
          'on Windows the endpoint path must be a named pipe',
        );
      }
      return { kind: 'windows-named-pipe', path: value, source: 'absolute-path' };
    }
    if (value.startsWith('\\\\')) {
      throw new IpcClientError(
        'ENDPOINT_NOT_CONFIGURED',
        'a named-pipe path is not a valid POSIX endpoint',
      );
    }
    return { kind: 'unix-socket', path: value, source: 'absolute-path' };
  }

  // A bare endpoint name: resolve against the operator-local state directory.
  if (!/^[A-Za-z0-9._-]+$/.test(value) || value.includes('..')) {
    throw new IpcClientError(
      'ENDPOINT_NOT_CONFIGURED',
      'the endpoint name may contain only letters, digits, dot, underscore and hyphen',
    );
  }
  const directory = env[IPC_STATE_DIR_SETTING];
  if (typeof directory !== 'string' || directory.trim().length === 0) {
    throw new IpcClientError(
      'ENDPOINT_NOT_CONFIGURED',
      `a bare endpoint name requires ${IPC_STATE_DIR_SETTING}`,
    );
  }
  // Absoluteness is judged by the TARGET platform's rules, not the host's, so a
  // Windows path is validated correctly even when this code is exercised elsewhere.
  const isAbsoluteFor = platform === 'win32' ? win32Path.isAbsolute : posixPath.isAbsolute;
  if (!isAbsoluteFor(directory.trim())) {
    throw new IpcClientError(
      'ENDPOINT_NOT_CONFIGURED',
      `${IPC_STATE_DIR_SETTING} must be absolute`,
    );
  }
  if (platform === 'win32') {
    return {
      kind: 'windows-named-pipe',
      path: `\\\\.\\pipe\\${value}`,
      source: 'name-in-state-directory',
    };
  }
  const base = directory.trim().replace(/\/+$/, '');
  return { kind: 'unix-socket', path: `${base}/${value}.sock`, source: 'name-in-state-directory' };
}

/* ------------------------------------------------------------------ *
 * Framing (T-1…T-8)
 * ------------------------------------------------------------------ */

export interface IpcRequestEnvelope {
  readonly v: 1;
  readonly op: IpcOperation;
  readonly payload?: Record<string, unknown>;
  readonly requestId?: string;
}

/**
 * Encodes one request frame: uint32 BE length + UTF-8 JSON.
 *
 * Refuses **before** encoding when the envelope carries any authority key (OC-7/C7),
 * when the operation is outside the closed set or is reserved, or when the encoded
 * body would exceed the 64 KiB cap. A refused envelope is never handed to a socket.
 */
export function encodeRequestFrame(envelope: IpcRequestEnvelope): Buffer {
  const record = envelope as unknown as Record<string, unknown>;

  // OC-7 / C7 first: re-enforced before any other check, so a smuggled authority key
  // is reported as exactly that rather than as a generic shape problem. This runs
  // before encoding and before any socket is opened.
  const refused = findRefusedWireKeys(record);
  if (refused.length > 0) throw new IpcWireAuthorityError(refused);

  // Closed envelope key set: exactly v / op / payload? / requestId?.
  for (const key of Object.keys(record)) {
    if (!['v', 'op', 'payload', 'requestId'].includes(key)) {
      throw new IpcClientError('MALFORMED_ENVELOPE', `unexpected envelope key: ${key}`);
    }
  }
  if (record.v !== IPC_PROTOCOL_VERSION) {
    throw new IpcClientError('MALFORMED_ENVELOPE', 'only wire protocol version 1 may be sent');
  }
  if (typeof record.op !== 'string' || !(IPC_OPERATIONS as readonly string[]).includes(record.op)) {
    throw new IpcClientError('UNKNOWN_OPERATION', 'the operation is outside the closed v1 set');
  }
  if ((IPC_RESERVED_OPERATIONS as readonly string[]).includes(record.op)) {
    throw new IpcClientError('UNKNOWN_OPERATION', 'the operation is reserved and must not be sent');
  }

  const body = Buffer.from(JSON.stringify(record), 'utf8');
  if (body.byteLength > IPC_REQUEST_MAX_BYTES) {
    throw new IpcClientError(
      'REQUEST_OVERSIZE',
      `the request exceeds the ${IPC_REQUEST_MAX_BYTES}-byte cap`,
    );
  }

  const prefix = Buffer.allocUnsafe(IPC_LENGTH_PREFIX_BYTES);
  prefix.writeUInt32BE(body.byteLength, 0);
  return Buffer.concat([prefix, body]);
}

export interface IpcSuccessFrame {
  readonly v: 1;
  readonly ok: true;
  readonly op: IpcOperation;
  readonly requestId?: string;
  readonly result: unknown;
}

export interface IpcOutcomeFrame {
  readonly v: 1;
  readonly ok: false;
  readonly op: IpcOperation;
  readonly requestId?: string;
  readonly outcome: IpcClassAOutcome;
  readonly detail?: string;
}

export type IpcResponseFrame = IpcSuccessFrame | IpcOutcomeFrame;

/**
 * Validates a decoded response body against the contract v1 envelope shapes.
 *
 * Fail closed: anything unexpected is a transport fault, never data. An owner,
 * tenant or principal identifier appearing in a response would violate OC-6, so a
 * response carrying one is refused rather than surfaced.
 */
export function parseResponseFrame(body: unknown): IpcResponseFrame {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new IpcClientError('TRANSPORT_FAULT', 'the response is not a JSON object');
  }
  const frame = body as Record<string, unknown>;
  if (frame.v !== IPC_PROTOCOL_VERSION) {
    throw new IpcClientError('TRANSPORT_FAULT', 'the response carries an unsupported protocol version');
  }
  if (typeof frame.op !== 'string') {
    throw new IpcClientError('TRANSPORT_FAULT', 'the response carries no operation');
  }
  const allowed = frame.ok === true ? ['v', 'ok', 'op', 'requestId', 'result'] : ['v', 'ok', 'op', 'requestId', 'outcome', 'detail'];
  for (const key of Object.keys(frame)) {
    if (!allowed.includes(key)) {
      throw new IpcClientError('TRANSPORT_FAULT', `the response carries an unexpected key: ${key}`);
    }
  }
  // OC-6: no owner, tenant or principal identifier may appear anywhere in a response.
  const disclosed = findResponseDisclosedKeys(frame);
  if (disclosed.length > 0) {
    throw new IpcClientError(
      'TRANSPORT_FAULT',
      'the response discloses an owner-scoped identifier and was refused',
      disclosed,
    );
  }

  if (frame.ok === true) {
    return {
      v: IPC_PROTOCOL_VERSION,
      ok: true,
      op: frame.op as IpcOperation,
      ...(typeof frame.requestId === 'string' ? { requestId: frame.requestId } : {}),
      result: frame.result,
    };
  }
  if (frame.ok === false) {
    if (typeof frame.outcome !== 'string') {
      throw new IpcClientError('TRANSPORT_FAULT', 'the refusal carries no outcome code');
    }
    return {
      v: IPC_PROTOCOL_VERSION,
      ok: false,
      op: frame.op as IpcOperation,
      ...(typeof frame.requestId === 'string' ? { requestId: frame.requestId } : {}),
      outcome: frame.outcome as IpcClassAOutcome,
      ...(typeof frame.detail === 'string' ? { detail: frame.detail } : {}),
    };
  }
  throw new IpcClientError('TRANSPORT_FAULT', 'the response carries no ok flag');
}

/* ------------------------------------------------------------------ *
 * Call outcome
 * ------------------------------------------------------------------ */

export type IpcCallResult =
  /** A success envelope was received. */
  | { readonly kind: 'SUCCESS'; readonly frame: IpcSuccessFrame; readonly bytesReceived: number }
  /** A typed Class A refusal was received. */
  | { readonly kind: 'CLASS_A'; readonly frame: IpcOutcomeFrame; readonly bytesReceived: number }
  /**
   * Class P: zero bytes and a closed connection. IRR observes **no reason**, because
   * IPD records it only in its own bounded local sink (C6). Inventing one here would
   * be a false claim.
   */
  | { readonly kind: 'CLASS_P'; readonly bytesReceived: 0; readonly reason: null }
  /**
   * The call timed out or the transport faulted. For a write this is
   * **outcome-unknown**: it may or may not have committed, so it is never retried.
   */
  | {
      readonly kind: 'OUTCOME_UNKNOWN';
      readonly reason: 'TIMEOUT' | 'TRANSPORT_FAULT';
      readonly op: IpcOperation;
      readonly write: boolean;
      readonly retried: false;
    };

export interface IpcCallOptions {
  /** Overrides the endpoint target (tests only). */
  readonly target?: IpcEndpointTarget;
  /** Overrides the timeout (tests only). */
  readonly timeoutMs?: number;
  /** Correlation id echoed by IPD. Never an authority. */
  readonly requestId?: string;
}

/**
 * Performs exactly ONE IPC call: one connection, one request frame, at most one
 * response frame, then close.
 *
 * Never retries — not on timeout, not on a transport fault, not on a refusal. A
 * write whose outcome is unknown stays unknown, which is the honest result: the
 * caller must not assume it failed, and must not resend it.
 */
export async function callIpc(
  op: IpcOperation,
  payload: Record<string, unknown> | undefined,
  options: IpcCallOptions = {},
): Promise<IpcCallResult> {
  const envelope: IpcRequestEnvelope = {
    v: IPC_PROTOCOL_VERSION,
    op,
    ...(payload !== undefined ? { payload } : {}),
    ...(options.requestId !== undefined ? { requestId: options.requestId } : {}),
  };

  // Encode first: an authority key or an oversize body is refused before any socket
  // is opened, so nothing reaches the wire.
  const frame = encodeRequestFrame(envelope);

  const target = options.target ?? resolveIpcEndpoint();
  const timeoutMs = options.timeoutMs ?? IPC_TIMEOUT_MS;
  const write = isWriteOperation(op);

  return new Promise<IpcCallResult>((resolveCall) => {
    const received: Buffer[] = [];
    let settled = false;
    let socket: Socket | null = null;

    const settle = (result: IpcCallResult): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (socket) {
        socket.removeAllListeners();
        socket.destroy();
      }
      resolveCall(result);
    };

    const unknown = (reason: 'TIMEOUT' | 'TRANSPORT_FAULT'): IpcCallResult => ({
      kind: 'OUTCOME_UNKNOWN',
      reason,
      op,
      write,
      retried: false,
    });

    const timer = setTimeout(() => settle(unknown('TIMEOUT')), timeoutMs);

    try {
      socket = createConnection({ path: target.path });
    } catch {
      settle(unknown('TRANSPORT_FAULT'));
      return;
    }

    socket.on('connect', () => {
      // One request per connection (T-2). Half-close after writing so the peer sees
      // EOF; a truncated frame is otherwise indistinguishable from a slow one.
      socket?.write(frame, () => socket?.end());
    });

    socket.on('data', (chunk: Buffer) => {
      received.push(chunk);
      const total = received.reduce((sum, part) => sum + part.byteLength, 0);
      // Enforce the response cap locally; never buffer past it.
      if (total > IPC_RESPONSE_MAX_BYTES) {
        settle({ kind: 'OUTCOME_UNKNOWN', reason: 'TRANSPORT_FAULT', op, write, retried: false });
        return;
      }
      const buffer = Buffer.concat(received);
      if (buffer.byteLength < IPC_LENGTH_PREFIX_BYTES) return;
      const declared = buffer.readUInt32BE(0);
      if (declared > IPC_RESPONSE_MAX_BYTES) {
        settle({ kind: 'OUTCOME_UNKNOWN', reason: 'TRANSPORT_FAULT', op, write, retried: false });
        return;
      }
      if (buffer.byteLength < IPC_LENGTH_PREFIX_BYTES + declared) return;

      // Exactly one response frame; trailing bytes are a protocol violation.
      const body = buffer.subarray(IPC_LENGTH_PREFIX_BYTES, IPC_LENGTH_PREFIX_BYTES + declared);
      const bytesReceived = IPC_LENGTH_PREFIX_BYTES + declared;
      let parsed: IpcResponseFrame;
      try {
        parsed = parseResponseFrame(JSON.parse(body.toString('utf8')));
      } catch {
        settle(unknown('TRANSPORT_FAULT'));
        return;
      }
      settle(
        parsed.ok
          ? { kind: 'SUCCESS', frame: parsed, bytesReceived }
          : { kind: 'CLASS_A', frame: parsed, bytesReceived },
      );
    });

    socket.on('end', () => {
      if (settled) return;
      const total = received.reduce((sum, part) => sum + part.byteLength, 0);
      // Zero bytes and a close is Class P: refused before authorization, with no
      // reason disclosed to IRR.
      if (total === 0) {
        settle({ kind: 'CLASS_P', bytesReceived: 0, reason: null });
        return;
      }
      // Bytes arrived but no complete frame did: a truncated response is a fault.
      settle(unknown('TRANSPORT_FAULT'));
    });

    socket.on('close', () => {
      if (settled) return;
      const total = received.reduce((sum, part) => sum + part.byteLength, 0);
      settle(
        total === 0
          ? { kind: 'CLASS_P', bytesReceived: 0, reason: null }
          : unknown('TRANSPORT_FAULT'),
      );
    });

    socket.on('error', () => settle(unknown('TRANSPORT_FAULT')));
  });
}
