/** L-039: read-only canonical replay; no new financial admission, dataset or artifact publication. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { loadInputs } from '../src/investment/cli/ingest';
import { buildDatasetContent } from '../src/investment/ingestion/builder';
import { computeContentDigest } from '../src/investment/fundamentals/manifest';
import { assessCompany } from '../src/investment/assessment/engine';
import { loadIdentitySourcesFromDir } from '../src/investment/identity/sources';

const root = resolve(__dirname, '../..');
const evidence = join(root, 'evidence/real-issuer');
const original = 'WI8-INDUSTRIALS-KEC-2026-11-07';
const identity = loadIdentitySourcesFromDir(join(evidence, original, 'ingest-input/identity'));
// This is an assessment replay, NOT current identity qualification or persistence.
// Keep the historical carrier verbatim; do not silently repair the old entries/actions schema.
const historicalPayload = JSON.parse(readFileSync(join(evidence, original,
  'artifact/assessment-payload-kec-wi8-l040-corrected.json'), 'utf8'));
const identityRefs = historicalPayload.subject.identity;

export function verifyUnchangedKec() {
  const records = [original + '/ingest-input', 'S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec'].map((relative) => {
    const content = buildDatasetContent(loadInputs(join(evidence, relative)));
    const before = computeContentDigest(content);
    const issuer = content.issuers[0]!;
    assert.equal(issuer.legalName, 'KEC International Limited');
    const periods = content.periods.map((row) => {
      assert.equal(row.period.statementScope, 'CONSOLIDATED');
      const current = row.values.CURRENT_INVESTMENTS;
      assert.deepEqual([current?.presence, current?.reason, current?.value], ['MISSING', 'NOT_REPORTED', null]);
      return { period: row.period, filingRef: row.filingRef, currentInvestments: current };
    });
    const result = assessCompany({ issuerId: issuer.issuerId, legalName: issuer.legalName, sector: issuer.sector,
      securityId: content.securities[0]!.securityId, dataset: content, datasetVersion: before, contentDigest: before,
      provider: 'unchanged-operator-inputs-read-only', identity: identityRefs,
      generatedAt: '2026-11-17T00:00:00.000Z', knownAsOf: '2026-11-17T00:00:00.000Z' });
    const capital = result.payload.fundamentals.capitalStructure;
    for (const item of [capital.components.currentInvestments, capital.cashAndInvestments, capital.netDebt]) {
      assert.equal(item.presence, 'MISSING');
      assert.equal(item.reason, 'NOT_REPORTED');
      assert.equal(item.value, null);
    }
    assert.equal(result.payload.valuation.intrinsic, null);
    for (const grid of result.payload.valuation.sensitivity) {
      assert.ok(grid.withheld);
      for (const point of grid.points) assert.equal(point.value, null);
    }
    const after = computeContentDigest(buildDatasetContent(loadInputs(join(evidence, relative))));
    assert.equal(before, after);
    return { inputPath: 'evidence/real-issuer/' + relative, beforeReplayContentDigest: before,
      afterReplayContentDigest: after, periods, capitalStructure: capital, intrinsic: result.payload.valuation.intrinsic,
      methods: result.payload.valuation.methods, sensitivity: result.payload.valuation.sensitivity,
      violations: result.violations, durableDatasetWritten: false, newFinancialEvidenceAdmitted: false };
  });
  const path = join(evidence, original, 'artifact/assessment-payload-kec-wi8-l040-corrected.json');
  const bytes = readFileSync(path);
  const publishedArtifactSha256 = createHash('sha256').update(bytes).digest('hex');
  assert.equal(publishedArtifactSha256, 'fc50c53e08814d7851d7b9bb569ddf1eb4eec19ad7508c3c16db9b13a943f370');
  return { method: 'loadInputs -> buildDatasetContent -> computeContentDigest -> assessCompany, memory only',
    sessionDate: '2026-11-17', noSuccessorDataset: true, records, publishedArtifactSha256,
    identityLoadResult: identity, identityBoundary: 'Historical payload carrier reused only for read-only financial assessment; current identity loader failure retained, no qualification/persistence claimed' };
}
if (require.main === module) {
  const text = JSON.stringify(verifyUnchangedKec(), null, 2) + '\n';
  if (process.argv[2]) writeFileSync(process.argv[2], text); else process.stdout.write(text);
}
