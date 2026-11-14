# IID Stage 3 — Investment Dataset Readiness **Reassessment** (Windows-host execution)

**Date of assessment:** 2026-11-14 (UTC)
**Date of host execution:** 2026-11-14 (operator, Windows host)
**Assessed head:** `a218099d5302b65354009b2a05358d82b049bdc1` on `arena/94a53bb3-iips-review-recovered`
**Publication:** additive. PR #562 remains OPEN and UNMERGED.
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — assessment and documentation only
**Evidence record:** `IID-STAGE3-WINDOWS-HOST-ACCEPTANCE-EVIDENCE-2026-11-14.md` (published with this one)

> ## What this record is, and what it is not
>
> This record reassesses IID Stage 3 against **actual Windows-host execution** of the installed dataset,
> supplied by the operator on 2026-11-14 and reconciled against the authoritative source at head `a218099d`.
>
> It **supersedes the verdict** of `IID-STAGE-3-READINESS-REASSESSMENT-2026-11-13.md` on exactly one point:
> that record's condition — *"a single operator act"* — has been **discharged**. It supersedes **no finding**.
> Every observation, qualification, limitation and disclosure in that record that is still true is still true,
> and §8 below carries the ones that matter forward explicitly rather than by reference.
>
> The two protected governance records remain authoritative for their own observation instants and are
> **unchanged, byte for byte**:
>
> | Protected record | Status in this work |
> |---|---|
> | `IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13.md` (1052 lines) | **Unchanged.** Its BLOCKED verdict was true at its instant: O3 unrecorded, no designated directory, S3-D1 and S3-D2 open. §2 lists what closed it |
> | `IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` (633 lines) | **Unchanged.** The operator's O3 admission stands as the authority for exactly the three bundles this record verifies |
> | `IID-STAGE-3-READINESS-REASSESSMENT-2026-11-13.md` (727 lines) | **Unchanged.** Its CONDITIONALLY READY verdict was true at head `b0198d33` with nothing installed |
>
> No claim here rests on a prior report. The Windows numbers are host output; the code positions cited are
> read from this head. Where the supplied summary and the source disagreed on layer attribution, the
> difference is resolved arithmetically in the evidence record §3.1 and **no number was altered to agree**.

---

## 1. Verdict

> ### **READY — installed and verified on the Windows host**
>
> The condition the 2026-11-13 reassessment named — one authorised operator invocation into
> `C:\iips-data\investment\dataset`, plus its host-side evidence — is **discharged**. A real, digest-verified
> operator dataset is installed at the designated runtime location, and it has been verified **on the host**
> by two independent layers: **62 checks passed, 0 failed, `RESULT PASS`**, dataset version
> `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`, harness exit code 0. The
> corrected regression suite passed on the same host under Pester 5.7.1 / Windows PowerShell 5.1:
> **30 discovered, 29 passed, 0 failed, 1 skipped**.
>
> **This is not unconditional programme completion.** Two acceptance *captures* remain (§7 R-1, R-2), overall
> IID readiness remains **not READY** (§6), sector coverage remains **3 of 13** (§8), identity sources remain
> **unavailable — now host-observed** (§6 D1), and source rights remain an **operator attestation** with
> `L-041`/`L-042` OPEN and unadjudicated (§8).

Stage 3 readiness decomposes. The 2026-11-13 table had four dimensions; the evidence now available separates
two of them, so this table has eight. Each row states what was **observed**, and by whom.

| # | Dimension | Verdict | Basis — and where it was observed |
|---|---|---|---|
| 1 | **Implementation readiness** — can the existing code ingest, validate, merge, measure and publish the three admitted bundles without corrupting an existing dataset? | **READY** | Re-verified from the clone at `b0198d33` (2026-11-13 §4 V-1…V-6) and unchanged since: no implementation file was modified by `0a564cdb`, `2c491bc5` or `a218099d` except the Windows verifier's Layer 1 counting, which the host has now exercised. At this head: `test:iid` **973/973**, platform `npm test` **678/678**, typecheck **0 errors** — all Arena Linux |
| 2 | **Dataset artefact integrity** — does a valid, digest-verified, three-issuer / three-sector dataset exist as a reproducible artefact? | **READY** | `datasetVersion sha256:3ad82918…`, reproducible from the committed bundles and independent of `--now` (2026-11-13 V-2, V-3, V-11). **Predicted in advance, then produced on the host** |
| 3 | **Dataset installation** — is it installed at the designated runtime location? | **INSTALLED** *(was: NOT INSTALLED)* | **Host-observed.** `C:\iips-data\investment\dataset`, `dataRoot C:\iips-data`, 10 files exactly, 8 declared content files rehashed, no stray file or subdirectory, no publication marker, `datasetVersion` = `contentDigest` = `sha256:3ad82918…` |
| 4 | **Windows runtime verification** — has the installed dataset been verified on the operator's host? | **PERFORMED** *(was: NOT PERFORMED)* | **Host-observed.** Verifier `RESULT PASS`, **62 passed / 0 failed** = Layer 1 **24** (`Layer -ceq 'ps'`) + Layer 2 **38** (`'product'`), the 38 being 6 verifier-side product checks plus the harness's own **32/32** with **exit code 0**. Pester 5.7.1: **29 passed / 0 failed / 1 skipped**. Read-only attestation: nothing created, removed or modified under `C:\iips-data\investment` |
| 5 | **Sector coverage and its limitations** | **3 of 13 measured — expected, not a shortfall** | **Host-observed.** Consumer `G1_ENABLED`; Industrials `G2_PARTIAL`; Technology `G2_PARTIAL`; **ten unmeasured sectors explicitly listed**. 3 of 3 issuers covered, 0 without financials, 0 in an unmeasured sector, 0 carrying an ingestion issue, at `asOf 2026-11-14` |
| 6 | **Identity-source availability** | **UNAVAILABLE — now host-observed, not inferred** | **Host-observed.** `identitySourcesAvailable false`; `eligible-roster.json: IDENTITY_SOURCE_MISSING`. Reported as a **disclosure**, not a failed gate: the run still returned `RESULT PASS` and the check carrying it (`coverage-identity-disclosure`) passed by disclosing correctly |
| 7 | **Source-rights governance** | **OPERATOR_ASSERTED — unchanged** | `sourceRights-recorded` passed on the host, recording the attestation **and its own limitation verbatim**. Not independent legal verification. `L-041`, `L-042` **OPEN**, owner's to adjudicate (§8) |
| 8 | **Outstanding application-level integration / operational acceptance** | **Two captures outstanding; overall IID readiness NOT READY** | `iid-readiness` stdout from the host process (**R-1**) and a served-surface capture (**R-2**) — §7. Overall readiness stays `ready: false`: D1–D6 outstanding (§6). Stage 4 needs Stage 2, which is gated on **O1** (§11) |

