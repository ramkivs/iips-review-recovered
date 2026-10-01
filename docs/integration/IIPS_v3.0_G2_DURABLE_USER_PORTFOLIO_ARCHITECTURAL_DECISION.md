# IIPS v3.0 — G-2 Durable User Portfolio Architectural Decision

## Durable User Portfolio Foundation

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** G-2 — Durable User Portfolio Foundation

**Document type:** ARCHITECTURAL AUTHORITY DECISION — governance direction only (not implementation, certification, release, or production authority)

**Version:** 1.0 — Decision

**Date:** 2026-09-30

**Branch:** `main`

**IRR authority baseline:** `ramkivs/iips-review-recovered` `main@19b42e7145eda89206a2a36b19e656b6e41b35d3` (tree `9590a47439922697b3fa03c1415d3c7af2bc5f49`)

**IPD architecture baseline:** `ramkivs/iips-production-market-data` `arena/01a0e6d9-iips-production-market-data@0dab1221fb0f89e2e0601ea905d642bfe72d5f9c` (tree `e754acff9919902508b476fcbb4d1ff8fbfb28f0`)

**Status:** **ACCEPTED — ARCHITECTURAL DIRECTION RECORDED**

**Authority:** Ramki / Program Authority — human architectural decision

**Implementation boundary:** This decision establishes architecture direction only. It does **not** authorize implementation, production activity, certification, release, migration, deployment, or modification of protected foundations.

---

## 1. Authority and Decision

Program Authority has accepted the G-2 architectural direction for a non-production durable user-portfolio foundation:

1. **IPD owns the user-portfolio domain and its durable persistence boundary.**

2. The existing IPD `PortfolioStore` and portfolio domain are the authoritative baseline and shall be **extended, not replaced or duplicated**.

3. IRR may consume the user-portfolio capability only through a separately governed, explicit, additive, minimal, contractually defined, and independently testable boundary.

4. The certified IRR reference portfolio and the user-owned portfolio are distinct capabilities with distinct provenance and authority.

This record documents the decision already made by human Program Authority. It does not reinterpret, rank, revise, or re-decide that direction.

---

## 2. Existing IPD Capability to Preserve and Reuse

Future authorized work shall preserve and reuse the existing IPD portfolio capability, including:

- Dhan and broker ingestion;

- broker contracts and adapters;

- detection, parsing, and normalization;

- SecurityMaster and canonical company-identity mapping;

- `UserHoldingInput`;

- `PortfolioRecord`;

- `BrokerContributionRecord`;

- MERGE and REPLACE semantics;

- holdings consolidation;

- quantity and cost-basis calculations;

- weight calculation;

- lineage and contribution history;

- content-digest idempotency and duplicate-import no-op behavior;

- existing portfolio analytics and read-back; and

- the existing PortfolioWorkspace/controller path.

These capabilities shall not be unnecessarily reimplemented. Any future proposal to change their semantics requires explicit identification, justification, and separate authority.

---

## 3. Durable Portfolio Requirements Established

The future user-portfolio capability shall provide:

- explicit owner/principal identity;

- explicit tenant/company context;

- stable durable portfolio identity;

- restart-durable persistence;

- versioned serialization and deserialization;

- schema/version migration capability;

- explicit lifecycle and retention semantics;

- reset and deletion semantics;

- concurrency and version semantics;

- server-side authorization;

- tenant and owner isolation;

- governed auditability; and

- durable preservation of required contribution, lineage, and idempotency semantics.

The storage technology is intentionally **not prescribed**. The durable storage boundary shall avoid unnecessary coupling between the portfolio domain and any particular persistence technology.

---

## 4. PIT Boundary

PIT shall **not** be reused, broadened, or repurposed as the durable user-portfolio persistence mechanism.

PIT remains within its existing governed market-data and snapshot role. This decision authorizes no PIT redesign or mutation.

---

## 5. IRR Consumption Boundary

IRR shall consume the IPD-owned user-portfolio capability only through a separately governed additive interface.

The interface shall not expose internal IPD implementation details merely because IRR requires portfolio access. IRR shall not create a second portfolio domain, and no shared abstraction shall be created merely for convenience where a narrower contract is sufficient.

