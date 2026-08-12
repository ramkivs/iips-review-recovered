# Program v3.0 — Phase 0: Repository Audit

**Program:** IIPS Engineering Standards — Program v3.0 (Enterprise Investment Intelligence Experience)
**Document type:** REPOSITORY AUDIT (Phase 0 — discovery only, no implementation)
**Version:** 1.0
**Date:** 2026-08-09
**Branch:** `feature/program-v3-enterprise-experience`
**Platform baseline:** Program v2.0 — CERTIFIED (frozen); Program v1.1 — CLOSED / LTS (frozen deterministic core)

---

## 1. Repository architecture (top-level)

The repository is a **monorepo** of governed, standards-first packages. It contains **no frontend/application layer**.

| Area | Path(s) | Content |
|---|---|---|
| Platform runtime | `iips-platform/` | Deterministic runtime, framework, snapshot/replay/evidence, plugin loader, registry, distributed v2.0 modules |
| Platform contracts | `ies-005.1-contracts/` | Frozen IES-005.1 contracts (sec/semc/manifest/runtime/transport/registry) |
| Sector standards | `ies-006..015-*` | 10 frozen sector engines + their reference assets |
| Cross-sector | `iips-cross-sector/` + `iips-platform/src/sector-engines/cross-sector/` | CSIP (portfolio intelligence) |
| Platform capabilities | `ies-005.2..4`, `iips-benchmark/`, `iips-observability/`, `iips-cicd/` | Performance, observability, CI/CD |
| Program governance | `ies-000-template/`, `governance/`, `program-v1.1-certification/`, `program-v2.0-discovery/` | Standards, certifications, ADRs |
| **v3.0 (NEW)** | `docs/v3.0/` (planned `app/` or `frontend/`) | **Empty — to be built** |

## 2. Frontend architecture (existing)

**None.** There is:
- **No** React application.
- **No** Vite / Webpack configuration.
- **No** `.tsx`/`.jsx`/`.css` files.
- **No** routing, state-management, API-client, design-system, charting, or component library.

All 5 `package.json` files (`ies-005.1-contracts`, `iips-benchmark`, `iips-cicd`, `iips-observability`, `iips-platform`) are **backend/TypeScript packages** (CommonJS, `tsx`, `node:test`).

## 3. Existing UI capabilities

**None.** No dashboards, portfolio/research/company/sector/ranking/evidence/replay/admin screens, tables, charts, cards, filters, modals, navigation, or design tokens exist in the repository.

## 4. Existing v2.0 API/SDK contracts

The v2.0 platform exposes **programmatic TypeScript contracts** (not a standalone HTTP server). The relevant surface for v3.0 is in `iips-platform/src/distributed/` (13 modules) plus the platform public API (`iips-platform/src/index.ts`):

| Contract | Module | Key types for v3.0 |
|---|---|---|
| Public API facade | `PlatformApi.ts` | `ApiRequest`, `ApiResponse`, `ApiSecurity` |
| Distributed runtime | `DistributedRuntime.ts` | `DistributedExecutionContext`, `DistributedNode` |
| Cloud/HA | `CloudHaRuntime.ts` | `NodeHealth`, `HaNode`, `Placement` |
| Disaster recovery | `DisasterRecoveryRuntime.ts` | `DrBackup` |
| Live data | `LiveDataRuntime.ts` | `DataSnapshot<T>`, `DataSourceMeta`, `DataBoundRequest` |
| Observability | `V2Observability.ts` | `TraceEvent`, `TraceRecord` |
| Enterprise/RBAC | `EnterpriseRuntime.ts` | `Principal`, `Role`, `AuditRecord`, `Permission` |
| Data governance | `DataGovernanceRuntime.ts` | `GovernedData`, `DataClassification`, `GovernanceDecision` |
| Migration | `MigrationRuntime.ts` | `MigrationRecord` |
| Marketplace | `PluginMarketplace.ts` | `PluginRecord`, `PluginTrustState` |
| Workflow | `WorkflowRuntime.ts` | `WorkflowDefinition`, `WorkflowNode`, `WorkflowResult` |
| Performance | `PerformanceScaling.ts` | `ScalingSample` |
| AI (advisory) | `AiAssistedRuntime.ts` | `AiAdvice`, `AiAdvisor` |

