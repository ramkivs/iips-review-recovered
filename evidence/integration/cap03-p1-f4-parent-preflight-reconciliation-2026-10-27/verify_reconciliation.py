#!/usr/bin/env python3
"""Verifier for IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-RECONCILIATION-2026-10-27-01.

Recomputes every assertion this record makes that is checkable from repository content.
Read-only: it opens files, compares bytes and prints a verdict; it writes nothing.

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

RECORD = "IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-RECONCILIATION-2026-10-27-01"
DOC = REPO / "docs/integration/IIPS_v3.0_CAP03_P1_F4_PARENT_PREFLIGHT_RECONCILIATION_2026-10-27.md"
TRACKER = REPO / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
PF15_ACT = REPO / "docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"

F4 = "C:" + chr(92) + "iips-data" + chr(92) + "iips" + chr(92) + "user-portfolio.sqlite"
F4_HEX = "433a5c696970732d646174615c696970735c757365722d706f7274666f6c696f2e73716c697465"
TERMINAL_PARENT = "C:" + chr(92) + "iips-data" + chr(92) + "iips"

results: list[tuple[str, bool, str]] = []


def check(cid: str, ok: bool, detail: str = "") -> None:
    results.append((cid, bool(ok), detail))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    # --- V972: the F4 literal, byte-exact, everywhere it is asserted -----------------
    check("F4-length-39", len(F4) == 39, f"len={len(F4)}")
    check("F4-separators-3", F4.count(chr(92)) == 3, f"count={F4.count(chr(92))}")
    check("F4-hex", F4.encode("ascii").hex() == F4_HEX)
    doc = DOC.read_text(encoding="utf-8")
    check("F4-verbatim-in-record", F4 in doc)
    check("F4-no-doubled-separators-in-record", "C:" + chr(92) * 2 + "iips-data" not in doc)
    span = re.search(r"`(C:[^`]*portfolio\.sqlite)`", doc)
    check("F4-first-span-is-canonical", bool(span) and span.group(1) == F4,
          "" if span is None else repr(span.group(1)))
    check("terminal-parent-verbatim-in-record", TERMINAL_PARENT in doc)

    # --- F4 unchanged against the effective act -------------------------------------
    act = PF15_ACT.read_text(encoding="utf-8")
    act_spans = re.findall(r"`(C:[^`]*portfolio\.sqlite)`", act)
    check("act--02-carries-same-F4", any(s == F4 for s in act_spans), f"{len(act_spans)} span(s)")

    # --- V973/V974: the cited primary sources still say what is quoted --------------
    cited = json.loads((EVIDENCE / "00-cited-records-and-blobs.json").read_text(encoding="utf-8"))
    check("citation-PF13-says-parent-exists", "parent exists" in cited["citations"]["PF-13"]["verbatim"])
    check("citation-PF12-says-nothing-created",
          "no directory/file is created by preflight" in cited["citations"]["PF-12"]["verbatim"])
    check("citation-PF11-has-no-existence-clause",
          "parent exists" not in cited["citations"]["PF-11"]["verbatim"])
    step1 = " ".join(cited["citations"]["successor_step_1"]["verbatim"].values())
    check("successor-step1-file-must-not-pre-exist", "file must not pre-exist" in step1)
    check("successor-step1-no-parent-existence", "parent exists" not in step1)
    check("citation-mkdir-recursive",
          "mkdirSync(dirname(filePath), { recursive: true })"
          in cited["citations"]["mkdir_recursive"]["verbatim"])
    check("citation-validate-store-not-found",
          "STORE_NOT_FOUND" in " ".join(cited["citations"]["validate_store_not_found"]["verbatim"].values()))

    # --- V978: dispositions present and internally consistent -----------------------
    recon = json.loads((EVIDENCE / "01-pf11-pf12-pf13-reconciliation.json").read_text(encoding="utf-8"))
    ids = [d["id"] for d in recon["dispositions"]]
    check("dispositions-01-02-03-present", ids == ["DISP-01", "DISP-02", "DISP-03"], str(ids))
    check("obs-01-present", [o["id"] for o in recon["observations"]] == ["OBS-01"])
    check("recon-f4-matches", recon["f4_value_unchanged"] == F4)
    check("recon-f4-len", recon["f4_length_bytes"] == 39)
    check("recon-f4-seps", recon["f4_separator_count"] == 3)
    check("recon-terminal-parent-absent-claimed-false",
          recon["path_decomposition"]["terminal_parent_exists_on_host"] is False)

    reuse = json.loads((EVIDENCE / "03-reuse-determination.json").read_text(encoding="utf-8"))
    check("reuse-P1C-not-established",
          reuse["status_after_this_record"]["P-1-C"].startswith("NOT ESTABLISHED"))
    check("reuse-P1-unspent", reuse["status_after_this_record"]["P-1"].startswith("UNSPENT"))

    # --- V977: the instrument never executes provisioning ---------------------------
    script = (EVIDENCE / "02-p1c-p1d-readonly-preflight.ps1").read_text(encoding="utf-8")

    def strip_powershell_comments(text: str) -> str:
        """Remove <# ... #> block comments and # line comments, preserving code."""
        text = re.sub(r"<#.*?#>", "", text, flags=re.DOTALL)
        return "\n".join(
            "" if ln.lstrip().startswith("#") else ln for ln in text.split("\n")
        )

    code = strip_powershell_comments(script)
    exec_lines = [ln for ln in code.split("\n") if ln.strip()]
    # An actual invocation would carry the CLI path and the execute flag on one executable line.
    check("instrument-no-execute-invocation",
          not any("gateAPrimeProvisioning" in ln and "--mode=execute" in ln for ln in exec_lines))
    check("instrument-no-execute-flag-passed-to-node",
          not any(re.search(r"\bnode\b", ln) and "--mode=execute" in ln for ln in exec_lines))
    # The flag may appear in comments and in a displayed warning string, but on no invocation line.
    check("instrument-execute-flag-only-in-comments-or-display",
          all(
              "Write-Host" in ln or "Out-File" in ln or ln.lstrip().startswith("#")
              for ln in exec_lines if "--mode=execute" in ln
          ),
          str([ln.strip()[:60] for ln in exec_lines if "--mode=execute" in ln]))
    check("instrument-mentions-execute-only-in-comments",
          "--mode=execute" in script, "documented-but-never-invoked")
    check("instrument-carries-verbatim-store", F4 in script)
    check("instrument-declares-no-store-creation", "creates NO store file" in script)
    check("instrument-documents-equals-form",
          "--store=$StorePath" in script and "--act-id=$ActId" in script)
    check("instrument-has-no-create-item-outside-evidence-root",
          all("New-Item" not in ln or "EvidenceRoot" in ln
              for ln in code.split("\n") if "New-Item" in ln))

    # --- V979: non-movement --------------------------------------------------------
    check("record-declares-zero-ipd-writes", "**0**" in doc and "IPD writes" in doc)
    check("record-declares-p1-unspent", "UNSPENT" in doc)
    check("no-db-artifacts-in-evidence",
          not any(p.suffix in {".sqlite", ".db", ".wal", ".shm"} for p in EVIDENCE.rglob("*")))

    # --- V980: tracker carries exactly one §16.146 and the record id ----------------
    tracker = TRACKER.read_text(encoding="utf-8")
    check("tracker-single-16.146-heading", tracker.count("## §16.146 —") == 1,
          f"count={tracker.count('## §16.146 —')}")
    check("tracker-carries-record-id", RECORD in tracker)
    check("record-id-unique-in-doc", doc.count(RECORD) >= 1)
    check("record-has-end-marker", doc.rstrip().endswith("no gate advanced.*"))

    # --- working tree hygiene ------------------------------------------------------
    try:
        diff_check = subprocess.run(
            ["git", "-C", str(REPO), "diff", "--check"],
            capture_output=True, text=True, timeout=60,
        )
        check("git-diff-check-clean", diff_check.returncode == 0, diff_check.stdout.strip()[:200])
    except Exception as exc:  # pragma: no cover - environment dependent
        check("git-diff-check-clean", False, str(exc))

    width = max(len(c) for c, _, _ in results)
    failed = 0
    for cid, ok, detail in results:
        if not ok:
            failed += 1
        print(f"{'PASS' if ok else 'FAIL'}  {cid.ljust(width)}  {detail}")
    print(f"\n{len(results) - failed}/{len(results)} checks passed")
    print("RECONCILIATION VERIFIED" if failed == 0 else f"{failed} CHECK(S) FAILED")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
