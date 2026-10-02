# NP-12 N4-A6 — Screen Contract Specification

**Record identifier:** `NP-12-N4-A6`
**Record type:** Program Authority contract specification record — durable publication act
**Workstream:** NP-12 — Governed Screener
**Gate:** N4-A6 — Contract Specification / Implementation-Readiness Verification, published following the N4-A7 Contract Specification Authority Decision boundary
**Program Authority / Signer:** Ramki (Ramakrishnan)
**Title / Role:** Program Authority
**Decision status:** **APPROVED** — all six A6 contract decisions (`A6-DR-01` through `A6-DR-06`)
**Publication authorization:** Explicitly granted by Ramki for this gate
**Implementation authority:** **NOT GRANTED BY N4-A6**
**Scope:** Governance and contract specification authority only
**Repository:** `ramkivs/iips-review-recovered`
**Authoritative ref:** `refs/heads/main`
**IPD:** `ramkivs/iips-production-market-data` — reference-only; zero mutations
**Production:** OUT OF SCOPE; zero mutations

---

## 1. Gate identity and scope

This record durably publishes the contract specification authorized at:

> **NP-12 N4-A6 — Contract Specification / Implementation-Readiness Verification Gate**

following the explicit authority decisions rendered at the **N4-A7 Contract Specification Authority Decision** boundary.

**Investigation basis:** the completed read-only **N4-A6 investigation**, which returned `CONDITIONALLY READY — SPECIFICATION GAPS REMAIN` and isolated exactly six unresolved authority decisions (`A6-DR-01` … `A6-DR-06`). Those six decisions have now been explicitly approved by the Program Authority and are recorded in Section 4 of this record as **authority, not recommendation**.

**This record is additive.** It does not rewrite, amend, supersede, or reinterpret any existing governance artifact.

### 1.1 What this record is

1. The authoritative, deterministic contract specification for the Screen Member Evaluation Input, `inputHash`, ScreenExecution identity, and ScreenResult identity.
2. The additive authorization of three new canonical mechanical format discriminators.
3. A record of exactly which matters remain **unresolved** and which remain **implementation dependencies**.

### 1.2 What this record is not

1. It is **not** implementation authority of any kind.
2. It is **not** a certification, acceptance, or conformance statement. No sector engine is asserted to conform to this contract.
3. It is **not** an amendment to N3, N4, N4-SD, A3, or A5.
4. It is **not** a modification of the frozen `NP12DEF` format-1 byte grammar.

---

## 2. Authoritative baseline

Verified remotely at gate start, before any mutation.

| Item | Value | Verification |
|---|---|---|
| Authoritative repository | `ramkivs/iips-review-recovered` | — |
| Authoritative ref | `refs/heads/main` | — |
| Baseline commit | `7f492ad5e213f1577b769d4f7959ea1f485c7d01` | **VERIFIED** on authoritative remote |
| Baseline tree | `71b9dfa985f0fc86b6256274c7995afff553d733` | **VERIFIED** on authoritative remote |
| N4-A5 artifact | `NP-12-N4-A5-AUTHORITY-DECISION-RECORD.md` | **VERIFIED** present |
| N4-A5 artifact blob | `0aaffdfaa9fcffb20255666d970ed9d1dad1d68e` | **VERIFIED** |
| N4-A1 immutable bound baseline commit | `f2886a5af43ad8df8676589daef86836039150f5` | **VERIFIED** reachable |
| N4-A1 immutable bound baseline tree | `46c1a15bbcd1291701484457d1fe9815d8538888` | **VERIFIED** |
| Pre-existing A6 artifact on `main` | none | **VERIFIED** absent |
| Worktree at gate start | clean | **VERIFIED** |

**Moving-ref rule:** the N4-A1 baseline remains the exact commit/tree recorded above even as `main` advances. This record references it and does **not** rebind it.

---

## 3. Frozen authority chain

The following are closed and are **not** reopened, reinterpreted, amended, or superseded by this record:

| Gate | Status in this record |
|---|---|
| N1 — Screening Population / Universe | Fixed input; read only |
| N2 — Criteria Field Registry | Fixed input; exactly `conviction`, `quality`, `growth` |
| N3 — Operators / Boolean / Population Identity | Fixed input; §7 growth semantics observed verbatim; **no amendment** |
| N4 — Screen Definition governance | Fixed input |
| N4 Definition Identifier governance | Fixed input; identity remains `(definitionId, version)` |
| N4 Canonical Byte Grammar — format `NP12DEF` / `01` | **FROZEN AND UNMODIFIED**; its elementary encodings are reused unchanged |
| N4-SD — Screen Definition implementation | Fixed input; unmodified |
| B0–B5 — baseline-binding chain | Fixed input |
| N4-A1 / N4-A2 / N4-A3 / N4-A4 / N4-A5 | Fixed inputs; `D-A2-1`…`D-A2-5` and `A5-D01`…`A5-D09` remain authoritative |

---

## 4. The six approved A6 decisions

These are recorded as **authority**. They were explicitly approved by the Program Authority at the N4-A7 decision boundary.

### 4.1 `A6-DR-01` — Canonical encoding of unavailable growth

**Status:** `APPROVED — OPTION C`

**Approved decision (exact wording):**

