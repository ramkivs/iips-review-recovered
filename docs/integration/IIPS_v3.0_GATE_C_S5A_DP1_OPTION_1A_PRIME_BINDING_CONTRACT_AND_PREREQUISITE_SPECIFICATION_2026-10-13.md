# IIPS v3.0 — Gate C S5A: DP-1 Option 1A′ — Non-Production Binding Contract and Prerequisite Specification (P-2 … P-8)

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG12-GATE-C-S5A-DP1-1AP-BINDING-CONTRACT-AND-PREREQUISITE-SPECIFICATION-2026-10-13-01` |
| Gate / step | **Gate C (`REG-12` / `G-2` / `F-4` / `AG-5`) — roadmap step S5A** (the authorized continuation of S5 after the DP-1 act: *“Choose and authorize compatible complete owner/credential/tenant-binding design; separately authorize any provisioning; independently qualify trust path”*) |
| Record type | **Rendered binding contract (design) plus prerequisite specification.** It executes the **design** content of the selected DP-1 Option 1A′ under the Program Authority’s act (packet §9.6 / `GC-D3`). It creates **no** issuer, key material, credential, configuration, `application_user`, mapping, tenant, membership, provisioning event, database write, IPD write, implementation change, successful save or admission. |
| Deciding authority | **Ramki** — single owner, sole user, and Program Authority of the single-user, personal-use, non-production IIPS platform |
| Recording agent | Arena Agent Mode — attributed execution of the **selected** option’s design and preparation of the remaining distinct acts. **No authority is rendered by the agent.** |
| Date | **2026-10-13** (UTC). Recorded on its actual date; not backdated. |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main` |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not modified by this record; no IPD ref, branch, tag, file or database is written** |
| Verified IRR baseline at this record | `main@923988f45a31dca7fc3549fefac1960a26585769` (merge of PR #85) — re-verified live this session |
| Verified IPD baselines at this record | `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`; pin `np04-governed-persistence-windows@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; G24 `arena/01a0e6d9-iips-production-market-data` and `arena/01a0f308-iips-production-market-data` both `@6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`); act branch `arena/01a0f839-iips-production-market-data@12c480b5bf5cfbe0f296fcd12c9189328b915417` — **all four re-verified live and UNCHANGED** |
| Governing records | Gate C decision packet (`IIPS_v3.0_GATE_C_PORTFOLIO_IDENTITY_AND_SECURITY_IDENTIFIER_CONTRACT_PA_DECISION_REQUEST_2026-10-13.md`) — **§9.6 (`GC-D3`) is the controlling disposition for DP-1**; §9.4 (`GC-D1`/`GC-D2`) as amended by §9.6; the S5 investigation and decision input (`IIPS_v3.0_GATE_C_S5_OWNER_CREDENTIAL_TENANT_BINDING_INVESTIGATION_AND_DECISION_INPUT_2026-10-13.md`); `AD-20`; `D-2`; the `NP-08-D115-D2-G2` Reconciliation Act; `D115-A` (ineffective); Gate B Option C disposition; `G2-2` (`P2`/`P3`); the F-1…F-7 policy records; the G2 durable user-portfolio implementation record §5; `H-18`; `NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT.md`; IPD act `26061859…` |
| Canonical tracker | [`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`](../../IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md) §15 (§15.11 records this publication) |
| Environment | Non-production. Production is out of scope. **No runtime, deployment or production behavior is claimed or proven anywhere in this record.** |
| Status | **DP-1 OPTION 1A′ SELECTED (`GC-D3`) — BINDING DESIGN AND CONTRACT RENDERED (P-5) — P-2/P-3/P-4 REQUIREMENTS SPECIFIED — P-6 IMPLEMENTATION AUTHORITY NOT GRANTED — P-8 QUALIFICATION PLAN FIXED — NO LIVE BINDING EXISTS.** The next genuine blocker is the **P-2 configuration act** (with P-4 provisioning following it). `/api/user-portfolios*` remains fail-closed at source-level HTTP `503 owner-context-unavailable`. |

> **Bottom line.** The Program Authority has **selected DP-1 Option 1A′** — a scoped, non-production owner/credential/tenant binding — as a distinct express act (`GC-D3`, packet §9.6). This record **executes the design content of that selected option** and nothing more: the complete `D-2` §8 translation contract is rendered with all fifteen elements specified and elements 1–8 moved off *Deferred*; the trust-anchor/issuer, credential-path, provisioning and qualification requirements are specified as executable requirement sets; and the exact boundary of every remaining distinct act is enumerated. **Nothing live exists or is created.** No issuer is stood up, no key material is generated or custody-established, no `IPD_OIDC_*` configuration is set, no credential is obtained or stored, no `application_user`, `(issuer, subject)` mapping or tenant membership is created, no database is opened, no IPD ref or file is touched, no IRR implementation byte is changed, no successful portfolio save is possible, and no fence, `P2`/`P3` disposition or admission is altered. The single-user non-production character of the deployment is the reason a locally issued bearer is *verifiable* by G24; it is **not** evidence that G24’s accepted **user-delegated** credential semantics are satisfied, and that gap is expressly governed in §5.3 below rather than assumed away.

---

## 1. Purpose, bounded scope, non-goals

### 1.1 Purpose

Directed by the current PA instruction — *after* the DP-1 decision is durable, continue the selected 1A′ workstream through the smallest sufficient, dependency-ordered actions, reusing the S5 investigation as the baseline — this record:

1. states the **authority basis precisely** (§2): the Program Authority’s explicit DP-1 selection of Option 1A′ recorded as `GC-D3`, and what that act does and does not authorize;
2. re-verifies **only the mutable facts** on which the continuation depends (§3);
3. renders the **complete `D-2` §8 translation contract** for the binding, all fifteen elements, with elements 1–8 moved from *Deferred* to governed specification (§4) — the P-5 artifact;
4. specifies the **P-2** trust-anchor/issuer governance and configuration requirements, including the **user-delegation semantics gap** (§5);
5. specifies the **P-3** credential acquisition and presentation path, excluding forwarded-Principal trust, browser-based trust shortcuts and static/service credentials (§6);
6. specifies the **P-4** operator-only offline provisioning requirements — mapping lifecycle, the exactly-one-*ACTIVE*-membership invariant, auditability and revocation (§7);
7. fixes the **P-6** implementation-authority boundary, enumerating every change surface that requires a separate grant and confirming that no IPD source change is required by 1A′ (§8);
8. fixes the **P-8** independent trust-path qualification requirements and the evidence bar (§9);
9. records the **exact remaining distinct acts** and the resulting prerequisite status table (§10);
10. confirms that every protected invariant is preserved (§11).

### 1.2 In scope

Execution of the **selected** option’s design and preparation of the acts it entails: this record (new), additive amendments to the existing Gate C packet (§9.6 disposition, §7.1 pointer, §10.1 S5-row pointer, §16.4 publication addendum, header status) and to the canonical tracker (header, §2 `REG-12` row, §4 completed-work item, §5 change row, §15.11). Documentation only. **No second decision packet and no duplicate master tracker are created.**

### 1.3 Non-goals (explicit)

This record does **not**:

- establish, stand up, host, generate keys for, or operate any issuer, JWKS endpoint, OIDC provider or trust anchor;
- generate, store, transmit, custody or rotate any key material, credential, token, secret or certificate;
- set, change or propose the runtime value of `IPD_OIDC_ISSUER`, `IPD_OIDC_JWKS_URI` or `IPD_OIDC_AUDIENCE` on any process, and does not configure any scoped non-production G24 runtime;
- create any `application_user`, `(issuer, subject)` mapping, tenant, membership, portfolio, revision or `mapping_audit_event`; open, create, migrate, query or write any database;
- perform any provisioning, approval, activation, retirement, reactivation, revocation or owner-correction act;
- change any application code, test, pin, lockfile, schema, route, UI, fence, transport or runtime configuration; the IRR implementation surface named in §8 is **not** written;
- modify any IPD ref, branch, tag, file, package or record; promote G24, merge or re-pin the NP-04 (`2e11fa3b…`) and G24 (`6828155e…`) lineages, or designate a Company Identity Authority;
- permit a successful unresolved-identity save, weaken the Option 2F pre-port refusal, or alter `assertNoG2CallerAuthority` semantics;
- admit the User Portfolios consumer, dispose `P2`/`P3`, activate any route or UI, or complete F-7;
- treat the F-3 owner-context pair (`owner-7f3a91c2` / `irr-domain-4b82d6e1`) as an authenticated principal, credential or tenant membership, or extend its scope beyond NP-09/NP-10/NP-11;
- introduce caller-controlled canonical identity or resolution disposition, or any authentication, tenant-resolution or portfolio-authorization bypass.

---

## 2. Authority basis — the DP-1 act and its exact bounds

### 2.1 The act

The **Program Authority rendered a distinct express DP-1 decision** selecting **Option 1A′ — scoped non-production binding**. It is recorded in the established authoritative decision record for Gate C as **`GC-D3`** (packet §9.6) and mirrored in the canonical tracker (§2 `REG-12` row, §15.11).

**Source and date, recorded accurately.** The decision is the Program Authority’s explicit selection of DP-1 Option 1A′, communicated directly in the operating session on **2026-10-13** and recorded on that date. It is **not** a separately signed instrument, **not** a retrieved Library artifact, **not** a signed-PDF approval, and **not** an inference from the standing authorization. No signature, approval date, document identifier or third-party confirmation is asserted for it, and none is fabricated. It is distinct from, and supersedes as a matter of direction, the `GC-D1` (Option 1D) binding deferral recorded under standing-authority application in packet §9.4.

### 2.2 What `GC-D3` authorizes

1. **The selection itself** — the binding direction for DP-1 is now 1A′ (scoped non-production binding), not continued 1D deferral.
2. **Execution of the selected option’s design** — the complete `D-2` §8 translation contract for the binding (§4), the trust-anchor/issuer governance and configuration *requirements* (§5), the credential acquisition and presentation *path* (§6), the operator-only offline provisioning *requirements* (§7), the implementation-authority *boundary* (§8) and the qualification *plan* (§9).
3. **P-5 as defined by the S5 investigation** — “elements 1–8 moved from **Deferred** to governed values under P-1”. `GC-D3` is that P-1 act, so the contract is rendered here with elements 1–8 governed.

### 2.3 What `GC-D3` does **not** authorize

`GC-D3` performs **none** of the constitutive acts, and a technical possibility is not an approved mechanism:

| Not authorized by `GC-D3` | Act that must render it |
|---|---|
| Standing up the trust anchor; generating or custodying key material; publishing a JWKS endpoint; fixing the issuer identifier value | **P-2 configuration act** (§5.5, §10) |
| Setting `IPD_OIDC_ISSUER` / `IPD_OIDC_JWKS_URI` / `IPD_OIDC_AUDIENCE`; starting a scoped non-production G24 runtime; naming `IPD_PORTFOLIO_DB_PATH` | **P-2 configuration act** (§5.5, §10) |
| Obtaining, storing, refreshing or presenting any real bearer; fixing the subject value | **P-2 act** (subject) + **P-6 act** (the code that acquires/presents it) |
| Creating the `application_user`, the `(issuer, subject)` mapping, the tenant, the exactly-one-*ACTIVE* membership; writing `mapping_audit_events`; naming and exercising revocation | **P-4 provisioning act** (§7.7, §10) |
| Any IRR implementation change whatever, including the caller-context source and the credential-presentation seam | **P-6 IRR implementation authority act** (§8) |
| Any IPD-side source change (1C-class) | **Separate IPD-side act** — not required by 1A′ and not requested here |
| Any successful portfolio write; replacement or relaxation of the 2F pre-port refusal | **S6** governed successful-write identity policy — separately gated |
| Any fence change, route/UI activation, consumer admission, `P2`/`P3` disposition | **S7** — separately gated |

`GC-D2` (Option 2F) remains **in force unchanged**, including its text: *“No live credential, provisioning, database or IPD write is authorized. The complete identity-binding/translation contract and full F-7 qualification remain pending separate authority.”* `GC-D3` supplies the *binding decision and its design*; it does not convert that sentence’s live prohibitions into permissions.

### 2.4 Standing authorization is not the source of the decision

The durable standing authorization (F-3 record §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`, 2026-10-12 grant) is **not** cited as the source of the DP-1 selection, and no selection is inferred from it. It remains the attributed basis for the *recording, publication and remote verification* work of this run — the covered classes of governance records and publication — exactly as recorded in the S5 investigation §10 and packet §16.3. The distinction between the Program Authority’s act and the agent’s recording function is preserved throughout.

