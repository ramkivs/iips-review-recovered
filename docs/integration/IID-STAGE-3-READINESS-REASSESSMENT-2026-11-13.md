# IID Stage 3 — Investment Dataset Readiness **Reassessment**

**Date of assessment:** 2026-11-13 (UTC), verification window 13:20Z – 13:50Z
**Assessed head:** `b0198d335750dc1fe8a43956abf93ed713a667d1` on `arena/94a53bb3-iips-review-recovered`
**Publication:** additive. PR #562 remains OPEN and UNMERGED.
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — assessment and documentation only

> ## What this record is, and what it is not
>
> This record **reassesses** IID Stage 3 investment-dataset readiness against the current remote
> implementation and all published evidence. It **supersedes nothing**. The two protected records it
> reassesses remain authoritative for their own observation instants and are unchanged, byte for byte:
>
> | Protected record | sha256 (first 16) | Lines | Last touched by |
> |---|---|---|---|
> | `IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13.md` | `f74f2c6bc6334cd4…` | 1052 | `d1118df2` 2026-11-13T07:23:06Z |
> | `IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` | `25d8ba88248c138c…` | 633 | `48826652` 2026-11-13T09:24:37Z |
>
> Where this record disagrees with the earlier Stage 3 record, the disagreement is **not** a correction of
> that record: it is the effect of four commits that landed after it. Both statements are true at their own
> instants. §3 lists exactly what changed.
>
> **No claim in this record rests on a prior report.** Every result below was re-executed in this session
> against a fresh clone of the remote branch (§2).

---

## 1. Verdict

> ### **CONDITIONALLY READY**
>
> The implementation and the dataset artefact are ready. The **installation** is not done, and it can only
> be done by the operator, on the Windows host, at the designated path. One authorised invocation and its
> host-side evidence separate Stage 3 from acceptance.

Stage 3 readiness is not a single boolean. It decomposes into four questions with four different answers,
and conflating them is how a false READY gets published:

| # | Dimension | Verdict | Basis |
|---|---|---|---|
| 1 | **Implementation readiness** — can the existing code ingest the three admitted bundles, validate them, merge them, measure them, and publish them without corrupting an existing dataset? | **READY** | Re-verified from the clone: 920/920 IID tests, 678/678 platform tests, three-bundle ingestion exit 0, independent reload 21/21, publication fault and recovery probes (§4 V-1…V-6) |
| 2 | **Dataset readiness** — does a valid, digest-verified, three-issuer / three-sector operator dataset exist as a reproducible artefact? | **READY (as an artefact)** — **NOT INSTALLED** | `datasetVersion sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`, reproducible from the committed bundles, independent of `--now` (§4 V-2, V-3, V-9). It exists **only** in Linux scratch space; nothing is installed at any runtime location |
| 3 | **Runtime readiness** — does the readiness diagnostic report the read path READY? | **NOT READY** | `ready: false` in **every** configuration exercised, including one with a valid dataset present and `IIPS_LOCAL_PERSONAL_USE=1` declared. 6 of 8 findings outstanding in the best case (§4 V-10) |
| 4 | **Windows-host operational verification** — has publication, recovery and the coverage page been executed on the operator's host? | **NOT PERFORMED** | This session ran on Linux. `C:\iips-data` was never accessed. The publication strategy's Win32 behaviour is **reasoned from documented semantics, not observed** (§8 OBS-6). Blocker **S3-B3 remains open** |

**Overall Stage 3 status: CONDITIONALLY READY.** Not BLOCKED — every blocker that was a product defect or
a governance gap is closed (§3). Not READY — the acceptance criterion that names the *designated runtime
location* cannot be satisfied from this sandbox, and one acceptance criterion (D, fourth limb) depends on
it.

**The condition is a single operator act**, specified exactly in §9 and §13.

---

## 2. Method — how each result was obtained

### 2.1 Fresh clone, not the working checkout

```
rm -rf /tmp/rr
git clone --branch arena/94a53bb3-iips-review-recovered \
    https://github.com/ramkivs/iips-review-recovered.git /tmp/rr/repo
```

| Check | Result |
|---|---|
| Clone HEAD | `b0198d335750dc1fe8a43956abf93ed713a667d1` — **matches** the latest known commit |
| Commit date | `2026-11-13T13:08:19+00:00` |
| Working tree after clone | 0 modifications, 0 untracked |
| `node_modules` | symlinked in from the authoritative checkout (not installed, not committed) |
| Authoritative checkout at the same instant | HEAD `b0198d33…` == `git ls-remote origin` tip; tree clean; 1 worktree |
| `origin/main` | `08411bcd6d782a601fe5c82cc9983d076831148d` — unmoved |

Every command in §4 ran **inside `/tmp/rr/repo`**, so the results describe the remote branch as published,
not a local edit that was never pushed.

### 2.2 Toolchain

`node v22.22.3`, `platform=linux`, `tsx` runner, `node:test` for the platform suites, `vitest` for the
frontend. No new dependency was added; no repository file was modified to obtain any result.

### 2.3 What was **not** done

No dataset was installed at any runtime location. `C:\iips-data` was not accessed — it is not reachable
from this sandbox and was not simulated as though it were. `C:\iips-data\iips\user-portfolio.sqlite` was
not opened. Nothing was written to IPD (`ramkivs/iips-production-market-data`). No identity record was
authored. No placeholder or empty dataset directory was created to satisfy a readiness check — the empty
directory in §4 V-10 F exists **only** to demonstrate that the check would be satisfied by one, and it is
recorded as a weakness, not as evidence.

---

## 3. What changed since the protected Stage 3 record

The Stage 3 record assessed head `7c25bc49…` and returned **BLOCKED** with five blockers. Five commits
have landed since that head: the first published the record itself, and the **four that follow are the
whole delta**. Nothing else about Stage 3 has changed.

| Commit | Instant | What it did | Blocker affected |
|---|---|---|---|
| `d1118df2` | 2026-11-13T07:23:06Z | Published the Stage 3 evidence record itself (BLOCKED) | — |
| `48826652` | 2026-11-13T09:24:37Z | Recorded the operator's **O3 = ADMITTED** decision for exactly three bundles, governance only; designated runtime paths **recorded, not touched** | **S3-B1 CLOSED**; **S3-B2 partially** — the location is now *designated*, still not *verified* |
| `c72ddb8b` | 2026-11-13T10:56:24Z | **S3-D1 fix:** invalid roster sector values are refused at ingestion (44 new tests) | **S3-D1 CLOSED** |
| `39e95db2` | 2026-11-13T12:10:13Z | **S3-D2 fix:** governed multi-bundle ingestion — repeatable `--input`, per-bundle validation, merge-then-build-once, manifest provenance, 10 refusal codes, source-loss guard (41 new tests) | **S3-D2 CLOSED** |
| `b0198d33` | 2026-11-13T13:08:19Z | Publication made **failure-atomic**: staged write → verify → two-rename swap → discard; interrupted-publication recovery; derived coverage report published in the same unit (28 new tests) | Strengthens S3-D2's guarantee; **S3-B3 unchanged** |

