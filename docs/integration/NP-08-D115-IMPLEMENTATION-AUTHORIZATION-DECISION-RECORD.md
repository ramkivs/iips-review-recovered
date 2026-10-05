# NP-08 / D115 — Implementation-Authorization Decision Record

> **Artifact ID:** `NP-08-D115-IMPLEMENTATION-AUTHORIZATION-DECISION-RECORD-01`
> **Program:** Institutional Investment Platform System (IIPS)
> **Workstream:** M-4 / D115 — Identity / runtime CompanyId binding
> **Record type:** **IMPLEMENTATION-AUTHORIZATION DECISION RECORD** — governance only; non-executable
> **Recording agent:** `arena-agent` — investigation, recording, and verification only
> **Deciding authority:** **Ramki / Program Authority** — explicit in-gate authorization recorded below
> **Execution boundary:** IRR non-production governance only
> **Authoritative repository:** `ramkivs/iips-review-recovered`
> **Authoritative ref:** `origin/main`
> **Authoritative baseline:** `origin/main@4869d26abab32250bec553f5eef33fb88e506375`; tree `b31b3bc436a7e810b8fb67b1d1a3eeda075b5119`
> **Mutation scope of this gate:** one additive governance record only; no source, configuration, persistence, API/UI, IdP, provider, IPD, or production mutation
> **Decision:** **IMPLEMENTATION AUTHORIZED — BOUNDED D115 ARCHITECTURE CONTRACT ONLY**
>
> This record establishes an implementation-authority boundary. It does not perform or
> authorize implementation execution in this gate. A subsequent, separately scoped D115
> implementation-execution gate is required before source or persistence work begins.

---

## 1. Purpose and authority separation

This gate follows the durably published D115 Architecture-Decision Closure Act. The
architecture contract is accepted and is not reopened by this record.

The purpose of this record is to establish the narrow authority boundary for a later
implementation-execution gate. It preserves the following distinction:

```text
ARCHITECTURE CONTRACT ACCEPTED          ✅ already complete
IMPLEMENTATION AUTHORITY                ✅ granted narrowly by this record
IMPLEMENTATION EXECUTION                ❌ not performed in this gate
QUALIFICATION / TESTING / ACCEPTANCE    ❌ not implied
CERTIFICATION / RELEASE / PRODUCTION    ❌ not implied
```

No implementation authority is inferred from D115 governance semantics or from G-2
architecture acceptance. The authority recorded here exists because Ramki explicitly granted
the bounded D115 implementation authority during this gate.

---

## 2. Authoritative preconditions

### 2.1 Current authoritative baseline

The IRR authoritative remote was independently queried before this record was created.

| Field | Verified value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Remote | `origin` → `https://github.com/ramkivs/iips-review-recovered.git` |
| Ref | `origin/main` |
| Commit | `4869d26abab32250bec553f5eef33fb88e506375` |
| Tree | `b31b3bc436a7e810b8fb67b1d1a3eeda075b5119` |
| Worktree before mutation | Clean |
| Production repository/environment | Not accessed; out of scope |
| IPD repository/environment | Not accessed; out of scope |

`origin/main` legitimately advanced from the previously verified closure baseline
`c7573698b7b882ecb2942bd84057c33ce003c303` through two additive governance commits:

- `4be6ff7` — M-5 D91 dependency disposition;
- `4869d26` — D115 architecture closure publication.

Those additions were inspected read-only. The M-5 act expressly preserves D91 and does not
create D115, implementation, production, or IPD authority. It does not contradict the D115
architecture contract.

### 2.2 D115 authority act

| Field | Value |
|---|---|
| Path | `docs/integration/NP-08-D115-IDENTITY-RUNTIME-COMPANYID-BINDING-AUTHORITY-ACT.md` |
| Blob | `4ab8c64951f74f0769b92f31773f17e32775e577` |
| SHA-256 | `973992ccf29e633fee73083016138b3675252efb3b7e2452ac0b43fd4fac2c45` |
| Size / lines | `24226` bytes / `500` lines |
| Status | Preserved unchanged |

