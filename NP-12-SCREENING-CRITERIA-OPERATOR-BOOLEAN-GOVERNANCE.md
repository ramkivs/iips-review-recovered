# NP-12 — Screening Criteria, Operator & Boolean Governance Record

**Record type:** Durable governance record — previously approved N3 Screening decisions
**Authority status:** Program Authority decisions already approved; recorded here for durable preservation
**Scope:** Initial Screening criteria, operator vocabulary, Boolean combination, and growth missing-value semantics
**Implementation authority:** None granted by this record

---

## 1. Purpose and authority

This document durably records Screening governance decisions already approved by Program Authority during N3. It preserves those decisions; it does not create, reinterpret, extend, or implement Screening semantics.

The NP-12 sector-reference population governance records define a separate population boundary. In particular, `NP-12-SECTOR-REFERENCE-POPULATION-SEMANTICS-DEFINITION.md` and `NP-12-IMPLEMENTATION-READINESS-GATE-REPORT.md` keep criteria outside the population identity boundary; `NP-12-IMPLEMENTATION-AUTHORITY-DECISION.md` authorizes only its enumerated G1–G5 population work. This document does not amend those records or their G1–G5 population decisions. Screening criteria remain outside the sector-reference population identity contract.

## 2. Approved screenable criteria

The only criteria admitted for the initial governed Screening contract are:

```text
conviction
quality
growth
```

No aliases or derived alternatives are admitted.

## 3. Explicitly non-screenable criteria

The following are **NON-SCREENABLE** for the initial governed Screening contract:

```text
confidence
risk
valuation
capitalEfficiency
moat
sector
verdict
companyId
raw fundamentals
```

No additional fields are inferred from engine internals. Historical IPD raw-fundamental Screening fields are not current IRR Screening criteria.

## 4. Approved operator vocabulary

The exact initial operator vocabulary is:

```text
lt
lte
gt
gte
eq
```

Their approved names are less than, less than or equal to, greater than, greater than or equal to, and equal to, respectively. This record adds no operand or coercion semantics.

## 5. Explicitly excluded operators

The following operators are excluded from the initial contract:

```text
range
range_inc
ne
in
exists
absent
not
```

In particular, `range` is not revived and its historical upper-bound contradiction is not resolved here. `range_inc`, `ne`, set membership, existence predicates, and negation are not admitted. Any future operator expansion requires a separate explicit Program Authority decision.

## 6. Approved Boolean model

The initial expression model is:

> **FLAT AND ONLY**

A Screen is a flat collection of predicates, and every predicate must match. The initial contract does not support OR, NOT, nested expressions, grouping, precedence, or compound expression trees.

## 7. Approved growth missing-value semantics

> For Screening, an unavailable normalized `growth` value does not satisfy any `growth` predicate.

This applies uniformly to `lt`, `lte`, `gt`, `gte`, and `eq`. The approved unavailable sentinel is:

```text
growth = 0
```

Therefore, `growth = 0` represents unavailable normalized growth for Screening purposes and does not satisfy a growth predicate.

Healthcare has no growth pillar. This does **not** generally exclude Healthcare from Screening. It means only that, under fail-closed Screening semantics, an unavailable growth value does not satisfy a growth predicate.

## 8. Identity and population boundary

This record does not define Screen Definition identity, Screen Definition lifecycle or versioning, or population binding. Those matters remain subject to the subsequent N4 governance process. No Screen Definition ID or version is created or authorized here.

## 9. Governance decisions versus implementation state

These decisions are governance requirements. Their durable recording in IRR does not imply that all current implementation paths already conform to them.

The existing NP-12 sector-reference population records distinguish population membership semantics from downstream Screening criteria. They state that criteria are not part of the population identity boundary; this record does not alter that boundary.

Known implementation reconciliation items remain unresolved here:

- The current cross-sector type declares `growth?: number`.
- `DiversificationAnalyzer` uses `growth ?? 0` for diversification behavior; this is not evidence that the approved Screening missing-value rule is implemented.
- The N4 investigation reported runtime `null` reachability in existing paths. This record does not change or repair those paths.

These are implementation observations, not grounds to change the approved governance decisions. No source, schema, API, UI, or test behavior is changed by this record.

## 10. Historical IPD boundary

Historical IPD Screening semantics are historical/reference lineage only. They are not current IRR Screening governance and do not supply or extend the criteria, operators, Boolean model, or missing-value rules recorded here.

## 11. Change control

Any change to the initial screenable criteria, non-screenable criteria, operator vocabulary, Boolean model, or growth missing-value semantics requires a new explicit Program Authority governance decision. This record grants no implementation authority.
