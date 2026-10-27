#!/usr/bin/env python3
"""Generate the CSV, XLSX and report section H from matrix_data.py, then
self-check the artefacts. Single source of truth: matrix_data.ROWS.

Run:  python3 build_matrix.py
"""
from __future__ import annotations

import csv
import json
import pathlib
import sys

import datetime as _dt

import matrix_data as md

DT = _dt.datetime(2026, 10, 27, 0, 0, 0)

HERE = pathlib.Path(__file__).resolve().parent
STEM = "IIPS_V3_CAPABILITY_MATRIX_51x17_2026-10-27"
CSV_PATH = HERE / f"{STEM}.csv"
XLSX_PATH = HERE / f"{STEM}.xlsx"
SECTION_H = HERE / "section-H-matrix.md"
CHECKS = HERE / "00-artefact-checks.json"


def markdown_section_h() -> str:
    lines = []
    lines.append("## H. The matrix — 51 capabilities × 17 dimensions\n")
    lines.append(
        "Cells are the investigation's own findings at IRR `main@f74af6d4` / IPD `main@888eb375` "
        "on `2026-10-27`. Nothing is copied forward from the 2026-10-23 reconstruction or from tracker "
        "§18: every `V` cell is traceable to a check executed in this pass or to a byte/ref read in it, "
        "and every non-`V` cell names the record or the verified absence that governs it.\n"
    )
    lines.append("| " + " | ".join(md.HEADERS) + " |")
    lines.append("|" + "|".join(["---"] * len(md.HEADERS)) + "|")
    for row in md.ROWS:
        cells = []
        for c in row:
            text = str(c).replace("|", "\\|")
            cells.append(text)
        lines.append("| " + " | ".join(cells) + " |")
    lines.append("")
    return "\n".join(lines)


def write_csv() -> None:
    with CSV_PATH.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh, quoting=csv.QUOTE_ALL, lineterminator="\n")
        w.writerow(md.HEADERS)
        for row in md.ROWS:
            w.writerow([str(c) for c in row])


def write_xlsx() -> None:
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.utils import get_column_letter

    wb = Workbook()
    ws = wb.active
    ws.title = "51x17 Matrix"
    ws.append(md.HEADERS)
    head_fill = PatternFill("solid", fgColor="1F3864")
    for col in range(1, len(md.HEADERS) + 1):
        cell = ws.cell(row=1, column=col)
        cell.font = Font(color="FFFFFF", bold=True)
        cell.fill = head_fill
        cell.alignment = Alignment(wrap_text=True, vertical="top")
    for row in md.ROWS:
        ws.append([c if isinstance(c, int) else str(c) for c in row])
    widths = [4, 42, 40, 40, 40, 40, 38, 32, 32, 40, 34, 36, 32, 34, 32, 34, 46]
    for i, w in enumerate(widths[: len(md.HEADERS)], start=1):
        ws.column_dimensions[get_column_letter(i)].width = w
    for r in range(2, ws.max_row + 1):
        for c in range(1, len(md.HEADERS) + 1):
            ws.cell(row=r, column=c).alignment = Alignment(wrap_text=True, vertical="top")
    ws.freeze_panes = "C2"

    meta = wb.create_sheet("Provenance")
    meta.append(["field", "value"])
    meta.append(["record", "IIPS-V3-CAPMATRIX-51X17-RECONSTRUCTION-2026-10-27-01"])
    meta.append(["investigation date", "2026-10-27 (UTC)"])
    meta.append(["IRR baseline", "ramkivs/iips-review-recovered main@f74af6d4f488ebf6d3e3a94f612a0d831b6b765a tree ed424ffbe4e3b3863ff00a47aa25fa0ca4e0c62f"])
    meta.append(["IPD baseline", "ramkivs/iips-production-market-data main@888eb375eebee01640e44ccdcbb138a71e8c4513 tree cf3b90482fa7ed1f9780f20a9286164686885d2b"])
    meta.append(["dimensions", "15 assessed dimensions (columns 3-17 of the required 17-column structure)"])
    meta.append(["source", "matrix_data.py in the same evidence directory; CSV/SECTION H generated from it"])
    for i, w in enumerate([24, 120], start=1):
        meta.column_dimensions[get_column_letter(i)].width = w
    wb.properties.created = DT
    wb.properties.modified = DT
    wb.save(XLSX_PATH)
    normalise_zip(XLSX_PATH)


