# NP-13 — PA-D1C DURABLE PUBLICATION OF PROGRAM AUTHORITY DECISIONS (D1-C #1–#10)

> **Record identifier:** `NP-13-PA-D1C-DECISION-01` — PA-D1C Decision Publication
> **Document type:** `AUTHORITY DECISION` — additive durability publication of already-captured decisions; not a semantic resolution, not a re-selection, not a reopening
> **Gate:** **NP-13 — PA-D1C DURABLE PUBLICATION & REMOTE VERIFICATION**
> **Publication record date:** 2026-10-03
> **Publication record time (UTC):** 2026-10-03T06:20:03Z
> **Program Authority:** Ramki (Ramakrishnan) — Program Authority
> **Repository:** IRR — `ramkivs/iips-review-recovered`
> **Authoritative durability destination:** `origin/main` (`refs/heads/main`)
> **Status:** **PA-D1C-01 = 01-B** · **PA-D1C-02 = 02-B** · **PA-D1C-03 = 03-B** · **PA-D1C-04 = 04-B** · **PA-D1C-05 = 05-B** · **PA-D1C-06 = 06-B** · **PA-D1C-07 = 07-B** · **PA-D1C-08 = 08-B** · **PA-D1C-09 = 09-B** · **PA-D1C-10 = 10-B**
> **Resulting state:** **D1-C #1–#10 = REQUIRED / NOT YET FULLY RESOLVED** · **D1 = OPEN / INCOMPLETE / NOT CLOSED** · **D2 = NOT ELIGIBLE** · **D3 = NOT ELIGIBLE**
> **Implementation:** **NOT AUTHORIZED**
> **Production:** OUT OF SCOPE
> **IPD:** OUT OF SCOPE — READ-ONLY / ZERO MUTATIONS; not accessed and not modified
> **Authority granted by this record:** **NONE** (§9)

---

## 1. GATE IDENTITY, CHARACTER, AND EXECUTION BOUNDARY

1.1 **Gate identity.** This record is the durable publication gate **NP-13 — PA-D1C DURABLE PUBLICATION & REMOTE VERIFICATION**. Its purpose is to publish, as one additive durable governance record, the already-captured **PA-D1C-01 through PA-D1C-10** Program Authority decisions covering **D1-C semantic dimensions #1–#10**.

1.2 **Character — durability only.** This gate is a **durability / publication gate only**. It does **not** resolve, reinterpret, rank, reorder, reopen, narrow, expand, or re-select any D1-C semantic dimension. It performs **no** implementation work. It does **not** modify IPD. It does **not** create or advance D2 or D3.

1.3 **Execution boundary.**

| Boundary | State |
|---|---|
| Repository | **IRR** — `ramkivs/iips-review-recovered` |
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative ref | `origin/main` (`refs/heads/main`) |
| IPD | **OUT OF SCOPE** |
| Production | **OUT OF SCOPE** |
| Implementation | **NOT AUTHORIZED** (§9) |
| D2 / D3 | **NOT ELIGIBLE** (§8) |

1.4 **Applicable durability invariant.** The existing **NP-13 Universal Artifact Durability Invariant** applies in full:

> Arena workspace state is not authoritative. A governance artifact becomes durable only after publication to the explicitly designated authoritative repository/ref and independent remote verification.

1.5 **Additive character.** This record is additive only. It does not amend, replace, correct, restate-as-authority, or supersede any predecessor record. In particular it does not modify:

- `NP-13-D0-01.md`
- `NP-13-D1-01.md`
- `NP-13-D1-C-01.md`
- `NP-13-D1-PREREQ-01.md`
- `NP-13-GO3B-01.md`
- `NP-13-GO3B-DECISION-01.md`
- `NP-13-PA-D1-DECISION-01.md`

1.6 **Git workflow is not governance.** Branch creation, commit, push, pull request, and merge are **publication mechanics**. They create no implementation authority, resolve no D1-C dimension, establish no D2/D3 eligibility, and create no separate D1 acceptance state (following `NP-13-GO3B-DECISION-01 §1.3` and §5).

---

## 2. PRESERVED AUTHORITATIVE GOVERNANCE STATE (BASELINE)

2.1 The following pre-existing authoritative governance state is **preserved exactly** and is not altered by this record.

