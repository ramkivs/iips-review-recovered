# IID Stage 4 — S4-R3 readiness reassessment after the filing refresh

**Date:** 2026-11-14 (UTC)  
**Branch:** `arena/53ff9276-iips-review-recovered`  
**Evidence:** `IID-STAGE4-S4-R3-FILING-REFRESH-EVIDENCE-2026-11-14.md`  
**Candidate bundle:** `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/`

## 1. Verdict

**IID Stage 4 remains PARTIALLY COMPLETE. S4-R3 is partially discharged in a repository-side candidate, but remains OPEN as an acceptance/freshness item. Overall IID readiness remains NOT READY.**

| Limb | Position after this refresh |
|---|---|
| Stage 4 measurement limb | **MET historically and re-measured on the candidate.** Candidate: 3 issuers, 11 annual + 2 quarterly periods, 0 issues, 3/13 sectors measured, reasons on every withheld method. |
| G-7 sector read path | **CLOSED**, unchanged. |
| G-14 sector vocabulary lint | **SUBSTANTIALLY CLOSED**, unchanged; static roster lint remains S4-R7. |
| G-4 operating metrics | **OPEN**, unchanged; 0 operating-metric records. |
| G-6 quarterly data | **PARTIALLY DISCHARGED IN CANDIDATE.** KEC now has two discrete quarterly periods and the coverage read path reports them. Operational closure still requires owner acceptance/host installation; Infosys/Marico remain annual-only. |
| S4-R3 exact closure | **OPEN.** The candidate has `quarterlyPeriods > 0`, but `STALE_STATEMENTS` is still raised for every issuer, so the register’s combined closure condition is not met. |
| Demo limb | Unchanged: 6 demonstrated / 4 partially demonstrated / 0 undemonstrable; residuals remain Stage-5-owned or the recorded scenario-9 divergence. |
| Overall IID readiness | **NOT READY.** D2–D6 remain outstanding. |

## 2. What changed

1. Additive candidate inputs for Marico FY2025/FY2026 and KEC Q1/Q2 FY27, built only from committed source extracts/XBRL.
2. A coverage read-path regression fix: valid `QUARTER` periods are counted in issuer rows and the served investment-coverage body. The prior comparison against `QUARTERLY` silently reported zero.
3. A committed executable refresh suite and evidence bundle pinning the candidate digest, source locators, historical preservation, freshness non-closure, derivations, and refusals.

Candidate digest:

```text
sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
```

Historical host digest remains:

```text
sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
```

## 3. What did not change

- No assessment engine, freshness policy, valuation policy, required-field set, capital-structure rule, XBRL tag map, or identity resolver change.
- No historical bundle modification, host reinstallation, host identity republication, or NP-04 mint.
- No Infosys refresh: no newer source is committed.
- No lifting of `STALE_STATEMENTS` or `STALE_DATA`: at as-of 2026-11-14 the latest annual ends are 2024-03-31 / 2026-03-31 / 2026-03-31, giving 958 / 228 / 228 days against a 200-day window.

## 4. Remaining actions

| ID | Action | Owner | Closure evidence |
|---|---|---|---|
| S4-R3 | Accept/install the candidate refresh if desired, and close the freshness limb honestly | OWNER + OPERATOR | A recorded admission decision; a host installation/verification capture at the candidate digest; refreshed served coverage/readiness captures. Freshness closure additionally requires an annual period end ≥ 2026-04-28 for the issuer in question or an explicit engine/policy decision outside this change. |
| S4-R3-Infosys | Acquire/transcribe a newer Infosys filing or record that Infosys remains stale | OPERATOR | A committed source-supported Infosys period, or an explicit open limitation record. |
| S4-R6 | Operating-metric decision | OWNER + OPERATOR | Validated metric records or a recorded decision to keep methods withheld. |
| S4-R7 | Static roster vocabulary lint | IRR | **COMPLETE 2026-11-15** — validator fails on a deliberately respelled roster; see §7 |
| R-1/R-2 | Host readiness and served-surface captures | OPERATOR | Host stdout/captures, not sandbox measurements. |
| D2–D6 | Stage 5 dependencies | Their recorded owners | Unchanged by this refresh. |

