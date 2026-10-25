# CAP-03 DR-2/DQ-1…DQ-5 execution evidence

This is the execution/evidence annex for the IRR-locus decision record [`IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md`](../../../docs/integration/IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md). It is not a replacement or regeneration of the completed host-operations package and contains no host/QE evidence.

## Evidence index

- `identifier-census.txt` — pre-allocation census for `CV-CORR-94`, `CHG-2026-10-25-13/-14`, decision IDs, and verification rows `V627`–`V639`.
- `starting-state.txt` — IRR/IPD remote baseline SHAs/trees, checks, open-PR counts, pins, protected blobs, and sandbox/host limits.
- `dependency-setup.txt` — IRR and read-only IPD dependency-install outcomes, CA workaround, audit warnings, and ignored build artifacts.
- `iteration-01-focused-failure.txt` — initial adapter-test failure retained with the concrete fixture mistake and correction.
- `focused-user-portfolio.txt` — final focused run: 9 files / 173 tests passed.
- `full-test-ci.txt` — final complete IRR `test:ci` output: 102 files / 1,312 tests passed.
- `test-report-guard.txt` — guarded JSON report count and exit code.
- `typecheck.txt`, `typecheck-replay-server.txt`, `direct-strict-tsc.txt` — final IRR TypeScript checks and exact exit codes.
- `build.txt` — final IRR production build output and bundle-size warning.
- `ipd-baseline-npm-ci.txt`, `ipd-baseline-build-tsc.txt` — read-only IPD baseline test setup/compiler logs; no tracked source change.
- `ipd-current-q1-uncompiled-attempt.txt` — direct source-mode attempt failure, retained.
- `ipd-current-q1-baseline.txt` — supported compiled execution of the existing, old-shape IPD Q1 test: 3/3 passed on Linux. It is not proof of the new Option-A contract.
- `blob-digests.txt` — local Git blob IDs, SHA-256 digests, and byte lengths for every tracked decision, implementation, tracker, and evidence file except the digest index itself.

The decision/implementation publication receipt is recorded at master tracker §16.112.9 after merge and independent remote verification. No host preflight, provisioning, QE, H-12 adoption, Gate 5 admission, or endpoint activation occurred.
