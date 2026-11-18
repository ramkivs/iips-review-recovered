/** L-038: in-memory replay of unchanged Marico inputs, never a successor dataset or production write.
 * Run from iips-platform: npx tsx scripts/l038-delta-verify.ts [report.json]
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { loadInputs } from '../src/investment/cli/ingest';
import { buildDatasetContent } from '../src/investment/ingestion/builder';
import { computeContentDigest } from '../src/investment/fundamentals/manifest';
import { assessCompany } from '../src/investment/assessment/engine';
import { equityValueFromEnterprise } from '../src/investment/assessment/capitalStructure';
import { checkNilBinding, parseNilDeclaration } from '../src/investment/contracts/nilBinding';
import { loadIdentitySourcesFromDir } from '../src/investment/identity/sources';
import { present } from '../src/investment/contracts/observation';

const root = resolve(__dirname, '../..');
const evidence = join(root, 'evidence/real-issuer');
const identity = loadIdentitySourcesFromDir(join(evidence, 'WI7-CONSUMER-MARICO-2026-11-07/ingest-input/identity'));
assert.ok(identity.available);
if (!identity.available) throw new Error('existing Marico identity unavailable');
const identityVersions = identity.sources.versions;
const identityRefs = {
  bindingRef: 'L038-DELTA-READ-ONLY-VERIFICATION',
  rosterVersion: identityVersions.rosterVersion,
  listingMapVersion: identityVersions.listingMapVersion,
  corporateActionTableVersion: identityVersions.corporateActionTableVersion,
};

export function verifyUnchangedMarico() {
  const records = [
    'WI7-CONSUMER-MARICO-2026-11-07/ingest-input',
    'WI7-L038-DEBT-COMPLETENESS-2026-11-07/ingest-input',
    'S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico',
  ].map((relative) => {
    const inputs = loadInputs(join(evidence, relative));
    const content = buildDatasetContent(inputs);
    const digest = computeContentDigest(content);
    assert.equal(content.issuers.length, 1);
    assert.equal(content.issuers[0]!.legalName, 'Marico Limited');
    const issuer = content.issuers[0]!;
    const periods = content.periods.map((period) => {
      const observation = period.values.PREFERENCE_CAPITAL;
      assert.equal(observation?.presence, 'MISSING');
      assert.equal(observation?.reason, 'NOT_REPORTED');
      assert.equal(observation?.value, null);
      assert.equal(period.period.statementScope, 'CONSOLIDATED');
      return { periodEnd: period.period.periodEnd, filingRef: period.filingRef,
        statementScope: period.period.statementScope, preferenceCapital: observation };
    });
    const result = assessCompany({ issuerId: issuer.issuerId, legalName: issuer.legalName,
      sector: issuer.sector, securityId: content.securities[0]!.securityId,
      dataset: content, datasetVersion: digest, contentDigest: digest, provider: 'existing-operator-inputs-read-only',
      identity: identityRefs, generatedAt: '2026-11-17T00:00:00.000Z', knownAsOf: '2026-11-17T00:00:00.000Z' });
    const capital = result.payload.fundamentals.capitalStructure;
    assert.equal(capital.preferenceCapital.presence, 'MISSING');
    assert.equal(capital.preferenceCapital.reason, 'NOT_REPORTED');
    assert.equal(capital.preferenceCapital.value, null);
    // A diagnostic enterprise numerator is synthetic, not an admitted valuation or source amount.
    const bridge = equityValueFromEnterprise(present(1, { kind: 'DERIVED', ref: 'SYNTHETIC_DIAGNOSTIC_ONLY' }), capital);
    assert.equal(bridge.presence, 'NOT_COMPUTABLE');
    assert.equal(bridge.value, null);
    const repeatedDigest = computeContentDigest(buildDatasetContent(loadInputs(join(evidence, relative))));
    assert.equal(digest, repeatedDigest);
    return { inputPath: 'evidence/real-issuer/' + relative, datasetContentDigest: digest,
      repeatedReplayDigest: repeatedDigest, durableDatasetWritten: false, newFinancialEvidenceAdmitted: false,
      periods, violations: result.violations, capitalStructure: capital, diagnosticBridge: bridge,
      methods: result.payload.valuation.methods.map((method) => ({ methodId: method.methodId, output: method.output })),
      intrinsic: result.payload.valuation.intrinsic };
  });
  const standalone = parseNilDeclaration('NIL[section=BS;class=PREFERENCE_SHARE_CAPITAL;scope=STANDALONE_COMPANY]: SYNTHETIC test declaration, not an issuer quote');
  const scopeCheck = checkNilBinding(standalone, 'PREFERENCE_CAPITAL', 'CONSOLIDATED');
  assert.equal(scopeCheck.acceptable, false);
  assert.ok(scopeCheck.problems.some((p) => p.code === 'NIL_SCOPE_NUANCE_UNACKNOWLEDGED'));
  return { method: 'existing inputs -> loadInputs/buildDatasetContent/computeContentDigest/assessCompany in memory; no writeDataset or dataset directory',
    clock: '2026-11-17T00:00:00.000Z', records, standaloneScopeGuard: scopeCheck };
}

if (require.main === module) {
  const report = verifyUnchangedMarico();
  const text = JSON.stringify(report, null, 2) + '\n';
  if (process.argv[2]) writeFileSync(process.argv[2], text);
  else process.stdout.write(text);
}
