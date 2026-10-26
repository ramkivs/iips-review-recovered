#!/usr/bin/env python3
"""Live remote evidence collector for the CAP-03 P-1 identity-prerequisite
reconciliation (tracker §16.140 / CV-CORR-120).

Read-only. Queries the GitHub REST/Git APIs for both authoritative loci
(IRR ramkivs/iips-review-recovered, IPD ramkivs/iips-production-market-data),
decodes the S1 identity-value determination, the Gate A' successor
provisioning act, and the act-bound implementation at the live IPD main,
recomputes the determination's value hashes / derived ids, and writes
00-remote-identity-and-pin-readback.json next to this script.

It executes no provisioning, contacts no Windows host, creates no database,
and writes nothing to either remote.
"""
import base64
import hashlib
import json
import pathlib
import re
import subprocess

IRR = "ramkivs/iips-review-recovered"
IPD = "ramkivs/iips-production-market-data"
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = HERE / "00-remote-identity-and-pin-readback.json"

DET_PATH = "evidence/cross-repository/IIPS_V3_CAP02_S1_IDENTITY_VALUE_DETERMINATION_EFFECTIVE_2026-10-24.md"
SUC_PATH = "evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md"
VAL_PATH = "src/persistence/gateAPrimeValidation.ts"
PROV_PATH = "src/persistence/gateAPrimeProvisioning.ts"
TEST_PATH = "tests/g3_gate_a_prime_successor_provisioning.test.ts"
IPD_TRACKER_PATH = "evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md"
PF15_PATH = "docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"

BASELINE = "8eec74ae27cda09f3c368b9c299895eae41554db"
CANDIDATE = "001c3c80618f2ee1d40e9a90912237e1a06e7b58"
PR80_MERGE = "d8568b0ebe2bec2a7a2f38ed758e1f877f861704"
PR81_MERGE = "1864f908b26322071a866cc3a3dab074faa536fd"


def gh_api(repo_path):
    r = subprocess.run(["gh", "api", repo_path], capture_output=True, text=True, cwd=ROOT)
    assert r.returncode == 0, (repo_path, r.stderr[:600])
    return json.loads(r.stdout)


def gh(args):
    r = subprocess.run(["gh", *args], capture_output=True, text=True, cwd=ROOT)
    assert r.returncode == 0, (args, r.stderr[:600])
    return json.loads(r.stdout)


def ls_remote(url):
    r = subprocess.run(["git", "ls-remote", url, "refs/heads/main", "HEAD"],
                       capture_output=True, text=True, cwd=ROOT)
    assert r.returncode == 0, r.stderr[:600]
    return [line.split() for line in r.stdout.strip().splitlines()]


def blob_bytes(repo, sha):
    d = gh_api(f"repos/{repo}/git/blobs/{sha}")
    raw = base64.b64decode(d["content"])
    assert len(raw) == d["size"], (sha, len(raw), d["size"])
    return raw


def contents_meta(repo, path, ref):
    d = gh_api(f"repos/{repo}/contents/{path}?ref={ref}")
    return {"path": path, "git_blob": d["sha"], "size": d["size"]}


