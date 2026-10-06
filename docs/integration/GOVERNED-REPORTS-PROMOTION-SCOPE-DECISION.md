# IIPS — Governed Reports Promotion-Scope Decision

> **Record ID:** `GOVERNED-REPORTS-PROMOTION-SCOPE-DECISION-01`
> **Decision:** Promotion-scope bar for a FUTURE Governed Reports promotion (decision only)
> **Record type:** Governance decision — durably published; non-executable (grants no promotion,
> implementation, main-admission, deployment, or production authority)
> **Date:** 2026-10-06 (UTC)
> **Authority:** Ramki — Program Authority / application owner. This decision is rendered under Ramki's
> explicit authorization to proceed with the bounded promotion-scope decision for the already accepted
> Governed Reports capability.
> **Recording agent:** Arena Agent Mode — preparation and verification only; no authority is rendered by
> the agent.
> **Authoritative repository:** `ramkivs/iips-review-recovered`
> **Authoritative ref:** `refs/heads/main`

## 1. D-3 Basis

Governed Reports is ACCEPTED at qualified branch scope (D-3, IRR main merge
`e13e543abcfb72ff7a1d36801becbbf2dc1ff7a2`; record blob `3b24b9c9…`, verified unchanged). D-3 does not
authorize promotion. This act establishes the governance bar a future promotion must meet; it executes
no promotion.

- D-1 record blob `0c4f27b3…` and D-2 record blob `ec80ef89…` verified unchanged.
- Eligible source: branch `arena/01a0f1b3-iips-review-recovered`, tip
  `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b` (qualified commit
  `39dd43ebbd54767c4258513a5dfc2d9c1b861d28`; zero implementation drift).

## 2. Status

- **Promotion status:** NOT EXECUTED. **Main admission:** NOT GRANTED. **Implementation authority:**
  NOT GRANTED. Production: OUT OF SCOPE. Final convergence: NOT ESTABLISHED.
- Reports remains ACCEPTED / QUALIFIED BRANCH SCOPE / BRANCH-ONLY. `ACCEPTED FOR FUTURE PROMOTION
  SCOPE` is established; `ACTUALLY PROMOTED` remains NO.

## 3. Promotion Target

**NO PRE-EXISTING PROMOTION TARGET ESTABLISHED.** No durable governance record and no ref in either
repository names a promotion target (exhaustive search). No target is silently assumed.

This act establishes `refs/heads/main` of `ramkivs/iips-review-recovered` as the SOLE eligible future
promotion target, on the following evidence: it is the authoritative ref for all durable governance
publications (D-1, D-2, D-3); the Reports merge-base `19b42e7145eda89206a2a36b19e656b6e41b35d3` is an
ancestor of current main (`e13e543…`), so the lineage is structurally promotable toward it; and no
other candidate target exists in evidence. Any promotion toward any other ref requires a new decision.

## 4. Merge-Base Analysis

Merge-base (accepted Reports tip vs authoritative main): `19b42e7145eda89206a2a36b19e656b6e41b35d3`
(recomputed; ancestor of main). Beyond it the Reports branch carries 40 files (+9635/−22), including
modifications to 8 main-tracked files. Two shared security/executor files were also changed on main
since the merge-base:

1. `frontend/server/secured-executor.ts` — main-side: commit `b1db08c` (+39), additive runtime-company
   context insertion point preserving existing authentication. Reports-side: +180/−1, including a
   semantic change to the shared authentication path (tenant resolution `tenantForUser` →
   fail-closed `resolveTenant` wrapper) plus interface extension. Hunks are adjacent/overlapping;
   textual conflict is likely and the shared-path semantic change requires review. Reconciliation
   requires separate implementation authorization; neither side may be silently overwritten.
2. `frontend/server/executive-transport.ts` — main-side: commits `b489efd` + `d0c6f80` (+21),
   purely additive governed Macro read route (`/api/macro/`). Reports-side: +35 in the same
   server-handler region. No direct hunk overlap, but same-region adjacency requires semantic review
   to preserve both wirings.

Therefore promotion directly from the accepted branch is NOT allowed; a new promotion branch must be
constructed under a separate implementation act that reconciles these files. No rebase, cherry-pick,
or conflict resolution is authorized by this act.

## 5. Persistence Analysis

