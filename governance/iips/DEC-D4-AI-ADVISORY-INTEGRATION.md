# DEC-D4-AI-ADVISORY-INTEGRATION — D4 Integration Execution Record

- **Record ID:** `DEC-D4-AI-ADVISORY-INTEGRATION`
- **Title:** D4 — AI Advisory Integration, Matrix Integration and Non-Engine Certified-Surface Treatment
- **Class:** `DECISION` / `EXECUTION RECORD`
- **Status:** `RECORDED — D4-A, D4-B, D4-C EXECUTED AND VERIFIED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `G-AI-IMPL / PROGRAM v3.0 D4 INTEGRATION EXECUTION`.
  Mutation authority was granted explicitly and scoped to **M1 → M4 only**. Decisions D4-A,
  D4-B and D4-C were selected by the maintainer at the preceding
  `PROGRAM v3.0 / IES CAPABILITY RE-BASELINE — D4 AI ADVISORY INTEGRATION AUTHORITY GATE`.
- **Scope:** the three authorized mutations plus this record. No engine, no
  `iips-platform/**`, no evidence artifact, no methodology change, no certification change,
  no release or tag promotion, no P7 action.

---

## 1. DECISIONS

| Decision | Outcome |
|---|---|
| **D4-A** | **Fast-forward integration** of the certified AI Advisory implementation into `phase13-next` |
| **D4-B** | **Matrix cherry-pick after M1** — cherry-pick `027c38cc…` onto the M1 tip; the resulting commit has a **new SHA** and the original `027c38cc` SHA is **not** preserved |
| **D4-C** | **Separate non-engine certified-surface subsection** (`### 3.2`), **A2-partial**, carrying the Option-D H/I/J limitation; **no 15th engine row** |

## 2. RESULTING SHAs

| Step | Operation | Resulting commit | Parent |
|---|---|---|---|
| **M1** | `git merge --ff-only f63a9b493118643725568a95b86405a5835a30a0` on `phase13-next` | `phase13-next` → **`f63a9b493118643725568a95b86405a5835a30a0`** (fast-forward, **no new commit**) | `85bbd49cd31c…` |
| **M2** | `git cherry-pick 027c38cc323a8834175edc4cbe8f3b272aed9522` | **`33dc1a7d7feafe13deb02361cde695b7921b652a`** (new SHA) | `f63a9b493118…` |
| **M3** | edit `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`, commit normally | **`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`** | `33dc1a7d7fea…` |
| **M4** | this governance record on `arena` | see §6 | `9610a23e355e…` |

Final `origin/phase13-next` = **`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`**.
Chain: `85bbd49cd31c` → `e5d59981` → `f63a9b493118` → `33dc1a7d7fea` → `357b34dac1bd`.

**`027c38cc323a8834175edc4cbe8f3b272aed9522` SHA is NOT preserved.** `refs/heads/program-v3-matrix-rebaseline`
still points at it and was **not modified**; its disposition remains an open decision.

## 3. M1 — AI ADVISORY INTEGRATION: VERIFIED

```
operation   git merge --ff-only f63a9b493118643725568a95b86405a5835a30a0
result      Updating 85bbd49..f63a9b4  Fast-forward
            13 files changed, 1444 insertions(+), 3 deletions(-)
merge commits created   0
push        85bbd49..f63a9b4  phase13-next -> phase13-next   exit 0, non-force
```

| Verification | Result |
|---|---|
| Exactly the certified 13-path surface landed | **13 files** — 5 A + 8 M, matching `DEC-G-AI-IMPL-CERTIFICATION` |
| `iips-platform` | **0** changed |
| `ies-*` / `iips-cross-sector` | **0** changed |
| `docs` / `governance` | **0** changed |
| `program-v1.1-certification` | **0** changed |
| `ROADMAP.md` / `README.md` / `RELEASES.md` | **0** changed |
| Ten fences vs `85bbd49` | **all 10 PASS, 0 failures** (`routes.ts` `ea1fd329460a`, `navigation.ts` `03fcf14d7db9`, `Sidebar` `f1d22d3d0536`, `AppShell` `e05b823faf9e`, `App` `15e638ed5b6f`, `admin-transport.ts` `a32d485ae450`, `secured-executor.ts` `f85692ddd0be`, replay baseline `63bcd350f2cd`, `ROADMAP.md` `b5485618f8db`, matrix `4967b0232afc` — all unchanged by M1) |
| Other refs after push | all **UNCHANGED**; ref count 9 |

## 4. M2 — MATRIX INTEGRATION: VERIFIED

```
operation   git cherry-pick 027c38cc323a8834175edc4cbe8f3b272aed9522
result      [phase13-next 33dc1a7] docs(v3.0): re-baseline the Engine Integration
            Verification Matrix (D3-1..D3-5)
            1 file changed, 47 insertions(+), 17 deletions(-)
conflict    NONE — conflict was impossible: the pre-image blob at 85bbd49
            (4967b0232afc…) is identical to the blob at f63a9b49, so the
            three-way merge had identical base and "ours" sides
resulting matrix blob   2600ebe3249870a512d6d7baf4386d54f0b5ae41
                        == 027c38cc's post-image (verified identical)
push        f63a9b4..33dc1a7  phase13-next -> phase13-next   exit 0, non-force
```

| Verification | Result |
|---|---|
| Files changed by the commit | **1** — `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` only |
| `iips-platform` / `governance` / `frontend` / `ies-*` / `iips-cross-sector` | **0** each |
| `ROADMAP.md` / `README.md` / `RELEASES.md` | **0** |
| 14 engine capability rows | **14**, all engine ID / implementation / runtime-link / certification-evidence cells **byte-identical** |
| A–F classification key | **byte-identical** |
| Class / Evidence values | Class = `{A}` only; Evidence = **7 A1 / 7 A2** |

**Execution note (disclosed).** The first `git cherry-pick` invocation applied and staged
the change and set `CHERRY_PICK_HEAD`, then aborted at the commit step with
`fatal: empty ident name` because the freshly created clone had no committer identity.
No repair or improvisation was performed: the committer identity was configured
(`IIPS Governance <governance@iips.local>`, the same identity used for every prior
governance commit), the staged content was verified to be exactly the authorized
amendment (1 file, +47/−17, blob `2600ebe32498…`), and the **same** cherry-pick was
completed with `git cherry-pick --continue --no-edit`. The resulting tree is byte-identical
to `027c38cc`'s.

## 5. M3 — AI ADVISORY MATRIX TREATMENT: VERIFIED

```
operation   replace the D3-4 forward reference with "### 3.2 Non-engine certified surfaces"
result      [phase13-next 357b34d] docs(v3.0): record AI Advisory as a non-engine
            certified surface (D4-C)
            1 file changed, 39 insertions(+), 3 deletions(-)
push        33dc1a7..357b34d  phase13-next -> phase13-next   exit 0, non-force
```

Recorded in §3.2:

- AI Advisory as a certified **non-engine** surface at
  `f63a9b493118643725568a95b86405a5835a30a0`;
- evidence maturity **A2 — partial**, citing `governance/iips/DEC-D5-EVIDENCE-MATURITY.md`,
  with the explicit statement that **A2 does not mean capability failure, de-certification,
  or an evidence-blocked capability**;
- certified scope is **exactly the previously certified 13-path implementation delta**, no
  wider; **no `ENGINE_FACTORY` registration and no `sector.*` engine ID**;
- the Option-D limitation carried **exactly as certified**: **H**, **I**, **J** all
  **NOT PERFORMED**, recorded as a **limitation, not a failure**, **not** recorded as PASS,
  and **not self-clearing**;
- certification source `governance/iips/DEC-G-AI-IMPL-CERTIFICATION.md`, with
  `governance/iips/DEC-G-AI-IMPL-CERT-CRITERIA.md` (Option D);
- criteria **A–F, K, L, M1–M3 PASSED**; *"No unavailable test is recorded as PASS."*

| Verification | Result |
|---|---|
| Files changed | **1** — the matrix only |
| **No 15th engine row** | per-engine table remains **exactly 14 rows**; every engine row **byte-identical** |
| A–F classification key | **byte-identical** |
| §3.1 evidence-maturity block | **byte-identical** (1,573 chars before and after), including the D5-S1 statement that the threshold **remains unquantified**, that **no numeric threshold is authorized** and **none may be inferred**, and that **D5-S1 remains an open methodology sub-gap** |
| Everything before §3.1 | **byte-identical** |
| Everything from §4 onward | **byte-identical** |
| D5-S3 | **not decided**, not referenced as decided |
| P7 | **0 occurrences** before and after |
| Certification scope | **unchanged** |
| Fences after M3 | `routes.ts`, `navigation.ts`, `Sidebar`, `AppShell`, `App`, `admin-transport.ts`, `secured-executor.ts`, replay baseline, `ROADMAP.md` all **UNCHANGED** vs `85bbd49`; `iips-platform` **0** differing; `ies-*`/`iips-cross-sector` **0** differing |
| AI Advisory still within the certified 13-path scope | `85bbd49`→`f63a9b49` = **13** files, unchanged |

The matrix is itself fence 9b. Its change is the **authorized D3/D4 amendment**, not drift:
`4967b0232afc…` → `2600ebe32498…` (M2, authorized by D3) → the M3 blob (authorized by D4-C).

## 6. M4 — THIS RECORD

Created `governance/iips/DEC-D4-AI-ADVISORY-INTEGRATION.md` on `arena`. Authority-only
commit; pushed **only** `refs/heads/arena/01a03e3b-iips-review-recovered`, non-force.
No historical record rewritten; no other governance file touched.

## 7. GUARDRAILS — ALL HONOURED

| Prohibited | Status |
|---|---|
| Modify `gai-impl-canonical` | **NOT DONE** — remains `f63a9b493118…` |
| Modify `program-v3-matrix-rebaseline` | **NOT DONE** — remains `027c38cc323a…` |
| Modify `phase13-hardening-delivery` | **NOT DONE** — remains `254e47233e63…` |
| Modify `main` | **NOT DONE** — remains `c65d53373717…` |
| Modify any engine or `iips-platform/**` | **NOT DONE** — 0 files differing vs `85bbd49` |
| Create evidence artifacts | **NOT DONE** |
| Change A1/A2 methodology | **NOT DONE** — §3.1 byte-identical |
| Define D5-S1 | **NOT DONE** — remains explicitly unquantified |
| Decide D5-S3 | **NOT DONE** — remains pending |
| Resolve D2 | **NOT DONE** — remains pending |
| Reopen P7 | **NOT DONE** — 0 occurrences |
| Restore `ies-005…009` | **NOT DONE** — 0 tracked files |
| Perform H/I/J live validation | **NOT DONE** — recorded as NOT PERFORMED |
| Alter certification | **NOT DONE** — `DEC-G-AI-IMPL-CERTIFICATION` blob `968ad4bf8e8f…` unchanged |
| Promote any version / release / tag | **NOT DONE** — 1 annotated tag, unchanged |
| Force-push | **NOT DONE** — all three pushes fast-forward, non-force |
| Merge / rebase / squash the AI Advisory implementation | **NOT DONE** — `--ff-only`, 0 merge commits, both AI Advisory commits preserved verbatim |

## 8. OPEN ITEMS CARRIED FORWARD

| Item | Status |
|---|---|
| **D2** dangling vocabulary | **PENDING** — not brought into this gate. Recorded: `N+5` **does** have a referent (Program v3.0 Company Intelligence, 4 files); `N+4` is the series member with none; `PC-4`, `TRIM-S`, `TRIM-V`, `HARVEST`, `NO-DECISION` have no referent; `EXIT` hits are `exit 0` false positives |
| **D5-S1** regression threshold | **EXPLICITLY UNQUANTIFIED** — no threshold authorized, none may be inferred; the 7/7 split is unchanged for any threshold 0–4 |
| **D5-S3** A2 → A1 | **UNDECIDED** |
| **H / I / J** | **OPEN as recorded Option-D limitations** — not self-clearing |
| Disposition of `program-v3-matrix-rebaseline` | **UNDECIDED** — the branch still exists at `027c38cc…`; its content is now on `phase13-next` via `33dc1a7d…` |

## 9. CLASSIFICATION

# **D4-A, D4-B, D4-C EXECUTED AND VERIFIED**

The certified AI Advisory implementation is integrated into `phase13-next` by pure
fast-forward; the D3 matrix re-baseline is integrated by conflict-free cherry-pick; and AI
Advisory is recorded as a non-engine certified surface at **A2-partial** with the Option-D
H/I/J limitation carried exactly as certified. No engine, methodology, certification,
release or P7 state was altered.
