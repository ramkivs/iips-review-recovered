# NP-13 — D2 DEFINITION: BASELINE INSTITUTIONAL ESTABLISHMENT GATE

> **Record identifier:** `NP-13-D2-01-DEFINITION-01` — D2 Definition Record (Baseline Institutional Establishment)
> **Document type:** `GOVERNANCE DEFINITION RECORD` — establishes the purpose, scope, structure (D2-A/D2-B/D2-C), D2-vs-D3 allocation, inputs, and outputs of the D2 gate; this is a definition record, not an eligibility decision, not an authorization act, not an implementation record
> **Gate:** **NP-13 D2-01 — D2 Definition Gate** (convened under PA-D2-01 = 01-A)
> **Authorization source:** `NP-13-PA-D2-DECISION-01 §7` — PA-D2-01 = 01-A: "AUTHORIZE CONVENING OF A FUTURE D2 DEFINITION GATE (NP-13-D2-01)"
> **Record date:** 2026-10-03
> **Program Authority:** Ramki (Ramakrishnan)
> **Repository:** IRR — `ramkivs/iips-review-recovered`
> **Authoritative durability destination:** `origin/main` (`refs/heads/main`)
> **Decision published:** D2 definition **ESTABLISHED** (D2-A / D2-B / D2-C purpose defined; D2-vs-D3 allocation established; inputs/outputs enumerated)
> **Resulting state:** **D2 DEFINITION = ESTABLISHED** · **D2 ELIGIBILITY = NOT DETERMINED BY THIS GATE** · **D2 WORK = NOT STARTED** · **D2 IMPLEMENTATION AUTHORITY = NOT GRANTED** · **D3 = NOT ELIGIBLE** · **IMPLEMENTATION AUTHORITY = NOT GRANTED**
> **Authority granted by this record:** NONE beyond defining D2. This is a definition record; it does not perform D2, decide D2-A/B/C, establish D2 eligibility, authorize D2 work, or grant implementation authority (§12).
> **Predecessors:** `NP-13-D0-01`, `NP-13-D1-01`, `NP-13-D1-C-01`, `NP-13-D1-PREREQ-01`, `NP-13-GO3B-01`, `NP-13-GO3B-DECISION-01`, `NP-13-PA-D1-DECISION-01`, `NP-13-PA-D1C-DECISION-01`, `NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01`, `NP-13-D1-CM-B-DECISION-01`, `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01`, `NP-13-PA-D1-COMPLETION-01`, `NP-13-PA-D2-DECISION-01` — all preserved unchanged (§14).
> **Additive character:** This record is additive only. It does not rewrite, amend, correct, reinterpret, reopen, or supersede any predecessor record. It does not perform any D2 sub-decision (D2-A / D2-B / D2-C remain to be decided at their own future gates).
> **Production:** OUT OF SCOPE · **IPD:** OUT OF SCOPE — NOT ACCESSED / NOT MODIFIED

---

## 1. PURPOSE, GATE IDENTITY, AND HISTORICAL STATE

1.1 **Purpose.** This record establishes, for the first time in the NP-13 governance corpus, the governed **definition of D2** — its purpose, scope, internal decision structure (D2-A / D2-B / D2-C), allocation of the previously undifferentiated "D2/D3" deferred-matter bucket between D2 and D3, inputs, and outputs.

1.2 **Authorization source.** This gate is convened under the explicit authority of `NP-13-PA-D2-DECISION-01 §7`:

> **PA-D2-01 = 01-A — AUTHORIZE CONVENING OF A FUTURE D2 DEFINITION GATE (NP-13-D2-01)**

and is strictly bounded to the definitional scope authorized at §7.2 of that record:
1. Establishing D2's purpose and subject-matter scope within J-2 / J-3 jurisdiction;
2. Establishing D2's decision structure (D2-A / D2-B / D2-C or equivalent) **without deciding them**;
3. Allocating the deferred "D2/D3" bucket between D2 and D3;
4. Identifying D2's inputs, predecessor dependencies, and intended outputs;
5. Determining D2's own eligibility/completion model only insofar as necessary to define D2 itself.

1.3 **Historical state preserved.**

```text
PREVIOUS STATE (before this record):
D2 was undefined.
No NP-13-D2-* record existed in the authoritative corpus.
D2 = NOT ELIGIBLE was a uniform finding across all predecessors from
  NP-13-PA-D1-DECISION-01 §6.2 onward.
```

That historical state is preserved as fact. This record does not rewrite history to make D2 appear previously defined; it is the originating D2 definition act.

1.4 **Current act.**

```text
CURRENT ACT:
Program Authority now establishes the D2 definition by this record.
```

1.5 **This is NOT a D2 execution gate.** This record does **not**:
- decide D2-A / D2-B / D2-C (those are future separate gates);
- perform any concrete binding, evidence designation, nature selection, or realization-semantics act;
- determine D2 eligibility;
- authorize D2 work beyond what was necessary to produce this definition;
- grant D2 implementation authority;
- implement D2 or D3;
- bind any repository/ref;
- compose the baseline;
- determine membership of any workstream; or
- modify application/runtime code, create persistence, APIs, UI, perform certification, or perform production work.

1.6 **Execution boundary.**

| Boundary | State |
|---|---|
| Repository | **IRR** — `ramkivs/iips-review-recovered` |
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative ref | `origin/main` (`refs/heads/main`) |
| IPD | **OUT OF SCOPE** — not accessed, not modified |
| Production | **OUT OF SCOPE** — untouched |
| Implementation | **NOT AUTHORIZED** (§12) |
| D2 eligibility | **NOT DETERMINED** by this record (§11) |
| D2 work (execution of D2-A/B/C) | **NOT STARTED** (§11) |
| D3 | **NOT ELIGIBLE** (§10) |

1.7 **Git workflow is not governance.** Branch creation, commit, push, pull request, and merge are **publication mechanics**. They create no implementation authority, decide no D2-A/B/C dimension, establish no D2 eligibility, and grant no implementation authority.

---

## 2. D2 PURPOSE

2.1 **D2 is the Baseline Institutional Establishment gate.**

