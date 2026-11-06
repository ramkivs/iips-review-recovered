# IIPS v3.0 — IID decision record: L-014 substantive assessment identity and versioning

**Decision ID:** `IIPS-V3-IID-DECISION-L014-2026-11-06`
**Programme:** IIPS v3.0 Investment Intelligence Design (IID)
**Resolves:** limitation **`L-014`** — *"Content and input identity include the assessment timestamp"*
  (`docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md`, §4)
**Decided:** 2026-11-06
**Decision owner at this date:** the IID authority frame that owns the register (IID-3 opened the entry; IID-5 must
implement the decision)
**Prerequisite for:** IID-5 (change intelligence / IID-03 / ★M-2) — scheduled refresh, historical comparison and
change attribution
**Status of this document:** **AUTHORITATIVE.** It is the decision of record for assessment and disposition version
identity. Where this decision and an earlier design document disagree, this document governs the versioning
question only; it reopens nothing else.

---

## 0. Decision resolved ≠ implementation completed

Two statuses that must not be conflated:

| | Status at 2026-11-06 |
|---|---|
| **The decision** | **RESOLVED** — this document. The semantics are settled, the exclusions are enumerated, the acceptance tests are specified. |
| **The implementation** | **NOT COMPLETED.** No line of the contract below exists in `iips-platform/` or `frontend/`. `L-014` therefore remains `OPEN` in the register, carrying a pointer to this decision. |

`L-014` may be marked `PARTIALLY RESOLVED` or `RESOLVED` only when IID-5 ships the implementation **and** the
acceptance tests in §8 pass **and** the register entry cites that evidence. Register rule 3 forbids any earlier
improvement, and nothing here claims one.

Nothing in this work changed implementation: no IID-3 or IID-4 source file was modified, no stored artifact was
rewritten, no historical report was regenerated, no dependency pin moved, no IPD change was made, and **IID-5 has not
started**. The evidence quoted below was produced by read-only execution of the existing composition modules and the
existing fixtures; the probe files used to produce it were scratch and are not part of the change.

---

## 1. The problem, and the behaviour that exists today

### 1.1 What a version is today

`L-014` is a statement about **which facts are inside content identity**. The implementation answers it in three
places, and the answer is consistent:

| Fact | Where the code says it |
|---|---|
| `payloadDigest` is SHA-256 over the **stored canonical payload bytes** — nothing else | `assessmentComposition.ts:167-170` → `canonicalizePayload(payload)`; `investmentArtifacts.ts:240-242` (`storedPayloadDigest`) |
| The canonical payload **is** the payload the engine produced, transcribed verbatim | `reports/composition.ts:130`, `146` (`canonicalPayload: canonicalizePayload(output.payload)`) |
| A version is appended **iff** `payloadDigest` differs from the chain head's | `investmentArtifacts.ts:485` (`headView.payloadDigest === submission.payloadDigest`) |
| On read, the declared digest is **recomputed from the stored bytes** and a mismatch is refused | `investmentArtifacts.ts:243-252`, `CONTENT_DIGEST_MISMATCH` |

The payload contains the engine's execution metadata, so the clock is inside content identity:

- `payload.artifact.generatedAt` and `payload.asOf.generatedAt` — two copies of the engine's `generatedAt`
  (`assessment/engine.ts:288`, `:300`).
- `payload.asOf.stalenessDays` — an integer day count from `asOf.dataAsOf` to `generatedAt`
  (`assessment/engine.ts:187`, `:303`).
- `payload.subject.identity.bindingRef` — the identity binding's `bindingId`, which is `digestOf({ … observedAt: asOf })`
  over the **as-of date** (`identity/resolver.ts:457-483`).

### 1.2 Root cause

Not one bug, but a **conflation of two purposes in one digest** plus **a payload that legitimately carries execution
metadata**:

1. `payloadDigest` was built as an **integrity** digest: recomputable from the stored bytes alone, which is what makes
   a post-hoc store edit detectable. That requirement forbids excluding fields from it — IID-3 and IID-4 both refused
   to narrow it, correctly (`IID-3`'s register §4; `IID-4`'s `LIMITATION-IMPACT.md`).
2. The **same** digest was then used as the **version identity**: equality ⇒ `UNCHANGED`, difference ⇒ append. So any
   byte of execution metadata that moves creates a version.
3. The engine's payload contains execution metadata that moves with the clock, and composition may not remove it — the
   payload is transcribed verbatim, deliberately (transcription fidelity is an IID-3 acceptance property).

