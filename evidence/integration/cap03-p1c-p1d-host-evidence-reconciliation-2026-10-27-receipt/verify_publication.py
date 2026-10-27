#!/usr/bin/env python3
"""Verify the §16.151 publication receipt (CV-CORR-131 / CHG-2026-10-27-08 / V1025).

Repository-side checks only. Re-checks the independent remote read-back record, the receipt bundle
digests, that the primary evidence bundle was NOT modified by this companion update, and that the
single authoritative tracker carries exactly one §16.151 with the receipt section. No host contact.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
B = pathlib.Path(__file__).resolve().parent
PRIMARY = ROOT / "evidence/integration/cap03-p1c-p1d-host-evidence-reconciliation-2026-10-27"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
MERGE = "acb97c9e1335dd3fc4c1c7c6f04c5be83a16a26d"
TREE = "50e4ab453343374feecdc5229acffaa793804d1c"
HEAD = "7c78f40e77b19b7ba83827e79cce34b8cbef2256"

fails = []


def check(cid, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + cid + (" :: " + detail if detail else ""))
    if not ok:
        fails.append(cid)


def sha(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()


d = json.loads((B / "00-publication-readback.json").read_text(encoding="utf-8"))

# Receipt bundle integrity.
sums = [l for l in (B / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
entries = {l.split(None, 1)[1].strip(): l.split(None, 1)[0].lower() for l in sums}
actual = {str(p.relative_to(B)) for p in B.rglob("*") if p.is_file() and p.name != "SHA256SUMS.txt"}
check("R-1", set(entries) == actual and all(sha(B / n) == h for n, h in entries.items()),
      f"{len(entries)} receipt files digested")

# Publication chain recorded, with exact-head and post-merge CI both green.
check("R-2", d["merge_commit"] == MERGE and d["merge_tree"] == TREE and d["tested_pr_head"] == HEAD
      and d["carrying_pr"] == 325 and d["ref"] == "refs/heads/main", "exact coordinates")
check("R-3", d["exact_head_ci"]["run_id"] == 40459212419 and d["exact_head_ci"]["conclusion"] == "success"
      and d["exact_head_ci"]["head_sha"] == HEAD, "green exact-head CI")
check("R-4", d["post_merge_main_ci"]["run_id"] == 40459451075
      and d["post_merge_main_ci"]["conclusion"] == "success"
      and d["post_merge_main_ci"]["head_sha"] == MERGE, "green post-merge main CI")
check("R-5", len(d["merge_parents"]) == 2 and HEAD in d["merge_parents"], "regular 2-parent merge")

# Independent remote blob/byte read-back.
check("R-6", d["artifacts_checked"] == 29 and d["artifacts_byte_identical"] == 29
      and d["all_match"] is True, "29/29 artifacts byte-identical")
check("R-7", all(a["present_at_merge"] and a["byte_identical"] and a["remote_sha256"] == a["local_sha256"]
                 and a["blob_sha"] == a["git_object_identity_recomputed"]
                 and a["remote_bytes"] == a["local_bytes"] for a in d["artifacts"]),
      "blob identity + decoded-byte SHA-256 + size reproduced per artifact")
check("R-8", d["all_content_checks_pass"] is True and all(d["content_checks"].values()),
      "decoded-tracker content checks")
check("R-9", "Git Blobs API" in d["method"] and "base64" in d["method"], "independent method declared")

# Primary bundle unchanged by the companion receipt.
prim_sums = [l for l in (PRIMARY / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
check("R-10", all(sha(PRIMARY / l.split(None, 1)[1].strip()) == l.split(None, 1)[0].lower()
                  for l in prim_sums), f"primary bundle {len(prim_sums)} digests still reproduce")
check("R-11", "NOT SUPPLIED" in (PRIMARY / "03-evidence-manifest.json").read_text(encoding="utf-8"),
      "operator evidence still explicitly missing")

# Tracker: single section, receipt present, no substantive drift.
t = TRACKER.read_text(encoding="utf-8")
check("R-12", len(re.findall(r"^## §16\.151 —", t, re.M)) == 1 and "### 16.151.8 Publication receipt" in t,
      "single §16.151 with receipt subsection")
check("R-13", "CHG-2026-10-27-08" in t and "`V1025`" in t and "40459212419" in t
      and "40459451075" in t and "29/29" in t, "receipt coordinates registered")
check("R-14", "NOT ESTABLISHED" in t and "NOT VERIFIED FOR THE ATTEMPT" in t
      and "UNSPENT / UNEXECUTED / NOT AUTHORIZED" in t, "no acceptance / no execution")
check("R-15", not any(list(d.rglob(n)) for d in (PRIMARY, B)
                      for n in ("*.sqlite", "*.sqlite-wal", "*.sqlite-shm", "*.sqlite-journal", "STOP.txt")),
      "no store/sidecar/STOP artifact in either evidence bundle")

print()
if fails:
    print(f"{len(fails)} CHECK(S) FAILED: {', '.join(fails)}")
    sys.exit(1)
print("PUBLICATION RECEIPT VERIFIED — chain green, 29/29 remote blobs byte-identical, P-1 unspent.")