This decision does not itself define or authorize that interface's implementation.

---

## 6. Certified Reference Portfolio Protection

The following existing IRR capabilities remain protected and unchanged:

- certified `/api/portfolio`;

- certified reference PortfolioWorkspace;

- frozen/reference portfolio inputs;

- CSIP provenance;

- certified engine path;

- existing G3 authority/security infrastructure; and

- certified reference-portfolio semantics.

The new user-owned portfolio capability shall not be conflated with, substituted for, or represented as the certified reference portfolio.

---

## 7. Provenance and Analytics Boundary

User/imported portfolio data shall remain explicitly distinguishable from:

- certified reference-portfolio data;

- historical certification evidence;

- market-data snapshots; and

- other governed reference datasets.

Imported or user-owned holdings do not acquire certified-reference status merely because IRR later consumes them.

This decision does **not** authorize connecting user-owned portfolio data to the certified scoring or analytics engine path. Any such integration requires a separate governance decision covering purpose, provenance, authority, transformation, qualification, certification implications, and separation from certified reference data.

---

## 8. Protected Foundations and Explicit Exclusions

This decision does **not** authorize:

- reopening RR↔IPD integration;

- reopening or modifying PIT/IU-7;

- reopening IU-8;

- changing D114 historical evidence;

- changing existing certification records or historical evidence;

- changing certified reference-portfolio behavior or `/api/portfolio`;

- replacing the existing IRR reference PortfolioWorkspace;

- reimplementing Dhan or broker ingestion;

- modifying the existing IPD `PortfolioStore` or portfolio domain in this recording action;

- modifying IRR portfolio transport, G3, or application implementation;

- integrating user portfolios with certified scoring or analytics;

- Watchlists, Reports, Collaboration, Settings, Governed Screener, or Operator Drop work;

- production database, production deployment, production OIDC, production provider activation, production migration, backup, disaster recovery, release, or other production activity; or

- implementation, certification, promotion, or release of the G-2 capability.

Protected RR↔IPD, PIT/IU-7, IU-8/13 engine, D114, accepted Dhan evidence, Operator Drop, G3/OIDC, certification, engine-baseline, certified `/api/portfolio`, and certified reference Portfolio Workspace foundations remain closed.

---

## 9. Implementation Authorization Boundary

**No implementation is authorized by this decision.**

Before implementation may begin, a separate, explicitly authorized, read-only IRR + IPD implementation-readiness investigation must establish the smallest implementation plan and exact protected boundaries. That investigation and any later implementation authority are separate governance actions; neither is performed or granted here.

Architecture acceptance does not constitute authorization to change source code, schemas, dependencies, APIs, UI, tests, certification artifacts, production configuration, branches, tags, or releases.

---

## 10. Recording and Mutation Boundary

This governance action records only the accepted G-2 architectural decision in the existing IRR `docs/integration/` authority-decision location, following the additive precedent established by `IIPS_v3.0_OPENING_AUTHORITY_DECISION.md`.

The only authorized repository mutation for this recording action is the addition of:

`docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`

No application/product implementation, IPD content, protected certification/history record, PIT artifact, production artifact, or unrelated worktree content is part of this decision record.

Canonical synchronization of this additive record is required before the decision may be described as durably recorded in authoritative IRR history.

---

## 11. Authority Sign-Off

> **G-2 Durable User Portfolio Foundation: ACCEPTED**
>
> Program Authority selects IPD as owner of the user-portfolio domain and durable persistence boundary; requires extension and reuse of the existing IPD portfolio domain and Dhan/broker capability; preserves PIT and the certified IRR reference portfolio unchanged; permits only a separately governed additive IRR consumption boundary; excludes certified-analytics integration and production activity; leaves storage technology undecided; and grants architecture direction only, not implementation authority.

**Authority:** Ramki / Program Authority — human architectural decision

**Decision:** **ACCEPTED**

**Date:** 2026-09-30

**Recording baseline:** IRR `main@19b42e7145eda89206a2a36b19e656b6e41b35d3`; IPD `arena/01a0e6d9-iips-production-market-data@0dab1221fb0f89e2e0601ea905d642bfe72d5f9c`
