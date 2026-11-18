// Bounded read-only assessment of existing repository inputs. No ingestion writer/installation.
// Emits verification metadata only; source rows and computed valuation payloads are not published.
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {loadInputBundle} from '../../../iips-platform/src/investment/cli/ingest';
import {mergeInputBundles} from '../../../iips-platform/src/investment/ingestion/multiInput';
import {buildDatasetContent,parseOperatingMetricsCsv} from '../../../iips-platform/src/investment/ingestion/builder';
import {assessCompany} from '../../../iips-platform/src/investment/assessment/engine';
import {computeContentDigest} from '../../../iips-platform/src/investment/fundamentals/manifest';
const root=resolve(__dirname,'../../..');
const paths=['S4-R2-INFOSYS-BORROWINGS-2026-11-17/ingest-input','WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input'];
const content=buildDatasetContent(mergeInputBundles(paths.map(p=>loadInputBundle(resolve(root,'evidence/real-issuer',p)))).inputs);
assert.equal(content.issuers.length,2);
assert.equal(content.operatingMetrics.length,0);
const version=computeContentDigest(content);
const assessments=content.issuers.map(issuer=>{
 const security=content.securities.find(s=>s.issuerId===issuer.issuerId)!;
 const {payload,violations}=assessCompany({issuerId:issuer.issuerId,legalName:issuer.legalName,sector:issuer.sector,securityId:security.securityId,sectorSubsegment:issuer.subSegment,dataset:content,datasetVersion:version,contentDigest:version,provider:'S4-R6 bounded in-memory existing repository evidence, not host installation',identity:{bindingRef:'verification-only-not-resolved',rosterVersion:'verification-only',listingMapVersion:'verification-only',corporateActionTableVersion:'verification-only'},generatedAt:'2026-11-18T00:00:00.000Z',knownAsOf:'2026-11-18'});
 const method=payload.valuation.methods.find(m=>m.methodId==='EV_REVENUE')!;
 assert.ok(method); assert.equal(method.applicable,false); assert.equal(method.output,null); assert.match(method.notApplicableReason??'',/MANDATORY_METRIC_MISSING/); assert.equal(violations.length,0);
 assert.equal(payload.asOf.staleBeyondPolicy,true);
 assert.equal(payload.asOf.dataAsOf,issuer.sector==='Technology'?'2024-03-31':'2026-03-31');
 assert.equal(payload.asOf.stalenessDays,issuer.sector==='Technology'?962:232);
 assert.ok(payload.quality.flags.some(f=>f.code==='STALE_STATEMENTS'));
 return {issuerId:issuer.issuerId,legalName:issuer.legalName,invariantViolations:violations.length,method:{methodId:method.methodId,applicable:method.applicable,outputPresent:method.output!==null,notApplicableReason:method.notApplicableReason},asOf:payload.asOf,qualityFlagCodes:payload.quality.flags.map(f=>f.code)};
});
// Contract representation check for this task's two missing observations, NOT admitted input.
const inf=content.issuers.find(i=>i.sector==='Technology')!;
const h='issuer_id,metric_id,value,unit,period_end,statement_scope,source_class,source_ref,observed_at,entered_at,note';
const parsed=parseOperatingMetricsCsv({name:'local-disposition-only-not-ingested.csv',text:[h,...['TM_NRR','TM_RECURRING_REVENUE_PCT'].map(m=>`${inf.issuerId},${m},,PERCENT,2026-03-31,CONSOLIDATED,OPERATOR_ENTERED,S4-R6-COMBINED-DISPOSITION-2026-11-18,2026-11-18,2026-11-18,No qualifying number verified; not disclosed disposition pending full-document verification`)].join('\n')});
assert.equal(parsed.records.length,2);
for(const r of parsed.records){assert.equal(r.observation.presence,'MISSING');assert.equal(r.observation.value,null);assert.equal(r.observation.reason,'NOT_REPORTED');assert.equal(r.validation,'UNVALIDATED');assert.deepEqual(r.issues,['MISSING_VALUE']);}
const age=Math.round((Date.parse('2026-11-18')-Date.parse('2026-03-31'))/86400000);assert.equal(age,232);
const ratio=24689/21847;assert.equal(Number(ratio.toFixed(2)),1.13);
console.log(JSON.stringify({baseline:'078232863bfa300759023549b02d9b81f9a6137b',clock:'2026-11-18',execution:'actual assessCompany, existing committed inputs only, sandbox in-memory not installed',inputs:paths,operatingMetricCount:content.operatingMetrics.length,ingestedNewRecords:0,assessments,dispositionRepresentation:parsed.records.map(r=>({metricId:r.metricId,presence:r.observation.presence,value:r.observation.value,reason:r.observation.reason,validation:r.validation,issues:r.issues})),freshnessCheck:{anchor:'2026-03-31',ageDays:age,policyWindowDays:200,excessDays:32,metricParserFreshnessRejection:'No such check in existing parser; no claim of validator rejection'},kecAdmission:{status:'BLOCKED_SOURCE_PERIOD_MISMATCH',suppliedPeriod:'FY26',verifiedSourcePeriod:'FY25',canonicalFY26RecordCreated:false,ratioRoundingCheck:true},scope:'No coverage census, synthetic capability probes, PR591 tests, new metric admission or host writes.'},null,2));
