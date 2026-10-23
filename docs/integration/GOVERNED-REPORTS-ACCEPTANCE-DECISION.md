# IIPS — Governed Reports Acceptance Decision

> **Record ID:** `D-3-GOVERNED-REPORTS-ACCEPTANCE-DECISION-01`
> **Decision:** D-3 — Governed Reports ACCEPTED at qualified branch scope
> **Record type:** Governance decision — durably published; non-executable (grants no implementation,
> promotion, main-admission, deployment, or production authority)
> **Date:** 2026-10-06 (UTC)
> **Authority:** Ramki — Program Authority / application owner. This decision is rendered under Ramki's
> explicit authorization to accept Governed Reports at the qualified branch scope, with
> separate-process restart and live-IdP evidence explicitly remaining conditional/unproven.
> **Recording agent:** Arena Agent Mode — preparation and verification only; no authority is rendered by
> the agent.
> **Authoritative repository:** `ramkivs/iips-review-recovered`
> **Authoritative ref:** `refs/heads/main`

## 1. Decision

Ramki ACCEPTS the Governed Reports implementation at its qualified branch scope. The implementation is
recognized as ACCEPTED within its bounded Reports domain and qualified branch scope.

## 2. Prerequisites

- D-1 Explicit Domain-Scoped Persistence Ownership — Option C: IRR main merge
  `561cc85fdbc929e68e798b1e97dda76a64262b9e`; record blob `0c4f27b3…` (verified unchanged).
- D-2 Domain-Scoped Identity/Tenant Authorities — Option B: IRR main merge
  `f89f1904d619eb7bad01db0e2ead4bcb5c91414d`; record blob `ec80ef89…` (verified unchanged).

## 3. Qualified Implementation

- Repository: `ramkivs/iips-review-recovered`
- Branch: `arena/01a0f1b3-iips-review-recovered`
- Qualified commit: `39dd43ebbd54767c4258513a5dfc2d9c1b861d28`
- Qualified tree: `3fdc29d6775022c8ea586c58cf9a6f0e613911d6`
- Current tip: `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b`
- Current tree: `0e25371229eff5cb8ae4e6bdc2615260ddf0629c`
- **Drift result: ZERO IMPLEMENTATION DRIFT** — the tip differs from the qualified commit only by the
  addition of the qualification record itself.

## 4. Qualification

32/32 qualification requirements PASS, per the final qualification record
(`docs/v3.0/g3-build/PROGRAM_v3.0_NP06_REPORTS_FINAL_QUALIFICATION.md` at the current tip), covering:
governed capability scope, cross-sector reporting, frozen engine-output consumption, canonical
artifact representation, principal-supplied identity, `(tenantId, userId)` ownership, server-validated
tenancy, no client identity override, no CompanyId dependency, deterministic reportKey, unchanged
canonicalization, golden-vector equivalence, durable UUIDv4 reportId, caller-identity rejection,
ownership immutability, version/append/supersession semantics, head/history semantics, the
five-operation persistence port, authoritative store resolution, and the 401/403/404/400/405 behavior
matrix. These facts are preserved exactly as evidenced; they are not upgraded beyond the evidence.

## 5. Tracked Tests

228/228 tracked Reports tests PASS (5 files: canonical 46, artifact 56, persistence 38, API 44,
transport 44), plus a clean typecheck. The full-regression baseline carries 2 failures declared
pre-existing and unrelated to Reports.

## 6. Persistence

