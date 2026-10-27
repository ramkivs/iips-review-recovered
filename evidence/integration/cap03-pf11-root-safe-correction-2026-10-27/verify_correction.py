#!/usr/bin/env python3
"""Verify the local CAP-03 PF-11 correction bundle using only Python stdlib."""
from __future__ import annotations
import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
ORIGINAL = REPO / "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1"
CORRECTED = HERE / "02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1"
HELPER = HERE / "01-Find-GitWorktreeAncestor.ps1"
PROCEDURE = REPO / "docs/integration/IIPS_v3.0_CAP03_PF11_ROOT_SAFE_INSTRUMENT_CORRECTION_2026-10-27.md"
F4 = b"C:\\iips-data\\iips\\user-portfolio.sqlite"

def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit("FAIL: " + message)
    print("PASS: " + message)

baseline = json.loads((HERE / "00-authoritative-baseline.json").read_text(encoding="utf-8"))
require(baseline["baseline"]["commit"] == "cf6e0af50c984b8fc04ba76a70ec3a3e401fb200", "baseline commit recorded")
require(baseline["baseline"]["tree"] == "0a0918f0e1f816c970a44860763d32c32fc44f2b", "baseline tree recorded")
require(sha(ORIGINAL) == baseline["authoritative_inputs"]["published_pf11_pf12_pf13_instrument"]["sha256"], "historical instrument remains byte-identical")
require(subprocess.check_output(["git", "hash-object", str(ORIGINAL)], cwd=REPO, text=True).strip() == baseline["authoritative_inputs"]["published_pf11_pf12_pf13_instrument"]["git_blob"], "historical instrument blob remains unchanged")
require(F4 in ORIGINAL.read_bytes() and F4 in CORRECTED.read_bytes(), "exact F4 path retained in original and corrected artifact")
require(ORIGINAL.read_bytes().count(F4) == CORRECTED.read_bytes().count(F4), "F4 literal occurrence count unchanged")
require(HELPER.read_bytes().rstrip(b"\n") in CORRECTED.read_bytes(), "embedded helper matches standalone tested helper")
attr = subprocess.check_output(["git", "check-attr", "eol", "--", str(CORRECTED.relative_to(REPO))], cwd=REPO, text=True)
require(attr.rstrip().endswith("eol: lf"), "corrected instrument has a path-specific LF attribute")
helper = HELPER.read_bytes().lower()
forbidden = (b"new-item", b"set-content", b"remove-item", b"set-acl", b"setenvironmentvariable", b"--mode=execute")
require(all(token not in helper for token in forbidden), "helper adds no mutation, ACL, environment, or provisioning behavior")
require(b"storepath" not in helper and F4 not in helper, "helper is independent of and does not manipulate F4")
text = PROCEDURE.read_text(encoding="utf-8")
require("02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1" in text, "procedure supplement designates corrected artifact")
require("NOT EXECUTED / UNSPENT / NOT AUTHORIZED" in text, "P-1 authorization boundary remains explicit")

run = subprocess.run([sys.executable, str(HERE / "04-test_pf11_root_safe.py")], cwd=REPO, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
print(run.stdout, end="")
require(run.returncode == 0, "portable runtime suite exits successfully")
manifest = HERE / "SHA256SUMS.txt"
entries = {}
for line in manifest.read_text(encoding="ascii").splitlines():
    digest, name = line.split("  ", 1)
    entries[name] = digest
actual_names = {p.name for p in HERE.iterdir() if p.is_file() and p.name != manifest.name}
require(set(entries) == actual_names, "SHA256SUMS lists every bundle file except itself exactly once")
require(all(sha(HERE / name) == digest for name, digest in entries.items()), "all current bundle SHA-256 values match")
print("PASS: correction bundle verified locally")
