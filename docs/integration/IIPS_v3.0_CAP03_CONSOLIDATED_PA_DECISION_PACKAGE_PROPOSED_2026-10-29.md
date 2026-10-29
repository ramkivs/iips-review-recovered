# CAP-03 — Consolidated PA Decision Package (one pass, 2026-10-29)

> **STATUS: PROPOSED — NOT ADOPTED — NOT EFFECTIVE.** This is a decision-preparation record. Preparing it is not adoption of any decision it describes. It records no PA ruling, moves no gate, pin, acceptance, qualification, admission, authorization or capability status, and authorizes no P-1, QE, Gate 4 or Gate 5 work, host action, IPD write or PA act. It is recorded by the tracker pointer `CV-CORR-180` / `§16.200` / `CHG-2026-10-29-22` / `V1476`–`V1480` in `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`.

**Scope.** Items A–F of the one-pass request. IRR documentation only. No IPD write. Excluded and not addressed: IPD PR #107 sourcing defect; PA rulings; advancing P-1, QE, Gate 4 or Gate 5; A6; P-1-C/P-1-D capture; D1 read-back; H-12 regeneration; DR-2; portfolio HTTP read path; IPC and durable-store work; UI and macro E2E. Non-production, single-user scope is unchanged.

**Five status classes used below.**
1. **RESOLVED — existing authority**: an effective decision already on IRR or IPD `main` settles the item; cited.
2. **VERIFIED**: current state re-read this pass; no decision involved.
3. **PA-RESERVED**: needs a PA decision that no existing decision supplies. Options are listed; none is adopted.
4. **BLOCKED — prerequisite / operator**: needs evidence or an operator action that the sandbox cannot supply.
5. **EXCLUDED**: out of scope for this pass.

*(The request named "the five status classes" without listing them in the workspace record. The five above are the classes used here; a different list can be substituted without changing any cited fact.)*

---

## 0. Live state verified this pass (read-only)

