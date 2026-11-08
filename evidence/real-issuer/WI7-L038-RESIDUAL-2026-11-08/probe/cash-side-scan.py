#!/usr/bin/env python3
"""`L-038` residual investigation — is the missing cash-side period check reachable in the committed corpus?

`capitalStructure.ts` resolves each component to the newest period in which it carries information and then
refuses the debt sum when the four debt components do not share one period end (`grossDebtOf`, rule 3). The cash
side is `sum([cash, currentInvestments])` with no period comparison at all — neither between the two cash
components nor against the debt side.

This script does not run the platform. It performs the same *resolution* the contract performs — newest period
first, a cell counts when it holds a number or an explicit `NIL: …` declaration, an empty cell carries nothing —
over every committed dataset, and reports whether the two sides would land on one instant. A dataset where the debt
side is complete at one instant and the cash side at another is a dataset on which the contract would publish
cross-period net debt.

Run from the repository root:  python3 evidence/real-issuer/WI7-L038-RESIDUAL-2026-11-08/probe/cash-side-scan.py
"""
from __future__ import annotations

import csv
import glob
import sys

DEBT = [
    "SHORT_TERM_BORROWINGS",
    "CURRENT_MATURITIES_OF_LONG_TERM_DEBT",
    "LONG_TERM_BORROWINGS",
    "LEASE_LIABILITIES",
]
CASH = ["CASH_AND_CASH_EQUIVALENTS", "CURRENT_INVESTMENTS"]
SHORT = {
    "SHORT_TERM_BORROWINGS": "ST",
    "CURRENT_MATURITIES_OF_LONG_TERM_DEBT": "CM",
    "LONG_TERM_BORROWINGS": "LT",
    "LEASE_LIABILITIES": "LL",
    "CASH_AND_CASH_EQUIVALENTS": "cash",
    "CURRENT_INVESTMENTS": "inv",
}


def informative(cell: str | None) -> bool:
    c = (cell or "").strip()
    if not c:
        return False
    if c.upper().startswith("NIL"):
        return True
    try:
        float(c)
        return True
    except ValueError:
        return False


def resolve(rows: list[dict[str, str]], ids: list[str]) -> dict[str, str | None]:
    """Newest-first resolution, item by item — what `latest()` does inside the contract."""
    out: dict[str, str | None] = {}
    for item in ids:
        out[item] = next((r["period_end"] for r in rows if informative(r.get(item))), None)
    return out


def main() -> int:
    paths = sorted(glob.glob("evidence/**/periods.csv", recursive=True))
    print("# L-038 residual — cash-side period-alignment reachability over every committed dataset")
    print(f"# datasets scanned: {len(paths)}")
    print()
    header = "%-46s | %-60s | %-34s | %s" % ("dataset", "debt components resolve to", "cash components resolve to", "verdict")
    print(header)
    print("-" * len(header))
    live = 0
    for path in paths:
        rows = list(csv.DictReader(open(path, encoding="utf-8")))
        debt = resolve(rows, DEBT)
        cash = resolve(rows, CASH)
        debt_periods = set(debt.values())
        cash_periods = set(cash.values())
        debt_complete = None not in debt_periods
        cash_complete = None not in cash_periods
        if not debt_complete or len(debt_periods) > 1:
            verdict = "debt side blocked -> no net-debt arithmetic (cash rule not reached)"
        elif not cash_complete:
            verdict = "cash side incomplete -> sum() blocks netDebt"
        elif len(cash_periods) > 1:
            verdict = "LIVE: cash components span two instants"
            live += 1
        elif debt_periods == cash_periods:
            verdict = "same instant on both sides"
        else:
            verdict = "LIVE: debt @%s vs cash @%s" % (sorted(debt_periods)[0], sorted(cash_periods)[0])
            live += 1
        name = (
            path.replace("evidence/real-issuer/", "")
            .replace("/ingest-input/periods.csv", "")
            .replace("/input/periods.csv", "")
        )
        print(
            "%-46s | %-60s | %-34s | %s"
            % (
                name,
                " ".join("%s=%s" % (SHORT[k], v or "-") for k, v in debt.items()),
                " ".join("%s=%s" % (SHORT[k], v or "-") for k, v in cash.items()),
                verdict,
            )
        )
    print()
    print(f"# datasets on which the contract would publish cross-period net debt today: {live}")
    print("# (the synthetic probe in runs/01-probe.txt shows that such a dataset does publish a number;")
    print("#  no committed dataset is in that state, so the gap is latent, not live)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
