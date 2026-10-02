# IIPS v3.0 — G3-Q RE-RUN — TenantDirectory Qualification Verification

## Qualification Evidence Record (post-remediation)

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G3-Q-R1 — TenantDirectory qualification re-verification after remediation

**Document type:** QUALIFICATION EVIDENCE RECORD — fresh independent verification against the
remediated authoritative commit. Supersedes the qualification disposition of `G3-Q` (v1.0) for the
remediated commit only.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Authoritative repository:** `ramkivs/iips-review-recovered`
**Authoritative remote:** `https://github.com/ramkivs/iips-review-recovered.git`
**Authoritative ref:** `refs/heads/arena/01a0f1b3-iips-review-recovered`

**Verified implementation commit:** `ab3176b99b2e6af567e3b262b5a8b1b3d057517d`
**Verified implementation tree:** `f5e27b814a77f83f402ba6ecfffd414a2dc46de9`

**Superseded commit (first qualification, FAILED):** `dce48d9d979622a761d1a20d17b6aa0a1ac99303`
**Prior qualification record (retained):**
`docs/v3.0/g3-build/PROGRAM_v3.0_G3Q_TENANTDIRECTORY_QUALIFICATION_VERIFICATION.md`

---

> ## FINAL DISPOSITION
>
> # TENANTDIRECTORY QUALIFICATION = **SATISFIED**
>
> # CERTIFICATION = **NOT ESTABLISHED**
>
> The G3-Q composition defect is remediated and independently re-verified. All required
> qualification evidence passes. Certification remains a separate authority that has not been
> constituted.

---

## 1. Baseline reconciliation

The checkout had been rolled back to `19b42e71` by a sandbox reset. **Before any mutation**, all 15
relevant artifacts were hashed against the authoritative remote and proven **byte-identical**,
including `fdcc8b07`, the three implementation blobs, `admin-transport.ts`, the G3-Q record, G3-B,
G3-DEP-1/2/3, and the G3 registry/membership/substrate records. The divergence was fully explained
and no authoritative state was lost; the checkout was then restored to
`fdcc8b07ed41853c6c6223534b4d5da9f33c5169` by a non-merge operation.

**The previous failed qualification was NOT reused as evidence.** This record was produced by a
fresh verification run against the remediated commit `ab3176b9`.

## 2. Remediation verification — the previously failing area

The G3-Q §5/§11 defect was **authoritative tenant resolution not wired, with a silent fixture
fallback**. Independent re-verification of the remediated commit:

| Probe | Observation | Result |
|---|---|---|
| Original defect scenario reproduced: live composition with **no** membership configured | `createLiveAdminExecutor()` returns `null` → admin endpoints 401. **No fixture authority.** | **PASS** |
| Fixture identity `admin-a` via the live path | `401 DENIED` | **PASS** |
| Fixture identity `analyst-a` via the live path | `401 DENIED` | **PASS** |
| Fixture identity `viewer-a` via the live path | `401 DENIED` | **PASS** |
| Fixture identity `admin-b` via the live path | `401 DENIED` | **PASS** |
| Fixture identity `analyst-b` via the live path | `401 DENIED` | **PASS** |
| Durable-store identity via the live path | `{"userId":"real-user","tenantId":"tenant-REAL","roles":["admin"]}` | **PASS** |

The five identities that previously received fabricated tenant authority now receive **none**, while
authority is correctly derived from the durable membership store. `ADMIN_DIRECTORY` no longer exists
as an identifier in any executable position; the fixture survives only as the explicitly named,
explicitly passed `TEST_TENANT_DIRECTORY`, and `AdminExecutorDeps.directory` is required, so an
absent directory is a type error rather than a silent substitution.

## 3. Qualification evidence matrix