| Check | Result | Source |
|---|---|---|
| IRR `origin/main` | `74205d8729` (PR #373 merge, `2026-10-29T13:10:54Z`); post-merge CI run `40879588999` `success` | `gh pr view 373`; `git ls-remote`; this pass |
| IRR session branch | `arena/fce36a4d-iips-review-recovered` at `74205d8`, clean; no remote branch before this pass | `git status`; `git ls-remote` |
| IRR tracker | §16.199 (`CV-CORR-179`) last section; Last Updated row names `CV-CORR-178` (stale) | `IIPS_V3_E2E_MASTER_TRACKER…md` lines 14, 16455 |
| IPD `main` contains Gate 4 act publication | `7f64d37a` (IPD PR #67 merge, `2026-10-23T16:22:25Z`) is an ancestor of IPD `main` (compare: ahead 91, behind 0) | `gh api …/compare/7f64d37a…main` |
| IPD Gate 4 act on IPD `main` | `evidence/cross-repository/IIPS_V3_CAP02_GATE4_TARGET_HOST_QUALIFICATION_ACT_EFFECTIVE_2026-10-23.md`, blob `66b56fd1584890525a7250aadd7da449def621e5`, present in the recursive tree of `main` | `gh api …/git/trees/main?recursive=1` |
| IPD CI on the publication | check-runs on `7f64d37a`: `typecheck · build · test` **success**; `executed test count` **success** | `gh api …/commits/7f64d37a…/check-runs` |
| IPD open PRs | none verified this pass for the Gate 4 act | not re-checked beyond the prior pass |

Status: **VERIFIED.** The act's own effectiveness condition (§15.3: publication to IPD `main`, green CI, remote read-back) is met on the evidence above.

---

## A. Source confirmation

**Current state.** The designation record `docs/integration/IIPS_v3.0_CAP03_PA_DESIGNATION_RECORD_PASS2_2026-10-28.md` (line 49 Designation B; line 62 A-Q6) states that A-Q4 = YES, G4P-1, B-1 and A-O3 were ruled. The rulings record `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` (line 20) records A-Q4 as **not ruled** and contains none of those statements. The recommendation table `evidence/integration/cap03-ruling-sitting-packet-2026-10-28/06-recommendations.tsv` marks every row `RECOMMENDATION ONLY - NOT ADOPTED`. The register `01-sitting-decision-register.tsv` shows `AWAIT-PA`.

**Existing authority.** None settles the conflict. The later adopted records (S2-ACC-A1, DA-A1) do not cite the designation record's rulings as their basis.

**Status:** **PA-RESERVED.**

**Decision needed (PA).** Confirm, or decline to confirm, each of: (i) A-Q4 = YES; (ii) G4P-1 as stated; (iii) B-1 as stated; (iv) A-O3 as stated. Until confirmed, the designation record's ruling statements are not to be cited as rulings.

**Proposed wording (not effective):** "The PA confirms / does not confirm the designation record's statements (i)–(iv) as rulings: [per item]."

---

## B. P-1 execution commit

**Current state (each entry verified against the cited file on `main`).**
- `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a…`): **DA-A1** adopted `2026-10-28` (limited). Reads "the act-designated pin" in the successor act §8 step 0 and §8.2 as this coordinate, candidate-scoped. States: "Acknowledgement is not a grant … **Does not authorize P-1**"; the P-1 authorization act, when rendered, **must name the execution commit explicitly**. (`docs/integration/IIPS_v3.0_CAP03_P1_PA_DECISION_ADOPTION_2026-10-28.md` line 20.)
- `521d5482` (commit `fb56e7f`, §16.143) §5(b): `001c3c80` is "the coordinate at which P-1 of record would be executed"; it states that P-1 is not authorized. (Tracker §16.143.)
- **ADP-D1** (rulings record line 87): "the P-1 execution commit is the designated B-1 commit `a891802e`" — marked **Adopted**.
- `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (tree `76f083d7…`): S2 conditional acceptance pin under **S2-ACC-A1** (`docs/integration/IIPS_v3.0_CAP03_S2_ACC_A1_CONDITIONAL_ACCEPTANCE_DECISION_RECORD_2026-10-29.md` line 7). S2-ACC-A1 moves no gate and does not authorize P-1 (§6).
- DA-A1 open item **D1** (adoption record line 37): whether "the final execution commit" belongs to P-1 or to the QE/Gate 4 chain — "not resolved by this record."
- `001c3c80` and `a891802e` differ by 62 files; two code paths outside evidence (`src/persistence/gateAPrimeProvisioning.ts`, `tests/g3_gate_a_prime_successor_provisioning.test.ts`) — prior-pass measurement, not re-measured this pass.
- P-1-F: UNSPENT; P-1 authorization act not rendered (adoption record line 71).

**Existing authority.** Adopted decisions point at two different commits for two different roles: a step-0 act-designated pin (`001c3c80`, DA-A1) and a P-1 execution commit (`a891802e`, ADP-D1). Whether those roles are meant to coincide, and which commit the P-1 authorization act must name, is not stated by any adopted record. The `521d5482` §5(b) wording is the only text that names `001c3c80` as an execution coordinate.

**Status:** **PA-RESERVED.** Also relevant: ADP-D1 is adopted in the rulings record, which is not yet confirmed under item A.

**Decision needed (PA).**
- B-1. Which commit is the P-1 execution commit: `a891802e` (ADP-D1), `001c3c80` (`521d5482` §5(b)), or neither pending a fresh decision?
- B-2. Is the step-0 act-designated pin (DA-A1) the same commit as the P-1 execution commit, or a separate role?
- B-3. Does the D1 "final execution commit" wording in the DA adoption record mean P-1 only?

**Proposed wording (not effective):** "The P-1 execution commit of record is `<commit>`. The step-0 act-designated pin is `<commit>`. These are / are not the same commit. The P-1 authorization act, when rendered, must name `<commit>`." Nothing here authorizes P-1.

---

## C. S2 admission

**Current state.**
- **S2-ACC-A1 (recorded, IRR `main`).** The PA adopted the conditional acceptance of the S2 technical result at `a891802e`, content-level, conditions A-i…A-iv, scope fence, and it states "Gate 4 `AUTHORIZED — NOT STARTED`; Gate 5 `NOT INITIATED / NOT ADMITTED`; `V1295` NOT MET; QE `0/11`; H-12 `NOT ADOPTED`; P-1 `NOT EXECUTED`" (decision record line 7; non-establishments §6). Tracker §16.183 (`CV-CORR-163`, `CHG-2026-10-29-05`).
- **Q-S2-1 / D1 (S2 scope).** S2-ACC-A1 §4 states that `Q-S2-1`/`D1` is "closed as a repository-sufficiency item", on sealed published evidence plus the host-retention condition, and that the operator retention obligation survives. This closes the S2 evidence `D1` only (see B-3 for the separate DA `D1`).
- **Candidate acceptance.** `8eee2957` accepted S2 on `001c3c80` (candidate-scoped); R-1 remains an open residual; `521d5482` §5(a) names `001c3c80` as the basis for S2 evidence acceptance.
- **Deposit.** `S2-DEP-A` authorized; status OUTSTANDING / BLOCKED on host-original transfer (decision record §7). No host action is taken in this pass.

**Existing authority.** S2 conditional acceptance at `a891802e` is recorded by a PA decision. What no record yet settles is the reconciliation the packet calls the "S2 admission basis" (tracker §16.198 item 0): how `521d5482` §5(a) (`001c3c80`) relates to the admission of the native `a891802e` run for downstream reliance.

**Status.** S2 conditional acceptance at `a891802e`: **RESOLVED — existing authority (S2-ACC-A1).** S2 admission-basis reconciliation for downstream reliance: **PA-RESERVED.** Deposit: **BLOCKED — operator (host-original transfer).** S2 completion does not infer QE, Gate 4, Gate 5, P-1 or production.

**Decision needed (PA).** Whether, for downstream reliance, the S2 acceptance basis is (a) `a891802e` only, (b) `001c3c80` only (candidate-scoped), or (c) both, each with its scope stated. Option (c) requires the R-1 residual to be stated.

---

## D. A-Q4 / A-Q5 / A-Q6 / Gate 4

**A-Q4.** Not ruled in the rulings record (line 20). Designation record asserts YES (see A). `521d5482` §5 authorizes two PR #96 paths as candidate basis but does not use the term A-Q4. **Status: PA-RESERVED.** Decision: rule A-Q4 YES/NO, and state whether `521d5482` §5 is or is not an A-Q4 ruling.

**A-Q5.** IPD PR #107 (merge `0edadb2d`, `2026-10-28T15:30:43Z`, IPD-side) executed mechanism A-O3 for A-Q5. The IRR tracker records that A-Q5 was executed while A-Q4 was open, against the register ordering (tracker §16.199; `§16.176.9` items 1 and 4). The "A-O3" mechanism is not a PA ruling in any IRR record. **Status: PA-RESERVED.** Decision: ratify, re-act, or treat as provisional. (IPD-side remediation, if any, is excluded from this IRR pass.)

**A-Q6.** Open (rulings line 20); "not cleared" (line 56); designation line 62 says "cleared only by that act." No act records clearance. **Status: PA-RESERVED.**

**Gate 4 status conflict (C-3).**
- The IRR CV-20 row (register line 1241) states Gate 4 `NOT AUTHORIZED / NOT ACCEPTED`. That text is dated `2026-10-22` and expressly awaits "a separate Program Authority act for Gate 4 target-host qualification (`QE-1…QE-11` + Windows `scripts/run-tests.mjs` remediation)".
- That separate act is `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01` (IPD blob `66b56fd1…`). Its §15.3: effective on publication to IPD `main` (merge, green CI, remote read-back). Publication verified in §0 above. The act sets Gate 4 `AUTHORIZED — NOT STARTED`; execution is not authorized by the act itself beyond the stated limbs (Limb A and Limb B authority granted; nothing executed).
- IRR tracker line 8294 records the same: "authority limb discharged; execution limbs open", with still open inside P08: designation of the final IPD QE execution pin, and H-12 adoption. S2-ACC-A1 line 7 also reads `AUTHORIZED — NOT STARTED`.
- **Status: RESOLVED — existing authority** for the authority limb: Gate 4 `AUTHORIZED — NOT STARTED`, effective on IPD `main` from `2026-10-23`. The CV-20 Gate 4 clause is superseded in part (a dated pointer is added to the register row; its original text is kept). **Not resolved:** Gate 4 execution (not started; QE `0/11`); result acceptance; Gate 5 (`NOT INITIATED / NOT ADMITTED`).
- **Sub-items still PA-RESERVED:** (1) designation of the final IPD QE execution pin (act §3.2 stop/no-silent-re-pin rule; the designation record's G4P-1, see A); (2) H-12 adoption (R5 adoption is effective only at its own pins; `a891802e` does not adopt H-12).

---

## E. P-1 prerequisites and host actions

| Item | Current state | Status | Outstanding decision or evidence |
|---|---|---|---|
| P-1-F authority chain | Authority chain complete; conditions incomplete. P-1 authorization act not rendered; must name the execution commit (adoption record line 71) | **PA-RESERVED** | B-1 to B-3; authorization act |
| DB capture-instrument identity | DB-B1 **adopted**: sole capture identity is PF-11 root-safe v2, blob `191f5828…` (adoption record line 21) | **RESOLVED — existing authority** (identity only) | None for identity; does not authorize capture |
| DC-C2 native-harness prerequisite | DC-C2 **adopted**: pre-invocation checks for the next capture only (adoption record line 22) | **RESOLVED — existing authority** (next capture only) | Operator must perform the checks; none performed here |
| D-INST (new instrument revision) | Candidate only; `06-recommendations.tsv` NOT ADOPTED | **PA-RESERVED** | Adoption decision, if sought (would trigger a new identity and A6 before use) |
| E10 | NOT RENDERED | **PA-RESERVED** | PA act if sought; not authorized |
| G4-PIN (IPD QE execution pin) | Not designated (register `AWAIT-PA`); see D | **PA-RESERVED** | Designation act |
| A6 runtime | NOT RUN; not authorized (PASS2 §7) | **EXCLUDED** | — |
| D1 operator read-back (PASS2) | Open; operator-only | **BLOCKED — operator** | Operator read-back; excluded from this pass |
| PowerShell / host capture / PF preflight | Not authorized (PASS2 §7) | **EXCLUDED** | — |
| S2-DEP-A deposit | Authorized; BLOCKED on host-original transfer (decision record §7) | **BLOCKED — operator** | Operator transfer per `evidence/integration/cap03-s2-dep-a-2026-10-29/` |

No host provisioning, no operator evidence and no PowerShell run is claimed or performed.

---

## F. REG-12 (mapping blocker)

**Current state.** Bounded Gate 3 scope: `IMPLEMENTED & ACCEPTED` (tracker §16.77). Mapping blocker (`companyId` ↔ `ISIN` ↔ G24 ticker): NOT RESOLVED. PA decision `2026-10-24` (CV-43 / D115): no Company Identity Authority designated; re-entry requires an express act naming the bounded domain, source and consumer. No later owner or resolution exists (tracker §16.199 row; line 16478).

**Existing authority.** The 2026-10-24 decision defers the disposition to an express act. No disposition has been made.

**Status:** **PA-RESERVED — owner decision.** No disposition is selected here, and none is inferred.

**Decision options (from the 2026-10-24 record).** (i) Designate a Company Identity Authority by an express act naming domain, source and consumer. (ii) Decline the mapping, leaving the bounded Gate 3 scope as the only accepted scope.

---

## Summary of outstanding PA decisions (proposed, not adopted)

| Item | Class | Decision requested |
|---|---|---|
| A | PA-RESERVED | Confirm or decline designation-record statements (i)–(iv) |
| B | PA-RESERVED | B-1 P-1 execution commit; B-2 step-0 pin vs execution commit; B-3 DA `D1` |
| C | RESOLVED (acceptance); PA-RESERVED (admission basis) | Admission basis: `a891802e`, `001c3c80`, or both |
| D | PA-RESERVED (A-Q4, A-Q5, A-Q6, G4-PIN, H-12); RESOLVED (Gate 4 authority limb) | Rule A-Q4; ratify/re-act A-Q5; clear/decline A-Q6; designate G4-PIN; H-12 |
| E | PA-RESERVED / RESOLVED (DB, DC-C2) / BLOCKED (D1, S2-DEP-A) / EXCLUDED | As tabled in §E |
| F | PA-RESERVED | Designate a CIA or decline |

No item in this package is adopted. Preparing this package is not a PA decision.