**S3-B3 (Windows-host execution) is the only original blocker still open**, and it is the one this sandbox
cannot close by construction.

Diffstat of the whole range `7c25bc49..b0198d33` (five commits): **13 files, +5667 / −46**. The two
protected records account for 1685 of those added lines; the remaining 11 files are implementation and
tests.

---

## 4. Verification results

Each block below is a result obtained in this session from the clone. `V-n` identifiers are local to this
record.

### V-1 Test suites, re-run from the clone

| Suite | Command | Result | Exit |
|---|---|---|---|
| Sector validation (S3-D1) | `npx tsx --test tests/investment/sectorValidation.test.ts` | **44 / 44 pass** | 0 |
| Multi-input ingestion (S3-D2) | `npx tsx --test tests/investment/multiInputIngestion.test.ts` | **41 / 41 pass** | 0 |
| Publication atomicity | `npx tsx --test tests/investment/publicationAtomicity.test.ts` | **28 / 28 pass** | 0 |
| Full IID suite | `npm run test:iid` | **920 / 920 pass**, 56 files, 20.1 s | 0 |
| Full platform suite | `npm test` | **678 / 678 pass** | 0 |
| Platform typecheck | `npm run typecheck` | 0 errors | 0 |
| Frontend typecheck | `npm run typecheck` | 0 errors | 0 |
| Frontend unit suite | `npx vitest run` | **2827 pass / 1 skipped** (197 files pass / 1 skipped) | 0 |
| Frontend build | `npm run build` | built in 8.68 s | 0 |

`iips-platform` has **no** `build` script (`typecheck`, `test`, `test:iid` only); the build row above is the
frontend's. Stated so that "the platform build passed" is never inferred from this record.

### V-2 The three admitted bundles, one invocation

The exact invocation the O3 decision authorises, run into Linux scratch space:

```
npx tsx src/investment/cli/ingest.ts \
  --input <evidence>/REL-1-INFOSYS-2026-11-06/ingest-input \
  --input <evidence>/WI7-CONSUMER-MARICO-2026-11-07/ingest-input \
  --input <evidence>/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input \
  --dataset-dir /tmp/rr/out/dataset --now 2026-11-13T12:00:00.000Z
```

| Observed | Value |
|---|---|
| Exit code | **0** |
| stderr | **0 bytes** |
| stdout | 2339 bytes, 37 lines |
| `inputs` | `3 bundles merged into one dataset` |
| `datasetSchema` | `IIPS_INVESTMENT_FUNDAMENTALS_V1` |
| **`datasetVersion`** | **`sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`** |
| `completed` | **3 / 13 sectors measured** |
| Files published | 10 |
| Publication markers left | 0 |

Per-bundle provenance recorded in `manifest.inputs`, each with a recomputable input digest:

| Bundle | Issuer | Sector | `inputDigest` |
|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06` | `IN:CIN:L85110KA1981PLC013115` | Technology | `sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c` |
| `WI7-CONSUMER-MARICO-2026-11-07` | `IN:CIN:L15140MH1988PLC049208` | Consumer | `sha256:725e8eadc10b6d113ab069122f4728f2744773e8d62b187044c20a0aa1e2ad24` |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | `IN:CIN:L45200MH2005PLC152061` | Industrials | `sha256:6a62f071ae17c8873dc8c3a3706abadafc2c7bc827a72a7833e2ec460abd07c2` |

### V-3 Independent reload and measurement

A separate verifier program re-read the published dataset through the **existing** reader (`readDataset`,
which verifies every file digest and recomputes the content digest) and re-measured it through the
**existing** measurement path (`measureCoverage`). It shares no code with the ingestion CLI beyond the
product's own readers.

**Result: 21 / 21 checks PASS, `ACCEPTANCE = true`.**

| Dimension | Observed |
|---|---|
| Reload | issuers 3, securities 3, listings 5, periods 9 (all annual), issues **0** |
| Quality / completeness | `good` / 100% |
| `datasetVersion` after reload | `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83` — identical |
| Sectors measured | `["Consumer", "Industrials", "Technology"]` — 3 distinct issuers, one per sector |
| Input digests recomputed from disk | **3 / 3 MATCH** |
| Per-file digests recomputed from disk | **6 / 6 MATCH** |
| Per-issuer projections vs each bundle built alone | **3 / 3 identical** — merging did not alter any issuer's content |
| Published coverage report | quotes the same `datasetVersion` and the same three sectors |
| Publication residue | 10 dataset files, no transient file inside, no marker directory beside it, no subdirectory |

Per-sector measurement, from the reloaded dataset:

| Sector | Stage | Usable methods | Withheld | Statement coverage | Operating-metric coverage |
|---|---|---|---|---|---|
| Consumer | **G1_ENABLED** | 3 | 0 | 91.7% | 100% |
| Industrials | **G2_PARTIAL** | 2 | 1 | 100% | 0% |
| Technology | **G2_PARTIAL** | 2 | 2 | 87.5% | 0% |

The two `metric 0%` rows are **not** silent zeros: in both, a mandatory operating metric is genuinely
absent and the dependent method is **withheld with a recorded reason**. Consumer reaches `metric 100%`
because its three methods declare no mandatory operating metric. This is criterion C's substance and it
survives the merge path intact.

### V-4 Provenance and evidence integrity

| Check | Result |
|---|---|
| Bundle digest census — every `digests.json` under `evidence/real-issuer/` | **22 manifests, 444 declared file digests, 444 verified, 0 bad** |
| The three O3-admitted bundles alone | **121 / 121 verified, 0 bad** |
| `evidence/` modified by this session | **0 files** (after the restoration in §8 OBS-3) |

### V-5 S3-D1 exercised live — the defect the fix exists for

A scratch **copy** of an admitted bundle was mutated (`sector: "Technology"` → `"technology"`); the
committed bundle was never touched (`git status --porcelain evidence/` = 0 modifications).

| Probe | Result |
|---|---|
| (a) Invalid sector into an empty destination | **exit 1**; dataset directory **not created**; stderr: `invalid sector in …/roster.json: 1 of 1 issuer(s) do not carry a canonical sector.` with a per-issuer diagnostic naming the value and the reason (`CASE — match case`) |
| (b) Invalid sector against a valid three-issuer dataset | **exit 1**; dataset aggregate digest before `76157fb65eaca196` == after `76157fb65eaca196` — **IDENTICAL**; 0 markers left |
| (c) `--allow-errors` | **exit 1** — the flag does **not** bypass sector validation |

The original defect (an out-of-vocabulary sector accepted with exit 0 and 0 of 13 sectors measured — a
silently misleading zero) is **not reachable** at this commit. Criterion B's validation limb is met.

### V-6 Publication safety exercised live

Four probes against real filesystems in scratch space, using the product's own writer and CLI.

**V-6.1 — an I/O failure midway through replacing an existing dataset.** A valid three-issuer dataset was
published, then a replacement publication was interrupted after the first swap rename via the typed
`faultInjection` seam:

| Observed | Value |
|---|---|
| Thrown | `DatasetPublicationError: dataset publication interrupted at "afterSwapStep1" by fault injection` |
| Pre-existing files no longer byte-identical | **0 of 10** — **BYTE-IDENTICAL: YES** |
| `readDataset` afterwards | **SUCCEEDED** — 3 issuers, `sha256:3ad82918f1ca22317ef…` |
| Markers left | none |

For contrast, the writer's own docblock records the behaviour **before** this fix at the same seam: an
`ENOSPC` at the fifth content file destroyed 4 of the 10 files of a valid dataset and `readDataset` then
refused it as a `DatasetIntegrityError`. Failing closed is not the same as preserving the dataset; the
current behaviour preserves it.

**V-6.2 — a process that dies between the two renames.** Reproduced with a real `rename` of the dataset to
its `.iips-previous` marker:

| Observed | Value |
|---|---|
| State after the simulated kill | destination **absent**, `previous` marker present holding **10 files, all identical to before** |
| `readDataset` at the destination | throws `DatasetMissingError` — the dataset is **not** readable in this state (fails closed, does not serve a partial) |
| `recoverInterruptedPublication` | `restored the pre-existing dataset from …/dataset.iips-previous to …/dataset` |
| After recovery | destination present, **0 of 10 files differ**, `readDataset` returns 3 issuers at `sha256:3ad82918…`, **0 markers left** |

**V-6.3 — the CLI self-heals on the next run.** Same killed state, then an ordinary CLI invocation:
**exit 0**, stdout carries `recovery  restored the pre-existing dataset …`, 0 of 10 files differ, version
`sha256:3ad82918…`, 0 markers. No operator intervention is required to escape an interrupted publication.

**V-6.4 — the derived coverage report is published in the same unit.** A one-bundle dataset was
republished as a two-bundle superset (a publication the source-loss guard permits):

| Observed | Value |
|---|---|
| Superset publication | exit 0, 2 issuers |
| `coverage-report.json` before | `sha256:ca29c8357fd3ae87889…` |
| `coverage-report.json` after | `sha256:d10b6b68a86e30b1240…` |
| `manifest.datasetVersion` after | `sha256:d10b6b68a86e30b1240…` |
| **Agreement** | **YES** — sectors `Consumer, Technology` |

The failure mode this closes was a coverage report left behind describing a **different** dataset version
than the one beside it. That is no longer reachable.

### V-7 The original S3-D2 defect path — three sequential single-bundle runs

The pre-fix behaviour was that each invocation fully replaced the dataset, so reaching three sectors by
running the CLI three times silently shrank it to the last issuer. Re-run live:

| Run | Bundle | Exit | Issuers in the dataset afterwards |
|---|---|---|---|
| 1 | `REL-1-INFOSYS-2026-11-06` | 0 | 1 |
| 2 | `WI7-CONSUMER-MARICO-2026-11-07` | **1** | 1 — `refusing to replace an existing dataset with a run that would silently remove 1 of 1 iss…` |
| 3 | `WI8-INDUSTRIALS-KEC-2026-11-07` | **1** | 1 — same refusal |

The dataset **never silently shrank**. The old habit now fails closed and names the reason; the correct
habit is repeatable `--input` in one invocation (V-2). Recorded because an operator following the *old*
procedure will see exit 1 and needs to know it is a guard, not a malfunction.

### V-8 Single-bundle compatibility

The four `datasetVersion` digests recorded in the protected Stage 3 record §7.2 were reproduced at this
commit:

| Bundle | Exit | Reproduced `datasetVersion` | Recorded | Match |
|---|---|---|---|---|
| Infosys `REL-1` | 0 | `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e` | `sha256:ca29c835…` | ✅ exact |
| Marico `WI7` | 0 | `sha256:04c96303e269108803b2a5efef565eae2940ecb649b4f34998d01106a9cc6bd0` | `sha256:04c96303…` | ✅ exact |
| KEC `WI8` | 0 | `sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab` | `sha256:0df73ead…` | ✅ exact |
| Infosys `WI3` | 0 | `sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847` | `sha256:21cf2522…` | ✅ exact |

**4 of 4 exact.** In all four, `manifest` carries **15 keys with `inputs` ABSENT** — the multi-input
provenance key is not emitted for a single-bundle run, which is what keeps those datasets byte-identical
to the datasets already committed as evidence.

### V-9 The served coverage route, over real HTTP

A `node:http` server on `127.0.0.1` (ephemeral port) mounting the transport **exactly as the composition
root mounts it** (`frontend/server/executive-transport.ts:845`), with `dataRoot` pointed at a scratch data
domain holding `investment/dataset` (the V-2 dataset, installed at the designated subpath) and with the
`holdings` / `watchlist` providers **throwing**, because IPD is unavailable here by construction.

`GET /api/investment/coverage/investment?asOf=2026-11-13` → **HTTP 200**

| Field | Value |
|---|---|
| `reportVersion` | 1 |
| `dataset.datasetVersion` | `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83` |
| `dataset.provider` / `licence` | `operator-file-input` / `operator-supplied; not redistributable` |
| `dataset.dataAsOf` | `2026-03-31` |
| `issuers` | **3 rows, all `state: COVERED`** — Marico/Consumer, KEC International/Industrials, Infosys/Technology; each 3 annual periods, 0 quarterly, 1 security |
| `counts` | `observed 3, COVERED 3, NO_FINANCIALS 0, SECTOR_NOT_MEASURED 0, ISSUED_DATA 0` |
| `measuredSectors` / `totalSectors` | **3 / 13** |
| `outstandingSectors` | 10, named explicitly (Auto, Banking, Capital Markets, Energy, Healthcare, Hospitality, Insurance, Materials, Telecom, Utilities) |
| `financialCoverage.datasetClass` | **`OPERATOR_SUPPLIED`** — non-`NONE` |
| `financialCoverage` | usableMethods **7**, withheldMethods 31, xbrlMappedTags 22, derivationItems 8, unmappedTagsObserved `[]` |
| `issues` | `[]` |
| `statusLine` | `3 of 3 issuer(s) covered; 0 without financials, 0 in an unmeasured sector, 0 carrying an ingestion issue. 3 of 13 sector(s) measured.` |
| `identitySourcesAvailable` | **`false`** — `eligible-roster.json: IDENTITY_SOURCE_MISSING`, disclosed in the report and per row |

Usable methods **per measured sector** (criterion B's third limb, `methods usable > 0`):

| Sector | Stage | Usable methods | Withheld |
|---|---|---|---|
| Consumer | G1_ENABLED | **3** — `DCF_FCFF`, `PE_RELATIVE`, `EV_EBITDA` | 0 |
| Industrials | G2_PARTIAL | **2** — `DCF_FCFF`, `EV_EBITDA` | 1 |
| Technology | G2_PARTIAL | **2** — `DCF_FCFF`, `PE_RELATIVE` | 2 |

**This read succeeded with both IPD-dependent providers throwing.** The investment-coverage route answers
from the local dataset alone; it does not require identity sources, IPD, or a binding. That is a material
fact for Stage 3, because it means Stage 3's coverage limb is reachable **before** the seven Stage 1/2
dependencies are closed.

For contrast, on the same server:

| Route | Result |
|---|---|
| `GET /api/investment/coverage?asOf=2026-11-13` (identity JSON) | **503** `identity-sources-unavailable` — fails closed, names the missing files |
| `GET /investment/coverage?asOf=2026-11-13` (identity HTML view) | **503**, `Investment identity coverage unavailable` |

See §8 OBS-4 for why the URL named in the acceptance criterion is the second of these, not the first.

### V-10 The readiness diagnostic, exercised in six configurations

`frontend/server/investment/cli/iid-readiness.ts` at this commit is unchanged since `c92d87c` (535 lines,
sha256 `cdd20584b8d3e3cf…`). The value that decides `ready` is each finding's **`ownership`**; `ready` is
true only when every finding **except** `local-personal-use-enablement` is `*-owned-operational`.

Ownership per finding across four configurations:

| Finding | **A** no env, no flag | **B** `--data-dir` only | **C** `IIPS_DATA_DIR` + `IIPS_LOCAL_PERSONAL_USE=1` | **D** `IIPS_DATA_DIR` only |
|---|---|---|---|---|
| `identity-files` | user-host-provisioning-required | user-host-provisioning-required | user-host-provisioning-required | user-host-provisioning-required |
| `reports-owner-context` | user-host-provisioning-required | user-host-provisioning-required | user-host-provisioning-required | user-host-provisioning-required |
| `np04-assessment-store` | irr-owned-not-configured | irr-owned-not-configured | irr-owned-not-configured | irr-owned-not-configured |
| `owner-context-carrier` | user-host-provisioning-required | user-host-provisioning-required | user-host-provisioning-required | user-host-provisioning-required |
| `ipd-binding-precondition` | ipd-owned-unavailable | ipd-owned-unavailable | ipd-owned-unavailable | ipd-owned-unavailable |
| `ipc-endpoint` | irr-owned-not-configured | irr-owned-not-configured | irr-owned-not-configured | irr-owned-not-configured |
| **`fundamentals-dataset`** | **user-host-provisioning-required**<br>`DATASET_DIRECTORY_ABSENT` | **irr-owned-operational**<br>`…PRESENT_CONTENT_UNVERIFIED` | **irr-owned-operational**<br>`…PRESENT_CONTENT_UNVERIFIED` | **irr-owned-operational**<br>`…PRESENT_CONTENT_UNVERIFIED` |
| `local-personal-use-enablement` | irr-owned-not-configured<br>`LOCAL_PERSONAL_USE_ABSENT` | irr-owned-not-configured | **irr-owned-operational**<br>`LOCAL_PERSONAL_USE_DECLARED` | irr-owned-not-configured |
| **`ready`** | **false** (0 operational) | **false** (1) | **false** (2) | **false** (1) |

Two further probes:

| Probe | Result |
|---|---|
| **E** — `--data-dir` at an **empty** root | `fundamentals-dataset` → `DATASET_DIRECTORY_ABSENT`. The diagnostic does not invent presence |
| **F** — `--data-dir` at a root whose `investment/dataset` is a **bare empty directory** | `fundamentals-dataset` → **`[ok] irr-owned-operational`, `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED`** — satisfied by a directory holding **nothing**. See §8 OBS-1 |
| `--strict` with a valid dataset present (D) | **exit 1** — outstanding dependencies |

Configuration **A reproduces the protected record's §12.1 exactly**: `ready: false`, 8 of 8 findings
outstanding, same reasons. Configuration **B reproduces its §12.2**, including the detail that
`fundamentals-dataset` reports `configured: false` under the flag, because `configured` reflects the
**environment variable**, not `--data-dir` (§8 OBS-2).

The diagnostic's own disclosures were emitted unchanged in every run, including: *"This report describes
only the process environment it ran in. An absent setting here is NOT evidence about any other host,
including the operator Windows machine."* and *"Production admission is NOT ADMITTED."*

### V-11 `datasetVersion` is independent of `--now`

Three invocations with different `--now` values, same three bundles:

| `--now` | `datasetVersion` | `importRunId` | `lastImportAt` | `knownAsOf` |
|---|---|---|---|---|
| `2026-11-13T12:00:00.000Z` | `sha256:3ad82918f1ca22317ef…` | `run-2026-11-13T12:00:00.000Z` | same | same |
| `2026-11-14T09:31:07.123Z` | `sha256:3ad82918f1ca22317ef…` | `run-2026-11-14T09:31:07.123Z` | same | same |
| `2027-01-01T00:00:00.000Z` | `sha256:3ad82918f1ca22317ef…` | `run-2027-01-01T00:00:00.000Z` | same | same |

**Identical in all three.** `manifest.digestScope.excluded` names why: `lastImportAt`, `importRunId`,
`inputFileNames`, `fileOrder`, `fileMtimes`, `elapsedMillis`.

This matters operationally: **the operator's host run will produce `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`
whatever the local clock says**, so the host evidence is checkable against a digest predicted in advance.
A host run that produces a *different* digest means the inputs differed — which is itself the signal worth
having.

---

## 5. Acceptance criteria A–E, reassessed

The authoritative Stage 3 definition is quoted in the protected record §2 (baseline §21) and is not
restated here. Verdicts below are against that text.

| Criterion | Prior verdict (head `7c25bc49`) | **Current verdict (head `b0198d33`)** | What moved | What still prevents a full MET |
|---|---|---|---|---|
| **A. Dataset integrity** — exists at the designated runtime location; not `NONE`; readable by the existing implementation; input and output digests recorded and verified; no synthetic evidence | NOT MET | **NOT MET — one limb outstanding** | The location is now **designated** (`C:\iips-data\investment\dataset`, O3 record §11), so S3-B2's "cannot be determined" half is closed. The other limbs are re-verified: readable through the existing reader (V-3); **444/444** input digests and the output digest verified (V-3, V-4); served class is `OPERATOR_SUPPLIED`, not `NONE` (V-9); sources are genuine Ind AS statutory filings, not synthetic | **No dataset exists at the designated runtime location.** That limb is an operator act on the Windows host and cannot be verified from Linux. Two honest qualifications: the served `OPERATOR_SUPPLIED` class is assigned by a substring test over `provider`/`licence` (`L-041` OPEN, §7), and the **committed** datasets carry **no `sourceRights` key at all** — verified in all four dataset manifests under `evidence/real-issuer/` (`REL-1/dataset`, `REL-1/dataset-v1`, `WI2/dataset`, `WI3/dataset`, each `datasetSchema: IIPS_INVESTMENT_FUNDAMENTALS_V1`) — which the writer documents as `UNKNOWN`. Only datasets built by the CLI from `ingest-input/` carry `sourceRights.state: OPERATOR_ASSERTED` |
| **B. Issuer/sector coverage** — actual issuers; valid issuer→sector assignments; sector spelling validated; incorrect sectors cannot silently yield misleading zeros; actual measurements produced; `measuredSectors > 0` | NOT MET | **MET** (verified in the sandbox; the host limb is criterion A's, not B's) | **S3-D1 closed and re-verified live** — invalid sector refused, exit 1, no directory created, existing dataset byte-identical, `--allow-errors` does not bypass (V-5). **S3-D2 closed and re-verified live** — three issuers in three sectors from one invocation (V-2), independently reloaded and re-measured (V-3), and **served over HTTP**: 3 rows `COVERED`, `measuredSectors 3/13`, usable methods 3/2/2 (V-9). The silent-shrink path now fails closed (V-7) | Nothing in B's own text. Recorded precision: the acceptance line names `/investment/coverage`, which in the current implementation is the **identity** view and returns 503 without identity files; the investment dataset position is served at `/api/investment/coverage/investment` (V-9, §8 OBS-4). B is met on the *substance* the criterion describes — installed issuers listed with a non-`NONE` class, measured sectors reflected, usable methods > 0 |
| **C. Measurement quality** — genuine source evidence; missing metrics stay explicitly missing; unsupported measurements reported unavailable; periods/freshness honest; annual-only and absent quarterly not disguised; corporate-action limitations documented | MET (per bundle, scratch) | **MET** (three-bundle dataset, and now at the served route) | Re-verified on the merged dataset, not just per bundle: 10 outstanding sectors named explicitly (never silently green); withheld methods reported **with** reasons and never zero-substituted; `annualPeriods 3, quarterlyPeriods 0` per issuer; `manifest.coverage` states `corporateActions 0`, `operatingMetricRecords 0`, `prices 0`, `earliestPeriodEnd 2022-03-31`, `latestPeriodEnd 2026-03-31` (V-3, V-9) | Nothing. The underlying data limitations themselves are unchanged and remain true: single-issuer per sector, transcribed, annual-only, no quarterly, empty corporate-action table |
| **D. Reproducibility** — reproducible ingestion method; independent reload; independently checkable digests and measurements; readiness diagnostic no longer reports the fundamentals dataset absent | PARTIALLY MET | **PARTIALLY MET — three limbs strengthened, fourth unchanged** | Limbs 1–3 re-verified from a fresh clone with exact commands (§11), and strengthened: the method now reproduces the **same** digest under any `--now` (V-11), so it is reproducible across machines and clocks, not just within one session. Limb 4 was demonstrated to flip (V-10 B/C/D) | **Limb 4 in the real environment.** The flip was produced against a Linux scratch `--data-dir`/`IIPS_DATA_DIR`, which is **not** installation at `C:\iips-data\investment\dataset`. On the host the finding flips only once the operator installs the dataset there and re-runs the diagnostic in that process |
| **E. Readiness diagnostic** — run the existing targeted diagnostic after ingestion; do not read overall IID readiness as READY; report exact remaining findings | MET | **MET** | Existing diagnostic only, no new tooling; run in six configurations (V-10). Overall readiness explicitly **not** read as READY: `ready: false` in every configuration, `--strict` exit 1 even with a valid dataset present. Remaining findings enumerated exactly in §6 | Nothing |

**Summary: B, C, E MET; A and D each have exactly one outstanding limb, and it is the same limb — the
dataset is not installed at the designated runtime location on the operator's host.**

That single shared limb is why the verdict is CONDITIONALLY READY rather than BLOCKED: there is no defect
left to fix, no decision left to take, and no evidence left to gather inside this repository. What remains
is one command, run by the operator, on the host, with its output captured.

---

## 6. The eight readiness findings, reassessed

Status is from configuration **C** (a valid dataset present **and** `IIPS_LOCAL_PERSONAL_USE=1` declared) —
the most favourable configuration this sandbox can construct. Evidence levels are the diagnostic's own.

| # | Finding | Ownership in C | Reason | Evidence level | Exact remaining prerequisite | Blocks **Stage 3**? |
|---|---|---|---|---|---|---|
| D1 | `identity-files` | user-host-provisioning-required | `IDENTITY_SOURCE_MISSING (3 of 3 files absent)` | configured-runtime | Operator places the three governed identity JSON files in `<IIPS_DATA_DIR>/investment/identity/` from the authoritative issuer source. Not fixtures, not hand-authored | **No.** Verified: the investment-coverage route answered **200** with `identitySourcesAvailable: false` (V-9). It blocks the *identity* coverage view and IID-01/02/03 capabilities, and Stage 2 |
| D3 | `reports-owner-context` | user-host-provisioning-required | `REPORTS_OWNER_CONTEXT_UNAVAILABLE (path-not-configured)` | configured-runtime | Materialise the byte-exact Reports carrier and point `IIPS_REPORTS_OWNER_PATH` at that **file**, outside Git | **No** |
| D2 | `np04-assessment-store` | irr-owned-not-configured | `DATABASE_PATH_NOT_CONFIGURED` | static | Set `IIPS_NP04_DATABASE_PATH` to an absolute server-owned path outside any Git working tree, distinct from the Gate 3 store and `IIPS_DATA_DIR`, then restart the transport | **No** |
| D4 | `owner-context-carrier` | user-host-provisioning-required | `OWNER_CONTEXT_UNAVAILABLE (path-not-configured)` | configured-runtime | Materialise the canonical F-3 carrier and point `IIPS_OWNER_CONTEXT_PATH` at that **file**. A different file and pair from the Reports carrier; aliasing fails closed by design | **No** |
| D5 | `ipd-binding-precondition` | ipd-owned-unavailable | `BINDING_NOT_PROVISIONED` | static | **IPD** provisions the active binding through its own governed procedure; only then may the operator set `IIPS_G3_IPC_BINDING_PROVISIONED=true`. IRR cannot establish it and must not assert it | **No** — and it is the one finding whose owner is not the operator |
| D6 | `ipc-endpoint` | irr-owned-not-configured | `ENDPOINT_NOT_RESOLVED (ENDPOINT_NOT_CONFIGURED)` | static | Set `IIPS_G2_IPC_ENDPOINT` to a local IPC target — a Windows named pipe under `\\.\pipe\`, or an absolute POSIX socket path. A URL or `host:port` is refused | **No** |
| D8 | **`fundamentals-dataset`** | **irr-owned-operational** in B/C/D; user-host-provisioning-required in A | `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED` / `DATASET_DIRECTORY_ABSENT` | configured-runtime (A: static) | **Install the dataset at `C:\iips-data\investment\dataset` on the Windows host**, then verify it with the existing reader — the diagnostic's own `requiredAction` says a present directory is not a measured dataset (§8 OBS-1) | **Yes — this is Stage 3's deliverable.** It is the only finding Stage 3 acceptance turns on |
| D7 | `local-personal-use-enablement` | irr-owned-operational in C | `LOCAL_PERSONAL_USE_DECLARED` | static | Set `IIPS_LOCAL_PERSONAL_USE=1` in the server process. **Operator-declared as configured**; declared here, not verified on the host (§7). Grants no authority; IPD keeps its own per-request guards | **No** — and it is excluded from the `ready` rule by design |

**Count in the best configuration this sandbox can build: 6 of 8 findings outstanding, `ready: false`.**
Installing the dataset on the host moves `fundamentals-dataset` to operational **there**; it moves nothing
else. Overall IID readiness remains **not READY** after a successful Stage 3, exactly as the protected
record §18 stated.

---

## 7. Operator-confirmed configuration vs independently verified runtime state

This distinction is the single most likely source of a false READY in this assessment, so it is stated as a
table rather than as prose.

| Item | Status | What was actually observed | What was **not** observed |
|---|---|---|---|
| `IIPS_LOCAL_PERSONAL_USE=1` | **Operator-declared** | A Linux process with that variable set reports `LOCAL_PERSONAL_USE_DECLARED` and `ownership: irr-owned-operational` (V-10 C) | The operator's host server process. No claim is made that the variable is set there |
| `IIPS_DATA_DIR=C:\iips-data` | **Operator-declared** | Nothing. A Windows path is not resolvable from this sandbox | Its existence, writability, or whether it is set in the host process |
| `C:\iips-data\investment\dataset` | **Designated, not touched** | The O3 record §11 designates it. It was **not** created, read, or written by this session | Any dataset at that path |
| `C:\iips-data\iips\user-portfolio.sqlite` | **Separate, not accessed** | Not opened, not read, not written | — |
| Publication/recovery on Win32 | **Reasoned, not observed** | POSIX behaviour observed directly (V-6). Win32 semantics reasoned from documented behaviour and recorded in the writer's design comment | `MoveFileExW` / `ReplaceFileW` / volume-level behaviour on the operator's actual filesystem |
| Coverage page in a browser on the host | **Not performed** | The JSON route over real HTTP in the sandbox (V-9) | The baseline's "page capture (host)" evidence item — **still unavailable, not simulated, not inferred** |

The diagnostic itself enforces this discipline, and its disclosure is quoted here because it is the
correct summary of the whole table: *"This report describes only the process environment it ran in. An
absent setting here is NOT evidence about any other host, including the operator Windows machine."* The
converse also holds, and is the reason configuration C is not a READY claim: a **present** setting in this
sandbox is not evidence about the host either.

`L-041` and `L-042` remain **OPEN**. `L-041` in particular conditions criterion A and B: the
`OPERATOR_SUPPLIED` class served at V-9 is produced by
`/synthetic|test-fixture|fixture/i.test(provider + ' ' + licence)` — a substring test over two strings the
ingestion CLI writes itself. It proves the dataset was not built from a fixture. It does **not** prove any
right to use the underlying filings. The operator's O3 declaration is an **operator attestation over the
operator's own input files**, and the manifest carries that limitation verbatim in
`sourceRights.note`, quoted byte-exactly: *“operator attestation over the operator’s own input files; not an independent verification of any third party’s terms”* with `state: OPERATOR_ASSERTED`. Nothing in this record upgrades
that attestation to legal verification.

---

## 8. New observations from this reassessment

These are **observations**, recorded so the next assessor does not rediscover them. They are deliberately
**not** given `L-` identifiers: minting limitation-register identifiers is the owner's act, not the
assessor's. `L-041` and `L-042` are the only register identifiers referenced here.

**OBS-1 — `fundamentals-dataset` `[ok]` is existence-only, demonstrated live.** A data root whose
`investment/dataset` is a **bare empty directory** produces `ownership: irr-owned-operational` with reason
`DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED` (V-10 F). The check is `existsSync`. Therefore:
*the readiness flip required by criterion D is mechanically satisfiable without a dataset*, and a flip
must never be reported as evidence of a valid installation. The diagnostic already says so in its own
`requiredAction` (*"a present directory is not a measured dataset"*). Any host evidence for Stage 3 must
therefore include a `readDataset` verification and the `datasetVersion`, not the readiness line alone.
No placeholder directory was created in this session to exploit this, and none should be.

**OBS-2 — `configured` reflects the environment variable, not `--data-dir`.** Under configuration B the
finding is `[ok] irr-owned-operational` while `configured: false` (V-10). A flag-based run is a
*diagnostic* run; reporting it as "configured" would misstate the environment. Symmetrically, under C
`identity-files` reports `configured: true` while the files are absent — `configured` means the setting is
present, never that the artefact is.

**OBS-3 — the frontend test suite rewrites two committed evidence files.** Running `npx vitest run` in
`frontend/` modified `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-control.json` and
`zero-socket-test.json` in the clone: `generatedAt`, the ephemeral loopback port, and the absolute `caller`
path (which embeds the working directory). Restored with `git checkout -- evidence/`; the bundle digest
census was re-verified afterwards at **444/444, 0 bad**, and the clone's tree returned to 0 modifications.
**Non-authorship established:** the behaviour comes from `frontend/server/investment/zero-socket-control.test.ts`,
last touched by `c2b7d14`, which predates this branch; `git log a835d4af..HEAD` shows this branch touched
neither that test nor anything under `evidence/iid/`. Recorded as a repository-hygiene observation for the
owner (committed evidence that is not stable under the test suite invites exactly the "rewritten evidence"
suspicion this project's governance forbids). **Not acted on** — out of scope for an assessment.

**OBS-4 — route-name precision for criterion B, and a real path collision.** Three distinct surfaces are
involved, and the acceptance criterion's literal URL names the one Stage 3 cannot satisfy:

| Surface | Path | What it serves | Observed here |
|---|---|---|---|
| Identity coverage, server-rendered | `GET /investment/coverage` (`COVERAGE_ROUTES.html`) | The credential-free, JS-free **identity** HTML view | **503**, `Investment identity coverage unavailable` |
| Identity coverage, JSON | `GET /api/investment/coverage` (`COVERAGE_ROUTES.json`) | The identity coverage report | **503** `identity-sources-unavailable`, naming the missing files |
| **Investment coverage, JSON** | `GET /api/investment/coverage/investment` (`INVESTMENT_COVERAGE_ROUTES.json`) | **The served dataset's own coverage** — what criterion B is about | **200**, 3 issuers `COVERED`, `OPERATOR_SUPPLIED`, 3/13 measured (V-9) |

The collision: the SPA registers a **client** route at the *same* path as the server's identity HTML view —
`frontend/src/app/routes.ts:66` `investmentCoverage: '/investment/coverage'` → `InvestmentCoveragePage` →
`fetchInvestmentCoverageInvestment` → `/api/investment/coverage/investment` — while the composition root's
read handler `handleExecutiveReadRequest` (`frontend/server/executive-transport.ts:671`) explicitly lists
`req.url === '/investment/coverage'` among the paths it hands to the coverage transport (lines 838–845),
which renders the **identity** HTML view there. `identityCoverage` is the separate client path
`/identity-coverage`. Which surface answers a **direct browser navigation** to `/investment/coverage` on the
host depends on how the host fronts the transport and the SPA shell — `executive-transport.ts` contains no
static/SPA fallback — and that was **not** exercised here. Recorded because §13's page-capture step must
state which surface it captured: in-app navigation to "Investment Coverage" reaches the dataset report;
a direct navigation to that URL may reach the identity view and 503 until D1 closes.

Consequence for criterion B: it is **met on the substance the criterion describes** — installed issuers
listed with a non-`NONE` class, measured sectors reflected, usable methods > 0 — and that substance was
observed over real HTTP. It is **not** met by the identity page named in the acceptance line, which fails
closed for a reason unrelated to Stage 3. "Criterion B met" must never be read as "the identity coverage
page lists the issuers".

**OBS-5 — the old ingestion habit now fails closed.** Three sequential single-bundle runs into one
directory exit 1 on runs 2 and 3 with the source-loss refusal (V-7). An operator following the pre-S3-D2
procedure will see a non-zero exit and a message naming the guard. The correct procedure is one invocation
with repeated `--input` (§13). This is intended behaviour, recorded because it is a visible change in
operator experience.

**OBS-6 — the publication guarantee is file-level plus recovery, not kernel-level directory atomicity.**
No filesystem call replaces a non-empty directory in one step: POSIX `rename` returns `ENOTEMPTY`, and
Win32 `MoveFileExW` with `MOVEFILE_REPLACE_EXISTING` replaces only **empty** directories. The implemented
guarantee is therefore: write to a sibling staging directory → verify every staged digest → two renames →
discard, with `recoverInterruptedPublication` as the backstop for a death between the renames. That design
was observed to hold on Linux (V-6). **Its Win32 behaviour is reasoned from documented semantics and is
not verified on the operator's filesystem**; a junction/symlink indirection layer was considered and
rejected because it would change what the operator's `dataset` path *is*, needs privileges, and breaks
plain-directory readers. If a genuine Windows filesystem limitation prevents the guarantee, the correct
response is to report the limitation and the safest supported design — not to claim atomicity.

---

## 9. Outstanding blockers and exactly how each closes

| ID | Blocker | Owner | Exact action | Exact evidence that closes it | Blocks Stage 3? |
|---|---|---|---|---|---|
| **S3-B3** | Windows-host execution of installation, publication/recovery and the coverage page has never happened | **OPERATOR** (`USER_HOST`) | On the Windows host, run the single authorised invocation in §13 into `C:\iips-data\investment\dataset`; then run the three verification steps in §13 | (i) host stdout showing `inputs 3 bundles merged into one dataset`, `datasetVersion sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83` (predicted in advance by V-11 — a different digest means the inputs differed) and `completed 3/13`; (ii) `iid-readiness` output from **that** process showing `fundamentals-dataset` operational **and** the reader-based verification of the installed dataset; (iii) the baseline's "page capture (host)" for the Investment Coverage view | **YES** — this is the whole of what remains |
| **S3-B2 (residual)** | The designated runtime location is recorded but not independently verified | **OPERATOR** | Same act as S3-B3; the designation itself is already recorded in the O3 decision §11 and needs no new decision | The host evidence above, showing the path as it exists on the host | **YES**, as the installation limb of criterion A |
| **S3-B1** | O3 admission | — | **CLOSED** by `48826652`: `O3 = ADMITTED` for exactly three bundles | The O3 record §3.1–§3.2 | No longer a blocker |
| **S3-D1** | Sector spelling not validated at runtime | — | **CLOSED** by `c72ddb8b`, re-verified live (V-5) | 44/44 tests + probes (a)(b)(c) | No longer a blocker |
| **S3-D2** | Three-issuer population unreachable | — | **CLOSED** by `39e95db2` + `b0198d33`, re-verified live (V-2, V-3, V-6, V-7, V-9) | 41/41 + 28/28 tests + the served HTTP 200 | No longer a blocker |
| **L-041** | `OPERATOR_SUPPLIED` rests on a substring test; permitted use is an operator attestation, not verified rights | **OWNER** (register act) | Adjudicate the register entry. An assessor may not mint, close or reclassify it | An owner decision in the register | **No** — it conditions how criterion A/B's classification limb may be *described*, not whether Stage 3 can be installed |
| **L-042** | Open, per the register | **OWNER** | As above | As above | **No** |
| D1–D7 | The other seven readiness findings | Per §6 | Per §6 | Per §6 | **No** — they gate IID capabilities and Stage 2, not Stage 3's dataset acceptance (V-9 proves the coverage read does not need them) |

**No blocker remains that this repository, this branch, or this assessment can close.**

---

## 10. Boundary confirmations

| Boundary | Status |
|---|---|
| Assessment and documentation only | **Confirmed.** The only file this record adds is itself; no implementation, test, bundle or manifest was modified |
| No operational installation | **Confirmed.** No dataset exists at any runtime location after this work. Every dataset built here lives under `/tmp/rr` and will not survive the session |
| `C:\iips-data` not accessed | **Confirmed** — not reachable from this sandbox, not simulated as though it were |
| Portfolio SQLite not accessed | **Confirmed** — `C:\iips-data\iips\user-portfolio.sqlite` never opened |
| No IPD writes | **Confirmed.** `ramkivs/iips-production-market-data` untouched |
| IID Stage 2 not started | **Confirmed.** No identity file authored, no O1 work, nothing advanced |
| Protected records unaltered | **Confirmed** — both hashes and line counts in the header table, unchanged locally and on the remote |
| Committed evidence unaltered | **Confirmed** — `evidence/` at 0 modifications; 444/444 bundle digests verified after the OBS-3 restoration |
| No new branch, no new PR, PR #562 not merged | **Confirmed** — this record is published on the existing branch under the existing PR |
| Repository ownership and local personal-use constraints preserved | **Confirmed.** No governance decision altered, superseded or reinterpreted; the operator's O3 attestation is still described as an attestation |

PR state at the instant of writing (2026-11-13T13:49:59Z): **#562 OPEN, `draft: false`, `mergedAt: null`,
mergeState `CLEAN`, base `main`, head `arena/94a53bb3-iips-review-recovered`, headOid `b0198d335750`,
12 commits, 44 files, +11974 / −49.** These are volatile values and are stated as of that instant only;
they are re-measured in the response that publishes this record.

---

## 11. Reproducibility

Everything below was executed inside `/tmp/rr/repo` (a fresh clone at `b0198d33…`) with `node_modules`
symlinked in. `<E>` is `<clone>/evidence/real-issuer`.

```bash
# V-1 suites
cd iips-platform
npx tsx --test tests/investment/sectorValidation.test.ts        # 44/44
npx tsx --test tests/investment/multiInputIngestion.test.ts     # 41/41
npx tsx --test tests/investment/publicationAtomicity.test.ts    # 28/28
npm run test:iid                                                # 920/920, 56 files
npm test                                                        # 678/678
npm run typecheck                                               # 0 errors
cd ../frontend
npm run typecheck && npx vitest run && npm run build            # 0 / 2827+1 skipped / built

