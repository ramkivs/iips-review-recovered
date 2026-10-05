# NP-13 — PA-D2-C REALIZATION SEMANTICS & C-1/C-2 DURABILITY RECONCILIATION: GOVERNANCE DECISION

> **Record identifier:** `NP-13-PA-D2-C-REALIZATION-SEMANTICS-DECISION-01`
> **Document type:** `AUTHORITY DECISION` — D2-C durable-publication candidate (workspace draft, **unpublished**)
> **Gate:** **NP-13 D2-C — Realization Semantics & C-1/C-2 Durability Reconciliation** (decision rendering)
> **Decision date (rendering):** 2026-10-04
> **Program Authority:** Ramki (Ramakrishnan)
> **Effective point:** **`2026-10-04T07:42:20Z`** (UTC) — §17
> **Decisions rendered:** **`Act A = A1 — APPROVED`** · **`Act B = B-i — APPROVED`**
> **Repository scope:** IRR — `ramkivs/iips-review-recovered` (authoritative) · IPD — OUT OF SCOPE (not accessed, not modified)
> **Mutation status:** **ZERO** — no commit, push, branch, tag, pull request, or publication
> **Publication status:** **NOT AUTHORIZED / NOT PERFORMED** — §19
> **Durability status:** **NOT DURABLE** — §20
> **Additive character:** Additive only. No predecessor record is amended, reopened, reinterpreted, or superseded.

---

## 1. TITLE / GATE IDENTIFICATION

1.1 **Gate.** This record renders the deliberative output of the **NP-13 D2-C** gate — *Realization Semantics & C-1/C-2 Durability Reconciliation* — as defined at `NP-13-D2-01-DEFINITION-01 §4.5` and allocated at `§5.1` rows **A-7** (realization semantics) and **A-8** (C-1 / C-2 durability convention reconciliation).

1.2 **Gate chain within D2-C** (all within the D2-C gate; no new gate is created):

| Step | Artifact | Status |
|---|---|---|
| (i) | `NP-13-PA-D2-C-REALIZATION-SEMANTICS-INVESTIGATION-01` — read-only investigation | **COMPLETE** (workspace draft, **not durable**) |
| (ii) | `NP-13-PA-D2-C-DECISION-OPTIONS-01` — Act A / Act B option presentation and recommendation | **COMPLETE** (workspace draft, **not durable**) |
| (iii) | **This record** — Program Authority decision rendering | **RENDERED / NOT YET DURABLE** |

1.3 **What this record is.** The explicit, bounded governance decision of the Program Authority adopting (i) realization semantic **A1** with twelve companion conditions, and (ii) reconciliation **B-i**.

1.4 **What this record is NOT.** It is not a publication artifact (no publication authority exists or is exercised — §19); it is not an implementation authorization; it is not a D2 completion act; it is not a D3 act; and it is not durably effective (§20).

---

## 2. AUTHORITY BASIS

2.1 **Program Authority.** Ramki (Ramakrishnan), Program Authority for the IIPS program, is the sole authority competent to render the decisions recorded here. No other principal, agent, process, tool, repository, or mechanical operation participates in, or may be substituted for, that authority.

2.2 **Jurisdictional basis.** These decisions are exercises within **J-1 (Definition)** jurisdiction as established by `NP-13-D0-01 §2.2`, which is subject-matter bounded and requires its own explicit act for every exercise (`§2.3`), and which is confined to the **active non-production** baseline (`§2.4`).

2.3 **Convening and scope authority.**

| Instrument | Content | Status |
|---|---|---|
| `PA-D2-ELIG-01 = A` | D2 declared **ELIGIBLE** | Rendered (`NP-13-PA-D2-ELIGIBILITY-01 §6.1`) |
| `PA-D2-AUTH-01 = A` | Bounded authority **GRANTED** to convene the separately bounded D2-A / D2-B / **D2-C** gates | Rendered (`§6.2`) |
| `PA-D2-ORD-01 = A` | **No mandatory ordering** among D2-A / D2-B / D2-C | Rendered (`§6.3`) |

2.4 **Decision-rendering authority (this gate).** Program Authority explicitly rendered **`Act A = A1`** and **`Act B = B-i`**, authorizing preparation and rendering of this D2-C governance decision record incorporating those decisions and their explicitly stated companion conditions.

2.5 **Authority NOT granted by that rendering (preserved verbatim in effect).** **Publication authority · implementation authority · runtime authority · production authority · certification authority · release authority · D3 authority.** No authority beyond the exact decision-rendering scope is conferred, and none may be inferred from this record's subject matter, length, structure, placement, rendering, or future publication route (`NP-13-GO3B-DECISION-01 §11.1–§11.2` applied by analogy).

2.6 **Corpus discipline preserved.** `NP-13-D1-01 §6.6` remains binding when read with this record: realization semantics were previously **NOT DECIDED** and **no inference** was permitted from acceptance, qualification, parentage, or branch functionality. The semantics adopted here are adopted **by explicit Program Authority act** — not derived, and not inferred. The three principles in the parent investigation that the corpus does not authorize inference remain preserved (§5.4).

---

## 3. SCOPE

3.1 **In scope.** (a) The realization semantic for the governed baseline, under the selected `M1` nature and the durable D2-B binding; (b) the C-1 / C-2 durability-convention reconciliation.

3.2 **Out of scope.** Concrete runtime deployment; provider / security decisions; any implementation of identity, persistence, rendering, or deployment; D3 composition and membership determinations; NP-13 divergence adjudication; any code change; any production activity; any certification or release activity.

3.3 **Non-extension.** This record does not extend the scope of D2-C (`NP-13-D2-01-DEFINITION-01 §4.5` *"Out of scope"*), does not broaden any predecessor's scope, and creates no new jurisdictional subject matter.

