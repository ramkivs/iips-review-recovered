# NP-12 N4-A3 — Authority Decision Record

**Record identifier:** `NP-12-N4-A3`
**Record type:** Program Authority governance decision record — durable publication act
**Workstream:** NP-12 — Governed Screener
**Gate:** N4-A3 — `EngineOutput → Screen` Authority Decision Gate
**Program Authority / Signer:** Ramki (Ramakrishnan)
**Title / Role:** Program Authority
**Decision date:** 2026-10-02
**Decision status:** **APPROVED** — all five decisions `D-A2-1` through `D-A2-5`, including the `N4-A3-C1` acknowledgement
**Approval basis:** The explicit Program Authority approval supplied for the N4-A3 durable authority decision publication task:

> **“APPROVED — all proposed N4-A3 decisions D-A2-1 through D-A2-5, including N4-A3-C1 acknowledgement.”**

**Effectiveness:** **This record becomes effective only when published on authoritative IRR `refs/heads/main` and independently verified on the authoritative remote.** Prior to that verification it is a prepared governance artifact and confers no authority.
**Implementation authority:** **NOT GRANTED BY N4-A3**
**Scope:** Governance and contract authority only. No implementation, refactoring, runtime wiring, persistence, production, certification, or acceptance authority is granted.
**Repository:** `ramkivs/iips-review-recovered`
**IPD:** Reference-only; zero mutations
**Production:** OUT OF SCOPE; zero mutations

---

## 1. Gate identity

This record durably publishes the authority decisions rendered at:

> **NP-12 N4-A3 — `EngineOutput → Screen` Authority Decision Gate**

N4-A3 followed the completed read-only investigation **NP-12 N4-A2 — `EngineOutput → Screen` Member-Value, Normalization & Evaluation-Boundary Authority Determination** (`COMPLETE — GAPS IDENTIFIED`; `A2-G01` through `A2-G16`; authority decisions `D-A2-1` through `D-A2-5` isolated), which in turn followed **NP-12 N4-A1 — CSIP Ontology Applicability & Producer-Boundary Authority Determination** (`L7-G01` through `L7-G15`).

This record records decisions. It does not re-investigate, reopen, reinterpret, or extend N4-A1, N4-A2, N4-A, N4, or N3.

---

## 2. Authority holder and approval statement

**Authority holder:** Ramki (Ramakrishnan) — IIPS Program Authority and single owner of the IIPS application.

**Approval statement (verbatim):**

> **APPROVED — all proposed N4-A3 decisions D-A2-1 through D-A2-5, including N4-A3-C1 acknowledgement.**

**Authority actually exercised by this act:** recording, and durably publishing, the five approved N4-A3 decisions and the `N4-A3-C1` correction acknowledgement. This act does not infer authority beyond the decisions explicitly approved. Authority to decide does not constitute implementation authority.

---

## 3. `N4-A3-C1` — Correction acknowledgement

**Status:** `ACKNOWLEDGED — PRIOR PREMISE CORRECTED; NO N3 AMENDMENT`

1. The previously reported claim that N3 contained an internal semantic contradiction concerning `growth = 0` **is not supported by the bound baseline**.
2. The authoritative N3 text — `NP-12-SCREENING-CRITERIA-OPERATOR-BOOLEAN-GOVERNANCE.md` §7, blob `c2402d36b7610cb4ce52abf1d071d3d46f136f62` — is **internally consistent**.
3. The statement:

> “Strict numeric evaluation against `0`, with no special null/exclusion branch.”

**is not present in the bound baseline.** It was reported by N4-A2 as a conflicting clause; exhaustive search of the bound baseline tree, of the sixty most recent commits reachable from all local refs, and of full reachable history produced zero matches.

4. `N4-A3-C1` is therefore acknowledged as a **correction of the prior premise**, **not** an amendment to N3.
5. **No N3 amendment is authorized by this decision.** N3 remains unmodified and authoritative as published.

---

## 4. `D-A2-1` — Screen Member Input + Provenance Carrier

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** The N4 Screen evaluation boundary (member input structure, member identity binding, admitted member values, and the required provenance carrier).

### 4.1 Approved decision (verbatim)

