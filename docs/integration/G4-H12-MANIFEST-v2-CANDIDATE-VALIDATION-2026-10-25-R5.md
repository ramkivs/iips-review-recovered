# G4-H12-MANIFEST-v2 candidate — regenerated at the CAP-03 DQ-6b Path A interim split baseline (R5)

| Field | Value |
|---|---|
| **Prepared record ID** | `IIPS-V3-G4-H12-CANDIDATE-VALIDATION-2026-10-25-R5` (census before this record: **0**) |
| **Record type** | Documentation-only validation report for a **candidate**. Not adoption, not qualification, not Gate 4 evidence |
| **Status** | **BASELINE CONTENT-INTEGRITY VALIDATED AT THE R5 CANDIDATE COORDINATES; ADOPTION AND RUNTIME-ARTIFACT VALIDATION OUTSTANDING** |
| **Adoption** | **NOT ADOPTED** |
| **Gate 4** | **AUTHORIZED — NOT STARTED**; QE `0/11` |
| **Regeneration authority** | `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01` (Path A, condition `C-4`) plus the one-pass instruction to regenerate and validate H-12 against the exact candidate commits at the required 32-IPD / 24-IRR structure |

---

## 1. Subject and exact artifact identity

- Candidate: [`G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json`](./G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json)
- Candidate SHA-256 over exact file bytes: `d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76`
- Byte length: `143,813`
- Superseded predecessor, **preserved unmodified**: `G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json`, SHA-256 `3eedd70c994271dfc9ac23bd603f7a9e2f273cb1a68d3172cd3a7737344096ae` (re-hashed this pass; matches the value recorded on 2026-10-22)

