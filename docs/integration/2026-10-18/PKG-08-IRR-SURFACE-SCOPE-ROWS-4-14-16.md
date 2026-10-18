# PKG-08 — unresolved IRR surface scope packet (rows 4, 14, 16)

**Status:** triage questions only; not a product decision or implementation authorization.
**Date:** 2026-10-18.
**Owner:** IRR product authority; platform evidence is supplied only to describe current behavior.

| Matrix row | Current implementation/evidence | Unresolved scope and decision question | Evidence needed if commissioned |
|---|---|---|---|
| **4 — Research — sector surface (IRR)** | `/research/sector/:id` is a `FeaturePlaceholder`; V19 notes multiple placeholder mounts. CV-41 made the parent Research navigation an honest group heading; it did not commission a sector workspace. | Retain placeholder/API-only, or commission a named sector surface? What is the user outcome and owner? No endpoint or feature requirement is inferred from the route name. | If commissioned: named route/screen contract, permitted data source, acceptance test, and implementation authority. Otherwise record explicit retain/defer disposition. |
| **14 — Evidence snapshots surface (platform + IRR route)** | `/evidence/snapshots` is a placeholder. `iips-platform/src/snapshot/SnapshotStore.ts` is concretely in-memory (`Snapshot[]`, append/get/list), not disk-backed. The matrix had marked durability `UR`; this inspection resolves the technical implementation fact but not a product requirement. | Is the intended surface merely a read-only view of process-local snapshots, or does it require restart-durable snapshots? Is the route needed at all? Do not imply durability from the word “snapshot.” | If commissioned as a view: route/UI acceptance over existing read-only data. If durability is required: separately authorized persistence design, restart proof, identity/scope boundaries, and qualification. Otherwise record a deliberate deferral/API-only disposition. |
| **16 — Replay landing route (IRR)** | `/evidence/replay/:id` works and is tested; `/evidence/replay` is a placeholder. CV-41’s honest parent navigation does not build the landing route. | Should a replay discovery/landing page exist, or is direct replay-by-ID the intended product boundary? No list/search endpoint or new route contract is assumed. | If commissioned: named discovery source, no invented snapshots/IDs, route-level test, and acceptance. Otherwise record direct-ID/API-only or deferred disposition. |

## Closure rule

For each row, record a separate retain/defer/commission outcome, decision owner, named consumer, acceptance criterion, and source evidence. No storage technology, endpoint, UI, or product requirement is selected by this packet. The 51-row canonical Excel workbook was not present in the accessible IRR main tree or the named local path, so its status cells are not edited.