> Future Screen evaluation shall consume a **dedicated Screen Member Evaluation Input** derived from the validated population member and the relevant EngineOutput values.
>
> The authoritative member identity is:
>
> `(canonical sector, referenceId)`
>
> `EngineOutput.companyId` shall map to `referenceId` **verbatim after G1–G5 validation**, with `(sector, referenceId)` remaining the authoritative Screen member key.
>
> Screen admission is limited to:
>
> * `conviction`
> * `quality`
> * `growth`
>
> Provenance shall be carried:
>
> * per evaluated member; and
> * at population/execution level.
>
> Minimum provenance:
>
> * `snapshotId`
> * `evidenceId`
> * `timestamp`
> * `inputHash`
> * `calibrationVersion`
> * engine identity/version
> * population identity

### 4.2 Recorded scope

1. The evaluation input structure is a **dedicated Screen Member Evaluation Input**, distinct from `NormalizedHolding` and from `EngineOutput`.
2. `(canonical sector, referenceId)` is the authoritative Screen member key, where `canonical sector` is the G1-normalized certified sector name and `referenceId` is the opaque identifier.
3. `EngineOutput.companyId` maps to `referenceId` **verbatim after G1–G5 validation** — no trimming, case-folding, aliasing, or reinterpretation beyond the already-governed G1–G5 normalization.
4. Admitted Screen member values are exactly `conviction`, `quality`, and `growth`. No additional fields are admitted by this decision.
5. Provenance is carried **per evaluated member** and **at population/execution level**.
6. The **minimum** provenance set is the seven items enumerated above: `snapshotId`, `evidenceId`, `timestamp`, `inputHash`, `calibrationVersion`, engine identity/version, and population identity.

### 4.3 Non-implementation

This decision is **not implemented in N4-A3**. It establishes governance and contract authority only.

---

## 5. `D-A2-2` — Numeric Quantization + Fixed-Point Comparison Bridge

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Member-value admission and the bridge from member values into the N4-A fixed-point comparison domain.

### 5.1 Approved decision (verbatim)

> Member values entering Screen evaluation shall conform to the N4-A fixed-point comparison domain.
>
> **Values with more than six decimal places shall be rejected.**
>
> There shall be **no silent rounding or implicit quantization** of over-precision member values.
>
> Accepted values shall be converted exactly to:
>
> `q = 1,000,000 × x`
>
> for comparison against the N4-A canonical fixed-point operand.
>
> The boundary shall reject:
>
> * non-finite values;
> * NaN;
> * positive infinity;
> * negative infinity;
> * values outside `[0,100]`;
> * values exceeding six decimal places.
>
> `-0` shall be canonicalized to zero.
>
> The comparison representation shall use exact canonical fixed-point equality.
>
> The same numeric admission rule applies uniformly to:
>
> * conviction;
> * quality;
> * growth.
>
> The N4-A operand rule is **not** being implicitly extended to member values; this decision explicitly establishes the member-side bridge.

### 5.2 Recorded scope

1. Member values with **more than six decimal places are rejected**. Silent rounding and implicit quantization of over-precision member values are **prohibited**.
2. Accepted values convert **exactly** to `q = 1,000,000 × x` for comparison against the N4-A canonical fixed-point operand.
3. The member-value boundary rejects: non-finite values; `NaN`; positive infinity; negative infinity; values outside `[0,100]`; values exceeding six decimal places.
4. `-0` canonicalizes to zero.
5. Comparison uses **exact canonical fixed-point equality**.
6. The same numeric admission rule applies uniformly to `conviction`, `quality`, and `growth`.
7. This decision **explicitly establishes the member-side bridge**. The N4-A operand rule is not treated as having implicitly extended itself to member values.

### 5.3 Non-implementation

This decision is **not implemented in N4-A3**. No numeric conversion, quantization, or comparison code is written, and the existing unrounded `renorm()` pillar behavior of the sector engines is unchanged by this record.

---

## 6. `D-A2-3` — Growth Sentinel + Missing-Growth Semantics

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** Growth evaluation, the unavailable-growth sentinel, and member-side missing-growth normalization.

### 6.1 Approved decision (verbatim)

