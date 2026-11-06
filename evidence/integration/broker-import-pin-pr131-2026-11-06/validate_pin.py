"""IRR-only exact alias advance/scope and evidence validation, no network or IPD execution."""
import hashlib
import json
from pathlib import Path
import subprocess
R = Path(__file__).resolve().parents[3]
BASE = '4fa8f6c7de860df722cdbea3595cbac7a5e75557'
TARGET = '58fc8fb7f033650f40d61078d70e951f21dd033f'
OLD = '07e86a4f2c105651f3097a96cb519f8611945e30'
TRACKER = 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
HERE = Path(__file__).resolve().parent

def git(*args):
    return subprocess.check_output(['git', *args], cwd=R)

def load(p):
    return json.loads((R / p).read_text())

def main():
    for p in ['frontend/package.json', 'frontend/package-lock.json']:
        assert (R / p).read_bytes() == git('show', BASE + ':' + p).replace(OLD.encode(), TARGET.encode()), p
    profile = load('frontend/broker-import-package-profile.json')
    old = json.loads(git('show', BASE + ':frontend/broker-import-package-profile.json'))
    for key in old:
        if key not in ['aliasCommit', 'aliasSpecifier', 'aliasProvenance', 'comment']:
            assert profile[key] == old[key], key
    assert profile['aliasCommit'] == TARGET and profile['aliasSpecifier'].endswith('#' + TARGET)
    a = json.loads((HERE / 'authority.json').read_text())
    assert a['main'] == a['target'] == TARGET
    assert set(a['prs']) == {'129', '130', '131'}
    assert all(p['merged'] for p in a['prs'].values())
    assert all(p['behindBy'] == 0 for p in a['comparisons'].values())
    m = load('frontend/broker-import-publication-manifest.json')
    assert m['commit'] == TARGET and m['fileCount'] == len(m['files']) == 152
    canonical = json.dumps(m['files'], sort_keys=True, separators=(',', ':')).encode()
    assert hashlib.sha256(canonical).hexdigest() == m['publishedInventorySha256']
    materialized = json.loads((HERE / 'materialized-manifest.json').read_text())
    assert materialized['aliasCommit'] == TARGET and materialized['files'] == m['files']
    assert (R / TRACKER).read_bytes().startswith(git('show', BASE + ':' + TRACKER))
    allowed = {TRACKER, 'docs/integration/WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR131-2026-11-06.md'}
    allowed |= {'frontend/' + p for p in ['package.json', 'package-lock.json', 'broker-import-package-profile.json', 'broker-import-publication-manifest.json', 'server/broker-import/brokerImportPackageConsumer.test.ts', 'src/api/brokerHoldingsPreview.ts', 'tsconfig.broker-import.json']}
    allowed |= {str(HERE.relative_to(R) / p) for p in ['authority.json', 'materialized-manifest.json', 'verification.json', 'validation.txt', 'validate_pin.py']}
    changed = set(git('diff', '--name-only', BASE).decode().splitlines())
    assert changed <= allowed, changed - allowed
    v = json.loads((HERE / 'verification.json').read_text())
    assert v['operationalActions'] == [] and v['archiveSRIClaimed'] is False
    assert v['publishedInventorySha256'] == m['publishedInventorySha256']
    print('PASS: exact alias-only package/lock advance, unchanged other pins/profile contract, 152-file inventory/materialized evidence, ancestry, append-only tracker and IRR scope.')

if __name__ == '__main__':
    main()
