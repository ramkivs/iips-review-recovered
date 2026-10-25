# CAP-03 DR-2 / DQ-1…DQ-5 execution evidence

This is the execution/evidence annex for [`IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md`](../../../docs/integration/IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md) and tracker §§16.117–16.118. It records repository-level implementation and validation only; it is not a replacement or regeneration of the completed host-operations package and contains no host/QE evidence.

## Current-base and bilateral implementation evidence

- `remote-state-before-sync.txt` — live PR #265/base/main/check/review/protection snapshot before synchronization; records why the old exact-head check and `dirty` mergeability state were stale.
- `post-main-69e3-census.txt` — reallocation census against current IRR `main@69e3e7c…` and IPD `main@8eec74ae…`; documents zero candidate hits and collisions in the former allocation.
- `ipd-pr89-current-main-remote-readback.txt` — live IPD PR #89/#90/#91 merge receipts, current-main source/test blobs and raw hashes, check/test-count runs, unchanged-code comparison, Option A semantics, and the real cross-repository harness result (15/15).
- `dependency-setup-after-main-69e3e7.txt` — first current-base `npm ci` attempt, retained with the sandbox CA trust error.
- `dependency-setup-after-main-69e3e7-system-ca.txt` — successful retry with `NODE_OPTIONS=--use-system-ca` (system trust enabled; TLS verification was not disabled); 190 packages added, 191 audited, 11 pre-existing npm audit findings reported.
- `adapter-test-after-main-69e3e7.txt` — standalone IRR adapter suite: 49/49 passed.
- `focused-user-portfolio-after-main-69e3e7.txt` — focused user-portfolio/transport suites: 9 files / 173 passed / 0 failed.
- `full-test-ci-after-main-69e3e7.txt` — current-base full IRR suite: 106 files / 1,349 passed / 0 failed.
- `test-report-guard-after-main-69e3e7.txt` — JSON report guard: 106 files / 1,349 tests / 0 failed.
- `typecheck-after-main-69e3e7.txt`, `typecheck-replay-server-after-main-69e3e7.txt`, `direct-strict-tsc-after-main-69e3e7.txt` — all three current-base TypeScript validations, exit 0.
- `build-after-main-69e3e7.txt` — current-base production build, exit 0; 142 modules; existing non-fatal >500 kB bundle warning.
- `blob-digests.txt` — Git blob IDs, raw SHA-256 values, and byte counts for committed CAP-03 changes/evidence (self-excluded); regenerate after the synchronized branch and documentation are staged.
- `pr265-postmerge-readback.txt` — reserved for actual post-merge PR/main/tree/blob/CI verification; it will be written only after the live merge and independent read-back.

## Historical snapshots and retained attempts

- `identifier-census.txt`, `starting-state.txt`, `concurrent-main-advance.txt`, `post-advance-census.txt`, `post-pr266-census.txt`, and `post-pr267-census.txt` preserve earlier time-bounded baselines, main advances, collision corrections, and PR receipts. Their old main/head values are historical, not current.
- `pr266-remote-receipt-readback.txt` and `pr267-remote-receipt-readback.txt` preserve independent GitHub read-backs of the earlier Reports proposal/receipt.
- `focused-user-portfolio.txt`, `adapter-test-after-main.txt`, `focused-user-portfolio-after-main.txt`, `full-test-ci-after-main.txt`, `test-report-guard-after-main.txt`, `typecheck-after-main.txt`, `typecheck-replay-server-after-main.txt`, `direct-strict-tsc-after-main.txt`, and `build-after-main.txt` are earlier snapshots.
- The corresponding `*-after-main-4e54.txt` and `*-after-main-53176b.txt` logs record earlier integration runs; the latter passed at `main@53176b73` with 104 files / 1,321 tests, but they are superseded as current-base validation by the 106/1,349 results above.
- `ipd-baseline-npm-ci.txt`, `ipd-baseline-build-tsc.txt`, `ipd-current-q1-uncompiled-attempt.txt`, `ipd-current-q1-baseline.txt` record a read-only, old-contract IPD baseline and are not evidence of Option A; the authoritative later IPD implementation/read-back is `ipd-pr89-current-main-remote-readback.txt`.
- `iteration-01-focused-failure.txt` preserves the initial IRR fixture failure and correction rather than suppressing it.

The newly merged IPD provider was verified read-only; no IPD files were modified or retested here. PR #265's current exact head, live mergeability, changed paths, exact-head checks, and post-merge receipt must be refreshed and recorded after publishing the synchronized branch. Do not infer them from the old `c059…` check. No CAP-03 user-portfolio route/fence change, final pin/freeze, H-12 adoption, host action, Gate 4 acceptance, QE, result acceptance, Gate 5 admission, write, or production claim is represented by these logs.
