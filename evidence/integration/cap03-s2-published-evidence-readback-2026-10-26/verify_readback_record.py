#!/usr/bin/env python3
"""Integrity validator for the CAP-03 S2 published-evidence read-back record.

Checks that the record's claims agree with the machine-generated read-back, that the
non-reproduction finding is real, that the boundary statements hold (no modification
of existing evidence, no duplicate tracker section), and that the identifier census
holds. Performs no execution work and no network access.

Usage:
  python3 verify_readback_record.py [--repo PATH]
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import os
import re
import subprocess
import sys

COMMIT = "54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0"
PUBLISHED_DIR = "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26"
DOC = "docs/integration/IIPS_v3.0_CAP03_S2_PUBLISHED_EVIDENCE_READBACK_2026-10-26.md"
TRACKER = "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
RECORD_ID = "IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01"
IDENTIFIERS = ["§16.141", "CV-CORR-121", "CHG-2026-10-26-23", "V917", "V926"]
REQUIRED = ["s2-01-npm-ci.txt", "s2-02-tsc-noemit.txt", "s2-03-build.txt",
            "s2-03-dist-count.txt", "s2-03-dist-sha256-before.txt",
            "s2-04-guarded-npm-test.txt", "s2-05-package-consumer.txt",
            "s2-post-run-pin.txt", "s2-dist-sha256-after.txt"]

failures: list[str] = []


def check(condition: bool, label: str, detail: str = "") -> None:
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}" + (f" — {detail}" if detail else ""))
    if not condition:
        failures.append(label)


def git(repo: str, *args: str) -> bytes:
    return subprocess.run(["git", "-C", repo, *args], check=True, capture_output=True).stdout


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.getcwd())
    args = ap.parse_args()
    repo = args.repo
    here = os.path.dirname(os.path.abspath(__file__))

    rb = json.load(open(os.path.join(here, "01-manifest-reproduction-readback.json")))
    cf = json.load(open(os.path.join(here, "02-evidence-content-findings.json")))
    ps = json.load(open(os.path.join(here, "00-remote-publication-state.json")))

    check(rb["commit"] == COMMIT, "read-back targets the published commit", rb["commit"])
    check(ps["published_commit"]["sha"] == COMMIT, "publication state targets the same commit")
    check(ps["ls_remote"]["branch_points_at_published_commit"] is True,
          "remote branch still points at the published commit")
    check(ps["pull_requests_from_branch"] == 0 and ps["workflow_runs_for_branch"] == 0,
          "no PR and no CI run exist for the evidence branch")

    counts = collections.Counter(e["classification"] for e in rb["entries"])
    check(counts["NOT_REPRODUCED"] == 1, "exactly one manifest entry does not reproduce",
          str(dict(counts)))
    check(rb["classification_counts"] == dict(counts), "recorded counts match recomputation")
    bad = [e["file"] for e in rb["entries"] if e["classification"] == "NOT_REPRODUCED"]
    check(bad == ["s2-checkout-verification.txt"], "the non-reproducing entry is the documented one",
          str(bad))
    check(rb["required_files"]["all_present"] and rb["required_files"]["all_reproduced"],
          "all nine required S2 files present and reproduced")
    check(sorted(rb["required_files"]["declared"]) == sorted(REQUIRED), "required-file list matches")
    check(rb["listed_but_not_present"] == [], "no manifest entry is missing from the tree")
    check(rb["reported_excluded_absent_from_tree"] == {"windows-session-transcript.txt": True},
          "the reported locked transcript is absent from the tree")

    # The non-reproduction must survive a fresh, independent recomputation.
    recorded = next(e["recorded_sha256"] for e in rb["entries"]
                    if e["file"] == "s2-checkout-verification.txt")
    raw = git(repo, "cat-file", "blob", f"{COMMIT}:{PUBLISHED_DIR}/s2-checkout-verification.txt")
    variants = {raw, raw.replace(b"\n", b"\r\n"),
                raw.replace(b"\n", b"\r\n").rstrip(b"\r\n") + b"\r\n",
                raw.rstrip(b"\n") + b"\r\n", raw.rstrip(b"\n") + b"\n"}
    check(all(hashlib.sha256(v).hexdigest().upper() != recorded for v in variants),
          "non-reproduction reconfirmed independently", recorded[:16] + "…")

    conflict = cf["manifest_verification_conflict"]
    check(conflict["inventory_line_count"] == 1148 and conflict["inventory_dist_entry_lines"] == 1140,
          "1148 = 8 metadata/header lines + 1140 dist entries",
          f"{conflict['inventory_line_count']} / {conflict['inventory_dist_entry_lines']}")
    check(conflict["independent_pass_output_present_in_bundle"] is False,
          "no 47-entry PASS output exists in the bundle")
    suite = cf["passing_evidence_hashes"]["guarded_suite"]
    check(suite["tap_counts"]["fail"] == 0 and suite["baseline_step04_tap_counts"]["fail"] == 1,
          "passing suite bytes and failing step-04 bytes coexist as documented")
    check(cf["passing_evidence_hashes"]["package_consumer"]["identical_blobs"] is True,
          "s2-05 and the candidate consumer transcript are the same bytes")

    doc = open(os.path.join(repo, DOC), encoding="utf-8").read()
    tracker = open(os.path.join(repo, TRACKER), encoding="utf-8").read()
    for ident in [RECORD_ID, "54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0"] + IDENTIFIERS:
        check(ident in doc, f"addendum contains {ident}")
        check(ident in tracker, f"tracker contains {ident}")
    check(tracker.count("## §16.141 —") == 1, "tracker has exactly one §16.141 heading")
    check(doc.count("## 1. Remote publication state") == 1, "addendum structure intact")
    check("NOT RENDERED" in doc and "NOT_REPRODUCED" in doc,
          "addendum preserves the non-acceptance and non-reproduction language")
    check("Result: FAIL" in doc, "addendum records the preserved FAIL result verbatim")

    # Boundary: no evidence file of the earlier receipt was modified in this working tree.
    changed = git(repo, "status", "--porcelain", "--", PUBLISHED_DIR).decode().strip()
    check(changed == "", "existing receipt evidence unmodified by this pass", changed or "clean")

    print()
    if failures:
        print(f"FAILED: {len(failures)} check(s): {failures}")
        return 1
    print("ALL CHECKS PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