**Overall Stage 3 status: READY.** The dataset deliverable Stage 3 exists for is installed, digest-verified and
host-verified, and the acceptance criteria are met in substance (§3, §4). What is *not* claimed: that Stage 3's
evidence file is complete (two captures remain), that the programme is complete, or that overall IID readiness
moved.

### 1.1 The host-verified facts this verdict rests on

Stated here in full so that this record is self-contained and no reader has to take the verdict on trust. Full
provenance and the check-by-check tables are in the evidence record.

**Environment.** Windows PowerShell **5.1.26100.9818 (Desktop)**; Pester **5.7.1**; verifier-reported
`dataRoot` **`C:\iips-data`**; target **`C:\iips-data\investment\dataset`**; host worktree
`C:\tmp\iips-review-recovered-iid-stage3-a218099d`; coverage `asOf` **2026-11-14**.

**Pester suite.** `Tests Passed: 29, Failed: 0, Skipped: 1, Inconclusive: 0, NotRun: 0` — **30 discovered**, in
2.8 s. The one skip is the PowerShell 7 test, which is correct on a 5.1 host.

**Verifier.** `RESULT PASS` — **62 passed, 0 failed** (Layer 1 PowerShell-side failures 0; Layer 2 product
failures 0); **harness exit code 0**. Layer attribution **24 Layer 1 (`Layer -ceq 'ps'`) + 38 Layer 2
(`'product'`)**, the 38 being six verifier-side product checks plus the harness's own **32** re-added
individually as `harness:<id>`. The split is anchored by an assertion the host itself evaluated —
`$layer1.Count | Should -Be 24` — which passed.

**Dataset identity.** `datasetVersion` = `contentDigest` =
`sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`; exactly **10** files on disk, no
stray file or subdirectory; **8 of 8** declared content files rehashed; no publication marker; class
`OPERATOR_SUPPLIED`; **0** ingestion issues.

**Population — the three admitted issuers, as verified on the host.**

| Issuer | Identifier | Sector | Runtime sector stage |
|---|---|---|---|
| Infosys Limited | `IN:CIN:L85110KA1981PLC013115` | Technology | `G2_PARTIAL` |
| Marico Limited | `IN:CIN:L15140MH1988PLC049208` | Consumer | `G1_ENABLED` |
| KEC International Limited | `IN:CIN:L45200MH2005PLC152061` | Industrials | `G2_PARTIAL` |

**Admitted source bundles** — all three recorded in provenance, all three input digests verified, and all three
bundles' **actual bytes** rehashed with **zero mismatches**: `REL-1-INFOSYS-2026-11-06`,
`WI7-CONSUMER-MARICO-2026-11-07`, `WI8-INDUSTRIALS-KEC-2026-11-07`. This is exactly the set admitted by the
operator's O3 decision; no fourth bundle, no substitution.

**Periods.** **9 annual**, **0 quarterly**, **0 ingestion issues**. Annual-only.

**Runtime coverage read** (`asOf 2026-11-14`): **3 of 3 issuers covered**, 0 without financials, 0 in an
unmeasured sector, 0 carrying an ingestion issue; **3 of 13 sectors measured**, with the **ten unmeasured
sectors explicitly listed**.

**Identity disclosure.** `identitySourcesAvailable false`; `eligible-roster.json: IDENTITY_SOURCE_MISSING` —
reported as a **disclosure**, not a failed gate: the run still returned `RESULT PASS` with 0 failures.

**Read-only attestation.** *"nothing created, removed or modified under `C:\iips-data\investment` between the
first read and the last"*; *"Read-only: nothing was created, deleted, renamed, moved or repaired by this
script."* No reinstallation, no repair.

---

## 2. What changed since the 2026-11-13 reassessment

That record assessed head `b0198d33` with **nothing installed**. Five things happened after it, in order:

| # | Change | Commit | Effect on this assessment |
|---|---|---|---|
| 1 | Windows operator scripts published — `IID-STAGE3-WINDOWS-INSTALL.ps1`, `IID-STAGE3-WINDOWS-VERIFY.ps1`, the read-only Layer 2 harness `verify-installed-dataset.ts` and its 29-test suite | `0a564cdb` | Gave the operator a governed, read-only way to install and to verify on the host. The verifier's Layer 2 uses the product's own `readDataset` and `investmentCoverageFromLocalDataset`, so it cannot drift from the behaviour it attests |
| 2 | **Layer 1 product defect found by host execution and corrected** — `@(Get-Content -Raw \| ConvertFrom-Json)` mis-counted every top-level JSON array as 1 under Windows PowerShell 5.1 | `2c491bc5` | The first host run of the verifier returned `FAIL-LAYER1` with 58 passed / 3 failed while Layer 2 passed 32/32. The dataset was correct; Layer 1 was wrong. Corrected, and a 24th check (`parsed-collection-shape`) added so the defect class cannot recur silently |
| 3 | **Pester 5 lifecycle defect found by host execution and corrected** — the regression suite assigned its fixtures, paths and helper at file top level, which Pester 5 executes during discovery only | `a218099d` | The suite returned 30 discovered / **29 FAILED** / 1 skipped on the host. Corrected with `BeforeAll`, and seven CI tests added so the discipline is enforced. Also fixed a **vacuous** assertion in the committed TS suite |
| 4 | **The operator installed the admitted dataset at the designated location** | host act | Discharges the single condition the 2026-11-13 verdict named. Not repeated and not repairable from this record: reinstallation is prohibited |
| 5 | **The operator executed the corrected suite and the corrected verifier on the host** | host act, 2026-11-14 | This is the evidence §1 rests on. Pester **29/0/1**; verifier **62/0**, `RESULT PASS` |

