# IIPS v3.0 — NP-11 Settings / Configuration Product Contract & Persistence Owner Designation

## Settings Product Contract, Ownership, Scope & Persistence Owner Designation Decision

**Program:** IIPS Engineering Standards — Program v3.0  
**Workstream:** NP-11 — Settings / Configuration  
**Decision identifier:** NP-11-AUTH-01 — Settings Product Contract & Persistence Owner Designation  
**Document type:** AUTHORITY DECISION — Governance contract & designation record only (not implementation, certification, release, or production authority)  
**Version:** 1.0 — Decision  
**Date:** 2026-10-01  
**Branch:** `arena/01a0f351-iips-review-recovered` (descendant of `ba8ea1df74b10be5ed46bc12494ec1f651a20235`)  
**IRR authority baseline:** `ramkivs/iips-review-recovered` `ba8ea1df74b10be5ed46bc12494ec1f651a20235`  
**IPD reference baseline:** `ramkivs/iips-production-market-data` `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c` (READ ONLY — 0 mutations)  
**Governing evidence:** NP-11 read-only investigation (preceding gate)  
**Status:** **ACCEPTED — PROGRAM AUTHORITY PRODUCT CONTRACT RECORDED**  
**Authority:** Program Authority — human product and architectural decision  
**Implementation boundary:** This decision establishes the Product Contract, ownership, scope, exclusions, lifecycle principles, and persistence owner. It does **NOT** grant implementation authority, production authority, certification authority, or release authority. Implementation remains withheld until a separate Implementation Gate is convened.

---

## 1. Executive Summary

Following the NP-11 read-only investigation, Program Authority hereby establishes the definitive non-production Product Contract for Settings / Configuration.

The investigation established, from repository evidence:

1. IRR has **no** Settings surface, route, navigation entry, placeholder, service, transport, persistence boundary, or preference model.
2. The governed v3.0 Information Architecture and Navigation Model enumerate six primary sections and **do not contain Settings**.
3. **System Configuration is documented UNAVAILABLE** because no governed platform configuration contract exists — `docs/v3.0/phase12/contract-inspection.md` §O: *"No ConfigService, no system-config store, no settings registry."*
4. Server-side identity/security authority **exists** through the governed security foundation (`SecuredExecutor`).
5. The client session remains an **inert presentation stub** and is not an authority.
6. There is **no browser credential path** currently implemented (the documented G3 gap).
7. Gate-P Class C persistence exists and is already used by Watchlists and Collaboration.
8. **No Settings persistence owner has previously been designated.**
9. The historical IPD UI12 donor is **pruned/non-canonical** and contains an **authority-blocked** data-mode preference.
10. The donor also depends on an `authFetch` client module **absent from IRR**.
11. PIT/data provenance **must remain server-authoritative**.

The NP-11 readiness disposition at investigation time was **NOT READY — GOVERNANCE CONTRACT / AUTHORITY INCOMPLETE**, with six of ten preconditions unmet. This record resolves those decisions.

---

## 2. Authoritative Designation

Program Authority establishes the following contract:

> **NP-11 SETTINGS / CONFIGURATION = PRIVATE, USER-OWNED, TENANT-SCOPED PERSONAL CONFIGURATION CAPABILITY**

> **SETTINGS PERSISTENCE OWNER = IRR SERVER TIER**

> **SETTINGS IMPLEMENTATION REPOSITORY = `ramkivs/iips-review-recovered` (IRR) — EXCLUSIVE**

| Element | Authoritative Value |
| :--- | :--- |
| **Capability** | Settings / Configuration |
| **Product surface** | UI12 / `/settings` (designation only — not implemented by this gate) |
| **Ownership key** | `(tenantId, userId)` — both server-derived |
| **Ownership scope** | Individual authenticated user, within the user's server-derived tenant |
| **Privacy** | Private by default; non-shared |
| **Persistence governance** | Gate-P |
| **Persistence class** | Class C (Append-Only Filesystem Event Journal) |
| **Persistence owner** | IRR Server Tier |
| **Designated repository** | `ramkivs/iips-review-recovered` |
| **Designated persistence boundary** | `frontend/server/settings/` (distinct consumer boundary) |
| **Persistence foundation** | Existing `frontend/server/persistence/persistence-service.ts` (unmodified) |
| **IPD role** | READ-ONLY REFERENCE ONLY; 0 mutations |

---

## 3. NP-11-D1 — Product Scope

**Decision: PRIVATE, USER-OWNED, TENANT-SCOPED PERSONAL CONFIGURATION CAPABILITY.**

Initial scope is limited to user preferences that affect **presentation** and other explicitly authorized **personal product preferences**. The capability must **not** become a general platform configuration service.

### In scope

Only explicitly governed user-level preferences. The first implementation must remain deliberately narrow. Evidence-supported candidates:

- theme / presentation preference;
- other personal UI/product preferences **only when explicitly represented in the governed Settings contract**.

Transient UI state found across the repository (sort keys, filter toggles, selection, form drafts) is **not** automatically in scope.

### Out of scope

System-wide configuration; tenant-wide configuration; administrator-managed configuration; feature-flag management; deployment/environment configuration; platform secrets; infrastructure configuration; broker configuration; provider activation; production configuration; identity configuration; authentication configuration; authorization policy configuration; sharing of personal Settings; configuration inheritance from other users; arbitrary runtime configuration.

**Fail-closed rule:** any newly discovered candidate that cannot clearly be classified as a personal user preference must be **reported, not added**.

---

## 4. NP-11-D2 — Ownership and Authority

**Decision: Settings are owned by the individual authenticated user, within the user's server-derived tenant.**

**Authoritative ownership key: `(tenantId, userId)`**, both originating from the governed server-side identity/security boundary.

### Rules

- The browser must **never** define authoritative `userId`.
- The browser must **never** define authoritative `tenantId`.
- The inert `demo-analyst` / `tenant-demo` session stub must **never** become an ownership authority.
- **No** new identity model may be introduced.
- **No** client-side identity persistence may be introduced.
- **No** cross-user Settings access is authorized.
- **No** cross-tenant Settings access is authorized.

Personal Settings are **private by default**.

---

## 5. NP-11-D3 — Persistence Authority

**Decision: Durable NP-11 Settings persistence is owned by the IRR Server Tier.**

- **Repository:** `ramkivs/iips-review-recovered`
- **Persistence foundation:** existing Gate-P Class C `PersistenceService`

The implementation must use the **existing governed persistence foundation** rather than creating a parallel persistence architecture.

### Persistence boundary

Settings must receive a **distinct consumer boundary/journal** under the existing persistence architecture. The exact Settings data subdirectory / journal name may be established during the Implementation Gate, but it **must be a distinct Settings consumer boundary**.

**Do not reuse:** Watchlists journal; Collaboration journal; PIT state; any other consumer journal.

### Explicit prohibition

Do not create a second persistence framework; create a database outside Gate-P; use browser `localStorage`; use browser `sessionStorage`; use IndexedDB; persist credentials in the browser; reuse PIT persistence; piggyback on Watchlists persistence; piggyback on Collaboration persistence.

**Current fact:** `persistence-service.ts` remains exactly as accepted under NP-09 (last modified at `fbe7649`); existing consumer boundaries are `watchlists` and `collaboration`.

---

## 6. NP-11-D4 — Data-Mode / PIT Preference

**Decision: the historical donor's `LIVE / SNAPSHOT / PIT` user-selectable default data-mode preference is EXCLUDED FROM NP-11.**

It is **not authorized** as a Settings preference.

### Reason

Current IIPS architecture treats data mode, freshness, PIT addressing, and provenance as **governed / server-authoritative** behavior. The historical donor's data-mode preference is already **authority-blocked** (IPD inventory: *"Authority-blocked: D91/D88 (macro, macro data-mode preference)"*) and depends on a **Macro surface that does not exist in IRR** (0 nav entries).

### Consequence

NP-11 must **not** provide a Settings control that changes: LIVE/SNAPSHOT/PIT selection; PIT addressing; data provenance; server-authoritative freshness; historical / as-of semantics.

Any future proposal to make data mode user-configurable requires a **separate explicit governance decision** and must not be smuggled into NP-11.

---

## 7. NP-11-D5 — Identity / Browser Authentication

**Decision: NP-11 must consume the existing governed server identity/security architecture. It must NOT create a new browser authentication mechanism.**

**Explicitly prohibited:** ad-hoc JWT handling; `localStorage` token authentication; `sessionStorage` token authentication; client-generated identity; client-supplied authoritative tenant identity; a new identity service; bypassing `SecuredExecutor`; treating the inert `SessionProvider` as security authority.

### G3 relationship

The known **browser→transport credential-path / G3 gap remains a separate platform dependency**. NP-11 must **not** attempt to solve that gap through an ad-hoc mechanism.

**Fail-closed rule:** if implementation cannot safely consume the existing governed identity boundary, implementation **must stop and report the dependency** rather than weakening the security boundary.

**Status disclosure:** G3 / M-5 remain **OPEN**. This record does not remediate, close, or claim them; it records, consistent with the NP-09 and NP-10 precedents, that server-derived `(tenantId, userId)` scoping through the existing authenticated-principal boundary is the accepted non-production access-control mechanism for personal Settings.

---

## 8. NP-11-D6 — Lifecycle / Reset / Retention

**Decision: Settings persistence is revision-oriented and governed by the existing append-only persistence model.** A Settings update creates a **new effective revision** rather than mutating historical journal records.

