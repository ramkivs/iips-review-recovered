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
- UI08 Reports is explicitly excluded: separate lineage, non-interchangeable, unaccepted unless
  separately decided, not promoted, not main-admitted.

## 11. Authority Exclusions

- Implementation authority: NOT GRANTED. Promotion authority: NOT GRANTED. Promotion executed: NO.
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
