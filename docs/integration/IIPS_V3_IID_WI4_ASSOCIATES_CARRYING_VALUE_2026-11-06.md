# IIPS v3.0 — Work Item 4: associates and joint ventures (2026-11-06)

**Scope:** Infosys Limited (CIN `L85110KA1981PLC013115`, ISIN `INE009A01021`), real-issuer chain only.
**Question:** do the audited consolidated Ind AS statements disclose a carrying value for investments in associates and
joint ventures that can be reported as a `IIPS_INVESTMENT_FUNDAMENTALS_V2` observation of
`INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES`?
**Answer:** **no.** Not "not found yet", not "zero", but: **no equity-accounted interest is recognised in FY2024, FY2023
or FY2022**, so there is no amount to report.

**Effective outcome:** no dataset, no observation, no nil, no payload change. `POLICY_ZERO_UNAVAILABLE` remains the
bridge treatment; `REVIEW_DUE` remains the review status; `L-036` remains `PARTIALLY RESOLVED`; `L-035` remains `OPEN`.

---

## 1. Why this work item exists

Work Item 3 published an intrinsic value and a margin of safety. Both rest on the enterprise-to-equity bridge, and that
bridge adds `associatesAndJV` at carrying value (design rule R-4.1). Dataset schema V1 had no such line item, so the
bridge substituted **zero** and published the substitution as a policy treatment (`associates-treatment/1.0.0`,
`POLICY_ZERO_UNAVAILABLE`). Phase IX then built the receiving field — schema V2 item
`INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES`, plus two XBRL component captions — and put a 180-day review control in
force. What neither phase could supply was the issuer's number. That is this work item.

Two failure modes had to be avoided, and both are tempting:

- **finding a number that is not the item** — the consolidated balance sheet is full of large, audited investment
  figures, and the largest ones are aggregates of debt instruments;
- **converting an omission into a nil** — because "the statement does not say" reads, to a careless pipeline, like
  "the statement says zero".

## 2. Documents, periods, sections

| Document | `filingRef` | Periods | Statements dated | Basis |
|---|---|---|---|---|
| `consol-fy24-annual-finstatement.pdf` | `INFY-INDAS-CONSOL-FY24` | FY2024 + FY2023 | 2024-04-18 | consolidated, Ind AS, audited, ₹ crore |
| `consol-fy23-annual-finstatement.pdf` | `INFY-INDAS-CONSOL-FY23` | FY2023 + FY2022 | 2023-04-13 | consolidated, Ind AS, audited, ₹ crore |

Auditor for both: Deloitte Haskins & Sells LLP (FRN 117366W/W-100018). Both are the issuer's own filing, from the same
document family the Work Item 3 nil declarations rest on; the price and identity evidence is untouched.

Read in full: consolidated balance sheet and consolidated statement of profit and loss (both documents, both columns);
Note 1.3 *basis of consolidation*; **Note 2.5 *Investments*** and **Note 2.5.1 *Details of investments***
(all three periods); and Notes 2.6 Loans, 2.7 Other financial assets, 2.9 Cash, 2.10 Other assets, 2.11 Financial
instruments and 2.12 Equity of the FY2024 statement.

## 3. The finding, in three tests

### 3.1 No separate balance-sheet caption

Ind AS 1 para 54(e) requires *investments accounted for using the equity method* to be presented as a separate line
item. The audited balance sheet carries exactly two investment captions, both cross-referenced to Note 2.5, and every
other caption in both asset blocks is present and totals to the filed block totals:

| At | Non-current `Investments` | Current `Investments` | Filed block totals (non-current / current) |
|---|---|---|---|
| 2024-03-31 | 11,708 | 12,915 | 48,382 / 89,432 |
| 2023-03-31 | 12,569 | 6,909 | 54,935 / 70,881 |
| 2022-03-31 | 13,651 | 6,673 | 50,700 / 67,185 |

### 3.2 The investments note ties to the rupee, twice, in every period

Note 2.5 decomposes both captions exhaustively into Ind AS 109 measurement categories:

| Period | Non-current + current | Note 2.5 total | Amortised cost + FVOCI + FVTPL | Note 2.5 total |
|---|---|---|---|---|
| FY2024 | 11,708 + 12,915 = **24,623** | 24,623 | 1,759 + 19,620 + 3,244 = **24,623** | 24,623 |
| FY2023 | 12,569 + 6,909 = **19,478** | 19,478 | 1,920 + 16,012 + 1,546 = **19,478** | 19,478 |
| FY2022 | 13,651 + 6,673 = **20,324** | 20,324 | 2,122 + 16,007 + 2,195 = **20,324** | 20,324 |

Two independent decompositions, each exhaustive and each equal to the filed total, leave no capacity for an unreported
fifth component. There is no equity-method row in any of the six columns.

### 3.3 No share-of-associates line in profit or loss

Ind AS 1 para 82(c) and Ind AS 28 require a separate *share of profit/(loss) of associates and joint ventures* line and
a share of their other comprehensive income. Neither appears in FY2024, FY2023 or FY2022. The OCI section carries five
lines — defined-benefit remeasurement, equity instruments through OCI, cash-flow hedges, foreign-currency translation,
fair-value changes on investments — and none is an equity-accounted share.