### 2.3 D115 architecture closure

| Field | Value |
|---|---|
| Path | `docs/integration/NP-08-D115-ARCHITECTURE-DECISION-CLOSURE-ACT.md` |
| Blob | `d284fcd351e1634ed0c5a0b063da488ec61e6c13` |
| SHA-256 | `51ec1eb420ac38476448c4138c2c971d43494e2d6e6b88e639e7e3e7bc8f0db4` |
| Size / lines | `55903` bytes / `1072` lines |
| Status | Present and authoritative; architecture contract accepted |

### 2.4 G-2 authority

| Field | Value |
|---|---|
| Path | `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` |
| Blob | `7e83946b470bcc6f4751fb1a67e832ac66128c5c` |
| SHA-256 | `c728a634c8566e4607e138e1d84783ca0ad34a0827f5a8928ed54c1bcece5960` |
| Status | Accepted architectural direction; implementation authority not inherited |

G-2 remains unchanged: IPD owns the durable user-portfolio domain and persistence boundary;
IRR may consume it only through a separately governed additive boundary.

### 2.5 D91 preservation

| Record | Blob | Status |
|---|---|---|
| `docs/integration/NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT.md` | `4bb191a60dc1e5578bc0947824275704719566bf` | Preserved unchanged |
| `docs/integration/NP-08-D91-RELIEF-MECHANISM-ACT.md` | `f61325ee3d3121467ca29c731440e0e233a44165` | Preserved unchanged |

D91 competence, mechanism, relief boundaries, and historical records remain outside this
D115 authorization. No D91 modification is authorized.

---

## 3. Reconfirmed D115 architecture closure

The following decisions are closed and are constraints on every later implementation gate:

1. Principal and Owner/Account are separate concepts.
2. One Principal may access multiple explicit Owner/Account contexts.
3. An Owner may associate multiple Principals through governed membership/delegation.
4. An Owner may belong to multiple Tenants.
5. A Tenant may contain multiple Companies.
6. Multiple active company memberships are permitted at the domain level.
7. Each governed runtime request resolves exactly one Principal, Owner, Tenant, Binding, and
   canonical CompanyId.
8. Membership and role/action authorization are both required.
9. Tenant administration does not automatically grant all-company authority.
10. Cross-company access requires separately authorized contexts.
11. The Company Identity Authority is the canonical company-identity authority.
12. Only that authority assigns canonical CompanyId.
13. Canonical CompanyId is opaque, globally unique within its authority, stable, and never
    recycled.
14. `runtimeCompanyId` is server-derived, immutable within its request context, and
    request-scoped.
15. Client-supplied company identity is never authoritative.
16. Missing, ambiguous, stale, revoked, mismatched, invalid, unavailable, conflicting, or
    unauthorized company identity fails closed.
17. Binding lifecycle, effective-time, provenance, and version semantics are authoritative.
18. Company-scoped resources require authorization against canonical CompanyId.
19. D115 persistence remains a logical contract; this record selects no persistence technology.
20. G-2 remains additive, with IPD owning durable user-portfolio persistence.
21. Existing NP-12 `companyId`, Screen identity, `(sector, referenceId)`, `${sector}-H1`, PIT
    identifiers, frontend DTO fields, provider identifiers, tenant IDs, OIDC subjects, and
    other existing namespaces are not D115 `runtimeCompanyId`.

No architecture contradiction was discovered during this gate.

---

## 4. Explicit implementation authorization decision

### 4.1 Authorization event

Ramki explicitly granted the following bounded authority during this gate:

> **D115 implementation authority for the accepted architecture contract only, limited to a
> subsequent separately authorized implementation-execution gate, with no production,
> deployment, release, qualification, acceptance, certification, IdP change, Company Identity
> Authority creation, IPD/G-2 mutation, D91/PIT/IU-8/NP-12 changes, or unrelated work.**

