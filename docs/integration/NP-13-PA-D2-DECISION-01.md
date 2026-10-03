# NP-13 — PA-D2 ELIGIBILITY & AUTHORITY DETERMINATION: DURABLE GOVERNANCE PUBLICATION

> **Record identifier:** `NP-13-PA-D2-DECISION-01` — PA-D2 Eligibility & Authority Determination Publication
> **Document type:** `AUTHORITY DECISION` — D2 eligibility/authority gate decision record (eligibility/authority determination only; not D2 definition, not D2 execution, not implementation authorization)
> **Gate:** **NP-13 PA-D2 — D2 Eligibility & Authority Determination**
> **Record date:** 2026-10-03
> **Record time (UTC):** 2026-10-03T13:16:07Z
> **Program Authority:** Ramki (Ramakrishnan)
> **Repository:** IRR — `ramkivs/iips-review-recovered`
> **Authoritative durability destination:** `origin/main` (`refs/heads/main`)
> **Decision published:** **A — AUTHORIZE CONVENING OF A FUTURE D2 DEFINITION GATE (NP-13-D2-01)**
> **Effective point:** 2026-10-03T13:16Z (UTC) (authorizing the convening; not establishing D2 eligibility)
> **Resulting state:** **D2 = NOT ELIGIBLE** · **D2 DEFINITION = NOT ESTABLISHED** · **D2 WORK = NOT STARTED** · **D2 IMPLEMENTATION AUTHORITY = NOT GRANTED** · **FUTURE D2-01 DEFINITION GATE = CONVENING-AUTHORIZED (this record is that authorization)** · **D3 = NOT ELIGIBLE** · **IMPLEMENTATION AUTHORITY = NOT GRANTED**
> **Authority granted by this record:** A single bounded authority: authorization to **convene a future explicit Program Authority gate** (`NP-13-D2-01`) whose sole scope is to define D2. No further authority is granted (§10).
> **Predecessors:** `NP-13-D0-01`, `NP-13-D1-01`, `NP-13-D1-C-01`, `NP-13-D1-PREREQ-01`, `NP-13-GO3B-01`, `NP-13-GO3B-DECISION-01`, `NP-13-PA-D1-DECISION-01`, `NP-13-PA-D1C-DECISION-01`, `NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01`, `NP-13-D1-CM-B-DECISION-01`, `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01`, `NP-13-PA-D1-COMPLETION-01` — all preserved unchanged (§12).
> **Additive character:** This record is additive only. It does not rewrite, amend, correct, reinterpret, reopen, or supersede any predecessor record. It does not define D2. It does not perform D2.
> **Production:** OUT OF SCOPE · **IPD:** OUT OF SCOPE — NOT ACCESSED / NOT MODIFIED

---

## 1. PURPOSE, GATE IDENTITY, AND SCOPE BOUNDARY

1.1 **Purpose.** This record durably publishes:

- the closed-world D2 eligibility/authority investigation performed against the live authoritative NP-13 corpus;
- the established finding that **D2 = NOT ELIGIBLE** under the existing framework;
- the governance gaps that prevent eligibility;
- the Program Authority's explicit decision (Option A) to **authorize convening of a future D2 definition gate (`NP-13-D2-01`)** as the minimum act necessary to move D2 from "not defined" to "defined," which is prerequisite to any future D2 eligibility determination; and
- the strict boundaries this act does **not** cross (§9, §10).

1.2 **Gate identity.** This is the **NP-13 PA-D2 — D2 Eligibility & Authority Determination** gate. It is an **eligibility/authority gate only**, consistent with the execution-mode constraint that "D1 completion does not imply D2 authority" and that "D2 eligibility does not imply implementation authority."

1.3 **This is NOT a D2 execution gate.** This gate does **not**:

- define D2;
- perform D2;
- implement D2;
- modify application or runtime code;
- create persistence or identity mechanisms;
- create APIs, UI, or product features;
- perform certification or production work;
- bind any repository/ref;
- compose the baseline or determine membership;
- allocate deferred subject matters between D2 and D3;
- establish realization semantics; or
- grant implementation authority.

Any such act remains governed by its own future explicit authority record.

1.4 **Character — eligibility/authority determination, not a D2 definition act.** This record does **not**:

