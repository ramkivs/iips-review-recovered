"""Documentation-only scope/authority checks. Run from repository root."""
import hashlib
import json
from pathlib import Path
import subprocess

root = Path(__file__).parent
baseline = json.loads((root / 'baseline.json').read_text())
for item in baseline['files']:
    assert hashlib.sha256(Path(item['path']).read_bytes()).hexdigest() == item['sha256'], item['path']
print(f"PASS: {len(baseline['files'])} investigated/protected files byte-identical")
http = Path('frontend/server/broker-import/brokerImportHttp.ts').read_text()
assert '.retain(' not in http
ui = Path('frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx').read_text()
assert 'previewBrokerHoldings(content, file.name' in ui
assert 'fetch(' not in ui
act = Path(baseline['files'][7]['path']).read_text()
assert 'authorize any write, any durable-success claim' in act
report = Path(baseline['files'][8]['path']).read_text()
assert 'it would add a write path this act does not grant' in report
pf = Path('frontend/server/persistence/persistence-service.ts').read_text()
assert 'library authority, not an' in pf
assert 'appendFileSync' in pf and 'fsyncSync' not in pf
print('PASS: source flow and explicit authority exclusions confirmed (not runtime proof)')
changed = subprocess.check_output(['git', 'diff', '--name-only', baseline['baseline'], 'HEAD'], text=True).splitlines()
changed += subprocess.check_output(['git', 'diff', '--name-only'], text=True).splitlines()
assert all(p.startswith(('docs/', 'evidence/')) for p in changed), changed
print('PASS: committed/working tracked changes limited to documentation/evidence')
print('NOT RUN: runtime tests; no runtime changes. No import-to-retention success claimed.')
