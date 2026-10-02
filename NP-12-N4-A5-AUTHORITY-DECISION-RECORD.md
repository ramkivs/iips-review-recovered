# NP-12 N4-A5 — Authority Decision Record

**Record identifier:** `NP-12-N4-A5`
**Record type:** Program Authority governance decision record — contract-gap resolutions, durable publication act
**Workstream:** NP-12 — Governed Screener
**Gate:** N4-A5 — Contract-Gap Resolution Authority Decision Gate
**Program Authority / Signer:** Ramki (Ramakrishnan)
**Title / Role:** Program Authority
**Decision date:** 2026-10-02
**Decision status:** **APPROVED** — all proposed N4-A5 contract-gap resolutions (`A5-D01` through `A5-D09`)
**Approval basis (verbatim):**

> **APPROVED — all proposed N4-A5 contract-gap resolutions.**

**Effectiveness:** This record becomes effective only when published on authoritative IRR `refs/heads/main` and independently verified on the authoritative remote. Prior to that verification it is a prepared governance artifact and confers no authority.
**Implementation authority:** **NOT GRANTED BY N4-A5**
**Scope:** Governance and contract authority only, resolving the contract gaps recorded by N4-A4. No implementation, refactoring, runtime wiring, persistence, production, certification, or acceptance authority is granted.
**Repository:** `ramkivs/iips-review-recovered`
**IPD:** Reference-only; zero mutations
**Production:** OUT OF SCOPE; zero mutations

---

## 1. Gate identity and input basis

This record durably records the authority decisions rendered at:

> **NP-12 N4-A5 — Contract-Gap Resolution Authority Decision Gate**

**Investigation basis:** the completed read-only **NP-12 N4-A4 — Implementation-Readiness / Contract-Convergence Gate**, which returned `NOT READY — CONTRACT GAP(S) REMAIN` with gap register `A4-G01` through `A4-G13`.

**Fixed inputs treated as authoritative and not reopened:** N1, N2, N3, N4, N4-A, N4-SD, N4-A1, N4-A2, N4-A3, N4-B, N4-C, N4 Identifier, N4 Byte Grammar, B0–B5, and the G1–G5 population semantics.

**N4-A4 findings as input (investigation evidence, per gate §3):** `A4-G01` decimal-place definition ambiguity; `A4-G02` live `>6dp` producer values; `A4-G03` missingness information lost by `renorm()`; `A4-G04` undefined/absent `inputHash`; `A4-G05` provenance plumbing; `A4-G06` producer ownership; `A4-G07` Screen member-value source authority; `A4-G08` member-level result state; `A4-G09` ScreenExecution/ScreenResult identity; `A4-G10` `null` growth ambiguity; `A4-G11`–`A4-G13` implementation dependencies and the typed runtime breach.

**N3 relationship:** N3 §7 remains authoritative exactly as recorded (blob `c2402d36b7610cb4ce52abf1d071d3d46f136f62`). No N3 amendment is made or authorized by this record. The obsolete premise of an internal N3 contradiction is **not** reproduced here.

---

## 2. Authority holder and approval statement

**Authority holder:** Ramki (Ramakrishnan) — IIPS Program Authority and single owner of the IIPS application.

**Approval statement (verbatim):**

> **APPROVED — all proposed N4-A5 contract-gap resolutions.**

**Authority actually exercised by this act:** recording, and durably publishing, the nine N4-A5 contract-gap resolutions. This act does not infer authority beyond the decisions explicitly approved. Authority to decide does not constitute implementation authority.

---

## 3. `A5-D01` — Canonical Decimal Precision Definition

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Decimal-precision semantics for Screen member-value admission.
**Resolves:** `A4-G01`.

### 3.1 Approved decision (verbatim)