- create a D2 definition (`NP-13-D2-01` does not yet exist; this record does not create it);
- supply D2-A / D2-B / D2-C or any D2 decision structure;
- partition the deferred "D2/D3" subject-matter bucket between D2 and D3;
- enumerate a D2 eligibility checklist beyond the meta-condition already established by predecessors ("its own future explicit act");
- convert itself into the D2 eligibility act;
- convert itself into D2 work authorization; or
- import D3 conditions into D2 or implementation conditions into eligibility.

1.5 **Decision provenance.** The single decision requested at this gate was:

```text
A — AUTHORIZE CONVENING OF A FUTURE D2 DEFINITION GATE (NP-13-D2-01)
B — HOLD D2 INDEFINITE (D2 remains NOT ELIGIBLE; no gate convened)
```

The Program Authority selected **A — AUTHORIZE CONVENING OF A FUTURE D2 DEFINITION GATE (NP-13-D2-01)**, expressly and explicitly, after the factual state at §4–§6 was presented. The selection was **not** inferred.

1.6 **Execution boundary.**

| Boundary | State |
|---|---|
| Repository | **IRR** — `ramkivs/iips-review-recovered` |
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative ref | `origin/main` (`refs/heads/main`) |
| IPD | **OUT OF SCOPE** — not accessed, not modified |
| Production | **OUT OF SCOPE** — untouched |
| Implementation | **NOT AUTHORIZED** (§10) |
| D2 eligibility | **NOT ESTABLISHED by this record** (§8) |
| D2 work | **NOT STARTED** (§8) |
| D2 execution | **NOT PERFORMED** |
| D3 | **NOT ELIGIBLE** |

1.7 **Git workflow is not governance.** Branch creation, commit, push, pull request, and merge are **publication mechanics**. They create no implementation authority, resolve no D2 scope question, establish no D2 eligibility, allocate no D2/D3 subject matter, and grant no implementation authority (following `NP-13-GO3B-DECISION-01 §1.3` and `NP-13-PA-D1-COMPLETION-01 §1.6`).

---

## 2. MANDATORY LIVE CONNECTIVITY PREFLIGHT (RESULTS)

2.1 Live GitHub connectivity was independently established before any governance investigation was performed. Every preflight item **PASSED**; on any failure the gate would have stopped, failed closed, and returned a network-failure disposition only.

| # | Preflight item | Verified result | Status |
|---:|---|---|:---:|
| 1 | GitHub connectivity | `gh auth status` — authenticated to `github.com` as `ramkivs`; live API and live `git` transport responding | **PASS** |
| 2 | Authoritative repository | `ramkivs/iips-review-recovered` (default branch `main`), confirmed via `gh repo view` | **PASS** |
| 3 | Remote `origin` | `https://github.com/ramkivs/iips-review-recovered.git` (fetch + push) | **PASS** |
| 4 | Live `refs/heads/main` | `git ls-remote origin refs/heads/main` and `git fetch origin main` — in agreement | **PASS** |
| 5 | Live `main` commit | `b9af85a4dc1fcfe519c2c118dca34697aaf2fb51` | **RESOLVED** |
| 6 | Live main tree | `70d468703c64817c3eed95527c2bf56e5577a12f` (agrees between `git rev-parse origin/main^{tree}` and `gh api .../commits/main → commit.tree.sha`) | **PASS** |
| 7 | D1 completion record present on live `main` | `docs/integration/NP-13-PA-D1-COMPLETION-01.md` — blob `230059234abec84de123ce325a0cd8b5f6f70200` | **PASS** |
| 8 | All 12 predecessor NP-13 records present on live `main` and blob-identical to pins at §12 | All 12 present; blob pins in §12 verified via `git ls-tree origin/main` | **PASS** |
| 9 | Target path absent before creation | `docs/integration/NP-13-PA-D2-DECISION-01.md` absent on `origin/main` and absent from local worktree | **PASS** |
| 10 | Worktree | Clean — no staged changes, no unstaged changes, no untracked NP-13 files | **PASS** |
| 11 | Current branch | `arena/01a101e0-iips-review-recovered` (the session branch assigned to this gate) | **PASS** |

2.2 **Independent-mechanism agreement.** The live `main` commit and tree were each established by more than one independent mechanism (`git ls-remote`, live `git fetch`, `gh api` ref, `gh api` commit). All mechanisms **agreed**. No value rests on a single source.

