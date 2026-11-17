# IID Stage 4 / S4-R3 — Final Report & Handover

**Date:** 2026-11-14 (UTC)
**Branch:** `arena/53ff9276-iips-review-recovered` (base: `main` @ `08411bcd`)
**Published commit:** `b2a14c9851a7ee7b4b3a6dcf201778ce9f053e10`
**Commit parent:** `542e0fe4df84bc2e0dbc262da8ab2aa9ab0c05a7` (the carried Stage 2/3/4 history)
**S4-R3 commit size:** 33 files changed, 14,957 insertions, 3 deletions; committed 2026-11-14T17:36:00Z
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — repository-side candidate; no host installation
**Disposition:** STOP. The requested repository-side implementation is complete and published; S4-R3 acceptance/freshness closure is not complete. Remaining work consists of owner/operator decisions and host actions, plus separately scoped repository follow-ups. No further implementation, commit, push, merge, or PR action was performed after the stop instruction.

---

## 1. Status at a glance

| Question | Answer |
|---|---|
| Is the code work done? | **Yes.** Data refresh, read-path fix, tests, docs, and evidence are complete. |
| Is it published? | **Yes.** GitHub branch `arena/53ff9276-iips-review-recovered` exists at `b2a14c9` (re-verified this turn via `git ls-remote` and the GitHub API). |
| Was the published fix checked? | **Yes.** The coverage source at `b2a14c9` was read back from GitHub and contains the `QUARTER` fix; the commit patch also shows the corrected helper token and comment. Commit = 33 files, 2026-11-14T17:36:00Z. This was a publication/content spot-check, not a new test run. |
| Is S4-R3 "closed"? | **No — partially discharged.** KEC quarterly coverage exists in the candidate, but staleness is not lifted for any issuer, so the register item stays OPEN pending owner/host acts. |
| Overall IID readiness | **NOT READY** (D2–D6 outstanding; unchanged by design). |
| PR #562 | Still **OPEN / unmerged** (head `f98732e`, the prior-session branch). Not merged, not closed. No new PR was opened for this branch. |

### 1.1 Important environment note (honest correction)

The current local checkout is at the **base commit** (`08411bc`), not at the implementation commit. Its reflog contains only `clone` + `checkout`; commit `b2a14c9` is unavailable in the local object store, and the local remote-tracking ref is absent. The working tree is not a faithful checkout of `b2a14c9`: the new docs, refresh test and evidence bundle are present, but local `investmentCoverage.ts` still has the old `QUARTERLY` comparison and no diff against base. The exact workspace-restoration mechanism is not established; these are the observed facts.

This does **not** negate publication. The authoritative delivered state is the **GitHub branch at `b2a14c9`**, verified directly this turn:

- `git ls-remote origin refs/heads/arena/53ff9276-iips-review-recovered` → `b2a14c9851a7…`
- GitHub API file content at `b2a14c9` → `… === 'QUARTER' …` (the fix) and `offVocabularyIssuers` present.

The earlier push and remote verification are confirmed on GitHub. It would be incorrect to describe the current local checkout as clean or at `b2a14c9`. I have not reset it, restored its history, re-committed, or re-pushed. Use the published commit as the implementation baseline.

This final report is a new, **uncommitted workspace file**, created after the stop instruction. It is not included in `b2a14c9`. The read-only checks performed for this report were the remote branch/commit/PR checks and verification of the 26 persisted bundle files against `digests.json` (26 matches, 0 mismatches). No test suite was re-run.

---

## 2. Scope and authority

S4-R3 asked for quarterly periods or newer annual filings. The change supplies only what committed bytes support, measures it through the existing ingestion/assessment code, and leaves unsupported fields missing with reasons.

**Explicitly NOT changed:** assessment engine, freshness policy, valuation policy, required-field set, capital-structure rules, XBRL tag map, identity resolver, any historical evidence bundle. **No** host install, **no** O3 admission by implication, **no** NP-04 mint, **no** fabricated metric/price/corporate-action/observation.

---

## 3. What was delivered

### 3.1 Data (additive candidate)
Evidence bundle: `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/` (26 digested files + `digests.json`).

| Issuer | Added | Source used | Left open |
|---|---|---|---|
| Infosys | none | no committed source newer than FY2024 | S4-R3 open for Infosys |
| Marico | FY2025 + FY2026 annual | L-038 `runs/02`/`runs/03` verbatim extracts | no PDF fetch; no preference-capital nil |
| KEC | Q1 FY27 + Q2 FY27 discrete quarters | Q1 printed P&L (L-039 §D); Q2 `OneD` P&L from committed Sept XBRL + printed §E balance sheet cross-checked vs `OneI` | Q1 BS/CF; Q2 discrete CF; unsupported debt/lease/investment fields |

