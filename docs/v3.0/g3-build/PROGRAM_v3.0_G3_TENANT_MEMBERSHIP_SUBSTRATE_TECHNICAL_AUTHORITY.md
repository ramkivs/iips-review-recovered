# IIPS v3.0 — G3 Tenant Membership Substrate: Technical Authority Decision

## Technical Decision Record (D1–D6)

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G3-B-SUBSTRATE — Tenant Membership Backing-Store Technical Authority

**Document type:** TECHNICAL DECISION RECORD — selects the substrate, jurisdiction, membership
data contract, and implementing-authority class for the IRR tenant-membership store.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority (technical substrate decision)

**Branch:** `arena/01a0f1b3-iips-review-recovered`

**IRR baseline:** `ramkivs/iips-review-recovered`
`main@5ad7812bbe11acfc66e0b0e50c041fddaa63c20f` (tree `c44960185e1d7be7b67a6e6198bec3346fb53dfc`)

**Record branch tip at authoring:** `378cd8c4be4359685cba222b040f18e0511c5af1`
(tree `6060261dd7c8fcabd94ad13da7dbeaca676d8c56`)

**Governance inputs (unchanged, not reopened):**

- `docs/v3.0/g3-build/PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_GOVERNANCE_DECISION.md`
  (commit `378cd8c4be4359685cba222b040f18e0511c5af1`, blob
  `37c852206126f9770876fa6a81c935760cb38c84`) — the Program Authority tenant-membership governance
  decision.
- `docs/v3.0/g3-build/PROGRAM_v3.0_G3_PRODUCT_TENANT_REGISTRY_AUTHORITY.md` (commit `ab1c5fb9…`).
- NP-04 compatibility investigation, decision **C (NP-04 CANNOT SERVE)**, recorded in §3.

**IPD reference only:** `ramkivs/iips-production-market-data`
`np04-governed-persistence-windows@d61ff9c097feb1be8a086f737f78b314ef6cdb10`
(tree `fb1d5c667f8bf76a2a0d4a3f23a0296df25f8edb`)

---

> **No implementation is authorized or performed by this record.** This record selects a
> substrate and defines a contract. It does not implement, wire, verify, or certify
> `TenantDirectory`, and it does not satisfy NP-06 **P1.1**.

## 0. State separation

| State | Status |
|---|---|
| Technical substrate selected | ✅ **D1, D2, D3, D4 decided** (§4–§7) |
| NP-04 relationship recorded | ✅ §8 |
| **Implementation authority (G3-B)** | ❌ **WITHHELD** — §9 |
| Implementation | ❌ NOT PRESENT |
| Wiring | ❌ NOT PRESENT |
| Verification | ❌ NOT PERFORMED |
| Certification / P1.1 | ❌ NOT PERFORMED |

## 1. Authority recheck (no duplicate created)

All authoritative IRR refs were searched (`main`, `origin/main`, `origin/HEAD`,
`arena/01a0f1b3-iips-review-recovered`, `origin/arena/01a0f1b3-iips-review-recovered`).

| Search | Result |
|---|---|
| Prior tenant-membership schema decision | **NONE** |
| Prior server-side membership service designation | **NONE** (no `MembershipAuthority` / `TenantDirectoryService` anywhere) |
| Prior tenant-membership *technical* decision | **NONE** — only the governance decision at `378cd8c4…`, which deliberately left technology unselected (§4 of that record) |
| Prior database/storage **technical** authority | **NONE for tenant membership.** `NP-12-N4-*` records are Screen-Definition governance (and match only on unrelated "sqlite/byte grammar" text). `IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md:113` states *"The storage technology is intentionally **not prescribed**"* and its authority is scoped to the **user-portfolio domain in IPD**, not product identity. |
| NP-04 authority | `IIPS_v3.0_NP04_COMMON_GOVERNED_PERSISTENCE_IMPLEMENTATION_AUTHORITY.md` — governed persistence capability, IPD-only, non-production |

**Conclusion:** no equivalent technical decision exists. This record is new and additive. It does
not amend, supersede, or reinterpret any prior record, and it does not reopen D115, NP-04, NP-06,
R1–R5, C1–C4, IU-7, or IU-8.

## 2. IRR substrate investigation (documented facts only)

