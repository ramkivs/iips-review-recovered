# IRR Broker Import dependency alignment — IPD PR #146 (`d5e20c15`)

**Date:** 2026-11-09. **Type:** additive dependency integration/verification receipt, not a PA act or
qualification.
**IRR starting `main`:** `7a330588df8e4ef3dc6ef5d948366bd101931d39` (includes PRs #535, #536).
**Authoritative IPD `main`:** `d5e20c15059267a3f824b015e37d652084de5a01` (merge commit of IPD PR
#146). **Supersedes** `WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR145-2026-11-09.md`.

## 1. Finding: the PR #537 pin predated the Stage 4 composition root

PR #537 advanced both aliases to `709fd13c77e90df05900859d23ba57d1004197a0` — the merge commit of
IPD PR #145 — and stated that this revision "carries … the Stage 4 identity-qualification
implementation".

Re-derived from the authoritative remote history, that statement is **only half true** for the
surface this PR claimed to align:

| Claim in PR #537 | Verified at `709fd13` |
|---|---|
| carries the D05 authenticated universe (2,390) | **TRUE** |
| carries the Stage 4 identity-qualification *service* (`src/providers/dhan/dhan_security_identity_service.ts`) | **TRUE** |
| carries the Stage 4 **composition root** (governed P04/P7 wired into the shipped consumer) | **FALSE** |

At `709fd13`, `src/ipc/entrypoint.ts:127` is still:

```ts
const brokerImportConsumer = createBrokerImportConsumer(db);
```

— invoked **without** `securityMaster` / `registry`, i.e. the exact pre-Stage-4 gap that IPD Stage 4D
closed. `src/ipc/brokerImportComposition.ts`, `src/persistence/localSingleUserAuthorization.ts` and
`src/ui/brokerImportApplicationPath.ts` **do not exist** at `709fd13`:

```
src/ipc/brokerImportComposition.ts                  ABSENT in 709fd13   PRESENT in d5e20c15
src/persistence/localSingleUserAuthorization.ts     ABSENT in 709fd13   PRESENT in d5e20c15
src/ui/brokerImportApplicationPath.ts               ABSENT in 709fd13   PRESENT in d5e20c15
```

`d5e20c15…` (IPD PR #146, head `566a99b…`) is therefore the **first** IPD `main` revision that
carries Stage 4 composition *and* the explicit local single-user durable-write authorization. The
aliases are advanced to it.

## 2. Compatibility: the advance is provably byte-neutral

PR #146 adds runtime modules. None of them is reachable from the `./portfolio-ui` closure, so the
published package is unchanged. This was verified empirically rather than assumed — both revisions
were checked out, built with the same toolchain, and compared:

| Check | Result |
|---|---|
| Published module inventory (`dist/package`) | **102 files in both revisions — identical set** |
| Byte diff of the whole published tree | **empty** |
| Publication-manifest entries re-verified (bytes + SHA-256) | **204 / 204 match** |
| `npm pack --ignore-scripts` tarball SHA-256 | **identical** — `8adc9d9c353ea9682f464a26ee08d26463f7c9810a949d09fafae605d8b380fb` |
| npm tarball SHA-512 SRI | **identical** — `sha512-GwA4k/tHEtc5z6uY2J0/BVOuw/HQfV1vPVax9XrEmQpKJR7SvbOWD5eLAmvgvbJ4Wj/sqO+D59FHk8QlvF4NOg==` at `73768fa…`, `709fd13…` and `d5e20c15…` |

Because the tarball content is identical, the `integrity` value is the **same** for every revision
from `73768fa…` onwards, and the advance changes no consumed byte. The dependency is re-pointed to
the revision IPD publishes as `main`; the code IRR runs is byte-for-byte what it already ran.

`frontend/package-lock.json` therefore records the verified value for **both** IPD aliases:

| Lockfile entry | `resolved` | `integrity` |
|---|---|---|
| `node_modules/iips-broker-import` | `…iips-production-market-data.git#d5e20c15…` | `sha512-GwA4k/tHEtc5z6uY2J0/BVOuw/HQfV1vPVax9XrEmQpKJR7SvbOWD5eLAmvgvbJ4Wj/sqO+D59FHk8QlvF4NOg==` |
| `node_modules/iips-production-market-data` | `…iips-production-market-data.git#d5e20c15…` | `sha512-GwA4k/tHEtc5z6uY2J0/BVOuw/HQfV1vPVax9XrEmQpKJR7SvbOWD5eLAmvgvbJ4Wj/sqO+D59FHk8QlvF4NOg==` |
| `node_modules/iips-np04-governed-persistence` | `…iips-production-market-data.git#2e11fa3b…` | unchanged (out of scope, NP-04) |

The `iips-broker-import` entry previously carried the historical `sha512-Kum3z9…` value, which is
the SRI of the retired `58fc8fb…` archive (273,710 B / 153 entries / 4 exports), not of the aligned
d5 archive (513,537 B / 205 entries / 5 exports). It was corrected to `GwA4…` in the reconciliation
commit recorded in §7. Note that npm 10.9.8 emits `skipping integrity check for git dependency` on
`npm ci`, so a green install is **not** by itself proof that a lockfile SRI is valid; the value is
established from the packed artifact, not from the install.

## 3. What changed

| File | Change |
|---|---|
| `frontend/package.json` | **both** aliases `58fc8fb…`/`73768fa…` → `709fd13…` → `d5e20c15…` (each alias advances exactly one step) |
| `frontend/package-lock.json` | root specs + both `resolved` URLs → `d5e20c15…`; `integrity` = `GwA4…` on **both** IPD aliases (§2) |
| `frontend/broker-import-package-profile.json` | `aliasCommit` / `aliasSpecifier` → `d5e20c15…`; provenance → PR **#146**; supersession chain retained |
| `frontend/broker-import-publication-manifest.json` | `commit` → `d5e20c15…`; **204-entry inventory unchanged** (§2) |
| `frontend/tsconfig.broker-import.json` | pin comment → PR #146 |
| `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` | `EXPECTED_IPD_PIN_SHA` → `d5e20c15…`; new `SUPERSEDED_IPD_PR145_PIN_SHA` rollback guard |
| `frontend/server/market-data/*.ts`, `frontend/src/api/brokerHoldingsPreview.ts` | contract-provenance comments only — **no logic change** |
| `frontend/server/**/*.test.ts` | pinned-SHA expectations → `d5e20c15…` |

The `iips-np04-governed-persistence` alias is **unchanged** at
`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; it is a deliberately distinct persistence contract and
is out of scope for this alignment.

## 4. Validation

All commands were run in `frontend/` at the reconciled head (Node `v22.22.3` / npm `10.9.8`, the
toolchain recorded for V2–V4 and used by `.github/workflows/ci.yml`).

| Check | Command | Result |
|---|---|---|
| Lockfile-exact install | `npm ci --no-audit --no-fund` | **PASS** — 190 packages; no dependency moved |
| Alias materialization | `npm run build:broker-import` | **PASS** — 204 published files materialized from the pin's own published output; no IPD source recompiled |
| Client typecheck | `npm run typecheck` (`tsc --noEmit`) | **PASS** |
| Replay-server closure | `npm run typecheck:replay-server` | **PASS** |
| Investment-server closure | `npm run typecheck:investment-server` | **PASS** |
| Production build | `npm run build` (`tsc -b && vite build`) | **PASS** |
| Targeted suite (broker-import, market-data, reports, user-portfolio, `src/api`) | `vitest run …` | **PASS** — 36 files / 616 tests, 0 failed |
| Full suite | `npm run test:ci` | **PASS** — 2455 passed, 1 skipped, 0 failed (176 files passed, 1 skipped) |
| Zero-test / false-green guard | `node .ci/assert-tests.js .vitest-report.json` | **PASS** — 177 files, 2456 tests, 0 failed |
| Dependency resolution | `package.json`, lockfile root, both `resolved` URLs | both aliases → `d5e20c15…`; NP-04 unchanged at `2e11fa3b…` |
| Publication inventory | recomputed from the installed package | `fileCount` **204**, `packageJsonSha256` `af7d0d49…`, `publishedInventorySha256` `77ad6875…` — all equal to `broker-import-publication-manifest.json` |
| Dual-alias byte equality | `diff -r` of both installed `dist/package` trees | **identical**; both `package.json` SHA-256 = `af7d0d49…`, so one SRI value correctly covers both aliases |
| Materialized bytes | `diff -r .cache/broker-import` vs installed `dist/package` | **identical** (only IRR's own materialization manifest is extra) |

Sandbox note (not a CI need): this verification environment intercepts TLS, so `npm ci` required
`NODE_EXTRA_CA_CERTS` for `codeload.github.com`. Hosted runners resolve the same public commits
anonymously, which is why `ci.yml` carries no token, mirror or CA override.


## 5. Boundaries

IRR only. The IPD repository was inspected **read-only** via the GitHub API and a read-only clone;
no IPD branch, PR, commit, file or working tree was created or modified. No broker-import feature
change, no identity-mapping, fixture or governance change, no runtime fence, operational database,
provisioning, saved-holdings write, host qualification, QE, Gate 4 acceptance, Gate 5/D06 admission
or production activation. No production work and no production acceptance claim.

## 6. Superseded facts

`docs/integration/WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR127-2026-11-05.md`,
`…PR128-2026-11-05.md`, `…PR131-2026-11-06.md` and `…PR145-2026-11-09.md` remain as their dated
snapshots. This receipt supplies the current dependency currency; it does not rewrite their dated
records.

## 7. Conflict reconciliation against IRR `main` `53072548` (PR #538) and the lockfile correction

PR #537 was `DIRTY`/`CONFLICTING` against `main` `53072548…` (the PR #538 merge). The three
conflicted paths are resolved here by reconciling the two branches' *assertions*, not by choosing a
side:

| File | Conflict | Reconciliation |
|---|---|---|
| `frontend/server/broker-import/brokerImportEvidenceRestart.test.ts` | `main` derives the split from the live preview (`expectedCounts`); PR #537 hard-coded `3`/`65` | **Both retained.** The counts are compared against `expectedCounts` (the live pipeline's own outcome, which is the actual assertion of a restart test) **and** the derived values are pinned to `3`/`65`, so a silent regression to the legacy Wave-1 corpus (`1`/`67`) still fails |
| `frontend/server/broker-import/brokerImportEvidenceStore.test.ts` | three blocks: retained counts, unresolved length, quarantine inventory | **Both retained.** `PINNED_RESOLVED` / `PINNED_UNRESOLVED` are used everywhere `main` uses them, and `PINNED_UNRESOLVED` is pinned to `65` (inventory `130`) so the retention leg cannot drift with the master |
| `frontend/src/api/brokerHoldingsPreview.test.ts` | five blocks: `identityAuthority.entities`, the 68-row counts, the aggregate/`masterRevision`, GHCL+KROSS resolution, refusal codes | **Both retained.** Values stay derived from `INSTALLED_MASTER` (so neither branch's master state is asserted against the other's numbers) and are additionally pinned to IPD's published outcome: `entities` 2,390, resolved `['AGI GREENPAC','GHCL','KROSS']`, unresolved `65`, `masterRevision` `BATCH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-2026-11-08-001:b555fd28…` |

The PR #538-side `INSTALLED_MASTER`/`expectedCounts` derivation and the PR #537-side authoritative
numbers are both preserved; nothing from either branch's coverage was dropped. The §9-A ISIN-scoped
`65/3` reassessment remains explicitly excluded as an outcome of the name-only summary CSV.

**Lockfile integrity correction.** `frontend/package-lock.json` recorded `sha512-Kum3z9…` for
`iips-broker-import` — the SRI of the retired `58fc8fb` archive — while
`iips-production-market-data` already recorded the verified d5 value. Both IPD aliases now record

```
sha512-GwA4k/tHEtc5z6uY2J0/BVOuw/HQfV1vPVax9XrEmQpKJR7SvbOWD5eLAmvgvbJ4Wj/sqO+D59FHk8QlvF4NOg==
```

which is the SRI the d5 archive actually yields (§2). `iips-np04-governed-persistence` is untouched.

**Also completed in this reconciliation:** the stale duplicated paragraph in
`frontend/broker-import-package-profile.json` (which repeated the export-count rationale and still
said `four-subpath` for a five-subpath map) is corrected to a single, current statement; and the
IPD-provenance comments in `frontend/server/market-data/dhan{HealthState,IdentityTransport,MarketDataRoute,MarketDataTransport}.ts`,
`dhanMarketDataRoute.test.ts` and `frontend/src/api/brokerHoldingsPreview.ts` now name IPD **PR #146**
(the revision actually pinned) instead of PR #145.

## 8. Boundary restated after reconciliation

This remains a **dependency/package-consumer** change. The `d5e20c15…` package publishes the same
five subpaths and the same 204-entry `dist/package` inventory as `709fd13…`; the IPD PR #146
application-runtime modules (`src/ipc/brokerImportComposition.ts`,
`src/persistence/localSingleUserAuthorization.ts`, `src/ui/brokerImportApplicationPath.ts`) are **not
in the packed artifact** and are not delivered to IRR by this pin. No IRR application-runtime
integration is claimed or performed, no NP-04 pin moves, and no broker-import feature, identity
mapping, fixture, governance decision, runtime fence, operational database, provisioning, saved
holdings write, host qualification, QE, Gate 4 acceptance, Gate 5/D06 admission or production
activation is part of this change.
