# Program v3.0 — Phase 10: Evidence Explorer (Completion Report)

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** Phase 10 — Evidence Explorer
**Location:** `frontend/` + `frontend/server/executive-transport.ts`
**Status:** COMPLETE — inspection surface over governed v2.0 evidence chain; no analytical/reasoning logic in React; no v2.0/v1.1 change.
**Date:** 2026-08-09

---

## 1. Evidence/replay contract inspection

Inspected the certified v2.0 contracts:

| Contract | Governed surface found |
|---|---|
| `EvidencePipeline` / `EvidencePackage` | ✅ evidenceId, engineId, recommendation, compositeScore, confidence, keyMetrics[], supportingScores[], calibrationVersion, decisionRulesApplied[], replayReference, provenance, generatedAt |
| `SnapshotService` / `SnapshotStore` | ✅ snapshotId, engineId, schemaVersion, generatedAt, metrics, scores, verdict, evidenceRefs, provenance |
| `ReplayService` | ✅ ReplayResult: snapshotId, reproduced, byteIdentical, evidenceRefs |
| Live-data lineage | ✅ (transport provenance) |
| Engine/version identity | ✅ engineId, calibrationVersion |
| Provenance | ✅ EvidenceProvenance (framework/engine/methodology/snapshot) |
| Replay equivalence | ✅ reproduced + byteIdentical |
| Audit | Available at platform layer (not part of the Evidence surface; not fabricated) |

## 2–5. Exact governed sources

- **Evidence** → `EvidencePackage` fields (governed).
- **Snapshot** → `Snapshot` fields (governed).
- **Replay** → `ReplayResult` (governed).
- **Provenance** → `EvidenceProvenance` (governed).

## 6–7. Architecture / routes

`React` → `fetchEvidenceData(id)` → `/api/evidence/:id` (Vite proxy) → **v3.0 transport** → certified evidence chain. Routes: `/evidence/:id` renders `<EvidenceExplorer/>`.

## 8. API/DTO mappings

`computeCertifiedEvidence(sector)` maps the governed evidence chain (decision, evidence, snapshot, replay, provenance) 1:1.

## 9. Complete UI-field → governed-source mapping

| UI field | API DTO | Governed contract |
|---|---|---|
| Decision verdict/composite/confidence | `decision` | certified engine output + golden confidence (or null) |
| Evidence ID/recommendation/composite/confidence/calibration/rules | `evidence` | `EvidencePackage` |
| Key metrics | `evidence.keyMetrics` | governed input metrics |
| Supporting scores | `evidence.supportingScores` | governed pillar scores |
| Snapshot id/engine/schema/generatedAt/verdict/scores | `snapshot` | `Snapshot` |
| Replay reproduced/byteIdentical | `replay` | `ReplayResult` |
| Provenance chain | `evidence.provenance` | `EvidenceProvenance` |
| Freshness | `provenance.freshness` | transport (SNAPSHOT) |

## 10. G2 additions (minimum)

Added `/api/evidence/:id` + `computeCertifiedEvidence`. Semantically inert; 1:1 DTO mapping.

## 11–12. Components reused / new

Reused: `DecisionBadge`, `MetricCard/MetricGroup`, `CertifiedBadge`/`FreshnessBadge`, `LoadingState`/`ErrorState`/`UnavailableState`. **New reusable evidence components** (added to `components/evidence/`): `EvidenceTimeline`, `EvidenceRecordCard`, `ProvenanceChain`, `SnapshotMetadataPanel`, `ReplaySummary` (all inspection-only, tested).

## 13. Confirmation — zero analytical/reasoning logic in React

- **No** recompute of decisions/scores/confidence, no driver/causality inference, no threshold/reconstruction, no evidence generation/modification, no snapshot/replay semantic alteration.
- The chain is **display-only** over governed values.

## 14. Authority separation

- Decision marked **CERTIFIED RESULT**; evidence/provenance are certified platform surfaces. **No AI surface** — no AI text could masquerade as evidence.

## 15. Freshness semantics

- **SNAPSHOT** badge; **SNAPSHOT ≠ STALE**. Unavailable → `UnavailableState`/`ErrorState`, never fabricated.

## 16. Replay behavior

- Replay is **displayed** (reproduced + byteIdentical MATCH/DIFFERENCE) from the governed `ReplayResult`. **No replay computation in React** — the transport invokes the certified replay capability.

## 17–18. Accessibility / responsive

- Semantic HTML, `role="status"`, `aria-label`, non-color-only (replay MATCH/DIFFERENCE uses text + color). Responsive via inherited grid/breakpoints.

## 19–20. Tests / build

- **87/87 tests pass** (81 + 6 Evidence) across 16 files; `tsc --noEmit` clean; `vite build` succeeds.

## 21. G3 limitations

- Serves the **certified reference evidence (SNAPSHOT)**, not live tenant data. Auth/session remains the minimal dev-mode mechanism (separate pending requirement).

## 22. Golden-output provenance verification

- Golden expected-outputs are used as **reference/SNAPSHOT sources only** (per the frozen Phase 7 rule); not exposed as permanent live evidence.

## 23. v2.0/v1.1 boundary verification

- No changes outside `frontend/`. Transport runs the certified platform in-process; semantically inert.

## 24. Commit hash

See the Phase 10 commit (below).

## Status

**PHASE 10 COMPLETE.** Awaiting approval before Phase 11 (Replay Explorer / Advanced Evidence — NOT yet authorized).
