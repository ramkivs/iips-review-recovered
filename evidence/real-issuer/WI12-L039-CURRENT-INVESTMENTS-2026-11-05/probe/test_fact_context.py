"""Offline checks of the retained L-039 primary instances and documentation."""
import gzip
import hashlib
import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
X = '{http://www.xbrl.org/2003/instance}'
CAP = '{http://www.sebi.gov.in/xbrl/2026-01-31/in-capmkt}'
XSI = '{http://www.w3.org/2001/XMLSchema-instance}'
XD = '{http://xbrl.org/2006/xbrldi}'


def source(name):
    return gzip.decompress((ROOT / 'source' / name).read_bytes())


class FactContextTest(unittest.TestCase):
    def test_original_bytes(self):
        checks = {
            'march-consolidated-xbrl.gz': '133f0cf14a5bbdecf055affc046e5aa73097f8d9793bf423942933b037f19d21',
            'march-rendered.gz': 'a9fa546bff8bcfc3dd531da0536370424c25b70a7cacd12373e06a7d7544a71b',
            'march-standalone-xbrl.gz': '419e14bccf9707bf2f2be2ee7278105913be8a3ebb5819a37e83f8fe3698fb3a',
            'september-consolidated-xbrl.gz': '59dd7e3bef485535eaec3db6ded52421088662469ba6bcecd315857073eda10c',
        }
        for name, sha in checks.items():
            with self.subTest(name=name):
                self.assertEqual(hashlib.sha256(source(name)).hexdigest(), sha)

    def test_march_exact_fact_and_complete_context(self):
        root = ET.fromstring(source('march-consolidated-xbrl.gz'))
        facts = root.findall('.//' + CAP + 'CurrentInvestments')
        self.assertEqual(len(facts), 1)
        fact = facts[0]
        self.assertEqual(fact.text, '0')
        self.assertEqual(fact.attrib, {'contextRef': 'OneI', 'decimals': '-7', 'unitRef': 'INR'})
        self.assertNotIn(XSI + 'nil', fact.attrib)
        context = root.find(X + 'context[@id="OneI"]')
        self.assertIsNotNone(context)
        self.assertEqual(context.find(X + 'entity/' + X + 'identifier').text, '532714')
        self.assertEqual(context.find(X + 'entity/' + X + 'identifier').get('scheme'), 'http://www.sebi.gov.in/in-capmkt/ScripCode')
        self.assertEqual(context.find(X + 'period/' + X + 'instant').text, '2026-03-31')
        self.assertEqual(len(list(context.iter(XD + 'explicitMember'))), 0)
        self.assertEqual(len(list(context.iter(XD + 'typedMember'))), 0)
        self.assertIsNone(context.find('.//' + X + 'segment'))
        self.assertIsNone(context.find('.//' + X + 'scenario'))
        unit = root.find(X + 'unit[@id="INR"]')
        self.assertEqual(unit.find(X + 'measure').text, 'iso4217:INR')
        self.assertEqual(len(list(unit)), 1)

    def test_comparisons_do_not_establish_defaults(self):
        for name, instant in [('march-standalone-xbrl.gz', '2026-03-31'), ('september-consolidated-xbrl.gz', '2026-09-30')]:
            root = ET.fromstring(source(name))
            facts = root.findall('.//' + CAP + 'CurrentInvestments')
            self.assertEqual(len(facts), 1)
            self.assertEqual(facts[0].text, '0')
            self.assertEqual(root.find(X + 'context[@id="OneI"]/' + X + 'period/' + X + 'instant').text, instant)

    def test_rendered_row_and_scale(self):
        html = source('march-rendered.gz').decode('utf8')
        self.assertRegex(html, r'(?is)<th>Current investments</th>\s*<td>0\.00</td>')
        self.assertRegex(html, r'(?is)Nature of report standalone or consolidated</th>\s*<td>Consolidated</td>')
        self.assertIn('Amount in (Lakhs)', html)

    def test_documented_outcome_remains_missing_and_open(self):
        d = json.loads((ROOT / 'determination.json').read_text())
        self.assertEqual(d['status'], 'OPEN')
        self.assertEqual(d['currentInvestments'], {'presence': 'MISSING', 'reason': 'NOT_REPORTED'})
        self.assertEqual(d['newEvidence']['classification'], 'C — indeterminate')
        self.assertFalse(d['newEvidence']['templateDefaultProven'])
        self.assertFalse(d['unchanged']['codeOrDatasetChanged'])

    def test_register_tracker_and_evidence_agree(self):
        repo = ROOT.parents[2]
        register = (repo / 'docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md').read_text()
        tracker = (repo / 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md').read_text()
        for text in (register.split('## 17.25', 1)[1], tracker.split('## 16.283', 1)[1], (ROOT / 'README.md').read_text()):
            self.assertIn('indeterminate', text.lower())
            self.assertIn('2026-03-31', text)
            self.assertIn('MISSING / NOT_REPORTED', text)
            self.assertIn('L-039', text)
            self.assertIn('OPEN', text)
            self.assertIn('decimals', text)

    def test_pdf_extraction_is_current_block_without_investment_caption(self):
        report = (ROOT / 'runs' / 'decisive-report.txt').read_text()
        page = report.split('=== fy26-audited-results PAGE 9 (verbatim) ===', 1)[1].split('=== END fy26-audited-results PAGE 9 ===', 1)[0]
        block = page.split('Current Assets', 2)[-1].split('Contract assets', 1)[0]
        self.assertNotRegex(block.lower(), r'current\s+investments')
        self.assertIn('Cash and cash equivalents', block)
        self.assertIn('411.26', block)


if __name__ == '__main__':
    unittest.main(verbosity=2)
