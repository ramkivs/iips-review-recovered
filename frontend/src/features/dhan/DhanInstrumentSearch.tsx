import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  DhanIdentityApiError,
  qualifyDhanIdentity,
  resolveDhanIdentity,
  searchDhanInstruments,
  type IdentityOutcome,
  type InstrumentSearchResult,
} from '../../api/dhanIdentity';

/**
 * The operator-facing half of a failed identity call. The server names the settings it lacks;
 * repeating those names is the difference between "unavailable" and an actionable message.
 * Only NAMES cross this boundary — the server holds the values and never sends them.
 */
function describeIdentityFailure(cause: unknown, fallback: string): string {
  if (!(cause instanceof DhanIdentityApiError)) return fallback;
  return cause.requiredSettings.length > 0
    ? `${cause.message} Configure ${cause.requiredSettings.join(' and ')} on the IRR server.`
    : cause.message;
}

function Outcome({ outcome, label }: { outcome: IdentityOutcome; label?: string }) {
  return <section aria-label={label ?? `${outcome.status} identity outcome`} data-identity-status={outcome.status}>
    <h4>{outcome.status}</h4>
    {outcome.status === 'QUALIFIED' ? <>
      <p><strong>Canonical identity:</strong> {outcome.securityIdentity.securityId}</p>
      <p><strong>Company:</strong> {outcome.companyId} · <strong>Exchange:</strong> {outcome.exchange}</p>
      <p><strong>ISIN authority:</strong> {outcome.isinAuthority}</p>
    </> : <>
      <p><strong>Reason:</strong> <code>{outcome.reason}</code></p>
      <p>{outcome.details}</p>
    </>}
    <details><summary>Full IPD identity evidence</summary><pre>{JSON.stringify(outcome, null, 2)}</pre></details>
  </section>;
}

