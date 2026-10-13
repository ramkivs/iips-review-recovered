# IIPS v3.0 — Gate C: Portfolio Identity & Security-Identifier Contract — Decision Packet and Implementation-Ready Plan

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG12-GATE-C-IDENTITY-SECURITY-ID-CONTRACT-DECISION-PACKET-2026-10-13-01` |
| Gate | **Gate C — Portfolio Identity & Security-Identifier Contract** (`REG-12` / `G-2` / `F-4` / `AG-5`) |
| Record type | **DECISION PACKET + IMPLEMENTATION-READY PLAN. Non-operative.** It prepares and recommends; it selects nothing, decides nothing, admits nothing, activates nothing, and authorizes nothing. |
| Deciding authority | **Ramki** — single owner, sole user, and Program Authority of the single-user, personal-use, non-production IIPS platform |
| Recording agent | Arena Agent Mode — investigation, preparation, verification and publication support only. **No authority is rendered by the agent.** |
| Preparation date | **2026-10-13** (Asia/Calcutta). Recorded on its actual date; not backdated. |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main` |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not modified by this record** |
| Verified IRR baseline at preparation | `main@4b3d5866b9e8a8dcbfda18d8dcdef7e700e6ceeb` (merge of PR #81; `R4-B` remediation) — re-verified live 2026-10-13 |
| Verified IPD baselines at preparation | `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`; pin branch `np04-governed-persistence-windows@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; G24 `arena/01a0e6d9-iips-production-market-data` and `arena/01a0f308-iips-production-market-data` both `@6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`); act branch `arena/01a0f839-iips-production-market-data@12c480b5bf5cfbe0f296fcd12c9189328b915417` — **all four re-verified live and UNCHANGED** since the `AD-20` record |
| Governing records | `AD-20`; `D-2` (`IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md`); `D-1`; `D-3`; `G2-2`; `NP-08-D115-D2-G2-RECONCILIATION-ACT-01`; `NP-08-D115-IDENTITY-RUNTIME-COMPANYID-BINDING-AUTHORITY-ACT-01` (`D115-A`); the F-1…F-7 policy records and the F-3 mechanism/value/qualification records; `NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT.md`; `IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md` |
| Canonical tracker | [`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`](../../IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md) §15 |
| Environment | Non-production. Production is out of scope. |
| Status | **GC-D1 / GC-D2 RECORDED UNDER STANDING AUTHORIZATION — pending main publication and independent effectiveness verification.** §9.4 is the controlling disposition; §§7–9.2 preserve the prepared options/clauses. |

> **Historical packet finding (before §9.4 disposition).** Gate C is **UNRESOLVED and NOT ALREADY DECIDED** by any existing instrument. The investigation establishes, on verified evidence:
>
> - **(A) Owner context is ESTABLISHED and OPERATIONAL** — but only for NP-09/NP-10/NP-11, and only as *partition* semantics, never as an authorization credential.
> - **(B) The binding from that owner context to the G24 portfolio/tenancy identity is NOT ESTABLISHED.** Three independent blockers, each verified in source.
> - **(C) The security-identifier semantics are UNRESOLVED and CONFLICTING BY CONSTRUCTION** — and G24's own Save Guard 2 makes the conflict load-bearing, not academic.
> - **(D) Admission of the consumer and any change to HTTP-boundary behavior require authority that does not exist** (`P3`, `P2`, `AD-20` §4.4, Gate B Option C §2(2), `D-2` §11).
>
> **B is not inferred from A. Consumer admission is not inferred from technical compatibility.**
>
> **Revised recommendation (2026-10-13, second pass).** Two determinations were re-examined and the recommendation changed accordingly:
>
> - **DP-1 (owner/tenant binding) → Option 1D, RETAIN DEFERRAL.** The trust anchor previously floated as Option 1A′ is **not authorized by the cited instruments**: `H18` records *“Modification of OIDC/Keycloak configuration — NOT AUTHORIZED”*, the G2-UI consumer record records *“No Keycloak configuration, activation, or credential is needed or permitted”*, `G2_BLOCKED_SCOPES` includes *live OIDC/Keycloak*, and PR #61 (“Remove authentication flow for single-user IIPS”) is the operative baseline. Those instruments do not authorize a new local issuer or complete delegated-credential path; RS256/JWKS compatibility alone does not establish the complete G24 trust model. A separate express PA act would be needed to revisit the baseline. See §7.1.
> - **DP-2 (security identifier) is INDEPENDENTLY DECIDABLE**, and is recommended for decision **now**, separately from DP-1 — because it neither admits the consumer, nor activates a route, nor provisions identity, nor requires a credential to be specified or qualified by pure offline IRR contract tests. See §5.E, §7.2 and §10.1.
>
> A minimal, implementable **identifier and unresolved-identity contract** is identified (§8) that requires **no new persistence architecture, no merge of the NP-04 and G24 lineages, no Company Identity Authority, and no identifier-equivalence claim**, and that **does not resolve, and does not depend on resolving, the owner-context binding**. It expressly rejects unresolved saves and excludes the bypass disposition from the recommended path; it is not a completed canonical-identifier solution. Until the Program Authority acts, `/api/user-portfolios*` remains fail-closed at HTTP `503 owner-context-unavailable`.

---

## 1. Purpose, scope and non-goals

### 1.1 Purpose

`AD-20` §4.3 defined Gate C as the `D-2` §8 translation contract covering three things: owner ↔ `applicationUserId`, tenant ↔ `TenantScope`/membership provisioning & revocation, and the `companyId`/ISIN/`symbol` contract with uniqueness expectations. `AD-20` §4.2(5) explicitly retained it open. This record:

1. establishes the current authoritative state by re-verification, not assumption (§2–§3);
2. reuses every applicable existing decision rather than re-deriving it (§4);
3. separates what is proven from what is unresolved, along the four axes the gate requires (§5);
4. states the unresolved contract fields as an explicit `D-2` §8 element matrix (§6);
5. sets out alternatives with consequences and trade-offs (§7);
6. recommends one minimal contract, with rationale (§8);
7. fixes the exact approval required (§9);
8. delivers an implementation-ready plan with acceptance criteria (§10–§11);
9. separates Gate C from Gate A, Gate B, R3 and R4 (§14).

### 1.2 Scope

Gate C only: the identity and security-identifier **contract** for the durable User Portfolios seam (IRR `frontend/server/user-portfolio/*`, `user-portfolio-transport.ts`, `frontend/src/features/user-portfolios/*`, `frontend/server/user-portfolio/*.ts`) against the G24 lineage (IPD `6828155e…`).

### 1.3 Non-goals (explicit)

This record does **not**:

- render, record, or pre-select the Program Authority's decision;
- create, provision, or infer any owner, tenant, principal, membership, `(issuer, subject)` mapping, `applicationUserId`, `companyId`, ISIN, or ticker value;
- admit the G-2 consumer, activate `/api/user-portfolios/`, or change any HTTP-boundary behavior;
- ratify IRR commit `a0ab5a34…` (`P2`);
- promote G24 (`6828155e…`) to IPD `main`, or alter any IPD ref, branch, tag, or file;
- merge, converge, or reconcile the NP-04 (`2e11fa3b…`) and G24 (`6828155e…`) `src/persistence` lineages (that is **Gate A**);
- create or designate a Company Identity Authority, or make `D115-A` effective;
- change any package pin, lockfile, schema, route, UI, deployment, or runtime configuration;
- reopen R4 or repeat its completed checks;
- change Gate A or Gate B status.

---

## 2. Verified authoritative baselines (re-verified live 2026-10-13)

### 2.1 IRR (`ramkivs/iips-review-recovered`)

| Item | Verified value |
|---|---|
| `refs/heads/main` | **`4b3d5866b9e8a8dcbfda18d8dcdef7e700e6ceeb`** — matches the last reported IRR main; **unchanged** |
| Local `main` and `origin/main` | identical to the above |
| Highest-numbered PR | **#81 — MERGED** at `2026-10-13T13:39:38Z`, merge commit `4b3d5866…`, title “Governance+Remediation: REG-11 R4 (P1) — Outcome B reconciliation, R4-B PA disposition granted, approved 10-path remediation executed” |
| Open PRs | **none** (verified via `gh pr list --state open`) |
| Session branch | `arena/aacffd2c-iips-review-recovered`, branched from `main@4b3d5866…`; clean worktree |

### 2.2 IPD (`ramkivs/iips-production-market-data`) — all four reference points re-verified

| Ref | Reported value | Verified current value | State |
|---|---|---|---|
| IPD `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | **`4d3e1cdca3a33da0ec3be8b336b17128108a502c`** | **UNCHANGED** |
| NP-04 governed persistence (`np04-governed-persistence-windows`) | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | **`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`** | **UNCHANGED** |
| G24 portfolio/tenancy (`arena/01a0e6d9…` and `arena/01a0f308…`) | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | **`6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`** (both branches) | **UNCHANGED** |
| Act branch (`arena/01a0f839…`) | `12c480b5bf5cfbe0f296fcd12c9189328b915417` | **`12c480b5bf5cfbe0f296fcd12c9189328b915417`** | **UNCHANGED** |

Additional verification: IPD `main` tree confirmed to contain **no** `src/persistence` (unchanged from `AD-20` §2); IPD repository `pushed_at` = `2026-10-02T12:50:06Z`, i.e. no IPD write since before `AD-20`; **no open PRs** in the IPD repository (6 PRs, all MERGED, latest #6 at `2026-09-29T13:24:42Z`).

> **Note on repository identity.** The IPD repository is `ramkivs/iips-production-market-data`. `ramkivs/ipo-screening-engine` was checked and is **not** the IPD repository (6 commits; none of the four SHAs resolve there). Recorded so the reference is not later mistaken.

### 2.3 G24 lineage blob identities verified against live IPD at `6828155e…`

| Artifact | Verified blob | Cross-check |
|---|---|---|
| Commit tree | `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5` | matches `G2_LINEAGE.tree` in IRR `userPortfolioContract.ts` ✓ |
| `src/server/http-server.ts` | `17f9cb8a21cbabfc956daee660fa7efb5445da94` | matches `G2_LINEAGE.httpServerBlob` ✓ |
| `src/portfolio/durable-store.ts` | `1c23f259f580ba1992d3848d8c8d222bbf9a9e6a` | matches `G2_LINEAGE.durableStoreBlob` ✓ |
| `src/portfolio/consolidation.ts` | `e8e09e565cc4180bd7287d8e8919c30ef5067d75` | (new citation) |
| `src/app_identity/service.ts` | `80563c79c816a92c61f10a0356cfb0ae4dcb6263` | matches `D-2` §3.3 citation `80563c79…` ✓ |

The G24 contract pinned in IRR is therefore confirmed byte-identical to the live IPD lineage. Nothing in the contract pin has drifted.

---

## 3. Current fail-closed state (verified at `main@4b3d5866…`)

### 3.1 The fence is intact and byte-identical

| File | Verified blob at `main@4b3d5866…` | State |
|---|---|---|
| `frontend/server/reports-transport.ts` | `981470541812a64c733309f1debec75455d85bee` | unchanged — identical to the Option C-recorded identity |
| `frontend/server/user-portfolio-transport.ts` | `51704c12a467cd2f718a030b5036bc55c9afa73f` | unchanged — identical to the Option C-recorded identity |
| `frontend/server/owner-context-unavailable.ts` | `cb8db45d668d28cee7e0a52721001d579a872733` | unchanged — identical to the Option C-recorded identity |

### 3.2 R4-B remediation confirmed durably closed

All 10 `frontend/server/reports/` paths (`artifact.ts`, `canonical.ts`, `composition.ts`, `index.ts`, `np04-adapter.ts`, `persistence-port.ts`, `persistence.ts`, `reports-artifact.test.ts`, `reports-canonical.test.ts`, `reports-persistence.test.ts`) verified **ABSENT** at `main@4b3d5866…`. The `./persistence` package-subpath edge census across `frontend/server/` and `frontend/src/` returns **0** occurrences (including the computed-specifier form). **R4-B is verified CLOSED at the authoritative tip; it is not reopened and its checks are not repeated** — there is no changed or contradictory fact to justify that.

### 3.3 The User Portfolios HTTP boundary (exact behavior)

`frontend/server/user-portfolio-transport.ts` declares six routes:

| Route | Methods |
|---|---|
| `/api/user-portfolios/context` | GET, HEAD |
| `/api/user-portfolios` | GET, HEAD, POST |
| `/api/user-portfolios/:portfolioId` | GET, HEAD, DELETE |
| `/api/user-portfolios/:portfolioId/holdings` | PUT |
| `/api/user-portfolios/:portfolioId/revisions` | GET, HEAD |
| `/api/user-portfolios/:portfolioId/reset` | POST |

For every valid route/method the handler calls `respondOwnerContextUnavailable(res)` → **HTTP 503 `owner-context-unavailable`**. It reads **no request body, no tenant claim, no `Authorization` header, and no credential**. Unknown paths → 404; wrong method → 405. **No data is read or changed. No owner, tenant, or identifier is inferred.**

This is a **source-level** determination. **No live runtime, deployment, or production behavior is claimed or proven** (§15.2).

---

## 4. Existing evidence and applicable decisions (reused, not re-derived)

| # | Instrument | What it establishes | Applied here |
|---|---|---|---|
| 1 | **`AD-20`** §2.2, §2.3, §3.2, §4.2(5), §4.3, §4.4 | G24 owns the portfolio/tenancy domain; the two lineages are distinct domain stores that may coexist; Gate C is the retained minimum next gate; binding non-authorizations | Defines Gate C's scope and its non-authorizations. **Reused in full.** |
| 2 | **`D-2`** §5 | **NO DURABLE / UNIVERSAL COMPANY IDENTITY AUTHORITY IS ESTABLISHED** | Blocks any canonical-`companyId` reading (§5.C) |
| 3 | **`D-2`** §6 | **NO GOVERNED CROSS-REPO IDENTITY MAPPING. NO UNIVERSAL TENANT AUTHORITY.** No IRR Principal → G24 `applicationUserId` mapping; no cross-repository tenant mapping; no `CompanyId` mapping; no `runtimeCompanyId` binding | Directly decides §5.B = NOT ESTABLISHED |
| 4 | **`D-2`** §7 | Domain-scoped authority rule: no domain may consume another's identifiers as authoritative without an explicit governed translation boundary | Governs the shape of any contract |
| 5 | **`D-2`** §8 | The **15-element** minimum content of any translation contract | Template for §6 |
| 6 | **`D-2`** §9 | **No trust propagation** between IRR authentication and G24 authentication; no forwarded-principal trust; no audience reconciliation; no browser credential path | Blocks the “just forward the F-3 pair” shortcut |
| 7 | **`D-2`** §11 | Excludes creation of a Company Identity Authority, tenant/owner/identity-mapping/tenant-mapping/`CompanyId`-mapping/`runtimeCompanyId`-binding authority, and identity/auth implementation | Governs §7 alternatives |
| 8 | **`D115/D-2/G-2` Reconciliation Act** `D1=A`, `D2=A`, `D3=A`, `R5`, `R7` | `D115-A` remains **ISSUED BUT NOT EFFECTIVE**; **CIA REMAINS UNDESIGNATED**; G-2 §2 denotes instrument/security-master identity only; the instrument `companyId` **MUST NOT be reinterpreted as canonical user/company identity**; no new authority granted | Decisive for §5.C. Reused verbatim. |
| 9 | **Gate B Option C** §2(2), §2(4) | The F-3 pair **must not** be directly copied or aliased into `(tenantId, userId)` absent an explicitly authorized, evidence-backed identity/security contract; no such contract was created for Reports | Applies a standing prohibition this packet must respect |
| 10 | **`G2-2`** PA directions `P2`, `P3` | `/api/user-portfolios/` dispatch **NOT ADMITTED**; IRR commit `a0ab5a34…` **NOT RATIFIED** | §5.D |
| 11 | **F-3 mechanism + value act + qualification** | Owner pair `owner-7f3a91c2` / `irr-domain-4b82d6e1`; carrier SHA-256 `d5a79efb…`; qualified for **NP-09/NP-10/NP-11 only**; F-3 record §198 records “unconditional unavailability of Reports and Portfolios” | §5.A — and its scope limit |
| 12 | **`IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md`** §5 | Provisioning is **operator-only** via G24 `IdentityService` (provision → approve → activate → membership); **never at request time, never implicit**; the port offers no provisioning operation; `G2ProvisioningRecord` is an **offline attestation** shape, never a runtime input | Constrains future provisioning; none recommended or authorized in revised §8 |
| 13 | **`NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT.md`** (as cited by the Reconciliation Act `E7`) | Prohibits merging the G24 and NP-04 namespaces and changing `CompanyId` semantics | Constrains §7 and §8 |
| 14 | **IPD act `26061859…`** | Designates `arena/01a0e6d9` as the **only** promotion target for the accepted G24 Phase-A unit; expressly prohibits `main` promotion, baseline promotion, and Reports/Watchlists | Confirms G24 is a branch-only reference; no `main` path |
| 15 | **`AD-20`** §3.2(3) | IRR UI/fixtures place ticker-like values in `companyId` | Independently re-verified (§5.C) |

**No instrument in this table resolves Gate C.** Each was checked for applicability; none supplies the `D-2` §8 contract, the owner↔`applicationUserId` binding, the membership provisioning/revocation authority, or a security-identifier contract. Items 2–9 are *constraints on* Gate C, not *resolutions of* it.

---

## 5. The four-way determination (A / B / C / D)

### 5.A Owner context that is ESTABLISHED and OPERATIONAL — **YES**

| Aspect | Verified evidence |
|---|---|
| Values | `ownerUserId = owner-7f3a91c2`; `tenantId = irr-domain-4b82d6e1` |
| Governing acts | `IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01` (2026-10-12); F-3 mechanism/implementation PA decision; F-1/F-2 |
| Mechanism | `frontend/server/owner-context-carrier.ts` — canonical bytes + pinned SHA-256 `d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4`, 363 bytes, schema v1, refuses to write inside a Git worktree |
| Resolver | `frontend/server/owner-context-resolver.ts` — server-owned path seam `IIPS_OWNER_CONTEXT_PATH`; **per-request, uncached**; two independent gates (integrity digest, then grammar/value); only failure output is `null` → HTTP 503 |
| **Operational** | **YES.** `resolveOwnerContext()` is called in the live paths of `settings-transport.ts`, `watchlists/…-transport.ts`, and `collaboration-transport.ts`. These are **not** fenced — the F-3 context is in production use for **NP-09 (Watchlists), NP-10 (Collaboration), NP-11 (Settings)**. |
| Qualification | **QUALIFIED (TD-7a non-production regime)** for NP-09, NP-10, NP-11 only |
| **Scope limit** | The resolver's own header: *“Partition semantics only — never an authorization credential.”* The F-3 qualification record §198 records the **unconditional unavailability of Reports and Portfolios**. The pair has **no** qualification for the portfolio domain and **no** authorization semantics. |

**Conclusion (A):** an owner context exists, is governed, is integrity-bound, and is operational — **within an explicitly bounded non-portfolio scope**.

### 5.B A proven, authorized binding between that owner context and the G24 portfolio/tenancy identity — **NO**

**B is not inferred from A.** Three independent, source-verified blockers:

**B-1 — G24 requires a verified OIDC credential; the IRR baseline has no issuer.**
G24 `src/server/http-server.ts` line ~130: *every* `/api/ipd/*` route first calls `verifier.verifyAuthorizationHeader(...)`, which (`src/auth/oidc-verifier.ts`) requires a `Bearer` compact JWS with: three segments; header `alg` ∈ {`RS256`, `ES256`} (symmetric and `none` rejected); a `kid`; signature verified against a JWKS fetched from `IPD_OIDC_JWKS_URI`; `iss` matching `IPD_OIDC_ISSUER`; audience `IPD_OIDC_AUDIENCE` (default `ipd-user-portfolio-api`). Result: `VerifiedOidcCredential { issuer, subject }`. IRR authentication was removed by **PR #61**; there is no issuer, no JWKS, and no token in the baseline.

**B-2 — G24's trust model expressly excludes the two shortcuts.**
`src/auth/config.ts` header, verbatim: *“Explicitly out of scope (not implemented anywhere in this module): caller-service authentication, mTLS, token exchange, service credentials, **forwarded IRR Principal trust**, browser identity trust, **operator bypass**.”* Neither “forward the F-3 pair” nor “declare an operator bypass at the authentication layer” is available in G24 as it stands.

**B-3 — Even with a credential, the mapping and membership do not exist and cannot be created at request time.**
`PortfolioAuthorizer.authorizeScope` → `identityService.resolveExternalIdentity(issuer, subject)` → `applicationUserId`, then `resolveTenant(applicationUserId, requestedTenantId)`. The mapping key is `(issuer, subject)`, `UNIQUE`, lifecycle `PENDING→APPROVED→ACTIVE→RETIRED`. `resolveTenant` **fails closed** on: zero memberships; requested tenant not found; any non-`ACTIVE` state; zero `ACTIVE` memberships; and — notably — **more than one `ACTIVE` membership with no requested tenant** (*“Ambiguous tenancy is not resolved by guessing”*). Provisioning is **operator-only, offline, never at request time**, and the port offers no provisioning operation. `D-2` §6 records that **no** IRR Principal → G24 `applicationUserId` mapping and **no** cross-repository tenant mapping exist. `D-2` §9 records that no trust propagation exists.

**Conclusion (B):** **NOT ESTABLISHED.** There is no binding, no mapping row, no membership row, no issuer, and no authority to create any of them. The F-3 pair cannot be aliased into a G24 principal without an explicitly authorized contract (Gate B Option C §2(2)).

### 5.C Unresolved security-identifier / identity-mapping semantics — **YES, UNRESOLVED AND LOAD-BEARING**

This is the part of Gate C that is **not merely unresolved but self-contradictory as currently constructed** — and the contradiction is enforced by G24 code, so it cannot be deferred past save operations.

**C-1 — G24 makes `companyId` the canonical holding key.**
`src/portfolio/consolidation.ts` `holdingKey(h)`:

```
if (holding.companyId)            return holding.companyId;
if (holding.isin)                 return `UNRESOLVED:ISIN:${holding.isin}`;
                                  return `UNRESOLVED:SYM:${holding.symbol}`;
```

`holding_key` is a primary-key component of `portfolio_revision_holdings` (`PRIMARY KEY (portfolio_id, revision, holding_key)`) and is the merge key in `mergeByCanonicalKey`. **Whoever controls `companyId` controls holdings identity, dedup, and merge.**

**C-2 — G24's Save Guard 2 makes `companyId` mandatory absent an explicit bypass.**
`validateHolding` (`http-server.ts`) defaults: `companyId ?? ''`, `identityStatus ?? 'RESOLVED'`, `resolutionDisposition ?? 'CANONICAL_P04'`. Save Guard 2 then requires:

```
isResolved = identityStatus !== 'UNRESOLVED' && !!companyId
isBypass   = identityStatus === 'UNRESOLVED' && resolutionDisposition === 'NON_PRODUCTION_OPERATOR_BYPASS'
reject if  !symbol || (!isResolved && !isBypass) || quantity <= 0 || marketValue <= 0
```

**Therefore: a holding sent with `symbol` only is rejected outright.** Omitting `companyId` is not “deferred resolution” — it is a hard `REJECTED` save. The only two admissible shapes are (i) `companyId` present and `identityStatus !== 'UNRESOLVED'`, or (ii) an explicit `UNRESOLVED` + `NON_PRODUCTION_OPERATOR_BYPASS` declaration.

**C-3 — But no canonical `companyId` authority exists, and the instrument `companyId` must not be treated as one.**
- `D-2` §5: **NO DURABLE / UNIVERSAL COMPANY IDENTITY AUTHORITY IS ESTABLISHED.**
- Reconciliation Act `D2 = A`: **CIA REMAINS UNDESIGNATED.** `D1 = A`: `D115-A` **ISSUED BUT NOT EFFECTIVE**. `D3 = A`: G-2 §2 denotes instrument/security-master identity only. `R7`: no new authority granted.
- `D-2` §3.2 and Reconciliation Act `R5`: the IPD instrument/security-master `companyId` **MUST NOT be reinterpreted as canonical user/company identity** — and `R5` extends that explicitly to *“the P04 instrument `companyId` carried per holding in the G-2 holding projection.”*
- `D-2` §11 excludes creating a Company Identity Authority; `NP-04` prohibits changing `CompanyId` semantics and merging the G24 and NP-04 namespaces.

**C-4 — The evidence is conflicting by construction.** Re-verified at `main@4b3d5866…`:

| Source | `companyId` carries | Verified |
|---|---|---|
| IRR UI fixtures | **ticker-like values** — `companyId: 'TCS'` (`UserPortfolioDetail.test.tsx:23`), `'INFY'` (`:39`), `'TCS'` (`UserPortfolioList.test.tsx:67`) | ✓ |
| IRR G2 contract (`G2HoldingInput`) | `symbol` **required**; `companyId` **optional**; `isin` **optional**; verbatim pass-through, *“IRR MUST NOT default, coerce, or repair any value here: value semantics are IPD's”* | ✓ |
| G24 storage | `symbol` NOT NULL, `company_id` NOT NULL, `isin` **nullable**, plus nullable `identity_status` and `resolution_disposition` with **no CHECK constraint and no uniqueness contract** | ✓ |
| G24 behavior | `companyId` is the holding key; absent `companyId` → save REJECTED | ✓ |
| Admitted PIT seam | maps IRR `companyId` locally to `ISIN:<isin>:EQ` — **for a different purpose** | ✓ |

**Conclusion (C):** **UNRESOLVED.** G24's storage model treats `companyId` as canonical; the governing IRR decisions say the instrument `companyId` is **not** canonical company identity and no canonical authority exists to supply one; and IRR fixtures put tickers in that field. **These three facts cannot all be acted on simultaneously.** No equivalence between `companyId`, ISIN, and `symbol`/ticker is established, and **none may be assumed by any consumer**.

### 5.D Any authority required to admit a consumer or change HTTP-boundary behavior — **REQUIRED AND ABSENT**

| Required authority | Status | Source |
|---|---|---|
| Admission of the `/api/user-portfolios/` dispatch | **NOT ADMITTED** — `P3` | `G2-2` PA direction |
| Ratification of IRR commit `a0ab5a34…` | **NOT RATIFIED** — `P2` | `G2-2` PA direction |
| A `D-2` §8 translation contract | **DOES NOT EXIST** | `D-2` §6; `AD-20` §4.2(5) |
| Creation of an identity/tenant mapping authority | **EXCLUDED** | `D-2` §11 |
| Company Identity Authority designation | **EXCLUDED**; `D115-A` ineffective | `D-2` §11; Reconciliation Act `D2=A`, `R7` |
| Route/UI activation | **WITHHELD** | `AD-20` §4.4; `F-4` deferral |
| G24 promotion to IPD `main` | **PROHIBITED** (`arena/01a0e6d9` is the only designated target) | IPD act `26061859…` |
| F-7 five-part qualification for Portfolios | **NOT PERFORMED** | `AD-20` §4.3 |

**Conclusion (D):** no existing instrument authorizes admission, activation, mapping, or identity provisioning. Technical compatibility is **not** authorization: the seam is complete, the contract is pinned, and the G24 server is fully implemented — and none of that admits the consumer.

### 5.E Targeted rectification — actual bypass semantics, compatibility and independent DP-2 scope

**Classification: not A (passive metadata only). It is B in the question's broader sense of bypassing another G24 requirement: an operative exception to Save Guard 2's “strict entity authority check”. It is NOT an authentication or tenant/portfolio-authorization bypass.** The name alone proves neither restriction nor authority. The recommended path **does not use it**.

The following source and existing test bodies were inspected at the previously verified, immutable G24 commit `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`. No test was executed and no IPD ref was altered or re-qualified.

| Evidence | Exact consequence |
|---|---|
| `src/auth/config.ts` (`221f4b1b…`) | User-delegated OIDC is the accepted direction. Issuer/JWKS/audience come from trusted configuration, never the caller. Forwarded IRR Principal trust and operator bypass are out of scope **in the authentication module**; this is distinct from the portfolio save exception |
| `src/server/http-server.ts` (`17f9cb8a…`) L130, L186, L207–209 | For a holdings save: verify credential → authorize identity/tenant/portfolio → read JSON → parse holdings → save. The declaration cannot skip any earlier check. Collection scope is authorized at L153 |
| `src/server/authorization.ts` (`2a5e9bbd…`) | `authorize` resolves `(issuer, subject)` through `IdentityService`, resolves tenant membership, then reads the portfolio under the authorized owner+tenant. None of these predicates uses the holding disposition |
| `src/portfolio/durable-store.ts` (`1c23f259…`) L254–302 | A direct store call rechecks owner+tenant+portfolio, then consolidation. It does **not** itself verify OIDC. A store fixture is therefore not HTTP credential certification |
| `src/portfolio/consolidation.ts` (`e8e09e56…`) L108–119 | `isResolved = identityStatus !== 'UNRESOLVED' && !!companyId`; `isBypass = identityStatus === 'UNRESOLVED' && resolutionDisposition === 'NON_PRODUCTION_OPERATOR_BYPASS'`. The latter permits a holding with no resolved company identity. Non-blank symbol and positive quantity/market value still required; Guards 1/2b also remain |
| `src/server/http-server.ts` L382–397 | Omitted `companyId` becomes `''`; omitted status defaults to `RESOLVED`; omitted disposition defaults to `CANONICAL_P04`. Explicit `UNRESOLVED` is necessary to avoid a false resolution default. Neither default constitutes canonical authority |
| Existing `tests/g24_c_portfolio_durability.test.ts`, **G24-C6** | A provisioned store fixture accepts `UNRESOLVED` + empty companyId + bypass disposition; rejects `UNRESOLVED` + empty companyId + `CANONICAL_P04`, with no revision added. This is the original proposed T-1/T-2 pair, already present upstream, not a new test result from this run |
| Existing `tests/g24_h_http_boundary.test.ts` H1/H7/H8; `tests/g24_e_authorization.test.ts` E2/E3/E6–E8 | Cover credential refusal, owner/tenant isolation, unmapped identity and missing/revoked membership. They do **not** combine those cases with the bypass declaration. Cross-product assurance is therefore a future requirement, not an existing proven result |

**T-1/T-2 compatibility determination.** The old pair is source-compatible with G24's store-level identity-resolution exception and does not contradict its authentication call order. It does **not** prove the exception is a fully enforced restricted non-production workflow, authorize IRR's use of it, or certify the complete G24 trust model. It is removed from the recommended acceptance path (§11); this distinction is not resolved by renaming the disposition.

**A relevant existing authority is narrower than the proposed reuse.** IPD `evidence/operator_drop/NON_PRODUCTION_SINGLE_OPERATOR_IDENTITY_BYPASS.md` at that commit contains `GOV-REC-2026-NON-PROD-OPERATOR-BYPASS-01`, effective 2026-09-22, recorded as PA-authorized for Block 3M-A single-operator qualification. Its component matrix names the **frontend broker-import/in-memory PortfolioStore** workflow on `arena/01a0b8e8…`, not the G24 durable HTTP/store modules. It requires `executionEnvironment === 'NON_PRODUCTION'` **and** `allowNonProductionBypass === true`; production or disabled bypass must fail closed. Existing `tests/non_production_operator_identity_bypass.test.ts`, Criteria D and H/I, assert those rejections in that broker-ingress workflow. Its reported historical 350/350 result is reused only as that record's claim, not re-run or asserted as current qualification.

**Enforcement gap.** The inspected G24 consolidation, durable store, HTTP server, server config and persistence config have no `executionEnvironment` / `allowNonProductionBypass` check around this exception. In the actual Save Guard 2 predicate it is triggered by the field pair alone. File headers and the health response's `NON_PRODUCTION` label are not enforcement. An authenticated, tenant/portfolio-authorized caller can supply the pair in a holdings body. This does not confer authentication authority, but it does switch the identity-resolution gate. The original restricted-workflow authorization cannot silently be extended to this path. No deployment or production behavior has been inspected.

**Consequence for the recommendation:** remove 2A from the recommended path. Any future reuse would need its own explicit authority and independently verified server-controlled non-production gating, caller-field refusal, preservation of all credential/membership/ownership checks, production/disabled negative tests and no-mutation evidence. Closing the G24 gap would be separate IPD-side work; neither an IPD change nor an exception is authorized here.

**DP-2 is independently decidable, narrowly.** PA may establish *how unresolved identity is represented and refused*, without choosing a canonical identifier, resolving owner binding or admitting User Portfolios: preserve native symbol/ISIN/exchange bytes as descriptive evidence; omit companyId; mark `UNRESOLVED` server-side; do not emit or permit the bypass; reject unresolved/ambiguous writes **before** the port/HTTP call. Response identifiers remain domain-scoped, not evidence of equivalence or canonical resolution. This is Option **2F** below. It can be specified and qualified with pure contract tests and test-only stubs behind the unchanged fence. A successful durable save, governed canonical resolution, binding and full F-7 certification remain dependent on later authority — they are not claimed independently decidable here.

---

## 6. Unresolved contract fields — the `D-2` §8 element matrix for Portfolios

`D-2` §8 requires a translation contract specifying **at minimum** fifteen elements. Current state and the proposed value for each appear below. “Proposed” values are the **recommendation only** (§8) and are non-operative.

| # | `D-2` §8 element | Current state | Proposed value (§8 recommendation) |
|---|---|---|---|
| 1 | **Source authority** | F-3 owner pair, governed by the F-1/F-2 value act; qualified for NP-09/10/11 only | **Deferred (1D).** No extension of F-3 to portfolio authorization; its existing scope remains intact |
| 2 | **Target authority** | G24 `IdentityService` (`application_users`, `external_identity_mappings`, `tenant_memberships`) at `6828155e…` | Unchanged — G24 remains portfolio-identity authority; no authority transfers to IRR |
| 3 | **Source identifier** | `ownerUserId = owner-7f3a91c2`; `tenantId = irr-domain-4b82d6e1` | Existing F-3 values unchanged; no source/target equivalence |
| 4 | **Target identifier** | `application_user_id` (opaque, PK); `tenant_id` (G24 `tenant_memberships`) | **Unresolved/deferred.** No values assigned or provisioned |
| 5 | **Mapping lifecycle** | **ABSENT.** `PENDING→APPROVED→ACTIVE→RETIRED` supported but no row exists | **Deferred.** No mapping created, activated or retired |
| 6 | **Provisioning authority** | **UNDEFINED.** Operator-only by G24 design; no authorization to perform it | **Deferred.** No provisioning act authorized |
| 7 | **Revocation authority** | **UNDEFINED** | **Deferred.** Existing G24 lifecycle controls retained; no new revocation act |
| 8 | **Tenant boundary** | **ABSENT.** `resolveTenant` fails closed on 0/ambiguous/revoked | **Deferred.** No membership assigned; ambiguity never guessed |
| 9 | **Ownership boundary** | Re-derived server-side from the governed mapping; browser ownership never trusted | Unchanged — G24-owned; descriptive security fields convey no ownership |
| 10 | **Authorization boundary** | G24 `PortfolioAuthorizer`: identity → tenant → portfolio, all fail-closed; unauthorized ≡ nonexistent | Unchanged — all G24 credential, mapping, membership and ownership checks mandatory |
| 11 | **Audit requirements** | `mapping_audit_events` (action, previous/new state, actor, context, occurred_at) written in the same transaction | No provisioning audit event. Future offline-contract qualification records decision ID and rejected/no-call evidence, without persisting portfolio state |
| 12 | **Failure behavior** | 503 `owner-context-unavailable` at the IRR boundary; 401/403/404 fail-closed in G24 | 503 fence unchanged. Future contract layer rejects unresolved/ambiguous saves before any port call; no defaults or silent repairs |
| 13 | **Security / trust model** | **CONFLICT.** G24 requires verified OIDC; IRR has none; forwarded-Principal-trust and authentication-layer operator-bypass excluded by G24 | **Retain deferral (1D).** No issuer, credential, configuration or trust-model change; no save exception (2F) |
| 14 | **Durable storage** | G24 SQLite (`better-sqlite3`, rollback journal, `synchronous=FULL`, FK enforced, migrations 001–002), path `IPD_PORTFOLIO_DB_PATH` | Unchanged. IRR stores no portfolio or mapping state; no migration or lineage merge |
| 15 | **Package / API contract** | HTTP `/api/ipd/portfolios` at `6828155e…`; IRR holds no package pin (reference only, `AD-03`) | Pinned G24 reference unchanged. Narrow 2F contract only; future IRR contract revision explicitly records refusal semantics; no new IPD enum/API or promotion |

### 6.1 Narrow identifier decision — recommended Option 2F

No canonical identifier is selected. The contract governs **unresolved evidence and refusal**, not successful saves or a new holding key.

| Field / operation | Proposed 2F rule |
|---|---|
| `symbol`, `isin`, `exchange` | Preserve exact source bytes and absence; no fabricated value, normalization or cross-domain equivalence |
| `companyId` | Omit from prospective outbound holding shape. Client-supplied or ticker-shaped companyId must not be repaired into canonical identity |
| `identityStatus` | Server-governed `UNRESOLVED` for holdings lacking separately authorized canonical resolution; client assertions refused |
| `resolutionDisposition` | Do not emit the bypass, invent a new IPD enum, or claim `CANONICAL_P04` provenance. Reject before serialization/port call |
| Unresolved/ambiguous save | Fail closed before any port invocation; zero portfolio/mapping/revision writes. IRR routes stay at 503 independently |
| Existing G24 fallback keys | `UNRESOLVED:ISIN:<isin>` / `UNRESOLVED:SYM:<symbol>` are upstream implementation facts, **not** keys authorized for use by 2F |
| Exchange collision | G24 `holdingKey` ignores exchange. Preserve source symbol bytes; do **not** compose `TCS:NSE` or merge colliding evidence. Unresolved/ambiguous writes remain refused; future successful-write key/collision policy is a separate decision |

This rectifies the original contradictory “verbatim symbol + exchange-composed symbol” proposal without altering the upstream key function.

---

## 7. Alternatives, consequences and trade-offs

### 7.1 Decision Point 1 (DP-1) — Owner/tenant binding (§5.B)

| Option | Mechanism | Consequences / trade-offs | Requires |
|---|---|---|---|
| **1A′ — Local governed trust anchor + offline provisioning** *(not recommended; requires separate authority)* | A non-production, localhost-scoped OIDC issuer (RS256 + JWKS) is stood up; G24 is pointed at it via the **three existing environment variables it already reads** (`IPD_OIDC_ISSUER`, `IPD_OIDC_JWKS_URI`, `IPD_OIDC_AUDIENCE`); one `application_user`, one `(issuer, subject)` mapping, and one ACTIVE membership are provisioned **offline, operator-only** | **+** The existing verifier can validate configured signed tokens without IPD source changes. **−** This is technical compatibility, not evidence of authorized user delegation or the complete trust path; a local server-issued token cannot silently be substituted for G24's accepted user-delegated credential. **+** Intended to avoid forwarded-principal trust and auth-layer bypass; that intention still needs governed design and qualification. **+** Reuses the exact provisioning shape the G2 implementation record already specifies. **−** Introduces a local trust anchor into a baseline whose auth was deliberately removed by PR #61; must be scoped so it is **not** a restoration of application-wide authentication. **−** Still creates identity/membership state that `D-2` §11 does not authorize | Separate express PA authority addressing the no-auth baseline and complete delegated-credential trust model; configuration and provisioning acts; independent credential/mapping/membership qualification |
| **1A — Synthetic literal `(issuer, subject)` with no token** | Declare a literal pair and have G24 accept it | **Not viable.** G24 verifies a signed JWS before any mapping lookup. Accepting a bare assertion *is* forwarded-principal trust, which G24 and `D-2` §9 exclude | — (non-viable) |
| **1B — Reinstate application authentication** | Reverse PR #61; restore the full OIDC/Keycloak path | **+** Restores the trust model G24 was designed for. **−** Far outside Gate C; reverses an authorized no-auth baseline decision; large blast radius across NP-09/10/11; would require its own authorization and re-qualification | Separate PA authorization; re-qualification of NP-09/10/11 |
| **1C — G24 trust-model extension (IPD source change)** | Add to G24 an explicitly authorized non-OIDC principal source for the non-production single-user baseline | **+** Honest about the deviation; no local issuer. **−** **IPD source change** on `arena/01a0e6d9`, which this packet is instructed not to perform; re-qualification of the `g24_*` suite; `AD-03` reference-only status would need revisiting | IPD-side authority + IPD change; outside Gate C's IRR-side scope |
| **1D — Retain deferral for the binding** *(recommended for DP-1)* | Record continued deferral, not a resolved binding; leave `/api/user-portfolios*` at 503 | **+** Avoids unauthorized issuer/configuration/provisioning and preserves PR #61. Allows independent 2F contract work. **−** No integrated read/write or full F-7; Gate C remains partially open until a compatible binding is separately authorized and verified | Explicit PA disposition requested to record deferral; current fence requires no new authority |

**Consequence of leaving DP-1 unresolved:** `/api/user-portfolios*` remains fenced at 503. **No portfolio data can be read or written, and no part of the seam may be activated.** This is the current state and is safe.

### 7.2 Decision Point 2 (DP-2) — Security identifier (§5.C)

| Option | Mechanism | Consequences / trade-offs | Requires |
|---|---|---|---|
| **2A — Declared `UNRESOLVED` + `NON_PRODUCTION_OPERATOR_BYPASS`** *(not recommended)* | Use the existing G24 exception to save holdings with no resolved companyId | Authentication and tenant/portfolio checks remain mandatory, but the declaration bypasses Save Guard 2's resolution requirement. The original restricted frontend authorization does not establish durable-path authority or enforcement; G24 lacks its environment gate. **Removed from recommended implementation** | Separate authority and verified server-controlled restrictions, potentially separate IPD-side changes; none granted here |
| **2F — Unresolved evidence + fail-closed write contract** *(recommended for DP-2)* | Preserve native symbol/ISIN/exchange; omit companyId; server-governed UNRESOLVED; no bypass or canonical-provenance claim; refuse unresolved/ambiguous writes before port call | **+** Independently decidable without owner binding, admission, CIA or IPD change. Removes unauthorized equivalence and exception. **−** Does not allow successful saves, choose a canonical key or complete Gate C/F-7. Those remain genuine dependencies | Narrow PA contract and offline IRR qualification authority (§9.2); unchanged fence |
| **2B — Designate / effectuate a Company Identity Authority** | Make `D115-A` effective and designate a CIA; assign canonical `companyId` per instrument; send `identityStatus: 'RESOLVED'` | **+** Semantically correct; entity-scoped dedup; the “real” end state. **−** **Excluded** by `D-2` §11 and Reconciliation Act `R7`; `D115-A` is ineffective with its §7(7)/(8) conditions unresolved; requires a new constitutive act plus implementation plus qualification. **−** Would be a large new workstream, not a minimal contract | New constitutive PA act; CIA designation; implementation; qualification |
| **2C — Verbatim pass-through, declare `RESOLVED`** | Send `symbol` (+ optional `isin`) and let G24 default `identityStatus` to `'RESOLVED'` | **Not viable and unsafe.** `companyId` defaults to `''`, so Save Guard 2 **rejects every save**; and declaring `RESOLVED` would assert a canonical resolution that no authority made. Fails technically and misrepresents provenance | — (non-viable) |
| **2D — Reuse the instrument `companyId` already present in IRR fixtures** | Send ticker-like values (`TCS`, `INFY`) as `companyId` | **Not viable.** Directly contradicts `D-2` §3.2 and Reconciliation Act `R5` (instrument `companyId` **MUST NOT** be reinterpreted as canonical company identity), and would silently make tickers the canonical holding key | — (non-viable) |
| **2E — Retain deferral for the identifier** | Decide nothing | **+** Zero risk. **−** Gate C stays open and Portfolios stay at 503 | No authority (default) |

**Consequence of leaving DP-2 unresolved:** `/api/user-portfolios*` remains fenced at 503, and **no consumer may translate, equate, or normalize `companyId`, ISIN, or `symbol`.**

### 7.3 Decision Point 3 (DP-3) — Consumer admission and HTTP-boundary change (§5.D)

| Option | Consequence |
|---|---|
| **3A — Bundle admission with the contract** | **Not recommended.** Collapses a contract decision into an admission decision, which is exactly the conflation `AD-20` §4.3 exists to prevent. Would also require `P2`/`P3` disposition and F-7 qualification in the same act |
| **3B — Contract first, admission as a separate subsequent gate** *(recommended for DP-3)* | Preserves `AD-20`'s sequencing. The contract has standalone value: it is required even to *evaluate* admission, and it can be published without activating anything |
| **3C — Retain deferral** | Portfolios remain unavailable; `P2`/`P3` remain open |

**Technical compatibility is not admission.** Even with DP-1 and DP-2 resolved, `/api/user-portfolios*` stays at 503 until `P3` is disposed, implementation authority is granted, and F-7 five-part qualification passes.

---

## 8. Recommended minimal contract (PREPARER'S RECOMMENDATION — NOT A DECISION)

> **This section is the recording agent's recommendation, prepared for the Program Authority's selection. It is non-operative. Nothing here is decided, admitted, or authorized. The authority to select rests solely with the Program Authority.**

### 8.1 Revised recommendation

**DP-1 → Option 1D** — retain owner/tenant-binding deferral. No trust anchor or provisioning.
**DP-2 → Option 2F** — independently decide the unresolved-evidence/refused-write contract in §6.1.
**DP-3 → Option 3B** — admission is a separate gate; no admission or activation now.

The previous 1A′ + 2A recommendation is superseded by this targeted rectification. It was a proposal, never a PA decision or authority.

### 8.2 Minimal contract, stated

1. **Ownership/trust remain unresolved.** F-3 partition values are not G24 credentials, users or tenants. No issuer, delegated credential, mapping, provisioning or membership is created. All upstream trust requirements remain mandatory for any future integrated use.
2. **Identifier evidence is not canonical identity.** Preserve symbol/ISIN/exchange exactly and keep their provenance and absence. No CIA is designated, no D115-A effectiveness is asserted, no ticker→companyId or ISIN→companyId inference, no exchange-derived symbol or canonical key.
3. **Resolution remains explicitly unresolved.** Prospective contract normalization sets `UNRESOLVED` server-side and omits companyId unless a later, separately approved resolution contract exists. Do not treat client claims or upstream defaults as resolution evidence. G24-returned identifiers/statuses remain domain-scoped data, not cross-domain authority.
4. **No bypass.** Reject caller-supplied company/identity/disposition claims. Do not emit `NON_PRODUCTION_OPERATOR_BYPASS` or mislabel evidence `CANONICAL_P04`; do not invent a new IPD disposition. Unresolved/ambiguous writes fail before serialization or port invocation. No save succeeds under this narrow contract.
5. **No storage change.** G24 remains portfolio-domain store; IRR creates no cache, mapping table, shadow copy, migration or new persistence architecture. NP-04 and G24 remain distinct.
6. **Fence/admission unchanged.** All six valid User Portfolios routes retain HTTP 503 `owner-context-unavailable` (existing 404/405 behavior retained). No consumer, route or UI admission, P2/P3 disposition, IPD ref change or G24 promotion.

### 8.3 Why this is independently useful and minimal

PA can settle how unresolved evidence **must not become authority**, and authorize offline IRR contract qualification, without authorizing integrated operation. Pure validation/refusal has no dependency on an owner mapping or signed credential. It prevents fixture tickers, default `RESOLVED` status and the save exception from being silently used in future convergence work. **It is a partial contract disposition, not completion of the full fifteen-element translation contract, canonical identifier selection, or operational integration.**

### 8.4 What the recommendation does not do

It does not make Portfolios available, resolve owner binding, choose a canonical identifier, permit unresolved saves, change G24's source or certify its environment guard. Gate C stays partially open even if 2F is approved. **Packet completion ≠ contract effectiveness ≠ binding ≠ admission.**

---

## 9. Required Program Authority decisions (exact scope and authority language)

### 9.1 Decisions requested — independently selectable

No disposition is selected or recorded. The recommendation is **C-1 = 1D + 2F + 3B**.

| Choice | Exact scope / effect |
|---|---|
| **C-1 (recommended)** | Record DP-1 binding deferral and DP-3 separate admission; approve **only** DP-2 Option 2F plus the offline IRR contract plan/criteria (§§10–11). No complete Gate C closure |
| **C-2** | State a different independently selected DP-1/DP-2/DP-3 combination and exact implementation authority. 1A′ or 2A cannot be implicitly enabled by selecting an identifier contract; each needs the additional authorities/restrictions in §7 |
| **C-3** | Retain deferral of DP-2 as well; no implementation authority. All Portfolios behavior remains fenced |
| **C-4** | Request clarification of a named question; no implementation authority. The evidence needed for C-1 is complete in this packet; no generic investigation cycle is required |

A PA may issue the two clauses below separately. Approving DP-2 alone neither resolves nor overrides DP-1. Publishing this packet does not select either clause.

### 9.2 Exact PA language for recommended disposition

**Clause GC-D1 — binding deferral and admission boundary:**

> “I, Ramki, as Program Authority, select DP-1 Option 1D: retain deferral of the F-3 owner-context to G24 application-user/tenant binding. I authorize no issuer, OIDC/Keycloak configuration, delegated credential, identity mapping, provisioning or tenant membership. Owner binding remains unresolved. DP-3 remains a separate admission gate. Gate C is not closed by this disposition.”

**Clause GC-D2 — independent identifier contract and bounded implementation:**

> “I, Ramki, as Program Authority, approve DP-2 Option 2F in this Gate C record §§6.1 and 8: preserve native symbol/ISIN/exchange evidence without equivalence or byte rewriting; omit companyId; maintain server-governed UNRESOLVED status; refuse caller-supplied identity/disposition authority; emit neither NON_PRODUCTION_OPERATOR_BYPASS nor a false canonical-provenance declaration; reject unresolved or ambiguous writes before the port/HTTP call. I select no canonical identifier and authorize no successful unresolved save. I authorize only the prospective IRR contract-layer work and offline tests in §§10–11, behind the unchanged User Portfolios fence, plus durable publication and independent remote verification. No live credential, provisioning, database or IPD write is authorized. The complete identity-binding/translation contract and full F-7 qualification remain pending separate authority.”

**Mandatory boundary for either clause:**

> “These acts are prospective and non-production only. They do not admit the User Portfolios consumer, ratify a0ab5a34, dispose P2/P3, bypass authentication/authorization or any G24 identity-resolution gate, activate a route or UI, promote G24 to main, change any IPD ref, merge NP-04 and G24 lineages, designate a CIA, assert unauthorized identity equivalence or make D115-A effective. Gate A OPEN, Gate B Option C, R3 OPEN and R4-B CLOSED remain unchanged. /api/user-portfolios* remains HTTP 503 owner-context-unavailable until contract/binding and separate admission authorities are independently satisfied and verified.”

### 9.3 Authority boundary

The recording agent **does not** render, record, transcribe, or infer this decision. If the instruction that initiated this run is later asserted as approval, it is **not** treated as the Program Authority's act for this purpose — consistent with the precedent recorded in tracker §13.1, where the fast-track task instruction was held not to be PA approval by its own terms. **Work stops at §9 until an explicit disposition is rendered.**

---

### 9.4 Actual disposition under standing authorization (application recorded 2026-10-13)

**Authority source, accurately bounded.** The current PA instruction explicitly directs applying standing global authorization to GC-D1 (1D) and GC-D2 (2F), recording them in this existing packet, publishing them effectively, then executing S2–S4 without another round-trip. This is an application of standing authority, **not** an invented separately signed §9.2 act. No separate approval comment is asserted.

The requested Library reference is `/IIPS Project Tracker/IIPS_V3_STANDING_AUTHORIZATION_ONE_PASS_EXECUTION_2026-10-13.md`. Its path and scope are **user-supplied**; its actual bytes/date/signature have **not been retrieved or verified**, because this environment's Library connector lookup is unsupported and the file is absent locally. It is not cited as a verified artifact or represented as present in Git.

The independently available durable authority is `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` **§1.2**, at IRR main `4b3d5866b9e8a8dcbfda18d8dcdef7e700e6ceeb`, blob **`c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`**. It transcribes standing project decision/execution authority covering necessary decisions, governance records, implementation, testing, corrections and publication within established scope, and prohibiting fabricated evidence, weakened safeguards, unrelated scope expansion or unverified success claims. That record attributes the original grant to **2026-10-12** and records effective publication through PR #68. This is the supported source attribution; no original grant date is invented for the unretrieved Library file. The present 2026-10-13 date is this **application's recording date**, not a claimed new signed grant.

**Scope application, not blanket admission.** The earlier F-3 record's per-capability grants do not themselves authorize Portfolios implementation/admission. The current explicit direction to apply standing authority to these exact Gate C clauses establishes only the narrow prospective S2–S4 refusal/contract exception here. It does not lift owner-binding, successful-save, full F-7, P2/P3 or capability-admission deferrals. §9.3 describes the original packet's approval boundary; it is satisfied here by attributed standing-authority application rather than an invented signature or inference from PR status.

| Disposition | Recorded effect |
|---|---|
| **GC-D1 = DP-1 Option 1D** | **RETAIN BINDING DEFERRAL.** No issuer, OIDC/Keycloak configuration, delegated credential, mapping, provisioning or membership. Owner binding unresolved; DP-3 separate admission. Gate C not closed |
| **GC-D2 = DP-2 Option 2F** | **APPROVED, bounded.** §§6.1/8 native symbol/ISIN/exchange evidence and absence; omit unsupported companyId; server-governed UNRESOLVED; refuse caller identity/disposition authority; no bypass or false canonical provenance; reject unresolved/ambiguous writes before serialization or port call. Authorizes only prospective offline IRR contract S2–S4 and tests §§10–11, publication and independent verification |
| **Boundary** | The mandatory §9.2 boundary applies in full: no consumer admission, P2/P3 disposition, auth/authorization or identity-resolution bypass, successful unresolved saves, owner-binding completion, full F-7, route/UI activation, G24 promotion, IPD write/ref change, lineage merge, CIA/equivalence/D115-A effect or changes to Gate A/B/R3/R4 |
| **Effectiveness** | Recorded, **not effective until this disposition's exact bytes are published to IRR main and independently verified** under §11.3. No implementation before that verification. Governed merge of decision-only PR #82 is within the current publication direction; ordinary review controls retained |

No new decision ID, duplicate packet, fabricated evidence or separately signed PA act is created. Only the application of standing authority to these two existing clauses is recorded.

## 10. Implementation-ready plan — only after explicit, effective PA approval

> Rectification itself authorized no code. §9.4 now records GC-D2 under standing authority; only its effective main publication and independent verification enable S2–S4. S5–S7 remain deferred.

### 10.1 Sequencing and authority dependencies

| Step | Content | Required authority / dependency |
|---|---|---|
| **S0** | Amend this same packet and tracker on PR #82; scope checks, push, independently verify remote artifacts; **do not merge** | Documentation rectification only (this run) |
| **S1** | PA renders independent DP-1/DP-2 dispositions in this existing record/tracker through normal review/publication; verify effective main artifact | Actual PA act; durable main publication + independent verification before implementation |
| **S2** | Formalize the approved narrow 2F contract in existing IRR contract/boundary declarations, clearly versioned; retain §6's deferred identity fields, no second decision packet | Effective GC-D2 approval; no full D-2 §8 contract closure claim |
| **S3** | Implement only pure shape/provenance validation and pre-port unresolved/ambiguous-write refusal. Reject caller companyId/runtimeCompanyId/identityStatus/resolutionDisposition authority; no token, owner binding or store changes | S2 + explicit IRR contract-layer implementation authority in GC-D2 |
| **S4** | Offline IRR contract tests with stubs/spies prove refusal/no calls, preservation and fence integrity; independently verify scope and publish results | S3; §11 criteria. No live G24 or DB writes, no IPD implementation tests |
| **S5 — deferred** | Choose and authorize compatible complete owner/credential/tenant-binding design; separately authorize any provisioning; independently qualify trust path | Separate DP-1 act addressing no-auth baseline and complete G24 trust model; **not** enabled by S1–S4 |
| **S6 — deferred** | Establish separately governed canonical resolution/successful-write identity policy, or an explicitly restricted alternative; full F-7 qualification (ownership, failure, durability/restart, no equivalence) | Separate identity authority; any IPD-side change requires its own act; binding and test authority required. No bypass recommended here |
| **S7 — separate admission** | Dispose P2/P3; authorize consumer, route/UI work and independently qualify/admit it | Completed applicable contracts + S5/S6 qualification + explicit admission act |

**Only S2–S4 are enabled by the recommended narrow approval. S5–S7 are genuine later gates, not hidden implementation steps.** DP-2 acceptance does not prove successful storage or runtime convergence.

### 10.2 Affected components after narrow approval

| Component | Permitted future scope |
|---|---|
| IRR `frontend/server/user-portfolio/translationBoundary.ts`, `userPortfolioContract.ts`, `userPortfolioPort.ts` | Governed refusal/shape contract, closed claim rejection and testable pre-port guard; explicit contract version; no identity-binding or port activation |
| IRR `frontend/server/user-portfolio/*.test.ts` | Pure contract tests and isolated test-only stubs/spies per §11 |
| IRR `user-portfolio-transport.ts`, `owner-context-unavailable.ts` | **Unchanged**; 503 fence and 404/405 behavior retained; future regression verification only |
| F-3 carrier/resolver, Settings/Watchlists/Collaboration | **Unchanged**; no owner value or scope extension |
| IPD G24/NP-04 source, refs, runtime configuration, provisioning DB | **No change or write**, including no environment gate implementation in this act |

### 10.3 Exclusions

No trust anchor, authentication restoration or bypass, identity provisioning/mapping, live endpoint or DB access, persistence/schema/pin changes, IPD write, successful unresolved save, canonical-resolution engine, ticker→companyId mapping, exchange-composed symbol, consumer admission, route/UI activation, or changes to Gate A/B/R3/R4. Test-only stubs do not confer runtime admission.

---

## 11. Narrow DP-2 acceptance criteria and future tests

### 11.1 Acceptance criteria — all required for S4, none claimed satisfied by this documentation run

| # | Criterion |
|---|---|
| AC-1 | DP-2 authority independently recorded, durably effective and scope-limited. |
| AC-2 | DP-1 explicitly deferred; no issuer/credential/provisioning/membership introduced. |
| AC-3 | No canonical identifier or equivalence inferred, no CIA or D115-A claim. |
| AC-4 | Symbol/ISIN/exchange bytes and absence preserved; no synthetic value or exchange-composed symbol. |
| AC-5 | Prospective unresolved shape omits companyId and explicitly retains UNRESOLVED; no upstream default treated as resolution. |
| AC-6 | Bypass and false CANONICAL_P04 provenance are never emitted. |
| AC-7 | Caller-supplied company/identity/disposition claims refused before port invocation. |
| AC-8 | Unresolved/ambiguous save rejected with the existing typed `G2Error('INVALID_REQUEST', 'Unresolved or ambiguous security identity; save refused.')` (not success; no new public HTTP response while fenced) and zero calls/writes. |
| AC-9 | Residual/colliding evidence is not merged or normalized. |
| AC-10 | Upstream read fields are domain-scoped, not canonical equivalence or credential authority. |
| AC-11 | All G24 credential/tenant/portfolio checks remain required, not replaced by the new contract guard. |
| AC-12 | No identity/portfolio storage or IPD change; fence/owner-context components unchanged. |
| AC-13 | Valid User Portfolios routes stay 503, with existing 404/405+Allow behavior. |
| AC-14 | Offline contract/regression checks and type-checking pass with independently verified scope. |
| AC-15 | Publication/results explicitly distinguish narrow qualification from full F-7, successful saves, admission and runtime/production proof. |

### 11.2 Future offline tests — requirements, not tests executed or new current results

The old “T-1 bypass save accepted / T-2 undeclared save rejected” is retained only as historical source evidence in §5.E. It is **not** the recommended qualification pair.

| Test | Input / focus | Required narrow-approval result |
|---|---|---|
| **T-1 (revised)** | Native symbol/ISIN/exchange evidence, no governed company identity | Exact evidence preserved, companyId omitted, explicit UNRESOLVED; save refused before serialization/port call; spy count zero |
| **T-2 (revised)** | Same evidence with caller bypass declaration | Claim refused; no authority conferred, no port call, no write. Neither test expects a successful save |
| T-3 | Missing status or attempted RESOLVED/CANONICAL_P04 default | Missing identity is not “resolved”; no fake canonical provenance or permitted save |
| T-4 | Ticker-shaped companyId (`TCS`, `INFY`) / runtimeCompanyId | Caller claim refused; no conversion or identity equivalence |
| T-5 | Missing/blank/ambiguous identifiers and equal symbol across exchanges | Fail closed; no synthetic symbol/key, normalization or merge |
| T-6 | Byte-sensitive symbol/ISIN/exchange and absent ISIN | Preserve evidence bytes and absence; no canonical assignment |
| T-7 | Server-side disposition emission under normal/hostile input | No bypass, no invented IPD enum, no false canonical-provenance field emitted |
| T-8 | Supplied userId/subject/applicationUserId/owner/tenant claims | Existing refusal semantics preserved; no source/target identity inferred |
| T-9 | Pure contract tests with port spy/stub | Zero live endpoint/credential/DB use; rejected inputs never invoke port |
| T-10 | Returned domain-scoped G24 identifiers/status fields in test-only stub | No cross-domain equivalence, identity resolution or authorization inferred |
| T-11 | Failure propagation and attempted retry/repair | `G2Error.reason === 'INVALID_REQUEST'` with the fixed AC-8 refusal message; no default owner, fabricated companyId or bypass fallback |
| T-12 | Scope/storage manifest | No mapping table, cache, shadow store, migration, IPD ref/config/DB write or owner-context changes |
| T-13 | Fence regression | Same fence blobs; six valid routes 503; unknown path 404; wrong method 405+Allow |
| T-14 | Relevant offline IRR regression tests | No changed owner semantics or admission; no full F-7 claim; broader checks only within explicitly approved offline scope |
| T-15 | Type-checking and publication scope | Type-check succeeds; exact authorized paths, diff clean; remote artifacts independently verified |

**Deferred verification (S5–S7), not required to decide 2F:** verified/invalid/expired/wrong-audience credentials, unmapped/revoked/ambiguous tenancy, wrong owner, durability/restart, live F-7 and any future restricted-resolution exception. If an exception is ever separately considered, its declaration must be crossed with all credential/membership/owner negative cases and server-controlled production/disabled rejection; G24-C6 alone is insufficient. No such exception is recommended or authorized here.

### 11.3 Independent verification requirements (mandatory)

1. **Remote ref verification** — IRR `main` and all four IPD refs re-verified against the remote **after** merge, with SHAs reported.
2. **Blob identity verification** — fence blobs (`98147054…`, `51704c12…`, `cb8db45d…`) re-verified at the merged tip and confirmed unchanged unless the authorized step changes them.
3. **Upstream re-verification** — the G24 blobs (`17f9cb8a…`, `1c23f259…`, `e8e09e56…`, `80563c79…`) re-verified against live IPD at `6828155e…` to confirm the contract pin has not drifted.
4. **Scope check** — `git status` / `--name-status` manifest and `git diff --check` clean; documentation-only steps touch documentation only.
5. **Census** — at S4, an authorized scope check confirms no `/api/user-portfolios/` activation outside the authorized change and no new `./persistence` edge.
6. **Effectiveness rule** — consistent with program convention, the disposition becomes effective **only** upon durable publication to `refs/heads/main` **and** independent remote verification there. Before that it is recorded but not operative, and is not represented as operative.
7. **Merge is a separate act** — publication through the normal pull-request workflow does not itself constitute the Program Authority's merge authorization; no review or merge protection is bypassed.

### 11.4 Not claimed

**No runtime, deployment, or production behavior is proven** by source inspection, unit tests, or contract tests. The 503 baseline recorded here is a **source-level** determination.

---

## 12. Durable-publication requirements

| # | Requirement |
|---|---|
| P-1 | Publish **additively** on the authorized session branch `arena/aacffd2c-iips-review-recovered`, branched from `main@4b3d5866…` |
| P-2 | Open a pull request to `refs/heads/main`; **do not merge it** — merge is the Program Authority's act |
| P-3 | Change only: this record, and the canonical tracker (§15 addition + `CHG-2026-10-13-12` + `REG-12` row pointer) |
| P-4 | **No second master tracker.** Update `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` only |
| P-5 | Do not create a duplicate decision record where an existing artifact can be updated appropriately — `AD-20` §4.3's Gate C row is referenced, not duplicated |
| P-6 | Record actual publication coordinates (PR number, head SHA, merge commit) **after** independent verification; no self-referential coordinates asserted before merge |
| P-7 | No force-push, no history rewrite, no bypass of review controls |
| P-8 | No IPD ref, branch, tag, file, or record is written |

---

## 13. Risks, exclusions and downstream dependencies

### 13.1 Risks of the recommended path

| # | Risk | Mitigation |
|---|---|---|
| R-1 | Binding deferral keeps integration unavailable | Record DP-1 OPEN and the separate S5 authority dependency; do not activate an issuer by inference |
| R-2 | Narrow DP-2 may be mistaken for canonical identity resolution or save permission | 2F expressly selects no canonical identifier and refuses unresolved saves; full resolution remains S6 |
| R-3 | Bypass name or metadata may be mistaken for enforced non-production authority | §5.E proves operative resolution exception and missing gate; no bypass emitted or recommended |
| R-4 | Exchange collision on upstream holdingKey | Preserve evidence bytes and refuse unresolved/ambiguous writes (T-5); no symbol-composition convention |
| R-5 | Contract completion may be mistaken for admission | This record states that distinction repeatedly (§8.4, §10.1 S7, tracker §15) |
| R-6 | Source-level verification may be mistaken for runtime proof | §11.4; every baseline statement is labelled source-level |
| R-7 | Offline stubs may be mistaken for integrated trust/durability qualification | Label S4 narrow and offline; provisioning and full F-7 remain deferred, no DB changes |

### 13.2 Exclusions (binding)

No consumer admission. No identity mapping. No persistence change. No route activation. No runtime change. No IPD write. No authentication/authorization or identity-resolution bypass. No Company Identity Authority. No `D115-A` effectuation. No lineage merge. No pin change. No production use. No history rewrite.

### 13.3 Downstream dependencies

| Gate / item | Relationship to Gate C |
|---|---|
| **Gate A** (persistence convergence) | **Independent.** Gate C's contract does not require and does not resolve convergence. Neither gate is a prerequisite of the other |
| **Gate B** (Reports owner binding) | **Independent.** Resolved at Option C (retain deferral) and **unchanged by this record** |
| **R3** (Reports pin/consumer admission) | **Independent**; currently without a live subject |
| **R4** (`P1`) | **CLOSED** (`R4-B` remediated, verified at `main@4b3d5866…`). **Not reopened** |
| **`P2`** (`a0ab5a34…` ratification) | **NOT resolved here** — separate act, required before S7 |
| **`P3`** (`/api/user-portfolios/` dispatch) | **NOT resolved here** — separate act, required before S7 |
| **F-7 qualification for Portfolios** | Full qualification deferred to S5/S6 and admission S7; S4 is narrow offline DP-2 qualification, not F-7 |
| **UI no-auth port** | Separate admission, outside Gate C |
| **Gate C → implementation** | Requires S1 (PA disposition) before any code is written |

---

## 14. Explicit separation from Gate A, Gate B, R3 and R4

| Item | Status | This record's effect |
|---|---|---|
| **Gate A** — Persistence Convergence Design | **OPEN** | **UNTOUCHED.** No convergence decided, designed, or implied. The NP-04 (`2e11fa3b…`) and G24 (`6828155e…`) lineages remain distinct domain stores on separate refs; neither is promoted; IPD `main` still has no `src/persistence` |
| **Gate B** — Reports Owner Binding & Admission | **Option C — RETAIN DEFERRAL** (PA decision 2026-10-13) | **UNCHANGED.** Not revisited. Its §2(2) prohibition is **reused as a constraint** here, not altered. `/api/reports*` remains at 503 |
| **R3** — Reports pin/consumer admission | **OPEN** | **UNTOUCHED.** No Reports consumer edge exists |
| **R4** (`P1`) — D-1 / PR #42 | **REMEDIATED (`R4-B`) — CLOSED** | **NOT REOPENED.** Verified closed at `main@4b3d5866…` (10 paths absent; fence blobs unchanged; `./persistence` census 0). No completed check repeated |
| **Gate C** — Portfolio Identity & Security-Identifier Contract | **OPEN — DECISION PACKET COMPLETE, PA DECISION PENDING** | Packet and plan published; `/api/user-portfolios*` remains fail-closed at 503 |
| **R1/R2** (Gate B sub-questions) | Deferred | Unchanged |
| **`P2` / `P3`** | Open | **NOT disposed here** — separate acts required before S7 |

---

## 15. Validation performed and not performed

### 15.1 Performed (read-only unless stated otherwise)

The following list records the **original packet preparation**, not checks repeated during targeted rectification. No R4 investigation/test was reopened or repeated in rectification.

1. **IRR remote state** — `git fetch --prune`; `main` and `origin/main` both `4b3d5866…`; `gh pr list` (open = none; #81 MERGED at `2026-10-13T13:39:38Z`); clean worktree.
2. **IPD remote state** — `gh api` branch enumeration and commit resolution for `ramkivs/iips-production-market-data`; all four reference points confirmed **unchanged**; IPD `main` tree confirmed to contain no `src/persistence`; IPD open PRs = none; `ramkivs/ipo-screening-engine` checked and excluded as the IPD repository.
3. **G24 blob verification** — `git hash-object` on files fetched from live IPD at `6828155e…`; `http-server.ts` `17f9cb8a…` and `durable-store.ts` `1c23f259…` match the IRR `G2_LINEAGE` pin; commit tree `eb07ea36…` matches; `app_identity/service.ts` `80563c79…` matches the `D-2` §3.3 citation.
4. **G24 contract surface read at source** — `http-server.ts` (auth gate, tenant header, `validateHolding` defaults), `authorization.ts` (`authorize`/`authorizeScope` chain), `oidc-verifier.ts` (`VerifiedOidcCredential`, `verifyAuthorizationHeader`), `auth/config.ts` (trust inputs and the explicit out-of-scope list), `app_identity/service.ts` (`resolveExternalIdentity`, `resolveTenant`, provisioning), `app_identity/types.ts` (lifecycle states), `consolidation.ts` (`holdingKey`, Save Guards 1/2/2b), `portfolio/repository.ts` (holding row mapping), `persistence/migrations/001_initial_schema.ts` (full DDL).
5. **IRR seam read at `main@4b3d5866…`** — `user-portfolio-transport.ts`, `owner-context-unavailable.ts`, `owner-context-carrier.ts`, `owner-context-resolver.ts`, `user-portfolio/{translationBoundary,userPortfolioContract,userPortfolioPort}.ts`; owner-context consumer census across `frontend/`.
6. **R4-B closure re-verified** — all 10 paths confirmed ABSENT; fence blobs confirmed unchanged; `./persistence` census = 0.
7. **Governance records re-read** — `AD-20` (full), `D-2` §§3.2, 5, 6, 7, 8, 9, 11 (full), `NP-08-D115-D2-G2-RECONCILIATION-ACT` (D1–D5, R1–R7, E1–E9), `NP-08-D115-IDENTITY-RUNTIME-COMPANYID-BINDING-AUTHORITY-ACT` §§1–3, 7, 8, Gate B Option C PA decision (full), `IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md` §5, F-3 implementation/qualification record, tracker §§5, 7, 11, 12, 13, 14.
8. **Decisive searches** — no Gate C record exists under any of the searched file-name patterns; `AG-5` traced to the tracker and the 2026-10-07 convergence evidence (recorded as UNRESOLVED, explicitly avoided in the PIT contract).
9. **Scope check** — the changes made in this run are documentation-only (this record + tracker).

### 15.2 NOT performed (by design)

No IPD or IRR application test suite was run (**no application code was changed**). No live HTTP request was made to any User Portfolios or G24 endpoint. No database was created, provisioned, or written. No G24 process was started. No OIDC issuer was stood up. No runtime, deployment, environment, or production state was inspected or changed. No Windows/PowerShell, Arena-archive, or Library state was accessed. No dangling-object search.

**No live runtime, deployment, or production behavior is claimed or proven anywhere in this record.** The `503 owner-context-unavailable` baseline is a **source-level** determination.

---

## 16. Publication and targeted-rectification provenance

Original publication: **PR #82**, open to IRR `main`, session branch `arena/aacffd2c-iips-review-recovered`, commit `c5a7c0f41674473081d90cb40f627bb57fda556a`. This targeted rectification amends **only this same packet and tracker §15 / its existing change row** on that branch. No second decision record or report is created.

Rectification baseline: IRR remote main `4b3d5866b9e8a8dcbfda18d8dcdef7e700e6ceeb`; PR #82 OPEN/MERGEABLE at `c5a7c0f…`; local packet/tracker match that starting commit. Existing IPD ref evidence is reused; the additional code/tests were read at the immutable `6828155e…` contract pin solely to resolve the disposition ambiguity. No repeated IPD branch census, R4 investigation, live/runtime check or implementation test was needed or run. The final head commit and independently obtained remote artifact blob identities are reported in the completion response; no self-referential commit ID is embedded in its own content.

Checks for this amendment: documentation-only exact diff and permitted-path manifest, whitespace/link/section consistency, source/claim consistency and remote API commit/blob comparison. **PA decision remains pending. PR #82 is not merged.** Branch publication is durable review evidence, not main publication or operative PA authority. Merge/effectiveness verification remain unperformed pending authority. No IPD ref is touched.

---

*Recording agent: Arena Agent Mode — standing-authority application, execution and verification support. Authority is attributed in §9.4, not self-granted or represented as a separately signed act. Prepared/application recorded 2026-10-13 (Asia/Calcutta). Program Authority: Ramki.*

*Status: **`GATE C — GC-D1/GC-D2 RECORDED; EFFECTIVENESS PENDING MAIN VERIFICATION; BINDING/ADMISSION OPEN`.** `/api/user-portfolios*` remains fail-closed at HTTP 503 `owner-context-unavailable`.*

**Publication update (standing-authority application):** §16 describes original rectification history. §9.4 now controls the decision/publication authority. PR #82 will publish only these decision/ tracker bytes; S2–S4 begin only after main verification. Historical “PA pending / no merge on rectification” statements do not describe this newly recorded application. No claim that publication has already occurred is made here.