Items 2 and 3 are the important governance point: **both defects were found by running on Windows, not by
reasoning in a sandbox.** Each had been invisible to Arena-side validation — the Layer 1 defect because
PowerShell 7 enumerates where 5.1 wraps, and the Pester defect because no engine existed to run the suite at
all. Both were recorded as unexecuted blockers rather than assumed green, and both were then caught by the
host. That is the discipline working, and it is why §7 still names captures rather than inferring them.

**Not changed:** no implementation file other than the Windows verifier's Layer 1 counting; no acceptance
criterion; no governance decision; no protected record; the installed dataset (read, never written).

---

## 3. The baseline's own Stage 3 acceptance text, clause by clause

The authoritative definition is quoted in the protected record §2 from the operationalisation baseline §21 and
is **not restated or reinterpreted** here. Objective:

> "at least one real, digest-verified operator dataset installed at `${IIPS_DATA_DIR}/investment/dataset`,
> plus the ingestion habit."

| Objective limb | Verdict | Host evidence |
|---|---|---|
| At least one **real** operator dataset | **MET** | Three admitted bundles of genuine Ind AS statutory filings; `provenance-bundle-bytes` rehashed the **actual input bytes** with zero mismatches |
| **digest-verified** | **MET** | 8 of 8 declared content files rehashed by Layer 1; `file-digests-recomputed` and `coverage-version-agrees` by the product reader; `datasetVersion` = `contentDigest` = `sha256:3ad82918…`, the value predicted in advance |
| **installed at `${IIPS_DATA_DIR}/investment/dataset`** | **MET** | `dataRoot C:\iips-data`, target `C:\iips-data\investment\dataset`, directory present, exactly 10 files, no stray subdirectory, no publication marker |
| plus **the ingestion habit** | **MET, as far as one act can evidence it** | The installed population is exactly the admitted three-bundle population reached through the authorised single multi-input invocation, and its digest is the one that invocation was predicted to produce. A *habit* is a practice over time; this record evidences the correct act and its correct result, and does not claim a practice |

Acceptance:

> "`/investment/coverage` lists the installed issuers with non-NONE class (`OPERATOR_SUPPLIED`), sector
> measurement reflects measured sectors (Technology, Consumer, Industrials), methods usable > 0 for those
> sectors; `iid:readiness` flips `fundamentals-dataset` to valid; digests recompute."

| # | Acceptance clause | Verdict | Host evidence, and precisely what is still uncaptured |
|---|---|---|---|
| 1 | the coverage surface lists the installed issuers with non-`NONE` class (`OPERATOR_SUPPLIED`) | **MET IN SUBSTANCE — surface capture outstanding (R-2)** | **Host-observed in process:** `coverage-class-not-none` and `coverage-dataset-class` PASS; `coverage-issuer-rows` PASS with **3 rows**, `coverage-row-state` PASS with all three **`COVERED`**; Layer 1 `issuer-count`/`issuer-ids` PASS. **Uncaptured:** an HTTP or page capture of the served surface. The OBS-4 precision from the 2026-11-13 record is retained and now confirmed on the host: the literal path `/investment/coverage` is the **identity** view, which cannot answer while D1 is open (`identitySourcesAvailable false`, host-observed); the investment-dataset position is served at `/api/investment/coverage/investment`. A capture that does not say which surface it took is not evidence for this clause |
| 2 | sector measurement reflects measured sectors (Technology, Consumer, Industrials) | **MET** | **Host-observed.** Layer 1 `three-distinct-sectors` and `derived-coverage-sectors` PASS recording **3 sector(s) measured: Consumer, Industrials, Technology**; harness `coverage-measured-sectors` PASS (**3 of 13**) and `coverage-outstanding-listed` PASS (**ten named**); runtime sector stages Consumer `G1_ENABLED`, Industrials `G2_PARTIAL`, Technology `G2_PARTIAL` — the product's own `SectorStage` vocabulary (`measure.ts:35`) |
| 3 | methods usable > 0 for those sectors | **MET** | **Host-observed.** Harness check `coverage-usable-methods` PASS among the 32; runtime response reports **3 of 3 issuers covered** and **0 without financials**, and two sectors classify `G2_PARTIAL` — partial enablement, i.e. some methods usable, none silently zero. *Precision:* the per-sector usable-method counts (3/2/2 in the 2026-11-13 sandbox run V-9) were **not restated** in the supplied host capture; the check that asserts them passed, its values were not quoted |
| 4 | `iid:readiness` flips `fundamentals-dataset` to valid | **MET IN SUBSTANCE — capture outstanding (R-1)** | The diagnostic was **not run on the host**; the verifier is a different tool. The flip is nevertheless entailed, deterministically, by the installed state: `runtimeReadiness.ts:448` sets ownership to `irr-owned-operational` — the `[ok]` state — whenever the directory exists, and existence is host-verified by two layers. Its reason string will still read `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED` (`:451`) because the finding is only an existence check, which is exactly why its own `requiredAction` (`:453`) demands reader verification — **and that is what this host run performed**, using the reader it names. So the substance of the clause is discharged; only the stdout capture is missing, and it is one command |
| 5 | digests recompute | **MET** | **Host-observed, both layers, both directions.** Layer 1 `file-integrity-rehashed` (8 of 8), `manifest-identity`, `combined-digest`; harness `file-digests-recomputed`, `expected-version`, `coverage-version-agrees`, `provenance-input-digests` (3 bundle digests) and `provenance-bundle-bytes` (**actual input bytes rehashed, zero mismatches**) |

