import { afterEach, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { BrokerHoldingsPreview } from './BrokerHoldingsPreview';
import { handleBrokerImportRequest } from '../../../server/broker-import/brokerImportHttp';
import { materialiseBrokerEvidenceOwnerCarrier } from '../../../server/broker-import/brokerImportEvidenceOwnerCarrier';
import { BrokerImportEvidenceStore } from '../../../server/broker-import/brokerImportEvidenceStore';
const CSV = 'Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %\nRELIANCE,2,100,120,200,240,40,20';
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('actual file selection → bounded HTTP POST → disk journal → A-9 GET → verified success, never before GET', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'live-evidence-ui-'));
  const env = { IIPS_G3_IPC_BINDING_PROVISIONED: 'true', IIPS_DATA_DIR: path.join(root, 'data'), IIPS_BROKER_EVIDENCE_OWNER_PATH: materialiseBrokerEvidenceOwnerCarrier(path.join(root, 'owner')) };
  const nativeFetch = globalThis.fetch;
  let release!: () => void;
  const gate = new Promise<void>(r => { release = r; });
  const calls: { method: string; body?: string }[] = [];
  const server = http.createServer((req, res) => {
    void (async () => {
      if (req.method === 'GET') await gate;
      await handleBrokerImportRequest(req, res, { env, saveAdapterDeps: { callIpc: (() => { throw new Error('NO HOLDINGS CALL'); }) as never } });
    })();
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  vi.stubGlobal('fetch', (url: string, init: RequestInit) => {
    calls.push({ method: init.method!, body: init.body as string | undefined });
    return nativeFetch(base + url, init);
  });
  try {
    const writes = vi.spyOn(Storage.prototype, 'setItem');
    render(<BrokerHoldingsPreview />);
    const file = new File([CSV], 'dhan.csv', { type: 'text/csv' });
    Object.defineProperty(file, 'text', { value: async () => CSV });
    fireEvent.change(screen.getByLabelText('Broker CSV (maximum 1 MiB)'), { target: { files: [file] } });
    await screen.findByText(/Verifying evidence through A-9/);
    expect(screen.queryByText('Evidence retained and retrievable. Holdings not saved.')).not.toBeInTheDocument();
    const records = new BrokerImportEvidenceStore({ dataDir: env.IIPS_DATA_DIR }).list('irr-personal-073dd1c8', 'owner-4dc756b3');
    expect(records).toHaveLength(1);
    expect(records[0].record.rows[0].symbol).toBe('RELIANCE');
    expect(records[0].record.counts.savedRows).toBe(0);
    expect(fs.statSync(path.join(env.IIPS_DATA_DIR, 'journal.ndjson')).size).toBeGreaterThan(0);
    await act(async () => { release(); });
    await screen.findByText(/Evidence retained and retrievable. Holdings not saved/);
    expect(calls.map(c => c.method)).toEqual(['POST', 'GET']);
    expect(calls[0].body).not.toContain(CSV);
    expect(calls[0].body).not.toContain('ownerUserId');
    expect(writes).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear preview' }));
    await waitFor(() => expect(screen.queryByText(/Evidence retained and retrievable/)).not.toBeInTheDocument());
    expect(new BrokerImportEvidenceStore({ dataDir: env.IIPS_DATA_DIR }).list('irr-personal-073dd1c8', 'owner-4dc756b3')).toHaveLength(1);
  } finally {
    release(); server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); fs.rmSync(root, { recursive: true, force: true });
  }
});

/**
 * A verified retention must survive a later failed re-check: the operator keeps seeing the
 * digest that WAS acknowledged, next to a state that says the re-check did not verify it.
 * Losing the digest on a transient failure is what makes a retained record look like it
 * vanished; inventing a "verified" label for it would be worse, so the state alone carries
 * the uncertainty.
 */
it('actual file selection → retained and verified, then a failed re-check keeps the acknowledged digest visible', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'live-evidence-digest-'));
  const env = { IIPS_G3_IPC_BINDING_PROVISIONED: 'true', IIPS_DATA_DIR: path.join(root, 'data'), IIPS_BROKER_EVIDENCE_OWNER_PATH: materialiseBrokerEvidenceOwnerCarrier(path.join(root, 'owner')) };
  const nativeFetch = globalThis.fetch;
  const server = http.createServer((req, res) => {
    void handleBrokerImportRequest(req, res, { env, saveAdapterDeps: { callIpc: (() => { throw new Error('NO HOLDINGS CALL'); }) as never } });
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  let breakFetch = false;
  const calls: string[] = [];
  vi.stubGlobal('fetch', (url: string, init: RequestInit) => {
    calls.push(init.method!);
    // After verification, the transport itself fails: no usable response at all.
    if (breakFetch) throw new TypeError('socket hang up');
    return nativeFetch(base + url, init);
  });
  try {
    render(<BrokerHoldingsPreview />);
    const file = new File([CSV], 'dhan.csv', { type: 'text/csv' });
    Object.defineProperty(file, 'text', { value: async () => CSV });
    fireEvent.change(screen.getByLabelText('Broker CSV (maximum 1 MiB)'), { target: { files: [file] } });
    await screen.findByText(/Evidence retained and retrievable. Holdings not saved/);
    const status = screen.getByText(/Verified record digest/).textContent ?? '';
    const acknowledged = /Verified record digest: ([0-9a-f]{64})/.exec(status);
    expect(acknowledged).not.toBeNull();
    const digest = acknowledged![1];

    breakFetch = true;
    fireEvent.click(screen.getByRole('button', { name: 'Check retained evidence' }));
    await screen.findByText(/Transport failure/);
    expect(screen.getByText(/Evidence retention unconfirmed/)).toBeInTheDocument();
    // The acknowledged digest is still shown, and it is no longer labelled "verified".
    expect(screen.getByText(digest)).toBeInTheDocument();
    expect(screen.getByText(/Acknowledged record digest/)).toBeInTheDocument();
    expect(screen.queryByText(/Verified record digest/)).not.toBeInTheDocument();
    // The re-check issued exactly one lookup and never re-submitted the snapshot.
    expect(calls).toEqual(['POST', 'GET', 'GET']);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(r => server.close(() => r()));
    fs.rmSync(root, { recursive: true, force: true });
  }
});
