# NP-08 / D115 — IDENTITY / RUNTIME COMPANYID BINDING AUTHORITY ACT

> **Artifact ID:** `NP-08-D115-IDENTITY-RUNTIME-COMPANYID-BINDING-AUTHORITY-ACT-01`
> **Program:** Institutional Investment Platform System (IIPS)
> **Workstream:** M-4 / D115 — Identity / runtime CompanyId binding
> **Record type:** **CONSTITUTIVE GOVERNANCE AUTHORITY ACT** — non-executable
> **Deciding authority:** **Ramki (Ramakrishnan), IIPS Program Authority**
> **Recording agent:** `arena-agent` — investigation, recording, validation, and durability verification only; no implementation performed
> **Execution boundary:** NON_PRODUCTION IIPS GOVERNANCE ONLY
> **Authoritative repository:** `ramkivs/iips-review-recovered`
> **Authoritative remote:** `origin` → `https://github.com/ramkivs/iips-review-recovered.git`
> **Authoritative ref:** `main`
> **Recording date:** 2026-10-04 (Asia/Calcutta)
> **Effective point:** only on independently verified publication to authoritative `origin/main`
> **Pre-mutation baseline:** `main@2dc556380abc4493ceb269be9da98b463e21f635`; tree `b4084a3eee46fd06c84967559cb5774b2062a138`; `origin/main` equal; clean worktree
> **Prior D115 state:** `D115 PARTIALLY ESTABLISHED`; D115 authority and runtime CompanyId binding previously withheld/unresolved
> **Mutation scope:** one additive governance record; no historical record modification

---

## 1. AUTHORITY AND PURPOSE

Ramki, as IIPS Program Authority, authorizes this narrowly bounded act to constitute the
current non-production governance semantics for M-4 / D115 — Identity / runtime CompanyId
binding.

This act establishes the D115 authority boundary and the Packet A–H semantics below. It is a
governance decision, not an application, persistence, identity-provider, API, UI, deployment,
qualification, acceptance, certification, or production action.

The act is deliberately additive. Earlier D115, M-4, G3, NP-12, G-2, NP-04, NP-06, D8, D88,
and related records are preserved exactly as historical or antecedent records. They are not
rewritten. Their prior effective states remain accurate for their respective effective points.
This act establishes the current prospective D115 authority boundary only after authoritative
remote publication and independent verification.

### 1.1 Authority separation

| Authority plane | Decision in this act |
|---|---|
| Governance semantics | **ESTABLISHED by this act**, subject to durable publication and independent verification |
| Application implementation | **NOT AUTHORIZED** |
| Runtime code/configuration | **NOT AUTHORIZED** |
| Persistence implementation | **NOT AUTHORIZED** |
| Identity-provider change | **NOT AUTHORIZED** |
| API/UI change | **NOT AUTHORIZED** |
| Qualification | **NOT AUTHORIZED** |
| Acceptance | **NOT AUTHORIZED** |
| Certification | **NOT AUTHORIZED** |
| Production activation | **NOT AUTHORIZED**; `productionEligible` remains `false` |

No authority may be inferred from this act beyond the D115 governance semantics explicitly
recorded here.

---

## 2. GOVERNED TERMS AND NAMESPACE SEPARATION

This act uses the following distinct namespaces. No value may be moved between them by
inference:

| Namespace | Meaning | D115 treatment |
|---|---|---|
| External authentication identity | Validated Keycloak/OIDC subject and claims | Authentication input only; not CompanyId |
| Application principal | Server-side governed `EnterpriseRuntime.Principal` | Authoritative authorization identity |
| Owner identity | IIPS application owner/account context | Governed relationship context |
| Tenant identity | Platform-validated `tenantId` | Authorization/resource boundary; not CompanyId |
| Canonical CompanyId | Opaque canonical company identity returned by the designated Company Identity Authority | Authoritative company identity for D115 |
| `runtimeCompanyId` | Server-side runtime projection of the canonical CompanyId | Exact validated runtime binding; not a new identity |
| `EQ_*` data-record identity | Governed identity form used by applicable intelligence data records | Separate data-record namespace; not adopted as the D115 runtime format by this act |
| NP-12/N4 reference identity | Opaque `(normalized sector, reference identifier)` Screen identity | Separate namespace; no company identity semantics |
| Sector identifier | Engine/taxonomy/route context | Never a CompanyId |
| Synthetic `${sector}-H1` identifier | Existing reference/SNAPSHOT transport synthesis | Never a CompanyId or `runtimeCompanyId` |
| Provider ticker, ISIN, FIGI, or other source identifier | External/source identity | Never accepted as D115 runtime CompanyId without canonical authority resolution |

