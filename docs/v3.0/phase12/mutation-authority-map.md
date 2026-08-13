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
