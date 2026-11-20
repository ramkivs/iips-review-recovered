# IRR Broker Import — package pin advance to MERGED IPD main (`12a3d625`)

**Date:** 2026-11-19. **Type:** dependency pin advancement receipt (governance record, not a PA act).

**Old pin:** `9d03a35b4d4d79972c466c2c8e45e8c9270524d4` — the IPD PR #178 **head**, i.e. an unmerged pull
request. `broker-import-package-profile.json` carried `sourcePullRequestState: "OPEN_NOT_MERGED"` and an
explicit caution that the pin tracked an open PR.

**New pin:** `12a3d625d0ad603cb0bd9cea46bae314942ee40f` — the **merge commit** of IPD PR #178, now on IPD
`main`.

The pin now tracks merged, published IPD `main` rather than an unmerged PR branch. This closes the
standing caution in the previous receipt and is the outcome that receipt's §6 named as the
available-but-untaken alternative.

## 1. IPD merge verification (read-only, independent)

| Check | Result |
|---|---|
| PR #178 state before merge | `OPEN`, base `main`, head **exactly** `9d03a35b4d4d…` as expected |
| Mergeability | `MERGEABLE`, `mergeStateStatus: CLEAN` |
| Required checks | **all green** — `typecheck · build · test` pass (5m15s), `journal (ubuntu-latest)` pass, `journal (windows-latest)` pass, `executed test count` pass |
| PR diff | exactly **6** files, no migrations, no D05, no P7 manifest |
| Merge method | **merge commit**, explicitly not squash |
| Merge author / time | `ramkivs`, `2026-11-19T12:13:02Z` |
| Merge commit | `12a3d625d0ad603cb0bd9cea46bae314942ee40f` |
| Parents | `1eacb7a694bc1360115d633a7b74fc26ca4a6206` (IPD main) + `9d03a35b4d4d79972c466c2c8e45e8c9270524d4` (PR head) |
| Remote `main` after merge | `git ls-remote` → `12a3d625d0ad603cb0bd9cea46bae314942ee40f` |

The original implementation commit `9d03a35b` is preserved as a parent, so IPD history remains intact.

### Tree equality (why published artifacts could not change)

```
$ git rev-parse 9d03a35b^{tree} 12a3d625^{tree}
89c14d48a3ab48b772bd59a9a3903b2c4e2f278d
89c14d48a3ab48b772bd59a9a3903b2c4e2f278d
```

The merge commit's tree is **byte-identical** to the PR head tree. The pin advance therefore changes the
*pinned identity* (unmerged PR → merged main) without changing a single published artifact, confirmed
empirically in §3.

## 2. Pin changes

| File | Change |
|---|---|
| `frontend/package.json` | `iips-broker-import` specifier → `…iips-production-market-data#12a3d625…` |
| `frontend/package-lock.json` | root dependency spec **and** the single `resolved` URL → `12a3d625…` |
| `frontend/broker-import-package-profile.json` | `aliasCommit` / `aliasSpecifier` → `12a3d625…`; provenance now `sourcePullRequestState: "MERGED"` with `mergeCommit` and `mergeVerification`; the `OPEN_NOT_MERGED` caution removed |
| `.ci/verify-ipd-pins.mjs` | expected `iips-broker-import` commit → `12a3d625…` |
| `frontend/broker-import-publication-manifest.json` | `commit` → `12a3d625…` (**only** this line) |
| `frontend/tsconfig.broker-import.json` | header comment updated (was "OPEN, not yet merged to IPD main") |
| `frontend/server/broker-import/brokerImportStage4.ts` | header comment updated to the merged pin |
| `frontend/server/broker-import/brokerPartialAcceptanceContract.ts` | provenance header re-verified against `12a3d625`; see §4 |

`iips-np04-governed-persistence` (`2e11fa3b…`) and `iips-production-market-data` (`1ce6a829…`) are
**unchanged** — deliberately, and independently verified:

```
$ node .ci/verify-ipd-pins.mjs
Verified iips-broker-import at 12a3d625d0ad603cb0bd9cea46bae314942ee40f
Verified iips-np04-governed-persistence at 2e11fa3b689d1a3674a5e4ba1f1de9a559e20494
Verified iips-production-market-data at 1ce6a829a7ce65550356a0071c108a60f2d813be
```

## 3. Materialization verification

Installed from the committed lockfile with `--ignore-scripts` (no build of IPD source), then:

```
$ node scripts/materialize-broker-import.mjs
broker-import alias 12a3d625d0ad603cb0bd9cea46bae314942ee40f materialized:
214 published files -> .cache/broker-import (published build output; no IPD source recompiled)
```

