/**
 * CAP-02 Broker Statement Import host surface (`/user-portfolios/import`).
 *
 * Authority:
 *   - `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-04` §3.4
 *   - `IIPS-V3-CAP02-BROKER-IMPORT-UI-PLACEMENT-DECISION-EFFECTIVE-2026-10-23-01` §4.1 (P2)
 *   - `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` §§1.4, 2–4
 *
 * The normal workflow shares one IPD ingress result between preview, frozen evidence and
 * the guarded Stage 4 `portfolio.importBroker` operation, over the admitted CAP-02 route.
 * The older IPD-authored modal remains available for review; its legacy manual-save DTO
 * remains fail-closed and its revision read cannot resolve an unknown write.
 *
 * Does not modify `PortfolioWorkspace` (`/portfolio` remains certified read-only D09) and does
 * not modify `UserPortfolioList` (`/user-portfolios` remains G-2 read-only).
 *
 * PRESENTATION
 *   This surface and `Broker Holdings` are two views of one pipeline, so both render through
 *   the shared broker-workspace primitives in `components/broker/BrokerWorkspace`: the same
 *   page header, panels, summary figures, chips, notices and table treatment. Nothing below
 *   changes what is transmitted, retained, authorized or persisted — only how it is presented.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { BrokerHoldingsPreview } from '../broker-holdings/BrokerHoldingsPreview';
import {
  BrokerImportModal,
  DEFAULT_ALLOW_NON_PRODUCTION_BYPASS,
  getDefaultPortfolioStore,
  getGovernedBroadSecurityMaster,
  type PortfolioCommitReceipt,
  type PortfolioStore,
  type PortfolioStorePort,
  type SecurityMaster,
} from 'iips-production-market-data/portfolio-ui';
import {
  readBrokerImportRevision,
  type BrokerImportRevisionClientOutcome,
} from '../../api/brokerImport';
import {
  DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
  IrrBrokerImportStorePortAdapter,
  type BrokerImportReconciliationOutcome,
} from './irrPortfolioStorePortAdapter';
import {
  BrokerChip,
  BrokerDisclosure,
  BrokerFacts,
  BrokerFact,
  BrokerNotice,
  BrokerPageHeader,
  BrokerPanel,
  BrokerSteps,
  BrokerStep,
} from '../../components/broker/BrokerWorkspace';

export interface BrokerImportSurfaceProps {
  readonly storePort?: PortfolioStorePort;
  readonly fetchImpl?: typeof fetch;
  readonly initialExpectedRevision?: number;
  readonly portfolioStore?: PortfolioStore;
  readonly securityMaster?: SecurityMaster;
  readonly allowNonProductionBypass?: boolean;
  readonly initialModalOpen?: boolean;
}

export const BrokerImportSurface: React.FC<BrokerImportSurfaceProps> = ({
  storePort: injectedStorePort,
  fetchImpl = fetch,
  initialExpectedRevision = 0,
  portfolioStore: injectedPortfolioStore,
  securityMaster: injectedSecurityMaster,
  allowNonProductionBypass = DEFAULT_ALLOW_NON_PRODUCTION_BYPASS,
  initialModalOpen = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(initialModalOpen);
  const [expectedRevision, setExpectedRevision] = useState<number>(initialExpectedRevision);
  const [revisionReadStatus, setRevisionReadStatus] = useState<BrokerImportRevisionClientOutcome | null>(null);
  const [lastCommitReceipt, setLastCommitReceipt] = useState<PortfolioCommitReceipt | null>(null);
  const [outcomeUnknownInfo, setOutcomeUnknownInfo] = useState<{
    readonly message: string;
    readonly portfolioId: string;
    readonly reconciliationRequired: true;
    readonly priorExpectedRevision: number;
  } | null>(null);
  const [reconciliationResult, setReconciliationResult] = useState<BrokerImportReconciliationOutcome | null>(null);
  const [revisionConflictMessage, setRevisionConflictMessage] = useState<string | null>(null);

  const resolvedPortfolioStore = useMemo(
    () => injectedPortfolioStore ?? getDefaultPortfolioStore(),
    [injectedPortfolioStore],
  );

  const resolvedSecurityMaster = useMemo(
    () => injectedSecurityMaster ?? getGovernedBroadSecurityMaster(),
    [injectedSecurityMaster],
  );

  const defaultAdapter = useMemo(
    () =>
      new IrrBrokerImportStorePortAdapter({
        fetchImpl,
        defaultExpectedRevision: expectedRevision,
      }),
    [fetchImpl, expectedRevision],
  );

  const activeStorePort: PortfolioStorePort = injectedStorePort ?? defaultAdapter;

  const handleReadRevision = useCallback(async () => {
    const outcome = await readBrokerImportRevision(DEFAULT_BROKER_IMPORT_PORTFOLIO_ID, fetchImpl);
    setRevisionReadStatus(outcome);
    if (outcome.ok) {
      setExpectedRevision(outcome.revision);
      setRevisionConflictMessage(null);
    }
  }, [fetchImpl]);

  const handleReconcileUnknownOutcome = useCallback(async () => {
    const prior = outcomeUnknownInfo?.priorExpectedRevision ?? expectedRevision;
    const result = await defaultAdapter.reconcileOutcomeUnknown(
      prior,
      DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
    );
    // A revision observation cannot attribute the write to this import (nor rule
    // out a duplicate no-op). Keep the original unknown banner and token intact.
    setReconciliationResult(result);
  }, [defaultAdapter, expectedRevision, outcomeUnknownInfo]);

  const handleCommitReceipt = useCallback((receipt: PortfolioCommitReceipt) => {
    setLastCommitReceipt(receipt);
    setExpectedRevision(receipt.revision);
    setOutcomeUnknownInfo(null);
    setReconciliationResult(null);
    setRevisionConflictMessage(null);
  }, []);

  const handleOutcomeUnknown = useCallback(
    (info: { message: string; portfolioId: string; reconciliationRequired: true }) => {
      setOutcomeUnknownInfo({
        ...info,
        priorExpectedRevision: expectedRevision,
      });
      setReconciliationResult(null);
    },
    [expectedRevision],
  );

  const handleRevisionConflict = useCallback((message: string) => {
    setRevisionConflictMessage(message);
  }, []);

  return (
    <section aria-label="CAP-02 Broker Statement Import" data-testid="cap02-broker-import-surface" className="bw-page">
      <BrokerPageHeader
        eyebrow="Import workspace"
        title="Broker Statement Import"
        lede="Review one broker CSV, check its retained evidence and explicitly commit qualified holdings to a selected personal portfolio. The durable path uses IPD's Stage 4 import; it independently rechecks identity and authorization."
        meta={[
          <BrokerChip key="stage" label="STAGE 4 PROVENANCE" tone="informational" glyph="◆" />,
          <BrokerChip key="gate" label="WHOLE-IMPORT IDENTITY GATE" tone="neutral" glyph="◉" />,
          <BrokerChip key="dest" label={`DESTINATION SLOT ${DEFAULT_BROKER_IMPORT_PORTFOLIO_ID}`} tone="neutral" glyph="◇" />,
        ]}
      />

      {/* 2 — Compact Stage 4 provenance. */}
      <BrokerPanel
        eyebrow="Stage 4 provenance"
        title="What the commit transmits"
        hint="The commit carries broker observations only. It carries no identity assertion, no owner claim and no file bytes."
        secondary
        tight
      >
        <p><strong>Stage 4 provenance:</strong> the commit sends broker-observed holdings,
          content digest, file name and import time. It sends neither raw CSV bytes nor
          browser-supplied canonical identity or owner claims.</p>
        <BrokerDisclosure summary="What is refused on the wire, and why">
          <p>A holding carrying <code>companyId</code>, <code>runtimeCompanyId</code>,
            <code>identityStatus</code> or <code>resolutionDisposition</code> would be the caller
            asserting a canonical identity. Identity is resolved by IPD (Gate E W-6), so those keys
            are refused before a socket is opened rather than stripped and sent anyway.</p>
          <p>The same refusal covers owner, tenant, principal, credential, scope and session keys.
            Configuration supplies an endpoint location only; it authorizes nothing.</p>
        </BrokerDisclosure>
      </BrokerPanel>

      {/* 3 — the workflow at a glance. */}
      <BrokerPanel title="How an import is committed" secondary tight>
        <BrokerSteps>
          <BrokerStep title="Select" hint="A broker CSV is parsed in this browser. No file bytes are uploaded." />
          <BrokerStep title="Qualify" hint="The governed security master resolves every row. One unresolved row refuses the whole import." />
          <BrokerStep title="Retain" hint="Parsed evidence is retained locally and verified by retrieval. Retention is not a save." />
          <BrokerStep title="Commit" hint="You choose the destination and submit explicitly. IPD re-checks identity and authorization." />
        </BrokerSteps>
      </BrokerPanel>

      {/* 3–8 — the dominant workspace: formats, upload, parsed holdings, evidence and
          the explicit commit controls all live in the shared preview component. */}
      <BrokerHoldingsPreview allowCommit />

      {/* 10 — evidence availability, revision and retry status. */}
      <BrokerPanel
        eyebrow="Commit governance"
        title="Revision token and outcome reconciliation"
        hint="The expected revision token is the optimistic-concurrency value this surface will send. It is read from IPD, never derived from a receipt."
        aside={<BrokerChip label={`REVISION ${expectedRevision}`} tone="neutral" glyph="# " />}
      >
        <div data-testid="cap02-revision-controls" className="bw-actions">
          <span className="bw-retention__status" data-testid="cap02-expected-revision">
            Expected revision token: <code>{expectedRevision}</code>
          </span>{' '}
          <button
            type="button"
            className="bw-btn"
            data-testid="cap02-btn-read-revision"
            onClick={() => {
              void handleReadRevision();
            }}
          >
            Read Current Revision
          </button>
        </div>

        <BrokerFacts>
          <BrokerFact label="Destination slot">
            <code>{DEFAULT_BROKER_IMPORT_PORTFOLIO_ID}</code>
          </BrokerFact>
          <BrokerFact label="Revision token source">
            <code>GET /api/broker-import/{DEFAULT_BROKER_IMPORT_PORTFOLIO_ID}/revision</code>
          </BrokerFact>
        </BrokerFacts>

        {revisionReadStatus && (
          <div role="status" data-testid="cap02-revision-read-status" className="bw-retention__status">
            {revisionReadStatus.ok ? (
              <span>
                Revision read succeeded for <code>{revisionReadStatus.portfolioId}</code>: revision{' '}
                <code>{revisionReadStatus.revision}</code> (HTTP 200).
              </span>
            ) : (
              <span>
                Revision read refused/unavailable: <code>{revisionReadStatus.outcome}</code> (HTTP{' '}
                {revisionReadStatus.status}).
              </span>
            )}
          </div>
        )}

        {revisionConflictMessage && (
          <BrokerNotice tone="critical" alert title="Revision conflict">
            <div data-testid="cap02-revision-conflict-banner">{revisionConflictMessage}</div>
          </BrokerNotice>
        )}

        {outcomeUnknownInfo && (
          <BrokerNotice tone="critical" alert title={`Commit Outcome Unknown (${outcomeUnknownInfo.portfolioId})`}>
            <div data-testid="cap02-outcome-unknown-reconcile-banner">
              <p>
                <strong>Commit Outcome Unknown ({outcomeUnknownInfo.portfolioId}):</strong>{' '}
                {outcomeUnknownInfo.message}
              </p>
              <button
                type="button"
                className="bw-btn"
                data-testid="cap02-btn-reconcile-unknown"
                onClick={() => {
                  void handleReconcileUnknownOutcome();
                }}
              >
                Observe Revision via GET /api/broker-import/DEFAULT_PORTFOLIO/revision
              </button>
            </div>
          </BrokerNotice>
        )}

        {reconciliationResult && (
          <div role="status" data-testid="cap02-reconciliation-status" className="bw-retention__status">
            {reconciliationResult.revisionRead ? (
              <span>
                Observed <code>{reconciliationResult.portfolioId}</code> at revision{' '}
                <code>{reconciliationResult.revision}</code> (
                {reconciliationResult.revisionAdvancedSincePrior
                  ? 'revision advanced since the prior token'
                  : 'revision did not advance since the prior token'}
                ). A revision alone cannot prove whether this import committed or was a duplicate;
                its outcome remains unknown. Do not retry automatically.
              </span>
            ) : (
              <span>
                Reconciliation read inconclusive: <code>{reconciliationResult.outcome}</code> (HTTP{' '}
                {reconciliationResult.status}); commit outcome remains unknown.
              </span>
            )}
          </div>
        )}

        {lastCommitReceipt && (
          <div role="status" data-testid="cap02-host-commit-receipt" className="bw-retention__status">
            Minimal v1 receipt: disposition <code>{lastCommitReceipt.disposition}</code>, revision{' '}
            <code>{lastCommitReceipt.revision}</code>, durability{' '}
            <code>{lastCommitReceipt.durability}</code>, durable{' '}
            <code>{String(lastCommitReceipt.durable)}</code>.
          </div>
        )}
      </BrokerPanel>

      {/* 11 — the legacy IPD-authored modal, deliberately visually secondary. */}
      <BrokerPanel
        eyebrow="Retained for review"
        title="Legacy import modal"
        hint="The legacy modal remains available for review; its older manual-save route is blocked. Use the Broker Holdings workflow above for guarded Stage 4 commitment."
        secondary
        tight
      >
        <p data-testid="cap02-provenance-disclosure">For the <strong>legacy modal only</strong>, fileName and importedAt are preview-only and are not transmitted in Contract v1&apos;s older manual-save DTO. The Stage 4 workflow above does transmit them.</p>
        <div className="bw-actions">
          <button
            type="button"
            className="bw-btn"
            data-testid="cap02-btn-toggle-modal"
            onClick={() => setIsModalOpen((prev) => !prev)}
          >
            {isModalOpen ? 'Close Import Modal' : 'Open Import Modal'}
          </button>
        </div>
      </BrokerPanel>

      <BrokerImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        portfolioStore={resolvedPortfolioStore}
        storePort={activeStorePort}
        expectedRevision={expectedRevision}
        securityMaster={resolvedSecurityMaster}
        allowNonProductionBypass={allowNonProductionBypass}
        executionEnvironment="NON_PRODUCTION"
        onCommitReceipt={handleCommitReceipt}
        onOutcomeUnknown={handleOutcomeUnknown}
        onRevisionConflict={handleRevisionConflict}
      />
    </section>
  );
};
