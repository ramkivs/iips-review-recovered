/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { previewBrokerHoldings } from '../../src/api/brokerHoldingsPreview.js';
import { freezeEvidenceSubmission, validateEvidenceSubmission } from '../../src/api/brokerEvidenceSubmission.js';
import { retainAndVerifyEvidence } from '../../src/api/brokerEvidenceRetention.js';
import { handleBrokerImportRequest, type BrokerImportRouteDeps } from './brokerImportHttp.js';
import { materialiseBrokerEvidenceOwnerCarrier } from './brokerImportEvidenceOwnerCarrier.js';
import { PersistenceService } from '../persistence/persistence-service.js';
import { BrokerImportEvidenceStore, buildBrokerImportEvidence, computeEvidenceRecordDigest } from './brokerImportEvidenceStore.js';
const CSV = 'Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %\nRELIANCE,2,100,120,200,240,40,20';
const AT = '2026-11-05T07:50:49.090Z';
const endpoint = '/api/broker-import/DEFAULT_PORTFOLIO/evidence';
const tenantId = 'irr-personal-073dd1c8', ownerUserId = 'owner-4dc756b3';
const dto = () => freezeEvidenceSubmission('dhan.csv', previewBrokerHoldings(CSV, 'dhan.csv', AT));
let root: string, env: NodeJS.ProcessEnv;
const servers: http.Server[] = [], children: ChildProcess[] = [];
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'live-retention-'));
  env = { IIPS_DATA_DIR: path.join(root, 'data'), IIPS_G3_IPC_BINDING_PROVISIONED: 'true', IIPS_BROKER_EVIDENCE_OWNER_PATH: materialiseBrokerEvidenceOwnerCarrier(path.join(root, 'owner')) };
});
afterEach(async () => {
  vi.restoreAllMocks();
  for (const server of servers.splice(0)) { server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); }
  for (const child of children.splice(0)) if (child.exitCode === null && child.signalCode === null) await stop(child);
  fs.rmSync(root, { recursive: true, force: true });
});
async function host(extra: BrokerImportRouteDeps = {}) {
  const server = http.createServer((req, res) => { void handleBrokerImportRequest(req, res, { env, ...extra }); });
  servers.push(server);
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { base, request: (body: unknown = dto(), suffix = '', init: RequestInit = {}) => fetch(base + endpoint + suffix, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...init }) };
}
function journal() { return path.join(env.IIPS_DATA_DIR!, 'journal.ndjson'); }
function store() { return new BrokerImportEvidenceStore({ dataDir: env.IIPS_DATA_DIR }); }
function fetchVia(base: string): typeof fetch { return (url, init) => fetch(base + String(url), init); }
async function childHost() {
  const child = spawn(process.execPath, ['--import', 'tsx', fileURLToPath(new URL('./__fixtures__/liveEvidenceHost.ts', import.meta.url))], { cwd: process.cwd(), env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
  children.push(child);
  return new Promise<{ child: ChildProcess; base: string }>((resolve, reject) => {
    child.once('message', (msg: { port: number }) => resolve({ child, base: `http://127.0.0.1:${msg.port}` }));
    child.once('error', reject);
    child.once('exit', code => reject(new Error(`child exited before ready: ${code}`)));
    child.stderr?.on('data', data => process.stderr.write(data));
  });
}
async function stop(child: ChildProcess, signal: NodeJS.Signals = 'SIGTERM') { await new Promise<void>(r => { child.once('exit', () => r()); child.kill(signal); }); }

describe('AMEND-02 live evidence submission and A-9 composition', () => {
  it('imports the real 68-row CSV via HTTP, then retrieves after complete OS process restart, retrying without duplicates', async () => {
    const csv = fs.readFileSync(new URL('./__fixtures__/dhan-web-ui-summary-68.csv', import.meta.url), 'utf8');
    const frozen = freezeEvidenceSubmission('synthetic-68.csv', previewBrokerHoldings(csv, 'synthetic-68.csv', AT));
    expect(frozen.preview.counts.nativeRows).toBe(68);
    const first = await childHost();
    const result = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetchVia(first.base));
    expect(result.state).toBe('VERIFIED');
    const bytes = fs.readFileSync(journal(), 'utf8');
    const record = store().readByImportId(tenantId, ownerUserId, result.importId!)!;
    expect(record.rows).toHaveLength(68);
    expect(record.rows.map(r => r.symbol)).toEqual(frozen.preview.holdings.map(r => r.symbol));
    expect(record.readAt).toBe(AT);
    const { recordDigest, ...rest } = record;
    expect(computeEvidenceRecordDigest(rest)).toBe(recordDigest);
    expect(record.ownerUserId).toBe(ownerUserId);
    await stop(first.child, 'SIGKILL');
    const second = await childHost();
    expect(second.child.pid).not.toBe(first.child.pid);
    const lookup = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, true, fetchVia(second.base));
    expect(lookup).toEqual(result);
    const retry = await fetch(second.base + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(frozen) });
    expect(retry.status).toBe(200);
    expect((await retry.json()).duplicate).toBe(true);
    expect(fs.readFileSync(journal(), 'utf8')).toBe(bytes);
    expect(store().list(tenantId, ownerUserId)).toHaveLength(1);
    expect(store().list(tenantId, 'foreign')).toEqual([]);
    console.info('LIVE_HTTP_RESTART_PROOF', JSON.stringify({ importId: result.importId, contentDigest: frozen.preview.contentDigest, recordDigest, readAt: record.readAt, rows: record.rows.length, ownerUserId: record.ownerUserId, firstPid: first.child.pid, secondPid: second.child.pid, firstExitSignal: first.child.signalCode, journalBytes: Buffer.byteLength(bytes), retryJournalUnchanged: fs.readFileSync(journal(), 'utf8') === bytes, retrieval: lookup.state }));
  }, 30000);

  it('serializes simultaneous retries, preserves first digest, and rejects changed filename, row values or portfolio', async () => {
    const h = await host(), frozen = dto();
    const replies = await Promise.all(Array.from({ length: 5 }, () => h.request(frozen)));
    expect(replies.map(r => r.status).sort()).toEqual([200, 200, 200, 200, 201]);
    const acks = await Promise.all(replies.map(r => r.json()));
    expect(new Set(acks.map(a => a.recordDigest)).size).toBe(1);
    const bytes = fs.readFileSync(journal(), 'utf8');
    expect((await h.request({ ...frozen, fileName: 'other.csv' })).status).toBe(409);
    const changed = JSON.parse(JSON.stringify(frozen)); changed.preview.holdings[0].quantity++;
    expect((await h.request(changed)).status).toBe(409);
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', changed, true, fetchVia(h.base))).state).toBe('UNCONFIRMED');
    const volatile = JSON.parse(JSON.stringify(frozen)); volatile.preview.holdings[0].quarantineIds = ['different-volatile-id'];
    expect((await h.request(volatile)).status).toBe(200);
    const other = await fetch(h.base + '/api/broker-import/OTHER/evidence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(frozen) });
    expect(other.status).toBe(409);
    expect(fs.readFileSync(journal(), 'utf8')).toBe(bytes);
  });

  it('resolves trusted owner before body/store; refuses foreign/malformed carriers and request owner keys', async () => {
    const factory = vi.fn(() => { throw new Error('store must not be built'); });
    const h = await host({ evidenceStoreFactory: factory });
    expect((await h.request(dto(), '', { headers: { Origin: 'https://foreign.invalid' } })).status).toBe(403);
    env.IIPS_G3_IPC_BINDING_PROVISIONED = 'false';
    expect((await h.request()).status).toBe(503);
    env.IIPS_G3_IPC_BINDING_PROVISIONED = 'true';
    expect((await h.request(dto(), '?owner=SAIRAM')).status).toBe(400);
    expect((await h.request({ ...dto(), ownerUserId })).status).toBe(400);
    fs.writeFileSync(env.IIPS_BROKER_EVIDENCE_OWNER_PATH!, '{}');
    expect((await h.request()).status).toBe(503);
    fs.unlinkSync(env.IIPS_BROKER_EVIDENCE_OWNER_PATH!);
    expect((await h.request()).status).toBe(503);
    expect(factory).not.toHaveBeenCalled();
    expect(fs.existsSync(journal())).toBe(false);
  });

  it('foreign-scope retained evidence is opaque through A-9; no other route or method admitted', async () => {
    const candidate = buildBrokerImportEvidence({ tenantId, ownerUserId: 'foreign', portfolioSlot: 'DEFAULT_PORTFOLIO', fileName: 'dhan.csv', preview: dto().preview });
    store().retain(candidate);
    const h = await host();
    expect((await fetch(h.base + endpoint + '/' + candidate.importId)).status).toBe(404);
    for (const method of ['GET', 'DELETE', 'PATCH', 'PUT']) expect((await fetch(h.base + endpoint, { method })).status).toBe(405);
    expect((await h.request(dto(), '/extra/leaf')).status).toBe(404);
  });

  it('rejects oversize and strict-schema/semantic errors before append', async () => {
    const h = await host();
    const variants: unknown[] = [null, {}, { ...dto(), rawCsv: CSV }, { ...dto(), preview: { ...dto().preview, ownerUserId } }];
    for (const mutation of [(p: any) => p.counts.nativeRows++, (p: any) => p.counts.savedRows++, (p: any) => p.holdings[0].companyId = 'FAKE', (p: any) => p.asOf = 'bad', (p: any) => p.holdings[0].lookups[0].extra = true, (p: any) => p.warnings = ['x'.repeat(4097)], (p: any) => p.status = 'REJECTED']) {
      const v = JSON.parse(JSON.stringify(dto())); mutation(v.preview); variants.push(v);
    }
    for (const v of variants) expect((await h.request(v)).status).toBe(400);
    expect((await h.request('x'.repeat(4 * 1024 * 1024))).status).toBe(413);
    expect(fs.existsSync(journal())).toBe(false);
    const bad = await fetch(h.base + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }); expect(bad.status).toBe(400);
  });

  it('tampering fails closed for both resubmission and actual A-9 retrieval', async () => {
    const h = await host();
    const ack = await (await h.request()).json();
    const bytes = fs.readFileSync(journal(), 'utf8');
    fs.writeFileSync(journal(), bytes.replace('"quantity":2', '"quantity":3'));
    const response = await h.request();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ outcome: 'EVIDENCE_TAMPERED' });
    expect((await fetch(h.base + ack.retrievalPath)).status).toBe(503);
  });

  it('directory/header/append errors never acknowledge retention; a fresh attempt safely recovers', async () => {
    const h = await host();
    fs.mkdirSync(env.IIPS_DATA_DIR!, { recursive: true });
    fs.mkdirSync(journal()); // header append fails (path is a directory)
    expect((await h.request()).status).toBe(503);
    fs.rmdirSync(journal());
    const failing = await host({ evidenceStoreFactory: dataDir => {
      const real = new BrokerImportEvidenceStore({ dataDir });
      let calls = 0;
      const injected = new PersistenceService({ dataDir, fs: { ...fs, appendFileSync: (p, data) => {
        if (++calls === 2) throw new Error('injected record append failure');
        fs.appendFileSync(p, data);
      } } });
      return { readByImportId: real.readByImportId.bind(real), retain: record => {
        injected.append({ tenantId, ownerUserId, dedupKey: 'IIPS_BROKER_IMPORT_EVIDENCE_V1:' + record.importId, payload: record });
        throw new Error('failure was not injected');
      } };
    } });
    expect((await failing.request()).status).toBe(503);
    expect(store().list(tenantId, ownerUserId)).toHaveLength(0);
    expect((await h.request()).status).toBe(201);
    const file = path.join(root, 'not-dir'); fs.writeFileSync(file, 'x'); env.IIPS_DATA_DIR = path.join(file, 'store');
    expect((await h.request()).status).toBe(503);
  });

  it('append-before-ack/read-back failure is unknown; GET and frozen retry reconcile it without replacement', async () => {
    let constructors = 0;
    const h = await host({ evidenceStoreFactory: dataDir => {
      const real = new BrokerImportEvidenceStore({ dataDir });
      if (++constructors === 2) return { retain: real.retain.bind(real), readByImportId: () => { throw new Error('injected read-back failure'); } };
      return real;
    } });
    const frozen = dto();
    const failed = await h.request(frozen); expect(failed.status).toBe(503);
    expect(await failed.json()).toEqual({ outcome: 'EVIDENCE_UNAVAILABLE' });
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, true, fetchVia(h.base))).state).toBe('VERIFIED');
    const bytes = fs.readFileSync(journal(), 'utf8');
    expect((await h.request(frozen)).status).toBe(200);
    expect(fs.readFileSync(journal(), 'utf8')).toBe(bytes);
  });

  it('lost POST acknowledgement after actual HTTP commit recovers by lookup and same-snapshot retry', async () => {
    const h = await host(), frozen = dto();
    const drop: typeof fetch = async (url, init) => {
      const response = await fetchVia(h.base)(url, init);
      if (init?.method === 'POST') { await response.text(); throw new Error('acknowledgement lost'); }
      return response;
    };
    const uncertain = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, drop);
    expect(uncertain.state).toBe('UNCONFIRMED');
    const bytes = fs.readFileSync(journal(), 'utf8');
    const recovered = await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, true, fetchVia(h.base));
    expect(recovered.state).toBe('VERIFIED');
    expect((await retainAndVerifyEvidence('DEFAULT_PORTFOLIO', frozen, false, fetchVia(h.base)))).toEqual(recovered);
    expect(fs.readFileSync(journal(), 'utf8')).toBe(bytes);
  });

  it('truncated final append recovers via existing PF-1; malformed interior fails closed without consumer repair', async () => {
    const h = await host(), frozen = dto();
    await h.request(frozen);
    fs.appendFileSync(journal(), '{"partial":');
    expect((await h.request(frozen)).status).toBe(200);
    expect(store().list(tenantId, ownerUserId)).toHaveLength(1);
    const bytes = fs.readFileSync(journal(), 'utf8');
    fs.writeFileSync(journal(), bytes.split('\n')[0] + '\n{bad}\n' + bytes.split('\n').slice(1).join('\n'));
    const bad = fs.readFileSync(journal(), 'utf8');
    expect((await h.request(frozen)).status).toBe(503);
    expect(fs.readFileSync(journal(), 'utf8')).toBe(bad);
  });

  it('accepts actual resolved and unresolved snapshots, never arbitrary identity/count claims', () => {
    expect(validateEvidenceSubmission(dto())).toBe(true);
    const unresolved = freezeEvidenceSubmission('dhan.csv', previewBrokerHoldings(CSV.replace('RELIANCE', 'UNKNOWN_SECURITY'), 'dhan.csv', AT));
    expect(validateEvidenceSubmission(unresolved)).toBe(true);
    expect(Object.isFrozen(unresolved.preview.holdings[0])).toBe(true);
    const huge = JSON.parse(JSON.stringify(dto())); huge.preview.holdings = Array(10001).fill(huge.preview.holdings[0]);
    expect(validateEvidenceSubmission(huge)).toBe(false);
    const infinite = JSON.parse(JSON.stringify(dto())); infinite.preview.holdings[0].quantity = Infinity;
    expect(validateEvidenceSubmission(infinite)).toBe(false);
    let nested: any = {}; for (let i = 0; i < 13; i++) nested = { nested };
    expect(validateEvidenceSubmission({ ...dto(), nested })).toBe(false);
  });
});
