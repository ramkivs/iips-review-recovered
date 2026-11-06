"""IRR-only documentary closure validation. No network, IPD code or DB access."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE = '41c4498b4aacae07ddeaa02b5bc81b852e9cb993'
REPORT = 'docs/integration/PRE-QE-PREREQUISITE-CLOSURE-REPORT-2026-11-06.md'
APPENDS = [
    'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md',
    'docs/integration/D06-OPERATION-ADMISSION-READINESS-ASSESSMENT-2026-11-06.md',
    'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md',
    'docs/integration/WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md',
]


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def main():
    d = json.loads((HERE / 'reconciliation-evidence.json').read_text())
    assert d['baselineIRR'] == BASE
    assert d['baselineIPD'] == 'f9dac560b821476c417b963c83c80ad0e7747dc7'
    assert d['IPDInspection'] == 'READ_ONLY_GITHUB_API_NO_CODE_EXECUTION'
    assert d['W1Authorized'] is False and d['performedOperationalActions'] == []
    assert d['D06'] == 'BLOCKED / NOT ADMITTED'
    assert list(d['H01-H12']) == [f'H{i:02d}' for i in range(1, 13)]
    assert set(d['H01-H12'].values()) == {'NOT QUALIFIED'}
    assert list(d['QE']) == [f'QE-{i}' for i in range(1, 12)]
    assert set(d['QE'].values()) == {'NOT EXECUTED'}
    assert d['DQ4'] == {'satisfied': 8, 'required': 10, 'missing': [7, 8]}
    assert d['F1'] == 'CLOSED_BOUNDED_ENGINEERING_NOT_QUALIFIED'
    assert d['F2'] == 'PARTIAL_CORRECTION_RESIDUAL_BLOCKED'
    assert len(d['readbacks']) == 6
    assert all(x['commit'] == d['baselineIPD'] and len(x['blob']) == 40 and len(x['sha256']) == 64 for x in d['readbacks'])
    assert d['runs'] and all(x['status'] == 'completed' and x['conclusion'] == 'success' for x in d['runs'])
    assert {42220197722, 42227275305} <= {x['id'] for x in d['runs']}
    for src in d['governingSources']:
        raw = (ROOT / src['path']).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == src['sha256'], src['path']
        assert git('rev-parse', BASE + ':' + src['path']).decode().strip() == src['blob'], src['path']
    for path in APPENDS:
        assert (ROOT / path).read_bytes().startswith(git('show', BASE + ':' + path)), path
    text = (ROOT / REPORT).read_text()
    for item in [f'C{i:02d}' for i in range(1, 11)] + [f'R{i:02d}' for i in range(1, 15)]:
        assert item in text, item
    for i in range(1, 13):
        assert f'| H{i:02d} |' in text
    for i in range(1, 12):
        assert f'| QE{i} |' in text
    for token in ['BLOCKED / NOT ADMITTED', 'desktop-no0nhtp', 'verdict strings', 'NOT QUALIFIED', '0/11', '8/10', '07e86a4f2c105651f3097a96cb519f8611945e30']:
        assert token in text, token
    expected = set(APPENDS + [REPORT]) | {str(p.relative_to(ROOT)) for p in HERE.iterdir() if p.is_file()}
    changed = set(git('diff', '--name-only', BASE).decode().splitlines())
    assert changed <= expected, changed - expected
    print('PASS: 10 completed bounded items; 14 owned residual/dependency rows; all H NOT QUALIFIED; QE0/11; DQ4 8/10; W1 false; protected sources unchanged; overlays/tracker append-only; IRR-only scope.')


if __name__ == '__main__':
    main()
