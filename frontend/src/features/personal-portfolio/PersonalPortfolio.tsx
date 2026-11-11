/**
 * Personal Portfolio — the owner's local, durable, single-user portfolio editor.
 *
 * Separate from the certified, read-only `/user-portfolios` surfaces by design.
 * This page is authorized only for this local single-user, non-production
 * application (Program Authority, 2026-11-08) and talks only to the same-origin
 * IRR server, which composes the same-host IPC boundary to IPD. The server and
 * IPD decide everything authoritative: identity, arithmetic, weights, revisions,
 * duplicate detection and digests. This client holds no authoritative state and
 * persists nothing itself.
 *
 * Behavior:
 *   - On open, it reads the durable portfolio back from IPD. Nothing is served
 *     from a browser cache; "Reload" discards local edits and re-reads.
 *   - Save is one optimistic-concurrency transaction (required expectedRevision).
 *     The personal application always sends the complete holdings set as REPLACE.
 *   - On 409 the page stops and asks the owner to Reload — it never merges
 *     silently.
 *   - If the server or IPD is unavailable the page says so; it never renders a
 *     fabricated portfolio.
 *   - Delete is deliberate: a confirm prompt tombstones the portfolio on IPD.
 *   - Manual entries are personal bookkeeping, not broker observations; identity
 *     is unresolved by construction and is never asserted here.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteUserPortfolio,
  fetchUserPortfolioRead,
  inspectUserPortfolioView,
  saveUserPortfolioHoldings,
  UserPortfolioApiError,
  type UserPortfolioHoldingInput,
  type ReadUnavailableDiagnosis,
  type UserPortfolioView,
} from '../../api/userPortfolios';
import { LoadingState, ErrorState } from '../../components/state/StateComponents';
import { formatInr, formatPct, shortDigest } from '../user-portfolios/UserPortfolioStates';

const PERSONAL_PORTFOLIO_ID = 'DEFAULT_PORTFOLIO';

interface EditableRow {
  readonly key: number;
  symbol: string;
  quantity: string;
  averageBuyPrice: string;
  currentPrice: string;
  active: boolean;
  originalSymbol?: string;
  isin?: string;
  exchange?: 'NSE' | 'BSE';
}

type Status =
  | { readonly kind: 'loading' }
  | { readonly kind: 'idle' }
  | { readonly kind: 'saving' }
  | { readonly kind: 'saved'; readonly savedAt: string }
  | { readonly kind: 'deleting' }
  | { readonly kind: 'conflict' }
  | { readonly kind: 'read-error'; readonly message: string }
  | { readonly kind: 'not-found'; readonly message: string }
  | { readonly kind: 'mutation-unknown'; readonly message: string }
  | {
      readonly kind: 'unavailable';
      readonly message: string;
      /** IRR-owned diagnosis of which server precondition is absent, when published. */
      readonly diagnosis?: ReadUnavailableDiagnosis;
    }
  | { readonly kind: 'error'; readonly message: string };

let nextRowKey = 1;
const blankRow = (): EditableRow => ({
  key: nextRowKey++,
  symbol: '',
  quantity: '',
  averageBuyPrice: '',
  currentPrice: '',
  active: true,
});

function rowsFromView(view: UserPortfolioView): EditableRow[] {
  return view.holdings.map((holding) => ({
    key: nextRowKey++,
    symbol: holding.symbol,
    quantity: String(holding.quantity),
    averageBuyPrice: String(holding.averageBuyPrice),
    currentPrice: String(holding.currentPrice),
    active: holding.active,
    originalSymbol: holding.symbol.trim().toUpperCase(),
    isin: holding.isin,
    exchange: holding.exchange,
  }));
}

function parseRows(rows: readonly EditableRow[]): { holdings?: UserPortfolioHoldingInput[]; error?: string } {
  const holdings: UserPortfolioHoldingInput[] = [];
  const seen = new Set<string>();
  for (const [index, row] of rows.entries()) {
    const symbol = row.symbol.trim().toUpperCase();
    if (symbol.length === 0) {
      if (rows.length === 1) return { error: 'Add at least one holding — a portfolio needs one row.' };
      continue; // a fully blank extra row is simply dropped, never silently saved
    }
    if (seen.has(symbol)) return { error: `Duplicate symbol “${symbol}” — each holding appears once.` };
    seen.add(symbol);
    const quantity = Number(row.quantity);
    const averageBuyPrice = Number(row.averageBuyPrice);
    const currentPrice = Number(row.currentPrice);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: `Row ${index + 1} (${symbol}): quantity must be a number greater than zero.` };
    }
    if (!Number.isFinite(averageBuyPrice) || averageBuyPrice < 0) {
      return { error: `Row ${index + 1} (${symbol}): average buy price must be zero or more.` };
    }
    if (!Number.isFinite(currentPrice) || currentPrice < 0) {
      return { error: `Row ${index + 1} (${symbol}): current price must be zero or more.` };
    }
    // Optional observed identifiers belong to the original symbol, not a replacement.
    const sameHolding = symbol === row.originalSymbol;
    holdings.push({ symbol, quantity, averageBuyPrice, currentPrice, active: row.active,
      ...(sameHolding && row.isin !== undefined ? { isin: row.isin } : {}),
      ...(sameHolding && row.exchange !== undefined ? { exchange: row.exchange } : {}),
    });
  }
  if (holdings.length === 0) return { error: 'Add at least one holding — a portfolio needs one row.' };
  return { holdings };
}

