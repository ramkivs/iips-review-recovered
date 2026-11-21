/**
 * OUT-OF-TREE Stage 5 probe (not committed to either repository).
 * REAL IPD main@4716d0bc (compiled dist: dispatch + store + sqlite + migrations + endpoint)
 *   <-> REAL IRR consumer (callIpc, IpcUserPortfolioPort, handleUserPortfolioRequest).
 * Disposable synthetic SQLite fixture mirroring IPD's own tests/s1_d02_read_relationship.test.ts.
 * Narrowest faithful production-code-path test; NOT live host evidence.
 */
import http from 'node:http';
import net from 'node:net';
import type { AddressInfo } from 'node:net';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
const afterAll = after; const beforeAll = before;
// minimal expect shim over node:assert
function expect(actual: any) {
  return {
    toBe: (e: any) => assert.equal(actual, e),
    toEqual: (e: any) => assert.deepEqual(actual, e),
    toMatchObject: (e: Record<string, unknown>) => { for (const [k, v] of Object.entries(e)) assert.deepEqual(actual[k], v, k); },
    toThrow: () => assert.throws(actual),
    toContain: (e: any) => assert.ok(String(actual).includes(e)),
    not: {
      toThrow: () => assert.doesNotThrow(actual),
      toContain: (e: any) => assert.ok(!String(actual).includes(e), `must not contain ${e}`),
    },
  };
}
(expect as any).objectContaining = (o: any) => o;

const IPD = '/tmp/ipd/dist/src';
const IRR = '/home/user/iips-review-recovered/frontend/server';
const { ensureMigrations } = await import(`${IPD}/persistence/migration_ledger.js`);
const { GATE3_MIGRATIONS } = await import(`${IPD}/ipc/entrypoint.js`);
const { createConnectionHandler } = await import(`${IPD}/ipc/dispatch.js`);
const { listenIpc, resolveEndpointTarget, settlementPolicyForEndpoint } = await import(`${IPD}/ipc/endpoint.js`);
const { DurablePortfolioStore } = await import(`${IPD}/persistence/portfolio_store.js`);

const irrClient = await import(`${IRR}/user-portfolio/ipcClient.ts`);
const { IPC_ENDPOINT_SETTING, IPC_CALLER_IDENTITY_KEYS, findResponseDisclosedKeys, parseResponseFrame, callIpc } = irrClient;
const { BINDING_PRECONDITION_SETTING } = await import(`${IRR}/user-portfolio/ownerContextFromBinding.ts`);
const { IpcUserPortfolioPort } = await import(`${IRR}/user-portfolio/ipcPortAdapter.ts`);
const { handleUserPortfolioRequest } = await import(`${IRR}/user-portfolio-transport.ts`);
const { createPortfolioHoldingsProvider } = await import(`${IRR}/investment/sources.ts`);

const S1 = { canonicalOwnerId: 'ipd-owner-ramki-personal', tenantId: 'ipd-personal-local' };
const D02 = { canonicalOwnerId: 'owner-4dc756b3', tenantId: S1.tenantId };
const B = 'c5808abaffd072d6401ce63ad86c6ac0';
const M = 'd25dcc5370100b00766efc5166f65cf3';
const NOW = '2026-11-19T00:00:00.000Z';
const holding = (price: number) => ({
  symbol: 'SYN', companyId: 'SYN', quantity: 1, averageBuyPrice: 10, currentPrice: price, marketValue: price,
  weightPercentage: 100, active: true, sourceBroker: 'GENERIC', lineageDigest: 'a'.repeat(64),
  identityStatus: 'RESOLVED', resolutionDisposition: 'CANONICAL_P04',
});
const request = (price: number) => ({ holdings: [holding(price)], provenanceDigest: 'b'.repeat(64) });

function rawWire(path: string, value: unknown): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const s = net.createConnection({ path }); const chunks: Buffer[] = [];
    s.setTimeout(5000, () => s.destroy(new Error('timeout')));
    s.on('data', (b) => chunks.push(b)); s.on('error', reject); s.on('close', () => resolve(Buffer.concat(chunks)));
    s.on('connect', () => { const body = Buffer.from(JSON.stringify(value)); const p = Buffer.alloc(4); p.writeUInt32BE(body.length); s.write(Buffer.concat([p, body]), () => s.end()); });
  });
}
const bodyOf = (b: Buffer) => JSON.parse(b.subarray(4).toString('utf8'));
const KEYS_RE = new RegExp(`"(${IPC_CALLER_IDENTITY_KEYS.join('|')})"\\s*:`);
const allKeysDeep = (v: unknown, acc = new Set<string>()): Set<string> => {
  if (Array.isArray(v)) v.forEach((x) => allKeysDeep(x, acc));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { acc.add(k); allKeysDeep(x, acc); }
  return acc;
};

