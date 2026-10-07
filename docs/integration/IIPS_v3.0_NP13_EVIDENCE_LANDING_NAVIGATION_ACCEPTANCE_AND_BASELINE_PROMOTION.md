# IIPS v3.0 — NP-13 Evidence Landing / Navigation
## Non-Production Acceptance and Active IRR Feature-Baseline Promotion

**Program:** IIPS Engineering Standards — Program v3.0  
**Workstream:** NP-13 — Evidence Landing / Navigation  
**Acceptance record identifier:** NP-13-ACCEPT-01  
**Record type:** Non-production acceptance and active IRR feature-baseline promotion  
**Date:** 2026-10-01  
**Repository:** `ramkivs/iips-review-recovered`  
**Branch:** `arena/01a0f64b-iips-review-recovered`  
**Governance authority:** `NP-13-AUTH-01`  
**Governance artifact:** `docs/integration/IIPS_v3.0_NP13_EVIDENCE_LANDING_NAVIGATION_IA_GOVERNANCE_DECISION.md`  
**Qualified implementation commit:** `fa9862c9668f0deb9b1093415fdd9c551036240f`  
**Parent continuity commit:** `795fece08211fec2a3e1de1d7f32317d7748dd6e`  
**Status:** **ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

---

## 1. Authority and Decision Basis

This record formally accepts the already-qualified NP-13 implementation into the active non-production IRR product baseline. It records no new product decision and does not amend or reinterpret the approved NP-13 governance authority.

The governing authority remains the NP-13 governance decision identified as `NP-13-AUTH-01`. Its D1–D6 decisions, §5.1–§5.3 boundaries, IB-1 through IB-8, explicit non-scope, deferred work, and G3 disclosure remain binding.

The approved governance artifact remains unchanged at Git blob:

```text
564b36b1778485a1c190fb7b3bb98068cdf83bd7
```

The qualified implementation is the exact implementation commit:

```text
fa9862c9668f0deb9b1093415fdd9c551036240f
```

with sole parent:

```text
795fece08211fec2a3e1de1d7f32317d7748dd6e
```

---

## 2. Qualification Basis Accepted into the Baseline

The independent qualification gate verified the following results from the qualified implementation commit:

| Qualification item | Accepted result |
| :--- | :--- |
| Governance authority | `NP-13-AUTH-01` intact; approved artifact unchanged |
| Implementation change surface | Exactly 3 files; 359 insertions, 2 deletions |
| `/evidence` role | Decision Evidence read-only landing/index |
| Governed source | Existing typed `fetchExecutiveData()` read, specifically `decisions` |
| Subject coverage | Complete 13/13 governed subject set |
| Identity | Exact sector-name identity with encoded `/evidence/:id` links |
| Semantics | Existing CERTIFIED/SNAPSHOT presentation preserved |
| Failure handling | Rejected, non-OK, malformed, empty, and incomplete reads fail closed |
| Reserved paths | `/evidence/snapshots` and bare `/evidence/replay` protected from dynamic evidence resolution |
| Existing Evidence detail | Preserved and operational |
| Existing Replay detail | Preserved and operational |
| Protected foundations | Zero NP-13 changes outside the authorized IB-1 surface |
| NP-09 / NP-10 / NP-11 | Unchanged |
| IPD | Untouched |
| Focused NP-13 tests | 1 test file; 11 passed; 0 failed; exit code 0 |
| Evidence/Replay/App regression tests | 5 test files; 34 passed; 0 failed; exit code 0 |
| Full frontend suite | 30 files passed, 2 files failed, 3 skipped; 283 passed, 2 failed, 25 skipped; exit code 1 |
| Typecheck | Exit code 0 |
| Build | Exit code 0 |

The two full-suite failures remain the established baseline failures:

1. `server/product-transport.test.ts` — taxonomy-category assertion involving `sector.telecom`.
2. `server/pit/pitRuntimeIntegration.test.ts` — established IU5R-13 company-route error-shape assertion.

They are pre-existing baseline failures, are outside the NP-13 implementation change surface, and are not NP-13 acceptance blockers.

---

## 3. Acceptance Decision

