"""Validate complete 15-entry PA review docket and strictly documentary scope."""
import collections,hashlib,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[3];FOLDER=pathlib.Path(__file__).resolve().parent
BASE='bc0de0ea9702a4b6a34138db4fbe9ec81bc0f688'
SOURCE_BASE='6946bee09395364a8a06ffafb1c4ef91c866e340'
BRANCH='arena/4ea09d79-iips-review-recovered'
PAPER='docs/integration/FORMAL-PA-DECISION-ADOPTION-DOCKET-2026-11-06.md'
APPEND={
'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md':'### 16.262',
'docs/integration/CONSOLIDATED-GATE4-HOLDINGS-IDENTITY-PA-DECISION-PAPER-2026-11-06.md':'## 9. Formal PA adoption-workflow companion',
'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md':'## 25. Formal PA decision-adoption docket'}
NEW={PAPER}|{str(FOLDER.relative_to(ROOT)/x) for x in ['baseline.json','docket-register.json','validate_scope.py','verify_remote.py','validation.txt']}
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def oid(b):return hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()
def validate():
 assert git('branch','--show-current').decode().strip()==BRANCH
 old={}
 for line in git('ls-tree','-r',BASE).decode().splitlines():
  meta,p=line.split('\t');mode,kind,sha=meta.split();old[p]=(mode,sha)
 for p,(mode,sha) in old.items():
  raw=os.readlink(ROOT/p).encode() if mode=='120000' else (ROOT/p).read_bytes()
  if p in APPEND:
   before=git('show',BASE+':'+p);assert raw.startswith(before),('not append-only',p);overlay=raw[len(before):].decode()
   for text in [APPEND[p],PAPER.split('/')[-1],'0/11','NOT RENDERED','NOT STARTED','hard-false','NOT COMPLETE']:assert text in overlay,(p,text)
  else:assert oid(raw)==sha,('protected blob changed',p)
 changed=set(git('diff','--name-only',BASE).decode().splitlines())|set(git('ls-files','--others','--exclude-standard').decode().splitlines())
 assert changed==NEW|set(APPEND),('unexpected changed paths',changed^(NEW|set(APPEND)))
 source=json.loads(git('show',SOURCE_BASE+':evidence/integration/gate4-holdings-identity-reconciliation-2026-11-06/decision-register.json'))
 originals={x['decision_id']:x for x in source['decisions'] if x['effectiveness']=='PENDING'}
 data=json.loads((FOLDER/'docket-register.json').read_text());rows=data['decisions'];paper=(ROOT/PAPER).read_text()
 assert len(rows)==15 and {x['decision_id'] for x in rows}==set(originals)
 counts=collections.Counter(x['classification'] for x in rows)
 assert dict(counts)==data['classificationCounts']=={'ADOPTABLE NOW':3,'CONDITIONAL':7,'DEFERRED':2,'REQUIRES SEPARATE AUTHORIZATION':3}
 assert {x['decision_id'] for x in rows if x['classification']=='ADOPTABLE NOW'}=={'G4-2','D01','D04'}
 for x in rows:
  assert all(v for k,v in x.items() if k!='new_authority_record'),x['decision_id']
  assert x['new_authority_record'] is None and x['adoption_status']=='NOT ADOPTED — no new explicit PA disposition supplied'
  assert x['exact_question']==originals[x['decision_id']]['exact_question']
  assert x['alternatives_and_consequences']==originals[x['decision_id']]['alternatives_and_consequences']
  assert x['supporting_evidence']['references']==originals[x['decision_id']]['source_references']
  assert all(c in x['acceptance_criteria'] for c in originals[x['decision_id']]['acceptance_criteria'])
  assert f"### {x['decision_id']} — {x['classification']}" in paper
  for key in ['exact_question','current_status','arena_recommendation','recommended_pa_wording','accountable_owner','implementation_authority_result','adoption_status','alternatives_and_consequences']:
   assert x[key] in paper,(x['decision_id'],key)
  for key in ['prerequisites','acceptance_criteria']:assert '; '.join(x[key]) in paper
 assert data['newlyAdoptedCount']==0
 assert data['preservedCrosswalk']==[x for x in source['decisions'] if x['effectiveness']!='PENDING']
 baseline=json.loads((FOLDER/'baseline.json').read_text());assert baseline['baselineMain']==SOURCE_BASE and baseline['integrationMain']==BASE and baseline['newPADecisionsSupplied']==[]
 for record in baseline['sourceRecords']:
  raw=git('show',SOURCE_BASE+':'+record['path']);assert oid(raw)==record['blob'] and hashlib.sha256(raw).hexdigest()==record['sha256'] and record['exactRemoteByteReadback']
 assert len(baseline['concurrentIID4']['changedPaths'])==42 and all(oid((ROOT/path).read_bytes())==old[path][1] for path in baseline['concurrentIID4']['changedPaths'])
 assert 'IID-5/6' in paper and 'IID-4 is now MERGED' in paper and 'NOT STARTED' in paper and 'Newly adopted entries: 0' in paper
 print(f'PASS: all 15 original IDs/questions, complete wording/evidence/alternatives/prerequisites/owners/authority/acceptance; 3 adoptable, 7 conditional, 2 deferred, 3 separate; 0 adopted; 8 prior crosswalks unchanged; 3 append-only overlays; {len(old)-3} protected prior blobs unchanged; exact documentary allowlist.')
if __name__=='__main__':validate()
