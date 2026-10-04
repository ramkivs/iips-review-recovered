# NP-13 — D3 DEFINITION ACT / DECISION FRAMEWORK

## Governance Definition and Decision Framework for the D3 Gate — Prepared Act Text

**Record identifier:** `NP-13-D3-DEFINITION-01`
**Document type:** GOVERNANCE DEFINITION & DECISION FRAMEWORK — prepared act text; **not** a J-2/J-3 decision, **not** a membership determination, **not** an admission act
**Gate:** **NP-13 — D3 DEFINITION ACT / DECISION FRAMEWORK (READ-ONLY GOVERNANCE PREPARATION)**
**Date:** 2026-10-04
**Program Authority:** Ramki (Ramakrishnan) — sole holder of the D0 bounded jurisdiction (J-1 / J-2 / J-3)
**Repository:** IRR — `ramkivs/iips-review-recovered`
**Authoritative baseline reviewed:** `refs/heads/main` @ `14928a21eeeafdeaf1d3959773b238fa38a2c8b8` (root tree `2ab2587482dad577c623163f3ea7d886a9e1d1d1`)
**Predecessor state:** D0 · D1 · D2-DEFINITION · D2-A · D2-B · D2-C — established; **D2 = COMPLETE / DURABLE**
**Status:** **PREPARED / NOT YET DURABLE** — this record is a **workspace draft**; it is **not** published, **not** durable, and **not** authoritative; no governance effect is claimed for it prior to an explicit publication authorization, publication to `refs/heads/main`, and independent remote verification under **C-1**
**Mutation:** **ZERO** — no `git add` / commit / push / PR / merge / tag; no existing record modified; no application/runtime code; no IPD access or mutation
**Authority granted by this record:** **NONE**

> **Boundary statement.** This gate establishes the **framework** for D3 — what D3 is authorized to decide, what it explicitly does not decide, the decision objects, the dimensions of each decision, the required evidence and authority, the sequencing/dependency posture, and the durability requirements. It **does not decide**: J-2 composition; J-3 membership; per-workstream membership; NP-09 treatment; divergence adjudication; unmerged/divergent eligibility; any actual workstream admission; any implementation state. All findings of the D3 investigation are treated as **findings**, re-verified where cited, and are **not** converted into determinations.

> **Fail-closed posture (this record).** Where the corpus does not establish a framework element, it is marked **NOT ESTABLISHED**. No gap is filled with general engineering convention. Where two records conflict, **both are preserved**, with refs, dates, and status identified; none is silently selected.

---

## 1. PURPOSE

### 1.1 Purpose of this act

To establish the **governance definition and decision framework** for D3, so that every subsequent D3 act is: within a stated jurisdiction; addressed to a stated decision object; supported by a stated evidence class; rendered by the stated authority; durably published before durability is claimed; and bounded by explicit non-decisions.

### 1.2 What this act is

| It is | It is not |
|---|---|
| A definition/framework act — it fixes **what** D3 will decide and **how** | A substantive decision — it decides **none** of the D3 subject matters |
| A preparation artifact for Program Authority rendering and future publication | A published or durable record (see §14) |
| A boundary instrument — it names the exclusions and the non-inferences | A composition act, a membership act, an admission act, or a classification of any workstream |

### 1.3 Consequential prohibitions carried into every future D3 act

1. Realization **does not** determine composition or membership (`NP-13-PA-D2-C-…`, `A1-C8`).
2. Unmerged work is **not** realized (`A1-C1`) — a **semantic predicate only**, not a membership outcome (`§14.3`).
3. Membership is **not** to be inferred from ref reachability, evidence-tree inclusion, acceptance-style records, Git topology, or any Git operation (`A1-C9`; corpus-wide non-inference discipline).
4. Each J-2 / J-3 exercise requires its **own explicit act** (`NP-13-D0-01 §2.3`).

---

## 2. D3 JURISDICTION

### 2.1 The jurisdiction this framework operates within (verbatim basis)

`NP-13-D0-01 §2.2` — the bounded jurisdiction of the Program Authority extends to three subject matters "and to nothing beyond them":

| # | Subject matter (verbatim) |
|---|---|
| **J-1** | **Definition** — determining what the active non-production IRR feature baseline *is*: its governed object, its nature, and the terms in which it is expressed *(completed: D1)* |
| **J-2** | **Composition** — determining how that baseline is composed, and by what act or acts |
| **J-3** | **Membership** — determining what is a member of that baseline, what is not, and by what positive test |

`§2.3` — the jurisdiction is **subject-matter bounded, not general**; every exercise **requires its own explicit act**.
`§2.4` — confined to the **active non-production** baseline; confers nothing regarding production.
`§2.5` — establishment of the jurisdiction **decides nothing** within it.
`§2.6` — a D0 jurisdiction act is **not** a baseline-composition act.

### 2.2 D3's allocated subject matter (durable allocation, verbatim rows)

`NP-13-D2-01-DEFINITION-01 §5.1` allocates to **D3**:

| Row | Allocated concern |
|---|---|
| **A-9** | J-2 **Composition** — acts by which the baseline is composed; what adds/removes members |
| **A-10** | J-3 **Positive membership test** — what qualifies as a member; what is not a member |
| **A-11** | **NP-09 membership** determination (incl. the NP-09 special case A/B/C/D) |
| **A-12** | **NP-10 membership** determination |
| **A-13** | **NP-11 membership** determination |
| **A-14** | **NP-12 inclusion/exclusion** (`NP-12 STATUS = NOT DETERMINED`) |
| **A-15** | **NP-13 divergence** adjudication (`034384fb…` vs `fa9862c9…`) |
| **A-16** | **NP-09 special case** (A one-off / B standing / C superseded / D independently valid) |
| **A-17** | Divergent / unmerged eligibility (positive test) |
| **A-22** | **D3 definition and D3 eligibility** — own future definition/eligibility acts |

`§5.2` principles: **framework vs operation** (D2 = framework; D3 = operates within it); **precondition ordering** (D2 must be complete before D3 can coherently determine membership); **no silent absorption**; **"D3 is NOT defined by this record."**

### 2.3 What remains outside D3 entirely

Rows **A-18** (terminology harmonization — neither D2 nor D3), **A-19** (`NP-13-RECON-01` — not established), **A-20** (implementation), **A-21** (certification/release/provider/identity/security/production authority).

