"""Documentation/schema/test-DEFINITION validation only. Never imports product code or opens a DB."""
import collections,hashlib,json,os,pathlib,re,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[3];FOLDER=pathlib.Path(__file__).resolve().parent
BASE='3d97b8bfa58316cc1d5bd703396569e5ba171696';BRANCH='arena/17ff8669-iips-review-recovered'
PAPER='docs/integration/DURABLE-HOLDINGS-CONTRACT-AND-QUALIFICATION-SPEC-v1-2026-11-06.md'
APPEND={
'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md':'### 16.264',
'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md':'## 27. Prompt 8',
'docs/integration/WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md':'## 7. Prompt 8'}
NEW={PAPER}|{str(FOLDER.relative_to(ROOT)/x) for x in ['baseline.json','contracts.schema.json','schema-vectors.json','runtime-test-definitions.json','acceptance-matrix.json','validate_scope.py','verify_remote.py','validation.txt']}
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def oid(b):return hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()
def load(name):return json.loads((FOLDER/name).read_text(),parse_constant=lambda x:(_ for _ in ()).throw(ValueError(x)))
def validate():
 assert git('branch','--show-current').decode().strip()==BRANCH
 old={}
 for line in git('ls-tree','-r',BASE).decode().splitlines():
  meta,p=line.split('\t');mode,kind,sha=meta.split();old[p]=(mode,sha)
 for p,(mode,sha) in old.items():
  b=os.readlink(ROOT/p).encode() if mode=='120000' else (ROOT/p).read_bytes()
  if p in APPEND:
   before=git('show',BASE+':'+p);assert b.startswith(before),('not append-only',p);text=b[len(before):].decode()
   for token in [APPEND[p],PAPER.split('/')[-1],'0/11','NOT RENDERED','hard-false','NOT COMPLETE','NOT ADOPTED','NOT EXECUTED']:assert token in text,(p,token)
  else:assert oid(b)==sha,('protected prior blob changed',p)
 changed=set(git('diff','--name-only',BASE).decode().splitlines())|set(git('ls-files','--others','--exclude-standard').decode().splitlines())
 assert changed==NEW|set(APPEND),('out of scope/missing',changed^(NEW|set(APPEND)))
 baseline=load('baseline.json');assert baseline['initialMain']==BASE and baseline['integrationMain']==BASE
 for item in baseline['authoritySources']+baseline['irrConsumerSources']:
  raw=git('show',BASE+':'+item['path']);assert oid(raw)==item['blob'] and hashlib.sha256(raw).hexdigest()==item['sha256']
 assert '§5 is DISCHARGED' in baseline['authorityReceipt']['body'] and hashlib.sha256(baseline['authorityReceipt']['body'].encode()).hexdigest()==baseline['authorityReceipt']['bodySha256']
 reg=json.loads(git('show',BASE+':evidence/integration/pa-three-decision-adoption-2026-11-06/current-register.json'))
 assert {x['decision_id'] for x in reg['adopted_decisions']}=={'G4-2','D01','D04'} and len(reg['pending_decisions'])==12
 assert len(baseline['canonicalIPD']['sourceManifest'])==14
 import jsonschema
 from importlib.metadata import version
 assert version('jsonschema')=='4.25.1' and version('rfc3339-validator')=='0.1.4'
 schema=load('contracts.schema.json');jsonschema.Draft202012Validator.check_schema(schema);checker=jsonschema.FormatChecker();assert 'date-time' in checker.checkers
 vectors=load('schema-vectors.json');assert len(vectors)==20 and len({v['id'] for v in vectors})==20
 for v in vectors:
  assert v['fixtureClass']=='SCHEMA_ONLY_SYNTHETIC_NOT_BROKER_EVIDENCE'
  errors=list(jsonschema.Draft202012Validator(dict(schema,**{'$ref':'#/$defs/'+v['definition']}),format_checker=checker).iter_errors(v['value']));assert (not errors)==v['valid'],(v['id'],[e.message for e in errors])
 for name in ['CreateRequest','SaveRequest','GetRequest','ListRequest','RevisionsRequest','SaveSuccess','DetailSuccess','AuthorizedRefusal']:assert schema['$defs'][name]['properties']['v']['const']==2
 tests=load('runtime-test-definitions.json');matrix=load('acceptance-matrix.json');paper=(ROOT/PAPER).read_text();ids={x['id'] for x in tests}
 assert len(tests)==len(ids)==24 and len(matrix)==12 and {x['id'] for x in matrix}=={f'H{i:02}' for i in range(1,13)}
 assert all(x['execution_status']=='NOT_EXECUTED' and x['fixtureClass'] in {'FUTURE_SYNTHETIC_ISOLATED_FIXTURE','FUTURE_NATIVE_HOST_QUALIFICATION_NOT_PERFORMED','FUTURE_GENUINE_BROKER_EXPORT_REQUIRED_NOT_SUPPLIED'} for x in tests)
 assert {t['id'] for t in tests if t['fixtureClass']=='FUTURE_GENUINE_BROKER_EXPORT_REQUIRED_NOT_SUPPLIED'}=={'T08'}
 assert {t['id'] for t in tests if t['fixtureClass']=='FUTURE_NATIVE_HOST_QUALIFICATION_NOT_PERFORMED'}=={'T02','T21'}
 assert set(t['criterion'] for t in tests)=={x['id'] for x in matrix}
 required={'id','requirement','verification_method','tests','required_artifacts','expected_result','dependency','accountable_owner','current_status','completion_criteria'}
 for h in matrix:
  assert set(h)==required and all(h.values()) and len(h['tests'])>=2 and set(h['tests'])<=ids
  assert f"### {h['id']} — {h['current_status']}" in paper
  for k in required-{'id','tests','required_artifacts'}:assert h[k] in paper,(h['id'],k)
 for x in ['P8-D02-REQ-01','P8-D03-REQ-01','P8-D05-REQ-01','P8-D06-REQ-01','NOT ADOPTED','NOT GRANTED','NOT ADMISSION','NOT READY TO IMPLEMENT','frame v=2','W-1 hard-false']:assert x in paper,x
 for link in re.findall(r'\]\(([^)]+)\)',paper):
  if not link.startswith('http'):assert (ROOT/PAPER).parent.joinpath(link).exists(),link
 print(f'PASS: schema/metaschema +20 vectors (date-time enforced); 24 runtime definitions NOT EXECUTED; all H01–H12 fields/tests/status complete; 3 effective/12 pending unchanged; 3 append-only overlays; {len(old)-3} protected prior blobs unchanged. No runtime/DB/IPD mutation.')
if __name__=='__main__':validate()