```text
G-O-3(b) A–G
= ACCEPTED / DURABLE / CLOSED

D1 prerequisite ordering
= UNRESOLVED

PA-D1-01
= 01-A — Narrow D1

PA-D1-02
= 02-B — Full identity semantics required

PA-D1-03
= 03-C — Necessary-conditions-only / D1 remains open

PA-D1-04
= 04-A — No D1 acceptance mechanism
```

2.2 Accordingly, the preserved derived state is:

```text
D1 scope
= D1-A + D1-B + D1-C + G-O-3(b)

D1-C #1–#10
= REQUIRED / NOT YET FULLY RESOLVED

D1
= OPEN / INCOMPLETE / NOT CLOSED

D2
= NOT ELIGIBLE

D3
= NOT ELIGIBLE
```

2.3 **No alteration.** None of the decisions in §2.1–§2.2 is altered, reinterpreted, qualified, or reopened by this record. PA-D1-01 through PA-D1-04 remain as recorded in `NP-13-PA-D1-DECISION-01`.

---

## 3. PUBLISHED PA-D1C PROGRAM AUTHORITY DECISIONS

3.0 **Reproduction rule.** Each decision in §3.1–§3.10 is reproduced as authorized, in substance and without addition. The ten decisions were captured before this publication; this record records them and does **not** re-select them.

### 3.1 PA-D1C-01 — Stable baseline identifier

```text
01-B — Deliberately remain unresolved.

Stable identifier semantics remain unresolved.

No identifier existence, namespace, authority, generation,
or preservation rule is established.
```

### 3.2 PA-D1C-02 — Identifier form

```text
02-B — Deliberately remain unresolved.

No identifier form is established.

No identifier syntax, form, namespace, or canonical
representation is established.
```

### 3.3 PA-D1C-03 — Version / epoch

```text
03-B — Deliberately remain unresolved.

No version/epoch semantics are established.

No version or epoch meaning, relationship to identity,
or transition rule is established.
```

### 3.4 PA-D1C-04 — Temporal / effective point

```text
04-B — Deliberately remain unresolved.

No governed-object temporal semantics are established.

Binding and evidence effective-point concepts remain limited
to those respective records and do not establish governed-object
temporal identity.
```

### 3.5 PA-D1C-05 — Continuity

```text
05-B — Preserve bounded semantics and leave full continuity unresolved.

Existing G-O-3(b) preservation rules remain authoritative,
but no broader continuity rule is established.

Preserve the existing bounded cases. Do not reinterpret them
as a complete continuity model.
```

### 3.6 PA-D1C-06 — New-identity trigger

```text
06-B — Preserve the trigger class but leave its mechanics unresolved.

The existing trigger-class rule remains authoritative:

the sole sufficient trigger class established so far is
an explicit governance act that changes the recognized
governed logical object.

Mechanics within that class remain unresolved.
The trigger-class decision is not reopened.
```

### 3.7 PA-D1C-07 — Identity preservation under change

```text
07-B — Preserve existing bounded rules and leave the remainder unresolved.

The existing G-O-3(b) bounded preservation rules remain authoritative.

No additional preservation rules are established.

In particular, do not reinterpret the bounded rules as a
complete preservation model.
```

### 3.8 PA-D1C-08 — Governed-object supersession

```text
08-B — Leave governed-object supersession unresolved.

Existing binding/evidence supersession remains unchanged
and is not extended to the governed object.

No governed-object successor, identity-effect, or governed-object
supersession semantics are established.
```

### 3.9 PA-D1C-09 — Collision handling

```text
09-B — Leave collision semantics unresolved.

COLLISION SEMANTICS NOT ESTABLISHED.

No collision definition or semantic effect is established.

No algorithm or remediation mechanism is created.
```

### 3.10 PA-D1C-10 — Ownership

```text
10-B — Leave ownership unresolved.

No governed-object ownership is established.

Program Authority, repository/account ownership, and
implementation custody must not be substituted for
governed-object ownership.

No ownership or transfer rule is established.
```

---

## 4. SEMANTIC STATUS OF EACH DIMENSION

4.1 **Per-dimension status after this record.** The `D1-C` dimension names follow `NP-13-D1-C-01 §3` and the rendering at `NP-13-PA-D1-DECISION-01 §4.2`.