> Use an explicit availability state at the Screen boundary while retaining the established N3 observable semantics under which unavailable growth does not satisfy any growth predicate.
>
> A legitimate numeric `0` remains non-matchable for all growth predicates under this contract.
>
> The Screen boundary MUST carry explicit availability rather than reconstructing availability solely from a numeric value.
>
> This decision preserves the established N3 observable behaviour while satisfying A5-D03's requirement that availability be carried explicitly.

**Consequences:**

1. Growth at the Screen Member Evaluation Input boundary carries an **explicit availability state**, not a reconstructed numeric inference.
2. N3 §7 observable behaviour is **preserved exactly**: no growth value of zero, and no unavailable growth, satisfies any of `lt`, `lte`, `gt`, `gte`, `eq`.
3. A5-D03 is satisfied operatively: unavailable growth and a legitimate calculated numeric `0` are **distinguishable in carriage and in the canonical preimage**, even though they are **indistinguishable in predicate outcome**.
4. A5-D07 is satisfied: `growth = null` is the unavailable state and is never an invalid member.
5. No second growth sentinel is introduced.

**Changes existing closed governance?** **NO.** N3 §7 is unamended and its observable predicate behaviour is unchanged. A5-D03 and A5-D07 are satisfied, not altered.

### 4.2 `A6-DR-02` — Provenance set closure

**Status:** `APPROVED — A6 RECOMMENDATION`

**Approved decision (exact wording):**

> Retain the established seven-item minimum provenance set from D-A2-1/A5.
>
> `requestId` MAY be carried as audit-only provenance but is not part of the canonical member identity/hash.
>
> Do not add provider, as-of, freshness, sourceRevision or population-vintage as mandatory Screen-member contract fields in this gate.
>
> Those fields remain outside the current mandatory provenance closure unless separately governed.

**Consequences:** the mandatory Screen provenance closure is the D-A2-1 seven-item minimum. `requestId` is optional, audit-only, and hash-excluded. `provider`, `as-of`, `freshness`, `sourceRevision`, and population vintage are **out of the Screen contract** and remain unresolved pending a separate provenance authority gate (Section 13, `A6-U-01`).

**Changes existing closed governance?** **NO.** D-A2-1's seven-item minimum is retained verbatim.

### 4.3 `A6-DR-03` — Timestamp hash membership

**Status:** `APPROVED — A6 RECOMMENDATION`

**Approved decision (exact wording):**

> Timestamp MUST be carried as provenance.
>
> Timestamp MUST NOT participate in:
>
> * `inputHash`
> * `executionId`
> * `ScreenResult` identity
>
> This preserves deterministic identity/reproducibility while retaining timestamp provenance.

**Consequences:** `timestamp` remains a required provenance item under D-A2-1 and a required execution binding under D-A2-5, but is excluded from every identity-bearing preimage in this specification.

**Changes existing closed governance?** **NO.** It reconciles D-A2-1 (carry) with A5-D09 (no nondeterministic runtime state in identity), in exact parallel with the frozen byte grammar's own unconditional exclusion of timestamps from the Definition preimage.

### 4.4 `A6-DR-04` — `inputHash` scope

**Status:** `APPROVED — PER-MEMBER SCOPE ONLY`

**Approved decision (exact wording):**

> `inputHash` represents the canonical Screen Member Evaluation Input for one member.
>
> It MUST NOT be overloaded as an aggregate execution hash.
>
> ScreenExecution identity binds the ordered member identities and their `inputHash` values.

**Consequences:** exactly one `inputHash` exists per evaluated member. There is no population-level or execution-level `inputHash`. Population and execution binding are achieved solely through `executionId` (Section 9).

**Changes existing closed governance?** **NO.** It specifies A5-D04 without extending it.

### 4.5 `A6-DR-05` — ScreenExecution identity construction

**Status:** `APPROVED — HASH-OF-HASHES`

**Approved decision (exact wording):**

> ScreenExecution identity MUST be derived from a canonical execution envelope plus the ordered member identity / `inputHash` bindings.
>
> Conceptually:
>
> ```text
> executionId =
> SHA-256(
>     canonical execution envelope
>     +
>     ordered member identity/inputHash bindings
> )
> ```
>
> The existing governed G5 member ordering MUST be used verbatim.
>
> Do NOT introduce an alternative sorting rule.

**Consequences:** member canonical serialization is defined exactly once (format `NP12MBR`) and consumed by the execution preimage as a digest. `(sector, referenceId)` is retained alongside each `inputHash` so that a permutation of member hashes cannot alias. G5 ordering is consumed verbatim and never re-derived.

**Changes existing closed governance?** **NO.** G5 ordering is used as published, not redefined.

### 4.6 `A6-DR-06` — Canonical format discriminators

**Status:** `APPROVED — ADDITIVE AUTHORIZATION`

**Approved decision (exact wording):**

> Authorize the following versioned canonical format discriminators:
>
> ```text
> NP12MBR v01
> NP12EXE v01
> NP12RES v01
> ```
>
> They are additive governance constructs and MUST reuse the existing canonical encoding / byte-grammar vocabulary.
>
> They MUST NOT reopen or alter N3/N4/A3/A5 authority.

**Consequences:** three new frozen mechanical formats are established in Sections 8–10. Each is **frozen by this record** on the same terms format 1 is frozen: no extension area, no optional tag, no alternate spelling, no field-skipping. Any future change requires separate explicit governance and a separately assigned discriminator.

**Changes existing closed governance?** **NO.** Format `NP12DEF` / `01` is untouched. This record satisfies the byte grammar's own §9.1 requirement that a new grammar receive separate explicit governance and a separately assigned discriminator.

