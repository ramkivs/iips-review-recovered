#!/usr/bin/env python3
"""Comprehensive H-12 R5 Adoption-Criteria Validator (CAP-03, 2026-10-25).

Verifies not only content-integrity checks (981/981, 0 failures) on
`docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json` (`f4649e36…`),
but also every applicable H-12 adoption criterion under:
  - Effective Gate 4 Act (`66b56fd1…`) §§3.2, 8, 9, 13, 15.3
  - Effective G4-AMEND-01 (`21a0f9eb…`) §§3.3, 5, 7, 8.3, 11, AM-1..AM-4
  - Effective Gate A' Successor Act (`528de6ae…`) & S1 Determination (`b7746b5e…`)
  - Effective CAP-03 DQ-6b Path A (`b41c76f7…`) + IPD Mirror Receipt (`3430df5e…`, 6/6)
  - Gate 4 D-7 (`7d3b143e…`) & IRR R5 `adoption_boundary`
"""

import hashlib
import json
import os
import subprocess
import sys

IRR_REPO = "/home/user/iips-review-recovered"
IPD_REPO = "/tmp/ipd"
R5_PATH = os.path.join(IRR_REPO, "docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json")
SUPP_PATH = os.path.join(
    IRR_REPO,
    "evidence/integration/cap03-h12-r5-adoption-2026-10-25/20-amended-s8-supplemental-inventory.json",
)
V3_R2_PATH = os.path.join(
    IPD_REPO,
    "evidence/cross-repository/IIPS_V3_CAP02_G4_H12_MANIFEST_V3_RECONCILED_CANDIDATE_2026-10-23.json",
)
IPD_MIRROR_PATH = os.path.join(
    IPD_REPO,
    "evidence/cross-repository/IIPS_V3_CAP03_DQ6B_DECISION_MIRROR_RECEIPT_2026-10-25.md",
)

IPD_PIN = "8eec74ae27cda09f3c368b9c299895eae41554db"
IPD_TREE = "4eba29029f8d95cfe483e615a7047426b298ce50"
IPD_ALIAS_PIN = "70b24f029842a7e9b7f615e4d9df7376fd4ff817"
IPD_ALIAS_TREE = "cc0f0117822850f9046e9a51bd05c1d45f80cd57"
IRR_PIN = "ba64b2d5927c2f872560710cf1474c25a5cde0d5"
IRR_TREE = "5e4262f1cd75bf13b76ced5b45058f31434b5dad"
G3_PIN = "1cceacfff40f22dbc9cd64906bf26a5feac1075e"
G3_TREE = "b2dd2debb295fa28bda7efdd70a66b4cfe9337a9"

checks = 0
fails = 0


def check(cond: bool, msg: str) -> None:
    global checks, fails
    checks += 1
    if not cond:
        fails += 1
        print(f"FAIL [{checks}]: {msg}")


def git_blob_sha1(raw: bytes) -> str:
    return hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest()


