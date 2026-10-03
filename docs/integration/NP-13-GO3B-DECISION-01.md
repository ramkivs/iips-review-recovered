# NP-13 — G-O-3(b) A–G DECISION SET: DURABLE GOVERNANCE PUBLICATION

> **Record identifier:** `NP-13-GO3B-DECISION-01` — G-O-3(b) Questions A–G Accumulated Decision Set
> **Document type:** `AUTHORITY DECISION` — additive G-O-3(b) A–G durability publication record
> **Date:** 2026-10-03
> **Signer:** Ramki (Ramakrishnan)
> **Title / Role:** Program Authority
> **Status:** **G-O-3(b) A–G = DECIDED + DURABLY PUBLISHED** · **D1-C = DECIDED + DURABLY RECORDED** · **D1 = INCOMPLETE**
> **Decision:** **A = REPOSITORY BINDING REQUIRED** · **B = B-3 DUAL COORDINATE** · **C = C-4 DELIBERATELY SEPARATED ROLES** · **D = D-3 EXPLICIT EVIDENCE REFRESH** · **E = E-3 EXPLICIT ACT + VERIFICATION + HISTORICAL PRESERVATION** · **F = F-3 GIT TREE PRIMARY EVIDENCE + COMMIT SUPPORTING PROVENANCE** · **G = G-4 GOVERNANCE-OBJECT CONTINUITY + G-5 EXPLICIT-GOVERNANCE-ACT TRIGGER CLASS ONLY**
> **Governing authority basis:** `NP-13-D0-01` (`docs/integration/NP-13-D0-01.md`) — J-1 (Definition) jurisdiction
> **Predecessors:** `NP-13-D0-01` (`docs/integration/NP-13-D0-01.md`), `NP-13-D1-01` (`docs/integration/NP-13-D1-01.md`), `NP-13-D1-C-01` (`docs/integration/NP-13-D1-C-01.md`), `NP-13-GO3B-01` (`docs/integration/NP-13-GO3B-01.md`), and `NP-13-D1-PREREQ-01` (`docs/integration/NP-13-D1-PREREQ-01.md`)
> **Additive character:** This record is additive only. It does not rewrite, amend, delete, or supersede the text of `NP-13-D0-01.md`, `NP-13-D1-01.md`, `NP-13-D1-C-01.md`, `NP-13-GO3B-01.md`, or `NP-13-D1-PREREQ-01.md`.
> **Repository:** IRR — `ramkivs/iips-review-recovered` · **Authoritative durability destination:** `origin/main` (`refs/heads/main`)
> **IPD:** `ramkivs/iips-production-market-data` — READ-ONLY / PRESERVE (zero mutations) · **Production:** OUT OF SCOPE
> **Authority granted by this record:** **NONE** — this is a governance record, not an implementation authorization (§11)

---

## 1. PURPOSE, CHARACTER, AND DECISION

1.1 **Purpose.** This record durably publishes the complete accumulated **G-O-3(b) Questions A–G** decision set rendered by the Program Authority. It is a **durability publication**, not an investigation. It does not re-investigate, reopen, re-decide, reinterpret, or re-derive A–G, and it does not reopen D0, D1-A, D1-B, or D1-C.

1.2 **Decision-establishment vs. durable publication.** Two distinct things are separated throughout this record:

| Concept | Meaning | Where it occurred |
|---|---|---|
| **Decision establishment** | The Program Authority's exercise of J-1 jurisdiction selecting an option for a dimension | At the G-O-3(b) A–G decision gate(s) |
| **Durable publication** | The additive recording of an already-established decision to authoritative `origin/main` | **This record** |

This record performs the second only. Publication does not create the decisions, and the decisions did not require publication to have been rendered. Conversely, per convention **C-1** (`NP-13-D1-01 §8.4`), authoritative closure requires publication to IRR `main`; a local file, session-branch commit, or open pull request is **not** authoritative `main` publication.

1.3 **Governance authority vs. Git workflow.** The Git mechanics used to publish this record (branch, commit, push, pull request, merge) are **workflow**, not **governance acts**. Per **D-3** (§5) and **E-3** (§6), ordinary Git operations are not governance acts. Nothing in the mechanics of this publication constitutes a binding act, a rebinding act, an evidence-refresh act, or an identity-transition act.

1.4 **The decision set.** The Program Authority's decisions are:

| # | G-O-3(b) Dimension | Selected model | Section |
|:---:|---|---|:---:|
| **A** | Repository binding requirement | **REPOSITORY BINDING REQUIRED** — as a governance/evidence relationship | §2 |
| **B** | Ref binding requirement / type / target | **B-3 — DUAL COORDINATE** | §3 |
| **C** | Positive repository/ref role | **C-4 — DELIBERATELY SEPARATED COMBINATION** | §4 |
| **D** | Ref advancement effect | **D-3 — EXPLICIT EVIDENCE REFRESH** | §5 |
| **E** | Binding / re-binding rule and procedure | **E-3 — EXPLICIT ACT + VERIFICATION + HISTORICAL SUPERSESSION** | §6 |
| **F** | Commit / tree role | **F-3 — GIT TREE PRIMARY + COMMIT SUPPORTING PROVENANCE** | §7 |
| **G** | Identity preservation across binding changes | **G-4 — GOVERNANCE-OBJECT CONTINUITY**, with **G-5 — EXPLICIT-GOVERNANCE-ACT TRIGGER CLASS ONLY** | §8 |

1.5 **Relationship to `NP-13-GO3B-01` Option E.** `NP-13-GO3B-01 §1.2` recorded **G-O-3(b) DECISION = E — REPOSITORY/REF SEMANTICS REMAIN UNRESOLVED**, and `NP-13-GO3B-01 §2` recorded Questions A–G as **UNRESOLVED** as at that gate's effective point (2026-10-02). `NP-13-D1-PREREQ-01 §2 row 3` and `§5.1` restated that state as at its own effective point.

Those records are **historically accurate as at their own effective points and are not amended, corrected, or characterized as erroneous by this record.** This record publishes the **subsequent** A–G decision set. Consistent with the **F-3** rule that *"evidence refresh supersedes the current evidence designation but does not erase historical evidence"* (§7.3), the effect is:

- **Going forward**, the A–G disposition is as recorded in §§2–8 of this record.
- **Historically**, `NP-13-GO3B-01` and `NP-13-D1-PREREQ-01` remain valid records of the unresolved state at their effective points.
- `NP-13-GO3B-01 §4` (*"D1 cannot complete without resolving G-O-3(b)"*) is **satisfied in respect of A–G** by this publication; D1 nevertheless **remains `INCOMPLETE`** (§10.3).
- `NP-13-GO3B-01 §3` **negative boundaries remain in full force and unchanged** (§9). Every decision in §§2–8 is consistent with, and reaffirms, those boundaries.

1.6 **No inference from repository mechanics.** No decision in §§2–8 may be inferred from repository proximity, branch naming, commit ancestry, pull-request numbering, merge mechanics, or durability storage. Each is established only by the Program Authority's explicit act recorded here.

---

## 2. A — REPOSITORY BINDING

2.1 **Decision.** Repository binding **is required**.

2.2 **Established semantics.** Repository binding, for the active non-production IIPS feature baseline:

1. **is a relationship**;
2. **is not governed-object identity**;
3. **does not itself create a new governed object**;
4. **must not be inferred from repository mechanics.**

2.3 **Consequences.**

