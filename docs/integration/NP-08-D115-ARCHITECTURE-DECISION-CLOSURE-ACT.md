# NP-08 / D115 — Architecture-Decision Closure / Contract-Acceptance Act

> **Artifact ID:** `NP-08-D115-ARCHITECTURE-DECISION-CLOSURE-ACT-01`
> **Program:** Institutional Investment Platform System (IIPS)
> **Workstream:** M-4 / D115 — Identity / runtime CompanyId binding
> **Record type:** **ARCHITECTURE-CONTRACT CLOSURE / CONTRACT-ACCEPTANCE ACT** — governance only; non-executable
> **Recording agent:** `arena-agent` — investigation, reconciliation, recording, and verification only
> **Execution boundary:** NON_PRODUCTION IIPS GOVERNANCE ONLY
> **Authoritative repository:** `ramkivs/iips-review-recovered`
> **Authoritative ref:** `origin/main`
> **Recording date:** 2026-10-04 (Asia/Calcutta)
> **Pre-mutation authoritative baseline:** `origin/main@c7573698b7b882ecb2942bd84057c33ce003c303`; tree `f4df1768480b605292082cbdbf601e17690a347f`
> **Mutation scope:** one additive governance artifact; no source, configuration, historical-record, IPD, or production mutation
> **Acceptance status:** **ARCHITECTURE CONTRACT ACCEPTED — READY FOR IMPLEMENTATION-AUTHORIZATION**
>
> **Boundary:** Acceptance of this architecture contract is not implementation authorization. A later, separately authorized D115 Implementation-Authorization Act is required.

---

## 1. Purpose, scope, and governing separation

This act closes the material architecture decisions left open by the preceding D115
implementation-readiness investigation. That investigation established the disposition
`NOT READY — ARCHITECTURAL DECISION REMAINS`: D115 supplied strong governance semantics, but
did not yet supply an implementation-ready architecture contract.

This act now records the accepted, implementation-neutral contract for:

- the conceptual identity objects and cardinalities;
- Principal → Owner/Account → Tenant → Company Binding → canonical CompanyId;
- the Company Identity Authority;
- company-selection and switching;
- binding lifecycle and versioning;
- the immutable server-derived `runtimeCompanyId` context;
- authentication, principal, tenant, binding, and authorization trust boundaries;
- company authorization and resource ownership;
- fail-closed behavior and audit/provenance;
- logical persistence invariants;
- the D115/G-2 additive boundary; and
- namespace separation.

The governing separation is preserved:

```text
GOVERNANCE SEMANTICS
        ↓
ARCHITECTURE CONTRACT  ← this act
        ↓
IMPLEMENTATION AUTHORIZATION  ← a later separate act
        ↓
IMPLEMENTATION
```

This act does not authorize source changes, persistence or schema work, API/UI work,
identity-provider changes, provider integration, G-2/IPD implementation, qualification,
acceptance, certification, release, or production activity.

### 1.1 Effectiveness and durability

The contract recorded here is the accepted architecture decision for the D115 closure gate.
Its status as current authoritative IRR governance history is conditional on publication to
`origin/main` and independent remote verification under the repository's durability
convention. A local or session-branch copy is not, by itself, a replacement for the
authoritative `origin/main` record.

No decision in this act grants the recording agent authority to publish to a protected ref,
and no implementation authority is implied if or when the artifact is durably published.

---

## 2. Authoritative baseline and source reconciliation

### 2.1 Baseline verification

Before this artifact was created, the following were independently verified against the
IRR authoritative remote:

| Item | Verified value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Remote | `origin` → `https://github.com/ramkivs/iips-review-recovered.git` |
| Authoritative ref | `origin/main` |
| Commit | `c7573698b7b882ecb2942bd84057c33ce003c303` |
| Tree | `f4df1768480b605292082cbdbf601e17690a347f` |
| Worktree before mutation | Clean |
| Production repository | Not accessed; out of scope |

### 2.2 D115 authority

The published D115 authority artifact was present on `origin/main` at:

`docs/integration/NP-08-D115-IDENTITY-RUNTIME-COMPANYID-BINDING-AUTHORITY-ACT.md`

| D115 verification field | Value |
|---|---|
| Blob | `4ab8c64951f74f0769b92f31773f17e32775e577` |
| SHA-256 | `973992ccf29e633fee73083016138b3675252efb3b7e2452ac0b43fd4fac2c45` |
| Size | `24226` bytes |
| Lines | `500` |
| Tree entry | `100644 blob 4ab8c64951f74f0769b92f31773f17e32775e577` |

D115 Packet A–H is the semantic foundation for this contract. In particular, this act
retains D115's requirements that the application principal remain server-side, canonical
CompanyId come only from the designated authority, `runtimeCompanyId` be a server-derived
projection, tenant isolation and G3 authorization remain intact, and durable binding—not
in-memory state or PIT—be authoritative.

### 2.3 G-2 authority

The accepted G-2 record was present on `origin/main` at:

`docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`

| G-2 verification field | Value |
|---|---|
| Blob | `7e83946b470bcc6f4751fb1a67e832ac66128c5c` |
| SHA-256 | `c728a634c8566e4607e138e1d84783ca0ad34a0827f5a8928ed54c1bcece5960` |
| Size | `9390` bytes |
| Lines | `247` |
| Governing direction | IPD owns the durable user-portfolio domain and persistence boundary; IRR may consume only through a separately governed additive boundary |

This act adopts that direction without accessing or modifying IPD. It does not turn IRR
into the owner of the user-portfolio domain.

### 2.4 D91 preservation

The authoritative D91 competence and mechanism records were verified on `origin/main` and
are preserved without mutation:

