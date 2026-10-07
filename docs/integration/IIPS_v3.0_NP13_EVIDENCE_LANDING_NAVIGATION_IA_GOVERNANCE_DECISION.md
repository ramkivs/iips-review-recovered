# IIPS v3.0 — NP-13 Evidence Landing / Navigation IA Governance Decision

## Information-Architecture Decision & Authority Record for the `/evidence` Landing Surface

**Program:** IIPS Engineering Standards — Program v3.0  
**Workstream:** NP-13 — Evidence Landing / Navigation  
**Decision identifier:** NP-13-AUTH-01 — Evidence Landing / Navigation IA Decision (identifier assigned by this record, following the NP-09 / NP-10 / NP-11 convention)  
**Document type:** AUTHORITY DECISION — Governance & information-architecture record only (not implementation, certification, release, or production authority)  
**Version:** 1.0 — Decision  
**Date:** 2026-10-01  
**Repository:** `ramkivs/iips-review-recovered`  
**Branch:** `arena/01a0f351-iips-review-recovered`  
**IRR content baseline:** working tree byte-identical (1023 / 1023 files) to the remote branch tip `0feceafdd9d948fc9b3c78edb075ccf52b254254` (NP-11 implementation). Local Git `HEAD` is `bfe85a7ecaf690f4ff00f2878714eb594a3536b8` (shallow clone) — see §2; preserved, not reconciled.  
**IPD reference baseline:** `ramkivs/iips-production-market-data` `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c` (READ ONLY — 0 mutations)  
**Governing evidence:** NP-13 read-only investigation (preceding gate), re-verified in this gate (§3)  
**Status:** **ACCEPTED — PROGRAM AUTHORITY IA DECISION RECORDED**  
**Authority:** Program Authority — human product and architectural decision  
**Implementation boundary:** This record establishes the information-architecture decision for `/evidence` and the boundary that binds a later implementation. It does **NOT** grant implementation authority, production authority, certification authority, or release authority. Implementation remains withheld until a separate Implementation Gate is convened.

---

## 1. Executive Summary

The NP-13 read-only investigation concluded `NP-13 EVIDENCE LANDING / NAVIGATION — INVESTIGATION COMPLETE / IA DECISION READY`. Program Authority now records the narrow information-architecture contract for the `/evidence` landing.

Every investigation finding was re-verified in this gate against the working tree (§3). In summary:

1. `/evidence` is a placeholder. `/evidence/:id` (Evidence Explorer) and `/evidence/replay/:id` (Replay Explorer) are operational for all 13 governed subjects.
2. Evidence and replay are read-only, SNAPSHOT-labelled, and computed from the frozen v1.1 Replay Baseline. No persistence is involved.
3. No evidence collection endpoint exists, but four existing governed reads already enumerate the 13 subjects under the operational sector-name identity.
4. The Sidebar's Evidence entry already targets `/evidence`. The declared child entries (Decision Evidence, Snapshots, Replay) are not rendered.
5. `/evidence/snapshots` and bare `/evidence/replay` collide with the dynamic `/evidence/:id` route. `ev_Banking` does not resolve; `Banking` does.
6. IPD's `/evidence` is a different market-data provenance surface and is non-authoritative for this decision.

Program Authority therefore establishes:

> **NP-13 `/evidence` = THE IIPS DECISION EVIDENCE ENTRY — A READ-ONLY LANDING / INDEX INTO THE EXISTING GOVERNED EVIDENCE SUBJECTS**

| Element | Authoritative value |
| :--- | :--- |
| **Surface** | `/evidence` — the existing route; replaces the existing placeholder; no new route |
| **Role** | Read-only landing / index |
| **Subject identity** | The existing sector name (not `ev_*`) |
| **Destination of each subject** | The existing `/evidence/:id` |
| **Data source** | Existing governed reads through existing typed clients only |
| **Persistence** | None |
| **Navigation** | The existing Evidence sidebar entry; no new entry; no shell-wide child-rendering change |
| **Evidence / Replay contracts** | Unchanged and protected |
| **Governance record** | This document |

---

## 2. Repository State Disclosure (Preserved — Not Reconciled)

The local repository state is anomalous. It is recorded here exactly as observed and was **not** altered by this gate.

