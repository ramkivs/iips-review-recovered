# CAP-03 P-1-C / P-1-D — PA-Authorized Evidence Reconciliation

**Record ID (proposed for IRR publication):** `IIPS-V3-CAP03-P1C-P1D-PA-AUTHORIZED-EVIDENCE-RECONCILIATION-2026-10-27-01`
**Assessment scope:** IRR-only; IPD read-only. This file is a prepared assessment artifact, **not yet published or effective**.

## PA authorization and capture lineage

The PA expressly authorized including the preserved earlier capture in the CAP-03 assessment because it records the PF-11 ancestor-walk defect that prompted the root-safe correction. Both captures are retained byte-for-byte in this package. Their run identities and evidence must remain distinct.

- Earlier run: `cap03-p1-20261027T110433Z-3569c5ceff28428c8293c442c9436649`
  ZIP SHA-256: `950857083cb73295cd3a1da1ac6f339e1adce8f6f210fdd98ec0efb4dc026146`
- Root-safe run: `cap03-p1-20261027T133547Z-edc19dfb4f0e4dc997ea15854187c50f`
  ZIP SHA-256: `1294c4d28713a38770da4e8b93d1a96b01b5379dda39534af2723a3436a42571`

## Findings

### 1. Earlier capture — defect preserved and established

The earlier PF-11 output contains `Join-Path` and `Split-Path` errors when the ancestor traversal reaches an empty path. Consequently, that run's `InsideGitWorktree=False` result cannot be accepted as proof that the target is outside every Git worktree. The capture remains useful historical corrective evidence and is included under PA authorization.

The earlier archive contains its run-specific authority parameters, three step-0 source-hash observations, PF-17 consumption-register observation, attempt-session declaration, byte-diff JSON, operator transcript, directory listing and SHA-256 manifest. All **24 manifest-listed file hashes** were recomputed from the archive and matched; no manifest discrepancy was found. The operator transcript identifies PowerShell 7.6.8/Core, which is not Windows PowerShell 5.1. These records apply to the earlier run only.

### 2. Root-safe capture — corrected observation, incomplete acceptance envelope

The root-safe PF-11 output contains `InsideGitWorktree=False` and no reported ancestor-walk error. This is a materially improved observation and addresses the specific traversal defect visible in the earlier capture. It does not by itself establish all other P-1-C/P-1-D acceptance criteria.

The supplied root-safe ZIP contains the run parameters, PF-01 through PF-10, PF-11/12/13, PF-14, PF-15, the executing script and its self-digest. It does **not** contain the run-specific authority parameters, step-0 source-hash observations, PF-17 record, attempt-session declaration, byte-diff proof, operator transcript, complete directory listing or host-generated SHA-256 manifest. This means those items are **not present in the supplied ZIP**; it does not prove that they do not exist elsewhere.

### 3. Instrument identity discrepancy — must be resolved from current remote IRR main

The root-safe capture's `02-executed-instrument.ps1` is byte-identical to the supplied root-safe script: **11,257 bytes**, SHA-256 `804a832296f326dff5ea1a8b3b0c779c3a7721d2db931e9a462ead648f5f6bd7`. The previously recorded SHA-256 value `13783385cb8a7964387868ad96f05956cceb9b7d4ead0488c0cfe72b325e6748e` contains 65 hexadecimal characters, so it is malformed and must not be treated as a valid SHA-256 digest. The previously recorded Git blob identity is `191f5828461286b0f6fcb688b023da5dfc68a265` (10,990 bytes). The live repository publication step must verify that blob identity against fetched IRR `main` and calculate the actual SHA-256 directly; this report does not assert a corrected SHA-256 value. These source bytes differ from the 11,257-byte captured derivative. The procedure permits a derivative, but the required three-substitution byte-diff proof is absent from the supplied root-safe ZIP, so the derivative relationship remains unproven.

Therefore, on the currently available evidence, the root-safe run cannot be certified as executing the exact governing published instrument. This is a repository identity reconciliation item, not a reason to discard the earlier capture, and not permission to rerun anything. Resolve against live authoritative IRR `main` and published correction record before deciding whether the captured script was a stale copy, a subsequent published revision, or a record-coordinate discrepancy.

### 4. Store path and safety boundary

Both captures reproduce F4 exactly as `C:\iips-data\iips\user-portfolio.sqlite`. Both report the store and SQLite sidecars absent at their respective observation times. Both instrument runs are read-only preflight captures; neither grants nor consumes P-1 execution authority. No evidence in these archives authorizes creating the parent, database or sidecars.

## Disposition

| Item | Current evidence-based disposition |
|---|---|
| Earlier PF-11 | Error confirmed; `InsideGitWorktree=False` from that run is not reliable proof |
| Root-safe PF-11 | Corrected traversal observation reported without errors in supplied output |
| Root-safe instrument identity | **Permitted-derivative proof absent**: captured bytes are 11,257 / `804a832296f326dff5ea1a8b3b0c779c3a7721d2db931e9a462ead648f5f6bd7`; verify live published source by Git blob `191f5828461286b0f6fcb688b023da5dfc68a265` (10,990 bytes) and compute its SHA-256 directly. The previously recorded SHA-256 string has 65 hex characters and is invalid. The required three-substitution byte diff remains unproven |
| Root-safe envelope integrity | Incomplete in supplied ZIP; no host manifest/listing or several required run-specific supplements |
| P-1-C | **NOT ESTABLISHED** |
| P-1-D | **DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT** |
| P-1 | **NOT EXECUTED / UNSPENT / NOT AUTHORIZED** |
| F4 / F5 | Unchanged |
| IPD writes | 0 |

## Publication status and required repository handling

This assessment has been prepared from the two supplied archives and the supplied root-safe instrument file. It has **not** been committed to or published in IRR `main`; no repository-write/PR capability is available in this session. Do not record this local artifact as an effective decision or tracker update.

The authorized repository pass must: (1) verify the live remote IRR instrument blob and bytes; (2) preserve and cross-reference both captures without mixing run-specific evidence; (3) update the existing authoritative tracker with this disposition; and (4) use the normal exact-head CI, merge, post-merge CI and independent remote byte read-back process. IPD remains read-only. No host recapture is prescribed by this assessment.
