// B-06: pure, freshly fetched IPD identity closure only; no operational runtime/DB.
// node reassess.mjs /absolute/compiled/governed_fixture_master.js /absolute/readback-root
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const here = dirname(fileURLToPath(import.meta.url));
const b04 = resolve(here, '../b04-dhan-isin-nse-2026-11-06');
const remote = resolve(process.argv[3]);
const provider = await import(pathToFileURL(resolve(process.argv[2])).href);
const sm = provider.getGovernedBroadSecurityMaster();
const hash = b => createHash('sha256').update(b).digest('hex');
const raw = readFileSync(resolve(b04, 'source.csv'));
const priorBytes = readFileSync(resolve(b04, 'assessment.json'));
const prior = JSON.parse(priorBytes);
const manifest = JSON.parse(readFileSync(resolve(here, 'b05-manifest.json')));
const dispositionBytes = readFileSync(resolve(here, 'b05-disposition.json'));
const disposition = JSON.parse(dispositionBytes);
const corpusBytes = readFileSync(resolve(remote, 'evidence/operator_drop/d05_security_master_broad_universe.json'));
const corpus = JSON.parse(corpusBytes);
assert.equal(hash(raw), manifest.source.sourceSha256);
assert.equal(hash(priorBytes), manifest.source.assessmentSha256);
assert.equal(hash(dispositionBytes), manifest.dispositionReportSha256);
assert.equal(hash(corpusBytes), manifest.fileChecksumSha256);
assert.equal(hash(corpusBytes), prior.masterRevision.fileChecksumSha256);
assert.equal(corpus.length, 2250);
assert.deepEqual(provider.D05_BROAD_UNIVERSE_ENTITIES, corpus);
assert.deepEqual(sm.sourceRevision, prior.masterRevision);
assert.equal(manifest.kind, 'DISPOSITION_ONLY__NO_DEPOSITION__CORPUS_BYTE_IDENTICAL');
assert.equal(manifest.incorporated, 0);
assert.equal(disposition.rows.length, 67);
assert.equal(sm.listAllCompanyIds().length, 2250);
const lines = raw.toString().trimEnd().split('\n').map(s => s.split(','));
const headers = lines.shift(); assert.equal(headers.length, 9); assert.equal(lines.length, 68);
const b05 = new Map(disposition.rows.map(r => [r.isin, r]));
assert.equal(b05.size, 67);
const rows = [];
for (const [i, cells] of lines.entries()) {
  assert.equal(cells.length, 9);
  const source = Object.fromEntries(headers.map((h, k) => [h, cells[k]]));
  const old = prior.rows[i]; assert.deepEqual(old.source, source);
  const isin = source['ISIN Code']; const w2 = b05.get(isin);
  let id = null, q = null;
  try { id = sm.resolveCompanyId({identifierType: 'ISIN', identifierValue: isin, asOf: prior.asOfConvention.start}); }
  catch (err) { assert(err.quarantineRecord); q = err.quarantineRecord; }
  const entity = id ? sm.getEntity(id) : null;
  const exact = corpus.flatMap((e, n) => e.isin === isin ? [{entity: e, index: n}] : []);
  const nse = entity?.listings.filter(l => l.exchange === 'NSE' && l.status === 'ACTIVE') ?? [];
  const eligible = entity && nse.length && [prior.asOfConvention.start, prior.asOfConvention.end].every(t => Date.parse(t) >= Date.parse(entity.effectiveFrom) && (!entity.effectiveTo || Date.parse(t) <= Date.parse(entity.effectiveTo)));
  const status = id && eligible && exact.length === 1 ? 'RESOLVED' : q?.reason === 'AMBIGUOUS_COLLISION' ? 'AMBIGUOUS' : 'UNRESOLVED';
  if (w2) { assert.equal(w2.b04NewQuarantineId, old.newQuarantineId); assert.equal(w2.disposition, 'UNRESOLVED'); assert.equal(w2.incorporated, false); }
  else { assert.equal(isin, 'INE415A01038'); assert.equal(old.matchedSecurityIdentifier, 'EQ_AGI_IN'); }
  rows.push({row: i + 1, source, exchange: 'NSE', primaryKey: `${isin}+NSE`,
    masterCommit: '943309e4e84614bb8edc8d5631cd0292c7716807', corpusRevision: sm.sourceRevision,
    wave2DispositionRevision: manifest.batchId, resolutionStatus: status,
    matchedSecurityIdentifier: id, matchedSecurityName: entity?.companyName ?? null,
    exactISINRecordCount: exact.length, depositPointers: exact.map(e => `/${e.index}`), activeNSEListings: nse,
    eligibility: eligible ? 'ACTIVE_NSE_AND_EFFECTIVE_ENTIRE_PORTFOLIO_DATE' : 'NOT_EVALUABLE_NO_MASTER_RECORD',
    reason: status === 'RESOLVED' ? 'Unique exact ISIN+NSE; same AGI company as B-04, active/effective; excluded from B-05 unresolved scope.' : 'UNMAPPED_IDENTIFIER: zero exact ISIN records in unchanged 2250-record corpus; B-05 added zero and retained UNRESOLVED.',
    b04: {row: old.row, status: old.resolutionStatus, quarantineId: old.newQuarantineId},
    b05: w2 ? {row: w2.row, disposition: w2.disposition, reasonCode: w2.reasonCode, missingAuthoritativeEvidence: w2.missingAuthoritativeEvidence, quarantineId: w2.b04NewQuarantineId} : {disposition: 'EXCLUDED_ALREADY_RESOLVED_AGI'},
    newB06QuarantineId: q?.quarantineId ?? null, statusChangedFromB04: status !== old.resolutionStatus,
    ownership: 'NOT_EVALUATED_NO_OPERATIONAL_CONTEXT; identity lookup is not ownership/save authorization'});
}
assert.equal(rows.filter(r => r.resolutionStatus === 'RESOLVED').length, 1);
assert.equal(rows.filter(r => r.resolutionStatus === 'UNRESOLVED').length, 67);
assert(rows.every(r => !r.statusChangedFromB04));
const result = {task: 'B-06', status: 'REASSESSMENT_COMPLETE_NOT_ALL_IDENTITIES_RESOLVED',
  sourcePath: 'evidence/integration/b04-dhan-isin-nse-2026-11-06/source.csv', sourceSha256: hash(raw),
  masterCommit: rows[0].masterCommit, corpusRevision: sm.sourceRevision, wave2DispositionRevision: manifest.batchId,
  dispositionKind: manifest.kind, incorporatedByB05: 0, asOfConvention: prior.asOfConvention,
  counts: {rows: 68, columns: 9, resolved: 1, unresolved: 67, ambiguous: 0, statusChangesFromB04: 0},
  historicalQuarantinePreservation: 'All historical134 outcomes and B-04 actual67 records remain unchanged; B-05 carries B-04 IDs, not 67 additional replacements.',
  outstandingRegister: [{id: 'O-02', status: 'OUTSTANDING / NOT COMPLETED BY B-06', action: 'Separate additive IRR receipt must register BOTH IPD #131 and #132 and correct stale #491/R2 §28 F2 status. Existing #494/#495 evidence is not deemed combined completion by B-06.', scope: 'Broker-import O-02, not unrelated capability-matrix O-02 provisioning'}],
  operationalActions: [], rows};
writeFileSync(resolve(here, 'assessment.json'), JSON.stringify(result, null, 2) + '\n');
writeFileSync(resolve(here, 'new-quarantine.json'), JSON.stringify({context: 'ISOLATED_IN_MEMORY_B06_ASSESSMENT', records: sm.mappingStore.getQuarantinedRecords()}, null, 2) + '\n');
writeFileSync(resolve(here, 'outstanding-register.json'), JSON.stringify(result.outstandingRegister, null, 2) + '\n');
console.log(JSON.stringify(result.counts));