> **NP-13 EVIDENCE LANDING / NAVIGATION — ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

Acceptance means that the independently qualified NP-13 implementation is accepted into the active non-production IRR product baseline. The `/evidence` Decision Evidence landing/navigation surface is now part of that non-production feature baseline under the approved D1–D6 boundary.

Acceptance does not grant production, release, certification, provider, identity, or security authority beyond the approved governance record.

---

## 4. Accepted Product Baseline Scope

The accepted NP-13 capability is limited to:

- the Decision Evidence landing at `/evidence`;
- the existing governed `decisions` read through `fetchExecutiveData()`;
- the complete 13-subject governed evidence set;
- exact sector-name identity for subject links;
- existing CERTIFIED/SNAPSHOT semantics;
- minimum reserved-route protection for `/evidence/snapshots` and bare `/evidence/replay`;
- navigation to the existing `/evidence/:id` Evidence detail surface;
- preservation of the existing `/evidence/replay/:id` Replay detail surface;
- existing unavailable/error behaviour when the governed read is unavailable or invalid.

The implementation remains read-only. It introduces no user-owned state, persistence, evidence generation, replay execution, history, or archive semantics.

---

## 5. Protected Foundations

The following remain unchanged and protected:

- NP-09 Watchlists;
- NP-10 Collaboration, including its established `ev_*` evidence-reference identity;
- NP-11 Settings / Configuration;
- Gate-P persistence and `PersistenceService`;
- Evidence Explorer;
- Replay Explorer;
- Evidence Explorer presentation components;
- Evidence and Replay typed clients and DTOs;
- executive transport;
- `ReplayService`;
- `EvidencePipeline`;
- frozen Replay Baseline and golden outputs;
- navigation model;
- Sidebar and AppShell;
- identity and security foundations;
- IPD.

No protected foundation is expanded or reinterpreted by this acceptance record.

---

## 6. Preserved Limitations and Exclusions

The following limitations remain in force and are preserved as part of this acceptance:

1. Production remains excluded.
2. Release certification remains excluded.
3. OIDC remains excluded.
4. G3 remains unresolved.
5. Snapshots remain unimplemented.
6. Lineage remains unimplemented.
7. Audit remains unimplemented.
8. History/archive remains unimplemented.
9. Replay expansion remains excluded.
10. No new persistence was introduced.
11. No new identity, authentication, or authorization was introduced.
12. Existing Evidence and Replay foundations remain protected.
13. IPD remains untouched and read-only.
14. The two established full-suite baseline failures remain baseline failures and are not NP-13 acceptance blockers.

This acceptance record does not convert any limitation into a commitment or authorization.

Specifically, this record does not authorize:

- production activation;
- release or certification claims;
- OIDC, Keycloak, or credential work;
- G3 remediation;
- provider integration;
- Snapshots implementation;
- Lineage implementation;
- Audit implementation;
- evidence history or archive;
- replay expansion, redesign, diffs, or new execution modes;
- a new evidence identity;
- a new evidence index API;
- persistence, journals, stores, or browser storage;
- shell-wide navigation changes;
- changes to Executive, Portfolio, Decision Matrix, Collaboration, Watchlists, or Settings navigation.

---

## 7. Non-Production Status

The accepted feature baseline is:

```text
NON-PRODUCTION ONLY
```

The accepted `/evidence` surface consumes the existing non-production governed reference SNAPSHOT posture. This acceptance record grants no production readiness, production authorization, release certification, or live-data authority.

G3 remains open and unresolved. This record does not remediate, close, or claim G3.

---

## 8. Acceptance Record Non-Actions

This acceptance record performs governance recording and active non-production baseline promotion only. It does not:

- modify `App.tsx`;
- modify `EvidenceLanding.tsx`;
- modify NP-13 tests;
- modify Evidence or Replay foundations;
- modify persistence, identity, authorization, or transport;
- modify NP-09, NP-10, or NP-11;
- modify IPD;
- implement Snapshots, Lineage, Audit, History, or Replay expansion;
- claim production readiness or release certification;
- resolve G3.

The qualified implementation commit remains unchanged.
