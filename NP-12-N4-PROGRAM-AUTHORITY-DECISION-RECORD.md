# NP-12 N4 — Program Authority Follow-on Governance Decision Record

**Record status:** Approved Program Authority follow-on decisions
**Program Authority:** Ramki
**Decision authority:** Program Authority
**Implementation authority:** Not granted by this record
**Scope:** Governance only; no Screen implementation is authorized.

## 1. Authority, baseline, and provenance

This additive record captures the explicit N4-A, N4-B, and N4-C decisions supplied by Program Authority for the NP-12 N4 Program Authority Decision + Durability Gate. It follows the read-only **NP-12 N4 — Numeric Canonicalization and Definition Lifecycle Governance Decision Surface** investigation, which identified numeric operand semantics, canonical Definition representation, and Definition lifecycle as unresolved governance surfaces. This record resolves the Program Authority semantic decisions below without changing the prior N3 or N4 artifacts.

Authoritative baseline on `ramkivs/iips-review-recovered`:

| Item | Authoritative reference |
|---|---|
| Baseline commit | `45768643cafecc97c6e4a3f2d40c2a4e42e6fb6a` |
| Baseline tree | `72ce4a6e011807aa34731cffb298a93d1b5e5f00` |
| N3 governance artifact | `NP-12-SCREENING-CRITERIA-OPERATOR-BOOLEAN-GOVERNANCE.md` — blob `c2402d36b7610cb4ce52abf1d071d3d46f136f62` |
| Prior N4 governance artifact | `NP-12-SCREEN-DEFINITION-GOVERNANCE-DECISIONS.md` — blob `8941acadfd01c3edf97a91bd012ff616abed311f` |
| Accepted G1–G5 implementation publication | `4db95c2cdb58a577b43d0d9e99adedcf3aea7b71` (ancestor of the baseline) |

The investigation established that the prior N4 record fixed finite-only operands and SHA-256's non-identity role, but left the concrete numeric contract, Definition preimage/byte encoding, and post-execution Definition lifecycle unresolved. This follow-on record preserves that history and records the Program Authority decisions now supplied. It does not treat implementation precedent as a substitute for these decisions.

## 2. Frozen prior decisions

All accepted N3 and prior N4 decisions remain unchanged. In particular, this record does not reopen N3 admitted fields/operators, flat-AND behavior, excluded fields/operators, growth unavailable-value behavior, population identity, sector normalization, uniqueness, duplicate rejection, canonical ordering, or G1–G5.

It does not alter prior N4 identity `(definitionId, version)`, caller-supplied identity, versioning and historical immutability, predicate structure, predicate ordering, empty-predicate semantics, exact canonical duplicate semantics, contradiction semantics, finite-only operands, rejection of NaN and infinities, population binding, Definition/Execution/Result separation, or SHA-256 as an integrity/equality aid rather than identity. The sections below are follow-on decisions only.

## 3. N4-A — Numeric operand semantics

### A1. Numeric domain

Screen numeric operands use **finite fixed-point decimal semantics**.

### A2. Precision and range

- Maximum precision is **6 fractional decimal digits**.
- The current admitted numeric screening fields have a range of **0 through 100 inclusive**.
- Excess precision is **rejected**. Silent rounding is **not permitted**.
- A future newly admitted numeric field with a different domain must establish its own range through governance; it must not silently inherit the current 0–100 range.

### A3. Canonical numeric representation

Canonical numeric representation uses base-10 plain decimal notation. Exponent notation is prohibited. Leading zeros are prohibited except for the zero integer part. Trailing fractional zeros are removed. The decimal point is omitted when the fractional component is zero.

### A4. Negative zero

`-0`, `-0.0`, `-0.000000`, and equivalent negative-zero representations canonicalize to `0`.

### A5. Equivalence and equality

Different textual representations denoting the same governed decimal value are canonically equivalent. Thus `75`, `75.0`, and `75.000000` canonicalize to `75`; `0.500000` canonicalizes to `0.5`.

Canonical numeric equivalence is used consistently for `eq`, exact canonical duplicate predicate detection, canonical predicate ordering, deterministic Definition serialization, and deterministic digest construction.

### A6. Invalid values

The prior finite-only rule remains in force:

- `NaN` → **REJECT**;
- `+Infinity` → **REJECT**;
- `-Infinity` → **REJECT**.

NaN is not an unavailable-value sentinel.