2.3.1 Because binding is a **relationship** and not an identity, establishing a repository binding does not convert the repository into the governed object, and does not make the repository's identity the governed object's identity. The governed object remains the logical governed baseline (§8.2), consistent with D1-B (`NP-13-D1-01 §3.1`) and `NP-13-GO3B-01 §3` boundary 1.

2.3.2 Because binding **does not itself create a new governed object**, a first binding, a change of binding, or the absence of a binding is not an identity-creation event. Identity transition is governed exclusively by **G-4 / G-5** (§8).

2.3.3 Because binding **must not be inferred from repository mechanics**, no binding is established by: storage location, publication route, commit ancestry, branch lineage, pull-request merge, fast-forward, repository clone, checkout, ref advertisement, or any other mechanical Git or GitHub operation. A binding requires an **explicit governance act** under **E-3** (§6) together with successful target verification.

2.3.4 **A is not self-executing.** Decision A establishes that binding is a **required** governance/evidence relationship. It does **not** name a repository as bound, does **not** designate a bound target, and does **not** record that any binding is presently effective. Any actual binding, and its target, require their own explicit act under **E-3** (§6). Nothing in `ramkivs/iips-review-recovered` — including `origin/main`, `main`, `ed459246a05f1cb4231cf17b8955c0d491189b28`, or tree `90e9ad2fc9a6d2cd6a62ba243b6b31bbab23c4d7` — is designated as a bound repository or bound target by this record.

2.4 **Terminology note — not resolved.** Decision A is expressed in respect of *"the active non-production IIPS feature baseline"*, following the verbatim D1-B wording (`NP-13-D1-01 §3.1`, 540 bytes, SHA-256 `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7`). The relationship between the `IIPS` wording in D1-B and the `IRR` jurisdiction wording in `NP-13-D0-01 §2.2` — noted as unresolved at `NP-13-GO3B-01 §2` row A — **remains unresolved**. This record does not harmonize, prefer, or reconcile either terminology, and no terminology decision may be inferred from the wording used here.

---

## 3. B — REF SEMANTICS

3.1 **Decision.** The selected model is:

> **B-3 — DUAL COORDINATE**

3.2 **Established model.** The governance/evidence model consists of **three** elements:

1. **repository**;
2. **mutable operational ref**;
3. **immutable content-addressed evidence coordinate**.

3.3 **Non-collapse rule.** These three **must not be collapsed into one identity.** Each is a distinct coordinate with a distinct role. In particular:

- the repository is not the operational ref;
- the operational ref is not the evidence coordinate;
- the evidence coordinate is not the repository;
- no one of the three is the governed-object identity (§8.2).

3.4 **Mutability asymmetry.** The operational ref is **mutable** — it moves as an ordinary consequence of Git operation. The evidence coordinate is **immutable** and **content-addressed** — it does not move, and a change of evidence coordinate is a change to a different coordinate, not a mutation of the same one. This asymmetry is the structural basis of **D-3** (§5) and **F-3** (§7).

3.5 **Evidence object class — refined by F.** The evidence object class under B-3 is refined by **F-3** (§7) as follows:

- **Git tree** = **primary immutable evidence coordinate**;
- **Git commit** = **supporting provenance**.

3.6 **No target designated.** Decision B establishes the **model**. It does **not** select, name, or bind any specific repository, any specific operational ref, or any specific evidence coordinate. No ref binding and no evidence designation is effected by this record. Any such designation requires its own explicit act under **D-3** (§5) or **E-3** (§6).

---

## 4. C — POSITIVE GOVERNANCE ROLE

4.1 **Decision.** The selected model is:

> **C-4 — DELIBERATELY SEPARATED COMBINATION**

4.2 **Established roles.** The roles are **deliberately separated**:

| Coordinate | Positive role |
|---|---|
| **Operational ref** | **governance / realization coordinate** |
| **Immutable evidence coordinate** | **authoritative evidence coordinate** |
| **Neither** | **governed-object identity** |

4.3 **The governed object.** The governed object **remains the logical governed baseline** — that is, the D1-B baseline object (`NP-13-D1-01 §3.1`, `§3.4`), which is component (a) of the G-O-3 two-component form (`NP-13-D1-01 §2.2`).

4.4 **Consequences of separation.**

4.4.1 **No role fusion.** Because the combination is *deliberately separated*, the two coordinates are **not** interchangeable, **not** mutually substitutable, and **not** jointly merged into a single governing role. A statement about the operational ref is not a statement about the evidence coordinate, and vice versa.

4.4.2 **Neither coordinate is identity.** This reaffirms `NP-13-GO3B-01 §3` boundaries 1 and 2 and `NP-13-D1-C-01 §2` Semantics 2 and 4: governed-object identity ≠ repository/ref identity, and evidence-pin identity ≠ governing-object identity.

4.4.3 **Realization coordinate ≠ realization semantics.** Designating the operational ref as the *governance/realization coordinate* establishes **where** realization is coordinated. It does **not** establish **realization semantics** — that is, whether a baseline member must be merged, deployed, reachable, or merely accepted. Realization semantics remain **NOT DECIDED** (`NP-13-D1-01 §6.6`, `§7.13`), and are expressly deferred by §10.4 of this record.

4.4.4 **Evidence coordinate ≠ evidence content determination.** Designating the immutable evidence coordinate as the *authoritative evidence coordinate* establishes **what class of object** carries authoritative evidence. It does not itself designate **which** evidence object is currently authoritative; that requires an explicit evidence-refresh act under **D-3** (§5).

---

## 5. D — REF ADVANCEMENT / EVIDENCE REFRESH

5.1 **Decision.** The selected model is:

> **D-3 — EXPLICIT EVIDENCE REFRESH**

5.2 **Established rules.**

1. **Operational ref movement is mechanical.** Movement of the operational ref is an ordinary mechanical consequence of Git operation.
2. **Ref movement does not itself change governed-object identity.** Advancement of the operational ref is not an identity event (§8).
3. **Evidence does not automatically change merely because the ref advances.** The authoritative evidence coordinate does not silently follow the operational ref.
4. **`{ref=C2; evidence=tree(C1)}` is valid.** It is a legitimate, well-formed governance state for the operational ref to stand at commit `C2` while the authoritative evidence coordinate remains `tree(C1)`. Such a state is **not** an inconsistency, **not** an error, and **not** a latent obligation to refresh.
5. **Evidence refresh requires an explicit verification / evidence-refresh act.** The authoritative evidence coordinate changes **only** by an explicit act.
6. **Ordinary Git operations are not governance acts.** Commit, merge, fast-forward, push, pull-request creation, pull-request merge, branch movement, rebase, checkout, fetch, and tag creation are **not** evidence-refresh acts, **not** binding acts, and **not** identity acts.
7. **Evidence refresh is distinct from governed-baseline change.** Refreshing the authoritative evidence coordinate does not change the governed baseline, and changing the governed baseline is not accomplished by refreshing evidence.

5.3 **Consequences.**

5.3.1 **No automatic pin drift.** Because evidence does not follow the ref automatically, there is **no** implied or default rule by which the current `origin/main` tree becomes the authoritative evidence coordinate upon each merge. In particular, the merge of this record advances the operational ref and does **not** effect an evidence refresh.

5.3.2 **Staleness is not a defect.** A `{ref=C2; evidence=tree(C1)}` state is valid per rule 4. No gate, reviewer, or reconciliation process may treat it as requiring correction, and no automatic reconciliation is authorized.