| # | D1-C dimension | PA-D1C selection | Semantic status after this record |
|---:|---|---|---|
| **1** | Stable baseline identifier | **01-B** | **DECIDED TO REMAIN UNRESOLVED** — semantics not established |
| **2** | Identifier form | **02-B** | **DECIDED TO REMAIN UNRESOLVED** — semantics not established |
| **3** | Version / epoch axis | **03-B** | **DECIDED TO REMAIN UNRESOLVED** — semantics not established |
| **4** | Temporal / effective-point identity | **04-B** | **DECIDED TO REMAIN UNRESOLVED** — semantics not established |
| **5** | Continuity | **05-B** | **BOUNDED SEMANTICS PRESERVED / FULL CONTINUITY UNRESOLVED** |
| **6** | New-identity trigger | **06-B** | **PRIOR PARTIAL SEMANTICS PRESERVED / MECHANICS UNRESOLVED** |
| **7** | Identity preservation under change | **07-B** | **PRIOR PARTIAL SEMANTICS PRESERVED / REMAINDER UNRESOLVED** |
| **8** | Object supersession | **08-B** | **DECIDED TO REMAIN UNRESOLVED** — semantics not established |
| **9** | Collision handling | **09-B** | **DECIDED TO REMAIN UNRESOLVED — COLLISION SEMANTICS NOT ESTABLISHED** |
| **10** | Object ownership | **10-B** | **DECIDED TO REMAIN UNRESOLVED** — semantics not established |

4.2 **Grouped status statement.**

```text
#1–#4, #8–#10
= DECIDED TO REMAIN UNRESOLVED

#5
= BOUNDED SEMANTICS PRESERVED / FULL CONTINUITY UNRESOLVED

#6–#7
= PRIOR PARTIAL SEMANTICS PRESERVED / REMAINDER UNRESOLVED
```

4.3 **No dimension is closed.** No D1-C dimension in §4.1 is recorded as `DECIDED`, `RESOLVED`, `CLOSED`, or `COMPLETE` in the semantic sense. The B selections are **decisions about governance posture**, not semantic answers.

4.4 **Requirement preserved.** Under `PA-D1-02 = 02-B`, **all** D1-C #1–#10 remain **REQUIRED**. Deciding to remain unresolved does not remove, waive, or reduce the requirement recorded for any dimension.

4.5 **Nothing established.** This record establishes no identifier, no identifier existence or namespace, no identifier syntax, form, or canonical representation, no version or epoch meaning or transition rule, no governed-object temporal semantics, no general continuity rule, no new-identity mechanism, no additional preservation rule, no governed-object successor or supersession semantics, no collision definition, semantic effect, algorithm, or remediation mechanism, and no ownership or ownership-transfer rule.

---

## 5. PRESERVED BOUNDED SEMANTICS FOR #5, #6, AND #7

5.1 **Only three dimensions carry preserved bounded semantics.** Preservation under this record is limited to the bounded, already-existing semantics of **#5**, **#6**, and **#7**. For **#1–#4** and **#8–#10** there is **no** bounded semantics to preserve; each remains fully unresolved.

### 5.2 Dimension #5 — Continuity (bounded semantics preserved)

5.2.1 The existing **G-O-3(b)** preservation rules, including the continuity treatment at `NP-13-GO3B-DECISION-01 §8` (**G-4 — GOVERNANCE-OBJECT CONTINUITY**), remain **authoritative**.

5.2.2 Per PA-D1C-05, those existing bounded cases are **preserved** and are **not** reinterpreted as a complete continuity model.

5.2.3 **No broader continuity rule is established.** Nothing in this record generalizes, extends, completes, or fills out the bounded G-O-3(b) continuity semantics. Full continuity semantics remain **UNRESOLVED**.

### 5.3 Dimension #6 — New-identity trigger (trigger class only)

5.3.1 The existing **trigger-class rule** remains **authoritative**:

```text
the sole sufficient trigger class established so far is
an explicit governance act that changes the recognized
governed logical object.
```

5.3.2 This is the **G-5 — EXPLICIT-GOVERNANCE-ACT TRIGGER CLASS ONLY** treatment at `NP-13-GO3B-DECISION-01 §8.5`, which establishes the **trigger class** and **no** mechanism within that class.

