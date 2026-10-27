#!/usr/bin/env python3
"""Verify the CAP-03 P-1-C / P-1-D host-evidence reconciliation (tracker §16.151).

Repository-side checks only. Recomputes every digest this bundle claims, re-derives the
mechanical facts (F4 byte identity, published-instrument digest, prior-capture verbatim
preservation, criterion statuses, unknown provenance, no new authority blocker) and checks
documentation integrity. It performs NO host contact, NO recapture, NO P-1 execution and does
not claim that any operator-local evidence byte was read.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
B = pathlib.Path(__file__).resolve().parent
CAP = ROOT / "evidence" / "integration-" / "cap03-p1-reconcile-20261026T201328Z"
RECORD = ROOT / "docs/integration/IIPS_v3.0_CAP03_P1C_P1D_HOST_EVIDENCE_RECONCILIATION_2026-10-27.md"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
ACT = ROOT / "docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"
INSTRUMENT = ROOT / "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1"
RECORD_ID = "IIPS-V3-CAP03-P1C-P1D-HOST-EVIDENCE-RECONCILIATION-2026-10-27-01"

failures = []


def check(cid, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + cid + (" :: " + detail if detail else ""))
    if not ok:
        failures.append(cid)


def sha(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()


def load(name):
    return json.loads((B / name).read_text(encoding="utf-8"))


# --- 1. Bundle integrity: SHA256SUMS.txt covers every file except itself. ---
sums = (B / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines()
entries = {}
for line in sums:
    if line.strip():
        h, n = line.split(None, 1)
        entries[n.strip().lstrip("*")] = h.lower()
listed = set(entries)
actual = set()
for p in B.rglob("*"):
    if p.is_file() and p.name != "SHA256SUMS.txt":
        actual.add(str(p.relative_to(B)))
check("BUNDLE-1", listed == actual, f"{len(listed)} listed / {len(actual)} present")
check("BUNDLE-2", all(sha(B / n) == h for n, h in entries.items()), "all digests recomputed")

# --- 2. Earlier capture preserved verbatim, in place and in the copies. ---
man = load("03-evidence-manifest.json")
cap_a = next(c for c in man["captures"] if c["capture_id"] == "CAP-A")
orig = sorted(p.name for p in CAP.iterdir() if p.is_file())
check("CAPA-1", orig == sorted(f["name"] for f in cap_a["files"]) and len(orig) == 11,
      "11 original files still present")
check("CAPA-2", all(sha(CAP / f["name"]) == f["sha256"] and (CAP / f["name"]).stat().st_size == f["bytes"]
                    for f in cap_a["files"]), "originals byte-identical to recorded digests")
check("CAPA-3", all(sha(B / f["verbatim_copy"]) == f["verbatim_copy_sha256"] == f["sha256"]
                    for f in cap_a["files"]), "11 verbatim copies byte-identical")

# --- 3. Operator-local evidence is explicitly missing, never fabricated. ---
cap_b = next(c for c in man["captures"] if c["capture_id"] == "CAP-B")
cap_c = next(c for c in man["captures"] if c["capture_id"] == "CAP-C")
cap_d = next(c for c in man["captures"] if c["capture_id"] == "CAP-D")
check("MISSING-1", man["arena_access"]["accessible_to_arena"] is False
      and man["arena_access"]["raw_bytes_read"] == 0 and man["arena_access"]["raw_bytes_deposited"] == 0,
      "no Arena access to operator-local evidence")
unsupplied = cap_b["expected_or_required_files"] + cap_c["required_files"]
check("MISSING-2", all(f["sha256"] is None and f["available_to_arena"] is False and f["must_be_supplied"] is True
                       for f in unsupplied),
      "unsupplied files carry null digests")
check("MISSING-3", all(f["must_be_supplied"] for f in cap_b["expected_or_required_files"]),
      "complete required fresh-capture file list enumerated")
check("MISSING-4", len(cap_b["additional_required_evidence"]) >= 8,
      "host assessment / listing / ancestor / timestamps / digests enumerated")

# --- 4. F4 literal unchanged; F5 unchanged; no new designation. ---
act = ACT.read_text(encoding="utf-8")
m = re.search(r"\*\*F4 —[^\n]*\|\s*`([^`]+)`", act)
f4 = m.group(1) if m else ""
base = load("00-baseline-and-primary-sources.json")
check("F4-1", f4 == "C:\\iips-data\\iips\\user-portfolio.sqlite" and len(f4.encode()) == 39
      and f4.count("\\") == 3, "39 bytes / 3 separators, verbatim")
check("F4-2", f4.encode().hex() == base["f4"]["utf8_hex"] == "433a5c696970732d646174615c696970735c757365722d706f7274666f6c696f2e73716c697465",
      "hex identical to effective act -02")
check("F4-3", "C:\\iips-evidence\\cap03-gate4" in act and base["f5_evidence_root_pa_literal"] == "C:\\iips-evidence\\cap03-gate4",
      "F5 unchanged, not replaced by the run root")
check("F4-4", base["f4"]["unchanged"] is True and base["f4"]["reopened"] is False
      and base["f4"]["restated_as_new_selection"] is False, "no reopening / no new selection")

# --- 5. Instrument digests and the no-STOP / zero-scan reasoning. ---
inst_sha = sha(INSTRUMENT)
op_digest = cap_b["instrument_sha256_operator_reported"].lower()
check("INST-1", inst_sha == base["published_instrument"]["sha256"]
      == "85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b",
      "published instrument digest reproduced")
check("INST-2", op_digest == "b5d58f7fff78c34dffcd189eac46a27889775f44abf60f1a8abd905224093c95"
      and op_digest != inst_sha and cap_d["required_files"][0]["sha256"] == op_digest,
      "operator-reported digest recorded, mismatch disclosed, bytes demanded")
check("INST-3", "function Stop-Report" in INSTRUMENT.read_text(encoding="utf-8")
      and INSTRUMENT.read_text(encoding="utf-8").count("Stop-Report") == 1,
      "published instrument defines but never calls Stop-Report")
assessment = load("02-pf-criterion-assessment.json")
sig = assessment["exit_signals_not_proof"]
check("INST-4", all(k in sig for k in ("no_stop_txt", "zero_error_scan_matches", "corrected_ancestor_traversal", "capture_completion")),
      "no-STOP / zero-scan / traversal are recorded as non-proof")

# --- 6. Provenance reconciliation and DISP-01 application. ---
prov = load("01-prior-assertion-provenance.json")
check("PROV-1", "EARLIER OPERATOR-REPORTED STATE" in prov["prior_assertion"]["provenance"]
      and prov["prior_assertion"]["arena_host_contact"] is False,
      "prior absence assertion provenance accurate")
check("PROV-2", prov["new_host_captured_state"]["creation_provenance"].startswith("UNKNOWN")
      and "no allegation" in prov["reconciliation"]["no_allegation"].lower()
      and "no inference" in prov["reconciliation"]["no_causal_claim"].lower(),
      "unknown provenance preserved; no allegation / no causal claim")
check("PROV-3", prov["reconciliation"]["provenance_disposition"].startswith("RECORDED AS UNKNOWN")
      and "NOT a criterion" in prov["reconciliation"]["materiality"],
      "unknown provenance not converted to pass or failure")
check("DISP-1", prov["disp_01_application"]["existence_not_a_stop"] is True
      and prov["disp_01_application"]["new_authority_blocker"] is False
      and prov["disp_01_application"]["nearest_existing_ancestor_now"].startswith("C:\\iips-data\\iips"),
      "nearest-existing-ancestor rule applied; no new blocker")
check("DISP-2", "unchanged" in prov["disp_01_application"]["s3_scope"], "S3 PF-13 wording preserved")

# --- 7. Criterion-by-criterion statuses and conclusions. ---
ids = [c["id"] for c in assessment["criteria"]]
check("PF-1", len(ids) >= 23 and ids.count("PF-07") == 1 and "ENVELOPE" in ids and "FRESHNESS" in ids,
      f"{len(ids)} individually assessed rows")
check("PF-2", assessment["p1c"]["status"] == "NOT ESTABLISHED", "P-1-C not established")
check("PF-3", "NOT VERIFIED FOR THE ATTEMPT" in assessment["p1d"]["status"]
      and assessment["p1d"]["new_blocker_from_parent_existence"] is False,
      "P-1-D reported support, attempt not verified; no new blocker")
check("PF-4", "UNSPENT / UNEXECUTED / NOT AUTHORIZED" in assessment["authority_state"]["p1"],
      "P-1 unspent and unauthorized")
check("PF-5", len(assessment["blockers"]) == 6 and all(b["narrow_action"] for b in assessment["blockers"]),
      "six named blockers, each with narrow action")

# --- 8. Documentation integrity and scope of changes. ---
check("DOC-1", RECORD.exists() and RECORD_ID in RECORD.read_text(encoding="utf-8"), "focused record present")
tracker_text = TRACKER.read_text(encoding="utf-8")
check("DOC-2", len(re.findall(r"^## §16\.151 —", tracker_text, re.M)) == 1
      and "CV-CORR-131" in tracker_text and "CHG-2026-10-27-07" in tracker_text
      and "CHG-2026-10-27-08" in tracker_text and "V1025" in tracker_text,
      "single §16.151 heading with reallocated registered IDs")
check("DOC-3", "§16.149" in tracker_text and "§16.148" in tracker_text and "§16.146" in tracker_text,
      "prior sections preserved")
check("DOC-4", not any(list(B.rglob(n)) for n in ("*.sqlite", "*.sqlite-wal", "*.sqlite-shm", "*.sqlite-journal", "STOP.txt")),
      "no store / sidecar / STOP artifact in bundle")
status = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
changed = [ln[3:].strip().strip('"') for ln in status.splitlines() if ln[3:].strip()]
bundle_rel = str(B.relative_to(ROOT))


def allowed(p):
    return (p == TRACKER.name or p == str(RECORD.relative_to(ROOT))
            or p == bundle_rel or p.startswith(bundle_rel + "/"))


check("DOC-5", all(allowed(p) for p in changed),
      f"only tracker, focused record and this bundle changed ({len(changed)} paths)")

print()
if failures:
    print(f"{len(failures)} CHECK(S) FAILED: {', '.join(failures)}")
    sys.exit(1)
print("RECONCILIATION VERIFIED — repository-side checks passed; no host contact; P-1 unspent.")
