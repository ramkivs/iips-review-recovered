# `L-041` — the dataset-classifier divergence: corrected on the IID line

**Date:** 2026-11-17
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Type:** code, guard and register-reconciliation. **No status change to `L-041`.** No rights granted, no `O3` record touched, no dataset installed, nothing downloaded, IPD not written.
**Base:** IID branch `arena/53ff9276-iips-review-recovered` at
`0f9b9ae47769976e6ee60d7c245870da5802a255`; IRR `main` at `5967902f7a6624a576ce790457788fb4dbbd32d5`.
**Governs:** `L-041` in [the limitation register](IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md), §17.26
**W05 compatibility:** [W05 reconciliation](W05-IID-RECONCILIATION-AND-AUTHORIZATION-REFERENCE-2026-11-17.md), [W05 source-rights assessment](W05-STATEMENT-SOURCE-RIGHTS-AND-REPOSITORY-EXPOSURE-ASSESSMENT-2026-11-17.md)

---

## 0. Summary

| Question | Answer | Section |
|---|---|---|
| What was the original divergence? | The assessment path answered `UNKNOWN` (fail-closed, from the rights declaration); the investment-coverage read model answered `OPERATOR_SUPPLIED` from a substring test on `provider` + `licence` — the exact rule `datasetClass.ts` repudiates in writing | 1 |
| Is it still reproducible at the IID head? | **Yes.** Reproduced on all three committed Infosys manifests before any change | 2 |
| Had `main` already corrected it? | **Yes.** `main` routes `financialClass()` through `classifyDataset`, on both coverage surfaces | 3 |
| What was corrected here? | Two copies of the removed substring rule — `coverage/investmentCoverage.ts` **and** `identity/coverage.ts` — plus the vocabulary member that made a fail-closed answer impossible, plus the generator guard that *required* the divergence, plus the test that *pinned* it | 4 |
| Is the historical finding preserved? | **Yes.** `verification/dataset-class-divergence.json` is byte-identical and now pinned by digest; the generator verifies it instead of rewriting it | 5 |
| Is W05 still enforced? | **Yes.** All five rights-classification tests pass, including "the provider label cannot promote a dataset out of `UNKNOWN`". No rights granted | 6 |
| Can `L-041` be marked `CLOSED`? | **No — it must remain `OPEN`.** The defect no longer reproduces, but its completion standard is a register-owner act, and one substantive limb of its own record is still unmet | 7 |

---

## 1. The original finding, as recorded

`L-041`, §17.26 of the register, recorded that classifying the three committed Infosys manifests (`REL-1`, `WI2`,
`WI3`) two ways exposes a live contradiction:

- **the assessment path** — `fundamentals/datasetClass.ts` → `classifyDataset()`, the declared-rights-evidence
  rule, **fail-closed** — answered `UNKNOWN`;
- **the investment-coverage read model** — `coverage/investmentCoverage.ts` → `financialClass()`, a substring test
  on `provider` / `licence` — answered `OPERATOR_SUPPLIED`.

The register's own words on why this is a defect and not a disagreement about taste:

> `datasetClass.ts` (commit `a54591e`) **documents that exact substring test under a heading "WHAT WAS WRONG" and
> removes it**; `investmentCoverage.ts` was touched later (`8603138`) and reintroduces it on the read side, so the
> product ships a rule and the rule that rule was written to replace.

The record also named the reason it was **not** corrected at the time — and that reason is what this work had to
answer, not ignore:

> The coverage path has **no fail-closed answer at all**: its vocabulary is `SYNTHETIC_FIXTURE | OPERATOR_SUPPLIED |
> NONE`, and `NONE` drives a "no dataset installed" UI state, so a fail-closed `UNKNOWN` needs either a fourth
> vocabulary member or routing the read model through `classifyDataset`. **Both are changes to a published
> read-model contract other surfaces consume** — a register-owner / read-model-owner decision, not a narrow IRR
> correction.

Two distinct obligations therefore existed, and this record addresses both: remove the repudiated rule, **and**
give the read model a fail-closed state so that removing the rule does not make an unestablished dataset render as
a fixture or silently vanish.

