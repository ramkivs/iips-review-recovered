"""New adoption regressions; no original census/probes/tests or private sources required."""
from decimal import Decimal as D
import hashlib
import json
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def load(name):
    return json.loads((HERE / name).read_text())


class AdoptionTests(unittest.TestCase):
    def test_complete_supplied_payload_attributed_and_retained(self):
        for binding in load('audit-binding.json')['boundEvidence']:
            self.assertEqual(hashlib.sha256((ROOT / binding['path']).read_bytes()).hexdigest(), binding['sha256'])
        p = load('supplied-infosys-payload.json')
        self.assertEqual(p['audit_metadata']['review_completeness'], 'EXHAUSTIVE_FULL_FILING_REVIEW')
        self.assertEqual(p['audit_metadata']['supersedes_anchor'], 'FY24')
        self.assertEqual([len(s['sections_verified']) for s in p['audit_metadata']['sources_audited']], [4, 4])
        self.assertEqual(p['audit_metadata']['sources_audited'][1]['sec_accession'], '0001193125-26-270520')
        self.assertFalse(load('source-review.json')['infosysExhaustiveFullFilingReviewIndependentlyEstablished'])
        for d in p['dispositions']:
            self.assertIsNone(d['numeric_value'])
            self.assertEqual((d['disposition'], d['iid_status'], d['method_gate_status']),
                             ('NOT_REPORTED', 'UNAVAILABLE', 'WITHHELD'))
        mapping = (HERE / 'supplied-review-and-mapping.md').read_text()
        for term in ['Item3.D', 'Item4', 'Item5', 'Item18', '443', '55%', '14.9',
                     '1,78,650', '20,158', '19,277', '500209', '0001067491',
                     'value-creation-model.pdf', 'IFRS15/IndAS115', 'EXHAUSTIVE']:
            self.assertIn(term, mapping)

    def test_actual_cli_readback_and_selection_not_proposed_record(self):
        e, r = load('execution.json'), load('assessment-verification.json')
        self.assertEqual(e['cliExitCode'], 0)
        self.assertFalse(e['allowErrors'])
        self.assertTrue(e['historicalInfosysCsvRowsStructurallyEqual'])
        self.assertTrue(r['canonicalReadBackDigestVerified'])
        self.assertTrue(r['historicalFY24Present'])
        self.assertEqual(r['infosysActiveAnnualAnchor'], '2026-03-31')
        self.assertEqual(r['dataset']['datasetVersion'], e['datasetVersion'])
        self.assertEqual(r['dataset']['contentDigest'], e['datasetVersion'])
        self.assertEqual(r['dataset']['coverage']['annualPeriods'], 10)
        self.assertEqual(r['dataset']['coverage']['operatingMetricRecords'], 3)
        self.assertFalse(r['ownerRuntimeInstalled'])
        self.assertFalse(r['committedFullDataset'])
        info = r['assessments'][0]
        self.assertEqual(info['asOf']['dataAsOf'], '2026-03-31')
        self.assertIn('2024-03-31', [p['periodEnd'] for p in info['selectedAnnualPeriods']])

    def test_both_missing_metrics_are_null_not_valid_zero(self):
        metrics = load('assessment-verification.json')['assessments'][0]['metrics']
        self.assertEqual({m['metricId'] for m in metrics}, {'TM_NRR', 'TM_RECURRING_REVENUE_PCT'})
        for m in metrics:
            self.assertEqual(m['periodEnd'], '2026-03-31')
            self.assertEqual(m['presence'], 'MISSING')
            self.assertEqual(m['reason'], 'NOT_REPORTED')
            self.assertIsNone(m['numericValue'])
            self.assertEqual(m['validation'], 'UNVALIDATED')
            self.assertEqual(m['issues'], ['MISSING_VALUE'])
            self.assertEqual(m['disposition'], 'UNAVAILABLE')

    def test_actual_methods_qualification_and_invariants(self):
        r = load('assessment-verification.json')
        for a in r['assessments']:
            self.assertEqual(a['invariantViolations'], 0)
            self.assertEqual(a['certifiedEngineQualification']['state'], 'NOT_QUALIFIED')
            ev = next(m for m in a['methods'] if m['methodId'] == 'EV_REVENUE')
            self.assertFalse(ev['applicable'])
            self.assertFalse(ev['outputPresent'])
            self.assertEqual(ev['reason'], 'MANDATORY_METRIC_MISSING: TM_NRR, TM_RECURRING_REVENUE_PCT'
                             if a['sector'] == 'Technology' else 'CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable')
        self.assertFalse(r['engineScoringExecuted'])

    def test_no_silent_FY24_component_relabelling(self):
        info = load('assessment-verification.json')['assessments'][0]
        capital = info['capitalStructure']
        self.assertEqual(capital['grossDebtReason'], 'PERIOD_MISMATCH')
        self.assertEqual(capital['netDebtReason'], 'PERIOD_MISMATCH')
        for key in ['shortTermBorrowings', 'longTermBorrowings', 'currentMaturities', 'preferenceCapital']:
            self.assertEqual(capital['components'][key]['periodEnd'], '2024-03-31')
        self.assertEqual(capital['components']['leaseLiabilities']['periodEnd'], '2026-03-31')
        report = (ROOT / 'docs/integration/IID-S4-R6-FY26-ADOPTION-2026-11-18.md').read_text()
        self.assertIn('Legacy references still remain', report)

    def test_kec_components_and_no_double_count_or_residual_guess(self):
        k = load('kec-components.json')
        self.assertEqual(D('4441.86') - D('235.60'), D('4206.26'))
        self.assertEqual(D('4206.26') + D('235.60') + D('661.37'), D(k['verifiedBorrowingsExcludingLeases']))
        self.assertEqual(D('220.60') + D('53.93'), D(k['verifiedLeases']))
        self.assertEqual(D(k['verifiedBorrowingsExcludingLeases']) + D(k['verifiedLeases']), D(k['contractGrossDebt']))
        self.assertNotEqual(k['suppliedInclusiveDebt'], k['contractGrossDebt'])
        self.assertEqual(D('5103.20') - D('411.30'), D(k['suppliedNetDebtExcludingAcceptances']))
        self.assertEqual(D('6722') - D('4691.90'), D('2030.10'))
        self.assertNotEqual(D('2030.10'), D('2120.74'))
        self.assertEqual(D('4601') + D('2121'), D('6722'))
        self.assertEqual(D('5103.23') - D('411.26') + D('2120.74') - D('6722'), D('90.71'))
        for flag in ['cashCompositionFullyVerified', 'buyerCreditOverlapVerified',
                     'managementCompleteDefinitionVerified', 'newCapitalCandidateAdmitted']:
            self.assertFalse(k[flag])
        actual = load('assessment-verification.json')['assessments'][1]['capitalStructure']
        self.assertEqual(actual['grossDebtPresence'], 'PRESENT')
        self.assertEqual(actual['netDebtPresence'], 'MISSING')
        self.assertEqual(actual['components']['currentInvestments']['presence'], 'MISSING')
        self.assertTrue(load('execution.json')['kecStatementInputByteUnchanged'])

    def test_freshness_is_field_specific_and_confidence_is_actual(self):
        r = load('assessment-verification.json')
        self.assertFalse(r['publicationDateAnchorUsed'])
        self.assertFalse(r['freshnessOverrideUsed'])
        for a in r['assessments']:
            self.assertEqual(a['asOf']['stalenessDays'], 232)
            self.assertIn('STALE_DATA', a['confidence']['caps'])
            for f in a['fieldQualification']:
                if f['field'] == 'debtEbitda':
                    self.assertEqual((f['freshnessKind'], f['limitDays'], f['outcome']), ('BALANCE_SHEET', 250, 'RESOLVED'))
                else:
                    self.assertEqual((f['freshnessKind'], f['limitDays'], f['outcome']), ('PNL', 200, 'STALE'))
                    self.assertEqual(f['codes'], ['FIELD_STALE'])
        self.assertEqual(r['assessments'][0]['confidence']['combined'], 0.4932)
        self.assertEqual(r['assessments'][1]['confidence']['combined'], 0.3199)

    def test_original_census_and_twelve_slots_unchanged(self):
        o = load('requirement-matrix-update.json')
        p = ROOT / o['originalMatrix']
        self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(), o['originalMatrixSha256'])
        self.assertEqual((o['census']['metricGatedSlots'], o['census']['totalSlots']), (14, 38))
        self.assertFalse(o['census']['newSlotDiscovered'])
        self.assertEqual(len([s for s in o['slots'] if s.get('state') == 'UNMEASURED']), 12)
        self.assertEqual(o['slots'][0]['localMissingMetricRecords'], 2)
        self.assertEqual(o['slots'][0]['localNumericRecords'], 0)
        self.assertFalse(o['numericClosureSatisfied'])
        self.assertEqual((o['S4-R6'], o['G-4']), ('OPEN', 'OPEN'))
        self.assertEqual(o['acceptedLimitationOwnerDecision'], 'OUTSTANDING')

    def test_preservation_and_publication_boundary(self):
        for f in load('preservation.json')['files']:
            with self.subTest(path=f['path']):
                self.assertEqual(hashlib.sha256((ROOT / f['path']).read_bytes()).hexdigest(), f['sha256'])
        self.assertFalse(any(p.suffix in {'.csv', '.pdf'} for p in HERE.rglob('*')))
        for a in load('assessment-verification.json')['assessments']:
            self.assertNotIn('payload', a)
            for m in a['methods']:
                self.assertNotIn('output', m)


if __name__ == '__main__':
    unittest.main()