> For Screen member-value admission, decimal precision shall be determined from the **canonical decimal representation supplied by the producer**, not from the exact binary IEEE-754 expansion of a JavaScript `number`.
>
> The Screen contract shall not treat the binary floating-point expansion of `0.1` or equivalent values as the semantic decimal representation.
>
> A member value is considered over-precision only when its canonical decimal representation contains more than six fractional decimal digits.
>
> No exact-binary-expansion interpretation shall be introduced.

### 3.2 Implementation boundary recorded

The later implementation must establish the canonical decimal representation **before** Screen fixed-point conversion. No implementation occurs in N4-A5.

### 3.3 Recorded effect

The Screen boundary no longer depends on an undefined property of a binary double. Over-precision is determined solely from the producer's canonical decimal representation. The exact binary expansion of an IEEE-754 value is **not** a semantic decimal representation for Screen purposes.

---

## 4. `A5-D02` — Over-Precision Producer Values

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Disposition of over-precision producer values at Screen admission.
**Resolves:** `A4-G02`.

### 4.1 Approved decision (verbatim)

> The Screen boundary shall **not silently round** or implicitly quantize over-precision values.
>
> Producer-side values intended for Screen admission must conform to the approved ≤6-decimal representation before admission.
>
> A producer value that cannot be represented within the approved member-value precision contract shall fail closed at member admission.
>
> The existing D-A2-2 rule remains intact:
>
> * no silent rounding;
> * no implicit quantization;
> * exact fixed-point comparison;
> * `[0,100]`;
> * finite numeric values only.

### 4.2 Implementation boundary recorded

This decision does **NOT** authorize modifying the existing sector engines in N4-A5. Later implementation must determine the exact producer-side normalization mechanism.

### 4.3 Recorded effect

The existing member-side rule (`D-A2-2`) is affirmed without modification; the resolution places conformance responsibility on the producer side while leaving the Screen boundary's rejection behaviour intact.

---

## 5. `A5-D03` — Producer-Side Growth Availability

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Availability information for growth at the producer/member-value boundary.
**Resolves:** `A4-G03` (recorded by N4-A4 as `CONTRACT GAP — SOURCE MISSINGNESS INFORMATION LOST BEFORE SCREEN BOUNDARY`).

### 5.1 Approved decision (verbatim)

> The Screen contract requires an explicit availability distinction at the producer/member-value boundary.
>
> A producer must not collapse:
>
> * unavailable growth;
>
> and
>
> * legitimate numeric growth `0`
>
> into an indistinguishable bare numeric `0` where the source data is incomplete.
>
> The producer-side contract must preserve sufficient availability information for the Screen boundary to determine whether growth is:
>
> 1. unavailable; or
> 2. a legitimate calculated numeric value.
>
> The availability signal must be established before the Screen boundary.
>
> No reconstruction heuristic may be applied at the Screen boundary.

### 5.2 Implementation boundary recorded

This is a producer-side implementation dependency. N4-A5 does not alter `renorm()` or any sector engine.

### 5.3 Recorded effect

The Screen boundary is forbidden from guessing. Determining unavailable versus legitimate growth shifts to the producer, where the availability condition still exists, and where it must be preserved rather than discarded.

---

## 6. `A5-D04` — `inputHash` Semantics

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Semantic definition of the required `inputHash` provenance field (`D-A2-1`).
**Resolves:** `A4-G04`.

### 6.1 Approved decision (verbatim)

> `inputHash` shall be defined as a **SHA-256 hash of the canonical Screen member evaluation input**.
>
> The canonical preimage must include the deterministic member evaluation content required to reproduce that member's Screen input, including the governed member values and required provenance context.
>
> The hash must use:
>
> * deterministic canonical serialization;
> * deterministic field ordering;
> * explicit representation of numeric values;
> * explicit representation of unavailable state;
> * SHA-256.
>
> `inputHash` is distinct from:
>
> * transport checksum;
> * transportHash;
> * arbitrary DTO checksum;
> * repository hash.
>
> The implementation must define the exact canonical preimage before use.

### 6.2 Implementation boundary recorded

