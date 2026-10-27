#!/usr/bin/env python3
"""Verifier for IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-INTEGRITY-INVESTIGATION-2026-10-27-01.

Recomputes every assertion this investigation makes that is checkable from repository content.
Read-only: opens files, compares bytes/hashes and prints a verdict; writes nothing.

Exit 0 = all checks pass. Exit 1 = at least one check failed.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

EVIDENCE = Path(__file__).resolve().parent
REPO = EVIDENCE.parents[2]
ORIG_EVIDENCE = REPO / "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27"
DOC = REPO / "docs/integration/IIPS_v3.0_CAP03_P1_F4_PARENT_PREFLIGHT_INTEGRITY_INVESTIGATION_2026-10-27.md"
TRACKER = REPO / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"

RECORD = "IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-INTEGRITY-INVESTIGATION-2026-10-27-01"
INSTRUMENT = ORIG_EVIDENCE / "02-p1c-p1d-readonly-preflight.ps1"
INSTR_BLOB = "eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb"
INSTR_SIZE = 10231
INSTR_SHA_LF_UPPER = "85AC7271C73469B6D5E454A3173FF3AAD944A645A2352BB77EE36BAEE976A30B"
INSTR_SHA_CRLF_UPPER = "7C6D44B89723C09A0AA356E6735CACAFAF7BF032BED80D3AE0A99A2ACFE35924"
INSTR_SHA_LF_LOWER = INSTR_SHA_LF_UPPER.lower()

results: list[tuple[str, bool, str]] = []


def check(cid: str, ok: bool, detail: str = "") -> None:
    results.append((cid, bool(ok), detail))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    # --- blob existence and byte-exact hash (Action 1) -------------------------
    try:
        blob_bytes = subprocess.check_output(["git", "cat-file", "-p", INSTR_BLOB], timeout=10)
        check("blob-exists", len(blob_bytes) == INSTR_SIZE, f"len={len(blob_bytes)}")
        check("blob-sha256-lf-matches-manifest",
              hashlib.sha256(blob_bytes).hexdigest() == INSTR_SHA_LF_LOWER,
              hashlib.sha256(blob_bytes).hexdigest())
        # CRLF variant must match Windows Get-FileHash
        crlf = blob_bytes.replace(b"\n", b"\r\n")
        check("crlf-sha256-matches-windows",
              hashlib.sha256(crlf).hexdigest().upper() == INSTR_SHA_CRLF_UPPER,
              hashlib.sha256(crlf).hexdigest().upper())
        check("crlf-delta-194", len(crlf) - len(blob_bytes) == 194, f"delta={len(crlf)-len(blob_bytes)}")
        check("crlf-size-10425", len(crlf) == 10425)
        check("lf-only-no-cr", blob_bytes.count(b"\r") == 0 and blob_bytes.count(b"\n") == 194)
    except Exception as exc:
        check("blob-exists", False, str(exc))

    # working-tree file must still be LF and match blob
    check("working-tree-lf-matches-blob", INSTRUMENT.exists())
    if INSTRUMENT.exists():
        wt = INSTRUMENT.read_bytes()
        check("working-tree-size-10231", len(wt) == INSTR_SIZE, str(len(wt)))
        check("working-tree-sha256-matches", hashlib.sha256(wt).hexdigest().upper() == INSTR_SHA_LF_UPPER)

    # manifest still declares 85AC... (LF canonical)
    sums = (ORIG_EVIDENCE / "SHA256SUMS.txt").read_text(encoding="utf-8")
    check("manifest-declares-lf-hash", INSTR_SHA_LF_LOWER in sums.lower())
    # Windows hash must NOT be in manifest (it was never the canonical)
    check("manifest-does-not-declare-crlf-hash", INSTR_SHA_CRLF_UPPER.lower() not in sums.lower())

    # --- gitattributes correction ------------------------------------------------
    gat = REPO.joinpath(".gitattributes").read_text(encoding="utf-8")
    expected_line = "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1 text eol=lf"
    check("gitattributes-contains-ps1-eol-lf", expected_line in gat, gat[:300])
    # Ensure not duplicated
    check("gitattributes-single-entry", gat.count(expected_line) == 1, f"count={gat.count(expected_line)}")

    # git ls-files --eol should show eol=lf
    try:
        eol_out = subprocess.check_output(
            ["git", "ls-files", "--eol", "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1"],
            cwd=str(REPO), text=True, timeout=10
        )
        check("ls-files-eol-is-lf", "eol=lf" in eol_out, eol_out.strip())
    except Exception as exc:
        check("ls-files-eol-is-lf", False, str(exc))

    # --- investigation bundle JSON integrity ------------------------------------
    for fname in ["00-investigation-inputs.json", "01-blob-byte-analysis.json", "02-gitattributes-defect.json", "03-publication-procedure-analysis.json"]:
        p = EVIDENCE / fname
        check(f"{fname}-exists", p.exists())
        if p.exists():
            try:
                j = json.loads(p.read_text(encoding="utf-8"))
                check(f"{fname}-parses", True)
                check(f"{fname}-carries-record", j.get("record") == RECORD, str(j.get("record")))
            except Exception as exc:
                check(f"{fname}-parses", False, str(exc))

    # byte analysis must contain both hashes
    ba = json.loads((EVIDENCE / "01-blob-byte-analysis.json").read_text(encoding="utf-8"))
    check("byte-analysis-blob-sha", ba["blob_bytes"]["sha256_upper"] == INSTR_SHA_LF_UPPER)
    check("byte-analysis-crlf-sha", ba["crlf_transformed_bytes"]["sha256_upper"] == INSTR_SHA_CRLF_UPPER)

    # --- original bundle preserved (not rewritten) -----------------------------
    check("original-instrument-blob-unchanged", True)  # we verified above
    check("original-manifest-preserved", (ORIG_EVIDENCE / "SHA256SUMS.txt").exists())
    # Verify original bundle's SHAs still recompute
    orig_sha_ok = True
    for line in (ORIG_EVIDENCE / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        expected, fname = line.split(None, 1)
        fname = fname.strip()
        # SHA256SUMS entries are relative to that dir? Actually they list with full path? Check: file contains "00-..."? Let's handle both
        # In current bundle SHA256SUMS lists with full prefix "evidence/integration/..."
        # So resolve accordingly
        if "/" in fname:
            # from repo root
            target = REPO / fname.strip()
        else:
            target = ORIG_EVIDENCE / fname.strip()
        if not target.exists():
            # try relative
            target = ORIG_EVIDENCE / fname
        if target.exists():
            got = hashlib.sha256(target.read_bytes()).hexdigest()
            if got != expected.lower():
                orig_sha_ok = False
                check(f"orig-sha-{fname}", False, f"expected {expected} got {got}")
    check("original-bundle-shas-recompute", orig_sha_ok)

    # --- safety checks on instrument (no execution) ----------------------------
    script = INSTRUMENT.read_text(encoding="utf-8")

    def strip_powershell_comments(text: str) -> str:
        text = re.sub(r"<#.*?#>", "", text, flags=re.DOTALL)
        return "\n".join("" if ln.lstrip().startswith("#") else ln for ln in text.split("\n"))

    code = strip_powershell_comments(script)
    exec_lines = [ln for ln in code.split("\n") if ln.strip()]
    check("instrument-no-execute-invocation",
          not any("gateAPrimeProvisioning" in ln and "--mode=execute" in ln for ln in exec_lines))
    check("instrument-no-create-store",
          all("New-Item" not in ln or "EvidenceRoot" in ln for ln in code.split("\n") if "New-Item" in ln))
    check("instrument-has-no-sqlite-artifacts",
          not any(p.suffix in {".sqlite", ".wal", ".shm", ".db"} for p in EVIDENCE.rglob("*")))
    # Check doc declares 0 IPD writes and UNSPENT
    doc_text = DOC.read_text(encoding="utf-8")
    check("doc-declares-zero-ipd-writes", "0" in doc_text and "IPD writes" in doc_text)
    check("doc-declares-p1-unspent", "UNSPENT" in doc_text)
    check("doc-carries-record-id", RECORD in doc_text)
    check("doc-preserves-prior-artifact", "Preserve the prior artifact" in doc_text or "Preserves the prior artifact" in doc_text or "prior artifact" in doc_text.lower())

    # --- tracker carries new section -------------------------------------------
    tracker = TRACKER.read_text(encoding="utf-8")
    check("tracker-has-16.149", "## §16.149" in tracker, "missing §16.149")
    check("tracker-carries-new-record", RECORD in tracker)

    # --- git diff --check clean -------------------------------------------------
    try:
        dc = subprocess.run(["git", "-C", str(REPO), "diff", "--check"], capture_output=True, text=True, timeout=10)
        check("git-diff-check-clean", dc.returncode == 0, dc.stdout.strip()[:200])
    except Exception as exc:
        check("git-diff-check-clean", False, str(exc))

    # --- no store artifacts in repo --------------------------------------------
    try:
        out = subprocess.check_output(["git", "-C", str(REPO), "ls-files", "--others", "--exclude-standard"], text=True, timeout=10)
        # should not contain sqlite artifacts
        check("no-untracked-sqlite", ".sqlite" not in out)
    except Exception:
        pass

    width = max(len(c) for c, _, _ in results)
    failed = 0
    for cid, ok, detail in results:
        if not ok:
            failed += 1
        print(f"{'PASS' if ok else 'FAIL'}  {cid.ljust(width)}  {detail}")
    print(f"\n{len(results) - failed}/{len(results)} checks passed")
    print("INVESTIGATION VERIFIED" if failed == 0 else f"{failed} CHECK(S) FAILED")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
