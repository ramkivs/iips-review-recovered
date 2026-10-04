# NP-08 / D115 — Implementation Completion Record

> **Artifact ID:** `NP-08-D115-IMPLEMENTATION-COMPLETION-RECORD-01`
> **Program:** Institutional Investment Platform System (IIPS)
> **Workstream:** M-4 / D115 — Identity / runtime CompanyId binding
> **Record type:** **IMPLEMENTATION COMPLETION RECORD** — non-production governance evidence
> **Recording agent:** `arena-agent` — implementation, focused verification, recording, and durability verification only
> **Authoritative repository:** `ramkivs/iips-review-recovered`
> **Authoritative baseline:** `origin/main@c25c4ac845035d243be38727a6b6e90d229aa5ea`; tree `9a54f6831a2fc5799d6f4df8d2b80b09df875b07`
> **Implementation commit:** `278835f434a0dbff411ee33b3312e99a2965a4ad`; tree `8f4d6d00a4ee70211f94592fb5d8fa71234d35e5`
> **Scope:** bounded D115 IRR server/runtime boundary only
> **Status:** **IMPLEMENTATION COMPLETE — BOUNDED D115 RUNTIME BOUNDARY**
>
> This record does not claim production readiness, deployment, release, qualification,
> acceptance, certification, or IPD implementation.

---

## 1. Authorization and baseline

The implementation was performed under the bounded authority recorded in:

`docs/integration/NP-08-D115-IMPLEMENTATION-AUTHORIZATION-DECISION-RECORD.md`

That authorization was explicitly granted by Ramki for the accepted D115 architecture
contract only. It excluded production, IPD/G-2 mutation, Company Identity Authority
creation, D91/PIT/IU-8/NP-12 changes, and unrelated work.

Before implementation:

- `origin/main` was verified at `c25c4ac845035d243be38727a6b6e90d229aa5ea`.
- The authorization baseline advancement was inspected read-only.
- The fixed Arena branch was reconciled onto the current authoritative baseline without
  importing unrelated changes.
- The worktree was clean.
- D115 authority, D115 architecture closure, authorization, G-2, and D91 artifacts matched
  their expected authoritative blobs.
- IPD and production were not accessed.

The implementation commit has the authoritative baseline as its direct parent:

```text
c25c4ac845035d243be38727a6b6e90d229aa5ea
        ↓
278835f434a0dbff411ee33b3312e99a2965a4ad
```

---

## 2. Implemented boundary

### 2.1 Logical identity and persistence contracts

`frontend/server/d115-runtime.ts` implements implementation-neutral logical contracts for:

- Principal records;
- Tenant records;
- Owner/Account records;
- Principal–Owner membership/delegation;
- Owner–Tenant membership;
- Company Binding records;
- Binding lifecycle state;
- Binding and Company Identity Authority versions;
- effective intervals;
- authority provenance;
- logical repository access; and
- correlated D115 audit events.

No database, ORM, schema technology, vendor, production persistence topology, or concrete
Company Identity Authority was selected or created.

### 2.2 Owner, Tenant, and Company Binding resolution

`D115ContextResolver` implements the server-side resolution chain:

```text
validated Principal
        → active Principal record
        → explicit Owner/Account membership
        → active Owner–Tenant membership
        → active, unambiguous Company Binding
        → Company Identity Authority result
        → immutable RuntimeCompanyContext
```

Implemented behavior includes:

- multiple Principal–Owner contexts;
- explicit owner selection;
- multiple active company memberships;
- authoritative default binding selection;
- ambiguity denial;
- active/effective interval checks;
- lifecycle-state checks;
- Binding version checks;
- Company Identity Authority version checks;
- canonical CompanyId and provenance validation; and
- fresh current-state revalidation through `assertCurrent()`.

### 2.3 Binding lifecycle guard

`validateBindingTransition()` enforces:

- monotonic Binding version increments;
- terminal revocation semantics;
- terminal replacement semantics;
- new Binding identity for material target changes; and
- rejection of invalid target/version transitions.

The function validates lifecycle transitions without selecting or mutating a persistence
technology.

