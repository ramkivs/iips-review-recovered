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
    <section aria-label="CAP-02 Broker Statement Import" data-testid="cap02-broker-import-surface">
      <header>
        <h1>Broker Statement Import</h1>
        <p>Review one broker CSV, check its retained evidence and explicitly commit qualified
          holdings to a selected personal portfolio. The durable path uses IPD&apos;s Stage 4
          import; it independently rechecks identity and authorization.</p>
        <p><strong>Stage 4 provenance:</strong> the commit sends broker-observed holdings,
          content digest, file name and import time. It sends neither raw CSV bytes nor
          browser-supplied canonical identity or owner claims.</p>
      </header>

      {/* The existing evidence preview and the Stage 4 commit now share one upload
          and frozen snapshot. The historical modal remains available below; its
          incomplete legacy portfolio.save DTO remains fail-closed. */}
      <BrokerHoldingsPreview allowCommit />

      <h2>Legacy import modal</h2>
      <p>The legacy modal remains available for review; its older manual-save route is blocked. Use the Broker Holdings workflow above for guarded Stage 4 commitment.</p>
      <p data-testid="cap02-provenance-disclosure">For the <strong>legacy modal only</strong>, fileName and importedAt are preview-only and are not transmitted in Contract v1&apos;s older manual-save DTO. The Stage 4 workflow above does transmit them.</p>
      <div data-testid="cap02-revision-controls">
        <span data-testid="cap02-expected-revision">
          Expected revision token: <code>{expectedRevision}</code>
        </span>{' '}
        <button
          type="button"
          data-testid="cap02-btn-read-revision"
          onClick={() => {
            void handleReadRevision();
          }}
        >
          Read Current Revision
        </button>{' '}
        <button
          type="button"
          data-testid="cap02-btn-toggle-modal"
          onClick={() => setIsModalOpen((prev) => !prev)}
        >
          {isModalOpen ? 'Close Import Modal' : 'Open Import Modal'}
        </button>
      </div>

      {revisionReadStatus && (
        <div role="status" data-testid="cap02-revision-read-status">
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
        <div role="alert" data-testid="cap02-revision-conflict-banner">
          {revisionConflictMessage}
        </div>
      )}

      {outcomeUnknownInfo && (
        <div role="alert" data-testid="cap02-outcome-unknown-reconcile-banner">
          <p>
            <strong>Commit Outcome Unknown ({outcomeUnknownInfo.portfolioId}):</strong>{' '}
            {outcomeUnknownInfo.message}
          </p>
          <button
            type="button"
            data-testid="cap02-btn-reconcile-unknown"
            onClick={() => {
              void handleReconcileUnknownOutcome();
            }}
          >
            Observe Revision via GET /api/broker-import/DEFAULT_PORTFOLIO/revision
          </button>
        </div>
      )}

      {reconciliationResult && (
        <div role="status" data-testid="cap02-reconciliation-status">
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
        <div role="status" data-testid="cap02-host-commit-receipt">
          Minimal v1 receipt: disposition <code>{lastCommitReceipt.disposition}</code>, revision{' '}
          <code>{lastCommitReceipt.revision}</code>, durability{' '}
          <code>{lastCommitReceipt.durability}</code>, durable{' '}
          <code>{String(lastCommitReceipt.durable)}</code>.
        </div>
      )}

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
