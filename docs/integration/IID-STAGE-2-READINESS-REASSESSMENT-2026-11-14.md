# IID Stage 2 — Identity Readiness **Reassessment** (Windows-host execution)

**Date of assessment:** 2026-11-14 (UTC)
**Date of host execution:** 2026-11-14 (operator, Windows host)
**Assessed head:** `da4d145bf657d797a30df09d49b429595992591d` on `arena/94a53bb3-iips-review-recovered`
**Publication:** additive. PR #562 remains OPEN and UNMERGED.
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — assessment and documentation only
**Evidence record:** `IID-STAGE2-WINDOWS-HOST-PROVISION-EVIDENCE-2026-11-14.md` (published with this one)

> ## What this record is, and what it is not
>
> This is the **first** readiness assessment of IID Stage 2. Unlike Stage 3, which had a BLOCKED record
> (2026-11-13), a CONDITIONALLY READY reassessment (2026-11-13) and then a host-execution reassessment
> (2026-11-14), Stage 2 had no prior verdict to supersede. It was named as the next roadmap step by
> `IID-STAGE-3-READINESS-REASSESSMENT-2026-11-14.md` §11 and gated there on owner decision **O1**.
>
> It assesses Stage 2 against **actual Windows-host execution** supplied by the operator on 2026-11-14 and
> reconciled against the authoritative source at head `da4d145b`.
>
> | Prior record | Status in this work |
> |---|---|
> | `IID-STAGE-3-READINESS-REASSESSMENT-2026-11-14.md` | **Unchanged.** Its Stage 3 verdict stands. This record closes the item it named as next, and re-evaluates its R-1…R-4 (§7) |
> | `IID-STAGE3-WINDOWS-HOST-ACCEPTANCE-EVIDENCE-2026-11-14.md` | **Unchanged.** Stage 3's host evidence is separate and is not reused here |
> | `IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` | **Unchanged, and relied on.** O3 is the authority for exactly the three bundles Stage 2 merged |
> | `CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md` | **Unchanged, and relied on.** Its §8.2, §10.1 and H-3 are the authority for Stage 2's scope, gate and evidence |
> | `IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` | **Unchanged.** `L-041`/`L-042` are neither closed nor reclassified here (§8) |
>
> No claim rests on a prior report's conclusion. The Windows numbers are host output; every code position cited
> is read from this head; every behavioural claim about the served surfaces was **executed on Linux at this head**
> and is labelled as such. One arithmetic inconsistency found in a published record is noted in §6.3 and **not
> corrected in place**, because prior records are unchanged byte for byte.

---

## 1. Verdict

> ### **Stage 2 objective MET and host-verified — with one owner register act (O1) outstanding**
>
> The baseline's Stage 2 objective is *"an installed, validated identity reference set for the intended
> population"* (`CPII-01` §10.1, adopting baseline §21). On 2026-11-14 the operator published such a set at the
> designated governed location and verified it read-only in a separate invocation:
>
> | Host act | Result | Checks |
> |---|---|---|
> | Dependency preflight | `REFUSED-PRECONDITIONS` — **correct refusal**, tsx absent in a fresh worktree | 12 passed, 2 failed, 4 info |
> | Read-only preflight | `PREFLIGHT-PUBLISHABLE`, provisioner exit 0 | **34 passed, 0 failed**, 18 info |
> | Publication (`-Execute`, phrase confirmed) | `PUBLISHED`, provisioner exit 0 | **53 passed, 0 failed**, 24 info |
> | Independent verification (`-VerifyOnly`) | `VERIFY-PASS`, provisioner exit 0 | **27 passed, 0 failed**, 20 info |
>
> All four check triples reconcile **exactly** against a census of the script's own `Add-Check` sites
> (evidence record §6). Readiness finding **D1 `identity-files` is now `irr-owned-operational` /
> `IDENTITY_SOURCES_VALID`** (§4), and baseline host artefact **H-3 is satisfied** (§3).
>
> **What is NOT claimed.** Stage 2's governance gate **O1 is not discharged of record** (§2). Overall IID
> readiness remains **NOT READY** — `ready` stays `false`, with **five of seven** read-critical findings
> outstanding (§6). The **Identity Coverage page still returns 503**, for a different reason than before (§5).
> Stage 3's captures **R-1 and R-2 remain open** (§7). `L-041`/`L-042` remain **OPEN** (§8). No holding,
> watchlist or broker row has been shown to resolve to an issuer (§9).

Stage 2 readiness decomposes as follows. Each row states what was observed, by whom, and where.

