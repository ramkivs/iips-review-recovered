# D-2 — Nil-by-Disclosure: evidence bundle (revised after PR #487 review)

**Work item:** IIPS v3.0 D-2 — a debt-free issuer cannot be valued or graded (representation and one aggregation
contract only).
**Date:** 2026-11-06. **Baseline:** `main` `98f3e45` (PR #486 merged).
**Design and report:** `docs/integration/IIPS_V3_IID_D2_NIL_BY_DISCLOSURE_2026-11-06.md`.

This revision **withdraws** the nil declarations carried by the first revision. The FY24 consolidated Ind AS
statements do not state that borrowings are nil; they simply present no borrowings row. Under the D-2 rule an
omitted line is `NOT_REPORTED`, so no nil is asserted here and the Work Item 1 classification stands unchanged.
See `withdrawn/WHY-WITHDRAWN.md`.

## 1. What the filing actually says, and what it does not

Source: **Infosys Limited and Subsidiaries — Consolidated Financial Statements under Indian Accounting Standards for
the year ended March 31, 2024**, consolidated balance sheet on **page 1** (signed Bengaluru, 18 April 2024), read
again for this review.

Under **LIABILITIES → NON-CURRENT LIABILITIES → FINANCIAL LIABILITIES** the statement lists `Lease liabilities`
(Note 2.21) 6,400 and `Other financial liabilities` (2.13) 2,130, then deferred tax liabilities and other non-current
liabilities. Under **CURRENT LIABILITIES → FINANCIAL LIABILITIES** it lists `Lease liabilities` 1,959, `Trade
payables` 3,956 and `Other financial liabilities` 16,959, then provisions and income tax liabilities. **There is no
borrowings row — long-term, short-term or current maturities — and the notes index (page 7) lists no borrowings
note**; the liability notes there are 2.13 (other financial liabilities) and 2.21 (leases). The pages examined for
this review — note 2.1 (p.10), notes 2.4.2–2.5 (pp.13–16), note 2.9 cash (p.19), notes 2.10–2.11 (pp.19–20 and
continuing) — contain no sentence stating that borrowings are nil.

| Requirement for a nil | Result for this filing |
| --- | --- |
| Exact annual-report source and page/note | Consolidated balance sheet, page 1; notes index page 7; notes 2.1 (p.10), 2.4.2–2.5 (pp.13–16), 2.9–2.11 (pp.19–20) examined |
| **Verbatim wording establishing nil or not applicable** | **None exists.** The statement is silent: there is no row and no sentence to quote |
| Reporting period | FY2024, period end 2024-03-31 (comparatives 2023-03-31, 2022-03-31 likewise silent) |
| Canonical component mapping | `LONG_TERM_BORROWINGS`, `SHORT_TERM_BORROWINGS`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`, `PREFERENCE_CAPITAL` |
| Why it would qualify as `NIL_BY_DISCLOSURE` | **It does not.** Absence of a line is not a statement; the filer has said nothing, so the only defensible classification is `NOT_REPORTED` |

The product now encodes that rule rather than trusting the operator: a nil must quote the source's wording
(`nilByDisclosure` throws without `statement`; INV-7 checks it on every observation; the CSV path refuses a bare
`NIL` or `NIL:` with `NIL_WITHOUT_QUOTED_WORDING`).

## 2. The four debt components, reconciled

One row per component, from `runs/outcome-on-filing-evidence.json` (dataset `sha256:ca29c835…`, the untouched Work
Item 1 dataset):

| Component | State | Value | Source | periodEnd | Aggregation treatment |
| --- | --- | --- | --- | --- | --- |
| `SHORT_TERM_BORROWINGS` | `MISSING` / `NOT_REPORTED` | — (never `0`) | no cell: the statement presents no such line | 2024-03-31 (period it would belong to) | **blocks** gross debt |
| `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | `MISSING` / `NOT_REPORTED` | — | as above | 2024-03-31 | **blocks** gross debt |
| `LONG_TERM_BORROWINGS` | `MISSING` / `NOT_REPORTED` | — | as above | 2024-03-31 | **blocks** gross debt |
| `LEASE_LIABILITIES` | `PRESENT` (`AS_FILED`) | **83,590,000,000** = 8,359 crore (6,400 + 1,959) | `INFY-INDAS-CONSOL-FY24`, balance sheet page 1 / note 2.21 | 2024-03-31 | summed; the only debt component with a value |

Resulting aggregate: `grossDebt` `MISSING` / `NOT_REPORTED`, `netDebt` `MISSING` / `NOT_REPORTED` — the block is
published with the first blocking component's own reason, and no partial total is offered.

### Why the earlier "four nil declarations, gross debt ₹8,359 crore" was inconsistent

It reconciled only because the four declarations were *not* the four debt components:

- three of the four declared columns (`LONG_TERM_BORROWINGS`, `SHORT_TERM_BORROWINGS`,
  `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`) were debt components, contributing 0 each under the declared-nil rule;
- the fourth (`PREFERENCE_CAPITAL`) is **not** a debt component — it is a claim subtracted below enterprise value in
  the R-4.1 bridge, so it cannot enter gross debt at all;
- `LEASE_LIABILITIES` was never declared nil — it was reported at 8,359 crore and was the entire gross-debt total.

So "0 + 0 + 0 + 8,359 = 8,359" was arithmetically right and evidentially wrong: the three zeros rested on a
declaration the filing does not make. The bundle said "four nil declarations" and showed a gross debt that could
only arise from three of them, which is what the review caught. With the declarations removed the aggregate is
blocked, and the four-row table above is the honest version of the same facts.

## 3. Measured outcome on the filing evidence

| Field | Value |
| --- | --- |
| datasetVersion | `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e` (identical to Work Item 1) |
| ingestion issues | 0 |
| `leaseLiabilities` | `PRESENT` 83,590,000,000 |
| three borrowings components + `preferenceCapital` | `MISSING` / `NOT_REPORTED` |
| `grossDebt`, `netDebt` | `MISSING` / `NOT_REPORTED` |
| `DCF_FCFF` per share | `NOT_COMPUTABLE` (bridge blocked) |
| `intrinsic` | `null` |
| moat | `INSUFFICIENT_EVIDENCE` |
| margin of safety | refused `NO_PRICE_OBSERVATION` |
| adequacy / quality | `SUFFICIENT` / `MATERIAL_CONCERNS` |
| confidence | 0.4939, caps `STALE_DATA`, `DILUTION_PROXY` |
| composed artifact (dry run) | status `OK`, `reportKey ed1e54b03e5e…`, **`payloadDigest cc91f239197a…`** — byte-identical to the merged Work Item 1 artifact |
| sector coverage | `Technology` `G2_PARTIAL`, usable 2, withheld 2, statement coverage 87.5% |

**The one transferable fact for D-2:** the representation fix changes nothing for this issuer, because the issuer
never declared anything. D-2's benefit applies to filings that *state* a nil ("the Company has no borrowings as at
the reporting date" and similar), which this bundle does not contain. The mechanism is therefore verified on
synthetic fixtures only (`tests/investment/nil-by-disclosure.test.ts`, suites A–D), and exercising it on real data is
an open item, not a result.

## 4. Files

| Path | What it is |
| --- | --- |
| `input/periods.csv`, `input/roster.json` | byte-identical copies of the Work Item 1 inputs; no nil declaration |
| `runs/outcome-on-filing-evidence.json` | the measurement above |
| `runs/bare-nil-attempt.json` | the refused attempt: 12 × `NIL_WITHOUT_QUOTED_WORDING`, components stay `NOT_REPORTED`, gross debt stays blocked |
| `runs/cli-dry-run-filing-evidence.txt` | composed artifact, dry run, `payloadDigest cc91f239197a…` |
| `runs/nil-by-disclosure-tests.txt`, `runs/investment-suite.txt` | 29 / 29 and 406 / 406 |
| `runs/commands.txt` | the exact commands and digests |
| `withdrawn/` | the three superseded files and the reason they must not be cited |

## 5. Reproduce

```
cd iips-platform
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/input \
  --dataset-dir /tmp/d2f/dataset --now 2026-11-06T00:00:00.000Z
cd ../frontend
npx tsx server/investment/cli/generate-investment-artifacts.ts --issuer IN:CIN:L85110KA1981PLC013115 \
  --data-dir /tmp/d2f/dataset --identity-dir /tmp/d2/data/investment/identity \
  --generated-at 2026-11-06T00:00:00.000Z --dry-run
```

The identity directory is a copy of `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/identity`.