**Summary: all five acceptance clauses are met in substance on the host. Three are met with direct host
observation and no residual (2, 3, 5). Two are met in substance with a named capture outstanding (1 → R-2,
4 → R-1), and in both cases what is missing is a stdout or page capture, not a fact, an installation act, a
product defect or a governance decision.**

The baseline's own caution is quoted again because it survives every result above:

> "installing the evidence bundles **does not** make them market truth — single-issuer, transcribed,
> annual-only, no quarterly, corporate-action table empty. Every surface will keep saying so."

---

## 4. Acceptance criteria A–E, reassessed

The criteria are the ones the 2026-11-13 reassessment §5 assessed against the protected record §2 (baseline
§21). Prior verdicts are quoted from that record so the movement is visible.

| Criterion | 2026-11-13 verdict (head `b0198d33`) | **Verdict now (head `a218099d`, host-executed)** | What moved | What remains |
|---|---|---|---|---|
| **A. Dataset integrity** — exists at the designated runtime location; not `NONE`; readable by the existing implementation; input and output digests recorded and verified; no synthetic evidence | NOT MET — one limb outstanding | **MET** | **The outstanding limb is closed, on the host.** Exists at `C:\iips-data\investment\dataset` (Layer 1 `target-is-a-dataset-directory`, `dataset-directory-present`); class `OPERATOR_SUPPLIED`, not `NONE` (`coverage-class-not-none`, `coverage-dataset-class`); readable by the existing implementation — the product's own `readDataset` verified it (`reader-verifies`, harness exit 0); **input and output digests both verified on the host**: output side `file-integrity-rehashed` 8/8 + `combined-digest`, input side `provenance-input-digests` + `provenance-bundle-bytes` with zero mismatches; sources are genuine Ind AS statutory filings, not synthetic | **Two qualifications the 2026-11-13 record raised, both still true and neither newly blocking.** (i) The `OPERATOR_SUPPLIED` class is assigned by a substring test over `provider`/`licence` — `L-041` **OPEN**, owner's to adjudicate. (ii) `sourceRights.state` is `OPERATOR_ASSERTED`, an operator attestation over the operator's own input files, **not** independent legal verification; the manifest carries that limitation verbatim and `source-rights-recorded` passed by recording it |
| **B. Issuer/sector coverage** — actual issuers; valid issuer→sector assignments; sector spelling validated; incorrect sectors cannot silently yield misleading zeros; actual measurements produced; `measuredSectors > 0` | MET (sandbox; the host limb was criterion A's) | **MET — now host-confirmed** | Every element re-observed **on the host**: 3 actual issuers with exact CIN identifiers; `issuer-sector-assignment` PASS on a well-formed pairing (the check `2c491bc5` strengthened); S3-D1's runtime sector guard in force (`c72ddb8b`, re-verified live in V-5); the silent-shrink path fails closed (V-7); `measuredSectors` = **3** > 0 with ten unmeasured sectors named; 3 coverage rows all `COVERED` | The OBS-4 precision, now host-confirmed: the acceptance line names `/investment/coverage`, which is the **identity** view and cannot answer while D1 is open. B is met on the *substance* the criterion describes. **R-2** is the capture |
| **C. Measurement quality** — genuine source evidence; missing metrics stay explicitly missing; unsupported measurements reported unavailable; periods/freshness honest; annual-only and absent quarterly not disguised; corporate-action limitations documented | MET | **MET — host-confirmed, limitations unchanged** | Host: `annual-periods` **9**, `quarterly-periods` **0**, `ingestion-issues` **0**, `coverage-issues` **0**; ten outstanding sectors listed rather than silently green; withheld methods reported with reasons. Nothing zero-substituted | The underlying data limitations are unchanged and remain true: single issuer per sector, transcribed, annual-only, no quarterly, corporate-action table empty. **Annual-only evidence is not quarterly coverage and not complete financial coverage** (§8.7) |
| **D. Reproducibility** — reproducible ingestion method; independent reload; independently checkable digests and measurements; readiness diagnostic no longer reports the fundamentals dataset absent | PARTIALLY MET — three limbs strengthened, fourth unchanged | **MET IN SUBSTANCE — limb 4's capture outstanding (R-1)** | Limbs 1–3 stand as re-verified from a fresh clone with exact commands (2026-11-13 §11), and are now **corroborated on a second machine and a second filesystem**: the host produced the digest predicted in advance by V-11, and the product reader independently recomputed every digest and the content digest there. Limb 4's *condition* is satisfied by the installed state — `runtimeReadiness.ts:448` makes the finding `irr-owned-operational` whenever the directory is present, so it cannot report `DATASET_DIRECTORY_ABSENT` | **Limb 4's documentary capture.** The diagnostic's own stdout from the host process was not supplied, so the flip is entailed by code plus host-verified presence rather than observed. One command closes it (§7 R-1). If the owner requires the literal capture before acceptance, D reads PARTIALLY MET until then; this record states both readings rather than choosing the convenient one |
| **E. Readiness diagnostic** — run the existing targeted diagnostic after ingestion; do not read overall IID readiness as READY; report exact remaining findings | MET | **MET, with R-1 outstanding for the host process** | Existing diagnostic only, no new tooling; run in six configurations (V-10). Overall readiness explicitly **not** read as READY: `ready: false` in every configuration, and §6 below keeps it **not READY** after a successful Stage 3, exactly as the protected record §18 stated. Remaining findings enumerated exactly in §6 | The diagnostic has not been run **in the host process**. Its state there is derived from its source plus the host-verified presence of the directory, and is labelled as such everywhere in this record |

**Summary: A, B, C, E MET; D MET in substance with one uncaptured stdout. The single limb that made the
2026-11-13 verdict conditional — installation at the designated runtime location — is closed by host
observation.**

---

## 5. Blocker register, updated

The identifiers are the protected record's and the 2026-11-13 reassessment's. None is renamed, and none is
closed by reinterpretation.

| ID | Blocker | Prior status | **Status now** | Evidence that closed it, or exactly what still closes it |
|---|---|---|---|---|
| **S3-B1** | O3 admission not recorded | CLOSED by `48826652` | **CLOSED — unchanged** | `O3 = ADMITTED` for exactly three bundles; the host-verified population is exactly that set (`provenance-admitted-bundles`, `provenance-input-dirs`, `provenance-bundle-bytes`) |
| **S3-B2** | No designated runtime data directory; criterion A's location limb cannot be evaluated | Residual OPEN — designated but not independently verified | **CLOSED** | **Host-observed:** `dataRoot C:\iips-data`, target `C:\iips-data\investment\dataset`, `target-is-a-dataset-directory` PASS, `dataset-directory-present` PASS, 10 files exactly, no stray subdirectory, digest `sha256:3ad82918…`. The designated location now exists, holds the admitted dataset, and has been independently verified there by two layers |
| **S3-B3** | Windows-host execution has never happened | OPEN — "this is the whole of what remains" | **PERFORMED — closed as to execution; three evidence captures re-registered as R-1…R-3** | **Host execution performed on 2026-11-14**, which is what S3-B3 named. Recorded in full in the evidence record: PowerShell **5.1.26100.9818 (Desktop)**, Pester **5.7.1** → **30 discovered / 29 passed / 0 failed / 1 skipped**; verifier → **`RESULT PASS`, 62 passed / 0 failed**, Layer 1 **24/24**, Layer 2 **38/38** including the harness's own **32/32** at **exit code 0**; digest `sha256:3ad82918…`; read-only attestation. **This is Windows-host execution, and it is distinguished from Arena Linux CI everywhere in this record (§9).** S3-B3 is *not* left OPEN on the ground that the earlier Arena assessment lacked Windows access — that ground no longer exists. What survives of its original three-item closure definition is re-registered precisely: item (ii)'s reader-verification half is **closed** by this run; items (i), (iii) and (ii)'s diagnostic-stdout half become **R-3**, **R-2**, **R-1** |
| **S3-D1** | Sector spelling not validated at runtime | CLOSED by `c72ddb8b` | **CLOSED — unchanged, and now host-exercised** | 44/44 tests plus live probes (V-5); the host run's `sector-names` and `issuer-sector-assignment` checks passed on the installed dataset. No new contradictory evidence, so it is **not reopened** |
| **S3-D2** | Three-issuer / three-sector population unreachable | CLOSED by `39e95db2` + `b0198d33` | **CLOSED — unchanged, and now host-confirmed** | 41/41 + 28/28 tests, the served HTTP 200 (V-9), and now the host: 3 issuers, 3 distinct sectors, 3 provenance entries, 3 admitted bundles, 3 input digests verified. No new contradictory evidence, so it is **not reopened** |
| **Publication safety** | Dataset publication not failure-atomic | Accepted at `b0198d33` | **Accepted — unchanged** | Host observation adds the successful-path fact: a complete, digest-consistent, marker-free publication exists on a Win32 filesystem. **Interrupted-publication recovery on Win32 remains unexercised** (evidence record N-4) and is not claimed. Not reopened |
| **L-041** | `OPERATOR_SUPPLIED` rests on a substring test; permitted use is an operator attestation, not verified rights | OPEN — owner's to adjudicate | **OPEN — unchanged, deliberately not adjudicated here** | An assessor may not mint, close or reclassify a register entry. Conditions how criterion A/B's classification limb may be *described*, not whether Stage 3 is installed |
| **L-042** | `EV_EBITDA`/`EV_REVENUE` basis label names only the dominant bridge term | OPEN — owner's to adjudicate | **OPEN — unchanged, deliberately not adjudicated here** | As above |
| **D1–D7** | The other seven readiness findings | Per 2026-11-13 §6 | **Unchanged, except that D1 is now host-observed** | They gate IID capabilities and Stage 2, not Stage 3's dataset acceptance. **D1 moved from inferred to observed:** `eligible-roster.json: IDENTITY_SOURCE_MISSING` on the host (§6) |

**No blocker remains whose closure is an installation act, a product defect, or a decision this repository can
take.** What remains is two captures (§7) and two register entries that belong to the owner.

---

## 6. The eight readiness findings, after host execution

Statuses are derived from `frontend/server/investment/runtimeReadiness.ts` at this head applied to the
**host-observed** state, and are labelled by how each is known. The diagnostic itself was not run in the host
process (R-1).

| # | Finding | Ownership with the dataset installed | Reason string the diagnostic emits | How known | Blocks Stage 3? |
|---|---|---|---|---|---|
| D8 | **`fundamentals-dataset`** | **`irr-owned-operational`** — `:448`, because the directory is present | `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED` — `:451`. The finding is an **existence check**; a bare empty directory produces the same string | **Host-observed presence** + code-derived state. Its `requiredAction` at `:453` — *"Verify the snapshot with the existing dataset reader before minting; a present directory is not a measured dataset"* — is **discharged by this host run**, which used exactly the reader it names (`readDataset`, `investmentCoverageFromLocalDataset`) and verified content, population and coverage read | **It was the only finding Stage 3 turned on, and it is no longer outstanding** |
| D1 | `identity-files` | `user-host-provisioning-required` | `IDENTITY_SOURCE_MISSING` — host reported `eligible-roster.json: IDENTITY_SOURCE_MISSING` | **HOST-OBSERVED** (was: inferred from a Linux sandbox). This is new information and it does not favour readiness | **No.** The investment coverage read answered without it. It blocks the **identity** view, IID-01/02/03, and **Stage 2** |
| D2 | `np04-assessment-store` | `irr-owned-not-configured` | `DATABASE_PATH_NOT_CONFIGURED` | Code-derived; not observed on the host | No |
| D3 | `reports-owner-context` | `user-host-provisioning-required` | `REPORTS_OWNER_CONTEXT_UNAVAILABLE` | Code-derived; not observed on the host | No |
| D4 | `owner-context-carrier` | `user-host-provisioning-required` | `OWNER_CONTEXT_UNAVAILABLE` | Code-derived; not observed on the host | No |
| D5 | `ipd-binding-precondition` | `ipd-owned-unavailable` | `BINDING_NOT_PROVISIONED` | Code-derived. **IPD-owned**; IRR cannot establish it and must not assert it | No |
| D6 | `ipc-endpoint` | `irr-owned-not-configured` | `ENDPOINT_NOT_RESOLVED` | Code-derived; not observed on the host | No |
| D7 | `local-personal-use-enablement` | per declaration | `LOCAL_PERSONAL_USE_DECLARED` if set | **Operator-declared**, not verified in the host process. Excluded from the `ready` rule by design (`:489`) | No |

`ready` is computed at `:490-493` as *every* read-critical finding (all eight except D7) being
`irr-owned-operational` or `ipd-owned-operational`. With D8 operational and **D1–D6 outstanding**, `ready` is
**false** and **five of the seven** read-critical findings remain outstanding.

**Overall IID readiness is NOT READY, and Stage 3's success does not make it so** — exactly as the protected
record §18 and the 2026-11-13 reassessment §12.2 stated. Stage 3 resolved one finding of eight. The diagnostic's
own disclosure remains the correct summary of this table: *"This report describes only the process environment
it ran in. An absent setting here is NOT evidence about any other host, including the operator Windows
machine."* The converse is why D2–D6 are marked code-derived rather than host-observed.

---

## 7. Remaining-action register

Four items. None is an installation act, a product defect, a governance decision, or work in this repository.
Each states the exact act and the exact evidence that closes it.

| ID | Action | Owner | Exact act | Exact evidence that closes it | Blocks what? |
|---|---|---|---|---|---|
| **R-1** | Capture the readiness diagnostic from the host process | **OPERATOR** (`USER_HOST`) | On the host, in the server process that carries the operator's confirmed environment (`IIPS_DATA_DIR=C:\iips-data`), run the existing `iid-readiness` diagnostic. No new tooling; the existing targeted diagnostic only | Its stdout showing `fundamentals-dataset` as `irr-owned-operational` (rendered `[ok]`) with reason `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED`; `ready: false`; `--strict` exit **1**; D1–D6 outstanding; D7 per declaration | Baseline acceptance clause 4 and criterion D limb 4 — **as a capture only**. Non-blocking for the installed fact, which two layers verified on the host |
| **R-2** | Capture the served coverage surface | **OPERATOR** | Capture the **Investment Coverage** surface, and **state which route was taken**: in-app navigation to "Investment Coverage", or a direct `GET /api/investment/coverage/investment?asOf=2026-11-14`. Per OBS-4 a direct browser navigation to `/investment/coverage` is answered by the **identity** view and will return 503 while D1 is open — that capture would be evidence about D1, not about this clause | A capture showing 3 issuers listed, `datasetClass OPERATOR_SUPPLIED`, all rows `COVERED`, **3/13** sectors measured, **ten** outstanding sectors named, usable methods > 0 for the three measured sectors, and the identity disclosure stating that identity sources were unavailable — **with the route named** | Baseline acceptance clause 1 and the baseline's "page capture (host)" evidence item. Non-blocking for the substance, which the runtime API verified on the host |
| **R-3** | Record the installation invocation's stdout | **OPERATOR** (optional; already superseded in substance) | None required. The install act is complete and must **not** be repeated — reinstallation is prohibited and would destroy evidence | If the operator still holds the original stdout, attaching it closes S3-B3's item (i) literally: `inputs 3 bundles merged into one dataset`, `datasetVersion sha256:3ad82918…`, `completed 3/13`. Its substance is already established independently: the predicted digest at the designated path, 10 files, 8 rehashed, and the **input bundles' own bytes** rehashed with zero mismatches | Nothing. Recorded for completeness of the evidence file |
| **R-4** | Adjudicate `L-041` and `L-042` | **OWNER** (register act) | An owner decision in `IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md`. An assessor may not mint, close or reclassify either entry | An owner decision recorded in the register | Nothing in Stage 3. `L-041` conditions how criterion A/B's **classification** limb may be described |

**Explicitly not remaining actions,** because naming them would reorder the roadmap: merging PR #562 (an owner
act, not an assessment act); exercising Win32 interrupted-publication recovery (a separate fault-injection
work item, never authorised here); anything in D2–D7 (separate dependencies, separate owners); IID Stage 2 work
(gated on **O1**); any adjudication of source rights.

