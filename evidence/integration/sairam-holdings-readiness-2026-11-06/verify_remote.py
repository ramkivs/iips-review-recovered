"""Independent GitHub API blob verification of documentation-only publication."""
import base64,hashlib,json,pathlib,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parents[3];REPO='ramkivs/iips-review-recovered';BASE=sys.argv[2] if len(sys.argv)>2 else '2a55110806599084355b299fb3e0a559471f0c48'
APPEND={'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md','docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md'}
def api(path):return json.loads(subprocess.check_output(['gh','api',f'repos/{REPO}/{path}'],cwd=ROOT))
def git(*a):return subprocess.check_output(['git',*a],cwd=ROOT)
def tree(sha):
 t=api(f'git/trees/{sha}?recursive=1');assert not t.get('truncated');return {x['path']:x['sha'] for x in t['tree'] if x['type']=='blob'}
def blob(sha):
 d=api('git/blobs/'+sha);assert d['encoding']=='base64';b=base64.b64decode(d['content']);assert hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()==sha;return b
pr=api('pulls/'+sys.argv[1]);head=pr['head']['sha'];refs={'head':head}
if pr['merged']:refs['merge']=pr['merge_commit_sha']
changed=git('diff','--name-only',BASE,head).decode().splitlines();result={'baseline':BASE,'pr':pr['number'],'merged':pr['merged'],'head':head,'observedMain':api('git/ref/heads/main')['object']['sha'],'refs':{}}
for label,sha in refs.items():
 comparison=BASE if label=='head' else api('git/commits/'+sha)['parents'][0]['sha']
 base=tree(comparison);t=tree(sha);matches={}
 for p in changed:
  b=blob(t[p]);assert b==git('show',head+':'+p),p;matches[p]=hashlib.sha256(b).hexdigest()
 protected=[p for p in base if p not in APPEND];assert all(t.get(p)==base[p] for p in protected)
 for p in APPEND:
  if t[p]!=base[p]:assert blob(t[p]).startswith(blob(base[p])),p
 result['refs'][label]={'commit':sha,'preservationComparisonBase':comparison,'exactChangedBytesSHA256':matches,'protectedExistingBlobsUnchanged':len(protected),'existingChangesAppendOnly':True,'W1':'UNCHANGED'}
print(json.dumps(result,indent=2))
