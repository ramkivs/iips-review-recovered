"""Independent GitHub API blob readback; never trust fetch/working-tree equality alone."""
import base64, hashlib, json, pathlib, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parents[3]
REPO='ramkivs/iips-review-recovered'
BASE='34c8b39e3ee1d26bba4f9b362ca631c4e42ce863'
OVERLAYS={'docs/OPERATOR_RUNBOOK.md','docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md','IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'}
def git(*a): return subprocess.check_output(['git',*a],cwd=ROOT)
def api(p): return json.loads(subprocess.check_output(['gh','api',f'repos/{REPO}/{p}'],cwd=ROOT))
def tree(sha):
    t=api(f'git/trees/{sha}?recursive=1'); assert not t.get('truncated'); return {x['path']:x['sha'] for x in t['tree'] if x['type']=='blob'}
def blob(sha):
    b=api(f'git/blobs/{sha}'); assert b['encoding']=='base64'; raw=base64.b64decode(b['content']); assert hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()==sha; return raw
pr=api('pulls/'+sys.argv[1]); local=sys.argv[2] if len(sys.argv)>2 else git('rev-parse','HEAD').decode().strip()
assert pr['head']['sha']==local
head=pr['head']['sha']; main=api('git/ref/heads/main')['object']['sha']
refs={'head':head}
if pr['merged']: assert pr['merge_commit_sha']==main; refs['mergedMain']=main
baseline=tree(BASE); changed=git('diff','--name-only',BASE,local).decode().splitlines()
result={'pr':pr['number'],'url':pr['html_url'],'baseline':BASE,'localCommittedHead':local,'merged':pr['merged'],'mergeCommit':pr.get('merge_commit_sha'),'observedMain':main,'refs':{}}
for label,sha in refs.items():
    remote=tree(sha); matches=[]
    for p in changed:
        local_bytes=git('show',f'{local}:{p}'); remote_bytes=blob(remote[p]); assert local_bytes==remote_bytes,p
        matches.append({'path':p,'blob':remote[p],'sha256':hashlib.sha256(remote_bytes).hexdigest()})
    protected=[p for p in baseline if p not in OVERLAYS]
    assert all(remote.get(p)==baseline[p] for p in protected), 'protected baseline changed'
    for p in OVERLAYS:
        if remote[p]!=baseline[p]: assert blob(remote[p]).startswith(blob(baseline[p])),p
    result['refs'][label]={'commit':sha,'exactChangedByteMatches':matches,'protectedExistingBlobsUnchanged':len(protected),'overlaysAppendOnly':True}
print(json.dumps(result,indent=2))
