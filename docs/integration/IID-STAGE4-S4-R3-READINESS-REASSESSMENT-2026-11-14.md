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
