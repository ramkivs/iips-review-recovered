# IIPS v3.0 — Gate C P-2: Execution Designation Worksheet and Consolidated PA Decision Request

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG12-GATE-C-P2-EXECUTION-DESIGNATION-WORKSHEET-AND-CONSOLIDATED-DECISION-REQUEST-2026-10-13-01` |
| Gate / step | **Gate C (`REG-12` / `G-2` / `F-4` / `AG-5`) — prerequisite P-2**, execution designations (the ten values enumerated OUTSTANDING in packet §9.8, P-2 request §12.4 and tracker §15.12) |
| Record type | **Program Authority decision request + designation worksheet. DECISION REQUIRED — renders, adopts or fixes no value.** Creates no issuer, key, credential, configuration, runtime, user, mapping, tenant, membership, database, IRR byte or IPD byte. |
| Deciding authority | **Ramki** — single owner, sole user, Program Authority of the single-user, personal-use, non-production IIPS platform |
| Recording agent | Arena Agent Mode — evidence review, worksheet, consolidation, compatibility checking, branch publication and remote verification only, under the attributed standing authorization. **No authority is rendered by the agent.** |
| Date | **2026-10-13** (UTC). Recorded on its actual date; not backdated. |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main` |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not modified; no IPD ref, branch, tag, file, package or database is written** |
| Verified IRR baseline | `main@b7e384a067c462870f16dee951b3e657eed585f5` (merge of PR #87, 2026-10-13T16:33:42Z) — **re-verified live this session** (§3) |
| Verified IPD baselines | `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`; pin `np04-governed-persistence-windows@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; G24 `arena/01a0e6d9…` and `arena/01a0f308…` both `@6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`); act branch `arena/01a0f839…@12c480b5bf5cfbe0f296fcd12c9189328b915417` — **all four re-verified live and UNCHANGED** |
| Governing records | `GC-D4` (Gate C packet §9.8; P-2 request §12.4); P-2 request §§4–11 and the proposed act §12.3; 1A′ specification §5 (`R-2.1…R-2.10`, §5.3 statement, §5.5 decision inputs), §7 (P-4), §8 (P-6), §9 (P-8), §10.2 (act order); S5 investigation §§5–7; Gate C packet §§9.2/9.6/16.3–16.5; canonical tracker §15.12; F-3 standing source blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`; `H-18`; `D-2` §§6/8/9/11 |
| Status | **TEN DESIGNATIONS RESEARCHED AND PRESENTED WITH RECOMMENDED VALUES — PA DESIGNATION ACT REQUIRED. No value is fixed; no issuer, key, credential, configuration, runtime or mapping exists; no operation is authorized. `/api/user-portfolios*` remains fail-closed at source-level HTTP `503 owner-context-unavailable`.** |

> **Bottom line.** `GC-D4` selected package **P2-A** and rendered every fixed term of the P-2 act, but it did **not** supply the ten execution designation values; until they are supplied through the established authority process and recorded, the act is *not effective for execution* and no P-2, P-4, P-6-exercise or P-8 step may proceed. This record does the preparatory work that can be done without inventing anything: it examines each of the ten designations against the authoritative specifications and the verified target configuration, separates **evidence-backed facts** from **proposed values**, states the **designation authority** each value requires, and sets out the **dependency and security consequence** of each — then presents **one consolidated decision request** (Designation Set `P2-A-D1`, §5) with a recommended value per designation. Nothing in this record is a designation; only the Program Authority's express act supplies the values.

---

## 1. Purpose, bounded scope, non-goals

### 1.1 Purpose

Directed by the current PA instruction (resolve the ten P-2 execution designations; reuse all published evidence; do not reopen S0–S5; do not repeat past acts), this record:

1. re-verifies **only the mutable facts** the designation work depends on — current IRR `main`, the worktree, the published Gate C records, the protected fence/2F/F-3 bytes, the four IPD reference points and the G24 pin's integrity (§3);
2. states the **authority basis** and the **form-vs-value distinction** that governs this step (§2);
3. sets out the **designation worksheet**: for each of the ten designations — selected form, evidence reviewed, whether any value is evidence-backed, the proposed value, the required designation authority, and the dependency/security consequence (§4);
4. performs the **compatibility checks** the proposed values must pass against the verified G24 runtime, so that adoption cannot silently break the trust path (§6);
5. presents the **one consolidated PA decision request** — Designation Set `P2-A-D1` with the ten recommended values and the act language that renders them (§5) — together with the execution sequence it would unlock and everything that remains blocked (§7, §8).

### 1.2 In scope

Evidence review, worksheet preparation, compatibility checking against the **already-verified** G24 configuration and verifier behaviour (read-only, at the immutable pin), this record, and its publication on the session branch. No canonical-tracker duplicate is created; the tracker amendment is a pointer and status update only (§9.4).

### 1.3 Non-goals (explicit)

This record does **not**:

- render, adopt, pre-approve or make effective any designation value, and does not represent its recommendations as decisions;
- establish, stand up, host or operate any issuer, JWKS endpoint or trust anchor; generate, store, custody, publish, rotate or destroy any key material; obtain or present any credential or token;
- set `IPD_OIDC_ISSUER`, `IPD_OIDC_JWKS_URI`, `IPD_OIDC_AUDIENCE` or `IPD_PORTFOLIO_DB_PATH` on any process, start any G24 runtime, or claim that any runtime configuration exists (none does);
- create any `application_user`, `(issuer, subject)` mapping, tenant, membership, portfolio, revision or audit row; open, create, migrate, query or write any database;
- change any application code, test, pin, lockfile, schema, route, UI, fence, transport or runtime state; add any issuer implementation or tooling to the IRR repository (that would be an IRR source change, reserved by §8.1 of the 1A′ specification to the P-6 act, and would in any case be operator-side, outside both repositories);
- write the IPD repository in any way; promote G24; merge, converge or re-pin the NP-04 and G24 lineages; designate a Company Identity Authority; make `D115-A` effective;
- alter the Option 2F refusal or the HTTP `503` fence; admit the User Portfolios consumer; dispose `P2`/`P3`; complete F-7; unlock S6 or S7;
- publish private keys, tokens, credentials, secrets or any other secret material in Git, governance records or logs — the ten designations contain no secret material, and key bytes are never a designation;
- reopen S0–S5 or repeat any completed investigation — no changed, contradictory or materially incomplete evidence was found (§3).

---

## 2. Authority basis — and the distinction that governs this step

### 2.1 The act's selected **form** is not a **designation**

`GC-D4` (packet §9.8) selected the **configuration form**: a minimal loopback OIDC-compatible issuer (`Q-2.1/A`), `RS256` (`Q-2.2/A`), operator filesystem custody (`Q-2.3/A`), explicit audience (`Q-2.4/A`), subject fixed at P-2 with tenant deferred to P-4 (`Q-2.5/A`), sequential acts (`Q-2.6/A`) and the §5.3 statement (`Q-2.7`). Those selections are real and binding — and they are **not** the designation values. "Loopback issuer" is a form; `ISSUER` is a string. "Filesystem custody" is a form; the custody location is a path. **No form may be recorded as a value**, and no value may be inferred from a form.

### 2.2 Why every one of the ten still requires the Program Authority

The ten values are substantive PA content by the act's own terms: `GC-D4` states the act "is **not effective for execution** … until those designations are supplied through the established authority process and recorded". The attributed standing authorization (F-3 record §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`, re-verified unchanged) covers **governance-record preparation, branch publication for review, and read-only verification** — it is the basis for this record, and it is not a basis for any value. The recording agent therefore researches, proposes and records; it designates nothing.

### 2.3 What evidence can and cannot do here

Evidence can fix **constraints, excluded classes, shapes and verified behaviour** (each is cited below), and for three of the ten it materially narrows the choice to essentially one compliant answer (the trust statement, the key size floor, the DB-path rules). Evidence cannot manufacture the operator's local decisions: the exact local URL, the operator's filesystem locations, the reader set, the method, the cadence and the subject string. Those are designated, not derived.

---

## 3. Live re-verification performed this session (mutable facts only)

Method: `git fetch origin --prune` + `git fetch --deepen` + local/remote ref comparison; GitHub REST API via `gh` (`git/ref`, `git/commits`, `git/trees`, `contents`, `pulls`, `pr list`). Completed S0–S5 investigations were **not** repeated. No application test was re-run — no application byte changed (§3.4 proves it), and no behaviour changed.

### 3.1 IRR (`ramkivs/iips-review-recovered`)

| Item | Verified value | State |
|---|---|---|
| `refs/heads/main` (remote and local) | **`b7e384a067c462870f16dee951b3e657eed585f5`** — merge of PR #87 (2026-10-13T16:33:42Z) | **current authoritative tip**; supersedes the `56c2aa0…` baseline recorded in the P-2 request and tracker §15.12 |
| PR #87 merge shape | parents `56c2aa01889974e17bcb836b6434f1f1392415a0` (previous `main`) and `a4393d679a4eee49ee09dff28b2463ec7ec44546`; merged by the PA's account; ordinary merge, **no force-push, no history rewrite** | ✓ |
| PR #87 merge diff `56c2aa0..b7e384a` | **exactly 3 paths** — the new P-2 request, the Gate C packet and the tracker; **no code, test, pin, lockfile, schema, fence, transport, route or UI path** | ✓ |
| PR #87 post-merge verification comment | present (records merge coordinates, blob equality, protected-invariant bytes) | ✓ — publication coordinates for `GC-D4` are recorded as the act's terms require |
| Working tree / session branch | clean; `arena/1df79e2e-iips-review-recovered` at `b7e384a…`; no open PRs at start of this run | ✓ |
| Published Gate C records at `main` (remote contents-API `sha` == local `git hash-object`) | S5 investigation `071df9ba…`; S5A 1A′ specification `c3a5596a…`; Gate C packet `34ea369611…`; P-2 request `2c05baa1…`; tracker `ff9d40ad…` | **all match** |
| Fence blobs at `main` | `reports-transport.ts` `981470541812…`; `user-portfolio-transport.ts` `51704c12a467…`; `owner-context-unavailable.ts` `cb8db45d668d…` | **all unchanged** |
| Tested 2F blobs at `main` | `userPortfolioContract.ts` `0dec72eb7502…`; `translationBoundary.ts` `93f602fd7e78…`; `userPortfolioBoundary.ts` `b8024c6b6d7a…`; `userPortfolioPort.ts` `ba0001e88c83…` | **byte-identical to the tested tree `8bb5bdae…`** |
| F-3 carrier / resolver / standing source | `a576e5af983c…` / `9738e9b39365…` / `c4c9f7d79ef1…` | **all unchanged** |

### 3.2 IPD (`ramkivs/iips-production-market-data`) — all four reference points re-verified

| Ref | Verified current value | State |
|---|---|---|
| IPD `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | **UNCHANGED** |
| NP-04 pin `np04-governed-persistence-windows` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | **UNCHANGED** |
| G24 `arena/01a0e6d9…` and `arena/01a0f308…` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (both) | **UNCHANGED** |
| Act branch `arena/01a0f839…` | `12c480b5bf5cfbe0f296fcd12c9189328b915417` | **UNCHANGED** |
| Repository activity | `pushed_at = 2026-10-02T12:50:06Z` | **no IPD write; none by this record** |

**Lineage distinction preserved.** NP-04 (artifact/report domain) and G24 (portfolio/tenancy domain, branch-only reference per `AD-03` and IPD act `26061859…`) remain distinct domain stores on separate refs; nothing here merges, converges, re-pins or promotes either. Any claim in this record that concerns G24 refers to the pinned commit only.

### 3.3 G24 pin integrity and P-2-specific configuration evidence (read-only, no IPD write)

The pin's tree is **undrifted**: commit `6828155e…` → tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`. Blob equality re-verified via the contents API at the pin for the six S5-cited files (`src/auth/config.ts` `221f4b1b…`, `src/auth/oidc-verifier.ts` `08776f5c…`, `src/app_identity/service.ts` `80563c79…`, `src/server/http-server.ts` `17f9cb8a…`, `src/portfolio/durable-store.ts` `1c23f259…`, `src/portfolio/consolidation.ts` `e8e09e56…`) — **all equal, no S5 re-derivation**. In addition, the files that bear directly on the ten designations were read **read-only at the same pin** and are cited by blob for the worksheet (§4) and the compatibility checks (§6):

| File at `6828155e…` | Blob | Bearing |
|---|---|---|
| `src/auth/config.ts` | `221f4b1b4938c81327233281b240db801b774e42` | `IPD_OIDC_ISSUER` / `IPD_OIDC_JWKS_URI` / `IPD_OIDC_AUDIENCE`; default audience `ipd-user-portfolio-api`; `TRUSTED_JWS_ALGORITHMS = ['RS256','ES256']`; absolute-URL, non-blank, fail-closed validation |
| `src/auth/oidc-verifier.ts` | `08776f5c256dfe176605b5af181ed7b2c8a47f6d` | verification order and named errors; **exact** `iss` equality; `aud` membership; mandatory `kid`; `RS256` via `RSA-SHA256`; `exp`/`nbf`/`sub` rules |
| `src/auth/jwks.ts` | `6f40c977b211883d85e7fcdced75bbb6dfb3cc0b` | key resolution only from the configured endpoint; `{keys:[…]}` document; one forced refresh on unknown `kid`; bounded in-memory cache (`DEFAULT_CACHE_TTL_MS = 300_000`); no stale substitution on failed refresh |
| `src/persistence/config.ts` | `02090c191e8dd6e826106bdbe94cf65fedabaa72` | `IPD_PORTFOLIO_DB_PATH` — absolute path mandatory; blank/relative/root-only rejected; no default; `journalMode='DELETE'`, `synchronous='FULL'`, `foreign_keys=ON` |
| `src/persistence/bootstrap.ts` / `src/server/http-server.ts` | `783e038f…` / `17f9cb8a…` | startup order validate → connect → migrate → verify → **then** listen; fail-closed |
| `src/server/config.ts` | `3277af51878d71f351c9755eb4bce6ba60614691` | runtime HTTP default host `127.0.0.1`, default port `8099` — loopback by default |
| `tests/g24_test_support.ts` | `c3b11ee7352abf0f7e9c6901d37901e831ebbbd2` | program practice for RSA key generation (`modulusLength: 2048`), JWK shape `{…jwk, kid, alg:'RS256', use:'sig'}`, JWKS served on `127.0.0.1`, isolated temp DBs |

### 3.4 Facts NOT re-verified (and why)

- **Application tests were not run.** No application byte changed in this run (the change is documentation-only, §9.4); re-running unchanged tests is neither required nor authorized as qualification evidence. Qualification evidence is generated under the P-8 act when it exists.
- **No runtime was started, no configuration read from a live process, no credential presented.** No issuer, key, JWKS endpoint or scoped runtime exists — that absence is a verified fact of the baseline, not an assumption.
- **Historical IRR issuer evidence was read, not re-derived:** the removed historical issuer string `http://localhost:8080/realms/iips` and the historical Keycloak identity claims are quoted from the published certification record (§4, items 1 and 9) solely to define the **excluded** class required by R-2.2/R-2.8.

---

## 4. The designation worksheet

Each row states: **(a)** the form `GC-D4` selected — which is *not* the designation; **(b)** the evidence reviewed; **(c)** whether any value is *evidence-backed*; **(d)** the **proposed** value (recommendation only, not established); **(e)** the required designation authority; **(f)** the dependency and security consequence. No value below exists anywhere today.

### 4.0 Master table

| # | Designation | Kind | Value evidence-backed? | Proposed (not established) | Designation authority |
|---|---|---|---|---|---|
| 1 | `ISSUER` | value (absolute URI string) | **No** — constraints only | `http://127.0.0.1:8421/non-production/p2-anchor` | Program Authority (P-2 act) |
| 2 | `JWKS_URI` | value (absolute http(s) URL) | **No** — constraints only | `http://127.0.0.1:8421/non-production/p2-anchor/jwks.json` | Program Authority (P-2 act) |
| 3 | JWKS trust statement | statement (content fully determined) | **Content determined**; the act must state it | wording in §4.3 | Program Authority (P-2 act) |
| 4 | `RS256` key size | selection from bounded set | **Floor established** (≥2048) | 2048-bit RSA modulus | Program Authority (P-2 act) |
| 5 | Key custody location | location (absolute path) | **No** — boundary only | `$HOME/.iips-gate-c-p2/anchor/keys/` *(absolute at establishment)* | Program Authority (P-2 act) |
| 6 | Authorized readers | named reader set | **No** — boundary only | exactly one: the operator OS account that runs the anchor (0700/0600) | Program Authority (P-2 act) |
| 7 | Generation/destruction method | named method | **No** — rules only | OpenSSL 3.x `genpkey` (or the program's Node primitive); overwrite-then-unlink destruction, storage limits stated | Program Authority (P-2 act) |
| 8 | Rotation interval | bounded interval | **No** — procedure fixed | ≤90 days from activation + on-demand triggers | Program Authority (P-2 act) |
| 9 | `SUBJECT` | value (opaque string) | **No** — semantics/exclusions only | `p2-principal-0001` | Program Authority (P-2 act) |
| 10 | `IPD_PORTFOLIO_DB_PATH` | location (absolute path) | **No** — rules only | `$HOME/.iips-gate-c-p2/runtime/portfolio.sqlite` *(absolute at establishment)* | Program Authority (P-2 act) |

### 4.1 Item 1 — `ISSUER`

- **(a) Selected form (not the value):** `Q-2.1/A` — a locally run, minimal OIDC-compatible issuer on loopback, with an explicitly designated non-production `iss`.
- **(b) Evidence reviewed:** R-2.2 constraints (absolute, stable, non-production, unambiguously local; no collision with, alias of, or appearance of reusing the removed historical IRR/`iips-spa` issuer). The **excluded** historical value is recorded: `"iss": "http://localhost:8080/realms/iips"` (realm `iips` at `KEYCLOAK_URL=http://localhost:8080`), with `aud: ["iips-spa","account"]` — from the published G3 live-certification record and the Keycloak configuration record. Verified target semantics: the verifier compares `iss` to the configured value by **exact string equality** with no normalisation (`oidc-verifier.ts` `08776f5c…`, `config.ts` `221f4b1b…`, trim only). Local port landscape: IRR dev `5173` (`frontend/vite.config.ts`), IRR executive transport `8787`, G24 runtime default `127.0.0.1:8099`; port `8421` appears nowhere in the IRR repository.
- **(c) Evidence-backed value?** **No.** No artifact in either repository fixes a value, and none may be inferred from the package.
- **(d) Proposed:** `http://127.0.0.1:8421/non-production/p2-anchor` — an equally compliant shorter variant is `http://127.0.0.1:8421/p2-anchor`.
- **(e) Authority:** the Program Authority, by the P-2 designation act (`GC-D4` terms).
- **(f) Consequence:** this string is the first half of the source identifier `(issuer, subject)`; it will appear in the P-4 mapping row, in every P-8 credential/label artifact and in any future revocation record. Because verification is exact-match, the anchor must emit this `iss` byte-for-byte; a mismatch fails closed with `OidcIssuerMismatchError` (no repair, no retry, no fallback). The loopback host `127.0.0.1` keeps the trust perimeter inside the non-production host, and the `non-production` path segment satisfies R-2.2's "unambiguous about being local and non-production" in the value itself; it cannot collide with or alias the historical `localhost:8080/realms/iips` value.

### 4.2 Item 2 — `JWKS_URI`

- **(a) Selected form (not the value):** `Q-2.1/A` — an absolute `http(s)` JWKS URL reachable by the scoped runtime, with the act's trust statement.
- **(b) Evidence reviewed:** R-2.4; verified loader rules — blank rejected, absolute URL required, scheme restricted to `http:`/`https:` (`config.ts` `221f4b1b…`); verified resolution behaviour — the client fetches exactly the configured URI, requires a `{keys:[…]}` document, and fails closed on non-OK responses or non-JWKS bodies (`jwks.ts` `6f40c977…`); program practice — G24's own test support serves JWKS on `127.0.0.1` (`c3b11ee7…`).
- **(c) Evidence-backed value?** **No** — same position as item 1 (form fixed, value reserved).
- **(d) Proposed:** `http://127.0.0.1:8421/non-production/p2-anchor/jwks.json` (colocated with the proposed `iss`; the anchor serves the JWKS document from the same loopback listener).
- **(e) Authority:** the Program Authority, by the P-2 designation act.
- **(f) Consequence:** this is the **only** source from which the scoped runtime will resolve signing keys; keys are never taken from token content. Plain `http` is acceptable **only** because the endpoint is loopback-only and non-production; any change that exposes the endpoint beyond `127.0.0.1` (binding `0.0.0.0`, tunnelling, forwarding) would falsify the trust statement and is excluded by the act. The endpoint serves **public** keys only; no private key material is ever published.

### 4.3 Item 3 — JWKS trust statement

- **(a) Selected form (not the value):** R-2.4 requires the act to state *why* the endpoint is trusted and its failure behaviour; `GC-D4` fixed the trust model (the operator's own loopback anchor under the act's custody rules; unreachable ⇒ fail closed; no cached-trust fallback).
- **(b) Evidence reviewed (verified behaviour the statement must match):** keys resolved only from the configured JWKS (`jwks.ts` `6f40c977…`); mandatory `kid` in the token header (`OidcTokenMalformedError` if absent); one forced refresh on an unknown `kid`, then `OidcKeyUnavailableError`; `alg` must be in `TRUSTED_JWS_ALGORITHMS` (`{RS256, ES256}`), else `OidcAlgorithmRejectedError`; signature verified with `RSA-SHA256` for `RS256`; exact `iss` equality; `aud` membership; `exp` required and future; `nbf` honoured when present; `sub` required non-blank; a **bounded** in-memory key cache (`DEFAULT_CACHE_TTL_MS = 300_000`) whose failed refresh is never substituted by stale keys (`oidc-verifier.ts` `08776f5c…`).
- **(c) Evidence-backed value?** **The content is fully determined** by the package plus the verified behaviour; it is a statement the act must make, not a free choice. No wording has been rendered by any prior act.
- **(d) Proposed wording (adopt or amend — this is the recommendation):**

  > "`http://127.0.0.1:8421/non-production/p2-anchor/jwks.json` is trusted because it is served by the operator's own minimal OIDC-compatible signing service, bound exclusively to IPv4 loopback on the non-production host and operated under this act's custody and lifecycle rules; it is the only source from which the scoped runtime resolves signing keys. Keys are never accepted from token content; every token must carry a `kid` present in the document served by this endpoint. The verifier keeps only a bounded in-memory key cache — 300-second TTL, with a single forced refresh when a `kid` is unknown — and will not substitute cached keys when a refresh fails; if the endpoint is unreachable or does not serve a JWKS, verification fails closed (`OidcJwksUnavailableError`) with no fallback trust of any kind. No third-party identity provider, OIDC discovery document, network trust service or cached-trust fallback participates in this trust relationship."

- **(e) Authority:** the Program Authority, by the P-2 designation act (statement in terms).
- **(f) Consequence:** the statement makes the trust boundary auditable and testable in P-8 (reachability, unknown-`kid`, invalid-signature, wrong-issuer, wrong-audience, expired, malformed cases) and prevents any future reading of the anchor as a third-party or discovery-based identity integration. The wording deliberately records the **300-second bounded cache** rather than claiming no caching at all — an accurate statement is required, and an inaccurate one would itself be a false governance claim.

### 4.4 Item 4 — `RS256` key size

- **(a) Selected form (not the value):** `Q-2.2/A` fixed the **algorithm** `RS256` (not one of the ten); R-2.3 requires the **size** to be "per current non-production practice" and named in the act.
- **(b) Evidence reviewed:** the governing JWA requirement — RSA keys used with `RS256` must be **at least 2048 bits** (RFC 7518 §3.3); program practice at the pin — G24's own test support generates RSA signing keys with `modulusLength: 2048` (`c3b11ee7…`); verifier behaviour — any RSA public key consumable by `createPublicKey({format:'jwk'})` verifies, so size does not change control flow (`jwks.ts` `6f40c977…`).
- **(c) Evidence-backed value?** **A floor is established** (2048-bit minimum); the exact size remains a PA designation. Practically, 2048 is the specification floor and the program's own practice.
- **(d) Proposed:** **2048-bit RSA modulus.** Larger sizes (3072/4096) are compatible and permitted if the PA prefers margin; they add signing cost with no security benefit for a single-user loopback non-production anchor, and any size below 2048 is excluded by the JWA requirement.
- **(e) Authority:** the Program Authority, by the P-2 designation act.
- **(f) Consequence:** the size is a property of the generated key (item 7) and is evidenced by the published public JWK (`kty`, `n`, `e`); choosing below the floor would place the anchor outside the governing specification and is excluded; the choice is recorded once and does not vary per token.

### 4.5 Item 5 — Key custody location

- **(a) Selected form (not the value):** `Q-2.3/A` — operator-controlled, non-production, filesystem custody **outside IRR, outside the repository and outside all records**.
- **(b) Evidence reviewed:** R-2.7 boundary rules; the repository establishes **no** state root that could be reused (and `.gitignore` carries no state-root convention); the only IRR-side state convention is the Class C journal root `.iips-data/` used by NP-09/NP-10/NP-11 in the IRR **working directory** — a different subsystem that must not be reused, shared or aliased; G24's own tests always use isolated OS temp directories and never a shared path (`c3b11ee7…`). Nothing in either repository fixes an operator location.
- **(c) Evidence-backed value?** **No** — the location is the operator's own machine-local decision.
- **(d) Proposed:** one **P-2 state root** for everything this act creates, `$HOME/.iips-gate-c-p2/` — with key custody at `$HOME/.iips-gate-c-p2/anchor/keys/`. The `$HOME` form must be resolved to its absolute path on the designated non-production host **at establishment** and recorded then (with the caveat that only the directory is recorded — never key bytes). The resolved path must not be inside the IRR or IPD working trees; that is a checked precondition, not an assumption.
- **(e) Authority:** the Program Authority, by the P-2 designation act (which must name the location, per R-2.7).
- **(f) Consequence:** establishes a new non-production state root that belongs to this act alone; nothing else may be stored there; the directory is a designation (recorded) and the key files inside it are secrets (never recorded). Because custody lives outside both repositories, no repository operation — push, pull, clone, test run, agent action — can copy private key material, and the never-in-records rule is structurally enforceable.

### 4.6 Item 6 — Authorized readers

- **(a) Selected form (not the value):** `Q-2.3/A`/R-2.7 — "readable only by [the named reader set]".
- **(b) Evidence reviewed:** R-2.7 (operator-controlled custody); the single-user baseline of the whole program (`H-18`, product scope); nothing in either repository defines a reader set for this anchor.
- **(c) Evidence-backed value?** **No.**
- **(d) Proposed:** **exactly one reader** — the single operator's own OS account on the designated non-production host, being the account that runs the anchor process; enforced by filesystem modes `0700` on the custody directories and `0600` on key files, with no group or other access. No second account, no shared/role account, no agent, CI runner, backup service, container image build, repository process or evidence artifact may read the material.
- **(e) Authority:** the Program Authority, by the P-2 designation act.
- **(f) Consequence:** filesystem permissions are the only access control at this custody boundary; the single-reader rule keeps the control auditable. If the anchor is later run under a **distinct service account**, that account must be named in an amendment to this designation — it may not be added silently. Loss or compromise of the reader account is treated as potential key compromise and triggers rotation (item 8) plus mapping revocation where warranted (a P-4-path action).

### 4.7 Item 7 — Key generation/destruction method

- **(a) Selected form (not the value):** R-2.7 — a **named** generation and destruction method; R-2.5 — stable unique `kid` per key, exactly one active signing key.
- **(b) Evidence reviewed:** program practice at the pin — RSA keys generated with Node `crypto.generateKeyPairSync('rsa', {modulusLength: 2048})`, public JWKs published as `{…jwk, kid, alg:'RS256', use:'sig'}`, JWKS served from an `http` server bound to `127.0.0.1` (`c3b11ee7…`); verifier acceptance shape (`createPublicKey({format:'jwk'})`, `jwks.ts` `6f40c977…`). The `kid` **label** is not one of the ten PA designations: R-2.5 assigns it to the operator, and it is recorded as a public identifier when used.
- **(c) Evidence-backed value?** **No** — the rules are fixed; the method is a designation.
- **(d) Proposed — generation:** performed by the operator on the designated host, one key per generation event, with a standard auditable tool: `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048` (OpenSSL 3.x) writing the PKCS#8 private key **directly** into the custody directory under `umask 077` — or the equivalent Node one-liner using the same primitive the program's own test support uses. The key is never copied, converted, printed, echoed, logged or transmitted; the public JWK is published at the designated JWKS endpoint under an operator-assigned stable `kid` (recommended label form `p2-rsa-<yyyy-mm-dd>-01`). Exactly one signing key is active for issuance at a time.
- **(d) Proposed — destruction:** after the key's last token has expired and its JWKS entry has been withdrawn: overwrite the private key file in place and unlink it (`shred -u -n 1 --remove=wipesync` where available), then verify the file's absence and confirm no copy exists in either repository, any evidence artifact or any record; the retirement event is recorded (kid, dates, reason) and **never** key bytes. Because copy-on-write and wear-levelled storage can defeat in-place overwriting, the operator must rely on full-disk encryption or host-level secure erase for those layers — and the record must state that limitation rather than claim forensic erasure.
- **(e) Authority:** the Program Authority, by the P-2 designation act.
- **(f) Consequence:** the never-in-records rule (R-2.7) is preserved by construction: the private key exists only at the designated custody path and never enters Git, governance records, evidence artifacts, ordinary logs, chat or tickets. Key generation is an **operator** action under the effective act and is never a PA-supplied value; if a generation event fails or is interrupted, the partial material is destroyed by the same method before any retry. The anchor implementation that consumes the key and serves the JWKS is operator-side tooling **outside both repositories**; placing it inside the IRR repository would be an IRR source change reserved to the P-6 act and is not authorized by P-2.

### 4.8 Item 8 — Rotation interval

- **(a) Selected form (not the value):** R-2.7's procedure is fixed (publish the new public key under a new `kid` **before** first use → retain superseded public keys until the last token they signed expires → then retire; compromise → rotate, and revoke the mapping where warranted); the **interval** is a designation.
- **(b) Evidence reviewed:** no artifact fixes a cadence; token lifetimes are short-lived by design (P-3 credential path), so the "retain until last expiry" window is short in practice; rotation with a new `kid` requires no cache purge — the verifier refreshes once on an unknown `kid` and otherwise holds at most a 300-second bounded cache (`jwks.ts` `6f40c977…`).
- **(c) Evidence-backed value?** **No.**
- **(d) Proposed:** a **bounded maximum of 90 days** from key activation, plus on-demand rotation on any of: suspected or confirmed key exposure; operator or host change affecting custody; any qualification failure implicating key integrity; or before any widening of the anchor's scope. The interval is a **ceiling**, not a schedule: rotating early is always permitted, rotating late is not.
- **(e) Authority:** the Program Authority, by the P-2 designation act.
- **(f) Consequence:** rotation executes under the act's fixed procedure as an operator operation and must be recorded as an event (new `kid`, publication time, supersession window, retirement time, reason); it requires no new PA act while the designation set stands, and no rotation may reuse a `kid`, sign before JWKS publication, or drop a superseded public key before its last token expires. A compromise additionally invokes the P-4 revocation path (`revokeTenantMembership` and/or `retireMapping`) — which cannot be exercised until the P-4 act exists and the mapping exists.

### 4.9 Item 9 — `SUBJECT`

- **(a) Selected form (not the value):** `Q-2.5/A` — the subject value is fixed **in the P-2 act** (alongside the issuer, completing the source identifier `(issuer, subject)`); the tenant identifier stays with P-4.
- **(b) Evidence reviewed:** R-2.8 — the `sub` identifies **exactly one natural person** (the single user acting as operator) and must **never** be reused as, or derived from, a G24 identifier, `companyId`, `runtimeCompanyId`, portfolio id, `preferred_username` or operator context. Excluded classes verified: historical Keycloak claims (`sub: "075591b0-…"`, `preferred_username: "analyst-a"`, from the published live-certification record — the removed `iips-spa` identity); the IRR F-3 operator-context pair `owner-7f3a91c2` / `irr-domain-4b82d6e1` (partition semantics for NP-09/NP-10/NP-11 only; must never be aliased). The mapping table keys on `UNIQUE (issuer, subject)`, so the pair must be stable for the life of the mapping.
- **(c) Evidence-backed value?** **No** — and none may be borrowed from the excluded classes above.
- **(d) Proposed:** `p2-principal-0001` — opaque, stable, machine-friendly, carrying no personal data and no derivation from any G24, IRR, Keycloak or operator-context identifier. Combined with item 1 the source identifier becomes (`http://127.0.0.1:8421/non-production/p2-anchor`, `p2-principal-0001`).
- **(e) Authority:** the Program Authority, by the P-2 designation act (`Q-2.5/A`).
- **(f) Consequence:** completes the mapping key so that the P-4 act is bounded execution with a pre-stated key (its dependency is exactly this); the value will appear in the P-4 mapping row, in the same-transaction audit records and in P-8 mapping/tenancy evidence. It is **not** a username, does not authenticate anyone by itself, and grants no authority: the binding remains subject to token verification plus an `ACTIVE` mapping plus a resolvable `ACTIVE` membership at the target.

### 4.10 Item 10 — `IPD_PORTFOLIO_DB_PATH`

- **(a) Selected form (not the value):** R-2.9 — the scoped non-production G24 runtime started from pinned ref `6828155e…` with **its own** database path, unrelated to production data, IPD `main` and the NP-04 pin.
- **(b) Evidence reviewed:** verified variable and rules — `IPD_PORTFOLIO_DB_PATH` must be **absolute**; blank, relative and filesystem-root-only values are rejected fail-closed; there is **no default** (`config.ts` `02090c19…`); startup order validate → connect → migrate → verify → **then** listen (`bootstrap.ts` `783e038f…`, `http-server.ts` `17f9cb8a…`); the engine settings (`journalMode='DELETE'`, `synchronous='FULL'`, foreign keys ON) are fixed by the module, not by the path; program practice — G24 tests always use isolated temporary databases (`c3b11ee7…`), never a shared or development path. No artifact fixes a value.
- **(c) Evidence-backed value?** **No.**
- **(d) Proposed:** `$HOME/.iips-gate-c-p2/runtime/portfolio.sqlite` — inside the same single P-2 state root as item 5, **outside** both repositories, and unrelated by construction to any production dataset, to IPD `main` and to the NP-04 pin's data. As with item 5, `$HOME` is resolved to an absolute path at establishment and recorded then.
- **(e) Authority:** the Program Authority, by the P-2 designation act.
- **(f) Consequence:** the runtime will **create and migrate** this SQLite database under the act; it is the store the P-4 act will later write the user, mapping, tenant, membership and audit rows into, and the store P-8 durability evidence will exercise. Pointing it at existing, shared or production data is excluded (it would breach the NP-04/G24 lineage separation and the non-production boundary). The path is a designation, not a secret; the database file it creates is **non-production state created under this act only**.

### 4.11 Derived parameters that are **not** PA designations (recorded so nothing is silently invented)

Once the ten are designated, the following follow mechanically and are operator-executed under the act: the anchor's listen host/port (contained in the designated `iss`/JWKS URL); the anchor's URL path layout; the `kid` label(s) (R-2.5, operator-assigned, recorded as public identifiers); file names within the designated custody directory; the absolute expansion of `$HOME` at establishment; and the scoped runtime's HTTP bind (verified default `127.0.0.1:8099`, distinct from the anchor's designated port). None of these creates authority, and none is a value the evidence supplies.

---

## 5. The consolidated Program Authority decision request

**One request, ten values.** The Program Authority is asked to render the **P-2 execution designation act** — the act `GC-D4` renders as to package and fixed terms and expressly leaves ineffective until its designations exist — by adopting, amending or replacing **Designation Set `P2-A-D1`** below. A single adoption renders the ten designations together; any individual row may be substituted without reopening the package (substitutions must still satisfy the R-2.x constraints stated in §4).

### 5.1 Designation Set `P2-A-D1` (recommended)

| # | Designation | Recommended value |
|---|---|---|
| 1 | `ISSUER` | `http://127.0.0.1:8421/non-production/p2-anchor` |
| 2 | `JWKS_URI` | `http://127.0.0.1:8421/non-production/p2-anchor/jwks.json` |
| 3 | JWKS trust statement | the statement text in §4.3(d), verbatim |
| 4 | `RS256` key size | 2048-bit RSA modulus |
| 5 | Key custody location | `$HOME/.iips-gate-c-p2/anchor/keys/` (absolute at establishment; outside both repositories and all records) |
| 6 | Authorized readers | exactly one — the operator OS account that runs the anchor; directories `0700`, key files `0600` |
| 7 | Generation/destruction method | generation: OpenSSL 3.x `genpkey` (or the program's Node primitive), one time per key, directly into custody under `umask 077`; destruction: JWKS withdrawal → overwrite-then-unlink after last token expiry, storage limits stated |
| 8 | Rotation interval | bounded maximum 90 days from activation, plus on-demand triggers (§4.8(d)) |
| 9 | `SUBJECT` | `p2-principal-0001` |
| 10 | `IPD_PORTFOLIO_DB_PATH` | `$HOME/.iips-gate-c-p2/runtime/portfolio.sqlite` (absolute at establishment; outside both repositories) |

### 5.2 Act language for adoption (values inserted; nothing else changed)

The P-2 request's §12.3 act text, with the ten placeholders resolved by Designation Set `P2-A-D1`, reads in substance:

> "I, Ramki, as Program Authority, render the **P-2 trust-anchor / issuer configuration act** for the Gate C 1A′ binding (package P2-A), and I supply its ten execution designations as Designation Set `P2-A-D1`: the issuer identifier **`http://127.0.0.1:8421/non-production/p2-anchor`**; the JWKS endpoint **`http://127.0.0.1:8421/non-production/p2-anchor/jwks.json`** with the trust statement recorded in the designation worksheet §4.3; algorithm **`RS256`** with a **2048-bit RSA** key; key custody at **`$HOME/.iips-gate-c-p2/anchor/keys/`** (absolute at establishment), readable only by **the operator OS account that runs the anchor** with `0700`/`0600` modes; generation and destruction by **the method recorded in the worksheet §4.7**; rotation **bounded at 90 days plus on-demand**; subject **`p2-principal-0001`**; and the scoped runtime's database path **`$HOME/.iips-gate-c-p2/runtime/portfolio.sqlite`** (absolute at establishment). With these values the act becomes **effective for execution** as to its fixed terms; the tenant identifier remains reserved to the P-4 act; and this act creates no mapping, tenant or membership, enables no route or UI, changes no IPD ref or file, and admits no consumer."

A Program Authority adoption of Designation Set `P2-A-D1` in the operating session — or an amended set — is the requested act. **This record does not render it.**

### 5.3 What the designation act does and does not unlock

| Unlocked on designation (under `GC-D4`'s fixed terms) | Still blocked (own acts required) |
|---|---|
| Recording and durable publication of the ten designations | **P-4** — provisioning act (own express, sequential act): one user, one mapping `PENDING→APPROVED→ACTIVE`, one tenant with exactly one `ACTIVE` membership, in-transaction audit, revocation path |
| Establishment and verification of the anchor **by the operator** on the designated host: key generation at the designated custody location, JWKS publication, anchor start, scoped runtime configuration with `IPD_OIDC_*` and `IPD_PORTFOLIO_DB_PATH`, and the §7.3 establishment checks | **P-6** — IRR implementation authority (six surfaces; fence/transport excluded); P-2 grants none of it |
| Preparation of the P-8 qualification runs against the established scoped runtime | **P-8** — qualification execution; the plan is fixed, nothing executed |
| Nothing else | **S6** (successful-write identity policy / full F-7) and **S7** (`P2`/`P3` admission, route/UI) remain separately gated; the fence stays at `503`; Option 2F is unchanged |

**No generic approval is requested and none would satisfy this section.** The request is the ten substantive values only.

---

## 6. Compatibility checks performed against the verified target

Every check below was performed read-only against the pinned G24 sources cited in §3.3; none required a runtime, a credential or an IPD write. They exist so that adopted values cannot silently break the trust path.

1. **Issuer equality is exact.** `claims.iss !== config.issuer` ⇒ `OidcIssuerMismatchError`; the config is trimmed but not normalised (trailing slashes, case, host aliases all break the match). ⇒ the anchor must emit the designated `iss` byte-for-byte, and `localhost` must not be substituted for `127.0.0.1` (or vice versa).
2. **Audience membership.** `aud` (string or array) must contain the configured audience; `IPD_OIDC_AUDIENCE` is fixed by `GC-D4` to `ipd-user-portfolio-api` and will be set explicitly; an `iips-spa`-only token fails with `OidcAudienceMismatchError` (the P-8 negative case).
3. **Algorithm.** The header `alg` must be exactly `RS256` (∈ `TRUSTED_JWS_ALGORITHMS`); `none`, symmetric and any other algorithm are rejected (`OidcAlgorithmRejectedError`) — no fallback path exists.
4. **Key identification.** A token header without `kid` is rejected (`OidcTokenMalformedError`); the `kid` must resolve in the served JWKS, with exactly one forced refresh on first miss (`OidcKeyUnavailableError` otherwise). ⇒ the designated JWKS path must serve the active key under its `kid`, and rotations must publish before first use.
5. **JWKS document shape.** The body must be an object with a `keys` array; each RSA JWK must carry `kty`, `n`, `e` and `kid` to be consumable by `createPublicKey`; a JWKS-shaped 200 response is required (anything else fails closed with `OidcJwksUnavailableError`).
6. **RSA signature handling.** `RS256` is verified with `RSA-SHA256`; a 2048-bit modulus is fully supported; no size-dependent control flow exists. (Item 4 is therefore purely a governing-specification choice, verified compatible either way.)
7. **Claim validation.** `exp` is mandatory and must be in the future; `nbf` is honoured when present; `sub` must be a non-blank string (`OidcTokenExpiredError` / `OidcTokenNotYetValidError` / `OidcSubjectMissingError` otherwise).
8. **Trust boundary.** Keys are resolved **only** from the configured JWKS URI (never from the token); the bounded cache is 300 s with refresh-on-unknown-`kid` and no stale substitution on failed refresh; an unreachable endpoint denies every verification.
9. **Configuration fail-closed.** A blank issuer or JWKS URI, a non-absolute JWKS URI, a non-`http(s)` scheme or a blank audience throws `OidcConfigurationError` at load — the scoped runtime cannot start half-configured.
10. **Runtime and database.** Startup is validate → connect → migrate → verify → listen, so an invalid `IPD_PORTFOLIO_DB_PATH` (relative, blank, root-only) prevents listening entirely; the runtime's HTTP default is loopback (`127.0.0.1`) on port `8099`, distinct from the proposed anchor port `8421`; IRR dev ports `5173`/`8787` and the removed historical Keycloak port `8080` are unaffected and not reused.
11. **No IPD source change.** All ten designations are consumed by the runtime through the three existing `IPD_OIDC_*` variables and `IPD_PORTFOLIO_DB_PATH`; 1A′ requires no IPD source change (1A′ specification §8.4), and none is proposed.

**Result: the recommended set passes every check.** Any substitution must be re-checked against checks 1, 3, 4, 5, 9 and 10 before adoption.

---

## 7. Security consequences and boundaries that survive any designation

1. **No secret material in any record.** The ten designations are configuration and governance values (issuer, URL, statement, size, locations, readers, method, interval, subject, database path). Private keys, tokens, credentials, keystore passwords and secret bytes are **never** PA designations, never recorded, and never published — before, during or after execution.
2. **Loopback-only trust perimeter.** The anchor is bound to `127.0.0.1`; the scoped runtime binds loopback by default. Any widening (external bind, tunnel, proxy, second issuer, audience alias, symmetric fallback) is excluded by the act and would falsify the trust statement.
3. **The fence and the refusal are untouched.** `/api/user-portfolios*` stays fail-closed at source-level HTTP `503 owner-context-unavailable`; Option 2F's refusal of unresolved or ambiguous writes before serialization and before persistence-port invocation is unchanged; no forwarded-identity trust, authentication bypass or caller-controlled identity resolution is introduced.
4. **No provisioning before P-4.** No user, mapping, tenant or membership may be created by P-2 or by anything here; the exactly-one-`ACTIVE`-membership invariant is a P-4 post-condition.
5. **Lineage isolation.** No IPD ref, branch, tag, file or record is written; G24 is not promoted to IPD `main`; the NP-04 and G24 lineages are not merged, converged or re-pinned.
6. **Separate gates stay separate.** S6 (successful-write identity policy / full F-7) and S7 (`P2`/`P3` admission) are not unlocked by `GC-D4`, by this record or by any designation made through it.
7. **Honest labelling.** Everything downstream carries the label **non-production, single-user, self-asserted delegation**; no runtime, deployment or production readiness is claimed from any offline or scoped-runtime result.

---

## 8. Execution sequence once the designations exist (dependency order)

Under `GC-D4`, the P-2 request §7.2 order applies unchanged, now with values: **①** the PA renders the designation act (§5) → **②** designation recording and durable publication → **③** the operator generates the key at the designated custody location and publishes the JWKS under a stable `kid` → **④** the operator starts the scoped non-production G24 runtime from pinned ref `6828155e…` with `IPD_OIDC_ISSUER`, `IPD_OIDC_JWKS_URI`, `IPD_OIDC_AUDIENCE=ipd-user-portfolio-api` and `IPD_PORTFOLIO_DB_PATH` → **⑤** establishment verification per P-2 request §7.3 (loader fail-closed, JWKS reachability, issuance/verification round-trip with negative controls) → **⑥** the **P-4 act** (own express, sequential act) → **⑦** the **P-6 act** and implementation → **⑧** **P-8** qualification. Steps ③–⑤ involve the operator's host, secret material and a live non-production process: they are operator actions under the effective act, and no agent may generate, handle, log or claim-key material, or claim a runtime state it has not verified.

---

## 9. Invariants preserved, validation performed, and publication

### 9.1 Invariants preserved (verified at this record)

`/api/user-portfolios*` fail-closed at HTTP `503 owner-context-unavailable`; `/api/reports*` unchanged; Option 2F refusal unchanged (tested 2F blobs byte-identical); F-3 remains partition semantics for NP-09/NP-10/NP-11 and is not an authenticated principal, credential or tenant membership; no caller-controlled canonical identity or resolution disposition; no authentication/tenant-resolution/portfolio-authorization bypass; no live IPD write and no protected-ref change; NP-04 and G24 lineages unmerged; no route/UI activation; no consumer admission; Gate A OPEN; Gate B Option C; R3 OPEN (no live subject); R4-B CLOSED; no Company Identity Authority; `D115-A` ineffective; `P2`/`P3` OPEN — all unchanged. **No runtime, deployment or production readiness is claimed anywhere in this record.**

### 9.2 Validation performed

Read-only and documentary: live remote refs and commits (§3.1–§3.2); remote-vs-local blob equality for every cited record and protected file (§3.1, §3.3); G24 pin tree and blob integrity plus the P-2-relevant source reads (§3.3); the compatibility checks (§6), including the local port-collision scan and confirmation that the proposed port appears nowhere in the IRR repository; and a consistency pass confirming that no secret material appears in this record.

### 9.3 Validation not performed (and none authorized)

No runtime started; no key generated; no configuration set; no credential acquired or presented; no database opened or created; no provisioning; no application test executed (no application byte changed, so re-running unchanged tests would produce no qualification evidence — qualification evidence is generated under P-8 when it exists).

### 9.4 Publication and effectiveness

Additive documentation-only change on session branch `arena/1df79e2e-iips-review-recovered` (from `main@b7e384a…`): this record (new) plus a pointer/status amendment in the Gate C packet (§9.10), the P-2 decision request (§12.5) and the canonical tracker (header status, §2 `REG-12` row, §4 item 17, §5 `CHG-2026-10-13-16`, §15.13) — **no code, test, pin, lockfile, schema, fence, transport, route, UI or runtime change; no IPD write**. Publication follows the established pull-request workflow; `GC-D4`'s effectiveness rule is unchanged, and the designations themselves take effect only when the Program Authority renders them and they are recorded and durably published. Consistent with the program rule, publication coordinates are recorded **after** merge by independent remote verification, never self-embedded.

*Status: **`DESIGNATION WORKSHEET COMPLETE — TEN VALUES RESEARCHED, COMPATIBILITY-CHECKED, ONE CONSOLIDATED DECISION REQUEST PUBLISHED (Designation Set P2-A-D1) — PA DESIGNATION ACT REQUIRED — NO OPERATION AUTHORIZED`.** Gate C remains OPEN; `GC-D4` rendered as to package and fixed terms only; P-4/P-6/P-8 remain blocked; S6/S7 separately gated; `/api/user-portfolios*` remains fail-closed at HTTP `503 owner-context-unavailable`.*
