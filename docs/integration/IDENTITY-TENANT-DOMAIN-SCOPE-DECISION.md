# IIPS — Domain-Scoped Identity and Tenant Authority Decision

> **Record ID:** `D-2-IDENTITY-TENANT-DOMAIN-SCOPE-DECISION-01`
> **Decision:** D-2 — Option B — Domain-Scoped Identity/Tenant Authorities with Explicit Governed
> Translation Boundaries
> **Record type:** Governance decision — durably published; non-executable (grants no implementation,
> mapping, authority-creation, promotion, merge, deployment, or production authority)
> **Date:** 2026-10-06 (UTC)
> **Authority:** Ramki — Program Authority / application owner. This decision is rendered under Ramki's
> explicit authorization of D-2 Option B; the authorization is narrowly scoped to this governance decision.
> **Recording agent:** Arena Agent Mode — preparation and verification only; no authority is rendered by
> the agent.
> **Authoritative repository:** `ramkivs/iips-review-recovered`
> **Authoritative ref:** `refs/heads/main`

## 1. Decision

D-2 — Option B is ADOPTED: identity and tenancy authorities in the IIPS application remain
DOMAIN-SCOPED. The application does NOT establish one universal identity, tenant, owner, or Company
identity authority at this time.

## 2. D-1 Dependency

This decision depends on and complements the durably published D-1 persistence ownership decision:

- Record: `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`
- IRR main merge: `561cc85fdbc929e68e798b1e97dda76a64262b9e`
- Record blob (verified unchanged at D-2 publication): `0c4f27b365c47839ec66f4ec6b34ec1c0f72ad2a`

D-1 established that portfolio persistence belongs to the Portfolio Domain and artifact/report
persistence belongs to the Artifact/Report Domain. D-2 establishes that identity/tenant authority is
likewise domain-scoped. D-2 does NOT authorize a persistence integration and does NOT authorize a
portfolio-to-Reports identity bridge.

## 3. Current Identity Landscape (evidence)

### 3.1 IRR

- Principal semantics are Keycloak-capable: bearer credential → `KeycloakSessionValidator` (injected
  `OidcVerifier`; live `RealKeycloakVerifier` via environment discovery, realm `iips`, client
  `iips-spa`) → `ValidatedIdentity` → `TenantDirectory` tenant resolution → `Principal {userId,
  tenantId, roles}` → `EnterpriseRuntime` RBAC and resource gates.
- Evidence: `frontend/server/secured-executor.ts` (blob `69b54e02…` on IRR main `561cc85f…`),
  `frontend/src/core/auth/keycloakAdapter.ts` (blob `d7aefbb0…`),
  `iips-platform/src/distributed/EnterpriseRuntime.ts` (blob `7a4d6999…`).
- Current tenant resolution on main is fixture-backed: the runtime directory is a hardcoded in-memory
  map (`admin-a`/`analyst-a` → `tenant-A`, etc.) in `frontend/server/admin-transport.ts` (blob
  `f423d64e…`). It is fixture content in runtime use.
- The Reports branch (`arena/01a0f1b3`, tip `6a8afbb`) contains a stronger tenant-membership
  implementation (`frontend/server/tenant-membership-store.ts`), but branch-only strength does not make
  it current main authority.
- IRR therefore does NOT receive a new universal tenant authority from this decision.

### 3.2 IPD

- Current IPD `companyId` occurrences relate to instrument/reference identity: the P04 identity mapping
  store resolves identifiers to an authoritative `companyId` for instruments, populated exclusively by
  governed offline fixture masters.
- Evidence: `src/identity/mapping_store.ts` (blob `eec60c09…` on IPD main `4d3e1cd…`),
  `frontend/src/core/session/session.ts` display session (blob `f119f7fc…`).
- These occurrences do NOT establish user/company ownership binding. Instrument `companyId` MUST NOT be
  reinterpreted as canonical user/company identity.

### 3.3 G24 (portfolio identity)

- G24 (`arena/01a0e6d9`, tip `6828155`; branch-only) contains the strongest evidenced durable
  membership authority: explicitly provisioned application users (lifecycle PENDING → APPROVED →
  ACTIVE → RETIRED), SQL-backed membership state with ACTIVE-only enforcement and revocation, and
  validated tenant hints (a requested tenant must match an ACTIVE membership or the call fails).
- Evidence: `src/app_identity/service.ts` (blob `80563c79…`),
  `src/persistence/migrations/001_initial_schema.ts` (blob `48fcf4d9…`).
- This establishes G24's bounded identity/tenant authority for its own portfolio domain. It does NOT
  make G24 identity universal across IIPS.

### 3.4 Governed Reports

- Reports (`arena/01a0f1b3`, tip `6a8afbb`; branch-only) derives owner `(tenantId, userId)` solely from
  the authenticated principal via the file tenant directory, and refuses company-identifier claims
  outright (evidence: `frontend/server/reports-transport.ts`, blob `cdee7ed1…`).
- The Reports-transport owner value is a pass-through of the authenticated principal on that path only;
  it is not an interface-level identity equivalence, and Reports `tenantId` is not equatable with G24
  `tenantId` (different sources, different revocation semantics, no mapping).

## 4. Tenant Authority Landscape

| Source | Mechanism | Durability | Limitation |
|---|---|---|---|
| IRR main directory | Hardcoded map | Code constant | Fixture content; no authority behind it |
| Reports file directory | Checksummed file map | Durable file | Branch-only; lookup only, no revocation states |
| G24 memberships | SQL membership rows | SQLite table | Branch-only; scoped to the portfolio domain |
| IPD main / Dhan store | None (display session only) | None | No user/tenant/owner identity at all |

