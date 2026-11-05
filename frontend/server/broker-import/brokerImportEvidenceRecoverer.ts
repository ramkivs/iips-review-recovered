/**
 * WS-A — durable broker-import evidence: Process B (recoverer), TEST-ONLY proof artefact.
 *
 * Starts ONLY after Process A has completely terminated. It receives the store address plus the
 * identity scope and NOTHING else: no recordId, no importId, no content digest, no row data. Every
 * value it reports is discovered from the durable journal alone.
 *
 * argv: [dataDir, tenantId, ownerUserId, expectedContentDigest]
 *   `expectedContentDigest` is supplied by the TEST, not by Process A's stdout, so recovery is
 *   checked against an independent expectation rather than against the writer's own claim.
 * stdout (on success): single JSON line
 *   { role, pid, records, rows, counts, contentDigest, recordDigest, duplicateImportIds, firstRow,
 *     foreignScopeInvisible }
 * exit: 0 on full success; 1 with a stderr diagnostic otherwise.
 */
import { BrokerImportEvidenceStore } from './brokerImportEvidenceStore';

function fail(message: string): never {
  process.stderr.write(`ws-a-evidence-recoverer: ${message}\n`);
  process.exit(1);
}

const [, , dataDir, tenantId, ownerUserId, expectedContentDigest] = process.argv;
if (!dataDir || !tenantId || !ownerUserId || !expectedContentDigest) {
  fail(`expected argv [dataDir, tenantId, ownerUserId, expectedContentDigest], got ${JSON.stringify(process.argv.slice(2))}`);
}

const store = new BrokerImportEvidenceStore({ dataDir });
const records = store.list(tenantId, ownerUserId);
if (records.length === 0) fail('no evidence record was recovered from the durable journal');

const recovered = records[0].record;
if (recovered.contentDigest !== expectedContentDigest) fail('recovered content digest does not match the independent expectation');
if (recovered.rows.length !== recovered.counts.nativeRows) fail('recovered row inventory is incomplete');

const importIds = records.map((r) => r.record.importId);
const first = recovered.rows[0];

process.stdout.write(`${JSON.stringify({
  role: 'recoverer',
  pid: process.pid,
  records: records.length,
  recordId: records[0].recordId,
  rows: recovered.rows.length,
  counts: recovered.counts,
  contentDigest: recovered.contentDigest,
  recordDigest: recovered.recordDigest,
  status: recovered.status,
  duplicateImportIds: importIds.length !== new Set(importIds).size,
  firstRow: first,
  lastRow: recovered.rows[recovered.rows.length - 1],
  foreignScopeInvisible: store.list(tenantId, 'some-other-owner').length === 0,
})}\n`);
