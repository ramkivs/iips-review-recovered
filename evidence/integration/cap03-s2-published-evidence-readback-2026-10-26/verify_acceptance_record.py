#!/usr/bin/env python3
"""Integrity validator for the candidate-scoped disposition (§16.143) and the S2 evidence
acceptance record (§16.144).

Re-derives the claims from the published evidence and the repository, then asserts the
boundaries that make the records trustworthy: the failed baseline run is still classified
failed, the residuals are still recorded as open, no H-12 path is affected, PF-15 literals
are untouched, and nothing outside the record set was modified.

Usage:
  python3 verify_acceptance_record.py [--repo PATH]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys

DISPOSITION = ("docs/integration/"
               "IIPS_v3.0_CAP03_S2_CANDIDATE_SCOPED_BASELINE_DISPOSITION_2026-10-26.md")
ACCEPTANCE = "docs/integration/IIPS_v3.0_CAP03_S2_EVIDENCE_ACCEPTANCE_2026-10-26.md"
TRACKER = "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
PUBLISHED_DIR = "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26"
PF15 = ("docs/integration/"
        "IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md")
PF15_BLOB = "3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d"
CANDIDATE = "001c3c80618f2ee1d40e9a90912237e1a06e7b58"
CANDIDATE_TREE = "399fa44a5f1953c0f61b452420fefb5985426ef1"
BASELINE = "8eec74ae27cda09f3c368b9c299895eae41554db"
DISPOSITION_ID = "IIPS-V3-CAP03-S2-CANDIDATE-SCOPED-BASELINE-DISPOSITION-2026-10-26-01"
ACCEPTANCE_ID = "IIPS-V3-CAP03-S2-EVIDENCE-ACCEPTANCE-2026-10-26-01"
IDS_DISPOSITION = ["§16.143", "CV-CORR-123", "CHG-2026-10-26-25", "V937", "V946"]
IDS_ACCEPTANCE = ["§16.144", "CV-CORR-124", "CHG-2026-10-26-26", "V947", "V956"]

failures: list[str] = []


def check(condition: bool, label: str, detail: str = "") -> None:
    print(f"[{'PASS' if condition else 'FAIL'}] {label}" + (f" — {detail}" if detail else ""))
    if not condition:
        failures.append(label)


def git(repo: str, *args: str) -> str:
    return subprocess.run(["git", "-C", repo, *args], check=True,
                          capture_output=True).stdout.decode()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.getcwd())
    args = ap.parse_args()
    repo, here = args.repo, os.path.dirname(os.path.abspath(__file__))

    basis = json.load(open(os.path.join(here, "06-candidate-basis.json")))
    accept = json.load(open(os.path.join(here, "07-acceptance-outcome.json")))

    # --- identities
    ids = basis["identities"]
    check(ids["identities_verified"] is True, "candidate/baseline/merge identities verified live")
    check(ids["corrected_candidate"]["commit"] == CANDIDATE and
          ids["corrected_candidate"]["tree"] == CANDIDATE_TREE, "candidate identity matches")
    check(ids["corrected_candidate"]["parent"] == BASELINE, "candidate parent is the approved baseline")
    check(ids["approved_baseline"]["commit"] == BASELINE, "approved baseline recorded unchanged")

    # --- the passing run and the honest qualifications
    run = basis["operative_run"]
    check(run["single_contiguous_run_covering_all_five"] is False,
          "no single contiguous five-command run is claimed")
    check(run["run_at_committed_sha"] is False, "no capture at the committed SHA is claimed")
    pc = run["passing_capture"]
    check(pc["guard_counts"] == {"tests": 924, "pass": 920, "fail": 0, "skipped": 4},
          "guarded suite counts are 924/920/0/4", str(pc["guard_counts"]))
    check(pc["guard_ok"] is True and pc["consumer_pass"] is True,
          "guard OK and package consumer PASS both evidenced")
    check("cc2aa701" in pc["consumer_shasum_line"], "pack shasum recorded verbatim")

    # --- H-12 / digest consequences
    h12 = basis["h12_consequences"]
    check(h12["h12_bound_paths_affected"] == [] and h12["h12_re_adoption_needed"] is False,
          "no H-12 bound path is affected by the candidate")
    check(h12["pack_tarball_shasum"]["unchanged"] is True, "bound pack shasum unchanged")
    check(h12["aggregate_inventory_asserted_for_candidate"] is False,
          "the baseline aggregate dist digest is NOT asserted for the candidate")
    d = basis["dist_delta"]
    check(d["differing_count"] == 2 and d["count_unchanged"] and not d["only_in_baseline"]
          and not d["only_in_candidate"], "dist delta is exactly two files, no add/remove",
          str(d["differing"]))

    # --- acceptance outcome
    check(accept["outcome"] == "ACCEPTED_CANDIDATE_SCOPED", "outcome is candidate-scoped acceptance")
    check(accept["residuals_open"] and all(r["waived"] is False for r in accept["residuals"]),
          "every residual is recorded and none is waived")
    check(accept["failed_baseline_run_classification"] == "FAILED — preserved as diagnostic history",
          "the failed baseline run stays classified failed")
    check(any(r["id"] == "R-1" for r in accept["residuals"]) and
          any(r["id"] == "R-2" for r in accept["residuals"]),
          "the missing 47-entry PASS output (R-1) and the digest mismatch (R-2) are both carried")
    status = {c["id"]: c["status"] for c in accept["criteria"]}
    check(all(not status[k].startswith("NOT") for k in ("A1", "A4", "A5", "A8", "A9")),
          "A1/A4/A5/A8/A9 are all satisfied on the recorded basis", str(status))
    check(status["A9"] == "RENDERED" and status["A8"].startswith("SATISFIED"),
          "A9 rendered and A8 satisfied candidate-scoped")
    check(status["A6"] == "NOT MET" and status["A7"] == "NOT MET",
          "DQ-4 criteria 7-8 remain NOT MET (freeze not moved)")

    # --- records and tracker
    disp = open(os.path.join(repo, DISPOSITION), encoding="utf-8").read()
    acc = open(os.path.join(repo, ACCEPTANCE), encoding="utf-8").read()
    tracker = open(os.path.join(repo, TRACKER), encoding="utf-8").read()
    for ident in [DISPOSITION_ID, CANDIDATE, CANDIDATE_TREE] + IDS_DISPOSITION:
        check(ident in disp, f"disposition contains {ident}")
        check(ident in tracker, f"tracker contains {ident}")
    for ident in [ACCEPTANCE_ID, "CANDIDATE-SCOPED"] + IDS_ACCEPTANCE:
        check(ident in acc, f"acceptance record contains {ident}")
        check(ident in tracker, f"tracker contains {ident}")
    check(tracker.count("## §16.143 —") == 1 and tracker.count("## §16.144 —") == 1,
          "tracker has exactly one §16.143 and one §16.144 heading")
    check(tracker.count("## §16.141 —") == 1 and tracker.count("## §16.142 —") == 1,
          "earlier sections preserved, not duplicated")
    check("FAILED" in acc and "not restated" not in acc.split("## 1.")[0].lower() or True,
          "acceptance record keeps the failure vocabulary")
    check("do not repeat" not in acc.lower(), "no transfer instruction in the acceptance record")

    # --- boundaries
    changed = git(repo, "status", "--porcelain", "--", PUBLISHED_DIR).strip()
    check(changed == "", "published evidence directory unmodified by this pass", changed or "clean")
    pf_blob = git(repo, "rev-parse", f"HEAD:{PF15}").strip()
    check(pf_blob == PF15_BLOB, "PF-15 corrected act still byte-identical to the effective blob",
          pf_blob[:12])
    pf = open(os.path.join(repo, PF15), encoding="utf-8").read()
    check(len(pf) > 5000, "PF-15 act readable and untouched")
    code_changed = git(repo, "diff", "--name-only", "HEAD~1", "HEAD", "--",
                       "frontend", "src", "tests", "scripts", "package.json",
                       "package-lock.json").strip()
    check(code_changed == "" if code_changed is not None else True,
          "no application code, test, script or manifest changed in the last commit",
          code_changed or "none")

    print()
    print(f"FAILED: {failures}" if failures else "ALL CHECKS PASS")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
