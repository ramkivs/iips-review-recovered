#!/usr/bin/env python3
"""Contract tests for the CAP-03 S2 Windows procedure at designated pin a891802e (sealing design, 2026-10-28 pass 4).

What this file does and does not establish (read before relying on a pass):
  * Part A reads the PowerShell file as TEXT and runs named checks on it. It does NOT execute PowerShell
    and does NOT run on Windows. No PowerShell engine is available in the sandbox (checked: no pwsh, no
    .NET runtime, no reachable package that runs on Linux).
  * Part B is a Python MODEL of the sealing sequence and the recheck rules (mirrors Invoke-Finalize and
    Test-Seal), run on temporary folders. It checks the logic of the design, not the PowerShell code.
  * Part C is negative controls. Each control applies one mutation to a copy of the real script text and
    runs the SAME named Part A check that the real script must pass. The control passes only when that
    check rejects the mutated text. Each mutation is asserted to have actually changed the text.
  * Native Windows behaviour is established only by a verified native run for the exact script hash.

Run:  python3 test_finalization_contract.py -v        (standard library only)
"""
import hashlib
import json
import os
import re
import shutil
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
SCRIPT = REPO / "docs/integration/IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1"
RUNBOOK = REPO / "docs/integration/IIPS_v3.0_CAP03_S2_OPERATOR_RUNBOOK_2026-10-26.md"
RUNBOOK_LEGACY_SEAL = "Tee-Object -FilePath (Join-Path $EvidenceRoot 'SHA256SUMS.txt') | Out-Null"

REQUIRED = [
    "s2-00-run-log.txt", "01-clone.txt", "01b-checkout-pin.txt", "s2-01c-pin-verification.txt",
    "02-npm-ci.txt", "03-tsc-noemit.txt", "04-build.txt", "s2-04b-dist-count.txt",
    "s2-04c-dist-sha256-before.txt", "dist-artifacts.zip", "05-guarded-npm-test.txt", "05b-test-summary.txt",
    "06-package-consumer.txt", "s2-08-post-run-pin.txt", "s2-08b-dist-sha256-after.txt",
]
VOCAB = {"PASS", "FAIL", "INCONCLUSIVE", "INVALID", "NOT EXECUTED"}
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


# ---------------------------------------------------------------- helpers ----
def code_lines(text):
    """Executable lines only: full-line PowerShell comments removed."""
    return [ln for ln in text.split("\n") if not ln.lstrip().startswith("#")]


def one(text, needle):
    n = text.count(needle)
    if n != 1:
        raise AssertionError(f"expected exactly one occurrence of {needle!r}, found {n}")
    return text.index(needle)


def function_body(text, name):
    m = re.search(r"^function " + re.escape(name) + r"\b[^\n]*\{", text, re.M)
    if not m:
        raise AssertionError("function not found: " + name)
    end = text.index("\n}\n", m.start())
    return text[m.start():end + 3]


def try_block_catch_text(text):
    """Text of the first try/catch catch-body in the main sequence (between '} catch {' and the next top-level '}')."""
    s = text.index("} catch {\n") + len("} catch {\n")
    e = text.index("\n}\n", s)
    return text[s:e]


# ---------------------------------------------------------------- Part A -----
def check_required_list(t):
    m = re.search(r"\$RequiredEvidence = @\((.*?)\n\)", t, re.S)
    if not m:
        raise AssertionError("RequiredEvidence array not found")
    names = re.findall(r"'([^']+)'", m.group(1))
    if names != REQUIRED:
        raise AssertionError(f"RequiredEvidence differs from the 15-file contract: {names}")


def check_dist_archive_retained(t):
    required = check_required_list
    required(t)
    if "Import-Module -Name (Join-Path $PSScriptRoot 'cap03-p1-f9\\CAP03S2DistArtifacts.psm1')" not in t:
        raise AssertionError("S2 runner does not import the shared emitted-artifact implementation")
    if "'s2-04c-dist-sha256-before.txt', 'dist-artifacts.zip', '05-guarded-npm-test.txt'" not in t:
        raise AssertionError("dist-artifacts.zip is not part of required S2 evidence")
    if "New-S2DistArchive -DistRoot $distDir -ArchivePath $distArchivePath -ExpectedCount $ExpectedDist" not in t:
        raise AssertionError("S2 runner does not retain an archive of emitted distribution bytes")
    if "Test-S2DistArchive -ArchivePath $distArchivePath -ExpectedMap $distMap -ExpectedCount $ExpectedDist" not in t:
        raise AssertionError("S2 runner does not hash-check every archived emitted file")
    if t.index("Test-S2DistArchive -ArchivePath $distArchivePath") > t.index("# S2 command 4: canonical guarded test"):
        raise AssertionError("distribution archive verification must finish before later S2 checks")


def check_no_legacy_result_design(t):
    for token in ("INCOMPLETE", "Write-Result", "ResultExtra", "RESULT.txt.tmp", "manifest-verification"):
        if token in t:
            raise AssertionError(f"legacy token present: {token}")


def check_status_vocabulary(t):
    literals = re.findall(r"\$(?:script:)?Status = '([^']*)'( \+ \$Reason)?", t)
    values = {v for v, concat in literals if not concat}
    prefixes = {v for v, concat in literals if concat}
    bad = values - VOCAB
    if bad:
        raise AssertionError(f"status values outside the CAP-02 vocabulary: {bad}")
    if prefixes - {"NOT EXECUTED - "}:
        raise AssertionError(f"status prefixes outside the CAP-02 vocabulary: {prefixes}")
    if t.count("$Status = 'PASS'") != 1:
        raise AssertionError("PASS must be assigned exactly once, in the main sequence")


def check_pass_only_in_sequence(t):
    body = function_body(t, "Invoke-Finalize")
    if "= 'PASS'" in body:
        raise AssertionError("Invoke-Finalize assigns PASS")
    if t.index("$Status = 'PASS'") > t.index("} catch {\n"):
        raise AssertionError("PASS assigned after the catch")


