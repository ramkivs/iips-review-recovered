#!/usr/bin/env python3
"""Local, read-only verification of the P-08/REG-06 IRR reconciliation.
Run after build_reassessment.py and verify_reassessment.py. Standard library only.
"""
from pathlib import Path
import csv, hashlib, json, subprocess, sys
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[2]
M=REPO/'evidence/integration/capability-matrix-51x17-reassessment-2026-10-31'
IPD='e9c2eef6c82ba51814a72ce962cf227e9fd89d56'
BLOB='efa804097d51263ce91dff4ac7201fb572ef1d8a'
checks=[]
def check(name, ok, detail=''):
    checks.append({'check':name,'result':'PASS' if ok else 'FAIL','detail':detail})
    if not ok: raise AssertionError(name+': '+str(detail))
def git(*args): return subprocess.check_output(['git',*args],cwd=REPO,text=True)
def load(name): return json.loads((HERE/'raw'/name).read_text())
try:
    pr=load('ipd-pr115.json'); merge=load('ipd-merge-commit.json'); ref=load('ipd-main-ref.json')
    check('IPD PR #115 merged',pr['number']==115 and pr['state']=='closed' and pr['merged_at']=='2026-11-01T09:08:24Z' and pr['merge_commit_sha']==IPD)
    check('IPD remote main at verified merge',ref['commit']['sha']==IPD)
    check('merge parents', [p['sha'] for p in merge['parents']]==['527f811b17edb02caa665b345d9f36102435e1e8','7cf9afc957170319c0c69b3e60d01a388045207f'])
    check('IPD one documentation path',len(merge['files'])==1 and merge['files'][0]['filename'].endswith('IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md') and merge['files'][0]['sha']==BLOB and merge['files'][0]['additions']==133 and merge['files'][0]['deletions']==0)
    arts=load('ipd-remote-artifacts.json')['artifacts']; a=next(x for x in arts if x['blob']==BLOB)
    check('IPD tracker raw/Git identity',a['api_raw_equals_git_object'] and a['bytes']==267714 and a['sha256']=='6241aa2b591ec3cf4673b954b39df32180910afd9d24dea7fec78f8a101849fa')
    section=(HERE/'raw/ipd-p08-deferral-section.md').read_text()
    normalized=' '.join(section.split())
    check('continued deferral not admission','CONTINUED DEFERRAL' in normalized and 'NOT product admission' in normalized and 'all four technical prerequisites are unsatisfied' in normalized)
    for name,rid in [('ipd-pr-ci.json',41287463022),('ipd-main-ci.json',41287576987)]:
        c=load(name); check(name,c['id']==rid and c['status']=='completed' and c['conclusion']=='success')
    count=next(x for x in load('ipd-main-check-runs.json')['check_runs'] if x['id']==124792149559)
    check('IPD executed count','941 tests executed' in count['output']['summary'] and '940 passed, 0 failed' in count['output']['summary'] and count['conclusion']=='success')
    tech=load('technical-verification.json')
    check('E018 current exports/build',tech['current_exports']==['./portfolio-ui','./pit','./d114-non-production'] and not tech['operator_drop_export_present'] and not tech['operator_drop_emitted'] and tech['pack_operator_drop_entries']==[])
    check('E026 identifier/callers',tech['parser_company_id_line']==95 and tech['parser_isin_mentions']==0 and tech['irr_executable_consumer_hits']==0)
    check('IPD checkout unmodified',tech['ipd_checkout_status']=='')
    tracker=(REPO/'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md').read_text()
    pa=(REPO/'docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md').read_text()
    check('tracker nonexistent symbol removed','RawMarketRecord' not in tracker and 'record.companyId' in tracker)
    check('dated PA correction', '### 5.5 Dated technical correction' in pa and IPD in pa and BLOB in pa and 'No Operator Drop subpath is exported' in pa)
    oldpa=git('show','ad7d2362532c146aa023229bae48342eeab646fb:docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md')
    check('original PA disposition preserved','**`OperatorDropParser` remains an internal IPD library primitive. Product admission is `DEFERRED`.**' in oldpa and oldpa.count('**`OperatorDropParser` remains an internal IPD library primitive. Product admission is `DEFERRED`.**')==pa.count('**`OperatorDropParser` remains an internal IPD library primitive. Product admission is `DEFERRED`.**'))
    check('original historical packaging observation preserved','| Packaging | IPD `main` `package.json` has **no `exports` and no `main` field** — no package subpath exports exist. |' in pa)
    rows=list(csv.reader((M/'IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv').open())); p08=next(r for r in rows if r[0]=='P-08')
    check('P-08 register outcome/owners',p08[4]=='RESOLVED — CONTINUED DEFERRAL (REG-06)' and p08[1]=='Resolved governance deferrals' and p08[8].startswith('PA') and p08[9].startswith('IPD'))
    matrix=list(csv.reader((M/'IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv').open())); r29=next(r for r in matrix if r[0]=='29')
    check('matrix shape and row 29',len(matrix)==52 and all(len(r)==17 for r in matrix) and r29[3].startswith('RESOLVED — CONTINUED DEFERRAL') and r29[13].startswith('DEFERRED'))
    check('current IPD references in matrix/register',all(x in p08[13] and x in r29[16] for x in [IPD,BLOB,'PR #115']))
    check('unique tracker allocation',tracker.count('## §16.238 — `CV-CORR-218`')==1 and tracker.count('| `2026-11-01` | `CHG-2026-11-01-17` |')==1)
    maintracker=git('show','origin/main:IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md')
    def sec(t,h):
        a=t.index(h); b=t.find('\n## §16.',a+len(h)); return t[a:b if b>=0 else len(t)].rstrip()
    check('intervening PR409 section preserved',sec(tracker,'## §16.237')==sec(maintracker,'## §16.237'))
    sums=HERE/'SHA256SUMS.txt'
    if sums.exists():
        bad=[]
        for line in sums.read_text().splitlines():
            h,rel=line.split('  ',1); p=HERE/rel
            if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=h: bad.append(rel)
        check('bundle SHA256SUMS',not bad,','.join(bad))
except Exception as e:
    if not checks or checks[-1]['result']!='FAIL': checks.append({'check':'exception','result':'FAIL','detail':str(e)})
finally:
    out={'record':'IIPS-V3-P08-REG06-IRR-RECONCILIATION-2026-11-01-01','outcome':'RESOLVED — CONTINUED DEFERRAL (REG-06)','checks':checks,'pass':all(c['result']=='PASS' for c in checks),'scope':'IRR-only correction; IPD read-only; no product admission'}
    (HERE/'00-reconciliation-checks.json').write_text(json.dumps(out,indent=2)+'\n')
for c in checks: print(c['result']+': '+c['check'])
sys.exit(0 if all(c['result']=='PASS' for c in checks) else 1)
