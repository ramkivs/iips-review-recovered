import json, subprocess, hashlib, copy, sys

IPD='/tmp/ipd'; IRR='/home/user/iips-review-recovered'
IPD_C='8eec74ae27cda09f3c368b9c299895eae41554db'; IPD_T='4eba29029f8d95cfe483e615a7047426b298ce50'
ALIAS_C='70b24f029842a7e9b7f615e4d9df7376fd4ff817'; ALIAS_T='cc0f0117822850f9046e9a51bd05c1d45f80cd57'
IRR_C='ba64b2d5927c2f872560710cf1474c25a5cde0d5'; IRR_T='5e4262f1cd75bf13b76ced5b45058f31434b5dad'
G3_C='1cceacfff40f22dbc9cd64906bf26a5feac1075e'; G3_T='b2dd2debb295fa28bda7efdd70a66b4cfe9337a9'

def git(repo,*a,binary=False):
    r=subprocess.run(['git','-C',repo,*a],capture_output=True)
    if r.returncode!=0: return None
    return r.stdout if binary else r.stdout.decode().strip()

def measure(repo,commit,path):
    blob=git(repo,'rev-parse',f'{commit}:{path}')
    if blob is None: return None
    b=git(repo,'cat-file','blob',blob,binary=True)
    crlf=b.count(b'\r\n'); cr=b.count(b'\r')-crlf; lf=b.count(b'\n')-crlf
    return dict(blob=blob, sha=hashlib.sha256(b).hexdigest(), n=len(b),
                lf=lf, crlf=crlf, cr=cr, le=('CRLF' if (crlf and not lf) else ('MIXED' if (crlf and lf) else 'LF')))

R4='/home/user/iips-review-recovered/docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json'
r4bytes=open(R4,'rb').read()
r4sha=hashlib.sha256(r4bytes).hexdigest()
man=json.load(open(R4))
is_ipd=lambda e: e['repository'].endswith('production-market-data')

delta=[]
def rebuild(e, commit, tree, note_absent=None):
    m=measure(IPD if is_ipd(e) else IRR, commit, e['path'])
    old=e['git_blob_oid_sha1']
    if e['state'] in ('ABSENT_AT_PINNED_BASELINE',):
        if m is None:
            e.update(commit=commit, tree=tree)
            return e
        e['state']='PRESENT'
        e['requirement']=note_absent or e['requirement']
    if m is None:
        raise SystemExit('MISSING '+e['path'])
    if old!=m['blob']:
        delta.append(dict(group=None, path=e['path'], repository=e['repository'],
                          from_commit=e['commit'], from_blob_oid_sha1=old,
                          from_byte_length=e['byte_length'],
                          to_blob_oid_sha1=m['blob'], to_byte_length=m['n']))
    e.update(commit=commit, tree=tree, git_blob_oid_sha1=m['blob'], raw_file_sha256=m['sha'],
             raw_file_sha256_verified=m['sha'], byte_length=m['n'],
             line_endings_in_git_blob=m['le'], lf_byte_count=m['lf'],
             crlf_sequence_count=m['crlf'], bare_cr_byte_count=m['cr'])
    return e

out=copy.deepcopy(man)
def coord(e): return (IPD_C,IPD_T) if is_ipd(e) else (IRR_C,IRR_T)

for e in out['entries']:
    c,t=coord(e); before=len(delta); rebuild(e,c,t,'mandatory')
    for d in delta[before:]: d['group']='entries'
for e in out['criteria_basis']:
    c,t=coord(e); before=len(delta); rebuild(e,c,t)
    for d in delta[before:]: d['group']='criteria_basis'
