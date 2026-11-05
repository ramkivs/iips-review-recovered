"""Narrow documentary/register and complete existing-blob preservation checks."""
import hashlib,json,os,pathlib,re,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[3]; FOLDER=pathlib.Path(__file__).resolve().parent
BASE='80737d072829d942fb2f9ec76f6e9122e36530f7'
PAPER='docs/integration/CONSOLIDATED-GATE4-HOLDINGS-IDENTITY-PA-DECISION-PAPER-2026-11-06.md'
APPEND={
'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md':'### 16.261',
'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md':'## 24.',
'docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md':'### B.M.',
'docs/integration/WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md':'## 5. Current reconciliation overlay'}
FILES={'census.py','decision-register.json','history-and-iid-readback.json','remote-census.json','verify_history.py','validate_scope.py','verify_remote.py','validation.txt'}
NEW={PAPER}|{str(FOLDER.relative_to(ROOT)/p) for p in FILES};ALLOWED=NEW|set(APPEND)
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def oid(raw):return hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
def validate():
 assert git('branch','--show-current').decode().strip()=='arena/74604381-iips-review-recovered'
 entries={}
 for line in git('ls-tree','-r',BASE).decode().splitlines():
  meta,p=line.split('\t');mode,kind,sha=meta.split();entries[p]=(mode,sha)
 for p,(mode,sha) in entries.items():
  raw=os.readlink(ROOT/p).encode() if mode=='120000' else (ROOT/p).read_bytes()
  if p in APPEND:
   old=git('show',BASE+':'+p);assert raw.startswith(old),('not append-only',p);assert APPEND[p] in raw[len(old):].decode();assert PAPER.split('/')[-1] in raw[len(old):].decode()
  else:assert oid(raw)==sha,('protected blob changed',p)
 changed=set(git('diff','--name-only',BASE).decode().splitlines())|set(git('ls-files','--others','--exclude-standard').decode().splitlines())
 assert changed<=ALLOWED,('out-of-scope',changed-ALLOWED)
 assert NEW<=(set(entries)|changed),('missing deliverables',NEW-changed-set(entries))
 data=json.loads((FOLDER/'decision-register.json').read_text());rows=data['decisions'];ids=[r['decision_id'] for r in rows]
 expected={f'G4-{i}' for i in range(1,5)}|{f'D0{i}' for i in range(1,7)}|{f'A-{i}' for i in [5,6,7]}|{'IID-DATA','IID-L016','EFF-G2','EFF-SQL','EFF-W1','EFF-R5','EFF-DQ6B','EFF-RET','EFF-CLEAR','EFF-IID'}
 assert len(ids)==23 and set(ids)==expected and len(set(ids))==23
 required={'decision_id','exact_question','current_authoritative_status','recommended_disposition','rationale','alternatives_and_consequences','accountable_authority','dependencies','implementation_impact','acceptance_criteria','effectiveness','source_references'}
 for row in rows:assert set(row)==required and all(row.values()),row['decision_id']
 assert sum(row['effectiveness']=='PENDING' for row in rows)==data['pendingDecisionOrDependencyCount']==15
 assert sum(row['effectiveness']=='ALREADY_EFFECTIVE_OR_SETTLED' for row in rows)==data['preservedEffectiveOrSettledCount']==8
 paper=(ROOT/PAPER).read_text()
 for row in rows:
  assert f"### {row['decision_id']}\n" in paper
  for field in required-{'decision_id'}:
   value=row[field];assert ('; '.join(value) if isinstance(value,list) else value) in paper,(row['decision_id'],field)
 for link in re.findall(r'\]\(([^)]+)\)',paper):assert (ROOT/PAPER).parent.joinpath(link).exists(),('broken source link',link)
 census=json.loads((FOLDER/'remote-census.json').read_text())
 assert len(census['R5Coordinates'])==3 and len(census['R5VerifiedEntries'])==census['R5EntryCount']==56
 assert len(census['R5AliasRawSourceCensus'])==14
 assert sum(e['primaryBlob']==e['aliasBlob'] for e in census['R5AliasRawSourceCensus'])==10
 assert sum(e['unchanged'] for e in census['currentCoreFootprintComparedToR5'])==38
 assert census['lineageClassification']['liveBrokerPin']['UNCLASSIFIED']==3
 assert census['currentPublishedConsumptionProfile']['sourceArtifactCountExpectedByProfile']==36
 assert all(e['unchanged'] for e in census['priorHoldingsSourceBlobsUnchanged'])
 assert not census['operationalAccess'] and not census['IPDMutations']
 for p,marker in APPEND.items():
  new=(ROOT/p).read_bytes()[len(git('show',BASE+':'+p)):].decode()
  assert marker in new and 'NOT COMPLETE' in new if 'MILESTONE' in p or p.startswith('IIPS_') else marker in new
  assert ('0/11' in new and 'NOT RENDERED' in new) if 'IMPLEMENTATION_ROADMAP' not in p else 'NOT STARTED' in new
 print(f'PASS: 23 complete entries (15 pending, 8 effective/settled); all three R5 coordinates/56 core/14 alias paths; 38/56 current unchanged; 4 append-only overlays; {len(entries)-4} protected prior blobs unchanged; documentary-only exact allowlist.')
if __name__=='__main__':validate()
