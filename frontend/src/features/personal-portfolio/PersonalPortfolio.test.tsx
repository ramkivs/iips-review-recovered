/**
 * Personal Portfolio — multi-portfolio surface tests (local single-user path only).
 *
 * The transport/IPC boundary is mocked at the fetch boundary exactly like the certified
 * workspace tests; the server-owned values (revision, totals, digests) are taken from the
 * mocked responses, never computed here.
 *
 * The mock is a PROVIDER MODEL, not a canned sequence: it keeps its own store, refuses a
 * duplicate or tombstoned identifier with 400, answers 404 for an absent portfolio and
 * increments revisions on save. That is what lets these tests assert the client's
 * behaviour — that it never overwrites, never reuses a removed identifier, and keeps
 * portfolios independent — rather than merely asserting that it renders whatever it is
 * handed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { PersonalPortfolio } from './PersonalPortfolio';
import type { UserPortfolioHolding, UserPortfolioView } from '../../api/userPortfolios';

/* ------------------------------------------------------------------ *
 * A provider model
 * ------------------------------------------------------------------ */

interface Seed {
  readonly id: string;
  readonly name: string;
  readonly revision: number;
  readonly symbols: readonly string[];
}

const holding = (symbol: string, quantity: number): UserPortfolioHolding => ({
  symbol,
  companyId: `MANUAL:${symbol}`,
  quantity,
  averageBuyPrice: 100,
  currentPrice: 110,
  marketValue: quantity * 110,
  weightPercentage: 100,
  active: true,
  sourceBroker: 'manual-personal',
  lineageDigest: 'a'.repeat(64),
  identityStatus: 'UNRESOLVED',
  resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS',
});

const viewOf = (id: string, name: string, revision: number, symbols: readonly string[]): UserPortfolioView => ({
  portfolioId: id,
  portfolioName: name,
  revision,
  holdings: symbols.map((s, i) => holding(s, 10 + i)),
  totalMarketValue: symbols.reduce((sum, _s, i) => sum + (10 + i) * 110, 0),
  totalHoldingsCount: symbols.length,
  weightSumPercentage: symbols.length === 0 ? 0 : 100,
  lastUpdated: '2026-11-12T00:00:00.000Z',
  provenanceDigest: 'b'.repeat(64),
  isSaved: true,
  contributions: [],
});

interface Call { readonly method: string; readonly url: string; readonly body?: Record<string, unknown> }

