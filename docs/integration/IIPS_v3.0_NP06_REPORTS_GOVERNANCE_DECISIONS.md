# IIPS v3.0 — NP-06 Reports Governance Decisions

## Reports Capability Governance Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** NP-06 — Reports (governance record)

**Document type:** GOVERNANCE DECISION RECORD — recording already-accepted NP-06 governance (not implementation, certification, release, or production authority)

**Version:** 1.0 — Recording

**Date:** 2026-10-02

**Branch:** `arena/01a0f1b3-iips-review-recovered` (record branch); governance home is IRR `main`

**IRR authority baseline:** `ramkivs/iips-review-recovered` `main@45768643cafecc97c6e4a3f2d40c2a4e42e6fb6a` (tree `72ce4a6e011807aa34731cffb298a93d1b5e5f00`)

**IPD architecture baseline:** `ramkivs/iips-production-market-data` `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`

**Status:** **ACCEPTED — GOVERNANCE RECORDED; IMPLEMENTATION AUTHORITY WITHHELD**

**Authority:** Ramki / Program Authority — recording of accepted NP-06 governance gates G01–G08

**Recording basis:** This document **records** decisions already accepted through NP-06-G01 … NP-06-G08. It does not reinterpret, rank, revise, extend, or re-decide any of them. Sections 1–4 are transcription. Section 5 is a non-policy specification annex. Sections 6–7 record the external dependency boundary and current disposition.

**Implementation boundary:** This record establishes Reports governance direction only. It does **not** authorize implementation of `/api/reports`, Reports UI, Reports navigation, persistence, authentication, authorization, or any modification of G3, NP-04, or the frozen CSIP `ReportingEngine`.

---

## 0. Why this record exists

Prior to this record, the NP-06 Reports governance decisions existed only conversationally. Verification at the recording baseline established that:

- no NP-06 governance document existed in IRR (0 documents matching `NP-06`);
- the symbols `reportKey`, `supersedesReportId`, and `artifactVersion` appeared **nowhere** in IRR;
- no Reports implementation, route, feature, test, or API client existed.

This is a governance durability gap of the same class as the earlier NP-04 implementation durability failure: accepted decisions with no durable repository record are lost if the record of their acceptance is lost. This record closes that gap for NP-06 governance. It closes nothing else.

---

## 1. Accepted decisions (transcription — NP-06-G01 … G06)

### R1 — Product capability

Reports **is** a product-level capability.

### R2 — Identity and ownership

Ownership is by **authenticated application principal / user ownership**, keyed on:

`(tenantId, userId)`

`companyId` and `runtimeCompanyId` are **not** part of the Reports identity boundary and must not be introduced as such. Company/tenant ownership becomes applicable only when an authoritative D115 establishes it.

### R3 — Lifecycle

Reports lifecycle is **DURABLE**. Reports artifacts are stored through the **common governed persistence authority**. A Reports-specific persistence store is prohibited.

### R4 — Scope

Initial Reports scope is **cross-sector**. Sector-level reporting is **deferred**.

### R5 — Canonical representation

The canonical representation of a report is a **structured report artifact**. UI rendering and file export (PDF, CSV, etc.) are **downstream projections**, never the canonical form.

---

## 2. Product contract (transcription)

### D3 — Report identity and versioning model

The report identity/versioning model is established as:

- `reportKey` — deterministic **content** identity;
- `reportId` — durable, globally unique **instance** identity;
- `schemaVersion` — explicit;
- `artifactVersion` — explicit;
- `generatedAt` — explicit;
- `supersedesReportId` — explicit.

`reportKey` and `reportId` are distinct and must never be conflated. The frozen CSIP `reportId` remains unchanged by this record.

### D8 — Product placement

Reports is the **seventh L1 product section**, presented with progressive disclosure:

1. summary;
2. detail;
3. evidence / provenance;
4. replay / reference.

---

## 3. Engine boundary (transcription)

### G11 — CSIP ReportingEngine placement

The existing CSIP `ReportingEngine`
(`iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine.ts`,
blob `1149864a8c43e8b885eee2c4a9a1ce869dd8f338` at the recording baseline)
**remains frozen**. It is **not relocated and not modified**.

Product Reports is a **new product-tier composition capability** that consumes the frozen CSIP `ReportingEngine` through a governed boundary. Reports is not a promotion, wrapper-forum, or relocation of the CSIP stage.

---

## 4. Identity and versioning rules (transcription — C1 … C4)

### C1 — `artifactVersion`

- starts at `1`;
- increments **monotonically**;
- increments **only** for authorized new lifecycle versions;
- **identical canonical inputs do not cause a version increment**.

### C2 — `reportKey` canonicalization

`reportKey` canonicalization follows the established schemaVersion-1 canonicalization contract, formally specified in Section 5.2 of this record. C2 is unchanged by that specification; the specification records it.

