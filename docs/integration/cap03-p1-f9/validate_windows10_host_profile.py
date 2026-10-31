#!/usr/bin/env python3
"""IRR-only static source and admitted-evidence validation for P-1 Revision 7.

Reads tracked IRR source and the already-admitted S2 evidence records only. It does not
parse/execute PowerShell, inspect an IPD checkout or distribution, access a host, build,
install dependencies, run S2, invoke P-1, or create evidence.
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent.parent
SCRIPT = ROOT / "IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1"
RUNNER = ROOT / "cap03-p1-f9" / "CAP03_P1_F9_WindowsFixtureTests.ps1"
CORRECTION_TESTS = ROOT / "cap03-p1-f9" / "CAP03_P1_ConsolidatedCorrection.Tests.ps1"
ARTIFACT_MODULE = ROOT / "cap03-p1-f9" / "CAP03S2DistArtifacts.psm1"
TRANSFER_SCRIPT = ROOT / "IIPS_v3.0_CAP03_S2_DEP_A_HOST_TRANSFER_2026-10-29.ps1"
TRACKER = REPO / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
AUTHORITY = ROOT / "IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md"
PF15_ACT = ROOT / "IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"
QEV_ACT = ROOT / "IIPS_v3.0_CAP03_P1_QEV_RUN_RECORD_ROOT_PA_ACT_2026-10-30.md"
QEV_ACT_ID = "IIPS-V3-CAP03-P1-QEV-RUN-RECORD-ROOT-PA-DESIGNATION-ACT-2026-10-30-01"
OPERATOR_QEV_ID = "IIPS-V3-CAP03-P1-QEV-OPERATOR-VERIFICATION-DACL-ACCEPTANCE-2026-10-30-01"
OPERATOR_QEV_RECORD = ROOT / "IIPS_v3.0_CAP03_P1_QEV_OPERATOR_VERIFICATION_DACL_ACCEPTANCE_2026-10-30.md"
DESIGNATED_EVIDENCE_ROOT = r"H:\IIPS-P1-EVIDENCE"
IRR_ONLY_WORKFLOW = REPO / ".github" / "workflows" / "cap03-revision7-irr-static.yml"
GENERIC_CI_WORKFLOW = REPO / ".github" / "workflows" / "ci.yml"
POST_CI_RECORD = ROOT / "IIPS_v3.0_CAP03_P1_REV7_POST_CI_BOUNDARY_RECONCILIATION_2026-10-30.md"
POST_CI_RECORD_ID = "IIPS-V3-CAP03-P1-REV7-POST-CI-BOUNDARY-RECONCILIATION-2026-10-30-01"
EVIDENCE_ROOT = REPO / "evidence" / "cap03-s2"
RUN_ID = "s2-a891802e-20261028T192516Z"
RUN_DIR = EVIDENCE_ROOT / RUN_ID
EXPECTED_SHA256 = "bc0e3d1da774258ec941b566a1936eeac94d98d83b39659fc33ce2b0a4e0b253"
PREFLIGHT_AUTHORITY_ID = "IIPS-V3-CAP03-P1-REV7-PREFLIGHT-PA-AUTHORIZATION-ACT-2026-10-31-01"
EXPECTED_SEAL_SHA256 = "9D3C09DBDB691C2527A45605DEA20826B4EC2BA2F110985EE3F1033783B5225E"
EXPECTED_DEPOSIT_SHA256 = "FFD0956482427ACB404543E36DAC2705D802B04828E380290232C06129F3AFAD"
EXPECTED_TRANSCRIPT_SHA256 = "D4C5D9431115BF57D824DF465E3D99B11C619BC6D59A3F0974036F3BFCC2F7CA"
EXPECTED_COMMIT = "a891802e2691bd9c65a67d6abff20d8ce0c26d7d"
EXPECTED_TREE = "76f083d7058e170d8212455c03bad1033136ee68"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit("FAIL: " + message)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().upper()


def eol_digest_candidates(data: bytes) -> set[str]:
    text = data.decode("utf-8")
    lf = text.replace("\r\n", "\n").replace("\r", "\n")
    return {sha256(data), sha256(lf.encode("utf-8")), sha256(lf.replace("\n", "\r\n").encode("utf-8"))}


script_bytes = SCRIPT.read_bytes()
require(all(byte < 0x80 for byte in script_bytes), "Revision 7 source is not ASCII")
require(b"\r" not in script_bytes, "Revision 7 source unexpectedly contains CR characters")
source = script_bytes.decode("ascii")
runner = RUNNER.read_text(encoding="utf-8")
correction_tests = CORRECTION_TESTS.read_text(encoding="utf-8")
artifact_module = ARTIFACT_MODULE.read_text(encoding="utf-8")
transfer_script = TRANSFER_SCRIPT.read_text(encoding="utf-8")
authority = AUTHORITY.read_text(encoding="utf-8")
report = (ROOT / "IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md").read_text(encoding="utf-8")
readme = (ROOT / "cap03-p1-f9" / "README.md").read_text(encoding="utf-8")
tracker = TRACKER.read_text(encoding="utf-8")
pf15_act = PF15_ACT.read_text(encoding="utf-8")
qev_act = QEV_ACT.read_text(encoding="utf-8")
irr_only_workflow = IRR_ONLY_WORKFLOW.read_text(encoding="utf-8")
generic_ci_workflow = GENERIC_CI_WORKFLOW.read_text(encoding="utf-8")
post_ci_record = POST_CI_RECORD.read_text(encoding="utf-8")
script_sha = hashlib.sha256(script_bytes).hexdigest()
if EXPECTED_SHA256 != "TO_BE_SET_AFTER_FINAL_EDIT":
    require(script_sha == EXPECTED_SHA256, "Revision 7 source SHA-256 differs from the pinned validator identity")
lines_formatted, bytes_formatted = f"{len(script_bytes.splitlines()):,}", f"{len(script_bytes):,}"
require(f"SHA-256 `{script_sha}`" in report and f"{lines_formatted} LF lines / {bytes_formatted} bytes" in report,
        "companion source-to-script report does not bind the exact Revision 7 identity")
require(f"SHA-256 `{script_sha}`" in tracker and f"{lines_formatted} LF lines / {bytes_formatted} bytes" in tracker,
        "authoritative tracker does not bind the exact Revision 7 identity")
require(f"SHA-256 `{script_sha}`" in readme and f"{lines_formatted} LF lines, {bytes_formatted} bytes" in readme,
        "F9 README does not bind the exact Revision 7 identity")
for document, label in ((report, "source report"), (readme, "F9 README")):
    require(PREFLIGHT_AUTHORITY_ID in document and "PREFLIGHT-PA-AUTHORIZATION-USE.json" in document and
            "exactly one" in document.lower() and "NON-CONSUMING" in document,
            label + " does not record the effective one-time Preflight authority and boundary")

# Exact PA-scoped Windows 10 target; no product allowlist or host spoof.
for text, message in [
    ("$HostProfileRef       = 'IIPS-V3-CAP03-P1-WINDOWS10-PERSONAL-HOST-PROFILE-PA-2026-10-30-01'", "host-profile reference missing"),
    ("$ExpectedProductName  = 'Windows 10 Home Single Language'", "exact Windows 10 product target missing"),
    ("$ExpectedHost         = 'DESKTOP-NO0NHTP'", "designated hostname check changed"),
    ("Require-Check -Id 'S01-PRODUCT' -Pass ([string]$ntKey.ProductName -ceq $ExpectedProductName)", "exact fail-closed product comparison changed"),
    ("$script:Facts.windowsProductName = [string]$ntKey.ProductName", "actual product evidence removed"),
    ("$script:Facts.windowsEditionId = [string]$ntKey.EditionID", "actual edition evidence removed"),
]:
    require(text in source, message)

# Effective authority values and deliberately undesignated run/evidence properties.
for text, message in [
    ("$AuthorityRulingRef         = 'IIPS-V3-CAP03-P1-AUTHORIZATION-ACT-2026-10-29-01'", "P1-F authority reference missing"),
    ("$DesignatedActorLabel       = 'Ramki'", "named PA/operator actor label missing"),
    ("$DesignatedStorePath  = 'C:\\iips-data\\iips\\user-portfolio.sqlite'", "PF-15 F4 store path changed"),
    ("$S2AdmissionRef            = 'PA-06 (tracker section 16.206; authorization record section 3), L2a only'", "PA-06 evidence scope missing"),
    ("$script:Facts.u5Status = 'NOT RUN; WV-04 blocker waived; no IPD build or emitted probe performed'", "U-5 NOT RUN / waiver distinction missing"),
    ("$script:Facts.emittedEntryClosure = 'NOT RUN; exact import-closure probe is not implied by the hash-inventory comparison'", "emitted closure limitation missing"),
    ("$script:Facts.emittedMigrationProbe = 'NOT RUN against emitted files; migration-related suite records are not equivalent'", "emitted migration-probe limitation missing"),
    ("$DesignatedStorePath  = 'C:\\iips-data\\iips\\user-portfolio.sqlite'", "PF-15 F4 store binding is not exact"),
]:
    require(text in source, message)
require("IIPS-V3-CAP03-P1-AUTHORIZATION-ACT-2026-10-29-01" in authority and
        "ADMITTED as L2a evidence for the P-1 chain" in authority and RUN_ID in authority,
        "effective P1-F record ID/admission scope no longer matches the source references")
for required in (PREFLIGHT_AUTHORITY_ID, "Exactly **one invocation**", "NON-CONSUMING",
                 "PA-13 E10 remains optional", "PREFLIGHT-PA-AUTHORIZATION-USE.json",
                 "second Preflight invocation", "P1-F remains AUTHORIZED"):
    require(required in authority, "distinct one-time Preflight PA decision is incomplete: " + required)
act_blob = subprocess.run(["git", "hash-object", str(AUTHORITY)], cwd=REPO,
                          check=True, capture_output=True, text=True, encoding="utf-8").stdout.strip()
require(f"$P1FEntry             = '100644 blob {act_blob}'" in source,
        "script freshness pin does not bind the updated governing PA record blob")
qcons1_record = ROOT / "CAP03_P1_QCONS1_PREFLIGHT_CONSUMPTION_AND_AUTHORITY_RECONCILIATION_2026-10-31.md"
qcons1 = qcons1_record.read_text(encoding="utf-8")
require("NOT AUTHORIZED by the effective acts reviewed" in qcons1 and
        "NON-CONSUMING by implementation semantics" in qcons1 and
        "Proposed, not effective" in qcons1 and
        "S00-PREFLIGHT-AUTHORITY" in qcons1 and
        "AUTHORIZED for one session" in qcons1 and
        PREFLIGHT_AUTHORITY_ID in qcons1 and
        "PREFLIGHT-PA-AUTHORIZATION-USE.json" in qcons1,
        "Q-CONS-1 historical findings or subsequent one-time PA-decision supplement missing")
require("IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02" in pf15_act and
        "C:\\iips-data\\iips\\user-portfolio.sqlite" in pf15_act,
        "effective corrected PF-15 F4 source does not match the bound store literal")
for text, message in [
    ("$EvidenceRootDesignationState = 'DESIGNATED'", "PA-approved Q-EV designation state missing"),
    (f"$DesignatedEvidenceRoot = '{DESIGNATED_EVIDENCE_ROOT}'", "exact PA-designated evidence-root literal missing"),
    ("$SelectedWritabilityMethod = 'ACL_EVALUATION'", "Q-WRITE method is not fixed to read-only ACL_EVALUATION"),
]:
    require(text in source, message)
require(QEV_ACT_ID in qev_act and DESIGNATED_EVIDENCE_ROOT in qev_act and
        "existing personal Windows user account running the authorized operation" in qev_act and
        "Ramki**, sole system owner" in qev_act and "retained permanently" in qev_act and
        "No alternative path, alias, namespace, or root is authoritative" in qev_act,
        "Q-EV PA act does not record the exact approved values/retention/recovery boundaries")
require(QEV_ACT_ID in source and DESIGNATED_EVIDENCE_ROOT in source and
        "S00-EVIDENCE-OWNER-CURRENT-USER" in source,
        "Revision 7 exact-root binding or read-only current-user owner check is missing")
require("$DesignatedWritabilityMethod" not in source and "PARENT_PROBE" not in source,
        "obsolete or mutating writability method remains")
require("S00-EVIDENCE-ROOT-DESIGNATED" in source and "S00-EVIDENCE-ROOT-EQUALS-DESIGNATION" in source,
        "canonical evidence-root fail-closed binding is missing")
for guard in ("S00-EVIDENCE-EXISTS", "S00-EVIDENCE-DRIVE-FIXED-NTFS", "S00-EVIDENCE-NOT-DRIVE-ROOT",
              "S00-EVIDENCE-NO-SUBST-ALIAS", "S00-EVIDENCE-NO-GIT-IN-CHAIN",
              "S00-EVIDENCE-NO-REPARSE-IN-CHAIN", "S00-EVIDENCE-NOT-STORE-CHAIN",
              "S00-EVIDENCE-NOT-IN-STORE-DIR", "S00-STORE-NOT-IN-EVIDENCE"):
    require(guard in source, "future pre-existing-root filesystem safeguard missing: " + guard)
require("D:\\cap03-p1-capture-20261028-01" in authority and
        "C:\\iips-evidence\\cap03-gate4" in pf15_act,
        "PA-13 E10/PF-15 F5 designated roots were not distinguished from the P-1 root")
require("designated operator/security owner" in report and
        "single-attempt claim/marker namespace" in report and
        "No PA record is amended to pretend otherwise" in report,
        "Q-EV exact missing-authority tuple is not documented")
require("S00-TRACKER-POINTER-PUBLISHED" in source and "Invoke-PreClaimTrackerPointer" in source,
        "pre-claim authoritative-main pointer guard is missing")
require(f"$StandalonePreflightAuthorityRef = '{PREFLIGHT_AUTHORITY_ID}'" in source and
        "$PreflightAuthorizationUseMarkerName = 'PREFLIGHT-PA-AUTHORIZATION-USE.json'" in source and
        "function Consume-PreflightAuthorization" in source and
        "[System.IO.FileMode]::CreateNew" in source and
        "S00-PREFLIGHT-AUTHORITY-ALREADY-USED-OR-UNRECORDABLE" in source and
        "preflightAuthorizationConsumed = [bool]$script:PreflightAuthorizationConsumed" in source and
        "NON-CONSUMING (this Preflight invocation does not acquire an Execute claim" in source,
        "exact one-time Preflight authority/use marker or non-consuming P1-F semantics missing")
consume_fn = source[source.index("function Consume-PreflightAuthorization"):source.index("function Write-Log")]
require("$Mode -ne 'Preflight'" in consume_fn and "$EvidenceRoot -ceq $DesignatedEvidenceRoot" in consume_fn and
        "Write-RawFile -Path $script:PreflightAuthorizationMarkerPath" in consume_fn and
        "PREFLIGHT-AUTHORIZATION-USE.json" not in consume_fn,
        "Preflight-use marker function is not mode/root-bound, exclusive, and distinct from Execute namespace")
require("$PreflightAuthorizationUseMarkerName" in consume_fn and
        "executeClaimCreated = $false" in consume_fn and "executeMarkerWritten = $false" in consume_fn and
        "executeProcessStartRequested = $false" in consume_fn,
        "Preflight-use record does not explicitly preserve the P1-F boundary")
main_flow = source[source.index("# Main. Control flow"):]
require(main_flow.index("S00-PREFLIGHT-AUTHORITY") < main_flow.index("Invoke-PreClaimTrackerPointer") <
        main_flow.index("Invoke-EvidencePlacement") < main_flow.index("Consume-PreflightAuthorization") <
        main_flow.index("# Prior-run scan") < main_flow.index("Invoke-ExecuteClaim") <
        main_flow.index("New-Item -ItemType Directory -Path $script:RunDir"),
        "one-use spend point must follow authority/current-main/root-placement gates, precede later S00 scans and run-directory/host work, and remain independent of Execute claim")
require("$script:PreflightAuthorizationConsumed = $true" in source and
        "PREFLIGHT-PA-AUTHORIZATION-USE.json" in source and
        "if ($Mode -eq 'Execute') { Consume-PreflightAuthorization }" not in source and
        "if ($Mode -eq 'Preflight') {\n        $decisionPublished = $text.Contains($StandalonePreflightAuthorityRef)" in source,
        "only Preflight validates/spends its distinct authority; Execute path remains independent")
require("P1-F authorizes Execute only and PA-13 E10 is separate/optional" in source and
        "PA-13 E10 remains optional" in authority,
        "standalone Preflight authority gate does not preserve PA-13 E10 optionality")
require("one-time PA decision authorizes exactly one Revision 7 Preflight" in source[source.index("function Get-DeclaredEffects"):source.index("function Invoke-PostInvocationForensics")],
        "declared effects omit the current one-time Preflight authority boundary")
placement = source[source.index("function Invoke-EvidencePlacement"):source.index("function Invoke-StorePlacement")]
require(placement.index("S00-EVIDENCE-ROOT-DESIGNATED") < placement.index("S00-EVIDENCE-ROOT-EQUALS-DESIGNATION") < placement.index("Get-CanonicalPath -Path $EvidenceRoot"),
        "S00 designation and exact equality must precede canonicalizing/accessing caller path")
require(placement.index("S00-EVIDENCE-NO-REPARSE-IN-CHAIN") < placement.index("S00-EVIDENCE-OWNER-CURRENT-USER") and
        placement.index("S00-STORE-NOT-IN-EVIDENCE") < placement.index("S00-EVIDENCE-OWNER-CURRENT-USER"),
        "read-only root-owner comparison must follow path-integrity/store-separation gates")

# Host/runtime and safety controls remain in source; this is not a host test.
required_guards = [
    "Require-Check -Id 'S01-HOST' -Pass ($hostName -ieq $ExpectedHost)",
    "Require-Check -Id 'S01-NONELEVATED' -Pass (-not $isAdmin)",
    "Require-Check -Id 'S01-ENV-GATE' -Pass ($gateEnv.Count -eq 0)",
    "Require-Check -Id 'S01-ENV-GIT' -Pass ($gitEnv.Count -eq 0)",
    "Require-Check -Id 'S01-ENV-NODEOPTS' -Pass ([string]::IsNullOrEmpty($nodeOpts))",
    "Require-Check -Id 'S01-NODE' -Pass $nodeOk",
    "Require-Check -Id 'S01-SQLITE' -Pass",
    "'^v22\\.(\\d+)\\.(\\d+)$'",
    "S03-STORE-ABSENT", "S03-NO-SIDECAR", "S03-NO-REPARSE-IN-CHAIN",
    "S03-FIXED-NTFS", "S03-NOT-ONEDRIVE-ENV", "S03-WRITE-ACL-EVALUATION", "ACL_EVALUATION", "effectiveAccessVerified = $false", "S00-EVIDENCE-NO-REPARSE-IN-CHAIN",
    "S00-NO-PRIOR-MARKER", "S00-P1F-CONSUMPTION-RECONCILED", "S02-COMMIT", "S02-TREE", "S02-CLEAN",
    "P1-F-ONE-ATTEMPT", "SECOND_INVOCATION_REFUSED",
    "EXECUTE-MARKER.json", "execute-claim.json",
    "S00-EVIDENCE-NOT-IN-LISTED-WORKTREE", "S00-EVIDENCE-OWNER-CURRENT-USER", "Get-Acl -LiteralPath $evFull",
    "evidenceRootOwnerMatchesCurrentUser", "S03-NO-WORKTREE-CONTAINS-STORE",
]
for guard in required_guards:
    require(guard in source, "required authority/runtime/path/single-attempt guard missing: " + guard)

# S04 uses admitted evidence and an exact read-only existing-dist comparison. It does not rebuild or probe.
for guard in [
    "Invoke-AdmittedS2EvidenceCheck", "S04-S2-AUTHORITY", "S04-S2-NO-REPARSE-IN-CHAIN",
    "S04-S2-NO-REPARSE-FILES", "S04-S2-COMPLETE-INVENTORY", "S04-S2-SEAL-IDENTITY", "S04-S2-SEALED-FILES",
    "S04-S2-MANIFEST-IDENTITY", "S04-S2-RESULT-IDENTITY", "S04-S2-TESTS",
    "S04-S2-PACKAGE-CONSUMER", "S04-S2-DIST-INVENTORY", "S04-S2-DIST-INVENTORY-PATHS",
    "S04-S2-DIST-ARTIFACT-RETENTION", "S04-CURRENT-DIST-ADMITTED-MATCH",
    "R-S2-EVIDENCE-NO-REPARSE", "R-S2-EVIDENCE-NO-REPARSE-FILES",
    "R-S2-EVIDENCE-UNCHANGED", "R-CURRENT-DIST-UNCHANGED",
]:
    require(guard in source, "S04 admission/completeness/relevance/fingerprint check missing: " + guard)
require("function Invoke-BuildPreStep" not in source and "$BuildAuthorityRef" not in source,
        "old S04 build-authority gate or build procedure remains")
for forbidden in [
    "Invoke-Capture -Name 'npm-ci'", "Invoke-Capture -Name 'npm-run-build'",
    "probe-migrations-", "Get-ProbeWritable", "PARENT_PROBE",
]:
    require(forbidden not in source, "forbidden IPD build/probe invocation remains: " + forbidden)
require("$DesignatedStorePath  = 'C:\\iips-data\\iips\\user-portfolio.sqlite'" in source,
        "exact PF-15 F4 designated store literal missing")
for text, message in [
    ("$BaselineIrrCommit     = '235b793dcca944fdfca1da166f3d09cc655afb49'", "reviewed current-main baseline for post-merge freshness changed"),
    ("$P1FEntry             = '100644 blob e49bdd4156453971ae6b2bc61c4d2ec1b070f59c'", "effective PA/P1-F source entry is not bound to the current main tree"),
    ("$TrackerPointerMarkers = @('**Latest (`CV-CORR-208`'", "current tracker pointer is not revision-bound"),
    ("'docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md'", "reviewed effective P1-F record is not allowlisted for exact-blob freshness checking"),
    ("$TrackerPointerRequiredText = 'AUTHORIZED'", "freshness check no longer binds an authorized/unspent current pointer"),
]:
    require(text in source, message)
require("NOT CONSUMED (no marker and no process-start request)" in source and
        "any acquired/ambiguous claim is retained" in source and
        "no automatic release or retry" in source,
        "pre-marker consumption/claim-retention decision is missing")
require("CONSUMED (durable marker or process-start request; startup failure still consumes; no retry)" in source,
        "marker/process-start failure consumption rule is missing")
require("execute-claim.json' is never deleted" not in source, "unexpected test-only claim wording")
require("never deleted by this script" in source and "permanently" in source and
        "preMarkerStop    = 'NOT CONSUMED; claim remains retained" in source and
        "releaseRule      = 'no automatic release or retry exists in this script'" in source,
        "claim permanence/no-release/pre-marker contract is missing")
require("SOURCE-ONLY NON-REPEATABILITY ASSURANCE accepted" in source and
        "v2A8LiteralTest          = 'NOT_PERFORMED'" in source and
        "V-A2-8 is NOT reported PASS" in source,
        "Q-V8 source-only disposition or NOT-PASS literal boundary is missing")
# Marker is the durable commit point; marker and single-call counter must precede the only invocation wrapper call.
marker_write = source.index("Write-RawFile -Path (Join-Path $script:RunDir $MarkerName)")
exec_call_increment = source.index("$script:ExecuteCalls = $script:ExecuteCalls + 1", marker_write)
invoke_call = source.index("Invoke-Capture -Name 'p1-execute-SINGLE-ATTEMPT'", exec_call_increment)
require(marker_write < exec_call_increment < invoke_call, "marker/call commitment order changed")
require(source.count("Invoke-Capture -Name 'p1-execute-SINGLE-ATTEMPT'") == 1,
        "more than one Execute process-start call site exists")
# Migration transaction decision must be documented from the prior pinned-source review; no IPD call is made here.
for text in ["Q-MIG is resolved **YES — all 001–004 are required on a fresh store**",
             "Q-TX is resolved **YES — per-migration commits precede and sit outside the one provisioning `BEGIN IMMEDIATE` transaction**",
             "U-5 remains **NOT RUN**"]:
    require(text in report, "Q-MIG/Q-TX/Q-BUILD closure record missing: " + text)
require("S04-CURRENT-DIST-ADMITTED-MATCH" in source and "R-CURRENT-DIST-UNCHANGED" in source,
        "existing distribution match and pre-invocation unchanged check missing")
require("$encoded = ('\\dist\\' + $relative)" in source,
        "current dist inventory paths are not represented with the admitted single-separator path form")


# The supplementary hosted route must remain strictly IRR-local and standard-library-only.
for forbidden in ("npm ci", "npm install", "npm run", "iips-production-market-data", "git clone", "actions/cache"):
    require(forbidden not in irr_only_workflow, "IRR-only workflow contains forbidden dependency access: " + forbidden)
for required in ("actions/checkout@v4", "actions/setup-python@v5", "python -m py_compile", "validate_windows10_host_profile.py", "pull_request", "branches:", "main", "IIPS_v3.0_CAP03_P1_QEV_RUN_RECORD_ROOT_PA_ACT_2026-10-30.md",
                 "IIPS_v3.0_CAP03_P1_QEV_OPERATOR_VERIFICATION_DACL_ACCEPTANCE_2026-10-30.md",
                 "IIPS_v3.0_CAP03_P1_REV7_POST_CI_BOUNDARY_RECONCILIATION_2026-10-30.md",
                 "CAP03_P1_QCONS1_PREFLIGHT_CONSUMPTION_AND_AUTHORITY_RECONCILIATION_2026-10-31.md",
                 "'.github/workflows/ci.yml'"):
    require(required in irr_only_workflow, "IRR-only workflow missing required safe check/trigger: " + required)

# Product CI retains its checks only for frontend/test-guard changes. IRR-only updates must stay on
# the separate dependency-free route; changes to this workflow are covered by that route too.
expected_ci_triggers = """on:
  pull_request:
    paths:
      - 'frontend/**'
      - '.ci/**'
  push:
    branches:
      - main
    paths:
      - 'frontend/**'
      - '.ci/**'
