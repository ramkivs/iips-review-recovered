# IID-4 — post-merge verification record

**Date:** 2026-11-06 · **Phase:** IID-4 (holding disposition / IID-02) · **Status of this document:** record of a
verification **already performed**, written after the merge. It is not a new verification run and it contains no new
measurements: every result below is the result of a run that happened before this file existed, and the commands are
reproduced only so a reader can repeat them.

This file is the follow-up that `INDEPENDENT-VERIFICATION.md` and `IID-4-COMPLETION-REPORT.md` §9 both anticipated.
Neither is contradicted: they were written while the pull request was open, and both say so, in the sentence
"verification of the merged `main` is not claimed … until the pull request merges". This record is that verification,
and it does not restate their methodology — it adds only what could not be known before the merge.

## 1. What was merged, verified and recorded

| Item | Value |
|---|---|
| Pull request | **#471** — "IID-4 — holding disposition (IID-02): engine, persistence integration, read transport" |
| PR state | `merged: true`, merged at `2026-11-05T20:39:08Z` |
| PR head at merge | `f21993c1db736816438eb4230a37198a4c661acd` |
| **Merge commit** | **`bc0de0ea9702a4b6a34138db4fbe9ec81bc0f688`** |
| Merge base | `main` |
| CI run (PR) | **`42105059021`** — conclusion **`success`**, event `pull_request`, head `f21993c1…`, created `2026-11-05T20:37:08Z` |
| Check run on the merge commit | `Typecheck · Test · Build` — conclusion `success` |
| Commit verified by execution | `bc0de0ea9702a4b6a34138db4fbe9ec81bc0f688` (fresh clone of `main`, default branch) |

The reported short hash `bc0de0e` is confirmed to be the merge commit of PR #471; the full SHA is
`bc0de0ea9702a4b6a34138db4fbe9ec81bc0f688`.

## 2. Fresh-clone verification against merged `main`

A clone of the repository's default branch (`main`) into a separate directory, with its own dependency installs and
its own temporary NP-04 databases — no working tree, no `node_modules`, and no generated artifact was reused from the
phase's authoring environment.

```bash
git clone --depth 1 https://github.com/ramkivs/iips-review-recovered.git <fresh-dir>
cd <fresh-dir> && git log --oneline -1          # bc0de0e Merge pull request #471 …
cd iips-platform && npm install && ./node_modules/.bin/tsc --noEmit
cd iips-platform && ./node_modules/.bin/tsx --test tests/investment/*.test.ts
cd frontend && npm install && ./node_modules/.bin/tsc -p tsconfig.investment-server.json --noEmit
cd frontend && ./node_modules/.bin/vitest run server/investment
cd frontend && ./node_modules/.bin/tsx server/investment/cli/disposition-demonstration.ts --out <dir>
```

| Check | Result |
|---|---|
| platform typecheck (`tsc --noEmit`) | **exit 0**, no diagnostics |
| platform suite | **377 / 377 pass, 0 fail** |
| frontend server typecheck (`tsc -p tsconfig.investment-server.json`) | **exit 0**, no diagnostics |
| frontend server suite | **9 files, 112 / 112 pass** |
| demonstration | **8 / 8 verification points PASS** |

These are the same counts the branch clone produced. That is the point of running them here: the merged commit
carries the phase, not a workspace.

## 3. Identity reproduction

The demonstration ran again in the fresh clone, against its own newly created database, and was compared with the run
recorded in `demo/iid4-disposition-demonstration.json`.

| Item | Result |
|---|---|
| held chain `reportKey` = `910d6db385b32e1bc470a4a37f4faaf020e2549c09b177403c0c183f56e0c7c6` | **reproduced exactly** |
| candidate chain `reportKey` = `4f68d3c3f0ad755967dbe695ec59c85b7326a1fbe25dd461b3524330500be896` | **reproduced exactly** |
| payload digest, input digest, verbs (`AVOID`, `AVOID_CANDIDATE`) | identical |
| **only difference between the two independent-database payloads** | **`companyAssessmentRef.reportId`** — the store-assigned instance identity |

`companyAssessmentRef.reportId` differs by design: instance identity is assigned by the NP-04 boundary and is not a
function of content. Everything that *is* a function of content reproduces byte for byte, which is the same finding
IID-3 recorded for assessments and IID-4 recorded for the branch clone.

## 4. What this record is careful about

- **The verified commit is `bc0de0e`, not the current `main` head.** At the time of writing, `main` is
  `6c49a065a5ae6d797f46482303e6804e478a3840` (PR #472), two commits ahead of `bc0de0e` and zero behind. Those two
  commits are documentation and evidence only: the compare shows changes under `docs/integration/`,
  `evidence/integration/` and the master tracker, with **no file under `iips-platform/` or `frontend/`**. The code
  paths this verification exercises are therefore unchanged by them — but the claim made here is a claim about
  `bc0de0e`, verified by execution, and about `6c49a06` only by that file-level argument. Re-running the commands
  against a later `main` would replace this paragraph, not extend it.
- **No logs are invented.** Raw output for the phase is in `logs/`; the demonstration record is in `demo/`. This
  document adds no captured console output of its own, because the run it describes predates it.
- **Nothing new was verified today.** If a reader needs the results re-established, run the commands in §2; this file
  will then be superseded rather than edited.

## 5. Scope boundaries of this closeout

This record is an evidence-durability closeout and nothing else: no implementation, test, API, architecture, roadmap
sequencing or IPD change accompanies it.

- **Limitations unchanged.** `L-001` … `L-016` and `L-017` … `L-027` are exactly as the register holds them — no
  entry closed, no status improved, no numbering moved.
- **`L-014` remains `OPEN`.** It is not resolved by this record and remains a prerequisite decision before IID-5's
  scheduled refresh and historical comparison.
- **IID-5 (change intelligence / ★M-2) — NOT STARTED. IID-6 (product surface / ★M-3) — NOT STARTED.** Neither phase
  has any implementation, stored artifact, route or UI, and this closeout started neither.