| Item | Observed |
| :--- | :--- |
| Local `HEAD` | `bfe85a7ecaf690f4ff00f2878714eb594a3536b8` ("Merge G-2 governance recording") |
| Shallow clone | **true** (shallow boundary `bfe85a7…`) |
| Remote branch tip | `0feceafdd9d948fc9b3c78edb075ccf52b254254` — a descendant of local `HEAD`, **7 commits ahead**: `ceec1bd`, `fbe7649`, `3b8c3b5`, `f5a5647`, `ba8ea1d`, `a75b346`, `0feceaf` |
| `0feceaf…` in the local object store | **absent** |
| Upstream tracking | none configured |
| Working tree before this gate | 38 entries (7 modified tracked + 31 untracked): the NP-09 / NP-10 / NP-11 implementation and governance files |
| Working tree vs remote tip | all **1023** files byte-identical by Git blob hash (0 different, 0 remote-only, 0 local-only) |
| Behavioural check on that content (scratch copy) | full suite **518 passed / 2 failed / 25 skipped** (46 files) — identical to the NP-11 qualified baseline; the two failures are the pre-existing `server/product-transport.test.ts` (taxonomy categories) and `server/pit/pitRuntimeIntegration.test.ts` (IU5R-13) |
| Consequence | A commit created on the local `HEAD` could not be pushed to the remote branch without a **non-fast-forward** condition |
| Disposition of this gate | State preserved. No fetch, unshallow, reset, rebase, merge, commit, or push was performed in this repository. This record is added as an **uncommitted working-tree file**. Reconciliation requires separate, explicit authorization and is not performed or authorized here. |

The comparison used a scratch bare repository outside this repository. This repository's `HEAD`, refs, and shallow boundary were unchanged, and the remote tip commit remains absent from its object store (verified before and after).

---

## 3. Observed Facts

Facts are observations. They confer **no authority**; authority derives only from §4–§6. Line numbers refer to the working-tree content (= remote tip `0feceaf`).

**Method key:** **S** = source inspection · **R** = runtime probe on a scratch copy of the working tree outside the repository (the real composed `executive-transport` server and the real `App` route table, rendered in jsdom — not a real browser) · **D** = document inspection.

### 3.1 Fact register

