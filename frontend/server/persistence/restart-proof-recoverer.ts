/**
 * Program v3.0 — PF-1 separate-process restart proof: Process B (recoverer).
 *
 * TEST-ONLY PROOF ARTIFACT. Executes the REAL governed journal implementation
 * (./persistence-service — no reimplementation, no copy) in a genuinely separate
 * OS process that starts only after Process A has completely terminated.
 *
 * argv: [dataDir, tenantId, ownerUserId] — the store address plus the identity
 * scope ONLY. No recordId, no dedupKey, no payload is accepted: every record
 * field reported on stdout is discovered from the durable journal alone.
 *
 * stdout (on success): single JSON line
 *   { role, pid, records, missingIsUndefined, foreignIsUndefined, existsFirst }
 * exit: 0 on full success; 1 with a stderr diagnostic otherwise.
 */
import { PersistenceService } from './persistence-service';

function fail(message: string): never {
  process.stderr.write(`restart-proof-recoverer: ${message}\n`);
  process.exit(1);
}

// Fixed bogus identities (contract probes, not fixture data): deterministic and
// independent of anything Process A wrote.
const BOGUS_RECORD_ID = 'restart-proof-bogus-record-id';
const FOREIGN_OWNER = 'restart-proof-foreign-owner';

const [, , dataDir, tenantId, ownerUserId] = process.argv;
if (!dataDir || !tenantId || !ownerUserId) {
  fail(`expected argv [dataDir, tenantId, ownerUserId], got ${JSON.stringify(process.argv.slice(2))}`);
}

// Independent initialization: full journal replay in this process only.
const svc = new PersistenceService({ dataDir });

// Recovery: the ONLY discovery path — no fixture identifiers are known here.
const records = svc.listOrdered(tenantId, ownerUserId);

// Contract failure probes (already-supported semantics only).
const missingIsUndefined = svc.readById(tenantId, ownerUserId, BOGUS_RECORD_ID) === undefined;
const probeId = records.length > 0 ? records[0].recordId : BOGUS_RECORD_ID;
const foreignIsUndefined =
  svc.readById(tenantId, FOREIGN_OWNER, probeId) === undefined;
const existsFirst = records.length > 0 ? svc.exists(tenantId, ownerUserId, records[0].dedupKey) : false;

if (!missingIsUndefined) fail('missing-record probe did not return undefined');
if (!foreignIsUndefined) fail('foreign-owner probe did not return undefined');

process.stdout.write(
  `${JSON.stringify({ role: 'recoverer', pid: process.pid, records, missingIsUndefined, foreignIsUndefined, existsFirst })}\n`,
);
process.exit(0);