---

## 8. Disclosures and limitations, retained in full

Every one of these survives the host result. None is softened by it, and the host evidence **confirms** items
1, 2, 3 and 4 rather than relieving them.

1. **Only three of thirteen sectors are measured.** Host-observed: `3 of 13 sectors measured`. This is the
   expected result for a deliberately limited three-bundle dataset, not an installation shortfall and not a
   defect.
2. **Ten sectors remain explicitly unmeasured**, and were **explicitly listed** by the host run
   (`coverage-outstanding-listed` PASS). Named, never silently green, never zero-substituted.
3. **Consumer is `G1_ENABLED`; Industrials and Technology are `G2_PARTIAL`.** Host-observed, in the product's
   own `SectorStage` vocabulary. `G2_PARTIAL` is partial enablement: some methods usable, others withheld with
   reasons. It is not full enablement and is not recorded as such.
4. **`identitySourcesAvailable` is `false` because `eligible-roster.json` is missing** — now **host-observed**,
   previously inferred. It was reported as a **disclosure**, not a failed verifier gate, and this record does
   **not** convert it into identity-source readiness, identity-source *proximity*, or Stage 2 progress.
5. **Source rights are `OPERATOR_ASSERTED`.** An operator attestation over the operator's own input files,
   carrying its limitation verbatim in `sourceRights.note`: *"operator attestation over the operator's own
   input files; not an independent verification of any third party's terms."* **Not** independent legal
   verification of any third party's licensing, publisher terms or source rights. Nothing here upgrades it.