---

## 4. D2-A PREREQUISITE

4.1 **D2-A = COMPLETE / DURABLE.** Baseline nature **`M1`** was selected by explicit Program Authority act and durably published.

| Attribute | Verified value |
|---|---|
| Artifact | `docs/integration/NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01.md` |
| Blob on live `origin/main` | `a4f049dd369ff70871f1d2e9f78762ed6300c352` |
| Publication commit | `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` |
| Selected nature | `M1` — single repository / ref baseline nature |

4.2 **Effect on this record.** `M1` is the nature for which §7's realization predicate is stated. This record does **not** reopen, re-decide, reinterpret, or re-derive `M1`.

---

## 5. D2-B PREREQUISITE

5.1 **D2-B = COMPLETE / DURABLE.** The `E-3` binding and initial authoritative evidence designation were rendered and durably published; the `E-3 §6.4` state `DECISION RENDERED — PENDING DURABLE RECORDING` is discharged.

| Attribute | Verified value |
|---|---|
| Artifact | `docs/integration/NP-13-PA-D2-B-REF-BINDING-EVIDENCE-DECISION-01.md` |
| Publication commit | `2e32348fbd0bf7ab5e38f9bed92e63aa25a10322` |
| Remote blob | `dcad0e8d418bd43dc08d92b1ba2b29b116a10831` |
| Byte size | `23193` |
| Remote SHA-256 | `2776d6f68b9097d53e3dd937fa2170557d5bb9ee7fdb076b862c3ff42caa5fa0` |
| Bound repository | `ramkivs/iips-review-recovered` |
| Bound mutable operational ref | `refs/heads/main` |
| Initial authoritative evidence coordinate (primary) | Git root tree `962d7ea322e4ade5cda61c3fc9335de616903daf` |
| Supporting provenance (not primary evidence) | commit `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` |
| Predecessor continuity at that publication | **16 / 16 unchanged** |
| Final worktree | **CLEAN** |

5.2 **Effect on this record.** §7's realization predicate is stated **relative to the D2-B binding**. This record does **not** reopen, re-decide, reinterpret, or re-derive the D2-B selection; it does not re-rank the candidate refs evaluated at D2-B; and it does not convert the preserved implementation-lineage branch into a bound coordinate.

5.3 **Evidence/ref separation as found.** At the effective point of this decision the binding stands in the valid `D-3 §5.2` rule 4 state — the mutable operational ref has advanced beyond the designated evidence tree — i.e. `{ref=C2; evidence=tree(C1)}` with `tree(C1)` = `962d7ea322e4ade5cda61c3fc9335de616903daf`. §13 preserves that relation.

---

## 6. ACT A DECISION

6.1 **Decision rendered.**

> **`Act A = A1 — APPROVED`**
>
> **A1 — REALIZATION IS A STATE PREDICATE ON THE BOUND OPERATIONAL REFERENCE.**

6.2 **Decision text (as bounded by the Program Authority).** This record adopts **A1** exactly as bounded at §7–§8 below. No element of A1 is narrowed, broadened, or supplemented by this record.

6.3 **Character of the act.** This is an explicit Program Authority governance decision answering the question allocated to D2-C at `NP-13-D2-01-DEFINITION-01 §4.5` — *"What state of the operational ref / evidence coordinate establishes that a piece of work contributes to the governed baseline?"* — for which no corpus-derivable answer existed (`NP-13-D1-01 §6.6`; `NP-13-GO3B-DECISION-01 §4.4.3`; `NP-13-D2-01-DEFINITION-01 §4.7`).

6.4 **Relationship to the options record.** `NP-13-PA-D2-C-DECISION-OPTIONS-01 §7.1` presented **A1** as a *recommendation only*. The Program Authority has now **explicitly selected A1**; accordingly **A1 is a rendered decision and no longer a recommendation**. The options record is preserved unchanged as the historical record of preparation; it is not amended, and its non-binding status applied only to its own stage.

---

## 7. FULL A1 REALIZATION SEMANTIC

7.1 **Core semantic (adopted verbatim in substance).**

> **A governed baseline is considered REALIZED when its governed content is present in the currently bound operational reference.**

7.2 **Instantiation for the current NP-13 `M1` baseline.**

```text
Operational reference (bound)      = refs/heads/main
                                      in ramkivs/iips-review-recovered
Realization predicate              = governed content is present in that
                                      currently bound operational reference
Consequently                        = realization is a STATE PREDICATE ON THE
                                      BOUND OPERATIONAL REF
```

7.3 **Reading rules (no extension).**

| # | Rule |
|---|---|
| 7.3.1 | The predicate is a predicate on the **bound** reference — not on any other ref, branch, tag, commit, tree, working copy, workspace, archive, or runtime. |
| 7.3.2 | The bound reference is the one designated by the durable `E-3` binding (`refs/heads/main`, §5.1). If a future explicit `E-3` re-binding changes the bound reference, the predicate follows the **then-current** bound reference — the predicate's *form* is stable, its *coordinate* is the binding. This record performs no re-binding. |
| 7.3.3 | "Present in the bound operational reference" is a claim about the state of that reference; it is not a claim about evidence, deployment, runtime, certification, or release (§§ 12, 14, 15). |
| 7.3.4 | Realization is **declarative state**, not an authorization: a realized state confers no implementation, runtime, production, certification, or release authority. |
| 7.3.5 | No additional criterion is created. The predicate is exactly as stated; it is not a weighted test, a sufficiency bundle, or an aggregation of other planes. |

---

## 8. A1 COMPANION CONDITIONS

8.1 **All twelve companion conditions below are REQUIRED elements of `Act A = A1`.** They are adopted as rendered by the Program Authority. The bracketed *Traceability* notes record the corpus instruments the conditions preserve; they are annotations for continuity only and **do not modify, narrow, broaden, or condition** the adopted text.