### 2.4 D3's jurisdiction is bounded by the D0 exclusions

`NP-13-D0-01 §3.1–§3.14` — no implementation, certification, release, production, provider, identity, or security authority; no runtime realization; no reconciliation record; no extension of EIR/control-disposition authority by analogy; no general or continuing program-wide authority.

---

## 3. D2 PREREQUISITES

### 3.1 Independently re-verified at this gate (read-only; live)

| # | Prerequisite | Verified state |
|---:|---|---|
| 1 | Live `refs/heads/main` (wire protocol + GitHub API + fresh clone) | `14928a21eeeafdeaf1d3959773b238fa38a2c8b8` — all three agree |
| 2 | **D2 definition** — `NP-13-D2-01-DEFINITION-01.md` | blob `4143d2947107b5ab06c986b4d1b8579b5d242549` · 48,153 B · on `main` |
| 3 | **D2-A** — `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01.md` | blob `a4f049dd369ff70871f1d2e9f78762ed6300c352` · 4,242 B · on `main` · **M1** |
| 4 | **D2-B** — `NP-13-PA-D2-B-REF-BINDING-EVIDENCE-DECISION-01.md` | blob `dcad0e8d418bd43dc08d92b1ba2b29b116a10831` · 23,193 B · on `main` · bound ref `refs/heads/main`; initial authoritative evidence tree `962d7ea322e4ade5cda61c3fc9335de616903daf` |
| 5 | **D2-C** — `NP-13-PA-D2-C-REALIZATION-SEMANTICS-DECISION-01.md` | blob `e4205a850adbd567960fbee46e2709d8a1d98b2b` · 46,016 B · on `main` · publication commit `14928a21…` (parent `2e32348f…`; sole added path; 17/17 predecessors unchanged) · **`Act A = A1`**, **`Act B = B-i`** |
| 6 | **D2 completion** | **D2 = COMPLETE / DURABLE** — declared by the Program Authority; the D2-C durability limb verified at this gate (§3.1 row 5). Observation, not defect: no separate durable `D2-CM-6` completion artifact exists among the 18 NP-13 records on `main` as of `14928a21…` |
| 7 | D3 investigation record | `/home/user/docs/integration/NP-13-PA-D3-COMPOSITION-MEMBERSHIP-INVESTIGATION-01.md` — **workspace artifact only**; 57,531 B; SHA-256 `31771ed719e6b17d7599514ffbe6efd15e10dfadacb8a6468d958ac9c349ed18`; **ABSENT from `main`** (verified). Its findings are **not** authoritative; the corpus anchors it cites were re-checked for this act |

### 3.2 Precondition satisfied

`NP-13-D2-01-DEFINITION-01 §5.2`: "D2 must be complete before D3 can coherently determine membership … D2 completion is a necessary (but not automatically sufficient) precondition for D3 eligibility." **Necessary precondition: SATISFIED.** D3 **eligibility** itself remains a future explicit act (row **A-22**; §18 of this act).

---

## 4. D3 DECISION OBJECTS

### 4.1 Determination

**Determination (framework level):** the six subject matters below **should be separate D3 decision objects**, because the corpus allocates them as distinct rows (**A-9 … A-17**), each requires its own explicit act (`D0 §2.3`), and no record authorizes combining them. This is a **framework determination about object structure only**; it decides no substance.

### 4.2 The six objects

| ID | Object | Allocation |
|---|---|---|
| **D3-1** | Composition semantics (J-2) | A-9 |
| **D3-2** | General membership semantics (J-3) | A-10 |
| **D3-3** | Per-workstream membership / admission | A-11 … A-14 |
| **D3-4** | NP-09 special-case treatment | A-16 (with A-11) |
| **D3-5** | Divergence adjudication | A-15 |
| **D3-6** | Unmerged / divergent candidate eligibility | A-17 |

### 4.3 Attribute matrix (framework level; **no substantive answer decided**)

Notation: **PA** = Program Authority; **EA** = own explicit act (`D0 §2.3`); **NI** = non-inference rule (do not decide by implication); **NS** = NOT ESTABLISHED by the corpus; **♪** = see the cited section of this act.

