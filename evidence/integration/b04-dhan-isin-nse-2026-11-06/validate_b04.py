"""B-04 only; standard library. Run offline tests, or --remote for pinned remote corpus readback."""
import copy
import csv
from decimal import Decimal
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess
import sys
import unittest
import base64

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE = 'e31fbc59d8597af1b834a994d7adab47cf62678c'
IPD = '749d42067edc86e74d2cf35deb4562c4549687a0'
TRACKER = 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
REPORT = 'docs/integration/B04-DHAN-68-ISIN-NSE-REASSESSMENT-2026-11-06.md'
POINTER = 'docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md'
HEADERS = ['Scrip Name', 'ISIN Code', 'Quantity', 'Avg. Buy Rate', 'Buy Value', 'LTP', 'Current Value', 'P&L', 'P&L%']


def read(name):
    return json.loads((HERE / name).read_text())


def isin_valid(value):
    if not re.fullmatch(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', value):
        return False
    digits = ''.join(c if c.isdigit() else str(ord(c) - 55) for c in value)
    return sum(n if i % 2 == 0 else (2*n//10 + 2*n % 10) for i, n in enumerate(map(int, reversed(digits)))) % 10 == 0


def parse(text):
    all_rows = list(csv.reader(io.StringIO(text)))
    assert all_rows[0] == HEADERS and len(all_rows) == 69
    assert all(len(r) == 9 for r in all_rows)
    rows = [dict(zip(HEADERS, r)) for r in all_rows[1:]]
    assert len({r['ISIN Code'] for r in rows}) == 68
    for r in rows:
        assert all(r.values()) and isin_valid(r['ISIN Code'])
        assert all(Decimal(r[h]).is_finite() for h in HEADERS[2:])
        assert Decimal(r['Quantity']) > 0 and Decimal(r['Quantity']) % 1 == 0
        assert Decimal(r['Quantity']) * Decimal(r['LTP']) == Decimal(r['Current Value'])
        assert Decimal(r['Current Value']) - Decimal(r['Buy Value']) == Decimal(r['P&L'])
    return rows


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


class B04Tests(unittest.TestCase):
    def setUp(self):
        self.text = (HERE / 'source.csv').read_text()

    def test_source_shape_checksums_arithmetic(self):
        rows = parse(self.text)
        self.assertEqual(len(rows), 68)
        self.assertEqual(rows[61]['Scrip Name'], 'National Stock Exchange of India ')

    def test_missing_row_refused(self):
        with self.assertRaises(AssertionError):
            parse('\n'.join(self.text.splitlines()[:-1]))

    def test_extra_column_refused(self):
        with self.assertRaises(AssertionError):
            parse(self.text.replace('Himadri Speciality Chemical,', 'Himadri Speciality Chemical,extra,', 1))

    def test_duplicate_identifier_refused(self):
        with self.assertRaises(AssertionError):
            parse(self.text.replace('INE01EA01019', 'INE019C01026'))

    def test_invalid_checksum_refused(self):
        self.assertFalse(isin_valid('INE019C01025'))
        with self.assertRaises(AssertionError):
            parse(self.text.replace('INE019C01026', 'INE019C01025'))

    def test_numeric_corruption_refused(self):
        with self.assertRaises(AssertionError):
            parse(self.text.replace('8522.25', '8522.26', 1))
        with self.assertRaises(AssertionError):
            parse(self.text.replace('443.17', 'NaN', 1))

    def test_all_source_values_and_statuses_preserved(self):
        a = read('assessment.json')
        rows = parse(self.text)
        self.assertEqual([r['source'] for r in a['rows']], rows)
        self.assertEqual(a['counts'], dict(rows=68, columns=9, distinctISINNSE=68, resolved=1, unresolved=67, ambiguous=0, statusChanges=0))
        self.assertEqual(a['sourceSha256'], hashlib.sha256((HERE / 'source.csv').read_bytes()).hexdigest())
        prior = json.loads((ROOT / a['rows'][0]['priorEvidence']['path']).read_text())
        old = {r['rowIndex']: r for r in prior['rows']}
        q = read('new-quarantine.json')['records']
        byid = {v['quarantineId']: v for v in q}
        self.assertEqual(len(q), 67)
        self.assertEqual(len(byid), 67)
        self.assertEqual(len({r['priorEvidence']['row'] for r in a['rows']}), 68)
        for r in a['rows']:
            self.assertEqual(r['masterCommit'], IPD)
            self.assertEqual(r['exchange'], 'NSE')
            self.assertEqual(r['masterRevision'], a['masterRevision'])
            self.assertEqual(old[r['priorEvidence']['row']]['identityStatus'], r['resolutionStatus'])
            self.assertFalse(r['statusChanged'])
            if r['resolutionStatus'] == 'UNRESOLVED':
                self.assertEqual(r['exactISINRecordCount'], 0)
                self.assertEqual(r['candidateCompanyIds'], [])
                self.assertIsNone(r['matchedSecurityIdentifier'])
                qr = byid[r['newQuarantineId']]
                self.assertEqual(qr['rawIdentifier'], r['source']['ISIN Code'])
                self.assertEqual(qr['identifierType'], 'ISIN')
                self.assertEqual(qr['reason'], 'UNMAPPED_IDENTIFIER')
            else:
                self.assertEqual(r['row'], 41)
                self.assertEqual(r['matchedSecurityIdentifier'], 'EQ_AGI_IN')
                self.assertEqual(r['matchedSecurityName'], 'AGI Greenpac Limited')
                self.assertEqual(r['exactISINRecordCount'], 1)
                self.assertEqual(r['depositPointers'], ['/21'])
                self.assertEqual(len(r['nseListings']), 2)
                self.assertIsNone(r['newQuarantineId'])
        self.assertEqual(sum(r['priorEvidence']['quarantineRecordCount'] for r in a['rows']), 134)
        self.assertEqual(a['operationalActions'], [])

    def test_history_and_scope_preserved(self):
        validation = read('source-validation.json')
        for p in validation['previousEvidence']:
            self.assertEqual(hashlib.sha256((ROOT / p['path']).read_bytes()).hexdigest(), p['sha256'])
            self.assertEqual((ROOT / p['path']).read_bytes(), git('show', BASE + ':' + p['path']))
        for p in [TRACKER, POINTER]:
            self.assertTrue((ROOT / p).read_bytes().startswith(git('show', BASE + ':' + p)))
        changed = set(git('diff', '--name-only', BASE).decode().splitlines())
        allowed = {TRACKER, POINTER, REPORT} | {str(p.relative_to(ROOT)) for p in HERE.iterdir() if p.is_file()}
        self.assertFalse(changed - allowed, changed - allowed)


def verify_remote():
    def api(path):
        return json.loads(subprocess.check_output(['gh', 'api', 'repos/ramkivs/iips-production-market-data/' + path]))
    current = api('commits/main')['sha']
    assert current == IPD, ('IPD main changed; inspect before claiming current', current)
    blobs = {}
    for r in read('master-readbacks.json'):
        x = api('git/blobs/' + r['blob'])
        raw = base64.b64decode(x['content'])
        assert hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest() == r['blob']
        assert hashlib.sha256(raw).hexdigest() == r['sha256']
        blobs[r['path']] = raw
    deposit = json.loads(blobs['evidence/operator_drop/d05_security_master_broad_universe.json'])
    manifest = json.loads(blobs['evidence/operator_drop/d05_security_master_manifest.json'])
    assert hashlib.sha256(blobs['evidence/operator_drop/d05_security_master_broad_universe.json']).hexdigest() == manifest['fileChecksumSha256']
    assert len(deposit) == manifest['recordCount'] == 2250
    asset = blobs['src/identity/d05_broad_universe_data.ts'].decode()
    asset_data = json.JSONDecoder().raw_decode(asset[asset.index('= [') + 2:].lstrip())[0]
    assert asset_data == deposit
    a = read('assessment.json')
    for r in a['rows']:
        exact = [(i, e) for i, e in enumerate(deposit) if e['isin'] == r['source']['ISIN Code']]
        assert len(exact) == r['exactISINRecordCount']
        assert [f'/{i}' for i, e in exact] == r['depositPointers']
        if exact:
            assert len(exact) == 1 and exact[0][1]['companyId'] == r['matchedSecurityIdentifier']
            assert exact[0][1]['companyName'] == r['matchedSecurityName']
            assert any(l['exchange'] == 'NSE' and l['status'] == 'ACTIVE' for l in exact[0][1]['listings'])
    print('PASS remote: current main, nine exact source blobs, manifest/corpus/runtime asset equality and all68 exact-identifier candidate results.')


if __name__ == '__main__':
    if '--remote' in sys.argv:
        verify_remote()
    else:
        unittest.main(verbosity=2)
