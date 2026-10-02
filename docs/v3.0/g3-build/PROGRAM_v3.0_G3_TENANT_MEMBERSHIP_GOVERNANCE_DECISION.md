# IIPS v3.0 — Program Authority Decision: Tenant Membership Governance

## Governance Decision Record (Membership Ownership and Population Authority)

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G3-B-DEP — Tenant Membership Ownership and Population Authority

**Document type:** GOVERNANCE DECISION RECORD — establishes ownership, population authority, and
the minimum governed contract for product-tier tenant membership.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Branch:** `arena/01a0f1b3-iips-review-recovered` (durable record branch)

**IRR governance baseline:** `ramkivs/iips-review-recovered`
`main@5ad7812bbe11acfc66e0b0e50c041fddaa63c20f` (tree `c44960185e1d7be7b67a6e6198bec3346fb53dfc`)

**Prior record this resolves:** `docs/v3.0/g3-build/PROGRAM_v3.0_G3_PRODUCT_TENANT_REGISTRY_AUTHORITY.md`
(commit `ab1c5fb9260b3cc40b45741a0894e140d9d28d67`, tree
`a338ad8f50058c694b791e77f46600d513f7b2ef`, blob `844eca8a2435bd2352b2688a81690e22535c7e00`)
— §7 "Open dependency returned to governance", items (1)–(3).

**IPD reference baseline:** `ramkivs/iips-production-market-data`
`main@4d3e1cdca3a33da0ec3be8b336b17128108a502c` (tree `db853dc21d01162e69b0e1211dbea1cb5c5f72b1`)

---

> **This decision does not authorize implementation of TenantDirectory or selection of a
> concrete backing-store technology.**

---

## 0. Distinction of states (read this first)

This record establishes **only** the governance decision. The following states are recorded
explicitly and are **not** established here:

| State | Status in this record |
|---|---|
| **Governance decision** | ✅ **ESTABLISHED** — §§1–6 |
| Implementation authority | ❌ NOT GRANTED (§7) |
| Implementation | ❌ NOT PRESENT (§7) |
| Verification | ❌ NOT PERFORMED (§7) |
| Certification | ❌ NOT PERFORMED (§7) |
| Concrete backing-store technology | ❌ NOT SELECTED (§4) |

No code, configuration, schema, test, or runtime behavior is created, changed, or authorized by
this record. It is a governance artifact only.

## 1. Authority recheck (no equivalent prior act)

All authoritative IRR refs were searched (`main`, `arena/01a0f1b3-iips-review-recovered`,
`origin/main`, `origin/HEAD`, `origin/arena/01a0f1b3-iips-review-recovered`) for an existing act
granting tenant-membership ownership and population authority.

| Searched | Result |
|---|---|
| Records containing "tenant membership" | `docs/v3.0/phase12/contract-inspection.md` (blob `612d350b017acb9b1ee9dff291f98a8ab639fbb1`) and the G3-A act above. The first is a record of **absence** (`:109` — *"Tenant membership: ❌ no membership contract"*). The second **withheld** the authority and returned it here. Neither grants it. |
| Any act stating IIPS owns tenant membership | Only architectural **principle**, not an authority grant: `docs/v3.0/g3-build/keycloak-architecture.md:98` (blob `c05226c2bdc70cb2ad6aeed2bb243fb1b2be1a6a`) — *"IIPS owns application/tenant data."* No population authority, no contract, no service. |
| Any act designating an authorized server-side membership population service | **NONE FOUND** |
| Any prior backing-store decision for tenant membership | **NONE FOUND** |
| `NP-12-N4-IMPLEMENTATION-AUTHORITY-DECISION-RECORD.md` (matched on "population") | **False positive.** Concerns Screen Definition implementation; "population" is used in the statistical-reference sense and *"the existing G1–G5 population authority remains independently bounded to G1–G5"*. Unrelated to tenant membership. |

**Conclusion:** no equivalent authoritative act exists. This is a new, additive Program Authority
decision. It does not amend, supersede, or reinterpret any prior record, and it does not reopen
D115, NP-04, NP-06, R1–R5, C1–C4, IU-7, or IU-8.

## 2. Tenant membership ownership (DECIDED)

- The **IIPS application/platform owns tenant membership records.**
- **Keycloak remains the identity/authentication authority.** That authority is unchanged and is
  not modified by this decision.
- **Keycloak realm identity is NOT the authoritative source of IIPS application tenant
  membership.** This is consistent with, and gives governance force to, the existing architecture
  at `keycloak-architecture.md:81` — *"Realm identity ≠ IIPS application tenant"* — and `:98` —
  *"Keycloak owns identity persistence; IIPS owns application/tenant data. No Keycloak
  credentials/users in the IIPS app DB."*

## 3. Tenant membership population authority (DECIDED)

- Tenant membership **creation and mutation must be performed by an explicitly authorized IIPS
  server-side application authority/service.**
- **Client-side, URL-derived, localStorage-derived, or Keycloak-only tenant membership must not be
  treated as authoritative.**
- **The specific implementing service/component is NOT selected by this record.** Selection
  requires a separate, explicit technical authority.