The engine's `inputDigest` has the same taint for the same reason: `generatedAt` is one of the members it digests
(`assessment/engine.ts:374-385`), so a clock-only re-run moves the *input* digest too, and
`INPUT_CHANGED_CONTENT_IDENTICAL` is correspondingly rare — exactly as `L-014` records.

### 1.3 Measured behaviour (not inferred from prose)

Executed against the existing implementation with the IID-3 synthetic M-1 fixtures (`demo/m1Pipeline.ts`), identical
dataset, only the clock varying:

| Run | Clock | Payload fields that differ from the baseline | `payloadDigest` | `reportKey` |
|---|---|---|---|---|
| baseline | `2026-11-06T00:00:00Z` | — | `356614f3…` | `fcf992e0…` |
| same day, +6 h | `2026-11-06T06:30:00Z` | **2**: `artifact.generatedAt`, `asOf.generatedAt` | `bdf0e7d1…` (moved) | unchanged |
| +1 day | `2026-11-07T00:00:00Z` | **4**: the two timestamps, `asOf.stalenessDays` (220→221), `subject.identity.bindingRef` | `9f0719e6…` (moved) | unchanged |

So: today, **a re-run of an unchanged assessment at a new clock appends a version whose only difference is
generation metadata.** The chain is not corrupted — `reportKey` is provably stable across all five runs in §5 — but the
history is larger than the substantive history, and version N+1 can be *semantically empty*.

The disposition surface inherits this exactly (`disposition-records.test.ts:172-194` pins it): a disposition re-run at
`2026-11-06T09:00:00Z` against the *same* assessment `APPENDED` a version, with an unchanged disposition input digest
and a changed payload digest.

---

## 2. Current identity composition, and where the clock enters

### 2.1 The four identities as built (design of record Part III §A; roadmap §B.A)

| Identity | Built from | Clock-sensitive today? |
|---|---|---|
| **chain** | `reportKey` over `(reportType, portfolioId=scope token, scenario, parameters)`, parameters stable-only | **no** — verified across all runs in §5 |
| **version** | NP-04 `reportId`, `artifactVersion`, `supersedesReportId` | no (assigned per write) |
| **content** | `payloadDigest = sha256(canonicalPayload)` | **yes** |
| **input** | engine `inputDigest` (`sha256:` form), recorded in provenance | **yes** |

### 2.2 The clock's channels into persisted content

Enumerated by execution (§1.3) and by reading the contract. There are **six** channels; four are pure metadata, two are
substantive:

| # | Channel | Kind | Effect today |
|---|---|---|---|
| C-1 | `artifact.generatedAt` | execution metadata | forces a new version |
| C-2 | `asOf.generatedAt` | execution metadata | forces a new version |
| C-3 | `asOf.stalenessDays` | derived, **display-only** (only `assessment/view.ts:127`, the transport type and provenance read it) | forces a new version every calendar day |
| C-4 | `subject.identity.bindingRef` | digest over the binding **including `observedAt`** | forces a new version every calendar day |
| C-5 | `asOf.staleBeyondPolicy` → `STALE_STATEMENTS` flag → `quality.verdict` → `confidence` | **substantive** (`adequacy.ts:156`, `:180-189`; `confidence.ts:52`) | forces a new version when the 200-day window (`policy.ts:135`) is crossed |
| C-6 | `selectPrice` admits only `price.asOf <= generatedAt` (`margin.ts:45-49`) | **substantive** (point-in-time availability) | forces a new version when a newer admissible price exists |

Channels C-5 and C-6 are the reason a naive "the clock never creates a version" rule would be wrong, and they are why
this decision is not simply "exclude the timestamp". Crossing the freshness window with an unchanged dataset changed
the payload substantively in the measured run:

```
clock 2026-04-10 → 2026-11-06, identical dataset
stalenessDays      10 → 220
staleBeyondPolicy  false → true
quality.verdict    CLEAN → MATERIAL_CONCERNS      (flag STALE_STATEMENTS)
confidence         0.8371 → 0.674
```

That is a real change in the assessment's stated confidence in its own inputs. It must remain a version, and IID-5 must
be able to attribute it.

### 2.3 What the clock does **not** enter

`reportKey`; `parameters`; `data.datasetVersion` / `data.contentDigest` (dataset identity, R-7); `asOf.dataAsOf`;
`asOf.knownAsOf` (dataset knowledge cutoff — measured unchanged across all clocks in §1.3); every valuation figure
except through C-6; evidence; limitations. Chain stability is therefore already correct and is **not** what this
decision changes.

---

## 3. The decision

### 3.1 Principles, and the rules that implement them