### A1-C1 — Unmerged work is NOT realized

> **A1-C1:** Unmerged work is **NOT** realized.

*Traceability:* consistent with `NP-13-D2-01-DEFINITION-01 §5.1` A-9/A-10 (composition/membership remain D3) and with the preservation of divergent/unmerged lineages as historical/lineage evidence at `NP-13-PA-D2-B-…` §5.2. **This condition does not adjudicate any workstream's status** (§14).

### A1-C2 — Realization follows the state of the bound operational ref

> **A1-C2:** Realization **follows the state** of the bound operational reference.

*Traceability:* gives operative content to the `C-4 §4.2` role designation of the operational ref as the *governance / realization coordinate*, which `GO3B §4.4.3` expressly said established **where** realization is coordinated but not the semantics.

### A1-C3 — The authoritative evidence tree remains a distinct plane

> **A1-C3:** The authoritative evidence tree remains a **distinct plane**. Realization does **NOT** automatically refresh or replace authoritative evidence designation.

*Traceability:* `D-3 §5.2` rules 3 and 5; `§5.3.1` (no automatic pin drift).

### A1-C4 — The existing evidence relation remains valid

> **A1-C4:** The existing evidence relation `{ ref = C2 ; evidence = tree(C1) }` remains **valid**. Realization and evidence designation must **not** be collapsed into one semantic plane.

*Traceability:* `D-3 §5.2` rule 4 and `§5.3.2` (staleness is not a defect; no correction required or authorized); `C-4 §4.4.1` (deliberate separation; non-interchangeability).

### A1-C5 — Realization does NOT change governed logical identity

> **A1-C5:** Realization does **NOT** change governed logical identity.

*Traceability:* `G-4 §8.2` (identity conferred by nothing mechanical); `§8.3` (identity-preserving changes, including ref movement and feature-affecting realization change by default); `§8.4` (commit/merge/PR-merge/tree/blob/ref changes are identity-**insufficient**); `NP-13-D1-C-01 §2`; `D1-B` unchanged and un-restated.

### A1-C6 — Realization does NOT advance the governed epoch/version

> **A1-C6:** Realization does **NOT** advance the governed epoch/version.

*Traceability:* `D1-C #3` — *"Repository commits, branch movement, tree changes, evidence refresh, implementation changes, or ref changes do not independently advance the governed-object epoch."* Governed epoch remains at its established initial value **1**.

### A1-C7 — Governance-to-runtime identity relationship remains NOT ESTABLISHED / NOT INFERABLE

> **A1-C7:** The governance-to-runtime identity relationship remains: **NOT ESTABLISHED / NOT INFERABLE**. Do **not** invent a runtime identity relationship.

*Traceability:* `NP-13-D1-C-01 §2` Semantic 5 (boundary only: governance identity ≠ runtime identity); `GO3B §8.6` (runtime identity · tenant identity · persistence identity expressly **not decided**). **Consequence:** D2-C output (a)'s second limb is discharged **by explicit non-establishment** — the relationship is fixed as *not established and not inferable*, which is a governance determination, not a deferral by omission.

### A1-C8 — Realization does NOT determine D3 composition or membership

> **A1-C8:** Realization does **NOT** determine D3 composition or membership. **J-2** and **J-3** remain **entirely within D3**.

*Traceability:* `NP-13-D2-01-DEFINITION-01 §4.5` (*"D3 applies D2-C's realization semantics to determine membership. D3 must not re-decide realization semantics."*); `§5.1` A-9/A-10.

### A1-C9 — Ordinary Git operations are not thereby governance acts

> **A1-C9:** Do **not** infer that ordinary Git operations themselves constitute separate governance acts merely because they cause the bound ref to change. Preserve the existing `D-3 §5.2` rule 6 boundary.

*Traceability:* `D-3 §5.2` rule 6 — *"Clarification. Commit, merge, fast-forward, push, pull-request creation, pull-request merge, branch movement, rebase, checkout, fetch, and tag creation are **not** evidence-refresh acts, **not** binding acts, and **not** identity acts."*; `E-3 §6.3.1` (a binding is not satisfied by *"any Git operation"*).

### A1-C10 — The mechanical-ref-advancement ambiguity is NOT silently resolved

> **A1-C10:** The previously identified ambiguity concerning whether **mechanical ref advancement itself requires explicit governance recognition** must **not** be silently resolved beyond the exact A1 rule above.

**8.2 Preserved-open item (explicit).** This record **expressly preserves** that ambiguity as an **open, un-resolved matter**. It is recorded here as **OPEN-1**:

```text
OPEN-1 = Whether mechanical advancement of the bound operational ref changes
         realized state without any governance act, or whether the mechanical
         state is the candidate whose RECOGNITION requires an explicit act,
         is NOT DECIDED by Act A = A1.
```

It is **not** resolved by implication, adjacency, silence, or reasoning from `A1-C2`; resolving it requires its own explicit Program Authority act. *Traceability:* `D-3 §5.2` rule 6; `E-3 §6.3.1`; `GO3B §10.4` (adjacency creates no dependency, precedence, or ordering).

### A1-C11 — Realization is not deployment, activation, certification, or release

> **A1-C11:** Realization must **not** be interpreted as deployment, runtime activation, production activation, certification, or release.

*Traceability:* the `D1 §6.6` disjunct *"deployed"* is not adopted, and this condition forecloses reading it into A1; production, certification, and release are out of scope corpus-wide.

### A1-C12 — Realization does not alter governed ownership

> **A1-C12:** Realization does **not** create, transfer, or alter governed ownership.

*Traceability:* `D1-C #10` ownership; `NP-13-D1-C-01 §2` Semantic 6 (no inferred attached identity).