| Fact | Evidence |
|---|---|
| IRR has **no** existing database or persistence layer | No `node:sqlite` import anywhere in IRR (`git grep node:sqlite` → only prose in the G3 governance record); no store/registry/persistence module under `iips-platform/src/` |
| `iips-platform` has **zero runtime dependencies** | `iips-platform/package.json` — `devDependencies` only (`typescript`, `tsx`, `@types/node`); no `dependencies` block |
| `frontend` runtime deps are React + IPD only | `frontend/package.json` — `react`, `react-dom`, `react-router-dom`, `iips-production-market-data` |
| **Documented Node baseline is v20 LTS** | `ies-011-energy/ENERGY_RELEASE_REPRODUCIBILITY_RECORD.md` — *"| Node version | v20 LTS |"*; `program-v1.1-certification/PROGRAM_v1.1_TRACK4_PERFORMANCE_CERTIFICATION.md` — *"| Node version | v20.20.2 |"* |
| No Node `engines` pin, no CI workflow, no `.nvmrc` | `package.json` files carry no `engines`; no `.github/workflows`, `.nvmrc`, or `.node-version` exist |
| `node:sqlite` is **unavailable on the documented baseline** and **experimental** where available | Added in Node 22.5.0; emits `ExperimentalWarning: SQLite is an experimental feature` on the current v22.22.3 runtime |
| Governed server-side mutation precedents are in-process runtime classes | `mutation-authority-map.md:11–23` — `DataGovernanceRuntime.classify`, `DeterministicWorkflow.define`, `PluginMarketplace.certify`, `CloudHaRuntime.markDown`, `MarketDataSource.snapshot` — all authorization by `EnterpriseRuntime`/`ApiSecurity`, risk-classed HIGH/DESTRUCTIVE |

## 3. NP-04 finding carried forward (not reopened)

Decision **C — NP-04 CANNOT SERVE** stands on two independent grounds:

1. **Inverted responsibility.** NP-04 *consumes* an already-authenticated `(tenantId, userId)`
   (`identity.ts:34` — *"expected to originate from the authenticated principal"*) and never
   resolves `userId → tenantId`. Tenant membership must *produce* that pair.
2. **Lifecycle conflict.** `governed_artifacts` is append-only **at the storage layer**
   (`governed_artifacts_no_update` / `_no_delete` triggers `RAISE(ABORT)`), while tenant membership
   requires mutation.

The engine, transactions, migrations, and durability of NP-04 are sound. The incompatibility is
**contract and jurisdiction**, not technology.

## 4. D1 — TECHNOLOGY (DECIDED)

### 4.1 Option comparison

| Candidate | Technical fit | IRR compatibility | Mutation support | Durability | Authority status |
|---|---|---|---|---|---|
| **`node:sqlite`** | Strong (SQL, transactions, constraints) | ❌ **Unavailable on documented Node v20 baseline; experimental where present** | ✅ | ✅ | ❌ Would require a Node baseline change |
| IPD `node:sqlite` substrate (NP-04) | ❌ C: contract + lifecycle incompatible | ❌ IPD-only; §3 forbids IPD→IRR sync | ❌ append-only | ✅ | ❌ Explicitly excluded |
| IPD `src/identity/mapping_store.ts` | ❌ `companyId`-keyed market-data identity | ❌ IPD | n/a | ❌ in-memory (`private mappings: []`) | ❌ Out of domain |
| IPD `src/pit/pit_store.ts` | ❌ market-data | ❌ IPD | n/a | ❌ in-memory `Map` | ❌ Out of domain |
| IRR `SnapshotStore` | ❌ in-memory engine goldens | ✅ | ❌ | ❌ | ❌ Out of domain |
| Keycloak as store | ❌ Prohibited | ❌ | — | — | ❌ `keycloak-architecture.md:81,98` |
| **Filesystem-backed durable store (Node `fs`, checksummed, atomic)** | ✅ Adequate for `userId → tenantId` | ✅ **Zero new dependencies; uses the documented Node v20 baseline** | ✅ | ✅ with atomic write + checksum | ✅ **No dependency, no baseline change** |
| External DB (Postgres/MySQL) | Strong | ❌ Introduces infrastructure + dependency | ✅ | ✅ | ❌ Production infrastructure — **OUT OF SCOPE** |

### 4.2 Decision

**The IRR tenant-membership store is a filesystem-backed, server-side durable store using the
Node `fs` module, with atomic replace and content checksums.**

Rationale, restricted to documented facts:

1. **It is the only candidate that requires no new dependency and no Node baseline change.** IRR's
   documented baseline is Node v20 LTS; `node:sqlite` does not exist on that baseline and is
   experimental on newer ones.
