# CAP-03 — Consolidated PA Decision Package (single sitting)

> **STATUS: PROPOSED — NOT ADOPTED — NOT EFFECTIVE.** This is the single decision package for the CAP-03 sitting. Every "recommendation" below is an IRR recommendation for PA consideration. It is not a decision. Proposed wording becomes effective only when the PA adopts it in a dated act recorded in the authoritative record. Preparing this package authorizes nothing: no P-1, no capture, no A6 run, no host action, no QE, no Gate 4 execution, no Gate 5 admission, no IPD write, no durable write, no gate, pin, acceptance, qualification, admission, authorization or capability status change. **Three items are excepted from that status as of 2026-10-29 (pass 5): PA-08a, PA-08b and PA-08c are ADOPTED and recorded in §3; every other item remains PROPOSED — NOT ADOPTED (tracker §16.204, `CV-CORR-184`).**
>
> **PA WAIVER RECORDED — PA-19 (2026-10-29; authority: Ramki, PA and sole user; scope: IIPS v3.0 CAP-03, non-production, single-user).** Items **H-1 through H-9** of §5 are **PA-WAIVED — NOT A BLOCKER** as governance, documentary and workflow blockers. PA-19 is an affirmative PA ruling and is effective on its recording in §3 and in tracker §16.202. It does not decide PA-01 to PA-18, which remain PROPOSED — NOT ADOPTED. It does not establish any fact that was not established before. Surviving technical prerequisites are limited to T-1 to T-4 in §5.2 (T-4 added on 2026-10-29, pass 4). Pass-4 dispositions of PA-01 to PA-18 are recorded under each item in §3; none is a PA act.
>
> Tracker pointers: §16.200 (`CV-CORR-180`, PR #374, merge `d7352ed`), §16.201 (`CV-CORR-181`, PR #375, merge `f980f10`) and §16.202 (`CV-CORR-182`, PA-19, this revision). This file replaces the 2026-10-29 first draft in place; the first draft's decision list was incomplete and is superseded here.
>
> **PA-08a / PA-08b / PA-08c ADOPTED — 2026-10-29 (pass 5; authority: Ramki, PA and sole user; scope: IIPS v3.0 CAP-03, non-production, single-user).** Three linked decisions are adopted and recorded in §3 under PA-08. **PA-08a = B-1:** the P-1 execution coordinate is `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (tree `76f083d7058e170d8212455c03bad1033136ee68`). **PA-08b = (ii) distinct coordinate roles:** the DA-A1 step-0 coordinate `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a5f1953c0f61b452420fefb5985426ef1`) is preserved and is **not** moved to the P-1 execution coordinate. **PA-08c = (a) P-1 only:** "final execution commit" governs the P-1 chain only; the Gate 4 §8 coordinate remains a separate PA-09 matter. These are decision acts. They do not designate a Gate 4 coordinate, adopt H-12, authorize P-1, start Gate 4 execution, establish P-1-C or P-1-D, or admit Gate 5. Recorded in tracker §16.204 (`CV-CORR-184`, `CHG-2026-10-29-26`), which is **prepared and unpublished** pending reconciliation with the concurrent CAP-03 pass; the authoritative record follows on merge.
>
> **STANDING EVIDENCE WAIVER RECORDED — PA-20 (2026-10-29; authority: Ramki, PA and sole user; scope: IIPS v3.0 CAP-03 and the whole project, non-production, single-user).** Windows-host availability, Windows PowerShell availability, operator presence, and Windows-generated or operator-generated evidence are **PA-WAIVED — NOT A BLOCKER** wherever they appear as a governance, documentary or workflow requirement. This covers, without limitation, **T-2** and **T-4** of §5.2, the H-4 and H-8 rows of §5, the host and Node limbs of the §8.2 stop referred to in PA-04, the executability statements in PA-13 and PA-14, and every equivalent statement in the tracker, the dependency order (§4) and downstream reports. T-2 and T-4 are removed from all blocker counts, stop conditions, prerequisite lists and dependency descriptions (§5.2). The waiver **does not** assert that any operation ran, that P-1-C or P-1-D observations exist, that A6 ran, or that any evidence was generated; it **does not** authorize P-1 or any other operation; it creates **no** new blocker identifier; and it does not waive a genuine independent authorization decision, unresolved authoritative conflict, functional defect or integrity issue. Tracker §16.205 (`CV-CORR-185`).

**Scope.** CAP-03 PA decisions and the external evidence they depend on. IRR documentation only. Excluded and not addressed: the IPD PR #107 sourcing defect; IPD-owned changes (listed in §6 only as non-PA); the portfolio HTTP read path, IPC and durable-store work, UI and macro E2E. Non-production, single-user scope is unchanged.

**Status classes.** RESOLVED — existing authority (a recorded decision settles it; cited). OPEN — PA decision required (§3). BLOCKED — operator or external evidence required (§5; none remains after PA-19 for H-1 to H-9, and none for Windows/operator evidence after PA-20). EXCLUDED / NON-PA (§6). PA-WAIVED — NOT A BLOCKER (PA-19; H-1 to H-9 only).

---

## 0. How to use this package in the sitting

1. Read §1 (verified baseline) and §2 (resolved items; not for decision). Do not re-open §2 items without new evidence.
2. Decide the items in §3 in the order given in §4. Each decision has an ID (`PA-nn`). Adopt, amend or decline each by ID. Do not combine IDs unless the text says so.
3. Each decision lists what it unlocks and what stays blocked after adoption. Adoption of one decision never authorizes a downstream step; the downstream step needs its own prerequisites (§4.2).
4. Operator evidence items H-1 to H-9 (§5) are PA-WAIVED as blockers by PA-19 (§3), and Windows/operator evidence requirements are PA-WAIVED by PA-20 (§3). Neither waiver supplies evidence or establishes a fact. Technical prerequisites that survive are **T-1 and T-3 only**; T-2 and T-4 are PA-WAIVED — NOT A BLOCKER (§5.2).

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
| S2 host originals (H-1) | Deposited on `main`: 19 files under `evidence/cap03-s2/` (verified present). PR #366 merged as `078e50cb…` (`2026-10-29T09:56:56Z`); `078e50cb` is an ancestor of `main` (compare ahead 53 / behind 0). Tracker §16.194 (`CV-CORR-174`, V1430–V1435): "S2-DEP-A is complete". The host-run log is operator-reported and not sandbox-readable (recorded as a report in §16.194). | `gh pr view 366`; `gh api …/compare/078e50cb…main`; `git ls-tree origin/main evidence/cap03-s2/` |
| Standing (unchanged) | P-1-C NOT ESTABLISHED; P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT; P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED; QE 0/11; Gate 5 NOT INITIATED / NOT ADMITTED; `V1295` NOT MET; H-12 NOT ADOPTED at `a891802e`; G14 AWAIT-PA; DQ-4 8/10 (not re-verified) | tracker §16.176.10; rulings record header |

Corrections found while preparing this revision (not decisions; dated pointers added in the tracker §16.201):

- **C-A (companion §2).** The companion's statement that "no IRR document names the two PR #96 paths in the §16.143 disposition" is wrong. The disposition `docs/integration/IIPS_v3.0_CAP03_S2_CANDIDATE_SCOPED_BASELINE_DISPOSITION_2026-10-26.md` (line 46, change set) names exactly `scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts`. Verified this pass. The packet's claim that `521d5482` names these paths is therefore verified; whether it is an authorizing record is still PA-02.
- **C-B (identity values).** Rulings record §8 says identity values are "still unresolved". The A-Q5 result record §4 (correction CV-CORR-158) says the three constants were resolved by the PA S1 identity-value determination of 2026-10-24 (binding commit `f9ec0c5`). Both cannot stand. See PA-15.
- **C-C (A-Q5 and A-Q6 wording).** The A-Q5 result record §2 says A-O3 and target commit `a891802e` are "recorded exactly" in the IPD act and that A-Q6 is "CLEARED, items 10 and 12 only". Rulings §1 says A-Q5 mechanism and target commit were "not ruled" and §4 says A-Q6 clears only on a fresh designation act. See PA-03 and PA-04.
- **C-D (companion §1 and the register).** The register's A-Q5, A-Q6, A-GAP1 and Q-S2-2 rows still show `AWAIT-PA` (a 2026-10-28 snapshot). A-GAP1, A-Q1, A-Q2, A-Q3 and Q-S2-2 are ruled in the rulings record (§1, §2). They are listed as RESOLVED in §2 and are not re-asked.
- **C-G (S2-DEP-A status).** The 2026-10-29 first revision and the earlier §5 said the S2 deposit was BLOCKED. That was stale: tracker §16.194 records the deposit as complete (PR #366, `078e50cb`). Corrected in §1, §5 and §7. The waiver under PA-19 does not depend on this correction.

---

## 2. Resolved items (not for decision in this sitting)

| Item | Recorded decision (authority) | Consequence that remains open |
|---|---|---|
| A-Q1 | YES: DR-2 record (IPD `bc144b9`, PR #89) is the further act for `portfolio_store.ts` (rulings §1) | Item-10 re-designation is part of PA-03 |
| A-Q2 | `edd0305e` designated for `tests/g3_startup_validation.test.ts` (rulings §1) | Feeds PA-03 |
| A-Q3 | Workstream-scoped reading of act §5.1 "exhaustive" (rulings §1) | Feeds PA-02 path analysis |
| A-GAP1 | Act §6 row S1 governs; determination §12.2 superseded for S1 by pointer (rulings §1) | S1 remains BLOCKED; identity-value conflict is PA-15 |
| Q-S2-1 | R-1 not absolute; candidate-scoped acceptance `8eee2957` stands; R-2 cleared by corroborating transcript; D1 closed as repository-sufficiency item by S2-ACC-A1 §4 (rulings §2; decision record §4) | Operator items H-2 and H-3 are PA-WAIVED as blockers (PA-19); the DA-A1 "D1" is a different item (PA-08c) |
| Q-S2-2 / Q-B7 | Gate 4 S2 Limb A route (c) recorded (rulings §2): PA designates a Gate 4 commit by separate act, then the native run | The designation act is PA-09; the run's admissibility is PA-06 |
| PF10 | KEEP the `GATE_A_PRIME_*` wildcard (rulings §6) | Requires D-INST (PA-11) before use |
| D-Q | Object: store parent. Method: D-2, with D-1 supporting (rulings §6) | Triggers PA-11 |
| E7 | DC-C2 applies to the next capture only (rulings §6) | Later captures need the native PowerShell 5.1 run |
| E8 | Parent `D:`; root `D:\cap03-p1-capture-20261028-01` (rulings §7; E3 applied, procedure `2026-10-28d`) | Existence of the root on the host is not verifiable from the repository; H-6 PA-WAIVED as blocker (PA-19); the procedure refuses an existing root at runtime (line 197) |
| QP1 | PF-15 literals F2, F4, F5 approved as rendered in act `-02` (rulings §6) | None |
| B-Q4 | H-12 regeneration gates L2a at the designated commit (formal §4.6 step 5; rulings §6) | H-12 adoption status is PA-10c |
| ADP-D2 | Accepted at `a891802e`, receipt element only (rulings §6) | P1-F still blocked by other conditions |
| C-Q1 / C-Q2 | A6 confirmed commit-independent; MC-2 chosen (rulings §6) | Authorization wording conflict is PA-12 |
| DB-B1 | Sole capture-instrument identity is PF-11 root-safe v2, blob `191f5828` (adoption record §2) | Successor identity is PA-11 |
| DC-C2 | Pre-invocation checks for the next capture only (adoption record §2) | Checks run inside the capture procedure; H-5 PA-WAIVED as blocker (PA-19) |
| S2-ACC-A1 | Conditional acceptance of the S2 technical result at `a891802e`; moves no gate (decision record; tracker §16.183) | S2 admission basis is PA-06 |
| S2-IRRDOC | Dated pointer and R-2 update applied (rulings §4) | None |
| Gate 4 authority limb | `AUTHORIZED — NOT STARTED`, effective on IPD `main` from `2026-10-23` (verified §1) | Execution, QE, Gate 5: not granted (§6) |
| REG-12 bounded scope | `IMPLEMENTED & ACCEPTED` for bounded Gate 3 scope only (tracker §16.77) | Mapping owner is PA-17 |
| REG-11 | Option C deferral retained; not closed (tracker §11, §16.112) | Optional decision PA-16 |

---

## 3. Decision list (one sitting)

Each entry: question; evidence; conflicting statements; choices and consequences; **IRR recommendation** (a recommendation, not a decision); proposed PA wording (not effective until adopted); unlocks on adoption; still blocked after adoption.

### PA-01 — Source confirmation (companion §9.1)

**Pass-4 disposition (2026-10-29): PA DECISION REQUIRED — record conflict; not resolvable by IRR.** The designation record (`docs/integration/IIPS_v3.0_CAP03_PA_DESIGNATION_RECORD_PASS2_2026-10-28.md`, verification annotation items 1–4, `CV-CORR-178`) states that G4P-1, B-1, A-O3 and A-Q4 = YES were ruled. The rulings record lists A-Q4 as 'not ruled in this pass (remain open)' (`docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` §1 and §5). The packet rows carry 'RECOMMENDATION ONLY – NOT ADOPTED'. A-Q6 (item v) is recorded as cleared in rulings §8 (see PA-04). Items (i)–(iv) are not confirmed by any record in the repository and are not treated as confirmed here.

**Pass-6 disposition (2026-10-29): PARTLY RESOLVED — narrowed to what genuinely survives; the remainder is a specific record conflict, not a blocker.** (i) **B-1**: now decided by an express PA act (PA-08a, 2026-10-29), so reliance no longer rests on the designation record's statement of it. (ii) **A-O3**: moot for execution — the IPD act `0edadb2d` has run and the PA's round-5 ruling (rulings §8) records its designated-blob and basis effects; no qualification is drawn from the designation record. (iii) **A-Q4 = YES**: still not established by any authoritative ruling; it is PA-02, and it is not a P-1 prerequisite. (iv) **G4P-1**: not established; the Gate 4 pin is undesignated and is PA-09. IRR does not decide which record prevails. It records which decisions now rest on their own acts, and keeps the record discrepancy as a specific open documentary conflict (tracker §16.205).

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

**Pass-4 disposition: PA DECISION REQUIRED.** Re-verified: `521d5482` (`docs/integration/IIPS_v3.0_CAP03_S2_CANDIDATE_SCOPED_BASELINE_DISPOSITION_2026-10-26.md`, line 46) names exactly the two PR #96 paths as its change set. Rulings §1 and §5 still list A-Q4 as not ruled. No recorded PA act answers it. Not a P-1 prerequisite (PA-14 list); needed for the Matter A record.

**Pass-6 disposition (2026-10-29): PA DECISION REQUIRED — documentary only; not a P-1 prerequisite, not a gate.** Verified: `521d5482` line 46 names exactly the two PR #96 paths as its change set and disclaims being a qualification, acceptance, admission or implementation grant; rulings §1 and §5 record A-Q4 as not ruled; the packet recommendation (YES, citing `521d5482`) is **not adopted** and is not treated as a decision. Nothing in the current workflow turns on it: both paths are merged, no operation depends on them, and the reconciled `P1-F` list (PA-14) does not include it. It stays open as a Matter A record item.

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

**Pass-4 disposition: PA DECISION REQUIRED (sequencing ratification only).** The executed act is verified on IPD `main`: `0edadb2d` (IPD PR #107 merge, `2026-10-28T15:30:43Z`). The PA's round-5 ruling (rulings §8) records the designated-blob and basis effects and 'Matter A closed as to the act §7 closure test'. The express ratification of the sequencing deviation (act executed before A-Q4 was ruled) is not recorded as a PA act. The PA-04 clearance below rests on the round-5 ruling in §8, not on this ratification, which remains open as a documentary item.

**Pass-6 disposition (2026-10-29): EFFECTS RESOLVED; express sequencing ratification still a PA statement; no blocker.** The IPD act `0edadb2d` is executed and its effects are recorded by the PA's round-5 ruling (rulings §8; A-Q5 result record §2–§4), so nothing about the act's consequences is pending. What is not recorded is an express ratification of the sequencing deviation (the act was executed while A-Q4 was open). That ratification changes no gate, pin or P-1 condition. IRR records the deviation and does not infer ratification. No IPD write is made.

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

**Pass-4 disposition: RESOLVED by an existing recorded PA ruling.** Designated-blob limb CLEARED for items 10 and 12, and basis limb CLEARED under reading (ii), per rulings §8 (round-5 PA ruling) and the A-Q5 result record §3–§4 (`docs/integration/IIPS_v3.0_CAP03_IPD_A-Q5_RESULT_RECORD_2026-10-28.md`). The condition in rulings §4 (clearance only once A-Q5 is executed as a fresh designation act) is met by the executed act `0edadb2d`. Identity limb: PA-15. Host, Node, P-1 and V-A2 limbs remain gated and unverified. No other §8.2 limb is cleared by this disposition.

**Pass-6 disposition (2026-10-29): CLEARED LIMBS STAND CLEARED; host/operator element waived; other limbs unchanged.** The designated-blob and basis limbs rest on rulings §8 and the executed act `0edadb2d`. Under PA-20 the host-availability and operator-presence element of the §8.2 stop is **PA-WAIVED — NOT A BLOCKER**; the instrument's own runtime checks are unchanged and are not workflow blockers. The identity limb is PA-15. The P-1 and V-A2 limbs are properties of a P-1 run rather than evidence requirements, and are not cleared by the waiver. No other §8.2 limb is cleared.

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

**Pass-4 disposition: NOT A BLOCKER — no operation depends on it.** No record designates `aa43dec2`. The designation records (`PA_DESIGNATION_RECORD_PASS2_2026-10-28.md` §1–§3) name only `a891802e` and its blobs. The packet recommendation (not eligible) is not adopted. The PA may still decide eligibility; no P-1, S2 or Gate 4 step is affected.

**Pass-6 disposition (2026-10-29): unchanged — not a blocker; no operation depends on it.** The optional PA eligibility decision stands open and nothing in this pass depends on it.

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

**Pass-4 disposition: PA DECISION REQUIRED (sequencing and admission).** Facts: the native run `s2-a891802e-20261028T192516Z` is recorded at `2026-10-28T19:25:17Z`–`19:29:15Z` (S2-ACC-A1 §2(a)). Route (c) requires the designation act before the run (rulings §2). The designation record's pin designation (Designation A, §4.6 step 4) carries no timestamp in the repository, so the sequence cannot be checked from the repository. Under PA-19 no repeat run is needed. The PA decides option (a), (b) or (c) only.

**Pass-6 disposition (2026-10-29): still PA DECISION REQUIRED, and now the only sequencing question; no Windows evidence is involved.** Facts: the run at `a891802e` exists, is published and was independently verified (tracker §16.180); the repeat run (H-7) and the H-12 regeneration (H-9) are PA-WAIVED (PA-19); Windows/operator evidence is PA-WAIVED (PA-20). What remains is one PA determination: whether that run is admitted as L2a notwithstanding that the designation act (PA-08a, 2026-10-29) post-dates it. IRR does not admit it by assumption, and the waivers do not decide it. Adoption of PA-08a does not depend on it; reliance under formal §4.6 step 5 and the `P1-F` list do.

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
  - (b) Admit only `001c3c80` for candidate-scoped acceptance. Consequence: the existing run is not admitted as L2a or as the Gate 4 Limb A S2 result. Under PA-19 the repeat run is not a blocker (H-7 waived), so no repeat run is required. L2a at the designated commit is then established only if a later PA act so decides.
  - (c) Both: `001c3c80` for candidate-scoped acceptance (as stated in `8eee2957`); `a891802e` for L2a and Gate 4 Limb A only after the waiver in option (a). Consequence: each admitted result is stated with its scope.
- **IRR recommendation.** Option (c). Reason: S2-ACC-A1 already accepts the `a891802e` result at content level, and the run's executing identity equals the candidate pin. The sequencing deviation from route (c) must be waived expressly rather than assumed. If the PA declines the sequencing waiver, option (b) applies. Under PA-19 no repeat run is required as a blocker (H-7 waived).
- **Proposed PA wording.**
  > "PA-06: [Option a / b / c]. S2 admission basis for downstream reliance: [`a891802e` / `001c3c80` / both, scoped as follows]. The pre-designation sequence of the native run at `a891802e` [is / is not] waived for L2a and Gate 4 Limb A under rulings route (c). R-1 remains recorded as an open residual. H-2 is PA-WAIVED as a blocker (PA-19); the PASS stays user-reported as recorded, and this decision does not depend on the 47-entry output."
- **Unlocks on adoption.** L2a status; PA-08 step 5; PA-09 step 5.
- **Still blocked after adoption.** QE (0/11); Gate 4 execution; Gate 5 admission; `V1295`; production; S2 does not authorize P-1 (PA-14).

### PA-07 — Labels (Q-N1, Q-B5, and the PF-11 and Limb A collisions)

**Pass-4 disposition: PA DECISION (label-only; non-blocking).** No gate, operation or P-1 step depends on the labels. Not adopted in this pass.

**Pass-6 disposition (2026-10-29): NO ACTION REQUIRED; label-only.** No gate, decision, operation or P-1 step depends on the label scheme; labels used in this package are descriptive only. Nothing in this pass turns a label into a blocker or a precondition. The optional PA decision stands open.

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

**Pass-5 record status (2026-10-29).** All three are decided: **PA-08a = B-1**, **PA-08b = (ii)**, **PA-08c = (a)**. This text is their **prepared record** — not published, not authoritative until merged (tracker §16.204, `CV-CORR-184`). The pass-4 lines below are preserved verbatim as the record of that pass and are superseded as to status only.

**PA-08a — Which commit is the P-1 execution commit of record?**

**Pass-4 disposition: RESERVED PA DESIGNATION — technical finding recorded; conflict not resolved by IRR.** Verified on IPD source: `a891802e` (tree `76f083d7`) carries the receipt fields `executingCommit` / `executingTree` in `src/persistence/gateAPrimeProvisioning.ts` (blob `5f49936b`; lines 103–104, 123–124, 269–271). `001c3c80` (tree `399fa44a`) does not (blob `2cbce83f`; zero matches for `executingCommit`). The adopted receipt rule (PA-5 §5.1; DA-A1) requires each receipt to record the executing HEAD and tree, so `001c3c80` cannot meet that rule as an execution commit without a waiver. The conflict between ADP-D1 (rulings §6: `a891802e`) and DA-A1 step 0 (`001c3c80`) stays a reserved PA act (designation record annotation item 5). Formal §4.2 requires a separate PA designation act naming the commit, tree and blobs; it has not been given.

**Pass-5 PA ACT — ADOPTED (2026-10-29; `CV-CORR-184`; tracker §16.204): PA-08a = B-1.** The P-1 execution coordinate of record is `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (tree `76f083d7058e170d8212455c03bad1033136ee68`), purpose **P-1 execution coordinate**. `ADP-D1` (rulings §6, adopted) is **confirmed, not superseded**.

- **Authority.** The PA (Ramki; PA and sole user), on the standing direction to record the three linked PA-08 decisions. Scope: IIPS v3.0 CAP-03, non-production, single user. The adopted text is the wording recorded under **Adopted** below.
- **Identity (verified 2026-10-29 against the live IPD remote; no host evidence and no repeat run).** `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`, tree `76f083d7058e170d8212455c03bad1033136ee68`, committer `2026-10-28T05:48:27Z`, subject "Merge pull request #100"; ancestor of IPD `main`. Compared with `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a5f1953c0f61b452420fefb5985426ef1`) and `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c` (tree `76f083d7…`, the PR head, one commit before the merge).
- **Rationale.** `ADP-D1` already names this commit as the P-1 execution commit. It is the only candidate at which the adopted receipt can satisfy formal §4.6 step 6 without a waiver: `src/persistence/gateAPrimeProvisioning.ts` blob `5f49936b61efd07cc7b151d8f028f1020e48aee0` declares `executingCommit` / `executingTree`, measures the executing HEAD and tree from `--repo-root`, and refuses `EXECUTION_PIN_MISMATCH` before any connection is opened; blob `2cbce83f6572d211630ce0620dae49fa02fe4622` (at `001c3c80`) has no such fields. B-0 would therefore require waiving the adopted receipt element; B-1′ fails the merge-commit rule (an equal tree does not make two commits interchangeable).
- **Boundary — decision, designation and authorization are distinct.** This is a **decision** fixing the coordinate of record and its purpose. Under formal §4.6 step 4 a designation names commit, tree, blob identities and purpose; this act names commit, tree and purpose and therefore **does not complete** the §4.6 step 4 record by itself, because it names no per-path blob set. Blob identity, the step-4 record and steps 5–6 remain open (**B-DESIG**). Verified identities available to that record at `a891802e`: `5f49936b…` (`src/persistence/gateAPrimeProvisioning.ts`) and `df5d48a583c9aaed51af90a90225c15c408fbd33` (`src/persistence/gateAPrimeValidation.ts`).
- **Exclusions.** Does not authorize P-1 (`P1-F` unspent; no P-1 attempt). Does not admit the `a891802e` S2 run as L2a (PA-06). Does not adopt or regenerate H-12. Does not designate the Gate 4 QE/H-12 coordinate (PA-09). Does not establish P-1-C or P-1-D. Does not change any gate, acceptance, qualification, admission or capability status.

