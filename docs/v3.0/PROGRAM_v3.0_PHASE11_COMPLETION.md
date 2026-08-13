# Program v3.0 — Phase 11: Replay Explorer / Advanced Evidence (Completion Report)

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** Phase 11 — Replay Explorer / Advanced Evidence
**Location:** `frontend/` + `frontend/server/executive-transport.ts` + `docs/v3.0/g3-readiness-assessment.md`
**Status:** COMPLETE — verification surface over governed ReplayResult; no replay/diff logic in React; no v2.0/v1.1 change.
**Date:** 2026-08-09

---

## 1. Replay contract inspection

Inspected `ReplayService` (governed):

```ts
export interface ReplayResult {
  readonly snapshotId: string;
  readonly reproduced: boolean;
  readonly byteIdentical: boolean;
  readonly evidenceRefs: readonly string[];
}
```

**Confirmed: ReplayService exposes only `reproduced`, `byteIdentical`, `evidenceRefs`. There is NO field-level or metric-level diff.**

## 2. Exact ReplayService capabilities

`reproduced` · `byteIdentical` · `evidenceRefs` only.

## 3–5. Source mapping

- **Original/replay source** → governed engine output + ReplayResult (1:1).
- **Equivalence source** → governed `byteIdentical`.
- **Difference source** → **NOT AVAILABLE** from the governed contract. `differenceAvailable: false`.

## 6–7. Architecture / routes

`React` → `fetchReplayData(id)` → `/api/replay/:id` (Vite proxy) → governed ReplayResult. Route `/evidence/replay/:id` renders `<ReplayExplorer/>`.

## 8. DTO mappings

`computeCertifiedReplay(sector)` maps the governed ReplayResult + original result metadata 1:1.

## 9. Complete UI-field → governed-source mapping

| UI field | API DTO | Governed contract |
|---|---|---|
| Original verdict/composite/confidence | `original` | certified engine output + golden confidence |
| Snapshot id/engine/schema/calibration/generatedAt | `original` | `Snapshot` + engine identity |
| Replay reproduced/byteIdentical/evidenceRefs | `replay` | `ReplayResult` |
| Equivalence MATCH/DIFFERENCE | `replay.byteIdentical` | `ReplayResult` |
| Evidence references | `replay.evidenceRefs` | `ReplayResult` |
| Provenance | `original.provenance` | `EvidenceProvenance` |
| Freshness | `provenance.freshness` | transport (SNAPSHOT) |

## 10. G2 additions (minimum)

Added `/api/replay/:id` + `computeCertifiedReplay`. Semantically inert; 1:1 DTO mapping.

## 11–12. Components reused / new

Reused Phase 10: `SnapshotMetadataPanel`, `ProvenanceChain`, `ReplaySummary`, `DecisionBadge`, `CertifiedBadge`/`FreshnessBadge`, `LoadingState`/`ErrorState`/`UnavailableState`. **No new reusable components.**

## 13. Confirmation — zero replay/analytical logic in React

- **No** engine execution, score/confidence recalculation, threshold reproduction, raw metric comparison, difference derivation, or cause inference.
- The UI displays the governed `ReplayResult` only.

## 14. Authority handling

- Original = **CERTIFIED RESULT**; replay = **REPLAY** (verification); **no new investment decision**. No AI surface.

## 15. Freshness / provenance

- **SNAPSHOT** badge; **SNAPSHOT ≠ STALE**; provenance chain shown.

## 16. Replay semantics

- Displays "Replay reproduced successfully; byte-identical: MATCH/DIFFERENCE" from governed `byteIdentical`.
- **No invented field-level/metric-level diff** (explicit `differenceAvailable: false` + note). This honors the Phase 11 HARD STOP.

## 17–18. Accessibility / responsive

Semantic HTML, `role="status"`, `aria-label`, non-color-only (MATCH/DIFFERENCE text + color). Responsive via inherited grid/breakpoints.

## 19–20. Tests / build

- **93/93 tests pass** (87 + 6 Replay) across 17 files; `tsc --noEmit` clean; `vite build` succeeds.

## 21. G3 readiness assessment

Added `docs/v3.0/g3-readiness-assessment.md` — documents (does NOT implement) the transition from `reference SNAPSHOT → authenticated tenant-scoped LIVE data`: required capabilities (auth, session, tenant scoping, RBAC, live-data path, audit), governing principle, recommended future milestone, STOP conditions.

## 22. Golden-output provenance verification

Golden expected-outputs remain **reference/SNAPSHOT sources only**; not represented as permanent live replay history.

## 23. v2.0/v1.1 boundary verification

No changes outside `frontend/` + `docs/v3.0/`. Transport runs the certified platform in-process; semantically inert.

## 24. Commit hash

See the Phase 11 commit (below).

## Status

**PHASE 11 COMPLETE.** The core IIPS trust loop is now fully represented: **Decision → Evidence → Snapshot → Provenance → Replay → Verification.** Awaiting approval before Phase 12 (Administration / Enterprise Operations — NOT yet authorized).
