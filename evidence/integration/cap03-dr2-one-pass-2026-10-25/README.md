# CAP-03 DR-2/DQ-1…DQ-5 execution evidence

This is the execution/evidence annex for the IRR-locus decision record [`IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md`](../../../docs/integration/IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md). It is not a replacement or regeneration of the completed host-operations package and contains no host/QE evidence.

## Evidence index

- `identifier-census.txt` — original pre-advance census against `main@e8b41ba…`; later time-bounded advances and the final current-main census are appended/referenced.
- `starting-state.txt` — original IRR/IPD remote baseline SHAs/trees, checks, open-PR counts, pins, protected blobs, and sandbox/host limits.
- `concurrent-main-advance.txt` — PRs #263/#264/#266/#267, merge/check evidence, collision resolution, and final CAP-03 re-census.
- `post-advance-census.txt` — historical zero-hit census for the first CV-CORR-95 reallocation against `main@0cc999f`; preserved as a time-specific snapshot.
- `post-pr266-census.txt` — historical zero-hit census at `main@4e54a923`, followed by a note that PR #267 later published PR #266's CHG-16/V644 receipt.
- `post-pr267-census.txt` — final pre-publication zero-hit census for `CV-CORR-96` / §16.114 / CHG-17/-18 / V645–V657 against current `origin/main@53176b73`, PR #267 diff, and IPD evidence; includes the then-current PR #265 state.
- `pr266-remote-receipt-readback.txt` — independent GitHub API verification of PR #266's three changed artifacts at merge `4e54a923` (3/3 exact).
- `pr267-remote-receipt-readback.txt` — independent GitHub API verification of PR #267's tracker receipt at merge `53176b73` (1/1 exact), including its exact-head/post-merge checks.
- `dependency-setup.txt`, `dependency-setup-after-main.txt` — original setup and `npm ci` after first integration at `0cc999f`; PRs #266/#267 changed documentation/tracker only, leaving frontend manifests and lockfile unchanged.
- `iteration-01-focused-failure.txt` — initial adapter-test failure with the fixture mistake and correction retained.
- `focused-user-portfolio.txt`, `adapter-test-after-main.txt`, `focused-user-portfolio-after-main.txt`, `full-test-ci-after-main.txt`, `test-report-guard-after-main.txt`, `typecheck-after-main.txt`, `typecheck-replay-server-after-main.txt`, `direct-strict-tsc-after-main.txt`, `build-after-main.txt` — historical results before/around the first main advance.
- The corresponding `*-after-main-4e54.txt` logs — complete current-main validation after PR #266 but before PR #267; retained as a historical second-main snapshot.
- `focused-user-portfolio-after-main-53176b.txt` — final focused run on integrated `main@53176b73`: 9 files / 173 passed, including the 26/26 unchanged-fence suite.
- `adapter-test-after-main-53176b.txt` — final adapter-specific run on `main@53176b73`: 49/49 passed.
- `full-test-ci-after-main-53176b.txt` — final complete run on `main@53176b73`: 104 files / 1,321 passed / 0 failed.
- `test-report-guard-after-main-53176b.txt` — report guard on that run: 104 files / 1,321 tests / 0 failed.
- `typecheck-after-main-53176b.txt`, `typecheck-replay-server-after-main-53176b.txt`, `direct-strict-tsc-after-main-53176b.txt` — all final current-main TypeScript validations; exit 0.
- `build-after-main-53176b.txt` — final current-main production build; exit 0, 138 modules, existing >500 kB chunk warning.
- `ipd-baseline-npm-ci.txt`, `ipd-baseline-build-tsc.txt`, `ipd-current-q1-uncompiled-attempt.txt`, `ipd-current-q1-baseline.txt` — read-only IPD setup/build/old-contract-Q1 evidence; supported old-shape Q1 passed 3/3 but does not prove Option A.
- `blob-digests.txt` — final local Git blob IDs, SHA-256 digests, and byte lengths for the tracked CAP-03 decision, implementation, tracker, current-main preserved Reports proposal files, and evidence, excluding the digest index itself.

The final fresh 104/1,321 suite, focused 9/173, adapter 49/49, report guard, typechecks, and build were executed after integrating current `origin/main@53176b73` (tree `f2dfd90b…`). Earlier `102/1,312`, first integrated-main, and post-PR-#266 results remain historical. The CAP-03 PR-head publication/non-merge receipt is §16.114.9; exact live head/check/read-back details are maintained in the linked PR #265 description to avoid self-embedding. PR #265 is intentionally not merged. No CAP-03 user-portfolio endpoint activation occurred; Reports transport/proposal/receipt work is independent mainline work. No IPD source change, host preflight, provisioning, QE, H-12 adoption, Gate 4 acceptance, Gate 5 admission, or user-portfolio fence removal occurred.
