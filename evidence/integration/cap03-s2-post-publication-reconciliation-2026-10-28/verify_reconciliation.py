#!/usr/bin/env python3
"""Replayable verification for the CAP-03 S2 post-publication reconciliation (2026-10-28).

Read-only. Recomputes, from the git object store only:
  01  publication commit, archive, sidecar and receipt facts;
  02  manifest reconciliation (47-entry manifest, historical 48 / 1,148 reports,
      committed-copy relation, zip timestamps);
  03  execution-outcome facts parsed from the transcripts inside the archive.

Usage (from the repository root, after fetching the publication branch):
    git fetch origin evidence-cap03-s2-original-recovery-20261028:refs/remotes/origin/evidence-cap03-s2-original-recovery-20261028
    python3 evidence/integration/cap03-s2-post-publication-reconciliation-2026-10-28/verify_reconciliation.py

Writes 01-*.json, 02-*.json, 03-*.json next to this script. Does not write to Git,
does not touch the recovered originals, and runs no tests, builds or S2 steps.
"""
import datetime
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import zipfile

PUB_COMMIT = "e43476eb45a58eab130cc43535f2ba61de9e450f"
PUB_DIR = "handoff/non-authoritative-evidence/cap03-s2"
ZIP_NAME = "CAP03-S2-original-evidence-recovery-20261028T090844Z.zip"
SIDECAR = ZIP_NAME + ".sha256"
RECEIPT = "PUBLICATION-RECEIPT.txt"
EXPECTED_ZIP_SHA = "86C46B79A02DA13EC9D57B891762098B23E49AF7B4AE66CE7FB551DA9B759223"
MAIN_REF = "origin/main"
DEPOSIT = "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26"
HERE = os.path.dirname(os.path.abspath(__file__))
IST = datetime.timedelta(hours=5, minutes=30)  # zip local stamps; cross-checked below


def git(*args, binary=False):
    out = subprocess.run(["git", *args], capture_output=True, check=True).stdout
    return out if binary else out.decode("utf-8", "replace")


def sha256(b):
    return hashlib.sha256(b).hexdigest().upper()


def write(name, obj):
    with open(os.path.join(HERE, name), "w", encoding="utf-8", newline="\n") as f:
        json.dump(obj, f, indent=2, sort_keys=False)
        f.write("\n")


def blob_exists(ref, path):
    return subprocess.run(["git", "cat-file", "-e", f"{ref}:{path}"],
                          capture_output=True).returncode == 0


# ---------------------------------------------------------------- 01 publication
def part01():
    res = {"publication_commit": PUB_COMMIT}
    res["commit_parents"] = git("log", "-1", "--format=%P", PUB_COMMIT).split()
    res["commit_tree"] = git("log", "-1", "--format=%T", PUB_COMMIT).strip()
    res["files_changed_vs_main"] = git(
        "diff", "--name-status", MAIN_REF, PUB_COMMIT).strip().splitlines()
    zip_bytes = git("show", f"{PUB_COMMIT}:{PUB_DIR}/{ZIP_NAME}", binary=True)
    res["zip_bytes"] = len(zip_bytes)
    res["zip_sha256"] = sha256(zip_bytes)
    res["zip_sha256_expected"] = EXPECTED_ZIP_SHA
    res["zip_sha256_matches_expected"] = res["zip_sha256"] == EXPECTED_ZIP_SHA
    side = git("show", f"{PUB_COMMIT}:{PUB_DIR}/{SIDECAR}")
    res["sidecar_digest"] = side.split()[0].upper()
    res["sidecar_matches_zip"] = res["sidecar_digest"] == res["zip_sha256"]
    rec = git("show", f"{PUB_COMMIT}:{PUB_DIR}/{RECEIPT}")
    m = re.search(r"Archive SHA-256:\s*([0-9A-F]{64})", rec)
    res["receipt_digest"] = m.group(1) if m else None
    res["receipt_matches_zip"] = res["receipt_digest"] == res["zip_sha256"]
    m = re.search(r"Archive size bytes:\s*(\d+)", rec)
    res["receipt_size_matches"] = bool(m) and int(m.group(1)) == len(zip_bytes)
    z = zipfile.ZipFile(io.BytesIO(zip_bytes))
    res["zip_entry_count"] = len(z.infolist())
    res["receipt_zip_entries_matches"] = "ZIP entries: 51" in rec and res["zip_entry_count"] == 51
    # publication paths must be absent from main
    res["publication_paths_on_main"] = [
        p for p in (f"{PUB_DIR}/{ZIP_NAME}", f"{PUB_DIR}/{SIDECAR}", f"{PUB_DIR}/{RECEIPT}")
        if blob_exists(MAIN_REF, p)]
    res["main_ref"] = git("rev-parse", MAIN_REF).strip()
    res["publication_base_is_main_head_at_publication"] = (
        res["commit_parents"] == ["82b3f4a5d31134e40fd3a1a23169a0ca8d638dfc"])
    write("01-publication-verification.json", res)
    return z


