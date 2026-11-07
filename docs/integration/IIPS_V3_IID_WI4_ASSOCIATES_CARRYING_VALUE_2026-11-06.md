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
(all three periods); Notes 2.6 Loans, 2.7 Other financial assets, 2.9 Cash, 2.10 Other assets, 2.11 Financial
instruments and 2.12 Equity of the FY2024 statement; and, in the 2026-11-07 residual pass, **Notes 2.13 to 2.27 of both
filings**, including Note 2.19 *Other income* and Note 2.25 *Related party transactions* in full, plus the
group-structure annexure (§10).

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

- ~~Notes 2.13–2.27 were not machine-read~~ — **closed 2026-11-07 (§10).** The original pass could reach only the first
  30 pages of each filing (through Note 2.12.4). The residual pass read pp. 31–57 through a full-document reader of the
  same PDFs: neither filing discloses an associate, a joint venture, a dormant associate or an equity-method balance, and
  the group-structure annexure has no associates block. `L-036` stays open anyway — because the underlying **amount** is
  unavailable, not because the roster is unexamined.
- The interior movement tables of Notes 2.21 (leases) and 2.22 (employee benefits), pp. 41–46, were not re-read in that
  pass; their opening tables and closing pages were. Neither can present a third-party equity interest.
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
| `L-036` | `PARTIALLY RESOLVED` | **`PARTIALLY RESOLVED`** | Residue narrowed: no filed amount exists to ingest. The bridge applies zero for the term under the **disclosed** `POLICY_ZERO` treatment (`POLICY_ZERO_UNAVAILABLE`, `associates-treatment/1.0.0`), which the payload states on every derived per-share observation. Not closed by the investigation completing. |
| `L-035` | `OPEN` | **`OPEN`** | No nil declaration was made. |
| `L-001` … `L-034` | unchanged | unchanged | Out of scope. |

Evidence bundle: `evidence/real-issuer/WI4-ASSOCIATES-CARRYING-VALUE-2026-11-06/`.

## 10. Residual review: Notes 2.13–2.27 (2026-11-07)

Section 7 recorded a limit: Notes 2.13–2.27 were not machine-read, because the extraction available at the time returned
only the first 30 pages of each filing, and Note 2.25's related-party roster could still have named an associate. That
limit is now closed.

Both filings are **digitally typeset PDFs with a complete text layer** — they are not scans — so the pages were read in
full through a full-document reader of the *same* documents, page-anchored to the printed page numbers: pp. 31–57 of
`INFY-INDAS-CONSOL-FY24`, and pp. 37–54 of `INFY-INDAS-CONSOL-FY23` (which also carries the FY2022 comparatives). Notes
2.19 and 2.25 are transcribed in full in `source/`, and the note-by-note sweep is `source/fy24-notes-2.13-to-2.27-sweep.txt`.

### 10.1 What the notes contain

| Note | Pages | Associates / JV content |
|---|---|---|
| 2.13–2.18 — other financial liabilities, trade payables, other liabilities, provisions, income taxes, revenue | 31–38 | none |
| **2.19 Other income, net** | 39–40 | **none** — interest at amortised cost 1,007, FVOCI interest 1,965, FVTPL gains 285, exchange 100 / 87, tax-refund interest, miscellaneous 207; total 4,711 (2,701) |
| 2.20–2.24 — expenses, leases, employee benefits, EPS, contingent liabilities | 40–49 | none |
| **2.25 Related party transactions** | 50–54 | **none** — subsidiaries (single list, all 100%/majority), trusts (post-employment plans, four controlled trusts, Infosys Foundation as "Trust jointly controlled by KMPs"), KMP compensation 130 (127) |
| **Group-structure annexure** | 52–54 | **none** — Infosys Limited, Indian Subsidiaries, Foreign Subsidiaries, Subtotal 100%, consolidation adjustment, Controlled Trusts, non-controlling interests |
| 2.26–2.27 — segments, function-wise classification | 55–57 | none |

