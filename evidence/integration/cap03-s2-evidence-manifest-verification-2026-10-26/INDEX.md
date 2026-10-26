# Evidence Index — `cap03-s2-evidence-manifest-verification-2026-10-26` (`§16.138` / `CV-CORR-118`)

Reproducible audit artifacts supporting:

- `docs/integration/IIPS_v3.0_CAP03_S2_EVIDENCE_MANIFEST_VERIFICATION_RECEIPT_2026-10-26.md` (`IIPS-V3-CAP03-S2-EVIDENCE-MANIFEST-VERIFICATION-RECEIPT-2026-10-26-01` — user-reported Windows 47-entry manifest `PASS` recorded; Arena raw-byte read-back **PENDING**; full S2 evidence acceptance **NOT rendered**)
- `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (`§16.138`)

No S2 run, test run, build, or manifest generation/regeneration was performed to produce this bundle. No file on `desktop-no0nhtp` was accessed. Zero IPD writes.

## Files

- `00-remote-state-reverification.json` — Arena-independent remote facts re-verified live on `2026-10-26` via GitHub REST/Git APIs: IRR `main@d9345004f5897ecb33fa532599b51a6ec799aa7a` (superseding the supplied `11270b85…` snapshot; PRs #302–#305, 3 PF-15 paths, 0 S2 paths), IPD `main@f97b17e7d04a0c5c4573c0dbe51da2c4c595d829`, approved baseline `8eec74ae…`, corrected candidate `001c3c80…` / tree `399fa44a…` / parent / two-file change set, IPD PR #96 `MERGED`, 0 open PRs and 0 Actions artifacts in both repositories.
- `01-user-reported-windows-manifest-verification.json` — Structured transcription of the user-reported Windows results (47-entry manifest `PASS`, nine required filenames in order, locked-transcript exclusion, post-run pin, 1,140 distribution match, `924/920/0/4` suite and consumer `PASS` with the two preserved hashes). Explicitly **not** Arena-observed or Arena-recomputed.
- `verify_s2_receipt.py` — Deterministic documentation-integrity validator for the receipt, this bundle, and tracker §16.138 (verbatim filenames/hashes/commits, classification and boundary language, identifier presence, JSON consistency). Performs no execution work.
- `02-publication-readback.json` — _(added by the companion publication-receipt update, `CHG-2026-10-26-18` / `V888`)_ Independent GitHub read-back of the carrying PR merge: published commit SHA, blob identities, byte sizes, SHA-256 digests, CI runs, and completeness checks for every published path.
- `verify_s2_publication.py` — _(added by the companion publication-receipt update)_ Reproducible GitHub API post-merge verification script producing `02-publication-readback.json`.
- `SHA256SUMS.txt` — SHA-256 digests of the evidence files in this directory (excluding itself).
