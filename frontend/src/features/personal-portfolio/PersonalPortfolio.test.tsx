/**
 * Personal Portfolio — editor surface tests (local single-user path only).
 *
 * The transport/IPC boundary is mocked at the fetch boundary exactly like the
 * certified workspace tests; the server-owned values (revision, totals, digests)
 * are taken from the mocked responses, never computed here.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PersonalPortfolio } from './PersonalPortfolio';
import type { UserPortfolioView } from '../../api/userPortfolios';

const VIEW: UserPortfolioView = {
  portfolioId: 'DEFAULT_PORTFOLIO',
  portfolioName: 'My Portfolio',
  revision: 7,
  holdings: [
    {
      symbol: 'RELIANCE',
      companyId: 'MANUAL:RELIANCE',
      quantity: 10,
      averageBuyPrice: 2400,
      currentPrice: 2500,
      marketValue: 25000,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'manual-personal',
      lineageDigest: 'a'.repeat(64),
      identityStatus: 'UNRESOLVED',
      resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS',
    },
  ],
  totalMarketValue: 25000,
  totalHoldingsCount: 1,
  weightSumPercentage: 100,
  lastUpdated: '2026-11-08T00:00:00.000Z',
  provenanceDigest: 'b'.repeat(64),
  isSaved: true,
  contributions: [],
};

function mockSequence(steps: Array<{ ok: boolean; status: number; body: unknown }>) {
  const queue = [...steps];
  const fetchMock = vi.fn().mockImplementation(async () => {
    const next = queue.shift();
    if (!next) throw new Error('unexpected fetch call');
    return { ok: next.ok, status: next.status, json: async () => next.body };
  });
  globalThis.fetch = fetchMock as never;
  return fetchMock;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/personal-portfolio']}>
      <PersonalPortfolio />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Personal Portfolio (local single-user editor)', () => {
  it('loads the durable portfolio and prefills the rows', async () => {
    mockSequence([{ ok: true, status: 200, body: { portfolio: VIEW } }]);
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('7');
    expect(screen.getByTestId('pp-save')).toHaveTextContent('Save changes');
  });

  it('does not treat a 404 as authority to create automatically', async () => {
    const fetchMock = mockSequence([{ ok: false, status: 404, body: { error: 'not-found' } }]);
    renderPage();
    expect(await screen.findByTestId('pp-not-found')).toHaveTextContent('does not distinguish');
    // A 404 authorises nothing by itself: exactly one read has happened and no write
    // has been issued. Creation is offered to the owner, never performed for them.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
    expect(screen.getByTestId('pp-create')).toBeInTheDocument();
  });

  it('surfaces 409 on save as an explicit conflict — never a silent merge', async () => {
    mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      { ok: false, status: 409, body: { error: 'revision-conflict' } },
    ]);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    await user.click(screen.getByTestId('pp-save'));
    expect(await screen.findByTestId('pp-conflict')).toBeInTheDocument();
  });

  it('fails closed with the local-persistence unavailable message on 503', async () => {
    mockSequence([{ ok: false, status: 503, body: { error: 'upstream-unavailable' } }]);
    renderPage();
    expect(await screen.findByTestId('pp-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
  });

  it('sends the current revision as the guard and adopts the revision the server returns', async () => {
    // The optimistic-concurrency guard is the revision the page last read; the
    // revision displayed after a save is the one the server returned, never a
    // locally computed increment.
    const fetchMock = mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      {
        ok: true,
        status: 200,
        body: {
          success: true,
          isDuplicate: false,
          disposition: 'MERGED_INTO_EXISTING',
          revision: 8,
          holdingsSavedCount: 1,
          totalMarketValue: 25000,
          weightSumPercentage: 100,
          savedAt: '2026-11-08T01:00:00.000Z',
          provenanceDigest: 'c'.repeat(64),
          portfolio: { ...VIEW, revision: 8 },
        },
      },
    ]);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('7');
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-saved')).toBeInTheDocument());
    const saveCall = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(saveCall[0]).toBe('/api/user-portfolios/DEFAULT_PORTFOLIO/holdings');
    expect(saveCall[1].method).toBe('PUT');
    const body = JSON.parse(String(saveCall[1].body)) as {
      expectedRevision: number;
      options: { mode: string };
    };
    expect(body.expectedRevision).toBe(7);
    expect(body.options.mode).toBe('REPLACE');
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('8');
  });

  it('treats a duplicate/no-op save as a success and keeps the revision unchanged', async () => {
    mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      {
        ok: true,
        status: 200,
        body: {
          success: true,
          isDuplicate: true,
          disposition: 'ALREADY_IMPORTED_NO_OP',
          revision: 7,
          holdingsSavedCount: 0,
          totalMarketValue: 25000,
          weightSumPercentage: 100,
          savedAt: '2026-11-08T01:00:00.000Z',
          provenanceDigest: 'b'.repeat(64),
          portfolio: VIEW,
        },
      },
    ]);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    await user.click(screen.getByTestId('pp-save'));
    // A no-op is NOT a conflict and NOT an error: it is a successful save.
    expect(await screen.findByTestId('pp-saved')).toBeInTheDocument();
    expect(screen.queryByTestId('pp-conflict')).not.toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('7');
  });

  it('deletes after explicit confirmation and does not offer recreation', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      { ok: true, status: 200, body: { portfolioId: 'DEFAULT_PORTFOLIO', deletedAt: '2026-11-08T02:00:00.000Z' } },
    ]);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    await user.click(screen.getByTestId('pp-delete'));
    await waitFor(() => expect(screen.queryByDisplayValue('RELIANCE')).not.toBeInTheDocument());
    expect(screen.getByTestId('pp-not-found')).toHaveTextContent('must not be silently recreated');
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
    // Known tombstone: this page deleted it, so no creation is offered at all.
    expect(screen.queryByTestId('pp-create')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Symbol')).not.toBeInTheDocument();
  });

  it('rejects an invalid row client-side before any mutation', async () => {
    const fetchMock = mockSequence([{ ok: true, status: 200, body: { portfolio: VIEW } }]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('RELIANCE');
    await user.clear(screen.getByLabelText('Quantity'));
    expect(screen.getByTestId('pp-save')).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

});

/**
 * WS-A — the 503 banner names what is missing, and an absent portfolio is not an error.
 */