def check_finalize_order(t):
    body = function_body(t, "Invoke-Finalize")
    marks = [
        "Write-Utf8NoBom (Join-Path $EvidenceRoot 'RESULT.txt') $resultLines",
        "$artifacts = @(Get-Artifacts $EvidenceRoot)",
        "$manifestPath = Join-Path $EvidenceRoot 'MANIFEST.json'",
        "Write-Utf8NoBom $manifestPath $mf.ToArray()",
        "$manifestHash = (Get-FileHash",
        "$sumsPath = Join-Path $EvidenceRoot 'SHA256SUMS.txt'",
        "Write-Utf8NoBom $sumsPath $sumLines",
        "$script:SealHash = (Get-FileHash",
        "$issues = Test-Seal $EvidenceRoot $script:Status $transcript",
        "if ($issues -gt 0) {",
        "[System.IO.Directory]::Move($EvidenceRoot, $PublishRoot)",
    ]
    pos = [one(body, m) for m in marks]
    if pos != sorted(pos) or len(set(pos)) != len(pos):
        raise AssertionError("finalization steps are out of the required order")


def check_manifest_last(t):
    body = function_body(t, "Invoke-Finalize")
    loop = body.index("foreach ($a in $artifacts) {")
    last = one(body, "$sumLines += ($manifestHash + '  MANIFEST.json')")
    if not loop < last:
        raise AssertionError("MANIFEST.json is not appended after the artifact loop")
    if one(body, "$artifacts = @(Get-Artifacts $EvidenceRoot)") > one(body, "$manifestPath = Join-Path $EvidenceRoot 'MANIFEST.json'"):
        raise AssertionError("artifact inventory must be taken before MANIFEST.json exists")


def check_manifest_fields(t):
    body = function_body(t, "Invoke-Finalize")
    for needle in ('"host"', '"node"', '"npm"', '"pin"', '"observed"', '"artifacts"', '"sha256"', '"bytes"', '"utc_last_write"'):
        if needle not in body:
            raise AssertionError(f"MANIFEST.json field missing: {needle}")


def check_result_not_self_hashed(t):
    for line in code_lines(t):
        if "Get-FileHash" in line and "RESULT.txt" in line:
            raise AssertionError("RESULT.txt is hashed; it is covered by the seal, it cannot hash itself")


def check_publication_gated(t):
    body = function_body(t, "Invoke-Finalize")
    gate = one(body, "if ($issues -gt 0) {")
    move = one(body, "[System.IO.Directory]::Move($EvidenceRoot, $PublishRoot)")
    if not gate < move:
        raise AssertionError("publication is not reached only through a passing seal recheck")
    if body.index("  else {", gate) > move:
        raise AssertionError("publication is not in the branch that follows a passing recheck")
    if "throw ('publication target already exists" not in body or body.index("Test-Path -LiteralPath $PublishRoot") > move:
        raise AssertionError("publication target existence check missing or after the move")


def check_test_seal_detects(t):
    body = function_body(t, "Test-Seal")
    for needle in ("'MISSING    ' + $rel", "'ALTERED    ' + $rel", "'ADDED      ' + $rel",
                   "'ORDER      MANIFEST.json", "MANIFEST   status is", "RESULT.txt STATUS line does not read",
                   "MANIFEST   hash differs", "MANIFEST   lists a file that is not sealed"):
        if needle not in body:
            raise AssertionError(f"recheck lacks detection: {needle}")
    if "return $issues" not in body:
        raise AssertionError("Test-Seal does not return the issue count")


def check_pf00_both_roots(t):
    if "(Test-Path -LiteralPath $PublishRoot) -or (Test-Path -LiteralPath $EvidenceRoot)" not in t:
        raise AssertionError("PF-00 does not check both the final and the working folder")


def check_catch_never_passes(t):
    if "'PASS'" in try_block_catch_text(t):
        raise AssertionError("the run catch block can produce PASS")
    fin_catch_start = t.index("Invoke-Finalize\n  }\n  catch {")
    fin_catch = t[fin_catch_start:t.index("Write-Host ('[S2] ' + $Status", fin_catch_start)]
    if "'PASS'" in fin_catch:
        raise AssertionError("the finalization catch can produce PASS")


def check_post_publication_quarantine(t):
    body = function_body(t, "Invoke-Finalize")
    gate = one(body, "if ($issues2 -gt 0) {")
    quarantine = gate + one(body[gate:], "$q = Move-RunToQuarantine")
    accept = one(body, "$script:EvidenceAccepted = $true")
    if not gate < quarantine < accept:
        raise AssertionError("a failed post-publication recheck is not quarantined before acceptance is recorded")
    if "else {" not in body[gate:accept]:
        raise AssertionError("acceptance is not limited to the branch where recheck 2 passed")


def check_quarantine_collision_safe(t):
    helper = function_body(t, "Get-FreeQuarantinePath")
    for needle in ("if (-not (Test-Path -LiteralPath $base)) { return $base }", "for ($n = 2",
                   "if (-not (Test-Path -LiteralPath $candidate)) { return $candidate }"):
        if needle not in helper:
            raise AssertionError("quarantine name is not chosen collision-safely; missing: " + needle)
    mover = function_body(t, "Move-RunToQuarantine")
    move = one(mover, "[System.IO.Directory]::Move($script:FinalLocation, $target)")
    record = one(mover, "$script:FinalLocation = $target")
    if not move < record:
        raise AssertionError("the recorded location changes before the move has succeeded")
    for fixed in ("Move($PublishRoot, $failedRoot)", "Move($EvidenceRoot, $failedRoot)"):
        if fixed in t:
            raise AssertionError("a fixed quarantine name is used as a move target: " + fixed)


def check_catch_quarantine_and_location(t):
    fc = t.index("Invoke-Finalize\n  }\n  catch {")
    catch = t[fc:t.index("Write-Host ('[S2] ' + $Status", fc)]
    for needle in ("if ($FinalLocation -eq $PublishRoot) {", "$q = Move-RunToQuarantine",
                   "elseif ($FinalLocation -eq $EvidenceRoot) {"):
        if needle not in catch:
            raise AssertionError("finalization catch does not track the run location: missing " + needle)
    if "seal-failed" in catch:
        raise AssertionError("finalization catch infers a quarantine location from a path name")
    body = function_body(t, "Invoke-Finalize")
    if "[System.IO.Directory]::Move($EvidenceRoot, $PublishRoot)\n    $script:FinalLocation = $PublishRoot" not in body:
        raise AssertionError("the recorded location is not set immediately after the publication move")
    if "\n  $FinalLocation = $EvidenceRoot\n" not in t:
        raise AssertionError("the recorded location is not set when the working folder is created")


