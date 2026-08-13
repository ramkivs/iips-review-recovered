# PROGRAM v3.0 — Phase 12: Administration / Enterprise Operations

**Status:** CONTRACT & SCOPE INSPECTION — COMPLETE (documentation only; **no implementation**)

**Branch:** `feature/program-v3-enterprise-experience`

---

## 1. What this phase is

Phase 12 determines exactly what **Administration / Enterprise Operations** can legitimately
expose from the existing **governed v2.0 platform**, without inventing new administration
contracts, without redefining engine semantics, and without bypassing the frozen **G3 security
boundary**.

This is a **discovery + documentation deliverable only**. It does **not** create React admin
pages, API endpoints, DTOs, mutations, authorization rules, or any platform changes.

## 2. Authorization state

| Item | Status |
|---|---|
| Program v3.0 Phases 0–11 | ✅ Complete |
| G3 Assessment / Identity Architecture / Adapter+Enforcement / **LIVE** | ✅ Complete / Certified / Approved |
| **Phase 12 Contract & Scope Inspection** | ▶ **AUTHORIZED — COMPLETE** |
| Phase 12 Implementation | 🔒 NOT AUTHORIZED |
| Phase 12 Certification | 🔒 NOT AUTHORIZED |

## 3. Scope & non-negotiable boundaries

- **v1.1** = certified deterministic investment-engine semantics — must not be modified.
- **v2.0** = certified platform baseline; existing governed capabilities remain authoritative.
- **v3.0 / React** = presentation, navigation, interaction, state presentation. React is **NOT**
  an authorization, tenant, investment-decision, audit, or data-governance authority.
- **G3 security boundary frozen:** Keycloak answers **WHO**; `EnterpriseRuntime` /
  `PlatformApi.ApiSecurity` answer **WHAT MAY THEY DO**. Frontend visibility ≠ authorization.

## 4. Method

For each of the 15+ contract-inspection areas we asked the same questions:

- Does a governed contract **exist**? What is its contract type?
- Is it **readable**, **writable**, or **mutating**?
- What **authorization** governs it?
- Is it **tenant-scoped**?
- Is it **audited**?
- Can v3.0 expose it as a **UI candidate**?

Capabilities that do **not** exist in the platform are classified **UNAVAILABLE** — never
fabricated.

## 5. Headline findings (summary)

| Area | Governed contract exists? | v3.0 can expose |
|---|---|---|
| Users | ❌ No user/identity directory contract in platform | **UNAVAILABLE** (identity lives in Keycloak) |
| Roles | ⚠️ `Role`, `ROLE_POLICY` in `EnterpriseRuntime` (read) | Read-only model display |
| Permissions | ✅ `EnterpriseRuntime.authorize/check`, `ROLE_POLICY`, `ApiSecurity` | Read-only permission model |
| Tenants | ⚠️ `tenantId` + `isTenantResource` + `Principal` (no tenant CRUD) | Tenant context/isolation status only |
| Data Governance | ✅ `DataGovernanceRuntime` (classify, access, export) | Read + governed inspection |
| Engine Registry | ⚠️ `PluginLoader.list`, engine `identity`/`manifest`, `PluginMarketplace` | Read-only engine/cert registry |
| Platform Health | ⚠️ `CloudHaRuntime`, `V2Observability`, `PerformanceScaling` | Read-only health/HA/DR/telemetry |
| Audit | ✅ `EnterpriseRuntime.auditLog()` (in-memory) | Read + filter (in-memory scope) |
| Workflow | ⚠️ `DeterministicWorkflow` (define/execute) | Read-only definitions; **no edit** |
| AI | ⚠️ `AiAssistedRuntime` (advisory only, no config store) | Read-only advisory/non-authoritative |
| Live Data | ✅ `LiveDataRuntime` (snapshot/executor) | Read-only source/quality status |
| Quotas/Entitlements | ⚠️ quota is a **call-time parameter** (`authorizeExecution`), no store | Show enforcement only; **no edit** |
| Migration | ⚠️ `MigrationRuntime` (record + replay-based) | Read-only migration history |
| Marketplace/Modules | ✅ `PluginMarketplace` (register/certify/revoke) | Read-only registry; **revoke is governed** |
| System Configuration | ❌ No config store/service | **UNAVAILABLE** |

> **The single most important finding:** the certified platform is intentionally **not** a generic
> user/tenant/role CRUD system. It has **no** user directory, **no** tenant CRUD, **no**
> config store, and **no** persistent quota/entitlement store.
>
> **Phase 12 constitution (maintainer-defined):** **"Read-first governed administration with
> narrowly scoped platform-authorized mutations."** — NOT "read-only Administration." The dominant
> surface is governed read/inspection over certified platform state; a small set of platform-authorized
> mutations exist (marketplace `revoke`, data-governance classification, workflow `define`) but each
> requires a **separate contract/authority check and separate authorization/certification** before it
> may be exposed in v3.0. Phase 12.1 implements **read-only** surfaces only; mutations are OUT OF SCOPE
> until a later, separately-authorized milestone.

## 6. Deliverables in this directory

| File | Contents |
|---|---|
| `README.md` | This file — scope, boundaries, status |
| `contract-inspection.md` | Complete v2.0 contract findings by inspection area |
| `capability-matrix.md` | Capability × contract × read/write × authz × tenant × audit matrix |
| `admin-information-architecture.md` | Candidate Administration IA from **discovered** capabilities only |
| `admin-field-source-map.md` | UI field → API DTO → governed contract → certified source |
| `mutation-authority-map.md` | Every potential mutation → authorization → tenant → audit → risk |
| `phase12-gap-analysis.md` | G1/G2/G3/G4/G5 gap classification |
| `phase12-security-review.md` | Threat / security-boundary findings |
| `phase12-recommendation.md` | Recommended implementation sequence + explicit UNAVAILABLE items |

## 7. Mandatory stop

Per the authorization, **no implementation** was performed. React admin pages, routes, API
endpoints, DTOs, mutations, authorization changes, tenant-enforcement changes, and v2.0 changes
are **all explicitly out of scope** for this deliverable and were **not** performed.

**Phase 12.1 (Read-Only Administration) was subsequently authorized and implemented separately.**
See `phase12-implementation.md`.
