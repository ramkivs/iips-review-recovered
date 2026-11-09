/**
 * Cross-repository end-to-end harness (verification-only; not part of the IRR suite).
 *
 * Drives the REAL IRR transport + the REAL IPD `main` IPC server over a real
 * unix socket, then drives the REAL IRR API client against the IRR HTTP surface.
 *
 * IPD is consumed read-only from a scratch checkout at /tmp/ipd; nothing in the
 * IPD repository is modified.
 */
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const IPD = process.env.IPD_DIR ?? '/tmp/ipd';
const IPD_BUILD = process.env.IPD_BUILD_DIR ?? '/tmp/ipd-build';

const { ensureMigrations } = await import(`${IPD_BUILD}/src/persistence/migration_ledger.js`);
const { GATE3_MIGRATIONS } = await import(`${IPD_BUILD}/src/ipc/entrypoint.js`);
const { resolveEndpointTarget, listenIpc } = await import(`${IPD_BUILD}/src/ipc/endpoint.js`);
const { createConnectionHandler } = await import(`${IPD_BUILD}/src/ipc/dispatch.js`);
const { LOCAL_PERSONAL_USE_SETTING } = await import(`${IPD_BUILD}/src/ipc/localPersonalUse.js`);
const { verifyAuditChain } = await import(`${IPD_BUILD}/src/persistence/audit.js`);

const IRR = process.env.IRR_DIR ?? '/home/user/iips-review-recovered/frontend';
const { handleUserPortfolioRequest } = await import(`${IRR}/server/user-portfolio-transport.ts`);

const HOST_PLATFORM = 'linux';
const OWNER = 'personal-owner';
const TENANT = 'personal-tenant';

const root = mkdtempSync(join(tmpdir(), 'pp-e2e-'));
const dbPath = join(root, 'store', 'ipd.db');
mkdirSync(dirname(dbPath), { recursive: true });

function openRaw(path) {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON');
  return db;
}

function seedBinding(db) {
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO local_principal_bindings (binding_id, principal_label, status, created_at, updated_at, revoked_at) VALUES ('b-personal', 'personal-operator', 'ACTIVE', ?, ?, NULL)",
  ).run(now, now);
  db.prepare(
    "INSERT INTO local_principal_memberships (membership_id, binding_id, tenant_id, canonical_owner_id, status, created_at, updated_at, revoked_at) VALUES ('m-personal', 'b-personal', ?, ?, 'ACTIVE', ?, ?, NULL)",
  ).run(TENANT, OWNER, now, now);
}

async function startIpc(db, name, personalUse) {
  const target = resolveEndpointTarget(
    { IIPS_G2_IPC_ENDPOINT: name, IIPS_G3_LOCAL_STATE_DIR: join(root, `state-${name}`) },
    HOST_PLATFORM,
  );
  const handle = await listenIpc(
    target,
    createConnectionHandler(db, {
      env: { ...process.env, [LOCAL_PERSONAL_USE_SETTING]: personalUse ? '1' : '0' },
    }),
    { platform: HOST_PLATFORM },
  );
  return { handle, path: target.path };
}

async function startIrrHttp(env) {
  const server = createServer((req, res) => {
    void handleUserPortfolioRequest(req, res, { env });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise((resolve) => server.close(() => resolve()));
    },
  };
}

const results = [];
let failures = 0;