interface Fixture { path: string; db: DatabaseSync; store: any; close(): Promise<void>; }
async function fixture(ipdEnv: Record<string, string>): Promise<Fixture> {
  const root = mkdtempSync(join(tmpdir(), 's5-real-ipd-'));
  const file = join(root, 'fixture.db');
  let db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=DELETE');
  ensureMigrations(db, GATE3_MIGRATIONS);
  db.prepare("INSERT INTO local_principal_bindings VALUES (?,?,'ACTIVE',?,?,NULL)").run(B, 'ramki-personal-local', NOW, NOW);
  db.prepare("INSERT INTO local_principal_memberships VALUES (?,?,?,?,'ACTIVE',?,?,NULL)").run(M, B, S1.tenantId, S1.canonicalOwnerId, NOW, NOW);
  let store = new DurablePortfolioStore(db);
  store.create(S1, 'SHARED', request(11));
  store.create(D02, 'SHARED', request(22));
  store.create(D02, 'D02_ONLY', request(23));
  store.create({ canonicalOwnerId: 'foreign', tenantId: 'foreign' }, 'FOREIGN', request(33));
  db.close(); db = new DatabaseSync(file); db.exec('PRAGMA foreign_keys=ON'); store = new DurablePortfolioStore(db);
  const target = resolveEndpointTarget({ IIPS_G2_IPC_ENDPOINT: `s5-${process.pid}-${Math.random().toString(36).slice(2)}`, IIPS_G3_LOCAL_STATE_DIR: join(root, 'state') }, 'linux');
  const handle = await listenIpc(target, createConnectionHandler(db, { settlement: settlementPolicyForEndpoint(target), env: ipdEnv }), { platform: 'linux' });
  return { path: target.path, db, store, close: async () => { await handle.stop(); db.close(); rmSync(root, { recursive: true, force: true }); } };
}

const captured: Record<string, unknown> = {};
afterAll(() => { writeFileSync('/tmp/harness/probe/s5-real-ipd-captured-frames.json', JSON.stringify(captured, null, 2)); });

