# Independent Stage-4 scope audit — supporting evidence

**Main deliverable:** [`IID-STAGE4-INDEPENDENT-SCOPE-AUDIT-2026-11-17.md`](../../../docs/integration/IID-STAGE4-INDEPENDENT-SCOPE-AUDIT-2026-11-17.md).

**Assessed Git tree:** commit `2ec2e75d0c1c042f646e94cb1ec6e0def21bfb6c`, fetched remote main at audit start. Record date 2026-11-17; remote metadata contains 2026-11-18 timestamps, preserved literally. No claim of historical midnight cutoff.

This is an **audit bundle**, not a real-issuer dataset, source admission, replacement package, host transcript, mint, acceptance certificate or governance decision. No product source/test/configuration, dataset/identity input or existing decision/status cell is changed by its publication. Tests use disposable sandbox fixtures; the extra measurement is in memory. No Windows/IPD operation was performed.

## Contents

| File | Meaning / limit |
|---|---|
| `primary-requirements-extract.md` | Verbatim scope/acceptance/demo/gap excerpts from pinned, unmerged baseline blob; full-byte SHA verified before extraction. Not proof of delivered implementation |
| `inspected-evidence-inventory.json` | Baseline Git blob + SHA-256 + size for 194 scope/evidence/test/implementation anchors; records identity, not universal re-adjudication of every limitation |
| `measurement.json` | Independent read/in-memory rebuild of three explicitly named committed assemblies. Full content digests, measurement, issuer freshness/availability, assessment completeness/refusals; audit identity placeholders do **not** prove resolved identity or dataset rights |
| `read-only-measurement.ts.txt` | Exact audit probe text; `.txt` deliberately keeps this an evidence artifact rather than product tooling. See reproduction below |
| `source-checks.json` | Refresh manifest and origin-excerpt hashes, six arithmetic hand-checks, source-row locators, withholding reasons. Qualifies the source boundary: committed excerpts, not original PDFs |
| `source-checks.py.txt` | Audit check text; reads only inputs and emits JSON to stdout |
| `wi8-identity-boundary.json` | Direct runtime loader refuses legacy `entries` input; supported provisioner source reader accepts empty-only compatibility form. No publication or identity repair performed |
| `roster-lint.json` | Production lint over current source population: 19 checked/0 failed; excluded synthetic fixtures named |
| `platform-iid.tap` | Full current IID run, correct `iips-platform` working directory, serial: 1589/1589, no skips |
| `platform-regression.tap` | Full platform regression command: 678/678 |
| `platform-typecheck.txt` | Empty output from successful platform tsc; exit 0 paired with execution receipt |
| `github-readback.json` | Exact selected PR states/merge/checks and ancestor results; recent main run metadata; full frontend CI run/job/step metadata. No assertion that static CI is full frontend CI. Raw redirected frontend logs could not be downloaded |
| `static-checks.txt` | Existing static validator plus classification/workflow/recovery-audit unit tests; all exit 0, not actual release recovery or host execution |
| `execution-receipt.json` | Commands/toolchain, per-suite counts, setup failures, boundary and result summary |
| `SHA256SUMS` | Audit bundle files (excluding this checksum file itself), SHA-256. The report and tracker are separate Git artifacts |

## Reproduction without altering operational data

Use a disposable scratch/dependency directory, with the installed toolchain discoverable by child Node processes. Do **not** run an installer or mint against a real data root. Product tests create and delete their own temporary roots.

From the repository root:

```sh
# Use an available isolated tsc/tsx toolchain; this audit used Node 22.22.3,
# TypeScript 5.4.5, tsx 4.23.0 and @types/node 26.1.0.
# Explicit platform node_modules/tsx discovery is required by Windows-driver source tests.
cd iips-platform
tsx --test --test-concurrency=1 tests/investment/*.test.ts
tsx --test --test-concurrency=1 src/**/*.test.ts tests/regression/*.test.ts
cd ..
tsc --noEmit -p iips-platform/tsconfig.json
tsx iips-platform/scripts/lint-roster-sectors.ts --json

# Optional audit-only pure probe: its relative imports intentionally use this scratch location.
mkdir -p .local/stage4-audit
cp evidence/iid/STAGE4-INDEPENDENT-AUDIT-2026-11-17/read-only-measurement.ts.txt .local/stage4-audit/measure.ts
tsx .local/stage4-audit/measure.ts > .local/stage4-audit/measurement.json
python evidence/iid/STAGE4-INDEPENDENT-AUDIT-2026-11-17/source-checks.py.txt
sha256sum -c evidence/iid/STAGE4-INDEPENDENT-AUDIT-2026-11-17/SHA256SUMS
```

`source-checks.py.txt` expects the in-memory probe output at the scratch path shown. Compare semantic values/digests, not incidental TAP timings/temp paths or absolute input directories on a different machine. No network is used by either evidence probe. Temporary dependency links and scratch data are not part of the published bundle.

Historical and current observations are deliberately separate. GitHub success metadata supports that those workflows completed; it is not a new local frontend test execution, current Windows readiness, independent rights verification, original PDF inspection, real event proof or a real portfolio/browser journey.
