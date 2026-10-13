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
| Status | **`PA DECISION PENDING`** — the complete packet and plan are ready for immediate disposition. No part of §8 (the recommendation) is operative. |

> **Bottom line.** Gate C is **UNRESOLVED and NOT ALREADY DECIDED** by any existing instrument. The investigation establishes, on verified evidence:
>
> - **(A) Owner context is ESTABLISHED and OPERATIONAL** — but only for NP-09/NP-10/NP-11, and only as *partition* semantics, never as an authorization credential.
> - **(B) The binding from that owner context to the G24 portfolio/tenancy identity is NOT ESTABLISHED.** Three independent blockers, each verified in source.
> - **(C) The security-identifier semantics are UNRESOLVED and CONFLICTING BY CONSTRUCTION** — and G24's own Save Guard 2 makes the conflict load-bearing, not academic.
> - **(D) Admission of the consumer and any change to HTTP-boundary behavior require authority that does not exist** (`P3`, `P2`, `AD-20` §4.4, Gate B Option C §2(2), `D-2` §11).
>
> **B is not inferred from A. Consumer admission is not inferred from technical compatibility.** A minimal, implementable contract is identified (§8) that requires **no new persistence architecture, no merge of the NP-04 and G24 lineages, no Company Identity Authority, and no identifier-equivalence claim**. It does require one Program Authority act. Until that act is rendered, `/api/user-portfolios*` remains fail-closed at HTTP `503 owner-context-unavailable`.

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
| 12 | **`IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md`** §5 | Provisioning is **operator-only** via G24 `IdentityService` (provision → approve → activate → membership); **never at request time, never implicit**; the port offers no provisioning operation; `G2ProvisioningRecord` is an **offline attestation** shape, never a runtime input | Governs the provisioning shape in §8 |
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

---

## 6. Unresolved contract fields — the `D-2` §8 element matrix for Portfolios

`D-2` §8 requires a translation contract specifying **at minimum** fifteen elements. Current state and the proposed value for each appear below. “Proposed” values are the **recommendation only** (§8) and are non-operative.

| # | `D-2` §8 element | Current state | Proposed value (§8 recommendation) |
|---|---|---|---|
| 1 | **Source authority** | F-3 owner pair, governed by the F-1/F-2 value act; qualified for NP-09/10/11 only | F-3 owner pair, **explicitly extended by a new PA act** to the portfolio seam; the F-1/F-2 value act is **not** amended |
| 2 | **Target authority** | G24 `IdentityService` (`application_users`, `external_identity_mappings`, `tenant_memberships`) at `6828155e…` | Unchanged — G24 remains the sole portfolio-identity authority |
| 3 | **Source identifier** | `ownerUserId = owner-7f3a91c2`; `tenantId = irr-domain-4b82d6e1` | Unchanged (no new values invented) |
| 4 | **Target identifier** | `application_user_id` (opaque, PK); `tenant_id` (G24 `tenant_memberships`) | One provisioned `application_user_id`; one `tenant_id` — **values assigned by G24 provisioning, never by IRR** |
| 5 | **Mapping lifecycle** | **ABSENT.** `PENDING→APPROVED→ACTIVE→RETIRED` supported but no row exists | Exactly one mapping, provisioned offline, advanced to `ACTIVE`; retirement only by PA act |
| 6 | **Provisioning authority** | **UNDEFINED.** Operator-only by G24 design; no authorization to perform it | **Ramki (PA)**, executed as a one-time offline governed act, attested by a `G2ProvisioningRecord`; never at request time |
| 7 | **Revocation authority** | **UNDEFINED** | **Ramki (PA)** only; revocation ⇒ immediate fail-closed 503 with no cached fallback |
| 8 | **Tenant boundary** | **ABSENT.** `resolveTenant` fails closed on 0/ambiguous/revoked | Exactly one ACTIVE membership ⇒ unambiguous; `x-ipd-tenant-id` optional; any mismatch ⇒ 403, never a default |
| 9 | **Ownership boundary** | Re-derived server-side from the governed mapping; browser ownership never trusted | Unchanged — G24-owned; IRR asserts nothing |
| 10 | **Authorization boundary** | G24 `PortfolioAuthorizer`: identity → tenant → portfolio, all fail-closed; unauthorized ≡ nonexistent | Unchanged — G24-owned |
| 11 | **Audit requirements** | `mapping_audit_events` (action, previous/new state, actor, context, occurred_at) written in the same transaction | Unchanged, plus the PA act ID recorded as `context` on the provisioning audit event |
| 12 | **Failure behavior** | 503 `owner-context-unavailable` at the IRR boundary; 401/403/404 fail-closed in G24 | **Unchanged for every missing-mapping case.** No default, no inference, no silent tenant substitution |
| 13 | **Security / trust model** | **CONFLICT.** G24 requires verified OIDC; IRR has none; forwarded-Principal-trust and operator-bypass excluded by G24 | Local, non-production, PA-authorized trust anchor + **real** credential verification by G24 (Option 1A′, §7) — **or** deferral (Option 1D) |
| 14 | **Durable storage** | G24 SQLite (`better-sqlite3`, rollback journal, `synchronous=FULL`, FK enforced, migrations 001–002), path `IPD_PORTFOLIO_DB_PATH` | Unchanged. **IRR stores nothing** — no mapping table, no cache, no shadow copy |
| 15 | **Package / API contract** | HTTP `/api/ipd/portfolios` at `6828155e…`; IRR holds no package pin (reference only, `AD-03`) | Unchanged. Any G24 promotion is a **separate** act; `main` promotion prohibited |