| ID | Observed fact | Evidence | Method |
| :--- | :--- | :--- | :--- |
| F-01 | `/evidence` is a **placeholder**: it renders `FeaturePlaceholder surface="Evidence"` → `NotYetAuthorized` ("Evidence — not yet built … No feature data is fabricated"). It issues no API request. | `App.tsx:46`; `ShellStates.tsx` `NotYetAuthorized`; probe: placeholder text rendered, 0 fetches | S, R |
| F-02 | `/evidence/:id` is **operational**: `EvidenceExplorer` → `GET /api/evidence/:id`. **13 / 13** governed subjects return 200 with `evidence.evidenceId = ev_<sector>` and `provenance.freshness = SNAPSHOT`. | `App.tsx:47`; `api/evidence.ts:37`; server probe 13/13; `server/product-transport.test.ts:211` | S, R |
| F-03 | `/evidence/replay/:id` is **operational**: `ReplayExplorer` → `GET /api/replay/:id`. **13 / 13** return 200 with `reproduced: true`, `byteIdentical: true`, `differenceAvailable: false`, `freshness: SNAPSHOT`. | `App.tsx:48`; `api/replay.ts:27`; server probe 13/13 | S, R |
| F-04 | The governed subject set is the frozen v1.1 Replay Baseline's 13 sectors: Banking, Insurance, Capital Markets, Healthcare, Hospitality, Energy, Utilities, Consumer, Industrials, Technology, Telecommunications, Automobile, Materials & Metals. | `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` (`sectors`: 13); `executive-transport.ts:74` | S, R |
| F-05 | Evidence and replay are **read-only**, computed per request from the frozen baseline and golden expected-outputs. `executive-transport.ts` contains no reference to `PersistenceService`, `IIPS_DATA_DIR`, or any filesystem write; exercising every read created no data directory. | `executive-transport.ts:349-449`; search of the file; probe: no `.iips-data` created | S, R |
| F-06 | **Evidence → detail → replay as implemented:** detail → replay link (`Open full replay explorer →`); replay → detail link (`Back to Evidence →`); replay → company; company → replay. **No in-app link targets `/evidence`**, and no non-replay surface links to `/evidence/:id`. Detail is therefore reachable only from replay (or by direct URL), and the top hop `/evidence → /evidence/:id` does not exist because `/evidence` is a placeholder. | `EvidenceExplorer.tsx:88`; `ReplayExplorer.tsx:98,101`; `CompanyIntelligence.tsx:96`; probe link extraction | S, R |
| F-07 | Executive and Portfolio render governed evidence references as **unlinked text** (`EvidenceCard`). | `ExecutiveDashboard.tsx:43,120`; `PortfolioWorkspace.tsx:133`; `EvidenceComponents.tsx:79-85` | S |
| F-08 | **Navigation:** the nav data model declares Evidence with children Decision Evidence (`/evidence`), Snapshots (`/evidence/snapshots`), Replay (`/evidence/replay/:id`), but the Sidebar maps **top-level items only**; child entries are not rendered. The rendered Evidence entry targets `/evidence` for viewer, analyst, and admin. | `navigation.ts:56-65`; `Sidebar.tsx:27-44`; probe: rendered primary-nav links per role | S, R |
| F-09 | **Route table:** `ROUTES.evidenceSnapshots` is declared, but `App.tsx` registers no `/evidence/snapshots` route and none for bare `/evidence/replay`. | `routes.ts:28`; `App.tsx:46-48` | S |
| F-10 | **Collision observed:** `/evidence/snapshots` and bare `/evidence/replay` resolve to `EvidenceExplorer` with `id` = `snapshots` / `replay`, issue `GET /api/evidence/snapshots` / `GET /api/evidence/replay`, and render "Unable to load evidence: Error: evidence transport returned 404". The same occurs for undeclared words (`lineage`, `ev_Banking`, `NoSuchSector`). | probe (real `App` + real transport) | R |
| F-11 | **Identity:** the evidence/replay resolver matches the sector name **case-insensitively**. `ev_Banking` and `snap_Banking` return 404 (`company not found`), as do `snapshots`, `replay`, `lineage`, `audit`, `history`, `index`. `ev_<sector>` is the **emitted** `evidenceId` / `evidenceRefs` value and the NP-10 Collaboration evidence-subject identity — it is not a route or transport key. | `executive-transport.ts:351,396,609-611`; `collaboration-resolvers.ts:37,69-71`; probe | S, R |
| F-12 | There is **no evidence collection/index endpoint** and no Snapshots / Lineage / Audit endpoint: `/api/evidence`, `/api/evidence/`, `/api/replay`, `/api/replay/`, `/api/snapshots`, `/api/lineage`, `/api/audit` all return 404. | `executive-transport.ts:786-803,828`; probe | S, R |
| F-13 | **Existing governed reads already enumerate the 13 subjects** with the sector-name identity: `/api/executive` (`decisions`, `ranking`), `/api/portfolio` (`holdings`), `/api/cross-sector` (`decisions`, `ranking`), `/api/decision-matrix` (`companies`) each return exactly the 13 baseline names (set-equality verified). The `opportunity` arrays of `/api/executive`, `/api/portfolio`, `/api/cross-sector` carry **10 rows** (omitting Banking, Energy, Telecommunications) and are **not** enumerations. Typed clients: `fetchExecutiveData`, `fetchPortfolioData`, `fetchCrossSectorData`, `fetchDecisionMatrixData`. | `api/executive.ts`, `api/portfolio.ts`, `api/crossSector.ts`, `api/decisionMatrix.ts`; probe | S, R |
| F-14 | **Read posture:** those reads, `/api/evidence/:id`, `/api/replay/:id`, and `/api/company/:id` are **unguarded GETs** of the reference SNAPSHOT on the development-mode transport (the evidence/replay handlers also do not check the HTTP method and remain side-effect free — pre-existing, unchanged). The NP-09 / NP-10 / NP-11, admin, and ai-advisory namespaces are `SecuredExecutor`-guarded and fail closed (401) without an IdP. `GET /api/engines` is an explicitly public registry. | `executive-transport.ts` header (lines 14-21); `645-733`; `735`; `781-827`; probe | S, R |
| F-15 | **Linking by exact sector name round-trips:** raw and `encodeURIComponent` targets for `Capital Markets` and `Materials & Metals` (detail and replay) resolve to the same subject through the existing router and transport. | probe | R |
| F-16 | **Existing authority:** the Phase 1 IA lists Evidence → Decision Evidence, Snapshots, Replay, Lineage, Audit with a contract map; the Phase 1 navigation model defines the decision → evidence → snapshot → replay spine and a route model including `/evidence`; the Phase 10 / Phase 11 completion records define the display-only evidence and replay contracts and hard stops. **None defines the content of `/evidence`, nor any evidence persistence, ownership, identity, or lifecycle** (searches for "evidence landing", "evidence index", "evidence persistence", "evidence ownership", "evidence lifecycle", "canonical evidence", "evidence archive": 0 hits). | `docs/v3.0/information-architecture.md` §1-§3; `docs/v3.0/navigation-model.md` §2-§3; `PROGRAM_v3.0_PHASE10_COMPLETION.md` §1, §13; `PROGRAM_v3.0_PHASE11_COMPLETION.md` §1, §16 | D |
| F-17 | **Snapshots, Lineage, Audit, history/archive are not established product capabilities:** no route handler, component, or endpoint exists; Evidence-level audit is "not part of the Evidence surface" (Phase 10 §1); every replay reports `differenceAvailable: false`; every payload is SNAPSHOT; golden fixtures must not be represented as live history. | `PHASE10_COMPLETION.md` §1; `PHASE11_COMPLETION.md` §1, §16; `g3-readiness-assessment.md` §6; F-09, F-12 | S, D, R |
| F-18 | **Existing tests:** no test asserts the `/evidence` placeholder (`App.test.tsx` asserts only the `/nonsense` unknown-route placeholder). The explorers are tested on isolated routes only (`EvidenceExplorer.test.tsx` 6, `ReplayExplorer.test.tsx` 6). `product-transport.test.ts:211` exercises evidence and replay for all 13 subjects. | test files; scratch full-suite run (§2) | S, R |
| F-19 | **IPD `/evidence` is a different surface:** a Path-L, presentation-only market-data provenance auditor (UI11 provenance-auditor view-model; no API calls; renders an unavailable state by default). IPD's `/evidence/:id` and `/evidence/replay/:id` are fail-closed structural placeholders. | IPD `frontend/src/app/App.tsx`; `frontend/src/features/evidence/EvidenceSurface.tsx` header (read-only scratch clone at `4d3e1cd…`) | S |

