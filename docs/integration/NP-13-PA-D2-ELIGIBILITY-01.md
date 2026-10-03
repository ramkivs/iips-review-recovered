# NP-13 — PA-D2 ELIGIBILITY & D2 SUB-GATE CONVENING AUTHORIZATION: DURABLE GOVERNANCE PUBLICATION

> **Record identifier:** `NP-13-PA-D2-ELIGIBILITY-01` — PA-D2 Eligibility & D2 Sub-Gate Convening Authorization Record
> **Document type:** `AUTHORITY DECISION` — D2 eligibility determination and bounded D2-A/D2-B/D2-C sub-gate convening authorization (not D2 sub-gate execution, not D2 completion, not D3 eligibility, not implementation authorization)
> **Gate:** **NP-13 PA-D2 — Eligibility & D2 Sub-Gate Convening Authorization** (following completed `NP-13-D2-01` and `NP-13 D2-PREREQ`)
> **Record date:** 2026-10-03
> **Program Authority:** Ramki (Ramakrishnan)
> **Repository:** IRR — `ramkivs/iips-review-recovered`
> **Authoritative durability destination:** `origin/main` (`refs/heads/main`)
> **Pre-publication baseline commit (`origin/main`):** `8ca99ee16fb537833d5e00abd5f9aa7dce4766d1`
> **Pre-publication baseline tree:** `13fe45b3984507029aa50fb3ebc4bea93d47a4fe`
> **Decisions published:**
> - **PA-D2-ELIG-01 = A — DECLARE D2 ELIGIBLE**
> - **PA-D2-AUTH-01 = A — AUTHORIZE CONVENING OF D2-A / D2-B / D2-C SUB-GATES (`D2 SUB-GATE CONVENING AUTHORITY = GRANTED`)**
> - **PA-D2-ORD-01 = A — NO MANDATORY ORDERING IMPOSED (`D2-A/B/C ORDERING = NO MANDATORY ORDER`)**
> **Resulting state:** **D1 = COMPLETE** · **D2 DEFINITION = ESTABLISHED / DURABLE** · **D2-A/B/C ORDERING = NO MANDATORY ORDER** · **D2 ELIGIBILITY = ELIGIBLE** · **D2 SUB-GATE CONVENING AUTHORITY = GRANTED** · **D2-A = DEFINED / NOT DECIDED** · **D2-B = DEFINED / NOT DECIDED** · **D2-C = DEFINED / NOT DECIDED** · **D2 WORK = NOT STARTED** · **IMPLEMENTATION AUTHORITY = NOT GRANTED** · **D3 = NOT ELIGIBLE / NOT DEFINED**
> **Authority granted by this record:** Bounded governance authority only — declaring `D2 = ELIGIBLE` and granting authority to convene the separately bounded `D2-A`, `D2-B`, and `D2-C` governance decision gates. No D2 sub-decision is decided, no D2 execution work is performed, and no implementation authority is granted (§8, §10).
> **Predecessors:** `NP-13-D0-01`, `NP-13-D1-01`, `NP-13-D1-C-01`, `NP-13-D1-PREREQ-01`, `NP-13-GO3B-01`, `NP-13-GO3B-DECISION-01`, `NP-13-PA-D1-DECISION-01`, `NP-13-PA-D1C-DECISION-01`, `NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01`, `NP-13-D1-CM-B-DECISION-01`, `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01`, `NP-13-PA-D1-COMPLETION-01`, `NP-13-PA-D2-DECISION-01`, `NP-13-D2-01-DEFINITION-01` — all preserved unchanged (§11).
> **Additive character:** This record is additive only. It does not rewrite, amend, correct, reinterpret, reopen, or supersede any predecessor record.
> **Production:** OUT OF SCOPE · **IPD:** OUT OF SCOPE — NOT ACCESSED / NOT MODIFIED

---

## 1. PURPOSE, GATE IDENTITY, AND CONTEXT