> The existing N3 governance is acknowledged as authoritative:
>
> `growth = 0` is the approved unavailable sentinel.
>
> An unavailable growth value shall **fail every growth predicate**:
>
> * `lt`
> * `lte`
> * `gt`
> * `gte`
> * `eq`
>
> The unavailable sentinel shall therefore NOT be subjected to naive numeric predicate evaluation.
>
> `undefined`, `null`, and an absent growth pillar shall normalize to the governed unavailable-growth state.
>
> A sector-generated `renorm()` result of `0` shall **not automatically be classified as unavailable solely because its numeric value is zero**.
>
> Its classification shall depend on the upstream missingness condition:
>
> * incomplete/missing source components → unavailable;
> * genuine calculated zero → legitimate numeric zero.
>
> Healthcare's absent growth pillar maps to the same governed unavailable-growth state.

### 6.2 Recorded scope

1. N3 §7 (blob `c2402d36b7610cb4ce52abf1d071d3d46f136f62`) is **acknowledged as authoritative and unchanged**.
2. `growth = 0` is the approved unavailable sentinel.
3. An unavailable growth value **fails every growth predicate** — `lt`, `lte`, `gt`, `gte`, and `eq` — and is **not** subjected to naive numeric predicate evaluation.
4. `undefined`, `null`, and an absent growth pillar **normalize to the governed unavailable-growth state**.
5. A sector-generated `renorm()` result of `0` is **not automatically unavailable solely because its numeric value is zero**. Classification depends on the upstream missingness condition: incomplete or missing source components → unavailable; genuine calculated zero → legitimate numeric zero.
6. **Healthcare's** absent growth pillar maps to the same governed unavailable-growth state.
7. No N3 amendment is made or authorized by this decision. `N4-A3-C1` (Section 3) governs the correction of the prior premise.

### 6.3 Non-implementation

This decision is **not implemented in N4-A3**. No evaluator, sentinel branch, normalization path, or producer change is written.

---

## 7. `D-A2-4` — Fail-Closed Member-Value Validation

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** The validation boundary and failure scope for Screen member values.

### 7.1 Approved decision (verbatim)

> Screen member-value validation shall be **member-scoped fail-closed**.
>
> An invalid member shall not silently participate in evaluation.
>
> The affected member shall fail closed with deterministic validation/error state.
>
> A structurally invalid Screen input or malformed execution contract shall fail the **entire Screen execution**.
>
> The member-value boundary shall reject:
>
> * non-number;
> * `undefined`;
> * `null`;
> * NaN;
> * positive infinity;
> * negative infinity;
> * `<0`;
> * `>100`;
> * `-0` shall be canonicalized to zero;
> * excess precision beyond six decimal places.
>
> Missing:
>
> * conviction → invalid member;
> * quality → invalid member;
> * growth → handled by D-A2-3.
>
> The relationship to N3 D3 is preserved:
>
> > Only finite numeric values are valid. Invalid values fail closed.
>
> D-A2-4 establishes the scope of that failure at the Screen member boundary.

### 7.2 Recorded scope

1. **Failure scope is member-scoped fail-closed.** An invalid member does not silently participate in evaluation; the affected member fails closed with a deterministic validation/error state.
2. **Structural failure scope is execution-scoped.** A structurally invalid Screen input or a malformed execution contract fails the **entire Screen execution**.
3. The member-value boundary rejects: non-number; `undefined`; `null`; `NaN`; positive infinity; negative infinity; `<0`; `>100`; excess precision beyond six decimal places.
4. `-0` canonicalizes to zero (consistent with `D-A2-2`).
5. Missing `conviction` → invalid member. Missing `quality` → invalid member. Missing `growth` → handled by `D-A2-3`.
6. The N3 D3 rule — “Only finite numeric values are valid. Invalid values fail closed.” — is **preserved**, and `D-A2-4` establishes the **scope** of that failure at the Screen member boundary.

### 7.3 Non-implementation

This decision is **not implemented in N4-A3**. No validation code, error taxonomy, or result contract is written.

---

## 8. `D-A2-5` — ScreenExecution / ScreenResult Contract Authority

**Status:** `APPROVED — AUTHORITY DECISION RECORDED`
**Scope:** The minimum authoritative contract for future `ScreenExecution` and `ScreenResult`.

### 8.1 Approved decision (verbatim)

