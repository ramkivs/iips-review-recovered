/**
 * WS-A — durable broker-import evidence: Process A (writer), TEST-ONLY proof artefact.
 *
 * Executes the REAL IRS evidence path in a genuinely separate OS process: reads the broker CSV
 * from the given path, runs the REAL preview (`previewBrokerHoldings`, the same code the renderer
 * uses) and retains the resulting evidence record through the REAL governed journal store
 * (`BrokerImportEvidenceStore` → PF-1 `PersistenceService`). It then verifies retention by
 * read-back and terminates completely.
 *
 * argv: [dataDir, tenantId, ownerUserId, portfolioSlot, csvPath, fileName]
 * stdout (on success): single JSON line
 *   { role, pid, recordId, duplicate, importId, contentDigest, rows, counts, recordDigest, journalBytes }
 * exit: 0 on full success; 1 with a stderr diagnostic otherwise (no partial stdout).
 */
import * as fs from 'node:fs';

import { previewBrokerHoldings } from '../../src/api/brokerHoldingsPreview';
import {
  BrokerImportEvidenceStore,
  buildBrokerImportEvidence,
} from './brokerImportEvidenceStore';

function fail(message: string): never {
  process.stderr.write(`ws-a-evidence-writer: ${message}\n`);
  process.exit(1);
}

const [, , dataDir, tenantId, ownerUserId, portfolioSlot, csvPath, fileName] = process.argv;
if (!dataDir || !tenantId || !ownerUserId || !portfolioSlot || !csvPath || !fileName) {
  fail(`expected argv [dataDir, tenantId, ownerUserId, portfolioSlot, csvPath, fileName], got ${JSON.stringify(process.argv.slice(2))}`);
}

const content = fs.readFileSync(csvPath, 'utf8');
const preview = previewBrokerHoldings(content, fileName, '2026-11-05T07:50:49.090Z');
const record = buildBrokerImportEvidence({ tenantId, ownerUserId, portfolioSlot, fileName, preview });

const store = new BrokerImportEvidenceStore({ dataDir });
const retained = store.retain(record);

// Immediate read-back through the durable journal (not from memory).
const readBack = store.read(tenantId, ownerUserId, retained.recordId);
if (readBack.recordDigest !== record.recordDigest) fail('read-back digest mismatch');

const journalPath = `${dataDir}/journal.ndjson`;
const journalBytes = fs.existsSync(journalPath) ? fs.statSync(journalPath).size : 0;

process.stdout.write(`${JSON.stringify({
  role: 'writer',
  pid: process.pid,
  recordId: retained.recordId,
  duplicate: retained.duplicate,
  importId: record.importId,
  contentDigest: record.contentDigest,
  rows: readBack.rows.length,
  counts: readBack.counts,
  recordDigest: readBack.recordDigest,
  status: readBack.status,
  journalBytes,
})}\n`);