---

## 5. Reused canonical vocabulary — unchanged

This specification introduces **no new elementary encoding**. It reuses the frozen `NP12DEF` vocabulary verbatim.

| Primitive | Definition | Source |
|---|---|---|
| Octet | integer 0–255 | Byte grammar §6.1 |
| `\|\|` | ordered octet-sequence concatenation; adds no separator | Byte grammar §6.1 |
| `U32BE(n)` | exactly four octets, unsigned big-endian, `0 ≤ n ≤ 4,294,967,295`; no varint, no signed form, no little-endian option, no padding | Byte grammar §6.2 |
| `UTF8(s)` | strict RFC 3629 shortest-form encoding of a valid Unicode scalar sequence; no normalization, no case folding, no trimming, no U+FFFD replacement; unpaired surrogates rejected | Byte grammar §6.3 |
| `T(s)` | `U32BE(utf8ByteLength(s)) \|\| UTF8(s)` — the length-prefixed text frame | Byte grammar §6 |
| SHA-256 | standard SHA-256 over exactly the specified octets | Byte grammar §10 |
| Digest rendering | 64 lowercase hexadecimal characters, two per digest octet, no prefix; rendering is never part of a preimage | Byte grammar §10 |

**General framing rules, inherited unchanged:** no component delimiters, no field tags, no operator tags, no end marker, no padding, no BOM, no trailing newline, no total-message-length prefix, and no digest field inside its own preimage. Boundaries come only from fixed widths, byte-length prefixes, counts, and known positional structure. An implementation must never walk arbitrary object properties to decide preimage membership.

---

## 6. Canonical decimal representation

**Status: GOVERNED AND ALREADY IMPLEMENTED.** This specification reuses the existing representation without semantic change. The frozen `ScreenDefinition` grammar is **not modified**.

### 6.1 Accepted lexical form

```text
canonicalDecimal := ( "0" | [1-9][0-9]* ) [ "." [0-9]{1,6} ]
```

ASCII only. The characters are exclusively ASCII digits and, when present, ASCII `.` (octet `2e`).

### 6.2 Exact value and fixed-point key

```text
q = 1,000,000 × x
q ∈ ℤ
0 ≤ q ≤ 100,000,000
```

`q` is an exact mathematical fixed-point key, **not** a binary floating-point multiplication and **not** a second wire representation. It is used for equality, deduplication, and ordering only, and is never serialized as an integer.

### 6.3 Canonical text derivation

```text
a = floor(q / 1,000,000)
r = q − 1,000,000 × a

write a as ASCII base-10 digits, no leading zeroes, except integer zero is "0"
if r = 0 : that integer text is the complete canonical text
otherwise: write r as exactly six zero-padded decimal digits,
           remove trailing zeroes from that six-digit sequence,
           append "." plus the remaining fractional digits
```

The fractional sequence is therefore non-empty and ends in `1`–`9`. The mapping never rounds and yields exactly one canonical text per governed value.

### 6.4 Required properties

| Property | Rule |
|---|---|
| Exponent notation | **REJECTED** (`1e1` is not admissible) |
| `NaN` | **REJECTED** |
| `+Infinity` / `-Infinity` | **REJECTED** |
| Non-finite values generally | **REJECTED** |
| More than six fractional digits | **REJECTED** before any trailing-zero removal — `75.0000000` is rejected and is not rescued by its zeroes |
| Silent rounding / implicit quantization | **PROHIBITED** (A5-D02: fail closed) |
| Trailing fractional zeroes | canonicalized away — `75`, `75.0`, `75.000000` all canonicalize to `75` |
| Negative zero | `-0`, `-0.0`, `-0.000000` canonicalize to `0` |
| Negative non-zero | **REJECTED** (out of `[0,100]`) |
| Range | `0 ≤ q ≤ 100,000,000`; `100.000001` is out of range even though its lexical shape is valid |
| Leading zeroes | **REJECTED** other than the single integer `0` |
| Reversibility | the canonical-text ↔ `q` mapping is a **bijection**; base-10 integer arithmetic recovers `q` exactly |

### 6.5 Boundary-crossing rule — normative

> Canonical member values **MUST** cross the Screen boundary as **canonical decimal text**.

A6-DR-01 through A6-DR-06 presuppose this. A5-D01 requires decimal precision to be determined from the producer's canonical decimal representation rather than the exact binary IEEE-754 expansion; a value typed as a binary `number` cannot carry a canonical decimal representation and therefore **cannot** satisfy A5-D01. This mirrors the already-implemented Definition operand, which is text for exactly this reason.

Establishing that text at the producer side is an **implementation dependency** (Section 14, `A6-IMPL-01`), not a licence to modify any engine under this record.

---

## 7. Screen Member Evaluation Input — canonical contract

### 7.1 Member identity

The authoritative Screen member key is:

```text
(canonical sector, referenceId)
```

where `canonical sector` is one of the thirteen G1-normalized certified sector names and `referenceId` is the opaque identifier obtained verbatim from `EngineOutput.companyId` after G1–G5 validation — no trimming, case-folding, aliasing, or reinterpretation beyond the already-governed G1–G5 normalization.

### 7.2 Field disposition