---

## 2. The divergence is still live at the IID head — reproduced, not assumed

Before any change, on `0f9b9ae`, both classifiers were run against the committed manifests:

```
UNKNOWN           | OPERATOR_SUPPLIED | agree=false | REL-1-INFOSYS-2026-11-06
UNKNOWN           | OPERATOR_SUPPLIED | agree=false | WI2-PRICE-OBSERVATION-2026-11-06
UNKNOWN           | OPERATOR_SUPPLIED | agree=false | WI3-BORROWINGS-NIL-2026-11-06
   provider="operator-file-input" licence="operator-supplied; not redistributable" sourceRights=undefined
```

**Three of three still disagree.** The manifests carry `provider: "operator-file-input"` and
`licence: "operator-supplied; not redistributable"`, and **no `sourceRights` key at all** — they predate the field.
So the rights evidence is genuinely absent, the assessment path correctly refuses to assert a class, and the
coverage path asserted an operator attestation that no manifest made. `L-041` is not a stale finding on this line.

The second copy then surfaced while tracing consumers: **`identity/coverage.ts` carried its own `financialClass()`
with the same substring test.** It fed `financialCoverage.datasetClass`, the disclosure rendered beside identity
coverage, so the same false attestation reached a second reader-facing surface. `L-041` names two classifiers; there
were in fact **three code paths, two of them running the removed rule.**

---

## 3. What `main` already had, and why this was not a merge

`main` corrected the coverage classifier at `6ae09ac` (`fix(investment): enforce W05 sourceRights dataset
classification on coverage surfaces`), and the whole IID line was later reconciled onto `main` by PR #574. So
`main` is already correct and **no correction to `main` is possible or needed** — the defect exists only on the IID
branch, which had not yet taken that work.

`main`'s rule, which this correction adopts rather than reinvents:

```ts
function financialClass(manifest: DatasetManifest | null)
  : 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'UNKNOWN' | 'NONE' {
  if (manifest === null) return 'NONE';
  const classified = classifyDataset(manifest);
  switch (classified) {
    case 'SYNTHETIC_REFERENCE': return 'SYNTHETIC_FIXTURE';
    case 'OPERATOR_SUPPLIED':    return 'OPERATOR_SUPPLIED';
    case 'UNKNOWN':              return 'UNKNOWN';
  }
}
```

A full merge of `main` into the IID line is **PR #574's** work and 138 files wide. It is not this task, it was not
attempted, and nothing here pre-empts or duplicates it. This correction makes the **classifier, its guards, its
tests and its historical record** consistent on the IID line so the two branches stop disagreeing about `L-041`
itself.

---

## 4. The exact corrections

### 4.1 `coverage/investmentCoverage.ts` — the removed rule, replaced by delegation

`financialClass()` no longer consults `provider` or `licence`. It delegates to `classifyDataset()` and maps
`SYNTHETIC_REFERENCE → SYNTHETIC_FIXTURE` to preserve the read model's published spelling, which other surfaces
consume.

**The vocabulary gained the member the register said it lacked.** `UNKNOWN` is now answerable, and it is distinct
from `NONE`:

| Value | Means | Previously expressible? |
|---|---|---|
| `NONE` | no manifest installed — drives the "no dataset installed" UI state | yes |
| `SYNTHETIC_FIXTURE` | the rights declaration says `SYNTHETIC` | yes |
| `OPERATOR_SUPPLIED` | the rights declaration says `OPERATOR_ASSERTED` | yes |
| **`UNKNOWN`** | **a manifest is installed, but its permitted use is not established** | **no — this was the recorded blocker** |

This is the register's own **first** option ("needs either a fourth vocabulary member **or** routing the read model
through `classifyDataset`"), and in fact both limbs: the member exists, and the rule is the shared one.

`UNKNOWN` also **discloses itself** in the report's note list via `datasetClassStatement('UNKNOWN')`. Without that
branch `UNKNOWN` would be a vocabulary member no reader ever sees, and the note list would imply an established
class. `NONE`'s existing note is untouched.

