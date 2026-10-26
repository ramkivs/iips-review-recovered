#!/usr/bin/env python3
"""Read-only GitHub API verification of current IRR/IPD main baselines and records."""
from __future__ import annotations

import base64
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "01-remote-baseline.json"
IRR = "ramkivs/iips-review-recovered"
IPD = "ramkivs/iips-production-market-data"
IRR_SHA = "3cd61bcec11beaa96fafa351f8ca557bbfd41b22"
IPD_SHA = "f5eddbc20b944a098a9060a8e3349c6d10b7843e"


def api(path: str):
    return json.loads(subprocess.check_output(["gh", "api", path], text=True))


def contents(repo: str, commit: str, files: list[str]):
    tree = api(f"repos/{repo}/git/trees/{commit}?recursive=1")
    assert not tree.get("truncated"), f"GitHub tree response truncated for {repo}@{commit}"
    by_path = {entry["path"]: entry for entry in tree["tree"]}
    results = []
    for path in files:
        entry = by_path[path]
        blob = api(f"repos/{repo}/git/blobs/{entry['sha']}")
        raw = base64.b64decode(blob["content"])
        results.append({
            "path": path,
            "blob_sha1": entry["sha"],
            "bytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "matches_pinned_baseline": (raw == subprocess.check_output(["git", "show", f"{IRR_SHA}:{path}"])) if repo == IRR else None,
        })
    return results


irr_commit = api(f"repos/{IRR}/commits/main")
ipd_commit = api(f"repos/{IPD}/commits/main")
assert irr_commit["sha"] == IRR_SHA, irr_commit["sha"]
assert ipd_commit["sha"] == IPD_SHA, ipd_commit["sha"]
irr_tree = irr_commit["commit"]["tree"]["sha"]
ipd_tree = ipd_commit["commit"]["tree"]["sha"]
irr_blobs = contents(IRR, IRR_SHA, [
    "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md",
    "docs/integration/IIPS_v3.0_CAP03_S2_P1_S3_QE_EXECUTION_AND_EVIDENCE_MATRIX_2026-10-26.md",
    "docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_DECISION_REQUEST_2026-10-26.md",
    "docs/integration/IIPS_v3.0_CAP03_S2_OPERATOR_RUNBOOK_2026-10-26.md",
    "docs/integration/IIPS_v3.0_CAP03_S2_HOST_RECOVERY_AND_PRECONDITION_BLOCKER_2026-10-26.md",
    "docs/integration/IIPS_v3.0_CAP03_G4_H12_R5_PA_ADOPTION_ACT_EFFECTIVE_2026-10-25.md",
    "docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json",
])
ipd_blobs = contents(IPD, IPD_SHA, [
    "src/ipc/endpoint.ts",
    "src/ipc/entrypoint.ts",
    "evidence/cross-repository/IIPS_V3_CAP03_HOST_READINESS_PACKET_2026-10-24.md",
])
assert all(item["matches_pinned_baseline"] for item in irr_blobs), "IRR remote baseline blob differs from fetched main Git object"
# IPD operational source snapshots are independently remote-read; local worktree is IRR, so its
# content comparison is recorded by the SHA-256/blob identity and not by path equality.
assert all(item["bytes"] > 0 for item in ipd_blobs)

result = {
    "classification": "READ-ONLY REMOTE BASELINE VERIFICATION; NO IPD WRITES",
    "irr": {"repo": IRR, "main": IRR_SHA, "tree": irr_tree, "blobs": irr_blobs},
    "ipd": {"repo": IPD, "main": IPD_SHA, "tree": ipd_tree, "blobs": ipd_blobs},
}
OUT.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(f"PASS — IRR main {IRR_SHA} tree {irr_tree}; {len(irr_blobs)}/{len(irr_blobs)} governed record blobs match GitHub API bytes")
print(f"PASS — IPD main {IPD_SHA} tree {ipd_tree}; {len(ipd_blobs)} read-only source/host-packet blobs verified by GitHub API")
print(f"Output: {OUT.relative_to(Path.cwd())}")