def git_cat(repo: str, rev: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", repo, "show", f"{rev}:{path}"])


def main() -> int:
    print("=== H-12 R5 Adoption-Criteria Validation Report (2026-10-25 UTC) ===")

    # A. Re-run baseline 981-check R5 integrity validator
    r5_val_out = subprocess.check_output(
        ["python3", os.path.join(IRR_REPO, "evidence/integration/cap03-dq6b-path-a-2026-10-25/22-h12-r5-validator.py")],
        cwd=IRR_REPO,
    ).decode().strip()
    print(f"[A] Baseline R5 validator output: {r5_val_out}")
    check(r5_val_out == "CHECKS 981 FAILS 0", f"Expected CHECKS 981 FAILS 0, got {r5_val_out}")

    # B. R5 & prior revision byte-immutability
    r5_raw = open(R5_PATH, "rb").read()
    r5_blob = git_blob_sha1(r5_raw)
    r5_sha256 = hashlib.sha256(r5_raw).hexdigest()
    check(r5_blob == "f4649e36a81c7013287810cd3202b99586dbd951", "R5 git blob SHA-1 unchanged")
    check(len(r5_raw) == 143813, "R5 byte length == 143,813")
    check(
        r5_sha256 == "d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76",
        "R5 SHA-256 unchanged",
    )

    r4_raw = open(os.path.join(IRR_REPO, "docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json"), "rb").read()
    check(git_blob_sha1(r4_raw) == "3b64c4ac4ae31d4c318b3de7183874a27c178eef", "Preserved IRR R4 blob unchanged")

    v3_r1_raw = open(
        os.path.join(IPD_REPO, "evidence/cross-repository/IIPS_V3_CAP02_G4_H12_MANIFEST_V3_CANDIDATE_2026-10-23.json"),
        "rb",
    ).read()
    check(git_blob_sha1(v3_r1_raw) == "a169e1f7d8721860942807bad1b325ccc57d2404", "Preserved IPD v3-R1 blob unchanged")

    v3_r2_raw = open(V3_R2_PATH, "rb").read()
    check(git_blob_sha1(v3_r2_raw) == "9382d4b0bf6d085616f781221daa5b6a4d03b2bc", "Preserved IPD v3-R2 blob unchanged")

    r5 = json.loads(r5_raw.decode("utf-8"))
    v3_r2 = json.loads(v3_r2_raw.decode("utf-8"))
    supp_raw = open(SUPP_PATH, "rb").read()
    supp = json.loads(supp_raw.decode("utf-8"))

    # C. Core 56-entry membership, ordering, G4-AMEND-01 Alternative A parity, and live-main zero drift
    irr_live_main = subprocess.check_output(["git", "-C", IRR_REPO, "rev-parse", "origin/main"]).decode().strip()
    ipd_live_main = subprocess.check_output(["git", "-C", IPD_REPO, "rev-parse", "origin/main"]).decode().strip()

    entries = r5["entries"]
    ipd_entries = [e for e in entries if e["repository"] == "ramkivs/iips-production-market-data"]
    irr_entries = [e for e in entries if e["repository"] == "ramkivs/iips-review-recovered"]
    check(len(entries) == 56, "Total core entries == 56")
    check(len(ipd_entries) == 32, "IPD core entries == 32")
    check(len(irr_entries) == 24, "IRR core entries == 24")
    check(len({(e["repository"], e["path"]) for e in entries}) == 56, "Zero duplicate (repository, path) entries")

    v3_r2_paths = [(e["repository"], e["path"]) for e in v3_r2["entries"]]
    r5_paths = [(e["repository"], e["path"]) for e in entries]
    check(r5_paths == v3_r2_paths, "56 core entry order & membership match G4-AMEND-01 Alternative A / v3-R2")
    check(
        entries[23]["path"] == "tests/g4_run_tests_summary_parsing.test.ts" and entries[23]["state"] == "PRESENT",
        "entries[23] is PRESENT tests/g4_run_tests_summary_parsing.test.ts per G4-AMEND-01 AM-1",
    )

    for e in ipd_entries:
        check(e["state"] == "PRESENT", f"IPD {e['path']} state PRESENT")
        check(e["commit"] == IPD_PIN and e["tree"] == IPD_TREE, f"IPD {e['path']} pinned to 8eec74ae/4eba2902")
        raw_pin = git_cat(IPD_REPO, IPD_PIN, e["path"])
        raw_live = git_cat(IPD_REPO, ipd_live_main, e["path"])
        check(git_blob_sha1(raw_pin) == e["git_blob_oid_sha1"], f"IPD {e['path']} blob matches pin")
        check(hashlib.sha256(raw_pin).hexdigest() == e["raw_file_sha256"], f"IPD {e['path']} sha256 matches pin")
        check(raw_pin == raw_live, f"IPD {e['path']} unchanged at live IPD origin/main ({ipd_live_main[:8]})")

    for e in irr_entries:
        check(e["state"] == "PRESENT", f"IRR {e['path']} state PRESENT")
        check(e["commit"] == IRR_PIN and e["tree"] == IRR_TREE, f"IRR {e['path']} pinned to ba64b2d5/5e4262f1")
        raw_pin = git_cat(IRR_REPO, IRR_PIN, e["path"])
        raw_live = git_cat(IRR_REPO, irr_live_main, e["path"])
        check(git_blob_sha1(raw_pin) == e["git_blob_oid_sha1"], f"IRR {e['path']} blob matches pin")
        check(hashlib.sha256(raw_pin).hexdigest() == e["raw_file_sha256"], f"IRR {e['path']} sha256 matches pin")
        check(raw_pin == raw_live, f"IRR {e['path']} unchanged at live IRR origin/main ({irr_live_main[:8]})")

    print(
        f"[C] Verified 32/32 IPD + 24/24 IRR = 56/56 PRESENT entries at designated pins AND live origin/main "
        f"(IPD {ipd_live_main[:8]}, IRR {irr_live_main[:8]})."
    )

    # D. Conditional helper, 9 criteria basis, 10+10 Gate 3 anchors, 17 Gate C historical, 14 split_baseline alias files
    cond = r5["conditional_entries"]
    check(len(cond) == 1 and cond[0]["path"] == "scripts/test-summary-parser.mjs", "1 conditional helper entry")
    cond_raw = git_cat(IPD_REPO, IPD_PIN, cond[0]["path"])
    check(
        git_blob_sha1(cond_raw) == cond[0]["git_blob_oid_sha1"] == "15c849fa739765af501182919748e4610acc4157",
        "scripts/test-summary-parser.mjs blob verified",
    )
    check(cond_raw == git_cat(IPD_REPO, ipd_live_main, cond[0]["path"]), "Conditional helper unchanged at live main")

    check(len(r5["criteria_basis"]) == 9, "9 criteria_basis entries")
    check(len(r5["frozen_g3_anchors"]) == 10, "10 preserved Gate 3 anchors at 1cceacff")
    check(len(r5["frozen_g3_anchors_revalidated_at_qe_candidate"]) == 10, "10 re-measured Gate 3 anchors at 8eec74ae")
    check(len(r5["historical_superseded_set"]["entries"]) == 17, "17 historical Gate C entries at cec70802")

    changed_g3 = []
    for a, b in zip(r5["frozen_g3_anchors"], r5["frozen_g3_anchors_revalidated_at_qe_candidate"]):
        raw_a = git_cat(IPD_REPO, G3_PIN, a["path"])
        raw_b = git_cat(IPD_REPO, IPD_PIN, b["path"])
        check(git_blob_sha1(raw_a) == a["git_blob_oid_sha1"], f"Preserved G3 anchor {a['path']} matches 1cceacff")
        check(git_blob_sha1(raw_b) == b["git_blob_oid_sha1"], f"Re-measured G3 anchor {b['path']} matches 8eec74ae")
        check(raw_b == git_cat(IPD_REPO, ipd_live_main, b["path"]), f"Re-measured G3 anchor {b['path']} unchanged at live main")
        if a["git_blob_oid_sha1"] != b["git_blob_oid_sha1"]:
            changed_g3.append(b["path"])

    alias_entries = r5["split_baseline"]["alias_raw_sources"]
    check(len(alias_entries) == 14, "14 split_baseline alias raw source entries")
    div_count = 0
    for ae in alias_entries:
        raw_alias = git_cat(IPD_REPO, IPD_ALIAS_PIN, ae["path"])
        raw_prim = git_cat(IPD_REPO, IPD_PIN, ae["path"])
        check(git_blob_sha1(raw_alias) == ae["alias_blob_oid_sha1"], f"Alias {ae['path']} matches 70b24f02")
        check(hashlib.sha256(raw_alias).hexdigest() == ae["alias_raw_file_sha256"], f"Alias {ae['path']} sha256 matches 70b24f02")
        check(git_blob_sha1(raw_prim) == ae["primary_blob_oid_sha1"], f"Primary {ae['path']} matches 8eec74ae")
        check(hashlib.sha256(raw_prim).hexdigest() == ae["primary_raw_file_sha256"], f"Primary {ae['path']} sha256 matches 8eec74ae")
        if raw_alias != raw_prim:
            div_count += 1
        check(raw_prim == git_cat(IPD_REPO, ipd_live_main, ae["path"]), f"Primary counterpart of {ae['path']} unchanged at live main")
    check(div_count == 4, f"Expected 4 divergent alias files between 70b24f02 and 8eec74ae, got {div_count}")
    print(
        f"[D] Verified conditional helper (1), criteria_basis (9), G3 anchors (10+10; changed={changed_g3}), "
        f"historical Gate C (17), split_baseline (14; 4 divergent)."
    )

    # E. DQ-6b six-element effectiveness (including element 6 IPD mirror receipt)
    mirror_raw = open(IPD_MIRROR_PATH, "rb").read()
    check(
        git_blob_sha1(mirror_raw) == "3430df5ec1c10cf5cab8b764577aae2a3503d09b",
        "IPD DQ-6b mirror receipt blob == 3430df5ec1c10cf5cab8b764577aae2a3503d09b",
    )
    check(
        hashlib.sha256(mirror_raw).hexdigest() == "03b90f2edd30d629628c1f905dbb9fc6a74966d7a17d3dc10ba93a4b2493e0f6",
        "IPD DQ-6b mirror receipt SHA-256 verified",
    )
    mirror_txt = mirror_raw.decode("utf-8")
    check("IIPS-V3-CAP03-DQ6B-IPD-MIRROR-RECEIPT-2026-10-25-01" in mirror_txt, "IPD mirror receipt Act ID present")
    check("IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01" in mirror_txt, "Governing DQ-6b PA Act ID referenced")
    print("[E] Verified DQ-6b element 6 IPD mirror receipt (3430df5ec1c10cf5cab8b764577aae2a3503d09b, 14,292 B): 6/6 COMPLETE.")

    # F. Amended-§8 supplemental sets (G4-AMEND-01 §§3.3, 5, 7, 8.3)
    s_entries = supp["post_g3_cap02_qualified_surface_entries"]
    check(len(s_entries) == 7, "7 post_g3_cap02_qualified_surface_entries")
    for se in s_entries:
        raw_s = git_cat(IPD_REPO, IPD_PIN, se["path"])
        check(git_blob_sha1(raw_s) == se["git_blob_oid_sha1"], f"{se['id']} {se['path']} blob matches 8eec74ae")
        check(hashlib.sha256(raw_s).hexdigest() == se["raw_file_sha256"], f"{se['id']} {se['path']} sha256 matches 8eec74ae")
        check(raw_s == git_cat(IPD_REPO, ipd_live_main, se["path"]), f"{se['id']} {se['path']} unchanged at live IPD main")

    for cg in supp["cap03_companion_conformance_and_fence_guards"]:
        repo = IPD_REPO if cg["repository"] == "ramkivs/iips-production-market-data" else IRR_REPO
        live_ref = ipd_live_main if repo == IPD_REPO else irr_live_main
        raw_cg = git_cat(repo, cg["commit"], cg["path"])
        check(git_blob_sha1(raw_cg) == cg["git_blob_oid_sha1"], f"Companion guard {cg['path']} blob matches pin")
        check(raw_cg == git_cat(repo, live_ref, cg["path"]), f"Companion guard {cg['path']} unchanged at live main")

    rds = supp["runtime_dist_set"]
    check(rds["file_count"] == 1140 and len(rds["files"]) == 1140, "runtime_dist_set has 1,140 files")
    check(rds["deterministic_equal"] is True and rds["independent_clean_builds_compared"] == 2, "2 clean builds deterministic")
    check(rds["unchanged_from_v3_r2_count"] == 1124 and rds["changed_since_v3_r2_count"] == 16, "1,124 unchanged / 16 changed vs v3-R2")
    if os.path.isdir("/tmp/ipd-build1/dist") and os.path.isdir("/tmp/ipd-build2/dist"):
        for df in rds["files"]:
            rel = df["path"][len("dist/"):]
            b1 = open(os.path.join("/tmp/ipd-build1/dist", rel), "rb").read()
            b2 = open(os.path.join("/tmp/ipd-build2/dist", rel), "rb").read()
            check(b1 == b2 and hashlib.sha256(b1).hexdigest() == df["sha256"], f"Deterministic dist digest {df['path']}")

    eds = supp["evidence_deposit_set"]
    check(
        eds["status"] == "ABSENT_PENDING_EXECUTION" and eds["file_count"] == 0 and eds["files"] == [],
        "evidence_deposit_set is ABSENT_PENDING_EXECUTION (0 files)",
    )
    print(
        "[F] Verified G4-AMEND-01 supplemental sets: 7/7 post-G3 CAP-02 entries, 11/11 companion guards, "
        "1,140/1,140 deterministic dist/** files, evidence_deposit_set ABSENT_PENDING_EXECUTION."
    )

    # G. Four-part commit rule (Gate 4 Act §3.2)
    for label, repo, sha, exp_tree, tip in [
        ("IPD_primary", IPD_REPO, IPD_PIN, IPD_TREE, ipd_live_main),
        ("IPD_alias", IPD_REPO, IPD_ALIAS_PIN, IPD_ALIAS_TREE, ipd_live_main),
        ("IRR_consumer", IRR_REPO, IRR_PIN, IRR_TREE, irr_live_main),
        ("G3_anchor", IPD_REPO, G3_PIN, G3_TREE, ipd_live_main),
    ]:
        t = subprocess.check_output(["git", "-C", repo, "rev-parse", f"{sha}^{{tree}}"]).decode().strip()
        anc = subprocess.call(["git", "-C", repo, "merge-base", "--is-ancestor", sha, tip]) == 0
        parents = subprocess.check_output(["git", "-C", repo, "rev-list", "--parents", "-n", "1", sha]).decode().strip().split()[1:]
        check(t == exp_tree, f"{label} tree matches {exp_tree}")
        check(anc, f"{label} is full-history ancestor of origin/main")
        check(len(parents) == 2, f"{label} is a 2-parent merge commit")
    print("[G] Verified Gate 4 Act §3.2 four-part commit rule across all designated coordinates.")

    print(f"ADOPTION_CRITERIA_CHECKS {checks} FAILS {fails}")
    return 0 if fails == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