6. **`L-041` and `L-042` remain OPEN**, subject to their previously recorded owner adjudication. Neither is
   minted, closed, reclassified or reinterpreted by this record. `L-041` in particular conditions how the
   `OPERATOR_SUPPLIED` class may be *described*: it is produced by a substring test over `provider`/`licence`
   strings the ingestion CLI writes itself, which proves the dataset was not built from a fixture and does
   **not** prove any right to use the underlying filings.
7. **Annual-only evidence is not quarterly coverage and not complete financial coverage.** Host-observed:
   **9 annual periods, 0 quarterly periods, 0 ingestion issues**; `earliestPeriodEnd 2022-03-31`,
   `latestPeriodEnd 2026-03-31`; corporate-action table empty; single issuer per sector; transcribed. The
   baseline's caution stands verbatim: installing the bundles **does not** make them market truth.

**And the one this record must not do:** it does **not** convert a limited three-sector dataset into a claim of
comprehensive investment-universe coverage. Three issuers in three sectors is what was admitted, installed and
verified. The other ten sectors are unmeasured, and the coverage surface keeps saying so.

---

## 9. Boundary confirmations

| Boundary | Status |
|---|---|
| Evidence publication and reassessment only | **Confirmed.** This record and its evidence record are the substance of the change; no implementation, test, bundle or manifest was modified to produce them |
| PR #562 OPEN and UNMERGED | **Confirmed** — not merged, and merging is an owner act this record does not perform or recommend |
| Designated branch only | **Confirmed** — `arena/94a53bb3-iips-review-recovered`; no new branch, no new PR |
| Repository scope | **Confirmed** — `ramkivs/iips-review-recovered` only. **No IPD write**; `ramkivs/iips-production-market-data` untouched |
| Installed dataset not modified, not reinstalled, not repaired | **Confirmed twice over** — the host run's own attestation (*"nothing created, removed or modified under `C:\iips-data\investment` between the first read and the last"*), the Pester test that re-hashed every file before and after, and this session's own conduct: no write reached `C:\iips-data` |
| Portfolio database not accessed | **Confirmed** — `C:\iips-data\iips\user-portfolio.sqlite` never opened, read or written, by the host run (the verifier opens no database; R6 conformance: 0 database commands) or by this session |
| No identity or source-rights evidence invented | **Confirmed** — D1's absence is recorded as absence, `OPERATOR_ASSERTED` as an attestation, `L-041`/`L-042` as OPEN |
| No acceptance criterion altered or weakened to manufacture a pass | **Confirmed** — the baseline's §21 text is quoted, not restated; all five clauses are assessed against that text; the two with captures outstanding say so in their verdict cells; criterion D states **both** readings rather than the convenient one |
| Arena Linux did not perform Windows tests | **Confirmed and stated explicitly.** Arena has no PowerShell engine. Every Windows number here is operator-supplied host output. Arena's work was reconciliation against the authoritative source at `a218099d` and publication. The Arena-side validations (§10) are Linux and are labelled Linux |
| Operator's local Windows worktrees not modified | **Confirmed** — the host execution took place in the operator's own separate worktree `C:\tmp\iips-review-recovered-iid-stage3-a218099d`; this session fetched, synced and altered no local checkout |
| Protected records unaltered | **Confirmed** — all three, byte for byte, locally and on the remote |
| Historical findings and decisions preserved | **Confirmed** — the 2026-11-13 reassessment's observations OBS-1…OBS-8 are relied on and cited, not restated as new; S3-D1, S3-D2 and publication safety are **not reopened**, no contradictory evidence having appeared |
| No further host execution requested | **Confirmed** — the supplied results establish what was asked. R-1 and R-2 are registered as the owner's remaining captures, not as a request that this work item be redone |

