// Read-only B-04 assessment against a separately fetched, blob-verified IPD master.
// Usage: node reassess.mjs /absolute/path/to/compiled/governed_fixture_master.js /absolute/path/to/ipd-readback-root
// Compile only the verified remote provider and its pure identity dependency closure, never IPD runtime/DB code.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const remote = resolve(process.argv[3]);
const provider = await import(pathToFileURL(resolve(process.argv[2])).href);
const master = provider.getGovernedBroadSecurityMaster();
const depositBytes = readFileSync(resolve(remote, 'evidence/operator_drop/d05_security_master_broad_universe.json'));
const deposit = JSON.parse(depositBytes);
const manifest = JSON.parse(readFileSync(resolve(remote, 'evidence/operator_drop/d05_security_master_manifest.json'), 'utf8'));
const sha256 = data => createHash('sha256').update(data).digest('hex');
assert.equal(sha256(depositBytes), manifest.fileChecksumSha256);
assert.equal(deposit.length, manifest.recordCount);
assert.deepEqual(provider.D05_BROAD_UNIVERSE_ENTITIES, deposit);
assert.equal(master.sourceRevision.fileChecksumSha256, manifest.fileChecksumSha256);
assert.equal(master.listAllCompanyIds().length, 2250);
// Date-only source: explicitly use start/end of portfolio date in Asia/Calcutta.
// This is an assessment convention, not an invented broker acquisition/transaction timestamp.
const asOf = '2026-11-06T00:00:00+05:30';
const dayEnd = '2026-11-06T23:59:59.999+05:30';
const raw = readFileSync(resolve(here, 'source.csv'), 'utf8');
const lines = raw.trimEnd().split('\n').map(line => line.replace(/\r$/, '').split(','));
const headers = lines.shift();
assert.equal(headers.length, 9);
assert.equal(lines.length, 68);
assert(lines.every(line => line.length === 9));
const priorPath = 'evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/03-identity-assessment-68-row.json';
const prior = JSON.parse(readFileSync(resolve(root, priorPath), 'utf8'));
const nameKey = s => s.trim().toUpperCase(); // reconciliation ONLY, never master lookup
const oldByName = new Map(prior.rows.map(row => [nameKey(row.symbol), row]));
assert.equal(oldByName.size, 68);
const result = [];
for (const [index, cells] of lines.entries()) {
  const source = Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
  const isin = source['ISIN Code'];
  const candidates = deposit.flatMap((entity, i) => entity.isin === isin ? [{depositIndex: i, entity}] : []);
  let companyId = null, refusal = null, quarantineId = null;
  try { companyId = master.resolveCompanyId({identifierType: 'ISIN', identifierValue: isin, asOf}); }
  catch (err) {
    assert(err.quarantineRecord);
    refusal = err.quarantineRecord.reason;
    quarantineId = err.quarantineRecord.quarantineId;
  }
  const entity = companyId ? master.getEntity(companyId) : null;
  const listings = entity?.listings.filter(l => l.exchange === 'NSE') ?? [];
  const eligible = entity && listings.some(l => l.status === 'ACTIVE') &&
    [asOf, dayEnd].every(t => Date.parse(t) >= Date.parse(entity.effectiveFrom) &&
      (!entity.effectiveTo || Date.parse(t) <= Date.parse(entity.effectiveTo)));
  const status = companyId && eligible && new Set(candidates.map(c => c.entity.companyId)).size === 1 ? 'RESOLVED' : refusal === 'AMBIGUOUS_COLLISION' ? 'AMBIGUOUS' : 'UNRESOLVED';
  const old = oldByName.get(nameKey(source['Scrip Name']));
  assert(old, source['Scrip Name']);
  result.push({
    row: index + 1, source, exchange: 'NSE', primaryKey: `${isin}+NSE`,
    masterCommit: '749d42067edc86e74d2cf35deb4562c4549687a0', masterRevision: master.sourceRevision,
    exactISINRecordCount: candidates.length,
    candidateCompanyIds: [...new Set(candidates.map(c => c.entity.companyId))],
    depositPointers: candidates.map(c => `/${c.depositIndex}`),
    matchedSecurityIdentifier: companyId, matchedSecurityName: entity?.companyName ?? null,
    nseListings: listings, entityEffectiveFrom: entity?.effectiveFrom ?? null,
    entityEffectiveTo: entity?.effectiveTo ?? null,
    eligibility: eligible ? 'ACTIVE_NSE_AND_EFFECTIVE_ENTIRE_PORTFOLIO_DATE' : entity ? 'NSE_OR_EFFECTIVE_DATE_NOT_ELIGIBLE' : 'NOT_EVALUABLE_NO_MASTER_RECORD',
    ownershipCheck: 'NOT_EVALUATED_NO_OPERATIONAL_CONTEXT; master identity is not account authorization',
    resolutionStatus: status,
    reason: status === 'RESOLVED' ? 'Unique exact governed ISIN entity; active NSE listings; effective for portfolio date; no name/symbol fallback.' : candidates.length === 0 ? 'UNMAPPED_IDENTIFIER: supplied ISIN absent from all 2250 current governed records; no ISIN+NSE candidate; no fallback or substitution.' : `Fail-closed: ${refusal ?? 'NSE_OR_EFFECTIVE_DATE_NOT_ELIGIBLE'}`,
    newQuarantineId: quarantineId,
    priorEvidence: {path: priorPath, row: old.rowIndex, symbol: old.symbol, status: old.identityStatus, quarantineRecordCount: old.quarantineRecordCount},
    statusChanged: old.identityStatus !== status,
    evidenceBasisChange: old.identityStatus === 'RESOLVED' ? 'Previously governed AGI name/symbol alias; now exact supplied ISIN+NSE confirms same EQ_AGI_IN. Different source-date quantities/values retained, not reconciled as equal.' : 'Previously missing ISIN/exchange and unmatched raw name; now supplied valid ISIN+NSE explicitly tested, but absent in current corpus. Status unchanged; reason/evidence strengthened.'
  });
}
assert.equal(new Set(result.map(r => r.primaryKey)).size, 68);
assert.equal(result.filter(r => r.resolutionStatus === 'RESOLVED').length, 1);
assert.equal(result.filter(r => r.resolutionStatus === 'UNRESOLVED').length, 67);
const assessment = {
  task: 'B-04', status: 'ASSESSMENT_COMPLETE_NOT_ALL_IDENTITIES_RESOLVED',
  source: 'User-embedded Dhan equity portfolio dated 06-11-2026, reconciled by user with Dhan Demat 05-11-2026; not independently broker-authenticated',
  sourceSha256: sha256(raw), masterCommit: result[0].masterCommit, masterRevision: master.sourceRevision,
  asOfConvention: {start: asOf, end: dayEnd},
  counts: {rows: 68, columns: 9, distinctISINNSE: 68, resolved: 1, unresolved: 67, ambiguous: 0, statusChanges: 0},
  corpusIntegrity: {records: deposit.length, depositMatchesManifest: true, runtimeModuleMatchesDeposit: true, runtimeCompanyIds: master.listAllCompanyIds().length},
  authorityLimit: 'Governed OFFLINE_BOOTSTRAP D05 corpus, not live NSE or proof of REAL origin/account ownership. No import/save qualification/admission.',
  oldQuarantineEvidence: 'Byte-preserved; historical prior counts134; no clearing/deletion/overwrite; new isolated assessment quarantine is additive.',
  operationalActions: [], rows: result
};
writeFileSync(resolve(here, 'assessment.json'), JSON.stringify(assessment, null, 2) + '\n');
writeFileSync(resolve(here, 'new-quarantine.json'), JSON.stringify({context: 'ISOLATED_IN_MEMORY_B04_READ_ONLY_ASSESSMENT', asOf, records: master.mappingStore.getQuarantinedRecords()}, null, 2) + '\n');
console.log(JSON.stringify(assessment.counts));