5.3.3 **#6 remains trigger-class-only.** Mechanics within the class remain **UNRESOLVED**. The trigger-class decision is **not reopened**. No mechanism, procedure, test, or criterion inside the class is created, specified, or implied by this record.

### 5.4 Dimension #7 — Identity preservation under change (bounded rules preserved)

5.4.1 The existing **G-O-3(b) bounded preservation rules** remain **authoritative**, including the identity-preserving changes at `NP-13-GO3B-DECISION-01 §8.3` and the individually-insufficient operations at `NP-13-GO3B-DECISION-01 §8.4`.

5.4.2 Per PA-D1C-07, **no additional preservation rules are established**, and the bounded rules are **not** reinterpreted as a complete preservation model.

5.4.3 **The remainder remains unresolved.** Preservation semantics beyond the preserved bounded G-O-3(b) rules remain **UNRESOLVED**.

### 5.5 Non-extension of preserved semantics

5.5.1 Preservation at §5.2–§5.4 is **preservation only**. It is not expansion, not completion, not generalization, and not reconciliation.

5.5.2 The prohibition on extending **G** (`NP-13-GO3B-DECISION-01 §8.7`) remains in force. Nothing in this record extends G, and nothing here supplies the mechanisms expressly not invented by G (`NP-13-GO3B-DECISION-01 §8.5.2`).

---

## 6. DECISION TO REMAIN UNRESOLVED vs. SEMANTIC RESOLUTION

6.1 **The distinction is explicit and load-bearing.** Two different things must not be conflated:

| Concept | Meaning | Occurrence |
|---|---|---|
| **Decision to remain unresolved** | A Program Authority act selecting the governance posture that a dimension stays open for now | The PA-D1C-01 … PA-D1C-10 selections, recorded by this record |
| **Semantic resolution** | Establishing the actual identity semantics of a dimension | **NOT PERFORMED** |

6.2 **The B selections retain unresolved states.** The B selections do **not** resolve the underlying semantics of any D1-C dimension. A dimension that is "decided to remain unresolved" is **still unresolved semantically**; only the governance posture toward that unresolved state has been decided.

6.3 **No inference of resolution.** No semantic resolution may be inferred from:

- the existence of a B selection;
- the uniformity of the B selections across #1–#10;
- the act of publishing this record;
- the grouping of #5–#7 as "preserved"; or
- the ordering of sections in this record.

6.4 **Separate future act required.** A later **semantic resolution** of any D1-C dimension requires its own **separate explicit Program Authority act**. This record neither performs nor authorizes such an act, and creates no gate, schedule, or commitment for one.

6.5 **Resulting semantic-resolution state.**

```text
D1-C #1–#10 SEMANTIC RESOLUTION
= NOT PERFORMED
```

---

## 7. RESULTING D1 STATE AND COMPLETION MODEL

7.1 **D1 completion model.** The D1 completion model remains the one established by `PA-D1-03 = 03-C`:

```text
D1 completion model
= NECESSARY CONDITIONS ONLY / NON-EXHAUSTIVE
```

7.2 **Necessary, not exhaustive.** The established conditions are necessary but **NON-EXHAUSTIVE**. Individual D1 gates may continue; their continuation does not make D1 complete or closed. There is no separate `D1 ACCEPTED` state (`PA-D1-04 = 04-A`).

7.3 **Resulting D1 state.**

```text
D1
= OPEN / INCOMPLETE / NOT CLOSED
```

7.4 **No completion inference.** Nothing in this record supplies, closes, or narrows the D1 completion model. No implication of D1 completion, closure, acceptance, or downstream eligibility may be drawn from the publication of this record.

---

## 8. D2 / D3 ELIGIBILITY STATE

8.1 **Not eligible.** The resulting states are:

```text
D2
= NOT ELIGIBLE

D3
= NOT ELIGIBLE
```

8.2 **No advancement.** This record does not start, convene, schedule, infer, or make eligible D2 or D3. Eligibility for either requires its own future explicit act. D1 completion, if later established under a subsequently closed completion model, is not by itself the separate act required here.

---

## 9. IMPLEMENTATION-AUTHORITY STATE

9.1 **Implementation is not authorized.**

```text
IMPLEMENTATION
= NOT AUTHORIZED
```