### 4.2 Decision

> **IMPLEMENTATION AUTHORIZED — BOUNDED D115 ARCHITECTURE CONTRACT ONLY**

This is authorization to establish a bounded implementation boundary and to permit a later
execution gate to evaluate and execute only the scope in §5, subject to the prerequisites in
§11. It is not authorization to perform implementation in the present gate.

### 4.3 Current-gate non-execution

No source, configuration, schema, persistence, API, UI, identity-provider, provider, G-2,
IPD, D91, PIT, NP-12, qualification, acceptance, certification, release, or production
change was performed by this gate.

---

## 5. Architecture-to-implementation boundary

The authorized implementation boundary is the smallest set of server/domain boundaries
needed to realize the accepted D115 contract. It is implementation-neutral where the
architecture intentionally left technology open.

### 5.1 Identity and context resolution

A subsequent execution gate may implement server-side boundaries for:

- preserving the existing validated OIDC identity and application Principal;
- resolving an explicit Owner/Account context for the Principal;
- validating the Owner/Account–Tenant relationship;
- resolving an active, unambiguous Company Binding;
- consuming the canonical Company Identity Authority result;
- constructing an immutable request-scoped Runtime Company Context;
- projecting the canonical identity as `runtimeCompanyId`; and
- re-resolving on company selection, switching, version change, lifecycle change, or stale
  context detection.

The context must contain exactly one Principal, Owner, Tenant, Binding, canonical CompanyId,
Binding version, authority mapping version, effective/expiry information, provenance, and
correlation identity as required by the accepted closure contract.

### 5.2 Company Identity Authority consumption boundary

The execution boundary may implement an adapter/consumer for the already-designated Company
Identity Authority. It may not create, replace, or redefine that authority.

The implementation-facing semantic contract must carry or verify:

- server-resolved Owner/Account and Tenant context;
- opaque Binding identity or authority-issued membership reference;
- canonical CompanyId returned by the authority;
- binding lifecycle state;
- binding version;
- authority mapping version;
- effective and expiry time;
- authority/provenance evidence;
- conflict or ambiguity disposition; and
- unavailable, stale, invalid, or version-conflict behavior.

The adapter must reject unverifiable, conflicting, non-canonical, retired, stale, or
unavailable results. It must not use a last-known-good value, local alias, provider ID,
client value, or fallback identity.

The adapter consumes canonical identity; it does not implement SecurityMaster/company
identity assignment, provider resolution, company registry creation, merge/split policy, or
production identity data migration.

### 5.3 Authorization boundary

The execution boundary may extend the existing server-side authorization flow with:

```text
validated Principal
        ↓
validated Owner/Account
        ↓
validated Tenant
        ↓
active Company Binding
        ↓
canonical CompanyId / runtimeCompanyId
        ↓
resource canonical CompanyId
        ↓
membership + role/action authorization
        ↓
allow / deny
```

Required implementation behavior:

- preserve existing authentication, tenant isolation, RBAC, quota, and resource-gate
  semantics;
- require active company membership and permitted role/action for company-scoped access;
- compare immutable `runtimeCompanyId` with the resource's server-owned canonical CompanyId;
- deny missing or unbound company-scoped resources;
- deny tenant-administrator attempts without a valid company binding;
- prohibit cross-company access within one runtime context; and
- keep tenant-scoped resources explicitly separate from company-scoped resources.

### 5.4 Fail-closed boundary

The execution must deny and audit at least the following conditions:

- missing binding;
- ambiguous binding;
- inactive, suspended, expired, revoked, replaced, or removed binding;
- stale Binding or authority version;
- Owner mismatch;
- Tenant mismatch;
- resource CompanyId mismatch;
- invalid, conflicting, retired, or non-canonical CompanyId;
- unauthorized company action;
- Company Identity Authority unavailability;
- Binding version conflict; and
- client-supplied CompanyId or client selection that cannot be resolved as an eligible
  server-side binding.