The six intended principles are adopted verbatim as the decision's requirements, each bound to a mechanism:

| # | Principle | Implemented by |
|---|---|---|
| P-1 | An execution timestamp is provenance/observation metadata; it must not by itself manufacture a version | D-1, D-2 (exclusion of C-1…C-4) |
| P-2 | A meaningful change in financial data, source evidence or other substantive input must be detectable and capable of producing a version | D-2 (everything not excluded stays in), D-5 |
| P-3 | A change in model, calculation implementation or model version must be explicitly identifiable | D-6 (model identity retained + attributed) |
| P-4 | A change in applicable policy or configuration must be explicitly identifiable | D-6 (policy identity retained + attributed) |
| P-5 | Sufficient provenance must be preserved to establish when an assessment was executed and what produced it | D-7 (nothing is lost: exclusions are reconstructable) |
| P-6 | IID-5 must distinguish substantive changes from repeated execution of unchanged logic and inputs | D-1, D-8, AC-L14.1…AC-L14.10 |

### 3.2 D-1 — Version identity is substantive identity

**A version is minted if and only if the substantive identity of the composed artifact differs from the chain head's.**
Byte identity (`payloadDigest`) no longer decides versioning; it decides integrity.

### 3.3 D-2 — The substantive projection, and the exclusion test

**Definition.** The *substantive projection* of a stored artifact is the canonical payload with a **closed, enumerated**
set of members deleted, re-canonicalized by the existing `canonicalizePayload` (`reports/canonical.ts`). Deletion — not
nulling — is the rule: an absent member must not become a member with a null value.

A member `M` may be excluded from the projection **only if all three hold**:

- **E-1 (derivable).** `M` is a deterministic function of the execution timestamp and/or of members that **remain** in
  the projection, under a policy constant that is itself versioned.
- **E-2 (no semantic consumer).** Every consumer of `M` is display/provenance, **or** the consumer's outcome is
  reproduced by a retained member. A member that feeds a derived output (verdict, adequacy, confidence, any figure)
  **fails E-2 and cannot be excluded.**
- **E-3 (enumerated and versioned).** The exclusion is listed explicitly in the grammar below, and the grammar version
  is recorded with every version written under it.

E-2 is what keeps C-5 and C-6 inside the projection. E-1 is what removes C-1…C-4.

### 3.4 D-3 — Grammar 1: what is excluded, per report type

**`investment.company-assessment` — grammar `assessment-substantive-identity/1`**

| Excluded member | E-1 | E-2 | Reconstructable as |
|---|---|---|---|
| `artifact.generatedAt` | execution clock | provenance/display only | recorded execution clock of the version |
| `asOf.generatedAt` | execution clock (same value) | provenance/display only | same |
| `asOf.stalenessDays` | `f(dataAsOf, t_exec)` | display only (verified by exhaustive reference search) | `dataAsOf` (retained) + recorded `t_exec` |
| `subject.identity.bindingRef` | digests `observedAt: asOf` (`resolver.ts:457-483`) | reconstructable: binding **content** is retained as `rosterVersion` / `listingMapVersion` / `corporateActionTableVersion`, and `observedAt` is the recorded `t_exec` | retained content + recorded `t_exec` |

**Retained, deliberately** (each fails E-1 or E-2): `asOf.dataAsOf`, `asOf.knownAsOf`, `asOf.staleBeyondPolicy`,
`artifact.kind`, `artifact.modelVersion`, `artifact.policyVersion`, `artifact.subjectScope`, `schemaVersion`, the whole
`subject` block except `identity.bindingRef`, the whole `fundamentals` / `valuation` / `moat` / `dividends` / `risk` /
`confidence` / `completeness` / `quality` / `assessment*` blocks, `evidence`, `limitations`, `assumptions`,
`disclosure`, `sectorReferenceView`.

**`investment.holding-disposition` — grammar `disposition-substantive-identity/1`**

| Excluded member | Justification |
|---|---|
| `artifact.generatedAt` | execution clock of the disposition (C-1 analogue) |
| `companyAssessmentRef.generatedAt` | the **referenced artifact's** execution clock; the reference itself (`reportId` + `artifactVersion` + `reportKey`) carries the identity, so the copy is redundant metadata |
| `review.nextReviewOn` (when non-null in a future version) | `f(t_exec, horizon)`; display only |

Retained: `subject` (including `heldAsOf`), `companyAssessmentRef` identity and version members, `portfolioContext`
(including `portfolioRevision` and the holdings snapshot `asOf` — a **data** date, not an execution clock),
`disposition`, `limits`, `rationale`, `falsifiers`, `portfolioImplication`, `evidence`, `limitations`, `disclosure`.