### C3 — Supersession

Supersession is **append-only**, **single-parent**, expressed through `supersedesReportId`.

### C4 — Ownership key

The ownership key is exactly:

`(tenantId, userId)`

---

## 5. NP-06 readiness specification annex (non-policy)

**Status of this annex:** these are **specifications** derived from the closed decisions in Sections 1–4. They are not new policy and create no new requirement. They are recorded here so that the readiness contract does not remain conversational.

### 5.1 Persistence consumer interface (specification only — not implemented)

Reports consumes a common governed persistence interface. Reports does **not** create the database, select an independent substrate, create a Reports-specific store, or generate its own durable sequence.

| Operation | Input | Output | Mutates |
|---|---|---|---|
| `createInstance` | `reportKey`, `reportType`, `portfolioId`, `scenario`, `schemaVersion`, `generatedAt`, `canonicalPayload`, `provenance` | `reportId` (assigned), `artifactVersion: 1` | Yes |
| `appendVersion` | `reportId`, `supersedesReportId?`, `schemaVersion`, `generatedAt`, `canonicalPayload`, `provenance` | `reportId`, `artifactVersion: n+1` | Yes — append-only |
| `resolveById` | `reportId`, `artifactVersion?` | canonical artifact | No |
| `queryByOwner` | cursor / limit / filter, scoped to principal | page of artifacts | No |
| `listSupersededBy` | `reportId` | current version + version history | No |

Required guarantees: globally unique durable `reportId`; immutable `(tenantId, userId)` ownership captured from the authenticated principal; append-only versions; explicit `artifactVersion` and `supersedesReportId`; explicit `schemaVersion` and `generatedAt`; durability across restart; atomic failure with no partial artifact; cross-owner reads denied without existence disclosure.

**`createInstance` must assign `reportId`.** The frozen engine's content-derived identifier
(`ReportingEngine.ts:50` — `` report-${reportType}-${portfolioId} ``) is deterministic content
identity and must never be used as durable instance identity.

### 5.2 Canonical `reportKey` (records C2)

**Canonical members — exactly four:** `reportType`, `portfolioId`, `scenario`, `parameters`.
No additional identity members may be introduced. `reportId` is excluded by construction.

**Canonicalization:**

1. UTF-8 canonical JSON.
2. Fixed top-level member order: `reportType`, `portfolioId`, `scenario`, `parameters`.
3. `parameters` sorted by code point of member name.
4. Parameters are schemaVersion-1 flat primitives (string, number, boolean, null). Nested
   objects or arrays are out of contract and must be rejected, not flattened.