## 5. Publication boundary

This reassessment adds to the Stage 4 record; it does not rewrite the historical Stage 4 readiness/evidence documents, does not merge PR #562, and does not convert a sandbox candidate into a host fact.

## 6. Addendum — Windows-host candidate build and dataset verification recorded

**Addendum date:** 2026-11-15 (host report date)
**Evidence:** `IID-S4-R3-WINDOWS-HOST-BUILD-AND-VERIFICATION-EVIDENCE-2026-11-15.md`
**Host baseline:** `7ef0f10f593e6d5449900b61f7bf74d0c3daaa01`

Sections 1–5 above are preserved as the position at 2026-11-14. This addendum is the current position **only for the candidate-build and candidate-verification limbs**; every other limb keeps its recorded status.

The operator built the exact O3-admitted candidate on the Windows host through the authoritative ingestion pipeline, outside the repository, at `C:\iips-candidates\S4-R3-preflight-7ef0f10`. Driver result `BUILD-VERIFY-PASS; 75 passed, 0 failed; ExitCode=0`. Wrapper `build-s4-r3-candidate` **PASS**, 16/16 checks. Authoritative `verify-installed-dataset` **PASS**, 31 passed / 0 failed / exit 0, read-only attestation clean. Actual digest equals the admitted digest `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`.

| Limb | Position after the host evidence |
|---|---|
| S4-R3 candidate build | **DISCHARGED ON THE HOST** at the exact admitted digest |
| S4-R3 dataset verification | **DISCHARGED** — authoritative verifier PASS, read-only |
| S4-R3 exact closure | **STILL OPEN.** `STALE_STATEMENTS` / `STALE_DATA` persist for all three issuers; the register's combined closure condition is unchanged |
| G-6 quarterly data | **PARTIALLY DISCHARGED IN CANDIDATE**, unchanged; operational closure still requires an authorized installation/acceptance act |
| G-4 operating metrics | **OPEN**, unchanged |
| G-7 / G-14 | **CLOSED / SUBSTANTIALLY CLOSED**, unchanged |
| Installation into the active runtime | **NOT AUTHORIZED, NOT PERFORMED** |
| Identity sources | **`IDENTITY_SOURCE_MISSING`**, `identitySourcesAvailable false` |
| Overall IID readiness | **NOT READY**; Stage 4 **PARTIALLY COMPLETE**; Stage 5 not declared ready |

The §4 remaining-action row `S4-R3` is **not closed** by this addendum: its closure evidence still requires host installation/verification *of an admitted installation* plus honest freshness closure. What is now satisfied is the candidate-build-and-verify portion, on the operator's own host rather than in a sandbox. `R-1`/`R-2` remain open because a candidate verifier run is neither the host readiness diagnostic nor the served-route captures. `L-041` and `L-042` remain **OPEN**, source rights remain `OPERATOR_ASSERTED`, and no PDF-to-transcription verification is claimed.

The active dataset, identity directory and portfolio database were protected; the portfolio database was not accessed. No dataset content was committed or pushed, and PR #562 was not merged.

## 7. S4-R7 complete — static roster vocabulary lint (2026-11-15)

**Status: COMPLETE.** The `G-14` remainder is discharged. This section is the current position for `S4-R7`
only; §§1–6 keep their recorded statuses for everything else, and no other register row moved.

### 7.1 Validator and invocation

| Item | Value |
|---|---|
| Validator | `iips-platform/scripts/lint-roster-sectors.ts` |
| Invocation | `npm run lint:rosters` (from `iips-platform`), or `tsx scripts/lint-roster-sectors.ts [--root <dir>] [--json]` |
| Vocabulary authority | `findInvalidIssuerSectors` from `iips-platform/src/investment/ingestion/sectorValidation.ts` — the sole classifier; no second vocabulary, no normalisation |
| Exit codes | `0` all valid; `1` off-vocabulary sector or unreadable/malformed roster; `2` usage error |
| Writes | none — reads only; `--root` exists so tests can point the same code path at a fixture tree |