# V-2 the authorised invocation  (V-11 repeats it with three different --now values)
cd ../iips-platform
npx tsx src/investment/cli/ingest.ts \
  --input <E>/REL-1-INFOSYS-2026-11-06/ingest-input \
  --input <E>/WI7-CONSUMER-MARICO-2026-11-07/ingest-input \
  --input <E>/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input \
  --dataset-dir /tmp/rr/out/dataset --now 2026-11-13T12:00:00.000Z

# V-5 live sector validation (mutate a scratch COPY; never the committed bundle)
cp -a <E>/REL-1-INFOSYS-2026-11-06/ingest-input /tmp/rr/d1/mutated   # then lowercase roster sector
npx tsx src/investment/cli/ingest.ts --input /tmp/rr/d1/mutated --dataset-dir /tmp/rr/d1/dataset --now …

# V-9 the served route: mount frontend/server/investment/coverage-transport.ts on node:http with
#       dataRoot = a scratch root holding investment/dataset, holdings/watchlist providers throwing,
#       then GET /api/investment/coverage/investment?asOf=2026-11-13

# V-10 the diagnostic, six configurations
cd ../frontend
npx tsx server/investment/cli/iid-readiness.ts                                  # A
npx tsx server/investment/cli/iid-readiness.ts --data-dir /tmp/rr/root           # B  (+ --json)
IIPS_DATA_DIR=/tmp/rr/root IIPS_LOCAL_PERSONAL_USE=1 npx tsx … --json            # C
IIPS_DATA_DIR=/tmp/rr/root npx tsx … --strict                                    # D  (exit 1)
npx tsx … --data-dir /tmp/rr/empty                                               # E
npx tsx … --data-dir /tmp/rr/bare      # bare/investment/dataset, empty          # F  (OBS-1)
```

Scratch artifacts: `/tmp/rr/{sectorValidation,multiInputIngestion,publicationAtomicity,iid,plat}.out`,
`/tmp/rr/{verify,pub,http}.out`, `/tmp/rr/diag-{A,B,C,D}.{txt,json}`, `/tmp/rr/diag-{B,C,D}.json`,
`/tmp/rr/http-body.json`, `/tmp/rr/fe-{typecheck,vitest,build}.out`, `/tmp/rr/pl-typecheck.out`.
The verification programs are `/tmp/rr/verify.ts` (21 checks, independent reload and measurement) and
`/tmp/rr/pub-probe.ts` (V-6.1–V-6.4). All are outside the repository and none is committed.

---

## 12. What this record does **not** say

1. It does **not** say Stage 3 is complete. It is not. Nothing is installed.
2. It does **not** say overall IID readiness is READY. `ready: false` in every configuration exercised,
   and a successful Stage 3 would flip **one** of eight findings.
3. It does **not** say anything about the state of the operator's Windows host — its `IIPS_DATA_DIR`, its
   `IIPS_LOCAL_PERSONAL_USE`, its filesystem behaviour, or whether a dataset exists there.
4. It does **not** treat the operator's declaration as independent legal verification of any third party's
   licensing, publisher terms or source rights. `L-041` remains OPEN and the manifest's own
   `sourceRights.note` remains the accurate description.
5. It does **not** claim the acceptance criterion's literal URL `/investment/coverage` served the issuers.
   The identity view returned 503 (V-9, OBS-4).
6. It does **not** treat the `fundamentals-dataset` flip as proof of a valid dataset (OBS-1), nor a
   `--data-dir` run as a configured environment (OBS-2).
7. It does **not** treat the Linux publication probes as Windows-host verification. They are direct
   observation on POSIX and reasoned design on Win32 (OBS-6).
8. It does **not** present any dataset built here as operational data, or the three issuers as market
   truth: single-issuer per sector, transcribed, annual-only, no quarterly, corporate-action table empty.
9. It does **not** supersede, correct or reinterpret either protected record, the O3 decision, or any prior
   governance decision. It adds to them.
10. It does **not** state any volatile value as a standing fact. Every test total, digest, exit code and PR
    field is bound to its observation instant on 2026-11-13 (UTC) at head `b0198d33…`.

---

## 13. Next IID roadmap step — exact, and **not started here**

**The next step is the operator's host-side installation of the admitted dataset, and nothing else.**

It is a single authorised invocation, on the Windows host, in the server process that carries the
operator's confirmed environment:

```
npx tsx iips-platform/src/investment/cli/ingest.ts ^
  --input <repo>\evidence\real-issuer\REL-1-INFOSYS-2026-11-06\ingest-input ^
  --input <repo>\evidence\real-issuer\WI7-CONSUMER-MARICO-2026-11-07\ingest-input ^
  --input <repo>\evidence\real-issuer\WI8-INDUSTRIALS-KEC-2026-11-07\ingest-input ^
  --dataset-dir C:\iips-data\investment\dataset
