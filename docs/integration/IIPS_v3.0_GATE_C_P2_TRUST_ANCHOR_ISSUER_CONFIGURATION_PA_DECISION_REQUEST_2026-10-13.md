# IIPS v3.0 — Gate C P-2: Trust-Anchor / Issuer Configuration — PA Decision Request

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG12-GATE-C-P2-TRUST-ANCHOR-ISSUER-CONFIGURATION-PA-DECISION-REQUEST-2026-10-13-01` |
| Gate / step | **Gate C (`REG-12` / `G-2` / `F-4` / `AG-5`) — prerequisite P-2** (the configuration act named by the S5 investigation §5 and the 1A′ specification §5 / §10.2 act 1) |
| Record type | **Program Authority decision request — DECISION PENDING. Grants no authority. Renders, records, pre-selects or recommends-as-decided no P-2 act.** Consolidates the existing Q-2.1…Q-2.7 inputs (1A′ specification §5.5) into one decision-ready presentation with alternatives and a recommendation. Creates no issuer, key, credential, configuration, user, mapping, tenant, membership, provisioning event, database write, implementation change, successful save, admission or capability. |
| Deciding authority | **Ramki** — single owner, sole user, and Program Authority of the single-user, personal-use, non-production IIPS platform |
| Recording agent | Arena Agent Mode — consolidation, preparation and branch publication only, under the attributed standing authorization for governance records, publication and verification. **No authority is rendered by the agent.** |
| Date | **2026-10-13** (UTC). Recorded on its actual date; not backdated. |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main` |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not modified by this record; no IPD ref, branch, tag, file or database is written** |
| Verified IRR baseline at preparation | `main@56c2aa01889974e17bcb836b6434f1f1392415a0` (merge of PR #86 — DP-1 `GC-D3` + 1A′ specification) — re-verified live this session (§3) |
| Verified IPD baselines at preparation | `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`; pin `np04-governed-persistence-windows@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; G24 `arena/01a0e6d9-iips-production-market-data` and `arena/01a0f308-iips-production-market-data` both `@6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`); act branch `arena/01a0f839-iips-production-market-data@12c480b5bf5cfbe0f296fcd12c9189328b915417` — **all four re-verified live and UNCHANGED** |
| Governing records | Gate C decision packet (incl. §9.6 `GC-D3`, §§9.4–9.5, §7.1, §§16.3–16.4); the S5 investigation and decision input; the 1A′ binding-contract and prerequisite specification (P-5 contract §4; P-2 requirements §5; P-3 path §6; P-4 requirements §7; P-6 boundary §8; P-8 plan §9; remaining acts §10); `AD-20` Gate C criteria; `D-2` (§§6/8/9/11); Gate B Option C §2(2); `G2-2` (`P2`/`P3`); the F-1…F-7 policy records; the F-3 mechanism/value/qualification records (standing source blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`); the G2 durable user-portfolio implementation record §5; `H-18`; `NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT.md`; IPD act `26061859…`; canonical tracker §15 (§15.11) |
| Canonical tracker | [`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`](../../IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md) §15 |
| Environment | Non-production. Production is out of scope. **No runtime, deployment or production behavior is claimed or proven anywhere in this record.** |
| Status | **P2-A SELECTED (`GC-D4`) — P-2 ACT RENDERED AS TO PACKAGE AND FIXED TERMS — EXECUTION DESIGNATIONS OUTSTANDING.** The Program Authority rendered a distinct express P-2 package selection on 2026-10-13 (this §12.4; Gate C packet §9.8; tracker §15.12). The ten execution designation values are not yet supplied and no operation is authorized until they are. `/api/user-portfolios*` remains fail-closed at source-level HTTP `503 owner-context-unavailable`. |

> **Bottom line.** `GC-D3` selected the 1A′ direction and rendered its design; it expressly did **not** render the P-2 configuration act. The **only** substantive selection still needed to unblock the 1A′ workstream is that act: the Program Authority must fix the trust anchor's existence, issuer/audience values, algorithm/key and custody, JWKS endpoint and trust relationship, scoped non-production G24 runtime scope, subject semantics, and the §5.3 self-asserted-delegation governance statement (R-2.1…R-2.10 + Q-2.1…Q-2.7), with the standing prohibitions restated. This record presents the exact decisions, the available alternatives for each, and one recommended package — so the act can be rendered **without another investigation cycle**. Nothing in this record is the act.

---

## 1. Purpose, bounded scope, non-goals

### 1.1 Purpose

Directed by the current PA instruction (Gate C P-2 configuration act: reuse completed evidence; consolidate Q-2.1…Q-2.7; respect the authority boundary; preserve invariants), this record:

1. re-verifies **only the mutable facts** on which P-2 depends (§3) — live refs, published artifacts, fence/contract bytes, target pin;
2. states the **authority basis precisely** (§2): what `GC-D3` authorizes and what it withholds, and what the standing authorization covers for this preparation;
3. enumerates the **exact configuration decisions still required** (§4: R-2.1…R-2.10 as fixed content + Q-2.1…Q-2.7 as the PA's selections);
4. sets out the **available alternatives for each decision** (§5) and the **recommended package with rationale** (§6);
5. describes the **proposed issuer/trust-anchor configuration and how it would be established and verified** — in governed form, without inventing any value the evidence does not support (§7);
6. states the **binding treatment of the user-delegation semantics gap** (§8);
7. determines **whether subject and tenant values belong in P-2 or P-4** and states the **recommended P-2/P-4 sequencing with dependencies and reasons** (§9);
8. fixes the **non-production implementation boundary and the qualification evidence required** (§10) and the **IPD-authority boundary** (§11);
9. states the **exact PA selection required** (§12) with proposed act language containing **designated-value placeholders, never pre-filled values**.

### 1.2 In scope

Consolidation and decision-request preparation only: this record (new) on the session branch, pushed durably and opened for review without merging. No second decision packet for Gate C is created — this record is the P-2 act's decision request under the existing Gate C packet and 1A′ specification, not a replacement of either. No canonical-tracker duplicate is created; tracker amendment follows the P-2 disposition, not this request.

### 1.3 Non-goals (explicit)

This record does **not**:

- render, record, transcribe, pre-select or recommend-as-decided any P-2 act, and does not represent its recommendation as a Program Authority act;
- establish, stand up, host, generate keys for, or operate any issuer, JWKS endpoint, OIDC provider or trust anchor;
- generate, store, transmit, custody or rotate any key material, credential, token, secret or certificate;
- set, change or propose the runtime value of `IPD_OIDC_ISSUER`, `IPD_OIDC_JWKS_URI` or `IPD_OIDC_AUDIENCE` on any process, fix any `iss`/`sub`/tenant string, or configure/start any G24 runtime;
- create any `application_user`, `(issuer, subject)` mapping, tenant, membership, portfolio, revision or `mapping_audit_event`; open, create, migrate, query or write any database;
- perform or authorize any provisioning, approval, activation, retirement, reactivation, revocation or owner-correction act;
- change any application code, test, pin, lockfile, schema, route, UI, fence, transport or runtime configuration;
- modify any IPD ref, branch, tag, file, package or record; promote G24, merge or re-pin the NP-04 (`2e11fa3b…`) and G24 (`6828155e…`) lineages, or designate a Company Identity Authority;
- permit a successful unresolved-identity save, weaken the Option 2F pre-port refusal, or alter `assertNoG2CallerAuthority` semantics;
- admit the User Portfolios consumer, dispose `P2`/`P3`, activate any route or UI, or complete F-7;
- treat the F-3 owner-context pair as an authenticated principal, credential or tenant membership, or extend its scope beyond NP-09/NP-10/NP-11;
- introduce caller-controlled canonical identity or resolution disposition, or any authentication, tenant-resolution or portfolio-authorization bypass;
- reopen S0–S5 or repeat the S5 investigation — no new, contradictory or materially incomplete evidence was found (§3).

---

## 2. Authority basis — what `GC-D3` authorizes, what it withholds, and what covers this preparation

### 2.1 `GC-D3` authorizes the direction and its design — not P-2

The Program Authority's distinct express DP-1 act (`GC-D3`, packet §9.6, published on `main` via PR #86) selects **Option 1A′ — scoped non-production binding** and executes the selected option's **design**: the complete `D-2` §8 contract (P-5, elements 1–8 off *Deferred*, identity-bearing parameter values reserved), the P-2/P-3/P-4 requirements, the P-6 boundary and the P-8 plan. By its own recorded terms it does **not** establish an issuer, generate or custody key material, set `IPD_OIDC_*` configuration, obtain or store any credential, create any user/mapping/tenant/membership, perform any provisioning or database write, write any IPD ref or file, authorize any IRR implementation change, permit any successful save, or lift any fence. Each of those remains subject to its own separately rendered act — starting with **P-2**.

### 2.2 What continues to withhold P-2 until the act exists

Each independently sufficient, all verified as still in force at the §3 baseline:

1. `GC-D3`'s own withholding table (1A′ specification §2.3) — the anchor, keys, JWKS, issuer/audience values and scoped runtime configuration are expressly reserved to the P-2 act;
2. `GC-D1`'s remaining operational prohibitions — no issuer, OIDC/Keycloak configuration, delegated credential, mapping, provisioning or membership until the corresponding P-2/P-4 acts are rendered;
3. `GC-D2`'s live-prohibition text — *"No live credential, provisioning, database or IPD write is authorized. The complete identity-binding/translation contract and full F-7 qualification remain pending separate authority."*;
4. `H-18` — modification of OIDC/Keycloak configuration, tenant-membership architecture and enterprise identity platform all NOT AUTHORIZED;
5. `D-2` §§6/9/11, Gate B Option C §2(2), the Reconciliation Act `R5`/`R7` and NP-04 namespace protection — no mapping, no trust propagation, no identity-authority creation, no aliasing of the F-3 pair absent an explicitly authorized evidence-backed contract;
6. the target authority itself — G24 fails closed without a verified credential **and** an `ACTIVE` mapping **and** a resolvable membership, none of which exists or may be created by inference.

### 2.3 What covers this preparation (and only this preparation)

The durable standing authorization (F-3 record §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`, 2026-10-12 grant — re-verified unchanged, §3) plus the current explicit PA direction applying it to P-2 preparation cover exactly the exercised classes: **governance-record preparation, branch publication for review, and read-only verification**. They do not cover rendering the P-2 selection, and no selection is inferred from them. The standing text's own exclusions (no fabricated evidence, no weakened safeguards, no unrelated scope expansion, no unverified success claims) are honored throughout: every proposal below cites the specification or verified target fact it reuses, and every value the evidence does not support is left as a **PA-designated placeholder**.

---

## 3. Live re-verification performed this session (mutable facts only)

Method: `git fetch origin --prune` + local/remote ref comparison; GitHub REST API via `gh` (`git/ref`, `git/commits`, `contents`, `pulls`, `pr list`). Completed S0–S5 investigations were **not** repeated: no changed, uncertain or contradictory fact was found. No application test was re-run — this record changes no application byte, and §3.1 proves the tested bytes are exactly what `main` carries.

### 3.1 IRR (`ramkivs/iips-review-recovered`)

| Item | Verified value | State |
|---|---|---|
| `refs/heads/main` (remote and local) | **`56c2aa01889974e17bcb836b6434f1f1392415a0`** — merge of PR #86 (2026-10-13T16:10:52Z) | **current authoritative tip**; supersedes the `923988f…` baseline recorded in the 1A′ specification |
| Previous `main` (PR #86 first parent) | `923988f45a31dca7fc3549fefac1960a26585769` (PR #85 merge) | confirmed via PR #86 metadata; ordinary merge, no force-push, no history rewrite |
| Working tree / session branch | clean; `arena/ded25f6d-iips-review-recovered` branched from `main@56c2aa0…` | ✓ |
| Open PRs | **none** at start of this run | ✓ |
| Published P-2 inputs at `main` (local `git hash-object` == remote contents-API `sha`) | S5A specification `c3a5596af0469f2f4316ffe9b0da522fefeba96b`; S5 investigation `071df9ba4bdebcff978c4e87cf6718482f4fced1`; Gate C packet `3c02ba9c51062d2b1cf4a2e6eccccfd941bd33fb`; tracker `612282213650f36be7788b569bd86301bcde2fea` | **all match** — the published DP-1/contract/requirements state is intact |
| Fence blobs at current `main` | `reports-transport.ts` `981470541812a64c733309f1debec75455d85bee`; `user-portfolio-transport.ts` `51704c12a467cd2f718a030b5036bc55c9afa73f`; `owner-context-unavailable.ts` `cb8db45d668d28cee7e0a52721001d579a872733` | **all unchanged** |
| Tested 2F blobs at current `main` | `userPortfolioContract.ts` `0dec72eb…`; `translationBoundary.ts` `93f602fd…`; `userPortfolioBoundary.ts` `b8024c6b…`; `userPortfolioPort.ts` `ba0001e8…` | **byte-identical to PR #83's tested tree `8bb5bdae…`** |
| F-3 standing-authorization source | blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` | **unchanged** |
| F-3 carrier / resolver | `a576e5af983c9351e2ea73202ef7f19d61788d13` / `9738e9b393656eec33f849d78f18c606322a4462` | **unchanged** |

### 3.2 IPD (`ramkivs/iips-production-market-data`) — all four reference points re-verified

| Ref | Verified current value | State |
|---|---|---|
| IPD `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | **UNCHANGED** |
| NP-04 pin `np04-governed-persistence-windows` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | **UNCHANGED** |
| G24 `arena/01a0e6d9…` and `arena/01a0f308…` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (both) | **UNCHANGED** |
| Act branch `arena/01a0f839…` | `12c480b5bf5cfbe0f296fcd12c9189328b915417` | **UNCHANGED** |
| Repository activity | `pushed_at = 2026-10-02T12:50:06Z`; default branch `main` | **no IPD write since before `AD-20`; none by this record** |

**Lineage distinction preserved.** NP-04 (`2e11fa3b…`, artifact/report domain) and G24 (`6828155e…`, portfolio/tenancy domain, branch-only reference per `AD-03` and IPD act `26061859…`) remain distinct domain stores on separate refs. Nothing here merges, converges, re-pins or promotes either.

### 3.3 Target pin integrity (blob equality only — not a re-investigation)

G24 commit tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5` and all six S5-cited blobs re-verified equal via the contents API at `6828155e…`: `src/auth/config.ts` `221f4b1b…`, `src/auth/oidc-verifier.ts` `08776f5c…`, `src/app_identity/service.ts` `80563c79…`, `src/server/http-server.ts` `17f9cb8a…`, `src/portfolio/durable-store.ts` `1c23f259…`, `src/portfolio/consolidation.ts` `e8e09e56…`. **The pin is undrifted.** Every target-authority fact the 1A′ specification re-read read-only (three `IPD_OIDC_*` variables with fail-closed loader; `TRUSTED_JWS_ALGORITHMS = ['RS256','ES256']`; `VerifiedOidcCredential` shape and named verifier errors; `resolveExternalIdentity` fail-closed; `ALLOWED_TRANSITIONS` with `UNIQUE (issuer, subject)`; `resolveTenant` refusal set including ambiguous-tenancy refusal; same-transaction audit; the `tenant_memberships` no-derivation comment; the `src/auth/config.ts` exclusions) is therefore **reused as recorded**, not re-derived.

### 3.4 Facts NOT re-verified (and why)

R4-B closure, Gate B Option C, the `D115`/Reconciliation-Act corpus, the AG-5 census, the NP-07/NP-12/NP-13 baselines, the S2–S4 test executions (103/103 offline, typechecks) and the S5/S5A evidence tables are **reused as recorded**; each is closed, published and independently verified at refs that §3.1–§3.3 confirm unmoved. No application test was re-run: this record changes no application byte.

---

## 4. Exact configuration decisions still required

The P-2 act's **fixed content** is R-2.1…R-2.10 (1A′ specification §5.2) plus the §5.3 governance statement. The PA's **selections within that content** are Q-2.1…Q-2.7 (1A′ specification §5.5). Nothing else is outstanding before P-4; nothing in this table is operative until the act is rendered.

| # | Decision (PA selection) | Fixed requirement it answers | What the evidence already fixes (not a choice) | What only the act can supply (the choice) |
|---|---|---|---|---|
| **Q-2.1** | Issuer identifier value and hosting form | R-2.2 (explicit, absolute, stable, non-production `iss`; no collision/alias with the removed historical IRR/`iips-spa` issuer; unambiguously local/non-production) + R-2.4 (absolute `http(s)` JWKS URI, reachable by the scoped runtime, with stated trust relationship and fail-closed unreachability) | Form constraints; the excluded class (historical-issuer reuse, production/shared IdP, non-absolute or unstable value) | The exact `iss` string, the hosting form, the exact JWKS URL and its trust statement |
| **Q-2.2** | Algorithm / key choice | R-2.3 (asymmetric only, matching `TRUSTED_JWS_ALGORITHMS`; `none`/symmetric excluded even as fallbacks; act names the choice; key size/curve per current practice for a non-production anchor) | The accepted set `{RS256, ES256}` (verified at the pin); the excluded set | Which of the two the anchor uses |
| **Q-2.3** | Key custody location and rotation cadence | R-2.7 (operator-controlled, non-production, outside IRR and the repository; named readers; generation/destruction; rotation: publish new public key under new `kid` before first use, retain superseded until last token expiry, then retire; compromise: rotate + revoke mapping where warranted; **no private key, token or secret ever enters IRR, the repository, evidence artifacts or any record**) | Custody boundary; rotation/compromise procedures; the never-in-records rule | The designated custody location, reader set, generation/destruction method, and cadence |
| **Q-2.4** | Explicit audience setting vs. verified default | R-2.6 (the **distinct** `ipd-user-portfolio-api` audience; `iips-spa` neither referenced nor modified; act states explicit-vs-default) | The audience value `ipd-user-portfolio-api` (verified default); the `iips-spa` exclusion | Whether `IPD_OIDC_AUDIENCE` is set explicitly or left at default |
| **Q-2.5** | Whether the act also fixes the subject value and the tenant identifier | R-2.8 (subject = exactly one natural person, the single user as operator; form + stability fixed; never reused as or derived from a G24 identifier, `companyId`, `runtimeCompanyId`, portfolio id, `preferred_username` or operator context) + contract element 4 (target identifier reserved to P-4) | Subject semantics and exclusions; the mapping key is `(issuer, subject)`; the tenant value is G24-domain | Whether the P-2 act fixes the subject value, the tenant value, both, or neither (§9) |
| **Q-2.6** | Whether a single combined P-2/P-4 act is preferred to two sequential acts | 1A′ specification §10.2 ordering constraint: **the issuer must be fixed before the mapping key can be provisioned** (act 2 depends on act 1) | The dependency itself (not a choice) | One combined act with the constraint restated inside it, or two sequential acts (§9) |
| **Q-2.7** | Confirmation of the §5.3 self-asserted-delegation governance statement | 1A′ specification §5.3 (five points, §8 below) | The statement's content (not a choice) | The PA's confirmation in terms — required; without it the act cannot be rendered as 1A′ |

**Fixed P-2 content that is not a Q-selection but must appear in the act verbatim in substance:** R-2.1 (non-production, single-user, narrowly scoped; not an application-wide authentication restoration; PR #61 baseline unchanged for every other capability; no identity platform; no production readiness); R-2.5 (`kid` discipline — stable unique `kid` per key, exactly one active signing key, JWKS may carry additional public keys during rotation); R-2.9 (scoped non-production G24 runtime from pinned ref `6828155e…` with its own `IPD_PORTFOLIO_DB_PATH`, unrelated to production data, IPD `main` and the NP-04 pin); R-2.10 (restated prohibitions — no IPD ref/file change, no G24 promotion, no lineage merge/re-pin, no CIA, no `D115-A` effect, no IRR source/test/pin/lockfile/fence/route change, no consumer admission). The P-2 act must also restate the §5.4 exclusions (no 2F/fence change, no IRR code/tests, no IPD write, no mapping/tenant/membership creation unless combined under Q-2.6/B, no route/UI enablement, no second issuer/symmetric fallback/audience alias/bypass).

---

## 5. Available alternatives for each decision

Every alternative reuses the 1A′ specification and the verified target facts. **No alternative invents a value.** Excluded options are listed so they are not silently revived.

### Q-2.1 — Issuer identifier value and hosting form

| Alternative | Content | Consequences / trade-offs |
|---|---|---|
| **Q-2.1/A — Loopback minimal OIDC-compatible issuer (RECOMMENDED, §6)** | A locally operated, minimal OIDC-compatible issuer on loopback, with a PA-designated absolute non-production `iss` value and absolute `http(s)` JWKS URL satisfying R-2.2/R-2.4. The act states the trust relationship and fail-closed unreachability. | **+** Smallest scope that satisfies the target's existing three-variable trust surface with no IPD source change; loopback confines network exposure to the non-production host; the local/non-production character is unambiguous in the value itself. **−** The PA must still designate the exact strings; loopback operation is an operator responsibility under the act, not a repository artifact. |
| **Q-2.1/B — PA-designated equivalent scoped non-production anchor** | Any other hosting form the PA designates that satisfies R-2.2/R-2.4 identically (absolute stable non-production `iss`, absolute reachable JWKS, stated trust, fail-closed). | **+** Preserves PA freedom over operating form. **−** Any form wider than loopback widens the trust perimeter the act must then bound explicitly in R-2.1/R-2.9; still requires the same exact-value designations. |
| Excluded (not available) | Reuse/alias of the removed historical IRR/`iips-spa` issuer; any production or shared IdP; any non-absolute, unstable or ambiguous `iss`; any JWKS the scoped runtime cannot reach or whose trust is unstated; any form requiring an IPD source change. | Each violates R-2.2/R-2.4, the `iips-spa` exclusion (R-2.6), or the no-IPD-change boundary (§11). |

### Q-2.2 — Algorithm / key choice

| Alternative | Content | Consequences / trade-offs |
|---|---|---|
| **Q-2.2/A — `RS256` (RECOMMENDED, §6)** | The anchor signs with `RS256`; key size per current practice for a non-production anchor, named in the act. | **+** First-listed member of the verified `TRUSTED_JWS_ALGORITHMS`; the smallest deviation from the target's stated order; broadest minimal-issuer library/JWKS interop, narrowing the P-8 credential-matrix operating surface to the recommended case plus the mandatory rejections. **−** None within the accepted set; the P-8 rejections (`none`, symmetric, unknown-`kid`, invalid signature) must still be proven either way. |
| **Q-2.2/B — `ES256`** | The anchor signs with `ES256`; curve per current practice, named in the act. | **+** Fully accepted by the target; smaller keys. **−** Narrower minimal-issuer tooling than `RS256`; identical qualification burden. Fully acceptable if the PA prefers it. |
| Excluded (not available) | `none`, any symmetric algorithm (`HS256`, …), any algorithm outside `TRUSTED_JWS_ALGORITHMS`, or any fallback to an excluded algorithm. | Rejected by the target verifier (`OidcAlgorithmRejectedError`) and prohibited by R-2.3 even as a fallback. |

### Q-2.3 — Key custody location and rotation cadence

| Alternative | Content | Consequences / trade-offs |
|---|---|---|
| **Q-2.3/A — Operator-controlled non-production filesystem custody (RECOMMENDED form, §6)** | Private key material lives at a PA-designated, operator-controlled, non-production filesystem location **outside IRR, outside the repository and outside all records**, readable only by the named operator; generation/destruction method named in the act; rotation and compromise procedures exactly per R-2.7. | **+** Simplest custody that satisfies the never-in-records rule with a directly auditable location designation and reader set. **−** Filesystem permissions are the control; the act must name them precisely. |
| **Q-2.3/B — Operator-controlled secret-store custody** | Same boundary and procedures as A, with the PA-designated location being an operator-controlled OS keystore/secret store outside IRR/repo/records. | **+** Platform-managed access control where available. **−** Store-specific procedure must still be named in the act; identical never-in-records and rotation/compromise burden. Fully acceptable. |
| Cadence (both forms) | The act designates a **bounded rotation interval plus on-demand rotation** (suspected exposure, operator change, or any qualification failure implicating key integrity), with the R-2.7 procedure (publish new `kid` before first use; retain superseded until last token expiry; then retire). | No interval length is pre-filled here — the evidence fixes the **procedure**, the PA fixes the **cadence**. An unbounded or unstated cadence is not available: R-2.7 requires the lifecycle to be stated. |
| Excluded (not available) | Any custody inside IRR, the repository, evidence artifacts, records, chat, tickets or logs; any shared/multi-reader custody beyond the named operator; any rotation that reuses a `kid`, signs before JWKS publication, or drops a superseded public key before its last token expires; recording any private key, token or secret anywhere. | Each violates R-2.7 or R-2.5. |

### Q-2.4 — Explicit audience setting vs. verified default

| Alternative | Content | Consequences / trade-offs |
|---|---|---|
| **Q-2.4/A — Set `IPD_OIDC_AUDIENCE` explicitly (RECOMMENDED, §6)** | The act directs the scoped runtime to set `IPD_OIDC_AUDIENCE=ipd-user-portfolio-api` explicitly, and records that `iips-spa` is neither referenced nor modified. | **+** The configured value is directly citable in P-8 evidence instead of relying on default-read behavior; makes the `iips-spa` exclusion auditable; identical runtime effect to B with stronger evidence. **−** One more configured variable to state correctly (mitigated: the value is the verified constant). |
| **Q-2.4/B — Leave at the verified default** | The act records reliance on the verified default `IPD_DEFAULT_AUDIENCE = 'ipd-user-portfolio-api'`, with the same `iips-spa` exclusion. | **+** Fewer configured variables. **−** P-8 evidence must then cite default-read behavior rather than configuration; any future default change (none exists) would silently alter trust. Fully acceptable. |
| Excluded (not available) | Any audience other than `ipd-user-portfolio-api`; any audience alias; any reference to or modification of the `iips-spa` audience/client. | Violates R-2.6 and the target's distinct-audience check (`OidcAudienceMismatchError`, incl. the `iips-spa` negative case in P-8). |

### Q-2.5 — Whether the act also fixes the subject value and the tenant identifier

| Alternative | Content | Consequences / trade-offs |
|---|---|---|
| **Q-2.5/A — P-2 fixes the subject value; tenant deferred to P-4 (RECOMMENDED, §6/§9)** | The P-2 act fixes the subject value's form, stability **and exact value** per R-2.8 (one natural person; none of the excluded derivations), completing the source identifier `(issuer, subject)` alongside the Q-2.1 issuer. The tenant identifier value is fixed by the P-4 act in its target-domain provisioning context. | **+** Respects the ownership boundary (tenant authority is G24/IPD exclusively — S5 §6; contract element 4 reserves the target identifier to P-4); completes the mapping key at P-2 so P-4 is bounded execution with a pre-stated key; lets the P-8 mapping matrix be stated before provisioning. **−** P-2 carries one identity-bearing value (recorded as a designation in the act, never as a secret — §7.4). |
| **Q-2.5/B — P-2 fixes both subject and tenant values** | Permitted by the 1A′ specification: P-4 shortens to provisioning execution only. | **+** Fewest decision items left for P-4. **−** Collapses the source/target authority separation by naming a G24-domain value before the provisioning context exists; requires the P-2 act to anticipate the P-4 post-condition it cannot yet verify. Acceptable only if the PA prefers a single decision point for all values. |
| **Q-2.5/C — P-2 fixes neither; both deferred to P-4** | The P-2 act fixes subject form/stability (R-2.8) but no exact subject value and no tenant value. | **+** Smallest P-2 decision surface. **−** Leaves the mapping key incomplete at P-2, pushing identity-bearing decisions into P-4 and requiring P-4 to carry decision content beyond bounded execution. Acceptable but least aligned with the §10.2 dependency (the issuer fixes the key; the subject completes it). |

No alternative invents a subject or tenant string here. Every exact value is a PA designation recorded in its act, subject to R-2.8 exclusions and the exactly-one-`ACTIVE`-membership invariant (§7, §9).

### Q-2.6 — Single combined P-2/P-4 act vs. two sequential acts

| Alternative | Content | Consequences / trade-offs |
|---|---|---|
| **Q-2.6/A — Two sequential acts: P-2 then P-4 (RECOMMENDED, §6/§9)** | The PA renders the P-2 configuration act first; after its establishment and verification (§7), the PA renders the separate P-4 provisioning act. | **+** Preserves distinct audit boundaries (configuration vs. offline provisioning execution); allows the anchor to be verified (JWKS reachable, loader fail-closed, issuance testable) **before any database write**; keeps the P-4 post-condition verification (`listTenantMemberships`) and `G2ProvisioningRecord`-shaped attestation cleanly attributed to P-4; matches the specified dependency order exactly. **−** Two PA selections instead of one. |
| **Q-2.6/B — Single combined P-2/P-4 act** | The PA renders one act covering configuration and provisioning together. | **+** One selection for the single-user non-production binding. **−** Conflates the configuration and provisioning authorities; risks provisioning before the anchor is verified unless the act restates the internal ordering constraint with unusual care; P-8 evidence must still label configuration vs. provisioning phases separately. Permitted, with the constraint below. |
| Binding constraint (both) | **The issuer must be fixed before the mapping key can be provisioned.** Under B this ordering must be restated **inside** the single act as an execution order, not merely a dependency note. | Not a choice. Violating it provisions a mapping for an unfixed key — the exact failure the §10.2 dependency exists to prevent. |

### Q-2.7 — Confirmation of the §5.3 self-asserted-delegation governance statement

| Alternative | Content |
|---|---|
| **Q-2.7 — Confirm in terms (REQUIRED)** | The act records the §5.3 statement (§8): no upstream IdP asserts the user's identity; the delegation is **self-asserted** by the single natural person holding both roles; valid only for the single-user non-production baseline; never described as enterprise identity integration or a production trust path; scoped to exactly one subject/audience/runtime; retirable without residue; every downstream artifact labelled **non-production, single-user, self-asserted delegation**. |
| Not available | Proceeding without the confirmation, weakening any of its five points, or describing the binding as user-delegated in G24's accepted sense. That is what distinguishes 1A′ from an unmanaged baseline deviation — without it the act cannot be rendered as 1A′. |

---

## 6. Recommended package and rationale

### 6.1 The recommended P-2 act (package P2-A)

| Decision | Recommended selection | Source |
|---|---|---|
| Q-2.1 | **A** — loopback minimal OIDC-compatible issuer; PA-designated absolute non-production `iss` + absolute JWKS URL with stated trust and fail-closed unreachability | §5, R-2.2/R-2.4 |
| Q-2.2 | **A** — `RS256`, key size named in the act | §5, R-2.3, verified `TRUSTED_JWS_ALGORITHMS` order |
| Q-2.3 | **A** — operator-controlled non-production filesystem custody outside IRR/repo/records, named reader/method, bounded interval + on-demand cadence, R-2.7 rotation/compromise procedures | §5, R-2.7/R-2.5 |
| Q-2.4 | **A** — `IPD_OIDC_AUDIENCE` set explicitly to `ipd-user-portfolio-api`; `iips-spa` exclusion recorded | §5, R-2.6 |
| Q-2.5 | **A** — P-2 fixes the subject value (form/stability/value per R-2.8); tenant value deferred to P-4 | §5, §9, contract element 4 |
| Q-2.6 | **A** — two sequential acts (P-2, then P-4 after P-2 verification) | §5, §9, §10.2 dependency |
| Q-2.7 | **Confirmed** — §5.3 statement in terms | §5, §8 |
| Fixed content | R-2.1 scope statement; R-2.5 `kid` discipline; R-2.9 runtime scope; R-2.10 prohibitions; §5.4 exclusions — all in the act's own words | §4 |

### 6.2 Why this package (rationale, each point grounded)

1. **Smallest sufficient scope.** Loopback + exactly one subject/audience/runtime + the R-2.1 statement is the narrowest anchor that satisfies the target's existing trust surface. Anything wider (Q-2.1/B with a broader form, Q-2.5/B naming target-domain values early, Q-2.6/B conflating authorities) expands the act's perimeter without adding capability.
2. **Target-order fidelity.** `RS256` is the first-listed accepted algorithm at the undrifted pin; selecting it is the smallest deviation from the target's stated order. `ES256` remains fully acceptable (Q-2.2/B) — the recommendation is about narrowing the operating surface, not about target compatibility, which is identical.
3. **Evidence strength.** Explicit audience (Q-2.4/A) and filesystem custody with a named location (Q-2.3/A) produce directly citable P-8 evidence (configured value; designated location + reader set) instead of behavior-dependent evidence (default-read; store-specific procedure). The runtime effect is identical; the audit trail is stronger.
4. **Authority separation.** Fixing the subject in P-2 completes the **source** identifier the P-2 act owns (issuer + subject = mapping key) while leaving the **target** identifier to the P-4 act in whose provisioning context it belongs (contract element 4; S5 §6 ownership boundary). Sequential acts (Q-2.6/A) keep configuration verifiable before any database write exists.
5. **No invented content.** The package designates **forms, procedures and boundaries** and leaves every exact string the evidence does not support (the `iss` value, JWKS URL, subject value, custody path, cadence interval) as a PA designation in the act — satisfying the constraint that specifications are reused and values are not fabricated.

### 6.3 Coherent alternatives the PA may prefer (all permitted)

- **P2-B (single-act variant):** P2-A with Q-2.6/B — one combined P-2/P-4 act with the internal ordering constraint restated as execution order. For a PA preference for a single selection; §9.3 states the cost.
- **P2-C (per-item variations):** any coherent substitution from §5 — Q-2.1/B equivalent anchor, Q-2.2/B `ES256`, Q-2.3/B secret-store custody, Q-2.4/B verified default, Q-2.5/B (both values) or Q-2.5/C (neither value) — provided R-2.1…R-2.10 and §5.3 hold in full.
- **P2-D (decline / defer):** render no P-2 act. `GC-D1`'s prohibitions and `GC-D2` remain in force, Gate C remains open for binding, and no anchor, configuration, provisioning or implementation follows. This is the only alternative that requires no Q-answers.

---

## 7. Proposed issuer / trust-anchor configuration — establishment and verification

### 7.1 The configuration (governed form, no invented values)

The scoped non-production G24 runtime consumes the anchor through **exactly the three existing environment variables it already reads** (verified at the pin; no IPD source change):

| Variable | Governed value under the recommended package | Fixed by |
|---|---|---|
| `IPD_OIDC_ISSUER` | The PA-designated absolute, stable, non-production `iss` string (R-2.2; Q-2.1/A) — **placeholder in this request, designation in the act** | P-2 act |
| `IPD_OIDC_JWKS_URI` | The PA-designated absolute `http(s)` JWKS URL reachable by the scoped runtime, with the act's trust statement (R-2.4; Q-2.1/A) — **placeholder in this request, designation in the act** | P-2 act |
| `IPD_OIDC_AUDIENCE` | `ipd-user-portfolio-api`, set explicitly (R-2.6; Q-2.4/A); `iips-spa` neither referenced nor modified | P-2 act |
| `IPD_PORTFOLIO_DB_PATH` | The scoped runtime's own database path, unrelated to production data, IPD `main` and the NP-04 pin (R-2.9) — **placeholder in this request, designation in the act** | P-2 act |

Signing: `RS256` (Q-2.2/A), one active signing key, stable unique `kid` per key (R-2.3/R-2.5). Subject: the PA-designated value for the single natural person (R-2.8; Q-2.5/A). Custody: the PA-designated operator-controlled location outside IRR/repo/records (R-2.7; Q-2.3/A).

### 7.2 How it would be established (execution order under the P-2 act)

Execution occurs **only** under the rendered P-2 act, by the operator, in this order (each step authorized by the act; none authorized today):

1. The PA renders the P-2 act with all §4 designations, the R-2.1 scope statement, the §8 governance statement and the R-2.10 prohibitions.
2. The operator generates the signing key **at the designated custody location** by the act's named method; the private key never leaves custody and never enters IRR, the repository, evidence or any record.
3. The operator publishes the corresponding public key in JWKS form at the designated endpoint under a stable unique `kid`; exactly one signing key is active for issuance.
4. The operator starts the **scoped non-production G24 runtime from pinned ref `6828155e…`** with the four designations above and no other trust-relevant configuration.
5. The operator verifies establishment per §7.3 **before** any P-4 provisioning is considered (Q-2.6/A).

Under Q-2.6/B the same five steps execute first inside the combined act, before any provisioning step.

### 7.3 How it would be verified (establishment verification, not yet P-8)

1. **Loader fail-closed:** blank/absent issuer or JWKS throws `OidcConfigurationError`; non-absolute JWKS URI rejected; blank audience rejected — the verified `loadOidcTrustConfig()` behavior, observed against the scoped runtime's startup path.
2. **JWKS trust:** the endpoint is reachable by the scoped runtime; unreachable JWKS fails verification closed with no cached-trust fallback (R-2.4).
3. **Issuance/verification round-trip (scoped only):** a short-lived bearer for the fixed subject verifies to `VerifiedOidcCredential { issuer, subject }` with the configured issuer/audience, valid signature/`kid`, unexpired `exp` and present `sub`; each negative control (wrong issuer, wrong audience incl. `iips-spa`, expired, invalid signature, unknown `kid`, `none`/symmetric `alg`, missing subject, malformed, missing credential, unconfigured verifier) denies with its named error class — the P-8 credential matrix (§10.3), executed only as the P-2/P-8 acts authorize.
4. **Configuration evidence:** the four designations recorded as act designations (not secrets); the `iips-spa` exclusion recorded; fence blobs and 2F bytes re-verified byte-identical; the runtime's database path shown to be the designated non-production path only.
5. **Label discipline:** every artifact carries **non-production, single-user, self-asserted delegation** (§8); no runtime, deployment or production readiness is claimed from any result.

### 7.4 What is recorded vs. what never enters a record

**Recorded as act designations and evidence (not secrets, not runtime inputs):** the `iss` string, JWKS URI, audience setting, `kid`(s) of public keys, subject value (Q-2.5/A), custody **location designation** (not key bytes), cadence, runtime scope and database-path designation, and the P-4 attestation identifiers when that act is rendered. **Never recorded anywhere:** private key material, bearer tokens, secrets, or any credential value (R-2.7; P-3 presentation integrity; P-4 §7.5.5).

---

## 8. Treatment of the user-delegation semantics gap (binding)

The target's accepted direction is **user-delegated OIDC**: an upstream identity provider asserts the user's identity and G24 independently validates that assertion. Under 1A′ the same natural person acts as both user and operator of the scoped anchor. A locally issued, asymmetric-signed token is therefore **technically verifiable** by G24 — configuration compatibility is real — but it is **not** G24's accepted user-delegated credential and *"cannot silently be substituted"* for it (packet §7.1). The 1A′ specification §5.3 governs that gap as follows, and the P-2 act must confirm all five points in terms (Q-2.7):

1. **Statement of fact.** No independent upstream IdP asserts the user's identity; the delegation is **self-asserted** by the single natural person holding both the user and operator roles; the resulting binding is valid **only** for the single-user non-production baseline.
2. **No generalisation.** The binding must never be described as, or cited as evidence of, an enterprise identity integration, a multi-user delegation model, a production trust path, or readiness for either. It does not generalise to a second user, a second tenant, or a service principal.
3. **Scope containment.** Because the delegation is self-asserted, the anchor is scoped to exactly one subject, one audience, one scoped non-production runtime, and nothing else; the act states this limitation as a property of the grant, not merely of the configuration.
4. **Reversibility.** The anchor can be retired without residue: key material destroyed, JWKS withdrawn, runtime configuration unset, and the binding denied (subject to the P-4 revocation path).
5. **Downstream honesty.** Every artifact downstream of the act — establishment verification (§7.3), P-8 qualification evidence, tracker entries and any status statement — carries the label **non-production, single-user, self-asserted delegation**, and never claims runtime, deployment or production readiness from any offline or scoped-runtime result.

---

## 9. Subject/tenant placement and P-2/P-4 sequencing

### 9.1 Whether subject and tenant values must be decided jointly with P-2 or under a separate P-4 act

**Neither value *must* be joint; the permitted placements and the recommendation are:**

| Value | Domain | May be fixed in P-2? | Recommended placement | Reason |
|---|---|---|---|---|
| Subject value | Source identifier (`(issuer, subject)` — the mapping key) | **Yes** (Q-2.5) | **P-2 (Q-2.5/A)** — alongside the issuer the P-2 act already fixes, completing the key the P-4 act will provision | The P-2 act owns the source identifier; completing the key at P-2 makes P-4 bounded execution with a pre-stated key and lets the P-8 mapping matrix be stated before any write |
| Tenant identifier | Target identifier (G24 `tenant_memberships` — target domain) | Yes, but **not recommended** (Q-2.5/B permitted) | **P-4** — in the provisioning context that creates and verifies it | Tenant authority is G24/IPD exclusively (S5 §6); contract element 4 reserves the target identifier to P-4; only P-4 can verify the exactly-one-`ACTIVE`-membership post-condition via `listTenantMemberships` rather than assume it |

Joint fixing of both values in P-2 (Q-2.5/B) is permitted and shortens P-4 to execution only, but it names a target-domain value before the provisioning context exists and requires P-2 to anticipate a post-condition it cannot verify. Fixing neither in P-2 (Q-2.5/C) is permitted but leaves the mapping key incomplete and pushes decision content into what should be bounded execution.

### 9.2 Recommended sequencing: P-2, then P-4, then P-6 (exercised), then P-8

| Order | Act | Content | Depends on | Reason |
|---|---|---|---|---|
| 1 | **P-2 configuration act** | §4 + Q-answers + §8 statement; authorizes the anchor, custody, JWKS, issuer/audience/subject designations and the scoped runtime configuration | `GC-D3` (rendered) | The issuer fixes the mapping key; nothing downstream has a key, credential or runtime without it |
| 2 | **P-4 provisioning act** | Bounded offline operator execution: exactly one `ACTIVE` user, one `(issuer, subject)` mapping `PENDING→APPROVED→ACTIVE`, one tenant with exactly one `ACTIVE` membership (post-condition verified, not assumed), same-transaction audit, `G2ProvisioningRecord`-shaped attestation, named revocation path | Act 1 (issuer + subject fix the key) | Provisioning for an unfixed key is the failure the dependency prevents; the anchor must be verified (§7.3) before any database write |
| 3 | **P-6 IRR implementation authority** (rendered possibly earlier, **exercised** here) | §10.1 surfaces 1–5 only; fence/transport excluded | Acts 1–2 rendered | No credential exists to acquire and no mapping exists to resolve before acts 1–2; exercising earlier builds against unfixed identifiers |
| 4 | **P-8 qualification execution** | §10.3 plan; offline subset first, scoped-runtime evidence only as acts 1–3 authorize; published and independently verified | Acts 1–3 | Qualification without the anchor (act 1), the provisioned state (act 2) or the seam (act 3) has no trust path to qualify |

**No further investigation is required before act 1.** The S5 investigation is complete, `GC-D3` is rendered, the 1A′ specification supplies the design and the exact residual boundary, and this record supplies the consolidated selections. The remaining gap is **authority**, not evidence.

### 9.3 If the PA prefers a single combined act (Q-2.6/B)

The combined act must (a) contain the full P-2 content (§4 + §8) **and** the full P-4 content (bounded end state, invariant, prohibitions, audit, attestation, revocation path per 1A′ specification §7); (b) restate the ordering constraint as **execution order** — steps §7.2.1–7.2.5 complete and §7.3 verified before any provisioning step; (c) keep the P-4 post-condition verification and attestation attributed to the provisioning phase. The cost is conflated audit boundaries and a larger single selection; the benefit is one PA round-trip.

---

## 10. Non-production implementation boundary and qualification evidence required

### 10.1 P-6 implementation-authority boundary (fixed — not granted by anything here)

The 1A′ binding requires exactly the six IRR-side surfaces below (1A′ specification §8.1). **None is written by this record; all require the separate P-6 act:**

1. Governed owner-context source — server-side, non-caller-controlled context from P-2/P-4 configuration, failing closed when absent/blank (§6.4 of the specification);
2. Credential acquisition — short-lived user bearer from the P-2 anchor, bounded expiry, no persistent secret in IRR state;
3. Credential presentation — in the port/adapter seam, one upstream request per operation (no first-party G24 HTTP adapter exists today);
4. Contract version / binding fields — new IRR contract version (v3) recording the binding fields, preserving every 2F refusal and `assertNoG2CallerAuthority`;
5. Tests — offline contract-level tests per §10.3, with an offline subset requiring no live issuer;
6. Fence / transport — **explicitly excluded**: `user-portfolio-transport.ts` and `owner-context-unavailable.ts` remain byte-unchanged; the six routes remain `503`.

Excluded from P-6 in all cases: fence change, route/UI activation, consumer admission, `P2`/`P3` disposition, successful-write policy (S6), canonical identifier selection (`DP-2`), F-3 carrier/resolver changes, Reports changes, lockfile/package-pin changes, and any persistence/schema/migration change on either side.

### 10.2 IPD-side position (no source change required)

**1A′ requires no IPD source change** (1A′ specification §8.3): the target consumes the anchor through three pre-existing environment variables and validates the credential itself. Starting the scoped runtime and setting its `IPD_OIDC_*` variables and `IPD_PORTFOLIO_DB_PATH` are **non-production process operations**, not repository writes — but they are **not** authorized by `GC-D3` and must be named in the P-2 act (R-2.9). They write no IPD ref, branch, tag or file. See §11 for what *would* need a separate IPD-side act.

### 10.3 P-8 qualification evidence required (plan fixed — nothing executed)

The executable plan is 1A′ specification §9, summarized here so the P-2 act is rendered with full knowledge of the evidence it will be held to. **None of it is executed or claimed by this record:**

- **Credential matrix (12 cases):** valid token verifies; missing, malformed, `none`-`alg`, symmetric-`alg`, unknown/absent-`kid`, invalid signature, expired, wrong issuer, wrong audience (incl. the `iips-spa` audience), missing subject each deny with their named error; unconfigured verifier verifies nothing. Each negative case also asserts IRR-side failure preservation (no repair, retry, default, conversion or downstream write).
- **Mapping matrix:** unmapped `(issuer, subject)` → 403-class denial; `PENDING`/`APPROVED`/`RETIRED` refused; `ACTIVE` → exactly one user; suspended user refused; **no request-time mapping creation possible** (no-call/no-write instrumented test).
- **Tenancy matrix:** zero memberships / absent requested tenant / non-`ACTIVE` requested membership / **>1 `ACTIVE` with no requested tenant** → refused, never guessed; exactly one `ACTIVE` + governed hint → resolved; blank hint denied at the IRR boundary before any port call; foreign tenant refused with existence-hiding preserved.
- **Ownership/authorization matrix:** wrong owner and tenant-mismatched portfolio indistinguishable from nonexistent (404 hiding preserved); the `PortfolioAuthorizer` chain proven mandatory and unskippable by any IRR-side declaration.
- **Bypass cross-product:** only if any resolution exception is ever separately considered — crossed with all credential/membership/owner negatives plus server-controlled production/disabled rejection (*"G24-C6 alone is insufficient"*). **No such exception is part of 1A′ and none is recommended.**
- **No-trust-propagation evidence:** forwarded headers/cookies/query/claims confer nothing; caller identity fields still refused at the IRR contract layer under any contract v3; caller `Authorization` influences nothing.
- **Provisioning/audit evidence:** offline attestation matches `mapping_audit_events`; no IRR-side identity state created; the exactly-one-`ACTIVE`-membership post-condition observed, not assumed.
- **Durability/restart:** mapping/membership resolution survives G24 restart (feeds F-7 part 4; does not complete F-7).
- **Fence/admission invariance:** throughout every qualification activity, `/api/user-portfolios*` remains source-level `503` with the §3.1 blobs re-verified byte-identical; no consumer/route/UI activation.
- **Evidence form:** each record states its act(s), pinned refs/blobs, commands and observed results, negative-case assertions with no-call/no-write instrumentation, the **offline-vs-scoped-runtime label**, and an explicit **"not claimed"** list (no production/deployment readiness, no full F-7, no admission, no successful write).

---

## 11. Decisions affecting IPD — separate IPD authority boundary

### 11.1 What the recommended P-2 act does NOT require (no separate IPD-side act)

The P-2 act as specified — including setting the scoped runtime's `IPD_OIDC_*` variables and `IPD_PORTFOLIO_DB_PATH` and starting that runtime from pinned ref `6828155e…` — is a set of **non-production process operations on a scoped process**. It writes **no** IPD ref, branch, tag, file, package or record, changes **no** IPD source byte, and promotes, re-pins or merges nothing. It is rendered by the Program Authority as the P-2 configuration act (an IRR-side governance act reaching a scoped runtime), exactly as the 1A′ specification §8.4 provides. **No separate IPD-side act is required for it and none is requested here.**

### 11.2 What WOULD require a separate IPD-side act (all excluded from 1A′)

Any of the following is outside the P-2 act, outside 1A′, and requires its **own IPD-side act** (plus, where applicable, `g24_*` suite re-qualification and revisiting `AD-03` reference-only status). Listing them here binds the P-2 act to exclude them:

| IPD-affecting decision | Why separate authority is required | Status under 1A′ |
|---|---|---|
| Any **IPD source change** (the 1C-class option — trust-model extension, environment-gate implementation, or any edit on `arena/01a0e6d9…`) | IPD repository write; outside Gate C's IRR-side scope; packet §7.1 | **Not selected, not required, not requested** |
| **G24 promotion to IPD `main`** | Expressly PROHIBITED by IPD act `26061859…` (only `arena/01a0e6d9` is the designated target) | **Prohibited; unchanged** |
| **NP-04/G24 lineage merge, convergence, re-pin or namespace change** | Gate A scope; NP-04 boundary act; Reconciliation Act `R5`/`R7`; `D-2` §11 | **Prohibited; unchanged** |
| New IPD enum, API, package export or `./persistence`-surface change | Package/API contract change (contract element 15) | **None; unchanged** |
| Company Identity Authority designation; `D115-A` effectuation; `companyId` semantics change | Constitutive acts excluded by `D-2` §11 and the Reconciliation Act | **None; unchanged** |
| Any other IPD ref, branch, tag, file or record write | IPD repository write, full stop | **None; `pushed_at` must remain `2026-10-02T12:50:06Z`** |

The P-2 act must restate the R-2.10 prohibitions covering this table in its own words.

---

## 12. Exact PA selection required

### 12.1 Decision-readiness determination

**The evidence input for the P-2 act is COMPLETE.** All refs are live-verified and the target pin is undrifted (§3); the contract is rendered with elements 1–8 governed (1A′ specification §4); the P-2/P-3/P-4 requirements, P-6 boundary and P-8 plan are specified; ownership boundaries and the compatibility checklist stand (S5 §§6–7); and this record consolidates every Q-selection with alternatives and a recommendation (§§4–6). **No further investigation is required before the Program Authority acts, and none can substitute for the act.**

### 12.2 The substantive selection (and only it)

> **P-2 SELECTION OUTSTANDING:** The Program Authority must render the **P-2 configuration act** — answering **Q-2.1…Q-2.7** (§4–§5), supplying the **R-2.1…R-2.10 content** (§4) and confirming the **§5.3 self-asserted-delegation governance statement** (§8) — in one of the coherent forms below. Until that act exists, `GC-D1`'s operational prohibitions, `GC-D2`'s live-prohibition text and `H-18` continue to withhold every P-2 operation, and no P-4, P-6-exercise or P-8 step is authorized or possible.

| Choice | Content |
|---|---|
| **P2-A (RECOMMENDED)** | The §6.1 package: Q-2.1/A loopback anchor with PA-designated `iss`/JWKS; Q-2.2/A `RS256`; Q-2.3/A filesystem custody with PA-designated location/readers/method/cadence; Q-2.4/A explicit audience; Q-2.5/A subject fixed in P-2, tenant in P-4; Q-2.6/A sequential acts; Q-2.7 confirmed; plus R-2.1/R-2.5/R-2.9/R-2.10 and §5.4 exclusions. |
| **P2-B** | P2-A with Q-2.6/B: the same content rendered as **one combined P-2/P-4 act** with the §9.3 execution order restated inside it. |
| **P2-C** | Any other coherent §5 substitution set satisfying R-2.1…R-2.10 and §8 in full (Q-2.1/B equivalent anchor; Q-2.2/B `ES256`; Q-2.3/B secret-store custody; Q-2.4/B verified default; Q-2.5/B both values or Q-2.5/C neither value in P-2). |
| **P2-D** | Render no P-2 act (decline/defer). Binding remains unconfigured; Gate C remains open for binding. |

A generic "approval to continue routine work" is **not** requested and would not satisfy this section. Only a selection in one of the four forms above — with every Q answered and every R supplied — renders the act.

### 12.3 Proposed act language (pending selection — not rendered)

The following is the **proposed** P-2 act text for the recommended package. It is **not** the act. Bracketed placeholders are PA designations that **cannot** be pre-filled by the recording agent; the evidence supports no value for them.

> "I, Ramki, as Program Authority, render the **P-2 trust-anchor / issuer configuration act** for the Gate C 1A′ binding (package P2-A). I authorize a **non-production, single-user, narrowly scoped** trust anchor for the 1A′ binding only: this is **not** a restoration of application-wide IRR authentication, does not change the PR #61 no-auth baseline for any other capability, creates no identity platform, and confers no production readiness. I designate the issuer identifier `[ISSUER — absolute, stable, non-production iss, unambiguously local, not colliding with or aliasing the removed historical IRR/iips-spa issuer]` and the JWKS endpoint `[JWKS_URI — absolute http(s) URL reachable by the scoped runtime]`, operated as a locally run minimal OIDC-compatible issuer on loopback; I state the trust relationship as `[TRUST STATEMENT]` with unreachable-JWKS failing verification closed and no cached-trust fallback. I designate algorithm `[RS256]` with key size `[SIZE]` per current non-production practice, `kid` discipline of one active signing key with stable unique `kid`s, and audience `ipd-user-portfolio-api` set **explicitly** via `IPD_OIDC_AUDIENCE`, with the `iips-spa` audience/client neither referenced nor modified. I designate key custody at `[CUSTODY LOCATION — operator-controlled, non-production, outside IRR, the repository and all records]`, readable only by `[READERS]`, generated and destroyed by `[METHOD]`, with rotation `[BOUNDED INTERVAL plus on-demand]` executed as publish-new-`kid`-before-first-use / retain-superseded-until-last-token-expiry / then-retire, and compromise handled by rotation plus mapping revocation where warranted; no private key, token or secret may ever enter IRR, the repository, evidence artifacts or any record. I fix the subject value `[SUBJECT — exactly one natural person, the single user as operator; form and stability fixed; never reused as or derived from a G24 identifier, companyId, runtimeCompanyId, portfolio id, preferred_username or operator context]`; the tenant identifier is **not** fixed here and belongs to the separate P-4 act. I bound the runtime as a **scoped non-production G24 runtime started from pinned ref `6828155e…`** with its own database path `[IPD_PORTFOLIO_DB_PATH — unrelated to production data, IPD main and the NP-04 pin]`. I confirm the §5.3 self-asserted-delegation governance statement in terms: no upstream IdP asserts the user's identity; the delegation is **self-asserted** by the single natural person holding both roles, valid only for the single-user non-production baseline, never to be described as enterprise identity integration or a production trust path, scoped to exactly one subject/audience/runtime, retirable without residue, with every downstream artifact labelled **non-production, single-user, self-asserted delegation**. This act does not change any IPD ref or file; does not promote G24; does not merge or re-pin the NP-04/G24 lineages; does not designate a CIA; does not make `D115-A` effective; does not alter any IRR source, test, pin, lockfile, fence or route; does not create any mapping, tenant or membership (P-4); does not enable any route or UI; does not introduce a second issuer, symmetric fallback, audience alias or bypass; and does not admit any consumer. P-4 provisioning, P-6 implementation and P-8 qualification each remain subject to their own acts. `GC-D2` remains in force unchanged; S6 and S7 remain separately gated."

Under P2-B the same text is extended with the full P-4 content and the §9.3 execution order. Under P2-C the bracketed and algorithm/audience/custody/placement terms vary per the selected §5 alternatives. Under P2-D no text is rendered.

### 12.4 Disposition recorded: `GC-D4` — P2-A SELECTED (2026-10-13)

**Authority source and date, recorded accurately.** The Program Authority rendered a **distinct express P-2 package decision selecting P2-A** by direct explicit selection in the operating session on **2026-10-13**, recorded on that date. It is **not** a recommendation, **not** pending approval, **not** an inference from standing authorization, **not** a separately signed instrument, and **not** a retrieved Library artifact. No signature, approval ID, document identifier or third-party confirmation is asserted for it, and none is fabricated. The attributed standing authorization (F-3 record §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`) remains the basis only for the **recording, publication and independent remote verification** of this disposition.

**Selections recorded (exact, no substitution):** Q-2.1/A (loopback minimal OIDC-compatible issuer with explicitly designated non-production `iss`/JWKS values); Q-2.2/A (`RS256`); Q-2.3/A (operator filesystem custody outside IRR/repo/records with documented reader, method, procedures and boundary); Q-2.4/A (explicit `ipd-user-portfolio-api`); Q-2.5/A (subject fixed in P-2, tenant in P-4); Q-2.6/A (sequential P-2 then P-4); Q-2.7 (§5.3 statement confirmed in terms) — with all R-2.1…R-2.10 terms, prohibitions, compatibility constraints and qualification requirements of this packet carried forward unchanged.

**Effect.** The P-2 act is **rendered as to the selected package and all fixed terms**. It is **not effective for execution**: the ten execution designation values (§12.3 placeholders: `ISSUER`, `JWKS_URI`, trust statement, `RS256` key size, custody location, readers, generation/destruction method, rotation interval, `SUBJECT`, `IPD_PORTFOLIO_DB_PATH`) were not supplied by any evidence and are not invented here. No issuer exists, no key is generated, no configuration is set, no credential is obtained, and no P-4, P-6-exercise or P-8 step is authorized until those designations are supplied through the established authority process and recorded. The authoritative act record is Gate C packet §9.8 (`GC-D4`); the canonical-tracker record is §15.12. Publication coordinates are completed **after** merge by post-merge independent remote verification, never self-embedded.

### 12.5 Designation worksheet and consolidated decision request (2026-10-13)

The ten §12.3 placeholders are researched and presented in **one** consolidated request: [`IIPS_v3.0_GATE_C_P2_EXECUTION_DESIGNATION_WORKSHEET_AND_CONSOLIDATED_DECISION_REQUEST_2026-10-13.md`](IIPS_v3.0_GATE_C_P2_EXECUTION_DESIGNATION_WORKSHEET_AND_CONSOLIDATED_DECISION_REQUEST_2026-10-13.md) (packet §9.10; tracker §15.13). It separates the **selected forms** of `GC-D4` from the **designation values** still required (a form is never recorded as a value), states the evidence and the excluded classes behind each designation, proposes one value per designation as recommended Designation Set `P2-A-D1`, checks the set against the verified G24 runtime configuration at pin `6828155e…` (exact-`iss` equality, audience membership, `kid`/JWKS shape, fail-closed loader/startup order, port isolation, absolute `IPD_PORTFOLIO_DB_PATH`), and re-states everything that remains blocked. **It renders no designation and changes no term of this request**; the ten values remain OUTSTANDING, and the act becomes effective for execution only when the Program Authority supplies them through the established authority process and they are recorded.

---

## 13. Invariants preserved (verified at this record)

1. **User Portfolios HTTP `503` fence unchanged** — `98147054…` / `51704c12…` / `cb8db45d…`, all byte-identical to the recorded baseline; all six valid routes answer `503 owner-context-unavailable`, unknown path 404, wrong method 405+Allow.
2. **Option 2F refusal unchanged** — `0dec72eb…` / `93f602fd…` / `b8024c6b…` / `ba0001e8…`: unresolved or ambiguous writes are refused before serialization and before any persistence-port invocation; no successful save path exists.
3. **F-3 is not a principal, credential or tenant membership** — the owner-context pair remains partition semantics for NP-09/NP-10/NP-11 only; carrier `a576e5af…` and resolver `9738e9b3…` unchanged; not extended, copied or aliased anywhere in this record.
4. **No caller-controlled canonical identity or resolution disposition** — no such input is introduced or admitted by this record.
5. **No live IPD write and no protected-ref change** — all four IPD refs re-verified UNCHANGED (§3.2); IPD `pushed_at` unchanged; G24 promotion to `main` remains PROHIBITED.
6. **NP-04 and G24 lineages remain distinct** — `2e11fa3b…` and `6828155e…` unmerged, unre-pinned, un-promoted.
7. **No route/UI activation and no consumer admission** — no route, UI, consumer or `P2`/`P3` disposition is touched.
8. **S6 and S7 remain separately gated** — the successful-write identity policy and full F-7 (S6) and consumer admission (S7) are untouched and unapproved by anything here.
9. **Gate states unchanged** — Gate A OPEN; Gate B Option C; R3 OPEN (no live subject); R4-B CLOSED (not reopened); `D115-A` ineffective; no Company Identity Authority designated.
10. **No live binding exists** — this record creates no issuer, key, credential, configuration, user, mapping, tenant, membership, provisioning event or database write.

---

## 14. Validation performed and not performed (this record)

### 14.1 Performed (read-only unless stated)

1. Live ref/PR/branch re-verification exactly as tabulated in §3 (IRR fetch + API; all four IPD refs; IPD repository metadata; published-artifact blob equality local-vs-remote; fence, 2F and F-3 blob equality).
2. Blob-equality re-verification of the G24 target pin (commit tree + six S5-cited blobs) via the contents API — **pin-integrity only; no S5 fact re-derived**.
3. Re-read of the governing records at the verified baseline: the Gate C packet (§§7.1, 9.4–9.7, 10.1, 16.3–16.4), the S5 investigation (prerequisites, ownership, compatibility, qualification bar), the 1A′ specification (§§2, 4–10), `D-2` §§6/8/9/11, `H-18`, G2 implementation record §5, `AD-20` §4.3 Gate C criteria, and the F-3 standing-authorization source.
4. Documentation-only mutation scope: **exactly one path** — this record (new) on the session branch. `git diff --check` verified before pushing; protected blobs re-verified byte-identical.
5. Branch publication for review (§15); remote-branch equality verification after push.

### 14.2 Not performed (and none authorized)

No issuer stood up; no key generated, stored, published or rotated; no JWKS endpoint served; no `IPD_OIDC_*` variable set; no G24 runtime started or configured; no credential obtained, stored, refreshed or presented; no database created, opened or written; no user, mapping, tenant or membership provisioned; no `mapping_audit_event` written; no application test re-run (no application byte changed — re-running would re-prove identical code, and §3.1 proves the published bytes are the tested bytes); no live HTTP request to any endpoint; no IPD ref, branch, tag or file written; no Windows/PowerShell, Arena-archive or Library state accessed. **No runtime or production behavior is claimed or proven anywhere in this record; the 503 baseline remains a source-level determination.**

---

## 15. Publication and effectiveness

Prepared on session branch `arena/ded25f6d-iips-review-recovered` (branched from `main@56c2aa0…`) and published durably for Program Authority review through the established pull-request workflow. **Update (2026-10-13): the P-2 disposition is now rendered (§12.4, `GC-D4` — P2-A selected); this pull request carries the request + disposition + Gate C packet and tracker amendments to `main` together**, matching the program precedent for decision publication. No force-push, no history rewrite, no review-control bypass; no IPD write. Consistent with the program effectiveness rule, all statements about `main` publication coordinates are completed **after** merge by post-merge independent remote verification (PR verification comment plus tracker/completion evidence), never self-embedded.

Effectiveness of **this record as a request** makes the consolidated alternatives and recommendation durable for review; it does **not** create any P-2 authority and does not render any §12.2 choice. Only the Program Authority's selection in one of the §12.2 forms — recorded per §12.4 and durably published with independent verification — can unblock P-4, P-6-exercise and P-8. After that disposition: record and publish the decision, execute only the steps the act authorizes, proceed through P-4 → P-6 → P-8 in dependency order with offline tests and independent trust-path qualification at their prerequisites, independently verify every durable publication and protected invariant, and continue toward S6/S7 only when their separate prerequisites and authorities are satisfied.

---

*Recording agent: Arena Agent Mode — consolidation of the existing Q-2.1…Q-2.7 inputs into one decision-ready P-2 presentation, under the Program Authority's direction and the attributed standing authorization for preparation, branch publication and verification. No authority is rendered, inferred or fabricated by the agent. Program Authority: Ramki.*

*Status: **`P2-A SELECTED (GC-D4) — P-2 PACKAGE + FIXED TERMS RENDERED — EXECUTION DESIGNATIONS OUTSTANDING — NO OPERATION AUTHORIZED`.** Gate C remains OPEN; `GC-D3` direction + design durable on `main`; S2–S4 complete and verified; S5/S5A evidence preserved; S6/S7 separately gated; `/api/user-portfolios*` remains fail-closed at source-level HTTP `503 owner-context-unavailable`.*
