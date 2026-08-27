# DEC-G-AI-IMPL-B2-B4 — Canonical Baseline Change-Surface & SR-4 Decisions

- **Record ID:** `DEC-G-AI-IMPL-B2-B4`
- **Title:** B2 / B3 / B4 — Canonical Baseline Change-Surface and SR-4
- **Class:** `DECISION`
- **Status:** `RECORDED — B2, B3, B4 RESOLVED`
- **Date/time:** 2026-08-27
- **Authority relationship:** derives from `AUTH-G-AI-IMPL` (as amended, §6), `SPEC-G-AI-IMPL` and
  `DEC-G-AI-IMPL-B1-AUTH-AMEND`. Resolves B2, B3 and B4 against the verified canonical baseline.
  Does **not** resolve S1–S4 and does **not** authorize implementation.
- **Scope:** B2, B3, B4 only.
- **Provenance:** every fact below was verified against the repository at the canonical baseline
  `85bbd49cd31c215a8fd0e7651b718861944dfe45` during the B1-TRANSITION and B2-B4 gates, and
  re-verified by object reference after returning to the arena branch. No fact rests on assumption.
- **Supersession / revision:** supersedes the **outcomes** recorded for B2, B3 and B4 in
  `DEC-G-AI-IMPL-BS` (which were `BLOCKED` against the recovery baseline). `DEC-G-AI-IMPL-BS`,
  `DEC-G-AI-IMPL-B1` and `DEC-G-AI-IMPL-B1-AMEND` are **not modified** and remain history.

---

## 1. B1 TRANSITION EVIDENCE

| Item | Verified value |
|---|---|
| Authorized mechanism | `git checkout --detach 85bbd49cd31c215a8fd0e7651b718861944dfe45` (`AUTH-G-AI-IMPL` §6.3) |
| Post-transition HEAD | `85bbd49cd31c215a8fd0e7651b718861944dfe45` — exact match |
| Detached state | `git symbolic-ref -q HEAD` returned empty — **detached** |
| Post-transition worktree | clean (`git status --short` and `--ignored --short` both empty) |
| Arena branch during detach | `8bc5609fb7a9c023936ad088a10473c0b7b5b87d` — **unchanged** |
| No other git operation | no branch created, no merge, rebase, cherry-pick, reset, copy or restore |

**B1 = OPERATIONALLY ESTABLISHED** at the canonical baseline.

Note on this record's location: `governance/iips/` does not exist in the canonical tree, so this
record could not be created at the detached checkout without either polluting the canonical working
tree or committing to no branch. The maintainer explicitly authorized returning to
`arena/01a03e3b-iips-review-recovered` to record it. The checkout was clean and non-destructive;
canonical remains reachable via `origin/phase13-next`, and re-detaching uses the same authorized
command.

---

## 2. B2 — NEW-PATH COLLISIONS

### DECISION: **DECIDED — CANONICAL NEW-PATH SURFACE CLEAN**

All five authorized NEW paths are **ABSENT** at the canonical baseline:

| Path | At canonical |
|---|---|
| `frontend/server/ai-advisory-transport.ts` | **ABSENT** |
| `frontend/src/api/aiAdvisory.ts` | **ABSENT** |
| `frontend/server/ai-advisory-transport.test.ts` | **ABSENT** |
| `frontend/src/components/ai/AiExplanation.tsx` | **ABSENT** |
| `frontend/src/components/ai/AiExplanation.test.tsx` | **ABSENT** |

**5 / 5 ABSENT.** The three paths that collided with protected recovery evidence at `c65d533` are
therefore **no longer collisions** at the executable baseline; `NEW` is genuinely new.

### Recovery evidence preservation

The recovery copies remain **evidence on the arena branch**, byte-identical to `c65d533`:

| Blob | Path |
|---|---|
| `0792a6a4ef32` | `frontend/server/ai-advisory-transport.ts` |
| `322726b6023c` | `frontend/src/api/aiAdvisory.ts` |
| `775d9150bd45` | `frontend/server/ai-advisory-transport.test.ts` |
| `2bcaac3329de` | `frontend/server/live/ai-advisory-live-certification.test.ts` |
| `8eda5c51b21b` | `frontend/src/features/ai-advisory/AiAdvisory.tsx` |
| `1113a6e3023b` | `frontend/src/features/ai-advisory/AiAdvisory.test.tsx` |

Explicitly recorded:

- **No recovery file is being restored.**
- **No recovery file is being copied into canonical.**
- **No recovered implementation is being promoted to authority.** The recovered transport, client,
  component and tests remain **evidence only**; the canonical NEW files are to be written from
  `SPEC-G-AI-IMPL`, not derived from them.
- **The canonical NEW files will be created later, only under the controlled implementation gate.**
  None is created by this record.

---

## 3. B3 — MODIFY TARGETS

### DECISION: **DECIDED — ALL MODIFY TARGETS AVAILABLE**

All eight authorized MODIFY targets are **PRESENT** at the canonical baseline:

| Path | Blob |
|---|---|
| `frontend/server/executive-transport.ts` | `31ec66372ea8` |
| `frontend/src/features/company/CompanyIntelligence.tsx` | `6842d6d8aecf` |
| `frontend/src/features/research/SectorIntelligence.tsx` | `3adb39a0befc` |
| `frontend/src/features/decision-matrix/DecisionMatrix.tsx` | `189a6660f5ff` |
| `frontend/src/features/company/CompanyIntelligence.test.tsx` | `56d439d21731` |
| `frontend/src/features/research/SectorIntelligence.test.tsx` | `9a2d9db42bc8` |
| `frontend/src/features/decision-matrix/DecisionMatrix.test.tsx` | `9347df523aa0` |
| `frontend/src/app/navigation.test.ts` | `ead42f07b4c6` |

**8 / 8 PRESENT.** The recovery-side "absent MODIFY target" problem is **no longer applicable**.

- **No canonical import is required** — the files are already in the baseline.
- **No creation workaround is required.**
- **No target was modified** by this gate, and none was imported or copied.

`SPEC-G-AI-IMPL` lists the three test files in one row; they are expanded to their exact paths above
so the change surface is unambiguous.

---

## 4. B4 — SR-4 / `guardRead`

### DECISION: **B4-A — RESOLVED BY CANONICAL BASELINE**

| Check | Verified value |
|---|---|
| `export async function guardRead` count | **1** |
| Location | `frontend/server/admin-transport.ts:320` |
| `admin-transport.ts` blob | `a32d485ae450` — **identical to `origin/phase13-next`**, unmodified |
| Second RBAC / read-auth mechanism | **none introduced** — the only `guard*` definitions in `frontend/server` are canonical's own `guardRead` and `guardExecute` |

The canonical mechanism is the existing authorized one:

```ts
export async function guardRead(executor: SecuredExecutor, token: string, surface: string): Promise<Principal> {
  const p = await executor.authenticate(token);            // 401 on failure
  executor.authorize(p, 'read', `read.${surface}`, 0, 1000); // 403 on deny (governed RBAC + gate + audit)
  return p;
}
```

**SR-4 remains exactly as specified** — authorization via canonical `guardRead` with resource
`read.ai-advisory`. `guardRead` was **not** recreated, modified or replaced, and **no alternative
authorization path was introduced**. Fence 5 remains intact.

---

## 5. SECURITY / FENCE RECHECK

