/**
 * Personal Portfolio — the owner's local, durable, multi-portfolio manual-entry surface.
 *
 * Separate from the certified, read-only `/user-portfolios` surfaces by design. This
 * page is authorized only for this local single-user, non-production application
 * (Program Authority, 2026-11-08) and talks only to the same-origin IRR server, which
 * composes the same-host IPC boundary to IPD. The server and IPD decide everything
 * authoritative: identity, arithmetic, weights, revisions, duplicate detection and
 * digests. This client holds no authoritative state and persists nothing itself.
 *
 * MULTI-PORTFOLIO MODEL
 *   Several independent manual portfolios coexist. Each is created with a fresh,
 *   caller-PROPOSED identifier (`PERSONAL-<uuid>`), because the provider's personal
 *   create path falls back to its own default id when none is supplied — the behaviour
 *   that previously made one hard-coded portfolio the only possible outcome. Each
 *   portfolio carries its own holdings, its own revision history and its own ownership,
 *   resolved by IPD from the binding.
 *
 *   Portfolios from other channels — broker import in particular — do not carry the
 *   personal prefix, so they are never listed, opened, edited or deleted here. The two
 *   populations stay separate without this page opening portfolios it does not own.
 *
 *   The retired `DEFAULT_PORTFOLIO` is never created and never reused. It was removed,
 *   and the provider refuses to re-create a removed identifier.
 *
 * BEHAVIOUR
 *   - The portfolio list is read from the provider and filtered to the personal prefix.
 *     Selection drives everything else; nothing is keyed to a fixed identifier.
 *   - A create proposes a fresh identifier and lets the provider arbitrate. A refusal
 *     (HTTP 400) is obeyed and surfaced, never retried against the same identifier.
 *     Creating after a delete therefore works without weakening tombstone protection:
 *     the removed identifier stays refused forever, and the new portfolio proposes one
 *     that has never existed.
 *   - A full, admissible detail read is required before editing or REPLACE. Rejected
 *     holdings or contributions block the editor; stale reads are ignored and writes are
 *     single-flight. An unknown mutation outcome requires reload, not an automatic retry.
 *   - Save is one optimistic-concurrency transaction (required expectedRevision), sent as
 *     a complete REPLACE. The revision sent is the one this page last read for the
 *     selected portfolio, and the receipt is verified before it is adopted as the next
 *     baseline. On 409 the page stops and asks the owner to Reload — it never merges
 *     silently.
 *   - A 503 is a configuration state, never an empty portfolio list, and offers neither
 *     an editor nor a create form.
 *   - Manual entries are personal bookkeeping, not broker observations; identity is
 *     unresolved by construction and is never asserted here.
 *
 * PRESENTATION
 *   This page renders through the same shared workspace layer as Broker Statement Import
 *   and Broker Holdings, so the three read as one application: identical page header,
 *   panels, summary figures, chips, notices, buttons and table treatment. The only
 *   page-specific styling is the portfolio layout and editable holdings grid in
 *   `PersonalPortfolio.css`.
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
  fetchUserPortfolioSummaries,
  inspectUserPortfolioView,
  saveUserPortfolioHoldings,
  UserPortfolioApiError,
  type UserPortfolioHoldingInput,
  type UserPortfolioSummary,
  type ReadUnavailableDiagnosis,
  type UserPortfolioView,
} from '../../api/userPortfolios';
import { ErrorState, LoadingState } from '../../components/state/StateComponents';
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
import { isPersonalPortfolioId, newPersonalPortfolioId } from './personalPortfolioIds';
import './PersonalPortfolio.css';

const PERSONAL_PORTFOLIO_NAME_MAX = 100;

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

/**
 * A REPLACE editor must never operate on a filtered or unverified snapshot, and must
 * never operate on a portfolio other than the one it believes it is editing.
 */
