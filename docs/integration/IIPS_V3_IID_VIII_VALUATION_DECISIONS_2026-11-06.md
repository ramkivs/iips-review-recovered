# VIII — Valuation decisions: the `L-034` cap factor and the `L-036` carrying value (2026-11-06)

**Issuer in evidence:** Infosys Limited · CIN `L85110KA1981PLC013115` · ISIN `INE009A01021` (the only real issuer in
scope).
**Baseline:** `origin/main` at `e31fbc59d8597af1b834a994d7adab47cf62678c` (PR #495). *The commit named in the work
request, `cba812b0…`, is not present in this clone — `git rev-list --count --all` returns `1`, so history begins at
the merge commit above. Every statement below is made against `e31fbc5`, and the substitution is recorded here rather
than silently swapping one baseline for another.*
**Scope of this document:** a **decision package**. It changes no policy value, no schema, no formula, no weight, no
threshold, no payload and no stored artifact. Its only executable part is
`iips-platform/scripts/viii-valuation-decisions.ts`, which reproduces the baseline and computes scenario arithmetic.

**What this package is asked to settle.**

| Entry | Register status on this baseline | What is undecided |
|---|---|---|
| `L-034` | `OPEN` (§17.1) | the cap's **magnitude**, and whether multiple triggering policy defaults yield one cap or several |
| `L-036` | `PARTIALLY RESOLVED` (§17.3) | the associates/JV **carrying value** — the dataset schema cannot carry it, so the understatement is unquantified |

**Neither status changes because of this document.** `L-034` remains `OPEN`; `L-036` remains `PARTIALLY RESOLVED`.

---

## 1. Dependency and authority assessment (deliverable 1)

### 1.1 Implementation dependency

**There is no implementation dependency between `L-034` and `L-036`, and there is a real publication dependency
between them.** Both statements are needed; neither cancels the other.

| | `L-036` (carrying value) | `L-034` (cap factor) |
|---|---|---|
| Code touched by a fix | `contracts/lineItems.ts` (one item), `ingestion/builder.ts`/`xbrl.ts` (mapping), `assessment/capitalStructure.ts` line 197 (hard-code → lookup) | `assessment/confidence.ts` (one loop condition) + `assessment/policy.ts` (one number) |
| Payload member | `fundamentals.capitalStructure.{associatesAndJV, equityBridge}` — **both already exist** | `confidence.{assumptionCaps, caps, formula, combined}` — **all already exist** |
| Can a fix move the other's output? | **Yes, indirectly and only through confidence**: a real carrying value moves intrinsic → moves the method spread → moves `modelConfidence` → moves `combined` | **No.** Confidence is downstream of valuation; no valuation member reads confidence |
| Sequencing needed to implement? | **no** | **no** |
| Sequencing needed to *record* the outcome? | **yes** — see below | **yes** — see below |

The two fixes are separable files with separable tests, exactly as §17's VII work item established. What is *not*
separable is a number: a published Infosys confidence cannot be recorded as final until both decisions are known,
because `combined = round4((0.6·data + 0.4·model(**) ) × Π caps × Π policy-default factor)` and the carrying value
feeds the term marked `(**)`. The factors are multiplicative and the middle term is not fixed.

**Consequence for sequencing the work, stated as an instruction rather than a preference:** implement in either
order, but do not re-record a "final" Infosys confidence or a "final" intrinsic range until both decisions exist. Any
figure recorded earlier must carry the decision state it was computed under — which is what `confidence.formula`,
`assumptionCaps[].applied` and `capitalStructure.equityBridge.treatment` already do.

### 1.2 The four authorities (they are not the same authority)

| # | Decision | What exactly is being decided | Owner named in the governance record | Legitimate to decide in this work item? |
|---|---|---|---|---|
| **A1** | **Policy-value decision** | the numeric factor for `POLICY_DEFAULT_WACC` / `POLICY_DEFAULT_MULTIPLE`, and its granularity | **the operator** (the single user) — R-17 | **no** — a number without an authoritative basis is fabrication |
| **A2** | **Dataset/schema decision** | whether `IIPS_INVESTMENT_FUNDAMENTALS_V1` gains an associates/JV line item, and the schema version bump | **the operator** in the interim IRR-only arrangement; **IPD ingestion** is the target owner (design D-2 / §1.5) | **no** — and IPD is explicitly out of scope for this work item |
| **A3** | **Repository-implementation decisions** | how the accepted A1/A2 values are wired, and what the regression proves | **IRR** (analysis owner); implementation needs no separate "authority" — R-17 dropped "authority to implement" | **partly** — this package *proposes* the implementation; it does not perform the policy or schema change |
| **A4** | **Evidence acceptance** | whether a specific quoted carrying value is admissible as the issuer's associates/JV figure | **the operator** — "recommended; confirm or amend" (R-17) | **no** — no candidate value has been located to accept (see §2.1) |

### 1.3 Does R-13 authorisation, or a PA determination, apply?

**No, to both — and the distinction matters.**

- **A "PA" (Program Authority) determination does not exist in IID scope.** R-17 (design lines 1458–1472) replaced
  "Program Authority", "PA determination", "PA act" and "DECISION REQUIRED" with "the operator (the single user)" and
  "recommended; confirm or amend", and dropped "authority to implement" outright. Applying PA vocabulary to `L-034`
  would reintroduce exactly the ceremony R-17 removed. What R-17 **retained** is technical, and it does bind here: no
  fabricated values, NP-04 as the only artifact store, append-only lineage, IRR/IPD ownership, no execution path.
- **R-13 is a change-classification rule, not an authorisation rule.** It defines what `observed` means and how a
  change is attributed (additive / ordinal / nominal). Changing `VALUATION_POLICY.policyDefaultAssumptionCaps.factor`
  *is* a `MODEL` change under R-13, and it must be **attributed** as one in the change report. R-13 says nothing about
  who may make it, and satisfying R-13 does not authorise the change — the reverse: the change must first be
  authorised (A1, by the operator) and then reported under R-13. §17.1 records the same reading.
- **Design R‑4.3 states no magnitude anywhere.** Lines 1631 and 1634 say a `POLICY_DEFAULT` discount rate and a
  `POLICY_DEFAULT` target multiple each "cap confidence"; the cap names appear at lines 585/930; no number appears in
  the design, in the register, or in any policy block. The magnitude is therefore, by construction, an **operator
  policy decision** and not an implementation detail a work item may fill in.

### 1.4 What that means for this package

Every deliverable below is either **evidence** (reproduced arithmetic, located documents, quoted code) or a
**proposal** (explicitly marked, explicitly not accepted). Nothing is recorded as a decision. The one thing this
package can assert without any decision is the shape of the arithmetic and the size of the sensitivity — and in the
`L-036` case that turns out to settle more than expected (§3.4).

---

## 2. `L-036` — from the audited statement to the payload (deliverable 3)

### 2.1 Source investigation: what the committed evidence actually contains

This is the part of the package that had the most room to be wrong, so it was done by searching the evidence rather
than by reading the design and assuming.

| Question | Finding | How it was established |
|---|---|---|
| Which statement/note would disclose associates/JV? | Under Ind AS (Schedule III, Division II) the **balance sheet** carries "Investments in associates and joint ventures" (non-current investments), and **Note 2.x "Investments"** of the consolidated statements normally tabulates the carrying amount; the **share of profit of associates/JV** appears separately in the P&L. | Standard-form expectation only — not evidence for this issuer. |
| Does the committed evidence contain such a note? | **No.** `evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/source/` holds three note extracts — Note 2.9, Note 2.11 (borrowings), Note 2.12 (share capital) — plus `quotes.json`. | `ls` of the bundle; the bundle's README records which notes were extracted. |
| Do any of them mention associates, associates/JV, or investments? | **Zero occurrences.** A case-insensitive scan of `source/quotes.json` for `associate`, `investment`, `joint venture`, `JV` returns no match. | `grep -ic` over the committed file. |
| Is the carrying value separately reported *anywhere in the repository* for this issuer? | **No.** No dataset column, no evidence bundle, no artifact. | closed line-item table (§2.2); no bundle filename matches. |
| Is it identifiable for the consolidated period in scope (FY2024-03-31)? | **Undetermined.** It would be identifiable *if* the note were extracted; as committed, the period's associates/JV carrying value is simply absent. Whether the issuer's FY2024 consolidated balance sheet reports a separately captioned associates/JV line (as opposed to a nil or an "investments" caption) is **not established by any committed document** — and this package does not guess. | absence of source; see the prohibition in §2.4 |
| Does ingestion contain it but the schema cannot represent it? | **The second half is true and the first half is not.** Ingestion cannot contain it: the closed line-item table has no associates/JV item, `builder.ts` rejects an unknown column with `UNKNOWN_LINE_ITEM`, and `XBRL_TAG_MAP` (20 tags) has no tag that maps to one. An unmapped tag would be counted in `unknownTags` and discarded, not stored. | `contracts/lineItems.ts` (52 items), `ingestion/builder.ts`, `ingestion/xbrl.ts` |

**The exact schema gap, in one line:** `capitalStructure.ts` line 197 hard-codes
`components.associatesAndJV = notComputable('NOT_REPORTED')`; the closed `LineItemId` union has 52 members and
`INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` is not one of them, so **no dataset, however it was authored, can put a
number into that term** — not from a filing, not from a vendor, not by operator entry. The zero is not an ingestion
failure; it is a representational impossibility. That is why `L-036` is `PARTIALLY RESOLVED` and not `RESOLVED`.

### 2.2 How the term enters the enterprise-to-equity bridge today

R-4.1 fixes the arithmetic and the treatment:

> `equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV`
> `associatesAndJV` — "Share of associates/JV. Policy: included at carrying value; the policy version is recorded."

`describeEquityBridge()` already implements both branches — `CARRYING_VALUE_REPORTED` when
`presence === 'PRESENT' && value !== null`, otherwise `POLICY_ZERO_UNAVAILABLE` with a `substitutedInputs` record and
the sentence reproduced in §17.3 of the register. `equityValueFromEnterprise()` then adds
`value(structure.associatesAndJV)`, which is `0` for anything that is not `PRESENT`. Three things follow, and they are
the substance of this section:

1. **The disclosure half is done.** The substitution is named, policy-versioned, structurally recorded, repeated in
   `limitations[]` and carried onto every enterprise-derived per-share figure. Nothing about the *statement* of the
   zero is missing.
2. **The arithmetic half cannot be fixed from the current inputs.** With no representable item, the only available
   numbers are "absent" — and the bridge must fail closed for `MISSING`/`NOT_COMPUTABLE` components elsewhere
   (`netDebt`, `minorityInterest`, `preferenceCapital`), never for this one, because policy R-4.1 *chooses* the zero.
3. **The lift to a real number is one line plus a schema decision.** Because `describeEquityBridge` and
   `equityValueFromEnterprise` both branch on presence, replacing the hard-code with a lookup on a new line item needs
   no change to the disclosure logic, no change to the formula, and no change to the payload grammar (the
   `capitalStructure` subtree is already open, §17.5). The expensive part is the schema decision, not the code.

### 2.3 The three candidate treatments, compared

| | **T1 — reported carrying value** | **T2 — explicit nil by disclosure** | **T3 — not reported; bridge qualified (today)** | **T3′ — not reported; bridge blocked** |
|---|---|---|---|---|
| Requires | a located statement line + provenance (document, note, locator, quoted wording) and a dataset field to hold it | `DECLARED_NIL_IN_SOURCE` + source + `periodEnd` + the filer's own wording, **and** the item must exist as `reported: true` | nothing further — implemented | a policy change making an absent associates/JV term a blocking component |
| D-2 legality | N/A | legal **only** with sufficient filing evidence; a bare nil is refused (`NIL_WITHOUT_QUOTED_WORDING`, `NIL_WITHOUT_PROVENANCE`) | legal — this is a `NOT_COMPUTABLE`, not a nil | legal |
| Never manufacture a zero | satisfied — the value is the filer's | satisfied — the zero is the filer's | satisfied — the zero is *labelled policy*, not an issuer nil | n/a |
| Never infer nil from silence | satisfied | **the failure mode to avoid** — absence in our bundle says nothing about the filing | satisfied — the payload explicitly says it is not an issuer-reported nil | satisfied |
| Status on this evidence | **not available** (no note, no field) | **not available** (no wording, and the item does not exist to declare) | **available — current state** | available as a policy choice |
| Effect on intrinsic | `+ w · CV / shares`, exact (§3.4) | `+ 0` — but now *informative*, because a nil is a claim the filer made | `+ 0`, disclosed | intrinsic **withheld** |
| Effect on payload | `treatment: CARRYING_VALUE_REPORTED`, note with the value and the policy version | `NOT_COMPUTABLE` → `NIL_BY_DISCLOSURE` with source ref | `NOT_COMPUTABLE: NOT_REPORTED` + `POLICY_ZERO_UNAVAILABLE` | EV methods withhold; `INV-5` returns `intrinsic: null` |
| Verdict | the only treatment that removes the understatement | strictly better than T3 *when* the filing says nil — and this package cannot establish that it does | the only defensible treatment on the evidence committed today | see §3.5 — the cost is disproportionate |

**Is `POLICY_ZERO` itself policy-permitted, or does it need a decision?** It is **already a recorded policy decision**,
not an implementation default: `VALUATION_POLICY.associatesTreatment = { policyVersion: 'associates-treatment/1.0.0',
basis: 'CARRYING_VALUE', whenUnavailable: 'POLICY_ZERO' }`, and R-4.1 requires the version to be recorded. So T3 does
not need a new decision to remain in force. What it does need is a **re-examination if a real carrying value ever
becomes representable**, because `whenUnavailable` is conditioned on unavailability: once a value is available, the
policy's own `basis: CARRYING_VALUE` applies and the zero must not persist. That conditional is the thing to record —
and it is proposed as DR-036-1 in §4.

**What `POLICY_ZERO` must never become.** It is a substitution label, not a nil: it must not be re-spelled as
`NIL_BY_DISCLOSURE`, must not populate `DECLARED_NIL_IN_SOURCE`, and must not be counted as an issuer declaration in
any evidence-quality statistic. All three are already asserted by the VII tests and are re-asserted by the new guard
test (§5.3).

### 2.4 The versioned schema proposal

The full proposal — name, semantics, currency/unit, period, scope, source reference and provenance, observation
status, missing-value semantics, validation rules, version compatibility and historical datasets — is a separate
reviewable document:

> **`docs/integration/IIPS_V3_IID_ASSOCIATES_JV_SCHEMA_PROPOSAL_2026-11-06.md`**

Summary of what it proposes, with the numbers that make the case:

| Element | Proposal |
|---|---|
| Line item | `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` — `BS`, `INSTANT`, `unit: 'INR'`, `sign: POSITIVE_MAGNITUDE`, `reported: true` |
| Dataset schema | additive bump `IIPS_INVESTMENT_FUNDAMENTALS_V1` → `…_V2`; the item is **optional**; its absence means `NOT_REPORTED` (**never** zero) |
| Engine wiring | replace `capitalStructure.ts:197` with the same `component(...)` lookup used by the other five bridge components; `describeEquityBridge` then selects `CARRYING_VALUE_REPORTED` with no change |
| Payload grammar | **no new member** — `capitalStructure` is already open (§17.5); the *content* of `associatesAndJV` and `equityBridge` changes |
| Historical datasets | V1 datasets remain valid and are not rewritten; they continue to publish `NOT_COMPUTABLE: NOT_REPORTED`; no backfill, no inference |
| Why not a signed item | Ind AS 28 carrying amounts are not negative (losses beyond the investment stop at nil unless a legal obligation exists); a `SIGNED` item would invite a negative carrying value the framework cannot interpret |
| Why not reuse `CURRENT_INVESTMENTS` | different captions and different bridge role — current investments sit inside `cashAndInvestments`, associates/JV sit *after* debt; conflating them would double-count |

---

## 3. Scenario arithmetic on the committed Work Item 3 inputs (deliverable 4)

All figures below are produced by `iips-platform/scripts/viii-valuation-decisions.ts` from the committed
`WI3-BORROWINGS-NIL-2026-11-06/ingest-input/` fixtures and the current engine, and written to
`evidence/real-issuer/VIII-VALUATION-DECISIONS-2026-11-06/artifact/valuation-decision-scenarios.json`. The script
**refuses to write** if the baseline has drifted from the VII record, if the policy factor is no longer `null`, if any
policy-default cap is applied, or if associates/JV is no longer `NOT_COMPUTABLE`.

### 3.1 Reproduced baseline (unchanged, byte-comparable to VII)

| Output | Value | Matches VII |
|---|---|---|
| intrinsic per share low / mid / high | 875.3394 / 1088.9723 / 1399.8105 | ✔ |
| spread | 48.16 % | ✔ |
| margin of safety vs mid / vs low / band / refusal | −8.4187 % / −34.8791 % / `FAIR` / `null` | ✔ |
| confidence `dataConfidence` / `modelConfidence` / `combined` | 0.85 / 0.6342 / **0.6736** | ✔ |
| caps applied | `STALE_DATA` (×0.9), `DILUTION_PROXY` (×0.98) | ✔ |
| diluted shares / share-count period | 4,144,888,607.99 / 2024-03-31 | ✔ |
| net debt / NCI / preference | −19,342 crore / 345 crore / `NIL_BY_DISCLOSURE` | ✔ |
| associates/JV | `NOT_COMPUTABLE: NOT_REPORTED`, treatment `POLICY_ZERO_UNAVAILABLE`, substituted value 0 | ✔ |
| bridge offset (`−netDebt − NCI − pref + assoc`) | **18,997 crore** | ✔ |
| weights | `DCF_FCFF` 0.6 · `PE_RELATIVE` 0.3 · `EV_EBITDA` 0.1 | ✔ |
| per-share mid by method | DCF 990.749 · PE 1,270.427 · EV/EBITDA 1,133.948 | ✔ |

`preRound` = `(0.6 × 0.85 + 0.4 × 0.6342) × 0.9 × 0.98` = **0.67356576** → published **0.6736** (one rounding, at the
end). That `preRound` value is the base for every `L-034` figure in §3.2.

### 3.2 `L-034` — the cap alternatives, with their effect

**The trigger set on this assessment.** Three method-level policy defaults, across two cap types:

| Cap type | Triggers | Methods |
|---|---|---|
| `POLICY_DEFAULT_WACC` | 1 | `DCF_FCFF` (publishes `wacc`; assessment-level basis `POLICY_DEFAULT`) |
| `POLICY_DEFAULT_MULTIPLE` | 2 | `PE_RELATIVE` (22×), `EV_EBITDA` (12×) — both `multipleBasis: 'POLICY_DEFAULT'` |

A trigger requires a **method with output**; a policy-default multiple on an inapplicable method does not trigger
(`EV_REVENUE` is inapplicable here and contributes none).

**A finding that changes the shape of the decision: the prepared mechanism is already `C`-shaped.** In
`confidence.ts`, `assumptionCapsOf()` builds **one declaration per cap type** and the apply loop does
`for (const declaration of assumptionCaps) combined *= declaration.factor`. So if the operator sets `factor`, the
engine as committed applies it **once per cap type** — alternative C. Choosing B or D is therefore not a matter of
setting a number: it is a number **plus** a loop/payload change. Setting the factor without deciding granularity
silently selects C.

| Alt | Semantics | Formula | Code change needed to apply it |
|---|---|---|---|
| **A** | no cap until the factor is authorised | `round4(preRound)` | none (current state) |
| **B** | one aggregate cap if *any* trigger exists | `round4(preRound × f)` | requires: apply at most once, and mark only one declaration `applied` (otherwise the payload would declare two applied caps while one multiplication occurred) |
| **C** | one cap per cap **type** | `round4(preRound × f²)` | **none — this is what the committed loop does once `factor ≠ null`** |
| **D** | one cap per triggering **assumption** | `round4(preRound × f³)` | requires: exponent = `triggers.length` across declarations, and a formula-statement change so the payload shows the multiplicity |

Each alternative in the artifact also publishes `multiplicity` (0, 1, 2, 3) — the exponent, as a number, so the
arithmetic can be checked without parsing a superscript.

| Illustrative `f` — **arithmetic only, not a proposal** | **B** (×f) | **C** (×f²) | **D** (×f³) |
|---|---|---|---|
| 0.98 | 0.6601 | 0.6469 | 0.6340 |
| 0.95 | 0.6399 | 0.6079 | 0.5775 |
| 0.90 | 0.6062 | 0.5456 | 0.4910 |
| 0.85 | 0.5725 | 0.4867 | 0.4137 |
| 0.80 | 0.5389 | 0.4311 | 0.3449 |

No row is a recommendation. The `f` values are chosen because they already exist elsewhere in the same formula
(`DILUTION_PROXY` 0.98, `DIVIDEND_SOURCE_CONFLICT` 0.95, `STALE_DATA` 0.9, `HIGH_METHOD_DISAGREEMENT` 0.85) — which is
precisely why selecting one of them for `L-034` on the strength of that coincidence would be fabrication by analogy.

#### Per-alternative analysis

**A — no cap until the factor is authorised (status quo).**
*Trigger conditions:* none applied. *Application order:* n/a. *Repeat behaviour:* idempotent by construction.
*Interaction:* the six existing caps are untouched (`0.9 × 0.98` remains); no floor or ceiling is approached.
*Infosys effect:* confidence stays **0.6736**; intrinsic, MoS and band are unaffected (confidence is not an input to
them). *Other configurations:* every assessment whose rate or multiple is a policy default publishes unpenalised
confidence — on this dataset that is every assessment. *Advantages:* no number is invented; no digest churn; the
disclosure half of R-4.3 is satisfied and says so (`CAP_FACTOR_NOT_SET_IN_POLICY` in words a reader cannot mistake for
a penalty). *Disadvantages:* the cap half of R-4.3 stays unmet; a valuation built entirely from policy parameters
presents the same confidence as one built from the issuer's own rate and multiples; `L-034` cannot close.
*Unintended consequence:* it establishes a silent precedent that a policy-default valuation is free — and the payload
already reads `0.6736` next to a published intrinsic range, which is the shape a reader is most likely to misread.
*Required changes:* none (already implemented and tested). *Regression tests:* the existing AC-034.2/AC-034.3
assertions (`factor === null`, `applied === false`, `CAP_FACTOR_NOT_SET_IN_POLICY`, caps identical with and without
the declaration) plus the new guard test in §5.3.

**B — one aggregate cap on any triggering default.**
*Trigger conditions:* `triggers.length ≥ 1` **in total**, regardless of type or count. *Application order:* after the
six existing caps (so it cannot weaken them) and before rounding. *Repeat behaviour:* idempotent — the second and
third default cost nothing. *Interaction:* multiplicative with the existing caps; with `f ≥ 0.5` and five existing caps
the product cannot underflow, and no minimum-confidence floor exists to conflict with. *Infosys effect:* 0.6736 →
`round4(0.67356576 × f)` — the "B" column above; e.g. 0.6062 at `f = 0.9`. *Other configurations:* an assessment with
an `OPERATOR_SET` WACC and a single policy multiple gets the **same** penalty as an all-policy-default assessment —
which is the alternative's central weakness, since R-4.3's concern is the *all-default* case. *Advantages:* one
number to authorise, no granularity question, smallest possible churn, easiest to explain. *Disadvantages:* it
under-penalises the configuration R-4.3 is actually about, and it requires a code change (the committed loop is
per-type), so it is *not* the "just set the factor" option — a point easily missed. *Unintended consequence:* a cliff
at the first trigger — a valuation with one policy default and one with three are penalised identically, which
inverts the incentive the cap is meant to create. *Required changes:* `factor` (policy), a `once` guard in
`buildConfidence`, and a declaration convention so the payload does not claim two applied caps for one multiplication.
*Regression tests:* one-trigger and three-trigger assessments produce identical `combined`; the payload shows exactly
one applied declaration; existing cap factors unchanged.

**C — separate, per-cap-type treatment (what the prepared mechanism does).**
*Trigger conditions:* per cap type — `POLICY_DEFAULT_WACC` fires if any method with output publishes a policy `wacc`,
`POLICY_DEFAULT_MULTIPLE` fires if any method with output publishes a policy multiple. *Application order:* WACC then
MULTIPLE, after the six existing caps, single rounding at the end. *Repeat behaviour:* **idempotent within a type** —
the second policy-default multiple does not add a second application; a third *type* would add one. *Interaction:*
closest to the design's own vocabulary, which names two caps (lines 585/930) — i.e. the design contemplates **two**
discrete caps, not one and not three. *Infosys effect:* 0.6736 → `f²`; 0.5456 at `f = 0.9`, 0.4867 at `f = 0.85`.
*Other configurations:* an operator-set WACC with policy multiples is penalised once; an all-default assessment twice;
a policy-default WACC with operator multiples once. Distinguishes the cases B cannot. *Advantages:* no implementation
change at all beyond the number; matches the two named caps; the payload's per-type declarations become truthful
applied declarations without redesign; the granularity question largely disappears (one factor, two named caps).
*Disadvantages:* still does not distinguish "one policy multiple" from "two policy multiples" — a `PE_RELATIVE`-only
assessment and a three-method assessment pay the same multiple penalty; and the total penalty depends on which *types*
the issuer happened to lean on, which is a defensible but not obviously intended asymmetry (a discount rate is one
number; a multiple is one per method). *Unintended consequence:* with a low `f` the combined effect across both types
can be steep — `f = 0.8` gives 0.4311, below anything the existing six caps can produce together — and there is **no
minimum-confidence floor anywhere in policy**, so nothing bounds how low confidence can go. If C is chosen, a floor
question joins the factor question. *Required changes:* `factor` only (plus a policy-version bump, an R-13 `MODEL`
attribution, and updated expected values in the frontend mirrors). *Regression tests:* both types triggering ⇒ `f²`;
one type ⇒ `f`; no trigger ⇒ no declaration in the payload at all; `OPERATOR_SET` rate keeps the WACC trigger off;
`factor = null` keeps `applied: false`.

**D — one cap per triggering assumption.**
*Trigger conditions:* every `(methodId, assumption)` pair. *Application order:* same position; the multiplicity is the
only difference. *Repeat behaviour:* **not idempotent** — each additional policy-default method adds a multiplication,
so the penalty grows with breadth of policy use, which is the most faithful reading of "the valuation leans on policy"
but the least supported by the design's two named caps. *Interaction:* interacts with **applicability**, which is not a
stable quantity: a method becoming inapplicable (missing metric, negative EBITDA) removes both its weight and its cap,
so confidence moves in jumps that have nothing to do with evidence quality. *Infosys effect:* `f³`; 0.4910 at
`f = 0.9`, 0.4137 at 0.85, 0.3449 at 0.80 — the last is below every published Infosys confidence to date (0.4939 in
Work Item 2 sat beside a *withheld* intrinsic). *Other configurations:* an assessment with five policy-default methods
compounds five times; with `f = 0.9` that is 0.5905×, and combined with two existing caps the total can fall under
0.35 for a fully evidenced balance sheet. *Advantages:* the only alternative whose penalty is proportional to how much
of the valuation is policy-supplied; it makes the number of policy defaults visible in the confidence itself.
*Disadvantages:* no design support for the multiplicity; no floor, so the tail is unbounded in principle; a change in
method applicability silently changes confidence, which is a **confounding** behaviour for a metric whose purpose is to
track evidence thinness. *Unintended consequence:* an assessment can *gain* confidence by losing a method (that method
no longer triggers a cap), which is backwards. *Required changes:* arithmetic (exponent = trigger count), the published
`formula` string, and a statement of the multiplicity in `assumptionCaps[]` so the payload remains recomputable.
*Regression tests:* trigger count drives the exponent; a one-method and a three-method assessment differ; the formula
string states the multiplicity; applicability changes move confidence in the recorded direction.

#### The two questions the operator is actually being asked

| Question | Options | Who can answer | Note |
|---|---|---|---|
| **Q1 — magnitude** | any `f ∈ (0, 1]` | operator (A1) | no authoritative basis exists; the design fixes none |
| **Q2 — granularity** | B / C / D (A defers) | operator (A1), then IRR (A3) | **C is what the code does today**; B and D need code |

They are one decision, not two, because the published number depends on the product `f^k`: choosing `f` without `k`
does not determine anything. §4 therefore proposes them as a single record with two fields.

### 3.3 `L-036` — the carrying-value sensitivity

Derived exactly, not linearised: the bridge offset enters every enterprise-derived per-share figure as
`+CV/shares`, and the blend re-weights it by the EV-method weight.

- bridged methods: `DCF_FCFF` (0.6) and `EV_EBITDA` (0.1) ⇒ bridged weight **0.7**; `PE_RELATIVE` (0.3) is unaffected.
- `Δ per-share mid = 0.7 × CV / 4,144,888,607.99`
- **₹1 crore of carrying value ⇒ ₹0.001689 per share ⇒ 0.000155 % of intrinsic mid**
- **₹1,000 crore ⇒ ₹1.6888 per share ⇒ 0.155 % of mid ⇒ +0.1679 percentage points of margin of safety**

| Carrying value (₹ crore) | intrinsic mid | Δ mid | MoS vs mid | band |
|---|---|---|---|---|
| **0 (current substitution)** | **1,088.972** | — | **−8.4187 %** | `FAIR` |
| 100 | 1,089.141 | +0.169 | −8.4019 % | `FAIR` |
| 500 | 1,089.817 | +0.844 | −8.3347 % | `FAIR` |
| 1,000 | 1,090.661 | +1.689 | −8.2509 % | `FAIR` |
| 2,500 | 1,093.194 | +4.222 | −8.0000 % | `FAIR` |
| 5,000 | 1,097.416 | +8.444 | −7.5845 % | `FAIR` |
| 10,000 | 1,105.861 | +16.888 | −6.7630 % | `FAIR` |

Every row is labelled `HYPOTHETICAL_ARITHMETIC_NOT_AN_ISSUER_VALUE` in the artifact. **None of them is a value for this
issuer**; they exist to show the slope.

**The band boundary is the decisive number.** The published band is `FAIR` for
`mos ∈ [−15 %, +15 %)`; leaving `FAIR` upward requires mid `= price / 0.85 = ₹1,389.00`, i.e. a carrying value of
**₹1,77,654 crore** — an amount far above any plausible associates/JV carrying value for this issuer, and one this
package emphatically does **not** assert. The arithmetic conclusion is narrow and can be stated: *within the range this
dataset can support, the missing term moves the intrinsic range by a fraction of a percentage point and does not move
the published band; it does, however, move the number, and the payload cannot say by how much.*

### 3.4 Combined impact, factor by factor

Each factor reported separately, as required. "Unquantified" means: no input or no policy value exists to compute it.

| Factor | Effect of `L-034` decision | Effect of `L-036` carrying value | Combined |
|---|---|---|---|
| **Enterprise value** | none | **unquantified** — EV is computed before the bridge; a carrying value does not enter EV | none |
| **Equity bridge** | none | `+CV` added to equity value, exact; offset 18,997 crore today | additive |
| **Intrinsic range** | **none** — confidence is downstream of valuation, not an input | `Δmid = 0.7 × CV / shares`; 4.22 pts at ₹2,500 crore | `L-036` only |
| **Margin of safety** | none | `+0.1679 pp` per ₹1,000 crore; −8.4187 % → −8.25 % at ₹1,000 crore | `L-036` only |
| **Band** | none | moves only at ₹1,77,654 crore (arithmetic boundary) | `L-036` only |
| **Confidence** | `0.6736 → round4(0.67356576 × f^k)`; B/C/D columns in §3.2 | **unquantified** — a real CV moves the method spread, hence `modelConfidence`, hence `combined`; the size depends on the CV | **not decomposable**: the cap multiplies a base the carrying value also moves |
| **Qualification / limitations** | the policy-default qualification becomes a *penalty* rather than a declaration; the `limitations[]` sentence changes wording (it currently says the cap is NOT applied) | the `POLICY_ZERO` qualification is replaced by a carrying-value disclosure, and the understatement sentence disappears | both qualification sentences change; neither can be written until both decisions exist |
| **Verdict** | none | none | **no verdict is published in either case** |

### 3.5 What "blocking the bridge" would cost — why T3′ is not the cheap option

If the absent associates/JV term were made a blocking component like `netDebt`/`minorityInterest`/`preferenceCapital`,
`equityValueFromEnterprise` returns `notComputable(...)` for every EV-family method. Because INV-5 requires **every**
weighted method to have a present per-share leg, `buildIntrinsic` would return `intrinsic: null` with
`unmetInputs`, and the margin of safety would return to `INTRINSIC_WITHHELD` — the exact shape Work Item 2 published
(`intrinsic: null`, confidence 0.4939, `EV_EBITDA: CAPITAL_STRUCTURE_INCOMPLETE`). The published valuation would be
**withheld for the whole issuer** on the strength of a term whose sensitivity is 0.155 % of mid per ₹1,000 crore. That
is disproportionate, and it is the strongest single argument for keeping T3 (policy zero, disclosed) until either a
carrying value is representable or the operator decides otherwise. A softer variant — mark the EV methods
`applicable: false` — would leave a `PE_RELATIVE`-only blend of ₹1,270.43 flat (band `DISCOUNT`), i.e. a materially
different valuation produced by a schema gap, which is worse.

---

## 4. Proposed decision records (deliverable 5) — **proposals, not decisions**

These are drafts. None is accepted, recorded, or implemented. Each names the authority from §1.2, and each is written
so that accepting it is a single act with a visible consequence.

### DR-034-1 — `POLICY_DEFAULT` confidence cap: magnitude and granularity *(proposal; authority A1 — the operator)*

- **Decision sought:** authorise a factor `f` for `POLICY_DEFAULT_WACC` and `POLICY_DEFAULT_MULTIPLE` and a granularity
  from {B once, C per cap type, D per trigger}; A (no cap) is the deferral option and keeps `L-034` `OPEN`.
- **Mechanism already in place:** `VALUATION_POLICY.policyDefaultAssumptionCaps.factor` (currently `null`),
  `assumptionCapsOf()` declarations, the apply loop, `confidence.formula`, `limitations[]`. Granularity C requires no
  code change; B and D do.
- **Effect if accepted:** every published confidence whose valuation leans on a policy default moves by `f^k`; on this
  dataset 0.6736 → the §3.2 column. Intrinsic, MoS and band do **not** move. Classification: `MODEL` change (R-13) —
  attribute it in the change report; the payload digest and the substantive-identity vectors move.
- **What would make a numeric proposal *more* than a guess:** a written basis for the value (a documented calibration,
  a risk-appetite statement, or a policy paper). None exists in the repository. **This record therefore proposes a
  decision procedure and leaves the number blank** — it does not propose 0.9, 0.95 or any other value.
- **Acceptance test for the record itself:** the accepted value appears in `VALUATION_POLICY` with a bumped
  `policyVersion`, the payload shows `applied: true` with the same factor, and the four reproducing tests in §5.2 pass.

### DR-034-2 — floor question raised by any non-trivial `f` *(proposal; authority A1 — the operator)*

- **Decision sought:** state whether a minimum confidence exists. Today there is none: `combined` is the product of up
  to seven factors and is only rounded, so `f = 0.8` with both cap types yields 0.4311 and a fully-evidenced balance
  sheet can still fall below 0.5.
- **Why it is separate:** it is a *different* policy value (a floor) and it interacts with the six existing caps, not
  only the two new ones. Bundling it into DR-034-1 would hide a second number in a single approval.
- **If declined:** record that no floor exists and that the cap may drive confidence arbitrarily low. That is a
  legitimate answer; leaving it unstated is not.

### DR-036-1 — `POLICY_ZERO` scope and its expiry condition *(proposal; authority A1/A4 — the operator)*

- **Decision sought:** confirm that `associates-treatment/1.0.0` with `whenUnavailable: 'POLICY_ZERO'` remains in force
  **and** record its expiry condition: when a carrying value becomes representable (A2 accepted and a value entered),
  the bridge must use it and `POLICY_ZERO_UNAVAILABLE` must not persist. Optionally: an explicit refusal to infer nil
  from silence, as a stated rule rather than an absence.
- **Effect if accepted:** documentation only; no number moves. It converts a standing implementation behaviour into a
  recorded, expiring decision.
- **What it does not do:** it does not close `L-036`.

### DR-036-2 — associates/JV line item and schema V2 *(proposal; authority A2 — the operator, with IPD ingestion as
target owner)*

