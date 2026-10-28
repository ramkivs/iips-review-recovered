#!/usr/bin/env python3
"""Contract tests for the CAP-03 S2 Windows procedure at designated pin a891802e (finalization design).

What this file does and does not establish (read before relying on a pass):
  * Part A reads the PowerShell file as TEXT and runs named checks on it. It does NOT execute PowerShell
    and does NOT run on Windows.
  * Part B is a Python MODEL of the intended post-seal verification rules, run against temporary folders.
    It is a specification check of the classification semantics, not a test of the PowerShell itself.
  * Part C is negative controls. Each control applies a mutation that reintroduces a defect class, then runs
    the SAME named check used in Part A. The control passes only when that check rejects the mutated text.
  * Native Windows behaviour is established only by a verified native run for the exact script hash.

Run:  python3 test_finalization_contract.py -v        (standard library only)
"""
import hashlib
import re
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
SCRIPT = REPO / "docs/integration/IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1"

FORBIDDEN_WORDS = ("exit", "break", "else", "elseif", "finally")
CONTROL_PATHS = ["RESULT.txt", "SHA256SUMS.txt", "manifest-verification.txt"]
REQUIRED = [
    "s2-00-run-log.txt", "01-clone.txt", "01b-checkout-pin.txt", "s2-01c-pin-verification.txt",
    "02-npm-ci.txt", "03-tsc-noemit.txt", "04-build.txt", "s2-04b-dist-count.txt",
    "s2-04c-dist-sha256-before.txt", "05-guarded-npm-test.txt", "05b-test-summary.txt",
    "06-package-consumer.txt", "s2-08-post-run-pin.txt", "s2-08b-dist-sha256-after.txt",
]
PRODUCED_EXTRA = [
    "s2-00-run-log.txt", "s2-01c-pin-verification.txt", "s2-04b-dist-count.txt",
    "s2-04c-dist-sha256-before.txt", "05b-test-summary.txt", "s2-08-post-run-pin.txt",
    "s2-08b-dist-sha256-after.txt",
]
GOVERNANCE = [
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


def code_lines(text):
    """Executable lines only: full-line PowerShell comments removed."""
    return [ln for ln in text.split("\n") if not ln.lstrip().startswith("#")]


def one(text, needle):
    """Index of the single occurrence of needle; raises if absent or repeated."""
    count = text.count(needle)
    if count != 1:
        raise AssertionError(f"expected exactly one occurrence of {needle!r}, found {count}")
    return text.index(needle)


# ----------------------------------------------------------------------------------------------
# Part A: named checks on the PowerShell text (each takes text; raises AssertionError on violation)
# ----------------------------------------------------------------------------------------------
def check_finalization_order(t):
    steps = [
        one(t, "$manifestLines | Out-File -LiteralPath $manifestFile -Encoding utf8"),
        one(t, "$sealHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $manifestFile).Hash"),
        one(t, "foreach ($f in @(Get-ChildItem -LiteralPath $EvidenceRoot -Recurse -File)) {\n    $onDisk["),
        one(t, "$sealUnchanged = ($sealNow -eq $sealHash)"),
        one(t, "$verifyOut | Out-File -LiteralPath (Join-Path $EvidenceRoot 'manifest-verification.txt')"),
        one(t, "throw ('FAIL - post-seal verification found '"),
        one(t, "  $Status = 'PASS'"),
        one(t, "  Write-Result 'RESULT.txt'\n  $resultHash"),
    ]
    if steps != sorted(steps):
        raise AssertionError("finalization steps out of order: seal -> seal hash -> post-seal inventory -> "
                             "seal unchanged -> verification record -> verdict -> PASS -> RESULT write")


def check_pass_decided_once(t):
    if t.count("$Status = 'PASS'") != 1:
        raise AssertionError("PASS must be decided exactly once")


def check_control_paths(t):
    one(t, "$controlPaths = @('RESULT.txt', 'SHA256SUMS.txt', 'manifest-verification.txt')")
    if "if ($controlPaths -notcontains $rel) {" not in t:
        raise AssertionError("payload filter does not exclude control paths by root-relative path")


def check_required_evidence(t):
    block = t[t.index("$requiredEvidence = @("):]
    block = block[:block.index("  )\n") + 4]
    required = re.findall(r"'([^']+)'", block)
    if sorted(required) != sorted(REQUIRED) or len(required) != 14:
        raise AssertionError(f"required evidence list differs from the 14 named files: {sorted(required)}")
    steps = re.findall(r"Invoke-Step '([^']+)'", t)
    produced = {s + ".txt" for s in steps} | set(PRODUCED_EXTRA)
    missing = sorted(produced - set(required))
    if missing:
        raise AssertionError(f"produced evidence not required: {missing}")


def check_post_seal_inventory(t):
    for marker in ["'MISSING  ' + $k", "'ALTERED  ' + $k", "'ADDED    ' + $k", "$sealUnchanged",
                   "'Post-seal verdict: FAILED'", "'Post-seal verdict: OK'",
                   "foreach ($k in @($onDisk.Keys | Sort-Object)) {"]:
        if marker not in t:
            raise AssertionError(f"post-seal inventory is missing: {marker}")
    if "(-not $listed.ContainsKey($k)) -and (-not $isSeal) -and (-not $isControl)" not in t:
        raise AssertionError("ADDED classification does not exclude only the seal and control files")
    if "if (-not $sealUnchanged) {\n    $issues = $issues + 1" not in t:
        raise AssertionError("an altered seal does not count as a verification issue")
    if "if ($listed.Count -eq 0) {\n    $issues = $issues + 1" not in t:
        raise AssertionError("an empty manifest does not count as a verification issue")


def check_interrupted_marker(t):
    if "  $Status = 'INCOMPLETE'" not in t:
        raise AssertionError("INCOMPLETE marker is absent")
    if one(t, "  $Status = 'INCOMPLETE'") > one(t, "Invoke-Step '01-clone'"):
        raise AssertionError("INCOMPLETE marker is written after the first S2 command")


def check_result_temp_then_move(t):
    if "$tmp = $path + '.tmp'" not in t or "Move-Item -LiteralPath $tmp -Destination $path -Force" not in t:
        raise AssertionError("RESULT.txt is not written through a temp file and moved into place")


def check_catch_never_passes(t):
    catch = t[t.index("} catch {"):]
    for status in ["'FAIL'", "'NOT EXECUTED'", "'INVALID'", "'INCONCLUSIVE'"]:
        if f"$Status = {status}" not in catch:
            raise AssertionError(f"catch does not map failures to {status}")
    if "$Status = 'PASS'" in catch:
        raise AssertionError("catch block writes PASS")
    if "$ResultExtra = @()" not in catch or "Write-Result 'RESULT.txt'" not in catch:
        raise AssertionError("catch block does not clear extras or record the failure")


def check_no_evidence_writes_after_seal(t):
    region = t[t.index("  # 3. Seal:"):t.index("} catch {")]
    for ln in region.split("\n"):
        if ln.lstrip().startswith("#") or not ln.strip():
            continue
        if re.search(r"Out-File|Set-Content|Add-Content|Move-Item|Remove-Item|Write-Log|Write-Result", ln):
            allowed = ("$manifestLines | Out-File" in ln) or ("manifest-verification.txt" in ln) \
                or ("Write-Result 'RESULT.txt'" in ln)
            if not allowed:
                raise AssertionError(f"unexpected evidence write in finalization: {ln.strip()}")


def check_forbidden_keywords(t):
    for ln in code_lines(t):
        for word in FORBIDDEN_WORDS:
            if re.search(rf"(?<![\w$-]){word}(?![\w-])", ln):
                raise AssertionError(f"forbidden keyword {word!r} in: {ln.strip()}")


def check_p1_absent(t):
    for ln in code_lines(t):
        if "P-1" in ln:
            raise AssertionError(f"P-1 referenced in executable code: {ln.strip()}")


def check_governance(t):
    for needle in GOVERNANCE:
        if needle not in t:
            raise AssertionError(f"governance value changed or missing: {needle}")


def check_no_destructive(t):
    for ln in code_lines(t):
        command = re.sub(r"'[^']*'", "''", ln)  # ignore text inside single-quoted messages
        if "Set-ExecutionPolicy" in ln or "git clean" in ln or "reset --hard" in ln:
            raise AssertionError(f"destructive command: {ln.strip()}")
        if "Remove-Item" in command:
            if "-LiteralPath $staleTmp -Force" not in ln or "-Recurse" in ln:
                raise AssertionError(f"Remove-Item outside the temp-file cleanup: {ln.strip()}")
    if "$staleTmp = Join-Path $EvidenceRoot 'RESULT.txt.tmp'" not in t:
        raise AssertionError("temp-file cleanup target is not RESULT.txt.tmp")


def check_ascii_lf(raw):
    if not all(b < 128 for b in raw):
        raise AssertionError("non-ASCII byte in script")
    if b"\r" in raw:
        raise AssertionError("CR byte in script")


ALL_TEXT_CHECKS = [
    check_finalization_order, check_pass_decided_once, check_control_paths, check_required_evidence,
    check_post_seal_inventory, check_interrupted_marker, check_result_temp_then_move, check_catch_never_passes,
    check_no_evidence_writes_after_seal, check_forbidden_keywords, check_p1_absent, check_governance,
    check_no_destructive,
]


class ProcedureText(unittest.TestCase):
    text = ""
    raw = b""

    @classmethod
    def setUpClass(cls):
        cls.raw = SCRIPT.read_bytes()
        cls.text = cls.raw.decode("utf-8")

    def test_ascii_lf_only(self):
        check_ascii_lf(self.raw)

    def test_finalization_order(self):
        check_finalization_order(self.text)

    def test_pass_decided_once(self):
        check_pass_decided_once(self.text)

    def test_control_paths(self):
        check_control_paths(self.text)

    def test_required_evidence(self):
        check_required_evidence(self.text)

    def test_post_seal_inventory(self):
        check_post_seal_inventory(self.text)

    def test_interrupted_marker(self):
        check_interrupted_marker(self.text)

    def test_result_temp_then_move(self):
        check_result_temp_then_move(self.text)

    def test_catch_never_passes(self):
        check_catch_never_passes(self.text)

    def test_no_evidence_writes_after_seal(self):
        check_no_evidence_writes_after_seal(self.text)

    def test_forbidden_keywords(self):
        check_forbidden_keywords(self.text)

    def test_p1_absent(self):
        check_p1_absent(self.text)

    def test_governance_unchanged(self):
        check_governance(self.text)

    def test_no_destructive_commands(self):
        check_no_destructive(self.text)


# ----------------------------------------------------------------------------------------------
# Part B: Python model of the intended post-seal verification rules (specification check only)
# ----------------------------------------------------------------------------------------------
def sha256_file(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest().upper()


def model_seal(root):
    """Seal every payload file (root-relative, control files excluded). Returns the seal hash."""
    root = Path(root)
    lines = []
    for f in sorted(p for p in root.rglob("*") if p.is_file()):
        rel = f.relative_to(root).as_posix()
        if rel not in CONTROL_PATHS:
            lines.append(f"{sha256_file(f)}  {rel}")
    seal = root / "SHA256SUMS.txt"
    seal.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return sha256_file(seal)


def model_verify(root, seal_hash_at_creation):
    """Mirror of the post-seal rules. Returns (issues, categories)."""
    root = Path(root)
    listed = {}
    for line in (root / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines():
        if "  " in line:
            h, rel = line.split("  ", 1)
            listed[rel] = h
    on_disk = {p.relative_to(root).as_posix(): p for p in root.rglob("*") if p.is_file()}
    cats = {"missing": [], "altered": [], "added": []}
    for k in sorted(listed):
        if k not in on_disk:
            cats["missing"].append(k)
        if k in on_disk and sha256_file(on_disk[k]) != listed[k]:
            cats["altered"].append(k)
    for k in sorted(on_disk):
        if k not in listed and k != "SHA256SUMS.txt" and k not in CONTROL_PATHS:
            cats["added"].append(k)
    seal_unchanged = sha256_file(root / "SHA256SUMS.txt") == seal_hash_at_creation
    issues = len(cats["missing"]) + len(cats["altered"]) + len(cats["added"]) + (0 if seal_unchanged else 1)
    if not listed:
        issues += 1
    return issues, cats


class VerificationModel(unittest.TestCase):
    def make_tree(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        root = Path(tmp.name)
        (root / "sub").mkdir()
        (root / "a.txt").write_text("alpha", encoding="utf-8")
        (root / "sub" / "b.txt").write_text("bravo", encoding="utf-8")
        (root / "RESULT.txt").write_text("INCOMPLETE", encoding="utf-8")
        return root

    def test_unmodified_folder_verifies_clean(self):
        root = self.make_tree()
        seal = model_seal(root)
        self.assertEqual(model_verify(root, seal), (0, {"missing": [], "altered": [], "added": []}))

    def test_result_txt_is_outside_the_seal(self):
        root = self.make_tree()
        model_seal(root)
        listed = (root / "SHA256SUMS.txt").read_text(encoding="utf-8")
        self.assertNotIn("RESULT.txt", listed)
        self.assertIn("sub/b.txt", listed)

    def test_added_file_is_detected(self):
        root = self.make_tree()
        seal = model_seal(root)
        (root / "extra.txt").write_text("unsealed", encoding="utf-8")
        issues, cats = model_verify(root, seal)
        self.assertGreater(issues, 0)
        self.assertEqual(cats["added"], ["extra.txt"])

    def test_added_temp_result_file_is_detected(self):
        root = self.make_tree()
        seal = model_seal(root)
        (root / "RESULT.txt.tmp").write_text("PASS", encoding="utf-8")
        issues, cats = model_verify(root, seal)
        self.assertEqual(cats["added"], ["RESULT.txt.tmp"])

    def test_missing_file_is_detected(self):
        root = self.make_tree()
        seal = model_seal(root)
        (root / "a.txt").unlink()
        issues, cats = model_verify(root, seal)
        self.assertEqual(cats["missing"], ["a.txt"])
        self.assertGreater(issues, 0)

    def test_altered_file_is_detected(self):
        root = self.make_tree()
        seal = model_seal(root)
        (root / "sub" / "b.txt").write_text("tampered", encoding="utf-8")
        issues, cats = model_verify(root, seal)
        self.assertEqual(cats["altered"], ["sub/b.txt"])

    def test_resealed_tree_fails_against_original_seal_hash(self):
        root = self.make_tree()
        seal = model_seal(root)
        (root / "a.txt").write_text("tampered", encoding="utf-8")
        model_seal(root)  # attacker re-seals: the seal hash changes
        issues, _ = model_verify(root, seal)
        self.assertGreater(issues, 0)

    def test_empty_manifest_is_an_issue(self):
        root = self.make_tree()
        seal = model_seal(root)
        (root / "SHA256SUMS.txt").write_text("", encoding="utf-8")
        issues, _ = model_verify(root, seal)
        self.assertGreater(issues, 0)


# ----------------------------------------------------------------------------------------------
# Part C: negative controls. Each mutation must be rejected by the SAME check used in Part A.
# ----------------------------------------------------------------------------------------------
class NegativeControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = SCRIPT.read_text(encoding="utf-8")

    def mutate(self, old, new, count=1):
        self.assertEqual(self.text.count(old), count, f"control anchor count wrong: {old[:70]!r}")
        return self.text.replace(old, new, 1)

    def assert_rejected(self, check, mutated):
        with self.assertRaises(AssertionError, msg=f"{check.__name__} accepted a mutated script"):
            check(mutated)

    def test_pass_written_before_seal_is_rejected(self):
        t = self.mutate("  $Status = 'PASS'\n", "")
        t = t.replace("  $manifestLines | Out-File", "  $Status = 'PASS'\n  $manifestLines | Out-File", 1)
        self.assert_rejected(check_finalization_order, t)

    def test_pass_before_post_seal_verdict_is_rejected(self):
        t = self.mutate("  $Status = 'PASS'\n", "")
        t = t.replace("  if ($issues -gt 0) {\n    throw ('FAIL - post-seal",
                      "  $Status = 'PASS'\n  if ($issues -gt 0) {\n    throw ('FAIL - post-seal", 1)
        self.assert_rejected(check_finalization_order, t)

    def test_post_seal_inventory_loop_removed_is_rejected(self):
        t = self.mutate("  foreach ($k in @($onDisk.Keys | Sort-Object)) {", "  foreach ($k in @()) {")
        self.assert_rejected(check_post_seal_inventory, t)

    def test_seal_unchanged_check_removed_is_rejected(self):
        t = self.mutate("  if (-not $sealUnchanged) {\n    $issues = $issues + 1\n  }\n", "")
        self.assert_rejected(check_post_seal_inventory, t)

    def test_result_moved_into_payload_is_rejected(self):
        t = self.mutate("$controlPaths = @('RESULT.txt', 'SHA256SUMS.txt', 'manifest-verification.txt')",
                        "$controlPaths = @('SHA256SUMS.txt', 'manifest-verification.txt')")
        self.assert_rejected(check_control_paths, t)

    def test_interrupted_marker_removed_is_rejected(self):
        t = self.mutate("  $Status = 'INCOMPLETE'\n", "")
        self.assert_rejected(check_interrupted_marker, t)

    def test_required_file_dropped_is_rejected(self):
        t = self.mutate("'s2-08b-dist-sha256-after.txt'\n  )", "\n  )")
        self.assert_rejected(check_required_evidence, t)

    def test_destructive_command_is_rejected(self):
        t = self.mutate("  if ($missingEvidence.Count -gt 0) {",
                        "  Remove-Item -LiteralPath $EvidenceRoot -Recurse -Force\n  if ($missingEvidence.Count -gt 0) {")
        self.assert_rejected(check_no_destructive, t)

    def test_catch_writing_pass_is_rejected(self):
        t = self.mutate("  Set-Location -LiteralPath $StartDir\n  $ResultExtra = @()\n",
                        "  Set-Location -LiteralPath $StartDir\n  $Status = 'PASS'\n  $ResultExtra = @()\n")
        self.assert_rejected(check_catch_never_passes, t)

    def test_direct_result_write_without_temp_is_rejected(self):
        t = self.mutate("$tmp = $path + '.tmp'", "$tmp = $path")
        self.assert_rejected(check_result_temp_then_move, t)

    def test_forbidden_keyword_is_rejected(self):
        t = self.mutate("$ErrorActionPreference = 'Stop'\n", "$ErrorActionPreference = 'Stop'\nbreak\n")
        self.assert_rejected(check_forbidden_keywords, t)

    def test_governance_value_change_is_rejected(self):
        t = self.mutate("$ExpectedExec   = 930", "$ExpectedExec   = 924")
        self.assert_rejected(check_governance, t)

    def test_p1_reference_in_code_is_rejected(self):
        t = self.mutate("$ErrorActionPreference = 'Stop'\n", "$ErrorActionPreference = 'Stop'\n$x = 'P-1'\n")
        self.assert_rejected(check_p1_absent, t)


if __name__ == "__main__":
    unittest.main()
