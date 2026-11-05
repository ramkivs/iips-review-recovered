# IID-3 — independent verification record

**Date:** 2026-11-06 · **Branch:** `arena/e56fe593-iips-review-recovered` · **Pull request:** #464
**Local head verified:** `e627727` (feature commit) → merged with `origin/main` as `8fd1c2b`
**Remote head verified:** `8fd1c2b2db75fc83040c1ef35169826c976b1f43` — a **fresh clone fetched from
`github.com/ramkivs/iips-review-recovered`**, not the working tree that produced the evidence.

This file records what was checked *outside* the authoring checkout, so a reader can separate "the author ran the
suites" from "an independent copy of the published commit reproduces the same identities".

---

## 1. Merge with `origin/main` (PR #462 landed while IID-3 was in review)

`origin/main` advanced from `34c8b39` (the IID-2 base) to `a9329dd` (WS-A owner-evidence reset, PR #462), then to
`26256e7` (PR #463). The merge produced exactly one conflict, in `docs/OPERATOR_RUNBOOK.md`, because both branches
appended a section numbered 13:

- kept `origin/main`'s **§13 — Effective owner-controlled offline active-evidence reset (2026-11-06)** in place;
- renumbered the IID-3 section to **§14 — Investment assessment artifacts (IID-3)** (subsections 14.1–14.5).

No prose, command, table or cross-reference inside either section changed, and no source, test, route, register,
pin or evidence file differs from either side. `gh pr view 464` reports `mergeable: MERGEABLE`,
`mergeStateStatus: CLEAN`.

**Code overlap with #462:** none. `git diff --name-only 34c8b39 origin/main` touches only
`frontend/server/broker-import/**` (the owner-evidence-reset implementation) plus docs/evidence; IID-3 adds
`frontend/server/investment/**`, `iips-platform/src/investment/artifacts/**`, `frontend/src/api/investment.ts`,
`frontend/src/features/investment/**` and edits `routes.ts` / `App.tsx` / `executive-transport.ts` /
`server/reports/persistence.ts`. No merged file was co-edited.

## 2. Remote continuous integration

| Run | Workflow | Result |
|---|---|---|
| `42096525519` (job `127487894480`) | `CI` — Typecheck · Test · Build, on PR #464 head | **pass**, 1m28s |

`.github/workflows/ci.yml` is scoped to `frontend/**` (CV-42): it typechecks `frontend/tsconfig.json`, runs the full
Vitest suite behind a zero-test guard, asserts the Stage-A replay-server closure typecheck and builds the client.
It does **not** run `iips-platform`'s own suites — those are verified locally (below) and are not claimed as CI-gated.

## 3. Fresh clone — counts

Clone: `git clone -b arena/e56fe593-iips-review-recovered https://github.com/ramkivs/iips-review-recovered.git`
at `8fd1c2b2…`. Dependencies were restored from the sandbox's saved `frontend` dependency tree (see §5); the
`iips-platform` tree is the ordinary checked-out one.

| Check | Command | Result |
|---|---|---|
| IID-3 frontend suites | `vitest run server/investment src/api/investment.test.ts src/features/investment` | **7 files / 76 tests pass** (55 + 13 + 8) |
| NP-04 read-path regression | `vitest run server/reports` | **9 files / 130 tests pass** |
| Investment server typecheck | `tsc -p tsconfig.investment-server.json` | **clean** |
| Platform investment suites | `tsx --test tests/investment/*.test.ts` | **286 / 286 pass** |
| Platform regression | `tsx --test tests/regression/*.test.ts` | **651 / 651 pass** |
| Platform typecheck | `tsc --noEmit` | **clean** |

The platform regression run (651 tests, including all four NP-12 suites: A9 runtime 45, screen definition 35,
screen producer 45, sector reference population 42 = 167) is reported here in full because the authoring sandbox's
*partial* clone could not satisfy the A13 git-control tests; see §5, item 2.

## 4. Fresh clone — same identities (M-1 re-executed, not re-copied)

The demonstration was **re-run** in the fresh clone into a new directory, then compared field by field with the
committed `m1-demonstration.json`:

| Field | Committed | Fresh clone | Same |
|---|---|---|---|
| `issuerId` | `IN:EQISIN:IN0000000201` | identical | ✅ |
| `scopeToken` | `co:IN:EQISIN:IN0000000201` | identical | ✅ |
| `reportKey` (chain) | `fcf992e0a1316001059cac7caa21335938f2b63b25c986dfb7c50e8cfc376d2f` | identical | ✅ |
| v1 `payloadDigest` | `ecc09e630d16af39…` | identical | ✅ |
| v1 `inputDigest` | `sha256:c74226fe7db45…` | identical | ✅ |
| v2 `payloadDigest` | `7e97edcff33583e7…` | identical | ✅ |
| v2 `inputDigest` | `sha256:086259792a77c…` | identical | ✅ |
| `clock` (`v1`,`v2` generation timestamps) | `2026-11-06T00:00:00.000Z`, `…00:05:00.000Z` | identical | ✅ |
| `verification` (10 points), `independentReads`, `corruption`, `boundaryUnavailable`, `mutatingRoutes`, `sanitization`, `limitationsConfirmed` | — | byte-identical JSON | ✅ |
| `runs[*].reportId` | `ee7b4185-…`, `747142cb-…` | `18978a1c-…`, `6a5f950c-…` | ⚠️ **differs — as designed** |

`reportId` is the store-assigned row identity; it is *not* derived from content, and the chain identity
(`reportKey`) plus both content digests reproduce exactly. That is the property the design claims, observed twice in
two independent checkouts. All ten verification points re-passed in the clone, including the separate-process read,
the `UNCHANGED` re-run, the v2 append, the byte-identical v1, the corrupted-chain `503
investment-artifact-integrity-failure`, the sanitized static `503` and the 8/8 `405` mutating-route sweep.

## 5. Environment facts a future verifier needs (not product limitations)

Neither of these is a defect in IID-3, and neither is written into the limitation register as a product claim:

1. **The NP-04 dependency must be a real directory, not a symlink.** `node_modules/iips-np04-governed-persistence`
   resolves to the sandbox's locally built `np04-shim` (`"version": "1.0.0-sandbox-build"`, a compile of
   `iips-production-market-data@2e11fa3b`; upstream `dist/` is gitignored, so it is never in a clone). If that entry
   is a **relative symlink**, Vite resolves the realpath *outside* `node_modules`, treats the package as project
   source, transforms its `import { DatabaseSync } from 'node:sqlite'`, and fails with `Failed to load url sqlite`
   in every suite that reaches the store. Copied as a real directory, the package is externalized and Node resolves
   `node:sqlite` natively — 76/76 pass. The empirical matrix (symlink → 4 files fail to load; real dir → 76/76) is
   why §3's counts were reproduced only after fixing the shape, and it is recorded here so a verifier does not
   mistake it for an IID-3 break.
2. **The authoring sandbox clone is partial.** `np12-n4-screen-producer.test.ts`'s A13 git-control tests run
   `git rev-parse`/`read-tree` against pinned commit `5ca181c7564a063a01265efdfdc5996563888d49`, which the sandbox
   clone did not contain: 30 failures, all `fatal: ambiguous argument` / `failed to unpack tree object`. After
   `git fetch origin 5ca181c7…` the same file reports **45/45**, and the whole regression directory **651/651**. The
   fresh clone (full history) never showed the failures. No test, assertion or pin was changed for this.
3. **Still unrunnable here — pre-existing, unrelated:** `src/app/App.test.tsx` and most of
   `server/broker-import/**` import `../../.cache/broker-import/…`, a materialisation of
   `iips-production-market-data` that has never existed in this environment (4 files load fine, 7 fail on the
   missing path; `vitest run server/broker-import` → 72 tests pass, 7 files fail to collect). Unchanged by IID-3:
   `git diff 34c8b39 HEAD -- frontend/src/api/brokerHoldingsPreview.ts` is empty.

## 6. What this record does **not** claim

- It is not independent human review; it is the same agent re-running the published commit in a fresh clone.
- A green `CI` run is not qualification, admission or release (the workflow says so itself), and it does not cover
  `iips-platform` or the investment server typecheck.
- No real issuer was assessed (`L-009`); the assessment is synthetic (`L-004`). The identities above are stable
  *for this synthetic input*, which is what the M-1 demonstration claims.
- The merge conflict resolution in §1 is documentation-only and was not independently re-reviewed.