| Record | Blob | SHA-256 |
|---|---|---|
| `docs/integration/NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT.md` | `4bb191a60dc1e5578bc0947824275704719566bf` | `7e7e7f03094497168660f268a0c31ae9fdb5cb8d61a1008360dd1e2fe3c6e0b4` |
| `docs/integration/NP-08-D91-RELIEF-MECHANISM-ACT.md` | `f61325ee3d3121467ca29c731440e0e233a44165` | `471d3159148cbdc50731b9744828640da8becc32764a5f216d77ff585f116838` |

D91 is unrelated to the D115 identity contract. Its competence, mechanism, relief state,
and historical boundaries remain governed by those records; this act neither reopens nor
reinterprets them.

### 2.5 Reconciled G3 and protected boundaries

The contract preserves the existing G3 conceptual path:

```text
validated Keycloak/OIDC identity
        → ValidatedIdentity
        → server-side EnterpriseRuntime.Principal
        → platform tenant validation
        → D115 binding resolution
        → company authorization
```

It does not create a parallel principal, weaken G3, reopen NP-12/PIT/IU-8, or change the
protected IRR reference-portfolio and market-data boundaries.

---

## 3. Accepted conceptual identity model

The following are separate conceptual objects. A matching string in one namespace is never
an identity in another namespace merely because the strings happen to be equal.

| Object | Meaning | Authority / custody | D115 use |
|---|---|---|---|
| External authentication identity | Validated OIDC issuer/subject and claims | Keycloak/OIDC authentication authority | Authentication input only |
| Application Principal | Server-side authenticated application actor, represented by the existing `EnterpriseRuntime.Principal` contract | IIPS server/platform | Authentication-to-authorization subject |
| Owner/Account | Durable application ownership/account context for user-owned capability and company membership | G-2-governed durable user-portfolio/application domain | Ownership and delegation context; not an OIDC subject |
| Tenant | Platform isolation and authorization boundary | IIPS platform tenant authority | Tenant validation and resource isolation |
| Company entity | The domain company represented by canonical identity | Company Identity Authority | Domain object behind canonical CompanyId |
| Canonical CompanyId | Opaque, globally unique, authority-assigned company identity | Company Identity Authority / canonical company-identity domain | Only authoritative company identity for D115 |
| Company Binding | Durable relationship connecting one Owner/Account and one Tenant to one canonical CompanyId, with state and provenance | G-2-governed durable identity/application boundary, consumed by IRR through a governed contract | Eligibility for a governed company context |
| Runtime Company Context | Immutable request-time projection containing one validated canonical CompanyId and its binding evidence | IIPS server/runtime boundary | Authorization input; not a new identity |
| Resource canonical CompanyId | Server-owned company identity on a company-scoped resource | Resource-owning domain and canonical authority contract | Equality target for company authorization |

### 3.1 Authority separation

1. Keycloak/OIDC authenticates the external identity. It does not assign or authorize
   CompanyId.
2. IIPS server/platform validation creates the application Principal, validates the Tenant,
   performs RBAC, and records authorization decisions.
3. The Company Identity Authority assigns and reports canonical CompanyId and its identity
   state. It is not replaced by a provider identifier, Keycloak, a frontend, or a tenant.
4. The G-2-governed durable user-portfolio/application domain owns the durable Owner/Account,
   membership, and binding relationship. G-2 assigns the durable portfolio boundary to IPD;
   IRR consumes it only through the additive contract in §13.
5. IRR enforces the runtime and resource authorization boundary for its own requests. A
   runtime cache, DTO, or in-memory development map may not become the durable binding
   authority.

### 3.2 Non-collapse rule

The following equations are expressly rejected:

```text
Principal = Owner
Owner    = Tenant
Tenant   = Company
Company  = CompanyId
```

A Principal may be associated with an Owner/Account, but that relationship is explicit and
server-governed. A Tenant may contain multiple company memberships, but Tenant is not a
CompanyId. A CompanyId identifies a company entity; it does not identify a principal, owner,
tenant, resource, sector, or provider record.

---

## 4. Principal, Owner, Tenant, and Company relationship contract

### 4.1 Cardinalities

The accepted cardinalities are:

| Relationship | Accepted cardinality and rule |
|---|---|
| Principal → Owner/Account | `0..*` over the life of the relationship. A principal may access multiple explicit owner/account contexts, including delegated/shared contexts. A company-scoped runtime context selects exactly one. |
| Owner/Account → Principal | `1..*` may be associated by explicit membership/delegation. Sharing an owner does not merge principals or remove per-principal authorization. |
| Owner/Account → Tenant | `0..*`. An owner may belong to multiple tenants through explicit effective memberships. A runtime context uses exactly one validated tenant. |
| Tenant → Owner/Account | `0..*`. Tenant membership does not establish company membership. |
| Tenant → Company | `0..*`. A tenant may contain multiple canonical companies through explicit bindings. |
| Company → Tenant | `0..*`. A canonical company may be bound to multiple tenants; each relationship is independently authorized and versioned. |
| Owner/Tenant → active company memberships | `0..*` at the domain level. Multiple active company memberships are allowed. |
| One governed runtime context → CompanyId | **Exactly one** active, unambiguous canonical CompanyId. |

Zero eligible owner, tenant, or company relationships is not converted into a default by
inference. It is a denial for a company-scoped operation.

### 4.2 Context cardinality invariant

The accepted invariant is:

```text
one governed runtime context
        = exactly one active, unambiguous canonical CompanyId
```

The context also contains exactly one resolved Principal, Owner/Account, Tenant, and Binding.
A principal's ability to have several memberships does not permit several CompanyIds in one
request context.

### 4.3 Ownership and membership

The Owner/Account is the application ownership context; the Principal is the authenticated
actor. A principal may act for an owner only through an active, server-governed principal-
to-owner relationship. A company binding is valid only when both the principal-to-owner and
owner-to-tenant relationships are valid at the context's effective time.

Roles are action permissions. They do not identify an owner, select a tenant, or assign a
company.

---

## 5. Company selection, defaults, and switching

### 5.1 Selection decision