- 105 new populated cells: **100 reported + 5 operator sums**; **15 explicit not-reported reasons**.
- Refreshed issuer directories are complete replacement inputs (rosters byte-identical to admitted; historical periods preserved), because the multi-input merger refuses two bundles claiming one issuer.

### 3.2 Code fix (the only source change)
`iips-platform/src/investment/coverage/investmentCoverage.ts`: count the contract token `QUARTER`, not the non-contract string `QUARTERLY`. Before the fix the manifest counted 2 quarterly periods but every issuer row / served body reported 0. Regression test added in `investment-coverage.test.ts`.

### 3.3 Tests
- New suite `iips-platform/tests/investment/iidStage4FilingRefresh.test.ts` — **20 tests / 5 suites**: source locators, historical preservation + host-pin reproduction, candidate digest/counts, served coverage count, freshness non-closure, derivation recomputation, refusals.

### 3.4 Documents
- `docs/integration/IID-STAGE4-S4-R3-REFRESH-DESIGN-2026-11-14.md`
- `docs/integration/IID-STAGE4-S4-R3-FILING-REFRESH-EVIDENCE-2026-11-14.md`
- `docs/integration/IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md`

---

## 4. Measured results (on the published tree)

### 4.1 Candidate dataset (real CLI, temporary root)
```text
datasetVersion sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
contentDigest  sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
issuers 3 · periods 13 = 11 ANNUAL + 2 QUARTER · issues 0
sectors 3/13 measured (Consumer G1_ENABLED, Industrials G2_PARTIAL, Technology G2_PARTIAL)
usable methods 7 · withheld 31 (every withheld slot carries a reason)
```
Historical admitted inputs still reproduce the Stage 3 host pin:
`sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`.
The candidate digest differs because content differs — a new candidate, not a Stage 3 failure.

### 4.2 Freshness at as-of 2026-11-14 (engine reads latest ANNUAL only; 200-day window)
| Issuer | Latest annual | Staleness | `STALE_STATEMENTS` | `STALE_DATA` | Quarterly in series |
|---|---|---:|---|---|---:|
| Infosys | 2024-03-31 | 958 d | raised | present | 0 |
| Marico | 2026-03-31 | 228 d (was 958) | raised | present | 0 |
| KEC | 2026-03-31 | 228 d | raised | present | 2 |

All three: `MATERIAL_CONCERNS`, `SUFFICIENT`, 100% required-field coverage. KEC also keeps its pre-existing annual `CASH_FLOW_EARNINGS_DIVERGENCE`. **Freshness limb of S4-R3 is not closed.** Closure would need an annual period end ≥ 2026-04-28, or an engine/policy decision outside this change.

### 4.3 Source-integrity differences preserved (not smoothed over)
1. **Marico FY2025 as-filed vs FY2026 comparative:** total assets 8,338 vs 8,332; trade-payable sum 1,363 vs 1,306. Kept as-filed; no restatement cause inferred.
2. **KEC Q2 PPE:** printed split PPE 1,270.63 + right-of-use 310.32; XBRL `PropertyPlantAndEquipment@OneI` = 1,580.95 (aggregates them). Used the printed split.
3. **KEC Q2 cash flow:** committed facts are `FourD` half-year YTD, not discrete Q2 — retained as evidence, not assigned to the quarter.
4. **L-039 machine zero:** `CurrentInvestments@OneI = 0` stays raw evidence only; not ingested as a disclosed zero.

---

## 5. Verification & gates (measured last turn on the committed tree)

| Gate | Result |
|---|---|
| Platform typecheck | exit 0 |
| Platform IID suite | **1163 tests / 257 suites / 0 fail** |
| Platform full suite | **678 / 678 / 0 fail** (after read-only fetch of missing A13 baseline commit `5ca181c7…`) |
| IID-0 constraints | **6 / 6 / 0 fail** |
| New refresh suite | **20 / 5 / 0 fail** |
| Coverage + refresh targeted | **30 / 6 / 0 fail** |
| Frontend typecheck | exit 0 |
| Frontend full suite | **2949 passed \| 1 skipped (2950); 202 files passed \| 1 skipped (203)** |
| Hygiene | `git diff --check` exit 0; probe compiles; bundle JSON parses; digests 26 files / 0 mismatches |

Notes: the frontend suite's known zero-socket evidence side effect was reverted and verified clean. `ps-conformance.py` and `doc-evidence-validate.py` are **not present** in the current tree or `f98732e`; no pass is claimed for them. These numbers were measured on the published tree last turn; they were **not** re-run this turn (the local sandbox is a partial restore, so re-running locally would be misleading).

---

## 6. Complete vs. open

