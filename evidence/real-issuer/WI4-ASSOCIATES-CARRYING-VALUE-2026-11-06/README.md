# WI-4 — Associates and joint ventures: what the audited consolidated statements actually say (2026-11-06)

**Issuer:** Infosys Limited · CIN `L85110KA1981PLC013115` · ISIN `INE009A01021`.
**Line item under test:** `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` (dataset schema V2, balance sheet, instant, INR).
**Question:** do the audited consolidated Ind AS statements disclose a carrying value for investments in associates and
joint ventures — for FY2024, FY2023 or FY2022 — that can be reported as a V2 observation?

**Answer:** **no.** There is nothing to report, because in all three periods the Group recognises no equity-accounted
interest. The answer is not "the figure is hard to find" and not "the figure is zero": it is that the audited
statements contain **no such asset at all**, and an absent caption is not a nil.

**Consequence:** **no dataset was written, no observation was created, no nil was declared, and no payload member
changed.** The valuation bridge keeps `POLICY_ZERO_UNAVAILABLE`; the review clock keeps `REVIEW_DUE`; `L-036` stays
`PARTIALLY RESOLVED`; `L-035` stays `OPEN`.

---

## 1. What was examined

| Document | Period covered | Statements dated | Auditor |
|---|---|---|---|
| `consol-fy24-annual-finstatement.pdf` (ref `INFY-INDAS-CONSOL-FY24`) | FY2024 **and FY2023** | 2024-04-18 | Deloitte Haskins & Sells LLP, FRN 117366W/W-100018 |
| `consol-fy23-annual-finstatement.pdf` (ref `INFY-INDAS-CONSOL-FY23`) | FY2023 **and FY2022** | 2023-04-13 | Deloitte Haskins & Sells LLP, FRN 117366W/W-100018 |

Two filings cover the three required periods because each carries a full comparative column. Both are audited
consolidated Ind AS statements, in **₹ crore**, and both are the issuer's own filing — the same document family the
Work Item 3 nil declarations already rest on, so the evidence chain stays on one basis.

Sections read: consolidated balance sheet and statement of profit and loss (both documents, both columns); Note 1.3
*basis of consolidation*; **Note 2.5 *Investments* in full, all three periods**; **Note 2.5.1 *Details of investments*
in full, all three periods**; Notes 2.6, 2.7, 2.9, 2.10, 2.11 and 2.12 for the FY2024 statement. Notes 2.13–2.27 could
not be machine-read (§6 says why that does not change the answer, and what it leaves open).

## 2. Three structural tests, all negative

An equity-accounted interest cannot be recognised without leaving a mark in three places. None of them has a mark.

**(a) The balance sheet has no equity-method caption.** Ind AS 1 para 54(e) requires *investments accounted for using
the equity method* to be a separate line item. The audited balance sheet carries exactly two investment captions, both
cross-referenced to Note 2.5, and every other caption in both asset blocks is accounted for:

| At | Non-current `Investments` | Current `Investments` | Filed block totals |
|---|---|---|---|
| 2024-03-31 | **11,708** | **12,915** | 48,382 / 89,432 |
| 2023-03-31 | **12,569** | **6,909** | 54,935 / 70,881 |
| 2022-03-31 | **13,651** | **6,673** | 50,700 / 67,185 |

**(b) The investments note reconciles to the rupee, and every row is an Ind AS 109 category.** Note 2.5 decomposes both
captions exhaustively — amortised cost, fair value through other comprehensive income, fair value through profit or
loss — and ties both ways in each period:

| Period | Non-current + current | = Note 2.5 total | Amortised cost + FVOCI + FVTPL | = Note 2.5 total |
|---|---|---|---|---|
| FY2024 | 11,708 + 12,915 = **24,623** | 24,623 | 1,759 + 19,620 + 3,244 = **24,623** | 24,623 |
| FY2023 | 12,569 + 6,909 = **19,478** | 19,478 | 1,920 + 16,012 + 1,546 = **19,478** | 19,478 |
| FY2022 | 13,651 + 6,673 = **20,324** | 20,324 | 2,122 + 16,007 + 2,195 = **20,324** | 20,324 |

An exhaustive decomposition that ties to the filed totals leaves no room for an unreported fifth component. There is no
equity-method row and no associates/joint-venture row in any of the six columns.

**(c) The statement of profit and loss has no share-of-associates line.** Ind AS 1 para 82(c) and Ind AS 28 require a
separate *share of profit/(loss) of associates and joint ventures* line, and a share of their other comprehensive
income. Neither appears, in any of the three years. The OCI section lists exactly five lines — defined-benefit
remeasurement, equity instruments through OCI, cash-flow hedges, foreign-currency translation, fair-value changes on
investments — and none of them is an equity-accounted share.

