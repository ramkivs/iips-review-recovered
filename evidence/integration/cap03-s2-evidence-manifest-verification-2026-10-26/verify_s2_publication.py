#!/usr/bin/env python3
"""Independent post-merge read-back for the S2 receipt publication (PR #306).

Fetches IRR main from the remote, resolves each published path's Git blob at
the merge commit, re-downloads the blob bytes through the GitHub Git Blobs
API, and compares SHA-256/size against the tested PR-head bytes (git show).
Also records PR/CI metadata via gh. Writes 02-publication-readback.json.

Performs no S2 execution, test run, build, or manifest generation and does
not access desktop-no0nhtp. Usage:
  verify_s2_publication.py <merge_sha> <tested_head_sha> <pr_number>
"""
import base64
import hashlib
import json
import pathlib
import subprocess
import sys

REPO = "ramkivs/iips-review-recovered"
ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = pathlib.Path(__file__).resolve().parent / "02-publication-readback.json"
PATHS = [
    "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md",
    "docs/integration/IIPS_v3.0_CAP03_S2_EVIDENCE_MANIFEST_VERIFICATION_RECEIPT_2026-10-26.md",
    "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/00-remote-state-reverification.json",
    "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/01-user-reported-windows-manifest-verification.json",
    "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/INDEX.md",
    "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/SHA256SUMS.txt",
    "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/verify_s2_receipt.py",
]
REQUIRED_IN_RECEIPT = [
    "s2-01-npm-ci.txt", "s2-02-tsc-noemit.txt", "s2-03-build.txt",
    "s2-03-dist-count.txt", "s2-03-dist-sha256-before.txt",
    "s2-04-guarded-npm-test.txt", "s2-05-package-consumer.txt",
    "s2-post-run-pin.txt", "s2-dist-sha256-after.txt",
    "windows-session-transcript.txt", "locked during hashing",
    "C5DDFFA24393AED2E391EF8A72E8BFF1F8ECD9576C4349E182B288785F1B2941",
    "9F7C64073A849E57D472C9CA30BB7616D04D1951626E90587241D61A470A85B1",
    "8eec74ae27cda09f3c368b9c299895eae41554db",
    "001c3c80618f2ee1d40e9a90912237e1a06e7b58",
    "399fa44a5f1953c0f61b452420fefb5985426ef1",
    "User-reported Windows verification", "PENDING", "NOT ACCEPTED",
]
REQUIRED_IN_TRACKER = [
    "§16.138", "CV-CORR-118", "CHG-2026-10-26-17",
    "IIPS-V3-CAP03-S2-EVIDENCE-MANIFEST-VERIFICATION-RECEIPT-2026-10-26-01",
] + REQUIRED_IN_RECEIPT[:9]


def run(args, raw=False):
    r = subprocess.run(args, capture_output=True, cwd=ROOT, check=True)
    return r.stdout if raw else r.stdout.decode("utf-8", "strict")


def main():
    merge_sha, head_sha, pr_number = sys.argv[1], sys.argv[2], sys.argv[3]
    run(["git", "fetch", "origin", "main"])
    fetched = run(["git", "rev-parse", "FETCH_HEAD"]).strip()
    assert fetched == merge_sha, f"FETCH_HEAD {fetched} != merge {merge_sha}"

    pr = json.loads(run(["gh", "pr", "view", pr_number, "-R", REPO, "--json",
                         "number,state,mergedAt,mergeCommit,headRefOid,url"]))
    commit = json.loads(run(["gh", "api", f"repos/{REPO}/commits/{merge_sha}"]))
    runs = json.loads(run(["gh", "api",
                           f"repos/{REPO}/actions/runs?per_page=30"]))["workflow_runs"]
    exact = [r for r in runs if r["head_sha"] == head_sha and r["event"] == "pull_request"]
    post = [r for r in runs if r["head_sha"] == merge_sha and r["event"] == "push"]

    files, decoded = [], {}
    for path in PATHS:
        ls = run(["git", "ls-tree", merge_sha, "--", path]).strip().split()
        blob_sha = ls[2]
        blob = json.loads(run(["gh", "api", f"repos/{REPO}/git/blobs/{blob_sha}"]))
        remote_bytes = base64.b64decode(blob["content"])
        head_bytes = run(["git", "show", f"{head_sha}:{path}"], raw=True)
        decoded[path] = remote_bytes
        files.append({
            "path": path,
            "git_blob": blob_sha,
            "bytes": len(remote_bytes),
            "sha256": hashlib.sha256(remote_bytes).hexdigest(),
            "matches_tested_head": remote_bytes == head_bytes,
        })

    receipt_text = decoded[PATHS[1]].decode("utf-8")
    tracker_text = decoded[PATHS[0]].decode("utf-8")
    result = {
        "record_id": "IIPS-V3-CAP03-S2-EVIDENCE-MANIFEST-VERIFICATION-RECEIPT-2026-10-26-01",
        "evidence_file": "02-publication-readback.json",
        "classification": "Arena-independent remote read-back (Git fetch + GitHub Git Blobs API + REST)",
        "repository": REPO,
        "ref": "refs/heads/main",
        "pr": pr,
        "merge_commit": merge_sha,
        "merge_root_tree": commit["commit"]["tree"]["sha"],
        "merge_parents": [p["sha"] for p in commit["parents"]],
        "tested_head": head_sha,
        "exact_head_ci": [{"id": r["id"], "status": r["status"],
                           "conclusion": r["conclusion"]} for r in exact],
        "post_merge_main_ci": [{"id": r["id"], "status": r["status"],
                                "conclusion": r["conclusion"]} for r in post],
        "files": files,
        "all_files_match": all(f["matches_tested_head"] for f in files),
        "receipt_completeness_missing": [s for s in REQUIRED_IN_RECEIPT if s not in receipt_text],
        "tracker_completeness_missing": [s for s in REQUIRED_IN_TRACKER if s not in tracker_text],
        "windows_bytes_note": "This read-back covers only IRR-published documentation bytes. "
                              "Raw Windows evidence-byte read-back remains PENDING / NOT COMPLETE.",
    }
    OUT.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    ok = (result["all_files_match"] and not result["receipt_completeness_missing"]
          and not result["tracker_completeness_missing"]
          and pr["state"] == "MERGED" and pr["mergeCommit"]["oid"] == merge_sha
          and exact and exact[0]["conclusion"] == "success"
          and post and post[0]["conclusion"] == "success")
    print(f"files matched: {sum(f['matches_tested_head'] for f in files)}/{len(files)}; "
          f"receipt missing: {result['receipt_completeness_missing']}; "
          f"tracker missing: {result['tracker_completeness_missing']}; ok={ok}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
