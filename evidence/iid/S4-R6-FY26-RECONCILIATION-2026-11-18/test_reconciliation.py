"""New metadata/provenance regressions only; no private data, old tests or census execution."""
import hashlib
import json
from datetime import date
from fractions import Fraction
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def load(name):
    return json.loads((HERE / name).read_text())


class ReconciliationTests(unittest.TestCase):
    def test_actual_record_and_execution_identity(self):
        receipt = load('assessment-verification.json')
        execution = load('execution.json')
        self.assertEqual(execution['ingestExitCode'], 0)
        self.assertTrue(execution['actualExecution'])
        self.assertFalse(execution['allowErrors'])
        self.assertEqual(execution['datasetVersion'], receipt['dataset']['contentDigest'])
        self.assertEqual(receipt['dataset']['operatingMetricRecords'], 1)
        record = receipt['metricVerification']
        for key, expected in [('validation', 'VALID'), ('presence', 'PRESENT'),
                              ('periodEnd', '2026-03-31'), ('scope', 'CONSOLIDATED'),
                              ('unit', 'RATIO'), ('sourceClass', 'OPERATOR_ENTERED')]:
            self.assertEqual(record[key], expected)
        self.assertEqual(record['issues'], [])
        self.assertTrue(record['exactFormulaEquality'])
        self.assertTrue(record['readPortRecordEquality'])
        self.assertFalse(execution['committedDatasetInstalled'])
        self.assertFalse(execution['ownerRuntimeInstallationVerified'])

    def test_actual_methods_not_coverage_unlock(self):
        r = load('assessment-verification.json')
        kec = next(a for a in r['assessments'] if a['sector'] == 'Industrials')
        info = next(a for a in r['assessments'] if a['sector'] == 'Technology')
        for a in [kec, info]:
            self.assertFalse(a['method']['applicable'])
            self.assertFalse(a['method']['outputPresent'])
            self.assertEqual(a['invariantViolations'], 0)
            self.assertEqual(a['datasetVersion'], r['dataset']['datasetVersion'])
        self.assertEqual(kec['method']['notApplicableReason'],
                         'CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable')
        self.assertEqual(kec['capitalStructure']['currentInvestmentsPresence'], 'MISSING')
        self.assertEqual(kec['capitalStructure']['netDebtPresence'], 'MISSING')
        self.assertEqual(kec['capitalStructure']['netDebtReason'], 'NOT_REPORTED')
        self.assertEqual(info['method']['notApplicableReason'],
                         'MANDATORY_METRIC_MISSING: TM_NRR, TM_RECURRING_REVENUE_PCT')
        self.assertEqual(info['metricIds'], [])
        coverage = {s['sector']: s for s in r['liveCoverage']}
        self.assertEqual(coverage['Industrials']['state'], 'AVAILABLE')
        self.assertEqual(coverage['Technology']['state'], 'WITHHELD')

    def test_freshness_paths_and_dates(self):
        r = load('assessment-verification.json')
        age = (date(2026, 11, 18) - date(2026, 3, 31)).days
        self.assertEqual(age, 232)
        self.assertEqual((date(2026, 11, 18) - date(2026, 8, 7)).days, 103)
        field = r['fieldQualification']
        self.assertEqual((field['field'], field['freshnessKind'], field['outcome']),
                         ('bookToBill', 'PNL', 'STALE'))
        self.assertEqual(field['codes'], ['FIELD_STALE'])
        self.assertFalse(field['engineScoringExecuted'])
        for a in r['assessments']:
            self.assertEqual(a['freshness']['status'], 'STALE')
            self.assertIn('STALE_DATA', a['confidence']['caps'])
            self.assertEqual(a['asOf']['stalenessDays'], 232 if a['sector'] == 'Industrials' else 962)
        policy = (ROOT / 'iips-platform/src/investment/assessment/confidence.ts').read_text()
        self.assertIn('combined *= 0.9;', policy)

    def test_source_binding_hash_types(self):
        b = load('source-binding.json')
        source = ROOT / 'evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/source'
        original = json.loads((source / 'source-bytes.json').read_text())
        self.assertEqual(b['denominatorSourceSha256'], original['documents']['kec-ar-2025-26']['sha256'])
        page = source / 'fy26-consolidated-balance-sheet-and-profit-and-loss-pdf-page117.txt'
        self.assertEqual(b['denominatorPageTextSha256'], hashlib.sha256(page.read_bytes()).hexdigest())
        self.assertNotEqual(b['denominatorSourceSha256'], b['denominatorPageTextSha256'])
        self.assertIn('31-march-2026', b['intakeUrl'])
        ratio = Fraction(25280) / Fraction('23505.54')
        self.assertEqual(ratio, Fraction(1264000, 1175277))
        self.assertTrue(Fraction(1) <= ratio < Fraction('1.1'))
        self.assertEqual(round(float(ratio), 2), 1.08)

    def test_original_matrix_reused_and_overlay_scoped(self):
        o = load('requirement-matrix-update.json')
        original_path = ROOT / o['originalMatrix']
        self.assertEqual(hashlib.sha256(original_path.read_bytes()).hexdigest(), o['originalMatrixSha256'])
        original = json.loads(original_path.read_text())
        self.assertEqual((o['census']['metricGatedSlots'], o['census']['totalSlots']), (14, 38))
        self.assertFalse(o['census']['newSlotDiscovered'])
        self.assertEqual(len(o['slots']), len(original['slots']))
        for i, (current, prior) in enumerate(zip(o['slots'], original['slots'])):
            for key in ['sector', 'methodId', 'declaredMetrics']:
                self.assertEqual(current[key], prior[key])
            self.assertTrue(current['definitionsRef'].endswith(f'#/slots/{i}/metricDefinitions'))
        unmeasured = [s for s in o['slots'] if s.get('state') == 'UNMEASURED']
        self.assertEqual(len(unmeasured), 12)
        self.assertTrue(all(s['reason'] == 'NO_DATA_FOR_SECTOR' for s in unmeasured))
        self.assertFalse(o['numericClosureSatisfied'])
        self.assertEqual(o['acceptedLimitationOwnerDecision'], 'OUTSTANDING')
        self.assertEqual((o['S4-R6'], o['G-4']), ('OPEN', 'OPEN'))

    def test_infosys_period_not_relabelled(self):
        lookup = load('infosys-bundle-lookup.json')
        self.assertEqual(lookup['FY26matches'], [])
        self.assertTrue(lookup['InfosysBundlePeriods'])
        for b in lookup['InfosysBundlePeriods']:
            self.assertEqual(b['latestPeriodEnd'], '2024-03-31')
        info = next(a for a in load('assessment-verification.json')['assessments'] if a['sector'] == 'Technology')
        self.assertEqual(info['asOf']['dataAsOf'], '2024-03-31')
        slot = load('requirement-matrix-update.json')['slots'][0]
        self.assertFalse(slot['FY26DatasetAvailable'])
        self.assertEqual(set(slot['evidenceDisposition'].values()), {'NOT_REPORTED'})

    def test_preserved_historical_files_and_original_inputs(self):
        for record in load('preservation.json')['files']:
            with self.subTest(path=record['path']):
                self.assertEqual(hashlib.sha256((ROOT / record['path']).read_bytes()).hexdigest(), record['sha256'])
        for pair in load('execution.json')['inputCopyVerification']:
            self.assertTrue(pair['byteEqual'])
            self.assertEqual(hashlib.sha256((ROOT / pair['original']).read_bytes()).hexdigest(), pair['sha256'])

    def test_publication_scope_and_closure_text(self):
        prohibited = {'.pdf', '.csv'}
        self.assertFalse(any(p.suffix in prohibited for p in HERE.rglob('*') if p.is_file()))
        r = load('assessment-verification.json')
        self.assertNotIn('value', r['metricVerification'])
        for a in r['assessments']:
            self.assertNotIn('payload', a)
            self.assertNotIn('output', a['method'])
        report = (ROOT / 'docs/integration/IID-S4-R6-FY26-RECONCILIATION-2026-11-18.md').read_text()
        for text in ['S4-R6 OPEN', 'G-4 OPEN', 'not a certified exhaustive absence search',
                     'FIELD_STALE', 'CAPITAL_STRUCTURE_INCOMPLETE', 'twelve unchanged unmeasured',
                     'Application-owner decision: OUTSTANDING']:
            self.assertIn(text, report)
        tracker = (ROOT / 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md').read_text()
        self.assertEqual(tracker.count('## 16.304 '), 1)
        self.assertIn('`V2230`–`V2233`', tracker)


if __name__ == '__main__':
    unittest.main()