5. An absent optional member is represented as explicit `null` — never omitted.
6. Numbers use the shortest round-trip decimal representation.
7. Strings escaped per JSON; `"`, `\`, and control characters escaped.
8. No case folding.
9. No Unicode normalization.
10. `reportKey` = lowercase hex SHA-256 over the canonical UTF-8 bytes.

**Identity distinction:** `reportKey` is deterministic **content** identity — the same canonical
input always yields the same key. `reportId` is durable **instance** identity — a new instance
receives a new identifier even when its canonical content is identical.

### 5.3 Deterministic artifact validation contract

A future Reports implementation must validate, before accepting an artifact: `reportKey` (present,
64 lowercase hex, recomputes correctly); `reportId` (present, store-assigned, **not** the engine's
content-derived form); `reportType`; `portfolioId`; `schemaVersion`; `artifactVersion` (integer
≥ 1, contiguous); `supersedesReportId` (`null` iff `artifactVersion === 1`); `generatedAt`
(ISO-8601 UTC with explicit offset); `canonicalPayload` (re-canonicalizes byte-identically);
ownership `(tenantId, userId)` (equals creating principal, immutable); and provenance referencing
the originating CSIP `ReportingEngine` output.

Deterministic expectations: same canonical input ⇒ equivalent canonical content and identical
`reportKey`; separate durable instances of identical content ⇒ **different** `reportId`s and
identical `reportKey`; version advancement per C1; supersession per C3; CSIP engine treated as
read-only input.

### 5.4 Test-contract matrix (specification only — not implemented)

| # | Scenario | Expected | Contract proven |
|---|---|---|---|
| 1 | Unauthenticated Reports request | 401 | P1 authentication |
| 2 | Authenticated valid principal | authorized | P1 |
| 3 | Foreign-tenant access | 403 | tenant isolation |
| 4 | Ownership supplied in request body | rejected (400) | identity boundary |
| 5 | Valid `(tenantId, userId)` ownership | accepted (201) | R2 / C4 |
| 6 | Identical canonical inputs | same `reportKey`, different `reportId` | C2 + P2 identity |
| 7 | Append new version | `artifactVersion` + 1 | C1 |
| 8 | Supersession | valid single-parent chain | C3 |
| 9 | Mutation of a published artifact | rejected (409) | append-only |
| 10 | Cross-owner retrieval | denied (404) | ownership |
| 11 | Restart after committed write | artifact survives | durability |
| 12 | Failed persistence transaction | no partial artifact | atomicity |
| 13 | Invalid canonical artifact | rejected (422) | artifact validation |
| 14 | Concurrent `createInstance` | distinct `reportId`s | P2 identity |
| 15 | Frozen CSIP engine behaviour | unchanged | G11 |

Every deny path emits a governed deny audit; every accept path emits an allow audit recording
`(tenantId, userId)`, `reportId`, `artifactVersion`, and `reportKey`. Row 15 is evidenced by blob
comparison of `ReportingEngine.ts` against `1149864a8c43e8b885eee2c4a9a1ce869dd8f338`.

### 5.5 Product-layer composition boundary

**Frozen CSIP `ReportingEngine` → product-tier Reports composition → governed artifact → persistence → product projections.**

Reports may consume: CSIP `ReportingEngine` output; portfolio context; the authenticated principal;
the governed persistence interface of 5.1; the canonicalization rules of 5.2.

Reports must not: modify or relocate `ReportingEngine`; access sector-engine internals; duplicate
CSIP reporting logic beyond what composition requires; derive identity independently of 5.1/5.2;
create persistence independently; make UI representation canonical; make file export canonical.

### 5.6 L1 Reports placement (records D8)

Reports is the seventh L1 product section, a sibling of — not nested within — existing product
sections, cross-sector by default. Progressive disclosure levels:

1. **Summary** — identity fields (`reportType`, `generatedAt`, `schemaVersion`, `artifactVersion`), ownership scope, status.
2. **Detail** — the canonical structured payload; renders the canonical artifact, never redefines it.
3. **Evidence / provenance** — provenance references, `reportKey` derivation, supersession chain.
4. **Replay / reference** — `reportId` and `artifactVersion` handles for durable retrieval, plus the supersession pointer to the current version.

---

## 6. Dependency boundary

Reports implementation is externally dependent. NP-06 owns none of the following.

### P1 — owned by G3 (product-tier principal enforcement)

Outstanding requirements:

- a **production** `TenantDirectory` (the current `ADMIN_DIRECTORY` is a hardcoded test map and
  does not satisfy this);
- a **Reports resource gate** (the existing admin gate denies every non-`admin` action);
- **`/api/reports/*` binding** to `SecuredExecutor` at the product transport tier;
- **executed** 401 / 403 / ownership-binding proof.

**Already available for reuse:** `SecuredExecutor` (`frontend/server/secured-executor.ts`)
performs server-side principal establishment, issuer/audience/expiry validation,
platform-validated tenant resolution, role mapping, and tenant-first audited authorization. The
existing `/api/admin/*` and `/api/ai-advisory/*` bindings **fail closed** with 401 when no executor
is available (`executive-transport.ts:563`, `:576`). This pattern exists, is correct, and is
**not** an outstanding P1 requirement. No authentication architecture redesign is required.

### P2 — owned by NP-04 (common governed persistence)

Outstanding requirements:

- a governed persistence consumer interface;
- a durable authoritative substrate;
- an **authoritative pushed** implementation;
- globally unique durable `reportId`;
- append-only versioning and supersession;
- immutable `(tenantId, userId)` ownership;
- restart durability.

At the recording baseline, IPD `main` (`4d3e1cd`, 385 paths) contains zero persistence, sqlite,
NP-04, or migration paths; no IPD branch matching `np04` or `persistence` exists. No Reports
persistence exists in either authorized repository. Reports has no persistence-specific store and
prohibited none by this record.

---

## 7. Current disposition

> **Reports implementation authority remains WITHHELD pending P1/P2 dependency satisfaction and
> subsequent formal implementation-authority re-entry determination.**

No Reports product implementation exists at the recording baseline: no `/api/reports`, no Reports
feature directory, no Reports API client, no Reports product route, no Reports navigation
implementation, and no Reports persistence implementation.

This record does not grant implementation authority. It records that the authority is withheld.

---

## 8. Recording scope and limits

This record is:

- a **transcription** of NP-06-G01 … NP-06-G08 accepted governance (Sections 1–4);
- a **specification annex** recording the G08 readiness specifications (Section 5);
- a record of the **external dependency boundary** and **current disposition** (Sections 6–7).

This record does **not**:

- create, alter, weaken, or strengthen any Reports policy;
- modify R1–R5, D3, D8, G11, or C1–C4;
- introduce any new Reports requirement;
- grant implementation, certification, release, migration, deployment, or production authority;
- modify G3, NP-04, or the frozen CSIP `ReportingEngine`;
- record authority for any other NP or G workstream.

---

*End of record.*
