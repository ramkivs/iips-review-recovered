#!/usr/bin/env python3
"""Build the L-031 Infosys window-coverage successor input from the operator-declared window table.

No network. No historical bundle is written. The probe copies the S4-R8 bonus-event
Infosys input byte-for-byte (including its admitted 2018 BONUS record, preserved
unchanged) and appends exactly one further canonical record: the 2025 tender-offer
buyback (BUYBACK_TENDER, effective on extinguishment 2025-12-04, perShareComparable
true, factor 1 — a tender buyback makes no per-share restatement, mirroring the
existing canonical fixture semantics). The six cash dividends in the declared table
are NOT transcribed: DIVIDEND is not a canonical CorporateActionType and cash
dividends alter neither per-share nominal value nor share count; they remain
documented in the source evidence only, with no schema extension. ESOP/RSU
allotments are likewise documented, not transcribed. The explicit nil declaration
for share-multiplying events in the window is preserved in the source artifact.
Run from any directory:

    python3 evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20/probe/build_window_coverage.py

The generated files are committed; this script is the reproducible transcription
probe, not a runtime dependency. Re-running it must reproduce the committed input
byte-for-byte (verified by the bundle digests).
"""
from __future__ import annotations

import json
from pathlib import Path

BUNDLE = Path(__file__).resolve().parents[1]
ROOT = Path(__file__).resolve().parents[4]
REAL = ROOT / "evidence" / "real-issuer"
PRIOR = REAL / "S4-R8-INFOSYS-BONUS-2018-2026-11-20" / "ingest-input" / "infosys"
SOURCE = BUNDLE / "source" / "operator-declared-window-table-2026-11-20.json"
INPUT = BUNDLE / "ingest-input" / "infosys"

BUYBACK = {
    "actionId": "CA-INFY-BUYBACK-TENDER-2025-12-04",
    "type": "BUYBACK_TENDER",
    "effectiveDate": "2025-12-04",
    "subjectIssuerId": "IN:CIN:L85110KA1981PLC013115",
    "subjectSecurityId": "IN:ISIN:INE009A01021",
    "perShareComparable": True,
    "adjustmentFactor": 1,
    "factorBasis": (
        "Tender-offer buyback: 100,000,000 equity shares repurchased at INR 1,800/share (INR 18,000 crore) "
        "and extinguished 2025-12-04 (record date 2025-11-14); no per-share restatement — historical per-share "
        "values stand as filed, so the factor is 1"
    ),
    "successors": [],
    "sourceRef": (
        "SEBI post-buyback public announcement (board approval 2025-09-11; public announcement 2025-11-13; "
        "extinguishment 2025-12-04); operator-declared window table preserved at "
        "evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20/source/operator-declared-window-table-2026-11-20.json"
    ),
}


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    buyback = next(e for e in source["events"] if "Buyback" in e["action_type"])
    bridge = buyback["share_count_bridge"]
    assert bridge["shares_at_record_date_2025-11-14"] - bridge["shares_extinguished"] + bridge["rsu_shares_allotted_2025-11-20"] == bridge["shares_post_extinguishment"], "share-count bridge must reconcile"
    assert bridge["shares_extinguished"] * 1800 == 18_000 * 10_000_000, "buyback consideration must equal INR 18,000 Cr"

    prior = json.loads((PRIOR / "corporate-actions.json").read_text(encoding="utf-8"))
    actions = prior["corporateActions"] + [BUYBACK]

    INPUT.mkdir(parents=True, exist_ok=True)
    (INPUT / "periods.csv").write_bytes((PRIOR / "periods.csv").read_bytes())
    (INPUT / "roster.json").write_bytes((PRIOR / "roster.json").read_bytes())
    (INPUT / "corporate-actions.json").write_text(json.dumps({"corporateActions": actions}, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {INPUT} (financial bytes byte-identical; corporate-actions.json: {len(actions)} records: 2018 BONUS preserved + 2025 BUYBACK_TENDER)")


if __name__ == "__main__":
    main()
