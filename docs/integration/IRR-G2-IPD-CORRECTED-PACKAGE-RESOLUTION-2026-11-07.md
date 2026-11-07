# IRR G-2 runtime package-resolution repair

**Date:** 2026-11-07

**Repository:** `ramkivs/iips-review-recovered`

**Working branch:** `arena/22180ef3-iips-review-recovered`

**Scope:** Consume the corrected IPD public package entry point for IRR's existing G-2 market-data consumer. No IPD source, portfolio data, market-data configuration, or consumer architecture was changed.

## Result

IRR now pins `iips-production-market-data` to the exact corrected IPD commit:

`github:ramkivs/iips-production-market-data#14fdcf00516f891a55fa9d8a209a01433be3bc63`

The IPD branch `arena/aeea3efb-iips-production-market-data` was independently checked with `git ls-remote` and points to that exact SHA. The other two IPD package aliases remain unchanged.

The branch baseline pinned the primary package to P7 commit `f2bb47dc50fc8f16ee8d3354f6f4e8bf995e4bbc`. This change advances that dependency to `14fdcf00516f891a55fa9d8a209a01433be3bc63`; the final manifest and lock both match. `npm install --save-exact` regenerated the Git resolution and integrity entry in `frontend/package-lock.json`; `npm ci` then reinstalled from that lockfile. The lock resolves to `git+ssh://git@github.com/ramkivs/iips-production-market-data.git#14fdcf00516f891a55fa9d8a209a01433be3bc63` with integrity `sha512-adY58aePKLi/wg95h/BTJfULJafYBr5eJP5nPXhxZhdP2u5I1BBWbygGjFceN5HtX9f8dk5nDoE1ex27qQcXHg==`.

Commands used in `frontend/`:

```sh
NODE_OPTIONS=--use-system-ca npm install --save-exact 'github:ramkivs/iips-production-market-data#14fdcf00516f891a55fa9d8a209a01433be3bc63' --ignore-scripts
NODE_OPTIONS=--use-system-ca npm ci --ignore-scripts --no-audit --no-fund
```

## Package-resolution evidence

After the lockfile-exact reinstall (`npm ci --ignore-scripts --no-audit --no-fund`):

- The installed package's `exports["./dhan-server"]` includes `types`, `import`, and the corrected `default` target.
- CommonJS `require.resolve('iips-production-market-data/dhan-server')` succeeded and `require()` loaded the public API.
- ESM `import('iips-production-market-data/dhan-server')` succeeded; the exported `MarketDataTransportClient` is present.
- The installed resolution is `node_modules/iips-production-market-data/dist/package/src/providers/dhan/package.js`.
- The IRR integration test now asserts both the exact manifest/lock pin and CommonJS plus ESM resolution of this public subpath.

The package-resolution assertions import/resolve code only; they do not instantiate the transport client. No persisted portfolio/holding data was read and no live quote request was sent. Existing synthetic test fixtures remained fixture-only; no new holding fixture or quote request was introduced.

## Validation

- Focused user-portfolio and G-2 transport Vitest suite: **12 files, 181 tests passed**. The suite was run with database, IPC, binding, and market-data environment variables unset. Its existing mock IPC fixtures do not represent persisted holdings or live quote traffic.
- Targeted TypeScript check of `server/user-portfolio/marketDataValuation.ts` and `userPortfolioContract.ts`: passed.
- `npm run build`: passed; Vite transformed 157 modules. It emitted the existing large-chunk advisory.
- `git diff --check`: passed.
- Broader `npm run typecheck:investment-server` and `npm run typecheck:replay-server` remain blocked by unresolved imports in the current unrelated investment worktree: `iips-platform/src/investment/coverage/methodMatrix` and `iips-platform/src/investment/coverage/measure`. After the standard broker-import materialization step, these were the remaining errors. No files were restored or modified to mask them.

## Change boundary

- Changed: `frontend/package.json`, `frontend/package-lock.json`, the G-2 package-resolution integration test, and this report.
- Preserved: `frontend/server/user-portfolio/marketDataValuation.ts` architecture and all unrelated dirty worktree files.
- Not changed: IPD, either repository's `main`, the database, portfolio/holding records, or market-data credentials/configuration.

This resolves the package export-resolution defect for IRR's installed dependency; it makes no claim about live market-data connectivity or quote consumption.