- **Evidence.**
  - `001c3c80`: DA-A1 (adoption record §2, line 20, adopted 2026-10-28, limited): the "act-designated pin" for successor act §8 step 0 and §8.2, candidate-scoped; "Acknowledgement is not a grant … Does not authorize P-1"; the authorization act "must name the execution commit explicitly". `521d5482` §5(b): `001c3c80` is "the coordinate at which P-1 of record would be executed".
  - `a891802e`: ADP-D1 (rulings §6, adopted, "conditional on the B-1 confirmation" per companion §4): "the P-1 execution commit is the designated B-1 commit `a891802e`". A-Q5 result record §2: designated basis `a891802e` (tree `76f083d7`). S2-ACC-A1: acceptance pin.
  - `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c`: D2 PR head (packet one-pass record, line 24), same tree `76f083d7`, ancestor of `a891802e`. Tree identity does not make commits interchangeable (the packet applies the same rule to B-Q3 for `a52b47b0`/`c62dee81`).
  - Formal §4.6: no pin is designated until a separate PA designation act names commit, tree and blobs, and the executing identity equals the designated pin.
- **Conflicting statements.** ADP-D1 (`a891802e`) vs DA-A1 step-0 reading (`001c3c80`) vs `521d5482` §5(b) (`001c3c80`). Also the S1 handoff and rulings §8 ("B-1 not effective").
- **Choices and consequences.**
  - (B-0) `001c3c80` as the P-1 execution commit. Consequence: DA-A1 receipt element (`executingCommit`) must be waived or deferred (packet B-Q2). ADP-D1 is superseded.
  - (B-1) `a891802e` (tree `76f083d7`). Consequence: ADP-D1 is confirmed; the designation act must name the commit, tree and blobs (formal §4.6 step 4); under PA-19 the repeat S2 run (H-7) and the H-12 regeneration (H-9) are not blockers. Reliance on the designation then depends on PA-06 (S2 admission) and, for any H-12 adoption, on T-3.
  - (B-1′) `f722d7d` (tree `76f083d7`). Consequence: the same tree, a different commit. The designation act must name one commit; `f722d7d` is the D2 PR head, `a891802e` is the commit on `main` where the A-Q5 act and S2 run are recorded. Not recommended without a stated reason.
  - (B-2) Defer. Consequence: P1-F and any P-1 step remain blocked.