### 6.1 Additional field requiring decision (not in the `D-2` §8 list, but forced by §5.C)

**Security-identifier declaration for holdings.** Because Save Guard 2 rejects holdings without `companyId`, a declaration is unavoidable for every save:

| Field | Proposed value (Option 2A) |
|---|---|
| `symbol` | Required. Carries the IRR-native instrument identifier, verbatim, unmodified |
| `companyId` | **Omitted** (not empty-string, not a ticker, not fabricated) |
| `isin` | Carried verbatim **when IRR holds one**; otherwise omitted |
| `identityStatus` | Explicitly `'UNRESOLVED'` |
| `resolutionDisposition` | Explicitly `'NON_PRODUCTION_OPERATOR_BYPASS'` |
| Resulting holding key | `UNRESOLVED:ISIN:<isin>` when ISIN present, else `UNRESOLVED:SYM:<symbol>` |
| Equivalence asserted | **NONE.** No `companyId`↔ISIN↔ticker equivalence is created, implied, or relied upon |

**Sub-field requiring decision — exchange collision.** `holdingKey` **ignores `exchange`**. Two holdings with the same symbol on different exchanges (e.g. NSE `TCS` and BSE `TCS`) would collide on the primary key and merge incorrectly. Options: (a) accept and record as a known non-production limitation; (b) adopt an IRR-side presentation convention composing exchange into `symbol` (e.g. `TCS:NSE`) — explicitly a *presentation* convention, not an identifier-equivalence claim; (c) defer saves that would collide, fail-closed. **Recommendation: (b), with (c) as the fail-closed backstop.** This is a decision the PA must confirm because it changes the bytes written to `symbol`.

---

## 7. Alternatives, consequences and trade-offs

### 7.1 Decision Point 1 (DP-1) — Owner/tenant binding (§5.B)

