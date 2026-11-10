/**
 * Personal Portfolio — editor surface tests (local single-user path only).
 *
 * The transport/IPC boundary is mocked at the fetch boundary exactly like the
 * certified workspace tests; the server-owned values (revision, totals, digests)
 * are taken from the mocked responses, never computed here.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('creates the portfolio on first save when none exists', async () => {
    const fetchMock = mockSequence([
      { ok: false, status: 404, body: { error: 'not-found' } }, // initial GET
      { ok: true, status: 201, body: { portfolio: { ...VIEW, revision: 1 } } }, // POST create
    ]);
    const user = userEvent.setup();
    renderPage();
    const symbol = await screen.findByLabelText('Symbol');
    await user.type(symbol, 'INFY');
    await user.type(screen.getByLabelText('Quantity'), '25');
    await user.type(screen.getByLabelText('Average buy price'), '1500');
    await user.type(screen.getByLabelText('Current price'), '1400');
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-saved')).toBeInTheDocument());
    const createCall = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(createCall[0]).toBe('/api/user-portfolios');
    expect(createCall[1].method).toBe('POST');
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('1');
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

  it('deletes the portfolio after explicit confirmation and returns to the empty editor', async () => {
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
    expect(screen.getByTestId('pp-save')).toHaveTextContent('Create portfolio');
  });

  it('rejects an invalid row client-side before any request is made', async () => {
    const fetchMock = mockSequence([{ ok: false, status: 404, body: { error: 'not-found' } }]);
    renderPage();
    await screen.findByLabelText('Symbol');
    // The single blank row: the save button must stay disabled until the row is valid.
    expect(screen.getByTestId('pp-save')).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the initial load
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

  it('an absent portfolio is a create form, never the unavailable banner', async () => {
    mockSequence([{ ok: false, status: 404, body: { error: 'not-found' } }]);
    renderPage();
    expect(await screen.findByTestId('pp-save')).toHaveTextContent('Create portfolio');
    expect(screen.queryByTestId('pp-unavailable')).not.toBeInTheDocument();
    // No invented holdings: exactly one blank row.
    expect(screen.getAllByLabelText('Symbol')).toHaveLength(1);
    expect((screen.getByLabelText('Symbol') as HTMLInputElement).value).toBe('');
  });
});