for e in out['conditional_entries']:
    c,t=coord(e); before=len(delta)
    m=measure(IPD,c,e['path'])
    if m is None:
        e.update(commit=c,tree=t)
    else:
        e.update(commit=c,tree=t,state='PRESENT',requirement='conditional; PRESENT at this pin because Limb A adopted the helper',
                 git_blob_oid_sha1=m['blob'],raw_file_sha256=m['sha'],raw_file_sha256_verified=m['sha'],
                 byte_length=m['n'],line_endings_in_git_blob=m['le'],lf_byte_count=m['lf'],
                 crlf_sequence_count=m['crlf'],bare_cr_byte_count=m['cr'],
                 digest_input='Git blob bytes; object ID SHA-1 and SHA-256 over the same unmodified bytes; no normalization or working-tree filters')
    for d in delta[before:]: d['group']='conditional_entries'

# historical set unchanged; re-verify
hist_ok=0
for e in out['historical_superseded_set']['entries']:
    m=measure(IPD,e['commit'],e['path'])
    assert m and m['blob']==e['git_blob_oid_sha1'] and m['sha']==e['raw_file_sha256'], e['path']
    hist_ok+=1

# anchors: preserve frozen set at accepted Gate 3 pin; re-measure at QE candidate
anchors_frozen=copy.deepcopy(out['frozen_g3_anchors'])
remeas=[]
for e in out['frozen_g3_anchors']:
    m=measure(IPD,IPD_C,e['path'])
    remeas.append(dict(repository=e['repository'],commit=IPD_C,tree=IPD_T,path=e['path'],state='PRESENT',
        git_blob_oid_sha1=m['blob'],raw_file_sha256=m['sha'],raw_file_sha256_verified=m['sha'],
        byte_length=m['n'],line_endings_in_git_blob=m['le'],lf_byte_count=m['lf'],
        crlf_sequence_count=m['crlf'],bare_cr_byte_count=m['cr'],
        digest_input='Git blob bytes; object ID SHA-1 and SHA-256 over the same unmodified bytes; no normalization or working-tree filters',
        differs_from_accepted_gate3_anchor=(m['blob']!=e['git_blob_oid_sha1'])))

# 14 alias raw sources
ALIAS_SRCS=[
 'frontend/src/features/portfolio/import/broker-format-detector.ts',
 'frontend/src/features/portfolio/import/broker-holdings-mapper.ts',
 'frontend/src/features/portfolio/import/broker-import-ingress.ts',
 'frontend/src/features/portfolio/import/types.ts',
 'frontend/src/features/portfolio/import/adapters/csv-parser-helper.ts',
 'frontend/src/features/portfolio/import/adapters/dhan-holdings-adapter.ts',
 'frontend/src/features/portfolio/import/adapters/groww-holdings-adapter.ts',
 'frontend/src/features/portfolio/import/adapters/index.ts',
 'frontend/src/features/portfolio/import/adapters/zerodha-holdings-adapter.ts',
 'src/identity/security_master.ts','src/identity/mapping_store.ts','src/identity/quarantine.ts',
 'src/contracts/provenance.ts','src/contracts/types.ts']
alias_entries=[]
for p in ALIAS_SRCS:
    a=measure(IPD,ALIAS_C,p); b=measure(IPD,IPD_C,p)
    alias_entries.append(dict(path=p, alias_blob_oid_sha1=a['blob'], alias_raw_file_sha256=a['sha'],
        alias_byte_length=a['n'], alias_line_endings_in_git_blob=a['le'],
        primary_blob_oid_sha1=b['blob'] if b else None, primary_raw_file_sha256=b['sha'] if b else None,
        identity='IDENTICAL_AT_BOTH_COORDINATES' if (b and a['blob']==b['blob']) else 'DIVERGENT_AT_COORDINATES'))

identical=sum(1 for e in alias_entries if e['identity'].startswith('IDENTICAL'))
divergent=[e['path'] for e in alias_entries if e['identity'].startswith('DIVERGENT')]

out['manifest_id']='G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5'
out['status']='PROPOSED CANDIDATE — NOT ADOPTED; NOT AN EFFECTIVE QUALIFICATION BASELINE'
out['purpose']=('Machine-checkable source and criteria digest candidate, regenerated at the CAP-03 DQ-6b Path A '
 'interim split baseline. Future implementation and run artifacts cannot be hashed until they exist and are '
 'immutably pinned.')