| # | Dimension | Verdict | Basis — and where it was observed |
|---|---|---|---|
| 1 | **Authoritative source data exists** — do real, validating identity triples exist for the admitted population? | **MET** | Repository. Three O3-admitted bundles each carry a complete triple; all load `available=true`, 0 issues, `OPERATOR_SUPPLIED`; each cross-checks exactly against its own bundle's `ingest-input/roster.json` |
| 2 | **A provisioning capability exists** — can the set be merged, published atomically and verified? | **MET** *(was: ABSENT)* | `617a8bae`. Before it, every consumer of `IDENTITY_FILE_NAMES` was read-only and nothing could write the three files. 52 platform tests + 9 served-route tests |
| 3 | **Installation on the host** — is the set at the designated governed location? | **INSTALLED** *(was: ABSENT)* | **Host-observed.** `C:\iips-data\investment\identity`, three files, `PUBLISHED`, `target-holds-exactly-three-files` passed, no marker left behind |
| 4 | **Validation on the host** — does the installed set pass the product's own loader? | **VALIDATED** *(was: NOT VALIDATED)* | **Host-observed.** `VERIFY-PASS`, 0 failed, with `existing-loader-accepts-published-set` as a **hard** check in that mode |
| 5 | **Authoritative rather than fixture** — baseline H-3's second limb, and Stage 2's own prohibition | **MET** | **Host-observed.** `data-class-is-operator-supplied` passed as a hard check; the provisioner refuses `SYNTHETIC_FIXTURE` upstream. Arena's diff shows no resolver rule was widened (§3.3) |
| 6 | **Declared-identifier self-consistency** — does the set resolve its own identifiers? | **MET, on both paths** | **Host-observed.** Probe ran (`-NoProbe` absent); 8 items, all resolved, ISIN path > 0 and exchange/symbol path > 0, 0 issuer-key conflicts, counts reconcile |
| 7 | **Governance gate O1** — which issuers, what eligibility rules, who owns edits | **NOT DISCHARGED OF RECORD** | No O1 decision record exists (§2). The owner's act is strong evidence of intent; a decision record is a different artefact and an assessor may not mint one |
| 8 | **Population scope** — is three issuers "the intended population"? | **UNRESOLVED — and this is O1's question, not a technical one** | Three issuers in three sectors is the O3-admitted evidence set. Baseline G-1 records that *no full-universe identity reference set exists anywhere*. Whether the intended population is these three or wider is exactly what O1 settles |
| 9 | **Holding-to-issuer resolution** — does a real observation resolve? | **NOT ESTABLISHED** | The probe is `DECLARED_IDENTIFIER_SELF_CONSISTENCY` and read no observation surface. Gated on B-4/B-5/B-6 (§5) |
| 10 | **Served identity surface** — does the Identity Coverage page work? | **STILL 503 — reason moved downstream** | **Arena-verified on Linux at this head.** `/api/investment/coverage` returned `identity-sources-unavailable` before publication and `observation-sources-unavailable` after (§5.2) |

**Overall Stage 2 status: objective MET and host-verified for the O3-admitted population; O1 outstanding.**
Rows 1–6 are the technical substance of the stage and all are met, four of them host-observed. Rows 7–8 are one
owner register act. Rows 9–10 were never Stage 2's to close: they belong to IC-1's IPD-owned and
operator-carrier blockers, which `CPII-01` §8.2 states produce `503 coverage source surface unavailable`
*"regardless of B-3"*.

---

## 2. The O1 gate — the central finding of this assessment

`CPII-01` §8.2 states the gate precisely:

> **B-3 has a governance precondition, not just a file-placement step.** The baseline's §18 and §28 record that no
> full-universe identity reference set exists anywhere (G-1), that authoring the roster is **owner decision O1** (a
> data-governance act: which issuers, what eligibility rules, who owns edits), and that the three committed operator
> sets are single-issuer evidence bundles.

and §12 item 3:

> **Stage 2 needs O1 before it needs files.** Rostering is a data-governance decision (which issuers, what
> eligibility rules, who owns edits), not a file-placement task. The three committed sets are single-issuer evidence
> bundles; admitting them operationally is **O3**.

### 2.1 What the owner's act does evidence

The operator — who in a local single-user application **is** the owner — created a worktree at this head, ran the
script, was shown the exact case-sensitive phrase, typed `PROVISION IID STAGE 2 IDENTITY`, and published exactly
the three bundles O3 admits. That is not a proxy, a script guessing, or an assessor's substitution: it is the
owner performing the placement act on the owner's own machine, against a gate the script enforces by refusing to
proceed on any case-variant of the phrase.

As to **"which issuers"**, the act is decisive and verifiable: the merged set names Infosys Limited, Marico
Limited and KEC International Limited, and `SYNTHETIC_SOURCE_REFUSED` plus the hard
`data-class-is-operator-supplied` check make it impossible for that set to have been a fixture.

### 2.2 What the owner's act does NOT evidence

O1 has three limbs, and a publication act can only speak to one of them:

| O1 limb | Evidenced by the host act? | Why |
|---|---|---|
| **Which issuers** | **Yes, for these three** | The published roster is exactly the O3-admitted set, host-verified `OPERATOR_SUPPLIED` |
| **What eligibility rules** | **No** | Every source issuer carries `status: "ELIGIBLE"` as supplied. The host act adopted those statuses; it did not state a rule for deciding eligibility, and no rule was authored or recorded |
| **Who owns edits** | **No** | Nothing in a publication act assigns edit ownership. The provisioner is re-runnable and idempotent, so *any* future act can replace the set; who is authorised to do so is unrecorded |
| **Whether three IS the intended population** | **No** | Baseline G-1: *no full-universe identity reference set exists anywhere*. Three issuers is what exists and was admitted — not a statement that the intended universe is three |

### 2.3 The resulting position, stated without inflating or deflating it

**O1 is partially evidenced and wholly unrecorded.** Two of its four questions are untouched by any act that has
happened, and no O1 decision record exists — in contrast to O3, which has one
(`IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md`, 633 lines).

This assessment therefore does **not** declare Stage 2 closed, and does **not** mint an O1 record. The precedent
this repository already set is explicit at `IID-STAGE-3-READINESS-REASSESSMENT-2026-11-14.md` §7 R-4: *"An
assessor may not mint, close or reclassify either entry."* The same restraint applies to O1, and applying it here
is not the introduction of organisational governance — it is one recorded decision by the single owner, which is
the least governance the baseline's own gate requires.

**What closes it:** an owner decision, recorded as O3's was, stating (i) the intended population — these three
issuers, or a wider set with a plan for the rest; (ii) the eligibility rule, or an explicit adoption of the
source-supplied `status` values as the rule; (iii) who may edit the published set and by what act. Until then
Stage 2's technical substance is complete and its governance gate is open, and this record says both.

**What O1 does NOT block:** re-running `-VerifyOnly` at any time (read-only, no decision needed); R-1 and R-2,
which are captures of a state that already exists; or Stage 4's *dependency* on Stage 2 being satisfied in
substance — Stage 4 needs an installed, validated identity set, and one now exists (§12).

