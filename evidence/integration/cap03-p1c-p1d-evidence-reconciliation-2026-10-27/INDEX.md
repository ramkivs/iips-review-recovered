# CAP-03 evidence reconciliation package

Published by IRR PR **#333**, merge commit `d8a4f77850ad0b45695282d6bfa20e51921f19e8`, and
registered in the tracker as **§16.155** (`CV-CORR-135`). This package is therefore an effective
IRR repository record; the "prepared assessment package, not an effective IRR repository record"
line that PR #333 merged is superseded by this correction pass (§16.156).

## Contents

- `CAP03_P1C_P1D_EVIDENCE_RECONCILIATION_2026-10-27.md` — assessment and proposed disposition.
  **Preserved byte-for-byte as the historical record; not edited.** Two of its conclusions are
  superseded by §16.156 (see "Superseded conclusions" below).
- `assessment.json` — machine-readable findings and evidence inventory.
  **Preserved byte-for-byte; not edited.** Its `published_instrument_identity_from_existing_governing_context.reported_sha256`
  placeholder is superseded by §16.156.
- `earlier_capture.zip` — preserved earlier run `cap03-p1-20261027T110433Z-3569c5ceff28428c8293c442c9436649`,
  byte-for-byte copy. **Unmodified by this correction.**
- `root_safe_capture.zip` — preserved root-safe run `cap03-p1-20261027T133547Z-edc19dfb4f0e4dc997ea15854187c50f`,
  byte-for-byte copy. **Unmodified by this correction.**
- `captured_root_safe_instrument.ps1` — byte-for-byte copy of `02-executed-instrument.ps1` as present
  in `root_safe_capture.zip`: **11,257 bytes, CRLF line endings**, SHA-256
  `804a832296f326dff5ea1a8b3b0c779c3a7721d2db931e9a462ead648f5f6bd7`, Git blob
  `8a913f9a7223ef7c6d32d5a5274c84c21e8ec0d0`.
- `verify_assessment.py` — local integrity checks. **Unmodified by this correction.**
- `SHA256SUMS.txt` — hashes for all package files except itself.

## Line-ending canonicalisation of `captured_root_safe_instrument.ps1`

PR #333 committed this path as blob `811c6b63194b72859d180236eb944548c649f00e` — **11,043 bytes, LF**,
SHA-256 `95aa38118066a5fafdb75ebb4676beeb5701a9b3385a07877b5b1cbd3a1d9532` — while `SHA256SUMS.txt`
described the original CRLF evidence bytes. The captured evidence had been line-ending-normalised
on the way in, so the committed bytes were not the evidence the manifest described, and
`INDEX.md`'s "byte-for-byte copy" statement was false of them.

This correction **restores the original CRLF evidence bytes** rather than editing the manifest to
match the normalised copy. `.gitattributes` now carries an exact-path `-text` rule for this file so
the bytes are stored and checked out exactly, regardless of any `core.autocrlf` setting. `-text` and
not `text eol=lf`: the canonical evidence bytes *are* CRLF, so an `eol=lf` rule would itself destroy
the evidence. Mechanism, reproduction and the restored identities are recorded in
`evidence/integration/cap03-p1c-p1d-evidence-reconciliation-correction-2026-10-27/`.

Neither capture archive was opened for writing, reconstructed, replaced, recombined or mixed with the
other; both run identities remain separate.

## Checks actually performed, and their results

| Check | Result |
|---|---|
| `verify_assessment.py` at base commit `d8a4f77850ad0b45695282d6bfa20e51921f19e8`, unmodified | **FAIL**, exit 1 — `sha256 mismatch: captured_root_safe_instrument.ps1` (`95aa3811…` committed vs `804a8322…` listed) |
| `verify_assessment.py` at the corrected candidate commit, **still unmodified** | **PASS**, exit 0 — all three packaged-input hashes and all 24 earlier-archive manifest entries verified |
| `SHA256SUMS.txt`, all 7 listed files vs committed bytes at the candidate commit | **7/7 MATCH** (verified by `verify_correction.py` in the correction bundle) |
| `earlier_capture.zip` / `root_safe_capture.zip` SHA-256 unchanged from PR #333 | **MATCH** — `950857083…` / `1294c4d2…` |
| v2 instrument live blob, byte length and SHA-256 re-read from authoritative Git objects | **MATCH** §16.154.8 exactly |

The §16.155 ledger entry `V1062` ("package manifest and all seven listed hashes verified") was **not
reproducible at the commit that published it**; it is superseded by §16.156 and becomes true only at
the corrected candidate commit.

## Superseded conclusions

§16.156 supersedes exactly two conclusions carried by this package and by §16.155, and nothing else:

1. that the SHA-256 recorded for the v2 root-safe instrument by §16.154.8 was a 65-character,
   invalid digest — it is a **valid 64-character** digest that reproduces from the live published blob;
2. that the permitted three-substitution derivative relationship of the root-safe capture was wholly
   "unproven" — its **content-level** relationship to the designated v2 source is now reproducibly
   established from authoritative bytes, with a defined **host-locus** residual.

No pin, instrument source, procedure step, PF-17 requirement, F4/F5 value, acceptance status or gate
is changed by this package or by §16.156. `P-1-C` remains **NOT ESTABLISHED**; `P-1-D` remains
**DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT**; `P-1`
remains **NOT EXECUTED / UNSPENT / NOT AUTHORIZED**.