---

## 10. Validation performed for this change, and its platform

**Arena Linux** — this record is a documentation change, and the validation appropriate to it was run:

| Check | Command | Result | Platform |
|---|---|---|---|
| IID suites | `npm run test:iid` | **973 tests, 973 pass, 0 fail, 0 skipped** | Arena Linux |
| Platform suites | `npm test` | **678 tests, 678 pass, 0 fail** | Arena Linux |
| Platform typecheck | `npm run typecheck` | **0 errors** | Arena Linux |
| Frontend typecheck (CI step) | `npm run typecheck` | **0 errors** | Arena Linux |
| Frontend replay-server strict typecheck (CI step) | `npm run typecheck:replay-server` | **0 errors** | Arena Linux |
| Frontend Vitest (CI step) | `npm run test:ci` | **197 files passed / 1 skipped; 2827 tests passed / 1 skipped** | Arena Linux |
| Zero-test / false-green guard (CI step) | `node .ci/assert-tests.js .vitest-report.json` | **OK — 198 files, 2828 tests, 0 failed** | Arena Linux |
| Production build (CI step) | `npm run build` | **✓ built in 8.22 s** | Arena Linux |
| PowerShell safety rules R1–R8 | AST-exact conformance over all three `.ps1` | **PASS, 0 rule failures** (verifier `ERROR=0` nodes=14259; installer 8852; suite 10920) | Arena Linux |
| Layer 1 mirror over the digest-identical fixture | 24-check mirror | **PASS 24/24, exit 0**, `datasetVersion sha256:3ad82918…`, with its own read-only snapshot proof | Arena Linux |
| Reconciliation of every host number against source | `Add-Check` census, harness check ids, `runtimeReadiness.ts` states, `SectorStage` vocabulary | **24 + 38 = 62 reconciles exactly**; the supplied "30/32" split resolved in the evidence record §3.1 | Arena Linux |

