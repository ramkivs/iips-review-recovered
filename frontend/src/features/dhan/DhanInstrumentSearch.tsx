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
import './DhanInstrumentSearch.css';

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

/** A busy indicator that never becomes part of the control's accessible name. */
function Spinner() {
  return <span className="dhanid-spinner" aria-hidden="true" />;
}

/**
 * One IPD identity outcome.
 *
 * The status word, the reason code and the authority value are each rendered as the
 * DIRECT TEXT of their own element so a screen reader and a test both read them the
 * same way, and so no wrapper can swallow them.
 */
function Outcome({ outcome, label }: { outcome: IdentityOutcome; label?: string }) {
  return <div className="dhanid-outcome" aria-label={label ?? `${outcome.status} identity outcome`} data-identity-status={outcome.status}>
    <h4 className="dhanid-outcome__status">{outcome.status}</h4>
    {outcome.status === 'QUALIFIED' ? <dl className="dhanid-outcome__facts">
      <dt>Canonical identity</dt>
      <dd>{outcome.securityIdentity.securityId}</dd>
      <dt>Company</dt>
      <dd>{outcome.companyId}</dd>
      <dt>Exchange</dt>
      <dd>{outcome.exchange}</dd>
      <dt>ISIN authority</dt>
      <dd>{outcome.isinAuthority}</dd>
    </dl> : <dl className="dhanid-outcome__facts">
      <dt>Reason</dt>
      <dd><code>{outcome.reason}</code></dd>
      <dt>Details</dt>
      <dd>{outcome.details}</dd>
    </dl>}
    <details className="dhanid-outcome__details">
      <summary className="dhanid-outcome__summary">Full IPD identity evidence</summary>
      <pre className="dhanid-outcome__json">{JSON.stringify(outcome, null, 2)}</pre>
    </details>
  </div>;
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
  return <article className="dhanid-result" aria-label={`${row.symbol} ${row.exchange} search result`}>
    <div className="dhanid-result__head">
      <h3 className="dhanid-result__symbol">{row.symbol}</h3>
      <span className="dhanid-result__exchange">{row.exchange}</span>
    </div>
    <Outcome outcome={row.result} label={`${row.symbol} ${row.exchange} provider qualification`} />
    {row.result.status === 'QUALIFIED' && <div className="dhanid-result__action">
      <button className="dhanid-btn dhanid-btn--compact" type="button" disabled={busy} onClick={() => void resolveExact()}>
        {busy ? <><Spinner /> Resolving exact identity…</> : 'Resolve exact identity'}
      </button>
    </div>}
    {error && <p className="dhanid-message dhanid-message--error" role="alert">{error}</p>}
  </article>;
}

