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
 *   - On open, it reads the durable portfolio back through the read envelope, which
 *     reports rejected-record counts instead of discarding them. A filtered or
 *     unverified snapshot is never used as a REPLACE baseline: the read is refused
 *     and the editor is not offered.
 *   - A 404 never asserts absence: it does not distinguish an absent, inaccessible or
 *     deleted portfolio, so the page reports it as unresolved rather than as proof that
 *     the identifier is unused, and it offers an explicit, owner-initiated
 *     "Create portfolio" action. Creation is never automatic and never a guess — it is
 *     arbitrated by the provider. The page re-reads immediately before creating and
 *     adopts any portfolio that answers instead of issuing the create, and the server
 *     independently refuses a duplicate or tombstoned identifier (HTTP 400). A refusal
 *     is obeyed and stops the offer, so a deleted identifier is never silently recreated
 *     and an existing portfolio is never overwritten. After a delete performed by this
 *     page the identifier is known-tombstoned, and no creation is offered at all.
 *   - Save is one optimistic-concurrency transaction (required expectedRevision), sent
 *     as a complete REPLACE. The revision sent is the one this page last read, and the
 *     receipt is verified before it is adopted as the next baseline.
 *   - On 409 the page stops and asks the owner to Reload — it never merges silently.
 *     An outcome that cannot be verified locks editing until a fresh read succeeds.
 *   - A superseded read (a remount, a reload, or StrictMode's second mount) can never
 *     overwrite a newer one: responses are attributed to a generation, and stale ones
 *     are dropped.
 *   - Reload discards local edits and re-reads; a failed reload leaves no editable
 *     stale view behind.
 *   - Mutations are single-flight: a duplicate save or delete is refused synchronously
 *     rather than racing the network, and no mutation starts while a read is pending.
 *   - Manual entries are personal bookkeeping, not broker observations; identity
 *     is unresolved by construction and is never asserted here.
 *
 * PRESENTATION
 *   This page renders through the same shared workspace layer as Broker Statement Import
 *   and Broker Holdings, so the three read as one application: identical page header,
 *   panels, summary figures, chips, notices, buttons and table treatment. The only
 *   page-specific styling is the editable holdings grid in `PersonalPortfolio.css`.
 *
 *   The presentation adds no behaviour. Every value rendered below is one the transport
 *   or the server already produced, and every gate described above is enforced before
 *   any request is made — not by what is or is not rendered.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createUserPortfolio,
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
  originalSymbol?: string;
  isin?: string;
  exchange?: 'NSE' | 'BSE';
}

