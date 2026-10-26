# Evidence index — IRR late registration and review of CAP-02 + CAP-03 unified reconciliation (`§16.139` / `CV-CORR-126`)

Focused receipt: [`docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_RECONCILIATION_IRR_REVIEW_RECEIPT_2026-10-26.md`](../../docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_RECONCILIATION_IRR_REVIEW_RECEIPT_2026-10-26.md).

| File | Purpose |
|---|---|
| `verify_review.py` | Read-only checks of the reviewed IRR baseline tracker blob, IPD PR #98 state/403 boundary, copied report and patch blob identities, the IPD evidence checksums, PF-15 F-row byte identity/code points, and later authoritative sections. Requires the existing `gh` connection. |
| `00-review-verification.json` | Captured output of `verify_review.py`: **10 PASS / 0 FAIL**. |
| `01-publication-readback.json` | Independent Git-Blobs read-back of seven artifacts at PR #313's merge, plus PR/CI verification: **5 PASS / 0 FAIL**. |
| `verify_publication.py` | Replayable read-only verifier for PR #313's merge/CI facts and the seven merged artifact blobs; it does not self-embed its own companion carrying merge. |
| `SHA256SUMS.txt` | SHA-256 digests of the substantive files in this directory. |

The exact historical IPD report, mirror receipt, 44-check bundle and `TRACKER_PATCH_PROPOSED.diff` are published separately under `docs/integration/` and `evidence/integration/cap02-cap03-unified-reconciliation-2026-10-26/`. This review evidence is documentation/verification only: no PA decision, S2 rerun, P-1, S3/QE, pin, fence, gate or production change.
