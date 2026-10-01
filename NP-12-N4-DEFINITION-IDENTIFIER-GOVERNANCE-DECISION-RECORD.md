# NP-12 N4 — Program Authority Identifier and Canonical Encoding Decisions

**Record type:** Additive Program Authority governance decision record
**Decision status:** Approved Program Authority decisions supplied for this gate
**Program Authority:** Ramki
**Implementation authority:** NOT GRANTED
**Scope:** Definition identifier semantics and the boundary for subsequent canonical byte-grammar design; no implementation
**Decision date:** 2026-10-02

## 1. Authority, baseline, and provenance

This additive record records the Program Authority identifier decisions supplied for the **NP-12 N4 — Program Authority Identifier + Canonical Encoding Decision Gate**. It does not amend the prior N3 or N4 decisions. It does not select a byte format, serializer, storage technology, or implementation plan.

Authoritative repository baseline verified from the GitHub remote before this record was prepared:

| Item | Authoritative reference |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Branch | `main` |
| Baseline commit | `c1febdebea90154c73bdc5d7f3798ac250e6e2dd` |
| Baseline tree | `cc4d3d6df3327310fa5f0b0053ea88bc3b621dea` |
| N3 governance artifact | `NP-12-SCREENING-CRITERIA-OPERATOR-BOOLEAN-GOVERNANCE.md` — blob `c2402d36b7610cb4ce52abf1d071d3d46f136f62` |
| Prior N4 governance artifact | `NP-12-SCREEN-DEFINITION-GOVERNANCE-DECISIONS.md` — blob `8941acadfd01c3edf97a91bd012ff616abed311f` |
| Prior N4 Program Authority record | `NP-12-N4-PROGRAM-AUTHORITY-DECISION-RECORD.md` — blob `59debade35d11551ee5948376a8462e198589679` |
| Population semantics artifact | `NP-12-SECTOR-REFERENCE-POPULATION-SEMANTICS-DEFINITION.md` — blob `af732d754992e00557246e73d2ec2a99c939c73b` |
| Implementation-authority decision | `NP-12-IMPLEMENTATION-AUTHORITY-DECISION.md` — blob `316482cb0022657b3f5ef1f91a2f7cd4e042585d` |
| Previous implementation-readiness report | `NP-12-IMPLEMENTATION-READINESS-GATE-REPORT.md` — blob `10e8dc0099db848217966111a113255dd21d516b` |

The existing N4 record left the identifier runtime types/value domains and exact byte grammar open, and delegated mechanical byte encoding to a subsequent authorized design/implementation gate. This record closes the semantic identifier decisions below only. The mechanical grammar and digest preimage remain open.

## 2. Frozen prior decisions

All accepted N3, population G1–G5, and prior N4 decisions remain unchanged. In particular, this record does not alter:

- the N3 admitted fields, operators, flat-AND behavior, exclusions, or fail-closed unavailable-growth behavior;
- population identity, uniqueness, duplicate rejection, ordering, sector normalization, or membership-only semantics;
- Definition identity `(definitionId, version)`, the single explicit version axis, historical immutability, and the requirement that a semantic change create a new version;
- Definition semantic content: `definitionId`, `version`, `populationIdentity`, and the canonical predicate collection;
- predicate shape `{ field, operator, operand }`, ordering `field → operator → canonical operand`, exact canonical duplicate removal, valid empty predicates, or permitted contradictions;
- fixed-point decimal semantics, range, precision, rejection, negative-zero normalization, or numeric equivalence; or
- SHA-256’s integrity/equality-aid role and the exclusion of execution/result/snapshot/evidence identifiers, timestamps, and runtime metadata.

The Definition references `populationIdentity`; it does not embed or redefine population membership. No broader logical simplification is authorized.

## 3. Program Authority Decision A — `definitionId`

The Program Authority decides:

### Type and value domain

- `definitionId` is an **opaque textual identifier**.
- It must be non-empty and non-blank.
- It is represented as text; no UUID, ULID, numeric, or semver structure is imposed.
- It has no numeric interpretation.

### Equality and identity significance

- Equality is exact textual equality.
- Case is significant and comparison is case-sensitive: `ABC` and `abc` are different values.
- The exact admitted spelling is identity-significant.

### Whitespace

- Leading or trailing whitespace is not silently trimmed. It remains part of the supplied value when the value is otherwise admitted.
- Whitespace inside an identifier remains part of the supplied value when otherwise admitted by the identifier grammar.
- An empty value or whitespace-only value is rejected.

### Unicode

- Unicode text is admitted without implicit normalization.
- No NFC, NFD, NFKC, or NFKD normalization is applied automatically.
- Distinct Unicode spellings remain distinct unless they are literally the same admitted string.

### Aliases and coercion

- Aliases are not admitted.
- Coercion is not permitted. Numbers, objects, booleans, and other non-text values must not be converted to strings.

## 4. Program Authority Decision B — `version`

The Program Authority decides:

### Type and value domain

- `version` is an **opaque textual version value**.
- It must be non-empty and non-blank.
- It is represented as text; no semver grammar is imposed.
- Numeric coercion and automatic zero-padding are not permitted.
- No numeric ordering is inferred.

### Equality and identity significance

- Equality is exact textual equality and is case-sensitive.
- The exact admitted spelling is identity-significant.
- Therefore `"1"` differs from `"01"`, and `"1.0"` differs from `"1"`, unless a future governance decision explicitly changes the rule.

### Whitespace and Unicode