function check(name, condition, detail = '') {
  const ok = Boolean(condition);
  if (!ok) failures += 1;
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

try {
  // ---------------------------------------------------------------- setup
  const db = openRaw(dbPath);
  ensureMigrations(db, GATE3_MIGRATIONS);
  seedBinding(db);

  const on = await startIpc(db, 'pp-on', true);
  const off = await startIpc(db, 'pp-off', false);

  const boundEnv = {
    IIPS_G3_IPC_BINDING_PROVISIONED: 'true',
    IIPS_G2_IPC_ENDPOINT: on.path,
    IIPS_LOCAL_PERSONAL_USE: '1',
  };
  const offEnv = {
    IIPS_G3_IPC_BINDING_PROVISIONED: 'true',
    IIPS_G2_IPC_ENDPOINT: off.path,
  };

  const irrOn = await startIrrHttp(boundEnv);
  const irrOff = await startIrrHttp(offEnv);
  const irrNoSwitch = await startIrrHttp({ ...boundEnv, IIPS_LOCAL_PERSONAL_USE: '0' });

  const call = async (base, path, method = 'GET', body) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { __raw: text }; }
    return { status: res.status, body: parsed };
  };

  const HOLDINGS = [
    { symbol: 'RELIANCE', quantity: 10, averageBuyPrice: 2400, currentPrice: 2500, active: true },
    { symbol: 'INFY', quantity: 25, averageBuyPrice: 1500, currentPrice: 1400, active: true },
  ];

  // ------------------------------------------------- 7. authorization disabled
  const denied = await call(irrNoSwitch.baseUrl, '/api/user-portfolios', 'POST', {
    portfolioName: 'My Portfolio',
    holdings: HOLDINGS,
  });
  check('7. write denied when IIPS_LOCAL_PERSONAL_USE is not 1',
    denied.status === 503 && denied.body.error === 'operation-not-admitted',
    `status=${denied.status} body=${JSON.stringify(denied.body)}`);

  // IPD-side default-deny (W-1) with the switch off, straight on the socket.
  const w1 = await call(irrOff.baseUrl, '/api/user-portfolios', 'POST', {
    portfolioName: 'My Portfolio',
    holdings: HOLDINGS,
  });
  check('7b. IPD W-1 default-deny is upstream of IRR (503 operation-not-admitted)',
    w1.status === 503 && w1.body.error === 'operation-not-admitted',
    `status=${w1.status} body=${JSON.stringify(w1.body)}`);

  // ------------------------------------------------- 1. read before creation
  const before = await call(irrOn.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO');
  check('1. read before creation → 404 (not found / indistinguishable)',
    before.status === 404, `status=${before.status} body=${JSON.stringify(before.body)}`);

  // ------------------------------------------------- 2. creation
  const created = await call(irrOn.baseUrl, '/api/user-portfolios', 'POST', {
    portfolioName: 'My Portfolio',
    holdings: HOLDINGS,
  });
  check('2. create → 201 with revision 1 and 2 holdings',
    created.status === 201 && created.body?.portfolio?.revision === 1 &&
      created.body.portfolio.holdings.length === 2 &&
      created.body.portfolio.totalHoldingsCount === 2,
    `status=${created.status} body=${JSON.stringify(created.body)}`);
  check('2b. create: weight sum is exactly 100 (IPD-computed)',
    created.body?.portfolio?.weightSumPercentage === 100,
    `weightSum=${created.body?.portfolio?.weightSumPercentage}`);
  check('2c. create: manual identity sentinel is IPD-owned (MANUAL:<SYMBOL>)',
    created.body?.portfolio?.holdings?.every((h) => h.companyId === `MANUAL:${h.symbol}`),
    JSON.stringify(created.body?.portfolio?.holdings?.map((h) => h.companyId)));

  // ------------------------------------------------- 2. retrieval
  const fetched = await call(irrOn.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO');
  check('3. retrieval returns the same durable view',
    fetched.status === 200 && fetched.body?.portfolio?.revision === 1 &&
      fetched.body.portfolio.holdings.length === 2,
    `status=${fetched.status} body=${JSON.stringify(fetched.body)}`);

  const list = await call(irrOn.baseUrl, '/api/user-portfolios');
  check('3b. list returns the durable portfolio',
    list.status === 200 && list.body?.portfolios?.length === 1 &&
      list.body.portfolios[0].portfolioId === 'DEFAULT_PORTFOLIO',
    `status=${list.status} body=${JSON.stringify(list.body)}`);

  // ------------------------------------------------- 3/4. holdings replacement + revision increment
  const replaced = await call(irrOn.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO/holdings', 'PUT', {
    holdings: [{ symbol: 'RELIANCE', quantity: 20, averageBuyPrice: 2400, currentPrice: 2500, active: true }],
    expectedRevision: 1,
    options: { mode: 'REPLACE' },
  });
  check('3. holdings replacement (REPLACE mode) → 200, revision 2, one holding',
    replaced.status === 200 && replaced.body?.revision === 2 &&
      replaced.body.portfolio.holdings.length === 1 &&
      replaced.body.portfolio.holdings[0].quantity === 20,
    `status=${replaced.status} body=${JSON.stringify(replaced.body)}`);
  check('4. revision incremented 1 → 2',
    replaced.body?.revision === 2, `revision=${replaced.body?.revision}`);

  // ------------------------------------------------- 6. stale revision → 409
  const stale = await call(irrOn.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO/holdings', 'PUT', {
    holdings: [{ symbol: 'RELIANCE', quantity: 21, averageBuyPrice: 2400, currentPrice: 2500, active: true }],
    expectedRevision: 1,
    options: { mode: 'REPLACE' },
  });
  check('6. stale expectedRevision → 409 revision-conflict',
    stale.status === 409 && stale.body?.error === 'revision-conflict',
    `status=${stale.status} body=${JSON.stringify(stale.body)}`);

  // ------------------------------------------------- 5. duplicate / no-op save
  const noop = await call(irrOn.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO/holdings', 'PUT', {
    holdings: [{ symbol: 'RELIANCE', quantity: 20, averageBuyPrice: 2400, currentPrice: 2500, active: true }],
    expectedRevision: 2,
    options: { mode: 'REPLACE' },
  });
  check('5. duplicate/no-op save → 200, revision unchanged at 2, isDuplicate true',
    noop.status === 200 && noop.body?.revision === 2 && noop.body?.isDuplicate === true,
    `status=${noop.status} body=${JSON.stringify(noop.body)}`);

  // ------------------------------------------------- 6b. invalid payload → 400, no partial state
  const invalid = await call(irrOn.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO/holdings', 'PUT', {
    holdings: [{ symbol: 'BROKEN', quantity: -5, averageBuyPrice: 10, currentPrice: 10 }],
    expectedRevision: 2,
    options: { mode: 'REPLACE' },
  });
  check('6b. invalid payload → 400 invalid-request, no partial state',
    invalid.status === 400 && invalid.body?.error === 'invalid-request',
    `status=${invalid.status} body=${JSON.stringify(invalid.body)}`);
  const afterInvalid = await call(irrOn.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO');
  check('6c. state unchanged after the invalid save (revision still 2)',
    afterInvalid.body?.portfolio?.revision === 2 &&
      afterInvalid.body.portfolio.holdings.length === 1,
    `revision=${afterInvalid.body?.portfolio?.revision}`);

  // ------------------------------------------------- revisions history
  const revisions = await call(irrOn.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO/revisions');
  check('3c. revision history exposes INITIAL then REPLACE',
    revisions.status === 200 &&
      JSON.stringify(revisions.body?.revisions?.map((r) => r.operation)) === JSON.stringify(['INITIAL', 'REPLACE']),
    `status=${revisions.status} body=${JSON.stringify(revisions.body)}`);

  // ------------------------------------------------- 10. persistence across an IPD restart
  //
  // The claim under test: a portfolio saved BEFORE the IPD process restart is
  // still there, with its holdings and revision, AFTER it. This runs BEFORE the
  // delete so the portfolio under test is a live one (a tombstone is permanent
  // and IPD refuses the re-create of a tombstoned id by design).
  await on.handle.stop();
  await off.handle.stop();
  db.close();

  const db2 = openRaw(dbPath);
  ensureMigrations(db2, GATE3_MIGRATIONS);
  const restarted = await startIpc(db2, 'pp-restart', true);
  const irrRestart = await startIrrHttp({
    IIPS_G3_IPC_BINDING_PROVISIONED: 'true',
    IIPS_G2_IPC_ENDPOINT: restarted.path,
    IIPS_LOCAL_PERSONAL_USE: '1',
  });

  const afterRestart = await call(irrRestart.baseUrl, '/api/user-portfolios');
  check('10a. after an IPD restart the durable portfolio is still listed',
    afterRestart.status === 200 &&
      afterRestart.body?.portfolios?.some((p) => p.portfolioId === 'DEFAULT_PORTFOLIO'),
    `status=${afterRestart.status} body=${JSON.stringify(afterRestart.body)}`);

  const reread = await call(irrRestart.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO');
  check('10b. the portfolio reads back with its holdings and revision intact after the restart',
    reread.status === 200 && reread.body?.portfolio?.holdings?.length === 1 &&
      reread.body.portfolio.holdings[0].symbol === 'RELIANCE' &&
      reread.body.portfolio.revision === 2,
    `status=${reread.status} body=${JSON.stringify(reread.body)}`);

  const saveAfterRestart = await call(irrRestart.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO/holdings', 'PUT', {
    holdings: [{ symbol: 'INFY', quantity: 30, averageBuyPrice: 1500, currentPrice: 1400, active: true }],
    expectedRevision: 2,
    options: { mode: 'REPLACE' },
  });
  check('10c. a write on the restarted IPD succeeds and increments the revision → 3',
    saveAfterRestart.status === 200 && saveAfterRestart.body?.revision === 3,
    `status=${saveAfterRestart.status} body=${JSON.stringify(saveAfterRestart.body)}`);

  // Continue the delete sequence against the RESTARTED IPD process.
  const wrongGuard2 = await call(irrRestart.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO', 'DELETE', {
    expectedRevision: 2,
  });
  check('9a. delete with a stale guard → 409',
    wrongGuard2.status === 409, `status=${wrongGuard2.status} body=${JSON.stringify(wrongGuard2.body)}`);

  const deleted2 = await call(irrRestart.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO', 'DELETE', {
    expectedRevision: 3,
  });
  check('9b. delete with the correct guard → 200 with deletedAt',
    deleted2.status === 200 && typeof deleted2.body?.deletedAt === 'string' &&
      deleted2.body.deletedAt.length > 0,
    `status=${deleted2.status} body=${JSON.stringify(deleted2.body)}`);

  const afterDelete2 = await call(irrRestart.baseUrl, '/api/user-portfolios/DEFAULT_PORTFOLIO');
  check('9c. retrieval after delete → 404 (indistinguishable from foreign)',
    afterDelete2.status === 404, `status=${afterDelete2.status} body=${JSON.stringify(afterDelete2.body)}`);

  const tombstonedRecreate = await call(irrRestart.baseUrl, '/api/user-portfolios', 'POST', {
    portfolioName: 'x',
    holdings: HOLDINGS,
  });
  check('9d. a tombstoned id is not silently reusable (IPD refuses the re-create)',
    tombstonedRecreate.status === 400,
    `status=${tombstonedRecreate.status} body=${JSON.stringify(tombstonedRecreate.body)}`);

  // ------------------------------------------------- audit chain still verifies
  check('audit chain verifies after the whole sequence', verifyAuditChain(db2) === true);

  await restarted.handle.stop();
  db2.close();
  await irrOn.close();
  await irrOff.close();
  await irrNoSwitch.close();
} catch (error) {
  failures += 1;
  results.push(`FAIL  harness threw — ${error instanceof Error ? error.stack : String(error)}`);
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log(results.join('\n'));
console.log(`\n${results.length - failures}/${results.length} checks passed`);
process.exit(failures === 0 ? 0 : 1);