| Option | Mechanism | Consequences / trade-offs | Requires |
|---|---|---|---|
| **1A′ — Local governed trust anchor + offline provisioning** *(recommended for DP-1)* | A non-production, localhost-scoped OIDC issuer (RS256 + JWKS) is stood up; G24 is pointed at it via the **three existing environment variables it already reads** (`IPD_OIDC_ISSUER`, `IPD_OIDC_JWKS_URI`, `IPD_OIDC_AUDIENCE`); one `application_user`, one `(issuer, subject)` mapping, and one ACTIVE membership are provisioned **offline, operator-only** | **+** No IPD source change: G24 verifies a real signed token, so its trust model is *honoured*, not bypassed. **+** No forwarded-principal trust, no auth-layer operator bypass. **+** Reuses the exact provisioning shape the G2 implementation record already specifies. **−** Introduces a local trust anchor into a baseline whose auth was deliberately removed by PR #61; must be scoped so it is **not** a restoration of application-wide authentication. **−** Still creates identity/membership state that `D-2` §11 does not authorize | New PA act (identity/security contract); one offline provisioning act; env configuration (not a repo change) |
| **1A — Synthetic literal `(issuer, subject)` with no token** | Declare a literal pair and have G24 accept it | **Not viable.** G24 verifies a signed JWS before any mapping lookup. Accepting a bare assertion *is* forwarded-principal trust, which G24 and `D-2` §9 exclude | — (non-viable) |
| **1B — Reinstate application authentication** | Reverse PR #61; restore the full OIDC/Keycloak path | **+** Restores the trust model G24 was designed for. **−** Far outside Gate C; reverses an authorized no-auth baseline decision; large blast radius across NP-09/10/11; would require its own authorization and re-qualification | Separate PA authorization; re-qualification of NP-09/10/11 |
| **1C — G24 trust-model extension (IPD source change)** | Add to G24 an explicitly authorized non-OIDC principal source for the non-production single-user baseline | **+** Honest about the deviation; no local issuer. **−** **IPD source change** on `arena/01a0e6d9`, which this packet is instructed not to perform; re-qualification of the `g24_*` suite; `AD-03` reference-only status would need revisiting | IPD-side authority + IPD change; outside Gate C's IRR-side scope |
| **1D — Retain deferral for the binding** | Decide nothing; leave `/api/user-portfolios*` at 503 | **+** Zero risk; consistent with Gate B Option C. **−** Portfolios remain unavailable indefinitely; Gate C stays open | No authority (default) |

**Consequence of leaving DP-1 unresolved:** `/api/user-portfolios*` remains fenced at 503. **No portfolio data can be read or written, and no part of the seam may be activated.** This is the current state and is safe.

### 7.2 Decision Point 2 (DP-2) — Security identifier (§5.C)

| Option | Mechanism | Consequences / trade-offs | Requires |
|---|---|---|---|
| **2A — Declared `UNRESOLVED` + `NON_PRODUCTION_OPERATOR_BYPASS`** *(recommended for DP-2)* | Every holding crosses the boundary with `identityStatus: 'UNRESOLVED'`, `resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS'`, `companyId` omitted, `symbol`/`isin` verbatim | **+** The **only** path that satisfies Save Guard 2 without asserting canonical resolution. **+** No Company Identity Authority, no identifier equivalence, no IPD change, no `CompanyId` semantic change — so it respects `D-2` §11, Reconciliation Act `R5`/`R7`, and `NP-04`. **+** Uses a disposition G24 already implements and already validates. **+** The word `NON_PRODUCTION` is carried in the persisted data, so the data self-declares its regime. **−** Holdings merge on `UNRESOLVED:SYM:<symbol>`, so dedup is symbol-scoped, not entity-scoped: the same issuer held under two symbols will not merge. **−** Persists a permanently “unresolved” marker; any future canonical resolution is a **separate** migration and a separate act | New PA act; explicit declaration in the contract |
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

### 8.1 Recommendation

**DP-1 → Option 1A′** (local governed trust anchor + one-time offline provisioning)
**DP-2 → Option 2A** (declared `UNRESOLVED` + `NON_PRODUCTION_OPERATOR_BYPASS`; `companyId` omitted)
**DP-3 → Option 3B** (contract first; admission is a separate subsequent gate)

### 8.2 The minimal contract, stated

1. **Owner identity.** The F-3 owner pair (`owner-7f3a91c2`, `irr-domain-4b82d6e1`) is the **source** identity for the portfolio seam. It is **not** copied, aliased, or re-used as a G24 identifier. A new, explicitly scoped PA act binds it to exactly one G24 `application_user_id` **through** a provisioned `(issuer, subject)` mapping — never by value equality. The F-1/F-2 value act is **not** amended and the F-2 tenant value's scope is **not** extended beyond this seam.
2. **Trust.** A single non-production, localhost-scoped OIDC issuer supplies a real RS256 credential. G24 verifies it through the JWKS/issuer/audience configuration it already reads from its environment. **No forwarded-principal trust. No authentication-layer operator bypass. No browser credential path.**
3. **Provisioning.** Exactly one `application_user`, one `(issuer, subject)` mapping (advanced to `ACTIVE`), and one ACTIVE `tenant_membership` — provisioned **offline, operator-only, once**, by the Program Authority, and attested by a `G2ProvisioningRecord`. Never at request time; the port exposes no provisioning operation.
4. **Tenancy.** Exactly one ACTIVE membership, so tenancy is unambiguous. `x-ipd-tenant-id` remains optional; G24 validates any supplied value against ACTIVE memberships and fails closed (403) on mismatch. Ambiguous tenancy is never guessed.
5. **Security identifier.** Every holding crosses the boundary with `identityStatus: 'UNRESOLVED'`, `resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS'`, `companyId` **omitted**, `symbol` verbatim, `isin` verbatim when held. **No `companyId`↔ISIN↔ticker equivalence is created, implied, or relied upon.** `symbol` composes exchange (e.g. `TCS:NSE`) under an IRR-side presentation convention, with a fail-closed deferral on any residual collision.
6. **Persistence.** G24 remains the sole durable store. **IRR stores nothing** — no mapping table, no cache, no shadow copy. No merge of the NP-04 and G24 lineages; no new persistence architecture; no IPD ref change.
7. **Failure.** Every missing, revoked, ambiguous, or mismatched mapping and every absent owner context fails closed exactly as today: HTTP 503 `owner-context-unavailable` at the IRR boundary, no data read, no data changed, no inferred owner or tenant.
8. **Boundary.** The contract **does not** admit the consumer, ratify `a0ab5a34…`, activate any route, or promote G24. Those remain `P3`, `P2`, and separate acts.

