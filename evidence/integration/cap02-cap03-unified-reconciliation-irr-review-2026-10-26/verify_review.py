#!/usr/bin/env python3
"""Read-only verification for the IRR late-registration review receipt.

Requires the existing `gh` GitHub connection. Prints JSON; never mutates a repository
or remote, executes no host/S2/P-1/S3/QE action, and changes no PA-owned value.
"""
from __future__ import annotations

import base64
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
IRR = "ramkivs/iips-review-recovered"
IPD = "ramkivs/iips-production-market-data"
BASELINE_IRR_MAIN = "16e215cb30603ecf1058d0e3392a9c6bff15ed7a"
BASELINE_TRACKER_BLOB = "413eb9d21f0cc17b37c1f98286a2afea1cab9d56"
IPD_PR98_MERGE = "4bb9a6541ed636ed4ad5c4895ad506dade01fdba"
IPD_EVIDENCE_TIP = "888eb375eebee01640e44ccdcbb138a71e8c4513"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
RECEIPT = ROOT / "docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_RECONCILIATION_IRR_REVIEW_RECEIPT_2026-10-26.md"
ACT01 = ROOT / "docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_2026-10-26.md"
ACT02 = ROOT / "docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"
COPIED_REPORT = ROOT / "docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_AUTHORITATIVE_STATUS_RECONCILIATION_2026-10-26.md"
COPIED_MIRROR = ROOT / "docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_RECONCILIATION_IPD_MIRROR_RECEIPT_2026-10-26.md"
COPIED_EVIDENCE = ROOT / "evidence/integration/cap02-cap03-unified-reconciliation-2026-10-26"

EXPECTED_BLOBS = {
    "docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_AUTHORITATIVE_STATUS_RECONCILIATION_2026-10-26.md": "5bcc25a2234bed3c67d93f1b02fc9fbc0047360b",
    "docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_RECONCILIATION_IPD_MIRROR_RECEIPT_2026-10-26.md": "ea18e9578ee4d0ecccb89282a65fa9ba6f2579e9",
    "evidence/integration/cap02-cap03-unified-reconciliation-2026-10-26/TRACKER_PATCH_PROPOSED.diff": "f1ccc3828999abef539632c148738e8da1e718a2",
}


def gh_json(endpoint: str, jq: str | None = None):
    cmd = ["gh", "api", endpoint]
    if jq:
        cmd += ["--jq", jq]
    return json.loads(subprocess.check_output(cmd, text=True))


def blob_bytes(repo: str, blob_sha: str) -> bytes:
    out = subprocess.check_output(
        ["gh", "api", f"repos/{repo}/git/blobs/{blob_sha}", "--jq", ".content"],
        text=True,
    )
    return base64.b64decode("".join(out.split()))


def git_blob(path: Path) -> str:
    return subprocess.check_output(["git", "hash-object", str(path)], cwd=ROOT, text=True).strip()


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def f_rows(path: Path) -> list[str]:
    return [line for line in path.read_text().splitlines() if line.startswith("| **F") and " — " in line]


def spans(line: str) -> list[str]:
    return re.findall(r"`([^`]*)`", line)


checks: list[dict] = []


def check(cid: str, description: str, observed, ok: bool, source: str):
    checks.append({"id": cid, "check": description, "observed": observed, "result": "PASS" if ok else "FAIL", "source": source})


# 1. Authoritative baseline and absence of the proposed heading at that baseline.
commit = gh_json(f"repos/{IRR}/commits/{BASELINE_IRR_MAIN}")
base_tracker_bytes = blob_bytes(IRR, BASELINE_TRACKER_BLOB)
base_text = base_tracker_bytes.decode("utf-8")
check(
    "R1",
    "Reviewed IRR main/tree and baseline tracker blob identity",
    {
        "main": commit["sha"],
        "tree": commit["commit"]["tree"]["sha"],
        "tracker_blob": BASELINE_TRACKER_BLOB,
        "bytes": len(base_tracker_bytes),
        "sha256": hashlib.sha256(base_tracker_bytes).hexdigest(),
    },
    commit["sha"] == BASELINE_IRR_MAIN
    and hashlib.sha1(b"blob " + str(len(base_tracker_bytes)).encode() + b"\0" + base_tracker_bytes).hexdigest() == BASELINE_TRACKER_BLOB,
    "GitHub Commits + Git Blobs API",
)
check(
    "R2",
    "No operative §16.139 heading existed at the reviewed baseline",
    {"heading_matches": len(re.findall(r"^## §16\.139\b", base_text, re.M))},
    not re.search(r"^## §16\.139\b", base_text, re.M),
    "Decoded authoritative tracker blob",
)

