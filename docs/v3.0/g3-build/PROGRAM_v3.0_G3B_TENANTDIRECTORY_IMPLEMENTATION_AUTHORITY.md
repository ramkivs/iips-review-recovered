# IIPS v3.0 — G3-B TenantDirectory Implementation Authority Determination

## Implementation Authority Decision Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G3-B — IIPS TenantDirectory bounded implementation authority

**Document type:** IMPLEMENTATION AUTHORITY DETERMINATION — evaluates prerequisites C1–C8
against authoritative state and records the bounded authority disposition.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Authoritative repository:** `ramkivs/iips-review-recovered`
**Authoritative remote:** `https://github.com/ramkivs/iips-review-recovered.git`
**Authoritative ref:** `refs/heads/arena/01a0f1b3-iips-review-recovered`

**IRR baseline at determination:**
`61e55a425e7a9ffc13653edd8216ea223b6ca804` (tree `e2af578cfa5f7281e07eef72188f03277ac5db05`)

**Prerequisite records — all verified byte-identical to the authoritative remote before recording:**

| Record | Blob |
|---|---|
| `PROGRAM_v3.0_G3_PRODUCT_TENANT_REGISTRY_AUTHORITY.md` | `844eca8a2435bd2352b2688a81690e22535c7e00` |
| `PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_GOVERNANCE_DECISION.md` | `37c852206126f9770876fa6a81c935760cb38c84` |
| `PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_SUBSTRATE_TECHNICAL_AUTHORITY.md` | `a88dc74395406c2d15ec08c6cbe1d15f0cb5167f` |
| `PROGRAM_v3.0_G3_DEP3_MUTATION_AUTHORITY_AMENDMENT_DECISION.md` | `0465f018119b0831680a3e1a890813fcaeca9291` |
| `PROGRAM_v3.0_G3_DEP1_TENANT_REASSIGNMENT_POLICY_DECISION.md` | `c9df1c58631ff64cddafad18f82a4f82354762f9` |
| `PROGRAM_v3.0_G3_DEP2_IMPLEMENTING_SERVICE_DESIGNATION.md` | `dda4462584ac40210e34cc5e9ce6e91727ca3fdc` |
| `docs/v3.0/phase12/mutation-authority-map.md` | `4ba6c3738797090cc04723a9045d05527fe5fdff` |

**Sandbox-reset reconciliation:** the local checkout had been rolled back to `19b42e71` by a
sandbox reset. Every affected artifact was proven **byte-identical to the authoritative remote**
before the restore, so the divergence was fully explained and no authoritative state was lost. No
record superseding any prerequisite was found.

---

> **No production authority is granted by this record.** Production deployment, Keycloak changes,
> and production credentials remain out of scope.

## 1. Authority types distinguished

| Authority type | Status after this record |
|---|---|
| **Architecture / designation** | ✅ ESTABLISHED (G3 registry authority; G3-DEP-2) |
| **Implementation** | ✅ **GRANTED — BOUNDED** (§4) |
| **Qualification / certification** | ❌ **NOT GRANTED** — remains a separate later gate (§6) |

## 2. Prerequisite matrix C1–C8

| # | Prerequisite | Result | Evidence |
|---|---|---|---|
| **C1** | Technology | ✅ **SATISFIED** | Filesystem-backed durable store selected (`a88dc743…` §4.2). Compatible with IRR's documented Node v20 LTS baseline — `node:fs` is already used by 39 IRR files. `node:sqlite` was rejected (unavailable on v20, experimental above). NP-04 **not** substituted. No new technology selected. |
| **C2** | Jurisdiction / ownership | ✅ **SATISFIED** | IIPS owns tenant membership (`37c85220` §2). Keycloak remains identity authority. Designated service is `SecuredExecutor` (`dda44625` §1). No `companyId`, no `runtimeCompanyId`. |
| **C3** | Membership contract | ✅ **SATISFIED** | Unique-by-`userId`, server-side lookup/assignment/revocation, tenant validation, fail-closed lookup, durable state, restart durability, integrity, governed audit (`a88dc743…` §6). G3-DEP-1 authoritative: cross-tenant reassignment **NOT** authorized; `revoke(old)+assign(new)` is not an authorized workflow; implementation must fail closed. |
| **C4** | Mutation authority | ✅ **SATISFIED** | G3-DEP-3 (`0465f018`) authoritative and unchanged: lookup READ ONLY, assignment BOUNDED, revocation BOUNDED; all unrelated mutations remain prohibited; reassignment prohibited. Not broadened. |
| **C5** | Service designation | ✅ **SATISFIED** | `SecuredExecutor` designated (`dda44625`). The `TenantDirectory` constructor dependency at `frontend/server/secured-executor.ts:26` is the intended seam, already invoked at `:41`. No parallel authorization primitive. |
| **C6** | Security / authorization | ⚠️ **SATISFIED WITH A MANDATORY IMPLEMENTATION CONSTRAINT** | See §3 — a real gap was found in the existing chain and is made a binding requirement of this grant. |
| **C7** | Persistence / durability | ✅ **SATISFIED** | Substrate can satisfy restart durability, atomic mutation, fail-closed corruption handling, deterministic lookup, assignment, revocation. NP-04 untouched and not reused. |
| **C8** | Lifecycle semantics | ✅ **SATISFIED** | Defined for initial assignment, lookup, revocation, duplicate assignment, missing membership, invalid tenant/principal, corrupted state, restart, recovery, and attempted cross-tenant reassignment. Reassignment behaviour **not invented**; it must fail closed. |

