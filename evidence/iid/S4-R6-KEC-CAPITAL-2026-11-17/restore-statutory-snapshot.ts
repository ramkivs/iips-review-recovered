// Recovery only: restores the exact previously published canonical content digest.
// No CLI or operating-metric CSV ingestion, no new observation, no capital amendment.
import assert from 'node:assert/strict';
import {existsSync, readFileSync, mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {buildDatasetContent} from '../../../iips-platform/src/investment/ingestion/builder';
import {writeDataset, readDataset} from '../../../iips-platform/src/investment/ingestion/writer';
import {computeContentDigest} from '../../../iips-platform/src/investment/fundamentals/manifest';
import {present} from '../../../iips-platform/src/investment/contracts/observation';
import type {OperatingMetricRecord} from '../../../iips-platform/src/investment/contracts/operatingMetrics';

const root=resolve(__dirname,'../../..');
const local=join(root,'LOCAL-ONLY-DO-NOT-PUBLISH/kec-statutory');
const dir=join(local,'dataset-restored');
const expected='sha256:a62f95f81a923e72fb6b4e0220bb8852d08191d14e94b1997a12bbfe8d4a0daf';
const source=join(root,'evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input');
const roster=JSON.parse(readFileSync(join(source,'roster.json'),'utf8'));
const statements=buildDatasetContent({...roster,corporateActions:[],prices:[],periodCsv:{name:'periods.csv',text:readFileSync(join(source,'periods.csv'),'utf8')},xbrlFiles:[],operatingMetricsCsv:null});
// Restore, not re-admit: all fields are pinned by the prior verifier and whole-content digest.
const restoredBtb:OperatingMetricRecord={issuerId:'IN:CIN:L45200MH2005PLC152061',metricId:'IN_BOOK_TO_BILL',observation:present(25280/23505.54,{kind:'OPERATOR_ENTRY',ref:'KEC-FY26-BTB-S4R6-RECONCILIATION'},{periodEnd:'2026-03-31',basis:'AS_FILED'}),periodEnd:'2026-03-31',statementScope:'CONSOLIDATED',sourceClass:'OPERATOR_ENTERED',unit:'RATIO',sourceRef:'KEC-FY26-BTB-S4R6-RECONCILIATION',observedAt:'2026-11-17',enteredAt:'2026-11-17',validation:'VALID',issues:[]};
const content={...statements,operatingMetrics:[restoredBtb]};
assert.equal(computeContentDigest(content),expected,'refuse any recovery that differs from published canonical content');
assert.equal(content.issues.filter(i=>i.severity==='ERROR').length,0);
mkdirSync(local,{recursive:true});
if(!existsSync(dir))writeDataset({dir,content,provider:'operator-file-input',licence:'operator-supplied; not redistributable',now:'2026-11-17T00:00:00.000Z',importRunId:'statutory-verification-exact-content-recovery',sourceRights:{state:'OPERATOR_ASSERTED',basis:'Existing local-personal-use KEC population; exact recovery of prior published canonical digest, not new admission',note:'Does not verify third-party rights, replace combined data, or admit the uploaded extract as numeric input.'}});
const read=readDataset(dir);assert.equal(read.manifest.contentDigest,expected);assert.deepEqual(read.content,content);
console.log(JSON.stringify({recoveryOnly:true,newCapitalAdmission:false,newEconomicObservations:0,btbCsvIngestion:false,expectedHistoricalDigest:expected,restoredDigest:read.manifest.contentDigest,digestEquality:true,privateCombinedSnapshotReplaced:false},null,2));
