// Verifies a real CLI-persisted private snapshot. Does not create/mutate inputs or install a runtime.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {readDataset} from '../../../iips-platform/src/investment/ingestion/writer';
import {openLocalSnapshot} from '../../../iips-platform/src/investment/port/localSnapshotStore';
import {computeContentDigest} from '../../../iips-platform/src/investment/fundamentals/manifest';
import {assessCompany} from '../../../iips-platform/src/investment/assessment/engine';
import {selectSeries} from '../../../iips-platform/src/investment/assessment/periods';
import {FieldResolver} from '../../../iips-platform/src/investment/qualification/resolve';
import {TRACKED_ENGINE_PROFILES} from '../../../iips-platform/src/investment/qualification/mapping';
import {DEFAULT_QUALIFICATION_POLICY} from '../../../iips-platform/src/investment/qualification/types';
import {qualifyIssuerToEngines} from '../../../iips-platform/src/investment/qualification/qualify';

const root=resolve(__dirname,'../../..');
const local=resolve(process.argv[2]??join(root,'LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-adoption'));
assert.ok(local.startsWith(join(root,'LOCAL-ONLY-DO-NOT-PUBLISH')+'/'));
const {manifest,content}=readDataset(join(local,'dataset'));
const port=openLocalSnapshot({dataDir:join(local,'dataset')});
assert.equal(computeContentDigest(content),manifest.contentDigest);
assert.equal(manifest.datasetVersion,manifest.contentDigest);
assert.equal(content.issues.filter(i=>i.severity==='ERROR').length,0);
assert.equal(content.operatingMetrics.length,3);
const infoId='IN:CIN:L85110KA1981PLC013115';
const kecId='IN:CIN:L45200MH2005PLC152061';
const infoMetrics=port.operatingMetricsFor(infoId);
assert.equal(infoMetrics.length,2);
for(const m of infoMetrics){
  assert.ok(['TM_NRR','TM_RECURRING_REVENUE_PCT'].includes(m.metricId));
  assert.equal(m.periodEnd,'2026-03-31');assert.equal(m.statementScope,'CONSOLIDATED');
  assert.equal(m.observation.value,null);assert.equal(m.observation.presence,'MISSING');
  assert.equal(m.observation.reason,'NOT_REPORTED');assert.equal(m.validation,'UNVALIDATED');
  assert.deepEqual(m.issues,['MISSING_VALUE']);
}
const kecMetric=port.operatingMetricsFor(kecId)[0]!;
assert.equal(kecMetric.metricId,'IN_BOOK_TO_BILL');assert.equal(kecMetric.validation,'VALID');
assert.equal(kecMetric.observation.value,25280/23505.54);assert.equal(kecMetric.unit,'RATIO');
assert.equal(kecMetric.periodEnd,'2026-03-31');assert.equal(kecMetric.statementScope,'CONSOLIDATED');
assert.equal(kecMetric.sourceRef,'KEC-FY26-BTB-S4R6-RECONCILIATION');
assert.equal(kecMetric.observedAt,'2026-11-17');assert.equal(kecMetric.enteredAt,'2026-11-17');
assert.deepEqual([...infoMetrics,kecMetric].sort((a,b)=>a.metricId.localeCompare(b.metricId)),[...content.operatingMetrics].sort((a,b)=>a.metricId.localeCompare(b.metricId)));
const history=content.periods.filter(p=>p.issuerId===infoId&&p.period.periodEnd==='2024-03-31');
assert.equal(history.length,1);assert.equal(history[0]!.filingRef,'INFY-INDAS-CONSOL-FY24');
assert.equal(history[0]!.values.REVENUE_FROM_OPERATIONS?.value,153670*1e7);
const assessments=[infoId,kecId].map(issuerId=>{
 const issuer=content.issuers.find(i=>i.issuerId===issuerId)!;
 const security=content.securities.find(s=>s.issuerId===issuerId)!;
 const series=selectSeries(content.periods,issuerId);assert.equal(series.annual[0]!.periodEnd,'2026-03-31');
 const current=content.periods.find(p=>p.issuerId===issuerId&&p.period.periodEnd==='2026-03-31')!;
 assert.equal(current.period.statementScope,'CONSOLIDATED');
 const {payload,violations}=assessCompany({issuerId,legalName:issuer.legalName,sector:issuer.sector,sectorSubsegment:issuer.subSegment,securityId:security.securityId,dataset:content,datasetVersion:manifest.datasetVersion,contentDigest:manifest.contentDigest,provider:manifest.provider,identity:{bindingRef:'local-repository-verification-not-owner-install',rosterVersion:'verification-only',listingMapVersion:'verification-only',corporateActionTableVersion:'verification-only'},generatedAt:'2026-11-18T00:00:00.000Z',knownAsOf:'2026-11-18'});
 writeFileSync(join(local,issuerId===infoId?'infosys-assessment.json':'kec-assessment.json'),JSON.stringify({payload,violations},null,2)+'\n');
 assert.equal(violations.length,0);assert.equal(payload.asOf.dataAsOf,'2026-03-31');assert.equal(payload.asOf.stalenessDays,232);
 assert.ok(payload.confidence.caps.includes('STALE_DATA'));
 const method=payload.valuation.methods.find(m=>m.methodId==='EV_REVENUE')!;
 assert.equal(method.applicable,false);assert.equal(method.output,null);
 assert.equal(method.notApplicableReason,issuerId===infoId?'MANDATORY_METRIC_MISSING: TM_NRR, TM_RECURRING_REVENUE_PCT':'CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable');
 if(issuerId===kecId){
  const c=payload.fundamentals.capitalStructure;
  assert.equal(c.grossDebt.value,5377.76*1e7);assert.equal(c.netDebt.presence,'MISSING');
  assert.equal(c.components.currentInvestments?.presence,'MISSING');
  assert.equal(c.components.currentInvestments?.value,null);
 }
 const profile=TRACKED_ENGINE_PROFILES.find(p=>p.sectorFamily===issuer.sector)!;
 const prior=series.annual[1]??null;
 const context={content,issuerId,legalName:issuer.legalName,sector:issuer.sector,asOf:'2026-11-18',datasetVersion:manifest.datasetVersion,period:current,prior:content.periods.find(p=>p.issuerId===issuerId&&p.period.periodEnd===prior?.periodEnd)??null,statementScope:current.period.statementScope,policy:DEFAULT_QUALIFICATION_POLICY};
 const resolver=new FieldResolver(content,context,series,series.annual[0]!,prior);
 const fields=(issuerId===infoId?['nrr','recurringRevenuePct']:['bookToBill','debtEbitda']).map(field=>{
  const mapping=profile.fields.find(f=>f.field===field)!;assert.ok(mapping);
  const result=resolver.resolve(mapping);
  if(field!=='debtEbitda'){assert.equal(result.outcome,'STALE');assert.deepEqual(result.codes,['FIELD_STALE']);}
  else assert.equal(result.outcome,'RESOLVED');
  return {field,source:mapping.source,freshnessKind:mapping.freshnessKind,limitDays:mapping.freshnessKind==='PNL'?200:250,outcome:result.outcome,codes:result.codes,note:result.outcome==='STALE'?result.note:'Resolved using same-period filed debt components and EBITDA; numeric score input not redistributed',valueForwarded:result.value!==null};
 });
 const certified=qualifyIssuerToEngines({content,issuerId,asOf:'2026-11-18',datasetVersion:manifest.datasetVersion,engineIds:[profile.engineId]});
 writeFileSync(join(local,issuerId===infoId?'infosys-qualification.json':'kec-qualification.json'),JSON.stringify(certified,null,2)+'\n');
 assert.equal(certified.engines[0]!.state,'NOT_QUALIFIED');
 const certifiedEngineQualification={engineId:profile.engineId,state:certified.engines[0]!.state,codes:certified.engines[0]!.codes,requiredInputs:certified.engines[0]!.requiredInputs,requiredResolved:certified.engines[0]!.requiredResolved};
 const capital=payload.fundamentals.capitalStructure;
 return {issuerId,sector:issuer.sector,certifiedEngineQualification,datasetVersion:manifest.datasetVersion,asOf:payload.asOf,selectedAnnualPeriods:series.annual.map(p=>({periodEnd:p.periodEnd,filingRef:p.filingRef})),metrics:port.operatingMetricsFor(issuerId).map(m=>({metricId:m.metricId,periodEnd:m.periodEnd,presence:m.observation.presence,numericValue:m.observation.presence==='MISSING'?m.observation.value:'WITHHELD_FROM_PUBLIC_RECEIPT',reason:m.observation.reason??null,validation:m.validation,issues:m.issues,sourceRef:m.sourceRef,disposition:m.observation.presence==='MISSING'?'UNAVAILABLE':'SOURCE_SUPPORTED'})),methods:payload.valuation.methods.map(m=>({methodId:m.methodId,applicable:m.applicable,outputPresent:m.output!==null,reason:m.notApplicableReason})),fieldQualification:fields,capitalStructure:{grossDebtPresence:capital.grossDebt.presence,grossDebtReason:capital.grossDebt.reason??null,netDebtPresence:capital.netDebt.presence,netDebtReason:capital.netDebt.reason??null,components:Object.fromEntries(Object.entries(capital.components).map(([k,v])=>[k,{presence:v.presence,reason:v.reason??null,periodEnd:v.periodEnd??null,sourceRef:v.source?.ref??null}]))},confidence:payload.confidence,invariantViolations:violations.length};
});
console.log(JSON.stringify({baseline:'d93c6d623a7cafb721cdc211f07d2315b18aa2b0',assessmentClock:'2026-11-18',dataset:{datasetVersion:manifest.datasetVersion,contentDigest:manifest.contentDigest,schema:manifest.datasetSchema,sourceRightsState:manifest.sourceRights?.state,coverage:manifest.coverage,inputProvenance:manifest.inputs},canonicalReadBackDigestVerified:true,ownerRuntimeInstalled:false,committedFullDataset:false,historicalFY24Present:true,infosysActiveAnnualAnchor:'2026-03-31',assessments,engineScoringExecuted:false,publicationDateAnchorUsed:false,freshnessOverrideUsed:false},null,2));