**Windows host (operator, 2026-11-14)** — Pester 5.7.1 suite **30/29/0/1**; verifier **`RESULT PASS`, 62/0**,
Layer 1 **24/24**, Layer 2 **38/38** including the harness's **32/32** at exit 0. **These are the only Windows
numbers in this record, and they are the operator's, not Arena's.**

No test in this repository asserts on the content of these documents, so the documentation change breaks no
suite; that was checked before editing (`multiInputIngestion.test.ts` and `verifyInstalledDataset.test.ts`
reference the record *names* in comments only).

---

## 11. Next IID roadmap step — exact, from the authoritative sequence, and **not started here**

The authoritative operationalisation sequence is the baseline's §21 stages, adopted by reference in
`CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md` §10.1. It is **not** re-sequenced here.

| Baseline stage | Objective | Independence, as the baseline states it | Position after this record |
|---|---|---|---|
| Stage 1 — runtime and source discovery | deterministic per-host truth about what the runtime needs, who owns it, what is missing | independent; no prerequisite | Prior work |
| **Stage 2 — identity readiness** | an installed, validated identity reference set for the intended population | independent of Stage 3 and of IPD; **gated on owner decision O1** | **Not started.** Its subject matter is now **host-observed absent**: `eligible-roster.json: IDENTITY_SOURCE_MISSING`, `identitySourcesAvailable false` (D1) |
| **Stage 3 — investment dataset readiness** | ≥1 real, digest-verified dataset installed, plus the ingestion habit | independent of Stage 2 and of IPD; gated on **O3** | **This record. READY**, with captures R-1…R-3 outstanding |
| **Stage 4 — coverage readiness** | coverage, completeness, method usability and sector measurement verified on **installed** data; the §23 ten-scenario demo passing | **needs Stages 2–3**; independent of IPD | **Cannot start.** Stage 3 is now satisfied; **Stage 2 is not**, and Stage 4 needs both |
| Stage 5 — end-to-end integration | holdings → identity → dataset → assessment → disposition as one loop on the host | needs Stages 2–4 **plus IPD binding + IPC peer** | Blocked behind 2–4, D5 and D6 |
| Stage 6 — investment intelligence | routine use: review loop, change detection, dispositions, persisted comparable reports | needs Stage 5 + operator limits policy (**O5**) | Blocked behind 5 |

**The next roadmap step is therefore Stage 2 — identity readiness — and it is gated on the owner's O1
decision.** This follows from the baseline's own dependency statements and not from any preference: Stage 3 is
the stage just completed; Stage 4 is the next stage in the sequence but *"needs Stages 2–3"*; Stage 2 is
*"independent of Stage 3 and of IPD"* and *"gated on owner decision O1"*. Stage 3's completion removes the only
reason Stage 2 could not proceed in parallel, and Stage 2 is now the binding dependency for Stage 4.

Its first concrete act is D1's, as the 2026-11-13 reassessment §6 already specified and the host has now
confirmed outstanding: the operator places the **three governed identity JSON files** in
`<IIPS_DATA_DIR>/investment/identity/` from the authoritative issuer source — **not fixtures, not
hand-authored** — which additionally unblocks the identity coverage view that OBS-4 distinguishes from the
investment-dataset position (and with it the literal `/investment/coverage` route in acceptance clause 1).

**Before Stage 2 starts, the two Stage 3 captures R-1 and R-2 belong to Stage 3** and are one command and one
capture respectively. They are listed first because they are Stage 3's own evidence, not because they outrank
Stage 2 in the roadmap: the baseline requires host artefacts per stage, and Stage 3's artefact set is not
complete until they are recorded.

**Explicitly not the next step:** IID Stage 4 (needs Stage 2); Stage 5 or 6 (need Stage 4, and Stage 5 needs
IPD binding and an IPC peer); any of D2–D7 (separate dependencies, separate owners, separate decisions);
merging PR #562 (an owner act); any adjudication of `L-041`/`L-042` (a register act); Win32 recovery
fault-injection (never authorised); reinstalling or repairing the dataset (prohibited — it is evidence).

---

## 12. What this record does **not** say

1. It does **not** say the IID programme is complete, or that Stage 3's evidence file is complete. Two captures
   (R-1, R-2) remain, and one item (R-3) is recorded as superseded in substance rather than captured.
2. It does **not** say overall IID readiness is READY. `ready` stays **false**: D1–D6 outstanding, D8 resolved.
   Stage 3 flipped **one** finding of eight.
3. It does **not** say Arena executed anything on Windows. Every Windows number is operator-supplied host
   output; every Arena number is labelled Linux.
4. It does **not** say the diagnostic's host state was observed. It is code-derived from host-observed presence,
   and marked as such in §6 and §7 R-1.
5. It does **not** treat the operator's `OPERATOR_ASSERTED` declaration as independent legal verification, and
   does not adjudicate `L-041` or `L-042`.
6. It does **not** claim the literal `/investment/coverage` route listed the issuers. What was verified in
   process is the investment-dataset coverage read; OBS-4's route distinction is retained and is why R-2 must
   name the route it captured.
7. It does **not** treat a completed publication as an exercised recovery path on Win32 (N-4).
8. It does **not** present three issuers in three sectors as investment-universe coverage, nor annual-only
   evidence as quarterly or complete financial coverage.
9. It does **not** supersede, correct or reinterpret either protected record, the O3 decision, the
   2026-11-13 reassessment's findings, or any prior governance decision. It supersedes **one verdict**, says so
   in the header, and adds to everything else.
10. It does **not** reopen S3-D1, S3-D2 or publication safety. No contradictory evidence appeared.
11. It does **not** state any volatile value as a standing fact. Every count, digest, exit code and PR field is
    bound to its observation instant on 2026-11-14 at head `a218099d…`.

---

*End of reassessment. Published additively; the records it reassesses are unchanged, byte for byte.*