| Attribute | D3-1 Composition | D3-2 Membership test | D3-3 Per-workstream | D3-4 NP-09 | D3-5 Divergence | D3-6 Unmerged eligibility |
|---|---|---|---|---|---|---|
| **Exact question** | *"How is that baseline composed, and by what act or acts?"* (`D0 §2.2` J-2) | *"What is a member of that baseline, what is not, and by what positive test?"* (`D0 §2.2` J-3) | For each of NP-09 · NP-10 · NP-11 · NP-12 · NP-13 **individually**: is it a member / admitted, or not? | Is NP-09's status governed by the general J-3 framework or by special treatment; and which of **A** historical one-off · **B** standing procedure · **C** superseded · **D** independently valid applies? (`§4.9`) | Is the `034384fb…` / `fa9862c9…` divergence adjudicated, and with what effect? | May unmerged or divergent work be a **candidate**, **eligible for consideration**, or **admitted/member** — and by what positive test? |
| **Decision scope** | Semantic + the act-or-acts set; **not** per-workstream determinations | Positive test + membership state semantics; **not** per-workstream determinations | Determinations for the five named workstreams only | NP-09 only | The named divergence (+ classification of its kind, §9); **not** a general divergence law unless separately authorized | The eligibility question only |
| **Prerequisite** | D2 complete (satisfied); D3 defined (this act, once durable) and D3 eligible (future) | same | same | same | same | same |
| **Evidence required** | **NS** — no corpus element set exists; the future act must establish its own required evidence (E-3 analogy is **not authorized**: `D0 §3.13`; `GO3B §10.4`) | **NS** — same | **NS beyond the evidence dimensions fixed at §7** | **NS beyond §8** | **NS beyond §9** (must classify the divergence kind first) | **NS beyond §10** |
| **Authority required** | **PA** (sole holder, `D0 §2.1`); **EA** | **PA**; **EA** | **PA**; **EA** (each workstream individually) | **PA**; **EA** | **PA**; **EA** | **PA**; **EA** |
| **Depends on another D3 object?** | **NS** — no dependency may be created by adjacency (`D1-PREREQ-01 §4.1`); any dependency requires an explicit act | **NS** | **NS** (the corpus's *precondition ordering* statement concerns D2→D3, not intra-D3 ordering) | **NS** | **NS** | **A-17 "presupposes realization semantics (D2-C)"** — realization is a **D2** element (already complete) |
| **Independently decidable?** | **NS** — ordering among unresolved components is **UNRESOLVED** (`D1-PREREQ-01` Option E; `§3.4`: no default may be supplied). Only an explicit ordering act (or an explicit statement in each act) can make one object's decision depend on another | same | same | same | same | same |
| **Changes identity?** | **NI** — only the **G-5** trigger class creates/recognizes a new governed identity: *"an explicit governance act that changes the recognized governed logical object"* (D1-C #6). A D3 decision **must not be read** to change identity unless it is an explicit G-5 act | same | same | same | same | same |
| **Changes epoch?** | **NI** — *"The epoch advances only through an explicit governance act that records a material governed-state transition"*; mechanical change does not advance it (D1-C #3). Governed epoch stands at **1** | same | same | same | same | same |
| **Requires effective point?** | **Conditional**: a governed-object semantic transition must carry its own explicit UTC effective point (D1-C #4). Whether a composition determination **is** such a transition is **NS** | Conditional; classification **NS** | Conditional; classification **NS** | Conditional; classification **NS** | Conditional; classification **NS** | Conditional; classification **NS** |
| **Requires explicit governance act?** | **YES** — `D0 §2.3` (verbatim: every exercise "requires its **own explicit act**") | **YES** | **YES** | **YES** | **YES** | **YES** |
| **Affects D3 membership?** | **NS** — must be stated by the act itself; no inference permitted | **NS** — the act itself defines it | Determinations **are** the membership outcomes for those workstreams (subject to D3-2/D3-1 as the act may state) | **NS** | **NS** | **NS** (that is the question) |
| **Classification only?** | **NS** | **NS** | **NS** | **NS** | **NS** — an adjudication may be classification and/or more; **NS** | **NS** |
| **Durable publication required?** | **YES for authoritative durability** — C-1 (`B1`, `B2`); future NP-13 artifacts follow C-1 (`B10`); fail-closed until independent remote verification | same | same | same | same | same |

### 4.4 Framework rules attaching to every object

**R-1** — No object may be decided by another object's act by implication; each act must state its own scope.
**R-2** — No object may be decided by adjacency, listing order, or document order (`D1-PREREQ-01 §3.4`, `§4.1`).
**R-3** — Every act must cite `NP-13-D0-01` as its governing authority basis and observe the §3 exclusions and §4 deferrals of that record (`D0 §10.3`).
**R-4** — Every act must state, at minimum: the object; the evidence relied on (§13); the effective point (D1-C #4); its identity/epoch treatment under the non-inference rule; what it expressly does not decide; and its durability status.
**R-5** — No act may be treated as operative before durable publication + independent remote verification, unless the act itself states a different, explicit condition permitted by the corpus (none is currently established).

### 4.5 Explicitly reserved

Whether any of the six objects may be **combined into a single act**, or **ordered** relative to the others, is itself **NS**; it requires an explicit Program Authority act (proposed at §18).

---

## 5. J-2 COMPOSITION BOUNDARY

### 5.1 Preserved finding (verbatim from the D3 investigation, re-verified)

> **J-2 composition semantics = NOT ESTABLISHED.**
> Corpus checks: `governed composition` = **0** occurrences; `composition act` appears only as a deferred/allocated matter; no construct, act-set, or event-set exists.

### 5.2 What this act may establish (and does)

That **J-2 is a required future decision object** (D3-1), and the **questions that object must answer**. Nothing more.

### 5.3 Questions the future J-2 decision must answer

| # | Question |
|---:|---|
| J2-Q1 | What **is** composition — its construct (governance object · state predicate · evidence set · act-sequence · other)? |
| J2-Q2 | By **what act or acts** is the baseline composed (`D0 §2.2`)? |
| J2-Q3 | What **events** constitute a composition change? |
| J2-Q4 | What is the **relationship, if any**, between composition and: the `M1` operational ref · the authoritative evidence tree · realization (`A1`) · governed identity (D1-C #1–#10) · governed epoch (#3) · membership (D3-2)? |
| J2-Q5 | Does composition require its own **effective point** (D1-C #4)? |
| J2-Q6 | What **preservation / supersession** rules attach to a change of composition? |
| J2-Q7 | What **evidence** must a composition act rely on? |
| J2-Q8 | Does composition interact with the **G-4/G-5** identity contract, and if so, how — as an explicit G-5 act, or otherwise? |

### 5.4 What the future J-2 decision must NOT do

It must **not** be pre-empted by, or infer its answer from, any of the following candidate semantics (each of which the framework expressly leaves **unselected**):

- composition as **ref state**;
- composition as **evidence set**;
- composition as **membership set**;
- composition as **governance act sequence**;
- any other semantic.

It must also not infer a semantic from `M1` (`D2-A`), from the `E-3` binding (`D2-B`), from `A1` realization (`D2-C`), or from any existing Git topology.

---

## 6. J-3 MEMBERSHIP BOUNDARY

### 6.1 Preserved finding (verbatim from the D3 investigation, re-verified)

> **J-3 membership semantics = NOT ESTABLISHED.**
> No positive membership test; no binary/multi-state model; realization neither necessarily nor necessarily-sufficiently connected to membership; evidence designation not established as necessary.

### 6.2 Distinctions the future membership decision must preserve (no collapse)

| State | Current corpus status |
|---|---|
| **realized** | **Defined** (A1; `A1-C1` unmerged = not realized) |
| **candidate** | **NOT ESTABLISHED** (single practice usage only: NP-09 promotion "from an implementation candidate") |
| **eligible** | **NOT ESTABLISHED** for workstreams (gate-eligibility is a different sense) |
| **admitted / member** | **NOT ESTABLISHED** |
| **evidenced** | **Defined** in the evidence plane (tree-as-evidence; planes not collapsible) |
| **durable** | **Defined** (C-1; B1/B2) |
| **historical / superseded** | **Defined** for bindings/evidence/governed objects; **not** for membership |

The framework **prohibits collapsing** these seven states into one another in any future act.

### 6.3 Required framework statements (constraints on the future decision, not answers)

1. **`A1` realization ≠ membership.** (`A1-C8`.)
2. **Realization is neither automatically necessary nor automatically sufficient for membership** unless a later explicit D3 decision establishes that relationship. No such relationship is established anywhere in the corpus.
3. Any future membership decision must state whether membership is **binary or multi-state**, and if multi-state, the state names and their semantics; if it does not, the state model remains **NS**.
4. Any future membership decision must state the **positive test** (A-10) or expressly decline to establish one.
5. Any future membership decision must state its treatment of: unmerged work; divergent work; absent work; stale work; historical/superseded work — or mark each **NS**.

### 6.4 Dimensions the future decision must resolve (framework checklist)

eligibility · admission/member status · state model · necessity and sufficiency relationships (realization, evidence designation, durability) · change semantics (how membership is added/removed/altered) · effective point · explicit-act form · classification vs determination · evidence class relied upon · interaction with identity/epoch (non-inference) · durability.

---

## 7. PER-WORKSTREAM DECISION FRAMEWORK

### 7.1 Required evidence dimensions (fixed by this framework; to be populated per workstream by the future act)

| ID | Evidence dimension |
|---|---|
| **E-A** | Authority/designation record(s) for the workstream — identifier, blob, ref, date, status |
| **E-B** | Qualification record(s) — identifier, blob, ref, date, result |
| **E-C** | Acceptance / admission / promotion record(s) — identifier, blob, ref, date, exact status line |
| **E-D** | Implementation commit(s) — SHA, date, subject, change surface, **ancestry vs the bound ref** |
| **E-E** | Content presence on the bound ref — path-level check (**indicative only**, not a determination) |
| **E-F** | Durability status of each cited record — `main` (durable under C-1) vs non-`main` (branch-only, non-durable) |
| **E-G** | Divergence / lineage status (multiple lineages, canonical designation, acceptance naming) |
| **E-H** | Preserved status tokens (e.g., `NP-12 STATUS = NOT DETERMINED` — verbatim) |
| **E-I** | Evidence gaps attaching to the workstream (e.g., cited-but-absent gates; stale pins) |

### 7.2 Recorded evidence (evidence only — **not** converted into membership decisions)

| Workstream | Recorded evidence (re-verified this gate) |
|---|---|
| **NP-09** Watchlists | Designation `08a018f5…` (8,260 B) and acceptance/promotion `42065b0d…` (7,670 B), **branch-only** on `arena/01a0f351` @ `3a8748b3…`; implementation `fbe76496…` unmerged; cited qualification gate has **no record** (GAP-2); feature files absent from `main` |
| **NP-10** Collaboration | Designation `1928992a…`; qualification `74d78082…`; acceptance `b7e4c734…` — all **branch-only**; implementation `ba8ea1df…` unmerged; record itself discloses `Acceptance ≠ Promotion` and "Promotion of implementation to `main` is not granted … unless explicitly included and authorized as a separate decision" |
| **NP-11** Settings | Designation `d835030f…`; qualification `ff864782…` — **branch-only**; implementation `0feceafd…` unmerged; **no acceptance/admission/promotion record located on any fetched ref** |
| **NP-12** Sector screen | Record set **on `main`** (22 paths incl. `NP-12-N4-A12/A13/A15`, `A8-S-03`, canonical byte grammar, and `IIPS_NP-12_N4_SCREEN_CERTIFICATION.md`); implementation content present on the bound ref (`iips-platform/src`, 211 files); **`NP-12 STATUS = NOT DETERMINED` preserved verbatim** |
| **NP-13** Evidence Landing / Navigation | Canonical `034384fb…` (6 paths) on `arena/01a0f351`; later `fa9862c9…` (3 paths) + acceptance `7a4eb370…` on `arena/01a0f64b` @ `a7c421ae…`; `NP-13-AUTH-02` (`32cec7d8…`); governance records durable on `main`; **both lineages unmerged**; GAP-8 defect disclosed (`NP-13-ACCEPT-01` excess-of-cited-basis) |

### 7.3 Rules binding every future per-workstream act

**PW-1** — Determination per workstream, individually (A-11…A-14); no bundling unless expressly authorized.
**PW-2** — No classification may be derived from E-D/E-E alone (ancestry or path presence is **not** membership evidence).
**PW-3** — Non-`main` records must be cited with **ref + status** and remain distinct from durable records (§13.3).
**PW-4** — Preserved tokens (E-H) must be reproduced verbatim and must not be treated as resolved.
**PW-5** — Each act must disclose its evidence gaps (E-I) and must not close them by inference.

---

## 8. NP-09 SPECIAL-CASE FRAMEWORK

### 8.1 Determination

**NP-09 must have an explicit D3 decision object** (D3-4), because the corpus itself carries an unresolved special-case question about it, and because the D3 investigation identified special-case governance material. This is a **framework determination about object structure only**.

### 8.2 Why the special case exists (recorded basis)

- `NP-13-D0-01 §4.9` records the **NP-09 special case** as four **unselected** readings: **A** historical one-off · **B** standing procedure · **C** superseded · **D** remains independently valid while a broader composition act is created.
- NP-09 is the only workstream with a **pre-D0 acceptance-and-promotion act** (`NP-09-PROMO-01`, 2026-10-01, branch-only) whose **cited basis** — the NP-09 *"Non-Production Qualification & Reconciliation Gate"* — **has no record in the repository** (GAP-2).
- `NP-13-AUTH-02 §7` records that it does **not** "supersede, replace, or promote any baseline", and defers feature-baseline composition.
- `NP-13-D0-01 §5.5`/`NP-13-AUTH-02` findings on NP-13 stand separately; they do not adjudicate NP-09.

### 8.3 Questions the future NP-09 decision must answer

| # | Question |
|---:|---|
| N9-Q1 | Which reading applies: **A**, **B**, **C**, or **D**? |
| N9-Q2 | Does NP-09's membership status follow the **general J-3 framework** (D3-2), or does it require **special treatment** — and if special, on what explicit basis? |
| N9-Q3 | What **special dimensions** must be resolved (at minimum: the pre-D0 timing; the branch-only record status; the absent qualification-gate record; the unselected reading)? |
| N9-Q4 | What **evidence is authoritative** for this decision (durable `main` records; branch records as content-evidence with status disclosed; blob pins)? |
| N9-Q5 | What remains **historical / non-authoritative** (branch-only records; the cited-but-absent gate record)? |
| N9-Q6 | What **effect, if any**, does the NP-09 decision have on other workstreams (none may be inferred)? |

### 8.4 Explicit non-decisions of this framework

NP-09 membership is **not decided**; the A/B/C/D selection is **not made or ranked**; no general rule is extracted from NP-09's practice ("describing these exclusions decides none of them" — corpus discipline).

---

## 9. DIVERGENCE FRAMEWORK

### 9.1 Preserved state

> **Divergence = NOT ADJUDICATED.** (`NP-13-D1-01 §6.4`; `NP-13-D0-01 §5.5`; `NP-13-PA-D2-C-… §14.3`.)

### 9.2 Candidate divergence kinds (must be distinguished; **none defined in the corpus**)

| Kind | Corpus definition |
|---|---|
| Operational divergence | **NOT ESTABLISHED** |
| Evidence divergence | **NOT ESTABLISHED** |
| Governance divergence | **NOT ESTABLISHED** |
| Membership divergence | **NOT ESTABLISHED** |
| Provenance divergence | **NOT ESTABLISHED** |

The framework **prohibits assuming these are the same condition**.

### 9.3 Scope the future divergence decision (D3-5) must establish

**DIV-Q1** — What **counts** as divergence (definition(s), per kind).
**DIV-Q2** — Which **kind(s)** are present in the named case — each classified separately.
**DIV-Q3** — Who **adjudicates**, by what form (Program Authority; own explicit act).
**DIV-Q4** — Whether divergent content may remain a **candidate**; whether divergence **blocks** membership (interacts with D3-6; must not be pre-decided).
**DIV-Q5** — Whether adjudication carries **identity / epoch** consequences (non-inference; only G-5 / explicit epoch-act rules apply).
**DIV-Q6** — How the **GAP-8 defect** (`NP-13-ACCEPT-01` citing `NP-13-AUTH-01` for a promotion act AUTH-01 does not confer) is treated.
**DIV-Q7** — What **evidence** is required and what **durability** the adjudication requires.

### 9.4 The named case (facts; no adjudication here)

| Item | Canonical | Later |
|---|---|---|
| Commit | `034384fbd1d1c359a95afa1dad294507fdfd3269` | `fa9862c9668f0deb9b1093415fdd9c551036240f` |
| Tree | `d15a6d08f3a8bdabefdf5565fb7814975a312957` | `59e28d0b1abe9cbcd81034ff69bf7e4a21e578bd` |
| Designation | **CANONICAL** (`NP-13-AUTH-02 §1.1`) | **NOT canonical** (`§2.1`) |
| Acceptance record naming it | — | `NP-13-ACCEPT-01` (`7a4eb370…`, branch-only) |
| Ancestry from `main` | none | none |

The framework **does not adjudicate this case**.

---

## 10. UNMERGED / DIVERGENT ELIGIBILITY FRAMEWORK

### 10.1 What `D2-C` established (and its exact limits)

`A1-C1`: *"Unmerged work is **NOT** realized."* — a **semantic predicate only** (`§14.3`): it is **not** a membership determination; it does **not** exclude or include any workstream; it does **not** adjudicate the divergence.

### 10.2 What `D2-C` did NOT establish (expressly reserved here)

- It does **not** establish that unmerged work **cannot be a candidate**.
- It does **not** establish that unmerged work **cannot become a member**.
- It does **not** establish any positive test for divergent/unmerged eligibility (row **A-17**).

**The framework forbids inferring either outcome.**

### 10.3 Scope the future D3-6 decision must establish

**UQ-1** — Whether unmerged/divergent work may be a **candidate**.
**UQ-2** — Whether it is **eligible for consideration**.
**UQ-3** — Whether it may be **admitted / become a member**, and if so by what **positive test**.
**UQ-4** — The **evidence** required (per §13) and the **effective point** discipline.
**UQ-5** — The **relationship to `A1`** — as a statement of that act, not an inference.

---

## 11. IDENTITY / EPOCH BOUNDARY

### 11.1 Operative policy preserved (D1-C #1–#10 = **A — RESOLVED 10/10**)

| # | Dimension | Operative rule (condensed; representative text) |
|---:|---|---|
| 1 | Stable identifier | One stable, opaque logical identifier; assigned on first establishment by explicit PA act; not derived from repo/ref/commit/tree/blob/implementation/runtime/tenant/persistence/provider/evidence |
| 2 | Identifier form | Canonical UUID; no embedded meaning; not regenerated because the repo/ref/implementation/evidence/runtime changes |
| 3 | Version / epoch | Epoch = lifecycle metadata **separate** from identity; initial value **1**; *"The epoch advances only through an explicit governance act that records a material governed-state transition"*; mechanical change does not advance it |
| 4 | Effective point | The authoritative effective point = **the timestamp explicitly recorded by the governance act**; UTC; Git/evidence/runtime timestamps are not substitutes; ref movement does not alter it |
| 5 | Continuity | Presumed across migration / ref movement / evidence refresh / provenance / implementation change unless an explicit act establishes a new governed object |
| 6 | New-identity trigger | **G-5 only**: *"an explicit governance act that changes the recognized governed logical object"*; no mechanical event creates identity |
| 7 | Preservation under change | Enumerated preservation list; no implementation mechanism may reinterpret an ordinary technical change as a new identity |
| 8 | Supersession | Explicit act only; successor has its own identifier; predecessor remains historically valid; **binding/evidence supersession ≠ governed-object supersession** |
| 9 | Collision | Collision invalid; no reassignment; later/unverified claim rejected pending PA resolution; no silent resolution; collision ≠ G-5 |
| 10 | Ownership | Governance metadata; owner = explicitly designated accountable owner; not inferred; transfer by explicit act only; no identity change |

Preserved unchanged: `G-4` / `G-5` (`NP-13-GO3B-DECISION-01 §8`; blob `58e0df87…`), including the eight identity-preserving changes (`§8.3`), the twelve identity-insufficient operations (`§8.4`), and the sole sufficient trigger class (`§8.5`).

### 11.2 Framework rules for D3 objects (no substantive determination)

| Rule | Statement |
|---|---|
| **IE-1** | **Do not reopen identity semantics** merely because membership/composition is being defined. D1-C is operative and is not to be re-litigated. |
| **IE-2** | No D3 act may be **read** to create a new governed identity; only an explicit G-5 act can (D1-C #6). |
| **IE-3** | No D3 act may be **read** to advance the governed epoch; only an explicit act recording a material governed-state transition can (D1-C #3). Governed epoch stands at **1**. |
| **IE-4** | If — and only if — a D3 act **is** a governed-object semantic transition, it must record its **own** UTC effective point (D1-C #4). Whether any of D3-1…D3-6 is such a transition is **NOT ESTABLISHED**; the act itself must say so. |
| **IE-5** | Supersession, collision, and ownership rules (D1-C #8/#9/#10) apply to D3 acts only as the corpus states them; no membership-specific identity rule may be invented. |

---

## 12. AUTHORITY MODEL

### 12.1 Five distinct authorities (must not be conflated)

| Authority | Status at this gate | Basis |
|---|---|---|
| **Investigation authority** — read-only inquiry | **GRANTED and exercised** (D3 read-only investigation; this preparation) | Program Authority's D3 authorization |
| **Definition authority** — establishing what D3 is to decide | **Prepared** — exercised only to produce this draft; rendering and publication remain for the Program Authority | This gate's scope; row **A-22** |
| **Substantive decision authority** — deciding J-2 / J-3 / per-workstream / NP-09 / divergence / unmerged eligibility | **NOT GRANTED** | Rows **A-9 … A-17**; `D2-C §15.1` rows 10, 13 |
| **Publication authority** — publishing governance artifacts | **NOT GRANTED** | This gate's explicit prohibition; B10/C-1 |
| **Implementation authority** — code / runtime / persistence / IPI / deployment | **NOT GRANTED** | `D0 §3.1`; `D2-C §15.1` rows 2–5, 12 |

### 12.2 Authority holder

**Ramki (Ramakrishnan) — Program Authority**, sole holder of the bounded J-1 / J-2 / J-3 jurisdiction (`NP-13-D0-01 §2.1`). The recording agent holds **no** governance authority and claims none.

### 12.3 Rules

**AU-1** — No authority may be inferred from subject matter, content, comprehensiveness, placement, publication route, commit ancestry, PR, or merge (`GO3B §11.2` discipline).
**AU-2** — Each future D3 act must cite `NP-13-D0-01` as basis and observe its §3 exclusions and §4 deferrals (`D0 §10.3`).
**AU-3** — Definition ≠ eligibility ≠ authorization ≠ implementation (`D2-DEF §11`). Preparing this framework does not make D3 eligible.
**AU-4** — No production, certification, or release authority exists anywhere in this series.

---

## 13. EVIDENCE MODEL

### 13.1 Evidence classes (for every future D3 act)

| Class | Source | Status rule |
|---|---|---|
| **EC-1 Durable `main` evidence** | Records on `refs/heads/main`, blob-pinned | Authoritative evidence of their own content |
| **EC-2 Non-`main` evidence** | Records on named refs (`arena/01a0f351…` @ `3a8748b3…`; `arena/01a0f64b…` @ `a7c421ae…`) | **Content evidence only**; must be cited with ref + status; **not** durable; **not** silently promoted to `main` |
| **EC-3 Live-ref observation** | Ref state at the time of the act (commit, tree) | Must state the observed coordinate and the mechanism(s); `OPEN-1` caveat applies (mechanical advancement recognition is unresolved) |
| **EC-4 Historical / lineage evidence** | Prior states, superseded pins, lineage commits | Valid at its own effective point; preservation without erasure |
| **EC-5 Preserved negative evidence** | Tokens/statuses that are expressly preserved (e.g., `NP-12 STATUS = NOT DETERMINED`) | Must be reproduced verbatim |

### 13.2 Verification requirements

**EV-1** — At least **two independent mechanisms** for any live coordinate relied upon (e.g., wire protocol + REST API; local object inspection + remote retrieval).
**EV-2** — For any artifact whose identity is claimed, record **blob + byte count + SHA-256**, and compute the SHA-256 from the **actual retrieved remote bytes** at publication-verification time.
**EV-3** — Verification is a **precondition of effectiveness**, not a formality (`E-3 §6.3.2`).

### 13.3 Non-promotion rule

A record that is absent from `main` but present on a non-`main` ref must be: identified by ref; given its status (branch-only / non-durable); **preserved as distinct**; and never cited as authoritative `main` evidence. (EC-2.)

### 13.4 Evidence gaps must be disclosed, not closed

GAP-1 … GAP-8 (`NP-13-D0-01 §6.3`), stale pins (e.g., `iips-platform` `27104015…` vs later HEAD — NP-15 GAP-05), and branch-only provenance must be disclosed in every act that relies on the affected material.

### 13.5 Plane separation

The designated authoritative evidence tree (`962d7ea3…`, `D2-B`) remains distinct from realization (`A1-C3`/`A1-C4`). Citing newer content **does not** refresh the evidence plane; refresh requires a separate explicit act (`D-3 §5.2` rule 5).

---

## 14. DURABILITY MODEL

### 14.1 Requirements for every future D3 governance decision

| # | Requirement |
|---:|---|
| D-1 | **C-1 durability rule** applies: authoritative closure requires publication to IRR `main` (`B1`); a local file, session-branch commit, or open PR is **not** authoritative publication |
| D-2 | **Universal Artifact Durability Invariant** applies in full (`B2`, `B8`) |
| D-3 | Authoritative repository/ref = `ramkivs/iips-review-recovered` @ `refs/heads/main` |
| D-4 | **Exact artifact identity** — byte count, Git blob, SHA-256 computed from actual retrieved remote bytes |
| D-5 | **Independent remote verification** — at least two mechanisms; predecessor continuity verified; sole-delta control (exactly one added path per publication act) |
| D-6 | **Fail-closed**: any mismatch ⇒ STOP; no durability claim; no partial effectiveness (`E-3 §6.4`, `§6.4.1`) |
| D-7 | **Historical preservation** — superseded, not erased; prior states remain valid at their effective points |
| D-8 | **No durability by existence** — an artifact is not durable because it exists in a workspace, is committed on a branch, is in a patch, or is downloadable |

### 14.2 This act

**This Definition Act is NOT published in this gate.** Status: **PREPARED / NOT YET DURABLE** — workspace artifact only. Its own future publication would require: explicit publication authorization → publication to `refs/heads/main` (single artifact, single-path delta) → independent remote verification.

### 14.3 Proposed path (disclosure only; creates no authority)

Suggested location for any future publication: `docs/integration/NP-13-D3-DEFINITION-01.md` — exactly one added path.

---

## 15. SEQUENCING / DEPENDENCY MODEL

### 15.1 Established constraints (corpus-grounded)

| # | Constraint |
|---:|---|
| S-1 | **D2 must be complete before D3 can coherently determine membership** (`D2-DEF §5.2`) — **satisfied** |
| S-2 | **Every J-2/J-3 exercise requires its own explicit act** (`D0 §2.3`) |
| S-3 | **Adjacency creates no dependency, precedence, or ordering** (`D1-PREREQ-01 §4.1`; `GO3B §10.4`) |
| S-4 | **Prerequisite ordering among unresolved components is UNRESOLVED (Option E)** and no explicit ordering act exists; no default may be supplied (`D1-PREREQ-01 §3.2–§3.4`) |
| S-5 | **D3's own definition and eligibility are future acts** (row A-22; `D2-DEF §10.3`) |
| S-6 | A-listed row **A-17** "presupposes realization semantics" — a D2 element, already established; this is not an intra-D3 dependency |

### 15.2 Dependency findings

| Question | Finding |
|---|---|
| Does any D3 object **depend** on another as a matter of established governance? | **NOT ESTABLISHED** |
| May the objects be decided **independently**? | **NOT ESTABLISHED** — cannot be assumed either; requires an explicit ordering act, or an explicit statement in each act (R-2) |
| May the objects be **combined**? | **NOT ESTABLISHED** (§4.5) |

### 15.3 Proposed sequence (non-binding; requires an explicit act to become operative)

```text
Step 0  D3 definition rendered (this act)  →  durable publication (C-1) + independent verification
Step 1  D3 eligibility act (explicit determination that D3 is eligible)
Step 2  Ordering decision (optional): establish, defer, or decline intra-D3 ordering
Step 3  D3-1 composition semantics            ─┐
Step 4  D3-2 general membership semantics      │ each is its own explicit act;
Step 5  D3-3 per-workstream determinations     │ each states its own evidence,
Step 6  D3-4 NP-09 special case                │ effective point, identity/epoch
Step 7  D3-5 divergence adjudication           │ treatment, and durability status
Step 8  D3-6 unmerged/divergent eligibility   ─┘
Step 9  (nothing else is derived by this framework)
```

Steps 3–8 may be reordered, merged, or split **only** by an explicit Program Authority act (S-4). This proposal is **not** an ordering act and confers no authority.

---

## 16. HISTORICAL-CONFLICT TREATMENT

### 16.1 The rule applied by this framework

1. Conflicts are **investigation findings**; this gate **does not reconcile** them unless the corpus already establishes the reconciliation rule.
2. Wherever two records conflict: **preserve both**; identify each record's **ref, date, and status**; do not silently select one.
3. **No historical record is deleted, rewritten, or superseded** by this act or by any D3 act.
4. Where a later act **appears** to supersede an earlier act, the **actual supersession authority** must be established before the later act is treated as operative.
5. Reconciliation, if ever performed, requires its own explicit act (and `NP-13-RECON-01` remains **NOT ESTABLISHED**, row A-19).

### 16.2 Application to the D3 investigation findings

| ID | Conflict (as found) | Treatment applied |
|---|---|---|
| **F-1** | Historical "no acceptance record" statements (`NP-13-D0-01 §4.10`, `NP-13-D1-01 §7.10`, durable on `main`, effective points 2026-10-02/03) vs later NP-10 acts (`NP-10-QUAL-01` `689d5c8f…` 05:57:32Z; `NP-10-ACCEPT-01` `3a8748b` 07:41:07Z; **branch-only**, `arena/01a0f351`, 2026-10-04) | **Not reconciled.** Both preserved with refs/dates/status. Note: **NP-11 still has no acceptance record on any fetched ref.** The historical statements remain accurate for their own effective points |
| **F-2** | `NP-15` GAP-08 / declaration row 11 ("no durable artifact … no file exists"; evidence stated as `git ls-files`; API tree listings) vs retrievable NP-09/10/11 branch records | **Not reconciled.** Both preserved; NP-15's statement is accurate as to durability on `main`; the branch records exist as content evidence (EC-2). No scope statement in NP-15 is invented |
| **F-3** | `NP-15` attributes composition/membership to **D2** | The **allocation is established** by durable `NP-13-D2-01-DEFINITION-01 §5.1` (rows A-9/A-10 → **D3**); reported as the established rule. NP-15's wording remains **as written**; no amendment |
| **F-4** | PA-D1C posture sequence (**B…** then **A**) | The corpus **states** the relationship: `SEMANTIC-RESOLUTION-01 §2.1` — the ten **B** dispositions "remain the accurate history … and this record supplies the subsequent semantic resolution"; `D2-DEF §2` treats the resolution as governed input **I-4**. **Operative posture = A**; the B records remain accurate at their effective points; no supersession language is used or implied |
| **F-5** | Divergence/lineage facts + **GAP-8** defect | **Not adjudicated.** Preserved for D3-5 (§9) |
| **F-6** | Branch-coordinate movement (`arena/01a0f351` `5fde821b…` → `3a8748b3…`) | **Not reconciled by re-designation.** Historical pins valid at their own effective points (`E-3 §6.3.5`); no pin re-designated |
| **F-7** | Stale `iips-platform` pin (`27104015…`) vs later HEAD (NP-15 GAP-05) | Preserved and disclosed; relevant to future evidence-coordinate work; unreconciled |
| **F-8** | `NP-12 STATUS = NOT DETERMINED` provenance (phrase occurs only in NP-13 records) | Preserved verbatim; no NP-12-side attribution inferred |
| **F-9** | No positive composition/membership semantics exist anywhere | This is the **basis** of the **NOT ESTABLISHED** findings; no gap filled |
| **F-10** | `OPEN-1`; D1-C residual items; `NP-13-RECON-01` not established | Preserved open; not resolved by implication, adjacency, silence, or reasoning (`A1-C10`) |

---

## 17. EXPLICIT NON-DECISIONS

This act does **NOT** decide, establish, authorize, imply, or pre-judge:

1. **J-2 composition** — semantics, construct, acts, events, relationships;
2. **J-3 membership** — positive test, state model, necessity/sufficiency;
3. **Per-workstream membership** — NP-09 / NP-10 / NP-11 / NP-12 / NP-13, individually;
4. **NP-09 special case** — readings A / B / C / D remain **unselected**;
5. **Divergence** — the `034384fb…` / `fa9862c9…` case remains **NOT ADJUDICATED**; no divergence kind is defined;
6. **Unmerged / divergent eligibility** — no candidate, eligibility, or admission rule;
7. **Any admission of any workstream** into the baseline;
8. **Any implementation state** — no code, runtime, persistence, API, UI, deployment, production;
9. **Identity** — no identity change, creation, or transition; D1-C not reopened;
10. **Epoch** — no epoch advance; epoch remains at **1**;
11. **Evidence refresh / re-binding** — none performed, none authorized;
12. **Terminology harmonization** (IIPS / IRR) — not authorized (row A-18);
13. **`NP-12 STATUS = NOT DETERMINED`** — preserved verbatim; not changed;
14. **`NP-13-RECON-01`** or any other reconciliation record — not established;
15. **D3 eligibility** — not declared by this act (proposed only, §18);
16. **Durability or publication of this act** — neither claimed nor performed;
17. **Any reconciliation of findings F-1 … F-10** — beyond the corpus-established rule stated at `§16.2` row F-4;
18. **Any authority beyond the preparation of this framework.**

---

## 18. PROPOSED NEXT D3 ELIGIBILITY GATE

**Proposal only — nothing is convened, authorized, or scheduled by this act.**

**Proposed gate:** `NP-13 — D3 ELIGIBILITY & DEFINITION DURABILITY GATE`.

| # | Proposed question |
|---:|---|
| P-1 | Does the Program Authority **render/approve** this definition framework (with or without amendment)? |
| P-2 | Is **durable publication** of the definition act authorized (single artifact · single-path delta `docs/integration/NP-13-D3-DEFINITION-01.md` · C-1 publication to `refs/heads/main` · independent remote verification)? |
| P-3 | Is **D3 declared eligible** (row A-22; `D2-DEF §9.1` item 8, `§10.3`)? |
| P-4 | Is an **ordering act** established for D3-1 … D3-6, expressly deferred, or declined (S-4)? |
| P-5 | Is the **first substantive decision act** authorized — and if so, which object (D3-1 … D3-6)? No substantive answer is proposed here |

**Fail-closed default if P-2/P-3 are not selected:** the definition remains **PREPARED / NOT YET DURABLE**; D3 remains **investigation/definition only**; no substantive D3 act may be convened.

---

## APPENDIX A — FAIL-CLOSED REGISTER (THIS ACT)

`J-2 composition semantics = NOT ESTABLISHED` · `J-3 membership semantics = NOT ESTABLISHED` · `positive membership test = NOT ESTABLISHED` · `membership state model = NOT ESTABLISHED` · `realization↔membership necessity/sufficiency = NOT ESTABLISHED` · `evidence-designation necessity for membership = NOT ESTABLISHED` · `composition construct = NOT ESTABLISHED` · `composition events = NOT ESTABLISHED` · `divergence kinds = NOT ESTABLISHED` · `divergence adjudication = NOT ADJUDICATED` · `NP-09 special case (A/B/C/D) = UNSELECTED` · `NP-09 / NP-10 / NP-11 / NP-13 membership = NOT DECIDED` · `NP-12 inclusion/exclusion = NOT DETERMINED (verbatim)` · `unmerged/divergent eligibility = NOT ESTABLISHED` · `intra-D3 dependency = NOT ESTABLISHED` · `intra-D3 ordering = UNRESOLVED (no default)` · `combination of objects = NOT ESTABLISHED` · `D3 eligibility = NOT DETERMINED` · `OPEN-1 = PRESERVED OPEN` · `NP-13-RECON-01 = NOT ESTABLISHED`.

## APPENDIX B — VERIFICATION PERFORMED (READ-ONLY)

| Item | Result |
|---|---|
| Live `main` (wire protocol · API · fresh clone) | `14928a21eeeafdeaf1d3959773b238fa38a2c8b8` — three mechanisms agree |
| D2-definition / D2-A / D2-B / D2-C blobs + sizes on `main` | `4143d2947107…` / `a4f049dd369f…` / `dcad0e8d418b…` / `e4205a850adb…` — all confirmed |
| All 18 NP-13 records on `main` | confirmed (sizes 4,242 – 56,644 B) |
| NP-12 set on `main` | 22 paths incl. N4 A12/A13/A15, A8-S-03, canonical byte grammar, certification record |
| NP-15 records on `main` | 3 paths |
| Non-`main` records (EC-2) | NP-09 ×2, NP-10 ×3, NP-11 ×2, NP-13-AUTH-02 on `arena/01a0f351` @ `3a8748b3…`; NP-13-ACCEPT-01 on `arena/01a0f64b` @ `a7c421ae…` — all blob-verified |
| D3 investigation record | workspace-only; 57,531 B; SHA-256 `31771ed7…`; **absent from `main`** |
| Spot-checks | `D0 §2.3` own-explicit-act; `§2.5` decides-nothing; `D1-01 §7.10`; `GO3B §6.2` element 5; `§8.5` trigger class; D1-C #3/#4 rules; `A1-C1`, `A1-C8`, `§15.1` row 13; NP-10 `Acceptance ≠ Promotion` — all re-confirmed verbatim |

## APPENDIX C — MUTATION / PUBLICATION ATTESTATION

| Item | State |
|---|---|
| Repo mutation (`git add`/commit/push/PR/merge/tag) | **ZERO** |
| Existing records modified / deleted / superseded | **ZERO** |
| Application / runtime / config / persistence changes | **ZERO** |
| IPD access or mutation | **ZERO** — not accessed |
| Production / certification / release activity | **NONE** |
| Artifacts created | **One workspace draft:** `docs/integration/NP-13-D3-DEFINITION-01.md` (workspace path only) |
| Publication | **NOT AUTHORIZED / NOT PERFORMED** |

## APPENDIX D — FINAL DISPOSITION

```text
D2 = COMPLETE / DURABLE
D3 = DEFINITION PREPARED / NOT YET DURABLE
J-2 = NOT DECIDED
J-3 = NOT DECIDED
Membership = NOT DECIDED
Divergence = NOT ADJUDICATED
Implementation authority = NOT GRANTED
Production authority = NOT GRANTED
Certification/release authority = NOT GRANTED
Publication authority = NOT GRANTED
```

**Prepared by:** Arena Agent Mode — read-only preparation only, under the Program Authority's D3 definition-preparation authorization.
**No substantive D3 decision is rendered by this record.**
**End of `NP-13-D3-DEFINITION-01`.**
