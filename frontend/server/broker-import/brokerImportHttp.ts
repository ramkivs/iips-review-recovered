/**
 * CAP-02 broker-import HTTP boundary — the single admitted route on the existing IRR Node host.
 *
 * Authority: `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §2.2
 * and `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` §3.2/§3.3.
 *
 * THE ONE ROUTE
 *   POST /api/broker-import/:portfolioId/holdings
 *   Other methods on that path → 405. Other paths under /api/broker-import/ → 404. Nothing else.
 *
 * HANDLER ORDER (fixed by the effective U1 act)
 *   1. exact route/method match;
 *   2. C9 first-party signal (cross-site hardening — never authentication);
 *   3. IRR-local binding precondition — absent ⇒ 503 owner-context-unavailable BEFORE any port,
 *      adapter or connection is constructed (fail closed);
 *   4. bounded body read (existing owner-scoped helper; 64 KiB cap);
 *   5. strict DTO validation (brokerImportBoundary) — typed refusal before any socket;
 *   6. ONE callIpc('portfolio.save', exact-top-level-payload) — zero automatic retries;
 *   7. response mapping below.
 *
 * RESPONSE MAPPING (effective U1 act §2.2)
 *   v1 receipt            → 200, receipt relayed verbatim (disposition/revision/durability/durable)
 *   WRITE_NOT_AUTHORIZED  → 503 {outcome, storeEffect:'NONE'}   (W-1 refusal — the correct result
 *                           while the gate conjunction is unmet; zero store effect)
 *   REVISION_CONFLICT     → 409 (no current revision guessed or cached)
 *   RESOURCE_UNAVAILABLE  → 404 (missing ≡ foreign ≡ tombstoned; no distinction disclosed)
 *   INVALID_REQUEST       → 400
 *   REFUSED_UNRESOLVED_IDENTITY / REFUSED_STORE_GUARD → 422 (non-2xx 2F refusal)
 *   UNAVAILABLE           → 503
 *   Class P (zero bytes)  → 503 owner-context-unavailable, indistinguishable from config-absent
 *   Timeout / fault       → 503 {outcome:'OUTCOME_UNKNOWN', retried:false} — distinct, no resend
 *   Unrepresentable result→ 503 {outcome:'OUTCOME_UNKNOWN', reason:'UNREPRESENTABLE_RESULT'}
 *
 * NON-DISCLOSURE: no stack, provider detail, owner, tenant, socket path or request value is ever
 * echoed. Validation refusals carry a field path and a static reason only.
 */
import type http from 'node:http';

import { readJsonBody, sendJson } from '../owner-scoped-http.js';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable.js';
import {
  ownerContextFromBinding,
  readBindingPrecondition,
} from '../user-portfolio/ownerContextFromBinding.js';
import {
  evaluateRequestFirstPartySignal,
  isFirstPartyHardeningSatisfied,
} from '../user-portfolio/firstPartySignal.js';
import {
  validateBrokerImportSaveDto,
  validatePortfolioIdParam,
  type BrokerImportSaveDto,
} from './brokerImportBoundary.js';
import {
  defaultBrokerImportSaveDeps,
  saveBrokerImportHoldingsViaV1,
  type BrokerImportSaveAdapterDeps,
  type BrokerImportSaveTransportOutcome,
} from './brokerImportV1SaveAdapter.js';

/** Exact API namespace check; `/api/broker-importEVIL` is not in scope. */
export function isBrokerImportPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/broker-import' || path.startsWith('/api/broker-import/');
}

/** Route dependency injection (tests substitute the IPC client and environment). */
export interface BrokerImportRouteDeps {
  readonly saveAdapterDeps?: BrokerImportSaveAdapterDeps;
  readonly env?: NodeJS.ProcessEnv;
}

interface MatchedRoute {
  readonly portfolioId: string;
}

/** Matches exactly `POST`-able `/api/broker-import/:portfolioId/holdings`; null otherwise. */
function matchRoute(path: string): MatchedRoute | null {
  const parts = path.split('/').filter(Boolean);
  if (parts.length !== 4 || parts[0] !== 'api' || parts[1] !== 'broker-import' || parts[3] !== 'holdings') {
    return null;
  }
  let portfolioId: string;
  try {
    portfolioId = decodeURIComponent(parts[2]);
  } catch {
    return null;
  }
  return { portfolioId };
}

