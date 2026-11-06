"""Regression for PR #485's receipt-only CI coverage; no npm/IPD access."""
import fnmatch
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[2]
RECEIPTS = (
    'evidence/integration/d02-d03-d05-engineering-2026-11-06/'
    'IPD-RECONSTRUCTION-PUBLICATION-RECEIPT-2026-11-06.md',
    'evidence/integration/d02-d03-d05-engineering-2026-11-06/'
    'IPD-RECONSTRUCTION-RESULTS-2026-11-06.json',
)


def filters(workflow, event, key='paths'):
    """Extract the repository's literal YAML lists, not a general YAML parser.

    Fail rather than silently approximate if their structure changes. Patterns
    tested here are exact paths or terminal /** globs, not GitHub's full glob DSL.
    """
    text = (ROOT / '.github/workflows' / workflow).read_text()
    block = re.search(r'^  ' + event + r':\n(.*?)(?=^  [a-z_]+:|^\S|\Z)', text, re.M | re.S)
    if not block:
        raise AssertionError('event missing: ' + event)
    values = re.search(r'^    ' + key + r':\n(.*?)(?=^    [a-z_]+:|\Z)', block[1], re.M | re.S)
    if not values:
        raise AssertionError('filter missing: ' + key)
    items = re.findall(r"^      - (?:'([^']+)'|([^\s#]+))\s*$", values[1], re.M)
    if not items:
        raise AssertionError('literal filter list missing')
    return [quoted or plain for quoted, plain in items]


def matches(path, patterns):
    return any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns)


class ReceiptWorkflowRouting(unittest.TestCase):
    def test_receipts_trigger_static_pr_and_main_push_individually(self):
        for event in ('pull_request', 'push'):
            for path in RECEIPTS:
                with self.subTest(event=event, path=path):
                    self.assertTrue(matches(path, filters('cap03-revision7-irr-static.yml', event)))

    def test_receipts_do_not_select_product_or_windows_fixtures(self):
        for workflow in ('ci.yml', 'cap03-p1-consolidated-windows.yml'):
            for event in ('pull_request', 'push'):
                for path in RECEIPTS:
                    with self.subTest(workflow=workflow, event=event, path=path):
                        self.assertFalse(matches(path, filters(workflow, event)))

    def test_static_self_and_regression_changes_trigger_checks(self):
        for event in ('pull_request', 'push'):
            for path in ('.github/workflows/cap03-revision7-irr-static.yml',
                         'tests/validation/test_irr_workflow_triggers.py'):
                self.assertTrue(matches(path, filters('cap03-revision7-irr-static.yml', event)))

    def test_main_only_push_and_no_unrelated_evidence_expansion(self):
        self.assertEqual(filters('cap03-revision7-irr-static.yml', 'push', 'branches'), ['main'])
        self.assertFalse(matches('evidence/integration/unrelated/result.json',
                                 filters('cap03-revision7-irr-static.yml', 'pull_request')))


if __name__ == '__main__':
    unittest.main()