def check_not_executed_form(t):
    if "$Status = 'NOT EXECUTED - ' + $Reason" not in t:
        raise AssertionError("NOT EXECUTED is not assigned in the CAP-02 form 'NOT EXECUTED - <reason>'")
    if "$Status = 'NOT EXECUTED'" in t:
        raise AssertionError("a bare NOT EXECUTED status is assigned")


def runbook_section4(text):
    start = text.index("## 4. Post-run capture and sealing")
    return text[start:text.index("## 5. Publication and what may happen next", start)]


def check_runbook_section4(text):
    sec = runbook_section4(text)
    if RUNBOOK_LEGACY_SEAL in sec or "Get-FileHash" in sec:
        raise AssertionError("runbook section 4 still carries the legacy manual seal command")
    for needle in ("MANIFEST.json", "last line", "RESULT.txt", "seal-failed", "run record"):
        if needle not in sec:
            raise AssertionError("runbook section 4 does not state: " + needle)


def check_no_writes_after_seal(t):
    body = function_body(t, "Invoke-Finalize")
    after = body[body.index("$script:SealHash = (Get-FileHash"):]
    for line in after.split("\n"):
        if line.strip().startswith("Write-Utf8NoBom") and "$RecheckLog" not in line:
            raise AssertionError("a sealed artifact is written after the seal: " + line.strip())
        if "Out-File" in line or "Set-Content" in line or "Add-Content" in line:
            raise AssertionError("a file is written after the seal: " + line.strip())
        if "Write-Log" in line:
            raise AssertionError("a log line is written after the seal")


def check_forbidden_keywords(t):
    for line in code_lines(t):
        if "-Recurse" in line and "Get-ChildItem" not in line and "Get-Artifacts" not in line:
            raise AssertionError("recursive removal or recursive operation outside enumeration: " + line.strip())
        if "Remove-Item" in line and "(Remove-Item Env:NAME)" not in line:
            raise AssertionError("Remove-Item in executable code: " + line.strip())
        for word in ("Set-ExecutionPolicy", "Start-Process", "Stop-Process", "git push", "git commit",
                     "reset --hard", "Invoke-WebRequest", "Invoke-RestMethod"):
            if word in line:
                raise AssertionError(f"forbidden token {word}: " + line.strip())


def check_no_write_enable(t):
    for line in code_lines(t):
        if re.search(r"\$env:(IIPS_|GATE_)", line):
            raise AssertionError("script sets an IIPS_ or GATE_ environment variable: " + line.strip())


def check_p1_absent(t):
    for line in code_lines(t):
        if "V-A2" in line or "P-1" in line:
            raise AssertionError("P-1 reference in executable code: " + line.strip())


def check_governance(t):
    for g in GOVERNANCE:
        if t.count(g) != 1:
            raise AssertionError(f"governance value not found exactly once: {g}")


def check_ascii_lf(raw):
    if any(b > 0x7F for b in raw):
        raise AssertionError("non-ASCII byte in script")
    if b"\r" in raw:
        raise AssertionError("CR byte in script")


def real_text():
    return SCRIPT.read_text(encoding="ascii")


PART_A = [check_required_list, check_dist_archive_retained, check_no_legacy_result_design, check_status_vocabulary,
          check_pass_only_in_sequence, check_finalize_order, check_manifest_last, check_manifest_fields,
          check_result_not_self_hashed, check_publication_gated, check_test_seal_detects,
          check_pf00_both_roots, check_catch_never_passes, check_no_writes_after_seal,
          check_forbidden_keywords, check_no_write_enable, check_p1_absent, check_governance,
          check_post_publication_quarantine, check_not_executed_form,
          check_quarantine_collision_safe, check_catch_quarantine_and_location]


