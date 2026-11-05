"""Documentation-only checks. Run at repo root. Never opens an operational journal."""
from pathlib import Path
import hashlib
import json
import subprocess
folder = Path(__file__).parent
baseline = json.loads((folder / 'rebaseline-and-counts.json').read_text())
for path, digest in baseline['protected'].items():
    assert hashlib.sha256(Path(path).read_bytes()).hexdigest() == digest, path
print('PASS:', len(baseline['protected']), 'runtime/workflow/governance/frozen reference files unchanged')
a, b = [{x['path'] for x in p['files']} for p in baseline['prs']]
assert (len(a), len(b), len(a & b), len(a | b)) == (24, 5, 2, 27)
paths = subprocess.check_output(['git', 'diff', '--name-only', '9d3f668e457a33afc8ce67f60b2b28d71f1b08a3', baseline['main']], text=True).splitlines()
assert set(paths) == a | b
print('PASS: merged PR distinct-path reconciliation 24 + 5 - 2 = 27; exact Git diff agrees')
for path in ('docs/OPERATOR_RUNBOOK.md', 'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md', 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'):
    old = subprocess.check_output(['git', 'show', baseline['main'] + ':' + path])
    assert Path(path).read_bytes().startswith(old), path
print('PASS: runbook/tracker/R2 additions preserve all prior bytes')
changed = subprocess.check_output(['git', 'diff', '--name-only', baseline['main']], text=True).splitlines()
for p in changed:
    assert p.startswith(('docs/', 'evidence/')) or p == 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md', p
    if p.startswith('evidence/'):
        assert p.startswith(folder.resolve().relative_to(Path.cwd()).as_posix() + '/'), p
proposal = Path('docs/integration/WS-A-OWNER-EVIDENCE-DELETION-PROPOSED-ADDITIVE-AMENDMENT-2026-11-06.md').read_text()
assert 'Act ID: UNASSIGNED' in proposal and 'NOT EFFECTIVE' in proposal
print('PASS: docs-only scope; existing evidence unchanged; proposal has no invented/adopted Act ID')
print('NOT RUN: implementation/deletion/runtime tests. No operational store, backup, carrier or evidence touched.')