2.3 **Consequence.** Because every preflight item passed, the gate proceeded to closed-world investigation (§4) and only thereafter to the Program Authority decision (§7).

---

## 3. AUTHORITATIVE BASELINE

3.1 **Baseline pins used for this record.**

| Pin | Verified value |
|---|---|
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative remote | `origin` |
| Authoritative ref | `refs/heads/main` |
| Authoritative commit (live) | `b9af85a4dc1fcfe519c2c118dca34697aaf2fb51` |
| Authoritative tree (live) | `70d468703c64817c3eed95527c2bf56e5577a12f` |
| Commit character | Merge commit of PR **#31**; subject line confirms it is the merge carrying `NP-13-PA-D1-COMPLETION-01` to `main` |

3.2 **D1 baseline preserved.** D1 = COMPLETE is durably established on this baseline by `NP-13-PA-D1-COMPLETION-01` (blob `23005923…`). That state is **not reopened** by this gate (§5).

3.3 **No NP-13-D2 record exists.** A path-level sweep of the live authoritative tree confirms no file matching `NP-13-D2-*` or `NP-13-PA-D2-*` exists on `origin/main` prior to this publication. D2 has no definition record, no prerequisite record, no eligibility record, and no decision record in the authoritative corpus.

---

## 4. CLOSED-WORLD D2 INVESTIGATION — FINDINGS

4.1 **Scope.** The investigation was closed-world over the authoritative NP-13 governance corpus on `refs/heads/main` at `b9af85a…`, comprising the twelve predecessor records listed at §12. The corpus is complete for this subject matter; the recursive tree was retrieved via `git ls-tree -r origin/main` and a path-level sweep for `NP-13` / `D2` / `PA-D2` was performed.

4.2 **What the corpus establishes about D2.**

| Established fact | Source |
|---|---|
| D2 is the next downstream gate in the series **D0 → D1 → D2 → D3** | `NP-13-D1-01 §9.1` |
| D2 is a separate gate from D1 and from D3 | `NP-13-D1-01 §11` (uniformly restated across every subsequent record) |
| Certain subject matters are explicitly **outside D1** and are deferred: M1/M2/M3 baseline nature, C-1/C-2 reconciliation, **J-2 composition**, **J-3 membership** (incl. NP-09/10/11/12/13 membership and the NP-13 divergence), and realization semantics | `NP-13-PA-D1-DECISION-01 §7.1`; `NP-13-PA-D1-COMPLETION-01 §5.4` |
| These deferred items are collectively referred to as "D2/D3 conditions" — **never partitioned** between D2 and D3 | `NP-13-PA-D1-COMPLETION-01 §202–210, §228` |
| D2 eligibility requires **its own future explicit act**; D1 completion, even under a closed completion model, is NOT by itself that act | `NP-13-PA-D1-DECISION-01 §6.2`; `NP-13-PA-D1C-DECISION-01 §8.2`; `NP-13-D1-CM-B-DECISION-01 §6.3`; `NP-13-PA-D1-COMPLETION-01 §9.3, §10.1` |
| D2 eligibility, D2 authorization, and D2 implementation authority are **strictly distinct** and non-inferable states | `NP-13-PA-D1-COMPLETION-01 §10.2` |

4.3 **What the corpus does NOT establish about D2.**

- No `NP-13-D2-01` record exists (no D2 definition).
- No explicit statement of D2's purpose, questions, decisions (D2-A/D2-B/…), inputs, or outputs exists.
- No allocation exists between D2 and D3 of the deferred "D2/D3" subject-matter bucket.
- No positive D2 eligibility checklist exists beyond the meta-rule "its own future explicit act."
- No D2 authorization act exists.
- No D2 implementation authority exists.
- No D2 work (investigative, convening, scoping, sequencing, or implementation) has been started, scheduled, or committed to by any predecessor.

4.4 **D2 classification: NOT DEFINED.** The series placement (next after D1) is the **only** positive fact established. Scope, content, questions, structure, deliverables, and D2-vs-D3 allocation are all undefined.

4.5 **No invention.** No D2 semantics have been inferred from general engineering practice, from the deferred-items list, from D1's structure, or from the alphabetic ordering D0/D1/D2/D3. The non-inference discipline of `NP-13-D1-PREREQ-01 §4` ("conceptual overlap does not constitute governance dependency") applies with full force.

---