### 3.5 D-4 — The digest

`substantiveDigest = sha256(canonicalizePayload(substantiveProjection(storedCanonicalPayload)))`, lowercase hex — the
same digest form and the same canonicalizer as `payloadDigest`, so both are recomputable **from the stored bytes
alone**, and the integrity guarantee IID-3 and IID-4 protected is preserved in full.

Naming is fixed here to prevent drift: **`substantiveDigest`** (content), **`substantiveInputDigest`** (input),
**`substantiveIdentityGrammar`** (the grammar string). `payloadDigest` keeps its existing meaning and is **not**
renamed, narrowed or redefined.

### 3.6 D-5 — Versioning semantics (post-implementation, both report types)

| `substantiveDigest` vs head | `substantiveInputDigest` vs head | `payloadDigest` vs head | Outcome | Write |
|---|---|---|---|---|
| equal | equal | equal | `UNCHANGED` | no |
| equal | differs | equal | `INPUT_CHANGED_CONTENT_IDENTICAL` | no |
| equal | either | **differs** | **`CLOCK_ONLY_UNCHANGED`** *(new outcome)* | **no** |
| differs | either | differs (necessarily) | `APPENDED` | yes |

`CLOCK_ONLY_UNCHANGED` is a **new member of the closed `RECORD_OUTCOMES` vocabulary** (`investmentArtifacts.ts:120-131`).
It is an additive change to that vocabulary and to the CLI/transport result, and it is IID-5's to make. The pair
(`CLOCK_ONLY_UNCHANGED`, `wrote: false`) is the machine-readable statement *"we re-ran it; nothing substantive moved"*.

### 3.7 D-6 — Model and policy change are substantive, and explicitly attributable

`artifact.modelVersion` and `artifact.policyVersion` are **retained** in the projection (they are not clock-derived), so
a model or policy bump changes `substantiveDigest` and appends a version — which is what AC-5.4 requires anyway
(`MODEL` only, no data movement). In addition IID-5 must **name** the moving identity in the change report rather than
leaving it as a byte difference: a version pair whose payloads differ and whose `modelVersion`/`policyVersion` differ
must carry a `MODEL` category item (`attribution` per §B.F), so a reviewer never has to diff two digests to learn that
the engine changed.

Business distinction this preserves: a policy or model change is a change **we** made to how assessments are computed;
a data change is a change in what they are computed from. Both mint versions; they must not be attributed to each other.

### 3.8 D-7 — Nothing is lost by excluding; and the two substantive clock channels stay

For every version, the following remain recorded and readable: the execution clock (`content.generatedAt` and
`provenance.generatedAt`), `payloadDigest` over the exact stored bytes, `inputDigest` as the engine emitted it, model
version, policy version, dataset version, dataset content digest, `dataAsOf`, `knownAsOf`, adequacy, quality verdict,
confidence, and the full canonical payload. Every excluded member is a function of retained members plus that recorded
clock, so an excluded value can be reproduced for any version at any later time (P-5). What is **not** excluded is
`staleBeyondPolicy` (C-5) or price admissibility (C-6): both can change the assessment's stated confidence or its
valuation inputs for reasons that are not "the clock moved"—they are changes in what was knowable at execution time,
and they mint versions.

---

## 4. Change classes and their treatment

| Change | Detectable in the projection? | New version? | IID-5 category | Note |
|---|---|---|---|---|
| New financial period / restated line item | yes — figures change | **yes** | `FUNDAMENTAL` / `DATA_CORRECTION_RESTATEMENT` | dataset version and content digest move too |
| New or corrected source evidence | yes — `evidence`, figures | **yes** | `FUNDAMENTAL` (or `DATA_CORRECTION_RESTATEMENT`) | |
| New dataset snapshot with identical content | dataset identity moves, payload may not | only if the payload moves | attributed to availability | `datasetVersion` is **not** in `parameters`; it *is* in the payload (`data.datasetVersion`) |
| New admissible price observation (`asOf` ≤ later clock) | yes — C-6 | **yes** | `MARKET_VALUATION` | the honest case for a clock-driven version; must cite the price observation |
| Freshness window crossed | yes — C-5 | **yes** | `RISK_QUALITY` (adequacy/confidence) | attributed as a freshness-state change, never as a data change |
| Model version / calculation change | yes — `modelVersion`, figures | **yes** | `MODEL` | |
| Policy / configuration change | yes — `policyVersion`, figures | **yes** | `MODEL` | policy is a model input by design (§A2, `policy.ts` header) |
| Identity re-mapping (issuer/security/listing) | yes — `subject.identity.*` versions, ids | **yes** | `IDENTITY_MAPPING` | `bindingRef` excluded, its **content** retained |
| Portfolio revision (dispositions) | yes — `portfolioContext.portfolioRevision` | **yes** | `PORTFOLIO` | |
| **Execution clock only** (same day, nothing else) | **no** | **no** | — | `CLOCK_ONLY_UNCHANGED` |
| **Execution clock, next calendar day** (`stalenessDays`, `bindingRef` move) | **no** | **no** | — | today this appends a version; this is the case the decision eliminates |
| Re-run with identical inputs at the identical clock | no | no | — | already `UNCHANGED` |