# ---------------------------------------------------------------- 02 manifest
def part02(z):
    res = {"method": "Arena recomputation from the archive and from git objects; "
                     "Windows-reported statements are labelled as such."}
    man_bytes = z.read("SHA256SUMS.txt")
    res["manifest_bytes"] = len(man_bytes)
    res["manifest_sha256"] = sha256(man_bytes)
    res["manifest_sha256_audit_claim"] = "2192AD317FD33DAC20E4C9009FFDB51786E974BFACF6E9180A397D1E48FC86E2"
    res["manifest_sha256_matches_audit_claim"] = res["manifest_sha256"] == res["manifest_sha256_audit_claim"]
    lines = [l for l in man_bytes.decode("utf-8").split("\r\n") if l.strip()]
    entries = [l.split("  ", 1) for l in lines]
    res["manifest_entries"] = len(entries)
    names = [n for _, n in entries]
    res["manifest_duplicate_names"] = len(names) - len(set(names))
    per = []
    for digest, name in entries:
        b = z.read(name)
        per.append({"file": name, "manifest_sha256": digest, "archive_sha256": sha256(b),
                    "match": sha256(b) == digest, "bytes": len(b),
                    "crlf": b.count(b"\r\n"), "bare_lf": b.count(b"\n") - b.count(b"\r\n")})
    res["entries_matching_manifest"] = sum(1 for r in per if r["match"])
    res["per_entry"] = per
    on_disk = {i.filename for i in z.infolist() if not i.filename.endswith("/")}
    res["archive_files_not_in_manifest"] = sorted(on_disk - set(names) - {"SHA256SUMS.txt", "recovery-audit.txt"}
                                                  - {n for n in on_disk if n.startswith("existing-report-candidates/")})
    res["archive_files_not_in_manifest_expected"] = ["SHA256SUMS.txt (self, excluded by generation rule)",
                                                     "recovery-audit.txt (post-generation audit)",
                                                     "existing-report-candidates/* (verification reports, excluded by rule)"]

    # --- historical reports
    gen = z.read("existing-report-candidates/001-s2-04-sha256-manifest-generation.txt").decode("utf-8", "replace")
    ver = z.read("existing-report-candidates/002-s2-evidence-manifest-verification.txt").decode("utf-8", "replace")
    res["report_001_files_included"] = re.findall(r"Files included:\s*(\d+)", gen)
    res["report_001_result"] = re.findall(r"Result:\s*(.+)", gen)
    res["report_002_manifest_entries"] = re.findall(r"Manifest entries:\s*(\d+)", ver)
    res["report_002_result"] = re.findall(r"Result:\s*(.+)", ver)

    # 1,148 mechanism: verifier input == s2-dist-sha256-after.txt ?
    inv_raw = z.read("s2-dist-sha256-after.txt").decode("utf-8", "replace")
    inv = [l for l in inv_raw.replace("\r\n", "\n").split("\n") if l != ""]
    hashed = [l for l in inv if re.match(r"^[0-9A-Fa-f]{64}\s", l)]
    meta = [l for l in inv if not re.match(r"^[0-9A-Fa-f]{64}\s", l)]
    missing = [l[len("- Missing file: "):] for l in ver.replace("\r\n", "\n").split("\n")
               if l.startswith("- Missing file: ")]
    malformed = [l for l in ver.replace("\r\n", "\n").split("\n") if l.startswith("- Malformed manifest entry:")]
    inv_paths = [re.split(r"^[0-9A-Fa-f]{64}\s+\*?", l, maxsplit=1)[-1] for l in hashed]
    res["dist_inventory_lines"] = len(inv)
    res["dist_inventory_metadata_lines"] = len(meta)
    res["dist_inventory_hash_lines"] = len(hashed)
    res["report_002_missing_file_findings"] = len(missing)
    res["report_002_malformed_findings"] = len(malformed)
    res["missing_findings_equal_inventory_paths"] = sorted(missing) == sorted(inv_paths)
    res["required_s2_names_in_missing_findings"] = [n for n in missing if n.startswith("s2-")]
    res["report_002_is_mis_invocation_consistent"] = (
        res["report_002_manifest_entries"] == ["1148"] and len(inv) == 1148
        and res["missing_findings_equal_inventory_paths"] and len(malformed) == len(meta))

    # committed IRR copies vs archive originals (CRLF->LF relation)
    rel = []
    for r in per:
        com = subprocess.run(["git", "show", f"{MAIN_REF}:{DEPOSIT}/{r['file']}"],
                             capture_output=True).stdout
        orig = z.read(r["file"])
        if orig == com:
            cat = "identical"
        elif orig.replace(b"\r\n", b"\n") == com:
            cat = "committed == original with CRLF->LF"
        else:
            cat = "other"
        rel.append({"file": r["file"], "relation": cat})
    res["committed_copy_relation_counts"] = {k: sum(1 for x in rel if x["relation"] == k)
                                             for k in sorted({x["relation"] for x in rel})}
    res["committed_copy_relation"] = rel
    # historical report copies vs committed
    for key, path in (("report_001_matches_committed_normalised", "existing-report-candidates/001-s2-04-sha256-manifest-generation.txt"),
                      ("report_002_matches_committed_normalised", "existing-report-candidates/002-s2-evidence-manifest-verification.txt")):
        com = subprocess.run(["git", "show", f"{MAIN_REF}:{DEPOSIT}/" + os.path.basename(path).split("-", 1)[1]],
                             capture_output=True).stdout
        res[key] = z.read(path).replace(b"\r\n", b"\n") == com.replace(b"\r\n", b"\n")

    # zip timestamps (local) -> UTC, cross-checked against recovery-audit and internal stamps
    mt = {i.filename: datetime.datetime(*i.date_time) - IST for i in z.infolist()}
    res["zip_local_to_utc_assumption"] = "UTC+05:30 (IST); cross-checked below"
    res["cross_check_recovery_audit_utc_header"] = "2026-10-28T09:09:01Z"
    res["cross_check_recovery_audit_zip_utc"] = str(mt["recovery-audit.txt"])
    res["cross_check_001_internal_utc"] = "2026-10-26T12:47:40.4903210Z"
    res["cross_check_001_zip_utc"] = str(mt["existing-report-candidates/001-s2-04-sha256-manifest-generation.txt"])
    res["cross_check_002_internal_utc"] = "2026-10-26T12:47:40.3711638Z"
    res["cross_check_002_zip_utc"] = str(mt["existing-report-candidates/002-s2-evidence-manifest-verification.txt"])
    res["manifest_zip_utc"] = str(mt["SHA256SUMS.txt"])
    listed_mt = sorted((mt[n], n) for n in names)
    res["latest_listed_file_zip_utc"] = str(listed_mt[-1][0]) + " " + listed_mt[-1][1]
    res["manifest_written_after_generation_log"] = mt["SHA256SUMS.txt"] > mt[
        "existing-report-candidates/001-s2-04-sha256-manifest-generation.txt"]
    res["interpretation_limit"] = ("mtime evidence shows the manifest file was last written after the "
                                   "generation log; it does not show why or by which process.")

    # 48 candidate explanation: locked transcript named in the tracker but absent from the archive
    res["windows_session_transcript_in_archive"] = "windows-session-transcript.txt" in z.namelist()
    write("02-manifest-reconciliation.json", res)
    return per


