"""IRR-only documentary assessment validation; no DB/IPD execution or network."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = Path(__file__).resolve().parent
BASE = 'bd6387441a7a8c5a1992ac2d7685a1632b594c7c'


def main():
    d = json.loads((EVIDENCE / 'assessment.json').read_text())
    p = json.loads((EVIDENCE / 'source-readback.json').read_text())
    report = (ROOT / 'docs/integration/D06-OPERATION-ADMISSION-READINESS-ASSESSMENT-2026-11-06.md').read_text()
    assert d['baselineIRR'] == p['baselineIRR'] == BASE
    assert d['baselineIPD'] == p['baselineIPD'] == '1cde2324ed4b4d636248af9ea3d87b10cac3d031'
    assert [r['id'] for r in d['H01-H12']] == [f'H{i:02d}' for i in range(1, 13)]
    assert all(r['status'] == 'NOT QUALIFIED' and r['remaining'] and r['owner'] for r in d['H01-H12'])
    assert [r['id'] for r in d['QE-1-QE-11']] == [f'QE-{i}' for i in range(1, 12)]
    assert all(r['status'] == 'NOT EXECUTED' and r['qualificationCredit'] == 0 and r['requiredEvidence'] for r in d['QE-1-QE-11'])
    assert d['QECompleted'] == 0 and d['QERequired'] == 11
    assert d['W1Authorized'] is False and d['authorityGrant'] is False
    assert d['excludedActionsPerformed'] == []
    assert d['Gate4Acceptance'] == 'NOT RENDERED'
    assert d['Gate5Admission'] == 'NOT INITIATED / NOT ADMITTED'
    assert [f['id'] for f in d['reviewFindings']] == ['F1', 'F2', 'F3', 'F4']
    for r in p['governingIRRSources']:
        raw = (ROOT / r['path']).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == r['sha256'], r['path']
        blob = subprocess.check_output(['git', 'rev-parse', BASE + ':' + r['path']], cwd=ROOT, text=True).strip()
        assert blob == r['blob'], r['path']
    assert len([r for r in p['readbacks'] if r['repo'] == 'iips-production-market-data']) == 8
    for r in p['readbacks']:
        if r['repo'] == 'iips-review-recovered':
            assert hashlib.sha256((ROOT / r['path']).read_bytes()).hexdigest() == r['sha256']
    # Assert the existing receipts/register/transcript and all unrelated files are untouched.
    expected = {
        'docs/integration/D06-OPERATION-ADMISSION-READINESS-ASSESSMENT-2026-11-06.md',
        'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md',
        *(str(path.relative_to(ROOT)) for path in EVIDENCE.iterdir() if path.is_file()),
    }
    changed = subprocess.check_output(['git', 'diff', '--name-only', BASE], cwd=ROOT, text=True).splitlines()
    assert set(changed) <= expected, changed
    tracker = ROOT / 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
    previous = subprocess.check_output(['git', 'show', BASE + ':' + tracker.name], cwd=ROOT)
    assert tracker.read_bytes().startswith(previous), 'tracker not append-only'
    for token in ['F1', 'F2', 'F3', 'F4', 'desktop-no0nhtp', '0/11', 'NOT QUALIFIED', 'REQUIRES PA AUTHORIZATION', 'H-12']:
        assert token in report, token
    for entry in p['publicationChecks']:
        assert entry['runs'] and all(r['status'] == 'completed' and r['conclusion'] == 'success' for r in entry['runs'])
        assert entry['checks'] and all(c['conclusion'] == 'success' for c in entry['checks'])
    print('PASS: 12 NOT QUALIFIED H criteria; 11 NOT EXECUTED QE criteria; immutable sources/receipts; no admission/authority; append-only tracker; IRR-only scope.')


if __name__ == '__main__':
    main()