```

(`--now` may be omitted; V-11 shows the resulting `datasetVersion` does not depend on it. No other
argument is authorised. Do **not** run the CLI three times — V-7/OBS-5.)

Then, in the same host session, the three verification steps whose output **is** the Stage 3 evidence:

1. **Reader verification** of the installed dataset — confirm `datasetVersion`
   `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`, 3 issuers, 3 sectors,
   9 annual periods, 0 issues. Per OBS-1 this step is **mandatory**: the readiness flip alone proves only
   that a directory exists.
2. **`iid-readiness`** from the host process, with `IIPS_DATA_DIR=C:\iips-data` — expected:
   `fundamentals-dataset` operational, `local-personal-use-enablement` operational if the declared variable
   is present, the other six findings outstanding, `ready: false`, `--strict` exit 1.
3. **Page capture (host)** of the **Investment Coverage** surface — expected: 3 issuers `COVERED`,
   `datasetClass OPERATOR_SUPPLIED`, 3/13 sectors measured, usable methods 3/2/2, 10 outstanding sectors
   named, and the identity disclosure stating that the identity sources were unavailable. Per OBS-4, the
   capture must record **which** surface it took: in-app navigation to "Investment Coverage" (or a direct
   `GET /api/investment/coverage/investment?asOf=…`) reaches the dataset report, whereas a direct browser
   navigation to `/investment/coverage` may be answered by the server's **identity** HTML view and return
   503 until D1 closes. A capture that does not say which is not evidence for criterion B.

That closes criteria **A** and **D** and completes Stage 3. It resolves **one** of the eight readiness
findings.

**Explicitly not the next step:** IID Stage 2 (identity readiness — independent of Stage 3, unstarted, with
its own prerequisite O1); Stage 4 (coverage readiness — depends on installed data); any of D1–D7 (separate
dependencies, separate owners, separate decisions); merging PR #562 (an owner act, not an assessment act);
any adjudication of `L-041`/`L-042` (a register act).

If the host invocation produces a **different** `datasetVersion`, that is a finding, not a nuisance: it
means the inputs on the host differ from the committed bundles, and the difference must be identified
before anything is installed.

---

*End of reassessment. Published additively; the records it reassesses are unchanged.*
