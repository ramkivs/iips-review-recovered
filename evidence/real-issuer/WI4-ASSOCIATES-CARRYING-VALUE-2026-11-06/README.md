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

**Residual review (2026-11-07).** The one gap this bundle declared — Notes 2.13–2.27 unread — is now closed: those notes
were read in both filings, and they disclose no associate, no joint venture and no equity-method balance either (§10).
The same section corrects a sentence in this README's register table that described the bridge as an *unstated* policy
zero: the payload has disclosed the `POLICY_ZERO` treatment since VII.

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
in full, all three periods**; Notes 2.6, 2.7, 2.9, 2.10, 2.11 and 2.12; **and, in the 2026-11-07 residual pass, Notes
2.13 to 2.27 in both filings — including Note 2.19 *Other income* and Note 2.25 *Related party transactions* in full, and
the group-structure annexure that follows Note 2.25** (§10).

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

- **Notes 2.13–2.27 have now been read** (2026-11-07, §10), closing the limit this bundle originally carried. Neither
  filing lists an associate or a joint venture, the only "other related party" is Infosys Foundation (a trust jointly
  controlled by KMPs), the only dormancy markers attach to subsidiaries under liquidation, and the single occurrence of
  the word "associated" is a tax phrase in Note 2.24.1. `L-036` stays open anyway, because the underlying **amount** is
  still unavailable — not because the roster is unexamined.
- **The interior movement tables of Notes 2.21 (leases) and 2.22 (employee benefits), pp. 41–46, were not re-read** in
  that pass; their opening tables and closing pages were. Neither can present a third-party equity interest.
- **Two filings, three periods.** FY2022 is read only as the comparative column of the FY2023 statement. That is a
  filed, audited comparative, not a reconstruction.
- **Nothing here says the Group has never had an associate.** It says the three periods examined recognise no
  equity-accounted interest.

## 7. Register status

| Entry | Before | After | Reason |
|---|---|---|---|
| `L-036` — associates/JV enter the bridge as a policy zero | `PARTIALLY RESOLVED` | **`PARTIALLY RESOLVED`** | Narrowed, not closed: the statements recognise no equity-accounted interest, so there is no reported value to substitute. The bridge applies zero under the **disclosed** `POLICY_ZERO` treatment — `POLICY_ZERO_UNAVAILABLE` with `associates-treatment/1.0.0`, `substitutedInputs[].treatment = POLICY_ZERO` and the bridge note carried onto every derived per-share observation (see §10). |
| `L-035` — documentary nil mapping limitation | `OPEN` | **`OPEN`** | No new nil declaration was made, so nothing here touches it. |
| `L-001` … `L-033`, `L-034` | unchanged | unchanged | Out of scope. |

## 8. File inventory

| Path | What it is |
|---|---|
| `source/fy24-*.txt`, `source/fy23-*.txt` | sixteen verbatim extracts of the filed text layer — balance sheets, Note 2.5, Note 2.5.1, the profit and loss statements and Note 1.3, plus the 2026-11-07 residual set: Note 2.19 and Note 2.25 for both filings, both group-structure annexures, and `fy24-notes-2.13-to-2.27-sweep.txt` — each headed with document, URL, page and units |
| `source/quotes.json` | the structured provenance record: **sixteen** quotes, each with document, period, locator, quoted wording, what it establishes, what it does **not** establish, and a `sha256` of its extract file; `residualReview` names the seven added on 2026-11-07 |
| `artifact/investigation.json` | the machine-readable finding: periods, sections, the three-period reconciliation, the equity-method test, eleven rejected candidate figures, the ingestion decision, the review-control reasoning, the not-examined list (with the page scope that closed it) and the `residualReview` block |
| `runs/01-checks.txt` | the digest check (9/9), the three-period reconciliation (6/6 ties), the decision fields, and the confirmed absence of a dataset and a payload |
| `runs/02-guard-test.txt` | the guard test that keeps this bundle honest — `wi4AssociatesEvidence.test.ts`, 18/18 |
| `runs/targeted-tests.txt` | `tsc --noEmit` clean and the complete investment suite, 498/498 |
| `runs/commands.txt` | how to reproduce every check, including the tsx-version prerequisite |
| `digests.json` | `sha256` and size of every committed file in this bundle (15 files), plus the decision block and an explicit empty `chain` — no dataset, no payload, no chain head, and that is the finding |

