# CAP-03 — Consolidated PA Decision Package (single sitting)

> **STATUS: PROPOSED — NOT ADOPTED — NOT EFFECTIVE.** This is the single decision package for the CAP-03 sitting. Every "recommendation" below is an IRR recommendation for PA consideration. It is not a decision. Proposed wording becomes effective only when the PA adopts it in a dated act recorded in the authoritative record. Preparing this package authorizes nothing: no P-1, no capture, no A6 run, no host action, no QE, no Gate 4 execution, no Gate 5 admission, no IPD write, no durable write, no gate, pin, acceptance, qualification, admission, authorization or capability status change.
>
> Tracker pointers: §16.200 (`CV-CORR-180`, PR #374, merge `d7352ed`) and §16.201 (`CV-CORR-181`, this revision). This file replaces the 2026-10-29 first draft in place; the first draft's decision list was incomplete and is superseded here.
>
> **ADOPTED DECISION CARRIED IN THIS FILE — `PA-W-01`.** `IIPS-V3-CAP03-H1-H9-BLOCKER-WAIVER-PA-DECISION-2026-10-29-01` (2026-10-29, Program Authority Ramki) is **ADOPTED and EFFECTIVE** on publication to IRR `main`: the operator/host evidence items **H-1 through H-9 of §5 are PA-WAIVED — NOT A BLOCKER** as governance, documentary and workflow blockers, on the terms in **§9**. This ruling does not adopt, amend or make effective any of PA-01 to PA-18 or any other proposed wording in this file; those remain `PROPOSED — NOT ADOPTED — NOT EFFECTIVE`, and the header status above continues to govern them. Where §3, §4, §5 or §7 still describe H-1…H-9 as outstanding, §5.1 and §9 control; those passages are retained verbatim as the pre-ruling record and carry dated pointers. Tracker record: §16.202 (`CV-CORR-182`).

**Scope.** CAP-03 PA decisions and the external evidence they depend on. IRR documentation only. Excluded and not addressed: the IPD PR #107 sourcing defect; IPD-owned changes (listed in §6 only as non-PA); the portfolio HTTP read path, IPC and durable-store work, UI and macro E2E. Non-production, single-user scope is unchanged.

**Status classes.** RESOLVED — existing authority (a recorded decision settles it; cited). OPEN — PA decision required (§3). BLOCKED — operator or external evidence required (§5). EXCLUDED / NON-PA (§6).

---

## 0. How to use this package in the sitting

1. Read §1 (verified baseline) and §2 (resolved items; not for decision). Do not re-open §2 items without new evidence.
2. Decide the items in §3 in the order given in §4. Each decision has an ID (`PA-nn`). Adopt, amend or decline each by ID. Do not combine IDs unless the text says so.
3. Each decision lists what it unlocks and what stays blocked after adoption. Adoption of one decision never authorizes a downstream step; the downstream step needs its own prerequisites (§4.2).
4. Operator evidence (§5) is not a PA decision and cannot be supplied by a PA ruling. *(Dated note `PA-W-01`, 2026-10-29: the Program Authority has now ruled on these items as a class — they are waived as blockers on the terms of §9. The sentence above is retained as the pre-ruling rule. A waiver is not evidence: §5.1 states, for every item, what remains unperformed and therefore must not be claimed.)*

---

## 1. Verified baseline (checked this pass; read-only)

| Item | Verified state | Source checked |
|---|---|---|
| IRR `origin/main` | `d7352ed201cbb3098f4cb3d5236a3e90d4707d47` (PR #374 merge, `2026-10-29T13:28:55Z`); post-merge CI `Typecheck · Test · Build` `success` | `gh pr view 374`; `gh api …/commits/d7352ed…/check-runs` |
| PR #374 | Merged; head `3d8cbc6e2df5f7cd8c78eda1d1571de8faa726a1`; head CI `success`; no other IRR PR touched | `gh pr view 374`; check-runs |
| IRR session branch | `arena/ce65a169-iips-review-recovered` at `d7352ed`; clean | `git status`; `git rev-parse` |
| Gate 4 authority | IPD Gate 4 act effective on IPD `main` (PR #67 merge `7f64d37a`, `2026-10-23T16:22:25Z`; check-runs `success`); records **Gate 4 AUTHORIZED — NOT STARTED** | IPD tree of `main`; compare `7f64d37a…main` ahead 91 / behind 0 |
| IPD `main` ancestry | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` ancestor of `main` (behind 0; companion §5); `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c` ancestor of `main` (compare `f722d7d…main`: ahead, behind 0); `0edadb2d` (IPD PR #107 merge) on `main`; `f9ec0c5fd` (S1 identity-value determination) exists | `gh api …/compare`; A-Q5 result record §1 |
| Tree identity | `a891802e` and `f722d7d` both have tree `76f083d7058e170d8212455c03bad1033136ee68`. `f722d7d` is an ancestor of `a891802e`; compare `f722d7d…a891802e` reports 0 changed files | `gh api …/commits/…` (tree field); compare |
| S2 native run | `s2-a891802e-20261028T192516Z` on host `DESKTOP-NO0NHTP`; `RESULT.txt` `PASS`; `SHA256SUMS` 16/16 on `main`; 13 of 16 transcript digests reproduce only after LF→CRLF restoration | S2-ACC-A1 decision record §2; companion §5 |
| Standing (unchanged) | P-1-C NOT ESTABLISHED; P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT; P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED; QE 0/11; Gate 5 NOT INITIATED / NOT ADMITTED; `V1295` NOT MET; H-12 NOT ADOPTED at `a891802e`; G14 AWAIT-PA; DQ-4 8/10 (not re-verified) | tracker §16.176.10; rulings record header |

Corrections found while preparing this revision (not decisions; dated pointers added in the tracker §16.201):

- **C-A (companion §2).** The companion's statement that "no IRR document names the two PR #96 paths in the §16.143 disposition" is wrong. The disposition `docs/integration/IIPS_v3.0_CAP03_S2_CANDIDATE_SCOPED_BASELINE_DISPOSITION_2026-10-26.md` (line 46, change set) names exactly `scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts`. Verified this pass. The packet's claim that `521d5482` names these paths is therefore verified; whether it is an authorizing record is still PA-02.
- **C-B (identity values).** Rulings record §8 says identity values are "still unresolved". The A-Q5 result record §4 (correction CV-CORR-158) says the three constants were resolved by the PA S1 identity-value determination of 2026-10-24 (binding commit `f9ec0c5`). Both cannot stand. See PA-15.
- **C-C (A-Q5 and A-Q6 wording).** The A-Q5 result record §2 says A-O3 and target commit `a891802e` are "recorded exactly" in the IPD act and that A-Q6 is "CLEARED, items 10 and 12 only". Rulings §1 says A-Q5 mechanism and target commit were "not ruled" and §4 says A-Q6 clears only on a fresh designation act. See PA-03 and PA-04.
- **C-D (companion §1 and the register).** The register's A-Q5, A-Q6, A-GAP1 and Q-S2-2 rows still show `AWAIT-PA` (a 2026-10-28 snapshot). A-GAP1, A-Q1, A-Q2, A-Q3 and Q-S2-2 are ruled in the rulings record (§1, §2). They are listed as RESOLVED in §2 and are not re-asked.

---

## 2. Resolved items (not for decision in this sitting)

| Item | Recorded decision (authority) | Consequence that remains open |
|---|---|---|
| A-Q1 | YES: DR-2 record (IPD `bc144b9`, PR #89) is the further act for `portfolio_store.ts` (rulings §1) | Item-10 re-designation is part of PA-03 |
| A-Q2 | `edd0305e` designated for `tests/g3_startup_validation.test.ts` (rulings §1) | Feeds PA-03 |
| A-Q3 | Workstream-scoped reading of act §5.1 "exhaustive" (rulings §1) | Feeds PA-02 path analysis |
| A-GAP1 | Act §6 row S1 governs; determination §12.2 superseded for S1 by pointer (rulings §1) | S1 remains BLOCKED; identity-value conflict is PA-15 |
| Q-S2-1 | R-1 not absolute; candidate-scoped acceptance `8eee2957` stands; R-2 cleared by corroborating transcript; D1 closed as repository-sufficiency item by S2-ACC-A1 §4 (rulings §2; decision record §4) | Operator evidence in §5 (H-2, H-3) *(both `PA-WAIVED` by `PA-W-01`, 2026-10-29 — no residual)*; the DA-A1 "D1" is a different item (PA-08c) |
| Q-S2-2 / Q-B7 | Gate 4 S2 Limb A route (c) recorded (rulings §2): PA designates a Gate 4 commit by separate act, then the native run | The designation act is PA-09; the run's admissibility is PA-06 |
| PF10 | KEEP the `GATE_A_PRIME_*` wildcard (rulings §6) | Requires D-INST (PA-11) before use |
| D-Q | Object: store parent. Method: D-2, with D-1 supporting (rulings §6) | Triggers PA-11 |
| E7 | DC-C2 applies to the next capture only (rulings §6) | Later captures need the native PowerShell 5.1 run |
| E8 | Parent `D:`; root `D:\cap03-p1-capture-20261028-01` (rulings §7; E3 applied, procedure `2026-10-28d`) | Existence of the root on the host is not verifiable from the repository (H-6) *(H-6 `PA-WAIVED` by `PA-W-01`, 2026-10-29: retained as a statement of fact, no longer a blocker; the procedure evaluates the root at invocation)* |
| QP1 | PF-15 literals F2, F4, F5 approved as rendered in act `-02` (rulings §6) | None |
| B-Q4 | H-12 regeneration gates L2a at the designated commit (formal §4.6 step 5; rulings §6) | H-12 adoption status is PA-10c |
| ADP-D2 | Accepted at `a891802e`, receipt element only (rulings §6) | P1-F still blocked by other conditions |
| C-Q1 / C-Q2 | A6 confirmed commit-independent; MC-2 chosen (rulings §6) | Authorization wording conflict is PA-12 |
| DB-B1 | Sole capture-instrument identity is PF-11 root-safe v2, blob `191f5828` (adoption record §2) | Successor identity is PA-11 |
| DC-C2 | Pre-invocation checks for the next capture only (adoption record §2) | Operator must perform them (H-5 scope) *(H-5 `PA-WAIVED` by `PA-W-01`, 2026-10-29 as a scheduling blocker; the checks remain procedure steps at any future capture)* |
| S2-ACC-A1 | Conditional acceptance of the S2 technical result at `a891802e`; moves no gate (decision record; tracker §16.183) | S2 admission basis is PA-06 |
| S2-IRRDOC | Dated pointer and R-2 update applied (rulings §4) | None |
| Gate 4 authority limb | `AUTHORIZED — NOT STARTED`, effective on IPD `main` from `2026-10-23` (verified §1) | Execution, QE, Gate 5: not granted (§6) |
| REG-12 bounded scope | `IMPLEMENTED & ACCEPTED` for bounded Gate 3 scope only (tracker §16.77) | Mapping owner is PA-17 |
| REG-11 | Option C deferral retained; not closed (tracker §11, §16.112) | Optional decision PA-16 |

---

## 3. Decision list (one sitting)

Each entry: question; evidence; conflicting statements; choices and consequences; **IRR recommendation** (a recommendation, not a decision); proposed PA wording (not effective until adopted); unlocks on adoption; still blocked after adoption.

### PA-01 — Source confirmation (companion §9.1)

- **Question.** Did the PA give the following rulings, which the designation record states but the rulings record does not contain: (i) `G4P-1` (Gate 4 QE/H-12 pin `a891802e`); (ii) `B-1` (= B-Q1, P-1 coordinate `a891802e`); (iii) `A-O3` (A-Q5 mechanism); (iv) `A-Q4 = YES`; (v) clearance of `A-Q6`?
- **Evidence.** Designation record header (`docs/integration/IIPS_v3.0_CAP03_PA_DESIGNATION_RECORD_PASS2_2026-10-28.md`): states all five; line 55: "A-Q6 is cleared only by that act". Rulings record (`…RULINGS_RECORD_PASS2_2026-10-28.md` §1 line 20 and §5): A-Q4, A-Q5 mechanism and target commit, A-Q6 "not ruled"; `B-Q1` and `G4-PIN` "not decided here". Tracker §16.196: A-Q4 "Not ruled … OPEN". Sitting packet `06-recommendations.tsv`: every row `RECOMMENDATION ONLY - NOT ADOPTED`. The sitting-response text that would establish any of the five is not in the repository (companion §1).
- **Conflicting statements.** Designation record (five rulings) vs rulings record and tracker (not ruled). The A-Q5 result record (§2) and the S1 handoff record cite the designation record as governing.
- **Choices and consequences.**
  - (a) Confirm each item individually by dated act citing the sitting response. Downstream items may cite the confirmed rulings.
  - (b) Decline any item. IRR then corrects the designation record, S1 handoff and A-Q5 result record by dated pointer (IRR-owned pointers; IPD-owned text is IPD's). Items that depend on the declined item revert to OPEN.
  - (c) Defer. Nothing in PA-02 to PA-14 that depends on these items may be cited as ruled.
- **IRR recommendation.** Option (a), decided item by item, with each answer recorded. Do not treat the designation record's statements as rulings until this is done.
- **Proposed PA wording.**
  > "PA-01: The Program Authority confirms / does not confirm, as a ruling: (i) G4P-1 at `a891802e` [yes/no]; (ii) B-1 at `a891802e` [yes/no]; (iii) A-O3 [yes/no]; (iv) A-Q4 = YES [yes/no]; (v) A-Q6 cleared by the A-Q5 act [yes/no]. Source: sitting response of 2026-10-28, quoted in the act."
- **Unlocks on adoption.** The dependency items PA-02 to PA-09 may cite confirmed rulings.
- **Still blocked after adoption.** Everything in §5; P-1; QE; Gate 4 execution; Gate 5.

### PA-02 — A-Q4: authorizing record for the two PR #96 paths

- **Question.** Do `scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts` (IPD PR #96, merge `1e76f4cf`, head `001c3c80`, merged `2026-10-26T10:12:18Z`) require an authorizing record, and if so, which record?
- **Evidence.** The `521d5482` disposition (`…S2_CANDIDATE_SCOPED_BASELINE_DISPOSITION_2026-10-26.md`, line 46) names exactly these two paths as its change set (verified this pass; see C-A). Its own text states it is not a qualification, acceptance, admission or implementation grant. IPD `aa43dec2` (PR #103 merge) changes one path, `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`, and names neither PR #96 path (companion §2). The act's own file table for `tests/portfolio_ui_package.test.ts` (IRR `…BROKER_IMPORT_UI_COMPOSITION_ACT_2026-10-23-02.md`) creates the path, and the act does not authorize later modification (companion §2).
- **Conflicting statements.** Packet Q-A4 recommends YES, citing `521d5482`. Rulings §1 and §5 leave A-Q4 open. Companion §2 said no IRR document names the paths; corrected by C-A.
- **Choices and consequences.**
  - (a) YES: `521d5482` is the authorizing record for the two paths, for the change set only. Consequence: the paths are authorized as a change set; this does not admit or accept any evidence.
  - (b) NO: the paths need no authorizing act. The PA states the reason. Consequence: the disposition's change-set citation is not an authority.
  - (c) Defer and name the act that will supply authority. Consequence: the PA-03 ratification remains independent (it touches only items 10 and 12).
- **IRR recommendation.** Option (a), limited to the change set and stated as "not an acceptance or admission". Recommended because the disposition names exactly those paths, and the packet's recommended option is (a). This is a recommendation, not a finding that the paths are authorized.
- **Proposed PA wording.**
  > "PA-02: [Option a / b / c]. If (a): the IRR disposition `IIPS-V3-CAP03-S2-CANDIDATE-SCOPED-BASELINE-DISPOSITION-2026-10-26-01` (`521d5482`, §16.143) is the authorizing record for the change set of IPD PR #96 (`scripts/verify-public-package.mjs`, `tests/portfolio_ui_package.test.ts`). This authorizes the change set only and is not a qualification, acceptance, admission or implementation grant."
- **Unlocks on adoption.** Closes the A-Q4 precondition for the Matter A record. Does not change PA-03 or PA-04.
- **Still blocked after adoption.** Any IPD change (IPD-owned); S2 admission (PA-06); any capture or P-1.

### PA-03 — A-Q5: treatment of the executed IPD act `0edadb2d`

- **Question.** The IPD act (IPD PR #107, merge `0edadb2d`, `2026-10-28T15:30:43Z`; IPD-side) re-designated §2.1 items 10 and 12 by mechanism A-O3 at `a891802e`. A-Q5 was executed while A-Q4 was open, against the register order. How is the executed act treated?
- **Evidence.** Result record `docs/integration/IIPS_v3.0_CAP03_IPD_A-Q5_RESULT_RECORD_2026-10-28.md` §2 and header (mechanism A-O3; target commit `a891802e`; "No ruling is reopened"). Rulings §1: A-Q5 mechanism and target commit "not ruled (recommended A-O3 at C′ `a891802e`)". Rulings §8: basis-limb reading (ii) ruled; designated-blob limb cleared. Tracker §16.176.9 items 1 and 4: A-Q5 belongs to Sitting 3, after A-Q1 to A-Q4. Companion §3.
- **Conflicting statements.** Result record (A-O3 and `a891802e` ruled) vs rulings §1 (not ruled). The act touches only items 10 and 12; it does not touch the PR #96 paths (companion §3).
- **Choices and consequences.**
  - (a) Ratify `0edadb2d` as the A-Q5 act, recording the sequencing deviation. Consequence: the A-Q5 act is an authorized designation for items 10 and 12 at `a891802e`, subject to PA-01 confirming A-O3 and `a891802e`. A-Q6 designated-blob limb then follows (PA-04).
  - (b) Require a fresh A-Q5 act after PA-02 and PA-01. Consequence: a new IPD act is needed; A-Q6 stays open until it is executed.
  - (c) Treat the executed act as provisional until PA-01 and PA-02 are decided. Consequence: no clearance follows; the IPD act remains on `main` as an executed but unratified act.
- **IRR recommendation.** Option (a), conditional on PA-01 confirming A-O3 and `a891802e`, with the sequencing deviation recorded. Reason: the act's changes are limited to items 10 and 12, independent of PA-02, and the rulings record already treats the designated-blob limb as cleared. If PA-01 declines A-O3 or `a891802e`, option (b) follows.
- **Proposed PA wording.**
  > "PA-03: [Option a / b / c]. If (a): the IPD act executed at `0edadb2d` (A-Q5; mechanism A-O3; target commit `a891802e`) is ratified as the A-Q5 act. The sequencing deviation from the register order (A-Q5 executed before A-Q4 was ruled) is recorded. This ratifies the designation of items 10 and 12 only."
- **Unlocks on adoption.** PA-04 (A-Q6).
- **Still blocked after adoption.** IPD amendments; the basis constants (`BASIS_COMMIT` `5fc74085`, `BASIS_TREE` `7226ef00`) are unchanged; S1 execution (PA-15 and act row S1).

### PA-04 — A-Q6: §8.2 stop, designated-blob and basis limbs

- **Question.** Is the §8.2 stop ("Basis commit/tree or any designated blob differs … stop, record, do not proceed") cleared, and on what basis?
- **Evidence.** A-Q5 result record §3 and §4: designated-blob limb CLEARED (items 10 and 12); basis limb CLEARED under reading (ii); host, Node, P-1 and V-A2 limbs gated and unverified; identity limb per PA-15. Rulings §4: "A-Q6 is not cleared by these rulings … clears only when A-Q5 is executed as a fresh designation act." Rulings §8: designated-blob limb and basis limb cleared; "B-1 still not effective". Designation record line 55: cleared "only by that act". Companion §3.
- **Conflicting statements.** Rulings §4 (clears only on a fresh designation act) vs A-Q5 result record §4 (CLEARED on the 2026-10-28 act). The status depends on PA-03.
- **Choices and consequences.**
  - (a) Clear the designated-blob limb for items 10 and 12 on PA-03 option (a). Basis limb: cleared under reading (ii) (already ruled). Identity limb: per PA-15.
  - (b) Keep A-Q6 open until a fresh designation act is executed (PA-03 option b).
- **IRR recommendation.** Option (a) if and only if PA-03 is option (a). The basis reading (ii) is already ruled and is not reopened.
- **Proposed PA wording.**
  > "PA-04: [Option a / b]. The §8.2 designated-blob limb is cleared for items 10 and 12 by PA-03 [a/b]. The basis limb is cleared under reading (ii) recorded at rulings §8. No other §8.2 limb is cleared by this act; host, Node, P-1 and V-A2 limbs remain gated."
- **Unlocks on adoption.** PA-08 (designation chain may proceed to step 4 of formal §4.6, subject to its other steps).
- **Still blocked after adoption.** Identity limb (PA-15); host limbs (§5); any S1 execution; P-1.

### PA-05 — B-Q6: eligibility of `aa43dec2` as a Matter B candidate

- **Question.** Is IPD `aa43dec2` (merge of PR #103) eligible as a Matter B designation target?
- **Evidence.** Packet `06-recommendations.tsv`, row B-Q6: "NOT ELIGIBLE as a Matter B designation target … `aa43dec2` changes only the IPD tracker against `a9cd18e8` (+120/−0), and its runtime blobs equal `a9cd18e8`." Companion §2: one changed path, `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`; names neither PR #96 path. Companion §9.5: "Not ruled".
- **Choices and consequences.**
  - (a) Eligible: `aa43dec2` is added as a Matter B candidate row (option B-O4). Consequence: candidate set widens; no runtime change.
  - (b) Not eligible: the designation target stays `a891802e`. Consequence: none beyond the candidate set.
- **IRR recommendation.** Option (b), per the packet. Reason: the commit changes a tracker document only and does not change the runtime blobs that the designation would pin.
- **Proposed PA wording.**
  > "PA-05: `aa43dec2` is [not eligible / eligible] as a Matter B designation target."
- **Unlocks on adoption.** The PA-08 candidate set is fixed.
- **Still blocked after adoption.** PA-08 designation remains blocked until PA-04 and the other §4.6 steps are complete.

### PA-06 — S2 admission basis (companion §9.0; packet Q-S2-1 / Q-B7 remainder)

- **Question.** For downstream reliance (Gate 4 Limb A, the P-1 chain and L2a), which S2 result is admitted: the native run at `a891802e`, the candidate-scoped `001c3c80` acceptance, or both? And does the existing native run satisfy the "fresh S2 at the designated commit" requirement?
- **Evidence.**
  - S2-ACC-A1 (decision record §1 and line 7): conditional acceptance of the S2 technical result at `a891802e`, moves no gate.
  - `8eee2957`: candidate-scoped acceptance on `001c3c80` / `399fa44a`, which stands (rulings §2).
  - `521d5482` §5(a): `001c3c80` is the basis for S2 evidence acceptance.
  - Rulings §2, route (c): "The operator native S2 run must not start until [a designation act] has been given and the designated pin is fixed." Companion §5, row 4: no designation act is verified in the repository. The native run is recorded at `2026-10-28T19:25:17Z`–`19:29:15Z` (S2-ACC-A1 §2(a)).
  - Formal §4.6 step 5 and step 6: fresh S2 (L2a) at the designated commit, with the executing identity equal to the designated pin.
- **Conflicting statements.** Rulings §2 (run must follow designation) vs the recorded run at `a891802e` before any designation act; §5(a) `001c3c80` vs S2-ACC-A1 `a891802e`.
- **Choices and consequences.**
  - (a) Admit the `a891802e` run as L2a and as the Gate 4 Limb A S2 result, by an express waiver of the pre-designation sequencing in route (c), once PA-09 designates `a891802e`. Consequence: no new native run is needed.
  - (b) Admit only `001c3c80` for candidate-scoped acceptance. Consequence: a fresh native run at the designated commit is required before L2a and Gate 4 Limb A (operator H-7).
  - (c) Both: `001c3c80` for candidate-scoped acceptance (as stated in `8eee2957`); `a891802e` for L2a and Gate 4 Limb A only after the waiver in option (a). Consequence: each admitted result is stated with its scope.
- **IRR recommendation.** Option (c). Reason: S2-ACC-A1 already accepts the `a891802e` result at content level, and the run's executing identity equals the candidate pin. The sequencing deviation from route (c) must be waived expressly rather than assumed. If the PA declines the waiver, option (b) applies and H-7 is required.
- **Proposed PA wording.**
  > "PA-06: [Option a / b / c]. S2 admission basis for downstream reliance: [`a891802e` / `001c3c80` / both, scoped as follows]. The pre-designation sequence of the native run at `a891802e` [is / is not] waived for L2a and Gate 4 Limb A under rulings route (c). R-1 remains an open residual until H-2 is supplied."
- **Unlocks on adoption.** L2a status; PA-08 step 5; PA-09 step 5.
- **Still blocked after adoption.** QE (0/11); Gate 4 execution; Gate 5 admission; `V1295`; production; S2 does not authorize P-1 (PA-14).
- **Dated note (`PA-W-01`, 2026-10-29).** `H-2` and `H-7` are waived as blockers (§5.1). Consequences: option (b) is no longer available as a route that would demand a repeat native run, so the proposed wording's option list reduces in practice to (a) or (c); "R-1 remains an open residual until `H-2` is supplied" is superseded — the `R-1` residual is waived and the 2026-10-26 `PASS` remains recorded as **user-reported**, which is a fact and not a blocker. The choice among (a)/(c) is still a `PA` decision because it is an **admission** question; the waiver does not admit anything.

### PA-07 — Labels (Q-N1, Q-B5, and the PF-11 and Limb A collisions)

- **Question.** Adopt the label scheme for the four uses of "S2" (packet §16.7 N-2), for the matter and G4-PIN option aliases (Q-N1), and for the PF-11 and Limb A collisions. Label-only; no substantive effect.
- **Evidence.** Packet rows Q-N1, Q-B5; sitting package §5.7; companion §9 (not an item).
- **Choices and consequences.** (a) Adopt the packet's labels. (b) Substitute labels. No gate depends on any label.
- **IRR recommendation.** Option (a). Label-only.
- **Proposed PA wording.**
  > "PA-07: The label scheme of packet §16.7 N-1 and N-2 is [adopted / replaced as follows]."
- **Unlocks on adoption.** Consistent labels in later records.
- **Still blocked after adoption.** Nothing.

### PA-08 — P-1 execution commit and the designation chain (B-DESIG)

Three separate decisions, because they are different authority acts.

**PA-08a — Which commit is the P-1 execution commit of record?**

- **Evidence.**
  - `001c3c80`: DA-A1 (adoption record §2, line 20, adopted 2026-10-28, limited): the "act-designated pin" for successor act §8 step 0 and §8.2, candidate-scoped; "Acknowledgement is not a grant … Does not authorize P-1"; the authorization act "must name the execution commit explicitly". `521d5482` §5(b): `001c3c80` is "the coordinate at which P-1 of record would be executed".
  - `a891802e`: ADP-D1 (rulings §6, adopted, "conditional on the B-1 confirmation" per companion §4): "the P-1 execution commit is the designated B-1 commit `a891802e`". A-Q5 result record §2: designated basis `a891802e` (tree `76f083d7`). S2-ACC-A1: acceptance pin.
  - `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c`: D2 PR head (packet one-pass record, line 24), same tree `76f083d7`, ancestor of `a891802e`. Tree identity does not make commits interchangeable (the packet applies the same rule to B-Q3 for `a52b47b0`/`c62dee81`).
  - Formal §4.6: no pin is designated until a separate PA designation act names commit, tree and blobs, and the executing identity equals the designated pin.
- **Conflicting statements.** ADP-D1 (`a891802e`) vs DA-A1 step-0 reading (`001c3c80`) vs `521d5482` §5(b) (`001c3c80`). Also the S1 handoff and rulings §8 ("B-1 not effective").
- **Choices and consequences.**
  - (B-0) `001c3c80` as the P-1 execution commit. Consequence: DA-A1 receipt element (`executingCommit`) must be waived or deferred (packet B-Q2). ADP-D1 is superseded.
  - (B-1) `a891802e` (tree `76f083d7`). Consequence: ADP-D1 is confirmed; the designation act must name the commit, tree and blobs (formal §4.6 step 4); fresh S2 (L2a) and H-12 (L2c) at `a891802e` are then required before reliance (formal §4.6 step 5). Designation is not effective for reliance until those exist (rulings §8).
  - (B-1′) `f722d7d` (tree `76f083d7`). Consequence: the same tree, a different commit. The designation act must name one commit; `f722d7d` is the D2 PR head, `a891802e` is the commit on `main` where the A-Q5 act and S2 run are recorded. Not recommended without a stated reason.
  - (B-2) Defer. Consequence: P1-F and any P-1 step remain blocked.
- **IRR recommendation.** B-1 at `a891802e` (tree `76f083d7…`), per the packet's B-Q1 and ADP-D1. Reason: `a891802e` is the commit at which the designated basis is recorded (A-Q5 result §2), the S2 run and the acceptance are recorded there (PA-06), and the receipt element was accepted there (ADP-D2). This is a recommendation; it is effective only if the PA designates it under PA-08a and §4.6 step 4 is satisfied.
- **Proposed PA wording.**
  > "PA-08a: [B-0 / B-1 / B-1′ / B-2]. The P-1 execution commit of record is `[commit]` (tree `[tree]`). ADP-D1 is [confirmed / superseded] accordingly."

**PA-08b — Step-0 pin (DA-A1) versus the execution commit.**

- **Question.** Are the DA-A1 "act-designated pin" (successor act §8 step 0 and §8.2) and the P-1 execution commit the same commit?
- **Evidence.** DA-A1 reads the act-designated pin as `001c3c80`. The A-Q5 result record names `a891802e` as the designated basis for the designated blobs. Rulings §8 treats the basis limb as cleared on constants versus the selected basis `5fc74085` / `7226ef00`, with the executing commit recorded through the D2 receipt (reading (ii)).
- **Choices and consequences.**
  - (i) Same commit as PA-08a. Consequence: DA-A1's step-0 reading is superseded by PA wording; the DA-A1 receipt rule is satisfied by the same identity.
  - (ii) Separate roles: step-0 pin `001c3c80`; execution commit per PA-08a. Consequence: two commits are recorded, each with its role stated.
  - (iii) Keep DA-A1 unchanged. Consequence: the conflict remains recorded.
- **IRR recommendation.** Option (i), stated as a supersession of DA-A1's step-0 reading. This is a recommendation; DA-A1 is an adopted decision and only the PA may supersede it.
- **Proposed PA wording.**
  > "PA-08b: [i / ii / iii]. The act-designated pin for successor act §8 step 0 and §8.2 is `[commit]`. DA-A1 is [superseded for this reading / unchanged]."

**PA-08c — Scope of "final execution commit" (DA-A1 open item D1).**

- **Question.** Does the determination's "final execution commit" (§7; DA-A1 D1) apply to P-1 only, or to the QE and Gate 4 chain as well?
- **Evidence.** Adoption record §3 D1: "not resolved by this record". ADP-D1 is worded for P-1 only. Gate 4 pin is G4-PIN (PA-09).
- **Choices and consequences.** (a) P-1 only. (b) P-1 and Gate 4 QE/H-12. (c) Defer.
- **IRR recommendation.** Option (a), consistent with ADP-D1. The Gate 4 pin is decided separately by PA-09.
- **Proposed PA wording.**
  > "PA-08c: [P-1 only / P-1 and Gate 4 / deferred]."

**PA-08 unlocks on adoption.** The designation act for the P-1 coordinate (B-DESIG step 4). Designation is not effective for reliance until steps 5 and 6 of formal §4.6 are satisfied.

**PA-08 still blocked after adoption.** L2a (admission per PA-06); L2c (H-12 regeneration at the designated commit, PA-10a); P1-F (PA-14); P-1 execution and every P-1 capture (PA-13, §5).

### PA-09 — G4-PIN: Gate 4 QE and H-12 content pin

- **Question.** Which commit is the Gate 4 QE and H-12 content pin: G4P-1 (`a891802e`), G4P-2 (requires new IPD implementation authority) or G4P-3?
- **Evidence.** Packet row G4-PIN: "G4P-1: accept `a891802e` (not `001c3c80`) as the QE/H-12 content pin, with express scope acceptance of the non-Limb-A content, and regenerate H-12 at `a891802e`." Rulings §2 route (c). Gate 4 act §3.2 (no silent re-pin; `5fc74085` reconciliation base predates later deltas, per IRR tracker line 8294). Companion §5 step 4: "Unverified" (G4P-1 appears only in the designation record). Formal §4.6 step 4.
- **Choices and consequences.**
  - G4P-1 (`a891802e`). Consequence: the designation act must name commit, tree, blobs and purpose; H-12 regeneration (PA-10a) at that commit; the native S2 run is admitted or rerun per PA-06.
  - G4P-2. Consequence: requires new IPD implementation authority, which is not granted.
  - G4P-3. Consequence: as stated in packet row G4-PIN; not analysed further here.
  - Defer. Consequence: route (c) cannot be completed; Gate 4 Limb A stays open.
- **IRR recommendation.** G4P-1, with express scope acceptance of the non-Limb-A content (packet). This is a recommendation; G4P-1's source is itself under PA-01 (i).
- **Proposed PA wording.**
  > "PA-09: The Gate 4 QE and H-12 content pin is [G4P-1 `a891802e` / G4P-2 / G4P-3 / deferred]. Commit `[ ]`, tree `[ ]`, blobs `[ ]`, purpose: Gate 4 Limb A, QE and H-12 content. Non-Limb-A content in scope: [accepted / not accepted]. Designation is not Gate 4 execution."
- **Unlocks on adoption.** H-12 regeneration (PA-10a) at the designated commit; route (c) native run (PA-06).
- **Still blocked after adoption.** Gate 4 execution; QE 0/11; result acceptance; Gate 5 (§6).

### PA-10 — H-12 at the designated commit: regeneration (L2c), adoption (S2a), and its P-1 relevance

- **PA-10a — H-12 regeneration at the designated commit (L2c).** Question: direct H-12 regeneration with full validation at the commit designated under PA-08a or PA-09. Evidence: formal §4.6 step 5; rulings §6 B-Q4 (H-12 regeneration gates L2a); tracker: "H-12 at `a891802e` (L2c) NOT ADOPTED AT THIS PIN; not started". Options: (a) direct regeneration at the designated commit; (b) defer. Recommendation: (a), at the commit chosen under PA-08a/PA-09. Proposed wording: "PA-10a: [direct / defer] H-12 regeneration with full validation at `[commit]`."
- **PA-10b — H-12 adoption at that pin (S2a).** Question: adopt H-12 at the regenerated pin. Evidence: tracker §16.177.3 (R5 adoption effective only at its own pins `8eec74ae…` / `ba64b2d5…`); S2a "NOT ADOPTED" (companion §4). Options: (a) adopt after PA-10a; (b) defer. Recommendation: (a) only after PA-10a evidence exists. Proposed wording: "PA-10b: [adopt / defer] H-12 at `[commit]`, regenerated under PA-10a. This adoption is effective only at its own pins."
- **PA-10c — Is H-12 adoption (S2a) a P-1 prerequisite?** Question: Formal PA-1 (§3.1, adopted): "H-12 adoption is not a prerequisite for P-1 provisioning". The packet's P1-F blocker list (row P1-F) and companion §4 sequence both list S2a before P1-F. Choices: (a) Follow PA-1: S2a is not a P1-F prerequisite; S2a is required before S3 and QE (Gate 4 §6). (b) S2a is a P1-F prerequisite as the packet and companion list. Recommendation: (a), because PA-1 is adopted and specifically addresses P-1 provisioning. Proposed wording: "PA-10c: [a / b]. For P1-F, H-12 adoption (S2a) is [not a prerequisite / a prerequisite]."
- **Unlocks.** PA-10a enables L2c; PA-10b enables S2a; PA-10c fixes P1-F's list.
- **Still blocked after adoption.** S3 and QE (need S1 and S2a complete per Gate 4 §6); Gate 4 execution.
- **Dated note (`PA-W-01`, 2026-10-29).** `H-9` is waived (§5.1): `L2c` no longer blocks anything, so PA-10a no longer gates a live dependency and PA-10b (`S2a` adoption) is no longer sequenced behind operator work — it is an authority decision only. `H-12` remains **NOT REGENERATED** at `a891802e` and **NOT ADOPTED** at that pin (facts preserved). PA-10c's question is unaffected.

### PA-11 — D-INST: adoption of the successor D-2 instrument identity (DB-B1)

- **Question.** Adopt the successor effective-write instrument identity for D-2 under DB-B1, which is required by D-Q (D-2, ruled) and PF10 (KEEP, ruled).
- **Evidence.** Candidate `evidence/integration/cap03-p1-d-inst-d2-candidate-2026-10-28/` (`02-p1-d2-effective-write-check-CANDIDATE.ps1`; identity in `SHA256SUMS.txt`). The candidate is "not parsed, not run, not adopted"; static checks only; PowerShell parse is a standing boundary (candidate record). Current identity v2 `191f5828` unchanged. Rulings §6 and §7: D-2 use requires a successor identity and A6 before use. Companion §4: D-INST "NOT ADOPTED".
- **Choices and consequences.**
  - (a) Adopt the candidate identity as the successor instrument, with its validation (parse and run) and A6 still pending. Consequence: unlocks procedure revision for the successor identity (IRR-PROC) and A6 on the successor (PA-12). Does not authorize any run.
  - (b) Do not adopt. Consequence: D-2 cannot be used; Matter D reverts to D-1 (ACL dump, no effective-access result) — not recommended by the packet.
  - (c) Defer. Consequence: PF10 KEEP cannot be implemented; E10 (PA-13) cannot name a D-2 capture.
- **IRR recommendation.** Option (a), with the candidate's limitation (no parse or run; no real DACL comparison) stated in the adoption. The packet recommends D-2 with D-1 as supporting evidence. This is a recommendation.
- **Proposed PA wording.**
  > "PA-11: [adopt / do not adopt / defer] the successor D-2 instrument with identity `[SHA-256 from candidate SHA256SUMS]` under DB-B1, for Matter D object 'store parent' and method D-2. Adoption of the identity does not authorize any run, and A6 must complete before any use."
- **Unlocks on adoption.** Procedure revision recording the successor identity (IRR-PROC); PA-12 A6 on the successor; PA-13 E10 naming the identity.
- **Still blocked after adoption.** Any run of the instrument (host, PowerShell); A6; capture; P-1.

### PA-12 — A6 runtime: authorization and sequence

- **Question.** Does A6 (runtime check on the designated host; E5) require a separate PA authorization act, or is it authorized under the operator's own authorization (MC-2)? And must A6 run on the successor instrument before use?
- **Evidence.** Rulings §6 (C-Q1 YES; C-Q2 MC-2): "Host qualification proceeds under its own operator authorization." Rulings §7: "Not authorized by this record: A6 runtime, PF preflight, PowerShell, host capture, E10 …, P-1. The D-2 successor instrument … needs PA adoption of its identity and A6 before use." Companion §4: A6 "NOT STARTED"; Operator. Packet C-Q1: A6 reads the designated blob by hash and does not depend on the checked-out commit.
- **Conflicting statements.** MC-2 (operator authorization for A6) vs rulings §7 (A6 not authorized by that record; successor use needs PA adoption of identity and A6). Both are recorded; the PA must state which governs A6 itself.
- **Choices and consequences.**
  - (a) A6 proceeds now under the operator's own authorization (MC-2), commit-independent; a separate A6 on the successor instrument is required before any successor use (PA-11). Consequence: rulings §7's statement that A6 is not authorized by that record is superseded for A6 by MC-2.
  - (b) A6 requires a separate PA authorization act after PA-11. Consequence: A6 waits for the act.
  - (c) A6 on the current v2 instrument only; successor A6 deferred. Consequence: no successor use until a later A6.
- **IRR recommendation.** Option (a) for the commit-independent A6 under MC-2, with a successor A6 before any successor use. This is a recommendation; PASS2 §7 and MC-2 are both recorded, so the PA must state which governs.
- **Proposed PA wording.**
  > "PA-12: [a / b / c]. A6 is authorized [under operator authorization per MC-2 / by PA act]. A6 on the successor instrument is required before any use of the successor identity."

- **Unlocks on adoption.** Operator A6 run (H-4); successor A6 before PA-11 use.
- **Still blocked after adoption.** Capture (PA-13); P-1; any commit-keyed observation (MC-2 limits these to the attempt session).
- **Dated note (`PA-W-01`, 2026-10-29).** `H-4` is waived as a blocker (§5.1). A6 as a **precondition** of PA-11/PA-13 sequencing is removed; `A6` remains **NOT RUN** and no D-2 effective-access result exists, so the D-2 method must not be reported as established. The MC-2 versus rulings-§7 authority question — the actual subject of PA-12 — is unaffected by the waiver.

### PA-13 — E10: capture-authorization act for P-1-C and P-1-D

- **Question.** Render the capture-authorization act (E10) naming host, session, root, identity, pins, window and operator. Render now, or after PA-11 and PA-12?
- **Evidence.** Companion §4: E10 "NOT RENDERED (PA drafts it)". Packet E10: "PA drafts the capture-authorization act only after E3 and the listed rulings. This is not P-1 authorization." Session package §5.6: a capture does not spend the attempt, does not satisfy P-1-C or P-1-D, and does not authorize provisioning (procedure line 435). Procedure `2026-10-28d` (E3 applied; rulings §7). Root and parent ruled (E8).
- **Choices and consequences.**
  - (a) Render E10 now, naming the current v2 identity `191f5828`. Consequence: Matter D's D-2 is not satisfied; capture uses D-1 only.
  - (b) Render E10 after PA-11 and PA-12, naming the successor identity. Consequence: capture waits; D-2 is available.
  - (c) Defer. Consequence: P-1-C and P-1-D cannot start.
- **IRR recommendation.** Option (b), because D-Q (D-2) and PF10 (KEEP) are ruled and require the successor. This is a recommendation.
- **Proposed PA wording.**
  > "PA-13: [a / b / c]. E10 capture authorization: host `[ ]`, session `[ ]`, root `D:\cap03-p1-capture-20261028-01`, parent `D:`, identity `[ ]`, pins `[ ]`, window `[ ]`, operator `[ ]`. This is not P-1 authorization and does not satisfy P-1-C or P-1-D."
- **Unlocks on adoption.** Operator P-1-C capture and P-1-D verification (H-8).
- **Still blocked after adoption.** P-1 execution; P1-F (PA-14); S3; QE.
- **Dated note (`PA-W-01`, 2026-10-29).** `H-5` and `H-6` are waived as blockers (§5.1): E10's rendering no longer waits on them, and no repository-verifiable root check or `DC` result is required. The procedure's own invocation-time checks are unchanged and are not a governance blocker. `H-8` is also waived — see PA-14 — so E10's *authority* is now the only thing standing between this decision and a capture, and E10 is **NOT RENDERED**.

### PA-14 — P-1 authorization act (P1-F): prerequisites only in this sitting

- **Question.** This sitting does not authorize P-1. The PA decides only whether the prerequisites in the list below are complete when the P1-F act is later rendered. No P1-F act is decided here.
- **Evidence.** Packet P1-F row: "Blocked by P1-C, P1-D, B-DESIG, L2a, L2c, ADP-D1, ADP-D2, A-GAP1, S2a." Formal §4.6 and PA-5 (P-1-F: "Render only after PA-5 path and C′ designation"). Companion §4: "P-1 remains NOT AUTHORIZED until P1-F is rendered."
- **Prerequisite status (verified against the records above).**

| Prerequisite | Status | Decision or evidence needed | After `PA-W-01` (2026-10-29) |
|---|---|---|---|
| P1-C (capture) | NOT ESTABLISHED | PA-13; H-8 | `H-8` **waived** — not a blocker; the status stays a fact. `PA-13` (E10) remains outstanding authority |
| P1-D (verification) | NOT VERIFIED FOR THE ATTEMPT | H-8 | `H-8` **waived** — not a blocker; the status stays a fact |
| B-DESIG (designation act) | NOT DONE | PA-08a, PA-09 (step 4) | Unchanged — authority |
| L2a (fresh S2 at designated commit) | Run recorded at `a891802e`; admission open | PA-06; H-7 if option (b) | `H-7` **waived** — the option-(b) repeat-run branch no longer applies; admission remains `PA-06` |
| L2c (H-12 at designated commit) | NOT EVIDENCED | PA-10a | `H-9` **waived** — not a blocker; the status stays a fact |
| ADP-D1 (P-1 commit definition) | Adopted, conditional on B-1 | PA-08a | Unchanged — authority |
| ADP-D2 (receipt element) | ACCEPTED at `a891802e` (receipt element only) | None | Unchanged |
| A-GAP1 (act row S1 governs) | RULED | None (subject to PA-15 for identity values) | Unchanged |
| S2a (H-12 adoption) | NOT ADOPTED; P-1 relevance open | PA-10b, PA-10c | Unchanged — authority |
| Source confirmation | OPEN | PA-01 | Unchanged — authority |
| A-Q5 / A-Q6 | OPEN / CONDITIONAL | PA-03, PA-04 | Unchanged — authority |
| Identity values (successor act §4 / §5.2) | CONFLICTING | PA-15 | Unchanged — authority |

- **`PA-W-01` effect on this list (`2026-10-29`).** No `H` item remains in the P1-F prerequisite chain: `H-7`, `H-8` and `H-9` are waived as blockers (§5.1, §9). What remains is exclusively **authority and admission** — `PA-06`, `PA-08a`, `PA-09`, `PA-13`, `PA-10b`/`PA-10c`, `PA-03`/`PA-04`, `PA-15` — or a status that is a **fact** (`P1-C` not established, `P1-D` not verified, `L2c` not evidenced, `S2a` not adopted) and must not be reported otherwise.

- **IRR recommendation.** No recommendation on P1-F in this sitting. Schedule the P1-F act only after every listed prerequisite is complete and recorded. The sitting should record the prerequisite list as the agreed order.
- **Proposed PA wording.**
  > "PA-14: The Program Authority notes the prerequisite list in this package. No P-1 authorization is given by this decision. P-1 remains NOT AUTHORIZED. The P1-F act will be rendered only after the listed prerequisites are recorded, and will name the execution commit, tree and blobs."
- **Unlocks on adoption.** Nothing. This is a sequencing acknowledgement.
- **Still blocked after adoption.** Everything in the P-1 chain.
- **Dated note (`PA-W-01`, 2026-10-29).** The prerequisite list above now contains no waived evidence item; the sequencing acknowledgement therefore concerns only authority and admission decisions. P-1 remains **NOT AUTHORIZED** and no `P1-F` act is rendered by the waiver.

### PA-15 — Identity values for successor act §4 / §5.2 (the S1 identity limb)

- **Question.** Are the identity values `PRINCIPAL_LABEL`, `TENANT_ID` and `CANONICAL_OWNER_ID` resolved, and does the S1 identity-value determination of 2026-10-24 (IPD `f9ec0c5`) govern?
- **Evidence.** Rulings §8: "Identity values still unresolved" (successor act §4 / §5.2). A-Q5 result record §4 correction (CV-CORR-158): constants non-null at IPD `main` `b9dd6fce` and at `a891802e`, set by binding commit `f9ec0c5` (IPD commit "CAP-02: S1 identity-value determination and binding commit", `2026-10-24T06:13`; tree `fcf7cb85`). Act §6 row S1 (IPD `66b56fd1…` context; companion §5): "BLOCKED — identity values unresolved" (governs under A-GAP1). IRR has not verified the constant values in this pass.
- **Choices and consequences.**
  - (a) Identity values are resolved by `f9ec0c5`. Consequence: the identity limb is cleared; act row S1 is updated by IPD pointer (IPD-owned; not IRR).
  - (b) Identity values remain unresolved. Consequence: the identity limb stays open; PA-06 / PA-14 cannot close.
- **IRR recommendation.** None until IRR has read the constants at `f9ec0c5` (not done in this pass). The PA should decide on the record: the two statements cannot both stand.
- **Proposed PA wording.**
  > "PA-15: [a / b]. The identity values (`PRINCIPAL_LABEL`, `TENANT_ID`, `CANONICAL_OWNER_ID`) are [resolved by the determination at `f9ec0c5` / unresolved]. Act row S1 is [unchanged / updated by IPD pointer]."
- **Unlocks on adoption.** The identity limb of §8.2; P1-F prerequisite.
- **Still blocked after adoption.** S1 execution; P-1; host limbs.

### PA-16 — REG-11: optional reopen or formal closure

- **Question.** Only if the PA wishes: retain Option C deferral (no action), formally close it, or reopen it.
- **Evidence.** Tracker §11 (Option C, 2026-10-13); register row BLOCKED / DEFERRED; §16.116 "closure" text was never recorded (pointer annotated §16.199); R1/R2 effective per §16.112 (companion §7).
- **Choices.** (a) No action (retain Option C). (b) Formal closure act. (c) Reopen.
- **IRR recommendation.** (a); no governing requirement forces an action.
- **Proposed PA wording.**
  > "PA-16: [retain Option C deferral / close / reopen]. REG-11 status: [ ]."
- **Unlocks / blocked.** No downstream step depends on REG-11.

### PA-17 — REG-12: Company Identity Authority (mapping blocker)

- **Question.** For the mapping blocker (`companyId` ↔ `ISIN` ↔ G24 ticker), designate a Company Identity Authority by express act naming the bounded domain, source and consumer, or expressly decline designation.
- **Evidence.** Bounded Gate 3 scope `IMPLEMENTED & ACCEPTED` (tracker §16.77). PA decision 2026-10-24 (CV-43 / D115): no Company Identity Authority designated; re-entry requires an express act. Tracker §16.199 table row 6: BLOCKED — owner decision.
- **Choices.** (a) Designate a Company Identity Authority, naming domain, source and consumer. (b) Decline designation; the bounded Gate 3 scope stays the only accepted scope.
- **IRR recommendation.** None. No authoritative decision supplies a disposition.
- **Proposed PA wording.**
  > "PA-17: [designate: Company Identity Authority `[ ]`, domain `[ ]`, source `[ ]`, consumer `[ ]` / decline designation]."
- **Unlocks / blocked.** Gate 4 host qualification, result acceptance, Gate 5, runtime enablement, `durable:true` and any `503` lift remain not granted regardless of this decision.

### PA-18 — L2b: is any action required?

- **Question.** Is any L2b action (CAP-03 / Path A DR-track QE, §16.122.7) required, and if so, what is its scope?
- **Evidence.** Formal record line 102: L2b "Designated, not established (§16.122.9)". Addendum row L2B: "not yet eligible; PA (only if required)". Packet row L2B: "No recommendation: the register holds no basis for IRR to say whether an L2b action is required."
- **Choices.** (a) No action required (close). (b) Action required; scope stated by the PA.
- **IRR recommendation.** None; the register holds no basis for one.
- **Proposed PA wording.**
  > "PA-18: [no action required / action required, scope: `[ ]`]."

---

## 4. Dependency order

### 4.1 Sequence

Stage 1 (sitting, in parallel where noted):
1. PA-01 source confirmation. Gates PA-02 to PA-09 where they cite the designation record.
2. PA-02 (A-Q4), PA-05 (B-Q6), PA-07 (labels), PA-16 (REG-11, optional), PA-17 (REG-12), PA-18 (L2b). These are independent of each other.
3. PA-03 (A-Q5), then PA-04 (A-Q6). PA-04 depends on PA-03.
4. PA-15 (identity values). Independent; required before PA-14.

Stage 2 (after Stage 1):
5. PA-06 (S2 admission basis). Depends on PA-01 (for the designation record's statements) and on the waiver question.
6. PA-08a, PA-08b, PA-08c (P-1 commit and designation chain). PA-08a depends on PA-04 and PA-06; PA-08b depends on PA-08a; PA-08c is independent.
7. PA-09 (G4-PIN). Depends on PA-01 (i), PA-06 and PA-08a (commit alignment), but the Gate 4 pin decision itself is independent of P-1.

Stage 3 (after the designated commit is recorded):
8. PA-10a (H-12 regeneration at the designated commit). Operator and IRR/IPD work; no host action.
9. PA-10b (H-12 adoption). Depends on PA-10a evidence.
10. PA-10c (is S2a a P-1 prerequisite). Can be decided in Stage 2.

Stage 4 (D-INST and capture):
11. PA-11 (D-INST adoption). Depends on D-Q and PF10 (both ruled).
12. PA-12 (A6 authorization and sequence). Operator A6 (H-4) follows. *(H-4 waived — see §4.1.1)*
13. PA-13 (E10). Depends on PA-11 (if option b), PA-12, and root check (H-6). *(H-6 waived — see §4.1.1)*
14. Operator P-1-C capture and P-1-D verification (H-8) under E10. *(H-8 waived as a prerequisite — see §4.1.1)*

Stage 5 (P-1 authorization):
15. PA-14 prerequisite check, then the P1-F act (not in this sitting). Requires PA-08a, PA-06 (L2a), L2c (PA-10a), S2a per PA-10c, PA-15, PA-03/04, PA-01, and the operator steps H-8. *(H-7/H-8/H-9 waived — no operator evidence step remains in this set; see §4.1.1)*

Stage 6 (after P-1 — out of scope for this sitting): S3, QE-1 to QE-11, Gate 4 execution and result acceptance, DQ-4 freeze, Gate 5 admission. Each has its own authority and is not decided here.

### 4.1.1 Sequence after `PA-W-01` (2026-10-29) — waived items removed

The sequence above is retained verbatim as the pre-ruling record. Read with the waiver, steps 12–15 change as follows; **no other step changes**, and no step is added.

| Pre-ruling step | Waived dependency it carried | Post-waiver form |
|---|---|---|
| 5 (PA-06) | `H-2`, `H-7` | PA-06 is decided on **admission only**. Option (b) (a fresh native run) is no longer a live branch, so no operator step follows from this decision |
| 8 (PA-10a) | `H-9` (`L2c`) | `L2c` no longer gates anything. PA-10a/PA-10b are authority decisions; `H-12` remains **NOT REGENERATED** and **NOT ADOPTED** at `a891802e` as facts |
| 12 (PA-12 / A6) | `H-4` | `A6` is no longer a precondition of PA-11 use or PA-13 readiness; it stays **NOT RUN**, and no D-2 effective-access result may be claimed |
| 13 (PA-13 / E10) | `H-5`, `H-6` | E10 waits only on `PA-11` / `PA-12` authority. Procedure invocation-time checks (`DC-C2`, root refusal) are unchanged and are not scheduling blockers |
| 14 (operator P-1-C / P-1-D) | `H-8` | No operator evidence step is scheduled as a prerequisite. `P-1-C` **NOT ESTABLISHED** and `P-1-D` **NOT VERIFIED** stay recorded as facts. A capture occurs only if and when E10 authorizes one, and executing P-1 still requires that capture to have happened — the operation itself, not an evidence precondition |
| 15 (PA-14 → P1-F) | `H-7`, `H-8` | The P1-F prerequisite set contains **no waived evidence item**; it is all authority/admission (§3 PA-14). P-1 remains **NOT AUTHORIZED** |

**No stop condition in this sequence remains that is founded on a waived H item.** The two operator-environment facts the procedure evaluates at invocation (existing root; `DC-C2` checks) are procedure behaviour, not blockers, and are recorded as such in §5.1.

### 4.2 What adoption does not authorize

| Adopted decision | Does not authorize |
|---|---|
| PA-01 confirmations | Any P-1, capture, A6, host action or Gate 4 execution |
| PA-02 (A-Q4) | Any IPD change; any acceptance or admission of evidence |
| PA-03 (A-Q5 ratification) | Changes to the compiled basis constants; S1 execution |
| PA-04 (A-Q6) | Host, Node, P-1 or V-A2 limbs; any execution |
| PA-06 (S2 admission) | QE; Gate 4 execution; Gate 5; `V1295`; production |
| PA-08 (P-1 commit) | P-1 execution; L2a or L2c being satisfied (they need their own evidence) |
| PA-09 (G4-PIN) | Gate 4 execution; QE; result acceptance |
| PA-10b (H-12 adoption) | Anything beyond its own pins; QE |
| PA-11 (D-INST) | Any run of the instrument; A6; capture |
| PA-12 (A6) | Capture; P-1; any commit-keyed observation beyond the attempt session |
| PA-13 (E10) | P-1 authorization (E10 is not P-1 authorization) |
| PA-14 (prerequisite list) | P-1 |
| PA-17 (REG-12) | Gate 4 host qualification; Gate 5; `durable:true`; `503` lift |

---

## 5. Operator and host evidence (not PA decisions) — H-1…H-9 **PA-WAIVED** under `PA-W-01`

> **Dated note (`PA-W-01`, 2026-10-29).** Items **H-1 through H-9** are classified **PA-WAIVED — NOT A BLOCKER** by the adopted ruling `IIPS-V3-CAP03-H1-H9-BLOCKER-WAIVER-PA-DECISION-2026-10-29-01` (§9). The table below is retained verbatim as the pre-ruling record; its "Blocks" column is superseded for H-1…H-9 by §5.1, which states for each item the waiver's exact effect, the factual status that is **not** upgraded, and any residual functional prerequisite attached to a specific operation. **H-10 is not waived** (it was never a prerequisite; it remains optional). The identifier set here is this package's own; it is not the CAP-02 QE matrix §1 `H-1`…`H-8` set, nor the G2-2 record's `H-1`…`H-9` errata set, and the waiver does not reach those.

| ID | Evidence | Where / how | Blocks (pre-ruling) |
|---|---|---|---|
| H-1 | Host originals of the S2 run (16 sealed artifacts, `SHA256SUMS.txt` with self-hash `9d3c09db…b5225e`, `MANIFEST.json`, `s2-a891802e-20261028T192516Z.seal-recheck.txt`, `deposit-host-hashes.txt`): 18 host digests must equal the expected manifest (`evidence/integration/cap03-s2-dep-a-2026-10-29/02-deposit-manifest-expected.txt`) | `C:\iips-evidence\cap03-s2-a891802e` on host `DESKTOP-NO0NHTP`; S2-DEP-A steps 1–3 | D1 read-back; S2-DEP-A deposit |
| H-2 | The 47-entry verification output (R-1). Until supplied, the PASS is user-reported | Operator output file; not in the repository | R-1 residual; PA-06 scope statement |
| H-3 | Host original of `s2-checkout-verification.txt`. Recorded digest `3FD31FE6…` does not match the deposited copy `0df30bc6…` | Host original; S2-ACC-A1 integrity note | Integrity note closure |
| H-4 | A6 runtime on the designated host (E5). Not run | Operator, under its own authorization (PA-12) | Successor use (PA-11); capture (PA-13) |
| H-5 | DC-a and DC-b (V1102) under their own authorization (E6); DC-C2 pre-invocation checks (E7, next capture) | Operator | PA-13 capture readiness |
| H-6 | Root check: `D:\cap03-p1-capture-20261028-01` absent; parent `D:` present (procedure refuses an existing root, line 197) | Operator | PA-13 |
| H-7 | Native S2 run at the designated commit, only if PA-06 option (b) or non-waiver applies | Operator; route (c) | L2a; Gate 4 Limb A |
| H-8 | P-1-C capture and P-1-D verification under E10 | Operator; procedure `2026-10-28d` | P1-C, P1-D; P1-F |
| H-9 | H-12 regeneration with full validation at the designated commit (L2c) | IPD / IRR tooling after PA-10a direction; no host requirement recorded | L2c; S2a |
| H-10 | PF-11 `92d931fb` diagnosis (only if the PA requests it) | Operator | Not a prerequisite; optional |

The S2-DEP-A transfer (steps 4–5) cannot be performed from the Linux execution environment: the host filesystem is not reachable (S2-DEP-A §3). No substitute content is admissible. *(Dated note `PA-W-01`, 2026-10-29: retained as a statement of environment fact. It is no longer an outstanding obligation — `S2-DEP-A` closed as **DEPOSITED — COMPLETE** on 2026-10-29 (tracker §16.194), and H-1's remaining limbs are waived below. No further host-evidence transfer is initiated or required.)*

### 5.1 Status of H-1…H-9 after `PA-W-01` — waived blocker, retained fact, residual prerequisite

Every row's first fact is the ruling: **PA-WAIVED — NOT A BLOCKER.** The remaining columns exist so the waiver is not read as evidence: nothing in the repository is upgraded, no unperformed action is recorded as performed, and no missing artifact is claimed to exist.

| ID | Kind of item | Waiver effect — no longer blocks | Retained factual status (not upgraded by the waiver) | Residual *functional/technical* prerequisite, and the operation it attaches to |
|---|---|---|---|---|
| H-1 | Evidence transfer / deposit duplicate (host originals, 18-digest reconciliation) | Closure of the `D1` read-back; any further `S2-DEP-A` deposit step. `S2-DEP-A` is already **DEPOSITED — COMPLETE** (tracker §16.194) | The 18 host-original digests were not reconciled in this repository; the deposited set's 16/16 `SHA256SUMS` match on `main` stands as recorded. No claim that the host originals were re-verified | **None.** |
| H-2 | Evidence held outside the repository (47-entry verification output, `R-1`) | The `R-1` residual and the `PA-06` scope statement | The 2026-10-26 `PASS` remains **user-reported**; the 47-entry output is not in the repository and was not independently reproduced. The later native `s2-a891802e` run has its own published evidence (§1) | **None.** |
| H-3 | Disputed deposit copy (recorded digest `3FD31FE6…` vs deposited `0df30bc6…`) | Closure of the `S2-ACC-A1` integrity note | The discrepancy stays recorded and **unresolved**; the deposited copy on `main` is the authoritative file for content purposes, and the host original was not produced or compared | **None.** |
| H-4 | Unperformed runtime observation (`A6`, `E5`) | `PA-11` successor-use gating and `PA-13` capture readiness | `A6` **NOT RUN**; **no effective-access (DACL) result for the store parent exists**; the D-2 method must not be reported as established | **None that blocks a decision.** If D-2 is ever relied on, the result must come from the instrument at the time of that use; a pre-existing `A6` result cannot be cited because none exists. Affected operation: any future reliance on a D-2 effective-access finding |
| H-5 | Unperformed operator checks (`DC-a`/`DC-b`; `DC-C2` pre-invocation checks) | `PA-13` capture-readiness gating | `DC-a`/`DC-b` results absent; the `DC-C2` checks have not been performed for any capture | **None that blocks a decision.** `DC-C2` are pre-invocation safety checks performed *by the procedure at the moment of* any future capture (procedure `2026-10-28d`); they are waived as scheduling blockers, not deleted from the procedure. Affected operation: a future capture invocation |
| H-6 | Repository-unverifiable host fact (root `D:\cap03-p1-capture-20261028-01` absent; parent `D:` present) | `PA-13` / `E10` sequencing | Root state on `D:` was **not verified** and remains unverifiable from the repository | **None that blocks a decision.** The procedure refuses an existing root (line 197), so the instrument evaluates it at invocation; a refusal there is a procedure outcome. Affected operation: a future capture |
| H-7 | Repeat-run demand (native S2 at the designated commit, only under `PA-06` option (b)) | `L2a` and Gate 4 Limb A; and `PA-06` option (b)'s precondition, which no longer applies | The native run `s2-a891802e-20261028T192516Z` remains the recorded run at the designated pin (`PASS`, 16/16 on `main`). Its **admission remains `PA-06`** — an authority question the waiver does not decide | **None.** The waiver removes the repeat run; it does not admit the existing run (that is `PA-06`) |
| H-8 | Unperformed operator work (`P-1-C` capture, `P-1-D` verification) | The `P1-F` documentary prerequisite chain for `P1-C`/`P1-D` | `P-1-C` **NOT ESTABLISHED**; `P-1-D` **NOT VERIFIED FOR THE ATTEMPT**; no capture was performed and none is claimed | **Executing P-1 requires a capture to have been performed** — that is the operation itself, not a documentary precondition. Affected operation: **P-1 execution only**, which remains **NOT AUTHORIZED** (`PA-14` / the unrendered `P1-F` act). The waiver does not authorize it |
| H-9 | Unperformed regeneration (`H-12` at the designated commit, `L2c`) | `L2c`, and the `S2a` sequencing limb that waited on it | `H-12` **NOT REGENERATED** at `a891802e`; **NOT ADOPTED** at that pin. The `H-12 R5` adoption remains effective only at its own pins | **None.** `S2a` adoption is a PA decision (`PA-10b`) — authority, not evidence — and is unaffected |

**Reading rule.** For every H-1…H-9 item the answer to "does this still block a CAP-03 decision, sequence step or gate?" is **no**. The two residual entries (H-4, H-8) are not evidence demands: they state what a future *execution* would necessarily do, and neither is a prerequisite of anything decided in this package. No item above is reclassified as a technical blocker.


---

## 6. Excluded, IPD-owned and non-PA items

| Item | Status | Owner / reason |
|---|---|---|
| FRM-D1C (IPD row 7 citation) | IPD-OWNED | IPD prompt when IPD authority is granted; no PA ruling needed |
| IRR-PROC (procedure text change) | NOT PA-GATED | IRR action after PA-11 (successor identity) only |
| E3 (procedure revision) | APPLIED (`2026-10-28d`) | Further revision only if PA-11 or PA-12 require |
| G4-S2 (native run route) | Route recorded (Q-S2-2 (c)); run depends on PA-06 and PA-09 *(Dated note `PA-W-01`, 2026-10-29: the repeat-run limb `H-7` is waived, so this row is an admission question only and schedules no operator run)* | Operator |
| S2-IRRDOC | APPLIED | None |
| IPD PR #107 sourcing defect | EXCLUDED | Not addressed in this package |
| DQ-4 freeze, S3, QE-1 to QE-11, Gate 4 execution, Gate 5 | NOT GRANTED; NOT DECIDED HERE | Separate authority after P-1 and the Gate 4 chain |
| Gate 4 execution and result acceptance | NOT STARTED | Not authorized by any decision in this package |
| Production, `durable:true`, `503` lift | NOT GRANTED | Not authorized by any decision in this package |

---

## 7. Coverage check (no omissions, no duplicates)

| Source list | Items | Where decided |
|---|---|---|
| Companion §9 (items 0–12) | 0 S2 admission → PA-06; 1 source confirmation → PA-01; 2 A-Q4 → PA-02; 3 A-Q5 → PA-03; 4 A-Q6 → PA-04; 5 B-Q6 → PA-05; 6 D-INST → PA-11; 7 E10 → PA-13; 8 S2a → PA-10b/PA-10c; 9 P1-F → PA-14; 10 G4-PIN → PA-09; 11 REG-11 → PA-16; 12 REG-12 → PA-17 | Complete |
| Companion §4 dependency sequence | PA-01, A-Q4, A-Q5, A-Q6, B-Q6, B-Q1 / B-1 (PA-08a), D-INST, E10, D1 read-back (H-1), L2c / L2a (PA-10a, PA-06), S2a (PA-10b), P1-F *(H-1 and `L2c` `PA-WAIVED` by `PA-W-01`, 2026-10-29)* | Complete |
| Packet Table 1 PA-open rows (AWAIT-PA) | A-Q1, A-Q2, A-Q3: RULED (§2). A-GAP1: RULED (§2). A-Q4: PA-02. A-Q5, A-Q6: PA-03, PA-04. B-Q1, B-Q3: PA-08a. B-Q2: not applicable under B-1; PA-08a (B-0 branch). B-Q4: RULED (§2). B-Q6: PA-05. C-Q1, C-Q2: RULED (MC-2), with conflict in PA-12. D-Q: RULED (§2). QP1: RULED (§2). E8: RULED (§2). E7: RULED (§2). PF10: RULED KEEP (§2). Q-N1, Q-B5: PA-07. Q-S2-1: RULED (§2), residual H-2/H-3 *(waived `PA-W-01`, 2026-10-29 — no residual)*. Q-S2-2 / Q-B7: RULED route (c) (§2); run admissibility PA-06. G4-S2: operator run (H-7 if needed). S2-IRRDOC: APPLIED. B-DESIG: PA-08 step 4 and PA-09. G4-PIN: PA-09. L2B: PA-18. E3: APPLIED. D-INST: PA-11. IRR-PROC: §6. E10: PA-13. P1-F: PA-14. FRM-D1C: §6. ADP-D1: PA-08a. ADP-D2: RULED (§2). | Complete |
| Session package Table 1 / §5.2 minimum rulings | Q-A1 to Q-A6 and A-GAP1 (§2, PA-02 to PA-04); Q-B1 to Q-B4 and Q-B6 (PA-08a, §2, PA-05); C-Q1 and C-Q2 (§2, PA-12); D-Q (§2, PA-11 consequence); E7, E8, PF-10 (§2, PA-11, PA-13); Q-P1 (§2); Q-S2-1, Q-S2-2, Q-B5 (§2, PA-06, PA-07) | Complete |
| §5 operator/host evidence `H-1`…`H-9` | 9 items, each waived by `PA-W-01` | §5.1 (effect, retained fact, residual) and §9 (ruling); tracked at tracker §16.202 |
| Rulings §5 open choices | 1 G4 pin (PA-09); 2 A-Q5 mechanism (PA-03); 3 A-Q4 (PA-02); 4 R-2 premise (ruled §2; the CRLF premise recorded in rulings §3 stands); 5 D1 for Q-S2-1 (closed by S2-ACC-A1 §4; DA `D1` is PA-08c); 6 PF10, E8, D-Q, ADP-D1, ADP-D2, QP1, B-Q1, G4-PIN (§2, PA-08a, PA-09) | Complete |
| Formal record §4.6 steps 1–6 (adopted pin-selection process) | Designation prerequisites for PA-08a and PA-09 | PA-08, PA-09, PA-10 |

---

## 8. Non-grants

Nothing in this package grants: any P-1 authorization; any capture, A6 or PowerShell run; any host action; QE; Gate 4 execution or result acceptance; Gate 5 admission; S3; DQ-4 freeze; production eligibility; `durable:true`; `503` lift; any IPD write; any change to the compiled basis constants, `BASIS_COMMIT` or `BASIS_TREE`; any gate, acceptance, qualification, admission, authorization, pin or capability status. Preparing this package is not adoption of any decision in it.

**`PA-W-01` boundary (`2026-10-29`).** The adopted waiver of `H-1`…`H-9` (§9) grants **none** of the above. It waives governance, documentary and workflow blocker status only. It is not a production authorization, not a durable-write authorization, not a Gate 4, QE or Gate 5 authority, not a P-1 authorization, and not an admission of any evidence. It does not change the non-production, single-user scope, and it does not make any unperformed action performed or any absent artifact present.

---

## 9. Adopted PA ruling — `PA-W-01`: waiver of H-1…H-9 as blockers

> **This section is an ADOPTED, EFFECTIVE Program Authority decision.** It is the only adopted decision in this file. Everything in §3 remains `PROPOSED — NOT ADOPTED — NOT EFFECTIVE`.

### 9.1 Decision identity

| Field | Value |
|---|---|
| **Decision ID** | `IIPS-V3-CAP03-H1-H9-BLOCKER-WAIVER-PA-DECISION-2026-10-29-01` (short form `PA-W-01`) |
| **Decision date** | `2026-10-29` (IST; `2026-10-29` UTC) |
| **Authority** | **Program Authority — Ramki**, single owner, sole user and Program Authority of the single-user personal-use IIPS platform (tracker header). Rendered as an express affirmative ruling, under the standing authorization for CAP-03 in-scope work |
| **Decision type** | Affirmative PA waiver — **not** a recommendation, **not** a proposal awaiting further approval, **not** a request |
| **Scope** | IIPS v3.0 CAP-03, non-production, single-user application, in the IRR locus. The items are exactly **H-1 through H-9** of §5 of this package |
| **Effective** | On publication to IRR `main` from the merge of the carrying PR, and verified by post-merge read-back (tracker §16.202) |
| **Register effect** | Each of `H-1`…`H-9`: classification becomes **PA-WAIVED — NOT A BLOCKER** |

### 9.2 The ruling, as directed

The Program Authority directs that the outstanding material-evidence and host-operator items **H-1 through H-9** identified in this consolidated CAP-03 decision package are **WAIVED AS BLOCKERS**. These items are not to remain governance or workflow blockers merely because evidence was previously transferred, is held outside the repository, has a disputed deposit copy, or would require another operator transfer or repeat run to reproduce.

### 9.3 Rationale

1. **Reproduction cost without decision value.** Each item is either a duplicate of evidence already published and byte-verified on `main` (H-1; the 16/16 `SHA256SUMS` match and the sealed-run publication), or an artifact whose absence changes no finding already recorded (H-2, H-3), or a repeat of an unperformed action whose status is already correctly recorded as unperformed (H-4 to H-9).
2. **The items were gating workflow, not conclusions.** They blocked sequencing steps and prerequisite lists while the underlying authority questions — admission, designation, authorization — remained untouched. Removing them from the chain changes what is *scheduled*, not what is *known*.
3. **The host is not reachable from the execution environment.** The S2-DEP-A and D1 read-back limbs cannot be performed from the Linux environment (S2-DEP-A §3); treating them as standing blockers converts an environment limitation into an indefinite stop condition.
4. **Single-user, non-production scope.** The Program Authority is the sole user and the operator. The cost of a repeat transfer is borne entirely by the same party who is deciding, and that party has ruled it unnecessary.

### 9.4 Exact effect — item by item

| Item | Class before the ruling | Class after the ruling | Removed from |
|---|---|---|---|
| H-1 | BLOCKED — operator (evidence transfer) | **PA-WAIVED — NOT A BLOCKER** | `D1` read-back; `S2-DEP-A` deposit limb (already `DEPOSITED — COMPLETE`, §16.194) |
| H-2 | BLOCKED — external evidence | **PA-WAIVED — NOT A BLOCKER** | `R-1` residual; `PA-06` scope statement |
| H-3 | BLOCKED — disputed deposit copy | **PA-WAIVED — NOT A BLOCKER** | `S2-ACC-A1` integrity-note closure |
| H-4 | BLOCKED — operator (`A6` unrun) | **PA-WAIVED — NOT A BLOCKER** | `PA-11` successor-use sequencing; `PA-13` capture readiness |
| H-5 | BLOCKED — operator (`DC-a`/`DC-b`, `DC-C2`) | **PA-WAIVED — NOT A BLOCKER** | `PA-13` capture readiness |
| H-6 | BLOCKED — operator (root check) | **PA-WAIVED — NOT A BLOCKER** | `PA-13` / `E10` sequencing |
| H-7 | BLOCKED — repeat run | **PA-WAIVED — NOT A BLOCKER** | `L2a`; Gate 4 Limb A; `PA-06` option (b) precondition |
| H-8 | BLOCKED — operator (`P-1-C`, `P-1-D`) | **PA-WAIVED — NOT A BLOCKER** | `P1-F` documentary prerequisite chain |
| H-9 | BLOCKED — regeneration (`L2c`) | **PA-WAIVED — NOT A BLOCKER** | `L2c`; `S2a` sequencing limb |

**Consolidated effect.** (a) The nine items are removed from blocker counts, stop conditions and dependency chains wherever they appeared solely as evidence or governance requirements. (b) §4.1.1 replaces the affected sequence steps. (c) §5.1 governs the §5 table. (d) §3 items `PA-06`, `PA-10`, `PA-12`, `PA-13` and `PA-14` carry dated notes. (e) No other item is reclassified.

### 9.5 What the ruling does **not** do

- **It is not evidence.** Nothing in the repository is upgraded. No unperformed action is recorded as performed; no absent artifact is claimed to exist; no digest discrepancy is declared resolved. Every retained fact in §5.1 stands exactly as recorded before the ruling: `A6` not run; `DC` results absent; root state unverified; the 47-entry output not in the repository; the `H-3` digest mismatch unresolved; `P-1-C` not established; `P-1-D` not verified for the attempt; `H-12` not regenerated and not adopted at `a891802e`.
- **It is not an admission.** S2 admission (`PA-06`), the P-1 coordinate (`PA-08a`), `G4-PIN` (`PA-09`), `L2c`/`S2a` adoption (`PA-10a`/`PA-10b`), `D-INST` (`PA-11`), `A6` authority (`PA-12`), `E10` (`PA-13`), `P1-F` (`PA-14`), identity values (`PA-15`) and every other `PA-01`…`PA-18` item remain undecided and proposed, except where §2 records them as already resolved by existing authority.
- **It is not a production or durability authorization.** Non-production, single-user scope is unchanged. `durable:true`, any durable write, any `503` lift, Gate 4 execution, QE, result acceptance, Gate 5 admission, S3 and the DQ-4 freeze are **not** granted.
- **It is not a P-1 authorization.** P-1 remains **NOT EXECUTED / UNSPENT / NOT AUTHORIZED**; `P1-F` is not rendered.
- **It does not authorise another host action.** No transfer is initiated, no completed run is repeated, and the same waiver is not to be sought again.
- **It does not reach the tracked registers.** The register counts, the `51×17` capability matrix, the gate statuses and the IPD repository are untouched. H-numbered sets in *other* IRR records (the CAP-02 QE matrix §1 `H-1`…`H-8`; the G2-2 record's `H-1`…`H-9` errata set) are **out of scope** and unchanged.
- **It does not reach IPD.** No IPD file, branch, PR or tracker is modified from IRR. Any IPD-side consequence remains within IPD's own authority and workflow.

### 9.6 Residual prerequisites — only precise functional/technical ones

The waiver refuses to relabel evidence inconvenience as a technical blocker, and equally refuses to pretend that unperformed execution has no consequence. Exactly two operations carry a residual that is functional rather than documentary; neither is a prerequisite of any decision in this package, and neither is a blocker:

| Operation affected | Precise residual prerequisite | Why it cannot be waived, and what it is not |
|---|---|---|
| **Any future reliance on a D-2 effective-access result for the store parent** (`H-4`) | A D-2 result must be produced by the instrument at the time of that use | No `A6` result exists, so none can be cited. This is a statement about what an unrun check can prove — not a demand for a transfer, and not a blocker to any sequencing step |
| **Executing P-1** (`H-8`) | The P-1 capture must actually have been performed | An operation cannot be executed without being executed. This is the operation itself, and P-1 remains **NOT AUTHORIZED** (`PA-14` / unrendered `P1-F`); the waiver does not authorize it |

No other operation has a residual. In particular: no capture-readiness step, no `L2a` or Gate 4 Limb A step, no `P1-F` prerequisite and no sequencing step retains a waived item.

### 9.7 Consequences for dependent decisions (no contradiction left standing)

| Decision | Pre-ruling dependency on a waived item | Post-ruling position |
|---|---|---|
| `PA-06` | `H-2` (`R-1` residual); `H-7` (option (b) fresh run) | Admission only; option (b) is not a live branch; `R-1` waived |
| `PA-10a` / `PA-10b` | `H-9` (`L2c` evidence before `S2a`) | Authority only; no operator step precedes `S2a` |
| `PA-11` | `H-4` (`A6` before successor use) | Adoption decision unaffected; `A6` no longer sequenced |
| `PA-12` | `H-4` (the `A6` authority question) | Unaffected — it was always an authority question, and it remains open |
| `PA-13` | `H-5`, `H-6`, `H-8` | Authority only; procedure invocation-time checks unchanged |
| `PA-14` / `P1-F` | `H-7`, `H-8`, `H-9` | Prerequisite list is authority/admission only (§3 PA-14) |
| `§4.1` sequence | steps 5, 8, 12, 13, 14, 15 | Replaced by §4.1.1; every other step unchanged |

### 9.8 Register

| ID | Check | Result |
|---|---|---|
| `V-W-01` | Decision ID, date, authority, scope, rationale, exact effect and non-effect recorded | **DONE** (this section) |
| `V-W-02` | `H-1`…`H-9` each classified **PA-WAIVED — NOT A BLOCKER**, with retained fact and residual stated | **DONE** (§5.1, §9.4, §9.6) |
| `V-W-03` | Waived items removed from blockers, stop conditions and dependency chains; no contradictory requirement left that demands the waived evidence | **DONE** (§4.1.1, §3 dated notes, §5.1, §7) |
| `V-W-04` | Dependent decisions and sequence reconciled | **DONE** (§9.7) |
| `V-W-05` | No factual upgrade: no unperformed action recorded as performed; no absent artifact claimed present | **DONE** (§5.1, §9.5) |
| `V-W-06` | No new production, durability, gate, admission or P-1 authorization created | **DONE** (§8 boundary, §9.5) |
| `V-W-07` | No IPD modification from IRR | **DONE** (no IPD write in this pass) |

*End of §9. `PA-W-01` is adopted and effective; every other entry in this file remains proposed. Nothing outside `H-1`…`H-9` is waived, admitted, authorized or reclassified.*
