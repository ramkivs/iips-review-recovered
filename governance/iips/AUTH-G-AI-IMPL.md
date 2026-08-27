# AUTH-G-AI-IMPL — G-AI-IMPL Implementation Authorization (RECONSTITUTED)

- **Record ID:** `AUTH-G-AI-IMPL`
- **Title:** G-AI-IMPL — AI Advisory Implementation Authorization
- **Class:** `AUTHORIZATION`
- **Status:** `ACTIVE (RECONSTITUTED · AMENDED 2026-08-27 — baseline authority; see §6)`
- **Date/time:** 2026-08-27 (reconstituted) · 2026-08-27 (amended)
- **Amendment:** `DEC-G-AI-IMPL-B1-AUTH-AMEND` — establishes canonical `85bbd49` as the authorized
  **executable** implementation baseline and defines the controlled transition mechanism. The
  implementation scope (SR-1…SR-5, T1…T10, 13 paths, 10 fences) is **unchanged** by the amendment.
- **Authority relationship:** issued originally at gate **G-AI-IMPL** as outcome **A — AUTHORIZE
  IMPLEMENTATION**; reconstituted here. Binds the implementation scope only. It does **not** bind the
  controlled-change gate, which must separately re-verify this record before any implementation
  mutation.
- **Scope:** the AI Advisory embedded-surface delta defined in `SPEC-G-AI-IMPL`. Expressly excludes
  baseline transition, recovery-evidence replacement, canonical-content import, certification, and
  every item listed under "Not authorized" below.
- **Provenance:** see the provenance note below.
- **Supersession / revision:** supersedes no record. The original out-of-repo authorization artifact
  was destroyed; this record re-establishes its content.

---

## PROVENANCE NOTE — RECONSTITUTED AUTHORITY

**This is a reconstituted authority record. Uninterrupted artifact continuity is NOT claimed.**

- The original out-of-repo records (G-AI-IMPL authorization, implementation specification, G-AI scope
  and confirmation, G-A, G-B, R3, R6) were **destroyed by repeated sandbox re-clones** and are absent
  from the filesystem.
- This record is reconstructed from the **previously issued authoritative content available in the
  session**, not from a surviving artifact.
- It is established in the **newly durable IIPS authority store** (`governance/iips/`, established by
  commit `191d595c63836083d0e1ada379bc83be3629418f`) so that it survives future re-clones.
- **Technical evidence remains evidence.** Nothing has been silently promoted into authority: the
  recovered implementation files, the recovered Phase 13 certification claims, and prior gate
  *findings* are all evidence, and none of them is the source of this authorization.
- No requirement has been added that was absent from the previously issued authorization.

---

## 1. Authorization

**G-AI-IMPL = A — IMPLEMENTATION AUTHORIZED.**

Authorized: the exact specification-derived delta and test contract recorded in `SPEC-G-AI-IMPL` —
**SR-1…SR-5** and **T1…T10**.

## 2. Authorized scope

| Element | Value |
|---|---|
| Specification requirements | **SR-1 … SR-5** |
| Test obligations | **T1 … T10** |
| Change surface | **5 new files + 8 modified files = 13 paths** *(count corrected by `DEC-G-AI-IMPL-PATH-COUNT` / D-11V13; previously stated 11 by counting MODIFY table rows rather than paths — see `SPEC-G-AI-IMPL` §4 row 5, which enumerates three paths. The path set is unchanged.)* |
| Must-not-touch boundaries | **10** |
| Scope constraints | **D1 … D8**, incorporated by reference |

The full text of each is in `SPEC-G-AI-IMPL`. This record does not restate or alter it.

## 3. Explicit separation: authorization ≠ controlled-change gate

This authorization **permits** the delta. It does **not** open repository mutation.

A separate **controlled implementation gate** must, before any implementation mutation:

1. re-verify this record and `SPEC-G-AI-IMPL` from the durable store;
2. re-verify the decisions `DEC-G-AI-IMPL-BS`;
3. re-verify the exact 11-path delta against the then-current baseline;
4. re-verify all 10 fences;
5. confirm the executable baseline decision **B1**.

Until that gate returns **IMPLEMENTATION GO**, implementation remains **BLOCKED**.

## 4. Not authorized by this record

