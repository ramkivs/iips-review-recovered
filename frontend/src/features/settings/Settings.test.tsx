/**
 * UI12 — Settings surface tests.
 *
 * Verifies the authorized personal-preference surface: effective state rendering, defaults
 * disclosure, the authorized theme control, reset, the distinguished failure classes
 * (authorization / validation / transport), that only the bounded preference set is ever sent,
 * that no excluded control (data mode / PIT / freshness) exists, and that the browser is never
 * used as a settings or credential store.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Settings } from './Settings';
import { GOVERNED_DEFAULT_THEME, syncEffectiveThemeFromServer } from './themeSync';

const PROVENANCE = {
  dataSource: 'irr:settings-journal (Gate-P Class C, append-only)',
  asOf: null,
  dataVersion: 'settings-schema-v1',
  mode: 'PERSISTED',
  freshness: 'SNAPSHOT',
  authority: 'PLATFORM',
  transportSemantics:
    'PRIVATE, owner-scoped personal settings (append-only journal, revision-oriented). The effective state is folded deterministically from the durable revisions of the server-derived (tenantId, userId) owner; the client is never an ownership authority. Settings are NON-SHARED: there is NO sharing, NO invitation, NO workspace or tenant inheritance and NO administrator-managed personal settings. Only system-defined governed defaults apply when the owner has no revision. Data mode, freshness, PIT addressing, provenance, provider configuration and system/tenant/environment configuration are NOT user-configurable.',
};

function envelope(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      surfaceName: 'UI12',
      disposition: 'ADAPT',
      schemaVersion: 1,
      theme: 'light',
      revisionCount: 0,
      lastRevisionAt: null,
      lastRevisionKind: null,
      source: 'GOVERNED_DEFAULT',
      tenantId: 'tenant-A',
      ...overrides,
    },
    provenance: PROVENANCE,
  };
}

function okFetch(body: unknown) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response));
}

function errFetch(status: number, error: string) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: false, status, json: () => Promise.resolve({ error }) } as Response));
}

/** A fetch mock that answers sequentially (e.g. a successful load followed by a failed mutation). */
function sequenceFetch(...responses: Array<unknown | { status: number; error: string }>) {
  let i = 0;
  return vi.fn((_url: string, _init?: RequestInit) => {
    const r = responses[Math.min(i, responses.length - 1)];
    i += 1;
    if (r !== null && typeof r === 'object' && 'status' in (r as Record<string, unknown>)) {
      const e = r as { status: number; error: string };
      return Promise.resolve({ ok: false, status: e.status, json: () => Promise.resolve({ error: e.error }) } as Response);
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(r) } as Response);
  });
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function renderComponent() {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>,
  );
}

describe('UI12 — Settings surface: effective state', () => {
  it('shows a loading state before the server responds', async () => {
    vi.stubGlobal('fetch', okFetch(envelope()));
    renderComponent();
    expect(screen.getByTestId('state-loading')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('settings-surface')).toBeInTheDocument());
  });

  it('renders the server-authoritative effective theme and its source', async () => {
    vi.stubGlobal('fetch', okFetch(envelope()));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-current-theme')).toHaveTextContent('light'));
    expect(screen.getByTestId('settings-source')).toHaveTextContent('governed default');
    expect(screen.getByTestId('settings-revision-count')).toHaveTextContent('0');
    expect(screen.getByTestId('settings-schema-version')).toHaveTextContent('v1');
  });

  it('applies the effective theme through the existing governed theme mechanism', async () => {
    const light = document.documentElement.style.getPropertyValue('--color-surface-0');
    expect(light).not.toBe('');
    vi.stubGlobal('fetch', okFetch(envelope({ theme: 'dark', source: 'USER_REVISION', revisionCount: 1 })));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-current-theme')).toHaveTextContent('dark'));
    expect(document.documentElement.style.getPropertyValue('--color-surface-0')).not.toBe(light);
  });

  it('discloses the authorized and excluded model', async () => {
    vi.stubGlobal('fetch', okFetch(envelope()));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-provenance')).toBeInTheDocument());
    expect(screen.getByTestId('settings-provenance')).toHaveTextContent('NON-SHARED');
    expect(screen.getByTestId('settings-provenance')).toHaveTextContent('NOT user-configurable');
  });
});