### 7.2 Roster discovery and positive result

Discovery is a deterministic, sorted, symlink-safe walk of the checkout for the two committed hand-authored
roster filenames, `roster.json` (ingestion) and `eligible-roster.json` (identity). It deliberately does not
consult the Git index, so a shallow or partially restored checkout cannot silently shrink the population,
and it names no bundle, so a newly committed roster is covered on arrival. Directories `.git` and
`node_modules` are skipped; a `fixtures` directory is excluded from the gated population and every exclusion
is printed with its count.

**18 rosters checked, 0 failed** — 11 ingestion rosters and 7 identity rosters, including the S4-R3 refresh
`marico`/`kec` rosters the earlier three-bundle test never saw. Independently cross-checked: the discovered
set is **identical** to the set of committed rosters in the published tree (18 = 18, no missing, no extra).
Two pre-existing synthetic fixtures are reported as excluded.

Both roster families are gated. The identity loader substitutes `UNCLASSIFIED` for a *missing* sector at
read time; that is a loader fallback, not a licence for a committed roster to carry an off-vocabulary value,
so no exception was carved out. All 18 currently carry exactly canonical sectors.

### 7.3 Negative-fixture evidence

Fixture: `iips-platform/tests/investment/fixtures/roster-lint/respelled-sector-roster.json` — synthetic,
labelled as such, never admitted evidence, never ingested. Copied into a temporary repository-shaped tree it
is discovered without editing the lint, and the CLI **exits 1**:

```text
FAIL  evidence/real-issuer/SYNTHETIC-RESPELLED/ingest-input/roster.json (ingestion)
  [0] IN:CIN:L00000AA0000SYN000001 (...): sector is "consumer" — CASE — match case exactly: the canonical value is "Consumer"
  [1] IN:CIN:L00000AA0000SYN000002 (...): sector is "Technology " — WHITESPACE — remove whitespace: the canonical value is "Technology"
rosters checked: 1; failed: 1
RESULT: FAIL
```

Both offenders are reported, not just the first. A canonical positive control passes through the same code
path with exit 0.

### 7.4 Read-only property

Every discovered roster's SHA-256, size and mtime are identical before and after both an in-process lint and
a CLI run; discovery returns the same set afterwards (nothing created or removed); the failing run leaves
the offending fixture byte-identical. Independently, all 18 committed roster blobs at the implementation
commit equal their blobs at the starting commit `d10b168860ce17f310ffa6cfedd09647a1d43cfc`.

### 7.5 Tests and validation

| Gate | Result |
|---|---|
| New suite `tests/investment/rosterSectorLint.test.ts` | **19 tests / 4 suites / 0 fail** |
| Platform `npm run typecheck` | **exit 0** |
| Explicit typecheck of the script and test (`tsconfig` includes only `src/**`) | **exit 0** |
| Validator on the repository | **18 checked / 0 failed, exit 0** |
| Negative fixture CLI | **exit 1**, file/issuer/value named |
| Full IID suite, this checkout | 1214 tests / 266 suites / 1183 pass / **31 fail — all pre-existing local drift, none from this change** |
| Full IID suite, isolated full-tree baseline with the two drifted coverage files replaced by their published blobs | 1214 / 266 / **1213 pass / 1 fail** |

**The 31 failures are disclosed, not absorbed.** This sandbox is a restored shallow checkout whose
`iips-platform/src/investment/coverage/investmentCoverage.ts` and `measure.ts` predate the published `G-7`/
`S4-R3` read-path fixes (the local `investmentCoverage.ts` contains no `offVocabularyIssuers` at all). Every
one of those 31 failures disappears when the two files are replaced by their published blobs in an isolated
full-tree copy. The single residual failure in that copy is `s4R3CandidateBuild.test.ts`'s manifest byte
comparison, an artefact of the copied root changing `inputs[].inputDir` audit paths; it passes in the real
repository. This change adds only new files plus one `package.json` script line and is imported by no
existing test.