---

## 3. The baseline's Stage 2 requirements, clause by clause

The baseline (`IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md`) is **not present on this
branch**; `CPII-01` §14 records it on branch `arena/iid-coverage-readiness-report-2026-11-11` @ `31a9b01e`. Stage
2's requirements are therefore taken from `CPII-01`'s quotations of it, which this record adopts by reference
rather than restating as its own.

### 3.1 The objective

> **Stage 2 — identity readiness** | an installed, validated identity reference set for the intended population |
> independent of Stage 3 and of IPD; **gated on owner decision O1** | B-3

| Limb | Status | Evidence |
|---|---|---|
| *installed* | **MET** | Host-observed: three files at `C:\iips-data\investment\identity`; `PUBLISHED`; `target-holds-exactly-three-files` |
| *validated* | **MET** | Host-observed: `VERIFY-PASS`, 0 failed, `existing-loader-accepts-published-set` as a hard check |
| *identity reference set* | **MET** | Roster + listing map + corporate-action table, all three, schema `IIPS_INVESTMENT_IDENTITY_V1` |
| *for the intended population* | **CONDITIONAL on O1** | The population is the O3-admitted three. Whether that *is* the intended population is O1's question (§2.2) |
| *independent of Stage 3 and of IPD* | **CONFIRMED** | Stage 2 required no dataset and no IPD binding. The script's `dataset-not-targeted` guard passed in all four runs, and the Stage 3 dataset was untouched |
| *gated on owner decision O1* | **OPEN** | §2 |
| *B-3* | **CLOSED as to the files** | `CPII-01` §8.2 defined B-3 as *"Three authoritative identity files absent"*, evidenced by *"readiness D1 `IDENTITY_SOURCE_MISSING (3 of 3)`"*. Both are now false (§4) |

### 3.2 Host artefact H-3

`CPII-01` §7.2 names the host-only fact Stage 2 exists to produce:

> **H-3** | **Actual installed identity files** (three JSONs, and whether authoritative rather than fixtures) |
> Filesystem of the host | readiness D1 → `IDENTITY_SOURCES_VALID`; the resolver refuses the whole se…

**H-3 is satisfied, both limbs.** The three JSONs are installed (host-observed), and they are authoritative
rather than fixtures — established not by assertion but by a hard check the host evaluated
(`data-class-is-operator-supplied`, `VERIFY-PASS` with 0 failures), backed by the provisioner's upstream refusal
of any set that self-classifies as synthetic. The consequence H-3 names, `readiness D1 → IDENTITY_SOURCES_VALID`,
is derived in §4.

### 3.3 Stage 2's three prohibitions

`CPII-01` §8.2 quotes the baseline's Stage 2 "Do not" list, and adopts it unchanged:

| Prohibition | Observed | How established |
|---|---|---|
| *"copy synthetic fixtures into the operational domain"* | **NOT DONE** | Host-observed: `data-class-is-operator-supplied` passed as a hard check. Structurally: `SYNTHETIC_SOURCE_REFUSED` fires on any source whose roster self-classifies as a fixture, and the composed label is re-checked for `synthetic` before writing. The repository's fixture triple was used in Arena's refusal tests and never published |
| *"invent identifiers"* | **NOT DONE** | Every identifier in the published set is a raw record concatenated from the three admitted bundles. The merge applies no default that could mint an identifier, and the merged candidate is re-validated through the existing loader before writing |
| *"widen resolver rules to force `RESOLVED`"* | **NOT DONE — and structurally impossible in this work** | `git diff --name-only a835d4af..da4d145b` touches **no** resolver, sources, types, runtime or coverage file. The branch adds `provision.ts`, its CLI, three test files and the `.ps1` — 6 files, +4647/−0, **zero deletions**. Resolution ran on unchanged rules |

The third row is worth stating in that form. It is not an observation that nobody widened a rule; it is a
**diff-level proof** that this work could not have. Resolution succeeded on the host because the identifiers
genuinely reconcile, not because the test was made easier.

`CPII-01` §11 also records the related hazard **R-J** — *"installing 'a synthetic governed fixture' makes the
surface report `available`, while §21 Stage 2 forbids copying fixtures into the operational domain"*. R-J is the
reason `rosterDataClass` is checked at all rather than mere availability. **The hazard did not materialise**: the
host reported `OPERATOR_SUPPLIED`, and it was a hard check rather than a disclosure.

---

## 4. Readiness finding D1 `identity-files`, reassessed

Statuses are derived from `frontend/server/investment/runtimeReadiness.ts:145-198` at this head, applied to the
host-observed state.

`identityFinding` has exactly three outcomes:

| Branch | Condition | `ownership` | `reason` |
|---|---|---|---|
| `:159-170` | any of the three files absent | `user-host-provisioning-required` | `IDENTITY_SOURCE_MISSING (n of 3 files absent)` |
| `:173-187` | all present but the loader rejects them | `user-host-provisioning-required` | `IDENTITY_SOURCE_INVALID (codes)` |
| `:188-197` | all present **and** `loadIdentitySourcesFromDir(dir).available === true` | **`irr-owned-operational`** | **`IDENTITY_SOURCES_VALID`** |

The host evidence establishes both conditions of the third branch:

1. **All three files present.** In the `VERIFY_ONLY` run the `existing <name>` loop (`:393`) emitted exactly 3
   informational lines — forced by the informational total of 20, which is unreachable at 2 or 4 (evidence record
   §5.2). The loop iterates `Layer1ExistingDigests`, populated at `:378-388` by `Test-Path` on each of
   `IDENTITY_FILE_NAMES` in the target.
