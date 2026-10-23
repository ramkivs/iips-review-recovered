# IIPS v3.0 — PKG-08 Matrix Rows 14 and 16 Option A Program Authority Disposition

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-PKG08-ROWS-14-16-OPTION-A-PA-DISPOSITION-2026-10-20-01` |
| Record type | **Program Authority product-boundary disposition** — documentation only. It commissions no implementation, listing, landing, persistence, archive, discovery, ownership/privacy, certification extension, production, or release |
| Decision | **`OPTION A`** — Row 14 **API-only / not a separate product surface**; Row 16 **direct-ID / no separate landing product** |
| Decision-maker | **Ramki (Ramakrishnan)** — IIPS Application Owner & **Program Authority**; sole Acceptance Authority |
| Decision date | 2026-10-20 |
| Decision channel | Explicit in-session authorization to Arena Agent Mode: **EXECUTION DIRECTIVE — OPTION A: DIRECT-ID / RESERVED-UNAVAILABLE** |
| Recorded by | Arena Agent Mode — verbatim capture of the authorized Option A, independent verification of cited repository evidence, and record rendering only. **No governance authority is held or claimed** |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` / `refs/heads/main` |
| Decision baseline (`origin/main`, verified live before preparation) | `99b90d0391f81b9104d012aa1572262c4b297fd3` |
| Companion tracker addendum | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.66 (`CV-CORR-49`) |
| Governing triage packet | `docs/integration/2026-10-18/PKG-08-IRR-SURFACE-SCOPE-ROWS-4-14-16.md` (historical questions preserved; this record is the disposition) |
| Precedent for non-build closure | CV-32 API-only / not-a-product-surface (`CV-CORR-38`, §16.55; PKG-05) |
| Status at preparation | **DECISION RENDERED — RECORDED — CANDIDATE.** Effective on merge to `refs/heads/main` and independent remote verification |

---

## 1. The authorized decision

The Program Authority explicitly authorized **Option A**. It is recorded here without broadening, weakening, or converting it into an implementation commission.

> **Row 14 — Evidence Snapshots: API-only / not a separate product surface.** Retain the reserved route as unavailable.
>
> **Row 16 — Replay Landing: direct-ID / no separate landing product.** Retain the existing UUID replay route and the reserved bare landing route as unavailable.

This is a **product-boundary decision**, not an implementation commission. Option A **affirms** NP-13 D5 / IB-4 and does **not** supersede them with a new Snapshots workspace or Replay landing.

---

## 2. PKG-08 closure fields (required by the packet)

PKG-08's closure rule requires, for each row, a separate retain/defer/commission outcome, decision owner, named consumer, acceptance criterion, and source evidence. Those fields are satisfied as follows. The packet's "if commissioned" evidence column does **not** apply.

### 2.1 Row 14 — Evidence Snapshots

| Closure field | Recorded value |
|---|---|
| Outcome | **Retain / API-only / not a separate product surface.** Not commissioned. Not deferred pending a future Snapshots workspace. Any future Snapshots UI is a **new** work item |
| Decision owner | Program Authority (Ramki) |
| Named consumer | **None for an IRR Snapshots workspace.** Platform `SnapshotStore` remains consumed only by platform runtimes (`RuntimeCoordinator` inside `computeCertifiedPlatform`). No IRR listing API or catalog consumer is designated |
| Acceptance criterion | `/evidence/snapshots` remains a reserved unavailable route (NP-13 D5 / IB-4). It must not resolve as an evidence subject. No Snapshots workspace, catalog, or `SnapshotStore` listing API is created. Engine `snapshot-1.0` objects are not conflated with Stage A `governed-screen-capture-1` captures. Durable history, restart recovery, discovery, archive, and ownership/privacy are not implied |
| Source evidence | This record; PKG-08 row 14 "otherwise record a deliberate deferral/API-only disposition"; NP-13 D5/IB-4; `App.tsx` reserved placeholder; `AVAILABLE_CHILD_PATHS` omission of Snapshots; Stage A §16.63.6 / §16.64.3 discovery/archive deferral |

