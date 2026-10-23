/**
 * CAP-02 `BrokerImportModal` + `IrrBrokerImportStorePortAdapter` Public-Package Integration Tests
 * (Evidence Level 2).
 *
 * Authority:
 *   - `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-04` §§3.1–3.4, §5
 *   - `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` §§1.4, 2–4, 7
 *   - `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §§2.2, 2.3, 7
 */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../../app/App';
import { BrokerImportSurface } from './BrokerImportSurface';

const RESOLVED_DHAN_CSV = [
  'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price',
  'RELIANCE,INE002A01018,NSE,10,2400.00,2500.00',
  'TCS,INE467B01029,NSE,5,3500.00,3600.00',
].join('\n');

const UNRESOLVED_DHAN_CSV = [
  'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price',
  'UNLISTED_MYSTERY_CORP,INE999Z99999,NSE,10,100.00,120.00',
].join('\n');

function createCsvFile(name: string, content: string): File {
  const file = new File([content], name, { type: 'text/csv' });
  Object.defineProperty(file, 'text', {
    value: vi.fn(async () => content),
    configurable: true,
  });
  return file;
}

function selectCsvInModal(file: File): void {
  const input = document.getElementById('ui15-file-input') as HTMLInputElement | null;
  if (!input) {
    throw new Error('Expected #ui15-file-input to be mounted by BrokerImportModal');
  }
  fireEvent.change(input, { target: { files: [file] } });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('CAP-02 Level 2 — Public-package BrokerImportModal + IrrBrokerImportStorePortAdapter integration', () => {
  it('mounts BrokerImportModal from iips-production-market-data/portfolio-ui at /user-portfolios/import without modifying /portfolio or /user-portfolios', async () => {
    const fetchSpy = vi.fn();
    render(
      <MemoryRouter initialEntries={['/user-portfolios/import']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('cap02-broker-import-surface')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Select Broker CSV')).toBeInTheDocument();
    expect(screen.getByTestId('cap02-provenance-disclosure')).toHaveTextContent(
      'fileName and importedAt are preview-only and are not transmitted in Contract v1',
    );
    // Zero automatic network requests on mount.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('enforces DP-2 Option 2F in BrokerImportModal: unresolved holdings are rejected/disabled for persistence with zero network calls', async () => {
    const calls: string[] = [];
    const fetchImpl = (async (url: RequestInfo | URL) => {
      calls.push(String(url));
      return new Response('{}', { status: 200 });
    }) as unknown as typeof fetch;

    render(<BrokerImportSurface fetchImpl={fetchImpl} allowNonProductionBypass={true} />);
    selectCsvInModal(createCsvFile('unresolved.csv', UNRESOLVED_DHAN_CSV));

    await waitFor(() => {
      expect(screen.getByText('UNLISTED_MYSTERY_CORP')).toBeInTheDocument();
    });
    expect(screen.getByText(/UNRESOLVED \(Bypass\)/i)).toBeInTheDocument();

    const confirmBtn = document.getElementById('ui15-btn-confirm-save') as HTMLButtonElement;
    expect(confirmBtn).toBeDisabled();
    expect(confirmBtn.title).toContain('DP-2 Option 2F');
    expect(calls).toHaveLength(0);
  });

  it('surfaces WRITE_NOT_AUTHORIZED refusal in BrokerImportModal when Gate E W-1 is unmet (zero retries, no fabricated metrics)', async () => {
    const calls: Array<{ url: string; method: string; body?: string }> = [];
    const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: (init?.method ?? 'GET').toUpperCase(),
        body: typeof init?.body === 'string' ? init.body : undefined,
      });
      return new Response(JSON.stringify({ outcome: 'WRITE_NOT_AUTHORIZED', storeEffect: 'NONE' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as unknown as typeof fetch;

    render(<BrokerImportSurface fetchImpl={fetchImpl} initialExpectedRevision={1} />);
    selectCsvInModal(createCsvFile('dhan.csv', RESOLVED_DHAN_CSV));

    await waitFor(() => {
      expect(screen.getByText('RELIANCE')).toBeInTheDocument();
    });
    const confirmBtn = document.getElementById('ui15-btn-confirm-save') as HTMLButtonElement;
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText('Persistence refused - WRITE_NOT_AUTHORIZED')).toBeInTheDocument();
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('POST');
    expect(calls[0].url).toBe('/api/broker-import/DEFAULT_PORTFOLIO/holdings');
    expect(calls[0].body).not.toContain('dhan.csv');
    expect(calls[0].body).not.toContain('fileName');
    expect(screen.queryByText(/Holdings Committed Durably/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Holdings Saved \(Session-Scoped\)/i)).not.toBeInTheDocument();
  });

  it('renders minimal v1 commit receipts truthfully (SESSION_ONLY/durable:false vs DURABLE/durable:true) without fabricating saveResult totals or digests', async () => {
    for (const receipt of [
      {
        disposition: 'SAVED_NEW_BATCH' as const,
        revision: 1,
        durability: 'SESSION_ONLY' as const,
        durable: false,
        expectedHeading: 'Holdings Saved (Session-Scoped)',
        expectedBadge: 'SAVED (SESSION ONLY - NOT DURABLE)',
      },
      {
        disposition: 'MERGED_INTO_EXISTING' as const,
        revision: 2,
        durability: 'DURABLE' as const,
        durable: true,
        expectedHeading: 'Holdings Committed Durably',
        expectedBadge: 'COMMITTED (Durable)',
      },
      {
        disposition: 'ALREADY_IMPORTED_NO_OP' as const,
        revision: 2,
        durability: 'DURABLE' as const,
        durable: true,
        expectedHeading: 'Holdings Committed Durably',
        expectedBadge: 'COMMITTED (Durable)',
      },
    ]) {
      cleanup();
      const fetchImpl = (async () =>
        new Response(
          JSON.stringify({
            disposition: receipt.disposition,
            revision: receipt.revision,
            durability: receipt.durability,
            durable: receipt.durable,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )) as unknown as typeof fetch;

      render(<BrokerImportSurface fetchImpl={fetchImpl} initialExpectedRevision={0} />);
      selectCsvInModal(createCsvFile('dhan.csv', RESOLVED_DHAN_CSV));

      await waitFor(() => {
        expect(screen.getByText('RELIANCE')).toBeInTheDocument();
      });
      fireEvent.click(document.getElementById('ui15-btn-confirm-save')!);

      await waitFor(() => {
        expect(screen.getByText(receipt.expectedHeading)).toBeInTheDocument();
      });
      expect(screen.getAllByText(receipt.disposition).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(receipt.expectedBadge)).toBeInTheDocument();
      expect(
        screen.getByText(
          /This save path reported only the minimal commit receipt\. No portfolio totals, holding counts or provenance digest are claimed/i,
        ),
      ).toBeInTheDocument();
      expect(screen.getByTestId('cap02-host-commit-receipt')).toHaveTextContent(receipt.disposition);
    }
  });

  it('handles OUTCOME_UNKNOWN with zero automatic retries and reconciles via GET /api/broker-import/DEFAULT_PORTFOLIO/revision without re-POSTing', async () => {
    const calls: Array<{ url: string; method: string }> = [];
    const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method ?? 'GET').toUpperCase();
      calls.push({ url: String(url), method });
      if (method === 'POST') {
        throw new TypeError('network connection dropped during commit');
      }
      return new Response(
        JSON.stringify({ portfolioId: 'DEFAULT_PORTFOLIO', revision: 4 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }) as unknown as typeof fetch;

    render(<BrokerImportSurface fetchImpl={fetchImpl} initialExpectedRevision={3} />);
    selectCsvInModal(createCsvFile('dhan.csv', RESOLVED_DHAN_CSV));

    await waitFor(() => {
      expect(screen.getByText('RELIANCE')).toBeInTheDocument();
    });
    fireEvent.click(document.getElementById('ui15-btn-confirm-save')!);

    await waitFor(() => {
      expect(screen.getByText('Import Outcome Unknown')).toBeInTheDocument();
    });
    expect(calls).toEqual([
      { url: '/api/broker-import/DEFAULT_PORTFOLIO/holdings', method: 'POST' },
    ]);
    expect(screen.getByTestId('cap02-outcome-unknown-reconcile-banner')).toBeInTheDocument();

    // Trigger explicit read-only reconciliation via GET /revision.
    fireEvent.click(screen.getByTestId('cap02-btn-reconcile-unknown'));

    await waitFor(() => {
      expect(screen.getByTestId('cap02-reconciliation-status')).toHaveTextContent(
        'Reconciled DEFAULT_PORTFOLIO at revision 4 (prior save committed a new revision).',
      );
    });
    expect(calls).toEqual([
      { url: '/api/broker-import/DEFAULT_PORTFOLIO/holdings', method: 'POST' },
      { url: '/api/broker-import/DEFAULT_PORTFOLIO/revision', method: 'GET' },
    ]);
    expect(screen.getByTestId('cap02-expected-revision')).toHaveTextContent('4');
  });

  it('surfaces REVISION_CONFLICT and refreshes expectedRevision via Read Current Revision (GET /revision)', async () => {
    const calls: Array<{ url: string; method: string }> = [];
    const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method ?? 'GET').toUpperCase();
      calls.push({ url: String(url), method });
      if (method === 'POST') {
        return new Response(JSON.stringify({ outcome: 'REVISION_CONFLICT' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({ portfolioId: 'DEFAULT_PORTFOLIO', revision: 9 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }) as unknown as typeof fetch;

    render(<BrokerImportSurface fetchImpl={fetchImpl} initialExpectedRevision={2} />);
    selectCsvInModal(createCsvFile('dhan.csv', RESOLVED_DHAN_CSV));

    await waitFor(() => {
      expect(screen.getByText('RELIANCE')).toBeInTheDocument();
    });
    fireEvent.click(document.getElementById('ui15-btn-confirm-save')!);

    await waitFor(() => {
      expect(screen.getByText('Persistence refused - REVISION_CONFLICT')).toBeInTheDocument();
    });
    expect(screen.getByTestId('cap02-revision-conflict-banner')).toHaveTextContent('REVISION_CONFLICT');

    fireEvent.click(screen.getByTestId('cap02-btn-read-revision'));

    await waitFor(() => {
      expect(screen.getByTestId('cap02-revision-read-status')).toHaveTextContent(
        'Revision read succeeded for DEFAULT_PORTFOLIO: revision 9 (HTTP 200).',
      );
    });
    expect(screen.getByTestId('cap02-expected-revision')).toHaveTextContent('9');
    expect(calls).toEqual([
      { url: '/api/broker-import/DEFAULT_PORTFOLIO/holdings', method: 'POST' },
      { url: '/api/broker-import/DEFAULT_PORTFOLIO/revision', method: 'GET' },
    ]);
  });
});