- **IRR recommendation.** B-1 at `a891802e` (tree `76f083d7…`), per the packet's B-Q1 and ADP-D1. Reason: `a891802e` is the commit at which the designated basis is recorded (A-Q5 result §2), the S2 run and the acceptance are recorded there (PA-06), and the receipt element was accepted there (ADP-D2). This is a recommendation; it is effective only if the PA designates it under PA-08a and §4.6 step 4 is satisfied.
- **Proposed PA wording.**
  > "PA-08a: [B-0 / B-1 / B-1′ / B-2]. The P-1 execution commit of record is `[commit]` (tree `[tree]`). ADP-D1 is [confirmed / superseded] accordingly."
- **Adopted PA wording (2026-10-29).**
  > "PA-08a: B-1. The P-1 execution commit of record is `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (tree `76f083d7058e170d8212455c03bad1033136ee68`), purpose P-1 execution coordinate. ADP-D1 is confirmed accordingly. This does not authorize P-1."

**PA-08b — Step-0 pin (DA-A1) versus the execution commit.**

**Pass-4 disposition: CONDITIONAL on PA-08a.** Formal §4.2 states that the procedure's PF-08 expectation of `001c3c80` must be revised by a later procedure revision after the commit is designated. No revision is made in this pass.

**Pass-5 PA ACT — ADOPTED (2026-10-29; `CV-CORR-184`; tracker §16.204): PA-08b = (ii) distinct coordinate roles.** The DA-A1 step-0 coordinate is `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a5f1953c0f61b452420fefb5985426ef1`), purpose **successor act §8 step 0 and §8.2 (step-0)**. The P-1 execution coordinate is `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (tree `76f083d7058e170d8212455c03bad1033136ee68`, PA-08a), purpose **P-1 execution**. The two purposes are distinct and neither coordinate substitutes for the other. **The step-0 pin is not moved** to the P-1 execution commit, and **DA-A1 is not superseded** for this reading.

- **Authority and scope.** The PA (Ramki; PA and sole user), same act and scope as PA-08a. The adopted text is the wording recorded under **Adopted** below. The **IRR recommendation of option (i)** stated in this item is **not adopted**: it remains a recommendation of this package, and the adopted decision supersedes it. Its unstated cost is the reason recorded in the rationale below.
- **Rationale (verified, reused from the investigation; no new run).** The step-0 coordinate is the coordinate at which the capture procedure's step-0 source specification matches: procedure lines 413–415 pin `gateAPrimeProvisioning.ts` blob `2cbce83f6572d211630ce0620dae49fa02fe4622`, `provisioning.ts` `dc844189a1c92f00acc3d7572c22f3e28e138eb6`, `binding.ts` `96d0079dd04b75c6f257a2001c8f7eff1ffc560a`, and all three hold at `001c3c80`. At `a891802e` the first is `5f49936b…` (the same blob as at `f722d7d4`); the other two are unchanged. Moving the step-0 coordinate would therefore stale the step-0 specification and require a procedure restatement with new step-0 hashes (`V1157`), whereas the P-1 execution coordinate is the coordinate whose receipt measures its own executing identity (PA-08a). The distinctness is a property of the procedure and of the code, not a preference.
- **Procedure preserved.** No procedure revision is made by this act. The step-0 specification and its three pinned source blobs stand unchanged. Formal §4.2's note that the PF-08 expectation must be revised by a later procedure revision after a `C′` designation is not triggered by this act, because the step-0 coordinate does not move.
- **Exclusions.** Does not move, re-scope or retire the step-0 coordinate; does not revise the procedure; does not supersede DA-A1; does not authorize P-1 or any capture (E10 not rendered); does not designate the Gate 4 coordinate; no gate, pin, acceptance or admission status changes.

- **Question.** Are the DA-A1 "act-designated pin" (successor act §8 step 0 and §8.2) and the P-1 execution commit the same commit?
- **Evidence.** DA-A1 reads the act-designated pin as `001c3c80`. The A-Q5 result record names `a891802e` as the designated basis for the designated blobs. Rulings §8 treats the basis limb as cleared on constants versus the selected basis `5fc74085` / `7226ef00`, with the executing commit recorded through the D2 receipt (reading (ii)).
- **Choices and consequences.**
  - (i) Same commit as PA-08a. Consequence: DA-A1's step-0 reading is superseded by PA wording; the DA-A1 receipt rule is satisfied by the same identity.
  - (ii) Separate roles: step-0 pin `001c3c80`; execution commit per PA-08a. Consequence: two commits are recorded, each with its role stated.
  - (iii) Keep DA-A1 unchanged. Consequence: the conflict remains recorded.
- **IRR recommendation.** Option (i), stated as a supersession of DA-A1's step-0 reading. This is a recommendation; DA-A1 is an adopted decision and only the PA may supersede it.
- **Proposed PA wording.**
  > "PA-08b: [i / ii / iii]. The act-designated pin for successor act §8 step 0 and §8.2 is `[commit]`. DA-A1 is [superseded for this reading / unchanged]."
- **Adopted PA wording (2026-10-29).**
  > "PA-08b: (ii). The act-designated pin for successor act §8 step 0 and §8.2 is `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a5f1953c0f61b452420fefb5985426ef1`). The P-1 execution coordinate is separate, per PA-08a. DA-A1 is unchanged; the step-0 pin is not moved."

**PA-08c — Scope of "final execution commit" (DA-A1 open item D1).**

**Pass-4 disposition: CONDITIONAL on PA-08a.** ADP-D1 (rulings §6) scopes the adopted wording to the P-1 execution commit and limits manifest regeneration to 'where Gate 4 §8 applies'. On its face that matches option (a). DA-A1 D1 is recorded as 'not resolved by this record' (adoption record §3). The PA confirms option (a) together with PA-08a.

**Pass-5 PA ACT — ADOPTED (2026-10-29; `CV-CORR-184`; tracker §16.204): PA-08c = (a) P-1 only.** The phrase "final execution commit" governs the **P-1 execution chain only**. The Gate 4 §8 H-12/QE coordinate remains a **separate PA-09 (G4-PIN) matter**: it is not selected, not narrowed, not pre-empted and not aligned to `a891802e` by this act.

- **Authority and scope.** The PA (Ramki; PA and sole user), same act and scope as PA-08a. The adopted text is the wording recorded under **Adopted** below.
- **Rationale.** The determination (§7) fixes the term only when the sequence runs, so the term is sequence-specific and is not a shareable designation; `ADP-D1` clause 2 limits manifest regeneration to "where Gate 4 §8 applies"; `PA-1` (formal §3.1, ADOPTED) holds that H-12 adoption is not a P-1 prerequisite and places S2a before S3 and QE only; the adopted `PA-2` model keeps purpose-specific coordinates (L0 basis, L1 executing, L2a P-1 execution, L2c Gate 4 QE/H-12). Option (b) would perform the §4.5 C-1 scope acceptance — treating the non-Limb-A content at `a891802e` as in-scope for Gate 4 QE — which is not this act's to make and would pre-empt PA-09.
- **Closes.** DA-A1 open item `D1` (adoption record §3) as to scope: the term is disposed of for the P-1 chain and no longer open for that question.
- **Exclusions (express).** This disposition does **not** select a Gate 4 coordinate; does **not** adopt H-12 (no regenerated artifact exists, T-3); does **not** authorize P-1; does **not** start Gate 4 execution; does **not** establish P-1-C or P-1-D; does **not** admit Gate 5. `PA-09` remains open, `G4-PIN` remains undesignated, and the Gate 4 §8 coordinate is unaffected.

- **Question.** Does the determination's "final execution commit" (§7; DA-A1 D1) apply to P-1 only, or to the QE and Gate 4 chain as well?
- **Evidence.** Adoption record §3 D1: "not resolved by this record". ADP-D1 is worded for P-1 only. Gate 4 pin is G4-PIN (PA-09).
- **Choices and consequences.** (a) P-1 only. (b) P-1 and Gate 4 QE/H-12. (c) Defer.
- **IRR recommendation.** Option (a), consistent with ADP-D1. The Gate 4 pin is decided separately by PA-09.
- **Proposed PA wording.**
  > "PA-08c: [P-1 only / P-1 and Gate 4 / deferred]."
- **Adopted PA wording (2026-10-29).**
  > "PA-08c: P-1 only. The determination's 'final execution commit' governs the P-1 execution chain only. The Gate 4 §8 H-12/QE coordinate remains a separate PA-09 matter and is not designated, adopted or aligned by this disposition."

**PA-08 unlocks on adoption.** The designation act for the P-1 coordinate (B-DESIG step 4). Designation is not effective for reliance until steps 5 and 6 of formal §4.6 are satisfied.

**PA-08 still blocked after adoption.** L2a admission (PA-06); the formal §4.6 step 4 blob record and steps 5–6; H-12 adoption at the designated commit (PA-10b, T-3); P1-F (PA-14); P-1 execution and the attempt observations (PA-13; T-2 is PA-WAIVED — NOT A BLOCKER under PA-20 and is not a blocker here). The repeat S2 run (H-7) and the H-12 regeneration (H-9) are not blockers under PA-19.

**Pass-5 effect (2026-10-29).** PA-08a, PA-08b and PA-08c are **ADOPTED** (B-1; (ii); (a)); `ADP-D1` is confirmed and the step-0 coordinate is preserved. That adoption is a **decision act** and nothing more. Still open and unchanged: the formal §4.6 step 4 record for the blob set and steps 5–6 (**B-DESIG**); L2a admission (PA-06); H-12 adoption (PA-10b, T-3); `P1-F` (PA-14); P-1 execution (PA-13). The attempt observations (**T-2**) and native Windows execution (**T-4**) are PA-WAIVED — NOT A BLOCKER (PA-20) and are not conditions of any step. The Gate 4 QE/H-12 coordinate remains **undesignated** (PA-09; §4.5 C-1/C-2/C-3 unchosen). **P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**

### PA-09 — G4-PIN: Gate 4 QE and H-12 content pin

**Pass-4 disposition: PA DECISION REQUIRED (Gate 4 chain).** Depends on PA-01 (i). Under PA-1 (formal §3.1, ADOPTED) and formal §4.2, H-12 adoption and the QE/H-12 pin are not preconditions of P-1 provisioning. The packet's P1-F list still names L2c (PA-10a); that is designation evidence, and H-9 is PA-WAIVED (PA-19). No Gate 4 designation is made in this pass.

**Pass-6 disposition (2026-10-29): UNCHANGED — the Gate 4 pin remains undesignated.** PA-08c scopes "final execution commit" to the P-1 chain and does not select, align or narrow the Gate 4 §8 coordinate. Formal §4.5 C-1/C-2/C-3 remain unchosen and formal §4.6 step 4 is unsatisfied for L2c. H-12 remains unadopted and no baseline is effective. Gate 4 stays AUTHORIZED — NOT STARTED. PA-20 waives no Gate 4 decision.

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

- **PA-10a — H-12 regeneration at the designated commit (L2c).** Question: direct H-12 regeneration with full validation at the commit designated under PA-08a or PA-09. Status under PA-19: H-9 is PA-WAIVED as a blocker; regeneration remains the technical prerequisite T-3 for H-12 adoption (PA-10b) only. Evidence: formal §4.6 step 5; rulings §6 B-Q4 (H-12 regeneration gates L2a); tracker: "H-12 at `a891802e` (L2c) NOT ADOPTED AT THIS PIN; not started". Options: (a) direct regeneration at the designated commit; (b) defer. Recommendation: (a), at the commit chosen under PA-08a/PA-09. Proposed wording: "PA-10a: [direct / defer] H-12 regeneration with full validation at `[commit]`."
  - **Pass-4 disposition: NOT ADVANCED in this pass.** Its own path (L2c, Gate 4 QE/H-12 content) is gated by PA-09 and is not a P-1 prerequisite (PA-10c). No direction in this pass requires it. No regeneration was started and no artifact was produced. Nothing here is recorded as performed.

  - **Pass-6 disposition (2026-10-29): NOT ADVANCED; trigger absent.** H-12 regeneration serves the Gate 4 chain (L2c) and is not a P-1 prerequisite (adopted PA-1). H-9 is PA-WAIVED as a blocker (PA-19). No regeneration was run and no artifact is claimed.
- **PA-10b — H-12 adoption at that pin (S2a).** Question: adopt H-12 at the regenerated pin. Evidence: tracker §16.177.3 (R5 adoption effective only at its own pins `8eec74ae…` / `ba64b2d5…`); S2a "NOT ADOPTED" (companion §4). Options: (a) adopt after PA-10a; (b) defer. Recommendation: (a) only after PA-10a evidence exists. Proposed wording: "PA-10b: [adopt / defer] H-12 at `[commit]`, regenerated under PA-10a. This adoption is effective only at its own pins."
  - **Pass-4 disposition: DEFERRED.** Depends on PA-10a and on T-3 (regenerated H-12 artifact at the pin). Not a P-1 prerequisite. Not advanced in this pass.

  - **Pass-6 disposition (2026-10-29): DEFERRED; trigger absent.** Depends on PA-10a evidence and on **T-3**, which survives because it is an artifact requirement of the adoption itself, not a Windows/operator evidence requirement. Not a P-1 prerequisite.
- **PA-10c — Is H-12 adoption (S2a) a P-1 prerequisite?** Question: Formal PA-1 (§3.1, adopted): "H-12 adoption is not a prerequisite for P-1 provisioning". The packet's P1-F blocker list (row P1-F) and companion §4 sequence both list S2a before P1-F. Choices: (a) Follow PA-1: S2a is not a P1-F prerequisite; S2a is required before S3 and QE (Gate 4 §6). (b) S2a is a P1-F prerequisite as the packet and companion list. Recommendation: (a), because PA-1 is adopted and specifically addresses P-1 provisioning. Proposed wording: "PA-10c: [a / b]. For P1-F, H-12 adoption (S2a) is [not a prerequisite / a prerequisite]."
  - **Pass-4 disposition: RESOLVED by existing authority.** Formal PA-1 §3.1 (ADOPTED; formal table row PA-1) states that H-12 adoption is not a prerequisite for P-1 provisioning. S2a is therefore not a P1-F prerequisite. S2a remains required before S3 and QE (formal §3.1 consequence). The DQ-4 freeze sequence (tracker §16.122.9(b)) lists H-12 adoption before the P-1 step. That is a freeze-level sequence and is not changed here; the PA-1 interpretation governs P-1 authority.
- **Unlocks.** PA-10a enables L2c; PA-10b enables S2a; PA-10c fixes P1-F's list.
- **Still blocked after adoption.** S3 and QE (need S1 and S2a complete per Gate 4 §6); Gate 4 execution.

### PA-11 — D-INST: adoption of the successor D-2 instrument identity (DB-B1)

**Pass-4 disposition: PA DECISION REQUIRED.** No adoption record exists for the candidate identity. DA-A1 and DB-B1 cover only the current v2 identity `191f5828` (adoption record §2). Not adopted here. No parse, run or A6 performed, so T-1 is not triggered. Conditional prerequisite: the ruled method D-2 and PF10 KEEP cannot be used until a successor identity is adopted (rulings §6). If the PA declines, Matter D reverts to D-1 (packet option (b)).

**Pass-6 disposition (2026-10-29): CONDITIONAL; no action taken.** No adoption record exists for a successor D-2 identity, so the trigger has not occurred and no speculative work is done. **T-1** survives for that path only (parse-and-run validation before first use) and is not triggered. The current v2 identity `191f5828` and DA-A1/DB-B1 are unchanged.

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

**Pass-4 disposition: RESOLVED (authority route) by recorded rulings.** C-Q1 = YES (A6 reads the designated blob by hash and is commit-independent). C-Q2 = MC-2 (rulings §6): host qualification proceeds under its own operator authorization, and commit-keyed observations stay in the attempt session. The statement in rulings §7 that the record does not authorize A6 is about that record only and is not contrary to MC-2. Successor A6 is required before any successor use (T-1, conditional on PA-11). A6 has not been run and is not performed here. *[Corrected 2026-10-29, PA-20: the operator's host is no longer a reason — host availability and operator presence are PA-WAIVED — NOT A BLOCKER. The fact that A6 has not been run is unchanged.]*

**Pass-6 disposition (2026-10-29): AUTHORITY ROUTE STANDS; A6 NOT RUN.** C-Q1 (YES, blob-keyed) and C-Q2 (MC-2, operator authorization) stand as recorded. Under PA-20, host availability and operator presence are not blockers; that does **not** assert that A6 ran — it did not, and no A6 result is recorded. T-1 applies only to a successor instrument (PA-11).

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

- **Unlocks on adoption.** A6 run (H-4; PA-WAIVED as blocker, PA-19). T-1 applies before any successor use.
- **Still blocked after adoption.** Capture (PA-13); P-1; any commit-keyed observation (MC-2 limits these to the attempt session).

### PA-13 — E10: capture-authorization act for P-1-C and P-1-D

**Pass-4 disposition: NOT RENDERED (PA drafts).** Prerequisite status: E3 applied (procedure revision 2026-10-28d); E8 root and parent recorded (rulings §7). The instrument-identity choice is open (PA-11, if D-2 is used). The choice between option (a) (v2 `191f5828`) and option (b) (successor identity) is a PA decision and is not made here. This is not P-1 authorization.

**Pass-6 disposition (2026-10-29): NOT RENDERED; operator presence is no longer a reason.** E10 remains a PA drafting act: it names the host, session, root, identity, pins and window, and it is not P-1 authorization. PA-20 removes Windows-host availability and operator presence from any reason not to render it; it does not render it. E3 is applied (`2026-10-28d`) and the E8 root and parent are recorded (rulings §7).

- **Question.** Render the capture-authorization act (E10) naming host, session, root, identity, pins, window and operator. Render now, or after PA-11 and PA-12?
- **Evidence.** Companion §4: E10 "NOT RENDERED (PA drafts it)". Packet E10: "PA drafts the capture-authorization act only after E3 and the listed rulings. This is not P-1 authorization." Session package §5.6: a capture does not spend the attempt, does not satisfy P-1-C or P-1-D, and does not authorize provisioning (procedure line 435). Procedure `2026-10-28d` (E3 applied; rulings §7). Root and parent ruled (E8).
- **Choices and consequences.**
  - (a) Render E10 now, naming the current v2 identity `191f5828`. Consequence: Matter D's D-2 is not satisfied; capture uses D-1 only.
  - (b) Render E10 after PA-11 and PA-12, naming the successor identity. Consequence: capture waits; D-2 is available.
  - (c) Defer. Consequence: P-1-C and P-1-D cannot start.
- **IRR recommendation.** Option (b), because D-Q (D-2) and PF10 (KEEP) are ruled and require the successor. This is a recommendation.
- **Proposed PA wording.**
  > "PA-13: [a / b / c]. E10 capture authorization: host `[ ]`, session `[ ]`, root `D:\cap03-p1-capture-20261028-01`, parent `D:`, identity `[ ]`, pins `[ ]`, window `[ ]`, operator `[ ]`. This is not P-1 authorization and does not satisfy P-1-C or P-1-D."
- **Unlocks on adoption.** The attempt session may run P-1-C capture and P-1-D verification (H-8; PA-WAIVED as blocker, PA-19). Those observations remain the technical prerequisite T-2 for P1-F *[superseded as to status by PA-20 (2026-10-29): T-2 is PA-WAIVED — NOT A BLOCKER; the observations still do not exist and are not claimed]*. The waiver cannot establish them.
- **Still blocked after adoption.** P-1 execution; P1-F (PA-14); S3; QE.

### PA-14 — P-1 authorization act (P1-F): prerequisites only in this sitting

**Pass-4 disposition: P-1 NOT AUTHORIZED. No P1-F act rendered. No P-1 attempt performed, and none is executable from this environment (T-4).** *[Correction, PA-20, 2026-10-29: the T-4 element is superseded — native Windows execution is PA-WAIVED — NOT A BLOCKER. The reason no attempt occurred is that the `P1-F` act is not rendered, not the environment.]* Status after this pass: S2a is not a prerequisite (PA-10c). ADP-D2 is accepted (unchanged). A-GAP1 is ruled. A-Q5 is executed (`0edadb2d`). A-Q6 is partly cleared (PA-04). Still open: PA-01, PA-08a and PA-08b (commit of record and step-0 pin); PA-06 (admission of the native run); PA-15 (identity reading); PA-13 (E10); and the P-1-C and P-1-D observations (T-2, requiring T-4). See tracker §16.203.

**Pass-6 disposition (2026-10-29): P-1 REMAINS NOT AUTHORIZED; prerequisite list reconciled.** No `P1-F` act is rendered and no P-1 attempt occurred. Under PA-20 the attempt observations (**T-2**) and native Windows execution (**T-4**) are **PA-WAIVED — NOT A BLOCKER** and are removed from this list; under adopted PA-1 and PA-10c, L2c and S2a are not P-1 prerequisites. The reconciled list is therefore: **PA-08a** (adopted 2026-10-29), the formal **§4.6 step 4 blob record** and steps 5–6 for reliance, **PA-06** (L2a admission), **PA-15**, **PA-03/PA-04**, and **PA-13** (E10) — followed by the `P1-F` act itself, which this package does not render.

**Pass-5 pointer (2026-10-29).** PA-08a and PA-08b are now adopted (§3 PA-08; B-1 and distinct coordinate roles). The prerequisite list above is otherwise unchanged: PA-01, PA-06, PA-15, PA-13 remain open, the §4.6 step 4 blob record and steps 5–6 remain, and **P-1 remains NOT AUTHORIZED**. *[Superseded as to T-2 and T-4 by PA-20 (2026-10-29): both are PA-WAIVED — NOT A BLOCKER.]*

- **Question.** This sitting does not authorize P-1. The PA decides only whether the prerequisites in the list below are complete when the P1-F act is later rendered. No P1-F act is decided here.
- **Evidence.** Packet P1-F row: "Blocked by P1-C, P1-D, B-DESIG, L2a, L2c, ADP-D1, ADP-D2, A-GAP1, S2a." Formal §4.6 and PA-5 (P-1-F: "Render only after PA-5 path and C′ designation"). Companion §4: "P-1 remains NOT AUTHORIZED until P1-F is rendered."
- **Prerequisite status (verified against the records above).**

| Prerequisite | Status | Decision or evidence needed |
|---|---|---|
| P1-C (capture) | NOT ESTABLISHED (not performed) | PA-13. H-8 PA-WAIVED as blocker (PA-19); **T-2 PA-WAIVED — NOT A BLOCKER (PA-20)** |
| P1-D (verification) | NOT VERIFIED FOR THE ATTEMPT (not performed) | H-8 PA-WAIVED as blocker (PA-19); **T-2 PA-WAIVED — NOT A BLOCKER (PA-20)** |
| B-DESIG (designation act) | NOT DONE | PA-08a, PA-09 (step 4) |
| L2a (fresh S2 at designated commit) | Run recorded at `a891802e`; admission open | PA-06. H-7 repeat run PA-WAIVED as blocker (PA-19) |
| L2c (H-12 at designated commit) | NOT EVIDENCED | PA-10a. H-9 regeneration PA-WAIVED as blocker (PA-19); T-3 applies to adoption |
| ADP-D1 (P-1 commit definition) | Adopted, conditional on B-1 | PA-08a |
| ADP-D2 (receipt element) | ACCEPTED at `a891802e` (receipt element only) | None |
| A-GAP1 (act row S1 governs) | RULED | None (subject to PA-15 for identity values) |
| S2a (H-12 adoption) | NOT ADOPTED; P-1 relevance open | PA-10b, PA-10c |
| Source confirmation | OPEN | PA-01 |
| A-Q5 / A-Q6 | OPEN / CONDITIONAL | PA-03, PA-04 |
| Identity values (successor act §4 / §5.2) | CONFLICTING | PA-15 |

- **IRR recommendation.** No recommendation on P1-F in this sitting. Schedule the P1-F act only after every listed prerequisite is complete and recorded. The sitting should record the prerequisite list as the agreed order.
- **Proposed PA wording.**
  > "PA-14: The Program Authority notes the prerequisite list in this package. No P-1 authorization is given by this decision. P-1 remains NOT AUTHORIZED. The P1-F act will be rendered only after the listed prerequisites are recorded, and will name the execution commit, tree and blobs."
- **Unlocks on adoption.** Nothing. This is a sequencing acknowledgement.
- **Still blocked after adoption.** Everything in the P-1 chain.

### PA-15 — Identity values for successor act §4 / §5.2 (the S1 identity limb)

**Pass-4 disposition: FACTS VERIFIED; READING REQUIRES A PA DECISION.** `PRINCIPAL_LABEL` = `'ramki-personal-local'`, `TENANT_ID` = `'ipd-personal-local'` and `CANONICAL_OWNER_ID` = `'ipd-owner-ramki-personal'` are set (non-null) in `src/persistence/gateAPrimeValidation.ts` (blob `df5d48a5`, identical at IPD `f9ec0c5` and `a891802e`), verified through the IPD API in this pass. The statement 'identity values remain unresolved' (rulings §8) and act row S1 ('BLOCKED — identity values unresolved', which governs S1 under A-GAP1) therefore describe the values' status inconsistently with the constants. The PA decides whether the identity limb is cleared and whether row S1 is updated (by an IPD pointer; IPD-owned). IRR does not change row S1.

**Pass-6 disposition (2026-10-29): FACTS VERIFIED AND NOT HOST-DEPENDENT; THE READING IS STILL A PA DETERMINATION.** The constants are established from repository objects (blob `df5d48a5`), so no host or operator evidence is involved, and PA-20 does not bear on the question. What remains is whether the identity limb is cleared and whether act row S1 (IPD-owned) is updated. IRR does not clear it, does not change row S1, and does not treat the constants as an adopted interpretation.

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

**Pass-4 disposition: NO ACTION TAKEN; status quo retained.** The Option C deferral remains the recorded state (tracker §11, §16.112). REG-11 is not closed. No P-1, S2, gate or capture step depends on it. The optional PA decision remains open.

**Pass-6 disposition (2026-10-29): no change.** REG-11 remains deferred under Option C; nothing in this pass depends on it.

- **Question.** Only if the PA wishes: retain Option C deferral (no action), formally close it, or reopen it.
- **Evidence.** Tracker §11 (Option C, 2026-10-13); register row BLOCKED / DEFERRED; §16.116 "closure" text was never recorded (pointer annotated §16.199); R1/R2 effective per §16.112 (companion §7).
- **Choices.** (a) No action (retain Option C). (b) Formal closure act. (c) Reopen.
- **IRR recommendation.** (a); no governing requirement forces an action.
- **Proposed PA wording.**
  > "PA-16: [retain Option C deferral / close / reopen]. REG-11 status: [ ]."
- **Unlocks / blocked.** No downstream step depends on REG-11.

### PA-17 — REG-12: Company Identity Authority (mapping blocker)

**Pass-4 disposition: PA DECISION REQUIRED (non-blocking for P-1).** No authoritative disposition exists (CV-43 / D115). Gate 4 host qualification, result acceptance, Gate 5, durable enablement and any `503` change remain not granted regardless.

**Pass-6 disposition (2026-10-29): NO DISPOSITION EXISTS; the mapping blocker remains; not a P-1 prerequisite and not a gate.** CV-43 / D115 record that no Company Identity Authority is designated and that re-entry requires an express act; nothing in the present records supersedes that. Gate 4 host qualification, result acceptance, Gate 5, durable enablement and any `503` change remain not granted regardless. No action taken; the decision stands open.

- **Question.** For the mapping blocker (`companyId` ↔ `ISIN` ↔ G24 ticker), designate a Company Identity Authority by express act naming the bounded domain, source and consumer, or expressly decline designation.
- **Evidence.** Bounded Gate 3 scope `IMPLEMENTED & ACCEPTED` (tracker §16.77). PA decision 2026-10-24 (CV-43 / D115): no Company Identity Authority designated; re-entry requires an express act. Tracker §16.199 table row 6: BLOCKED — owner decision.
- **Choices.** (a) Designate a Company Identity Authority, naming domain, source and consumer. (b) Decline designation; the bounded Gate 3 scope stays the only accepted scope.
- **IRR recommendation.** None. No authoritative decision supplies a disposition.
- **Proposed PA wording.**
  > "PA-17: [designate: Company Identity Authority `[ ]`, domain `[ ]`, source `[ ]`, consumer `[ ]` / decline designation]."
- **Unlocks / blocked.** Gate 4 host qualification, result acceptance, Gate 5, runtime enablement, `durable:true` and any `503` lift remain not granted regardless of this decision.

### PA-18 — L2b: is any action required?

**Pass-4 disposition: NO TRIGGER FOUND; non-blocking.** Formal §4.2 lists L2b as 'Designated, not established (§16.122.9)'. Tracker §16.122.9 gives no L2b action or trigger. The P1-F list in PA-14 does not include L2b. No action is recorded. Any PA L2b decision remains open and is not needed for P-1.

**Pass-6 disposition (2026-10-29): NO TRIGGER FOUND; unchanged.** L2b has no action or trigger in tracker §16.122.9, the `P1-F` list does not include it, and no operation requires it. Open only if the PA wishes.

- **Question.** Is any L2b action (CAP-03 / Path A DR-track QE, §16.122.7) required, and if so, what is its scope?
- **Evidence.** Formal record line 102: L2b "Designated, not established (§16.122.9)". Addendum row L2B: "not yet eligible; PA (only if required)". Packet row L2B: "No recommendation: the register holds no basis for IRR to say whether an L2b action is required."
- **Choices.** (a) No action required (close). (b) Action required; scope stated by the PA.
- **IRR recommendation.** None; the register holds no basis for one.
- **Proposed PA wording.**
  > "PA-18: [no action required / action required, scope: `[ ]`]."

---

### PA-19 — Waiver of H-1 to H-9 as blockers (PA ruling; EFFECTIVE on recording)

- **Decision.** PA ruling by the Program Authority (Ramki), sole user and PA of the personal application. Effective on recording (2026-10-29). This item only; PA-01 to PA-18 are not decided by it.
- **Authority and scope.** The PA's express direction of 2026-10-29 (the directive is the authority). Scope: IIPS v3.0 CAP-03; non-production; single-user; governance, documentary and workflow blockers only.
- **Question.** Are the items H-1 to H-9 (§5) blockers?
- **Ruling.** H-1 to H-9 are **PA-WAIVED — NOT A BLOCKER**.
- **Rationale (as stated by the PA).** The evidence was previously transferred, is held outside the repository, has a disputed deposit copy, or would require another operator transfer or repeat run to reproduce. None of these is a blocker under this ruling.
- **Records checked before recording (not re-investigated).** H-1: deposit on `main` (PR #366, `078e50cb`; tracker §16.194). H-2: absent from the repository. H-3: integrity note recorded. H-4 to H-9: not performed, as recorded.
- **Exact effect.**
  1. H-1 to H-9 are classified PA-WAIVED — NOT A BLOCKER in §3, §4, §5, §6, §7 of this package and in tracker §16.202, and in the dated pointers listed there.
  2. They are removed from blocker counts, stop conditions and dependency chains where they appear solely as evidence or governance requirements covered by this ruling.
  3. The repeat S2 run (H-7) and the H-12 regeneration (H-9) are not required as governance blockers for L2a and L2c sequencing. Their admission and adoption questions remain PA-06 and PA-10b.
  4. S2-DEP-A is recorded as complete per tracker §16.194. No further transfer is initiated.
- **What PA-19 does not do.**
  - It does not establish any fact that was not established before: no P-1-C or P-1-D observation, A6 result, root existence, H-12 artifact, L2a or L2c status, PASS, digest match or identity value.
  - It does not decide PA-01 to PA-18, and does not change any option under PA-06 or PA-08.
  - It does not authorize any operation: capture, A6, host action, PowerShell, P-1, QE, Gate 4 execution, Gate 5, S3, DQ-4 freeze, production, durable write, `503` lift or IPD write.
  - It does not change any gate, pin, acceptance, qualification, admission, authorization or capability status. P-1 remains NOT AUTHORIZED; QE 0/11; Gate 4 AUTHORIZED — NOT STARTED; Gate 5 NOT INITIATED / NOT ADMITTED.
  - It does not waive any technical prerequisite. The surviving prerequisites are T-1, T-2 and T-3 (§5.2) and no others.
- **Unlocks on recording.** The removal of H-1 to H-9 as blockers in the statements listed in tracker §16.202.
- **Still open after recording.** PA-01 to PA-18 (PROPOSED — NOT ADOPTED), and the surviving technical prerequisites T-1 to T-4 for the operations they name.

---

### PA-20 — Standing waiver of Windows-host, operator-presence and Windows-generated evidence requirements (PA ruling; EFFECTIVE on recording)

- **Decision.** PA ruling by the Program Authority (Ramki), sole user and PA of the personal application. Effective on recording (2026-10-29). It applies project-wide and is not limited to CAP-03 records.
- **Authority and scope.** The PA's standing project-wide direction of 2026-10-29. Scope: IIPS v3.0, non-production, single-user; governance, documentary, workflow and prerequisite requirements that are Windows-host, operator-presence or Windows/operator-generated-evidence requirements.
- **Ruling.** Such requirements are **PA-WAIVED — NOT A BLOCKER**.
- **Exact effect.**
  1. **T-2** and **T-4** (§5.2) are **PA-WAIVED — NOT A BLOCKER**, and are removed from blocker counts, stop conditions, prerequisite lists and dependency descriptions here, in §4 and §5, and in tracker §16.203, §16.204 and §16.205 and the dated pointers recorded there.
  2. H-4 and H-8 (§5) carry no surviving prerequisite on this ground; the H-8 cell is **None**.
  3. The host-availability and operator-presence element of the §8.2 stop referred to in PA-04, and the executability statements in PA-13, PA-14 and the §4.1 sequence, are waived on this ground.
  4. **No blocker identifier is introduced by this ruling.** An identifier that would merely rename T-2 or T-4 must not be created, and no waived requirement may be reintroduced through another act, gate, decision record or report.
  5. The sentence in PA-19 (§3) "the surviving prerequisites are T-1, T-2 and T-3 (§5.2) and no others" is **superseded as to T-2 only**. PA-19's other text is unchanged and H-1 to H-9 remain PA-WAIVED — NOT A BLOCKER.
- **What PA-20 does not do.**
  - It does not assert that any operation ran, that a capture or verification occurred, that A6 ran, or that any evidence exists. P-1-C remains **NOT ESTABLISHED**; P-1-D remains **NOT VERIFIED FOR THE ATTEMPT**; no P-1 attempt is recorded.
  - It does not authorize P-1, a capture, E10, A6, QE, Gate 4 execution, Gate 5 admission, S3, DQ-4 freeze, production, a durable write, a `503` lift or an IPD write.
  - It does not decide PA-01 to PA-18, does not complete the formal §4.6 step 4 designation, and does not satisfy §4.6 steps 5–6.
  - It does not waive a genuine independent authorization requirement, an unresolved conflict between authoritative records, a functional defect or an integrity issue. Those are stated per item in §3 and in tracker §16.205.
- **Unlocks on recording.** The removal of T-2, T-4 and the equivalent Windows/operator statements as blockers wherever they appear, including the `P1-F` prerequisite list reconciled in PA-14.
- **Still open after recording.** PA-01 to PA-18 as recorded per item (adopted, resolved, conditional, conflict or PA decision), and the surviving technical prerequisites **T-1** and **T-3** for the operations they name.

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
12. PA-12 (A6 authorization and sequence). The A6 run (H-4) is PA-WAIVED as a blocker (PA-19); T-1 applies before successor use.
13. PA-13 (E10). Depends on PA-11 (if option b) and PA-12. The root check (H-6) is PA-WAIVED as a blocker; the procedure's runtime check applies.
14. Attempt session: P-1-C capture and P-1-D verification under E10 (H-8 PA-WAIVED as a blocker, PA-19; T-2 PA-WAIVED — NOT A BLOCKER, PA-20; no Windows host or operator presence is a blocker).

Stage 5 (P-1 authorization):
15. PA-14 prerequisite check, then the P1-F act (not in this sitting). Requires PA-08a (adopted 2026-10-29), the formal §4.6 step 4 blob record, PA-06 (L2a admission), PA-15, PA-03/PA-04 and PA-13 (E10). L2c and S2a are not P-1 prerequisites (PA-1 / PA-10c). The attempt observations (T-2) and native Windows execution (T-4) are PA-WAIVED — NOT A BLOCKER (PA-20) and are not conditions of the act.

Stage 6 (after P-1 — out of scope for this sitting): S3, QE-1 to QE-11, Gate 4 execution and result acceptance, DQ-4 freeze, Gate 5 admission. Each has its own authority and is not decided here.

**Pass-5 note (2026-10-29).** PA-08a, PA-08b and PA-08c were adopted out of the order shown above (PA-06 remains open). The ordering is preserved unchanged: it records the dependency analysis, not the sequence taken. Adoption of PA-08a does not admit the `a891802e` S2 run as L2a (PA-06) and does not authorize P-1 (PA-14).

### 4.2 What adoption does not authorize

| Adopted decision | Does not authorize |
|---|---|
| PA-01 confirmations | Any P-1, capture, A6, host action or Gate 4 execution |
| PA-02 (A-Q4) | Any IPD change; any acceptance or admission of evidence |
| PA-03 (A-Q5 ratification) | Changes to the compiled basis constants; S1 execution |
| PA-04 (A-Q6) | Host, Node, P-1 or V-A2 limbs; any execution |
| PA-06 (S2 admission) | QE; Gate 4 execution; Gate 5; `V1295`; production |
| PA-08 (P-1 commit) | P-1 execution; L2a or L2c being satisfied (they need their own evidence). **Adopted 2026-10-29 as PA-08a (B-1), PA-08b (ii) and PA-08c (a): also does not select a Gate 4 coordinate, adopt H-12, start Gate 4 execution, establish P-1-C or P-1-D, admit Gate 5, or move the step-0 coordinate.** |
| PA-09 (G4-PIN) | Gate 4 execution; QE; result acceptance |
| PA-10b (H-12 adoption) | Anything beyond its own pins; QE |
| PA-11 (D-INST) | Any run of the instrument; A6; capture |
| PA-12 (A6) | Capture; P-1; any commit-keyed observation beyond the attempt session |
| PA-13 (E10) | P-1 authorization (E10 is not P-1 authorization) |
| PA-14 (prerequisite list) | P-1 |
| PA-17 (REG-12) | Gate 4 host qualification; Gate 5; `durable:true`; `503` lift |
| PA-19 (waiver of H-1 to H-9 as blockers) | Any capture, A6 run, host operation, P-1 step, successor use, repeat run, or any established fact (for example P-1-C, L2a or L2c). It does not decide PA-01 to PA-18. |
| PA-20 (waiver of Windows/operator evidence as blockers) | Any execution; any established fact (P-1-C, P-1-D, A6 result, H-12 artifact); any authorization; any Gate 4, QE or Gate 5 decision; the formal §4.6 steps 4–6 |

---

## 5. Operator and host evidence (H-1 to H-10; PA-19 status)

Items H-1 to H-9 are **PA-WAIVED — NOT A BLOCKER** under PA-19 (§3). The "Record state" column states what the records show; PA-19 does not change it. Nothing in this section is a PA decision.

| ID | Evidence or action | Record state (unchanged by PA-19) | PA-19 status | Surviving technical prerequisite |
|---|---|---|---|---|
| H-1 | S2 host originals and deposit: 16 sealed artifacts, seal `SHA256SUMS.txt`, `MANIFEST.json`, seal-recheck, deposit hashes; operator read-back (D1) | Deposited to `main` via PR #366 (`078e50cb`), 19 files under `evidence/cap03-s2/`; tracker §16.194: "S2-DEP-A is complete". The D1 read-back is not recorded as performed | PA-WAIVED — NOT A BLOCKER. Covers the S2-DEP-A deposit, the D1 read-back and the associated transfer | None |
| H-2 | 47-entry verification output (R-1) | Not in the repository. The PASS remains user-reported | PA-WAIVED — NOT A BLOCKER | None. The PASS is not converted into repository-recorded evidence |
| H-3 | Host original of `s2-checkout-verification.txt` (recorded digest `3FD31FE6…`; deposited copy `0df30bc6…`) | Integrity note open, as recorded in rulings §3 and S2-ACC-A1 | PA-WAIVED — NOT A BLOCKER | None. The mismatch remains a recorded historical fact |
| H-4 | A6 runtime on the designated host (E5) | Not run | PA-WAIVED — NOT A BLOCKER | T-1, only for first use of a successor instrument (PA-11); host availability is PA-WAIVED (PA-20) |
| H-5 | DC-a and DC-b (V1102) (E6); DC-C2 pre-invocation checks (E7) | Not run | PA-WAIVED — NOT A BLOCKER | None. The checks run inside the capture procedure |
| H-6 | Root check: `D:\cap03-p1-capture-20261028-01` absent and parent `D:` present | Existence not verifiable from the repository | PA-WAIVED — NOT A BLOCKER | None. The procedure refuses an existing root at runtime (line 197) |
| H-7 | Repeat native S2 run at the designated commit | Not performed. The existing run at `a891802e` is recorded | PA-WAIVED — NOT A BLOCKER | None. Admission of the existing run is PA-06 |
| H-8 | P-1-C capture and P-1-D verification under E10 | Not performed | PA-WAIVED — NOT A BLOCKER as a governance, E10-rendering, sequencing or host-evidence blocker | **None** — T-2 is PA-WAIVED — NOT A BLOCKER (PA-20; §5.2) |
| H-9 | H-12 regeneration with full validation at the designated commit (L2c) | Not performed | PA-WAIVED — NOT A BLOCKER | T-3, only for H-12 adoption at that pin (PA-10b) |
| H-10 | PF-11 `92d931fb` diagnosis | Optional; only on PA request | Not waived; not required; not a blocker | None |

### 5.1 What "waived" covers

Under PA-19, H-1 to H-9 are removed as governance, documentary and workflow blockers wherever they appear solely as evidence transfer, evidence in a repository location, a disputed deposit copy, operator read-back, a repeat run, or an operator step that has not yet been performed. They are removed from blocker counts, stop conditions and dependency chains in this package and in tracker §16.202.

PA-19 does not treat a waived item as satisfied. Where a record states that something has not happened, the record remains as written.

### 5.2 Surviving technical prerequisites (complete list)

**Two** prerequisites survive as technical prerequisites: **T-1** and **T-3**. **T-2** and **T-4** were recorded as technical prerequisites by the pass-4 statement and are now **PA-WAIVED — NOT A BLOCKER** under PA-20 (§3): both are Windows/operator evidence requirements, which the standing waiver removes from every blocker count, stop condition, prerequisite list and dependency description. Each surviving item is a property of the operation itself, not an evidence transfer, a host requirement or a documentary gap. The T-2 and T-4 entries are kept below, marked, so that the history of what was recorded is preserved.

- **T-1 — Successor instrument validation before first use.** Applies only if PA-11 adopts a successor D-2 instrument. The candidate record states that it has not been parsed and has not been run; it has static checks only. Its first use on a host cannot be validated by a waiver, so parse and run validation (with A6) must precede that first use. Affected operation: any use of the successor instrument. Not affected: adoption of the identity under PA-11.
- **T-2 — Attempt-session observations for P-1 — PA-WAIVED — NOT A BLOCKER (PA-20).** *As recorded in pass 4:* P-1-C capture and P-1-D verification are facts that the P1-F act cites; they exist only if an attempt session produces them. *Effect of PA-20:* the absence of those observations is **not** a blocker for the P1-F act, for E10 or for P-1, and no request for them may be reintroduced as a precondition. *What is unchanged:* the facts themselves. P-1-C remains **NOT ESTABLISHED** and P-1-D remains **NOT VERIFIED FOR THE ATTEMPT**; the record must not state that they exist, and the waiver does not authorize P-1.
- **T-4 — Native Windows execution for the P-1-C capture and P-1-D verification — PA-WAIVED — NOT A BLOCKER (PA-20).** *As recorded in pass 4 (2026-10-29):* the capture and verification were described as running on the operator's native Windows host under PowerShell 5.1 (E7; procedure), with the observation that the IRR sandbox has no such host. *Effect of PA-20:* Windows-host availability, PowerShell availability and operator presence are **not** blockers for any decision, act or workflow step, and this item is removed from blocker counts, stop conditions and prerequisite lists. *What is unchanged:* no run is recorded and none is claimed. A run, when one occurs, is subject to the act's own runtime checks; those checks are not workflow blockers, and the waiver does not assert that they passed.
- **T-3 — H-12 artifact at the designated commit.** Applies only to adoption of H-12 at that pin (PA-10b / S2a). An adoption operates on a regenerated artifact, and none exists yet. Affected operation: H-12 adoption at the designated commit. Not affected: S2 admission (PA-06), PA-10a direction, or any other decision.

No other technical prerequisite is identified in the statements affected by PA-19 and PA-20. The only surviving technical prerequisites are **T-1** (conditional; only if PA-11 adopts a successor instrument and it is first used) and **T-3** (only for H-12 adoption at a pin, which is not a P-1 prerequisite under adopted PA-1).

No further host transfer, run, capture, A6 execution or repeat S2 run is initiated by this package.

---

## 6. Excluded, IPD-owned and non-PA items

| Item | Status | Owner / reason |
|---|---|---|
| FRM-D1C (IPD row 7 citation) | IPD-OWNED | IPD prompt when IPD authority is granted; no PA ruling needed |
| IRR-PROC (procedure text change) | NOT PA-GATED | IRR action after PA-11 (successor identity) only |
| E3 (procedure revision) | APPLIED (`2026-10-28d`) | Further revision only if PA-11 or PA-12 require |
| G4-S2 (native run route) | Route recorded (Q-S2-2 (c)); run depends on PA-06 and PA-09 | Operator; repeat run is not a blocker (H-7, PA-19) |
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
| Companion §4 dependency sequence | PA-01, A-Q4, A-Q5, A-Q6, B-Q6, B-Q1 / B-1 (PA-08a), D-INST, E10, D1 read-back (H-1, PA-WAIVED as blocker), L2c / L2a (PA-10a, PA-06), S2a (PA-10b), P1-F | Complete |
| Packet Table 1 PA-open rows (AWAIT-PA) | A-Q1, A-Q2, A-Q3: RULED (§2). A-GAP1: RULED (§2). A-Q4: PA-02. A-Q5, A-Q6: PA-03, PA-04. B-Q1, B-Q3: PA-08a. B-Q2: not applicable under B-1; PA-08a (B-0 branch). B-Q4: RULED (§2). B-Q6: PA-05. C-Q1, C-Q2: RULED (MC-2), with conflict in PA-12. D-Q: RULED (§2). QP1: RULED (§2). E8: RULED (§2). E7: RULED (§2). PF10: RULED KEEP (§2). Q-N1, Q-B5: PA-07. Q-S2-1: RULED (§2), residual H-2/H-3 (PA-WAIVED as blockers, PA-19). Q-S2-2 / Q-B7: RULED route (c) (§2); run admissibility PA-06. G4-S2: operator run (H-7 PA-WAIVED as blocker). S2-IRRDOC: APPLIED. B-DESIG: PA-08 step 4 and PA-09. G4-PIN: PA-09. L2B: PA-18. E3: APPLIED. D-INST: PA-11. IRR-PROC: §6. E10: PA-13. P1-F: PA-14. FRM-D1C: §6. ADP-D1: PA-08a. ADP-D2: RULED (§2). | Complete |
| Session package Table 1 / §5.2 minimum rulings | Q-A1 to Q-A6 and A-GAP1 (§2, PA-02 to PA-04); Q-B1 to Q-B4 and Q-B6 (PA-08a, §2, PA-05); C-Q1 and C-Q2 (§2, PA-12); D-Q (§2, PA-11 consequence); E7, E8, PF-10 (§2, PA-11, PA-13); Q-P1 (§2); Q-S2-1, Q-S2-2, Q-B5 (§2, PA-06, PA-07) | Complete |
| Rulings §5 open choices | 1 G4 pin (PA-09); 2 A-Q5 mechanism (PA-03); 3 A-Q4 (PA-02); 4 R-2 premise (ruled §2; the CRLF premise recorded in rulings §3 stands); 5 D1 for Q-S2-1 (closed by S2-ACC-A1 §4; DA `D1` is PA-08c); 6 PF10, E8, D-Q, ADP-D1, ADP-D2, QP1, B-Q1, G4-PIN (§2, PA-08a, PA-09) | Complete |
| Formal record §4.6 steps 1–6 (adopted pin-selection process) | Designation prerequisites for PA-08a and PA-09 | PA-08, PA-09, PA-10 |

---

## 8. Non-grants

Nothing in this package grants: any P-1 authorization; any capture, A6 or PowerShell run; any host action; QE; Gate 4 execution or result acceptance; Gate 5 admission; S3; DQ-4 freeze; production eligibility; `durable:true`; `503` lift; any IPD write; any change to the compiled basis constants, `BASIS_COMMIT` or `BASIS_TREE`; any gate, acceptance, qualification, admission, authorization, pin or capability status. Preparing this package is not adoption of any decision in it.
