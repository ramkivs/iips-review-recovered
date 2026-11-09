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

Because the tarball content is identical, the two `integrity` values in
`frontend/package-lock.json` remain **correct without regeneration**, and the advance changes no
consumed byte. The dependency is re-pointed to the revision IPD publishes as `main`; the code IRR
runs is byte-for-byte what it already ran.

## 3. What changed

| File | Change |
|---|---|
| `frontend/package.json` | **both** aliases `58fc8fb…`/`73768fa…` → `709fd13…` → `d5e20c15…` (each alias advances exactly one step) |
| `frontend/package-lock.json` | root specs + both `resolved` URLs → `d5e20c15…`; `integrity` **unchanged** (§2) |
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

- `npm ci` (lockfile-exact) — see §6.
- `npm run build:broker-import` — PASS; 204 published files materialized from the pin's own
  published output; no IPD source recompiled.
- `npm run typecheck`, `typecheck:replay-server`, `typecheck:investment-server` — PASS.
- `npm run build` — PASS.
- Targeted Broker Import suite — PASS.
- Full `npm run test:ci` — PASS.
- Dependency resolution asserted directly: both aliases resolve to `d5e20c15…` in `package.json`,
  the lockfile root and both lockfile `resolved` URLs.

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