8.3 **Uniform effect of the companion conditions.** They are **constraints within A1**, not separate decisions; they bind any future application, interpretation, or conformance statement concerning realization under D2-C.

8.4 **No new identity, epoch, or ownership semantics.** Nothing in §7–§8 establishes, amends, or implies any identity mechanism, identifier, epoch mechanism, or ownership mechanism. All such matters remain as established (or deferred) by D1-C / G-4 / G-5 and their successors.

---

## 9. ACT B DECISION

9.1 **Decision rendered.**

> **`Act B = B-i — APPROVED`**
>
> **B-i — C-1 IS THE AUTHORITATIVE DURABILITY RULE; C-2 REMAINS A HISTORICAL, NON-DURABILITY PLACEMENT / RECORDING CONVENTION.**

9.2 **Character of the act.** This is the **C-1 / C-2 reconciliation** allocated to D2-C at `NP-13-D2-01-DEFINITION-01 §4.5` output (b) and `§5.1` row A-8, and carried unreconciled since `NP-13-D0-01 §4.12` through `NP-13-D1-01 §8.4`, `NP-13-GO3B-DECISION-01 §8.6` / `§10.3`, and `NP-13-PA-D2-DECISION-01 §11.1`.

9.3 **Relationship to the options record.** `NP-13-PA-D2-C-DECISION-OPTIONS-01 §7.3` presented **B-i** as a *recommendation only*. The Program Authority has now **explicitly selected B-i**; accordingly **B-i is a rendered decision and no longer a recommendation**. B-ii and B-iii are **not** adopted and remain historically presented and not selected.

---

## 10. FULL B-i RECONCILIATION

10.1 **Adopted elements.** The following twelve elements are the rendered content of `Act B = B-i`. They are adopted exactly as bounded; the bracketed *Traceability* notes are annotations for continuity only.

### B1 — C-1 remains the authoritative durability rule

> **B1:** **C-1** remains the **authoritative durability rule**.

*Traceability:* C-1 source — `NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD` header (*"authoritative closure requires publication to IRR `main`"*) and §1 (*"A local file, session-branch commit, or open pull request is **not** authoritative `main` publication."*).

### B2 — Durable authoritative state requires publication + independent remote verification

> **B2:** Durable authoritative state requires **publication to the designated authoritative repository/ref** and **independent remote verification**, consistent with the IIPS **Universal Artifact Durability Invariant**.

*Traceability:* invariant text — *"Arena workspace state is not authoritative. A governance artifact becomes durable only after publication to the explicitly designated authoritative repository/ref and independent remote verification."* (`NP-13-PA-D1C-DECISION-01 §1.4`).

### B3 — C-2 remains a historical / non-durability placement and recording convention

> **B3:** **C-2** remains a **historical / non-durability** placement and recording convention.

*Traceability:* C-2 source — `NP-13-AUTH-02 §4` (blob `32cec7d830e008cda2a0fcea385b8e1f957461c1`, `9994` B, SHA-256 `3f0ebccd609c6135c54fcfb6c525250ed98bf48bfaf7846fcf7b073ccf845cd7`), preserving `NP-13-AUTH-01`'s recording restriction *"No commit of this record or of any implementation should be made on the unreconciled local `HEAD`"* and placing that record on `arena/01a0f351-iips-review-recovered`.

### B4 — C-2 is NOT elevated to a generally binding placement rule

> **B4:** C-2 is **NOT** elevated to a generally binding placement rule.

*Traceability:* `NP-13-D1-01 §8.4` — *"This record does not reconcile C-1 and C-2 and does not adopt either as generally binding."* B-i preserves that posture for C-2 while resolving the tension in favour of C-1's durability role (B1, B2, B10).

### B5 — C-2 does NOT override, weaken, or replace C-1

> **B5:** C-2 does **NOT** override, weaken, or replace C-1.

### B6 — Existing D2-A and D2-B decisions are not reopened or re-litigated

> **B6:** Existing **D2-A** and **D2-B** decisions are **not reopened or re-litigated**.

*Traceability:* §4 and §5 above; both were published under C-1 and independently verified.

### B7 — Existing E-3 durability semantics are not weakened or replaced

> **B7:** Existing **`E-3`** durability semantics are **not weakened or replaced**.

*Traceability:* `NP-13-GO3B-DECISION-01 §6.3.3` already applies C-1 for the durable-recording element; B-i **confirms** it.

### B8 — The Universal Artifact Durability Invariant remains unchanged

> **B8:** The Universal Artifact Durability Invariant remains **unchanged**.

### B9 — No new two-branch publication topology is created

> **B9:** **No** new two-branch publication topology is created.

*Traceability:* the B-iii dual-track route was **not** adopted.

### B10 — Future NP-13 governance artifacts follow C-1 for authoritative durability

> **B10:** Future NP-13 governance artifacts **follow C-1** for authoritative durability.

### B11 — Historical C-2 material remains historically preserved; not erased

> **B11:** Historical C-2 material remains **historically preserved** and must **not** be erased merely because B-i is adopted.

*Traceability:* supersession-without-erasure discipline (`F-3 §7.3`; `E-3 §6.3.5`). Note: B-i does not even supersede C-2 — it classifies and bounds it.

### B12 — B-i does not authorize implementation or publication

> **B12:** B-i does **not** authorize implementation or publication.

10.2 **Residual disclosure carried forward (not reconciled by this record).** `NP-13-GO3B-DECISION-01 §12.3.4` discloses a **labeling variance** regarding the in-repo `iips-platform` tree versus the separate repository `ramkivs/iips-production-market-data`, and expressly declines to resolve it. That variance is **unaffected by B-i** and remains **disclosed and carried forward**; this record neither reconciles nor prefers either reading. *Additionally preserved:* all `NP-13-GO3B-DECISION-01 §10.1–§10.5` deferrals, `NP-13-PA-D2-DECISION-01 §11.1` deferred matters, and `NP-12 STATUS = NOT DETERMINED` (verbatim).