---

## 5. Before / after: worked examples with real digests

All values below were produced by executing the existing composition modules against the IID-3 synthetic M-1
fixtures. `substantiveDigest` values are from a reference implementation of grammar 1 (delete the §3.4 members,
`canonicalizePayload`, SHA-256). They are the acceptance vectors for AC-L14.1–AC-L14.3.

### 5.1 Assessments (`investment.company-assessment`)

`reportKey` is `fcf992e0a1316001059cac7caa21335938f2b63b25c986dfb7c50e8cfc376d2f` in **every** row — chain identity
is untouched by this decision.

| Case | Clock | `payloadDigest` | `substantiveDigest` | Today | After this decision |
|---|---|---|---|---|---|
| C1 baseline | `2026-11-06T00:00Z` | `356614f37ba607ceff82024bc871dbdf04349140619fd1ca47474fc9a79d8210` | `08ea8d4ae1732b5a23de17017aad07cd006ba4d8dcf9f4abc032d016ee3f10e1` | `CREATED` | `CREATED` |
| C2 same day +6 h | `2026-11-06T06:30Z` | `bdf0e7d18721f818c8968d173b2772e95894779d2f1e3a9850aba563f472101d` | **identical** | `APPENDED` | **`CLOCK_ONLY_UNCHANGED`**, no write |
| C3 +1 day | `2026-11-07T00:00Z` | `9f0719e6f9b6cb974a64e3cc0fee6f1474f55fe3534506b21443f67289cf1dab` | **identical** | `APPENDED` | **`CLOCK_ONLY_UNCHANGED`**, no write |
| C4 earlier clock, inside the 200-day window | `2026-04-10T00:00Z` | `90b7ae562e8be56ed663c758b635e1989cd788e497599724ff177463af2e2681` | `fd9589e43b33aa07a38f0c0f0a144d1450519b586d17810b64453bcba7b6816c` (**differs**) | `APPENDED` | **`APPENDED`** — `staleBeyondPolicy` flipped, confidence `0.8371 → 0.674` |
| C5 dataset v2 | `2026-11-06T00:05Z` | `027a5d80e549b347562b03999a14062addd142eba2e4ddd586b67ea977d625a5` | `34240407c627d631e2166d0ce4c209d7ee119a17e9593d3b62cc54afdf1a5346` (**differs**) | `APPENDED` | **`APPENDED`** |

Read C2/C3 against C4: the decision does not say "the clock is irrelevant". It says the clock is irrelevant **when
moving it changes only generation metadata**, and it remains decisive when moving it changes a policy verdict
(C4), the set of admissible observations (C-6), or nothing at all.

Engine `inputDigest` moves in C2 and C3 as well (`sha256:1a5ae081…`, `sha256:fd5173c3…` vs `sha256:c74226fe…`), which is
why `substantiveInputDigest` (§3.5, §8 O-4) is required: without it the input-identity signal stays clock-noisy and
`INPUT_CHANGED_CONTENT_IDENTICAL` remains unobservable.

### 5.2 Dispositions (`investment.holding-disposition`)

Fixture: one held position against one assessment, verdict `AVOID` in both runs.

| Case | Disposition clock | `payloadDigest` | `substantiveDigest` | Disposition `inputDigest` | Today | After |
|---|---|---|---|---|---|---|
| D0 | `2026-11-06T06:00Z` | `c79cd8cc3c50584a58c8e5301d6c7e607a0c105a3534e08061ed8a933dfb0322` | `126bd28f58a003e47f9923ae46bfa8e4d3fd1109a6eeca48fea9ac6a58bc3933` | `b639502c…` | `CREATED` | `CREATED` |
| D1 (same assessment) | `2026-11-06T09:00Z` | `175e29f9031056703c5418e17a1edbf5373401b1ad4b85087f324a557b694b3d` | **identical** | **identical** | `APPENDED` | **`CLOCK_ONLY_UNCHANGED`**, no write |
| D2 (assessment **recomputed** at `06:30`, same dataset) | `2026-11-06T09:00Z` | `d6f9a337fe59e3370aca10e4fdc958e4ada0c227be0ee0b2a8e709add23b801d` | **identical** | `90ebd8bc…` (**moved**) | `APPENDED` | see §7.3 — must not append |