## 9. Verification actually run

| Check | Result |
|---|---|
| guard test `tests/investment/wi4AssociatesEvidence.test.ts` | **18 passed, 0 failed** |
| extract digests vs `source/quotes.json` | **16/16 match** |
| three-period reconciliation, both directions | **6/6 ties** (`runs/01-checks.txt`) |
| `tsc --noEmit` (iips-platform) | **clean** |
| complete investment suite (`tests/investment/*.test.ts`) | **498 passed, 0 failed** — the 480 pre-existing tests plus this bundle's 18 |
| committed IX package regenerates from committed inputs | **yes** — `ixAuthorizedPolicy.test.ts` rebuilds it in a separate process and requires byte equality, so the `POLICY_ZERO_UNAVAILABLE` treatment, the `REVIEW_DUE` status and the absence of any real carrying value are verified against the persisted artifacts rather than against this work item's own prose |
| persisted payload read back in a separate process | the guard test parses the committed Work Item 3 payload and the committed IX record from disk and asserts `NOT_COMPUTABLE / NOT_REPORTED`, `POLICY_ZERO_UNAVAILABLE`, `REVIEW_DUE`, `clockStart 2024-03-31`, and that the V2 row is still the ₹1,000 crore schema demonstration |

Environment note, recorded because it looks like a regression and is not one: with `tsx` pinned at 4.7.0 the
repository's own script modules fail to load (`__dirname` in ESM scope), taking 15 unrelated test files down with them.
With `tsx >= 4.20` the whole suite passes. This predates the work item and nothing in it was changed to work around the
older loader.

## 10. Residual review and `POLICY_ZERO` wording (2026-11-07)

### 10.1 Notes 2.13–2.27, read at last

Both filings are digitally typeset PDFs with a complete text layer — not scans — so pages 31–57 were read in full through
a full-document reader of the same PDFs, page-anchored to the printed page numbers. Notes 2.19 and 2.25 are transcribed
in `source/`; the note-by-note sweep is `source/fy24-notes-2.13-to-2.27-sweep.txt`.

| Note | Pages | Associates / JV content |
|---|---|---|
| 2.13–2.18 | 31–38 | none |
| **2.19 Other income, net** | 39–40 | **none** — interest, FVOCI interest, FVTPL gains, exchange, tax-refund interest, miscellaneous; total 4,711 (2,701) |
| 2.20–2.24 | 40–49 | none |
| **2.25 Related party transactions** | 50–54 | **none** — subsidiaries, trusts (incl. Infosys Foundation, "Trust jointly controlled by KMPs"), KMP compensation 130 (127) |
| **Group-structure annexure** | 52–54 | **none** — no associates block, no joint-ventures block |
| 2.26–2.27 | 55–57 | none |

Three distinctions applied: **relationship ≠ classification** (the only other related party is a trust, not an
investee); **dormancy ≠ carrying value** (the "(22) Under liquidation" markers are subsidiaries already consolidated line
by line); **"associated enterprises" ≠ associate** (Note 2.24.1's phrase is income-tax terminology — it names no entity
and carries no balance).

**Dataset V2 unchanged; no observation, no nil, no value.**

### 10.2 The wording that was wrong

The `L-036` row above originally said the bridge "applies a policy zero, and the payload still does not say so". That
was inherited from register §17.3, which described the **Work Item 3** payload correctly — that payload has no
`equityBridge` member at all, which is the defect VII fixed. Since VII the payload states the treatment:
`treatment: POLICY_ZERO_UNAVAILABLE`, `substitutedInputs[0].treatment = POLICY_ZERO`, policy
`associates-treatment/1.0.0`, and the note *"This is a policy substitution, not an issuer-reported nil"* carried onto
every derived per-share observation. Measured on committed artifacts: `equityBridge` appears **once** in the VII payload
and **zero** times in the WI3 payload.

Corrected wording, now used here and in register §17.8/§17.9:

> The bridge continues to apply the **disclosed** `POLICY_ZERO` treatment (`POLICY_ZERO_UNAVAILABLE`,
> `associates-treatment/1.0.0`) because no supportable carrying value is available. `L-036` remains
> `PARTIALLY RESOLVED` because the underlying amount is unavailable.

No arithmetic, policy, confidence, review timing, schema, payload or historical evidence was touched to make this
correction; the guard test now fails if the superseded phrasing returns.

## 11. Reproduction

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