- **Decision sought:** accept or reject the addition of `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` and the
  `IIPS_INVESTMENT_FUNDAMENTALS_V1 → V2` additive bump, per
  `IIPS_V3_IID_ASSOCIATES_JV_SCHEMA_PROPOSAL_2026-11-06.md`.
- **Consequence of acceptance:** a one-line engine change, no payload-grammar change, no historical rewrite, and the
  bridge starts reporting `CARRYING_VALUE_REPORTED` for any issuer whose dataset carries the item. `L-036` could then
  move toward `RESOLVED` **for any issuer whose filing supplies the figure** — but not for this issuer until a value is
  also evidenced (DR-036-3).
- **Consequence of rejection:** `L-036` stays `PARTIALLY RESOLVED` permanently, and the register should say so in those
  words rather than leave it looking pending.

### DR-036-3 — evidence acceptance for this issuer *(proposal; authority A4 — the operator)*

- **Decision sought:** none can be proposed yet — **no candidate value exists**. The committed bundle holds three note
  extracts and none mentions associates/JV (§2.1). The action this record carries is a **precondition**: extract the
  FY2024 consolidated balance sheet's investments note (and, if the caption is silent, the relevant Ind AS 28
  disclosure) before any value is proposed.
- **Prohibition it records:** absence of the note in our bundle is *not* evidence of nil, and nil may not be inferred
  from silence. If the extracted note states a nil in words, T2 becomes available and is strictly better than T3; if
  it states a figure, T1 becomes available; until then, T3 stands.

