/**
 * DHAN-P5 — freshness surface tests.
 *
 * These qualify the rendered freshness presentation: the verdict, the cache state, the
 * timestamps, the threshold, the stale-concession and suppression decisions, the last
 * refresh outcome, the D02 limitation, and the explicit unknown states.
 *
 * Every payload below is synthetic and is labelled as such.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DhanFreshnessStatus, DhanFreshnessPanel } from './DhanFreshnessStatus';

function freshnessBody(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      domain: 'D01_QUOTES',
      freshness: 'SNAPSHOT',
      verdict: 'GOOD',
      cacheState: 'CURRENT',
      asOf: '2026-11-06T10:15:00.000Z',
      receivedAt: '2026-11-06T10:15:00.120Z',
      evaluatedAt: '2026-11-06T10:15:00.121Z',
      observationEvaluatedAt: '2026-11-06T10:15:00.121Z',
      timestampEvidence: 'VALID',
      thresholdSeconds: 900,
      ageSeconds: 120,
      staleConcessionActive: false,
      suppressExecution: false,
      eligibleForUse: true,
      lastRefresh: { outcome: 'SUCCESS', lastFailure: null },
      evidenceAvailable: true,
      explanation: "Cache state is 'CURRENT'.",
      ...overrides,
    },
  };
}

function okFetch(body: unknown) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response));
}

function errFetch(status: number, error: Record<string, unknown>) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: false, status, json: () => Promise.resolve({ error }) } as Response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DHAN-P5 freshness surface', () => {
  it('renders the surface with a data-testid on every element', () => {
    render(<DhanFreshnessStatus />);
    expect(screen.getByTestId('dhan-freshness-surface')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-form')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-domain')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-company')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-segment')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-security')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-submit')).toBeTruthy();
  });

  it('offers both governed domains', () => {
    render(<DhanFreshnessStatus />);
    const select = screen.getByTestId('dhan-freshness-domain') as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['D01_QUOTES', 'D02_OHLCV']);
  });

  it('hides the D01 scope when the D02 domain is selected', async () => {
    render(<DhanFreshnessStatus />);
    fireEvent.change(screen.getByTestId('dhan-freshness-domain'), { target: { value: 'D02_OHLCV' } });
    await waitFor(() => expect(screen.queryByTestId('dhan-freshness-security')).toBeNull());
  });

  it('renders the verdict, cache state, threshold and age', async () => {
    vi.stubGlobal('fetch', okFetch(freshnessBody()));
    render(<DhanFreshnessStatus />);

    fireEvent.change(screen.getByTestId('dhan-freshness-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.change(screen.getByTestId('dhan-freshness-security'), {
      target: { value: 'ISIN:INE002A01018:EQ' },
    });
    fireEvent.click(screen.getByTestId('dhan-freshness-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-panel')).toBeTruthy());
    expect(screen.getByTestId('dhan-freshness-verdict').textContent).toBe('GOOD');
    expect(screen.getByTestId('dhan-freshness-threshold').textContent).toBe('900 s');
    expect(screen.getByTestId('dhan-freshness-age').textContent).toBe('120 s');
    expect(screen.getByTestId('dhan-freshness-timestamp-evidence').textContent).toBe('VALID');
  });

  it('renders the observation, receipt and evaluation timestamps separately', async () => {
    vi.stubGlobal('fetch', okFetch(freshnessBody()));
    render(<DhanFreshnessStatus />);
    fireEvent.click(screen.getByTestId('dhan-freshness-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-panel')).toBeTruthy());
    expect(screen.getByTestId('dhan-freshness-as-of').textContent).toBe('2026-11-06T10:15:00.000Z');
    expect(screen.getByTestId('dhan-freshness-received-at').textContent).toBe('2026-11-06T10:15:00.120Z');
    expect(screen.getByTestId('dhan-freshness-evaluated-at').textContent).toBe('2026-11-06T10:15:00.121Z');
    expect(screen.getByTestId('dhan-freshness-observation-evaluated-at').textContent).toBe(
      '2026-11-06T10:15:00.121Z',
    );
  });

  it('never renders the freshness verdict as LIVE', async () => {
    vi.stubGlobal('fetch', okFetch(freshnessBody({ freshness: 'SNAPSHOT' })));
    render(<DhanFreshnessStatus />);
    fireEvent.click(screen.getByTestId('dhan-freshness-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-panel')).toBeTruthy());
    expect(screen.getByTestId('freshness-snapshot')).toBeTruthy();
    expect(screen.queryByTestId('freshness-live')).toBeNull();
  });

  it('shows the stale concession and suppression states explicitly', () => {
    render(
      <DhanFreshnessPanel
        status={
          {
            domain: 'D01_QUOTES',
            freshness: 'STALE',
            verdict: 'STALE',
            cacheState: 'STALE',
            asOf: '2026-11-06T10:15:00.000Z',
            receivedAt: null,
            evaluatedAt: '2026-11-06T10:15:00.121Z',
            observationEvaluatedAt: null,
            timestampEvidence: 'VALID',
            thresholdSeconds: 900,
            ageSeconds: 1200,
            staleConcessionActive: true,
            suppressExecution: false,
            eligibleForUse: true,
            lastRefresh: { outcome: 'SKIPPED_FRESH', lastFailure: null },
            evidenceAvailable: true,
            explanation: 'stale',
          } as never
        }
        failure={null}
      />,
    );

    expect(screen.getByTestId('dhan-freshness-concession')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-stale-concession').textContent).toBe('active');
    expect(screen.getByTestId('dhan-freshness-suppress-execution').textContent).toBe('not suppressed');
    expect(screen.getByTestId('dhan-freshness-eligible').textContent).toBe('yes');
    expect(screen.getByTestId('dhan-freshness-last-refresh').textContent).toBe('SKIPPED_FRESH');
  });

  it('shows the suppression state explicitly', () => {
    render(
      <DhanFreshnessPanel
        status={
          {
            domain: 'D01_QUOTES',
            freshness: 'UNAVAILABLE',
            verdict: 'UNAVAILABLE',
            cacheState: 'UNAVAILABLE',
            asOf: null,
            receivedAt: null,
            evaluatedAt: '2026-11-06T10:15:00.121Z',
            observationEvaluatedAt: null,
            timestampEvidence: 'VALID',
            thresholdSeconds: 900,
            ageSeconds: 2000,
            staleConcessionActive: false,
            suppressExecution: true,
            eligibleForUse: false,
            lastRefresh: { outcome: 'FAILURE', lastFailure: { code: 'REFRESH_FAILED', priorPreserved: true } },
            evidenceAvailable: true,
            explanation: 'suppressed',
          } as never
        }
        failure={null}
      />,
    );

    expect(screen.getByTestId('dhan-freshness-suppressed')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-suppress-execution').textContent).toBe('suppressed');
    expect(screen.getByTestId('dhan-freshness-eligible').textContent).toBe('no');
    expect(screen.getByTestId('dhan-freshness-last-refresh').textContent).toBe('FAILURE');
    expect(screen.getByTestId('dhan-freshness-last-failure').textContent).toBe(
      'REFRESH_FAILED (prior observation preserved)',
    );
  });

  it('renders the sanitized refresh failure without any provider detail', () => {
    render(
      <DhanFreshnessPanel
        status={
          {
            domain: 'D01_QUOTES',
            freshness: 'STALE',
            verdict: 'STALE',
            cacheState: 'STALE',
            asOf: null,
            receivedAt: null,
            evaluatedAt: '2026-11-06T10:15:00.121Z',
            observationEvaluatedAt: null,
            timestampEvidence: 'VALID',
            thresholdSeconds: 900,
            ageSeconds: 1000,
            staleConcessionActive: true,
            suppressExecution: false,
            eligibleForUse: true,
            lastRefresh: { outcome: 'FAILURE', lastFailure: { code: 'REFRESH_FAILED', priorPreserved: false } },
            evidenceAvailable: true,
            explanation: 'failed',
          } as never
        }
        failure={null}
      />,
    );

    expect(screen.getByTestId('dhan-freshness-last-failure').textContent).toBe(
      'REFRESH_FAILED (prior observation not preserved)',
    );
  });

  it('carries the D02 limitation into the presentation', () => {
    render(
      <DhanFreshnessPanel
        status={
          {
            domain: 'D02_OHLCV',
            freshness: 'UNAVAILABLE',
            verdict: 'UNKNOWN',
            cacheState: 'NOT_AVAILABLE',
            asOf: null,
            receivedAt: null,
            evaluatedAt: '2026-11-06T10:15:00.121Z',
            observationEvaluatedAt: null,
            timestampEvidence: 'NOT_AVAILABLE',
            thresholdSeconds: 86400,
            ageSeconds: null,
            staleConcessionActive: false,
            suppressExecution: true,
            eligibleForUse: false,
            lastRefresh: { outcome: 'UNKNOWN', lastFailure: null },
            evidenceAvailable: false,
            explanation: 'No cache or refresh evidence is available for this domain.',
          } as never
        }
        failure={null}
      />,
    );

    expect(screen.getByTestId('dhan-freshness-d02-limitation')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-d02-limitation').textContent).toContain(
      'does not wire the observation cache or the refresh orchestrator',
    );
    expect(screen.getByTestId('dhan-freshness-verdict').textContent).toBe('UNKNOWN');
    expect(screen.getByTestId('dhan-freshness-as-of').textContent).toBe('unavailable');
    expect(screen.getByTestId('dhan-freshness-age').textContent).toBe('unavailable');
    // The threshold IS still published even though the evidence is not.
    expect(screen.getByTestId('dhan-freshness-threshold').textContent).toBe('86400 s');
  });

  it('shows an explicit unknown state when the status could not be read', () => {
    render(<DhanFreshnessPanel status={null} failure={null} />);
    expect(screen.getByTestId('dhan-freshness-unknown-notice')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-unknown-notice').textContent).toContain(
      'not a statement that the data is current',
    );
  });

  it('shows a sanitized failure when the status read failed', () => {
    render(
      <DhanFreshnessPanel
        status={null}
        failure={{ code: 'TRANSPORT_FAILURE', message: 'market-data transport request failed' }}
      />,
    );
    expect(screen.getByTestId('dhan-freshness-failure-code').textContent).toBe('TRANSPORT_FAILURE');
    expect(screen.getByTestId('dhan-freshness-unknown-notice')).toBeTruthy();
  });

  it('reports a transport failure distinctly', async () => {
    vi.stubGlobal('fetch', errFetch(502, {
      code: 'TRANSPORT_FAILURE',
      message: 'market-data transport request failed',
      identityFailure: false,
      connectionAttempted: true,
    }));
    render(<DhanFreshnessStatus />);
    fireEvent.click(screen.getByTestId('dhan-freshness-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-failure')).toBeTruthy());
    expect(screen.getByTestId('dhan-freshness-failure-code').textContent).toBe('TRANSPORT_FAILURE');
  });

  it('sends the exact D01 scope to the server', async () => {
    const fetchMock = okFetch(freshnessBody());
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanFreshnessStatus />);

    fireEvent.change(screen.getByTestId('dhan-freshness-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.change(screen.getByTestId('dhan-freshness-security'), {
      target: { value: 'ISIN:INE002A01018:EQ' },
    });
    fireEvent.click(screen.getByTestId('dhan-freshness-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-panel')).toBeTruthy());
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain('/api/dhan/freshness?');
    expect(url).toContain('domain=D01_QUOTES');
    expect(url).toContain('companyId=SYNTHETIC%3ACOMPANY');
    expect(url).toContain('exchangeSegment=NSE_EQ');
    expect(url).toContain('securityId=ISIN%3AINE002A01018%3AEQ');
  });

  it('sends only the domain for the D02 scope', async () => {
    const fetchMock = okFetch(freshnessBody({ domain: 'D02_OHLCV', cacheState: 'NOT_AVAILABLE', verdict: 'UNKNOWN' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanFreshnessStatus />);

    fireEvent.change(screen.getByTestId('dhan-freshness-domain'), { target: { value: 'D02_OHLCV' } });
    fireEvent.click(screen.getByTestId('dhan-freshness-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-panel')).toBeTruthy());
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain('domain=D02_OHLCV');
    expect(url).not.toContain('companyId=');
    expect(url).not.toContain('securityId=');
  });

  it('never sends an Authorization header', async () => {
    const fetchMock = okFetch(freshnessBody());
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanFreshnessStatus />);
    fireEvent.click(screen.getByTestId('dhan-freshness-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-panel')).toBeTruthy());
    const init = fetchMock.mock.calls[0]?.[1];
    const headers = (init?.headers ?? {}) as Record<string, string>;
    for (const key of Object.keys(headers)) {
      expect(key.toLowerCase()).not.toBe('authorization');
    }
    expect(init?.credentials).toBe('omit');
  });
});
