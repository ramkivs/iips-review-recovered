"""Strict additive PA adoption, authority provenance, pending-register and no-source-change checks."""
import collections,hashlib,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[3];FOLDER=pathlib.Path(__file__).resolve().parent
SOURCE_BASE='6c49a065a5ae6d797f46482303e6804e478a3840'
BASE='6f24c8104a92ad825548fefd20aab2fc7c86198f';BRANCH='arena/eb43a2a5-iips-review-recovered'
PAPER='docs/integration/IIPS_v3.0_PA_G4_C3_D01_D04_ADOPTION_ACT_2026-11-06.md'
READY='docs/integration/DURABLE-HOLDINGS-NEXT-EXECUTION-READINESS-PACKAGE-2026-11-06.md'
APPEND={
'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md':'### 16.263',
'docs/integration/FORMAL-PA-DECISION-ADOPTION-DOCKET-2026-11-06.md':'## 8. Explicit PA adoption',
'docs/integration/CONSOLIDATED-GATE4-HOLDINGS-IDENTITY-PA-DECISION-PAPER-2026-11-06.md':'## 10. Express PA adoption',
'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md':'## 26. Effective PA decisions',
'docs/integration/WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md':'## 6. Express PA adoption'}
NEW={PAPER,READY}|{str(FOLDER.relative_to(ROOT)/x) for x in ['PA-INSTRUCTION.txt','baseline.json','current-register.json','validate_scope.py','verify_remote.py','validation.txt']}
def git(*a):return subprocess.check_output(['git',*a],cwd=ROOT)
def oid(b):return hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()
def validate():
 assert git('branch','--show-current').decode().strip()==BRANCH
 old={}
 for line in git('ls-tree','-r',BASE).decode().splitlines():
  meta,path=line.split('\t');mode,kind,sha=meta.split();old[path]=(mode,sha)
 for path,(mode,sha) in old.items():
  raw=os.readlink(ROOT/path).encode() if mode=='120000' else (ROOT/path).read_bytes()
  if path in APPEND:
   before=git('show',BASE+':'+path);assert raw.startswith(before),('not append-only',path);overlay=raw[len(before):].decode()
   for text in [APPEND[path],PAPER.split('/')[-1],'12','ADOPTED','0/11','NOT RENDERED','hard-false','NOT COMPLETE']:assert text in overlay,(path,text)
  else:assert oid(raw)==sha,('protected prior blob changed',path)
 changed=set(git('diff','--name-only',BASE).decode().splitlines())|set(git('ls-files','--others','--exclude-standard').decode().splitlines())
 assert changed==NEW|set(APPEND),('out of scope/missing paths',changed^(NEW|set(APPEND)))
 baseline=json.loads((FOLDER/'baseline.json').read_text());assert baseline['baselineMain']==SOURCE_BASE and baseline['integrationMain']==BASE
 instruction=(ROOT/baseline['instruction']['path']).read_bytes();assert oid(instruction)==baseline['instruction']['blob'] and hashlib.sha256(instruction).hexdigest()==baseline['instruction']['sha256']
 for record in baseline['sources']:
  raw=git('show',BASE+':'+record['path']);assert oid(raw)==record['blob'] and hashlib.sha256(raw).hexdigest()==record['sha256'] and record['exact']
 for id in baseline['idsWithZeroPriorOccurrences']:
  p=subprocess.run(['git','grep','-l','-F',id,BASE],cwd=ROOT,capture_output=True);assert p.returncode==1
 original=json.loads(git('show',BASE+':evidence/integration/pa-decision-docket-2026-11-06/docket-register.json'));source={x['decision_id']:x for x in original['decisions']}
 data=json.loads((FOLDER/'current-register.json').read_text());a=data['adopted_decisions'];pending=data['pending_decisions'];act=(ROOT/PAPER).read_text();ready=(ROOT/READY).read_text()
 assert len(a)==3 and {x['decision_id'] for x in a}=={'G4-2','D01','D04'}
 assert len(pending)==data['pendingCount']==12 and {x['decision_id'] for x in pending}==set(source)-{'G4-2','D01','D04'}
 assert collections.Counter(x['classification'] for x in pending)=={'CONDITIONAL':7,'DEFERRED':2,'REQUIRES SEPARATE AUTHORIZATION':3}
 for row in a:
  assert row['status']=='ADOPTED' and not row['implementation_authority'] and row['effective_date']==row['approval_date']=='2026-11-06'
  assert row['authority_id'] in act and row['operative_wording'] in act and row['exact_question']==source[row['decision_id']]['exact_question']
 for row in pending:
  assert row['exact_question']==source[row['decision_id']]['exact_question'] and row['classification']==source[row['decision_id']]['classification']
  assert row['new_authority_record'] is None and row['adoption_status'].startswith('NOT ADOPTED')
  assert row['source_prerequisites']==source[row['decision_id']]['prerequisites']
 assert data['soleArchitectureRepository']=='ramkivs/iips-production-market-data' and not data['implementationAuthorized']
 assert baseline['instruction']['blob'] in act and baseline['instruction']['sha256'] in act
 for marker in ['D02','D03','D05','D06','H01','H12','unknown','recovery','hard-false','NOT AUTHORIZED','NOT COMPLETE']:assert marker in ready,marker
 assert 'outside IIPS architecture and dependency tracking' in ready and 'No content pin or QE execution pin' in act
 print(f'PASS: express instruction immutable; 4 IDs unique; 3 ADOPTED / 12 pending (7 conditional,2 deferred,3 separate); 5 append-only overlays; {len(old)-5} protected prior blobs unchanged; readiness only; no implementation, source, dependency or control changes.')
if __name__=='__main__':validate()
