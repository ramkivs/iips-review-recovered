# IIPS v3.0 — G3 Product-Tier Tenant Registry Authority

## Bounded Authority Act

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G3 — Product-Tier Tenant Registry (tenant resolution authority)

**Document type:** BOUNDED AUTHORITY ACT — establishes the authoritative source of truth for
product-tier tenant resolution. Not a certification, not a release, not a production
authorization, and **not an implementation authorization** (see §6).

**Version:** 1.0 — Act

**Date:** 2026-10-02

**Branch:** `arena/01a0f1b3-iips-review-recovered`

**IRR baseline:** `ramkivs/iips-review-recovered`
`main@06775f44d432f6df95a2f47bb78ef381352cf575`
(tree `8786bc9a061b0e16d408a73dfb8230ce77e6a3fa`)

**Act branch tip at authoring:** `3807184c5d180f5842db67d04d96d15b967d0b23`
(tree `430c7d461875fb72e7578f1caa578b0f15940d63`)

> This act answers a dependency question only. It resolves no NP-06 question, authorizes no
> Reports work, and grants no backing-store, provisioning, or production authority.

---

## 1. Finding that triggered this act

NP-06 re-entry requires **P1.1** — a production-capable `TenantDirectory` for the product-tier
authentication/authorization path. IRR contains the seam but no authoritative resolver:

- `frontend/server/secured-executor.ts:16` declares `TenantDirectory` as an **interface only**.
  No implementation, no data source, no persistence binding exists.
- The `directory` parameter at `frontend/server/secured-executor.ts:26` is caller-supplied, so the
  entire tenant authority at runtime is whatever the composition root passes in.

A prior read-only reconciliation (all IRR and IPD refs) found **no** `TenantDirectory`
implementation on any branch in either repository other than hardcoded literals.

## 2. Prior authority re-check (no duplicate created)

Existing G3/D115/identity records were searched across **all** IRR refs and all IPD refs. The
following were inspected and found **not** to grant this capability:

| Record | Blob | Why it does not grant it |
|---|---|---|
| `docs/v3.0/g3-build/PROGRAM_v3.0_G3_CERTIFICATION.md` | — | Certifies the **adapter + enforcement** (Keycloak/OIDC + `SecuredExecutor`) at unit/contract level. Status line: *"ADAPTER + ENFORCEMENT CERTIFIED (unit/contract level); LIVE gate NOT yet passed"*. No tenant registry. |
| `docs/v3.0/g3-build/PROGRAM_v3.0_G3_LIVE_CERTIFICATION.md` | — | *"G3 LIVE — APPROVED (maintainer)"* against a **local** Keycloak using deterministic test market data. Certifies the path, not a tenant source of truth. |
| `docs/v3.0/g3-build/principal-tenant-mapping.md` | `9169953be889f048b09ebe8f51ee58c41a1ebbfd` | Defines the mapping and states the `TenantDirectory` seam, but confers no implementation authority. See §7 — its implementation claim is not supported by code. |
| `docs/v3.0/g3-build/AUTHENTICATION_AUTHORITY_HARD_STOP.md` | — | *"STOPPED — authentication authority is undefined."* Superseded same-day by the Keycloak selection in the certification record. No tenant authority. |
| `docs/v3.0/phase12/contract-inspection.md` | `612d350b017acb9b1ee9dff291f98a8ab639fbb1` | Records the **absence** of a tenant contract (§4). |
| `docs/D115_AUTHORITY_ACT.md` (IPD `arena/01a0c86d`) | — | D115 **identity** authority only; §4 expressly excludes production activation and states the act *"does not itself populate or certify the principal, runtime custodian, `companyId`, mapping…"*. |

**D115 is not a prerequisite for this act.** D115 governs market-data issuer/security/company
identity. Its own records remain `runtimeCompanyId` UNRESOLVED, `implementationAuthority`
WITHHELD, `productionEligible` false. Nothing in this act depends on D115.

**Conclusion:** no existing act grants product-tier tenant-registry authority. This act is
therefore created as the minimum required record.

## 3. Authority established

The following is established as authoritative product-tier policy:

1. **The product-tier tenant registry is the authoritative source of truth** for tenant
   resolution. `tenantId` is resolved from it and from nothing else.
2. **Scope is limited to product-tier authentication and authorization.** This act confers no
   engine, sector, reporting, market-data, or UI authority.
3. **The `Principal` contract is unchanged:** `{ userId, tenantId, roles }`, per
   `iips-platform/src/distributed/EnterpriseRuntime.ts:15`. This act introduces no new identity
   field and does not alter the Principal shape.
4. **`tenantId` is server-derived.** It originates from the platform-validated resolution step in
   `SecuredExecutor.authenticate` (`frontend/server/secured-executor.ts:41`).
5. **Client, URL, and localStorage tenant identity are never trusted.** Candidate tenant values
   are untrusted inputs until validated, per `principal-tenant-mapping.md` §2.
