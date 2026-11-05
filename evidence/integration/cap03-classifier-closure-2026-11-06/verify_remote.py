"""Independent GitHub API trees + decoded blobs, never local fetch equality alone."""
import base64, hashlib, json, pathlib, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parents[3]
REPO='ramkivs/iips-review-recovered'
BASE='a9329dd509be8051f82780059646c0f179d42b74'
MUTABLE={'.github/workflows/cap03-revision7-irr-static.yml','docs/integration/cap03-p1-f9/validate_windows10_host_profile.py'}
APPEND={'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md','docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md','docs/integration/WS-A-OWNER-EVIDENCE-RESET-IMPLEMENTATION-2026-11-06.md','docs/OPERATOR_RUNBOOK.md','docs/integration/WS-A-OWNER-EVIDENCE-RESET-IMPLEMENTATION-RECEIPT-2026-11-06.md','docs/integration/CAP03-ARTIFACT-CLASSIFICATION-CORRECTION-2026-11-06.md'}
def git(*args): return subprocess.check_output(['git',*args],cwd=ROOT)
def api(p): return json.loads(subprocess.check_output(['gh','api',f'repos/{REPO}/{p}'],cwd=ROOT))
def tree(sha):
    t=api(f'git/trees/{sha}?recursive=1'); assert not t.get('truncated');return {e['path']:e['sha'] for e in t['tree'] if e['type']=='blob'}
def blob(sha):
    b=api('git/blobs/'+sha); assert b['encoding']=='base64';raw=base64.b64decode(b['content']);assert hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()==sha;return raw
pr=api('pulls/'+sys.argv[1]);head=pr['head']['sha'];refs={'head':head}
if pr['merged']: refs['merge']=pr['merge_commit_sha']
before=tree(BASE);changed=git('diff','--name-only',BASE,head).decode().splitlines()
result={'pr':pr['number'],'merged':pr['merged'],'baseline':BASE,'head':head,'observedMain':api('git/ref/heads/main')['object']['sha'],'refs':{}}
for label,sha in refs.items():
    remote=tree(sha);matches={}
    for p in changed:
        raw=blob(remote[p]);assert raw==git('show',f'{head}:{p}'),p;matches[p]=hashlib.sha256(raw).hexdigest()
    protected=[p for p in before if p not in MUTABLE|APPEND]
    assert all(remote.get(p)==before[p] for p in protected),'protected baseline mutation'
    for p in APPEND & before.keys():
        if remote[p]!=before[p]: assert blob(remote[p]).startswith(blob(before[p])),p
    result['refs'][label]={'commit':sha,'exactBytesSHA256':matches,'protectedExistingBlobsUnchanged':len(protected),'existingDocumentationAppendOnly':True}
print(json.dumps(result,indent=2))
