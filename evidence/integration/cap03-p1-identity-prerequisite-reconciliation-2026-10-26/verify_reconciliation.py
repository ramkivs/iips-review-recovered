#!/usr/bin/env python3
"""Deterministic documentation-integrity validator for the CAP-03 P-1
identity-prerequisite reconciliation (tracker §16.140 / CV-CORR-120).

Checks, without any provisioning/host access:
  * the reconciliation receipt carries the exact PA values, recomputed
    value hashes / derived ids, live blob/commit identities, the
    P-1-A..P-1-F classifications, the not-yet-authorized determination,
    the single next action, and the boundary language;
  * tracker §16.140 exists exactly once with CV-CORR-120 / CHG / V-rows;
  * 00-remote-identity-and-pin-readback.json is internally consistent
    (determination == compiled == test values; ancestry behind_by == 0;
    baseline->candidate is exactly the two tooling files; PF-15 blob);
  * the worktree change set is limited to the declared documentation
    paths (no code, fence, pin, manifest, or database change).

Exit 0 = all checks pass; any failure raises AssertionError.
"""
import hashlib
import json
import pathlib
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
RECEIPT = ROOT / "docs/integration/IIPS_v3.0_CAP03_P1_IDENTITY_PREREQUISITE_RECONCILIATION_2026-10-26.md"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
EVIDENCE = HERE / "00-remote-identity-and-pin-readback.json"

VALUES = {
    "principal_label": ("ramki-personal-local", 20,
                        "2df04453ca2845fcbaea0e496bbc2da4c056a2f40e9b83b72c10c88190858324"),
    "tenantId": ("ipd-personal-local", 18,
                 "ae82ba19825eaae52f3732e6b6b1302c672f6548b830b883f377822d1876a730"),
    "canonicalOwnerId": ("ipd-owner-ramki-personal", 24,
                         "3084b2ed3e43a85b668368268ff798da6633ce5e629f3948654ebb1c429e47c8"),
}
BINDING_ID = "c5808abaffd072d6401ce63ad86c6ac0"
MEMBERSHIP_ID = "d25dcc5370100b00766efc5166f65cf3"

REQUIRED_IN_RECEIPT = [
    "IIPS-V3-CAP03-P1-IDENTITY-PREREQUISITE-RECONCILIATION-2026-10-26-01",
    "IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01",
    "IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01",
    "Identity-value decision: `SATISFIED`",
    "b7746b5ed955abcf689ec57ca4a0748c0241ed09",
    "528de6aeddbc8e5f3191be8792f3937d77de4037",
    "df5d48a583c9aaed51af90a90225c15c408fbd33",
    "2cbce83f6572d211630ce0620dae49fa02fe4622",
    "d8568b0ebe2bec2a7a2f38ed758e1f877f861704",
    "1864f908b26322071a866cc3a3dab074faa536fd",
    "888eb375eebee01640e44ccdcbb138a71e8c4513",
    "cc3c000a11fd586c540a84a8d139c4b2c39cd121",
    "8eec74ae27cda09f3c368b9c299895eae41554db",
    "001c3c80618f2ee1d40e9a90912237e1a06e7b58",
    "399fa44a5f1953c0f61b452420fefb5985426ef1",
    "3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d",
    "P-1-A", "P-1-B", "P-1-C", "P-1-D", "P-1-E", "P-1-F",
    "NOT ACCEPTED / NOT RENDERED",
    "PENDING / NOT COMPLETE",
    "s2-post-run-pin.txt",
    "Identifier collision with IPD PR #98",
    "byte-identical",
    "888eb375eebee01640e44ccdcbb138a71e8c4513",
    "WRITE_NOT_AUTHORIZED",
    "durable:false",
    "0` IPD writes",
] + [v for v, _, _ in VALUES.values()] + [h for _, _, h in VALUES.values()] + [BINDING_ID, MEMBERSHIP_ID]

REQUIRED_IN_TRACKER = [
    "§16.140", "CV-CORR-120", "CHG-2026-10-26-21",
    "IIPS-V3-CAP03-P1-IDENTITY-PREREQUISITE-RECONCILIATION-2026-10-26-01",
    "SATISFIED",
    "ramki-personal-local", "ipd-personal-local", "ipd-owner-ramki-personal",
]