### 7.6 Publication and independent verification

- Implementation commit: **`3a3521a9a3497607911cf790a53a4f61b3d2cd0a`**, parent `d10b168860ce17f310ffa6cfedd09647a1d43cfc`.
- Branch: **`arena/53ff9276-iips-review-recovered`**; `git ls-remote` confirms the head.
- Changed paths (5): the validator, the test suite, the two synthetic fixtures, and `iips-platform/package.json`
  (adds only the `lint:rosters` script).
- Independent remote verification: **18 checks, 0 failures** — head/parent/tree, tree not truncated, exactly
  those 5 paths changed, every changed blob read back byte-identical, and the evidence, documentation,
  Windows-script, frontend and platform-implementation trees unchanged. PR #562 remains OPEN and unmerged.

### 7.7 What this does not do

`S4-R7` closes the literal `G-14` "no lint" complaint and nothing else. It does **not** close Stage 4, does
not resolve `G-4` or `G-6`, does not close `S4-R3` acceptance or freshness, and does not establish Stage 5
readiness. `L-041` and `L-042` remain **OPEN**; all three issuers remain `STALE_STATEMENTS` / `STALE_DATA`;
source rights remain `OPERATOR_ASSERTED`; identity sources remain `IDENTITY_SOURCE_MISSING`; 3 of 13 sectors
are measured. **Runtime installation remains NOT AUTHORIZED**, the active dataset and identity directory
were not touched, and the portfolio database was not accessed. **Stage 4 remains PARTIALLY COMPLETE and
overall IID readiness remains NOT READY.**

## 8. Windows read-only candidate verification recorded — VERIFY-PASS 46/46 (recorded 2026-11-15)

**Evidence:** `IID-S4-R3-WINDOWS-READONLY-VERIFICATION-EVIDENCE-2026-11-15.md`
**Mode:** `IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1 -VerifyOnly` against the existing candidate
**Host baseline:** `7ef0f10f593e6d5449900b61f7bf74d0c3daaa01`; shell Windows PowerShell `5.1.26100.9818` Desktop
**Execution timestamp:** not supplied by the operator transcript; none asserted. Only the ordering after the
§6 BUILD act is established, from the presence of the BUILD-written Windows attestation.

Sections 1–7 keep their recorded statuses. This section is the current position **only for the Windows
read-only candidate-verification limb**. The operator re-verified the existing candidate at
`C:\iips-candidates\S4-R3-preflight-7ef0f10`: driver **`VERIFY-PASS; 46 passed, 0 failed; ExitCode=0`**, pinned
build wrapper **PASS** with `checks=16` and `comparable-manifest matches=1`, authoritative
`verify-installed-dataset` **PASS** `checks=31`, `failed=0`, exit 0, read-only attestation `1`. Digest
`sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`. Infosys, Marico and KEC admitted
input digests all matched. **No build was started by this invocation**; the candidate's names, sizes, mtimes
and hashes were identical before and after. The active dataset, identity directory and portfolio database were
protected; the portfolio database was not accessed. The complete transcript is preserved verbatim in §3 of the
evidence document, with an integrity pin over its exact bytes.

| S4-R3 limb | Position |
|---|---|
| Candidate build and digest verification | **COMPLETE** — unchanged from §6 |
| Windows read-only candidate verification | **COMPLETE — 46/46**, wrapper 16/16, authoritative verifier 31/0 |
| Installation / replacement | **NOT PERFORMED.** Separate owner authorization and a governed replacement procedure are required |
| Freshness and every other outstanding Stage 4 finding | **OPEN**, unchanged — no authoritative evidence closes them |

**Identity rule.** The `DIFFERENT_RAW_BYTES` manifest diagnostic (`b0c888a8…` vs recorded `b921741942…`) is
**not** an identity failure: identity is governed by the passed authoritative comparable-fields check plus the
exact content digest. The distinction is preserved, not collapsed.

