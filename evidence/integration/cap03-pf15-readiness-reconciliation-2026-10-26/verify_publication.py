#!/usr/bin/env python3
"""Independently verify the merged PR #291 commit, CI and published bytes."""
from __future__ import annotations

import base64
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).with_name("07-publication-readback.json")
REPO = "ramkivs/iips-review-recovered"
MERGE = "5dfcea41490131f86358c38c43b33a281040008c"
TESTED_HEAD = "7a742ee8e8cbba731dc7b9f4ae54cea6f8e023d2"
PR = 291
HEAD_CI = 40282121743
MAIN_CI = 40282327164
PREFIX = "evidence/integration/cap03-pf15-readiness-reconciliation-2026-10-26/"
FILES = [
    "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md",
    "docs/integration/IIPS_v3.0_CAP03_PF15_AUTHORITY_AND_S3_QE_READINESS_RECONCILIATION_2026-10-26.md",
    *[PREFIX + name for name in [
        "01-remote-baseline.json", "02-host-platform-probe.txt", "03-readiness-audit.json",
        "04-main-ci.txt", "05-ipc-source-pin-comparison.txt", "06-irr-checks.txt",
        "INDEX.md", "SHA256SUMS.txt", "validate_readiness.py", "verify_remote_baseline.py",
    ]],
]


def api(path: str):
    return json.loads(subprocess.check_output(["gh", "api", path], text=True))


def gh_json(*args: str):
    return json.loads(subprocess.check_output(["gh", *args], text=True))

pr = gh_json("pr", "view", str(PR), "--json", "state,mergedAt,mergeCommit,headRefOid")
assert pr["state"] == "MERGED" and pr["mergeCommit"]["oid"] == MERGE and pr["headRefOid"] == TESTED_HEAD
commit = api(f"repos/{REPO}/commits/{MERGE}")
assert commit["sha"] == MERGE
merge_tree = commit["commit"]["tree"]["sha"]
parents = [p["sha"] for p in commit["parents"]]
assert len(parents) == 2 and TESTED_HEAD in parents

runs = []
for run_id, expected_sha, event in [(HEAD_CI, TESTED_HEAD, "pull_request"), (MAIN_CI, MERGE, "push")]:
    run = gh_json("run", "view", str(run_id), "--json", "databaseId,status,conclusion,headSha,event")
    assert run["status"] == "completed" and run["conclusion"] == "success"
    assert run["headSha"] == expected_sha and run["event"] == event
    runs.append(run)

tree = api(f"repos/{REPO}/git/trees/{merge_tree}?recursive=1")
assert not tree.get("truncated")
entries = {entry["path"]: entry for entry in tree["tree"]}
verified = []
for path in FILES:
    entry = entries[path]
    blob = api(f"repos/{REPO}/git/blobs/{entry['sha']}")
    raw = base64.b64decode(blob["content"])
    local = subprocess.check_output(["git", "show", f"{MERGE}:{path}"], cwd=ROOT)
    assert raw == local, f"Remote blob bytes differ from merge commit: {path}"
    verified.append({
        "path": path,
        "blob_sha1": entry["sha"],
        "bytes": len(raw),
        "sha256": hashlib.sha256(raw).hexdigest(),
        "matches_merge_git_object": True,
    })

result = {
    "classification": "POST-MERGE PUBLICATION RECEIPT — INDEPENDENT GITHUB API READ-BACK",
    "pr": PR,
    "merge_commit": MERGE,
    "merge_tree": merge_tree,
    "parents": parents,
    "tested_head": TESTED_HEAD,
    "exact_head_ci": runs[0],
    "post_merge_main_ci": runs[1],
    "remote_paths_verified": len(verified),
    "remote_paths_expected": len(FILES),
    "remote_readback_all_bytes_match": True,
    "records_and_evidence": verified,
}
OUT.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(f"PASS — PR #{PR} merge {MERGE}, tree {merge_tree}; parents={parents}")
print(f"PASS — exact-head CI {HEAD_CI} and post-merge main CI {MAIN_CI} both success")
print(f"PASS — {len(verified)}/{len(FILES)} GitHub API blobs byte-match objects at merge commit")
print(f"Output: {OUT.relative_to(ROOT)}")
