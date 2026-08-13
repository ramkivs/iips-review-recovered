# Program v3.0 — Evidence Experience

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** EVIDENCE EXPERIENCE (Phase 1)
**Version:** 1.0
**Date:** 2026-08-09

> How the certified evidence (P5) is presented. Evidence must be inspectable without overwhelming the primary decision screen — via drawers, expandable panels, and progressive disclosure.

---

## 1. The evidence question

Every decision detail view answers: **"Why did the platform produce this result?"**

```text
DECISION
  ├── Result
  ├── Confidence
  ├── Drivers
  └── Evidence
        ├── Metrics
        ├── Data sources
        ├── Snapshot
        ├── Timestamp
        ├── Version
        └── Provenance
```

## 2. Evidence surface components

- **EvidenceCard** — summary of the evidence package for a decision.
- **EvidencePanel** — expandable detail (keyMetrics, supportingScores, calibrationVersion, decisionRulesApplied, provenance).
- **EvidenceDrawer** — slide-in for full provenance without leaving the decision.

## 3. Evidence content (from `EvidencePackage`, displayed as returned)

- `evidenceId`
- `engineId`
- `recommendation`
- `compositeScore`
- `confidence`
- `keyMetrics[]`, `supportingScores[]`
- `calibrationVersion`
- `decisionRulesApplied[]`
- `replayReference`
- `provenance` (framework/engine/methodology/snapshot)
- `generatedAt`

## 4. Data sources & freshness

Where a live-data `DataSnapshot` is linked, show: data timestamp, snapshot ID, version, provider, quality, completeness, freshness state (`LIVE/SNAPSHOT/STALE/UNAVAILABLE/REPLAY`).

## 5. Non-goals

- v3.0 does **not** reinterpret evidence or decide what "matters."
- v3.0 surfaces the evidence package; it does not compute any of its fields.

## Status

**EVIDENCE EXPERIENCE — COMPLETE (Phase 1).**