Explicit company selection is permitted. Selection is a request for server resolution, not
an identity assertion. A client may provide an untrusted selection hint, preferably an
opaque Binding reference; a client-supplied CompanyId is also only a hint and is never an
authoritative value.

A default company is permitted only when the authority has durably designated exactly one
valid default for the relevant `(Owner/Account, Tenant)` context. The default is server-
owned, effective-dated, versioned, and revalidated like every other binding. A client cannot
create, change, or promote a default.

The resolution rules are:

1. If exactly one eligible binding exists, the server may resolve it without a client hint.
2. If several eligible bindings exist and one valid authoritative default exists, the server
   may resolve that default.
3. If several eligible bindings exist and no valid authoritative default exists, the server
   denies company-scoped access until the client supplies a selection hint that resolves to
   exactly one eligible binding.
4. A missing, stale, conflicting, or invalid hint never causes a first-record, role-based,
   tenant-based, or best-effort selection.
5. A hint that cannot be resolved to the principal's eligible owner/tenant binding is
   denied; the server does not silently substitute another company.

### 5.2 Switching decision

Company switching is permitted only through a new governed request context.

- Switching does not require a new OIDC authentication session by itself.
- The server invalidates the prior request/session selection hint, cached company
  authorization decisions, and prior runtime Company Context for subsequent use.
- The new request re-resolves Principal, Owner/Account, Tenant, Binding, authority state, and
  binding versions; it does not mutate the durable binding.
- A switch cannot occur inside an already-authorized company-scoped operation.
- A binding or owner/tenant change cannot be made effective by a switch request; changes are
  separate authority-controlled lifecycle operations.

The client value remains a selection hint only:

```text
client selection != authoritative CompanyId
```

No client value can establish or mutate a durable binding.

---

## 6. Company Identity Authority contract

### 6.1 Conceptual custodian

The conceptual custodian is the **IIPS canonical company-identity / SecurityMaster
authority** designated by the program's identity domain. It is a logical authority role, not
a vendor, provider, database, protocol, or implementation selection. It is distinct from
Keycloak/OIDC, the IRR server, a tenant, a portfolio owner, and any market-data provider.

The authority owns:

- assignment of the opaque canonical CompanyId;
- the canonical company identity record and identity lifecycle;
- canonicalization and conflict decisions;
- authority-version and provenance information;
- merge, split, replacement, and retirement decisions for company identity; and
- the authoritative response used to validate a binding.

The durable Owner/Account/Tenant/Binding relationship remains in the G-2-governed durable
application boundary. Company identity authority and binding authority are related but are
not collapsed into one namespace.

### 6.2 Resolution input and evidence

The authority resolves a company using an authority-owned binding/reference request and the
canonical identity evidence governed by the company-identity domain. At binding creation or
change, external identifiers such as ticker, ISIN, FIGI, or provider references may be
submitted as evidence to the authority; they are not canonical output and cannot be used by
IRR as CompanyId.

At runtime, the resolution input is:

- the server-resolved Owner/Account and Tenant;
- the opaque Binding identity or authority-issued membership reference;
- the requested effective time; and
- the authority and binding versions available to the server.

A raw client CompanyId, provider identifier, Screen reference, sector value, or frontend DTO
is not sufficient input for authoritative runtime resolution.

Authoritative evidence must identify, at minimum:

- the canonical CompanyId;
- the authority identity and provenance of the assignment;
- the company identity state;
- the binding applicability to the resolved Owner/Account and Tenant;
- the binding identity and lifecycle state;
- effective time and, where applicable, expiry;
- binding version and authority mapping version; and
- the decision or evidence classification needed for audit.

### 6.3 Authority response and IRR representation

IRR receives the canonical CompanyId directly in a verified authority/binding result because
IRR must compare it with a resource's canonical CompanyId. The result also carries an opaque
Binding identity and binding/authority versions for provenance and stale-context detection.

The Binding identity is not a substitute CompanyId. A reference handle may identify a binding;
it never changes the canonical CompanyId namespace.

The result is accepted only when the server can verify that it came from the designated
authority contract and that the returned Owner/Account, Tenant, CompanyId, state, effective
time, and versions are mutually consistent. The verification mechanism is intentionally
implementation-neutral.

### 6.4 Assignment, conflict, invalidity, and lifecycle

- Only the Company Identity Authority assigns a canonical CompanyId.
- A CompanyId is opaque, globally unique within the IIPS canonical identity authority, stable
  for its company identity, and never recycled for a different company.
- A conflict or ambiguous mapping is not resolved by choosing the first or most recent
  source. The mapping is rejected or placed in an authority-controlled conflict state;
  activation is denied until the authority resolves it.
- An invalid, non-canonical, retired, or malformed identifier is rejected. No case-folding,
  trimming, aliasing, provider substitution, or synthetic conversion is allowed at the D115
  boundary.
- A merge, split, correction, or replacement is an authority-controlled lifecycle event.
  The prior identity/binding remains historically attributable; a new CompanyId is used only
  when the authority determines that a new company identity is required.
- Canonical identity changes do not silently rewrite an active binding. The old binding is
  suspended, revoked, or replaced according to §7, and a new binding/version is required.

### 6.5 State, version, and availability

The authority exposes company and mapping state sufficiently to distinguish active from
suspended, revoked, retired, replaced, conflicting, and not-yet-effective identity. State
transitions carry effective time, reason, provenance, and a monotonic authority mapping
version.

Binding version and authority mapping version are independent version identities. Both are
carried in a runtime context and checked for compatibility. A version mismatch is a security
failure requiring fresh resolution, not an advisory warning.

If the authority is unavailable or cannot provide a verifiable current result, IRR denies
company-scoped access. It may attempt a fresh resolution after availability returns, but it
may not use a stale cached response, last-known-good CompanyId, or previously issued context
as a fallback.

### 6.6 Scope