| Field | Scope | Disposition | Hash membership | Basis |
|---|---|---|---|---|
| `sector` | member | **REQUIRED** — one of the 13 canonical names | **IN** | D-A2-1 |
| `referenceId` | member | **REQUIRED** — opaque, verbatim | **IN** | D-A2-1 |
| `conviction` | member | **REQUIRED** — canonical decimal text; absent → invalid member | **IN** | D-A2-1, D-A2-4 |
| `quality` | member | **REQUIRED** — canonical decimal text; absent → invalid member | **IN** | D-A2-1, D-A2-4 |
| `growth` | member | **CONDITIONAL** — present iff availability state is `AVAILABLE` | **IN** | A5-D07, A6-DR-01 |
| `growthAvailability` | member | **REQUIRED** — explicit state, never reconstructed | **IN** | **A6-DR-01** |
| `snapshotId` | member + execution | **REQUIRED** | **IN** | D-A2-1 |
| `evidenceId` | member | **REQUIRED** | **IN** | D-A2-1 |
| `calibrationVersion` | member | **REQUIRED** | **IN** | D-A2-1 |
| engine identity | member | **REQUIRED** — `engineId` | **IN** | D-A2-1 |
| engine version | member | **REQUIRED** — `engineVersion` | **IN** | D-A2-1 |
| population identity | population | **REQUIRED** — 64-character lowercase hex (G4) | **IN** | D-A2-1, G4 |
| `inputHash` | member | **DERIVED** — never an input to itself | **N/A** | A5-D04 |
| `timestamp` | execution | **REQUIRED as provenance** | **EXCLUDED** | **A6-DR-03** |
| `requestId` | execution | **OPTIONAL** — audit-only | **EXCLUDED** | **A6-DR-02** |
| `provider`, `as-of`, `freshness`, `sourceRevision`, population vintage | — | **EXCLUDED from the Screen contract** | **EXCLUDED** | **A6-DR-02**; unresolved, see `A6-U-01` |

Admitted Screen member values are exactly `conviction`, `quality`, and `growth`. No additional screening field is admitted.

### 7.3 Growth availability encoding — `A6-DR-01` Option C, normative

**Availability state vocabulary** — exactly two values, no third state, no second sentinel:

```text
AVAILABLE
UNAVAILABLE
```

**Producer-side → Screen-boundary mapping:**

| Producer condition | Screen availability state | Growth value present? |
|---|---|---|
| `growth = null` | `UNAVAILABLE` | no |
| `growth = undefined` | `UNAVAILABLE` | no |
| absent growth pillar (e.g. Healthcare) | `UNAVAILABLE` | no |
| incomplete / missing source components | `UNAVAILABLE` | no |
| genuine calculated value, including a genuine calculated `0` | `AVAILABLE` | yes |

A `renorm()` result of `0` is **not** automatically classified as unavailable solely because its numeric value is zero (D-A2-3). Its classification depends on the upstream missingness condition, which must be preserved by the producer (A5-D03). The Screen boundary **MUST NOT** reconstruct availability from the numeric value, and **MUST NOT** apply any reconstruction heuristic.

**Evaluation rule — normative, preserving N3 §7 observable behaviour:**

> For each of `lt`, `lte`, `gt`, `gte`, `eq`, a growth predicate is satisfied **only if** the member's growth availability state is `AVAILABLE` **and** the member's growth fixed-point key `q` is non-zero **and** the governed numeric comparison against the predicate operand holds.
>
> If availability is `UNAVAILABLE`, every growth predicate fails.
>
> If availability is `AVAILABLE` and `q = 0`, every growth predicate fails.

This is the exact observable behaviour of N3 §7 — under which the value `0` represents unavailable normalized growth and satisfies no growth predicate — preserved without amending N3. The unavailable sentinel is **not** subjected to naive numeric predicate evaluation.

**Reconciliation statement, as required:**

| Authority | How it is honoured here |
|---|---|
| N3 §7 — `growth = 0` is the unavailable sentinel and satisfies no growth predicate | Observable behaviour preserved exactly: no zero growth, available or not, ever matches. **No N3 amendment.** |
| A5-D03 — producer must not collapse unavailable growth and legitimate numeric `0` | Satisfied operatively: the two are distinct in carriage and produce **distinct `inputHash` values** (Section 8.3). |
| A5-D07 — `null` growth is unavailable, not invalid | Satisfied: `UNAVAILABLE` is a valid member state; it never enters the D-A2-4 invalid-member path. |
| A6-DR-01 Option C | Explicit availability carried; legitimate numeric zero non-matchable. |

**No second growth sentinel is introduced. `renorm()` is not altered by this record.**

### 7.4 Member validation and error semantics

Governed by D-A2-4 and A5-D08; represented here, not newly decided.

**Member-level invalidity** — the member receives a deterministic member-level validation status and error code. It does not silently participate, does not match any predicate, and does **not** cause an otherwise structurally valid execution to fail.

| Error code | Condition | Basis |
|---|---|---|
| `MEMBER_VALUE_MISSING` | `conviction` or `quality` absent | D-A2-4 |
| `MEMBER_VALUE_NON_NUMERIC` | value is not admissible canonical decimal text | D-A2-4 |
| `MEMBER_VALUE_OVER_PRECISION` | more than six fractional decimal digits | A5-D02 — fail closed, never round |
| `MEMBER_VALUE_OUT_OF_RANGE` | outside `[0,100]` | D-A2-2 |
| `MEMBER_VALUE_NON_FINITE` | `NaN`, `+Infinity`, `-Infinity` | D-A2-2 |
| `MEMBER_GROWTH_INVALID` | growth availability is `AVAILABLE` but the growth value is not admissible canonical decimal text | D-A2-3 |

