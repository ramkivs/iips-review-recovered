# IIPS v3.0 — AD-20 Persistence Lineage and Identity Contract Decision Gate — Program Authority Decision Record

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-AD20-PERSISTENCE-LINEAGE-IDENTITY-CONTRACT-DECISION-01` |
| Decision ID | **`AD-20`** (owned by `REG-11` / `REG-12`; lineage context `REG-03` / `AD-06`) |
| Decision | **`BOUNDED DISPOSITION — proven portion closed; persistence convergence, IU-6 repin rationale, PR #42 coverage, and all identity/security-identifier contracts remain OPEN`** (see §4) |
| Program Authority (PA) | **Ramki** — single owner, sole user, and Program Authority of the single-user personal-use IIPS platform |
| Date | 2026-10-13 (Asia/Calcutta) |
| Authoritative repository / branch | `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main` |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not modified by this record** (`origin/main` at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`, re-verified 2026-10-13) |
| Verified IRR baseline at investigation | Commit `6dac8bff0fae6cd201df5b02e38ee45ab433881a` (merge of PR #77; `REG-08` merge `6c2c955a9a3ad0e6d896746beb5062980952ba37` via PR #76 independently confirmed via GitHub API) |
| Canonical tracker | [`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`](../../IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md) §7 |
| Record type | Program Authority decision-gate record. **Additive.** Records a bounded disposition and the minimum next gates only. Grants **no** implementation, promotion, merge, cherry-pick, re-pin, activation, identity-mapping, security-identifier-mapping, or production authority. |
| Environment | Non-production. Production is out of scope. |

---

## 1. Purpose, scope and non-goals

`AD-20` — promotion/convergence coverage of the G-2 consumer and of the two divergent IPD
`src/persistence` implementations — blocks further admission of Governed Reports (`REG-11`) and
Durable User Portfolios (`REG-12`). This record establishes, from authoritative repository evidence
re-verified on 2026-10-13:

1. what each persistence implementation actually owns and supports (§2);
2. whether their responsibilities overlap, conflict or can coexist (§2.3);
3. which unresolved decisions prevent safe convergence (§3, §5);
4. what identity and security-identifier contracts Reports and User Portfolios require (§3);
5. the smallest defensible next gates (§4.3).

**Non-goals (explicit):** this record does **not** activate Reports or User Portfolios, does **not**
promote any IPD code to any ref, does **not** change any package pin, does **not** merge, cherry-pick
or reconcile the two persistence implementations, and does **not** invent any owner/tenant,
company/security-identifier, or persistence mapping. Historical records are preserved unchanged;
nothing below rewrites them to appear to have authorized this outcome earlier.

Investigation, decision, implementation, admission, publication and verification statuses are kept
distinct throughout. Neither implementation was selected merely because it is newer, easier to
integrate, or already used by one consumer; the two are **not** treated as interchangeable.

---

## 2. Verified persistence lineages (re-verified 2026-10-13 against live IPD refs)

Remote refs re-verified via `git ls-remote` and object inspection on 2026-10-13: IPD
`main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`; pin branch
`np04-governed-persistence-windows@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; G24 branches
`arena/01a0e6d9-iips-production-market-data` and `arena/01a0f308-iips-production-market-data`, both
`@6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`; `arena/01a0f839-iips-production-market-data@12c480b5bf5cfbe0f296fcd12c9189328b915417`
(carrying act `2606185923f6cbd3f4df5c3af200f54d40ed4bbc`). **No ref movement since the
2026-10-13 governance reconciliation (§6 of the tracker); no new IPD or IRR PRs are open in either
repository.** IPD `main` contains **no** `src/persistence` tree at all.

### 2.1 Pin lineage — NP-04 Governed Artifact Store (artifact/report domain)

| Aspect | Verified evidence |
|---|---|
| Lineage | `246cb94` → `3137426` ("NP-04 governed persistence implementation") with `d61ff9c` ("NP-04: common governed persistence capability", parent = IPD `main` tip `4d3e1cd`) merged at `bd5229d`, exposed at `2e11fa3` ("Expose NP-04 persistence package") |
| Source files (`src/persistence/`) | `db.ts`, `errors.ts`, `identity.ts`, `index.ts`, `package.ts`, `reportKey.ts`, `schema.ts`, `store.ts` |
| Public exports | Package subpath `./persistence` (`openDatabase`, `GovernedArtifactStore`, `canonicalizeReportKey`/`deriveReportKey`, `mintReportId`/`assertOwner`/`sameOwner`, persistence error types); the same commit also exports `./pit` and `./d114-non-production` |
| Persistence model / domain ownership | **Artifact/report domain** (D-1 Option C). Single append-only table `governed_artifacts` (`report_id` PK, `chain_id`, `(tenant_id, user_id)`, `report_key`, `report_type`, `portfolio_id`, `scenario`, parameters, `artifact_version`, `supersedes_report_id`, canonical payload, provenance). Instance identity is a minted UUIDv4, independent of content; version chains are per durable instance; append-only enforced by storage triggers; "current" = max `artifact_version` per chain |
| Supported operations | Exactly five governed operations: `createInstance`, `appendVersion`, `resolveById`, `queryByOwner`, `listSupersededBy`. Ownership is taken **only** from the caller-supplied authenticated-principal argument `(tenantId, userId)`, never from a payload; cross-owner reads are indistinguishable from absence |
| Storage / transactions | `node:sqlite` (`DatabaseSync`); WAL; `foreign_keys=ON`; `synchronous=FULL`; `busy_timeout=5000`; every mutation in a transaction that rolls back on failure; checksummed contiguous-ordinal migrations (`schema_migrations`); absolute caller-supplied path, no default, no silent in-memory fallback |
| Tests / qualification | `tests/np04_governed_persistence.test.ts` on the lineage (749 lines; deleted on the G24 line). IRR side: `frontend/server/reports/reports-persistence.test.ts` pins `NP04_BOUNDARY` to this commit. No IPD-`main` qualification, acceptance or promotion act exists for this lineage |
| Dependencies / integration | IRR `frontend/package.json` git pin `#2e11fa3b…`; IRR resolves `iips-production-market-data/persistence` dynamically with server-owned `IIPS_NP04_DATABASE_PATH`; fail-closed if path or package is unavailable |
| Consumers | IRR Governed Reports seam (`frontend/server/reports/*`, presence-only `AD-01`, fenced — §3.1); `./pit` + `./d114-non-production` admitted only at `AD-02`'s exact five-file scope |
| Known omissions / assumptions | No identity provisioning, membership, revocation, HTTP surface, or portfolio model. `(tenantId, userId)` values are **assumed** to originate from an authenticated principal established elsewhere — no such source is bound on IRR `main` for Reports (see §3.1). `companyId`/`runtimeCompanyId` are explicitly **not** modelled |

### 2.2 G24 lineage — durable portfolio persistence (portfolio/tenancy domain)

| Aspect | Verified evidence |
|---|---|
| Lineage | `0dab122` (merge of IPD PR #6, IU-6 D114 PIT population) → `8c99627` ("NP04-G24: non-production durable persistence implementation") → `d4fdb33` (migration 002) → `6828155` ("NP04-G32: canonical NP04 governance authority record"; root tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`) |
| Source files (`src/persistence/`) | `bootstrap.ts`, `config.ts`, `connection.ts`, `errors.ts`, `index.ts`, `migrations/{001_initial_schema, 002_audit_event_sequence, index, registry, runner, types}.ts` — plus the surrounding domain surface `src/portfolio/{consolidation, durable-store, repository}.ts`, `src/app_identity/*`, `src/auth/*` (OIDC), `src/server/{authorization, http-server}.ts` |
| Public exports | **No `./persistence` package subpath.** `package.json` exports only `./pit` and `./d114-non-production`; consumption is via the G24 HTTP surface (`/api/ipd/portfolios`), not a package import |
| Persistence model / domain ownership | **Portfolio/tenancy domain** (D-1 Option C; G-2: IPD owns the user-portfolio domain). Migration-001 schema: `application_users`, `external_identity_mappings` (`(issuer, subject)` → application user, lifecycle PENDING→APPROVED→ACTIVE→RETIRED), `mapping_audit_events`, `tenant_memberships` (explicitly provisioned, ACTIVE/REVOKED), `user_portfolios`, `portfolio_revisions` (INITIAL/MERGE/REPLACE/RESET/DELETE), `portfolio_revision_holdings` (`symbol`, `company_id`, nullable `isin`, `exchange`, quantities/prices, `identity_status`, `resolution_disposition`), `portfolio_contributions`, `portfolio_events` |
| Supported operations | Governed bootstrap lifecycle (validate config → connect → migrate → verify → only then HTTP listen; fail-closed, no in-memory fallback); seven portfolio operations over HTTP (list/get/create/save-holdings/reset/delete/revision-history), each in exactly one IMMEDIATE transaction; identity mapping and tenant-membership enforcement (`TenantScope` validated against ACTIVE memberships) |
| Storage / transactions | `better-sqlite3` 13.0.3; rollback journal (`DELETE`; WAL explicitly deferred); `synchronous=FULL`; foreign keys mandatory; absolute path via `IPD_PORTFOLIO_DB_PATH`; checksummed append-only migration ledger (001–002) |
| Tests / qualification | `tests/g24_{a..h}_*.test.ts` + `g24_test_support.ts` on the lineage (persistence foundation, migrations, portfolio durability, identity mapping, authorization, OIDC security, recovery, HTTP boundary). IRR `userPortfolioContract.test.ts` records the G24 suite as verified at this tip ("84/84 PASS" as recorded in the IRR contract header). Acceptance is recorded on `arena/01a0f839@12c480b5` (SHA/tree-bound to `6828155`); IPD-`main` admission is **prohibited** by act `26061859…` |
| Dependencies / integration | IRR holds **no package pin** to this lineage — only the frozen reference `G2_LINEAGE.commit = '6828155…'` (`AD-03`, reference only) in `frontend/server/user-portfolio/userPortfolioContract.ts` |
| Consumers | None live. The IRR G-2 consumer (`frontend/server/user-portfolio/*`, `user-portfolio-transport.ts`, `frontend/src/features/user-portfolios/*`) is contract/boundary-only and fenced (§3.2); `/api/user-portfolios/` dispatch is **not admitted** (`P3`) |
| Known omissions / assumptions | Assumes OIDC-issued `(issuer, subject)` principals and explicitly provisioned memberships — neither exists in the current single-user no-auth IRR baseline (auth was removed by PR #61). Holding identity is carried as free-text `symbol` + `company_id` + nullable `isin` with **no governed uniqueness or equivalence contract** (§3.2). IRR commit `a0ab5a34` is **not ratified** (`P2`) |

### 2.3 Direct comparison and classification

| Dimension | Pin lineage (`2e11fa3b`) | G24 lineage (`6828155e`) |
|---|---|---|
| Ancestry | Descends from IPD `main` tip `4d3e1cd` (via `d61ff9c`) | Descends from IPD `main` tip `4d3e1cd` (via `246cb94`) |
| Relationship | Neither is an ancestor of the other; merge-base `246cb944e174dee09b7c08ffa93bfa672dca059c` | (same) |
| `src/persistence` diff | 17 files changed, +1,105/−1,081 between the refs; 50 files, +8,184/−1,842 overall (pin→G24 direction: G24 test suite added, NP-04 test deleted) | (same) |
| Entities / tables | `governed_artifacts` only | `application_users`, identity mappings, memberships, portfolios, revisions, holdings, contributions, events |
| Identity model | Caller-supplied `(tenantId, userId)` pair; no provisioning | Provisioned application users + `(issuer, subject)` mappings + SQL tenant memberships |
| Driver / journal | `node:sqlite`, WAL | `better-sqlite3`, rollback journal (WAL deferred) |
| Consumption surface | Package subpath `./persistence` | HTTP `/api/ipd/portfolios` only |
| On IPD `main` | **No** | **No** |

**Classification (decided in §4, on the evidence above and D-1 §4's exhaustive zero-overlap
finding): the two implementations are _distinct domain stores that may coexist_ — not competing
implementations of the same responsibility, and not an intended evolution of one into the other.**
They share no tables, schemas, object models, identifiers, repository interfaces, package interfaces,
adapters, or runtime calls; they differ in driver, journal mode, identity model, authorization model,
and consumption surface. This classification rests on domain responsibility and contract evidence,
**not** on commit chronology. The single genuine conflict is **structural, not semantic**: both
occupy the same repository path `src/persistence/`, so both cannot be promoted to IPD `main` as-is
without a path/layout collision — and D-1 §§7–9 record that no identity, security, or package/API
reconciliation between them has been established. Coexistence as domain stores is therefore possible
in principle; convergence onto one ref is **unproven** and requires its own gate (§4.3, Gate A).

---

## 3. Hosting, admission, and identity prerequisites

### 3.1 Governed Reports (REG-11) — minimum contract still missing

Verified on IRR `main@6dac8bf`: `frontend/server/reports-transport.ts` validates route/method for
`/api/reports*` and then returns HTTP **503 `owner-context-unavailable`**
(`frontend/server/owner-context-unavailable.ts`) for every owner-scoped operation, without invoking
domain or persistence code. The persistence seam
(`frontend/server/reports/persistence-port.ts`) structurally mirrors the pin lineage's five
operations, binds `authoritativeCommit`/`pinnedCommit` to `2e11fa3b…`, and fails closed when
`IIPS_NP04_DATABASE_PATH` or the package is unavailable.

The minimum contract needed before Reports can be admitted is therefore **not** a persistence
decision — the authoritative persistence boundary is already designated (pin lineage, D-1) — but:

1. a **D-2 §8 owner binding**: an explicit governed act binding the IRR F-3 owner pair
   (`owner-7f3a91c2` / `irr-domain-4b82d6e1`, `frontend/server/owner-context-carrier.ts`, qualified
   for NP-09/10/11 only) to the Reports `AuthenticatedOwner (tenantId, userId)` — or a separately
   decided Reports owner value. **No such binding exists; none is created here, and no mapping is
   inferred.**
2. the **D-1 vs PR #42 reconciliation (`P1`)**: the 13 `AD-01` presence-ratified files' runtime
   enablement remains excluded until that conflict is disposed by its own act;
3. **F-4/F-7 qualification**: Reports was expressly deferred by F-4; admission requires its own
   implementation-authorization gate plus the five-part F-7 bar (positive/negative ownership tests,
   failure-mode tests, durability/restart evidence, no cross-domain equivalence without a D-2 §8
   contract). The Reports UI (`Reports.tsx`, off-main on `arena/01a0f1b3@6a8afbb2`) additionally
   requires a no-auth port and its own admission.

Failure behavior until then is exactly the present one and is **preserved**: HTTP 503
`owner-context-unavailable`, no data read or changed, no inferred owner.

### 3.2 Durable User Portfolios (REG-12) — minimum contract still missing

Verified on IRR `main@6dac8bf`: `frontend/server/user-portfolio-transport.ts` likewise returns
HTTP **503 `owner-context-unavailable`** for every `/api/user-portfolios*` operation without reading
a body, tenant claim, or credential. The retained seam
(`userPortfolioContract.ts`, `userPortfolioPort.ts`, `translationBoundary.ts`) is contract/boundary
validation only: it constructs no `G2Scope`, provisions nothing, and stores no portfolio state, no
cache, and no mapping table in IRR. `translationBoundary.ts` refuses all client-supplied identity
keys (`userId`, `subject`, `companyId`, `runtimeCompanyId`, …) and derives a tenant hint only from
an already-trusted principal that does not currently exist in the no-auth baseline.

The minimum evidence needed before Portfolios can be admitted is a **D-2 §8 translation contract**
specifying, at minimum (per D-2 §8): source/target authorities and identifiers, mapping lifecycle,
provisioning authority, revocation authority, tenant boundary, ownership boundary, authorization
boundary, audit requirements, failure behavior, security/trust model, durable storage, and
package/API contract — covering concretely:

1. **Owner identity:** IRR F-3 owner (`owner-7f3a91c2`) ↔ G24 `applicationUserId`, including how an
   `(issuer, subject)` mapping is provisioned in a baseline that has no OIDC issuer (PR #61 removed
   authentication). **No translation table exists; none is invented here.**
2. **Tenancy:** IRR `irr-domain-4b82d6e1` ↔ G24 `TenantScope` / `tenant_memberships`, including who
   provisions and revokes the membership.
3. **Security identity:** `companyId` vs ISIN vs ticker/`symbol`. Current evidence is incompatible
   by construction: the IRR UI/fixtures use ticker-like values in a `companyId` field (e.g. `TCS`,
   `INFY` in `UserPortfolioDetail.test.tsx`), the G2 contract carries `symbol` (required) plus
   optional `companyId` and optional `isin` verbatim with IPD-owned value semantics, G24 holdings
   persist all three without a uniqueness contract, and the admitted PIT seam maps IRR `companyId`
   locally to `ISIN:<isin>:EQ` for a different purpose. **These identifiers are not interchangeable
   and no equivalence is assumed.**
4. **Persistence boundary:** G24 remains the durable store (IRR stores nothing); the
   `/api/user-portfolios/` dispatch (`P3`), commit `a0ab5a34` ratification (`P2`), and any G24
   promotion each require their own acts.

Failure behavior until then is **preserved**: HTTP 503 `owner-context-unavailable`, fail-closed on
any missing mapping or owner context, no inferred tenant, no data read or changed.

### 3.3 Hosting and admission boundary — what is already decided vs unproven

| Item | State |
|---|---|
| D-1 Option C domain ownership (portfolio = G24 line; artifact/report = pin line; distinct, non-interchangeable, neither promoted) | **DECIDED** (2026-10-06), reaffirmed by `REG-03` (2026-10-13) |
| NP-04 package/persistence boundary (pin line exposes `./persistence`; G24 is HTTP-only) | **PROVEN** from both `package.json` files (§2) |
| `AD-02` five-file PIT/D114 admission; `AD-01` Reports presence-only; `AD-03` G24 reference-only; `AD-04` consumer designation preserved | **DECIDED/effective** (G2-2, as clarified 2026-10-13) |
| Act `26061859…` scope: designates `arena/01a0e6d9` as the **only** promotion target for the accepted G24 Phase-A unit (`0dab122→6828155`, fast-forward) under a separate execution gate; expressly does **not** authorize `main` promotion, baseline promotion, or Reports/Watchlists/etc. | **PROVEN** from the act text (re-read 2026-10-13). It has since been satisfied at its own scope: `arena/01a0e6d9` already points at `6828155` |
| Act `26061859…` coverage of IRR PR #42 or of the IRR G-2 consumer commit `a0ab5a34` | **NOT ESTABLISHED** (`Q2`/`P2`) — the act's scope is the IPD Phase-A lineage only; no coverage is claimed here |
| IU-6 repin rationale (`0dab1221…` → `2e11fa3b…` as the IRR pin) | **UNPROVEN** — unrecorded in any act; no rationale is invented. The IRR-side seam comment ("previously pinned `0dab1221` predated NP-04…") records a *consequence* (consumption was impossible), not a governed repin decision |
| `src/persistence` convergence onto any single ref (incl. IPD `main`) | **UNPROVEN / NOT DECIDED** — blocked by the `src/persistence` path collision and D-1 §§7–9 (no identity/security/package reconciliation) |

---

## 4. PA disposition (AD-20)

Under the Program Authority's standing authority, the following **narrow, additive** disposition is
recorded. It closes only what the evidence proves and explicitly retains everything else.

### 4.1 Decided

1. **Both persistence refs and their historical evidence are preserved exactly as they stand:**
   `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (artifact/report domain) and
   `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (portfolio/tenancy domain). No merge, cherry-pick,
   re-pin, replacement, or promotion of either is authorized or implied.
2. **Domain-role and hosting conclusions are established as in §2–§3:** the two implementations are
   distinct domain stores that may coexist (D-1 Option C); the pin lineage is the authoritative
   Reports persistence boundary via `./persistence`; the G24 lineage is the portfolio persistence
   reference via its HTTP surface; **neither is on IPD `main`, and IPD `main` carries no
   `src/persistence` implementation.**
3. **Classification of the proven portion of AD-20 is closed:** the "two implementations of one
   responsibility" and "one is the successor of the other" readings are **rejected on evidence**
   (§2.3). AD-20's remaining open portion is restated precisely in §4.2.

### 4.2 Explicitly retained open (NOT decided here)

1. **Persistence convergence** — whether, and in what layout, the two domain stores may ever share
   one ref (including IPD `main`). Blocked by the `src/persistence` path collision and the absence
   of any D-1 §§7–9 reconciliation. *Consequence of leaving unresolved: neither lineage can be
   promoted; each consumer keeps its current separate boundary (package pin vs HTTP reference).*
2. **IU-6 repin rationale** — UNPROVEN. *Consequence: the pin's historical justification remains
   unrecorded; the pin stands on its current admitted scope (`AD-02`/`AD-01`) only, and no lineage
   claim beyond §2.1 may be made for it.*
3. **Act `26061859…` coverage of PR #42 / `a0ab5a34`** — NOT ESTABLISHED (`Q2`/`P2`). *Consequence:
   neither PR #42's runtime scope nor the G-2 consumer commit gains any promotion authority; both
   remain exactly as `AD-01`/`AD-04` bound them.*
4. **Reports D-2 §8 owner binding** (§3.1) and the **D-1 vs PR #42 `P1` reconciliation**.
   *Consequence: `/api/reports*` remains fenced at 503; Reports admission cannot proceed.*
5. **Portfolios D-2 §8 translation contract** — owner, tenant, and security-identifier contracts
   (§3.2). *Consequence: `/api/user-portfolios*` remains fenced at 503; Portfolio admission cannot
   proceed, and no `companyId`/ISIN/ticker equivalence may be assumed by any consumer.*

### 4.3 Minimum next gates (sequenced to avoid one oversized gate)

These gates are **defined, not authorized for implementation**, by this record. Each requires its
own explicit PA gate; none combines unrelated concerns.

| Gate | Scope (only this) | Acceptance criteria (all required) |
|---|---|---|
| **Gate A — Persistence Convergence Design** (evidence/design only; no code) | Decide whether the two domain stores will (i) remain on separate refs indefinitely, or (ii) converge onto a named ref in a specified layout resolving the `src/persistence` path collision, with a package/API reconciliation per D-1 §9 | Written design record citing both lineages' contracts; explicit layout and export map; qualification plan that re-runs `np04_governed_persistence` and the `g24_*` suites against the converged tree; explicit non-effect on `AD-02`'s pin until a separate re-pin act. **Neither Reports nor Portfolio admission depends on Gate A.** |
| **Gate B — Reports Owner Binding & Admission** | The D-2 §8 binding of the F-3 owner pair (or a decided Reports owner value) to the Reports `AuthenticatedOwner`, plus the `P1` (D-1 vs PR #42) reconciliation | Governed binding act naming source/target authorities and failure behavior; F-7 five-part qualification evidence incl. restart durability; UI no-auth port admitted separately. Until then the 503 fence stands |
| **Gate C — Portfolio Identity & Security-Identifier Contract** | The D-2 §8 translation contract of §3.2: owner ↔ `applicationUserId`, tenant ↔ `TenantScope`/membership provisioning & revocation, and the `companyId`/ISIN/`symbol` contract with uniqueness expectations | Governed contract covering every D-2 §8 element; provisioning/revocation authority named for the no-auth baseline; fail-closed behavior specified for every missing-mapping case; `P2`/`P3` disposed by their own acts. Until then the 503 fence stands and no identifier equivalence exists |

Gates B and C are independent of each other and of Gate A and may be taken in any order; no gate's
completion implies any other gate's outcome.

### 4.4 Non-authorizations (binding)

- No IPD application code, branch, tag, or ref is changed; no package pin is changed; no persistence
  store is altered, merged, or migrated.
- No Reports or User Portfolios route is activated; both remain at HTTP 503
  `owner-context-unavailable` until Gates B/C respectively are satisfied.
- No owner/tenant, `(issuer, subject)`, `companyId`/ISIN/ticker, or persistence mapping is created,
  inferred, or implemented.
- No claim is made that persistence convergence, production readiness, or product admission has
  been achieved. Decision-record completion ≠ convergence ≠ admission.

### 4.5 What cannot responsibly be decided from current evidence

A final persistence-convergence architecture **cannot** be decided now, and is not forced here.
Exactly what is missing: (i) a converged-tree layout resolving the `src/persistence` collision;
(ii) qualification evidence for both test suites against any converged tree; (iii) a D-1 §9
package/API reconciliation; (iv) for Portfolios, a provisioning model for G24 identity/membership
in the no-auth baseline; (v) any governed security-identifier equivalence. Recording a convergence
decision without (i)–(iii) would fabricate certainty; this record instead preserves the uncertainty
and bounds it to Gate A.

---

## 5. Evidence matrix

| # | Item | Classification | Evidence | Consequence if left unresolved |
|---|---|---|---|---|
| 1 | Pin lineage owns artifact/report persistence (`GovernedArtifactStore`, 5 ops, `./persistence`) | PROVEN + DECIDED | §2.1 source/`package.json` inspection; D-1 §3; `AD-01`/`AD-02` | — (established) |
| 2 | G24 lineage owns portfolio/tenancy persistence (migrations 001–002, HTTP surface) | PROVEN + DECIDED | §2.2 source/`package.json` inspection; D-1 §2; G-2; `AD-03` | — (established) |
| 3 | The two are distinct domain stores that may coexist; not interchangeable; neither a successor of the other | DECIDED (this record §4.1, on PROVEN facts) | §2.3 comparison; D-1 §4 zero-overlap finding | Misclassification would license an unsafe merge/substitution |
| 4 | Neither lineage is on IPD `main`; IPD `main` has no `src/persistence` | PROVEN | `git ls-tree` on `4d3e1cd…` (2026-10-13); ref tips re-verified | Any `main`-admission claim would be false |
| 5 | Both lineages descend from IPD `main` tip; merge-base `246cb94…`; neither contains the other | PROVEN | `merge-base` / `--is-ancestor` checks (2026-10-13) | — (established) |
| 6 | `src/persistence` path collision prevents promoting both to one ref as-is | PROVEN | Identical path, disjoint file sets (§2.3) | Convergence blocked until Gate A |
| 7 | IU-6 repin rationale (`0dab1221` → `2e11fa3b`) | UNPROVEN | No act records it (B2 §5; tracker §6.6) | Pin stands on admitted scope only; no lineage claim beyond §2.1 |
| 8 | Act `26061859…` authorizes G24 Phase-A promotion to `arena/01a0e6d9` only, by separate gate; prohibits `main` | PROVEN + DECIDED | Act text re-read 2026-10-13 (§3.3) | — (established; already satisfied at its scope) |
| 9 | Act `26061859…` covers IRR PR #42 / commit `a0ab5a34` | UNPROVEN (NOT ESTABLISHED) | Act scope is the IPD Phase-A lineage only (`Q2`/`P2`) | No promotion authority for PR #42 runtime scope or the G-2 consumer |
| 10 | Reports authoritative persistence boundary = pin lineage via `IIPS_NP04_DATABASE_PATH` | PROVEN + DECIDED | `persistence-port.ts` boundary record; D-1 §3 | — (established) |
| 11 | Binding of F-3 pair (`owner-7f3a91c2`/`irr-domain-4b82d6e1`) to Reports `(tenantId, userId)` | UNPROVEN (no D-2 §8 binding) | F-4 deferral; §3.1 inspection | Reports stays at 503 (Gate B) |
| 12 | D-1 vs PR #42 conflict (`P1`) | CONFLICTING (unresolved) | `AD-01` not-granted scope; tracker REG-11 | Reports runtime/UI admission blocked (Gate B) |
| 13 | IRR owner ↔ G24 `applicationUserId` / `(issuer, subject)` translation | UNPROVEN (no D-2 §8 contract) | D-2 §§6–8 exhaustive-search finding; §3.2 | Portfolios stay at 503 (Gate C) |
| 14 | IRR tenant ↔ G24 `TenantScope`/`tenant_memberships` provisioning & revocation in the no-auth baseline | UNPROVEN | G24 assumes OIDC + provisioned memberships; IRR has neither (PR #61) | Portfolios stay at 503 (Gate C) |
| 15 | `companyId` ↔ ISIN ↔ `symbol`/ticker equivalence & uniqueness | CONFLICTING evidence; equivalence UNPROVEN | §3.2(3): ticker-like `companyId` fixtures vs verbatim G2 fields vs PIT `ISIN:<isin>:EQ` mapping | No identifier may be translated; holdings identity unresolved (Gate C) |
| 16 | Reports & Portfolios fail-closed at 503 `owner-context-unavailable`, no data read/changed | PROVEN | `reports-transport.ts`, `user-portfolio-transport.ts`, `owner-context-unavailable.ts` on `main@6dac8bf` | — (preserved by §4.4) |
| 17 | Persistence convergence / IPD-`main` promotion of either lineage | DEFERRED (Gate A) | D-1 §§9–12; §4.5 missing evidence | Both refs preserved; consumers keep separate boundaries |
| 18 | Production use of either lineage | DEFERRED / out of scope | D-1, D-2, G2-2 non-production scope | No production claim may be made |

---

## 6. Validation performed (2026-10-13)

1. IRR baseline: worktree on `arena/148c5942-iips-review-recovered` at `6dac8bff…` (= `origin/main`);
   PR #76 merge `6c2c955…` and PR #77 merge `6dac8bff…` confirmed via GitHub API; no open PRs in
   either repository.
2. IPD refs re-verified by `git ls-remote` + object inspection: `main`, pin branch, both G24
   branches, `arena/01a0f839`; ancestry/`merge-base` and `src/persistence` tree/diff checks executed
   (§2); both `package.json` export maps read at each tip; act `26061859…` re-read at its commit.
3. IRR fences and seams read at `main@6dac8bf`: both transports, `owner-context-unavailable.ts`,
   `owner-context-carrier.ts` (F-3 pair), `reports/persistence-port.ts`,
   `user-portfolio/{userPortfolioContract, userPortfolioPort, translationBoundary}.ts`.
4. Scope check: this publication changes **only** this record and the canonical tracker (§7).
   No application, test, persistence, API, route, package, pin, or IPD file is changed; the 503
   fences are therefore byte-identical before and after.

**Not performed by design:** IPD or IRR application test suites (no application code changed);
live Reports/Portfolio runtime behavior (fenced — UNPROVEN by design, not admitted).

## 7. Publication

Published via a single narrowly scoped PR from `arena/148c5942-iips-review-recovered` to IRR
`main`, containing only this record and the tracker §7 update. The PR number, head, merge commit,
and post-merge verification are recorded in tracker §7 (self-referential coordinates are verified
live against `origin/main` after merge and reported in the completion response). No IPD ref is
touched by the publication.

---

*Recording agent: Arena Agent Mode — evidence investigation, preparation and verification only; no authority is rendered by the agent. Program Authority: Ramki. Disposition recorded 2026-10-13 (Asia/Calcutta).*
