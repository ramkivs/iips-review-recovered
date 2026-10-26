#!/usr/bin/env python3
"""Independently verify merged IRR PR #300 commit, CI runs, and all 10 published blobs via GitHub API."""
from __future__ import annotations

import base64
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).with_name("05-pr300-postmerge-publication-readback.json")
REPO = "ramkivs/iips-review-recovered"
PR = 300
TESTED_HEAD = "87390f6dffaad37111fa8c2c88d9128d338122c7"
MERGE = "dbe9874f28f03b31cca4c8b996d3e822a4cf2b29"
HEAD_CI = 40324552331
MAIN_CI = 40324807938
PREFIX = "evidence/integration/cap03-ipd-pr97-pf15-decision-ready-2026-10-26/"
FILES = [
    "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md",
    "docs/integration/IIPS_v3.0_CAP03_PF15_PA_DECISION_ACT_PREPARED_2026-10-26.md",
    "docs/integration/IIPS_v3.0_CAP03_IPD_PR97_AND_IRR_RECEIPT_RECONCILIATION_2026-10-26.md",
    *[
        PREFIX + name
        for name in [
            "01-pf15-two-locus-authority-audit.json",
            "02-remote-readback-pr298-pr299-ipd94-ipd97.json",
            "03-ipd-51path-census-and-h12-preservation.json",
            "04-irr-validation-suite-summary.txt",
            "INDEX.md",
            "SHA256SUMS.txt",
            "verify_current_state_and_pf15.py",
        ]
    ],
]


def api(path: str):
    return json.loads(subprocess.check_output(["gh", "api", path], text=True))


def gh_json(*args: str):
    return json.loads(subprocess.check_output(["gh", *args], text=True))


def main() -> None:
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

    # Verify completeness of remote-fetched prepared PF-15 act and tracker
    act_text = subprocess.check_output(
        ["git", "show", f"{MERGE}:docs/integration/IIPS_v3.0_CAP03_PF15_PA_DECISION_ACT_PREPARED_2026-10-26.md"],
        cwd=ROOT,
        text=True,
    )
    for tok in ["PROPOSED — NOT EFFECTIVE", "NOT DESIGNATED", "Option A", "Option B", "PA-PF15-F1", "PA-PF15-F6"]:
        assert tok in act_text

    result = {
        "classification": "POST-MERGE PUBLICATION RECEIPT — INDEPENDENT GITHUB API READ-BACK (PR #300)",
        "pr": PR,
        "merged_at": pr["mergedAt"],
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
    print(f"PASS — PR #{PR} merged_at={pr['mergedAt']} merge={MERGE} tree={merge_tree} parents={parents}")
    for v in verified:
        print(f"  {v['path']}: blob={v['blob_sha1']} bytes={v['bytes']} sha256={v['sha256']}")


if __name__ == "__main__":
    main()
