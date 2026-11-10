import { useEffect, useRef, useState } from 'react';
import type { BrokerImportSuccess } from 'iips-production-market-data/portfolio-ui';
import { commitBrokerImport, type PreparedBrokerImport } from '../../api/brokerImportStage4';
import { fetchUserPortfolioRead, fetchUserPortfolioSummaries, type UserPortfolioRead, type UserPortfolioSummary } from '../../api/userPortfolios';

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

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
};

interface Props {
  readonly prepared: PreparedBrokerImport | null;
  readonly onSuccess: (result: BrokerImportSuccess) => void;
  readonly onBusyChange: (busy: boolean) => void;
}

/** Uses the existing read API for destination/revision and post-commit readback. */
export function BrokerImportCommit({ prepared, onSuccess, onBusyChange }: Props) {
  const [portfolios, setPortfolios] = useState<readonly UserPortfolioSummary[] | null>(null);
  const [listError, setListError] = useState('');
  const [selection, setSelection] = useState('__new__');
  const [newId, setNewId] = useState('DEFAULT_PORTFOLIO');
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<BrokerImportSuccess | null>(null);
  const [refusal, setRefusal] = useState('');
  const [unknown, setUnknown] = useState(false);
  const [readback, setReadback] = useState<UserPortfolioRead | null>(null);
  const [readError, setReadError] = useState('');
  const [lastDestination, setLastDestination] = useState('');
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const portfolioId = selection === '__new__' ? newId : selection;

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

  async function commit() {
    if (inFlight.current || !prepared || !portfolios || !ID_PATTERN.test(portfolioId) || unknown) return;
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
      const result = await commitBrokerImport({ ...prepared, portfolioId, expectedRevision });
      if (!mounted.current) return;
      if (!result.ok) {
        setRefusal(messages[result.outcome] ?? `Commit refused or unavailable: ${result.outcome}.`);
        if (['OUTCOME_UNKNOWN', 'UNAVAILABLE', 'OWNER_CONTEXT_UNAVAILABLE'].includes(result.outcome)) setUnknown(true);
        return;
      }
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

  const containsSubmitted = !!readback && !!prepared && prepared.holdings.every(h =>
    readback.portfolio.holdings.some(saved => saved.symbol === h.symbol));
  const exactFirstBatch = !!readback && !!prepared && outcome?.disposition === 'SAVED_NEW_BATCH'
    && readback.portfolio.revision === outcome.revision
    && readback.portfolio.holdings.length === prepared.holdings.length
    && prepared.holdings.every(h => readback.portfolio.holdings.some(saved => saved.symbol === h.symbol && saved.quantity === h.quantity));

  return <section aria-label="Commit broker holdings" data-testid="broker-commit">
    <h3>Save to Portfolio / Commit Holdings</h3>
    <p>Qualification is checked by the IPD ingress and again on the durable commit path. IPD independently decides authorization; a preview or an available destination does not grant it.</p>
    {prepared ? <p data-testid="qualified-count">Qualified holdings: <strong>{prepared.holdings.length}</strong>.</p>
      : <p role="status">The complete import is not qualified for commitment. Any unresolved, rejected or unassessed row blocks the entire import (P04).</p>}
    {listError && <p role="alert">{listError}</p>}
    <button type="button" onClick={() => { void loadPortfolios(); }} disabled={busy}>Refresh destinations</button>{' '}
    <label htmlFor="broker-destination">Destination portfolio</label>{' '}
    <select id="broker-destination" value={selection} disabled={busy || unknown} onChange={e => { setSelection(e.target.value); setRefusal(''); }}>
      <option value="__new__">New or named portfolio</option>
      {portfolios?.map(p => <option key={p.portfolioId} value={p.portfolioId}>{p.portfolioId} (revision {p.revision})</option>)}
    </select>{' '}
    {selection === '__new__' && <><label htmlFor="broker-destination-id">Portfolio ID</label>{' '}
      <input id="broker-destination-id" value={newId} disabled={busy || unknown} onChange={e => { setNewId(e.target.value); setRefusal(''); }} /></>}
    <p>Destination: <code data-testid="commit-destination">{portfolioId || 'not selected'}</code>
      {portfolios && ID_PATTERN.test(portfolioId) && <> · expected revision {portfolios.find(p => p.portfolioId === portfolioId)?.revision ?? 0}</>}.</p>
    <button type="button" data-testid="commit-holdings" disabled={!prepared || !portfolios || !ID_PATTERN.test(portfolioId) || busy || unknown}
      onClick={() => { void commit(); }}>{busy ? 'Committing…' : outcome ? 'Submit same import again (duplicate check)' : 'Commit Holdings'}</button>
    {refusal && <p role="alert" data-testid="commit-refusal">{refusal}</p>}
    {outcome && <div role="status" data-testid="commit-receipt">
      {outcome.noOp ? <p>Already imported: duplicate submission was a no-op; no new revision was created. Existing holdings reported: {outcome.holdingsPersisted}.</p>
        : <p>Portfolio commit succeeded. Saved holdings: <strong>{outcome.holdingsPersisted}</strong>.</p>}
      <p>Destination <code>{lastDestination}</code> · persisted revision <strong>{outcome.revision}</strong> · {outcome.disposition} · store effect {outcome.storeEffect}.</p>
    </div>}
    {outcome && <button type="button" disabled={busy} onClick={() => { void retrieve(lastDestination, outcome.revision); }}>Retrieve committed portfolio</button>}
    {readError && <p role="alert">{readError}</p>}
    {readback && <div role="status" data-testid="commit-readback">
      <p>Retrieved portfolio <code>{readback.portfolio.portfolioId}</code> at revision <strong>{readback.portfolio.revision}</strong> with {readback.portfolio.holdings.length} stored holdings.</p>
      <p>{exactFirstBatch ? 'Readback confirms the submitted holdings and quantities.' : containsSubmitted ? 'Readback contains every submitted symbol; inspect the stored quantities below.' : 'Readback does not contain every submitted symbol; review the portfolio before claiming confirmation.'}</p>
      <table><caption>Retrieved persisted holdings</caption><thead><tr><th>Symbol</th><th>Quantity</th><th>Source</th><th>Identity status</th></tr></thead>
        <tbody>{readback.portfolio.holdings.map((h, i) => <tr key={`${h.symbol}-${i}`}><td>{h.symbol}</td><td>{h.quantity}</td><td>{h.sourceBroker}</td><td>{h.identityStatus ?? 'not reported'}</td></tr>)}</tbody></table>
    </div>}
  </section>;
}
