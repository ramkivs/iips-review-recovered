"""Documentation-only scope and append-only protection; no operational data access."""
import hashlib,json,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[3]
BASE='2a55110806599084355b299fb3e0a559471f0c48'
APPEND={'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md','docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md'}
def git(*a):return subprocess.check_output(['git',*a],cwd=ROOT)
protected=0
for line in git('ls-tree','-r',BASE).decode().splitlines():
 meta,p=line.split('\t');mode,kind,blob=meta.split()
 if kind!='blob':continue
 before=git('cat-file','blob',blob);after=(ROOT/p).read_bytes()
 if p in APPEND:assert after.startswith(before),p
 else:assert before==after,p;protected+=1
print(json.dumps({'baseline':BASE,'protectedExistingBlobsUnchanged':protected,'existingChangesAppendOnly':sorted(APPEND),'productChanges':False,'IPDMutations':False,'operationalDataOpened':False,'W1':'UNCHANGED'},indent=2))
