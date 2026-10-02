# IIPS v3.0 — G3-DEP-3 Program Authority Amendment Decision

## Program Authority Decision: Bounded Amendment to the Mutation Authority Map

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G3-DEP-3 — `mutation-authority-map.md` disposition (bounded amendment)

**Document type:** PROGRAM AUTHORITY DECISION RECORD — amends one governed governance artifact
narrowly, and records the decision authorizing that amendment.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Branch:** `arena/01a0f1b3-iips-review-recovered`

**IRR baseline at decision:** `ramkivs/iips-review-recovered`
`arena/01a0f1b3-iips-review-recovered@76064b09df9f1a383b777bc98ba3e51ea568172a`
(tree `4364dd5f77b891f13f634331aa2b2f6873f7fdfa`)

**Record branch tip before this decision:** `76064b09df9f1a383b777bc98ba3e51ea568172a`

**Artifact amended by this decision:**
`docs/v3.0/phase12/mutation-authority-map.md`
(blob before amendment `2021ef1949529a652569953e8a48b3a762fcc35e`)

**Governance inputs (verified against authoritative remote state before recording, not relied on
from prior Arena output):**

| Record | Blob | Verified |
|---|---|---|
| `docs/v3.0/phase12/mutation-authority-map.md` | `2021ef1949529a652569953e8a48b3a762fcc35e` | ✅ worktree == remote |
| `docs/v3.0/g3-build/PROGRAM_v3.0_G3_PRODUCT_TENANT_REGISTRY_AUTHORITY.md` | `844eca8a2435bd2352b2688a81690e22535c7e00` | ✅ worktree == remote |
| `docs/v3.0/g3-build/PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_GOVERNANCE_DECISION.md` | `37c852206126f9770876fa6a81c935760cb38c84` | ✅ worktree == remote |
| `docs/v3.0/g3-build/PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_SUBSTRATE_TECHNICAL_AUTHORITY.md` | `a88dc7439540…` | ✅ worktree == remote |

---

> **This record is a governance decision only. It grants NO implementation authority.** It does not
> implement, wire, verify, or certify `TenantDirectory`, and it does not satisfy NP-06 **P1.1**.

## 1. Authoritative §19 finding (re-verified)

`docs/v3.0/phase12/mutation-authority-map.md` line 9 states:

> Rule (§19): if the governed platform does **not** support a mutation, **DO NOT IMPLEMENT IT**.

Line 28 records **Create/disable/lookup user → UNAVAILABLE**. Line 31 records
**Create/edit/delete tenant → UNAVAILABLE**.

Re-verification at decision time:

- The blob is `2021ef1949529a652569953e8a48b3a762fcc35e`, **identical on all authoritative IRR
  refs** and **unchanged from the investigated baseline**. No divergence; no stop condition.
- The map has been **never amended**, **never superseded**, and **never scoped away**.
- A full search of all authoritative refs for an act that supersedes §19, amends §19, grants bounded
  tenant-membership mutation, or establishes a new mutation authority returned **no results**.

**Conclusion: §19 is live and authoritative. It requires a narrow amendment to permit the
approved bounded capability.**

## 2. Absence of superseding authority

| Candidate superseding act | Result |
|---|---|
| Any act superseding or amending §19 | **NONE FOUND** |
| Any act granting bounded tenant-membership mutation | **NONE FOUND** |
| Any alternative pre-existing governed-mutation vehicle | **NONE FOUND** — a "separately governed mutation path" would be a *new* mechanism, not an existing one, and would leave §19 nominally intact while routing around it |
| Any act explicitly preserving §19 | **NONE FOUND** |

## 3. Prior reservation in the G3 governance decision

The G3 tenant-membership governance decision (`37c852206126f9770876fa6a81c935760cb38c84`) neither
granted nor implied this amendment, and **expressly reserved it**:

- §3: *"Lifting or amending `mutation-authority-map.md` remains a **separate decision** and is
  **not** performed here."*
- §7 (explicit non-authority): *"❌ amend `docs/v3.0/phase12/mutation-authority-map.md` or any prior
  record."*

That reservation is what makes this a separate Program Authority gate. This decision discharges it.

## 4. Decision — APPROVED: three capability entries

The IIPS-owned **product-tier tenant-membership capability** defined by the G3 governance records
may perform the following three operations:

| # | Capability | Classification | Conditions |
|---|---|---|---|
| 1 | **Tenant membership lookup** | **READ ONLY** | Server-side only; required for `resolveTenant`; fail-closed on unresolvable membership |
| 2 | **Tenant membership assignment** | **HIGH — bounded mutation** | Server-side only; authenticated principal validation; tenant validation; governed authorization; governed audit; fail-closed behavior |
| 3 | **Tenant membership revocation** | **HIGH — bounded mutation** | Server-side only; authenticated principal validation; tenant validation; governed authorization; governed audit; fail-closed behavior |

**This decision changes exactly THREE capability entries.** All other entries in the mutation
authority map remain unchanged and are not restated, reinterpreted, or restructured by this record.

## 5. Explicitly NOT approved

The amendment must **not** authorize, and this record does **not** authorize:

- ❌ user creation
- ❌ user disablement
- ❌ general user mutation
- ❌ tenant creation
- ❌ tenant deletion
- ❌ tenant quota mutation
- ❌ role assignment / role removal
- ❌ permission-policy mutation
- ❌ Keycloak user lifecycle mutation
- ❌ client-side authority
- ❌ client-supplied tenant authority
- ❌ `companyId`
- ❌ `runtimeCompanyId`
- ❌ tenant reassignment

**Tenant reassignment remains DEFERRED — G3-DEP-1.** It is not resolved, not implemented, and not
implied by this decision.

## 6. Correction of a prior-arena-output inconsistency

The read-only G3-DEP-3 investigation report stated:

> *"Net effect: exactly 2 rows change, 1 read-only + 2 bounded mutations."*

**That statement is arithmetically wrong and is corrected here.** The approved change is **THREE
capability entries**: one READ ONLY (tenant membership lookup) plus **two** bounded mutations
(assignment, revocation). The error is recorded rather than silently preserved, and the applied
amendment reflects the corrected count of three.

## 7. Authority conditions (binding on the approved capability)

The three approved capabilities are authorized **only** subject to all of the following:

1. **Server-side-only execution.** Never the React bundle, never a client request path.
2. **`EnterpriseRuntime` / `ApiSecurity` authorization chain.** No parallel authorization
   primitives (`keycloak-architecture.md:58`).
3. **Authenticated principal validation.** Via the existing `SecuredExecutor` boundary.
4. **Tenant validation.** Cross-tenant access denied (403).
5. **Governed audit.** Allow and deny both audited, per `mutation-authority-map.md:47`.
6. **Fail-closed lookup.** An unresolvable membership is a denial, never a fallback to
   `ADMIN_DIRECTORY` or any default.
7. **Durable server-side membership state.** The substrate selected by the G3 technical decision
   (`76064b09…` §4.2).
8. **The bounded membership contract** already established by G3: `userId <-> tenantId`,
   `Principal { userId, tenantId, roles }` unchanged, no `companyId` / `runtimeCompanyId`.
9. **Certification tests** already specified by the existing governance record at
   `mutation-authority-map.md` lines 55–61.

No additional identity field is invented. Keycloak remains the identity/authentication authority
and is **not** the IIPS tenant-membership authority.

## 8. Amendment scope and boundary

The applied amendment is the **smallest possible change** to `docs/v3.0/phase12/mutation-authority-map.md`:

- One new narrowly-scoped subsection is added recording the three approved capability entries and
  their conditions.
- All pre-existing entries are preserved **verbatim**.
- The existing §19 rule text is preserved **verbatim**.
- No entry is removed, reworded, reordered, or restructured.
- No new mutation-authority framework is created.
- No parallel mutation path is created.
- The existing authority model is not broadened.
- The amendment states explicitly that the authority applies **only** to the IIPS-owned
  product-tier tenant-membership capability defined by the G3 governance records.

## 9. Implementation authority status

**NO IMPLEMENTATION AUTHORITY IS GRANTED BY THIS RECORD.**

`G3-B` implementation authority remains **WITHHELD**. The remaining dependencies are unchanged:

- **G3-DEP-1** — tenant reassignment policy determination (**DEFERRED**, next in order).
- **G3-DEP-2** — implementing service designation.

## 10. NP-06 consequence

**P1.1 = NOT SATISFIED.** No `TenantDirectory` is implemented, wired, or verified. This decision
resolves a governance dependency only. It authorizes no Reports work and changes no NP-06 status.