### 3.2 Authority map

| Category | Items |
| :--- | :--- |
| **EXISTING AUTHORITY** | Phase 1 IA and Navigation Model (Evidence children; spine; route model); Phase 10 / Phase 11 completion records (display-only evidence and replay contracts; hard stops); NP-10 record Decision 3 (`evidence` is a permitted governed reference object resolved against the certified universe); G3 boundary and readiness records (disclosure) |
| **EXISTING IMPLEMENTATION** | `/evidence/:id` and `/evidence/replay/:id` surfaces; `api/evidence.ts`, `api/replay.ts`; `computeCertifiedEvidence` / `computeCertifiedReplay` and their handlers; the four governed enumeration reads (F-13) |
| **EXISTING EVIDENCE** | F-01 – F-19 |
| **MISSING GOVERNANCE (closed by this record)** | The content and role of `/evidence`; reserved-path handling; the identity boundary for the landing |
| **MISSING GOVERNANCE (remains open)** | A canonical evidence identifier (sector name vs `ev_*`); any Snapshots / Lineage / Audit / history contract; G3 |
| **MISSING IMPLEMENTATION** | The `/evidence` landing; reserved-path handling; Snapshots, Lineage, Audit, history/archive |

### 3.3 Not verified / not claimed

- Behaviour in a real browser (probes ran in jsdom).
- Whether the currently unguarded reads (F-14) stay unguarded after any future G3 remediation — **NOT VERIFIED**, out of scope.
- Visual, accessibility, and copy design of the landing — out of scope for this record.

---

## 4. Governance Decisions D1–D6

The text of D1–D6 below is the authoritative decision text, recorded verbatim.

### D1 — `/evidence` role

`/evidence` is the IIPS **Decision Evidence** entry.

It replaces the existing placeholder at the same route.

It is a read-only landing/index surface.