---

## 11. C-1 / C-2 DISTINCTION

11.1 **Category distinction (governing).**

| | **C-1** | **C-2** |
|---|---|---|
| Category | **durability / authoritative publication semantics** | **historical recording / placement restriction concerning an unreconciled local `HEAD`** |
| Question it answers | *Is this record durable and authoritative?* | *Where should this record be recorded while the local `HEAD` is unreconciled?* |
| Source | `NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD` (present on `main`) | `NP-13-AUTH-02 §4` (blob `32cec7d8…`; **not** on the `main` lineage) |
| Standing under this decision | **AUTHORITATIVE DURABILITY RULE** (B1, B2, B10) | **Historical, non-durability, contextual only** (B3, B4, B5, B11) |
| Durability effect | Yes — exclusive | **None** |
| General binding force | Yes, as the durability rule | **No** |
| Prospective operation | Governs future publication (B10) | **No prospective general force**; historical application preserved (B11) |

11.2 **No collapse.** C-2 is not a durability convention, and C-1 is not a placement convention. The two are not interchangeable; B-i keeps them in separate categories (`C-4 §4.4.1` discipline applied to the durability seam).

11.3 **No retroactive effect.** B-i operates **prospectively** as the governing rule. It does **not** invalidate, reverse, downgrade, or cast doubt on any historical publication made under any convention, and it does **not** retroactively alter any record's durability status. D2-A and D2-B remain COMPLETE / DURABLE (B6).

---

## 12. IDENTITY / EPOCH / EFFECTIVE-POINT CONTINUITY

12.1 **Preserved D1-C semantics (unchanged).**

| # | Preserved semantic | Source |
|---|---|---|
| 1 | Governed logical identity remains **separate** from repository, ref, branch, commit, tree, implementation artifact, runtime realization, and workstream record | `D1-B §3.1–§3.4`; `NP-13-D1-C-01 §2` |
| 2 | Identity changes **only** through the established **G-5** mechanism (explicit governance act changing the recognized governed logical object) | `G-5 §8.5`; `D1-C #6` |
| 3 | **Realization does not change identity** | `A1-C5`; `G-4 §8.3`/`§8.4` |
| 4 | **Realization does not change epoch/version** | `A1-C6`; `D1-C #3` |
| 5 | **Effective-point semantics remain those established for governance acts** — the authoritative effective point is the timestamp explicitly recorded by the governance act; Git/evidence/runtime timestamps are not substitutes | `D1-C #4`; `E-3 §6.3.4` |
| 6 | **Ownership remains separate from identity** | `D1-C #10`; `A1-C12` |
| 7 | **Continuity is preserved across non-G-5 changes** — ref movement, evidence refresh, provenance change, implementation change | `D1-C #5`; `G-4 §8.3` |

12.2 **No new identity or epoch created by this decision.** Rendering, recording, or (eventually) publishing this D2-C decision **does not** create a new governed object, does not create or increment an epoch, and does not alter ownership. `A1-C5`, `A1-C6`, and `A1-C12` apply to this record itself.

12.3 **Effective point of *this* decision.** Recorded at §17 as an explicit UTC timestamp — the actual decision-rendering time of the execution environment. It applies to **this** governance decision and is **not retroactive** to D2-A, D2-B, or any predecessor effective point.

12.4 **Realization determinations and effective points.** Where an explicit governance act makes a realization *determination*, its effective point is recorded by that act per `D1-C #4`. Whether the underlying mechanical ref advancement itself carries an effective point remains part of **OPEN-1** (`A1-C10`, §8.2) and is **not** decided here.

---

## 13. EVIDENCE / REF SEPARATION

13.1 **Restated as governing for A1.** The three elements of the `B-3` model remain **distinct and non-collapsible** (`B-3 §3.3`): repository · mutable operational ref · immutable content-addressed evidence coordinate. Neither the ref nor the evidence coordinate is the governed-object identity (`C-4 §4.4.2`; `F-3` rules 8–9).

13.2 **Current verified coordinates.**

```text
Bound repository              = ramkivs/iips-review-recovered
Bound mutable operational ref = refs/heads/main
Authoritative evidence (primary, designated)  = Git root tree
                                                962d7ea322e4ade5cda61c3fc9335de616903daf
Authoritative evidence (supporting provenance) = commit
                                                ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd
```

13.3 **Governed relation preserved (`A1-C4`).** The current state is a **valid** `D-3 §5.2` rule 4 state:

```text
{ ref = 2e32348fbd0bf7ab5e38f9bed92e63aa25a10322 ; evidence = tree(962d7ea3…) }
```

Realization follows the bound ref (`A1-C2`); evidence designation does **not** follow automatically (`A1-C3`). No refresh is effected, required, implied, or scheduled by this record, and no "pin drift" obligation exists (`D-3 §5.3.1`; staleness is not a defect, `§5.3.2`).

13.4 **Evidence of realization claims.** Where a realization claim is required to be *evidenced*, the evidencing instrument remains the designated authoritative evidence coordinate under `F-3` (tree primary, commit supporting), refreshed only by an explicit `D-3` act. This record performs none.

---

## 14. D3 BOUNDARY

14.1 **Positive statement.** D2-C establishes **realization semantics** (§§6–8) and the **C-1 / C-2 reconciliation** (§§9–11). Nothing more.

14.2 **D2-C does NOT decide** (explicit, verbatim in effect):

