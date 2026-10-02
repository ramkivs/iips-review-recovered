# IIPS v3.0 — G3-Q TenantDirectory Qualification / Certification Verification

## Qualification Evidence Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G3-Q — TenantDirectory qualification verification

**Document type:** QUALIFICATION EVIDENCE RECORD — independent verification of the delivered
TenantDirectory against the governed contract, with disposition.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Authoritative repository:** `ramkivs/iips-review-recovered`
**Authoritative remote:** `https://github.com/ramkivs/iips-review-recovered.git`
**Authoritative ref:** `refs/heads/arena/01a0f1b3-iips-review-recovered`

**Verified implementation commit:** `dce48d9d979622a761d1a20d17b6aa0a1ac99303`
**Verified implementation tree:** `8a754ea02b28bb99ce03d0bf775bd50e90e7ecbb`

---

> ## FINAL DISPOSITION
>
> # TENANTDIRECTORY QUALIFICATION = **NOT SATISFIED**
>
> # CERTIFICATION = **NOT ESTABLISHED**
>
> A genuine, independently reproduced defect was found in the authoritative tenant-resolution
> path. Per the qualification gate's implementation-mutation rule, the implementation was **not**
> modified. The defect and its required remediation scope are recorded in §5.

---

## 1. Baseline reconciliation

The checkout had again been rolled back to `19b42e71` by a sandbox reset. **Before any mutation**,
all 13 relevant artifacts were hashed against the authoritative remote and proven **byte-identical**
(implementation blobs, G3-B, G3-DEP-1/2/3, the G3 registry/membership/substrate records, the
mutation map, and the two `docs/integration/` records). The divergence was therefore fully
explained and no authoritative state was lost; the checkout was then restored to
`dce48d9d979622a761d1a20d17b6aa0a1ac99303` by a non-merge operation.

**No later authoritative change supersedes the implementation basis** — the implementation commit
is the current authoritative tip.

Predecessor blobs re-verified on the authoritative remote:

| Record | Blob |
|---|---|
| `PROGRAM_v3.0_G3B_TENANTDIRECTORY_IMPLEMENTATION_AUTHORITY.md` | `8c1fa9e41f76f9a69997e3c67ecc934fb0d17d4a` |
| `PROGRAM_v3.0_G3_DEP1_TENANT_REASSIGNMENT_POLICY_DECISION.md` | `c9df1c58631ff64cddafad18f82a4f82354762f9` |
| `PROGRAM_v3.0_G3_DEP2_IMPLEMENTING_SERVICE_DESIGNATION.md` | `dda4462584ac40210e34cc5e9ce6e91727ca3fdc` |
| `PROGRAM_v3.0_G3_DEP3_MUTATION_AUTHORITY_AMENDMENT_DECISION.md` | `0465f018119b0831680a3e1a890813fcaeca9291` |
| `docs/v3.0/phase12/mutation-authority-map.md` | `4ba6c3738797090cc04723a9045d05527fe5fdff` |

## 2. Qualification evidence matrix

