/**
 * G-2 Gate B — USER-PORTFOLIO PORT ADAPTER OVER SAME-HOST IPC (IRR side).
 *
 * AUTHORITY: `IIPS-V3-G2-IRR-GATE-B-D4-IMPLEMENTATION-AUTHORITY-PA-DECISION-RENDERED-2026-10-17-01`
 * (D-4 `ACCEPT`), on the designated IRR baseline `10584439…` and the designated implementation
 * ref `refs/heads/gate-b/local-principal-ipc-implementation`. One of the four approved sources.
 *
 * WHAT THIS MODULE IS
 *   An implementation of the EXISTING `UserPortfolioPort` contract (`userPortfolioPort.ts`,
 *   read-only) whose upstream is the IPD-owned, single-principal, same-host IPC endpoint. It maps
 *   IPD refusals — including the DP-2 Option 2F refusal — into the EXISTING closed refusal
 *   vocabulary (`G2FailureReason`), verifies response envelopes with the EXISTING verifiers, and
 *   performs no mutation on refusal.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO
 *   1. It enables no write and claims no successful save. Gate E (write policy / canonical-identity
 *      source) is NOT granted, so every mutating port operation refuses locally, before any IPC
 *      request is built or sent. `saveHoldings` carries the effective DP-2 Option 2F refusal
 *      verbatim (`G2_UNRESOLVED_WRITE_MESSAGE`); the lifecycle/create operations refuse because no
 *      owner-scoped write policy exists yet. No optimistic result, no durability claim, no
 *      session-scoped substitute.
 *   2. It sends no identity, authority or scope (C3): the wire payload is built field-by-field
 *      from an allowlist (`portfolioId` only), the `G2Scope` never leaves the process, and
 *      `ipcClient` independently refuses forbidden fields.
 *   3. It stores nothing (C11): no cache, journal, shadow copy, mapping table or revision state.
 *      Every call is one upstream request (the port's binding transaction rule).
 *   4. It does not disclose owner existence: a scope mismatch, an absent portfolio and a foreign
 *      portfolio are indistinguishable (`NOT_FOUND`-style) and produce no partial effect.
 *
 * REFUSAL MAPPING
 *   A well-formed but refused IPC response is mapped through `mapG24Status` — the same closed
 *   vocabulary the HTTP path defines — so no new refusal semantics are invented. Transport
 *   failures (absent/refused/reset/timed-out/malformed/oversized) close as `UPSTREAM_UNAVAILABLE`;
 *   IRR-side framing failures close as `INVALID_REQUEST`. Nothing else crosses.
 */

import {
  G2Error,
  isValidPortfolioId,
  mapG24Status,
  verifyPortfolioEnvelope,
  verifyPortfolioListEnvelope,
  verifyRevisionsEnvelope,
  type G2DeleteResult,
  type G2FailureReason,
  type G2PortfolioSummary,
  type G2PortfolioView,
  type G2RevisionEntry,
  type G2SaveResult,
} from './userPortfolioContract.js';
import type {
  G2CreateParams,
  G2LifecycleParams,
  G2ListParams,
  G2ReadParams,
  G2SaveParams,
  UserPortfolioPort,
} from './userPortfolioPort.js';
import {
  exchange as exchangeWithIpc,
  IpcTransportError,
  parseIpcEndpoint,
} from './ipcClient.js';
import {
  G2_OWNER_CONTEXT_SOURCE,
  isValidTenantHint,
  type OwnerContextFromBinding,
} from './ownerContextFromBinding.js';
import { refuseUnresolvedPortfolioWrite } from './translationBoundary.js';

/** Gate E is not granted: a mutating operation has no policy under which it could succeed. */
export const G2_WRITE_POLICY_UNDEFINED_MESSAGE =
  'Owner-scoped write policy is not established; operation refused.';

