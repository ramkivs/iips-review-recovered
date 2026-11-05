"""Run from repository root. Adoption scope and preservation checks, not runtime proof."""
from pathlib import Path
import hashlib
import json
import subprocess

folder = Path(__file__).parent
baseline = json.loads((folder / 'rebaseline.json').read_text())
for path, expected in baseline['protected_sha256'].items():
    assert hashlib.sha256(Path(path).read_bytes()).hexdigest() == expected, path
print('PASS:', len(baseline['protected_sha256']), 'protected runtime/workflow/authority/proposal files byte-identical')
tracker = 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
report = 'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md'
for path in (tracker, report):
    original = subprocess.check_output(['git', 'show', baseline['main'] + ':' + path])
    assert Path(path).read_bytes().startswith(original), path
print('PASS: tracker and R2 changes are additive only; all historical prose retained')
text = Path(tracker).read_text()
for token in ('### 16.256 ', 'V2131.', 'CV-CORR-236 /', 'CHG-2026-11-05-07 /'):
    assert text.count(token) == 1, token
assert '\r' not in text and not any(line.rstrip() != line for line in text.splitlines())
assert not any(line.startswith(('<<<<<<< ', '=======', '>>>>>>> ')) for line in text.splitlines())
print('PASS: tracker allocation/whitespace/merge-marker checks')
act = Path('docs/integration/IIPS_v3.0_CAP02_U1_AMEND_02_LIVE_EVIDENCE_RETENTION_PA_ADOPTION_ACT_2026-11-05.md').read_text()
for token in ('owner-4dc756b3', 'NOT IMPLEMENTED', 'fsync', 'original `asOf`', 'W-1 ON', '7bfb84187397a013b5e2c8edcd12f37705eefea827e24abe1650eceff8f41ac8'):
    assert token in act, token
changed = subprocess.check_output(['git', 'diff', '--name-only', baseline['main']], text=True).splitlines()
assert all(p.startswith(('docs/', 'evidence/')) or p == tracker for p in changed), changed
print('PASS: bounded docs/evidence/tracker scope; no runtime test or retention success asserted')
