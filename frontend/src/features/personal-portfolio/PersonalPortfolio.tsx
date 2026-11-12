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
 *
 * PRESENTATION
 *   This page renders through the same shared workspace layer as Broker Statement Import
 *   and Broker Holdings, so the three read as one application: identical page header,
 *   panels, summary figures, chips, notices, buttons and table treatment. The only
 *   page-specific styling is the editable holdings grid in `PersonalPortfolio.css`.
 *
 *   Nothing below changes what is transmitted, validated or persisted. The field values,
 *   the parse rules, the validation messages and the save/delete/reload semantics are
 *   exactly as they were; only their presentation changed.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createUserPortfolio,
  deleteUserPortfolio,
  fetchUserPortfolio,
  saveUserPortfolioHoldings,
  UserPortfolioApiError,
  type UserPortfolioHoldingInput,
  type ReadUnavailableDiagnosis,
  type UserPortfolioView,
} from '../../api/userPortfolios';
import { LoadingState, ErrorState } from '../../components/state/StateComponents';
import {
  BrokerButton,
  BrokerChip,
  BrokerNotice,
  BrokerPage,
  BrokerPageHeader,
  BrokerPanel,
  BrokerSummary,
  BrokerSummaryItem,
} from '../../components/broker/BrokerWorkspace';
import { formatInr, formatPct, shortDigest } from '../user-portfolios/UserPortfolioStates';
import './PersonalPortfolio.css';

const PERSONAL_PORTFOLIO_ID = 'DEFAULT_PORTFOLIO';
const PERSONAL_PORTFOLIO_NAME = 'My Portfolio';

interface EditableRow {
  readonly key: number;
  symbol: string;
  quantity: string;
  averageBuyPrice: string;
  currentPrice: string;
  active: boolean;
}

type Status =
  | { readonly kind: 'loading' }
  | { readonly kind: 'idle' }
  | { readonly kind: 'saving' }
  | { readonly kind: 'saved'; readonly savedAt: string }
  | { readonly kind: 'deleting' }
  | { readonly kind: 'conflict' }
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
    holdings.push({ symbol, quantity, averageBuyPrice, currentPrice, active: row.active });
  }
  if (holdings.length === 0) return { error: 'Add at least one holding — a portfolio needs one row.' };
  return { holdings };
}

/** The one row-level action, aligned in its own column so it reads as part of the row. */
function RowActions({ onRemove, disabled }: { readonly onRemove: () => void; readonly disabled: boolean }) {
  return (
    <BrokerButton variant="ghost" size="sm" aria-label="Remove row" onClick={onRemove} disabled={disabled}>
      Remove
    </BrokerButton>
  );
}

