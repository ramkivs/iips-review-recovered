#!/usr/bin/env python3
"""Validate the S2 evidence-manifest verification receipt publication (docs only).

Checks that the receipt document, the two JSON evidence files, and the master
tracker section 16.138 contain every required verbatim element (nine filenames,
two preserved hashes, commit identifiers, boundary language), that identifiers
are unique, and that no prohibited overclaim (Arena recomputation / full
acceptance) is present. This script performs NO S2 execution, test run, build,
or manifest generation, and it does not access desktop-no0nhtp.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
RECEIPT = ROOT / "docs/integration/IIPS_v3.0_CAP03_S2_EVIDENCE_MANIFEST_VERIFICATION_RECEIPT_2026-10-26.md"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
BUNDLE = ROOT / "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26"
J00 = BUNDLE / "00-remote-state-reverification.json"
J01 = BUNDLE / "01-user-reported-windows-manifest-verification.json"

NINE = [
    "s2-01-npm-ci.txt",
    "s2-02-tsc-noemit.txt",
    "s2-03-build.txt",
    "s2-03-dist-count.txt",
    "s2-03-dist-sha256-before.txt",
    "s2-04-guarded-npm-test.txt",
    "s2-05-package-consumer.txt",
    "s2-post-run-pin.txt",
    "s2-dist-sha256-after.txt",
]
SUITE_SHA = "C5DDFFA24393AED2E391EF8A72E8BFF1F8ECD9576C4349E182B288785F1B2941"
CONSUMER_SHA = "9F7C64073A849E57D472C9CA30BB7616D04D1951626E90587241D61A470A85B1"
BASELINE = "8eec74ae27cda09f3c368b9c299895eae41554db"
CANDIDATE = "001c3c80618f2ee1d40e9a90912237e1a06e7b58"
CANDIDATE_TREE = "399fa44a5f1953c0f61b452420fefb5985426ef1"
RECORD_ID = "IIPS-V3-CAP03-S2-EVIDENCE-MANIFEST-VERIFICATION-RECEIPT-2026-10-26-01"

failures = []
checks = 0


def check(cond, msg):
    global checks
    checks += 1
    if not cond:
        failures.append(msg)
        print(f"FAIL: {msg}")
    return cond


def main():
    for p in (RECEIPT, TRACKER, J00, J01):
        check(p.is_file(), f"missing file: {p.relative_to(ROOT)}")
    if failures:
        print(f"{checks} checks, {len(failures)} failures")
        return 1

    receipt = RECEIPT.read_text(encoding="utf-8")
    tracker = TRACKER.read_text(encoding="utf-8")
    j00 = json.loads(J00.read_text(encoding="utf-8"))
    j01 = json.loads(J01.read_text(encoding="utf-8"))

    # Receipt + tracker must carry the nine filenames in order, hashes, commits.
    for label, text in (("receipt", receipt), ("tracker", tracker)):
        pos = -1
        for name in NINE:
            nxt = text.find(name, pos + 1)
            check(nxt > pos, f"{label}: filename missing or out of order: {name}")
            pos = max(pos, nxt)
        for token in (SUITE_SHA, CONSUMER_SHA, BASELINE, CANDIDATE, CANDIDATE_TREE,
                      "windows-session-transcript.txt", "desktop-no0nhtp", RECORD_ID):
            check(token in text, f"{label}: missing verbatim token: {token}")
        check("locked during hashing" in text, f"{label}: locked-exclusion wording missing")
        check("User-reported Windows verification" in text, f"{label}: classification missing")
        check("PENDING" in text and "NOT COMPLETE" in text or "NOT ACCEPTED" in text,
              f"{label}: raw-byte limitation wording missing")

    # Boundary: no overclaim of Arena recomputation or full acceptance.
    check("did not recompute" in receipt or "does not claim" in receipt,
          "receipt: non-recomputation disclaimer missing")
    check("Full S2 evidence acceptance" in receipt and "NOT ACCEPTED" in receipt,
          "receipt: full-acceptance non-claim missing")
    check("no S2 run" in receipt.lower() or "NO S2 RERUN" in receipt,
          "receipt: no-rerun statement missing")

    # Tracker structure / identifier uniqueness.
    check(tracker.count("## §16.138") == 1, "tracker: expected exactly one §16.138 heading")
    for token in ("CV-CORR-118", "CHG-2026-10-26-17", "V881", "V888"):
        check(token in tracker, f"tracker: missing identifier {token}")
    check(tracker.count(RECORD_ID) >= 2, "tracker: record ID should appear in header/CHG/§16.138")

    # JSON consistency.
    check(j00["irr"]["main_sha"] == "d9345004f5897ecb33fa532599b51a6ec799aa7a", "j00: IRR main mismatch")
    check(j00["ipd"]["corrected_candidate_commit"] == CANDIDATE, "j00: candidate mismatch")
    check(j00["ipd"]["corrected_candidate_tree"] == CANDIDATE_TREE, "j00: candidate tree mismatch")
    check(j00["ipd"]["approved_baseline_commit"] == BASELINE, "j00: baseline mismatch")
    files = [f["filename"] for f in j00["ipd"]["baseline_to_candidate_compare"]["files"]]
    check(files == ["scripts/verify-public-package.mjs", "tests/portfolio_ui_package.test.ts"],
          "j00: two-file change set mismatch")
    check(j00["windows_bytes_available_to_arena"] is False, "j00: bytes boundary must be false")

    results = {r["item"]: r for r in j01["results"]}
    check(results["Final manifest verification"]["reported_result"] == "PASS", "j01: PASS missing")
    check(results["Manifest entries"]["reported_result"] == 47, "j01: 47 entries missing")
    check(results["Required S2 filenames"]["required_filenames_in_order"] == NINE, "j01: nine mismatch")
    excl = results["Locked session transcript"]
    check(excl["excluded_filename"] == "windows-session-transcript.txt"
          and excl["excluded_from_47_entry_manifest"] is True, "j01: exclusion mismatch")
    suite = results["Corrected-candidate suite"]
    check((suite["total"], suite["passed"], suite["failed"], suite["skipped"]) == (924, 920, 0, 4),
          "j01: suite counts mismatch")
    check(suite["sha256_exact"] == SUITE_SHA, "j01: suite hash mismatch")
    check(results["Package-consumer check"]["sha256_exact"] == CONSUMER_SHA, "j01: consumer hash mismatch")
    dist = results["Distribution inventory"]
    check(dist["expected_count"] == 1140 and dist["actual_count"] == 1140, "j01: dist count mismatch")
    check(j01["arena_boundary"]["arena_recomputed_windows_hashes"] is False, "j01: boundary mismatch")

    print(f"{checks} checks, {len(failures)} failures")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