2. **The loader accepts them.** `existing-loader-accepts-published-set` (`:625`) passed, and in `VERIFY_ONLY`
   `PostClass` is `check` (`:595`, overridden to `info` only for `PREFLIGHT` at `:597`), so with **0 failed** it
   was a hard requirement. That check reads the trailer key `verification.available`, which the provisioner sets
   from `verifyPublishedIdentityDir` — a re-read of the published directory **through
   `loadIdentitySourcesFromDir`, the same function `runtimeReadiness.ts:172` calls**.

> **D1 `identity-files` is therefore `irr-owned-operational`, reason `IDENTITY_SOURCES_VALID`, on the host.**

This is a **derivation**, not a capture. The diagnostic itself was not run in the host process — that is R-1,
unchanged (§7). The derivation is sound because both branches of `identityFinding`'s third case are established
by checks the host evaluated as hard requirements, and because the loader invoked is literally the same function.
What it is not: a host transcript showing `[ok] identity-files … IDENTITY_SOURCES_VALID`. §7 R-1 remains the act
that converts this derivation into a capture.

**D1 is the second of the eight findings to resolve.** Stage 3 resolved D8 `fundamentals-dataset`. Stage 2
resolves D1. Two of eight.

---

## 5. The served surfaces, reassessed

`CPII-01` §8.1 distinguishes two routes, and OBS-4 records that they are not the same surface:

| Route | Surface | Reads observation surfaces? |
|---|---|---|
| `/api/investment/coverage/investment` | **Investment** coverage — the dataset position per issuer | **No** |
| `/api/investment/coverage` | **Identity** coverage — holding/watchlist resolution | **Yes**, both, and they are jointly fatal |

### 5.1 The investment route: its identity disclosure has flipped

`investmentCoverageFromLocalDataset` (`identity/runtime.ts:91-145`) loads the identity sources and discloses
their availability without gating on it. **Executed on Linux at this head**, over a data root holding both a
dataset built from the three admitted bundles and an identity set published by the real provisioner:

| Field | Stage 3 host state | **After Stage 2** |
|---|---|---|
| `identitySourcesAvailable` | `false` | **`true`** |
| `identitySourceDetail` | `eligible-roster.json: IDENTITY_SOURCE_MISSING` | **`null`** |
| The third note (*"The eligible roster, listing map and corporate-action table could not be loaded, so no identity binding could be evaluated for any issuer…"*) | present | **absent** — the `if (!identitySourcesAvailable)` branch at `investmentCoverage.ts:344` no longer fires |
| `datasetClass` / issuers / rows / sectors | `OPERATOR_SUPPLIED` / 3 / 3 `COVERED` / 3 of 13 | **unchanged** — Stage 2 does not touch the dataset |

**This materially changes what R-2's capture must show**, and is the reason R-2 is re-scoped in §7 rather than
carried forward verbatim: an operator capturing the investment surface today and comparing it against the Stage 3
record's expected content would see the identity disclosure say the **opposite** of what that record predicted,
and could mistake correct behaviour for a regression.

### 5.2 The identity route: still 503, and the reason moved downstream

**Executed on Linux at this head**, using the real composition-root providers (`createCoverageProviders`) with no
owner-context environment — i.e. D4/D5/D6 as they stand — against the same data root, before and after
publication:

```text
BEFORE Stage 2 (no identity)        HTTP 503  error=identity-sources-unavailable
                                            issues=[{"file":"eligible-roster.json","code":"IDENTITY_SOURCE_MISSING", …}]
AFTER  Stage 2 (identity published) HTTP 503  error=observation-sources-unavailable
                                            issues=[{"code":"OBSERVATION_SOURCE_UNAVAILABLE",
                                                     "subject":"holdings/broker-preview/watchlist", …}]
```

The route still fails, but the failure has moved **past** identity and onto the observation surfaces. This is
precisely what `CPII-01` §8.2 predicted before any of this work existed:

> Because all observation surfaces are **mandatory and jointly fatal** (§4.3), B-4/B-5/B-6 each independently
> produce `503 coverage source surface unavailable`, **regardless of B-3**. **Identity Coverage therefore cannot
> be operationalised by IRR or by the operator alone** (IC-1).

The mechanism, read at this head: `createWatchlistProvider` (`frontend/server/investment/sources.ts:168-183`)
**throws** `'owner context not established: the server-owned binding carrier is not configured'` when
`resolveOwnerContext` returns null (B-6 / D4); `createHoldingsProvider` throws before constructing the port when
the binding precondition is unestablished (B-4 / D5, B-5 / D6). `coverageDependencies.observations`
(`coverage-transport.ts:75-96`) collects those failures and **deliberately** rethrows, because a partial surface
set would produce a coverage total that looks complete and is not.

Three consequences, each of which matters:

1. **Closing D1 does not make the Identity Coverage page live.** Anyone expecting Stage 2 to light up
   `/identity-coverage` will see a 503 and could wrongly conclude Stage 2 failed. It did not; the 503 is now
   B-4/B-5/B-6's, which are IC-1's IPD-owned and operator-carrier blockers.
2. **The error code is the diagnostic.** `identity-sources-unavailable` means B-3; `observation-sources-unavailable`
   means B-4/B-5/B-6. The transition between them is itself evidence that B-3 closed.
3. **The investment route is now the only served surface that can evidence D1's closure**, because the identity
   route is blocked upstream of identity. R-2 is re-scoped accordingly (§7).

The fail-closed behaviour is correct and is pinned by test: a faulted observation surface yields **503**, not an
empty 200 that would read on the page as full coverage of nothing
(`frontend/server/investment/iidStage2ServedIdentityRoute.test.ts`).

### 5.3 What was verified about the served route over a published set, on Linux

Nine tests publish with the real CLI and then issue real HTTP requests. They establish, **on Linux**: 200 with
the composed roster label and `OPERATOR_SUPPLIED`; 8 observations resolved through both paths; an unresolvable
ISIN reported as `UNRESOLVED` with a reason rather than dropped; **no writes** (byte-identical directory before
and after); 503 `IDENTITY_SOURCE_MISSING` when the set is removed; the HTML view served; a malformed `asOf`
rejected 400; and correct operation from a data root whose path contains a space. These are behavioural proofs
about the implementation, and are **not** a host capture of the served surface — that is R-2.

