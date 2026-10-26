#!/usr/bin/env python3
"""Independent read-back of the transferred CAP-03 S2 evidence manifest.

Reads, from a local Git object database only (no network, no host access), the
evidence directory published on branch `cap03-s2-evidence-publication` at commit
54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0, and attempts to reproduce every SHA-256
recorded in that directory's `SHA256SUMS.txt` from the committed bytes.

Recorded hashes were produced on the Windows host over files carrying CRLF line
terminators; the transfer committed the Unix-normalized (LF) form. Reproducing a
recorded hash therefore requires restoring line terminators, which is tested here
as an explicit, disclosed transformation rather than as an accepted assumption.
A hash that reproduces under no tested transformation is reported as
NOT_REPRODUCED and is *not* reclassified as a match.

This script performs no S2 execution, no test/build/manifest regeneration, and
writes nothing outside the path given by --out (default: alongside this file).

Usage:
  python3 verify_manifest_reproduction.py [--repo PATH] [--commit SHA] [--out PATH]
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys

COMMIT = "54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0"
EVIDENCE_DIR = "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26"

# The nine S2 filenames the governing receipt (§16.138.3) treats as required.
REQUIRED = [
    "s2-01-npm-ci.txt",
    "s2-02-tsc-noemit.txt",
    "s2-03-build.txt",
    "s2-03-dist-count.txt",
    "s2-03-dist-sha256-before.txt",
    "s2-04-guarded-npm-test.txt",
    "s2-05-package-consumer.txt",
    "s2-post-run-pin.txt",
    "s2-dist-sha256-after.txt",
]

# Files the receipt records as excluded from the 47-entry Windows manifest.
REPORTED_EXCLUDED = ["windows-session-transcript.txt"]

# Artifacts whose recorded outcome is asserted in the record; scanned for
# verbatim result lines so the classification rests on bytes, not on narrative.
RESULT_SCAN = {
    "s2-04-sha256-manifest-generation.txt": ["Result:"],
    "s2-evidence-manifest-verification.txt": ["Result:", "Manifest entries:"],
    "s2-04-guarded-npm-test.txt": [
        "[test-guard]",
        "# pass 9",
        "# fail 1",
        "S2 step 04-guarded-npm-test exit code:",
    ],
    "s2-npm-launch-fix-suite-20261026T095613Z.txt": [
        "[test-guard]",
        "# tests 924",
        "# pass 920",
        "# fail 0",
        "# skipped 4",
        "Exit code:",
    ],
    "s2-05-package-consumer.txt": ['"result": "PASS"', '"shasum"', "Start UTC:", "Exit code:"],
    "s2-post-run-pin.txt": ["ACTUAL COMMIT:", "ACTUAL TREE:", "WORKING TREE CLEAN:"],
}


def git(repo: str, *args: str) -> bytes:
    out = subprocess.run(["git", "-C", repo, *args], check=True, capture_output=True)
    return out.stdout


def blob(repo: str, commit: str, path: str) -> bytes:
    return git(repo, "cat-file", "blob", f"{commit}:{path}")


def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def variants(raw: bytes) -> dict[str, bytes]:
    """Tested, disclosed transformations of the committed bytes."""
    crlf = raw.replace(b"\n", b"\r\n")
    return {
        "as_committed": raw,
        "crlf_restored": crlf,
        "crlf_restored_trailing_newline_normalized": crlf.rstrip(b"\r\n") + b"\r\n",
        "crlf_restored_no_trailing_newline": crlf.rstrip(b"\r\n"),
        "lf_trailing_newline_normalized": raw.rstrip(b"\n") + b"\n",
        "lf_body_with_single_trailing_crlf": raw.rstrip(b"\n") + b"\r\n",
    }


def classify(recorded: str, raw: bytes) -> tuple[str, str]:
    for name, candidate in variants(raw).items():
        if sha256(candidate).upper() == recorded:
            return name, "REPRODUCED"
    return "none", "NOT_REPRODUCED"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.getcwd())
    ap.add_argument("--commit", default=COMMIT)
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                                  "01-manifest-reproduction-readback.json"))
    args = ap.parse_args()

    manifest_path = f"{EVIDENCE_DIR}/SHA256SUMS.txt"
    manifest_text = blob(args.repo, args.commit, manifest_path).decode("utf-8")
    recorded: list[tuple[str, str]] = []
    for line in manifest_text.splitlines():
        if not line.strip():
            continue
        h, f = line.split(None, 1)
        recorded.append((h.strip().upper(), f.strip()))

    committed_files = sorted(
        line.decode().rstrip("\n")
        for line in git(args.repo, "ls-tree", "-r", "--name-only", args.commit, EVIDENCE_DIR).splitlines()
    )
    committed_names = sorted(os.path.basename(p) for p in committed_files)
    recorded_names = [f for _, f in recorded]

    entries = []
    counts: dict[str, int] = {}
    for recorded_hash, name in recorded:
        path = f"{EVIDENCE_DIR}/{name}"
        try:
            raw = blob(args.repo, args.commit, path)
        except subprocess.CalledProcessError:
            entries.append({
                "file": name,
                "recorded_sha256": recorded_hash,
                "present_at_published_commit": False,
                "classification": "ABSENT_AT_PUBLISHED_COMMIT",
            })
            counts["ABSENT_AT_PUBLISHED_COMMIT"] = counts.get("ABSENT_AT_PUBLISHED_COMMIT", 0) + 1
            continue
        transformation, classification = classify(recorded_hash, raw)
        counts[classification] = counts.get(classification, 0) + 1
        entries.append({
            "file": name,
            "recorded_sha256": recorded_hash,
            "present_at_published_commit": True,
            "blob_sha1": git(args.repo, "rev-parse", f"{args.commit}:{path}").decode().strip(),
            "committed_bytes": len(raw),
            "committed_sha256": sha256(raw).upper(),
            "reproduced_by": transformation,
            "classification": classification,
            "required_s2_file": name in REQUIRED,
        })

    not_listed = [n for n in committed_names if n not in recorded_names]
    absent = [n for n in recorded_names if n not in committed_names]

    scans = {}
    for name, needles in RESULT_SCAN.items():
        path = f"{EVIDENCE_DIR}/{name}"
        try:
            text = blob(args.repo, args.commit, path).decode("utf-8", "replace")
        except subprocess.CalledProcessError:
            scans[name] = {"present": False}
            continue
        found = [ln.strip() for ln in text.splitlines() if any(n in ln for n in needles)]
        scans[name] = {"present": True, "matched_lines": found[:8], "match_count": len(found)}

    result = {
        "record": "IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01",
        "generated_by": "verify_manifest_reproduction.py",
        "method": "git object read of the published commit; recorded SHA-256 reproduced only by "
                  "explicit, disclosed line-terminator restoration; no host access; no execution",
        "commit": args.commit,
        "evidence_dir": EVIDENCE_DIR,
        "manifest_path": manifest_path,
        "manifest_entries": len(recorded),
        "committed_files_in_dir": len(committed_names),
        "classification_counts": counts,
        "required_files": {
            "declared": REQUIRED,
            "present": [n for n in REQUIRED if n in committed_names],
            "all_present": all(n in committed_names for n in REQUIRED),
            "all_reproduced": all(
                e.get("classification") == "REPRODUCED" for e in entries
                if e["file"] in REQUIRED and e.get("present_at_published_commit")
            ),
        },
        "reported_excluded_absent_from_tree": {
            name: name not in committed_names for name in REPORTED_EXCLUDED
        },
        "present_but_not_in_manifest": not_listed,
        "listed_but_not_present": absent,
        "entries": entries,
        "artifact_result_scan": scans,
    }

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2)
        fh.write("\n")

    print(f"entries={len(recorded)} files={len(committed_names)} counts={counts}")
    for name in not_listed:
        print(f"  not in manifest: {name}")
    for name in absent:
        print(f"  listed but absent: {name}")
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