**All eight prerequisites are satisfied.** C6 carries a binding implementation constraint, recorded
in §3 and §4.

## 3. C6 security finding — mandatory implementation constraint

Verification of the existing chain found that the security posture is sound **for reads** but
carries a specific structural property that implementation MUST respect:

- `authenticate()` (`secured-executor.ts:35–42`) fails closed with `AuthError(401,
  'no-valid-tenant')` when membership cannot be resolved.
- `authorizeMutation()` (`:73–80`) **takes the `Principal` as a caller-supplied parameter**. It
  validates `principal.tenantId` against the **resource's** tenant, but it does **not** re-validate
  that the principal's tenant was itself resolved from the authoritative registry.
- The only production caller today (`frontend/server/admin-transport.ts:408–409`) obtains `p` from
  `await executor.authenticate(token)` before calling `authorizeMutation`, so the 401 gate is
  respected **by convention at that call site**, not by the method itself.

**Consequence:** a membership-mutation entry point that accepted a `Principal` from any source
other than a preceding `authenticate()` would bypass the fail-closed 401 gate.

**Mandatory constraint (binding on the implementation):** the membership mutation surface MUST
accept only a `Principal` produced by `SecuredExecutor.authenticate()` in the same request, and
MUST NOT accept a caller-constructed `Principal`. Membership mutation is therefore authorized on
the **read/authentication** path (where the principal is genuinely resolved) and, for any separate
administrative mutation path, must re-validate membership server-side before authorizing.

## 4. IMPLEMENTATION AUTHORITY DECISION

# **GRANT BOUNDED IMPLEMENTATION AUTHORITY**

for the `TenantDirectory` capability only, in IRR only.

### 4.1 Authorized

- Implementation of the IIPS-owned `TenantDirectory` satisfying
  `tenantForUser(userId, candidateTenant)` (`secured-executor.ts:16`).
- Integration through the designated `SecuredExecutor` seam (constructor dependency at `:26`).
- Durable server-side tenant-membership storage per the selected filesystem substrate
  (atomic write, checksummed, integrity-checked, fail-closed on corruption).
- **Lookup** (read-only), **assignment**, and **revocation** — server-side only.
- Required server-side validation: unique membership by `userId`, tenant validation,
  duplicate-assignment handling, invalid-input rejection.
- Required governed audit on **both allow and deny** for every mutation.
- Required fail-closed enforcement, including the §3 constraint and the §4.2 reassignment guard.
- Tests proving the governed contract and the certification tests already specified in
  `mutation-authority-map.md` "Required future certification tests".

### 4.2 Mandatory fail-closed requirements

1. Unresolvable membership ⇒ `401`. Never a default tenant, never a fallback to `ADMIN_DIRECTORY`
   outside explicit test mode.
2. Missing, unreadable, or corrupted membership state ⇒ **denial**, never a partial or open state.
3. **Any operation constituting a cross-tenant reassignment ⇒ denial**, per G3-DEP-1. The
   implementation must explicitly detect and refuse a membership transition that would move a
   principal from one tenant to another, and MUST NOT permit `revoke(A) + assign(B)` to be
   composed into a reassignment. Reassignment remains **DESTRUCTIVE / HIGH-RISK / NOT AUTHORIZED**.
4. The §3 constraint: mutation entry points accept only an `authenticate()`-produced `Principal`.

### 4.3 Not authorized

❌ Reports implementation · ❌ `/api/reports/*` or any new route · ❌ NP-04 modification ·
❌ production deployment, credentials, or eligibility · ❌ Keycloak changes ·
❌ tenant creation / deletion · ❌ user lifecycle · ❌ role management · ❌ quota mutation ·
❌ permission-policy mutation · ❌ `companyId` / `runtimeCompanyId` ·
❌ cross-tenant reassignment · ❌ unrelated authorization redesign ·
❌ any new parallel authorization primitive · ❌ modification of `ReportingEngine` ·
❌ reopening D115, IU-7, IU-8, R1–R5, C1–C4.

### 4.4 Architectural boundary

New membership code is confined to the IRR server-side tier (`frontend/server/`) and must not
modify the frozen `iips-platform` sector engines, `ReportingEngine`, or NP-04. The
`SecuredExecutor` integration is additive through the existing `TenantDirectory` seam; the
interface signature is not changed.

## 5. Validation and durability requirements for the implementation

The implementing execution must: run the full IRR regression suite; demonstrate the certification
tests (admin authorized; analyst/viewer 403; cross-tenant 403; unauthenticated 401; fail-closed on
corruption and on attempted reassignment); commit and push to
`refs/heads/arena/01a0f1b3-iips-review-recovered`; and independently verify `LOCAL == REMOTE` with a
clean worktree. **The universal artifact durability invariant applies to every governance and
implementation artifact produced.**

## 6. Certification / qualification boundary

**Qualification and certification authority is NOT granted by this record.** After implementation,
a separate gate must verify and certify the TenantDirectory against the governed contract before
NP-06 **P1.1** may be re-evaluated. P1.1 is **not** satisfied by implementation alone.

## 7. NP-06 consequence

**P1.1 = NOT SATISFIED.** No `TenantDirectory` is implemented as of this record. This grant
authorizes the bounded implementation; it does not satisfy P1.1, which additionally requires
wiring and verification through the certification gate.
