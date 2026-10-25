# IIPS v3.0 — NP-06 Reports: R1 / R2 / R3 Program Authority Decision Request

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-R1-R2-R3-PA-DECISION-REQUEST-2026-10-25-01` |
| **Record type** | **DECISION REQUEST — DECISION INPUT ONLY.** Not a decision, not an approval, not an authorization, not an admission. |
| **Status** | **PROPOSED — NOT APPROVED / NOT EFFECTIVE.** Nothing in this document is operative. No part of it may be cited as an approved contract, an ownership source, a pin authority, or an implementation grant. |
| **Decisions requested** | `D-1` = **R1** Reports ownership-source authority. `D-2` = **R2** owner-binding contract shape (conditional on `D-1`). `D-3` = **R3** persistence consumer admission (independent of `D-1`). |
| **Decision-maker** | Program Authority (PA) — Ramki. **The agent renders no authority.** |
| **Prepared** | `2026-10-25` (Asia/Calcutta) — actual date; not backdated |
| **Prepared by** | Arena Agent Mode — investigation, verification, and decision-input preparation only |
| **Preparing authority** | [`IIPS_v3.0_REPORTS_NP06_RESUMPTION_COMMISSIONING_PA_DECISION_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_RESUMPTION_COMMISSIONING_PA_DECISION_2026-10-25.md) (`IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01`) §2(1) (investigation) and §4 (the three further acts it does not render). Preparation of this request is routine in-scope work under that commissioning. |
| **Companion execution record** | [`IIPS_v3.0_REPORTS_NP06_R1_R2_R3_EXECUTION_RECORD_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_R1_R2_R3_EXECUTION_RECORD_2026-10-25.md) — what was actually executed and what remains. It is evidence, not a second decision. |
| **Verified baseline** | IRR `origin/main` `0e1b075d72e313e1950dd2f12aa8fbf066e0e1c1` (tree `9fd29c457796b27df770f2bbb9827f262cf80e1a`; merge of PR #255). IPD `main` `4b5c65a731a66a6fa1260146a55df9ed772953a5`. Historical qualified tree `39dd43eb…` (tree `3fdc29d6775022c8ea586c58cf9a6f0e613911d6`), tip `6a8afbb2…` (tree `0e25371229eff5cb8ae4e6bdc2615260ddf0629c`). Both read from the remote this pass. |
| **Preserved and not reopened** | A2 (`IIPS-V3-REPORTS-CV21-DQ7A-A2-PA-DISPOSITION-2026-10-25-01`); `REG-11` **Option C**; `CV-23` (`IIPS-V3-CV23-GATE-A-NOT-REQUIRED-PA-DISPOSITION-2026-10-24-01`); `CV-43`; D-1/D-2/D-3; the four `503` fences; pins `#2d9130e7…` / `#70b24f02…`; Gate 3 `src/persistence/*`. |
| **Effectiveness** | **None.** This record becomes an authority instrument only if the PA renders the decisions in it through a separate PA-authorized act, which is then published to `refs/heads/main` and independently verified. It is not effective now and must not be treated as effective. |

> **Bottom line.** No existing authorized instrument establishes a Reports ownership source for the current no-authentication baseline (`D-1`). The only established Reports ownership contract — NP-06 `R2`/`C4` `(tenantId, userId)` from the **authenticated principal** — is technically unsatisfiable on a baseline whose authentication stack was removed program-wide on `2026-10-12` and whose replacement covers NP-09/10/11 only. `D-2` cannot be decided before `D-1`. For `D-3`, this pass re-verified the dependency from remote state and found the gap is **larger than an export map**: the governed artifact store Reports binds to exists only on the divergent NP-04 lineage `2e11fa3b…`, not on IPD `main` or on the pin. A third, IRR-only path — a **second dependency specifier** to that lineage, using a pattern already present in this repository — is recorded here for the first time as the recommended `D-3` option. **No decision is rendered. The fence stays.**

---

## 1. How this request was produced

### 1.1 What was read, and from where

| Source | Method | Used for |
|---|---|---|
| IRR `origin/main` ref, tree, PR state, CI conclusions | `git fetch`, `gh pr view`, `gh api .../actions/runs` | §1.2 baseline |
| IPD `main`, pin `2d9130e7…`, NP-04 `2e11fa3b…`, broker pin `70b24f02…` — `package.json`, `tsconfig.pit-package.json`, `src/persistence` trees, compare API | `gh api` (read-only, Contents / Trees / Compare) | §4 (`R3`) |
| Historical qualified tree `39dd43eb…` (tree `3fdc29d6…`) and tip `6a8afbb2…` (tree `0e253712…`), fetched as objects only | `git fetch`, `git show`, `git ls-tree` | §2.2, §3, §4 |
| `docs/integration/**` governance corpus on current `main` | `grep`, direct reads | §2.2 ownership-source sweep |
| Current code: `frontend/server/**`, `frontend/src/app/**` | direct reads, blob hashes | §3, §5 |

No IPD write, no re-pin, no route change, no UI change, no `./persistence` import was made to produce this document.

### 1.2 Independently verified starting claims

| Claim in the execution directive | Verified result |
|---|---|
| PRs #254 and #255 merged | **CONFIRMED** — #254 merge `f0c14dcb2c216a778920146ad7d18ff534447288` (`2026-10-25T08:36:57Z`); #255 merge `0e1b075d72e313e1950dd2f12aa8fbf066e0e1c1` (`2026-10-25T08:41:31Z`); `origin/main` = `0e1b075d…` |
| Post-merge CI green | **CONFIRMED** — run `40177324528` `success` on `f0c14dcb…`; **0** open IRR PRs at first read |
| Historical domain modules restored byte-identical | **CONFIRMED** — `canonical.ts` `f57fa6a6…`, `artifact.ts` `1da89bd4…`, `composition.ts` `fc9a8fbb…` equal at `39dd43eb…`, at `6a8afbb2…`, and in the worktree |
| Canonical tests 46, artifact tests 56 | **CONFIRMED by execution** — 46 and 56 passed, 0 failed (this pass) |
| Full CI 1,299 passed | **Re-verified by execution** in the companion record; this pass's focused re-run is 106 + 5 (see §6 of the record) |
| Fence in force, `R1`/`R2`/`R3` open, `F-7` unsatisfied, `CV-51` blocked | **CONFIRMED** — fence blob `981470541812a64c733309f1debec75455d85bee` unchanged; every status above independently re-derived in §2–§5 |

---

## 2. `D-1` — `R1` Reports ownership source

### 2.1 The question put to the PA

> Does an existing authorized IRR-side or IPD-side instrument establish the **ownership source** for the Reports artifact store on the **current no-authentication baseline**, and if not, which of the bounded options in §2.4 does the PA select?

The question is the same one recorded on 2026-10-13 as `R1.1`–`R1.4` and answered there by **Option C — retain deferral**. It is re-put only because the PA commissioned bounded resumption on 2026-10-25; the commissioning does **not** answer it (§4 of that act names it as an unrendered decision).

### 2.2 Evidence sweep performed this pass

| # | What was searched | Result |
|---|---|---|
| 1 | Any Reports D-2 §8 contract on current `main` | **NONE.** `grep` over `docs/integration/**` returns only the 2026-10-13 *request*, *investigation*, and *Option C decision* — i.e. instruments that record the absence, not a contract. |
| 2 | Any Reports ownership declaration, value act, or owner/tenant values | **NONE.** No Reports-specific owner or tenant value exists anywhere in the corpus. |
| 3 | The effective F-3 mechanism (`IIPS_v3.0_OWNER_CONTEXT_*`: value act, mechanism PA decision, implementation/qualification record) | **EXISTS, and is explicitly scoped elsewhere.** `OwnerContext {tenantId, ownerUserId}` = `(irr-domain-4b82d6e1, owner-7f3a91c2)`; "partition semantics only — never an authorization credential"; established for **NP-09 watchlists, NP-10 collaboration, NP-11 settings**. Reports is expressly excluded and kept at `503`. |
| 4 | `REG-11` Option C §2(1)–(5) | **BARS the shortcut.** Direct copying or aliasing of the F-3 pair into Reports `(tenantId, userId)` is prohibited absent "an explicitly authorized, evidence-backed identity/security contract". §2(5) leaves reopening available *through* such a contract — it does not create one. |
| 5 | NP-06 accepted governance at the qualified tip (`IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md`) | **GOVERNS, and is authenticated.** `R2`/`C4`: ownership key `(tenantId, userId)` by **authenticated application principal**; §5.4 rows 1–2: unauthenticated → `401`, authenticated → authorized. |
| 6 | Current baseline enforcement stack | **ABSENT.** `frontend/server/secured-executor.ts`, `frontend/server/admin-transport.ts`, `frontend/src/core/auth/keycloakAdapter.ts` **do not exist**; a production `TenantDirectory` has never existed; `resolveOwnerContext` is consumed by the F-3 transports and by nothing else. Removed program-wide on `2026-10-12` (PR #61; PR #68 landed the F-3 replacement for NP-09/10/11 only). |
| 7 | D115 / `CV-43` as a possible company/tenant authority | **CLOSED — RETAINED UNWIRED.** No Company Identity Authority designated; `D-2` §§1/5/6 stand. Supplies nothing. |
| 8 | Historical authenticated transport (blob `cdee7ed1…` at tip `6a8afbb2…`) | **BRANCH-SCOPED AND AUTHENTICATED.** `reportsOwnership(principal)` derives `{tenantId, userId}` only from a server-derived `Principal`; `401` before authorization; role gate over `viewer/analyst/admin`. It supplies no no-auth source, and it cannot compile on current `main` (§3.2). |

### 2.3 Finding (a finding, not a decision)

**`R1` REMAINS NOT ESTABLISHED.** There is no approved ownership source usable by Reports on the current baseline. This is unchanged from 2026-10-13 and from the 2026-10-25 execution record; nothing located this pass narrows or widens it.

The finding has a **cause worth stating plainly**, because it changes which option is realistically available: Reports' governing ownership contract is not merely *unbound*, it is **preconditioned on a capability the product no longer has**. The product is a single-user, personal-use, no-authentication application by deliberate program decision. Any Reports owner on this baseline is therefore necessarily a *non-authentication* owner, which is precisely the class NP-06 `R2`/`C4` did not contemplate and Option C §2(2) forbids supplying by aliasing.

### 2.4 Options

Each option requires its own dated PA act. None is approved, recommended-as-approved, or effective. Compatibility notes are evidence-based; the recommendation in §2.5 is advice only.

#### `R1-Option A` — Restore the authenticated ownership contract for Reports

Bind Reports to `(tenantId, userId)` derived from a re-established authenticated principal.

| Aspect | Consequence |
|---|---|
| Required instruments | PA act authorizing restoration of the retired product-tier authentication stack for Reports: `SecuredExecutor`, a Keycloak/OIDC verifier, a **production** `TenantDirectory` (NP-06 §6 `P1` — never existed), membership provisioning/revocation authority, credential issuance and storage. |
| Code consequence | Re-introduce `secured-executor.ts`, `admin-transport.ts`, `src/core/auth/keycloakAdapter.ts`, a tenant directory, and a 401/403 path in `executive-transport.ts` — a program-wide reversal of the `2026-10-12` no-auth decision, not a Reports-scoped change. |
| Product consequence | The application has no login surface; restoring authentication implies one, plus credential lifecycle, for a single-user personal-use product. |
| Compatibility with existing records | Coherent with NP-06 `R2`/`C4` and §5.4 as written. **Conflicts with** the no-auth baseline and with the F-3 mechanism's stated purpose (which exists because authentication was retired). |
| Reuses historical work? | **Yes, maximally** — the qualified transport is exactly this contract, and its 32/32 / 228/228 / 14/14 evidence describes it. |
| Blocks even if granted | `R3` (no admitted persistence) and `F-7` still stand. |
| Assessment | Technically available; **disproportionate** to a Reports-scoped decision and inconsistent with a standing program-wide security posture. Not recommended. |

#### `R1-Option B` — Establish a Reports-specific governed non-authentication ownership declaration

Create a **new, Reports-specific** ownership declaration with its own complete `D-2` §8 contract, and bind Reports to it. This is the 2026-10-13 request's **Option B** and answers its `R1.2` affirmatively ("may a PA-governed non-auth declaration lawfully supply the owner pair") within Option C §2(5).

| Aspect | Consequence |
|---|---|
| Instruments required | (i) A **value/declaration act** naming the Reports owner value(s) and tenant value(s), their recording location, change authority, restart stability, recovery behaviour, unreadable-source behaviour, and audit trail (the F-3 property set applied to the *new* declaration); (ii) the **fifteen `D-2` §8 elements** for Reports: source/target authorities and identifiers, mapping lifecycle, provisioning authority, revocation authority, tenant/ownership/authorization boundaries, audit requirements, failure behaviour, security/trust model, durable storage, package/API contract; (iii) explicit statements that the pair carries **no authorization semantics**, that **no client-supplied identity is ever authoritative**, and that failure is **`503`** (`F-5`). |
| Must **not** do | Copy or alias the F-3 values `(irr-domain-4b82d6e1, owner-7f3a91c2)`. If the PA intends the same values, that intent must be stated expressly with its scope consequence — silence is not approval, and an inference would breach Option C §2(2). |
| Mechanism (separate sub-decision) | Whether Reports resolves its owner through (a) a **separate** server-owned carrier file and env seam (for example `IIPS_REPORTS_OWNER_PATH`), reusing the *mechanism* proven by F-3 without sharing its *values* or its file; (b) process-environment-pinned constants with no file; or (c) another named source. **Recommended: (a) with a distinct path**, because it keeps Reports' owner independent of NP-09/10/11's, preserves the auditable integrity binding, and fails closed per request. |
| Code consequence | Adds one resolver module plus its carrier contract; **no** authentication stack, **no** change to `executive-transport.ts` dispatch, **no** fence lift until `R2` and `F-7` are separately satisfied. |
| Compatibility | Coherent with the no-auth baseline and with `F-5`. **Amends in effect** NP-06 `R2`/`C4` for the non-auth product — that amendment must be stated in the act, not inferred, and NP-06 §5.4 rows 1–3 must be superseded by express replacement rows. |
| Does it unblock Reports? | **Yes, conditionally** — it removes the `R1` blocker and is a prerequisite for `D-2`/`R2`, but `R3`, `F-7`, acceptance and `CV-51` remain separate. |
| Assessment | **The only option that yields a Reports capability without reversing a program-wide decision or inventing semantics.** Recommended in §2.5 — as a decision *to be taken*, not as one taken. |

#### `R1-Option C` — Retain the deferral

Leave `REG-11` Option C in force, with no ownership source.

| Aspect | Consequence |
|---|---|
| Instruments required | None. This is the status quo; a PA act would only re-affirm it. |
| Code consequence | None. The fence remains the only HTTP behaviour; the restored domain modules stay unwired. |
| Compatibility | Fully coherent — this is the currently operative posture. |
| Does it unblock Reports? | No. `CV-51` remains blocked indefinitely. |
| Assessment | Coherent and zero-risk, but it converts the commissioning's investigative work into a permanently dormant module set. |

### 2.5 Recommendation (`D-1`)

**Recommend `R1-Option B`,** with the mechanism in §2.4 `R1-Option B` sub-decision **(a) distinct carrier path**, for these evidence-based reasons:

1. **`R1-Option A` is not Reports-scoped.** Its prerequisites are a production `TenantDirectory`, an OIDC verifier, credential lifecycle, and a login surface — none of which exist and all of which were removed or never built by deliberate program decisions (`CV-23`, `CV-43`, and the no-auth transition). Granting it for Reports would settle a program-wide security question inside a capability decision.
2. **Every element Option B requires is already enumerated in this corpus.** The fifteen `D-2` §8 elements are stated at the 2026-10-13 decision request §4.1 `P-A4`; the F-3 property set is stated and *implemented*; the fail-closed `503` behaviour is implemented and tested. The PA is choosing among known shapes, not authoring new semantics from scratch.
3. **It does not require inventing anything the corpus forbids.** The owner values become a recorded PA decision rather than an inferred alias; the agent supplies options and consequences only.
4. **The alternative is dormancy.** `R1-Option C` leaves a commissioned, restored, tested domain permanently unreachable.

Residual risk stated plainly: Option B creates a **second ownership declaration** in a program that already has one, and a second declaration is a durable maintenance obligation (two value acts, two failure modes, two audit trails). If the PA judges that cost higher than the value of Reports, `R1-Option C` is the coherent answer and this record supports it without reservation.

---

## 3. `D-2` — `R2` Reports contract shape and binding

`R2` cannot be decided before `D-1`, because the shape of the owner binding *is* the thing `D-1` selects. This section exists so that the PA can decide `D-1` knowing the exact downstream change set, and so that no later step can claim a shape that was never chosen.

### 3.1 Existing requirements — not changed by any `R2` act

These come from accepted NP-06 governance and from standing program constraint. None is proposed for change.

| # | Requirement | Source |
|---|---|---|
| E-1 | `reportKey` is deterministic **content** identity (SHA-256 over canonical UTF-8); `reportId` is durable **instance** identity; the two are never conflated; the frozen engine's content-derived id is never instance identity. | NP-06 `D3`, `C2`, §5.2, §5.1 |
| E-2 | Ownership is immutable per artifact and is **never** client-supplied. | `R2`/`C4`, §5.1, §5.3 |
| E-3 | Supersession is append-only and single-parent via `supersedesReportId`; `artifactVersion` starts at 1, increments monotonically, never for identical canonical input. | `C1`, `C3` |
| E-4 | `schemaVersion`, `artifactVersion`, `generatedAt` are explicit; validation precedes acceptance. | `D3`, §5.3 |
| E-5 | Cross-owner retrieval is denied **without existence disclosure**. | §5.1 |
| E-6 | Reports owns **no** storage; artifacts live in the common governed persistence foundation; a Reports-specific store is prohibited. | NP-06 `R3`, §5.1 |
| E-7 | The frozen CSIP `ReportingEngine` is read-only input and is never modified or relocated. | `G11` |
| E-8 | Failure is fail-closed. On the current baseline the failure response is **HTTP `503 owner-context-unavailable`**; no identity is inferred and no fallback store is substituted. | `F-5`; fence blob `98147054…` |
| E-9 | Route/method shape and non-disclosure are preserved: known paths `503`, unknown path `404`, wrong method `405` with `Allow`. | `reports-transport.ts` |
| E-10 | Canonicalization, artifact validation, and composition semantics as restored — byte-identical to the qualified tree. | `f57fa6a6…`, `1da89bd4…`, `fc9a8fbb…` |

### 3.2 What is absent on current `main` (measured, not assumed)

The qualified transport (blob `cdee7ed1…`) imports four modules that **do not exist** on current `main`:

| Import | Purpose in the historical transport | Presence on `main` |
|---|---|---|
| `./secured-executor` (`SecuredExecutor`) | `authenticate(token)` → server-derived `Principal`; `authorize`/`authorizeMutation` → audited `403` | **ABSENT** |
| `../src/core/auth/keycloakAdapter` (`AuthError`, `OidcVerifier`) | issuer/audience/expiry validation | **ABSENT** |
| `./admin-transport` (`TransportError`, `createAdminExecutor`, `TEST_TENANT_DIRECTORY`) | error vocabulary + composition root | **ABSENT** |
| `../../iips-platform/src/distributed/EnterpriseRuntime` (`Principal`) | principal type | **PRESENT** (type only) |

Consequence: **the historical transport cannot be restored by copying it.** With three unresolvable imports it does not compile on `main`; and the only way to make it compile is to restore the retired authentication architecture — which is `R1-Option A`. Restoring it under an unapproved owner contract would breach the commissioning record §3 and the standing prohibition on exposing an incomplete capability.

### 3.3 Minimum change set, split by decision dependency

| # | Change | Depends on | Notes |
|---|---|---|---|
| C-1 | Restore `ReportsPersistence` (blob `49f20306…`), the port declaration (`16d787ea…`), and the adapter (`7f7b80a5…`) onto `main`. | **`D-3`** | The port declares its dependency structurally and resolves it at **runtime**, so the code compiles without the package; the pin/specifier question is `D-3`. Not restored this pass — the commissioning withholds a persistence module until `R3`. |
| C-2 | Replace `executor.authenticate(token)` (`401`) with per-request owner resolution from the `D-1` source; failure → `503`. | **`D-1`**, then `D-2` | No `401` is possible without a credential; the replacement status is a security-semantics decision, not an implementation detail. |
| C-3 | Replace `executor.authorize(principal, 'read', resource)` and the role set `viewer/analyst/admin` with an authorization predicate for the no-auth baseline. | **`D-2`** (new) | Options: (a) no separate authorization step — the single declared owner reaches all five operations; (b) a non-role predicate bound to the declared owner. **This is the largest unresolved security question in `R2`** and cannot be settled by the agent: dropping an authorization step is a semantic change to a security control. |
| C-4 | Tenant-claim handling. Historical: foreign tenant claim → audited `403`; own tenant claim → still refused `400`. | **`D-2`** | Without a tenant authority there is no "foreign". Recommended shape: **all** client-supplied tenant/identity claims → `400`, with the `403` row retired by express statement. |
| C-5 | Client-supplied identity/ownership refusal (`400`) and durable-identity refusal (`reportId`, `artifactVersion`, `supersedesReportId`, `reportKey`, `schemaVersion` → `400`); `companyId`/`runtimeCompanyId` always refused. | **None — contract-independent** | Can be implemented exactly as qualified. |
| C-6 | Server-side surface allowlist for the authorized resource string (never URL-derived). | **None** | Survives unchanged; the resource namespace `reports.` is a server constant. |
| C-7 | Governed deny/allow audit. Historical audit came from the executor primitives. | **`D-2`** (new) | With no executor there is no audit primitive. The act must either name a replacement audit sink or expressly defer the §5.4 audit sentence — deferred audit must be *stated*, not silently dropped. |
| C-8 | Persistence-unavailable mapping → `503 persistence-unavailable` (distinct from `owner-context-unavailable`). | None | Survives; must remain fail-closed. |
| C-9 | Route wiring in `executive-transport.ts` replacing the fence dispatch. | **`D-2` + `F-7` + acceptance** | Not before `F-7`; the fence is the only HTTP behaviour until a replacement passes authorization and qualification. |

**Precisely which changes depend on a PA decision:** C-2, C-3, C-4, C-7 (`D-2`, and C-2 additionally `D-1`); C-1 (`D-3`); C-9 (all of the above plus `F-7` and acceptance). C-5, C-6, C-8 are contract-independent and could be implemented under the existing commissioning — but they are **not useful without C-2**, because a transport that cannot establish an owner cannot reach them, so implementing them now would produce dead code and a false impression of progress. They are therefore recorded as prepared, not committed.

### 3.4 Test-case inventory — reuse and re-expression

NP-06 §5.4 defines fifteen cases. Reuse policy (from the reconciliation record): reuse the **case inventory**, do not re-run the historical suite, do not restore the authenticated transport.

| # | Historical expectation | Under the current baseline | Disposition |
|---|---|---|---|
| 1 | unauthenticated → `401` | No credential exists | **RETIRE**, replaced by `503 owner-context-unavailable` when the owner source cannot be resolved. Requires `D-2` statement. |
| 2 | authenticated principal → authorized | Owner resolved from the `D-1` source → authorized | **RE-EXPRESS** once `D-1`/`D-2` decided |
| 3 | foreign tenant → `403` | No tenant authority | **RETIRE or RE-EXPRESS** per C-4 |
| 4 | ownership in body → `400` | Unchanged | **REUSE** |
| 5 | valid owner accepted `201` | Unchanged shape, different source | **RE-EXPRESS** via `D-1` source |
| 6 | same canonical inputs → same `reportKey`, different `reportId` | Unchanged | **REUSE** (domain half already executed: canonical 46) |
| 7 | `appendVersion` → `artifactVersion + 1` | Unchanged | **REUSE** (needs C-1) |
| 8 | single-parent supersession chain | Unchanged | **REUSE** (needs C-1) |
| 9 | mutation of published artifact → `409` | Unchanged | **REUSE** (needs C-1) |
| 10 | cross-owner retrieval → `404` | Single owner; construct a foreign owner only in a port double | **REUSE** (needs C-1) |
| 11 | restart → artifact survives | **`F-7`** — blocked on `D-1` + `D-3` | **BLOCKED** |
| 12 | failed transaction → no partial artifact | Unchanged | **REUSE** (needs C-1) |
| 13 | invalid canonical artifact → `422` | Unchanged | **REUSE** (partly covered by restored `reports-artifact.test.ts`, 56 tests) |
| 14 | concurrent `createInstance` → distinct `reportId`s | Unchanged | **REUSE** (needs C-1) |
| 15 | frozen engine unchanged | Unchanged | **SATISFIED by blob comparison this pass** — `ReportingEngine.ts` `1149864a8c43e8b885eee2c4a1ce869dd8f338` at `main`, at `39dd43eb…`, and at `6a8afbb2…` |

**Why no transport test code was committed this pass.** Cases 1–5 encode expected status codes that are exactly what `D-2` will decide. Writing them now would either (a) encode an unapproved semantics as if it were a contract, or (b) be written to be skipped, which is a false signal in CI. The case inventory above is the decision input; the tests follow the decision.

---

## 4. `D-3` — `R3` persistence consumer admission

### 4.1 Re-verified from remote state this pass

| Fact | Measurement |
|---|---|
| IRR pin | `github:ramkivs/iips-production-market-data#2d9130e76bb0dc89daeefabaf297e27bdaa84250` (`frontend/package.json`, blob `6274537a…`) |
| That pin's export map | **exactly three** keys: `./portfolio-ui`, `./pit`, `./d114-non-production`. **No `./persistence`.** |
| `2d9130e7` vs IPD `main` | `behind 59`, `ahead 0` — an **ancestor** of IPD `main` |
| Second IRR specifier | `iips-broker-import` → same repository, commit `70b24f029842a7e9b7f615e4d9df7376fd4ff817` (`behind 208`) |
| NP-04 lineage `2e11fa3b…` | exports `./pit`, `./d114-non-production`, **`./persistence`**; `files: ["dist/package"]`; `prepare` → `build:pit-package` → `tsc -p tsconfig.pit-package.json` whose `files` are **`src/pit/package.ts`, `src/d114/non_production_package.ts`, `src/persistence/package.ts`** |
| `2e11fa3b` vs IPD `main` | **`diverged`**: `26` ahead / `210` behind, merge-base `4d3e1cdc…`; **not an ancestor** |
| IRR imports of `…/persistence` | **`0`** |
| Implementation on that lineage — `2e11fa3b`'s `src/persistence` | `db.ts`, `errors.ts`, `identity.ts`, `index.ts`, `package.ts`, `reportKey.ts`, `schema.ts`, `store.ts` (the governed artifact store) |
| IPD `main` `src/persistence` | `audit.ts`, `binding.ts`, `brokerImportPersistence.ts`, `connection.ts`, `durablePortfolioStorePort.ts`, `gateAPrimeProvisioning.ts`, `gateAPrimeValidation.ts`, `migration_ledger.ts`, `migrations/001…004`, `portfolio_store.ts`, `provisioning.ts` |
| IPD `main` `tsconfig.pit-package.json` `files` | `src/pit/package.ts`, `src/d114/non_production_package.ts` — **no persistence package** |

### 4.2 The finding that changes the option set

The earlier characterisation of `R3` as an **export-map gap** is incomplete. The governed artifact store that Reports binds to — `GovernedArtifactStore`, with `openDatabase(OpenOptions)`, `reportKey`, and the NP-04 schema/migrations — **does not exist on IPD `main` or on the pin**. It exists only on the divergent NP-04 lineage. A code search for `GovernedArtifactStore` on IPD's default branch (`main`) returns **0** hits, and IPD `main`'s `src/persistence` is a *different* persistence line (portfolios, principal bindings, broker import) with a *different* `openDatabase(filePath, version)` signature.

This means the two options named in the commissioning §4 do not exhaust the evidence:

* **"an IRR-side adapter that preserves existing IPD exports"** cannot work: there is no export to preserve that exposes an artifact store, and no artifact store behind any existing export.
* **"a governed IPD package/export change"** now means more than adding an export key: it requires porting the artifact store and its schema onto IPD `main`'s persistence line — which has **add/add collisions** (`migrations/001`, `migrations/002`, `connection.ts`) with the NP-04 lineage — plus a new reports migration, plus `CV-23` §5's four-element convergence act, plus IPD write authority that this installation does not currently hold (§16.103 records `403 Resource not accessible by integration`).

### 4.3 Options

#### `R3-Option A` — IRR-side adapter on the **current** pin
**Not viable.** The implementation is absent. Any "adapter" would have to supply the store itself, which NP-06 `R3` prohibits ("a Reports-specific persistence store is prohibited"). Recorded so it is not revisited.

#### `R3-Option B` — IRR-side **second dependency specifier** to the NP-04 lineage  ⟵ *newly identified this pass*

Keep the primary pin **unchanged**, and add a *second* dependency entry pointing at the same repository under a distinct specifier, for example:

```
"iips-np04-governed-persistence": "github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494"
```

The adapter resolves `<alias>/persistence` at runtime instead of `iips-production-market-data/persistence`.

| Aspect | Consequence |
|---|---|
| Precedent in this repository | **Yes — this exact pattern already exists.** `frontend/package.json` carries **two** commit pins of the same repository: `iips-broker-import#70b24f02…` and `iips-production-market-data#2d9130e7…`. A second specifier is an established, accepted dependency shape here, not an invention. |
| IPD mutation | **None.** No export-map edit, no package change, no branch operation, no write. |
| Gate 3 | **Untouched.** `main`'s `src/persistence/*` is not replaced, merged, promoted, or re-pinned. The alias carries the NP-04 lineage beside it. |
| Existing exports | **Preserved.** `./portfolio-ui`, `./pit`, `./d114-non-production` continue to be served by the unchanged primary pin. |
| What it buys | The authoritative governed artifact store, unchanged, installable and importable through `./persistence`, with NP-04 owning schema, migrations, identity minting, version numbering, supersession, and durability. |
| Runtime shape | A **distinct** database file (`IIPS_NP04_DATABASE_PATH`, server-owned) — never the Gate 3 portfolio store's file. Fail-closed `503` when unconfigured. |
| Lineage obligations | The added lineage is `26` ahead / `210` behind `main`; `CV-23` §5's four elements must be recorded for it: (a) capability it serves — Reports artifact persistence; (b) exact surviving lineage — `2e11fa3b…`; (c) migration-ledger reconciliation — NP-04's own schema in its own database file, no merge into the Gate 3 ledger, no ledger entry claimed for Gate 3; (d) re-pin/qualification path — `F-7` plus a later convergence decision if the lineages are ever united. |
| Authority | **A dated PA act.** It is a dependency-surface change (a new specifier) even though it is not a re-pin of the existing one. `CV-23` §1(3)/§3 withhold re-pin and export-map addition; this option seeks neither, but it still needs express authority because it adds a lineage to the consumer surface. |
| Assessment | **Smallest compatible path.** IRR-only, reversible (one dependency line + lockfile), no IPD write, preserves Gate 3 and every existing export. Recommended in §4.4. |

#### `R3-Option C` — IPD package/export act on `main`

Port the governed artifact store onto IPD `main`'s persistence line; add a reports migration; add `./persistence` to the export map and the `pit-package` build; re-pin IRR; run IPD CI and the Gate 3 reconciliation.

| Aspect | Consequence |
|---|---|
| Required instruments | `CV-23` §5 convergence act naming (a)–(d); IPD implementation/package authority; **IPD write access**, which this installation does not currently hold |
| Effort / risk | Highest. Add/add collisions on `migrations/001`, `migrations/002`, `connection.ts`; two persistence domains in one module graph; a new migration with real durability consequences; Gate 3 re-acceptance |
| Benefit | Single lineage; security and packaging fixes on `main` reach Reports automatically; no long-lived divergent dependency |
| Assessment | Architecturally cleanest **long-term**; **not executable now** and much larger than the Reports increment. Not recommended as the next act; recommended as the eventual convergence target *if* Reports is admitted. |

#### `R3-Option D` — Retain (no binding)
No persistence module, no import, no pin change. Reports stays domain-only. Coherent; blocks `F-7` and `CV-51` permanently.

### 4.4 Recommendation (`D-3`)

**Recommend `R3-Option B`,** with `R3-Option C` recorded as the intended convergence target if Reports is later admitted:

1. It is the **only** option that reaches the authoritative store without an IPD write and without replacing Gate 3.
2. Its mechanism **already exists in this repository** (two specifiers, two commits, one repository) and is therefore not a novel architecture.
3. It is reversible by deleting one dependency line, and it cannot silently change what the primary pin serves.
4. Its cost is explicit and bounded: one divergent lineage with a recorded reconciliation obligation, which `R3-Option C` discharges later if the capability is admitted.

Residual risk stated plainly: `2e11fa3b` does not receive `main`-line fixes. If that lineage is later abandoned, the alias must be retired in the same act that converges.

---

## 5. The exact decisions requested

A complete response is one PA-authorized instrument stating all three decisions, in this form:

**`D-1` (`R1`)** — choose **exactly one**: `R1-Option A` (restore authenticated ownership), `R1-Option B` (Reports-specific governed non-authentication declaration), or `R1-Option C` (retain deferral). If **B**: state the owner and tenant values, the source mechanism (carrier path / env-pinned / other), the fifteen `D-2` §8 elements or an express statement that a named element remains undecided, the replacement rows for NP-06 §5.4 rows 1–3, and confirm that the pair carries no authorization semantics and that no client-supplied identity is ever authoritative.

**`D-2` (`R2`)** — **only if `D-1` ≠ C.** State the owner-binding contract shape for the no-auth baseline, specifically: the replacement for the `401` path (C-2), the authorization predicate replacing the role gate (C-3), the tenant-claim disposition (C-4), and the audit disposition (C-7). Confirm that the fence is not lifted by the decision and that no route, UI, or persistence is activated by it.

**`D-3` (`R3`)** — choose **exactly one**: `R3-Option A` (not viable — recorded for completeness), `R3-Option B` (additional specifier to `2e11fa3b…`), `R3-Option C` (IPD package/export act), or `R3-Option D` (retain). If **B**: state the specifier name, confirm the primary pin is unchanged, confirm Gate 3 is untouched, and confirm the lineage obligations in §4.3 are accepted.

The response should also state, as the 2026-10-13 request required, an express confirmation that **no Reports route, UI, pin admission, or runtime behaviour is activated** by the decision.

**Until such a response is recorded, `R1` remains NOT ESTABLISHED, `R2` unbound, `R3` OPEN / NOT ADMITTED, and the `503` fence (blob `98147054…`) stands.**

---

## 6. What remains prohibited pending these decisions

1. Inventing an owner, tenant, principal, membership, or ownership rule; aliasing `OwnerContext` to `AuthenticatedOwner`; or reusing the F-3 values without an express act.
2. Restoring `index.ts`, `persistence.ts`, `persistence-port.ts`, `np04-adapter.ts`, or the persistence test suite onto `main`.
3. Adding any `./persistence` import, re-pinning, editing an export map, or adding a dependency specifier.
4. Restoring the authenticated transport, or restoring the retired authentication architecture under a Reports label.
5. Lifting, editing, or bypassing the fence; mounting `/reports`; adding a Reports route, navigation entry, API client, or UI.
6. Claiming `F-7`, acceptance, admission, or production readiness from any test, build, or harness result recorded here.

---

## 7. Effect and representation

This record **renders no authority**. It is a decision request prepared under the commissioning's investigation authority. It states findings it measured, options it did not choose, and one recommendation it does not enact. If the PA declines every option, nothing here changes and the operative posture remains `REG-11` Option C with the fence in force.

*Prepared by Arena Agent Mode — investigation, verification, and decision-input preparation only. Program Authority: Ramki. **No decision rendered. Nothing in this record is approved or effective.***