Note 2.19 matters most: it is the only disaggregation of profit or loss beyond revenue and operating expenses, and
therefore the note in which a *share of an associate's or joint venture's profit* would appear. It does not. The
group-structure annexure matters second: it is the one table required to itemise the sources of consolidated net assets,
profit or loss and OCI, and its blocks contain no associates or joint-ventures row — an equity-accounted entity could not
be missing from it silently.

### 10.2 The three distinctions, applied

- **Relationship ≠ classification.** The only "other related party" in either year is Infosys Foundation, a trust jointly
  controlled by KMPs — a related party that is not an investee at all.
- **Dormancy ≠ carrying value.** The only dormancy markers are subsidiary footnotes ("(22) Under liquidation",
  "Liquidated effective July 14, 2023", "Liquidated effective November 1, 2023") on entities *already consolidated line
  by line* — the opposite of a dormant associate outside consolidation.
- **"Associated enterprises" ≠ associate.** The single occurrence of the word in these notes is Note 2.24.1 (p. 48):
  *"…payments made to associated enterprises held as liable for withholding of taxes, among others."* Indian income-tax
  terminology; it names no entity, asserts no relationship and carries no balance.

**Result:** no associate or joint-venture relationship is disclosed, so no recognised carrying value exists to
establish. **Dataset V2 is unchanged**; no observation and no nil were created.

*Limit, stated rather than buried:* the interior movement tables of Notes 2.21 and 2.22 (pp. 41–46) were not re-read;
their opening tables and closing pages were. Neither note can present a third-party equity interest, and neither is a
route by which an equity-accounted investment could be absent from the balance sheet, the investments note and the
group-structure annexure simultaneously.

## 11. `POLICY_ZERO` wording reconciliation (2026-11-07)

**The correction.** Section 9's `L-036` row, the bundle README and register §17.8 said the bridge "applies a policy zero
that the payload does not state". That is **wrong against the implemented policy**, and it has been corrected. The
sentence was inherited from register §17.3, which described the **Work Item 3** payload accurately: that payload carries
no `equityBridge` member at all — which is precisely the defect VII fixed.

**What the implementation does** (unchanged throughout):

| Layer | Statement |
|---|---|
| `VALUATION_POLICY.associatesTreatment` | `associates-treatment/1.0.0`, basis `CARRYING_VALUE`, `whenUnavailable: POLICY_ZERO` |
| `describeEquityBridge()` | emits `capitalStructure.equityBridge` with `formula`, `note`, `policyVersion`, `substitutedInputs[]`, `treatment` |
| composed payload | `treatment: POLICY_ZERO_UNAVAILABLE`; `substitutedInputs[0].treatment = POLICY_ZERO`; note: *"…substitutes zero for that term under policy associates-treatment/1.0.0. This is a policy substitution, not an issuer-reported nil…"* |
| propagation | the note reaches every derived per-share observation and `limitations[]` |

Measured on committed artifacts: `equityBridge` occurs **once** in
`VII-VALUATION-INTEGRITY-2026-11-06/artifact/assessment-payload-vii.json` and **zero** times in
`WI3-BORROWINGS-NIL-2026-11-06/artifact/assessment-payload-wi3.json`. That contrast is the whole story: accurate before
VII, stale after it.

**Wording now used**, in §9, the register (§17.8, §17.9) and the bundle README:

> The bridge continues to apply the **disclosed** `POLICY_ZERO` treatment (`POLICY_ZERO_UNAVAILABLE`,
> `associates-treatment/1.0.0`) because no supportable carrying value is available. `L-036` remains
> `PARTIALLY RESOLVED` because the underlying amount is unavailable.

**Nothing else changed:** no valuation arithmetic, no policy semantics, no confidence policy, no review timing, no
schema, no stored payload, no historical evidence. The guard test now fails if the superseded phrasing returns, and
asserts that the payload really does disclose the treatment.