def main():
    irr_commit = gh_api(f"repos/{IRR}/commits/main")
    ipd_commit = gh_api(f"repos/{IPD}/commits/main")
    irr_main = irr_commit["sha"]
    ipd_main = ipd_commit["sha"]

    irr_open = gh(["pr", "list", "-R", IRR, "--state", "open", "--json", "number"])
    ipd_open = gh(["pr", "list", "-R", IPD, "--state", "open", "--json", "number"])

    prs = {}
    for label, repo, num in [("ipd_pr80_s1_determination", IPD, 80),
                             ("ipd_pr81_receipt", IPD, 81),
                             ("ipd_pr96_s2_correction", IPD, 96),
                             ("irr_pr304_pf15_corrected", IRR, 304),
                             ("irr_pr305_pf15_receipt", IRR, 305),
                             ("irr_pr306_s2_receipt", IRR, 306),
                             ("ipd_pr98_unified_proposed_patch", IPD, 98)]:
        prs[label] = gh(["pr", "view", str(num), "-R", repo, "--json",
                         "number,title,state,mergedAt,mergeCommit,headRefOid"])

    det_meta = contents_meta(IPD, DET_PATH, ipd_main)
    suc_meta = contents_meta(IPD, SUC_PATH, ipd_main)
    val_meta = contents_meta(IPD, VAL_PATH, ipd_main)
    prov_meta = contents_meta(IPD, PROV_PATH, ipd_main)
    test_meta = contents_meta(IPD, TEST_PATH, ipd_main)
    pf15_meta = contents_meta(IRR, PF15_PATH, irr_main)

    det = blob_bytes(IPD, det_meta["git_blob"]).decode("utf-8")
    val = blob_bytes(IPD, val_meta["git_blob"]).decode("utf-8")
    prov = blob_bytes(IPD, prov_meta["git_blob"]).decode("utf-8")
    test = blob_bytes(IPD, test_meta["git_blob"]).decode("utf-8")

    def sha256_text(t):
        return hashlib.sha256(t.encode("utf-8")).hexdigest()

    # Values as determined (determination header row) and as compiled/tested.
    det_values = {}
    for field, needle in [("principal_label", "ramki-personal-local"),
                          ("tenantId", "ipd-personal-local"),
                          ("canonicalOwnerId", "ipd-owner-ramki-personal")]:
        det_values[field] = needle if needle in det else None

    compiled = {}
    for const, field in [("PRINCIPAL_LABEL", "principal_label"),
                         ("TENANT_ID", "tenantId"),
                         ("CANONICAL_OWNER_ID", "canonicalOwnerId")]:
        m = re.search(rf"export const {const}: string \| null = '([^']*)';", val)
        compiled[field] = m.group(1) if m else None

    tested = {}
    for const, field in [("DETERMINED_PRINCIPAL_LABEL", "principal_label"),
                         ("DETERMINED_TENANT_ID", "tenantId"),
                         ("DETERMINED_CANONICAL_OWNER_ID", "canonicalOwnerId")]:
        m = re.search(rf"const {const} = '([^']*)';", test)
        tested[field] = m.group(1) if m else None

    recomputed = {}
    for field, value in det_values.items():
        if value is not None:
            recomputed[field] = {
                "value": value,
                "utf8_bytes": len(value.encode("utf-8")),
                "sha256_of_value": hashlib.sha256(value.encode("utf-8")).hexdigest(),
            }
    derived = {
        "binding_id": hashlib.sha256(
            ("binding:" + det_values["principal_label"]).encode("utf-8")).hexdigest()[:32],
        "membership_id": hashlib.sha256(
            ("membership:" + det_values["tenantId"] + ":" + det_values["canonicalOwnerId"])
            .encode("utf-8")).hexdigest()[:32],
    }

    at_refs = {}
    for ref_label, ref in [("pr80_merge", PR80_MERGE), ("approved_baseline", BASELINE),
                           ("corrected_candidate", CANDIDATE), ("ipd_main", ipd_main)]:
        at_refs[ref_label] = {
            "ref": ref,
            "determination": contents_meta(IPD, DET_PATH, ref),
            "successor_act": contents_meta(IPD, SUC_PATH, ref),
            "validation": contents_meta(IPD, VAL_PATH, ref),
            "provisioning": contents_meta(IPD, PROV_PATH, ref),
        }

    ancestry = {}
    for label, a, b in [("pr80_merge_to_ipd_main", PR80_MERGE, ipd_main),
                        ("pr81_merge_to_ipd_main", PR81_MERGE, ipd_main),
                        ("baseline_to_candidate", BASELINE, CANDIDATE),
                        ("candidate_to_ipd_main", CANDIDATE, ipd_main)]:
        c = gh_api(f"repos/{IPD}/compare/{a}...{b}")
        ancestry[label] = {"status": c["status"], "ahead_by": c["ahead_by"],
                           "behind_by": c["behind_by"]}

    diff = gh_api(f"repos/{IPD}/compare/{BASELINE}...{CANDIDATE}")
    baseline_candidate_files = [
        {"filename": f["filename"], "status": f["status"],
         "additions": f["additions"], "deletions": f["deletions"]}
        for f in diff.get("files", [])]

    pf15_raw = blob_bytes(IRR, pf15_meta["git_blob"])
    pf15_text = pf15_raw.decode("utf-8")
    pf15_spans = {}
    for key, marker in [("F2_endpoint", "pipe\\iips-user-portfolio-v1"),
                        ("F4_store", "user-portfolio.sqlite"),
                        ("F5_evidence_root", "cap03-gate4")]:
        for span in re.findall(r"`([^`]*)`", pf15_text):
            if marker.replace("\\", "") in span.replace("\\", "") and (
                    "iips-user-portfolio" in span or "user-portfolio.sqlite" in span
                    or ("cap03-gate4" in span and "iips-evidence" in span)):
                pf15_spans[key] = {"value": span, "length": len(span),
                                   "backslash_count": span.count("\\")}
                break

    out = {
        "record_id": "IIPS-V3-CAP03-P1-IDENTITY-PREREQUISITE-RECONCILIATION-2026-10-26-01",
        "evidence_file": "00-remote-identity-and-pin-readback.json",
        "classification": "Arena-independent live remote read-back via GitHub REST/Git APIs; "
                          "no Windows host contact; no provisioning; zero IPD writes",
        "retrieved_date_utc": "2026-10-26",
        "irr": {
            "repo": IRR,
            "main": irr_main,
            "tree": irr_commit["commit"]["tree"]["sha"],
            "ls_remote": ls_remote("origin"),
            "open_prs": len(irr_open),
        },
        "ipd": {
            "repo": IPD,
            "main": ipd_main,
            "tree": ipd_commit["commit"]["tree"]["sha"],
            "ls_remote": ls_remote(f"https://github.com/{IPD}.git"),
            "open_prs": len(ipd_open),
            "tracker_at_main": contents_meta(IPD, IPD_TRACKER_PATH, ipd_main),
        },
        "prs": prs,
        "identity_determination_at_ipd_main": {
            **det_meta,
            "sha256_of_blob_bytes": sha256_text(det),
            "record_id_present": "IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01" in det,
            "status_rendered_effective_on_publication": "RENDERED — EFFECTIVE" in det,
            "values_as_determined": det_values,
            "values_recomputed": recomputed,
            "derived_ids_recomputed": derived,
            "determination_stated_binding_id": "c5808abaffd072d6401ce63ad86c6ac0",
            "determination_stated_membership_id": "d25dcc5370100b00766efc5166f65cf3",
        },
        "successor_provisioning_act_at_ipd_main": {
            **suc_meta,
            "record_id": "IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01",
            "note": "Act text preserved unedited; its §4 UNRESOLVED table is the state at its own "
                    "rendering and reserves the later determination that discharges it.",
        },
        "implementation_at_ipd_main": {
            "validation": {**val_meta, "sha256_of_blob_bytes": sha256_text(val),
                           "compiled_constants": compiled},
            "provisioning": {**prov_meta, "sha256_of_blob_bytes": sha256_text(prov),
                             "authorize_execution_present": "function authorizeExecution" in prov,
                             "act_id_mismatch_refusal_present": "ACT_ID_MISMATCH" in prov,
                             "identity_mismatch_refusal_present": "IDENTITY_VALUE_MISMATCH" in prov,
                             "platform_refusal_present": "PLATFORM_UNSUPPORTED" in prov},
            "test": {**test_meta, "sha256_of_blob_bytes": sha256_text(test),
                     "determined_constants": tested},
            "determination_compiled_test_all_equal":
                det_values == compiled == tested and all(det_values.values()),
        },
        "blob_identity_across_refs": at_refs,
        "ancestry": ancestry,
        "baseline_to_candidate_files": baseline_candidate_files,
        "pf15_corrected_act_at_irr_main": {
            **pf15_meta,
            "sha256_of_blob_bytes": hashlib.sha256(pf15_raw).hexdigest(),
            "act_id": "IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02",
            "act_id_present": "IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02" in pf15_text,
            "code_spans": pf15_spans,
        },
        "boundaries": {
            "windows_host_contacted": False,
            "database_created": False,
            "provisioning_executed": False,
            "ipd_writes": 0,
        },
    }
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
    print("all_equal:", out["implementation_at_ipd_main"]["determination_compiled_test_all_equal"])
    print("derived:", derived)


if __name__ == "__main__":
    main()