---

## 3. Live re-verification performed this session (mutable facts only)

Method: `git fetch origin --prune` + local/remote ref comparison; GitHub REST API via `gh` (`git/ref`, `contents`, `pulls`). Completed S5 investigations were **not** repeated: no changed, uncertain or contradictory fact was found that would justify re-running them. No application test was re-run — this record changes no application byte (§8), and §3.1 shows the tested blobs are exactly what `main` carries.

### 3.1 IRR (`ramkivs/iips-review-recovered`)

| Item | Verified value | State |
|---|---|---|
| `refs/heads/main` (remote and local) | **`923988f45a31dca7fc3549fefac1960a26585769`** — merge of PR #85 | matches the last recorded closure; unchanged since |
| Root tree | `538d3f0258e02451dac804fbcaed376519ea78ed` | ✓ |
| Working tree | clean (`git status --porcelain` empty) | ✓ |
| Open PRs | **none** at start of this run | ✓ |
| Fence blobs at current `main` | `frontend/server/reports-transport.ts` `981470541812a64c733309f1debec75455d85bee`; `frontend/server/user-portfolio-transport.ts` `51704c12a467cd2f718a030b5036bc55c9afa73f`; `frontend/server/owner-context-unavailable.ts` `cb8db45d668d28cee7e0a52721001d579a872733` | **all unchanged** — identical to the Option C-recorded identities |
| Tested 2F blobs at current `main` | `userPortfolioContract.ts` `0dec72eb750206603196c67f6b27947420d7e6ac`; `translationBoundary.ts` `93f602fd7e78395d3cedb77ff504388a4e65012f`; `userPortfolioBoundary.ts` `b8024c6b6d7a75591a77d032813c7312876a0612`; `userPortfolioPort.ts` `ba0001e88c83b070e4f16a3cdb35d34c82ec0200` | **byte-identical to PR #83’s tested tree `8bb5bdae6e3dd47c4f3eaf2d333c87238db54e55`** — the published state is the tested state |
| F-3 standing-authorization source | `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` | **unchanged** |
| F-3 carrier / resolver | `a576e5af983c9351e2ea73202ef7f19d61788d13` / `9738e9b393656eec33f849d78f18c606322a4462` | **unchanged** |

### 3.2 IPD (`ramkivs/iips-production-market-data`) — all four reference points re-verified

