# CAP-03 Fresh-Capture Procedure Evidence Bundle

**Record:** `IIPS-V3-CAP03-P1C-P1D-FRESH-CAPTURE-PROCEDURE-2026-10-27-01`

**Authority:** IRR `ramkivs/iips-review-recovered`, current-main read at `357689069473cf80921c65355cc6f70ce85c857b` / tree `6f38bb939342a5074445993bcc97650a7f8878e3`.

**Scope:** IRR only, plus read-only IPD coordinate/source validation.

**Status:** Static procedure and STOP reconciliation; no host run, no raw launcher/STOP output, no acceptance, no P-1 execution or authorization.

## Files

- `00-baseline-and-authority.json` — remote branch/commit/tree readbacks, effective pin designations, current-main compare, instrument identity, IPD step-0 source hashes, and non-grant boundary.
- `01-stop-reconciliation.json` — the two operator-reported STOPs and exact current-authority determinations. The raw output/launcher were not received; no independent host claim is made.
- `02-static-validation.json` — scoped procedure checks and explicit validation limits.
- `verify_procedure.py` — offline static checks of this bundle, the procedure, current tracker, published instrument identity, and a byte-level simulation of only the three permitted parameter substitutions.
- `SHA256SUMS.txt` — SHA-256 for the bundle files other than this checksum file.

## Operator next action

Follow **only** `docs/integration/IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md` after its publication and remote read-back are verified. It requires exact IPD `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / `399fa44a5f1953c0f61b452420fefb5985426ef1`, exact IRR consumer `ba64b2d5927c2f872560710cf1474c25a5cde0d5` / `5e4262f1cd75bf13b76ced5b45058f31434b5dad`, a fresh unique run/evidence root, parameter-only raw-byte copying, and the PF-17 observation. The old launcher must not be run.

## Non-grants

No P-1 invocation, no `--mode=execute`, no F4 parent/store/sidecar creation or deletion, no store write, no ACL or environment-flag change, no IPD write, no production scope, and no inference of acceptance. P-1 remains **NOT EXECUTED / UNSPENT / NOT AUTHORIZED**.
