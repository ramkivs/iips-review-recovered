#!/usr/bin/env python3
"""Verify the CAP-03 P-1-C / P-1-D evidence-handoff and independent acceptance review (tracker §16.152).

Repository-side checks only. Recomputes every digest this bundle claims, re-verifies the published
instrument identity and the F4/F5 literals, enforces the no-fabrication invariants (zero raw operator
bytes; null/false facts never presented as supplied), checks the criterion statuses and the
identifier registration, and confines the working-tree change scope. It performs NO host contact,
NO recapture, NO P-1 execution, and claims no Windows verification.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
B = pathlib.Path(__file__).resolve().parent
RECORD = ROOT / "docs/integration/IIPS_v3.0_CAP03_P1C_P1D_EVIDENCE_HANDOFF_ACCEPTANCE_REVIEW_2026-10-27.md"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
ACT = ROOT / "docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"
INSTRUMENT = ROOT / "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1"
PRIOR_BUNDLE = ROOT / "evidence/integration/cap03-p1c-p1d-host-evidence-reconciliation-2026-10-27"
RECORD_ID = "IIPS-V3-CAP03-P1C-P1D-EVIDENCE-HANDOFF-ACCEPTANCE-REVIEW-2026-10-27-01"

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

# --- 2. Baseline and handoff channels: zero raw bytes, ten channels, no fabrication. ---
base = load("00-baseline-and-handoff-channels.json")
check("HANDOFF-1", base["reviewed_baseline"]["irr_main"] == "c3a014fe74fc4bb5d253957f060c8f4c2e4a6662"
      and base["reviewed_baseline"]["ipd_read_only_head"] == "888eb375eebee01640e44ccdcbb138a71e8c4513"
      and base["reviewed_baseline"]["ipd_writes_by_this_pass"] == 0,
      "reviewed baseline = live IRR c3a014f / IPD 888eb375 (read-only, 0 writes)")
check("HANDOFF-2", len(base["handoff_channels_checked"]) == 10
      and all(c["result"] for c in base["handoff_channels_checked"]),
      "ten channels checked, each with a recorded result")
out = base["handoff_outcome"]
check("HANDOFF-3", out["raw_bytes_received"] == 0
      and out["cap_b_fresh_preflight_capture_raw_files_supplied"] is False
      and out["cap_c_separate_read_only_host_assessment_supplied"] is False
      and out["cap_d_generator_bytes_supplied"] is False
      and out["host_generated_sha256_manifest_supplied"] is False
      and out["arena_host_contact"] is False,
      "zero raw bytes; nothing supplied; no host contact; no Windows verification claimed")
check("HANDOFF-4", out["prose_transcription_treated_as_raw_host_evidence"] is False,
      "Arena-authored prose transcription not treated as raw host evidence")

# --- 3. Operator decision and supersession. ---
dec = load("01-operator-decision-and-supersession.json")
sup = dec["supersession"]
check("DECISION-1", dec["decision"]["decision_maker"].startswith("operator side")
      and "cannot be reproduced" in dec["decision"]["decision_text"]
      and "85ac7271" in dec["decision"]["decision_text"].lower(),
      "operator decision recorded: B5D58F7F generator not reproducible; published instrument follows")
check("DECISION-2", sup["status_after_decision"]["cap03-p1-20261027-02"].startswith("SUPERSEDED FOR ACCEPTANCE")
      and "PRESERVED OPERATOR-LOCAL" in sup["status_after_decision"]["cap03-p1-20261027-02"],
      "capture superseded for acceptance, preserved operator-local")
ni = sup["non_inferences"]
check("DECISION-3", ni["no_adverse_inference_from_digest_mismatch"] is True
      and ni["no_adverse_inference_from_non_reproducibility"] is True
      and ni["no_new_authority_blocker"] is True,
      "no adverse inference; no new authority blocker")

# --- 4. Generator-integrity resolution. ---
gen = load("02-generator-integrity-resolution.json")
inst = gen["published_instrument"]
check("GEN-1", sha(INSTRUMENT) == inst["sha256"]
      == "85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b"
      and INSTRUMENT.stat().st_size == inst["bytes"] == 10231
      and subprocess.run(["git", "-C", str(ROOT), "rev-parse", "HEAD:"
                          + "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1"],
                         capture_output=True, text=True).stdout.strip()
      == inst["git_blob"] == "eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb",
      "published instrument identity reproduced (local bytes + git blob)")
check("GEN-2", b"\r\n" not in INSTRUMENT.read_bytes(), "instrument still LF (CRLF defect still remediated)")
check("GEN-3", sorted(gen["resolution_rule_for_the_next_capture"]["designated_operator_parameter_lines"])
      == ["$IpdRoot", "$IrrRoot"]
      and len(gen["resolution_rule_for_the_next_capture"]["required_deposits_to_prove_identity"]) == 4,
      "verbatim-use rule: only designated parameter lines may differ; four identity deposits required")
check("GEN-4", inst["modification_by_this_pass"].startswith("NONE"),
      "published instrument not substituted, edited or modified")

# --- 5. Expected values for the new capture. ---
exp = load("03-expected-values-new-capture.json")
pin = exp["ipd_execution_basis_pin"]
check("EXP-1", pin["commit"] == "001c3c80618f2ee1d40e9a90912237e1a06e7b58"
      and pin["tree"] == "399fa44a5f1953c0f61b452420fefb5985426ef1"
      and pin["parent"] == "8eec74ae27cda09f3c368b9c299895eae41554db",
      "§16.143 pin coordinates recorded exactly")
src = exp["successor_act_section_8_step_0_source_hashes"]["expected_values_at_the_§16.143_pin"]
check("EXP-2", len(src) == 3 and all(re.fullmatch(r"[0-9a-f]{64}", s["sha256"]) for s in src)
      and {s["path"] for s in src} == {"src/persistence/gateAPrimeProvisioning.ts",
                                       "src/persistence/provisioning.ts",
                                       "src/persistence/binding.ts"},
      "three successor §8 step-0 source hashes with exact values")
check("EXP-3", next(s for s in src if s["path"].endswith("provisioning.ts"))["git_blob"]
      == "dc844189a1c92f00acc3d7572c22f3e28e138eb6"
      and next(s for s in src if s["path"].endswith("binding.ts"))["git_blob"]
      == "96d0079dd04b75c6f257a2001c8f7eff1ffc560a",
      "provisioning.ts / binding.ts blob ids equal the successor act §2.1 designations")
check("EXP-4", exp["f4_f5_literals"]["f4_utf8_hex"]
      == "433a5c696970732d646174615c696970735c757365722d706f7274666f6c696f2e73716c697465"
      and exp["f4_f5_literals"]["f5"] == "C:\\iips-evidence\\cap03-gate4",
      "F4 hex and F5 literal unchanged")
act = ACT.read_text(encoding="utf-8")
m = re.search(r"\*\*F4 —[^\n]*\|\s*`([^`]+)`", act)
f4 = m.group(1) if m else ""
check("EXP-5", f4.encode().hex() == exp["f4_f5_literals"]["f4_utf8_hex"]
      and len(f4.encode()) == 39 and f4.count("\\") == 3,
      "F4 literal re-read from effective act -02 matches recorded hex")

# --- 6. Criterion assessment: statuses, conclusions, no fabricated pass. ---
a = load("04-pf-criterion-assessment.json")
ids = [c["id"] for c in a["criteria"]]
statuses = {c["id"]: c["status"] for c in a["criteria"]}
check("ASSESS-1", len(ids) == 36 and len(set(ids)) == 36, f"{len(ids)} unique criterion rows")
check("ASSESS-2", statuses["BASELINE-F4"] == "VERIFIED" and statuses["INSTRUMENT-IDENTITY"] == "VERIFIED"
      and statuses["P1-REGISTER-STATE"].startswith("VERIFIED")
      and statuses["PF-11a"] == "VERIFIED" and statuses["PF15-CROSSCHECK"] == "VERIFIED",
      "repository-side items VERIFIED")
check("ASSESS-3", statuses["CAPB-RAW-READBACK"].startswith("NOT VERIFIED")
      and statuses["CAPC-RAW-READBACK"].startswith("NOT VERIFIED")
      and statuses["ENVELOPE-GENERATOR-SUPERSEDED"].startswith("NOT VERIFIED"),
      "superseded-capture items NOT VERIFIED")
check("ASSESS-4", all(statuses[i].startswith("NOT EVIDENCED") for i in
                      ("PF-02", "PF-04", "PF-05", "PF-06", "PF-07", "PF-08", "PF-09", "PF-10",
                       "PF-11b", "PF-11c", "PF-11d", "PF-11e", "PF-12", "PF-14", "PF-16",
                       "PF-17-CAPTURE", "SESSION-FRESHNESS")),
      "attempt-session items NOT EVIDENCED")
check("ASSESS-5", statuses["DIRECTORY-PROVENANCE"].startswith("NOT APPLICABLE")
      and statuses["B4-B5D58F7F-DEPOSIT"].startswith("NOT APPLICABLE"),
      "non-criteria and superseded limbs NOT APPLICABLE")
check("ASSESS-6", a["p1c"]["status"] == "NOT ESTABLISHED"
      and a["p1d"]["status"] == "DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT"
      and a["authority_state"]["p1"] == "UNSPENT / UNEXECUTED / NOT AUTHORIZED TO EXECUTE",
      "P-1-C / P-1-D / P-1 conclusions unchanged")

# --- 7. Residual evidence list. ---
res = load("05-residual-evidence-required.json")
rids = [r["id"] for r in res["residual_evidence"]]
check("RESID-1", len(rids) == 7 and all(r["exact_requirement"] for r in res["residual_evidence"]),
      "seven residual items, each with an exact requirement")
check("RESID-2", any("001c3c80618f2ee1d40e9a90912237e1a06e7b58" in r["exact_requirement"] for r in res["residual_evidence"])
      and any("InsideGitWorktree=False" in r["exact_requirement"] for r in res["residual_evidence"])
      and any("0bd6d134" in r["exact_requirement"] for r in res["residual_evidence"]),
      "pin, .git-walk line and step-0 hashes carried into the residual list")
check("RESID-3", len(res["not_required_and_not_requested"]) == 5
      and any("--mode=execute" in x for x in res["not_required_and_not_requested"]),
      "explicit not-required list incl. no execution")

# --- 8. Prior §16.151 bundle preserved unedited. ---
prior_sums = (PRIOR_BUNDLE / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines()
ok = True
for line in prior_sums:
    if line.strip():
        h, n = line.split(None, 1)
        p = PRIOR_BUNDLE / n.strip().lstrip("*")
        if not p.is_file() or sha(p) != h.lower():
            ok = False
check("PRIOR-1", ok, "§16.151 bundle still reproduces its own SHA256SUMS (earlier evidence unmodified)")

# --- 9. Documentation integrity, identifiers and scope of changes. ---
check("DOC-1", RECORD.exists() and RECORD_ID in RECORD.read_text(encoding="utf-8"), "focused record present")
tracker_text = TRACKER.read_text(encoding="utf-8")
check("DOC-2", len(re.findall(r"^## §16\.152 —", tracker_text, re.M)) == 1
      and "CV-CORR-132" in tracker_text and "CHG-2026-10-27-09" in tracker_text
      and "V1026" in tracker_text and "V1035" in tracker_text,
      "single §16.152 heading with registered IDs")
check("DOC-3", len(re.findall(r"^## §16\.151 —", tracker_text, re.M)) == 1
      and "CV-CORR-131" in tracker_text and "CHG-2026-10-27-08" in tracker_text,
      "§16.151 preserved (earlier evidence and identifiers not reused or edited)")
for ident in ("CV-CORR-132", "CHG-2026-10-27-09", "V1026", "V1035"):
    if tracker_text.count(ident) < 2:
        check("DOC-4", False, f"identifier {ident} not registered in both changelog row and section")
        break
else:
    section_text = tracker_text[tracker_text.index("## §16.152"):]
    ok_ids = all(f"`V{n}`" in section_text for n in range(1026, 1036))
    check("DOC-4", ok_ids, "changelog row + section carry the registered identifiers (V1026–V1035 each in §16.152)")
check("DOC-5", not any(list(B.rglob(n)) for n in ("*.sqlite", "*.sqlite-wal", "*.sqlite-shm",
                                                  "*.sqlite-journal", "STOP.txt")),
      "no store / sidecar / STOP artifact in bundle")
status = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
changed = [ln[3:].strip().strip('"') for ln in status.splitlines() if ln[3:].strip()]
bundle_rel = str(B.relative_to(ROOT))
allowed_pred = (TRACKER.name, str(RECORD.relative_to(ROOT)), bundle_rel)


def allowed(p):
    return any(p == q or p.startswith(q + "/") for q in allowed_pred)


check("DOC-6", all(allowed(p) for p in changed),
      f"only tracker, focused record and this bundle changed ({len(changed)} paths)")
diff_check = subprocess.run(["git", "diff", "--check"], cwd=ROOT, capture_output=True, text=True)
check("DOC-7", diff_check.returncode == 0 and not diff_check.stdout, "git diff --check clean")

print()
if failures:
    print(f"{len(failures)} CHECK(S) FAILED: {', '.join(failures)}")
    sys.exit(1)
print("EVIDENCE-HANDOFF REVIEW VERIFIED — repository-side checks passed; zero raw operator bytes; "
      "capture superseded; published instrument designated; P-1 unspent.")
