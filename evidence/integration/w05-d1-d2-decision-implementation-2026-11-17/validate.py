#!/usr/bin/env python3
"""Offline consistency checks for the W05 D1/D2 decision implementation record."""
from __future__ import annotations

import csv
import hashlib
import io
import json
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = Path(__file__).resolve().parent
SOURCE_COMMIT = "da5e40c0f1b43bac774905eb9db36a9f4ce79045"
SOURCE_PATH = "evidence/real-issuer/AGI/INE415A01038/INE415A01038.zip"
ZIP_SHA256 = "05be52759ca5484fc49de2207ae8f90b7f0f1334bef7f6af20daa6ecd679fc32"
DOC = ROOT / "docs/integration/W05-D1-D2-DECISION-IMPLEMENTATION-REGISTER-2026-11-17.md"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> int:
    archive = subprocess.run(
        ["git", "show", f"{SOURCE_COMMIT}:{SOURCE_PATH}"],
        cwd=ROOT, check=True, stdout=subprocess.PIPE,
    ).stdout
    check(hashlib.sha256(archive).hexdigest() == ZIP_SHA256, "source ZIP digest mismatch")
    rows = list(csv.DictReader((EVIDENCE / "agi-source-package-inventory.tsv").open(), delimiter="\t"))
    check(len(rows) == 5, "expected exactly five AGI PDFs in the metadata inventory")
    with zipfile.ZipFile(io.BytesIO(archive)) as zf:
        files = [i for i in zf.infolist() if not i.is_dir()]
        check(len(files) == 5, "source ZIP must contain exactly five files")
        zip_by_name = {i.filename.rsplit("/", 1)[-1]: i for i in files}
        check(set(zip_by_name) == {r["document"] for r in rows}, "ZIP member names differ from inventory")
        for row in rows:
            member = zip_by_name[row["document"]]
            data = zf.read(member)
            check(len(data) == int(row["bytes"]), f"byte length mismatch: {row['document']}")
            check(hashlib.sha256(data).hexdigest() == row["sha256"], f"SHA-256 mismatch: {row['document']}")
            check(row["source_locator_recorded_in_zip"] == "NO", "do not imply original locator is in the ZIP")
            check(row["retrieval_date_or_channel_recorded_in_zip"] == "NO", "do not imply retrieval provenance is in the ZIP")
        names = {i.filename.rsplit("/", 1)[-1] for i in files}
        check(not any(n.lower().endswith((".json", ".csv", ".txt", ".md")) for n in names), "unexpected metadata/text member appeared")

    doc = DOC.read_text()
    tracker = TRACKER.read_text()
    check("**D1 — issuer filing source**" in doc and "**CONFIRMED; implementation rule recorded**" in doc and "manual" in doc.lower(), "D1 manual source decision absent")
    check("D2" in doc and "private" in doc.lower(), "D2 private decision absent")
    check("official exchange or issuer sources" in doc, "D1 source category not explicit")
    check("No scripted or automated retrieval" in doc, "automated retrieval boundary absent")
    check("§16.292" in tracker and "CV-CORR-257" in tracker, "tracker section or CV identifier missing")
    check("CHG-2026-11-06-20" in tracker and "V2156" in tracker, "tracker CHG/V identifiers missing")
    check("Next free §16.293 / `CV-CORR-258` / `CHG-2026-11-06-21` / `V2161`" in tracker, "next identifier declaration missing")
    check("W05: **IN PROGRESS — NOT COMPLETE — NOT ACCEPTED**" in doc, "W05 state not preserved")
    check("`L-041`: **OPEN**; `L-042`: **OPEN**." in doc and "Q1–Q7: **OPEN**." in doc, "limitation/question states not preserved")
    check("AGI is **not admitted**" in doc, "no-new-issuer boundary absent")
    print("PASS: source ZIP, five PDF hashes, source-metadata caveat, D1/D2 wording, tracker IDs and protected statuses")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, OSError, subprocess.CalledProcessError, zipfile.BadZipFile) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