The existing NP-12 company/reference exclusion remains fully effective. The existing
G3 authentication, principal, tenant, and server-side authorization semantics remain fully
effective.

---

## 3. D115 PACKET A–H

### A — Application Principal

The authoritative IIPS application principal for D115 is the existing server-side
`EnterpriseRuntime.Principal` produced only after the approved authentication and tenant
validation path:

```text
Keycloak/OIDC validated identity
  → SessionValidator / KeycloakSessionValidator
  → ValidatedIdentity { subject, claims, expiry }
  → platform tenant resolution and validation
  → EnterpriseRuntime.Principal { userId, tenantId, roles }
```

The principal is authoritative only on the server/platform boundary. React, URL parameters,
localStorage, request bodies, unvalidated headers, and client-created claims are not principal
authorities.

D115 does not create a parallel v3 principal. The existing G3 `userId` construction remains
unchanged: the current validated adapter/executor may use the validated IdP
`preferred_username` and fall back to the validated OIDC subject. That implementation detail
is not a CompanyId source.

The D115 principal carries or is associated with a CompanyId binding through the server-side
D115 binding context defined in Packet F. A client does not choose that binding.

### B — Identity Custodian

Custody is separated by identity plane:

1. **Keycloak/OIDC** remains the custodian of external authentication identity, OIDC session
   lifecycle, authentication claims, and signing-key publication within the approved G3
   authentication architecture.
2. **IIPS server/platform authorization** remains the custodian of the validated application
   principal, tenant validation, resource isolation, RBAC, authorization, and audit decision.
3. **The D115 application CompanyId binding** is governed by IIPS and may be established only
   from the authoritative server-side Company Identity Authority and durable binding record
   defined in Packets C, E, and H. Keycloak is not the CompanyId custodian merely because it
   authenticates the principal.
4. **The durable owner/tenant/company relationship** remains within the G-2-governed durable
   user-portfolio/application domain boundary. G-2 identifies the IPD-owned durable portfolio
   boundary and permits only a separately governed additive IRR consumption boundary. This
   act does not modify or implement that boundary.

No frontend, transport-only layer, provider ticker, Screen reference, or in-memory development
store is a D115 identity custodian.

### C — Authoritative Company Identity

The authoritative semantic meaning of CompanyId is:

> **CompanyId is the opaque, canonical IIPS company identity assigned and returned by the
designated Company Identity Authority / canonical company-identity mapping. It identifies the
company entity in the application domain; it is not an authentication subject, owner identity,
tenant identity, sector, provider identifier, Screen reference identifier, or synthetic
reference value.**

The authoritative source is the governed canonical Company Identity Authority, including the
SecurityMaster/canonical company-identity mapping identified by the accepted G-2 architectural
direction. The source is authoritative only when the server receives an unambiguous canonical
assignment from that governed authority.

This act establishes the authority and assignment rule; it does not create a SecurityMaster,
company registry, entity record, provider resolver, or individual company data assignment.
Those are implementation/data-domain actions requiring separate explicit authorization.

The following are expressly not CompanyId authorities by themselves:

- `EQ_*` data-record identity syntax;
- `EQ_INFY_IN` or any other example value appearing in an M-4/D05 data-record contract;
- provider ticker or symbol;
- ISIN or FIGI source value before canonical resolution;
- Keycloak subject, username, audience, role, or tenant claim;
- `tenantId` or owner identity;
- NP-12 `referenceId`;
- sector name or engine identifier;
- `${sector}-H1` or any other transport-generated value;
- a client-supplied URL, header, body, or local-storage value.

A particular CompanyId value is valid for D115 only if the authoritative Company Identity
Authority assigns it and the server-side binding record accepts it. This act does not assign a
particular company entity value.

### D — Runtime CompanyId

The governed runtime field is:

> **`runtimeCompanyId`**

Its semantic meaning is:

> **`runtimeCompanyId` is the server-side, request/session-context projection of the canonical
CompanyId selected by the authoritative principal → owner/tenant → company binding. It must be
byte-for-byte equal to that canonical CompanyId and is not an independently generated identity.**

Runtime rules:

| Rule | D115 decision |
|---|---|
| Field name | `runtimeCompanyId` |
| Value source | Server-side lookup of the active, authoritative durable binding against the canonical Company Identity Authority |
| Client source | Never accepted from URL, query, body, localStorage, unvalidated header, frontend state, or client-created claim |
| Validation | Presence, canonical validity, tenant/owner membership, authorization, and unambiguous binding are required; otherwise fail closed |
| Equality | `runtimeCompanyId` must equal the canonical CompanyId returned by the authoritative source; no aliasing, trimming, case-folding, or synthetic fallback |
| Lifecycle | Established after authentication and tenant validation, before company-scoped authorization/resource access; preserved for the lifetime of the governed request/context |
| Mutability | Immutable within a request and within the issued authenticated application context |
| Change condition | May change only after an authoritative durable binding change and issuance/establishment of a new governed application context; never by request mutation |
| Missing/ambiguous/revoked binding | Fail closed; no default CompanyId and no best-effort selection |
| Engine mathematics | This act does not make CompanyId or tenant identity an input to frozen engine mathematics |

This act establishes the runtime semantic contract. It does not add the field to source code,
transport DTOs, tokens, sessions, persistence schemas, or APIs.

### E — Principal → Owner/Tenant/Company Mapping

The governed D115 mapping is:

```text
validated application principal
  → authoritative owner/account context
  → platform-validated tenant context
  → active, unambiguous durable company binding
  → canonical CompanyId
  → server-established runtimeCompanyId
```

The relationships are defined as follows:

1. **Principal → owner:** the validated application principal is associated with the
   authoritative owner/account context by a server-side governed relationship. A principal
   cannot self-declare ownership.
2. **Owner → tenant:** the owner/account context is associated with the platform-validated
   tenant context already protected by G3. Tenant context is not inferred from a company,
   URL, frontend state, or unvalidated claim.
3. **Tenant/owner → company:** the active company binding is a separately governed durable
   relationship. The binding must identify exactly one active CompanyId for the governed
   runtime context. An absent, ambiguous, or conflicting relationship fails closed.
4. **Company → resource:** a company-scoped resource may be accessed only when the server
   validates the active `runtimeCompanyId` against the resource's authoritative canonical
   CompanyId and the existing tenant/owner authorization requirements.
5. **Roles:** roles authorize actions; roles do not identify or select a company.
6. **Multiple-company membership:** this act does not create implicit multi-company selection
   semantics. Any future selection among multiple eligible bindings requires a separate
   explicit governance decision and server-side authorization; it cannot be inferred from a
   client request.

The authoritative relationship is the server-side governed binding record. Contextual values
such as a Keycloak claim, route parameter, or displayed company name are not authoritative
without that binding.

### F — Runtime / Server Propagation

The governed propagation path is:

```text
validated OIDC credential
  → ValidatedIdentity
  → server-side EnterpriseRuntime.Principal
  → G3 platform tenant validation
  → D115 authoritative owner/tenant/company binding resolution
  → validated canonical CompanyId
  → server-established runtimeCompanyId context
  → existing server-side resource authorization
  → governed handler/resource/portfolio boundary
```

Propagation requirements:

- The source is the validated principal plus the authoritative durable binding lookup.
- The trusted establishment point is the server-side D115 binding boundary after existing G3
  authentication and tenant validation and before company-scoped authorization.
- The value is propagated internally across server/runtime boundaries as governed context,
  not as a client-controlled identity claim.
- Every downstream company-scoped boundary must preserve the exact canonical value and must
  reject missing, malformed, mismatched, stale, revoked, or ambiguous bindings.
- The server must not derive CompanyId from `tenantId`, `userId`, role, audience, sector,
  Screen reference, provider identifier, or `${sector}-H1`.
- Propagation must not weaken existing tenant isolation, server-side authorization, audit, or
  fail-closed behavior.
- No implementation of this path is authorized by this act.

### G — Trust / Authorization Boundary

The authoritative trust and authorization boundary is the existing server-side IIPS chain,
extended conceptually by the D115 binding decision without changing the G3 authority:

