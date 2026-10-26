#!/usr/bin/env python3
"""Read-only publication read-back for IRR late-adapted §16.139.

Verifies PR #313's merge/CI facts and seven merged artifact blobs through the
GitHub Git Blobs API. Does not self-embed the companion receipt's own merge.
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
REPO = "ramkivs/iips-review-recovered"
PR_NUMBER = 313
HEAD = "0f41aaeca23a48a497dcb69f7bcba607a0ffee11"
MERGE = "4ab046bf539a6f295a466fd60f8597d25a35003a"
TREE = "316a4884367e109e4b97543f2a23eb54f30c6a95"
EXACT_HEAD_CI = 40367807820
POST_MERGE_CI = 40368144849
TRACKER = "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"

# blob, decoded-byte SHA-256 recorded at PR #313's merge
EXPECTED = {
    TRACKER: ("5819fd455bc9aa6f5d647bdc28d0031a4e887e00", "0fa8ed6ab2825f7e1773b1bf103e9bfd7d52098bcc6f94847cc6c3a15c9416e7"),
    "docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_RECONCILIATION_IRR_REVIEW_RECEIPT_2026-10-26.md": ("04b2570d976f6633d5859050826da989ac57af9f", "369f21a0765709a9f86b4459e2649b8a658034d1379b10b280fb9a6843a828a8"),
    "docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_AUTHORITATIVE_STATUS_RECONCILIATION_2026-10-26.md": ("5bcc25a2234bed3c67d93f1b02fc9fbc0047360b", "81c9a210775808f6548dd8ca5430d9bde17b9881dbacad2a8ee789b59e7158ef"),
    "docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_RECONCILIATION_IPD_MIRROR_RECEIPT_2026-10-26.md": ("ea18e9578ee4d0ecccb89282a65fa9ba6f2579e9", "0cad1ba7ac802eb4a2ecb1727cca0ae7c9244f68d03bc6be216310861e4cb2cf"),
    "evidence/integration/cap02-cap03-unified-reconciliation-2026-10-26/TRACKER_PATCH_PROPOSED.diff": ("f1ccc3828999abef539632c148738e8da1e718a2", "9f364f46a0983cbb1d4dca975c756cd30902b1620eb8ae318d4556eba346e356"),
    "evidence/integration/cap02-cap03-unified-reconciliation-irr-review-2026-10-26/00-review-verification.json": ("45b5dfb19916116470982ef656186dae4920fb1d", "a544f53737a013f3e5c74ed5fc77b546804f7ed9add83277fd2a3669911155c9"),
    "evidence/integration/cap02-cap03-unified-reconciliation-irr-review-2026-10-26/verify_review.py": ("f78dff73602cc44cfbb84dd1ea7934790d242716", "bfd53d9fce269dded1c618e82f9a135251cfef3e38f2cb72413feecbfd9bd455"),
}


def gh_json(endpoint: str, jq: str | None = None):
    cmd = ["gh", "api", endpoint]
    if jq:
        cmd += ["--jq", jq]
    return json.loads(subprocess.check_output(cmd, text=True))


def remote_blob_bytes(blob_sha: str) -> bytes:
    raw = subprocess.check_output(
        ["gh", "api", f"repos/{REPO}/git/blobs/{blob_sha}", "--jq", ".content"],
        text=True,
    )
    return base64.b64decode("".join(raw.split()))


checks: list[dict] = []


def check(cid: str, description: str, observed, ok: bool, source: str):
    checks.append({"id": cid, "check": description, "observed": observed, "result": "PASS" if ok else "FAIL", "source": source})


pr = gh_json(f"repos/{REPO}/pulls/{PR_NUMBER}")
merge = gh_json(f"repos/{REPO}/commits/{MERGE}")
check(
    "P1",
    "PR #313 regular merge and exact head",
    {"merged": pr["merged"], "state": pr["state"], "head": pr["head"]["sha"], "merge": pr["merge_commit_sha"], "merged_at": pr["merged_at"]},
    pr["merged"] is True and pr["head"]["sha"] == HEAD and pr["merge_commit_sha"] == MERGE,
    "GitHub Pulls API",
)
check(
    "P2",
    "Merge commit identity and root tree",
    {"sha": merge["sha"], "tree": merge["commit"]["tree"]["sha"], "parents": [p["sha"] for p in merge["parents"]]},
    merge["sha"] == MERGE and merge["commit"]["tree"]["sha"] == TREE and len(merge["parents"]) == 2,
    "GitHub Commits API",
)
head_ci = gh_json(f"repos/{REPO}/actions/runs/{EXACT_HEAD_CI}")
post_ci = gh_json(f"repos/{REPO}/actions/runs/{POST_MERGE_CI}")
check(
    "P3",
    "Exact-head and post-merge main CI succeeded",
    {
        "exact_head": {"id": head_ci["id"], "head_sha": head_ci["head_sha"], "event": head_ci["event"], "conclusion": head_ci["conclusion"]},
        "post_merge": {"id": post_ci["id"], "head_sha": post_ci["head_sha"], "event": post_ci["event"], "conclusion": post_ci["conclusion"]},
    },
    head_ci["status"] == "completed" and head_ci["conclusion"] == "success" and head_ci["head_sha"] == HEAD
    and post_ci["status"] == "completed" and post_ci["conclusion"] == "success" and post_ci["head_sha"] == MERGE,
    "GitHub Actions API",
)

artifacts = []
for path, (blob_sha, expected_sha256) in EXPECTED.items():
    meta = gh_json(f"repos/{REPO}/contents/{path}?ref={MERGE}", "{sha:.sha,size:.size}")
    data = remote_blob_bytes(meta["sha"])
    actual_sha256 = hashlib.sha256(data).hexdigest()
    local_match = (ROOT / path).read_bytes() == data
    ok = meta["sha"] == blob_sha and actual_sha256 == expected_sha256 and len(data) == meta["size"]
    # The tracker and focused receipt are intentionally allowed to advance in the companion update.
    local_match_required = path not in (
        TRACKER,
        "docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_RECONCILIATION_IRR_REVIEW_RECEIPT_2026-10-26.md",
    )
    if local_match_required:
        ok = ok and local_match
    artifacts.append({
        "path": path,
        "blob": meta["sha"],
        "size": len(data),
        "sha256": actual_sha256,
        "local_match": local_match,
        "local_match_required": local_match_required,
        "result": "PASS" if ok else "FAIL",
    })
check(
    "P4",
    "Seven merged artifacts read back byte-for-byte by Git Blobs API",
    artifacts,
    all(a["result"] == "PASS" for a in artifacts),
    "GitHub Contents + Git Blobs APIs",
)
current_tracker = (ROOT / TRACKER).read_text()
check(
    "P5",
    "Companion receipt is present once with no self-embedded carrying merge",
    {
        "section_16_139_headings": len(re.findall(r"^## §16\.139\b", current_tracker, re.M)),
        "section_16_139_7_headings": len(re.findall(r"^### 16\.139\.7\b", current_tracker, re.M)),
        "receipt_change_id": current_tracker.count("CHG-2026-10-26-29"),
        "verification_id": current_tracker.count("V970"),
    },
    len(re.findall(r"^## §16\.139\b", current_tracker, re.M)) == 1
    and len(re.findall(r"^### 16\.139\.7\b", current_tracker, re.M)) == 1
    and "CHG-2026-10-26-29" in current_tracker and "V970" in current_tracker,
    "Current governed tracker",
)

result = {
    "record": "IIPS-V3-CAP02-CAP03-UNIFIED-RECONCILIATION-IRR-REVIEW-2026-10-26-01",
    "classification": "independent remote publication read-back; no PA decision or execution",
    "pr": PR_NUMBER,
    "head": HEAD,
    "merge": MERGE,
    "tree": TREE,
    "exact_head_ci": EXACT_HEAD_CI,
    "post_merge_ci": POST_MERGE_CI,
    "checks": checks,
    "artifacts": artifacts,
    "totals": {
        "passed": sum(c["result"] == "PASS" for c in checks),
        "failed": sum(c["result"] == "FAIL" for c in checks),
    },
}
print(json.dumps(result, indent=2, ensure_ascii=False))
sys.exit(0 if result["totals"]["failed"] == 0 else 1)