/** Maps a transport outcome to the fixed HTTP response. */
function respondToOutcome(res: http.ServerResponse, outcome: BrokerImportSaveTransportOutcome): void {
  switch (outcome.kind) {
    case 'RECEIPT':
      // Relay the minimal v1 receipt verbatim — nothing added.
      sendJson(res, 200, {
        disposition: outcome.receipt.disposition,
        revision: outcome.receipt.revision,
        durability: outcome.receipt.durability,
        durable: outcome.receipt.durable,
      });
      return;
    case 'CLASS_A_REFUSAL':
      switch (outcome.outcome) {
        case 'WRITE_NOT_AUTHORIZED':
          // IPD refused before mutation; zero store effect; no durable success; no retry.
          sendJson(res, 503, { outcome: 'WRITE_NOT_AUTHORIZED', storeEffect: 'NONE' });
          return;
        case 'REVISION_CONFLICT':
          sendJson(res, 409, { outcome: 'REVISION_CONFLICT' });
          return;
        case 'RESOURCE_UNAVAILABLE':
          sendJson(res, 404, { outcome: 'RESOURCE_UNAVAILABLE' });
          return;
        case 'INVALID_REQUEST':
          sendJson(res, 400, { outcome: 'INVALID_REQUEST' });
          return;
        case 'REFUSED_UNRESOLVED_IDENTITY':
        case 'REFUSED_STORE_GUARD':
          sendJson(res, 422, { outcome: outcome.outcome });
          return;
        case 'UNAVAILABLE':
        default:
          sendJson(res, 503, { outcome: 'UNAVAILABLE' });
          return;
      }
    case 'CLASS_P_REFUSAL':
      // Indistinguishable from configuration-absent, by design (IRR-2); no reason invented.
      respondOwnerContextUnavailable(res);
      return;
    case 'OUTCOME_UNKNOWN':
      sendJson(res, 503, { outcome: 'OUTCOME_UNKNOWN', retried: false });
      return;
    case 'UNREPRESENTABLE_RESULT':
      sendJson(res, 503, { outcome: 'OUTCOME_UNKNOWN', reason: 'UNREPRESENTABLE_RESULT', retried: false });
      return;
    default:
      // Fail closed, non-disclosing.
      sendJson(res, 503, { outcome: 'OUTCOME_UNKNOWN', retried: false });
      return;
  }
}

/**
 * Handles the CAP-02 namespace. Mounted by `executive-transport.ts` for `/api/broker-import`
 * only; this module registers no route anywhere else and never listens.
 */
export async function handleBrokerImportRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: BrokerImportRouteDeps = {},
): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  const method = (req.method ?? '').toUpperCase();
  res.setHeader('Content-Type', 'application/json');

  const route = matchRoute(path);
  if (route === null) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }
  if (method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'method-not-allowed' });
    return;
  }

  // C9 first-party signal: cross-site hardening only. Never authentication; yields no owner.
  const host = typeof req.headers.host === 'string' ? req.headers.host : null;
  const firstParty = evaluateRequestFirstPartySignal(req.headers, method, host);
  if (!isFirstPartyHardeningSatisfied(firstParty)) {
    sendJson(res, 403, { error: 'cross-site-request-refused' });
    return;
  }

  // Binding precondition (IRR-local, fail closed): absent ⇒ no port, no adapter, no connection.
  const env = deps.env ?? process.env;
  const ownerContext = ownerContextFromBinding(readBindingPrecondition(env), env);
  if (ownerContext.state !== 'IPD_BINDING_RESOLVED' || !ownerContext.established) {
    respondOwnerContextUnavailable(res);
    return;
  }

  // Bounded body read (existing shared helper; 64 KiB cap).
  const body = await readJsonBody(req);
  if (!body.ok) {
    sendJson(res, body.status, { error: body.error });
    return;
  }

  // Opaque route parameter validation (shape only; IRR never resolves identity).
  const portfolioIdRefusal = validatePortfolioIdParam(route.portfolioId);
  if (portfolioIdRefusal !== null) {
    sendJson(res, 400, { error: 'invalid-request', field: portfolioIdRefusal.fieldPath, reason: portfolioIdRefusal.reason });
    return;
  }

  // Strict DTO validation — typed refusal BEFORE any socket.
  const validated = validateBrokerImportSaveDto(body.value);
  if (!validated.ok) {
    sendJson(res, 400, { error: 'invalid-request', field: validated.refusal.fieldPath, reason: validated.refusal.reason });
    return;
  }
  const dto: BrokerImportSaveDto = validated.dto;

  // ONE IPC call, zero retries. Default deps use the real callIpc. A locally thrown
  // `IpcClientError` (endpoint absent/invalid, oversize frame, refused authority key) is a
  // configuration-absent/local refusal: IRR-2 maps it to 503 owner-context-unavailable,
  // indistinguishable from Class P — never a 500 that would disclose a transport distinction.
  let outcome: BrokerImportSaveTransportOutcome;
  try {
    outcome = await saveBrokerImportHoldingsViaV1(deps.saveAdapterDeps ?? defaultBrokerImportSaveDeps, route.portfolioId, dto);
  } catch {
    respondOwnerContextUnavailable(res);
    return;
  }
  respondToOutcome(res, outcome);
}