for (const [label, ipdEnv] of [['IPD env {} (governed v1)', {}], ['IPD env IIPS_LOCAL_PERSONAL_USE=1 (personal v1)', { IIPS_LOCAL_PERSONAL_USE: '1' }]] as const) {
  describe(`real IPD main@4716d0bc — ${label}`, () => {
    let f: Fixture; let server: http.Server; let base: string;
    const savedE = process.env[IPC_ENDPOINT_SETTING]; const savedB = process.env[BINDING_PRECONDITION_SETTING];
    beforeAll(async () => {
      f = await fixture(ipdEnv as Record<string, string>);
      process.env[IPC_ENDPOINT_SETTING] = f.path; process.env[BINDING_PRECONDITION_SETTING] = 'true';
      server = http.createServer((req, res) => { void handleUserPortfolioRequest(req, res); });
      await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
      base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });
    afterAll(async () => {
      await new Promise<void>((r) => server.close(() => r())); await f.close();
      if (savedE === undefined) delete process.env[IPC_ENDPOINT_SETTING]; else process.env[IPC_ENDPOINT_SETTING] = savedE;
      if (savedB === undefined) delete process.env[BINDING_PRECONDITION_SETTING]; else process.env[BINDING_PRECONDITION_SETTING] = savedB;
    });

    it('v1 (what IRR speaks): raw serialized list/get/revisions frames pass IRR 29-key scan; exact key inventory recorded', async () => {
      const out: Record<string, unknown> = {};
      for (const [op, payload] of [['portfolio.list', undefined], ['portfolio.get', { portfolioId: 'SHARED' }], ['portfolio.revisions', { portfolioId: 'SHARED' }]] as const) {
        const raw = await rawWire(f.path, { v: 1, op, ...(payload ? { payload } : {}), requestId: 'probe' });
        expect(raw.readUInt32BE(0)).toBe(raw.length - 4);
        const frame = bodyOf(raw);
        out[op] = { envelopeKeys: Object.keys(frame).sort(), allKeysDeep: [...allKeysDeep(frame)].sort(), disclosed: findResponseDisclosedKeys(frame), body: frame };
        expect(Object.keys(frame).sort()).toEqual(['ok', 'op', 'requestId', 'result', 'v']);
        expect(frame.v).toBe(1); expect(frame.ok).toBe(true);
        expect(findResponseDisclosedKeys(frame)).toEqual([]);
        expect(KEYS_RE.test(raw.subarray(4).toString('utf8'))).toBe(false);
        expect(() => parseResponseFrame(frame)).not.toThrow();
        const text = JSON.stringify(frame);
        expect(text).not.toContain(S1.canonicalOwnerId); expect(text).not.toContain(D02.canonicalOwnerId); expect(text).not.toContain(B); expect(text).not.toContain(M);
      }
      captured[`${label} :: v1`] = out;
    });

    it('v2 (the D02 read path IRR does NOT speak): raw serialized frames pass IRR 29-key scan; key inventory recorded', async () => {
      const out: Record<string, unknown> = {};
      for (const [op, payload] of [['portfolio.list', undefined], ['portfolio.get', { portfolioId: 'SHARED' }], ['portfolio.revisions', { portfolioId: 'SHARED' }]] as const) {
        const raw = await rawWire(f.path, { v: 2, op, ...(payload ? { payload } : {}), requestId: 'probe' });
        const frame = bodyOf(raw);
        out[op] = { envelopeKeys: Object.keys(frame).sort(), allKeysDeep: [...allKeysDeep(frame)].sort(), disclosed: findResponseDisclosedKeys(frame), body: frame };
        expect(Object.keys(frame).sort()).toEqual(['ok', 'op', 'requestId', 'result', 'v']);
        expect(frame.v).toBe(2); expect(frame.ok).toBe(true);
        expect(findResponseDisclosedKeys(frame)).toEqual([]);
        const text = JSON.stringify(frame);
        expect(text).not.toContain(S1.canonicalOwnerId); expect(text).not.toContain(D02.canonicalOwnerId); expect(text).not.toContain(B);
        if (op === 'portfolio.get') expect(frame.result.holdings[0].currentPrice).toBe(11);
        if (op === 'portfolio.list') expect(frame.result.map((r: any) => r.portfolioId)).toEqual(['SHARED']);
      }
      const v2frame = bodyOf(await rawWire(f.path, { v: 2, op: 'portfolio.list', requestId: 'probe' }));
      expect(() => parseResponseFrame(v2frame)).toThrow();
      captured[`${label} :: v2`] = out;
    });

    it('IRR real callIpc + IpcUserPortfolioPort + HTTP transport against real IPD', async () => {
      const list = await callIpc('portfolio.list', undefined);
      expect(list.kind).toBe('SUCCESS');
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true } });
      const summaries = await port.listPortfolios({ scope: {} });
      expect(summaries.map((s: any) => s.portfolioId)).toEqual(['SHARED']);
      expect(summaries[0]).toMatchObject({ revision: 1, totalHoldingsCount: 1, weightSumPercentage: 100, provenanceDigest: 'b'.repeat(64) });
      const revs = await port.revisionHistory({ scope: {}, portfolioId: 'SHARED' });
      assert.equal(revs.length, 1); expect(revs[0]).toMatchObject({ revision: 1, operation: 'INITIAL', holdingsCount: 1, totalMarketValue: 11 });
      let getResult: string;
      try {
        const view = await port.getPortfolio({ scope: {}, portfolioId: 'SHARED' });
        expect(view.holdings[0].currentPrice).toBe(11); expect(view.contributions).toEqual([]);
        getResult = `OK holdingKeys=${Object.keys(view.holdings[0]).sort().join(',')}`;
        const provider = createPortfolioHoldingsProvider({ portFactory: () => port });
        const obs = await provider('SHARED');
        getResult += ` | holdings provider observations=${obs.length}`;
      } catch (e: any) { getResult = `REFUSED ${e.reason}: ${e.message}`; }
      const http1 = await fetch(`${base}/api/user-portfolios?ownerId=${D02.canonicalOwnerId}`, { headers: { 'x-owner-id': S1.canonicalOwnerId, authorization: 'Bearer hostile' } });
      const http2 = await fetch(`${base}/api/user-portfolios/SHARED`);
      const http3 = await fetch(`${base}/api/user-portfolios/SHARED/revisions`);
      const http404 = await fetch(`${base}/api/user-portfolios/D02_ONLY`);
      const httpForeign = await fetch(`${base}/api/user-portfolios/FOREIGN`);
      const write = await fetch(`${base}/api/user-portfolios/SHARED/holdings`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expectedRevision: 1, holdings: [holding(99)] }) });
      const summary = { 'port.getPortfolio': getResult, 'GET list': `${http1.status} ${await http1.text()}`, 'GET detail': `${http2.status} ${(await http2.text()).slice(0, 400)}`, 'GET revisions': `${http3.status} ${await http3.text()}`, 'GET D02_ONLY': `${http404.status} ${await http404.text()}`, 'GET FOREIGN': `${httpForeign.status} ${await httpForeign.text()}`, 'PUT holdings (IRR personal-use off)': `${write.status} ${await write.text()}` };
      captured[`${label} :: IRR consumer`] = summary;
      console.log(label, JSON.stringify(summary, null, 1));
      expect(http1.status).toBe(200); expect(http3.status).toBe(200);
      expect(http404.status).toBe(404); expect(httpForeign.status).toBe(404); expect(write.status).toBe(503);
    });
  });
}