No new route is introduced.

### D2 — Existing evidence subjects

The landing lists the existing governed evidence subjects and links each subject to:

    /evidence/:id

The existing sector-name identity is authoritative for this implementation.

Values and labels must be presented using the existing governed data and existing CERTIFIED / SNAPSHOT semantics.

If the governed read is unavailable, use the existing unavailable/error state.

Do not invent fallback evidence.

### D3 — Data source boundary

The landing may consume only existing governed reads through existing typed clients.

No new endpoint is authorized.

No new DTO is authorized.

No transport modification is authorized for the landing.

The exact choice between the already-existing governed reads may be determined during implementation, provided it does not alter their semantics.

### D4 — Primary navigation

No new primary navigation entry is authorized.

The existing Evidence sidebar entry remains the primary destination.

Do not modify shell-wide child rendering as part of NP-13.

### D5 — Reserved evidence routes

The following are NOT established capabilities:

- Snapshots

- Lineage

- Audit

- Evidence history/archive

Therefore they must not be presented as available functionality.

In particular:

    /evidence/snapshots

must not be allowed to resolve accidentally as an evidence subject.

An explicit unavailable state for the reserved snapshots surface is permitted only if required to prevent the route collision; this does not authorize a Snapshots capability.

The same principle applies to reserved replay paths.

### D6 — State and semantics

The `/evidence` landing has:

- no persistence;

- no per-user state;

- no user-owned evidence state;

- no history/archive semantics;

- no claim of live replay;

- no replay execution;

- no evidence generation.

It is strictly a read-only index into already-existing governed evidence.

---

## 5. Implementation Boundary

### 5.1 Identity boundary

The investigation found that:

    ev_Banking

does not resolve through the current evidence transport.

The currently operational identity is the sector name itself:

    Banking

Therefore implementation must NOT silently introduce an `ev_*` identity bridge.

Use the existing resolver/identity semantics exactly as currently implemented.

If a future canonical evidence identifier is desired, that requires a separate governance decision.

### 5.2 Route-collision boundary

The investigation found:

    /evidence/snapshots

and bare:

    /evidence/replay

can currently collide with the dynamic:

    /evidence/:id

route.

This governance decision does not authorize a general routing redesign.

It authorizes only the minimum route handling necessary to ensure reserved Evidence paths do not accidentally resolve as evidence IDs.

Any broader route architecture change is out of scope.

### 5.3 Protected Evidence / Replay contract

Do not alter:

- existing Evidence DTO semantics;

- existing ReplayResult semantics;

- Phase 10 evidence hard stops;

- Phase 11 replay hard stops;

- frozen Replay Baseline semantics;

- deterministic evidence construction;

- SNAPSHOT/CERTIFIED labelling;

- transport semantics.

Do not recompute, enrich, reinterpret, or invent evidence values.

### 5.4 Binding implementation constraints (derived consequences)

The following are consequences of D1–D6, §5.1–§5.3, and the facts in §3. They add **no new product decision**. Where a constraint cannot be met, IB-8 applies.

