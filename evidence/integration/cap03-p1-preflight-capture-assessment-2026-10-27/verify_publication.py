#!/usr/bin/env python3
"""Validate the section 16.148 publication read-back record (02-publication-readback.json).

Offline consistency check: the read-back itself was performed against the GitHub Contents +
Git Blobs APIs at merge commit 8470ce26b3e6a68ca9e5a562fa6dd88cfad18b1c (PR #318); this script
verifies that the recorded machine record is internally consistent and complete.
"""
import json
import pathlib
import sys

BUNDLE = pathlib.Path(__file__).resolve().parent
rec = json.loads((BUNDLE / "02-publication-readback.json").read_text(encoding="utf-8"))
failures = []


def check(cid, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + cid + (" :: " + detail if detail else ""))
    if not ok:
        failures.append(cid)


check("PUB-1", rec["pr"] == 318 and rec["merge_commit"].startswith("8470ce26")
      and len(rec["merge_parents"]) == 2, "PR #318, regular 2-parent merge")
check("PUB-2", rec["ci_conclusions"] == {"exact_head": "success", "post_merge_main": "success"}
      and rec["exact_head_ci_run"] == 40400127948 and rec["post_merge_main_ci_run"] == 40400388258,
      "green exact-head and post-merge main CI")
check("PUB-3", len(rec["files"]) == 7 and all(
    f["match"] and f["sha256_remote"] == f["sha256_local"] for f in rec["files"])
    and rec["all_match"] is True, "7/7 remote blobs byte-identical at merge")
check("PUB-4", rec["tracker_single_section_16_148_heading"] is True,
      "single section 16.148 heading in merged tracker")

print()
if failures:
    print("PUBLICATION RECORD INVALID:", failures)
    sys.exit(1)
print("PUBLICATION RECORD VERIFIED")