5.3.3 **Refresh is an act with its own requirements.** An evidence-refresh act is an explicit governance act. Where it also involves a change of binding target, the requirements of **E-3** (§6) apply in full, including successful target verification and preservation of the historical prior designation.

5.3.4 **Supersession without erasure.** Per **F-3** (§7.3), an evidence refresh supersedes the **current evidence designation** but does **not** erase historical evidence. Prior evidence designations remain valid historical evidence of the state at their own effective points.

5.4 **Concrete illustration from this repository's own baseline advancement.** Between the publication of `NP-13-GO3B-01` and the publication of this record, the operational ref `origin/main` advanced across multiple merges (§12.4). Each such advancement was **mechanical** in the sense of rule 1 and effected **no** evidence refresh under rule 5 and **no** identity transition under §8. The predecessor records' pinned evidence values (recorded at §12.3) remained valid historical evidence throughout, per rule 3 and §7.3.

---

## 6. E — REBINDING

6.1 **Decision.** The selected model is:

> **E-3 — EXPLICIT ACT + VERIFICATION + HISTORICAL SUPERSESSION**

6.2 **Required elements.** A binding / rebinding change requires **all** of the following:

1. **explicit governance act**;
2. **successful target verification**;
3. **durable recording**;
4. **effective point / state**;
5. **preservation of the historical prior binding**.

6.3 **Element semantics.**

6.3.1 **Explicit governance act.** The act must be an express exercise of Program Authority jurisdiction. It is not satisfied by intention, implication, course of dealing, repository proximity, or any Git operation (§5.2 rule 6).

6.3.2 **Successful target verification.** The intended binding target must be verified to exist and to be what the act purports to bind. Verification is a **precondition of effectiveness**, not a subsequent formality.

6.3.3 **Durable recording.** The binding must be durably recorded. Per convention **C-1**, authoritative durability is publication to IRR `origin/main`; a local file, session-branch commit, or open pull request is **not** authoritative `main` publication (`NP-13-D1-01 §8.4`).

6.3.4 **Effective point / state.** The binding has a determinate effective point. Before that point the prior state governs; from that point the new binding governs.

6.3.5 **Preservation of the historical prior binding.** The prior binding is **superseded, not erased**. It remains a valid historical record of the binding state at its own effective point. This mirrors the **F-3** supersession-without-erasure rule (§7.3).

6.4 **Fail-closed rules.** The following are **fail-closed**:

| Condition | Consequence |
|---|---|
| **Failed target verification** | **New binding NOT effective.** The prior binding **remains active**. |
| **Governance record without successful verification** | **PENDING** — recorded as pending, **not** an effective binding. |
| **Verification without governance act** | **NOT a binding decision.** Successful verification alone effects nothing. |

6.4.1 **No partial effectiveness.** There is no partially effective binding. A binding is either effective (all five elements of §6.2 satisfied) or it is not.

6.4.2 **Failure does not create a gap.** Because the prior binding remains active on failed verification, a failed rebinding attempt never leaves the governed object unbound or in an indeterminate binding state.

6.5 **Repository migration.** **Repository migration does not automatically create a new governed object.** Migration may change the repository element of the B-3 model (§3.2 item 1) and may require a rebinding act under §6.2, but it is not an identity-creation event (§8.3, §8.4).

---

## 7. F — COMMIT / TREE EVIDENCE ROLE

7.1 **Decision.** The selected model is:

> **F-3 — GIT TREE PRIMARY + COMMIT SUPPORTING PROVENANCE**

7.2 **Established classification.**

| Item | Value |
|---|---|
| **Evidence class** | **content-addressed immutable snapshot** |
| **Primary evidence coordinate** | **Git tree** |
| **Supporting provenance** | **Git commit** |

7.3 **Established rules.**

1. **Tree is immutable / content-addressed.** A Git tree is identified by its content hash and does not mutate; a different content is a different tree.
2. **Tree establishes exact realization content.** The tree is the coordinate that determines precisely what content is realized.
3. **Commit provides supporting provenance / history.** The commit supplies authorship, timing, message, and parentage — provenance **about** the content, not the content itself.
4. **Equivalent trees can exist under different commits.** Two or more distinct commits may reference one and the same tree. Tree identity and commit identity are therefore **independent**.
5. **Evidence replay is based on the tree.** Replaying or re-verifying evidence operates on the tree, not on the commit.
6. **Historical evidence remains valid.** A previously designated tree remains valid evidence of the state at its own effective point.
7. **Evidence refresh supersedes the current evidence designation but does not erase historical evidence.** Supersession is of the **designation**, not of the **evidence**.
8. **Tree is evidence, never governed-object identity.**
9. **Commit is provenance, never governed-object identity.**

7.4 **Consequences.**

7.4.1 **Refinement of B-3.** Rules 8 and 9 discharge the B-3 requirement (§3.5) that the evidence object class be refined: the **immutable content-addressed evidence coordinate** of B-3 is the **Git tree**, and the Git commit occupies a **supporting provenance** role only.

7.4.2 **Rule 4 prevents commit-based evidence ambiguity.** Because equivalent trees may exist under different commits, a commit SHA is **not** a sufficient evidence coordinate on its own. Two records citing different commits may be citing identical evidence content. Reconciliation must therefore proceed on the **tree**, per rule 5.

7.4.3 **Provenance remains recorded.** Nothing in F-3 discards commit provenance. Commit SHAs continue to be recorded in governance provenance tables — including §12 of this record — in their **supporting provenance** role. Recording a commit SHA is not thereby a designation of primary evidence.

7.4.4 **No identity from either.** Rules 8 and 9 reaffirm `NP-13-GO3B-01 §3` boundaries 1, 2, and 5 and `NP-13-D1-C-01 §2` Semantics 2, 3, 4, and 6. Neither a tree nor a commit is, becomes, or confers the governed-object identity (§8.2).

7.4.5 **This record's own evidence status.** The trees and commits pinned at §12 are recorded as **provenance and preservation pins for this publication**. They are **not** designated as the authoritative evidence coordinate for the governed feature baseline. No evidence refresh is effected by this record (§5.2 rules 5–6).

---

## 8. G — GOVERNED-OBJECT IDENTITY PRESERVATION CONTRACT

8.1 **Decision.** The selected model is:

> **G-4 — GOVERNANCE-OBJECT CONTINUITY**

> with **G-5 — EXPLICIT-GOVERNANCE-ACT TRIGGER CLASS ONLY**

8.2 **The governed-object identity.** The governed-object identity is:

```text
the governed logical object — the active non-production IIPS
feature baseline as the authoritative logical representation.
```

8.2.1 **Conferred by nothing mechanical.** That identity is conferred by:

- **no repository**;
- **no branch**;
- **no operational ref**;
- **no tree**;
- **no commit**;
- **no evidence artifact**.

8.2.2 **Fidelity to D1-B.** §8.2 restates the identity established by the verbatim D1-B definition (`NP-13-D1-01 §3.1`, 540 bytes, SHA-256 `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7`) and the `NP-13-D1-C-01 §2` Semantic 1 boundary (*authoritative logical representation*). **D1-B is unchanged and is not restated, re-rendered, normalized, or re-derived by this record.** Any later verification of D1-B must proceed against the pinned byte count and digest, not against any rendering in this record.

8.3 **Identity-preserving changes.** The following **preserve** governed-object identity:

