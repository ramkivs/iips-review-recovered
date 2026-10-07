/**
 * Program v3.0 — PF-1 separate-process restart proof: Process A (writer).
 *
 * TEST-ONLY PROOF ARTIFACT. Executes the REAL governed journal implementation
 * (./persistence-service — no reimplementation, no copy) in a genuinely separate
 * OS process, writes one deterministic fixture through the real append/read-state
 * path, verifies it by read-back, then terminates completely.
 *
 * argv: [dataDir, tenantId, ownerUserId, dedupKey]
 * stdout (on success): single JSON line { role, pid, record, dupSameId, journalLines }
 * exit: 0 on full success; 1 with a stderr diagnostic otherwise (no partial stdout).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PersistenceService } from './persistence-service';

function fail(message: string): never {
  process.stderr.write(`restart-proof-writer: ${message}\n`);
  process.exit(1);
}

const [, , dataDir, tenantId, ownerUserId, dedupKey] = process.argv;
if (!dataDir || !tenantId || !ownerUserId || !dedupKey) {
  fail(`expected argv [dataDir, tenantId, ownerUserId, dedupKey], got ${JSON.stringify(process.argv.slice(2))}`);
}

// Deterministic fixture derived ONLY from the argv identity inputs (no randomness,
// no caller-supplied payload bytes): distinctive enough to prove recovery.
const payload = {
  proof: 'journal-separate-process-restart',
  kind: 'restart-proof-fixture',
  dedupKey,
  flags: [1, 2, 3],
  nested: { marker: `DISTINCTIVE-${dedupKey}`, enabled: true },
} as const;

const svc = new PersistenceService({ dataDir });

// 1. Durable write through the real governed path.
const record = svc.append({ tenantId, ownerUserId, dedupKey, payload });

// 2. Duplicate write of the same dedupKey: contract says no-op returning existing.
const dup = svc.append({ tenantId, ownerUserId, dedupKey, payload: { tampered: true } });
if (dup.recordId !== record.recordId) fail('duplicate append returned a different recordId');

// 3. Second journal op (read-state) so recovery must replay multiple lines.
const updated = svc.updateReadState(tenantId, ownerUserId, record.recordId, true);
if (!updated || updated.read !== true || typeof updated.updatedAt !== 'string') {
  fail('updateReadState did not persist read=true with updatedAt');
}

// 4. Read-back verification before termination.
const back = svc.readById(tenantId, ownerUserId, record.recordId);
if (!back) fail('readById could not read back the written record');
if (
  back.recordId !== record.recordId ||
  back.tenantId !== tenantId ||
  back.ownerUserId !== ownerUserId ||
  back.dedupKey !== dedupKey ||
  JSON.stringify(back.payload) !== JSON.stringify(payload) ||
  back.seq !== record.seq ||
  back.createdAt !== record.createdAt ||
  back.read !== true ||
  back.updatedAt !== updated.updatedAt
) {
  fail('read-back record differs from the written record');
}

// 5. Journal bytes on disk: exactly header + create + readState (dup writes nothing).
const journalPath = path.join(dataDir, 'journal.ndjson');
if (!fs.existsSync(journalPath)) fail('journal.ndjson missing after write');
const lines = fs.readFileSync(journalPath, 'utf8').split('\n').filter((l) => l.length > 0);
if (lines.length !== 3) fail(`expected exactly 3 journal lines, found ${lines.length}`);
if (!lines[0].includes('"journalFormatVersion":1')) fail('journal header line is not the v1 header');
if (!lines[1].includes(record.recordId)) fail('journal create line does not carry the recordId');

process.stdout.write(
  `${JSON.stringify({ role: 'writer', pid: process.pid, record: back, dupSameId: true, journalLines: lines.length })}\n`,
);
process.exit(0);