Corroborating: Note 1.3 describes consolidation of *the Company, its controlled trusts and its subsidiaries*, on a
line-by-line basis with intra-group elimination, and points to Note 2.25 for the entity list. It names no associate, no
joint venture, and describes no equity method.

## 3. The figures that look like candidates, and why each one fails

This is the part that matters, because every one of these is a real, audited, quotable number.

| Candidate | Amount (₹ crore) | Why it is **not** the line item |
|---|---|---|
| Non-current `Investments`, FY2024 | 11,708 | Aggregate financial instruments — government and tax-free bonds, NCDs, government securities, target-maturity and other funds, minority preference/equity stakes. Fully decomposed by Note 2.5; no equity-accounted component. |
| Total `Investments`, FY2024 | 24,623 | Portfolio total including current treasury (commercial paper 4,830, CDs 3,043, liquid funds 2,615). Not an associates/JV carrying amount. |
| Total `Investments`, FY2023 / FY2022 | 19,478 / 20,324 | Same objection. |
| Named holdings total, FY2024 / FY2023 / FY2022 | 404 / 365 / 377 | Note 2.5.1's minority stakes and fund interests — Whoop 60, Nivetti 31, Ideaforge equity 113, Global Innovation & Technology Alliance 2, Stellaris 84, House Fund II 107, House Fund III 7, and nil-valued Airviz / Merasport / Tidalscale. All carried at fair value; **fair-value measurement is incompatible with the equity method**, and none is described as an associate or joint venture. |
| Ideaforge equity stake, FY2024 | 113 | A listed minority holding of 16,47,314 shares at FVOCI. No significant influence asserted. |
| Total assets / total equity, FY2024 | 137,814 / 88,461 | Issuer-level aggregates. |
| Amortised cost / FVOCI / FVTPL, FY2024 | 1,759 / 19,620 / 3,244 | Measurement categories that cut across asset classes; not an investee interest. |
| Form AOC-1 figures | — | Not part of the audited consolidated statements, and its investee-net-asset and ownership data are barred from this line item in any case. |

`artifact/investigation.json` records all eleven candidates with the same reasoning, so the rejection is auditable
rather than a paragraph of prose.

## 4. Why this is not a nil declaration

Work Item 3 could declare borrowings nil because the filing says so in words: *"The Group has no outstanding
borrowings."* No sentence of that kind exists for associates and joint ventures. What exists is an **omission** — a
caption that is not there. The nil grammar requires the filer's own wording, the filing reference and the period; it
cannot be satisfied by the absence of a line, and this line item is a reported (non-derived) item whose value must come
from the statement, not from arithmetic on the statement's silences.

Treating the omission as zero would also be wrong in substance. Zero is a *measurement* of a recognised interest that
has been written down; "no interest is recognised" is a **different fact about the balance sheet**, and only the filing
can convert one into the other.

## 5. What this work item did and did not change

| | Status |
|---|---|
| V2 dataset written | **no** |
| V2 observation for the line item | **no** |
| Nil declared | **no** |
| V1 backfilled | **no** |
| Schema, XBRL map, line items, bridge, review policy, confidence policy | **untouched** |
| Prior evidence bundles (REL-1, WI2, WI3, VII, VIII, D2, D3, IX) | **untouched** |
| Committed Infosys payload | **byte-identical** — regenerating it reproduces the same digest (guarded by `ixAuthorizedPolicy.test.ts`) |
| Valuation bridge treatment | `POLICY_ZERO_UNAVAILABLE`, unchanged |
| Review control | `REVIEW_DUE` at 950 days beyond `2024-03-31`, unchanged |

The review control stays on. It is an authorised requirement keyed to the age of the source evidence, not a flag that
switches off once someone has looked; this work item *is* the look, and its result is now on the record. Nothing found
here is an implementation defect in the control, so there is no basis to touch the clock, the 180 days or the flag
semantics.

## 6. Limits of this bundle

- **Notes 2.13–2.27 were not machine-read** (the PDF text extraction available here returns the first 30 pages, through
  Note 2.12.4). That includes Note 2.25 *Related party transactions* (p. 50), which lists the Group's entities. The
  conclusion does not depend on it: an equity-accounted interest must appear in the balance sheet, in profit or loss and
  in the investments note, and all three are complete and reconcile. But a related-party roster naming a dormant
  associate would be a reason to **keep `L-036` open**, not to close it — and it is kept open.
