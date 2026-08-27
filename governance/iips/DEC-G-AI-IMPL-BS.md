# DEC-G-AI-IMPL-BS — G-AI-IMPL Baseline and Specification Decisions (B1–B4, S1–S4)

- **Record ID:** `DEC-G-AI-IMPL-BS`
- **Title:** G-AI-IMPL — Baseline (B1–B4) and Specification (S1–S4) Decisions
- **Class:** `DECISION`
- **Status:** `RECORDED — 1 DECIDED, 7 BLOCKED`
- **Date/time:** 2026-08-27
- **Authority relationship:** derives from `AUTH-G-AI-IMPL` and `SPEC-G-AI-IMPL`. Binds the
  controlled-change gate: it may not proceed past any item recorded `BLOCKED` here.
- **Scope:** the eight deferred decision points only. Does **not** authorize implementation.
- **Provenance:** decisions were reached by testing the **reconstituted** authority against repository
  evidence. No decision was made by engineering inference, implementation convenience, or
  canonical-versus-recovery preference.
- **Supersession / revision:** supersedes the equivalent *classifications* recorded in the earlier
  (destroyed) out-of-repo gates — B1-C, B2-D, B3-C, B4-B, S1-B, S2-C, S3-C — which were evidence-stage
  findings, not durable decisions. Those findings are preserved as evidence and are not overwritten.

---

## Summary

| ID | Subject | Outcome |
|---|---|---|
| **B1** | Executable baseline | **DECIDED → B1-C** — new baseline reconciliation required |
| **B2** | Three NEW-path collisions | **BLOCKED** — change-surface re-specification required |
| **B3** | Two absent MODIFY targets | **BLOCKED** — change-surface re-specification required |
| **B4** | SR-4 / `guardRead` | **BLOCKED** — baseline dependency on B1 |
| **S1** | `AiAdvisor` behaviour | **BLOCKED** — advisor specification decision required |
| **S2** | Advisory text | **BLOCKED** — product/specification decision required |
| **S3** | Execution path | **BLOCKED** — explicit decision required |
| **S4** | Related semantics | **BLOCKED** — residual semantics depend on S1 and S3 |

**IMPLEMENTATION REMAINS BLOCKED.**

---

## B1 — EXECUTABLE BASELINE

**DECISION: B1-C — NEW BASELINE RECONCILIATION REQUIRED.**

- **Decision:** neither existing baseline is currently authorized as the executable implementation
  base. A new, explicitly authorized baseline reconciliation is required before implementation.
- **Authority basis:** `AUTH-G-AI-IMPL` targets the canonical baseline `85bbd49` and its 11-path
  surface, and **expressly prohibits** baseline transition, branch switch, checkout of `85bbd49`, and
  restoration or copying of canonical files. The reconstituted authority therefore authorizes a
  baseline it simultaneously makes unreachable.
- **Evidence supporting applicability:**
  - recovery `c65d533` · canonical `85bbd49` · `git merge-base` = **NONE**
  - at `c65d533`: `guardRead` = **0** occurrences; `ENGINE_FACTORY` = **10** registrations
  - at `85bbd49`: `guardRead` = **1** (`admin-transport.ts:320`); `ENGINE_FACTORY` = **13**
  - `frontend/src/features/research/SectorIntelligence.tsx` and `frontend/src/app/navigation.test.ts`
    are **absent** at `c65d533` and present at `85bbd49`
- **Alternatives rejected:**
  - **B1-A (implement on recovery)** — rejected: the reconstituted authority does not permit a
    recovery-baseline implementation, and at `c65d533` SR-4 is unexecutable and D5 coverage would be
    10 engines rather than 13.
  - **B1-B (implement on canonical)** — rejected: no authority permits the controlled transition, and
    branch switch / checkout of `85bbd49` is prohibited by standing constraint.
- **Fence compliance:** no fence is touched — this is a decision, not a mutation. No branch was
  switched and no baseline was modified while deciding.

---

## B2 — THREE NEW-PATH COLLISIONS

**DECISION: BLOCKED — CHANGE-SURFACE RE-SPECIFICATION REQUIRED.**

- **Decision:** the collision is not resolved. The change surface must be re-specified by explicit
  authority before implementation.
- **Paths:** `frontend/server/ai-advisory-transport.ts`, `frontend/src/api/aiAdvisory.ts`,
  `frontend/server/ai-advisory-transport.test.ts`.
