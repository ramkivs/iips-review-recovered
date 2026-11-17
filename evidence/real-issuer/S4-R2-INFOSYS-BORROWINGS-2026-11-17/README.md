# S4-R2 — Infosys borrowings: the transcription, the assessment, and the reusable capability (2026-11-17)

**Work item:** `S4-R2` — *"Transcribe Infosys' missing borrowings lines"*, recorded in
`IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` §"remaining actions" with the acceptance criterion *"Technology's
`EV_EBITDA` `AVAILABLE`, or a `NOT_REPORTED` recorded at source with its reason"*.

**Disposition:** **S4-R2 CLOSED, on the assessment path, with one named remainder** (the derivation-based coverage row,
§7 below). No valuation formula, threshold, weight, policy version, sector classification or withholding rule was
changed. No new issuer was admitted. No source document or dataset was redistributed. Nothing was installed on any
host.

**What this bundle is.** A complete replacement **input** for the already-admitted issuer Infosys Limited
(`IN:CIN:L85110KA1981PLC013115`), transcribing the borrowing block the Stage 3 bundle never carried, plus the recorded
before/after of the assessment that consumes it. `REL-1-INFOSYS-2026-11-06` is **untouched**: its `periods.csv` still hashes to
`e2cdba2042a55fc3352e85b8384e014f669e1472deb9011e7be2babd4fbc745c` and its `roster.json` to
`426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4` — the same digest this bundle's `roster.json`
carries, because the identity side did not move either (see `digests.json`) — and the test suite asserts it still
declares no borrowings at all.

---

## 1. What was actually missing, verified against this repository on 2026-11-17

The Stage 4 measurement record (`IID-STAGE4-COVERAGE-MEASUREMENT-EVIDENCE-2026-11-14.md` §3.2) said the borrowings were
"never transcribed — ABSENT in all three periods". Re-checked rather than assumed, against the bundle in `main`:

| Period | `LONG_TERM_BORROWINGS` | `SHORT_TERM_BORROWINGS` | `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | `PREFERENCE_CAPITAL` |
|---|---|---|---|---|
| FY2024 (2024-03-31) | column absent | column absent | column absent | column absent |
| FY2023 (2023-03-31) | column absent | column absent | column absent | column absent |
| FY2022 (2022-03-31) | column absent | column absent | column absent | column absent |

`REL-1`'s `periods.csv` carries 33 of the closed line items and none of these four. The consequence chain, re-run at
this head rather than quoted: `capitalStructure.netDebt → MISSING/NOT_REPORTED`; `grossDebt → MISSING/NOT_REPORTED`;
`EV_EBITDA → applicable: false, "CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable"`; `DCF_FCFF` applicable but its
per-share figure `NOT_COMPUTABLE` (`blocked by netDebt`); `valuation.intrinsic = null`. `EBITDA`, `CASH` and
`LEASE_LIABILITIES` were present throughout, which is why the defect is a transcription gap and not a measurement one.

## 2. What the authorised source supports — per period, and no further

The authorised material for this issuer is the audited consolidated Ind AS statements already in this repository:
`INFY-INDAS-CONSOL-FY24` (filed 2024-04-18) and `INFY-INDAS-CONSOL-FY23` (filed 2023-04-13). The relevant extract is
committed at `evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/source/consol-fy24-note-2.11-liquidity-risk.txt`
(Note 2.11 *Financial instruments → Financial risk management → Liquidity risk*), with the per-quote metadata in
`source/quotes.json`, including the SHA-256 of the quoted wording.

**FY2024 — a declared nil, in the filer's own words:**

> "The Group has no outstanding **borrowings**." *(verbatim; the surrounding sentence is "The Group's principal sources
> of liquidity are cash and cash equivalents and the cash flow that is generated from operations. The Group has no
> outstanding borrowings. The Group believes that the working capital is sufficient to meet its current
> requirements.")*

The same note's contractual-maturity table lists only trade payables and other financial liabilities — no borrowing
maturity — and the balance sheet carries no borrowings caption, which is corroboration, not the basis. The declaration
is recorded as `NIL_BY_DISCLOSURE` for the three **borrowing** components, because the sentence speaks about borrowings
as a whole and a component of a class the filer says is empty is nil.

**Preference capital (FY2024) — a cross-scope declared nil:**

> "The Company has only one class of shares referred to as equity shares having a par value of ₹5/-."

This sentence speaks for **the Company** (standalone), while the row is **consolidated**, so it is recorded only with an
explicit `acceptedBy=WI5-preference-capital-review` acknowledgement — the mapping the `L-035` grammar exists to make
visible. It is included in this bundle because the enterprise-to-equity conversion requires the term
(`equityValueFromEnterprise` refuses on `preferenceCapital` otherwise): with the three borrowing components alone the
bridge still refuses and `EV_EBITDA` remains unvalued. That was verified, not assumed — see §5.

**FY2023 and FY2022 — `NOT_REPORTED`, deliberately.** No disclosure for those two balance-sheet dates was transcribed
in this pass, and the FY2024 sentence is a statement about the Group as at **2024-03-31**. Projecting it backwards over
two years would be an inference dressed as a transcription, and the grammar has no way to record "inferred". Those
cells are left **blank**, which the ingestion grammar stores as `MISSING: NOT_REPORTED` — explicitly absent, never zero,
with no quoted wording attached, because no sentence for those dates was read. This is why the file's FY2023/FY2022
rows carry the four columns and empty cells in them.

**No figure in this bundle is estimated, derived, imputed or carried from another issuer.** The three borrowing cells
are the filer's nil, not a number; nothing was transcribed from a summary, an aggregator or a prior work item.

## 3. The cells written

`ingest-input/periods.csv` is `REL-1`'s file with four columns appended (`LONG_TERM_BORROWINGS`,
`SHORT_TERM_BORROWINGS`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`, `PREFERENCE_CAPITAL`) and the FY2024 row populated:

| Period | Cell text | Interpretation |
|---|---|---|
| FY2024 | `NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.` × 3 | declared nil, bound to the balance sheet, the borrowings class and the consolidated group |
| FY2024 | `NIL[section=BS;class=PREFERENCE_SHARE_CAPITAL;scope=STANDALONE_COMPANY;acceptedBy=WI5-preference-capital-review]: The Company has only one class of shares referred to as equity shares having a par value of ₹5/-.` | declared nil, cross-scope, acknowledged |
| FY2023, FY2022 | *(empty)* | `MISSING: NOT_REPORTED` |

The **bound** form is used rather than the legacy `NIL: <wording>` form: it is legal under every dataset schema
(`L-035`), it ties the quoted sentence to the statement section and the line-item class the grammar knows, and it
records who accepted the one cross-scope mapping. `roster.json` is byte-identical to `REL-1`'s, so the identity side of
the admission is exactly what Stage 2 published.

Units and period semantics come from the row, unchanged: `source_scale=CRORE`, `period_type=ANNUAL`,
`statement_scope=CONSOLIDATED`, `basis=AS_FILED`, and the filing reference and date travel on every observation.

## 4. Before / after — the dataset and the assessment

| | before (`REL-1` input) | after (this bundle) |
|---|---|---|
| dataset version | `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83` | `sha256:69bbc14e99cea0e24be568fa923971e7c0536009ab19056f09bf272d437c6fe2` |
| assessment payload SHA-256 | `a4fa5781bf17a10cca8bb9d67ef83b3736df573b73674b8ca9dca33c7dd4ae2e` | `925b403622c9b667152effa64539036a8cbcea40229ef2b36c7f148c210e471e` |
| `capitalStructure.grossDebt` | `MISSING / NOT_REPORTED` | `PRESENT` = ₹8,359 crore (lease liabilities only) |
| `capitalStructure.netDebt` | `MISSING / NOT_REPORTED` | `PRESENT` = **−₹19,342 crore** |
| `preferenceCapital` | `MISSING / NOT_REPORTED` | `NIL_BY_DISCLOSURE` |
| `EV_EBITDA` | **withheld** — `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable` | **applied**, mid ₹1,133.95 per share |
| `DCF_FCFF` per-share | `NOT_COMPUTABLE` — `blocked by netDebt` | ₹990.75 |
| `PE_RELATIVE` | ₹1,270.43 | ₹1,270.43 *(unchanged)* |
| `valuation.intrinsic` | `null` | 875.34 / **1,088.97** / 1,399.81 |
| `EV_REVENUE` | withheld — `MANDATORY_METRIC_MISSING: TM_NRR, TM_RECURRING_REVENUE_PCT` | **unchanged** — still withheld, for its own reason |

Two independent cross-checks, neither of which this work item set up:

- the net debt of **−₹19,342 crore** is the figure `IIPS_V3_IID_WI3_BORROWINGS_NIL_2026-11-06.md` published on
  2026-11-06 from the same filing, computed then through a different dataset assembly;