N4-A5 establishes the **semantic authority only**. The exact canonical serialization must be validated during implementation-readiness before runtime implementation.

### 6.3 Recorded effect

`inputHash` is no longer undefined: it is a SHA-256 over a canonical member-input preimage, explicitly not the existing transport checksum mechanism. The precise preimage remains an implementation-readiness specification task, as the decision itself directs.

---

## 7. `A5-D05` — Screen Input Producer Ownership

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Ownership of the transition from `ExecutionResult` to the Screen Member Evaluation Input.
**Resolves:** `A4-G06`.

### 7.1 Approved decision (verbatim)

> A dedicated **Screen-input composition boundary** shall own:
>
> `ExecutionResult → Screen Member Evaluation Input`
>
> That boundary owns:
>
> * member-value composition;
> * provenance composition;
> * numeric admission;
> * availability-state preservation;
> * Screen-specific input construction.
>
> `ScreeningPopulationGuard` remains responsible for population identity/membership semantics and shall not become the general producer transformation owner.

### 7.2 Ownership boundary recorded

Sector engines remain owners of their own engine calculations. The Screen-input composition boundary becomes the owner of the transition into the governed Screen input contract. No implementation or component naming is authorized by this decision.

### 7.3 Recorded effect

The previously unowned transformation gains a designated owner at governance level, without selecting an implementation, a file, or a component name.

---

## 8. `A5-D06` — Screen Member-Value Source Authority

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Authoritative source of the admitted member values `conviction`, `quality`, `growth`.
**Resolves:** `A4-G07`.

### 8.1 Approved decision (verbatim)

> Screen-admitted `conviction`, `quality`, and `growth` values must originate from the **authoritative runtime producer path**.
>
> Frozen CSIP golden fixtures shall remain:
>
> * test/reference evidence;
> * certification/reference evidence where already applicable;
>
> but shall not be treated as the authoritative production/runtime source of Screen member values.
>
> The Screen contract must not combine a live composite with fixture-derived quality/growth as an implicit authoritative member-value source.
>
> The exact runtime producer composition must be established during implementation-readiness.

### 8.2 Important exclusion recorded

This decision does not modify the existing CSIP fixtures or existing tests.

### 8.3 Recorded effect

The mixed-source pattern recorded by N4-A4 (live `composite` combined with fixture-derived `quality`/`growth` in the only in-repo `EngineOutput[]` producer) is no longer admissible as an authoritative Screen member-value source. Fixtures remain valid as test and certification reference evidence.

---

## 9. `A5-D07` — Null Growth

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Interpretation of `growth = null`.
**Resolves:** `A4-G10`.

### 9.1 Approved decision (verbatim)

> `growth = null` shall be interpreted as **unavailable growth**, not as an invalid member.
>
> Therefore:
>
> `null growth → unavailable-growth state`
>
> and follows D-A2-3.
>
> It does not enter the generic invalid-member path of D-A2-4.
>
> By contrast:
>
> * missing conviction → invalid member;
> * missing quality → invalid member.
>
> Unavailable growth fails all growth predicates according to D-A2-3.
>
> Healthcare's absent growth pillar therefore follows the unavailable-growth semantics.

### 9.2 Reconciliation recorded

`D-A2-4` already carves growth out of the generic invalid-member path (its missing-value clause reads: missing `growth` → handled by `D-A2-3`), and `D-A2-3` already states that `undefined`, `null`, and an absent growth pillar normalize to the governed unavailable-growth state. `A5-D07` applies and confirms that carve-out for the `null` case; it does **not** contradict `D-A2-4`, which continues to govern `conviction` and `quality` without change.

### 9.3 Recorded effect

`growth = null` is never an invalid member. Healthcare's structurally absent growth pillar follows the unavailable-growth path.

---

## 10. `A5-D08` — Member-Level Invalid Result

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Deterministic representation of an invalid member within a structurally valid execution.
**Resolves:** `A4-G08`.

### 10.1 Approved decision (verbatim)

