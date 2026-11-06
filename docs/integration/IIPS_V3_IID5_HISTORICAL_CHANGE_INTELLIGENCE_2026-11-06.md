# IIPS v3.0 — IID-5: Historical Investment Change Intelligence

**Programme:** IIPS v3.0 Investment Intelligence Design (IID)
**Phase:** IID-5 (change intelligence / IID-03 / ★M-2)
**Record ID:** caveat-free implementation record for `IIPS-V3-IID5-HISTORICAL-CHANGE-INTELLIGENCE`
**Date:** 2026-11-06
**Starting commit:** `ffb80ce` (PR #478 merge on `main`; the IID-5 baseline)
**Governing decision:** `IIPS_V3_IID_L014_SUBSTANTIVE_IDENTITY_DECISION_2026-11-06.md` (obligations `O-1`…`O-9`,
acceptance tests `AC-L14.1`…`AC-L14.10`)
**Design authority:** `IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md`, Appendix A3 (`A3.1`–`A3.5`),
R-13, R-14, §B.F/B.G of the roadmap
**Latest pass:** post-publication remediation (2026-11-06) — §13. Three obligations hardened (`O-5`, `O-7`, `D-3`),
one open question answered (`Q-1`); no change of status.
**Scope:** IRR only. The Investment Product Domain (IPD) was not modified: no IPD source file, pin, contract or test
was touched, and the disposition surface continues to use IPD's existing adapter and persistence contract.

---

## 1. What was built

Change intelligence answers four questions about two stored versions of the same subject:

1. **Did anything substantive change?** — decided from the two stored payloads' *substantive* identities
   (`substantive-identity/1`), not from their bytes.
2. **What changed?** — a declared **semantic dimension map** (§3), so a key reordering cannot masquerade as a change.
3. **How much does it matter?** — a versioned **materiality policy** (`materiality-policy/1.0.0`) with published
   thresholds per comparison mode.
4. **Why did it change, and is that attribution trustworthy?** — a **2×2 attribution** that is `EXACT` only when it is
   computable, and `UNAVAILABLE` (never estimated) when it is not.

Around those four answers the phase adds: read-time **reproduction** of every stored version from its own bytes;
**review triggers** phrased as questions; **durable boundary reports** on the pre-existing `icr:` scope; **coverage and
reconciliation** over a chain's consecutive pairs; a **read-only transport**; and labelled, **retroactive** substantive
identity for versions written before this phase.

## 2. Architecture (and why each boundary sits where it does)

| Layer | File | Responsibility | Explicitly NOT its job |
|---|---|---|---|
| Identity | `frontend/server/investment/substantiveIdentity.ts` | The two closed grammars, the exclusion lists, the minimal projection, both digests, the input projections, the **member inventory** (O-9) | Not a second `payloadDigest`; not a clock model |
| Materiality | `.../change/materiality.ts` | `materiality-policy/1.0.0`: modes, thresholds, classification, ordering | Not a per-dimension special case; no hidden constants |
| Dimensions | `.../change/dimensionMap.ts` | The declared facts: path, type (`ADDITIVE`/`RATIO`/`ORDINAL`/`NOMINAL`/`PRESENCE`/`SET`), unit, category, declared transitions | Not a structural diff |
| Comparison | `.../change/compare.ts` | Pair classification (`SUBSTANTIVE` / `GENERATION_METADATA_ONLY` / `FRESHNESS_TRANSITION`), items, summary, metadata block | Does not decide materiality itself |
| Attribution | `.../change/attribute.ts` | `EXACT` (one model identity → data effect, additivity verified) / `UNAVAILABLE` (`UNATTRIBUTED`, no estimate) / `NOT_APPLICABLE` | Never interpolates a leg |
| Reproduction | `.../change/reproduce.ts` | Recompute `payloadDigest` and `substantiveDigest` from stored bytes; record what could not be attempted | Does not re-run an old model it cannot run |
| Review | `.../change/review.ts` | Closed trigger list, priority, focus **questions** | No verb, no action, no instruction |
| Composition | `.../changeComposition.ts` | Change-report payload on `icr:<subjectScope>`, `investment.change-report` | No new store, no journal, no side table |
| Service | `.../changeService.ts` | Adjacent comparisons, boundaries, coverage, reconciliation, disposition comparison | No writes except ordinary artifacts |
| Transport | `.../change-transport.ts` | Two GET/HEAD routes, sanitized failures | No mutating route at all |
| Record path | `.../investmentArtifacts.ts` (modified) | Substantive identity decides versioning; read-time verification; `CLOCK_ONLY_UNCHANGED` | `payloadDigest` semantics unchanged |

**Why the identity work had to come first.** Version creation happens in `recordComposed`. Until that path compares
*meaning*, every later capability would inherit a history padded with clock-only versions (§4). The phase therefore
changed the smallest possible surface of the record path — the idempotency branch — and left chain construction,
report keys, scope validation, supersession and read-back verification exactly as they were.

**Why change reports are ordinary artifacts.** `icr:` and `investment.change-report` were already in the closed
report-type registry (reserved by IID-3). Reusing them means a reconciliation run leaves only artifacts, which are
read, validated and tamper-detected by the same code as every assessment and disposition. A private store would have
added a second thing to trust.

## 3. The semantic dimension map (what can produce an item)

Twenty-nine assessment dimensions and twelve disposition dimensions, each with a declared type and unit. Deliberately
**not** dimensioned, because they describe the *dataset* a version was built from rather than an investment fact:
`data.datasetVersion`, `data.contentDigest`, `asOf.dataAsOf`, `asOf.knownAsOf`. Those appear in the comparison's
provenance, so re-pointing a dataset cannot rewrite what an old diff says (AC-5.10). `asOf.staleBeyondPolicy` **is**
dimensioned: crossing the freshness window changes what the assessment can claim.

| Category | Examples |
|---|---|
| `FUNDAMENTAL` | revenue, PAT, operating cash flow, diluted EPS, total equity, 3-year revenue/PAT CAGR |
| `MARKET_VALUATION` | intrinsic value mid, margin of safety vs mid, admissible price, MoS band |
| `RISK_QUALITY` | quality verdict and flags, adequacy, moat, risk aggregate and factors, freshness, dividends, confidence, coverage |
| `DISPOSITION` | verb, confidence, adequacy, gate outcomes, cited assessment version |
| `PORTFOLIO` | company exposure, weight, sector exposure, concentration band, portfolio revision |
| `DATA_CORRECTION_RESTATEMENT` | restated line items, keyed by period and field |
| `MODEL` | model/policy versions, applicable method set |
| `IDENTITY_MAPPING` | issuer identity, roster/listing-map/corporate-action table versions, sector |

`IDENTITY_MAPPING` exists for one reason: without it, a re-mapping presents as a fundamental collapse — the single
most misleading thing a change report could say.

**Direction is declared, not inferred from arithmetic.** `asOf.staleBeyondPolicy` and `dividends.verdict` have scales
whose numeric order runs opposite to investment direction; both declare a `directionOf`, so a report cannot say an
assessment *improved* because its statements went stale.

## 4. Versioning behaviour (O-2, O-3)

| Submitted content | Outcome | Version written |
|---|---|---|
| Bytes identical to the head, inputs identical | `UNCHANGED` | no |
| Bytes identical, clock-free input identity different | `INPUT_CHANGED_CONTENT_IDENTICAL` | no |
| Bytes differ, **substantive identity identical** | **`CLOCK_ONLY_UNCHANGED`** (new) | **no** |
| Substantive identity differs | `APPENDED` | yes, same chain, same `reportKey` |

`payloadDigest` is untouched: still SHA-256 over the stored canonical bytes, still the tamper detector, still what
`UNCHANGED` keyed on before. `CLOCK_ONLY_UNCHANGED` additionally reports `unpersistedPayloadDigest`, so the bytes that
were not written are identifiable rather than silently dropped.

A writer that declares a substantive digest its payload does not have is refused **before** the store is touched
(`CONTENT_DIGEST_MISMATCH`), on the write path as well as the read path.

## 5. Obligation matrix (O-1 … O-9)

| O | Obligation | Where implemented | Test that fails if it regresses |
|---|---|---|---|
| O-1 | Close, version, publish the exclusions | `substantiveIdentity.ts`: `ASSESSMENT_EXCLUDED_MEMBERS`, `DISPOSITION_EXCLUDED_MEMBERS`, `ASSESSMENT_SUBSTANTIVE_GRAMMAR`, `DISPOSITION_SUBSTANTIVE_GRAMMAR`, `SUBSTANTIVE_IDENTITY_POLICY` | `substantive-identity.test.ts` "carries exactly the decided assessment/disposition exclusions, no more"; "names the two grammars…"; the five reference digests |
| O-2 | Minimal projection, canonical form | `substantiveProjection` / `substantiveProjectionText` (reuses `canonicalizePayload`) | "reproduces C1 from the canonical payload TEXT" |
| O-3 | Version policy: metadata-only ⇒ no new version; substantive ⇒ new version | `investmentArtifacts.recordComposed` idempotency branch | `store.test.ts` "does NOT append a clock-only re-run…"; "appends a substantive change to the SAME chain" |
| O-4 | Two grammars, one per report type, closed | `substantiveGrammarFor` / `excludedMembersFor` (refuse unknown report types) | "refuses a report type with no grammar instead of defaulting to one" |
| O-5 | Input identity without the clock, **and the disposition's citation of the assessment's** | `assessmentSubstantiveInputDigest` (19 named members), `dispositionSubstantiveInputDigest`, `assessmentSubstantiveIdentity`; `ComposeDispositionInput` and `DispositionRecordsService.record` **require** both assessment substantive digests and write them into provenance unconditionally (§13.1) | "moves with the dataset but not with the clock"; "is composed of distinct named members"; "a disposition builder cannot omit the cited assessment identity"; "records the cited assessment identity even when the clocks agree" |
| O-6 | Verify recorded digests on read; refuse when untrustworthy | `substantiveViewOf` (read) and `validateSubmission` (write); `reproduce.ts` | "refuses to compare a chain whose stored bytes no longer match their recorded digest"; "refuses a submission whose declared substantive digest does not describe its payload" |
| O-7 | Three-way pair classification, and a review block that agrees with it | `compare.ts` (`SUBSTANTIVE` / `GENERATION_METADATA_ONLY` / `FRESHNESS_TRANSITION`), `FRESHNESS_CONSEQUENCE_DIMENSIONS` in `dimensionMap.ts`, `MATERIAL_CHANGE` trigger in `review.ts` (§13.3) | "classifies a clock-only re-run as GENERATION_METADATA_ONLY with ZERO items"; "…a freshness crossing as FRESHNESS_TRANSITION"; "…a genuine value change as SUBSTANTIVE"; `ac-l14.test.ts` AC-L14.4 (asserts the decision's own C4→C1 pair) |
| O-8 | Retroactive, labelled legacy derivation | `versionViewOf` → `substantiveDigestSource: 'DERIVED'`; `reproduce.ts` `source: 'DERIVED'` | "labels a version written before the implementation as DERIVED and still compares it" (asserts the stored row was **not** rewritten) |
| O-9 | Closed member inventory per schema | `ASSESSMENT_MEMBER_INVENTORY`, `DISPOSITION_MEMBER_INVENTORY`, `assertPayloadInventory` | "refuses a member that is neither retained nor excluded"; nested-object, closed-array-item and disposition cases; "names the offending member paths" |

## 6. Acceptance matrix (AC-L14.1 … AC-L14.10)

Keyed to the decision's **own** §8.2 table. The first version of this record organised the same ten criteria by
property and renumbered them, which made the matrix un-checkable against the decision; `ac-l14.test.ts` now exists so
each criterion has a test that fails if it regresses, and AC-L14.8–AC-L14.10 point at the store/identity tests that
already assert them (duplicating them would have created two places to keep true).

| AC (decision §8.2) | Requirement | Test | Result |
|---|---|---|---|
| AC-L14.1 | Same dataset, 00:00 → 06:30: bytes differ, substantive identical, `reportKey` unchanged, `CLOCK_ONLY_UNCHANGED`, `wrote: false`, one version | `ac-l14.test.ts` "AC-L14.1 — a same-day re-run at a new clock mints no version" | PASS |
| AC-L14.2 | Next day: `stalenessDays` 220→221 and `bindingRef` move, substantive still `08ea8d4a…`, no write | "AC-L14.2 — a next-day re-run moves staleness and the binding, not identity" | PASS |
| AC-L14.3 | Dataset v2: `08ea8d4a…`→`34240407…`, `APPENDED`, same `reportKey`, one new version | "AC-L14.3 — a different dataset appends to the same chain" | PASS |
| AC-L14.4 | Freshness crossing: `staleBeyondPolicy` false→true, `CLEAN`→`MATERIAL_CONCERNS`, `0.8371`→`0.674`, `fd9589e4…`→`08ea8d4a…`, `APPENDED`, classified `FRESHNESS_TRANSITION` with `RISK_QUALITY` items | "AC-L14.4 — crossing the freshness window is a FRESHNESS_TRANSITION, not a data change" | PASS |
| AC-L14.5 | Model bump: only `MODEL` items, substantive differs; policy bump likewise | "AC-L14.5 — a model or policy bump is isolated from the data" | PASS |
| AC-L14.6 | One changed financial figure: substantive differs, `FUNDAMENTAL` item reported | "AC-L14.6 — a changed financial figure is never swallowed by the exclusion list" | PASS |
| AC-L14.7 | Disposition re-run at a new clock: substantive identical, `CLOCK_ONLY_UNCHANGED`, no write; recomputed assessment keeps `substantiveInputDigest` | "AC-L14.7 — a disposition re-run cites a clock-free assessment identity" | PASS |
| AC-L14.8 | Pre-decision version: computable, labelled derived, no write, no stored field changed | `change/store.test.ts` "labels a version written before the implementation as DERIVED and still compares it"; "is served as DERIVED, compared against a recorded version, and left untouched on disk" | PASS |
| AC-L14.9 | Tamper: both digest checks fail closed; a recorded digest that disagrees is refused | `change/store.test.ts` "refuses to compare a chain whose stored bytes no longer match their recorded digest"; "refuses a submission whose declared substantive digest does not describe its payload" | PASS |
| AC-L14.10 | Inventory: an unlisted member fails the inventory test | `substantive-identity.test.ts` "refuses a member that is neither retained nor excluded"; the nested-object, closed-array-item and disposition cases; "names the offending member paths" | PASS |

The decision's §5.1 assessment vectors (five payload digests, five substantive digests, three engine input digests)
reproduce byte-for-byte; §5.2's disposition vectors do not reproduce from this repository's fixture, and §13.4 says so
with the measurement behind it rather than quoting a number no run can obtain.

## 7. Reproduction, integrity and chain behaviour

- **Reproduction** recomputes `payloadDigest` *and* `substantiveDigest` from the stored bytes on every read. A
  disagreement is `CONTENT_DIGEST_MISMATCH` and the read fails; it is never a warning attached to a plausible result.
- **What reproduction cannot do is recorded, not hidden.** `modelBuildDigest` and `platformCommit` are `null` with the
  reason stated: this repository holds one build of the frozen engine, so an old model cannot be re-executed.
  `UNAVAILABLE` is used for "not attempted"; `MISMATCH` is reserved for "attempted and failed".
- **Chains** are unchanged: one scope token + one report type = one chain; append to the same `reportKey`; version 1
  is never rewritten; head-only idempotency (L-013) is preserved. `icr:` chains are separate chains that reference
  the subject chain by report id and version, never by rewriting it.
- **Boundary reports are deterministic.** `generatedAt` is the explained version's `generatedAt`, and the content is a
  pure function of the two stored payloads, so reconciliation over an already-explained boundary computes identical
  bytes and the record path reports `UNCHANGED`. Re-running it is a no-op, which is what makes it schedulable.
- **Coverage is stated.** `coverage()` names every consecutive pair that no stored report explains; `reconcile()` can
  fill them (labelled `VERSION_BOUNDARY_RECONSTRUCTED` when a reproduction leg is not `EXACT`). A gap is a fact about
  the history, not an error to hide.

## 8. Demonstration (real store, real fixtures, no mocks)

The store suite performs the following against a governed NP-04 SQLite store:

1. records the M1 assessment (version 1), re-runs it at a later clock → `CLOCK_ONLY_UNCHANGED`, chain still 1 version;
2. records a +12 % intrinsic-value variant → `APPENDED` (version 2), same `reportKey`;
3. records a quality downgrade → `APPENDED` (version 3);
4. compares all adjacent pairs → `[SUBSTANTIVE, SUBSTANTIVE]`, attribution `EXACT`/`DATA`, reproduction `EXACT`;
5. writes the 1→2 boundary → change report `CREATED` on `icr:co:…`; repeats it → `UNCHANGED`, same report id;
6. reconciles → 2 boundaries, coverage complete; reconciles again → 0 created;
7. injects an append failure on the 2→3 pair → 1 created, 1 gap, `complete: false`; then fills only that gap;
8. tampers with the stored bytes → the comparison and the chain read both refuse;
9. strips the substantive members from a stored row (a pre-IID-5 write) → served `DERIVED`, compared correctly, and
   the row still contains no digest afterwards;
10. records two dispositions differing only by clock → `CLOCK_ONLY_UNCHANGED`; then a verb change to `AVOID` →
    `APPENDED`, compared on the disposition grammar, `CRITICAL`, review priority `HIGH`.

## 9. Tests and typechecks run

| Command | Result |
|---|---|
| `npx tsc -p tsconfig.investment-server.json --noEmit` | clean |
| `vitest run server/investment` | **197 passed / 14 files** — of which **85 are IID-5 tests** (`substantive-identity` 25, `ac-l14` 7, `change/comparison` 30, `change/store` 13, `change/transport` 10) |
| Targeted legacy suites re-run after the record-path change | `investment-artifacts` 15, `investment-transport` 14, `disposition-records` 15, `disposition-composition` 16, `disposition-transport` 15, `assessment-composition` 15, `m1-demonstration` 1 — all pass |

Two existing assertions were **updated rather than worked around**, and both are behaviour the decision explicitly
changed:

- `disposition-records.test.ts` previously asserted that a later clock `APPENDED` a version. It now asserts
  `CLOCK_ONLY_UNCHANGED` with `wrote: false`, and names the decision that changed it.
- `investment-artifacts.test.ts` fixtures that hand-edit a payload now recompute both identities, because the recorder
  refuses a declared digest its payload does not have (O-6). The `INPUT_CHANGED_CONTENT_IDENTICAL` fixture now moves the
  **substantive input** identity, which is what that outcome now means.

## 10. What this phase does NOT do

- **No IID-6 surface.** No product UI, no dashboard, no chart, no portfolio screen. Two GET/HEAD routes serve
  comparison JSON for the roadmap's read capability; there is no IID-6 route, component or view.
- **No new persistence.** No store, no table, no journal, no cache, no Reports-local persistence. Boundary reports are
  ordinary artifacts on `icr:` chains.
- **No rewritten history.** No IID-3/IID-4 artifact is modified. Legacy identity is derived on read and labelled.
- **No frozen-engine change.** `assessment-engine/1.0.0` and its `inputDigest` are untouched; the disposition adapter
  and IPD persistence are untouched.
- **No trading path.** No order, quantity, price, brokerage or execution concept anywhere in the phase, and the
  response disclosure says so on every read.
- **No invented identity.** Model build digest and platform commit of a historical version are reported as
  unavailable, not back-filled with today's values.

## 11. New limitations opened by this phase

`L-028` and `L-029` (§9 of the register):

- **L-028** — change intelligence covers exactly two report types (assessment, disposition). Attribution is
  `UNAVAILABLE` whenever the model or policy identity differs, because only one build of the frozen engine exists.
  Any other artifact type, or a cross-model comparison, is out of scope until an executable old model exists.
- **L-029** — `materiality-policy/1.0.0` thresholds are published defaults, not calibrated against realised outcomes,
  and change reports themselves have no substantive-identity grammar (their identity is their bytes). Both are named
  rather than papered over.

## 12. Status

**IID-5: IMPLEMENTED, TESTED, PUBLISHED** — plus the post-publication remediation pass recorded in §13, which
hardened three obligations without changing the phase's status. `L-014`'s implementation obligation is discharged (obligations `O-1`…`O-9`,
acceptance tests `AC-L14.1`…`AC-L14.10`, regression tests, and this record plus the evidence bundle). **IID-6 remains
NOT STARTED.** `L-001`–`L-013` and `L-015`–`L-027` are untouched; `L-028`/`L-029` are appended.

---

## 13. Post-publication remediation pass (2026-11-06)

This phase was published as PR #479 (`17f9395`). A re-issued work item asked for the same phase again, and the honest
response was **not** to rebuild it: it was to audit the published implementation against the decision's own text and
its own acceptance table. Two of the checks were passes that merely looked like passes, and one criterion was not
delivered at all. All three are fixed here; nothing else about the phase changed.

### 13.1 O-5 was optional where the decision makes it mandatory

**The gap.** `O-5` requires that the disposition's input identity cite the assessment's *clock-free* identity, so the
assessment's execution clock cannot reach the disposition. The published code accepted the two assessment substantive
digests as **optional** context and wrote them into provenance only when supplied. A caller that omitted them got a
disposition whose input identity was composed — legally, silently — from the engine's clock-tainted `inputDigest`: the
`§7.3` defect the decision exists to close, still reachable.

**The fix.** `ComposeDispositionInput` now *requires* `assessmentSubstantiveDigest` and
`assessmentSubstantiveInputDigest`; `DispositionRecordsService.record` requires them in its context and passes them
through; the provenance always records `substantiveInputDigest` **and** both cited assessment identities. A new
`assessmentSubstantiveIdentity(payload)` helper returns the pair, so a caller cannot derive one and forget the other.
The ripple was mechanical and is part of the pass: `dispositionService.ts`, `cli/disposition-demonstration.ts`, and
four test files.

**Why this is the right shape.** An optional provenance member is a member that will eventually be missing, and a
missing citation is indistinguishable from "the clocks agreed". A required one turns the omission into a type error at
the boundary, which is where it belongs.

### 13.2 D-3's conditional exclusion was implemented as an unconditional one

**The gap.** Decision §3.4 excludes `review.nextReviewOn` **when non-null** — a scheduled review date is a function of
the execution clock and the review horizon, so it is metadata; a `null` carries no clock information and is retained.
The published grammar deleted the member unconditionally and its test asserted `null` ≡ absent "because `null` means
no review scheduled". That is a different, broader projection than the one the decision closed, and the test made it
look intentional.

**The fix.** The projection drops the member only when its value is non-null. The asymmetry (`null` ≢ absent) is now
asserted **explicitly**, with the reason written next to it, so a later reader who finds it surprising cannot quietly
"repair" it into the broader rule: the decision excludes a *value that carries a clock*, not a member that happens to
be present.

**Honest note.** Neither reading reproduces the decision's disposition vector (§13.4). The literal reading is kept
because it is what the decision says; the digest difference is a fixture difference, and it is recorded rather than
resolved by choosing the number that looked closer.

### 13.3 The decision's own AC-L14.4 pair classified as `SUBSTANTIVE`, and a material item could require no review

**The gap, first half.** `FRESHNESS_CONSEQUENCE_DIMENSIONS` listed `asOf.staleBeyondPolicy`, `quality.verdict`,
`quality.flags`, `completeness.adequacy` and `dividends.verdict` — but not `confidence.combined`. On the decision's own
C4→C1 pair the four items are those verdicts **plus** confidence (`0.8371`→`0.674`, capped by `STALE_DATA`), so one
item fell outside the set and the pair classified `SUBSTANTIVE`. AC-L14.4 asks for `FRESHNESS_TRANSITION` "with a
`RISK_QUALITY` item — not as a data change", and the published evidence table claimed the requirement was met by a
test that only asserted the substantive digest moved. The claim was wrong and the test did not check it.

**The gap, second half.** With the same pair, no trigger fired: the review block computed `required: false` alongside
`priority: HIGH` (a `CRITICAL` item). Required-and-priority disagreeing is the one combination a reader cannot act on.

**The fix.** `confidence.combined` joins the freshness-consequence set, so the pair classifies `FRESHNESS_TRANSITION`
with four `RISK_QUALITY` items and `highestMateriality: CRITICAL`. A catch-all `MATERIAL_CHANGE` trigger fires whenever
any item is at least `MATERIAL`, so `required` is never false while the priority says otherwise. It is named
`MATERIAL_CHANGE` and not `MATERIAL_SUBSTANTIVE_CHANGE` deliberately: a freshness transition *is* a difference in
substantive identity, but it is not a change in the data, and a trigger name must not claim otherwise.

**Verification.** `ac-l14.test.ts` AC-L14.4 asserts the decision's own clocks, its own five numbers, the five
classification guards (`classification`, `RISK_QUALITY > 0`, `FUNDAMENTAL = 0`, `MODEL = 0`,
`MARKET_VALUATION = 0`) and the review block's internal consistency. That test fails on the published code.

### 13.4 The disposition digests move, and the decision's D0 vector stays unreproduced

One change moves the disposition's substantive digest, and it is §13.2 — **not** §13.1: the M1 fixture schedules no
review, so its `nextReviewOn` is `null`, and the published grammar deleted that member while this pass retains it as a
null. The O-5 members added in §13.1 are *provenance*, not payload, so they are outside the projection and the
disposition's **input** digest does not move at all. Both statements were checked by recording a disposition through
`DispositionRecordsService.record` and reading the stored provenance back, not by reasoning about the diff.

| Quantity | Published pass | This pass |
|---|---|---|
| Disposition substantive (M1 held) | `1bfae159…` | `5827369f…` |
| Disposition substantive input (as recorded) | `ce61a6a4…` | **unchanged** |
| Disposition substantive, no portfolio facts | `7b8b8ecb…` | `57273946…` |
| Disposition substantive, candidate subject | `ae0327cc…` | `687f54f5…` |
| Assessment substantive (C1/C2/C3, C4, C5) | `08ea8d4a…`, `fd9589e4…`, `34240407…` | **unchanged** |

The assessment side is unchanged because §13.1 and §13.3 touch the disposition grammar, the freshness set and the
review trigger list — none of which is in the assessment projection. That the five published assessment vectors still
reproduce byte-for-byte (payload *and* substantive digests, plus the three engine input digests) is the strongest
available statement that the grammar, the canonicalisation and the hash are the ones the decision specified.

**On `126bd28f…`.** Decision §5.2 publishes a D0 disposition with `payloadDigest c79cd8cc…` and substantive
`126bd28f…`. This repository's M1 held fixture produces `e7d8df04…` / `5827369f…`. Both `nextReviewOn` readings were
executed against the fixture and neither reproduces `126bd28f…`; the §5.2 payload is not printed, so it cannot be
reconstructed. The record states this instead of adopting a number nothing produces, and AC-L14.7 asserts the value a
run can obtain here. This is a *documentation* gap in the decision (a vector without its fixture), not a code defect —
and it is the only one of the decision's published values that does not reproduce.

### 13.5 Q-1 is answered: the run result, not the history

Decision §9 R-1 notes that the capability stores no run ledger, and `Q-1` left open whether `CLOCK_ONLY_UNCHANGED`
should be observable across run history or only on the run result. **It is the run result only.** A ledger would be a
new persisted artifact kind, which the decision explicitly does not authorise (§9 R-1, §10). What the result carries is
now sufficient for a scheduler or an audit to log the run outside the chain: `outcome`, `observedGeneratedAt` (the
clock that moved), `unpersistedPayloadDigest` (the bytes not written), `headPayloadDigest`, and `substantiveDigest`
(identical on both sides, by construction — that is the point). AC-L14.1 asserts all four.

### 13.6 What this pass did not change

No `iips-platform/` source, no frozen-engine version, no dependency pin, no `.tsx`, no route, no persistence, no
IID-3/IID-4 contract. `L-001`–`L-013` and `L-015`–`L-029` are untouched; `L-014` stays `RESOLVED`; `IID-6` remains
**NOT STARTED**. The one inserted-versus-restated distinction worth stating: this pass *restated* three claims the
published record made too confidently (§5 O-5, §6, §13.3). A record that corrects itself in place is more useful than
one that quietly disappears.