1. operational-ref movement;
2. evidence refresh;
3. feature-neutral realization change;
4. **feature-affecting realization change, by default**;
5. operational-ref designation change;
6. repository migration;
7. provenance change with unchanged tree;
8. **tree change, by default**.

8.3.1 **Meaning of "by default".** Items 4 and 8 preserve identity **by default** — that is, in the absence of an explicit governance act under §8.5. The default is a **continuity** default, not an **immunity** from transition: an explicit governance act may establish an identity transition in connection with such a change. Absent that act, identity is preserved.

8.3.2 **No automatic transition from magnitude.** Neither the size, nor the significance, nor the feature-affecting character of a realization change automatically produces an identity transition. Continuity is the default regardless of magnitude.

8.4 **Insufficient by themselves to create new identity.** The following are **insufficient individually**:

1. commit creation;
2. commit merge;
3. PR merge;
4. branch movement;
5. branch rename;
6. branch deletion;
7. tag creation;
8. tree change;
9. blob change;
10. evidence refresh;
11. repository migration;
12. ref rebinding.

8.4.1 **Scope of the list.** §8.4 states **insufficiency**, not **prohibition**. None of these operations is forbidden; each is simply **not sufficient on its own** to create a new governed-object identity. No negative determination about any other matter is made by listing an item here.

8.4.2 **Item 12 and §6.** Ref rebinding (item 12) is governed procedurally by **E-3** (§6) and is **identity-insufficient** under §8.4. A rebinding therefore changes the binding relationship while preserving governed-object identity, consistent with **A** (§2.2 item 3) and with §6.5.

8.4.3 **Items 8–9 and §7.** Tree change and blob change (items 8–9) are identity-insufficient, consistent with **F-3** rules 8–9 (§7.3): a tree is evidence and never identity, so a change of tree cannot be a change of identity.

8.5 **Explicit identity-transition trigger.** The **ONLY** sufficient trigger class established by G is:

```text
an explicit governance act that changes the recognized governed logical object
```

8.5.1 **Trigger class only — G-5.** G establishes the **trigger class**. It does **not** establish any mechanism **within** that class.

8.5.2 **Expressly NOT invented by this record.** The following are **not** established, not specified, not implied, and not sketched by G:

- **stable identifier syntax**;
- **identifier format**;
- **version numbering**;
- **epoch numbering**;
- **succession mechanics**;
- **supersession mechanics**;
- **ownership semantics**.

These **remain D1-C unresolved dimensions** (§10.1, §10.2). No such mechanism may be inferred from the existence of the trigger class, from the wording of §8.5, from the structure of this record, or from the ordering of its sections.

8.6 **Important G boundary — G does NOT decide.** G does **NOT** decide, establish, resolve, rank, or imply any of the following:

| Category | Items NOT decided by G |
|---|---|
| **Composition / membership** | **J-2** composition · **J-3** membership |
| **Baseline nature** | **M1** · **M2** · **M3** |
| **Durability conventions** | **C-1** · **C-2** (unreconciled tension) |
| **Terminology** | IIPS / IRR terminology (§2.4) |
| **Realization** | realization semantics (§4.4.3) |
| **Workstream status** | **NP-12 status** (`NP-12 STATUS = NOT DETERMINED` preserved verbatim) |
| **Other identity planes** | runtime identity · tenant identity · persistence identity |
| **Authorities** | production authority · certification authority · release authority · provider authority · security authority |
| **Technology** | implementation technology |

8.7 **No extension of G.** G must **not** be extended beyond the scope of §§8.2–8.6. Any extension requires its own separate explicit gate and its own authority act (`NP-13-D0-01 §2.3`).

---

## 9. PRESERVED NEGATIVE BOUNDARIES

9.1 All negative boundaries established by `NP-13-D1-01` (D1-B), `NP-13-D1-C-01` (D1-C), and preserved at `NP-13-GO3B-01 §3` remain **in full force and unchanged**:

1. **Governed-object identity ≠ repository/ref identity.**
2. **Evidence-pin identity ≠ governing-object identity.**
3. **Governance identity ≠ runtime identity.**
4. **Durability destination `IRR @ origin/main` ≠ governed-object identity or binding.**
5. **No definition by association.**

9.2 The seven concepts — (1) governed-object identity, (2) evidence/reference identity, (3) durability-record destination, (4) repository, (5) branch/ref, (6) commit/tree, and (7) implementation realization — remain **strictly distinct and non-interchangeable**.

9.3 **Consistency attestation.** Every decision recorded at §§2–8 is consistent with §9.1–§9.2. Specifically: **A** (§2.2 items 2, 4) reaffirms boundaries 1, 4, 5; **B-3** (§3.3) reaffirms boundary 1 and the distinctness of concepts 4, 5, 6; **C-4** (§4.2) reaffirms boundaries 1, 2; **D-3** (§5.2 rules 2, 6) reaffirms boundaries 1, 4, 5; **E-3** (§6.3.1) reaffirms boundary 5; **F-3** (§7.3 rules 8, 9) reaffirms boundaries 1, 2, 5; **G-4/G-5** (§8.2.1) reaffirms boundaries 1, 2, 3, 4, 5.

9.4 **No boundary is narrowed.** Nothing in §§2–8 narrows, qualifies, or creates an exception to any boundary at §9.1.

---

## 10. EXPLICIT DEFERMENTS

10.1 **D1-C dimensions — UNRESOLVED.** The following `NP-13-D1-C-01 §3` dimensions remain explicitly **UNRESOLVED** and are **not** silently resolved, advanced, or answered by this record:

| # | Dimension | Status after this record |
|---:|---|---|
| **#1** | stable baseline identifier | **UNRESOLVED** |
| **#2** | identifier form | **UNRESOLVED** |
| **#3** | version / epoch axis | **UNRESOLVED** |
| **#4** | temporal / effective-point identity | **UNRESOLVED** |
| **#5** | continuity mechanics | **UNRESOLVED** |
| **#8** | object supersession | **UNRESOLVED** |
| **#9** | collision handling | **UNRESOLVED** |
| **#10** | object ownership | **UNRESOLVED** |

10.2 **D1-C dimensions — PARTIALLY RESOLVED.** The following are resolved **only at trigger-class level** by **G-5** (§8.5) and remain otherwise **UNRESOLVED**:

| # | Dimension | Status after this record |
|---:|---|---|
| **#6** | new-identity trigger | **PARTIALLY RESOLVED** — resolved only at trigger-class level (§8.5). No mechanism within the class is established. |
| **#7** | identity preservation under change | **PARTIALLY RESOLVED** — resolved only at trigger-class level (§8.3, §8.4, §8.5). No mechanism within the class is established. |

10.2.1 **Boundary of the partial resolution.** The partial resolution at §10.2 establishes **what class of event** can trigger a transition, and **what changes preserve** identity. It does **not** establish any identifier, format, numbering, epoch, succession, supersession, or ownership mechanism (§8.5.2). Dimensions #6 and #7 are **not** closed, and are **not** recorded as `DECIDED`.

10.3 **Other deferred items.** The following remain **NOT DECIDED** and are deferred:

| Deferred item | Preserved source |
|---|---|
| **J-2** composition | `NP-13-D0-01 §2.2`, `NP-13-D1-01 §7.7` |
| **J-3** membership (incl. positive membership test) | `NP-13-D0-01 §2.2`, `NP-13-D1-01 §7.8` |
| **M1 / M2 / M3** baseline nature | `NP-13-D0-01 §4.3`, `NP-13-D1-01 §7.6` |
| **C-1 / C-2** durability-convention reconciliation | `NP-13-D0-01 §4.12`, `NP-13-D1-01 §8.4`, `§7.14` |
| **Realization semantics** | `NP-13-D1-01 §6.6`, `§7.13` |
| **NP-12 status** | `NP-12 STATUS = NOT DETERMINED` — **preserved verbatim** |
| **NP-09 / NP-10 / NP-11 / NP-13 membership**; NP-13 `034384fb…` / `fa9862c9…` divergence eligibility | `NP-13-D1-01 §6.2`, `§6.4`, `§7.9`–`§7.12`; `NP-13-GO3B-01 §5` |
| **Runtime identity** | `NP-13-D1-C-01 §2` Semantic 5 |
| **Tenant identity** | `NP-13-D1-C-01 §2` Semantic 6 |
| **Persistence identity** | `NP-13-D1-C-01 §2` Semantic 6 |
| **Production authority** | `NP-13-D0-01 §2.4`; `NP-13-D1-C-01 §5.3` |
| **Certification authority** | `NP-13-D1-C-01 §5.3`; `NP-13-D1-01 §6.7` |
| **Release authority** | `NP-13-D1-C-01 §5.3`; `NP-13-D1-01 §6.7` |
| **Provider authority** | This record §11.2 |
| **Security authority** | This record §11.2 |
| **Implementation technology** | This record §11.2 |
| **D2 / D3** | `NP-13-D1-01 §6.8`, `§7.16`; `NP-13-GO3B-01 §5` |
| **Any reconciliation record** (incl. `NP-13-RECON-01`) | `NP-13-D1-01 §7.17` |

10.4 **No silent resolution.** Nothing at §§2–8 resolves any item at §10.1–§10.3. Where a decision in §§2–8 is adjacent in subject matter to a deferred item, adjacency creates **no** governance dependency, **no** prerequisite relation, **no** precedence, and **no** ordering — reaffirming `NP-13-D1-PREREQ-01 §4`.

10.5 **Prerequisite ordering remains unresolved.** `NP-13-D1-PREREQ-01` recorded prerequisite ordering among the remaining unresolved D1 components as **UNRESOLVED (Option E)**, with **no** explicit authority act establishing an ordering. This record **does not** establish, supply, default, or imply any such ordering, and is not itself an ordering act.

---

## 11. AUTHORITY AND SCOPE

11.1 **Authority granted: NONE.** This publication records governance decisions already made at gate level. It does **NOT** grant:

- **implementation authority**;
- **feature realization authority**;
- **production authority**;
- **certification authority**;
- **release authority**;
- **provider authority**;
- **security authority**;
- **persistence implementation authority**.

11.2 **No broader authority by inference.** Broader authority must **not** be inferred from this publication — including by inference from its subject matter, its placement, its publication route, its merge to `main`, its length, or its comprehensiveness.

11.3 **Program Authority.** Program Authority remains:

```text
Ramki
```

11.4 **Character of the artifact.** This artifact is a **governance record**, not an **implementation authorization**. It authorizes no code, no configuration, no runtime behavior, no deployment, no test, and no migration.

11.5 **Jurisdictional basis.** This record is an exercise within **J-1 (Definition)** jurisdiction as established by `NP-13-D0-01 §2.2`. Per `NP-13-D0-01 §2.3`, that jurisdiction is subject-matter bounded and every exercise requires its own explicit act; per `§2.4` it is confined to the **active non-production** baseline and confers nothing with respect to production. It creates no **J-2** or **J-3** act.

11.6 **Scope exclusions reaffirmed.** **Production: OUT OF SCOPE.** **IPD (`ramkivs/iips-production-market-data`): READ-ONLY / PRESERVE — not accessed for mutation, zero mutations.** **NP-12: READ-ONLY / PRESERVE — no NP-12 authority is created, changed, or attributed to NP-13 by this record.** **No new integration gate is established, convened, or authorized by this record.**

---

## 12. PROVENANCE AND PRESERVATION VERIFICATION

12.1 **Verification method.** All values in §12 were **independently recomputed during this publication session** by a fresh read path. No previously reported SHA was reused as authoritative. Values were confirmed by **both** local Git object inspection **and** an independent GitHub API read of `refs/heads/main`. **No SHA in this record is fabricated.**

12.2 **Pre-publication authoritative baseline.**

| Pin | Verified value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Authoritative remote | `origin` — `https://github.com/ramkivs/iips-review-recovered.git` |
| Authoritative ref | `origin/main` (`refs/heads/main`) |
| Default branch | `main` |
| Pre-publication `origin/main` commit | `ed459246a05f1cb4231cf17b8955c0d491189b28` |
| Pre-publication authoritative tree | `90e9ad2fc9a6d2cd6a62ba243b6b31bbab23c4d7` |
| Independent API read of `refs/heads/main` | `ed459246a05f1cb4231cf17b8955c0d491189b28` — **agrees** |
| Independent API read of `main` tree | `90e9ad2fc9a6d2cd6a62ba243b6b31bbab23c4d7` — **agrees** |
| Pre-publication local HEAD | `ed459246a05f1cb4231cf17b8955c0d491189b28` |
| Publication session branch | `arena/01a0ffb8-iips-review-recovered` |
| Session branch pre-push remote existence | **ABSENT** — confirms a genuinely fresh session branch, not a reuse of a prior lifecycle |
| Local branch tip vs. `origin/main` | **EQUAL** — session branch cut from the current authoritative baseline |
| Worktree state | **CLEAN** — 0 modified tracked files, 0 untracked files, 0 re-clone leftovers |
| `git diff origin/main` (whole worktree) | **EMPTY** — full local/remote parity pre-publication |
| Tag `program-v1.2.0` | `5decdca93e5d3b90ec94ca902ff73af45574a6ac` |
| Tag `v3.0-phase12-certified` | `7325aeda8c9881ebdf2b96f64323998f1c46ba26` |

12.3 **Predecessor preservation pins — VERIFIED BYTE-IDENTICAL.** Each predecessor was verified **twice**: (i) its blob at `origin/main`, and (ii) the local worktree file re-hashed with `git hash-object`. Both values agree with each other and with the expected authoritative blob.

| Artifact | Authoritative blob at `origin/main` | Local worktree re-hash | Result |
|---|---|---|---|
| `docs/integration/NP-13-D0-01.md` | `8caa2d3e8f9564231a51ba053d08ccb19fdbd0bb` | `8caa2d3e8f9564231a51ba053d08ccb19fdbd0bb` | **IDENTICAL** |
| `docs/integration/NP-13-D1-01.md` | `3468cdaa4e72ce5d33ecfc219706877a2a319541` | `3468cdaa4e72ce5d33ecfc219706877a2a319541` | **IDENTICAL** |
| `docs/integration/NP-13-D1-C-01.md` | `8e9688ed102493a342ada1c6d9f1b3b6d6a58b04` | `8e9688ed102493a342ada1c6d9f1b3b6d6a58b04` | **IDENTICAL** |
| `docs/integration/NP-13-GO3B-01.md` | `89366b72bdf00d10950a1a90d33f16bd0c978acf` | `89366b72bdf00d10950a1a90d33f16bd0c978acf` | **IDENTICAL** |
| `docs/integration/NP-13-D1-PREREQ-01.md` | `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` | `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` | **IDENTICAL** |

