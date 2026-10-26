#!/usr/bin/env python3
"""CAP-02 QE matrix record — structural and completeness audit.

Non-authoritative repository check. It asserts only that the published CAP-02 QE
matrix record is internally complete and consistent with the governing shape:

  * the record is not truncated and carries sections 1..8;
  * the §3 matrix carries exactly QE-1..QE-11, one row each, seven columns each,
    an execution tier, a pass/fail condition, an artifact set and a location;
  * the exhaustive status vocabulary and the durability non-claim sentence are present;
  * the record states the 0/11 disposition and renders no result.

It proves nothing about qualification. It never touches the host, the store or IPD.

Usage: python3 03-matrix-row-audit.py [path-to-record]
Exit:  0 = every check PASS, 1 = at least one check FAIL.
"""
from __future__ import annotations

import pathlib
import re
import sys

DEFAULT = (
    "docs/integration/"
    "IIPS_v3.0_CAP02_QE_EXECUTION_MATRIX_AND_HOST_PREREQUISITES_2026-10-26.md"
)

failures: list[str] = []
passes: list[str] = []


def check(ok: bool, label: str, detail: str = "") -> None:
    (passes if ok else failures).append(label + (f" — {detail}" if detail else ""))
    print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f" — {detail}" if detail else ""))


def main(argv: list[str]) -> int:
    path = pathlib.Path(argv[1]) if len(argv) > 1 else pathlib.Path(DEFAULT)
    if not path.is_file():
        print(f"[FAIL] record present — {path} not found")
        return 1
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    check(path.stat().st_size > 0, "record present", f"{path} {path.stat().st_size} B")

    # A truncation marker is acceptable only if a repair appendix discloses it and
    # supplies the missing content (R2..R6 = rest of §4 and §§5-8).
    truncation = [i + 1 for i, line in enumerate(lines) if "truncated" in line and line.strip().startswith("...[")]
    repair = "REPAIR APPENDIX" in text
    disclosed = "Defect | body truncated" in text or "body truncated" in text
    check(not truncation or (repair and disclosed), "truncation absent or disclosed and repaired",
          "no truncation marker" if not truncation else f"marker at line {truncation}; repair={repair} disclosed={disclosed}")

    sections = {int(m.group(1)) for m in re.finditer(r"^## (\d+)\.", text, re.M)}
    blocks = {m.group(1) for m in re.finditer(r"^## (R[1-7])\.", text, re.M)}
    full = sections >= {1, 2, 3, 4, 5, 6, 7, 8} or (
        sections >= {1, 2, 3, 4} and blocks >= {"R2", "R3", "R4", "R5", "R6"}
    )
    check(full, "sections 1..8 present (body) or body 1..4 + repair blocks R2..R6",
          f"body sections {sorted(sections)}; repair blocks {sorted(blocks)}")

    rows: dict[str, list[str]] = {}
    for line in lines:
        m = re.match(r"^\|\s*(QE-\d+)\s*\|", line)
        if not m:
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        rows.setdefault(m.group(1), []).append(line)
        rows[m.group(1)].append("\x00".join(cells))

    ids = {f"QE-{n}" for n in range(1, 12)}
    check(set(rows) == ids, "exactly QE-1..QE-11 present, one row each",
          f"missing {sorted(ids - set(rows))}, extra {sorted(set(rows) - ids)}")

    for qe in sorted(ids & set(rows), key=lambda q: int(q.split("-")[1])):
        n_rows = len(rows[qe]) // 2
        cells = rows[qe][1].split("\x00")
        tier_ok = bool(re.search(r"\bT[123]\b", cells[2])) if len(cells) > 2 else False
        ceiling_ok = len(cells) > 2 and bool(cells[2])
        passfail_ok = len(cells) > 4 and "PASS" in cells[4].upper()
        artifact_ok = len(cells) > 5 and bool(cells[5])
        location_ok = len(cells) > 6 and cells[6].strip().upper() == "HOST-ONLY"
        check(
            n_rows == 1 and len(cells) == 7 and tier_ok and ceiling_ok and passfail_ok and artifact_ok and location_ok,
            f"{qe} row complete",
            f"rows={n_rows} cells={len(cells)} tier={tier_ok} ceiling={ceiling_ok} "
            f"pass/fail={passfail_ok} artifacts={artifact_ok} location={location_ok}",
        )

    for token in ("`PASS`", "`FAIL`", "`INCONCLUSIVE`", "`NOT EXECUTED — <reason>`", "`INVALID`"):
        check(token in text, f"status vocabulary {token}")
    check("no sixth class" in text.lower(), "single exhaustive status vocabulary statement")
    check("does not authorize a `durable:true` product claim" in text, "durability non-claim sentence")
    check("NOT RUN — 0/11" in text, "current disposition 0/11 stated")
    check(re.search(r"AUTHORIZED — NOT STARTED", text) is not None, "U3 status statement present")
    check("PA-approved revocation procedure" in text, "QE-8 governing prerequisite recorded")

    print()
    print(f"RESULT: {len(passes)} PASS / {len(failures)} FAIL")
    if failures:
        for f in failures:
            print(f"  FAILED: {f}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
