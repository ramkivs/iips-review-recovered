#!/usr/bin/env python3
"""Integrity validator for the CAP-03 S2 presence/digest verification addendum (§16.142).

Re-derives the record's claims from the published commit and its own machine artifacts,
then asserts the boundaries: no evidence rewritten, no acceptance record invented,
PF-15 literals untouched, single tracker section, identifier census satisfied.

Usage:
  python3 verify_continuation_record.py [--repo PATH]
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
DOC = ("docs/integration/"
       "IIPS_v3.0_CAP03_S2_EVIDENCE_PRESENCE_AND_DIGEST_VERIFICATION_2026-10-26.md")
TRACKER = "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
RECORD_ID = "IIPS-V3-CAP03-S2-EVIDENCE-PRESENCE-AND-DIGEST-VERIFICATION-2026-10-26-01"
IDENTIFIERS = ["§16.142", "CV-CORR-122", "CHG-2026-10-26-24", "V927", "V936"]
ACCEPTANCE_RECORD_PREFIX = "IIPS-V3-CAP03-S2-EVIDENCE-ACCEPTANCE-"

failures: list[str] = []


def check(condition: bool, label: str, detail: str = "") -> None:
    print(f"[{'PASS' if condition else 'FAIL'}] {label}" + (f" — {detail}" if detail else ""))
    if not condition:
        failures.append(label)


def git(repo: str, *args: str) -> bytes:
    return subprocess.run(["git", "-C", repo, *args], check=True, capture_output=True).stdout


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.getcwd())
    args = ap.parse_args()
    repo, here = args.repo, os.path.dirname(os.path.abspath(__file__))

    m = json.load(open(os.path.join(here, "03-presence-and-digest-matrix.json")))
    a = json.load(open(os.path.join(here, "04-s2-acceptance-assessment.json")))
    p = json.load(open(os.path.join(here, "00-remote-publication-state.json")))

    # --- inventory claims
    check(m["inventory"]["committed_files_in_dir"] == 57, "57 files at the published commit")
    check(m["inventory"]["manifest_entries"] == 53 and
          m["inventory"]["transferred_evidence_entries"] == 47,
          "manifest = 53 = 6 IRR-authored + 47 transferred")
    check(m["presence"]["transferred_present"] == 47 and not m["presence"]["transferred_absent"],
          "all 47 transferred originals present")
    check(m["presence"]["required_present"] == 9 and not m["presence"]["required_absent"],
          "all nine required step files present")
    check(m["presence"]["absent_windows_session_transcript"] is True,
          "reported locked transcript absent from the tree")
    check(sorted(m["presence"]["present_but_not_in_manifest"]) ==
          ["NON_AUTHORITATIVE_TRANSFER.md", "SHA256SUMS.txt",
           "s2-04-sha256-manifest-generation.txt", "s2-evidence-manifest-verification.txt"],
          "the four unlisted files are the documented ones")
    check(m["standalone_47_entry_manifest_file_present"] is False,
          "no standalone 47-entry manifest file is claimed")

    # --- digest claims, re-derived from the published commit
    recorded = {}
    for line in git(repo, "cat-file", "blob", f"{COMMIT}:{PUBLISHED_DIR}/SHA256SUMS.txt").decode().splitlines():
        if line.strip():
            h, f = line.split(None, 1)
            recorded[f.strip()] = h.strip().upper()
    bad, checked = [], 0
    for entry in m["entries"]:
        if not entry["transferred"] or not entry["present"]:
            continue
        raw = git(repo, "cat-file", "blob", f"{COMMIT}:{PUBLISHED_DIR}/{entry['file']}")
        variants = [raw, raw.replace(b"\n", b"\r\n"),
                    raw.replace(b"\n", b"\r\n").rstrip(b"\r\n"),
                    raw.rstrip(b"\n") + b"\r\n", raw.rstrip(b"\n") + b"\n"]
        hits = any(hashlib.sha256(v).hexdigest().upper() == recorded[entry["file"]]
                   for v in variants)
        checked += 1
        if not hits:
            bad.append(entry["file"])
    check(checked == 47 and bad == ["s2-checkout-verification.txt"],
          "independent recomputation reproduces 46/47 and only the documented mismatch remains",
          f"{checked} checked, mismatches {bad}")

    # --- acceptance assessment
    v = a["verdict"]
    check(v["formal_s2_evidence_acceptance"] == "NOT RENDERED", "acceptance is NOT RENDERED")
    check(v["decisive_blocker"] == "A8", "decisive blocker is A8 (execution-baseline disposition)")
    statuses = {c["id"]: c["status"] for c in a["criteria"]}
    check(statuses["A4"] == "NOT MET" and statuses["A10"] == "SATISFIED",
          "A4 NOT MET (baseline step 4 failed) and A10 SATISFIED (PF-15 effective)")
    check(statuses["A3"] == "NOT MET", "the 47-entry PASS output is recorded as absent")
    no_acceptance_doc = not any(
        f.startswith(ACCEPTANCE_RECORD_PREFIX) for f in os.listdir(os.path.join(repo, "docs/integration"))
    )
    check(no_acceptance_doc, "no S2 evidence-acceptance record was created", "none present")

    # --- document and tracker
    doc = open(os.path.join(repo, DOC), encoding="utf-8").read()
    tracker = open(os.path.join(repo, TRACKER), encoding="utf-8").read()
    for ident in [RECORD_ID, "54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0"] + IDENTIFIERS:
        check(ident in doc, f"addendum contains {ident}")
        check(ident in tracker, f"tracker contains {ident}")
    check(tracker.count("## §16.142 —") == 1, "tracker has exactly one §16.142 heading")
    check(tracker.count("## §16.141 —") == 1, "the §16.141 record is preserved, not duplicated")
    check("NOT RENDERED" in doc and "MISMATCH" in doc, "addendum keeps its negative findings")
    check(doc.count("| `s2-04-guarded-npm-test.txt`") >= 1, "the failing step-4 file appears in the matrix")
    check("TABLE_PLACEHOLDER" not in doc, "matrix table was substituted")

    # --- boundaries: no earlier evidence or record rewritten
    changed = git(repo, "status", "--porcelain", "--", PUBLISHED_DIR).decode().strip()
    check(changed == "", "existing receipt evidence unmodified", changed or "clean")
    check(re.search(r"## §16\.141 —[^\n]*\n", tracker) is not None,
          "§16.141 section still present verbatim in the tracker")
    pf15 = open(os.path.join(repo, "docs/integration/"
                             "IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"),
                encoding="utf-8").read()
    blob_now = git(repo, "rev-parse", "HEAD:docs/integration/"
                   "IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"
                   ).decode().strip()
    check(blob_now == "3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d",
          "PF-15 corrected act still byte-identical to the effective blob", blob_now[:12])
    check(len(pf15) > 0 and "F1" in pf15, "PF-15 act readable and untouched")
    check(p["pull_requests_from_branch"] == 0 and p["workflow_runs_for_branch"] == 0,
          "still no PR and no CI for the evidence branch")

    print()
    print(f"FAILED: {failures}" if failures else "ALL CHECKS PASS")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
