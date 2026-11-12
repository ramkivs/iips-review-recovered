/**
 * LIVE lifecycle regression harness for the Personal Portfolio (verification-only).
 *
 * This is not a component test. It boots the REAL IPD IPC server (compiled from the
 * authoritative IPD `main`, read-only checkout) over a real unix socket, composes the
 * REAL IRR transport as the HTTP layer, and then drives the REAL `PersonalPortfolio`
 * React component — the same module the application routes to — with fetch routed to
 * that live HTTP server. Persistence is a real SQLite store, so revisions, weights,
 * digests and tombstone rules are the provider's, not the test's.
 *
 * It exists because the regression was reported against real behaviour, and a mocked
 * component test cannot show whether a portfolio the owner already saved still loads,
 * edits, saves and survives a reload behind the provider's own rules.
 *
 * Scenarios:
 *   1. genuine first-time creation through the editor;
 *   2. the existing portfolio loads with its revision and holdings intact;
 *   3. edit → save → revision increments; holdings are preserved;
 *   4. reload re-reads the saved revision (no reset to a stale baseline);
 *   5. add and remove rows round-trip through the provider;
 *   6. delete → the identifier is tombstoned and creation is no longer offered;
 *   7. the provider refuses a re-create of the tombstoned identifier (never silent);
 *   8. an inaccessible service (no binding) offers no creation at all.
 */
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'node:http';
import { PersonalPortfolio } from '../../../frontend/src/features/personal-portfolio/PersonalPortfolio';
import { handleUserPortfolioRequest } from '../../../frontend/server/user-portfolio-transport';

/**
 * The IPD IPC socket is provided by the sidecar started by run-live-lifecycle.sh. The
 * harness composes the REAL IRR transport over it and renders the REAL component
 * against that transport, so every rule exercised below is the provider's own.
 */
const IPC_PATH = process.env.LIVE_IPC_PATH;
if (!IPC_PATH) throw new Error('LIVE_IPC_PATH must be set by run-live-lifecycle.sh');

let started: { close: () => Promise<void> }[] = [];
let liveBase = '';
const originalFetch = globalThis.fetch;

const startIrr = async (env: NodeJS.ProcessEnv) => {
  const server = createServer((req, res) => {
    void handleUserPortfolioRequest(req, res, { env });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const close = () => new Promise<void>((r) => server.close(() => r()));
  started.push({ close });
  return `http://127.0.0.1:${(server.address() as { port: number }).port}`;
};

beforeAll(async () => {
  liveBase = await startIrr({
    IIPS_G3_IPC_BINDING_PROVISIONED: 'true',
    IIPS_G2_IPC_ENDPOINT: IPC_PATH,
    IIPS_LOCAL_PERSONAL_USE: '1',
  });
  // The component fetches same-origin relative paths; route them at the live server.
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return originalFetch(url.startsWith('/') ? `${liveBase}${url}` : url, init);
  }) as typeof globalThis.fetch;
});

afterAll(async () => {
  globalThis.fetch = originalFetch;
  for (const s of started.reverse()) await s.close();
});

beforeEach(() => cleanup());

const renderLive = () =>
  render(
    <MemoryRouter initialEntries={['/personal-portfolio']}>
      <PersonalPortfolio />
    </MemoryRouter>,
  );

const fillRow = async (user: ReturnType<typeof userEvent.setup>, symbol: string, qty: string, avg: string, cur: string) => {
  await user.type(screen.getByLabelText('Symbol'), symbol);
  await user.type(screen.getByLabelText('Quantity'), qty);
  await user.type(screen.getByLabelText('Average buy price'), avg);
  await user.type(screen.getByLabelText('Current price'), cur);
};