### 2.4 Runtime Company Context

The implementation creates a frozen, request-scoped `RuntimeCompanyContext` containing:

- Principal reference;
- Owner/Account reference;
- Tenant reference;
- Binding identity;
- canonical CompanyId;
- server-derived `runtimeCompanyId`;
- Binding version;
- Company Identity Authority version;
- active/effective interval state;
- correlation identity; and
- provenance.

Client-supplied CompanyId values are used only as untrusted selection hints. They never
establish identity or mutate durable binding.

### 2.5 Company authorization

`D115CompanyAuthorizer` enforces:

```text
current Runtime Company Context
AND
current Owner/Tenant/Binding state
AND
resource tenant equality
AND
runtimeCompanyId == resource canonical CompanyId
AND
EnterpriseRuntime role/action authorization
AND
existing resource authorization gate
```

It rejects missing resource CompanyId, tenant mismatch, canonical CompanyId mismatch,
unauthorized role/action, stale context, revoked context, and unavailable/conflicting
authority results.

### 2.6 G3 integration

`SecuredExecutor` now exposes two D115 server-side bridges:

- `authenticateWithRuntimeCompanyContext()` — preserves the existing OIDC → Principal →
  tenant validation chain and then resolves D115 context;
- `authorizeCompany()` — maps D115 authorization failures into the existing server-side
  `403` boundary while preserving the existing G3 authentication behavior.

Existing `authenticate()`, RBAC, tenant, quota, resource-gate, and audit behavior remains
unchanged.

---

## 3. Changed-file manifest

Only the following implementation paths changed in the implementation commit:

| Path | Change | Role |
|---|---|---|
| `frontend/server/d115-runtime.ts` | Added | D115 logical repository, authority, context, lifecycle, authorization, and audit boundary |
| `frontend/server/d115-runtime.test.ts` | Added | Focused D115 positive, negative, lifecycle, namespace, and G3 bridge tests |
| `frontend/server/secured-executor.ts` | Modified | Additive D115 insertion points after existing Principal/Tenant establishment |

No configuration, persistence schema, API route, UI, provider, identity-provider, engine,
PIT, IPD, production, D91, G-2, or NP-12 file changed.

---

## 4. Architecture mapping

| Accepted architecture requirement | Implementation evidence |
|---|---|
| Principal and Owner remain separate | Separate Principal, Owner record, membership, and context fields |
| Owner may have multiple Principals | Principal–Owner membership repository contract |
| Principal may use multiple Owner contexts | Owner selection and ambiguity handling |
| Owner may belong to multiple Tenants | Owner–Tenant membership contract and effective validation |
| Tenant may contain multiple Companies | Multiple Binding records per Owner/Tenant |
| One CompanyId per runtime context | Frozen context with exactly one `runtimeCompanyId` |
| Company Identity Authority sole canonical source | Injected `CompanyIdentityAuthority` contract; no fallback authority |
| Binding lifecycle/version semantics | Binding states, transition guard, effective interval, version checks |
| Server-derived runtimeCompanyId | Context value comes only from validated Binding/authority result |
| Company membership + role authorization | Binding resolution plus `EnterpriseRuntime.check()` and resource gate |
| Resource CompanyId equality | Exact `runtimeCompanyId === resource.canonicalCompanyId` check |
| Fail closed | Explicit D115 errors for missing, ambiguous, inactive, stale, revoked, conflicting, unavailable, invalid, mismatched, and unauthorized conditions |
| Audit/provenance | D115 audit sink events for context issuance, denial, stale state, authority failure, allow, and deny |
| G-2 additive boundary | Only logical IRR-side context contract; no IPD access or mutation |
| Namespace separation | No use of NP-12, Screen, `${sector}-H1`, PIT, provider, OIDC, or frontend identifiers as D115 identity |

---

## 5. Focused verification

### 5.1 D115 tests

Focused test file:

`frontend/server/d115-runtime.test.ts`

Result:

```text
14 tests passed
```

Covered cases include:

- valid Principal → Owner → Tenant → Binding → CompanyId resolution;
- immutable one-company context;
- multiple Owner contexts;
- explicit company switching;
- authoritative default selection;
- ambiguous membership denial;
- lifecycle states PROPOSED, SUSPENDED, REVOKED, REPLACED, and expired;
- stale Binding version;
- stale authority version;
- authority unavailable;
- authority conflict;
- invalid canonical CompanyId;
- client-supplied identity mismatch;
- Owner/Tenant mismatch;
- resource CompanyId mismatch;
- missing resource CompanyId;
- unauthorized role/action;
- tenant administrator cross-company denial;
- stale/revoked runtime context; and
- mapping D115 denial to the existing 403 boundary.

### 5.2 Existing G3/server regression subset

The following focused server test files passed:

| Test file | Result |
|---|---:|
| `d115-runtime.test.ts` | 14 passed |
| `secured-executor.test.ts` | 5 passed |
| `admin-transport.test.ts` | 19 passed |
| `engine-transport.test.ts` | 6 passed |
| `ai-advisory-transport.test.ts` | 4 passed |
| **Total** | **48 passed** |

The existing G3 authentication, tenant isolation, RBAC, audit, admin, engine, and advisory
regression behavior remained passing in this focused run.

### 5.3 Type verification

A strict TypeScript source check passed for:

- `frontend/server/d115-runtime.ts`;
- `frontend/server/secured-executor.ts`; and
- their imported platform/authentication contracts.

The check used TypeScript 5.6.3 in an isolated non-repository runner because repository
frontend dependencies were not installed. No IPD dependency was installed or accessed.

### 5.4 Full-suite limitation

A full frontend server-suite attempt was not treated as a D115 pass/fail gate because the
workspace does not contain installed frontend dependencies and two pre-existing PIT
integration suites import the unavailable `iips-production-market-data/pit` package. One
pre-existing product-transport assertion also failed for a certified-engine inventory
expectation unrelated to the changed D115 paths.

No IPD package was installed or inspected to resolve those failures. The bounded D115 and
G3 regression subset passed independently.

---

## 6. Preservation checks

The implementation commit contains no changes to:

- D115 authority act;
- D115 architecture closure act;
- D115 authorization record;
- G-2 decision;
- D91 competence act;
- D91 mechanism act;
- M-5 record;
- NP-12 or Screen implementation;
- PIT/IU-8/IU-7;
- frozen sector engines or engine mathematics;
- production repository or environment; or
- IPD.

The implementation source contains no fallback from canonical CompanyId to tenant ID, user
ID, role, sector, Screen identity, `${sector}-H1`, provider identifier, frontend DTO, PIT
identity, ticker, ISIN, FIGI, or OIDC subject.

---

## 7. Known limitations and separately authorized follow-up

The following are deliberately not claimed as part of this bounded completion:

1. A concrete durable repository implementation is not selected. The implementation exposes
   the logical `D115BindingRepository` contract and requires an authoritative injected source.
2. The Company Identity Authority is not created or replaced. The implementation consumes its
   injected semantic contract and fails closed when it is absent or unavailable.
3. No existing tenant-scoped or reference-portfolio route was reclassified as a company-
   scoped route. A later route-specific integration must supply a server-owned canonical
   resource CompanyId.
4. No G-2/IPD implementation or portfolio transaction was performed.
5. Qualification, acceptance, certification, release, deployment, and production readiness
   were not evaluated or granted.

Any technology selection, durable adapter activation, route integration, or qualification
requires its own bounded authorization and must preserve this implementation boundary.

---

## 8. Completion disposition

The authorized bounded implementation was implemented and focused verification passed:

> **IMPLEMENTATION COMPLETE — BOUNDED D115 RUNTIME BOUNDARY**

This disposition means the authorized IRR server/runtime boundary is implemented and
verified in the non-production workspace. It does not mean production-ready, certified,
accepted, released, deployed, or integrated with IPD.

The implementation remains subject to the Universal Artifact Durability Invariant. It is not
authoritative until the implementation commit and this completion record are published to
the authoritative remote and independently verified.

**End of D115 Implementation Completion Record.**