> An invalid member shall receive a deterministic **member-level validation status/error**.
>
> The invalid member:
>
> * does not silently participate;
> * does not match Screen predicates;
> * does not cause an otherwise structurally valid Screen execution to fail;
> * is represented explicitly in the Screen result/error model.
>
> The overall execution fails only for structural/execution-level invalidity, including malformed Screen input or malformed execution contract.
>
> The implementation must define the exact result representation and matched-count semantics.

### 10.2 Recorded effect

Member-scoped fail-closed behaviour (`D-A2-4`) now has a required result representation: explicit, deterministic, and non-participating. Execution-level failure remains reserved for structural/execution-level invalidity. The exact representation and matched-count semantics remain implementation-readiness specification tasks, as the decision itself directs.

---

## 11. `A5-D09` — ScreenExecution / ScreenResult Identity

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Deterministic identity for future `ScreenExecution` and `ScreenResult`.
**Resolves:** `A4-G09`.

### 11.1 Approved decision (verbatim)

> ScreenExecution and ScreenResult identities shall use deterministic canonical content and SHA-256.
>
> ### ScreenExecution identity
>
> Must bind the canonical representation of:
>
> * ScreenDefinition identity/version/digest;
> * ScreeningPopulation identity;
> * ordered Screen member inputs;
> * evaluator identity/version.
>
> ### ScreenResult identity
>
> Must bind:
>
> * ScreenExecution identity;
> * canonical ordered result content;
> * result status/content required by the result contract.
>
> The canonical serialization/preimage must be explicitly specified before implementation.
>
> No identity shall depend on:
>
> * object insertion order;
> * caller ordering;
> * runtime memory identity;
> * non-deterministic serialization.

### 11.2 Boundary clarification recorded

This decision governs **execution and result** identity only. It does not alter, and must not be read as altering, the `N4-B`/`N4-C` rule that Screen **Definition** identity remains the `(definitionId, version)` pair and that a Definition digest is an integrity/equality aid rather than Definition identity.

### 11.3 Recorded effect

Execution and result identity are no longer unspecified-in-principle: they are deterministic canonical content under SHA-256, with an explicit prohibition on order-, memory-, and serialization-dependent identities. The canonical preimage remains an implementation-readiness specification task.

---

## 12. Decision relationships verification (gate §13)

### 12.1 Numeric path

> producer canonical decimal representation → `≤6dp` admission → exact fixed-point conversion → Screen evaluation

Consistent: `A5-D01` fixes the source of precision; `A5-D02` fixes conformance responsibility and forbids rounding; `D-A2-2` continues to govern the admission rule and the exact fixed-point comparison domain.

### 12.2 Growth path

> producer source availability → explicit available/unavailable state → unavailable growth → fails every growth predicate

Consistent: `A5-D03` creates the producer-side availability requirement; `A5-D07` fixes the `null` interpretation; `D-A2-3` continues to govern the sentinel, the failure of all five growth predicates, and the prohibition on naive numeric evaluation.

### 12.3 Provenance path

> execution/source provenance → Screen-input composition boundary → canonical member input → `inputHash` → ScreenExecution → ScreenResult

Consistent: `A5-D05` names the owner of the composition boundary; `A5-D04` defines `inputHash`; `A5-D09` binds execution and result identity to canonical content. The `D-A2-1` minimum provenance set (seven items) is unchanged.

### 12.4 Identity path

> canonical member identity `(sector, referenceId)`; canonical ordering `(sector, referenceId)`

Consistent: unchanged from `D-A2-1`, `D-A2-5`, and G1–G5. `A5-D09` restates the prohibition on caller-order dependence.

### 12.5 Failure path

> invalid member → member-level deterministic failure state; malformed Screen contract → execution-level failure

Consistent: `A5-D08` gives the member-level failure its required representation and confines execution-level failure to structural invalidity, exactly matching `D-A2-4`.

### 12.6 Cross-check against `D-A2-1` … `D-A2-5`

