#!/usr/bin/env python3
"""Build the additive S4-R3 Marico quarterly successor input from the operator-supplied payload.

No network. No historical bundle is written. The probe preserves every historical
Marico successor CSV cell under its issuer_id/period_end key (the FY2022-FY2026
annual rows gain only the two additive quarter_form/quarter_index columns, blank on
annual rows — the same additive-column pattern the KEC successor used), copies the
admitted roster byte-for-byte, and appends exactly two QUARTER rows (Q1 FY2027 then
Q2 FY2027, quarter_form DISCRETE, quarter_index 1 and 2) built only from the fields
the operator-supplied payload carries. The payload's period_type label "QUARTERLY"
is mapped to the contract token QUARTER. Payload fields with no CSV column
(operating_ebitda, margins) are NOT ingested. Columns the payload does not supply
are left blank (NOT_REPORTED at ingestion); nothing is invented or carried forward.
Run from any directory:

    python3 evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/probe/build_marico_quarterly_refresh.py

The generated CSV/JSON files are committed; this script is the reproducible
transcription probe, not a runtime dependency. Re-running it must reproduce the
committed successor input byte-for-byte (verified by the bundle digests).
"""
from __future__ import annotations

import csv
import io
import json
from pathlib import Path

BUNDLE = Path(__file__).resolve().parents[1]
ROOT = Path(__file__).resolve().parents[4]
REAL = ROOT / "evidence" / "real-issuer"
PRIOR = REAL / "S4-R3-FILING-REFRESH-2026-11-14" / "ingest-input" / "marico"
SOURCE = BUNDLE / "source" / "operator-supplied-payload-2026-11-19.json"
INPUT = BUNDLE / "ingest-input" / "marico"
ISSUER_ID = "IN:CIN:L15140MH1988PLC049208"

# Exact payload -> CSV column mapping. FY2026 annual alignment (verified against the
# committed successor row before any new row was written): the committed row maps
# NET_PROFIT = 1813 (total PAT including NCI; PBT 2277 - tax 464 = 1813) and carries
# the owners' share in NET_PROFIT_ATTRIBUTABLE_TO_OWNERS = 1762. The same mapping is
# applied here: total_pat -> NET_PROFIT (Q1 652, Q2 558),
# profit_attributable_to_owners -> NET_PROFIT_ATTRIBUTABLE_TO_OWNERS (Q1 630, Q2 550).
INCOME_MAP = {
    "revenue_from_operations": "REVENUE_FROM_OPERATIONS",
    "other_income": "OTHER_INCOME",
    "total_income": "TOTAL_INCOME",
    "total_pat": "NET_PROFIT",
    "profit_attributable_to_owners": "NET_PROFIT_ATTRIBUTABLE_TO_OWNERS",
    "basic_eps_inr": "EPS_BASIC",
}
FILING_REFS = {"Q1": "MARICO-INDAS-CONSOL-Q1-FY27-RESULTS", "Q2": "MARICO-INDAS-CONSOL-Q2-FY27-RESULTS"}


def fmt(value: object) -> str:
    if isinstance(value, float) and value == int(value):
        return str(int(value))
    return str(value)


def main() -> None:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    prior_text = (PRIOR / "periods.csv").read_text(encoding="utf-8")
    prior_rows = list(csv.reader(io.StringIO(prior_text)))
    header = prior_rows[0] + ["quarter_form", "quarter_index"]

    out = io.StringIO()
    writer = csv.writer(out, lineterminator="\n")
    writer.writerow(header)
    for row in prior_rows[1:]:
        writer.writerow(row + ["", ""])

    for filing in payload["quarterly_filings_to_ingest"]:
        row = {column: "" for column in header}
        row.update({
            "issuer_id": ISSUER_ID,
            "period_type": "QUARTER",
            "fiscal_year": filing["fiscal_year"].removeprefix("FY"),
            "period_start": filing["period_start"],
            "period_end": filing["period_end"],
            "statement_scope": "CONSOLIDATED",
            "taxonomy": "INDAS",
            "basis": "AS_FILED",
            "filing_ref": FILING_REFS[filing["fiscal_quarter"]],
            "filed_at": filing["filing_date"],
            "source_scale": "CRORE",
            "quarter_form": "DISCRETE",
            "quarter_index": filing["fiscal_quarter"].removeprefix("Q"),
        })
        for payload_key, column in INCOME_MAP.items():
            row[column] = fmt(filing["income_statement"][payload_key])
        writer.writerow([row[column] for column in header])

    INPUT.mkdir(parents=True, exist_ok=True)
    (INPUT / "periods.csv").write_text(out.getvalue(), encoding="utf-8")
    (INPUT / "roster.json").write_bytes((PRIOR / "roster.json").read_bytes())
    print(f"wrote {INPUT / 'periods.csv'} (2 new QUARTER rows) and roster.json (byte-identical copy)")


if __name__ == "__main__":
    main()