Observed determination: MULTIPLE INCOMPATIBLE AUTHORITIES — three live mechanisms with incompatible
content, mechanics, and revocation semantics, plus two absences, and no equivalence record. Whether any
future decision unifies, scopes, or retires any of them is outside D-2.

## 5. Company Identity Status

- A Company Identity Authority interface exists (`frontend/server/d115-runtime.ts`, blob `d9b546c9…`
  on IRR main).
- The sole implementation on any ref is fixture-only (`FixtureCompanyAuthority`, test file blob
  `f3dfdfe8…`).
- Creation of a durable Company Identity Authority was previously excluded from its recorded
  authorization.
- The runtime-company boundary machinery has no non-test callers and is not consumed by G24, Reports,
  or portfolio persistence.

**NO DURABLE / UNIVERSAL COMPANY IDENTITY AUTHORITY IS ESTABLISHED BY D-2.**

## 6. Cross-Repository Mapping Status

Exhaustively searched across all refs and history of both repositories (identity pairs, mapping tables,
adapters, translators, canonical identifiers, issuer/subject bridges, migration records, governance
decisions, package/runtime/API bridges):

- No governed IRR Principal → G24 applicationUserId mapping exists.
- No governed cross-repository tenant mapping exists.
- No governed CompanyId mapping exists.
- No governed runtimeCompanyId cross-domain binding exists.

**NO GOVERNED CROSS-REPO IDENTITY MAPPING ESTABLISHED.**
**NO UNIVERSAL TENANT AUTHORITY ESTABLISHED.**
**NO GOVERNED COMPANY IDENTITY AUTHORITY ESTABLISHED.**

## 7. Domain-Scoped Authority Rule

Each bounded domain may retain its own authoritative identity/tenant semantics, provided that:

1. the authority is explicitly identified;
2. ownership and tenant semantics are explicit;
3. the authority is not silently treated as universal;
4. another domain does not consume its identifiers as authoritative without an explicit governed
   translation boundary;
5. any cross-domain identity/tenant translation requires a separately governed interface/adapter;
6. such translation must preserve authorization boundaries;
7. client-supplied identity must never become authoritative merely through translation;
8. a future canonical Company Identity Authority remains a separate governance decision.

## 8. Translation Boundary Rule

A future cross-domain integration may NOT assume that `IRR Principal.userId` equals `G24
applicationUserId`, nor that `IRR tenantId` equals `G24 tenantId`, nor that any existing `companyId`
equals a canonical `CompanyId`, nor that any `runtimeCompanyId` equals a universally authoritative
company binding. Any such relationship requires a separately governed translation contract specifying at
minimum: source authority, target authority, source identifier, target identifier, mapping lifecycle,
provisioning authority, revocation authority, tenant boundary, ownership boundary, authorization
boundary, audit requirements, failure behavior, security/trust model, durable storage, and package/API
contract. D-2 does NOT authorize that work.

## 9. Security Boundary

D-2 does NOT establish trust propagation between IRR authentication, G24 authentication, Reports
authentication, and IPD authentication. Existing authentication and authorization boundaries remain
intact. No forwarded-principal trust is created. No audience reconciliation is created. No browser
credential path is created. No client-supplied identity becomes authoritative.

## 10. Status Declarations

- **Implementation status:** NOT AUTHORIZED. No source, schema, database, API, package, dependency,
  identity-provider, tenant-directory, or Company Identity Authority changes.
- **Mapping status:** NO CROSS-DOMAIN IDENTITY MAPPING CREATED. No tenant mapping, no Company binding,
  no runtimeCompanyId binding.
- **Promotion status:** NOT AUTHORIZED. No promotion executed.
- **Main admission:** NOT GRANTED. D-2 admits no branch capability to main.
- **Convergence status:** NOT ESTABLISHED. D-2 selects no final identity, tenant, Company Identity
  Authority, persistence, package, API, shell, or baseline implementation.

## 11. Explicit Exclusions

This decision does NOT authorize: creation of a Company Identity Authority; creation of a tenant,
owner, identity-mapping, tenant-mapping, CompanyId-mapping, or runtimeCompanyId-binding authority;
identity, authentication, or authorization implementation; security, persistence, API, package,
dependency, or browser-credential changes; promotion; main capability admission; implementation-branch
merge; final convergence; shell selection; production deployment; or production activation.

## 12. Downstream Impact

Decisions that may now use D-2 as a prerequisite (their own governance still required): the durable
bridge-target decision (identity/ownership design terms), the G24 role decision (auth/binding terms),
Reports and family admission scoping (dependency identity now statable under domain-scoped terms),
candidate-set validity review, and convergence readiness (D-2 is necessary, not sufficient). D-2 moves
no ref and implements nothing; every downstream act requires separate authorization.

## 13. Durability

Publication coordinates (recorded after independent verification):

- Repository: `ramkivs/iips-review-recovered`
- Ref: `refs/heads/main`
- Baseline main: `561cc85fdbc929e68e798b1e97dda76a64262b9e`
- Branch: `governance/d2-identity-tenant-option-b`
- PR: `PENDING`
- Merge commit: `PENDING`
- Tree: `PENDING`
- Record path: `docs/integration/IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md`
- Blob: `PENDING`
- SHA-256: `PENDING`