| Prior decision | Effect of `A5-D01`–`A5-D09` |
|---|---|
| `D-A2-1` member input + provenance | Extended, not altered: ownership named (`A5-D05`), `inputHash` defined (`A5-D04`), source authority fixed (`A5-D06`). Seven-item minimum provenance unchanged. |
| `D-A2-2` numeric bridge | Extended, not altered: precision source defined (`A5-D01`), conformance responsibility fixed (`A5-D02`). Rejection rule, `[0,100]`, finiteness, `-0` canonicalization, and exact fixed-point equality unchanged. |
| `D-A2-3` growth sentinel | Extended, not altered: producer availability required (`A5-D03`), `null` fixed as unavailable (`A5-D07`). Sentinel rule and five-predicate failure unchanged. |
| `D-A2-4` fail-closed validation | Extended, not altered: result representation required (`A5-D08`); growth carve-out applied (`A5-D07`). Rejection list and scope unchanged. |
| `D-A2-5` execution/result contract | Extended, not altered: identity defined (`A5-D09`); member-level status defined (`A5-D08`). Binding lists and the six additional decisions unchanged. |

**Verification result:** the nine decisions compose coherently under §12.1–§12.6. No decision contradicts `D-A2-1` through `D-A2-5`, and none requires reopening a closed gate.

---

## 13. Residual gap test (gate §14)

Classification of every `A4-*` finding after this record.