```text
Keycloak/OIDC authentication authority
  → IIPS identity adapter / validated identity
  → existing server-side principal and tenant validation
  → D115 server-side CompanyId binding validation
  → EnterpriseRuntime / PlatformApi.ApiSecurity authorization
  → company- and tenant-scoped resource access
```

Authority separation is mandatory:

- Keycloak authenticates; it does not authorize CompanyId access.
- The frontend does not establish or authorize CompanyId.
- The transport does not become the security authority.
- `EnterpriseRuntime`, `PlatformApi.ApiSecurity`, and the governed server-side D115 binding
  boundary remain authoritative for authorization decisions.
- A valid principal without an authorized CompanyId binding is denied company-scoped access.
- A valid CompanyId without a valid principal/owner/tenant authorization is denied access.
- Cross-tenant or cross-company access must fail closed and remain server-side audited through
  the existing authorization/audit boundary.

This act preserves, and does not replace or weaken, G3 `401`/`403`, RBAC, tenant-isolation,
and server-side authorization semantics.

### H — Durable Persistence Relationship

D115 establishes the following governance requirement for a durable binding record:

> The authoritative durable relationship must bind the validated application principal,
authoritative owner/account context, platform tenant context, canonical CompanyId, binding
lifecycle/state, and required audit/lineage metadata in the governed durable application/user-
portfolio boundary.

At minimum, the durable relationship must be able to establish and validate:

- the principal identity reference;
- the owner/account reference;
- the tenant reference;
- the canonical CompanyId reference;
- the active/effective binding state and applicable lifecycle metadata;
- the authority/provenance of the assignment;
- the version or concurrency identity needed to prevent stale binding use;
- auditability of binding creation, change, suspension, and removal when those operations are
  separately authorized.

Persistence rules:

1. The durable relationship is the source of truth for D115 binding; an in-memory runtime store
   is not sufficient.
2. G-2 remains authoritative: IPD owns the user-portfolio domain and durable persistence
   boundary, and IRR may consume it only through a separately governed additive contract.
3. PIT/market-data storage must not be repurposed as user/company persistence.
4. No persistence technology, schema, migration, endpoint, or implementation is selected or
   authorized by this act.
5. The D115 persistence requirement is not persistence implementation authority.
6. Until the separately authorized durable relationship exists and is independently qualified,
   any runtime path lacking an authoritative binding must fail closed.

---

## 4. DEPENDENCY RECONCILIATION

### 4.1 G3 principal, tenant, and authorization architecture

**Reconciled — no contradiction.**

This act adopts the existing G3 chain rather than replacing it:

- Keycloak/OIDC remains authentication authority;
- `EnterpriseRuntime.Principal { userId, tenantId, roles }` remains the governed principal;
- tenant context remains platform-validated;
- `EnterpriseRuntime` / `PlatformApi.ApiSecurity` remain authorization authorities;
- React and transport remain non-authorities.

D115 adds only the governed CompanyId binding relationship after the existing principal and
tenant validation boundary. No G3 source, configuration, certification record, or runtime
semantics are modified by this act.

### 4.2 NP-12/N4 company/reference semantics

**Reconciled — no contradiction.**

NP-12 is a sector-reference population contract. Its `(normalized sector, referenceId)`
identity is opaque and explicitly does not establish company identity. N4 `companyId` values,
Screen references, and `${sector}-H1` transport values remain separate namespaces. None is a
D115 CompanyId unless a future, separately governed decision explicitly changes that boundary.
This act does not reopen or expand NP-12.

### 4.3 D8 / M-4 standing records

**Reconciled prospectively; history preserved.**

The GATE-Y, D8, D06/D07, NP-08, and NP-15 records that previously recorded D115 as
`WITHHELD / UNRESOLVED / NOT AUTHORIZED` remain unchanged and historically valid at their
recorded effective points.

This act is the later constitutive D115 authority act. It establishes the current D115
semantics prospectively after durable publication. It does not rewrite, silently reinterpret,
or retroactively repair any earlier record.

This act does not itself commission M-1, establish M-3 provenance, alter D8 scope, grant
D88 relief, or authorize intelligence implementation or production.

### 4.4 G-2 durable user-portfolio architecture

**Reconciled — no contradiction.**