- the intrinsic range **₹875.34 / ₹1,088.97 / ₹1,399.81** is the range that same record published.

That the same three numbers fall out of today's code, today's admitted bundle and today's period selection is the
strongest available evidence that this transcription is the one the filing supports and that nothing else moved.

`marginOfSafety.refusal` remains `NO_PRICE_OBSERVATION` in this bundle: `REL-1`'s input carries no `prices.json`, and
this work item adds no price observation. A margin of safety is therefore not asserted here in either state.

## 5. Why four cells and not two — measured, not argued

Run with the three borrowing components declared nil and `PREFERENCE_CAPITAL` left empty, on the same inputs:

- `capitalStructure.netDebt` = `PRESENT` (−₹19,342 crore) — the debt side is fixed by the three;
- `equityValueFromEnterprise` still refuses: `preferenceCapital` is `MISSING`;
- `EV_EBITDA`: `applicable: true` but `output.perShareMid = null`; `valuation.intrinsic = null`.

So the borrowings ask alone would have closed the *statement* gap and left the *valuation* blocked one term later.
Both blockers sit in the same two sentences of the same note, and both were already established by prior work items
(WI-3 for the borrowings, WI-5 for the share class). Recording one and not the other would have produced a document
that says `S4-R2` is closed beside a payload that still publishes no enterprise-value figure.

## 6. The reusable capability — and what was verified about it

`S4-R2` is not an Infosys patch: nothing in the product knows this issuer. The capability verified here is the
**grammar plus the aggregation**, and it is exercised for issuers that do not exist by
`iips-platform/tests/investment/s4r2BorrowingsReuse.test.ts`:

| Property | How it is proved |
|---|---|
| complete borrowing data is ingested and consumed | a synthetic issuer with four numeric components resolves gross debt 13,000, net debt −22,000 crore and an `EV_EBITDA` per-share value |
| a missing long-term borrowing stays missing | blank cell in every period ⇒ `MISSING/NOT_REPORTED`, gross and net debt `MISSING`, `EV_EBITDA` withheld `CAPITAL_STRUCTURE_INCOMPLETE` |
| a missing short-term borrowing stays missing | the same, for the other component |
| a missing value is never a zero | the observation carries `value: null`; the derived `NET_DEBT` is *absent* rather than `0 + ST − cash`; the number a silent zero would have produced is asserted absent |
| a component from an older period is a period mismatch, not an absence | latest-period blank with an older-period value ⇒ `NOT_COMPUTABLE / PERIOD_MISMATCH`, with the note naming each component's period end |
| invalid units or periods are refused | unknown `source_scale` ⇒ `INVALID_SOURCE_SCALE`, exit 1, nothing published; `fiscal_year` contradicting `period_end` ⇒ `FISCAL_YEAR_PERIOD_MISMATCH`, exit 1; under `--allow-errors` the row is withheld and the rest is published |
| a new issuer needs no issuer-specific code | two synthetic issuers in one bundle, one with declared nils and one with numbers, both assessed; plus a source scan asserting the six borrowing/derivation/aggregation modules name no issuer |
| existing assessments do not regress | the pre-`S4-R2` dataset is *reconstructed* by dropping the four columns, and Marico's and KEC's `fundamentals`, `valuation`, `quality`, `confidence`, `completeness`, `risk`, `moat`, `dividends` and `limitations` blocks are asserted **deep-equal** between the two datasets |