### 4.2 `identity/coverage.ts` — the third path, same rule

`buildFinancialCoverageDisclosure()`'s `financialClass()` had the identical substring test and now delegates to
`classifyDataset()` with the same mapping. Its `FinancialCoverageDisclosure.datasetClass` union gained `UNKNOWN`.
This is the copy that was **not** named in `L-041` and would have survived a fix that only touched the file the
register named — which is exactly why the correction was traced by rule rather than by filename.

### 4.3 `scripts/riv-head-revalidation.ts` — the guard demanded the bug

The generator's `datasetClassDivergence()` **refused to run unless every manifest still disagreed**:

```ts
require(disagreeing.length === rows.length,
  'L-041: the two dataset classifiers no longer disagree …');
```

That guard was correct while the divergence was an accepted, recorded defect — it made a one-sided fix fail loudly.
After the correction it demanded the bug, so the corrected code could not publish at all. It is now
`datasetClassAtHead()` and asserts the opposite, fail-closed in the other direction:

```ts
require(rows.every((row) => row.agree
  && row.assessmentPathClass === 'UNKNOWN'
  && row.coveragePathClass === 'UNKNOWN'),
  'L-041: at head both dataset classifier paths must answer UNKNOWN for every committed real-issuer manifest '
  + 'that carries no rights declaration');
```

A path that returns `OPERATOR_SUPPLIED` — or anything else — from text these manifests do not declare rights
evidence for is refused. The printed line now reads:
`3 committed real-issuer manifest(s): both classifier paths answer UNKNOWN at head; the recorded observation is kept, not re-emitted`.

### 4.4 The historical observation is preserved, not regenerated

The generator **no longer writes** `verification/dataset-class-divergence.json`. Regenerating it from corrected code
would replace an observation with a different document and quietly erase the finding `L-041` rests on. Instead the
committed bytes are **verified against a pinned digest**:

```
sha256 ae45717fe4bc3dd1b8c3090bb9e1a315fb96706e1e11a6e5c58949cc48e05477
```

and the same digest is asserted in the test suite, so the record cannot be edited on either side without failing.

### 4.5 Tests

| File | Change |
|---|---|
| `frontend/server/investment/cli/rivHeadRevalidation.test.ts` | The `L-041` block asserted the classifiers **disagree** (`OPERATOR_SUPPLIED`) and that the bundle record says "not corrected here". It now asserts both paths answer `UNKNOWN` **and** — crucially — that the manifest's `provider` is `operator-file-input` and its `licence` contains `operator-supplied`, so a substring test **cannot** produce `UNKNOWN` from that text. The record's byte-identity is pinned by digest. A new test reads the **register** and asserts `L-041`/`L-042` are still `OPEN`, so a code change cannot quietly become a closure decision. The "rebuilds all four artifacts" test became "the three it writes", with the reason stated inline |
| `iips-platform/tests/investment/investment-coverage.test.ts` | Replaced a test that encoded the old rule (a non-synthetic provider → `OPERATOR_SUPPLIED`) with one that sets the strings **against** the declaration in all three directions: `SYNTHETIC` rights under an operator label → fixture; no declaration under operator label → `UNKNOWN`; `OPERATOR_ASSERTED` under a fixture label → operator-supplied. Each asserts both `dataset.datasetClass` and `financialCoverage.datasetClass` |
| `iips-platform/tests/investment/l041ClassifierReconciliation.test.ts` | **New — 6 tests.** Delegation direction in both directions; the `identity/coverage.ts` copy; `UNKNOWN` vs `NONE` as different facts; `UNKNOWN` disclosed in the notes |

**The new suite was verified against the pre-fix code: 5 of its 6 tests fail there.** It is a real guard, not a
transcription of current behaviour.

---

## 5. Tests executed