**Two transcript anomalies are disclosed rather than corrected** (evidence §6): the `pinned-wrapper-sha256`
detail line carries two 68-character hex strings where SHA-256 is 64 — a copy artefact, since the committed
driver prints a 64-character literal and the same line's canonical value plus the separate raw diagnostic are
correct and match the committed pin `5f3ad17b…` / blob `b807c7f2…`; and the `wrapper-line-ending-conversion`
diagnostic that the committed driver emits is absent from the capture, which cannot affect the totals because
diagnostics are excluded from them. The transcript was **not** edited to match the script.

`S4-R3` **remains OPEN**. `R-1`/`R-2` remain open — a candidate verifier run is neither the host readiness
diagnostic nor the served-route captures. `G-4`, `G-6`, `S4-R6`, `S4-R3-Infosys`, `R-4`, `S2-R1`, `S2-R2` and
`D2`–`D6` are unchanged. `L-041` and `L-042` remain **OPEN**; source rights remain `OPERATOR_ASSERTED` with no
independent legal verification and no PDF-to-transcription claim; `IDENTITY_SOURCE_MISSING` is unresolved; 3 of
13 sectors are measured. **Runtime installation remains NOT AUTHORIZED. Stage 4 remains PARTIALLY COMPLETE,
Stage 5 is not declared ready, and overall IID readiness remains NOT READY.** No Windows execution was
performed by IRR, no dataset content was published, and PR #562 was not merged.

## 9. PA-01 applied — S4-R3 installation is an ordinary owner-directed local operation (2026-11-15)

**Governing policy:** `IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md`, in force. Sections 1–8 keep
their recorded facts; this section replaces their **approval** language prospectively.

The §4 row `S4-R3` said `OWNER + OPERATOR` and required "a recorded admission decision"; §6 and §8 said
installation is "NOT AUTHORIZED" and needs "separate owner authorization and a governed replacement procedure".
**Those approval requirements are withdrawn.** The owner is the sole operational authority for this personal,
single-user, non-production application. Installing the verified candidate is ordinary local maintenance.

| Limb | Position under PA-01 |
|---|---|
| Candidate build and digest verification | **COMPLETE** — unchanged |
| Windows read-only candidate verification | **COMPLETE — 46/46**, wrapper 16/16, verifier 31/0 — unchanged |
| Installation / replacement | **Owner-directed ordinary operation.** No approval, admission decision, acceptance authority or adjudication required. Not yet performed |
| Protected by | Verified backup of the Stage 3 dataset; candidate digest verification; supported replacement; post-installation verification through the product's own readers; rollback on failure; a concise durable record |
| Freshness and all other Stage 4 findings | **OPEN**, unchanged — installing bytes does not make stale statements current |

**One real technical constraint, disclosed not hidden.** Re-ingesting the S4-R3 inputs over the live directory
is refused by `assertNoSilentSourceLoss`: the installed dataset's recorded `inputs[].inputDir` strings name the
historical `WI7`/`WI8` bundles, which the refresh supersedes, so the guard sees dropped sources and stops before
writing. That is the guard working correctly, and it is **not** to be weakened. The supported move is to replace
the installed dataset with the **already-verified candidate package**, whose ten files are the exact bytes the
verifier passed at `sha256:bdfb2527…`. PA-01 §5 gives the owner-executed outline. **No installation was performed
by the policy task.**

`R-1`/`R-2` remain open as host captures — verification steps, not approvals. `L-041`/`L-042` remain OPEN as
technical limitations with no adjudication ceremony. Source rights remain `OPERATOR_ASSERTED`;
`IDENTITY_SOURCE_MISSING` is unresolved; 3 of 13 sectors are measured. Stage 4 remains **PARTIALLY COMPLETE**
and overall IID readiness remains **NOT READY**. PR #562 is not merged.

## 10. The missing installation capability is implemented (2026-11-15)

**Command:** `iips-platform/src/investment/cli/install-verified-dataset.ts`
**Procedure:** `IID-INSTALL-VERIFIED-DATASET-WINDOWS-PROCEDURE-2026-11-15.md`

