#!/usr/bin/env python3
"""Static contract tests for the CAP-03 S2 Windows procedure at designated pin a891802e.

Scope (read this before relying on the result):
  * These tests read the PowerShell file as text. They do NOT execute PowerShell and do NOT
    run anything on Windows. Behavioural evidence for the native run exists only if a native
    Windows run returns verified evidence for the exact script hash recorded below.
  * They check: the finalization ordering (no PASS before the manifest is sealed and verified),
    manifest coverage (RESULT.txt is the only excluded result file and is named explicitly),
    required-evidence coverage, pinned governance values, the INCOMPLETE marker for interrupted
    runs, the absence of forbidden keywords and destructive commands, and ASCII-only content.
  * Negative controls: each mutation reintroduces a known defect class; the matching test must fail.

Run:  python3 test_finalization_contract.py -v      (standard library only)
"""
import re
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
SCRIPT = REPO / "docs/integration/IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1"

FORBIDDEN_WORDS = ("exit", "break", "else", "elseif", "finally")
PRODUCED_BY_STEPS_EXTRA = [
    "s2-00-run-log.txt", "s2-01c-pin-verification.txt", "s2-04b-dist-count.txt",
    "s2-04c-dist-sha256-before.txt", "05b-test-summary.txt", "s2-08-post-run-pin.txt",
    "s2-08b-dist-sha256-after.txt",
]


def code_lines(text):
    """Executable lines only: PowerShell comments (full-line '#') removed."""
    return [ln for ln in text.split("\n") if not ln.lstrip().startswith("#")]


def find_one(text, needle):
    count = text.count(needle)
    if count != 1:
        raise AssertionError(f"expected exactly one occurrence of {needle!r}, found {count}")
    return text.index(needle)