function mockProvider(seeds: readonly Seed[]) {
  const store = new Map<string, Seed>(seeds.map((s) => [s.id, s]));
  const tombstoned = new Set<string>();
  const calls: Call[] = [];
  const json = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

  const list = () => [...store.values()].map((p) => ({
    portfolioId: p.id,
    portfolioName: p.name,
    revision: p.revision,
    totalMarketValue: p.symbols.reduce((sum, _s, i) => sum + (10 + i) * 110, 0),
    totalHoldingsCount: p.symbols.length,
    weightSumPercentage: p.symbols.length === 0 ? 0 : 100,
    lastUpdated: '2026-11-12T00:00:00.000Z',
    provenanceDigest: 'b'.repeat(64),
    isSaved: true,
  }));

  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? 'GET';
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : undefined;
    calls.push({ method, url, body });

    if (method === 'GET' && url === '/api/user-portfolios') return json(200, { portfolios: list() });

    if (method === 'POST' && url === '/api/user-portfolios') {
      const proposed = body?.portfolioId;
      if (typeof proposed !== 'string' || tombstoned.has(proposed) || store.has(proposed)) {
        return json(400, { error: 'invalid-request', detail: { reason: 'portfolio already exists' } });
      }
      const created: Seed = {
        id: proposed,
        name: String(body?.portfolioName ?? proposed),
        revision: 1,
        symbols: (body?.holdings as { symbol: string }[] | undefined)?.map((h) => h.symbol) ?? [],
      };
      store.set(proposed, created);
      return json(201, { portfolio: viewOf(created.id, created.name, created.revision, created.symbols) });
    }

    const detail = /^\/api\/user-portfolios\/([^/]+)$/.exec(url);
    if (detail) {
      const id = decodeURIComponent(detail[1]);
      const p = store.get(id);
      if (!p) return json(404, { error: 'not-found' });
      if (method === 'GET') return json(200, { portfolio: viewOf(p.id, p.name, p.revision, p.symbols) });
      if (method === 'DELETE') {
        const guard = Number(body?.expectedRevision);
        if (guard !== p.revision) return json(409, { error: 'revision-conflict' });
        store.delete(id);
        tombstoned.add(id);
        return json(200, { portfolioId: id, deletedAt: '2026-11-12T00:00:00.000Z' });
      }
    }

    const save = /^\/api\/user-portfolios\/([^/]+)\/holdings$/.exec(url);
    if (save && method === 'PUT') {
      const id = decodeURIComponent(save[1]);
      const p = store.get(id);
      if (!p) return json(404, { error: 'not-found' });
      const guard = Number(body?.expectedRevision);
      if (guard !== p.revision) return json(409, { error: 'revision-conflict' });
      const symbols = (body?.holdings as { symbol: string }[] | undefined)?.map((h) => h.symbol) ?? [];
      const next: Seed = { ...p, revision: p.revision + 1, symbols };
      store.set(id, next);
      return json(200, {
        success: true,
        isDuplicate: false,
        disposition: 'MERGED_INTO_EXISTING',
        revision: next.revision,
        holdingsSavedCount: symbols.length,
        totalMarketValue: next.symbols.reduce((sum, _s, i) => sum + (10 + i) * 110, 0),
        weightSumPercentage: 100,
        savedAt: '2026-11-12T00:00:00.000Z',
        provenanceDigest: 'c'.repeat(64),
        portfolio: viewOf(next.id, next.name, next.revision, next.symbols),
      });
    }

    return json(404, { error: 'not-found' });
  }) as never;

  return { calls, store, tombstoned, seed: (s: Seed) => store.set(s.id, s) };
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/personal-portfolio']}>
      <PersonalPortfolio />
    </MemoryRouter>,
  );

const fillRow = async (user: ReturnType<typeof userEvent.setup>, symbol: string) => {
  await user.type(screen.getByLabelText('Symbol'), symbol);
  await user.type(screen.getByLabelText('Quantity'), '10');
  await user.type(screen.getByLabelText('Average buy price'), '100');
  await user.type(screen.getByLabelText('Current price'), '110');
};

/** Opens the create form, names the portfolio and adds one holding row. */
const composeNewPortfolio = async (user: ReturnType<typeof userEvent.setup>, name: string, symbol: string) => {
  await user.click(screen.getByTestId('pp-create'));
  await user.type(screen.getByTestId('pp-new-name'), name);
  await fillRow(user, symbol);
};

const listIds = () =>
  within(screen.getByTestId('pp-list'))
    .queryAllByRole('button')
    .map((b) => b.getAttribute('data-testid')?.replace('pp-select-', ''))
    .filter((v): v is string => Boolean(v));

