# Evidence — publication receipt for `IIPS-V3-CAP03-P1C-P1D-EVIDENCE-HANDOFF-ACCEPTANCE-REVIEW-2026-10-27-01`

Companion receipt bundle for tracker **§16.152.8** (`CHG-2026-10-27-10`, `V1036`), recording the
governed publication of [`docs/integration/IIPS_v3.0_CAP03_P1C_P1D_EVIDENCE_HANDOFF_ACCEPTANCE_REVIEW_2026-10-27.md`](../../../docs/integration/IIPS_v3.0_CAP03_P1C_P1D_EVIDENCE_HANDOFF_ACCEPTANCE_REVIEW_2026-10-27.md)
and its evidence bundle `evidence/integration/cap03-p1c-p1d-evidence-handoff-acceptance-review-2026-10-27/`
(`CV-CORR-132`, §16.152, `CHG-2026-10-27-09`, `V1026`–`V1035`).

| Field | Value |
|---|---|
| Carrying PR | **#327** (head `1457b628b0c663a0cf5b01540e91e85044eb7064`) |
| Exact-head CI | run **`40468644586`** — `completed / success` (`pull_request`) |
| Merge | regular 2-parent `--merge` **`8c8a0756d4b67eb841c81ef396b7a9cd3d7a080e`**, tree `8847b5805f44b74b984f498e736134821b0845af`, parents `c3a014fe74fc4bb5d253957f060c8f4c2e4a6662` + tested head |
| Post-merge `main` CI | run **`40469213054`** — `completed / success` (`push`, merge commit) |
| Independent read-back | **18/18 artifacts MATCH, byte-identical** — the tracker, the focused record, all 9 primary-bundle files, and 7 unchanged primary-source blobs (published instrument `eaea3f7f…`, PF-15 act `-02`, F4 reconciliation `-01`, §16.151 record, §16.151 bundle files); blob identity recomputed via `git hash-object --stdin`; decoded-byte SHA-256 and size match; content checks all pass (single `## §16.152`, §16.151 preserved, record ID present, P-1 UNSPENT, no acceptance claim, capture superseded, instrument designated, receipt identifiers present) |
| Machine record | `00-publication-readback.json` |

**No substantive state change.** §16.152 is effective **as a recorded evidence-handoff attempt +
independent acceptance review**: raw operator bytes `0`; `cap03-p1-20261027-02` and its companion
assessment SUPERSEDED FOR ACCEPTANCE (operator decision, no adverse inference); the `B5D58F7F…`
generator NOT REPRODUCIBLE with no digest asserted; the published read-only instrument (`85AC7271…`)
designated verbatim — provable, not asserted — for the next attempt-session capture; **`P-1-C` `NOT
ESTABLISHED`**; **`P-1-D` `DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR
THE ATTEMPT`**; **`P-1` `UNSPENT / UNEXECUTED / NOT AUTHORIZED TO EXECUTE`**; F4/F5 unchanged; S3/QE/
DQ-4/Gate 4/Gate 5 untouched; `0` IPD writes; no host command; no store/sidecar/parent creation. The
residual evidence required remains exactly R-1…R-7 at §16.152.6.

## Reproduction

```bash
cd evidence/integration/cap03-p1c-p1d-evidence-handoff-acceptance-review-2026-10-27-receipt
python3 verify_publication.py     # expects: PUBLICATION RECEIPT VERIFIED, exit 0
shasum -a 256 -c SHA256SUMS.txt   # receipt bundle integrity
```

The remote read-back itself is reproducible with the GitHub Git APIs at the merge commit
`8c8a0756d4b67eb841c81ef396b7a9cd3d7a080e` using the method recorded in `00-publication-readback.json`.
