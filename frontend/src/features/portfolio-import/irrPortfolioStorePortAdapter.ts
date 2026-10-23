/**
 * IRR implementation of IPD's `PortfolioStorePort` for the CAP-02 broker-import modal.
 *
 * Authority:
 *   - `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-04` §3.3
 *   - `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` §§2–4, §7
 *   - `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §2.3, §7
 *
 * CONTRACT INVARIANTS
 *   1. Pre-save guards:
 *      - Caller-supplied identity or authorization-scope keys are refused via IPD's exported
 *        `findCallerSuppliedIdentityKeys` before any projection or network call.
 *      - Unresolved or ambiguous holdings are refused via IPD's exported `evaluatePortSaveGuard`
 *        (DP-2 Option 2F) before any network call.
 *   2. Projection:
 *      - Only broker-observed holding fields (`symbol`, `isin`, `exchange`, `quantity`,
 *        `averageBuyPrice`, `currentPrice`, `marketValue`) and top-level `expectedRevision`,
 *        `mode`, `contentDigest`, and `broker` cross the wire.
 *      - `fileName` and `importedAt` are not representable in Contract v1 `portfolio.save` and
 *        are never sent or compensated by unsupported wire fields (C-1/U2 limitation).
 *   3. Minimal receipt & outcome discipline (U7):
 *      - Success relays ONLY the authoritative minimal receipt `{disposition, revision,
 *        durability, durable}` with `result: undefined` (no fabricated `PortfolioSaveResult`,
 *        counts, totals, weights, digest, or timestamp).
 *      - Refusals map to exact `PortfolioPortRefusalCode` values (`WRITE_NOT_AUTHORIZED`,
 *        `REVISION_CONFLICT`, `RESOURCE_UNAVAILABLE`, `INVALID_REQUEST`,
 *        `REFUSED_UNRESOLVED_IDENTITY`, `REFUSED_STORE_GUARD`, `UNAVAILABLE`) with
 *        `portfolio: undefined` and `actualRevision: undefined`.
 *      - Transport timeout, network drop, or unrepresentable 200 payload maps to the distinct
 *        third state `{ ok: 'unknown', code: 'OUTCOME_UNKNOWN', portfolioId,
 *        reconciliationRequired: true }` with zero automatic retries.
 *   4. Narrow revision read & reconciliation (U7 §1.4):
 *      - `getRevision` and `reconcileOutcomeUnknown` issue at most one
 *        `GET /api/broker-import/:portfolioId/revision` request and NEVER resend `POST`.
 */

import {
  evaluatePortSaveGuard,
  findCallerSuppliedIdentityKeys,
  type PortfolioCommitReceipt,
  type PortfolioDurability,
  type PortfolioPortRefusalCode,
  type PortfolioPortSaveOutcome,
  type PortfolioPortSaveRequest,
  type PortfolioRecord,
  type PortfolioStorePort,
} from 'iips-production-market-data/portfolio-ui';
import {
  projectIngressToBrokerImportSaveRequest,
  readBrokerImportRevision,
  saveBrokerImportHoldings,
} from '../../api/brokerImport';

export const DEFAULT_BROKER_IMPORT_PORTFOLIO_ID = 'DEFAULT_PORTFOLIO';

export interface IrrBrokerImportStorePortAdapterOptions {
  readonly fetchImpl?: typeof fetch;
  /**
   * Optional initial/fallback optimistic-concurrency token when `request.expectedRevision` is
   * omitted by the caller and `acquireRevisionBeforeSave` is false.
   */
  readonly defaultExpectedRevision?: number;
  /**
   * When true and no `expectedRevision` is supplied on `request` or cached from a prior
   * authoritative read/receipt, acquires the current revision via one
   * `GET /api/broker-import/:portfolioId/revision` call before issuing `POST`.
   */
  readonly acquireRevisionBeforeSave?: boolean;
}