| Finding | Status after N4-A5 | Classification |
|---|---|---|
| `A4-G01` decimal-place definition | Resolved by `A5-D01` (precision from the producer's canonical decimal representation; no binary-expansion interpretation) | **GOVERNANCE — RESOLVED** |
| `A4-G02` live `>6dp` producer values | Resolved at governance level by `A5-D02` (producer conformance; fail-closed at admission; no rounding) | **GOVERNANCE — RESOLVED**, with a producer-side implementation dependency |
| `A4-G03` missingness lost before the boundary | Resolved at governance level by `A5-D03` (explicit availability distinction at the producer/member-value boundary; no reconstruction heuristic) | **GOVERNANCE — RESOLVED**, with a producer-side implementation dependency |
| `A4-G04` `inputHash` absent/undefined | Resolved at governance level by `A5-D04` (SHA-256 over canonical member input; distinct from transport checksum) | **GOVERNANCE — RESOLVED**, with a specification dependency |
| `A4-G05` provenance plumbing | Not a governance matter: the required provenance items already exist (`snapshotId`, `evidenceId`, `calibrationVersion`, engine identity/version, population identity) or are required by `A5-D04` | **IMPLEMENTATION / PLUMBING DEPENDENCY** |
| `A4-G06` producer ownership | Resolved by `A5-D05` (Screen-input composition boundary owns the transition) | **GOVERNANCE — RESOLVED** |
| `A4-G07` member-value source authority | Resolved by `A5-D06` (runtime producer path is authoritative; fixtures are test/certification evidence only) | **GOVERNANCE — RESOLVED**, with a runtime-producer specification dependency |
| `A4-G08` member-level result state | Resolved by `A5-D08` (deterministic member-level validation status/error; execution fails only structurally) | **GOVERNANCE — RESOLVED**, with a representation dependency |
| `A4-G09` execution/result identity | Resolved by `A5-D09` (canonical content + SHA-256; no order/memory-dependent identity) | **GOVERNANCE — RESOLVED**, with a preimage specification dependency |
| `A4-G10` `null` growth ambiguity | Resolved by `A5-D07` (`null` growth → unavailable-growth state) | **GOVERNANCE — RESOLVED** |
| `A4-G11` no member→`q` conversion | Implementation work under the approved contract | **IMPLEMENTATION TASK** |
| `A4-G12` no result-level status structure | Implementation work under the approved contract (`A5-D08`, `D-A2-5`) | **IMPLEMENTATION TASK** |
| `A4-G13` typed `EngineOutput` runtime breach (`null` supplied where `number` is declared) | Carried into the producer/runtime producer composition that `A5-D06` requires to be established during implementation-readiness; the semantic resolution of the `null` case is fixed by `A5-D07` | **IMPLEMENTATION DEPENDENCY** (semantics resolved) |

**Residual governance gaps:** **NONE.** No authority-level contradiction remains after `A5-D01`–`A5-D09`; no additional authority decision is discovered by this gate.

**Residual matters mapped to later gates (not governance gaps at this gate):**

1. **Canonicalization specifications** — the exact canonical decimal representation (`A5-D01`), the exact `inputHash` preimage (`A5-D04`), and the exact execution/result identity preimages (`A5-D09`) are explicitly delegated by the decisions themselves to implementation-readiness specification, and must be pinned there before any implementation.
2. **Producer-side changes** — conforming producer values (`A5-D02`), the availability signal (`A5-D03`), and the authoritative runtime producer composition (`A5-D06`) imply producer-side work that N4-A5 does **not** authorize and that the 13 sector engines' certified/frozen status makes consequential. Any such change requires its own bounded implementation authorization, and the certification impact must be addressed explicitly at that time rather than assumed.
3. **Result representation** — the exact member-level result representation and matched-count semantics (`A5-D08`) are delegated to implementation-readiness specification.

None of items 1–3 prevents contract interpretation, and none is converted into an implementation requirement by this record.

---

## 14. Scope of this record

This record establishes governance and contract authority for the resolution of the N4-A4 contract gaps:

1. canonical decimal precision definition for member admission (`A5-D01`);
2. disposition of over-precision producer values (`A5-D02`);
3. producer-side growth availability (`A5-D03`);
4. `inputHash` semantics (`A5-D04`);
5. Screen-input producer ownership (`A5-D05`);
6. Screen member-value source authority (`A5-D06`);
7. `null` growth interpretation (`A5-D07`);
8. member-level invalid result (`A5-D08`);
9. ScreenExecution / ScreenResult identity (`A5-D09`).

This record is additive. It does not rewrite, amend, supersede, or reinterpret any existing governance artifact.

---

## 15. Explicit exclusions

This record does **not** authorize:

1. **Implementation authority of any kind** — no implementation, refactoring, or runtime wiring.
2. Modifying `renorm()` or any sector engine.
3. Modifying `EngineOutput`, `NormalizedHolding`, `OntologyMapper`, or `ScreeningPopulationGuard`.
4. Creating a `ScreenEvaluator`, `ScreenExecution` runtime, or `ScreenResult` runtime.
5. Implementing `inputHash` or any canonical serialization.
6. Changing CSIP, the frozen golden fixtures, or any test.
7. Persistence, storage technology, registry, API, transport, or UI work.
8. Production, deployment, certification, or acceptance work.
9. Any amendment to N3 or to any N4 / N4-A record, or any reopening of N1–N4, N4-SD, N4-A1, N4-A2, N4-A3, N4-B, N4-C, the N4 Identifier decision, the N4 Byte Grammar, or B0–B5.
10. Changes to G1–G5 population semantics, sector normalization, uniqueness, duplicate rejection, canonical member ordering, or population identity.
11. New screening fields, new operators, or any change to the flat-AND Boolean model.
12. Treating `inputHash` as, or substituting it for, the existing transport checksum or `transportHash`.
13. Treating frozen golden fixtures as the authoritative runtime source of Screen member values.

---

## 16. Implementation-authority status

> **IMPLEMENTATION AUTHORITY = NOT GRANTED BY N4-A5**

These decisions establish governance and contract authority only. They do **not** authorize implementation, refactoring, runtime wiring, persistence, production, certification, or acceptance.

Implementation may be considered only through a separately authorized gate, after the decisions in this record have been converted into one internally consistent implementation specification.

---

## 17. Dependencies and follow-on work

1. **Next gate (sequence, not authority):** **NP-12 N4-A6 — Contract Specification / Implementation-Readiness Verification Gate**, which must first convert these authority decisions into an internally consistent implementation specification. N4-A6 must still not implement unless separate implementation authority is granted.
2. **Specification dependency:** exact canonical decimal representation (`A5-D01`); exact `inputHash` preimage (`A5-D04`); exact execution/result identity preimages (`A5-D09`); exact member-level result and matched-count representation (`A5-D08`).
3. **Producer dependency:** producer-side value conformance (`A5-D02`), producer-side availability preservation (`A5-D03`), and the authoritative runtime producer composition (`A5-D06`). N4-A5 authorizes none of these changes; they require separate bounded implementation authority, and their effect on the certified/frozen status of the affected engines must be addressed explicitly at that time.
4. **Provenance plumbing dependency:** per-member binding of the `D-A2-1` minimum provenance set across the `ExecutionResult` boundary (`A4-G05`).
5. **Implementation tasks:** member-value → `q` conversion and the evaluator/execution/result runtime (`A4-G11`, `A4-G12`).
6. **No N3 amendment is required or authorized** by this record.
7. **Publication dependency:** this record is effective only upon authoritative `main` publication and independent remote verification (Section 18).

---

## 18. Baseline identity and durability metadata

### 18.1 Authority and baseline

| Item | Value |
|---|---|
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative publication ref | `refs/heads/main` |
| N4-A1 immutable bound baseline commit | `f2886a5af43ad8df8676589daef86836039150f5` |
| N4-A1 immutable bound baseline tree | `46c1a15bbcd1291701484457d1fe9815d8538888` |
| N4-A3 durable publication | `NP-12-N4-A3-AUTHORITY-DECISION-RECORD.md`, blob `0b305b19df4dab26f78c9698185d5c74a57731d9`, merge commit `bcab34f4cca98ed3f0edcd76c5b7c3996bdb9a5e` |
| Preceding investigative gate | N4-A4 (`NOT READY — CONTRACT GAP(S) REMAIN`) |

**Moving-ref rule:** the N4-A1 baseline remains the exact commit/tree recorded above even as `main` advances. This record does not rebind it, and no automatic rebinding is created.

### 18.2 Durability metadata

| Item | Value |
|---|---|
| Artifact path | `NP-12-N4-A5-AUTHORITY-DECISION-RECORD.md` |
| Preparation baseline (session branch parent) | `8bb84d5de090a69ccd78871ba603c9835fd70471` / tree `2410ac816831f2b571bcfa8a98821f3a4f0bd8e7` |
| Recording branch | `arena/01a0fc40-iips-review-recovered` |
| Authorized publication route | Pull request from the assigned session branch to `refs/heads/main`; no checkout switch and no direct push to another branch |
| Effectiveness condition | Authoritative `main` publication **and** independent remote verification of artifact path, blob, commit, and reachability |
| Verified publication commit | Recorded and reported by the gate after publication (gate artifact inventory) |
| Verified resulting remote `main` | Recorded and reported by the gate after publication (gate artifact inventory) |

### 18.3 Verification obligations

Upon publication the following must be true before this record is reported durably effective:

1. the artifact exists on authoritative remote `main` and its content matches this record;
2. the publishing commit is reachable from authoritative `origin/main`;
3. the artifact path, blob hash, publication commit, and resulting tree are verified remotely;
4. the publishing commit contains **only** this governance artifact — no runtime, test, N3, N4, CSIP, fixture, IPD, or production change;
5. the authoritative checkout worktree is clean.

If any verification fails, this record is only a draft or transfer artifact and confers **no authority**.

---

## 19. Non-actions

This record performs no implementation, creates no runtime contract, executes no Screen, evaluates no member, converts no numeric value, computes no `inputHash`, writes no schema, changes no source file, changes no test, changes no fixture, amends no N3 or N4 artifact, and does not rebind the N4-A1 baseline. Its only mutation is its own creation and durable publication.

---

**End of NP-12 N4-A5 authority decision record.**
