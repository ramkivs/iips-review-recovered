/**
 * CAP-02 broker-import HTTP boundary — the admitted routes on the existing IRR Node host.
 *
 * Authority: `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §2.2
 * and `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` §3.2/§3.3, plus
 * `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` §8 (the additive admission of
 * the evidence-retrieval route, effective 2026-11-05).
 *
 * THE ADMITTED ROUTES
 *   POST /api/broker-import/:portfolioId/holdings                        (U1 §2.2)
 *   GET  /api/broker-import/:portfolioId/revision                        (U7 §1.4 / U1 §7 / -04 §3.2)
 *   GET  /api/broker-import/:portfolioId/evidence/:importId              (AMEND-01 §8 — ONE route)
 *   POST /api/broker-import/:portfolioId/evidence                        (AMEND-02)
 *   Other methods on an admitted path → 405. Every other namespace path → 404.
 *   The four-segment evidence path is POST-only, never a collection GET or enumeration.
 *
 * HANDLER ORDER (fixed by the effective U1 act, preserved and extended by AMEND-01 §8.1(3))
 *   1. exact route/method match;
 *   2. C9 first-party signal (cross-site hardening — never authentication);
 *   3. IRR-local binding precondition — absent ⇒ 503 owner-context-unavailable BEFORE any port,
 *      adapter or connection is constructed (fail closed);
 *   4. bounded body read (existing owner-scoped helper; 64 KiB cap);
 *   5. strict DTO validation — typed refusal before any socket;
 *   6. the new provenance-bearing DTO makes ONE callIpc('portfolio.importBroker', payload),
 *      where IPD's independently authorized Stage 4 consumer re-resolves all raw identifiers;
 *      the legacy DTO is still refused by the identity-qualification gate before its manual
 *      `portfolio.save` mapping can reach a socket;
 *   7. response mapping below, with zero automatic retries.
 *   No step may be reordered, skipped or made lazy. The evidence route follows the same order with
 *   its own steps 4–6: request-shape validation (query string refused, opaque params validated)
 *   BEFORE ANY I/O, then the owner-carrier resolution, then exactly ONE scoped journal read. It
 *   performs no IPC call at all — it never touches a portfolio store.
 *
 * RESPONSE MAPPING (effective U1 act §2.2)
 *   Stage 4 result.ok     → 200, BrokerImportSuccess relayed (actual revision/count/disposition)
 *   legacy v1 receipt     → 200 only if its guarded adapter were admitted (minimal receipt)
 *   WRITE_NOT_AUTHORIZED  → 503 {outcome, storeEffect:'NONE'}   (W-1 refusal — the correct result
 *                           while the gate conjunction is unmet; zero store effect)
 *   REVISION_CONFLICT     → 409 (no current revision guessed or cached)
 *   RESOURCE_UNAVAILABLE  → 404 (missing ≡ foreign ≡ tombstoned; no distinction disclosed)
 *   INVALID_REQUEST       → 400
 *   REFUSED_UNRESOLVED_IDENTITY / REFUSED_STORE_GUARD → 422 (non-2xx 2F refusal)
 *   identity-qualification gate refusal → 422 {outcome:'REFUSED_STORE_GUARD', storeEffect:'NONE'}
 *   UNAVAILABLE           → 503
 *   Class P (zero bytes)  → 503 owner-context-unavailable, indistinguishable from config-absent
 *   Timeout / fault       → 503 {outcome:'OUTCOME_UNKNOWN', retried:false} — distinct, no resend
 *   Unrepresentable result→ 503 {outcome:'OUTCOME_UNKNOWN', reason:'UNREPRESENTABLE_RESULT'}
 *
 * EVIDENCE RESPONSE MAPPING (AMEND-01 §8.1(5)–(6), §8.3(15)–(16))
 *   retained record in scope → 200, the record's EVIDENCE FIELDS ONLY (both partition keys withheld)
 *                              plus the retention disclosure clause 14 requires and the O-1
 *                              storage-usage visibility clause 16(e) requires
 *   absent / malformed / out-of-scope / tombstoned importId
 *                            → 404 {outcome:'RESOURCE_UNAVAILABLE'} — ONE opaque body for all four,
 *                              never 403, never a partial record, never an enumeration signal
 *   query string present     → 400 {error:'invalid-request'} BEFORE any I/O
 *   other method             → 405 Allow: GET
 *   carrier absent/malformed/digest-mismatch, or binding precondition absent
 *                            → 503 owner-context-unavailable (fail closed, non-disclosing)
 *   EVIDENCE_TAMPERED        → 503 {outcome:'EVIDENCE_TAMPERED'} — digest re-verified on EVERY read;
 *   EVIDENCE_INVALID           a tampered record is never served and never silently reported absent
 *   any other storage fault  → 503 {outcome:'UNAVAILABLE'} — retention is never claimed on failure
 *
 * NON-DISCLOSURE: no stack, provider detail, owner, tenant, socket path or request value is ever
 * echoed. Validation refusals carry a field path and a static reason only. The evidence route
 * additionally withholds BOTH governed partition keys (`tenantId`, `ownerUserId`) from its 200 body:
 * they are partition keys, not evidence fields, and §8.1(6) admits the evidence fields only.
 */
