/**
 * BrokerImportCommit — the explicit commit surface's honest behaviour.
 *
 * These tests assert what the operator is told, not what the code contains:
 *   - nothing is committed until the operator acts, and a single click sends exactly one POST;
 *   - the destination and expected revision come from IPD's read surface, never from the receipt;
 *   - a persisted revision and count are reported only as IPD's own nested outcome describes them,
 *     and a duplicate no-op is never presented as a new save;
 *   - an unknown outcome locks further automatic submission and says so;
 *   - confirmation by retrieval is asserted only after an independent read, and the copy states
 *     plainly when the read does not confirm every submitted symbol.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { BrokerImportRequest } from 'iips-production-market-data/portfolio-ui';
import { BrokerImportCommit } from './BrokerImportCommit';
import type { PreparedBrokerImport } from '../../api/brokerImportStage4';

const DIGEST = '1'.repeat(64);
const LINEAGE = '2'.repeat(64);

const prepared: PreparedBrokerImport = {
  holdings: [{
    symbol: 'INFY', isin: 'INE009A01021', exchange: 'NSE', quantity: 5, averageBuyPrice: 1500,
    currentPrice: 1600, marketValue: 8000, weightPercentage: 100, active: true,
    sourceBroker: 'DHAN', lineageDigest: LINEAGE,
  }],
  contentDigest: DIGEST,
  fileName: 'synthetic-infy.csv',
  sourceBroker: 'DHAN',
  importedAt: '2026-11-08T09:15:00.000Z',
  mode: 'MERGE',
};

const committed = {
  ok: true, disposition: 'SAVED_NEW_BATCH', revision: 1, noOp: false, storeEffect: 'REVISION_COMMITTED',
  holdingsPersisted: 1, totalMarketValue: 8000, contributions: 1, message: 'The import was committed as a new batch.',
};

const duplicate = {
  ok: true, disposition: 'ALREADY_IMPORTED_NO_OP', revision: 1, noOp: true, storeEffect: 'NONE',
  holdingsPersisted: 1, totalMarketValue: 8000, contributions: 0, message: 'already imported',
};

const PORTFOLIO_SUMMARY: Record<string, unknown> = {
  portfolioId: 'E2E_SYNTHETIC', portfolioName: 'E2E_SYNTHETIC', revision: 1, totalMarketValue: 8000,
  totalHoldingsCount: 1, weightSumPercentage: 100, lastUpdated: '2026-11-08T09:15:00.000Z',
  provenanceDigest: DIGEST, isSaved: false,
};

const PORTFOLIO_READ: Record<string, unknown> = {
  portfolioId: 'E2E_SYNTHETIC', portfolioName: 'E2E_SYNTHETIC', revision: 1,
  holdings: [{
    symbol: 'INFY', companyId: 'EQ_INFY_IN', isin: 'INE009A01021', exchange: 'NSE', quantity: 5,
    averageBuyPrice: 1500, currentPrice: 1600, marketValue: 8000, weightPercentage: 100, active: true,
    sourceBroker: 'DHAN', lineageDigest: LINEAGE, identityStatus: 'RESOLVED', resolutionDisposition: 'CANONICAL_P04',
  }],
  totalMarketValue: 8000, totalHoldingsCount: 1, weightSumPercentage: 100,
  lastUpdated: '2026-11-08T09:15:00.000Z', provenanceDigest: DIGEST, isSaved: false, contributions: [],
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

interface WireList {
  readonly portfolios: readonly Record<string, unknown>[];
}
interface WireRead {
  readonly portfolio: Record<string, unknown>;
  readonly holdingSourceIndices: readonly number[];
  readonly rejectedHoldings: number;
  readonly rejectedContributions: number;
}

interface Harness {
  readonly commits: readonly string[];
  setStatus(status: number, body: unknown): void;
  setRead(body: WireRead, status?: number): void;
  setList(body: WireList, status?: number): void;
}

/** Routes the three read/write surfaces the component legitimately uses. */
function harness(options: { status?: number; body?: unknown; list?: unknown } = {}): Harness {
  const state = {
    status: options.status ?? 200,
    body: (options.body ?? committed) as unknown,
    list: (options.list ?? { portfolios: [PORTFOLIO_SUMMARY] }) as {} | WireList,
    listStatus: 200,
    read: { portfolio: PORTFOLIO_READ, holdingSourceIndices: [0], rejectedHoldings: 0, rejectedContributions: 0 } as WireRead,
    readStatus: 200,
  };
  const commits: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const path = String(url);
    if (path.includes('/api/user-portfolios?') || path === '/api/user-portfolios') {
      return json(state.listStatus, state.list);
    }
    if (path.startsWith('/api/user-portfolios/')) return json(state.readStatus, state.read);
    commits.push(String(init?.body ?? ''));
    return json(state.status, state.body);
  }));
  return {
    commits,
    setStatus(status, body) { state.status = status; state.body = body; },
    setRead(body, status = 200) { state.read = body; state.readStatus = status; },
    setList(body, status = 200) { state.list = body; state.listStatus = status; },
  };
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('BrokerImportCommit — qualification and destination', () => {
  it('blocks commitment and says why when the import is not qualified', async () => {
    harness();
    render(<BrokerImportCommit prepared={null} onSuccess={() => {}} onBusyChange={() => {}} />);
    await screen.findByRole('status');
    expect(screen.getByRole('status')).toHaveTextContent('not qualified for commitment');
    expect(screen.getByTestId('commit-holdings')).toBeDisabled();
    expect(screen.queryByTestId('qualified-count')).not.toBeInTheDocument();
  });

  it('reports the real destination list and the expected revision it will send', async () => {
    harness();
    render(<BrokerImportCommit prepared={prepared} onSuccess={() => {}} onBusyChange={() => {}} />);
    await screen.findByText('E2E_SYNTHETIC (revision 1)');
    expect(screen.getByTestId('qualified-count')).toHaveTextContent('Qualified holdings: 1');
    fireEvent.change(screen.getByLabelText('Destination portfolio'), { target: { value: 'E2E_SYNTHETIC' } });
    expect(screen.getByTestId('commit-destination')).toHaveTextContent('E2E_SYNTHETIC');
    expect(screen.getByText(/expected revision 1/)).toBeInTheDocument();
  });

  it('refuses to offer a destination when the owner-scoped read is unavailable', async () => {
    harness({ list: { portfolios: ['not-an-object'] } });
    render(<BrokerImportCommit prepared={prepared} onSuccess={() => {}} onBusyChange={() => {}} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Destination and revision unavailable');
    expect(screen.getByTestId('commit-holdings')).toBeDisabled();
  });
});

describe('BrokerImportCommit — one click, one POST, honest receipt', () => {
  it('commits once with the full prepared body and reports IPD’s own revision and count', async () => {
    const h = harness();
    const onSuccess = vi.fn();
    render(<BrokerImportCommit prepared={prepared} onSuccess={onSuccess} onBusyChange={() => {}} />);
    await screen.findByText('E2E_SYNTHETIC (revision 1)');
    fireEvent.change(screen.getByLabelText('Destination portfolio'), { target: { value: 'E2E_SYNTHETIC' } });
    fireEvent.click(screen.getByTestId('commit-holdings'));
    await screen.findByTestId('commit-receipt');
    expect(h.commits).toHaveLength(1);
    const sent = JSON.parse(h.commits[0]!) as BrokerImportRequest;
    expect(sent).toMatchObject({ fileName: 'synthetic-infy.csv', contentDigest: DIGEST, sourceBroker: 'DHAN', expectedRevision: 1, mode: 'MERGE' });
    expect(JSON.stringify(sent)).not.toMatch(/ownerUserId|tenantId|companyId|identityStatus/);
    expect(screen.getByTestId('commit-receipt')).toHaveTextContent('Portfolio commit succeeded. Saved holdings: 1');
    expect(screen.getByTestId('commit-receipt')).toHaveTextContent('persisted revision 1');
    expect(screen.getByTestId('commit-receipt')).toHaveTextContent('SAVED_NEW_BATCH');
    expect(screen.getByTestId('commit-receipt')).toHaveTextContent('store effect REVISION_COMMITTED');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('confirms by an independent read, not by the receipt alone', async () => {
    harness();
    render(<BrokerImportCommit prepared={prepared} onSuccess={() => {}} onBusyChange={() => {}} />);
    await screen.findByText('E2E_SYNTHETIC (revision 1)');
    fireEvent.change(screen.getByLabelText('Destination portfolio'), { target: { value: 'E2E_SYNTHETIC' } });
    fireEvent.click(screen.getByTestId('commit-holdings'));
    await screen.findByTestId('commit-readback');
    expect(screen.getByTestId('commit-readback')).toHaveTextContent('revision 1 with 1 stored holdings');
    expect(screen.getByTestId('commit-readback')).toHaveTextContent('Readback confirms the submitted holdings and quantities.');
  });

  it('does not claim confirmation when the read does not contain every submitted symbol', async () => {
    const h = harness();
    h.setRead({
      portfolio: { ...PORTFOLIO_READ, holdings: [], totalMarketValue: 0, totalHoldingsCount: 0, weightSumPercentage: 0 },
      holdingSourceIndices: [], rejectedHoldings: 0, rejectedContributions: 0,
    });
    render(<BrokerImportCommit prepared={prepared} onSuccess={() => {}} onBusyChange={() => {}} />);
    await screen.findByText('E2E_SYNTHETIC (revision 1)');
    fireEvent.change(screen.getByLabelText('Destination portfolio'), { target: { value: 'E2E_SYNTHETIC' } });
    fireEvent.click(screen.getByTestId('commit-holdings'));
    await screen.findByTestId('commit-readback');
    expect(screen.getByTestId('commit-readback')).toHaveTextContent('does not contain every submitted symbol');
    // The receipt stays, but it is not corroborated by retrieval.
    expect(screen.getByTestId('commit-receipt')).toBeInTheDocument();
  });

  it('presents a duplicate as a no-op and never as a new save', async () => {
    harness({ body: duplicate });
    render(<BrokerImportCommit prepared={prepared} onSuccess={() => {}} onBusyChange={() => {}} />);
    await screen.findByText('E2E_SYNTHETIC (revision 1)');
    fireEvent.change(screen.getByLabelText('Destination portfolio'), { target: { value: 'E2E_SYNTHETIC' } });
    fireEvent.click(screen.getByTestId('commit-holdings'));
    await screen.findByTestId('commit-receipt');
    expect(screen.getByTestId('commit-receipt')).toHaveTextContent('duplicate submission was a no-op');
    expect(screen.getByTestId('commit-receipt')).toHaveTextContent('store effect NONE');
    expect(screen.queryByText(/Saved holdings/)).not.toBeInTheDocument();
  });

  it('never sends a second request automatically when the acknowledgement is lost', async () => {
    const h = harness({ status: 503, body: { outcome: 'OUTCOME_UNKNOWN', retried: false } });
    render(<BrokerImportCommit prepared={prepared} onSuccess={() => {}} onBusyChange={() => {}} />);
    await screen.findByText('E2E_SYNTHETIC (revision 1)');
    fireEvent.change(screen.getByLabelText('Destination portfolio'), { target: { value: 'E2E_SYNTHETIC' } });
    fireEvent.click(screen.getByTestId('commit-holdings'));
    const alert = await screen.findByTestId('commit-refusal');
    expect(alert).toHaveTextContent('Commit outcome unknown');
    expect(alert).toHaveTextContent('Do not resubmit automatically');
    await waitFor(() => expect(h.commits).toHaveLength(1));
    // The ambiguous outcome locks another automatic commit for this snapshot.
    expect(screen.getByTestId('commit-holdings')).toBeDisabled();
    expect(screen.queryByTestId('commit-receipt')).not.toBeInTheDocument();
  });

  it('reports an authorization refusal with zero store effect and no retry', async () => {
    const h = harness({ status: 503, body: { outcome: 'WRITE_NOT_AUTHORIZED', storeEffect: 'NONE' } });
    render(<BrokerImportCommit prepared={prepared} onSuccess={() => {}} onBusyChange={() => {}} />);
    await screen.findByText('E2E_SYNTHETIC (revision 1)');
    fireEvent.change(screen.getByLabelText('Destination portfolio'), { target: { value: 'E2E_SYNTHETIC' } });
    fireEvent.click(screen.getByTestId('commit-holdings'));
    const alert = await screen.findByTestId('commit-refusal');
    expect(alert).toHaveTextContent('IPD did not authorize the local personal-use write');
    expect(alert).toHaveTextContent('No holdings were persisted by this request');
    expect(h.commits).toHaveLength(1);
    expect(screen.queryByTestId('commit-receipt')).not.toBeInTheDocument();
    // A refusal is not ambiguous, so the destination remains selectable for a reviewed retry.
    expect(screen.getByTestId('commit-holdings')).toBeEnabled();
  });

  it('clears a prior receipt before a new attempt so it cannot describe a later refusal', async () => {
    const h = harness();
    render(<BrokerImportCommit prepared={prepared} onSuccess={() => {}} onBusyChange={() => {}} />);
    await screen.findByText('E2E_SYNTHETIC (revision 1)');
    fireEvent.change(screen.getByLabelText('Destination portfolio'), { target: { value: 'E2E_SYNTHETIC' } });
    fireEvent.click(screen.getByTestId('commit-holdings'));
    await screen.findByTestId('commit-receipt');
    h.setStatus(422, { outcome: 'REFUSED_STORE_GUARD', storeEffect: 'NONE' });
    fireEvent.click(screen.getByTestId('commit-holdings'));
    await screen.findByTestId('commit-refusal');
    expect(screen.queryByTestId('commit-receipt')).not.toBeInTheDocument();
    expect(screen.queryByTestId('commit-readback')).not.toBeInTheDocument();
    expect(h.commits).toHaveLength(2);
  });
});