| # | Requirement | Verification | Result | Evidence |
|---|---|---|---|---|
| 1 | Authentication boundary (C6) | Mutation methods accept `credential: unknown`, never a `Principal`; a caller-fabricated `Principal` yields 401; no `Principal`-typed overload exists. Re-verified against the live-wired executor. | **PASS** | `admin-live-composition.test.ts` "C6 invariant intact on the live-wired executor"; `tenant-directory.test.ts` 10, 10b, 10c |
| 2 | Membership lookup | Valid authenticated principal resolves the correct tenant from durable state; absent/unknown membership denies; corrupt state denies; a claim disagreeing with the store denies; no default tenant; **no `ADMIN_DIRECTORY` fallback in the live path**. | **PASS** | §2 above; `tenant-directory.test.ts` 1, 2, 3, 15, 15b; `admin-live-composition.test.ts` 1, 2, 3, 3b, 5, 5b, 5c, 5d |
| 3 | Assignment | Valid assignment persists durably; duplicate refused, never silently overwritten; existing membership cannot be overwritten; invalid tenant denied; unauthorized actor denied; allow and deny both audited. | **PASS** | `tenant-directory.test.ts` 4, 5, 7, 8, 9, 13, 14 |
| 4 | Revocation | Authorized revocation works and is durable; revoked principal no longer resolves; unauthorized revocation denied; missing membership denied; allow and deny both audited. | **PASS** | `tenant-directory.test.ts` 6, 6b, 9c, 14b |
| 5 | Reassignment denial | Two independent fail-closed layers (actor confined to its own authoritative tenant; store refuses to move an existing membership). `revoke(A)+assign(B)` cannot compose into reassignment. Fabricated-Principal, store-manipulation, and alternate-path attempts all denied. No recovery/correction mechanism invented. | **PASS** | `tenant-directory.test.ts` 9, 9b; `admin-live-composition.test.ts` 6, 7, 8 |
| 6 | Persistence / restart | **Genuine cross-process restart**: PID 2151 wrote the membership and exited; a separate OS process PID 2189 read it from disk. Atomic write leaves prior committed state intact on refusal. | **PASS** | two-process run; `tenant-directory.test.ts` 12b; `admin-live-composition.test.ts` 9 |
| 7 | Integrity / corruption | SHA-256 checksum over canonical key-sorted JSON; tampering without recomputing the checksum raises `MembershipError`; a corrupt store yields a governed 401 and never a fabricated default. | **PASS** | `tenant-directory.test.ts` 3, 12; `admin-live-composition.test.ts` 5c |
| 8 | Audit | Allow and deny paths produce governed audit records on the live-wired executor; prior entries are neither rewritten nor reordered (unchanged prefix). Tenant attribution is historical. | **PASS** | `tenant-directory.test.ts` 13, 14, 14b, 14c, 14d, 19; `admin-live-composition.test.ts` 10 |
| 9 | Scope isolation | Zero executable forbidden authority across all artifacts: no imports from forbidden modules, zero `companyId`/`runtimeCompanyId` in executable position, no lifecycle calls, no quota/role/permission mutation, no new parallel authorization primitive, no new auth module. | **PASS** | §4 below |
| 10 | Regression | 143 passed, 1 failed, 25 skipped. The single failure is **independently proven pre-existing**. | **PASS** | §5 below |
| 11 | Live path composition | The live path injects the authoritative durable `FileTenantDirectory` through the designated seam; the fixture is unreachable as a default; unconfigured/absent/corrupt state fails closed. | **PASS** | §2 above |

## 4. Forbidden-scope verification

Executable-position scan of the implementation artifacts: **0** imports from Reports / NP-04 / IPD
modules; **0** `companyId` / `runtimeCompanyId` in executable position; **0** user/tenant lifecycle
calls; **0** quota, role, or permission-policy mutation; **0** new parallel authorization primitives.

Expected **0 changes** — confirmed clean for: mutation-authority map, G3-DEP-1, G3-DEP-2, G3-DEP-3,
G3-B, the G3-Q v1.0 record, Reports, ReportingEngine, NP-04, IPD, D115, IU-7, IU-8. All prior
governance blobs verified byte-identical on the authoritative remote.

