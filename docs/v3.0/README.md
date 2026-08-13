# Program v3.0 — Enterprise Investment Intelligence Experience

**Program:** IIPS Engineering Standards — Program v3.0
**Branch:** `feature/program-v3-enterprise-experience`
**Platform baseline:** Program v2.0 — CERTIFIED (frozen); Program v1.1 — CLOSED / LTS (frozen deterministic core)

> v3.0 is a **new product/application experience layer** built on top of the certified v2.0 platform. It must NOT redefine, duplicate, override, or silently modify investment-engine semantics.

## Boundary

| Program | Role |
|---|---|
| v1.1 | Frozen deterministic investment-engine core — defines what results mean |
| v2.0 | Certified enterprise platform/infrastructure layer — delivers intelligence |
| **v3.0** | **Enterprise user experience + application layer — presents/interacts with intelligence** |

## Phase 0 deliverables (repository audit)

- `repository-audit.md` — repo structure, frontend status, v2.0 contracts, gaps, proposed architecture, sequence
- `existing-capabilities.md` — catalog of certified platform capabilities v3.0 consumes
- `frontend-architecture.md` — proposed React/TS/Vite architecture (greenfield)
- `v2-boundary-map.md` — contract → experience-surface mapping + non-goals
- `v3-gap-analysis.md` — application-layer gaps vs certified-capability gaps

## Upcoming phases

1. Experience Constitution
2. Design Tokens
3. Application Shell / Navigation / Routing
4. Core Component Library
5. Executive Dashboard
6. Portfolio Workspace
7. Company Intelligence
8. Cross-Sector Intelligence
9. Decision Matrix
10. Evidence Explorer
11. Replay Explorer
12. Administration
13. Accessibility / Performance / Responsive hardening
14. v3.0 Certification

**Status: PHASE 0 COMPLETE — discovery only. No implementation yet. Awaiting approval.**