Canonical CompanyId is globally unique within the designated IIPS canonical identity
namespace, not scoped by tenant, owner, sector, provider, or request. Authorization remains
scoped: global identity uniqueness does not grant any tenant or principal access.

---

## 7. Company Binding lifecycle contract

### 7.1 Logical state vocabulary

The binding state vocabulary is:

```text
                 ┌──────────────┐
PROPOSED → ACTIVE ↔ SUSPENDED
              │       │
              ├──────→ REVOKED ─────→ REMOVED
              └──────→ REPLACED ────→ REMOVED
```

`EXPIRED` is a derived non-active condition when an effective interval ends; it is not a
permission to reuse the binding. `REVOKED` and `REPLACED` are terminal security outcomes for
the old Binding identity. A replacement is created as a separate Binding identity and enters
its own lifecycle.

### 7.2 State rules

| Lifecycle point | Contract decision |
|---|---|
| Creation | A unique Binding identity is created with Owner/Account, Tenant, canonical CompanyId reference, provenance, requested effective interval, and `PROPOSED` state. It is not usable. |
| Activation | The authority has resolved an unambiguous canonical CompanyId; principal/owner and owner/tenant memberships are valid; required approval/evidence exists; the effective interval is valid; and the binding is committed with an initial version. |
| Effective use | A binding is usable only while `ACTIVE`, within its effective interval, current at its binding and authority versions, and valid for the resolved Principal, Owner/Account, and Tenant. |
| Suspension | A temporary denial state. It has an effective time and reason and immediately prevents new context issuance after that time. |
| Reactivation | A `SUSPENDED` binding may be reactivated only by a new authoritative lifecycle transition while its identity has not been revoked, replaced, or removed. Reactivation increments the binding version. |
| Revocation | A terminal security state caused by invalidity, loss of authority, or explicit revocation. It immediately prevents new context issuance after its effective time. |
| Restoration | A `REVOKED` binding cannot be restored. A new governed binding is required. |
| Replacement/change | A material target change—Owner/Account, Tenant, canonical CompanyId, authority assignment, or membership scope—uses a new Binding identity and explicitly retires/replaces the prior one. A non-target material change still increments the existing binding version. |
| Removal/deletion | Removal is logical at contract level. The record, provenance, transition history, and audit evidence remain during required retention; physical erasure is a separately governed retention/privacy action and cannot make an identity or Binding identity reusable. |

### 7.3 Effective time and history

Effective intervals use an unambiguous UTC time basis with an inclusive start and exclusive
end. Future transitions do not authorize use before their effective time. There must not be
two simultaneously active, conflicting versions for one Binding identity or two active
records that make one requested Owner/Account/Tenant selection ambiguous.

Every lifecycle transition is recorded as an immutable history item containing prior state,
new state, effective time, actor/authority, reason, provenance, and resulting version.
Historical provenance is retained even when a company is replaced, merged, split, or removed.

### 7.4 Existing contexts and concurrent lifecycle changes

A runtime context is not a durable permission grant. It is valid only for its request lifetime
and only while its binding and authority versions pass the checks in §8.

- A newly suspended, revoked, replaced, or removed binding cannot issue a new context.
- A request that discovers the change before a company authorization decision is denied.
- A long-running or mutating operation must revalidate at each governed company authorization
  boundary and must compare the expected binding version before committing a protected change.
- If revocation or version change is discovered after a completed authorization decision,
  the contract does not claim impossible mid-instruction cancellation; the operation remains
  bounded by the server's authorization/transaction boundary and is audited. Subsequent
  requests cannot reuse the context.
- Owner or Tenant changes invalidate the old context in the same way as a binding change.

### 7.5 Version rule and stale detection

Every material lifecycle or relationship change increments the binding version. A target
change additionally requires a new Binding identity. A runtime context includes Binding
identity, Binding version, authority mapping version, and effective/expiry information. A
context is stale when any required version, state, effective interval, Owner/Account, Tenant,
or authority result no longer matches the current authoritative relationship.

---

## 8. Runtime Company Context contract

### 8.1 Definition

`runtimeCompanyId` is the server-derived, immutable projection of the canonical CompanyId in
the current governed context:

```text
runtimeCompanyId = server-derived canonical CompanyId
runtimeCompanyId != client-supplied CompanyId
```

It is not a new identity, an alias, or a client-selected authority.

A logical Runtime Company Context contains, at minimum:

- the validated application Principal reference;
- exactly one Owner/Account reference;
- exactly one validated Tenant reference;
- one opaque Binding identity;
- the current Binding version;
- the canonical CompanyId, exposed as `runtimeCompanyId`;
- the current authority mapping version;
- context-issued time, effective/expiry information, and correlation identity; and
- the authority/provenance classification required for downstream verification.

### 8.2 Scope and creation

The security context is **request-scoped** and immutable. It is created only after:

1. OIDC authentication has been validated;
2. the server has created/validated the application Principal;
3. the Tenant and Owner/Account relationship has been resolved and authorized;
4. the active, unambiguous Company Binding has been resolved from the designated authority;
5. CompanyId, state, effective time, Binding version, and authority version have passed
   validation; and
6. the request has reached the pre-company-authorization server boundary.

A session may retain an untrusted owner/company selection hint and a non-authoritative cache
key to improve user experience, but it does not retain an authoritative reusable
`runtimeCompanyId`. Each request creates a fresh security context and revalidates its
binding. A session hint is never a substitute for request resolution.

### 8.3 Validity, refresh, and invalidation

- The context is valid for the request and for the governed company authorization decisions
  within that request.
- Each request performs current resolution. A long-running request or stream revalidates at
  each company authorization boundary or before its context lease expires.
- A binding version change, authority mapping change, suspension, revocation, replacement,
  expiry, Owner/Account change, or Tenant change invalidates the context.
- Invalidated contexts are denied and discarded. They are not refreshed in place and are not
  reused for another request.
- A company switch creates a new request context; it does not mutate the old context.
- No context is created when any required relation is absent, ambiguous, stale, inactive,
  unavailable, or unauthorized.