The publication manifest was re-verified against the freshly installed bytes (every file's `bytes` and
`sha256`, the sorted inventory digest, the `package.json` hash, and the exports map):

| Field | Old pin | New pin | Identical |
|---|---|---|---|
| `fileCount` | 214 | 214 | ✅ |
| `packageJsonSha256` | `39112f6a553b03b4…` | `39112f6a553b03b4…` | ✅ |
| `publishedInventorySha256` | `3fd2efaa51e5b49b…` | `3fd2efaa51e5b49b…` | ✅ |
| per-file `bytes` + `sha256` | — | — | ✅ all 214 |
| `exports` map | — | — | ✅ |

The manifest diff is exactly one line (`"commit"`). Every published byte is unchanged — the expected
consequence of the identical trees in §1.

### Required content present in the materialized package

| Required | Verified in `.cache/broker-import/src/contracts/broker_import_ipc.d.ts` |
|---|---|
| Partial-acceptance IPC contract | `BrokerImportRequest.importId?`, `.fullSnapshot?`, `.partialAcceptance?: BrokerPartialAcceptanceApproval` ✅ |
| Approval and assessment-digest types | `BrokerPartialAcceptanceApproval { approved; approvedAt; approvedBy; summaryDigest }` ✅ (digest also on `BrokerPartialAcceptanceSummary`) |
| Snapshot-state and unresolved-row types | `type BrokerSnapshotState = 'ACCEPTED' \| 'PARTIALLY_ACCEPTED'`; `interface BrokerSnapshotUnresolvedRow` ✅ |
| Required daily holding fields | `BrokerDailyFields { dpQty?; availableQty?; profitLoss?; pnlPercentage? }` ✅ |

## 4. Contract-mirror disposition: **KEPT** (replacement is not safe)

`frontend/server/broker-import/brokerPartialAcceptanceContract.ts` was re-examined and **retained**. The
published IPD types are now *available* (`./portfolio-ui` exports all of them), all six shared types are
field-for-field identical to the mirror, and the "if compatible, replace it" condition therefore looked
satisfied — but it is not, and the failure is reproducible.

**The reason is a TypeScript Package-ID collision, not a content difference.** All three aliases declare
the identical `name`/`version` (`iips-production-market-data@1.0.0`), because they are the same published
package at different commits. TypeScript computes a Package ID from that name@version alone, not from the
npm alias directory. Verified on 2026-11-19 at the merged pin:

```
$ tsc --traceResolution …
Module name 'iips-broker-import/portfolio-ui' was successfully resolved to
'…/node_modules/iips-broker-import/dist/package/src/ui/portfolio_ui_package.d.ts'
with Package ID 'iips-production-market-data/dist/package/src/ui/portfolio_ui_package.d.ts@1.0.0'.
```

A NEW-alias import on its own works. But in any program that *also* imports
`iips-production-market-data/portfolio-ui` — unavoidable, because `brokerImportStage4.ts` imports the base
`BrokerImportRequest`/`BrokerImportSuccess` from that older pin — the new import is served the **older**
declarations:

```
error TS2305: Module '"iips-broker-import/portfolio-ui"' has no exported member
              'BrokerPartialAcceptanceApproval'.
error TS2339: Property 'snapshotState' does not exist on type 'BrokerImportSuccess'.
error TS2339: Property 'reconciliation' does not exist on type 'BrokerImportSuccess'.
```

That is precisely the failure mode the previous round documented, unchanged by the pin advance, because
the collision is between `iips-broker-import` and `iips-production-market-data`, not between a merged and
an unmerged commit. Replacing the mirror would break the build.

**The root fix is available but not authorised, so it was not taken:** advancing
`iips-production-market-data`'s own separately-governed pin to `12a3d625` would collapse the two commits
and remove the collision. That pin is consumed far more broadly than broker-import and is verified by name
in `.ci/verify-ipd-pins.mjs`; changing it is a materially larger decision that this task's scope
("advance the existing broker-import package pin") does not cover.

What was done instead: the mirror's provenance header now records the merged pin, the identical tree, the
re-verified field-for-field equality, and the re-reproduced collision evidence with the concrete `tsc`
errors, so the next reviewer does not have to rediscover why the duplicate exists. No mirror field
changed (none needed to — the trees are identical). `BrokerImportSuccessWithSnapshot` remains
IRR-authored: it has no published counterpart and is the IRR-side composition of the additive optional
success fields.

## 5. Verification performed

