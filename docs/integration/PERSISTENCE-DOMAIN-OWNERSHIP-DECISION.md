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
*Clarification E-1 (additive; see §18): this standing was not superseded by the later PR #42 merge
(`47edf6f3…`, 2026-10-06T21:09:33Z); that merge conflicted with §11, §12 and §15 (REG-11 R4, Outcome B)
and was remediated prospectively by R4-B on 2026-10-13. It was never a promotion act and has never been
ratified.*

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

## 18. Errata and clarifications (additive; no new authority decision)

This section is additive. The original text above is retained unchanged; the clarified passage is
marked inline. No decision in §1 and no exclusion in §15 is changed. Nothing here is a new Program
Authority decision, a promotion act, a main-admission act, or a retrospective authorization of any
event. It is the PA-directed H-16 erratum recorded in the G2-2 follow-on table
(`IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` §8, H-16) and is issued on
2026-10-19 (actual date). The disposition record is
`docs/integration/IIPS_v3.0_H4_H16_HISTORICAL_AUTHORITY_ERRATA_RECORD_2026-10-19.md`.

### E-1 — D-1 standing versus the PR #42 merge (clarifies §3, §11, §12 and §15; H-16)

- **Standing as written:** no promotion (§11), no mainline admission (§12), and no "promotion; main
  capability admission; merge of implementation branches" (§15) are authorized by this decision, for
  either persistence lineage. §3 records the Reports consumer of the artifact/report lineage as
  branch-scoped with "no main admission".
- **The later event:** this decision was published to IRR `main` at `2026-10-06T19:57:09Z` (PR #38,
  merge `561cc85fdbc929e68e798b1e97dda76a64262b9e`; record blob `0c4f27b365c47839ec66f4ec6b34ec1c0f72ad2a`,
  unchanged since). At `2026-10-06T21:09:33Z`, 72 minutes later, PR #42 — titled "Promotion candidate:
  Governed Reports onto current main (**DO NOT MERGE without promotion act**)", body "NOT authorized for
  merge — separate promotion act required", 0 reviews, 0 comments — was merged to `main` as
  `47edf6f3db79c6c443caed148121406f33a158b7` (head `promotion/governed-reports-candidate@4906a6b7…`). The
  merge placed the 13 Reports paths on `main`, consumed the `./persistence` subpath of the
  artifact/report lineage at pin `2e11fa3b…` from `main`, and re-pinned `frontend/package.json` from
  `0dab1221…` to `2e11fa3b…` — each an operation that §11/§12/§15 withheld. D-1 preceded the merge and is
  an ancestor of it; the merge did not amend, supersede, or cite D-1.
- **Reconciliation (recorded, not newly decided):**
  1. The REG-11 R4 evidence record (`IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md`,
     published through PR #81) established **Outcome B — existing authority conflict**: no promotion
     execution act has ever existed on any searched ref of either repository; no operative act covers or
     later ratifies the merge; D-1 §11/§12/§15, D-3 §11 and the Promotion-Scope Decision expressly
     withheld it. The merge is **not** a valid promotion act and is **not** inferred to be one.
  2. The Program Authority rendered **R4-B — Remediation, prospective only**
     (`IIPS_v3.0_REG11_R4_B_PA_DISPOSITION_AND_REMEDIATION_RECORD_2026-10-13.md`), executed and
     published through PR #81 (merge `4b3d5866b9e8a8dcbfda18d8dcdef7e700e6ceeb`, 2026-10-13T13:39:38Z):
     the 10 `frontend/server/reports/` paths were removed from `main`; the fail-closed fence, the package
     pin `2e11fa3b…` (admitted separately for `./pit` / `./d114-non-production` only, under AD-02), and
     paths superseded by later authorized work were retained as approved. R4-B states on its face that
     it "does NOT retroactively authorize the 2026-10-06 merge of PR #42".
  3. **Resulting relationship, stated explicitly:** D-1 **coexists with and is not superseded by** the
     PR #42 event or by R4-B. Its §11/§12/§15 standing is in force unchanged and, since R4-B, is again
     reflected at the authoritative tip for the artifact/report lineage (no `./persistence` consumer edge
     exists on `main`; `frontend/server/reports/` is absent — verified at `main@00e67133…`, 2026-10-19).
     The 2026-10-06 merge remains a recorded historical conflict whose authority defect was **never
     cured**: it was remediated prospectively, not ratified, reverted or rewritten. R4-B's prospective
     remediation is not evidence that the original operation was authorized.
- **§3 reference to branch `arena/01a0f1b3-iips-review-recovered @ 6a8afbb`:** that branch remains
  off-`main` (`6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b` is not an ancestor of `main`; 28 branch-only
  commits as of 2026-10-19). Its contents are not current-`main` authority and are not treated as such.
  The §3 "Prior standing" line (branch-scoped; no promotion act; no main admission) remains accurate.
- **What this erratum does not do:** it does not authorize, ratify, revert or remediate anything; does
  not change either persistence lineage, the NP-04 pin, or the portfolio domain; does not reopen REG-11
  R1/R2 (Option C), R3, R4 (closed as a gate under R4-B), Gate A or Gate C; and makes no finding about
  any individual's intent or conduct. Reports and User Portfolios remain fail-closed at source level
  (`503 owner-context-unavailable`).
