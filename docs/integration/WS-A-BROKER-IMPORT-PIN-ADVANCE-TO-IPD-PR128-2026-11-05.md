# WS-A — IRR `iips-broker-import` pin advance to IPD PR #128

| Field | Value |
|---|---|
| Record | `IIPS-V3-WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR128-2026-11-05-01` |
| Record type | **DEPENDENCY PIN ADVANCE AND PACKAGE INTEGRATION VERIFICATION RECORD** |
| Date | `2026-11-05` (Asia/Calcutta) |
| Scope | IRR-only dependency, lockfile, package-profile, materialization and frontend startup verification |
| IPD authority | IPD PR #128 — merged; authoritative IPD `main` `07e86a4f2c105651f3097a96cb519f8611945e30`; implementation commit `a89c4e06bb6893dc0ecd00bae1bcd41d1b04cac7` |
| Superseded IRR pin | `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc` (IPD PR #127 merge commit) |
| New IRR pin | `07e86a4f2c105651f3097a96cb519f8611945e30` |
| Production admission | **NOT ADMITTED / NOT PRODUCTION-READY** |

---

## 1. Purpose and scope

Advance the IRR `iips-broker-import` alias from the IPD PR #127 merge commit `7bcae35…` to the IPD PR #128 merge commit `07e86a4…`, update the lockfile and package profile consistently, and verify that the normal IRR installation, materialization and frontend startup lifecycle consumes the published package output.

This record is IRR-only. It does not modify IPD, reopen PR #128, change NP-04 persistence, change G2/G3 ownership or contracts, introduce Reports-local persistence, recreate or modify the existing NP-06 report artifacts, or perform any production operation.

## 2. IPD evidence reused (not repeated)

- IPD PR #128 is **MERGED**; merge commit `07e86a4f2c105651f3097a96cb519f8611945e30`; implementation head `a89c4e06bb6893dc0ecd00bae1bcd41d1b04cac7`; first parent `6df748d397daf965bd5b6e6e35df5043f7fa8c4d`.
- The merged IPD work strengthened `scripts/verify-public-package.mjs` to verify the complete broker-import public package surface consumed by IRR.
- The IPD package verification established: all 18 required broker-import modules are included; both `.js` and `.d.ts` artifacts are present (36 required artifacts); the artifacts are present in the build output, packed archive, isolated installation and fresh Git-based installation; fresh Git-based installations of both `7bcae35…` and `07e86a4…` execute package preparation and produce `dist/package`; `npm run test:package-consumer` passed.

No IPD file, branch, commit, PR or package guard was modified by this record.

## 3. IRR changes

| Path | Change |
|---|---|
| `frontend/package.json` | `iips-broker-import` → `github:ramkivs/iips-production-market-data#07e86a4f2c105651f3097a96cb519f8611945e30` |
| `frontend/package-lock.json` | Root dependency and `node_modules/iips-broker-import` `resolved` updated to `#07e86a4…` (2 lines; no unrelated dependency movement) |
| `frontend/broker-import-package-profile.json` | `aliasCommit`, `aliasSpecifier`, `aliasProvenance` (PR #128, merge/head/superseded commits, record pointer) and profile comment updated |
| `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` | Comment updated to the new alias commit/PR; guard logic unchanged (it reads the profile) |
| `frontend/src/api/brokerHoldingsPreview.ts` | Comment updated to the new alias commit/PR |
| `frontend/tsconfig.broker-import.json` | Comment updated to the new alias commit/PR |
| `docs/integration/WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR128-2026-11-05.md` | This record |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | Tracker §16.251 |

The alias name, repository identity, package contract, 18-module required list, two runtime entrypoints and materialization design are preserved. No floating branch reference is used.

## 4. Package verification (actual installed package)

| Check | Result |
|---|---|
| Installed alias resolution | `node_modules/iips-broker-import` resolved from `git+ssh://git@github.com/ramkivs/iips-production-market-data.git#07e86a4f2c105651f3097a96cb519f8611945e30` |
| Clean install lifecycle | `npm ci --foreground-scripts` exit `0`; npm ran `iips-production-market-data@1.0.0 prepare` → `build:portfolio-ui-package` + `build:pit-package` |
| `dist/package` existence | Present; **152** files |
| Required modules | **18 / 18** present |
| JavaScript artifacts | **18 / 18** present |
| Declaration artifacts | **18 / 18** present |
| Missing artifacts | **0** |
| Materializer | `broker-import alias 07e86a4f2c105651f3097a96cb519f8611945e30 materialized: 152 published files -> .cache/broker-import` |
| Materialized manifest | `BROKER-IMPORT-MATERIALIZED.json`: `aliasCommit 07e86a4…`, `fileCount 152`, `consumedAs: published-build-output`, `rawSourcesCompiled: false` |
| Runtime entrypoint 1 | `.cache/broker-import/frontend/src/features/portfolio/import/broker-import-ingress.js` + `.d.ts` present |
| Runtime entrypoint 2 | `.cache/broker-import/src/identity/governed_fixture_master.js` + `.d.ts` present |
| `npm run build:broker-import` | exit `0` (materializer + `tsc -p tsconfig.broker-import.json`) |
| `npm run typecheck` | exit `0` (with `pretypecheck` → `build:broker-import`) |

The installed package's `dist/package` timestamp is the clean-install time, and the package manifest declares `"files": ["dist/package"]` and the `prepare` lifecycle. The Windows installed-package discrepancy (no `dist` directory) was **not reproducible** in the Arena clean-install environment: the normal npm lifecycle produced `dist/package` with all 152 files. The IRR materializer remains fail-closed if `dist/package` is absent, so a stale or incomplete Windows installation cannot produce a green build. A clean Windows install is the operator-side reconciliation step; Arena did not run destructive cleanup or inspect the Windows host.

## 5. Frontend startup and route verification

Normal lifecycle, without bypassing `predev`:

```
npm run dev
→ predev
→ npm run build:broker-import
→ node scripts/materialize-broker-import.mjs   (152 files → .cache/broker-import)
→ tsc -p tsconfig.broker-import.json           (exit 0)
→ vite
→ VITE v5.4.21 ready in 180 ms
```

| Route / check | Result |
|---|---|
| `GET /reports` (Vite) | `200` (SPA HTML; `<div id="root">`, title present) |
| `GET /broker-holdings` (Vite) | `200` (SPA HTML) |
| `GET /` (Vite) | `200` |
| `GET /api/health` direct | `200` `{"status":"ok","transport":"program-v3.0 executive (dev)"}` |
| `GET /api/health` via Vite proxy | `200` (proxy works) |
| `GET /api/reports/context` direct | `503 owner-context-unavailable` (expected without the server-owned carrier) |
| `GET /api/reports/context` via Vite proxy | `503 owner-context-unavailable` (proxy works; fail-closed) |

The Arena environment does not contain the Windows server-owned carrier or the existing persisted Reports database. The existing NP-06 reports (`8cbe148c-e1f8-417d-80ea-fed72f6dec1d`, `4deea741-c87c-42ea-bd75-1d42ee54ed99`) were **not** recreated, modified or read by this work. The Reports API `200` context/artifact behavior with a configured carrier and store is covered by the existing `server/reports-api.test.ts` (3/3) and the read-only UI tests (`Reports.test.tsx` 12/12, `App.test.tsx` 21/21). Genuine browser/UI verification on the Windows host remains outstanding; the Arena environment has no Playwright/Puppeteer browser harness.

## 6. Targeted tests

| Command | Result |
|---|---|
| `npx vitest run server/broker-import/brokerImportPackageConsumer.test.ts` | **8/8 passed** |
| `npx vitest run src/api/brokerHoldingsPreview.test.ts` | **21/21 passed** |
| `npx vitest run src/features/broker-holdings/BrokerHoldingsPreview.test.tsx` | **6/6 passed** |
| `npx vitest run src/features/reports/Reports.test.tsx src/app/App.test.tsx server/reports-api.test.ts` | **36/36 passed** |
| `npm run build:broker-import` | exit `0` |
| `npm run typecheck` | exit `0` |
| `npm run dev` (normal lifecycle) | Vite ready; routes `200`; API proxy `200`/`503` as expected |

No full backend regression suite was run. No test was claimed that was not executed.

## 7. Boundaries confirmed

- **IPD repository untouched.** No IPD write, branch, commit, PR, package guard or file was modified. Only read-only IPD metadata was inspected.
- **NP-04 persistence untouched.** No NP-04 implementation, schema, migration or database change.
- **Existing NP-06 reports preserved.** The two persisted report IDs were not recreated, modified or read; no Reports commit operation was run.
- **No Reports-local persistence.** No Reports-local store was introduced.
- **No production work.** No production deployment, acceptance or configuration.
- **No unrelated local configuration discarded.** `frontend/vite.config.ts` was not modified; no stash was dropped; no destructive cleanup or force-checkout was run. The Arena environment does not contain the Windows-local `vite.config.ts.backup-20261105-111336` or the Windows evidence; that limitation is stated rather than assumed away.
- **No unrelated feature work.** Only the dependency pin, lockfile, profile, comments, record and tracker section changed.

## 8. Publication

This record is published on branch `arena/1ab376fe-iips-review-recovered` in the IRR pull request for this change. The exact commit, PR number, CI result and post-merge authoritative `main` SHA are recorded in the publication receipt after the remote checks complete. The PR is merged only when the repository's applicable checks and review requirements permit it.
