# IIPS v3.0 — IID: `L-040` valuation-output correction (WI-8, Industrials / KEC International Limited)

**Record ID:** `IIPS-V3-IID-L040-VALUATION-OUTPUT-CORRECTION-2026-11-07`
**Work item:** WI-8 — the correction of a defect WI-8 itself found (IRR scope only)
**Date:** 2026-11-07 (same day as the WI-8 run it corrects)
**Branch:** `arena/60fea33a-iips-review-recovered` · **Pull request:** #505 (WI-8)
**Baseline:** `6575d68fbe5e3ef4951063d9886b3192ae9c0089` (verified merge of PR #504)
**Outcome:** `L-040` **`RESOLVED`** — both defective surfaces corrected and regression-guarded; the original WI-8 payload
preserved byte-identical as **superseded, non-authoritative** evidence; `L-039`, the underlying bridge gap, untouched and
still `OPEN`.

**The rule this record is written against, stated once:**

> Unavailable inputs must remain unavailable. They must never silently become zero and produce an apparently valid
> valuation or sensitivity result.

---

## 1. What was wrong

The WI-8 run of record (`artifact/assessment-payload-kec-wi8.json`, payload digest `4f89f0ec…e351`) published a
per-share value for an issuer whose enterprise-to-equity bridge the same payload declared unavailable.

| Surface | What the payload said | What it should have said |
|---|---|---|
| `valuation.sensitivity[0].points[4].value` (base cell, WACC 10.68 %, g 4.00 %) | **₹488.34** | no per-share value |
| the other eight cells | ₹439.07 … ₹670.93 | no per-share value |
| `valuation.methods[DCF_FCFF].output.perShareMid` | `NOT_COMPUTABLE: NOT_REPORTED`, *"enterprise-to-equity conversion blocked by netDebt"* | unchanged (already correct) |
| `evidence[EV-DCF_FCFF].claim` | *"DCF_FCFF produced a per-share value from 3 present input(s)"* | the refusal it actually produced |

The grid's nine numbers were produced by *treating every missing bridge term as nil*: enterprise value divided by
266,193,406.59 diluted shares. The issuer's `netDebt`, `minorityInterest`, `preferenceCapital`, `cashAndInvestments`,
`currentInvestments` are all `MISSING: NOT_REPORTED`, and `associatesAndJV` is `NOT_COMPUTABLE`. ₹488.34 per share was
therefore the enterprise value of a company **as if it had no debt at all** — an apparently valid valuation produced from
four absences, which is exactly the failure D-2 forbids, committed by the pipeline's own arithmetic one level above the
dataset.

## 2. Root cause

**Primary (`iips-platform/src/investment/assessment/intrinsic.ts`, `buildSensitivity()`).** The grid re-implemented the
enterprise-to-equity bridge inline, with nullish-coalescing defaults:

```
(EV − (netDebt ?? 0) − (minorityInterest ?? 0) − (preferenceCapital ?? 0) + (associatesAndJV ?? 0)) / shares
```

The governed conversion — `equityValueFromEnterprise()` and `perShare()` in `capitalStructure.ts`, the pair the DCF
method's own per-share leg uses — refuses and names the blocking component. The grid did not call it. It could not have
been caught by any payload consumer: the numbers were well-formed, in-domain, monotone in WACC and growth, and
*plausible*; only comparison with the method's own refusal reveals the contradiction.

**Secondary (`iips-platform/src/investment/assessment/engine.ts`, `buildEvidence()`).** The `EV-DCF_FCFF` claim was
composed from the method's *applicability* and its present-input count, not from its *output*. It asserted a per-share
value while declaring `supports: valuation.methods[0].output.perShareMid`, whose `presence` was `NOT_COMPUTABLE` and
whose `value` was `null`.

Both are one class of defect: **a claim about a number that was never computed.**

## 3. Every affected path, exhaustively

The corrected payload differs from the original in **20 JSON paths** (`runs/12-l040-payload-diff.json`, computed by a
recursive walk of the two committed artifacts):

| Path | Count | Before | After |
|---|---|---|---|
| `.evidence[0].claim` | 1 | *"…produced a per-share value from 3 present input(s)"* | *"…produced no per-share value: NOT_COMPUTABLE (NOT_REPORTED) — enterprise-to-equity conversion blocked by netDebt"* |
| `.valuation.sensitivity[0].points[i].value` | 9 | a per-share number | `null` |
| `.valuation.sensitivity[0].points[i].enterpriseValue` | 9 | absent | the discounted enterprise value that did compute |
| `.valuation.sensitivity[0].withheld` | 1 | absent | `{ presence: NOT_COMPUTABLE, reason: NOT_REPORTED, note: "…blocked by netDebt" }` |

Nothing else in the payload moved — not the enterprise value, not the refusals, not confidence (0.3199), not quality
(`MATERIAL_CONCERNS`), not risk, not moat, not dividends, not the limitations list. `runs/12-l040-payload-diff.json`
carries the change count so a future reader can check the claim rather than trust it.

**Other sensitivity outputs checked for the same defect.** `buildSensitivity` is the only sensitivity surface in the
engine (one `DCF_FCFF` grid per assessment); there is no second grid, no EV-multiple sensitivity and no scenario table.
The `?? 0` sites elsewhere in the platform (`risk.ts` leverage, `dividends.ts` coverage, `adequacy.ts`,
`capitalStructure.ts` component sums) are all **presence-guarded**: each substitutes a default only after asserting the
observation is absent, and each publishes the absence. They were inspected and deliberately **not** changed — the defect
was specific to a per-share figure derived from a zero, not to the existence of defaults.

## 4. The correction, and why it is the narrowest one available

**Grid.** `buildSensitivity()` now converts through `equityValueFromEnterprise()` and `perShare()` — the governed
functions, used verbatim, including the AC-2.4 period guard. So a per-share cell exists **only where the method's own
per-share leg could have produced one**; the two surfaces can no longer disagree.

* conversion refused → every cell publishes `value: null`, and the grid carries
  `withheld: { presence: 'NOT_COMPUTABLE', reason, note }` with the conversion's own reason and note (the convention the
  method output already uses), plus `enterpriseValue` per cell as **diagnostic arithmetic**;