describe('Personal Portfolio — unavailable is diagnosable, absent is editable', () => {
  it('shows the missing server settings for a binding diagnosis', async () => {
    mockSequence([{
      ok: false,
      status: 503,
      body: {
        error: 'owner-context-unavailable',
        detail: {
          reason: 'No non-authentication ownership source has been established.',
          unavailableReason: 'binding-precondition-absent',
          requiredSettings: ['IIPS_G3_IPC_BINDING_PROVISIONED', 'IIPS_G2_IPC_ENDPOINT'],
        },
      },
    }]);
    renderPage();
    const banner = await screen.findByTestId('pp-unavailable');
    expect(banner).toHaveTextContent('owner-binding precondition is absent');
    const settings = screen.getByTestId('pp-required-settings');
    expect(settings).toHaveTextContent('IIPS_G3_IPC_BINDING_PROVISIONED');
    expect(settings).toHaveTextContent('IIPS_G2_IPC_ENDPOINT');
    // It must not read as if the portfolio is empty or lost.
    expect(banner).toHaveTextContent('not an empty portfolio');
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
  });

  it('distinguishes an unreachable IPD service from an unconfigured one', async () => {
    mockSequence([{
      ok: false,
      status: 503,
      body: {
        error: 'upstream-unavailable',
        detail: { unavailableReason: 'ipc-endpoint-unreachable', requiredSettings: ['IIPS_G2_IPC_ENDPOINT'] },
      },
    }]);
    renderPage();
    expect(await screen.findByTestId('pp-unavailable')).toHaveTextContent('did not answer');
  });

  it('keeps the generic banner when the transport publishes no diagnosis', async () => {
    mockSequence([{ ok: false, status: 503, body: { error: 'upstream-unavailable' } }]);
    renderPage();
    expect(await screen.findByTestId('pp-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('pp-required-settings')).not.toBeInTheDocument();
  });

  it('a 404 never asserts absence, and offers creation without claiming the id is free', async () => {
    const fetchMock = mockSequence([{ ok: false, status: 404, body: { error: 'not-found' } }]);
    renderPage();
    expect(await screen.findByTestId('pp-not-found')).toHaveTextContent('does not distinguish');
    // The notice states the limitation; the editor is available so a first-time
    // portfolio can be entered. Nothing has been created.
    expect(screen.getByLabelText('Symbol')).toBeInTheDocument();
    expect(screen.getByTestId('pp-create')).toHaveTextContent('Create portfolio');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

});

/**
 * 400 handling (2026-11-10) — actionable diagnostics, rows retained.
 *
 * A 400 from the personal-use transport carries `{error, detail.reason}` where the
 * reason is the authored boundary diagnostic. The editor previously rendered that
 * as a bare "user-portfolio transport returned 400", giving the owner no indication
 * of which rule failed and no reassurance that their rows were untouched.
 */
describe('Personal Portfolio — HTTP 400 surfaces the server reason and keeps the rows', () => {
  it('save refused with 400 on an existing portfolio: banner names the rule, rows retained', async () => {
    mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      {
        ok: false,
        status: 400,
        body: {
          error: 'invalid-request',
          detail: { reason: 'expectedRevision must be a non-negative integer.' },
        },
      },
    ]);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    await user.click(screen.getByTestId('pp-save'));

    const banner = await screen.findByTestId('state-error');
    expect(banner).toHaveTextContent('Your changes were NOT saved (HTTP 400).');
    expect(banner).toHaveTextContent('expectedRevision must be a non-negative integer.');
    expect(banner).toHaveTextContent('The portfolio was not changed');
    expect(screen.getByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('7');
  });

  it('delete refused with 400: banner names the failure, the portfolio stays loaded', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      {
        ok: false,
        status: 400,
        body: {
          error: 'invalid-request',
          detail: { reason: 'The upstream refused portfolio.delete with outcome INVALID_REQUEST.' },
        },
      },
    ]);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    await user.click(screen.getByTestId('pp-delete'));

    const banner = await screen.findByTestId('state-error');
    expect(banner).toHaveTextContent('The portfolio was not deleted (HTTP 400).');
    expect(banner).toHaveTextContent('portfolio.delete');
    // The loaded portfolio is still on screen — a failed delete never blanks it.
    expect(screen.getByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByTestId('pp-save')).toHaveTextContent('Save changes');
  });

  it('a 400 with no parseable detail still fails closed with status and keeps the rows', async () => {
    mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      { ok: false, status: 400, body: {} },
    ]);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    await user.click(screen.getByTestId('pp-save'));

    const banner = await screen.findByTestId('state-error');
    expect(banner).toHaveTextContent('Your changes were NOT saved (HTTP 400).');
    expect(screen.getByDisplayValue('RELIANCE')).toBeInTheDocument();
  });
});