D2's governed purpose is to **establish the concrete governance realization framework** for the governed object defined by D1. After D1 established *what* the governed object is (D1-B), *how* it is identified and how its identity persists over time (D1-C), and *what model* governs binding, ref semantics, evidence, and continuity (G-O-3(b) A–G), D2 is the gate that **instantiates that model** — that is, it establishes the *actual* institutional choices within which composition (J-2) and membership (J-3) can subsequently be determined at D3.

2.2 **What D2 answers.** D2 answers:

> (a) **What is the structural nature of the baseline?** (M1 single-ref / M2 multi-ref / M3 ref-independent artifact set — selected from among the alternatives deferred at `NP-13-D0-01 §4.3` and `NP-13-D1-01 §7.6`.)
>
> (b) **To what concrete operational ref is the baseline bound, and what is its initial authoritative evidence coordinate?** (The concrete E-3 act that G-O-3(b) A–G expressly deferred — see `NP-13-GO3B-DECISION-01 §2.3.4`, §6.)
>
> (c) **What are the realization semantics and how are durability conventions reconciled?** (Realization semantics deferred at `NP-13-D1-01 §6.6`, §7.13; C-1/C-2 unreconciled since `NP-13-D0-01 §4.12`.)

2.3 **What D2 does NOT answer.** D2 does **not** answer:
- *What workstreams compose the baseline?* (That is J-2 composition, D3.)
- *What is the positive membership test for individual artifacts, commits, or workstreams?* (That is J-3 membership, D3.)
- *What is the membership status of NP-09, NP-10, NP-11, NP-12, or NP-13?* (D3.)
- *How is the NP-13 `034384fb…` / `fa9862c9…` divergence adjudicated?* (D3.)
- *How is the NP-09 special case (A/B/C/D) resolved?* (D3.)
- *What code, configuration, persistence, API, UI, runtime, or provider implementation instantiates the baseline?* (Implementation authority, not any D-gate.)

2.4 **Distinction from D1 and D3.**

| Gate | Governed question | Subject matter |
|---|---|---|
| **D1** | *What is the governed object, and how does its identity persist?* | J-1 **definition** — form, object definition, identity/lifecycle semantics, binding model |
| **D2** | *Within what concrete institutional framework will composition and membership be determined?* | Baseline **institutional establishment** — nature selection, concrete binding & initial evidence, realization semantics, durability reconciliation |
| **D3** | *What composes the baseline, and what is/is not a member?* | J-2 **composition** + J-3 **membership** — per-workstream membership, positive test, divergence adjudication, NP-09/10/11/12/13 membership |

2.5 **Not an implementation phase.** D2 is a governance/definition gate, not an implementation phase. D2's outputs are governance decisions (nature, binding, evidence coordinate, realization semantics, durability reconciliation). They are not implementation artifacts and do not by themselves authorize any code change.

2.6 **Not an eligibility decision.** Defining D2 does not make D2 eligible. D2 eligibility remains to be determined by a later explicit Program Authority act after this definition is durable (§11).

2.7 **Corpus-support classification.**

| Element of purpose | Classification |
|---|---|
| D2 is downstream of D1 in series D0→D1→D2→D3 | EXPLICITLY ESTABLISHED (`NP-13-D1-01 §9.1`) |
| D2 sits within J-2/J-3 jurisdiction (D1 completed J-1) | DERIVED FROM EXISTING GOVERNANCE (`NP-13-D0-01 §2.2`; `NP-13-PA-D2-DECISION-01 §7.2`) |
| D2's specific purpose = Baseline Institutional Establishment (nature + binding/evidence + realization/durability) | **NEW PROGRAM-AUTHORITY DEFINITION** (this record) |
| Exclusion of implementation/certification/production from D2 | EXPLICITLY ESTABLISHED (all prior NP-13 records uniformly exclude these) |
| D2 does not itself decide D2-A/B/C | DERIVED FROM EXISTING GOVERNANCE (`NP-13-PA-D2-DECISION-01 §7.2` item 2: "establishing D2's decision structure … without deciding them") |

---

## 3. D2 SCOPE

3.1 **In scope.** The following governance concerns belong to D2:

| # | In scope | Basis for allocation |
|---|---|---|
| S-1 | Selection of baseline nature (**M1 / M2 / M3**) | Deferred at D0 §4.3 and D1 §7.6; nature selection is a precondition for composition, not itself a composition act |
| S-2 | Concrete operational-ref **binding** (repository + ref) under G-O-3(b) E-3 | G-O-3(b) established the *model* (A–G) but explicitly deferred any actual binding to a separate explicit act (`NP-13-GO3B-DECISION-01 §2.3.4, §6`) |
| S-3 | **Initial authoritative evidence coordinate** designation (Git tree, per F-3) at the point of binding | G-O-3(b) established evidence class (tree = primary, commit = supporting) but no initial designation (`NP-13-GO3B-DECISION-01 §4.4.4, §7`) |
| S-4 | **Realization semantics** — what governance/realization state establishes contribution membership; whether merged, reachable, or explicitly accepted state is required; relationship between governance identity and runtime identity | Deferred at D1 §6.6, §7.13; GO3B §4.4.3 explicitly states realization coordinate ≠ realization semantics |
| S-5 | **C-1 / C-2 durability-convention reconciliation** | Unreconciled since D0 §4.12 / D1 §8.4; D2 is the gate that establishes the binding/durability framework and therefore is the appropriate place to reconcile these |
| S-6 | D2-A / D2-B / D2-C sub-gate structure (defined in §4) | Authorized by PA-D2-01 §7.2 |
| S-7 | D2 completion model (necessary conditions, analogous to CM-B for D1) — defined only insofar as necessary to determine when D2 itself becomes complete | Authorized by PA-D2-01 §7.2 item 5; does not itself determine D2 eligibility for D3 |

3.2 **Out of scope.** The following must **not** be treated as D2:

| # | Out of scope | Reason / Destination |
|---|---|---|
| X-1 | J-2 **composition** decisions (what adds/removes members; composition acts) | D3 (J-2) |
| X-2 | J-3 **positive membership test** for artifacts/commits/workstreams | D3 (J-3) |
| X-3 | **NP-09 / NP-10 / NP-11 / NP-12 / NP-13 membership** determinations | D3 (per-workstream membership) |
| X-4 | **NP-13 divergence** adjudication (`034384fb…` / `fa9862c9…`) | D3 |
| X-5 | **NP-09 special case** (A/B/C/D) | D3 |
| X-6 | D2 **eligibility** determination for work/execution | A later explicit PA gate after this definition is durable (§11) |
| X-7 | D2 **authorization** to perform the D2-A/B/C sub-decisions | A later explicit PA gate (convening authorization for the definitional gate was granted by PA-D2-01 = 01-A; executing each sub-decision requires its own authorization) |
| X-8 | D2 **implementation authority** | Separately governed; not granted by any record |
| X-9 | D3 eligibility, D3 definition, or D3 authorization | D3 remains NOT ELIGIBLE (§10) |
| X-10 | Runtime implementation, persistence, API, UI, provider, security, certification, release, production | Excluded from jurisdiction entirely (NP-13-D0-01 §3) |
| X-11 | Identity-system / identifier implementation (D1-C mechanics) | D1-C governs logical semantics only; implementation is separately governed |
| X-12 | Reopening D1 or amending any D1 predecessor | Preserved unchanged (§14) |

3.3 **Boundary conditions.**

| Boundary | Separation rule |
|---|---|
| **D1 ↔ D2** | D1 defines the *governed object, its identity/lifecycle semantics, and the binding/evidence model*. D2 *instantiates* that model — it selects nature, performs concrete binding, designates initial evidence, establishes realization semantics, reconciles durability. D1 is closed; D2 does not reopen D1-A/D1-B/D1-C/G-O-3(b). |
| **D2 ↔ D3** | D2 establishes the **institutional framework** (nature, binding, evidence, realization rules, durability). **D3 operates within that framework** to determine composition and membership. D2 must be complete before D3 composition/membership questions can be answered coherently (framework must exist before membership can be evaluated against it). |
| **D2 ↔ Implementation** | D2 outputs are **governance decisions**, not implementation artifacts. A D2 decision (e.g., "bound to operational ref = `origin/main`") names a governance coordinate; it does not deploy, configure, or alter software. Implementation requires its own separate authority that is not granted by any D-gate. |
| **D2 ↔ Certification/Production** | Certification and production are outside NP-13's bounded non-production jurisdiction entirely (D0 §2.4, §3.2–§3.4). D2 does not cross these boundaries. |

3.4 **Corpus-support classification (scope).**

| Scope element | Classification |
|---|---|
| M1/M2/M3 nature selection allocated to D2 | DERIVED (D0 §4.3; D1 §7.6 deferred them; they are institutional-framework preconditions for composition, not themselves composition acts) |
| Concrete binding & initial evidence allocated to D2 | DERIVED (G-O-3(b) §2.3.4, §4.4.4, §6 expressly deferred concrete acts to separate explicit acts; these establish where composition is coordinated, not what is composed) |
| Realization semantics allocated to D2 | DERIVED (D1 §6.6 deferred; GO3B §4.4.3 explicitly separates realization coordinate (D2-B) from realization semantics; semantics govern "what counts as contributed" and therefore bridge institutional framework and membership testing) |
| C-1/C-2 reconciliation allocated to D2 | DERIVED (the conflict is between "main as authoritative publication" and "branch carrying the authorized implementation"; D2 resolves the binding and therefore is where the reconciliation must occur) |
| Composition/membership/NP-* statuses/divergence/NP-09 special case allocated to D3 | DERIVED (these are J-2/J-3 subject matters by D0 §2.2; they presuppose an established framework and are explicitly "NOT DECIDED" / deferred in D1) |
| Implementation/certification/production excluded | EXPLICITLY ESTABLISHED (D0 §3 uniformly) |
| S-6, S-7 (D2-A/B/C structure, D2 completion model) | **NEW PROGRAM-AUTHORITY DEFINITION** (authorized by PA-D2-01 §7.2 items 2 and 5) |

---

## 4. D2-A / D2-B / D2-C STRUCTURE

4.1 **Three dimensions.** D2 is structured into three sub-decisions, **D2-A**, **D2-B**, and **D2-C**, each defined below. This structure is established by this definition record; no prior corpus record defined D2-A/B/C. The dimensions do **not** mechanically mirror D1-A/B/C (form/object/identity) — they are tailored to D2's institutional-establishment purpose.

4.2 **Each sub-decision requires its own future explicit Program Authority act.** Consistent with the corpus's uniform "every exercise requires its own explicit act" discipline (D0 §2.3; D1-PREREQ §4; PA-D1-DECISION §6.2), none of D2-A / D2-B / D2-C is decided by this record.

### 4.3 D2-A — Baseline Nature Selection

| Attribute | Value |
|---|---|
| **Name** | D2-A — Baseline Nature Selection |
| **Purpose** | Select among the three alternative baseline-nature formulations (**M1** single repository/ref · **M2** multi-ref composition · **M3** ref-independent governed artifact set) that have remained UNSELECTED since D0 §4.3. |
| **Question it answers** | *What is the structural nature of the active non-production IIPS feature baseline? Is it anchored to a single operational ref (M1), composed across multiple refs (M2), or defined independently of any ref (M3)?* |
| **Inputs** | D1-A (G-O-3 selected form), D1-B (540-byte definition), D1-C identity/lifecycle policy, G-O-3(b) A–G model, D0 §4.3 options, prior corpus precedent for M1/M2/M3 (none selected; all recorded but unranked). |
| **Outputs** | (a) Selected M-option (M1 / M2 / M3); (b) statement of what that selection means in the context of the G-O-3 dual-coordinate model; (c) identification of consequences of the selection for D2-B (binding) and D2-C (realization semantics). |
| **In scope** | Selecting one of M1/M2/M3; stating its consequences for subsequent D2 dimensions; recording why alternatives were not selected. |
| **Out of scope** | Concrete ref binding (that is D2-B); realization semantics (D2-C); any composition act (D3); declaring M-selection "complete" without a PA completion act. |
| **Relationship to D2** | D2-A is logically prior to D2-B and D2-C because the structural nature determines what "binding" and "realization" mean. Under the non-inference discipline (D1-PREREQ §4), this logical priority does not automatically establish a gate-ordering prerequisite without an explicit ordering act; however, the natural reading is that D2-A precedes D2-B/D2-C. |
| **Relationship to D3** | D2-A's output determines what "membership" means in D3 (a ref member under M1 is a different object than an artifact-set member under M3). D3 cannot coherently determine membership until D2-A is decided. |
| **Corpus classification** | The existence of M1/M2/M3 as alternatives is EXPLICITLY ESTABLISHED (D0 §4.3, D1 §6.1/§7.6). Allocation of M-selection to D2-A is DERIVED (institutional-framework choice, prior to composition). Label "D2-A" and the dimension semantics are **NEW PROGRAM-AUTHORITY DEFINITION**. |

