# DEC-G-AI-IMPL-COL-RESOLUTION — 3-Path Collision Resolution Authority

- **Record ID:** `DEC-G-AI-IMPL-COL-RESOLUTION`
- **Title:** 3-Path Collision Resolution — COL-1…COL-5 Authorized
- **Class:** `DECISION`
- **Status:** `RECORDED — COL-1…COL-5 AUTHORIZED`
- **Date/time:** 2026-08-27
- **Authority relationship:** gate `G-AI-IMPL COLLISION RESOLUTION AUTHORITY`. Authorized explicitly
  by the maintainer as outcome **A — AUTHORIZE COL-1 THROUGH COL-5**, with separate recording
  authority granted for the specification amendment and this record.
- **Scope:** resolves the contradiction between the 13-path implementation surface and fence 10.
  Amends `SPEC-G-AI-IMPL` §5 only. Does **not** authorize implementation, checkout, deletion,
  worktree unblocking, commit target, or certification.
- **Supersession / revision:** supersedes `DEC-G-AI-IMPL-COL-AMEND` (which recorded the outcome
  **D — REMAIN DEFERRED**). `DEC-G-AI-IMPL-COL-AMEND` remains as history.
- **SPEC amendment:** `SPEC-G-AI-IMPL` §5 fence 10 amended and §5.1 added.
  Prior blob `dcb89af0fcf841caa42c852871ac859fa29a9407`; amended blob recorded in the commit.

---

## 1. DECISION

# **A — COL-1 THROUGH COL-5 AUTHORIZED**

| Decision | Outcome |
|---|---|
| **COL-1** — fence 10 is an evidence-preservation constraint, not a permanent pathname reservation | **AUTHORIZED** |
| **COL-2** — the three paths may be created at their canonical NEW locations after transition, without copying/restoring the recovered files | **AUTHORIZED** |
| **COL-3** — preservation of the six recovered blobs on arena/history satisfies the recovery-evidence preservation requirement | **AUTHORIZED** |
| **COL-4** — the three canonical files must be independently authored from SPEC/authority, with recovered files remaining evidence only | **AUTHORIZED** |
| **COL-5** — the existing 13-path surface remains authoritative without relocation | **AUTHORIZED** |

**SPECIFICATION AMENDMENT: AUTHORIZED AND APPLIED** to `SPEC-G-AI-IMPL` §5 (fence 10 wording) and
new §5.1.

---

## 2. VERIFIED PRECONDITIONS

| Check | Result |
|---|---|
| COL-1…COL-5 previously DEFERRED | **YES** — per `DEC-G-AI-IMPL-COL-AMEND` |
| `SPEC-G-AI-IMPL` byte-identical before amendment | **YES** — `dcb89af0fcf841caa42c852871ac859fa29a9407` at both `aed45df` and `bd81478` |
| Fence 10 unchanged before amendment | **YES** — verbatim as recorded |
| The three collisions unchanged | **YES** — `c65d533` blobs `0792a6a4ef32` / `775d9150bd45` / `322726b6023c`; **ABSENT** at `85bbd49`; worktree byte-distinct |
| Six recovery blobs preserved | **YES** — byte-identical at `HEAD`, `c65d533` and `origin/arena` |
| 13-path surface unchanged | **YES** — SPEC still lists 5 NEW + 6 MODIFY; all 13 present in the worktree; all six implementation hashes intact |
| No implementation mutation | **YES** — all 10 fences PASS vs `85bbd49`, including `iips-platform/**` (39 paths show as `D` only because HEAD's lineage `c65d533` never contained them; all 39 exist on disk with content byte-identical to canonical) |

---

## 3. BASIS FOR THE DECISION

The resolution adopts a distinction the authority **already draws**, rather than inventing one:

- `SPEC-G-AI-IMPL` §4 states of the transport file: **"Not a copy of the recovered file."**
- `DEC-G-AI-IMPL-B2-B4` records: *"The recovery copies remain **evidence on the arena branch**,
  byte-identical to `c65d533`"* and *"No recovery file is being restored / copied into canonical /
  promoted to authority."*
- All three colliding paths are **ABSENT at canonical `85bbd49`**, so relative to the authorized
  baseline they are genuinely NEW.

Fence 10 protects the recovered files **as evidence**; it does not reserve a pathname against a
later, independently authored canonical implementation.

---

## 4. CONSEQUENCES

- The 3-path contradiction is **resolved**.
- Fence 10 **remains effective** for recovery evidence — the six blobs must remain byte-identifiable
  and recoverable from `arena` / `origin`.
- The canonical NEW surface **remains valid**; the 13-path surface is unchanged.
- **No implementation path is authorized beyond the existing 13.**
- No threshold, methodology, product behavior, S1–S4, SR-1–SR-5 or certification decision is changed.
- **Implementation remains BLOCKED** until the separate commit-target, worktree-unblocking and
  implementation execution gates are completed.

---

## 5. RECORDED PROVENANCE HASHES (COL-3 / COL-4)

Recovery-evidence blobs preserved on `arena` / `origin`:

| Path | Blob |
|---|---|
| `frontend/server/ai-advisory-transport.ts` | `0792a6a4ef32` |
| `frontend/server/ai-advisory-transport.test.ts` | `775d9150bd45` |
| `frontend/server/live/ai-advisory-live-certification.test.ts` | `2bcaac3329de` |
| `frontend/src/api/aiAdvisory.ts` | `322726b6023c` |
| `frontend/src/features/ai-advisory/AiAdvisory.tsx` | `8eda5c51b21b` |
| `frontend/src/features/ai-advisory/AiAdvisory.test.tsx` | `1113a6e3023b` |

Current worktree implementation hashes, verified byte-distinct from the above:
`e257814e3eb2`, `8ae5a4ab3623`, `2258e54c179e`, `df8bb2b9a5c7`, `d2b44c63d114`,
`fab26a429736`.

---

## 6. STILL OUTSTANDING

In order:

1. **Commit-target authority** — a detached canonical HEAD is not a branch.
2. **Worktree-unblocking authority** — the 8 tracked-modified blockers and 191 canonical-only files.
3. **Implementation execution gate.**

**IMPLEMENTATION: BLOCKED. CERTIFICATION: BLOCKED.**