| Coordinate | Commit | Tree |
|---|---|---|
| IPD primary (qualified tree) | `8eec74ae27cda09f3c368b9c299895eae41554db` | `4eba29029f8d95cfe483e615a7047426b298ce50` |
| IPD broker-import alias (raw-source build) | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` | `cc0f0117822850f9046e9a51bd05c1d45f80cd57` |
| IRR QE consumer | `ba64b2d5927c2f872560710cf1474c25a5cde0d5` | `5e4262f1cd75bf13b76ced5b45058f31434b5dad` |
| Accepted Gate 3 implementation (preserved anchor basis) | `1cceacfff40f22dbc9cd64906bf26a5feac1075e` | `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9` |
| Historical Gate C comparison (unchanged) | `cec7080252183a6a5332efe351e61c254d342a2d` | `22a7438bc41e5b9853700c5a3737702898da8c53` |

---

## 2. Validation performed

Every present entry's exact commit, root tree, path, Git blob object ID (SHA-1), SHA-256 over
unmodified `git cat-file blob` bytes, byte length, LF/CRLF/bare-CR counts and newline classification
were re-derived **from the Git object database**, not from a worktree and not by copying the prior
candidate. No content conversion, normalization, worktree filter or `autocrlf` byte was used.

| Scope | Verified | Result |
|---|---:|---|
| Primary entries at the designated coordinates (**32 IPD + 24 IRR = 56**) | 56/56 | **PASS** |
| Authoritative criteria references | 9/9 | **PASS** |
| Accepted Gate 3 anchors, preserved at `1cceacff…` | 10/10 | **PASS** |
| Gate 3 anchors **re-measured** at the QE candidate coordinate | 10/10 | **PASS** (3 differ from the accepted anchor identities; recorded separately, not substituted) |
| Historical H-12 entries at the Gate C pin | 17/17 | **PASS** |
| Alias raw sources bound at the alias coordinate | 14/14 | **PASS** (10 identical to the primary, 4 divergent — enumerated) |
| Conditional helper `scripts/test-summary-parser.mjs` | **PRESENT** at `8eec74ae…` (blob `15c849fa…`) | **PASS** (state transition from R4's recorded absence) |
| Mandatory qualified-tree path `tests/g4_run_tests_summary_parsing.test.ts` | **PRESENT** at `8eec74ae…` (blob `49e901b6…`, 5,627 B) | **PASS** — R4's blocking absence is **resolved at this candidate** |
| Two IPD coordinates distinct and ancestry-clean | alias is an **ancestor** of the primary, 214 commits behind | **PASS** |
| **Total independent checks** | **981** | **0 failures** |

> **981 checks, 0 failures.** Exact counts: 56 primary + 9 criteria + 1 conditional + 10 preserved
> anchors + 10 re-measured anchors + 17 historical + 14 alias bindings, each contributing
> tree/blob/SHA-256/length/newline assertions, plus 14 structural assertions (entry counts, 32/24
> split, present/absent totals, coordinate distinctness, ancestry).

This validates the **current-baseline bytes only**. It does **not** validate compiled runtime
artifacts, the evidence-deposit manifest, native-Windows worktree bytes, or the adequacy and adoption
of the proposed path set.

---

## 3. What changed from R4 — 16 re-derived entries, no membership change

Path membership of the 56 primary entries, the 9 criteria references, the 10 accepted anchors and the
17 historical entries is **unchanged**. Sixteen entries carry re-derived bytes at the new coordinates:

| Path | Repo | R4 blob | R5 blob | Bytes |
|---|---|---|---|---|
| `src/ipc/dispatch.ts` | IPD | `6c8fcbc8…` | `27becc76…` | 12,223 → 12,670 |
| `src/ipc/entrypoint.ts` | IPD | `e3727bb5…` | `ae3edd12…` | 4,969 → 5,146 |
| `src/persistence/binding.ts` | IPD | `4c5ea0d5…` | `96d0079d…` | 3,791 → 4,112 |
| `src/persistence/durablePortfolioStorePort.ts` | IPD | `97c5bc65…` | `d95608d9…` | 2,893 → 3,360 |
| `src/persistence/portfolio_store.ts` | IPD | `2ee96301…` | `540d49f2…` | 14,376 → 34,084 |
| `tests/g3_portfolio_read_isolation.test.ts` | IPD | `7b978625…` | `69e36f68…` | 7,308 → 7,256 |
| `tests/g3_startup_validation.test.ts` | IPD | `9a5fd9e3…` | `edd0305e…` | 14,804 → 15,072 |
| `scripts/run-tests.mjs` | IPD | `fe1ab1a3…` | `05a0ea56…` | 4,974 → 5,015 |
| `tests/g4_run_tests_summary_parsing.test.ts` (conditional → primary) | IPD | *(absent)* | `49e901b6…` | — → 5,627 |
| `package.json` | IPD | `0a3eec22…` | `51796e63…` | 995 → 2,025 |
| `frontend/src/features/portfolio/portfolioStorePort.ts` | IPD | `d61f18df…` | `fd01731f…` | 16,205 → 19,997 |
| `frontend/server/user-portfolio/ipcPortAdapter.ts` | IRR | `aa8bcfb8…` | `1e20e980…` | 23,420 → 27,511 |
| `frontend/server/user-portfolio/ipcPortAdapter.test.ts` | IRR | `5f179187…` | `46243a7a…` | 37,821 → 45,566 |
| `frontend/server/executive-transport.ts` | IRR | `53bc5e37…` | `a438eec0…` | 48,191 → 49,611 |
| `frontend/package.json` | IRR | `a6a0521c…` | `83058ea2…` | 1,347 → 1,888 |
| `frontend/package-lock.json` | IRR | `4f068d98…` | `744355e9…` | 127,254 → 128,442 |

The five IRR changes are the expected consequence of the **already-effective** decisions and merges:
DR-2/DQ-1 Option A (`ipcPortAdapter.ts` + its test), and manifest/lockfile/transport movement through
admitted mainline work. None is a silent re-pin. The eleven IPD changes are the bytes at IPD `main`
across the 94 commits after the R4 Gate 3 pin `1cceacff…`.

### 3.1 The one state change that matters

`tests/g4_run_tests_summary_parsing.test.ts` was R4's **single blocker**: a mandatory qualified-tree
path that did not exist at `1cceacff…`, so "the complete future qualified tree cannot yet be
validated". At `8eec74ae…` it exists, together with its conditional helper, because commit
`c62dee81748aaed6416956b2e323ce77d1ff1f3c` ("CAP-02: implement bounded Gate A prime and Limb A work",
2026-10-23) is an ancestor of IPD `main`.

**Boundary, stated to prevent over-reading:** presence and digest binding are **content-integrity
facts**. They are **not** Limb A acceptance, **not** qualification, **not** Gate 4 credit and **not**
QE evidence. The path is now *bound*; whether its content is *accepted* is a separate act that has not
been rendered.

---

## 4. Why the split baseline forces an explicit two-coordinate manifest

Path A freezes two IPD coordinates, not one. R5 therefore binds both, and classifies every alias raw
source against the primary:

| Classification | Count |
|---|---:|
| Byte-identical at both coordinates | **10 / 14** |
| Divergent at the coordinates | **4 / 14** |

Divergent: `frontend/src/features/portfolio/import/broker-holdings-mapper.ts` (`REAL` → `UNCLASSIFIED`
at three sites), `frontend/src/features/portfolio/import/broker-import-ingress.ts`,
`src/identity/security_master.ts`, `src/contracts/types.ts`.

**Overlap finding.** `src/identity/security_master.ts` is simultaneously a **qualified-tree entry at
the primary** (blob `60030e0c…`) and a **required alias raw source** (blob `e260fd90…`). The qualified
IRR build therefore contains two distinct `SecurityMaster` byte-sets at once: the primary coordinate
supplies the qualified-tree entry, and the alias coordinate supplies the copy compiled into
`.cache/broker-import`. A single-coordinate manifest would have recorded one of these and silently
lost the other. This is recorded in the manifest's `split_baseline.overlap_finding` so the split can
never be mistaken for a unified baseline.

---

## 5. Adoption boundary — unchanged in substance, updated in identity

`PA must adopt or replace this candidate's path membership, present/absent/conditional status, hash
domains, LF/CRLF treatment, criteria basis, the IRR QE consumer pin, and the re-measured Gate 3 anchor
identities before any executable use.`

Three points are recorded so adoption cannot be granted on a misreading:

1. **Re-measuring the accepted Gate 3 anchors is a measurement, not a re-pinning.** The accepted anchor
   set stays preserved at `1cceacff…` and is reported separately from the candidate-coordinate
   re-measurement. Approving the re-measured identities is an explicit adoption decision, not an
   implication of regeneration.
2. **The IRR QE consumer pin moved from `d355d904…` to `ba64b2d…`.** This is authorized by the
   effective record's own freeze direction ("at that later freeze, record the exact commits and trees;
   no silent re-pin") and by the landed DR-2 implementation — but it remains a PA-adoption item, not a
   subordinate choice.
3. **Membership did not change.** No entry was added to or removed from the 56, the 9, the 10 or the
   17. Only coordinates and the one declared present/absent state moved.

---

## 6. Reproduction notes

For every `PRESENT` entry: confirm `git rev-parse <commit>^{tree}` equals its recorded tree,
`git rev-parse <commit>:<path>` equals its SHA-1 blob ID, and hash the raw bytes from
`git cat-file blob <blob-id>` with SHA-256. Count CRLF as `b"\r\n"`, bare CR as `count(b"\r") −
count(b"\r\n")`, LF as `count(b"\n") − count(b"\r\n")`. Verify all 17 historical entries against their
own pinned commit. For expected-absent paths, require `git cat-file -e` to fail and preserve the
absence explicitly; never fabricate a digest. Re-run the same assertions for the 10 preserved anchors,
the 10 re-measured anchors and the 14 alias bindings.

Executed this pass as `981 checks, 0 failures`; the validator and generator are preserved verbatim as
`22-h12-r5-validator.py` and `23-h12-r5-generator.py` under
[`evidence/integration/cap03-dq6b-path-a-2026-10-25/`](../../evidence/integration/cap03-dq6b-path-a-2026-10-25/),
with the run output at `20-h12-r5-validation.txt` and the digest/byte measurements at
`21-h12-r5-digests.txt`.

*End of `IIPS-V3-G4-H12-CANDIDATE-VALIDATION-2026-10-25-R5` — CANDIDATE VALIDATED; NOT ADOPTED; Gate 4
NOT STARTED; QE 0/11.*
