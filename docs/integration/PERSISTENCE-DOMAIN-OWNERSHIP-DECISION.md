# IIPS — Explicit Domain-Scoped Persistence Ownership Decision

> **Record ID:** `D-1-PERSISTENCE-DOMAIN-OWNERSHIP-DECISION-01`
> **Decision:** D-1 — Option C — Explicit Domain-Scoped Persistence Ownership
> **Record type:** Governance decision — durably published; non-executable (grants no implementation,
> promotion, merge, deployment, or production authority)
> **Date:** 2026-10-06 (UTC)
> **Authority:** Ramki — Program Authority / application owner. This decision is rendered under Ramki's
> explicit authorization of D-1 Option C; the authorization is narrowly scoped to this governance decision.
> **Recording agent:** Arena Agent Mode — preparation and verification only; no authority is rendered by
> the agent.
> **Authoritative repository:** `ramkivs/iips-review-recovered`
> **Authoritative ref:** `refs/heads/main`
> **Publication baseline:** `a794c0fa4f98b0eb31f42e3a62e314c18aeff4ff`
> (tree `24b970f2679172582235fbc70699d1fa53ef33b1`)
> **Scope:** Portfolio persistence and artifact/report persistence. Non-production only.
> **Production:** OUT OF SCOPE — not accessed, not modified, not authorized.

---

## 1. Decision statement

The Program Authority decides:

1. Portfolio persistence is owned by the **PORTFOLIO DOMAIN**. The G24 persistence lineage is
   recognized as the evidence-backed portfolio persistence implementation lineage.
2. Artifact/report persistence is owned by the **ARTIFACT / REPORT DOMAIN**. The GovernedArtifactStore
   lineage is recognized as the evidence-backed persistence implementation lineage for the Governed
   Reports contract.
3. These are **DISTINCT PERSISTENCE DOMAINS**.
4. They are **NOT** declared to be interchangeable implementations.
5. Neither lineage is thereby declared the universal IIPS persistence foundation.
6. Neither lineage is thereby promoted to current main.
7. Neither lineage is thereby authorized for implementation changes.
8. No cross-domain identity mapping is established by this decision.
9. No tenant/company mapping is established by this decision.
10. No package/API reconciliation is established by this decision.
11. No security-boundary reconciliation is established by this decision.
12. Any future cross-domain integration requires a separately governed interface/adapter and separately
    authorized implementation work.
13. Existing branch/main status remains unchanged.

## 2. Portfolio domain — recognized lineage

- Repository: `ramkivs/iips-production-market-data`
- Branch: `refs/heads/arena/01a0e6d9-iips-production-market-data` @
  `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`
- Implementation: `src/persistence/*` (connection, bootstrap, configuration, migration runner with two
  migrations), `src/portfolio/durable-store.ts` (blob `1c23f259f580ba1992d3848d8c8d222bbf9a9e6a`),
  application-identity registry, OIDC authentication, HTTP server (`/api/ipd/*`)
- Storage: file-backed SQLite via the `better-sqlite3` driver; rollback-journal mode; full synchronous
  writes; foreign-key enforcement; single-statement and multi-step work in immediate transactions
- Governance record on the lineage tip: `evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md`
  (blob `45d016e8d0443994dd356625113c4be6ebfda50c`)
- Prior standing (preserved, not altered): branch-promoted to the stated branch with post-promotion
  acceptance recorded on `refs/heads/arena/01a0f839-iips-production-market-data` @
  `12c480b5bf5cfbe0f296fcd12c9189328b915417`; main admission explicitly prohibited by the recorded
  promotion-authority act.

## 3. Artifact / report domain — recognized lineage

- Repository: `ramkivs/iips-production-market-data`
- Branch: `refs/heads/np04-governed-persistence-windows` @
  `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`
- Implementation: `src/persistence/{db,store,identity,schema,reportKey,errors,package}.ts`;
  `GovernedArtifactStore` (blob `b4350fea5585800398e10e81039be60edc4697b2`); package boundary
  (blob `9376899940a7ac5070fbbda6ec7ad88737c37e22`); five governed operations
  (createInstance, appendVersion, resolveById, queryByOwner, listSupersededBy)
- Storage: file-backed SQLite via the built-in `node:sqlite` driver; write-ahead-log mode; full
  synchronous writes; foreign-key enforcement; append-only artifact table
- Package: `./persistence` subpath export, consumed by pinned dependency from the Governed Reports
  branch (`ramkivs/iips-review-recovered`, `refs/heads/arena/01a0f1b3-iips-review-recovered` @
  `6a8afbb`, package pin `#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`)
- Prior standing (preserved, not altered): branch-scoped; implementation authority bounded to the
  Reports consumer contract; no qualification, acceptance, or promotion act; no main admission.

## 4. Domain boundary — why the domains are distinct

