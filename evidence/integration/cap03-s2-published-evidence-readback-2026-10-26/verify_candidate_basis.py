#!/usr/bin/env python3
"""Verify the candidate-scoped execution basis from published evidence only.

Produces the machine record behind the PA's candidate-scoped baseline disposition:
  * the exact candidate / baseline / merge identities, read live from the remotes;
  * which captured run produced the passing guarded suite and package-consumer results;
  * the five S2 gate conditions mapped to the transcript that evidences each one;
  * the H-12 and dist-digest consequences of executing from the candidate rather than
    the approved baseline, quantified from the published inventories.

No test, build, install, pack, S2 step or manifest operation is performed. No file on
the Windows host is read. Network use is read-only (GitHub API) for commit identities.

Usage:
  python3 verify_candidate_basis.py [--out PATH]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys

IRR = "ramkivs/iips-review-recovered"
IPD = "ramkivs/iips-production-market-data"
COMMIT = "54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0"
PUBLISHED_DIR = "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26"

BASELINE = ("8eec74ae27cda09f3c368b9c299895eae41554db",
            "4eba29029f8d95cfe483e615a7047426b298ce50")
CANDIDATE = ("001c3c80618f2ee1d40e9a90912237e1a06e7b58",
             "399fa44a5f1953c0f61b452420fefb5985426ef1")
CHANGED_PATHS = ["scripts/verify-public-package.mjs", "tests/portfolio_ui_package.test.ts"]
SUITE_SHA = "C5DDFFA24393AED2E391EF8A72E8BFF1F8ECD9576C4349E182B288785F1B2941"
CONSUMER_SHA = "9F7C64073A849E57D472C9CA30BB7616D04D1951626E90587241D61A470A85B1"
PACK_SHASUM = "cc2aa70186b8fd7bc7255452ac8d8b00d094f53e"
H12_CANONICAL_DIST = "81bddd5cdd007bccb391759d765f57d780cb3a9db886299890a5c0fa5c4311b2"
H12 = "docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json"

GATES = [
    ("1", "npm ci --no-audit --no-fund", "s2-fix-01-npm-ci.txt",
     "s2-fix-validation-20261026T093342Z.txt",
     "2026-10-26T09:33:43.4268853Z", "exit 0"),
    ("2", "npx tsc --noEmit", "s2-fix-02-typecheck.txt",
     "s2-fix-validation-20261026T093342Z.txt",
     "2026-10-26T09:34:01.2942862Z", "exit 0"),
    ("3", "npm run build (+ dist count 1140 + inventory)",
     "s2-fix-03-build.txt / s2-fix-dist-inventory-20261026T093342Z.txt",
     "s2-fix-validation-20261026T093342Z.txt",
     "2026-10-26T09:34:15.7862399Z", "exit 0, dist 1140"),
    ("4", "npm test (canonical guarded suite)", "s2-npm-launch-fix-suite-20261026T095613Z.txt",
     "s2-npm-launch-fix-summary-20261026T095613Z.txt",
     "2026-10-26T09:57:43.0649890Z", "exit 0, 924/920/0/4, guard OK"),
    ("5", "npm run test:package-consumer", "s2-npm-launch-fix-consumer-20261026T095613Z.txt",
     "s2-npm-launch-fix-summary-20261026T095613Z.txt",
     "2026-10-26T09:56:14.2694664Z", "exit 0, result PASS"),
]


def git(repo: str, *args: str) -> str:
    return subprocess.run(["git", "-C", repo, *args], check=True,
                          capture_output=True).stdout.decode()


def gh_json(path: str, jq: str) -> object:
    return json.loads(subprocess.run(["gh", "api", path, "--jq", jq], check=True,
                                     capture_output=True, text=True).stdout)


def load_inventory(text: str) -> dict[str, str]:
    out = {}
    for line in text.replace("\r\n", "\n").splitlines():
        m = re.match(r"^([0-9A-Fa-f]{64})\s{2}(.+)$", line.strip())
        if not m:
            continue
        path = m.group(2).replace("\\", "/")
        i = path.find("dist/")
        out[path[i:] if i >= 0 else path] = m.group(1).upper()
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.getcwd())
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                                  "06-candidate-basis.json"))
    args = ap.parse_args()
    repo = args.repo

    def published(name: str) -> str:
        return git(repo, "show", f"{COMMIT}:{PUBLISHED_DIR}/{name}")

    # --- live identities
    cand = gh_json(f"repos/{IPD}/commits/{CANDIDATE[0]}",
                   "{sha:.sha,tree:.commit.tree.sha,parents:[.parents[].sha],date:.commit.committer.date}")
    base = gh_json(f"repos/{IPD}/commits/{BASELINE[0]}",
                   "{sha:.sha,tree:.commit.tree.sha,date:.commit.committer.date}")
    pr96 = gh_json(f"repos/{IPD}/pulls/96",
                   "{number,state,merged_at,merge_commit_sha,head:.head.sha,base:.base.ref,"
                   "title,changed_files}")
    identity_ok = (cand["sha"] == CANDIDATE[0] and cand["tree"] == CANDIDATE[1]
                   and cand["parents"] == [BASELINE[0]]
                   and base["tree"] == BASELINE[1]
                   and pr96["state"] == "closed" and pr96["merge_commit_sha"] is not None)

    # --- dist-digest consequence of executing from the candidate
    baseline_inv = load_inventory(published("s2-03-dist-sha256-before.txt"))
    candidate_inv = load_inventory(published("s2-fix-dist-inventory-20261026T093342Z.txt"))
    only_base = sorted(set(baseline_inv) - set(candidate_inv))
    only_cand = sorted(set(candidate_inv) - set(baseline_inv))
    differing = sorted(p for p in set(baseline_inv) & set(candidate_inv)
                       if baseline_inv[p] != candidate_inv[p])

    # --- H-12 exposure
    h12 = json.load(open(os.path.join(repo, H12)))
    h12_paths = sorted(e["path"] for e in h12["entries"])
    h12_affected = [p for p in CHANGED_PATHS if p in h12_paths]

    # --- gate-condition mapping, each cross-checked against its own transcript
    gate_rows = []
    for n, cmd, log_name, summary_name, start, verdict in GATES:
        log = published(log_name.split(" / ")[0])
        gate_rows.append({
            "condition": n,
            "command": cmd,
            "transcript": log_name,
            "summary": summary_name,
            "capture_start_utc": start,
            "recorded_verdict": verdict,
            "transcript_exit_zero_line": sum(1 for ln in log.splitlines()
                                             if re.search(r"[Ee]xit code:?\s*0\b", ln)) > 0,
            "transcript_bytes": len(log),
        })

    suite = published("s2-npm-launch-fix-suite-20261026T095613Z.txt")
    suite_counts = {k: (int(m.group(1)) if (m := re.search(rf"^# {k} (\d+)$", suite, re.M)) else None)
                    for k in ("tests", "pass", "fail", "skipped")}
    consumer = published("s2-05-package-consumer.txt")
    consumer_pass = '"result": "PASS"' in consumer
    pack_line = next((ln.strip() for ln in consumer.splitlines() if '"shasum"' in ln), "")

    summary = published("s2-npm-launch-fix-summary-20261026T095613Z.txt")
    fix_summary = published("s2-fix-validation-20261026T093342Z.txt")

    result = {
        "record": "IIPS-V3-CAP03-S2-CANDIDATE-BASIS-VERIFICATION-2026-10-26-01",
        "generated_by": "verify_candidate_basis.py",
        "method": "read-only GitHub API identity reads + hashing-free reads of the published "
                  "transcripts; no execution, no host access, no manifest operation",
        "identities": {
            "approved_baseline": {"commit": BASELINE[0], "tree": BASELINE[1],
                                  "verified_live": base["sha"] == BASELINE[0] and base["tree"] == BASELINE[1]},
            "corrected_candidate": {"commit": cand["sha"], "tree": cand["tree"],
                                    "parent": (cand["parents"] or [None])[0],
                                    "committed_at": cand["date"]},
            "ipd_merge": {"pr": pr96["number"], "state": pr96["state"],
                          "merged_at": pr96["merged_at"], "merge_commit": pr96["merge_commit_sha"],
                          "changed_files": pr96["changed_files"]},
            "identities_verified": identity_ok,
        },
        "operative_run": {
            "passing_capture": {
                "run_id": "20261026T095613Z",
                "window_utc": "2026-10-26T09:56:14.2402846Z – 2026-10-26T09:58:05.1795781Z",
                "conditions_covered": ["4", "5"],
                "guard_counts": suite_counts,
                "guard_ok": "[test-guard] OK" in suite,
                "consumer_pass": consumer_pass,
                "consumer_shasum_line": pack_line,
                "suite_digest": SUITE_SHA,
                "consumer_digest": CONSUMER_SHA,
                "summary_states": {
                    "guarded suite exit 0": "Guarded suite exit code: 0" in summary,
                    "consumer exit 0": "Package-consumer exit code: 0" in summary,
                    "original S2 retained as failed": "Original S2 result remains FAILED/STOPPED." in summary,
                    "no candidate commit at capture time": "No candidate commit or publication performed." in summary,
                },
            },
            "prerequisite_capture": {
                "run_id": "20261026T093342Z",
                "window_utc": "2026-10-26T09:33:43.4210391Z – 2026-10-26T09:35:15.3219843Z",
                "conditions_covered": ["1", "2", "3", "4(early)", "5(FAILED)"],
                "overall_passed": "Overall validation passed: True" in fix_summary,
                "failure_step": next((ln.split(":", 1)[1].strip() for ln in fix_summary.splitlines()
                                      if ln.startswith("Failure step:")), None),
                "dist_count": next((ln.split(":", 1)[1].strip() for ln in fix_summary.splitlines()
                                    if ln.startswith("Built dist file count:")), None),
            },
            "single_contiguous_run_covering_all_five": False,
            "run_at_committed_sha": False,
        },
        "gate_conditions": gate_rows,
        "h12_consequences": {
            "h12_entries": len(h12_paths),
            "changed_paths": CHANGED_PATHS,
            "h12_bound_paths_affected": h12_affected,
            "h12_re_adoption_needed": bool(h12_affected),
            "pack_tarball_shasum": {"baseline_bound": PACK_SHASUM,
                                    "candidate_measured": PACK_SHASUM if PACK_SHASUM in consumer else None,
                                    "unchanged": PACK_SHASUM in consumer},
            "canonical_dist_inventory_sha256_bound_at_baseline": H12_CANONICAL_DIST,
            "aggregate_inventory_asserted_for_candidate": False,
            "aggregate_note": "The canonical inventory digest is bound at the approved baseline. The "
                              "candidate's inventory is byte-identical except the differing files listed "
                              "below, so an aggregate digest at the candidate necessarily differs; its "
                              "re-derivation needs the canonicalisation procedure and is not performed.",
        },
        "dist_delta": {
            "baseline_entries": len(baseline_inv),
            "candidate_entries": len(candidate_inv),
            "count_unchanged": len(baseline_inv) == len(candidate_inv) == 1140,
            "only_in_baseline": only_base,
            "only_in_candidate": only_cand,
            "differing": differing,
            "differing_count": len(differing),
        },
    }

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2)
        fh.write("\n")

    print(json.dumps({
        "identities_verified": identity_ok,
        "candidate": [cand["sha"], cand["tree"]],
        "parent_ok": cand["parents"] == [BASELINE[0]],
        "guard_counts": suite_counts,
        "consumer_pass": consumer_pass,
        "single_contiguous_run": False,
        "dist_delta": result["dist_delta"]["differing"],
        "h12_affected": h12_affected,
        "pack_shasum_unchanged": PACK_SHASUM in consumer,
    }, indent=2))
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
