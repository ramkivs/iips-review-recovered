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
const { IPC_ENDPOINT_SETTING, IPC_CALLER_IDENTITY_KEYS, findResponseDisclosedKeys, parseResponseFrame, callIpc, IPC_PROTOCOL_VERSION_V2 } = irrClient;
const { BINDING_PRECONDITION_SETTING } = await import(`${IRR}/user-portfolio/ownerContextFromBinding.ts`);
const { IpcUserPortfolioPort } = await import(`${IRR}/user-portfolio/ipcPortAdapter.ts`);
const { handleUserPortfolioRequest } = await import(`${IRR}/user-portfolio-transport.ts`);
const { createPortfolioHoldingsProvider, createHoldingsProvider } = await import(`${IRR}/investment/sources.ts`);
import { readFileSync } from 'node:fs';
const PRIOR = JSON.parse(readFileSync('/home/user/iips-review-recovered/docs/integration/artifacts/iid-s5-real-ipd-captured-frames-2026-11-21.json', 'utf8'));
const INSTANT = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g;
const normalize = (v: unknown) => JSON.parse(JSON.stringify(v).replace(INSTANT, '<instant>'));

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
async function fixture(ipdEnv: Record<string, string>, principalLabel = 'ramki-personal-local'): Promise<Fixture & { connections(): number }> {
  const root = mkdtempSync(join(tmpdir(), 's5-real-ipd-'));
  const file = join(root, 'fixture.db');
  let db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=DELETE');
  ensureMigrations(db, GATE3_MIGRATIONS);
  db.prepare("INSERT INTO local_principal_bindings VALUES (?,?,'ACTIVE',?,?,NULL)").run(B, principalLabel, NOW, NOW);
  db.prepare("INSERT INTO local_principal_memberships VALUES (?,?,?,?,'ACTIVE',?,?,NULL)").run(M, B, S1.tenantId, S1.canonicalOwnerId, NOW, NOW);
  let store = new DurablePortfolioStore(db);
  store.create(S1, 'SHARED', request(11));
  store.create(D02, 'SHARED', request(22));
  store.create(D02, 'D02_ONLY', request(23));
  store.create({ canonicalOwnerId: 'foreign', tenantId: 'foreign' }, 'FOREIGN', request(33));
  db.close(); db = new DatabaseSync(file); db.exec('PRAGMA foreign_keys=ON'); store = new DurablePortfolioStore(db);
  const target = resolveEndpointTarget({ IIPS_G2_IPC_ENDPOINT: `s5-${process.pid}-${Math.random().toString(36).slice(2)}`, IIPS_G3_LOCAL_STATE_DIR: join(root, 'state') }, 'linux');
  const inner = createConnectionHandler(db, { settlement: settlementPolicyForEndpoint(target), env: ipdEnv });
  let accepted = 0;
  const handle = await listenIpc(target, (socket: net.Socket) => { accepted += 1; inner(socket); }, { platform: 'linux' });
  return { path: target.path, db, store, connections: () => accepted, close: async () => { await handle.stop(); db.close(); rmSync(root, { recursive: true, force: true }); } };
}


const captured: Record<string, unknown> = {};
afterAll(() => { writeFileSync('/tmp/harness/probe/s5-real-ipd-v2-captured-frames.json', JSON.stringify(captured, null, 2)); });

