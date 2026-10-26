#!/usr/bin/env python3
"""Host-independent structural/integrity checks for the CAP-03 readiness records.

This validates documentation and the adopted H-12 manifest only. It performs no host operation,
provisioning, endpoint designation, S3/QE execution, or acceptance.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).with_name("03-readiness-audit.json")
MATRIX = ROOT / "docs/integration/IIPS_v3.0_CAP03_S2_P1_S3_QE_EXECUTION_AND_EVIDENCE_MATRIX_2026-10-26.md"
REQUEST = ROOT / "docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_DECISION_REQUEST_2026-10-26.md"
RUNBOOK = ROOT / "docs/integration/IIPS_v3.0_CAP03_S2_OPERATOR_RUNBOOK_2026-10-26.md"
ADOPTION = ROOT / "docs/integration/IIPS_v3.0_CAP03_G4_H12_R5_PA_ADOPTION_ACT_EFFECTIVE_2026-10-25.md"
MANIFEST = ROOT / "docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json"
SUMS = ROOT / "evidence/integration/cap03-one-pass-continuation-2026-10-26/SHA256SUMS"


def require(condition: bool, message: str, checks: list[str]) -> None:
    if not condition:
        raise AssertionError(message)
    checks.append(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


checks: list[str] = []
matrix = MATRIX.read_text(encoding="utf-8")
request = REQUEST.read_text(encoding="utf-8")
runbook = RUNBOOK.read_text(encoding="utf-8")
adoption = ADOPTION.read_text(encoding="utf-8")
manifest_bytes = MANIFEST.read_bytes()
manifest = json.loads(manifest_bytes)

pf_ids = re.findall(r"^\| PF-(\d{2}) \|", matrix, flags=re.MULTILINE)
qe_rows = re.findall(r"^\| QE-(\d{1,2}) \|([^\n]+)\|$", matrix, flags=re.MULTILINE)
qe_ids = [int(q) for q, _ in qe_rows]
require(pf_ids == [f"{i:02d}" for i in range(1, 18)], "S3 matrix PF-01…PF-17: each row appears exactly once and in order", checks)
require(qe_ids == list(range(1, 12)), "QE matrix QE-1…QE-11: each row appears exactly once and in order", checks)
require(all("NOT RUN" in row for _, row in qe_rows), "Every QE row remains NOT RUN", checks)
require(all(row.count("|") >= 3 for _, row in qe_rows), "Every QE row retains purpose/tier/evidence-ceiling/status columns", checks)
require("Q11-BEFORE.json" in matrix and "Q11-AFTER.json" in matrix, "Digest bookends Q11-BEFORE/Q11-AFTER are specified", checks)
require("N ≥ 10 cold + 10 warm" in matrix, "QE-9 requires at least 10 cold and 10 warm measurements", checks)
require("PASS` · `FAIL` · `INCONCLUSIVE` · `NOT EXECUTED — <reason>` · `INVALID`" in matrix, "All five failure classifications are explicit", checks)
require("LIMITATION" in matrix and "never a PASS" in matrix, "Limitation findings are expressly non-passing", checks)
require(all(f"QE-{n}" in matrix for n in range(1, 12)), "QE item references are complete", checks)

required_request_phrases = [
    "form and exact value", "absolute local-state directory", "IIPS_G3_DATABASE_PATH",
    "Evidence treatment", "MANIFEST.json", "Host verification instructions", "Locus and effectiveness",
    "Option A", "Option B", "PROPOSED — NOT EFFECTIVE", "NOT DESIGNATED",
]
for phrase in required_request_phrases:
    require(phrase in request, f"PF-15 request contains required decision item/option/status: {phrase}", checks)

for n in range(1, 18):
    require(f"PF-{n:02d}" in matrix, f"Preflight PF-{n:02d} explicitly present", checks)
require("| PF-15 | endpoint/state designation" in matrix, "PF-15 is the explicit endpoint/state designation preflight", checks)
require("outside every Git worktree" in runbook, "S2 evidence root must be outside every Git worktree", checks)
require("Do not set `IIPS_G3_IPC_BINDING_PROVISIONED`" in runbook, "S2 runbook preserves no-enabling-flags fence", checks)
require("`8eec74ae27cda09f3c368b9c299895eae41554db`" in runbook, "S2 exact IPD commit pin preserved", checks)
require("`4eba29029f8d95cfe483e615a7047426b298ce50`" in runbook, "S2 exact IPD tree pin preserved", checks)

expected_sha = "d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76"
actual_sha = hashlib.sha256(manifest_bytes).hexdigest()
require(actual_sha == expected_sha, "H-12 R5 manifest exact-byte SHA-256 matches adopted digest", checks)
require(manifest.get("manifest_id") == "G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5", "H-12 R5 manifest identity parses", checks)
require(manifest.get("ipd_entry_count") == 32 and manifest.get("irr_entry_count") == 24 and manifest.get("entry_count") == 56, "H-12 R5 core inventory is 32 IPD + 24 IRR = 56", checks)
require("ADOPTED" in adoption and expected_sha in adoption and "f4649e36a81c7013287810cd3202b99586dbd951" in adoption, "Effective H-12 R5 adoption record binds manifest digest/blob", checks)
require("ABSENT_PENDING_EXECUTION" in adoption, "Effective H-12 adoption keeps evidence-deposit set pending execution", checks)

# Verify every previously published evidence file listed by the previous pass's checksum book.
sum_rows = [line for line in SUMS.read_text(encoding="utf-8").splitlines() if line.strip()]
verified = 0
for line in sum_rows:
    digest, rel = line.split("  ", 1)
    path = SUMS.parent / rel
    require(path.is_file() and sha256(path) == digest, f"Prior evidence checksum matches: {rel}", checks)
    verified += 1

result = {
    "classification": "HOST-INDEPENDENT DOCUMENTATION / CONTENT-INTEGRITY CHECK ONLY — NOT S2, S3, QE OR QUALIFICATION",
    "pf_rows": len(pf_ids),
    "qe_rows": len(qe_rows),
    "qe_statuses": {"NOT RUN": len(qe_rows)},
    "prior_evidence_files_sha256_verified": verified,
    "h12_manifest_sha256": actual_sha,
    "h12_manifest_id": manifest["manifest_id"],
    "h12_core_entries": {"ipd": manifest["ipd_entry_count"], "irr": manifest["irr_entry_count"], "total": manifest["entry_count"]},
    "checks_passed": len(checks),
    "failures": 0,
    "checks": checks,
}
OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"PASS — {len(checks)} assertions; PF {len(pf_ids)}/17; QE {len(qe_rows)}/11 NOT RUN; {verified} prior evidence files SHA-256 verified")
print(f"H-12 R5 manifest SHA-256: {actual_sha}")
print(f"Output: {OUT.relative_to(ROOT)}")