### 8.3 Why this is minimal

| Property | Satisfied |
|---|---|
| Requires no new persistence architecture | ✓ |
| Requires no merge of the NP-04 and G24 lineages | ✓ |
| Requires no IPD source change (configuration and data only) | ✓ |
| Requires no Company Identity Authority and no `CompanyId` semantic change | ✓ (respects `D-2` §11, Reconciliation Act `R5`/`R7`, `NP-04`) |
| Asserts no identifier equivalence | ✓ |
| Honours G24's own trust model rather than bypassing it | ✓ |
| Preserves the 503 fence until a separate admission act | ✓ |
| Keeps Gates A, B, R3 and R4 separate | ✓ |
| Non-production only, and self-declaring in the persisted data | ✓ |

### 8.4 What the recommendation deliberately does not do

It does not make Portfolios available. It does not resolve Gate A. It does not admit the consumer. It does not claim that persistence convergence, production readiness, or product admission has been achieved. **Decision-packet completion ≠ contract ≠ admission.**

---

## 9. Required Program Authority decision (exact scope and authority language)

### 9.1 The decision requested

The Program Authority is asked to render **one** of the following for Gate C. **No option is pre-selected.**

| Option | Composition | Effect if selected |
|---|---|---|
| **C-1** | Approve the recommended minimal contract: DP-1 = **1A′**, DP-2 = **2A**, DP-3 = **3B** | Authorizes the *contract* (a governed `D-2` §8 instrument) and the implementation plan in §10. **Does not admit the consumer or activate any route.** `P2`/`P3` remain open |
| **C-2** | Approve a different combination from §7 (state the option letters) | As stated |
| **C-3** | **RETAIN DEFERRAL** (Gate B Option C parity) | Gate C remains open; `/api/user-portfolios*` remains at 503; no contract, mapping, provisioning, or activation |
| **C-4** | Direct further investigation, naming the specific question | Gate C remains open pending that answer |

### 9.2 Verbatim authorization required (to be issued by the Program Authority — **not** to be self-recorded)

If **C-1** is selected, the approval must explicitly state, at minimum:

> **“I, Ramki, as Program Authority of the single-user, non-production IIPS platform, approve the Gate C — Portfolio Identity & Security-Identifier Contract set out in `docs/integration/IIPS_v3.0_GATE_C_PORTFOLIO_IDENTITY_AND_SECURITY_IDENTIFIER_CONTRACT_PA_DECISION_REQUEST_2026-10-13.md` §8, comprising:
> (1) the binding of the F-3 owner pair (`owner-7f3a91c2`, `irr-domain-4b82d6e1`) to exactly one G24 `application_user_id` exclusively through a provisioned `(issuer, subject)` mapping — not by value equality, and without amending the F-1/F-2 value act or extending the F-2 tenant value beyond this seam;
> (2) the establishment of one non-production, localhost-scoped OIDC trust anchor and the resulting offline, operator-only provisioning of exactly one application user, one mapping (advanced to ACTIVE), and one ACTIVE tenant membership;
> (3) the security-identifier declaration that every holding crossing the IRR→G24 boundary carries `identityStatus: 'UNRESOLVED'` and `resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS'` with `companyId` omitted and `symbol`/`isin` carried verbatim, creating no `companyId`↔ISIN↔ticker equivalence, together with the exchange-composition convention for `symbol` and its fail-closed collision backstop;
> (4) implementation of the plan in §10 of that record, subject to the acceptance criteria in §11;
> and (5) durable publication plus independent remote verification.
> This approval is **non-production only** and **prospective only**. It does **not** admit the `/api/user-portfolios/` consumer, does **not** ratify IRR commit `a0ab5a34…`, does **not** activate any route or UI, does **not** promote G24 (`6828155e…`) to IPD `main` or alter any IPD ref, does **not** merge or converge the NP-04 and G24 persistence lineages, does **not** designate a Company Identity Authority or make `D115-A` effective, and does **not** change Gate A, Gate B, R3 or R4 status. `/api/user-portfolios*` remains fail-closed at HTTP 503 `owner-context-unavailable` until a separate admission act.”**

