# IIPS v3 — Q1 Portfolio Decision Act (Stage 4, CV-20)

**Record ID:** `IIPS-V3-Q1-PORTFOLIO-DECISION-ACT-2026-10-22`  
**Record type:** Program Authority decision — durably published; grants bounded implementation authority only  
**Date:** 2026-10-22 (UTC)  
**Authority:** Ramki — Program Authority / application owner  
**Recording agent:** Arena Agent Mode — preparation and verification only; no authority is rendered by the agent  
**Authoritative repository:** `ramkivs/iips-review-recovered`  
**Authoritative ref:** `refs/heads/main`  
**Related act:** `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` (EFFECTIVE, PR #148)  
**Related disposition:** Q1-b ownership-source designation (separate record)

---

## 1. Decision statement

The Program Authority decides:

1. **Authorize the qualification act** for the already-implemented, unadmitted durable portfolio line at current `main`, per `G-2` §3 and the existing readiness record (V16).
2. **Authorize a bounded residual implementation act** limited to what the existing records leave unbuilt: durable persistence behind IPD `main`'s in-memory `PortfolioStore` (CV-39) and the wiring of an admitted store, each inside the `G-2` §5 additive boundary and the Gate 3 act §4/§5 file manifests.
3. **Authorize the Q1-b ownership-source designation** (separate record): the IPD-owned single `ACTIVE` `local_principal_bindings` row consumed exclusively by the IPD-owned, single-principal, same-host IPC endpoint under `L-IPC-1` revision 2, as designated under CV-20 Option A.

---

## 2. What this act does NOT authorize

| Item | Reason |
|---|---|
| Admission of any lineage to `main` | Admission is Stage 5's separate later act (CV-52). `D-1` §12 and the implementation record §8.5 prohibit admission until qualification is recorded. |
| Gate 4 qualification execution | Host-only on `desktop-no0nhtp`; NOT EXECUTED. Arena cannot execute. |
| Gate 5 admission or any `503` lift | NOT GRANTED. Only a separate Gate 5 admission act can lift named `/api/user-portfolios*` operations. |
| Any `durable:true` claim | Prohibited before Gate 4 result acceptance (Gate 3 act §8.4). |
| Production eligibility or release | NOT AUTHORIZED throughout. |
| Promotion of off-main refs | `470cc698`/`6828155e`/`cec70802` G24 lineage is REFERENCE ONLY (G3-D5); `D-1` §12 prohibits main admission. |
| `better-sqlite3` or any native driver | `node:sqlite` only (G3-D2); no dependency/lockfile changes. |
| Re-opening `G-2` ownership | `G-2` §1 states the record does not reinterpret, rank, revise, or re-decide. Storage technology remains `node:sqlite` per G3-D2. |

---

## 3. Basis reconciliation

Implementation under this act must be reconciled to current authoritative heads:

| Repository | Current head | Act basis | Relationship |
|---|---|---|---|
| IPD `ramkivs/iips-production-market-data` | `c0e1b5662264651246db1ccde2945eb5e13f3524` | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` | Ancestor; 31 commits ahead |
| IRR `ramkivs/iips-review-recovered` | `34d9dd3c8135bf81d70fabe9749fc62a3ba759d3` | `ef5ba83ca1bb79947d888ad3070593715f056461` | Ancestor; 73 commits ahead |

Both basis commits are ancestors of current `main` — the act is not invalidated. However, the act's §10.1 acceptance criteria require verification "at the exact named commits," and material blob drift exists:

| File | Basis blob | Current main blob |
|---|---|---|
| `userPortfolioContract.ts` | `0dec72eb750206603196c67f6b27947420d7e6ac` | `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b` |

The Gate 3 act contains no re-pinning or amendment mechanism. This Q1 act expressly establishes that implementation under §2(b) proceeds against current heads, with basis reconciliation as a precondition to acceptance — i.e., the implementation must be authored and verified against current `main`, not the act's original basis commits.

---

## 4. Ordering

The three acts in this chain are separate and ordered:

1. **Q1 (this act):** Authorization to work the evidence — qualification (re-verification) and bounded residual implementation.
2. **Recorded qualification result:** Qualification evidence must be recorded before any admission act. Qualification evidence includes: create → persist → restart → read; idempotent re-import; fail-closed unresolved identity; recorded suites at rebased tree.
3. **Admission act (CV-52):** A later, distinct act naming commits, boundaries, fence state, and qualification evidence relied on. Admission never substitutes for qualification. "Admit as-is" is deliberately not offered.

All `/api/user-portfolios*` routes remain HTTP `503 owner-context-unavailable` until a separate Gate 5 admission act names qualified commits and lifts named operations.

---

## 5. Effectiveness and publication

This decision record is effective on publication to IRR `refs/heads/main` through the repository workflow, with PR-head and post-merge CI passing and remote read-back matching. Until published, it grants nothing.

**Companion record:** Q1-b ownership-source designation (`IIPS_v3.0_Q1B_OWNERSHIP_SOURCE_DISPOSITION_2026-10-22.md`) — separate act, separately evidenced.

---

## 6. Verification index

| ID | Check | Evidence location |
|---|---|---|
| Q1-1 | Q1 decision record published on IRR `main` | This file |
| Q1-2 | Q1-b disposition published as separate record | `IIPS_v3.0_Q1B_OWNERSHIP_SOURCE_DISPOSITION_2026-10-22.md` |
| Q1-3 | Basis heads recorded (IPD `c0e1b566…`, IRR `34d9dd3…`) | §3 above |
| Q1-4 | Gate 3 act EFFECTIVE and unrevoked | PR #148; read-back record |
| Q1-5 | No admission, Gate 4, Gate 5, fence lift, or production claimed | §2 above |
| Q1-6 | No off-main G24 promotion; `better-sqlite3` excluded | §2 above; G3-D5; G3-D2 |

---

**End of Q1 decision record.**
