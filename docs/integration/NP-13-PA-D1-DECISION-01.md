# NP-13 — PA-D1 DURABLE PUBLICATION OF PROGRAM AUTHORITY DECISIONS

> **Record identifier:** `NP-13-PA-D1-DECISION-01` — PA-D1 Decision Publication
> **Document type:** `AUTHORITY DECISION` — additive durability publication of already-final decisions; not a re-selection
> **Publication record date:** 2026-10-03
> **Program Authority:** Ramki (Ramakrishnan)
> **Repository:** IRR — `ramkivs/iips-review-recovered`
> **Authoritative durability destination:** `origin/main` (`refs/heads/main`)
> **Status:** **PA-D1-01 = 01-A · PA-D1-02 = 02-B · PA-D1-03 = 03-C · PA-D1-04 = 04-A**
> **Resulting state:** **D1 = OPEN / INCOMPLETE / NOT CLOSED** · **D2 / D3 = NOT ELIGIBLE**
> **Implementation:** **NOT AUTHORIZED**
> **Production:** OUT OF SCOPE
> **IPD:** READ-ONLY / NO MUTATION; not accessed or modified

---

## 1. PURPOSE, CHARACTER, AND EFFECTIVE DECISION CONTEXT

1.1 This record durably publishes the four already-final Program Authority decisions in the PA-D1 decision set. It records those decisions; it does **not** reselect, reopen, reinterpret, expand, or narrow them.

1.2 The Program Authority's four selections were final before this publication. The effective context is the prior PA-D1 Program Authority decision act. The supplied decision authority does not identify a separate gate identifier or effective timestamp; this record does not infer one. The publication date above is the date of this additive record, not a new decision effective point.

1.3 Publication is limited to the authority record. Git branch, commit, pull-request, and merge operations are publication workflow only; they do not create implementation authority, resolve a D1-C dimension, establish D2/D3 eligibility, or create a separate D1 acceptance state.

1.4 This record is additive only. It does not amend, replace, correct, or supersede any predecessor record. If a historical predecessor used a state label that is later changed by an explicit Program Authority act, that predecessor remains a record of its own effective point. This record makes no such historical correction.

---

## 2. FINAL PA-D1 DECISIONS

The following four selections are reproduced as authorized and are not reopened here.

### 2.1 PA-D1-01

> **01-A — NARROW D1**
>
> ```text
> D1 = {D1-A, D1-B, D1-C in full, G-O-3(b)}.
> ```
>
> Outside D1:
>
> ```text
> M1/M2/M3
> C-1/C-2
> J-2/J-3
> realization semantics
> ```
>
> These remain subject to separate governance.

### 2.2 PA-D1-02

> **02-B — FULL IDENTITY SEMANTICS REQUIRED**
>
> The identity-boundary limb is discharged.
>
> The identity-semantics limb remains OPEN.
>
> **ALL D1-C #1–#10 are required.**
>
> No D1-C dimension is resolved by this publication.

### 2.3 PA-D1-03

> **03-C — NECESSARY CONDITIONS ONLY / D1 REMAINS OPEN**
>
> The established conditions are necessary but **NON-EXHAUSTIVE**.
>
> D1 completion is deliberately not currently definable.
>
> Individual D1 gates may continue.
>
> D1 cannot be declared complete until a later Program Authority act closes the completion model.

### 2.4 PA-D1-04

> **04-A — NO D1 ACCEPTANCE MECHANISM**
>
> D1 COMPLETE is purely a condition-satisfaction state.
>
> There is no separate `D1 ACCEPTED` state.
>
> D2/D3 eligibility remains unestablished and requires its own future explicit act.

---

## 3. RESULTING GOVERNANCE STATE

The resulting state recorded by these decisions is:

| Governance item | State |
|---|---|
| **D1 scope** | `D1-A + D1-B + D1-C + G-O-3(b)` |
| **M1/M2/M3** | **OUTSIDE D1** |
| **C-1/C-2** | **OUTSIDE D1** |
| **J-2/J-3** | **OUTSIDE D1** |
| **Realization semantics** | **OUTSIDE D1** |
| **D1-C boundary** | **DISCHARGED** |
| **D1-C #1–#10** | **REQUIRED / NOT YET RESOLVED** |
| **D1 completion model** | **NON-EXHAUSTIVE / NOT CURRENTLY DEFINABLE** |
| **D1** | **OPEN / INCOMPLETE / NOT CLOSED** |
| **D1 acceptance** | **NO SEPARATE ACCEPTANCE STATE** |
| **D2** | **NOT ELIGIBLE** |
| **D3** | **NOT ELIGIBLE** |
| **G-O-3(b) A–G** | **ACCEPTED / DURABLE / CLOSED** |
| **D1 prerequisite ordering** | **UNRESOLVED** |

The G-O-3(b) A–G disposition is preserved from its existing durable decision record. The D1 prerequisite-ordering state is preserved as recorded in `NP-13-D1-PREREQ-01`; this publication does not reinterpret that historical label.

---

