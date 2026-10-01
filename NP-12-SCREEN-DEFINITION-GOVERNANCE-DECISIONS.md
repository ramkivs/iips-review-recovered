# NP-12 — N4 Screen Definition Governance Decisions

**Record type:** Durable Program Authority governance decisions
**Status:** APPROVED — governance recording only
**Implementation authority:** NOT GRANTED

## 1. Authority and scope

This record preserves the fourteen N4 Screen Definition decisions explicitly approved by Program Authority. It records those decisions without implementing them or adding further Screen Definition semantics.

This record does not authorize source, schema, API, UI, test, persistence, runtime, or production changes. Any implementation requires a separate, explicitly authorized gate.

## 2. Authoritative baseline and provenance

The decisions are recorded for the following IRR authoritative baseline:

```text
Repository: ramkivs/iips-review-recovered
main commit: 1b170a565e8027bda762a73d61f01aa1c6cad4c3
tree: 678ebc4d2d0704c712e41f433afe9f6417a997c0
```

The Program Authority approval is the authority for the decisions below. Repository behavior and historical conventions are evidence only and do not supersede these decisions.

## 3. Relationship to the closed N3 governance record

The N3 criteria, operator, Boolean, and growth decisions remain closed and immutable. Their durable IRR record is:

```text
NP-12-SCREENING-CRITERIA-OPERATOR-BOOLEAN-GOVERNANCE.md
SHA-256: 707fe0eafaccd719c0086fc7aa913e90c949ac0bf27841c32c12a3753c8dacc6
```

N3 governs the initial screenable criteria (`conviction`, `quality`, `growth`); non-screenable criteria; admitted operators (`lt`, `lte`, `gt`, `gte`, `eq`); excluded operators (`range`, `range_inc`, `ne`, `in`, `exists`, `absent`, `not`); **flat AND only**; and unavailable-growth behavior (`growth = 0` does not satisfy any growth predicate). N4 depends on those decisions; it does not reopen or modify them. If a future interpretation appears inconsistent, the N3 record remains authoritative for N3 semantics and requires a separate governance decision to change.

## 4. N4 Program Authority decisions

### N4-D1 — Definition identity

**PROGRAM AUTHORITY APPROVED — C: stable definition ID plus explicit version.**

The pair `(definitionId, version)` identifies a specific governed Screen Definition version. `definitionId` identifies the logical definition lineage; `version` identifies an immutable version in that lineage. No runtime ID is created by this record.

### N4-D2 — Content digest

**PROGRAM AUTHORITY APPROVED — YES.**

A deterministic SHA-256 content digest is required as an integrity/equality aid, not as authoritative identity. A canonical representation is required. The digest does not replace `(definitionId, version)` or become an independent identity authority. No digest implementation or exact canonical byte encoding is specified here.

### N4-D3 — Version semantics

**PROGRAM AUTHORITY APPROVED.**

- A registered version is immutable.
- Any semantic definition change creates a new version.
- Version is caller-supplied and uses one version axis.
- Versions are independently addressable by `(definitionId, version)`.
- Historical versions are not mutated in place.

No version-management mechanism is implemented or prescribed here.

### N4-D4 — Predicate representation

**PROGRAM AUTHORITY APPROVED.**

The conceptual predicate representation is:

```text
{ field, operator, operand }
```

Field and operator values must use the N3-governed vocabulary. Operand representation must be explicit and canonical. This decision admits no new field or operator and does not prescribe a runtime type or schema.

### N4-D5 — Predicate ordering

**PROGRAM AUTHORITY APPROVED.**

Canonical predicate ordering is:

```text
field → operator → canonical operand representation
```

Caller-supplied predicate order does not affect Screen Definition identity. This order supports deterministic canonical representation and any approved digest calculation. It is not RankingEngine presentation order. No canonicalization code is created here.

### N4-D6 — Empty predicate collection

**PROGRAM AUTHORITY APPROVED — VALID.**

An empty predicate collection is valid. Under the flat-AND model, it matches the entire bound population. This does not adopt historical IPD empty-filter behavior as authority and does not implement evaluation.

### N4-D7 — Duplicate predicates

**PROGRAM AUTHORITY APPROVED — exact canonical duplicates are deduplicated.**

This applies only to exact canonical predicate duplicates. It does not authorize broader logical-equivalence reduction or expression simplification.

### N4-D8 — Contradictory predicates

**PROGRAM AUTHORITY APPROVED — permitted.**

Contradictory predicates remain structurally permitted under flat AND. Their evaluation produces an empty result because every predicate must match. No separate contradiction-detection or expression-simplification subsystem is required by this decision.

### N4-D9 — Numeric operands

**PROGRAM AUTHORITY APPROVED.**

Numeric operands must be finite, deterministic, and canonically represented; reject `+Infinity` and `-Infinity`. Precision and serialization must be explicitly pinned before implementation. This record does not invent or select a decimal precision.

### N4-D10 — NaN

**PROGRAM AUTHORITY APPROVED — `NaN` is an invalid Screen Definition operand and is rejected.**

NaN is not an unavailable-value sentinel. This decision does not alter upstream engine missing-data behavior.

### N4-D11 — Growth dependency

**PROGRAM AUTHORITY APPROVED.**

Screen Definition governance relies on the closed N3 rule:

> An unavailable normalized `growth` value does not satisfy any growth predicate.

The approved sentinel remains `growth = 0`. Existing implementation reconciliation remains separate. This decision neither changes N3 nor authorizes growth implementation changes.

### N4-D12 — Population binding

**PROGRAM AUTHORITY APPROVED.**

A Screen Definition references the established `populationIdentity`; the referenced population is independently verified. The definition neither embeds nor redefines population membership. `companyId` and `portfolioId` are not substitutes for `populationIdentity`. No company identity or population-identity redesign is introduced.

### N4-D13 — Definition, execution, and result separation

**PROGRAM AUTHORITY APPROVED.**

The architecture distinguishes:

```text
Definition = what is screened
Execution  = an evaluation instance
Result     = evaluation output
```

These are governance concepts at this gate. No runtime classes, APIs, persistence schema, or transport contracts are specified or implemented here.

### N4-D14 — Governance durability

**PROGRAM AUTHORITY APPROVED.**

N4 decisions must be durably recorded in authoritative IRR before implementation-readiness work proceeds.

## 5. Unresolved implementation details

The following remain deliberately unspecified by these decisions and must not be invented by this record:

- concrete decimal precision;
- exact canonical byte encoding;
- runtime Screen Definition class structure or registry;
- API representation;
- persistence schema;
- execution ID format;
- result schema or transport format;
- UI behavior;
- authorization or replay implementation;
- digest implementation.

These matters require subsequent design and explicit implementation authority where applicable. In particular, the numeric precision/serialization rule must be specified before implementation.

## 6. Implementation boundary and change control

This record is governance only. It creates no runtime IDs, versions, hashes, definitions, executions, results, schemas, APIs, UI, tests, or implementation changes. Implementation authority remains **NOT GRANTED**.

Any change to N4-D1 through N4-D14 requires a new explicit Program Authority decision. N3 remains closed unless changed by its own separate governance decision.

## 7. Next gate

A separate gate must determine the next authorized step. This record does not declare Screen Definition implementation-ready and does not authorize implementation-readiness work by itself.
