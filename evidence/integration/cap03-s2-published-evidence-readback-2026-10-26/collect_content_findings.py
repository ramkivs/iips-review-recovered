#!/usr/bin/env python3
"""Extract the content-level findings of the transferred CAP-03 S2 evidence set.

Reads the published commit's evidence blobs and records, verbatim and by regex,
the pin statements, timings, result lines and manifest bookkeeping facts that the
read-back addendum relies on. No execution, no host access, no network.

Usage:
  python3 collect_content_findings.py [--repo PATH] [--commit SHA] [--out PATH]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys

COMMIT = "54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0"
DIR = "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26"

PIN = r"(?:Commit|ACTUAL COMMIT|HEAD|Base HEAD):\s*([0-9a-f]{40})"
TREE = r"(?:Tree|ACTUAL TREE|Base tree):\s*([0-9a-f]{40})"
UTC = r"(?:Start UTC|start UTC|End UTC|Completed UTC|UTC):\s*([0-9T:.Z+-]+)"


def git(repo: str, *args: str) -> bytes:
    return subprocess.run(["git", "-C", repo, *args], check=True, capture_output=True).stdout


def blob(repo: str, path: str) -> bytes:
    return git(repo, "cat-file", "blob", f"{COMMIT}:{DIR}/{path}")


def lines_matching(text: str, pattern: str, limit: int = 6) -> list[str]:
    rx = re.compile(pattern)
    return [ln.strip() for ln in text.splitlines() if rx.search(ln)][:limit]


def tap_counts(text: str) -> dict:
    out = {}
    for key in ("tests", "suites", "pass", "fail", "cancelled", "skipped", "todo"):
        m = re.search(rf"^# {key} (\d+)$", text, flags=re.M)
        if m:
            out[key] = int(m.group(1))
    return out


def file_facts(repo: str, name: str) -> dict:
    raw = blob(repo, name)
    text = raw.decode("utf-8", "replace")
    return {
        "file": name,
        "blob_sha1": git(repo, "rev-parse", f"{COMMIT}:{DIR}/{name}").decode().strip(),
        "bytes": len(raw),
        "line_count": text.count("\n"),
        "utf8_mojibake_present": "ΓÇö" in text or "ΓÇ" in text,
        "pins": (lines_matching(text, PIN) + lines_matching(text, TREE))[:6],
        "timestamps": lines_matching(text, UTC),
        "result_lines": lines_matching(text, r"^\s*(Result:|\[test-guard\]|# (tests|pass|fail|skipped) )")[:10],
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.getcwd())
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                                  "02-evidence-content-findings.json"))
    args = ap.parse_args()
    repo = args.repo

    required = ["s2-01-npm-ci.txt", "s2-02-tsc-noemit.txt", "s2-03-build.txt",
                "s2-03-dist-count.txt", "s2-03-dist-sha256-before.txt",
                "s2-04-guarded-npm-test.txt", "s2-05-package-consumer.txt",
                "s2-post-run-pin.txt", "s2-dist-sha256-after.txt"]
    supporting = ["s2-npm-launch-fix-suite-20261026T095613Z.txt",
                  "s2-npm-launch-fix-consumer-20261026T095613Z.txt",
                  "s2-04-sha256-manifest-generation.txt",
                  "s2-evidence-manifest-verification.txt",
                  "s2-checkout-verification.txt",
                  "s2-fix-validation-20261026T093342Z.txt",
                  "s2-tracker-recovery-20261026T154814Z.txt"]

    findings = {name: file_facts(repo, name) for name in required + supporting}

    # 1148 = metadata lines + "SHA256 INVENTORY:" + the 1140 dist entries of the
    # post-run inventory: it is the dist inventory, not a 47-entry evidence manifest.
    dist_after = blob(repo, "s2-dist-sha256-after.txt").decode("utf-8", "replace")
    dist_entry_lines = sum(1 for ln in dist_after.splitlines()
                           if re.match(r"^[0-9A-F]{64}\s{2}", ln))
    verif = blob(repo, "s2-evidence-manifest-verification.txt").decode("utf-8", "replace")
    recorded_entries = lines_matching(verif, r"^Manifest entries:")

    def count(text: str, pattern: str) -> int:
        return len(re.findall(pattern, text, flags=re.M))

    manifest = blob(repo, "SHA256SUMS.txt").decode("utf-8")
    manifest_entries = [ln.split(None, 1)[1].strip() for ln in manifest.splitlines() if ln.strip()]

    out = {
        "record": "IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01",
        "generated_by": "collect_content_findings.py",
        "commit": COMMIT,
        "evidence_dir": DIR,
        "manifest": {
            "entries_total": len(manifest_entries),
            "required_s2_files_in_manifest": [n for n in required if n in manifest_entries],
            "windows_session_transcript_listed": "windows-session-transcript.txt" in manifest_entries,
            "verification_artifacts_listed": {
                n: n in manifest_entries
                for n in ("s2-04-sha256-manifest-generation.txt",
                          "s2-evidence-manifest-verification.txt",
                          "NON_AUTHORITATIVE_TRANSFER.md")
            },
        },
        "manifest_verification_conflict": {
            "recorded_line": recorded_entries,
            "inventory_line_count": dist_after.count("\n"),
            "inventory_dist_entry_lines": dist_entry_lines,
            "explanation": "The only preserved verification run parsed "
                           f"{dist_entry_lines} dist inventory entries "
                           "(s2-dist-sha256-after.txt) as if they were manifest entries, so its "
                           f"{recorded_entries[0] if recorded_entries else 'n/a'} line count equals "
                           "7 metadata lines + the 'SHA256 INVENTORY:' header + 1140 dist entries. "
                           "It is a tooling mis-invocation, not a Windows qualification failure; "
                           "it neither corroborates nor refutes the reported 47-entry PASS.",
            "independent_pass_output_present_in_bundle": False,
        },
        "bookkeeping_difference": {
            "manifest_generation_files_included": lines_matching(
                blob(repo, "s2-04-sha256-manifest-generation.txt").decode("utf-8"),
                r"^Files included:"),
            "transferred_manifest_entries": len(manifest_entries),
            "note": "The generation artifact records 48 files; the transferred manifest carries 53 "
                    "entries overall, of which 6 are pre-existing IRR files and 47 describe the "
                    "transferred evidence. The one-entry difference is not resolvable from the "
                    "bundle alone and is recorded, not rationalised.",
        },
        "passing_evidence_hashes": {
            "guarded_suite": {
                "recorded": "C5DDFFA24393AED2E391EF8A72E8BFF1F8ECD9576C4349E182B288785F1B2941",
                "file": "s2-npm-launch-fix-suite-20261026T095613Z.txt",
                "tap_counts": tap_counts(
                    blob(repo, "s2-npm-launch-fix-suite-20261026T095613Z.txt").decode("utf-8", "replace")),
                "baseline_step04_tap_counts": tap_counts(
                    blob(repo, "s2-04-guarded-npm-test.txt").decode("utf-8", "replace")),
            },
            "package_consumer": {
                "recorded": "9F7C64073A849E57D472C9CA30BB7616D04D1951626E90587241D61A470A85B1",
                "files": ["s2-05-package-consumer.txt",
                          "s2-npm-launch-fix-consumer-20261026T095613Z.txt"],
                "identical_blobs": (findings["s2-05-package-consumer.txt"]["blob_sha1"] ==
                                    findings["s2-npm-launch-fix-consumer-20261026T095613Z.txt"]
                                    ["blob_sha1"]),
                "pack_shasum_line": lines_matching(
                    blob(repo, "s2-05-package-consumer.txt").decode("utf-8"), r'"shasum"'),
            },
        },
        "files": findings,
    }

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2)
        fh.write("\n")
    print(json.dumps({k: out[k] for k in ("manifest", "manifest_verification_conflict",
                                          "bookkeeping_difference", "passing_evidence_hashes")},
                     indent=2))
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