"""
require(expected_ci_triggers in generic_ci_workflow,
        "generic CI is not narrowly path-scoped to frontend/test-guard changes")
ci_trigger_text = generic_ci_workflow.split("\non:\n", 1)[1].split("\n# Read-only:", 1)[0]
require("docs/integration/" not in ci_trigger_text and
        "IIPS_V3_E2E_MASTER_TRACKER" not in ci_trigger_text and
        ".github/workflows/ci.yml" not in ci_trigger_text and
        "workflow_dispatch" not in ci_trigger_text,
        "generic CI trigger allowlist includes an IRR-only path or manual dispatch")
require("run: npm ci --no-audit --no-fund" in generic_ci_workflow and
        "ramkivs/iips-production-market-data" in (REPO / "frontend" / "package.json").read_text(encoding="utf-8"),
        "product CI's IPD-pinned install risk is no longer explicit in its reviewed source")
require(POST_CI_RECORD_ID in post_ci_record and "network access to the IPD GitHub repository during this run is **UNVERIFIED**" in post_ci_record and
        "UNVERIFIED" in post_ci_record and "AUTHORIZED — NOT EXECUTED — UNSPENT" in post_ci_record,
        "post-CI record does not preserve the access uncertainty and P-1 status")

# Reconcile the complete tracker against the latest main snapshot and preserve prior branch records.
require(not any(marker in tracker for marker in ("<<<<<<<", "=======", ">>>>>>>")),
        "unresolved merge marker remains in authoritative tracker")
for heading in (
    "## §16.211 — `CV-CORR-191`:",
    "## §16.213 — `CV-CORR-193`:",
    "## §16.214 — `CV-CORR-194`:",
    "## §16.215 — `CV-CORR-195`:",
    "## §16.216 — `CV-CORR-196`:",
    "## §16.218 — `CV-CORR-198`:",
    "## §16.219 — `CV-CORR-199`:",
    "## §16.220 — `CV-CORR-200`:",
    "## §16.221 — `CV-CORR-201`:",
    "## §16.222 — `CV-CORR-202`:",
    "## §16.223 — `CV-CORR-203`:",
    "## §16.224 — `CV-CORR-204`:",
    "## §16.225 — `CV-CORR-205`:",
    "## §16.226 — `CV-CORR-206`:",
    "## §16.227 — `CV-CORR-207`:",
    "## §16.228 — `CV-CORR-208`:",
    "## §16.229 — `CV-CORR-209`:",
):
    require(tracker.count(heading) == 1, "authoritative tracker heading missing/duplicated: " + heading)
for heading in ("## 16.208 CAP-03 P-1 Revision 5", "## 16.209 CAP-03 P-1 Revision 6", "## 16.210 CAP-03 P-1 Revision 7"):
    require(tracker.count(heading) == 1, "branch record not preserved exactly once: " + heading)

base_commit = "235b793dcca944fdfca1da166f3d09cc655afb49"
allocation_history_commit = "78abb254abe095a1f7b03db58bdd9dd30aba0fbf"
branch_commit = "a63b19b6eb705d209ec0d0e09e73f8cebc60c695"
base_tracker = subprocess.run(
    ["git", "show", f"{base_commit}:{TRACKER.name}"], cwd=REPO,
    check=True, capture_output=True, text=True, encoding="utf-8",
).stdout
branch_tracker = subprocess.run(
    ["git", "show", f"{branch_commit}:{TRACKER.name}"], cwd=REPO,
    check=True, capture_output=True, text=True, encoding="utf-8",
).stdout
qcons1_commit = "29eb2d46b164cbf93bb0e120e978f0ce38bd6e54"
qcons1_tracker = subprocess.run(
    ["git", "show", f"{qcons1_commit}:{TRACKER.name}"], cwd=REPO,
    check=True, capture_output=True, text=True, encoding="utf-8",
).stdout
current_main_commit = "cfbdb61cfbd7391cb40153df188cd6e9aabf958e"
current_main_tracker = subprocess.run(
    ["git", "show", f"{current_main_commit}:{TRACKER.name}"], cwd=REPO,
    check=True, capture_output=True, text=True, encoding="utf-8",
).stdout

# Every P-1-named artifact in this PR must be explicitly allowlisted by the script's post-merge
# freshness guard. This prevents a newly added governance/verification record from making S06
# fail on the authoritative main tree after publication.
changed_pr_paths = subprocess.run(
    ["git", "diff", "--name-only", base_commit, "HEAD"], cwd=REPO,
    check=True, capture_output=True, text=True, encoding="utf-8",
).stdout.splitlines()
review_artifact_block = re.search(r"(?s)\$ReviewArtifactPaths\s*=\s*@\((.*?)\)", source)
require(review_artifact_block is not None, "Revision 7 review-artifact allowlist is missing")
review_artifact_paths = set(re.findall(r"(?m)^\s*'([^']+)'", review_artifact_block.group(1)))
p1_path_pattern = re.compile(r"(?i)(P1|P-1|GATE[_-]A[_-]PRIME|PF-?15|PA[_-]RULING)")
unlisted_p1_paths = [path for path in changed_pr_paths if p1_path_pattern.search(path) and path not in review_artifact_paths]
require(not unlisted_p1_paths,
        "PR adds P-1-named paths missing from the freshness allowlist: " + ", ".join(unlisted_p1_paths))
for artifact in (
    "docs/integration/IIPS_v3.0_CAP03_P1_QEV_OPERATOR_VERIFICATION_DACL_ACCEPTANCE_2026-10-30.md",
    "docs/integration/IIPS_v3.0_CAP03_P1_REV7_POST_CI_BOUNDARY_RECONCILIATION_2026-10-30.md",
    "docs/integration/CAP03_P1_QCONS1_PREFLIGHT_CONSUMPTION_AND_AUTHORITY_RECONCILIATION_2026-10-31.md",
    "docs/integration/cap03-p1-f9/CAP03_P1_F9_WindowsFixtureTests.ps1",
    "docs/integration/cap03-p1-f9/CAP03_P1_ConsolidatedCorrection.Tests.ps1",
    "docs/integration/CAP03_P1_F_CONSOLIDATED_CORRECTION_2026-10-31.md",
    ".github/workflows/cap03-p1-consolidated-windows.yml",
):
    require(artifact in review_artifact_paths, "freshness allowlist misses reviewed PR artifact: " + artifact)
require("$TrackerPointerRequiredText = 'AUTHORIZED'" in source,
        "pre-claim/freshness pointer matcher does not match the current tracker rows")

# Allocation census across all tracked IRR paths at the exact main/branch tips.
def git_grep_count(revision: str, token: str) -> int:
    result = subprocess.run(
        ["git", "grep", "-F", "-n", token, revision, "--"], cwd=REPO,
        capture_output=True, text=True, encoding="utf-8", check=False,
    )
    require(result.returncode in (0, 1), "git grep census failed at " + revision + ": " + token)
    return len(result.stdout.splitlines())

for revision in (allocation_history_commit, branch_commit):
    require(git_grep_count(revision, "## §16.222") == 0,
            "§16.222 already had a Q-EV allocation heading at census baseline " + revision)
    require(git_grep_count(revision, QEV_ACT_ID) == 0,
            "Q-EV PA act ID was already present at census baseline " + revision)
    for number in range(1712, 1724):
        row = f"| `V{number}` |"
        require(git_grep_count(revision, row) == 0,
                "Q-EV verification allocation row collides at census baseline " + revision + ": " + row)
require("Next free after this section: **`§16.222` / `CV-CORR-202` / `CHG-2026-10-30-17` / `V1712`**" in base_tracker,
        "latest main does not declare the expected post-O-05 next-free Q-EV allocation")

def tracker_section(text: str, heading: str, end_heading: str | None = None) -> str:
    start = text.index("\n" + heading) + 1
    end = text.index("\n" + end_heading, start) if end_heading else len(text)
    return text[start:end]

def one_record(text: str, heading: str) -> str:
    at = text.index(heading)
    nxt = re.search(r"(?m)^## ", text[at + len(heading):])
    return text[at:at + len(heading) + nxt.start()] if nxt else text[at:]

# Current main's records and the original Revision 7 branch history are byte-preserved.
for start_heading, end_heading in (
    ("## §16.211 — `CV-CORR-191`:", "## §16.213 — `CV-CORR-193`:"),
    ("## §16.213 — `CV-CORR-193`:", "## §16.214 — `CV-CORR-194`:"),
    ("## §16.214 — `CV-CORR-194`:", "## §16.215 — `CV-CORR-195`:"),
    ("## §16.215 — `CV-CORR-195`:", "## §16.218 — `CV-CORR-198`:"),
    ("## §16.218 — `CV-CORR-198`:", "## §16.219 — `CV-CORR-199`:"),
    ("## §16.219 — `CV-CORR-199`:", "## §16.220 — `CV-CORR-200`:"),
    ("## §16.220 — `CV-CORR-200`:", "## §16.221 — `CV-CORR-201`:"),
):
    require(one_record(tracker, start_heading).startswith(one_record(base_tracker, start_heading)),
            "latest-main tracker section not byte-preserved: " + start_heading)
for section in ("16.208", "16.209", "16.210"):
    heading = f"## {section} CAP-03 P-1 Revision"
    require(one_record(branch_tracker, heading) == one_record(tracker, heading),
            "branch Revision 5–7 section not byte-preserved: " + section)
require(one_record(branch_tracker, "## §16.216 — `CV-CORR-196`:") ==
        one_record(tracker, "## §16.216 — `CV-CORR-196`:"),
        "previously published Revision 7 section §16.216 was not preserved")
for heading in (
    "## §16.222 — `CV-CORR-202`:",
    "## §16.223 — `CV-CORR-203`:",
    "## §16.224 — `CV-CORR-204`:",
    "## §16.225 — `CV-CORR-205`:",
):
    require(one_record(tracker, heading).rstrip() == one_record(base_tracker, heading).rstrip(),
            "latest-main CAP-03 section changed during post-merge reconciliation: " + heading)

o05_heading = "## §16.221 — `CV-CORR-201`: `O-05` publication reconciliation"
require(one_record(tracker, o05_heading).rstrip() == one_record(base_tracker, o05_heading).rstrip(),
        "intervening main O-05 publication section was not preserved byte-for-byte")
o05_change_row = next(line for line in base_tracker.splitlines()
                      if line.startswith("| `2026-10-30` | `CHG-2026-10-30-16` |"))
require(o05_change_row in tracker,
        "intervening main O-05 change-log row was not preserved")
for verification_id in range(1649, 1662):
    row = f"| `V{verification_id}` |"
    require(tracker.count(row) == 1, "current reconciliation verification row missing/duplicated: " + row)
for verification_id in range(1692, 1724):
    row = f"| `V{verification_id}` |"
    require(tracker.count(row) == 1, "main/Q-EV verification row missing/duplicated: " + row)
require(tracker.count("| `2026-10-30` | `CHG-2026-10-30-11` |") == 1 and
        tracker.count("| `2026-10-30` | `CHG-2026-10-30-15` |") == 1 and
        "current/next-free pointer is §16.217/CV-CORR-197/CHG-12/V1662" in tracker and
        "Next free after this section: **`§16.222` / `CV-CORR-202` / `CHG-2026-10-30-17` / `V1712`**" in tracker,
        "historical Revision 7 change-log or latest-main/Q-EV allocation is inconsistent")
first_lines = "\n".join(tracker.splitlines()[:30])
require("**Latest (`CV-CORR-209`, §16.229, `CHG-2026-10-31-08`" in first_lines and
        "**Latest (`CV-CORR-208`" in first_lines and
        PREFLIGHT_AUTHORITY_ID in first_lines and "exactly one capture-only" in first_lines and
        "NON-CONSUMING" in first_lines and DESIGNATED_EVIDENCE_ROOT in first_lines,
        "Last Updated pointer does not preserve Revision 7's fixed compatibility token and current one-time PA boundary")
require("**Current CAP-03 P-1 / PF-15 status** — *pointer (`CV-CORR-210`, §16.230" in first_lines and
        "P1-F consumption state: NOT RECONCILED" in first_lines and
        "prior §16.229 operator-reported S00 stop" in first_lines and "later S04 stop" in first_lines and
        "NOT EXECUTED — UNSPENT" in first_lines and
        "P-1-C remains NOT ESTABLISHED" in first_lines and
        "P-1-D remains DESIGNATED / NOT VERIFIED FOR THE ATTEMPT" in first_lines,
        "CAP-03 current-state pointer does not preserve distinct-stop provenance or unreconciled consumption")
tracker_lines = tracker.splitlines()
latest_pointer_lines = [line for line in tracker_lines if "**Latest (`CV-CORR-208`" in line]
current_status_lines = [line for line in tracker_lines if "**Current CAP-03 P-1 / PF-15 status**" in line]
require(len(latest_pointer_lines) == 1 and len(current_status_lines) == 1 and
        "AUTHORIZED" in current_status_lines[0] and
        re.search(r"(?i)NOT EXECUTED.*UNSPENT", current_status_lines[0]) is not None,
        "Revision 7 S00 current-pointer cardinality/status contract is not satisfied")
require("## §16.207 — `CV-CORR-187`: O-07 closed" in tracker,
        "origin/main O-07 section was lost in additive merge")
for q in ["Q-CONS-2", "Q-CONS-3", "Q-MIG", "Q-TX", "Q-V8", "Q-WRITE", "Q-EV", "Q-BUILD"]:
    require(q in tracker[tracker.index("## §16.216"):], "tracker disposition missing: " + q)
for required in ("No PA act or path is invented", "filesystem-owner designation", "PA-13 E10", "PF-15 F5", "PR #382"):
    require(required in tracker[tracker.index("## §16.216"):tracker.index("## §16.218")],
            "historical Q-EV/root/publication boundary was not preserved: " + required)
current_qev = tracker[tracker.index("## §16.222 — `CV-CORR-202`:"): ]
for required in (QEV_ACT_ID, DESIGNATED_EVIDENCE_ROOT, "existing personal Windows user account running the authorized operation",
                 "Ramki**, sole system owner", "single authorized P-1 attempt only", "retained permanently",
                 "original bytes, hashes, provenance", "NOT VERIFIED", "AUTHORIZED — NOT EXECUTED — UNSPENT",
                 "P-1-C", "P-1-D", "V1712`–`V1723"):
    require(required in current_qev, "current Q-EV act/tracker record is missing: " + required)
require("PASS — merge reconciliation commit `7ced4ad6faf1eaa33bd2fd3d39fcbc7c5ea46f86`" in current_qev and
        "final head/state are read back separately" in current_qev,
        "publication ledger is missing the verified prior PR #382 push/read-back record")
require("PASS — commit `5dd5b9f227be9652f10a99d49887d3e1093929ab` pushed without force" in current_qev and
        "9c0a78baa676275b4a7557aa1ac02ccbc98459d4" in current_qev and
        "mergeStateStatus: UNSTABLE" in current_qev,
        "operator evidence publication ledger is missing the remote commit/tree/PR state read-back")
# Verify the later operator-supplied Q-EV evidence and DACL acceptance without elevating it to execution evidence.
operator_record = OPERATOR_QEV_RECORD.read_text(encoding="utf-8")
for required in (
    OPERATOR_QEV_ID, DESIGNATED_EVIDENCE_ROOT, "Windows PowerShell 5.1",
    "DESKTOP-NO0NHTP\\USER", "S-1-5-21-1872737340-673410177-2240931581-1001",
    "142.31 GB available", "Local fixed disk", "NTFS", "No SUBST mapping detected",
    "not a drive root", "Reparse-point checks", "Git-worktree separation",
    "SQLite-store separation", "OneDrive environment-root check", "owner matches",
    "execute-claim.json", "EXECUTE-MARKER.json", "BUILTIN\\Administrators",
    "NT AUTHORITY\\SYSTEM", "NT AUTHORITY\\Authenticated Users",
    "BUILTIN\\Users", "Modify", "ReadAndExecute", "not blockers",
    "do **not** establish any of the following", "parsing the Revision 7 PowerShell script", "executing Revision 7 S00 or S03", "At the time this operator record was issued, PR #382 was open and unmerged",
    "AUTHORIZED — NOT EXECUTED — UNSPENT", "no permission change",
):
    require(required in operator_record, "operator Q-EV record missing or changed: " + required)
require(OPERATOR_QEV_ID in report and OPERATOR_QEV_ID in readme,
        "source report or README does not reference the current operator evidence record")
require(tracker.count("## §16.223 — `CV-CORR-203`:") == 1,
        "operator evidence tracker heading missing/duplicated")
for verification_id in range(1724, 1738):
    row = f"| `V{verification_id}` |"
    require(tracker.count(row) == 1, "operator evidence verification row missing/duplicated: " + row)

# The operator record uses the declared next-free allocation from the preceding PR head.
prior_qev_commit = "d14d575a15133221d4fb8470b88ee74a1b1a9a7b"
for revision in (allocation_history_commit, prior_qev_commit):
    require(git_grep_count(revision, "## §16.223") == 0,
            "§16.223 already had a heading at operator-record census baseline " + revision)
    require(git_grep_count(revision, OPERATOR_QEV_ID) == 0,
            "operator Q-EV record ID already present at census baseline " + revision)
    for number in range(1724, 1738):
        row = f"| `V{number}` |"
        require(git_grep_count(revision, row) == 0,
                "operator evidence verification allocation row collides at census baseline " + revision)


# The post-CI correction consumes the next free §16.224 allocation after the operator record.
prior_ci_commit = "698920a8c7a43801cafd592129401ea6c399b75d"
for revision in (allocation_history_commit, prior_ci_commit):
    require(git_grep_count(revision, "## §16.224") == 0 and
            git_grep_count(revision, POST_CI_RECORD_ID) == 0,
            "post-CI reconciliation allocation already existed at census baseline " + revision)
    for number in range(1738, 1748):
        row = f"| `V{number}` |"
        require(git_grep_count(revision, row) == 0,
                "post-CI verification allocation row collides at census baseline " + revision)
require(tracker.count("## §16.224 — `CV-CORR-204`:") == 1 and
        tracker.count(POST_CI_RECORD_ID) >= 1,
        "post-CI reconciliation heading or record identity missing/duplicated")
require(tracker.count("## §16.225 — `CV-CORR-205`:") == 1 and
        tracker.count("| `2026-10-31` | `CHG-2026-10-31-04` |") == 1 and
        tracker.count("## §16.226 — `CV-CORR-206`:") == 1 and
        tracker.count("| `2026-10-31` | `CHG-2026-10-31-05` |") == 1,
        "post-merge/CV-CORR-206 allocation or change-log row missing/duplicated")
require(git_grep_count(base_commit, "## §16.226") == 0 and
        "Next free after this record:** `§16.226` / `CV-CORR-206` / `CHG-2026-10-31-05` / `V1761`" in base_tracker,
        "Q-CONS-1 allocation does not match the exact current-main next-free reservation")
require(tracker.count("## §16.228 — `CV-CORR-208`: ") == 1 and
        tracker.count("| `2026-10-31` | `CHG-2026-10-31-07` |") == 1 and
        tracker.count(PREFLIGHT_AUTHORITY_ID) >= 3,
        "one-time Preflight PA decision allocation/change row missing or duplicated")
require("Next free after this section:** `§16.227` / `CV-CORR-207` / `CHG-2026-10-31-06` / `V1773`" in qcons1_tracker,
        "Q-CONS-1 predecessor does not declare the §16.227 allocation consumed by intervening current main")
require(one_record(qcons1_tracker, "## §16.226 — `CV-CORR-206`:").rstrip() ==
        one_record(tracker, "## §16.226 — `CV-CORR-206`:").rstrip(),
        "published Q-CONS-1 predecessor section was modified while adding the new PA decision")
o05_current_heading = "## §16.227 — `CV-CORR-207`: `O-05`"
require(one_record(current_main_tracker, o05_current_heading).rstrip() ==
        one_record(tracker, o05_current_heading).rstrip(),
        "intervening current-main O-05 §16.227 was not preserved byte-for-byte")
require("Next free after this section: **`§16.228` / `CV-CORR-208` / `CHG-2026-10-31-07` / `V1783`**" in current_main_tracker and
        git_grep_count(current_main_commit, "## §16.228") == 0 and
        git_grep_count(current_main_commit, "| `V1783` |") == 0,
        "§16.228/CV-CORR-208/V1783 was not the declared next-free current-main allocation")
require(git_grep_count(qcons1_commit, "## §16.227") == 0 and
        git_grep_count(qcons1_commit, "| `V1773` |") == 0,
        "§16.227/V1773 allocation was already consumed before Q-CONS-1")
for verification_id in range(1783, 1795):
    row = f"| `V{verification_id}` |"
    require(tracker.count(row) == 1, "one-time Preflight verification row missing/duplicated: " + row)
for required in (PREFLIGHT_AUTHORITY_ID, "Exactly one Revision 7 `-Mode Preflight` invocation",
                 "PREFLIGHT-PA-AUTHORIZATION-USE.json", "NOT EXECUTED — UNSPENT",
                 "Gate 4 acceptance not rendered", "Gate 5/CV-52 not initiated",
                 "H-12 / S2-Limb A / DQ-4 / PA-09 unchanged"):
    require(required in tracker[tracker.index("## §16.228 — `CV-CORR-208`:"):],
            "§16.228 decision or governance boundary missing: " + required)
require(tracker.count("| Previous CAP-03 P-1 / PF-15 status snapshot (`CV-CORR-205`, §16.225; historical, superseded by §16.229):") == 1,
        "duplicate CV-CORR-205 current-status row was not retained as an explicitly historical snapshot")
for required in (
    "## §16.229 — `CV-CORR-209`:",
    "26C3E661DDCE2C98153F60156F4D289250192B7B72EEEAAD73A9F3AC61186C17",
    "d1adeb7960c616a1ceb4016f1e822ebd8e3f39cc5772db10974199815e128c2c",
    "S00-TRACKER-POINTER-PUBLISHED pass=False",
    "row count=2",
    "no Execute claim was acquired",
    "no Execute marker was written",
    "operator-reported",
    "Next free after this section:** `§16.230` / `CV-CORR-210` / `CHG-2026-10-31-09` / `V1806`",
):
    require(required in tracker[tracker.index("## §16.229 — `CV-CORR-209`:"):],
            "§16.229 S00 correction record is missing: " + required)
for verification_id in range(1795, 1806):
    row = f"| `V{verification_id}` |"
    require(tracker.count(row) == 1, "S00 correction verification row missing/duplicated: " + row)

for revision in (allocation_history_commit, base_commit):
    require(git_grep_count(revision, "## §16.226") == 0,
            "Q-CONS-1 heading already exists at allocation baseline " + revision)
    for number in range(1761, 1773):
        row = f"| `V{number}` |"
        require(git_grep_count(revision, row) == 0,
                "Q-CONS-1 verification ID collides at " + revision + ": " + row)
for verification_id in range(1748, 1761):
    row = f"| `V{verification_id}` |"
    require(tracker.count(row) == 1, "post-merge verification row missing/duplicated: " + row)
for verification_id in range(1761, 1773):
    row = f"| `V{verification_id}` |"
    require(tracker.count(row) == 1, "Q-CONS-1 verification row missing/duplicated: " + row)
for verification_id in range(1738, 1748):
    row = f"| `V{verification_id}` |"
    require(tracker.count(row) == 1, "post-CI verification row missing/duplicated: " + row)
for required in ("41102065894", "41102065682", "41101977469", "41101976326",
                 "results-receiver.actions.githubusercontent.com", "npm cache", "boundary deviation",
                 "P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT**"):
    require(required in post_ci_record, "post-CI record missing verified evidence or limitation: " + required)

request_doc = ROOT / "IIPS_v3.0_REPORTS_NP06_C4_HEADER_CLAIM_PA_DECISION_REQUEST_2026-10-30.md"
act_doc = ROOT / "IIPS_V3_REPORTS_NP06_C4_2_HEADER_CLAIM_CLARIFICATION_PA_ACT_EFFECTIVE_2026-10-30.md"
require(request_doc.is_file() and act_doc.is_file() and
        "IIPS-V3-REPORTS-NP06-C4-2-HEADER-CLAIM-CLARIFICATION-PA-ACT-2026-10-30-01" in act_doc.read_text(encoding="utf-8"),
        "current-main D-9 decision request/history or effective C4-2 act is missing")

# Static-check the literal .NET regexes (PowerShell single-quoted literals preserve these backslashes).
dist_hash_pattern = re.search(r"\$distHashes\s*=.*?-match '([^']+)'", source)
dist_map_pattern = re.search(r"\$line -notmatch '([^']+)'", artifact_module)
require(dist_hash_pattern is not None and dist_map_pattern is not None, "dist inventory regex source not found")
sample = "56FEA1A5850621B4501D3AFB3221B0F55E9B44B7275E9552B306F8F9C9EEB325  \\dist\\src\\persistence\\gateAPrimeProvisioning.js"
require(re.search(dist_hash_pattern.group(1), sample) is not None, "dist hash regex does not match admitted single-separator paths")
parsed = re.fullmatch(dist_map_pattern.group(1), sample)
require(parsed is not None and parsed.group(1).upper() == "56FEA1A5850621B4501D3AFB3221B0F55E9B44B7275E9552B306F8F9C9EEB325" and
        parsed.group(2) == "src\\persistence\\gateAPrimeProvisioning.js",
        "shared inventory parser does not extract exact relative path/hash from admitted line")
require("$key = $relative.Replace('\\', '/')" in artifact_module and
        "Test-S2DistArchive -ArchivePath $distArchivePath -ExpectedMap $expectedDistMap -ExpectedCount 1140" in source,
        "S04 does not normalize paths and independently read back retained archive bytes")
require("$archiveMember -and $archiveSealMember -and $archivePresent" in source and
        "ARCHIVE_HASH_MISMATCH:" in artifact_module and "ARCHIVE_READ_FAILED:" in artifact_module,
        "S04 archive retention/readability/hash gate is not fail-closed")
require("Import-Module -Name (Join-Path $PSScriptRoot 'cap03-p1-f9\\CAP03S2DistArtifacts.psm1')" in transfer_script and
        "[string]$_.path -ceq 'dist-artifacts.zip'" in transfer_script and
        "Test-S2TransferPathSet -ExpectedPaths $relPaths -ActualPaths $staged" in transfer_script and
        "function Test-S2TransferPathSet" in artifact_module,
        "S2-DEP-A does not use the shared, fixture-testable exact manifest path allowlist")
require("[System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)" in artifact_module and
        "$expectedExact.ContainsKey($name)" in artifact_module,
        "archive readback does not enforce case-sensitive emitted-entry paths")
require("case-different archived path fails exact emitted-entry verification" in correction_tests and
        "early fallback JSON round-trip retains original failure" in correction_tests and
        "intermediate fallback JSON round-trip retains execute count" in correction_tests,
        "consolidated PowerShell fixtures omit exact archive-case or failure-summary JSON regressions")

# The historical F9 fixture runner remains pinned to Revision 5 and is not retargeted or rerun.
old_f9_hash = "7aa52aa407c548940446817b0cb99b9a31c427660af39baf636bd3e59e45e916"
require(old_f9_hash in runner, "historical Revision 5 F9 runner pin was altered")
require("$ProductionHash -cne $ExpectedProductionSha256" in runner,
        "historical F9 runner no longer fails closed on a different production script")
require("$script:ExpectedProductName='Windows 11 Home Single Language'" in runner,
        "historical Revision 5 F9 host fixture was unexpectedly rewritten")

# Verify the PA-06 evidence already admitted and held in IRR. EOL candidates reflect the published CRLF/LF handling;
# this never runs or regenerates S2 and does not inspect any IPD distribution.
entries = {p.name: p.read_bytes() for p in RUN_DIR.iterdir() if p.is_file()}
require(len(entries) == 17 and "SHA256SUMS.txt" in entries, "historical admitted S2 folder is not the expected 17-file inventory")
require("dist-artifacts.zip" not in entries, "historical S2 evidence unexpectedly changed: do not rewrite or fabricate original emitted bytes")
seal_bytes = entries["SHA256SUMS.txt"]
require(EXPECTED_SEAL_SHA256 in eol_digest_candidates(seal_bytes), "admitted S2 seal identity mismatch")
seal_map: dict[str, str] = {}
for line in seal_bytes.decode("utf-8").splitlines():
    if not line:
        continue
    match = re.fullmatch(r"([0-9A-Fa-f]{64})  ([^\\/:*?\"<>|\r\n]+)", line)
    require(match is not None, "malformed or unsafe filename in S2 seal")
    name = match.group(2)
    require(name not in seal_map, "duplicate filename in S2 seal: " + name)
    seal_map[name] = match.group(1).upper()
require(len(seal_map) == 16 and set(entries) == set(seal_map) | {"SHA256SUMS.txt"},
        "S2 sealed-file set is incomplete or contains extras")
for name, digest in seal_map.items():
    require(digest in eol_digest_candidates(entries[name]), "S2 sealed-file digest mismatch: " + name)
manifest = json.loads(entries["MANIFEST.json"])
require(manifest.get("schema") == "IIPS-V3-CAP03-S2-RUN-MANIFEST-v1" and
        manifest.get("run_id") == RUN_ID and manifest.get("status") == "PASS", "S2 manifest identity/status mismatch")
require(manifest.get("pin") == {"commit": EXPECTED_COMMIT, "tree": EXPECTED_TREE} and
        manifest.get("observed") == {"head": EXPECTED_COMMIT, "tree": EXPECTED_TREE}, "S2 execution pin/tree mismatch")
require(manifest.get("node") == "v22.16.0" and manifest.get("npm") == "10.9.2", "S2 runtime identity mismatch")
artifacts = manifest.get("artifacts", [])
require({item.get("path") for item in artifacts} == set(seal_map) - {"MANIFEST.json"},
        "manifest artifact list is not the complete sealed set")
for item in artifacts:
    require(item.get("sha256", "").upper() == seal_map[item["path"]], "manifest/seal digest mismatch: " + item["path"])
result = entries["RESULT.txt"].decode("utf-8")
for text in [
    "STATUS: PASS", f"RUN ID: {RUN_ID}", f"PIN COMMIT: {EXPECTED_COMMIT}", f"PIN TREE: {EXPECTED_TREE}",
    f"OBSERVED HEAD (post-run): {EXPECTED_COMMIT}", f"OBSERVED TREE (post-run): {EXPECTED_TREE}",
    "DIST FILE COUNT: 1140", "GUARD EXECUTED: 930", "GUARD PASSED: 926",
    "PACK SHASUM: cc2aa70186b8fd7bc7255452ac8d8b00d094f53e",
]:
    require(text in result, "S2 RESULT identity/summary field missing: " + text)
for name in ["02-npm-ci.txt", "03-tsc-noemit.txt", "04-build.txt", "06-package-consumer.txt"]:
    require("RETURN CODE: 0" in entries[name].decode("utf-8"), "S2 recorded nonzero/missing result: " + name)
summary = entries["05b-test-summary.txt"].decode("utf-8")
require("GUARD executed 930 passed 926" in summary and "TAP tests 930 pass 926 fail 0 skipped 4" in summary,
        "S2 test summary totals do not match the admitted record")
consumer = entries["06-package-consumer.txt"].decode("utf-8")
require('"result": "PASS"' in consumer and '"shasum": "cc2aa70186b8fd7bc7255452ac8d8b00d094f53e"' in consumer,
        "S2 package-consumer result identity mismatch")
before = entries["s2-04c-dist-sha256-before.txt"].splitlines()
after = entries["s2-08b-dist-sha256-after.txt"].splitlines()
require(len(before) == len(after) == 1140 and before == after, "S2 before/after 1,140-file inventories differ")
for emitted in [
    "\\dist\\src\\persistence\\gateAPrimeProvisioning.js",
    "\\dist\\src\\persistence\\gateAPrimeValidation.js",
    "\\dist\\src\\persistence\\migration_ledger.js",
]:
    require(sum(line.split(b"  ", 1)[1].decode("utf-8") == emitted for line in before) == 1,
            "admitted S2 inventory lacks a unique emitted identity: " + emitted)
host_hashes = (EVIDENCE_ROOT / "deposit-host-hashes.txt").read_bytes()
require(EXPECTED_DEPOSIT_SHA256 in eol_digest_candidates(host_hashes), "host-deposit hash-record identity mismatch")
transcript_path = EVIDENCE_ROOT / f"{RUN_ID}.seal-recheck.txt"
transcript = transcript_path.read_bytes()
require(EXPECTED_TRANSCRIPT_SHA256 in eol_digest_candidates(transcript), "S2 publication transcript identity mismatch")
transcript_text = transcript.decode("utf-8")
for text in ["Recheck 1 issues: 0", "Recheck 2 issues (published folder): 0", "Final status: PASS", "Evidence record published: yes"]:
    require(text in transcript_text, "S2 publication/recheck transcript incomplete: " + text)

print("PASS: exact PA-authorized Windows 10 profile and preserved P-1 safety/path/one-attempt controls")
print("PASS: S04 source validates PA-06 L2a evidence and defines a read-only current-dist match; no build/install/probe invocation")
print("PASS: admitted S2 authority, pin, completeness, hashes, build/test/package records and publication transcript verified")
print("LIMIT: this is IRR-only static validation; no PowerShell parse, IPD inspection, current-dist check, S2 rerun or U-5 PASS")
print("HISTORICAL EMITTED-BYTE RETENTION: PENDING — original dist bytes/archive are absent; fixture verification is not historical verification")
print("U-5 remains NOT RUN; exact emitted-entry closure and emitted-migration probes remain NOT RUN")
print("REVISION_7_SCRIPT_SHA256=" + script_sha)
