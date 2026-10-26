#!/usr/bin/env python3
"""Presence + digest matrix for the CAP-03 S2 evidence published on the IRR branch.

Reads the published commit's evidence directory from the local Git object database
only, then answers, per file, the question the read-back depends on:

  * is the ORIGINAL file present in the repository (not merely a checksum-list entry)?
  * does its committed content reproduce the digest recorded in the final manifest?
  * is it one of the nine required S2 step files?

The recorded digests were taken on the Windows host over CRLF bytes; the transfer
committed LF. Reproduction therefore applies line-terminator restoration as an
explicit, disclosed transformation. A digest that reproduces under no tested
transformation is reported as MISMATCH and is never reclassified.

Usage:
  python3 audit_published_evidence.py [--repo PATH] [--commit SHA] [--out-dir DIR]
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys

COMMIT = "54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0"
DIR = "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26"

# The six §16.138 receipt-bundle files authored inside IRR; the remaining manifest
# entries describe the transferred Windows evidence.
IRR_AUTHORED = {
    "00-remote-state-reverification.json",
    "01-user-reported-windows-manifest-verification.json",
    "02-publication-readback.json",
    "INDEX.md",
    "verify_s2_publication.py",
    "verify_s2_receipt.py",
}

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

# Families used to describe what each transferred file actually is.
FAMILIES = [
    ("required-s2-step", REQUIRED),
    ("sidecar-digest", ["s2-01-npm-ci.sha256.txt", "s2-02-tsc-noemit.sha256.txt",
                        "s2-03-build.sha256.txt", "s2-04-guarded-npm-test.sha256.txt",
                        "s2-failure-diagnostic.sha256.txt",
                        "s2-fix-package-consumer-diagnostic.sha256.txt",
                        "s2-fix-validation-20261026T093342Z.txt.sha256.txt",
                        "s2-package-consumer-launch-inspection.sha256.txt",
                        "s2-windows-esm-fix-patch-record.sha256.txt",
                        "s2-windows-esm-investigation.sha256.txt"]),
    ("manifest-tooling-output", ["s2-04-sha256-manifest-generation.txt",
                                 "s2-evidence-manifest-verification.txt"]),
    ("transfer-declaration", ["NON_AUTHORITATIVE_TRANSFER.md",
                              "00-preflight-results-provided-in-chat.txt"]),
]


def git(repo: str, *args: str) -> bytes:
    return subprocess.run(["git", "-C", repo, *args], check=True, capture_output=True).stdout


def blob(repo: str, path: str) -> bytes:
    return git(repo, "cat-file", "blob", f"{COMMIT}:{DIR}/{path}")


def restored_variants(raw: bytes) -> dict[str, bytes]:
    crlf = raw.replace(b"\n", b"\r\n")
    return {
        "as_committed": raw,
        "crlf_restored": crlf,
        "crlf_restored_no_trailing_newline": crlf.rstrip(b"\r\n"),
        "lf_body_with_single_trailing_crlf": raw.rstrip(b"\n") + b"\r\n",
        "lf_trailing_newline_normalized": raw.rstrip(b"\n") + b"\n",
    }


def family(name: str) -> str:
    for label, members in FAMILIES:
        if name in members:
            return label
    return "host-transcript"


def classify_origin(name: str, text: str) -> str:
    """Describe what the file is, from its own content (heuristic, labelled as such)."""
    if "transcribed from operator-pasted console output" in text:
        return "self-declared chat transcription (not a raw host transcript)"
    if "NON-AUTHORITATIVE" in text and name.endswith(".md"):
        return "transfer declaration authored in-session"
    if "iips-evidence" in text or "iips-work" in text:
        return "host-captured transcript/inventory (carries Windows paths)"
    if name.endswith(".sha256.txt"):
        return "digest sidecar produced alongside a host file"
    return "derived/summary file (no Windows path retained)"


def main() -> int:
    import hashlib

    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.getcwd())
    ap.add_argument("--commit", default=COMMIT)
    ap.add_argument("--out-dir", default=os.path.dirname(os.path.abspath(__file__)))
    args = ap.parse_args()

    manifest = blob(args.repo, "SHA256SUMS.txt").decode("utf-8")
    recorded = []
    for line in manifest.splitlines():
        if line.strip():
            h, f = line.split(None, 1)
            recorded.append((h.strip().upper(), f.strip()))

    committed = sorted(os.path.basename(p) for p in
                       git(args.repo, "ls-tree", "-r", "--name-only", args.commit, DIR)
                       .decode().splitlines())

    entries, rows = [], []
    counts: dict[str, int] = {}
    for recorded_hash, name in recorded:
        transferred = name not in IRR_AUTHORED
        if name not in committed:
            entries.append({"file": name, "transferred": transferred, "present": False,
                            "classification": "ABSENT"})
            counts["ABSENT"] = counts.get("ABSENT", 0) + 1
            continue
        raw = blob(args.repo, name)
        text = raw.decode("utf-8", "replace")
        reproduced_by = "none"
        for label, candidate in restored_variants(raw).items():
            if hashlib.sha256(candidate).hexdigest().upper() == recorded_hash:
                reproduced_by = label
                break
        verdict = "MATCH" if reproduced_by != "none" else "MISMATCH"
        counts[verdict] = counts.get(verdict, 0) + 1
        entries.append({
            "file": name,
            "transferred": transferred,
            "present": True,
            "committed_bytes": len(raw),
            "blob_sha1": git(args.repo, "rev-parse", f"{COMMIT}:{DIR}/{name}").decode().strip(),
            "recorded_manifest_sha256": recorded_hash,
            "reproduced_sha256": hashlib.sha256(
                restored_variants(raw)[reproduced_by] if reproduced_by != "none" else raw
            ).hexdigest().upper(),
            "reproduced_by": reproduced_by,
            "digest_verdict": verdict,
            "required_s2_step_file": name in REQUIRED,
            "family": family(name),
            "origin": classify_origin(name, text),
        })

    transferred_rows = [e for e in entries if e["transferred"]]
    required_rows = [e for e in entries if e["file"] in REQUIRED]

    result = {
        "record": "IIPS-V3-CAP03-S2-EVIDENCE-PRESENCE-AND-DIGEST-MATRIX-2026-10-26-01",
        "generated_by": "audit_published_evidence.py",
        "commit": args.commit,
        "evidence_dir": DIR,
        "inventory": {
            "committed_files_in_dir": len(committed),
            "manifest_entries": len(recorded),
            "irr_authored_entries": len(recorded) - len(transferred_rows),
            "transferred_evidence_entries": len(transferred_rows),
        },
        "presence": {
            "transferred_present": sum(1 for e in transferred_rows if e["present"]),
            "transferred_absent": [e["file"] for e in transferred_rows if not e["present"]],
            "required_present": sum(1 for e in required_rows if e["present"]),
            "required_absent": [e["file"] for e in required_rows if not e["present"]],
            "present_but_not_in_manifest": [n for n in committed
                                            if n not in {f for _, f in recorded}],
            "absent_windows_session_transcript": "windows-session-transcript.txt" not in committed,
        },
        "digests": {
            "verdict_counts": counts,
            "transferred_match": sum(1 for e in transferred_rows
                                     if e.get("digest_verdict") == "MATCH"),
            "transferred_mismatch": [e["file"] for e in transferred_rows
                                     if e.get("digest_verdict") == "MISMATCH"],
            "required_match": sum(1 for e in required_rows
                                  if e.get("digest_verdict") == "MATCH"),
            "required_mismatch": [e["file"] for e in required_rows
                                  if e.get("digest_verdict") == "MISMATCH"],
        },
        "standalone_47_entry_manifest_file_present": False,
        "note_47_entry_manifest": "No standalone 47-entry manifest file exists in the "
                                  "repository. The 47 transferred entries are carried inside the "
                                  "single sorted 53-entry SHA256SUMS.txt, which is therefore the "
                                  "manifest of record for this transfer; its 47 transferred lines "
                                  "reconstruct the Windows manifest's content.",
        "entries": entries,
    }

    for e in sorted(transferred_rows, key=lambda x: x["file"]):
        rows.append("| `{}` | {} | {} | {} | {} |".format(
            e["file"], f"{e['committed_bytes']:,}", e["reproduced_by"],
            "**MISMATCH**" if e["digest_verdict"] == "MISMATCH" else "MATCH",
            "yes" if e["required_s2_step_file"] else ""))

    md = [f"# Presence and digest matrix — `{DIR}`",
          "",
          f"Commit `{args.commit}`. Generated by `audit_published_evidence.py`; do not hand-edit.",
          "",
          "## Inventory", "",
          f"- committed files in directory: **{len(committed)}**",
          f"- manifest entries: **{len(recorded)}** = {len(recorded) - len(transferred_rows)} IRR-authored + **{len(transferred_rows)} transferred**",
          f"- transferred files present: **{result['presence']['transferred_present']}/{len(transferred_rows)}**",
          f"- required S2 step files present: **{result['presence']['required_present']}/{len(REQUIRED)}**",
          f"- digests: **{result['digests']['transferred_match']} MATCH / {len(result['digests']['transferred_mismatch'])} MISMATCH** (transferred set)",
          f"- digests: **{result['digests']['required_match']}/9 MATCH** (required set)",
          f"- present but not in manifest: {', '.join('`'+n+'`' for n in result['presence']['present_but_not_in_manifest'])}",
          "",
          "## Per-file matrix (transferred set)", "",
          "| File | Bytes | Reproduced by | Digest | Required |",
          "|---|---|---|---|---|",
          *rows, "",
          "`MATCH` means the recorded digest is reproduced from the committed content under the",
          "named disclosed transformation. It does not mean the committed bytes are identical to",
          "the host originals, whose line terminators were CRLF.", ""]
    with open(os.path.join(args.out_dir, "05-presence-and-digest-matrix.md"), "w",
              encoding="utf-8") as fh:
        fh.write("\n".join(md))
    with open(os.path.join(args.out_dir, "03-presence-and-digest-matrix.json"), "w",
              encoding="utf-8") as fh:
        json.dump(result, fh, indent=2)
        fh.write("\n")

    print(json.dumps({k: result[k] for k in ("inventory", "presence", "digests")}, indent=2))
    print("wrote 03-presence-and-digest-matrix.json and 05-presence-and-digest-matrix.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