| ID | Constraint | Basis |
| :--- | :--- | :--- |
| **IB-1** | **Change surface.** The implementation is additive and confined to: (a) the `/evidence` route element in `frontend/src/app/App.tsx` (replacing `FeaturePlaceholder surface="Evidence"`); (b) new landing component(s) within `frontend/src/features/evidence/` (existing presentation components may be reused unmodified); (c) the minimum explicit route handling required by IB-4 in the same route table; (d) tests for (b) and (c), added without weakening or removing any existing assertion. Any file outside this surface → stop and report. | D1, D3, D4, §5.2, F-01, F-18 |
| **IB-2** | **Data source.** Only existing exported functions of existing typed clients in `frontend/src/api/`, as they exist today. Verified candidates that enumerate all 13 subjects: `fetchExecutiveData` (`decisions`, `ranking`), `fetchPortfolioData` (`holdings`), `fetchCrossSectorData` (`decisions`, `ranking`), `fetchDecisionMatrixData` (`companies`). The choice among them is left to the Implementation Gate (D3). No new client function, DTO, endpoint, or transport change. The chosen read must yield **all 13** subjects; the `opportunity` arrays (10 of 13) must not be used to enumerate. Governed values are shown as returned — no client-side recomputation, enrichment, or reinterpretation. If the read is unavailable → existing unavailable/error state; no fallback evidence. | D2, D3, §5.3, F-13 |
| **IB-3** | **Identity and links.** Each subject links to `/evidence/:id` where `:id` is the exact sector name emitted by the chosen read. No `ev_*`, `snap_*`, `companyId`, or other identity form is used to build links or resolve subjects. Existing resolver semantics (case-insensitive sector-name match) are unchanged. | D2, §5.1, F-11, F-15 |
| **IB-4** | **Reserved paths.** Minimum explicit route handling so that `/evidence/snapshots` and bare `/evidence/replay` do not resolve as evidence subjects (they must not trigger `GET /api/evidence/snapshots` or `GET /api/evidence/replay`). The handling presents no Snapshots or Replay capability, uses an existing unavailable / not-yet-built shell state or an equivalent minimal mechanism chosen at the Implementation Gate, and is not a general routing redesign. Of the surfaces named in D5, only Snapshots has a declared route (`ROUTES.evidenceSnapshots`); Lineage, Audit, and history/archive have none, so no additional route handling is authorized for them — they must simply not be presented as available (no tile, link, or label offering them). Undeclared paths (e.g. `/evidence/lineage`) keep their existing fail-closed behaviour (F-10). | D5, §5.2, F-09, F-10, F-17 |
| **IB-5** | **Navigation.** No change to `navigation.ts`, `Sidebar.tsx`, `AppShell.tsx`, or any shell-wide rendering. Declared child entries (Decision Evidence, Snapshots, Replay) remain unrendered and must not become visible as a side effect. The Evidence sidebar entry (→ `/evidence`) remains the primary destination. No links are added to Executive, Portfolio, Decision Matrix, Collaboration, or any other surface. | D4, F-07, F-08, non-scope |
| **IB-6** | **State.** No persistence; no per-user or user-owned state; no browser storage; no new server module; no `PersistenceService` or journal; no `SecuredExecutor`; no session or identity consultation; no replay call or execution; no evidence generation. The landing reads and links only. | D6, F-05, F-14 |
| **IB-7** | **Protected components and contracts.** `EvidenceExplorer`, `ReplayExplorer`, `EvidenceExplorerComponents`, `api/evidence.ts`, `api/replay.ts`, the evidence/replay DTOs, `executive-transport.ts`, `ReplayService`, `EvidencePipeline`, the frozen Replay Baseline and golden outputs, SNAPSHOT/CERTIFIED labelling, and all NP-09 / NP-10 / NP-11 code are **not modified**. No new links are added inside the existing explorers. | §5.3, non-scope, F-02, F-03 |
| **IB-8** | **Fail closed.** If D1–D6 cannot be satisfied without (a) a new endpoint, DTO, or client function; (b) a transport change; (c) a credential, identity, or authorization mechanism; (d) persistence; (e) modifying a protected foundation or component; or (f) a general routing or shell redesign — **stop and report the dependency or governance gap.** Never weaken a boundary to make the landing possible. | D3, D4, D6, §5.2, §5.3 |

---

## 6. Explicit Non-Scope

This record does not authorize anything beyond D1–D6. The non-scope text is recorded verbatim.

This governance decision does NOT authorize:

- replay expansion;

- replay redesign;

- replay diffs;

- new replay execution;

- new evidence generation;

- new evidence persistence;

- an evidence index API;

- Snapshots implementation;

- Lineage implementation;

- Audit implementation;

- evidence history/archive;

- provider integration;

- live-data evidence;

- production activation;

- new identity;

- new authorization;

- reopening NP-04;

- changing Gate-P;

- modifying NP-09 Watchlists;

- modifying NP-10 Collaboration;

- modifying NP-11 Settings / Configuration;

- shell-wide navigation redesign;

- adding decision-surface links to Executive, Portfolio or Decision Matrix;

- Collaboration navigation changes.

Those remain future/deferred work unless separately authorized.

---

## 7. Deferred Work

Each item below is **future / deferred** and is not current scope. None is authorized by this record.

