"""Offline IRR-only additive R01/F2 receipt validation; no IPD code execution."""
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE = 'accf9c1055d5aa301ecae93f075f8c4c9676ca7e'
REPORT = 'docs/integration/R01-F2-IPD131-CLOSURE-ADDENDUM-2026-11-06.md'
APPENDS = [
    'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md',
    'docs/integration/PRE-QE-PREREQUISITE-CLOSURE-REPORT-2026-11-06.md',
    'docs/integration/D06-OPERATION-ADMISSION-READINESS-ASSESSMENT-2026-11-06.md',
    'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md',
    'docs/integration/WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md',
]


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def main():
    d = json.loads((HERE / 'evidence.json').read_text())
    assert d['IRRBaseline'] == BASE
    assert d['status'] == 'CLOSED / VERIFIED'
    assert d['scope'] == 'R01_F2_V2_BOUNDED_ENGINEERING_ONLY'
    assert d['merged'] is True and d['IPDPR'] == 131
    assert d['IPDMerge'] == '58fc8fb7f033650f40d61078d70e951f21dd033f'
    assert d['IPDHead'] == '9e348adbd894c56584ce944d5cfe0964bb1c894e'
    assert set(d['tests']) == {f'R01-T{i}' for i in range(1, 13)}
    assert all(v.startswith('PASS') for v in d['tests'].values())
    assert d['guardedSuite']['executed'] == 1068 and d['guardedSuite']['passed'] == 1067
    assert d['guardedSuite']['failed'] == 0 and d['guardedSuite']['skipped'] == 1
    assert d['cleanCloneReproduction']['status'] == 'USER_REPORTED_NOT_INDEPENDENTLY_RETRIEVED'
    assert d['otherStatusesChanged'] is False and d['IPDChangesPerformed'] is False
    assert d['operationalActions'] == []
    assert len(d['readbacks']) == 6
    for x in d['readbacks']:
        assert x['commit'] == d['IPDMerge'] and len(x['blob']) == 40 and len(x['sha256']) == 64
    for label, runid in [('head', 42236349898), ('main', 42236557560)]:
        c = d['ci'][label]
        assert c['runs'] and c['checks']
        assert all(x['conclusion'] == 'success' for x in c['runs'] + c['checks'])
        assert {x['id'] for x in c['runs']} == {runid}
    allowed = set(APPENDS + [REPORT]) | {
        str(HERE.relative_to(ROOT) / p) for p in ['evidence.json', 'validate_receipt.py', 'validation.txt']
    }
    changed = set(git('diff', '--name-only', BASE).decode().splitlines())
    assert changed <= allowed, changed - allowed
    for p in APPENDS:
        data = (ROOT / p).read_bytes()
        assert data.startswith(git('show', BASE + ':' + p)), p
        assert b'R01/F2 CLOSED / VERIFIED' in data, p
    # Frozen old machine snapshot and receipt documents must not be rewritten.
    old = 'evidence/integration/pre-qe-prerequisite-closure-2026-11-06'
    for p in ['reconciliation-evidence.json', 'validate_closure.py', 'validation.txt']:
        assert (ROOT / old / p).read_bytes() == git('show', BASE + ':' + old + '/' + p)
    text = (ROOT / REPORT).read_text()
    for token in ['CLOSED / VERIFIED', 'NOT QUALIFIED', '0/11', '8/10', 'hard-false',
                  'not independently retrieved', 'user reports', 'R01-T12', '42236557560']:
        assert token.casefold() in text.casefold(), token
    print('PASS: R01/F2 bounded closure, twelve recorded tests, pinned CI, honest reproduction provenance, five append-only records, frozen history and IRR-only scope.')


if __name__ == '__main__':
    main()