1.1 **Purpose.** This record durably publishes the Program Authority's explicit decisions rendered at the **NP-13 PA-D2 — Eligibility & D2 Sub-Gate Convening Authorization** gate following:
1. the durable publication of the D2 definition record (`docs/integration/NP-13-D2-01-DEFINITION-01.md`, blob `4143d2947107b5ab06c986b4d1b8579b5d242549` on `origin/main` at `8ca99ee16fb537833d5e00abd5f9aa7dce4766d1`); and
2. the completed read-only prerequisite-ordering investigation (`NP-13 D2-PREREQ`), which established that `NO MANDATORY ORDER EXISTS AMONG D2-A, D2-B, D2-C` (`D2-A/B/C ordering = NOT GOVERNED BY EXISTING CORPUS`).

1.2 **Relationship to `NP-13-PA-D2-DECISION-01`.** At the earlier `NP-13-PA-D2-DECISION-01` gate (`b9af85a…`), D2 had not yet been defined (`P-3` unsatisfied) and no D2 eligibility act had been rendered (`P-2` unsatisfied); Program Authority therefore recorded `D2 = NOT ELIGIBLE` as of that effective point and authorized convening the `NP-13-D2-01` definition gate (`PA-D2-01 = 01-A`). `NP-13-PA-D2-DECISION-01 §8.2` and `NP-13-D2-01-DEFINITION-01 §11.2` expressly provided that D2 could become eligible only after (a) D2 was defined by a durable `NP-13-D2-01` record on `origin/main` and (b) a subsequent explicit Program Authority eligibility act was rendered against that durable definition. That historical record remains accurate as of its effective point and is preserved unchanged; this record is the subsequent explicit Program Authority eligibility and sub-gate convening authorization act contemplated by `NP-13-PA-D2-DECISION-01 §8.2` and `NP-13-D2-01-DEFINITION-01 §11.2`.

1.3 **This is NOT a D2 sub-gate execution record.** This record does **not**:
- decide `D2-A`, `D2-B`, or `D2-C`;
- select `M1`, `M2`, or `M3`;
- perform the concrete `E-3` operational-ref binding act or designate an initial authoritative evidence coordinate;
- decide realization semantics or reconcile `C-1 / C-2`;
- declare D2 complete;
- define D3 or establish D3 eligibility;
- modify application or runtime code, configuration, persistence, APIs, or UI; or
- grant implementation, certification, release, provider, identity, security, or production authority.

1.4 **Git workflow is not governance.** Branch creation, commit, push, pull request, and merge are **publication mechanics**. They create no implementation authority, decide no D2-A/B/C dimension, perform no E-3 binding, and effect no evidence refresh (`NP-13-GO3B-DECISION-01 §1.3, §5.2 rule 6`).

---

## 2. MANDATORY LIVE CONNECTIVITY PREFLIGHT (RESULTS)

2.1 Live GitHub connectivity and repository state were verified before presenting the decision surface to the Program Authority:

| # | Preflight Item | Verified Result | Status |
|---:|---|---|:---:|
| 1 | GitHub connectivity | Live `git ls-remote origin refs/heads/main` and `git fetch origin` succeeded | **PASS** |
| 2 | Authoritative repository | `ramkivs/iips-review-recovered` | **PASS** |
| 3 | Remote `origin` | `https://github.com/ramkivs/iips-review-recovered.git` | **PASS** |
| 4 | Live `refs/heads/main` | `8ca99ee16fb537833d5e00abd5f9aa7dce4766d1` | **PASS** |
| 5 | Live `main` commit & tree | Commit `8ca99ee16fb537833d5e00abd5f9aa7dce4766d1` (Merge PR #33; first parent `bb756c040975ef9dc25e06cdfedd0e5129296ad3`, second parent `c3ff9125fa28bcc19c72fda2bf3c5169c5cfa010`); root tree `13fe45b3984507029aa50fb3ebc4bea93d47a4fe` | **PASS** |
| 6 | Durable D2 definition record | `docs/integration/NP-13-D2-01-DEFINITION-01.md` present on `refs/heads/main`, blob `4143d2947107b5ab06c986b4d1b8579b5d242549` (`48,153` bytes) | **PASS** |
| 7 | Completed `D2-PREREQ` investigation | Completed read-only against `8ca99ee16fb537833d5e00abd5f9aa7dce4766d1` (`RESULT C — NO MANDATORY ORDER EXISTS`; `MUTATION = NONE`) | **PASS** |
| 8 | D1 completion record | `docs/integration/NP-13-PA-D1-COMPLETION-01.md` present on `refs/heads/main`, blob `230059234abec84de123ce325a0cd8b5f6f70200` | **PASS** |
| 9 | Predecessor NP-13 records | All 14 predecessor NP-13 records (`NP-13-D0-01` through `NP-13-D2-01-DEFINITION-01`) present and byte-identical to their pinned blobs (§11) | **PASS** |
| 10 | Worktree state | Clean (`git status --porcelain --untracked-files=all` empty) | **PASS** |

---

## 3. PRESERVATION OF THE COMPLETED `D2-PREREQ` FINDING

3.1 **Established finding preserved.** The completed `NP-13 D2-PREREQ` investigation established from the closed-world NP-13 governance corpus (`NP-13-D2-01-DEFINITION-01 §4.6, §9.1`; `NP-13-D1-PREREQ-01 §4`):

```text
NO MANDATORY ORDER EXISTS AMONG D2-A, D2-B, D2-C.
D2-A/B/C ORDERING = NOT GOVERNED BY EXISTING CORPUS
```

3.2 **Logical relationships are not mandatory gate-ordering prerequisites.** The following relationships noted in `NP-13-D2-01-DEFINITION-01 §§4.3–4.5` remain classified strictly as logical/derived relationships (`DERIVED DEPENDENCY`):
- `D2-A` logically informs `D2-B`;
- `D2-A` logically informs `D2-C`;
- `D2-B` logically informs `D2-C`.

They do not establish mandatory gate ordering, and no separate ordering record is created merely to restate the absence of a mandatory order.

---

## 4. CLOSED-WORLD D2 ELIGIBILITY INVESTIGATION

4.1 **Evaluation of existing corpus prerequisites for D2 eligibility.** Across `NP-13-PA-D1-DECISION-01 §6.2`, `NP-13-PA-D1-COMPLETION-01 §10.1–§10.2`, `NP-13-PA-D2-DECISION-01 §6.1, §8.2`, and `NP-13-D2-01-DEFINITION-01 §11.1–§11.2`, the authoritative corpus establishes the following prerequisites for D2 eligibility and sub-gate execution:

| ID | Prerequisite | Authoritative Source | Status Prior to This Act | Status After This Act |
|---|---|---|---|---|
| **EP-1** | **D0 Jurisdiction (`J-1 / J-2 / J-3`) established** | `NP-13-D0-01 §§2.2–2.3` | **SATISFIED** (`8caa2d3e…`) | **SATISFIED** |
| **EP-2** | **D1 COMPLETE** (`D1-A = G-O-3`, `D1-B` 540-byte definition, `D1-C` 10/10 resolved, `G-O-3(b)` A–G decided & durable, `G-4/G-5` preserved, `CM-B` C1–C6 satisfied/discharged) | `NP-13-D1-01 §9.1`; `NP-13-PA-D1-COMPLETION-01 §§6–7`; `NP-13-PA-D2-DECISION-01 §6.1 P-1` | **SATISFIED** (`23005923…`) | **SATISFIED** |
| **EP-3** | **D2 Definition established and durably published on `origin/main`** (`NP-13-D2-01-DEFINITION-01`) | `NP-13-PA-D2-DECISION-01 §6.1 P-3, §8.2`; `NP-13-D2-01-DEFINITION-01 §§11.2, 13.1` | **SATISFIED** (`4143d294…` @ `8ca99ee`) | **SATISFIED** |
| **EP-4** | **Explicit Program Authority D2 Eligibility determination act** | `NP-13-PA-D1-DECISION-01 §6.2`; `NP-13-PA-D1-COMPLETION-01 §10.1`; `NP-13-PA-D2-DECISION-01 §6.1 P-2, §8.2`; `NP-13-D2-01-DEFINITION-01 §11.2` | **OPEN (awaiting this gate)** | **DISCHARGED by `PA-D2-ELIG-01 = A` (§6.1)** |
| **EP-5** | **Explicit Program Authority authorization to convene the D2-A / D2-B / D2-C decision sub-gates** | `NP-13-D0-01 §2.3`; `NP-13-PA-D1-COMPLETION-01 §10.2`; `NP-13-D2-01-DEFINITION-01 §§3.2 X-7, 4.2, 9.2, 11.1` | **OPEN (awaiting this gate)** | **DISCHARGED (as to sub-gate convening) by `PA-D2-AUTH-01 = A` (§6.2)** |

4.2 **No additional existing D2 eligibility condition exists in the corpus.** A closed-world sweep of all 14 NP-13 records confirms that no other D2 eligibility condition exists. In particular:
- `D2-CM-1` through `D2-CM-6` (`NP-13-D2-01-DEFINITION-01 §8.1`) are **D2 completion** conditions, not D2 eligibility conditions.
- D3 composition and membership conditions (`J-2 / J-3`) belong to D3 (`NP-13-D2-01-DEFINITION-01 §5.1`) and are not D2 eligibility conditions.
- Implementation, runtime, persistence, API, UI, provider, security, certification, and production matters are excluded from NP-13 D-series governance and are not D2 eligibility conditions.

---

## 5. SEPARATION OF ELIGIBILITY, CONVENING AUTHORIZATION, EXECUTION, AND IMPLEMENTATION AUTHORITY

5.1 Consistent with `NP-13-PA-D1-COMPLETION-01 §10.2` and `NP-13-D2-01-DEFINITION-01 §11.1`, the following states remain strictly distinct and non-inferable from one another:

| Governance Concept | Meaning | Disposition in This Record |
|---|---|---|
| **D2 Definition** | Defining D2's purpose, scope, D2-A/B/C structure, D2-vs-D3 allocation, inputs, outputs, and completion model | **ESTABLISHED / DURABLE** (`NP-13-D2-01-DEFINITION-01`, blob `4143d294…`) |
| **D2 Eligibility** | Condition-satisfaction and explicit Program Authority determination that D2 is eligible to proceed | **ELIGIBLE** (`PA-D2-ELIG-01 = A`, §6.1) |
| **D2 Sub-Gate Convening Authority** | Bounded Program Authority permission to convene the separate `D2-A`, `D2-B`, and `D2-C` governance decision gates | **GRANTED** (`PA-D2-AUTH-01 = A`, §6.2) |
| **D2 Sub-Gate Decisions (`D2-A`, `D2-B`, `D2-C`)** | Selecting M1/M2/M3 (`D2-A`), performing concrete E-3 binding & initial evidence designation (`D2-B`), and establishing realization semantics & C-1/C-2 reconciliation (`D2-C`) | **DEFINED / NOT DECIDED** (`D2 WORK = NOT STARTED`) |
| **D2 Completion** | Satisfying `D2-CM-1…D2-CM-5` and rendering the explicit `D2-CM-6` completion act | **NOT COMPLETE** |
| **D3 Eligibility & Definition** | Defining D3 and determining D3 eligibility after D2 completion | **NOT ELIGIBLE / NOT DEFINED** |
| **Implementation Authority** | Authority to modify code, runtime, persistence, APIs, UI, or configuration | **NOT GRANTED** |

---

## 6. EXPLICIT PROGRAM AUTHORITY DECISIONS

6.1 **Primary Decision — D2 Eligibility (`PA-D2-ELIG-01`):**

> **PA-D2-ELIG-01 = A — DECLARE D2 ELIGIBLE**

With `EP-1` (`D0` jurisdiction), `EP-2` (`D1 = COMPLETE`), `EP-3` (`NP-13-D2-01-DEFINITION-01` durable on `origin/main`), and `NP-13 D2-PREREQ` verified, Program Authority explicitly declares:

```text
D2 ELIGIBILITY = ELIGIBLE
```

6.2 **Bounded Sub-Gate Convening Authorization (`PA-D2-AUTH-01`):**

> **PA-D2-AUTH-01 = A — AUTHORIZE CONVENING OF D2-A / D2-B / D2-C SUB-GATES**

Program Authority explicitly grants bounded authority to convene the separately bounded `D2-A`, `D2-B`, and `D2-C` governance decision gates:

```text
D2 SUB-GATE CONVENING AUTHORITY = GRANTED
```

This authorization means **only** that the Program Authority may convene the separately bounded `D2-A`, `D2-B`, and `D2-C` governance decision gates. It does **not** mean that `D2-A`, `D2-B`, or `D2-C` is decided, that D2 is complete, that D3 is eligible, or that implementation or production is authorized.

6.3 **Ordering Posture (`PA-D2-ORD-01`):**

> **PA-D2-ORD-01 = A — NO MANDATORY ORDERING IMPOSED**

Program Authority preserves the completed `D2-PREREQ` finding without imposing a mandatory ordering among `D2-A`, `D2-B`, and `D2-C`:

```text
D2-A/B/C ORDERING = NO MANDATORY ORDER
```

Consequences:
1. `D2-A`, `D2-B`, and `D2-C` remain independently governable sub-decisions.
2. Their execution order may be selected at the time of convening according to the explicit authority of the relevant sub-gate.
3. No sub-gate is automatically executed or decided merely because convening authority is granted and no ordering constraint exists.

---

## 7. RESULTING GOVERNANCE STATE

| Governance Item | Resulting State |
|---|---|
| **D1** | **COMPLETE** (`NP-13-PA-D1-COMPLETION-01`, blob `23005923…`) |
| **D2 Definition** | **ESTABLISHED / DURABLE** (`NP-13-D2-01-DEFINITION-01`, blob `4143d294…`) |
| **D2-A/B/C Ordering** | **NO MANDATORY ORDER** (`PA-D2-ORD-01 = A`) |
| **D2 Eligibility** | **ELIGIBLE** (`PA-D2-ELIG-01 = A`) |
| **D2 Sub-Gate Convening Authority** | **GRANTED** (`PA-D2-AUTH-01 = A`) |
| **D2-A (Baseline Nature Selection: M1/M2/M3)** | **DEFINED / NOT DECIDED** |
| **D2-B (Operational Ref Binding & Initial Evidence: E-3 Act)** | **DEFINED / NOT DECIDED** |
| **D2-C (Realization Semantics & C-1/C-2 Reconciliation)** | **DEFINED / NOT DECIDED** |
| **D2 Work (Execution of D2-A/B/C)** | **NOT STARTED** |
| **D2 Completion** | **NOT COMPLETE** |
| **D3** | **NOT ELIGIBLE / NOT DEFINED** |
| **Implementation Authority** | **NOT GRANTED** |
| **G-4 / G-5 Continuity & Trigger-Class Boundaries** | **PRESERVED UNCHANGED** |
| **IPD (`ramkivs/iips-production-market-data`)** | **OUT OF SCOPE — UNTOUCHED** |
| **Production** | **OUT OF SCOPE — UNTOUCHED** |

---

## 8. EXPLICIT NON-ACTIONS AND EXCLUSIONS (§11)

8.1 This record does **NOT**:
- decide `D2-A`, `D2-B`, or `D2-C`;
- select `M1`, `M2`, or `M3`;
- perform any `E-3` repository/ref binding act or designate any initial authoritative evidence coordinate;
- decide realization semantics or reconcile `C-1 / C-2`;
- declare D2 complete;
- perform any D2 implementation or grant implementation authority;
- define D3, establish D3 eligibility, or perform any D3 composition/membership work (`J-2 / J-3`, NP-09/10/11/12/13 membership, `NP-12 STATUS = NOT DETERMINED`, NP-13 divergence `034384fb…` / `fa9862c9…`, NP-09 special case);
- impose a mandatory ordering among `D2-A`, `D2-B`, and `D2-C`;
- modify any predecessor NP-13 or NP-12 record; or
- modify any application/runtime code, configuration, persistence, API, UI, certification, or production artifact.

---

## 9. PREDECESSOR PRESERVATION AND BLOB PINS

9.1 All fourteen predecessor NP-13 governance records on `refs/heads/main` at `8ca99ee16fb537833d5e00abd5f9aa7dce4766d1` (tree `13fe45b3984507029aa50fb3ebc4bea93d47a4fe`) are preserved byte-identical and unmodified:

| # | Predecessor Record | Authoritative Path | Verified Git Blob SHA-1 |
|---:|---|---|---|
| 1 | `NP-13-D0-01` | `docs/integration/NP-13-D0-01.md` | `8caa2d3e8f9564231a51ba053d08ccb19fdbd0bb` |
| 2 | `NP-13-D1-01` | `docs/integration/NP-13-D1-01.md` | `3468cdaa4e72ce5d33ecfc219706877a2a319541` |
| 3 | `NP-13-D1-C-01` | `docs/integration/NP-13-D1-C-01.md` | `8e9688ed102493a342ada1c6d9f1b3b6d6a58b04` |
| 4 | `NP-13-D1-PREREQ-01` | `docs/integration/NP-13-D1-PREREQ-01.md` | `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` |
| 5 | `NP-13-GO3B-01` | `docs/integration/NP-13-GO3B-01.md` | `89366b72bdf00d10950a1a90d33f16bd0c978acf` |
| 6 | `NP-13-GO3B-DECISION-01` | `docs/integration/NP-13-GO3B-DECISION-01.md` | `58e0df8739cbfef823216c560573bb4d6f43b7e8` |
| 7 | `NP-13-PA-D1-DECISION-01` | `docs/integration/NP-13-PA-D1-DECISION-01.md` | `596db534ec73607c69024b82ade542774d406eed` |
| 8 | `NP-13-PA-D1C-DECISION-01` | `docs/integration/NP-13-PA-D1C-DECISION-01.md` | `7b5ca0be27dcc7e9e58208964da895dfa23aef46` |
| 9 | `NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01` | `docs/integration/NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01.md` | `1dcc14af3bc4937c29b2b97d7f27dc7811bdbb91` |
| 10 | `NP-13-D1-CM-B-DECISION-01` | `docs/integration/NP-13-D1-CM-B-DECISION-01.md` | `2cc757ec896171a89187a0acc00147b4d0149514` |
| 11 | `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01` | `docs/integration/NP-13-PA-D1C-SEMANTIC-RESOLUTION-01.md` | `068ae2a07c4551c7ce78185dbcd780bcb65fd599` |
| 12 | `NP-13-PA-D1-COMPLETION-01` | `docs/integration/NP-13-PA-D1-COMPLETION-01.md` | `230059234abec84de123ce325a0cd8b5f6f70200` |
| 13 | `NP-13-PA-D2-DECISION-01` | `docs/integration/NP-13-PA-D2-DECISION-01.md` | `153ab5df4c8e918e98facb42e1d8b2156959f856` |
| 14 | `NP-13-D2-01-DEFINITION-01` | `docs/integration/NP-13-D2-01-DEFINITION-01.md` | `4143d2947107b5ab06c986b4d1b8579b5d242549` |

9.2 **D1-B fidelity pin preserved.** `540` bytes / SHA-256 `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7`.

9.3 **G-4 / G-5 preserved.** The `G-4` continuity and `G-5` explicit-governance-act trigger class (`NP-13-GO3B-DECISION-01 §8`; `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01 §4`) are preserved unchanged.

---

## 10. DURABILITY AND REMOTE VERIFICATION RULE

10.1 **Universal Artifact Durability Invariant.** Under the IIPS Universal Artifact Durability Invariant, Arena workspace state is not authoritative; a governance artifact becomes durable only after publication to `ramkivs/iips-review-recovered @ refs/heads/main` and independent remote verification of the commit, tree, blob, reachability from `refs/heads/main`, and predecessor preservation.

10.2 **Fail-closed posture.** Until `docs/integration/NP-13-PA-D2-ELIGIBILITY-01.md` is published to `origin/main` on top of `8ca99ee16fb537833d5e00abd5f9aa7dce4766d1` and independently verified on `refs/heads/main`, durable completion is **not** claimed.

---

## 11. AUTHORITY ATTESTATION

**Program Authority:** Ramki (Ramakrishnan)

**Date:** 2026-10-03

**Approval:**

```text
PA-D2-ELIG-01 = A — DECLARE D2 ELIGIBLE
PA-D2-AUTH-01 = A — AUTHORIZE CONVENING OF D2-A / D2-B / D2-C SUB-GATES
PA-D2-ORD-01  = A — NO MANDATORY ORDERING IMPOSED

D1 = COMPLETE
D2 DEFINITION = ESTABLISHED / DURABLE
D2-A/B/C ORDERING = NO MANDATORY ORDER
D2 ELIGIBILITY = ELIGIBLE
D2 SUB-GATE CONVENING AUTHORITY = GRANTED

D2-A = DEFINED / NOT DECIDED
D2-B = DEFINED / NOT DECIDED
D2-C = DEFINED / NOT DECIDED

D2 WORK = NOT STARTED
IMPLEMENTATION AUTHORITY = NOT GRANTED
D3 = NOT ELIGIBLE / NOT DEFINED
```

**End of `NP-13-PA-D2-ELIGIBILITY-01`.**