# ---------------------------------------------------------------- 03 outcomes
STEP_FILES = {
    "step01_npm_ci_original": "s2-01-npm-ci.txt",
    "step02_tsc_original": "s2-02-tsc-noemit.txt",
    "step03_build_original": "s2-03-build.txt",
    "step04_guarded_test_original": "s2-04-guarded-npm-test.txt",
    "step05_package_consumer_baseline_12_35": "s2-05-package-consumer-baseline-failure-20261026.txt",
    "fix_step01_npm_ci": "s2-fix-01-npm-ci.txt",
    "fix_step02_typecheck": "s2-fix-02-typecheck.txt",
    "fix_step03_build": "s2-fix-03-build.txt",
    "fix_step04_focused_package_test": "s2-fix-04-focused-package-test.txt",
    "fix_step05_guarded_test": "s2-fix-05-guarded-npm-test.txt",
    "fix_step06_package_consumer_09_35": "s2-fix-06-package-consumer.txt",
    "launch_fix_package_consumer_09_56": "s2-npm-launch-fix-consumer-20261026T095613Z.txt",
    "launch_fix_guarded_suite_09_57": "s2-npm-launch-fix-suite-20261026T095613Z.txt",
    "post_run_pin_12_34": "s2-post-run-pin.txt",
}


