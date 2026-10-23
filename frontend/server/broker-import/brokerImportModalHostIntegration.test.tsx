/**
 * CAP-02 Level 3 — Composed IRR HTTP Host + Public-Package `BrokerImportModal` Integration Tests.
 *
 * Authority:
 *   - `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-04` §§3.1–3.4, §5
 *   - `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` §§1.4, 2–4, 7
 *   - `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §§2.2, 2.3, 7
 */

import http from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrokerImportSurface } from '../../src/features/portfolio-import/BrokerImportSurface.js';
import { handleBrokerImportRequest } from './brokerImportHttp.js';
import { materialiseOwnerContextCarrier } from '../owner-context-carrier.js';
import { OWNER_CONTEXT_PATH_ENV } from '../owner-context-resolver.js';
import type { IpcCallResult, IpcOperation } from '../user-portfolio/ipcClient.js';

const RESOLVED_DHAN_CSV = [
  'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price',
  'RELIANCE,INE002A01018,NSE,10,2400.00,2500.00',
  'TCS,INE467B01029,NSE,5,3500.00,3600.00',
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

describe('CAP-02 Level 3 — Composed IRR HTTP host + BrokerImportModal end-to-end integration', () => {
  const temporaryDirs: string[] = [];
  let realHostBaseUrl = '';
  let realServer: { close: (cb: () => void) => void } | null = null;
  const savedPath = process.env[OWNER_CONTEXT_PATH_ENV];
  const savedDataDir = process.env.IIPS_DATA_DIR;
  const savedBinding = process.env.IIPS_G3_IPC_BINDING_PROVISIONED;

  function tempDir(prefix: string): string {
    const dir = mkdtempSync(join(tmpdir(), prefix));
    temporaryDirs.push(dir);
    return dir;
  }

  beforeAll(async () => {
    process.env.IIPS_DATA_DIR = tempDir('iips-cap02-modal-data-');
    process.env[OWNER_CONTEXT_PATH_ENV] = materialiseOwnerContextCarrier(tempDir('iips-cap02-modal-carrier-'));
    delete process.env.IIPS_G3_IPC_BINDING_PROVISIONED;
    const mod = (await import('../executive-transport.js')) as unknown as {
      server: { listen: (p: number, h: string, cb: () => void) => void; address: () => unknown };
    };
    realServer = mod.server as unknown as { close: (cb: () => void) => void };
    await new Promise<void>((resolve) => mod.server.listen(0, '127.0.0.1', () => resolve()));
    realHostBaseUrl = `http://127.0.0.1:${(mod.server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (realServer !== null) await new Promise<void>((resolve) => realServer?.close(() => resolve()));
    if (savedPath === undefined) delete process.env[OWNER_CONTEXT_PATH_ENV];
    else process.env[OWNER_CONTEXT_PATH_ENV] = savedPath;
    if (savedDataDir === undefined) delete process.env.IIPS_DATA_DIR;
    else process.env.IIPS_DATA_DIR = savedDataDir;
    if (savedBinding === undefined) delete process.env.IIPS_G3_IPC_BINDING_PROVISIONED;
    else process.env.IIPS_G3_IPC_BINDING_PROVISIONED = savedBinding;
    while (temporaryDirs.length > 0) {
      const dir = temporaryDirs.pop();
      if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
    }
  });

  it('exercises BrokerImportModal against the real composed executive-transport host in default unactivated posture (503 owner-context-unavailable on both POST and GET)', async () => {
    const realHostFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      return fetch(`${realHostBaseUrl}${path}`, init);
    }) as typeof fetch;

    render(<BrokerImportSurface fetchImpl={realHostFetch} initialExpectedRevision={0} />);

    // 1. Read Current Revision against real composed host -> 503 OWNER_CONTEXT_UNAVAILABLE
    fireEvent.click(screen.getByTestId('cap02-btn-read-revision'));
    await waitFor(() => {
      expect(screen.getByTestId('cap02-revision-read-status')).toHaveTextContent(
        'Revision read refused/unavailable: OWNER_CONTEXT_UNAVAILABLE (HTTP 503).',
      );
    });

    // 2. Select CSV & click Confirm & Save against real composed host -> 503 UNAVAILABLE
    selectCsvInModal(createCsvFile('dhan.csv', RESOLVED_DHAN_CSV));
    await waitFor(() => {
      expect(screen.getByText('RELIANCE')).toBeInTheDocument();
    });
    fireEvent.click(document.getElementById('ui15-btn-confirm-save')!);

    await waitFor(() => {
      expect(screen.getByText('Persistence refused - UNAVAILABLE')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/binding precondition not activated; HTTP 503/i).length).toBeGreaterThanOrEqual(1);
  });

  it('exercises BrokerImportModal over real HTTP against handleBrokerImportRequest with simulated IPC outcomes (revision read + minimal receipt save)', async () => {
    const ipcCalls: Array<{ op: IpcOperation; payload: unknown }> = [];
    const boundServer = http.createServer((req, res) => {
      void handleBrokerImportRequest(req, res, {
        env: { IIPS_G3_IPC_BINDING_PROVISIONED: 'true' } as NodeJS.ProcessEnv,
        saveAdapterDeps: {
          callIpc: (async (op: IpcOperation, payload?: Record<string, unknown>) => {
            ipcCalls.push({ op, payload });
            if (op === 'portfolio.list') {
              return {
                kind: 'SUCCESS',
                frame: {
                  v: 1,
                  ok: true,
                  op: 'portfolio.list',
                  result: [
                    {
                      portfolioId: 'DEFAULT_PORTFOLIO',
                      portfolioName: 'Institutional Flagship Portfolio',
                      revision: 5,
                      holdingsCount: 2,
                      totalMarketValue: 40000,
                      lastUpdated: '2026-10-23T12:00:00.000Z',
                    },
                  ],
                },
                bytesReceived: 120,
              } satisfies IpcCallResult;
            }
            return {
              kind: 'SUCCESS',
              frame: {
                v: 1,
                ok: true,
                op: 'portfolio.save',
                result: {
                  disposition: 'MERGED_INTO_EXISTING',
                  revision: 6,
                  durability: 'SESSION_ONLY',
                  durable: false,
                },
              },
              bytesReceived: 96,
            } satisfies IpcCallResult;
          }) as never,
        },
      });
    });

    await new Promise<void>((resolve) => boundServer.listen(0, '127.0.0.1', () => resolve()));
    const port = (boundServer.address() as AddressInfo).port;
    const httpFetch = ((input: RequestInfo | URL, init?: RequestInit) =>
      fetch(`http://127.0.0.1:${port}${String(input)}`, init)) as typeof fetch;

    try {
      render(<BrokerImportSurface fetchImpl={httpFetch} initialExpectedRevision={0} />);

      // Step 1: Read current revision over HTTP -> IPC portfolio.list -> revision 5
      fireEvent.click(screen.getByTestId('cap02-btn-read-revision'));
      await waitFor(() => {
        expect(screen.getByTestId('cap02-expected-revision')).toHaveTextContent('5');
      });

      // Step 2: Select CSV in BrokerImportModal and save over HTTP -> IPC portfolio.save -> revision 6
      selectCsvInModal(createCsvFile('dhan.csv', RESOLVED_DHAN_CSV));
      await waitFor(() => {
        expect(screen.getByText('RELIANCE')).toBeInTheDocument();
      });
      fireEvent.click(document.getElementById('ui15-btn-confirm-save')!);

      await waitFor(() => {
        expect(screen.getByText('Holdings Saved (Session-Scoped)')).toBeInTheDocument();
      });
      expect(screen.getAllByText('MERGED_INTO_EXISTING').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('cap02-expected-revision')).toHaveTextContent('6');

      expect(ipcCalls).toHaveLength(2);
      expect(ipcCalls[0]).toEqual({ op: 'portfolio.list', payload: {} });
      expect(ipcCalls[1].op).toBe('portfolio.save');
      expect((ipcCalls[1].payload as Record<string, unknown>).expectedRevision).toBe(5);
      expect((ipcCalls[1].payload as Record<string, unknown>).portfolioId).toBe('DEFAULT_PORTFOLIO');
    } finally {
      await new Promise<void>((resolve) => boundServer.close(() => resolve()));
    }
  });
});
