# Program v3.0 — Replay Experience

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** REPLAY EXPERIENCE (Phase 1)
**Version:** 1.0
**Date:** 2026-08-09

> How the certified replay capability is presented. **Replay calculations are NEVER performed in the browser** — the UI invokes the certified platform replay API.

---

## 1. The replay question

The replay surface answers: **"Can I reproduce this decision?"**

```text
Original Decision
  ↓
Input Snapshot
  ↓
Workflow (where applicable)
  ↓
Engine
  ↓
Result
  ↓
Evidence
```

## 2. Replay Explorer

A `ReplayViewer` + `ReplayTimeline` present, per replay:
- snapshot identity
- timestamp
- version
- workflow (if present)
- engine / engine version
- evidence
- result
- replay result
- **equivalence status**

The screen clearly distinguishes:
- **ORIGINAL**
- **REPLAY**
- **MATCH / DIFFERENCE**

## 3. Data flow (authoritative)

```text
Replay UI → typed API client → v2.0 transport/adapter → ReplayService (certified) → ReplayResult
```

The browser receives `ReplayResult` (`snapshotId`, `reproduced`, `byteIdentical`, `evidenceRefs`) and displays it. It does not recompute.

## 4. Non-goals

- v3.0 does **not** re-run or recompute engine execution in the browser.
- v3.0 does **not** reinterpret equivalence; it displays the certified `reproduced`/`byteIdentical`.

## Status

**REPLAY EXPERIENCE — COMPLETE (Phase 1).**