describe('UI12 — Settings surface: authorized preference + reset', () => {
  it('sends ONLY the authorized preference and applies the returned effective state', async () => {
    const fetchMock = sequenceFetch(
      envelope(),
      envelope({ theme: 'dark', source: 'USER_REVISION', revisionCount: 1, lastRevisionKind: 'settings-updated' }),
    );
    vi.stubGlobal('fetch', fetchMock);
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-theme-select')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('settings-theme-select'), { target: { value: 'dark' } });

    await waitFor(() => expect(screen.getByTestId('settings-current-theme')).toHaveTextContent('dark'));
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/settings');
    expect(init?.method).toBe('PUT');
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    // The bounded preference set only — no identity, no schema, no excluded capability.
    expect(body).toEqual({ theme: 'dark' });
    expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('resets through the governed reset operation', async () => {
    const fetchMock = sequenceFetch(
      envelope({ theme: 'dark', source: 'USER_REVISION', revisionCount: 1 }),
      envelope({ theme: 'light', source: 'GOVERNED_DEFAULT', revisionCount: 2, lastRevisionKind: 'settings-reset' }),
    );
    vi.stubGlobal('fetch', fetchMock);
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-reset')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('settings-reset'));

    await waitFor(() => expect(screen.getByTestId('settings-current-theme')).toHaveTextContent('light'));
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/settings/reset');
    expect(init?.method).toBe('POST');
    expect(screen.getByTestId('settings-revision-count')).toHaveTextContent('2');
  });

  it('exposes no control for any excluded capability', async () => {
    vi.stubGlobal('fetch', okFetch(envelope()));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-theme-select')).toBeInTheDocument());

    // Exactly one control, and it can only express an authorized theme value.
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(1);
    const options = Array.from(selects[0].querySelectorAll('option')).map((o) => o.getAttribute('value'));
    expect(options).toEqual(['light', 'dark']);
  });
});

describe('UI12 — Settings surface: distinguished failure classes', () => {
  it('shows an authorization failure when the governed boundary denies the read', async () => {
    vi.stubGlobal('fetch', errFetch(403, 'forbidden'));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('state-permission-denied')).toBeInTheDocument());
  });

  it('shows an authorization failure for a 401', async () => {
    vi.stubGlobal('fetch', errFetch(401, 'unauthorized'));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('state-permission-denied')).toBeInTheDocument());
  });

  it('shows a validation failure and leaves the effective state unchanged', async () => {
    vi.stubGlobal('fetch', sequenceFetch(envelope(), { status: 400, error: 'unsupported-setting:fontScale' }));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-theme-select')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('settings-theme-select'), { target: { value: 'dark' } });

    await waitFor(() => expect(screen.getByTestId('settings-failure-kind')).toHaveTextContent('Validation failure'));
    expect(screen.getByTestId('settings-current-theme')).toHaveTextContent('light');
  });

  it('shows a transport failure when the request cannot be completed', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network down'))));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-failure-kind')).toHaveTextContent('Transport failure'));
  });

  it('fails closed on a malformed success envelope instead of presenting it as state', async () => {
    vi.stubGlobal('fetch', okFetch({ data: { theme: 'sepia' }, provenance: PROVENANCE }));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-failure-kind')).toHaveTextContent('Transport failure'));
    expect(screen.queryByTestId('settings-current-theme')).not.toBeInTheDocument();
  });
});

describe('UI12 — Settings surface: browser is never a settings or credential store', () => {
  it('writes nothing to browser storage while loading, updating and resetting', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem');
    const clear = vi.spyOn(Storage.prototype, 'clear');
    vi.stubGlobal('fetch', sequenceFetch(envelope(), envelope({ theme: 'dark', revisionCount: 1 }), envelope()));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-theme-select')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('settings-theme-select'), { target: { value: 'dark' } });
    await waitFor(() => expect(screen.getByTestId('settings-current-theme')).toHaveTextContent('dark'));
    fireEvent.click(screen.getByTestId('settings-reset'));
    await waitFor(() => expect(screen.getByTestId('settings-current-theme')).toHaveTextContent('light'));

    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });

  it('sends no credential material and supplies no identity on read', async () => {
    const fetchMock = okFetch(envelope());
    vi.stubGlobal('fetch', fetchMock);
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('settings-surface')).toBeInTheDocument());
    expect(fetchMock.mock.calls[0][0]).toBe('/api/settings');
    // No Authorization header, no credentials option, no identity in the URL.
    expect(JSON.stringify(fetchMock.mock.calls[0][0])).not.toMatch(/tenant|user|token|authorization/i);
    expect(fetchMock.mock.calls[0][1]).toBeUndefined();
  });
});

describe('UI12 — boot-time effective theme sync', () => {
  it('applies the server theme when the governed boundary answers', async () => {
    vi.stubGlobal('fetch', okFetch(envelope({ theme: 'dark', source: 'USER_REVISION', revisionCount: 1 })));
    const result = await syncEffectiveThemeFromServer();
    expect(result.source).toBe('SERVER');
    expect(result.applied).toBe('dark');
    expect(result.failureKind).toBeNull();
  });

  it('falls back to the governed default and discloses the failure otherwise', async () => {
    vi.stubGlobal('fetch', errFetch(401, 'unauthorized'));
    const result = await syncEffectiveThemeFromServer();
    expect(result.source).toBe('GOVERNED_DEFAULT');
    expect(result.applied).toBe(GOVERNED_DEFAULT_THEME);
    expect(result.failureKind).toBe('authorization');
    expect(result.detail).not.toBeNull();
  });

  it('persists nothing in the browser when the server cannot be consulted', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    await syncEffectiveThemeFromServer();
    expect(setItem).not.toHaveBeenCalled();
  });
});