export type BrokerImportReconciliationOutcome =
  | {
      readonly reconciled: true;
      readonly status: 200;
      readonly portfolioId: string;
      readonly revision: number;
      /**
       * When `priorExpectedRevision` was supplied, indicates whether the authoritative revision
       * advanced past `priorExpectedRevision` (meaning the prior unknown save committed).
       */
      readonly committedSincePrior?: boolean;
    }
  | {
      readonly reconciled: false;
      readonly status: number;
      readonly outcome: string;
      readonly portfolioId: string;
      readonly reconciliationRequired: true;
    };

export class RevisionReadError extends Error {
  public readonly status: number;
  public readonly outcome: string;
  public readonly portfolioId: string;

  constructor(portfolioId: string, status: number, outcome: string) {
    super(`Revision read for ${portfolioId} failed with ${outcome} (HTTP ${status}).`);
    this.name = 'RevisionReadError';
    this.portfolioId = portfolioId;
    this.status = status;
    this.outcome = outcome;
  }
}

function mapClientRefusalToPortCode(outcome: string, status: number): PortfolioPortRefusalCode {
  switch (outcome) {
    case 'WRITE_NOT_AUTHORIZED':
      return 'WRITE_NOT_AUTHORIZED';
    case 'REVISION_CONFLICT':
      return 'REVISION_CONFLICT';
    case 'RESOURCE_UNAVAILABLE':
      return 'RESOURCE_UNAVAILABLE';
    case 'INVALID_REQUEST':
    case 'PROJECTION_REFUSED':
      return 'INVALID_REQUEST';
    case 'REFUSED_UNRESOLVED_IDENTITY':
      return 'REFUSED_UNRESOLVED_IDENTITY';
    case 'REFUSED_STORE_GUARD':
      return 'REFUSED_STORE_GUARD';
    case 'OWNER_CONTEXT_UNAVAILABLE':
    case 'UNAVAILABLE':
      return 'UNAVAILABLE';
    default:
      if (status === 400) return 'INVALID_REQUEST';
      if (status === 404) return 'RESOURCE_UNAVAILABLE';
      if (status === 409) return 'REVISION_CONFLICT';
      if (status === 422) return 'REFUSED_STORE_GUARD';
      return 'UNAVAILABLE';
  }
}

function describeRefusalMessage(code: PortfolioPortRefusalCode, rawOutcome: string, status: number): string {
  switch (code) {
    case 'WRITE_NOT_AUTHORIZED':
      return 'WRITE_NOT_AUTHORIZED: Operational portfolio writes are not authorized in this build (Gate E W-1 conjunction unmet; storeEffect: NONE).';
    case 'REVISION_CONFLICT':
      return 'REVISION_CONFLICT: The portfolio revision changed on the host. Refresh the revision via GET /api/broker-import/DEFAULT_PORTFOLIO/revision before retrying.';
    case 'RESOURCE_UNAVAILABLE':
      return 'RESOURCE_UNAVAILABLE: The target portfolio is not available.';
    case 'INVALID_REQUEST':
      return `INVALID_REQUEST: The broker-import request was refused at the boundary (${rawOutcome}).`;
    case 'REFUSED_UNRESOLVED_IDENTITY':
      return 'REFUSED_UNRESOLVED_IDENTITY: Unresolved or ambiguous holdings cannot be persisted (DP-2 Option 2F).';
    case 'REFUSED_STORE_GUARD':
      return 'REFUSED_STORE_GUARD: The portfolio store guard refused the holding vector.';
    case 'UNAVAILABLE':
    default:
      return rawOutcome === 'OWNER_CONTEXT_UNAVAILABLE'
        ? 'UNAVAILABLE: Server-owned owner context is unavailable (binding precondition not activated; HTTP 503).'
        : `UNAVAILABLE: Broker-import service is unavailable (${rawOutcome}, HTTP ${status}).`;
  }
}

export class IrrBrokerImportStorePortAdapter implements PortfolioStorePort {
  public readonly durability: PortfolioDurability = 'SESSION_ONLY';
  public readonly durable: boolean = false;

