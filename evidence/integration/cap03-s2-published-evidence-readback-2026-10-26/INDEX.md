# Evidence Index — `cap03-s2-published-evidence-readback-2026-10-26` (`§16.141` / `CV-CORR-121`)

Reproducible audit artifacts supporting:

- `docs/integration/IIPS_v3.0_CAP03_S2_PUBLISHED_EVIDENCE_READBACK_2026-10-26.md`
  (`IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01`, §16.141 — read-back of the transferred
  CAP-03 S2 raw evidence; `52/53` manifest entries reproduced; one non-reproducing entry; the
  reported `47`-entry `PASS` remains user-reported; **formal S2 evidence acceptance NOT RENDERED**)
- `docs/integration/IIPS_v3.0_CAP03_S2_EVIDENCE_PRESENCE_AND_DIGEST_VERIFICATION_2026-10-26.md`
  (`IIPS-V3-CAP03-S2-EVIDENCE-PRESENCE-AND-DIGEST-VERIFICATION-2026-10-26-01`, §16.142 — in-place
  re-inspection of the already-published evidence: **47/47** transferred originals present, **46/47**
  digests reproduced, **9/9** required verified, **1** mismatch; the `47`-entry `PASS` output is
  **absent**; acceptance assessed against ten transcribed criteria and found **NOT RENDERABLE** on
  `A8` (baseline step-4 failure); the S2 acceptance record was therefore **not created**)
- `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (`§16.141`, `§16.142`)

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
- `verify_readback_record.py` — integrity validator for §16.141: recomputed counts, independent
  re-confirmation of the non-reproducing entry, `1148` arithmetic, identifier presence, single
  `§16.141` heading, and that the earlier receipt evidence is unmodified.
- `03-presence-and-digest-matrix.json` — per-file presence **and** digest verdict over the transferred
  set, produced by `audit_published_evidence.py`: `47/47` present, `46/47` reproduced, the single
  mismatch, the four unlisted files, and each file's family/origin description. This is the artifact
  that distinguishes "listed in the manifest" from "actually present with verified content".
- `04-s2-acceptance-assessment.json` — the ten transcribed acceptance criteria (`A1`–`A10`) with
  governing source, status and basis, produced by `assess_s2_acceptance.py`; verdict **NOT RENDERED**,
  decisive blocker `A8`.
- `05-presence-and-digest-matrix.md` — human-readable rendering of `03`.
- `audit_published_evidence.py` — presence/digest auditor (Git-object-only).
- `assess_s2_acceptance.py` — criteria evaluator; it renders no acceptance and creates no record.
- `verify_continuation_record.py` — integrity validator for §16.142: re-derives the digest counts from
  the published commit, asserts `A4`/`A10` statuses, asserts that **no** S2 acceptance record was
  created, and asserts the PF-15 corrected act is still byte-identical to the effective blob.
- `SHA256SUMS.txt` — SHA-256 digests of the files in this directory (excluding itself).

## Reproduction

```bash
python3 collect_publication_state.py        # needs `gh` authentication; read-only API calls
python3 verify_manifest_reproduction.py --repo /path/to/iips-review-recovered
python3 collect_content_findings.py --repo /path/to/iips-review-recovered
python3 verify_readback_record.py --repo /path/to/iips-review-recovered
python3 audit_published_evidence.py --repo /path/to/iips-review-recovered
python3 assess_s2_acceptance.py
python3 verify_continuation_record.py --repo /path/to/iips-review-recovered
```

The scripts require the published commit to be present locally
(`git fetch origin cap03-s2-evidence-publication`), and assert nothing about the Windows host.