## 4. D1-C BOUNDARY AND IDENTITY-SEMANTICS LIMIT

4.1 **Boundary and semantics are distinct.** The D1-C identity-boundary limb is discharged by the prior D1-C decision. That boundary decision does not itself resolve the positive identity semantics required for D1-C in full. Under PA-D1-02, the identity-semantics limb remains **OPEN**.

4.2 **All ten D1-C dimensions remain required.** The dimensions identified in `NP-13-D1-C-01 §3` are:

| # | D1-C dimension | PA-D1 status |
|---:|---|---|
| **1** | Stable baseline identifier | **REQUIRED / NOT YET RESOLVED** |
| **2** | Identifier form | **REQUIRED / NOT YET RESOLVED** |
| **3** | Version / epoch axis | **REQUIRED / NOT YET RESOLVED** |
| **4** | Temporal / effective-point identity | **REQUIRED / NOT YET RESOLVED** |
| **5** | Continuity | **REQUIRED / NOT YET RESOLVED** |
| **6** | New-identity trigger | **REQUIRED / NOT YET RESOLVED** |
| **7** | Identity preservation under change | **REQUIRED / NOT YET RESOLVED** |
| **8** | Object supersession | **REQUIRED / NOT YET RESOLVED** |
| **9** | Collision handling | **REQUIRED / NOT YET RESOLVED** |
| **10** | Object ownership | **REQUIRED / NOT YET RESOLVED** |

4.3 **No dimension is resolved by this publication.** This record supplies no identifier, syntax, version or epoch rule, temporal rule, continuity mechanism, new-identity mechanism, preservation mechanism, supersession rule, collision rule, or ownership rule.

4.4 **Predecessor fidelity for dimensions #6 and #7.** `NP-13-GO3B-DECISION-01 §§10.2 and 16` records dimensions #6 and #7 as **PARTIALLY RESOLVED at trigger-class level only**, with no mechanism within that class established and neither dimension closed. That predecessor status is preserved unchanged. It is not expanded or reinterpreted here. For the PA-D1 completion state, #6 and #7 remain required and not yet fully resolved; this PA-D1 publication resolves neither dimension.

---

## 5. D1 COMPLETION MODEL AND CURRENT STATE

5.1 **Necessary conditions only.** The conditions established for D1 are necessary but **NON-EXHAUSTIVE**. They are not a complete or exhaustive D1 completion checklist.

5.2 **Completion is not currently definable.** The D1 completion model is deliberately **NOT CURRENTLY DEFINABLE**. Individual D1 gates may continue, but their continuation does not make D1 complete or closed.

5.3 **Later closure act required.** D1 cannot be declared complete until a later explicit Program Authority act closes the completion model. This record does not supply that model or close it.

5.4 Accordingly, the present state is:

> **D1 = OPEN / INCOMPLETE / NOT CLOSED**

No implication of D1 completion, closure, acceptance, or downstream eligibility may be drawn from the publication of this record.

---

## 6. D1 ACCEPTANCE AND D2 / D3 ELIGIBILITY

6.1 **No D1 acceptance mechanism.** `D1 COMPLETE` is solely a condition-satisfaction state. There is no separate `D1 ACCEPTED` state, acceptance act, acceptance gate, or additional acceptance criterion created by this record.

6.2 **D2 and D3 are not eligible.** The resulting current states are:

- **D2 = NOT ELIGIBLE**
- **D3 = NOT ELIGIBLE**

Eligibility for either requires its own future explicit act. This publication starts neither D2 nor D3 and does not establish their eligibility. D1 completion, if later established under a subsequently closed completion model, is not by itself the separate act required here.

---

## 7. SCOPE BOUNDARIES AND EXPLICIT NON-DECISIONS

7.1 **Outside D1.** The following remain outside this D1 scope and subject to separate governance:

- **M1 / M2 / M3**;
- **C-1 / C-2**;
- **J-2 / J-3**; and
- **realization semantics**.

Their existing governance states are not resolved, amended, or reinterpreted by this publication.

7.2 **Prerequisite ordering.** `D1 prerequisite ordering = UNRESOLVED` is preserved. In particular, this record does not reinterpret the historical `UNRESOLVED (Option E)` label in `NP-13-D1-PREREQ-01`, and establishes no ordering, sequence, priority, or prerequisite relation.

7.3 **G-O-3(b).** The existing decision `G-O-3(b) A–G = ACCEPTED / DURABLE / CLOSED` is preserved. This record neither reopens nor re-decides those A–G decisions.

7.4 **No implementation authority.** This governance publication does not authorize implementation, source changes, feature realization, runtime or persistence implementation, certification, release, provider, security, or production activity. **Implementation remains NOT AUTHORIZED.** Production is out of scope. IPD is read-only and is not accessed or modified.

7.5 No identity syntax or positive identity mechanism is established. No version/epoch implementation, temporal implementation, persistence, runtime identity, tenant/company identity, provider, security, certification, or release decision is made. No D1-C dimension is resolved by this publication. No separate D1 acceptance state is created. No D2/D3 eligibility is established.

