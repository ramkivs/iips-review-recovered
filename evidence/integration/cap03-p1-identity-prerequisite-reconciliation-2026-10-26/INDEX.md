# Evidence Index — `cap03-p1-identity-prerequisite-reconciliation-2026-10-26` (`§16.140` / `CV-CORR-120`)

Reproducible audit artifacts supporting:

- `docs/integration/IIPS_v3.0_CAP03_P1_IDENTITY_PREREQUISITE_RECONCILIATION_2026-10-26.md` (`IIPS-V3-CAP03-P1-IDENTITY-PREREQUISITE-RECONCILIATION-2026-10-26-01` — identity prerequisite `SATISFIED` under effective determination `IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01`; P-1 not executed and not yet to be executed on the classified non-identity prerequisites)
- `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (`§16.140`)

No P-1 execution, database creation, host operation, S3/QE action, code change, or IPD write was performed to produce this bundle. `desktop-no0nhtp` was not accessed; no native-Windows verification is claimed.

## Files

- `00-remote-identity-and-pin-readback.json` — Arena-independent live remote facts re-verified on `2026-10-26` via `git ls-remote` and the GitHub REST/Git APIs: IRR `main@cc3c000a11fd586c540a84a8d139c4b2c39cd121` and IPD `main@888eb375eebee01640e44ccdcbb138a71e8c4513` (0 open PRs in both); IPD PRs #80/#81/#96/#98 (mid-pass movement; identity blobs unchanged) and IRR PRs #304/#305/#306 merge coordinates; S1 determination (`b7746b5e…`), successor act (`528de6ae…`), validation/provisioning/test blobs decoded at live IPD `main` with recomputed value hashes and derived ids; blob identity across PR #80 merge / approved baseline `8eec74ae…` / corrected candidate `001c3c80…` / live `main`; ancestry (`behind_by: 0` throughout); the exact two-file baseline→candidate change set; PF-15 corrected-act blob (`3fe9a2dd…`) at live IRR `main` with F2/F4/F5 code-span metrics.
- `collect_remote_evidence.py` — Read-only collector producing `00-remote-identity-and-pin-readback.json` from the authoritative remotes. Performs no execution work and writes to no remote.
- `verify_reconciliation.py` — Deterministic documentation-integrity validator for the receipt, this bundle's JSON, and tracker §16.140 (exact values/hashes/derived ids, verbatim identities, P-1-A…P-1-F classifications, single §16.140 heading, change-set scope, no database artifacts).
- `01-publication-readback.json` — Independent GitHub read-back of the carrying PR merge: published commit, blob identities, byte sizes, SHA-256 digests, CI runs, and completeness checks for every published path.
- `verify_publication.py` — Reproducible GitHub API post-merge verification script producing `01-publication-readback.json`.
- `SHA256SUMS.txt` — SHA-256 digests of the evidence files in this directory (excluding itself; re-issued by the companion update to cover the read-back files).
