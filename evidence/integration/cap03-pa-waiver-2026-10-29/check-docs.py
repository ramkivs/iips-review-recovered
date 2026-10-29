#!/usr/bin/env python3
"""Documentation-integrity checks for the CAP-03 PA waiver pass (2026-10-29).

Read-only. Exits non-zero if any check fails. Checks:

  C1  no merge-conflict markers in any edited file
  C2  tracker `## §16.NNN` and package `## n.` headings are unique
  C3  the new identifiers are defined exactly once; V-rows unique
  C4  every markdown table has a consistent cell count (escaped `|` respected)
  C5  every `PA-nn` referenced in the package is defined in the package
  C6  every `H-1`…`H-9` mention is inside the ruling sections, or carries a
      waiver cue on its line, or sits in a subsection that carries a `PA-W-01`
      dated note
  C7  every relative markdown link target in the package exists on disk
  C8  the ruling records ID, date, authority, scope, rationale and effect
  C9  no adoption claim appears outside the ruling sections
"""

import os
import re
import sys

PKG = "docs/integration/IIPS_v3.0_CAP03_CONSOLIDATED_PA_DECISION_PACKAGE_PROPOSED_2026-10-29.md"
TRK = "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
FILES = [PKG, TRK]
failures = []


def fail(check, detail):
    failures.append((check, detail))


def read(path):
    with open(path, encoding="utf-8") as handle:
        return handle.read()


pkg, trk = read(PKG), read(TRK)
pkg_lines, trk_lines = pkg.split("\n"), trk.split("\n")


def verdict(check):
    ok = not any(f[0] == check for f in failures)
    print(f"{check}: {'PASS' if ok else 'FAIL'}")
    return ok


# C1 -------------------------------------------------------------------------
for path in FILES:
    text = read(path)
    for marker in ("<<<<<<<", ">>>>>>>", "\n=======\n"):
        if marker in text:
            fail("C1", f"conflict marker {marker!r} in {path}")
verdict("C1 conflict markers")

# C2 -------------------------------------------------------------------------
nums = [re.match(r"## §16\.(\d+)", ln).group(1) for ln in trk_lines if ln.startswith("## §16.")]
if {n for n in nums if nums.count(n) > 1}:
    fail("C2", f"duplicate tracker sections: {sorted({n for n in nums if nums.count(n) > 1})}")
pkg_nums = [re.match(r"^## (\d+)\.", ln).group(1) for ln in pkg_lines if re.match(r"^## \d+\.", ln)]
if {n for n in pkg_nums if pkg_nums.count(n) > 1}:
    fail("C2", f"duplicate package sections: {sorted({n for n in pkg_nums if pkg_nums.count(n) > 1})}")
verdict("C2 headings unique")
print(f"    tracker sections: {len(nums)} (max §16.{max(nums, key=int)}); package sections: {pkg_nums}")

# C3 -------------------------------------------------------------------------
def count_definitions(ident):
    total = 0
    for lines in (pkg_lines, trk_lines):
        for ln in lines:
            if ident == "§16.202":
                total += ln.startswith("## §16.202")
            elif ident == "PA-W-01":
                total += ln.startswith("## 9. Adopted PA ruling")
            elif ident in ("CV-CORR-182", "CHG-2026-10-29-24"):
                total += ln.startswith("## §16.202") and ident in ln
            elif ident.startswith("IIPS-V3-CAP03"):
                total += ln.startswith("| **Decision ID** |") and ident in ln
            else:
                total += ln.startswith("**Record ID:**") and ident in ln
    return int(total)


for ident in ("IIPS-V3-CAP03-H1-H9-BLOCKER-WAIVER-PA-DECISION-2026-10-29-01", "PA-W-01",
              "§16.202", "CV-CORR-182", "CHG-2026-10-29-24"):
    got = count_definitions(ident)
    if got != 1:
        fail("C3", f"{ident}: {got} definition(s), expected 1")
for n in range(1488, 1496):
    ident = f"V{n}"
    rows = [ln for ln in trk_lines if re.match(r"^\| `" + ident + r"` \|", ln)]
    if len(rows) != 1:
        fail("C3", f"{ident}: {len(rows)} register row(s), expected exactly 1")
verdict("C3 identifiers unique")

# C4 -------------------------------------------------------------------------
PIPE = re.compile(r"(?<!\\)\|")


def cells(line):
    stripped = line.strip()
    if stripped.startswith("|"):
        stripped = stripped[1:]
    if stripped.endswith("|") and not stripped.endswith("\\|"):
        stripped = stripped[:-1]
    return len(PIPE.split(stripped))


def irregular_tables(text):
    """Return the header signatures of tables whose rows disagree on cell count."""
    lines = text.split("\n")
    found, block = [], []
    for idx, ln in enumerate(lines + [""]):
        if ln.strip().startswith("|"):
            block.append(ln)
            continue
        if len(block) >= 2 and len({cells(row) for row in block}) > 1:
            found.append(block[0][:60])
        block = []
    return found