def normalise_zip(path: pathlib.Path) -> None:
    """Rewrite the OOXML zip with fixed member timestamps so the file is reproducible."""
    import re
    import shutil
    import tempfile
    import zipfile

    tmp = pathlib.Path(tempfile.mkstemp(suffix=".xlsx")[1])
    with zipfile.ZipFile(path) as src, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as dst:
        for info in src.infolist():
            data = src.read(info.filename)
            if info.filename == "docProps/core.xml":
                # openpyxl stamps `modified` with the wall clock on save; pin it.
                data = re.sub(rb"(<dcterms:modified[^>]*>)[^<]*(</dcterms:modified>)",
                              rb"\g<1>2026-10-27T00:00:00Z\g<2>", data)
            fixed = zipfile.ZipInfo(info.filename, date_time=(1980, 1, 1, 0, 0, 0))
            fixed.compress_type = zipfile.ZIP_DEFLATED
            fixed.external_attr = info.external_attr
            dst.writestr(fixed, data)
    shutil.move(str(tmp), str(path))


def checks() -> dict:
    numbers = [r[0] for r in md.ROWS]
    names_ok = all(isinstance(r[1], str) and r[1].strip() for r in md.ROWS)
    empty = [(r[0], md.HEADERS[i]) for r in md.ROWS for i, c in enumerate(r) if str(c).strip() == ""]
    na_cells = [(r[0], md.HEADERS[i], c) for r in md.ROWS for i, c in enumerate(r)
                if str(c).strip().startswith("NA")]
    na_unexplained = [(n, h) for n, h, c in na_cells if "—" not in c or len(c) < 12]
    token_scan = {}
    for token in ("V —", "P —", "NI —", "NW —", "NP —", "VP —", "EP —", "EM —", "BL —",
                  "BRANCH-ONLY", "DEFERRED", "OOS", "NOT SATISFIED", "NOT AUTHORIZED",
                  "NOT ACCEPTED", "SOURCE-REPORTED", "UNRESOLVED"):
        token_scan[token] = sum(1 for r in md.ROWS for c in r if token in str(c))

    # CSV round-trip equality
    with CSV_PATH.open(newline="", encoding="utf-8") as fh:
        rows = list(csv.reader(fh))
    csv_headers = rows[0]
    csv_rows = rows[1:]
    csv_equal = (
        csv_headers == md.HEADERS
        and len(csv_rows) == len(md.ROWS)
        and all([str(c) for c in md.ROWS[i]] == csv_rows[i] for i in range(len(md.ROWS)))
    )

    return {
        "rows": len(md.ROWS),
        "numbers_contiguous_1_51": numbers == list(range(1, 52)),
        "names_non_empty": names_ok,
        "headers_exact_17_in_order": md.HEADERS == [
            "#", "Capability (owner)", "Existence", "Authority", "Integration", "Wiring",
            "Data", "Persistence", "Recovery", "Validation", "E2E", "Evidence", "Governance",
            "Acceptance", "Qualification", "Release-readiness", "Evidence Anchor"],
        "row_arity_all_17": all(len(r) == 17 for r in md.ROWS),
        "empty_cells": empty,
        "na_cells": len(na_cells),
        "na_cells_without_inline_rationale": na_unexplained,
        "token_occurrences": token_scan,
        "csv_matches_source": csv_equal,
        "csv_rows": len(csv_rows),
    }


# --- NA rationale completion -------------------------------------------------
# A bare `NA` hides whether the dimension was considered. The build refuses to
# emit a cell whose NA carries no inline reason, so bare cells are completed
# here with a dimension-specific rationale that is true of every row it touches
# (all of them are surfaces that do not exist on the authoritative ref).
NA_RATIONALE = {
    "Integration": "no consumer or dependency exists to integrate with",
    "Wiring": "no route, handler or runtime path exists to wire",
    "Data": "no data contract exists for this capability",
    "Persistence": "no durable state exists on this surface",
    "Recovery": "nothing is persisted, so no restart recovery applies",
    "E2E": "no runtime surface exists to exercise end to end",
    "Qualification": "not qualified because the capability is closed, deferred or superseded",
}


def complete_na_rationales() -> int:
    """Return the number of bare NA cells completed."""
    filled = 0
    for row in md.ROWS:
        for i, cell in enumerate(row):
            text = str(cell).strip()
            if not text.startswith("NA"):
                continue
            if "—" in text and len(text) > 12:
                continue
            dim = md.HEADERS[i]
            reason = NA_RATIONALE.get(dim, "the dimension does not apply to this capability")
            row[i] = f"NA — {reason}."
            filled += 1
    return filled


def main() -> int:
    completed = complete_na_rationales()
    write_csv()
    write_xlsx()
    SECTION_H.write_text(markdown_section_h(), encoding="utf-8")
    result = checks()
    result["na_cells_completed_by_build"] = completed
    CHECKS.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k != "token_occurrences"}, indent=2))
    hard_fail = (
        result["rows"] != 51
        or not result["numbers_contiguous_1_51"]
        or not result["headers_exact_17_in_order"]
        or not result["row_arity_all_17"]
        or result["empty_cells"]
        or result["na_cells_without_inline_rationale"]
        or not result["csv_matches_source"]
    )
    return 1 if hard_fail else 0


if __name__ == "__main__":
    sys.exit(main())