| # | Requirement | Verification | Result | Evidence |
|---|---|---|---|---|
| 1 | Authentication boundary (C6) | Mutation methods accept `credential: unknown`, never a `Principal`. A caller-fabricated `Principal` passed as a credential yields **401**. No `Principal`-typed overload exists. 3 credential-first signatures present. | **PASS** | `secured-executor.ts`; tests 10, 10b, 10c |
| 2 | Membership lookup | Capability-level behaviour is correct and fail-closed (valid resolution; absent/corrupt/unresolvable deny; untrusted claim cannot establish authority). **But** the authoritative live path resolves tenants from a hardcoded fixture — see §5. | **FAIL** | tests 1, 2, 3, 15, 15b; defect in §5 |
| 3 | Assignment | Valid assignment persists; duplicate refused rather than overwritten; invalid tenant denied; invalid principal denied before mutation; cross-tenant denied. | **PASS** | tests 4, 5, 7, 8, 9 |
| 4 | Revocation | Authorized revocation removes membership durably; revoked principal no longer resolves; unauthorized/missing membership denied; cross-tenant revocation denied. | **PASS** | tests 6, 6b, 9c |
| 5 | Reassignment denial | Two independent fail-closed layers: actor confined to its own authoritative tenant; store refuses to move an existing membership. `revoke(A)+assign(B)` cannot compose into reassignment. No recovery/correction behaviour invented. | **PASS** | tests 9, 9b, 9c |
| 6 | Persistence / restart | **Genuine cross-process restart** verified: process PID 1707 wrote the membership and exited; a separate OS process PID 1747 read it from disk. Not an in-process substitute. Atomic write (temp + rename) leaves prior committed state intact on refusal. | **PASS** | two-process run; test 12b |
| 7 | Integrity / corruption | SHA-256 checksum over canonical key-sorted JSON; tampering without recomputing the checksum raises `MembershipError`; a corrupt store yields a governed 401, not an unhandled exception. No silent fallback to fixture/default state at capability level. | **PASS** | tests 3, 12, 12b, 15b |
| 8 | Audit | Allow and deny paths produce governed audit records; prior audit entries are neither rewritten nor reordered (verified as an unchanged prefix). | **PASS** | tests 13, 14, 14b, 14c, 14d, 19 |
| 9 | Scope isolation | Zero executable forbidden authority: no imports from forbidden modules, zero `companyId`/`runtimeCompanyId` in executable position, no lifecycle calls, no new parallel authorization primitive, no new auth module. All forbidden-scope mentions are prohibition comments. | **PASS** | §4 below |
| 10 | Regression | 130 passed, 1 failed, 25 skipped. The single failure (`product-transport`) is **independently proven pre-existing** by comparison against the pre-implementation baseline `4b299f4`. | **PASS** | §3 below |
| 11 | **Authoritative path composition** | The live composition root does **not** inject the authoritative store, and silently falls back to the hardcoded `ADMIN_DIRECTORY` fixture, which fabricates tenant authority for five hardcoded identities. | **FAIL** | §5 |

## 3. Regression detail

**Exact command**

```
cd frontend
npx --yes vitest@5.0.3 run --config <node-env vitest config> .
```

**Result:** `Test Files 4 failed | 8 passed | 3 skipped (15)`
`Tests 1 failed | 130 passed | 25 skipped (156)`

**Known pre-existing failure — independently confirmed, not a regression:**

- `server/product-transport.test.ts` — "Product responses reject taxonomy-resolved categories while
  permitting all certified engines": `expected [ 'sector.banking', …(12) ] to include 'sector.telecom'`.
- Re-run against the **pre-implementation baseline `4b299f4`** in a throwaway worktree produced the
  **identical** failure. It is therefore pre-existing and unrelated.
- The test's import graph never reaches the TenantDirectory files.

**Environmental limitations (recorded, not converted into PASS):**

- Three suites fail to **load** because an external IPD package
  (`iips-production-market-data/pit`) is absent from this environment:
  `server/pit/pitRuntimeIntegration.test.ts`, `server/pit/pitD114RuntimeIntegration.test.ts`,
  `src/api/pit.test.ts`. IPD is out of scope for this program and these suites do not reach the
  TenantDirectory files.
- `node_modules` is absent and `npm install` is prohibited by standing instruction; vitest was
  supplied via `npx` into the npx cache, and the project's own `vite.config.ts` cannot load its
  React plugins, so an explicit Node-environment vitest configuration was used. **The full suite
  could not be run under the project's own configuration**, so full-suite qualification is not
  claimed.

## 4. Forbidden-scope verification

Executable-position scan of all three implementation artifacts:

| Check | Result |
|---|---|
| Imports from Reports / NP-04 / IPD modules | **0** |
| `companyId` / `runtimeCompanyId` in executable position | **0** |
| User/tenant lifecycle calls (`createUser`, `deleteTenant`, …) | **0** |
| Quota / role / permission-policy mutation | **0** |
| New parallel authorization primitive or auth module | **0** |
| Reports / NP-04 / IPD / production files modified | **0** |

All textual occurrences of `NP-04`, `IPD`, `companyId`, and `runtimeCompanyId` in the
implementation are **prohibition comments** explicitly recording that the capability is absent.

## 5. DEFECT — authoritative tenant resolution is not wired; fixture fallback remains

### 5.1 The defect

`FileTenantDirectory` — the authoritative IIPS membership store delivered by the implementation
gate — **is never constructed or injected at any composition root**. It is referenced only by its
own definition, one doc comment, and the implementation test file.

Every live composition path calls `createAdminExecutor` **without `deps.directory`**:

- `frontend/server/admin-transport.ts:257` — `createLiveAdminExecutor(...)` passes only
  `metadata`, `verifier`, and `resourceAccess`.
- `frontend/server/admin-transport.ts:239` — therefore resolves
  `deps.directory ?? ADMIN_DIRECTORY`.