* conversion succeeded → every cell publishes the unchanged `{ waccBps, growthBps, value }` shape. The two new fields are
  **optional and emitted only on the withheld path**, which is what keeps every previously committed payload digest
  reproducible — the IX authorized-policy artifact still rebuilds byte-identically, because a healthy payload serializes
  exactly as it did before.

**Evidence.** The claim is now conditional on the per-share output: `PRESENT` yields the original sentence unchanged
(*"DCF_FCFF produced a per-share value from N present input(s)"*), anything else yields *"DCF_FCFF produced no per-share
value: PRESENCE (REASON) — note"*. `supports` and `observationRefs` are unchanged, so no evidence identifier, order or
reference moved.

**Presentation.** The rendered view (`view.ts`) prints the enterprise-value column labelled *"(diagnostic)"* when the
grid is withheld, renders withheld cells as `withheld` rather than *"out of domain"*, and emits a notice naming the
blocking reason and component, so a reader of the artifact cannot mistake the diagnostic column for a valuation.

**Deliberately not done:**

* no replacement per-share value, no imputation, no interpolation, no "conservative" assumption — the grid publishes
  fewer numbers, not different ones;
* no D-2 semantic change, no valuation-policy change, no authorized-parameter change, no unrelated formula touched;
* the issuer's own data was not revisited: no source PDF re-read, no ingest input edited, no dataset row rewritten, no
  re-ingest with different parameters. `datasetVersion` is **unchanged** (`sha256:0df73ead…82ab`), and so is the
  `inputDigest` (`sha256:513993f2…f22b`) — the only input that changed between the two runs is the code.

## 5. Corrected behaviour on this issuer

`artifact/assessment-payload-kec-wi8-l040-corrected.json`, payload digest
**`fc50c53e08814d7851d7b9bb569ddf1eb4eec19ad7508c3c16db9b13a943f370`**, 52,760 bytes, reportId
`c1ffcd56-2f0e-4957-b314-a8731217bfdb`:

```
sensitivity[0].withheld = { presence: NOT_COMPUTABLE, reason: NOT_REPORTED,
                            note: "enterprise-to-equity conversion blocked by netDebt" }
points: 9, each { waccBps, growthBps, value: null, enterpriseValue: <discounted EV> }
        base cell (1068/400): enterpriseValue 129,992,950,487.77, value null
evidence[EV-DCF_FCFF].claim = "DCF_FCFF produced no per-share value: NOT_COMPUTABLE (NOT_REPORTED) — …
                               conversion blocked by netDebt"
methods[DCF_FCFF]: applicable, baseFcff 9,184,155,840, basis "FCFF base 9184155840, WACC 10.68%, g 4.00%, 5y horizon",
                   perShareMid/Low/High NOT_COMPUTABLE, value null
intrinsic: null      marginOfSafety.refusal: NO_PRICE_OBSERVATION
```