/** A REPLACE editor must never operate on a filtered or unverified snapshot. */
function requireCompletePersonalView(read: ReturnType<typeof inspectUserPortfolioView>): UserPortfolioView {
  const portfolio = read.portfolio;
  if (read.rejectedHoldings !== 0 || read.rejectedContributions !== 0 ||
      portfolio.portfolioId !== PERSONAL_PORTFOLIO_ID ||
      !Number.isInteger(portfolio.revision) || portfolio.revision < 0 ||
      typeof portfolio.portfolioName !== 'string' || typeof portfolio.isSaved !== 'boolean' ||
      typeof portfolio.lastUpdated !== 'string' || typeof portfolio.provenanceDigest !== 'string' ||
      !Number.isFinite(portfolio.totalMarketValue) || !Number.isFinite(portfolio.totalHoldingsCount) ||
      !Number.isFinite(portfolio.weightSumPercentage)) {
    throw new UserPortfolioApiError(500, 'The portfolio read is incomplete or invalid. Reload before editing; no changes were sent.');
  }
  return portfolio;
}

export function PersonalPortfolio() {
  const [view, setView] = useState<UserPortfolioView | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([blankRow()]);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const generation = useRef(0);
  const mounted = useRef(false);
  const mutationInFlight = useRef(false);
  const readPending = useRef(false);

  const load = useCallback(async () => {
    if (mutationInFlight.current) return;
    const current = ++generation.current;
    readPending.current = true;
    const isCurrent = () => mounted.current && generation.current === current;
    setStatus({ kind: 'loading' });
    try {
      const read = await fetchUserPortfolioRead(PERSONAL_PORTFOLIO_ID);
      if (!isCurrent()) return;
      const portfolio = requireCompletePersonalView(read);
      setView(portfolio);
      setRows(rowsFromView(portfolio));
      setStatus({ kind: 'idle' });
    } catch (error) {
      if (!isCurrent()) return;
      setView(null);
      if (error instanceof UserPortfolioApiError && error.status === 404) {
        setStatus({ kind: 'not-found', message: 'The portfolio could not be found. This response does not distinguish an absent, inaccessible, or deleted portfolio. Creation is unavailable until the provider can establish that this identifier may be created.' });
        return;
      }
      if (error instanceof UserPortfolioApiError && error.status === 503) {
        const diagnosis = error.diagnosis;
        setStatus({
          kind: 'unavailable', diagnosis,
          message: diagnosis?.reason === 'binding-precondition-absent'
            ? 'The IRR server is not configured to read durable portfolios: the owner-binding precondition is absent.'
            : diagnosis?.reason === 'ipc-endpoint-not-configured'
              ? 'The IRR server has no IPD user-portfolio endpoint configured, so no portfolio can be read.'
              : diagnosis?.reason === 'ipc-endpoint-unreachable'
                ? 'The IPD user-portfolio service is configured but did not answer. Start IPD and check its endpoint.'
                : 'The local persistence service is not available.',
        });
        return;
      }
      setStatus({ kind: 'read-error', message: error instanceof Error ? error.message : 'The portfolio could not be loaded.' });
    } finally {
      if (isCurrent()) readPending.current = false;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => { mounted.current = false; generation.current += 1; };
  }, [load]);

  const parsed = useMemo(() => parseRows(rows), [rows]);

  const updateRow = (key: number, patch: Partial<EditableRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    if (status.kind === 'saved' || status.kind === 'error') setStatus({ kind: 'idle' });
  };

  const addRow = () => setRows((current) => [...current, blankRow()]);

  const removeRow = (key: number) =>
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.key !== key)));

  const onSave = async () => {
    if (mutationInFlight.current || readPending.current || !view || !['idle', 'saved', 'error'].includes(status.kind)) return;
    const parsedNow = parseRows(rows);
    if (parsedNow.error || !parsedNow.holdings) {
      setStatus({ kind: 'error', message: parsedNow.error ?? 'The rows are not valid.' });
      return;
    }
    mutationInFlight.current = true;
    const current = ++generation.current;
    setStatus({ kind: 'saving' });
    try {
      const result = await saveUserPortfolioHoldings(
        PERSONAL_PORTFOLIO_ID,
        { holdings: parsedNow.holdings, expectedRevision: view.revision, mode: 'REPLACE' },
      );
      if (!mounted.current || generation.current !== current) return;
      const saved = requireCompletePersonalView(inspectUserPortfolioView(result.portfolio));
      if (saved.revision !== result.revision || typeof result.savedAt !== 'string' || Number.isNaN(Date.parse(result.savedAt))) {
        throw new UserPortfolioApiError(500, 'Invalid save receipt');
      }
      setView(saved);
      setRows(rowsFromView(saved));
      setStatus({ kind: 'saved', savedAt: result.savedAt });
    } catch (error) {
      if (!mounted.current || generation.current !== current) return;
      if (error instanceof UserPortfolioApiError && error.status === 409) {
        setStatus({ kind: 'conflict' });
      } else if (error instanceof UserPortfolioApiError && error.status === 400) {
        const detail = error.serverDetail !== undefined ? ` ${error.serverDetail}` : '';
        setStatus({ kind: 'error', message: `Your changes were NOT saved (HTTP 400).${detail} The portfolio was not changed. Reload to see the current state, then re-apply your changes.` });
      } else {
        setStatus({ kind: 'mutation-unknown', message: 'The save outcome could not be verified. Reload before making further changes; do not retry automatically.' });
      }
    } finally { mutationInFlight.current = false; }
  };

  const onDelete = async () => {
    if (mutationInFlight.current || readPending.current || !view || !['idle', 'saved', 'error'].includes(status.kind)) return;
    mutationInFlight.current = true;
    const confirmed = window.confirm('Delete the local portfolio? The holdings will be removed and cannot be recovered.');
    if (!confirmed) { mutationInFlight.current = false; return; }
    const current = ++generation.current;
    setStatus({ kind: 'deleting' });
    try {
      await deleteUserPortfolio(PERSONAL_PORTFOLIO_ID, view.revision);
      if (!mounted.current || generation.current !== current) return;
      setView(null);
      setStatus({ kind: 'not-found', message: 'The portfolio was deleted. This identifier must not be silently recreated.' });
    } catch (error) {
      if (!mounted.current || generation.current !== current) return;
      if (error instanceof UserPortfolioApiError && error.status === 409) {
        setStatus({ kind: 'conflict' });
      } else if (error instanceof UserPortfolioApiError && error.status === 400) {
        const detail = error.serverDetail !== undefined ? ` ${error.serverDetail}` : '';
        setStatus({ kind: 'error', message: `The portfolio was not deleted (HTTP 400).${detail} It was not changed. Reload to see the current state.` });
      } else {
        setStatus({ kind: 'mutation-unknown', message: 'The delete outcome could not be verified. Reload before making further changes; do not retry automatically.' });
      }
    } finally { mutationInFlight.current = false; }
  };

  if (status.kind === 'loading' && view === null) {
    return (
      <section aria-label="Personal portfolio">
        <h2>Personal Portfolio</h2>
        <LoadingState />
      </section>
    );
  }

  const saving = status.kind === 'saving' || status.kind === 'deleting';
  const fieldError = parsed.error;
  const editable = view !== null && ['idle', 'saved', 'error', 'saving', 'deleting'].includes(status.kind);

  return (
    <section aria-label="Personal portfolio" data-testid="personal-portfolio">
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <h2 style={{ marginBottom: 4 }}>Personal Portfolio</h2>
        <span style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          Durable, local, single-user. Manual entries are your own records — not broker statements.
        </span>
        <button type="button" onClick={() => void load()} disabled={saving} data-testid="pp-reload">
          Reload
        </button>
      </header>

      {status.kind === 'unavailable' ? (
        <div role="alert" data-testid="pp-unavailable" style={{ margin: '12px 0', padding: 12, border: '1px solid var(--color-border, #ccc)', borderRadius: 6 }}>
          <strong>Local persistence unavailable.</strong>
          <p style={{ margin: '6px 0 0' }}>{status.message}</p>
          {status.diagnosis && status.diagnosis.requiredSettings.length > 0 ? (
            <p style={{ margin: '6px 0 0' }} data-testid="pp-required-settings">
              Required server settings:{' '}
              {status.diagnosis.requiredSettings.map((setting, index) => (
                <span key={setting}>
                  {index > 0 ? ', ' : ''}
                  <code>{setting}</code>
                </span>
              ))}
              . Start the IPD user-portfolio service and this server with them set (see
              docs/LOCAL-PERSONAL-USE-PERSISTENCE.md), then Reload.
            </p>
          ) : null}
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-ink-secondary)' }}>
            Your saved portfolio has not been changed or deleted. This is a configuration state,
            not an empty portfolio.
          </p>
        </div>
      ) : null}

      {status.kind === 'conflict' ? (
        <div role="alert" data-testid="pp-conflict" style={{ margin: '12px 0', padding: 12, border: '1px solid #b3261e', borderRadius: 6 }}>
          <strong>Portfolio changed elsewhere.</strong>
          <p style={{ margin: '6px 0' }}>Your edits were NOT saved. Reload to fetch the current portfolio, then re-apply your changes.</p>
          <button type="button" onClick={() => void load()}>Reload</button>
        </div>
      ) : null}

      {status.kind === 'loading' ? <LoadingState /> : null}
      {status.kind === 'not-found' ? <div role="alert" data-testid="pp-not-found">{status.message}</div> : null}
      {status.kind === 'error' || status.kind === 'read-error' || status.kind === 'mutation-unknown' ? <ErrorState message={status.message} /> : null}
      {status.kind === 'saved' ? (
        <p role="status" data-testid="pp-saved" style={{ margin: '8px 0', color: 'var(--color-ink-secondary)' }}>
          Saved at {new Date(status.savedAt).toLocaleString()} — revision {view?.revision}.
        </p>
      ) : null}

      {editable ? (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                <th align="left">Symbol</th>
                <th align="right">Quantity</th>
                <th align="right">Avg. buy (₹)</th>
                <th align="right">Current (₹)</th>
                <th align="center">Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td><input aria-label="Symbol" disabled={saving} style={{ width: 120 }} value={row.symbol} onChange={(e) => updateRow(row.key, { symbol: e.target.value })} placeholder="RELIANCE" /></td>
                  <td><input aria-label="Quantity" disabled={saving} style={{ width: 90, textAlign: 'right' }} inputMode="decimal" value={row.quantity} onChange={(e) => updateRow(row.key, { quantity: e.target.value })} /></td>
                  <td><input aria-label="Average buy price" disabled={saving} style={{ width: 110, textAlign: 'right' }} inputMode="decimal" value={row.averageBuyPrice} onChange={(e) => updateRow(row.key, { averageBuyPrice: e.target.value })} /></td>
                  <td><input aria-label="Current price" disabled={saving} style={{ width: 110, textAlign: 'right' }} inputMode="decimal" value={row.currentPrice} onChange={(e) => updateRow(row.key, { currentPrice: e.target.value })} /></td>
                  <td align="center"><input aria-label="Active" disabled={saving} type="checkbox" checked={row.active} onChange={(e) => updateRow(row.key, { active: e.target.checked })} /></td>
                  <td><button type="button" aria-label="Remove row" onClick={() => removeRow(row.key)} disabled={rows.length <= 1 || saving}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={addRow} disabled={saving}>Add row</button>
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={saving || fieldError !== undefined}
              data-testid="pp-save"
            >
              {status.kind === 'saving' ? 'Saving…' : 'Save changes'}
            </button>
            {view !== null ? (
              <button type="button" onClick={() => void onDelete()} disabled={saving} data-testid="pp-delete">Delete portfolio…</button>
            ) : null}
            {fieldError !== undefined ? (
              <span role="note" style={{ fontSize: 13, color: '#b3261e' }}>{fieldError}</span>
            ) : null}
          </div>

          {view !== null ? (
            <dl data-testid="pp-summary" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 16 }}>
              <div><dt style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>Total value</dt><dd style={{ margin: 0 }}>{formatInr(view.totalMarketValue)}</dd></div>
              <div><dt style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>Holdings</dt><dd style={{ margin: 0 }}>{view.totalHoldingsCount}</dd></div>
              <div><dt style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>Weights</dt><dd style={{ margin: 0 }}>{formatPct(view.weightSumPercentage)}</dd></div>
              <div><dt style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>Revision</dt><dd style={{ margin: 0 }} data-testid="pp-revision">{view.revision}</dd></div>
              <div><dt style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>Provenance</dt><dd style={{ margin: 0 }}>{shortDigest(view.provenanceDigest)}</dd></div>
            </dl>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
