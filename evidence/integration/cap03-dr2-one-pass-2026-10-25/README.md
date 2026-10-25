# CAP-03 DR-2/DQ-1…DQ-5 execution evidence

This is the execution/evidence annex for the IRR-locus decision record [`IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md`](../../../docs/integration/IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md). It is not a replacement or regeneration of the completed host-operations package and contains no host/QE evidence.

## Evidence index

- `identifier-census.txt` — original pre-advance census (against starting `main@e8b41ba…`) for the initially allocated `CV-CORR-94` / §16.112 / CHG-13/-14 / V627–V639; its scope and later collision are explained in the following records.
- `starting-state.txt` — original IRR/IPD remote baseline SHAs/trees, checks, open-PR counts, pins, protected blobs, and sandbox/host limits.
- `concurrent-main-advance.txt` — PR #263/#264 mainline movement, collision details, checks, and identifier reallocation rationale.
- `post-advance-census.txt` — zero-hit census for §16.113 / CV-CORR-95 / CHG-15/-16 / V636–V648 against `origin/main@0cc999f`, plus protected current-main blobs and pre-publication PR #265 state.
- `dependency-setup.txt` — initial IRR and read-only IPD dependency-install outcomes, CA workaround, audit warnings, and ignored build artifacts.
- `dependency-setup-after-main.txt` — fresh IRR `npm ci` after integration of current main; 190 packages added, 191 audited, 11 findings, exit 0.
- `iteration-01-focused-failure.txt` — initial adapter-test failure retained with the concrete fixture mistake and correction.
- `focused-user-portfolio.txt` — focused run before the intervening main advance (preserved as historical).
- `adapter-test-after-main.txt` — post-advance adapter suite: 49/49 passed.
- `focused-user-portfolio-after-main.txt` — final focused run on integrated current main: 9 files / 173 passed.
- `full-test-ci.txt` — pre-advance complete IRR `test:ci` output: 102 files / 1,312 passed (historical).
- `full-test-ci-after-main.txt` — final complete IRR `test:ci` output after integrating current main: 104 files / 1,321 passed.
- `test-report-guard.txt` — pre-advance guarded JSON report count and exit code.
- `test-report-guard-after-main.txt` — final guard result: 104 files / 1,321 tests / 0 failed.
- `typecheck.txt`, `typecheck-replay-server.txt`, `direct-strict-tsc.txt`, `build.txt` — preserved pre-advance validation outputs.
- `typecheck-after-main.txt`, `typecheck-replay-server-after-main.txt`, `direct-strict-tsc-after-main.txt` — final TypeScript checks on integrated current main; all exit 0.
- `build-after-main.txt` — final production build on integrated current main; exit 0, 138 modules and the existing >500 kB chunk warning.
- `ipd-baseline-npm-ci.txt`, `ipd-baseline-build-tsc.txt` — read-only IPD baseline test setup/compiler logs; no tracked source change.
- `ipd-current-q1-uncompiled-attempt.txt` — direct source-mode attempt failure, retained.
- `ipd-current-q1-baseline.txt` — supported compiled execution of the existing, old-shape IPD Q1 test: 3/3 passed on Linux. It is not proof of the new Option-A contract.
- `blob-digests.txt` — local Git blob IDs, SHA-256 digests, and byte lengths for every tracked decision, implementation, tracker, and evidence file except the digest index itself.

The final revalidation, 104/1,321 suite, typechecks, and build were executed after integrating `origin/main@0cc999f`; the earlier 102/1,312 results remain historical. The decision/implementation publication receipt is recorded at master tracker §16.113.9 after merge and independent remote verification. No CAP-03 user-portfolio endpoint activation occurred; the Reports transport from PR #263 is separate merged-main work and is not CAP-03 scope or host/QE evidence. No host preflight, provisioning, QE, H-12 adoption, or Gate 5 admission occurred.