| Deferred item | Note |
| :--- | :--- |
| Snapshots capability | No route handler, component, or endpoint exists (F-09, F-12, F-17). Requires its own contract. |
| Lineage and Evidence-level Audit | Phase 10 §1: audit is available at the platform layer and "not part of the Evidence surface". |
| Evidence history / archive; live-data evidence | Every payload is SNAPSHOT; golden fixtures must not be represented as live history (G3 readiness §6). |
| Replay expansion, redesign, diffs, new modes | Phase 11 hard stop: `differenceAvailable: false`. |
| Canonical evidence identifier | Sector name (route/transport key) vs `ev_*` (emitted id; NP-10 evidence-reference identity) — unification would touch the evidence transport and NP-10 and needs a **separate governance decision** (§5.1). |
| Evidence index API | No collection endpoint exists (F-12); the landing consumes existing reads instead (D3). |
| Decision-surface links to evidence | Navigation Model §2 states every decision surface links forward to its evidence and replay; Executive and Portfolio currently show evidence unlinked (F-07). Not authorized here. |
| Shell-wide rendering of declared child navigation | D4. |
| Collaboration navigation changes | Non-scope. |
| Affordances inside the existing explorers (e.g. a back-link to the landing) | Protected components (IB-7); would need separate authorization. |
| G3 remediation; production activation | §9. |

---

## 8. Statements of Record

- **Evidence remains read-only.** The landing performs reads only and creates, modifies, and deletes nothing.
- **Existing evidence detail and replay remain authoritative within their existing scope.** `/evidence/:id` and `/evidence/replay/:id` are unchanged by NP-13 and are not reinterpreted by this record.
- **NP-13 does not create persistence.** No journal, store, browser storage, or server module is introduced (D6, IB-6).
- **NP-13 does not depend on Gate-P / NP-04.** The landing consumes no persisted state (F-05); NP-04 is not reopened and `PersistenceService` is not touched.
- **G3 remains unresolved.** See §9.
- **Production remains out of scope.** The evidence served is the non-production reference SNAPSHOT; this record grants no production, certification, or release authority.

---

## 9. Remaining G3 Disclosure

**G3 (the enterprise identity / tenant boundary and the browser→transport credential path) remains OPEN and UNRESOLVED.** This record does not remediate, close, or claim it.

Disclosures specific to NP-13 (observed, not remediated):

1. The existing governed reads the landing may consume (F-13), like the existing `/api/evidence/:id` and `/api/replay/:id`, are served by the development-mode G2 transport as **unauthenticated GETs** of the **reference SNAPSHOT** (F-14). The landing inherits that posture unchanged; it neither strengthens nor weakens it.
2. That these reads work in a browser today is a property of the development-mode transport. It is **not** evidence that a browser credential path exists and must not be cited as such.
3. NP-13 introduces no credential, session, token, header, browser storage, identity, or authorization mechanism, and does not use `SecuredExecutor`. It must not attempt to solve G3 ad hoc.
4. If G3 later changes the posture of these reads, the landing inherits whatever the governed boundary then requires. Whether those reads will be guarded after G3 is **NOT VERIFIED**.
5. For contrast, the NP-09 / NP-10 / NP-11 namespaces are `SecuredExecutor`-guarded and fail closed (401) without a credential path. This record does not change that.

**Fail-closed rule:** if the Implementation Gate cannot satisfy D3 without introducing a credential path or altering a read's semantics, it must stop and report the dependency.

---

## 10. Protected Foundations

**NP-13 must consume, not redesign:**

| Foundation | Constraint |
| :--- | :--- |
| Evidence Explorer / Replay Explorer and their typed clients | Unmodified; no new links inside them |
| Evidence / Replay DTOs, `ReplayService`, `EvidencePipeline`, frozen Replay Baseline | Unmodified; no recomputation, enrichment, or reinterpretation |
| `executive-transport.ts` | Unmodified; no new endpoint |
| Phase 10 / Phase 11 hard stops | Honored |
| NP-04 / Gate-P `PersistenceService` | Not reopened; not touched; not required |
| NP-09 Watchlists | Unmodified |
| NP-10 Collaboration (including its `ev_*` evidence-reference identity) | Unmodified |
| NP-11 Settings / Configuration | Unmodified |
| `SecuredExecutor` and server-derived identity | Not used; not modified |
| Shell (`AppShell`, `Sidebar`, `navigation.ts`) | Unmodified; no shell-wide child-rendering change |
| PIT / IU-7, IU-8, closed RR ↔ IPD integration | Unmodified; IPD read-only |