type Status =
  | { readonly kind: 'loading' }
  | { readonly kind: 'idle' }
  | { readonly kind: 'saving' }
  | { readonly kind: 'creating' }
  | { readonly kind: 'saved'; readonly savedAt: string }
  | { readonly kind: 'deleting' }
  | { readonly kind: 'conflict' }
  | { readonly kind: 'read-error'; readonly message: string }
  /**
   * A 404. `tombstoneKnown` is true only when this page itself deleted the
   * identifier, or when the provider has already refused to create it — the two
   * cases in which creation is known to be forbidden rather than merely unproven.
   */
  | { readonly kind: 'not-found'; readonly message: string; readonly tombstoneKnown: boolean }
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
        setRows([blankRow()]);
        setStatus({
          kind: 'not-found',
          tombstoneKnown: false,
          message: 'The portfolio could not be found. This response does not distinguish an absent, inaccessible, or deleted portfolio, so it is not treated as proof of either. You may create it below: the request is arbitrated by the provider, which refuses an identifier that already exists or has been removed.',
        });
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

  /**
   * First-time creation, deliberately explicit and provider-arbitrated.
   *
   * A 404 is not authority to create, so the create is never automatic: it runs only
   * when the owner presses the button, and it is preceded by a fresh read so that a
   * portfolio which answers is adopted rather than overwritten. The server refuses a
   * duplicate or tombstoned identifier with HTTP 400 independently of this guard; such
   * a refusal is obeyed, recorded as a known tombstone, and stops the offer.
   */
  const onCreate = async () => {
    if (mutationInFlight.current || readPending.current || view !== null) return;
    if (status.kind !== 'not-found' || status.tombstoneKnown) return;
    const parsedNow = parseRows(rows);
    if (parsedNow.error || !parsedNow.holdings) {
      setStatus({ kind: 'error', message: parsedNow.error ?? 'The rows are not valid.' });
      return;
    }
    mutationInFlight.current = true;
    const current = ++generation.current;
    setStatus({ kind: 'creating' });
    try {
      // Guard against clobbering: an existing portfolio is adopted, never overwritten.
      try {
        const recheck = await fetchUserPortfolioRead(PERSONAL_PORTFOLIO_ID);
        if (mounted.current && generation.current === current) {
          const existing = requireCompletePersonalView(recheck);
          setView(existing);
          setRows(rowsFromView(existing));
          setStatus({ kind: 'idle' });
          mutationInFlight.current = false;
          return;
        }
      } catch (recheckError) {
        // Only a still-absent identifier may proceed. Anything else (503, a malformed
        // envelope, a network fault) is a real condition and must surface, not create.
        if (!(recheckError instanceof UserPortfolioApiError) || recheckError.status !== 404) {
          throw recheckError;
        }
      }
      const created = await createUserPortfolio({
        portfolioName: PERSONAL_PORTFOLIO_NAME,
        holdings: parsedNow.holdings,
      });
      if (!mounted.current || generation.current !== current) return;
      const adopted = requireCompletePersonalView(inspectUserPortfolioView(created));
      setView(adopted);
      setRows(rowsFromView(adopted));
      setStatus({ kind: 'saved', savedAt: adopted.lastUpdated });
    } catch (error) {
      if (!mounted.current || generation.current !== current) return;
      if (error instanceof UserPortfolioApiError && error.status === 409) {
        setStatus({ kind: 'conflict' });
      } else if (error instanceof UserPortfolioApiError && error.status === 400) {
        // The provider refused creation. This is the existence/tombstone answer this
        // client cannot derive on its own, so it is obeyed rather than retried.
        const detail = error.serverDetail !== undefined ? ` ${error.serverDetail}` : '';
        setStatus({
          kind: 'not-found',
          tombstoneKnown: true,
          message: `The portfolio was not created (HTTP 400).${detail} The provider refused this identifier — it already exists, or it was removed and is not reusable. Nothing was changed, and it will not be recreated here. Reload to see the current state.`,
        });
      } else {
        setStatus({
          kind: 'mutation-unknown',
          message: 'The create outcome could not be verified. Reload before trying again; do not retry automatically.',
        });
      }
    } finally {
      mutationInFlight.current = false;
    }
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
      setRows([blankRow()]);
      setStatus({
        kind: 'not-found',
        tombstoneKnown: true,
        message: 'The portfolio was deleted. This identifier is now known to be removed: it must not be silently recreated, and creation is no longer offered.',
      });
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

  const saving = status.kind === 'saving' || status.kind === 'deleting' || status.kind === 'creating';
  const fieldError = parsed.error;
  /**
   * A 404 is unresolved, not absent, so the editor is offered and creation is available
   * unless the tombstone is known. Every other gate below is unchanged: an existing
   * portfolio is still edited only from a complete, admissible read.
   */
  /**
   * Whether the create action is the page's primary action. Keyed off the identifier's
   * resolution state rather than `status.kind` alone, so the control keeps its identity
   * while the create is in flight instead of flipping to "Save changes" mid-request.
   */
  const unresolved = status.kind === 'not-found' ? !status.tombstoneKnown : status.kind === 'creating';
  const showCreate = view === null && unresolved;
  const editable = (view !== null || showCreate) &&
    ['idle', 'saved', 'error', 'saving', 'deleting', 'creating', 'not-found'].includes(status.kind);

  // The header is identical in every state, so the Reload utility stays reachable and the
  // page never loses its identity while data is in flight.
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

  if (status.kind === 'loading' && view === null) {
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

        {status.kind === 'loading' ? <LoadingState /> : null}

        {/*
          * Absent, inaccessible and deleted are indistinguishable to this client, so the 404
          * is reported as unresolved rather than as proof of absence. While the tombstone is
          * unknown the owner may create the portfolio explicitly; the create is arbitrated by
          * the provider and refused for an identifier that exists or was removed. Once the
          * tombstone is known — this page deleted it, or the provider refused the create —
          * the offer is withdrawn and nothing here recreates the identifier.
          */}
        {status.kind === 'not-found' ? (
          <BrokerNotice tone={status.tombstoneKnown ? 'critical' : 'warning'} alert title="No editable portfolio">
            <div data-testid="pp-not-found">
              <p>{status.message}</p>
              {status.tombstoneKnown ? null : (
                <p className="bw-muted">
                  Identifier <code>{PERSONAL_PORTFOLIO_ID}</code>. If a portfolio you saved is
                  missing, it is a read or configuration problem — check the persistence
                  directory and the IPD owner binding before creating, because a new portfolio
                  starts a fresh revision history.
                </p>
              )}
            </div>
          </BrokerNotice>
        ) : null}

        {status.kind === 'error' || status.kind === 'read-error' || status.kind === 'mutation-unknown'
          ? <ErrorState message={status.message} />
          : null}

        {status.kind === 'saved' ? (
          <p role="status" data-testid="pp-saved" className="pp-saved">
            Saved at {new Date(status.savedAt).toLocaleString()} — revision {view?.revision}.
          </p>
        ) : null}

        {editable ? (
          <>
            <BrokerPanel
              eyebrow="Editor"
              title="Holdings"
              hint="Every row is one holding you entered yourself. Quantity, average buy price and current price are your own figures — nothing here is validated against a broker statement or a market feed. Saving replaces the whole set at the revision you last read."
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
                          <BrokerButton
                            variant="ghost"
                            size="sm"
                            aria-label="Remove row"
                            onClick={() => removeRow(row.key)}
                            disabled={rows.length <= 1 || saving}
                          >
                            Remove
                          </BrokerButton>
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
                {/*
                  * "Create portfolio" replaces "Save changes" while the identifier is unresolved:
                  * there is nothing to save until the provider has admitted a portfolio. The
                  * action is explicit and single-flight, and the provider decides whether the
                  * identifier may be created.
                  */}
                {showCreate ? (
                  <BrokerButton
                    variant="primary"
                    onClick={() => void onCreate()}
                    disabled={saving || fieldError !== undefined}
                    data-testid="pp-create"
                  >
                    {status.kind === 'creating' ? 'Creating…' : 'Create portfolio'}
                  </BrokerButton>
                ) : (
                  <BrokerButton
                    variant="primary"
                    onClick={() => void onSave()}
                    disabled={saving || fieldError !== undefined}
                    data-testid="pp-save"
                  >
                    {status.kind === 'saving' ? 'Saving…' : 'Save changes'}
                  </BrokerButton>
                )}
                {view !== null ? (
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