describe('Personal Portfolio — safe initialization and mutation gates', () => {
  const response = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
  const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(r => { resolve = r; });
    return { promise, resolve };
  };

  it('loads revision 6 on mount, reload and remount without creating', async () => {
    const v6 = { ...VIEW, revision: 6, isSaved: true, portfolioName: 'Restored portfolio' };
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => response(200, { portfolio: v6 }));
    globalThis.fetch = fetchMock as never;
    const user = userEvent.setup();
    const page = renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('6');
    await user.click(screen.getByTestId('pp-reload'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    page.unmount();
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('6');
    expect(fetchMock.mock.calls.every(call => !call[1] || (call[1] as RequestInit).method === undefined)).toBe(true);
  });

  it('ignores a late 404 from a superseded StrictMode initialization', async () => {
    const first = deferred<ReturnType<typeof response>>();
    const second = deferred<ReturnType<typeof response>>();
    const fetchMock = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    globalThis.fetch = fetchMock as never;
    render(<StrictMode><MemoryRouter><PersonalPortfolio /></MemoryRouter></StrictMode>);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await act(async () => { second.resolve(response(200, { portfolio: { ...VIEW, revision: 6 } })); });
    expect(await screen.findByTestId('pp-revision')).toHaveTextContent('6');
    await act(async () => { first.resolve(response(404, {})); });
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('6');
    expect(screen.queryByTestId('pp-not-found')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([401, 403, 404, 500, 503])('a reload failure (%i) cannot leave an editable stale view', async status => {
    const fetchMock = mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      { ok: false, status, body: {} },
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('RELIANCE');
    await user.click(screen.getByTestId('pp-reload'));

    // The safety property is that no STALE view survives: the previously saved rows are
    // gone and nothing can be saved into a portfolio this page can no longer see.
    await waitFor(() => expect(screen.queryByDisplayValue('RELIANCE')).not.toBeInTheDocument());
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
    if (status === 404) {
      // A 404 may offer a blank create editor, but never one carrying the stale rows.
      expect(screen.getByLabelText('Symbol')).toHaveValue('');
    } else {
      expect(screen.queryByLabelText('Symbol')).not.toBeInTheDocument();
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each(['holdings', 'contributions'] as const)('refuses a filtered %s snapshot for REPLACE', async key => {
    const bad = { ...VIEW, [key]: [...VIEW[key], { invalid: true }] };
    const fetchMock = mockSequence([{ ok: true, status: 200, body: { portfolio: bad } }]);
    renderPage();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('incomplete or invalid');
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('prevents duplicate save requests synchronously', async () => {
    const pending = deferred<ReturnType<typeof response>>();
    const fetchMock = vi.fn().mockResolvedValueOnce(response(200, { portfolio: VIEW })).mockReturnValueOnce(pending.promise);
    globalThis.fetch = fetchMock as never;
    renderPage();
    await screen.findByDisplayValue('RELIANCE');
    const button = screen.getByTestId('pp-save');
    act(() => { fireEvent.click(button); fireEvent.click(button); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => { pending.resolve(response(409, {})); });
    expect(await screen.findByTestId('pp-conflict')).toBeInTheDocument();
  });

  it('preserves add/edit/remove and sends one complete REPLACE with the read revision', async () => {
    const fetchMock = mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      { ok: true, status: 200, body: { success: true, revision: 8, savedAt: VIEW.lastUpdated, portfolio: { ...VIEW, revision: 8 } } },
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('RELIANCE');
    await user.click(screen.getByText('Add row'));
    const symbols = screen.getAllByLabelText('Symbol');
    await user.type(symbols[1]!, 'INFY');
    await user.type(screen.getAllByLabelText('Quantity')[1]!, '2');
    await user.type(screen.getAllByLabelText('Average buy price')[1]!, '10');
    await user.type(screen.getAllByLabelText('Current price')[1]!, '12');
    await user.click(screen.getAllByLabelText('Remove row')[0]!);
    await user.click(screen.getByTestId('pp-save'));
    await screen.findByTestId('pp-saved');
    const body = JSON.parse(String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body));
    expect(body).toMatchObject({ expectedRevision: 7, options: { mode: 'REPLACE' }, holdings: [{ symbol: 'INFY', quantity: 2 }] });
  });
  it.each([false, true])('preserves optional observed identifiers only for the original symbol (changed: %s)', async changed => {
    const withMetadata = { ...VIEW, holdings: [{ ...VIEW.holdings[0]!, isin: 'INE009A01021', exchange: 'NSE' as const }] };
    const fetchMock = mockSequence([
      { ok: true, status: 200, body: { portfolio: withMetadata } },
      { ok: true, status: 200, body: { success: true, revision: 8, savedAt: VIEW.lastUpdated, portfolio: { ...withMetadata, revision: 8 } } },
    ]);
    const user = userEvent.setup();
    renderPage();
    const symbol = await screen.findByDisplayValue('RELIANCE');
    if (changed) {
      await user.clear(symbol);
      await user.type(symbol, 'INFY');
    }
    await user.click(screen.getByTestId('pp-save'));
    await screen.findByTestId('pp-saved');
    const body = JSON.parse(String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body));
    expect(body.holdings[0].symbol).toBe(changed ? 'INFY' : 'RELIANCE');
    if (changed) {
      expect(body.holdings[0]).not.toHaveProperty('isin');
      expect(body.holdings[0]).not.toHaveProperty('exchange');
    } else {
      expect(body.holdings[0]).toMatchObject({ isin: 'INE009A01021', exchange: 'NSE' });
    }
    expect(body.holdings[0]).not.toHaveProperty('companyId');
    expect(body.holdings[0]).not.toHaveProperty('lineageDigest');
  });

  it('locks writes when a reload and save are requested in the same event turn', async () => {
    const pending = deferred<ReturnType<typeof response>>();
    const fetchMock = vi.fn().mockResolvedValueOnce(response(200, { portfolio: VIEW })).mockReturnValueOnce(pending.promise);
    globalThis.fetch = fetchMock as never;
    renderPage();
    await screen.findByDisplayValue('RELIANCE');
    const reload = screen.getByTestId('pp-reload');
    const save = screen.getByTestId('pp-save');
    act(() => { fireEvent.click(reload); fireEvent.click(save); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toBe('/api/user-portfolios/DEFAULT_PORTFOLIO');
    await act(async () => { pending.resolve(response(200, { portfolio: VIEW })); });
  });

  it('prevents a duplicate delete synchronously', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    const pending = deferred<ReturnType<typeof response>>();
    const fetchMock = vi.fn().mockResolvedValueOnce(response(200, { portfolio: VIEW })).mockReturnValueOnce(pending.promise);
    globalThis.fetch = fetchMock as never;
    renderPage();
    await screen.findByDisplayValue('RELIANCE');
    const button = screen.getByTestId('pp-delete');
    act(() => { fireEvent.click(button); fireEvent.click(button); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(window.confirm).toHaveBeenCalledTimes(1);
    await act(async () => { pending.resolve(response(200, { portfolioId: 'DEFAULT_PORTFOLIO', deletedAt: '2026-11-08' })); });
    expect(await screen.findByTestId('pp-not-found')).toHaveTextContent('deleted');
  });

  it('a network failure does not expose the editor or create', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    globalThis.fetch = fetchMock as never;
    renderPage();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Network error');
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('an unknown save outcome locks editing until a fresh read', async () => {
    mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      { ok: false, status: 503, body: {} },
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('RELIANCE');
    await user.click(screen.getByTestId('pp-save'));
    expect(await screen.findByTestId('state-error')).toHaveTextContent('outcome could not be verified');
    expect(screen.queryByLabelText('Symbol')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
  });

  it('rejects an incomplete save receipt rather than making it the next REPLACE baseline', async () => {
    const bad = { ...VIEW, holdings: [...VIEW.holdings, { symbol: 'bad' }] };
    mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      { ok: true, status: 200, body: { success: true, revision: 8, portfolio: bad } },
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('RELIANCE');
    await user.click(screen.getByTestId('pp-save'));
    expect(await screen.findByTestId('state-error')).toHaveTextContent('outcome could not be verified');
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
  });

});

/**
 * Regression (2026-11-12) — the portfolio lifecycle must survive a 404.
 *
 * A 404 conflates absent, inaccessible and tombstoned, so it must not be a terminal
 * wall; but it is not authority to create either. Creation here is explicit and
 * provider-arbitrated: the page re-reads immediately before creating and adopts any
 * portfolio that answers, and the server independently refuses a duplicate or removed
 * identifier with HTTP 400 — a refusal this page obeys. An existing portfolio is
 * therefore never overwritten and a removed one is never recreated.
 */
describe('Personal Portfolio — creation is explicit and provider-arbitrated', () => {
  const fillFirstRow = async (user: ReturnType<typeof userEvent.setup>, symbol = 'INFY') => {
    await user.type(screen.getByLabelText('Symbol'), symbol);
    await user.type(screen.getByLabelText('Quantity'), '25');
    await user.type(screen.getByLabelText('Average buy price'), '1500');
    await user.type(screen.getByLabelText('Current price'), '1400');
  };

  const CREATED: UserPortfolioView = {
    ...VIEW,
    revision: 1,
    isSaved: false,
    lastUpdated: '2026-11-12T00:00:00.000Z',
    holdings: [
      {
        ...VIEW.holdings[0],
        symbol: 'INFY',
        companyId: 'MANUAL:INFY',
        quantity: 25,
        averageBuyPrice: 1500,
        currentPrice: 1400,
        marketValue: 35000,
      },
    ],
    totalMarketValue: 35000,
  };

  it('creates a genuinely new portfolio and adopts the provider-owned revision', async () => {
    const fetchMock = mockSequence([
      { ok: false, status: 404, body: { error: 'not-found' } }, // initial read
      { ok: false, status: 404, body: { error: 'not-found' } }, // guard re-read
      { ok: true, status: 201, body: { portfolio: CREATED } },  // create
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('pp-create');
    await fillFirstRow(user);
    await user.click(screen.getByTestId('pp-create'));

    expect(await screen.findByTestId('pp-revision')).toHaveTextContent('1');
    expect(screen.getByDisplayValue('INFY')).toBeInTheDocument();
    // The page has moved from "unresolved" to "editing an existing portfolio".
    expect(screen.queryByTestId('pp-create')).not.toBeInTheDocument();
    expect(screen.getByTestId('pp-save')).toHaveTextContent('Save changes');
    expect(fetchMock).toHaveBeenCalledTimes(3);

    // The create went to the real provider endpoint as a POST, not a local guess.
    const [url, init] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(url).toBe('/api/user-portfolios');
    expect(init.method).toBe('POST');
  });

  it('never issues a create for an identifier that already exists — the guard re-read adopts it', async () => {
    const fetchMock = mockSequence([
      { ok: false, status: 404, body: { error: 'not-found' } }, // initial read
      { ok: true, status: 200, body: { portfolio: VIEW } },     // guard re-read: it exists
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('pp-create');
    await fillFirstRow(user, 'INFY');
    await user.click(screen.getByTestId('pp-create'));

    // The persisted portfolio is adopted, not overwritten: revision 7 and the stored
    // holding are intact, and no create was ever issued.
    expect(await screen.findByTestId('pp-revision')).toHaveTextContent('7');
    expect(screen.getByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.some(([, init]) => (init as RequestInit | undefined)?.method === 'POST')).toBe(false);
  });

  it('obeys a provider refusal for a removed identifier and withdraws the offer', async () => {
    mockSequence([
      { ok: false, status: 404, body: { error: 'not-found' } },
      { ok: false, status: 404, body: { error: 'not-found' } },
      {
        ok: false,
        status: 400,
        body: {
          error: 'invalid-request',
          detail: { reason: 'The upstream refused portfolio.create with outcome INVALID_REQUEST.' },
        },
      },
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('pp-create');
    await fillFirstRow(user, 'INFY');
    await user.click(screen.getByTestId('pp-create'));

    expect(await screen.findByTestId('pp-not-found')).toHaveTextContent('The portfolio was not created (HTTP 400).');
    expect(screen.getByTestId('pp-not-found')).toHaveTextContent('will not be recreated');
    // Known-removed: no editor and no create action remain.
    expect(screen.queryByLabelText('Symbol')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pp-create')).not.toBeInTheDocument();
  });

  it('offers no creation while the persistence service is unavailable', async () => {
    mockSequence([{ ok: false, status: 503, body: { error: 'upstream-unavailable' } }]);
    renderPage();
    expect(await screen.findByTestId('pp-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('pp-create')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Symbol')).not.toBeInTheDocument();
  });

  it('re-reads before creating and refuses to create when the re-read is not a clean 404', async () => {
    mockSequence([
      { ok: false, status: 404, body: { error: 'not-found' } },
      { ok: false, status: 503, body: { error: 'upstream-unavailable' } },
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('pp-create');
    await fillFirstRow(user, 'INFY');
    await user.click(screen.getByTestId('pp-create'));

    // The service went away between the press and the create, so nothing was created
    // and the owner is told the outcome is unknown rather than left with a silent no-op.
    expect(await screen.findByTestId('state-error')).toHaveTextContent('could not be verified');
    expect(screen.queryByTestId('pp-create')).not.toBeInTheDocument();
  });

  it('edited holdings save and the new revision survives a reload', async () => {
    const SAVED: UserPortfolioView = {
      ...VIEW,
      revision: 8,
      totalMarketValue: 50000,
      holdings: [{ ...VIEW.holdings[0], quantity: 20, marketValue: 50000 }],
    };
    mockSequence([
      { ok: true, status: 200, body: { portfolio: VIEW } },
      {
        ok: true,
        status: 200,
        body: {
          success: true,
          isDuplicate: false,
          disposition: 'MERGED_INTO_EXISTING',
          revision: 8,
          holdingsSavedCount: 1,
          totalMarketValue: 50000,
          weightSumPercentage: 100,
          savedAt: '2026-11-12T00:00:00.000Z',
          provenanceDigest: 'c'.repeat(64),
          portfolio: SAVED,
        },
      },
      { ok: true, status: 200, body: { portfolio: SAVED } },
    ]);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Quantity'));
    await user.type(screen.getByLabelText('Quantity'), '20');
    await user.click(screen.getByTestId('pp-save'));

    expect(await screen.findByTestId('pp-saved')).toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('8');

    // Reload re-reads the saved revision rather than resetting to the stale value.
    await user.click(screen.getByTestId('pp-reload'));
    expect(await screen.findByTestId('pp-revision')).toHaveTextContent('8');
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
  });
});