export function PersonalPortfolio() {
  const [view, setView] = useState<UserPortfolioView | null>(null);
  const [exists, setExists] = useState<boolean | null>(null); // null = not loaded yet
  const [rows, setRows] = useState<EditableRow[]>([blankRow()]);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  const load = useCallback(async () => {
    setStatus({ kind: 'loading' });
    try {
      const portfolio = await fetchUserPortfolio(PERSONAL_PORTFOLIO_ID);
      setView(portfolio);
      setExists(true);
      setRows(rowsFromView(portfolio));
      setStatus({ kind: 'idle' });
    } catch (error) {
      if (error instanceof UserPortfolioApiError && error.status === 404) {
        setView(null);
        setExists(false);
        setRows([blankRow()]);
        setStatus({ kind: 'idle' });
        return;
      }
      if (error instanceof UserPortfolioApiError && error.status === 503) {
        setView(null);
        setExists(null);
        const diagnosis = error.diagnosis;
        setStatus({
          kind: 'unavailable',
          diagnosis,
          message:
            diagnosis?.reason === 'binding-precondition-absent'
              ? 'The IRR server is not configured to read durable portfolios: the owner-binding precondition is absent.'
              : diagnosis?.reason === 'ipc-endpoint-not-configured'
                ? 'The IRR server has no IPD user-portfolio endpoint configured, so no portfolio can be read.'
                : diagnosis?.reason === 'ipc-endpoint-unreachable'
                  ? 'The IPD user-portfolio service is configured but did not answer. Start IPD and check its endpoint.'
                  : 'The local persistence service is not available.',
        });
        return;
      }
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'The portfolio could not be loaded.',
      });
    }
  }, []);

  useEffect(() => {
    void load();
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
    const parsedNow = parseRows(rows);
    if (parsedNow.error || !parsedNow.holdings) {
      setStatus({ kind: 'error', message: parsedNow.error ?? 'The rows are not valid.' });
      return;
    }
    const creating = !exists;
    setStatus({ kind: 'saving' });
    try {
      if (creating) {
        const created = await createUserPortfolio(
          { portfolioName: PERSONAL_PORTFOLIO_NAME, holdings: parsedNow.holdings },
        );
        setView(created);
        setExists(true);
        setRows(rowsFromView(created));
        setStatus({ kind: 'saved', savedAt: created.lastUpdated });
        return;
      }
      const expectedRevision = view?.revision ?? 0;
      const result = await saveUserPortfolioHoldings(
        PERSONAL_PORTFOLIO_ID,
        { holdings: parsedNow.holdings, expectedRevision, mode: 'REPLACE' },
      );
      setView(result.portfolio);
      setExists(true);
      setRows(rowsFromView(result.portfolio));
      setStatus({ kind: 'saved', savedAt: result.savedAt });
    } catch (error) {
      if (error instanceof UserPortfolioApiError && error.status === 409) {
        setStatus({ kind: 'conflict' });
        return;
      }
      if (error instanceof UserPortfolioApiError && error.status === 400) {
        const detail = error.serverDetail !== undefined ? ` ${error.serverDetail}` : '';
        setStatus({
          kind: 'error',
          message: creating
            ? `The portfolio was not created (HTTP 400).${detail} An existing portfolio with this identifier may already be present — a previously removed one is never reusable. Nothing was changed. Reload to see the current state before trying again.`
            : `Your changes were NOT saved (HTTP 400).${detail} The portfolio was not changed. Reload to see the current state, then re-apply your changes.`,
        });
        return;
      }
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'The save did not complete.',
      });
    }
  };

  const onDelete = async () => {
    if (!view) return;
    const confirmed = window.confirm(
      'Delete the local portfolio? The holdings will be removed and cannot be recovered.',
    );
    if (!confirmed) return;
    setStatus({ kind: 'deleting' });
    try {
      await deleteUserPortfolio(PERSONAL_PORTFOLIO_ID, view.revision);
      setView(null);
      setExists(false);
      setRows([blankRow()]);
      setStatus({ kind: 'idle' });
    } catch (error) {
      if (error instanceof UserPortfolioApiError && error.status === 409) {
        setStatus({ kind: 'conflict' });
        return;
      }
      if (error instanceof UserPortfolioApiError && error.status === 400) {
        const detail = error.serverDetail !== undefined ? ` ${error.serverDetail}` : '';
        setStatus({
          kind: 'error',
          message: `The portfolio was not deleted (HTTP 400).${detail} It was not changed. Reload to see the current state.`,
        });
        return;
      }
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'The delete did not complete.',
      });
    }
  };

  const saving = status.kind === 'saving' || status.kind === 'deleting';
  const fieldError = parsed.error;

  // The header is identical on every state of the page, so the Reload utility stays
  // reachable and the page never loses its identity while data is in flight.
  const header = (
    <BrokerPageHeader
      eyebrow="Manual records"
      title="Personal Portfolio"
      lede="Durable, local and single-user. Manual entries are your own records — not broker statements, and never resolved against the governed security master."
      meta={[
        <BrokerChip key="manual" label="MANUAL ENTRY" tone="informational" glyph="◇" />,
        <BrokerChip key="identity" label="IDENTITY UNRESOLVED" tone="neutral" glyph="◆" />,
        <BrokerButton key="reload" size="sm" data-testid="pp-reload" onClick={() => void load()} disabled={saving}>
          Reload
        </BrokerButton>,
      ]}
    />
  );

  if (status.kind === 'loading' && exists === null) {
    return (
      <BrokerPage>
        <section aria-label="Personal portfolio" data-testid="personal-portfolio">
          {header}
          <BrokerPanel title="Holdings" hint="Reading the durable portfolio from IPD.">
            <LoadingState />
          </BrokerPanel>
        </section>
      </BrokerPage>
    );
  }

  return (
    <BrokerPage>
      <section aria-label="Personal portfolio" data-testid="personal-portfolio">
        {header}

        {status.kind === 'unavailable' ? (
          <BrokerNotice tone="critical" alert title="Local persistence unavailable">
            <div data-testid="pp-unavailable">
              <p>{status.message}</p>
              {status.diagnosis && status.diagnosis.requiredSettings.length > 0 ? (
                <p data-testid="pp-required-settings">
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
              <p className="bw-muted">
                Your saved portfolio has not been changed or deleted. This is a configuration state,
                not an empty portfolio.
              </p>
            </div>
          </BrokerNotice>
        ) : null}

        {status.kind === 'conflict' ? (
          <BrokerNotice tone="critical" alert title="Portfolio changed elsewhere">
            <div data-testid="pp-conflict">
              <p>Your edits were NOT saved. Reload to fetch the current portfolio, then re-apply your changes.</p>
              <div className="bw-actions">
                <BrokerButton size="sm" onClick={() => void load()}>Reload</BrokerButton>
              </div>
            </div>
          </BrokerNotice>
        ) : null}

        {status.kind === 'error' ? <ErrorState message={status.message} /> : null}

        {status.kind === 'saved' ? (
          <p role="status" data-testid="pp-saved" className="pp-saved">
            Saved at {new Date(status.savedAt).toLocaleString()} — revision {view?.revision}.
          </p>
        ) : null}

        {exists !== null ? (
          <>
            <BrokerPanel
              eyebrow="Editor"
              title="Holdings"
              hint="Every row is one holding you entered yourself. Quantity, average buy price and current price are your own figures — nothing here is validated against a broker statement or a market feed."
              aside={<BrokerChip label={`${rows.length} ${rows.length === 1 ? 'ROW' : 'ROWS'}`} tone="neutral" glyph="#" />}
              tight
            >
              <div className="bw-table-wrap">
                <table className="bw-table pp-table">
                  <caption>
                    Holdings — symbol, quantity, average buy price, current price, active state and row actions
                  </caption>
                  <colgroup>
                    <col className="pp-col-symbol" />
                    <col className="pp-col-quantity" />
                    <col className="pp-col-average" />
                    <col className="pp-col-current" />
                    <col className="pp-col-active" />
                    <col className="pp-col-actions" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">Symbol</th>
                      <th scope="col" className="bw-num">Quantity</th>
                      <th scope="col" className="bw-num">Average buy price</th>
                      <th scope="col" className="bw-num">Current price</th>
                      <th scope="col" className="pp-cell-active">Active</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key} data-pp-row>
                        <td data-label="Symbol">
                          <input
                            className="bw-control pp-input pp-input--symbol"
                            aria-label="Symbol"
                            value={row.symbol}
                            placeholder="RELIANCE"
                            disabled={saving}
                            onChange={(e) => updateRow(row.key, { symbol: e.target.value })}
                          />
                        </td>
                        <td data-label="Quantity">
                          <input
                            className="bw-control pp-input bw-num"
                            aria-label="Quantity"
                            inputMode="decimal"
                            value={row.quantity}
                            disabled={saving}
                            onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                          />
                        </td>
                        <td data-label="Average buy price">
                          <input
                            className="bw-control pp-input bw-num"
                            aria-label="Average buy price"
                            inputMode="decimal"
                            value={row.averageBuyPrice}
                            disabled={saving}
                            onChange={(e) => updateRow(row.key, { averageBuyPrice: e.target.value })}
                          />
                        </td>
                        <td data-label="Current price">
                          <input
                            className="bw-control pp-input bw-num"
                            aria-label="Current price"
                            inputMode="decimal"
                            value={row.currentPrice}
                            disabled={saving}
                            onChange={(e) => updateRow(row.key, { currentPrice: e.target.value })}
                          />
                        </td>
                        <td data-label="Active" className="pp-cell-active">
                          <input
                            className="pp-check"
                            aria-label="Active"
                            type="checkbox"
                            checked={row.active}
                            disabled={saving}
                            onChange={(e) => updateRow(row.key, { active: e.target.checked })}
                          />
                        </td>
                        <td data-label="Actions" className="pp-cell-actions">
                          <RowActions onRemove={() => removeRow(row.key)} disabled={rows.length <= 1 || saving} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/*
                * Client-side validation. Deliberately not a live region: it is derived from the
                * rows on every keystroke, so announcing it would interrupt the owner on each
                * character. It sits directly above the action it blocks, and the blocked control
                * carries the same state through `disabled`.
                */}
              {fieldError !== undefined ? (
                <BrokerNotice tone="warning" title="This portfolio cannot be saved yet">
                  <p data-testid="pp-validation">{fieldError}</p>
                </BrokerNotice>
              ) : null}

              <div className="bw-actions pp-actions">
                <BrokerButton onClick={addRow} disabled={saving}>Add row</BrokerButton>
                <BrokerButton
                  variant="primary"
                  onClick={() => void onSave()}
                  disabled={saving || fieldError !== undefined}
                  data-testid="pp-save"
                >
                  {status.kind === 'saving' ? 'Saving…' : exists ? 'Save changes' : 'Create portfolio'}
                </BrokerButton>
                {exists ? (
                  <BrokerButton onClick={() => void onDelete()} disabled={saving} data-testid="pp-delete">
                    Delete portfolio…
                  </BrokerButton>
                ) : null}
                {fieldError !== undefined ? (
                  <p className="pp-actions__feedback">
                    Saving is disabled until the rows above are valid.
                  </p>
                ) : null}
              </div>
            </BrokerPanel>

            {view !== null ? (
              <BrokerPanel eyebrow="Portfolio" title="Summary" hint="Read back from IPD after the last save." secondary tight>
                {/* The testid the summary strip has always carried, kept on a wrapper so the
                    shared summary component stays generic. */}
                <div data-testid="pp-summary">
                  <BrokerSummary>
                    <BrokerSummaryItem label="Total value" value={formatInr(view.totalMarketValue)} sub="as computed by IPD" />
                    <BrokerSummaryItem label="Holdings" value={view.totalHoldingsCount} sub="stored rows" />
                    <BrokerSummaryItem label="Weights" value={formatPct(view.weightSumPercentage)} sub="of total value" />
                    <BrokerSummaryItem label="Revision" value={<span data-testid="pp-revision">{view.revision}</span>} sub="optimistic-concurrency guard" />
                    <BrokerSummaryItem label="Provenance" value={shortDigest(view.provenanceDigest)} sub="content digest" />
                  </BrokerSummary>
                </div>
              </BrokerPanel>
            ) : null}
          </>
        ) : null}
      </section>
    </BrokerPage>
  );
}