- **J-2 composition**
- **J-3 membership**
- **per-workstream membership**
- **NP-13 divergence adjudication**
- **NP-09 special membership treatment**
- **divergent/unmerged eligibility beyond the A1 realization predicate**
- **product/runtime implementation**
- **persistence implementation**
- **runtime identity architecture**
- **deployment**
- **production behavior**
- **certification**
- **release**

14.3 **D3 remains the gate for composition/membership decisions.** Consistent with `NP-13-D2-01-DEFINITION-01 §4.5`, D3 **applies** D2-C's realization semantics and **must not re-decide** them. Conversely, D2-C does not pre-decide any D3 matter: this record makes **no** membership finding, and `A1-C1` (unmerged work is not realized) is a **semantic predicate only** — it is **not** a membership determination, does **not** exclude or include any workstream, and does **not** adjudicate `NP-13-D1-01 §6.4`'s preserved divergence (`034384fb…` / `fa9862c9…`). `NP-12 STATUS = NOT DETERMINED` is preserved verbatim.

14.4 **Wording discipline observed.** No wording in this record determines, or may be read as determining, any composition act, membership status, workstream eligibility, or divergence outcome. Where this record's predicates could touch D3 subject matter, they are stated as **semantic conditions under D2-C**, expressly not as D3 results.

---

## 15. EXPLICIT NON-AUTHORITY STATEMENTS

15.1 This record **does NOT grant, confer, restore, imply, or extend**:

| # | Authority | Status |
|---|---|---|
| 1 | Publication authority (this record or any other artifact) | **NOT GRANTED** |
| 2 | Implementation authority | **NOT GRANTED** |
| 3 | Runtime authority | **NOT GRANTED** |
| 4 | Persistence implementation authority | **NOT GRANTED** |
| 5 | Production authority | **NOT GRANTED** |
| 6 | Certification authority | **NOT GRANTED** |
| 7 | Release authority | **NOT GRANTED** |
| 8 | Provider authority | **NOT GRANTED** |
| 9 | Security authority | **NOT GRANTED** |
| 10 | D3 definition / convening / eligibility / authorization authority | **NOT GRANTED** |
| 11 | D2 completion authority (requires the separate `D2-CM-6` act) | **NOT EXERCISED** |
| 12 | Ref re-binding or evidence-refresh authority | **NOT GRANTED** |
| 13 | J-2 / J-3 authority of any kind | **NOT GRANTED** |

15.2 **No inference.** Broader authority must **not** be inferred from this record's subject matter, its decision content, its rendering, its length, its comprehensiveness, its placement, or any future publication route, commit ancestry, PR, or merge (`GO3B §11.2` discipline).

15.3 **Character of the artifact.** This is a **governance decision record**, not an implementation authorization. It authorizes no code, configuration, runtime behavior, deployment, test, migration, persistence, or production activity.

15.4 **Scope exclusions reaffirmed.** **Production: OUT OF SCOPE.** **IPD (`ramkivs/iips-production-market-data`): OUT OF SCOPE / UNTOUCHED — not accessed, zero mutations.** **NP-12: READ-ONLY / PRESERVE.** No new integration gate is established, convened, or authorized.

---

## 16. HISTORICAL CONTINUITY / SUPERSESSION TREATMENT

16.1 **Nothing is superseded by this record.** D2-C renders a **new** operating rule (realization) and a **classification** of two conventions (C-1 / C-2). It does not supersede, replace, or amend any predecessor decision, and no predecessor is reopened.

16.2 **Supersession treatment of C-2 (explicit).** B-i does **NOT**:

- amend, rewrite, or invalidate `NP-13-AUTH-02` or any historical C-2 artifact;
- claim that C-2 **was** previously a generally binding NP-13 durability rule;
- claim that C-2 was previously "the" authoritative publication rule;
- claim that B-i retroactively invalidates the historical C-2 record or any publication made under it;
- erase, downgrade, or reinterpret the historical C-2 material (B11).

What B-i does is **classify** C-2 as a historical recording/placement convention with **no durability effect**, and **prescribe prospectively** (B10) that future NP-13 governance artifacts follow C-1 for authoritative durability.

16.3 **Historical source meaning vs. current governing rule (distinction preserved).**

| Plane | Statement |
|---|---|
| **Historical source meaning** | `NP-13-AUTH-02 §4` said exactly what it said, for that record, in its own context: a recording restriction concerning the unreconciled local `HEAD`, applied by placing that record on the branch carrying the authorized implementation. That meaning is preserved **unchanged and un-amended**. |
| **Current governing rule** | For NP-13 governance artifacts **prospectively**: C-1 governs authoritative durability (B1, B2, B10); the placement of a record does not confer durability, and no placement convention confers closure. |

16.4 **Disclosure trail closed prospectively.** The unreconciled C-1 / C-2 tension was disclosed and carried forward at `NP-13-D0-01 §4.12`, `NP-13-D1-01 §8.4` / `§7.14`, `NP-13-GO3B-DECISION-01 §8.6` / `§10.3` / `§12.3.4`, and `NP-13-PA-D2-DECISION-01 §11.1`. With `Act B = B-i`, that tension is **reconciled for the future**: C-1 is the durability rule and C-2 is bounded as historical/contextual. Those predecessor records are **not edited**; their disclosures remain accurate statements of the state **at their own effective points**, exactly as this record will be a statement of the state at its own.

16.5 **No self-exemption.** This record is subject to `B10` like any other NP-13 governance artifact: its own durability is governed by C-1, and it claims none (§20).

16.6 **Preserved un-resolved matters (unchanged by this record).** `OPEN-1` (`A1-C10`); the `GO3B §12.3.4` labeling variance; `NP-13-D1-PREREQ-01` ordering posture; all `GO3B §10.1–§10.5` deferrals; `PA-D2-DECISION §11.1` deferred matters; `NP-12 STATUS = NOT DETERMINED`; the NP-13 divergence; and every D3-allocated subject matter.

