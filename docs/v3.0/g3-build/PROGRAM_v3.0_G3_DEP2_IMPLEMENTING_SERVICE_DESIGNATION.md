# IIPS v3.0 — G3-DEP-2 Implementing Service Designation

## Program Authority / Architecture Designation Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G3-DEP-2 — Implementing Service Designation (tenant membership)

**Document type:** PROGRAM AUTHORITY / ARCHITECTURE DESIGNATION — designates the single concrete
IIPS server-side component that owns the tenant-membership capability, and fixes its authority
boundary. **No implementation authority is granted.**

**Version:** 1.0 — Designation

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Branch:** `arena/01a0f1b3-iips-review-recovered`

**Authoritative remote:** `https://github.com/ramkivs/iips-review-recovered.git`

**Authoritative ref:** `refs/heads/arena/01a0f1b3-iips-review-recovered`

**IRR baseline at designation:**
`arena/01a0f1b3-iips-review-recovered@d0bf7e5d7be7803a8392a671cc18e2545e5a7c67`
(tree `d169dd5d359b35dc35fbb2a135cf7e0332179353`)

**Dependency state at designation:**

| Dependency | Status | Record blob |
|---|---|---|
| G3-DEP-3 — mutation-authority-map amendment | **SATISFIED / DURABLE** | `0465f018119b0831680a3e1a890813fcaeca9291` |
| G3-DEP-1 — tenant reassignment policy | **SATISFIED / DURABLE** | `c9df1c58631ff64cddafad18f82a4f82354762f9` |

**Governing inputs — all verified byte-identical to the authoritative remote before recording:**

| Record | Blob |
|---|---|
| `PROGRAM_v3.0_G3_PRODUCT_TENANT_REGISTRY_AUTHORITY.md` | `844eca8a2435bd2352b2688a81690e22535c7e00` |
| `PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_GOVERNANCE_DECISION.md` | `37c852206126f9770876fa6a81c935760cb38c84` |
| `PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_SUBSTRATE_TECHNICAL_AUTHORITY.md` | `a88dc7439540…` |
| `PROGRAM_v3.0_G3_DEP3_MUTATION_AUTHORITY_AMENDMENT_DECISION.md` | `0465f018119b0831680a3e1a890813fcaeca9291` |
| `PROGRAM_v3.0_G3_DEP1_TENANT_REASSIGNMENT_POLICY_DECISION.md` | `c9df1c58631ff64cddafad18f82a4f82354762f9` |
| `docs/v3.0/phase12/mutation-authority-map.md` | `4ba6c3738797090cc04723a9045d05527fe5fdff` |

---

> **This record designates WHO owns tenant membership. It grants NO implementation authority.**
> It establishes no storage implementation, no migration implementation, no API route, no UI, no
> Reports wiring, no NP-04 schema change, no production deployment, and no Keycloak change. It
> does not implement, wire, verify, or certify `TenantDirectory`, and it does not satisfy NP-06
> **P1.1**.

## 1. Designated component

### **`SecuredExecutor` — `frontend/server/secured-executor.ts`**

This is the **single** IIPS server-side component designated to own the tenant-membership
capability. It is an **existing** component, not a new service created for this gate.

## 2. Why this is the correct authority boundary

Designation is grounded in existing architecture, not convenience:

1. **It is already the declared enforcement boundary.**
   `keycloak-architecture.md:58` establishes that *"IIPS remains responsible for: Principal
   construction, **tenant resolution/validation**, resource isolation, RBAC enforcement,
   authorization, quotas/entitlements, security audit — using the existing v2.0 primitives… **No
   parallel authorization primitives.**"* Tenant resolution is named explicitly as belonging to the
   IIPS authorization authority, and `SecuredExecutor` is that authority's concrete
   implementation.

2. **It already holds the tenant seam as a first-class dependency.**
   `secured-executor.ts:26` declares `private readonly directory: TenantDirectory` as a constructor
   dependency, and `authenticate()` (`:41`) already calls
   `this.directory.tenantForUser(governedUserId, id.claims.tenant)` to derive the principal's tenant.
   The capability is already invoked at exactly the boundary this record designates; the gap is
   that the injected implementation is a fixture.

3. **It already enforces every required control.**
   - **401 fail-closed:** `AuthError(401, 'no-valid-tenant')` at `:41` when membership cannot be
     resolved.
   - **403 cross-tenant:** `AuthError(403, 'cross-tenant-denied')` at `:74`, via
     `EnterpriseRuntime.checkIsTenantResource`.
   - **RBAC/quota:** `:55`, `:57`.
   - **Resource gate:** `:59`, via the injected `ApiSecurity`-style `resourceAccess`.
   - **Governed audit:** every decision routes through `EnterpriseRuntime.check` / `checkIsTenantResource`,
     which records `AuditRecord` entries retrievable via `auditLog()` (`EnterpriseRuntime.ts:117`).

4. **It is the only existing component satisfying all §6 criteria** — server-side, positioned
   between the Keycloak authentication boundary and `EnterpriseRuntime`, able to enforce tenant
   isolation, fail closed, and emit governed audit.

### 2.1 Components explicitly NOT designated, and why