| Check | Result |
|---|---|
| `node .ci/verify-ipd-pins.mjs` | all three pins verified (`iips-broker-import` at `12a3d625`) |
| `tsc --noEmit` (`tsconfig.json`) | clean |
| `tsc -p tsconfig.replay-server.json --noEmit` | clean |
| `tsc -p tsconfig.broker-import.json` | clean |
| `npm run build` | pass (incl. browser-bundle security gate) |
| Broker Import suite | **441 passed / 441** (22 files) |
| Full suite (`test:ci`) | **3219 passed, 1 skipped, 0 failed** (3220 tests, 220 files) |
| `.ci/assert-tests.js` guard | OK — 0 failed |

## 6. Scope boundaries honoured

No IPD repository writes. No portfolio import or portfolio data modification. No D05 or P7 change. No
redesign of PR #177 persistence or the completed PR #601 workflow. No unrelated cleanup (a pre-existing
test rewrites `evidence/iid/…/zero-socket-*.json` with fresh timestamps and ephemeral ports on every run;
that churn was reverted, not committed). The IRR PR is not merged.

---

## 7. Post-merge verification and closeout (PR #602) — added 2026-11-20

> **Scope of this section.** §1–§6 above are the **original pre-merge validation receipt**, preserved
> verbatim and **not** re-asserted here. This section is a **documentation-only post-merge closeout**
> recording the verified state of `main` after the IRR PR merged. It re-verifies *merge state and pin
> identity only*; it does **not** re-run the test suite and makes **no** claim about test outcomes.
> The single statement in §6 that this section supersedes is "The IRR PR is not merged."

### 7.1 Merge verification (independent, read-only)

| Check | Verified result |
|---|---|
| PR | **#602** — "Advance Broker Import dependency pin to merged IPD main" |
| PR state | `closed`, **`merged: true`**, `merged_at 2026-11-20T05:37:19Z`, `merged_by ramkivs`, base `main` |
| Source branch | `arena/pin-ipd-main-12a3d625-current-main` (still advertised on `origin`) |
| **Candidate (PR head) commit** | `e636fb3bb998cfd875da9b41b188da1b1020175b` |
| **Actual merge commit** | `a5476ca64ed7afc62fa8c0d9ead67795ba8850af` — *distinct from the candidate SHA; not assumed equal* |
| Merge commit in `origin/main` | yes — `a5476ca` **is** the current `origin/main` tip |
| Merge topology | true **two-parent merge**: `parent1 = 1a0e3fc7a843b199c3baecb4f4e617172d802d58` (prior `main`), `parent2 = e636fb3b…` (candidate) |
| Candidate ancestry | `git merge-base --is-ancestor e636fb3b… origin/main` → **ANCESTOR=YES** |

Evidence:

```
$ gh api repos/ramkivs/iips-review-recovered/pulls/602 \
    --jq '{merged,merge_commit_sha,head_sha:.head.sha,head_ref:.head.ref,base_ref:.base.ref,merged_at,changed_files}'
{"merged":true,"merge_commit_sha":"a5476ca64ed7afc62fa8c0d9ead67795ba8850af",
 "head_sha":"e636fb3bb998cfd875da9b41b188da1b1020175b",
 "head_ref":"arena/pin-ipd-main-12a3d625-current-main","base_ref":"main",
 "merged_at":"2026-11-20T05:37:19Z","changed_files":9}

$ git rev-parse a5476ca64ed7afc62fa8c0d9ead67795ba8850af^1 a5476ca64ed7afc62fa8c0d9ead67795ba8850af^2
1a0e3fc7a843b199c3baecb4f4e617172d802d58
e636fb3bb998cfd875da9b41b188da1b1020175b

$ git merge-base --is-ancestor e636fb3bb998cfd875da9b41b188da1b1020175b origin/main && echo ANCESTOR=YES
ANCESTOR=YES
```

### 7.2 Nine-file scope confirmation

`git diff --name-only 1a0e3fc…a5476ca` (main before → after) yields **exactly nine files**, matching the
approved set with no extras and none missing; the PR #602 API file list and the candidate commit's own
diff (`e636fb3^1..e636fb3`) agree:

1. `.ci/verify-ipd-pins.mjs` (modified)
2. `docs/integration/WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-MAIN-2026-11-19.md` (added — this record)
3. `frontend/broker-import-package-profile.json` (modified)
4. `frontend/broker-import-publication-manifest.json` (modified)
5. `frontend/package-lock.json` (modified)
6. `frontend/package.json` (modified)
7. `frontend/server/broker-import/brokerImportStage4.ts` (modified)
8. `frontend/server/broker-import/brokerPartialAcceptanceContract.ts` (modified)
9. `frontend/tsconfig.broker-import.json` (modified)

