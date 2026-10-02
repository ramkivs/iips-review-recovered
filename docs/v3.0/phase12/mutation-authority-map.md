# PROGRAM v3.0 — Phase 12: Mutation Authority Map

Every potential administrative mutation → governed authorization → tenant validation → audit →
risk → **decision for v3.0**.

Risk classes: **READ** (no state change) · **LOW** (config change) · **HIGH** (role/tenant/quota/
access change) · **DESTRUCTIVE** (delete/disable/revoke/rollback).

Rule (§19): if the governed platform does **not** support a mutation, **DO NOT IMPLEMENT IT**.

## Governed mutations that EXIST in the platform

| Mutation | Governed contract | Authorization | Tenant validation | Audit | Risk | v3.0 decision |
|---|---|---|---|---|---|---|
| Classify data item | `DataGovernanceRuntime.classify` | admin (authorize `admin`) | data is tenant-owned; principal tenant must match | ⚠️ caller-audited | LOW–HIGH | ⚠️ Expose only behind a guarded, confirmed, audited contract (NOT default) |
| Define workflow | `DeterministicWorkflow.define` | admin | global | ⚠️ | HIGH | ❌ Not recommended (no guarded edit UX contract) |
| Certify plugin | `PluginMarketplace.certify` | admin | global | ⚠️ | HIGH | ❌ supply-chain; platform-owned |
| Revoke plugin | `PluginMarketplace.revoke` | admin | global | ⚠️ | DESTRUCTIVE | ❌ Not in v3.0 admin (blacklists a plugin) |
| Mark node down | `CloudHaRuntime.markDown` | admin | global | ⚠️ | HIGH | ❌ ops-owned; no v3.0 contract |
| Rolling restart | `CloudHaRuntime.rollingRestart` | admin | global | ⚠️ | HIGH | ❌ ops-owned |
| Snapshot ingestion | `MarketDataSource.snapshot` / `DataBoundExecutor` | governed execution | tenant-owned | ⚠️ | HIGH | ❌ data-source gate (separate) |
| Restore backup | `DisasterRecoveryRuntime.restore` | admin | global | ⚠️ | DESTRUCTIVE | ❌ DR-owned; no v3.0 admin contract |

## Mutations that DO NOT exist (must remain UNAVAILABLE)

| Potential mutation | Governed support | Decision |
|---|---|---|
| Create/disable/lookup user | ❌ | UNAVAILABLE |
| Assign/remove role | ❌ | UNAVAILABLE |
| Edit permission policy | ❌ | UNAVAILABLE |
| Create/edit/delete tenant | ❌ | UNAVAILABLE |
| Change tenant quota / reset | ❌ | UNAVAILABLE |
| Edit AI config / model / prompt | ❌ | UNAVAILABLE |
| Edit system configuration | ❌ | UNAVAILABLE |
| Execute migration / rollback | ❌ (history only) | UNAVAILABLE |
| Approve/reassign/retry workflow | ❌ | UNAVAILABLE |
| Activate/deactivate module | ❌ (only certify/revoke) | UNAVAILABLE |

## Bounded availability: IIPS product-tier tenant membership (G3-DEP-3)

> **Scope limit.** This subsection applies **only** to the IIPS-owned **product-tier
> tenant-membership capability** defined by the G3 governance records
> (`PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_GOVERNANCE_DECISION.md`, and the G3 technical decision
> `PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_SUBSTRATE_TECHNICAL_AUTHORITY.md`). It amends nothing else
> in this map, and it does not broaden the authority model, create a parallel mutation path, or
> create a new mutation-authority framework. **Authority: Program Authority decision
> `PROGRAM_v3.0_G3_DEP3_MUTATION_AUTHORITY_AMENDMENT_DECISION.md`.** All other entries above —
> including the §19 rule and every UNAVAILABLE entry — remain unchanged.

| Mutation | Governed contract | Authorization | Tenant validation | Audit | Risk | v3.0 decision |
|---|---|---|---|---|---|---|
| Tenant membership **lookup** (`userId → tenantId`) | `TenantDirectory.tenantForUser` resolution against the durable IRR membership store | server-side only; no client authority | n/a (resolves tenant; fails closed) | governed | **READ** | ✅ **AVAILABLE — READ ONLY** for the bounded capability; unresolvable membership fails closed, never a default |
| Tenant membership **assignment** | bounded membership mutation, `userId ↔ tenantId` | `EnterpriseRuntime`/`ApiSecurity` via the existing executor chain; server-side only | principal tenant validated | required (allow + deny) | **HIGH** | ✅ **AVAILABLE — BOUNDED** for the bounded capability |
| Tenant membership **revocation** | bounded membership mutation, `userId ↔ tenantId` | `EnterpriseRuntime`/`ApiSecurity` via the existing executor chain; server-side only | principal tenant validated | required (allow + deny) | **HIGH** | ✅ **AVAILABLE — BOUNDED** for the bounded capability |
| Tenant membership **reassignment** | — | — | — | — | — | ⛔ **DEFERRED — G3-DEP-1.** Not authorized by this amendment. |

**Explicitly NOT authorized by this amendment** (each remains exactly as recorded above):
user creation · user disablement · general user mutation · tenant creation · tenant deletion ·
tenant quota mutation · role assignment/removal · permission-policy mutation · Keycloak user
lifecycle mutation · client-side authority · client-supplied tenant authority ·
`companyId` · `runtimeCompanyId`.

**Binding conditions on the three available entries:** server-side-only execution;
`EnterpriseRuntime`/`ApiSecurity` authorization chain; authenticated principal validation; tenant
validation; governed audit; fail-closed lookup; durable server-side membership state; the bounded
`userId ↔ tenantId` contract with `Principal { userId, tenantId, roles }` unchanged; and the
certification tests specified in **"Required future certification tests"** below. No additional
identity field is introduced, and Keycloak remains the identity/authentication authority — it is
**not** the IIPS tenant-membership authority.

## Recommended v3.0 stance

- **v3.0 Phase 12 is, at core, a governed READ/inspection surface.** The honest answer is that
  Administration exposes **state, not broad mutation**.
- The **only** mutations arguably representable are the few governed ones above, and **each is
  HIGH-RISK or DESTRUCTIVE** and owned by a platform authority. For a first implementation,
  **v3.0 should present these as read-only status** and defer the actual mutation to the governing
  authority (Keycloak admin console for identity; platform/ops surfaces for supply-chain/DR/ops).
- **No mutation should be implemented in v3.0 without (1) an existing governed contract,
  (2) server-side authorization via `EnterpriseRuntime`/`ApiSecurity`, (3) tenant validation,
  (4) governed audit, and (5) explicit maintainer approval of that specific mutation.**

## Required future certification tests (when any mutation is authorized)

For each authorized mutation, the required tests are:

- Authenticated **admin** → authorized → tenant validated → mutation → **audit** → success.
- Authenticated **analyst** → **denied** (403).
- Authenticated **viewer** → **denied** (403).
- **Tenant A** principal → **Tenant B** resource → **denied** (403).
- **Unauthenticated** → **401**.
- **Destructive** mutations: explicit-confirmation required; audit must record actor + tenant +
  action + allow/deny + correlation where available.