| Component | Not designated — reason |
|---|---|
| `EnterpriseRuntime` | The v2.0 authorization **primitive library** (RBAC, tenant isolation, quota, audit). It is a dependency *of* the designated service, not the membership owner. Making it the owner would blur the authorization-primitive / identity-resolution boundary that `keycloak-architecture.md:58` draws. |
| `PlatformApi.ApiSecurity` | An **interface** (`PlatformApi.ts:45`) for resource-gate decisions. It is satisfied by the injected `resourceAccess`; it holds no membership state and performs no identity resolution. |
| `DataGovernanceRuntime` | Governs **data** classification, retention, lineage, and cross-tenant leakage — not **identity membership**. Using it would conflate data governance with identity authority. |
| Keycloak | Remains the **identity/authentication** authority. It is **not** the IIPS tenant-membership authority (`keycloak-architecture.md:81`, `:98`). |
| A new dedicated membership service | Would create a **parallel** authorization boundary, directly violating `keycloak-architecture.md:58` (*"No parallel authorization primitives"*), and would duplicate the `TenantDirectory` seam `SecuredExecutor` already owns. |

## 3. Authority boundary

`SecuredExecutor` owns tenant membership **only** as the server-side enforcement boundary for
identity and authorization.

It operates strictly within the established chain:

```text
Keycloak (authentication authority, unchanged)
        ↓  validated identity
SecuredExecutor.authenticate(credential)          ← TenantDirectory resolution happens here
        ↓  server-derived Principal { userId, tenantId, roles }
SecuredExecutor.authorize / authorizeMutation(…)  ← EnterpriseRuntime / ApiSecurity
        ↓  governed allow/deny + AuditRecord
```

**Principal contract — unchanged:**

```ts
{ userId: string; tenantId: string; roles: readonly Role[] }
```

(`iips-platform/src/distributed/EnterpriseRuntime.ts:15`)

`tenantId` is **server-derived** from the authoritative membership resolution. Client, URL, and
localStorage tenant values are untrusted inputs.

## 4. Allowed operations

Authorized by G3-DEP-3 and owned by the designated component:

| Operation | Class | Notes |
|---|---|---|
| **Tenant membership lookup** | **READ ONLY** | `resolveTenant(userId)` via `TenantDirectory.tenantForUser`; fail-closed on unresolvable membership |
| **Tenant membership assignment** | **BOUNDED MUTATION (HIGH)** | Server-side only; authorization + tenant validation + governed audit |
| **Tenant membership revocation** | **BOUNDED MUTATION (HIGH)** | Server-side only; authorization + tenant validation + governed audit |

## 5. Prohibited operations

The designated component acquires **no** authority for:

❌ user creation · ❌ user disablement · ❌ general user mutation · ❌ tenant creation ·
❌ tenant deletion · ❌ tenant quota mutation · ❌ role assignment / removal ·
❌ permission-policy mutation · ❌ Keycloak user lifecycle mutation · ❌ client-side authority ·
❌ client-supplied tenant authority · ❌ `companyId` · ❌ `runtimeCompanyId`

## 6. Cross-tenant reassignment prohibition (G3-DEP-1 is authoritative)

> **`revoke(oldTenant) + assign(newTenant)` is a tenant reassignment and is NOT an authorized
> workflow.**

The future implementation **must fail closed** if an operation would constitute a cross-tenant
reassignment. Tenant reassignment is classified **DESTRUCTIVE / HIGH-RISK** and is **NOT
AUTHORIZED**. Existing tenant-owned resources remain bound to their original tenant; historical
audit is never rewritten.

**No such guard is implemented or authorized by this record.** The guard belongs to the
implementation path under **G3-B**.

## 7. Required EnterpriseRuntime / ApiSecurity integration

The implementation must:

1. Use the existing `EnterpriseRuntime` primitives and the injected `ApiSecurity`-style
   `resourceAccess` — **no parallel authorization primitive** (`keycloak-architecture.md:58`).
2. Construct the `Principal` only in the server-side tier from the validated identity and the
   authoritative tenant resolution.
3. Record a governed `AuditRecord` for **both allow and deny** on every bounded membership mutation,
   consistent with `mutation-authority-map.md:53–54`.
4. Satisfy the certification tests already specified at `mutation-authority-map.md` "Required future
   certification tests" (admin authorized; analyst and viewer denied 403; cross-tenant denied 403;
   unauthenticated 401).

## 8. Fail-closed requirement

- Unresolvable membership ⇒ `AuthError(401)` — **never** a default tenant, a first-match, or a
  fallback to `ADMIN_DIRECTORY`.
- Absent or unreadable membership state ⇒ **denial**, never an open or partially-resolved state.
- Any operation that would constitute a cross-tenant reassignment ⇒ **denial** (§6).

## 9. Implementation boundary — established vs deferred

**This designation establishes only: WHO owns tenant membership.**

**Deferred to G3-B and subsequent implementation authority:**

- exact storage implementation and the membership store module;
- migration/checksum implementation for the durable store;
- any API route binding;
- any UI;
- Reports wiring;
- NP-04 schema changes;
- production deployment;
- Keycloak changes.

## 10. Implementation authority status

**NO IMPLEMENTATION AUTHORITY IS GRANTED BY THIS RECORD.**

`G3-B` — Implementation Authority Determination — remains the next gate and is **not** resolved
here. With G3-DEP-1, G3-DEP-2 and G3-DEP-3 now determined, G3-B may evaluate its preconditions.

## 11. NP-06 consequence

**P1.1 = NOT SATISFIED.** No `TenantDirectory` is implemented, wired, or verified. This record
designates an owner only. It authorizes no Reports work and changes no NP-06 status.
