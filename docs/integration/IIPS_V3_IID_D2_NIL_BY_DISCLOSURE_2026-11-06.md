# IIPS v3.0 — D-2 Nil-by-Disclosure Semantics (Canonical Financial Data Representation)

**Programme:** IIPS v3.0 Investment Intelligence Design (IID)
**Work item:** D-2 — a debt-free issuer cannot be valued or graded
**Date:** 2026-11-06 (revised after the PR #487 review; see §12)
**Baseline:** `main` at `98f3e45` (PR #486 merged; Work Item 1 real-issuer validation closed)
**Scope of change:** representation, ingestion grammar (including the quoted-wording requirement), one aggregation
contract, one published limitation line.
**Not in scope and not touched:** any formula, any weighting, any threshold, any verdict rule, any D-3 reason code,
the corpus of `L-001` … `L-029`, the Work Item 1 evidence bundle, persistence, transport, market price.

---

## 1. The defect, and what this change does and does not do about it

Infosys Limited's FY24 consolidated Ind AS balance sheet presents **no borrowings line at all** — no
`Long-term borrowings`, no `Short-term borrowings`, no `Current maturities of long-term debt`, no preference
capital. The only debt-like claim on the balance sheet is `LEASE_LIABILITIES` (₹8,359 crore = 6,400 non-current +
1,959 current), which IID-0 already treats as a debt component.

Dataset schema v1 had exactly one way to spell "no number here": `MISSING` with a reason. Two very different
situations therefore produced the *same* observation:

- a filer that **states** an item is nil ("the Company has no borrowings as at the reporting date"), and
- a filing that **says nothing** — the row is simply absent, as in this one.

The capital-structure block requires all four debt components before it sums them, so either way it published the
first blocking component unchanged and the bridge downstream was withheld.

**D-2 gives the first situation a representation. It does not, and must not, change the second.** For this issuer
the filing is silent, so the four borrowings components remain `MISSING / NOT_REPORTED` and the outcome is
unchanged by this work item:

| Field | Before this change | After this change (same input, same filing) |
| --- | --- | --- |
| `SHORT_TERM_BORROWINGS`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`, `LONG_TERM_BORROWINGS` | `MISSING` / `NOT_REPORTED` | `MISSING` / `NOT_REPORTED` |
| `PREFERENCE_CAPITAL` | `MISSING` / `NOT_REPORTED` | `MISSING` / `NOT_REPORTED` |
| `LEASE_LIABILITIES` | `PRESENT` 83,590,000,000 | `PRESENT` 83,590,000,000 |
| `grossDebt` / `netDebt` | `MISSING` / `NOT_REPORTED` | `MISSING` / `NOT_REPORTED` |
| `DCF_FCFF` per share | `NOT_COMPUTABLE` | `NOT_COMPUTABLE` |
| `intrinsic` | `null` | `null` |
| moat | `INSUFFICIENT_EVIDENCE` | `INSUFFICIENT_EVIDENCE` |
| confidence | 0.4939 | 0.4939 |
| datasetVersion | `sha256:ca29c835…` | `sha256:ca29c835…` |
| composed payload digest | `cc91f239197a…` | `cc91f239197a…` |

That is the honest result: the blocker for this issuer is a **silence in the source**, not a missing vocabulary, and
no representation can turn silence into a declaration. The representation still matters — a debt-free issuer that
says so can now be described — but the evidence in hand does not contain such an issuer, so the mechanism is
verified on synthetic fixtures only (§7, §8).

Evidence that the filing is silent, re-checked for this review: the consolidated balance sheet on **page 1** lists,
under FINANCIAL LIABILITIES, lease liabilities 6,400 / 1,959, other financial liabilities 2,130 / 16,959 and trade
payables 3,956 — **no borrowings row**; the notes index on **page 7** lists no borrowings note (the liability notes
are 2.13 other financial liabilities and 2.21 leases); and the pages examined here — note 2.1 (p.10), notes
2.4.2–2.5 (pp.13–16), note 2.9 cash (p.19), notes 2.10–2.11 (pp.19–20 and continuing) — contain no sentence stating
that borrowings are nil. There is no wording to quote, so there is no declaration to make.

## 2. What the implementation actually defines (established by reading it, not assumed)

- **The four components**: `SHORT_TERM_BORROWINGS`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`, `LONG_TERM_BORROWINGS`,
  `LEASE_LIABILITIES` (`contracts/lineItems.ts`).
- **Gross debt** = sum of the four. **Net debt** = gross debt − (`CASH_AND_CASH_EQUIVALENTS` + `CURRENT_INVESTMENTS`).
  Both definitions are unchanged by this work item.
- **Aggregation site**: `assessment/capitalStructure.ts`; all four components resolve through one helper, so one
  contract governs them.
- **Blocking gate**: presence-based. `NOT_COMPUTABLE` propagates by construction, so making a component available is
  enough to unblock a downstream calculation; no method needed a new branch.
- **Enterprise-to-equity bridge** (`equityValueFromEnterprise`): subtracts net debt and the claims below EV
  (`nonControllingInterest`, `preferenceCapital`), adds `associatesAndJV` (a disclosed policy zero).
  `PREFERENCE_CAPITAL` is therefore **not** a debt component: it cannot enter gross debt, only the bridge.
- **`EV_REVENUE` never places `netDebt` in its `inputs`** (`methods.ts`), unlike `EV_EBITDA`. Recorded in §8;
  deliberately not changed, because it is a method-input change, not a representation change.

## 3. The representation adopted

Six semantic states, each expressible and each distinguishable in an artifact. Five reuse existing vocabulary; one
member is added to each of two closed unions.

| State | Spelling | Meaning |
| --- | --- | --- |
| `REPORTED_VALUE` | `presence: 'PRESENT'` + value | disclosed as a number, **including a reported zero** |
| `NIL_BY_DISCLOSURE` | `presence: 'NIL_BY_DISCLOSURE'` + `reason: 'DECLARED_NIL_IN_SOURCE'` + `source` + `periodEnd` + **the source's quoted wording** | the source **states** the item is nil / not applicable |
| `NOT_REPORTED` | `MISSING` + `NOT_REPORTED` | the source says nothing (including "the row is absent") |
| `SOURCE_UNAVAILABLE` | `MISSING` + `FILING_UNAVAILABLE` / `PERIOD_NOT_COVERED` / `STATEMENT_OUT_OF_SCOPE` | the source could not be obtained |
| `UNMAPPED` | `MISSING` + `NOT_TAGGED_IN_FILING` | a source figure exists with no applicable canonical mapping |
| `NOT_COMPUTABLE` | `NOT_COMPUTABLE` + reason | a calculation cannot run because its prerequisites are incomplete |

Properties that make the distinction load-bearing:

- `NIL_BY_DISCLOSURE` is **not** `PRESENT`: `value` is `null` and `isPresent()` is false, so every pre-existing
  consumer treats it as no number at all.
- `NIL_BY_DISCLOSURE` is **not** `MISSING`: it is a positive statement by the filer. `nilByDisclosure()` throws
  without a source reference, a period end, **and the source's quoted wording** (stored on `note`, which an artifact
  shows the reader).
- **An omitted line is not a nil.** With no sentence to quote there is no declaration, and the item is
  `MISSING: NOT_REPORTED`. This is the rule the first revision of the evidence bundle broke; see §12.
- A reported zero stays a reported zero and is never re-spelled as nil.

Invariant **INV-7** (new) enforces the whole shape on any observation: source present, period end present, quoted
wording present, reason exactly `DECLARED_NIL_IN_SOURCE`, no numeric value.

## 4. The aggregation contract (the only permission granted)

Documented in the header of `capitalStructure.ts` and implemented as `grossDebtOf()`:

1. Each of the four components must be `PRESENT` or `NIL_BY_DISCLOSURE`. Anything else blocks the aggregate, and the
   blocking observation is published **unchanged**, so `FILING_UNAVAILABLE`, `NOT_TAGGED_IN_FILING` or
   `SOURCE_CONFLICT_UNRESOLVED` reach the artifact with its real reason (`newestReasoned()` prevents the older
   collapse to `NOT_REPORTED`).
2. A nil contributes zero **and is named in the aggregate's `note`**. `components[name]` keeps the nil observation,
   its filing reference, its period and its quoted wording — the aggregate is the only place the zero exists.
3. All four components must resolve to the **same period end**; a split (`PERIOD_MISMATCH`) is refused rather than
   summing two balance-sheet instants.
4. **Nothing else becomes zero.** Cash and investments keep the strict rule (`PRESENT` only). The EV→equity claims
   (`nonControllingInterest`, `preferenceCapital`) admit a declared nil on identical terms and name it;
   `associatesAndJV` keeps its existing, separately-disclosed policy zero.
5. `NET_DEBT` in the IID-0 derivation set remains reported-numbers-only (derived items cannot be declared nil —
   `NIL_ON_DERIVED_ITEM`).

`engine.ts` adds one limitation line naming every component counted as nil.

## 5. Ingestion grammar

`parseNilCell()` (exported) recognises `NIL` and `NIL: <text>`; `hasQuotedWording()` decides whether the cell may be
used. The builder then applies, in order:

| Condition | Code | Effect |
| --- | --- | --- |
| `NIL` or `NIL:` with nothing after the colon | `NIL_WITHOUT_QUOTED_WORDING` (ERROR) | cell degrades to `MISSING/NOT_REPORTED`; an omitted line can never become a declaration |
| quoted nil on a derived line item | `NIL_ON_DERIVED_ITEM` (ERROR) | degrades to `MISSING/NOT_REPORTED` |
| quoted nil on a row with no `filing_ref` | `NIL_WITHOUT_PROVENANCE` (ERROR) | degrades to `MISSING/NOT_REPORTED` |
| same item both reported and declared nil in one period | `CONFLICTING_OBSERVATION` (ERROR) | **neither** used; a whole-dataset pass rewrites every observation under the key to `NOT_COMPUTABLE/SOURCE_CONFLICT_UNRESOLVED` |

`0` is a reported zero; a blank cell is not disclosed.

## 6. Downstream effect

**On this issuer: none, by design** (§1). The filing is silent about borrowings, so the debt position stays blocked,
`intrinsic` stays `null`, the margin of safety still refuses `NO_PRICE_OBSERVATION`, the risk aggregate still says
`POLICY_INPUTS_UNAVAILABLE` (D-3, unchanged), and the composed artifact's payload digest
(`cc91f239197a…`) is byte-identical to the merged Work Item 1 artifact.

**Where the permission does bite** is a filer that states the nil. On the technology fixture with all four debt
components declared nil, gross debt is `PRESENT` 0 and net debt −₹270 crore; with three nils and a reported lease
line the aggregate names exactly the nil components; and with `SHORT_TERM_BORROWINGS`/`LEASE_LIABILITIES` nil the
total is the reported long-term borrowing alone. Those are fixtures, and the report says so.

Sector coverage is unaffected — `Technology` still measures `G2_PARTIAL`, usable 2, withheld 2, statement coverage
87.5%.

## 7. Tests

`iips-platform/tests/investment/nil-by-disclosure.test.ts` — **29 tests, 5 suites, all passing**; no existing test,
fixture or golden was edited.

| Required counter-test | Suite → test |
| --- | --- |
| all four components nil | C → *all four declared nil establishes a complete, zero gross debt with provenance* |
| reported zero vs nil | A → *a reported zero and a declared nil are different claims and stay distinguishable*; C → *four reported zeros are not nils* |
| positive borrowings / mixed | C → *mixed positive and nil components aggregate, and only the nil ones are named* |
| one not reported | C → *one component not reported still blocks the debt position*; D → *an unreported component keeps every dependent calculation unavailable* |
| one source unavailable | C → *one component whose source is unavailable still blocks* (`FILING_UNAVAILABLE` survives) |
| one unmapped | C → *one unmapped component still blocks* (`NOT_TAGGED_IN_FILING` survives) |
| conflicting / ambiguous | C → *a conflicting disclosure blocks the debt position*; B → *a row that both reports and declares nil for the same item is an error, and neither is used* |
| period mismatch | C → *components from different reporting periods are refused*; D → *a period mismatch withholds rather than blending two balance sheets* |
| source provenance missing | A → *a nil without a period end, with no source, or with no quoted wording is refused at construction (INV-7)*; A → *the invariant checker rejects a hand-built nil that has lost its provenance*; B → *a nil with no filing reference is refused* |
| **actual reported borrowings** | C → *a debt-bearing issuer is unchanged: reported borrowings aggregate exactly as before* |
| **absent line is not a nil** (added after review) | B → *a nil cell with no quoted filing wording is refused, so an omitted line cannot become a nil* |
| **the real filing** (rewritten after review) | E → *the filed facts are expressible without an inferred zero: borrowings are `NOT_REPORTED`, leases are reported*; E → *the filing cannot be upgraded to a nil by typing `NIL`*; E → *the difference is a quoted statement, not an absent line* (a labelled mechanism demonstration, explicitly not a claim about the filing) |

## 8. Limits of this correction, and the conflicts recorded rather than improvised

- **No real filing in evidence exercises the permission.** The mechanism is verified on synthetic fixtures; the
  Infosys filing is silent, so it stays blocked. Exercising D-2 on real data needs a filing that says the nil, and
  that is an open item, not a result.
- **The nil is only as good as the quote.** The operator must supply the source's wording; the product cannot tell a
  faithful quote from an unfaithful one. What it does guarantee is that no nil exists without one, and that the
  quote travels into the artifact next to the observation.
- **`EV_REVENUE` does not consume `netDebt`** (`methods.ts`), where `EV_EBITDA` does. Changing it would change a
  method's inputs, so it is recorded and left alone.
- **The leverage dimension is still not described.** Where net debt resolves, leverage is evaluated; the aggregate
  still reports `POLICY_INPUTS_UNAVAILABLE` because no factor is emitted for a company that passes. That is D-3.
- **A nil carries no confidence penalty.** Nils do not raise any coverage counter. (No confidence figure in this
  work item moves, because no nil is asserted on real data.)
- **Schema version is unchanged.** `NIL_BY_DISCLOSURE` is an additional `presence` member, serialised as a string;
  dataset JSON written before this change stays readable.

## 9. Register and evidence

- `L-001` … `L-029`: **untouched.** No entry closed, renumbered, reinterpreted or re-statused. §14 of the register
  records a clarification only, with a review addendum.
- Work Item 1 evidence (`evidence/real-issuer/REL-1-INFOSYS-2026-11-06/`,
  `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/`) is byte-identical to the merged commit. The AC-X2 probe files,
  which its own test rewrites on every run, were restored to their committed bytes after the runs.
- Bundle: `evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/` — filing-only input (byte-identical to Work Item
  1), the measured outcome, the refused `NIL` attempt, the CLI dry run, test logs, and `withdrawn/` with the three
  superseded files and the reason they must not be cited.

## 10. Verification performed

| Check | Command | Result |
| --- | --- | --- |
| Typecheck (platform) | `npx tsc --noEmit` in `iips-platform/` | clean |
| Typecheck (investment server) | `npx tsc -p tsconfig.investment-server.json --noEmit` in `frontend/` | clean |
| Investment suite | `npm run test:iid` | **406 / 406** pass, 102 suites, 0 fail (377 pre-existing + 29 new) |
| D-2 file | `npx tsx --test tests/investment/nil-by-disclosure.test.ts` | 29 / 29 pass |
| Frontend investment area | `npx vitest run server/investment` | 17 files / 205 tests pass (incl. AC-X2 zero-socket) |
| Goldens | `assessment-capital.test.ts` unchanged | gross 1,540,000,000 · net −1,160,000,000 hold |
| Filing evidence | ingest + assess + artifact dry run | dataset `ca29c835…`, payloadDigest `cc91f239197a…`, outcomes unchanged |
| Promotion attempt | bare `NIL` cells through the CSV path | 12 × `NIL_WITHOUT_QUOTED_WORDING`; nothing written; components stay `NOT_REPORTED` |

## 11. Files changed

| File | Change |
| --- | --- |
| `contracts/observation.ts` | six-state documentation; `Presence` + `'NIL_BY_DISCLOSURE'`; `MissingReason` + `'DECLARED_NIL_IN_SOURCE'`; `nilByDisclosure()` **requiring the quoted wording**; `isNilByDisclosure()` |
| `contracts/invariants.ts` | INV-7, now including the quoted-wording check |
| `ingestion/builder.ts` | `parseNilCell`, `hasQuotedWording`, **`NIL_WITHOUT_QUOTED_WORDING`**, `NIL_ON_DERIVED_ITEM`, `NIL_WITHOUT_PROVENANCE`, `CONFLICTING_OBSERVATION`, dataset-wide conflict poison pass |
| `assessment/capitalStructure.ts` | `carriesInformation`, `grossDebtOf`, `newestReasoned`, nil-aware `latest`, lease treatment, EV→equity claims, `usableShares` |
| `assessment/engine.ts` | one limitation line naming declared-nil debt components |
| `tests/investment/nil-by-disclosure.test.ts` | new, 29 tests (including the two review-driven ones) |
| `docs/integration/IIPS_V3_IID_D2_NIL_BY_DISCLOSURE_2026-11-06.md` | this document |
| `docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` | §14 appended, plus a review addendum (clarification only) |
| `evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/` | evidence bundle, revised |

No change to: any valuation/quality/risk/moat formula or threshold, any D-3 reason code, `golden-tech.json`, any
existing fixture, the Work Item 1 evidence, or the corpus of limitations.

## 12. Correction record — PR #487 review (2026-11-06)

**Two evidence inconsistencies were raised, and both were real.**

**1. The nil declarations were not supported by the filing.** The first revision fed four columns of
`NIL: no such line is presented in the consolidated balance sheet` into the Infosys input and reported the
resulting valuation arithmetic as D-2's real-data demonstration. The filing does not say that. Its page-1 balance
sheet simply has no borrowings row, and no note makes a nil statement, so the sentence "no such line is presented"
was the *operator's inference from silence* — the same failure as entering a zero, one step earlier in the chain.

Corrections:

- the nil declarations are withdrawn (`withdrawn/` with `WHY-WITHDRAWN.md`); the input is now a byte-identical copy
  of the Work Item 1 file, and the four components are `MISSING / NOT_REPORTED`;
- the derived figures that depended on them (gross debt ₹8,359 cr, net debt −₹19,342 cr, DCF ₹990.75, intrinsic
  ₹875–₹1,400, moat `NARROW`, confidence 0.6736, payloadDigest `71b0d1f9c981…`) are withdrawn with them;
- **the rule is now enforced in the contract rather than trusted to the operator**: `nilByDisclosure()` requires the
  source's quoted wording, INV-7 checks it, and the CSV path refuses a bare `NIL` with
  `NIL_WITHOUT_QUOTED_WORDING`. Two regression tests pin it (B: refused through ingestion; E: the real filing cannot
  be upgraded by typing `NIL`).

**2. "Four nil declarations, gross debt ₹8,359 crore" did not reconcile as written.** Three of the four declared
columns were debt components; the fourth, `PREFERENCE_CAPITAL`, is not a debt component at all — it is subtracted
below enterprise value in the R-4.1 bridge. `LEASE_LIABILITIES` was never declared nil; it was reported at
₹8,359 crore and was the entire total. The arithmetic (0 + 0 + 0 + 8,359) was right about the wrong claim: the
three zeros rested on a declaration the filing does not make. §2 of the bundle README now carries the four-row
observation table (state, value, source, periodEnd, aggregation treatment) and the reconciliation.

**What did not change:** the representation and the aggregation contract (§3, §4), every formula, weight, threshold
and verdict, D-3, `L-001` … `L-029`, and the Work Item 1 evidence. **What changed in the conclusion:** this work item
no longer claims a real-data demonstration; it claims a representation, verified on fixtures, waiting for a filing
that states a nil.
