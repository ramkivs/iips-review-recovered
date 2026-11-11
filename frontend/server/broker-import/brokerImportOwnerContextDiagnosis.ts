/**
 * CAP-02 broker import — why an opaque `owner-context-unavailable` was returned.
 *
 * WHY THIS MODULE EXISTS
 *   The broker-import HTTP route answers ONE opaque body — `503
 *   owner-context-unavailable` — for three genuinely different conditions:
 *
 *     1. IRR's own binding precondition is not established (configuration);
 *     2. a LOCAL pre-send refusal inside the IPC client (endpoint absent or
 *        malformed, oversize frame, a refused authority key, an operation outside
 *        the closed v1 set) — no request is sent at all;
 *     3. IPD's CLASS P answer: the socket opened, IPD read the request and closed
 *        with ZERO bytes, which is its non-disclosing pre-authorization refusal.
 *
 *   All three are indistinguishable to the browser, and that is deliberate and
 *   must stay that way (C6 non-disclosure). But they are NOT indistinguishable to
 *   the operator: (1) is fixed by configuration on this machine, (2) is fixed by
 *   configuration on this machine, and (3) can only be resolved on the IPD side.
 *   Collapsing them left a diagnosis that could not end, because the error name
 *   points at the owner context even when the owner context was fine.
 *
 * WHAT THIS MODULE DOES
 *   It records WHICH of the conditions occurred, on the server's own log, using a
 *   fixed vocabulary. It changes NOTHING about the HTTP response: the body, the
 *   status and the non-disclosure property are exactly as before.
 *
 * WHAT IT NEVER RECORDS
 *   - no endpoint value, no path, no pipe name;
 *   - no owner, tenant, principal, credential or scope identifier;
 *   - no payload, no holding, no digest and no file name;
 *   - no raw exception message (those can carry a configured value).
 *
 *   For a local IPC refusal only the client's own classification code is logged,
 *   and that code is drawn from a closed set defined here: an unrecognised error
 *   is logged as `unclassified-local-refusal`, never as its message text.
 */

import { IpcClientError } from '../user-portfolio/ipcClient.js';

/** The closed set of causes an opaque owner-context response can have. */
export type BrokerImportOwnerContextCause =
  /** IRR's binding precondition was not established. Configuration on this host. */
  | 'owner-precondition-not-established'
  /** The IPC client refused locally before sending. Configuration on this host. */
  | 'ipc-local-refusal'
  /** IPD answered Class P: connected, then zero bytes. Resolved on the IPD side. */
  | 'ipc-class-p-refusal'
  /** The IPC call neither succeeded nor was refused with a frame. Reported separately, not as owner-context. */
  | 'ipc-outcome-unknown';

/**
 * Maps the IPC client's own error `kind` onto the closed logging vocabulary.
 *
 * Every value on the right is fixed vocabulary, so logging one discloses a
 * category and never a configured value.
 *
 * `RESPONSE_OVERSIZE` and `TRANSPORT_FAULT` are post-send conditions: they are
 * recorded as `TRANSPORT_FAULT` here because, for the operator, both mean the
 * acknowledgement was not usable — which is categorically different from an
 * endpoint that was never configured.
 */
const LOCAL_REFUSAL_CODES = Object.freeze({
  ENDPOINT_NOT_CONFIGURED: 'ENDPOINT_NOT_CONFIGURED',
  REQUEST_OVERSIZE: 'REQUEST_OVERSIZE',
  MALFORMED_ENVELOPE: 'MALFORMED_ENVELOPE',
  UNKNOWN_OPERATION: 'UNKNOWN_OPERATION',
  RESPONSE_OVERSIZE: 'TRANSPORT_FAULT',
  TRANSPORT_FAULT: 'TRANSPORT_FAULT',
  CALLER_SUPPLIED_AUTHORITY: 'REQUEST_REFUSED',
} as const);

export type BrokerImportLocalRefusalCode =
  | (typeof LOCAL_REFUSAL_CODES)[keyof typeof LOCAL_REFUSAL_CODES]
  | 'unclassified-local-refusal';

export interface BrokerImportOwnerContextDiagnosis {
  readonly cause: BrokerImportOwnerContextCause;
  /** Present only for `ipc-local-refusal`; fixed vocabulary, never a message. */
  readonly localCode?: BrokerImportLocalRefusalCode;
}

/**
 * Classifies a local pre-send failure for the operator's log.
 *
 * Recognises `IpcClientError` by its closed code set and the wire-authority error
 * (a refused owner/tenant/principal key) as `REQUEST_REFUSED`. Anything else is
 * `unclassified-local-refusal`: the category is recorded, the message is not.
 */
export function classifyLocalIpcRefusal(error: unknown): BrokerImportLocalRefusalCode {
  if (error instanceof IpcClientError) {
    const mapped = LOCAL_REFUSAL_CODES[error.kind as keyof typeof LOCAL_REFUSAL_CODES];
    // A code outside the closed set is recorded as unclassified: the category is
    // logged, the message text never is, because a message can carry a configured
    // value (an endpoint or a path) that must not reach a log.
    return mapped ?? 'unclassified-local-refusal';
  }
  return 'unclassified-local-refusal';
}

/**
 * Writes ONE classified line to the server's own log.
 *
 * The browser receives the same opaque response as before. The operator receives
 * the condition they must act on. `stage` is a fixed label naming where in the
 * route the condition was observed.
 */
export function reportBrokerImportOwnerContext(
  stage: 'commit' | 'revision-read',
  diagnosis: BrokerImportOwnerContextDiagnosis,
): void {
  const detail = diagnosis.localCode === undefined ? '' : ` local-refusal=${diagnosis.localCode}`;
  console.warn(
    `[broker-import] owner-context-unavailable stage=${stage} cause=${diagnosis.cause}${detail}`
    + ' (the browser receives the opaque 503; this line is the operator diagnosis)',
  );
}
