// Post-ingestion verification only. Does not create inputs, install a runtime or re-run the S4-R6 census.
// Full data/payloads stay in the caller's ignored local directory; stdout is verification metadata.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {readDataset} from '../../../iips-platform/src/investment/ingestion/writer';
import {openLocalSnapshot} from '../../../iips-platform/src/investment/port/localSnapshotStore';
import {computeContentDigest} from '../../../iips-platform/src/investment/fundamentals/manifest';
import {parseOperatingMetricsCsv} from '../../../iips-platform/src/investment/ingestion/builder';
import {assessCompany} from '../../../iips-platform/src/investment/assessment/engine';
import {selectSeries} from '../../../iips-platform/src/investment/assessment/periods';
import {assessFreshness} from '../../../iips-platform/src/investment/assessment/freshness';
import {VALUATION_POLICY} from '../../../iips-platform/src/investment/assessment/policy';
import {FRESHNESS_POLICY_VERSION} from '../../../iips-platform/src/investment/assessment/types';
import {FieldResolver} from '../../../iips-platform/src/investment/qualification/resolve';
import {TRACKED_ENGINE_PROFILES} from '../../../iips-platform/src/investment/qualification/mapping';
import {DEFAULT_QUALIFICATION_POLICY} from '../../../iips-platform/src/investment/qualification/types';

const root=resolve(__dirname,'../../..');
const local=resolve(process.argv[2]??join(root,'LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-reconciliation'));
assert.ok(local.startsWith(join(root,'LOCAL-ONLY-DO-NOT-PUBLISH')+'/'),'only ignored local verification root');
const {manifest,content}=readDataset(join(local,'dataset'));
const port=openLocalSnapshot({dataDir:join(local,'dataset')});
assert.equal(manifest.datasetVersion,computeContentDigest(content));
const sourceRights=manifest.sourceRights;
assert.ok(sourceRights);
assert.equal(sourceRights.state,'OPERATOR_ASSERTED');
assert.equal(content.issuers.length,3); // preserve the existing O3 population; Marico assessed neither here nor for closure
assert.equal(content.issues.filter(i=>i.severity==='ERROR').length,0);
assert.equal(content.operatingMetrics.length,1);
const metric=content.operatingMetrics[0]!;
assert.equal(metric.metricId,'IN_BOOK_TO_BILL');
assert.equal(metric.issuerId,'IN:CIN:L45200MH2005PLC152061');
assert.equal(metric.periodEnd,'2026-03-31');
assert.equal(metric.statementScope,'CONSOLIDATED');
assert.equal(metric.unit,'RATIO');
assert.equal(metric.sourceClass,'OPERATOR_ENTERED');
assert.equal(metric.sourceRef,'KEC-FY26-BTB-S4R6-RECONCILIATION');
assert.equal(metric.validation,'VALID');
assert.equal(metric.observation.presence,'PRESENT');
assert.deepEqual(metric.issues,[]);
assert.equal(metric.observation.value,25280/23505.54);
assert.ok(metric.observation.value!>=1 && metric.observation.value!<1.1);
assert.equal(Number(metric.observation.value!.toFixed(2)),1.08);
const parsed=parseOperatingMetricsCsv({name:'operating-metrics.csv',text:readFileSync(join(local,'input/kec/operating-metrics.csv'),'utf8')});
assert.deepEqual(parsed.records,[metric]);
assert.equal(parsed.issues.length,0);
assert.deepEqual(port.operatingMetricsFor(metric.issuerId),[metric]);
// Source-period/scope check against the exact filed denominator the imported dataset actually carries.
const fy26=content.periods.find(p=>p.issuerId===metric.issuerId&&p.period.periodType==='ANNUAL'&&p.period.periodEnd===metric.periodEnd&&p.period.statementScope===metric.statementScope)!;
assert.ok(fy26); // Canonical statement values are INR, whereas both source operands are INR crore.
assert.equal(fy26.values.REVENUE_FROM_OPERATIONS?.value,23505.54*1e7);

// This specific field's real certified-engine qualification path, not a new qualification census.
const profile=TRACKED_ENGINE_PROFILES.find(p=>p.sectorFamily==='Industrials')!;
const mapping=profile.fields.find(f=>f.field==='bookToBill')!;
const series=selectSeries(content.periods,metric.issuerId);
const target=series.annual[0]!;
const prior=series.annual[1]??null;
const issuer=content.issuers.find(i=>i.issuerId===metric.issuerId)!;
const qualificationContext={content,issuerId:issuer.issuerId,legalName:issuer.legalName,sector:issuer.sector,asOf:'2026-11-18',datasetVersion:manifest.datasetVersion,period:fy26,prior:content.periods.find(p=>p.issuerId===issuer.issuerId&&p.period.periodEnd===prior?.periodEnd)??null,statementScope:metric.statementScope,policy:DEFAULT_QUALIFICATION_POLICY};
const resolution=new FieldResolver(content,qualificationContext,series,target,prior).resolve(mapping);
assert.equal(resolution.outcome,'STALE');assert.deepEqual(resolution.codes,['FIELD_STALE']);assert.equal(resolution.value,null);
const fieldQualification={engineId:profile.engineId,field:mapping.field,transformation:mapping.transformation,freshnessKind:mapping.freshnessKind,outcome:resolution.outcome,codes:resolution.codes,note:resolution.note,engineScoringExecuted:false};
const automaticCoverage=JSON.parse(readFileSync(join(local,'dataset/coverage-report.json'),'utf8'));
const liveCoverage=automaticCoverage.sectors.filter((s:any)=>['Technology','Industrials'].includes(s.sector)).map((s:any)=>({sector:s.sector,...s.methods.find((m:any)=>m.methodId==='EV_REVENUE')}));
assert.equal(liveCoverage.find((s:any)=>s.sector==='Industrials').state,'AVAILABLE');
assert.equal(liveCoverage.find((s:any)=>s.sector==='Technology').state,'WITHHELD');

