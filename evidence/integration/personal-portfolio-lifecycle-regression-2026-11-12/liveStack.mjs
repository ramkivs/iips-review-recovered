/**
 * Live IPD sidecar for the Personal Portfolio lifecycle harness.
 *
 * Run as a standalone Node process by `run-live-lifecycle.sh`. It seeds a scratch
 * SQLite store with an active local binding, starts the REAL IPD IPC server (compiled
 * from the authoritative IPD checkout, read-only) over a real unix socket, prints the
 * socket path to stdout and stays alive until signalled.
 *
 * It is a separate process on purpose. The harness itself runs under Vitest/Vite, which
 * cannot load the compiled IPD modules (they live outside the Vite root) and does not
 * recognise `node:sqlite` as an external builtin. Keeping IPD out of that pipeline means
 * the harness still exercises the real provider — just over a real socket rather than
 * through the bundler.
 *
 * IPD is consumed read-only; nothing in the IPD repository is modified.
 */
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire('node:sqlite');

const IPD_BUILD = process.env.IPD_BUILD_DIR ?? '/tmp/ipd-build';
const HOST_PLATFORM = 'linux';
const OWNER = 'personal-owner';
const TENANT = 'personal-tenant';

const { ensureMigrations } = await import(`${IPD_BUILD}/src/persistence/migration_ledger.js`);
const { GATE3_MIGRATIONS } = await import(`${IPD_BUILD}/src/ipc/entrypoint.js`);
const { resolveEndpointTarget, listenIpc } = await import(`${IPD_BUILD}/src/ipc/endpoint.js`);
const { createConnectionHandler } = await import(`${IPD_BUILD}/src/ipc/dispatch.js`);
const { LOCAL_PERSONAL_USE_SETTING } = await import(`${IPD_BUILD}/src/ipc/localPersonalUse.js`);

const root = mkdtempSync(join(tmpdir(), 'pp-live-'));
const dbPath = join(root, 'store', 'ipd.db');
mkdirSync(dirname(dbPath), { recursive: true });

const seed = new DatabaseSync(dbPath);
seed.exec('PRAGMA foreign_keys = ON');
ensureMigrations(seed, GATE3_MIGRATIONS);
const now = new Date().toISOString();
seed
  .prepare(
    "INSERT INTO local_principal_bindings (binding_id, principal_label, status, created_at, updated_at, revoked_at) VALUES ('b-personal', 'personal-operator', 'ACTIVE', ?, ?, NULL)",
  )
  .run(now, now);
seed
  .prepare(
    "INSERT INTO local_principal_memberships (membership_id, binding_id, tenant_id, canonical_owner_id, status, created_at, updated_at, revoked_at) VALUES ('m-personal', 'b-personal', ?, ?, 'ACTIVE', ?, ?, NULL)",
  )
  .run(TENANT, OWNER, now, now);
seed.close();

const target = resolveEndpointTarget(
  { IIPS_G2_IPC_ENDPOINT: 'pp-live', IIPS_G3_LOCAL_STATE_DIR: join(root, 'state') },
  HOST_PLATFORM,
);
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');
const handle = await listenIpc(
  target,
  createConnectionHandler(db, {
    env: { ...process.env, [LOCAL_PERSONAL_USE_SETTING]: '1' },
  }),
  { platform: HOST_PLATFORM },
);

process.stdout.write(`${target.path}\n`);

let closing = false;
const shutdown = async () => {
  if (closing) return;
  closing = true;
  try {
    await handle.close?.();
  } finally {
    db.close();
    rmSync(root, { recursive: true, force: true });
    process.exit(0);
  }
};
process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
setInterval(() => {}, 1 << 30);
