/**
 * LIVE multi-portfolio regression harness for the Personal Portfolio (verification-only).
 *
 * This is not a component test. It boots the REAL IPD IPC server (compiled from the
 * authoritative IPD checkout, read-only) over a real unix socket, composes the REAL IRR
 * transport as the HTTP layer, and then drives the REAL `PersonalPortfolio` React
 * component — the same module the application routes to — with fetch routed to that live
 * HTTP server. Persistence is a real SQLite store, so revisions, weights, digests,
 * identifier admission and tombstone rules are the provider's, not the test's.
 *
 * It exists because multi-portfolio support is a claim about the provider's behaviour as
 * much as the client's: a mocked test can show the UI rendering two rows, but only the
 * real stack can show that two portfolios hold independent revisions, that deleting one
 * leaves the other byte-identical, and that a removed identifier is refused forever.
 *
 * Scenarios:
 *   1. two portfolios are created through the UI under distinct fresh identifiers;
 *   2. a sibling portfolio without the personal prefix (standing in for a broker import
 *      such as DHAN_PORTFOLIO) is excluded from the manager and left untouched;
 *   3. editing and saving one leaves the other's revision and holdings intact;
 *   4. a reload re-reads both, with revisions preserved;
 *   5. deleting one is isolated: the sibling survives, the deleted id is retired;
 *   6. a new portfolio is created after the delete under a fresh identifier;
 *   7. the provider still refuses the retired identifier;
 *   8. the sibling is unchanged by every operation above.
 */
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'node:http';
import { PersonalPortfolio } from '../../../frontend/src/features/personal-portfolio/PersonalPortfolio';
import { handleUserPortfolioRequest } from '../../../frontend/server/user-portfolio-transport';

/**
 * The IPD IPC socket is provided by the sidecar started by run-live-lifecycle.sh.
 */
const IPC_PATH = process.env.LIVE_IPC_PATH;
if (!IPC_PATH) throw new Error('LIVE_IPC_PATH must be set by run-live-lifecycle.sh');

/** A sibling that stands in for a broker-import portfolio at the filtering boundary. */
const BROKER_SIBLING_ID = 'DHAN_PORTFOLIO';

let started: { close: () => Promise<void> }[] = [];
let liveBase = '';
/** Set by scenario 5: the identifier that the delete retired. */
let retiredId = '';
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

interface Detail {
  readonly revision: number;
  readonly symbols: readonly string[];
  readonly quantity: number;
}

const readDetail = async (id: string): Promise<Detail | null> => {
  if (!id) throw new Error('readDetail: no portfolio id — the list has not rendered yet');
  const res = await fetch(`${liveBase}/api/user-portfolios/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  expect(res.ok).toBe(true);
  const body = (await res.json()) as {
    portfolio: { revision: number; holdings: { symbol: string; quantity: number }[] };
  };
  return {
    revision: body.portfolio.revision,
    symbols: body.portfolio.holdings.map((h) => h.symbol),
    quantity: body.portfolio.holdings[0]?.quantity ?? 0,
  };
};

/**
 * Waits until the page is quiescent.
 *
 * The IPC endpoint serves one connection at a time, so a direct read issued while the
 * page still has a request in flight would collide and surface as a 503 that has
 * nothing to do with what is being asserted. The summary's revision only renders once
 * the selected portfolio's detail read has completed, so waiting for it guarantees the
 * page is idle.
 */
const settle = async () => {
  await waitFor(() => expect(screen.getByTestId('pp-revision')).toBeInTheDocument());
  // The page also issues a trailing list refresh after a create, save or delete, and a
  // read issued while that is still in flight would collide at the single-connection
  // endpoint. Probe until the endpoint answers cleanly: that is the observable signal
  // that the page is idle and the assertions that follow measure the page, not a race.
  await waitFor(async () => {
    const probe = await fetch(`${liveBase}/api/user-portfolios`);
    expect(probe.ok).toBe(true);
  }, { timeout: 10_000, interval: 150 });
};

const listedIds = () =>
  within(screen.getByTestId('pp-list'))
    .queryAllByRole('button')
    .map((b) => b.getAttribute('data-testid')?.replace('pp-select-', ''))
    .filter((v): v is string => Boolean(v));

beforeAll(async () => {
  liveBase = await startIrr({
    IIPS_G3_IPC_BINDING_PROVISIONED: 'true',
    IIPS_G2_IPC_ENDPOINT: IPC_PATH,
    IIPS_LOCAL_PERSONAL_USE: '1',
  });

  // Seed the sibling BEFORE the page mounts, so the manager must exclude it from the
  // first list read rather than simply never having seen it.
  const seeded = await fetch(`${liveBase}/api/user-portfolios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      portfolioId: BROKER_SIBLING_ID,
      portfolioName: 'Dhan import',
      holdings: [{ symbol: 'TCS', quantity: 5, averageBuyPrice: 3000, currentPrice: 3100, active: true }],
    }),
  });
  expect(seeded.status).toBe(201);

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

/** Creates a portfolio through the UI: name it, fill one row, submit. */
const createPortfolio = async (user: ReturnType<typeof userEvent.setup>, name: string, symbol: string) => {
  await user.click(screen.getByTestId('pp-create'));
  await user.type(screen.getByTestId('pp-new-name'), name);
  await user.type(screen.getByLabelText('Symbol'), symbol);
  await user.type(screen.getByLabelText('Quantity'), '10');
  await user.type(screen.getByLabelText('Average buy price'), '100');
  await user.type(screen.getByLabelText('Current price'), '110');
  await user.click(screen.getByTestId('pp-create-submit'));
};