This decision resolves the blocker recorded at §4 of the G3-A act: the platform previously had
*no* actor authorized to create tenant membership, because
`docs/v3.0/phase12/mutation-authority-map.md` (blob `2021ef1949529a652569953e8a48b3a762fcc35e`)
§19 (line 9) states *"if the governed platform does not support a mutation, DO NOT IMPLEMENT IT"*,
and lines 28 and 31 record **Create/disable/lookup user → UNAVAILABLE** and
**Create/edit/delete tenant → UNAVAILABLE**.

**This record authorizes the *category* of a server-side membership authority. It does not
authorize any implementation of it, and it does not itself lift the §19 constraints on unrelated
mutations** (user lifecycle, role assignment, tenant quota). Lifting or amending
`mutation-authority-map.md` remains a separate decision and is **not** performed here.

## 4. Tenant membership contract (DECIDED — minimum)

The minimum governed contract is:

```text
userId <-> tenantId
```

- The authoritative resolver must be capable of determining the **validated** tenant
  relationship **server-side**.
- The existing product `Principal` **remains unchanged**:

  ```ts
  { userId, tenantId, roles }
  ```

  (`iips-platform/src/distributed/EnterpriseRuntime.ts:15`, blob
  `7a4d69992bd41e88bc0d36af209c2a062ee423ce`)

- **`companyId` and `runtimeCompanyId` must NOT be added.** They are outside this decision.
- **The existing `Principal` contract must NOT be altered.**

The existing seam is unchanged: `TenantDirectory` remains an interface
(`frontend/server/secured-executor.ts:16`) requiring `tenantForUser(userId, candidateTenant)`.

## 5. Backing store (REQUIRED — TECHNOLOGY NOT SELECTED)

- Tenant membership **requires an IIPS-owned, server-side, durable backing store.**

**This decision does NOT select a concrete database or storage technology.**

- **Do not infer that NP-04's concrete implementation technology is thereby selected as the
  tenant-membership technology.** NP-04 (`src/persistence/`, Node `node:sqlite`) lives in **IPD**,
  is certified at tree `fb1d5c667f8bf76a2a0d4a3f23a0296df25f8edb`, and is a *governed persistence
  capability* — not an appointed tenant-membership substrate. Any relationship between the two
  would require a separate decision.
- **Substrate evidence search (performed):** no existing authoritative IIPS architecture specifies
  a tenant-membership substrate. `keycloak-architecture.md:54` forbids IIPS creating *"a
  credential database"*; `phase12.2-recommendation.md:90` states *"No new authorization policy,
  database, persistence layer, or second audit system."* Both are constraints, not selections.
  `docs/v3.0/g3-build/identity-boundary-architecture.md:105` (blob
  `ea3fcbd0ea4c31c7d815c7049b2c68676733e06e`) still lists the underlying question as open:
  *"How tenantId/roles are sourced + validated (IdP claims vs platform directory)."*

**Concrete technology selection therefore remains a subsequent technical decision**, to be taken
under its own authority, with the NP-04 relationship explicitly addressed.

## 6. Security and authority semantics (DECIDED)

Tenant resolution **must** be:

- **server-side** — never derived from client-supplied input;
- **authoritative** — sourced from the IIPS-owned registry per §§2–3;
- **fail-closed** — an unresolvable user→tenant relationship is a denial, never a fallback to a
  fixture or default;
- **independent of client-supplied tenant identity** — client, URL, and localStorage values are
  untrusted inputs.

**Ownership must derive from the server-resolved `Principal`.** Cross-tenant access is denied
(`AuthError(403)`, `frontend/server/secured-executor.ts:74`); an unresolved tenant is denied
(`AuthError(401)`, `frontend/server/secured-executor.ts:41`).

These semantics are unchanged from the G3-A act; they are restated here as part of the decided
governance and are not new.

## 7. Boundaries (NOT ESTABLISHED / NOT TOUCHED)

This record does **NOT**:

- ❌ authorize implementation of `TenantDirectory`, its composition-root wiring, or any new route;
- ❌ select or authorize a concrete backing-store technology;
- ❌ modify authentication code, the `Principal` contract, or `ReportingEngine`;
- ❌ modify NP-04 persistence, IPD, or any IRR↔IPD integration;
- ❌ grant production activation, production data, or production eligibility;
- ❌ certify `TenantDirectory` or satisfy NP-06 **P1.1**;
- ❌ create, reopen, or alter any NP-06 / Reports authority, gate, route, or resource gate;
- ❌ reopen D115 market-data identity governance, R1–R5, C1–C4, IU-7, or IU-8;
- ❌ amend `docs/v3.0/phase12/mutation-authority-map.md` or any prior record.

**Consequence for NP-06:** P1.1 **remains NOT SATISFIED** until an actual authoritative
`TenantDirectory` is implemented, wired, and verified. P1.2, P1.3, and P1.4 remain untouched.

## 8. Successor gate

G3-B remains open. The next separate execution step must, under its own authority:

1. determine the concrete backing-store technology for the IIPS-owned tenant membership store,
   explicitly addressing whether NP-04's substrate is or is not to be used;
2. designate the implementing IIPS server-side application authority/service (§3, deliberately
   unselected here);
3. grant implementation authority for `TenantDirectory` against that decision; and only then
4. implement, wire, verify, and certify.