9.2 **No implementation authority is granted by this record.** This governance publication grants no implementation, source-change, feature-realization, runtime, persistence, certification, release, provider, security, or production authority. It authorizes no implementation work of any kind.

9.3 **Out of scope.** IPD is out of scope and is neither accessed nor modified (zero mutations). Production is out of scope and untouched.

9.4 **No implementation may be inferred.** No implementation authority may be inferred from the publication mechanics, from the preservation of bounded semantics at §5, from the record's presence on authoritative `main`, or from any verification performed under §12.

---

## 10. PRESERVATION OF PRIOR AUTHORITATIVE DECISIONS AND NON-ORDERING

### 10.1 G-O-3(b)

```text
G-O-3(b) A–G
= ACCEPTED / DURABLE / CLOSED
```

The G-O-3(b) A–G decision set, as durably published at `NP-13-GO3B-DECISION-01`, remains **ACCEPTED / DURABLE / CLOSED**. This record does not reopen, re-decide, amend, or extend it.

### 10.2 D1 prerequisite ordering

```text
D1 prerequisite ordering
= UNRESOLVED
```

The D1 prerequisite-ordering state remains **UNRESOLVED**, as recorded at `NP-13-D1-PREREQ-01` (Option E). This record establishes no ordering, sequence, priority, or prerequisite relation among unresolved D1 components, and does not reinterpret that historical label.

### 10.3 PA-D1

