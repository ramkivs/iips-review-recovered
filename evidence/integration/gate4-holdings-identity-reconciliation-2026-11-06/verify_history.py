import base64,hashlib,json,pathlib,subprocess,concurrent.futures
root=pathlib.Path(__file__).resolve().parents[3];folder=pathlib.Path(__file__).resolve().parent
def api(p):return json.loads(subprocess.check_output(['gh','api','repos/ramkivs/iips-review-recovered/'+p],cwd=root))
checks=[(456,'iips-platform/src/investment/identity/resolver.ts'),(456,'evidence/iid/IID-1-IDENTITY-COVERAGE-2026-11-05/README.md'),(461,'evidence/iid/IID-2-COMPANY-ASSESSMENT-2026-11-06/ACCEPTANCE-MATRIX.md'),(461,'iips-platform/src/investment/assessment/engine.ts'),(464,'evidence/iid/IID-3-PERSISTENCE-READ-TRANSPORT-2026-11-06/ACCEPTANCE-MATRIX.md'),(464,'frontend/server/investment/investmentArtifacts.ts'),(467,'evidence/iid/IID-3-PERSISTENCE-READ-TRANSPORT-2026-11-06/INDEPENDENT-VERIFICATION.md'),(467,'docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md'),(468,'docs/integration/SAIRAM-DURABLE-HOLDINGS-ARCHITECTURE-READINESS-2026-11-06.md'),(469,'docs/integration/SAIRAM-DURABLE-HOLDINGS-READINESS-PUBLICATION-RECEIPT-2026-11-06.md')]
census=json.loads((folder/'remote-census.json').read_text())
def verify(pair):
 n,p=pair;sha=census['mergedPRs'][str(n)]['merge'];d=api(f'contents/{p}?ref={sha}')
 if d.get('encoding')=='base64':b=base64.b64decode(d['content'])
 else:b=base64.b64decode(api('git/blobs/'+d['sha'])['content'])
 assert b==subprocess.check_output(['git','show',sha+':'+p],cwd=root)
 return {'pr':n,'merge':sha,'path':p,'blob':d['sha'],'sha256':hashlib.sha256(b).hexdigest(),'exactRemoteByteReadback':True}
rows=list(concurrent.futures.ThreadPoolExecutor(6).map(verify,checks))
old='2a55110806599084355b299fb3e0a559471f0c48';new=census['repositories']['ramkivs/iips-review-recovered']['commit']
history=subprocess.check_output(['git','log','--first-parent','--format=%H %s',old+'..'+new],cwd=root,text=True).splitlines()
(folder/'history-and-iid-readback.json').write_text(json.dumps({'lastOlderReportedBaseline':old,'currentBaseline':new,'concurrentMainHistory':history,'sinceLastReported80737d0':[],'artifactReadback':rows,'IID4to6OpenImplementationPRs':[],'scopeLimit':'No open PR at initial census; no claim about unpublished/private local drafts. No original product tests rerun.'},indent=2)+'\n')
print('PASS: 10 IID/holdings artifacts independently read at authoritative merge commits; concurrent history preserved.')