### 9.3 Authority boundary

The recording agent **does not** render, record, transcribe, or infer this decision. If the instruction that initiated this run is later asserted as approval, it is **not** treated as the Program Authority's act for this purpose — consistent with the precedent recorded in tracker §13.1, where the fast-track task instruction was held not to be PA approval by its own terms. **Work stops at §9 until an explicit disposition is rendered.**

---

## 10. Implementation-ready plan (contingent on PA selection of C-1 or equivalent)

> **Nothing in this section is authorized. It is prepared so that implementation can begin immediately upon disposition, without a further investigation phase.**

### 10.1 Sequencing

| Step | Gate | Content | Depends on |
|---|---|---|---|
| **S0** | — | Publish this packet + tracker update (documentation only). **Executed in this run.** | — |
| **S1** | PA | Render the §9 disposition and publish it as a PA decision record | — |
| **S2** | S1 | Author and publish the **governed `D-2` §8 translation contract instrument** covering all fifteen elements of §6, as a standalone record | S1 |
| **S3** | S2 | Establish the non-production trust anchor (issuer + JWKS); configure G24's three existing env vars | S2 |
| **S4** | S2 | Execute the **one-time offline provisioning act**: 1 application user, 1 `(issuer, subject)` mapping → ACTIVE, 1 ACTIVE membership; attest via `G2ProvisioningRecord`; record the PA act ID in the audit `context` | S2 |
| **S5** | S2 | Implement the **contract layer only** — the identity/security-identifier declaration at the boundary (§8.2.5). No route activation | S2 |
| **S6** | S5 | F-7 five-part qualification of the contract layer (positive/negative ownership, failure modes, durability/restart, no cross-domain equivalence) | S5 |
| **S7** | **Separate gate** | **Admission**: dispose `P3` and `P2`; grant implementation authority; activate `/api/user-portfolios/`; qualify and admit the UI | S6 + its own PA act |

**S7 is a separate gate and is NOT authorized by a Gate C contract decision.**

### 10.2 Affected components

| Component | Repository / path | Nature of change (if authorized) |
|---|---|---|
| Contract declaration layer | IRR `frontend/server/user-portfolio/translationBoundary.ts`, `userPortfolioPort.ts`, `userPortfolioContract.ts` | Add the identity/security-identifier declaration constants and the boundary assertion; extend `validateHoldingShape` for the declaration |
| Boundary tests | IRR `frontend/server/user-portfolio/*.test.ts`, `user-portfolio-transport.test.ts` | Add contract-layer tests (§11.2) |
| Fence | IRR `frontend/server/user-portfolio-transport.ts`, `owner-context-unavailable.ts` | **UNCHANGED** until S7. Blob `51704c12…` / `cb8db45d…` must remain byte-identical through S6 |
| Owner context | IRR `frontend/server/owner-context-carrier.ts`, `owner-context-resolver.ts` | **UNCHANGED.** No new value, no scope change, no amendment to the F-1/F-2 value act |
| G24 configuration | IPD G24 runtime env (`IPD_OIDC_ISSUER`, `IPD_OIDC_JWKS_URI`, `IPD_OIDC_AUDIENCE`) | Configuration only — **no IPD source change, no IPD ref change** |
| G24 provisioning data | G24 SQLite at `IPD_PORTFOLIO_DB_PATH` (non-production local DB) | 1 user + 1 mapping + 1 membership, offline, operator-only |
| G24 source | IPD `src/**` @ `6828155e…` | **UNCHANGED.** Any change here is Option 1C — a separate IPD-side authority and outside Gate C |
| NP-04 pin lineage | IPD `2e11fa3b…` | **UNCHANGED.** Not merged, not converged |
| Reports seam | IRR `frontend/server/reports-transport.ts` | **UNCHANGED.** Gate B is separate |
| Tracker / records | IRR `docs/**` | Additive documentation only |

