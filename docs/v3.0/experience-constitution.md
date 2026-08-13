# Program v3.0 — Enterprise Experience Constitution

**Program:** IIPS Engineering Standards — Program v3.0 (Enterprise Investment Intelligence Experience)
**Document type:** EXPERIENCE CONSTITUTION (Phase 1 — frozen before UI implementation)
**Version:** 1.0
**Date:** 2026-08-09
**Status:** CONSTITUTION (frozen) — the governing UX contract for v3.0

> This constitution defines **what the IIPS product experience is** and the **non-negotiable boundaries** between v3.0 (experience), v2.0 (certified platform), and v1.1 (deterministic engine). It is frozen before any UI implementation.

---

## 1. The product idea (central principle)

The purpose of v3.0 is **not** to create another investment engine. It is to make the **already-certified intelligence** understandable, navigable, explainable, auditable, and usable by enterprise users.

The central experience model:

```text
            IIPS
             │
     ┌───────┴───────┐
     │               │
  DECISION        EVIDENCE
     │               │
What does it      Why does it
   say?             say it?
     │               │
     └───────┬───────┘
             │
           REPLAY
             │
      Can I reproduce it?
```

v3.0 makes the **trust chain** (`live data → snapshot → execution → evidence → replay → HA/DR`) **visible and usable** to the human.

## 2. Role boundary (non-negotiable)

| Program | Responsibility | v3.0 must |
|---|---|---|
| **v1.1** | Determines **what the investment result means** (frozen deterministic core) | never change |
| **v2.0** | Determines **how the enterprise platform delivers** the intelligence (certified) | consume, never bypass |
| **v3.0** | Determines **how users experience** the intelligence | present + interact only |

**v3.0 determines how users experience the intelligence. v2.0 determines how the platform delivers it. v1.1 determines what the result means. Never reverse these.**

## 3. Experience principles

### P1 — Truth before decoration
The UI exists to communicate **certified investment intelligence**. Visual polish must never obscure decision, confidence, risk, evidence, uncertainty, data freshness, or provenance.

### P2 — Decision before metric
Never make users interpret dozens of metrics before discovering the actual decision. Hierarchy: **Decision → Confidence → Why → Key drivers → Supporting metrics → Raw evidence.**

### P3 — Evidence before AI explanation
AI may assist interpretation but must **never** be the source of truth for deterministic decisions. The UI must distinguish **CERTIFIED ENGINE RESULT ≠ AI-GENERATED EXPLANATION**, and AI output must be clearly attributable.

### P4 — No hidden decision logic
The frontend must **not** introduce independent scoring, ranking, recommendation, eligibility, or investment-policy logic. The frontend displays platform results. Any new decision rule belongs in the governed platform layer and requires its own authorization/certification.

### P5 — Evidence must be inspectable
Every meaningful investment decision provides a route to: **Decision → Factors → Metrics → Data snapshot → Evidence → Replay.**

### P6 — Progressive disclosure
Do not show every metric at once. Levels:
- L1 Executive summary
- L2 Decision details
- L3 Analytical details
- L4 Evidence
- L5 Raw / provenance / replay

## 4. Truth/authority separation (display contract)

Every investment value shown has an **authority tag**:

| Authority | Source | Visual treatment |
|---|---|---|
| **CERTIFIED** | v1.1 engine result / v2.0 evidence | Primary, labeled "CERTIFIED RESULT" |
| **AI** | v3.0 AI advisory layer | Clearly labeled "AI EXPLANATION" — never authoritative |
| **Platform** | v2.0 platform/operational | Informational |

## 5. Freshness & provenance (display contract)

Never silently show stale data as current. Show: data timestamp, snapshot ID, version, source state, freshness.

Freshness states: `LIVE` · `SNAPSHOT` · `STALE` · `UNAVAILABLE` · `REPLAY`.

If data is unavailable, show **"Data unavailable"** — never `0` or invented placeholder values.

## 6. Roles & personas

See `personas-and-roles.md`. Primary: **Executive, Portfolio Manager, Analyst/Researcher, Risk/Compliance, Administrator**. Each sees certified results through role-appropriate navigation; the frontend never bypasses `EnterpriseRuntime` RBAC.

## 7. Information architecture & navigation

See `information-architecture.md` + `navigation-model.md`. Global structure: **Executive · Portfolio · Research · Intelligence · Evidence · Administration**, connected so users move Decision → Evidence → Snapshot → Replay.

## 8. Application boundaries (what v3.0 owns vs v2.0)

| Concern | Owner |
|---|---|
| Compute decision/score/confidence/ranking/thresholds/weights | **v1.1/v2.0 (never v3.0)** |
| Deliver intelligence over the platform | **v2.0 (certified)** |
| Present, navigate, explain, filter, compare, expose | **v3.0** |
| Transport representation, auth session, tenant/permission propagation, serialization, errors, pagination | **v3.0 transport/adapter (per `transport-boundary.md`)** |

## 9. Design philosophy

Institutional, analytical, trustworthy, precise, modern, information-dense but readable, serious financial research, enterprise-grade. Avoid consumer-fintech visual language, excessive gradients, decorative dashboards, meaningless animation, oversized cards, arbitrary colors, visual noise. See `design-principles.md`.

## 10. Accessibility & resilience

Strong enterprise accessibility (keyboard nav, visible focus, semantic HTML, ARIA, non-color-only status, contrast, reduced motion). Explicit failure states (network/API/timeout/partial/permission/authn/stale/unavailable/replay/AI) — never fabricated investment values. See `design-principles.md`.

## 11. Freeze

This constitution is **frozen** as the governing UX contract. Any change requires a reviewed, versioned amendment. It must be satisfied by all subsequent v3.0 phases.

## Status

**EXPERIENCE CONSTITUTION — FROZEN.** Phase 1 in progress (companion documents follow).
