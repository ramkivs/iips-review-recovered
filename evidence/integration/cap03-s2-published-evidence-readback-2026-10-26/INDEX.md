# Evidence Index — `cap03-s2-published-evidence-readback-2026-10-26` (`§16.141` / `CV-CORR-121`)

Reproducible audit artifacts supporting:

- `docs/integration/IIPS_v3.0_CAP03_S2_PUBLISHED_EVIDENCE_READBACK_2026-10-26.md`
  (`IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01` — read-back of the transferred
  CAP-03 S2 raw evidence; `52/53` manifest entries reproduced; one non-reproducing entry; the
  reported `47`-entry `PASS` remains user-reported; **formal S2 evidence acceptance NOT RENDERED**)
- `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (`§16.141`)

Read-back target: branch `cap03-s2-evidence-publication` @
`54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0`, directory
`evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/`.

No S2 run, test run, build, or manifest generation/regeneration was performed. No file on
`desktop-no0nhtp` was accessed, and no captured transcript was edited. No PR, merge or CI dispatch
was made. `0` IPD writes.

## Files

- `00-remote-publication-state.json` — live remote facts collected by `collect_publication_state.py`
  (`git ls-remote` + GitHub REST reads): branch tip `54d5a56…`, parent `main@1059f96…`, `57` evidence
  entries at the published commit, `0` PRs from the branch, `0` open PRs, `0` check runs, `0` workflow
  runs, branch unprotected.
- `01-manifest-reproduction-readback.json` — per-entry read-back produced by
  `verify_manifest_reproduction.py`: recorded digest, committed blob SHA-1, committed byte size,
  committed SHA-256, the transformation (if any) that reproduces the recorded digest, and the
  classification. Summaries: `52` reproduced / `1` not reproduced; nine required files present and
  reproduced; `0` listed-but-absent; `4` present-but-unlisted.
- `02-evidence-content-findings.json` — content findings produced by `collect_content_findings.py`:
  pin/tree statements, UTC windows, TAP counts and result lines per artifact; the `1148 = 8 + 1140`
  explanation of the preserved `Result: FAIL`; the `48` vs `47` generation difference; the identical
  blob behind `s2-05-package-consumer.txt` and `s2-npm-launch-fix-consumer-20261026T095613Z.txt`.
- `collect_publication_state.py` — read-only remote-state collector.
- `verify_manifest_reproduction.py` — Git-object-only manifest reproduction check. Recorded digests
  are of the host's CRLF bytes; the transfer committed the LF form, so line-terminator restoration is
  applied as an explicit, disclosed transformation and not as an accepted assumption.
- `collect_content_findings.py` — content extractor used above.
- `verify_readback_record.py` — integrity validator: recomputed counts, independent re-confirmation of
  the non-reproducing entry, `1148` arithmetic, identifier presence in the addendum and tracker,
  single `§16.141` heading, and that the earlier receipt evidence is unmodified.
- `SHA256SUMS.txt` — SHA-256 digests of the files in this directory (excluding itself).

## Reproduction

```bash
python3 collect_publication_state.py        # needs `gh` authentication; read-only API calls
python3 verify_manifest_reproduction.py --repo /path/to/iips-review-recovered
python3 collect_content_findings.py --repo /path/to/iips-review-recovered
python3 verify_readback_record.py --repo /path/to/iips-review-recovered
```

The scripts require the published commit to be present locally
(`git fetch origin cap03-s2-evidence-publication`), and assert nothing about the Windows host.