- **Authority basis:** `SPEC-G-AI-IMPL` classifies all three as **NEW**, states the transport is
  "**not a copy of the recovered file**", and boundary **10** makes the six recovered files
  **reference evidence only — no restoration, copying, modification, replacement or deletion**. The
  specification authorizes **none** of preserve-in-place, modify, replace, delete or supersede for
  these three paths.
- **Evidence:** all three exist at `c65d533` (`0792a6a4ef32`, `322726b6023c`, `775d9150bd45`) and are
  **absent** from `85bbd49`.
- **Explicitly not assumed:** that a `NEW` classification authorizes overwriting an existing file.
- **Alternatives rejected:** preserve / modify / replace / delete / supersede — none is authorized.
- **Fence compliance:** resolving this by overwriting would violate **fence 10**; therefore it is
  recorded as blocked rather than resolved.

---

## B3 — TWO ABSENT MODIFY TARGETS

**DECISION: BLOCKED — CHANGE-SURFACE RE-SPECIFICATION REQUIRED.**

- **Decision:** creation of the two targets is not authorized. The change surface must be
  re-specified.
- **Paths (exact):** `frontend/src/features/research/SectorIntelligence.tsx` and
  `frontend/src/app/navigation.test.ts`.
- **Authority basis:** `SPEC-G-AI-IMPL` classifies both as **MODIFY**. A `MODIFY` classification does
  **not** authorize creating a missing file, and no authority permits importing canonical-only
  content into the recovery checkout.
- **Evidence:** both are **ABSENT** at `c65d533` (the directory `frontend/src/features/research/` is
  empty there) and present at `85bbd49` (`3adb39a0befc`, `ead42f07b4c6`).
- **Alternatives rejected:** creation from canonical content (unauthorized import); treating `MODIFY`
  as implicit creation permission (expressly prohibited).
- **Fence compliance:** creation would import canonical baseline content, contrary to the
  canonical/recovery distinction the specification preserves.
- **Dependency:** if **B1** resolves to the canonical baseline, both files exist there and this item
  may resolve without any re-specification. Recorded so the dependency is explicit.

---

## B4 — SR-4 / `guardRead`

**DECISION: BLOCKED — BASELINE DEPENDENCY (B4-B).**

- **Decision:** SR-4 has no executable basis until **B1** is resolved. No formulation is invented.
- **Authority basis:** `SPEC-G-AI-IMPL` SR-4 requires **canonical `guardRead`** with resource
  `read.ai-advisory`. That mechanism exists only at the canonical baseline, and
  `frontend/server/admin-transport.ts` is **fence 5** — `guardRead` must be reused as-is, never added
  or modified.
- **Evidence:** canonical `guardRead` = **1**; recovery = **0**.
- **Alternatives rejected:**
  - reimplementing `guardRead` inside the new transport — rejected: it would introduce a **second
    read-authorization model**, which the specification prohibits;
  - promoting the recovered transport's `createLiveAiExecutor` + `ai.advisory.<id>` pattern —
    rejected: recovered implementation behaviour cannot be promoted into authority by inference.
- **Resolution path:** if **B1** selects a baseline that legitimately contains `guardRead` and the
  specification's SR-4 is retained unchanged, this item becomes **B4-A — RESOLVED BY SELECTED
  BASELINE** with no further decision.
- **Fence compliance:** `guardRead` was **not** implemented. Fence 5 intact.

---

## S1 — `AiAdvisor` BEHAVIORAL CONTRACT

**DECISION: BLOCKED — ADVISOR SPECIFICATION DECISION REQUIRED.**

- **Established (interface level), by the shared canonical platform contract:**
  - `export interface AiAdvisor` with `advise(engineResult: ExecutionResult, evidence:
    Record<string, unknown>): AiAdvice`
  - doc-comment constraint: **"Must NOT alter the result"**
  - the seven readonly `AiAdvice` output fields — `kind`, `text`, `grounded`,
    `nonAuthoritative: true`, `model`, `modelVersion`, `engineResultRef?`
  - `adviceId()` deterministic FNV-1a lineage helper
- **Established by `SPEC-G-AI-IMPL`:** DTO field population for `label` (D7), `freshness`
  (`'SNAPSHOT'`, SR-2), `unavailable[]`, `engineResultId`, and `adviceId` (SR-3).
- **NOT established:**
  - the **concrete advisor implementation**
  - how **`text`** is produced (see S2)
  - **deterministic versus AI-backed** behaviour
  - advisory-specific **provenance** requirements beyond the governed audit chain
  - **error / fallback** semantics where load-bearing