/** A field whose label and its required/optional qualifier never merge into one string. */
function Field({ id, label, qualifier, note, children }: {
  id: string;
  label: string;
  qualifier?: 'Required' | 'Optional';
  note?: string;
  children: React.ReactNode;
}) {
  return <div className="dhanid-field">
    <div className="dhanid-field__label-row">
      <label className="dhanid-field__label" htmlFor={id}>{label}</label>
      {qualifier !== undefined && <span className={qualifier === 'Required'
        ? 'dhanid-field__qualifier dhanid-field__qualifier--required'
        : 'dhanid-field__qualifier'}>{qualifier}</span>}
    </div>
    {children}
    {note !== undefined && <p className="dhanid-field__note">{note}</p>}
  </div>;
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

  return <main className="dhanid" aria-label="DHAN instrument search and identity qualification">
    <header className="dhanid__header">
      <div className="dhanid__title-row">
        <h1 className="dhanid__title">DHAN Instrument Search</h1>
        <span className="dhanid__snapshot-flag" data-testid="dhan-offline-snapshot-flag">
          <span className="dhanid__snapshot-flag-glyph" aria-hidden="true">□</span>
          Offline snapshot
        </span>
      </div>
      <p className="dhanid__lede">This screen uses IPD's offline registry snapshot; it does not contact Dhan or perform live-provider qualification. Search candidates are evidence only, not approvals, and nothing here modifies IRR's governed security master or identity roster.</p>
    </header>

    <section className="dhanid-card" aria-label="Instrument search">
      <div className="dhanid-card__head">
        <p className="dhanid-card__eyebrow">Step 1</p>
        <h2 className="dhanid-card__title">Instrument Search</h2>
        <p className="dhanid-card__hint">Search the offline IPD registry by trading symbol or ISIN. Every candidate is returned exactly as IPD supplied it, including duplicate rows.</p>
      </div>
      <form onSubmit={(event) => void submitSearch(event)}>
        <div className="dhanid-searchbar">
          <div className="dhanid-searchbar__field">
            <Field id="dhan-instrument-query" label="Symbol or ISIN" qualifier="Required">
              <input
                className="dhanid-field__control"
                id="dhan-instrument-query"
                value={query}
                maxLength={100}
                placeholder="e.g. RELIANCE or INE002A01018"
                onChange={(event) => setQuery(event.target.value)}
                required
              />
            </Field>
          </div>
          <div className="dhanid-searchbar__action">
            <button className="dhanid-btn" type="submit" disabled={searchBusy || !query.trim()}>
              {searchBusy ? <><Spinner /> Searching…</> : 'Search instruments'}
            </button>
          </div>
        </div>
      </form>
      {searchBusy && <p className="dhanid-message dhanid-message--loading" role="status"><span className="dhanid-message__glyph" aria-hidden="true"><Spinner /></span>Searching IPD instrument evidence…</p>}
      {searchError && <p className="dhanid-message dhanid-message--error" role="alert"><span className="dhanid-message__glyph" aria-hidden="true">✕</span>{searchError}</p>}
      {results && results.length === 0 && <p className="dhanid-message dhanid-message--empty" role="status"><span className="dhanid-message__glyph" aria-hidden="true">·</span>No instrument candidates were returned by IPD.</p>}
      {results && results.length > 0 && <section aria-label="Instrument search results">
        <p className="dhanid-count">{results.length} candidate{results.length === 1 ? '' : 's'} returned. Duplicate rows are retained as received.</p>
        <div className="dhanid-results">
          {results.map((row, index) => <SearchRow key={`${row.symbol}-${row.exchange}-${index}`} row={row} onResolve={setResolved} />)}
        </div>
      </section>}
    </section>

    <div className="dhanid-columns">
      <section className="dhanid-card" aria-label="Resolve exact identity">
        <div className="dhanid-card__head">
          <p className="dhanid-card__eyebrow">Step 2</p>
          <h2 className="dhanid-card__title">Resolve Exact Identity</h2>
          <p className="dhanid-card__hint">Enter the complete company ID, exchange, and canonical security identity. IPD requires an exact company + listing + ISIN + series match; it will not fall back to partial identity.</p>
        </div>
        <form className="dhanid-form" onSubmit={(event) => void submitExactResolution(event)}>
          <div className="dhanid-field-grid">
            <Field id="dhan-resolve-company" label="Company ID" qualifier="Required">
              <input
                className="dhanid-field__control"
                id="dhan-resolve-company"
                value={companyId}
                maxLength={100}
                placeholder="e.g. COMP-RELIANCE"
                onChange={(event) => setCompanyId(event.target.value)}
                required
              />
            </Field>
            <Field id="dhan-resolve-exchange" label="Exchange" qualifier="Required">
              <select
                className="dhanid-field__control"
                id="dhan-resolve-exchange"
                value={resolveExchange}
                onChange={(event) => setResolveExchange(event.target.value as 'NSE' | 'BSE')}
              >
                <option value="NSE">NSE</option><option value="BSE">BSE</option>
              </select>
            </Field>
          </div>
          <Field id="dhan-resolve-security-id" label="Canonical security identity" qualifier="Required" note="Exact company + listing + ISIN + series. No partial fallback is applied.">
            <input
              className="dhanid-field__control"
              id="dhan-resolve-security-id"
              value={securityId}
              maxLength={100}
              onChange={(event) => setSecurityId(event.target.value)}
              required
              placeholder="ISIN:<isin>:<series>"
            />
          </Field>
          <div className="dhanid-actions">
            <button className="dhanid-btn dhanid-btn--block" type="submit" disabled={manualResolveBusy || !companyId.trim() || !securityId.trim()}>
              {manualResolveBusy ? <><Spinner /> Resolving…</> : 'Resolve exact identity'}
            </button>
          </div>
        </form>
        {manualResolveBusy && <p className="dhanid-message dhanid-message--loading" role="status"><span className="dhanid-message__glyph" aria-hidden="true"><Spinner /></span>Requesting exact IPD identity resolution…</p>}
        {manualResolveError && <p className="dhanid-message dhanid-message--error" role="alert"><span className="dhanid-message__glyph" aria-hidden="true">✕</span>{manualResolveError}</p>}
        {resolved && <Outcome outcome={resolved} label="Exact identity resolution result" />}
      </section>

      <section className="dhanid-card" aria-label="Qualify identity from supplied evidence">
        <div className="dhanid-card__head">
          <p className="dhanid-card__eyebrow">Step 3</p>
          <h2 className="dhanid-card__title">Qualify an Identity</h2>
          <p className="dhanid-card__hint">Enter the observed ISIN and listing exchange. Omitting ISIN requests IPD's typed missing-ISIN outcome. Symbol is context only; IPD does not use it as matching evidence.</p>
        </div>
        <form className="dhanid-form" onSubmit={(event) => void submitQualification(event)}>
          <div className="dhanid-field-grid">
            <Field id="dhan-identity-isin" label="ISIN" qualifier="Optional" note="Leave blank to request IPD's typed missing-ISIN outcome.">
              <input
                className="dhanid-field__control"
                id="dhan-identity-isin"
                value={isin}
                maxLength={100}
                placeholder="e.g. INE002A01018"
                onChange={(event) => setIsin(event.target.value)}
              />
            </Field>
            <Field id="dhan-identity-exchange" label="Exchange" qualifier="Required">
              <select
                className="dhanid-field__control"
                id="dhan-identity-exchange"
                value={exchange}
                onChange={(event) => setExchange(event.target.value as 'NSE' | 'BSE')}
              >
                <option value="NSE">NSE</option><option value="BSE">BSE</option>
              </select>
            </Field>
          </div>
          <Field id="dhan-identity-symbol" label="Symbol (context only)" qualifier="Optional" note="Contextual information only — IPD does not treat the symbol as matching evidence.">
            <input
              className="dhanid-field__control"
              id="dhan-identity-symbol"
              value={symbol}
              maxLength={100}
              placeholder="e.g. RELIANCE"
              onChange={(event) => setSymbol(event.target.value)}
            />
          </Field>
          <div className="dhanid-actions">
            <button className="dhanid-btn dhanid-btn--block" type="submit" disabled={qualifyBusy}>
              {qualifyBusy ? <><Spinner /> Qualifying…</> : 'Request qualification'}
            </button>
          </div>
        </form>
        {qualifyBusy && <p className="dhanid-message dhanid-message--loading" role="status"><span className="dhanid-message__glyph" aria-hidden="true"><Spinner /></span>Requesting provider-side identity qualification…</p>}
        {qualifyError && <p className="dhanid-message dhanid-message--error" role="alert"><span className="dhanid-message__glyph" aria-hidden="true">✕</span>{qualifyError}</p>}
        {qualified && <Outcome outcome={qualified} label="Identity qualification result" />}
      </section>
    </div>

    <aside className="dhanid-governance" aria-label="Authority and governance">
      <span className="dhanid-governance__glyph" aria-hidden="true">i</span>
      <div className="dhanid-governance__body">
        <h2 className="dhanid-governance__title">Authority and governance</h2>
        <p className="dhanid-governance__text"><strong>Authority:</strong> IPD owns provider-side mappings and qualification. Even QUALIFIED is evidence with isinAuthority: NON_AUTHORITATIVE, not an IRR identity replacement or automatic approval. UNRESOLVED and AMBIGUOUS remain non-matches.</p>
        <ul className="dhanid-governance__list">
          <li>IPD owns provider-side instrument mappings and identity qualification; IRR does not create, infer or override them.</li>
          <li>A QUALIFIED result remains evidence carrying isinAuthority: NON_AUTHORITATIVE — it is not an authoritative identity assertion.</li>
          <li>Qualification does not replace IRR's governed identity; the governed security master and identity roster are unchanged by anything on this screen.</li>
          <li>Qualification does not constitute automatic approval of a holding, a portfolio write, or a downstream decision.</li>
          <li>UNRESOLVED and AMBIGUOUS outcomes remain non-matches and are never offered as resolvable identities.</li>
        </ul>
      </div>
    </aside>
  </main>;
}
