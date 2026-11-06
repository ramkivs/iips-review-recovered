"""Independent remote proof for Prompt 8 specifications only; no authority adoption or operations."""
import base64,concurrent.futures,hashlib,json,pathlib,subprocess,sys
from validate_scope import ROOT,BASE,APPEND,NEW,PAPER,BRANCH
REPO='ramkivs/iips-review-recovered'
def api(p):return json.loads(subprocess.check_output(['gh','api','repos/'+REPO+'/'+p],cwd=ROOT))
def raw(sha):
 d=api('git/blobs/'+sha);assert d['encoding']=='base64';b=base64.b64decode(d['content']);assert hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()==sha;return b
def tree(sha):
 d=api('git/trees/'+sha+'?recursive=1');assert not d.get('truncated');return {x['path']:x['sha'] for x in d['tree'] if x['type']=='blob'}
pr=int(sys.argv[1]);mode=sys.argv[2];assert mode in ['head','merged'];p=api(f'pulls/{pr}')
assert p['head']['ref']==BRANCH
sha=p['head']['sha'] if mode=='head' else p['merge_commit_sha'];assert mode=='head' or p['merged']
commit=api('git/commits/'+sha);parent=BASE if mode=='head' else commit['parents'][0]['sha']
old=tree(parent);new=tree(sha);changed={x for x in set(old)|set(new) if old.get(x)!=new.get(x)}
assert changed==NEW|set(APPEND),('unexpected remote changed set',changed-(NEW|set(APPEND)),(NEW|set(APPEND))-changed)
checks=api('commits/'+sha+'/check-runs')['check_runs'];assert checks and all(x['conclusion']=='success' for x in checks),checks
# The actual source branch ref must still name the PR's exact verified head.
branch=api('git/ref/heads/'+p['head']['ref']);assert branch['object']['sha']==p['head']['sha']
def verify(path):
 b=raw(new[path]);local=(ROOT/path).read_bytes();assert b==local,('remote/local mismatch',path)
 if path in APPEND:assert b.startswith(raw(old[path])),('remote not append-only',path)
 return {'path':path,'blob':new[path],'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'exact':True}
with concurrent.futures.ThreadPoolExecutor(8) as pool:files=list(pool.map(verify,sorted(changed)))
assert all(new.get(path)==blob for path,blob in old.items() if path not in APPEND)
# No hidden difference between source head and merge is allowed for task-owned paths.
if mode=='merged':
 source=tree(p['head']['sha']);assert all(source[path]==new[path] for path in changed)
 # Actual remote main must contain this exact merge. Immediate publication expects it at its tip.
 main=api('commits/main');assert main['sha']==sha,('main moved; independently recensus later commits before claiming current main',main['sha'])
# Only canonical IPD is an IIPS architecture dependency. Excluded IPO history is not tracked.
for repo,expected in [('iips-production-market-data','07e86a4f2c105651f3097a96cb519f8611945e30')]:
 d=json.loads(subprocess.check_output(['gh','api',f'repos/ramkivs/{repo}/commits/main'],cwd=ROOT));assert d['sha']==expected
print(json.dumps({'pr':pr,'mode':mode,'branch':p['head']['ref'],'sha':sha,'tree':commit['tree']['sha'],'comparisonParent':parent,'changedCount':len(changed),'files':files,'protectedPriorBlobCount':len(old)-len(APPEND),'allProtectedPriorBlobsUnchanged':True,'appendOnlyOverlayCount':len(APPEND),'checkRuns':[{'name':x['name'],'conclusion':x['conclusion'],'url':x['html_url']} for x in checks],'canonicalIPDHeadUnchanged':True,'existingAuthorityUnchanged':True,'newDecisionAdoption':False,'holdingsImplementationOrOperation':False},indent=2))