import type http from 'node:http';
import { handleEvidenceSubmission, type EvidenceSubmissionDeps } from './brokerImportEvidenceSubmission.js';

import { readJsonBody, sendJson } from '../owner-scoped-http.js';
import { resolveDataDir } from '../persistence/persistence-service.js';
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
  BROKER_EVIDENCE_DELETION_MODE,
  BROKER_EVIDENCE_RETENTION_POLICY,
  BROKER_EVIDENCE_REVIEW_THRESHOLD_BYTES,
  BrokerImportEvidenceError,
  BrokerImportEvidenceStore,
  type BrokerImportEvidenceRecord,
  type BrokerImportEvidenceStorageUsage,
} from './brokerImportEvidenceStore.js';
import { resolveBrokerEvidenceOwnerContext } from './brokerImportEvidenceOwnerResolver.js';
import { isStage4Body, validateStage4Request, importBrokerViaIpc, type Stage4TransportOutcome } from './brokerImportStage4.js';
import {
  evaluateBrokerImportIdentityQualification,
  type BrokerImportIdentityQualificationEvaluator,
} from './brokerImportIdentityQualification.js';
import {
  defaultBrokerImportSaveDeps,
  readBrokerImportRevisionViaV1,
  saveBrokerImportHoldingsViaV1,
  type BrokerImportRevisionTransportOutcome,
  type BrokerImportSaveAdapterDeps,
  type BrokerImportSaveTransportOutcome,
} from './brokerImportV1SaveAdapter.js';

/** Exact API namespace check; `/api/broker-importEVIL` is not in scope. */
export function isBrokerImportPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/broker-import' || path.startsWith('/api/broker-import/');
}

/** Route dependency injection (tests substitute the IPC client, the evidence reader and the environment). */
export interface BrokerImportRouteDeps extends EvidenceSubmissionDeps {
  readonly saveAdapterDeps?: BrokerImportSaveAdapterDeps;
  readonly evidenceReader?: BrokerImportEvidenceReader;
  readonly env?: NodeJS.ProcessEnv;
  /**
   * The identity-qualification gate. Production omits it and the route uses the real
   * decision from `brokerImportIdentityQualification`. A test that exercises the RESPONSE
   * MAPPING of a transport outcome injects an admitted decision, so that it tests the mapping
   * it names rather than the gate; the gate is tested separately against the real decision.
   */
  readonly identityQualification?: BrokerImportIdentityQualificationEvaluator;
}

/**
 * The read surface the evidence route needs — deliberately narrower than the store.
 *
 * It exposes NO `retain`, NO `list` and NO `read`-by-recordId, so the route is structurally incapable
 * of writing evidence or of enumerating it (AMEND-01 §8.1(1), §8.3(16)(h)). Tests inject a fake.
 */
export interface BrokerImportEvidenceReader {
  readByImportId(
    tenantId: string,
    ownerUserId: string,
    importId: string,
  ): BrokerImportEvidenceRecord | null;
  describeStorageUsage(
    tenantId: string,
    ownerUserId: string,
  ): BrokerImportEvidenceStorageUsage;
}

interface MatchedRoute {
  readonly kind: 'HOLDINGS' | 'REVISION' | 'EVIDENCE' | 'SUBMISSION';
  readonly portfolioId: string;
  /** Present only for `EVIDENCE`; the opaque import identifier from the fifth path segment. */
  readonly importId?: string;
}