---

## 6. The eight readiness findings, after Stage 2

### 6.1 The table

| # | Finding | Ownership now | Reason string | How known | Changed by Stage 2? |
|---|---|---|---|---|---|
| **D1** | **`identity-files`** | **`irr-owned-operational`** | **`IDENTITY_SOURCES_VALID`** | **Derived from two host-evaluated hard checks** (§4) | **YES — resolved** |
| D2 | `np04-assessment-store` | `irr-owned-not-configured` | `DATABASE_PATH_NOT_CONFIGURED` | Code-derived; not observed on the host | No |
| D3 | `reports-owner-context` | `user-host-provisioning-required` | `REPORTS_OWNER_CONTEXT_UNAVAILABLE` | Code-derived; not observed on the host | No |
| D4 | `owner-context-carrier` | `user-host-provisioning-required` | `OWNER_CONTEXT_UNAVAILABLE` | Code-derived. **Now load-bearing for the identity route** (§5.2) | No — but its consequence is now observable |
| D5 | `ipd-binding-precondition` | `ipd-owned-unavailable` | `BINDING_NOT_PROVISIONED` | Code-derived. **IPD-owned**; IRR cannot establish it and must not assert it | No |
| D6 | `ipc-endpoint` | `irr-owned-not-configured` | `ENDPOINT_NOT_RESOLVED` | Code-derived; not observed on the host | No |
| D7 | `local-personal-use-enablement` | per declaration | `LOCAL_PERSONAL_USE_DECLARED` if set | Operator-declared. Excluded from the `ready` rule | No |
| D8 | `fundamentals-dataset` | `irr-owned-operational` | `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED` | **Host-observed** at Stage 3 | No — resolved by Stage 3 |

### 6.2 The `ready` rule

`ready` is computed at `runtimeReadiness.ts:489-492` as *every* read-critical finding — all eight except D7 —
being `irr-owned-operational` or `ipd-owned-operational`. With **D1 and D8 operational** and **D2–D6
outstanding**, `ready` is **false** and **five of the seven** read-critical findings remain outstanding.

> **Overall IID readiness is NOT READY, and Stage 2's success does not make it so.** Stage 2 resolved one finding
> of eight, exactly as Stage 3 resolved one. Two of eight are now resolved; five remain. The diagnostic's own
> disclosure remains the correct summary: *"This report describes only the process environment it ran in. An
> absent setting here is NOT evidence about any other host, including the operator Windows machine."* — which is
> why D2–D6 stay marked code-derived rather than host-observed, and why R-1 is still an operator act.

### 6.3 One arithmetic inconsistency in a published record, noted and not corrected

`IID-STAGE-3-READINESS-REASSESSMENT-2026-11-14.md:244-246` reads:

> `ready` is computed at `:490-493` as *every* read-critical finding (all eight except D7) … With D8 operational
> and **D1–D6 outstanding**, `ready` is **false** and **five of the seven** read-critical findings remain
> outstanding.

All eight except D7 is **seven** read-critical findings. With D8 operational, the outstanding set D1–D6 is
**six**, so at that record's own instant the count was six of seven, not five. The figure becomes correct only
from this record forward, when D1 also resolves and D2–D6 — five — remain.

This is noted rather than corrected in place, because prior records are unchanged byte for byte and because the
error is immaterial to that record's verdict: `ready` was `false` on either count, and its substantive claim
("Stage 3 flipped one finding of eight") is right. It is recorded here so that a reader comparing the two records
is not left reconciling six against five unaided. No number in the Stage 3 record was altered, and no host number
is involved.

---

## 7. Remaining-action register

R-1…R-4 are the Stage 3 record's identifiers, re-evaluated here against the Stage 2 evidence as §7 of that record
requires. None is renamed. Two new Stage 2 items are added with their own prefix so they cannot be confused with
Stage 3's.