| Gate | Command | Result |
|---|---|---|
| **New `L-041` guard** | `npx tsx --test tests/investment/l041ClassifierReconciliation.test.ts` | **6 / 6 pass** (5 fail against pre-fix code) |
| Platform IID suite | `npm run test:iid` | **1247 tests / 269 suites — 1246 pass**, 1 fail (see note) |
| Platform IID, excluding path-sensitive suite | same, minus `s4R3CandidateBuild.test.ts` | **1237 / 1237 pass, 0 fail** |
| Coverage + endpoint | `npx tsx --test tests/investment/investment-coverage{,-endpoint}.test.ts` | **19 / 19 pass** |
| Identity coverage / endpoint / measure | `npx tsx --test tests/investment/{identity-coverage,identity-endpoint,coverage}.test.ts` | **45 / 45 pass** |
| `L-041` generator + test | `npx vitest run server/investment/cli/rivHeadRevalidation.test.ts` | **12 / 12 pass** |
| **W05 rights classification** | `npx vitest run server/investment/cli/w05SourceRightsClassification.test.ts` | **5 / 5 pass** |
| Served coverage route | `npx vitest run server/investment/iidStage4ServedCoverageRoute.test.ts` | **11 / 11 pass** |
| Combined frontend investment gates | the three suites above in one run | **28 / 28 pass** |
| Platform typecheck | `npx tsc --noEmit` | **exit 0** |

**Note on the one platform failure.** `s4R3CandidateBuild.test.ts` fails only when the tree is checked out at a
different absolute path: its candidate manifest embeds `inputDir`, which is path-dependent, so the byte-equality
assertion against the committed ledger cannot hold off the canonical path. It **passes 10/10 in the canonical
checkout** and is unrelated to this change; it is reported rather than worked around or skipped.

**Note on the frontend full suite.** Running the whole `frontend` suite in this sandbox is not a usable gate: three
pinned dependencies are private IPD packages (`iips-production-market-data`, `iips-np04-governed-persistence`,
`iips-broker-import`) which this environment cannot fetch, so 56 files fail at import, plus the `.cache/broker-import`
build artifact they produce. Every failure was traced to that cause (26 + 5 references, plus 2 unresolved
`.cache/broker-import` paths). **No failure was attributable to this change**, and the suites this change touches
were run individually and are green above. Full-suite verification remains for an environment with registry access —
it is recorded as outstanding, not claimed.

---

## 6. W05 compatibility and rights verification

| Requirement | Status | Evidence |
|---|---|---|
| **W05 acceptance/completion unchanged** | ✅ | W05 remains **IN PROGRESS, NOT COMPLETE, NOT ACCEPTED**. Nothing in this change touches a W05 status |
| **Class follows `sourceRights`, not the provider label** | ✅ | `w05SourceRightsClassification.test.ts` 5/5, including *"the provider label cannot promote a dataset out of `UNKNOWN`"* — the invariant this correction strengthens rather than relaxes |
| **No rights granted, no `O3` authority added** | ✅ | No `O3` record, `PA-01`, manifest, verification file or evidence bundle modified. `L-041`'s correction removes a rule that **asserted** an attestation; it cannot grant one, because it only ever answers `UNKNOWN` more often |
| **Redistribution still not authorised** | ✅ | `not redistributable` labels untouched; the three admitted bundles remain `OPERATOR_ASSERTED` for local personal use only |
| **No dataset downloaded or installed** | ✅ | Tests build manifests in memory and read committed bytes under `evidence/`. No Windows host access, no install |
| **IPD not written** | ✅ | Read-only. Private IPD packages were not modified; they could not even be fetched, and were excluded from the local test environment rather than patched |
| **`L-041` remains `OPEN`** | ✅ | Register untouched; a test now **reads the register** and fails if either status cell changes |

**Why the correction is rights-conservative, not rights-expanding.** The removed rule answered
`OPERATOR_SUPPLIED` for any dataset whose provider string did not happen to contain "synthetic" or "fixture" — it
manufactured an attestation from free text the same operator wrote. Delegating to the rights declaration can only
ever produce **fewer** `OPERATOR_SUPPLIED` answers, never more. The three committed Infosys manifests move from a
fabricated attestation to an honest `UNKNOWN`, which is the truthful position for a dataset that declares no rights
evidence at all.

