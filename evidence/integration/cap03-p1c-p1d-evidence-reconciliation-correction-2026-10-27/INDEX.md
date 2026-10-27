# CAP-03 evidence-reconciliation integrity correction package

Record `IIPS-V3-CAP03-P1C-P1D-EVIDENCE-RECONCILIATION-CORRECTION-2026-10-27-01`; tracker **§16.156**
(`CV-CORR-136`, `CHG-2026-10-27-16`). Focused report:
[`docs/integration/IIPS_v3.0_CAP03_P1C_P1D_EVIDENCE_RECONCILIATION_CORRECTION_2026-10-27.md`](../../../docs/integration/IIPS_v3.0_CAP03_P1C_P1D_EVIDENCE_RECONCILIATION_CORRECTION_2026-10-27.md).

Base commit `d8a4f77850ad0b45695282d6bfa20e51921f19e8` / tree
`334702f9a98297ce3fa4cccd8f133839752955ca` (PR #333 merge). IPD read-only: **0 writes**.

## Contents

| File | Role |
|---|---|
| `00-live-authority-verification.json` | Live re-verification of the base commit/tree, IPD `main`, and the v1/v2 instrument identities read from authoritative Git objects — proves §16.154.8's v2 digest is a **valid 64-character** value that reproduces |
| `01-digest-occurrence-census.json` | Exhaustive census of every `13783385`-prefixed digest at the base commit (64-char ×9, 65-char ×1) and the exact single-extra-`8` transcription relationship |
| `02-eol-normalisation-defect.json` | The affected path, original evidence bytes, bytes PR #333 committed, all hashes, the **empirically reproduced** CRLF→LF mechanism across five settings, and the byte-preserving correction |
| `03-derivative-reconstruction.json` | Reproducible derivative reconstruction of **both** captures against their designated sources, with an explicit confidence boundary and the host-locus residuals |
| `04-package-verification.txt` | Raw transcript: `verify_assessment.py` FAIL at the base commit, PASS unmodified at the candidate commit, `sha256sum -c` 7/7, and `verify_correction.py` 19/19 |
| `05-boundary-attestation.json` | Exactly what changes, and the full list of what does not — pins, instruments, procedure, PF-17, F4/F5, store, IPD, host, gates |
| `verify_correction.py` | Read-only verifier for this correction (19 checks); fails closed on any mismatch |
| `SHA256SUMS.txt` | Hashes for every file in this package except itself |

Every value in these files was **computed** from authoritative bytes and live Git objects at generation
time; none is transcribed from a prior record.

## What this package does

1. **Supersedes a demonstrably false conclusion.** §16.155 asserted that §16.154.8's SHA-256 for the v2
   root-safe instrument had 65 hex characters and was invalid. The authoritative value is
   `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e` — **64 characters**, reproducing
   from the live published blob `191f5828461286b0f6fcb688b023da5dfc68a265` (10,990 B). §16.154.8 is
   vindicated and unchanged; §16.155's conclusion is superseded.
2. **Restores byte-preserving evidence storage.** `…/cap03-p1c-p1d-evidence-reconciliation-2026-10-27/captured_root_safe_instrument.ps1`
   is returned to its original **11,257-byte CRLF** evidence form (blob `811c6b63…` → `8a913f9a…`) and
   protected by an exact-path `-text` rule. The reconciliation package's **original, unmodified**
   `verify_assessment.py` now passes.
3. **Records derivative findings at their correct confidence.** Earlier capture → v1: **byte-exact**.
   Root-safe capture → v2: **content-level established** (three confined opcodes at lines 22, 27–28 plus
   one trailing newline), with CRLF provenance and the absent in-session byte-diff left as **host-locus
   unverified residuals**. **R-4 is narrowed, not closed.**

## What this package does not do

No instrument source, execution pin, procedure step, PF-17 requirement, F4/F5 value, acceptance status
or gate is changed. No historical record is edited: the PR #333 report, `assessment.json`,
`verify_assessment.py` and **both capture archives** are preserved byte-for-byte, and the two run
identities remain separate and unmixed. Nothing was invoked, derived for execution, captured, or sent to
any host; IPD was read-only.

**PF-17 is not satisfied by this correction.** Its capture limb remains `NOT EVIDENCED` and is
host-locus; a repository correction is not host evidence. `P-1-C` remains **NOT ESTABLISHED**; `P-1-D`
remains **DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT**;
`P-1` remains **NOT EXECUTED / UNSPENT / NOT AUTHORIZED**.
