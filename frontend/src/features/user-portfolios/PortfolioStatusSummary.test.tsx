/**
 * Portfolio Status Summary — rendered behaviour tests.
 *
 * These assert what the operator sees, in the states that must never be confused
 * with one another: an existing-but-empty portfolio (real stored zeroes) versus a
 * portfolio read that did not happen (no zeroes at all), and a persisted INITIAL
 * revision (holdings exist, `isSaved: false`) versus an unsaved one.
 *
 * Nothing here is a live valuation: the summary reads the stored commit-time value.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { UserPortfolioRead, UserPortfolioRevision, UserPortfolioView } from '../../api/userPortfolios';
import { PortfolioStatusSummary } from './PortfolioStatusSummary';

const DIGEST = 'e'.repeat(64);

function view(overrides: Partial<UserPortfolioView> = {}): UserPortfolioView {
  return {
    portfolioId: 'pf-alpha',
    portfolioName: 'Primary Portfolio',
    revision: 1,
    holdings: [],
    totalMarketValue: 0,
    totalHoldingsCount: 0,
    weightSumPercentage: 0,
    lastUpdated: '2026-11-08T09:15:00.000Z',
    provenanceDigest: '',
    isSaved: false,
    contributions: [],
    ...overrides,
  };
}

function holding(overrides: Record<string, unknown> = {}) {
  return {
    symbol: 'INFY',
    companyId: 'EQ_INFY_IN',
    quantity: 5,
    averageBuyPrice: 1500,
    currentPrice: 1600,
    marketValue: 8000,
    weightPercentage: 100,
    active: true,
    sourceBroker: 'DHAN',
    lineageDigest: 'd'.repeat(64),
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    ...overrides,
  } as never;
}

function readOf(portfolio: UserPortfolioView, rejectedHoldings = 0): UserPortfolioRead {
  return {
    portfolio,
    holdingSourceIndices: portfolio.holdings.map((_, index) => index),
    rejectedHoldings,
    rejectedContributions: 0,
  };
}

function revision(overrides: Partial<UserPortfolioRevision> = {}): UserPortfolioRevision {
  return {
    revision: 1,
    operation: 'INITIAL',
    totalMarketValue: 0,
    provenanceDigest: '',
    holdingsCount: 0,
    createdAt: '2026-11-08T09:15:00.000Z',
    ...overrides,
  };
}

interface Harness {
  setHistory(entries: HistorySource): void;
  calls(): readonly string[];
}

type HistorySource = UserPortfolioRevision[] | { status: number; body: unknown };

/** Routes only the revision-history URL; the detail read is supplied by the test. */
function harness(options: { history?: HistorySource } = {}): Harness {
  const state: { history: HistorySource } = { history: (options.history ?? [revision()]) as HistorySource };
  const calls: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    calls.push(String(url));
    if (!Array.isArray(state.history)) {
      return new Response(JSON.stringify(state.history.body), { status: state.history.status, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ revisions: state.history }), { status: 200, headers: { 'content-type': 'application/json' } });
  }));
  return {
    setHistory(entries) { state.history = entries; },
    calls() { return calls; },
  };
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function renderSummary(read: UserPortfolioRead | null, onRefresh = vi.fn()) {
  render(<PortfolioStatusSummary portfolioId="pf-alpha" read={read} onRefresh={onRefresh} />);
  return onRefresh;
}