---

## 17. DECISION EFFECTIVE POINT

17.1 **Effective point (explicit UTC).**

```text
EFFECTIVE POINT = 2026-10-04T07:42:20Z
```

This is the **actual decision-rendering time** of the execution environment for this gate. No historical time is fabricated, and no time is retro-assigned.

17.2 **Non-retroactivity.** This effective point applies to **this** governance decision only. It does **not** apply retroactively to D2-A (effective at its own publication, `ac8a751…`), to D2-B (decision act effective point `2026-10-03T17:28:00Z`, binding durably effective upon publication `2e32348f…`), or to any predecessor's effective point.

17.3 **Realization semantic's attachment.** For the current `M1` baseline, the adopted realization predicate attaches to the **currently bound operational ref** (`refs/heads/main`). Its application to a governance realization *determination* carries that determination's own effective point per `D1-C #4`; see `OPEN-1` for the un-decided mechanical case (`A1-C10`).

---

## 18. DECISION STATUS

18.1 **Status of the rendered decisions.**

```text
Act A = A1  — APPROVED  (Program Authority: Ramki)
Act B = B-i — APPROVED  (Program Authority: Ramki)
D2-C DECISION = RENDERED / NOT YET DURABLE
```

18.2 **Completeness against the D2-C output model** (`NP-13-D2-01-DEFINITION-01 §4.5`):

| Output | Requirement | Satisfaction |
|---|---|---|
| (a) | Realization-semantics rule set — contribution-membership criteria · governance-vs-runtime identity relationship · unmerged-work posture | **PROVIDED** — §7 (predicate), `A1-C1` (unmerged posture), `A1-C7` (governance↔runtime fixed as not established / not inferable) |
| (b) | C-1 / C-2 reconciliation — which convention governs future NP-13 publications | **PROVIDED** — §9–§11 (B1–B12) |
| (c) | Conformance statement showing how future gates must publish durably | **DERIVED FROM (a) AND (b); NOT AUTHORED BY THIS RECORD** — see §18.3 |

18.3 **Conformance statement (output (c)) — status.** Because (a) and (b) are now rendered, output (c) is authorable; it is **not** rendered here, is **not** implied to exist, and requires its own act within D2-C or as directed by the Program Authority. It must not be treated as in force.

18.4 **Relationship to D2 completion.** `D2-C` being *decided* does **not** complete D2. Per `NP-13-D2-01-DEFINITION-01 §8`, completion requires the necessary conditions `D2-CM-1`…`D2-CM-5` **and** a separate explicit **`D2-CM-6`** Program Authority completion act, which has **not** been rendered.

18.5 **State of the D2 completion-model necessary conditions (as observed, not as a completion claim).**

| # | Necessary condition | Observed state |
|---|---|---|
| D2-CM-1 | D2-A decided and durably published | **SATISFIED** (§4) |
| D2-CM-2 | D2-B decided via valid `E-3` act, durably published | **SATISFIED** (§5) |
| D2-CM-3 | D2-C decided (realization + C-1/C-2), durably published | **DECIDED (§§6–11); DURABLE PUBLICATION PENDING (§19–§20)** — condition **not yet fully satisfied** |
| D2-CM-4 | All predecessor NP-13 records preserved unchanged | **SATISFIED** (16/16 pins verified; §21) |
| D2-CM-5 | G-4 / G-5 continuity and trigger-class boundaries preserved | **SATISFIED** (§12; `A1-C5`, `A1-C6`) |
| D2-CM-6 | Explicit PA D2 completion act | **NOT RENDERED** |

18.6 **Decision status summary.** `D2-C DECISION = RENDERED` (Act A = A1; Act B = B-i) — **subject to** §19 (no publication authority exercised) and §20 (not durable). **`D2 = NOT COMPLETE`.**

---

## 19. PUBLICATION STATUS

19.1 **Status.**

```text
PUBLICATION AUTHORITY = NOT AUTHORIZED
PUBLICATION           = NOT PERFORMED
```

19.2 **What was NOT done (attested).** No `git add`; no `git commit`; no `git push`; no pull request; no merge; no tag; no publication to `main`; **no publication to any Arena/session branch as a substitute for `main` durability**; no IRR mutation of any kind; no IPD access or mutation.

19.3 **Character of this artifact.** This record exists **only** as an Arena **workspace draft**. It is **not** an authoritative publication, **not** durable, and confers **no** governance effect beyond recording the rendered decisions and their terms in preparation for a future, separately authorized publication act.

19.4 **Condition for the `E-3`-analogous third element.** Consistent with `C-1` and the `E-3 §6.3.3` / `§6.4` discipline (applied by analogy to a governance decision record), authoritative durability requires: **separate explicit publication authorization** → **publication to `ramkivs/iips-review-recovered @ refs/heads/main`** → **independent remote verification**. Element 1 is **not granted**.

19.5 **Anticipated publication delta (for future authorization only; not performed, not scheduled).** The intended repository delta would be **exactly one added path**: `docs/integration/NP-13-PA-D2-C-REALIZATION-SEMANTICS-DECISION-01.md` — no other file added, modified, renamed, or deleted. This statement is disclosure for a future act and creates no authority and no obligation.

19.6 **Non-self-referential identity convention (recorded for future publication).** Consistent with `NP-13-PA-D1C-DECISION-01 §12.3.2`, a cryptographic digest of this artifact cannot be contained within the artifact without altering that digest. This record therefore pins only **non-self-referential** coordinates (baseline commit, designated evidence tree, predecessor blob pins, gate-chain artifacts). Its own byte count, Git blob ID, SHA-256, publication commit, pull-request number (if any), merge commit (if any), and post-publication authoritative tree **cannot be recorded here** and are to be reported externally and in the future publication commit message / PR body / durability report.

