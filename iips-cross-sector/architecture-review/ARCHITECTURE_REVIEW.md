# IIPS — CSIP Phase 3: Architecture Review

**Program:** v1.1 Track 5 — Cross-Sector Intelligence Platform
**Phase:** CSIP Phase 3 — Architecture Review
**Version:** 1.0-draft
**Date:** 2026-08-08
**Predecessor:** CSIP Phase 2 — Reference Assets (Approved)
**Inputs:** Universal Investment Ontology · Cross-Sector Intelligence Standard · Portfolio Architecture · Portfolio Reference Data · Portfolio Golden Dataset · Portfolio Expected Outputs · Portfolio Replay Dataset · Allocation Fixtures · Diversification Fixtures · Allocation Decision Matrix · Cross-Sector Evidence Model
**Review artifacts (added this phase):**
- `PORTFOLIO_DECISION_TRACE_MATRIX.md`
- `ONTOLOGY_CONSISTENCY_MATRIX.md`
- `ALLOCATION_RULE_PRECEDENCE_TABLE.md`
- `CROSS_SECTOR_COVERAGE_MATRIX.md`

---

## 1. Scope of review

Review whether the CSIP specification + reference assets are internally consistent, deterministic, replayable, evidence-traceable, black-box-isolated, and future-proof — and whether the project is ready to proceed to **Freeze**, then Implementation Plan, then the implementation lifecycle.

All four released sector engines remain **immutable** (frozen v1.0). CSIP is a platform capability that consumes their outputs only.

## 2. Review method

- Re-validated every CSIP JSON reference asset.
- Independently recomputed all six Portfolio Expected Outputs from the Golden Dataset using the documented computation, and confirmed **6/6 match exactly** (including PF-04 over-concentrated and PF-05 four-sector balanced).
- Traced each engine's frozen published pillars into the Universal Investment Ontology (Ontology Consistency Matrix).
- Defined the deterministic allocation rule order (Allocation Rule Precedence Table).
- Mapped all 7 CSIP capabilities to reference-asset evidence (Cross-Sector Coverage Matrix).
- Confirmed the decision trace from engine output to final recommendation (Portfolio Decision Trace Matrix).

## 3. Answers to the eight review questions

**Q1 — Is the Universal Investment Ontology internally consistent?**
**PASS.** The 8 canonical dimensions (Conviction, Confidence, Quality, Growth, Risk, Valuation, Capital Efficiency, Moat) are sector-independent, each defined without reference to any sector-specific formula, and each maps cleanly from the frozen published engine outputs. No dimension depends on internal scoring logic.

**Q2 — Are ontology mappings complete across all four released engines?**
**PASS.** Ontology Consistency Matrix §3 confirms every one of the 8 dimensions is populated by all four sectors; §4 confirms no engine exposes a pillar or score outside the ontology. All published pillars of Banking, Insurance, Capital Markets, and Healthcare map into the ontology.

**Q3 — Is portfolio allocation deterministic?**
**PASS.** Allocation Rule Precedence Table defines a total, static rule order (Mandatory Risk → Diversification → Strategy Profile → Ranking Optimization → Capital Allocation) with deterministic tie-breaks. Independent recomputation of all expected outputs matched exactly; no randomness anywhere in the pipeline.

**Q4 — Are all allocation and diversification decision paths exercised?**
**PASS.** Allocation Fixtures (8) cover the full decision matrix and all six strategies; Diversification Fixtures (5) cover balanced, over-concentrated, growth-factor, crisis, and conservative scenarios. Every path in the precedence table maps to a fixture.

**Q5 — Does replay remain deterministic at the portfolio level?**
**PASS.** Portfolio Replay Dataset (PF-05, four-sector) asserts byte-identical rankings, allocations, reports, diversification scores, and evidence. Replay is defined as pure functions of normalized engine outputs (Portfolio Architecture §4).

**Q6 — Does CSIP remain isolated from engine internals (black-box consumption only)?**
**PASS.** CSIP consumes only the published ontology dimensions; it never reads internal scoring logic, never recomputes sector scores, and never duplicates sector methodology. The four engines are immutable and do not know CSIP exists.

**Q7 — Can every portfolio recommendation be traced through the Cross-Sector Evidence Model?**
**PASS.** Portfolio Decision Trace Matrix provides the full chain Engine Outputs → Ontology Mapping → Cross-Sector Ranking → Allocation Logic → Diversification Analysis → Final Recommendation, aligning with the Evidence Model hierarchy (Recommendation → Sector Contribution → Portfolio Impact → Allocation Rationale → Diversification Impact). Every recommendation can be traced to frozen engine outputs.

**Q8 — Can future sectors participate solely through ontology registration without CSIP logic change?**
**PASS.** The ontology metadata table is the single integration contract. New sectors (Hospitality IES-010, Energy, Utilities, Consumer, Industrials, Technology, Real Estate, Telecom, Automotive) register their 8-dimension mapping and immediately participate in ranking + portfolio intelligence — no CSIP logic change (Ontology Consistency Matrix §5.4; Coverage Matrix, Q8).

## 4. Verification evidence

| Check | Result |
|---|---|
| Portfolio Expected Outputs independently recomputed (6/6) | ✅ PASS |
| Ontology mapping completeness (4/4 engines, 8/8 dimensions) | ✅ PASS |
| No out-of-ontology engine exposure | ✅ PASS |
| Allocation decision paths exercised (8 fixtures) | ✅ PASS |
| Diversification decision paths exercised (5 fixtures) | ✅ PASS |
| Replay assertions defined (rankings/allocations/reports/diversification/evidence) | ✅ PASS |
| 4-sector acceptance present (PF-05) | ✅ PASS |
| No CSIP implementation started (out of scope) | ✅ PASS |

## 5. Review findings / defined requirements for Freeze & Implementation

1. **Materialize per-engine ontology metadata.** The mapping is currently conceptual (§5.2 of Ontology Consistency Matrix). Each engine must declare a versioned, deterministic **ontology metadata JSON** (referencing its exact frozen pillar names) as part of Freeze, before implementation.
2. **Declare strategy tie-break rules.** Precedence Table §3 requires each strategy to declare its deterministic tie-break (e.g., lower risk under Conservative, higher growth under Growth) — to be locked at Freeze.
3. **Close Opportunity (Top-N) fixtures at implementation.** Top-10/25/50 selection and rationale export are specified but their fixtures belong to the Implementation Plan (Coverage Matrix §4.2).
4. **No engine or platform modifications permitted.** All four engines remain frozen; CSIP is implemented as a platform plugin consuming SectorPlugin outputs via the ontology (IMPLEMENTATION_API_BASELINE).

## 6. Review verdict

**CONDITIONAL APPROVE — PROCEED TO FREEZE.**

The eight review questions **all pass**. CSIP Phase 2 reference assets are internally consistent, deterministic, replayable, evidence-traceable, black-box-isolated, and future-proof. The three defined requirements above (ontology metadata materialization, strategy tie-break declaration, Top-N fixture closure at implementation) are captured as Freeze/Implementation Plan obligations and do not block the architecture approval.

Recommended next stage: **CSIP Freeze** — freeze the specification + reference assets, add the four review artifacts, tag (`csip-v1.0.0`), and produce the freeze manifest, compatibility statement, regression baseline, and readiness certificate.

## 7. Status

**ARCHITECTURE REVIEW COMPLETE (CONDITIONAL APPROVE).** Awaiting approval of this phase before proceeding to Freeze.