`PA-D1-01 = 01-A`, `PA-D1-02 = 02-B`, `PA-D1-03 = 03-C`, and `PA-D1-04 = 04-A`, as durably published at `NP-13-PA-D1-DECISION-01`, remain **ACCEPTED / DURABLE**. This record does not reopen, re-select, amend, or narrow them. In particular, `PA-D1-02 = 02-B` (full identity semantics required; all D1-C #1–#10 required) remains in force and is **not** satisfied by this record.

### 10.4 No ordering among D1-C dimensions #1–#10

> **No ordering, priority, dependency, or sequence among D1-C dimensions #1–#10 was established.**

10.4.1 The numerical labels #1–#10 are **identifiers of dimensions**, not a sequence, ranking, priority, or dependency order. They derive from `NP-13-D1-C-01 §3`.

10.4.2 The presentation of the decisions in the order 01 → 10 (§3.1–§3.10) is **presentational only**. Adjacency in subject matter creates no governance dependency, no prerequisite relation, no precedence, and no ordering.

10.4.3 Grouping #5–#7 as "preserved" (§4.2, §5) is a **status grouping**, not a priority, and not an order of work.

### 10.5 No new semantics

10.5.1 This record introduces **no new semantics** of any kind. It records ten posture decisions, preserves existing bounded semantics at §5, and restates preserved state at §10.1–§10.3.

---

## 11. PREDECESSOR RECORDS AND PRESERVATION

11.1 **Predecessor corpus.** The NP-13 corpus on the freshly verified pre-publication authoritative `origin/main` consists of the following seven governance records. Their baseline Git blob IDs were independently verified against the live GitHub tree and are pinned here to preserve predecessor integrity.

| Predecessor record | Role in the NP-13 corpus | Baseline Git blob ID |
|---|---|---|
| `docs/integration/NP-13-D0-01.md` | D0 authority jurisdiction | `8caa2d3e8f9564231a51ba053d08ccb19fdbd0bb` |
| `docs/integration/NP-13-D1-01.md` | D1-A / D1-B definition record | `3468cdaa4e72ce5d33ecfc219706877a2a319541` |
| `docs/integration/NP-13-D1-C-01.md` | D1-C boundary and dimensions | `8e9688ed102493a342ada1c6d9f1b3b6d6a58b04` |
| `docs/integration/NP-13-D1-PREREQ-01.md` | D1 prerequisite-ordering record | `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` |
| `docs/integration/NP-13-GO3B-01.md` | G-O-3(b) Option E historical record | `89366b72bdf00d10950a1a90d33f16bd0c978acf` |
| `docs/integration/NP-13-GO3B-DECISION-01.md` | Durable G-O-3(b) A–G decision record | `58e0df8739cbfef823216c560573bb4d6f43b7e8` |
| `docs/integration/NP-13-PA-D1-DECISION-01.md` | Durable PA-D1 decision record | `596db534ec73607c69024b82ade542774d406eed` |

11.2 **No predecessor is amended.** All seven records, and the six records additionally listed at §1.5, remain unchanged by this additive publication.

11.3 **Historical labels preserved.** The `UNRESOLVED (Option E)` prerequisite-ordering label in `NP-13-D1-PREREQ-01` and the G-O-3(b) Option E label in `NP-13-GO3B-01` remain as written. No historical correction is made by this record.

11.4 **Trigger-class treatment preserved.** The trigger-class-only treatment of D1-C #6 and #7 at `NP-13-GO3B-DECISION-01 §10.2` remains as written and is preserved, not expanded (§5.3, §5.4).

---

## 12. PRE-PUBLICATION INVESTIGATION AND ARTIFACT DURABILITY METADATA

### 12.1 Pre-publication investigation (performed before mutation)

All of the following were established **before** any mutation, using live remote evidence:

| # | Investigation item | Result |
|---:|---|---|
| 1 | Authoritative repository | `ramkivs/iips-review-recovered` — confirmed live via GitHub repository query (default branch `main`) |
| 2 | Current authoritative `origin/main` | `dbd4c26a95e848dd89a3e462305ba044fcf973ab` — confirmed by live `git ls-remote` **and** independently by live GitHub API commit query, agreeing |
| 3 | Current authoritative tree | `333bd2992c79b520fad528430b318a5f06f93922` — confirmed live and locally identical |
| 4 | Clean worktree | `git status --porcelain --untracked-files=all` returned **empty**; `HEAD` = `origin/main` |
| 5 | Intended Arena branch | `arena/01a10068-iips-review-recovered`, branched from `dbd4c26a95e848dd89a3e462305ba044fcf973ab` |
| 6 | Absence of a colliding PA-D1C artifact | No tracked path and no worktree file matching `PA-D1C`; a **live recursive** GitHub tree query over the authoritative `main` tree (1,274 entries, `truncated = false`) returned **zero** matches for `PA-D1C` |
| 7 | Presence and byte identity of prior authoritative NP-13 records | All seven NP-13 records present; each local Git blob ID matched the live GitHub Contents API blob ID (§11.1) |
| 8 | Reachability and integrity of G-O-3(b), PA-D1, and D1 prerequisite-ordering records | All three reachable live on authoritative `main`; blobs `58e0df8739cbfef823216c560573bb4d6f43b7e8`, `596db534ec73607c69024b82ade542774d406eed`, and `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` respectively; each path shows exactly one path-changing commit from its publication to the verified baseline |
| 9 | No unrelated local modifications | Confirmed — clean worktree, no untracked files, no staged changes |

12.1.1 **Live verification claim.** The verification at §12.1 was performed with **live** GitHub API and **live** `git ls-remote` access during the publication session. `gh auth status` succeeded. No cached evidence was substituted for live evidence, and no verification is claimed that was not performed.

12.1.2 **Fail-closed posture.** Every required verification was executed under fail-closed checks of the form `if (condition-not-met) { throw "FAIL: ..." }`. No check used `else` or `elseif`. A failed check aborts the publication rather than being recorded as a warning.

### 12.2 Predecessor immutability evidence

Each of the seven predecessor records at §11.1 shows exactly **one** path-changing commit in the deepened authoritative history, being its own publication commit:

| Predecessor record | Sole path-changing commit |
|---|---|
| `NP-13-D0-01.md` | `72bc2b0` |
| `NP-13-D1-01.md` | `0d87d6a` |
| `NP-13-D1-C-01.md` | `fc86eed` |
| `NP-13-D1-PREREQ-01.md` | `740ed9a` |
| `NP-13-GO3B-01.md` | `7744fbd` |
| `NP-13-GO3B-DECISION-01.md` | `9faa5be` |
| `NP-13-PA-D1-DECISION-01.md` | `0979fb1` |

### 12.3 Artifact durability metadata

12.3.1 **Artifact path.** `docs/integration/NP-13-PA-D1C-DECISION-01.md`

12.3.2 **Artifact self-identity.** A cryptographic digest of this artifact cannot be contained within this artifact without altering that digest. In accordance with the NP-13 convention used at `NP-13-PA-D1-DECISION-01 §8.1`, this record therefore pins the **non-self-referential** integrity coordinates — the pre-publication baseline commit, the authoritative baseline tree, and the predecessor blob pins — inside the artifact (§11.1, §12.1), and its own **Git blob ID, SHA-256, byte count, publication commit, pull-request number, merge commit, and post-merge authoritative `origin/main` tree** are recorded in the publication commit message, the pull-request body, and the `NP-13 — PA-D1C` durability disposition report, from each of which they are independently verifiable against authoritative `main`.

12.3.3 **Durability rule.** Consistent with the NP-13 Universal Artifact Durability Invariant (§1.4):

> A local file, session-branch commit, pushed branch, or open pull request is **not** authoritative `main` publication. This record becomes durable only upon publication to `ramkivs/iips-review-recovered @ refs/heads/main` and independent remote verification of the artifact from that ref.

12.3.4 **Expected delta.** The intended repository delta for this publication is **exactly one added file**: `docs/integration/NP-13-PA-D1C-DECISION-01.md`. No other file is added, modified, renamed, or deleted.

---

## 13. EXPLICIT NON-DECISIONS

13.1 This record does **not** decide, establish, resolve, grant, imply, or authorize:

- any D1-C semantic resolution (§6.5);
- any stable baseline identifier, identifier existence, namespace, authority, generation, or preservation rule (#1);
- any identifier syntax, form, namespace, or canonical representation (#2);
- any version or epoch meaning, relationship to identity, or transition rule (#3);
- any governed-object temporal semantics (#4);
- any general or complete continuity model (#5);
- any mechanism within the #6 trigger class, and no reopening of the trigger-class decision;
- any additional preservation rule, or any complete preservation model (#7);
- any governed-object successor, identity-effect, or governed-object supersession semantics (#8);
- any collision definition, collision semantic effect, collision algorithm, or remediation mechanism (#9);
- any governed-object ownership or ownership-transfer rule (#10);
- any ordering, priority, dependency, or sequence among #1–#10 (§10.4);
- any D1 completion model, or closure of the existing one (§7.1);
- any D2 or D3 eligibility, start, or convening (§8);
- any implementation, production, certification, release, provider, security, runtime, or persistence authority (§9);
- any new integration gate, or any next semantic gate;
- any amendment, correction, or supersession of any predecessor record (§1.5, §11.2).

13.2 **Describing these exclusions decides none of them.** Nothing at §13.1 constitutes a determination in the negative on any downstream matter; each remains simply open.

13.3 **Substitution prohibition preserved.** Per PA-D1C-10, Program Authority, repository/account ownership, and implementation custody must **not** be substituted for governed-object ownership. The same non-substitution principle applies to every other dimension: publication mechanics, repository location, and verification activity supply no substitute for the missing semantics.

---

## 14. GATE DISPOSITION

| Gate item | Disposition |
|---|---|
| PA-D1C-01 — Stable baseline identifier | **01-B — DELIBERATELY REMAIN UNRESOLVED** (§3.1) |
| PA-D1C-02 — Identifier form | **02-B — DELIBERATELY REMAIN UNRESOLVED** (§3.2) |
| PA-D1C-03 — Version / epoch | **03-B — DELIBERATELY REMAIN UNRESOLVED** (§3.3) |
| PA-D1C-04 — Temporal / effective point | **04-B — DELIBERATELY REMAIN UNRESOLVED** (§3.4) |
| PA-D1C-05 — Continuity | **05-B — BOUNDED SEMANTICS PRESERVED / FULL CONTINUITY UNRESOLVED** (§3.5, §5.2) |
| PA-D1C-06 — New-identity trigger | **06-B — TRIGGER CLASS PRESERVED / MECHANICS UNRESOLVED** (§3.6, §5.3) |
| PA-D1C-07 — Identity preservation under change | **07-B — BOUNDED RULES PRESERVED / REMAINDER UNRESOLVED** (§3.7, §5.4) |
| PA-D1C-08 — Governed-object supersession | **08-B — UNRESOLVED; BINDING/EVIDENCE SUPERSESSION NOT EXTENDED** (§3.8) |
| PA-D1C-09 — Collision handling | **09-B — COLLISION SEMANTICS NOT ESTABLISHED** (§3.9) |
| PA-D1C-10 — Ownership | **10-B — OWNERSHIP UNRESOLVED; NO SUBSTITUTION** (§3.10, §13.3) |
| D1-C #1–#10 | **REQUIRED / NOT YET FULLY RESOLVED** (§4.1, §4.4) |
| D1-C #1–#4, #8–#10 | **DECIDED TO REMAIN UNRESOLVED** (§4.2) |
| D1-C #5 | **BOUNDED SEMANTICS PRESERVED / FULL CONTINUITY UNRESOLVED** (§4.2, §5.2) |
| D1-C #6–#7 | **PRIOR PARTIAL SEMANTICS PRESERVED / REMAINDER UNRESOLVED** (§4.2, §5.3–§5.4) |
| D1-C #1–#10 semantic resolution | **NOT PERFORMED** (§6.5) |
| Ordering among #1–#10 | **NONE ESTABLISHED** (§10.4) |
| New semantics introduced | **NONE** (§10.5, §13.1) |
| D1 completion model | **NECESSARY CONDITIONS ONLY / NON-EXHAUSTIVE** (§7.1) |
| D1 | **OPEN / INCOMPLETE / NOT CLOSED** (§7.3) |
| D2 | **NOT ELIGIBLE** (§8.1) |
| D3 | **NOT ELIGIBLE** (§8.1) |
| Implementation | **NOT AUTHORIZED** (§9.1) |
| G-O-3(b) A–G | **PRESERVED — ACCEPTED / DURABLE / CLOSED** (§10.1) |
| PA-D1-01 … PA-D1-04 | **PRESERVED — ACCEPTED / DURABLE** (§10.3) |
| D1 prerequisite ordering | **PRESERVED — UNRESOLVED** (§10.2) |
| Predecessor NP-13 records | **UNCHANGED — ZERO MUTATIONS** (§11.2) |
| IPD | **OUT OF SCOPE — ZERO MUTATIONS** (§9.3) |
| Production | **OUT OF SCOPE — UNTOUCHED** (§9.3) |
| New integration gate | **NONE ESTABLISHED** (§13.1) |

14.1 **No further semantic gate is inferred.** No further semantic gate is to be inferred inside this durability publication. A later semantic resolution requires a separate explicit Program Authority act (§6.4).

---

## 15. PROGRAM AUTHORITY ATTESTATION

**Program Authority:** Ramki (Ramakrishnan)

**Date:** 2026-10-03

**Decision status:** The ten PA-D1C selections in §3 are already captured and are recorded without re-selection, without semantic resolution, and without reopening.

**Approval:**

```text
PA-D1C-01 = 01-B
PA-D1C-02 = 02-B
PA-D1C-03 = 03-B
PA-D1C-04 = 04-B
PA-D1C-05 = 05-B
PA-D1C-06 = 06-B
PA-D1C-07 = 07-B
PA-D1C-08 = 08-B
PA-D1C-09 = 09-B
PA-D1C-10 = 10-B

D1-C #1–#10
= REQUIRED / NOT YET FULLY RESOLVED

#1–#4, #8–#10
= DECIDED TO REMAIN UNRESOLVED

#5
= BOUNDED SEMANTICS PRESERVED / FULL CONTINUITY UNRESOLVED

#6–#7
= PRIOR PARTIAL SEMANTICS PRESERVED / REMAINDER UNRESOLVED

D1 completion model
= NECESSARY CONDITIONS ONLY / NON-EXHAUSTIVE

D1
= OPEN / INCOMPLETE / NOT CLOSED

D2
= NOT ELIGIBLE

D3
= NOT ELIGIBLE

D1-C #1–#10 SEMANTIC RESOLUTION
= NOT PERFORMED

IMPLEMENTATION
= NOT AUTHORIZED
```

**Attested limitations:**

```text
No ordering, priority, dependency, or sequence among
D1-C dimensions #1–#10 was established.

The B selections retain unresolved states; they do not
resolve the underlying semantics.

A later semantic resolution requires a separate explicit
Program Authority act.

No implementation authority is granted by this record.
```

**Correct interpretation of this record:**

```text
PA-D1C decisions = DURABLE

D1-C semantics
= still not fully resolved

D1
= OPEN / INCOMPLETE / NOT CLOSED
```