describe('Personal Portfolio — live multi-portfolio lifecycle (real IPD + real transport)', () => {
  it('1. creates two portfolios through the UI under distinct fresh identifiers', async () => {
    const user = userEvent.setup();
    renderLive();
    await screen.findByTestId('pp-list');

    await createPortfolio(user, 'Retirement', 'INFY');
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('1'));
    await settle();

    await createPortfolio(user, 'Trading', 'RELIANCE');
    await waitFor(() => expect(listedIds()).toHaveLength(2));
    await settle();

    const ids = listedIds();
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) {
      expect(id).toMatch(/^PERSONAL-/);
      expect(id).not.toBe('DEFAULT_PORTFOLIO');
    }
  });

  it('2. excludes the broker-import sibling and reports it as untouched', async () => {
    renderLive();
    await screen.findByTestId('pp-list');
    await waitFor(() => expect(listedIds()).toHaveLength(2));
    await settle();

    // The sibling exists on the binding but is never listed or selectable.
    expect(listedIds()).not.toContain(BROKER_SIBLING_ID);
    const note = screen.getByTestId('pp-other-count');
    expect(note).toHaveTextContent('1 other portfolio');
    expect(note).toHaveTextContent(BROKER_SIBLING_ID);
  });

  it('3. saving one portfolio leaves the other untouched', async () => {
    const before = await readDetail(BROKER_SIBLING_ID);
    renderLive();
    await screen.findByTestId('pp-list');
    await waitFor(() => expect(listedIds()).toHaveLength(2));
    await settle();

    const ids = listedIds();
    const first = ids[0];
    const second = ids[1];
    const secondBefore = await readDetail(second);

    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Quantity'));
    await user.type(screen.getByLabelText('Quantity'), '42');
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('2'));
    await settle();

    // The saved portfolio advanced…
    const firstAfter = await readDetail(first);
    expect(firstAfter?.revision).toBe(2);
    expect(firstAfter?.quantity).toBe(42);

    // …and the sibling kept its own revision, holdings and quantity.
    const secondAfter = await readDetail(second);
    expect(secondAfter?.revision).toBe(secondBefore?.revision);
    expect(secondAfter?.symbols).toEqual(secondBefore?.symbols);

    // The broker-import sibling was never written to either.
    expect(await readDetail(BROKER_SIBLING_ID)).toEqual(before);
  });

  it('4. a reload re-reads both portfolios with their revisions preserved', async () => {
    renderLive();
    await screen.findByTestId('pp-list');
    await waitFor(() => expect(listedIds()).toHaveLength(2));
    await settle();
    const ids = listedIds();
    const revisionBefore = await readDetail(ids[0]);

    const user = userEvent.setup();
    await user.click(screen.getByTestId('pp-reload'));
    await waitFor(() => expect(listedIds()).toHaveLength(2));
    await settle();

    expect(await readDetail(ids[0])).toEqual(revisionBefore);
    expect(listedIds().sort()).toEqual(ids.slice().sort());
  });

  it('5. deleting one portfolio is isolated and retires its identifier', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    const user = userEvent.setup();
    renderLive();
    await screen.findByTestId('pp-list');
    await waitFor(() => expect(listedIds()).toHaveLength(2));
    await settle();

    const ids = listedIds();
    const doomed = ids[0];
    const survivor = ids[1];
    retiredId = doomed;
    const survivorBefore = await readDetail(survivor);

    await user.click(screen.getByTestId('pp-delete'));
    await waitFor(() => expect(listedIds()).toHaveLength(1));
    await settle();

    // Isolation: the survivor is byte-identical to before the delete.
    expect(await readDetail(survivor)).toEqual(survivorBefore);
    expect(listedIds()).toEqual([survivor]);

    // The removed identifier is gone from the provider, not merely from the UI.
    expect(await readDetail(doomed)).toBeNull();
    vi.unstubAllGlobals();
  });

  it('6. a new portfolio is created after the delete, under a fresh identifier', async () => {
    const user = userEvent.setup();
    renderLive();
    await screen.findByTestId('pp-list');
    await waitFor(() => expect(listedIds()).toHaveLength(1));
    await settle();
    const survivor = listedIds()[0];

    await createPortfolio(user, 'Fresh start', 'HDFC');
    await waitFor(() => expect(listedIds()).toHaveLength(2));
    await settle();

    const fresh = listedIds().find((id) => id !== survivor);
    expect(fresh).toBeDefined();
    expect(fresh).toMatch(/^PERSONAL-/);
    expect(await readDetail(String(fresh))).toMatchObject({ revision: 1, symbols: ['HDFC'] });
  });

  it('7. the provider still refuses the retired identifier', async () => {
    renderLive();
    await screen.findByTestId('pp-list');
    await waitFor(() => expect(listedIds()).toHaveLength(2));
    await settle();

    expect(retiredId).toMatch(/^PERSONAL-/);
    // The identifier retired in scenario 5 can never be re-created.
    const res = await fetch(`${liveBase}/api/user-portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolioId: retiredId,
        portfolioName: 'Should not exist',
        holdings: [{ symbol: 'X', quantity: 1, averageBuyPrice: 1, currentPrice: 1, active: true }],
      }),
    });
    expect(res.status).toBe(400);
    // And it is still unreadable: nothing was recreated.
    expect(await readDetail(retiredId)).toBeNull();
  });

  it('8. the broker-import sibling is unchanged by every operation above', async () => {
    const sibling = await readDetail(BROKER_SIBLING_ID);
    // Seeded in beforeAll with revision 1 and a single TCS holding of quantity 5.
    expect(sibling).toEqual({ revision: 1, symbols: ['TCS'], quantity: 5 });
  });
});