/** The only IPC operations Gate B admits. Mutations are refused before the wire. */
export const G2_IPC_OPERATIONS = Object.freeze({
  listPortfolios: 'listPortfolios',
  getPortfolio: 'getPortfolio',
  revisionHistory: 'revisionHistory',
} as const);

/** Uniform refusal text: no owner, tenant, portfolio or endpoint detail is disclosed. */
const REFUSAL_MESSAGE = 'Owner-scoped operation was refused.';

/** Uniform unavailable text for transport/framing faults: no internals are disclosed. */
const UNAVAILABLE_MESSAGE = 'Owner-scoped operation could not be completed.';

/** Uniform hidden-not-found text for binding/scope disagreement. */
const HIDDEN_MESSAGE = 'Portfolio is not available.';

/** One upstream exchange function (injectable in tests; endpoint-bound in production). */
export type IpcExchange = (
  operation: string,
  payload: Readonly<Record<string, unknown>> | undefined,
) => Promise<unknown>;

/** Adapter construction options. */
export interface IpcPortAdapterOptions {
  readonly binding: OwnerContextFromBinding;
  readonly exchange?: IpcExchange;
}

/** The IRR-side response envelope carried inside one IPC frame. */
interface IpcResponseEnvelope {
  readonly status: number;
  readonly body: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A lifecycle/create refusal: no write policy exists, so nothing is attempted. */
function refuseWriteWithoutPolicy(): never {
  throw new G2Error('INVALID_REQUEST', G2_WRITE_POLICY_UNDEFINED_MESSAGE);
}

/**
 * Validates the resolved binding once at construction.
 *
 * A binding that did not come from `resolveOwnerContextFromBinding` (or that was tampered with)
 * cannot produce an adapter — fail closed, with no partial object.
 */
function assertBinding(binding: OwnerContextFromBinding): void {
  if (!isRecord(binding) || binding.source !== G2_OWNER_CONTEXT_SOURCE) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Owner context binding is not available.');
  }
  const endpoint = binding.endpoint;
  const parsed = endpoint ? parseIpcEndpoint(endpoint.path) : null;
  if (!parsed || parsed.kind !== endpoint.kind) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Owner context binding is not available.');
  }
  const hint = isRecord(binding.scope) ? binding.scope.tenantHint : undefined;
  if (!isValidTenantHint(hint)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Owner context binding is not available.');
  }
}

/**
 * The `G2Scope` is checked against the provisioned binding and then DROPPED.
 *
 * It is never serialized, never sent and never used to select an endpoint. A mismatch is
 * indistinguishable from a missing portfolio: no owner, tenant or binding detail is disclosed.
 */
function assertScope(params: unknown, expectedTenantHint: string): void {
  const scope = isRecord(params) ? params.scope : undefined;
  const hint = isRecord(scope) ? scope.tenantHint : undefined;
  if (typeof hint !== 'string' || hint !== expectedTenantHint) {
    throw new G2Error('NOT_FOUND', HIDDEN_MESSAGE);
  }
}

/** Validates the response envelope shape (status + body) before any interpretation. */
function asResponseEnvelope(value: unknown): IpcResponseEnvelope {
  if (!isRecord(value)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', UNAVAILABLE_MESSAGE);
  }
  const status = value.status;
  if (typeof status !== 'number' || !Number.isInteger(status) || status < 100 || status > 599) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', UNAVAILABLE_MESSAGE);
  }
  return { status, body: value.body };
}

/** Maps a refused IPC response into the existing closed failure vocabulary. */
function refusalReason(response: IpcResponseEnvelope): G2FailureReason {
  const code = isRecord(response.body) && typeof response.body.error === 'string'
    ? response.body.error
    : undefined;
  return mapG24Status(response.status, code);
}

/** Requires a successful read status; anything else is a refusal (fail closed, uniform). */
function requireSuccess(response: IpcResponseEnvelope): void {
  if (response.status !== 200) {
    throw new G2Error(refusalReason(response), REFUSAL_MESSAGE);
  }
}