### 8.4 Semantic distinctions

| Concept | Meaning | What it can establish |
|---|---|---|
| Authenticated Principal | Server-validated actor resulting from the approved authentication path | Who is acting; not which company is active |
| Validated Tenant | Server-validated platform isolation boundary associated with the Principal/Owner context | Which tenant boundary applies; not CompanyId |
| Company Binding | Durable, versioned relationship from Owner/Tenant to one canonical CompanyId | Whether the context is eligible for that company |
| `runtimeCompanyId` | Immutable server projection of the current valid Binding's canonical CompanyId | Which one company the current request may authorize against |
| Client selection | Untrusted request preference or hint | At most which binding the server should try to resolve |

---

## 9. Trust and authorization boundaries

### 9.1 Trust flow

The accepted trust flow is:

```text
Keycloak/OIDC authentication
        ↓
validated identity adapter / ValidatedIdentity
        ↓
server-side EnterpriseRuntime.Principal
        ↓
platform Tenant validation
        ↓
Owner/Account relationship validation
        ↓
Company Identity Authority + durable Binding validation
        ↓
immutable request Runtime Company Context
        ↓
RBAC + membership + resource CompanyId authorization
        ↓
allow or deny
```

The trust boundary is server-side. React state, URL/query/body values, local storage,
unvalidated headers, frontend DTOs, provider identifiers, and client-created claims are
untrusted inputs. Keycloak validates authentication; it does not authorize CompanyId.

### 9.2 Company authorization decision

Company authorization is **both membership-based and role-based**:

- active Principal → Owner/Account and Owner/Account → Tenant relationships establish
  membership eligibility;
- an active Company Binding establishes eligibility for one canonical company; and
- the server-side role/action policy authorizes the requested operation.

A tenant administrator does **not** automatically span all companies. An administrator must
still resolve an active binding for the target company for a company-scoped operation. A
separate tenant-wide administrative operation may be authorized as a tenant-scoped resource,
but it cannot be used to bypass company authorization.

Cross-company access within one governed runtime context is not permitted. A multi-company
report or operation must be decomposed into separately authorized company contexts under a
separate governance decision; D115 does not create a multi-CompanyId exception.

### 9.3 Resource scope and invariant

A resource-owning domain exposes a server-owned canonical CompanyId for every
company-scoped resource. The client cannot assign or rewrite that value. The resource value
must have been resolved by the same canonical Company Identity Authority namespace.

For a company-scoped resource, the exact invariant is:

```text
authorized Principal/Owner/Tenant context
AND active, current Company Binding
AND runtimeCompanyId == resource canonical CompanyId
AND requested action is permitted by role/policy
```

If a resource is declared company-scoped but has no canonical CompanyId, access is denied;
the resource is not assigned a tenant, user, sector, Screen reference, or synthetic fallback.

A genuinely tenant-scoped resource may exist without a CompanyId. It is authorized only by
its explicit tenant scope and RBAC policy, is not a company-scoped resource, and does not
establish, imply, or substitute for a CompanyId. A tenant-scoped read cannot be used to
authorize a company-scoped write or read.

---

## 10. Fail-closed contract

### 10.1 Common rules

`DENY` is the semantic result for every binding or company-authorization failure below.
The existing G3 authentication/authorization surface may map unauthenticated requests to
its established authentication response and authenticated denials to its established
authorization response; exact transport status codes are not a new D115 authority.
Internal audit records the precise failure classification without leaking binding details to
an unauthorized caller.

For every row:

- no context is created unless the row explicitly permits a new context after fresh
  resolution;
- a stale context is never reused;
- no fallback to `tenantId`, `userId`, role, sector, Screen reference, `${sector}-H1`,
  provider identifier, frontend DTO, PIT fixture identity, or any other non-canonical value
  is permitted; and
- the event and decision are audited under §12.

### 10.2 Required condition matrix

| Condition | Denial behavior | Retry / re-resolution | Context creation and stale reuse | Audit requirement |
|---|---|---|---|---|
| Missing binding | Deny company-scoped access; do not infer membership | Resolve only after a governed binding is created or a valid eligible relationship is supplied; no automatic fallback | No context; a prior context is not reusable | Principal, Owner, Tenant, missing relation, decision, reason |
| Ambiguous binding | Deny; do not choose first, newest, default-by-accident, or role-based company | Authority must remove ambiguity or an explicit valid selection must resolve exactly one binding | No context; no prior context reuse | Candidate ambiguity, selection input, authority/version state, decision |
| Inactive binding | Deny outside its effective interval or non-active state | A later effective transition may be resolved in a new request; no bypass | No context; inactive prior context is stale | State, effective time, binding/version, decision |
| Revoked binding | Deny immediately from the effective revocation point | No automatic restoration; a new binding is required | No context; revoked context is never reused | Revocation reason, authority, effective time, version, decision |
| Stale binding | Deny the request using the stale context | Freshly resolve current binding and both versions in a new request | Old context discarded; no last-known-good reuse | Expected/current versions, correlation, decision |
| Tenant mismatch | Deny and preserve tenant isolation | Re-authenticate or establish a separately valid tenant context; never retry across tenant | No context for the mismatch; old context not reusable | Principal, claimed/resolved tenant classification, decision |
| Owner mismatch | Deny; principal cannot act through another owner implicitly | Freshly resolve an active principal-owner relationship or use an explicit authorized owner selection | No context; old owner context not reusable | Principal, owner references, relationship/version, decision |
| Resource CompanyId mismatch | Deny; do not switch the request to the resource's company | A new request may resolve another eligible binding through normal selection | No new context within the request; current context remains denied | Runtime CompanyId, resource CompanyId, binding/version, decision |
| Invalid CompanyId | Deny; authority rejects malformed, non-canonical, conflicting, retired, or unknown identity | Correct through the authority and re-resolve; no local normalization or substitution | No context; invalid input never becomes context | Input classification without trusting it, authority result, decision |
| Unauthorized company access | Deny even when Principal and Tenant are valid | Retry only after an independently authorized membership/role change and fresh resolution | No context for the unauthorized target; no prior context reuse for it | Action, Principal/Owner/Tenant, CompanyId, policy reason, decision |
| Binding authority unavailable | Deny company-scoped access; do not fail open | A fresh request may retry after availability returns | No context; stale/cache/last-known-good result prohibited | Availability failure, attempted authority/version, decision |
| Binding version conflict | Abort/deny the operation; never last-writer-wins a security change | Reload current state and re-resolve in a new request/transaction attempt | Conflicting context discarded | Expected/current version, operation, decision |
| Client-supplied CompanyId | Treat only as an untrusted hint; do not accept it as identity | Resolve the server-side binding; if hint conflicts or cannot resolve, deny rather than silently substitute | No context from the client value; any prior context not reused | Hint present, mismatch/classification, server result, decision |

