/**
 * Separate-process restart / recovery harness — EVIDENCE TOOLING, not a test file.
 *
 * Runs the REAL composed IRR server (the exported `server` from `executive-transport`, wiring the
 * real owner-context resolver, the real certified governed universe and the real reference
 * provider) in its own operating-system process, performs one operator step, prints a single
 * machine-readable `RESULT:{...}` line and exits.
 *
 * `owner-context-restart.test.ts` executes this file twice under `vite-node` and compares the two
 * results, so the durability/restart evidence required by F-7(4) ("separate-process restart must be
 * evidenced, not assumed") is produced by genuinely separate processes rather than by a re-used
 * in-process module graph.
 *
 * Configuration is supplied through the child environment:
 *   IIPS_OWNER_CONTEXT_PATH — the carrier path (the server-owned seam)
 *   IIPS_DATA_DIR           — the owner-scoped journal data domain (TD-7a)
 *   IIPS_RESTART_OP         — `write` (first process) or `read` (second, restarted process)
 */
import type { AddressInfo } from 'node:net';
import { server } from './executive-transport';

const OP = process.env.IIPS_RESTART_OP ?? 'read';
const WATCHLIST_ID = 'restart-wl-1';

interface CallResult {
  readonly status: number;
  readonly body: Record<string, unknown>;
}

async function call(base: string, path: string, method = 'GET', payload?: unknown): Promise<CallResult> {
  const init: RequestInit = { method };
  if (payload !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(payload);
  }
  const res = await fetch(`${base}${path}`, init);
  const text = await res.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    body = { raw: text };
  }
  return { status: res.status, body };
}

function data(result: CallResult): Record<string, unknown> {
  return (result.body.data ?? {}) as Record<string, unknown>;
}

async function main(): Promise<void> {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;
  const out: Record<string, unknown> = { op: OP, pid: process.pid, port };

  // Owner-scoped surfaces must be genuinely available in both processes.
  const settings = await call(base, '/api/settings');
  out.settingsStatus = settings.status;
  out.ownerContextServed = settings.status === 200;
  out.settingsTenantId = data(settings).tenantId ?? null;
  out.settingsTheme = data(settings).theme ?? null;

  if (OP === 'write') {
    const created = await call(base, '/api/watchlists', 'POST', { watchlistId: WATCHLIST_ID, name: 'Restart list' });
    out.createWatchlistStatus = created.status;

    const added = await call(base, `/api/watchlists/${WATCHLIST_ID}/items`, 'POST', {
      canonicalSecurityId: 'Banking',
      triggers: [{ field: 'composite', op: 'gte', value: 0 }],
    });
    out.addItemStatus = added.status;
    out.addedBaselineComposite = (((data(added).baseline ?? {}) as Record<string, unknown>).composite ?? null);

    const theme = await call(base, '/api/settings', 'PUT', { theme: 'dark' });
    out.updateSettingsStatus = theme.status;
    out.settingsTheme = data(theme).theme ?? null;
    out.revisionCount = data(theme).revisionCount ?? null;

    const thread = await call(base, '/api/collaboration', 'POST', {
      title: 'Restart thread',
      anchor: { kind: 'company', id: 'Banking' },
    });
    out.createThreadStatus = thread.status;
    out.threadTotalComments = data(thread).totalComments ?? null;
  } else {
    const lists = await call(base, '/api/watchlists');
    out.listStatus = lists.status;
    const listData = (lists.body.data ?? []) as Array<Record<string, unknown>>;
    out.watchlistIds = listData.map((l) => l.watchlistId);
    const restart = listData.find((l) => l.watchlistId === WATCHLIST_ID);
    out.watchlistTotalItems = restart ? restart.totalItems : null;
    const items = (restart?.items ?? []) as Array<Record<string, unknown>>;
    out.itemIds = items.map((i) => i.canonicalSecurityId);
    out.itemBaselineComposite = items.length > 0 ? ((items[0].baseline ?? {}) as Record<string, unknown>).composite ?? null : null;
    out.itemDeltaFields = items.length > 0 ? ((items[0].deltas ?? []) as Array<Record<string, unknown>>).map((d) => d.field) : [];
    out.itemTriggers = items.length > 0 ? items[0].triggers : [];

    const threads = await call(base, '/api/collaboration');
    out.threadStatus = threads.status;
    const threadData = (threads.body.data ?? []) as Array<Record<string, unknown>>;
    out.threadTitles = threadData.map((t) => t.title);
  }

  console.log(`RESULT:${JSON.stringify(out)}`);
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

void main().catch((e: unknown) => {
  console.log(`RESULT:${JSON.stringify({ op: OP, error: String(e) })}`);
  process.exitCode = 1;
});