**Evidence-acceptance status for this package:** no new evidence document is *accepted* here. The bundle
`evidence/real-issuer/VIII-VALUATION-DECISIONS-2026-11-06/` is a **reproduction artifact** (regenerable from the
committed WI3 inputs by one command), not a new source-of-record.

---

## 5. Implementation and regression-test plan (deliverable 6)

Nothing below is implemented. This is the plan each accepted record would execute.

### 5.1 If DR-034-1 selects C (the only option needing no code beyond the number)

1. `policy.ts`: set `policyDefaultAssumptionCaps.factor`; bump its `policyVersion`
   (`confidence-policy-defaults/1.0.0` → `…/1.1.0`), which the payload already publishes on every declaration.
2. No change to `confidence.ts` — assert the existing loop does what the record says (guard test, §5.2/5.3).
3. Update `confidence.formula` expectations, the Infosys scenario expectations in the frontend mirrors, and the
   substantive-identity digest constants (a `MODEL` change moves them; the D-3-style reconstruction test must keep the
   earlier layers reproducible).
4. Change-report attribution as `MODEL` (R-13); register §17.1 status decision recorded by the operator, not by the
   implementation.

### 5.2 If DR-034-1 selects B or D (code change)

- B: apply once (`Math.min(1, totalTriggers)`), and mark a single declaration `applied`; payload must not claim two
  applied caps for one multiplication.