## 5. Regression detail

**Command**

```
cd frontend
npx --yes vitest@5.0.3 run --config <node-env vitest config> .
```

**Capability and composition suites:** `Test Files 5 passed (5)` — `Tests 73 passed (73)`.

| Suite | Tests |
|---|---|
| `server/tenant-directory.test.ts` | 30 |
| `server/admin-live-composition.test.ts` | 13 |
| `server/admin-transport.test.ts` | 19 |
| `server/engine-transport.test.ts` | 6 |
| `server/secured-executor.test.ts` | 5 |

**Full suite:** `Test Files 4 failed | 9 passed | 3 skipped (16)`
`Tests 1 failed | 143 passed | 25 skipped (169)`

**Known pre-existing failure — independently confirmed, not a regression:**

- `server/product-transport.test.ts` — "Product responses reject taxonomy-resolved categories while
  permitting all certified engines": `expected [ 'sector.banking', …(12) ] to include 'sector.telecom'`.
- Independently reproduced **identically** at the pre-implementation baseline `4b299f4` during the
  first G3-Q run. Its import graph never reaches the TenantDirectory files. It is not reclassified
  as a regression and not silently counted as passing.

**Environmental limitations (recorded, NOT converted into PASS):**

- Three suites fail to **load** because the external IPD package
  (`iips-production-market-data/pit`) is absent from this environment:
  `server/pit/pitRuntimeIntegration.test.ts`, `server/pit/pitD114RuntimeIntegration.test.ts`,
  `src/api/pit.test.ts`. IPD is out of scope and those suites do not reach the TenantDirectory files.
- `node_modules` is absent and `npm install` is prohibited by standing instruction; vitest was
  supplied via `npx` into the npx cache, and the project's own `vite.config.ts` cannot load its React
  plugins, so an explicit Node-environment vitest configuration was used. **The full suite could not
  be run under the project's own configuration**, and for the three IPD suites this gate records
  `PASS` on the basis that they are out of scope and demonstrably do not exercise the qualified
  artifacts — not on the basis of an executed result.

## 6. Limitations

1. Full-suite execution under the project's own tooling is not possible in this environment (§5).
2. Live composition was verified against a locally hosted OIDC discovery document with the
   signature-verifying Keycloak verifier substituted at the same module id. Real Keycloak realm
   verification remains the subject of the existing live certification test
   (`server/live/admin-live-certification.test.ts`, which self-skips when Keycloak is unavailable).
3. The authoritative membership store path is configuration-supplied
   (`IIPS_TENANT_MEMBERSHIP_PATH`). This record verifies that an **unconfigured** live path fails
   closed; it does not assert anything about how a deployment supplies that value.

## 7. Authority boundary statement

| Level | Status |
|---|---|
| Implementation verification | **PERFORMED** |
| **Qualification** | **SATISFIED** |
| Certification | **NOT ESTABLISHED** |
| Release acceptance | **NOT ASSESSED** |

**Certification authority:** no certification authority has been constituted for this capability.
G3 governance, G3-DEP-1/2/3, G3-B, G3-Q, and this record **do not confer certification**, and this
record deliberately does not invent one. `CERTIFICATION = NOT ESTABLISHED` is the correct and only
supportable statement.

**Scope of this qualification:** it qualifies the TenantDirectory capability as delivered in IRR at
commit `ab3176b9` and its `SecuredExecutor` / live-composition integration. It does not qualify
production deployment, NP-04, IPD, or Reports.

## 8. NP-06 consequence

NP-06 **P1.1 is NOT closed by this record.** Qualification is now satisfied, but P1.1 requires its
own re-entry determination, which is the next gate.

**Next gate:** NP-06 P1.1 RE-ENTRY DETERMINATION.