- ~~Baseline transition, branch switch, or checkout of `85bbd49`~~ — **AMENDED**: a single controlled
  transition to `85bbd49` is now authorized, **only** by the mechanism in §6.3 and **only** at the
  subsequent baseline-transition gate. The original prohibition is preserved here for history and
  continues to apply to every other form of transition, branch switch or checkout.
- Restoration or copying of canonical files into the recovery checkout
- Replacement, modification or deletion of the recovery-only AI files
- Creation of the two MODIFY targets absent from the recovery baseline *(becomes unnecessary once the
  transition has occurred, because both exist at `85bbd49`; not otherwise authorized)*
- Implementation of `guardRead` or introduction of a second read-authorization model
- Route or navigation creation
- ~~Certification, or any attempt at live-Keycloak certification~~ — **AMENDED by
  `DEC-G-AI-IMPL-CERTIFICATION`:** the **implementation** certification of the 13-path
  G-AI-IMPL delta at `f63a9b493118643725568a95b86405a5835a30a0` (baseline `85bbd49`) was
  determined at the `G-AI-IMPL FINAL CERTIFICATION GATE` and is durably recorded in that
  record. **Live-Keycloak certification remains NOT PERFORMED** and is recorded there as an
  Option-D limitation, not as a pass. No certification version or release was promoted and
  **P7 was not reopened**. The original prohibition is preserved for history and continues to
  apply to every **further** certification act, each of which requires its own grant.
- ~~Commit or push of implementation work~~ — **AMENDED by `DEC-G-AI-IMPL-IMPL-COMMIT-PUSH`
  (D-AUTH-CP):** the implementation commit `e5d59981c10578db0bf7a5b656acccb9450f45e0`
  (13 paths, parent `85bbd49`) and its fast-forward, non-forced push to
  `origin/gai-impl-canonical` **were** explicitly authorized by the maintainer in-session,
  at two separate gates, and were performed. No durable authorization existed beforehand and
  none is fabricated here; that record makes the grants durable. The original prohibition is
  preserved for history and **continues to apply to every further commit or push**, each of
  which requires its own separate grant.
- Any change to PC-4, N+5, E2E-017, or the Engine Master Matrix
- Any expansion beyond the 13 authorized paths

## 5. Current status

**IMPLEMENTATION: BLOCKED.** See `DEC-G-AI-IMPL-BS` for the decision state of B1–B4 and S1–S4, and
`DEC-G-AI-IMPL-B1-AUTH-AMEND` for the baseline authority.

**BASELINE TRANSITION: NOT PERFORMED.** The current checkout remains recovery `c65d533`. Amending this
record does **not** execute the transition; a separate controlled baseline-transition and verification
gate must do so.

---

## 6. BASELINE AUTHORITY AMENDMENT (2026-08-27)

Recorded by `DEC-G-AI-IMPL-B1-AUTH-AMEND`, following `DEC-G-AI-IMPL-B1` (B1-D) and
`DEC-G-AI-IMPL-B1-AMEND` (direction A).

### 6.1 Amendment #1 — executable baseline

```
CURRENT CHECKOUT BASELINE:            c65d533   (recovery — unchanged until the transition gate runs)
AUTHORIZED TARGET BASELINE:           85bbd49   (canonical)
AUTHORIZED EXECUTABLE BASELINE:       85bbd49   (after the controlled transition gate succeeds)
```

The distinction is preserved deliberately. `85bbd49` is **not** the current checkout, and this record
does not assert that it is. Implementation may occur only against `85bbd49`, and only after the
transition gate has verified it.

### 6.2 Amendment #2 — standing `phase13-next` constraint

| Item | Statement |
|---|---|
| **What imposed it** | The **session-level standing instruction** governing this working session, reinforced by the session's own operating rule. **Not** an IIPS governance constraint — no record in `governance/iips/` imposes it; the durable records only reference it |
| **Why an exception is required** | Direction A makes canonical `85bbd49` the executable implementation baseline. Every route to it is otherwise barred, so without an exception the authorized scope is unreachable |
| **Exact scope of the exception** | **This controlled transition only** — a single detached checkout of `85bbd49` by the mechanism in §6.3, performed at the dedicated baseline-transition gate |
| **Does it apply generally?** | **NO.** It creates **no** general permission to switch branches, to check out `phase13-next`, or to move the checkout to any other commit |
| **Permitting authority** | The **maintainer**, who is the authority that imposed the session-level constraint, granted the exception explicitly at the B1-AUTH-AMEND gate on 2026-08-27 |

