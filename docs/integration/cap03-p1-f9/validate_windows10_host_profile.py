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
TRACKER = REPO / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
AUTHORITY = ROOT / "IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md"
PF15_ACT = ROOT / "IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"
IRR_ONLY_WORKFLOW = REPO / ".github" / "workflows" / "cap03-revision7-irr-static.yml"
EVIDENCE_ROOT = REPO / "evidence" / "cap03-s2"
RUN_ID = "s2-a891802e-20261028T192516Z"
RUN_DIR = EVIDENCE_ROOT / RUN_ID
EXPECTED_SHA256 = "42253eab76161ecb2452b6b1fca8e629b010131b8bd88dbb5357dc929e084f90"
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
authority = AUTHORITY.read_text(encoding="utf-8")
report = (ROOT / "IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md").read_text(encoding="utf-8")
readme = (ROOT / "cap03-p1-f9" / "README.md").read_text(encoding="utf-8")
tracker = TRACKER.read_text(encoding="utf-8")
pf15_act = PF15_ACT.read_text(encoding="utf-8")
irr_only_workflow = IRR_ONLY_WORKFLOW.read_text(encoding="utf-8")
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
require("IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02" in pf15_act and
        "C:\\iips-data\\iips\\user-portfolio.sqlite" in pf15_act,
        "effective corrected PF-15 F4 source does not match the bound store literal")
for text, message in [
    ("$EvidenceRootDesignationState = 'PA_DESIGNATION_REQUIRED'", "missing explicit PA evidence-root gap state"),
    ("$DesignatedEvidenceRoot = 'NOT DESIGNATED'", "missing non-path evidence-root sentinel"),
    ("$SelectedWritabilityMethod = 'ACL_EVALUATION'", "Q-WRITE method is not fixed to read-only ACL_EVALUATION"),
]:
    require(text in source, message)
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
require(not re.search(r"\$DesignatedEvidenceRoot\s*=\s*'(?!(?:NOT DESIGNATED))", source),
        "a concrete root was assigned without an effective PA designation")
require("S00-TRACKER-POINTER-PUBLISHED" in source and "Invoke-PreClaimTrackerPointer" in source,
        "pre-claim authoritative-main pointer guard is missing")
main_flow = source[source.index("# Main. Control flow"):]
require(main_flow.index("Invoke-PreClaimTrackerPointer") < main_flow.index("Invoke-EvidencePlacement") < main_flow.index("Invoke-ExecuteClaim"),
        "published-main pointer and evidence-root checks must precede any claim acquisition")
placement = source[source.index("function Invoke-EvidencePlacement"):source.index("function Invoke-StorePlacement")]
require(placement.index("S00-EVIDENCE-ROOT-DESIGNATED") < placement.index("Get-CanonicalPath -Path $EvidenceRoot"),
        "S00 must refuse before canonicalizing or touching an undesignated caller path")

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
    "S00-NO-PRIOR-MARKER", "S02-COMMIT", "S02-TREE", "S02-CLEAN",
    "P1-F-ONE-ATTEMPT", "SECOND_INVOCATION_REFUSED",
    "EXECUTE-MARKER.json", "execute-claim.json",
    "S00-EVIDENCE-NOT-IN-LISTED-WORKTREE", "S03-NO-WORKTREE-CONTAINS-STORE",
]
for guard in required_guards:
    require(guard in source, "required authority/runtime/path/single-attempt guard missing: " + guard)