The completed read-only investigation established, by exhaustive search across all refs and history of
both repositories: zero shared object models, schemas, tables, identifiers, repository interfaces,
package interfaces, cross-store adapters, conversion functions, migration paths, API bridges, or runtime
calls between the lineages. The G24 lineage persists portfolio entities (portfolios, revisions, holdings,
contributions, events) with a managed identity/membership model; the artifact lineage persists
content-addressed versioned report artifacts (deterministic content keys, minted instance identifiers,
version chains, supersession) with caller-supplied ownership pairs. A main-resident investigation record
diffs the two lines at 50 files (+1,842/−8,184 lines), with the artifact line deleting the entire G24
server/authorization/authentication surface. They share only the word "persistence" and the SQLite
storage family (via different drivers and journal modes). Distinct entities, disjoint contracts:
distinct domains.

## 5. Evidence basis

This decision rests on the D-1 evidence investigation, whose preserved findings include: the exhaustive
zero-overlap result above; materially different persistence contracts (portfolio revisions/holdings vs
artifact keys/versions/supersession); different identity models (resolved provisioned application users
with revocable SQL memberships vs accepted caller-supplied ownership pairs); different authorization
models (membership-authority scope checks vs owner-equality only); no governed cross-repository identity
mapping on any ref; no prior ownership-selection or supersession act on any ref; G24 promotion explicitly
excluding main admission; the artifact lineage remaining branch-scoped. Coordinates: §2–§3 of this record;
main-resident architectural direction vesting the portfolio domain in the market-data repository
(technology-neutral); main-resident per-workstream membership determination (membership not established —
unchanged by this decision).

## 6. Evidence distinctions (preserved exactly)

    IMPLEMENTATION ≠ OWNERSHIP
    QUALIFICATION ≠ ACCEPTANCE
    ACCEPTANCE ≠ PROMOTION
    PROMOTION ≠ MAIN ADMISSION
    MAIN ADMISSION ≠ CONVERGENCE
    DURABLE PERSISTENCE ≠ UNIVERSAL PERSISTENCE
    DOMAIN OWNERSHIP ≠ IDENTITY MAPPING
    DOMAIN OWNERSHIP ≠ IMPLEMENTATION AUTHORITY

Recognition of an implementation lineage in §2–§3 confers ownership standing only. It confers no
qualification, acceptance, promotion, admission, mapping, or implementation status beyond what prior
records already establish (cited in §2–§3 and unchanged).

## 7. Identity boundary

No cross-domain identity mapping is created or authorized by this decision. The G24 application-user /
membership identity regime and the artifact-store caller-supplied ownership-pair regime remain
unmapped and non-interchangeable. Any future mapping requires a separately governed decision and,
if it touches code, separately authorized implementation work.

## 8. Security boundary

No shared security boundary is created or authorized by this decision. The G24 membership-authority
enforcement and the artifact-store owner-equality enforcement remain separate; neither is extended to
the other; no audience, credential-path, or enforcement reconciliation is established.

## 9. Package/API boundary

No package/API reconciliation is created or authorized by this decision. The G24 HTTP-only surface and
the artifact-store `./persistence` package subpath remain as they are; no export is added or removed; no
pin is altered; no consumer is migrated.

## 10. Implementation status

No implementation authority granted. No source, schema, database, API, package, dependency, identity,
tenant, security, browser, test, or configuration change is authorized by this decision.

## 11. Promotion status

No promotion authority granted. Neither persistence lineage is promoted by this decision, to any ref.

## 12. Main status

No mainline admission created by this decision. The main refs of both repositories are unaffected in
capability content; existing branch/main status remains unchanged.

## 13. Convergence status

This decision does not establish final convergence readiness. It resolves ownership only; tenancy,
identity mapping, acceptance, promotion, and convergence determinations remain open under their own
governance.

## 14. Future integration

Any bridge, interface, adapter, façade, or migration path between the portfolio persistence domain and
the artifact/report persistence domain requires a separately governed interface decision and separately
authorized implementation work under its own execution gate. This decision pre-authorizes none of it.

## 15. Explicit exclusions

This decision does NOT authorize: persistence implementation; persistence refactoring; schema changes;
database changes; API changes; package changes; dependency changes; identity mapping; tenant mapping;
security changes; browser changes; promotion; main capability admission; merge of implementation
branches; final convergence; final shell selection; production deployment; production activation.

## 16. Downstream impact

Decisions that may now use D-1 as an established prerequisite: canonical tenancy source/binding (the
surviving tenancy sources are now fixed: managed memberships for the portfolio domain, caller
principals for the artifact domain); the durable-portfolio bridge scope (target domain fixed);
identity-mapping content (whether any mapping is needed, and between which regimes); the Reports
persistence-admission dependency scope; G24 admission-path role; convergence candidate-set validity.
Each remains separately undecided and requires its own explicit act.

## 17. Durability

Authoritative repository: `ramkivs/iips-review-recovered`. Authoritative ref: `refs/heads/main`.
Publication branch: `governance/d1-persistence-ownership-option-c` (from publication baseline above).
This record is additive: it amends, rewrites, and supersedes no existing record. Merge commit, tree,
blob, and SHA-256 coordinates are established by the publication merge and recorded in the publication
verification report.
