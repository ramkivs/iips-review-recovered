"""B-06 standard-library validation. --remote repeats pinned source/corpus readback."""
import base64
import csv
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
B04 = HERE.parent / 'b04-dhan-isin-nse-2026-11-06'
BASE = '0a0aac2bba517be933dae7a91a89af2943996b51'
IPD = '943309e4e84614bb8edc8d5631cd0292c7716807'
WAVE = 'BATCH-D05-TIER2-BROAD-UNIVERSE-WAVE2-DISPOSITION-2026-11-06-001'
TRACKER = 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
REPORT = 'docs/integration/B06-DHAN-68-WAVE2-REASSESSMENT-2026-11-06.md'

def load(name):
    return json.loads((HERE / name).read_text())

def sha(data):
    return hashlib.sha256(data).hexdigest()

def disposition_guard(m):
    assert m['batchId'] == WAVE
    assert m['kind'] == 'DISPOSITION_ONLY__NO_DEPOSITION__CORPUS_BYTE_IDENTICAL'
    assert m['incorporated'] == 0 and m['unresolved'] == 67
    assert m['recordCount'] == 2250 and m['corpusByteIdentical'] is True
    assert m['priorRevisionBatchId'] != m['batchId']

class Tests(unittest.TestCase):
    def test_source_and_revision_bindings(self):
        spec = importlib.util.spec_from_file_location('b04_validation', B04 / 'validate_b04.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        rows = module.parse((B04 / 'source.csv').read_text())
        a = load('assessment.json'); m = load('b05-manifest.json')
        disposition_guard(m)
        self.assertEqual([r['source'] for r in a['rows']], rows)
        self.assertEqual(a['sourceSha256'], sha((B04 / 'source.csv').read_bytes()))
        self.assertEqual(m['source']['sourceSha256'], a['sourceSha256'])
        self.assertEqual(m['source']['assessmentSha256'], sha((B04 / 'assessment.json').read_bytes()))
        self.assertEqual(m['dispositionReportSha256'], sha((HERE / 'b05-disposition.json').read_bytes()))
        self.assertEqual(a['wave2DispositionRevision'], WAVE)
        self.assertEqual(a['corpusRevision']['batchId'], m['priorRevisionBatchId'])
        self.assertEqual(a['corpusRevision']['fileChecksumSha256'], m['fileChecksumSha256'])
        self.assertEqual(a['counts'], dict(rows=68, columns=9, resolved=1, unresolved=67, ambiguous=0, statusChangesFromB04=0))

    def test_all_rows_and_quarantine_crosswalk(self):
        a = load('assessment.json'); prior = json.loads((B04 / 'assessment.json').read_text())
        w = load('b05-disposition.json'); wby = {r['isin']: r for r in w['rows']}
        oldq = {q['quarantineId']: q for q in json.loads((B04 / 'new-quarantine.json').read_text())['records']}
        newq = {q['quarantineId']: q for q in load('new-quarantine.json')['records']}
        self.assertEqual(len(wby), 67); self.assertEqual(len(oldq), 67); self.assertEqual(len(newq), 67)
        for r, old in zip(a['rows'], prior['rows']):
            self.assertEqual(r['source'], old['source']); self.assertEqual(r['exchange'], 'NSE')
            self.assertEqual(r['resolutionStatus'], old['resolutionStatus']); self.assertFalse(r['statusChangedFromB04'])
            self.assertEqual(r['corpusRevision'], a['corpusRevision'])
            self.assertEqual(r['masterCommit'], IPD); self.assertEqual(r['wave2DispositionRevision'], WAVE)
            isin = r['source']['ISIN Code']
            if isin == 'INE415A01038':
                self.assertEqual(r['matchedSecurityIdentifier'], 'EQ_AGI_IN')
                self.assertEqual(r['matchedSecurityName'], 'AGI Greenpac Limited')
                self.assertEqual(r['resolutionStatus'], 'RESOLVED'); self.assertEqual(r['exactISINRecordCount'], 1)
                self.assertEqual(r['b05']['disposition'], 'EXCLUDED_ALREADY_RESOLVED_AGI')
                self.assertNotIn(isin, wby); self.assertIsNone(r['newB06QuarantineId'])
                self.assertTrue(r['activeNSEListings'])
            else:
                self.assertEqual(r['exactISINRecordCount'], 0); self.assertIsNone(r['matchedSecurityIdentifier'])
                self.assertEqual(wby[isin]['disposition'], 'UNRESOLVED'); self.assertFalse(wby[isin]['incorporated'])
                self.assertEqual(r['b05']['quarantineId'], old['newQuarantineId'])
                self.assertEqual(wby[isin]['b04NewQuarantineId'], old['newQuarantineId'])
                self.assertEqual(r['b05']['missingAuthoritativeEvidence'], wby[isin]['missingAuthoritativeEvidence'])
                self.assertEqual(oldq[old['newQuarantineId']]['rawIdentifier'], isin)
                self.assertEqual(newq[r['newB06QuarantineId']]['rawIdentifier'], isin)
                self.assertEqual(newq[r['newB06QuarantineId']]['reason'], 'UNMAPPED_IDENTIFIER')

    def test_disposition_cannot_be_expansion(self):
        m = load('b05-manifest.json'); m['incorporated'] = 67
        with self.assertRaises(AssertionError): disposition_guard(m)
        m = load('b05-manifest.json'); m['kind'] = 'DEPOSITION'
        with self.assertRaises(AssertionError): disposition_guard(m)

    def test_o02_stays_outstanding(self):
        r = load('outstanding-register.json')
        self.assertEqual(r, load('assessment.json')['outstandingRegister'])
        self.assertEqual(r[0]['id'], 'O-02')
        self.assertEqual(r[0]['status'], 'OUTSTANDING / NOT COMPLETED BY B-06')
        for token in ['#131', '#132', '#491/R2 §28']:
            self.assertIn(token, r[0]['action'])

    def test_history_and_scope_preserved(self):
        v = load('verification.json')
        for r in v['B04RemoteReadbacks']:
            raw = (ROOT / r['path']).read_bytes()
            self.assertEqual(sha(raw), r['sha256'])
            self.assertEqual(raw, subprocess.check_output(['git', 'show', BASE + ':' + r['path']], cwd=ROOT))
        self.assertTrue((ROOT / TRACKER).read_bytes().startswith(subprocess.check_output(['git', 'show', BASE + ':' + TRACKER], cwd=ROOT)))
        changed = set(subprocess.check_output(['git', 'diff', '--name-only', BASE], cwd=ROOT, text=True).splitlines())
        allowed = {TRACKER, REPORT} | {str(p.relative_to(ROOT)) for p in HERE.iterdir() if p.is_file()}
        self.assertFalse(changed - allowed, changed - allowed)
        self.assertEqual(load('assessment.json')['operationalActions'], [])

def remote():
    def api(p):
        return json.loads(subprocess.check_output(['gh', 'api', 'repos/ramkivs/iips-production-market-data/' + p]))
    assert api('commits/main')['sha'] == IPD, 'IPD main moved; inspect before current claim'
    data = {}
    for r in load('master-readbacks.json'):
        b = base64.b64decode(api('git/blobs/' + r['blob'])['content'])
        assert hashlib.sha1(b'blob ' + str(len(b)).encode() + b'\0' + b).hexdigest() == r['blob']
        assert sha(b) == r['sha256']; data[r['path']] = b
    corpus = json.loads(data['evidence/operator_drop/d05_security_master_broad_universe.json'])
    m = load('b05-manifest.json'); disposition_guard(m)
    assert len(corpus) == 2250 and sha(data[m['corpusPath']]) == m['fileChecksumSha256']
    assert data['evidence/operator_drop/d05_security_master_wave2_disposition_manifest.json'] == (HERE / 'b05-manifest.json').read_bytes()
    assert data[m['dispositionReportPath']] == (HERE / 'b05-disposition.json').read_bytes()
    assert data[m['source']['sourceCsvPath']] == (B04 / 'source.csv').read_bytes()
    assert data[m['source']['assessmentJsonPath']] == (B04 / 'assessment.json').read_bytes()
    text = data['src/identity/d05_broad_universe_data.ts'].decode()
    assert json.JSONDecoder().raw_decode(text[text.index('= [')+2:].lstrip())[0] == corpus
    for r in load('assessment.json')['rows']:
        exact = [e for e in corpus if e['isin'] == r['source']['ISIN Code']]
        assert len(exact) == r['exactISINRecordCount']
        if exact: assert exact[0]['companyId'] == r['matchedSecurityIdentifier']
    print('PASS remote: current main,13 pinned blobs,byte-identical corpus,B-05 bindings and all68 exact candidate counts.')

if __name__ == '__main__':
    if '--remote' in sys.argv: remote()
    else: unittest.main(verbosity=2)