Required Reports persistence lineage: `src/persistence/*` (pure-add; absent on IPD main) plus the
package surface (`package.json` export/packaging entries, `tsconfig.pit-package.json`), at
`np04-governed-persistence-windows @ 2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (merge-base = IPD main
tip `4d3e1cd…`).

The persistence lineage additionally modifies 12 main-tracked files unrelated to Reports:
`package.json` (scripts/engines/exports beyond the persistence surface) and 11 market-data files
(`src/contracts/*`, `src/d114/*`, `src/pit/*`, `src/e2e/lineage_verifier.ts`) carrying additive
market-data changes. These unrelated changes MUST NOT be promoted with Reports. Isolation of the
required store changes is implementation work; the lineage as-is is unsuitable for promotion, and a
separate clean promotion artifact (or scoped isolation act) is required.

## 6. Conditional Evidence Bar

No durable governance record establishes whether separate-process restart/recovery or live-IdP
evidence is mandatory for promotion (all existing records require only that promotion be separately
authorized). **This act therefore establishes the criterion:**

- `PROMOTION ADMISSIBILITY` versus `CERTIFICATION / STRONGER QUALIFICATION` are distinct bars.
- Separate-process restart/recovery and live-IdP evidence are **NOT REQUIRED FOR PROMOTION
  admissibility** (D-3 accepted the implementation with these fenced as conditional; promotion moves
  code location and does not upgrade evidence), but **ARE REQUIRED FOR A STRONGER CERTIFICATION
  LEVEL**. Any future promotion record must carry the conditional status forward unchanged.
- Both evidence classes remain unproven unless independently executed. Nothing in this act certifies
  either.

## 7. Security Invariants

A future promotion candidate MUST preserve exactly: server-side Reports authorization semantics,
fail-closed behavior on every failure path (including store absence), the 401/403/404/400/405
behavior matrix, role checks, cross-owner existence hiding, and refusal of client-supplied identity,
tenant, CompanyId, and durable-identity claims.

## 8. Identity / Tenant Invariants

D-2 boundaries preserved exactly: domain-scoped identity/tenant authorities; principal-derived
Reports ownership; no equation of Reports identity with the G24 application-user identity; no
cross-repo identity mapping, tenant mapping, CompanyId mapping, or runtimeCompanyId binding; no
trust propagation; persistence ownership per D-1; package/API contracts unchanged.

## 9. Promotion Candidate Definition

A future promotion candidate MUST satisfy all of: source = the accepted Reports ref/commit above (or
a reconciled promotion branch derived from it under separate implementation authority); persistence
coordinates = the required store lineage above, isolated from unrelated changes; package coordinates
= the verified pin; target = `refs/heads/main` of IRR; permitted main-side reconciliation limited to
the documented shared files with both semantics preserved; forbidden = any unrelated change;
invariants = §§7–8; tests = the 228 tracked tests passing plus regression evidence for touched
shared files; evidence = recorded coordinates and reconciliation record; authority = a separate
promotion execution act; fail-closed conditions = §10.

## 10. Fail-Closed Conditions

Promotion execution is prohibited if: the candidate source differs from the accepted scope without
authorization; shared-file reconciliation is absent or unverified; unrelated changes are included;
any §7–§8 invariant changes; conditional evidence is presented as proven; target is not the eligible
ref; or the separate promotion execution act does not exist. Any violation fails closed: NO promotion.

## 11. Separate Acts Required

Before any promotion execution: (a) a promotion execution act naming scope/authority; (b) an
implementation act for shared-file reconciliation and promotion-branch construction; (c) a
persistence-isolation act (or clean artifact act); (d) regression evidence for touched shared paths.
Before stronger certification: (e) an evidence-execution act for restart/live-IdP proof.

## 12. Non-Scope

No actual promotion. No main admission. No implementation. No production. No convergence. No UI08,
family, or G24 disposition. No mapping, authority-creation, or trust act.

## 13. Durability

Publication coordinates (recorded after independent verification):

- Repository: `ramkivs/iips-review-recovered`
- Ref: `refs/heads/main`
- Baseline main: `e13e543abcfb72ff7a1d36801becbbf2dc1ff7a2`
- Branch: `governance/reports-promotion-scope`
- PR: `PENDING`
- Merge commit: `PENDING`
- Tree: `PENDING`
- Record path: `docs/integration/GOVERNED-REPORTS-PROMOTION-SCOPE-DECISION.md`
- Blob: `PENDING`
- SHA-256: `PENDING`