describe('Personal Portfolio — live provider lifecycle (real IPD + real transport)', () => {
  it('1. creates a genuinely new portfolio through the editor and adopts the provider revision', async () => {
    const user = userEvent.setup();
    renderLive();
    // Fresh store: the read legitimately answers 404.
    expect(await screen.findByTestId('pp-not-found')).toHaveTextContent('does not distinguish');
    expect(screen.getByTestId('pp-create')).toBeInTheDocument();

    await fillRow(user, 'RELIANCE', '10', '2400', '2500');
    await user.click(screen.getByTestId('pp-create'));

    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('1'));
    expect(screen.getByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.queryByTestId('pp-create')).not.toBeInTheDocument();
    expect(screen.getByTestId('pp-save')).toBeInTheDocument();
  });

  it('2. the existing portfolio loads with its revision and holdings intact', async () => {
    renderLive();
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('1');
    expect(screen.getByLabelText('Quantity')).toHaveValue('10');
    expect(screen.queryByTestId('pp-not-found')).not.toBeInTheDocument();
  });

  it('3. editing and saving increments the revision and preserves the holdings', async () => {
    const user = userEvent.setup();
    renderLive();
    await screen.findByDisplayValue('RELIANCE');
    await user.clear(screen.getByLabelText('Quantity'));
    await user.type(screen.getByLabelText('Quantity'), '20');
    await user.click(screen.getByTestId('pp-save'));

    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('2'));
    expect(screen.getByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toHaveValue('20');
  });

  it('4. a reload re-reads the saved revision rather than a stale baseline', async () => {
    const user = userEvent.setup();
    renderLive();
    await screen.findByDisplayValue('RELIANCE');
    await user.click(screen.getByTestId('pp-reload'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('2'));
    expect(screen.getByLabelText('Quantity')).toHaveValue('20');
  });

  it('5. adding and removing rows round-trip through the provider', async () => {
    const user = userEvent.setup();
    renderLive();
    await screen.findByDisplayValue('RELIANCE');
    await user.click(screen.getByRole('button', { name: 'Add row' }));
    const symbols = screen.getAllByLabelText('Symbol');
    expect(symbols).toHaveLength(2);
    await user.type(symbols[1], 'INFY');
    const quantities = screen.getAllByLabelText('Quantity');
    await user.type(quantities[1], '25');
    await user.type(screen.getAllByLabelText('Average buy price')[1], '1500');
    await user.type(screen.getAllByLabelText('Current price')[1], '1400');
    await user.click(screen.getByTestId('pp-save'));

    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('3'));
    expect(screen.getAllByLabelText('Symbol')).toHaveLength(2);
    expect(screen.getByDisplayValue('INFY')).toBeInTheDocument();

    // Remove the row the provider just stored and save again. The row is located by
    // its symbol: the provider is free to return holdings in its own order.
    const infyRow = screen.getByDisplayValue('INFY').closest('tr') as HTMLElement;
    await user.click(within(infyRow).getByRole('button', { name: 'Remove row' }));
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('4'));
    expect(screen.getAllByLabelText('Symbol')).toHaveLength(1);
    expect(screen.queryByDisplayValue('INFY')).not.toBeInTheDocument();
  });

  it('6. deleting tombstones the identifier: creation is no longer offered', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmSpy);
    renderLive();
    await screen.findByDisplayValue('RELIANCE');
    await user.click(screen.getByTestId('pp-delete'));

    await waitFor(() =>
      expect(screen.getByTestId('pp-not-found')).toHaveTextContent('must not be silently recreated'),
    );
    expect(screen.queryByTestId('pp-create')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Symbol')).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('7. the provider does not silently re-create the tombstoned identifier', async () => {
    // Directly at the transport: the provider itself refuses, so the client's refusal
    // to offer creation reflects a real capability rather than a local assumption.
    const res = await fetch(`${liveBase}/api/user-portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolioName: 'My Portfolio',
        holdings: [{ symbol: 'RELIANCE', quantity: 10, averageBuyPrice: 2400, currentPrice: 2500, active: true }],
      }),
    });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);

    // And the identifier is still not readable: nothing was recreated.
    const read = await fetch(`${liveBase}/api/user-portfolios/DEFAULT_PORTFOLIO`);
    expect(read.status).toBe(404);
  });

  it('8. an inaccessible service offers no creation at all', async () => {
    // A second IRR transport whose owner-binding precondition is absent: the 503 is a
    // configuration state, not an empty portfolio, so no editor and no create action.
    // No binding precondition is provisioned, so the transport must fail closed with 503.
    const base = await startIrr({ IIPS_G2_IPC_ENDPOINT: `${IPC_PATH}.does-not-exist` });
    const realFetch = globalThis.fetch;
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      return realFetch(url.startsWith('/') ? `${base}${url}` : url, init);
    }) as typeof globalThis.fetch;

    try {
      renderLive();
      expect(await screen.findByTestId('pp-unavailable')).toBeInTheDocument();
      expect(screen.queryByTestId('pp-create')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Symbol')).not.toBeInTheDocument();
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