| ID | Action | Owner | Status after Stage 2 | Exact act | Exact evidence that closes it | Blocks what? |
|---|---|---|---|---|---|---|
| **R-1** | Capture the readiness diagnostic from the host process | **OPERATOR** (`USER_HOST`) | **OPEN — unchanged, and now more valuable.** Stage 2 supplied no diagnostic capture (evidence record G-4). D1's flip is derived, not captured (§4) | On the host, in the server process carrying `IIPS_DATA_DIR=C:\iips-data`, run the existing `iid-readiness` diagnostic. No new tooling | Its stdout showing **`identity-files` as `irr-owned-operational`, reason `IDENTITY_SOURCES_VALID`** — the capture that converts §4's derivation into observation — alongside `fundamentals-dataset` operational, `ready: false`, `--strict` exit **1**, and **D2–D6** outstanding | Baseline acceptance clause 4 as a capture. Non-blocking for the installed fact, which the host verified twice |
| **R-2** | Capture the served coverage surface | **OPERATOR** | **OPEN — re-scoped, because its expected content is now wrong.** The Stage 3 record required the capture to show *"the identity disclosure stating that identity sources were unavailable"* and warned that `/investment/coverage` *"will return 503 while D1 is open"*. **Both are now false** (§5) | Two captures, each naming its route. **(a)** Investment: `GET /api/investment/coverage/investment?asOf=…`. **(b)** Identity: `GET /api/investment/coverage?asOf=…` — expected to return **503 `observation-sources-unavailable`**, which is the *correct* result and is itself evidence that B-3 closed | **(a)** 3 issuers listed, `datasetClass OPERATOR_SUPPLIED`, all rows `COVERED`, **3/13** sectors, ten outstanding sectors named, usable methods > 0, and **`identitySourcesAvailable: true` with `identitySourceDetail: null`** — the disclosure now stating the **opposite** of the Stage 3 expectation. **(b)** 503 with error `observation-sources-unavailable`, subject `holdings/broker-preview/watchlist`, and **not** `identity-sources-unavailable` | Baseline acceptance clause 1 and the "page capture (host)" evidence item. Non-blocking for the substance, verified on Linux (§5.3) |
| **R-3** | Record the installation invocation's stdout | **OPERATOR** (optional; superseded in substance) | **OPEN — unchanged.** Stage 2 does not bear on it: R-3 concerns the Stage 3 **dataset** install, a different act at a different path. Reinstallation remains **prohibited** | None required | As the Stage 3 record states | Nothing |
| **R-4** | Adjudicate `L-041` and `L-042` | **OWNER** (register act) | **OPEN — unchanged.** See §8 | An owner decision in the limitation register | An owner decision recorded in the register | Nothing in Stage 2 |
| **S2-R1** | Record the owner's **O1** decision | **OWNER** (register act) | **NEW — the one item standing between Stage 2's technical completion and its closure** | A decision recorded as O3's was, stating the intended population, the eligibility rule (or explicit adoption of source-supplied `status`), and who may edit the published set (§2.3) | An O1 decision record | **Stage 2's closure.** Not Stage 4's substance, which needs an installed validated set and has one (§12) |
| **S2-R2** | Supply the host transcript detail that was not captured | **OPERATOR** (optional) | **NEW — closes evidence gaps G-1…G-3** | Re-run `-VerifyOnly` (read-only, safe to repeat, must not re-publish) with `-Report <path.json>`, or supply the full stdout of any one run | `$PSVersionTable.PSVersion` and `node --version`; the `asOf` used; the per-check detail lines; the `published.digest` and `verification.*` values as **host-observed** rather than predicted | Nothing. The four census reconciliations already tie the runs to this script version; this would replace prediction with observation |

**Explicitly not remaining actions**, because naming them would reorder the roadmap or reopen closed work:
merging PR #562 (an owner act); re-running `-Execute` (the set is published and verified — repetition is
prohibited by this work item and would only churn identical bytes); reinstalling or repairing the Stage 3 dataset
(prohibited — it is evidence); anything in D2–D7 (separate dependencies, separate owners); any adjudication of
source rights; Win32 interrupted-publication recovery (a separate fault-injection item, never authorised);
IID Stage 4 work (the next stage, not a remaining action of this one).

---

## 8. `L-041` and `L-042`

Both remain **OPEN**, deliberately not adjudicated here. An assessor may not mint, close or reclassify a register
entry, and Stage 2 supplies no basis to do either.

| Entry | Substance | Effect of Stage 2 |
|---|---|---|
| **L-041** | `OPERATOR_SUPPLIED` rests on a substring test; permitted use of the source data is an operator attestation, not verified rights | **Unchanged, and its reach is now wider.** The classification is derived at `sources.ts` as `texts.dataClass ?? (/synthetic/i.test(rosterLabel) ? 'SYNTHETIC_FIXTURE' : 'OPERATOR_SUPPLIED')`. The published set's label is machine-composed by the provisioner — *"Merged from 3 operator-supplied identity source set(s): …"* — which contains no `synthetic` match, so the class is `OPERATOR_SUPPLIED` **by the same substring test L-041 describes**. Stage 2 did not fix that mechanism and did not claim to; it added a merged set classified by it. What Stage 2 does add is that the classification is now a **hard host-evaluated check** rather than an inference, so a fixture could not have slipped through unnoticed — but "not a fixture" is not "rights verified", and the distinction L-041 draws survives intact |
| **L-042** | The `EV_EBITDA`/`EV_REVENUE` basis label names only the dominant bridge term | **Unchanged. Unrelated to identity** — it concerns valuation basis labelling, and nothing in Stage 2 touches valuation |

`L-041` conditions how the **classification** limb of Stage 2's dimension 5 may be described: the set is
authoritative rather than fixture, host-verified; it is not rights-cleared, and this record does not describe it
as such.

---

## 9. Disclosures and limitations

Every one of these survives the host result. The host evidence **confirms** items 1–4 rather than relieving them.

1. **Only three issuers, in three of thirteen sectors.** That is the O3-admitted evidence set, not an investment
   universe and not coverage. Baseline G-1 — *no full-universe identity reference set exists anywhere* — is
   unchanged by publishing three issuers.
2. **The corporate-action table is EMPTY.** Zero actions across all three sources. The provisioner's own
   disclosure states it: *"An empty table is valid and means 'no action is claimed', not 'no action was checked'."*
   No split, merger, demerger or successor reconciliation has been exercised against real data on the host.
3. **No holding, watchlist or broker row has been shown to resolve.** The probe's class is
   `DECLARED_IDENTIFIER_SELF_CONSISTENCY`: it proves the published set resolves **its own** declared identifiers.
   It read no observation surface and establishes nothing about any portfolio. Holding-to-issuer resolution is
   IC-1's, gated on B-4/B-5/B-6.
4. **The Identity Coverage page does not work, and Stage 2 was never going to make it work.** §5.2 verifies the
   503 and its moved reason. `CPII-01` §8.2 said this would happen regardless of B-3, before any of this work
   existed.
5. **The published digests are predicted, not host-observed.** Evidence record §4.5 labels them PREDICTED. What
   the host did establish is stronger where it counts: `digest-cross-check` re-hashed with `Get-FileHash` every
   digest the provisioner claimed for a real path — 9 source files, 3 candidate, 3 published — and passed with 0
   failures, having normalised both sides to lower case so hex case alone cannot mask a difference. That is
   agreement *within* the host run; it is not agreement *with* the Linux-computed values.