`growth = null`, `growth = undefined`, and an absent growth pillar **never** produce an error code. They yield `UNAVAILABLE` and the member remains valid (A5-D07).

**Execution-level structural failure** — the entire Screen execution fails.

| Condition | Basis |
|---|---|
| invalid Screen Definition | D-A2-5 |
| population identity mismatch | D-A2-5 |
| missing required member | D-A2-5 §8.2.5 |
| extra member not in the bound population | D-A2-5 §8.2.5 |
| malformed execution contract | D-A2-4 |
| invalid canonical identity | A5-D09 |

Membership and sector validity are settled earlier by the governed G1–G5 population boundary and fail closed there; member-*value* validity is settled at the Screen-input composition boundary (A5-D05). The two responsibilities never merge.

---

## 8. Format `NP12MBR` version `01` — Screen Member Evaluation Input and `inputHash`

**Authorized by `A6-DR-06`. Frozen by this record.**

### 8.1 Header

```text
Magic:          4e 50 31 32 4d 42 52 00
Format version: 01
Header H_MBR:   4e 50 31 32 4d 42 52 00 01
```

The seven printable magic octets spell ASCII `NP12MBR`, followed by one fixed NUL octet, then a single unsigned format-version octet whose **only admitted value is 1**. It is not `U32BE(1)` and not textual `"1"`. The first preimage octet is exactly `4e`. All nine header octets enter the digest. No BOM or other prefix precedes them.

### 8.2 Growth component

```text
GROWTH(member) :=
    00                                                 when availability = UNAVAILABLE
    01 || T(canonical decimal text of growth)          when availability = AVAILABLE
```

The availability octet admits **exactly** the values `00` and `01`. Any other octet is invalid. The `00` form is complete in itself: no value frame follows it.

### 8.3 Exact `inputHash` preimage

```text
memberPreimage =
      4e 50 31 32 4d 42 52 00 01
   || T(sector)                          exact canonical sector name
   || T(referenceId)                     opaque, verbatim
   || T(populationIdentity)              64 hexadecimal TEXT octets, not 32 decoded octets
   || T(canonical decimal text of conviction)
   || T(canonical decimal text of quality)
   || GROWTH(member)
   || T(engineId)
   || T(engineVersion)
   || T(calibrationVersion)
   || T(snapshotId)
   || T(evidenceId)

inputHash = lowercase-hex( SHA-256( memberPreimage ) )
```

**Scope:** per-member only (`A6-DR-04`). There is no population-level or execution-level `inputHash`.

**Excluded unconditionally:** `timestamp` (`A6-DR-03`), `requestId` (`A6-DR-02`), `provider`, `as-of`, `freshness`, `sourceRevision`, population vintage, caller/portfolio identity, scenario, strategy, insertion order, memory identity, transport metadata, transport checksum, `transportHash`, any DTO checksum, any repository or Git blob hash, result data, and `inputHash` itself.

**`inputHash` is distinct from** transport checksum, `transportHash`, any arbitrary DTO checksum, any repository hash, any Git blob SHA, and any execution or result hash. It must never be substituted for, or derived from, any of them.

**A5-D03 satisfaction, demonstrated:** a member with `UNAVAILABLE` growth emits the single octet `00` at that position; a member with `AVAILABLE` growth of canonical value `0` emits `01 00 00 00 01 30`. These differ, therefore the two states produce **different `inputHash` values**, therefore availability is not collapsed. That they produce the **same predicate outcome** is the separately approved behaviour of `A6-DR-01` Option C.

### 8.4 Ordering within the member preimage

Field order is the fixed positional order written in §8.3. It is never object-property order, never locale collation, never alphabetical, and never caller-supplied.

---

## 9. Format `NP12EXE` version `01` — ScreenExecution identity

**Authorized by `A6-DR-06`. Frozen by this record.**

### 9.1 Header

```text
Magic:          4e 50 31 32 45 58 45 00
Format version: 01
Header H_EXE:   4e 50 31 32 45 58 45 00 01
```

ASCII `NP12EXE` || NUL || `01`. Only format-version value 1 is admitted.

### 9.2 Exact preimage — hash-of-hashes (`A6-DR-05`)

```text
executionPreimage =
      4e 50 31 32 45 58 45 00 01
   || T(definitionId)
   || T(version)
   || T(definitionDigest)                64 lowercase hex chars from ScreenDefinition.sha256()
   || T(populationIdentity)              64 hexadecimal TEXT octets
   || T(evaluatorId)
   || T(evaluatorVersion)
   || T(executionSemanticsVersion)
   || U32BE(memberCount)
   || for each member, in canonical G5 order:
            T(sector)
         || T(referenceId)
         || T(inputHash)                 64 lowercase hex TEXT chars from §8.3

executionId = lowercase-hex( SHA-256( executionPreimage ) )
```

`memberCount` is the number of members in the bound population and must equal the number of member bindings that follow. After exactly `memberCount` complete bindings the message ends; trailing octets are invalid.

### 9.3 Binding and identity rules