The payload now refuses once, coherently, in four places instead of publishing a number in one and refusing in three.

**Is ₹488.34/share retained anywhere?** Only where it belongs: inside the **original** payload
(`artifact/assessment-payload-kec-wi8.json`, byte-identical, digest `4f89f0ec…e351`), which the bundle, the record and the
guard test all label **superseded, non-authoritative historical evidence** of the defect. It appears nowhere in the
corrected payload (`JSON.stringify(corrected).includes('488.3402340852422') === false`, asserted in the guard test), and
nowhere in any current documentation as a valuation.

## 6. Regression protection

New file `iips-platform/tests/investment/l040ValuationZeroSubstitution.test.ts` — **17 tests**, all failing against the
pre-correction code:

| Case | Assertion |
|---|---|
| missing current investments | blocks `cashAndInvestments` and `netDebt`; grid `withheld`; no per-share value anywhere |
| missing net debt alone | all nine cells `value: null` with a numeric `enterpriseValue` |
| missing debt component (`CURRENT_MATURITIES_OF_LONG_TERM_DEBT`) | blocks gross debt → withholds, naming netDebt |
| missing minority interest / preference capital | withholds, naming that component |
| cross-surface agreement | the grid's `withheld` equals the method's `perShareMid` presence/reason/note |
| zero-substitution is gone | no published cell equals `EV / shares` computed from the defective formula |
| diagnostic quarantine | enterprise-value column present and enterprise-scale; never a `value` |
| healthy grid | no `withheld`, no `enterpriseValue` — the legacy shape exactly |
| evidence claim (refused) | states the refusal, reason and blocking component; does not claim a per-share value |
| evidence claim (converted) | original sentence, unchanged, with `supports` intact |
| explicit zero | issuer-reported `0` for NCI / preference / current maturities still converts (9 values) |
| declared nil | `NIL_BY_DISCLOSURE` converts as a declared nil, not as an absence and not as a number |
| explicit zero vs unavailable | the same item missing — not declared nil — withholds, and the two payloads differ |
| preservation | nine monotone per-share cells and the base point still at the DCF mid (±0.5 %) |
| preserved arithmetic | on a withheld grid the EV column still falls as WACC rises |

`iips-platform/tests/investment/wi8IndustrialsKec.test.ts` was extended (not softened): it now pins the historical payload
as unchanged and defective, pins the corrected payload's `withheld` block and null per-share column, pins the corrected
evidence claim, pins the corrected readback digest, pins the 20-path diff, and pins the correction record's own claims.
The register assertions were moved from "`L-040` is `OPEN`" to "`L-040` is `RESOLVED` **and** `L-039` is still `OPEN`", so
the correction cannot be used to quietly close anything else.

**Results.** `npx tsx --test tests/investment/*.test.ts` → **636 tests, 148 suites, 636 pass, 0 fail** (10.1 s). Before the
correction the same command returned 614 tests / 0 fail; the 22 added tests are the 17 above plus 5 in the WI-8 bundle
guard. `npx tsc --noEmit -p tsconfig.json` → **exit 0, no diagnostics**.

## 7. Historical evidence and what was not rewritten

| Item | Treatment |
|---|---|
| `artifact/assessment-payload-kec-wi8.json` | **unchanged**, byte-identical, digest `4f89f0ec…e351`, labelled superseded / not authoritative in the bundle README, the register, this record and the guard test |
| `determination-wi8.json`, `runs/01`–`runs/08`, `ingest-input/`, `source/` | **unchanged**: the run of record, its findings and every verbatim page extract are as they were |
| the KEC ingest run | **not repeated**: `datasetVersion` `sha256:0df73ead…82ab` reproduces exactly, from the same input, so the correction is attributable to code alone |
| issuer evidence | no source PDF re-read, no figure re-extracted, no dataset row edited, no nil declaration added |
| `L-039` | **untouched**: the bridge still cannot close without a current-investments line, and it still publishes no per-share value |
| `L-035`, `L-036`, `L-037`, `L-038`, `L-034` | **untouched**: no status improved, none rewritten |
| unrelated zero-substitutions | **untouched**, after inspection: they are presence-guarded and outside this defect |

**Correction run.** `runs/09`–`runs/12` record it end to end: ingest (same datasetVersion), generate (`CREATED`, chain
length 1), a separate-process readback (`digestMatch true`, 52,760 bytes), and the payload diff. `runs/17-l040-commands.txt`
carries the exact commands. The corrected payload reproduces **twice** with the same digest (`fc50c53e…f370`), and its
`reportKey` (`15b68ca5…`) and `inputDigest` (`513993f2…`) are identical to the original run's — the same assessment, the
same input, the same code path, one defect fewer.