---

## 7. Can `L-041` be marked `CLOSED`? **No. It must remain `OPEN`.**

The defect the finding describes **no longer reproduces**: both paths answer `UNKNOWN`, the repudiated rule is gone
from every source path, and the generator proves the agreement rather than assuming it. On the evidence, the
*technical* finding is discharged.

It still must **not** be closed, for three reasons that are not technical:

1. **Its completion standard is a register act, and it names the wrong owner for the fix that was needed.** The
   status cell reads `OPEN (contract decision: read-model owner)`. Whether to close it is that owner's decision.
   A code change is evidence *for* that decision; it is not the decision. Closing it here would be the same class of
   error the correction exists to prevent — inferring an authorisation nobody gave.
2. **One limb of its own recorded reasoning is not yet satisfied on the IID line, and is satisfied on `main`.**
   `L-041` records that the fix is "a change to a published read-model contract other surfaces consume". On the IID
   line this correction changes that contract deliberately and narrowly: `UNKNOWN` is a new member, and
   `FinancialCoverageDisclosure.datasetClass` and `InvestmentCoverageReport.dataset.datasetClass` both gained it.
   Consumers were traced and none break — `InvestmentCoveragePage` gates only on `NONE` and renders the class as
   text, so `UNKNOWN` renders and does not trigger the "absent" state; `verify-installed-dataset.ts` compares it as
   a string. That is **my** reading of the consumers, with tests behind it, but it is not the read-model owner's
   sign-off that `L-041` asked for.
3. **The correction exists on a branch, not in the delivered line.** `main` has its own independent correction; the
   IID line's copy is this one, and it is not merged. A limitation appearing closed while two branches carry
   different states of the same contract is precisely the condition `L-041` was raised about.

### What would legitimately close it

| # | Act | Owner | Status |
|---|---|---|---|
| 1 | Read-model owner confirms `UNKNOWN` as a published member of the coverage vocabulary, and the delegation as the read model's rule | **read-model owner** | **OPEN** — this record is the request for it |
| 2 | Register owner changes the `L-041` status cell from `OPEN …` to `RESOLVED`, citing the executed evidence | **register owner** | **OPEN** |
| 3 | The IID line's correction lands on `main` — by PR #574's merge, or by this branch being merged | **Principal** | **OPEN** — no merge performed |

Until all three, the exact outstanding evidence is: **(1)** an owner decision on the `UNKNOWN` contract change,
**(2)** the register status cell, and **(3)** merge. Nothing technical is outstanding; the divergence is provably
gone and guarded against return.

---

## 8. Boundary confirmations

| Boundary | Confirmation |
|---|---|
| **W05 acceptance / completion** | **Unchanged.** W05 remains IN PROGRESS, NOT COMPLETE, NOT ACCEPTED |
| **`O3` rights / redistribution** | **No rights granted.** No `O3` record, `PA-01`, manifest, verification file or evidence bundle modified |
| **IPD** | **Read-only, zero writes.** No IPD file or configuration touched; private packages excluded from the local test environment, not patched |
| **Windows host** | **Not touched.** Nothing downloaded or installed; no candidate dataset installed |
| **PR #562 / #563** | **Not modified, not merged.** No merges of any kind performed |
| **Register** | **Byte-untouched.** `L-041` and `L-042` both remain `OPEN`; a test now enforces that |
| **Historical evidence** | **Preserved.** `dataset-class-divergence.json` byte-identical, pinned by digest, no longer regenerated |
| **`main`** | **Not modified.** `main` already carries its own correction; the defect exists only on the IID line |
| **Acceptance criteria** | **Not weakened.** The generator's guard was inverted, not removed: it still refuses to publish, now for the opposite and correct reason |

---

*End of record. This document reports executed evidence. It does not close `L-041`, and it does not claim the
frontend full suite was run to green — three private IPD packages are unfetchable in the verification environment,
which is recorded as outstanding rather than worked around.*
