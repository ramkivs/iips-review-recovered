# IID Stage 3 — Windows-host acceptance evidence

**Date of host execution:** 2026-11-14 (operator, Windows host)
**Date of this record:** 2026-11-14 (UTC)
**Executed head:** `a218099d5302b65354009b2a05358d82b049bdc1` on `arena/94a53bb3-iips-review-recovered`
**Host worktree:** `C:\tmp\iips-review-recovered-iid-stage3-a218099d` (a separate worktree; not the operator's primary checkout)
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — evidence publication only
**Publication:** additive. PR #562 remains OPEN and UNMERGED. No prior record is replaced.

> ## Provenance of every number in this record
>
> The results below are **actual Windows-host execution output supplied by the operator**, who ran the
> commands on the host against the installed dataset. They are **not** Arena Linux static analysis, **not**
> a model, and **not** a prediction.
>
> What Arena performed on this evidence was **reconciliation**: every count, identifier, digest, check name
> and classification transcribed here was checked against the authoritative source at head `a218099d` — the
> verifier's own `Add-Check` call sites, the harness's own check ids, the readiness diagnostic's finding
> states, and the coverage module's `SectorStage` vocabulary — so that the record states what the host
> produced *and* what the code says that output means. Where the supplied summary and the code disagree on
> attribution, §3.1 records both and resolves the difference arithmetically. Nothing was altered to make a
> number agree.
>
> The two prior technical records for this head are `IID-STAGE3-WINDOWS-VERIFY-LAYER1-CORRECTION-2026-11-14.md`
> (the Layer 1 product correction) and `IID-STAGE3-WINDOWS-PESTER-LIFECYCLE-CORRECTION-2026-11-14.md` (the
> Pester 5 lifecycle correction). This record is the host execution both of them named as outstanding.

---

## 1. Execution environment, as reported by the host

| Item | Value |
|---|---|
| PowerShell | **5.1.26100.9818 (Desktop)** — Windows PowerShell, not PowerShell 7 |
| Pester | **5.7.1** |
| Verifier-reported `dataRoot` | **`C:\iips-data`** |
| Verifier target | `C:\iips-data\investment\dataset` |
| Worktree executed | `C:\tmp\iips-review-recovered-iid-stage3-a218099d` |
| Coverage `asOf` | **2026-11-14** |

Two commands were run, in this order:

```powershell
Invoke-Pester -Path .\tools\windows\IID-STAGE3-WINDOWS-VERIFY.Tests.ps1 -Output Detailed
.\tools\windows\IID-STAGE3-WINDOWS-VERIFY.ps1
```

---

## 2. Pester 5.7.1 — the corrected regression suite, executed on Windows PowerShell 5.1

```text
Tests completed in 2.8s
Tests Passed: 29, Failed: 0, Skipped: 1, Inconclusive: 0, NotRun: 0
```

| Measure | Value |
|---|---|
| Tests discovered | **30** |
| **Passed** | **29** |
| **Failed** | **0** |
| **Skipped** | **1** |
| Inconclusive / NotRun | 0 / 0 |
| Duration | 2.8 s |

**The single skip is the expected one.** Of the 30 tests, nine carry a `-Skip:` condition evaluated at Pester
discovery: five pin Windows PowerShell 5.1 (`-Skip:(-not $script:IsWindowsPowerShell)`), one pins PowerShell 7
(`-Skip:($script:IsWindowsPowerShell)`), and three require an installed dataset
(`-Skip:(-not $script:DatasetPresent)`). On this host — Windows PowerShell 5.1 **with** the dataset installed —
exactly one test is skipped: `on PowerShell 7 the same construct enumerates, which is why the defect is
invisible there`. The other 29 ran and passed, including all five tests that pin the Windows PowerShell 5.1
collection-wrapping semantics and all three read-only installed-dataset tests.

**This closes the defect reported against the previous head.** The same suite, as delivered in `2c491bc5`, was
executed on the same class of host and returned **30 discovered / 29 FAILED / 1 skipped**. The lifecycle
correction in `a218099d` predicted, from a static model of Pester 5's discovery/run phase split, that the
corrected file would produce **0 scope failures across the 29 executed tests with the same single skip**. The
host result is **29 passed / 0 failed / 1 skipped** — the prediction is confirmed by execution, and the one
genuine wrong expectation it also identified (`$malformed.Count`, corrected from 2 to 3) passed.

The tests that matter most for this record, all passing on the host:

| Test | What its pass establishes on the host |
|---|---|
| `both independent layers pass, which is the acceptance condition` | `Result` is `PASS`, `Failed` is `0`, `HarnessExitCode` is `0`, `DatasetVersion` is `sha256:3ad82918…`, **`$layer1.Count` is exactly 24** and `$layer2.Count` is at least 32 |
| `Layer 1 alone reports three issuers, nine annual periods and zero issues` | Layer 1, run with `-SkipProductHarness`, reports `3 issuer(s)`, `9 ANNUAL period(s) of 9 total`, `0 ingestion issue(s)`, a well-formed `Infosys Limited -> Technology` pairing, and a satisfied `parsed-collection-shape` guard |
| `leaves the dataset exactly as it found it` | Every file's name, length and SHA-256 are identical before and after the verifier ran, the file count is non-zero, and neither `.iips-staging` nor `.iips-previous` exists |
| the five Windows PowerShell 5.1 defect tests | The wrapping semantics that caused the original mis-count are pinned on the platform where they occur |
| `contains no array subexpression wrapping a ConvertFrom-Json pipeline in executable code` | The defect is absent from the published script's executable code, comment-aware |

Because `both independent layers pass` asserts `$layer1.Count | Should -Be 24` and **passed on the host**, the
host execution itself fixes Layer 1 at 24 checks. §3.1 uses that as the anchor for the 62-check attribution.

---

## 3. The published verifier, executed on the host against the installed dataset

### 3.1 Final result, and the exact attribution of its 62 checks

```text
RESULT PASS

62 passed, 0 failed
(Layer 1 PowerShell-side failures: 0; Layer 2 product failures: 0)

datasetVersion sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
harness exit code 0
```

| Measure | Value |
|---|---|
| **Result** | **`PASS`** |
| **Total checks passed** | **62** |
| **Total checks failed** | **0** |
| Layer 1 (PowerShell-side) failures | 0 |
| Layer 2 (product-side) failures | 0 |
| Harness exit code | **0** |
| `datasetVersion` | `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83` |

**How the 62 checks divide between the two layers.** The supplied summary described this as "Layer 1: 30
passed, Layer 2: 32 passed", which sums correctly to 62 but does not match the verifier's own layer
attribution. The authoritative split, established three independent ways, is **24 Layer 1 + 38 Layer 2**:

1. **The host's own passing test.** `both independent layers pass` asserts `$layer1.Count | Should -Be 24`,
   where `$layer1` is `@($Checks | Where-Object { $_.Layer -ceq 'ps' })`. That assertion **passed on the
   host**, so the `ps`-layer count at run time was exactly 24. With a total of 62, the `product`-layer count
   is therefore 38.
2. **The verifier's source at `a218099d`.** `Add-Check` defaults `$Layer` to `'ps'`; 24 distinct Layer 1 ids
   execute on the success path (`repo-root` has two mutually exclusive call sites, of which one runs). The
   product layer comprises six verifier-side checks — `harness-present`, `tsx-runner-present`,
   `node-available` (two mutually exclusive sites), `harness-exit-code`, `harness-report-parsed`,
   `harness-read-only-attestation` — plus the harness's own report, which the verifier re-adds one check at a
   time as `harness:<id>` with `-Layer 'product'` (line 451: `foreach ($check in $parsed.checks)`).
   6 + 32 = 38. `product-harness` is **not** added on this path; it exists only for `-SkipProductHarness`.
3. **Arithmetic.** 24 + 38 = **62**, exactly the reported total, with 0 failures on either side.

| Layer | `-ceq` discriminator | Checks | Passed |
|---|---|---|---|
| **Layer 1** — the verifier's own PowerShell-side inspection | `'ps'` | **24** | **24** |
| **Layer 2** — the product's own reader and runtime coverage API, through the committed harness | `'product'` | **38** = 6 verifier-side + **32 harness checks** | **38** |
| **Total** | | **62** | **62** |

The "32" in the supplied summary is real and is recorded where it belongs: it is the **harness's own** count
(`schemaVersion 1`, **32 passed, 0 failed, result PASS**), which the verifier surfaces both as one summary
check (`harness-report-parsed`) and as 32 individually re-added `harness:<id>` checks. No number in the host
output is disputed; only the layer attribution is corrected, and the correction is anchored by an assertion
the host itself evaluated.

### 3.2 Layer 1 — the 24 PowerShell-side checks, all passed

The host reported these as 22 items; two of them each cover two checks, so 22 reported items = 24 checks.

| # | Check id | Host-reported item | Result |
|---|---|---|---|
| 1 | `repo-root` | Repository root validated | PASS |
| 2 | `target-is-a-dataset-directory` | Target path validated as `C:\iips-data\investment\dataset` | PASS |
| 3 | `dataset-directory-present` | Dataset directory exists | PASS |
| 4 | `no-publication-markers` | No publication recovery markers | PASS |
| 5 | `manifest-present` | Manifest present | PASS |
| 6 | `file-integrity-rehashed` | Eight declared content files rehashed successfully | PASS |
| 7 | `manifest-identity` | Dataset identity verified *(host item 7, first half)* | PASS |
| 8 | `combined-digest` | Combined digest verified *(host item 7, second half)* | PASS |
| 9 | `dataset-files-exact` | Exactly ten expected files on disk | PASS |
| 10 | `no-stray-subdirectory` | No unexpected files or subdirectories | PASS |
| 11 | `issuer-count` | Three issuers present | PASS |
| 12 | `issuer-ids` | Exact expected issuer identifiers | PASS |
| 13 | `three-distinct-sectors` | Three distinct sectors | PASS |
| 14 | `issuer-sector-assignment` | Correct issuer-to-sector assignment | PASS |
| 15 | `nine-annual-periods` | Nine annual reporting periods | PASS |
| 16 | `no-quarterly-periods` | Zero quarterly periods | PASS |
| 17 | `dataset-issues-empty` | Zero ingestion issues | PASS |
| 18 | `parsed-collection-shape` | Correct parsed collection shape | PASS |
| 19 | `provenance-entries` | Three provenance entries | PASS |
| 20 | `provenance-admitted-bundles` | All three admitted bundle identities recorded | PASS |
| 21 | `source-rights-recorded` | Source-rights attestation recorded | PASS |
| 22 | `derived-coverage-present` | Derived coverage report present *(host item 21, first half)* | PASS |
| 23 | `derived-coverage-agrees` | … consistent with the manifest *(host item 21, second half)* | PASS |
| 24 | `derived-coverage-sectors` | Three measured sectors recorded | PASS |

Checks 11, 15, 17 and 18 are the four that the `2c491bc5` correction exists for. On the previous head, three
of them failed on this same host and this same dataset (`1 issuer(s); expected 3`, `1 ANNUAL period(s) of 1
total; expected 9`, `1 ingestion issue(s)`). They now report 3, 9 and 0, and check 18 — `parsed-collection-shape`,
added by that correction — passes, which is the guard that names the defect class instead of letting it
mis-count silently. Check 14, `issuer-sector-assignment`, was strengthened by the same correction to require
one well-formed `name -> sector` pair per issuer; it now passes on a real pairing rather than on concatenated
array fragments.

### 3.3 Layer 2 — the product's own reader and coverage API, through the committed harness

The verifier invoked `iips-platform/src/investment/cli/verify-installed-dataset.ts` through the installed `tsx`
runner. The harness's own report:

```text
harness-exit-code: PASS          verify-installed-dataset returned 0
harness-report-parsed: PASS      schemaVersion 1; 32 passed, 0 failed; result PASS
```

**32 of 32 harness checks passed, exit code 0.** The product reader independently verified every declared file
digest and recomputed the content digest — it did not accept the verifier's word for any of it. The six
verifier-side product checks (`harness-present`, `tsx-runner-present`, `node-available`, `harness-exit-code`,
`harness-report-parsed`, `harness-read-only-attestation`) also passed.

The 32 harness checks, by what they establish:

| Group | Checks | Host result |
|---|---|---|
| Dataset present and readable by the product's own reader | `dataset-present`, `reader-verifies`, `manifest-identity`, `expected-version`, `dataset-files-exact`, `no-publication-markers` | all PASS |
| Digests recompute | `file-digests-recomputed` (all eight declared content files), `coverage-version-agrees` | all PASS |
| Population is the admitted one | `issuer-count` (3), `issuer-ids`, `distinct-sectors` (3), `issuer-sector-assignment`, `sector-names`, `source-rights-recorded`, `coverage-class-not-none`, `coverage-dataset-class` | all PASS |
| Periods and issues are honest | `annual-periods` (9), `quarterly-periods` (0), `ingestion-issues` (0), `coverage-issues` (0) | all PASS |
| Provenance, including the **input** side | `provenance-recorded`, `provenance-entries` (3), `provenance-input-dirs`, `provenance-input-digests` (3 bundle digests), `provenance-bundle-bytes` (actual input bytes rehashed, **zero mismatches**) | all PASS |
| Runtime coverage read answers from the installed bytes | `coverage-api-reads`, `coverage-measured-sectors` (3), `coverage-outstanding-listed` (10 named), `coverage-issuer-rows` (3), `coverage-row-state` (all `COVERED`), `coverage-usable-methods`, `coverage-identity-disclosure` | all PASS |
| Read-only attestation | `read-only-attestation` | PASS |

`provenance-bundle-bytes` is the strongest integrity statement in the run: the harness went back to the
**admitted input bundles** and rehashed their actual bytes, with zero mismatches against the digests recorded
in the installed manifest. The installed dataset is therefore tied to the admitted inputs by digest on the
host, in both directions — inputs → dataset and dataset → inputs.

---

## 4. Exact dataset identity

```text
datasetVersion:  sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
contentDigest:   sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
```

| Property | Value |
|---|---|
| Installed path | `C:\iips-data\investment\dataset` |
| `dataRoot` | `C:\iips-data` |
| `datasetVersion` | `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83` |
| `contentDigest` | identical — the manifest's declared version equals the digest recomputed from the bytes |
| Files on disk | exactly **10**, no unexpected file, no subdirectory |
| Declared content files rehashed | **8 of 8** |
| Publication markers | none — no `.iips-staging`, no `.iips-previous` |
| Dataset class | `OPERATOR_SUPPLIED` (non-`NONE`) |
| Ingestion issues | **0** |

**This is the digest predicted in advance.** The 2026-11-13 reassessment §4 V-11 established that
`datasetVersion` is independent of `--now` and predicted `sha256:3ad82918…` for the three admitted bundles;
§9 S3-B3 named that exact value as the evidence that would close the blocker, adding *"a different digest
means the inputs differed"*. The host produced that digest. The installed bytes are therefore the committed
admitted bundles, not a variant of them.

---

## 5. Exact admitted population

### 5.1 Issuers

| Issuer | Identifier | Sector |
|---|---|---|
| Infosys Limited | `IN:CIN:L85110KA1981PLC013115` | Technology |
| Marico Limited | `IN:CIN:L15140MH1988PLC049208` | Consumer |
| KEC International Limited | `IN:CIN:L45200MH2005PLC152061` | Industrials |

Three issuers, three distinct sectors, each issuer paired with exactly one well-formed sector. Verified
independently by Layer 1 (`issuer-count`, `issuer-ids`, `three-distinct-sectors`, `issuer-sector-assignment`)
and by Layer 2 (`issuer-count`, `issuer-ids`, `distinct-sectors`, `issuer-sector-assignment`, `sector-names`).

### 5.2 Admitted source bundles

- `REL-1-INFOSYS-2026-11-06`
- `WI7-CONSUMER-MARICO-2026-11-07`
- `WI8-INDUSTRIALS-KEC-2026-11-07`

All three recorded in provenance, all three input digests verified, all three input bundles' **actual bytes**
rehashed with zero mismatches. This is exactly the set admitted by the operator's O3 decision
(`IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md`, commit `48826652`) — no fourth bundle, no substitution.

### 5.3 Periods

**9 annual reporting periods, 0 quarterly periods, 0 ingestion issues.** Annual-only. This is not quarterly
coverage and not complete financial coverage, and nothing in this record presents it as either (§8).

---

## 6. Runtime coverage result — the product's own API, reading the installed bytes

Actual runtime response for `asOf = 2026-11-14`:

```text
3 of 3 issuers covered
0 without financials
0 in an unmeasured sector
0 carrying an ingestion issue

3 of 13 sectors measured
```

| Sector | Runtime classification |
|---|---|
| Consumer | **`G1_ENABLED`** |
| Industrials | **`G2_PARTIAL`** |
| Technology | **`G2_PARTIAL`** |

**Ten unmeasured sectors were explicitly listed** by the run — named, not silently omitted.

These classifications are the product's own vocabulary, not a description invented for this record:
`iips-platform/src/investment/coverage/measure.ts:35` declares
`export type SectorStage = 'G1_ENABLED' | 'G2_PARTIAL' | 'G3_WITHHELD' | 'UNMEASURED'`, and
`measuredSectors` is a real field of the coverage report (`investmentCoverage.ts:121`, populated at :381 from
`sectorReport.completedMeasurements.length`). The read came from `investmentCoverageFromLocalDataset(asOf,
dataRoot)` — the same code path the product uses at runtime — so it cannot drift from the behaviour it
attests.

**3 of 13 sectors measured is the expected result for this dataset, not a shortfall.** The admitted population
is deliberately three issuers in three sectors. The ten unmeasured sectors are a true statement about the
installed data, and the coverage surface keeps saying so.

---

## 7. Identity-source disclosure — host-observed

```text
identitySourcesAvailable false
eligible-roster.json: IDENTITY_SOURCE_MISSING
```

This was reported **as a disclosure, not as a failed verifier gate**: the run's `Result` is `PASS` with 0
failures, and the harness check that carries it (`coverage-identity-disclosure`) **passed** — it passed by
correctly disclosing that the identity sources are unavailable.

This is **not** converted into identity-source readiness anywhere in this record, and it is not evidence that
identity readiness is achievable or near. It is host-observed confirmation of finding **D1**
(`identity-files`): `eligible-roster.json` is absent at the designated location on the host. Two consequences
are recorded precisely:

1. The identity coverage view (`/investment/coverage`, the **identity** surface) remains unavailable on the
   host until D1 closes. The **investment dataset** position is what this evidence verifies.
2. Prior to this run, D1's state on the host was *inferred* from a Linux sandbox. It is now **observed on the
   host**. That is new information and it does not favour readiness: it confirms the dependency is genuinely
   outstanding in the operator's real environment.

---

## 8. Read-only integrity attestation

```text
nothing created, removed or modified under C:\iips-data\investment
between the first read and the last

Read-only: nothing was created, deleted, renamed, moved or repaired by this script.
```

**No dataset reinstallation or repair was performed.** The attestation is produced by the harness snapshotting
the directory tree before its first read and after its last, and failing the run if any name, size or
modification time moved; the verifier surfaces it as `harness-read-only-attestation`, and Layer 1 separately
confirms no publication marker exists. The Pester suite's `leaves the dataset exactly as it found it` test
independently re-hashed every file before and after a verifier run and found them identical.

The installed dataset is **evidence, not a fixture**. It was read, verified and left exactly as it was.

---

## 9. What this evidence does **not** establish

Recorded so that nothing above can be over-read. Each item is a named residual, carried into the remaining-action
register of `IID-STAGE-3-READINESS-REASSESSMENT-2026-11-14.md` §7.

| # | Not established | Why it matters | Status |
|---|---|---|---|
| N-1 | **The `iid-readiness` diagnostic's own output from the host process.** The verifier is a *different* tool. The diagnostic's `fundamentals-dataset` finding is an existence check: `frontend/server/investment/runtimeReadiness.ts:451` reports `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED` whenever the directory is present, and `:448` sets ownership to `irr-owned-operational`. So the installed state entails the flip, and the diagnostic's own `requiredAction` at `:453` — *"Verify the snapshot with the existing dataset reader before minting; a present directory is not a measured dataset"* — is precisely what this host run discharged, using the reader it names. But the diagnostic's stdout was not supplied | Baseline acceptance limb `iid:readiness flips fundamentals-dataset to valid`; criterion D limb 4 | **Capture outstanding (R-1)** — one command |
| N-2 | **A capture of the served coverage surface.** What was verified is the runtime coverage **API**, in process, through the product's own code — not an HTTP response and not a browser page. The 2026-11-13 reassessment OBS-4 requires the capture to say *which* surface it took: in-app navigation to "Investment Coverage" or `GET /api/investment/coverage/investment?asOf=…` reaches the dataset report, whereas direct navigation to `/investment/coverage` is answered by the **identity** view and returns 503 while D1 is open | Baseline acceptance limb `/investment/coverage lists the installed issuers`; the baseline's "page capture (host)" evidence item | **Capture outstanding (R-2)** |
| N-3 | **The installation invocation's own stdout** (`inputs 3 bundles merged into one dataset`, `completed 3/13`). The install act predates this work item and was not repeated — correctly, since reinstallation is prohibited. Its *substance* is independently established: the exact predicted digest at the designated path, ten files, eight rehashed, three input bundles' bytes rehashed with zero mismatches | S3-B3's evidence item (i) | **Superseded in substance; stdout not captured (R-3)** |
| N-4 | **Win32 interrupted-publication *recovery*.** A completed, digest-consistent, marker-free publication on the host filesystem is now observed — that is the successful path. The recovery path (a run interrupted mid-publication, then resolved by the writer) has still never been exercised on Win32; the 2026-11-13 OBS-6 position stands for that path only | Publication fault-tolerance on Win32 | **Not exercised; not claimed** |
| N-5 | **Overall IID readiness.** `ready` is computed at `runtimeReadiness.ts:490-493` as *every* read-critical finding being operational. D1–D6 remain outstanding, so overall readiness stays **not READY**. This run flips at most one of eight findings | Prevents a false programme-level READY | **Unchanged, by design** |
| N-6 | **Market truth.** Single issuer per sector, transcribed, annual-only, no quarterly, corporate-action table empty. The baseline's own caution applies verbatim: *"installing the evidence bundles does not make them market truth"* | Prevents a limited dataset being read as universe coverage | **Standing limitation** |
| N-7 | **Verified source rights.** `sourceRights.state` is `OPERATOR_ASSERTED` — an operator attestation over the operator's own input files, **not** independent legal verification of any third party's terms. `L-041` and `L-042` remain OPEN and are the owner's to adjudicate | Governance | **Unchanged; not adjudicated here** |
| N-8 | **Anything about Arena executing Windows tests.** Arena has no PowerShell engine. Every Windows number in this record is operator-supplied host output; Arena's contribution was reconciliation against the authoritative source and publication | Prevents a false claim of Windows execution in CI | **Stated explicitly** |

---

## 10. Traceability

| Item | Value |
|---|---|
| Head executed on the host | `a218099d5302b65354009b2a05358d82b049bdc1` |
| Suite executed | `tools/windows/IID-STAGE3-WINDOWS-VERIFY.Tests.ps1` — 511 lines, `sha256:9f9ebe4ed8adb487…`, 30 `It` / 5 `Context` / 1 `BeforeAll` / 0 functions |
| Verifier executed | `tools/windows/IID-STAGE3-WINDOWS-VERIFY.ps1` — 536 lines, `sha256:d26776cda5de6331…`, 24 Layer 1 checks |
| Harness invoked by the verifier | `iips-platform/src/investment/cli/verify-installed-dataset.ts` — 32 checks, `schemaVersion 1`, exit 0 |
| Installer | `tools/windows/IID-STAGE3-WINDOWS-INSTALL.ps1` — **not run** for this evidence; no installation or repair performed |
| Implementation commits relied on | `48826652` (O3 admission), `c72ddb8b` (S3-D1), `39e95db2` (S3-D2), `b0198d33` (publication safety), `0a564cdb` (installer/verifier), `2c491bc5` (Layer 1 correction), `a218099d` (Pester lifecycle + CI guard) |
| Prior records preserved | `IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13.md`, `IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md`, `IID-STAGE-3-READINESS-REASSESSMENT-2026-11-13.md` — all unchanged |
| Readiness decision | `IID-STAGE-3-READINESS-REASSESSMENT-2026-11-14.md` (published with this record) |

**Boundaries observed in producing this record:** the installed dataset was not modified, reinstalled or
repaired; `C:\iips-data` and `C:\iips-data\iips\user-portfolio.sqlite` were not accessed from this session;
no identity or source-rights evidence was invented; no acceptance criterion was altered or weakened; the
operator's local Windows worktrees were not touched; no further host execution was requested, because the
supplied results already establish what was asked.

---

*End of host acceptance evidence. Additive; every prior record stands unchanged.*
