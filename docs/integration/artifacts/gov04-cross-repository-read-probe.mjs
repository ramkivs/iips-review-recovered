/** Diagnostic only, NOT Gate A′/4/5 execution. Uses and removes a disposable store.
 * Run after building the supplied IPD checkout:
 * frontend/node_modules/.bin/tsx docs/integration/artifacts/gov04-cross-repository-read-probe.mjs /absolute/ipd baseline
 * For the published Q1 patch reconstructed in a scratch checkout, use `candidate`.
 * Never pass an operational database: this script accepts no database argument.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { IpcUserPortfolioPort } from '../../../frontend/server/user-portfolio/ipcPortAdapter.ts';
import { callIpc } from '../../../frontend/server/user-portfolio/ipcClient.ts';

const [checkout, mode] = process.argv.slice(2);
assert.ok(checkout && ['baseline', 'candidate'].includes(mode), 'provide IPD checkout and baseline|candidate');
const load = (path) => import(pathToFileURL(join(resolve(checkout), 'dist/src', path)).href);
const { startIpcServer } = await load('ipc/entrypoint.js');
const { openDatabase, closeDatabase } = await load('persistence/connection.js');
const { DurablePortfolioStore } = await load('persistence/portfolio_store.js');
const { inspectBindings } = await load('persistence/binding.js');
const { provisionActiveBinding } = await load('persistence/provisioning.js');
const root = mkdtempSync(join(tmpdir(), 'gov04-diagnostic-'));
let outcome;
try {
  const database = join(root, 'store.db');
  outcome = await startIpcServer({ env: {
    IIPS_G3_DATABASE_PATH: database,
    IIPS_G2_IPC_ENDPOINT: `gov04-${process.pid}`,
    IIPS_G3_LOCAL_STATE_DIR: join(root, 'state'),
  } });
  assert.equal(outcome.ok, true, outcome.error);
  const target = { kind: 'unix-socket', path: outcome.target.path, source: 'absolute-path' };
  const db = openDatabase(database);
  assert.deepEqual(inspectBindings(db), { bindings: [], memberships: [] });
  assert.throws(() => provisionActiveBinding(db, { act: 'gate-a-prime', issuedAt: 'fixture' }, {
    principalLabel: 'fixture', tenantId: 'tenant-a', canonicalOwnerId: 'owner-a',
  }), /not authorized/);
  assert.deepEqual(inspectBindings(db), { bindings: [], memberships: [] });
  const raw = (op, payload) => callIpc(op, payload, { target });
  assert.equal((await raw('portfolio.list')).kind, 'CLASS_P');
  // SQL below creates TEST FIXTURES ONLY, never an operational binding.
  const now = new Date().toISOString();
  db.prepare("INSERT INTO local_principal_bindings VALUES ('b', 'fixture', 'ACTIVE', ?, ?, NULL)").run(now, now);
  db.prepare("INSERT INTO local_principal_memberships VALUES ('m', 'b', 'tenant-a', 'owner-a', 'ACTIVE', ?, ?, NULL)").run(now, now);
  const store = new DurablePortfolioStore(db);
  const request = { holdings: [{ symbol: 'FIXTURE', companyId: 'FIXTURE-ID', quantity: 1,
    averageBuyPrice: 100, currentPrice: 100, marketValue: 100, weightPercentage: 100,
    active: true, sourceBroker: 'GENERIC', lineageDigest: 'a'.repeat(64),
    identityStatus: 'RESOLVED', resolutionDisposition: 'CANONICAL_P04' }], provenanceDigest: 'b'.repeat(64) };
  store.create({ canonicalOwnerId: 'owner-a', tenantId: 'tenant-a' }, 'P-A', request);
  store.create({ canonicalOwnerId: 'owner-b', tenantId: 'tenant-b' }, 'P-B', request);
  const list = await raw('portfolio.list');
  assert.equal(list.kind, 'SUCCESS');
  const rows = mode === 'baseline' ? list.frame.result.portfolios : list.frame.result;
  assert.deepEqual(rows.map((row) => row.portfolioId), ['P-A']);
  assert.deepEqual(await raw('portfolio.get', { portfolioId: 'P-B' }),
    await raw('portfolio.get', { portfolioId: 'P-MISSING' }));
  // No transport injection: IRR's actual client talks to the real IPD endpoint.
  const port = new IpcUserPortfolioPort({ target, precondition: { bindingProvisioned: true } });
  const scope = { tenantHint: 'local-diagnostic-only' };
  const refusals = [];
  for (const [method, params, fields] of [
    ['listPortfolios', { scope }, ['weightSumPercentage', 'provenanceDigest', 'isSaved']],
    ['getPortfolio', { scope, portfolioId: 'P-A' }, ['isSaved']],
    ['revisionHistory', { scope, portfolioId: 'P-A' }, ['totalMarketValue', 'provenanceDigest', 'holdingsCount']],
  ]) {
    await assert.rejects(() => port[method](params), (error) => {
      assert.equal(error.reason, 'UPSTREAM_UNAVAILABLE');
      if (mode === 'candidate') for (const field of fields) assert.ok(error.message.includes(field), error.message);
      refusals.push({ method, message: error.message });
      return true;
    });
  }
  // Switch server-owned context; no caller can select it. No cached A data leaks.
  db.prepare("UPDATE local_principal_memberships SET tenant_id='tenant-b', canonical_owner_id='owner-b' WHERE membership_id='m'").run();
  const switched = await raw('portfolio.list');
  assert.equal(switched.kind, 'SUCCESS');
  const switchedRows = mode === 'baseline' ? switched.frame.result.portfolios : switched.frame.result;
  assert.deepEqual(switchedRows.map((row) => row.portfolioId), ['P-B']);
  assert.deepEqual(await raw('portfolio.get', { portfolioId: 'P-A' }),
    await raw('portfolio.get', { portfolioId: 'P-MISSING' }));
  db.prepare("UPDATE local_principal_bindings SET status='REVOKED' WHERE binding_id='b'").run();
  const revoked = await raw('portfolio.list');
  assert.equal(revoked.kind, 'CLASS_P');
  assert.equal(revoked.bytesReceived, 0);
  console.log(JSON.stringify({ mode, result: 'PASS', operationalBinding: false,
    qualified: false, realSocketFixtureRead: true, contextSwitchIsolation: true, refusals }, null, 2));
} finally {
  if (outcome?.handle) await outcome.handle.stop();
  closeDatabase();
  rmSync(root, { recursive: true, force: true });
}