Corroborating: Note 1.3 consolidates *the Company, its controlled trusts and its subsidiaries*, line by line with
intra-group elimination, and points to Note 2.25 for the entity list. No associate, no joint venture, no equity method.

## 4. Candidate figures, named and refused

| Candidate | ₹ crore | Why it is not the line item |
|---|---|---|
| Non-current `Investments` FY2024 | 11,708 | Bonds, NCDs, government securities, funds and minority stakes. Fully decomposed; no equity-accounted component. |
| Total investments FY2024 | 24,623 | Adds the current treasury portfolio (commercial paper 4,830, CDs 3,043, liquid funds 2,615). |
| Total investments FY2023 / FY2022 | 19,478 / 20,324 | Same objection, one and two years earlier. |
| Named holdings FY2024 / FY2023 / FY2022 | 404 / 365 / 377 | Note 2.5.1's minority stakes and fund interests. All at fair value — and fair-value measurement is incompatible with the equity method. None is called an associate or joint venture. |
| Ideaforge equity FY2024 | 113 | Listed minority holding, 16,47,314 shares, FVOCI, no significant influence asserted. |
| Amortised cost / FVOCI / FVTPL FY2024 | 1,759 / 19,620 / 3,244 | Measurement categories spanning debt instruments and equity; not an investee interest. |
| Total assets / total equity FY2024 | 137,814 / 88,461 | Issuer-level aggregates. |
| Form AOC-1 | — | Annexure to the standalone statements; absent from the audited consolidated statements, and its investee-net-asset and ownership data are barred from this item regardless. |

`artifact/investigation.json` holds all eleven with the same reasoning and an explicit `accepted`-free shape: the test
suite fails if any candidate acquires an `accepted` flag.

## 5. Why no nil declaration

Work Item 3 could declare borrowings nil because the filing said so in words. For associates and joint ventures there is
no such sentence — there is an absent caption. The nil grammar requires the filer's own wording, the filing reference
and the period; this item is `reported: true`, so a nil must be *quoted*, never inferred from silence. And the
distinction is substantive: zero measures a recognised interest written down to nothing, whereas "no interest is
recognised" is a different fact about the balance sheet.

## 6. What was not done

| | |
|---|---|
| V2 dataset written | no |
| V2 observation created | no |
| Nil declared | no |
| V1 backfilled | no |
| Derived or estimated amount used | no |
| Schema, line items, XBRL map, bridge, review policy, confidence policy | untouched |
| Earlier evidence bundles | untouched |
| Payload, intrinsic, margin of safety, band, confidence | unchanged (byte-identical; `ixAuthorizedPolicy.test.ts` still reproduces the IX package exactly) |

The bridge keeps `POLICY_ZERO_UNAVAILABLE` and the payload keeps `capitalStructure.associatesAndJV =
NOT_COMPUTABLE: NOT_REPORTED`. The review control keeps `REVIEW_DUE` at `clockStart 2024-03-31`, `reviewAgeDays 180`,
`elapsedDaysAtRun 950`. It stays on because it is an authorised requirement keyed to evidence age, not a flag that
retires once someone looks; this work item *is* the look, and its result is recorded. No implementation defect was
found in the control, so nothing about it was changed.

## 7. Limits

- Notes 2.13–2.27 were not machine-read: the PDF extraction available here returns the first 30 pages of each filing
  (through Note 2.12.4). That includes Note 2.25 *Related party transactions* (p. 50). The conclusion does not depend
  on it — an equity-accounted interest must appear in the balance sheet, in profit or loss and in the investments note,
  and all three are complete and reconcile — but a roster naming a dormant associate would be a reason to keep `L-036`
  open, and it is kept open.
- FY2022 is read from the audited comparative column of the FY2023 statements, not reconstructed.
- The finding is about FY2024–FY2022 only. It does not claim the Group has never held an associate.

## 8. Verification

| Check | Result |
|---|---|
| `npx tsx --test tests/investment/wi4AssociatesEvidence.test.ts` | 18 tests, all passing |
| digest of every extract vs `source/quotes.json` | 9/9 match |
| three-period reconciliation (both directions) | 6/6 ties, asserted in the test |
| `npx tsc --noEmit` (iips-platform) | clean |
| full investment suite `npx tsx --test tests/investment/*.test.ts` | see `runs/targeted-tests.txt` |
| committed IX package still regenerates | yes (`ixAuthorizedPolicy.test.ts`) |

## 9. Register impact

| Entry | Before | After | Reason |
|---|---|---|---|
| `L-036` | `PARTIALLY RESOLVED` | **`PARTIALLY RESOLVED`** | Residue narrowed: no filed amount exists to ingest, and the payload still applies an unstated policy zero. Not closed by the investigation completing. |
| `L-035` | `OPEN` | **`OPEN`** | No nil declaration was made. |
| `L-001` … `L-034` | unchanged | unchanged | Out of scope. |

Evidence bundle: `evidence/real-issuer/WI4-ASSOCIATES-CARRYING-VALUE-2026-11-06/`.
