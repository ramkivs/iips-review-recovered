/**
 * Program v3.0 — CAP-01 consumer-level separate-process restart proof: Process A (writer).
 *
 * TEST-ONLY PROOF ARTIFACT (companion of `consumer-restart-read.test.ts`, extending the PF-1
 * service-level proof in `persistence-restart-proof.test.ts` to the CONSUMER level).
 *
 * Executes the REAL consumer service sources — `watchlists-service.ts`, `collaboration-service.ts`
 * or `settings-service.ts` (no reimplementation, no copy, no mock) — in a genuinely separate OS
 * process. The store address is NOT passed on argv: it is resolved by the production path itself
 * (`IIPS_DATA_DIR` → `resolveDataDir()` → the consumer's dedicated subdirectory), so the child
 * exercises the same wiring the transport uses.
 *
 * argv: [consumer, tenantId, ownerUserId]  where consumer ∈ watchlists | collaboration | settings
 * env:  IIPS_DATA_DIR = an empty, process-private data root
 * stdout (on success): single JSON line { role, pid, consumer, journalLines, evidence }
 * exit: 0 on full success; 1 with a stderr diagnostic otherwise (no partial stdout).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolveDataDir } from './persistence-service';

function fail(message: string): never {
  process.stderr.write(`consumer-restart-writer: ${message}\n`);
  process.exit(1);
}

const [, , consumer, tenantId, ownerUserId] = process.argv;
if (!consumer || !tenantId || !ownerUserId) {
  fail(`expected argv [consumer, tenantId, ownerUserId], got ${JSON.stringify(process.argv.slice(2))}`);
}
if (!process.env.IIPS_DATA_DIR) fail('IIPS_DATA_DIR must be set to the process-private data root');

const SUBDIRS: Record<string, string> = {
  watchlists: 'watchlists',
  collaboration: 'collaboration',
  settings: 'settings',
};
const subdir = SUBDIRS[consumer];
if (!subdir) fail(`unknown consumer ${JSON.stringify(consumer)}`);

async function writeEvidence(): Promise<{ journalLines: number; evidence: unknown }> {
  if (consumer === 'watchlists') {
    const { createWatchlist, addItem, listWatchlists, readWatchlist } = await import(
      '../watchlists/watchlists-service'
    );
    const watchlistId = 'consumer-restart-watchlist-1';
    createWatchlist(tenantId, ownerUserId, watchlistId, 'Consumer Restart Watchlist');
    addItem(
      tenantId,
      ownerUserId,
      watchlistId,
      { canonicalSecurityId: 'RELIANCE', asOf: '2026-10-20T00:00:00.000Z', close: 1234.5 },
      [{ field: 'close', op: 'gt', value: 1000 }],
    );
    // Read-back verification inside Process A before it terminates.
    const lists = listWatchlists(tenantId, ownerUserId);
    const list = readWatchlist(tenantId, ownerUserId, watchlistId);
    if (lists.length !== 1 || !list || list.items.length !== 1) fail('writer read-back mismatch');
    return { journalLines: 3, evidence: { lists, list } };
  }

  if (consumer === 'collaboration') {
    const { createThread, addComment, listThreads, readThread } = await import(
      '../collaboration/collaboration-service'
    );
    const vintage = {
      dataVersion: 'fixture-dataversion-1',
      asOf: '2026-10-20T00:00:00.000Z',
      mode: 'SNAPSHOT',
    };
    const resolve = async (ref: { kind: string; id: string }): Promise<boolean> =>
      (ref.kind === 'company' && ref.id === 'fixture-company-1') ||
      (ref.kind === 'evidence' && ref.id === 'fixture-evidence-1');
    const thread = await createThread(
      tenantId,
      ownerUserId,
      { title: 'Consumer Restart Thread', anchor: { kind: 'company', id: 'fixture-company-1' } },
      resolve,
      vintage,
    );
    await addComment(
      tenantId,
      ownerUserId,
      thread.threadId,
      { body: 'Consumer Restart Comment', refs: [{ kind: 'evidence', id: 'fixture-evidence-1' }] },
      resolve,
      vintage,
    );
    const threads = listThreads(tenantId, ownerUserId);
    const readBack = readThread(tenantId, ownerUserId, thread.threadId);
    if (threads.length !== 1 || !readBack || readBack.comments.length !== 1) fail('writer read-back mismatch');
    return { journalLines: 3, evidence: { threads, thread: readBack } };
  }

  // settings — the reset path is written in the SAME cycle: update owner A, then update+reset
  // owner B, so the recoverer must read BOTH the surviving update and the reset-to-defaults.
  const { readEffectiveSettings, updateSettings, resetSettings } = await import(
    '../settings/settings-service'
  );
  const resetOwner = `${ownerUserId}-reset`;
  updateSettings(tenantId, ownerUserId, { theme: 'dark' });
  updateSettings(tenantId, resetOwner, { theme: 'dark' });
  resetSettings(tenantId, resetOwner);
  const primary = readEffectiveSettings(tenantId, ownerUserId);
  const reset = readEffectiveSettings(tenantId, resetOwner);
  if (primary.theme !== 'dark' || primary.revisionCount !== 1) fail('writer read-back mismatch (primary)');
  if (reset.theme !== 'light' || reset.revisionCount !== 2 || reset.lastRevisionKind !== 'settings-reset') {
    fail('writer read-back mismatch (reset owner)');
  }
  return { journalLines: 4, evidence: { primary, resetOwner: reset } };
}

const { journalLines, evidence } = await writeEvidence();

// The durable journal bytes must exist BEFORE this process terminates.
const journalPath = path.join(resolveDataDir(), subdir, 'journal.ndjson');
if (!fs.existsSync(journalPath)) fail(`journal not found at ${journalPath}`);
const lines = fs.readFileSync(journalPath, 'utf8').split('\n').filter((l) => l !== '');
if (lines.length !== journalLines) fail(`expected ${journalLines} journal lines, found ${lines.length}`);
if (JSON.parse(lines[0]).journalFormatVersion !== 1) fail('journal header missing or wrong version');

process.stdout.write(
  `${JSON.stringify({ role: 'writer', pid: process.pid, consumer, journalLines, evidence })}\n`,
);