ALLOWED_CHANGED_PREFIXES = (
    "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md",
    "docs/integration/IIPS_v3.0_CAP03_P1_IDENTITY_PREREQUISITE_RECONCILIATION_2026-10-26.md",
    "evidence/integration/cap03-p1-identity-prerequisite-reconciliation-2026-10-26/",
)


def check(cond, msg):
    assert cond, msg
    print(f"PASS  {msg}")


def main():
    receipt = RECEIPT.read_text(encoding="utf-8")
    tracker = TRACKER.read_text(encoding="utf-8")
    ev = json.loads(EVIDENCE.read_text(encoding="utf-8"))

    for field, (value, nbytes, digest) in VALUES.items():
        check(len(value.encode("utf-8")) == nbytes, f"{field} byte length {nbytes}")
        check(hashlib.sha256(value.encode("utf-8")).hexdigest() == digest,
              f"{field} SHA-256 recomputed")
    check(hashlib.sha256(b"binding:ramki-personal-local").hexdigest()[:32] == BINDING_ID,
          "binding_id recomputed")
    check(hashlib.sha256(b"membership:ipd-personal-local:ipd-owner-ramki-personal").hexdigest()[:32] == MEMBERSHIP_ID,
          "membership_id recomputed")

    for s in REQUIRED_IN_RECEIPT:
        check(s in receipt, f"receipt contains: {s[:72]}")
    for s in REQUIRED_IN_TRACKER:
        check(s in tracker, f"tracker contains: {s[:72]}")
    check(tracker.count("## §16.140") == 1, "exactly one §16.140 heading")
    for vid in [f"`V{n}`" for n in range(907, 916)]:
        check(vid in tracker, f"tracker contains verification row {vid}")

    det = ev["identity_determination_at_ipd_main"]
    check(det["git_blob"] == "b7746b5ed955abcf689ec57ca4a0748c0241ed09" and det["size"] == 35936,
          "evidence: determination blob/size at live IPD main")
    check(det["derived_ids_recomputed"] == {"binding_id": BINDING_ID, "membership_id": MEMBERSHIP_ID},
          "evidence: derived ids")
    impl = ev["implementation_at_ipd_main"]
    check(impl["determination_compiled_test_all_equal"] is True,
          "evidence: determination == compiled == test values")
    check(impl["validation"]["compiled_constants"] ==
          {k: v for k, (v, _, _) in VALUES.items()}, "evidence: compiled constants exact")
    for label, anc in ev["ancestry"].items():
        check(anc["behind_by"] == 0 and anc["status"] == "ahead", f"evidence: ancestry {label}")
    files = [f["filename"] for f in ev["baseline_to_candidate_files"]]
    check(files == ["scripts/verify-public-package.mjs", "tests/portfolio_ui_package.test.ts"],
          "evidence: baseline->candidate is exactly the two tooling files")
    blobs = ev["blob_identity_across_refs"]
    for key in ["determination", "successor_act", "validation", "provisioning"]:
        got = {blobs[r][key]["git_blob"] for r in blobs}
        check(len(got) == 1, f"evidence: {key} blob identical across all refs")
    pf15 = ev["pf15_corrected_act_at_irr_main"]
    check(pf15["git_blob"] == "3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d"
          and pf15["sha256_of_blob_bytes"] == "1f5c9e1d9d69cf15a51ec77e41bd70f07ba69516d6a944bf3a79678c6c19a033",
          "evidence: PF-15 corrected act blob at live IRR main")
    check(pf15["code_spans"]["F2_endpoint"]["length"] == 31
          and pf15["code_spans"]["F4_store"]["length"] == 39
          and pf15["code_spans"]["F5_evidence_root"]["length"] == 28,
          "evidence: PF-15 F2/F4/F5 span lengths")
    check(ev["boundaries"] == {"windows_host_contacted": False, "database_created": False,
                                "provisioning_executed": False, "ipd_writes": 0},
          "evidence: execution boundaries")

    status = subprocess.run(["git", "status", "--porcelain"], capture_output=True,
                            text=True, cwd=ROOT, check=True).stdout
    changed = [line[3:].strip() for line in status.splitlines() if line.strip()]
    for path in changed:
        check(path.startswith(ALLOWED_CHANGED_PREFIXES), f"change set limited: {path}")
        check(not path.endswith((".sqlite", ".db", "-wal", "-shm")), f"no database artifact: {path}")
    print(f"\nALL CHECKS PASSED ({len(changed)} changed path(s) in scope)")


if __name__ == "__main__":
    main()
