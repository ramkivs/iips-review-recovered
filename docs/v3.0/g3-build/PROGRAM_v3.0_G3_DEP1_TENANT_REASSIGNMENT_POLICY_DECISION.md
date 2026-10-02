# IIPS v3.0 — G3-DEP-1 Program Authority Decision: Tenant Reassignment Policy

## Program Authority Decision Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G3-DEP-1 — Tenant Reassignment Policy Determination

**Document type:** PROGRAM AUTHORITY DECISION RECORD — resolves the deferred tenant-reassignment
question and fixes the semantic boundary between membership mutation and cross-tenant reassignment.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Branch:** `arena/01a0f1b3-iips-review-recovered`

**IRR baseline at decision:** `ramkivs/iips-review-recovered`
`arena/01a0f1b3-iips-review-recovered@0caee9c597d66a95234dd5470ce0915a82b34a71`
(tree `c7a7187acdf0e64e20e3d5eb42e0e4c8ff10d999`)

**Governance inputs — verified against authoritative remote state before recording (not relied on
from prior Arena output):**

| Record | Blob | Verified |
|---|---|---|
| `PROGRAM_v3.0_G3_PRODUCT_TENANT_REGISTRY_AUTHORITY.md` | `844eca8a2435bd2352b2688a81690e22535c7e00` | ✅ worktree == remote |
| `PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_GOVERNANCE_DECISION.md` | `37c852206126f9770876fa6a81c935760cb38c84` | ✅ worktree == remote |
| `PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_SUBSTRATE_TECHNICAL_AUTHORITY.md` | `a88dc7439540…` | ✅ worktree == remote |
| `PROGRAM_v3.0_G3_DEP3_MUTATION_AUTHORITY_AMENDMENT_DECISION.md` | `0465f018119b0831680a3e1a890813fcaeca9291` | ✅ worktree == remote |
| `docs/v3.0/phase12/mutation-authority-map.md` (amended) | `4ba6c3738797090cc04723a9045d05527fe5fdff` | ✅ worktree == remote |

**G3-DEP-3 remains durably closed** at decision time: 1 READ ONLY + 2 BOUNDED authorized
capabilities, with reassignment recorded `DEFERRED — G3-DEP-1`. A search of all authoritative refs
for an act authorizing reassignment returned nothing. **No material divergence; no stop condition.**

---

> **This record is a governance decision only. It grants NO implementation authority.** It does not
> implement, wire, verify, or certify `TenantDirectory`, does not designate the implementing
> service, and does not satisfy NP-06 **P1.1**.

## 1. Prior finding (from the completed read-only investigation)

The G3-DEP-1 read-only investigation established, from authoritative IRR state:

1. **No authoritative tenant-reassignment policy existed.** A search of all refs for decisions on
   user movement between tenants, cross-tenant ownership transfer, tenant migration, or
   revoke+assign semantics returned only G3 deferral markers and unrelated records.
2. **`revoke + assign` constitutes a semantic tenant reassignment** when it moves a principal from
   tenant A to tenant B. Decomposition into two authorized primitives does not remove the
   cross-tenant consequence.
3. **Existing tenant-bound governed resources remain bound to their original tenant**, and that
   ownership is immutable.
4. **Existing governance defines no** transfer, orphaning, re-homing, recovery, rollback, or
   cross-tenant movement semantics.
5. Reassignment therefore **cannot be inferred** from the separately authorized assignment and
   revocation primitives.

## 2. D1 — Is tenant reassignment permitted?

### Decision: **NOT AUTHORIZED AT THIS TIME.**

Tenant reassignment is **not** a permitted consequence of independently authorized membership
revoke and membership assign operations. A user/principal must **not** be moved from tenant A to
tenant B through composition of those two primitives.

This decision does **not** prohibit:

- ordinary assignment of a **previously unassigned** principal; nor
- ordinary revocation of an existing membership.

It specifically prohibits treating:

```text
revoke(A) + assign(B)
```

as an implicitly authorized reassignment.

## 3. D2 — Fate of existing tenant-owned resources

For a principal associated with tenant A, resources owned under tenant A **remain bound to tenant
A**.

**No automatic transfer, re-homing, or cross-tenant migration is authorized.** Therefore:

- tenant identity does **not** migrate existing tenant-owned resources;
- resource ownership is **not** rewritten as a side effect of any membership change;
- **no** cross-tenant data movement is authorized;
- **no** silent orphaning and **no** automatic reassignment is authorized.

Existing immutable ownership semantics remain unchanged.

## 4. D3 — Audit-history treatment

Existing audit history remains **historically attributable to the tenant under which the event
occurred**.

- Historical `tenantId` values are **not** rewritten.
- Audit records are **not** retroactively transferred between tenants.
- Any future separately authorized reassignment mechanism would require **additive** audit
  semantics rather than mutation of historical audit records.

**No implementation** of those future semantics is authorized by this decision.

## 5. D4 — Incorrect assignment / correction path

Two distinct cases are recognized, and **neither has an implementation path today**:

1. **ordinary business reassignment**; and
2. **correction of an erroneous membership assignment**.

An incorrectly assigned principal **must not** be repaired by silently composing revoke + assign
across tenants. A future correction mechanism requires explicit governed semantics and
authorization.

Corrective intent does **not** automatically authorize the corrective operation.

## 6. D5 — Revoke + assign composition

> **Revoke + assign across different tenants is a tenant reassignment and is NOT authorized by the
> individual revoke and assign authorities.**

The G3-DEP-3 authorization for membership **assignment** and membership **revocation** remains
**intact** for their independently governed semantics. It does **not** constitute authority for
cross-tenant reassignment.

**No implementation may interpret the two primitives as a permitted reassignment workflow.**

## 7. D6 — Risk classification

Tenant reassignment is classified as:

### **DESTRUCTIVE / HIGH-RISK GOVERNED OPERATION**

Basis, each grounded in authoritative state:

- it changes the principal's tenant boundary;
- it can immediately alter access to existing tenant-owned resources
  (`EnterpriseRuntime.isTenantResource`, `iips-platform/src/distributed/EnterpriseRuntime.ts`);
- existing resource ownership is **immutable** (`GovernedData.tenantId` readonly; governed
  artifact ownership immutable and append-only);
- it can create cross-tenant data and audit consequences;
- current governance defines **no** safe transfer or recovery mechanism.

**This classification authorizes no implementation.**

## 8. Policy boundary

This decision is intentionally narrow. It governs:

- movement of a principal between tenants;
- the semantic distinction between membership mutation and reassignment;
- treatment of existing tenant-owned resources;
- historical audit treatment;
- correction semantics;
- authorization boundaries around reassignment.

It does **NOT** govern, and these existing exclusions remain unchanged:

user creation · user disablement · tenant creation · tenant deletion · tenant quota · role
assignment · permission policy · Keycloak lifecycle · `companyId` · `runtimeCompanyId` · general
user administration.

## 9. Consequence for the future G3 implementation

The future `TenantDirectory` implementation must enforce:

**Allowed** — independent governed membership operations: **lookup**, **assignment**,
**revocation**.

**Not allowed** — implicit cross-tenant reassignment through:

```text
revoke(oldTenant) + assign(newTenant)
```

The service must **fail closed** if an operation would constitute a cross-tenant reassignment.

**No such guard is implemented or authorized by this record.** The guard belongs to the later
implementation-authority path, after G3-DEP-2 and G3-B are resolved.

## 10. Future reassignment

This decision does **not** permanently prohibit all future reassignment.

A future Program Authority decision may establish an explicit reassignment capability **only if** it
defines, at minimum:

- authorization;
- audit semantics;
- resource ownership treatment;
- cross-tenant data-movement rules;
- correction/recovery semantics;
- rollback/failure behavior;
- exact risk classification;
- certification requirements.

**Until such a decision exists, tenant reassignment remains prohibited.**

## 11. Implementation authority status

**NO IMPLEMENTATION AUTHORITY IS GRANTED BY THIS RECORD.**

`G3-B` implementation authority remains **WITHHELD**. **G3-DEP-2 — implementing service
designation** may now proceed, but only for a service consistent with this policy, including the
fail-closed guard described in §9.

## 12. NP-06 consequence

**P1.1 = NOT SATISFIED.** No `TenantDirectory` is implemented, wired, or verified. This decision
resolves a governance dependency only. It authorizes no Reports work and changes no NP-06 status.