**Disposition token: `API-ONLY / NOT A SEPARATE PRODUCT SURFACE`.**

### 2.2 Row 16 — Replay Landing

| Closure field | Recorded value |
|---|---|
| Outcome | **Direct-ID / no separate landing product.** Bare `/evidence/replay` retained as reserved unavailable. Not commissioned as a discovery/landing page |
| Decision owner | Program Authority (Ramki) |
| Named consumer | **No landing consumer.** Direct-ID consumers remain the existing Row 15 surfaces: Screener capture receipt (`/evidence/replay/{uuid}`) and `ReplayExplorer` at `/evidence/replay/:id` |
| Acceptance criterion | Bare `/evidence/replay` remains reserved unavailable and must not resolve as an evidence subject. `/evidence/replay/:id` continues to provide UUID inspection and manual independent replay under accepted Stage A semantics. No landing component, catalog, listing endpoint, discovery mechanism, or invented IDs/synthetic replay results are added |
| Source evidence | This record; PKG-08 row 16 "otherwise record direct-ID/API-only or deferred disposition"; NP-13 D5/IB-4; Stage A PR #162 / §16.63 / §16.64; reserved-route tests in `EvidenceLanding.test.tsx`; CV-41 nav honesty |

**Disposition token: `DIRECT-ID / NO SEPARATE LANDING PRODUCT`.**

---

## 3. Exact retained product boundary

### 3.1 Row 14 — retained / excluded

**Retain:**

1. NP-13 reserved-route protection: `/evidence/snapshots` mounts `FeaturePlaceholder` / `FeatureNotImplemented` and must not call `/api/evidence/snapshots`.
2. CV-41: Snapshots is **not** a clickable nav child (`AVAILABLE_CHILD_PATHS` does not include `/evidence/snapshots`).
3. Platform `iips-platform/src/snapshot/SnapshotService.ts` and `SnapshotStore.ts` as in-process engine snapshot objects (`snapshot-1.0`, `SNAP_*`), consumed by platform runtimes only.
4. Historical v1.1 platform snapshot/replay certification at its own recorded scope. This disposition does **not** withdraw or extend that certification.

**Do not:**

- Create a Snapshots workspace, catalog, or listing UI.
- Expose platform `SnapshotStore.list()` (or any enumerator) as an IRR HTTP API.
- Treat engine `snapshot-1.0` objects as Stage A `governed-screen-capture-1` Screen evaluation snapshots.
- Imply durable history, restart recovery, discovery, archive, or owner/privacy authorization from the word "snapshot".
- Change A13-protected paths, N4, E2E-030, or `ReplayService`.

### 3.2 Row 16 — retained / excluded

**Retain:**

1. NP-13 reserved-route protection: bare `/evidence/replay` mounts `FeaturePlaceholder` / `FeatureNotImplemented` and must not call `/api/evidence/replay`.
2. CV-41: Replay is **not** a clickable nav child (the declared path `/evidence/replay/:id` is parameterised and hidden).
3. Stage A capture / UUID inspection / independent replay, accepted under §16.64 for non-production exercised paths only:
   - `POST /api/replay/evaluations`
   - `GET /api/replay/evaluations/:uuid`
   - `POST /api/replay/evaluations/:uuid/replay`
   - UI: Screener retain-capture receipt → `/evidence/replay/{uuid}`; `ReplayExplorer`
4. Distinct truthful outcomes: `NOT_PERFORMED`, `ORIGINAL_UNAVAILABLE`, `MISSING_CONTEXT`, `UNSUPPORTED_VERSION`, `ORIGINAL_INVALID`, `EXECUTION_FAILED`, `COMPARISON_FAILED`, `COMPLETED_DIFFERENT`, `COMPLETED_EQUIVALENT`.
5. Legacy sector `GET /api/replay/:sector` availability-only (`original: null`, `NOT_PERFORMED`); product clients reject `reproduced` / `byteIdentical`.