### 4.4 D2-B — Operational Ref Binding & Initial Authoritative Evidence Designation

| Attribute | Value |
|---|---|
| **Name** | D2-B — Operational Ref Binding & Initial Authoritative Evidence Designation |
| **Purpose** | Perform the **concrete** E-3 explicit act contemplated (but expressly NOT performed) by G-O-3(b): bind the governed object to a specific repository + mutable operational ref, and designate the initial immutable authoritative evidence coordinate (Git tree per F-3). |
| **Question it answers** | *Given the nature selected in D2-A, what is the operational ref (repository + ref name) to which the baseline is bound, and what Git tree constitutes the initial authoritative evidence coordinate at the point of binding?* |
| **Inputs** | D2-A output (selected M-nature); G-O-3(b) A (binding required), B-3 (dual-coordinate model), C-4 (deliberately separated roles), D-3 (evidence refresh is explicit, not automatic), E-3 (explicit binding + verification + historical supersession), F-3 (tree primary / commit supporting); G-4/G-5 continuity/trigger rules; D1-C stable identifier and lifecycle semantics; live verified state of candidate repositories/refs at the time of the act. |
| **Outputs** | (a) Named repository; (b) Named operational ref (mutable coordinate); (c) Designated initial authoritative evidence coordinate — a specific Git tree SHA, with supporting commit SHA per F-3; (d) Effective point of binding; (e) Verification evidence (independent-mechanism agreement as required by E-3); (f) Preservation statement (no prior binding is erased; supersession is historical per F-3.4). |
| **In scope** | One binding act (the first binding); recording the target; recording the initial evidence coordinate; verifying the target by independent mechanisms; recording supersession semantics for future re-binding. |
| **Out of scope** | Selecting nature (D2-A); establishing realization semantics (D2-C); performing future evidence-refresh acts (those are separate D-3 acts post-D2); composition (D3); any "automatic" binding to current `origin/main` (that would violate D-3 rule 6 — mechanical Git operations are not governance acts; binding requires an explicit E-3 act with verification). |
| **Relationship to D2** | D2-B is the concrete instantiation of G-O-3(b). It cannot be performed coherently before D2-A selects nature; it is a D2, not D3, act because it establishes the framework within which D3 membership is evaluated. |
| **Relationship to D3** | D3 composition/membership determinations are made **relative to** the binding and initial evidence coordinate established by D2-B. D3 cannot produce durable membership findings without a bound coordinate. |
| **Corpus classification** | The requirement that "any actual binding … requires its own explicit act under E-3" is EXPLICITLY ESTABLISHED (GO3B §2.3.4). Allocation of that act to D2-B is DERIVED (binding is institutional, not composition). The label "D2-B" and the specific output list are **NEW PROGRAM-AUTHORITY DEFINITION**. |

### 4.5 D2-C — Realization Semantics & Durability Reconciliation