6. **The host transcript was four RESULT blocks, not four full transcripts.** Evidence record §6 establishes that
   every reachable check was emitted and passed, by arithmetic; it cannot establish what each check's detail text
   said. G-2.
7. **PowerShell and Node versions were not supplied** (G-1). This matters more than it would otherwise, because
   both Stage 3 defects were PowerShell **5.1** semantics. That the script behaved correctly is strong evidence
   about the engine it ran on; it is not a recorded version.
8. **Arena executed nothing on Windows.** Every Windows number is operator-supplied host output; every Arena
   number is labelled Linux. The `.ps1` was **not executed** by Arena at any point — at `617a8bae` it had only a
   structural conformance pass and a semantic model, and evidence record §6.1 records that the model under-counted
   by exactly six checks in every mode.
9. **Publication success is not an exercised recovery path.** Rollback is tested on Linux by fault injection at
   two points; no Win32 interruption occurred or was simulated.
10. **Idempotency churns inodes.** A repeat `-Execute` over an identical set re-stages and re-renames all three
    files: bytes identical, inodes replaced, `replacedExisting true`, attestation `WRITES_PERFORMED` — all
    truthful, and pinned by test at `da4d145b`. This is why repetition is listed as prohibited rather than
    harmless: it is safe, but it rewrites evidence files for no benefit.
11. **No volatile value is stated as a standing fact.** Every count, digest, exit code and status is bound to its
    observation instant on 2026-11-14 at head `da4d145b`.

---

## 10. Boundary confirmations

| Boundary | Confirmation |
|---|---|
| No new architecture | The branch adds one module, one CLI, three test files and one `.ps1`. 6 files, **+4647/−0, zero deletions**. No existing file was modified |
| No new identity source, no new issuer | Exactly the three O3-admitted bundles; exactly Infosys, Marico, KEC. The `.ps1` contains no hardcoded identifier or legal name in executable code, pinned by test |
| No resolver rule widened | No resolver, sources, types, runtime or coverage file touched (§3.3) |
| No parallel roadmap | Stage 2's objective, gate, host artefact and prohibitions are taken from `CPII-01` §7.2, §8.2, §10.1 and §12, quoted and adopted by reference. Nothing is re-sequenced |
| No completed work reopened | Stage 3's verdict, evidence and protected records are unchanged. Its R-1…R-4 are re-evaluated, as its own §7 requires, and none is renamed |
| No provisioning repeated | The set is published and independently verified. `-Execute` was not re-run by this work, and §7 lists repetition as prohibited |
| The Stage 3 dataset was not modified or reinstalled | The target is `<dataRoot>\investment\identity`; `dataset-not-targeted` passed in all four host runs |
| The Personal Portfolio store was not modified | Conformance R6: 0 database commands, 0 store-opening lines. The script names the path only in the `portfolio-store-not-targeted` guard, which passed in all four runs |
| The user's Windows worktrees were not modified or synchronised | The Stage 2 worktree was operator-created; the primary checkout and three Stage 3 worktrees were preserved. Nothing here depends on their state |
| No organisational governance introduced | The single outstanding governance item, O1, is the baseline's own gate — one recorded decision by the owner of a local single-user application. No committee, approval chain, deployment requirement or IPO Screening Engine concept appears anywhere in this work |
| PR #562 not merged | OPEN and UNMERGED. Merging is an owner act and is listed in §7 as explicitly not a remaining action of this one |
| No prior record altered | Every prior IID record is unchanged, byte for byte. The one inconsistency found (§6.3) is noted here, not corrected there |

---

## 11. Validation performed for this change, and its platform

Documentation plus one test addition. **No implementation, script, bundle, manifest or evidence file changed.**

| Gate | Result | Platform |
|---|---|---|
| `iips-platform` `npm run test:iid` | **1061 passed, 0 failed** (233 suites) | Linux |
| `iips-platform` `npm test` | **678 passed, 0 failed** | Linux |
| `iips-platform` `npm run typecheck` | exit **0** | Linux |
| `frontend` `npx tsc --noEmit` | exit **0** | Linux |
| `frontend` full Vitest suite | **2836 passed, 1 skipped** (198 files) | Linux |
| New: the host census, pinned | **9 tests** in the `windowsIdentityProvisionScript.test.ts` suite *"the Windows host census reconciles exactly"* (that file: **36 passed, 0 failed**, 6 suites) — all four host triples, both forced-multiplicity corollaries, and the bidirectional id reconciliation | Linux, against the `.ps1` source |
| PowerShell conformance R1–R8 | **PASS, 0 rule failures** across the four governed `.ps1` files | Linux, tree-sitter |
| Document-evidence validator | **PASS (0 failures)** over **161 assertions** — the 69 that guard the Stage 3
  records, plus 92 new ones (§10–§16) cross-checking **both** Stage 2 records against the real source: the four
  host triples, every check id named, 20 cited code positions, the D1 derivation, the served-surface findings,
  the diff-level prohibition proof, and 13 required distinctions | Linux |
| IID-0 static boundary | **6 passed** — both new `src/investment` files are inside it | Linux |
| Committed evidence after the full frontend suite | Restored with `git checkout -- evidence/` and verified clean: the suite rewrites two AC-X2 zero-socket files with fresh timestamps, PIDs and ephemeral ports. **0 evidence files changed by this branch** | Linux |

The document-evidence validator is the same cross-checking harness used for the Stage 3 records: it reads both
new documents and asserts their claims against `IID-STAGE2-IDENTITY-PROVISION.ps1`, `runtimeReadiness.ts`,
`coverage-transport.ts`, `coverageEndpoint.ts`, `sources.ts`, `runtime.ts`, `investmentCoverage.ts`,
`provision.ts`, the CLI, the census test, and `git diff`. A citation that does not match the source fails the
validator, so the records cannot drift from the code they describe.