G-2 establishes that the user-portfolio domain and durable persistence boundary are owned by
IPD, that the IRR reference portfolio remains distinct, and that any IRR consumption boundary
must be separately governed and additive. D115 adopts that architecture as the durable-boundary
requirement for principal/owner/tenant/company binding but does not access or modify IPD.

### 4.5 NP-04 persistence governance

**Reconciled — no persistence technology selected.**

The D115 act establishes only the durable relationship requirement. It does not choose,
implement, migrate, or alter NP-04 persistence. Any NP-04 or persistence-domain act remains a
separate authority gate.

### 4.6 NP-06 Reports and other protected domains

**Reconciled — no scope overlap.**

NP-06 Reports, D114/PIT, certified reference portfolios, G3 certification, and other protected
foundations remain unchanged. This act establishes no report, portfolio, PIT, provider,
production, or certification behavior.

---

## 5. NON-EFFECT AND PRESERVATION CLAUSES

This act does not modify or reopen:

- G3 certification or G3 Keycloak/OIDC architecture;
- existing authentication implementation;
- existing tenant semantics;
- NP-12 N4 company/reference semantics;
- D8 Intelligence scope;
- D88 authority;
- NP-04 persistence implementation or persistence technology;
- G-2 implementation boundary;
- NP-06 Reports;
- D114/PIT or market-data boundaries;
- any historical governance record;
- any production repository, environment, credential, deployment, ingestion, or authorization.

This act does not grant:

- application implementation authority;
- runtime code or configuration authority;
- persistence implementation authority;
- identity-provider change authority;
- API or UI change authority;
- qualification authority;
- acceptance authority;
- certification authority;
- release authority;
- production authority.

The following remain true after this act:

- `productionEligible = false`;
- production remains out of scope;
- no production identity is activated;
- no runtime CompanyId implementation is performed;
- no durable persistence implementation is performed;
- no individual company record or CompanyId value is commissioned by this act;
- no historical D115 record is rewritten;
- no prior assertion is retroactively converted into evidence of the current act.

---

## 6. VALIDATION AND LEAKAGE CHECKS

Before publication, the complete artifact must be checked for:

- explicit Packet A–H completion;
- explicit distinction between canonical CompanyId and `runtimeCompanyId`;
- no adoption of `EQ_*`, FIGI, ticker, ISIN, sector, Screen reference, or `${sector}-H1` by inference;
- no G3 authority replacement or weakening;
- no NP-12 scope expansion;
- no NP-04 or G-2 persistence technology selection;
- no implementation, API, UI, provider, deployment, qualification, acceptance, certification,
  release, or production leakage;
- no historical record rewriting;
- fail-closed handling of absent, ambiguous, mismatched, stale, or unauthorized bindings;
- no unintended file changes.

If any validation failure is found, the artifact must be rectified and revalidated before
publication.

---

## 7. DURABILITY AND EFFECTIVE STATUS

Arena workspace state is not authoritative.

This act is not effective merely because it exists locally, is committed, or is present on an
Arena session branch. It becomes the current durable D115 authority only after all of the
following are independently verified:

1. publication to `ramkivs/iips-review-recovered` `origin/main`;
2. commit reachability from `refs/heads/main`;
3. artifact presence in the authoritative remote tree;
4. artifact blob identity and SHA-256 verification;
5. exact remote artifact re-read;
6. no unintended files changed;
7. `LOCAL == REMOTE`;
8. clean worktree.

Until those checks pass, the act remains an unpublished execution artifact and must not be
represented as current authoritative D115 state.

---

## 8. FINAL AUTHORITY STATEMENT

> **M-4 / D115 — IDENTITY / RUNTIME COMPANYID BINDING AUTHORITY: GOVERNANCE SEMANTICS CONSTITUTED BY THIS ACT, EFFECTIVE ONLY UPON DURABLE PUBLICATION AND INDEPENDENT REMOTE VERIFICATION.**
>
> The act establishes the application principal, identity custody separation, canonical CompanyId
authority, `runtimeCompanyId` runtime semantics, principal → owner/tenant/company mapping,
server-side propagation boundary, trust/authorization boundary, and durable persistence
relationship as governance requirements. It does not implement any of them and does not grant
implementation, qualification, acceptance, certification, release, or production authority.

**Authority:** Ramki / Program Authority

**Recording agent:** Arena — recording and verification only

**End of Authority Act.**