### Required semantic operations

The eventual Settings contract must define at minimum:

- **read** effective settings;
- **update** authorized settings;
- **reset** authorized settings to governed defaults.

### Reset

**"Reset" means: establish the governed default effective configuration through a new durable revision.** It does **not** mean silently deleting historical journal records.

### Retention

Because Gate-P Class C is append-only, historical revisions remain part of the durable journal **unless a separately authorized lifecycle mechanism exists**. Physical erasure semantics **must not be invented**.

### Offboarding

User/tenant offboarding semantics **must be explicitly represented in the implementation design before implementation** if the existing persistence authority does not already provide the required behavior. **Append-only persistence must not be claimed to solve offboarding.**

---

## 9. NP-11-D7 — Versioning / Migration

**Decision: Settings must have an explicit schema/version concept separate from the whole-journal format version.**

- The existing **journal format version must not be repurposed** as the Settings schema version.
- Future incompatible Settings schema changes must **fail closed** or use an **explicit migration path**.
- An old Settings record must **not** be silently reinterpreted using a new schema.

The precise schema-version representation may be finalized during the Implementation Gate.

**Current fact:** the persistence authority exposes `JOURNAL_FORMAT_VERSION = 1` as a **whole-journal** version (TD-3); it is expressly **not** a per-consumer schema version.

---

## 10. NP-11-D8 — Auditability / Reproducibility

**Decision: the effective Settings state must be deterministically reproducible from the persisted Settings history.**

- The **append-only journal is the source of durable Settings state**.
- Every effective revision must be **deterministic** and **attributable** to the server-derived `(tenantId, userId)` owner.
- Do **not** automatically create a separate administrative audit event for every preference change unless an existing governed audit contract requires it.
- Do **not** treat the existing **in-memory** administrative audit facility as the durable Settings store.

---

## 11. NP-11-D9 — Sharing and Defaults

**Decision: Settings are PRIVATE AND NON-SHARED.**

**Not authorized:** sharing; invitations; workspace inheritance; cross-user preference propagation; tenant-level inheritance; collaborative Settings.

### Defaults

**Initial defaults are system-defined governed defaults.** User preferences override those defaults **only** within the authorized personal Settings scope.

- **Tenant-defined defaults are NOT introduced by NP-11.**
- **Administrator-defined personal Settings are NOT introduced by NP-11.**

---

## 12. NP-11-D10 — Implementation Repository

**Decision: the implementation repository is `ramkivs/iips-review-recovered` (IRR).**

IRR is the **exclusive** implementation target.

**IPD remains READ-ONLY REFERENCE ONLY.**

The historical fact that UI12 Settings originated in IPD **does not override** this authority decision.

---

## 13. NP-11-D11 — Historical Donor Disposition

**Decision: historical IPD UI12 Settings implementation = PARK / REFERENCE ONLY.**

Donor: IPD commit `ecfa59f71d8908912a79c6d1d2726c3b2e356904`, record `docs/D80_UI12_SETTINGS_RECOVERY_IMPLEMENTATION.md` (12 files, 1185 insertions). Confirmed a **non-ancestor of canonical main** — present only on unmerged arena branches; canonical IPD main carries only a fail-closed `SettingsStructural` placeholder.

**Do not:** cherry-pick it; copy it; merge it; restore it; treat it as canonical; use its data-mode preference; import its `authFetch` dependency; recreate its Macro dependency merely to support the donor.

The donor may be consulted for **implementation ideas only after the current NP-11 contract has been established**. **The current contract has precedence over donor behavior.**

---

## 14. NP-11-D12 — Import / Export

**Decision: Settings import/export is OUT OF SCOPE.**

**No:** Settings export file; Settings import; configuration backup; configuration restore; configuration migration file; external Settings interchange.

A future import/export capability requires a **separate governance decision**.

---

## 15. Explicit NP-11 Exclusions (Authoritative Set)

The following exclusion set is authoritative for this workstream:

1. System configuration.
2. Tenant-wide configuration.
3. Administrator-managed personal Settings.
4. Feature flags.
5. Deployment configuration.
6. Environment configuration.
7. Secrets.
8. Authentication configuration.
9. Authorization policy configuration.
10. Identity management.
11. Broker/provider configuration.
12. Production activation/configuration.
13. LIVE/SNAPSHOT/PIT user-selectable data mode.
14. PIT addressing.
15. Data provenance manipulation.
16. Settings sharing.
17. Cross-user Settings access.
18. Cross-tenant Settings access.
19. Workspace membership.
20. Collaboration semantics.
21. Watchlist persistence reuse.
22. Collaboration persistence reuse.
23. Browser-local durable Settings persistence.
24. Browser-local credentials.
25. New identity architecture.
26. Import/export.
27. External notification configuration.
28. Any capability not demonstrably belonging to private user-level Settings.

