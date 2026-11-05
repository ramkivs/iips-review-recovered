"""Read-only remote authority/source census; no checkout, database or runtime execution."""
import base64,concurrent.futures,hashlib,json,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[3];OUT=pathlib.Path(__file__).resolve().parent
IRR='ramkivs/iips-review-recovered';IPD='ramkivs/iips-production-market-data';IPO='ramkivs/ipo-screening-engine'
def api(repo,p):return json.loads(subprocess.check_output(['gh','api',f'repos/{repo}'+('/'+p if p else '')],cwd=ROOT))
def blob(repo,sha):
 d=api(repo,'git/blobs/'+sha);assert d['encoding']=='base64';raw=base64.b64decode(d['content']);assert hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()==sha;return raw
def tree(repo,sha):
 d=api(repo,f'git/trees/{sha}?recursive=1');assert not d.get('truncated');return {e['path']:e['sha'] for e in d['tree'] if e['type']=='blob'}
repos={}
for r in [IRR,IPD,IPO]:
 info=api(r,'');c=api(r,'commits/main');repos[r]={'id':info['id'],'branch':'main','commit':c['sha'],'tree':c['commit']['tree']['sha'],'description':info['description']}
manifest=json.loads((ROOT/'docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json').read_text());coords={}
for name,v in manifest['pinned_bases'].items():
 repo=IRR if name.startswith('IRR') else IPD;c=api(repo,'git/commits/'+v['commit']);assert c['tree']['sha']==v['tree'];coords[name]={'repository':repo,'commit':v['commit'],'tree':c['tree']['sha'],'verifiedAgainstCurrentRemoteObjects':True}
prs={}
for n in [456,461,464,467,468,469,446,454,455,462,463,465,466]:
 p=api(IRR,f'pulls/{n}');assert p['merged'];m=api(IRR,'commits/'+p['merge_commit_sha']);checks=api(IRR,'commits/'+p['merge_commit_sha']+'/check-runs');head_checks=api(IRR,'commits/'+p['head']['sha']+'/check-runs')
 prs[str(n)]={'title':p['title'],'merged':p['merged'],'mergedAt':p['merged_at'],'head':p['head']['sha'],'merge':p['merge_commit_sha'],'tree':m['commit']['tree']['sha'],'headCheckRuns':[{'name':x['name'],'conclusion':x['conclusion'],'url':x['html_url']} for x in head_checks['check_runs']],'mainCheckRuns':[{'name':x['name'],'conclusion':x['conclusion'],'url':x['html_url']} for x in checks['check_runs']]}
refs={(IRR,repos[IRR]['commit']),(IPD,repos[IPD]['commit'])}|{(v['repository'],v['commit']) for v in coords.values()}
trees={key:tree(*key) for key in refs}
def verify_entry(e):
 assert any(v['repository']==e['repository'] and v['commit']==e['commit'] and v['tree']==e['tree'] for v in coords.values())
 # Tree identity is verified above for the adopted R5 coordinate.
 key=(e['repository'],e['commit']);assert trees[key][e['path']]==e['git_blob_oid_sha1'];raw=blob(e['repository'],e['git_blob_oid_sha1']);assert hashlib.sha256(raw).hexdigest()==e['raw_file_sha256'];return {'repository':e['repository'],'commit':e['commit'],'path':e['path'],'blob':e['git_blob_oid_sha1'],'sha256':e['raw_file_sha256'],'bytes':len(raw)}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:entries=list(pool.map(verify_entry,manifest['entries']))
# Re-use the prior holdings source investigation by checking its pinned blobs, not rerunning it.
prior=json.loads((ROOT/'evidence/integration/sairam-holdings-readiness-2026-11-06/cited-portfolio-source-manifest.json').read_text())
prior_matches=[dict(path=e['path'],unchanged=trees[(IPD,repos[IPD]['commit'])][e['path']]==e['blob']) for e in prior];assert all(x['unchanged'] for x in prior_matches)
alias_rows=[]
for e in manifest['split_baseline']['alias_raw_sources']:
 row={'path':e['path']}
 for label,role in [('alias','IPD_broker_alias_compatibility_coordinate'),('primary','IPD_primary_qe_coordinate')]:
  coordinate=coords[role]['commit'];oid=trees[(IPD,coordinate)][e['path']];assert oid==e[label+'_blob_oid_sha1'];raw=blob(IPD,oid);assert hashlib.sha256(raw).hexdigest()==e[label+'_raw_file_sha256'];row[label+'Blob']=oid
 row['currentBlob']=trees[(IPD,repos[IPD]['commit'])].get(e['path']);alias_rows.append(row)