Under D-1, artifact/report persistence belongs to the Artifact/Report Domain. The qualified Reports
persistence binding is `GovernedArtifactStore` via the verified package pin
`github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (branch
`np04-governed-persistence-windows`, export `./persistence`), resolved at runtime over a server-owned
SQLite database path with fail-closed absence behavior. This acceptance does NOT establish
`GovernedArtifactStore` as universal IIPS persistence.

## 7. Identity / Tenant

Under D-2, identity and tenant authorities remain domain-scoped. This acceptance recognizes the
Reports identity/tenant contract (principal-derived ownership, directory-resolved tenancy) within its
own bounded domain. It does NOT establish Reports user identity as equal to the G24 application-user
identity, and it creates no cross-repo identity mapping, no tenant mapping, no CompanyId mapping, and
no runtimeCompanyId binding.

## 8. Security

Acceptance rests on the evidenced server-side, fail-closed authorization behavior: authenticated
credential → tenant resolution → resource gate with role checks → principal-derived ownership →
persistence enforcement with cross-owner existence hiding; foreign-tenant claims refused; client
`userId` claims refused without echo; CompanyId keys prohibited; caller-supplied durable identity
rejected; closed route/method matrix. This acceptance extends to no other routes, repositories, or
capability lineages.

## 9. Conditional / Unproven Evidence

The following remain CONDITIONAL / UNPROVEN:

1. Separate-process restart/recovery evidence.
2. Live-IdP evidence.

These claims were declared/evidenced in the prior qualification material, but the relevant execution
harness was not committed as reproducible evidence; therefore they are NOT independently reproduced by
this acceptance, and this acceptance does NOT convert them into proven certification evidence. The
distinction between DECLARED / CONDITIONAL / UNPROVEN and INDEPENDENTLY VERIFIED is preserved. If
stronger qualification or certification is later needed, these items require separate evidence work.

## 10. Acceptance Scope and Status

- Acceptance scope: the current qualified Governed Reports branch scope only.
- Branch status: **REPORTS CURRENT STATUS: ACCEPTED / BRANCH-ONLY.**
- Current IRR main does NOT contain the Reports implementation; current IPD main does NOT contain the
  Reports implementation. Acceptance changes neither main.
  *Erratum E-1 (additive; see §13): accurate at publication (2026-10-06T20:31:38Z) and again at the
  current tip since 2026-10-13T13:39:38Z; false for the intervening period, during which the historical
  PR #42 merge (`47edf6f3…`, not a promotion act) placed the Reports domain on IRR `main`.*
- UI08 Reports is explicitly excluded: separate lineage, non-interchangeable, unaccepted unless
  separately decided, not promoted, not main-admitted.

## 11. Authority Exclusions

- Implementation authority: NOT GRANTED. Promotion authority: NOT GRANTED. Promotion executed: NO.
  *Clarification E-2 (additive; see §13): these statements stand. The PR #42 merge was not a
  promotion execution act and is not recorded as one.*
- Main admission: NOT GRANTED. Final convergence: NOT ESTABLISHED. Production: excluded.
- This acceptance does not constitute production eligibility, universal persistence admission,
  universal identity authority, live-IdP qualification, or independently reproduced process-restart
  certification. Any future promotion requires a separate governance act and separate authorization.

## 12. Durability

Publication coordinates (recorded after independent verification):

- Repository: `ramkivs/iips-review-recovered`
- Ref: `refs/heads/main`
- Baseline main: `f89f1904d619eb7bad01db0e2ead4bcb5c91414d`
- Branch: `governance/d3-reports-acceptance`
- PR: `PENDING`
- Merge commit: `PENDING`
- Tree: `PENDING`
- Record path: `docs/integration/GOVERNED-REPORTS-ACCEPTANCE-DECISION.md`
- Blob: `PENDING`
- SHA-256: `PENDING`

## 13. Errata and clarifications (additive; no new authority decision)

This section is additive. The original text above is retained, including the statement corrected
here, which is marked inline. No decision in §1, no scope in §10, and no exclusion in §11 is changed.
Nothing here is a new Program Authority decision, a promotion act, a main-admission act, or a
retrospective authorization of any event. It is the PA-directed H-4 erratum recorded in the G2-2
follow-on table (`IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` §8, H-4; the
related H-11 row names the same sentences of §11) and is issued on 2026-10-19 (actual date). The
disposition record is `docs/integration/IIPS_v3.0_H4_H16_HISTORICAL_AUTHORITY_ERRATA_RECORD_2026-10-19.md`.

### E-1 — Presence of the Reports implementation on IRR `main` (corrects §10, third bullet; H-4)

- **Statement as written:** "Current IRR main does NOT contain the Reports implementation; current IPD
  main does NOT contain the Reports implementation. Acceptance changes neither main."
- **Factual chronology (all UTC; all commits are ancestors of current IRR `main`):**
  1. `2026-10-06T19:57:09Z` — D-1 published to `main` (PR #38, merge `561cc85fdbc929e68e798b1e97dda76a64262b9e`).
  2. `2026-10-06T20:31:38Z` — this record (D-3) published to `main` (PR #40, merge `e13e543…`). The
     statement was **accurate** at that moment: the Reports implementation existed only on branch
     `arena/01a0f1b3-iips-review-recovered` (§3).
  3. `2026-10-06T20:49:21Z` — Promotion-Scope Decision published to `main` (PR #41, merge
     `0b961fecbe29ed643c86c1a223fc22ac6d30a115`): promotion NOT EXECUTED, main admission NOT GRANTED,
     "the separate promotion execution act does not exist … NO promotion" (its §10).
  4. `2026-10-06T21:09:33Z` — PR #42 ("Promotion candidate: Governed Reports onto current main
     (**DO NOT MERGE without promotion act**)"; body: "NOT authorized for merge — separate promotion act
     required") was merged to `main` as `47edf6f3db79c6c443caed148121406f33a158b7` (head
     `promotion/governed-reports-candidate@4906a6b71f5133d714f0f4c29c89dba22ded37f5`; 0 reviews,
     0 comments; 23 paths, including 10 `frontend/server/reports/` domain paths and the
     `reports-transport.ts` fence). From this moment the §10 statement was **false as to IRR `main`**.
  5. `2026-10-13` — REG-11 R4 evidence record (`IIPS_v3.0_REG11_R4_PR42_HISTORICAL_AUTHORITY_RECONCILIATION_2026-10-13.md`)
     established **Outcome B**: no promotion execution act has ever existed on any searched ref; the
     operative records in force at merge time (D-1 §11/§12/§15, this record's §11, the Promotion-Scope
     Decision) expressly withheld the operation the merge performed.
  6. `2026-10-13T13:39:38Z` — the Program Authority's **R4-B** disposition (prospective only;
     `IIPS_v3.0_REG11_R4_B_PA_DISPOSITION_AND_REMEDIATION_RECORD_2026-10-13.md`) was executed and
     published through PR #81 (merge `4b3d5866b9e8a8dcbfda18d8dcdef7e700e6ceeb`): the 10
     `frontend/server/reports/` paths were removed from `main`. From this moment the §10 statement is
     again **accurate as to the Reports domain implementation**.
- **Corrected reading of the statement today:** IRR `main` does not contain the Reports domain
  implementation (`frontend/server/reports/` is absent; verified at `main@00e67133…`, 2026-10-19). Three
  PR #42-originated paths remain on `main` by express R4-B retention: the fail-closed fence
  `frontend/server/reports-transport.ts` (blob `981470541812a64c733309f1debec75455d85bee`) and its two
  server-level tests; valid `/api/reports*` operations answer `503 owner-context-unavailable`. Their
  presence is retention under R4-B, not acceptance, admission, or promotion of Reports. IPD `main` has
  never contained the Reports implementation. The acceptance in §1 remains **ACCEPTED / BRANCH-ONLY**
  and its scope (§10, first two bullets) is unchanged.
- **What this erratum does not do:** it does not declare the 2026-10-06 merge to have been authorized,
  does not treat the merge as a promotion act, does not treat the R4-B remediation as having cured the
  original authority defect of the merge (the merge remains a recorded, never-ratified historical
  conflict — Outcome B), does not revert or rewrite any history, and grants no authority of any kind.

### E-2 — "Promotion executed: NO" (clarifies §11, first bullet; H-11, same correction surface)

- **Statement as written:** "Promotion authority: NOT GRANTED. Promotion executed: NO."
- **Clarification:** the statement is **correct and remains in force**. The PR #42 merge was a
  mechanically valid Git/GitHub event, not a promotion execution act under the Promotion-Scope Decision
  §10–§11; no such act exists. The merge therefore did not change "Promotion executed" from NO to YES; it
  created physical presence without authority, which R4 recorded as a conflict and R4-B remediated
  prospectively. No promotion of Governed Reports to any ref has been executed or authorized to date.
  "Any future promotion requires a separate governance act and separate authorization" (§11) stands.

### Note on §12 (not an erratum of this set)

The `PENDING` publication fields in §12 are self-referential placeholders written before the merge
(PR #40, merge `e13e543…`, record commit `cade02dc4543a23a5a99be64c03ffa1dd3d67c7f`); they do not indicate
unpublished status (same class as G1 record §10, E-1). They are outside the H-4/H-16 scope and are left
as written.