- **Authority basis for blocking:** `SPEC-G-AI-IMPL` §8 records these as undefined, and the gate rule
  prohibits filling them by inference.
- **Explicitly rejected as authority:** the recovered `DETERMINISTIC_ADVISOR` in
  `ai-advisory-transport.ts` and the platform test advisor `iips-advisor`. Both are **evidence**, not
  product authority, and neither may be copied or treated as specification.

---

## S2 — ADVISORY TEXT

**DECISION: BLOCKED — PRODUCT / SPECIFICATION DECISION REQUIRED.**

- **Decision:** the user-facing `AiAdvice.text` is not authorized. No product copy is invented.
- **Authority basis:** no governance or specification record defines the wording, template, tone or
  fallback copy. Existing references to "advisory text" in the design material describe the **concept**
  (that AI produces advisory text only) and map the **field** (`Advice text → AiAdvice.text`); neither
  establishes content.
- **What a resolution must supply:** either exact authorized text/template semantics, **or** an
  explicit rule authorizing the implementation to derive text in a defined way.
- **Explicitly rejected as authority:** the recovered string
  `"The certified engine produced composite … This is advisory only."` It is evidence from a recovered
  implementation file and a platform test, not product authority.

---

## S3 — EXECUTION PATH

**DECISION: BLOCKED — EXPLICIT DECISION REQUIRED.**

- **Decision:** neither `AiAdvisor.advise()` nor `AiAssistedRuntime.executeWithAi()` is selected.
- **Authority basis:** the only governance reference writes "**advise/executeWithAi**", presenting
  both as alternatives. That phrase is **not** a decision and has not been read as one. No other
  authoritative record resolves it.
- **Not selected on implementation convenience.** Note recorded for the future decider, without
  prejudging the choice: `executeWithAi` is the platform facade that enforces the A===B invariant and
  returns `engineResultUnchanged`, whereas a direct `advise()` call bypasses that enforcement. This is
  evidence, not a decision.

---

## S4 — RELATED SEMANTICS

**DECISION: BLOCKED — residual items depend on S1 and S3.**

Resolved by `SPEC-G-AI-IMPL` and the D-constraints, and therefore **not** ambiguous:

| Item | Status |
|---|---|
| Advisory identity | **Resolved** — SR-3, the canonical `adviceId()` helper |
| Response shape | **Resolved** — §6 of `SPEC-G-AI-IMPL`: seven governed fields plus `engineResultId`, `label`, `freshness`, `unavailable[]` |
| Freshness | **Resolved** — SR-2, `'SNAPSHOT'` |
| Provenance | **Resolved** — governed audit chain; authenticate 401 → authorize 403 → audit |
| Route / navigation | **Resolved** — prohibited by **D3 / D4** |
| Tenant | **Resolved** — advisory content is not tenant-owned; no advisory-specific tenant scoping |

Unresolved, and load-bearing:

| Item | Why blocked |
|---|---|
| AI-failure behaviour | Depends on **S1** — if the advisor is deterministic and in-process, failure semantics differ materially from an AI-backed advisor |
| Fallback behaviour | Depends on **S1** |
| Error UX beyond the specified Loading / Error / Unavailable states | Depends on **S1** and **S3** |

Anything not necessary to implementation remains **explicitly out of scope**. No scope expansion is
made here.

---

## Decision completeness

Per the completeness rule, no item is left silently ambiguous:

| ID | Final state |
|---|---|
| B1 | **DECIDED** (B1-C) |
| B2 | **BLOCKED — specification re-specification required** |
| B3 | **BLOCKED — specification re-specification required** |
| B4 | **BLOCKED — baseline dependency** |
| S1 | **BLOCKED — advisor specification decision required** |
| S2 | **BLOCKED — product/specification decision required** |
| S3 | **BLOCKED — explicit decision required** |
| S4 | **BLOCKED — depends on S1 and S3** |

No item is marked decided merely because an implementation seemed obvious.

---

## What unblocks implementation

1. **B1** — an explicit, authorized baseline reconciliation. This is the primary blocker: B2, B3 and
   B4 all resolve or simplify once the executable baseline is authorized.
2. **S1, S2, S3** — product/specification decisions on the advisor, its text, and its execution path.
3. **S4** — the residual semantics that follow from S1 and S3.

Then a **controlled implementation gate** must re-verify `AUTH-G-AI-IMPL`, `SPEC-G-AI-IMPL`, this
record, the exact 11-path delta against the selected baseline, and all 10 fences before any
implementation mutation.

**IMPLEMENTATION: BLOCKED.**