beforeEach(() => {
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------ *
 * 1. Listing and selection
 * ------------------------------------------------------------------ */

describe('Personal Portfolio — listing and selection', () => {
  it('lists the personal portfolios and opens the first one', async () => {
    mockProvider([
      { id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 3, symbols: ['INFY'] },
      { id: 'PERSONAL-bbbb-2222', name: 'Trading', revision: 1, symbols: ['RELIANCE'] },
    ]);
    renderPage();
    expect(await screen.findByDisplayValue('INFY')).toBeInTheDocument();
    expect(listIds()).toEqual(['PERSONAL-aaaa-1111', 'PERSONAL-bbbb-2222']);
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('3');
  });

  it('switches selection and loads that portfolio independently', async () => {
    mockProvider([
      { id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 3, symbols: ['INFY'] },
      { id: 'PERSONAL-bbbb-2222', name: 'Trading', revision: 1, symbols: ['RELIANCE'] },
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');

    await user.click(screen.getByTestId('pp-select-PERSONAL-bbbb-2222'));
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('1');
    expect(screen.queryByDisplayValue('INFY')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no personal portfolios', async () => {
    mockProvider([]);
    renderPage();
    expect(await screen.findByTestId('pp-list-empty')).toHaveTextContent('No personal portfolios yet');
    expect(screen.getByTestId('pp-no-selection')).toBeInTheDocument();
  });

  it('excludes broker-import portfolios and reports them as untouched', async () => {
    mockProvider([
      { id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 1, symbols: ['INFY'] },
      { id: 'DHAN_PORTFOLIO', name: 'Dhan import', revision: 9, symbols: ['TCS'] },
    ]);
    renderPage();
    expect(await screen.findByDisplayValue('INFY')).toBeInTheDocument();
    // The broker-import portfolio is never listed, never selected and never opened.
    expect(listIds()).toEqual(['PERSONAL-aaaa-1111']);
    const note = await screen.findByTestId('pp-other-count');
    expect(note).toHaveTextContent('1 other portfolio');
    expect(note).toHaveTextContent('DHAN_PORTFOLIO');
    expect(note).toHaveTextContent('untouched');
  });
});

/* ------------------------------------------------------------------ *
 * 2. Creating multiple portfolios with unique identifiers
 * ------------------------------------------------------------------ */

describe('Personal Portfolio — creating multiple portfolios', () => {
  it('creates two portfolios with distinct, fresh identifiers', async () => {
    const { calls } = mockProvider([]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('pp-list-empty');

    await composeNewPortfolio(user, 'Retirement', 'INFY');
    await user.click(screen.getByTestId('pp-create-submit'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('1'));

    await composeNewPortfolio(user, 'Trading', 'RELIANCE');
    await user.click(screen.getByTestId('pp-create-submit'));
    await waitFor(() => expect(listIds()).toHaveLength(2));

    const creates = calls.filter((c) => c.method === 'POST' && c.url === '/api/user-portfolios');
    expect(creates).toHaveLength(2);
    const [first, second] = creates.map((c) => String(c.body?.portfolioId));
    // Every create proposes an identifier, none is the retired default, and no two match.
    expect(first).toMatch(/^PERSONAL-[0-9a-f-]{36}$/);
    expect(second).toMatch(/^PERSONAL-[0-9a-f-]{36}$/);
    expect(first).not.toBe(second);
    expect(creates.some((c) => String(c.body?.portfolioId) === 'DEFAULT_PORTFOLIO')).toBe(false);
  });

  it('never proposes DEFAULT_PORTFOLIO, and never omits an identifier', async () => {
    const { calls } = mockProvider([]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('pp-list-empty');
    await composeNewPortfolio(user, 'Alpha', 'INFY');
    await user.click(screen.getByTestId('pp-create-submit'));
    await waitFor(() => expect(listIds()).toHaveLength(1));

    const create = calls.find((c) => c.method === 'POST' && c.url === '/api/user-portfolios');
    expect(create?.body?.portfolioId).toBeDefined();
    expect(create?.body?.portfolioId).not.toBe('DEFAULT_PORTFOLIO');
  });

  it('requires a name before a portfolio can be created', async () => {
    const { calls } = mockProvider([]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('pp-list-empty');
    await user.click(screen.getByTestId('pp-create'));
    await fillRow(user, 'INFY');
    expect(screen.getByTestId('pp-create-submit')).toBeDisabled();
    expect(calls.filter((c) => c.method === 'POST')).toHaveLength(0);
  });

  it('surfaces a provider refusal instead of silently retrying the same identifier', async () => {
    const provider = mockProvider([]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('pp-list-empty');

    // Force the provider to refuse the next proposed identifier.
    provider.seed({ id: 'REFUSED', name: 'x', revision: 1, symbols: [] });
    const realFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (init?.method === 'POST' && url === '/api/user-portfolios') {
        return { ok: false, status: 400, json: async () => ({ error: 'invalid-request', detail: { reason: 'refused' } }) };
      }
      return (realFetch as (i: RequestInfo | URL, o?: RequestInit) => Promise<Response>)(input, init);
    }) as never;

    await composeNewPortfolio(user, 'Doomed', 'INFY');
    await user.click(screen.getByTestId('pp-create-submit'));
    expect(await screen.findByTestId('state-error')).toHaveTextContent('The portfolio was not created (HTTP 400).');
  });
});

/* ------------------------------------------------------------------ *
 * 3. Independent edit / save / reload
 * ------------------------------------------------------------------ */

describe('Personal Portfolio — portfolios stay independent', () => {
  const seeds: readonly Seed[] = [
    { id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 4, symbols: ['INFY'] },
    { id: 'PERSONAL-bbbb-2222', name: 'Trading', revision: 2, symbols: ['RELIANCE'] },
  ];

  it('saving one portfolio leaves the other untouched', async () => {
    const { store } = mockProvider(seeds);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');

    await user.clear(screen.getByLabelText('Quantity'));
    await user.type(screen.getByLabelText('Quantity'), '42');
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('5'));

    // The saved portfolio advanced; the other kept its own revision and holdings.
    expect(store.get('PERSONAL-aaaa-1111')?.revision).toBe(5);
    expect(store.get('PERSONAL-bbbb-2222')?.revision).toBe(2);
    expect(store.get('PERSONAL-bbbb-2222')?.symbols).toEqual(['RELIANCE']);

    await user.click(screen.getByTestId('pp-select-PERSONAL-bbbb-2222'));
    expect(await screen.findByDisplayValue('RELIANCE')).toBeInTheDocument();
    expect(screen.getByTestId('pp-revision')).toHaveTextContent('2');
  });

  it('each portfolio saves against its own revision guard', async () => {
    const { calls } = mockProvider(seeds);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('5'));
    const save = calls.find((c) => c.method === 'PUT');
    expect(save?.url).toBe('/api/user-portfolios/PERSONAL-aaaa-1111/holdings');
    expect(save?.body?.expectedRevision).toBe(4);

    await user.click(screen.getByTestId('pp-select-PERSONAL-bbbb-2222'));
    await screen.findByDisplayValue('RELIANCE');
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('3'));
    const second = calls.filter((c) => c.method === 'PUT').pop();
    expect(second?.url).toBe('/api/user-portfolios/PERSONAL-bbbb-2222/holdings');
    expect(second?.body?.expectedRevision).toBe(2);
  });

  it('a reload re-reads the saved revision for the selected portfolio', async () => {
    mockProvider(seeds);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('5'));
    await user.click(screen.getByTestId('pp-reload'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('5'));
    expect(screen.getByDisplayValue('INFY')).toBeInTheDocument();
  });

  it('adding and removing rows round-trips through the provider', async () => {
    const { store } = mockProvider(seeds);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');

    await user.click(screen.getByRole('button', { name: 'Add row' }));
    const symbols = screen.getAllByLabelText('Symbol');
    await user.type(symbols[1], 'TCS');
    await user.type(screen.getAllByLabelText('Quantity')[1], '5');
    await user.type(screen.getAllByLabelText('Average buy price')[1], '100');
    await user.type(screen.getAllByLabelText('Current price')[1], '110');
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('5'));
    expect([...(store.get('PERSONAL-aaaa-1111')?.symbols ?? [])].sort()).toEqual(['INFY', 'TCS']);

    const tcsRow = screen.getByDisplayValue('TCS').closest('tr') as HTMLElement;
    await user.click(within(tcsRow).getByRole('button', { name: 'Remove row' }));
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('6'));
    expect(store.get('PERSONAL-aaaa-1111')?.symbols).toEqual(['INFY']);
  });
});

/* ------------------------------------------------------------------ *
 * 4/5. Deletion isolation and creation after deletion
 * ------------------------------------------------------------------ */

describe('Personal Portfolio — deletion, tombstone protection and fresh creation', () => {
  const seeds: readonly Seed[] = [
    { id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 2, symbols: ['INFY'] },
    { id: 'PERSONAL-bbbb-2222', name: 'Trading', revision: 3, symbols: ['RELIANCE'] },
  ];

  it('deletes only the selected portfolio', async () => {
    const { store } = mockProvider(seeds);
    vi.stubGlobal('confirm', vi.fn(() => true));
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');

    await user.click(screen.getByTestId('pp-delete'));
    await waitFor(() => expect(screen.queryByDisplayValue('INFY')).not.toBeInTheDocument());

    expect(store.has('PERSONAL-aaaa-1111')).toBe(false);
    // Deletion is isolated: the sibling survives with its own revision and holdings.
    expect(store.get('PERSONAL-bbbb-2222')?.revision).toBe(3);
    expect(store.get('PERSONAL-bbbb-2222')?.symbols).toEqual(['RELIANCE']);
    await waitFor(() => expect(screen.getByDisplayValue('RELIANCE')).toBeInTheDocument());
    vi.unstubAllGlobals();
  });

  it('keeps the removed identifier retired and creates the next portfolio under a fresh one', async () => {
    const provider = mockProvider(seeds);
    vi.stubGlobal('confirm', vi.fn(() => true));
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');
    await user.click(screen.getByTestId('pp-delete'));
    await waitFor(() => expect(screen.getByDisplayValue('RELIANCE')).toBeInTheDocument());

    const retired = 'PERSONAL-aaaa-1111';
    expect(provider.tombstoned.has(retired)).toBe(true);

    // A new portfolio is created successfully after the delete…
    await composeNewPortfolio(user, 'Fresh start', 'HDFC');
    await user.click(screen.getByTestId('pp-create-submit'));
    await waitFor(() => expect(listIds()).toHaveLength(2));

    // …under an identifier that is neither the retired one nor any existing one.
    const fresh = listIds().find((id) => id !== 'PERSONAL-bbbb-2222');
    expect(fresh).toBeDefined();
    expect(fresh).not.toBe(retired);
    expect(provider.tombstoned.has(String(fresh))).toBe(false);

    // And the provider still refuses the retired identifier outright.
    const recreated = await fetch('/api/user-portfolios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioId: retired, portfolioName: 'Again', holdings: [] }),
    });
    expect(recreated.status).toBe(400);
    vi.unstubAllGlobals();
  });

  it('a cancelled delete changes nothing', async () => {
    const { store, calls } = mockProvider(seeds);
    vi.stubGlobal('confirm', vi.fn(() => false));
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');
    await user.click(screen.getByTestId('pp-delete'));
    expect(await screen.findByDisplayValue('INFY')).toBeInTheDocument();
    expect(store.has('PERSONAL-aaaa-1111')).toBe(true);
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
    vi.unstubAllGlobals();
  });
});

/* ------------------------------------------------------------------ *
 * 6. Fail-closed behaviour preserved
 * ------------------------------------------------------------------ */

describe('Personal Portfolio — fail-closed behaviour', () => {
  it('a 503 is a configuration state, not an empty list', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ error: 'upstream-unavailable', detail: { unavailableReason: 'binding-precondition-absent' } }),
    })) as never;
    renderPage();
    expect(await screen.findByTestId('pp-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('pp-create')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pp-list')).not.toBeInTheDocument();
  });

  it('a 409 on save is an explicit conflict, never a silent merge', async () => {
    mockProvider([{ id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 2, symbols: ['INFY'] }]);
    const stale = globalThis.fetch;
    let saved = false;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT' && !saved) { saved = true; return { ok: false, status: 409, json: async () => ({ error: 'revision-conflict' }) }; }
      return (stale as (i: RequestInfo | URL, o?: RequestInit) => Promise<Response>)(input, init);
    }) as never;
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');
    await user.click(screen.getByTestId('pp-save'));
    expect(await screen.findByTestId('pp-conflict')).toBeInTheDocument();
  });

  it('refuses a filtered snapshot instead of offering it as a REPLACE baseline', async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url === '/api/user-portfolios') {
        return { ok: true, status: 200, json: async () => ({ portfolios: [{ portfolioId: 'PERSONAL-aaaa-1111', portfolioName: 'Retirement', revision: 2, totalMarketValue: 1, totalHoldingsCount: 1, weightSumPercentage: 100, lastUpdated: 'x', provenanceDigest: 'b'.repeat(64), isSaved: true }] }) };
      }
      return { ok: true, status: 200, json: async () => ({ portfolio: { ...viewOf('PERSONAL-aaaa-1111', 'Retirement', 2, ['INFY']), holdings: [...viewOf('PERSONAL-aaaa-1111', 'Retirement', 2, ['INFY']).holdings, { invalid: true }] } }) };
    }) as never;
    renderPage();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('incomplete or invalid');
    expect(screen.queryByTestId('pp-save')).not.toBeInTheDocument();
  });

  it('drops a selection whose portfolio has been deleted elsewhere', async () => {
    const provider = mockProvider([{ id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 1, symbols: ['INFY'] }]);
    renderPage();
    await screen.findByDisplayValue('INFY');

    // Remove it behind the page's back, then reload.
    provider.store.delete('PERSONAL-aaaa-1111');
    provider.tombstoned.add('PERSONAL-aaaa-1111');
    const user = userEvent.setup();
    await user.click(screen.getByTestId('pp-reload'));
    expect(await screen.findByTestId('pp-list-empty')).toBeInTheDocument();
    expect(screen.getByTestId('pp-no-selection')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ *
 * 7. Guarantees carried over from the single-portfolio surface
 * ------------------------------------------------------------------ */

describe('Personal Portfolio — guarantees carried over', () => {
  it('survives StrictMode double-invocation without a duplicate mutation', async () => {
    const { calls, store } = mockProvider([
      { id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 1, symbols: ['INFY'] },
    ]);
    vi.stubGlobal('confirm', vi.fn(() => true));
    const user = userEvent.setup();
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/personal-portfolio']}>
          <PersonalPortfolio />
        </MemoryRouter>
      </StrictMode>,
    );
    await screen.findByDisplayValue('INFY');
    await user.click(screen.getByTestId('pp-save'));
    await waitFor(() => expect(screen.getByTestId('pp-revision')).toHaveTextContent('2'));

    // The mount effect runs twice under StrictMode; the save must still commit exactly
    // once, so the revision advances by one and not two.
    expect(calls.filter((c) => c.method === 'PUT')).toHaveLength(1);
    expect(store.get('PERSONAL-aaaa-1111')?.revision).toBe(2);
    vi.unstubAllGlobals();
  });

  it('a 400 on save surfaces the server reason and keeps the rows', async () => {
    mockProvider([{ id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 1, symbols: ['INFY'] }]);
    const delegate = globalThis.fetch;
    let saved = false;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT' && !saved) {
        saved = true;
        return {
          ok: false,
          status: 400,
          json: async () => ({ error: 'invalid-request', detail: { reason: 'the provider refused' } }),
        };
      }
      return (delegate as (i: RequestInfo | URL, o?: RequestInit) => Promise<Response>)(input, init);
    }) as never;

    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');
    await user.click(screen.getByTestId('pp-save'));
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Your changes were NOT saved (HTTP 400).');
    expect(screen.getByTestId('state-error')).toHaveTextContent('the provider refused');
    // The rows are retained so the owner can correct them rather than re-enter them.
    expect(screen.getByDisplayValue('INFY')).toBeInTheDocument();
  });

  it('an unverifiable save outcome asks for a reload instead of retrying', async () => {
    mockProvider([{ id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 1, symbols: ['INFY'] }]);
    const delegate = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT') return { ok: false, status: 500, json: async () => ({ error: 'server-error' }) };
      return (delegate as (i: RequestInfo | URL, o?: RequestInit) => Promise<Response>)(input, init);
    }) as never;

    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');
    await user.click(screen.getByTestId('pp-save'));
    expect(await screen.findByTestId('state-error')).toHaveTextContent('could not be verified');
  });

  it('names the missing server settings for a binding diagnosis', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({
        error: 'owner-context-unavailable',
        detail: {
          unavailableReason: 'binding-precondition-absent',
          requiredSettings: ['IIPS_G3_IPC_BINDING_PROVISIONED', 'IIPS_G2_IPC_ENDPOINT'],
        },
      }),
    })) as never;
    renderPage();
    expect(await screen.findByTestId('pp-required-settings')).toHaveTextContent('IIPS_G3_IPC_BINDING_PROVISIONED');
    expect(screen.getByTestId('pp-required-settings')).toHaveTextContent('IIPS_G2_IPC_ENDPOINT');
  });

  it('rejects an invalid row client-side before any mutation', async () => {
    const { calls } = mockProvider([
      { id: 'PERSONAL-aaaa-1111', name: 'Retirement', revision: 1, symbols: ['INFY'] },
    ]);
    const user = userEvent.setup();
    renderPage();
    await screen.findByDisplayValue('INFY');
    await user.clear(screen.getByLabelText('Quantity'));
    expect(screen.getByTestId('pp-save')).toBeDisabled();
    expect(calls.some((c) => c.method === 'PUT')).toBe(false);
  });
});