### 10.3 No substitute identity

The following can never substitute for canonical CompanyId:

```text
tenantId
userId
role
authentication subject or username
sector
Screen reference
(sector, referenceId)
${sector}-H1
provider ticker / ISIN / FIGI
frontend DTO companyId
PIT fixture company key
```

---

## 11. Logical persistence contract

This section defines logical architecture only. It selects no database, storage engine,
serialization technology, API, schema language, vendor, or deployment arrangement.

### 11.1 Logical record decomposition

The durable identity/binding boundary contains, or references under its authority, at least:

1. **External Identity Link** — validated issuer/subject reference to application Principal;
   never a CompanyId.
2. **Application Principal reference** — stable server identity used by authorization.
3. **Owner/Account record** — stable owner identity and lifecycle.
4. **Principal–Owner membership** — explicit principal-to-owner relationship, state, effective
   interval, delegation/role provenance, and version.
5. **Tenant record/reference** — stable tenant identity and lifecycle under platform authority.
6. **Owner–Tenant membership** — explicit relationship, state, effective interval, and
   version.
7. **Canonical Company reference** — CompanyId and authority/mapping version as an authority
   reference; IRR does not create a competing canonical company record.
8. **Company Binding** — Binding identity, Owner, Tenant, canonical CompanyId, lifecycle
   state, effective interval, authority provenance, current version, and audit correlation.
9. **Binding transition history** — immutable lifecycle transitions and material changes.
10. **Authority resolution/provenance record** — evidence that the canonical mapping and
    binding result were obtained from the designated authority.
11. **Authorization/security audit records** — decisions and context correlations defined in
    §12.

The G-2-owned portfolio records remain in the IPD-owned user-portfolio domain. They may
reference the stable Owner, Tenant, canonical CompanyId, and binding/version contract but do
not transfer portfolio-domain ownership to IRR.

### 11.2 Logical keys and uniqueness

- External identity uniqueness is scoped by validated issuer and subject; it is never reused
  as CompanyId.
- Principal, Owner, Tenant, and Binding identities are separate opaque logical keys.
- Canonical CompanyId is globally unique within the canonical Company Identity Authority and
  is never reused for a different company.
- A Binding identity is immutable and unique. A target change creates a new Binding identity;
  lifecycle changes retain the Binding identity and increment its version.
- There may be multiple active bindings for different companies under one Owner/Tenant. There
  must be no duplicate active binding that makes the same requested relationship ambiguous.
- At most one valid authoritative default exists for a given `(Owner/Account, Tenant)`
  selection context.
- A resource's canonical CompanyId is typed as a D115 canonical identity, not a generic
  `companyId` field from another namespace.

### 11.3 State, time, version, and concurrency

- Binding states are those in §7.1; active use requires current effective time and state.
- Effective intervals use UTC, inclusive start, exclusive end, and explicit absence of an
  expiry when appropriate.
- Every material change increments a monotonic Binding version. The authority mapping has a
  separate monotonic mapping version.
- Lifecycle transition, current state/version, and its required audit/provenance are
  atomically visible as one logical change. A partially visible transition cannot authorize
  a request.
- Security reads use a consistency point sufficient to establish current state, versions,
  and effective time together. A cache may assist lookup but is never the authoritative
  source and cannot be used when freshness/authority cannot be verified.
- Concurrent updates use expected-version comparison. A conflict aborts the operation and
  requires fresh resolution; it is not silently overwritten.
- Authority mapping and binding activation need not share a physical transaction, but a
  binding cannot become active unless it records and validates the authority result/version
  on which it depends. Any cross-boundary inconsistency fails closed.

### 11.4 Retention and deletion

Binding identity, lifecycle provenance, authority evidence, and security audit are retained
for the applicable governed retention period. Removal is logical first. Physical deletion or
privacy erasure is a separately authorized policy operation and must not erase the minimum
lineage needed to explain a security decision or make an old identity reusable.

### 11.5 Authoritative-source invariant

The following invariants are mandatory:

```text
in-memory state != authoritative durable binding source
PIT storage       != D115 binding persistence
```

IRR may maintain a non-authoritative runtime projection or cache only if the current
authority, state, effective time, and versions are revalidated as required by §8 and §10.

---

## 12. Audit and provenance contract

### 12.1 Event classes

Binding lifecycle audit and security authorization audit are separate logical event classes,
but they share correlation fields so that an authorization decision can be traced to the
binding state that produced it.

Required lifecycle events include:

- Principal–Owner creation, change, suspension, revocation, and removal;
- Owner–Tenant membership creation, change, suspension, revocation, and removal;
- Binding proposal and creation;
- activation and effective-use transition;
- suspension and reactivation;
- revocation, replacement, expiry, and logical removal;
- canonical identity assignment, conflict, correction, merge, split, retirement, or
  authority-version change; and
- authority availability, invalid response, and version conflict where they affect a
  binding decision.

Required security events include:

- context resolution and context issuance;
- explicit company/owner selection and switching;
- allow and deny decisions for company-scoped resources;
- tenant/owner/company/resource mismatch;
- invalid, stale, ambiguous, revoked, inactive, or unauthorized binding outcomes; and
- G-2 boundary requests and corresponding portfolio-domain decisions where the boundary is
  used.

### 12.2 Minimum fields

Each applicable lifecycle or security event records, or explicitly records absence of:

- event timestamp and effective timestamp where distinct;
- correlation/request/context identity;
- authenticated Principal reference and external identity provenance when permitted;
- Owner/Account reference;
- Tenant reference;
- canonical CompanyId, when resolved;
- Binding identity and Binding version;
- canonical authority identity and authority mapping version;
- lifecycle transition or authorization decision;
- allow/deny result;
- resource and action, when applicable;
- actor/initiator or authority provenance;
- reason/failure classification; and
- prior/current state or expected/current version where relevant.

Sensitive authentication claims are not copied merely for audit convenience. Audit identity
references must remain linkable to the governing authority without creating a second identity
namespace.

### 12.3 Retention, integrity, and correlation

Lifecycle evidence is immutable for its retention period. Revocation/suspension evidence
must preserve who/what authority made the transition, its effective time, previous and new
state, reason, and version. Security authorization evidence must correlate the decision to
the exact Binding and authority versions used.

The exact retention duration, event serialization, and physical audit store are
implementation details to be selected under a later implementation authorization, but
retention must be sufficient to reconstruct the binding and authorization decision and may
not be shortened by the D115 runtime cache.

---

## 13. G-2 additive boundary

### 13.1 Ownership remains unchanged

```text
IPD owns the durable user-portfolio domain.
IRR does not become the owner of that domain.
```

IRR does not create a second durable user-portfolio domain, repurpose PIT, or write the
IPD-owned portfolio through a convenience abstraction. The boundary below is a separate,
minimal, additive, independently governed contract. IPD was not accessed during this gate.

### 13.2 Information crossing the boundary

The IRR-facing semantic context may carry exactly the information needed to authorize and
scope the requested portfolio-domain operation:

- opaque application Principal reference;
- opaque Owner/Account reference;
- validated Tenant reference;
- canonical CompanyId directly, in the D115 canonical namespace;
- opaque Binding identity;
- current Binding version and authority mapping version;
- active status/effective-time evidence; and
- request/context correlation and contract version.

Raw OIDC claims, provider identifiers, frontend DTO values, Screen references, sector values,
PIT fixture keys, and client assertions do not cross as authority. IRR sends the canonical
CompanyId directly because resource and portfolio ownership must be compared in the same
canonical namespace; the Binding identity/version accompanies it for provenance and stale
context detection.

### 13.3 Responsibility split

- **Company Identity Authority:** owns canonical company identity and mapping state.
- **Binding/identity domain:** owns Owner/Account, membership, Binding lifecycle, and binding
  provenance under the G-2 durable boundary.
- **IRR:** authenticates the request through G3, resolves and enforces the D115 context for
  IRR resources, sends only an authorized current context, and records the IRR-side
  security decision.
- **IPD:** remains responsible for its portfolio-domain authorization, owner/tenant/company
  isolation, portfolio provenance, and its own domain decision. It does not treat an IRR
  message as permission to bypass its own authorization boundary.

Both sides fail closed if the context is missing, invalid, stale, version-incompatible,
unauthorized, or inconsistent with the requested resource. IRR does not obtain authority by
copying a portfolio record, and IPD does not obtain authority from a client-selected value.

### 13.4 Failure, version, audit, and transaction semantics

- Unavailable authority or unavailable additive boundary results in no protected portfolio
  access and no fallback to stale local state.
- The consumer and provider negotiate an explicit semantic contract version. Unknown or
  security-incompatible versions are rejected; no downgrade may remove binding, CompanyId,
  tenant, or audit semantics.
- The context is a snapshot tied to one Binding and authority version. A version mismatch
  requires fresh resolution; it is not silently tolerated.
- IRR's boundary is read-only from IRR's perspective for the identity/binding and portfolio
  capability described here. IRR cannot create, mutate, revoke, or delete the durable
  Owner/Account, Binding, or IPD portfolio through this additive consumption contract.
- There is no assumption of a distributed transaction. Each domain commits only its own
  authoritative records, and cross-domain operations use explicit correlation and
  fail-closed consistency checks. Portfolio mutation, if separately authorized later,
  remains an IPD-owned operation.
- IRR owns its request/security audit; IPD owns portfolio-domain access, lineage, and
  portfolio audit. Correlation identity and Binding/version references allow the records to
  be reconciled without merging ownership.

No concrete API path, transport protocol, schema, database, or IPD implementation is
selected by this act.

---

## 14. Namespace separation and collision safety

The following namespaces are explicitly distinct from D115 canonical CompanyId and must not
be redefined or reused as it:

| Existing value/namespace | D115 treatment |
|---|---|
| NP-12 caller/request `companyId` | Caller/request or Screen/member identity as governed by NP-12; not D115 CompanyId |
| `(normalized sector, referenceId)` | NP-12/N4 opaque reference identity; not a company identity |
| `${sector}-H1` | Synthetic reference/SNAPSHOT transport value; never CompanyId or `runtimeCompanyId` |
| PIT fixture company key | Test/fixture or market-data identity; not D115 binding persistence or canonical identity |
| Frontend DTO `companyId` | Untrusted transport/display field; cannot establish or authorize D115 identity |
| `tenantId` | Platform isolation identity; not CompanyId |
| OIDC subject/username | External authentication identity; not CompanyId |
| Provider ticker, ISIN, FIGI, or other provider identifier | Evidence/input to canonical resolution at most; never canonical CompanyId without authority assignment |
| `EQ_*` data-record identity | Governed data-record namespace; not the D115 runtime CompanyId format |
| Screen reference, sector, route, role, or user ID | Context or authorization data; not CompanyId |