No fallback may substitute:

```text
tenantId
userId
role
sector
Screen identity
(sector, referenceId)
${sector}-H1
provider identifier
frontend identity
PIT identity
ticker / ISIN / FIGI
```

### 5.5 Logical persistence boundary

The execution boundary may implement logical records and repository/service contracts for:

- Principal and external-identity reference;
- Owner/Account;
- Principal–Owner membership/delegation;
- Tenant and Owner–Tenant membership;
- Company Binding;
- canonical CompanyId reference and authority version;
- Binding lifecycle state and effective interval;
- Binding transition history;
- authority provenance/resolution evidence;
- concurrency/version identity; and
- correlated lifecycle/security audit.

This authority does not select or authorize a database, ORM, schema, migration technology,
storage vendor, serialization format, transport protocol, or concrete persistence topology.
A separate explicit technology/implementation decision is required before those details are
chosen. In-memory development state and PIT remain non-authoritative for D115 binding.

### 5.6 Audit/provenance boundary

The execution boundary may add the D115 fields and event classes required by the accepted
contract, including Principal, Owner, Tenant, CompanyId, Binding identity/version, authority
version/provenance, lifecycle transition, resource/action, timestamp, decision, and failure
reason.

The existing server-side authorization audit seam may be reused for security decisions, but
its current in-memory `AuditRecord` shape is not by itself the durable D115 lifecycle/audit
source. Lifecycle and security events remain logically distinct and correlated.

### 5.7 G-2 additive boundary

The execution boundary may define an IRR-side read-only consumer contract carrying only the
server-validated Principal, Owner, Tenant, canonical CompanyId, Binding identity/version,
authority version/status, and correlation data required by the G-2 additive boundary.

It may not:

- mutate or implement IPD;
- create an IRR portfolio domain;
- repurpose PIT;
- copy IPD persistence into IRR;
- bypass IPD portfolio authorization; or
- integrate user-owned portfolios into certified reference scoring without a separate
  governance decision.

---

## 6. Existing architecture reuse and protected boundaries

### 6.1 Reuse matrix

