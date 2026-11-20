#!/usr/bin/env python3
"""Build the additive S4-R3 Infosys successor input from the operator-supplied payload.

No network. No historical bundle is written. The probe preserves every historical
REL-1 Infosys CSV row byte-for-byte, copies the admitted roster byte-for-byte, and
appends exactly two ANNUAL rows (FY2025, FY2026) built only from the fields the
operator-supplied payload carries. Payload fields with no CSV column (notably
operating_profit_ebit) are NOT ingested. CSV columns the payload does not supply
are left blank, which the ingestion contract records as NOT_REPORTED; no value is
invented, interpolated or carried forward. Run from any directory:

    python3 evidence/real-issuer/S4-R3-INFOSYS-REFRESH-2026-11-19/probe/build_infosys_refresh.py

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
REL1 = REAL / "REL-1-INFOSYS-2026-11-06" / "ingest-input"
SOURCE = BUNDLE / "source" / "operator-supplied-payload-2026-11-19.json"
INPUT = BUNDLE / "ingest-input" / "infosys"
ISSUER_ID = "IN:CIN:L85110KA1981PLC013115"

# Exact payload -> CSV column mapping. FY2024 baseline alignment (verified against
# the committed REL-1 row before any new row was written): the committed row maps
# NET_PROFIT = 26248 (total PAT including NCI) and carries the owners' share in
# NET_PROFIT_ATTRIBUTABLE_TO_OWNERS = 26233. The same mapping is applied here:
# total_pat -> NET_PROFIT, profit_attributable_to_owners ->
# NET_PROFIT_ATTRIBUTABLE_TO_OWNERS. Nothing is remapped.
INCOME_MAP = {
    "revenue_from_operations": "REVENUE_FROM_OPERATIONS",
    "other_income_net": "OTHER_INCOME",
    "total_income": "TOTAL_INCOME",
    "finance_cost": "FINANCE_COSTS",
    "profit_before_tax": "PROFIT_BEFORE_TAX",
    "total_tax_expense": "TAX_EXPENSE",
    "total_pat": "NET_PROFIT",
    "profit_attributable_to_owners": "NET_PROFIT_ATTRIBUTABLE_TO_OWNERS",
    "basic_eps_inr": "EPS_BASIC",
    "diluted_eps_inr": "EPS_DILUTED",
}
BALANCE_MAP = {
    "equity_attributable_to_owners": "EQUITY_ATTRIBUTABLE_TO_OWNERS",
    "non_controlling_interests": "NON_CONTROLLING_INTEREST",
    "total_equity": "TOTAL_EQUITY",
    "total_assets": "TOTAL_ASSETS",
}
FILING_REFS = {"FY2025": "INFY-INDAS-CONSOL-FY25", "FY2026": "INFY-INDAS-CONSOL-FY26"}


def fmt(value: object) -> str:
    if isinstance(value, float) and value == int(value):
        return str(int(value))
    return str(value)


def main() -> None:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    historical_text = (REL1 / "periods.csv").read_text(encoding="utf-8")
    header = next(csv.reader(io.StringIO(historical_text)))

    rows: list[dict[str, str]] = []
    for filing in payload["filings_to_ingest"]:
        row = {column: "" for column in header}
        row.update({
            "issuer_id": ISSUER_ID,
            "period_type": filing["period_type"],
            "fiscal_year": filing["fiscal_year"].removeprefix("FY"),
            "period_start": filing["period_start"],
            "period_end": filing["period_end"],
            "statement_scope": "CONSOLIDATED",
            "taxonomy": "INDAS",
            "basis": "AS_FILED",
            "filing_ref": FILING_REFS[filing["fiscal_year"]],
            "filed_at": filing["filing_date"],
            "source_scale": "CRORE",
        })
        for payload_key, column in INCOME_MAP.items():
            row[column] = fmt(filing["income_statement"][payload_key])
        for payload_key, column in BALANCE_MAP.items():
            row[column] = fmt(filing["balance_sheet"][payload_key])
        rows.append(row)

    out = io.StringIO()
    out.write(historical_text if historical_text.endswith("\n") else historical_text + "\n")
    writer = csv.DictWriter(out, fieldnames=header, lineterminator="\n")
    for row in rows:
        writer.writerow(row)

    INPUT.mkdir(parents=True, exist_ok=True)
    (INPUT / "periods.csv").write_text(out.getvalue(), encoding="utf-8")
    (INPUT / "roster.json").write_bytes((REL1 / "roster.json").read_bytes())
    print(f"wrote {INPUT / 'periods.csv'} ({len(rows)} new rows) and roster.json (byte-identical copy)")


if __name__ == "__main__":
    main()