- No implicit trimming is performed. Leading, trailing, or internal whitespace remains part of the supplied value when otherwise admitted.
- Empty and whitespace-only values are rejected.
- Unicode text is admitted without implicit normalization; no Unicode normalization form is applied automatically.

### Aliases and coercion

- Aliases are not admitted.
- Coercion is not permitted. Non-text values must not be converted to text.

### Version semantics retained

This decision governs identity and equality only. It introduces no independent version-ordering or comparison algorithm. The existing N4 decisions remain: one explicit version axis, a semantic change creates a new version, and historical versions are immutable.

## 5. Program Authority Decision C — identifier encoding boundary

`definitionId` and `version` must be encoded as their governed textual values. The eventual encoding must be lossless and preserve exact admitted spelling, case, meaningful whitespace, and Unicode distinctions. It must introduce no normalization, alias, or coercion.

This decision does **not** select UTF-8 or any other text-to-byte encoding. That mechanical choice is reserved for the subsequent canonical-byte-grammar design gate. Neither identifier may be reinterpreted as a UUID, ULID, integer, hash, normalized identifier, or numeric version.

## 6. Canonical byte grammar remains a separate mechanical design

Identifier semantic preconditions are closed by this record. The exact canonical byte grammar is **not** specified here. The subsequent design gate must derive a deterministic, injective, unambiguous, lossless encoding from the governed semantics and must be independently implementable.

That gate must preserve:

- the exact Definition semantic fields: `definitionId`, `version`, `populationIdentity`, and canonical predicates;
- the governed predicate order `field → operator → canonical operand` after exact canonical duplicate removal;
- the frozen numeric canonical representation and equivalence rules;
- the external `populationIdentity` reference without embedding population membership; and
- the valid empty-predicate meaning: match the entire bound population.

The grammar must not depend on JavaScript object-property enumeration, `JSON.stringify()` ordering, caller numeric spelling, or runtime metadata. It must not substitute tag ordering for the governed predicate ordering.

The following mechanical decisions remain open for the subsequent gate: format/version discriminator inclusion; exact text encoding; string-length unit and representation; integer and collection-count encoding; field/operator encoding; numeric bytes derived from the canonical decimal value; predicate framing; empty-predicate bytes; `populationIdentity` representation; delimiters/tags; and exact concatenation/order.

For `populationIdentity`, the design gate must explicitly decide how its governed textual value is encoded. It must not silently decode the SHA-256 hexadecimal text to raw digest bytes. That representation choice is not made by this record.

## 7. Program Authority Decision D — SHA-256

SHA-256 remains the Definition content digest and an integrity/equality aid only. It does not replace authoritative Definition identity `(definitionId, version)`.

The exact SHA-256 preimage is to be derived only after the canonical byte grammar is completely specified. It excludes:

- `executionId`;
- `resultId`;
- `snapshotId`;
- `evidenceId`;
- timestamps; and
- runtime metadata.

Knowledge of the SHA-256 algorithm alone does not make the digest preimage ready.

## 8. Retention remains closed

This record does not reopen or alter the already-closed lifecycle decision:

- Definition Versions remain persistent and retrievable by `(definitionId, version)`;
- automatic expiry and TTL are not permitted;
- deletion is permitted only through a separately governed lifecycle/deletion event;
- until such an event is governed, no automatic deletion is authorized;
- no fixed calendar duration is selected; and
- storage technology remains ungoverned.

## 9. Required follow-on design boundary

After this record is durably published to authoritative `main`, a subsequent mechanical design gate may specify:

1. format discriminator, if any;
2. exact UTF-8/text encoding;
3. string-length representation;
4. integer/count encoding;
5. field encoding;
6. operator encoding;
7. numeric encoding derived from canonical decimal values;
8. predicate framing;
9. empty-predicate representation;
10. `populationIdentity` representation;
11. exact concatenation/order; and
12. the exact SHA-256 preimage.

That gate must not reopen the semantic decisions in this record. Any mechanical encoding must be deterministic, injective, lossless, unambiguous, and independently implementable. No implementation authority is granted by this record.

## 10. Determinism requirements for the follow-on grammar

| Input variation | Required result |
|---|---|
| Identical `definitionId` | Identical bytes |
| `definitionId` case difference | Different bytes |
| `definitionId` Unicode spelling difference | Different bytes |
| `definitionId` leading/trailing meaningful-whitespace difference | Different bytes |
| Identical `version` | Identical bytes |
| `"1"` versus `"01"` | Different bytes |
| Version case difference | Different bytes |
| `populationIdentity` difference | Different bytes |
| Predicate reordering | Identical bytes after canonical ordering |
| Exact canonical duplicate predicates | Identical bytes after deduplication |
| `75`, `75.0`, `75.000000` | Identical bytes |
| `-0`, `0` | Identical bytes |
| Exponent notation | Reject |
| Excess precision | Reject |
| NaN | Reject |
| Infinity | Reject |
| Empty predicates | One deterministic encoding |
| Different valid numeric values | Different bytes |
| Independent implementations using the same specification | Identical bytes |

## 11. Implementation boundary and non-actions

This record is governance only. It creates no runtime Definition type, identifier validator, serializer, persistence layer, API, test, or source change. It does not authorize IRR↔IPD integration or production work.

The existing implementation-authority decision remains limited to NP-12 G1–G5 population implementation. **Implementation authority for N4 Definition serialization remains NOT GRANTED.**

**End of Program Authority decision record.**