1. Definition **identity** remains the exact `(definitionId, version)` pair. `definitionDigest` is bound for integrity under D-A2-5 §8.2.1 and is **never** a substitute for identity.
2. Population identity is the membership-only G4 digest, bound as 64 hexadecimal text octets.
3. Member ordering is the **governed G5 order, consumed verbatim** (`A6-DR-05`). No alternative sorting rule is introduced, and the order must not be re-derived under a different comparator.
4. `(sector, referenceId)` is retained alongside each `inputHash` so that a permutation of member hashes cannot alias to the same execution.
5. `timestamp` and `requestId` do **not** appear (`A6-DR-03`, `A6-DR-02`).
6. No identity may depend on insertion order, caller or memory identity, or nondeterministic runtime state (A5-D09).

---

## 10. Format `NP12RES` version `01` — ScreenResult identity

**Authorized by `A6-DR-06`. Frozen by this record.**

### 10.1 Header

```text
Magic:          4e 50 31 32 52 45 53 00
Format version: 01
Header H_RES:   4e 50 31 32 52 45 53 00 01
```

ASCII `NP12RES` || NUL || `01`. Only format-version value 1 is admitted.

### 10.2 Status vocabularies — exact ASCII tokens, no tags

```text
executionStatus    ∈ { "COMPLETED", "FAILED" }
memberResultStatus ∈ { "MATCH", "NO_MATCH", "INVALID_MEMBER" }
memberErrorCode    ∈ the Section 7.4 member error codes, or "" when status ≠ INVALID_MEMBER
```

There are no numeric status tags. Only these exact framed texts are valid.

### 10.3 Exact preimage

```text
resultPreimage =
      4e 50 31 32 52 45 53 00 01
   || T(executionId)                     64 lowercase hex TEXT chars from §9.2
   || T(executionStatus)
   || U32BE(totalPopulationCount)
   || U32BE(matchedCount)
   || U32BE(memberResultCount)
   || for each member result, in canonical G5 order:
            T(sector)
         || T(referenceId)
         || T(memberResultStatus)
         || T(memberErrorCode)           T("") when status ≠ INVALID_MEMBER

resultId = lowercase-hex( SHA-256( resultPreimage ) )
```

### 10.4 Matched-count representation

```text
matchedCount         = |{ m : memberResultStatus(m) = "MATCH" }|
totalPopulationCount = |bound population|

INVALID_MEMBER members ARE counted in totalPopulationCount
INVALID_MEMBER members are NEVER counted in matchedCount

invariant: matchedCount + nonMatchCount + invalidCount = totalPopulationCount
```

This follows directly from A5-D08 (an invalid member does not match and does not fail the execution) and D-A2-5 §8.2.4 (evaluation covers exactly the bound population).

### 10.5 Required result shapes

| Case | `executionStatus` | Member results | `matchedCount` | Identity |
|---|---|---|---|---|
| Successful result | `COMPLETED` | one per bound member | 0…N | computed |
| Structurally failed execution | `FAILED` | **none emitted** | n/a | the execution fails before result identity; no partial result is canonical |
| Member-level invalidity | `COMPLETED` | that member `INVALID_MEMBER` + error code | excludes that member | computed |
| Zero matches | `COMPLETED` | all valid members `NO_MATCH` | `0` → `00 00 00 00` | computed |
| All matches | `COMPLETED` | all `MATCH` | `= totalPopulationCount` | computed |
| Empty predicate collection (match-all) | `COMPLETED` | all **valid** members `MATCH` | = count of valid members | computed |
| Contradictory predicates | `COMPLETED` | all valid members `NO_MATCH` | `0` | computed |

The contradictory-predicate case is **byte-identical** to the zero-match case. This is correct and intended: D-A2-5 §8.2.6 states that contradictory predicates produce an empty result, and the frozen byte grammar forbids any contradiction detector or logical simplifier. Empty predicate collections retain the governed match-all semantics (D-A2-5 §8.2.7); match-all applies to valid members only, since an invalid member never matches (A5-D08).

### 10.6 Result binding requirements

ScreenResult binds, per D-A2-5 §8.2.2: the ScreenExecution reference; matched member identity; canonical member ordering; total population count; matched count; result status; result identity/digest; and the provenance/reference chain — the latter carried alongside the result, not inside the identity preimage, consistent with `A6-DR-03`.

---

## 11. Identity separation — normative

The four identity-bearing concepts are distinct and must never be conflated or substituted:

| Concept | Value | Derivation |
|---|---|---|
| **Member identity** | `(canonical sector, referenceId)` | governed tuple; **not a hash** |
| **Member `inputHash`** | 64 lowercase hex | `SHA-256` of the `NP12MBR` preimage (§8.3); per-member only |
| **Execution identity** | 64 lowercase hex | `SHA-256` of the `NP12EXE` preimage (§9.2) |
| **Result identity** | 64 lowercase hex | `SHA-256` of the `NP12RES` preimage (§10.3) |

Also distinct, and never interchangeable with any of the above: Definition identity `(definitionId, version)`; the Definition content digest from the frozen `NP12DEF` format 1; the membership-only G4 population identity; transport checksum; `transportHash`; any DTO checksum; any repository or Git blob SHA.

**Preserved invariants, as required:** deterministic canonical serialization; deterministic field ordering; deterministic numeric representation; explicit unavailable state; SHA-256; G5 ordering; Definition identity/version/digest binding; population identity; evaluator identity/version; execution semantics version. **No timestamp enters any identity-bearing hash.**

---

## 12. Ordering requirements