# S04 uses admitted evidence and an exact read-only existing-dist comparison. It does not rebuild or probe.
for guard in [
    "Invoke-AdmittedS2EvidenceCheck", "S04-S2-AUTHORITY", "S04-S2-NO-REPARSE-IN-CHAIN",
    "S04-S2-NO-REPARSE-FILES", "S04-S2-COMPLETE-INVENTORY", "S04-S2-SEAL-IDENTITY", "S04-S2-SEALED-FILES",
    "S04-S2-MANIFEST-IDENTITY", "S04-S2-RESULT-IDENTITY", "S04-S2-TESTS",
    "S04-S2-PACKAGE-CONSUMER", "S04-S2-DIST-INVENTORY", "S04-CURRENT-DIST-ADMITTED-MATCH",
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
    ("$BaselineIrrCommit    = '238dfa3185fcb77aac1a50e1d8dee60856c9739d'", "reviewed current-main baseline for post-merge freshness changed"),
    ("$P1FEntry             = '100644 blob a90bb00141194608e64503b24d43964bf7ff85a0'", "effective P1-F source entry is not bound to the current main tree"),
    ("$TrackerPointerMarkers = @('**Latest (`CV-CORR-196`'", "current tracker pointer is not revision-bound"),
    ("'docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md'", "reviewed effective P1-F record is not allowlisted for exact-blob freshness checking"),
    ("$TrackerPointerRequiredText = 'P-1 remains **AUTHORIZED'", "freshness check no longer binds the authorized/unspent status"),
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
for required in ("actions/checkout@v4", "actions/setup-python@v5", "python -m py_compile", "validate_windows10_host_profile.py", "pull_request", "branches:", "main"):
    require(required in irr_only_workflow, "IRR-only workflow missing required safe check/trigger: " + required)

# The additive current-main reconciliation preserves current main's full history and Revision 7 branch records.
require(not any(marker in tracker for marker in ("<<<<<<<", "=======", ">>>>>>>")),
        "unresolved merge marker remains in authoritative tracker")
for heading in (
    "## §16.211 — `CV-CORR-191`:",
    "## §16.213 — `CV-CORR-193`:",
    "## §16.214 — `CV-CORR-194`:",
    "## §16.215 — `CV-CORR-195`:",
    "## §16.216 — `CV-CORR-196`:",
):
    require(tracker.count(heading) == 1, "authoritative tracker heading missing/duplicated: " + heading)
for heading in ("## 16.208 CAP-03 P-1 Revision 5", "## 16.209 CAP-03 P-1 Revision 6", "## 16.210 CAP-03 P-1 Revision 7"):
    require(tracker.count(heading) == 1, "branch record not preserved exactly once: " + heading)

# Prove current main's §§16.211/213/214/215 and the original branch history are preserved.
base_commit = "238dfa3185fcb77aac1a50e1d8dee60856c9739d"
branch_commit = "c0e9ce660e063ffccc94c07fdd442c56f56ab9c6"
base_tracker = subprocess.run(
    ["git", "show", f"{base_commit}:{TRACKER.name}"], cwd=REPO,
    check=True, capture_output=True, text=True, encoding="utf-8",
).stdout
branch_tracker = subprocess.run(
    ["git", "show", f"{branch_commit}:{TRACKER.name}"], cwd=REPO,
    check=True, capture_output=True, text=True, encoding="utf-8",
).stdout

def tracker_section(text: str, heading: str, end_heading: str | None = None) -> str:
    start = text.index("\n" + heading) + 1
    end = text.index("\n" + end_heading, start) if end_heading else len(text)
    return text[start:end]

for start, end in (
    ("## §16.211 — `CV-CORR-191`:", "## §16.213 — `CV-CORR-193`:"),
    ("## §16.213 — `CV-CORR-193`:", "## §16.214 — `CV-CORR-194`:"),
    ("## §16.214 — `CV-CORR-194`:", "## §16.215 — `CV-CORR-195`:"),
    ("## §16.215 — `CV-CORR-195`:", None),
):
    base_part = tracker_section(base_tracker, start, end)
    current_part = tracker_section(tracker, start, "## §16.216 — `CV-CORR-196`:")
    require(current_part.startswith(base_part), "current-main register section not byte-preserved before additive overlay: " + start)

def one_record(text: str, heading: str) -> str:
    at = text.index(heading)
    nxt = re.search(r"(?m)^## ", text[at + len(heading):])
    return text[at:at + len(heading) + nxt.start()] if nxt else text[at:]

for section in ("16.208", "16.209", "16.210"):
    heading = f"## {section} CAP-03 P-1 Revision"
    require(one_record(branch_tracker, heading) == one_record(tracker, heading),
            "branch Revision 5–7 section not byte-preserved: " + section)
for verification_id in range(1649, 1662):
    row = f"| `V{verification_id}` |"
    require(tracker.count(row) == 1, "current reconciliation verification row missing/duplicated: " + row)
require(tracker.count("| `2026-10-30` | `CHG-2026-10-30-11` |") == 1 and
        "**Next free after this reconciliation:** `§16.217` / `CV-CORR-197` / `CHG-2026-10-30-12` / `V1662`." in tracker,
        "change-log or next-free pointer is inconsistent with current reconciliation")
first_lines = "\n".join(tracker.splitlines()[:30])
require("**Latest (`CV-CORR-196`, §16.216, `CHG-2026-10-30-11`" in first_lines,
        "Last Updated pointer does not identify the current Revision 7 reconciliation")
require("**Current CAP-03 P-1 / PF-15 status** — *current-state pointer (`CV-CORR-196`, §16.216" in first_lines,
        "CAP-03 current-state pointer does not identify the Revision 7 reconciliation")
require("## §16.207 — `CV-CORR-187`: O-07 closed" in tracker,
        "origin/main O-07 section was lost in additive merge")
for q in ["Q-CONS-2", "Q-CONS-3", "Q-MIG", "Q-TX", "Q-V8", "Q-WRITE", "Q-EV", "Q-BUILD"]:
    require(q in tracker[tracker.index("## §16.216"):], "tracker disposition missing: " + q)
for required in ("No PA act or path is invented", "filesystem-owner designation", "PA-13 E10", "PF-15 F5", "PR #382"):
    require(required in tracker[tracker.index("## §16.216"):], "Q-EV/root/publication boundary missing: " + required)
request_doc = ROOT / "IIPS_v3.0_REPORTS_NP06_C4_HEADER_CLAIM_PA_DECISION_REQUEST_2026-10-30.md"
act_doc = ROOT / "IIPS_V3_REPORTS_NP06_C4_2_HEADER_CLAIM_CLARIFICATION_PA_ACT_EFFECTIVE_2026-10-30.md"
require(request_doc.is_file() and act_doc.is_file() and
        "IIPS-V3-REPORTS-NP06-C4-2-HEADER-CLAIM-CLARIFICATION-PA-ACT-2026-10-30-01" in act_doc.read_text(encoding="utf-8"),
        "current-main D-9 decision request/history or effective C4-2 act is missing")

# Static-check the literal .NET regexes (PowerShell single-quoted literals preserve these backslashes).
dist_hash_pattern = re.search(r"\$distHashes\s*=.*?-match '([^']+)'", source)
dist_map_pattern = re.search(r"\$dm\s*=\s*\[regex\]::Match\(\$line, '([^']+)'\)", source)
require(dist_hash_pattern is not None and dist_map_pattern is not None, "dist inventory regex source not found")
sample = "56FEA1A5850621B4501D3AFB3221B0F55E9B44B7275E9552B306F8F9C9EEB325  \\dist\\src\\persistence\\gateAPrimeProvisioning.js"
require(re.search(dist_hash_pattern.group(1), sample) is not None, "dist hash regex does not match admitted single-separator paths")
parsed = re.fullmatch(dist_map_pattern.group(1), sample)
require(parsed is not None and parsed.group(1).upper() == "56FEA1A5850621B4501D3AFB3221B0F55E9B44B7275E9552B306F8F9C9EEB325" and
        parsed.group(2) == "\\dist\\src\\persistence\\gateAPrimeProvisioning.js",
        "dist inventory parser does not extract exact path/hash from admitted line")

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
require(len(entries) == 17 and "SHA256SUMS.txt" in entries, "admitted S2 folder is not the expected 17-file inventory")
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
print("U-5 remains NOT RUN; exact emitted-entry closure and emitted-migration probes remain NOT RUN")
print("REVISION_7_SCRIPT_SHA256=" + script_sha)