---

## 20. DURABILITY STATUS

20.1 **Status.**

```text
DURABILITY = NOT DURABLE
```

20.2 **Rule applied.** Per the IIPS **Universal Artifact Durability Invariant** — *"Arena workspace state is not authoritative. A governance artifact becomes durable only after publication to the explicitly designated authoritative repository/ref and independent remote verification."* — and per C-1 as ratified at B1/B2/B10, this record **does not claim durable status**, and no durability may be inferred from its existence, its content, its completeness, its rendering, or its availability in any workspace.

20.3 **Fail-closed rule.** Until independent remote verification confirms that this record is reachable from `refs/heads/main` with the expected blob identity and expected SHA-256, and that all predecessor pins are preserved, **durability is not established**, no authoritative effect may be attributed to it, and any downstream gate that requires a durable D2-C decision must treat this record as **NOT YET DURABLE**.

20.4 **Consistency with §16.5.** This record is subject to B10 and exempts itself from nothing.

---

## 21. READ-ONLY PRE-RENDER VERIFICATION PERFORMED

21.1 Before rendering, the following were **independently verified** in a read-only posture; any inconsistency was to cause an immediate stop with **no** record rendered. All checks passed.

| # | Verified item | Verified value | Result |
|---|---|---|---|
| A | Live `refs/heads/main` (fresh fetch) | `2e32348fbd0bf7ab5e38f9bed92e63aa25a10322` | **PASS** |
| A′ | Independent mechanism (GitHub commits API) | `2e32348fbd0bf7ab5e38f9bed92e63aa25a10322` | **PASS** |
| B | D2 definition artifact | `docs/integration/NP-13-D2-01-DEFINITION-01.md` = `4143d2947107b5ab06c986b4d1b8579b5d242549` | **PASS** |
| C | D2-A durable record | `…NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01.md` = `a4f049dd369ff70871f1d2e9f78762ed6300c352` | **PASS** |
| D | D2-B durable record blob | `dcad0e8d418bd43dc08d92b1ba2b29b116a10831` | **PASS** |
| E | D2-B blob size / SHA-256 (recomputed from live remote blob) | `23193` B / `2776d6f68b9097d53e3dd937fa2170557d5bb9ee7fdb076b862c3ff42caa5fa0` | **PASS** |
| F | NP-13 predecessor continuity | **16 / 16 unchanged** | **PASS** |
| G | D2-C investigation record (workspace) | `37574` B / SHA-256 `7dc0d91aee22ae484e07db91937e0b6b135228fe220309a9d7543f118a493250` | **PASS** |
| H | D2-C decision-options record (workspace) | `47311` B / SHA-256 `d204c7879e59958be576d8cade788f516bc28821e30c3ef613b2a3176cfd3cfe` | **PASS** |
| I | Target path absent (workspace and live `origin/main`) | **ABSENT** in both | **PASS** |
| J | Mutation count during this gate | **ZERO** | **PASS** |

21.2 **Fail-closed discipline observed.** No check printed a success state after a failure; no command followed a failed prerequisite; no discrepancy was silently repaired; no inferred value was substituted for a missing governance fact; and no PowerShell executable block was used in this gate. Had any check failed, the prescribed behaviour was an immediate stop and a **§2.5-style refusal to render** with no record written.

21.3 **Non-amendment.** Zero predecessor records were modified. The NP-13 corpus on `main` is byte-identical to the verified baseline of §21.1; the repository delta of this gate is **zero** (only this workspace draft was created, and it resides outside any repository).

---

## 22. FINAL DISPOSITION

```text
Act A = A1  — APPROVED            (Program Authority: Ramki)
Act B = B-i — APPROVED            (Program Authority: Ramki)

D2-A = COMPLETE / DURABLE
D2-B = COMPLETE / DURABLE
D2-C DECISION = RENDERED / NOT YET DURABLE
D2   = NOT COMPLETE
D3   = NOT ELIGIBLE

Publication authority           = NOT GRANTED
Publication                     = NOT AUTHORIZED / NOT PERFORMED
Durability (this record)        = NOT DURABLE
Implementation authority        = NOT GRANTED
Runtime authority               = NOT GRANTED
Production authority            = NOT GRANTED
Certification/release authority = NOT GRANTED
IPD                             = OUT OF SCOPE / UNTOUCHED
Repository mutations            = ZERO
```

---

## AUTHORITY ATTESTATION

**Program Authority:** Ramki (Ramakrishnan)

**Decisions rendered at this gate:** **`Act A = A1 — APPROVED`** · **`Act B = B-i — APPROVED`**

**Attested limitations:**

```text
This record renders only the two bounded decisions above, with their stated companion conditions.
It creates no publication authority, no implementation, runtime, production, certification, or
  release authority, and no D3 authority.
It does not complete D2 (a separate explicit D2-CM-6 act is required).
It does not amend, reopen, reinterpret, or supersede any predecessor record.
It does not determine any composition, membership, workstream eligibility, or divergence outcome.
It does not resolve OPEN-1 (A1-C10) or the GO3B §12.3.4 labeling variance.
It adopts A1-C7 as an explicit non-establishment of the governance-to-runtime identity relationship.
It preserves NP-12 STATUS = NOT DETERMINED verbatim and all existing deferrals.
No commit, push, branch, tag, pull request, merge, or publication was performed.
IPD was not accessed and was not modified. Repository mutations = ZERO.
This record is NOT DURABLE and confers no authoritative effect until separately authorized
  publication to ramkivs/iips-review-recovered @ refs/heads/main
  and independent remote verification have both occurred.
```

**End of `NP-13-PA-D2-C-REALIZATION-SEMANTICS-DECISION-01` (workspace draft, unpublished, not durable).**