D1 is the intended repair. D2 is a defect this decision inherits and must fix: the disposition's *content* identity is
stable, but its *input* identity moves because IID-4 composes it from the assessment's engine `inputDigest`
(`dispositionComposition.ts:94-118`), which carries the assessment's execution clock. §7.3 and O-5 make that an
implementation obligation.

---

## 6. Implications

### 6.1 Report keys

**No change.** `reportKey` is over stable parameters only and was measured identical across all five assessment runs and
both disposition runs. This decision adds nothing to `parameters` and removes nothing from them: a substantive digest
in `parameters` would re-mint every chain on every data change — the exact defect Part III §A was written to correct.

### 6.2 Content digests

Three content-identity values now have three distinct jobs, and must never be substituted for one another:

| Value | Covers | Changes with the clock? | Job |
|---|---|---|---|
| `payloadDigest` | exact stored canonical bytes | yes | integrity / tamper detection |
| `substantiveDigest` | canonical payload minus grammar-1 members | **no** | version identity / change detection |
| `data.contentDigest` | the dataset snapshot | no (it is data) | provenance of what was assessed |

### 6.3 Persistence

Append-only and unchanged: `createInstance` at version 1, `appendVersion` with `supersedesReportId` = current head
(NP-04 refuses anything else), `artifactVersion` monotonic. The **only** structural change is that a write now happens
on substantive change instead of on any byte change, so chains get shorter. No schema migration, no rewrite, no delete
(NP-04 forbids delete), no change to `findChainArtifacts` or the bounded head scan (`L-010`).

For **new** versions, `substantiveDigest` and `substantiveIdentityGrammar` are recorded in `provenance` and, like
`payloadDigest`, are **recomputed on read and a mismatch is refused** — a recorded digest that is not re-verified
would be a claim, not evidence.

### 6.4 Idempotency

`UNCHANGED` is decided on `substantiveDigest` (plus `substantiveInputDigest` for the `INPUT_CHANGED_CONTENT_IDENTICAL`
distinction). Head-only comparison is preserved: unchanged content that equals an *older* version still appends
(`L-013` is untouched by this decision — a revert remains a version). The clock-only case gains its own outcome so that
"we ran it and nothing moved" is observable and countable rather than silent.

### 6.5 Historical comparison (IID-5)

Comparisons are made over the substantive projection, so a pair of adjacent versions is classified as:

- `SUBSTANTIVE` — projected payloads differ; items and attribution as per §B.F / AC-5.1…AC-5.11;
- `GENERATION_METADATA_ONLY` — projected payloads identical; **zero** change items, and the excluded members are
  reported as a separate, explicitly non-semantic block (execution clocks, staleness day count, binding reference),
  labelled as metadata rather than shown as changes;
- `FRESHNESS_TRANSITION` — projected payloads differ only in `staleBeyondPolicy` and its dependants; reported as one
  `RISK_QUALITY` item naming the policy window and the dates, never as a data change.

Pairs written before this decision are compared the same way, with the projection computed at read time and labelled
`derivedUnderGrammar: 'assessment-substantive-identity/1'`. **Derived is not rewritten:** no stored artifact changes,
no `reportId` changes, no history is regenerated.

---

## 7. Compatibility with IID-3 and IID-4 artifacts

### 7.1 Existing assessments remain valid, and their version numbering stands

Every stored assessment keeps its `payloadDigest`, its `reportId`, its `artifactVersion`, its provenance and its bytes.
The substantive digest of an existing version is **computable** from its stored canonical payload — that is a property
of the definition in §3.5, not an assumption — so no migration is needed and none is permitted. Existing chains may
contain clock-only version pairs; IID-5 must classify them as `GENERATION_METADATA_ONLY` rather than reporting a change
that never happened. Those versions are historical facts: they were written under the old rule, and saying so is more
honest than hiding them.

### 7.2 Existing dispositions likewise

Same construction, same compatibility. `dispositionPayloadDigest` and the stored bytes are untouched; the substantive
digest is derivable from the stored payload.

### 7.3 The propagated-taint defect, stated exactly