## 5. D1 BASELINE VERIFICATION (CLOSED PREDECESSOR)

5.1 **D1 = COMPLETE is confirmed.** The following were re-verified against the live authoritative baseline at `b9af85a…` and are **not reopened**:

| D1 component | Source pin | State |
|---|---|---|
| D1-A — governed-object form = G-O-3 | `NP-13-D1-01 §2.1`, blob `3468cdaa4…` | **SATISFIED** |
| D1-B — exact definition, 540 bytes, SHA-256 `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7` | `NP-13-D1-01 §3.2` | **SATISFIED** |
| D1-C — 10/10 dimensions resolved | `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01`, blob `068ae2a0…` | **RESOLVED 10/10** |
| G-O-3(b) Questions A–G decided | `NP-13-GO3B-DECISION-01`, blob `58e0df87…` | **SATISFIED** |
| G-4 / G-5 continuity boundaries preserved | `NP-13-GO3B-DECISION-01 §G` | **PRESERVED** |
| CM-B C1–C6 completion conditions | `NP-13-D1-CM-B-DECISION-01 §4`, blob `2cc757ec…` | **SATISFIED / DISCHARGED** |
| Explicit PA D1 completion act | `NP-13-PA-D1-COMPLETION-01 §6`, blob `23005923…` | **EXISTS (A — DECLARE D1 COMPLETE, effective 2026-10-03T13:03Z)** |
| D1 completion record durably published to `origin/main` | `docs/integration/NP-13-PA-D1-COMPLETION-01.md` @ `b9af85a…` | **DURABLE** |

5.2 **No contradiction discovered.** D1 is treated as a closed predecessor.

---

## 6. D2 PREREQUISITES AND ELIGIBILITY STATE

6.1 **Existing prerequisites for D2 (from corpus).**

| ID | Existing prerequisite | Source | State |
|---|---|---|---|
| P-1 | D1 COMPLETE (necessary background, series predecessor) | `NP-13-D1-01 §9.1` | **PASS** |
| P-2 | D2 must have its **own future explicit act** to become eligible (meta-condition) | `NP-13-PA-D1-DECISION-01 §6.2`; `NP-13-PA-D1C-DECISION-01 §8.2`; `NP-13-D1-CM-B-DECISION-01 §6.3`; `NP-13-PA-D1-COMPLETION-01 §9.3, §10.1` | **NOT DISCHARGED by D1; requires its own act** |
| P-3 | D2 must be **defined** (scope/questions/structure) before eligibility can be evaluated | Implied by closed-world investigation at §4: without a definition there is nothing to be eligible for; consistent with non-inference discipline | **NOT DEFINED** |

6.2 **Eligibility determination.**

```text
D2 = NOT ELIGIBLE
```

This is not a new judgment — it restates, with explicit closed-world support, the same conclusion already reached by every predecessor record from `NP-13-PA-D1-DECISION-01 §6.2` onward. D1 completion is verified PASS on P-1, but P-2 and P-3 are not discharged, and no corpus provision establishes sufficiency of P-1 alone.

6.3 **Eligibility ≠ Authorization ≠ Implementation authority.** Strictly separated per `NP-13-PA-D1-COMPLETION-01 §10.2`:

```text
D2 eligibility              = NOT ELIGIBLE (§6.2)
D2 authorization            = NOT GRANTED — requires its own explicit act
D2 implementation authority = NOT GRANTED
```

---

## 7. PROGRAM AUTHORITY DECISION

7.1 **Decision rendered.** After the closed-world factual state at §4–§6 was presented, Program Authority Ramki rendered the following decision at the NP-13 PA-D2 Eligibility & Authority gate:

> **PA-D2-01 = 01-A — AUTHORIZE CONVENING OF A FUTURE D2 DEFINITION GATE (NP-13-D2-01)**

Selection 01-B (HOLD D2 INDEFINITE) was not chosen.

7.2 **Scope of the authorized future gate.** The future `NP-13-D2-01` gate, when convened, is authorized to perform only D2 **definition** work, strictly bounded to:

1. Establishing D2's purpose and subject-matter scope within the J-2 / J-3 jurisdiction established by `NP-13-D0-01`;
2. Establishing D2's decision structure (D2-A / D2-B / D2-C or equivalent) without deciding them;
3. Allocating the currently undifferentiated "D2/D3" deferred-matter bucket between D2 and D3 (or explicitly deferring allocation);
4. Identifying D2's inputs, predecessor dependencies, and intended outputs;
5. Determining D2's own eligibility / completion model only insofar as necessary to define D2 itself.

