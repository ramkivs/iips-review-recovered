# IIPS v3.0 — NP-04 Common Governed Persistence Implementation Authority

## Implementation Authority Decision Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** NP-04 — Common Governed Persistence Capability (implementation authority)

**Document type:** IMPLEMENTATION AUTHORITY DECISION — authorizes a bounded capability implementation (non-production). Not a certification, release, or production authority.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Branch:** `arena/01a0f1b3-iips-review-recovered` (record branch); governance home is IRR `main`

**IRR authority baseline:** `ramkivs/iips-review-recovered` `main@c1febdebea90154c73bdc5d7f3798ac250e6e2dd` (tree `cc4d3d6df3327310fa5f0b0053ea88bc3b621dea`)

**IPD implementation baseline:** `ramkivs/iips-production-market-data` `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c` (tree `db853dc21d01162e69b0e1211dbea1cb5c5f72b1`)

**Supersedes nothing.** This record grants implementation authority that G-2 explicitly withheld. G-2 (`IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`, §9) states: *"No implementation is authorized by this decision."* This record is the separate governance action G-2 required.

**Status:** **ACCEPTED — IMPLEMENTATION AUTHORITY GRANTED (NON-PRODUCTION, BOUNDED)**

**Authority:** Ramki / Program Authority

**Enabling dependency:** NP-06 Reports P2 consumer contract, durably recorded at `docs/integration/IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md` (commit `4a4bc1fc4dd8aa1069f39bd947574f0e1184eafc`).

---

## 1. Problem being authorized

NP-06 Reports has a **complete and durably recorded** P2 consumer contract requiring a common governed persistence capability. That contract is fully specified — five operations, identity/ownership/versioning/supersession/durability/transactionality/retrieval semantics, and a 15-row test matrix.

IPD currently has **no persistence substrate of any kind**: at `4d3e1cd` the repository contains 385 paths, 132 under `src/` (D01–D07 market-data contracts), with **zero** matches for `persistence`, `sqlite`, `migration`, or `NP-04`, no persistence branch, and no persistence driver dependency.

Consequently the NP-06 P2 contract has nothing to bind to, and P2 is **NOT SATISFIED**. NP-06 is correctly blocked on this dependency and cannot discharge it itself: the contract is Reports-owned, the capability is not.

This record grants the implementation authority required to close that gap.

---

## 2. Decision

> **IMPLEMENTATION AUTHORITY GRANTED — COMMON GOVERNED PERSISTENCE CAPABILITY**

Implementation authority is granted for the bounded common governed persistence capability in **non-production IPD**, solely to enable the already-approved NP-06 Reports P2 consumer contract.

This authority does **not** authorize Reports implementation. It does **not** authorize unrelated persistence workstreams. It does **not** authorize production.

---

## 3. Authorized destination

| | |
|---|---|
| Authorized implementation repository | `ramkivs/iips-production-market-data` |
| Authorized environment | **NON-PRODUCTION** |
| Authorized workspace / branch | A bounded Arena working branch, prepared as a handoff artifact. The final authoritative commit is established from the Windows checkout, not from Arena. |

Consistent with G-2 §1, which established that **IPD owns the user-portfolio domain and its durable persistence boundary**. The governance record itself belongs in the IRR governance home (`docs/integration/`), not in IPD, and is placed there.

Arena is **not** the final Git durability authority and is **not** required to prove GitHub push capability. No Arena→IPD push, IRR→IPD synchronization, or IPD→IRR synchronization is required or permitted by this record.

---

## 4. Authorized functional envelope

The implementation may establish the common durable persistence capability required to satisfy the NP-06 Reports consumer contract.

### 4.1 Governed consumer contract

- `createInstance`
- `appendVersion`
- `resolveById`
- `queryByOwner`
- `listSupersededBy`

### 4.2 Required semantics

**Identity.** `reportId` is a globally unique **durable instance** identity. Instance identity is distinct from content identity. Identical canonical report content **may** produce multiple durable instances with distinct `reportId`s. The frozen CSIP content-derived `reportId` must never be used as durable instance identity.

**Ownership.** `(tenantId, userId)` is immutable once written. Ownership must not be supplied by an untrusted client as authoritative identity; it is bound to the authenticated principal context defined by the existing governance baseline. The existing principal/tenant contract is **not** replaced by this record.