Collision safety is semantic, not string-based. A value is accepted as D115 CompanyId only
when it is typed/provenanced as an authority-issued canonical identity and is valid at the
current authority and binding versions. Equal text from another namespace is still a
namespace mismatch and fails closed. No aliasing, case folding, trimming, coercion, or
synthetic value generation bridges the namespaces.

---

## 15. Explicitly rejected alternatives

This contract rejects the following alternatives:

1. Collapsing Principal, Owner/Account, Tenant, Company, CompanyId, and runtime context into
   one identity object.
2. Treating Keycloak/OIDC, a provider, a ticker/ISIN/FIGI, a Screen reference, NP-12
   `companyId`, `${sector}-H1`, an `EQ_*` record, a PIT fixture key, or a frontend DTO as
   canonical CompanyId authority.
3. Accepting a client-supplied CompanyId as authoritative or allowing it to mutate a durable
   binding.
4. Selecting the first, newest, arbitrary, or role-derived company when bindings are missing
   or ambiguous.
5. Granting tenant administrators automatic company-wide access without a valid active
   company binding.
6. Allowing more than one CompanyId in one governed runtime context or permitting silent
   cross-company access.
7. Reusing stale contexts, caches, last-known-good authority results, tenant IDs, or other
   fallback identities when current authority resolution fails.
8. Making in-memory development state, PIT, market-data storage, or a frontend store the
   authoritative D115 binding persistence.
9. Duplicating or taking ownership of the G-2/IPD durable user-portfolio domain in IRR.
10. Resolving an authority conflict through best effort, last writer wins, or an
    implementation-local mapping.
11. Selecting a vendor, provider, database, protocol, schema, API path, or identity-provider
    change as if it were an architecture decision required by D115.
12. Treating architecture-contract acceptance as implementation, qualification, acceptance,
    certification, release, or production authority.

---

## 16. Implementation constraints and non-material details

Any later implementation-authorization act must preserve, at minimum:

- the cardinalities and one-CompanyId context invariant in §4;
- explicit, server-resolved selection and switching in §5;
- the Company Identity Authority contract and global canonical namespace in §6;
- lifecycle, effective time, version, history, and stale-context semantics in §7;
- a request-scoped immutable server-derived `runtimeCompanyId` in §8;
- the trust and equality authorization invariant in §9;
- every fail-closed condition in §10;
- the logical persistence and authoritative-source invariants in §11;
- audit/provenance and correlation requirements in §12;
- the G-2 additive ownership boundary in §13; and
- namespace separation in §14.

The following are intentionally non-material implementation details, not open architecture
decisions: concrete serialization and transport, physical persistence technology, concrete
status-code presentation, cache mechanics that cannot weaken freshness, organizational team
names beneath the conceptual Company Identity Authority, exact retention durations under
applicable policy, and UI wording for selection/disclosure. Those details may be selected
only if they preserve this contract and are covered by the later implementation gate.

No implementation is authorized by this section.

---

## 17. Remaining decisions and contradiction assessment

### 17.1 Material decisions

**None.** The material architecture decisions identified by the preceding readiness
investigation and this gate are explicitly resolved in §§3–16.

### 17.2 Material contradictions

**None identified.** The accepted contract is mutually consistent with:

- D115 Packet A–H and its canonical CompanyId / `runtimeCompanyId` semantics;
- existing G3 authentication, principal, tenant-isolation, RBAC, and server-side
  authorization boundaries;
- G-2 ownership of the durable user-portfolio domain and its additive IRR boundary;
- NP-12/N4 reference identity separation;
- PIT and market-data storage separation; and
- preservation of the D91 competence and mechanism records.

### 17.3 Non-material details reserved to implementation planning

Concrete protocol/transport, physical storage, schema representation, status-code mapping,
retention period, cache implementation, organizational operator names, and presentation
wording remain implementation-planning details. They are not permission to weaken or
reinterpret any accepted architecture invariant.

---

## 18. Implementation-authority boundary and acceptance

The accepted disposition is:

> **ARCHITECTURE CONTRACT ACCEPTED — READY FOR IMPLEMENTATION-AUTHORIZATION**

This means the architecture contract is sufficiently resolved for a subsequent,
separately authorized implementation-authorization act to evaluate and authorize bounded
implementation work. It does **not** mean implementation is authorized now.

Architecture contract accepted

≠

Implementation authorized

No authority is granted by this act for:

- source-code or test changes;
- persistence, database, or schema creation;
- API or UI changes;
- identity-provider or provider changes;
- G-2/IPD implementation or integration;
- qualification, acceptance, certification, or release;
- deployment or production activation; or
- any change to D91, D115 historical records, protected G3 foundations, NP-12, PIT, or
  other protected governance boundaries.

The next gate, and only the next gate recommended by this act, is a separately authorized
**D115 Implementation-Authorization Act**. That act must first reverify the authoritative
baseline and this contract before granting any bounded implementation authority.

---

## 19. Final contract statement

> **D115 architecture decision closure is accepted.** The identity objects, cardinalities,
> Company Identity Authority, binding lifecycle, request-scoped runtime Company Context,
> company authorization, fail-closed behavior, logical persistence, audit/provenance, G-2
> additive boundary, and namespace separation are now contractually defined without
> selecting implementation technology.
>
> **Architecture contract accepted ≠ implementation authorized.**
>
> No source, configuration, persistence, API/UI, identity-provider, G-2/IPD, qualification,
> acceptance, certification, release, or production work is authorized by this act.

**Recording agent:** Arena — investigation, recording, and verification only

**End of Architecture-Decision Closure / Contract-Acceptance Act.**

READ-ONLY ARCHITECTURE INVESTIGATION + GOVERNANCE CONTRACT CLOSURE ONLY.
NO IMPLEMENTATION AUTHORITY IS IMPLIED OR GRANTED.
