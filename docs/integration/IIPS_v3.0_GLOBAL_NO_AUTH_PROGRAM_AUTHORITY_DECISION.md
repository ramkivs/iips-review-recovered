# IIPS v3.0 — Global NO-AUTH Program Authority Decision (Candidate)

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-GLOBAL-NO-AUTH-PA-DECISION-01` |
| Record type | Additive Program Authority decision and bounded implementation-authority act; proposed for Program Authority acceptance |
| Status at preparation | **PROPOSED — exact-record acceptance and separate merge authorization pending; NOT EFFECTIVE** |
| Date | 2026-10-12 (Asia/Calcutta) |
| Decision authority | Ramki (Ramakrishnan) — Program Authority / application owner, as identified by the authoritative H-18 and G1 records |
| Decision source | Product direction and requested scope explicitly supplied in the task for this record. The recording agent renders no decision and accepts no authority on the Program Authority's behalf. |
| Recording agent | Arena Agent Mode — preparation, verification, and publication-workflow support only |
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Verified pre-proposal `origin/main` | Commit `8c1d05d550cdf753e8b8f8ffe5c5fa9549edd73f`; tree `c3d811fb17d09a941fd8b2e4ba03c969f08642dc` |
| Intended authority boundary | Non-production, first-party IIPS application surfaces in this repository. Production and the separate IPD repository are excluded. |
| Effectiveness | This proposal has no present effect. The proposed decision and implementation authority take effect only after explicit Program Authority acceptance of this exact record, separate explicit merge authorization, merge to `refs/heads/main`, and independent remote verification. |

---

## 1. Purpose and decision status

This record proposes an additive, product-wide authentication posture for the single-user, personal-use IIPS application. It is prepared to resolve the gap between the recorded product direction and the current authentication implementation. It does **not** claim that the current `origin/main` already authorizes global authentication removal.

At the verified baseline, **no effective global NO-AUTH/NO-OIDC application decision and no global implementation authority for removing existing authentication were found**. This proposal is not an implementation, an approval, an acceptance, or a publication to authoritative `main`. A branch commit or pull request alone will not make it effective.

The product direction recorded here is the direction supplied by the Program Authority in the task. The detailed rule below is a **proposed decision** for explicit PA review and acceptance; it is not an agent-rendered decision.

## 2. Verified governance context at the baseline

The following artifacts and blobs were present in the GitHub tree for `origin/main` at the baseline in the header. The cited records are preserved; this proposal does not rewrite them.

| Record on verified `origin/main` | Baseline blob / relevant publication | Existing scope or status |
|---|---|---|
| [`IIPS_v3.0_H18_PRODUCT_SCOPE_SINGLE_USER_PERSONAL_USE.md`](IIPS_v3.0_H18_PRODUCT_SCOPE_SINGLE_USER_PERSONAL_USE.md) | `a13f7a3469268c329d1e676ee85c44906e98d61c`; H-18 was included in merged PR #52 (merge `3b78bb372af9f50277c23dc8441a36202a552fe9`) | Records single-user/personal-use scope, but its status remains candidate/pending. §§2–5 expressly preserve existing authentication and withhold auth-removal and implementation authority. |
| [`IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md`](IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md) | `2f89bbc94c0040e33a354893e99f8761636d526e` | Candidate R2 revision 3; its status says not approved/not authoritative and `G2_IMPLEMENTATION_AUTHORITY=NONE`. No authority is inferred from file presence. |
| [`IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md`](IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md) and [`IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md`](IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md) | Blobs `5f341ac68f1307d77e9827bedb42ed5a136b2705` and `857d14513c3fc2c45f9015145fc7f36cd7ad6141`; G1 publication commit `800789957f2a3cf4e28d5dfff49d92f29d6a7671` | The IRR OIDC/PKCE shell versus the IPD NO-OIDC target conflict was left for PA resolution. G1 host selection does not grant global auth-removal authority. |
| [`IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md`](IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md) | `ec80ef89aba3deb2ef1c7ae26afb52e9b8085ee9`; decision commit `0a36dee60637e14f8cc092bfcd44bf786bda4d21` | D-2 preserves domain-scoped identity/tenant boundaries, says existing authentication boundaries remain intact, and grants no auth, tenant-directory, credential-path, or implementation changes. |
| [`AUTHENTICATION_AUTHORITY_HARD_STOP.md`](../v3.0/g3-build/AUTHENTICATION_AUTHORITY_HARD_STOP.md) | `322c1b41f0607b87b33b59322ad26abf53a43515` | G3's enterprise identity/authentication authority and tenant/role sourcing are unresolved. It does not authorize this application's auth removal. |
| [`NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT.md`](NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT.md) | `1df62a9eb4afd2ccfc0a201490ba66d4ca1ea277`; decision commit `06c556e05770307a02983ce4b81b97c2c070fdfa` | D08 Macro-only authority. Its NO-AUTH choice is for an unauthenticated upstream MoSPI GET; it preserves the application-side guarded transport and is not global application-auth authority. |

## 3. Proposed product decision

**Proposed:** IIPS is a single-user, personal-use application. For the non-production, first-party IRR application in this repository, the owner must be able to open every retained in-scope UI surface and call its in-scope first-party API/server capabilities without signing in or presenting an authentication credential.

The proposed scope includes the browser shell and every retained first-party route/API transport serving it, including the AI Explanation (`/ai-advisory`) surface, shared navigation/session dependencies, and server-side authentication middleware or guards. It is not limited to removing a login screen.

When effective, no in-scope application surface may initiate or require an application login, OIDC/PKCE authorization or callback, logout/token-refresh flow, session token, Bearer credential, `authFetch` credential, login redirect, or authentication-only route/server guard. In-scope API requests must not fail solely because authentication credentials are absent. No replacement authentication, anonymous token, credential store, or identity-provider integration is authorized.

This is an application access posture. It does not change third-party provider terms, upstream authentication/entitlement, data-source selection, endpoint admission, or the business meaning of a capability.

## 4. Supersession and retained boundaries

Upon becoming effective, this decision supersedes **only the conflicting application-authentication boundaries** in the following records, for the in-scope IRR application described in §3. Historical records remain unchanged and continue to record their original decisions.

| Record | Proposed resolution when this decision is effective | What remains unchanged |
|---|---|---|
| H-18 | Supersedes H-18's existing-auth preservation and no-removal boundary only for the in-scope IRR application's authentication flow and auth-only guards. | H-18's single-user/personal-use product direction and non-production scope are retained. H-18 is not represented as having authorized this removal. |
| G1 | Resolves the IRR-shell portion of the OIDC/PKCE versus NO-OIDC conflict in favor of no application authentication for the in-scope IRR surfaces. | No decision is made for IPD, another repository, production, or any IPD-owned capability. |
| D-2 | Supersedes D-2's “existing authentication boundaries remain intact” rule only to the extent it would require authentication for an in-scope IRR request. | Domain-scoped identity/tenant boundaries remain; no universal identity, tenant, owner, Company Identity Authority, or cross-domain mapping is created. No client-supplied identity becomes trusted. |
| G3 hard stop | Removes the need to build or select an authentication authority for the in-scope single-user IRR application. | Enterprise G3 identity, tenant membership, IdP, and role architecture remains out of scope and unauthorized. No authentication system is to be built. |
| G2-2 | This candidate is not treated as authority and is not adopted as a source of scope or admission. This decision grants only the bounded auth-removal authority in §6. | No G2 capability, endpoint, provider, persistence, or production admission is created or expanded. |
| D08 Macro | No supersession is needed or claimed. | Its upstream MoSPI-specific NO-AUTH decision remains capability-scoped and is not the basis for this global application decision. |

## 5. Principal, tenant, role, and owner-scoped behavior

The proposed NO-AUTH posture is **not** a fabricated or implicit identity. The following rules govern implementation once the decision is effective:

1. **No synthetic principal.** Do not create or substitute an `anonymous`, `system`, default, hard-coded, or owner-named `Principal`; do not accept browser-supplied `userId`, `tenantId`, or roles as authoritative; do not introduce credentials, tenant membership, multi-user support, or a cross-domain identity mapping.
2. **Retire authentication-only role gates.** Viewer/analyst/admin distinctions used solely to decide whether a signed-in principal may navigate to or call an application surface are retired for the single-user product. Navigation must not make a retained route require a role-bearing session. This does not authorize new RBAC or a replacement role source.
3. **Preserve domain behavior.** Keep calculation semantics, business validation, capability rules, DTOs, provenance/evidence contracts, stored data, and error handling that are independent of authentication. A business rule must not be removed merely because it is expressed near an auth check; mixed checks must be separated narrowly and tested.
4. **Preserve existing owner/tenant data.** Do not rewrite, merge, reassign, or expose stored owner/tenant partitions by dropping their filters. Keep existing fields and contracts unchanged. This decision creates no single-tenant mapping or new owner identity.
5. **No inferred owner for principal-dependent operations.** A capability may continue owner-scoped reads/writes only where an existing, explicit non-auth source already determines the same owner scope without changing its data contract. If its only owner/tenant selector is the authenticated principal and no such source exists, do not guess, widen the query, or fabricate a successful result. Preserve the data; make the affected operation unavailable using its existing non-auth domain/unavailable error behavior (never a 401/403 solely for missing authentication), and seek a separate PA ownership/data-semantics decision before adding a binding or migration.
6. **Retire multi-user administration.** User, role, and tenant-membership administration that exists solely to operate an enterprise identity/RBAC model is not a single-user capability. Do not leave such mutations exposed as unauthenticated multi-user management; retire/disable that sub-capability rather than building a replacement. Other independently meaningful business functions remain subject to their existing non-auth rules.

This rule preserves data and business contracts where possible while forbidding an implicit identity or cross-owner data exposure. It does not claim that every existing principal-dependent data operation will remain available until it has a legitimate non-auth owner source.

## 6. Proposed implementation authority and scope

**Authority proposed for the Program Authority to grant upon acceptance and effectiveness:** the implementation owner may make narrowly bounded changes in this repository to remove authentication-only dependencies that block direct access to the retained in-scope application surfaces, including:

- browser OIDC/PKCE login, callback, logout, session/token storage or refresh, and login redirects;
- authentication-required client wrappers and request credentials, including `authFetch` requirements;
- authentication-only route guards, principal/token construction used only for authentication, OIDC/JWKS validation, and server middleware that rejects an in-scope request solely for lacking credentials;
- authentication-only error presentation and tests/configuration/dependencies used exclusively by those mechanisms, removing them only when their auth-only use is verified.

The authority is limited to the application authentication boundary and necessary focused tests/evidence. It does not authorize a broad redesign or changes to feature calculations, unrelated business logic, API/DTO contracts, persistence schemas, provider integrations, or unrelated dependencies.

### Explicit exclusions

No authority is granted for production deployment or production repositories; IPD mutation; new authentication, credentials, anonymous tokens, identity providers, RBAC, tenant membership, multi-user support, PostgreSQL, enterprise architecture, new owner/tenant mappings, owner-data migration/reassignment, cross-tenant data access, endpoint/capability admission, provider/entitlement changes, or changes to certified calculations, provenance semantics, or unrelated frozen logic.

## 7. Publication and merge authority

- **This decision record:** the current task authorizes preparation and submission of this one candidate record through a normal PR from the fixed session branch to `main`. That candidate publication is not PA acceptance, merge authorization, or effective `main` authority.
- **Merge of this governance record:** **not authorized by this candidate.** The existing H-18 gate requires PA review/approval and a separate explicit merge authorization before merge, followed by independent verification of `origin/main`. Do not infer those approvals from a branch commit, push, PR creation, or the wording of this proposal.
- **Implementation PR after effectiveness:** the proposed decision grants authority to publish the bounded implementation and evidence through the repository's normal PR workflow and to merge that implementation PR to `origin/main` after the decision is effective and the required tests/evidence pass. No direct push or force-push to `main` and no deployment authority is granted.
- **No implementation in this task.** Implementation authority, if accepted, remains dormant until the effectiveness conditions below are met.

## 8. Acceptance, effectiveness, and status transition

This proposal reuses the existing PA decision-act pattern for explicit, bounded implementation authority (as in the published D08 Macro authority act) and the candidate-review sequence stated in H-18 §8. It introduces no new acceptance body or governance authority.

Required sequence:

1. Program Authority reviews and explicitly accepts this exact record and its proposed principal/owner-data rule.
2. Program Authority separately authorizes merge of this governance record.
3. The authorized PR is merged to `ramkivs/iips-review-recovered @ refs/heads/main`.
4. The merged main commit/tree and this record's path/blob are independently verified remotely.
5. Only then is the decision effective and the implementation authority in §6 active.

At preparation, exact-record PA acceptance, separate merge authorization, main publication, and effectiveness are **PENDING**. A candidate branch/PR is non-authoritative. If PA acceptance changes the scope or data rule, update and re-review the exact record before merge.

Publication coordinates for this self-referential record (resulting main commit/tree/blob and any merge PR) must be recorded in the publication report after the merge; they are not asserted here in advance.

## 9. Final status block

```text
GLOBAL_NO_AUTH_DECISION=PROPOSED; SINGLE_USER_PERSONAL_USE; IRR_FIRST_PARTY_UI_AND_API; AI_EXPLANATION_INCLUDED
CURRENT_ORIGIN_MAIN_AUTHORITY=NO_EFFECTIVE_GLOBAL_NO_AUTH_OR_AUTH_REMOVAL_AUTHORITY_VERIFIED
PA_ACCEPTANCE_OF_THIS_EXACT_RECORD=PENDING
GOVERNANCE_RECORD_MERGE_AUTHORIZATION=PENDING_SEPARATE_EXPLICIT_PA_AUTHORIZATION
ORIGIN_MAIN_PUBLICATION=NOT_YET
DECISION_EFFECTIVE=NO
IMPLEMENTATION_AUTHORITY=PROPOSED_ONLY; NOT_EFFECTIVE
IMPLEMENTATION_IN_THIS_TASK=NONE
NO_SYNTHETIC_PRINCIPAL_OR_TENANT=REQUIRED
OWNER_SCOPED_DATA=NO_GUESSING_NO_MIGRATION_NO_CROSS_OWNER_EXPANSION
PRODUCTION_AND_IPD=OUT_OF_SCOPE
NEXT_GATE=PA_ACCEPTANCE_OF_EXACT_RECORD; SEPARATE_MERGE_AUTHORIZATION; MERGE; REMOTE_VERIFICATION
```

*End of proposed decision record. It records the requested product direction for PA review; it does not assert PA acceptance or authorize implementation before it becomes effective on `origin/main`.*
