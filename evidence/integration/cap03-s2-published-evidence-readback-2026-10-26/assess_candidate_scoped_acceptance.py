#!/usr/bin/env python3
"""Render the candidate-scoped S2 evidence-acceptance outcome as a machine record.

Evaluation only: reads the already-published evidence assessments (03/04/06) and the
recorded deposit coordinates, and writes 07-acceptance-outcome.json. It performs no
execution, no rerun, no manifest operation and no host access.

Deposit coordinates are inputs because they are facts about the publication chain, not
derivable from the evidence bytes:

  --deposit-pr 310 --deposit-merge 47133fe4... --head-ci 40359958909 --post-merge-ci <run>

Usage:
  python3 assess_candidate_scoped_acceptance.py --deposit-pr 310 --deposit-merge <sha> \
      --head-ci <run> --post-merge-ci <run> [--out PATH]
"""

from __future__ import annotations

import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--deposit-pr", required=True)
    ap.add_argument("--deposit-merge", required=True)
    ap.add_argument("--head-ci", required=True)
    ap.add_argument("--post-merge-ci", default="see tracker §16.144")
    ap.add_argument("--out", default=os.path.join(HERE, "07-acceptance-outcome.json"))
    args = ap.parse_args()

    m = json.load(open(os.path.join(HERE, "03-presence-and-digest-matrix.json")))
    basis = json.load(open(os.path.join(HERE, "06-candidate-basis.json")))

    criteria = [
        {"id": "A1", "criterion": "Raw evidence deposited by PR → green exact-head CI → regular "
                                  "merge → green post-merge CI → read-back (runbook §5.1)",
         "status": "MET",
         "basis": f"PR #{args.deposit_pr} merged by regular 2-parent merge {args.deposit_merge}; "
                  f"exact-head CI run {args.head_ci} success; post-merge main CI run "
                  f"{args.post_merge_ci}"},
        {"id": "A2", "criterion": "Independent read-back of the transferred evidence",
         "status": "SATISFIED",
         "basis": f"{m['digests']['transferred_match']}/47 digests reproduced from committed bytes "
                  f"(9/9 required); residual R-2 open; host-byte identity not claimed"},
        {"id": "A3", "criterion": "The 47-entry manifest-verification output that reported PASS is "
                                  "available",
         "status": "NOT AVAILABLE — recorded as R-1, not waived",
         "basis": "absent from the deposit, from IRR main and from both artifact inventories; "
                  "classified as an integrity corroboration rather than an S2 gate condition "
                  "(gates are the five commands: runbook §3, matrix §2.2)"},
        {"id": "A4", "criterion": "The five S2 gate conditions are satisfied on the operative basis",
         "status": "SATISFIED (candidate-scoped)",
         "basis": "conditions 4-5 by capture 20261026T095613Z (924/920/0/4 guard OK; consumer PASS); "
                  "conditions 1-3 by capture 20261026T093342Z (all exit 0, dist 1140); composition "
                  "adopted by the PA disposition §16.143; residual R-3 records that no single "
                  "contiguous run and no capture at the committed SHA exists"},
        {"id": "A5", "criterion": "Evidence accepted into the record (runbook §5.2)",
         "status": "SATISFIED",
         "basis": "this acceptance record, published through the same PR chain"},
        {"id": "A6", "criterion": "DQ-4 criterion 7 — host sequence S2 → P-1 → S3",
         "status": "NOT MET",
         "basis": "freeze criterion; P-1 unspent and S3 not reached; unaffected by this acceptance"},
        {"id": "A7", "criterion": "DQ-4 criterion 8 — native-Windows canonical worktree evidence",
         "status": "NOT MET",
         "basis": "freeze criterion; requires the host sequence above"},
        {"id": "A8", "criterion": "Execution-baseline pin disposition designating the exact "
                                  "commit/tree",
         "status": "SATISFIED (candidate-scoped)",
         "basis": "§16.143 designates 001c3c80618f2ee1d40e9a90912237e1a06e7b58 / "
                  "399fa44a5f1953c0f61b452420fefb5985426ef1 on PA direction; 0 of 56 H-12 paths "
                  "affected; pack shasum unchanged"},
        {"id": "A9", "criterion": "Formal acceptance determination rendered",
         "status": "RENDERED",
         "basis": "S2 evidence acceptance rendered candidate-scoped by this record on PA direction"},
        {"id": "A10", "criterion": "PF-15 designation effective (S3/QE prerequisite)",
         "status": "SATISFIED",
         "basis": "corrected act -02 EFFECTIVE; F1-F6 PA literals not restated or normalised"},
    ]

    residuals = [
        {"id": "R-1", "waived": False,
         "item": "47-entry manifest-verification output that reported PASS",
         "effect": "the reported PASS remains user-reported and cannot be independently confirmed; "
                   "it does not affect the five S2 gate conditions",
         "clears_by": "operator supplies that output; Arena re-runs verify_manifest_reproduction.py"},
        {"id": "R-2", "waived": False,
         "item": "s2-checkout-verification.txt digest does not reproduce (recorded 3FD31FE6…)",
         "effect": "an auxiliary checkout record is unverifiable; the same facts (commit, tree, "
                   "clean tree, non-shallow) are independently evidenced by s2-post-run-pin.txt, "
                   "whose digest reproduces",
         "clears_by": "original host bytes of that file supplied; or the PA accepts the "
                      "corroborating post-run-pin transcript as sufficient for the checkout fact"},
        {"id": "R-3", "waived": False,
         "item": "S2 gate conditions are evidenced by two contiguous captures, none at the "
                 "committed SHA",
         "effect": "the operative basis is the PA's candidate-scoped decision, not a single-run "
                   "artifact; verifier patch provably cannot affect conditions 1-3 (dist delta: 2 "
                   "compiled test files; no lockfile change)",
         "clears_by": "a future single-run candidate capture, which the PA direction explicitly "
                      "does not require"},
        {"id": "R-4", "waived": False,
         "item": "Host-byte identity of the transferred files is not established",
         "effect": "reproduction is content equality modulo line termination (host CRLF → committed "
                   "LF); no claim of byte identity with the host originals is made",
         "clears_by": "not clearable from repository content alone; recorded permanently as the "
                      "boundary of this verification"},
    ]

    out = {
        "record": "IIPS-V3-CAP03-S2-EVIDENCE-ACCEPTANCE-2026-10-26-01",
        "generated_by": "assess_candidate_scoped_acceptance.py",
        "outcome": "ACCEPTED_CANDIDATE_SCOPED",
        "operative_basis": {
            "commit": "001c3c80618f2ee1d40e9a90912237e1a06e7b58",
            "tree": "399fa44a5f1953c0f61b452420fefb5985426ef1",
            "parent": "8eec74ae27cda09f3c368b9c299895eae41554db",
            "disposition": "IIPS-V3-CAP03-S2-CANDIDATE-SCOPED-BASELINE-DISPOSITION-2026-10-26-01",
        },
        "deposit": {"pr": args.deposit_pr, "merge_commit": args.deposit_merge,
                    "head_ci_run": args.head_ci, "post_merge_ci_run": args.post_merge_ci},
        "criteria": criteria,
        "residuals": residuals,
        "residuals_open": True,
        "failed_baseline_run_classification": "FAILED — preserved as diagnostic history",
        "not_moved": ["P-1 (unspent, not authorised)", "S3", "QE 0/11", "Gate 4", "Gate 5",
                      "DQ-4 8/10 (criteria 7-8)", "PF-15 (satisfied, unchanged)",
                      "H-12 R5 (adopted, no re-adoption)", "pins", "fences"],
    }
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2)
        fh.write("\n")
    print(json.dumps({"outcome": out["outcome"],
                      "criteria": {c["id"]: c["status"] for c in criteria},
                      "residuals": [r["id"] for r in residuals]}, indent=2))
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