describe('Portfolio Status Summary — persisted values and states', () => {
  it('1. an INITIAL revision with zero holdings renders EMPTY with real stored zeroes', async () => {
    harness({ history: [revision({ revision: 1, operation: 'INITIAL', holdingsCount: 0 })] });
    renderSummary(readOf(view()));
    await screen.findByTestId('summary-persistence-status');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('EMPTY');
    expect(screen.getByTestId('summary-total-value')).toHaveTextContent('₹0.00');
    expect(screen.getByTestId('summary-constituents-detail')).toHaveTextContent('0 persisted constituents');
    expect(screen.getByTestId('summary-weight-sum')).toHaveTextContent('0.0000%');
    expect(screen.getByTestId('summary-digest-empty')).toHaveTextContent('No lineage recorded — empty initial revision');
  });

  it('2. an INITIAL revision with persisted holdings renders PERSISTED although isSaved is false', async () => {
    harness({ history: [revision({ revision: 1, operation: 'INITIAL', holdingsCount: 2, totalMarketValue: 13000 })] });
    renderSummary(readOf(view({
      revision: 1,
      totalHoldingsCount: 2,
      totalMarketValue: 13000,
      weightSumPercentage: 100,
      isSaved: false,
      provenanceDigest: DIGEST,
      holdings: [holding(), holding({ symbol: 'RELIANCE', companyId: 'EQ_RELIANCE_IN', marketValue: 5000, weightPercentage: 38.4615 })],
    })));
    await screen.findByTestId('summary-persistence-status');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('PERSISTED');
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('INITIAL');
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('isSaved=false');
    // The misleading wording is gone.
    expect(screen.queryByText(/Not committed to the durable store/)).not.toBeInTheDocument();
  });

  it('3. a MERGE revision renders UPDATED with the operation and commit timestamp', async () => {
    harness({
      history: [
        revision({ revision: 1, operation: 'INITIAL', holdingsCount: 1 }),
        revision({ revision: 2, operation: 'MERGE', holdingsCount: 2, createdAt: '2026-11-09T10:00:00.000Z' }),
      ],
    });
    renderSummary(readOf(view({ revision: 2, totalHoldingsCount: 2, isSaved: true, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-persistence-status');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('UPDATED');
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('MERGE');
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('2026-11-09T10:00:00.000Z');
  });

  it('4. a REPLACE revision renders UPDATED', async () => {
    harness({ history: [revision({ revision: 3, operation: 'REPLACE', holdingsCount: 5 })] });
    renderSummary(readOf(view({ revision: 3, totalHoldingsCount: 5, isSaved: true, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-persistence-status');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('UPDATED');
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('REPLACE');
  });

  it('5. an empty provenance digest shows the no-lineage message, never a placeholder digest', async () => {
    harness({ history: [revision({ holdingsCount: 0 })] });
    renderSummary(readOf(view({ provenanceDigest: '' })));
    await screen.findByTestId('summary-digest-empty');
    expect(screen.getByTestId('summary-digest-empty')).toHaveTextContent('No lineage recorded — empty initial revision');
    expect(screen.getByTestId('summary-digest')).not.toHaveTextContent('e3b0c442');
  });

  it('6 & 7. a populated digest is displayed verbatim and accessible in full, never recomputed', async () => {
    harness({ history: [revision({ holdingsCount: 1, provenanceDigest: DIGEST })] });
    renderSummary(readOf(view({ totalHoldingsCount: 1, provenanceDigest: DIGEST, isSaved: false })));
    await screen.findByTestId('summary-digest');
    expect(screen.getByTestId('summary-digest')).toHaveTextContent(`${'e'.repeat(12)}…`);
    // The complete value is carried in the title attribute, not recomputed or truncated away.
    expect(screen.getByTitle(DIGEST)).toBeInTheDocument();
    expect(screen.queryByTestId('summary-digest-empty')).not.toBeInTheDocument();
  });

  it('8. a zero-value portfolio shows ₹0.00 only because zero is the stored value', async () => {
    harness({ history: [revision({ holdingsCount: 1, totalMarketValue: 0 })] });
    renderSummary(readOf(view({ totalHoldingsCount: 1, totalMarketValue: 0, weightSumPercentage: 0 })));
    await screen.findByTestId('summary-total-value');
    expect(screen.getByTestId('summary-total-value')).toHaveTextContent('₹0.00');
    expect(screen.getByTestId('summary-valuation-basis')).toHaveTextContent('Persisted valuation at commit time');
  });

  it('9. a non-zero persisted valuation is formatted as INR and labelled as commit-time', async () => {
    harness({ history: [revision({ holdingsCount: 2, totalMarketValue: 48102.5 })] });
    renderSummary(readOf(view({
      totalHoldingsCount: 2,
      totalMarketValue: 48102.5,
      weightSumPercentage: 99.8,
      lastUpdated: '2026-11-08T09:15:00.000Z',
      provenanceDigest: DIGEST,
      isSaved: false,
    })));
    await screen.findByTestId('summary-total-value');
    expect(screen.getByTestId('summary-total-value')).toHaveTextContent('48,102.50');
    expect(screen.getByTestId('summary-total-value')).toHaveTextContent('₹');
    expect(screen.getByTestId('summary-valuation-basis')).toHaveTextContent('not a live market value');
    expect(screen.getByTestId('summary-valuation-basis')).toHaveTextContent('2026-11-08T09:15:00.000Z');
  });

  it('10. weight allocation is displayed at four decimals and is never rounded up to 100%', async () => {
    harness({ history: [revision({ holdingsCount: 3, totalMarketValue: 300 })] });
    renderSummary(readOf(view({ totalHoldingsCount: 3, totalMarketValue: 300, weightSumPercentage: 99.9973 })));
    await screen.findByTestId('summary-weight-sum');
    expect(screen.getByTestId('summary-weight-sum')).toHaveTextContent('99.9973%');
    expect(screen.getByTestId('summary-weight-sum')).not.toHaveTextContent('100.0000%');
  });

  it('11. inactive holdings are counted separately from the authoritative total', async () => {
    harness({ history: [revision({ holdingsCount: 3 })] });
    renderSummary(readOf(view({
      totalHoldingsCount: 3,
      holdings: [holding(), holding({ symbol: 'TCS', companyId: 'EQ_TCS_IN' }), holding({ symbol: 'INFY', companyId: 'EQ_INFY_IN', active: false })],
    })));
    await screen.findByTestId('summary-constituents-detail');
    expect(screen.getByTestId('summary-constituents-detail')).toHaveTextContent('3 persisted constituents');
    expect(screen.getByTestId('summary-constituents-detail')).toHaveTextContent('2 active · 1 inactive');
  });

  it('15. unreadable holdings are disclosed and the split is marked incomplete', async () => {
    harness({ history: [revision({ holdingsCount: 4 })] });
    renderSummary(readOf(view({
      totalHoldingsCount: 4,
      holdings: [holding(), holding({ symbol: 'TCS', companyId: 'EQ_TCS_IN', active: false })],
    }), 2));
    await screen.findByTestId('summary-rejected-holdings');
    expect(screen.getByTestId('summary-rejected-holdings')).toHaveTextContent('2 holding record(s) could not be read');
    expect(screen.getByTestId('summary-constituents-detail')).toHaveTextContent('1 active · 1 inactive (of 2 readable records)');
    // The stored totals still come from IPD, not from the readable subset.
    expect(screen.getByTestId('summary-constituents-detail')).toHaveTextContent('4 persisted constituents');
  });
});

describe('Portfolio Status Summary — unavailable and error semantics', () => {
  it('12. an unreadable portfolio is never rendered as an empty portfolio', async () => {
    harness({ history: [revision()] });
    renderSummary(null);
    expect(screen.getByTestId('summary-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('summary-total-value')).not.toBeInTheDocument();
    expect(screen.queryByText('₹0.00')).not.toBeInTheDocument();
    expect(screen.queryByText(/EMPTY/)).not.toBeInTheDocument();
  });

  it('13. an IPD-unavailable revision history reports UNAVAILABLE and keeps the observed revision', async () => {
    harness({ history: { status: 503, body: { error: 'owner-context-unavailable', detail: { unavailableReason: 'ipc-endpoint-unreachable', requiredSettings: ['IIPS_G2_IPC_ENDPOINT'] } } } });
    renderSummary(readOf(view({ revision: 4, totalHoldingsCount: 2, totalMarketValue: 13000, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-persistence-status');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('UNAVAILABLE');
    expect(screen.getByTestId('summary-history-error')).toHaveTextContent('Revision history unavailable');
    // The values that WERE read are still shown; the state is the only thing withheld.
    expect(screen.getByTestId('summary-total-value')).toHaveTextContent('13,000.00');
    expect(screen.getAllByTestId('metric-value').some(node => node.textContent?.includes('4'))).toBe(true);
    expect(screen.queryByTestId('summary-digest-empty')).not.toBeInTheDocument();
  });

  it('14. a binding/authorization refusal is stated as a refusal, never as an empty portfolio', async () => {
    harness({ history: { status: 503, body: { error: 'owner-context-unavailable', detail: { reason: 'No non-authentication ownership source has been established.' } } } });
    renderSummary(readOf(view({ revision: 1, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-history-error');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('UNAVAILABLE');
    expect(screen.getByTestId('summary-history-error')).toHaveTextContent('503');
    expect(screen.queryByText(/EMPTY/)).not.toBeInTheDocument();
  });

  it('16. a malformed revision response yields UNAVAILABLE rather than a guessed state', async () => {
    harness({ history: { status: 200, body: { revisions: 'not-an-array' } } });
    renderSummary(readOf(view({ revision: 1, totalHoldingsCount: 1, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-history-error');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('UNAVAILABLE');
    expect(screen.getByTestId('summary-history-error')).toHaveTextContent('invalid envelope');
  });

  it('16b. refused revision entries are counted and disclosed without changing the state', async () => {
    harness({
      history: [
        revision({ revision: 1, operation: 'INITIAL', holdingsCount: 1 }),
        ({ revision: 2, operation: 'MERGE' } as unknown as UserPortfolioRevision), // malformed entry
      ],
    });
    renderSummary(readOf(view({ revision: 1, totalHoldingsCount: 1, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-persistence-status');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('PERSISTED');
    expect(screen.getByTestId('summary-rejected-revisions')).toHaveTextContent('1 revision-history record could not be read');
  });

  it('17. concurrent revision observations are reported, never reconciled', async () => {
    harness({ history: [revision({ revision: 1, holdingsCount: 1 }), revision({ revision: 2, operation: 'MERGE', holdingsCount: 2 })] });
    renderSummary(readOf(view({ revision: 4, totalHoldingsCount: 2, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-concurrent-observation');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('UNAVAILABLE');
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('revision 4');
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('ends at 2');
    // The metrics that were read are still shown; only the state is withheld.
    expect(screen.getByTestId('summary-total-value')).toBeInTheDocument();
  });

  it('12b. a history read still in flight reads as pending, never as UNAVAILABLE', async () => {
    // The fetch is left unresolved: an unfinished read is not evidence about the state.
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
    renderSummary(readOf(view({ revision: 1, totalHoldingsCount: 1, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-status-pending');
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('still being read');
    expect(screen.queryByTestId('summary-history-error')).not.toBeInTheDocument();
    // The values that WERE read are still shown.
    expect(screen.getByTestId('summary-total-value')).toBeInTheDocument();
  });

  it('18. an explicit refresh re-reads the history and re-issues the parent detail read', async () => {
    const h = harness({ history: [revision({ revision: 1, operation: 'INITIAL', holdingsCount: 1 })] });
    const onRefresh = renderSummary(readOf(view({ revision: 1, totalHoldingsCount: 1, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-persistence-status');
    expect(h.calls()).toHaveLength(1);
    fireEvent.click(screen.getByTestId('summary-refresh'));
    await waitFor(() => expect(h.calls()).toHaveLength(2));
    expect(h.calls()[0]).toBe('/api/user-portfolios/pf-alpha/revisions');
    expect(onRefresh).toHaveBeenCalledTimes(1);
    await screen.findByTestId('summary-observed-at');
    expect(screen.getByTestId('summary-observed-at')).toHaveTextContent('Observed ');
  });

  it('18b. a refresh that observes a newer revision shows the new state', async () => {
    const h = harness({ history: [revision({ revision: 1, operation: 'INITIAL', holdingsCount: 1 })] });
    const { rerender } = render(
      <PortfolioStatusSummary portfolioId="pf-alpha" read={readOf(view({ revision: 1, totalHoldingsCount: 1, provenanceDigest: DIGEST }))} onRefresh={vi.fn()} />,
    );
    await screen.findByTestId('summary-persistence-status');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('PERSISTED');
    // A commit lands elsewhere: the parent re-reads the detail and the history gains revision 2.
    h.setHistory([
      revision({ revision: 1, operation: 'INITIAL', holdingsCount: 1 }),
      revision({ revision: 2, operation: 'MERGE', holdingsCount: 2, createdAt: '2026-11-09T10:00:00.000Z' }),
    ]);
    rerender(
      <PortfolioStatusSummary portfolioId="pf-alpha" read={readOf(view({ revision: 2, totalHoldingsCount: 2, isSaved: true, provenanceDigest: DIGEST }))} onRefresh={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId('summary-refresh'));
    await waitFor(() => expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('UPDATED'));
    expect(screen.queryByTestId('summary-concurrent-observation')).not.toBeInTheDocument();
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('2026-11-09T10:00:00.000Z');
  });

  it('18c. a refresh that races with a newer commit reports the disagreement instead of reconciling it', async () => {
    const h = harness({ history: [revision({ revision: 1, operation: 'INITIAL', holdingsCount: 1 })] });
    render(
      <PortfolioStatusSummary portfolioId="pf-alpha" read={readOf(view({ revision: 1, totalHoldingsCount: 1, provenanceDigest: DIGEST }))} onRefresh={vi.fn()} />,
    );
    await screen.findByTestId('summary-persistence-status');
    expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('PERSISTED');
    // The history moves ahead of the detail read still held by this surface.
    h.setHistory([
      revision({ revision: 1, operation: 'INITIAL', holdingsCount: 1 }),
      revision({ revision: 2, operation: 'MERGE', holdingsCount: 2 }),
    ]);
    fireEvent.click(screen.getByTestId('summary-refresh'));
    await waitFor(() => expect(screen.getByTestId('summary-persistence-status')).toHaveTextContent('UNAVAILABLE'));
    expect(screen.getByTestId('summary-concurrent-observation')).toHaveTextContent('observed different revisions');
    expect(screen.getByTestId('summary-concurrent-observation')).toHaveTextContent('Nothing was reconciled automatically');
    // The disagreement is stated in terms of both observed revisions.
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('revision 1');
    expect(screen.getByTestId('summary-status-detail')).toHaveTextContent('already at revision 2');
  });
});

describe('Portfolio Status Summary — scope', () => {
  it('19. renders no mutation control and no market-data or valuation control', async () => {
    harness({ history: [revision({ holdingsCount: 1 })] });
    renderSummary(readOf(view({ totalHoldingsCount: 1, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-persistence-status');
    const controls = screen.getAllByRole('button');
    expect(controls).toHaveLength(1);
    expect(controls[0]).toHaveTextContent('Refresh');
    // No write, import, upload, save, reset, delete control or input surface.
    for (const pattern of [/save/i, /import/i, /upload/i, /reset/i, /delete/i, /commit/i]) {
      expect(screen.queryByRole('button', { name: pattern })).toBeNull();
    }
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
    // No market-data call is made by this surface: the only request is the revisions route.
    const h = harness({ history: [revision()] });
    expect(h.calls()).toEqual([]);
  });

  it('19b. the summary states the persisted-versus-live distinction on its face', async () => {
    harness({ history: [revision({ holdingsCount: 1 })] });
    renderSummary(readOf(view({ totalHoldingsCount: 1, provenanceDigest: DIGEST })));
    await screen.findByTestId('summary-persistence-status');
    expect(screen.getByTestId('portfolio-status-summary')).toHaveTextContent('not a live market valuation');
    expect(screen.getByTestId('summary-valuation-basis')).toHaveTextContent('Persisted valuation at commit time');
  });
});