One product change was needed, and it is not issuer-specific: **`FISCAL_YEAR_PERIOD_MISMATCH`**
(`iips-platform/src/investment/ingestion/builder.ts`). Before it, a row claiming `fiscal_year=2023` for a period
ending `2024-03-31` was ingested silently — the exact slip a hand transcription makes — and stored as a period that is
two years at once. The check is the label's own definition (`fiscalYearLabel`: the year the fiscal year ends), applied
generically: an annual row must end inside its labelled year; a quarterly or TTM row is labelled by the year its fiscal
year ends, which is the period-end year or the year after it (KEC's Q1 FY27 ending 2026-06-30 is the real instance).
All 41 committed period rows pass it, so no admitted dataset changes.

## 7. The one named remainder — coverage still reports `EV_EBITDA` withheld

`coverage-report.json` (the dataset-capability statement, `measureCoverage`) **still** reports Technology `G2_PARTIAL`
with `EV_EBITDA` `WITHHELD / STATEMENT_INPUT_MISSING: [NET_DEBT]` after the correction. That is not an oversight and it
is not the same question:

- coverage asks whether the **line-item derivation set** can produce `NET_DEBT` for some issuer-period. `derive.ts`
  accepts only `PRESENT` inputs, deliberately: "an unreported input is never silently zero". A declared nil is not a
  number, so the derivation declines — even though the financing position is fully determined.
- the **assessment** resolves net debt through the capital-structure aggregation, which admits a declared nil as the
  filer's statement (decision D-2). That is the path the payload publishes, and it now computes.

Making coverage agree would mean teaching `derive.ts` to treat `NIL_BY_DISCLOSURE` as zero inside derivations — a
change to derivation semantics that reaches `NET_DEBT`'s consumers (leverage in W07, dividends, risk, disposition) and
that the register freezes against `W07`. It is a **measurement-semantics decision**, not a data correction, so it is
recorded here and **not taken**. The exact consequence: a reader of the coverage report alone still sees a withheld
method for a dataset whose assessment now publishes the value; the coverage figure **understates** the capability and
does not overstate it. `S4-R4`/`S4-R5` already record the neighbouring class of divergence (existential availability
vs latest-instant usability); this is its derivation-aggregation sibling and should be decided with them.

## 8. Governance

| Item | State |
|---|---|
| O3 admission | unchanged. Same three admitted issuers; no fourth. This bundle is a corrected input for an **already admitted** issuer, from filings that admission already covers. |
| `REL-1-INFOSYS-2026-11-06` | **byte-identical** to its state on `main`; not rewritten, not moved, not re-digested. |
| W05 authorisation records | unchanged, and **not cited for this bundle**. The records admit specific input bytes by digest; the corrected bytes are not among them, and publication of them is the Principal's act, not this work item's. The dataset here is built without `--authorization-record`, exactly as the existing Stage 4 candidate was. |
| Source rights | unchanged. No source document, extract, page text or redistributable artefact is added; the four cells quote 24 words of a public filing that the repository already quotes and hashes. |
| Dataset class | `OPERATOR_SUPPLIED` / `OPERATOR_ASSERTED`, unchanged; `licence` reads as it did; `NOT_AUTHORISED` redistribution, unchanged. |
| Host | nothing installed, nothing verified on the Windows host. **The new dataset version is a repository-side candidate**; installing it is the operator's step, as with `S4-R3`'s candidate. |
| Valuation | no formula, threshold, weight, confidence cap, policy constant or policy version changed; `EV_REVENUE` still withheld; no investment conclusion, verdict, target price or recommendation is stated anywhere in this bundle. |
| IPD | not written, not read, not modified. |

**What is explicitly not claimed.** Not that the dataset was installed or host-verified. Not that FY2023/FY2022
borrowings were nil — they are `NOT_REPORTED`. Not that coverage reports `EV_EBITDA` available. Not that the margin of
safety is computable (there is no price observation in this input). Not that any of these figures say anything about
the value of the company; the payload's own limitations and the 950-day staleness flag are unchanged and travel with
it.

## 9. Reproduction

```bash
# the corrected input, ingested beside the two other admitted bundles
tsx iips-platform/src/investment/cli/ingest.ts \
  --input evidence/real-issuer/S4-R2-INFOSYS-BORROWINGS-2026-11-17/ingest-input \
  --input evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/ingest-input \
  --input evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input \
  --dataset-dir <tmp>/dataset --now 2026-11-14T00:00:00.000Z
#   ⇒ datasetVersion sha256:69bbc14e99cea0e24be568fa923971e7c0536009ab19056f09bf272d437c6fe2

# the whole capability, all seven properties, on synthetic issuers plus this one
tsx --test iips-platform/tests/investment/s4r2BorrowingsReuse.test.ts
```

`digests.json` records the SHA-256 of both input files (`periods.csv` `97d7cf7ca366a049832756b59c6c5396f5166b10ed6ba5f54e88fe2f5260fc83`,
`roster.json` `426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4`), of `REL-1`'s two files (to show they
did not move), of both dataset versions, of both assessment payloads and of both `assessCompany` input digests
(`before` `sha256:44920743672caf70dee2864683108945d9abc64c4d6203854647ff33729ad8cc`, `after`
`sha256:9a2b0fd24d734d955a0f6d37dd421d2ef77609bbb8610e4055ab556172b5f46a`). `runs/` holds the ingestion log, the two payload slices and the
coverage row in both states.
