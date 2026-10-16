# IIPS v3.0 — G-2 Single-User Local Principal Security-Contract Decision Request

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-G2-LOCAL-SINGLE-USER-PRINCIPAL-SECURITY-CONTRACT-DECISION-REQUEST-2026-10-16-01` |
| Record type | **Decision request with attributed Program Authority response** — design direction only; no implementation, qualification, admission, or release authority |
| Date | 2026-10-16 (Asia/Calcutta) |
| Decision authority | **Ramki / Program Authority**; IPD contract adoption remains a separate durable authority step |
| Scope | Assess one trusted, server-established local principal for the existing single-user personal application; non-production only |
| Status | **OPTION A SELECTED IN PRINCIPLE — SAME-HOST OS-PROTECTED LOCAL IPC DESIGN ONLY; FINAL IPD CONTRACT ADOPTION AND EXACT RUNTIME LIMITS OPEN** |
| Baseline reviewed | IRR `main@eb4bf820c62eb3e2f5c628a95d59c8f967e3f629`; IPD `main@70b24f029842a7e9b7f615e4d9df7376fd4ff817`; off-main G24 source inspected at `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` for contract facts only |

> **Attributed Program Authority response received:** Option A was selected in principle for **design only**, with **same-host OS-protected local IPC** as the candidate trusted boundary. This does not amend the IPD security contract, authorize implementation or qualification, provision an identity, permit successful writes, or reconsider the HTTP 503 fence. No IPD source/ref, application code, test, dependency pin, or tracker was changed for this request.

## 1. Decision requested

Decide whether the IPD-owned user-portfolio boundary may support a **single, non-OIDC, server-established local principal** for this personal application, without adding global authentication, enterprise identity infrastructure, multi-user capability, or a new portfolio store.

The decision must answer whether a local principal can be trusted across the actual IRR-to-IPD boundary while retaining all of the following:

1. One explicit, stable IPD portfolio owner identity, not supplied or selected by a browser request.
2. Server-side authorization on every operation and isolation between that owner’s portfolios and every other owner’s data.
3. An explicit IPD `applicationUserId` binding; no inferred equivalence to the F-3 `ownerUserId`, an IRR principal, raw subject, tenant, company ID, or caller identifier.
4. A precise decision about the existing G24 tenant-membership requirement: either reuse an expressly authorized single membership in the existing IPD model, or authorize a different owner-isolation contract. Do not create or infer a tenant value in this request.
5. Canonical company-identity validation, independent of principal binding. No ticker, ISIN, FIGI, symbol, or client field becomes canonical by inference.
6. Continued refusal of unresolved or ambiguous writes under DP-2 Option 2F.
7. Durable writes, read-after-write, revision/concurrency controls, auditability, and restart durability using the IPD-owned portfolio domain—not a parallel IRR portfolio store.

### Requested disposition options

- **A — Approve a bounded local-principal contract in principle, for design only.** This would be a material amendment to the current G24 trust contract, limited to the single-user personal application and subject to answers to §3. It would not approve implementation, successful writes, qualification, or route admission.
- **B — Reject the local-principal model.** If no non-caller-controlled trust boundary can be established within scope, record that it cannot satisfy IPD’s security requirements; retain the 503 fence and do not pursue the model.
- **C — Defer.** Keep the current 503 fence and all existing contracts unchanged until the specific unanswered questions in §3 can be decided. No exploratory code or credential work is authorized by deferral.

An approval must state the exact contract clauses changed and the limits of the approved principal, trust boundary, owner binding, and tenant treatment. Silence, the single-user product scope, DP-1 Option 1A′, P-2 completion, standing routine-work authority, or G-2 architecture acceptance is not approval.

## 2. Incompatibility and feasibility finding

### Plain-English incompatibility

**G24 does not currently accept a local IRR principal as proof of identity.** Its inspected HTTP path requires an OIDC bearer verified by IPD, followed by an active external-identity mapping to an IPD `applicationUserId` and active tenant membership. DP-1 Option 1A′ explicitly excludes forwarded IRR-principal trust, caller-supplied identity, static/service credentials, and operator bypass. A local owner ID or tenant hint is not a credential and cannot be placed in a header, body, cookie, or URL and treated as one.

Accordingly, the proposal is **not compatible with the current G24 security contract as written**. Accepting a local principal would require an explicit IPD security-contract change. It cannot be achieved by merely adding an IRR header, reusing the F-3 pair, relaxing the verifier, or treating a loopback address, browser origin, or single-user label as authentication.

### What is and is not technically demonstrated

- **Demonstrated at the inspected G24 source ref only:** downstream portfolio operations take IPD `applicationUserId` and `tenantId` as explicit scope; the authorizer enforces identity → tenant → portfolio checks; the durable store scopes reads/writes by those values and applies revision and consolidation rules.
- **Not demonstrated:** a trusted local-principal source, an unforgeable IRR-to-IPD channel for that principal, an IPD `main` implementation of that path, or an end-to-end IRR/IPD local-principal flow. The G24 source inspected for these facts is off-main and must not be promoted, merged, cherry-picked, or repinned under this request.
- **Conditional feasibility:** the existing owner-scoped authorization and durable-store concepts could be reused *if* IPD defines and accepts a trustworthy local trust boundary and binds exactly one server-established local principal to an explicit IPD owner identity. That is a proposal, not a proven compatibility result.
- **Direct failure condition:** if the only available input is an unauthenticated browser request or a caller-controlled owner/principal field, or if the service is reachable by untrusted callers without another in-scope access boundary, the local-principal model cannot establish that the caller is the owner. In that case it cannot satisfy the stated security requirements and must be rejected.

**Preparation-time recommendation (superseded in part by §8):** do not treat the local-principal contract as immediately implementable. The existing G24 HTTP contract rejects it, and no trusted local process/channel boundary had been demonstrated. The Program Authority subsequently selected Option A in principle and named same-host OS-protected local IPC as the design direction. That resolves the direction only; it does not yet establish the exact process identity, OS permissions, runtime exposure, or implementation/qualification authority.

The current F-3 owner-context pair remains partition context for its governed existing capabilities; it is not an authenticated principal, G24 `applicationUserId`, or membership. D115’s principal/company-binding contract is not an identity shortcut for G-2. D115-A effectiveness and Company Identity Authority designation are separate matters; this request creates neither and does not reopen D115.

### Independent write-identity gate

A local principal would not resolve DP-2’s holding identity question. DP-2 Option 2F remains in force: unresolved or ambiguous holdings must still be refused before persistence. Before any successful write can be authorized, the applicable contract must identify an authorized canonical company-identity resolution source and require exactly one valid resolution; zero or multiple candidates remain refusals. This request does not designate that source, change `companyId` semantics, or grant a successful-write policy.

### Durable-store boundary

G-2 continues to require IPD ownership of the portfolio domain and extension/reuse of its portfolio store, not a parallel store. The G24 durable-store source previously inspected is off-main; it is not an authorized implementation base here. The future implementation decision must name an eligible IPD `main` basis or separately authorize an IPD-main implementation plan consistent with G-2. It must not promote or transplant the off-main lineage under the guise of reuse.

## 3. Technical questions to answer before contract approval

These are decision inputs, not permission to start experiments or implementation.

1. **What is the trusted caller boundary?** Is the intended runtime strictly local to the sole operator, or can it be reached through a remote browser, reverse proxy, preview host, LAN, or shared server? What concrete OS/process/network boundary prevents an untrusted caller from reaching owner-scoped operations? Loopback, CORS, `Origin`, `Host`, and a single-user assertion alone must not be presumed to authenticate a caller.
2. **How is the local principal established and protected?** Name the server-owned source and the exact trust mechanism between IRR and IPD. It must be non-caller-controlled and resistant to forged headers, direct HTTP calls, browser requests, and cross-site request triggering. If the design needs a shared secret, service credential, OIDC, or another excluded mechanism, state that and reject or return for a new scope decision rather than silently introducing it.
3. **What IPD owner identity is bound?** Specify how IPD allocates or selects exactly one opaque `applicationUserId`, how the local principal maps to it, how that binding is revoked/changed, and how the binding is audited. No identifier literal or identity equivalence is selected by this request.
4. **What is the tenant treatment?** Can the existing IPD membership model be reused as a single-user partition without introducing tenant infrastructure, and if so what exact existing authorized tenant record is used? If not, what change to the authorizer and durable-store ownership key is required? The F-3 `tenantId` must not be copied or treated as a G24 membership.
5. **Can current IPD authorization remain mandatory?** Show that every local-principal request still traverses server-side owner/tenant/portfolio authorization, preserves unauthorized-as-not-found behavior where applicable, and cannot select another `applicationUserId`, tenant, or portfolio through request content.
6. **What happens at the browser-facing edge?** Specify exposure, CSRF protection, same-origin behavior, proxy behavior, and the denial behavior for requests outside the explicitly approved local boundary. If this answer depends on deployment configuration, identify who controls and verifies it.
7. **What canonical holding identity source remains valid?** Identify the separately authorized canonical resolution source and exact zero/one/multiple-match behavior without weakening DP-2 Option 2F. If no source is authorized, successful writes remain unavailable regardless of principal approval.
8. **What eligible durable implementation is actually on IPD `main`?** Identify the IPD-main store/domain that can be extended. The off-main G24 ref is not an allowed substitute. Confirm how the existing revision, concurrency, merge/replace, idempotency, lineage, and restart guarantees will be retained without a parallel store.

If any answer requires multi-user/enterprise identity, OIDC/Keycloak work, a new tenant platform, or caller-supplied identity, it is outside the stated scope and this request does not authorize it.

## 4. Exact decision authority required

1. **Contract decision:** an explicit, additive decision by **Ramki / Program Authority** under G-2/Gate C, recorded with the exact proposed local-principal trust and ownership contract. It must expressly amend or supersede only the conflicting DP-1 Option 1A′ identity/credential trust clauses that prohibit this model, while preserving DP-2 Option 2F, the G-2 IPD ownership boundary, single-user scope, and all stated fail-closed requirements. It must not reopen P-2 or F5R.
2. **IPD security-contract acceptance:** because IPD owns the portfolio domain and the changed trust boundary is enforced by IPD, the decision must also be accepted for the authoritative IPD security/API contract. If Ramki is the authority for both decisions, the record must state that explicitly in both capacities and identify the IPD authoritative repository/ref. An IRR-only note does not silently change IPD’s security contract.
3. **Implementation:** a later, separate, explicit implementation-execution authorization must name the exact IPD and IRR repositories, authoritative base refs, code/configuration/test surfaces, local trust mechanism, data/provisioning effects, and exclusions. Any IPD source or runtime change requires IPD-side authority. The existing D115 implementation authorization and routine-work standing authority do not cover this G-2 security-contract change.
4. **Qualification and admission:** separate explicit qualification/acceptance authority and a later per-capability admission decision are required. The prior OIDC-oriented P-8 plan is not qualification for a local-principal design. No route or successful-write authority follows from approving this contract request.

## 5. Shortest contingent implementation and qualification sequence

No step below is authorized now. If §4.1–4.2 are approved and §3 answers establish a safe design:

1. **Publish the contract decision** in the governing IRR record and corresponding IPD security-contract record. Freeze the single-user threat model, trust boundary, `applicationUserId` binding, tenant treatment, revocation, audit, canonical-identity rule, and fail-closed outcomes.
2. **Issue exact implementation authority** for both repository sides and identify the eligible IPD `main` store/domain to extend. If no approved durable store implementation is on IPD `main`, stop for a separately authorized IPD-main implementation plan; do not promote, cherry-pick, merge, or repin the off-main G24 lineage.
3. **Provision one local owner binding through an explicit IPD-side act.** Bind one IPD-established opaque `applicationUserId` to the local server principal; use only the tenant treatment approved in §1. Do not create a request-time mapping or trust an owner identifier from the browser. Define and verify revocation before use.
4. **Implement the narrow server boundary.** IRR derives the principal only from the approved server-owned source; IPD validates the trusted boundary and derives the authorized owner scope server-side. Reuse the approved IPD portfolio store, authorizer, revision controls, and transaction path; do not add a parallel portfolio store. Keep client-supplied owner, tenant, principal, and company identity fields non-authoritative/refused.
5. **Keep Option 2F and company validation independent.** Refuse unresolved/ambiguous holdings before any port call or persistence. Do not enable successful writes until a separately authorized canonical resolution source and successful-write policy are established.
6. **Run bounded non-production qualification:**
   - principal-source tests: absent, malformed, changed, forged, browser-supplied, direct-HTTP, and cross-site inputs fail closed; no identity/owner is inferred;
   - authorization tests: exact one-owner access succeeds only within the approved boundary; foreign owner/tenant/portfolio attempts are denied without disclosure;
   - binding-lifecycle tests: revocation/change takes effect, stale contexts fail closed, audit is emitted;
   - identity tests: one canonical match may proceed only under the separately approved policy; zero or multiple matches are refused before port/store invocation;
   - persistence tests: existing store transaction, revision conflict, idempotency/consolidation, read-after-write, and separate-process restart durability pass; no parallel store is created;
   - routed integration tests: IRR-to-IPD requests exercise the real approved boundary and authorizer, not only store-level or mocked tests; no browser can provide identity or credentials.
7. **Publish exact evidence and obtain independent review.** Qualification must state its non-production and single-user limits; tests or store success alone do not establish end-to-end acceptance.
8. **Seek a separate admission decision.** Only after contract approval, authorized implementation, successful qualification, and independent evidence verification may the Program Authority consider a narrow per-operation admission act. Read and write operations may be admitted separately.

## 6. Conditions for reconsidering the HTTP 503 fence

The existing `/api/user-portfolios*` **503 `owner-context-unavailable` fence remains unchanged** through this decision request and every contingent design/implementation step. It may be reconsidered only after all applicable conditions below are met:

- an effective IRR and IPD security-contract decision accepts the local-principal model and its threat boundary;
- separate implementation authority is issued and the eligible IPD-main durable-store basis is named;
- a single explicit IPD owner binding and its revocation/audit behavior are implemented and verified;
- owner isolation, server-side authorization, canonical company validation, DP-2 Option 2F refusal, revision controls, and separate-process durability pass the approved end-to-end qualification;
- any successful-write policy and canonical identity source have their own required authority; and
- a separate admission act names the exact operation(s), route(s), environment, and limitations allowed.

Passing design review, unit tests, or a local preview is not enough. If only reads are qualified and admitted, writes remain fenced. If the local trust boundary cannot exclude untrusted callers without introducing an out-of-scope authentication mechanism, the correct disposition is to reject the proposal and retain the 503 fence.

## 7. Governing records and non-repetition boundary

This request is limited to the contract gap and decision authority; it does not repeat their completed investigations:

- [G-2 Durable User Portfolio Architectural Decision](IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md) — IPD owns and extends the portfolio domain; IRR consumption is separately governed.
- [Gate C DP-1 Option 1A′ binding contract and prerequisite specification](IIPS_v3.0_GATE_C_S5A_DP1_OPTION_1A_PRIME_BINDING_CONTRACT_AND_PREREQUISITE_SPECIFICATION_2026-10-13.md) — current OIDC trust path and its explicit exclusions; a local principal is a contract change, not an interpretation.
- [Gate C P-2 scope correction](IIPS_v3.0_GATE_C_P2_SCOPE_CORRECTION_AND_F5R_DISPOSITION_2026-10-14.md) — OIDC/authentication work is out of scope; P-2 is not repeated, and F5R is not reopened.
- [Gate C portfolio identity/security decision packet](IIPS_v3.0_GATE_C_PORTFOLIO_IDENTITY_AND_SECURITY_IDENTIFIER_CONTRACT_PA_DECISION_REQUEST_2026-10-13.md) — DP-2 Option 2F refusal remains unchanged.
- [D115 / D-2 / G-2 reconciliation](NP-08-D115-D2-G2-RECONCILIATION-ACT.md) and [D115 implementation-authorization record](NP-08-D115-IMPLEMENTATION-AUTHORIZATION-DECISION-RECORD.md) — separate principal, owner, tenant, and canonical-company namespaces; no authority to infer equivalence or create a Company Identity Authority.
- Current sources cited in the prior G-2 feasibility assessment: IRR G-2 transport at IRR `main@eb4bf820…`; G24 OIDC verifier, authorization, identity service, and durable store at off-main IPD ref `6828155e…`. These are reference evidence only, not an admission or promotion of that code.

---

## 8. Attributed Program Authority response and remaining dependency

**Response received in the Arena session on 2026-10-16:** the Program Authority selected **Option A — approve in principle for design only**. In the follow-up, the authority selected **same-host OS-protected local IPC** as the trusted-boundary design direction and expressly characterized that choice as not implementation authority, with exact threat/runtime limits still required.

Record the resulting status precisely:

- **Resolved:** the authority prefers a bounded local-principal design based on same-host OS-protected IPC over rejecting the concept at this stage.
- **Not resolved:** this is not a final, operative IPD security-contract amendment. The exact OS peer/process identity, endpoint permissions, service exposure, browser-to-IRR access boundary, lifecycle/revocation, `applicationUserId` binding, and tenant treatment have not been defined or verified.
- **Authority granted:** design refinement and preparation of an IPD-side contract proposal only, as captured by the response. **No source/configuration change, provisioning, implementation, qualification, successful-write, release, or route-admission authority was granted.** P-4, P-6, P-8, successful-write policy, and admission remain distinct gates.
- **Next dependency:** Ramki, as the identified Program Authority and IPD repository owner/admin, must approve and durably publish an explicit IPD-side security-contract amendment that defines the exact OS-protected IPC trust boundary and all owner/authorization semantics. The current IRR PR is a publication vehicle for this request and its attributed response; it is not itself the IPD contract amendment. IPD had no open PR or issue at the time of routing, and publication or a green check is not approval.
- **Hard stop:** if the detailed IPC boundary cannot exclude unauthorized local or remote callers without introducing a prohibited authentication/service-credential mechanism, reject the approach and retain HTTP 503.

This response advances the request to a design-only direction; it does not claim that the local-principal model has already been proven compatible with G24. The next authorized work is limited to defining the approved IPC contract and presenting it for the explicit IPD-side decision, not implementing it.

---

**End of request and attributed response.** No IPD security contract or source was changed. No application tests, credentials, provisioning, implementation, qualification, successful writes, or fence changes were performed.