| Fence | Path | Blob | Unmodified vs `origin/phase13-next` |
|---|---|---|---|
| 1 | `frontend/src/app/routes.ts` | `ea1fd329460a` | **YES** |
| 2 | `frontend/src/app/navigation.ts` | `03fcf14d7db9` | **YES** |
| 3 | `Sidebar.tsx` / `AppShell.tsx` / `App.tsx` | `f1d22d3d0536` / `e05b823faf9e` / `15e638ed5b6f` | **YES** |
| 4 | `iips-platform/**` | 398 files; tree identical | **YES** |
| 5 | `frontend/server/admin-transport.ts` | `a32d485ae450` | **YES** |
| 6 | `frontend/server/secured-executor.ts` | `f85692ddd0be` | **YES** |
| 7 | `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` | `63bcd350f2cd`, 13 sectors | **YES** |
| 8 | `ies-010…ies-020` + `iips-cross-sector` | 370 files | **YES** |
| 9 | `ROADMAP.md` / `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` | `b5485618f8db` / `4967b0232afc` | **YES** |
| 10 | six recovered AI files | absent from canonical; preserved on arena | **YES** |

AI security and provenance boundaries: `AiAssistedRuntime.ts` = `bf51421e7c7b`, byte-identical to the
recovery copy; **0** AI route hits in `routes.ts`; **0** AI navigation hits in `navigation.ts`;
worktree clean.

**All 10 fences PASS.**

---

## 6. REJECTED RECOVERY-SIDE ALTERNATIVES

Recorded so they are not revisited:

| Alternative | Rejected because |
|---|---|
| Implement against recovery `c65d533` | `guardRead` absent (SR-4 unexecutable), `ENGINE_FACTORY` = 10 vs D5's 13, both MODIFY targets absent, and all three colliding NEW paths occupied by fence-10 evidence |
| Overwrite the three colliding recovery files | Would violate **fence 10** — they are protected evidence |
| Create the two absent MODIFY targets at recovery | Would require importing canonical-only content, which is not authorized |
| Reimplement `guardRead` in the new transport | Would introduce a **second** read-authorization model, which `SPEC-G-AI-IMPL` prohibits |
| Promote the recovered transport's authorization pattern | Recovered implementation is evidence, not authority |

---

## 7. DECISION CONSISTENCY

```
B1 = canonical baseline operationally established   (85bbd49, detached, verified)
B2 = NEW paths cleanly absent                       (5 / 5)
B3 = MODIFY targets present                         (8 / 8)
B4 = guardRead available through canonical mechanism (1, at admin-transport.ts:320)
```

The recovery-specific collision and absence blockers are **not** carried forward as current blockers.
They are resolved by the baseline, not by re-specification. The historical B1/B2/B3/B4 records remain
history and have not been rewritten.

---

## 8. S1–S4 REMAIN OUTSIDE THIS GATE

| Item | Status |
|---|---|
| S1 — `AiAdvisor` behavioural contract | **BLOCKED / DEFERRED** |
| S2 — advisory text | **BLOCKED / DEFERRED** |
| S3 — `advise()` vs `executeWithAi` | **BLOCKED / DEFERRED** |
| S4 — remaining advisory semantics | **BLOCKED / DEFERRED** |

The fact that canonical is now executable does **not** supply the missing product authority for
advisor behaviour, advisory text or execution path. Nothing was inferred from the canonical baseline
into S1–S4.

---

## 9. IMPLEMENTATION REMAINS BLOCKED

| Check | Result |
|---|---|
| NEW files created | **NONE** — all five remain absent |
| MODIFY files modified | **NONE** — all eight blobs unchanged |
| `admin-transport.ts` / `guardRead` | **unmodified** |
| Engine, frontend, test, route, navigation change | **NONE** |
| Recovery file restored or copied | **NONE** |
| Branch created / implementation committed or pushed / certification | **NONE** |
| Repository mutation in this gate | this decision record only, under `governance/iips/` |

**IMPLEMENTATION: BLOCKED.** The next gate is the independent **S1–S4 Advisory Authority Decision
Gate**. Only after S1–S4 are durably decided may the process return to the controlled implementation
gate.

### Checkout state after this gate

Per the maintainer's direction, the checkout **remains on `arena/01a03e3b-iips-review-recovered`**
rather than being re-detached. This does not alter B1: canonical `85bbd49` remains the authorized
executable implementation baseline, reachable via `origin/phase13-next`, and a later gate re-detaches
using the same authorized command when it needs the canonical tree.