  private readonly fetchImpl: typeof fetch;
  private readonly defaultExpectedRevision?: number;
  private readonly acquireRevisionBeforeSave: boolean;
  private readonly knownRevisions = new Map<string, number>();

  constructor(options: IrrBrokerImportStorePortAdapterOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.defaultExpectedRevision = options.defaultExpectedRevision;
    this.acquireRevisionBeforeSave = options.acquireRevisionBeforeSave ?? false;
  }

  /**
   * CAP-02 v1 adapter never fabricates or caches a full `PortfolioRecord`.
   */
  public async getPortfolio(_portfolioId: string = DEFAULT_BROKER_IMPORT_PORTFOLIO_ID): Promise<PortfolioRecord | undefined> {
    return undefined;
  }

  /**
   * Reads the current revision token for `portfolioId` via `GET /api/broker-import/:portfolioId/revision`.
   * Throws `RevisionReadError` on non-200 so a failed read is never mistaken for revision 0.
   */
  public async getRevision(portfolioId: string = DEFAULT_BROKER_IMPORT_PORTFOLIO_ID): Promise<number> {
    const res = await readBrokerImportRevision(portfolioId, this.fetchImpl);
    if (res.ok) {
      this.knownRevisions.set(portfolioId, res.revision);
      return res.revision;
    }
    throw new RevisionReadError(portfolioId, res.status, res.outcome);
  }

  /**
   * Returns the most recent revision observed from an authoritative `getRevision`,
   * `reconcileOutcomeUnknown`, or `saveHoldings` receipt in this adapter instance.
   */
  public getLastKnownRevision(portfolioId: string = DEFAULT_BROKER_IMPORT_PORTFOLIO_ID): number | undefined {
    return this.knownRevisions.get(portfolioId);
  }

  /**
   * Narrow read-only reconciliation for `OUTCOME_UNKNOWN` (U7 §1.4 / §3).
   * Issues ONE `GET /api/broker-import/:portfolioId/revision` request and NEVER resends `POST`.
   */
  public async reconcileOutcomeUnknown(
    priorExpectedRevision?: number,
    portfolioId: string = DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
  ): Promise<BrokerImportReconciliationOutcome> {
    const res = await readBrokerImportRevision(portfolioId, this.fetchImpl);
    if (res.ok) {
      this.knownRevisions.set(portfolioId, res.revision);
      return {
        reconciled: true,
        status: 200,
        portfolioId: res.portfolioId,
        revision: res.revision,
        ...(typeof priorExpectedRevision === 'number'
          ? { committedSincePrior: res.revision > priorExpectedRevision }
          : {}),
      };
    }
    return {
      reconciled: false,
      status: res.status,
      outcome: res.outcome,
      portfolioId,
      reconciliationRequired: true,
    };
  }