class FinalizationContract(unittest.TestCase):
    text = ""

    @classmethod
    def setUpClass(cls):
        cls.text = SCRIPT.read_text(encoding="utf-8")

    # ---- helpers that take text, so mutations can reuse the same checks -----------------
    def assert_ordering(self, text):
        seal_start = find_one(text, "# 3. Write the manifest and record its seal hash.")
        verify_out = text.index("| Out-File -LiteralPath (Join-Path $EvidenceRoot 'manifest-verification.txt')")
        pass_marker = find_one(text, "  $Status = 'PASS'")
        verdict_throw = text.index("throw ('FAIL - evidence manifest verification found '")
        seal_write = text.index("$manifestLines | Out-File -LiteralPath $manifestFile -Encoding utf8")
        if not (seal_start < seal_write < verify_out < verdict_throw < pass_marker):
            raise AssertionError("PASS is not decided strictly after manifest write, verification and verdict")
        # the single PASS decision must come after the verdict check
        self.assertEqual(text.count("$Status = 'PASS'"), 1)

    def assert_coverage(self, text):
        self.assertIn("$controlNames = @('RESULT.txt', 'SHA256SUMS.txt', 'manifest-verification.txt')", text)
        self.assertIn("Where-Object { $controlNames -notcontains $_.Name }", text)
        # every file the steps produce is in the required list
        block = text[text.index("$requiredEvidence = @("):]
        block = block[:block.index(")\n") + 1]
        required = set(re.findall(r"'([^']+)'", block))
        steps = re.findall(r"Invoke-Step '([^']+)'", text)
        produced = {s + ".txt" for s in steps} | set(PRODUCED_BY_STEPS_EXTRA)
        missing = sorted(produced - required)
        self.assertEqual(missing, [], f"produced evidence not required: {missing}")
        self.assertEqual(len(required), 14, "required evidence list changed size")

    def assert_no_writes_after_seal(self, text):
        region = text[text.index("# 3. Write the manifest and record its seal hash."):text.index("} catch {")]
        for ln in region.split("\n"):
            if ln.lstrip().startswith("#") or not ln.strip():
                continue
            if re.search(r"Out-File|Set-Content|Add-Content|Move-Item|Remove-Item|Write-Log|Write-Result", ln):
                allowed = ("manifest-verification.txt" in ln) or ("Write-Result 'RESULT.txt'" in ln) \
                    or ("$manifestLines | Out-File" in ln)
                self.assertTrue(allowed, f"unexpected evidence write after seal: {ln.strip()}")

    # ---- real checks on the file ----------------------------------------------------------
    def test_script_exists_and_is_ascii_lf(self):
        raw = SCRIPT.read_bytes()
        self.assertTrue(all(b < 128 for b in raw), "non-ASCII byte in script")
        self.assertNotIn(b"\r", raw)

    def test_forbidden_keywords_absent_from_executable_code(self):
        for ln in code_lines(self.text):
            for word in FORBIDDEN_WORDS:
                # whole-word match; $LASTEXITCODE (automatic variable) and quoted option strings are not matches
                hit = re.search(rf"(?<![\w$-]){word}(?![\w-])", ln)
                self.assertIsNone(hit, f"forbidden keyword {word!r} in: {ln.strip()}")

    def test_p1_not_executed(self):
        for ln in code_lines(self.text):
            self.assertNotIn("P-1", ln, f"P-1 referenced in executable code: {ln.strip()}")

    def test_pass_is_decided_only_after_seal_and_verification(self):
        self.assert_ordering(self.text)

    def test_result_pass_is_written_after_manifest_and_verification(self):
        pass_write = find_one(self.text, "  Write-Result 'RESULT.txt'\n  $resultHash")
        self.assertGreater(pass_write, self.text.index("$verifyHash = (Get-FileHash"))

    def test_only_control_files_are_excluded_from_manifest(self):
        self.assert_coverage(self.text)

    def test_required_evidence_includes_every_step_output(self):
        self.assert_coverage(self.text)

    def test_no_evidence_writes_after_seal_except_verification_and_result(self):
        self.assert_no_writes_after_seal(self.text)

    def test_interrupted_run_leaves_incomplete_marker_before_any_command(self):
        marker = find_one(self.text, "  $Status = 'INCOMPLETE'")
        first_step = find_one(self.text, "Invoke-Step '01-clone'")
        self.assertLess(marker, first_step)
        self.assertIn("Write-Result 'RESULT.txt'", self.text[marker:marker + 300])

    def test_result_write_is_temp_file_then_move(self):
        self.assertIn("$tmp = $path + '.tmp'", self.text)
        self.assertIn("Move-Item -LiteralPath $tmp -Destination $path -Force", self.text)

    def test_catch_maps_every_failure_to_a_non_pass_status(self):
        catch = self.text[self.text.index("} catch {"):]
        self.assertIn("$Status = 'FAIL'", catch)
        self.assertIn("$Status = 'NOT EXECUTED'", catch)
        self.assertIn("$Status = 'INVALID'", catch)
        self.assertIn("$Status = 'INCONCLUSIVE'", catch)
        self.assertNotIn("$Status = 'PASS'", catch)
        self.assertIn("Write-Result 'RESULT.txt'", catch)

    def test_verification_compares_both_directions(self):
        self.assertIn("UNLISTED ", self.text)
        self.assertIn("NOT ON DISK ", self.text)
        self.assertIn("if ($checked -eq 0)", self.text)
        self.assertNotIn("$checked -ne $evidenceFiles.Count", self.text)  # old tautological check

    def test_governance_values_unchanged(self):
        expected = [
            "$PinCommit      = 'a891802e2691bd9c65a67d6abff20d8ce0c26d7d'",
            "$PinTree        = '76f083d7058e170d8212455c03bad1033136ee68'",
            "$ExpectedDist   = 1140",
            "$ExpectedExec   = 930",
            "$ExpectedPackShasum = 'cc2aa70186b8fd7bc7255452ac8d8b00d094f53e'",
            "'the POSIX state directory is owner-only 0700',",
            "'the POSIX socket itself is mode 0600 and owner-owned',",
            "'refuses an occupied POSIX endpoint path at bind with no second endpoint',",
            "'refuses an unsafe pre-existing state directory instead of repairing it'",
            "'IIPS_G3_IPC_BINDING_PROVISIONED', 'IIPS_ENABLE_WRITES', 'IIPS_G3_ENABLE_WRITES',",
            "'GATE_E_OVERRIDE', 'IIPS_G2_IPC_ENDPOINT', 'IIPS_G3_LOCAL_STATE_DIR',",
            "'IIPS_G3_DATABASE_PATH', 'IPD_IRR_READONLY', 'IPD_PACKAGE_CONSUMER_KEEP'",
            "$EvidenceBase = 'C:\\iips-evidence\\cap03-s2-a891802e'",
        ]
        for needle in expected:
            self.assertIn(needle, self.text)

    def test_no_destructive_commands(self):
        for ln in code_lines(self.text):
            self.assertNotIn("Set-ExecutionPolicy", ln)
            self.assertNotIn("git clean", ln)
            self.assertNotIn("reset --hard", ln)
            command_part = re.sub(r"'[^']*'", "''", ln)  # ignore text inside single-quoted messages
            if "Remove-Item" in command_part:
                # the only permitted removal targets the stale temp file of RESULT.txt
                self.assertIn("-LiteralPath $staleTmp -Force", ln, f"Remove-Item outside the temp-file cleanup: {ln.strip()}")
                self.assertNotIn("-Recurse", ln)
        self.assertIn("$staleTmp = Join-Path $EvidenceRoot 'RESULT.txt.tmp'", self.text)

    # ---- negative controls: each mutation must be caught by the matching check -----------
    def test_control_defect_result_outside_manifest_is_detected(self):
        mutated = self.text.replace("$controlNames = @('RESULT.txt', 'SHA256SUMS.txt', 'manifest-verification.txt')",
                                    "$controlNames = @('SHA256SUMS.txt', 'manifest-verification.txt')")
        with self.assertRaises(AssertionError):
            self.assert_coverage(mutated)

    def test_control_defect_pass_before_manifest_is_detected(self):
        # move the PASS decision to before the manifest is written
        mutated = self.text.replace("  $Status = 'PASS'\n", "", 1)
        mutated = mutated.replace("  Write-Log 'S2 criteria met. Sealing the evidence.'",
                                  "  $Status = 'PASS'\n  Write-Log 'S2 criteria met. Sealing the evidence.'", 1)
        with self.assertRaises(AssertionError):
            self.assert_ordering(mutated)

    def test_control_defect_log_write_after_seal_is_detected(self):
        mutated = self.text.replace(
            "  Write-Host ('Manifest verified: ' + $checked + ' entries, 0 issues')",
            "  Write-Log 'after seal'\n  Write-Host ('Manifest verified: ' + $checked + ' entries, 0 issues')", 1)
        with self.assertRaises(AssertionError):
            self.assert_no_writes_after_seal(mutated)

    def test_control_defect_missing_required_file_is_detected(self):
        mutated = self.text.replace("'s2-08b-dist-sha256-after.txt'\n  )", "\n  )", 1)
        with self.assertRaises(AssertionError):
            self.assert_coverage(mutated)


if __name__ == "__main__":
    unittest.main()
