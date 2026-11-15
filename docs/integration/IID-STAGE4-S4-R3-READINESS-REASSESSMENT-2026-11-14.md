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
| S4-R7 | Static roster vocabulary lint | IRR | A validator failing on a deliberately respelled roster. |
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