  /**
   * Executes one governed save attempt through the CAP-02 IRR transport boundary.
   * Zero automatic retries on any outcome.
   */
  public async saveHoldings(request: PortfolioPortSaveRequest): Promise<PortfolioPortSaveOutcome> {
    const portfolioId = request?.portfolioId || DEFAULT_BROKER_IMPORT_PORTFOLIO_ID;

    // 1. Refuse caller-supplied identity or authorization-scope keys before any work.
    const identityKeys = findCallerSuppliedIdentityKeys(request);
    if (identityKeys.length > 0) {
      return {
        ok: false,
        code: 'INVALID_REQUEST',
        message:
          'Caller-supplied identity or authorization scope is refused by the portfolio store port ' +
          `(keys: ${identityKeys.join(', ')}).`,
        refusedHoldings: [],
        expectedRevision: request?.expectedRevision,
      };
    }

    // 2. DP-2 Option 2F: refuse unresolved or ambiguous holdings before any network request.
    const guard = evaluatePortSaveGuard(request?.holdings);
    if (!guard.saveable) {
      return {
        ok: false,
        code: (request?.holdings?.length ?? 0) > 0 ? 'REFUSED_UNRESOLVED_IDENTITY' : 'REFUSED_STORE_GUARD',
        message: guard.disabledReason || 'Holdings are not saveable through this port.',
        refusedHoldings: guard.refusedHoldings,
        expectedRevision: request?.expectedRevision,
      };
    }

    // 3. Enforce single-portfolio v1 scope (DEFAULT_PORTFOLIO).
    if (portfolioId !== DEFAULT_BROKER_IMPORT_PORTFOLIO_ID) {
      return {
        ok: false,
        code: 'INVALID_REQUEST',
        message: `Unsupported portfolio target "${portfolioId}"; only ${DEFAULT_BROKER_IMPORT_PORTFOLIO_ID} is admitted in CAP-02 v1.`,
        refusedHoldings: [],
        expectedRevision: request?.expectedRevision,
      };
    }

    // 4. Resolve mandatory expectedRevision token.
    let expectedRevision: number | undefined = request.expectedRevision;
    if (expectedRevision === undefined) {
      expectedRevision = this.knownRevisions.get(portfolioId);
    }
    if (expectedRevision === undefined && this.acquireRevisionBeforeSave) {
      const revRead = await readBrokerImportRevision(portfolioId, this.fetchImpl);
      if (!revRead.ok) {
        const code = mapClientRefusalToPortCode(revRead.outcome, revRead.status);
        return {
          ok: false,
          code,
          message: describeRefusalMessage(code, revRead.outcome, revRead.status),
          refusedHoldings: [],
        };
      }
      this.knownRevisions.set(portfolioId, revRead.revision);
      expectedRevision = revRead.revision;
    }
    if (expectedRevision === undefined) {
      expectedRevision = this.defaultExpectedRevision;
    }
    if (
      typeof expectedRevision !== 'number' ||
      !Number.isSafeInteger(expectedRevision) ||
      expectedRevision < 0
    ) {
      return {
        ok: false,
        code: 'INVALID_REQUEST',
        message: 'expectedRevision is mandatory and must be a non-negative safe integer.',
        refusedHoldings: [],
      };
    }

    // 5. Project UI holdings to the exact CAP-02 v1 wire DTO (selects broker-observed fields only).
    const mode = request.options?.mode === 'REPLACE' ? 'REPLACE' : 'MERGE';
    const projection = projectIngressToBrokerImportSaveRequest({
      holdings: request.holdings,
      mode,
      expectedRevision,
      sourceBroker: request.options?.sourceBroker,
      contentDigest: request.options?.contentDigest,
    });
    if (!projection.ok) {
      return {
        ok: false,
        code: 'INVALID_REQUEST',
        message: `Broker-import DTO projection refused: ${projection.reason}.`,
        refusedHoldings: [],
        expectedRevision,
      };
    }

    // 6. Execute ONE HTTP POST request — zero retries.
    const clientOutcome = await saveBrokerImportHoldings(portfolioId, projection.dto, this.fetchImpl);

    if (clientOutcome.ok) {
      const receipt: PortfolioCommitReceipt = clientOutcome.receipt;
      this.knownRevisions.set(portfolioId, receipt.revision);
      return {
        ok: true,
        receipt,
        durability: receipt.durability,
        durable: receipt.durable,
        revision: receipt.revision,
      };
    }

    if (clientOutcome.outcome === 'OUTCOME_UNKNOWN') {
      return {
        ok: 'unknown',
        code: 'OUTCOME_UNKNOWN',
        message:
          'The commit outcome could not be established over transport. No rollback or commit is claimed, and no automatic retry was performed. Reconcile via GET /api/broker-import/DEFAULT_PORTFOLIO/revision before retrying.',
        portfolioId,
        reconciliationRequired: true,
      };
    }

    const code = mapClientRefusalToPortCode(clientOutcome.outcome, clientOutcome.status);
    return {
      ok: false,
      code,
      message: describeRefusalMessage(code, clientOutcome.outcome, clientOutcome.status),
      refusedHoldings: [],
      expectedRevision,
    };
  }
}
