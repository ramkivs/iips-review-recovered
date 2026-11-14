#!/usr/bin/env python3
"""Build the additive S4-R3 candidate inputs from committed evidence only.

No network. No historical bundle is written. The script copies the admitted rosters,
retains the admitted historical periods, and adds only the filings whose bytes or
verbatim page extracts are already committed. Run from any directory:

    python3 evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/probe/build_refresh.py

The generated CSV/JSON files are committed; this script is the reproducible transcription
probe, not a runtime dependency.
"""
from __future__ import annotations

import csv
import gzip
import hashlib
import io
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

BUNDLE = Path(__file__).resolve().parents[1]
ROOT = Path(__file__).resolve().parents[4]
REAL = ROOT / "evidence" / "real-issuer"
L038 = REAL / "WI12-L038-PREFERENCE-CAPITAL-2026-11-08"
L039 = REAL / "WI12-L039-CURRENT-INVESTMENTS-2026-11-05"
WI7 = REAL / "WI7-CONSUMER-MARICO-2026-11-07"
WI8 = REAL / "WI8-INDUSTRIALS-KEC-2026-11-07"
SOURCE = BUNDLE / "source"
INPUT = BUNDLE / "ingest-input"
MARICO_ID = "IN:CIN:L15140MH1988PLC049208"
KEC_ID = "IN:CIN:L45200MH2005PLC152061"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def flat(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def block(report: Path, begin: str, end: str) -> str:
    text = report.read_text(encoding="utf-8")
    start = text.index(begin) + len(begin)
    stop = text.index(end, start)
    return text[start:stop]


def write_extract(name: str, report: Path, begin: str, end: str, description: str) -> dict:
    body = block(report, begin, end)
    rel = report.relative_to(ROOT).as_posix()
    header = (
        f"# {description}\n"
        f"# Verbatim excerpt from committed report: {rel}\n"
        f"# Committed report sha256: {sha256(report.read_bytes())}\n"
        f"# Block: {begin.strip()} ... {end.strip()}\n"
        "# This file is an excerpt of committed evidence, not a new PDF fetch.\n"
    )
    path = SOURCE / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(header + body, encoding="utf-8")
    return {
        "file": f"source/{name}",
        "sha256": sha256(path.read_bytes()),
        "bytes": path.stat().st_size,
        "originReport": rel,
        "originReportSha256": sha256(report.read_bytes()),
        "beginMarker": begin,
        "endMarker": end,
    }


def item(value: str, printed: str | list[str], locator: str, basis: str = "REPORTED", note: str | None = None) -> dict:
    out = {"value": value, "printed": printed, "locator": locator, "basis": basis}
    if note:
        out["note"] = note
    return out


def assert_printed(period: dict, page_texts: dict[str, str]) -> None:
    for line_item, entry in period["items"].items():
        printed = entry["printed"]
        forms = printed if isinstance(printed, list) else [printed]
        locator = entry["locator"]
        if locator.startswith("kec-q2-xbrl#"):
            continue  # XBRL locator; checked against the fact JSON instead.
        file_names = [part.split("#", 1)[0] for part in locator.split("+")]
        haystack = flat(" ".join(page_texts[name] for name in file_names if name in page_texts))
        for form in forms:
            if flat(form) not in haystack:
                raise AssertionError(f"{period['periodEnd']} {line_item}: printed form not found: {form!r}")


def csv_text(header: list[str], rows: list[dict[str, str]]) -> str:
    buf = io.StringIO(newline="")
    writer = csv.DictWriter(buf, fieldnames=header, lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return buf.getvalue()


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return list(reader.fieldnames or []), list(reader)


def main() -> None:
    SOURCE.mkdir(parents=True, exist_ok=True)
    INPUT.mkdir(parents=True, exist_ok=True)
    fy25_report = L038 / "runs" / "02-fy2425-locator-report.txt"
    fy26_report = L038 / "runs" / "03-fy2526-locator-report.txt"
    kec_report = L039 / "runs" / "decisive-report.txt"

    page_map = {}
    page_map["marico-fy25-bs-pnl"] = write_extract(
        "marico-fy25-consolidated-bs-pnl-pdf-page170.txt", fy25_report,
        "=== BEGIN PAGE 170 of /tmp/ar25.pdf ===", "=== END PAGE 170 of /tmp/ar25.pdf ===",
        "Marico FY2025 consolidated balance sheet and profit and loss, PDF page 170")
    page_map["marico-fy25-cf"] = write_extract(
        "marico-fy25-consolidated-cash-flow-pdf-page172.txt", fy25_report,
        "=== BEGIN PAGE 172 of /tmp/ar25.pdf ===", "=== END PAGE 172 of /tmp/ar25.pdf ===",
        "Marico FY2025 consolidated cash flow, PDF page 172")
    page_map["marico-fy26-bs-pnl"] = write_extract(
        "marico-fy26-consolidated-bs-pnl-pdf-page190.txt", fy26_report,
        "=== BEGIN FY26 PAGE 190 ===", "=== END FY26 PAGE 190 ===",
        "Marico FY2026 consolidated balance sheet and profit and loss, PDF page 190")
    page_map["marico-fy26-cf"] = write_extract(
        "marico-fy26-consolidated-cash-flow-pdf-page192.txt", fy26_report,
        "=== BEGIN FY26 PAGE 192 ===", "=== END FY26 PAGE 192 ===",
        "Marico FY2026 consolidated cash flow, PDF page 192")
    page_map["kec-q1-pnl"] = write_extract(
        "kec-q1-fy27-consolidated-pnl-pdf-page6.txt", kec_report,
        "=== q1fy27 PAGE 6 (verbatim) ===", "=== END q1fy27 PAGE 6 ===",
        "KEC Q1 FY27 consolidated unaudited profit and loss, PDF page 6")
    page_map["kec-q2-bs"] = write_extract(
        "kec-q2-fy27-consolidated-balance-sheet-pdf-page7.txt", kec_report,
        "=== q2fy27-outcome PAGE 7 (verbatim) ===", "=== END q2fy27-outcome PAGE 7 ===",
        "KEC Q2 FY27 consolidated unaudited balance sheet, PDF page 7")
    (SOURCE / "page-map.json").write_text(json.dumps(page_map, indent=2) + "\n", encoding="utf-8")

    page_texts = {
        "marico-fy25-bs-pnl": (SOURCE / "marico-fy25-consolidated-bs-pnl-pdf-page170.txt").read_text(),
        "marico-fy25-cf": (SOURCE / "marico-fy25-consolidated-cash-flow-pdf-page172.txt").read_text(),
        "marico-fy26-bs-pnl": (SOURCE / "marico-fy26-consolidated-bs-pnl-pdf-page190.txt").read_text(),
        "marico-fy26-cf": (SOURCE / "marico-fy26-consolidated-cash-flow-pdf-page192.txt").read_text(),
        "kec-q1-pnl": (SOURCE / "kec-q1-fy27-consolidated-pnl-pdf-page6.txt").read_text(),
        "kec-q2-bs": (SOURCE / "kec-q2-fy27-consolidated-balance-sheet-pdf-page7.txt").read_text(),
    }

    # ---- KEC September XBRL: selected raw facts, never the refused machine zero ----
    xbrl_gz = L039 / "source" / "september-consolidated-xbrl.gz"
    compressed = xbrl_gz.read_bytes()
    raw = gzip.decompress(compressed)
    root = ET.fromstring(raw)
    xns = {"x": "http://www.xbrl.org/2003/instance"}
    contexts = []
    for ctx in root.findall("x:context", xns):
        cid = ctx.attrib.get("id")
        if cid not in {"OneD", "OneI", "FourD"}:
            continue
        period = ctx.find("x:period", xns)
        contexts.append({
            "id": cid,
            "startDate": period.findtext("x:startDate", namespaces=xns),
            "endDate": period.findtext("x:endDate", namespaces=xns),
            "instant": period.findtext("x:instant", namespaces=xns),
        })
    units = {}
    for unit in root.findall("x:unit", xns):
        units[unit.attrib.get("id")] = [m.text for m in unit.findall("x:measure", xns)]
    selected_names = set("""
RevenueFromOperations OtherIncome Income EmployeeBenefitExpense OtherExpenses FinanceCosts
DepreciationDepletionAndAmortisationExpense Expenses ProfitBeforeExceptionalItemsAndTax
ExceptionalItemsBeforeTax ProfitBeforeTax CurrentTax DeferredTax TaxExpense ProfitLossForPeriod
BasicEarningsLossPerShareFromContinuingAndDiscontinuedOperations
DilutedEarningsLossPerShareFromContinuingAndDiscontinuedOperations
PropertyPlantAndEquipment CapitalWorkInProgress Goodwill OtherIntangibleAssets
TradeReceivablesCurrent CashAndCashEquivalents CurrentInvestments Assets
EquityAttributableToOwnersOfParent Equity BorrowingsNoncurrent BorrowingsCurrent
TradePayablesCurrent TotalOutstandingDuesOfMicroEnterpriseAndSmallEnterpriseCurrent
TotalOutstandingDuesOfCreditorsOtherThanMicroEnterpriseAndSmallEnterpriseCurrent
CashFlowsFromUsedInOperatingActivities
PurchaseOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities
CashFlowsFromUsedInInvestingActivities CashFlowsFromUsedInFinancingActivities
DividendsPaidClassifiedAsFinancingActivities IncomeTaxesPaidRefundClassifiedAsOperatingActivities
IncreaseDecreaseInCashAndCashEquivalents EffectOfExchangeRateChangesOnCashAndCashEquivalents
DateOfBoardMeetingWhenFinancialResultsWereApproved WhetherResultsAreAuditedOrUnaudited
NatureOfReportStandaloneConsolidated DateOfStartOfReportingPeriod DateOfEndOfReportingPeriod
""".split())
    facts = []
    for elem in root.iter():
        attrs = elem.attrib
        ctx = attrs.get("contextRef")
        name = elem.tag.split("}")[-1]
        if ctx in {"OneD", "OneI", "FourD"} and name in selected_names:
            facts.append({
                "name": name,
                "contextRef": ctx,
                "unitRef": attrs.get("unitRef"),
                "decimals": attrs.get("decimals"),
                "value": (elem.text or "").strip(),
            })
    xbrl_facts = {
        "source": xbrl_gz.relative_to(ROOT).as_posix(),
        "compressedSha256": sha256(compressed),
        "compressedBytes": len(compressed),
        "rawSha256": sha256(raw),
        "rawBytes": len(raw),
        "contexts": contexts,
        "units": units,
        "facts": facts,
        "selectionRule": "Only undimensioned OneD/OneI/FourD facts needed by this refresh, plus filing-date/scope facts. CurrentInvestments is retained as raw evidence but is NOT ingested (L-039).",
    }
    (SOURCE / "kec-q2-fy27-selected-xbrl-facts.json").write_text(json.dumps(xbrl_facts, indent=2) + "\n", encoding="utf-8")
    fact_index = {(f["contextRef"], f["name"]): f["value"] for f in facts}

    def xitem(tag: str, ctx: str, crore: str, note: str | None = None) -> dict:
        raw_value = fact_index[(ctx, tag)]
        return item(crore, f"{tag}@{ctx}={raw_value}", f"kec-q2-xbrl#{ctx}/{tag}", "REPORTED", note)

    marico_periods = {
        "2025-03-31": {
            "periodEnd": "2025-03-31", "fiscalYear": "2025", "periodStart": "2024-04-01",
            "filingRef": "MARICO-INDAS-CONSOL-FY25-AR", "filedAt": "2025-05-02",
            "items": {
                "REVENUE_FROM_OPERATIONS": item("10831", "Revenue from operations 19 10,831 9,653", "marico-fy25-bs-pnl#p170"),
                "OTHER_INCOME": item("208", "Other income 20 208 142", "marico-fy25-bs-pnl#p170"),
                "TOTAL_INCOME": item("11039", "Total income 11,039 9,795", "marico-fy25-bs-pnl#p170"),
                "EMPLOYEE_BENEFIT_EXPENSE": item("831", "Employee benefits expense 22 831 743", "marico-fy25-bs-pnl#p170"),
                "OTHER_EXPENSES": item("2473", "Other expenses 24 2,473 2,136", "marico-fy25-bs-pnl#p170"),
                "FINANCE_COSTS": item("53", "Finance costs 25 53 73", "marico-fy25-bs-pnl#p170"),
                "DEPRECIATION_AND_AMORTISATION": item("178", "Depreciation and amortization expense 23 178 158", "marico-fy25-bs-pnl#p170"),
                "PROFIT_BEFORE_TAX": item("2116", "Profit before tax 2,116 1,937", "marico-fy25-bs-pnl#p170"),
                "TAX_EXPENSE": item("458", "Tax expense 458 435", "marico-fy25-bs-pnl#p170"),
                "NET_PROFIT": item("1658", "Profit for the year (A) 1,658 1,502", "marico-fy25-bs-pnl#p170"),
                "NET_PROFIT_ATTRIBUTABLE_TO_OWNERS": item("1629", "Owners 1,629 1,481", "marico-fy25-bs-pnl#p170"),
                "EPS_BASIC": item("12.59", "Basic earnings per share (in H) 12.59 11.46", "marico-fy25-bs-pnl#p170"),
                "EPS_DILUTED": item("12.56", "Diluted earnings per share (in H) 12.56 11.43", "marico-fy25-bs-pnl#p170"),
                "TOTAL_ASSETS": item("8338", "Total assets 8,338 7,421", "marico-fy25-bs-pnl#p170"),
                "TOTAL_EQUITY": item("4266", "Total equity 4,266 4,169", "marico-fy25-bs-pnl#p170"),
                "EQUITY_ATTRIBUTABLE_TO_OWNERS": item("3975", "Equity attributable to owners 3,975 3,832", "marico-fy25-bs-pnl#p170"),
                "NON_CONTROLLING_INTEREST": item("291", "Non-controlling interests 12(c) 291 337", "marico-fy25-bs-pnl#p170"),
                "CASH_AND_CASH_EQUIVALENTS": item("321", "(iii) Cash and cash equivalents 6(d) 321 228", "marico-fy25-bs-pnl#p170"),
                "CURRENT_INVESTMENTS": item("1375", "(i) Investments 6(a) 1,375 259", "marico-fy25-bs-pnl#p170", note="Current-asset investments line, not the non-current investments line."),
                "TRADE_RECEIVABLES": item("1271", "(ii) Trade receivables 6(b) 1,271 1,069", "marico-fy25-bs-pnl#p170"),
                "TRADE_PAYABLES": item("1363", ["Total outstanding dues of micro enterprises and small enterprises 89 71", "Total outstanding dues of creditors other than micro enterprises and small enterprises 1,274 1,510"], "marico-fy25-bs-pnl#p170", "OPERATOR_SUM", "89 + 1,274 = 1,363; both components printed."),
                "PROPERTY_PLANT_AND_EQUIPMENT": item("710", "Property, plant and equipment 3(a) 710 700", "marico-fy25-bs-pnl#p170"),
                "CAPITAL_WORK_IN_PROGRESS": item("40", "Capital work-in-progress 3(c) 40 44", "marico-fy25-bs-pnl#p170"),
                "GOODWILL": item("857", "Goodwill 5 857 863", "marico-fy25-bs-pnl#p170"),
                "INTANGIBLE_ASSETS": item("946", "Other intangible assets 5 946 937", "marico-fy25-bs-pnl#p170"),
                "OPERATING_CASH_FLOW": item("1363", "Net cash generated from operating activities (A) 1,363 1,387", "marico-fy25-cf#p172"),
                "CAPITAL_EXPENDITURE": item("161", "Payment for property, plant and equipment and intangible assets (161) (153)", "marico-fy25-cf#p172", note="Printed outflow magnitude; positive-magnitude line item."),
                "INVESTING_CASH_FLOW": item("-621", "Net cash (utilised in)/ generated from investing activities (B) (621) 176", "marico-fy25-cf#p172"),
                "FINANCING_CASH_FLOW": item("-649", "Net cash utilised in financing activities (C) (649) (1,542)", "marico-fy25-cf#p172"),
                "DIVIDENDS_PAID": item("453", "Dividends paid to company's shareholders (453) (1,229)", "marico-fy25-cf#p172"),
                "INCOME_TAX_PAID": item("484", "Income taxes paid (net of refunds) (484) (378)", "marico-fy25-cf#p172"),
                "NET_CASH_FLOW": item("93", "D NET INCREASE / (DECREASE) IN CASH & CASH EQUIVALENTS (A+B+C) 93 21", "marico-fy25-cf#p172"),
                "LEASE_LIABILITIES": item("175", ["(i) Lease liabilities 124 104", "(ii) Lease liabilities 51 41", "Balance at March 31, 175 379 554 145 383 529"], "marico-fy25-bs-pnl#p170+marico-fy25-cf#p172", "OPERATOR_SUM", "124 + 51 = 175; cash-flow financing reconciliation prints 175."),
                "SHORT_TERM_BORROWINGS": item("379", "(i) Borrowings 13(a) 379 383", "marico-fy25-bs-pnl#p170", note="Printed current borrowings total. Current-maturity split is not in the committed extract; no split is asserted."),
            },
            "notReported": {
                "LONG_TERM_BORROWINGS": "The FY2025 consolidated balance sheet has no non-current borrowings row. Omission is not a dash, zero, or nil.",
                "CURRENT_MATURITIES_OF_LONG_TERM_DEBT": "No current-maturity split is present in the committed FY2025 extract.",
                "PREFERENCE_CAPITAL": "L-038 remains open: authorised preference capital and equity-only issued share capital do not declare issued preference capital nil.",
            },
        },
        "2026-03-31": {
            "periodEnd": "2026-03-31", "fiscalYear": "2026", "periodStart": "2025-04-01",
            "filingRef": "MARICO-INDAS-CONSOL-FY26-AR", "filedAt": "2026-05-05",
            "items": {
                "REVENUE_FROM_OPERATIONS": item("13611", "Revenue from operations 19 13,611 10,831", "marico-fy26-bs-pnl#p190"),
                "OTHER_INCOME": item("204", "Other income 20 204 208", "marico-fy26-bs-pnl#p190"),
                "TOTAL_INCOME": item("13815", "Total income 13,815 11,039", "marico-fy26-bs-pnl#p190"),
                "EMPLOYEE_BENEFIT_EXPENSE": item("916", "Employee benefits expense 22 916 831", "marico-fy26-bs-pnl#p190"),
                "OTHER_EXPENSES": item("2808", "Other expenses 24 2,808 2,473", "marico-fy26-bs-pnl#p190"),
                "FINANCE_COSTS": item("53", "Finance costs 25 53 53", "marico-fy26-bs-pnl#p190"),
                "DEPRECIATION_AND_AMORTISATION": item("202", "Depreciation and amortization expense 23 202 178", "marico-fy26-bs-pnl#p190"),
                "PROFIT_BEFORE_TAX": item("2277", "Profit before tax 2,277 2,116", "marico-fy26-bs-pnl#p190"),
                "TAX_EXPENSE": item("464", "Tax expense 464 458", "marico-fy26-bs-pnl#p190"),
                "NET_PROFIT": item("1813", "Profit for the year (A) 1,813 1,658", "marico-fy26-bs-pnl#p190"),
                "NET_PROFIT_ATTRIBUTABLE_TO_OWNERS": item("1762", "Owners 1,762 1,629", "marico-fy26-bs-pnl#p190"),
                "EPS_BASIC": item("13.62", "Basic earnings per share (in H) 13.62 12.59", "marico-fy26-bs-pnl#p190"),
                "EPS_DILUTED": item("13.59", "Diluted earnings per share (in H) 13.59 12.56", "marico-fy26-bs-pnl#p190"),
                "TOTAL_ASSETS": item("10075", "Total assets 10,075 8,332", "marico-fy26-bs-pnl#p190"),
                "TOTAL_EQUITY": item("4494", "Total equity 4,494 4,266", "marico-fy26-bs-pnl#p190"),
                "EQUITY_ATTRIBUTABLE_TO_OWNERS": item("4210", "Equity attributable to owners 4,210 3,975", "marico-fy26-bs-pnl#p190"),
                "NON_CONTROLLING_INTEREST": item("284", "Non-controlling interests 12(c) 284 291", "marico-fy26-bs-pnl#p190"),
                "CASH_AND_CASH_EQUIVALENTS": item("404", "(iii) Cash and cash equivalents 6(d) 404 321", "marico-fy26-bs-pnl#p190"),
                "CURRENT_INVESTMENTS": item("1948", "(i) Investments 6(a) 1,948 1,375", "marico-fy26-bs-pnl#p190", note="Current-asset investments line."),
                "TRADE_RECEIVABLES": item("1304", "(ii) Trade receivables 6(b) 1,304 1,271", "marico-fy26-bs-pnl#p190"),
                "TRADE_PAYABLES": item("1634", ["Total outstanding dues of micro enterprises and small enterprises 146 89", "Total outstanding dues of creditors other than micro enterprises and small enterprises 1,488 1,217"], "marico-fy26-bs-pnl#p190", "OPERATOR_SUM", "146 + 1,488 = 1,634; both components printed."),
                "PROPERTY_PLANT_AND_EQUIPMENT": item("832", "Property, plant and equipment 3(a) 832 710", "marico-fy26-bs-pnl#p190"),
                "CAPITAL_WORK_IN_PROGRESS": item("85", "Capital work-in-progress 3(c) 85 40", "marico-fy26-bs-pnl#p190"),
                "GOODWILL": item("1036", "Goodwill 5 1,036 857", "marico-fy26-bs-pnl#p190"),
                "INTANGIBLE_ASSETS": item("1498", "Other intangible assets 5 1,498 946", "marico-fy26-bs-pnl#p190"),
                "OPERATING_CASH_FLOW": item("2084", "Net cash generated from operating activities (A) 2,084 1,363", "marico-fy26-cf#p192"),
                "CAPITAL_EXPENDITURE": item("319", "Payment for property, plant and equipment and intangible assets (319) (161)", "marico-fy26-cf#p192", note="Printed outflow magnitude."),
                "INVESTING_CASH_FLOW": item("-722", "Net cash (utilised in)/ generated from investing activities (B) (722) (621)", "marico-fy26-cf#p192"),
                "FINANCING_CASH_FLOW": item("-1279", "Net cash utilised in financing activities (C) (1,279) (649)", "marico-fy26-cf#p192"),
                "DIVIDENDS_PAID": item("908", "Dividends paid to company’s shareholders (908) (453)", "marico-fy26-cf#p192"),
                "INCOME_TAX_PAID": item("565", "Income taxes paid (net of refunds) (565) (484)", "marico-fy26-cf#p192"),
                "NET_CASH_FLOW": item("83", "D NET INCREASE IN CASH & CASH EQUIVALENTS (A+B+C) 83 93", "marico-fy26-cf#p192"),
                "LEASE_LIABILITIES": item("202", ["(ii) Lease liabilities 127 124", "(ii) Lease liabilities 75 51", "Balance at March 31, 202 355 557 175 379 554"], "marico-fy26-bs-pnl#p190+marico-fy26-cf#p192", "OPERATOR_SUM", "127 + 75 = 202; cash-flow financing reconciliation prints 202."),
                "LONG_TERM_BORROWINGS": item("0", "(i) Borrowings 13(a) 0 -", "marico-fy26-bs-pnl#p190", note="The current column prints the numeral 0; the comparative dash is not used."),
                "SHORT_TERM_BORROWINGS": item("355", "(i) Borrowings 13(a) 355 379", "marico-fy26-bs-pnl#p190", note="Printed current borrowings total. Current-maturity split is not in the committed extract; no split is asserted."),
            },
            "notReported": {
                "CURRENT_MATURITIES_OF_LONG_TERM_DEBT": "No current-maturity split is present in the committed FY2026 extract.",
                "PREFERENCE_CAPITAL": "L-038 remains open; no issued preference amount or express nil is disclosed.",
            },
        },
    }

    kec_periods = {
        "2026-06-30": {
            "periodEnd": "2026-06-30", "fiscalYear": "2027", "periodStart": "2026-04-01",
            "quarterForm": "DISCRETE", "quarterIndex": "1",
            "filingRef": "KEC-INDAS-CONSOL-Q1-FY27-OUTCOME", "filedAt": "2026-08-10",
            "items": {
                "REVENUE_FROM_OPERATIONS": item("5023.54", "Revenue from operations 5,023.54 6,389.75 5,022.88 23,505.54", "kec-q1-pnl#p6"),
                "OTHER_INCOME": item("13.94", "Other income 13.94 30.09 5.39 50.33", "kec-q1-pnl#p6"),
                "TOTAL_INCOME": item("5037.48", "Total Income (1+2) 5,037.48 6,419.84 5,028.27 23,555.87", "kec-q1-pnl#p6"),
                "EMPLOYEE_BENEFIT_EXPENSE": item("430.88", "Employee benefits expense 430.88 426.46 392.37 1,662.39", "kec-q1-pnl#p6"),
                "OTHER_EXPENSES": item("482.95", "Other expenses 482.95 492.91 403.81 1,870.03", "kec-q1-pnl#p6"),
                "FINANCE_COSTS": item("164.03", "Finance costs 164.03 169.85 151.12 663.60", "kec-q1-pnl#p6"),
                "DEPRECIATION_AND_AMORTISATION": item("50.82", "Depreciation and amortisation expense 50.82 50.58 45.86 197.38", "kec-q1-pnl#p6"),
                "PROFIT_BEFORE_TAX": item("89.90", "Profit after exceptional items and before tax (5-6) 89.90 257.73 158.51 789.14", "kec-q1-pnl#p6"),
                "TAX_EXPENSE": item("17.28", "Total Tax Expense 17.28 64.94 33.91 183.55", "kec-q1-pnl#p6"),
                "NET_PROFIT": item("72.62", "Profit for the period (7-8) 72.62 192.79 124.60 605.59", "kec-q1-pnl#p6"),
                "EPS_BASIC": item("2.73", "2.73 7.24 4.68 22.75", "kec-q1-pnl#p6"),
                "EPS_DILUTED": item("2.73", "2.73 7.24 4.68 22.75", "kec-q1-pnl#p6", note="The filing prints Basic/Diluted EPS on one line."),
            },
            "notReported": {
                "NET_PROFIT_ATTRIBUTABLE_TO_OWNERS": "The committed Q1 page prints profit for the period and EPS attributable to owners, but no separate owners' profit amount. No attribution is inferred.",
                "BALANCE_SHEET": "No Q1 consolidated balance sheet is present in the committed extract.",
                "CASH_FLOW": "No Q1 consolidated cash-flow statement is present in the committed extract.",
            },
        },
        "2026-09-30": {
            "periodEnd": "2026-09-30", "fiscalYear": "2027", "periodStart": "2026-07-01",
            "quarterForm": "DISCRETE", "quarterIndex": "2",
            "filingRef": "KEC-INDAS-CONSOL-Q2-FY27-OUTCOME-XBRL", "filedAt": "2026-11-02",
            "items": {
                "REVENUE_FROM_OPERATIONS": xitem("RevenueFromOperations", "OneD", "5467.71"),
                "OTHER_INCOME": xitem("OtherIncome", "OneD", "13.27"),
                "TOTAL_INCOME": xitem("Income", "OneD", "5480.98"),
                "EMPLOYEE_BENEFIT_EXPENSE": xitem("EmployeeBenefitExpense", "OneD", "456.22"),
                "OTHER_EXPENSES": xitem("OtherExpenses", "OneD", "2187.75"),
                "FINANCE_COSTS": xitem("FinanceCosts", "OneD", "190.66"),
                "DEPRECIATION_AND_AMORTISATION": xitem("DepreciationDepletionAndAmortisationExpense", "OneD", "53.01"),
                "PROFIT_BEFORE_TAX": xitem("ProfitBeforeTax", "OneD", "40.88"),
                "TAX_EXPENSE": xitem("TaxExpense", "OneD", "11.14"),
                "NET_PROFIT": xitem("ProfitLossForPeriod", "OneD", "29.74"),
                "EPS_BASIC": xitem("BasicEarningsLossPerShareFromContinuingAndDiscontinuedOperations", "OneD", "1.12"),
                "EPS_DILUTED": xitem("DilutedEarningsLossPerShareFromContinuingAndDiscontinuedOperations", "OneD", "1.12"),
                "TOTAL_ASSETS": item("24818.26", "Total Assets 24,818.26 25,158.06", "kec-q2-bs#p7", note="Corroborated by Assets@OneI=248182600000."),
                "TOTAL_EQUITY": item("6091.35", "Total Equity 6,091.35 6,159.69", "kec-q2-bs#p7", note="Corroborated by Equity@OneI=60913500000."),
                "EQUITY_ATTRIBUTABLE_TO_OWNERS": xitem("EquityAttributableToOwnersOfParent", "OneI", "6091.35"),
                "CASH_AND_CASH_EQUIVALENTS": item("315.47", "(ii) Cash and cash equivalents 315.47 411 .26", "kec-q2-bs#p7", note="Corroborated by CashAndCashEquivalents@OneI=3154700000."),
                "TRADE_RECEIVABLES": item("5609.55", "(i) Trade receivables 5,609.55 6,474.21", "kec-q2-bs#p7", note="Current trade receivables; non-current receivables are sub-rounding and not added."),
                "TRADE_PAYABLES": item("7570.74", ["Total outstanding dues of micro and small enterprises 197.51 218.20", "Total outstanding dues of creditors other than micro and small enterprises 7,373.23 8,485.05"], "kec-q2-bs#p7", "OPERATOR_SUM", "197.51 + 7,373.23 = 7,570.74; corroborated by TradePayablesCurrent@OneI=75707400000."),
                "PROPERTY_PLANT_AND_EQUIPMENT": item("1270.63", "(a) Property, Plant and Equipment 1,270.63 1,159.49", "kec-q2-bs#p7", note="Printed PPE excludes the separately printed right-of-use asset 310.32. XBRL PropertyPlantAndEquipment@OneI=15809500000 includes it; the printed split is used."),
                "CAPITAL_WORK_IN_PROGRESS": item("44.00", "(c) Capital work-in-progress 44.00 113.65", "kec-q2-bs#p7"),
                "GOODWILL": item("308.74", "(d)Goodwill 308.74 305.80", "kec-q2-bs#p7"),
                "INTANGIBLE_ASSETS": item("2.15", "(e) Intangible Assets 2.15 2.92", "kec-q2-bs#p7"),
                "LONG_TERM_BORROWINGS": item("670.13", "(i) Borrowings 670.13 661.37", "kec-q2-bs#p7", note="Non-current borrowings."),
                "SHORT_TERM_BORROWINGS": item("5350.65", "(i) Borrowings 5,350.65 4,441.86", "kec-q2-bs#p7", note="Printed current borrowings total. No current-maturity split is asserted; assessment capital structure remains blocked by the missing split."),
            },
            "notReported": {
                "NET_PROFIT_ATTRIBUTABLE_TO_OWNERS": "The committed September instance has no ProfitLossAttributableToOwnersOfParent fact and the committed PDF extract is the balance sheet only. No owners' profit is inferred from total profit.",
                "NON_CONTROLLING_INTEREST": "No NCI fact/caption is present. Equality of total equity and owners' equity is not used to manufacture a zero.",
                "CURRENT_INVESTMENTS": "L-039 refuses the machine CurrentInvestments=0 fact; the printed balance sheet has no current-investments caption.",
                "LEASE_LIABILITIES": "The printed balance sheet has lease liabilities, but the committed XBRL selection has no governed lease-liability tag; the refresh does not map an aggregate other-financial-liabilities fact into leases.",
                "CURRENT_MATURITIES_OF_LONG_TERM_DEBT": "No current-maturity split is present in the committed Q2 sources.",
                "CASH_FLOW": "The committed XBRL cash-flow facts are FourD (2026-04-01 to 2026-09-30), i.e. half-year YTD. They are retained in the source fact JSON but not assigned to the discrete Q2 period.",
                "PREFERENCE_CAPITAL": "No issued preference amount or express nil is disclosed.",
            },
        },
    }

    # Verify printed forms against the verbatim committed excerpts.
    for period in marico_periods.values():
        assert_printed(period, page_texts)
    assert_printed(kec_periods["2026-06-30"], page_texts)
    assert_printed(kec_periods["2026-09-30"], page_texts)
    # Verify every XBRL-backed item against the selected raw fact and the crore conversion.
    for period in kec_periods.values():
        for line_item, entry in period["items"].items():
            if not entry["locator"].startswith("kec-q2-xbrl#"):
                continue
            ctx, tag = entry["locator"].split("#", 1)[1].split("/", 1)
            raw_value = fact_index[(ctx, tag)]
            if tag.startswith(("BasicEarnings", "DilutedEarnings")):
                expected = raw_value
            else:
                expected = f"{int(raw_value) / 10_000_000:.2f}"
            if float(expected) != float(entry["value"]):
                raise AssertionError(f"{period['periodEnd']} {line_item}: {raw_value} -> {expected}, not {entry['value']}")

    extraction = {
        "bundle": "S4-R3 filing refresh — additive candidate, not a host installation",
        "scale": "INR crore as printed/tagged; source_scale=CRORE. Per-share values are not scaled.",
        "marico": {"issuerId": MARICO_ID, "periods": marico_periods},
        "kec": {"issuerId": KEC_ID, "periods": kec_periods},
        "crossChecks": {
            "maricoFY25AsFiledVsFY26Comparative": {
                "TOTAL_ASSETS": {"FY25 current column": "8338", "FY26 comparative column": "8332"},
                "TRADE_PAYABLES": {"FY25 current column sum": "1363", "FY26 comparative column sum": "1306"},
                "disposition": "Keep FY2025 as filed in the FY2025 report. The FY2026 comparative is not an overwrite and no restatement cause is inferred.",
            },
            "kecQ2PPE": {
                "printedPPE": "1270.63", "printedRightOfUseAsset": "310.32",
                "xbrlPropertyPlantAndEquipment": "1580.95",
                "disposition": "Use printed PPE 1270.63; record that the XBRL caption aggregates PPE and right-of-use assets.",
            },
            "kecQ2CashFlow": {
                "context": "FourD", "periodStart": "2026-04-01", "periodEnd": "2026-09-30",
                "operatingCashFlowCrore": "-400.37", "investingCashFlowCrore": "-91.73", "financingCashFlowCrore": "398.49",
                "disposition": "Half-year YTD evidence retained, not ingested as discrete Q2 cash flow.",
            },
        },
    }
    for issuer_dir, issuer_id, old_bundle, periods in [
        (INPUT / "marico", MARICO_ID, WI7, marico_periods),
        (INPUT / "kec", KEC_ID, WI8, kec_periods),
    ]:
        issuer_dir.mkdir(parents=True, exist_ok=True)
        (issuer_dir / "roster.json").write_bytes((old_bundle / "ingest-input" / "roster.json").read_bytes())
        header, old_rows = read_csv(old_bundle / "ingest-input" / "periods.csv")
        if issuer_id == KEC_ID:
            header = header + ["quarter_form", "quarter_index"]
            for row in old_rows:
                row["quarter_form"] = ""
                row["quarter_index"] = ""
        new_rows = []
        for end in sorted(periods, reverse=True):
            p = periods[end]
            row = {column: "" for column in header}
            row.update({
                "issuer_id": issuer_id,
                "period_type": "ANNUAL" if issuer_id == MARICO_ID else "QUARTER",
                "fiscal_year": p["fiscalYear"],
                "period_start": p["periodStart"],
                "period_end": end,
                "statement_scope": "CONSOLIDATED",
                "taxonomy": "INDAS",
                "basis": "AS_FILED",
                "filing_ref": p["filingRef"],
                "filed_at": p["filedAt"],
                "source_scale": "CRORE",
            })
            if issuer_id == KEC_ID:
                row["quarter_form"] = p["quarterForm"]
                row["quarter_index"] = p["quarterIndex"]
            for line_item, entry in p["items"].items():
                row[line_item] = entry["value"]
            new_rows.append(row)
        (issuer_dir / "periods.csv").write_text(csv_text(header, new_rows + old_rows), encoding="utf-8")
    (BUNDLE / "data-extraction.json").write_text(json.dumps(extraction, indent=2) + "\n", encoding="utf-8")

    selection = {
        "generatedOn": "2026-11-14",
        "network": "NONE",
        "historicalBundlesModified": False,
        "candidateInputs": [
            "evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input",
            "evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico",
            "evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec",
        ],
        "documents": {
            "maricoFY25": {"sha256": "74e0f6c239f6b611a1d66f361988a65f52bdfb51956ada929de3f4857b1e3474", "bytes": 14370556, "pages": 255, "committedExtract": fy25_report.relative_to(ROOT).as_posix()},
            "maricoFY26": {"sha256": "7ea5e097b415f4fa226d32cad95cdc6435a88c58e43c2db10d4de7b31103ec4f", "bytes": 21282741, "pages": 279, "committedExtract": fy26_report.relative_to(ROOT).as_posix()},
            "kecQ1FY27": {"sha256": "b2e183cd6ddc17c2b60c034a20ac8cd2d81cb5b4a946b8a36175e084fd31e5ae", "bytes": 7405447, "pages": 14, "committedExtract": kec_report.relative_to(ROOT).as_posix()},
            "kecQ2FY27": {"sha256": "42d826df45b0b561460980fbc7a1f8fab2ff3985ec1196fe42706f0e4097144e", "bytes": 9260344, "pages": 18, "committedExtract": kec_report.relative_to(ROOT).as_posix()},
            "kecQ2FY27Xbrl": {"compressedSha256": sha256(compressed), "compressedBytes": len(compressed), "rawSha256": sha256(raw), "rawBytes": len(raw), "committedSource": xbrl_gz.relative_to(ROOT).as_posix()},
        },
        "infosys": {"status": "OPEN_NO_COMMITTED_NEWER_SOURCE", "newestCommittedPeriodEnd": "2024-03-31"},
    }
    (BUNDLE / "source-selection.json").write_text(json.dumps(selection, indent=2) + "\n", encoding="utf-8")
    print("built S4-R3 candidate inputs: Marico +2 annual, KEC +2 discrete quarterly; no historical bundle written")


if __name__ == "__main__":
    main()