| Attribute | Value |
|---|---|
| **Name** | D2-C — Realization Semantics & C-1/C-2 Durability Reconciliation |
| **Purpose** | Establish the realization semantics that GO3B §4.4.3 explicitly deferred ("Realization semantics remain NOT DECIDED"), and reconcile the C-1 / C-2 durability-convention tension that has been carried unreconciled since D0 §4.12. |
| **Question it answers** | *(Realization)* What state of the operational ref / evidence coordinate establishes that a piece of work contributes to the governed baseline — merged-to-ref? reachable in tree? explicitly accepted by a governance act? something else? And how do governance identity and runtime identity relate? *(Durability)* Given C-1 ("authoritative closure requires publication to IRR `main`; session branches and open PRs are not authoritative") vs C-2 ("place governance records on the branch carrying the authorized implementation"), how are durable NP-13 records to be published and recognized as authoritative? |
| **Inputs** | D2-A output (nature); D2-B output (binding/evidence); D1-B governed-object definition; D1-C identity/lifecycle policy; G-O-3(b) B-3/C-4/D-3/E-3/F-3/G-4/G-5; C-1 convention (NP-12-N4-CANONICAL-BYTE-GRAMMAR); C-2 convention (NP-13-AUTH-02 §4 placement rule); prior NP-13 publication history (PRs #12–#32) as evidence of how the conventions have been used, not as a reconciliation. |
| **Outputs** | (a) Realization-semantics rule set (contribution-membership criteria, governance-vs-runtime identity relationship, unmerged-work posture); (b) C-1 / C-2 reconciliation: an explicit rule stating which convention (or combination, or priority) governs future NP-13 publications; (c) Conformance statement showing how future gates must publish to be durable under the reconciled rule. |
| **In scope** | Stating realization rules; selecting among the realization options that D1 deferred; reconciling C-1 vs C-2; stating publication/durability mechanics for future NP-13 governance records. |
| **Out of scope** | Concrete runtime deployment; provider/security decisions; any implementation of identity, persistence, or rendering; D3 membership determinations (which *apply* realization semantics but do not define them); code changes of any kind. |
| **Relationship to D2** | D2-C is the dimension of D2 that translates institutional choices (D2-A, D2-B) into operating rules. It is the bridge to D3. |
| **Relationship to D3** | D3 applies D2-C's realization semantics to determine membership. D3 must not re-decide realization semantics. |
| **Corpus classification** | The deferral of realization semantics is EXPLICITLY ESTABLISHED (D1 §6.6; GO3B §4.4.3, §10.4). The C-1/C-2 tension is EXPLICITLY ESTABLISHED (D0 §4.12; D1 §8.4; GO3B-DECISION §12.3.4). Allocation of both to D2-C is DERIVED (both concern the "how" of institutional operation, not composition or membership). Combining them into a single dimension D2-C is **NEW PROGRAM-AUTHORITY DEFINITION**, justified by their shared character: both govern how the D2 framework *operates* at the publication/realization seam. The label "D2-C" is **NEW PROGRAM-AUTHORITY DEFINITION**. |

4.6 **Prerequisite ordering among D2-A/B/C.** This definition record **does not** establish a rigid prerequisite ordering among D2-A, D2-B, and D2-C. Logical dependencies are noted above (D2-A naturally precedes D2-B/D2-C; D2-C applies outputs of D2-A and D2-B) but, consistent with `NP-13-D1-PREREQ-01 §4`, logical priority does not by itself constitute a governance prerequisite. Ordering among D2-A/B/C remains for a future D2 prerequisite-ordering decision, or for the D2 eligibility gate to address when eligibility is considered.

4.7 **No D2 sub-decision is decided here.** D2-A, D2-B, and D2-C each remain **UNDECIDED** at this gate. This record defines their shape; it does not fill them in.

---

## 5. D2 vs D3 ALLOCATION

5.1 **Allocation table.** The previously undifferentiated "D2/D3 conditions" bucket (first identified at `NP-13-PA-D1-DECISION-01 §7.1` and carried through all subsequent records without partition) is hereby **explicitly allocated** as follows:

| # | Concern | D2 | D3 | Neither / Future Decision | Basis |
|---|---|:---:|:---:|:---:|---|
| A-1 | Baseline nature — M1/M2/M3 selection | **✓ D2-A** |  |  | DERIVED: institutional precondition; deferred at D0 §4.3 / D1 §7.6 |
| A-2 | G-O-3(b) model (A required binding; B-3 dual coordinate; C-4 separated roles; D-3 explicit evidence refresh; E-3 explicit act; F-3 tree primary; G-4/G-5) | (pre-exists, preserved) |  |  | Already decided (`NP-13-GO3B-DECISION-01`) |
| A-3 | Concrete operational-ref binding (E-3 act) | **✓ D2-B** |  |  | DERIVED: GO3B §2.3.4 expressly deferred a concrete binding act; framework-level, not composition |
| A-4 | Initial authoritative evidence-coordinate designation | **✓ D2-B** |  |  | DERIVED: GO3B §4.4.4, §7; required counterpart to binding |
| A-5 | Future evidence-refresh acts (post-binding) | **Neither** (separate D-3 acts within D2-C's operating rules, after D2 is complete) |  | **Future Decision** | DERIVED: D-3 rule 5; not part of the initial definition gate |
| A-6 | Future re-binding acts (post-initial) | **Neither** (separate E-3 re-binding acts, governed by D2-C rules) |  | **Future Decision** | DERIVED: E-3 governs supersession |
| A-7 | Realization semantics (contribution-membership criteria; governance vs runtime identity) | **✓ D2-C** |  |  | DERIVED: D1 §6.6; GO3B §4.4.3 deferred |
| A-8 | C-1 / C-2 durability convention reconciliation | **✓ D2-C** |  |  | DERIVED: D0 §4.12; D1 §8.4; belongs at the binding/durability seam |
| A-9 | J-2 **Composition** — acts by which the baseline is composed; what adds/removes members |  | **✓** |  | EXPLICIT: D0 §2.2 J-2; operates within the D2 framework |
| A-10 | J-3 **Positive membership test** — what qualifies as a member; what is not a member |  | **✓** |  | EXPLICIT: D0 §2.2 J-3 |
| A-11 | **NP-09 membership** determination (incl. the NP-09 special case A/B/C/D) |  | **✓** |  | DERIVED: per-workstream membership; D1 §7.9 |
| A-12 | **NP-10 membership** determination |  | **✓** |  | D1 §7.10 |
| A-13 | **NP-11 membership** determination |  | **✓** |  | D1 §7.10 |
| A-14 | **NP-12 inclusion/exclusion** (`NP-12 STATUS = NOT DETERMINED`) |  | **✓** |  | D1 §6.2; preserved verbatim until D3 |
| A-15 | **NP-13 divergence** adjudication (`034384fb…` vs `fa9862c9…`) |  | **✓** |  | D1 §6.4; explicit non-adjudication preserved |
| A-16 | **NP-09 special case** (A one-off / B standing / C superseded / D independently valid) |  | **✓** |  | D0 §4.9; D1 §7.9 |
| A-17 | Divergent / unmerged eligibility (positive test) |  | **✓** |  | D0 §4.7; presupposes realization semantics (D2-C) |
| A-18 | Terminology harmonization (IIPS vs IRR) |  |  | **Neither** (authorized only by a separate explicit act; not allocated to either D2 or D3) | D1 §5.3; no allocation forced |
| A-19 | Reconciliation record `NP-13-RECON-01` |  |  | **Neither** (remains NOT ESTABLISHED; may arise from D3 or a separate act) | D0 §3.12; preserved |
| A-20 | Implementation / code / runtime / persistence / API / UI |  |  | **Neither** (separate implementation authority, not D-series) | D0 §3.1; EXPLICIT across all records |
| A-21 | Certification / release / provider / identity / security / production authority |  |  | **Neither** (outside NP-13 jurisdiction entirely) | D0 §3.2–§3.7 |
| A-22 | D3 definition and D3 eligibility |  | (own future definition/eligibility acts) | **Future Decision** | D3 remains NOT ELIGIBLE; D3 not defined here |

5.2 **Allocation principles.**

- **Framework vs operation:** D2 establishes the *framework* (nature, binding/evidence, realization rules, durability). D3 *operates within* that framework to perform composition and membership.
- **Precondition ordering:** D2 must be complete before D3 can coherently determine membership (you cannot decide what is a member until you know what kind of thing the baseline is, where it is bound, what evidence anchors it, and what counts as contributing). D2 completion is a necessary (but not automatically sufficient) precondition for D3 eligibility.
- **No silent absorption:** D2 does not absorb J-2/J-3 matters, and D3 does not absorb framework matters. The boundary is drawn at "what framework" vs "what is in the baseline under that framework."
- **D3 is NOT defined by this record.** Only the *boundary* is established; D3's own purpose, structure, and eligibility model remain for a future D3 definition gate. D3 remains **NOT ELIGIBLE** (§10).

5.3 **Corpus classification.** Allocation rows A-1 through A-22 are **NEW PROGRAM-AUTHORITY DEFINITION** (the corpus never partitioned the D2/D3 bucket, as was confirmed at NP-13-PA-D2-DECISION-01 §4.2 row "These deferred items are collectively referred to as 'D2/D3 conditions' — never partitioned"). The allocation is grounded in EXISTING GOVERNANCE (the D0 J-1/J-2/J-3 jurisdiction partition and D1's explicit deferrals), but the specific partition is a new act.

---

## 6. D2 INPUTS

6.1 **Existing governed inputs.** D2 consumes only already-established governed artifacts:

| # | Input | Type | Source | Corpus classification |
|---|---|---|---|---|
| I-1 | D0 jurisdiction record (J-1/J-2/J-3; exclusions; deferred list) | Existing governed artifact | `NP-13-D0-01` (blob `8caa2d3e…`) | EXISTING GOVERNED INPUT |
| I-2 | D1-A (G-O-3 form selection) | Existing governed decision | `NP-13-D1-01 §2.1` (blob `3468cdaa4…`) | EXISTING GOVERNED INPUT |
| I-3 | D1-B verbatim governed-object definition (540 bytes, SHA-256 `29f2d5f6…dcc7`) | Existing governed definition | `NP-13-D1-01 §3.1–§3.2` | EXISTING GOVERNED INPUT |
| I-4 | D1-C identity/lifecycle semantic policy (10/10 resolved) | Existing governed semantics | `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01` (blob `068ae2a0…`) | EXISTING GOVERNED INPUT |
| I-5 | G-O-3(b) A–G decision set (binding/coordinate/evidence/refresh/supersession model) | Existing governed model | `NP-13-GO3B-DECISION-01` (blob `58e0df87…`) | EXISTING GOVERNED INPUT |
| I-6 | D1 necessary-conditions completion model (CM-B); D1 completion fact | Existing governed state | `NP-13-D1-CM-B-DECISION-01` (blob `2cc757ec…`); `NP-13-PA-D1-COMPLETION-01` (blob `23005923…`) | EXISTING GOVERNED INPUT |
| I-7 | PA-D1 decisions (scope model — what is/isn't D1; D2/D3 eligibility non-inference) | Existing governed decisions | `NP-13-PA-D1-DECISION-01` (blob `596db534…`) | EXISTING GOVERNED INPUT |
| I-8 | PA-D2 decision (convening authorization for this D2-01 gate; bounded scope) | Existing governed authority | `NP-13-PA-D2-DECISION-01` (blob `153ab5df…`) | EXISTING GOVERNED INPUT |
| I-9 | D1 prerequisite-ordering record (non-inference discipline) | Existing governed boundary | `NP-13-D1-PREREQ-01` (blob `5fea4a54…`) | EXISTING GOVERNED INPUT |
| I-10 | Live verified state of candidate refs at the time of each future D2 sub-decision | Empirical fact (observed, not manufactured) | Independent-mechanism live verification at the future gate | EXISTING GOVERNED INPUT (observed at time of act, per E-3) |

6.2 **No new mechanisms are created.** No persistence store, identity system, API, runtime service, or UI is created to provide inputs. Inputs I-1 through I-9 are durable governance records already on `origin/main`. Input I-10 is read-only empirical observation at future gates, exactly as prior gates performed live verification.

6.3 **What are NOT inputs.**

- Code or runtime state of `iips-platform` / IPD (out of scope; not accessed).
- Any new evidence pipeline or metadata system.
- Generic engineering assumptions about "what baselines usually look like."
- Implementation artifacts produced outside the governance process.

---

## 7. D2 OUTPUTS

7.1 **Outputs of D2 as a whole** (i.e., after all three sub-decisions D2-A/B/C have been decided and a D2 completion act is rendered):

| # | Output | Meaning | Type | Required for D3 eligibility? | Affects D3 allocation? |
|---|---|---|---|---|---|
| O-1 | **D2-A decision record** | Selected M-nature (M1/M2/M3) with consequences stated | Governance decision | Yes — must exist before D2-B/D2-C are coherent and before D3 | Yes (determines what "member" means) |
| O-2 | **D2-B decision record** | Concrete binding (repository + operational ref) + initial authoritative evidence coordinate (tree + supporting commit) per E-3 | Governance decision (E-3 act) | Yes — D3 must have a bound coordinate | Yes (determines where membership is evaluated) |
| O-3 | **D2-C decision record** | Realization semantics + C-1/C-2 reconciliation | Governance decision (operating rules) | Yes — D3 must know what counts as contributed and how to publish durably | Yes (supplies rules D3 applies) |
| O-4 | **D2 completion record** (analogous to `NP-13-PA-D1-COMPLETION-01`) | Records that D2 is COMPLETE on its own necessary-conditions model; identifies any remaining gaps or deferrals; preserves the strict eligibility/authorization/implementation distinction for D3 | Durable completion record | Yes — provides the closed D2 baseline against which D3 eligibility is evaluated | Yes (is the D3 predecessor record) |

7.2 **Outputs are governance artifacts.** Every D2 output is a durable governance record in `docs/integration/` on `origin/main`, consistent with the NP-13 durability convention (C-1 as reconciled by D2-C). No code, configuration, or runtime artifact is a D2 output.

7.3 **Output of this definition record.** This record (`NP-13-D2-01-DEFINITION-01`) is itself a D2 output: it defines D2 and is the prerequisite artifact that any future D2-A / D2-B / D2-C sub-gate cites as its governing basis. This record does NOT produce O-1 through O-4; those are outputs of future gates.

7.4 **No eligibility output.** This record does **not** produce a D2 eligibility decision. Defining D2 is a prerequisite to evaluating eligibility; it does not itself determine eligibility. §11 states this explicitly.

7.5 **No implementation output.** No implementation, runtime, persistence, API, UI, or deployment artifact is produced by D2.

7.6 **Corpus classification for outputs.** O-1/O-2/O-3 are **NEW PROGRAM-AUTHORITY DEFINITION** (their labels and content requirements are new, though they correspond to acts already called for by existing model decisions — e.g., E-3 binding). O-4 is DERIVED from the D1 completion-model precedent (CM-B + PA-D1-COMPLETION-01) applied to D2.

---

## 8. D2 COMPLETION MODEL (DEFINITIONAL)

8.1 **Necessary conditions.** Per the CM-B precedent (`NP-13-D1-CM-B-DECISION-01`) applied to D2, the following are *necessary* conditions for D2 to be complete. Like CM-B, this is a **necessary-conditions-only / non-exhaustive** model; it does not constitute an exhaustive or sufficient test, and does not foreclose the Program Authority from adding further necessary conditions at future D2 prerequisite gates.

| # | Necessary condition for D2 completion | Source |
|---|---|---|
| D2-CM-1 | D2-A decided (M-nature selected) and durably published | This record §4.3 |
| D2-CM-2 | D2-B decided (binding + initial evidence) via a valid E-3 act, durably published | This record §4.4; GO3B §6 |
| D2-CM-3 | D2-C decided (realization semantics + C-1/C-2 reconciled), durably published | This record §4.5 |
| D2-CM-4 | All predecessor NP-13 records preserved unchanged (no amendment/reinterpretation) | Precedent across all NP-13 records |
| D2-CM-5 | G-4 / G-5 continuity and trigger-class boundaries preserved unchanged | GO3B §8; PA-D1C-SEMANTIC-RESOLUTION §4 |
| D2-CM-6 | A later explicit Program Authority D2 completion act closes the model (analogous to PA-D1-COMPLETION for D1) | CM-B C6 precedent |

8.2 **Non-exhaustive.** These conditions are necessary. They are not asserted to be exhaustive. Additional necessary conditions may be identified by later prerequisite-ordering or additional-condition investigations, consistent with the CM-B model.

8.3 **No automatic completion.** As with D1, D2 does not complete automatically upon D2-A/D2-B/D2-C being decided; an explicit PA completion act (D2-CM-6) is required.

8.4 **This record does not complete D2.** This record defines D2; it does not perform D2-A/B/C and does not render a D2 completion decision.

---

## 9. D2 GATE-SEQUENCE SKETCH (NON-BINDING)

9.1 The following is a **non-binding** sketch of the gate sequence through which D2 will likely proceed. It is provided for orientation only and does NOT constitute a gate-ordering decision. Consistent with `NP-13-D1-PREREQ-01 §4`, logical adjacency does not create a governance dependency. An explicit future D2 prerequisite-ordering act may reorder, parallelize, or restructure this sequence.

1. **D2-01-DEFINITION** (this record) — defines D2. **Complete.**
2. **D2 prerequisite-ordering investigation** (analogous to NP-13-D1-PREREQ-01) — determines ordering among D2-A/D2-B/D2-C; optional if Program Authority proceeds case by case.
3. **D2-A gate** — selects baseline nature (M1/M2/M3).
4. **D2-B gate** — performs operational-ref binding + initial evidence designation (E-3 act).
5. **D2-C gate** — establishes realization semantics + reconciles C-1/C-2.
6. **D2 additional-condition investigation** (analogous to the PA-D1 additional-condition investigation) — identifies any further necessary conditions beyond D2-CM-1…D2-CM-5.
7. **PA-D2 completion gate** — renders the explicit D2 COMPLETE decision (discharging D2-CM-6).
8. **A later D2-eligibility/authorization gate for D3** — determines whether D3 is eligible and authorizes D3 work. This is **not** part of D2 itself.

9.2 **Not a schedule.** Nothing in §9 constitutes a commitment, schedule, or authorization to open any of gates 2–8. Each requires its own explicit authorization.

---

## 10. D3 STATUS

10.1 **D3 = NOT ELIGIBLE** remains in full force. Nothing in this record defines D3, allocates internal structure to D3, establishes D3 eligibility, authorizes D3 work, or grants D3 implementation authority.

10.2 **D3 remains undefined** except for the boundary allocations established in §5 (which identify the *class* of subject matters allocated to D3 but do not define D3's internal purpose, structure, inputs, or outputs).

10.3 **D3 definition is a future act.** A future D3 definition gate will be required; this record does not convene or authorize it.

---

## 11. DEFINITION ≠ ELIGIBILITY ≠ AUTHORIZATION ≠ IMPLEMENTATION

11.1 This gate establishes **only** the D2 definition. It does NOT establish:

```text
D2 eligibility              = NOT DETERMINED BY THIS GATE
D2 work (execution of D2-A/B/C) = NOT STARTED
D2 authorization            = NOT GRANTED beyond the definitional act already performed by this record
D2 implementation authority = NOT GRANTED
Implementation generally    = NOT AUTHORIZED
```

11.2 **A later explicit Program Authority act must determine D2 eligibility.** Defining D2 is a necessary precondition to evaluating D2 eligibility. It is not itself an eligibility determination. The future eligibility act will verify that D2-A/B/C are ready to proceed, identify any prerequisite investigations, and — if Program Authority selects eligibility — authorize D2 work to begin.

11.3 **Analogy to D1.** The relationship between this definition record and future D2 execution is strictly analogous to the relationship between `NP-13-D1-01` (which defined D1-A/D1-B/D1-C) and the subsequent D1 gates that resolved each sub-decision, culminating in `NP-13-PA-D1-COMPLETION-01`. Definition precedes execution; it does not authorize it.

11.4 **No D2 work is performed.** No D2-A nature selection, no D2-B binding/evidence act, no D2-C realization/durability decision, and no implementation activity has been performed, started, scheduled, or committed to by this record.

---

## 12. EXPLICIT NON-ACTIONS AND EXCLUSIONS

12.1 This record does **NOT**:

- decide D2-A / D2-B / D2-C;
- select M1/M2/M3;
- bind any repository/ref;
- designate any evidence coordinate;
- establish realization semantics;
- reconcile C-1/C-2 (that reconciliation itself is D2-C's job);
- determine D2 eligibility;
- authorize D2 execution work;
- grant implementation authority;
- compose the baseline or determine any membership;
- adjudicate the NP-13 divergence;
- decide NP-09/NP-10/NP-11/NP-12/NP-13 membership;
- resolve the NP-09 special case;
- define D3;
- modify any predecessor NP-13 record;
- modify any code, configuration, runtime, persistence, API, UI, provider, security, certification, release, or production artifact;
- access or mutate IPD (zero mutations);
- create any implementation mechanism, persistence, identity system, or service.

12.2 **IPD out of scope; production out of scope.** Zero mutations.

---

## 13. EFFECTIVE POINT AND DURABILITY

13.1 **Effective point.** This definition is effective upon durable publication to `ramkivs/iips-review-recovered @ refs/heads/main` with independent remote verification.

13.2 **Durability pending.** At the time of this record's authoring, the session in which it was authored does not have live remote push capability (remote GitHub operations for this session are closed following the merge of PR #32). The artifact is committed to the session branch `arena/01a101e0-iips-review-recovered` and requires push, PR creation, PR merge, and independent remote verification in a subsequent session to achieve durable publication under the IIPS Universal Artifact Durability Invariant. Until that point, durability status is `committed to session branch; NOT YET published to origin/main`, consistent with the C-1 convention carried forward unreconciled (until D2-C).

13.3 **Fail-closed on durability.** Until independent remote verification confirms the commit is reachable from `refs/heads/main` with the expected blob identity, this record does **not** claim durable status.

---

## 14. PREDECESSOR PRESERVATION

14.1 **No predecessor is amended.** All thirteen NP-13 governance records that precede this record in the authoritative corpus are preserved byte-identical at the baseline used for this gate (`origin/main @ bb756c0…`, tree `7f0ef2a1…`):

| Predecessor record | Path | Expected blob |
|---|---|---|
| `NP-13-D0-01` | `docs/integration/NP-13-D0-01.md` | `8caa2d3e8f9564231a51ba053d08ccb19fdbd0bb` |
| `NP-13-D1-01` | `docs/integration/NP-13-D1-01.md` | `3468cdaa4e72ce5d33ecfc219706877a2a319541` |
| `NP-13-D1-C-01` | `docs/integration/NP-13-D1-C-01.md` | `8e9688ed102493a342ada1c6d9f1b3b6d6a58b04` |
| `NP-13-D1-PREREQ-01` | `docs/integration/NP-13-D1-PREREQ-01.md` | `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` |
| `NP-13-GO3B-01` | `docs/integration/NP-13-GO3B-01.md` | `89366b72bdf00d10950a1a90d33f16bd0c978acf` |
| `NP-13-GO3B-DECISION-01` | `docs/integration/NP-13-GO3B-DECISION-01.md` | `58e0df8739cbfef823216c560573bb4d6f43b7e8` |
| `NP-13-PA-D1-DECISION-01` | `docs/integration/NP-13-PA-D1-DECISION-01.md` | `596db534ec73607c69024b82ade542774d406eed` |
| `NP-13-PA-D1C-DECISION-01` | `docs/integration/NP-13-PA-D1C-DECISION-01.md` | `7b5ca0be27dcc7e9e58208964da895dfa23aef46` |
| `NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01` | `docs/integration/NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01.md` | `1dcc14af3bc4937c29b2b97d7f27dc7811bdbb91` |
| `NP-13-D1-CM-B-DECISION-01` | `docs/integration/NP-13-D1-CM-B-DECISION-01.md` | `2cc757ec89617a89187a0acc00147b4d0149514` |
| `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01` | `docs/integration/NP-13-PA-D1C-SEMANTIC-RESOLUTION-01.md` | `068ae2a07c4551c7ce78185dbcd780bcb65fd599` |
| `NP-13-PA-D1-COMPLETION-01` | `docs/integration/NP-13-PA-D1-COMPLETION-01.md` | `230059234abec84de123ce325a0cd8b5f6f70200` |
| `NP-13-PA-D2-DECISION-01` | `docs/integration/NP-13-PA-D2-DECISION-01.md` | `153ab5df4c8e918e98facb42e1d8b2156959f856` |

14.2 **D1-B fidelity pin preserved.** 540 bytes / SHA-256 `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7`.

14.3 **G-4/G-5 preserved.** The G-4 continuity and G-5 explicit-governance-act trigger class are preserved unchanged, per `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01 §4`.

14.4 **Historical state preserved.** The historical fact that "D2 was undefined before this record" is expressly preserved at §1.3. This record is the originating D2 definition act and does not represent itself as anything earlier.

---

## 15. AUTHORITY ATTESTATION

**Program Authority:** Ramki (Ramakrishnan)

**Date:** 2026-10-03

**Decision status:** The D2 definition at §§2–8 is the Program Authority's explicit selection at this gate, rendered after the closed-world investigation at §§1–7 of the NP-13 D2-01 gate was presented. The definition was selected explicitly (purpose-A, struct-ABC, alloc-accept, adopt-full); it was not inferred.

**Approval:**

```text
PA-D2-01 = 01-A (convening authority; discharged by this definition record)

D2 PURPOSE     = Baseline Institutional Establishment
D2 SCOPE       = D2-A nature + D2-B binding/evidence + D2-C realization/durability
D2-A           = Baseline Nature Selection (M1/M2/M3)
D2-B           = Operational Ref Binding & Initial Evidence Designation (E-3 act)
D2-C           = Realization Semantics & C-1/C-2 Durability Reconciliation

D2-vs-D3 ALLOCATION = §5 table (A-1…A-22)
D2 INPUTS      = I-1…I-10 (existing governed inputs only; no new mechanisms)
D2 OUTPUTS     = O-1 D2-A record · O-2 D2-B record · O-3 D2-C record · O-4 D2 completion record

D2 DEFINITION         = ESTABLISHED (by this record)
D2-A / D2-B / D2-C    = DEFINED; NOT YET DECIDED
D2 ELIGIBILITY        = NOT DETERMINED BY THIS GATE
D2 WORK               = NOT STARTED
D2 IMPLEMENTATION     = NOT AUTHORIZED
D3                    = NOT ELIGIBLE
IMPLEMENTATION AUTHORITY = NOT GRANTED
IPD = OUT OF SCOPE / UNTOUCHED
PRODUCTION = OUT OF SCOPE / UNTOUCHED
```

**Attested limitations:**

```text
No D2 sub-decision (D2-A/D2-B/D2-C) is decided by this record.
No D2 eligibility is determined by this record.
No D2 work beyond this definitional act is started.
No D2 implementation or implementation authority is granted.
No D3 definition, eligibility, or authority is established.
No predecessor is amended, reopened, or superseded.
No code, configuration, runtime, persistence, API, or UI is modified.
Production is out of scope. IPD was not accessed and was not modified.
Durability requires publication to origin/main with independent remote verification.
```

**End of `NP-13-D2-01-DEFINITION-01`.**