/**
 * Matches the admitted routes under `/api/broker-import`:
 *   - `/api/broker-import/:portfolioId/holdings` (`POST`)
 *   - `/api/broker-import/:portfolioId/revision` (`GET`, admitted under U7 §1.4 / U1 §7 / -04 §3.2)
 *   - `/api/broker-import/:portfolioId/evidence/:importId` (`GET`, admitted by AMEND-01 §8)
 * Returns null for all other paths in the namespace.
 *
 * AMEND-02 extends AMEND-01's closure by exactly the four-segment evidence POST.
 * GET on that path returns 405, not a collection. Five-segment A-9 remains read-only;
 * there is no way to enumerate importIds. A sixth segment still returns null.
 */
function matchRoute(path: string): MatchedRoute | null {
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 4 || parts[0] !== 'api' || parts[1] !== 'broker-import') {
    return null;
  }

  // Five-segment evidence form — the only five-segment path admitted in this namespace.
  if (parts.length === 5) {
    if (parts[3] !== 'evidence') {
      return null;
    }
    let portfolioId: string;
    let importId: string;
    try {
      portfolioId = decodeURIComponent(parts[2]);
      importId = decodeURIComponent(parts[4]);
    } catch {
      return null;
    }
    return { kind: 'EVIDENCE', portfolioId, importId };
  }

  if (parts.length !== 4) {
    return null;
  }
  const leaf = parts[3];
  if (leaf !== 'holdings' && leaf !== 'revision' && leaf !== 'evidence') {
    return null;
  }
  let portfolioId: string;
  try {
    portfolioId = decodeURIComponent(parts[2]);
  } catch {
    return null;
  }
  return {
    kind: leaf === 'holdings' ? 'HOLDINGS' : leaf === 'revision' ? 'REVISION' : 'SUBMISSION',
    portfolioId,
  };
}

/**
 * `importId` is `sha256(broker ‖ contentDigest ‖ readAt)` — exactly 64 lowercase hex characters.
 *
 * A value that fails this shape is MALFORMED, and AMEND-01 §8.1(5) requires a malformed `importId` to
 * be INDISTINGUISHABLE from one that is valid but not retained: the same opaque `404`, never a `400`
 * that would confirm the shape rule to a prober and never a `403`. So this predicate gates a `404`,
 * not a `400`. It is a shape check only — it never resolves, mints or derives an identifier.
 */
function isImportIdShape(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value);
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

/** Map IPD's nested Stage 4 outcome without treating dispatch as persistence. */
function respondToStage4Outcome(res: http.ServerResponse, outcome: Stage4TransportOutcome): void {
  if (outcome.kind === 'SUCCESS') {
    // This is IPD's actual BrokerImportSuccess, including its persisted count and revision.
    sendJson(res, 200, outcome.result);
    return;
  }
  if (outcome.kind === 'CLASS_P') {
    respondOwnerContextUnavailable(res);
    return;
  }
  if (outcome.kind === 'UNKNOWN') {
    sendJson(res, 503, { outcome: 'OUTCOME_UNKNOWN', retried: false });
    return;
  }
  const status: Record<string, number> = {
    WRITE_NOT_AUTHORIZED: 503, REVISION_CONFLICT: 409, RESOURCE_UNAVAILABLE: 404,
    INVALID_REQUEST: 400, REFUSED_UNRESOLVED_IDENTITY: 422, REFUSED_STORE_GUARD: 422,
    UNAVAILABLE: 503,
  };
  sendJson(res, status[outcome.code] ?? 503, {
    outcome: status[outcome.code] ? outcome.code : 'UNAVAILABLE',
    // A generic dispatcher UNAVAILABLE does not include a store-effect guarantee.
    // Do not invent one for an unexpected upstream error.
    ...(outcome.code !== 'UNAVAILABLE' ? { storeEffect: 'NONE' } : {}),
    ...(outcome.refusedCount !== undefined ? { refusedCount: outcome.refusedCount } : {}),
  });
}