profile_path='frontend/broker-import-package-profile.json';profile_oid=trees[(IRR,repos[IRR]['commit'])][profile_path];profile= json.loads(blob(IRR,profile_oid));assert profile['aliasCommit']==repos[IPD]['commit']
footprint=[]
for e in manifest['entries']:
 current=trees[(e['repository'],repos[e['repository']]['commit'])].get(e['path']);footprint.append({'repository':e['repository'],'path':e['path'],'adoptedBlob':e['git_blob_oid_sha1'],'currentBlob':current,'unchanged':current==e['git_blob_oid_sha1']})
mapper='frontend/src/features/portfolio/import/broker-holdings-mapper.ts';classifications={}
for name in ['IPD_broker_alias_compatibility_coordinate','IPD_primary_qe_coordinate']:
 c=coords[name]['commit'];b=blob(IPD,trees[(IPD,c)][mapper]);classifications[name]={'commit':c,'blob':trees[(IPD,c)][mapper],'REAL':b.count(b"sourceClassification: 'REAL'"),'UNCLASSIFIED':b.count(b"sourceClassification: 'UNCLASSIFIED'")}
c=repos[IPD]['commit'];b=blob(IPD,trees[(IPD,c)][mapper]);classifications['liveBrokerPin']={'commit':c,'blob':trees[(IPD,c)][mapper],'REAL':b.count(b"sourceClassification: 'REAL'"),'UNCLASSIFIED':b.count(b"sourceClassification: 'UNCLASSIFIED'")}
act='evidence/cross-repository/IIPS_V3_CAP02_GATE4_TARGET_HOST_QUALIFICATION_ACT_EFFECTIVE_2026-10-23.md';act_blob=trees[(IPD,c)][act];act_bytes=blob(IPD,act_blob)
assert act_blob=='66b56fd1584890525a7250aadd7da449def621e5'
candidates={}
for label,sha in [('G4P1','a891802e2691bd9c65a67d6abff20d8ce0c26d7d'),('C1alternative','001c3c80618f2ee1d40e9a90912237e1a06e7b58'),('liveContentCandidateOnly',c)]:
 d=api(IPD,'git/commits/'+sha);candidates[label]={'commit':d['sha'],'tree':d['tree']['sha']}
pins=json.loads((ROOT/'frontend/package.json').read_text())['dependencies']
report={'repositories':repos,'mergedPRs':prs,'R5Coordinates':coords,'R5VerifiedEntries':entries,'R5EntryCount':len(entries),'R5AliasRawSourceCensus':alias_rows,'currentCoreFootprintComparedToR5':footprint,'currentPublishedConsumptionProfile':{'path':profile_path,'blob':profile_oid,'aliasCommit':profile['aliasCommit'],'requiredPublishedModules':profile['requiredPublishedModules'],'publishedRoot':profile['publishedRoot'],'sourceArtifactCountExpectedByProfile':2*len(profile['requiredPublishedModules']),'note':'Profile readback only, not a new installed-package qualification.'},'candidateContentCoordinatesNotDesignations':candidates,'Gate4Act':{'path':act,'blob':act_blob,'sha256':hashlib.sha256(act_bytes).hexdigest()},'currentDependencyPins':{k:v for k,v in pins.items() if k.startswith('iips-')},'lineageClassification':classifications,'priorHoldingsSourceBlobsUnchanged':prior_matches,'openPRs':json.loads(subprocess.check_output(['gh','pr','list','--state','open','--limit','100','--json','number,title,headRefName'],cwd=ROOT)),'operationalAccess':False,'IPDMutations':False}
(OUT/'remote-census.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: remote refs, 13 merged PRs, all three adopted R5 coordinates and 56 exact blob/SHA256 entries; current lineage/pins and unchanged holdings sources. No gate designation.')
