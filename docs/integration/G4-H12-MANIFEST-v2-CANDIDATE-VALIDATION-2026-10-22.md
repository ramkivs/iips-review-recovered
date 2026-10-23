# G4-H12-MANIFEST-v2 candidate — baseline content-integrity validation

**Prepared record ID:** `IIPS-V3-G4-H12-CANDIDATE-VALIDATION-2026-10-22-01` (documentation-only validation report; not adoption or qualification evidence)

**Status: PARTIAL BASELINE CONTENT-INTEGRITY VALIDATION; FULL VALIDATION BLOCKED.**
**Adoption: NOT ADOPTED.**
**Gate 4: PROPOSED — NOT EFFECTIVE / NOT AUTHORIZED / NOT STARTED.**

## Subject and exact artifact identity

- Candidate: [`G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json`](./G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json)
- Candidate SHA-256 over exact JSON file bytes: `3eedd70c994271dfc9ac23bd603f7a9e2f273cb1a68d3172cd3a7737344096ae`
- IPD baseline: `1cceacfff40f22dbc9cd64906bf26a5feac1075e`, tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`
- IRR QE consumer code basis: `d355d904aa52988e70a98324714886f6a1c0ea2a`, tree `e631cf3287fc19a2d1c8f73a0eb5f8d640370e27`
- IRR proposal/documentation basis: `f741298fc73372a27c822b7f9018702216b59cfd`, tree `b9e88cde55c0c8694f42f90c60ae3cbce1a081d2`
- Historical Gate C comparison: IPD `cec7080252183a6a5332efe351e61c254d342a2d`, tree `22a7438bc41e5b9853700c5a3737702898da8c53`

## Validation performed

Compared each present entry's exact commit, root tree, path, Git blob object ID (SHA-1), SHA-256 of unmodified `git cat-file blob` bytes, byte length, LF/CRLF/bare-CR counts, and newline classification. No content conversion, normalization, worktree filters, or `autocrlf` bytes were used. Checked the candidate's entry counts, the explicitly absent paths, the historical membership set, and its exact path-set delta.

| Scope | Verified | Result |
|---|---:|---|
| Present source/config/test entries at the pinned baselines | 55/55 | PASS |
| Authoritative criteria references | 9/9 | PASS |
| Gate 3 §4.1 frozen-anchor identities | 10/10 | PASS |
| Historical H-12 entries at the Gate C pin | 17/17 | PASS |
| Conditional helper `scripts/test-summary-parser.mjs` at accepted IPD baseline | Absent, as recorded | PASS for baseline-state consistency only |
| Mandatory future Limb A path `tests/g4_run_tests_summary_parsing.test.ts` at accepted IPD baseline | Absent | **BLOCKER — expected future output is not present and cannot be digest-validated yet** |
| Historical-to-current IPD membership comparison | 4 overlap / 13 historical-only / 28 current-only | PASS; explanatory path delta is in the candidate JSON |

There were no mismatched commit/tree IDs, blob IDs, SHA-256 values, byte lengths, or line-ending counts for the present entries. This confirms the **current-baseline bytes only**. It does not validate the future Limb A tree, runtime artifacts, QE deposit, Windows worktree bytes, or the adequacy/adoption of the proposed path set.

## Why this is not full validation

`tests/g4_run_tests_summary_parsing.test.ts` is a mandatory qualified-tree path, but it does not exist at IPD `1cceacfff40f22dbc9cd64906bf26a5feac1075e`. Its absence is an unresolved required absence, not an accepted omission and not a passing conditional. Therefore the candidate cannot be described as fully validated, and PA must not adopt it as an executable H-12 baseline on this evidence. The path must be created only under the separate Limb A authority, then the complete manifest must be regenerated/rechecked against the exact final merged IPD commit and tree before host preflight and QE. Any change to membership, criteria, IRR consumer blobs, anchor identities, helper presence, hash domains, or line-ending policy requires explicit PA resolution rather than silent re-pinning.

## Reproduction notes

Use the Git object database for the commit named by each manifest entry. For every `PRESENT` entry, confirm `git rev-parse <commit>^{tree}` equals its recorded tree, `git rev-parse <commit>:<path>` equals its SHA-1 blob ID, and hash the raw bytes returned by `git cat-file blob <blob-id>` with SHA-256. Count CRLF as `b"\r\n"`, bare CR as `count(b"\r") - count(b"\r\n")`, and LF as `count(b"\n") - count(b"\r\n")`. Verify all 17 historical entries against their own pinned commit/tree. For expected-absent paths, require `git cat-file -e <commit>:<path>` to fail and preserve the absent state explicitly; do not fabricate a digest. A future complete validation must additionally verify the mandatory test at the final merged Limb A commit and include the compiled `dist` and evidence-deposit manifests at their actual execution/deposit pins.