| Existing component | Reuse decision | Required treatment |
|---|---|---|
| `frontend/src/core/auth/authContract.ts` | Reuse | Preserve `ValidatedIdentity`, `SessionValidator`, `PrincipalResolver`, and 401/403 separation. Do not add CompanyId as an OIDC claim or collapse Principal into Owner. |
| `frontend/src/core/auth/keycloakAdapter.ts` | Reuse unchanged for authentication | Preserve issuer, audience, expiry, JWKS/verifier, and role mapping behavior. Keycloak remains authentication authority, not Company Identity Authority. |
| `frontend/server/secured-executor.ts` | Extend at a new post-auth boundary | Preserve `authenticate()`, validated tenant resolution, RBAC, quota, resource gate, and audit. Add D115 binding/context resolution conceptually after Principal/Tenant validation; do not use tenant lookup as CompanyId binding. |
| `TenantDirectory.tenantForUser()` | Reuse tenant-validation semantics only | The current directory, including development/in-memory mappings, is not durable Owner/Account or Company Binding authority. Do not overload it with D115 semantics. |
| `EnterpriseRuntime.Principal` | Reuse as the existing application Principal | Keep `{ userId, tenantId, roles }` as the G3 principal contract. Associate a separate Runtime Company Context; do not make `tenantId`, `userId`, or roles a CompanyId. |
| `EnterpriseRuntime` RBAC and tenant checks | Reuse | Preserve role policy, tenant isolation, quota, and server-side authorization. Add company membership/equality checks as a separate D115 stage. Do not feed CompanyId into frozen engine mathematics. |
| `EnterpriseRuntime.auditLog()` | Reuse as an authorization seam/projection | Current in-memory audit is insufficient as durable D115 lifecycle provenance. Extend or correlate under the accepted audit contract only. |
| `PlatformApi.ApiSecurity` | Reuse as the resource authorization authority | Preserve the thin API/security boundary. A client-carried `tenantId` or generic request field cannot establish the Runtime Company Context. |
| `PlatformApi.ApiRequest` | Preserve protected engine/API contract | Do not overload existing `tenantId`, `principal`, or `inputs` fields with D115 identity. D115 context is an internal server authorization context and does not alter engine inputs. |
| `frontend/server/admin-transport.ts` | Reuse as a representative secured server path only | Preserve G3 authentication, tenant filtering, RBAC, resource gates, and audit. Its in-memory governed state and admin DTOs are not D115 durable identity or binding state. |
| `frontend/server/executive-transport.ts` | Do not use as D115 authority | It contains a separate minimal development/reference session surface and certified reference transport, including synthetic `${sector}-H1` values. It is not a universal D115 request path and must not be upgraded by inference. |
| `ScreenProducerAdapter.ts` | Preserve unchanged for NP-12 | Its caller/request `companyId` and `(sector, referenceId)` are Screen/member identity. They must not be converted to D115 CompanyId. |
| `SnapshotStore.ts` | Preserve for snapshot/replay role | Its in-memory append-only state is not D115 binding persistence and must not be repurposed. |
| G-2 boundary | Preserve | IPD remains owner of durable user portfolios; IRR may consume only through a separately governed additive boundary. IPD was not accessed or mutated. |
| D91 acts | Preserve unchanged | No D91 competence, mechanism, relief, or historical record may be changed by D115 implementation work. |
| NP-12/PIT/reference portfolio | Preserve unchanged | No namespace, PIT, certified reference portfolio, or frozen engine foundation may be reopened. |

### 6.2 Conceptual insertion point

The D115 binding stage enters the secured server flow after current authentication and tenant
validation and before company-scoped resource authorization:

```text
OIDC credential
  → KeycloakSessionValidator / OIDC verifier
  → ValidatedIdentity
  → SecuredExecutor.authenticate()
  → TenantDirectory / platform tenant validation
  → EnterpriseRuntime.Principal
  → D115 Owner/Account resolution
  → D115 Company Binding + Company Identity Authority resolution
  → immutable Runtime Company Context
  → existing RBAC / ApiSecurity plus D115 company authorization
  → governed resource
```

The insertion does not replace the G3 chain and does not make the transport, frontend, or
client request the security authority.

---

## 7. Implementation readiness matrix

