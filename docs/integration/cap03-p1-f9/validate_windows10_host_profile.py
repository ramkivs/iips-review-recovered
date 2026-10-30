#!/usr/bin/env python3
"""Static policy check for the PA-authorized Revision 6 Windows 10 host profile.

This reads source text only. It does not parse or execute PowerShell, run the application,
invoke the P-1 entrypoint, access IPD, or test the Windows host/runtime.
"""
from pathlib import Path
import hashlib

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1"
RUNNER = ROOT / "cap03-p1-f9" / "CAP03_P1_F9_WindowsFixtureTests.ps1"
EXPECTED_SHA256 = "9396c7cc9e770a09a248dbd4624a96a6a2c4702f3e0c7a12d3bc0e51fb5f7d4b"

script_bytes = SCRIPT.read_bytes()
if any(byte >= 0x80 for byte in script_bytes):
    raise SystemExit("FAIL: Revision 6 source is not ASCII; Windows PowerShell 5.1 encoding behavior needs explicit handling")
if b"\r" in script_bytes:
    raise SystemExit("FAIL: Revision 6 source unexpectedly contains CR characters")
source = script_bytes.decode("ascii")
runner = RUNNER.read_text(encoding="utf-8")

def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit("FAIL: " + message)

require(hashlib.sha256(script_bytes).hexdigest() == EXPECTED_SHA256,
        "Revision 6 source SHA-256 differs from the documented durable artifact")

# Exact environment-specific target; do not broaden to a product-name allowlist.
require("$HostProfileRef       = 'IIPS-V3-CAP03-P1-WINDOWS10-PERSONAL-HOST-PROFILE-PA-2026-10-30-01'" in source,
        "PA host-profile reference is missing")
require("$ExpectedProductName  = 'Windows 10 Home Single Language'" in source,
        "the exact Windows 10 Home Single Language product target is missing")
require("$ExpectedHost         = 'DESKTOP-NO0NHTP'" in source,
        "the designated host-name check changed")
require("$HostProfileRef + ' requires exact ProductName \"' + $ExpectedProductName" in source,
        "S01-PRODUCT does not report the scoped profile")
require("$script:Facts.windowsProductName = [string]$ntKey.ProductName" in source and
        "$script:Facts.windowsEditionId = [string]$ntKey.EditionID" in source,
        "actual product/edition evidence fields were removed")

# S01 safety predicates remain strict and unchanged apart from the exact target profile.
required_guards = [
    "Require-Check -Id 'S01-HOST' -Pass ($hostName -ieq $ExpectedHost)",
    "Require-Check -Id 'S01-NONELEVATED' -Pass (-not $isAdmin)",
    "Require-Check -Id 'S01-PRODUCT' -Pass ([string]$ntKey.ProductName -ceq $ExpectedProductName)",
    "Require-Check -Id 'S01-ENV-GATE' -Pass ($gateEnv.Count -eq 0)",
    "Require-Check -Id 'S01-ENV-GIT' -Pass ($gitEnv.Count -eq 0)",
    "Require-Check -Id 'S01-ENV-NODEOPTS' -Pass ([string]::IsNullOrEmpty($nodeOpts))",
    "Require-Check -Id 'S01-NODE' -Pass $nodeOk",
    "Require-Check -Id 'S01-SQLITE' -Pass",
    "'^v22\\.(\\d+)\\.(\\d+)$'",
]
for guard in required_guards:
    require(guard in source, "required S01 guard missing or changed: " + guard)

# Filesystem, identity, evidence and single-attempt controls remain present.
for guard in [
    "S03-STORE-ABSENT", "S03-NO-SIDECAR", "S03-NO-REPARSE-IN-CHAIN",
    "S03-FIXED-NTFS", "S03-NOT-ONEDRIVE-ENV", "S00-PREFLIGHT-NO-REPARSE-ENTRY",
    "S00-NO-PRIOR-MARKER", "S02-COMMIT", "S02-TREE", "S02-CLEAN",
    "P1-F-ONE-ATTEMPT", "SECOND_INVOCATION_REFUSED",
]:
    require(guard in source, "required execution/filesystem control missing: " + guard)

# The PA granted implementation authority, not execution authority: safety ruling/build
# designations remain null, preserving fail-closed S00/S04 behavior and the unspent attempt.
for designation in [
    "$AuthorityRulingRef         = $null",
    "$DesignatedActorLabel       = $null",
    "$DesignatedEvidenceRoot     = $null",
    "$DesignatedWritabilityMethod = $null",
    "$BuildAuthorityRef          = $null",
]:
    require(designation in source, "execution authority was unintentionally populated: " + designation)

# Keep the Revision 5 F9 results as history; its hard-pinned runner must refuse Revision 6.
old_f9_hash = "7aa52aa407c548940446817b0cb99b9a31c427660af39baf636bd3e59e45e916"
require(old_f9_hash in runner, "historical Revision 5 F9 runner pin was altered")
require("$ProductionHash -cne $ExpectedProductionSha256" in runner,
        "historical F9 runner no longer fails closed on a different production script")
require("$script:ExpectedProductName='Windows 11 Home Single Language'" in runner,
        "historical Revision 5 F9 host fixture was unexpectedly rewritten")

sha = hashlib.sha256(SCRIPT.read_bytes()).hexdigest()
print("PASS: exact PA-scoped Windows 10 host profile and preserved safety controls")
print("PASS: S00/S04 authority gates remain null; no P-1 execution authority added")
print("PASS: Revision 5 F9 runner remains pinned to its historical production script")
print("REVISION_6_SCRIPT_SHA256=" + sha)