Totals: `+240 / −45`, `changed_files: 9`.

### 7.3 Dependency alias verification in the merged tree (`a5476ca`)

All three aliases verified at their required final states, cross-checked across every pin-bearing
artifact — no pin was changed by this closeout:

| Dependency alias | Required commit | Verified in merged tree |
|---|---|---|
| `iips-broker-import` | `12a3d625d0ad603cb0bd9cea46bae314942ee40f` | ✅ `package.json` L30; `.ci/verify-ipd-pins.mjs` L14; `package-lock.json` `resolved` L2342; publication manifest `"commit"`; package profile `aliasCommit`/`aliasSpecifier` |
| `iips-np04-governed-persistence` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | ✅ `package.json` L31; verifier L15; lock `resolved` L2352 — **preserved (unchanged)** |
| `iips-production-market-data` | `1ce6a829a7ce65550356a0071c108a60f2d813be` | ✅ `package.json` L32; verifier L16; lock `resolved` L2364 — **preserved (unchanged)** |

The two non-broker-import aliases are confirmed **preserved** exactly as §2 recorded. The package profile
additionally records `supersededAliasCommit: 9d03a35b…` (the former PR-head pin), consistent with §1.

### 7.4 Pin-verification check actually run in this closeout

`node .ci/verify-ipd-pins.mjs` was **not executed** here: it asserts against the *installed* tree
(`frontend/node_modules/.package-lock.json` plus per-package `existsSync`), and the private GitHub
dependencies are not installed in this verification environment, so a run would fail for environmental
reasons unrelated to pin correctness. Instead the same manifest + committed-lockfile assertions were run
statically against the merged tree:

```
$ node /tmp/verify-pins-static.mjs   # mirrors verify-ipd-pins.mjs, installed-lock assertions skipped
STATIC-VERIFIED iips-broker-import at 12a3d625d0ad603cb0bd9cea46bae314942ee40f (package.json + committed package-lock.json)
STATIC-VERIFIED iips-np04-governed-persistence at 2e11fa3b689d1a3674a5e4ba1f1de9a559e20494 (package.json + committed package-lock.json)
STATIC-VERIFIED iips-production-market-data at 1ce6a829a7ce65550356a0071c108a60f2d813be (package.json + committed package-lock.json)
note: installed-lock/per-package existsSync assertions skipped (private deps not installed in this environment)
rc=0
```

The verifier's own hard-coded `pinned` map in the merged tree matches all three required values, so the
CI-enforced check and the committed state are consistent. §5's original `node .ci/verify-ipd-pins.mjs`
result stands as the pre-merge record and is **not** re-asserted here.

### 7.5 Explicit non-claims

- This closeout is **documentation/state verification only**. It did **not** re-run `test:ci`, the Broker
  Import suite, `tsc`, or the build, and it makes **no** claim that their results changed.
- It does **not** claim that any previously known full-suite failures were resolved. §5's figures
  (3219 passed / 1 skipped / 0 failed, etc.) are the **original** validation as recorded pre-merge and are
  carried forward unchanged, not re-verified.
- §4's contract-mirror disposition (**KEPT**, Package-ID collision) is unchanged and not revisited; the
  root fix (advancing `iips-production-market-data`'s separately-governed pin) remains **not authorised**.

### 7.6 Preservation

- The two in-progress IID evidence files were left **untouched** — blob hashes identical before and after
  this closeout: `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-control.json`
  (`1a4e82b1af2222ece0311005ad5672f4aa2bb5ec`) and `…/zero-socket-test.json`
  (`d6b09521b07da87a3b17a251c70e64c2ccf5d322`). Not staged, committed, reverted, or modified.
- No IID source, tests, evidence, or implementation was modified; IID remains a separate workstream.
- No dependency pin, IPD repository content, W05 evidence, lockfile, or unrelated IRR work was altered.
  The only change is this documentation update, made on a dedicated branch opened as a **review-only** PR
  against `main` (deliberately **not** merged).

### 7.7 Final status

**MERGED — POST-MERGE VERIFICATION COMPLETE.** Every required post-merge verification passed: PR #602
merged; merge commit `a5476ca64ed7afc62fa8c0d9ead67795ba8850af` present in `origin/main`; candidate
`e636fb3bb998cfd875da9b41b188da1b1020175b` confirmed an ancestor; exactly the nine approved files merged;
and all three dependency aliases verified at their required commits with the two non-broker-import aliases
preserved.
