/**
 * Program v3.0 — CAP-01 consumer-level separate-process restart proof: Process B (recoverer).
 *
 * TEST-ONLY PROOF ARTIFACT (companion of `consumer-restart-read.test.ts`). Executes the REAL
 * consumer service sources in a genuinely separate OS process that starts only after the writer
 * process has completely terminated.
 *
 * argv: [consumer, tenantId, ownerUserId] — the consumer name plus the identity scope ONLY.
 * No watchlistId, threadId, commentId, recordId, dedupKey, payload value or preference value
 * crosses the process boundary: every field reported on stdout is discovered from the durable
 * journal alone through the consumer's own read path (`listWatchlists`/`readWatchlist`,
 * `listThreads`/`readThread`, `readEffectiveSettings`).
 *
 * env:  IIPS_DATA_DIR = the data root written by Process A (resolved by the production path)
 * stdout (on success): single JSON line { role, pid, consumer, evidence }
 * exit: 0 on full success; 1 with a stderr diagnostic otherwise (no partial stdout).
 */
import { resolveDataDir } from './persistence-service';

function fail(message: string): never {
  process.stderr.write(`consumer-restart-recoverer: ${message}\n`);
  process.exit(1);
}

const [, , consumer, tenantId, ownerUserId] = process.argv;
if (!consumer || !tenantId || !ownerUserId) {
  fail(`expected argv [consumer, tenantId, ownerUserId], got ${JSON.stringify(process.argv.slice(2))}`);
}
if (!process.env.IIPS_DATA_DIR) fail('IIPS_DATA_DIR must be set to the data root under recovery');

async function readEvidence(): Promise<unknown> {
  if (consumer === 'watchlists') {
    const { listWatchlists, readWatchlist } = await import('../watchlists/watchlists-service');
    const lists = listWatchlists(tenantId, ownerUserId);
    // The identifier is DISCOVERED from the journal — it is never supplied across the boundary.
    const list = lists.length === 1 ? readWatchlist(tenantId, ownerUserId, lists[0].watchlistId) : null;
    return { lists, list };
  }

  if (consumer === 'collaboration') {
    const { listThreads, readThread } = await import('../collaboration/collaboration-service');
    const threads = listThreads(tenantId, ownerUserId);
    const thread = threads.length === 1 ? readThread(tenantId, ownerUserId, threads[0].threadId) : null;
    return { threads, thread };
  }

  if (consumer === 'settings') {
    const { readEffectiveSettings } = await import('../settings/settings-service');
    const resetOwner = `${ownerUserId}-reset`;
    return {
      primary: readEffectiveSettings(tenantId, ownerUserId),
      resetOwner: readEffectiveSettings(tenantId, resetOwner),
    };
  }

  fail(`unknown consumer ${JSON.stringify(consumer)}`);
}

// Fail closed if the data root is not resolvable at all.
if (!resolveDataDir()) fail('data root did not resolve');

const evidence = await readEvidence();
process.stdout.write(`${JSON.stringify({ role: 'recoverer', pid: process.pid, consumer, evidence })}\n`);
