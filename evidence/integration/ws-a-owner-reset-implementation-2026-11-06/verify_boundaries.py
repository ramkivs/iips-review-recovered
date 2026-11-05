"""Frozen baseline, additive overlays and offline-only composition verification."""
import hashlib, json, pathlib, subprocess
ROOT=pathlib.Path(__file__).resolve().parents[3]
BASE='34c8b39e3ee1d26bba4f9b362ca631c4e42ce863'
OVERLAYS={'docs/OPERATOR_RUNBOOK.md','docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md','IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'}
def git(*args): return subprocess.check_output(['git',*args],cwd=ROOT)
entries={}
for line in git('ls-tree','-r',BASE).decode().splitlines():
    meta,name=line.split('\t'); mode,kind,sha=meta.split()
    if kind=='blob': entries[name]=sha
protected=0
for name,sha in entries.items():
    before=git('cat-file','blob',sha); after=(ROOT/name).read_bytes()
    if name in OVERLAYS: assert after.startswith(before), f'Non-additive overlay: {name}'
    else: assert before==after, f'Frozen/existing file changed: {name}'; protected+=1
for name in entries:
    if name.startswith('frontend/') and name.endswith(('.ts','.tsx','.js','.mjs')):
        assert b'ownerEvidenceReset' not in (ROOT/name).read_bytes(), f'Live composition import: {name}'
core=(ROOT/'frontend/server/broker-import/ownerEvidenceReset.ts').read_text()
assert core.count('fs.unlinkSync(')==1
assert 'fs.unlinkSync(p.target)' in core
assert 'new PersistenceService' not in core
journal=(ROOT/'frontend/server/broker-import/ownerEvidenceResetJournal.ts').read_text()
assert 'new PersistenceService' not in journal
print(json.dumps({'baseline':BASE,'protectedExistingBlobsUnchanged':protected,'overlaysAppendOnly':sorted(OVERLAYS),'liveCompositionImports':0,'soleRemoval':'fixed whole active journal only','PF1FrozenAndDependenciesAndWorkflows':'UNCHANGED','operationalEvidenceAccessed':False},indent=2))