def part03(z):
    out = {"method": "Counts and exit codes parsed from transcripts in the archive; "
                     "no test, build or S2 step was run."}
    rows = {}
    for key, name in STEP_FILES.items():
        b = z.read(name)
        t = b.decode("utf-8", "replace").replace("\r\n", "\n")
        row = {"file": name, "bytes": len(b), "sha256": sha256(b)}
        row["start_utc"] = (re.findall(r"(?:start UTC|Start UTC|Command start UTC|UTC):\s*(\S+)", t) or [None])[0]
        row["end_utc"] = (re.findall(r"(?:end UTC|End UTC|Command end UTC|COMPLETED UTC):\s*(\S+)", t) or [None])[-1]
        row["commit_lines"] = sorted(set(re.findall(r"(?:Commit|Expected commit|EXPECTED COMMIT|ACTUAL COMMIT|Base HEAD|HEAD):\s*([0-9a-f]{40})", t)))
        row["tests"] = re.findall(r"^# tests (\d+)", t, re.M)
        row["pass"] = re.findall(r"^# pass (\d+)", t, re.M)
        row["fail"] = re.findall(r"^# fail (\d+)", t, re.M)
        row["skipped"] = re.findall(r"^# skipped (\d+)", t, re.M)
        row["guard_line"] = (re.findall(r"^\[test-guard\] (OK|FAIL)[^\n]*", t, re.M) or [None])[0]
        row["exit_codes"] = re.findall(r"(?:exit code|Exit code|EXIT CODE|Command exit code|Package-consumer exit code|Guarded suite exit code|step 04-guarded-npm-test exit code): ?(\d+)", t)
        row["result_pass"] = bool(re.search(r'"result": "PASS"', t))
        row["spawn_EINVAL"] = "spawnSync npm.cmd EINVAL" in t
        row["ERR_UNSUPPORTED_ESM_URL_SCHEME"] = "ERR_UNSUPPORTED_ESM_URL_SCHEME" in t
        row["not_ok_lines"] = [l.strip() for l in t.split("\n") if re.match(r"^\s*not ok \d+ - ", l)][:6]
        rows[key] = row
    out["rows"] = rows
    out["fix_patch_check_note"] = ("The recorded patch texts were applied to 8eec74ae blobs in a scratch "
                                   "repository and compared with IPD 001c3c80 in a separate step; that step "
                                   "is not replayed by this script (see the record, section 4.3).")
    write("03-execution-outcomes.json", out)


def main():
    subprocess.run(["git", "rev-parse", "--verify", PUB_COMMIT + "^{commit}"],
                   capture_output=True, check=True)
    z = part01()
    part02(z)
    part03(z)
    print("verification written")


if __name__ == "__main__":
    sys.exit(main())
