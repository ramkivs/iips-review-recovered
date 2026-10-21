# IIPS v3 — Q1-b Ownership-Source Disposition (CV-20)

**Record ID:** `IIPS-V3-Q1B-OWNERSHIP-SOURCE-DISPOSITION-2026-10-22`  
**Record type:** Program Authority disposition — durably published; designation only, not operational proof  
**Date:** 2026-10-22 (UTC)  
**Authority:** Ramki — Program Authority / application owner  
**Recording agent:** Arena Agent Mode — preparation and verification only; no authority is rendered by the agent  
**Authoritative repository:** `ramkivs/iips-review-recovered`  
**Authoritative ref:** `refs/heads/main`  
**Related act:** Q1 Portfolio Decision Act (`IIPS-V3-Q1-PORTFOLIO-DECISION-ACT-2026-10-22`)  
**Designation source:** CV-20 Option A, IPD `evidence/cross-repository/IIPS_V3_CV20_OPTION_A_OWNERSHIP_SOURCE_DESIGNATION_RECORD_2026-10-18.md`

---

## 1. Disposition statement

The Program Authority decides:

1. **Designate** the non-authentication ownership source: the IPD-owned single `ACTIVE` `local_principal_bindings` row, consumed exclusively by the IPD-owned, single-principal, same-host IPC endpoint under `L-IPC-1` revision 2, as the source the IRR `/api/user-portfolios*` `503` seam waits on.
2. **Record that this designation does not assert operational status.** The designated source remains designated-but-not-live on current IPD `main` (`c0e1b566…`). IPD `main` has zero files under `src/persistence`, `src/ipc`, `src/server`, `src/auth`, and `src/app_identity`; no IPC endpoint exists on `main`.
3. **Record that this designation admits no lineage.** It does not admit G24 (`6828155e`), the `470cc698` line, or any off-main ref to `main`. `D-1` §12 and Gate 3 act G3-D5 keep G24 reference-only.
4. **Record that this designation does not change any fence.** All `/api/user-portfolios*` routes remain HTTP `503 owner-context-unavailable` until a separate Gate 5 admission act (CV-52) names qualified commits and lifts named operations.
5. **Record that this designation does not re-add OIDC/Keycloak machinery.** `CV-50` is terminal; `H-18` excludes enterprise authentication. No caller-supplied identity, owner, tenant, portfolio scope, or canonical company identity is accepted anywhere.

---

## 2. Designation versus operational proof

| Aspect | Designation (this record) | Operational proof (not yet established) |
|---|---|---|
| Ownership source | IPD-owned single `ACTIVE` `local_principal_bindings` row | Not yet live/wired on IPD `main` |
| IPC endpoint | Same-host IPC under `L-IPC-1` rev 2 | Not yet implemented on IPD `main` |
| IRR integration | `/api/user-portfolios*` fence awaits this source | Fence remains 503; no data-backed run possible |
| Qualification | Designation names the source | Data-backed qualification requires live wired path |
| Admission | No lineage admitted | CV-52 remains BLOCKED |

---

## 3. Scope boundaries

This disposition does **not**:

- Authenticate, synthesize a principal, pass credentials upstream, or infer a tenant (IRR `user-portfolio-transport.ts` header)
- Authorize OIDC, RBAC, multi-user, or tenant-directory capability
- Admit G24 or any off-main lineage to `main`
- Lift any HTTP 503 fence
- Change the CV-20 Option A designation itself
- Claim that the ownership source or same-host IPC path is operational or qualified

---

## 4. Relationship to Q1

Q1-b is a separate act accompanying Q1. Q1 authorizes qualification and bounded residual implementation of the durable portfolio line. Q1-b designates the ownership source the `503` seam waits on. They remain separately evidenced:

| Act | Purpose | Admits lineage? | Lifts fence? |
|---|---|---|---|
| Q1 | Qualification + bounded residual implementation | No | No |
| Q1-b | Ownership-source designation | No | No |
| CV-52 (Gate 5) | Admission of qualified commits | Yes (named commits only) | Yes (named operations only) |

---

## 5. Effectiveness and publication

This decision record is effective on publication to IRR `refs/heads/main` through the repository workflow, with PR-head and post-merge CI passing and remote read-back matching. Until published, it grants nothing.

---

## 6. Verification index

| ID | Check | Evidence location |
|---|---|---|
| Q1B-1 | Q1-b disposition published on IRR `main` | This file |
| Q1B-2 | CV-20 Option A designation referenced | IPD `evidence/cross-repository/IIPS_V3_CV20_OPTION_A_OWNERSHIP_SOURCE_DESIGNATION_RECORD_2026-10-18.md` |
| Q1B-3 | L-IPC-1 rev 2 referenced | IPD `evidence/np04/IIPS_v3.0_G2_IPD_LOCAL_PRINCIPAL_OS_IPC_SECURITY_CONTRACT_PROPOSAL_2026-10-16.md` |
| Q1B-4 | No operational claim made | §2 above |
| Q1B-5 | No fence change | All 503 fences preserved |
| Q1B-6 | No OIDC/Keycloak re-entry | `H-18`; `CV-50` terminal |

---

**End of Q1-b disposition record.**