2. **It satisfies the actual contract.** The requirement is a small, single-relation lookup
   (`userId → tenantId`) with unique membership, explicit mutation, integrity, and restart
   durability — not query analytics, concurrency-heavy relational work, or cross-process
   transactions. A checksummed file store meets this without over-engineering.
3. **It introduces no new authority surface.** No new infrastructure, service, or production
   dependency is created.
4. **It does not adopt NP-04's technology merely because NP-04 exists.** The comparison above is
   capability-driven; `node:sqlite` was rejected on documented baseline and stability grounds,
   not on NP-04's account.

**Explicitly NOT selected:** `node:sqlite` (recorded as a *candidate for reconsideration* only if
and when the Program Authority raises the IRR Node baseline above 22.5 and accepts an
experimental-API dependency); any external database; any IPD substrate.

## 5. D2 — JURISDICTION (DECIDED)

**The authoritative tenant-membership store resides in IRR**
(`ramkivs/iips-review-recovered`).

**IPD / NP-04 is excluded, for these recorded reasons:**

1. **Destination.** NP-04's authority record §3 designates the *authorized implementation
   repository* as `ramkivs/iips-production-market-data`, environment **NON-PRODUCTION**, and
   states *"No Arena→IPD push, IRR→IPD synchronization, or IPD→IRR synchronization is required or
   permitted by this record."*
2. **Ownership mismatch.** The G3 governance decision places tenant-membership ownership in
   **IIPS/IRR** (§2 of that record). G2's decision assigns IPD the *user-portfolio* domain and its
   persistence boundary — **not** product-tier identity. Tenant membership is neither.
3. **Domain mismatch.** IPD is the market-data platform. Its identity surfaces are `companyId`-
   keyed market-data mappings (D115-adjacent), not product `userId → tenantId`.
4. **Contract mismatch.** §3 of this record.

## 6. D3 — MEMBERSHIP DATA CONTRACT (DECIDED — minimum)

Minimum technical contract for the store. Each element traces to the established governance; no
additional business lifecycle semantics are invented.

| # | Requirement | Specification | Source |
|---|---|---|---|
| 1 | **Unique user membership** | At most one authoritative tenant per `userId`. Enforced by primary key on `userId`. | G3 §4 |
| 2 | **Lookup** | `resolveTenant(userId) → tenantId \| null`. Never returns a default, fallback, or "first" tenant. | G3 §4, §6 |
| 3 | **Assignment** | Server-side `assign(userId, tenantId)`. Creates the membership. | G3 §3 |
| 4 | **Revocation** | Server-side `revoke(userId)`. Removes the membership; subsequent lookup fails closed. | G3 §3, §6 |
| 5 | **Reassignment** | **NOT PERMITTED by this record.** See the reserved decision below. | — |
| 6 | **Integrity** | Non-empty `userId`; `tenantId` non-empty; no `companyId`/`runtimeCompanyId`; malformed file or checksum mismatch ⇒ **fail closed**, never a partial read. | G3 §4, §8 |
| 7 | **Transaction semantics** | Single-relation store; each mutation is atomic — write to a temporary file, checksum, then atomic rename. A failed write leaves the prior state intact. | NP-04 precedent (transactionality) adapted to the selected technology |
| 8 | **Fail-closed lookup** | Unresolvable membership ⇒ denial (`AuthError(401)` at `secured-executor.ts:41`). Absence of the store is a denial, never a fallback to `ADMIN_DIRECTORY`. | G3 §5, §6 |
| 9 | **Server-side ownership** | The store is written to only by the authorized IIPS server-side authority (§7). Reads are server-side. | G3 §3 |
| 10 | **Restart durability** | A committed assignment survives process and application restart. | G3 §5 |

### 6.1 Reserved decision — reassignment and revocation semantics

**Reassignment semantics are NOT decided here.** Allowing a `userId` to move between tenants is a
**tenant-migration policy** with identity, audit, and cross-tenant data consequences, and no
existing record establishes it. This record therefore defines `assign` and `revoke` as the
mutation primitives and **reserves** whether `revoke` followed by `assign` constitutes a permitted
reassignment. **That reservation requires a separate Program Authority decision before any
reassignment behaviour is implemented.**

Revocation itself *is* decided (§6.4) because fail-closed lookup (§6.8) requires that a removed
membership stops resolving.

## 7. D4 — IMPLEMENTING AUTHORITY (DECIDED — class, not instance)

**The owning component class is an IIPS server-side, governed runtime authority in
`iips-platform`, authorized through the existing `EnterpriseRuntime` / `PlatformApi.ApiSecurity`
chain, consistent with `keycloak-architecture.md:58`** (*"No parallel authorization primitives"*).

