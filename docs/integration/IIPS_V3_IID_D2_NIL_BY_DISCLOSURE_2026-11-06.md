# IIPS v3.0 — D-2 Nil-by-Disclosure Semantics (Canonical Financial Data Representation)

**Programme:** IIPS v3.0 Investment Intelligence Design (IID)
**Work item:** D-2 — a debt-free issuer cannot be valued or graded
**Date:** 2026-11-06
**Baseline:** `main` at `98f3e45` (PR #486 merged; Work Item 1 real-issuer validation closed)
**Scope of change:** representation, ingestion grammar, one aggregation contract, one published limitation line.
**Not in scope and not touched:** any formula, any weighting, any threshold, any verdict rule, any D-3 reason code,
the corpus of `L-001` … `L-029`, the Work Item 1 evidence bundle, persistence, transport, market price.

---

## 1. The defect as it was measured

Infosys Limited's FY24 consolidated Ind AS balance sheet presents **no borrowings line at all** — there is no
`Long-term borrowings`, no `Short-term borrowings`, no `Current maturities of long-term debt`, no preference
capital. The only debt-like claim on the balance sheet is `LEASE_LIABILITIES` (₹8,359 crore), which IID-0 already
treats as a debt component.

Dataset schema v1 had exactly one way to spell "the filer did not give us a number": `MISSING` with a reason. A
filer that states the item is nil and a filer whose filing could not be read therefore produced the *same*
observation, and the capital-structure block — which requires all four debt components before it will sum them —
published the first blocking component unchanged:

| Field | Before (unchanged Work Item 1 input, `sha256:ca29c835…`) |
| --- | --- |
| `SHORT_TERM_BORROWINGS` | `MISSING` / `NOT_REPORTED` |
| `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | `MISSING` / `NOT_REPORTED` |
| `LONG_TERM_BORROWINGS` | `MISSING` / `NOT_REPORTED` |
| `LEASE_LIABILITIES` | `PRESENT` 83,590,000,000 |
| `grossDebt` | `MISSING` / `NOT_REPORTED` |
| `netDebt` | `MISSING` / `NOT_REPORTED` |
| `DCF_FCFF` per share | `NOT_COMPUTABLE` (enterprise-to-equity bridge blocked) |
| `EV_EBITDA` | not applicable |
| `intrinsic` | `null` |
| moat | `INSUFFICIENT_EVIDENCE` (ROIC − WACC `NOT_COMPUTABLE`) |
| risk aggregate | `NOT_COMPUTABLE` / `POLICY_INPUTS_UNAVAILABLE` |
| confidence | 0.4939 |

The temptation was to enter `0`. That was refused, correctly: in an artifact a filed zero and an inferred zero are
then indistinguishable, and every downstream number inherits a claim the source never made. The measured baseline
is reproduced with the *post-change* code in `runs/baseline-unchanged-input.json` — the unchanged input still
produces the byte-identical dataset version `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e`
and the same withheld outcomes, so this work item did not silently reinterpret existing data.

## 2. What the implementation actually defines (established by reading it, not assumed)

- **The four components**, `contracts/lineItems.ts`: `SHORT_TERM_BORROWINGS`,
  `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`, `LONG_TERM_BORROWINGS`, `LEASE_LIABILITIES`.
- **Gross debt** = sum of the four. **Net debt** = gross debt − (`CASH_AND_CASH_EQUIVALENTS` + `CURRENT_INVESTMENTS`).
  Both definitions are unchanged by this work item.
- **Aggregation site**: `assessment/capitalStructure.ts`. All four components were already resolved through one
  helper, so a single contract governs them.
- **Blocking gate**: presence-based. `NOT_COMPUTABLE` propagates by construction, so making a component *available*
  is enough to unblock a downstream calculation; no method needed a new branch.
- **Enterprise-to-equity bridge** (`equityValueFromEnterprise`): subtracts net debt and the claims below EV
  (`nonControllingInterest`, `preferenceCapital`, `associatesAndJV`), adds nothing.
- **`EV_REVENUE` never places `netDebt` in its `inputs`** (`methods.ts`), unlike `EV_EBITDA`. Recorded in §8;
  deliberately not changed, because it is a method-input change, not a representation change.

## 3. The representation adopted

Six semantic states, each expressible and each distinguishable in an artifact. **Existing vocabulary was reused for
five of them**; exactly one member was added to each of two closed unions.

| State | Spelling | Meaning |
| --- | --- | --- |
| `REPORTED_VALUE` | `presence: 'PRESENT'` + value | disclosed as a number, **including a reported zero** |
| `NIL_BY_DISCLOSURE` | `presence: 'NIL_BY_DISCLOSURE'` + `reason: 'DECLARED_NIL_IN_SOURCE'` + `source` + `periodEnd`, `value: null` | the source establishes the item is nil / not applicable |
| `NOT_REPORTED` | `presence: 'MISSING'` + `reason: 'NOT_REPORTED'` | not disclosed |
| `SOURCE_UNAVAILABLE` | `MISSING` + `FILING_UNAVAILABLE` / `PERIOD_NOT_COVERED` / `STATEMENT_OUT_OF_SCOPE` | the source could not be obtained |
| `UNMAPPED` | `MISSING` + `NOT_TAGGED_IN_FILING` | a source figure exists with no applicable canonical mapping |
| `NOT_COMPUTABLE` | `NOT_COMPUTABLE` + reason | a calculation cannot run because its prerequisites are incomplete |

Properties that make the distinction load-bearing:

- `NIL_BY_DISCLOSURE` is **not** `PRESENT`: `value` is `null` and `isPresent()` is false, so every pre-existing
  consumer treats it as no number at all. Nothing widens accidentally.
- `NIL_BY_DISCLOSURE` is **not** `MISSING`: it is a positive statement by the filer. `nilByDisclosure()` throws
  without a source reference and a period end, so an inferred nil cannot be constructed — the guard that previously
  existed only as a review rule is now a constructor.
- A reported zero stays a reported zero and is never re-spelled as nil. Both are correct answers to different
  questions, and the counter-tests assert they stay apart.
- Every nil carries source (`{kind:'FILING', ref, filedAt}`), `periodEnd`, `basis` and, where present, the filer's
  own wording in `note`.

Invariant **INV-7** (new, `contracts/invariants.ts`) enforces all of it on any observation: source present, period
end present, reason exactly `DECLARED_NIL_IN_SOURCE`, no numeric value.

## 4. The aggregation contract (the only permission granted)

Documented in the header of `capitalStructure.ts` and implemented as `grossDebtOf()`:

1. Each of the four components must be `PRESENT` or `NIL_BY_DISCLOSURE`. Anything else blocks the aggregate, and
   the blocking observation is published **unchanged**, so `FILING_UNAVAILABLE`, `NOT_TAGGED_IN_FILING` or
   `SOURCE_CONFLICT_UNRESOLVED` reach the artifact with its real reason. (Before this work item a component with a
   specific reason was re-published as `NOT_REPORTED`; that collapse is itself an instance of the same defect one
   level quieter, and it is fixed by `newestReasoned()`.)
2. A nil contributes zero **and is named in the aggregate's `note`**. `components[name]` keeps the nil observation,
   its filing reference and its period — the aggregate is the only place the zero exists.
3. All four components must resolve to the **same period end**; a split (`PERIOD_MISMATCH`) is refused rather than
   summing two balance-sheet instants. This is new and is what makes the nil permission safe: nil is accepted only
   from the same balance sheet as the numbers it is summed with.
4. **Nothing else becomes zero.** Cash and investments keep the strict rule (`PRESENT` only). The claims subtracted
   in the EV→equity bridge (`nonControllingInterest`, `preferenceCapital`) admit a declared nil on the identical
   terms and name it; `associatesAndJV` keeps its existing, separately-disclosed policy zero.
5. `NET_DEBT` in the IID-0 derivation set remains reported-numbers-only (derived items cannot be declared nil —
   `NIL_ON_DERIVED_ITEM`).

`engine.ts` adds one limitation line naming every component counted as nil, so a reader of the artifact sees the
permission without opening the payload.

## 5. Ingestion grammar

`parseNilCell()` (exported from `ingestion/builder.ts`) accepts `NIL` or `NIL: <the filing's own words>`.
`0` is a reported zero. Blank is not disclosed. Three new issue codes guard the boundary:

| Code | When | Effect |
| --- | --- | --- |
| `NIL_ON_DERIVED_ITEM` | a nil cell on a derived line item | ERROR; the cell degrades to `MISSING/NOT_REPORTED`, so no nil can enter a derivation |
| `NIL_WITHOUT_PROVENANCE` | nil cell on a row with no `filing_ref` | ERROR; degrades to `MISSING/NOT_REPORTED` |
| `CONFLICTING_OBSERVATION` | the same item is both reported and declared nil for one period | ERROR; **neither** value is used |

The conflict case needed one extra step to be honest: the per-row branch alone let a later row silently win, so a
whole-dataset post-pass rewrites **every** observation under a contradictory key to
`NOT_COMPUTABLE/SOURCE_CONFLICT_UNRESOLVED`. Neither the number nor the nil is preferred.

## 6. Downstream effect, measured on the real issuer

Input: the Work Item 1 facts with the four unprinted claims declared nil (the input is a **new** file in a **new**
bundle; the Work Item 1 inputs are untouched). Dataset `sha256:cdb29d3406f657c98d1bfa56a560af95f425b5da94c9b99e3e0873395f476813`,
0 ingestion issues, sector coverage unchanged.

| Field | Value |
| --- | --- |
| `leaseLiabilities` | `PRESENT` ₹8,359 cr, `INFY-INDAS-CONSOL-FY24`, 2024-03-31 |
| `shortTermBorrowings`, `currentMaturities`, `longTermBorrowings`, `preferenceCapital` | `NIL_BY_DISCLOSURE` / `DECLARED_NIL_IN_SOURCE`, each with filing ref and period |
| `grossDebt` | `PRESENT` ₹8,359 cr, note naming the three nil components counted as zero |
| `netDebt` | `PRESENT` −₹19,342 cr |
| `DCF_FCFF` / `PE_RELATIVE` / `EV_EBITDA` per-share mid | ₹990.75 / ₹1,270.43 / ₹1,133.95 |
| `intrinsic` (policy weights 0.6/0.1/0.3) | low ₹875.34 · mid ₹1,088.97 · high ₹1,399.81 |
| moat | `NARROW`, ROIC − WACC `PRESENT` |
| risk aggregate | `NOT_COMPUTABLE` / `POLICY_INPUTS_UNAVAILABLE` — **unchanged, D-3** |
| margin of safety | still refused: `NO_PRICE_OBSERVATION` |
| adequacy / quality | `SUFFICIENT` / `MATERIAL_CONCERNS` (both unchanged) |
| confidence | 0.6736, caps `STALE_DATA`, `DILUTION_PROXY` (bounds unchanged) |
| artifact CLI (`--dry-run`) | status `OK`, reportKey `ed1e54b03e5e…`, payloadDigest `71b0d1f9c981…` |

Three things this table does **not** say. It is not a valuation of Infosys and not a validation of one: no market
price was observed, so no margin of safety exists, and the intrinsic band is a policy blend whose inputs (WACC,
terminal growth, peer multiples) carry their own open qualifications. It is not a verdict change: adequacy, quality,
confidence bounds and every threshold are the ones already published. It is not a version of record: nothing was
persisted, the Work Item 1 chain is untouched, and the Infosys reassessment / version comparison is a later work
item.

Sector coverage is unaffected — `Technology` still measures `G2_PARTIAL`, usable 2, withheld 2, statement coverage
87.5%, identical to the Work Item 1 run.

## 7. Tests

`iips-platform/tests/investment/nil-by-disclosure.test.ts` — 27 tests, 5 suites, all passing; no existing test,
fixture or golden was edited.

| Required counter-test | Suite → test |
| --- | --- |
| all four components nil | C → *all four declared nil establishes a complete, zero gross debt with provenance* (gross 0, net −₹270 cr, note names all four) |
| reported zero vs nil | A → *a reported zero and a declared nil are different claims and stay distinguishable*; C → *four reported zeros are not nils* (same total, different claims, no note) |
| positive borrowings | C → *mixed positive and nil components aggregate, and only the nil ones are named* (gross ₹90 cr) |
| mixed positive + nil | same test as above |
| one not reported | C → *one component not reported still blocks the debt position*; D → *an unreported component keeps every dependent calculation unavailable* |
| one source unavailable | C → *one component whose source is unavailable still blocks the debt position* (`FILING_UNAVAILABLE` survives to the aggregate) |
| one unmapped | C → *one unmapped component still blocks the debt position* (`NOT_TAGGED_IN_FILING` survives) |
| conflicting / ambiguous | C → *a conflicting disclosure blocks the debt position instead of being resolved*; B → *a row that both reports and declares nil for the same item is an error, and neither is used* (ingested through two CSV rows) |
| period mismatch | C → *components from different reporting periods are refused, never summed silently*; D → *a period mismatch withholds rather than blending two balance sheets* (`PERIOD_MISMATCH`, per-share `NOT_COMPUTABLE`, `intrinsic null`) |
| source provenance missing | A → *a nil without a period end or with no source is refused at construction (INV-7)*; A → *the invariant checker rejects a hand-built nil that has lost its provenance*; B → *a nil with no filing reference is refused rather than accepted without provenance* |
| **actual reported borrowings** | C → *a debt-bearing issuer is unchanged: reported borrowings aggregate exactly as before* (fixture gross ₹1,540 cr / net −₹1,160 cr) |

Plus: a debt-free issuer end-to-end (DCF and EV both applicable, intrinsic non-null, limitation line present);
moat/leverage/dividend cover consuming the resolved block; and Infosys compatibility on the committed Work Item 1
`periods.csv` (transformed in memory only — the evidence file is not edited, and the test asserts that the nil
declarations introduce no ingestion error).

## 8. Limits of this correction, and the conflicts recorded rather than improvised

- **`EV_REVENUE` does not consume `netDebt`** (`methods.ts`), where `EV_EBITDA` does. Changing it would change a
  method's inputs, so it is recorded here and left alone.
- **The leverage dimension is now evaluated and passes** (net debt is negative), but the published aggregate is
  still `POLICY_INPUTS_UNAVAILABLE`, because no factor is emitted and the vocabulary has no way to say "evaluated
  and passed". That is precisely D-3, whose reason-code change is out of scope here.
- **A nil carries no confidence penalty.** Nil observations are `PRESENT`-equivalent only inside the aggregation
  contract; they do not raise any coverage counter. Confidence rose (0.4939 → 0.6736) because methods that were
  previously withheld now run — the formula and the bounds did not move.
- **Nil is not a general licence for omission.** It is admitted in exactly two places (the four debt components;
  the two EV-bridge claims) and blocks everything else, as the counter-tests show.
- **Schema version is unchanged.** `NIL_BY_DISCLOSURE` is an additional `presence` member, serialised as a string,
  so dataset JSON written before this change remains readable. No new store, table, provider or price source.

## 9. Register and evidence

- `L-001` … `L-029`: **untouched.** No entry closed, renumbered, reinterpreted or re-statused. §14 of the register
  records, as a clarification only, that the D-2 *representation* defect is corrected while every limitation it
  named stands.
- Work Item 1 evidence (`evidence/real-issuer/REL-1-INFOSYS-2026-11-06/`,
  `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/`) is byte-identical to the merged commit. The AC-X2 probe files,
  which its own test rewrites on every run, were restored to their committed bytes after the runs.
- New bundle: `evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/` (input, baseline, reassessment, CLI dry run,
  test log, commands).

## 10. Verification performed

| Check | Command | Result |
| --- | --- | --- |
| Typecheck (platform) | `npx tsc --noEmit` in `iips-platform/` | clean |
| Typecheck (investment server) | `npx tsc -p tsconfig.investment-server.json --noEmit` in `frontend/` | clean |
| Investment suite | `npm run test:iid` | **404 / 404** pass, 102 suites, 0 fail (377 pre-existing + 27 new) |
| D-2 file | `npx tsx --test tests/investment/nil-by-disclosure.test.ts` | 27 / 27 pass |
| Frontend investment area | `npx vitest run server/investment` | 17 files / 205 tests pass (incl. AC-X2 zero-socket) |
| Goldens | `assessment-capital.test.ts` unchanged | gross 1,540,000,000 · net −1,160,000,000 hold |
| Regression of the baseline | unchanged Work Item 1 input re-ingested | same dataset version `ca29c835…`, same withheld outcomes |

## 11. Files changed

| File | Change |
| --- | --- |
| `iips-platform/src/investment/contracts/observation.ts` | six-state documentation; `Presence` + `'NIL_BY_DISCLOSURE'`; `MissingReason` + `'DECLARED_NIL_IN_SOURCE'`; `nilByDisclosure()`, `isNilByDisclosure()` |
| `iips-platform/src/investment/contracts/invariants.ts` | INV-7 and its checks in `checkObservation` |
| `iips-platform/src/investment/ingestion/builder.ts` | `parseNilCell`, nil declarations, three issue codes, dataset-wide conflict poison pass |
| `iips-platform/src/investment/assessment/capitalStructure.ts` | `carriesInformation`, `grossDebtOf`, `newestReasoned`, nil-aware `latest`, lease treatment, EV→equity claims, `usableShares` |
| `iips-platform/src/investment/assessment/engine.ts` | one limitation line naming declared-nil debt components |
| `iips-platform/tests/investment/nil-by-disclosure.test.ts` | new, 27 tests |
| `docs/integration/IIPS_V3_IID_D2_NIL_BY_DISCLOSURE_2026-11-06.md` | this document |
| `docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` | §14 appended (clarification only) |
| `evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/` | new evidence bundle |

No change to: any valuation/quality/risk/moat formula or threshold, any D-3 reason code, `golden-tech.json`, any
existing fixture, the Work Item 1 evidence, or the corpus of limitations.