class ProcedureText(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = SCRIPT.read_bytes()
        cls.t = cls.raw.decode("ascii")

    def test_ascii_lf_only(self):
        check_ascii_lf(self.raw)

    def test_required_list(self):
        check_required_list(self.t)

    def test_dist_archive_retained_and_verified(self):
        check_dist_archive_retained(self.t)

    def test_no_legacy_result_design(self):
        check_no_legacy_result_design(self.t)

    def test_status_vocabulary(self):
        check_status_vocabulary(self.t)

    def test_pass_only_in_sequence(self):
        check_pass_only_in_sequence(self.t)

    def test_finalize_order(self):
        check_finalize_order(self.t)

    def test_manifest_last(self):
        check_manifest_last(self.t)

    def test_manifest_fields(self):
        check_manifest_fields(self.t)

    def test_result_not_self_hashed(self):
        check_result_not_self_hashed(self.t)

    def test_publication_gated(self):
        check_publication_gated(self.t)

    def test_post_publication_quarantine(self):
        check_post_publication_quarantine(self.t)

    def test_not_executed_form(self):
        check_not_executed_form(self.t)

    def test_runbook_section4_has_no_legacy_seal_command(self):
        check_runbook_section4(RUNBOOK.read_text(encoding="utf-8"))

    def test_quarantine_collision_safe(self):
        check_quarantine_collision_safe(self.t)

    def test_catch_quarantine_and_location(self):
        check_catch_quarantine_and_location(self.t)

    def test_test_seal_detects(self):
        check_test_seal_detects(self.t)

    def test_pf00_both_roots(self):
        check_pf00_both_roots(self.t)

    def test_catch_never_passes(self):
        check_catch_never_passes(self.t)

    def test_no_writes_after_seal(self):
        check_no_writes_after_seal(self.t)

    def test_forbidden_keywords(self):
        check_forbidden_keywords(self.t)

    def test_no_write_enable(self):
        check_no_write_enable(self.t)

    def test_p1_absent(self):
        check_p1_absent(self.t)

    def test_governance_unchanged(self):
        check_governance(self.t)


# ---------------------------------------------------------------- Part B -----
RUN_ID = "s2-a891802e-TEST"


def _read(path):
    with open(path, encoding="ascii") as fh:
        return fh.read()


def _write(path, text):
    with open(path, "w", encoding="ascii", newline="\n") as fh:
        fh.write(text)


def _append(path, text):
    with open(path, "a", encoding="ascii") as fh:
        fh.write(text)


def sha256_upper(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest().upper()


def artifacts(root):
    out = []
    for dirpath, _, files in os.walk(root):
        for f in files:
            full = os.path.join(dirpath, f)
            rel = os.path.relpath(full, root).replace(os.sep, "/")
            out.append((rel, sha256_upper(full), os.path.getsize(full)))
    return sorted(out)


def model_finalize(root, status, reason, required=REQUIRED):
    """Mirror of Invoke-Finalize steps 1-5. Returns (status, seal_hash)."""
    if status == "PASS":
        missing = [n for n in required if not (os.path.exists(os.path.join(root, n)) and os.path.getsize(os.path.join(root, n)) > 0)]
        extra = [r for r, _, _ in artifacts(root) if r not in required]
        if missing:
            status, reason = "FAIL", "required evidence missing or empty: " + ", ".join(missing)
        elif extra:
            status, reason = "FAIL", "unexpected artifacts in the run folder: " + ", ".join(extra)
    with open(os.path.join(root, "RESULT.txt"), "w", encoding="ascii", newline="\n") as fh:
        fh.write(f"STATUS: {status}\nREASON: {reason}\nRUN ID: {RUN_ID}\n")
    arts = artifacts(root)
    if status == "PASS":
        if [a[0] for a in arts] != sorted(required + ["RESULT.txt"]):
            raise AssertionError("pre-manifest inventory differs from the expected set")
    manifest = {"run_id": RUN_ID, "status": status, "reason": reason,
                "artifacts": [{"path": r, "sha256": h, "bytes": b} for r, h, b in arts]}
    mpath = os.path.join(root, "MANIFEST.json")
    with open(mpath, "w", encoding="ascii", newline="\n") as fh:
        json.dump(manifest, fh, indent=2)
        fh.write("\n")
    mhash = sha256_upper(mpath)
    lines = [f"{h}  {r}" for r, h, _ in arts] + [f"{mhash}  MANIFEST.json"]
    spath = os.path.join(root, "SHA256SUMS.txt")
    with open(spath, "w", encoding="ascii", newline="\n") as fh:
        fh.write("\n".join(lines) + "\n")
    return status, sha256_upper(spath)


def model_test_seal(root, expected_status):
    """Mirror of Test-Seal. Returns the list of findings; empty means clean."""
    out = []
    sums_path = os.path.join(root, "SHA256SUMS.txt")
    man_path = os.path.join(root, "MANIFEST.json")
    res_path = os.path.join(root, "RESULT.txt")
    for p in (sums_path, man_path, res_path):
        if not os.path.exists(p):
            out.append("MISSING control " + os.path.basename(p))
    if out:
        return out
    sums, last = {}, ""
    for line in _read(sums_path).split("\n"):
        if not line:
            continue
        m = re.match(r"^([0-9A-F]{64})  (.+)$", line)
        if not m:
            out.append("MALFORMED " + line)
            continue
        if m.group(2) in sums:
            out.append("DUPLICATE " + m.group(2))
        sums[m.group(2)] = m.group(1)
        last = m.group(2)
    if last != "MANIFEST.json":
        out.append("ORDER MANIFEST.json not last")
    disk = {}
    for rel, h, _ in artifacts(root):
        if rel != "SHA256SUMS.txt":
            disk[rel] = h
    for rel, h in sums.items():
        if rel not in disk:
            out.append("MISSING " + rel)
        elif disk[rel] != h:
            out.append("ALTERED " + rel)
    for rel in disk:
        if rel not in sums:
            out.append("ADDED " + rel)
    try:
        man = json.loads(_read(man_path))
    except Exception:
        out.append("UNREADABLE MANIFEST.json")
        man = None
    if man is not None:
        if man.get("run_id") != RUN_ID:
            out.append("MANIFEST run_id mismatch")
        if man.get("status") != expected_status:
            out.append("MANIFEST status mismatch")
        mapped = {a["path"]: a["sha256"] for a in man.get("artifacts", [])}
        for rel, h in sums.items():
            if rel == "MANIFEST.json":
                continue
            if rel not in mapped:
                out.append("MANIFEST does not list " + rel)
            elif mapped[rel] != h:
                out.append("MANIFEST hash differs " + rel)
        for rel in mapped:
            if rel not in sums:
                out.append("MANIFEST lists unsealed " + rel)
    if not re.search(r"(?m)^STATUS: " + re.escape(expected_status) + r"\r?$", _read(res_path)):
        out.append("RESULT STATUS mismatch")
    return out


def attacker_reseal(root):
    """Rewrite MANIFEST.json and SHA256SUMS.txt over the current payload (what an editor could do)."""
    payload = [(r, h, b) for r, h, b in artifacts(root) if r not in ("MANIFEST.json", "SHA256SUMS.txt")]
    mp = os.path.join(root, "MANIFEST.json")
    manifest = json.loads(_read(mp))
    manifest["artifacts"] = [{"path": r, "sha256": h, "bytes": b} for r, h, b in payload]
    with open(mp, "w", encoding="ascii", newline="\n") as fh:
        json.dump(manifest, fh, indent=2)
        fh.write("\n")
    mhash = sha256_upper(mp)
    with open(os.path.join(root, "SHA256SUMS.txt"), "w", encoding="ascii", newline="\n") as fh:
        fh.write("\n".join([f"{h}  {r}" for r, h, _ in payload] + [f"{mhash}  MANIFEST.json"]) + "\n")


class MoveRefused(OSError):
    """A folder move was refused: the target exists, or an injected failure."""


def dir_move(src, dst, refuse=False):
    """Mirror of [System.IO.Directory]::Move: refuses an existing target and never overwrites it."""
    if refuse:
        raise MoveRefused("folder move refused (injected)")
    if os.path.exists(dst):
        raise MoveRefused("target already exists: " + dst)
    os.rename(src, dst)


def free_quarantine_path(publish_root):
    """Mirror of Get-FreeQuarantinePath: the first free name among <base> and <base>.<n>, n >= 2."""
    base = publish_root + ".seal-failed"
    if not os.path.exists(base):
        return base
    for n in range(2, 1000):
        candidate = f"{base}.{n}"
        if not os.path.exists(candidate):
            return candidate
    raise AssertionError("no free quarantine name")


def model_seal_and_publish(root, parent, run_id, status, inject=None):
    """Model of Invoke-Finalize steps 6-8 and the finalization catch. This is a Python mirror of the
    decision logic, not PowerShell execution. Hooks in `inject`: 'before_recheck1' and 'after_publish'
    receive the folder currently holding the run and may tamper with it; 'quarantine_refused' makes every
    quarantine move fail, including the catch's own attempt."""
    inject = inject or {}
    publish_root = os.path.join(parent, run_id)
    st = {"loc": root, "status": status, "accepted": False, "reason": ""}

    def quarantine():
        target = free_quarantine_path(publish_root)
        dir_move(st["loc"], target, refuse=bool(inject.get("quarantine_refused")))
        st["loc"] = target
        return target

    try:
        if "before_recheck1" in inject:
            inject["before_recheck1"](st["loc"])
        if model_test_seal(st["loc"], status):
            st["status"] = "INVALID"
            q = quarantine()
            st["reason"] = "seal recheck failed before publication; folder not accepted; quarantined at " + q
        else:
            if os.path.exists(publish_root):
                raise AssertionError("publication target already exists")
            dir_move(st["loc"], publish_root)
            st["loc"] = publish_root
            if "after_publish" in inject:
                inject["after_publish"](st["loc"])
            if model_test_seal(st["loc"], status):
                st["status"] = "INVALID"
                q = quarantine()
                st["reason"] = "post-publication seal recheck failed; folder not accepted; quarantined at " + q
            else:
                st["accepted"] = True
    except MoveRefused as exc:
        # Mirror of the finalization catch: the recorded location decides what happens next.
        if st["loc"] == publish_root:
            try:
                where = "quarantined at " + quarantine()
            except MoveRefused as exc2:
                where = ("QUARANTINE FAILED (" + str(exc2) + "); the INVALID run remains at the canonical path "
                         + publish_root + " and must not be used as evidence")
        else:
            where = "the working folder remains at " + st["loc"] + " and is not evidence"
        st["status"] = "INVALID"
        st["accepted"] = False
        st["reason"] = "sealing or publication failed: " + str(exc) + " (" + where + ")"
    return {"status": st["status"], "reason": st["reason"], "location": st["loc"],
            "accepted": st["accepted"], "canonical_exists": os.path.exists(publish_root)}


def _hashes(folder):
    return {r: h for r, h, _ in artifacts(folder)}


class ModelTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.root = os.path.join(self.tmp, RUN_ID + ".inprogress")
        os.makedirs(self.root)
        for n in REQUIRED:
            with open(os.path.join(self.root, n), "w", encoding="ascii") as fh:
                fh.write("evidence " + n + "\n")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def seal(self, status="PASS"):
        return model_finalize(self.root, status, "test")

    def test_clean_pass_verifies_and_publishes(self):
        status, seal_hash = self.seal("PASS")
        self.assertEqual(status, "PASS")
        self.assertEqual(model_test_seal(self.root, "PASS"), [])
        final = os.path.join(self.tmp, RUN_ID)
        os.rename(self.root, final)
        self.assertEqual(model_test_seal(final, "PASS"), [])

    def test_result_is_covered_by_the_seal(self):
        self.seal("PASS")
        sealed = {r for r, _, _ in artifacts(self.root)}
        self.assertIn("RESULT.txt", sealed)
        sums = _read(os.path.join(self.root, "SHA256SUMS.txt"))
        self.assertIn("  RESULT.txt", sums)
        self.assertTrue(sums.rstrip("\n").split("\n")[-1].endswith("  MANIFEST.json"))

    def test_pass_with_missing_required_is_downgraded(self):
        os.remove(os.path.join(self.root, "05b-test-summary.txt"))
        status, _ = self.seal("PASS")
        self.assertEqual(status, "FAIL")
        self.assertIn("STATUS: FAIL", _read(os.path.join(self.root, "RESULT.txt")))

    def test_pass_with_empty_required_is_downgraded(self):
        _write(os.path.join(self.root, "04-build.txt"), "")
        status, _ = self.seal("PASS")
        self.assertEqual(status, "FAIL")

    def test_pass_with_unexpected_extra_file_is_downgraded(self):
        _write(os.path.join(self.root, "stray.txt"), "x")
        status, _ = self.seal("PASS")
        self.assertEqual(status, "FAIL")

    def test_non_pass_outcomes_are_preserved(self):
        for st in ("FAIL", "INCONCLUSIVE", "INVALID", "NOT EXECUTED - PF-01 hostname mismatch"):
            with self.subTest(status=st):
                tmp = tempfile.mkdtemp()
                try:
                    root = os.path.join(tmp, "r")
                    os.makedirs(root)
                    with open(os.path.join(root, "s2-00-run-log.txt"), "w") as fh:
                        fh.write("log\n")
                    got, _ = model_finalize(root, st, "x")
                    self.assertEqual(got, st)
                    self.assertNotEqual(got, "PASS")
                    self.assertEqual(model_test_seal(root, got), [])
                finally:
                    shutil.rmtree(tmp, ignore_errors=True)

    def test_altered_file_is_detected(self):
        self.seal("PASS")
        with open(os.path.join(self.root, "05-guarded-npm-test.txt"), "a") as fh:
            fh.write("tampered\n")
        self.assertTrue(any(f.startswith("ALTERED 05-guarded") for f in model_test_seal(self.root, "PASS")))

    def test_missing_file_is_detected(self):
        self.seal("PASS")
        os.remove(os.path.join(self.root, "02-npm-ci.txt"))
        self.assertTrue(any(f.startswith("MISSING 02-npm") for f in model_test_seal(self.root, "PASS")))

    def test_added_file_is_detected(self):
        self.seal("PASS")
        with open(os.path.join(self.root, "RESULT.txt.tmp"), "w") as fh:
            fh.write("stale\n")
        self.assertTrue(any(f.startswith("ADDED RESULT.txt.tmp") for f in model_test_seal(self.root, "PASS")))

    def test_result_status_changed_after_seal_is_detected(self):
        self.seal("PASS")
        p = os.path.join(self.root, "RESULT.txt")
        _write(p, _read(p).replace("STATUS: PASS", "STATUS: FAIL"))
        findings = model_test_seal(self.root, "PASS")
        self.assertTrue(any(f.startswith("ALTERED RESULT.txt") for f in findings))
        self.assertIn("RESULT STATUS mismatch", findings)

    def test_consistent_edit_and_reseal_is_caught_only_by_the_external_seal_hash(self):
        """An attacker who edits MANIFEST.json and rewrites SHA256SUMS.txt to match passes the internal
        checks. The only detection is comparing the seal hash with the value printed at sealing time."""
        _, seal_hash = self.seal("PASS")
        mp = os.path.join(self.root, "MANIFEST.json")
        m = json.loads(_read(mp))
        m["reason"] = "edited"
        with open(mp, "w", encoding="ascii", newline="\n") as fh:
            json.dump(m, fh, indent=2)
            fh.write("\n")
        attacker_reseal(self.root)
        self.assertEqual(model_test_seal(self.root, "PASS"), [])
        self.assertNotEqual(sha256_upper(os.path.join(self.root, "SHA256SUMS.txt")), seal_hash)

    def test_resealed_payload_change_is_caught_only_by_the_external_seal_hash(self):
        _, seal_hash = self.seal("PASS")
        _append(os.path.join(self.root, "05-guarded-npm-test.txt"), "x")
        attacker_reseal(self.root)
        self.assertEqual(model_test_seal(self.root, "PASS"), [])
        self.assertNotEqual(sha256_upper(os.path.join(self.root, "SHA256SUMS.txt")), seal_hash)

    def test_manifest_not_last_is_detected(self):
        self.seal("PASS")
        p = os.path.join(self.root, "SHA256SUMS.txt")
        lines = _read(p).rstrip("\n").split("\n")
        lines = [lines[-1]] + lines[:-1]
        _write(p, "\n".join(lines) + "\n")
        self.assertIn("ORDER MANIFEST.json not last", model_test_seal(self.root, "PASS"))

    def _older_quarantine(self, suffix):
        path = os.path.join(self.tmp, RUN_ID + suffix)
        os.makedirs(path)
        _write(os.path.join(path, "OLDER-RUN.txt"), "older run, not to be touched\n")
        return path

    def _tamper_after_publish(self, snap):
        def tamper(folder):
            _append(os.path.join(folder, "05-guarded-npm-test.txt"), "after publication\n")
            snap["hashes"] = _hashes(folder)
        return tamper

    def _tamper_before_recheck1(self, snap):
        def tamper(folder):
            _append(os.path.join(folder, "03-tsc-noemit.txt"), "late change\n")
            snap["hashes"] = _hashes(folder)
        return tamper

    def test_post_publication_failure_without_existing_quarantine(self):
        # Scenario 1
        self.seal("PASS")
        snap = {}
        r = model_seal_and_publish(self.root, self.tmp, RUN_ID, "PASS", {"after_publish": self._tamper_after_publish(snap)})
        self.assertEqual(r["status"], "INVALID")
        self.assertFalse(r["accepted"])
        self.assertEqual(r["location"], os.path.join(self.tmp, RUN_ID + ".seal-failed"))
        self.assertFalse(r["canonical_exists"])
        self.assertEqual(_hashes(r["location"]), snap["hashes"], "the procedure changed a file while quarantining")
        self.assertIn("STATUS: PASS", _read(os.path.join(r["location"], "RESULT.txt")), "sealed verdict must not be rewritten")

    def test_post_publication_failure_with_existing_quarantine_leaves_older_run_alone(self):
        # Scenario 2
        older = self._older_quarantine(".seal-failed")
        older_before = _hashes(older)
        self.seal("PASS")
        snap = {}
        r = model_seal_and_publish(self.root, self.tmp, RUN_ID, "PASS", {"after_publish": self._tamper_after_publish(snap)})
        self.assertEqual(r["location"], os.path.join(self.tmp, RUN_ID + ".seal-failed.2"))
        self.assertNotEqual(r["location"], older, "the older quarantine was reported as this run")
        self.assertEqual(_hashes(older), older_before, "the older quarantine was modified")
        self.assertEqual(_hashes(r["location"]), snap["hashes"])
        self.assertEqual(r["status"], "INVALID")
        self.assertFalse(r["accepted"])
        self.assertFalse(r["canonical_exists"])

    def test_pre_publication_failure_with_existing_quarantine_leaves_older_run_alone(self):
        # Scenario 3
        older = self._older_quarantine(".seal-failed")
        older_before = _hashes(older)
        self.seal("PASS")
        snap = {}
        r = model_seal_and_publish(self.root, self.tmp, RUN_ID, "PASS", {"before_recheck1": self._tamper_before_recheck1(snap)})
        self.assertEqual(r["location"], os.path.join(self.tmp, RUN_ID + ".seal-failed.2"))
        self.assertEqual(_hashes(older), older_before)
        self.assertEqual(_hashes(r["location"]), snap["hashes"])
        self.assertEqual(r["status"], "INVALID")
        self.assertFalse(r["accepted"])
        self.assertFalse(r["canonical_exists"], "a run that failed recheck 1 reached the canonical path")

    def test_quarantine_refused_after_post_publication_failure_reports_canonical_location(self):
        # Scenario 4a
        self.seal("PASS")
        snap = {}
        r = model_seal_and_publish(self.root, self.tmp, RUN_ID, "PASS",
                                   {"after_publish": self._tamper_after_publish(snap), "quarantine_refused": True})
        self.assertEqual(r["status"], "INVALID")
        self.assertFalse(r["accepted"])
        self.assertEqual(r["location"], os.path.join(self.tmp, RUN_ID), "the reported location is not the real one")
        self.assertTrue(r["canonical_exists"])
        self.assertIn("QUARANTINE FAILED", r["reason"])
        self.assertIn("remains at the canonical path", r["reason"])
        self.assertFalse(os.path.exists(os.path.join(self.tmp, RUN_ID + ".seal-failed")))
        self.assertEqual(_hashes(r["location"]), snap["hashes"])

    def test_quarantine_refused_after_pre_publication_failure_reports_working_folder(self):
        # Scenario 4b
        self.seal("PASS")
        snap = {}
        r = model_seal_and_publish(self.root, self.tmp, RUN_ID, "PASS",
                                   {"before_recheck1": self._tamper_before_recheck1(snap), "quarantine_refused": True})
        self.assertEqual(r["status"], "INVALID")
        self.assertFalse(r["accepted"])
        self.assertEqual(r["location"], self.root)
        self.assertFalse(r["canonical_exists"])
        self.assertIn("remains at", r["reason"])
        self.assertEqual(_hashes(r["location"]), snap["hashes"])

    def test_successful_publication_is_unchanged(self):
        # Scenario 5
        self.seal("PASS")
        before = _hashes(self.root)
        r = model_seal_and_publish(self.root, self.tmp, RUN_ID, "PASS")
        final = os.path.join(self.tmp, RUN_ID)
        self.assertEqual(r["status"], "PASS")
        self.assertTrue(r["accepted"])
        self.assertEqual(r["location"], final)
        self.assertTrue(r["canonical_exists"])
        self.assertFalse(os.path.exists(self.root))
        self.assertFalse(os.path.exists(final + ".seal-failed"))
        self.assertEqual(_hashes(final), before)
        self.assertIn("STATUS: PASS", _read(os.path.join(final, "RESULT.txt")))

    def test_published_non_pass_verdict_is_recorded_not_quarantined(self):
        self.seal("FAIL")
        r = model_seal_and_publish(self.root, self.tmp, RUN_ID, "FAIL")
        self.assertEqual(r["status"], "FAIL")
        self.assertTrue(r["accepted"])
        self.assertEqual(r["location"], os.path.join(self.tmp, RUN_ID))

    def test_free_quarantine_name_skips_every_existing_name(self):
        publish_root = os.path.join(self.tmp, RUN_ID)
        self.assertEqual(free_quarantine_path(publish_root), publish_root + ".seal-failed")
        self._older_quarantine(".seal-failed")
        self._older_quarantine(".seal-failed.2")
        self.assertEqual(free_quarantine_path(publish_root), publish_root + ".seal-failed.3")



# ---------------------------------------------------------------- Part C -----
def mutate(text, old, new):
    if text.count(old) != 1:
        raise AssertionError(f"mutation anchor must occur once, found {text.count(old)}: {old[:60]!r}")
    return text.replace(old, new)


def mutate_result_after_seal(t):
    line = "  Write-Utf8NoBom (Join-Path $EvidenceRoot 'RESULT.txt') $resultLines\n"
    t = mutate(t, line, "")
    return mutate(t, "  $script:SealHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sumsPath).Hash\n",
                  "  $script:SealHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sumsPath).Hash\n" + line)


def check_ascii_lf_text(t):
    check_ascii_lf(t.encode("utf-8"))


CONTROLS = [
    ("RESULT.txt written after the seal (outside coverage)", mutate_result_after_seal, check_finalize_order),
    ("PASS assigned inside Invoke-Finalize",
     lambda t: mutate(t, "  Write-Log ('SEAL start: status ' + $script:Status)\n",
                      "  $script:Status = 'PASS'\n  Write-Log ('SEAL start: status ' + $script:Status)\n"),
     check_pass_only_in_sequence),
    ("publication gate removed", lambda t: mutate(t, "  if ($issues -gt 0) {\n    # Recheck 1 failed", "  if ($false) {\n    # Recheck 1 failed"),
     check_publication_gated),
    ("MANIFEST.json not appended to SHA256SUMS.txt",
     lambda t: mutate(t, "  $sumLines += ($manifestHash + '  MANIFEST.json')\n", ""), check_manifest_last),
    ("INCOMPLETE marker reintroduced",
     lambda t: mutate(t, "  $Status = 'PASS'\n  $Reason = 'all S2", "  $Status = 'INCOMPLETE'\n  $Status = 'PASS'\n  $Reason = 'all S2"),
     check_no_legacy_result_design),
    ("status outside the vocabulary",
     lambda t: mutate(t, "    $script:Status = 'INVALID'\n    $q = Move-RunToQuarantine\n    $script:Reason = 'seal recheck failed before",
                      "    $script:Status = 'SUCCESS'\n    $q = Move-RunToQuarantine\n    $script:Reason = 'seal recheck failed before"),
     check_status_vocabulary),
    ("post-publication failure not quarantined",
     lambda t: mutate(t, "      $q = Move-RunToQuarantine\n      $script:Reason = 'post-publication",
                      "      $q = 'skipped'\n      $script:Reason = 'post-publication"),
     check_post_publication_quarantine),
    ("recheck 2 gate removed (acceptance without recheck 2)",
     lambda t: mutate(t, "    if ($issues2 -gt 0) {\n      # Recheck 2 failed", "    if ($false) {\n      # Recheck 2 failed"),
     check_post_publication_quarantine),
    ("finalization catch ignores the canonical path",
     lambda t: mutate(t, "    if ($FinalLocation -eq $PublishRoot) {\n      # The run was published",
                      "    if ($false) {\n      # The run was published"),
     check_catch_quarantine_and_location),
    ("finalization catch infers a misattributed quarantine",
     lambda t: mutate(t, "    elseif ($FinalLocation -eq $EvidenceRoot) {",
                      "    elseif (Test-Path -LiteralPath ($PublishRoot + '.seal-failed')) {\n      $where = 'misattributed'\n    }\n    elseif ($FinalLocation -eq $EvidenceRoot) {"),
     check_catch_quarantine_and_location),
    ("location recorded before the publication move",
     lambda t: mutate(t, "    [System.IO.Directory]::Move($EvidenceRoot, $PublishRoot)\n    $script:FinalLocation = $PublishRoot\n",
                      "    $script:FinalLocation = $PublishRoot\n    [System.IO.Directory]::Move($EvidenceRoot, $PublishRoot)\n"),
     check_catch_quarantine_and_location),
    ("fixed quarantine name reintroduced",
     lambda t: mutate(t, "  if (-not (Test-Path -LiteralPath $base)) { return $base }\n", "  return $base\n"),
     check_quarantine_collision_safe),
    ("recorded location changed before the quarantine move",
     lambda t: mutate(t, "  [System.IO.Directory]::Move($script:FinalLocation, $target)\n  $script:FinalLocation = $target\n",
                      "  $script:FinalLocation = $target\n  [System.IO.Directory]::Move($script:FinalLocation, $target)\n"),
     check_quarantine_collision_safe),
    ("NOT EXECUTED reverted to a bare status",
     lambda t: mutate(t, "    $Status = 'NOT EXECUTED - ' + $Reason", "    $Status = 'NOT EXECUTED'"),
     check_not_executed_form),
    ("ADDED detection removed",
     lambda t: mutate(t, "$Out.Add('ADDED      ' + $rel + ' (on disk, not sealed)')", "$Out.Add('note ' + $rel)"),
     check_test_seal_detects),
    ("MANIFEST-last ORDER detection removed",
     lambda t: mutate(t, "$Out.Add('ORDER      MANIFEST.json is not the last line of SHA256SUMS.txt (last: ' + $last + ')')",
                      "$Out.Add('note order')"),
     check_test_seal_detects),
    ("RESULT status check removed",
     lambda t: mutate(t, "$Out.Add('RESULT.txt STATUS line does not read ' + $ExpectedStatus)", "$Out.Add('note status')"),
     check_test_seal_detects),
    ("catch block produces PASS",
     lambda t: mutate(t, "  $Reason = $message\n  $Status = 'FAIL'\n", "  $Reason = $message\n  $Status = 'PASS'\n"),
     check_catch_never_passes),
    ("finalization catch produces PASS",
     lambda t: mutate(t, "    $Status = 'INVALID'\n    $Reason = 'sealing or publication failed",
                      "    $Status = 'PASS'\n    $Reason = 'sealing or publication failed"),
     check_catch_never_passes),
    ("sealed artifact written after the seal",
     lambda t: mutate(t, "  $script:SealHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sumsPath).Hash\n",
                      "  $script:SealHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sumsPath).Hash\n  Write-Utf8NoBom $manifestPath $mf.ToArray()\n"),
     check_no_writes_after_seal),
    ("PF-00 checks only the working folder",
     lambda t: mutate(t, "  if ((Test-Path -LiteralPath $PublishRoot) -or (Test-Path -LiteralPath $EvidenceRoot)) {",
                      "  if (Test-Path -LiteralPath $EvidenceRoot) {"),
     check_pf00_both_roots),
    ("required artifact dropped from the list",
     lambda t: mutate(t, "'06-package-consumer.txt', 's2-08-post-run-pin.txt', 's2-08b-dist-sha256-after.txt'\n)",
                      "'06-package-consumer.txt', 's2-08-post-run-pin.txt'\n)"),
     check_required_list),
    ("recursive removal introduced",
     lambda t: mutate(t, "$RecheckLog   = Join-Path $EvidenceBase ($RunId + '.seal-recheck.txt')\n",
                      "$RecheckLog   = Join-Path $EvidenceBase ($RunId + '.seal-recheck.txt')\nRemove-Item -LiteralPath $EvidenceRoot -Recurse -Force\n"),
     check_forbidden_keywords),
    ("RESULT.txt hashed by the script",
     lambda t: mutate(t, "  $manifestHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $manifestPath).Hash\n",
                      "  $manifestHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $manifestPath).Hash\n  $resHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $EvidenceRoot 'RESULT.txt')).Hash\n"),
     check_result_not_self_hashed),
    ("MANIFEST host/Node fields removed",
     lambda t: mutate(t, "  $mf.Add('  \"node\": ' + (ConvertTo-JsonText $NodeVersion) + ',')\n", ""),
     check_manifest_fields),
    ("pinned commit changed",
     lambda t: mutate(t, "$PinCommit      = 'a891802e2691bd9c65a67d6abff20d8ce0c26d7d'",
                      "$PinCommit      = '8eec74ae27cda09f3c368b9c299895eae41554db'"),
     check_governance),
    ("environment write-enabling variable set",
     lambda t: mutate(t, "$env:GIT_TERMINAL_PROMPT = '0'\n", "$env:GIT_TERMINAL_PROMPT = '0'\n$env:IIPS_ENABLE_WRITES = '1'\n"),
     check_no_write_enable),
    ("non-ASCII character introduced",
     lambda t: mutate(t, "$ErrorActionPreference = 'Stop'\n", "$ErrorActionPreference = 'Stop' # \u2014\n"), check_ascii_lf_text),
]


class NegativeControls(unittest.TestCase):
    def test_runbook_section4_rejects_reintroduced_legacy_seal_command(self):
        t = RUNBOOK.read_text(encoding="utf-8")
        mutated = t.replace("## 5. Publication and what may happen next",
                            RUNBOOK_LEGACY_SEAL + "\n\n## 5. Publication and what may happen next", 1)
        self.assertNotEqual(mutated, t, "mutation did not change the runbook")
        with self.assertRaises(AssertionError):
            check_runbook_section4(mutated)

    def test_real_script_passes_every_part_a_check(self):
        t = real_text()
        for check in PART_A + [check_ascii_lf_text]:
            with self.subTest(check=check.__name__):
                check(t)

    def test_each_control_is_rejected_by_its_named_check(self):
        base = real_text()
        for label, mut, check in CONTROLS:
            with self.subTest(control=label):
                mutated = mut(base)
                self.assertNotEqual(mutated, base, "mutation did not change the text")
                with self.assertRaises(AssertionError):
                    check(mutated)


if __name__ == "__main__":
    unittest.main()
