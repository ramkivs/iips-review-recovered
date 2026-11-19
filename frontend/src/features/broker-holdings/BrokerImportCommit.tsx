import { useEffect, useRef, useState } from 'react';
// IPD PR #177/#178 additive types, hand-declared locally — see
// `server/broker-import/brokerPartialAcceptanceContract.ts` for why (a TypeScript Package ID
// collision between the two same-named npm aliases of the same upstream repo at different pins).
import type { BrokerPartialAcceptanceApproval, BrokerPartialAcceptanceSummary } from '../../../server/broker-import/brokerPartialAcceptanceContract';
import { buildPartialAcceptanceApproval, commitBrokerImport, type PreparedBrokerImport, type Stage4SuccessResult } from '../../api/brokerImportStage4';
import type { PreparedFullSnapshotImport } from '../../api/brokerFullSnapshotImport';
import { fetchUserPortfolioRead, fetchUserPortfolioSummaries, type UserPortfolioRead, type UserPortfolioSummary } from '../../api/userPortfolios';
import {
  BrokerChip,
  BrokerNotice,
  BrokerPanel,
  BrokerSpinner,
  BrokerSummary,
  BrokerSummaryItem,
} from '../../components/broker/BrokerWorkspace';

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
/** The local, non-authoritative display label recorded on an approval. Confers no identity. */
const LOCAL_APPROVER_LABEL = 'local-operator';

const messages: Record<string, string> = {
  WRITE_NOT_AUTHORIZED: 'Commit refused: IPD did not authorize the local personal-use write. No holdings were persisted by this request.',
  OWNER_CONTEXT_UNAVAILABLE: 'Commit outcome unknown: the server-owned owner context was unavailable or IPC closed without an acknowledgement. No owner can be supplied by the browser; do not retry automatically.',
  REFUSED_UNRESOLVED_IDENTITY: 'Commit refused: IPD could not resolve every holding through P04. The entire import was rejected; no holdings were persisted.',
  REFUSED_STORE_GUARD: 'Commit refused by the portfolio store guard. No holdings were persisted.',
  REVISION_CONFLICT: 'Commit refused: the portfolio revision changed. Refresh the destination list and review before submitting again.',
  RESOURCE_UNAVAILABLE: 'Commit refused: the destination portfolio is unavailable in the active owner scope.',
  INVALID_REQUEST: 'Commit refused: the request or its broker provenance was not admissible.',
  REQUEST_REFUSED: 'Commit refused by the first-party request guard.',
  UNAVAILABLE: 'Commit service unavailable. The import was not confirmed; do not assume it failed or retry it automatically.',
  OUTCOME_UNKNOWN: 'Commit outcome unknown: the response was lost or invalid. Do not resubmit automatically; reconcile the original import with the durable evidence before retrying.',
  REFUSED_DUPLICATE_ROWS: 'Commit refused: the snapshot contains duplicate symbol rows. Nothing was persisted.',
  REFUSED_EMPTY_SNAPSHOT: 'Commit refused: the snapshot carries no holdings, or no portfolio exists at the expected revision.',
  REFUSED_INVALID_SOURCE_DIGEST: 'Commit refused: the snapshot carries no valid source digest.',
  REFUSED_APPROVAL_MISMATCH: 'Commit refused: the approval no longer matches the current snapshot assessment. Review the summary again and re-approve.',
};

/**
 * Refusal codes that are decided, not ambiguous. Only these leave the destination
 * selectable for a reviewed, operator-initiated retry; an unknown outcome locks it.
 */
const DECIDED_REFUSALS: readonly string[] = [
  'WRITE_NOT_AUTHORIZED',
  'REFUSED_UNRESOLVED_IDENTITY',
  'REFUSED_STORE_GUARD',
  'REVISION_CONFLICT',
  'RESOURCE_UNAVAILABLE',
  'INVALID_REQUEST',
  'REQUEST_REFUSED',
  'REFUSED_DUPLICATE_ROWS',
  'REFUSED_EMPTY_SNAPSHOT',
  'REFUSED_INVALID_SOURCE_DIGEST',
  'REFUSED_APPROVAL_MISMATCH',
];

