#!/usr/bin/env python3
"""`L-038` residual investigation — the preference-capital re-read, restricted to committed evidence.

The register's `L-038` entry already records the completed search (`runs/`…, `source/caption-search-log.txt`:
`preference\\s+share` occurs on four pages across 483 searched pages, every hit the same authorised-capital table).
This script does **not** re-run that search. It re-reads the two things a nil declaration could rest on — the one
extracted share-capital page and the two governed precedents for how such wording is treated — and prints exactly
what they say, so the determination can be checked without re-deriving it.

Run from the repository root:  python3 evidence/real-issuer/WI7-L038-RESIDUAL-2026-11-08/probe/preference-re-read.py
"""
from __future__ import annotations

import hashlib
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[4]
WI7 = ROOT / "evidence/real-issuer/WI7-L038-DEBT-COMPLETENESS-2026-11-07"
WI5 = ROOT / "evidence/real-issuer/WI5-PREFERENCE-CAPITAL-2026-11-07"
WI10 = ROOT / "evidence/real-issuer/WI10-L035-NIL-BINDING-2026-11-08".replace("11-08", "11-07")


def sha(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    page = WI7 / "source/fy24-note-12a-authorised-and-issued-share-capital-pdf-page189.txt"
    log = WI7 / "source/caption-search-log.txt"
    print("# L-038 residual — preference capital: what the committed evidence actually says")
    print()

    print("## 1. The one extracted share-capital page (FY2023-24 report, PDF p.189)")
    print(f"   {page.relative_to(ROOT)}  sha256={sha(page)}")
    print("   The sheet carries two printed pages side by side; only the LEFT column is quoted below, cell by cell.")
    import re
    text = page.read_text(encoding="utf-8").split("\n")
    markers = {
        "Preference shares of H 10/- each": "the preference class, authorised only",
        "equity shares of H 1/- each fully paid-up": "the issued table: equity shares only",
        "The authorised share capital of the Company comprises": "the rights paragraph's enumeration",
    }
    for marker, label in markers.items():
        for i, line in enumerate(text, 1):
            if marker in line:
                cells = re.sub(r"\s{2,}", " │ ", line[:145].strip())  # 145 < the right-hand column, which starts at col 148
                print(f"   line {i:4} ({label}):")
                print(f"              {cells[:165]}")
                break
    print("   -- reading: a preference class exists ONLY in I Authorised share capital (7 crore shares, ₹65 crore);")
    print("      II Issued, subscribed and paid-up lists equity shares only and totals 129 / 129; the")
    print("      'Rights, preferences and restrictions' paragraph enumerates 150 crore equity ₹1 + 8 crore equity ₹10")
    print("      and does not mention the preference class the table above it prints.")
    print()

    print("## 2. The completed caption search (WI-7 bundle), not re-run here")
    print(f"   {log.relative_to(ROOT)}  sha256={sha(log)}")
    for line in log.read_text(encoding="utf-8").split("\n"):
        low = line.lower()
        if "preference" in low and ("occurs on" in low or "preference row" in low or "stays not_reported" in low or "preference_capital therefore" in low):
            print(f"   {line.strip()[:170]}")
    hits = [l for l in log.read_text(encoding="utf-8").split("\n") if "preference=" in l and l.strip().startswith("fy2")]
    print(f"   pages carrying the caption: {', '.join(h.split(':')[0].strip() for h in hits)}")
    print()

    print("## 3. Precedent A — WI-5 withdrew exactly this kind of inference (eClerx)")
    wi5 = WI5 / "README.md"
    print(f"   {wi5.relative_to(ROOT)}  sha256={sha(wi5)}")
    for line in wi5.read_text(encoding="utf-8").split("\n")[:14]:
        if line.strip():
            print(f"   {line.strip()[:168]}")
    print()

    print("## 4. Precedent B — the L-035 review record accepted a nil only where wording declared one (Infosys)")
    record = WI10 / "source/review-record.json"
    print(f"   {record.relative_to(ROOT)}  sha256={sha(record)}")
    data = json.loads(record.read_text(encoding="utf-8"))
    for dec in data["declarations"]:
        if dec["lineItemId"] == "PREFERENCE_CAPITAL":
            print(f"   quoted wording : {dec['quotedWording']}")
            print(f"   binding        : {dec['binding']['section']}/{dec['binding']['class']}/{dec['binding']['scope']}"
                  f" acceptedBy={dec['binding'].get('acknowledgedBy','-')}")
            print(f"   acceptance     : {dec['acceptance'][:300]}")
    print()
    print("## Conclusion carried into determination-l038-residual.json")
    print("   Marico's page has no sentence of the accepted shape: no 'one class of shares' declaration, no issued")
    print("   preference row, no dash, no wording declaring the class nil. The authorised-capital row is the opposite")
    print("   of a nil, and an enumeration that omits a class the same note prints cannot be read as declaring it nil.")
    print("   PREFERENCE_CAPITAL stays MISSING / NOT_REPORTED.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