## 8. Verification

| Check | Result |
|---|---|
| targeted regression suite (`l040ValuationZeroSubstitution.test.ts`) | 17/17 pass |
| investment-platform suite (`tests/investment/*.test.ts`) | 636/636 pass, 0 fail (`runs/13-l040-tests.txt`) |
| typecheck (`tsc --noEmit`) | 0 errors (`runs/14-l040-typecheck.txt`) |
| committed IX authorized-policy artifact still rebuilds byte-identically | yes — `ixAuthorizedPolicy.test.ts` green; optional fields are emitted only on the withheld path |
| corrected payload reproducible and read back by digest, separate process | yes (`runs/11-l040-readback.json`) |
| bundle manifest (`digests.json`) after the correction | 51 files, every digest verified by the guard test |
| clean clone of the pushed branch (`c8e08b6…`) | `npm ci` (6 packages, then 190 in `frontend`); 636/636 tests, 148 suites; `tsc --noEmit` 0; 53-file manifest re-hashed clean; both payload digests recomputed; both source bundles untouched; the corrected payload **regenerated to `fc50c53e…f370`** from the same input (`runs/15-l040-clean-clone.txt`) |
| dataset digest | **unchanged**: `sha256:0df73ead…82ab` |
| original persistence record | **preserved**: reportId `85809cbd…`, payload `4f89f0ec…`, chain length 1, untouched |
| corrected output mistakable for an authoritative valuation | no: no per-share value is published, the EV column is labelled diagnostic, the grid carries `withheld` |
| unrelated repository changes | none: the diff is two source files' arithmetic, one type, one evidence-claim function, one view block, two test files, the bundle and the records |

**CI versus local — kept apart.** Local verification is everything in the table above. **CI is a different claim, and
here it is a real one:** this correction is the first WI-8 push to touch a path the repository's single check
(`CAP-03 Revision 7 IRR-only static checks`) is filtered on — the master tracker, where §16.274 carries the work item — so
that workflow ran for the first time on PR #505 and **passed**:

| head | run | event | conclusion |
|---|---|---|---|
| `c8e08b6` | `42358220694` | `pull_request` (PR #505) | success (44 s) |
| `65e1422` | `42373092259` | `pull_request` (PR #505) | success |

Both runs performed the workflow's six steps — Python compile of the standard-library validator, artifact-classification
tests, receipt-routing tests, Revision 7 source/evidence/tracker validation, independent CAP-03 recovery-release
verification, and a changed-file `git diff --check` — and both are cited **by run id, read back through the Actions API**
(`runs/16-l040-ci-check.txt`). `gh pr checks 505` still prints *"no checks reported"* for this head even though those runs
are attached to PR #505; that checks-API/Actions-API disagreement is recorded rather than smoothed over. **No npm,
frontend or IPD CI runs for these paths, and none is claimed**; the npm tests, typecheck and clean clone above are local
verification and are never presented as CI.

## 9. Limitation status after this correction

| Entry | Status | Note |
|---|---|---|
| **`L-040`** | **`RESOLVED`** (2026-11-07) | both surfaces corrected, 17 acceptance tests that fail on the pre-correction code, evidence pointer in the register entry |
| `L-039` | `OPEN` (unchanged) | the bridge still needs a current-investments line; this correction makes the refusal coherent, it does not make the bridge close |
| `L-038` | `OPEN` (unchanged) | debt half, still untested here |
| `L-036` | `PARTIALLY RESOLVED` (unchanged) | `REVIEW_DUE` control; no filed carrying value |
| `L-035`, `L-037` | `OPEN` (unchanged) | not exercised |
| `L-034` | `RESOLVED` (unchanged) | — |

`L-040` is `RESOLVED` under the register's own rule — (a) an implementation that addresses the entry, (b) an acceptance
test that fails if it regresses, (c) the test pointer in the entry — and it is **not** closed by rhetoric: the sentence a
reader needs, *"there is no per-share value because the bridge cannot close, and here is the component that blocks it"*, is
now what the payload says.

## 10. Boundary

WI-8 now shows both halves of the same discipline in one work item: the first, that a pipeline may publish a **refusal**
where a filing cannot support a number; the second, that when it publishes one it must be **true of its own arithmetic**
too. `L-039` records the gap that remains — an issuer that prints cash, borrowings, leases and current maturities in full
can still have no net debt — and the honest resolutions of that gap are still the register owner's decision, not this
correction's.