The census test is the substantive addition. It encodes all 54 rows of the emission census with their per-mode
multiplicities and classes, asserts the four host triples exactly, and asserts the converse — that **every**
`Add-Check` id in the script appears in the census — so a site cannot be added or deleted without a total moving
and the test failing. It is what keeps §6 of the evidence record from becoming stale prose.

---

## 12. Next IID roadmap step — exact, from the authoritative sequence, and **not started here**

The authoritative sequence is the baseline's §21 stages, adopted by reference in `CPII-01` §10.1. It is **not**
re-sequenced here.

| Baseline stage | Objective | Independence, as the baseline states it | Position after this record |
|---|---|---|---|
| Stage 1 — runtime and source discovery | deterministic per-host truth about what the runtime needs, who owns it, what is missing | independent; no prerequisite | Prior work |
| **Stage 2 — identity readiness** | an installed, validated identity reference set for the intended population | independent of Stage 3 and of IPD; **gated on owner decision O1** | **This record. Objective MET and host-verified; O1 outstanding (S2-R1)** |
| **Stage 3 — investment dataset readiness** | ≥1 real, digest-verified dataset installed, plus the ingestion habit | independent of Stage 2 and of IPD; gated on **O3** | **READY** at `IID-STAGE-3-READINESS-REASSESSMENT-2026-11-14.md`; R-1/R-2 captures open |
| **Stage 4 — coverage readiness** | coverage, completeness, method usability and sector measurement verified on **installed** data; the §23 ten-scenario demo passing | **needs Stages 2–3** | **Both dependencies now satisfied in substance** — this is the next stage |
| Stage 5 — end-to-end integration | holdings → identity → dataset → assessment → disposition as one loop on the host | needs Stages 2–4 **plus IPD binding + IPC peer** | Blocked on IC-1: B-4 (IPD), B-5 (IPD + setting), B-6 (operator carrier) |
| Stage 6 — investment intelligence | routine use: review loop, change detection, dispositions, persisted comparable reports | needs Stage 5 + operator limits policy (**O5**) | Blocked behind Stage 5 |

**The next roadmap step is Stage 4 — coverage readiness.** Both of its stated dependencies are now satisfied in
substance: Stage 3 is READY with a digest-verified dataset installed and host-verified, and Stage 2 has an
installed, validated identity set, host-verified twice. This follows from the baseline's own dependency statement
(*"needs Stages 2–3"*) and not from preference.

**Two qualifications on starting Stage 4, stated so that neither is discovered mid-stage:**

1. **S2-R1 (O1) should be recorded first, but does not block Stage 4's substance.** Stage 4 needs an installed,
   validated identity set for the population it measures; one exists for the three admitted issuers. O1 settles
   whether that population is the intended one, which affects how Stage 4's results are *described*, not whether
   the measurement can be performed. Recording O1 first costs one owner act and removes the ambiguity.
2. **R-1 and R-2 belong to Stage 3 and are one command and two captures.** They are listed first among the
   operator acts because the baseline requires host artefacts per stage and Stage 3's artefact set is incomplete
   without them — not because they outrank Stage 4. R-2 in particular is now **cheap and doubly useful**: the
   investment-route capture evidences Stage 3's clause 1 *and* converts §4's D1 derivation into a served-surface
   observation, and the identity-route capture documents the 503 transition that proves B-3 closed.

**Explicitly not the next step:** IID Stage 5 or 6 (Stage 5 needs IC-1's IPD binding and a live IPC peer, which
`CPII-01` records as *"not on this side of the fence — no amount of IRR work substitutes for it"*); any of D2–D7
(separate dependencies, separate owners, separate decisions); merging PR #562 (an owner act); adjudicating
`L-041`/`L-042` (a register act); Win32 recovery fault-injection (never authorised); repeating the identity
publication or reinstalling the dataset (both prohibited — both are evidence).

---

## 13. What this record does **not** say

1. It does **not** say Stage 2 is closed. Its objective is met and host-verified; its O1 gate is open (§2).
2. It does **not** say the IID programme is complete, or that overall IID readiness is READY. `ready` stays
   **false**: D2–D6 outstanding. Stage 2 flipped **one** finding of eight, as Stage 3 flipped one.
3. It does **not** say the Identity Coverage page works. It says the opposite, with the reason and the mechanism
   (§5.2), and notes that `CPII-01` §8.2 predicted it.
4. It does **not** say any holding, watchlist or broker row resolves to an issuer. The probe is
   `DECLARED_IDENTIFIER_SELF_CONSISTENCY` and read no observation surface (§9 item 3).
5. It does **not** say Arena executed anything on Windows. Every Windows number is operator-supplied host output;
   every Arena number is labelled Linux.
6. It does **not** present the D1 flip as a host capture of the diagnostic. It is derived from two hard checks the
   host evaluated, against the same loader the diagnostic calls; R-1 remains the capture (§4, §7).
7. It does **not** present the §4.5 digests as host-observed values. They are PREDICTED, deterministically, and
   labelled so (§9 item 5).
8. It does **not** mint, close or reclassify O1, `L-041` or `L-042`. All three are owner register acts (§2.3, §8).
9. It does **not** treat three issuers in three sectors as an investment universe, an empty corporate-action
   table as "no action was checked", or annual-only evidence as quarterly or complete financial coverage.
10. It does **not** correct the Stage 3 record in place. The one inconsistency found is noted here (§6.3) and left
    there unchanged, with the reason.
11. It does **not** supersede, reinterpret or reopen any prior record, the O3 decision, or any governance
    decision. It is the first Stage 2 assessment and supersedes nothing.
12. It does **not** state any volatile value as a standing fact. Every count, digest, exit code and status is
    bound to its observation instant on 2026-11-14 at head `da4d145b`.

---

*End of reassessment. Published additively; the records it reassesses are unchanged, byte for byte.*
