# PROGRAM v3.0 — Phase 12.1: Read-Only Administration — Certification Report

**Status:** ✅ **CERTIFIED** (all mandatory gates pass)

- Phase 12 Contract & Scope Inspection: ✅ APPROVED
- Phase 12.1 implementation: ✅ APPROVED / IMPLEMENTED
- **Phase 12.1 certification:** ✅ **CERTIFIED**
- Phase 12.2 (Governed Mutations): 🔒 NOT AUTHORIZED
- Phase 12 full certification: 🔒 NOT AUTHORIZED

---

## 1. Certification matrix

| Gate | Requirement | Result |
|---|---|---|
| Contract fidelity | Existing governed contracts only | ✅ PASS |
| Real OIDC | Keycloak / JWKS verified (real tokens) | ✅ PASS |
| RBAC | `EnterpriseRuntime` / `ApiSecurity` authoritative | ✅ PASS |
| Tenant isolation | A↔B isolation proven (real HTTP) | ✅ PASS |
| 401 | Real HTTP authentication failures | ✅ PASS |
| 403 | Real HTTP authorization failures | ✅ PASS |
| Audit | Allow + deny audited (governed) | ✅ PASS |
| Read-only | No mutation exposed | ✅ PASS |
| Provenance | Golden outputs reference-only | ✅ PASS |
| No fabrication | Missing values remain unavailable/null | ✅ PASS |
| Accessibility | Phase 4 components, non-color-only, semantic | ✅ PASS |
| Responsive | Dense tables scroll horizontally | ✅ PASS |
| Regression | Full suite passed | ✅ PASS |
| TypeScript | Clean (`tsc --noEmit`) | ✅ PASS |
| Production build | Vite build succeeds | ✅ PASS |
| v1.1/v2.0 integrity | No platform source modified | ✅ PASS |

**DECISION: PROGRAM v3.0 — PHASE 12.1 READ-ONLY ADMINISTRATION — CERTIFIED.**

---

## 2. Real Keycloak HTTP evidence (gate: Real OIDC, 401, 403, Tenant isolation, Audit)

Run against a **real local Keycloak** (realm `iips`, client `iips-spa`, real realm JWKS), using
**real signed OIDC tokens** validated by `RealKeycloakVerifier` (real JWKS RS256). No mock
verifier. Test: `frontend/server/live/admin-live-certification.test.ts` — **7/7 PASS**.

| Path (real HTTP) | Principal | Status | Evidence |
|---|---|---|---|
| `/api/admin/overview` | admin-a (real token) | **200** | real OIDC → JWKS → Principal → authorized |
| `/api/admin/overview` | analyst-a (real token) | **403** | RBAC deny (EnterpriseRuntime action 'admin') |
| `/api/admin/overview` | viewer-a (real token) | **403** | RBAC deny |
| `/api/admin/overview` | no token | **401** | missing credential |
| `/api/admin/overview` | invalid token | **401** | verifier/JWKS reject |
| `/api/admin/data-governance` | admin-a (tenant-A) | **200** | payload contains ONLY tenant-A records |
| `/api/admin/data-governance` | admin-b (tenant-B) | **200** | payload contains ONLY tenant-B records |
| `/api/admin/audit` | admin-a | **200** | audit records all tenant-A |
| `/api/admin/audit` | admin-b | **200** | audit records all tenant-B |
| `POST /api/admin/engines` | admin-a | **200 (read-only)** | no mutation side-effect; read handler only |

**Tenant isolation proven end-to-end:** no cross-tenant records appear in any payload; enforcement
is server-side (not React filtering). `A→A ALLOW, A→B (absent), B→B ALLOW, B→A (absent)`.

**Audit evidence:** a governed `EnterpriseRuntime.AuditRecord` is produced for both authorized
admin reads (**ALLOW**) and denied analyst requests (**DENY**). Each record carries:
`auditId`, `userId` (principal), `tenantId`, `action` (`admin`), `resource` (`admin.<surface>`),
`allowed` (allow/deny), `at` (timestamp). No second audit system is used.
> Note (documented limitation): `AuditRecord` has no correlation-id field (G3 platform limitation
> identified in the Phase 12 inspection — telemetry `traceId` exists separately). This is a
> platform-level gap, not a v3.0 defect.

---

## 3. Authorization authority verification (gate: RBAC)

Inspected `SecuredExecutor.authorize()` and the admin resource gate.

**Finding — authorization remains governed by `EnterpriseRuntime`, not a new independent policy:**

```
SecuredExecutor.authorize(principal, action, resource, quota, max):
  1. EnterpriseRuntime.check(principal, action, resource)   // ← authoritative RBAC (ROLE_POLICY)
  2. quota guard (EnterpriseRuntime.scoped)
  3. ApiSecurity-style resource gate (thin, consistent layer on top)
```

- `EnterpriseRuntime` `ROLE_POLICY` grants the `admin` action **only** to the `admin` role
  (`admin → {action:'*'}`; `analyst → {execute,read}`; `viewer → {read}`). Therefore
  `EnterpriseRuntime.check(principal, 'admin', ...)` **alone** returns false for analyst/viewer.
  Verified: the composed path (RBAC + gate) denies analyst→403 and viewer→403.
