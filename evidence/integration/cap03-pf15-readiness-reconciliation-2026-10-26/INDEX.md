# CAP-03 PF-15 / S3-QE readiness reconciliation evidence

This directory contains host-independent authority, remote-baseline, schema, integrity, and environment records. It contains no native-Windows S2/S3/QE transcript and no provisioning evidence.

| File | Purpose |
|---|---|
| `01-remote-baseline.json` | GitHub API commit/tree and remote blob read-back for the IRR and IPD governing baselines; no IPD writes |
| `02-host-platform-probe.txt` | Current sandbox identity, OS/runtime, host-name resolution, Windows shell availability, and absence of enabling/endpoint/store environment variables |
| `03-readiness-audit.json` | Output of the structural/integrity validator: PF-01…PF-17, QE-1…QE-11 status, Q11 bookends, QE-9 sampling, failure classes, H-12 digest, prior evidence checksums |
| `04-main-ci.txt` | GitHub Actions latest-main status for both governing repositories at their recorded baselines |
| `05-ipc-source-pin-comparison.txt` | Remote API Git-blob identity comparisons for IPD endpoint/entrypoint and IRR IPC client against their frozen pins |
| `validate_readiness.py` | Reproducible documentation/content-integrity assertions; does not invoke host operations |
| `verify_remote_baseline.py` | Reproducible read-only GitHub API baseline and blob verification |
| `SHA256SUMS.txt` | SHA-256 over exact bytes of all evidence files except this checksum file |

**Classification:** repository/authority-readiness evidence only. It is not S2, P-1, PF-15 effectiveness, S3, QE, acceptance, admission, or production evidence. QE remains `NOT RUN (0/11)`.

The successful IRR suite run on this sandbox used the sandbox-provided CA via `NODE_EXTRA_CA_CERTS`; TLS validation was not disabled. The first attempt failed TLS verification and did not change the lockfile or repository source. The full test and build outputs are the GitHub CI artifacts for the publication PR; the local summary is recorded in the reconciliation report and tracker.