The constraint is **not deleted or weakened**. Outside the single authorized transition it remains in
full force.

### 6.3 Amendment #3 — exact transition mechanism

**Authorized mechanism (the only one):**

```
git checkout --detach 85bbd49cd31c215a8fd0e7651b718861944dfe45
```

| Property | How it is satisfied |
|---|---|
| **Explicit** | A single named command with a full 40-character commit hash |
| **Reproducible** | Deterministic; `85bbd49` is an immutable commit reachable from `origin/phase13-next` |
| **Auditable** | Records no new commit; `git rev-parse HEAD` must equal `85bbd49…` and `git symbolic-ref -q HEAD` must fail, proving detached state |
| **Limited to this transition** | Authorized for the dedicated baseline-transition gate only; §6.2 grants no general branch permission |
| **Non-destructive to recovery evidence** | Creates no branch, moves no ref, rewrites no history. `arena/01a03e3b-iips-review-recovered` and all four governance commits remain intact, and with them the six recovered AI files |

**Explicitly not authorized:** merge, rebase, cherry-pick, reset, branch creation or deletion, copying
or reconstructing canonical content, and any checkout of `phase13-next` as a branch.

### 6.4 Amendment #4 — branch authority

| Item | Statement |
|---|---|
| Effect on `arena/01a03e3b-iips-review-recovered` | **None.** The branch is not moved, reset, merged, rebased or deleted. It retains its 4 governance commits and the full recovery history |
| New branch created | **No** — the detached mechanism was chosen precisely to avoid conflicting with the session's fixed-branch rule |
| Checkout state during implementation | **Detached HEAD at `85bbd49`** |
| Where authority records live | On the **arena branch**, which is unaffected by the detach. The governance store therefore remains reachable and must be re-read from that branch or from `origin` |
| Consequence to note | Work performed while detached is not on any branch. Any later publication of implementation work requires its own explicit branch and push authority, which this record does **not** grant |

### 6.5 Amendment #5 — recovery evidence preservation

The six recovery-only AI files are **evidence and history**. Their presence at recovery `c65d533`:

| Blob | Path |
|---|---|
| `0792a6a4ef32` | `frontend/server/ai-advisory-transport.ts` |
| `322726b6023c` | `frontend/src/api/aiAdvisory.ts` |
| `775d9150bd45` | `frontend/server/ai-advisory-transport.test.ts` |
| `2bcaac3329de` | `frontend/server/live/ai-advisory-live-certification.test.ts` |
| `8eda5c51b21b` | `frontend/src/features/ai-advisory/AiAdvisory.tsx` |
| `1113a6e3023b` | `frontend/src/features/ai-advisory/AiAdvisory.test.tsx` |

Their existence **does not authorize** deletion, overwrite, replacement, copying into canonical,
restoration into another tree, or modification for implementation purposes.

**Preservation rule:** the transition must leave them recoverable through Git history, branch or
reference. Because the authorized mechanism is a detached checkout that moves no ref, they remain
present and unmodified at `arena/01a03e3b-iips-review-recovered` and at `c65d533`. Fence 10 continues
to apply to them in every tree.

### 6.6 Amendment #6 — post-transition verification (mandatory)

A separate verification must occur **after** the transition and **before** any implementation. It must
confirm at minimum:

1. `git rev-parse HEAD` = `85bbd49cd31c215a8fd0e7651b718861944dfe45`
2. detached state — `git symbolic-ref -q HEAD` fails
3. `ENGINE_FACTORY` registrations = **13**
4. `guardRead` present = **1** (`frontend/server/admin-transport.ts:320`)
5. all authorized **MODIFY** targets present — including `SectorIntelligence.tsx`,
   `SectorIntelligence.test.tsx`, `DecisionMatrix.tsx`, `DecisionMatrix.test.tsx`,
   `CompanyIntelligence.tsx`, `CompanyIntelligence.test.tsx`, `executive-transport.ts`,
   `navigation.test.ts`
6. all **five** authorized NEW paths **absent** before implementation
7. protected recovery evidence intact at `arena/01a03e3b-iips-review-recovered` and at `c65d533`
   (six blobs unchanged)
8. working tree clean before implementation
9. all **10** must-not-touch fences re-verified against the canonical tree

Implementation may not begin until every item passes.
