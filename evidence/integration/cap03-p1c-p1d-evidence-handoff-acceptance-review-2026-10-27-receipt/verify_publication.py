#!/usr/bin/env python3
"""Verify the publication receipt for the CAP-03 §16.152 evidence-handoff review (CHG-2026-10-27-10, V1036).

Repository-side checks only: the receipt record's internal consistency, its agreement with the local
tested-head files, the primary bundle's continued integrity, and the tracker's receipt registration.
The remote read-back facts themselves were captured live via the GitHub Git APIs and are recorded in
00-publication-readback.json; this verifier re-checks them against the local repository state.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
B = pathlib.Path(__file__).resolve().parent
PRIMARY = ROOT / "evidence/integration/cap03-p1c-p1d-evidence-handoff-acceptance-review-2026-10-27"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
INSTRUMENT = ROOT / "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1"

failures = []


def check(cid, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + cid + (" :: " + detail if detail else ""))
    if not ok:
        failures.append(cid)


def sha(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()


rb = json.loads((B / "00-publication-readback.json").read_text(encoding="utf-8"))

# --- 1. Receipt metadata and CI chain. ---
check("RECEIPT-1", rb["record_id"] == "IIPS-V3-CAP03-P1C-P1D-EVIDENCE-HANDOFF-ACCEPTANCE-REVIEW-2026-10-27-01"
      and rb["receipt_id"] == "CHG-2026-10-27-10" and rb["verification_id"] == "V1036"
      and rb["carrying_pr"] == 327, "receipt ids and carrying PR")
check("RECEIPT-2", rb["exact_head_ci"]["run_id"] == 40468644586
      and rb["exact_head_ci"]["conclusion"] == "success" and rb["exact_head_ci"]["event"] == "pull_request"
      and rb["exact_head_ci"]["head_sha"] == rb["tested_pr_head"],
      "exact-head CI success at the tested head")
check("RECEIPT-3", rb["post_merge_main_ci"]["run_id"] == 40469213054
      and rb["post_merge_main_ci"]["conclusion"] == "success" and rb["post_merge_main_ci"]["event"] == "push"
      and rb["post_merge_main_ci"]["head_sha"] == rb["merge_commit"],
      "post-merge main CI success at the merge commit")
check("RECEIPT-4", sorted(rb["merge_parents"]) == sorted(
      ["c3a014fe74fc4bb5d253957f060c8f4c2e4a6662", "1457b628b0c663a0cf5b01540e91e85044eb7064"])
      and len(rb["merge_parents"]) == 2, "regular 2-parent merge with recorded parents")
check("RECEIPT-5", rb["tested_pr_head"] == "1457b628b0c663a0cf5b01540e91e85044eb7064"
      and rb["merge_commit"] == "8c8a0756d4b67eb841c81ef396b7a9cd3d7a080e"
      and rb["merge_parents"][1] if len(rb["merge_parents"]) > 1 else False,
      "tested head and merge coordinates exact")

# --- 2. Read-back result: every artifact byte-identical, every content check pass. ---
check("READBACK-1", rb["artifacts_checked"] == rb["artifacts_byte_identical"] == 18 and rb["all_match"] is True,
      "18/18 artifacts byte-identical")
check("READBACK-2", all(rb["content_checks"].values()) and rb["all_content_checks_pass"] is True,
      "all decoded-content checks pass")
changed_paths = [a["path"] for a in rb["artifacts"] if a["class"] == "changed"]
check("READBACK-3", len(changed_paths) == 11
      and sum(1 for a in rb["artifacts"] if a["class"] == "unchanged_primary_source") == 7,
      "11 changed artifacts + 7 unchanged primary-source blobs checked")

# --- 3. Agreement with the local repository state (merge commit is an ancestor of HEAD's history). ---
merge = rb["merge_commit"]
is_ancestor = subprocess.run(["git", "merge-base", "--is-ancestor", merge, "HEAD"],
                             cwd=ROOT, capture_output=True).returncode == 0
check("LOCAL-1", is_ancestor, f"merge commit {merge[:8]} is an ancestor of the current branch")
# The tracker is legitimately updated BY THIS receipt (§16.152.8 fill-in + rows); every other
# artifact must still match the tested-head bytes exactly.
tracker_path = "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
non_tracker = [a for a in rb["artifacts"] if a["path"] != tracker_path]
for a in non_tracker:
    p = ROOT / a["path"]
    same = p.is_file() and sha(p) == a["local_sha256"] and p.stat().st_size == a["local_bytes"]
    if not same:
        check("LOCAL-2", False, f"local drift vs tested head at {a['path']}")
        break
else:
    check("LOCAL-2", True, f"every non-tracker artifact ({len(non_tracker)}) still matches the tested-head bytes")
# The tracker's version AS MERGED must equal the remote-read-back bytes (the receipt builds on it).
merged_tracker = subprocess.run(["git", "-C", str(ROOT), "show", f"{merge}:{tracker_path}"],
                                capture_output=True).stdout
merged_entry = next(a for a in rb["artifacts"] if a["path"] == tracker_path)
check("LOCAL-3", hashlib.sha256(merged_tracker).hexdigest() == merged_entry["local_sha256"]
      and len(merged_tracker) == merged_entry["local_bytes"],
      "tracker blob at the merge commit equals the remote-read-back tested-head bytes")
blob_ok = all(subprocess.run(["git", "-C", str(ROOT), "rev-parse", "HEAD:" + a["path"]],
                             capture_output=True, text=True).stdout.strip() == a["blob_sha"]
              for a in non_tracker)
check("LOCAL-4", blob_ok, "every non-tracker artifact's git blob id at HEAD equals the remote read-back blob id")

# --- 4. Primary bundle integrity unchanged; instrument unchanged. ---
sums = (PRIMARY / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines()
ok = True
for line in sums:
    if line.strip():
        h, n = line.split(None, 1)
        if sha(PRIMARY / n.strip().lstrip("*")) != h.lower():
            ok = False
check("PRIMARY-1", ok, "primary bundle still reproduces its SHA256SUMS")
check("PRIMARY-2", sha(INSTRUMENT) == "85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b",
      "published instrument digest unchanged")

# --- 5. Tracker registration of the receipt. ---
t = TRACKER.read_text(encoding="utf-8")
check("TRACKER-1", t.count("## §16.152 —") == 1
      and "CHG-2026-10-27-10" in t and "`V1036`" in t,
      "single §16.152 heading; receipt identifiers registered")
check("TRACKER-2", "40468644586" in t and "40469213054" in t and "8c8a0756d4b67eb841c81ef396b7a9cd3d7a080e" in t
      and "1457b628b0c663a0cf5b01540e91e85044eb7064" in t,
      "PR/CI/merge coordinates recorded in the tracker receipt")
check("TRACKER-3", "SUPERSEDED FOR ACCEPTANCE" in t and "NOT REPRODUCIBLE" in t
      and "NOT ESTABLISHED" in t and "NOT VERIFIED FOR THE ATTEMPT" in t,
      "substantive conclusions carried in the tracker")
check("TRACKER-4", "UNSPENT / UNEXECUTED / NOT AUTHORIZED" in t or
      ("UNSPENT" in t and "NOT AUTHORIZED" in t), "P-1 unspent/unauthorized language present")

# --- 6. Receipt bundle integrity. ---
rsums = (B / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines()
entries = {}
for line in rsums:
    if line.strip():
        h, n = line.split(None, 1)
        entries[n.strip().lstrip("*")] = h.lower()
actual = {str(p.relative_to(B)) for p in B.rglob("*") if p.is_file() and p.name != "SHA256SUMS.txt"}
check("BUNDLE-1", set(entries) == actual, f"{len(entries)} listed / {len(actual)} present")
check("BUNDLE-2", all(sha(B / n) == h for n, h in entries.items()), "receipt bundle digests recompute")
status = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
changed = [ln[3:].strip().strip('"') for ln in status.splitlines() if ln[3:].strip()]
allowed_pred = (TRACKER.name, str(B.relative_to(ROOT)))
ok_scope = all(any(p == q or p.startswith(q + "/") for q in allowed_pred) for p in changed)
check("SCOPE-1", ok_scope, f"receipt update touches only the tracker and this receipt bundle ({len(changed)} paths)")

print()
if failures:
    print(f"{len(failures)} CHECK(S) FAILED: {', '.join(failures)}")
    sys.exit(1)
print("PUBLICATION RECEIPT VERIFIED — 18/18 remote read-back match; primary bundle intact; "
      "tracker reconciled; P-1 unspent.")
