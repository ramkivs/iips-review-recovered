import json, subprocess, hashlib, sys
IPD='/tmp/ipd'; IRR='/home/user/iips-review-recovered'
man=json.load(open('/home/user/iips-review-recovered/docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json'))
def git(repo,*a,binary=False):
    r=subprocess.run(['git','-C',repo,*a],capture_output=True)
    if r.returncode!=0: return None
    return r.stdout if binary else r.stdout.decode().strip()
fails=[]; checks=0
def check(cond,msg):
    global checks; checks+=1
    if not cond: fails.append(msg)
def verify(group, e, expect_state=None):
    repo = IPD if e['repository'].endswith('production-market-data') else IRR
    tree=git(repo,'rev-parse',f"{e['commit']}^{{tree}}")
    check(tree==e['tree'], f"{group}:{e['path']}: tree {tree} != {e['tree']}")
    blob=git(repo,'rev-parse',f"{e['commit']}:{e['path']}")
    if not str(e['state']).startswith('PRESENT'):
        check(blob is None, f"{group}:{e['path']}: expected absent, found {blob}")
        return
    check(blob==e['git_blob_oid_sha1'], f"{group}:{e['path']}: blob {blob} != {e['git_blob_oid_sha1']}")
    b=git(repo,'cat-file','blob',blob,binary=True)
    check(hashlib.sha256(b).hexdigest()==e['raw_file_sha256'], f"{group}:{e['path']}: sha256 mismatch")
    check(hashlib.sha256(b).hexdigest()==e['raw_file_sha256_verified'], f"{group}:{e['path']}: verified sha mismatch")
    check(len(b)==e['byte_length'], f"{group}:{e['path']}: byte length {len(b)} != {e['byte_length']}")
    crlf=b.count(b'\r\n'); cr=b.count(b'\r')-crlf; lf=b.count(b'\n')-crlf
    check(crlf==e['crlf_sequence_count'], f"{group}:{e['path']}: crlf")
    check(cr==e['bare_cr_byte_count'], f"{group}:{e['path']}: bare cr")
    check(lf==e['lf_byte_count'], f"{group}:{e['path']}: lf")
    le='CRLF' if (crlf and not lf) else ('MIXED' if (crlf and lf) else 'LF')
    check(le==e['line_endings_in_git_blob'], f"{group}:{e['path']}: newline classification")

for e in man['entries']: verify('entries', e)
for e in man['criteria_basis']: verify('criteria_basis', e)
for e in man['conditional_entries']: verify('conditional', e)
for e in man['frozen_g3_anchors']: verify('anchors_frozen', e)
for e in man['frozen_g3_anchors_revalidated_at_qe_candidate']:
    e2=dict(e); e2['raw_file_sha256_verified']=e['raw_file_sha256']; verify('anchors_qe', e2)
for e in man['historical_superseded_set']['entries']: verify('historical', e)
for e in man['split_baseline']['alias_raw_sources']:
    blob=git(IPD,'rev-parse',f"{man['pinned_bases']['IPD_broker_alias_compatibility_coordinate']['commit']}:{e['path']}")
    check(blob==e['alias_blob_oid_sha1'], f"alias:{e['path']}: blob")
    b=git(IPD,'cat-file','blob',blob,binary=True)
    check(hashlib.sha256(b).hexdigest()==e['alias_raw_file_sha256'], f"alias:{e['path']}: sha")
    check(len(b)==e['alias_byte_length'], f"alias:{e['path']}: len")

# structural checks
check(man['entry_count']==len(man['entries'])==56, 'entry_count')
check(man['ipd_entry_count']==32 and man['irr_entry_count']==24, '32/24 split')
check(sum(1 for e in man['entries'] if e['repository'].endswith('production-market-data'))==32,'ipd recount')
check(sum(1 for e in man['entries'] if not e['repository'].endswith('production-market-data'))==24,'irr recount')
check(man['present_entry_count']==sum(1 for e in man['entries'] if e['state']=='PRESENT')==56,'present count')
check(man['absent_required_or_future_count']==0,'absent count')
check(len(man['criteria_basis'])==9,'criteria 9')
check(len(man['frozen_g3_anchors'])==10,'anchors 10')
check(len(man['historical_superseded_set']['entries'])==17,'historical 17')
check(len(man['split_baseline']['alias_raw_sources'])==14,'alias 14')
# distinctness of the two IPD coordinates
pb=man['pinned_bases']
check(pb['IPD_primary_qe_coordinate']['commit']!=pb['IPD_broker_alias_compatibility_coordinate']['commit'],'coordinates distinct')
r=subprocess.run(['git','-C',IPD,'merge-base','--is-ancestor',pb['IPD_broker_alias_compatibility_coordinate']['commit'],pb['IPD_primary_qe_coordinate']['commit']])
check(r.returncode==0,'alias is ancestor of primary')
print('CHECKS', checks, 'FAILS', len(fails))
for f in fails: print('FAIL:',f)
sys.exit(1 if fails else 0)