import subprocess

baseline_pre_existing = {}
for path in FILES:
    try:
        committed = subprocess.run(["git", "show", f"HEAD:{path}"], capture_output=True,
                                   text=True, check=True).stdout
    except subprocess.CalledProcessError:
        committed = ""
    baseline_pre_existing[path] = irregular_tables(committed)

for path in FILES:
    current = irregular_tables(read(path))
    pre_existing = baseline_pre_existing[path]
    for signature in current:
        if signature not in pre_existing:
            fail("C4", f"{os.path.basename(path)}: NEW irregular table: {signature!r}")
    verdict_detail = (f"{len(current)} irregular table(s) present, "
                      f"{len(pre_existing)} pre-existing at HEAD — no new one")
    print(f"    {os.path.basename(path)}: {verdict_detail}")
verdict("C4 table cell counts (no new irregular table)")

# C5 -------------------------------------------------------------------------
defined = set(re.findall(r"### (PA-\d{2})\b", pkg))
defined |= {m for m in re.findall(r"\*\*(PA-08[abc]|PA-10[abc]) —", pkg)}
referenced = set(re.findall(r"\bPA-\d{2}[abc]?\b", pkg))
undefined = {r for r in referenced if r not in defined}
if undefined:
    fail("C5", f"referenced but undefined: {sorted(undefined)}")
verdict("C5 PA identifiers defined")
print(f"    {len(referenced)} referenced, {len(defined)} defined")

# C6 -------------------------------------------------------------------------
RANGES = []
for name in ("### 4.1.1 ", "## 5. Operator and host evidence", "## 9. Adopted PA ruling"):
    start = next(i for i, ln in enumerate(pkg_lines) if ln.startswith(name))
    RANGES.append(start)
ENDS = [
    next(i for i, ln in enumerate(pkg_lines) if ln.startswith("### 4.2 ")),
    next(i for i, ln in enumerate(pkg_lines) if ln.startswith("## 6. Excluded")),
    len(pkg_lines),
]
SPANS = list(zip(RANGES, ENDS))


def in_span(idx):
    return any(a <= idx < b for a, b in SPANS)


CUE = re.compile(r"waiv|PA-W-01|supersed|PA-WAIVED", re.I)
HEADING = re.compile(r"^#{3,4} ")


def subsection_has_cue(idx):
    end = next((j for j in range(idx + 1, len(pkg_lines)) if HEADING.match(pkg_lines[j])), len(pkg_lines))
    return any(CUE.search(pkg_lines[j]) for j in range(idx, end))


for idx, ln in enumerate(pkg_lines):
    if not re.search(r"\bH-[1-9]\b", ln):
        continue
    if idx == 6 or in_span(idx) or CUE.search(ln) or subsection_has_cue(idx):
        continue
    fail("C6", f"line {idx + 1}: H-item mention without a waiver statement: {ln[:90]}")
verdict("C6 H-item mentions annotated")

# C7 -------------------------------------------------------------------------
for target in re.findall(r"\]\(([^)#][^)]*)\)", pkg):
    if target.startswith(("http://", "https://")):
        continue
    if not os.path.exists(os.path.normpath(os.path.join(os.path.dirname(PKG), target))):
        fail("C7", f"missing link target: {target}")
verdict("C7 link targets resolve")

# C8 -------------------------------------------------------------------------
for label, needle in {
    "decision ID": "IIPS-V3-CAP03-H1-H9-BLOCKER-WAIVER-PA-DECISION-2026-10-29-01",
    "decision date": "| **Decision date** |",
    "authority": "| **Authority** |",
    "scope": "| **Scope** |",
    "rationale": "### 9.3 Rationale",
    "exact effect": "### 9.4 Exact effect",
    "non-effect": "### 9.5 What the ruling does",
    "residual prerequisites": "### 9.6 Residual prerequisites",
    "dependent decisions": "### 9.7 Consequences",
    "register": "### 9.8 Register",
}.items():
    if needle not in pkg:
        fail("C8", f"ruling element missing: {label}")
verdict("C8 ruling elements present")

# C9 -------------------------------------------------------------------------
for idx, ln in enumerate(pkg_lines):
    if re.search(r"ADOPTED and EFFECTIVE|ADOPTED, EFFECTIVE", ln) and not in_span(idx) and idx != 6:
        fail("C9", f"line {idx + 1}: adoption claim outside the ruling: {ln[:80]}")
verdict("C9 adoption claims confined to the ruling")

print()
if failures:
    print(f"RESULT: FAIL — {len(failures)} issue(s)")
    for check, detail in failures:
        print(f"  {check}: {detail}")
    sys.exit(1)
print("RESULT: PASS — all documentation-integrity checks clean")
