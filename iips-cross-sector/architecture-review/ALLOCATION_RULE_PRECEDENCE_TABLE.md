# IIPS — Allocation Rule Precedence Table

**Program:** v1.1 Track 5 — Cross-Sector Intelligence Platform
**Phase:** CSIP Phase 3 — Architecture Review
**Artifact:** 3 of 4 (Allocation Rule Precedence Table)
**Version:** 1.0-draft
**Date:** 2026-08-08
**Purpose:** Define the explicit, deterministic execution order of allocation rules so that when multiple rules interact, the Capital Allocation Engine always produces one and only one outcome. This is the mechanism that guarantees deterministic allocation.

---

## 1. Canonical execution order

Rules are evaluated **in order**, and later rules operate on the residual decision space. The first rule that resolves a dimension decides it; downstream rules cannot overturn an upstream **mandatory** constraint.

```text
1. Mandatory Risk Constraints        (non-negotiable; governability/compliance/quality floors)
2. Diversification Constraints       (concentration / single-factor ceilings)
3. Strategy Profile Constraints      (target weights, risk/quality/income/growth posture)
4. Ranking Optimization              (prefer higher normalized conviction/confidence/quality)
5. Capital Allocation                (assign weights within remaining feasible space)
```

## 2. Rule Precedence Table

| Priority | Rule class | Decides | Binding | Example / fixture |
|---|---|---|---|---|
| 1 (highest) | **Mandatory Risk Constraints** | eligibility (can the holding stay in scope?) | Hard — cannot be overridden | Governance/regulatory/clinical-quality failure → exclude/avoid (ALLOC-06 Crisis) |
| 2 | **Diversification Constraints** | sector/factor exposure ceilings | Hard — concentration cap enforced | Banking overweight → Reduce Banking (ALLOC-01); concentration cap (DIV-02) |
| 3 | **Strategy Profile Constraints** | target weights, risk/quality/income/growth posture | Soft profile — bounded by 1 & 2 | Income → favor income sectors, reduce growth (ALLOC-07); Growth → accept higher risk (ALLOC-08); Conservative → minimize concentration (ALLOC-03) |
| 4 | **Ranking Optimization** | which opportunity is preferred within a bucket | Soft — tie-break by conviction/confidence/quality | High conviction concentrated → Hold concentration (ALLOC-04); Multiple equivalent → Preserve diversification (ALLOC-05) |
| 5 (lowest) | **Capital Allocation** | actual weight assigned to each holding | Output — last step | Resulting portfolio weights (per strategy) |

## 3. Interaction rules (determinism)

- **Precedence is total and static:** a rule with lower priority number can always constrain a higher-numbered rule's output, never the reverse.
- **Mandatory Risk Constraint beats all:** if a holding fails a mandatory risk constraint, it is excluded before any diversification or strategy consideration (ALLOC-06).
- **Diversification Constraint beats Strategy and Ranking:** a strategy may not push a portfolio past its concentration cap (ALLOC-01, DIV-02); ranking may select *which* holding, but not violate the cap.
- **Strategy beats Ranking on posture:** within a strategy's target weight band, ranking optimization selects specific opportunities; it cannot shift the strategy's sector posture (ALLOC-07/08).
- **Ranking tie-break is deterministic:** conviction desc, then sector asc (lexicographic) — no random tie-breaking.
- **Tie-break for unresolved decisions:** if two holdings remain equivalent after all constraints and ranking, the deterministic rule is applied (e.g., lower risk wins under Conservative; higher growth wins under Growth) — must be declared per strategy and versioned.

## 4. Mapping to the Allocation Decision Matrix

| Decision matrix scenario | Fixture | Primary rules in play (in order) |
|---|---|---|
| Banking overweight | ALLOC-01 | 2 Diversification → 5 Reduce Banking |
| Healthcare underweight | ALLOC-02 | 2 Diversification → 5 Increase Healthcare |
| Diversification poor | ALLOC-03 | 2 Diversification → 3 Conservative profile → 5 |
| High conviction concentrated | ALLOC-04 | 1 risk ok → 4 Ranking (Hold) → 5 |
| Multiple equivalent opportunities | ALLOC-05 | 4 Ranking tie-break → 2 preserve diversification |
| Crisis | ALLOC-06 | 1 Mandatory risk → 2 → 3 Conservative → 5 |
| Income strategy | ALLOC-07 | 3 Income profile → 5 |
| Growth strategy | ALLOC-08 | 3 Growth profile → 5 |

## 5. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** Provides the deterministic, total ordering required to guarantee one outcome under rule interaction, and is the normative basis for the 8 allocation fixtures.