IID-4's `dispositionInputDigest` excludes the **disposition's** clock (correct) but composes itself from the
assessment's engine `inputDigest` (`dispositionComposition.ts:94-118`), which contains the **assessment's** clock. So
when the assessment itself is re-run at a new clock with an identical dataset, the disposition's input digest moves
(D2 in §5.2: `b639502c… → 90ebd8bc…`) even though no disposition input changed. Under this decision that is a defect,
not a limitation to preserve: after IID-5, dispositions cite the assessment's `substantiveDigest` and
`substantiveInputDigest`, and the clock taint stops propagating. Until then the behaviour stands and `L-026`'s
statement that `L-014` applies unchanged to `hd:`/`hc:` chains remains true.

### 7.4 What this decision does **not** do to IID-3/IID-4

It does not edit their code, re-open Part III §A, alter their acceptance criteria, or move `L-013`, `L-015`, `L-026` or
any other entry. It adds a decision the later phase must honour, and it leaves the earlier phases' evidence true as of
its date.

---

## 8. IID-5 obligations and acceptance tests

### 8.1 Obligations

- **O-1** — Implement `substantiveProjection` and `substantiveDigest` for both report types, with the grammar string
  recorded per version and the projection computed by the existing canonicalizer.
- **O-2** — Decide idempotency on the substantive digest; keep the head-only rule (`L-013` unchanged).
- **O-3** — Add `CLOCK_ONLY_UNCHANGED` to the outcome vocabulary (write nothing) and surface it in the CLI and the read
  model's recent-run information; it must be distinguishable from `UNCHANGED` and from
  `INPUT_CHANGED_CONTENT_IDENTICAL`.
- **O-4** — Define `substantiveInputDigest` for assessments at composition time from members the payload already
  retains (dataset identity, dataset content digest, `knownAsOf`, identity versions, model and policy versions,
  statement scope, currency, fiscal year end, subject identity), **without** modifying the frozen IID-2 engine or
  re-deriving its inputs; the engine's `inputDigest` continues to be recorded unchanged as engine provenance.
- **O-5** — Cite `substantiveDigest` / `substantiveInputDigest` of the referenced assessment in disposition input
  identity (§7.3).
- **O-6** — Recompute `substantiveDigest` on read and fail closed on mismatch, exactly as `payloadDigest` does; classify
  the failure with the existing closed error vocabulary (a new code is permitted but must be documented).
- **O-7** — Classify every adjacent version pair as `SUBSTANTIVE` / `GENERATION_METADATA_ONLY` / `FRESHNESS_TRANSITION`
  (§6.5), and report excluded members as a non-semantic metadata block.
- **O-8** — Compute the projection for pre-decision versions at read time, labelled with the derived grammar, and never
  rewrite them.
- **O-9** — Pin the payload member inventory: the grammar declares the full member set it understands for each
  `assessmentSchemaVersion`, and a test fails if a payload member appears that the grammar neither retains explicitly
  nor excludes explicitly (§9, R-4).

### 8.2 Acceptance tests (each must fail if the implementation regresses)

| ID | Criterion |
|---|---|
| **AC-L14.1** | Same dataset, clock `2026-11-06T00:00Z` → `2026-11-06T06:30Z`: `payloadDigest` differs, `substantiveDigest` is byte-identical (`08ea8d4a…`), `reportKey` unchanged, and recording the second run yields `CLOCK_ONLY_UNCHANGED` with `wrote: false` and a chain version count of 1. |
| **AC-L14.2** | Same dataset, clock `2026-11-06T00:00Z` → `2026-11-07T00:00Z`: `stalenessDays` (220→221) and `bindingRef` both move, `payloadDigest` differs, `substantiveDigest` is still `08ea8d4a…`, outcome `CLOCK_ONLY_UNCHANGED`, no write. |
| **AC-L14.3** | Dataset v2 against v1: `substantiveDigest` differs (`08ea8d4a…` → `34240407…`), outcome `APPENDED`, `reportKey` identical, one new version. |
| **AC-L14.4** | Freshness transition: identical dataset, clock crossing the 200-day window (`2026-04-10` → `2026-11-06`): `staleBeyondPolicy` false→true, `quality.verdict` `CLEAN`→`MATERIAL_CONCERNS`, `confidence` `0.8371`→`0.674`, `substantiveDigest` differs (`fd9589e4…` → `08ea8d4a…`), outcome `APPENDED`, and the change report classifies the pair as `FRESHNESS_TRANSITION` with a `RISK_QUALITY` item — not as a data change. |
| **AC-L14.5** | Model version bump with identical data: only `MODEL` items; `substantiveDigest` differs. Policy version bump likewise. |
| **AC-L14.6** | A single financial figure changed in the dataset: `substantiveDigest` differs and the change report carries the corresponding `FUNDAMENTAL` item — the exclusion list must not swallow any figure. |
| **AC-L14.7** | Disposition re-run at a new clock against the same assessment: `substantiveDigest` identical (`126bd28f…`), `CLOCK_ONLY_UNCHANGED`, no write. Disposition against an assessment **recomputed** at a new clock with an identical dataset: `substantiveInputDigest` **identical** (the §7.3 defect fixed), no write. |
| **AC-L14.8** | Pre-decision version: the substantive digest of an artifact written before the implementation is computable, equals the reference value for its payload, is labelled as derived, and reading it performs no write and changes no stored field. |
| **AC-L14.9** | Tamper: editing one byte of a stored canonical payload makes both digest checks fail closed; a recorded `substantiveDigest` that does not match the recomputed one is refused. |
| **AC-L14.10** | Inventory: adding a member to the payload without a grammar decision fails the inventory test (§9 R-4), rather than silently producing clock-only versions. |