Requirements on that component, whatever it is ultimately named:

1. It is **server-side** and lives in the transport/platform tier, never the React bundle.
2. It performs membership mutation **only** after `EnterpriseRuntime`/`ApiSecurity` authorization
   and governed audit, exactly as `mutation-authority-map.md:11–23` requires of every existing
   governed mutation.
3. It is risk-classified. Per `mutation-authority-map.md`, *Create/edit/delete tenant* is currently
   **UNAVAILABLE** and §19 forbids implementing an unsupported mutation — **so this record does
   not itself lift that entry.**
4. `TenantDirectory.tenantForUser(userId, candidateTenant)` is implemented as a **read** against
   this store, satisfying the existing interface at `secured-executor.ts:16`. It never falls back
   to `ADMIN_DIRECTORY` outside explicit test mode.

**A concrete service name is NOT invented here.** No prior architecture establishes one. Naming
the component requires a separate authority act (§9, dependency G-2), because the name and its
authorization surface are part of the governed contract, not an implementation detail.

## 8. D5 — NP-04 RELATIONSHIP (RECORDED)

- **NP-04 remains a separate common governed persistence substrate.** It is **not** the
  tenant-membership store and is **not** amended by this record.
- The two substrates remain independent: separate repositories, separate lifecycles, separate
  purposes (governed artifact persistence vs product identity membership), and different
  lifecycle semantics (append-only vs mutable).
- **No cross-repository reuse is required**, so no NP-04 amendment is made. This is the default
  outcome required by D5 and it is preserved deliberately.
- NP-04's frozen tree `fb1d5c66…` and its certified behavior are untouched.

## 9. D6 — G3-B IMPLEMENTATION AUTHORITY STATUS

### **WITHHELD.**

D6 permits granting implementation authority only when *all five* preconditions are resolved.
Four of five are met:

| Precondition | Status |
|---|---|
| Technology selected | ✅ D1 — filesystem-backed durable store (§4.2) |
| Jurisdiction established | ✅ D2 — IRR (§5) |
| Membership contract sufficiently defined | ⚠️ **PARTIAL** — §6 defines 9 of 10 elements; **reassignment semantics reserved** (§6.1) |
| Mutation authority identified | ⚠️ **PARTIAL** — class defined (§7), but the **concrete service is not designated**, and `mutation-authority-map.md` still records tenant lifecycle **UNAVAILABLE** |
| Required governance dependencies resolved | ❌ **NOT MET** — see below |

**Outstanding dependencies (all three must close before G3-B implementation authority can be granted):**

- **G3-DEP-1 — Reassignment policy decision.** Program Authority must decide whether
  `revoke` + `assign` constitutes a permitted tenant reassignment (§6.1).
- **G3-DEP-2 — Implementing service designation.** A separate authority act must designate the
  concrete IIPS server-side component and its authorization surface (§7).
- **G3-DEP-3 — `mutation-authority-map.md` disposition.** The map still records
  *Create/edit/delete tenant* and *Create/disable/lookup user* as **UNAVAILABLE** with §19
  *"DO NOT IMPLEMENT IT"*. The G3 governance record deliberately did not amend it. Before
  membership mutation can be implemented, Program Authority must decide whether to amend the map
  for this bounded capability or to authorize the store as a read-mostly resolver whose mutation
  path is separately gated.

Granting implementation authority now would violate D6's own preconditions.

## 10. Constraint check

| Constraint | Status |
|---|---|
| Does not modify `Principal` | ✅ `{ userId, tenantId, roles }` unchanged (§6) |
| Does not introduce `companyId`/`runtimeCompanyId` | ✅ explicitly excluded (§6.6) |
| Does not make Keycloak the tenant-membership authority | ✅ Keycloak remains identity authority only |
| Does not reuse `ADMIN_DIRECTORY` as production | ✅ §7.4 forbids fallback to it |
| Does not modify NP-04 | ✅ §8 — no amendment |
| Does not modify `ReportingEngine` | ✅ untouched |
| Does not create `/api/reports` | ✅ untouched |
| Does not implement Reports | ✅ untouched |
| Does not reopen IU-7 / IU-8 | ✅ untouched |
| Does not reopen D115 | ✅ untouched |
| Does not perform production work | ✅ non-production scope only |

## 11. NP-06 consequence

**P1.1 = NOT SATISFIED.** No `TenantDirectory` is implemented, wired, or verified. This record
resolves the substrate question only; it changes no NP-06 status and authorizes no Reports work.