- **Two filings, three periods.** FY2022 is read only as the comparative column of the FY2023 statement. That is a
  filed, audited comparative, not a reconstruction.
- **Nothing here says the Group has never had an associate.** It says the three periods examined recognise no
  equity-accounted interest.

## 7. Register status

| Entry | Before | After | Reason |
|---|---|---|---|
| `L-036` — associates/JV enter the bridge as an undisclosed policy zero | `PARTIALLY RESOLVED` | **`PARTIALLY RESOLVED`** | Narrowed, not closed: the statements recognise no equity-accounted interest, so there is no reported value to substitute; the bridge still applies a policy zero, and the payload still does not say so. |
| `L-035` — documentary nil mapping limitation | `OPEN` | **`OPEN`** | No new nil declaration was made, so nothing here touches it. |
| `L-001` … `L-033`, `L-034` | unchanged | unchanged | Out of scope. |

## 8. File inventory

| Path | What it is |
|---|---|
| `source/fy24-*.txt`, `source/fy23-*.txt` | nine verbatim extracts of the filed text layer — balance sheets, Note 2.5, Note 2.5.1, the profit and loss statements, and Note 1.3 — each headed with document, URL, date, page and units |
| `source/quotes.json` | the structured provenance record: nine quotes, each with document, period, locator, quoted wording, what it establishes, what it does **not** establish, and a `sha256` of its extract file |
| `artifact/investigation.json` | the machine-readable finding: periods, sections, the three-period reconciliation, the equity-method test, eleven rejected candidate figures, the ingestion decision, the review-control reasoning, and the not-examined list |
| `runs/01-checks.txt` | the digest check (9/9), the three-period reconciliation (6/6 ties), the decision fields, and the confirmed absence of a dataset and a payload |
| `runs/02-guard-test.txt` | the guard test that keeps this bundle honest — `wi4AssociatesEvidence.test.ts`, 18/18 |
| `runs/targeted-tests.txt` | `tsc --noEmit` clean and the complete investment suite, 498/498 |
| `runs/commands.txt` | how to reproduce every check, including the tsx-version prerequisite |
| `digests.json` | `sha256` and size of every committed file in this bundle (15 files), plus the decision block and an explicit empty `chain` — no dataset, no payload, no chain head, and that is the finding |

## 9. Verification actually run

| Check | Result |
|---|---|
| guard test `tests/investment/wi4AssociatesEvidence.test.ts` | **18 passed, 0 failed** |
| extract digests vs `source/quotes.json` | **9/9 match** |
| three-period reconciliation, both directions | **6/6 ties** (`runs/01-checks.txt`) |
| `tsc --noEmit` (iips-platform) | **clean** |
| complete investment suite (`tests/investment/*.test.ts`) | **498 passed, 0 failed** — the 480 pre-existing tests plus this bundle's 18 |
| committed IX package regenerates from committed inputs | **yes** — `ixAuthorizedPolicy.test.ts` rebuilds it in a separate process and requires byte equality, so the `POLICY_ZERO_UNAVAILABLE` treatment, the `REVIEW_DUE` status and the absence of any real carrying value are verified against the persisted artifacts rather than against this work item's own prose |
| persisted payload read back in a separate process | the guard test parses the committed Work Item 3 payload and the committed IX record from disk and asserts `NOT_COMPUTABLE / NOT_REPORTED`, `POLICY_ZERO_UNAVAILABLE`, `REVIEW_DUE`, `clockStart 2024-03-31`, and that the V2 row is still the ₹1,000 crore schema demonstration |

Environment note, recorded because it looks like a regression and is not one: with `tsx` pinned at 4.7.0 the
repository's own script modules fail to load (`__dirname` in ESM scope), taking 15 unrelated test files down with them.
With `tsx >= 4.20` the whole suite passes. This predates the work item and nothing in it was changed to work around the
older loader.

## 10. Reproduction

```bash
cd evidence/real-issuer/WI4-ASSOCIATES-CARRYING-VALUE-2026-11-06
python3 - <<'PY'   # re-derive the reconciliation from the filed figures
...                # see runs/commands.txt §2
PY
cd ../../../iips-platform && npx tsx --test tests/investment/wi4AssociatesEvidence.test.ts
```

The test asserts, among other things, that each committed extract hashes to the value in `quotes.json`, that the
three-period reconciliation holds arithmetically, that the investigation records `performed: false` for ingestion, and
that no V2 observation for `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` exists in the repository's Infosys evidence.
Edit a filed number in an extract and it fails; invent a value and it fails.