---

## 16. Protected Foundations

**NP-11 must consume, not redesign:**

| Foundation | Constraint |
| :--- | :--- |
| NP-04 Persistence | Consumed as-is; Settings is subject to it |
| NP-09 Watchlists | Unmodified; no journal reuse |
| NP-10 Collaboration | Unmodified; no journal reuse |
| `SecuredExecutor` | Consumed unchanged; no new executor |
| Server-derived tenant/user identity | Sole ownership authority |
| PIT / IU-7 | Unmodified; server-authoritative |
| IU-8 | Unmodified |
| Closed RR ↔ IPD integration | Unmodified; IPD read-only |
| Existing transport/security foundations | Additive, exact-namespace only |

**No modification of these foundations is authorized by this governance gate.**

In particular:

> **NP-11 must not modify `PersistenceService` merely to make Settings possible.**

**Fail-closed rule:** if an actual missing capability in a protected foundation is discovered, **stop and report it as a separate dependency**.

---

## 17. Decision Summary Matrix

| Decision | ID | Result |
| :--- | :--- | :--- |
| Product scope | D1 | Private, user-owned, tenant-scoped personal configuration; not a platform config service |
| Ownership & authority | D2 | `(tenantId, userId)`, server-derived; private; no cross-user / cross-tenant |
| Persistence authority | D3 | IRR Server Tier; Gate-P Class C; distinct consumer boundary; foundation unmodified |
| Data-mode / PIT preference | D4 | **EXCLUDED** |
| Identity / browser auth | D5 | Consume existing boundary; no new mechanism; G3 remains a separate open dependency |
| Lifecycle / reset / retention | D6 | Revision-oriented; reset = new default revision; no invented erasure; offboarding explicit |
| Versioning / migration | D7 | Explicit Settings schema version, separate from journal format version; fail closed or migrate |
| Auditability / reproducibility | D8 | Effective state reproducible from journal; journal is the durable source |
| Sharing & defaults | D9 | Private/non-shared; system-defined governed defaults only |
| Implementation repository | D10 | IRR — exclusive |
| Historical donor | D11 | PARK / reference only |
| Import / export | D12 | OUT OF SCOPE |

---

## 18. Implementation Readiness

All ten readiness preconditions are satisfied by this record:

| # | Precondition | Status | Basis |
| :--- | :--- | :--- | :--- |
| 1 | Product scope | ✅ **ESTABLISHED** | D1 — private personal configuration; in-scope/out-of-scope defined |
| 2 | Ownership model | ✅ **ESTABLISHED** | D2 — `(tenantId, userId)`, server-derived |
| 3 | Identity/tenant model | ✅ **ESTABLISHED** | D2 / D5 — consume `SecuredExecutor`; G3 gap disclosed as separate dependency |
| 4 | Authorization boundary | ✅ **ESTABLISHED** | D2 / D5 / D8 — server-derived scope; no new RBAC model |
| 5 | Persistence owner | ✅ **ESTABLISHED** | D3 — IRR Server Tier |
| 6 | Persistence architecture dependency | ✅ **ESTABLISHED** | D3 — Gate-P Class C, distinct consumer boundary, foundation unmodified |
| 7 | Lifecycle semantics | ✅ **ESTABLISHED** | D6 / D7 — read/update/reset; revision model; versioning; offboarding requirement |
| 8 | Implementation repository | ✅ **ESTABLISHED** | D10 — IRR exclusive |
| 9 | Explicit exclusions | ✅ **ESTABLISHED** | §15 — 28-item authoritative exclusion set |
| 10 | Protected-foundation constraints | ✅ **ESTABLISHED** | §16 — consume-only; no foundation modification authorized |

**G3 disclosure (not a blocker; recorded transparently):** the browser→transport credential path remains an open platform dependency. NP-11 is authorized to proceed on the same basis as the accepted NP-09 and NP-10 capabilities — server-derived ownership scoping enforced at the governed server boundary, with the browser credential path supplied out-of-band. NP-11 must **not** weaken that boundary and must **stop and report** if it cannot safely consume it.

**Disposition:**

> **READY FOR IMPLEMENTATION GATE**

**Next stage:** a separate, explicitly convened **NP-11 Settings / Configuration Implementation Gate**, bound by this contract. No implementation is authorized by this record.

---

## 19. Affirmed Non-Actions of This Gate

This governance gate recorded a decision only. It performed **no** implementation:

- no Settings UI, route, navigation entry, API, transport, service, schema, or persistence;
- no theme, identity, authentication, or persistence-infrastructure modification;
- no Watchlists, Collaboration, or PIT modification;
- no donor import, copy, cherry-pick, merge, or restore;
- no IPD mutation (0 changes; IPD HEAD unchanged at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`);
- no protected-foundation change.

Only this governance document is added.
