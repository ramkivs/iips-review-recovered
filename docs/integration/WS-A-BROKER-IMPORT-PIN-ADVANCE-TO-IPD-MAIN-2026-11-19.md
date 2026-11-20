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