/** Maps a transport/framing failure into the closed vocabulary without leaking detail. */
function mapTransportFailure(error: IpcTransportError): G2Error {
  const reason: G2FailureReason = error.kind === 'request-too-large' || error.kind === 'forbidden-field'
    ? 'INVALID_REQUEST'
    : 'UPSTREAM_UNAVAILABLE';
  return new G2Error(reason, UNAVAILABLE_MESSAGE);
}

/**
 * Creates the IPC-backed `UserPortfolioPort`.
 *
 * Stateless and frozen: no per-call or cross-call state exists to mutate, which is what makes
 * "no mutation on refusal" structural rather than incidental.
 */
export function createIpcUserPortfolioAdapter(options: IpcPortAdapterOptions): UserPortfolioPort {
  const binding = options?.binding;
  assertBinding(binding);
  const exchange: IpcExchange = options.exchange
    ?? ((operation, payload) => exchangeWithIpc(operation, payload, binding.endpoint));
  const expectedTenantHint = binding.scope.tenantHint;

  /** One exchange, one request, no retry, no fallback. */
  const call = async (
    operation: string,
    payload?: Readonly<Record<string, unknown>>,
  ): Promise<IpcResponseEnvelope> => {
    try {
      return asResponseEnvelope(await exchange(operation, payload));
    } catch (error) {
      if (error instanceof G2Error) throw error;
      if (error instanceof IpcTransportError) throw mapTransportFailure(error);
      throw new G2Error('UPSTREAM_UNAVAILABLE', UNAVAILABLE_MESSAGE);
    }
  };

  const adapter: UserPortfolioPort = {
    async listPortfolios(params: G2ListParams): Promise<readonly G2PortfolioSummary[]> {
      assertScope(params, expectedTenantHint);
      const response = await call(G2_IPC_OPERATIONS.listPortfolios);
      requireSuccess(response);
      return verifyPortfolioListEnvelope(response.body);
    },

    async getPortfolio(params: G2ReadParams): Promise<G2PortfolioView> {
      assertScope(params, expectedTenantHint);
      if (!isValidPortfolioId(params.portfolioId)) {
        throw new G2Error('INVALID_REQUEST', 'Portfolio identifier is not admissible.');
      }
      // Allowlisted wire payload: the addressed identifier and nothing else.
      const response = await call(G2_IPC_OPERATIONS.getPortfolio, { portfolioId: params.portfolioId });
      requireSuccess(response);
      return verifyPortfolioEnvelope(response.body, params.portfolioId);
    },

    async createPortfolio(_params: G2CreateParams): Promise<G2PortfolioView> {
      // Gate E not granted: no create policy exists.
      return refuseWriteWithoutPolicy();
    },

    async saveHoldings(_params: G2SaveParams): Promise<G2SaveResult> {
      // Effective DP-2 Option 2F, verbatim: unresolved/ambiguous writes are refused before any
      // serializer, scope derivation or upstream call. Gate B adds no successful-write policy.
      return refuseUnresolvedPortfolioWrite();
    },

    async resetPortfolio(_params: G2LifecycleParams): Promise<G2PortfolioView> {
      return refuseWriteWithoutPolicy();
    },

    async deletePortfolio(_params: G2LifecycleParams): Promise<G2DeleteResult> {
      return refuseWriteWithoutPolicy();
    },

    async revisionHistory(params: G2ReadParams): Promise<readonly G2RevisionEntry[]> {
      assertScope(params, expectedTenantHint);
      if (!isValidPortfolioId(params.portfolioId)) {
        throw new G2Error('INVALID_REQUEST', 'Portfolio identifier is not admissible.');
      }
      const response = await call(G2_IPC_OPERATIONS.revisionHistory, { portfolioId: params.portfolioId });
      requireSuccess(response);
      return verifyRevisionsEnvelope(response.body);
    },
  };

  return Object.freeze(adapter);
}