§9 disclosed that re-ingesting the refresh over the live directory is refused by `assertNoSilentSourceLoss`, and
that no supported command existed to publish an already-verified package. That gap is now closed. The command
reads the candidate through `readDataset`, requires the expected content digest, carries `manifest.inputs`
forward verbatim, refuses unresolved publication markers unless `--recover` resolves them through
`recoverInterruptedPublication`, and publishes through **`writeDataset`** — so staging, verify-before-swap,
move-aside restoration and the marker contract are the product's own. A failed post-publication verification
restores the prior dataset through the same writer.

**`assertNoSilentSourceLoss` is unchanged**, and a test pins that the superseding re-ingest is still refused.
No parallel swap was written. New suite **25 tests / 0 fail**; targeted regression **154 / 0 fail**; platform
and explicit test typechecks **0**; full IID suite adds 25 passing tests with the pre-existing 31 failures
unchanged. An end-to-end drill installed the S4-R3 candidate over a reproduced Stage 3 dataset in an isolated
temp root: `INSTALLED`, then the authoritative verifier **PASS 27/0**, no residue.

**Installation on the Windows host has still not been performed.** `C:\iips-data` was not touched from the
Linux environment. The S4-R3 installation limb stays open until the operator runs the procedure and host
verification passes. Freshness, `G-4`, `G-6`, `L-041`, `L-042` and the IPD-owned Stage 5 dependencies are
unchanged; Stage 4 remains **PARTIALLY COMPLETE** and overall IID readiness remains **NOT READY**.

## 11. Windows installation attempt: coverage-clock defect found and corrected (2026-11-15)

The operator's first Windows attempts returned `REFUSED`, `published: false`, at `candidate-coverage-consistent`.
The Stage 3 backup was sound: content digest `sha256:3ad82918…` correct, authoritative installed-dataset verifier
**21/0**, active dataset left intact.

**Root cause.** The coverage report is a derived, timestamped view published through `derivedFiles`, so it sits
**outside `manifest.files` and outside `datasetVersion`**; `readDataset` never verifies its bytes and its
`generatedAt` is independent of `manifest.lastImportAt`. Stage 4 measured coverage over the installed Stage 3
dataset in a separate pass (§3 of the Stage 4 coverage evidence), leaving the installed report's clock later than
the import clock. The installer had recomputed at `manifest.lastImportAt` and demanded byte equality, so that
legitimate later measurement could never match.

**Correction.** Validate the persisted report against a recomputation **at its own declared `generatedAt`** and
carry it forward **verbatim**; restore the prior view verbatim on rollback and assert it. Byte equality against
the product's own measurement is still required, so tampering, a wrong `datasetVersion`, a report measured over
other content, and a non-canonical clock are all still refused before any write. S4-R3 candidate validation is
unchanged in strength. Content integrity, `manifest.inputs` preservation and `assertNoSilentSourceLoss` are
untouched.

**Evidence.** The failure was reproduced from the real Stage 3 bundles before the fix and returns `INSTALLED`
after it. Suite **33/0**; targeted regression **154/0**; platform and explicit test typechecks **0**. A CLI round
trip — Stage 3 → S4-R3 → Stage 3, restoring by installing the backup rather than copying files — ends
**byte-identical** to the backup and verifies **21/0**.

**Rollback is now the installer**, not a manual deletion/copy; the procedure prescribes
`install-verified-dataset --candidate-dir <backup> --expect-version <old digest>` with `--recover` for markers.

**The Windows installation itself is still not performed.** No Windows or `C:\iips-data` execution occurred in
this session. Stage 4 remains **PARTIALLY COMPLETE**; `L-041`/`L-042` remain OPEN; IID readiness **NOT READY**.

## 12. `S4-R3` executed as a capability — freshness is now measured, and the item still cannot close (2026-11-17)

