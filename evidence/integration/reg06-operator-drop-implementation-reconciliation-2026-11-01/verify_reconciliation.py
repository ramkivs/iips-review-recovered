#!/usr/bin/env python3
"""Read-only local verification of the REG-06 implementation reconciliation. Standard library only."""
from pathlib import Path
import csv, hashlib, json, subprocess, sys
HERE=Path(__file__).resolve().parent; REPO=HERE.parents[2]; M=REPO/'evidence/integration/capability-matrix-51x17-reassessment-2026-10-31'
IPD='eb9289222e2bdfd0e79381d4d81f7f81715e019b'; HEAD='5b2c03dc8888aa40a4dd967ef6e7f3b76731c01e'; BASE='ed41a4c1f0e1a92cc429b31210794aa2e4b5948b'; BLOB='c1c666149c2d907026df3d9a2d184d2b9a2383c0'
checks=[]
def check(name,ok,detail=''):
    checks.append({'check':name,'result':'PASS' if ok else 'FAIL','detail':detail})
    if not ok: raise AssertionError(name+': '+str(detail))
def git(*a): return subprocess.check_output(['git',*a],cwd=REPO,text=True)
def load(n): return json.loads((HERE/'raw'/n).read_text())
def sec(t,h):
    a=t.index(h); b=t.find('\n## §16.',a+len(h)); return t[a:b if b>=0 else len(t)].rstrip()
