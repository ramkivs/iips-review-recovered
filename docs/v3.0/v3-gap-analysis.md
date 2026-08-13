# Program v3.0 — Phase 0: v3.0 Gap Analysis

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** GAP ANALYSIS (Phase 0)
**Version:** 1.0
**Date:** 2026-08-09

> Identifies what v3.0 must build (application layer) vs what must NOT be built (reimplementation of certified semantics). Gaps in certified capabilities are **documented, not fabricated**.

---

## 1. Application-layer gaps (v3.0 must build)

| Gap | Resolution |
|---|---|
| No React/frontend app | Build greenfield (React + TS + Vite, to be confirmed) |
| No design system / tokens / component library | Build per master prompt (§5, §6) |
| No routing / state / API client | Build per `frontend-architecture.md` |
| No charting/visualization | Integrate a library (e.g., Recharts/ECharts — presentation-only) |
| No UI test infra | Add component/page/integration/contract tests |
| No auth session/token service | Build auth entry point consuming `EnterpriseRuntime`/`PlatformApi` security; must not weaken RBAC |
| No HTTP/REST/gRPC transport over v2.0 contracts | Build a thin read-only transport/adapter (authorized separately) |

## 2. Certified-capability gaps (document, do NOT fabricate)

| Surface requested in IA | Certified contract status | v3.0 action |
|---|---|---|
| Portfolio "performance/returns" | No returns/P&L contract | Do not compute returns in React; show unavailable/absent |
| Full "risk" analytics | Only CSIP concentration/diversification | Surface only those |
| Decision Matrix classification | Only if platform supplies it | Presentation-only; never re-derive |
| Screening | No screening contract | Document gap |
| Historical decision series per company | Limited (snapshot/replay history) | Surface what replay/snapshot store exposes |

## 3. Contracts present but needing adapter exposure

- Engine results, CSIP portfolio/ranking/allocation, evidence, snapshot, replay, live-data, RBAC/audit, data-governance, workflow, marketplace, AI advice, observability lineage, platform health.

## 4. Non-goals (must NOT build)

- Reimplemented scoring/ranking/thresholds/confidence/weights/gates/valuation/recommendations.
- Any change to v2.0 contracts, v1.1 engines, or certification invariants to make UI easier.
- Any AI authority over deterministic decisions.
- Any bypass of RBAC / security boundaries.
- Presenting AI output as a certified result.

## 5. Stop conditions (from master prompt §32)

If any v2.0 contract/engine/decision-rule/certification-invariant change, security-boundary weakening, RBAC bypass, deterministic-logic recreation, or AI-authority need arises → **stop and request authorization.**

## Status

**GAP ANALYSIS — COMPLETE (Phase 0).** No v2.0/v1.1 behavior modified.