| Area | Architecture status | Implementation scope | Existing reuse | New work required | Authorization required |
|---|---|---|---|---|---|
| Principal | CLOSED | Preserve server Principal and associate context without identity collapse | `ValidatedIdentity`, `PrincipalResolver`, `EnterpriseRuntime.Principal` | Internal context association and propagation | Covered by bounded D115 authority; execution gate required |
| Owner/Account | CLOSED | Resolve one explicit Owner/Account per runtime context | None as a current D115 implementation; G-2 conceptual boundary | Owner/account directory, membership/delegation resolver, lifecycle access | Covered only for D115 scope; concrete durable implementation in execution gate |
| Tenant | CLOSED | Reuse tenant validation and enforce Owner–Tenant consistency | `TenantDirectory`, `EnterpriseRuntime.isTenantResource` | Durable/current membership resolution and version checks | Covered by bounded D115 authority; no tenant redesign |
| Membership | CLOSED | Resolve Principal–Owner, Owner–Tenant, and Owner/Tenant–Company membership | Existing tenant/RBAC decision seams | Durable relationship resolver, effective-time and status checks | Covered for D115; persistence technology separately authorized |
| Company Binding | CLOSED | Resolve active, unambiguous Binding and carry identity/version/state | None as an existing D115 implementation | Binding service/adapter, lifecycle/version/concurrency handling | Covered for D115; execution gate required |
| Company Identity Authority | CLOSED contract | Consume canonical authority response; no authority creation | None in current IRR source | Authority adapter, validation, provenance, unavailable/conflict handling | Covered for consumption only; authority creation/provider integration excluded |
| `runtimeCompanyId` | CLOSED | Construct immutable server-derived request projection | No current implementation | Runtime Company Context type, creation, propagation, invalidation | Covered for D115; execution gate required |
| Runtime Context | CLOSED | Request-scoped context with exactly one company | Existing server request/auth boundaries | Context resolver, selection/switch re-resolution, stale detection | Covered for D115; execution gate required |
| Authorization | CLOSED | Membership + role/action + resource canonical CompanyId equality | `SecuredExecutor`, `EnterpriseRuntime`, `PlatformApi.ApiSecurity` | Company authorization stage and resource canonical identity exposure | Covered for D115; no cross-company exception |
| Fail-closed behavior | CLOSED | Deny all specified missing/stale/mismatch/unavailable conditions | Existing 401/403 and tenant/RBAC denial seams | D115 failure classification, re-resolution rules, audit | Covered for D115; execution gate required |
| Persistence contract | CLOSED logical contract | Implement logical records/repository boundary only | None as a durable D115 source; in-memory stores explicitly excluded | Durable identity/binding/lifecycle/provenance implementation | Technology/schema/vendor selection separately requires explicit authority |
| Audit/provenance | CLOSED | Record D115 lifecycle and authorization evidence | `EnterpriseRuntime` audit seam | Correlated fields, lifecycle history, durable retention boundary | Covered for D115; retention/storage details separately authorized |
| G-2 boundary | CLOSED | IRR-side additive, read-only semantic consumer | Existing G3/server boundary only | Contract adapter and version/status checks | IRR-side scope covered; IPD implementation not authorized |

---

## 8. Explicit exclusions

This authorization does not include:

1. Any implementation execution during this authorization gate.
2. Production source, configuration, deployment, activation, data, identity, or infrastructure
   work.
3. Production release, migration, backup, disaster recovery, or operational activation.
4. Qualification, acceptance, certification, security certification, or release authority.
5. Creation, replacement, or modification of the Company Identity Authority itself.
6. Provider, SecurityMaster, external data, ticker, ISIN, FIGI, or identity-source activation.
7. Concrete database, ORM, schema, persistence vendor, protocol, serialization, or deployment
   selection without separate explicit authority.
8. IPD access, IPD mutation, IPD portfolio implementation, or production-repository work.
9. G-2 revision, replacement, duplication, or expansion of the IRR boundary.
10. D91 competence, mechanism, relief, M-5, historical-record, or Macro changes.
11. PIT/IU-8/IU-7 reopening or market-data persistence repurposing.
12. NP-12, Screen, `(sector, referenceId)`, `${sector}-H1`, certified reference portfolio,
    frozen engine, or engine-mathematics changes.
13. Reclassification of any existing `companyId`, tenant ID, OIDC subject, provider identity,
    frontend DTO, or fixture key as D115 CompanyId.
14. Whole-branch merge, unrelated cleanup, historical-record rewrite, or import of unrelated
    Arena work.
15. Certification or acceptance of the implementation merely because it is later written or
    tested.

---

## 9. Implementation safety constraints

Any subsequent implementation-execution gate must:

- begin from a freshly verified authoritative `origin/main`;
- verify the repository is `ramkivs/iips-review-recovered` and IPD remains out of scope;
- reverify the D115 authority and closure blobs;
- preserve D91 competence and mechanism records exactly;
- preserve G-2 and NP-12 authority decisions;
- preserve namespace separation;
- use the smallest bounded change set;
- avoid whole-branch merges and unrelated cleanup;
- keep CompanyId out of frozen engine mathematics;
- keep client and frontend values non-authoritative;
- preserve server-side 401/403, tenant isolation, RBAC, audit, and fail-closed behavior;
- reject stale/ambiguous/unavailable authority rather than falling back;
- avoid IPD and production mutation; and
- stop if the implementation plan would require an architecture decision not covered here.