try:
    pr=load('ipd-pr117.json'); merge=load('ipd-merge-commit.json'); ref=load('ipd-main-ref.json')
    check('IPD PR #117 merged',pr['number']==117 and pr['merged_at']=='2026-11-01T10:48:22Z' and pr['merge_commit_sha']==IPD and pr['head']['sha']==HEAD)
    check('IPD remote main at merge',ref['commit']['sha']==IPD)
    check('merge parents',[p['sha'] for p in merge['parents']]==['7d9d3db9ebe9d36c0843259cbedd1388fc3fe74f',HEAD])
    check('17 changed paths',len(merge['files'])==17 and merge['stats']=={'total':1823,'additions':1811,'deletions':12})
    arts=load('ipd-remote-artifacts.json')['artifacts']; check('23 remote artifacts byte-verified',len(arts)==23 and all(a['api_raw_equals_git_object'] and a['equals_exact_checkout'] for a in arts))
    a=next(x for x in arts if x['blob']==BLOB); check('governance tracker blob',a['bytes']==288689 and a['sha256']=='a167be71376c4554eb2d55552d2db995730e408b17b791315b01b0ca04021918')
    section=(HERE/'raw/ipd-reg06-admission-section.md').read_text(); check('IPD admission record','IIPS_V3_REG06_OPERATOR_DROP_PRODUCT_ADMISSION_2026-11-01' in section and 'CHG-2026-11-01-01' in section and 'product admission **GRANTED' in section and 'not production admission' in section)
    for n,rid in [('ipd-pr-ci.json',41298988402),('ipd-main-ci.json',41299084025)]:
        d=load(n); r=next(x for x in d['workflow_runs'] if x['id']==rid); check(n,r['status']=='completed' and r['conclusion']=='success')
    count=next(x for x in load('ipd-main-check-runs.json')['check_runs'] if x['id']==124826327985); check('IPD executed count','987 tests executed' in count['output']['summary'] and '986 passed, 0 failed' in count['output']['summary'])
    tech=load('technical-verification.json'); check('exports and emitted package',tech['exports']==['./portfolio-ui','./pit','./d114-non-production','./operator-drop'] and len(tech['emitted_operator_files'])==8 and tech['pack']['files']==151 and len(tech['pack']['operator_entries'])==8)
    check('full/focused/tarball validation',tech['full_suite']=={'tests':987,'passed':986,'failed':0,'skipped':1} and tech['focused_compiled_suite']['tests']==46 and tech['independent_tarball_smoke']=='PASS' and tech['package_consumer']['result']=='PASS')
    check('protected paths and IPD read-only',len(tech['protected_paths_unchanged'])==6 and tech['ipd_checkout_clean'] and not tech['ipd_write'])
    check('separate boundaries',tech['o05']=='OPEN' and tech['p1_c']=='NOT ESTABLISHED' and tech['p1_d']=='DESIGNATED, NOT VERIFIED FOR THE ATTEMPT' and 'ONE ATTEMPT ONLY' in tech['p1'] and not tech['production_admission'] and not tech['ad17_m2_authorized'])
    tracker=(REPO/'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md').read_text(); base=git('show',BASE+':IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md')
    check('historical §16.238 verbatim',sec(tracker,'## §16.238')==sec(base,'## §16.238'))
    check('unique new allocation',tracker.count('## §16.242 — `CV-CORR-222`')==1 and tracker.count('| `2026-11-01` | `CHG-2026-11-01-21` |')==1 and 'V1936`–`V1949' in tracker)
    check('current tracker completed/reconciled','IPD PRODUCT ADMISSION AND IMPLEMENTATION COMPLETED; IRR RECONCILED' in tracker and IPD in tracker and BLOB in tracker)
    pa=(REPO/'docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md').read_text(); oldpa=git('show',BASE+':docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md')
    old5=oldpa[oldpa.index('## 5. REG-06'):oldpa.index('## 6.',oldpa.index('## 5. REG-06'))].rstrip(); new5=pa[pa.index('## 5. REG-06'):pa.index('## 6.',pa.index('## 5. REG-06'))]
    check('historical PA REG-06 text preserved',new5.startswith(old5) and '### 5.6 Superseding REG-06 implementation assessment' in new5)
    oldp08=git('show',BASE+':docs/integration/IIPS_v3.0_P08_REG06_IRR_RECONCILIATION_2026-11-01.md'); newp08=(REPO/'docs/integration/IIPS_v3.0_P08_REG06_IRR_RECONCILIATION_2026-11-01.md').read_text(); check('historical P-08 body preserved',newp08.endswith(oldp08.split('\n\n',1)[1]) and 'Superseded as current state' in newp08)
    rows=list(csv.reader((M/'IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv').open())); oldrows=list(csv.reader((HERE/'raw/pre-correction-IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv').open()))
    check('matrix shape',len(rows)==52 and all(len(r)==17 for r in rows))
    changed=[(a[0],i) for a,b in zip(oldrows[1:],rows[1:]) for i,(x,y) in enumerate(zip(a,b)) if x!=y]; check('only matrix row 29 amended',{r for r,_ in changed}=={'29'} and len(changed)==15,str(changed))
    r29=next(r for r in rows if r[0]=='29'); tracker_row=next(l for l in tracker.splitlines() if l.startswith('| 29 | Operator Drop (IPD) |'))
    check('tracker §18 row 29 equals living matrix', [c.strip() for c in tracker_row.strip().strip('|').split('|')]==r29)
    check('row 29 current outcome','IPD product admission and implementation COMPLETED' in r29[3] and 'IRR RECONCILED' in r29[3] and './operator-drop' in r29[4] and IPD in r29[16])
    prs=list(csv.reader((M/'IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv').open())); oldprs=list(csv.reader((HERE/'raw/pre-correction-IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv').open()))
    pchanged=[(a[0],i) for a,b in zip(oldprs[1:],prs[1:]) for i,(x,y) in enumerate(zip(a,b)) if x!=y]; check('only P-08 register entry amended',{r for r,_ in pchanged}=={'P-08'})
    p08=next(r for r in prs if r[0]=='P-08'); check('P-08 completed/reconciled',p08[4]=='COMPLETED — IPD REG-06; IRR RECONCILED' and p08[1]=='Completed / reconciled items')
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
    out={'record':'IIPS-V3-REG06-OPERATOR-DROP-IMPLEMENTATION-IRR-RECONCILIATION-2026-11-01-01','outcome':'IPD product admission/implementation COMPLETED; IRR RECONCILED','checks':checks,'pass':all(c['result']=='PASS' for c in checks),'scope':'IRR-only reconciliation; IPD read-only; production/AD-17/M-2/P-1 not authorized'}
    (HERE/'00-reconciliation-checks.json').write_text(json.dumps(out,indent=2)+'\n')
for c in checks: print(c['result']+': '+c['check'])
sys.exit(0 if all(c['result']=='PASS' for c in checks) else 1)