**Versioning.** `artifactVersion` begins at `1`; authorized new versions increment monotonically; prior versions are immutable; version increment and supersession form one coherent operation.

**Supersession.** `supersedesReportId` is absent for the first artifact. Each later artifact has at most one direct predecessor. The chain is append-only. No destructive replacement of prior artifacts.

**Durability.** Committed artifacts survive process and application restart.

**Transactionality.** A failed transaction must not leave a partial governed artifact.

**Retrieval.** The defined retrieval and query operations are supported together with their ownership boundaries; cross-owner access is rejected without existence disclosure.

---

## 5. Implementation strategy authority

This record authorizes the **capability and its required semantics**. It does **not** prescribe a storage technology.

This is deliberate and consistent with G-2, which stated that *"the storage technology is intentionally **not prescribed**"* and that the durable storage boundary *"shall avoid unnecessary coupling between the portfolio domain and any particular persistence technology."*

The implementation team may select the concrete technology within these constraints:

- non-production;
- transaction-capable;
- durable and restart-safe;
- testable;
- bounded;
- auditable;
- compatible with the consumer contract of §4.1;
- no production dependency;
- no irreversible migration without explicit evidence.

No technology is named in this record. If the selected technology would alter the consumer contract, the ownership model, or any closed integration foundation, a separate governance decision is required and implementation must stop before that change.

---

## 6. Explicit non-authority

This authority does **not** authorize:

- Reports UI implementation;
- Reports API implementation;
- modification of the frozen CSIP `ReportingEngine`;
- relocation of `ReportingEngine`;
- sector-level Reports;
- production persistence;
- production credentials;
- production deployment;
- invention of `companyId` / `runtimeCompanyId` as identity;
- replacement of the existing principal/tenant contract;
- unrelated NP-07 / NP-08 / NP-09 / NP-10 / NP-11 / NP-12 / NP-13 implementation;
- changes to closed **IU-7**;
- changes to closed **IU-8**;
- changes to unrelated market-data functionality;
- arbitrary schema or platform redesign beyond what the governed persistence contract requires.

Protected surfaces, including the Dhan/Groww/Zerodha adapters, the broker detector, mapper, ingress, import view-model, `src/identity/mapping_store.ts`, and `src/pit/pit_store.ts`, remain byte-identical.

---

## 7. Required validation before artifact handoff

The implementation must eventually demonstrate, at minimum:

1. create instance;
2. globally unique instance IDs;
3. identical canonical content produces distinct instance IDs;
4. append version;
5. version starts at 1;
6. version increments correctly;
7. prior versions remain immutable;
8. single-parent supersession;
9. immutable ownership;
10. cross-owner access rejection;
11. restart durability;
12. transaction rollback;
13. a failed transaction leaves no partial artifact;
14. concurrent uniqueness;
15. migration/startup fail-closed behaviour;
16. compatibility with the NP-06 P2 consumer interface.

These are requirements for the subsequent implementation/artifact gate. **No test is fabricated by this record**, and passing tests alone would not establish authority.

---

## 8. Durability model

> **Arena may prepare and validate artifacts. The authoritative Windows checkout performs final reconciliation, commit, push, remote verification, `LOCAL == REMOTE` verification, and clean-worktree verification.**

A local Arena implementation, a local commit, a local branch, or a passing local test suite is **not** authoritative. A dependency implementation counts only when it is committed, pushed, present in the authoritative repository, and verifiably current — proven by the full Windows sequence.

---

## 9. Re-entry sequence

After this authority record is durable:

1. Arena may proceed to a separately bounded NP-04 persistence implementation / artifact-preparation gate.
2. Arena must expose the artifact through the download server, with a manifest carrying per-file SHA-256 values.
3. Windows must independently reconcile and validate the received artifact against its own authoritative checkout, and must **stop** rather than force-apply if the pre-change baseline does not match.
4. Windows performs final Git durability.
5. NP-06 then re-enters its P2 readiness / implementation-authority determination against authoritative evidence.

---

## 10. Scope of this record

This record grants **authority only**. No persistence implementation, schema, migration, driver, dependency, package change, or IPD source change is performed by it. The only repository mutation authorized by this recording action is the addition of this governance file to the IRR governance home.

This record does **not** make P2 satisfied. P2 is satisfied only when the capability is implemented, durably reconciled on the Windows IPD checkout, and independently verified against the §7 validation contract.

**Authority must be durable before implementation begins.**

---

*End of record.*
