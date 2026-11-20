"""Targeted statutory-extract reconciliation and actual-runtime receipt checks; no source download."""
import hashlib
import json
import unittest
from decimal import Decimal as D
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
EXPECTED = 'sha256:a62f95f81a923e72fb6b4e0220bb8852d08191d14e94b1997a12bbfe8d4a0daf'


class StatutoryReconciliation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = json.loads((HERE / 'statutory-source-review.json').read_text())
        cls.actual = json.loads((HERE / 'statutory-assessment-verification.json').read_text())

    def row(self, item):
        return next(r for r in self.source['rows'] if r['item'] == item)

    def test_source_boundary_and_pages_are_explicit(self):
        self.assertEqual(self.source['source']['sha256'], '5b1c7244fdbc22182e42b174b2d726b0897a2cd8ad58ef8a2dd7f48f4aeafd0e')
        self.assertEqual(sorted(p['pdfPage'] for p in self.source['source']['pages']), [126, 131, 134, 135, 136, 137, 138, 144, 145, 146, 147])
        self.assertIn('Original PDF/rendered pages not supplied', self.source['source']['verification'])
        self.assertEqual(len(self.source['rows']), 41)
        self.assertEqual(self.row('Non-interest-bearing supplier finance within trade payables')['FY25'], 'NOT_PROVIDED_TRANSITIONAL_RELIEF')

    def test_borrowings_interest_and_leases_not_silent_current_allocation(self):
        self.assertEqual(self.row('Current borrowings')['FY26'], '4441.86')
        self.assertEqual(D('103.12') + D('793.85') - D('235.60'), D('661.37'))
        for principal, interest, leases, debt in [('5103.23', '9.91', '274.53', '5387.67'), ('3701.10', '5.56', '256.38', '3963.04')]:
            self.assertEqual(D(principal) + D(interest) + D(leases), D(debt))
        self.assertEqual(D('661.37') + D('4441.86'), D('5103.23'))
        self.assertIn('Current borrowings4451.77', self.source['rejectedPriorSummaryAssertions'])

    def test_acceptance_regrouping_not_future_interest_plug(self):
        for principal, accrued, maturity, other, remainder in [('2120.74', '6.22', '2126.96', '115.68', '99.55'), ('1507.27', '8.01', '1515.28', '97.28', '83.71')]:
            self.assertEqual(D(principal) + D(accrued), D(maturity))
            borrowing_interest = D('9.91') if principal == '2120.74' else D('5.56')
            self.assertEqual(D(other) - borrowing_interest - D(accrued), D(remainder))
        self.assertEqual(self.row('Interest accrued on trade acceptances')['note'], '34(b)')
        self.assertEqual(self.source['determinations']['acceptanceDifference'], 'RESOLVED_BY_NOTE34_B_6.22')

    def test_buyer_credit_and_supplier_finance_not_added_twice(self):
        self.assertEqual(D('552.89') + D('44.65'), D('597.54'))
        self.assertEqual(D('493.75') + D('51.91') + D('32.43') + D('1.31'), D('579.40'))
        self.assertEqual(self.row('Saudi jointly-controlled-operation buyer credit')['FY26'], '44.65')
        self.assertIn('Subset of Note32', self.row('Non-interest-bearing supplier finance within trade payables')['treatment'])
        self.assertEqual(self.source['determinations']['newCanonicalNumericAdmissions'], 0)

    def test_note53_numerical_bridge_not_cash_offset_policy_inference(self):
        self.assertEqual(D('5387.67') - D('411.26'), D('4976.41'))
        self.assertEqual(D('3963.04') - D('545.69'), D('3417.35'))
        self.assertEqual(D('4976.41') - D('100.67'), D('4875.74'))
        self.assertEqual(round(D('4976.41') / D('6159.69'), 2), D('.81'))
        self.assertTrue(self.source['determinations']['note53NarrativeTableDifference'].startswith('UNRESOLVED'))
        self.assertEqual(D('4976.41') - D('274.53') - D('100.67') + D('2120.74'), D('6721.95'))
        self.assertEqual(self.source['determinations']['managementBridge'], 'ARITHMETIC_COMPATIBILITY_NOT_VERIFIED_MANAGEMENT_DEFINITION')

    def test_cash_and_other_assets_are_not_residual_cash(self):
        self.assertEqual(D('3.06') + D('3.20') + D('94.41'), D('100.67'))
        self.assertEqual(sum(map(D, ['107.53', '7.59', '1.25', '104.19', '56.34'])), D('276.90'))
        self.assertEqual(D('63.60') - D('7.26'), D('56.34'))
        self.assertEqual(D('411.26') - D('306.35') - D('92.89') - D('10.82'), D('1.20'))
        self.assertEqual(self.source['determinations']['currentInvestments'], 'MISSING_NOT_REPORTED_NULL_UNCHANGED')
        self.assertTrue(self.source['determinations']['note17ExtractArithmetic'].startswith('UNRESOLVED'))

    def test_undiscounted_maturities_are_not_carrying_amounts(self):
        self.assertEqual(D('4505.53') + D('661.44') + D('126'), D('5292.97'))
        self.assertNotEqual(D('5292.97'), D('5113.14'))
        self.assertNotEqual(D('455.72'), D('274.53'))
        self.assertEqual(self.row('Borrowing contractual undiscounted maturity total')['FY26'], '5292.97')

    def test_exact_recovery_read_only_and_actual_method_outcomes(self):
        r = json.loads((HERE / 'statutory-recovery.json').read_text())
        self.assertEqual(r['restoredDigest'], EXPECTED)
        self.assertFalse(r['btbCsvIngestion'])
        self.assertFalse(r['privateCombinedSnapshotReplaced'])
        self.assertEqual(self.actual['digestBefore'], EXPECTED)
        self.assertEqual(self.actual['digestAfter'], EXPECTED)
        self.assertTrue(self.actual['datasetFilesUnchanged'])
        self.assertTrue(self.actual['priorRuntimeResultsEqual'])
        for run, days in zip(self.actual['runs'], [231, 232]):
            self.assertEqual(run['asOf']['stalenessDays'], days)
            self.assertEqual(run['capital']['netDebtPresence'], 'MISSING')
            self.assertEqual(run['capital']['currentInvestments'], dict(value=None, presence='MISSING', reason='NOT_REPORTED'))
            self.assertEqual(run['fieldQualification'][0]['codes'], ['FIELD_STALE'])
            self.assertEqual(run['fieldQualification'][0]['limitDays'], 200)
            self.assertEqual(run['fieldQualification'][1]['limitDays'], 250)
            self.assertEqual(run['certifiedQualification'][0]['state'], 'NOT_QUALIFIED')
            self.assertEqual(run['certifiedQualification'][0]['requiredResolved'], 1)
            self.assertEqual(run['confidence']['combined'], .3199)
            self.assertEqual(run['invariantViolations'], 0)
            for m in run['methods']:
                if m['methodId'] in ['EV_REVENUE', 'EV_EBITDA']:
                    self.assertFalse(m['applicable'])
                    self.assertFalse(m['outputPresent'])
                    self.assertEqual(m['reason'], 'CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable')

    def test_existing_population_findings_and_implementation_preserved(self):
        p = json.loads((HERE / 'statutory-preservation.json').read_text())
        for f in p['unchangedFiles']:
            self.assertEqual(hashlib.sha256((ROOT / f['path']).read_bytes()).hexdigest(), f['sha256'], f['path'])
        self.assertEqual(self.source['closure'], dict(**{'S4-R6': 'OPEN', 'G-4': 'OPEN'}, ownerDecisionMade=False, numericClosureMet=False))

    def test_private_upload_matches_reviewed_source_when_present(self):
        # Intentional private-source boundary: public CI can test all metadata without the source text.
        p = ROOT / 'LOCAL-ONLY-DO-NOT-PUBLISH/kec-statutory/KEC_Consolidated_Notes_Verified_Extract.txt'
        if not p.exists():
            self.skipTest('Private source not redistributed; local verification required')
        self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(), self.source['source']['sha256'])
        s = p.read_text()
        for line in ['(a) Interest accrued but not due on borrowings 9.91 5.56', '(b) Interest accrued on trade acceptances 6.22 8.01', 'Debt * A 5,387.67 3,963.04', 'Net debt (C ) C=A+B 4,976.41 3,417.35', 'Trade acceptances 2,126.96 - - - 2,126.96 2,126.96']:
            self.assertIn(line, s)


if __name__ == '__main__':
    unittest.main()
