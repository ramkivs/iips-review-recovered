// Mechanism demonstration under the FICTITIOUS test policy of IPD (tests/support/irr_identity_approval_fixture.ts).
// No record is made in the name of the governed approver; nothing is written to disk; nothing is installed.
// It shows, with the governed rules (scope, limitations, generation comparison), what a record that binds the
// previous P7 digest does against a generation staged with the published manifest, and the reverse.
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
const ipd = process.argv[2], stagingNew = process.argv[3], stagingOld = process.argv[4];
const imp = (p) => import(pathToFileURL(join(ipd, 'dist', p)).href);
const prov = await imp('src/identity/irr_identity_provisioning.js');
const appr = await imp('src/identity/irr_identity_approval.js');
const fx = await imp('tests/support/irr_identity_approval_fixture.js');

const tool = prov.readIpdToolIdentity();
const sNew = prov.readStagedExport(stagingNew);
const sOld = prov.readStagedExport(stagingOld);
const gNew = prov.readGateReceipt(sNew.stagingDir);
const gOld = prov.readGateReceipt(sOld.stagingDir);
const p7 = (s) => appr.approvalGenerationOf(s.report).p7ManifestSha256;
console.log(`tool: commit ${tool.commit}; unmodified ${tool.unmodified}`);
console.log(`policy used here: ${fx.TEST_APPROVAL_POLICY.policyVersion}; approver ${fx.TEST_APPROVAL_POLICY.approver.authorityId} (fictitious)`);
console.log(`staging A (published manifest): P7 ${p7(sNew)}; gate accepted ${gNew.accepted}; IRR ${gNew.irr.commit}`);
console.log(`staging B (previous manifest):  P7 ${p7(sOld)}; gate accepted ${gOld.accepted}; IRR ${gOld.irr.commit}`);

const now = new Date();
const run = (label, record, staged, gate) => {
  const e = appr.evaluateIdentityApproval({ record, now, policy: fx.TEST_APPROVAL_POLICY, staged, gate: { irrCommit: gate.irr.commit }, tool });
  const codes = e.failures.map((f) => f.code);
  console.log(`${label}: authorizesInstallation ${e.authorizesInstallation}; failures [${codes.join(', ')}]; compared: staged ${e.checked.stagedFiles}, gate ${e.checked.loaderGate}, tool ${e.checked.tool}`);
  for (const f of e.failures) console.log(`    ${f.code}: ${f.detail}`);
  return { ok: e.authorizesInstallation, codes };
};
const recOld = fx.testApprovalFor(sOld, gOld.irr.commit, fx.TEST_APPROVAL_POLICY, tool.commit);
const recNew = fx.testApprovalFor(sNew, gNew.irr.commit, fx.TEST_APPROVAL_POLICY, tool.commit);
console.log(`record OLD binds P7 ${recOld.subject.generation.p7ManifestSha256}`);
console.log(`record NEW binds P7 ${recNew.subject.generation.p7ManifestSha256}`);
const fieldsDiffer = Object.keys(recOld.subject.generation).filter((k) => JSON.stringify(recOld.subject.generation[k]) !== JSON.stringify(recNew.subject.generation[k]));
console.log(`generation fields that differ between the two records: [${fieldsDiffer.join(', ')}]`);
console.log(`file digests equal in both records: ${JSON.stringify(recOld.subject.files) === JSON.stringify(recNew.subject.files)}`);

const r1 = run('1. record OLD vs staging A (the open dependency)', recOld, sNew, gNew);
const r2 = run('2. record NEW vs staging A (a record for the published manifest)', recNew, sNew, gNew);
const r3 = run('3. record NEW vs staging B (negative control)', recNew, sOld, gOld);
const r4 = run('4. record OLD vs staging B (the earlier state)', recOld, sOld, gOld);
const pass = !r1.ok && r1.codes.length === 1 && r1.codes[0] === 'GENERATION_MISMATCH' && r2.ok && r2.codes.length === 0 && !r3.ok && r3.codes.length === 1 && r3.codes[0] === 'GENERATION_MISMATCH' && r4.ok;
console.log(`EXPECTED PATTERN (1 refused GENERATION_MISMATCH only; 2 authorizes; 3 refused GENERATION_MISMATCH only; 4 authorizes): ${pass ? 'CONFIRMED' : 'NOT CONFIRMED'}`);
process.exit(pass ? 0 : 1);