### 9.1 Universal Artifact Durability Invariant

No implementation, governance record, test result, or authorization claim is durable merely
because it exists in the Arena workspace or on a session branch. Durability requires:

```text
authoritative repository/ref
        + exact intended change set
        + authoritative remote publication
        + independent remote verification
        + exact blob/content verification
        + LOCAL == REMOTE
        + clean worktree
```

This record itself is subject to that invariant. It is not authoritative until published to
`origin/main` and independently verified.

---

## 10. Authorization status

| Authority plane | Status |
|---|---|
| D115 architecture | **ACCEPTED** |
| D115 implementation readiness | **READY** for the bounded D115 implementation scope in §§5–7; evidence is the authoritative closure act plus current G3/source inspection |
| D115 implementation authority | **AUTHORIZED**, narrowly for the accepted D115 architecture contract and subsequent execution-gate planning |
| Implementation execution in this gate | **NOT AUTHORIZED / NOT PERFORMED** |
| Production authority | **NOT GRANTED** |
| Deployment/release authority | **NOT GRANTED** |
| Qualification/testing authority | **NOT IMPLIED** |
| Acceptance/certification authority | **NOT GRANTED** |
| Company Identity Authority creation | **NOT AUTHORIZED** |
| IPD/G-2 mutation | **NOT AUTHORIZED** |
| D91 changes | **NOT AUTHORIZED** |
| PIT/IU-8/IU-7 reopening | **NOT AUTHORIZED** |
| NP-12/Screen/namespace changes | **NOT AUTHORIZED** |

The authorization is bounded and does not authorize any work outside the accepted D115
architecture contract.

---

## 11. Prerequisites for the next execution gate

Before any source or persistence implementation begins, the separate D115 implementation-
execution gate must:

1. Reverify authoritative `origin/main`, including the current commit and tree.
2. Reverify the exact D115 authority, D115 architecture closure, G-2, and D91 artifacts.
3. Define the smallest implementation work packages and their protected paths.
4. State which implementation-neutral authority/binding contract is consumed and how its
   current version and provenance are verified.
5. Separately authorize any concrete persistence, schema, protocol, provider, or transport
   choice required by the implementation plan.
6. Define the resource classes that are company-scoped versus tenant-scoped without
   reclassifying existing NP-12/PIT/reference identities.
7. Define the IRR-side G-2 additive boundary without accessing or modifying IPD in this
   authorization record.
8. Define developer verification separately from qualification, acceptance, certification,
   and release.
9. Establish a change manifest containing only the authorized D115 implementation paths.
10. Require independent post-execution remote durability verification before treating any
    implementation as authoritative.

No implementation may begin merely because this record exists.

---

## 12. Next gate

The next gate is a separate:

> **D115 IMPLEMENTATION-EXECUTION GATE**

That gate must explicitly enumerate the implementation work package, protected boundaries,
concrete technology decisions (if separately authorized), verification plan, and durability
procedure. It must not combine implementation with qualification, acceptance, certification,
release, production, IPD, D91, PIT, IU-8, or unrelated NP work.

---

## 13. Final decision statement

> **D115 architecture: ACCEPTED.**
>
> **D115 implementation readiness: READY** for the bounded D115 implementation scope
> recorded here; actual execution remains a separate gate.
>
> **D115 implementation authority: AUTHORIZED**, narrowly for the accepted architecture
> contract only, by Ramki's explicit in-gate grant.
>
> **Implementation execution: NOT PERFORMED.**
>
> **Production, deployment, release, qualification, acceptance, certification, IPD/G-2,
> D91, PIT/IU-8, NP-12, provider, and unrelated work: NOT AUTHORIZED.**

**End of D115 Implementation-Authorization Decision Record.**