out['pinned_bases']={
 'IPD_primary_qe_coordinate':{'commit':IPD_C,'tree':IPD_T,
   'use':'Qualified-tree IPD bytes for all 32 IPD entries, the 9 criteria references and the re-measured Gate 3 anchors. 0 commits behind IPD main at regeneration.'},
 'IPD_broker_alias_compatibility_coordinate':{'commit':ALIAS_C,'tree':ALIAS_T,
   'use':'Raw-source build inputs compiled by frontend/tsconfig.broker-import.json into .cache/broker-import for the live DB-C1 /broker-holdings preview. Interim, guarded; NOT a modernization of the alias.'},
 'IRR_qe_consumer':{'commit':IRR_C,'tree':IRR_T,
   'use':'Exact qualification consumer code pin for the 24 IRR entries; measured at this commit and re-verified byte-identical at the freeze-publication merge commit.'}}
out['supersedes']={'manifest_id':man['manifest_id'],'raw_file_sha256':r4sha,
 'pinned_bases':man['pinned_bases'],
 'note':'R4 is preserved unmodified as the 2026-10-22 candidate. R5 does not rewrite it; membership of the 56 primary entries, the 9 criteria references, the 17 historical entries and the accepted Gate 3 anchor set is unchanged.'}
out['split_baseline']={
 'authority':'IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01 (Path A, interim, guarded)',
 'ipd_coordinates':[
   {'role':'primary','commit':IPD_C,'tree':IPD_T,'ancestry_of_ipd_main':'IS main'},
   {'role':'broker-import compatibility alias','commit':ALIAS_C,'tree':ALIAS_T,'ancestry_of_ipd_main':'ANCESTOR, 214 commits behind'}],
 'alias_raw_source_count':len(alias_entries),
 'alias_raw_sources_identical_at_both_coordinates':identical,
 'alias_raw_sources_divergent_at_coordinates':len(divergent),
 'alias_raw_sources':alias_entries,
 'overlap_finding':('src/identity/security_master.ts is BOTH a qualified-tree entry at the primary coordinate '
   'and a required alias raw source. Its bytes differ between the two coordinates, so the qualified IRR build '
   'contains two distinct SecurityMaster byte-sets: the primary coordinate supplies the qualified-tree entry, '
   'and the alias coordinate supplies the copy compiled into .cache/broker-import. This is recorded explicitly '
   'so the split is never mistaken for a single-coordinate baseline.'),
 'lineage_note':('The alias coordinate predates the mapper change that turns sourceClassification from REAL to '
   'UNCLASSIFIED at three sites (blob 6c8ab71dc9230d22d0d3fe9a13e1809371f396e4 at the alias vs '
   '297e4a593bb575a5f3f8616788f3aa9e599707a4 at the primary). REAL is therefore the lineage classification '
   'that the DB-C1 preview exhibits, and the primary-coordinate classification is UNCLASSIFIED.')}
out['entry_count']=len(out['entries'])
out['ipd_entry_count']=sum(1 for e in out['entries'] if is_ipd(e))
out['irr_entry_count']=sum(1 for e in out['entries'] if not is_ipd(e))
out['present_entry_count']=sum(1 for e in out['entries'] if e['state']=='PRESENT')
out['absent_required_or_future_count']=sum(1 for e in out['entries'] if e['state']!='PRESENT')
out['delta_from_r4']={'changed_entry_count':len(delta),'entries':delta}
out['frozen_g3_anchors']=anchors_frozen
out['frozen_g3_anchors_revalidated_at_qe_candidate']=remeas
out['historical_superseded_set']['reverified_count']=hist_ok
out['future_required_before_any_run']=[
 'Record the exact IRR QE execution commit/tree (IRR_qe_consumer pin) and the exact IPD QE execution commit/tree (IPD primary coordinate) before host/runtime preflight/run; any non-documentary source drift requires explicit PA reconciliation.',
 'Complete content validation and distinct PA adoption/replacement of this regenerated manifest before host/runtime preflight; approve the hash domains and the protocols for compiled-runtime and evidence-deposit manifests.',
 'Build the exact qualified commit and record compiled runtime artifact hashes (dist) plus host/runtime manifest before Q11-before and after Q11-after; mismatch or drift invalidates the run.',
 'Obtain native-Windows canonical worktree evidence before any production claim; all evidence in this chain is Linux sandbox evidence.',
 'Adopt, defer or reject the alias modernization follow-on tick; the split remains interim until a separately authorized modernization collapses it.']