`ADMIN_DIRECTORY` (`admin-transport.ts:214`) is a **hardcoded map of five identities**
(`admin-a`, `analyst-a`, `viewer-a`, `admin-b`, `analyst-b`). It is reachable through
`createLiveAdminExecutor`, which is the live wiring used by
`frontend/server/executive-transport.ts:562` and `frontend/server/ai-advisory-transport.ts:51` —
**not test mode**.

### 5.2 Independent reproduction

A temporary probe (created for verification, deleted before commit, never staged) composed the
executor exactly as the live path does — supplying **no** directory — with **no authoritative
membership store present on disk**, and observed:

```
>>> FIXTURE USER RESOLVED TO TENANT: {"userId":"admin-a","tenantId":"tenant-A","roles":["admin"]}
>>> admin-a -> tenant-A
>>> analyst-a -> tenant-A
>>> viewer-a -> tenant-A
>>> admin-b -> tenant-B
>>> analyst-b -> tenant-B
```

Five hardcoded identities receive tenant authority with no authoritative membership state in
existence.

### 5.3 Governing requirement violated

**G3-B §4.2, mandatory fail-closed requirement 1:**

> "Unresolvable membership ⇒ 401. Never a default tenant, never a fallback to `ADMIN_DIRECTORY`
> **outside explicit test mode**."

`createLiveAdminExecutor` is live wiring, not explicit test mode, and it silently falls back to
`ADMIN_DIRECTORY`. The requirement is violated.

Additionally, **G3-B §4.1** authorizes "integration through the designated `SecuredExecutor`
seam". That integration exists at the interface level but is not wired into the authoritative
resolution path, so the delivered capability is **not in force**. The implementation's own claim
(`tenant-membership-store.ts:5`, "replacing the hardcoded `ADMIN_DIRECTORY` fixture as the
production authority") is **not true of the delivered state**.

### 5.4 Blast radius — precisely bounded

- **Fabricated authority:** tenant **lookup/authentication** in the live path. This is a security
  boundary defect: five hardcoded identities obtain real tenant attribution.
- **Mutation fails closed:** calling `assignTenantMembership` on an executor wired to
  `ADMIN_DIRECTORY` yields `403 membership-mutation-unavailable`, because the fixture lacks the
  governed write surface. **Mutation and reassignment are not exposed through this path.**
- **Not affected:** the capability itself. All capability-level behaviours (C6 invariant, lookup,
  assignment, revocation, reassignment refusal, durability, integrity, audit) are correct **when
  the governed directory is actually injected**.

The defect is therefore one of **composition/wiring**, not of the capability's internal logic.

### 5.5 Required remediation scope (not performed in this gate)

A separate authorized mutation is required. Minimum scope:

1. Introduce an explicit authoritative composition for the TenantDirectory that injects a
   `FileTenantDirectory` (path sourced from configuration/environment) at every live composition
   root.
2. Remove or hard-gate the `ADMIN_DIRECTORY` fallback so it is reachable **only** under an
   explicit test-mode signal; an unconfigured live deployment must fail closed (401) rather than
   silently falling back to a fixture.
3. Add a composition-level test proving a live-wired executor resolves membership from durable
   state and denies when no authoritative store is configured.

This remediation must follow the appropriate authority/durability sequence. **No implementation
file was modified by this gate.**

## 6. Authority boundary statement

| Level | Status |
|---|---|
| Implementation verification | **PERFORMED** — capability-level behaviour verified; defect found at composition |
| **Qualification** | **NOT SATISFIED** |
| Certification | **NOT ESTABLISHED** |
| Release acceptance | **NOT ASSESSED** |

**Certification authority:** no certification authority has been established for this capability.
The program has established G3 governance, G3-DEP-1/2/3 decisions, the G3-B implementation
authority, and this G3-Q qualification record. **Certification is not conferred by any of these,
and this record does not invent it.** A separate, explicitly constituted certification authority
would be required before `CERTIFICATION = SATISFIED` could ever be stated. This gate therefore
reports **CERTIFICATION = NOT ESTABLISHED**.

## 7. NP-06 consequence

**P1.1 = NOT SATISFIED.** It remains unsatisfied: qualification is not satisfied, and the
authoritative tenant-resolution path is not wired. P1.1 is **not** closed by this record.

The next gate is the **authorized remediation of the composition defect recorded in §5**, followed
by a re-run of G3-Q qualification.