> Future implementation shall establish explicit `ScreenExecution` and `ScreenResult` contracts.
>
> ### ScreenExecution must bind
>
> * execution identity;
> * ScreenDefinition identity/version/digest;
> * ScreeningPopulation identity;
> * member input binding;
> * provenance;
> * execution timestamp;
> * evaluator/version identity;
> * deterministic ordering;
> * failure status.
>
> ### ScreenResult must bind
>
> * ScreenExecution reference;
> * matched member identity;
> * canonical member ordering;
> * total population count;
> * matched count;
> * result status;
> * result identity/digest where required;
> * provenance/reference chain.
>
> ### Additional decisions
>
> 1. Results shall use canonical `(sector, referenceId)` ordering.
> 2. Evaluation shall cover exactly the bound ScreeningPopulation.
> 3. Missing or extra members shall fail closed.
> 4. Contradictory predicates produce an empty result.
> 5. Empty predicate collection retains the governed match-all semantics.
> 6. Invalid member values follow D-A2-4.

### 8.2 Recorded scope

1. `ScreenExecution` **must bind**: execution identity; ScreenDefinition identity/version/digest; ScreeningPopulation identity; member input binding; provenance; execution timestamp; evaluator/version identity; deterministic ordering; failure status.
2. `ScreenResult` **must bind**: ScreenExecution reference; matched member identity; canonical member ordering; total population count; matched count; result status; result identity/digest where required; provenance/reference chain.
3. Results use **canonical `(sector, referenceId)` ordering**.
4. Evaluation covers **exactly** the bound `ScreeningPopulation`.
5. **Missing or extra members fail closed.**
6. **Contradictory predicates** produce an **empty result** (consistent with the already-governed N4-D8 semantics).
7. **Empty predicate collection** retains the governed **match-all** semantics (consistent with the already-governed N4-B3 semantics).
8. Invalid member values follow `D-A2-4`.

### 8.3 Non-implementation

This decision is **not implemented in N4-A3**. No classes, schemas, APIs, persistence, or transport contracts are created.

---

## 9. Scope of this record

This record establishes **governance and contract authority** for the `EngineOutput → Screen` boundary:

1. the authoritative Screen member evaluation input, member identity binding, admitted member values, and provenance carrier (`D-A2-1`);
2. the member-side numeric admission rule and exact fixed-point comparison bridge (`D-A2-2`);
3. growth sentinel and missing-growth normalization semantics (`D-A2-3`);
4. member-value validation boundary and failure scope (`D-A2-4`);
5. the minimum `ScreenExecution` / `ScreenResult` contract and its additional decisions (`D-A2-5`).

This record is additive. It does not rewrite, amend, supersede, or reinterpret any existing governance artifact.

---

## 10. Explicit exclusions

This record does **not** authorize:

1. **Implementation authority of any kind** — no implementation, refactoring, or runtime wiring.
2. Modification of `EngineOutput`, `NormalizedHolding`, `OntologyMapper`, `ScreeningPopulationGuard`, `ScreenDefinition`, `CrossSectorEngine`, or any sector engine.
3. Any numeric conversion, quantization, validation, or comparison implementation.
4. Implementation of a `ScreenEvaluator`, `ScreenExecution`, or `ScreenResult`.
5. Persistence, storage technology, registry, API, transport, or UI work.
6. Production, deployment, certification, or acceptance work.
7. CSIP changes or CSIP ontology extension.
8. Any amendment to N3 or to any N4 / N4-A / N4-B / N4-C record, including removal of the disproven phrase identified in `N4-A3-C1`.
9. Reopening `N4-A`, `N4-A1`, `N4-A2`, or `N4-SD`, or any closed N1, N2, N3, N4, N4-B, N4-C, N4 Identifier, N4 Byte Grammar, or B0–B5 decision.
10. Changes to G1–G5 population semantics, sector normalization, uniqueness, duplicate rejection, canonical membership ordering, or population identity.
11. New screening fields, new operators, or any change to the flat-AND Boolean model.
12. A second competing N3 decision record.

A future N3 amendment is required **only** if a genuinely new N3 policy decision is subsequently authorized. No such authorization exists in this record.

---

## 11. Implementation-authority status

> **IMPLEMENTATION AUTHORITY = NOT GRANTED BY N4-A3**

These decisions establish governance and contract authority only. They do **not** authorize implementation, refactoring, runtime wiring, persistence, production, certification, or acceptance.