out['limb_a_state_change']={
 'path':'tests/g4_run_tests_summary_parsing.test.ts',
 'r4_state':'ABSENT_AT_PINNED_BASELINE at 1cceacff…',
 'r5_state':'PRESENT and digest-bound at 8eec74ae…',
 'blob_oid_sha1':measure(IPD,IPD_C,'tests/g4_run_tests_summary_parsing.test.ts')['blob'],
 'condition':'Present at the candidate coordinate because commit c62dee81748aaed6416956b2e323ce77d1ff1f3c ("CAP-02: implement bounded Gate A prime and Limb A work") is an ancestor of IPD main@8eec74ae. Path membership in H-12 is unchanged; only the declared present/absent state moved, so this is not a membership change.',
 'boundary':'Presence and digest binding are content-integrity facts. They are not Limb A acceptance, not qualification, not Gate 4 credit and not QE evidence.'}
out['validation_state']={
 'status':'BASELINE CONTENT-INTEGRITY VALIDATED AT THE R5 CANDIDATE COORDINATES; ADOPTION AND RUNTIME ARTIFACT VALIDATION OUTSTANDING',
 'checked_at_utc_date':'2026-10-25',
 'validation_record':'IIPS-V3-G4-H12-CANDIDATE-VALIDATION-2026-10-25-R5',
 'present_entries_verified':'56/56',
 'authoritative_criteria_entries_verified':'%d/%d'%(len(out['criteria_basis']),len(out['criteria_basis'])),
 'frozen_gate3_anchors_reverified_at_accepted_pin':'%d/%d'%(len(anchors_frozen),len(anchors_frozen)),
 'gate3_anchors_remeasured_at_qe_candidate':len(remeas),
 'historical_entries_verified':'%d/%d'%(hist_ok,hist_ok),
 'conditional_entries_present':1,
 'required_future_entries_absent_at_pinned_baseline':0,
 'adoption_status':'NOT ADOPTED. A distinct PA adoption/replacement act is required, plus the host sequence (H-12 adoption -> S2 -> one P-1 provisioning execution -> S3 preflight -> QE).'}
out['adoption_boundary']=('PA must adopt or replace this R5 path membership, present/absent/conditional status, hash domains, '
 'LF/CRLF treatment, criteria basis, the IRR QE consumer pin, and the re-measured Gate 3 anchor identities at the QE candidate '
 'coordinate before any executable use. Re-measuring the accepted Gate 3 anchors at 8eec74ae is a measurement, not a silent '
 're-pinning of the accepted anchor set, which is preserved unchanged at 1cceacfff40f22dbc9cd64906bf26a5feac1075e.')

json.dump(out, open('/home/user/iips-review-recovered/docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json','w'), indent=2, ensure_ascii=False)
print('entries',out['entry_count'],'ipd',out['ipd_entry_count'],'irr',out['irr_entry_count'],'present',out['present_entry_count'])
print('delta',len(delta))
print('identical',identical,'divergent',len(divergent), divergent)
print('anchors differing', sum(1 for e in remeas if e['differs_from_accepted_gate3_anchor']))
print('cond', out['conditional_entries'][0]['state'], out['conditional_entries'][0]['git_blob_oid_sha1'])