function requireCompletePersonalView(
  read: ReturnType<typeof inspectUserPortfolioView>,
  expectedId: string,
): UserPortfolioView {
  const portfolio = read.portfolio;
  if (read.rejectedHoldings !== 0 || read.rejectedContributions !== 0 ||
      portfolio.portfolioId !== expectedId ||
      !Number.isInteger(portfolio.revision) || portfolio.revision < 0 ||
      typeof portfolio.portfolioName !== 'string' || typeof portfolio.isSaved !== 'boolean' ||
      typeof portfolio.lastUpdated !== 'string' || typeof portfolio.provenanceDigest !== 'string' ||
      !Number.isFinite(portfolio.totalMarketValue) || !Number.isFinite(portfolio.totalHoldingsCount) ||
      !Number.isFinite(portfolio.weightSumPercentage)) {
    throw new UserPortfolioApiError(500, 'The portfolio read is incomplete or invalid. Reload before editing; no changes were sent.');
  }
  return portfolio;
}

function PortfolioRowActions({ onRemove, disabled }: { readonly onRemove: () => void; readonly disabled: boolean }) {
  return (
    <BrokerButton variant="ghost" size="sm" aria-label="Remove row" onClick={onRemove} disabled={disabled}>
      Remove
    </BrokerButton>
  );
}