6. **Fail-closed behavior is mandatory.** If the user→tenant relationship cannot be resolved from
   the authoritative registry, resolution fails closed (`AuthError(401)` at
   `secured-executor.ts:41`). Absence of the registry is failure, not fallback.
7. **Ownership resolution uses the server-resolved `Principal`.** Cross-tenant access is denied
   (`AuthError(403)`, `secured-executor.ts:74`).
8. **`companyId` / `runtimeCompanyId` are NOT introduced.** They are outside this act and outside
   the product-tier identity boundary.

## 4. Why implementation is NOT authorized by this act

The authoritative backing store for tenant membership **does not exist and is not selected**. The
existing records actively exclude every candidate, so selecting one here would be invention:

| Candidate backing source | Why it is excluded |
|---|---|
| Keycloak (IdP claims/admin API) | `keycloak-architecture.md:81` — *"**Realm identity ≠ IIPS application tenant.** IIPS tenant remains governed by the platform."* `keycloak-architecture.md:98` — *"Keycloak owns identity persistence; IIPS owns application/tenant data. No Keycloak credentials/users in the IIPS app DB."* `keycloak-configuration.md:16` — realm identity is *"not an IIPS application tenant."* |
| IPD (incl. the NP-04 governed persistence substrate) | Out of scope. IPD modification and IRR↔IPD integration are excluded from this workstream, and NP-04 is certified/frozen at tree `fb1d5c66…`. |
| A hardcoded map in IRR | This is `ADMIN_DIRECTORY` (`frontend/server/admin-transport.ts:214`) — the fixture this capability exists to replace. |
| A new IRR persistence substrate | No such substrate exists in IRR. IRR has no store, registry, or database layer. |

Two further authoritative constraints independently block a read-only resolver over a new store:

- **`docs/v3.0/phase12/contract-inspection.md:104,109`** — *"Tenant discovery: ❌ no tenant
  directory query in platform"*; *"Tenant membership: ❌ no membership contract."*
- **`docs/v3.0/phase12/mutation-authority-map.md:9`** — *"Rule (§19): if the governed platform
  does not support a mutation, **DO NOT IMPLEMENT IT**."* Lines 28 and 31 record
  **Create/disable/lookup user → UNAVAILABLE** and **Create/edit/delete tenant → UNAVAILABLE**.

A directory over a store that **no authorized actor may populate** is an empty registry, not an
authoritative source of truth. The missing authority is therefore not a technology choice — it is
**the authority to establish and populate product-tier tenant membership**.

`docs/v3.0/g3-build/identity-boundary-architecture.md` §3 still lists the underlying question as
open: *"How tenantId/roles are sourced + validated (IdP claims vs platform directory)."*

## 5. Authority NOT granted by this act

- ❌ Backing-store or persistence-technology selection
- ❌ Tenant membership creation, lifecycle, or provisioning authority (§19 / mutation map)
- ❌ User create/disable/lookup authority (§19 / mutation map)
- ❌ Implementation of `TenantDirectory`, its composition-root wiring, or any new route
- ❌ Production activation, production data, or production eligibility
- ❌ Any NP-06 / Reports authority, gate, route, or resource gate
- ❌ Any IPD or IRR↔IPD integration change
- ❌ Any change to `ReportingEngine`, NP-04 persistence, or R1–R5 / C1–C4 / IU-7 / IU-8

## 6. Status

**G3 tenant-registry authority: ESTABLISHED (policy/contract).**
**G3 tenant-registry implementation authority: WITHHELD — pending the §7 dependency.**

## 7. Open dependency returned to governance

**Required decision (Program Authority):** designate the authoritative source and the authorized
population path for product-tier tenant membership. Specifically:

1. Which component owns tenant membership records, given that Keycloak is excluded (§4) and IIPS
   has no application store?
2. Which authority may create and populate those records, given that §19 currently records user
   lookup and tenant lifecycle as **UNAVAILABLE** and forbids implementing them?
3. Whether the backing store may be created in IRR, and under which technology decision.

Until (1)–(3) are decided, `G3-B` implementation must not begin. A resolver built over an
unauthorized or unpopulated store would be a fixture with a production name.

## 8. Finding reported, not acted upon

`docs/v3.0/g3-build/principal-tenant-mapping.md` (§4, and its closing Status line
*"PRINCIPAL & TENANT MAPPING — IMPLEMENTED + TESTED"*) describes
`PrincipalResolver.resolve(identity)` as implemented. Inspection shows
`frontend/src/core/auth/authContract.ts` declares `PrincipalResolver` as an **interface**, and
there are **zero** implementing classes in `frontend/` or `iips-platform/`.

This is an existing certified record; it is **not modified by this act** and the discrepancy is
recorded here for the G3 owner rather than silently corrected. Tenant resolution currently occurs
inline in `SecuredExecutor.authenticate`, not through a `PrincipalResolver` implementation.