The **v1.1 sector engines** expose execution metadata (see `v2-boundary-map.md`).

## 5. Existing evidence/replay capabilities

- **Evidence:** `EvidencePipeline` (`iips-platform/src/framework/evidence/EvidencePipeline.ts`) produces immutable, engine-scoped evidence packages (`EvidencePackage`: evidenceId, compositeScore, confidence, keyMetrics, supportingScores, calibrationVersion, decisionRulesApplied, replayReference, provenance).
- **Snapshot:** `SnapshotService`/`SnapshotStore` produce immutable snapshots (`Snapshot`: snapshotId, engineId, scores, metrics, verdict, evidenceRefs, provenance).
- **Replay:** `ReplayService` reproduces snapshots (`ReplayResult`: snapshotId, reproduced, byteIdentical, evidenceRefs).
- **Live-data lineage:** `DataSnapshot` carries `dataVersion`/`asOf`/provider/quality — the input boundary.
- **V2 observability:** `V2Observability` records the full chain (live-data → snapshot → execution → evidence → replay → node/HA/DR).

## 6. Existing authentication/RBAC capabilities

- **`EnterpriseRuntime`** (`Principal`, `Role` = admin/analyst/viewer, `Permission`, `AuditRecord`, `check()`, `authorize()`, `isTenantResource()`, quotas).
- **`PlatformApi`** takes an `ApiSecurity` interface (`authorize(tenantId, roles, action, resource)`) — the v3.0 API layer must supply/consume this.
- **Data governance** (`DataGovernanceRuntime`) controls access/retention/region/classification.
- There is **no existing authentication server/session/token layer** — v3.0 must build the auth entry point and connect it to these contracts (without weakening them).

## 7. Existing reusable components

**None.** No shared React/design-system components exist. All reusable "components" are **backend TypeScript services** (runtime, framework, evidence, replay, distributed modules) which v3.0 will call through an API layer.

## 8. Existing gaps

| # | Gap | Impact on v3.0 |
|---|---|---|
| G1 | No frontend/application layer at all | v3.0 must build the entire React app |
| G2 | No HTTP/REST/gRPC server exposing the v2.0 contracts | A v2.0 API transport/adapter layer is needed (contracts exist, transport does not) |
| G3 | No auth/session/token service (only `EnterpriseRuntime` authz model) | v3.0 needs an authentication entry point; must not weaken RBAC |
| G4 | No design system / tokens / component library | v3.0 must build from scratch |
| G5 | No charting / visualization library | v3.0 must select + integrate |
| G6 | No test infrastructure for UI | v3.0 must add component/page/integration/contract tests |
| G7 | Cross-sector outputs are programmatic (CSIP types) | v3.0 needs a mapping to API contracts for portfolio/sector views |

## 9. Proposed v3.0 architecture

```text
USER
  ↓
PROGRAM v3.0 (React SPA)
  ├── AppShell / Navigation / Routing
  ├── Design System (tokens + component library)
  ├── Feature modules (Executive, Portfolio, Research, Intelligence, Evidence, Admin)
  ├── State management (server/UI/session/nav/filter separation)
  └── API client layer (typed)
         ↓
PROGRAM v2.0 CERTIFIED PLATFORM
  └── API transport/adapter (new, thin — exposes certified contracts only)
         ↓
V1.1 DETERMINISTIC ENGINE CORE (unchanged)
```

**Boundary:** v3.0 consumes v2.0 contracts. It must NOT redefine/duplicate/override investment-engine semantics.

## 10. Proposed implementation sequence

Per the master prompt:
1. Repository Audit (this doc)
2. Experience Constitution
3. Design Tokens
4. Application Shell / Navigation / Routing
5. Core Component Library
6. Executive Dashboard
7. Portfolio Workspace
8. Company Intelligence
9. Cross-Sector Intelligence
10. Decision Matrix
11. Evidence Explorer
12. Replay Explorer
13. Administration
14. Accessibility / Performance / Responsive hardening
15. v3.0 Certification

## Status

**PHASE 0 REPOSITORY AUDIT — COMPLETE (discovery only).** No v2.0/v1.1 behavior modified. Awaiting approval before Phase 1 (Experience Constitution) and any large-scale UI implementation.
