"""Focused evidence regressions. No network, new census or economic-data admission."""
import hashlib
import json
from decimal import Decimal as D
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]


class KecReconciliation(unittest.TestCase):
    def setUp(self):
        self.r = json.loads((HERE / 'reconciliation.json').read_text())
        self.v = json.loads((HERE / 'assessment-verification.json').read_text())

    def test_supplied_candidates_preserved_not_admitted(self):
        self.assertEqual(self.r['supplied'], dict(debtDescribedIncludingLeases='5103.20', cashlike='411.30', candidateNetDebt='4691.90', managementIncludingAcceptances='6722'))
        self.assertFalse(self.r['newCapitalAdmission'])
        self.assertEqual(D('5103.20') - D('411.30'), D('4691.90'))

    def test_no_duplicate_maturities_or_leases(self):
        self.assertEqual(sum(map(D, ['2538.96', '100', '597.54', '525', '444.76'])), D('4206.26'))
        self.assertEqual(D('4206.26') + D('235.60'), D('4441.86'))
        self.assertEqual(sum(map(D, ['4206.26', '235.60', '661.37', '274.53'])), D(self.r['audited']['grossDebtContract']))

    def test_source_versions_not_material_adjustment(self):
        a = self.r['audited']
        self.assertEqual(D(a['acceptancesAnnual']) - D(a['acceptancesMayResults']), D('.01'))
        self.assertEqual(round(D(a['acceptancesAnnual'])), 2121)
        self.assertEqual(round(D(a['acceptancesMayResults'])), 2121)
        self.assertFalse(self.r['fullManagementDefinitionVerified'])
        self.assertFalse(self.r['buyerCreditOverlapVerified'])

    def test_restrictions_and_unknowns(self):
        a = self.r['audited']
        self.assertEqual(sum(map(D, [a['unpaidDividendsBank'], a['deposits3To12Months'], a['marginSecurityBank']])), D(a['otherBankBalances']))
        self.assertIsNone(a['currentInvestments'])
        self.assertEqual(a['currentInvestmentsReason'], 'NOT_REPORTED')
        self.assertEqual(D('411.26') - sum(map(D, ['306.35', '92.89', '10.82'])), D('1.20'))

    def test_arithmetic_compatibility_is_not_definition(self):
        d = self.r['diagnosticsNotAdmissions']
        self.assertEqual(D('5113.14') - D('5103.23'), D(d['interestClassificationDifference']))
        self.assertEqual(D('5113.14') - D('411.26') - D('100.67'), D(d['interestInclusiveBorrowingsLessCCEAndOtherBanks']))
        self.assertEqual(D('4601.21') + D('2120.74'), D(d['abovePlusAnnualAcceptances']))
        self.assertEqual(D('6721.95') - D('6722'), D(d['aboveVsRoundedManagementTotal']))
        self.assertEqual(D('6722') - D('4691.90'), D('2030.10'))
        self.assertEqual(D('2120.74') - D('2030.10'), D('90.64'))

    def test_ebitda_definition_and_btb(self):
        self.assertEqual(D('789.14') + D('663.60') + D('197.38'), D(self.r['iidEbitda']))
        self.assertEqual(D('1658.57') + D('50.33') - D('58.78'), D(self.r['iidEbitda']))
        ratio = D('25280') / D('23505.54')
        self.assertTrue(D(1) <= ratio < D('1.1'))
        self.assertEqual(round(ratio, 2), D('1.08'))

    def test_actual_assessment_and_freshness_are_separate(self):
        self.assertTrue(self.v['readBackDigestVerified'])
        self.assertEqual(self.v['datasetVersion'], self.v['contentDigest'])
        self.assertEqual(self.v['canonicalMetric']['validation'], 'VALID')
        self.assertTrue(self.v['isolatedReplay'])
        self.assertEqual(self.v['newEconomicObservations'], 0)
        for r, days in zip(self.v['runs'], [231, 232]):
            self.assertEqual(r['asOf']['stalenessDays'], days)
            self.assertEqual(r['fieldQualification'][0]['codes'], ['FIELD_STALE'])
            self.assertEqual(r['fieldQualification'][0]['limitDays'], 200)
            self.assertEqual(r['fieldQualification'][1]['limitDays'], 250)
            self.assertEqual(r['certifiedQualification'][0]['state'], 'NOT_QUALIFIED')
            self.assertEqual(r['certifiedQualification'][0]['requiredResolved'], 1)
            self.assertEqual(r['capital']['netDebtPresence'], 'MISSING')
            self.assertEqual(r['invariantViolations'], 0)
            for method in r['methods']:
                if method['methodId'] in ['EV_REVENUE', 'EV_EBITDA']:
                    self.assertFalse(method['applicable'])
                    self.assertFalse(method['outputPresent'])
                    self.assertEqual(method['reason'], 'CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable')

    def test_existing_evidence_and_population_untouched(self):
        preservation = json.loads((HERE / 'preservation.json').read_text())
        for f in preservation['unchangedFiles']:
            self.assertEqual(hashlib.sha256((ROOT / f['path']).read_bytes()).hexdigest(), f['sha256'], f['path'])
        matrix = ROOT / 'evidence/real-issuer/S4-R6-OPERATING-METRICS-2026-11-18/runs/metric-requirement-matrix.json'
        self.assertEqual(hashlib.sha256(matrix.read_bytes()).hexdigest(), '49ba845c83cc6a2f0fc82a01fcc1a30e6d34de7ad4f06291cd37f782d82b1d62')
        self.assertEqual(self.r['S4-R6'], 'OPEN')
        self.assertEqual(self.r['G-4'], 'OPEN')


if __name__ == '__main__':
    unittest.main()
