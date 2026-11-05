"""Pure classifier tests without importing the validator's top-level evidence checks.
Full validator remains the integration regression, run separately in the same CI job.
"""
import ast
from pathlib import Path
import re
import subprocess
import unittest
ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/integration/cap03-p1-f9/validate_windows10_host_profile.py'
IID = 'evidence/iid/IID-1-IDENTITY-COVERAGE-2026-11-05/test-log-np12-regression.txt'
module = ast.parse(SOURCE.read_text())
function = next(n for n in module.body if isinstance(n, ast.FunctionDef) and n.name == 'is_p1_artifact_path')
namespace = {'re': re}
exec(compile(ast.Module(body=[function], type_ignores=[]), str(SOURCE), 'exec'), namespace)
classify = namespace['is_p1_artifact_path']

class ArtifactClassification(unittest.TestCase):
    def test_exact_iid_artifact_and_authoritative_provenance(self):
        self.assertFalse(classify(IID))
        readme = (ROOT / Path(IID).parent / 'README.md').read_text()
        self.assertIn('# IID-1', readme)
        self.assertIn('tests/regression/np12-sector-reference-population.test.ts', readme)
        self.assertIn('`test-log-np12-regression.txt`', readme)
        self.assertTrue((ROOT / IID).read_text().startswith('TAP version 13'))

    def test_unrelated_identity_and_locations_not_filename_substrings(self):
        for p in ['evidence/other/test-log-np12-regression.txt', 'evidence/iid/NP12.txt',
                  'evidence/other/np13-regression.txt', 'evidence/other/np1-regression.txt',
                  'evidence/other/NP1.txt', 'evidence/other/step12.txt']:
            with self.subTest(path=p): self.assertFalse(classify(p))

    def test_genuine_identity_families_still_strict(self):
        for p in ['docs/integration/IIPS_V3_CAP03_P1_AUTHORITY.md',
                  'evidence/cap03-p1-f9/np12-regression.txt',
                  'docs/integration/P-1-record.md', 'docs/integration/P1F-record.md',
                  'docs/integration/PF15-record.md', 'docs/integration/PF-15-record.md',
                  'docs/integration/GATE_A_PRIME-record.md', 'docs/integration/PA_RULING.md',
                  'frontend/server/userPortfolioDirectP1Integration.test.ts']:
            with self.subTest(path=p): self.assertTrue(classify(p))

    def test_misplaced_or_unknown_p1_is_not_admitted_by_classifier(self):
        allowed = {'docs/integration/IIPS_V3_CAP03_P1_AUTHORITY.md'}
        paths = ['evidence/iid/P1-unauthorized.txt', 'elsewhere/P-1-record.md',
                 'docs/integration/UNKNOWN_P1_RECORD.md', 'elsewhere/DirectP1Artifact.ts']
        self.assertEqual([p for p in paths if classify(p) and p not in allowed], paths)

    def test_real_admission_gate_rejects_misplaced_p1(self):
        assignment = next(n for n in module.body if isinstance(n, ast.Assign)
                          and any(isinstance(t, ast.Name) and t.id == 'unlisted_p1_paths' for t in n.targets))
        guard = next(n for n in module.body if isinstance(n, ast.Expr)
                     and isinstance(n.value, ast.Call) and isinstance(n.value.func, ast.Name)
                     and n.value.func.id == 'require' and n.value.args
                     and isinstance(n.value.args[0], ast.UnaryOp)
                     and isinstance(n.value.args[0].operand, ast.Name)
                     and n.value.args[0].operand.id == 'unlisted_p1_paths')
        def require(ok, message):
            if not ok: raise ValueError(message)
        for path in ['evidence/iid/P1-unauthorized.txt', 'elsewhere/P-1-record.md',
                     'evidence/cap03-p1-f9/test-log-np12-regression.txt']:
            ns = dict(namespace, changed_pr_paths=[path], review_artifact_paths=set(),
                      separate_direct_p1_paths=set(), require=require)
            with self.subTest(path=path), self.assertRaisesRegex(ValueError, 'freshness allowlist'):
                exec(compile(ast.Module(body=[assignment,guard],type_ignores=[]),str(SOURCE),'exec'),ns)

    def test_entire_existing_history_only_reported_false_positive_changes(self):
        baseline = 'a9329dd509be8051f82780059646c0f179d42b74'
        paths = subprocess.check_output(['git','diff','--name-only','235b793dcca944fdfca1da166f3d09cc655afb49',baseline],cwd=ROOT,text=True).splitlines()
        old = re.compile(r'(?i)(P1|P-1|GATE[_-]A[_-]PRIME|PF-?15|PA[_-]RULING)')
        self.assertEqual([p for p in paths if bool(old.search(p)) != classify(p)], [IID])

    def test_existing_admission_and_separate_direct_boundaries_remain(self):
        source = SOURCE.read_text()
        self.assertIn('if is_p1_artifact_path(path)', source)
        self.assertIn('and path not in review_artifact_paths and path not in separate_direct_p1_paths', source)
        self.assertIn('separate_direct_p1_paths.issubset(set(changed_pr_paths))', source)
        self.assertIn('separate_direct_p1_paths.isdisjoint(review_artifact_paths)', source)
        self.assertIn('require(not unlisted_p1_paths', source)

if __name__ == '__main__': unittest.main()