- The `adminResourceGate` (`principal.roles.includes('admin')` for action `'admin'`) is a
  **redundant-but-consistent** resource-level check mirroring `PlatformApi.ApiSecurity.authorize`
  semantics. It does **not** replace or relax `EnterpriseRuntime`; it only tightens the same
  decision. This is the **approved server-side composition** of the v2.0 authorization primitives
  established in G3 (`SecuredExecutor` docstring: "EnterpriseRuntime RBAC + quota →
  PlatformApi.ApiSecurity-style resource check").
- **Prohibited patterns confirmed absent:** no React-side authorization (React `serverDenied=false`
  is a presentation placeholder only), no localStorage role authority, no URL/query/header-based
  role/tenant authority, no client-provided roles/tenant. Principal + tenant are constructed
  server-side from validated OIDC claims + platform `TenantDirectory`.
- **No independent RBAC policy was invented**; the admin gate reuses the governed role vocabulary.

---

## 4. Read-only mutation surface (gate: Read-only)

- **No mutation endpoints exist.** `admin-transport.ts` `handleAdminRequest` maps each `/api/admin/*`
  path to a read-only governed DTO; there are no POST/PUT/DELETE mutation handlers, no mutation
  DTOs, no mutation UI controls.
- `POST` to an admin endpoint returns the same read payload (handler ignores method) — verified to
  have **no mutation side-effect**.
- Out-of-scope mutations (marketplace revoke, certification/revocation, classification, workflow
  define, snapshot create/restore, DR actions, migration exec/rollback, rolling restart, platform
  lifecycle) are **not exposed** and were not accidentally reachable.

---

## 5. Source-of-truth & no-fabrication (gates: Contract fidelity, No fabrication)

Every admin value is computed from governed contracts in `buildAdminState()`:

| Admin value | Governed contract | Source |
|---|---|---|
| Engine registry | `PluginIdentity`/`PluginManifest` | frozen engines (in-process) |
| Certification/trust | `PluginMarketplace` | governed registry |
| Node health / HA | `CloudHaRuntime` | HA registry + failover/quorum |
| DR backup | `DisasterRecoveryRuntime` | governed backup export |
| Telemetry | `V2Observability` | governed trace records |
| Performance | `PerformanceScaling` | real measured batch (or `null` if unavailable) |
| Audit | `EnterpriseRuntime.auditLog` | real governed audit |
| Data governance | `DataGovernanceRuntime` | tenant-owned governed data |
| Live data quality | `LiveDataRuntime`/`DataSourceMeta` | snapshot metadata |
| Roles/permissions | `ROLE_POLICY` | governed platform constant |

No hard-coded production values, no fabricated users/tenants/permissions/engine-status/health
scores/audit records, no frontend-calculated admin metrics. Unavailable governed values
(e.g. performance measurement failure) render `null`/unavailable.

**Golden-output provenance:** golden expected-outputs are **not** used as any live/admin source;
they remain SNAPSHOT/reference only. The live-data surface uses a deterministic test market-data
feed and is explicitly labeled as **not** production external market data. Freshness labels
(LIVE/SNAPSHOT/STALE/UNAVAILABLE/REPLAY) are preserved via the governed DTOs and badges.

---

## 6. Platform contract integrity (gate: v1.1/v2.0 integrity)

- `git diff iips-platform/` → **no changes**. No v1.1 engine, no v2.0 distributed contract,
  no `EnterpriseRuntime` authorization semantics, no tenant/evidence/replay/certification invariant
  was modified.
- G3 architecture and `SecuredExecutor` composition unchanged (only the admin `TenantDirectory`
  gained the `admin-b` test identity).

---

## 7. UI certification (gates: Accessibility, Responsive, Contract fidelity)

- `/admin` route renders the real `Administration` shell; all implemented tabs load (overview,
  identity, tenancy, engines, platform, audit, live-data/governance, migration/workflow/marketplace).
- Reuses the frozen Phase 4 component library (`DataTable`, `MetricCard`, `MetricGroup`, `Badges`,
  `StateComponents`) — no new design system.
- Loading / error / empty / unavailable states verified (`LoadingState`, `ErrorState`,
  `UnavailableState`). Performance-unavailable renders a labeled message, not a fabricated value.
- Non-color-only status via semantic badges; semantic HTML (table scopes, roles, ARIA labels);
  keyboard-accessible tablist; dense tables scroll horizontally (responsive).

---

## 8. Regression

| Gate | Result |
|---|---|
| Phase 12.1 transport security tests (offline, mock verifier) | 9/9 PASS |
| Phase 12.1 UI tests | 5/5 PASS |
| Phase 12.1 real-Keycloak certification (offline-safe) | 7/7 PASS (with real Keycloak) |
| Full v3.0 suite (offline) | **121 passed / 15 skipped** (8 G3-live + 7 admin-live skip without Keycloak) |
| G3 security tests | intact |
| TypeScript strict (`tsc --noEmit`) | clean |
| Production Vite build | succeeds |
| v1.1/v2.0 | unchanged |

---

## 9. Files (Phase 12.1 certification)

- **Added** `frontend/server/live/admin-live-certification.test.ts` — real-Keycloak end-to-end cert.
- **Changed** `frontend/server/admin-transport.ts` — added `admin-b` (tenant-B) to the tenant
  directory (certification test identity; server-side tenant validation unchanged).
- **Changed** `frontend/server/live/keycloak-provision.mjs` — provision `admin-b` (tenant-B admin)
  for real tenant-isolation certification.
- `docs/v3.0/phase12/PROGRAM_v3.0_PHASE12_1_CERTIFICATION.md` (this report).

No v1.1/v2.0 platform source modified. No secrets committed.

---

## 10. Recommendation

Phase 12.1 Read-Only Administration is **CERTIFIED**. All mandatory gates pass, including the real
Keycloak end-to-end path and the authorization-authority verification.

**Phase 12.2 (Governed Mutations) remains NOT AUTHORIZED.** Per the mandatory stop, no Phase 12.2
work begins. The next decision is the maintainer's, and requires its own authorization + a separate
contract/authority check for each mutation before any implementation.

---

**MANDATORY STOP after certification reached. Awaiting explicit maintainer decision on Phase 12.2.**