function SearchRow({ row, onResolve }: { row: InstrumentSearchResult; onResolve: (outcome: IdentityOutcome) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function resolveExact() {
    if (row.result.status !== 'QUALIFIED') return;
    setBusy(true); setError('');
    try {
      const result = await resolveDhanIdentity({ companyId: row.result.companyId, exchange: row.exchange, securityId: row.result.securityIdentity.securityId });
      onResolve(result);
    } catch (cause) { setError(describeIdentityFailure(cause, 'Unable to resolve this exact identity.')); }
    finally { setBusy(false); }
  }
  return <article aria-label={`${row.symbol} ${row.exchange} search result`}>
    <h3>{row.symbol}</h3><p>Exchange: {row.exchange}</p>
    <Outcome outcome={row.result} label={`${row.symbol} ${row.exchange} provider qualification`} />
    {row.result.status === 'QUALIFIED' && <button type="button" disabled={busy} onClick={() => void resolveExact()}>
      {busy ? 'Resolving exact identity…' : 'Resolve exact identity'}
    </button>}
    {error && <p role="alert">{error}</p>}
  </article>;
}

export function DhanInstrumentSearch() {
  const [query, setQuery] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState<readonly InstrumentSearchResult[] | null>(null);
  const [resolved, setResolved] = useState<IdentityOutcome | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [resolveExchange, setResolveExchange] = useState<'NSE' | 'BSE'>('NSE');
  const [manualResolveBusy, setManualResolveBusy] = useState(false);
  const [manualResolveError, setManualResolveError] = useState('');
  const [isin, setIsin] = useState('');
  const [exchange, setExchange] = useState<'NSE' | 'BSE'>('NSE');
  const [symbol, setSymbol] = useState('');
  const [qualifyBusy, setQualifyBusy] = useState(false);
  const [qualifyError, setQualifyError] = useState('');
  const [qualified, setQualified] = useState<IdentityOutcome | null>(null);

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSearchBusy(true); setSearchError(''); setResults(null); setResolved(null);
    try {
      const response = await searchDhanInstruments(query);
      setResults(response.results);
    } catch (cause) { setSearchError(describeIdentityFailure(cause, 'Instrument search is unavailable.')); }
    finally { setSearchBusy(false); }
  }
  async function submitExactResolution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setManualResolveBusy(true); setManualResolveError(''); setResolved(null);
    try {
      setResolved(await resolveDhanIdentity({ companyId: companyId.trim(), exchange: resolveExchange, securityId: securityId.trim() }));
    } catch (cause) { setManualResolveError(describeIdentityFailure(cause, 'Exact identity resolution is unavailable.')); }
    finally { setManualResolveBusy(false); }
  }
  async function submitQualification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setQualifyBusy(true); setQualifyError(''); setQualified(null);
    try {
      setQualified(await qualifyDhanIdentity({ ...(isin.trim() ? { isin: isin.trim() } : {}), exchange, ...(symbol.trim() ? { symbol: symbol.trim() } : {}) }));
    } catch (cause) { setQualifyError(describeIdentityFailure(cause, 'Identity qualification is unavailable.')); }
    finally { setQualifyBusy(false); }
  }

  return <main aria-label="DHAN instrument search and identity qualification">
    <header><h2>DHAN Instrument Search</h2>
      <p>This screen uses IPD's offline registry snapshot; it does not contact Dhan or perform live-provider qualification. Search candidates are evidence only, not approvals, and nothing here modifies IRR's governed security master or identity roster.</p>
    </header>
    <form onSubmit={(event) => void submitSearch(event)}>
      <label htmlFor="dhan-instrument-query">Symbol or ISIN</label>
      <input id="dhan-instrument-query" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} required />
      <button type="submit" disabled={searchBusy || !query.trim()}>{searchBusy ? 'Searching…' : 'Search instruments'}</button>
    </form>
    {searchBusy && <p role="status">Searching IPD instrument evidence…</p>}
    {searchError && <p role="alert">{searchError}</p>}
    {results && results.length === 0 && <p role="status">No instrument candidates were returned by IPD.</p>}
    {results && results.length > 0 && <section aria-label="Instrument search results">
      <p>{results.length} candidate{results.length === 1 ? '' : 's'} returned. Duplicate rows are retained as received.</p>
      {results.map((row, index) => <SearchRow key={`${row.symbol}-${row.exchange}-${index}`} row={row} onResolve={setResolved} />)}
    </section>}
    <section aria-label="Resolve exact identity">
      <h3>Resolve exact identity</h3>
      <p>Enter the complete company ID, exchange, and canonical security identity. IPD requires an exact company + listing + ISIN + series match; it will not fall back to partial identity.</p>
      <form onSubmit={(event) => void submitExactResolution(event)}>
        <label htmlFor="dhan-resolve-company">Company ID</label>
        <input id="dhan-resolve-company" value={companyId} maxLength={100} onChange={(event) => setCompanyId(event.target.value)} required />
        <label htmlFor="dhan-resolve-exchange">Exchange</label>
        <select id="dhan-resolve-exchange" value={resolveExchange} onChange={(event) => setResolveExchange(event.target.value as 'NSE' | 'BSE')}>
          <option value="NSE">NSE</option><option value="BSE">BSE</option>
        </select>
        <label htmlFor="dhan-resolve-security-id">Canonical security identity</label>
        <input id="dhan-resolve-security-id" value={securityId} maxLength={100} onChange={(event) => setSecurityId(event.target.value)} required placeholder="ISIN:<isin>:<series>" />
        <button type="submit" disabled={manualResolveBusy || !companyId.trim() || !securityId.trim()}>{manualResolveBusy ? 'Resolving…' : 'Resolve exact identity'}</button>
      </form>
      {manualResolveBusy && <p role="status">Requesting exact IPD identity resolution…</p>}
      {manualResolveError && <p role="alert">{manualResolveError}</p>}
      {resolved && <Outcome outcome={resolved} label="Exact identity resolution result" />}
    </section>

    <section aria-label="Qualify identity from supplied evidence">
      <h3>Qualify an identity</h3>
      <p>Enter the observed ISIN and listing exchange. Omitting ISIN requests IPD's typed missing-ISIN outcome. Symbol is context only; IPD does not use it as matching evidence.</p>
      <form onSubmit={(event) => void submitQualification(event)}>
        <label htmlFor="dhan-identity-isin">ISIN</label>
        <input id="dhan-identity-isin" value={isin} maxLength={100} onChange={(event) => setIsin(event.target.value)} />
        <label htmlFor="dhan-identity-exchange">Exchange</label>
        <select id="dhan-identity-exchange" value={exchange} onChange={(event) => setExchange(event.target.value as 'NSE' | 'BSE')}>
          <option value="NSE">NSE</option><option value="BSE">BSE</option>
        </select>
        <label htmlFor="dhan-identity-symbol">Symbol (context only)</label>
        <input id="dhan-identity-symbol" value={symbol} maxLength={100} onChange={(event) => setSymbol(event.target.value)} />
        <button type="submit" disabled={qualifyBusy}>{qualifyBusy ? 'Qualifying…' : 'Request qualification'}</button>
      </form>
      {qualifyBusy && <p role="status">Requesting provider-side identity qualification…</p>}
      {qualifyError && <p role="alert">{qualifyError}</p>}
      {qualified && <Outcome outcome={qualified} label="Identity qualification result" />}
    </section>
    <p><strong>Authority:</strong> IPD owns provider-side mappings and qualification. Even `QUALIFIED` is evidence with `isinAuthority: NON_AUTHORITATIVE`, not an IRR identity replacement or automatic approval. `UNRESOLVED` and `AMBIGUOUS` remain non-matches.</p>
  </main>;
}