## 4. N4-B — Canonical Screen Definition and digest

### B1. Definition content and population binding

The canonical Definition representation covers exactly these semantic components:

- `definitionId`;
- `version`;
- the `populationIdentity` reference; and
- the canonical predicate collection.

The Definition references the population by `populationIdentity`; it does not embed or redefine population membership.

### B2. Predicate representation and ordering

Each predicate remains `{ field, operator, operand }`. Canonical ordering remains `field → operator → canonical operand`. Existing N3/N4 Boolean and operator decisions are unchanged.

### B3. Empty predicates

An empty predicate collection continues to mean **matches the entire bound population**. Its semantic canonical representation is an empty predicate collection. Its exact byte spelling remains subject to the mechanical encoding delegation in B7; no byte sequence is invented here.

### B4. Duplicate predicates

Exact canonical duplicates are removed under the already-approved N4 semantics. No broader logical-equivalence simplification is authorized.

### B5. Digest role and exclusions

The Definition digest uses **SHA-256** as an integrity/equality aid only. A digest is not authoritative Definition identity; authoritative identity remains `(definitionId, version)`.

Definition digest content does not include `executionId`, `resultId`, `snapshotId`, `evidenceId`, runtime metadata, timestamps, or caller/runtime execution metadata merely because those values exist elsewhere in a runtime.

### B6. Semantic authority and delegated mechanical byte encoding

Semantic canonicalization authority is **retained by Program Authority**. Mechanical byte encoding is **delegated to a subsequent authorized design/implementation gate**.

That delegated encoding must deterministically encode the approved semantics and preserve numeric equivalence, predicate equivalence, Definition identity, population binding, duplicate semantics, canonical ordering, and SHA-256's non-identity role. It must not introduce new semantic choices under the guise of serialization. The delegation does not itself specify a serializer, byte grammar, or digest preimage encoding.

## 5. N4-C — Definition lifecycle

### C1. Lifecycle and retrieval identity

The governed lifecycle is **persistent/retrievable**. A governed Screen Definition Version must remain available for retrieval after the execution that evaluated it. Its authoritative retrieval identity is `(definitionId, version)`—not `executionId`, `resultId`, `snapshotId`, `evidenceId`, or digest.

The future lifecycle must support retrieval of a specific Definition Version by `(definitionId, version)`.

### C2. Historical immutability

Historical Definition Versions remain immutable. A semantic change creates a new version, consistent with unchanged N4 D3.

### C3. Storage, retention, and ownership boundaries

This decision establishes persistent/retrievable semantics only. It does not select database technology, registry technology, physical storage engine, or deployment topology. No concrete retention duration is established; retention semantics must be separately governed if required before implementation. No new tenancy or multi-user model is inferred, and no ownership rule beyond the existing governance/authorization architecture is introduced.

## 6. Implementation boundary and remaining authorized work

Governance decisions do not automatically grant implementation authority. This record authorizes no Screen evaluator, Definition type, canonical serializer, registry, persistence layer, execution/result implementation, tests, schema changes, or other source changes.

The semantic numeric and lifecycle choices above are resolved. The exact mechanical Definition byte grammar remains delegated to a subsequent authorized gate. Retention duration remains ungoverned and must be separately decided if required before implementation. Any later implementation/readiness gate must assess those boundaries explicitly and separately; this record alone is not an implementation-readiness declaration.

## 7. Decision integrity checklist

- Numeric domain is finite fixed-point decimal; maximum fractional precision is six digits.
- Current admitted numeric-field range is 0–100 inclusive; excess precision rejects, with no silent rounding.
- Negative zero canonicalizes to zero; exponent notation is prohibited; trailing fractional zeros are removed; equivalent decimal spellings canonicalize identically.
- NaN and both infinities reject.
- Definition content is bounded to `definitionId`, `version`, `populationIdentity`, and canonical predicates; population membership is not embedded.
- SHA-256 remains a non-identity integrity/equality aid; execution/result/snapshot/evidence/runtime metadata is excluded from Definition content.
- Mechanical byte encoding is explicitly delegated and may not alter approved semantics.
- Definition retrieval is persistent and keyed by `(definitionId, version)`; versions remain immutable.
- No storage technology, retention duration, or new tenancy model is silently selected.
- N3 and prior N4 decisions remain unchanged except for the explicit follow-on decisions recorded here.

**End of governance decision record.**