interface Props {
  readonly prepared: PreparedBrokerImport | null;
  /** IPD PR #177/#178 daily-snapshot opt-in. Null when the file could not be prepared that way. */
  readonly fullSnapshotPrepared?: PreparedFullSnapshotImport | null;
  readonly onSuccess: (result: Stage4SuccessResult) => void;
  readonly onBusyChange: (busy: boolean) => void;
}

/** Uses the existing read API for destination/revision and post-commit readback. */
export function BrokerImportCommit({ prepared, fullSnapshotPrepared = null, onSuccess, onBusyChange }: Props) {
  const [portfolios, setPortfolios] = useState<readonly UserPortfolioSummary[] | null>(null);
  const [listError, setListError] = useState('');
  const [selection, setSelection] = useState('__new__');
  const [newId, setNewId] = useState('DEFAULT_PORTFOLIO');
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Stage4SuccessResult | null>(null);
  const [refusal, setRefusal] = useState('');
  const [unknown, setUnknown] = useState(false);
  const [readback, setReadback] = useState<UserPortfolioRead | null>(null);
  const [readError, setReadError] = useState('');
  const [lastDestination, setLastDestination] = useState('');
  // IPD PR #177/#178: the operator's explicit opt-in to submit a full daily snapshot, where
  // some rows may remain unresolved and are retained as evidence after explicit approval.
  const [useFullSnapshot, setUseFullSnapshot] = useState(false);
  // The exact summary (with its digest) IPD returned from PARTIAL_ACCEPTANCE_REQUIRED. Nothing
  // was written when this is set; an explicit "approve" action resubmits with this digest.
  const [pendingApproval, setPendingApproval] = useState<BrokerPartialAcceptanceSummary | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const portfolioId = selection === '__new__' ? newId : selection;
  const activePrepared = useFullSnapshot ? fullSnapshotPrepared : prepared;

  async function loadPortfolios() {
    setListError('');
    try {
      const entries = await fetchUserPortfolioSummaries();
      if (!Array.isArray(entries) || entries.some(p => !p || typeof p.portfolioId !== 'string'
          || !ID_PATTERN.test(p.portfolioId) || !Number.isSafeInteger(p.revision) || p.revision < 1)) {
        throw new Error('Invalid portfolio list');
      }
      if (mounted.current) setPortfolios(entries);
    } catch {
      if (mounted.current) {
        setPortfolios(null);
        setListError('Destination and revision unavailable: check the server-owned owner binding and IPC connection. No write is authorized by this screen.');
      }
    }
  }
  useEffect(() => {
    mounted.current = true;
    void loadPortfolios();
    return () => { mounted.current = false; };
  }, []);

  async function retrieve(id: string, minimumRevision: number) {
    setReadError('');
    setReadback(null);
    try {
      const read = await fetchUserPortfolioRead(id);
      if (read.portfolio.portfolioId !== id || !Number.isSafeInteger(read.portfolio.revision)
          || read.portfolio.revision < minimumRevision || read.rejectedHoldings !== 0) throw new Error('Invalid or incomplete readback');
      if (mounted.current) setReadback(read);
    } catch {
      if (mounted.current) setReadError('Portfolio readback unavailable or incomplete. The commit receipt remains separate; saved holdings have not been confirmed by retrieval.');
    }
  }

  async function commit(approval?: BrokerPartialAcceptanceApproval) {
    if (inFlight.current || !activePrepared || !portfolios || !ID_PATTERN.test(portfolioId) || unknown) return;
    const expectedRevision = portfolios.find(p => p.portfolioId === portfolioId)?.revision ?? 0;
    inFlight.current = true;
    setBusy(true);
    onBusyChange(true);
    setRefusal('');
    setReadback(null);
    setReadError('');
    // Keep a previous receipt only until a new attempt starts: it must not describe
    // a later refusal, duplicate, or unknown result.
    setOutcome(null);
    try {
      const result = await commitBrokerImport({
        ...activePrepared,
        portfolioId,
        expectedRevision,
        ...(approval ? { partialAcceptance: approval } : {}),
      });
      if (!mounted.current) return;
      if (result.ok === 'partial-acceptance-required') {
        // Nothing was written. The exact summary IPD computed must be shown and explicitly
        // approved before a resubmission carrying its digest can proceed.
        setPendingApproval(result.summary);
        return;
      }
      if (!result.ok) {
        setRefusal(messages[result.outcome] ?? `Commit refused or unavailable: ${result.outcome}.`);
        if (['OUTCOME_UNKNOWN', 'UNAVAILABLE', 'OWNER_CONTEXT_UNAVAILABLE'].includes(result.outcome)) setUnknown(true);
        return;
      }
      setPendingApproval(null);
      setOutcome(result.result);
      setLastDestination(portfolioId);
      onSuccess(result.result);
      // The list is only a revision source; refresh from IPD, never synthesize a
      // portfolio summary from the receipt. Then independently read the actual holdings.
      await loadPortfolios();
      await retrieve(portfolioId, result.result.revision);
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
      onBusyChange(false);
    }
  }

  /** Approves EXACTLY the summary shown, by digest. Never recomputed; always IPD's own value. */
  function approveAndCommit() {
    if (!pendingApproval) return;
    const approval = buildPartialAcceptanceApproval(pendingApproval, LOCAL_APPROVER_LABEL);
    void commit(approval);
  }

  function declineApproval() {
    setPendingApproval(null);
  }

  function toggleFullSnapshot(next: boolean) {
    if (busy) return;
    setUseFullSnapshot(next);
    // Switching modes changes the active holdings entirely; a stale refusal, receipt or pending
    // approval from the other mode must not be shown against the newly active payload.
    setRefusal('');
    setPendingApproval(null);
    setOutcome(null);
    setReadback(null);
    setReadError('');
  }

  const containsSubmitted = !!readback && !!activePrepared && activePrepared.holdings.every(h =>
    readback.portfolio.holdings.some(saved => saved.symbol === h.symbol));
  const exactFirstBatch = !!readback && !!activePrepared && outcome?.disposition === 'SAVED_NEW_BATCH'
    && readback.portfolio.revision === outcome.revision
    && readback.portfolio.holdings.length === activePrepared.holdings.length
    && activePrepared.holdings.every(h => readback.portfolio.holdings.some(saved => saved.symbol === h.symbol && saved.quantity === h.quantity));

  const resolvedExpectedRevision = portfolios?.find(p => p.portfolioId === portfolioId)?.revision ?? 0;
  const canCommit = !!activePrepared && !!portfolios && ID_PATTERN.test(portfolioId) && !busy && !unknown && !pendingApproval;

  return <section aria-label="Commit broker holdings" data-testid="broker-commit">
    <BrokerPanel
      eyebrow="Step 4 — explicit"
      title="Save to Portfolio / Commit Holdings"
      hint="Qualification is checked by the IPD ingress and again on the durable commit path. IPD independently decides authorization; a preview or an available destination does not grant it."
      aside={activePrepared !== null
        ? <BrokerChip label={`QUALIFIED ${activePrepared.holdings.length}`} tone="positive" glyph="✓" />
        : <BrokerChip label="NOT QUALIFIED" tone="warning" glyph="▲" />}
    >
      {activePrepared ? <p data-testid="qualified-count">Qualified holdings: <strong>{activePrepared.holdings.length}</strong>.</p>
        : <p role="status">The complete import is not qualified for commitment. Any unresolved, rejected or unassessed row blocks the entire import (P04).</p>}
      {listError && <p role="alert">{listError}</p>}

      <div className="bw-field">
        <label className="bw-label">
          <input type="checkbox" data-testid="full-snapshot-toggle" checked={useFullSnapshot} disabled={busy || !fullSnapshotPrepared}
            onChange={e => toggleFullSnapshot(e.target.checked)} />
          {' '}Submit as a full daily snapshot (allows partial acceptance)
        </label>
        <p className="bw-hint">
          {fullSnapshotPrepared
            ? 'IPD independently re-assesses identity for every row. If some rows remain unresolved, nothing is written until you explicitly approve a summary showing exactly which rows and why; the resolved rows then persist and the unresolved rows are retained as evidence, never silently dropped.'
            : 'Unavailable: this file could not be prepared as a complete, valid full-snapshot book.'}
        </p>
        {useFullSnapshot && fullSnapshotPrepared?.clientIdentityPreview && (
          <p data-testid="client-identity-preview">
            Local estimate (not authoritative — IPD decides): {fullSnapshotPrepared.clientIdentityPreview.resolved} of{' '}
            {fullSnapshotPrepared.clientIdentityPreview.evaluated} rows resolved locally.
          </p>
        )}
      </div>

      <div className="bw-actions">
        <button type="button" className="bw-btn bw-btn--sm" onClick={() => { void loadPortfolios(); }} disabled={busy}>Refresh destinations</button>
      </div>

      <div className="bw-field">
        <label className="bw-label" htmlFor="broker-destination">Destination portfolio</label>
        <select id="broker-destination" className="bw-control" value={selection} disabled={busy || unknown}
          onChange={e => { setSelection(e.target.value); setRefusal(''); }}>
          <option value="__new__">New or named portfolio</option>
          {portfolios?.map(p => <option key={p.portfolioId} value={p.portfolioId}>{p.portfolioId} (revision {p.revision})</option>)}
        </select>
      </div>

      {selection === '__new__' && (
        <div className="bw-field">
          <label className="bw-label" htmlFor="broker-destination-id">Portfolio ID</label>
          <input id="broker-destination-id" className="bw-control" value={newId} disabled={busy || unknown}
            onChange={e => { setNewId(e.target.value); setRefusal(''); }} />
        </div>
      )}

      <BrokerSummary>
        <BrokerSummaryItem label="Destination" value={<code>{portfolioId || 'not selected'}</code>} />
        <BrokerSummaryItem label="Expected revision" value={resolvedExpectedRevision} sub="read from IPD, never from a receipt" />
        <BrokerSummaryItem label="Mode" value={activePrepared?.mode ?? '—'} sub="submitted with the request" />
      </BrokerSummary>

      <p data-testid="commit-destination-detail">Destination: <code data-testid="commit-destination">{portfolioId || 'not selected'}</code>
        {portfolios && ID_PATTERN.test(portfolioId) && <> · expected revision {portfolios.find(p => p.portfolioId === portfolioId)?.revision ?? 0}</>}.</p>

      <div className="bw-actions">
        <button type="button" className="bw-btn bw-btn--primary" data-testid="commit-holdings"
          disabled={!canCommit}
          onClick={() => { void commit(); }}>{busy ? 'Committing…' : outcome ? 'Submit same import again (duplicate check)' : 'Commit Holdings'}</button>
        {busy ? <BrokerSpinner label="Committing to IPD…" /> : null}
      </div>

      {pendingApproval && <BrokerNotice tone="warning" title="Partial acceptance required — nothing has been written">
       <div data-testid="partial-acceptance-panel">
        <p>IPD could not resolve identity for <strong>{pendingApproval.unresolvedCount}</strong> of{' '}
          <strong>{pendingApproval.totalRows}</strong> row(s) in this snapshot. Approving will persist the{' '}
          <strong>{pendingApproval.resolvedCount}</strong> resolved row(s) (market value{' '}
          {pendingApproval.resolvedMarketValue}) and retain the unresolved rows below as outstanding evidence —
          nothing is dropped silently.</p>
        {pendingApproval.duplicateSymbols.length > 0 && (
          <p role="alert">Duplicate symbol rows block this snapshot: {pendingApproval.duplicateSymbols.map(d => `${d.symbol} (${d.occurrences})`).join(', ')}.</p>
        )}
        <div className="bw-table-wrap">
          <table className="bw-table">
            <caption>Unresolved rows (retained as evidence if approved)</caption>
            <thead><tr><th scope="col">Symbol</th><th scope="col" className="bw-num">Quantity</th><th scope="col">Reason</th></tr></thead>
            <tbody>{pendingApproval.refusedHoldings.map((row, i) => (
              <tr key={`${row.symbol}-${i}`}><td>{row.symbol}</td><td className="bw-num">{row.quantity}</td><td>{row.reason}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <div className="bw-actions">
          <button type="button" className="bw-btn bw-btn--primary" data-testid="approve-partial-acceptance"
            disabled={busy || pendingApproval.duplicateSymbols.length > 0} onClick={approveAndCommit}>
            Approve and commit the resolved rows
          </button>
          <button type="button" className="bw-btn" data-testid="decline-partial-acceptance" disabled={busy} onClick={declineApproval}>
            Cancel — do not write anything
          </button>
        </div>
       </div>
      </BrokerNotice>}

      {refusal && <BrokerNotice tone="critical" alert title="Commit refused">
        <div data-testid="commit-refusal">{refusal}</div>
      </BrokerNotice>}

      {refusal && DECIDED_REFUSALS.length > 0 && unknown ? (
        <BrokerNotice tone="warning" title="This outcome is unknown, not refused">
          <p>An unknown outcome cannot be retried automatically: a retry could duplicate a commit
            that may already have landed. Reconcile against the retained evidence first.</p>
        </BrokerNotice>
      ) : null}

      {outcome && <div role="status" data-testid="commit-receipt" className="bw-retention__status">
        {outcome.noOp ? <p>Already imported: duplicate submission was a no-op; no new revision was created. Existing holdings reported: {outcome.holdingsPersisted}.</p>
          : <p>Portfolio commit succeeded. Saved holdings: <strong>{outcome.holdingsPersisted}</strong>.</p>}
        <p>Destination <code>{lastDestination}</code> · persisted revision <strong>{outcome.revision}</strong> · {outcome.disposition} · store effect {outcome.storeEffect}.</p>
        {outcome.snapshotState && (
          <p data-testid="commit-snapshot-state">
            Snapshot state: <strong>{outcome.snapshotState}</strong>
            {typeof outcome.unresolvedCount === 'number' && outcome.unresolvedCount > 0
              && <> · {outcome.unresolvedCount} row(s) remain unresolved and are retained as evidence, awaiting later resolution.</>}
          </p>
        )}
        {outcome.reconciliation && (
          <p data-testid="commit-reconciliation">
            Reconciliation: {outcome.reconciliation.observed} observed, {outcome.reconciliation.exitedZeroQuantity} exited,{' '}
            {outcome.reconciliation.carriedForwardAbsent} carried forward absent, {outcome.reconciliation.unresolved} unresolved
            {outcome.reconciliation.stale ? ' · marked stale' : ''}.
          </p>
        )}
      </div>}

      {outcome && <div className="bw-actions">
        <button type="button" className="bw-btn" disabled={busy} onClick={() => { void retrieve(lastDestination, outcome.revision); }}>Retrieve committed portfolio</button>
      </div>}

      {readError && <BrokerNotice tone="critical" alert title="Readback unavailable">
        <div>{readError}</div>
      </BrokerNotice>}

      {readback && <div role="status" data-testid="commit-readback">
        <p>Retrieved portfolio <code>{readback.portfolio.portfolioId}</code> at revision <strong>{readback.portfolio.revision}</strong> with {readback.portfolio.holdings.length} stored holdings.</p>
        <p>{exactFirstBatch ? 'Readback confirms the submitted holdings and quantities.' : containsSubmitted ? 'Readback contains every submitted symbol; inspect the stored quantities below.' : 'Readback does not contain every submitted symbol; review the portfolio before claiming confirmation.'}</p>
        <div className="bw-table-wrap">
          <table className="bw-table">
            <caption>Retrieved persisted holdings</caption>
            <thead><tr><th scope="col">Symbol</th><th scope="col" className="bw-num">Quantity</th><th scope="col">Source</th><th scope="col">Identity status</th></tr></thead>
            <tbody>{readback.portfolio.holdings.map((h, i) => <tr key={`${h.symbol}-${i}`}><td>{h.symbol}</td><td className="bw-num">{h.quantity}</td><td>{h.sourceBroker}</td><td>{h.identityStatus ?? 'not reported'}</td></tr>)}</tbody>
          </table>
        </div>
      </div>}
    </BrokerPanel>
  </section>;
}