| Ref | Verified current value | State |
|---|---|---|
| IPD `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | **UNCHANGED** |
| NP-04 pin `np04-governed-persistence-windows` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | **UNCHANGED** |
| G24 `arena/01a0e6d9…` and `arena/01a0f308…` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (both) | **UNCHANGED** |
| Act branch `arena/01a0f839…` | `12c480b5bf5cfbe0f296fcd12c9189328b915417` | **UNCHANGED** |
| Repository activity | `pushed_at = 2026-10-02T12:50:06Z`; default branch `main` | **no IPD write since before `AD-20`; none by this record** |

**Lineage distinction preserved.** The NP-04 persistence lineage (`2e11fa3b…`, artifact/report domain, IRR package pin) and the G24 portfolio/tenancy lineage (`6828155e…`, branch-only reference per `AD-03` and IPD act `26061859…`) are treated throughout as **distinct domain stores on separate refs**. Nothing here merges, converges, re-pins or promotes either.

### 3.3 Target-authority re-read at the immutable pin (read-only, no IPD write)

The following G24 facts were re-read live at `6828155e…` this session to make §§5–7 exact rather than remembered. All match the S5 investigation’s citations; the pin is **undrifted**.

| Fact | Verified detail |
|---|---|
| Trust configuration surface | Three environment variables only: `IPD_OIDC_ISSUER`, `IPD_OIDC_JWKS_URI`, `IPD_OIDC_AUDIENCE` (default `IPD_DEFAULT_AUDIENCE = 'ipd-user-portfolio-api'`). `loadOidcTrustConfig()` **fails closed**: blank/absent issuer or JWKS throws `OidcConfigurationError`; the JWKS URI must be an absolute `http:`/`https:` URL; a blank audience is invalid. Config comes from the trusted environment, never the caller |
| Algorithms | `TRUSTED_JWS_ALGORITHMS = ['RS256', 'ES256']`; `none` and symmetric algorithms are rejected |
| Verified credential shape | `VerifiedOidcCredential { issuer, subject, audience, expiresAt, issuedAt, claims }` — produced only after signature (trusted JWKS), `iss`, distinct audience, expiry and presence-of-subject checks; errors include `OidcTokenMalformedError`, `OidcTokenMissingError`, `OidcAlgorithmRejectedError`, `OidcSignatureInvalidError`, `OidcIssuerMismatchError`, `OidcAudienceMismatchError`, `OidcTokenExpiredError`, `OidcSubjectMissingError` |
| Identity resolution | `IdentityService.resolveExternalIdentity(issuer, subject)` → exactly one `ResolvedIdentity`; **fails closed** on missing mapping, any non-`ACTIVE` lifecycle state, missing application user, or non-`ACTIVE` user status. Never creates a user |
| Mapping lifecycle | `PENDING → APPROVED → ACTIVE → RETIRED`, with `RETIRED → ACTIVE` (explicit reactivation only); enforced by `ALLOWED_TRANSITIONS`; `external_identity_mappings` has `UNIQUE (issuer, subject)` |
| Tenancy | `resolveTenant(applicationUserId, tenantId?)`: zero memberships → `TenantMembershipMissingError`; requested tenant absent → missing; requested membership non-`ACTIVE` → `TenantMembershipRevokedError`; **no requested tenant and >1 `ACTIVE` membership → `TenantMembershipMissingError`** (*“Ambiguous tenancy is not resolved by guessing.”*); no requested tenant and 0 `ACTIVE` → revoked error. `tenant_memberships.state ∈ ('ACTIVE','REVOKED')`, PK `(application_user_id, tenant_id)` |
| Audit | `mapping_audit_events(audit_id, mapping_id, action, previous_state, new_state, actor, context, occurred_at)`; every mapping mutation and its audit row are written in **one transaction** |
| Provisioning surface | `IdentityService` public methods: `createApplicationUser`, `provisionExternalIdentityMapping`, `linkExternalIdentity`, `approveMapping`, `activateMapping`, `retireMapping`, `reactivateMapping`, `correctMappingOwner`, `provisionTenantMembership`, `revokeTenantMembership`, `listTenantMemberships`, plus the two resolvers. `ProvisionMappingRequest { issuer, subject, applicationUserId? }` |
| Schema absence of derivation | `tenant_memberships` comment, verbatim: *“Membership is explicitly provisioned. Nothing in this schema derives a tenant from browser fields, companyId, runtimeCompanyId, portfolio id, preferred_username, raw subject, or operator context.”* |
| Exclusions stated by the target itself | `src/auth/config.ts` header, verbatim: *“Explicitly out of scope (not implemented anywhere in this module): caller-service authentication, mTLS, token exchange, service credentials, forwarded IRR Principal trust, browser identity trust, operator bypass.”* |

### 3.4 Facts NOT re-verified (and why)

R4-B closure, Gate B Option C, the `D115`/Reconciliation-Act corpus, the AG-5 census, the NP-07/NP-12/NP-13 baselines and the S2–S4 test executions (103/103 offline, typechecks) are **reused as recorded**; each is closed, published and independently verified at refs that §3.1–§3.2 confirm unmoved. No application test was re-run: this record changes no application byte, and §3.1 proves the tested 2F blobs are exactly what `main` carries.

---

## 4. P-5 — The complete `D-2` §8 translation contract for the 1A′ binding (RENDERED)

`D-2` §8 requires a separately governed translation contract specifying at minimum fifteen elements, and states *“D-2 does NOT authorize that work.”* `GC-D3` is the separately rendered Program Authority act; this section is its contract. **All fifteen elements are specified below; elements 1–8 move off *Deferred*.** Identity-bearing **parameter values** (the issuer identifier, the subject value, the application user, the tenant id, the key material) are **not** set here — they are the subject matter of the P-2 and P-4 acts (§§5, 7, 10), and the contract is **non-operative for live binding** until those acts are rendered.

| # | `D-2` §8 element | Governing value under the 1A′ contract | State |
|---|---|---|---|
| 1 | **Source authority** | The **P-2 governed non-production trust anchor** — a narrowly scoped issuer whose accepted credential is a signed OIDC access bearer. The F-3 owner-context pair is **not** the source authority and is not extended, copied, aliased or treated as equivalent: it remains partition semantics for NP-09/NP-10/NP-11 only (Gate B Option C §2(2)). The source authority is the credential-issuing trust anchor acting for the single named user, never IRR, never a forwarded caller claim, never a caller-supplied field | **GOVERNED** (was Deferred) |
| 2 | **Target authority** | **G24 `IdentityService` + `PortfolioAuthorizer` at `6828155e…`** — unchanged and exclusive. No authority transfers to IRR; no IRR-side mapping store, cache, shadow copy or migration exists or may be created | **UNCHANGED** (was Unchanged) |
| 3 | **Source identifier** | The **`(issuer, subject)` pair** carried by the verified credential. **Form fixed; value reserved.** The issuer identifier is fixed by the P-2 act; the subject value is fixed by the P-2/P-4 acts and identifies exactly one natural person — the single user acting as operator. No source/target equivalence is asserted anywhere | **GOVERNED — value reserved to P-2/P-4** |
| 4 | **Target identifier** | G24 `application_user_id` (opaque PK of `application_users`) and G24 `tenant_id` (PK component of `tenant_memberships`). **Created only by the P-4 act.** IRR stores neither value as authority; no IRR-side identity state exists | **GOVERNED — value reserved to P-4** |
| 5 | **Mapping lifecycle** | `PENDING → APPROVED → ACTIVE → RETIRED`, with `RETIRED → ACTIVE` reactivation only, enforced by G24’s `ALLOWED_TRANSITIONS`; the binding is live **only** in `ACTIVE`. No implicit, bulk, scheduled, request-time or migration-driven transition is admissible. Exactly **one** mapping row for the binding, keyed by the `UNIQUE (issuer, subject)` constraint | **GOVERNED** (was Absent) |
| 6 | **Provisioning authority** | **Operator-only, offline, and only under the P-4 act.** The single user acting as operator, executing G24 `IdentityService` directly, never through IRR code, never at request time, never implicitly, never by any automated or startup path. The IRR port exposes **no** provisioning operation (verified: the seven-operation port interface contains none) | **GOVERNED — execution reserved to P-4** |
| 7 | **Revocation authority** | **Operator-only, offline, under the P-4 act**, exercised through G24’s own primitives: `revokeTenantMembership` (membership → `REVOKED`) and/or `retireMapping` (mapping → `RETIRED`), each audited in the same transaction. Both produce fail-closed denial at the target: a `RETIRED` mapping is refused by `resolveExternalIdentity`, a `REVOKED` membership by `resolveTenant`. Revocation is **not** delegatable to IRR, to a caller, to a request, or to any timer. Suspension of the `application_user` (`status = 'SUSPENDED'`) is a further target-side control that equally fails closed | **GOVERNED** (was UNDEFINED) |
| 8 | **Tenant boundary** | Exactly **one** tenant and exactly **one** `ACTIVE` membership for the bound user, provisioned by the P-4 act. Failure behavior is fixed: zero `ACTIVE` memberships → refused; requested tenant not held → refused; requested membership not `ACTIVE` → refused; **more than one `ACTIVE` membership with no requested tenant → refused, never guessed.** The tenant hint is a **hint**, supplied only from the governed server-side owner context (§6.4), never from the caller, and is validated by G24 against the membership table | **GOVERNED** (was Absent) |
| 9 | **Ownership boundary** | Ownership is re-derived server-side by G24 from the governed credential → mapping → tenant chain; browser-supplied or caller-supplied ownership is never trusted; descriptive security fields convey no ownership | **UNCHANGED** |
| 10 | **Authorization boundary** | G24 `PortfolioAuthorizer`: identity → tenant → portfolio, every check mandatory and fail-closed; unauthorized ≡ nonexistent (404 hiding preserved); no IRR-side declaration, header, flag, environment value or configuration can skip a step | **UNCHANGED — and unskippable by construction** |
| 11 | **Audit requirements** | Every mapping lifecycle transition and the tenant-membership provision/revoke acts are audited by G24 in `mapping_audit_events` (`action`, `previous_state`, `new_state`, `actor`, `context`, `occurred_at`) in the **same transaction** as the mutation. The offline `G2ProvisioningRecord` remains an **offline attestation shape, never a runtime input**. **IRR persists no identity, mapping, membership or tenant state and emits no identity state to durable storage.** Qualification never persists portfolio state | **GOVERNED** |
| 12 | **Failure behavior** | Fail-closed at every layer with no defaults, substitutions or silent repairs: IRR boundary → HTTP `503 owner-context-unavailable` (fence unchanged, §11); IRR contract → typed refusal before serialization or port invocation (2F, unchanged); G24 → 401 credential failures, 403 unmapped/missing/revoked membership, 404 existence-hiding. Any partial configuration fails closed: an unconfigured G24 verifier verifies nothing; a blank tenant hint denies | **GOVERNED** |
| 13 | **Security / trust model** | User-delegated-style OIDC **as scoped and bounded in §5.3**: an asymmetric-signed (`RS256`/`ES256`) bearer with a stable `kid`, validated by G24 itself against a configured issuer, a **distinct** `ipd-user-portfolio-api` audience, a trusted JWKS endpoint and expiry. **Excluded absolutely:** forwarded IRR Principal trust, browser-based trust, caller-supplied identity, static or service credentials, token exchange, mTLS-as-substitute, operator bypass, and any restoration of application-wide IRR authentication. The trust anchor is scoped to the non-production binding and to nothing else | **GOVERNED** (was CONFLICT) |
| 14 | **Durable storage** | G24 SQLite (`better-sqlite3`, rollback journal, `synchronous=FULL`, FK enforced, migrations 001–002; path `IPD_PORTFOLIO_DB_PATH`). **Unchanged.** IRR stores no portfolio or identity state; no migration, no lineage merge, no NP-04/G24 namespace convergence; the NP-04 pin `2e11fa3b…` remains the artifact/report-domain store | **UNCHANGED** |
| 15 | **Package / API contract** | HTTP `/api/ipd/portfolios` at `6828155e…`; IRR holds **no** package pin (reference only, `AD-03`); the IRR port remains the seven-operation wire interface with one request per operation and no batch. G24 promotion to IPD `main` remains **PROHIBITED** (act `26061859…`); no new IPD enum, API or package export. Contract versioning of the IRR-side binding fields is part of the P-6 surface (§8) | **UNCHANGED** |

### 4.1 Contract invariants (binding on every future act under it)

1. **No identity equivalence** — the F-3 pair and G24 identifiers are never equated, copied or aliased (Gate B Option C §2(2); `D-2` §8).
2. **No source authority outside the P-2 trust anchor** — no forwarded claim, header, cookie, query parameter, body field or environment shortcut may stand in as the source of identity.
3. **No target-side change** — the target authority and its lifecycle, tenancy and audit semantics are consumed exactly as pinned; 1A′ requires **no IPD source change** (§8.4).
4. **No IRR-side identity state** — no mapping store, no cache of mappings, no shadow membership, no identity journal.
5. **Fail-closed on every mapping/tenancy failure class**, preserving G24’s 401/403/404 indistinguishability (`AD-20` §4.3 Gate C criterion).
6. **No canonical identifier selection and no successful-save permission** inside the binding — the 2F pre-port refusal stands until S6.
7. **No CIA, no `D115-A` effect, no `companyId` semantics change, no NP-04/G24 namespace merge.**
8. **Every parameter value that would constitute establishing an issuer or creating membership requires its own act** — the contract fixes form, invariant and failure behavior; it fixes no live value.

### 4.2 What the contract does not do

It does not make Portfolios available, does not resolve `DP-2`'s canonical-identifier question, does not permit an unresolved save, does not change G24’s source or refs, does not qualify anything, and does not close Gate C. **Contract rendered ≠ contract operative ≠ issuer configured ≠ mapping provisioned ≠ port activated ≠ capability admitted.**

---

## 5. P-2 — Trust-anchor / issuer governance and configuration: requirements and act boundary

P-2 is the **P-2 configuration act** named by the S5 investigation §5 and packet §7.1. Its *requirements* are specified here (design, executed under `GC-D3`); its *act* — standing up the anchor and configuring the scoped non-production G24 runtime — is **distinct and not rendered**: `GC-D3` explicitly withholds it (§2.3).

### 5.1 What the target already requires (verified, §3.3)

The target consumes the trust anchor through **three existing environment variables and nothing else** — `IPD_OIDC_ISSUER`, `IPD_OIDC_JWKS_URI`, `IPD_OIDC_AUDIENCE` — and validates issuer, audience, JWKS signature, `kid` resolution, expiry and subject presence itself. Configutation is read from the trusted environment; the caller cannot influence it. A scope guarantee therefore does **not** require IPD source changes (§8.4), but it does require an **explicitly authorized configuration and runtime act**, because no issuer, key, JWKS or configuration exists anywhere in the baseline (fact 3 of the S5 investigation) and `H-18` records OIDC/Keycloak configuration modification as NOT AUTHORIZED.

### 5.2 Required content of the P-2 act (R-2.1 … R-2.10)

| # | Requirement |
|---|---|
| **R-2.1** | **Scope statement.** The anchor is a **non-production, single-user, narrowly scoped** trust anchor for the 1A′ binding only. The act must state expressly that it is **not** a restoration of application-wide IRR authentication, does not change the PR #61 no-auth baseline for any other capability, does not create any identity platform, and confers no production readiness |
| **R-2.2** | **Issuer identifier.** An explicit, absolute, stable, non-production `iss` value (the value of `IPD_OIDC_ISSUER`). It must not collide with, alias, or appear to reuse the removed historical IRR/`iips-spa` issuer; it must be unambiguous about being local and non-production |
| **R-2.3** | **Algorithm and key type.** Asymmetric only — `RS256` (or `ES256`), matching `TRUSTED_JWS_ALGORITHMS`. `none` and symmetric algorithms are not permissible even as fallbacks. Key size/curve per current practice for a non-production anchor; the act names the choice |
| **R-2.4** | **JWKS endpoint.** Absolute `http(s)` URL for `IPD_OIDC_JWKS_URI`, reachable by the scoped non-production G24 runtime; the act states the trust relationship (why that endpoint is trusted) and its failure behavior (unreachable JWKS ⇒ verification fails closed, no cached-trust fallback) |
| **R-2.5** | **`kid` discipline.** Every signing key has a stable, unique `kid`; exactly one active signing key at a time for issuance, while JWKS may publish additional public keys during rotation |
| **R-2.6** | **Audience.** The **distinct** `ipd-user-portfolio-api` audience; the act must state that the `iips-spa` audience/client is neither referenced nor modified, and whether `IPD_OIDC_AUDIENCE` is set explicitly or left at its verified default |
| **R-2.7** | **Key-material custody and lifecycle.** Where private key material lives (operator-controlled, non-production, outside IRR and outside the repository), who may read it, how it is generated and destroyed; the rotation procedure (publish the new public key under a new `kid` in JWKS **before** first use; retain superseded public keys until the last token they signed expires; then retire); and the compromise procedure (rotate, revoke the mapping per §7.6 where warranted). **No private key, token or secret may enter IRR, the repository, evidence artifacts or any record** |
| **R-2.8** | **Subject semantics.** The `sub` value identifies exactly one natural person — the single user acting as operator. The act fixes the subject value's *form* and *stability*: it must not be reused as, or derived from, a G24 identifier, `companyId`, `runtimeCompanyId`, portfolio id, `preferred_username` or operator context |
| **R-2.9** | **Runtime scope.** The act must bound the runtime whose configuration it sets: a **scoped non-production G24 runtime** started from the pinned G24 ref `6828155e…`, with its own `IPD_PORTFOLIO_DB_PATH`, unrelated to any production data, to IPD `main`, and to the NP-04 pin. Any file/database created by that runtime is non-production state created under this act only |
| **R-2.10** | **Prohibitions restated in the act.** The act must restate, in its own words, that it does not: change any IPD ref or file; promote G24; merge or re-pin the NP-04/G24 lineages; designate a CIA; make `D115-A` effective; alter any IRR source, test, pin, lockfile, fence or route; or admit any consumer |

### 5.3 The user-delegation semantics gap — exact treatment (binding)

The target's accepted direction is **user-delegated OIDC**: an upstream identity provider asserts the user's identity, and IPD independently validates that assertion. Under 1A′ in a **single-user, non-production** deployment, the same natural person acts as both the user and the operator of the scoped trust anchor. A locally issued, asymmetric-signed token is therefore **technically verifiable** by G24 — configuration compatibility is real — but it is **not** G24's accepted user-delegated credential, and *“cannot silently be substituted”* for it (packet §7.1). This contract governs that gap expressly rather than papering over it:

1. **Statement of fact.** The act must record, in terms, that no independent upstream IdP asserts the user's identity; the delegation is **self-asserted** by the single natural person holding both the user and operator roles; the resulting binding is valid **only** for the single-user non-production baseline.
2. **No generalisation.** The binding must never be described as, or cited as evidence of, an enterprise identity integration, a multi-user delegation model, a production trust path, or readiness for either. It does not generalise to a second user, a second tenant, or a service principal.
3. **Scope containment.** Because the delegation is self-asserted, the anchor must be scoped to exactly one subject, one audience, one scoped non-production runtime, and nothing else; the act must state this limitation as a property of the grant, not merely of the configuration.
4. **Reversibility.** The act must state that the anchor can be retired without residue: key material destroyed, JWKS withdrawn, runtime configuration unset, and the binding denied (subject to the P-4 revocation path).
5. **Downstream honesty.** Every artifact downstream of this act — qualification evidence (§9), tracker entries and any status statement — must carry the label **non-production, single-user, self-asserted delegation**, and must not claim runtime, deployment or production readiness from any offline or scoped-runtime result.

### 5.4 What the P-2 act must not do

It must not alter the 2F refusal or the fence; must not touch IRR application code or tests (§8); must not write the IPD repository in any way; must not create the `(issuer, subject)` mapping, tenant or membership (P-4); must not enable any route or UI; must not introduce a second issuer, a symmetric fallback, an audience alias, or a bypass of any kind.

### 5.5 Decision inputs the Program Authority requires to render P-2

| # | Question | Options / notes |
|---|---|---|
| **Q-2.1** | Issuer identifier value and hosting form | Locally operated minimal OIDC-compatible issuer on loopback; **or** any equivalent scoped non-production anchor the PA designates. Must satisfy R-2.2 and R-2.4 |
| **Q-2.2** | Algorithm / key choice | `RS256` or `ES256` (R-2.3) |
| **Q-2.3** | Key custody location and rotation cadence | R-2.7; must remain outside IRR, the repository and all records |
| **Q-2.4** | Explicit audience setting vs. verified default | `ipd-user-portfolio-api` either way (R-2.6) |
| **Q-2.5** | Whether the act also fixes the subject value and the tenant identifier | Permitted; otherwise deferred to P-4. Fixing them here shortens P-4 to provisioning execution only |
| **Q-2.6** | Whether a *single combined P-2/P-4 act* is preferred to two sequential acts | The PA may render one act covering configuration and provisioning; the ordering constraint (§10.2) still applies: the issuer must be fixed before the mapping key can be provisioned |
| **Q-2.7** | Confirmation of the §5.3 self-asserted-delegation governance statement | Required; it is what distinguishes 1A′ from an unmanaged baseline deviation |

---

## 6. P-3 — Credential acquisition and presentation path

P-3 is *“design under P-1”* (S5 investigation §5). `GC-D3` is that P-1 act, so the path is **designed here**. The path is not operative until P-2 is executed and the P-6 implementation authority is granted and exercised (§8): no code in the current baseline acquires or presents a credential.

### 6.1 Legitimacy conditions (all mandatory)

1. **No forwarded-Principal trust.** Nothing the HTTP caller sends — headers, cookies, query parameters, body fields, `Authorization` — is or becomes the IRR-side identity. G24 `src/auth/config.ts` excludes forwarded IRR Principal trust expressly; `D-2` §9 independently excludes trust propagation and client-supplied authoritative identity.
2. **No browser-based trust shortcut.** The browser never obtains, holds, forwards or influences the credential used against G24; no browser identity trust, no implicit flow, no cookie-derived identity.
3. **No static or service credential.** The presented bearer identifies the **single user**, not the IRR service or a service principal; a service credential would collapse per-user ownership and is explicitly unsupported. The bearer must be a **short-lived access token** with bounded expiry (`exp` enforced by G24), re-acquired rather than held indefinitely; no non-expiring token, no shared secret bearer, no API key, no mTLS-as-substitute, no token exchange.
4. **No caller-controlled content.** The credential's issuer, subject, audience and claims are never constructed, influenced, parameterised or overridden by any request.
5. **Presentation integrity.** The bearer is presented to G24 in exactly one upstream request per port operation, over the port's wire interface, and is never logged, echoed, persisted in IRR state, written to evidence, returned to a caller, or stored in the repository.

### 6.2 Acquisition

The credential is acquired from the **P-2 trust anchor** for the fixed subject, under the P-2 act's custody and lifecycle rules, by the operator or by the IRR server process on the operator's behalf. Acquisition must be re-authorised and time-bounded; no acquisition path may create, widen or infer the subject. Any refresh/re-acquisition uses the user's own authorization against the same anchor — never a client secret identifying a service.

### 6.3 Presentation

The IRR port (`userPortfolioPort.ts`, a seven-operation wire interface, one upstream request per operation, no batch) receives the credential from trusted server code only. The **boundary module** — not the transport, not a request handler — supplies it. The transport (`user-portfolio-transport.ts`) continues to answer all six User Portfolios routes with `503 owner-context-unavailable`, reading no body, no tenant claim and no `Authorization` header; **wiring the transport remains S7-scope admission work and is out of P-3**.

### 6.4 The IRR-side owner context (the `G2Scope` / tenant hint)

The seam's only tenant source is `deriveTenantHint(principal)`; a blank value denies. The context's source is therefore fixed as follows:

1. It is constructed **server-side per request** from a **governed, non-caller-controlled** source: configuration/custody established under the P-2/P-4 acts (the bound `(issuer, subject)` and the provisioned tenant identifier, read from trusted environment or an operator-controlled secret store — never from a request).
2. It carries **no** identity authority: it is a hint, validated by G24 against the `tenant_memberships` table, and it is not a credential, a principal or a membership.
3. It fails closed: absent, blank, malformed or unknown values deny before any port call; there is no default and no substitution.
4. It is **not** the F-3 owner-context pair, is not derived from it, and does not extend it; F-3 remains partition semantics for NP-09/NP-10/NP-11 only.
5. It is **not** caller-controlled: no request input may set, alter, override or influence it, which preserves the 2F `assertNoG2CallerAuthority` refusals unchanged.

### 6.5 Boundaries preserved by this design

The 2F pre-port refusal stands unchanged: even with a valid credential and an ACTIVE mapping, `saveHoldings` refuses before scope construction, serialization or port invocation, because no successful-write identity policy exists (S6). P-3 designs the **trust path**; it does not create a successful write, and must not be read as authority to create one.

---

## 7. P-4 — Operator-only offline provisioning: requirements and act boundary

P-4 is the **provisioning act** named by the S5 investigation §5 and packet §7.1. Its *requirements* are specified here; its *execution* — creating any user, mapping, tenant or membership, or writing any database row — is **distinct and not rendered**.

### 7.1 Character of the act

**Operator-only** (the single user acting as operator), **offline** (a deliberate, recorded administrative act outside any request path), **explicit** (no implicit, implicit-on-startup, migration-time or scheduled creation), **audited** (§7.5), **bounded** (§7.2) and **reversible** (§7.6). Provisioning is executed against G24 `IdentityService` at `6828155e…`; it is never executed through IRR code, and the IRR port provides no provisioning operation.

### 7.2 The exact bounded end state (all four, and no more)

| # | Object | Exact required end state |
|---|---|---|
| 1 | `application_users` row | **Exactly one** application user for the binding, `status = 'ACTIVE'`, created via `createApplicationUser` (or created as a side effect of `provisionExternalIdentityMapping` with no `applicationUserId`, which provisions a new user — record which path was used) |
| 2 | `external_identity_mappings` row | **Exactly one** row keyed by the P-2-fixed `(issuer, subject)`, bound to that application user, driven `PENDING → APPROVED → ACTIVE` through `approveMapping` / `activateMapping`, with the lifecycle never skipped and never bulk-driven. `UNIQUE (issuer, subject)` guarantees singularity |
| 3 | tenant + `tenant_memberships` row | **Exactly one** tenant identifier for the binding, with **exactly one `ACTIVE`** membership for that application user, created via `provisionTenantMembership`. **No second `ACTIVE` membership may exist for that user** (the exactly-one-*ACTIVE*-membership invariant, §7.3) |
| 4 | `mapping_audit_events` rows | One audit row per lifecycle mutation, written **in the same transaction** as the mutation, with `action`, `previous_state`, `new_state`, `actor` and `occurred_at` populated |

### 7.3 The exactly-one-*ACTIVE*-membership invariant (binding)

`resolveTenant` refuses zero `ACTIVE` memberships, refuses a requested tenant that is absent or non-`ACTIVE`, and refuses **more than one `ACTIVE` membership when no tenant is requested** — *“Ambiguous tenancy is not resolved by guessing.”* The provisioning act must therefore guarantee, as a post-condition it verifies and records:

1. exactly **one** `ACTIVE` membership exists for the bound application user;
2. no second tenant identifier is provisioned for that user in the same act or later without a further act;
3. the tenant identifier provisioned is the **same** value the IRR owner context will carry as its hint (§6.4), so that the hint resolves rather than denies;
4. the invariant is **verified after** the act by reading `listTenantMemberships(applicationUserId)` and recording the observed state — not assumed.

### 7.4 Prohibited provisioning behaviours (binding)

No request-time provisioning; no provisioning triggered by a failed resolution, by a first request, by startup, by migration or by any retry; no automatic user creation; no mapping creation for any `(issuer, subject)` other than the single bound pair; no multi-tenant or multi-user provisioning; no provisioning through IRR code or through any consumer; no creation of portfolio, revision or holding rows (that is runtime behaviour, not provisioning); no reuse of an existing unrelated application user; no `correctMappingOwner` re-pointing unless separately authorized and audited.

### 7.5 Auditability requirements

1. Every mapping mutation and its audit row are written in **one transaction**; a mutation without its audit row is not a valid act.
2. The **actor** field identifies the single user acting as operator; the **context** field records the act's identifier (this record's ID and the P-4 act's identifier).
3. The act produces an **offline attestation record** in the `G2ProvisioningRecord` shape — the governed offline attestation **shape**, never a runtime input — recording: the act identifier and date; the objects created (user, mapping, tenant, membership) with their identifiers; the observed lifecycle states and the verified post-condition of §7.3; and the audit rows written.
4. The attestation is **evidence**, not authority, and must not be consumed by runtime code. IRR does not persist it as identity state.
5. No key material, token, secret or credential value is recorded in the attestation or in any evidence artifact.

### 7.6 Revocation path (named, and part of the act)

The act must name the revocation path it creates, using G24's own primitives: `revokeTenantMembership` (membership → `REVOKED`) and/or `retireMapping` (mapping → `RETIRED`, reactivatable only explicitly). Both are operator-only, offline, audited, and fail closed at the target. Revocation may be exercised without a further act, because the act names it in advance; any reactivation beyond it, and any change to the bound identifiers, requires a new act.

### 7.7 What the P-4 act must not do

It must not change any G24 source or ref; must not write IRR state; must not create a second user, mapping, tenant or `ACTIVE` membership; must not configure the trust anchor (P-2); must not enable any route, UI or consumer; must not enable a successful save; must not touch production data of any kind; and must not treat the attestation as runtime authority.

---

## 8. P-6 — Implementation authority boundary (not granted)

`GC-D3` grants **no** implementation authority. The IRR changes the 1A′ binding requires are enumerated below and are **not** written. Any implementation step requires its own **P-6 act** naming the exact surface below.

### 8.1 IRR-side change surface (requires the P-6 act)

| # | Surface | Required change | Notes |
|---|---|---|---|
| 1 | Governed owner-context source | Construct the server-side, non-caller-controlled context (§6.4) from P-2/P-4-established configuration, failing closed when absent/blank; feed it to the boundary as a `Principal`-typed caller context | `translationBoundary.ts` header states no such source is implemented today; this is the change that establishes one |
| 2 | Credential acquisition | Obtain a short-lived user bearer from the P-2 anchor under §6.2, with bounded expiry and no persistent secret in IRR state | No acquisition code exists today |
| 3 | Credential presentation | Present the bearer in the port/adapter seam, one upstream request per operation (§6.3) | No first-party G24 HTTP adapter exists today (removed; see `userPortfolioPort.ts` header) |
| 4 | Contract version / binding fields | Record the binding fields and their refusal semantics in the IRR contract as a **new contract version** (v3), preserving every 2F refusal and `assertNoG2CallerAuthority` | Must not weaken 2F; replacing the refusal *policy* is S6 |
| 5 | Tests | Offline contract-level tests for the new surface per §9 | Must not require a live issuer for the offline subset |
| 6 | Fence / transport | **Explicitly excluded.** `user-portfolio-transport.ts` and `owner-context-unavailable.ts` remain byte-unchanged; the six routes remain `503` | Fence disposition is S7 |

### 8.2 Explicitly not part of P-6

No fence change; no route or UI activation; no consumer admission; no `P2`/`P3` disposition; no successful-write policy (S6); no canonical identifier selection (`DP-2`); no change to the F-3 carrier/resolver; no Reports changes; no lockfile or package-pin change; no persistence, schema or migration change on either side.

### 8.3 IPD-side changes

**None required by 1A′.** The target consumes the anchor through three pre-existing environment variables and validates the credential itself; `src/auth/config.ts`, `src/auth/oidc-verifier.ts` and `src/app_identity/*` are consumed exactly as pinned. Should any future step want an **IPD source change** (the 1C-class option, *not* selected), it would require its **own IPD-side act**, a change on `arena/01a0e6d9…`, re-qualification of the `g24_*` suites, and a revisit of `AD-03` reference-only status — none of which is authorized, requested or implied here. G24 promotion to IPD `main` remains **PROHIBITED** (act `26061859…`).

### 8.4 IPD-side runtime/configuration operations

Starting the scoped non-production G24 runtime and setting its three `IPD_OIDC_*` variables and its `IPD_PORTFOLIO_DB_PATH` are **runtime operations on a non-production process**, not repository writes. They are nevertheless **not** authorized by `GC-D3` (§2.3) and must be named in the P-2 act (§5.2 R-2.9). They write **no** IPD ref, branch, tag or file.

### 8.5 Ordering constraint on P-6

The P-6 act cannot be usefully exercised before P-2 is executed (there is no issuer or credential to acquire) and before P-4 fixes the mapping that makes resolution succeed. The P-6 act may be *rendered* earlier; its *exercise* is dependency-ordered last among the constitutive acts.

---

## 9. P-8 — Independent trust-path qualification requirements and evidence

P-8 is the verification bar from the S5 investigation §9, restated here as an executable specification. **None of it is executed or claimed.** Every result must be labelled either **offline qualification** (no live issuer, no database, no network) or **scoped non-production runtime evidence** (only as the P-2/P-4 acts expressly authorize), and **no result may be described as runtime, deployment or production readiness**.

### 9.1 Credential matrix

| Case | Expected | Layer |
|---|---|---|
| Valid, correctly signed token with the configured issuer/audience and an unexpired `exp` | Verified credential produced; resolution proceeds | G24 |
| Missing credential | Denied (401-class) | G24 |
| Malformed token (bad structure/encoding) | Denied | G24 |
| `alg` = `none` | Denied (`OidcAlgorithmRejectedError`) | G24 |
| Symmetric `alg` (e.g. `HS256`) | Denied | G24 |
| Unknown `kid` / absent `kid` where required | Denied | G24 |
| Invalid signature | Denied (`OidcSignatureInvalidError`) | G24 |
| Expired token | Denied (`OidcTokenExpiredError`) | G24 |
| Wrong issuer | Denied (`OidcIssuerMismatchError`) | G24 |
| Wrong audience (including the `iips-spa` audience) | Denied (`OidcAudienceMismatchError`) | G24 |
| Missing subject | Denied (`OidcSubjectMissingError`) | G24 |
| Unconfigured verifier (missing env) | Verifies nothing (`OidcConfigurationError`) | G24 |

Each negative case must also assert the **IRR-side** behaviour: the failure is preserved, not repaired, retried, defaulted or converted into a successful call, and no downstream state is written.

### 9.2 Mapping matrix

Unmapped `(issuer, subject)` → denied (`IdentityNotMappedError`, 403-class); `PENDING`, `APPROVED` and `RETIRED` mappings → refused (`resolveExternalIdentity` requires `ACTIVE`); `ACTIVE` mapping → exactly one `applicationUserId`; suspended application user → refused; **no request-time mapping creation is possible** (the port has no such operation; asserted by a no-call/no-write instrumented test).

### 9.3 Tenancy matrix

Zero memberships → refused; requested tenant absent → refused; requested membership non-`ACTIVE` (`REVOKED`) → refused; **more than one `ACTIVE` membership with no requested tenant → refused, never guessed**; exactly one `ACTIVE` membership plus the governed hint → resolved to that tenant; blank hint → denied at the IRR boundary before any port call; foreign tenant → refused with existence-hiding preserved.

### 9.4 Ownership / authorization matrix

Wrong owner and tenant-mismatched portfolio are indistinguishable from a nonexistent portfolio (404 hiding preserved); the `PortfolioAuthorizer` chain (identity → tenant → portfolio) is proven mandatory and unskippable by any IRR-side declaration, header, environment value or configuration.

### 9.5 Bypass cross-product (only if ever separately considered)

If any identity-resolution exception is ever separately considered, the declaration must be crossed with **all** credential, membership and owner negative cases plus server-controlled production/disabled rejection — the packet §5.E finding that *“G24-C6 alone is insufficient.”* **No such exception is part of 1A′, and none is recommended.**

### 9.6 No-trust-propagation evidence

Forwarded IRR headers, cookies, query parameters and claims confer nothing; caller-supplied identity fields remain refused at the IRR contract layer (2F `assertNoG2CallerAuthority` semantics intact under any contract v3); a caller-supplied `Authorization` header influences nothing.

### 9.7 Provisioning and audit evidence

The offline attestation record (§7.5.3) matches the G24 `mapping_audit_events` rows; **no IRR-side identity state is created**; the exactly-one-`ACTIVE`-membership post-condition of §7.3 is observed, not assumed.

### 9.8 Durability / restart

Mapping and membership resolution survive a G24 restart (SQLite durability facts already pinned), with separate-process evidence to the D-1 ext §6 standard where applicable. This **feeds** F-7 part (4); it does not complete F-7, whose full per-capability five-part form belongs to S6/S7.

### 9.9 Fence and admission invariance (proven, not assumed)

Throughout every P-8 qualification activity, `/api/user-portfolios*` remains `503 owner-context-unavailable` at source level and no consumer, route or UI activation occurs. The fence blobs of §3.1 must be re-verified byte-identical in the qualification record.

### 9.10 Evidence form and labeling

Each qualification record states: the act(s) it executes under, the exact pinned refs/blobs it ran against, the commands and their observed results, the negative-case assertions with their no-call/no-write instrumentation, the offline-vs-live label, and an explicit **“not claimed”** list (no production readiness, no deployment readiness, no full F-7, no admission, no successful write).

---

## 10. Prerequisite status, remaining acts, and the next genuine blocker

### 10.1 Status of P-1 … P-8 after this record

| # | Prerequisite | Status now | Basis |
|---|---|---|---|
| **P-1** | Distinct express DP-1 act | **COMPLETE — RENDERED.** Option 1A′ selected as a distinct express Program Authority act (`GC-D3`, packet §9.6). Not an inference, not a recommendation, not pending | §2.1 |
| **P-2** | Trust-anchor/issuer governance and configuration | **REQUIREMENTS COMPLETE (design rendered); ACT NOT RENDERED — BLOCKED ON A DISTINCT DECISION.** Ten requirements, the self-asserted-delegation governance treatment and seven decision inputs are fixed. The act that fixes the issuer, generates/custodies keys, publishes a JWKS endpoint and configures the scoped non-production G24 runtime is **not** authorized by `GC-D3` and is the **next genuine blocker** | §5 |
| **P-3** | Credential acquisition and presentation path | **DESIGN COMPLETE — RENDERED (design under P-1).** Legitimacy conditions, acquisition, presentation and the governed IRR owner context are fixed, with forwarded-Principal trust, browser trust, static/service credentials and caller-controlled content excluded. **Not operative** until P-2 is executed and P-6 is granted and exercised | §6 |
| **P-4** | Operator-only offline provisioning | **REQUIREMENTS COMPLETE; EXECUTION NOT AUTHORIZED — BLOCKED ON A DISTINCT ACT.** Bounded end state, exactly-one-`ACTIVE`-membership invariant, prohibited behaviours, auditability and the revocation path are fixed. No provisioning has occurred and none may occur without the act | §7 |
| **P-5** | Complete `D-2` §8 binding contract | **RENDERED — COMPLETE (design under P-1).** All fifteen elements specified; elements 1–8 moved off *Deferred*; identity-bearing parameter values reserved to P-2/P-4. Non-operative for live binding | §4 |
| **P-6** | Explicit implementation authority | **NOT GRANTED — BLOCKED; BOUNDARY FIXED.** Six surfaces enumerated, the fence/transport explicitly excluded, and no IPD source change required by 1A′ | §8 |
| **P-7** | Successful-write policy remains S6 | **PRESERVED — UNCHANGED.** The 2F pre-port refusal stands; this record yields no successful save and does not touch that policy | §6.5, §11 |
| **P-8** | Independent trust-path qualification | **REQUIREMENTS COMPLETE (plan rendered); EXECUTION NOT AUTHORIZED.** Six matrices plus durability, invariance and evidence-form requirements fixed. Nothing has been run; nothing is claimed | §9 |

### 10.2 Exact remaining distinct acts, in dependency order

| Order | Act | Content | Depends on |
|---|---|---|---|
| 1 | **P-2 configuration act** | §5.2 requirements + §5.3 governance statement + answers to Q-2.1…Q-2.7; authorizes the anchor's existence, key custody, JWKS, the issuer/audience values and the scoped non-production G24 runtime configuration (R-2.9). May optionally also fix the subject value and the tenant identifier (Q-2.5) and may be rendered jointly with act 2 (Q-2.6) | `GC-D3` (rendered) |
| 2 | **P-4 provisioning act** | §7 requirements: explicit authority for, and the record of, the offline operator acts creating exactly one user, one `(issuer, subject)` mapping in `ACTIVE`, one tenant and exactly one `ACTIVE` membership, with audit rows and the `G2ProvisioningRecord`-shaped attestation, plus the named revocation path | Act 1 (the issuer fixes the mapping key) |
| 3 | **P-6 IRR implementation authority act** | §8.1 surfaces 1–5 only (fence/transport excluded); exercised after acts 1–2 so there is a credential to acquire and a mapping to resolve | Acts 1–2 rendered (may be rendered earlier; exercised later) |
| 4 | **P-8 qualification execution** | §9 plan executed under acts 1–3; offline subset first, scoped non-production runtime evidence only as those acts authorize; results published and independently verified | Acts 1–3 |

**No further investigation is required before act 1.** The S5 investigation is complete and its decision input was complete; `GC-D3` has been rendered; this record supplies the design and the exact residual boundary. The remaining gap is **authority**, not evidence.

### 10.3 The next genuine blocker

> **NEXT BLOCKER (P-2):** the Program Authority must render the **P-2 configuration act** — fixing the issuer identifier, the algorithm/key and custody, the JWKS endpoint and trust relationship, the audience, key generation/rotation/compromise procedure, the subject semantics, the scoped non-production G24 runtime scope, and the §5.3 self-asserted-delegation governance statement — with the §2.3 prohibitions restated. `GC-D3` selects the direction but expressly does not establish an issuer or configure credentials, and `H-18`, `GC-D1`'s remaining operational prohibitions and `GC-D2`'s live-prohibition text all continue to withhold those operations until that act exists.

Nothing downstream (P-4 provisioning, P-6 implementation, P-8 qualification, then S6, then S7) is authorized or possible before it, and no technical compatibility finding substitutes for it.

---

## 11. Invariants preserved (verified at this record)

1. **User Portfolios HTTP `503` fence unchanged** — `frontend/server/reports-transport.ts` `98147054…`, `frontend/server/user-portfolio-transport.ts` `51704c12…`, `frontend/server/owner-context-unavailable.ts` `cb8db45d…`, all byte-identical to the recorded baseline; all six valid routes answer `503 owner-context-unavailable`, unknown path 404, wrong method 405+Allow.
2. **Option 2F refusal unchanged** — `userPortfolioContract.ts` `0dec72eb…`, `translationBoundary.ts` `93f602fd…`, `userPortfolioBoundary.ts` `b8024c6b…`, `userPortfolioPort.ts` `ba0001e8…`: unresolved or ambiguous writes are refused before serialization and before any persistence-port invocation; no successful save path exists.
3. **F-3 is not a principal, credential or tenant membership** — the owner-context pair remains partition semantics for NP-09/NP-10/NP-11 only; carrier `a576e5af…` and resolver `9738e9b3…` unchanged; not extended, copied or aliased anywhere in this record.
4. **No caller-controlled canonical identity or resolution disposition** — no such input is introduced or admitted by this record.
5. **No live IPD write and no protected-ref change** — all four IPD refs re-verified UNCHANGED (§3.2); IPD `pushed_at` unchanged; G24 promotion to `main` remains PROHIBITED.
6. **NP-04 and G24 lineages remain distinct** — `2e11fa3b…` and `6828155e…` unmerged, unre-pinned, un-promoted.
7. **No route/UI activation and no consumer admission** — no route, UI, consumer or `P2`/`P3` disposition is touched.
8. **S6 and S7 remain separately gated** — the successful-write identity policy and full F-7 (S6) and consumer admission (S7) are untouched and unapproved by anything here.
9. **Gate states unchanged** — Gate A OPEN; Gate B Option C; R3 OPEN (no live subject); R4-B CLOSED (not reopened); `D115-A` ineffective; no Company Identity Authority designated.
10. **No live binding exists** — this record creates no issuer, key, credential, configuration, user, mapping, tenant, membership, provisioning event or database write.

---

## 12. Validation performed and not performed (this record)

### 12.1 Performed (read-only unless stated)

1. Live ref/PR/branch re-verification exactly as tabulated in §3 (IRR fetch + API; all four IPD refs; IPD repository metadata; tested-2F-blob equality against the tested tree; fence and F-3 blob equality).
2. Direct read-only re-read of the target authority at `6828155e…` for the facts in §3.3 (`src/auth/config.ts`, `src/auth/oidc-verifier.ts`, `src/app_identity/service.ts`, `src/persistence/migrations/001_initial_schema.ts`, the `src/app_identity` and `src/persistence/migrations` tree listings) — no IPD write of any kind.
3. Re-read of the governing IRR records at the verified baseline: the Gate C packet (§§6, 7.1, 9.2–9.5, 10.1, 16.1–16.3), `D-2` §8, the G2 durable user-portfolio implementation record §5, the F-3 standing-authorization source, and the S5 investigation record.
4. Documentation-only mutation scope: **exactly three paths** — this record (new), the Gate C packet (additive §9.6 + §7.1 pointer + §10.1 pointer + §16.4 + header status), the canonical tracker (header, §2 `REG-12` row, §4 item, §5 change row, §15.11). Manifest and `git diff --check` verified before publication; protected blobs re-verified byte-identical.
5. Remote-API equality verification of every changed artifact against the merged `main` commit, after merge (§13).

### 12.2 Not performed (and none authorized)

No issuer stood up; no key generated, stored, published or rotated; no JWKS endpoint served; no `IPD_OIDC_*` variable set; no G24 runtime started or configured; no credential obtained, stored, refreshed or presented; no database created, opened or written; no user, mapping, tenant or membership provisioned; no `mapping_audit_event` written; no application test re-run (no application byte changed — re-running would re-prove identical code, and §3.1 proves the published bytes are the tested bytes); no live HTTP request to any endpoint; no IPD ref, branch, tag or file written; no Windows/PowerShell, Arena-archive or Library state accessed. **No runtime or production behavior is claimed or proven anywhere in this record; the 503 baseline remains a source-level determination.**

---

## 13. Publication and effectiveness

Published additively on the session branch `arena/080179a9-iips-review-recovered` (branched from `main@923988f…`) to `refs/heads/main` through the established pull-request workflow; no force-push, no history rewrite, no review-control bypass; no IPD write. Consistent with the program effectiveness rule, this record's statements about publication coordinates are completed **after** merge by the post-merge independent remote verification (PR verification comment plus tracker/completion evidence), never self-embedded.

Effectiveness of **this record** makes the rendered contract, requirements and plan durable; it does **not** create any authority beyond `GC-D3` and does not render any of the §10.2 acts. Only acts 1–3 in §10.2, each rendered by the Program Authority and durably published with independent verification, can produce a live binding.

---

*Recording agent: Arena Agent Mode — execution of the selected DP-1 Option 1A′ design and preparation of the distinct acts it entails, under the Program Authority's `GC-D3` selection and the attributed standing authorization for recording, publication and verification. No authority is rendered, inferred or fabricated by the agent. Program Authority: Ramki.*

*Status: **`DP-1 OPTION 1A′ SELECTED (GC-D3) — BINDING CONTRACT RENDERED (P-5) — P-2/P-3/P-4 REQUIREMENTS SPECIFIED — P-6 NOT GRANTED — P-8 PLAN FIXED — NEXT BLOCKER: P-2 CONFIGURATION ACT`.** Gate C remains OPEN; S2–S4 remain complete and verified; S5 investigation evidence preserved; S6/S7 remain separately gated; `/api/user-portfolios*` remains fail-closed at source-level HTTP `503 owner-context-unavailable`.*