# 2. IPD PR #98 publication and 403 boundary.
pr98 = gh_json(f"repos/{IPD}/pulls/98")
pr98_body = pr98.get("body") or ""
check(
    "R3",
    "IPD PR #98 merged the reconciliation and proposed IRR patch",
    {
        "state": pr98["state"],
        "merged": pr98["merged"],
        "head": pr98["head"]["sha"],
        "merge": pr98["merge_commit_sha"],
        "merged_at": pr98["merged_at"],
    },
    pr98["state"] == "closed"
    and pr98["merged"] is True
    and pr98["merge_commit_sha"] == IPD_PR98_MERGE
    and "§16.139" in pr98["title"],
    "GitHub Pulls API",
)
check(
    "R4",
    "PR #98 records IRR write failure as HTTP 403 integration scope",
    {"403_in_body": "403" in pr98_body, "resource_scope_text": "Resource not accessible by integration" in pr98_body},
    "403" in pr98_body and "Resource not accessible by integration" in pr98_body,
    "GitHub Pulls API PR #98 body",
)

# 3. Exact copied report/evidence bytes from the replayable IPD tip.
for path, expected in EXPECTED_BLOBS.items():
    p = ROOT / path
    check(
        f"R5:{path.rsplit('/', 1)[-1]}",
        "IRR copy is byte-identical to the IPD published object",
        {"git_blob": git_blob(p), "expected": expected, "sha256": sha256(p), "bytes": p.stat().st_size},
        p.exists() and git_blob(p) == expected,
        f"git hash-object + IPD Git tree {IPD_EVIDENCE_TIP[:12]}",
    )
sums = COPIED_EVIDENCE / "SHA256SUMS.txt"
sum_ok = True
for line in sums.read_text().splitlines():
    digest, name = line.split(None, 1)
    p = COPIED_EVIDENCE / name.strip()
    sum_ok &= p.exists() and hashlib.sha256(p.read_bytes()).hexdigest() == digest
check("R6", "Copied IPD evidence bundle SHA256SUMS reproduces", {"all_match": sum_ok}, sum_ok, "Local byte hashes")

# 4. PF-15 effective designation versus the byte-history defect.
rows1, rows2 = f_rows(ACT01), f_rows(ACT02)
f2 = [s for s in spans(rows2[1]) if "pipe" in s][0]
f4 = [s for s in spans(rows2[3]) if "iips-data" in s][0]
f5 = [s for s in spans(rows2[4]) if "cap03-gate4" in s][0]
metrics = {
    "f_rows_identical": rows1 == rows2,
    "f2": {"len": len(f2), "backslashes": f2.count("\\")},
    "f4": {"len": len(f4), "backslashes": f4.count("\\")},
    "f5": {"len": len(f5), "backslashes": f5.count("\\")},
    "act02_blob": git_blob(ACT02),
    "act02_sha256": sha256(ACT02),
}
check(
    "R7",
    "F1–F6 rows identical; effective act -02 has canonical code-point spans",
    metrics,
    rows1 == rows2
    and (len(f2), f2.count("\\")) == (31, 4)
    and (len(f4), f4.count("\\")) == (39, 3)
    and (len(f5), f5.count("\\")) == (28, 2)
    and git_blob(ACT02) == "3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d",
    "Live IRR act files + git hash-object",
)
tracker_text = TRACKER.read_text()
check(
    "R8",
    "Later authoritative overlays and the single late §16.139 registration are present",
    {
        "section_16_139_headings": len(re.findall(r"^## §16\.139\b", tracker_text, re.M)),
        "has_16_140_4_p1e": "P-1-E" in tracker_text,
        "has_16_144": "§16.144" in tracker_text,
        "has_16_145": "§16.145" in tracker_text,
        "receipt_exists": RECEIPT.exists(),
    },
    len(re.findall(r"^## §16\.139\b", tracker_text, re.M)) == 1
    and all(s in tracker_text for s in ("P-1-E", "§16.144", "§16.145"))
    and RECEIPT.exists(),
    "Local governed tracker + receipt",
)

result = {
    "record": "IIPS-V3-CAP02-CAP03-UNIFIED-RECONCILIATION-IRR-REVIEW-2026-10-26-01",
    "classification": "read-only verification; no PA decision or execution",
    "baseline_irr_main": BASELINE_IRR_MAIN,
    "ipd_pr98_merge": IPD_PR98_MERGE,
    "ipd_evidence_tip": IPD_EVIDENCE_TIP,
    "checks": checks,
    "totals": {
        "passed": sum(c["result"] == "PASS" for c in checks),
        "failed": sum(c["result"] == "FAIL" for c in checks),
    },
}
print(json.dumps(result, indent=2, ensure_ascii=False))
sys.exit(0 if result["totals"]["failed"] == 0 else 1)