for (const [label, ipdEnv] of [['IPD env {} (governed v1)', {}], ['IPD env IIPS_LOCAL_PERSONAL_USE=1 (personal v1)', { IIPS_LOCAL_PERSONAL_USE: '1' }]] as const) {
  describe(`real IPD main@4716d0bc — IRR v2 read channel — ${label}`, () => {
    let f: Awaited<ReturnType<typeof fixture>>; let server: http.Server; let base: string;
    const savedE = process.env[IPC_ENDPOINT_SETTING]; const savedB = process.env[BINDING_PRECONDITION_SETTING];
    beforeAll(async () => {
      f = await fixture(ipdEnv as Record<string, string>);
      process.env[IPC_ENDPOINT_SETTING] = f.path; process.env[BINDING_PRECONDITION_SETTING] = 'true'; delete process.env.IIPS_LOCAL_PERSONAL_USE;
      server = http.createServer((req, res) => { void handleUserPortfolioRequest(req, res); });
      await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
      base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });
    afterAll(async () => {
      await new Promise<void>((r) => server.close(() => r())); await f.close();
      if (savedE === undefined) delete process.env[IPC_ENDPOINT_SETTING]; else process.env[IPC_ENDPOINT_SETTING] = savedE;
      if (savedB === undefined) delete process.env[BINDING_PRECONDITION_SETTING]; else process.env[BINDING_PRECONDITION_SETTING] = savedB;
    });

    it('§9.1/9.7 — IRR callIpc(protocolVersion 2): frames are v2, pass the 29-key scan, equal the d22f156 capture modulo instants', async () => {
      const out: Record<string, unknown> = {};
      const prior = PRIOR[`${label} :: v2`];
      for (const [op, payload] of [['portfolio.list', undefined], ['portfolio.get', { portfolioId: 'SHARED' }], ['portfolio.revisions', { portfolioId: 'SHARED' }]] as const) {
        const r = await callIpc(op, payload, { protocolVersion: IPC_PROTOCOL_VERSION_V2, requestId: 'probe' });
        expect(r.kind).toBe('SUCCESS');
        expect(r.frame.v).toBe(2);
        expect(findResponseDisclosedKeys(r.frame)).toEqual([]);
        expect(normalize(r.frame)).toEqual(normalize(prior[op].body));
        out[op] = { envelopeKeys: Object.keys(r.frame).sort(), allKeysDeep: [...allKeysDeep(r.frame)].sort(), body: r.frame };
      }
      captured[`${label} :: callIpc v2`] = out;
    });

    it('§9.1/9.2 — v2 IpcUserPortfolioPort: list, revisions, and detail WITH the R-1 ledger (was DR-4r 503 before R-1)', async () => {
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, protocolVersion: 2 });
      const summaries = await port.listPortfolios({ scope: {} });
      expect(summaries.map((s: any) => s.portfolioId)).toEqual(['SHARED']);
      expect(summaries[0]).toMatchObject({ revision: 1, totalHoldingsCount: 1, weightSumPercentage: 100, provenanceDigest: 'b'.repeat(64), isSaved: false });
      const revs = await port.revisionHistory({ scope: {}, portfolioId: 'SHARED' });
      assert.equal(revs.length, 1); expect(revs[0]).toMatchObject({ revision: 1, operation: 'INITIAL', holdingsCount: 1, totalMarketValue: 11 });
      const view = await port.getPortfolio({ scope: {}, portfolioId: 'SHARED' });
      expect(view.holdings[0].currentPrice).toBe(11);
      expect(view.contributions).toEqual([]);
      assert.equal(view.contributionLedger.length, 1);
      const row = view.contributionLedger[0];
      assert.match(row.contributionId, /^[a-f0-9]{64}$/);
      expect(row).toMatchObject({ amount: 11, fileName: null, sourceBroker: null, contentDigest: null, lineageDigest: null, importedAt: null, semantics: null, importId: null, snapshotState: null, unresolvedCount: null });
      // The ledger row IS the store's validated row (same snapshot, nothing re-shaped).
      const stored = f.store.contributionsValidated(S1, 'SHARED');
      expect(view.contributionLedger).toEqual(stored);
      captured[`${label} :: v2 port detail`] = { contributions: view.contributions, contributionLedger: view.contributionLedger, holdingKeys: Object.keys(view.holdings[0]).sort() };
    });

    it('§9.3 — D02_ONLY and FOREIGN under v2: Class A RESOURCE_UNAVAILABLE → NOT_FOUND → HTTP 404', async () => {
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, protocolVersion: 2 });
      for (const id of ['D02_ONLY', 'FOREIGN']) {
        const e = await port.getPortfolio({ scope: {}, portfolioId: id }).then(() => null, (x: any) => x);
        expect(e.reason).toBe('NOT_FOUND');
      }
      expect((await fetch(`${base}/api/user-portfolios/D02_ONLY`)).status).toBe(404);
      expect((await fetch(`${base}/api/user-portfolios/FOREIGN`)).status).toBe(404);
    });

    it('§9.5 — v2 port write methods: refused by IRR, ZERO connections reach the real dispatcher', async () => {
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, protocolVersion: 2 });
      const before = f.connections();
      for (const run of [
        () => port.saveHoldings({ scope: {}, portfolioId: 'SHARED', holdings: [holding(99)], expectedRevision: 1 }),
        () => port.createPortfolio({ scope: {}, portfolioName: 'x' }),
        () => port.resetPortfolio({ scope: {}, portfolioId: 'SHARED', expectedRevision: 1 }),
        () => port.deletePortfolio({ scope: {}, portfolioId: 'SHARED', expectedRevision: 1 }),
      ]) { const e = await run().then(() => null, (x: any) => x); expect(e.reason).toBe('UPSTREAM_UNAVAILABLE'); }
      expect(f.connections()).toBe(before);
      // The store is untouched: still revision 1, still price 11.
      expect(f.store.get(S1, 'SHARED').revision).toBe(1);
    });

    it('§9 — Stage 5 HTTP read route + both holdings providers over the real dispatcher (v2); write route unchanged (v1, refused with personal use off)', async () => {
      const list = await fetch(`${base}/api/user-portfolios?ownerId=${D02.canonicalOwnerId}`, { headers: { 'x-owner-id': S1.canonicalOwnerId, authorization: 'Bearer hostile' } });
      const detail = await fetch(`${base}/api/user-portfolios/SHARED`);
      const revisions = await fetch(`${base}/api/user-portfolios/SHARED/revisions`);
      const before = f.connections();
      const write = await fetch(`${base}/api/user-portfolios/SHARED/holdings`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expectedRevision: 1, holdings: [holding(99)] }) });
      const detailBody = await detail.json() as any;
      const summary = {
        'GET list': `${list.status}`, 'GET detail': `${detail.status} contributions=${JSON.stringify(detailBody.portfolio?.contributions)} ledger=${detailBody.portfolio?.contributionLedger?.length}`,
        'GET revisions': `${revisions.status}`, 'PUT holdings (IRR personal-use off)': `${write.status} ${await write.text()} connections=${f.connections() - before}`,
      };
      captured[`${label} :: IRR Stage 5 routes`] = summary; console.log(label, JSON.stringify(summary));
      expect(list.status).toBe(200); expect(detail.status).toBe(200); expect(revisions.status).toBe(200);
      expect(detailBody.portfolio.contributions).toEqual([]); assert.equal(detailBody.portfolio.contributionLedger.length, 1);
      expect(write.status).toBe(503); expect(f.connections() - before).toBe(0);
      const all = await createHoldingsProvider()(); assert.equal(all.length, 1); expect(all[0].portfolioId).toBe('SHARED');
      const one = await createPortfolioHoldingsProvider()('SHARED'); assert.equal(one.length, 1);
    });

    it('§9.6 — control: the v1 channel is unchanged (v1 port detail still follows the IPD env mode; DR-4r unchanged)', async () => {
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true } });
      expect(port.protocolVersion).toBe(1);
      const e = await port.getPortfolio({ scope: {}, portfolioId: 'SHARED' }).then((v: any) => ({ ok: true, contributions: v.contributions, ledger: v.contributionLedger }), (x: any) => ({ ok: false, reason: x.reason }));
      captured[`${label} :: v1 port detail (control)`] = e;
      if ('IIPS_LOCAL_PERSONAL_USE' in ipdEnv) { expect(e).toEqual({ ok: true, contributions: [], ledger: undefined }); }
      else { expect(e).toEqual({ ok: false, reason: 'UPSTREAM_UNAVAILABLE' }); }
    });
  });
}

describe('real IPD main@4716d0bc — §9.4 binding component mismatch under v2', () => {
  it('a binding whose principal label is not the approved S1 label → Class P zero bytes → UPSTREAM_UNAVAILABLE; v1 reads still resolve generically', async () => {
    const f = await fixture({}, 'someone-else-local');
    try {
      const v2 = await callIpc('portfolio.list', undefined, { target: { kind: 'unix-socket', path: f.path, source: 'absolute-path' }, protocolVersion: 2 });
      expect(v2.kind).toBe('CLASS_P');
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, protocolVersion: 2, target: { kind: 'unix-socket', path: f.path, source: 'absolute-path' } });
      const e = await port.listPortfolios({ scope: {} }).then(() => null, (x: any) => x);
      expect(e.reason).toBe('UPSTREAM_UNAVAILABLE');
      const v1 = await callIpc('portfolio.list', undefined, { target: { kind: 'unix-socket', path: f.path, source: 'absolute-path' } });
      expect(v1.kind).toBe('SUCCESS');
      captured['mismatched principal label :: v2 vs v1'] = { v2: v2.kind, v1: v1.kind };
    } finally { await f.close(); }
  });
});
