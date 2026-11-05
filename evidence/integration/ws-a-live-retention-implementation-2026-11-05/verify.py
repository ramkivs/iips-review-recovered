"""Run from repository root: frozen boundaries, A-9 unchanged and bounded scope."""
from pathlib import Path
import hashlib
import json
import subprocess
root = Path(__file__).parent
baseline = json.loads((root / 'authority-rebaseline.json').read_text())
for item in baseline['authority_verified']:
    assert hashlib.sha256(Path(item['path']).read_bytes()).hexdigest() == item['sha256'], item['path']
print('PASS: all four independently verified authority/reference artifacts unchanged')
for path, expected in baseline['protected'].items():
    assert hashlib.sha256(Path(path).read_bytes()).hexdigest() == expected, path
print('PASS:', len(baseline['protected']), 'PF-1/workflow/frozen authority files byte-identical')
path = 'frontend/server/broker-import/brokerImportHttp.ts'
old = subprocess.check_output(['git', 'show', baseline['main'] + ':' + path], text=True)
new = Path(path).read_text()
def a9(text): return text.split("  if (route.kind === 'EVIDENCE') {", 1)[1].split("  if (route.kind === 'REVISION') {", 1)[0]
assert a9(old) == a9(new)
def projection(text): return text.split('function evidenceResponsePayload(', 1)[1].split('export async function handleBrokerImportRequest(', 1)[0]
assert projection(old) == projection(new)
assert subprocess.check_output(['git', 'diff', baseline['main'], '--', 'frontend/server/broker-import/brokerImportEvidenceStore.ts']) == b''
print('PASS: A-9 read handler/response projection and evidence store/schema/digest code unchanged')
for path in ('IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md', 'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md'):
    original = subprocess.check_output(['git', 'show', baseline['main'] + ':' + path])
    assert Path(path).read_bytes().startswith(original), path
print('PASS: tracker/R2 historical bytes preserved; updates additive only')
assert not subprocess.check_output(['git', 'diff', baseline['main'], '--', 'frontend/package.json', 'frontend/package-lock.json', 'frontend/server/user-portfolio-transport.ts', 'frontend/server/broker-import/brokerImportV1SaveAdapter.ts'])
print('PASS: pins/lockfile, W-1 holdings adapter and user-portfolio transport unchanged')