**No modification of these foundations is authorized by this governance gate.** If an actual missing capability in a protected foundation is discovered, **stop and report it as a separate dependency**.

---

## 11. Decision Summary Matrix

| Decision | ID | Result |
| :--- | :--- | :--- |
| `/evidence` role | D1 | IIPS Decision Evidence entry; read-only landing/index; replaces the placeholder at the same route; no new route |
| Existing evidence subjects | D2 | Lists existing governed subjects; each links to `/evidence/:id`; sector-name identity; existing CERTIFIED / SNAPSHOT semantics; existing unavailable/error state; no fallback evidence |
| Data source boundary | D3 | Existing governed reads via existing typed clients only; no new endpoint, DTO, or transport change |
| Primary navigation | D4 | No new entry; existing Evidence sidebar entry remains primary; no shell-wide child-rendering change |
| Reserved evidence routes | D5 | Snapshots, Lineage, Audit, history/archive are not established and not presented as available; `/evidence/snapshots` and reserved replay paths must not resolve as subjects; minimum route handling only |
| State and semantics | D6 | No persistence, per-user state, user-owned state, history/archive, live-replay claim, replay execution, or evidence generation |
| Identity boundary | §5.1 | Sector name; no silent `ev_*` bridge; canonical id needs a separate governance decision |
| Route-collision boundary | §5.2 | Minimum route handling only; no general routing redesign |
| Protected contract | §5.3 | Evidence / Replay semantics, hard stops, baseline, labelling, and transport unchanged |
| G3 | §9 | Remains open; disclosed; not solved |

---

## 12. Implementation Readiness

All readiness preconditions for an implementation gate are satisfied by this record:

| # | Precondition | Status | Basis |
| :--- | :--- | :--- | :--- |
| 1 | IA role of `/evidence` | ✅ **ESTABLISHED** | D1 |
| 2 | Subject set and identity | ✅ **ESTABLISHED** | D2, §5.1, F-04, F-11 |
| 3 | Data source | ✅ **ESTABLISHED** | D3, F-13 (four verified candidate reads) |
| 4 | Navigation | ✅ **ESTABLISHED** | D4, F-08 |
| 5 | Reserved paths and collision handling | ✅ **ESTABLISHED** | D5, §5.2, F-09, F-10 |
| 6 | State and semantics | ✅ **ESTABLISHED** | D6 |
| 7 | Protected contracts | ✅ **ESTABLISHED** | §5.3, IB-7 |
| 8 | Persistence / Gate-P / NP-04 dependency | ✅ **NONE REQUIRED** | F-05, §8 |
| 9 | Identity / authorization dependency | ✅ **NONE NEW** | F-14, §9 (G3 disclosed, not a blocker) |
| 10 | Explicit non-scope | ✅ **ESTABLISHED** | §6 |

**Reference baseline for later gates:** the working-tree content corresponds to the NP-11 implementation tip (`0feceaf`) with full suite **518 passed / 2 failed / 25 skipped**; the two failures are pre-existing (§2).

**Repository-state dependency (not a governance blocker):** the local Git state is anomalous and unreconciled (§2). No commit of this record or of any implementation should be made on the unreconciled local `HEAD`; reconciliation requires separate, explicit authorization.

**G3 disclosure (not a blocker; recorded transparently):** see §9.

**Disposition:**

> **READY FOR IMPLEMENTATION GATE**

**Next stage:** a separate, explicitly convened **NP-13 Evidence Landing / Navigation Implementation Gate**, bound by this record. No implementation is authorized by this record.

---

## 13. Affirmed Non-Actions of This Gate

This governance gate recorded a decision only. It performed **no** implementation:

- no route, navigation, component, client, transport, service, test, or configuration change;
- no persistence, journal, store, or browser-storage change;
- no replay, evidence, or Collaboration / Watchlists / Settings modification;
- no donor import, copy, cherry-pick, merge, or restore;
- no IPD mutation (0 changes; IPD HEAD unchanged at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`);
- no commit, push, fetch, unshallow, reset, rebase, merge, or stash in this repository;
- no reconciliation of the local Git state (§2).

Only this governance document is added, as an uncommitted working-tree file.