---

## 8. PREDECESSOR RECORDS AND PRESERVATION

8.1 The NP-13 corpus on the freshly verified pre-publication `origin/main` consists of the following six governance records. Their baseline Git blob IDs were independently checked against the live GitHub tree and are recorded here to preserve the predecessor integrity pins.

| Predecessor record | Role in the NP-13 corpus | Baseline Git blob ID |
|---|---|---|
| `docs/integration/NP-13-D0-01.md` | D0 authority jurisdiction | `8caa2d3e8f9564231a51ba053d08ccb19fdbd0bb` |
| `docs/integration/NP-13-D1-01.md` | D1-A / D1-B definition record | `3468cdaa4e72ce5d33ecfc219706877a2a319541` |
| `docs/integration/NP-13-D1-C-01.md` | D1-C boundary and dimensions | `8e9688ed102493a342ada1c6d9f1b3b6d6a58b04` |
| `docs/integration/NP-13-D1-PREREQ-01.md` | Historical D1 prerequisite-ordering record | `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` |
| `docs/integration/NP-13-GO3B-01.md` | G-O-3(b) Option E historical record | `89366b72bdf00d10950a1a90d33f16bd0c978acf` |
| `docs/integration/NP-13-GO3B-DECISION-01.md` | Durable G-O-3(b) A–G decision record | `58e0df8739cbfef823216c560573bb4d6f43b7e8` |

8.2 **No predecessor is amended.** All six records remain unchanged by this additive publication. In particular:

- the accepted/durable/closed G-O-3(b) A–G decision set in `NP-13-GO3B-DECISION-01` remains in force;
- the `NP-13-D1-PREREQ-01` historical prerequisite-ordering label remains as written; and
- the limited trigger-class treatment of D1-C #6 and #7 in `NP-13-GO3B-DECISION-01` remains as written.

8.3 This publication records no new substantive governance decision beyond the four already-final PA-D1 selections in §2.

---

## 9. FRESH BASELINE AND VERIFICATION EVIDENCE

9.1 **Authoritative baseline before this additive record.** A live fetch and independent GitHub API query of `ramkivs/iips-review-recovered @ refs/heads/main` agreed on:

| Pin | Verified value |
|---|---|
| Authoritative commit | `a0386fe8bf520891d67a2fb9d44fda1847a8afac` |
| Authoritative tree | `e22f04b0643ba10851147265fcf70acda812c881` |
| Repository default branch | `main` |
| Recursive tree response | Complete (`truncated = false`) |

The local checkout was freshly fetched from live `origin/main`; its shallow history was deepened before predecessor-history verification. The baseline was not accepted from a prior shallow-clone snapshot.

9.2 **Authentication and live access.** `gh auth status` succeeded. Live `git ls-remote`, GitHub API access, and live fetch succeeded and independently agreed on the authoritative `main` commit and tree above.

9.3 **Target and competing-record absence before creation.** Before this record was created:

- `docs/integration/NP-13-PA-D1-DECISION-01.md` was absent locally and absent from the live authoritative tree;
- the complete live repository tree contained no competing path matching `PA-D1`; and
- a case-insensitive content search of the fetched authoritative tree found no existing `PA-D1` record.

9.4 **Durable G-O-3(b) artifact unchanged at baseline.** The live GitHub Contents API and the freshly fetched `origin/main` tree both report blob `58e0df8739cbfef823216c560573bb4d6f43b7e8` for `NP-13-GO3B-DECISION-01.md`. The same blob is present at its publication commit `9faa5beb1e993c6b826b59726a329e0885195445`; path history shows that publication as the only path-changing commit through the verified baseline, and the file diff from that publication commit to the baseline is empty. The artifact remains unchanged and durable on the pre-publication authoritative `main` baseline.

9.5 **Publication durability rule.** This record's authoritative durability is established only by independent verification of the artifact on `ramkivs/iips-review-recovered @ refs/heads/main`. A local file, session-branch commit, pushed branch, or open pull request alone is not authoritative `main` publication.

---

## 10. PROGRAM AUTHORITY ATTESTATION

**Program Authority:** Ramki (Ramakrishnan)

**Decision status:** The four PA-D1 selections in §2 are final and are recorded without re-selection.

**Approval:** **`PA-D1-01 = 01-A — NARROW D1`** · **`PA-D1-02 = 02-B — FULL IDENTITY SEMANTICS REQUIRED`** · **`PA-D1-03 = 03-C — NECESSARY CONDITIONS ONLY / D1 REMAINS OPEN`** · **`PA-D1-04 = 04-A — NO D1 ACCEPTANCE MECHANISM`** · **`D1 = OPEN / INCOMPLETE / NOT CLOSED`** · **`D1-C #1–#10 = REQUIRED / NOT YET RESOLVED`** · **`D2 = NOT ELIGIBLE`** · **`D3 = NOT ELIGIBLE`** · **`IMPLEMENTATION AUTHORITY = NOT GRANTED`**