/** Maps a revision-read transport outcome to the fixed HTTP response. */
function respondToRevisionOutcome(
  res: http.ServerResponse,
  outcome: BrokerImportRevisionTransportOutcome,
): void {
  switch (outcome.kind) {
    case 'REVISION':
      sendJson(res, 200, {
        portfolioId: outcome.result.portfolioId,
        revision: outcome.result.revision,
      });
      return;
    case 'CLASS_A_REFUSAL':
      switch (outcome.outcome) {
        case 'RESOURCE_UNAVAILABLE':
          sendJson(res, 404, { outcome: 'RESOURCE_UNAVAILABLE' });
          return;
        case 'INVALID_REQUEST':
          sendJson(res, 400, { outcome: 'INVALID_REQUEST' });
          return;
        case 'UNAVAILABLE':
        default:
          sendJson(res, 503, { outcome: 'UNAVAILABLE' });
          return;
      }
    case 'CLASS_P_REFUSAL':
      respondOwnerContextUnavailable(res);
      return;
    case 'OUTCOME_UNKNOWN':
      sendJson(res, 503, { outcome: 'OUTCOME_UNKNOWN', retried: false });
      return;
    case 'UNREPRESENTABLE_RESULT':
      sendJson(res, 503, { outcome: 'OUTCOME_UNKNOWN', reason: 'UNREPRESENTABLE_RESULT', retried: false });
      return;
    default:
      sendJson(res, 503, { outcome: 'OUTCOME_UNKNOWN', retried: false });
      return;
  }
}

/**
 * Builds the evidence `200` body: the retained record's EVIDENCE FIELDS ONLY, plus the retention
 * disclosure AMEND-01 §8.3(14) requires the response to carry, plus the O-1 storage-usage visibility
 * §8.3(16)(e) requires.
 *
 * BOTH GOVERNED PARTITION KEYS ARE WITHHELD. `tenantId` and `ownerUserId` are excluded: §8.1(6)
 * admits "the retained record's evidence fields only", and partition keys are not evidence — they are
 * `EQUALITY_PARTITION_ONLY` scope values that have no business on the wire. Consequently `recordDigest`
 * (computed over the COMPLETE stored record, scope keys included) is verifiable by the owner against
 * the journal and by the server on every read, but is NOT recomputable from this projection alone.
 * That is stated in the body rather than left to be discovered.
 *
 * No canonical `companyId` (§8.1(6), U1 §2.3) and no raw CSV bytes — none are retained (P-4).
 * No filesystem path, socket path, stack or provider detail is echoed.
 */