- D: exponent = total trigger count; `formula` string must state the multiplicity; `assumptionCaps[]` must remain
  sufficient to recompute `combined` by hand.
- Both: regression vectors for 0, 1, 2 and 3 triggers, and a test that the recomputed product equals the published
  `combined` to 4 dp.

### 5.3 If DR-036-2 is accepted

1. `contracts/lineItems.ts`: add the item (`BS`, `INSTANT`, `INR`, `POSITIVE_MAGNITUDE`, `reported: true`); the closed
   union grows to 53 and `LINE_ITEM_IDS.length` assertions move.
2. `ingestion/xbrl.ts`: add the tag mapping (Ind AS `InvestmentsInAssociates`/`InvestmentsInJointVentures`, per the
   proposal's tag table), and confirm unmapped tags still land in `unknownTags`.
3. `ingestion/builder.ts`: no new rule is needed if the item inherits the standard nil/provenance guards — assert that
   it does (a bare `NIL` on the new item must be refused).
4. `assessment/capitalStructure.ts` line 197: replace the hard-code with the standard `component('associatesAndJV',
   'INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES')` lookup.
5. Tests: `CARRYING_VALUE_REPORTED` on a dataset carrying the item; `POLICY_ZERO_UNAVAILABLE` on V1 datasets (no
   regression, no historical rewrite); nil-by-disclosure on the new item behaves exactly as D-2 requires; a V1 dataset
   still reproduces its committed payload byte for byte.

### 5.4 Regression that already exists (must not regress)

`tests/investment/assessment-valuation-integrity.test.ts` (11 tests) and
`frontend/server/investment/cli/valuationIntegrity.test.ts` (9 tests) already pin: `factor === null`,
`applied === false`, `CAP_FACTOR_NOT_SET_IN_POLICY`, the six existing caps' arithmetic, trigger detection from the
published assumptions, the `OPERATOR_SET` non-trigger, and the `POLICY_ZERO` disclosure on the stored payload.

### 5.5 The new guard test added by this package

`iips-platform/tests/investment/viiiValuationDecisions.test.ts` — cheap insurance against a stale decision package. It
asserts, against the committed artifacts and the live policy: the factor is still `null`; no policy-default cap is
applied; the reproduced baseline still matches the VII payload's `combined`; the trigger set is 3 across 2 cap types;
the `B/C/D` columns are exactly `round4(preRound × f^k)`; associates/JV is still `NOT_COMPUTABLE: NOT_REPORTED` with
`POLICY_ZERO_UNAVAILABLE`; and the sensitivity identity `0.7 × CV / shares` holds. If someone sets the factor without
updating the package, the suite fails rather than the document quietly lying.

---

## 6. Register commentary and limitation status (deliverable 7)

A new register section `§17.6` records this package: what it added (evidence and proposals), what it did not change
(policy, schema, formulas, payloads, digests), and — explicitly — that **`L-034` remains `OPEN`** and **`L-036`
remains `PARTIALLY RESOLVED`**, with the reason for each restated in one sentence. `L-001` … `L-033`, `L-035`,
`L-031`, `L-033` and every other entry keep their status, meaning and wording.

---

## 7. Acceptance criteria (deliverable 8)

### `L-034`

| Criterion | How this package satisfies it |
|---|---|
| **AC-034.1** every alternative to the cap design is stated with its conditions, order, repeat behaviour, interaction, effect and required change | §3.2 — A, B, C, D with the four sub-analyses, the effect table and the per-alternative paragraphs; plus the finding that the committed mechanism is C-shaped |
| **AC-034.2** no numerical factor is proposed without an authoritative basis | §3.2 illustrative table labelled arithmetic-only; DR-034-1 leaves the number blank and states what would make a value more than a guess; §1.3 records that the design fixes no magnitude |
| **AC-034.3** the missing authority is named, and `L-034` is not closed | §1.2 table (A1 = operator); §4 DR-034-1/2 as proposals; §6 status preserved; guard clauses in the script refuse to run if a factor appears |

### `L-036`

| Criterion | How this package satisfies it |
|---|---|
| **AC-036.1** the source path is traced from statement to payload | §2.1 six-question table: which note, what the committed evidence holds (nothing), identifiability (undetermined), ingestion (cannot represent it), exact schema gap |
| **AC-036.2** the three treatments are compared and the prohibitions respected | §2.3 four-column comparison (T1/T2/T3/T3′), including D-2 legality per column and the "never infer nil from silence" line |
| **AC-036.3** a versioned schema proposal exists, with compatibility and historical-dataset rules | §2.4 summary + `IIPS_V3_IID_ASSOCIATES_JV_SCHEMA_PROPOSAL_2026-11-06.md` (name, semantics, unit, period, scope, provenance, status, missing-value semantics, validation, version compatibility, historical datasets) |
| **AC-036.4** the understatement is quantified or explicitly unquantified, and nothing is fabricated | §3.3 sensitivity + `quantified: false` with `NO_AUTHORITATIVE_ASSOCIATES_JV_CARRYING_VALUE_IN_COMMITTED_SOURCE_EVIDENCE` in the artifact; no carrying value is asserted anywhere |

### Combined

| Criterion | Evidence |
|---|---|
| **AC-C.1** dependency and authority are assessed separately and correctly | §1.1 (no implementation dependency; real publication dependency) and §1.2–§1.3 (four authorities; R-13 is classification, PA vocabulary does not exist in scope) |
| **AC-C.2** impacts are reported factor by factor, unquantified where inputs are missing | §3.4 eight-row table; the confidence row states that the combined effect is **not decomposable** |
| **AC-C.3** every proposal is marked as a proposal, no decision is recorded | §4 heading, each record's first line, and the closing status note; nothing is worded as accepted |
| **AC-C.4** statuses preserved; scope respected; no product change | §6; `git diff --stat` shows only docs, evidence and one script/test; no `src/` change; no IPD change; no historical artifact touched |

---

## 8. Evidence index and reproduction (deliverable 9)

Bundle: `evidence/real-issuer/VIII-VALUATION-DECISIONS-2026-11-06/`

| Path | What it is |
|---|---|
| `README.md` | the bundle's own summary, its status labels and its reproduction instructions |
| `artifact/valuation-decision-scenarios.json` | the full scenario package: reproduced baseline, `L-034` alternatives and illustrative arithmetic, `L-036` unit sensitivity and hypothetical scenarios |
| `runs/01-scenarios.txt` | the generator run, with its stdout and exit code |
| `runs/02-baseline-crosscheck.txt` | the field-by-field comparison of the reproduced baseline against the VII payload |
| `runs/03-tests.txt` | the targeted test run and its exit code |
| `runs/commands.txt` | every command, verbatim |

Reproduce from a clean checkout:

```bash
cd iips-platform
npx tsx scripts/viii-valuation-decisions.ts ../evidence/real-issuer/VIII-VALUATION-DECISIONS-2026-11-06/artifact
npx vitest run tests/investment/viiiValuationDecisions.test.ts
```

Determinism: the script takes the assessment clock from a constant (`2026-11-06T14:05:00.000Z`), not the wall clock,
so `artifact/valuation-decision-scenarios.json` is byte-reproducible from the committed inputs. The script throws
rather than writes if the baseline drifts (§3 preamble) — a stale package cannot be published as a fresh one.

---

## 9. What stays open, stated plainly

| Entry | Status after this package | The one sentence that keeps it there |
|---|---|---|
| `L-034` | **`OPEN`** | the factor and its granularity are an operator policy decision that the design does not fix, so no penalty is applied and R-4.3's cap half remains unmet |
| `L-035` | **`OPEN`** (untouched) | the documentary link from a quoted nil to the component it fills is still not machine-checked |
| `L-036` | **`PARTIALLY RESOLVED`** | the disclosure is corrected and the sensitivity is now quantified, but the carrying value is not representable in the dataset schema and no value exists in the committed evidence |

**No verdict, recommendation, target price or trade instruction is published, offered or implied by this document.** The
scenario tables are arithmetic on committed inputs, labelled as hypothetical; the band `FAIR` is a distance from a
midpoint under policy-default assumptions, not a view about the issuer.