**Scope.** IRR-only. This section *executes* the freshness work item this document scoped; it does not revise
§1–§11. It adds no issuer, no bundle, no admission, no dataset class, no valuation policy and no host action. The
evidence bundle is `evidence/real-issuer/S4-R3-FRESHNESS-EVIDENCE-2026-11-17/` (`README.md`, `digests.json`,
`runs/01`–`runs/06`).

**Base.** `main` `d71b025d24940b2694cad945be4a227fa2aabba8` (the merge of PR #586, `S4-R2`). The work branch is
`arena/9a2897ac-iips-review-recovered`, branched from that commit.

**Why a capability and not three transcriptions.** §1–§11 treated `S4-R3` as data work — install quarters, or find
newer annuals — and every attempt ended at the same wall. Re-reading the freshness path at this head showed the wall
was partly engineering: `engine.ts` derived `dataAsOf` from `series.annual[0]?.periodEnd`, so a series with **no annual
period** produced `stalenessDays = 0` and read as fresh; only one age was published, so a period older than a newly
filed quarter was invisible; `filed_at` was captured at ingestion and never surfaced; and a gap in the sequence was
indistinguishable from a shorter series. So the item was split: a **reusable, issuer-neutral freshness capability**
was built (this section), and the remaining **data** dependency is recorded per issuer rather than as one blocker.

**The capability.** `iips-platform/src/investment/assessment/freshness.ts`, one pure module, no I/O, no wall clock, no
issuer identity: `valuationBasis` (newest annual, else TTM, else newest quarter, with `valuationBasisKind` publishing
which) and `latestReported` are separate facts with separate ages measured from **period end**, never from filing
date; `filedAt`, `daysSinceFiling` and the `pnlDays`/`balanceSheetDays` windows are published beside them; the verdict
is `STALE`/`FRESH`/**`UNKNOWN`** — never `FRESH` for an absent period or for one that ends after the clock — and the engine's `staleBeyondPolicy` is
`status !== 'FRESH'`, so the quarters-only false negative is closed. `periodSequenceGaps` reports a skipped fiscal year
or a skipped quarter (quarters grouped by fiscal-year **start**, so an April–March year is not split), and a gap
raises one new MEDIUM flag, `PERIOD_SEQUENCE_GAP`. Nothing is interpolated, fabricated or zeroed. The engine now
calls this module instead of computing ages itself, and each issuer row of the investment-coverage read model carries
the same block computed at the report's own `asOf` — one definition of freshness across assessment, coverage and
reporting, with no threshold duplicated outside `VALUATION_POLICY.freshness`.

**Freshness, measured at the newly recorded clock 2026-11-17** (`freshness-policy/1.0.0`, 200-day P&L window ⇒ a
period end on or after 2026-05-01 is required):

| Issuer | Valuation basis | Age | Newest reported | Age | Newest filing date | Verdict | Gaps |
|---|---|---|---|---|---|---|---|
| Infosys Limited | FY2024 annual 2024-03-31 | 961 d | same | 961 d | 2024-04-18 | `STALE` | 0 |
| Marico Limited | FY2026 annual 2026-03-31 | 231 d | same | 231 d | 2026-05-05 | `STALE` | 0 |
| KEC International | FY2026 annual 2026-03-31 | 231 d | FY2027 Q2 2026-09-30 | **48 d** | 2026-11-02 | `STALE` | 0 |

Against the `S4-R2` dataset of record at the same clock, Marico moves **961 d → 231 d** and KEC gains **two quarters**
(newest information 231 d → 48 d). Neither clears the window, because the window is measured on the annual basis a
valuation consumes. That is the finding, measured rather than asserted.

**Why `S4-R3` remains OPEN, exactly.** The register's closure evidence has two limbs. `quarterlyPeriods > 0` is now
**met** for KEC (2 discrete quarters). "`STALE_STATEMENTS` no longer raised" is **not** met for any issuer, and cannot
be met by quarterly data under `freshness-policy/1.0.0`: the flag is raised from the annual valuation basis, and
letting a quarter carry it would change what the verdict means for a DCF. Two things can close the item: newer
**annual** filings with a period end on or after the window (Infosys: none in the repository — `S4-R3-Infosys` stays
OPEN; Marico/KEC: FY2027 accounts, available ~May 2027), or an explicit owner **policy decision** that quarterly
periods carry the freshness verdict for an issuer whose annual data is older — recorded as a decision, not applied
here, because applying it would be the threshold-weakening this item forbids.

**The payload did not move, deliberately.** The freshness block is clock-derived, and the assessment payload's
substantive identity is clock-free by construction (`substantiveIdentity.ts` deletes a closed member list including
`asOf.stalenessDays`; widening that list is what the register forbids). A day-count inside the payload would change
every stored report's substantive digest daily. The `S4-R2` payload digest
`925b403622c9b667152effa64539036a8cbcea40229ef2b36c7f148c210e471e` and `inputDigest sha256:9a2b0fd2…` reproduce
byte-for-byte in the new suite; the only payload change is the additive `PERIOD_SEQUENCE_GAP` flag, which cannot
appear for an issuer without a gap — and none of the three has one.

**Installed and served — a sandbox drill, not host verification.** The owner's documented procedure was executed end
to end in an isolated temp root: prior dataset `69bbc14e…` in the live directory, candidate `bdfb2527…` built
separately, then `install-verified-dataset` (**INSTALLED — 15/0**), `verify-installed-dataset` (**PASS — 25/0**,
`read-only-attestation` included), and the product's own coverage and assessment reads over the installed bytes, which
carry the freshness block. `C:\iips-data` was not touched; the temp root was removed. The host installation limb
stays OPEN, with the exact command sequence recorded for the operator.

**Finding, disclosed rather than papered over: the O3 re-admission does not cover every input in use.** O3 §8.4
requires a fresh declaration for any superseded bundle. The 2026-11-14 re-admission covers `REL-1`'s Infosys input,
the refreshed Marico (`31d8e503…`) and KEC (`22ea5018…`) bundles and the candidate `bdfb2527…`. `S4-R2` then created a
**successor transcription** of the Infosys input (`S4-R2-INFOSYS-BORROWINGS-2026-11-17/ingest-input`, `periods.csv`
`97d7cf7c…`), which no declaration records — so the `S4-R2` dataset `69bbc14e…` and the combined candidate
`f357f6af…` are **not O3-admitted** and must not be described as admitted or installed. The admitted dataset remains
`bdfb2527…`, which still reproduces. Closing this needs one operator declaration, not code.

**Tests.** New suite `iips-platform/tests/investment/s4r3Freshness.test.ts` — **23 tests, 23 pass** — with four
describe blocks: the period algebra (basis fallback, two ages, filing-vs-period, `UNKNOWN`, boundaries), sequence gaps
(annual and quarterly, April–March grouping, no fabrication), a **synthetic issuer** `IN:CIN:U74999TN2019PLC000123`
processed through the **real ingestion CLI** with no issuer-specific code (annual + quarters, gap, stale, future
holding, invalid fiscal year refused, restatement provenance), and the admitted population (candidate reproduces
`bdfb2527…`, the `S4-R2` payload digest, evidence-file sha pins). IID suite **1516/1516**; platform `tsc --noEmit`
clean; frontend typechecks unchanged (24 pre-existing private-module findings, plus one fixture this section had to
complete with the new required member). Frontend vitest: **2353 passed**, 12 test failures and 52 collection errors,
each with a named environmental cause (private NP-04 / market-data / broker-import modules absent, and the §23
scenario that needs them) — the pre-existing baseline, unchanged by this work.

**What this section does not claim.** Not that `S4-R3` is closed. Not that freshness is satisfied — it is measured,
and it is not. Not that any host holds the candidate. Not that `69bbc14e…`/`f357f6af…` are admitted. Not that the
functional-currency window should change. Stage 4 remains **PARTIALLY COMPLETE**, overall IID readiness **NOT READY**;
`S4-R3` and `S4-R3-Infosys` remain **OPEN**, and the next Stage 4 roadmap item is **`S4-R4`** (documentation), with
**`S4-R5`** (existential-vs-latest coverage) after it.
