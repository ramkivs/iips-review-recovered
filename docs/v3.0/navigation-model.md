# Program v3.0 — Navigation Model

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** NAVIGATION MODEL (Phase 1)
**Version:** 1.0
**Date:** 2026-08-09

> How users move through IIPS. Focused on the **decision → evidence → snapshot → replay** trust chain.

---

## 1. Global navigation

Primary sections: **Executive · Portfolio · Research · Intelligence · Evidence · Administration** (role-aware).

## 2. Decision→Evidence→Replay spine

The defining navigation pattern:

```text
Executive
  ↓
Portfolio (overview → holdings → allocation → risk → opportunities)
  ↓
Holding
  ↓
Company
  ↓
Decision (verdict + confidence + drivers)
  ↓
Evidence (metrics, data sources, snapshot, timestamp, version, provenance)
  ↓
Snapshot
  ↓
Replay (ORIGINAL / REPLAY / MATCH|DIFFERENCE)
  ↓
Original result
```

Every decision surface links forward to its evidence and replay; every replay surfaces its original decision.

## 3. Route model (adapted to repo conventions when implemented)

```
/  → redirect to /executive
/executive
/portfolio, /portfolio/:id, /portfolio/:id/holdings
/research, /research/company/:id, /research/sector/:id, /research/cross-sector
/intelligence, /intelligence/opportunities, /intelligence/risks, /intelligence/rankings, /intelligence/decision-matrix
/evidence, /evidence/:id, /evidence/snapshots, /evidence/replay/:id
/admin, /admin/users, /admin/roles, /admin/tenants, /admin/audit
```

(Exact route syntax finalized at Phase 3 with the actual router.)

## 4. Navigation behaviors

- **Role-aware:** admin-only items hidden/disabled for non-admins (reflects RBAC).
- **Progressive disclosure:** L1 summary → L5 raw via breadcrumbs + expandable panels, not deep hidden nav.
- **Shortcuts:** evidence/replay shortcuts from decision cards.
- **Command palette** for power users.

## Status

**NAVIGATION MODEL — COMPLETE (Phase 1).**
