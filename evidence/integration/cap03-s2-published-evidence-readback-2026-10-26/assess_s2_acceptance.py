#!/usr/bin/env python3
"""Evaluate formal CAP-03 S2 evidence acceptance against the governing criteria.

The criteria are transcribed from the governing records and each is evaluated
only against facts already established in this bundle (03 = presence/digests,
02 = content findings, 00 = remote state). Nothing is executed, rerun or rebuilt.

A criterion is marked SATISFIED only when the governing record's own words are met.
Unmet criteria keep the governing words as the requirement so the gap is legible.

Usage:
  python3 assess_s2_acceptance.py [--out PATH]
"""

from __future__ import annotations

import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(HERE, "04-s2-acceptance-assessment.json"))
    args = ap.parse_args()

    m = json.load(open(os.path.join(HERE, "03-presence-and-digest-matrix.json")))
    c = json.load(open(os.path.join(HERE, "02-evidence-content-findings.json")))
    p = json.load(open(os.path.join(HERE, "00-remote-publication-state.json")))

    transferred_present = m["presence"]["transferred_present"]
    transferred_total = m["inventory"]["transferred_evidence_entries"]
    mismatch = m["digests"]["transferred_mismatch"]
    required_ok = (m["presence"]["required_present"] == 9 and m["digests"]["required_match"] == 9)
    unmerged = (p["pull_requests_from_branch"] == 0
                and p["workflow_runs_for_branch"] == 0
                and p["published_commit"]["parents"] == [p["ls_remote"]["main_sha"]])
    pass_output_present = c["manifest_verification_conflict"]["independent_pass_output_present_in_bundle"]
    baseline_step04_failed = c["passing_evidence_hashes"]["guarded_suite"][
        "baseline_step04_tap_counts"]["fail"] > 0

    criteria = [
        {
            "id": "A1",
            "requirement": "Raw host evidence is deposited into the governed record through the "
                           "governed evidence workflow: IRR PR, green exact-head CI, regular merge, "
                           "green post-merge main CI, independent remote read-back.",
            "source": "S2 operator runbook §5.1; S2/P-1/S3/QE matrix §2.3; receipt §16.138 "
                      "publication-completeness rule",
            "status": "NOT MET" if unmerged else "MET",
            "basis": f"{p['pull_requests_from_branch']} PRs from the branch, "
                     f"{p['workflow_runs_for_branch']} CI runs, commit still a child of main — "
                     "the evidence is preserved on a branch but is not in the governed record",
        },
        {
            "id": "A2",
            "requirement": "Independent read-back of the original host evidence bytes.",
            "source": "Receipt §16.138.4/§5; tracker §16.140.4 P-1-A",
            "status": "PARTIAL" if not mismatch else "PARTIAL",
            "basis": f"{transferred_present}/{transferred_total} transferred originals present in "
                     f"the repository; digests reproduced for "
                     f"{m['digests']['transferred_match']}/{transferred_total} from committed "
                     f"content modulo disclosed line-terminator restoration; mismatch: "
                     f"{mismatch or 'none'}; host-byte identity not established (transfer is LF)",
        },
        {
            "id": "A3",
            "requirement": "The final 47-entry manifest-verification output that reported PASS is "
                           "available and independently checkable.",
            "source": "Receipt §16.138.1/§5; tracker §16.138.4 'exact next action'",
            "status": "MET" if pass_output_present else "NOT MET",
            "basis": "no artifact in the repository records a 47-entry verification or its PASS; "
                     "the only preserved verification artifact is the mis-invoked 1148-entry run",
        },
        {
            "id": "A4",
            "requirement": "S2 passes as a coherent single-pin five-command sequence on the "
                           "designated host.",
            "source": "Runbook §3 (five commands, in order, any non-zero exit stops); matrix §7",
            "status": "NOT MET" if baseline_step04_failed else "MET",
            "basis": "the published step-04 transcript records guard FAIL "
                     f"(#{c['passing_evidence_hashes']['guarded_suite']['baseline_step04_tap_counts']}) "
                     "at approved baseline 8eec74ae…; the passing suite/consumer bytes belong to the "
                     "corrected-candidate window and the post-run pin states the baseline checkout",
        },
        {
            "id": "A5",
            "requirement": "Evidence is accepted into the record.",
            "source": "Runbook §5.2 ('Only after S2 passes and its evidence is accepted into the "
                      "record'); matrix §7",
            "status": "NOT MET",
            "basis": "deposit (A1) has not occurred and no acceptance determination exists",
        },
        {
            "id": "A6",
            "requirement": "DQ-4 establishment criterion 7 — host sequence S2 → one P-1 → S3 "
                           "preflight on the designated native-Windows host.",
            "source": "DQ-4 QE freeze manifest §7 criterion 7",
            "status": "NOT MET",
            "basis": "P-1 unspent/not started, S3 not reached",
        },
        {
            "id": "A7",
            "requirement": "DQ-4 establishment criterion 8 — native-Windows canonical worktree "
                           "evidence for this chain.",
            "source": "DQ-4 QE freeze manifest §7 criterion 8",
            "status": "NOT MET",
            "basis": "transcripts are present by transfer, but canonical evidence cannot exist "
                     "before A1/A4 are resolved",
        },
        {
            "id": "A8",
            "requirement": "An execution-baseline pin disposition designating the exact execution "
                           "commit/tree.",
            "source": "Gate 4 act §6/Q5; H-12 R5 adoption; tracker §16.140.4 P-1-B",
            "status": "NOT SATISFIED",
            "basis": "approved baseline remains 8eec74ae…/4eba2902…, which the published step-04 "
                     "transcript shows failing; the corrected candidate 001c3c80…/399fa44a… is "
                     "expressly not promoted. Without a PA disposition no passing S2 can be "
                     "attributed to an authorized baseline",
        },
        {
            "id": "A9",
            "requirement": "Formal S2 acceptance determination rendered by the Program Authority.",
            "source": "Tracker §16.138.4; §16.140.4 P-1-A",
            "status": "NOT RENDERED",
            "basis": "no such act exists; acceptance is never inferred from publication, "
                     "reproduction, or a reported host PASS",
        },
        {
            "id": "A10",
            "requirement": "PF-15 endpoint/local-state designation effective (S3/QE prerequisite, "
                           "not an S2 criterion).",
            "source": "Corrected act …-02; receipt §16.137.6; tracker §16.140.4 P-1-E",
            "status": "SATISFIED",
            "basis": "act …-02 EFFECTIVE at IRR main; F1–F6 values are PA-owned and are neither "
                     "restated nor normalized by this pass",
        },
    ]

    blocking = [x["id"] for x in criteria
                if x["id"] not in ("A10",) and x["status"] in ("NOT MET", "NOT SATISFIED",
                                                               "NOT RENDERED")]
    decisive = "A8"

    verdict = {
        "formal_s2_evidence_acceptance": "NOT RENDERED",
        "reason": "No governing criterion set is satisfied, and the decisive blocker is not an "
                  "evidence-availability problem: the published step-04 transcript shows the "
                  "guarded suite failing at the approved baseline, so no further file transfer "
                  "can convert this evidence into a passing S2. The passing bytes are "
                  "candidate-scoped and the corrected candidate is expressly not promoted. A PA "
                  "execution-baseline disposition (A8) is therefore the controlling next action; "
                  "deposit (A1) and a formal acceptance determination (A9) follow from it.",
        "transferred_files_present": f"{transferred_present}/{transferred_total}",
        "digest_mismatches": mismatch,
        "required_nine_ok": required_ok,
        "blocking_criteria": blocking,
        "decisive_blocker": decisive,
        "not_blocking": {"A10": "PF-15 designation is effective and is an S3/QE prerequisite"},
    }

    out = {
        "record": "IIPS-V3-CAP03-S2-EVIDENCE-PRESENCE-AND-DIGEST-MATRIX-2026-10-26-01",
        "generated_by": "assess_s2_acceptance.py",
        "criteria": criteria,
        "verdict": verdict,
    }
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2)
        fh.write("\n")

    print(json.dumps(verdict, indent=2))
    for x in criteria:
        print(f"  {x['id']:4s} {x['status']:14s} {x['requirement'][:70]}")
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