const assessments=content.issuers.filter(i=>['Technology','Industrials'].includes(i.sector)).map(issuer=>{
 const security=content.securities.find(s=>s.issuerId===issuer.issuerId)!;
 const result=assessCompany({issuerId:issuer.issuerId,legalName:issuer.legalName,sector:issuer.sector,sectorSubsegment:issuer.subSegment,securityId:security.securityId,dataset:content,datasetVersion:manifest.datasetVersion,contentDigest:manifest.contentDigest,provider:manifest.provider,identity:{bindingRef:'sandbox-verification-not-owner-resolved',rosterVersion:'verification-only',listingMapVersion:'verification-only',corporateActionTableVersion:'verification-only'},generatedAt:'2026-11-18T00:00:00.000Z',knownAsOf:'2026-11-18'});
 const {payload,violations}=result;
 // Full result is local only, for subsequent operator inspection; never published.
 writeFileSync(join(local,issuer.sector==='Technology'?'infosys-assessment.json':'kec-assessment.json'),JSON.stringify(result,null,2)+'\n');
 const method=payload.valuation.methods.find(m=>m.methodId==='EV_REVENUE')!;
 assert.equal(violations.length,0);
 assert.equal(payload.asOf.staleBeyondPolicy,true);
 assert.ok(payload.quality.flags.some(f=>f.code==='STALE_STATEMENTS'));
 assert.ok(payload.confidence.caps.includes('STALE_DATA'));
 const freshness=assessFreshness({series:selectSeries(content.periods,issuer.issuerId),clock:'2026-11-18',windows:VALUATION_POLICY.freshness,policyVersion:FRESHNESS_POLICY_VERSION});
 assert.equal(freshness.status,'STALE');
 const isKec=issuer.sector==='Industrials';
 assert.equal(payload.asOf.dataAsOf,isKec?'2026-03-31':'2024-03-31');
 assert.equal(payload.asOf.stalenessDays,isKec?232:962);
 if(isKec){
  // The newly admitted real metric passes the first gate; another existing prerequisite now decides the result.
  assert.equal(method.applicable,false);assert.equal(method.output,null);
  assert.equal(method.notApplicableReason,'CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable');
  assert.equal(payload.fundamentals.capitalStructure.netDebt.presence,'MISSING');
  assert.equal(payload.fundamentals.capitalStructure.components.currentInvestments?.presence,'MISSING');
 }
 else {assert.equal(method.applicable,false);assert.equal(method.output,null);assert.equal(method.notApplicableReason,'MANDATORY_METRIC_MISSING: TM_NRR, TM_RECURRING_REVENUE_PCT');assert.equal(port.operatingMetricsFor(issuer.issuerId).length,0);}
 return {issuerId:issuer.issuerId,sector:issuer.sector,datasetVersion:manifest.datasetVersion,asOf:payload.asOf,metricIds:port.operatingMetricsFor(issuer.issuerId).map(r=>r.metricId),method:{methodId:method.methodId,applicable:method.applicable,outputPresent:method.output!==null,midPresence:null,notApplicableReason:method.notApplicableReason},freshness:{status:freshness.status,reasons:freshness.reasons,periodEnd:freshness.valuationBasis?.periodEnd,daysSincePeriodEnd:freshness.valuationBasis?.daysSincePeriodEnd,withinPnlWindow:freshness.valuationBasis?.withinPnlWindow,withinBalanceSheetWindow:freshness.valuationBasis?.withinBalanceSheetWindow},confidence:{caps:payload.confidence.caps,staleDataMultiplier:0.9},capitalStructure:{netDebtPresence:payload.fundamentals.capitalStructure.netDebt.presence,netDebtReason:payload.fundamentals.capitalStructure.netDebt.reason,currentInvestmentsPresence:payload.fundamentals.capitalStructure.components.currentInvestments?.presence},invariantViolations:violations.length};
});
console.log(JSON.stringify({baseline:'29a225cdaa5e041ab4d08de004e86ab46f52d6f2',assessmentClock:'2026-11-18',execution:'actual CLI-ingested local personal-use snapshot, digest-verified read-back plus actual assessCompany; not installed owner runtime',dataset:{datasetVersion:manifest.datasetVersion,contentDigest:manifest.contentDigest,sourceRightsState:sourceRights.state,issuers:content.issuers.length,operatingMetricRecords:content.operatingMetrics.length,inputProvenance:manifest.inputs??null},metricVerification:{metricId:metric.metricId,issuerId:metric.issuerId,periodEnd:metric.periodEnd,scope:metric.statementScope,unit:metric.unit,sourceClass:metric.sourceClass,sourceRef:metric.sourceRef,observedAt:metric.observedAt,enteredAt:metric.enteredAt,validation:metric.validation,presence:metric.observation.presence,issues:metric.issues,exactFormulaEquality:true,roundsToSuppliedTwoDecimalValue:true,suppliedThirdScoringBand:true,readPortRecordEquality:true,identityInput:'RATIO passed unchanged to method mandatory-metric gate; not a valuation multiplier'},assessments,fieldQualification,liveCoverage,publicationBoundary:'No source/page text, canonical CSV/record values, full datasets or full computed assessment payloads redistributed.'},null,2));