12.3.1 **D1-B digest — independently recomputed.** The D1-B definition text was re-extracted from `NP-13-D1-01 §3.1` and re-hashed during this session, using the byte boundary specified at `NP-13-D1-01 §3.2` (from `The` to the final `object.` inclusive, excluding the enclosing code fence and excluding any trailing newline):

| Metric | Recomputed value | Expected (`NP-13-D1-01 §3.2`) | Result |
|---|---|---|---|
| Byte count | `540` | `540` | **MATCH** |
| SHA-256 | `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7` | `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7` | **MATCH** |
| Non-ASCII bytes | `0` | `0` | **MATCH** |
| Quotation marks within text | `0` | `NONE` | **MATCH** |
| Begins with | `The governed object is` | `The governed object is` | **MATCH** |
| Ends with | `define the governed object.` | `define the governed object.` | **MATCH** |

**D1-B is PRESERVED — byte-identical and digest-verified.**

12.3.2 **IPD preservation — external repository.** The IPD repository was queried **read-only** via an independent API read path. It was **not cloned, not checked out, not written to, and not mutated** in this session.

| Pin | Verified value |
|---|---|
| IPD repository | `ramkivs/iips-production-market-data` |
| IPD default branch | `main` |
| IPD `main` head commit | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` |
| IPD `main` tree | `db853dc21d01162e69b0e1211dbea1cb5c5f72b1` |
| IPD head commit date | `2026-09-23T17:13:40Z` |
| Agreement with prior NP-12 pin | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — **UNCHANGED** (matches `NP-12-IMPLEMENTATION-READINESS-GATE-REPORT` and `NP-12-SECTOR-REFERENCE-POPULATION-SEMANTICS-DEFINITION`) |
| IPD mutations this session | **NONE — ZERO** |

12.3.3 **In-repo `iips-platform` tree pin — preserved.** `NP-13-D1-PREREQ-01 §7.1` pins *"IPD (`iips-platform`) tree"* = `27104015fc15ab21d8485be927e0202c584967a0`. Verified at `origin/main:iips-platform`:

| Pin | Verified value | Result |
|---|---|---|
| `origin/main:iips-platform` tree | `27104015fc15ab21d8485be927e0202c584967a0` | **IDENTICAL — PRESERVED** |
| Files under `iips-platform` | `405` | — |
| `git diff origin/main -- iips-platform` | **EMPTY** | **UNCHANGED** |

12.3.4 **Disclosed labeling variance — not resolved.** The predecessor `NP-13-D1-PREREQ-01 §7.1` labels the in-repo `iips-platform` tree as an *"IPD"* pin, whereas this task's scope defines IPD as the separate repository `ramkivs/iips-production-market-data`. Both values are recorded above at §12.3.2 and §12.3.3, and **both are preserved unchanged**. This record **does not** reconcile, prefer, or resolve that labeling variance; doing so would exceed its scope. The variance is **disclosed and carried forward**.

12.4 **Baseline advancement history.** Independently verified from authoritative pull-request metadata and predecessor provenance tables. This history is recorded as **supporting provenance** in the **F-3** sense (§7.2) — commit values here are provenance, not primary evidence coordinates.

| Step | `origin/main` commit | Tree | Content | Source |
|:---:|---|---|---|---|
| D1-C publication gate baseline | `6831d1929258538930d07c444a767d882536f683` | `2b8e7c4359e95668c4e904fadce49c8708c77c63` | pre-publication baseline for `NP-13-D1-C-01` | `NP-13-D1-C-01 §6.1` |
| D1-C merged (PR #14) | `f2886a5af43ad8df8676589daef86836039150f5` | — | `NP-13-D1-C-01` published to `main` | PR #14 |
| G-O-3(b) decision-gate baseline | `f2886a5af43ad8df8676589daef86836039150f5` | `46c1a15bbcd1291701484457d1fe9815d8538888` | G-O-3(b) investigation baseline | `NP-13-GO3B-01 §6.1` |
| Pre-GO3B publication baseline | `3f84140b415b4c1dd7ca5c41849d6b566e471c52` | `52ece401dc59cfc4d13f1ec234a9651ecac713d2` | baseline for `NP-13-GO3B-01` | `NP-13-GO3B-01 §6.1` |
| GO3B merged (PR #16) | `88f52cc03356e877004261f477d3a10aca4edab1` | `ed4c046b70a0875ae6af05720f820398755d10f9` | `NP-13-GO3B-01` published to `main` | PR #16 |
| PREREQ merged (PR #17) | `6a535ed7b21ef6710f0ca4b074557489ba896e85` | — | `NP-13-D1-PREREQ-01` published to `main` | PR #17 |
| NP-12 N4-A3 … N4-A9 (PRs #18–#21) | `bcab34f4…` · `7f492ad5…` · `0d00ac1f…` · `5d78e302…` | — | **unrelated NP-12 work — preserved** | PRs #18–#21 |
| **Current authoritative baseline (PR #22)** | **`ed459246a05f1cb4231cf17b8955c0d491189b28`** | **`90e9ad2fc9a6d2cd6a62ba243b6b31bbab23c4d7`** | `NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md` — **unrelated NP-12 work — preserved** | PR #22 |

12.4.1 **Delta determination.** The previously known baseline from the prior blocked attempt was `origin/main = ed459246a05f1cb4231cf17b8955c0d491189b28`, tree `90e9ad2fc9a6d2cd6a62ba243b6b31bbab23c4d7`. **Independent recomputation in this session yields exactly those values.** Therefore:

- **`origin/main` has NOT advanced** since the previously known baseline.
- **There are NO intervening commits or merges** to investigate.
- **PR #22** (`NP-12 N4-A9: publish implementation authority decision`, merge commit `ed459246a05f1cb4231cf17b8955c0d491189b28`, committed `2026-10-02T17:16:58Z`) **is the current authoritative tip itself**, not an intervening delta.
- **PR #22 relevance determination: UNRELATED NP-12 work.** It is **NOT** NP-13 authority. Terminology overlap between NP-12 and NP-13 records does **not** confer NP-13 authority on NP-12 work, and does **not** constitute governance dependency (`NP-13-D1-PREREQ-01 §4`).
- **Preservation result: PR #22 and all NP-12 records are PRESERVED — unmodified, unreverted, unoverwritten.**

12.4.2 **Open pull requests at baseline.** **NONE.** No publication pull request from any prior session remained open. The prior session's PR lifecycle (**PR #22**, head `arena/01a0fd8b-iips-review-recovered`) is **MERGED and CLOSED** and was **not** reused. This session's branch identifier is `arena/01a0ffb8-iips-review-recovered` — **distinct** from `arena/01a0fd8b-iips-review-recovered`.

12.5 **Publication path selection.**

| Check | Result |
|---|---|
| Selected path | `docs/integration/NP-13-GO3B-DECISION-01.md` |
| Exists in local worktree pre-creation | **NO** |
| Exists at `origin/main` pre-creation | **NO** |
| Exists at any ref / in any recorded history | **NO** |
| Case-insensitive collision scan for `GO3B` | only `docs/integration/NP-13-GO3B-01.md` — **no collision** |
| Repository naming convention | `docs/integration/NP-13-<GATE>-<NN>.md` — established by `NP-13-D0-01`, `NP-13-D1-01`, `NP-13-D1-C-01`, `NP-13-GO3B-01`, `NP-13-D1-PREREQ-01` |
| Selected path conforms to convention | **YES** — gate token `GO3B-DECISION`, sequence `01` |
| Alternate filename required | **NO** |

12.6 **G-O-3(b) decision history.**

| Gate / record | Disposition as recorded | Preserved |
|---|---|---|
| `NP-13-D1-C-01 §5.1`, `§7` | G-O-3 component (b) = **NOT DECIDED**; next gate = G-O-3(b) explicit repository/ref identity decision | **UNCHANGED** |
| `NP-13-GO3B-01 §1.2`, `§2` | G-O-3(b) = **E — REPOSITORY/REF SEMANTICS REMAIN UNRESOLVED**; Questions A–G = **UNRESOLVED** | **UNCHANGED as a historical record of its effective point** (§1.5) |
| `NP-13-GO3B-01 §4` | D1 cannot complete without resolving G-O-3(b); D1 = **INCOMPLETE**; no automatic elevation without a separate explicit gate | **PRESERVED**; D1 remains **INCOMPLETE** (§10.3) |
| `NP-13-D1-PREREQ-01 §2`, `§5` | Prerequisite ordering = **UNRESOLVED (Option E)**; A–G = **UNRESOLVED**; no ordering act exists | **UNCHANGED as a historical record**; ordering remains **UNRESOLVED** (§10.5) |
| G-O-3(b) A–G decision gate(s) | A–G **DECIDED** as recorded at §1.4 | **PUBLISHED BY THIS RECORD** |

12.7 **Corpus search — absence of a prior durable A–G record.** An exhaustive search of the authoritative corpus at `origin/main` for the A–G option tokens (`B-3`, `C-4`, `D-3`, `E-3`, `F-3`, `G-4`, `G-5`) and for the model names (*dual coordinate*, *explicit evidence refresh*, *governance-object continuity*, *trigger class*) returned **ZERO matches**. This is recorded as a **fact** and confirms that **no prior durable record of the A–G decision set exists on `origin/main`** — which is precisely the gap this publication closes. It is **not** evidence contradicting the substance of A–G, and it is **not** treated as reopening A–G.

12.8 **Verification-integrity disclosure — shallow clone.** This session's local clone is a **shallow clone of depth 1**, truncated at `ed459246a05f1cb4231cf17b8955c0d491189b28`; `git rev-list --count HEAD` returns `1`, and `.git/shallow` pins that commit. Consequently, full local commit ancestry is **not** available in this session. To preserve verification integrity:

- the authoritative baseline was confirmed by an **independent GitHub API read** of `refs/heads/main` and of the `main` commit object (§12.2), not by local ancestry alone;
- the baseline advancement history at §12.4 was reconstructed from **authoritative pull-request metadata** and from the **predecessor records' own pinned provenance tables**, both remotely verified;
- all predecessor blob values were verified against **`origin/main` tree entries** (available at depth 1, since trees are complete even in a shallow clone) and against local worktree re-hashes.

No value in §12 depends on unavailable local ancestry. The shallow clone is an **environment characteristic**, disclosed here, and is **not** a governance finding.

12.9 **Mutation-safety attestations.**

| Safety condition | Result |
|---|---|
| Repository identity verified | **YES** — `ramkivs/iips-review-recovered` |
| Remote verified | **YES** — `origin` |
| Authoritative branch/ref verified | **YES** — `refs/heads/main` |
| Current baseline independently recomputed | **YES** — §12.2 |
| Clean tracked state | **YES** — 0 modified |
| Untracked files inspected | **YES** — 0 present |
| Re-clone leftovers identified | **NONE present** |
| `NP-13-D1-PREREQ-01.md` already exists remotely | **YES** — blob `5fea4a54…`; therefore **NOT re-added**, **NOT staged**, **NOT modified** |
| No unrelated files included | **YES** — commit contains only the publication artifact (§13.2) |
| Predecessor duplicate deleted for convenience | **NO** — no deletion performed; nothing was deleted |
| Existing NP-13 artifacts modified | **NO** |
| NP-12 artifacts modified | **NO** |
| IPD modified | **NO** — zero mutations (§12.3.2) |
| Production modified | **NO** — out of scope |
| Integration foundations modified | **NO** |
| Implementation code created | **NO** |
| Tests for implementation created | **NO** |
| Configuration altered | **NO** |
| Runtime behavior altered | **NO** |
| Direct push to `main` | **NO** — session branch + single pull request only |

---

## 13. DURABILITY INVENTORY

13.1 **Pre-commit inventory.** Verified state of every required NP-13 durability artifact as at the pre-publication baseline (§12.2). *Remote verified* for the new artifact is necessarily **pending** until the publication pull request is merged to `origin/main`; per **C-1**, an unmerged session-branch file is **not** authoritative `main` publication.

| Artifact | Path | Required | Local verified | Remote verified (pre-merge) |
|---|---|:---:|:---:|:---:|
| `NP-13-D0-01` | `docs/integration/NP-13-D0-01.md` | **YES** | **TRUE** — blob `8caa2d3e…` | **TRUE** — at `origin/main` |
| `NP-13-D1-01` | `docs/integration/NP-13-D1-01.md` | **YES** | **TRUE** — blob `3468cdaa…` | **TRUE** — at `origin/main` |
| `NP-13-D1-C-01` | `docs/integration/NP-13-D1-C-01.md` | **YES** | **TRUE** — blob `8e9688ed…` | **TRUE** — at `origin/main` |
| `NP-13-GO3B-01` | `docs/integration/NP-13-GO3B-01.md` | **YES** | **TRUE** — blob `89366b72…` | **TRUE** — at `origin/main` |
| `NP-13-D1-PREREQ-01` | `docs/integration/NP-13-D1-PREREQ-01.md` | **YES** | **TRUE** — blob `5fea4a54…` | **TRUE** — at `origin/main` |
| `NP-13-GO3B-DECISION-01` | `docs/integration/NP-13-GO3B-DECISION-01.md` | **YES** | **TRUE** — this record | **PENDING** — completes on merge to `origin/main` |

13.1.1 **No required row may ultimately remain FALSE.** The `PENDING` value at §13.1 row 6 is a **pre-merge** state only, and is discharged by post-merge independent remote verification performed after the publication pull request is merged. The five predecessor rows are **already `TRUE` remotely** at the pre-publication baseline and must remain `TRUE` after merge.

13.2 **Publication commit contents.** The publication commit contains **only**:

```text
docs/integration/NP-13-GO3B-DECISION-01.md
```

No predecessor file, no NP-12 file, no `iips-platform` file, no configuration file, no code file, and no other path enters the commit.

---

## 14. WHAT THIS RECORD ESTABLISHES

14.1 This record **establishes**:

1. the durable publication of the G-O-3(b) A–G decision set (§1.4, §§2–8);
2. **A** — repository binding is a required governance/evidence relationship, with the four semantics at §2.2;
3. **B-3** — the three-element dual-coordinate model, non-collapsible, with the evidence class refined by F (§3);
4. **C-4** — the deliberately separated role combination (§4.2);
5. **D-3** — the seven explicit-evidence-refresh rules (§5.2);
6. **E-3** — the five required rebinding elements and the three fail-closed rules (§6.2, §6.4);
7. **F-3** — the evidence class, primary evidence coordinate, supporting provenance role, and nine rules (§7.2, §7.3);
8. **G-4 / G-5** — the governed-object identity, the eight identity-preserving changes, the twelve identity-insufficient operations, and the single sufficient trigger **class** (§8.2–§8.5);
9. the G boundary at §8.6 and the prohibition on extending G (§8.7);
10. the express deferrals at §10.1–§10.3, including the **trigger-class-only** partial resolution of D1-C #6 and #7 (§10.2).

## 15. WHAT THIS RECORD DOES NOT ESTABLISH

15.1 This record does **NOT** establish, decide, grant, imply, or authorize:

- **any repository binding target** — A is not self-executing (§2.3.4);
- **any operational ref designation** or **any evidence coordinate designation** (§3.6, §4.4.4, §7.4.5);
- **any evidence refresh** — none is effected by this publication (§5.2 rules 5–6, §7.4.5);
- **any binding or rebinding** — none is effected by this publication (§6.2);
- **any governed-object identity transition** — no explicit identity act is made here (§8.5);
- **any identifier, format, numbering, epoch, succession, supersession, or ownership mechanism** (§8.5.2);
- **resolution of D1-C #1–#5, #8–#10**, or closure of #6 / #7 (§10.1, §10.2);
- **J-2 composition or J-3 membership**; NP-09 / NP-10 / NP-11 / NP-12 / NP-13 membership; the NP-13 `034384fb…` / `fa9862c9…` divergence adjudication (§10.3);
- **M1 / M2 / M3** selection or ranking; **C-1 / C-2** reconciliation (§10.3);
- **realization semantics** (§4.4.3, §10.3);
- **IIPS / IRR terminology** harmonization (§2.4);
- **runtime, tenant, or persistence identity** (§10.3);
- **prerequisite ordering** among unresolved D1 components (§10.5);
- **completion of D1** — D1 remains **INCOMPLETE** (§10.3);
- **any D2 or D3** — neither is started, convened, or eligible (§10.3);
- **any reconciliation record**, including `NP-13-RECON-01` (§10.3);
- **implementation, feature-realization, production, certification, release, provider, security, or persistence-implementation authority** (§11.1);
- **any new integration gate** (§11.6);
- **any change to NP-12 status** — `NP-12 STATUS = NOT DETERMINED` is **preserved verbatim** (§10.3, §11.6).

15.2 **Describing these exclusions decides none of them.** Nothing at §15.1 constitutes a determination in the negative on any downstream matter; each remains simply **open** (following `NP-13-D1-01 §6.9`).

---

## 16. GATE DISPOSITION

| Gate item | Disposition |
|---|---|
| **A** — repository binding requirement | **DECIDED — REPOSITORY BINDING REQUIRED (relationship; not identity; creates no new governed object; not inferable from repository mechanics) (§2)** |
| **B** — ref binding requirement / type / target | **DECIDED — B-3 DUAL COORDINATE (§3)** |
| **C** — positive repository/ref role | **DECIDED — C-4 DELIBERATELY SEPARATED COMBINATION (§4)** |
| **D** — ref advancement effect | **DECIDED — D-3 EXPLICIT EVIDENCE REFRESH (§5)** |
| **E** — binding / re-binding rule and procedure | **DECIDED — E-3 EXPLICIT ACT + VERIFICATION + HISTORICAL SUPERSESSION (§6)** |
| **F** — commit / tree role | **DECIDED — F-3 GIT TREE PRIMARY + COMMIT SUPPORTING PROVENANCE (§7)** |
| **G** — identity preservation across binding changes | **DECIDED — G-4 GOVERNANCE-OBJECT CONTINUITY + G-5 EXPLICIT-GOVERNANCE-ACT TRIGGER CLASS ONLY (§8)** |
| G-O-3(b) Questions A–G | **DECIDED + DURABLY PUBLISHED (§1.4)** |
| G-O-3(b) Option E unresolved state (`NP-13-GO3B-01 §2`) | **SUPERSEDED GOING FORWARD — historical record preserved unchanged (§1.5)** |
| D1-B / D1-C negative boundaries | **PRESERVED UNCHANGED (§9)** |
| Specific binding target / ref designation / evidence designation | **NOT DESIGNATED (§2.3.4, §3.6, §4.4.4, §7.4.5)** |
| Evidence refresh effected by this record | **NONE (§5.2, §7.4.5)** |
| Identity transition effected by this record | **NONE (§8.5)** |
| D1-C dimensions #1–#5, #8–#10 | **UNRESOLVED (§10.1)** |
| D1-C dimensions #6, #7 | **PARTIALLY RESOLVED — TRIGGER-CLASS LEVEL ONLY; NOT CLOSED (§10.2)** |
| Baseline nature (M1 / M2 / M3) | **UNSELECTED (§10.3)** |
| Durability conventions (C-1 / C-2) | **UNRECONCILED (§10.3)** |
| Composition / membership (J-2 / J-3; NP-09 … NP-13) | **NOT DECIDED (`NP-12 STATUS = NOT DETERMINED`) (§10.3)** |
| Realization semantics | **NOT DECIDED (§10.3)** |
| Prerequisite ordering among unresolved D1 components | **UNRESOLVED — OPTION E PRESERVED (§10.5)** |
| Runtime / tenant / persistence identity | **NOT DECIDED (§10.3)** |
| Implementation / production / certification / release / provider / security authority | **NONE GRANTED (§11.1)** |
| New integration gate | **NONE ESTABLISHED (§11.6)** |
| **D1** | **INCOMPLETE (§10.3)** |
| **D2 / D3** | **NOT STARTED / NOT ELIGIBLE (§10.3)** |
| IPD (`ramkivs/iips-production-market-data`) | **UNCHANGED — ZERO MUTATIONS (§12.3.2)** |
| Production | **OUT OF SCOPE — UNTOUCHED (§11.6)** |
| NP-12 work (incl. PR #22) | **PRESERVED — UNMODIFIED (§12.4.1)** |

16.1 **Next governance work.** The remaining **D1 identity dimensions** — D1-C #1–#5, #8–#10, and the mechanisms within the #6 / #7 trigger class (§10.1, §10.2) — are identified as the next governance work. That work is **NOT** started, convened, inferred, or executed by this record, and requires its own separate explicit gate and authority act (`NP-13-D0-01 §2.3`).

---

## 17. AUTHORITY ATTESTATION

**Signer:** Ramki (Ramakrishnan) — Program Authority

**Date:** 2026-10-03

**Approval:** **`G-O-3(b) A = REPOSITORY BINDING REQUIRED`** · **`B = B-3 DUAL COORDINATE`** · **`C = C-4 DELIBERATELY SEPARATED COMBINATION`** · **`D = D-3 EXPLICIT EVIDENCE REFRESH`** · **`E = E-3 EXPLICIT ACT + VERIFICATION + HISTORICAL SUPERSESSION`** · **`F = F-3 GIT TREE PRIMARY + COMMIT SUPPORTING PROVENANCE`** · **`G = G-4 GOVERNANCE-OBJECT CONTINUITY + G-5 EXPLICIT-GOVERNANCE-ACT TRIGGER CLASS ONLY`** · **`D1-C #6/#7 = PARTIALLY RESOLVED (TRIGGER CLASS ONLY)`** · **`D1-C #1–#5, #8–#10 = UNRESOLVED`** · **`D1 = INCOMPLETE`** · **`M1/M2/M3 = UNSELECTED`** · **`D2/D3 = NOT STARTED / NOT ELIGIBLE`** · **`AUTHORITY GRANTED = NONE`**