export function PersonalPortfolio() {
  const [portfolios, setPortfolios] = useState<readonly UserPortfolioSummary[]>([]);
  const [otherCount, setOtherCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<UserPortfolioView | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([blankRow()]);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  /** True while the create form is open. A create always proposes a FRESH identifier. */
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  /**
   * The IPC endpoint admits ONE connection at a time (IPD C5.4: `maxConnections = 1`).
   * A second connection opened while another is being served is dropped before the
   * server ever sees it, and the transport reports it as 503 — indistinguishable from a
   * genuinely unavailable service.
   *
   * This surface issues two kinds of call (list and detail) and they routinely coincide,
   * so every provider call is chained through one queue. Serialising here is what makes
   * the multi-portfolio reads safe; the constraint itself is the provider's and is not
   * relaxed anywhere.
   */
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  /**
   * Three independent generations. A list read and a detail read routinely run together
   * (after a create, a save or a reload), so they must not invalidate each other: a
   * single shared counter would make whichever started second discard the first's
   * response. A mutation bumps every read generation, because a committed write must
   * always win over a read that was already in flight when it landed.
   */
  const listGeneration = useRef(0);
  const detailGeneration = useRef(0);
  const mutationGeneration = useRef(0);
  const mounted = useRef(false);
  const mutationInFlight = useRef(false);
  const listPending = useRef(false);
  const detailPending = useRef(false);

  /**
   * Reads the portfolio list and filters it to the personal population.
   * Returns `null` when the read failed — the status is already set, so a caller must
   * not overwrite it with a success state of its own.
   */
  const enqueue = useCallback(<T,>(run: () => Promise<T>): Promise<T> => {
    const next = queue.current.then(run, run);
    queue.current = next.then(() => undefined, () => undefined);
    return next;
  }, []);

  const loadList = useCallback((): Promise<readonly UserPortfolioSummary[] | null> =>
    enqueue(async (): Promise<readonly UserPortfolioSummary[] | null> => {
    if (mutationInFlight.current) return null;
    const current = ++listGeneration.current;
    listPending.current = true;
    const isCurrent = () => mounted.current && listGeneration.current === current;
    try {
      const all = await fetchUserPortfolioSummaries();
      if (!isCurrent()) return null;
      const personal = all.filter((p) => isPersonalPortfolioId(p.portfolioId));
      setPortfolios(personal);
      setOtherCount(all.length - personal.length);
      return personal;
    } catch (error) {
      if (!isCurrent()) return null;
      setPortfolios([]);
      setOtherCount(0);
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
      } else {
        setStatus({
          kind: 'read-error',
          message: error instanceof Error ? error.message : 'The portfolio list could not be loaded.',
        });
      }
      return null;
    } finally {
      if (isCurrent()) listPending.current = false;
    }
    }), [enqueue]);

  /** Reads one portfolio's detail and adopts it as the editor baseline. */
  const loadDetail = useCallback((id: string): Promise<void> =>
    enqueue(async (): Promise<void> => {
    if (mutationInFlight.current) return;
    const current = ++detailGeneration.current;
    detailPending.current = true;
    const isCurrent = () => mounted.current && detailGeneration.current === current;
    setStatus({ kind: 'loading' });
    try {
      const read = await fetchUserPortfolioRead(id);
      if (!isCurrent()) return;
      const portfolio = requireCompletePersonalView(read, id);
      setView(portfolio);
      setRows(rowsFromView(portfolio));
      setStatus({ kind: 'idle' });
    } catch (error) {
      if (!isCurrent()) return;
      setView(null);
      setRows([blankRow()]);
      if (error instanceof UserPortfolioApiError && error.status === 404) {
        // The selected portfolio is gone (deleted elsewhere). Drop the selection and
        // re-read the list rather than editing a portfolio that no longer exists.
        setSelectedId(null);
        setStatus({
          kind: 'error',
          message: 'That portfolio could not be found. It may have been deleted elsewhere. The list has been reloaded.',
        });
        void loadList();
        return;
      }
      if (error instanceof UserPortfolioApiError && error.status === 503) {
        const diagnosis = error.diagnosis;
        setStatus({
          kind: 'unavailable', diagnosis,
          message: diagnosis?.reason === 'binding-precondition-absent'
            ? 'The IRR server is not configured to read durable portfolios: the owner-binding precondition is absent.'
            : 'The local persistence service is not available.',
        });
        return;
      }
      setStatus({
        kind: 'read-error',
        message: error instanceof Error ? error.message : 'The portfolio could not be loaded.',
      });
    } finally {
      if (isCurrent()) detailPending.current = false;
    }
    }), [enqueue, loadList]);

  useEffect(() => {
    mounted.current = true;
    void (async () => {
      const list = await loadList();
      if (list === null) return;               // a failed read keeps its own status
      if (list.length > 0) {
        setSelectedId(list[0].portfolioId);
      } else {
        setStatus({ kind: 'idle' });
      }
    })();
    return () => { mounted.current = false; listGeneration.current += 1; detailGeneration.current += 1; };
  }, [loadList]);

  // Selection drives the detail read. Nothing is keyed to a fixed identifier.
  useEffect(() => {
    if (!mounted.current) return;
    if (selectedId === null) { setView(null); return; }
    // A create or a save already adopted this exact portfolio; re-reading it would
    // discard the receipt the mutation just verified.
    if (view !== null && view.portfolioId === selectedId) return;
    void loadDetail(selectedId);
  }, [selectedId, loadDetail, view]);

  const parsed = useMemo(() => parseRows(rows), [rows]);
  const nameError =
    creating && newName.trim().length === 0
      ? 'Give the portfolio a name.'
      : creating && newName.trim().length > PERSONAL_PORTFOLIO_NAME_MAX
        ? `The name must be ${PERSONAL_PORTFOLIO_NAME_MAX} characters or fewer.`
        : undefined;
  const fieldError = nameError ?? parsed.error;

  const updateRow = (key: number, patch: Partial<EditableRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    if (status.kind === 'saved' || status.kind === 'error') setStatus({ kind: 'idle' });
  };

  const addRow = () => setRows((current) => [...current, blankRow()]);
  const removeRow = (key: number) =>
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.key !== key)));

  const reload = useCallback(async () => {
    setCreating(false);
    const list = await loadList();
    if (list === null) return;
    if (selectedId !== null && list.some((p) => p.portfolioId === selectedId)) {
      await loadDetail(selectedId);
    } else if (selectedId !== null) {
      setSelectedId(null);
      setStatus({ kind: 'idle' });
    } else if (list.length > 0) {
      setSelectedId(list[0].portfolioId);
    }
  }, [loadList, loadDetail, selectedId]);

  /** Creates a portfolio under a FRESH identifier; the provider arbitrates. */
  const onCreate = async () => {
    if (mutationInFlight.current || listPending.current || detailPending.current || !creating) return;
    const parsedNow = parseRows(rows);
    if (nameError !== undefined || parsedNow.error || !parsedNow.holdings) {
      setStatus({ kind: 'error', message: nameError ?? parsedNow.error ?? 'The rows are not valid.' });
      return;
    }
    // Captured here, where the narrowing still holds: the create runs inside a deferred
    // closure, and TypeScript does not carry the guard into it.
    const holdingsToCreate: readonly UserPortfolioHoldingInput[] = parsedNow.holdings;
    mutationInFlight.current = true;
    const current = ++mutationGeneration.current;
    const proposedId = newPersonalPortfolioId();
    setStatus({ kind: 'creating' });
    try {
      const created = await enqueue(() => createUserPortfolio({
        portfolioId: proposedId,
        portfolioName: newName.trim(),
        holdings: holdingsToCreate,
      }));
      if (!mounted.current || mutationGeneration.current !== current) return;
      const adopted = requireCompletePersonalView(inspectUserPortfolioView(created), proposedId);
      setView(adopted);
      setRows(rowsFromView(adopted));
      setCreating(false);
      setNewName('');
      setSelectedId(adopted.portfolioId);
      setStatus({ kind: 'saved', savedAt: adopted.lastUpdated });
      mutationInFlight.current = false; // the mutation is committed; allow the refresh
      void loadList();
    } catch (error) {
      if (!mounted.current || mutationGeneration.current !== current) return;
      if (error instanceof UserPortfolioApiError && error.status === 400) {
        const detail = error.serverDetail !== undefined ? ` ${error.serverDetail}` : '';
        setStatus({
          kind: 'error',
          message: `The portfolio was not created (HTTP 400).${detail} The provider refused the proposed identifier. Nothing was changed; try again with a new portfolio.`,
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

  const onSave = async () => {
    if (mutationInFlight.current || listPending.current || detailPending.current || !view || creating) return;
    if (!['idle', 'saved', 'error'].includes(status.kind)) return;
    const parsedNow = parseRows(rows);
    if (parsedNow.error || !parsedNow.holdings) {
      setStatus({ kind: 'error', message: parsedNow.error ?? 'The rows are not valid.' });
      return;
    }
    // Captured here, where the narrowing still holds: the save runs inside a deferred
    // closure, and TypeScript does not carry the guard into it.
    const holdingsToSave: readonly UserPortfolioHoldingInput[] = parsedNow.holdings;
    mutationInFlight.current = true;
    listGeneration.current += 1;
    detailGeneration.current += 1;
    const current = ++mutationGeneration.current;
    const targetId = view.portfolioId;
    setStatus({ kind: 'saving' });
    try {
      const result = await enqueue(() => saveUserPortfolioHoldings(
        targetId,
        { holdings: holdingsToSave, expectedRevision: view.revision, mode: 'REPLACE' },
      ));
      if (!mounted.current || mutationGeneration.current !== current) return;
      const saved = requireCompletePersonalView(inspectUserPortfolioView(result.portfolio), targetId);
      if (saved.revision !== result.revision || typeof result.savedAt !== 'string' || Number.isNaN(Date.parse(result.savedAt))) {
        throw new UserPortfolioApiError(500, 'Invalid save receipt');
      }
      setView(saved);
      setRows(rowsFromView(saved));
      setStatus({ kind: 'saved', savedAt: result.savedAt });
      mutationInFlight.current = false; // the mutation is committed; allow the refresh
      void loadList();
    } catch (error) {
      if (!mounted.current || mutationGeneration.current !== current) return;
      if (error instanceof UserPortfolioApiError && error.status === 409) {
        setStatus({ kind: 'conflict' });
      } else if (error instanceof UserPortfolioApiError && error.status === 400) {
        const detail = error.serverDetail !== undefined ? ` ${error.serverDetail}` : '';
        setStatus({ kind: 'error', message: `Your changes were NOT saved (HTTP 400).${detail} The portfolio was not changed. Reload to see the current state, then re-apply your changes.` });
      } else {
        setStatus({ kind: 'mutation-unknown', message: 'The save outcome could not be verified. Reload before making further changes; do not retry automatically.' });
      }
    } finally {
      mutationInFlight.current = false;
    }
  };

  const onDelete = async () => {
    if (mutationInFlight.current || listPending.current || detailPending.current || !view || creating) return;
    if (!['idle', 'saved', 'error'].includes(status.kind)) return;
    const target = view;
    const confirmed = window.confirm(
      `Delete “${target.portfolioName}”? Its holdings will be removed and cannot be recovered, and this identifier will never be reusable.`,
    );
    if (!confirmed) return;
    mutationInFlight.current = true;
    listGeneration.current += 1;
    detailGeneration.current += 1;
    const current = ++mutationGeneration.current;
    setStatus({ kind: 'deleting' });
    try {
      await enqueue(() => deleteUserPortfolio(target.portfolioId, target.revision));
      if (!mounted.current || mutationGeneration.current !== current) return;
      setView(null);
      setRows([blankRow()]);
      setSelectedId(null);
      setStatus({
        kind: 'error',
        message: `“${target.portfolioName}” was deleted. Its identifier is retired and will not be reused — create a new portfolio instead.`,
      });
      mutationInFlight.current = false; // the delete is committed; allow the refresh
      const list = await loadList();
      if (list && list.length > 0) setSelectedId(list[0].portfolioId);
    } catch (error) {
      if (!mounted.current || mutationGeneration.current !== current) return;
      if (error instanceof UserPortfolioApiError && error.status === 409) {
        setStatus({ kind: 'conflict' });
      } else if (error instanceof UserPortfolioApiError && error.status === 400) {
        const detail = error.serverDetail !== undefined ? ` ${error.serverDetail}` : '';
        setStatus({ kind: 'error', message: `The portfolio was not deleted (HTTP 400).${detail} It was not changed. Reload to see the current state.` });
      } else {
        setStatus({ kind: 'mutation-unknown', message: 'The delete outcome could not be verified. Reload before making further changes; do not retry automatically.' });
      }
    } finally {
      mutationInFlight.current = false;
    }
  };

  const saving = status.kind === 'saving' || status.kind === 'deleting' || status.kind === 'creating';
  const editorOpen = creating || view !== null;

  const header = (
    <BrokerPageHeader
      eyebrow="Manual records"
      title="Personal Portfolio"
      lede="Durable, local and single-user. Keep as many independent manual portfolios as you need — each has its own holdings, revisions and identifier. Manual entries are your own records — not broker statements, and never resolved against the governed security master."
      meta={[
        <BrokerChip key="manual" label="MANUAL ENTRY" tone="informational" glyph="◇" />,
        <BrokerChip key="identity" label="IDENTITY UNRESOLVED" tone="neutral" glyph="◆" />,
        <BrokerButton key="reload" size="sm" data-testid="pp-reload" onClick={() => void reload()} disabled={saving}>
          Reload
        </BrokerButton>,
        <BrokerButton
          key="new"
          size="sm"
          data-testid="pp-new"
          onClick={() => {
            setCreating(true);
            setSelectedId(null);
            setView(null);
            setRows([blankRow()]);
            setNewName('');
            setStatus({ kind: 'idle' });
          }}
          disabled={saving || creating}
        >
          New portfolio
        </BrokerButton>,
      ]}
    />
  );

  if (status.kind === 'loading' && portfolios.length === 0 && view === null && !creating) {
    return (
      <BrokerPage>
        <section aria-label="Personal portfolio" data-testid="personal-portfolio">
          {header}
          <BrokerPanel title="Portfolios" hint="Reading the durable portfolios from IPD.">
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
                Your saved portfolios have not been changed or deleted. This is a configuration state,
                not an empty portfolio list.
              </p>
            </div>
          </BrokerNotice>
        ) : null}

        {status.kind === 'conflict' ? (
          <BrokerNotice tone="critical" alert title="Portfolio changed elsewhere">
            <div data-testid="pp-conflict">
              <p>Your edits were NOT saved. Reload to fetch the current portfolio, then re-apply your changes.</p>
              <div className="bw-actions">
                <BrokerButton size="sm" onClick={() => void reload()}>Reload</BrokerButton>
              </div>
            </div>
          </BrokerNotice>
        ) : null}

        {status.kind === 'loading' ? <LoadingState /> : null}

        {status.kind === 'error' || status.kind === 'read-error' || status.kind === 'mutation-unknown'
          ? <ErrorState message={status.message} />
          : null}

        {status.kind === 'unavailable' ? null : (
          <div className="pp-layout">
            <BrokerPanel
              eyebrow="Portfolios"
              title={`Your portfolios (${portfolios.length})`}
              hint="Each portfolio is independent: its own holdings, revision history and identifier."
              aside={
                <BrokerButton size="sm" data-testid="pp-create" onClick={() => {
                  setCreating(true);
                  setSelectedId(null);
                  setView(null);
                  setRows([blankRow()]);
                  setNewName('');
                  setStatus({ kind: 'idle' });
                }} disabled={saving || creating}>
                  Create Portfolio
                </BrokerButton>
              }
              tight
              secondary
            >
              <div data-testid="pp-list">
                {portfolios.length === 0 ? (
                  <p className="pp-empty" data-testid="pp-list-empty">
                    No personal portfolios yet. Create one to get started.
                  </p>
                ) : (
                  <ul className="pp-list">
                    {portfolios.map((p) => {
                      const active = !creating && p.portfolioId === selectedId;
                      return (
                        <li key={p.portfolioId}>
                          <div className={`pp-list-item${active ? ' pp-list-item--active' : ''}`}>
                            <button
                              type="button"
                              className="pp-list-select"
                              data-testid={`pp-select-${p.portfolioId}`}
                              aria-current={active}
                              disabled={saving}
                              onClick={() => {
                                setCreating(false);
                                setSelectedId(p.portfolioId);
                              }}
                            >
                              <span className="pp-list-name">{p.portfolioName}</span>
                              <span className="pp-list-meta">
                                {p.totalHoldingsCount} {p.totalHoldingsCount === 1 ? 'holding' : 'holdings'} ·
                                revision {p.revision} · {formatInr(p.totalMarketValue)}
                              </span>
                              <span className="pp-list-id" title={p.portfolioId}>
                                {shortDigest(p.portfolioId)}
                              </span>
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {otherCount > 0 ? (
                  <p className="bw-muted pp-note" data-testid="pp-other-count">
                    {otherCount} other {otherCount === 1 ? 'portfolio' : 'portfolios'} on this binding (for
                    example broker imports such as <code>{'DHAN_PORTFOLIO'}</code>) {otherCount === 1 ? 'is' : 'are'} not
                    managed here and remain untouched.
                  </p>
                ) : null}
              </div>
            </BrokerPanel>

            <div className="pp-main">
              {status.kind === 'saved' ? (
                <p role="status" data-testid="pp-saved" className="pp-saved">
                  Saved at {new Date(status.savedAt).toLocaleString()} — revision {view?.revision}.
                </p>
              ) : null}

              {!editorOpen ? (
                <BrokerPanel
                  eyebrow="Editor"
                  title="No portfolio selected"
                  hint="Select a portfolio from the list, or create a new one."
                  tight
                >
                  <p className="pp-empty" data-testid="pp-no-selection">
                    Nothing is open. Choose a portfolio to edit it, or use Create Portfolio to start a new
                    independent one.
                  </p>
                </BrokerPanel>
              ) : (
                <>
                  <BrokerPanel
                    eyebrow={creating ? 'New portfolio' : 'Editor'}
                    title={creating ? 'Create Portfolio' : (view?.portfolioName ?? 'Holdings')}
                    hint={
                      creating
                        ? 'This portfolio gets its own fresh identifier and its own revision history, independent of every other portfolio.'
                        : 'Every row is one holding you entered yourself. Quantity, average buy price and current price are your own figures — nothing here is validated against a broker statement or a market feed. Saving replaces the whole set at the revision you last read.'
                    }
                    aside={<BrokerChip label={`${rows.length} ${rows.length === 1 ? 'ROW' : 'ROWS'}`} tone="neutral" glyph="#" />}
                    tight
                  >
                    {creating ? (
                      <div className="pp-field">
                        <label htmlFor="pp-new-name">Portfolio name</label>
                        <input
                          id="pp-new-name"
                          className="bw-control pp-input"
                          aria-label="Portfolio name"
                          data-testid="pp-new-name"
                          value={newName}
                          maxLength={PERSONAL_PORTFOLIO_NAME_MAX + 20}
                          placeholder="Retirement"
                          disabled={saving}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      </div>
                    ) : (
                      <p className="pp-field pp-field--static">
                        <span className="bw-muted">Identifier</span>{' '}
                        <code data-testid="pp-edit-id">{view?.portfolioId}</code>
                      </p>
                    )}

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
                                <PortfolioRowActions
                                  onRemove={() => removeRow(row.key)}
                                  disabled={rows.length <= 1 || saving}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/*
                      * Client-side validation. Deliberately not a live region: it is derived
                      * from the rows on every keystroke, so announcing it would interrupt the
                      * owner on each character. It sits directly above the action it blocks,
                      * and the blocked control carries the same state through `disabled`.
                      */}
                    {fieldError !== undefined ? (
                      <BrokerNotice tone="warning" title="This portfolio cannot be saved yet">
                        <p data-testid="pp-validation">{fieldError}</p>
                      </BrokerNotice>
                    ) : null}

                    <div className="bw-actions pp-actions">
                      <BrokerButton onClick={addRow} disabled={saving}>Add row</BrokerButton>
                      {creating ? (
                        <BrokerButton
                          variant="primary"
                          onClick={() => void onCreate()}
                          disabled={saving || fieldError !== undefined}
                          data-testid="pp-create-submit"
                        >
                          {status.kind === 'creating' ? 'Creating…' : 'Create Portfolio'}
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
                      {creating ? (
                        <BrokerButton
                          onClick={() => {
                            setCreating(false);
                            setNewName('');
                            setRows([blankRow()]);
                            setStatus({ kind: 'idle' });
                          }}
                          disabled={saving}
                          data-testid="pp-create-cancel"
                        >
                          Cancel
                        </BrokerButton>
                      ) : (
                        <BrokerButton onClick={() => void onDelete()} disabled={saving} data-testid="pp-delete">
                          Delete portfolio…
                        </BrokerButton>
                      )}
                      {fieldError !== undefined ? (
                        <p className="pp-actions__feedback">
                          Saving is disabled until the rows above are valid.
                        </p>
                      ) : null}
                    </div>
                  </BrokerPanel>

                  {view !== null ? (
                    <BrokerPanel eyebrow="Portfolio" title="Summary" hint="Read back from IPD after the last save." secondary tight>
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
              )}
            </div>
          </div>
        )}
      </section>
    </BrokerPage>
  );
}