| Item | State |
|---|---|
| Marico FY2025/FY2026 + KEC Q1/Q2 FY27 candidate data | **Done, published** |
| `QUARTER` coverage read-path fix + regression | **Done, published** |
| Executable refresh proof + evidence + docs | **Done, published** |
| Historical bundles / host pin | **Untouched, still reproduces** |
| G-6 quarterly limb | **Partially discharged in candidate** (KEC); operational closure needs host install |
| S4-R3 register closure | **OPEN** — staleness still raised for all issuers |
| Infosys refresh | **OPEN** — no committed newer source |
| G-4 operating metrics (S4-R6) | **OPEN** — owner decision |
| G-14 static roster lint (S4-R7) | **OPEN** — optional future repo work |
| Overall IID readiness | **NOT READY** (D2–D6) |

---

## 7. Handover checklist — what only you / the operator can do

Items 1–5 concern S4-R3 acceptance and freshness closure and require owner decisions, source acquisition and/or host execution. Items 6–8 are separate outstanding work or publication choices; S4-R7 is an optional repository follow-up, not an additional action taken under this stop instruction.

1. **Admit the refreshed content (O3).** Owner decision to accept the candidate as operational input. Until then the admitted population remains the three historical bundles.
2. **Install on the Windows host.** Run the ingestion CLI into a designated dataset location with the three inputs (original Infosys + refreshed Marico + refreshed KEC). Expected digest `sha256:bdfb2527…`. Use a new candidate directory unless a separate act authorises replacing the installed Stage 3 dataset.
3. **Capture host evidence (R-1, R-2).** Run `iid:readiness` in the host process and capture stdout; capture the served `/api/investment/coverage/investment` and `/api/investment/coverage` responses. A sandbox measurement is not a host artefact.
4. **Infosys.** Acquire/transcribe a newer Infosys filing, or record explicitly that Infosys remains stale.
5. **Freshness closure.** Requires an annual period end ≥ 2026-04-28 for the issuer, or an explicit engine/policy decision (out of scope here).
6. **Operating metrics (S4-R6).** Decide whether to enter `TM_*`/`IN_*` metrics or keep those methods withheld.
7. **Static roster lint (S4-R7).** Optional future repository work: add a validator and prove it fails on a deliberately respelled roster. Not implemented in this change.
8. **Stage 5 (D2–D6).** IPD binding + IPC peer, NP-04 store path, reports owner carrier, assessment mint/readback. Separate owners; unchanged.
9. **Publication choice.** This branch is pushed but has **no PR**. It contains the prior 24 Stage 2/3/4 commits (cherry-picked) **plus** S4-R3, so a PR from it would carry both. PR #562 (prior branch) remains open; decide whether to open a PR from this branch and/or close #562. I did neither.

---

## 8. Limitations & caveats
- `L-041` (source rights) and `L-042` (valuation) remain **OPEN**. Verified chain is committed extract/XBRL → transcription → dataset → derivation; **not** independent PDF/source-rights verification (PDFs are not committed).
- Three issuers in three sectors is not investment-universe coverage; ten sectors remain `UNMEASURED` and named.
- No Windows-host execution is claimed; every measurement was in the Linux sandbox.
- The local checkout is at base with an inconsistent mixture of restored files; the authoritative deliverable is GitHub `b2a14c9`. No local repair or new publication was performed.

## 9. File index (published at `b2a14c9`)
```
docs/integration/IID-STAGE4-S4-R3-REFRESH-DESIGN-2026-11-14.md
docs/integration/IID-STAGE4-S4-R3-FILING-REFRESH-EVIDENCE-2026-11-14.md
docs/integration/IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md
evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/   (README, determination, digests,
    data-extraction, source-selection, probe/build_refresh.py, source/*, ingest-input/{marico,kec}/*, runs/*)
iips-platform/src/investment/coverage/investmentCoverage.ts        (QUARTER fix)
iips-platform/tests/investment/investment-coverage.test.ts         (regression)
iips-platform/tests/investment/iidStage4FilingRefresh.test.ts      (new suite)
```

## 10. Effort note
The work did not meet your 10–15 minute expectation. The recorded final gate runtimes were approximately 17.8 s for the platform IID suite, 20.5 s for the platform full command, and 251.5 s for the frontend suite. Those runs alone do not explain the reported four-hour elapsed time. Repeated checks, dependency setup, source transcription/verification, evidence preparation, and retries contributed; the retained records do not support a precise minute-by-minute attribution.

The avoidable retries included the shallow-clone A13 failure, a TLS setup retry, and corrections to my own probe/tests. I should have checked those prerequisites earlier and avoided redundant verification. No further implementation or gate reruns were performed after your stop instruction.
