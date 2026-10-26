#!/usr/bin/env python3
"""Collect the live remote publication state of the CAP-03 S2 evidence transfer.

Read-only: `git ls-remote` plus GitHub REST reads. No writes to either
repository, no PR creation, no merge, no CI dispatch.

Usage:
  python3 collect_publication_state.py [--out PATH]
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys

REPO = "ramkivs/iips-review-recovered"
BRANCH = "cap03-s2-evidence-publication"
COMMIT = "54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0"
EVIDENCE_DIR = "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26"


def run(*cmd: str) -> str:
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def gh_json(path: str, jq: str) -> object:
    return json.loads(run("gh", "api", path, "--jq", jq))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                                  "00-remote-publication-state.json"))
    args = ap.parse_args()

    ls_remote = run("git", "ls-remote", f"https://github.com/{REPO}.git",
                    f"refs/heads/{BRANCH}", "refs/heads/main").strip().splitlines()
    refs = {}
    for line in ls_remote:
        sha, ref = line.split(None, 1)
        refs[ref.strip()] = sha

    commit = gh_json(f"repos/{REPO}/commits/{COMMIT}",
                     "{sha:.sha,parents:[.parents[].sha],date:.commit.committer.date,"
                     "message:.commit.message,files:(.files|length)}")
    dir_listing = gh_json(f"repos/{REPO}/contents/{EVIDENCE_DIR}?ref={COMMIT}", "[.[].name]")

    state = {
        "record": "IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01",
        "collected_by": "collect_publication_state.py",
        "repository": REPO,
        "ls_remote": {
            "branch_ref": f"refs/heads/{BRANCH}",
            "branch_sha": refs.get(f"refs/heads/{BRANCH}"),
            "main_sha": refs.get("refs/heads/main"),
            "branch_points_at_published_commit": refs.get(f"refs/heads/{BRANCH}") == COMMIT,
        },
        "published_commit": commit,
        "evidence_dir": EVIDENCE_DIR,
        "evidence_dir_entry_count": len(dir_listing),
        "evidence_dir_entries": sorted(dir_listing),
        "pull_requests_from_branch": gh_json(
            f"repos/{REPO}/pulls?state=all&head=ramkivs:{BRANCH}", "length"),
        "open_pull_requests_repo": gh_json(
            f"repos/{REPO}/pulls?state=open&per_page=100", "length"),
        "check_runs_on_commit": gh_json(
            f"repos/{REPO}/commits/{COMMIT}/check-runs", "[.total_count, [.check_runs[]|"
            "{name:.name,status:.status,conclusion:.conclusion}]] | {total:.[0],runs:.[1]}"),
        "workflow_runs_for_branch": gh_json(
            f"repos/{REPO}/actions/runs?branch={BRANCH}", ".total_count"),
        "branch_protected": gh_json(f"repos/{REPO}/branches/{BRANCH}", ".protected"),
    }

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2)
        fh.write("\n")
    print(json.dumps({k: v for k, v in state.items()
                      if k not in ("evidence_dir_entries",)}, indent=2))
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
