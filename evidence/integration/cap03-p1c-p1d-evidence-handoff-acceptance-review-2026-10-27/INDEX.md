# Evidence — `IIPS-V3-CAP03-P1C-P1D-EVIDENCE-HANDOFF-ACCEPTANCE-REVIEW-2026-10-27-01`

Companion bundle for tracker **§16.152** (`CV-CORR-132`, `CHG-2026-10-27-09`, `V1026`–`V1035`) and
[`docs/integration/IIPS_v3.0_CAP03_P1C_P1D_EVIDENCE_HANDOFF_ACCEPTANCE_REVIEW_2026-10-27.md`](../../../docs/integration/IIPS_v3.0_CAP03_P1C_P1D_EVIDENCE_HANDOFF_ACCEPTANCE_REVIEW_2026-10-27.md).

**Character.** Evidence-handoff attempt + independent acceptance review only. **Arena had NO host
contact.** The handoff was attempted across **ten** governed channels (IRR main/all branches/issues/PR
comments/PRs/releases/tags/code search; IPD read-only; Arena workspace; session input): **zero** raw
bytes of CAP-B (`cap03-p1-20261027-02`), CAP-C (separate read-only host assessment) or CAP-D (generator
bytes) were received. The operator then decided (this session) that the `B5D58F7F…` generator **cannot
be reproduced** and that a **fresh attempt-session capture using the published read-only instrument
(`85AC7271…`) verbatim will follow**; the existing capture is **superseded for acceptance purposes**
(preserved operator-local; no adverse inference; no deletion; no modification). No P-1 execution, no
`--mode=execute`, no store/sidecar/parent mutation, no ACL/flag/pin/manifest/code/fence change,
**`0` IPD writes**. **P-1 remains UNSPENT / UNEXECUTED / NOT AUTHORIZED.** No acceptance is claimed:
`P-1-C` `NOT ESTABLISHED`; `P-1-D` `DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT
VERIFIED FOR THE ATTEMPT`.

| File | Purpose |
|---|---|
| `00-baseline-and-handoff-channels.json` | Reviewed baseline (IRR `main@c3a014f…`, IPD read-only `main@888eb375…`), governing context, the ten handoff channels checked with methods and results, and the non-receipt outcome (0 raw bytes; prose transcription explicitly not treated as raw host evidence) |
| `01-operator-decision-and-supersession.json` | The operator decision recorded this session (B5D58F7F generator not reproducible; new capture with the published instrument will follow); exact supersession scope; what is preserved byte-identically; the non-inferences (no adverse inference, no allegation, no new authority blocker, no reopened matter) |
| `02-generator-integrity-resolution.json` | Blocker B-4 resolved by designation: published instrument identity re-verified (blob `eaea3f7f…`, 10,231 B LF, SHA-256 `85AC7271…`); the verbatim-use rule (only the designated parameter lines may differ, with byte-diff + self-recorded `ScriptSHA256` deposits); the `B5D58F7F` limb closed as NOT APPLICABLE |
| `03-expected-values-new-capture.json` | Exact expected values fixed repository-side (IPD inspected read-only): §16.143 pin `001c3c80…`/`399fa44a…` (parent `8eec74ae…`); successor §8 step-0 source SHA-256 for the three files; standing IRR consumer pin; F4/F5 literals; the PF-11 `.git`-walk, PF-12, PF-14 and PF-17 capture expectations |
| `04-pf-criterion-assessment.json` | Criterion-by-criterion independent acceptance review with the four-way vocabulary — VERIFIED / NOT VERIFIED / NOT EVIDENCED / NOT APPLICABLE — over 36 rows; exit signals (no `STOP.txt`, zero error-scan matches, walkability, capture existence, prose) explicitly not treated as proof; P-1-C/P-1-D/P-1 conclusions |
| `05-residual-evidence-required.json` | The exact residual evidence needed (R-1…R-7, mapped from §16.151 B-1…B-6 + the CAP-C limb), the deposit protocol, and the explicit not-required/not-requested list |
| `verify_review.py` | Recomputes bundle digests; re-verifies instrument identity, F4 hex, no-fabrication invariants, criterion statuses, identifier registration and scope of changes |
| `SHA256SUMS.txt` | SHA-256 of every file in this bundle except itself |

## Outcome supported by this bundle

| Item | State |
|---|---|
| Evidence handoff | **ATTEMPTED; ZERO RAW BYTES RECEIVED** across ten governed channels |
| `cap03-p1-20261027-02` (CAP-B) / CAP-C | **SUPERSEDED FOR ACCEPTANCE** (operator decision); preserved operator-local as reported state; no adverse inference |
| `B5D58F7F…` generator (CAP-D) | **NOT REPRODUCIBLE** (operator decision); no digest asserted; B-4 deposit limb NOT APPLICABLE |
| Generator for the next capture | **the published read-only instrument** `85AC7271…` (blob `eaea3f7f…`), verbatim per the rule in `02` |
| `P-1-C` | **NOT ESTABLISHED** — attempt-session capture does not exist yet |
| `P-1-D` | **DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT** |
| `P-1` | **UNSPENT / UNEXECUTED / NOT AUTHORIZED TO EXECUTE** |
| F4 / F5 / PF-15 / pins / gates / fences | unchanged; nothing reopened; nothing advanced |

## Reproduction

```bash
cd evidence/integration/cap03-p1c-p1d-evidence-handoff-acceptance-review-2026-10-27
python3 verify_review.py        # expects: EVIDENCE-HANDOFF REVIEW VERIFIED, exit 0
shasum -a 256 -c SHA256SUMS.txt # bundle integrity
```