| Boundary | Rule | Status |
|---|---|---|
| Member input order | canonical G5: normalized sector ASC, then `referenceId` ASC | **GOVERNED** — used verbatim |
| Member result order | identical G5 comparator | **GOVERNED** (D-A2-5 §8.2.3) |
| Predicate order | `field → operator → q`, deduplicated; `conviction < growth < quality`; `eq < gt < gte < lt < lte` | **GOVERNED** — frozen byte grammar §5.3, unchanged |
| Provenance / field order | the fixed positional order of each preimage in §§8–10 | **SPECIFIED HERE** |
| Canonical serialization | positional, length-prefixed; no delimiters, tags, padding, or trailer | **SPECIFIED HERE**, inheriting byte grammar §9 |

**Normative:** the governed G5 ordering MUST be used **verbatim**. An implementation MUST consume the ordering produced by the governed population boundary and MUST NOT re-sort members under any other comparator. This matters because the governed G5 comparator orders JavaScript strings by UTF-16 code unit, whereas the frozen byte grammar's token comparator is unsigned UTF-8 octet order. For the thirteen canonical sector names, which are pure ASCII, the two coincide exactly. For a `referenceId` containing scalars above U+FFFF they can diverge. G5 is authoritative for member order; re-derivation is prohibited. Recorded as implementation constraint `A6-IMPL-09`.

---

## 13. Unresolved matters

Recorded as unresolved rather than invented, per the gate's instruction.

| ID | Unresolved matter | Why unresolved | Disposition |
|---|---|---|---|
| `A6-U-01` | `provider`, `as-of`, `freshness`, `sourceRevision`, population vintage | No repository evidence; expressly excluded by `A6-DR-02` | Outside the Screen contract unless a separate provenance authority gate establishes them |
| `A6-U-02` | Concrete value of `evaluatorId` | No evaluator exists; naming is an implementation act | Assigned when the evaluator is authorized |
| `A6-U-03` | Concrete value of `evaluatorVersion` | Same | Assigned when the evaluator is authorized |
| `A6-U-04` | Concrete value of `executionSemanticsVersion` | No evaluation semantics version has been issued | Assigned at implementation authorization |
| `A6-U-05` | Population version / vintage representation | G4 population identity is membership-only and carries no vintage; N1/N3 not reopened | Out of scope here |
| `A6-U-06` | Implementation location of the A5-D05 Screen-input composition boundary | A5-D05 deliberately names no file or component | Determined at implementation authorization |

These are **specification-level open items**, not contract contradictions. Each is bounded and none blocks the deterministic reading of Sections 6–12.

---

## 14. Implementation dependency register

Carried forward from the N4-A6 investigation. These are **implementation planning records only**. None is authorized by this artifact.

| ID | Dependency | Evidence at the verified baseline | Severity |
|---|---|---|---|
| `A6-IMPL-01` | Producer-side conversion to canonical decimal text, ≤ 6 fractional digits | `renorm()` returns an unrounded IEEE-754 quotient `Σ(s·w) / Σw`, non-terminating in decimal for most governed weightings | **HIGH** |
| `A6-IMPL-02` | Producer-side growth availability preservation | `renorm()` returns a bare `0` when no constituents are available, destroying availability before any boundary | **HIGH** — required by `A6-DR-01` |
| `A6-IMPL-03` | Per-member provenance plumbing across the `ExecutionResult` boundary | `snapshotRef` and `evidenceRef` are optional; `metadata` is an untyped record | **HIGH** |
| `A6-IMPL-04` | `calibrationVersion` coverage | exposed in runtime metadata by only 4 of 13 engines | **HIGH** |
| `A6-IMPL-05` | Member-value → `q` conversion at the member boundary | the governed decimal routine exists only inside the Definition module | MEDIUM |
| `A6-IMPL-06` | Screen evaluator, with identity and version | no evaluator exists | **HIGH** |
| `A6-IMPL-07` | ScreenExecution runtime | no runtime exists | **HIGH** |
| `A6-IMPL-08` | ScreenResult runtime and member-result model | no runtime exists | **HIGH** |
| `A6-IMPL-09` | Serialization must consume G5 order verbatim, never re-sort | UTF-16 versus UTF-8 comparator divergence above U+FFFF | LOW |
| `A6-IMPL-10` | **Source convergence across all 13 engines** | the only in-repository `EngineOutput[]` producer mixes a live composite with frozen golden-fixture quality and growth — expressly inadmissible under A5-D06 | **CRITICAL** |

### 14.1 Certification boundary — explicit

> **Approval and publication of this specification does NOT mean that any sector engine is conformant with it.**

`A6-IMPL-10` remains explicitly open and tracked. At the verified baseline, **no** engine demonstrably satisfies the full contract: canonical decimal text is not emitted, growth availability is not preserved, and `calibrationVersion` is exposed by only 4 of 13 engines. Any producer-side change required to reach conformance needs its own bounded implementation authorization, and its effect on the certified and frozen status of the affected engines must be addressed explicitly at that time rather than assumed.

---

## 15. Implementation authority

> ## **IMPLEMENTATION AUTHORITY = NOT GRANTED BY N4-A6**

This record establishes governance and contract specification authority only. It does **not** authorize:

1. Implementation, refactoring, or runtime wiring of any kind.
2. Modifying `renorm()` or any sector engine.
3. Modifying `EngineOutput`, `NormalizedHolding`, `OntologyMapper`, or `ScreeningPopulationGuard`.
4. Creating a Screen evaluator, a ScreenExecution runtime, or a ScreenResult runtime.
5. Implementing `inputHash`, `executionId`, `resultId`, or any canonical serializer or decoder.
6. Changing CSIP, the frozen golden fixtures, or any test.
7. Persistence, storage technology, registry, API, transport, or UI work.
8. Provider integrations, or any NSE/Dhan work.
9. Production, deployment, certification, or acceptance work.
10. Any amendment to N1, N2, N3, N4, N4-SD, the N4 Identifier decision, the frozen `NP12DEF` byte grammar, B0–B5, or N4-A1 through N4-A5.
11. Modifying format `NP12DEF` / `01` in any respect.

**Specification readiness is readiness for a separate implementation-authority gate only.**

### 15.1 Delegation boundary

After a separate explicit implementation-authority decision, the following are mechanical implementation work: buffer management and streaming strategy; strict UTF-8 conversion of already-validated scalar text; writing the specified four-octet unsigned big-endian integers; writing the exact header, availability, framed token, and canonical decimal octets; exact integer arithmetic realizing the specified decimal canonicalization; invoking a standard SHA-256 implementation on exactly the specified octets; and rendering the digest as specified lowercase hexadecimal.

An implementation agent **MUST NOT decide or change**: member identity semantics; the availability vocabulary or its octet values; growth evaluation semantics; numeric admission or equivalence; field order; member order; framing; integer width, signedness, or byte order; header or format-version octets; status token spellings; population representation or binding; digest membership; or message termination. Any genuine conflict with a frozen rule must return to Program Authority rather than be resolved by a serializer.

---

## 16. Production and IPD

| Boundary | Status |
|---|---|
| **Production** | **OUT OF SCOPE.** Zero investigation, zero dependency, zero mutation. |
| **IPD** (`ramkivs/iips-production-market-data`) | **REFERENCE-ONLY.** Not accessed; zero mutations. |

---

## 17. Conflict check

| Check | Result |
|---|---|
| N1 amendment | **NONE** |
| N2 amendment | **NONE** — exactly three screening fields retained |
| N3 amendment | **NONE** — §7 observable growth behaviour preserved exactly by `A6-DR-01` Option C |
| N4 amendment | **NONE** |
| Format `NP12DEF` / `01` reinterpretation or modification | **NONE** — reused unchanged; three new discriminators assigned additively under the grammar's own §9.1 procedure |
| N4-SD modification | **NONE** |
| A3 contradiction | **NONE** — `D-A2-1`…`D-A2-5` specified, never altered |
| A5 contradiction | **NONE** — `A5-D01`…`A5-D09` specified, never altered |
| B0–B5 / N4-A1 baseline rebinding | **NONE** — referenced only |
| Production dependency | **NONE** |
| IPD dependency | **NONE** — reference-only |
| New policy invented beyond the six approved decisions | **NONE** — unresolved items recorded in Section 13 rather than resolved |

---

## 18. Non-actions

This record performs no implementation, creates no runtime contract, executes no Screen, evaluates no member, converts no numeric value, computes no `inputHash`, writes no serializer or decoder, writes no schema, changes no source file, changes no test, changes no fixture, amends no N3 or N4 artifact, modifies no sector engine, does not alter `renorm()`, and does not rebind the N4-A1 baseline. Its only mutation is its own creation and durable publication.

---

## 19. Artifact provenance and publication metadata

| Item | Value |
|---|---|
| Artifact path | `NP-12-N4-A6-CONTRACT-SPECIFICATION.md` |
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative publication ref | `refs/heads/main` |
| Publication baseline commit | `7f492ad5e213f1577b769d4f7959ea1f485c7d01` |
| Publication baseline tree | `71b9dfa985f0fc86b6256274c7995afff553d733` |
| N4-A5 predecessor artifact | `NP-12-N4-A5-AUTHORITY-DECISION-RECORD.md`, blob `0aaffdfaa9fcffb20255666d970ed9d1dad1d68e` |
| N4-A1 immutable bound baseline | commit `f2886a5af43ad8df8676589daef86836039150f5` / tree `46c1a15bbcd1291701484457d1fe9815d8538888` — referenced, not rebound |
| Recording branch | `arena/01a0fd19-iips-review-recovered` |
| Authorized publication route | Pull request from the assigned session branch to `refs/heads/main`; no checkout switch and no direct push to another branch |
| Permitted changed paths | exactly one: this artifact. No runtime, test, fixture, CSIP, N3, N4, IPD, or production path. |
| Effectiveness condition | Authoritative `main` publication **and** independent remote verification of artifact path, blob, commit, tree, and byte content |

**Self-reference rule:** this record does not state its own commit, tree, or blob hash. Those are established by the publication receipt and independent remote verification reported by the gate, and are never fabricated inside the artifact.

**Durability rule:** Arena or local presence alone is **not** completion. Until authoritative remote `main` contains this record and it has been independently verified there, it is a prepared artifact and confers no authority.

---

## 20. Next-gate boundary

Successful durable publication of this specification implies **no** implementation authority.

> **NEXT GATE: NP-12 N4-A8 — Implementation Authority / Readiness Determination Gate**

That gate must independently determine whether this published specification is sufficiently implementation-ready, must address the `A6-IMPL-10` all-13-engine source convergence dependency and its certification impact explicitly, and must obtain an explicit grant of implementation authority from the Program Authority.

**Do not implement directly from N4-A6.**

---

**End of NP-12 N4-A6 contract specification record.**
