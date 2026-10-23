# PKG-08 — unresolved IRR surface scope packet (rows 4, 14, 16)

**Status:** triage questions only; not a product decision or implementation authorization.
**Status update (2026-10-20):** Rows **14** and **16** dispositions rendered — **OPTION A** (see "Decision recorded" below; tracker §16.66 `CV-CORR-49`). The historical text below is preserved verbatim. **Row 4 is not decided by this addendum** (already separately commissioned).
**Date:** 2026-10-18.
**Owner:** IRR product authority; platform evidence is supplied only to describe current behavior.

| Matrix row | Current implementation/evidence | Unresolved scope and decision question | Evidence needed if commissioned |
|---|---|---|---|
| **4 — Research — sector surface (IRR)** | `/research/sector/:id` is a `FeaturePlaceholder`; V19 notes multiple placeholder mounts. CV-41 made the parent Research navigation an honest group heading; it did not commission a sector workspace. | Retain placeholder/API-only, or commission a named sector surface? What is the user outcome and owner? No endpoint or feature requirement is inferred from the route name. | If commissioned: named route/screen contract, permitted data source, acceptance test, and implementation authority. Otherwise record explicit retain/defer disposition. |
| **14 — Evidence snapshots surface (platform + IRR route)** | `/evidence/snapshots` is a placeholder. `iips-platform/src/snapshot/SnapshotStore.ts` is concretely in-memory (`Snapshot[]`, append/get/list), not disk-backed. The matrix had marked durability `UR`; this inspection resolves the technical implementation fact but not a product requirement. | Is the intended surface merely a read-only view of process-local snapshots, or does it require restart-durable snapshots? Is the route needed at all? Do not imply durability from the word “snapshot.” | If commissioned as a view: route/UI acceptance over existing read-only data. If durability is required: separately authorized persistence design, restart proof, identity/scope boundaries, and qualification. Otherwise record a deliberate deferral/API-only disposition. |
| **16 — Replay landing route (IRR)** | `/evidence/replay/:id` works and is tested; `/evidence/replay` is a placeholder. CV-41’s honest parent navigation does not build the landing route. | Should a replay discovery/landing page exist, or is direct replay-by-ID the intended product boundary? No list/search endpoint or new route contract is assumed. | If commissioned: named discovery source, no invented snapshots/IDs, route-level test, and acceptance. Otherwise record direct-ID/API-only or deferred disposition. |

## Closure rule

For each row, record a separate retain/defer/commission outcome, decision owner, named consumer, acceptance criterion, and source evidence. No storage technology, endpoint, UI, or product requirement is selected by this packet. The 51-row canonical Excel workbook was not present in the accessible IRR main tree or the named local path, so its status cells are not edited.

---

## Decision recorded (2026-10-20) — Rows 14 and 16 OPTION A

> Additive. The sections above are preserved verbatim. This addendum records the Program Authority's explicit Option A authorization. **It does not commission implementation.** Row 4 is unchanged by this addendum.

**Authority record:** [`IIPS_v3.0_PKG08_ROWS_14_16_OPTION_A_PA_DISPOSITION_2026-10-20.md`](../IIPS_v3.0_PKG08_ROWS_14_16_OPTION_A_PA_DISPOSITION_2026-10-20.md) (`IIPS-V3-PKG08-ROWS-14-16-OPTION-A-PA-DISPOSITION-2026-10-20-01`). Tracker §16.66 (`CV-CORR-49`).

| Row | Outcome | Decision owner | Named consumer | Acceptance criterion |
|---|---|---|---|---|
| **14 — Evidence Snapshots** | **API-only / not a separate product surface.** Reserved `/evidence/snapshots` retained unavailable. Not commissioned | Program Authority (Ramki) | None for an IRR Snapshots workspace. Platform `SnapshotStore` remains platform-runtime-only | Reserved route remains unavailable; no catalog/listing API; engine `snapshot-1.0` not conflated with Stage A captures; NP-13 D5/IB-4 affirmed |
| **16 — Replay Landing** | **Direct-ID / no separate landing product.** Bare `/evidence/replay` retained unavailable. UUID replay remains Row 15 | Program Authority (Ramki) | No landing consumer. Direct-ID consumers: Screener capture receipt and `/evidence/replay/:id` | Reserved bare route remains unavailable; no landing/listing/discovery; Stage A outcomes unchanged; NP-13 D5/IB-4 affirmed |

Option A is the packet's non-commission closure path ("otherwise record direct-ID/API-only or deferred disposition"). It **affirms** NP-13 D5 and does not supersede it with a product commission.

**Not touched:** Stage A implementation, A13 guard, platform `SnapshotStore`/`ReplayService`, navigation links, listing endpoints, persistence, Row 4, unrelated workstreams. **No production qualification, admission, or certification extension is claimed.**

**Closure.** Matrix row 14 (IRR Snapshots workspace) and Matrix row 16 (bare Replay landing) are **CLOSED by documentation**. Smallest remaining step: none for those IRR surfaces. Any future Snapshots UI or Replay landing is a **new**, separately authorized item. Stage A capture/UUID inspection/independent replay remain available within their existing bounded non-production scope (Row 15 / §16.64).