### 10.3 Explicitly excluded from the plan

No new persistence architecture. No merge of the NP-04 and G24 lineages. No IPD ref, branch, tag, or source change. No Company Identity Authority. No `D115-A` effectuation. No identifier-equivalence table. No package pin change. No change to `a0ab5a34…`'s status. No route or UI activation. No runtime or deployment change to any live environment. No production use.

---

## 11. Acceptance criteria, tests and independent verification

### 11.1 Contract-layer acceptance criteria (S2–S6) — all required

| # | Criterion |
|---|---|
| AC-1 | A standalone `D-2` §8 translation-contract record exists, addressing **all fifteen** elements of §6 with an explicit value or an explicit “not applicable, with reason” for each |
| AC-2 | The contract names the source authority, target authority, provisioning authority, and revocation authority explicitly |
| AC-3 | The contract states the failure behavior for **every** missing-mapping case: absent owner context, absent mapping, non-ACTIVE mapping, zero memberships, revoked membership, ambiguous tenancy, tenant mismatch |
| AC-4 | The contract states, affirmatively, that **no** `companyId`↔ISIN↔ticker equivalence is created, implied, or relied upon |
| AC-5 | The contract records that IRR stores **no** mapping, cache, or shadow copy of portfolio data |
| AC-6 | Provisioning is evidenced as offline, one-time, and operator-only; a `G2ProvisioningRecord` attestation exists and carries the PA act ID |
| AC-7 | The F-1/F-2 value act is **unchanged** (blob-verified) and no new owner/tenant literal is introduced |

### 11.2 Required tests

| # | Test | Expected |
|---|---|---|
| T-1 | Save with `symbol` only, `companyId` omitted, `identityStatus: 'UNRESOLVED'`, `resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS'` | Accepted by G24; holding key = `UNRESOLVED:SYM:<symbol>` |
| T-2 | Save with `symbol` only and **no** bypass declaration (i.e. G24 defaults to `RESOLVED`/`CANONICAL_P04`) | **REJECTED** by Save Guard 2 — proves the declaration is load-bearing, not cosmetic |
| T-3 | Save with a ticker-like value in `companyId` (e.g. `'TCS'`) | **Refused at the IRR boundary** — prohibited by `D-2` §3.2 / Reconciliation Act `R5` |
| T-4 | Save with `isin` present, `companyId` omitted, bypass declared | Accepted; holding key = `UNRESOLVED:ISIN:<isin>` |
| T-5 | Two holdings, same symbol, different exchange | No silent merge; resolved per the §6.1 convention, or deferred fail-closed |
| T-6 | Absent owner context (`IIPS_OWNER_CONTEXT_PATH` unset / carrier integrity mismatch) | HTTP 503 `owner-context-unavailable`; **no** G24 call; no data read or written |
| T-7 | Mapping absent, or not `ACTIVE`, or retired | Fail closed; unauthorized indistinguishable from nonexistent; no default tenant |
| T-8 | Membership revoked | Fail closed immediately; no cached tenant survives revocation |
| T-9 | Ambiguous tenancy (two ACTIVE memberships, no requested tenant) | Fail closed; tenancy is **not** guessed |
| T-10 | `x-ipd-tenant-id` mismatching the ACTIVE membership | 403 from G24; surfaced as fail-closed; never a substitution |
| T-11 | Client-supplied identity keys (`userId`, `subject`, `applicationUserId`, `companyId`, `runtimeCompanyId`, `tenantId`, …) | Refused (400/403 per `translationBoundary.ts`); **never** become the principal or tenant |
| T-12 | Restart durability | Owner context, mapping and membership survive process restart; per-request resolution behaves identically before and after |
| T-13 | Fence integrity | `user-portfolio-transport.ts` blob `51704c12…` and `owner-context-unavailable.ts` blob `cb8db45d…` **unchanged** through S6; valid routes still return 503 |
| T-14 | Full frontend suite | No regressions; pre-existing owner-context tests retain their counts and pass |
| T-15 | `tsc --noEmit` | Exit 0 |