---

## 9. Residual limitations and unresolved technical questions

**R-1 — Clock-only runs are not durably recorded.** Nothing is written when a re-run changes nothing substantive, so
the store cannot answer "how many times was this assessed?" without an execution ledger. This decision accepts that
residue and names it: the run result carries `CLOCK_ONLY_UNCHANGED` with the observed clock and both digests, so a
scheduler or audit can record it outside the chain, but the capability itself does not store it. Adding a ledger would
add a persisted artifact kind, which is outside this decision's authority.

**R-2 — The frozen engine's `inputDigest` stays clock-tainted.** IID-2 is frozen; its digest is recorded as-is and is
never recomputed or reinterpreted. The clock-free input identity is a boundary-level construction (O-4). Any consumer
that treats the engine's `inputDigest` as a substantive-stability signal is wrong and must be corrected where it is
used, not where it is produced.

**R-3 — `knownAsOf` is retained and could become a clock channel.** It is dataset-derived today (measured unchanged
across clocks). If a future ingestion path ever sets `knownAsOf` from the execution clock, every run would mint a
version. This is a constraint on ingestion plus a test, not an exclusion: `knownAsOf` is substantive.

**R-4 — The exclusion set is closed, so payload evolution can silently re-introduce the defect.** A new clock-derived
member added to the payload by a later phase would create clock-only versions again. Mitigation is O-9/AC-L14.10: the
grammar pins the member inventory and an unlisted member is a test failure, not a surprise.

**R-5 — A clock-driven version is still possible, correctly.** A newer admissible price observation (C-6) can mint a
version with no data change. That is point-in-time correctness, but it can look like "nothing changed and a version
appeared"; the change report must name the price observation and its `asOf`, not just the category.

**R-6 — Grammar versioning across schema versions is open.** Grammar 1 is stated for `assessmentSchemaVersion: 1`. A
schema bump must be accompanied by a grammar review; whether the grammar should key off `(reportType, schemaVersion)`
or carry its own independent version is left to IID-5, with the constraint that a version written under one grammar is
never recomputed under another silently.

**R-7 — `stalenessDays` disappears from identity but not from display.** A stored version continues to display its own
`stalenessDays`, which is the correct historical value. Any future "staleness as of now" presentation (IID-6) must be
computed from `dataAsOf` and the current date, never by reading the stored integer as if it were current.

**Open question Q-1 (blocking for O-3 only).** Whether `CLOCK_ONLY_UNCHANGED` should also be observable across the run
history (R-1) or only on the run result. Deferred to IID-5's design of the run result; it does not block O-1/O-2.

---

## 10. What this decision does not authorise

- **IID-5 is NOT STARTED.** No change-intelligence code, route, comparison or reporter exists or is authorised by this
  document; it specifies obligations that IID-5 must meet when it begins.
- **IID-6 is NOT STARTED.** No product surface, no UI, no scheduler.
- No change to `iips-platform/` or `frontend/`; no change to IID-2's frozen engine; no change to IID-3's or
  IID-4's composition, persistence or transport contracts; no rewrite or regeneration of any stored artifact; no
  dependency-pin change; no IPD change.
- No limitation other than `L-014`'s own status/decision reference is touched. `L-001`–`L-013` and `L-015`–`L-027` stand
  exactly as they were, and `L-014` **remains `OPEN`** until IID-5 implements §3 and passes §8.

---

*Decision recorded 2026-11-06. Register pointer: `L-014` (§4 and §8 of the limitation register). Roadmap pointer:
§B.A (identity mechanics), IID-5 (change intelligence) dependencies.*