**Do not:**

- Create a Replay landing component, catalog, listing endpoint, or discovery/search mechanism.
- Add `ScreenCaptureStore.list()` or any collection GET.
- Invent snapshot/replay IDs or fabricate comparison outcomes.
- Modify Stage A services, APIs, capture contracts, or outcome semantics.
- Reintroduce engine `ReplayResult` (`reproduced` / `byteIdentical`) on the product Screen-replay path.

### 3.3 Stage A (Row 15) — unchanged

Bounded non-production Stage A PA acceptance remains **in force** at implementation tree `21af28e30de338f46b4d3909a235cc2adcb37c1e`, 30-file fingerprint `e0187e64d414e2bf24c5aa66d6c4e7bccb860d6aa757aeead3ed872dceeea786`, merge `75f3e7434bf9a8335aad05356a0f78194dbce92f`, companion act `IIPS-V3-STAGE-A-EVIDENCE-SNAPSHOT-REPLAY-ACCEPTANCE-DECISION-2026-10-20-01` (§16.64 / PR #165).

This disposition **does not** reopen, narrow, or extend that acceptance. Durable history, restart recovery, discovery/archive, ownership/privacy, operator acceptance, platform certification extension, production, and release remain excluded exactly as in §16.64.3.

Historical §16.63.1 / §16.64 statements that Matrix rows 14 and 16 **remain open** described the state **before this Option A act**. They are preserved as historical text and are superseded for **current** row-14/16 IRR-surface status by this record and tracker §16.66.

---

## 4. Rationale

1. PKG-08 left rows 14 and 16 as triage questions. Its non-commission closure path is exactly **API-only / direct-ID / deferred disposition**. Option A selects that path.
2. NP-13 D5 already established that Snapshots (and reserved replay paths) are **not** established capabilities and must not be presented as available. IB-4 authorized only minimum reserved-route handling. Option A **affirms** that boundary.
3. Stage A already supplies the only authorized replay product path (UUID inspect/replay). A landing catalog would require listing/discovery, which Stage A deferred.
4. Platform `SnapshotStore` is a different object from Stage A captures. Wiring it as an IRR Snapshots surface would be a false product claim.
5. CV-32 is the governing precedent for closing an IRR matrix surface as **API-only / not a user-facing product feature** by dated disposition without code change.

---

## 5. Matrix effect

| Matrix row | Effect of this act |
|---|---|
| **14 — Evidence snapshots surface** | **CLOSED for the IRR Snapshots workspace / listing surface** as **API-only / not a separate product surface**. Reserved `/evidence/snapshots` remains unavailable. Historical v1.1 platform snapshot/replay certification is **unchanged** and is not an IRR Snapshots UI acceptance |
| **16 — Replay landing route** | **CLOSED** as **direct-ID / no separate landing product**. Reserved bare `/evidence/replay` remains unavailable. UUID replay remains Row 15 |
| **15 — Evidence replay + Stage A** | **Not closed or re-scoped.** Stale current-status wording that Stage A PA acceptance was "NOT RENDERED" is reconciled to §16.64. Substantive Stage A scope, exclusions, and A13 controls are unchanged |

No other matrix row, CV register item, Gate 3/4/5, Macro, Reports, PIT, IPD, or production determination is moved.

---

## 6. Verified baseline at preparation

| Item | Verified value |
|---|---|
| `origin/main` | `99b90d0391f81b9104d012aa1572262c4b297fd3` (PR #164 merge; parents `a8853fcc…` PR #165 + `d6630e4c…`) |
| Working tree | clean; session branch `arena/b9b85b22-iips-review-recovered` aligned with `origin/main` |
| Stage A PA acceptance | PR #165 merge `a8853fccad559e2de8da9af7ad832a82916c079c`; record blob `f70a6876aa55df862b50df3d459aec2e4e9b76b7`; tracker §16.64 present |
| Stage A implementation | PR #162 merge `75f3e743…`; tree `21af28e…`; fingerprint `e0187e64…` |
| A13 adapter blob | `2bb7864f930699b16789bbd0ac971a5a342fad67` — unchanged |
| A13 guard blob | `6296aa6a2b2037fce7d9f34786b789f0d7c3a0b1` — unchanged |
| 503 fence blobs | `51704c12…` / `cb8db45d…` — unchanged |
| Reserved routes | `App.tsx` `/evidence/snapshots` and `/evidence/replay` → `FeaturePlaceholder`; `/evidence/replay/:id` → `ReplayExplorer` |
| Nav | Snapshots and Replay **not** in `AVAILABLE_CHILD_PATHS` |
| `ScreenCaptureStore` | append/get only; **no `list()`** |
| Platform `SnapshotStore` | in-memory append/get/list; constructed inside `computeCertifiedPlatform()`; **no IRR listing route** |

---

## 7. Non-actions

This record and its tracker companion:

- create, modify, and delete **no** application, transport, UI, API-client, engine, adapter, test, persistence, IPC, freeze-manifest, replay-service, dependency, lockfile, CORS, listener, or configuration file;
- **do not edit** §16.63 or §16.64 historical text;
- **do not** rewrite NP-13, PKG-08 historical questions, N4, E2E-030, or the Stage A acceptance act;
- grant **no** implementation authority for a Snapshots page, Replay landing, listing API, enumerator, durable archive, or restart recovery;
- invent **no** IDs, replay results, or certification claims.

---

## 8. Effectiveness

Candidate until:

1. Merged to `ramkivs/iips-review-recovered @ refs/heads/main` via pull request on the prescribed session branch (no direct push, no force-push, no historical rewrite);
2. Post-merge CI passes;
3. Merged commit, parent, root tree, this record's blob SHA-256, and the tracker blob SHA-256 are independently verified against `origin/main`.

Publication coordinates are recorded in tracker §16.66 after merge; they are not self-embedded here.

---

## 9. Status summary

```text
RECORD=IIPS-V3-PKG08-ROWS-14-16-OPTION-A-PA-DISPOSITION-2026-10-20-01
DECISION=OPTION A
ROW_14=API-ONLY / NOT A SEPARATE PRODUCT SURFACE — IRR SNAPSHOTS WORKSPACE CLOSED BY DISPOSITION
ROW_16=DIRECT-ID / NO SEPARATE LANDING PRODUCT — BARE REPLAY LANDING CLOSED BY DISPOSITION
ROW_15=UNCHANGED STAGE A SCOPE; STALE "ACCEPTANCE NOT RENDERED" CURRENT-STATUS RECONCILED TO §16.64
NP13_D5_IB4=AFFIRMED — NOT SUPERSEDED
STAGE_A=UNCHANGED — CAPTURE / UUID INSPECT / INDEPENDENT REPLAY REMAIN AVAILABLE IN BOUNDED NON-PRODUCTION SCOPE
NOT_COMMISSIONED=SNAPSHOTS WORKSPACE; REPLAY LANDING; LISTING; DISCOVERY; ARCHIVE; DURABILITY; OWNER/PRIVACY
IMPLEMENTATION=NONE
DECISION_BASELINE=99b90d0391f81b9104d012aa1572262c4b297fd3
```

---

*End of `IIPS-V3-PKG08-ROWS-14-16-OPTION-A-PA-DISPOSITION-2026-10-20-01`. Option A is recorded for Matrix rows 14 and 16. NP-13 reserved-route protection is affirmed. Stage A acceptance and A13 controls are unchanged. No product implementation is authorized or performed.*