Implementation may be considered only through a separately authorized gate, after the contracts established here are confirmed to be translatable into one coherent executable contract.

---

## 12. Dependencies and follow-on work

1. **Next gate (sequence, not authority):** **NP-12 N4-A4 — Implementation-Readiness / Contract-Convergence Gate**, which must first verify that the approved authority decisions can be translated into one coherent executable contract without reopening closed governance. This record does not authorize that gate's work.
2. **Producer-side missingness evidence dependency (from `D-A2-3`):** distinguishing “incomplete/missing source components” from a “genuine calculated zero” requires upstream missingness information that **does not currently exist** at the `EngineOutput` boundary (N4-A1 `L7-G01`, `L7-G02`: `EngineOutput` is an unvalidated interface with zero provenance fields; `ONTOLOGY_METADATA` is ignored by `OntologyMapper.map()`). This is a recorded dependency for the convergence gate, not a new decision.
3. **Provenance availability dependency (from `D-A2-1`):** the seven required minimum provenance items are currently not carried across the `EngineOutput` boundary. This is a recorded dependency, not a new decision.
4. **Over-precision reality dependency (from `D-A2-2`):** five of the thirteen certified sector engines currently emit unrounded pillar values exceeding six decimal places via `renorm()` (Industrials, Technology, Telecom, Auto, Materials). Under `D-A2-2` such member values are **rejected**; the upstream reconciliation is a dependency for the convergence gate, not a new decision.
5. **No N3 amendment is required or authorized** by `N4-A3-C1` or by any decision in this record.
6. **Publication dependency:** this record is effective only upon authoritative `main` publication and independent remote verification (Section 13).

---

## 13. Baseline identity and durability metadata

### 13.1 Authority and baseline

| Item | Value |
|---|---|
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative publication ref | `refs/heads/main` |
| N4-A1 immutable bound baseline commit | `f2886a5af43ad8df8676589daef86836039150f5` |
| N4-A1 immutable bound baseline tree | `46c1a15bbcd1291701484457d1fe9815d8538888` |
| N4-A2 investigation basis | Completed read-only N4-A2 report (`A2-G01`–`A2-G16`, `D-A2-1`–`D-A2-5`) |
| Contextual remote `main` at preparation | `6a535ed7b21ef6710f0ca4b074557489ba896e85` (NP-13-only additions; **does not** rebind the N4-A1 baseline) |

**Moving-ref rule:** the N4-A1 baseline remains the exact commit/tree recorded above even as `main` advances. This record does not rebind it, and no automatic rebinding is created.

### 13.2 Durability metadata

| Item | Value |
|---|---|
| Artifact path | `NP-12-N4-A3-AUTHORITY-DECISION-RECORD.md` |
| Preparation baseline (session branch parent) | `3f84140b415b4c1dd7ca5c41849d6b566e471c52` / tree `52ece401dc59cfc4d13f1ec234a9651ecac713d2` |
| Recording branch | `arena/01a0fc40-iips-review-recovered` |
| Authorized publication route | Pull request from the assigned session branch to `refs/heads/main`; no checkout switch and no direct push to another branch |
| Effectiveness condition | Authoritative `main` publication **and** independent remote verification of artifact path, blob, commit, and reachability |
| Verified publication commit | Recorded and reported by the gate after publication (gate artifact inventory) |
| Verified resulting remote `main` | Recorded and reported by the gate after publication (gate artifact inventory) |

### 13.3 Verification obligations

Upon publication the following must be true before this record is reported durably effective:

1. the artifact exists on authoritative remote `main` and its content matches this record;
2. the publishing commit is reachable from authoritative `origin/main`;
3. the artifact path, blob hash, publication commit, and resulting tree are verified remotely;
4. the publishing commit contains **only** this governance artifact — no runtime, test, N3, N4, IPD, or production change;
5. the authoritative checkout worktree is clean.

If any verification fails, this record is only a draft or transfer artifact and confers **no authority**.

---

## 14. Non-actions

This record performs no implementation, creates no runtime contracts, executes no Screen, evaluates no member, converts no numeric value, writes no schema, changes no source file, changes no test, amends no N3/N4 artifact, and does not rebind the N4-A1 baseline. Its only mutation is its own creation and durable publication.

---

**End of NP-12 N4-A3 authority decision record.**