### 11.3 Independent verification requirements (mandatory)

1. **Remote ref verification** — IRR `main` and all four IPD refs re-verified against the remote **after** merge, with SHAs reported.
2. **Blob identity verification** — fence blobs (`98147054…`, `51704c12…`, `cb8db45d…`) re-verified at the merged tip and confirmed unchanged unless the authorized step changes them.
3. **Upstream re-verification** — the G24 blobs (`17f9cb8a…`, `1c23f259…`, `e8e09e56…`, `80563c79…`) re-verified against live IPD at `6828155e…` to confirm the contract pin has not drifted.
4. **Scope check** — `git status` / `--name-status` manifest and `git diff --check` clean; documentation-only steps touch documentation only.
5. **Census** — at S6, a repository-wide grep confirms no `/api/user-portfolios/` activation outside the authorized change and no new `./persistence` edge.
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
| R-1 | A local trust anchor partially reverses the deliberate no-auth baseline (PR #61) | Scope the act explicitly to the portfolio seam; state that it is **not** a restoration of application-wide authentication |
| R-2 | Symbol-scoped dedup (Option 2A) means the same issuer under two symbols will not merge | Record as a known non-production limitation; any future entity resolution is a separate act and a separate migration |
| R-3 | Persisting a permanent `UNRESOLVED` marker could be misread later as a defect | The persisted `NON_PRODUCTION_OPERATOR_BYPASS` disposition self-declares its regime; cite this record from the contract |
| R-4 | Exchange collision on `holdingKey` (which ignores `exchange`) | §6.1 convention + fail-closed backstop (T-5) |
| R-5 | Contract completion may be mistaken for admission | This record states that distinction repeatedly (§8.4, §10.1 S7, tracker §15) |
| R-6 | Source-level verification may be mistaken for runtime proof | §11.4; every baseline statement is labelled source-level |
| R-7 | Provisioning creates durable identity state on a branch-only lineage | Attest via `G2ProvisioningRecord`; keep the DB non-production and outside version control |

### 13.2 Exclusions (binding)

No consumer admission. No identity mapping. No persistence change. No route activation. No runtime change. No IPD write. No Company Identity Authority. No `D115-A` effectuation. No lineage merge. No pin change. No production use. No history rewrite.

### 13.3 Downstream dependencies

| Gate / item | Relationship to Gate C |
|---|---|
| **Gate A** (persistence convergence) | **Independent.** Gate C's contract does not require and does not resolve convergence. Neither gate is a prerequisite of the other |
| **Gate B** (Reports owner binding) | **Independent.** Resolved at Option C (retain deferral) and **unchanged by this record** |
| **R3** (Reports pin/consumer admission) | **Independent**; currently without a live subject |
| **R4** (`P1`) | **CLOSED** (`R4-B` remediated, verified at `main@4b3d5866…`). **Not reopened** |
| **`P2`** (`a0ab5a34…` ratification) | **NOT resolved here** — separate act, required before S7 |
| **`P3`** (`/api/user-portfolios/` dispatch) | **NOT resolved here** — separate act, required before S7 |
| **F-7 qualification for Portfolios** | Required at S6 (contract layer) and again at S7 (admission) |
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

## 16. Publication

Published via a single additive, documentation-only pull request from `arena/aacffd2c-iips-review-recovered` to IRR `refs/heads/main`, containing **only** this record and the tracker update (§15 + `CHG-2026-10-13-12` + `REG-12` row pointer). The PR number, head SHA, merge commit and post-merge independent verification are reported in the session’s completion response and recorded in the tracker **after** verification.

**Merge — and therefore durable effect — is the Program Authority's act.** No IPD ref is touched by this publication.

---

*Recording agent: Arena Agent Mode — investigation, preparation, verification and publication support only. **No authority is rendered by the agent.** The Program Authority's disposition is not recorded here because none has been rendered. Prepared 2026-10-13 (Asia/Calcutta). Program Authority: Ramki.*

*Status: **`GATE C — DECISION PACKET COMPLETE; PA DECISION PENDING`.** `/api/user-portfolios*` remains fail-closed at HTTP 503 `owner-context-unavailable`.*