7.3 **What this decision does NOT do.** Selection of Option A does **not**:

- define D2 (that is the future gate's work);
- declare D2 eligible;
- grant D2 authorization beyond convening the definition gate;
- grant D2 work authorization (scoping, sequencing, investigative work beyond definition, or any implementation);
- grant implementation authority;
- allocate any deferred subject matter between D2 and D3;
- bind any repository/ref or compose the baseline;
- determine membership for any workstream;
- perform D2 execution; or
- reopen D1 or modify any predecessor.

7.4 **Future-gate convening authority.** This record is itself the explicit act required to authorize convening `NP-13-D2-01`. No further authority act is required for that convening itself. However, the convening **itself**:

- is a governance act (definition gate), not implementation;
- does not occur in this record — it is a separate future session/gate;
- does not establish D2 eligibility, D2 authorization, or D2 implementation authority until that future gate produces its own durable record and (if applicable) a subsequent eligibility act.

7.5 **D3 remains NOT ELIGIBLE.** Nothing in this decision touches D3. D3 remains NOT ELIGIBLE and requires its own future explicit act(s).

---

## 8. RESULTING GOVERNANCE STATE

8.1 **State table.**

| Governance item | State | Source |
|---|---|---|
| D1 | **COMPLETE** | `NP-13-PA-D1-COMPLETION-01 §7.3` |
| D1 acceptance | **NO SEPARATE ACCEPTANCE STATE** | `NP-13-PA-D1-COMPLETION-01 §9.2` |
| D2 definition | **NOT ESTABLISHED** (future `NP-13-D2-01` convening-authorized by this record) | §4, §7 |
| D2 prerequisites | P-1 PASS; P-2/P-3 NOT DISCHARGED | §6.1 |
| D2 eligibility | **NOT ELIGIBLE** | §6.2 |
| D2 work | **NOT STARTED** | §10 |
| D2 authorization | **NOT GRANTED** (except bounded authorization to convene the future D2-01 definition gate — see §7.2, §7.4) | §7 |
| D2 implementation authority | **NOT GRANTED** | §10 |
| Future `NP-13-D2-01` definition gate | **CONVENING-AUTHORIZED** by this record | §7 |
| D3 | **NOT ELIGIBLE** | §7.5 |
| Implementation authority generally | **NOT GRANTED** | §10 |
| G-4 / G-5 | **PRESERVED UNCHANGED** | §12 |
| M1 / M2 / M3; C-1 / C-2; J-2 / J-3 details; realization semantics; NP-09/10/11/12/13 membership; NP-13 divergence | **NOT DECIDED** — preserved as deferred | §11 |
| IPD | **OUT OF SCOPE — UNTOUCHED** | §1.6 |
| Production | **OUT OF SCOPE — UNTOUCHED** | §1.6 |

8.2 **D2 = NOT ELIGIBLE remains the eligibility state.** The act at §7 authorizes convening a future *definition* gate; it does NOT itself establish D2 eligibility. D2 can become eligible only after (a) D2 is defined by a durable `NP-13-D2-01` record, and (b) a subsequent explicit Program Authority eligibility act is rendered against that definition.

8.3 **No D2 work.** No D2 work — investigative beyond the closed-world governance investigation already performed at this gate, convening, scoping, sequencing, implementation, or otherwise — is performed, started, scheduled, or committed to by this record beyond the single authorization to convene the future definition gate. The future gate's own record will be the artifact that begins D2 definitional work.

---

## 9. SCOPE BOUNDARIES AND EXPLICIT NON-DECISIONS

9.1 This record does **NOT** decide, establish, grant, imply, or authorize:

- any D2 definition (`NP-13-D2-01` is not created by this record);
- any D2-A / D2-B / D2-C question or answer;
- any allocation of deferred subject matters between D2 and D3;
- any baseline composition (J-2) or membership (J-3);
- any repository/ref binding, re-binding rule, or governing-identity designation (G-O-3(b) is preserved unchanged);
- any M1 / M2 / M3 baseline-nature selection;
- any C-1 / C-2 reconciliation;
- any realization semantics;
- any NP-09 / NP-10 / NP-11 / NP-12 / NP-13 membership determination;
- any adjudication of the NP-13 `034384fb…` / `fa9862c9…` divergence;
- any reconciliation record, including `NP-13-RECON-01`;
- any D3 eligibility, start, or convening;
- any implementation, certification, release, production, provider, identity, or security authority;
- any code, runtime, persistence, API, UI, or configuration change;
- any IPD access or mutation.

9.2 **Eligibility is not execution; convening-authorization is not eligibility.** The bounded convening authorization at §7 is a governance-level authorization to open a future gate whose deliverable is a definition record. It is not D2 execution, not D2 eligibility, not D2 work beyond that definitional act, and not implementation authorization.

9.3 **Non-inference preserved.** The non-inference discipline of `NP-13-D1-PREREQ-01 §4` is reaffirmed. Conceptual overlap between this record and any future D2 content creates no dependency, no precedence, and no ordering beyond what is expressly stated.

---

## 10. NO IMPLEMENTATION AUTHORITY

10.1 **Implementation is not authorized.**

```text
IMPLEMENTATION AUTHORITY = NOT GRANTED
```

10.2 This governance publication grants no implementation, source-change, feature-realization, runtime, persistence, identity-mechanism, API, `/evidence` surface, UI, certification, release, provider, security, or production authority. It authorizes no implementation work of any kind.

10.3 The single authority granted is bounded and governance-only: authorization to convene a future D2 **definition** gate (§7.2, §7.4). That gate's own output is a governance record; it is not an implementation authorization.

10.4 Production is out of scope. IPD is read-only and was not accessed or modified (zero mutations).

---

## 11. DEFERRED MATTERS PRESERVED

11.1 The following remain **NOT DECIDED**, preserved unchanged from their predecessor-recorded states, and are **not** resolved, narrowed, or ordered by this record:

| Deferred matter | Preserved state | Source |
|---|---|---|
| M1 / M2 / M3 baseline nature | **UNSELECTED** | `NP-13-D0-01 §4.3`; `NP-13-D1-01 §7.6` |
| C-1 / C-2 durability convention reconciliation | **UNRECONCILED** | `NP-13-D0-01 §4.12`; `NP-13-D1-01 §8.4` |
| J-2 composition detail; J-3 membership positive test | **NOT DECIDED** | `NP-13-D0-01 §2.2`; `NP-13-D1-01 §7.7–§7.8` |
| NP-09 membership (incl. special case A/B/C/D) | **NOT DECIDED** | `NP-13-D1-01 §7.9` |
| NP-10 / NP-11 membership | **NOT DECIDED** | `NP-13-D1-01 §7.10` |
| NP-12 inclusion/exclusion | **NOT DETERMINED** (preserved verbatim) | `NP-13-D1-01 §6.2` |
| NP-13 `034384fb…` / `fa9862c9…` divergence | **NOT ADJUDICATED** | `NP-13-D1-01 §6.4` |
| Realization semantics | **NOT DECIDED** | `NP-13-D1-01 §6.6, §7.13` |
| Terminology harmonization (IIPS/IRR) | **NOT AUTHORIZED** | `NP-13-D1-01 §5.3, §7.15` |
| D2 vs D3 subject-matter allocation | **NOT PERFORMED** | `NP-13-PA-D1-COMPLETION-01 §228`; §4.3 of this record |
| D2 eligibility (positive conditions beyond meta-rule) | **NOT DEFINED** | §4.3, §6.1 of this record |
| D3 eligibility/authorization/implementation | **NOT GRANTED** | §7.5, §8.1 of this record |

11.2 **Describing these exclusions decides none of them.** Nothing in §11 constitutes a determination in the negative; each remains simply **open** for its own future explicit act.

---

## 12. PREDECESSOR PRESERVATION AND BLOB PINS

12.1 **No predecessor is amended.** All twelve NP-13 governance records on the authoritative ref are **byte-identical** before and after this publication, verified by comparing blob identities from the live authoritative tree at `b9af85a…`:

| Predecessor record | Authoritative path | Live `origin/main` blob |
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

12.2 **D1-B fidelity pin preserved.** The definition byte count `540` and SHA-256 `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7` remain the authoritative verification basis for D1-B. This record does not alter that pin.

12.3 **Target-path absence before creation.** `docs/integration/NP-13-PA-D2-DECISION-01.md` was verified absent both locally and on the live authoritative tree immediately before creation (§2.1 row 9), and no competing path matching `PA-D2` exists anywhere in the authoritative tree.

---

## 13. EFFECTIVE POINT, DURABILITY, AND VERIFICATION

13.1 **Effective point.** The convening authorization at §7 is effective at **2026-10-03T13:16Z (UTC)**. Durability of this record is established only by publication to `ramkivs/iips-review-recovered @ refs/heads/main` with independent remote verification of commit, tree, and blob.

13.2 **Universal Artifact Durability Invariant applied.** Arena workspace state is not authoritative; local commits are not authoritative; untracked files are not durable; Arena-only branches are not durable. The invariant was executed in full:

```text
AUTHORITATIVE REPO
→ AUTHORITATIVE REMOTE
→ AUTHORITATIVE REF
→ VERIFIED LIVE BASELINE (b9af85a… / 70d46870…)
→ CLEAN WORKTREE CONFIRMED
→ TARGET PATH ABSENCE CONFIRMED
→ MUTATION (single additive file)
→ EXACT DIFF REVIEW
→ COMMIT
→ PUSH + PR
→ INDEPENDENT REMOTE VERIFICATION (post-merge)
→ REACHABILITY FROM refs/heads/main
→ TREE/BLOB VERIFICATION
→ CLEAN WORKTREE
```

13.3 **Diff scope.** The publication commit contains **only**:

```text
docs/integration/NP-13-PA-D2-DECISION-01.md
```

No predecessor NP-13 record, no NP-12 record, no `iips-platform` file, no configuration file, no code file, and no other path enters the commit. This will be verified by exact diff inspection before commit.

13.4 **Fail-closed rule.** If independent remote verification of the commit, tree, blob, reachability from `refs/heads/main`, or clean worktree fails at any point, this publication **fails closed** and durability of this record is not established.

13.5 **Artifact self-identity.** The durable Git blob identity of this record is established by remote verification after publication and is not self-asserted here.

---

## 14. AUTHORITY ATTESTATION

**Program Authority:** Ramki (Ramakrishnan)

**Date:** 2026-10-03

**Decision status:** The PA-D2 eligibility/authority decision at §7 is the Program Authority's explicit selection at this gate and is recorded without re-selection, without inference, and without reopening any predecessor decision.

**Approval:**

```text
D1 = COMPLETE (re-verified against live origin/main @ b9af85a…)
D1-A  = SATISFIED
D1-B  = SATISFIED (540 bytes / SHA-256 29f2d5f6…dcc7)
D1-C  = RESOLVED 10/10 (blob 068ae2a0…)
G-O-3(b) A–G = ACCEPTED / DURABLE / CLOSED
G-4 / G-5 = PRESERVED UNCHANGED

D2 DEFINITION = NOT ESTABLISHED (no NP-13-D2-01 exists)
D2 ELIGIBILITY = NOT ELIGIBLE (P-1 PASS; P-2/P-3 NOT DISCHARGED)

PA-D2-01 = 01-A — AUTHORIZE CONVENING OF A FUTURE D2 DEFINITION GATE (NP-13-D2-01)
  (bounded to definition work only per §7.2; does not itself define D2 or grant eligibility/work/implementation)

D2 = NOT ELIGIBLE
D2 WORK = NOT STARTED
D2 IMPLEMENTATION AUTHORITY = NOT GRANTED
FUTURE NP-13-D2-01 GATE = CONVENING-AUTHORIZED
D3 = NOT ELIGIBLE
IMPLEMENTATION AUTHORITY = NOT GRANTED
IPD = OUT OF SCOPE / UNTOUCHED
PRODUCTION = OUT OF SCOPE / UNTOUCHED
```

**Attested limitations:**

```text
No D2 definition is created by this record.
No D2 eligibility is established by this record.
No D2 work beyond governance investigation and the bounded convening authorization is started.
No D2 implementation or implementation authority is granted.
No D2-A / D2-B / D2-C structure is created.
No D2 vs D3 subject-matter allocation is performed.
No deferred matter at §11 is resolved, narrowed, or ordered.
No predecessor is amended, reopened, or superseded.
No code, configuration, runtime, persistence, API, or UI is modified.
Production is out of scope. IPD was not accessed and was not modified.
```

**End of `NP-13-PA-D2-DECISION-01`.**