function evidenceResponsePayload(
  record: BrokerImportEvidenceRecord,
  usage: BrokerImportEvidenceStorageUsage,
): Record<string, unknown> {
  return {
    schema: record.schema,
    importId: record.importId,
    portfolioSlot: record.portfolioSlot,
    broker: record.broker,
    variant: record.variant,
    fileName: record.fileName,
    readAt: record.readAt,
    contentDigest: record.contentDigest,
    status: record.status,
    identityAuthority: record.identityAuthority,
    counts: record.counts,
    rows: record.rows,
    pipelineRefusals: record.pipelineRefusals,
    warnings: record.warnings,
    validation: record.validation,
    saveAuthorization: record.saveAuthorization,
    persistence: record.persistence,
    reconciliation: record.reconciliation,
    limitations: record.limitations,
    recordDigest: record.recordDigest,
    // Route-supplied disclosure metadata. EXCLUDED from `recordDigest` by construction, and required
    // by clause 14 (the volatile-fields limitation must be carried in the response) and by clause
    // 16(e)/(g) (obligation O-1). It adds NO endpoint: it rides the one admitted read.
    retention: {
      policy: BROKER_EVIDENCE_RETENTION_POLICY,
      deletion: BROKER_EVIDENCE_DELETION_MODE,
      automaticPurge: false,
      destructiveCompaction: false,
      deletionReachableFromHttp: false,
      reviewThresholdBytes: BROKER_EVIDENCE_REVIEW_THRESHOLD_BYTES,
      reviewThresholdIsDeletionTrigger: false,
      storage: {
        recordCount: usage.recordCount,
        approximateBytes: usage.approximateBytes,
        reviewThresholdExceeded: usage.approximateBytes > BROKER_EVIDENCE_REVIEW_THRESHOLD_BYTES,
      },
      volatileFields:
        'P04 quarantine record ids are minted per lookup by the IPD-owned pipeline and are therefore process-specific. The FIRST retention of an import is the authoritative evidence record; a repeated import is a no-op that returns it unchanged.',
      servedWithinOwnerScopeOnly: true,
      transmittedToThirdParty: false,
      enumeratedRoute: false,
      recordDigestCoversWithheldScopeKeys: true,
    },
  };
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
  const rawUrl = req.url ?? '';
  const path = rawUrl.split('?')[0];
  const method = (req.method ?? '').toUpperCase();
  res.setHeader('Content-Type', 'application/json');

  const route = matchRoute(path);
  if (route === null) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }

  // AMEND-02 adds only the bounded POST leaf; A-9's handler below is unchanged.
  if (route.kind === 'SUBMISSION') {
    await handleEvidenceSubmission(req, res, route.portfolioId, deps);
    return;
  }

  if (route.kind === 'EVIDENCE') {
    // Clause 2: only GET is permitted on this path.
    if (method !== 'GET') {
      res.setHeader('Allow', 'GET');
      sendJson(res, 405, { error: 'method-not-allowed' });
      return;
    }

    // Clause 3, step 2: C9 first-party signal FIRST (cross-site hardening — never authentication,
    // and it yields no owner).
    const evidenceHost = typeof req.headers.host === 'string' ? req.headers.host : null;
    const evidenceFirstParty = evaluateRequestFirstPartySignal(req.headers, method, evidenceHost);
    if (evidenceFirstParty.decision === 'NOT_FIRST_PARTY') {
      sendJson(res, 403, { error: 'cross-site-request-refused' });
      return;
    }

    // Clause 3, step 3: the IRR-local binding precondition, BEFORE any adapter, store or socket is
    // constructed. Absent ⇒ fail closed, indistinguishable from configuration-absent.
    const evidenceEnv = deps.env ?? process.env;
    const evidenceBinding = ownerContextFromBinding(readBindingPrecondition(evidenceEnv), evidenceEnv);
    if (evidenceBinding.state !== 'IPD_BINDING_RESOLVED' || !evidenceBinding.established) {
      respondOwnerContextUnavailable(res);
      return;
    }

    // Clause 2: ANY query string is refused, before any I/O. Static reason only.
    if (rawUrl.includes('?')) {
      sendJson(res, 400, {
        error: 'invalid-request',
        field: 'query',
        reason: 'query-string-not-permitted',
      });
      return;
    }

    // Clause 3, step 4: the opaque route parameters are validated BEFORE any I/O. Shape only — IRR
    // never resolves identity from them.
    const evidencePortfolioRefusal = validatePortfolioIdParam(route.portfolioId);
    if (evidencePortfolioRefusal !== null) {
      sendJson(res, 400, {
        error: 'invalid-request',
        field: evidencePortfolioRefusal.fieldPath,
        reason: evidencePortfolioRefusal.reason,
      });
      return;
    }

    // Clause 5: a MALFORMED importId is indistinguishable from one that is valid but not retained —
    // the same opaque 404, never a 400 and never a 403.
    const importId = route.importId ?? '';
    if (!isImportIdShape(importId)) {
      sendJson(res, 404, { outcome: 'RESOURCE_UNAVAILABLE' });
      return;
    }

    // Clause 7/§3.7: owner scope comes ONLY from the act-fixed carrier resolved through the
    // server-owned seam — never from a header, cookie, token, credential or query value (clause 10).
    // Uncached per-request evaluation, so removing or restoring the carrier takes effect at once.
    // Absent, unreadable, malformed or digest-mismatched ⇒ null ⇒ fail closed at 503.
    const evidenceOwner = resolveBrokerEvidenceOwnerContext(evidenceEnv);
    if (evidenceOwner === null) {
      respondOwnerContextUnavailable(res);
      return;
    }

    // Clause 3, step 5: exactly ONE scoped journal read. Constructed per request and never cached, so
    // evidence retained by a separate OS process is visible immediately and no stale scope survives a
    // carrier change. No IPC call is made: this route never touches a portfolio store.
    const reader = deps.evidenceReader ?? new BrokerImportEvidenceStore({ dataDir: resolveDataDir(evidenceEnv) });
    let record: BrokerImportEvidenceRecord | null;
    let usage: BrokerImportEvidenceStorageUsage;
    try {
      record = reader.readByImportId(evidenceOwner.tenantId, evidenceOwner.ownerUserId, importId);
      // O-1: storage-usage visibility for the owner's own scope, carried on the admitted response.
      usage = reader.describeStorageUsage(evidenceOwner.tenantId, evidenceOwner.ownerUserId);
    } catch (error) {
      // Clause 15: the digest is re-verified on EVERY read and tamper fails closed. A tampered or
      // invalid record is never served, and never silently reported as absent. Static reason only —
      // no message, stack, path or record detail is echoed.
      if (error instanceof BrokerImportEvidenceError) {
        sendJson(res, 503, { outcome: error.code });
        return;
      }
      // Any other storage failure propagates as unavailable: retention is never claimed on failure.
      sendJson(res, 503, { outcome: 'UNAVAILABLE' });
      return;
    }

    if (record === null) {
      // Absent, tombstoned or outside the single personal owner scope: ONE opaque body.
      sendJson(res, 404, { outcome: 'RESOURCE_UNAVAILABLE' });
      return;
    }
    sendJson(res, 200, evidenceResponsePayload(record, usage));
    return;
  }

  if (route.kind === 'REVISION') {
    if (method !== 'GET') {
      res.setHeader('Allow', 'GET');
      sendJson(res, 405, { error: 'method-not-allowed' });
      return;
    }

    // C9 first-party signal: refuse explicit cross-site Origin / Sec-Fetch-Site on GET.
    const host = typeof req.headers.host === 'string' ? req.headers.host : null;
    const firstParty = evaluateRequestFirstPartySignal(req.headers, method, host);
    if (firstParty.decision === 'NOT_FIRST_PARTY') {
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

    // Opaque route parameter validation (shape only; IRR never resolves identity).
    const portfolioIdRefusal = validatePortfolioIdParam(route.portfolioId);
    if (portfolioIdRefusal !== null) {
      sendJson(res, 400, {
        error: 'invalid-request',
        field: portfolioIdRefusal.fieldPath,
        reason: portfolioIdRefusal.reason,
      });
      return;
    }

    let revisionOutcome: BrokerImportRevisionTransportOutcome;
    try {
      revisionOutcome = await readBrokerImportRevisionViaV1(
        deps.saveAdapterDeps ?? defaultBrokerImportSaveDeps,
        route.portfolioId,
      );
    } catch {
      respondOwnerContextUnavailable(res);
      return;
    }
    respondToRevisionOutcome(res, revisionOutcome);
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

  // PR #148 publishes a distinct, provenance-bearing Stage 4 request. Its ONLY write
  // path is portfolio.importBroker, whose IPD consumer independently requalifies every
  // holding and enforces the durable authorization guard. Never route this shape to
  // the manual portfolio.save operation. Legacy DTOs continue through the old gate.
  if (isStage4Body(body.value)) {
    const request = validateStage4Request(route.portfolioId, body.value);
    if (!request) {
      sendJson(res, 400, { outcome: 'INVALID_REQUEST', storeEffect: 'NONE' });
      return;
    }
    try {
      const result = await importBrokerViaIpc(request, deps.saveAdapterDeps?.callIpc);
      respondToStage4Outcome(res, result);
    } catch {
      // A local pre-send exception (invalid endpoint, oversize, authority key) sends
      // no request; preserve the existing non-disclosing owner-context response.
      respondOwnerContextUnavailable(res);
    }
    return;
  }

  // Strict legacy DTO validation — typed refusal BEFORE any socket.
  const validated = validateBrokerImportSaveDto(body.value);
  if (!validated.ok) {
    sendJson(res, 400, { error: 'invalid-request', field: validated.refusal.fieldPath, reason: validated.refusal.reason });
    return;
  }
  const dto: BrokerImportSaveDto = validated.dto;

  // Identity-qualification gate (IRR side), evaluated AFTER the DTO is admitted and BEFORE
  // any socket is opened. A broker-observed write is admitted only when the governed
  // whole-import identity gate (Gate E W-6 / DP-2 2F) is actually applied on this legacy
  // DTO's commit path. That adapter uses `portfolio.save`, which on the IPD side is the
  // MANUAL personal-holdings path: it stamps every row
  // `identityStatus: 'UNRESOLVED'` with a synthetic `MANUAL:<SYMBOL>` company id, resolves no
  // governed identity and applies no whole-import refusal. Sending broker-observed holdings
  // there would persist unresolved rows — exactly what IRR's own
  // `refuseUnresolvedPortfolioWrite` policy forbids on every other write surface.
  //
  // Zero store effect, no identity invented, nothing written. The refusal uses the
  // IPD-admitted code `REFUSED_STORE_GUARD`, so no new outcome code is introduced.
  const qualification = (deps.identityQualification ?? evaluateBrokerImportIdentityQualification)();
  if (!qualification.admitted) {
    sendJson(res, 422, { outcome: qualification.code, storeEffect: 'NONE', reason: qualification.reason });
    return;
  }

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
