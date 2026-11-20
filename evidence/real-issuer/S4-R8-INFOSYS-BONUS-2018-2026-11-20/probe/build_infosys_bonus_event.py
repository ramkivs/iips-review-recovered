#!/usr/bin/env python3
"""Build the S4-R8 Infosys bonus-event successor input from the operator-supplied event record.

No network. No historical bundle is written. The probe copies the O3-admitted Infosys
successor financial input (S4-R3-INFOSYS-REFRESH-2026-11-19) byte-for-byte and adds
exactly one canonical corporate-actions.json carrying the 2018 1:1 bonus event. The
adjustment factor is DERIVED FROM THE DECLARED TERMS, not guessed: 1 new share for
every 1 existing share doubles the share count (verified against the supplied
pre/post counts), so a pre-action per-share value converts to post-action terms by
factor pre/post = 0.5. Only the canonical effectiveDate is transcribed; announcement,
approval, ex and record dates remain in the source evidence (the schema has no fields
for them and none were invented). Run from any directory:

    python3 evidence/real-issuer/S4-R8-INFOSYS-BONUS-2018-2026-11-20/probe/build_infosys_bonus_event.py

The generated files are committed; this script is the reproducible transcription probe,
not a runtime dependency. Re-running it must reproduce the committed input byte-for-byte
(verified by the bundle digests).
"""
from __future__ import annotations

import json
from pathlib import Path

BUNDLE = Path(__file__).resolve().parents[1]
ROOT = Path(__file__).resolve().parents[4]
REAL = ROOT / "evidence" / "real-issuer"
PRIOR = REAL / "S4-R3-INFOSYS-REFRESH-2026-11-19" / "ingest-input" / "infosys"
SOURCE = BUNDLE / "source" / "operator-supplied-event-2026-11-20.json"
INPUT = BUNDLE / "ingest-input" / "infosys"

RECORD = {
    "corporateActions": [
        {
            "actionId": "CA-INFY-BONUS-2018-09-06",
            "type": "BONUS",
            "effectiveDate": "2018-09-06",
            "subjectIssuerId": "IN:CIN:L85110KA1981PLC013115",
            "subjectSecurityId": "IN:ISIN:INE009A01021",
            "perShareComparable": False,
            "adjustmentFactor": 0.5,
            "factorBasis": (
                "1:1 bonus issue: 1 new fully paid-up equity share (face value INR 5, unchanged) for every 1 "
                "existing share held on record date 2018-09-05; issued shares 2,184,127,091 -> 4,368,254,182 "
                "(exactly 2x), so pre-action per-share values convert to post-action terms by factor 0.5"
            ),
            "successors": [],
            "sourceRef": (
                "NSE record-date intimation filed 2018-08-24 (board approval 2018-07-13; ex-date 2018-09-04; "
                "record date 2018-09-05); operator-supplied event record preserved at "
                "evidence/real-issuer/S4-R8-INFOSYS-BONUS-2018-2026-11-20/source/operator-supplied-event-2026-11-20.json"
            ),
        }
    ]
}


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    event = source["event"]
    assert event["post_event_shares"] == 2 * event["pre_event_shares"], "share count must exactly double for 1:1"
    assert event["pre_event_shares"] * 5 == event["pre_event_paid_up_capital_inr"]
    assert event["post_event_shares"] * 5 == event["post_event_paid_up_capital_inr"]

    INPUT.mkdir(parents=True, exist_ok=True)
    (INPUT / "periods.csv").write_bytes((PRIOR / "periods.csv").read_bytes())
    (INPUT / "roster.json").write_bytes((PRIOR / "roster.json").read_bytes())
    (INPUT / "corporate-actions.json").write_text(json.dumps(RECORD, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {INPUT} (periods.csv + roster.json byte-identical copies; corporate-actions.json: 1 BONUS record, factor 0.5)")


if __name__ == "__main__":
    main()
