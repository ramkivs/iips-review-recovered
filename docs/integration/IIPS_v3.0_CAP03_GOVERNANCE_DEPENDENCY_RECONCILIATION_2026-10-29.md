# CAP-03 — Governance and dependency reconciliation (2026-10-29)

**Repository:** IRR `ramkivs/iips-review-recovered`. **Base:** `main` `70c5a9afd35e86cba24705e83d4db4eeee669405` (PR #368 merge). **Session branch:** `arena/ce58836e-iips-review-recovered`.

> **Correction note (2026-10-29, `CV-CORR-178`, §16.198).** The statements that L2a (fresh S2) at `a891802e` is "not produced" and that step 5 is "NOT satisfied" were written from rulings §8 (`eba856c8`, 2026-10-28 15:44Z) and are **stale**. The native Windows S2 run `s2-a891802e-20261028T192516Z` at the designated pin is recorded `PASS` (tracker §16.180, `CV-CORR-160`; evidence in `main` at `evidence/cap03-s2/s2-a891802e-20261028T192516Z/`). Its admission is PA-reserved. L2c (H-12 regeneration at `a891802e`) remains not evidenced. Two further conflicts found in this pass are recorded in §16.198 and must be decided by the PA: (i) the P-1 execution commit is `001c3c80` under DA-A1 (tracker §16.160) and `a891802e` under ADP-D1 (rulings §6, line 86), and (ii) `521d5482` §5(a) grants candidate `001c3c80` as the basis for S2 evidence acceptance, while §16.180 reserves admission of the `a891802e` run to the PA. The corrected rows are in the tables of this record; see the section headings above and §16.198. The original sentences are retained where they were the record of the 2026-10-29 pass, and §16.197 of the tracker is annotated by pointer.

**Status: DECISION BASIS AND RECONCILIATION ONLY.** This document records no PA ruling. It designates no commit, tree, blob or pin, adopts no instrument identity, and changes no status, acceptance, qualification, admission, authorization, gate, or disposition. Items needing a PA decision are listed in §9.

**Standing status (from the tracker and the rulings record):** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED. Gate 4 AUTHORIZED — NOT STARTED. H-12 NOT ADOPTED. QE 0/11. Gate 5 NOT INITIATED / NOT ADMITTED.

**Excluded from this pass:** portfolio HTTP read path, owner-context resolution, IPC adapter, durable-store integration, UI and offline-shell verification, macro E2E verification, and all IPD changes.

**Citation convention.** "Rulings §n" = `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` §n. "Designation record" = `docs/integration/IIPS_v3.0_CAP03_PA_DESIGNATION_RECORD_PASS2_2026-10-28.md`. "Addendum" = `docs/integration/IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_ADDENDUM_1_2026-10-28.md`. "Tracker" = `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`.

---

## 1. Source conflict: the designation record cites rulings that the rulings record does not contain

| Record (commit, UTC) | Role | What it states |
|---|---|---|
| Rulings record, created `b9e8d4a5` (2026-10-28 14:05) | Rulings record. Later amended by `b0f923eb`, `caca0213`, `eba856c8`, `822ef100`, `2dc54fd4`. | §1: A-Q1 YES; A-Q2 `edd0305e`; A-Q3 workstream-scoped; A-GAP1 "act §6 row S1 governs". Line 20: "Not ruled in this pass (remain open): A-Q4 … A-Q5 mechanism … A-Q6". §5: "G4 pin designation" open; "B-Q1, G4-PIN … as recorded in `06-recommendations.tsv`"; "They are not decided here." |
| Designation record, created `ef6832fd` (2026-10-28 14:08; three minutes later) | Designation record. Header cites the rulings record as basis. | Header: "G4-PIN = G4P-1 at `a891802e`; B-Q1 = B-1; A-Q5 mechanism = A-O3; A-Q4 = YES." §1 Status: "**Ruled; not yet effective for reliance.**" Line 55: "A-Q6 (act §8.2 stop) is cleared only by that act." |
| S1 handoff `docs/integration/IIPS_v3.0_CAP03_IPD_S1_PUBLICATION_AND_DEPENDENCY_HANDOFF_2026-10-28.md`; A-Q5 result `docs/integration/IIPS_v3.0_CAP03_IPD_A-Q5_RESULT_RECORD_2026-10-28.md` | Dependency and result records | Cite G4P-1 and A-Q4 as governing. |
| Tracker §16.196 (`CV-CORR-176`) | Authoritative register | A-Q4 "**Not ruled** … OPEN". The tracker contains no G4P-1 mention. A-O3 appears only as a PA option (line 14812). |

**Finding.** The designation record's basis line cites A-Q4 = YES, G4P-1, B-1 and A-O3 as rulings. The rulings record, written three minutes earlier, lists these items as not decided, and no later rulings-record amendment adds them. The sitting-response text that would establish them is not in the repository. **The repository cannot verify that the PA gave these rulings.** Until the PA confirms, the designation record's conflicting entries have no verified ruling behind them.

**Reliance.** The designation record itself says the pin is "not yet effective for reliance". Its §4.6 step 5 (fresh S2 and H-12 at the pin) is **partly evidenced** (see the correction note at the top: the native S2 run at `a891802e` exists; H-12 regeneration at `a891802e` is not evidenced). Nothing here relies on the pin.

**Not corrected in this pass.** The designation record, the S1 handoff and the A-Q5 result record. Correcting them would decide the disputed rulings, which only the PA can do.

---

## 2. A-Q4 — decision basis (no ruling recorded)

> **Dated pointer (2026-10-29, `CV-CORR-181`, tracker §16.201; original text kept).** The statement below that "no IRR document under `docs/` or `evidence/` names the two PR #96 paths in the §16.143 disposition" is **incorrect**. The disposition `docs/integration/IIPS_v3.0_CAP03_S2_CANDIDATE_SCOPED_BASELINE_DISPOSITION_2026-10-26.md` (line 46, "Change set") names exactly `scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts`. Verified on `origin/main` `d7352ed`. Whether that disposition is an authorizing record for the two paths is still open: PA-02 in `IIPS_v3.0_CAP03_CONSOLIDATED_PA_DECISION_PACKAGE_PROPOSED_2026-10-29.md`.

**Question.** Do the two PR #96 paths (`scripts/verify-public-package.mjs`; `tests/portfolio_ui_package.test.ts`) require an authorizing record, and does IPD `aa43dec2` satisfy it? (Packet Q-A4: `docs/integration/IIPS_v3.0_CAP03_P1C_P1D_PA_DECISION_PACKET_A-F_2026-10-28.md` line 500; Tracker §16.196.)

**Status.** OPEN. Rulings §1 "Not ruled"; tracker §16.196 "Not ruled … OPEN". The designation record's "A-Q4 = YES" has no supporting ruling text (§1 above).

**Verified facts (IPD read-only; no IPD write).**
- IPD PR #96, "Fix native Windows CAP-03 S2 package validation": merged `2026-10-26T10:12:18Z`; head `001c3c80618f2ee1d40e9a90912237e1a06e7b58`; merge `1e76f4cf9e9ca7d385a8345c9b6f438ae1ad6745`. Modified files: `scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts`. IRR `docs/integration/IIPS_v3.0_CAP03_IPD_PR97_AND_IRR_RECEIPT_RECONCILIATION_2026-10-26.md` describes both as non-evidence correction paths, with "0 `src/**`, `package.json`, `package-lock.json`, or `.github/workflows/**` changes".
- `tests/portfolio_ui_package.test.ts` was created as a **new** path by IRR `docs/integration/IIPS_v3.0_CAP02_BROKER_IMPORT_UI_COMPOSITION_ACT_2026-10-23-02.md` (its file table, dated 2026-10-23). PR #96 later modified it. That act does not state an authority for later modifications.
- A repository-wide search of IRR `docs/` and `evidence/` (2026-10-29) finds no record naming `scripts/verify-public-package.mjs` other than the PR97 reconciliation record. The IPD-side documentation was not searched exhaustively.
- The candidate `521d5482` is the blob of the IRR §16.143 disposition `IIPS-V3-CAP03-S2-CANDIDATE-SCOPED-BASELINE-DISPOSITION-2026-10-26-01` (`docs/integration/IIPS_v3.0_CAP03_P1_PA_DECISION_PACKAGE_2026-10-28.md` line 24). Addendum line 162 records that disposition as "**OPERATIVE BASIS ADOPTED**" for the candidate-scoped S2 basis `001c3c80` / `399fa44a`. No IRR document under `docs/` or `evidence/` names the two PR #96 paths in the §16.143 disposition. This is a search result, not a reading of the blob `521d5482` itself.
- IPD `aa43dec2` is a merge of PR #103 (two parents). Its file list is one path: `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`. It does not name either PR #96 path.
- Rulings §1 (A-Q3): the act §5.1 scope is **workstream-scoped**. Under that ruling the PR #96 paths are outside the act §5.1 change set (the two PA-5 files named in §5.1), so an authority for them would have to come from another record. (The §5.1 file list was not re-read in this pass.)

**Options for the PA (decision basis only; not a recommendation to adopt).**
- (a) **Yes**: an authorizing record is required. State whether `aa43dec2` satisfies it (on the facts above it does not name either path), or name a new act.
- (b) **No**: the paths need no authorizing act. State the reason.
- (c) Defer, naming the act that will supply the authority.

---

## 3. A-Q5 — sequencing discrepancy

**Register ordering.** Tracker §16.176.9 items 1 and 4: Sitting 1 covers A-Q1–A-Q4 and A-GAP1; A-Q5 belongs to Sitting 3, after them.

**What was executed.** IPD PR #107 (CAP-02 Gate A′ designated-blob amendment act 01: "A-Q5 (A-O3) re-designates §2.1 items 10 …") merged `2026-10-28T15:30:43Z`, merge `0edadb2d12…`. Changed files: `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_AMEND_01_DESIGNATED_BLOBS_EFFECTIVE_2026-10-28.md` (added, 115+ lines) and `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md` (modified, 75+). Neither PR #96 path is touched.

**Discrepancy.** A-Q5 was executed while A-Q4 is open, contrary to the Sitting ordering in §16.176.9. Rulings §8 records the PA ruling on the basis limb as "reading (ii)" and records "basis limb cleared on reading (ii); designated-blob limb cleared; Matter A closed as to the act §7 test." The designated blobs rely on A-Q1 and A-Q2, both in the rulings record. The **mechanism** A-O3 is recorded only in the designation record (tracker line 14812 lists it as an option). So A-Q5's mechanism is not verified, and the sequencing deviation has not been recorded or ruled.

**Options for the PA (decision basis).**
- (a) Ratify the executed act `0edadb2d` as the A-Q5 act, recording the sequencing deviation.
- (b) Require a fresh A-Q5 act after A-Q4 is ruled.
- (c) Treat the executed act as provisional until §1 and §2 are resolved.

**A-Q6.** Rulings line 20 lists A-Q6 as open. The designation record line 55 says A-Q6 is "cleared only by that act". The PA must reconcile these.

---

## 4. P-1 governance chain

Requirements come from Addendum rows E10, P1-F, D-INST, the P-1-C/P-1-D capture rows, and the rulings record. The "Ruled" entries are as recorded in the rulings record. Items the designation record claims but the rulings record does not show are marked as unverified.

| Item | Requirement | Status on the record | Owner |
|---|---|---|---|
| D1 | Host-original read-back (Q-S2-1 remainder) | **Open** pending operator read-back (rulings §6) | Operator |
| PF10 | Procedure line 147 wildcard | **KEEP** (rulings §6); needs D-INST before use | PA (done) |
| D-Q | Object and method for Matter D | **Object: store parent. Method: D-2, with D-1 supporting** (rulings §6); triggers D-INST | PA (done) |
| E7 | DC-C2 scope | **Next capture only** (rulings §6) | PA (done) |
| E8 | Capture root and parent | **Parent `D:`; root `D:\cap03-p1-capture-20261028-01`** (rulings §7); E3 applied, procedure revision `2026-10-28d` | PA (done). Whether the root already exists on the host is not verifiable from the repository (rulings §7) |
| QP1 | PF-15 literals F2, F4, F5 | **Approved as rendered in act -02** (rulings §6) | PA (done) |
| C-Q1 / C-Q2 | Pre-attempt observations | **MC-2** (rulings §6) | PA (done) |
| B-Q4 | Whether H-12 regeneration gates L2a | **Resolved on formal §4.6 step 5**: L2a waits on H-12 at the designated commit (rulings §6) | PA (done) |
| ADP-D1 | Final execution commit | **Adopted as IRR wording**: "the P-1 execution commit is the designated B-1 commit `a891802e`" (rulings §6). **Depends on the B-1 confirmation below** | PA (done, conditional) |
| ADP-D2 | Receipt executing identity | **Accepted at `a891802e`, receipt element only** (rulings §6) | PA (done) |
| A-Q4 | PR #96 authorizing record | **Not ruled** (§2) | **PA** |
| A-Q5 | Sequencing and mechanism | **Executed at IPD `0edadb2d`; sequencing and A-O3 mechanism unverified** (§3) | **PA** |
| A-Q6 | §8.2 stop | **Open** per rulings line 20; the designation record says cleared (§3) | **PA** |
| B-Q1 / B-1 | Matter B coordinate `a891802e` | **Conflict**: designation record says B-1; rulings §5 says "not decided here" (§1). B-1 "not effective" (rulings §8) until fresh S2 and H-12 at `a891802e` exist | **PA confirmation** |
| B-Q6 | Whether `aa43dec2` is eligible as a Matter B candidate | **Not ruled** | **PA** |
| D-INST | New successor-instrument identity for D-2 (E4; DB-B1) | **NOT ADOPTED.** Candidate `evidence/integration/cap03-p1-d-inst-d2-candidate-2026-10-28/`. Current identity `191f5828` (v2) per Addendum row E4 | **PA adoption** |
| A6 | Runtime check before use; "not authorized; not started" (Addendum row 106) | **NOT STARTED** | **Operator** (host) |
| E10 | Separate capture-authorization act naming host, session, root, identity, pins, window, operator | **NOT RENDERED** (PA drafts it) | **PA** |
| P-1-C / P-1-D | Capture and attempt verification | **NOT ESTABLISHED / NOT VERIFIED FOR THE ATTEMPT** | **Operator**, under E10 |
| L2a | Fresh S2 at `a891802e` | **Executed and recorded PASS** (`s2-a891802e-20261028T192516Z`; host `DESKTOP-NO0NHTP`; `RESULT.txt` `STATUS: PASS`; 16/16 `SHA256SUMS` match on `main`). Admission of the run is **PA-reserved** (`Q-S2-1` remainder, `D1`; tracker §16.180) | PA (admission) |
| L2c | H-12 regeneration at `a891802e` | **Not evidenced** (tracker line ~15534: "H-12 at `a891802e` (L2c) NOT ADOPTED AT THIS PIN; not started"; no later record found) | **PA** direction, then IPD/IRR |
| S2a | H-12 adoption | **NOT ADOPTED** (tracker standing status) | **PA** |
| P1-F | P-1 authorization act | **NOT RENDERED**; P-1 NOT AUTHORIZED | **PA**, only after the above |

**Dependency sequence.** PA confirmation of §1 → A-Q4 → A-Q5 sequencing and A-Q6 → B-Q6 (and the B-1 confirmation that ADP-D1 depends on) → D-INST adoption → A6 on the designated host → E10 act → operator P-1-C capture and P-1-D verification (D1 read-back stays open) → fresh S2 and H-12 at `a891802e` → S2a → P1-F act. P-1 remains NOT AUTHORIZED until P1-F is rendered.

---

## 5. Gate 4: S1 wording and pin requirements

**S1 wording — conflict resolved by ruling.** The verbatim Gate 4 act §6 row S1 (IPD `1ba0740a`) reads "**BLOCKED** — successor act effective, but its identity values are **unresolved** (successor act §4) and no store exists" (Addendum line 227). The IPD S1 determination §12.2 (IPD `1ba0740a`) reads "`12/12` of the successor act §2.1 paths resolve as designated" (Addendum line 227; rulings §1 A-GAP1 wording). Rulings §1 A-GAP1 rules **act §6 row S1 governs**. IPD `b9dd6fce` (PR #108, merged `2026-10-28T15:47:00Z`) published the pointer (`IIPS_V3_CAP03_S1_POINTER_ACT_01_EFFECTIVE_2026-10-28.md`). S1 execution remains BLOCKED. No S1 step is authorized.

**Gate 4 pin `a891802e`** (`ahead` of nothing; ancestor of IPD `main`: compare `a891802e...main` returned `behind_by: 0`).

| Step | Requirement | Verified status |
|---|---|---|
| 1 | Commit on IPD `main`; exact-head CI green | **Verified for `a891802e`**: ancestor of `main`; check-runs "typecheck · build · test" and "executed test count" both `success` (IPD check-runs read 2026-10-29) |
| 2 | Delta classified | `001c3c80…a891802e`: 62 files; 2 non-evidence code paths (`src/persistence/gateAPrimeProvisioning.ts`, `tests/g3_gate_a_prime_successor_provisioning.test.ts`); 60 under `evidence/`. The A-Q3 classification of the 60 is not re-verified here |
| 4 | PA designation names commit, tree, blobs, purpose | **Unverified.** G4P-1 appears only in the designation record (§1). Addendum line 219: "G4-PIN options are G4P-1, G4P-2, G4P-3 (formal record §4.5 C-1…C-3)" |
| 5 | Fresh S2 (L2a) and H-12 regeneration (L2c) at the designated commit (formal §4.6 step 5, per rulings §6 B-Q4) | **Partly evidenced.** L2a: native run executed and recorded PASS, admission PA-reserved. L2c: **not evidenced** |

The G4-PIN row is open: PACKAGE `docs/integration/IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_PACKAGE_2026-10-28.md` line 126 reads "awaiting PA". The rulings record does not record a pin choice. Steps 3 and 6 of formal §4.6 are not restated here because the formal record is not re-read in this pass.

---

## 6. QE and Gate 5

- **QE:** 0/11 (tracker standing status). No QE result exists.
- **Gate 4:** AUTHORIZED — NOT STARTED (tracker standing status; `§16.95` status line).
- **Gate 5:** NOT INITIATED / NOT ADMITTED (tracker line 25). Prerequisites are as recorded in the tracker's gate status section (§16.176.10); they are not restated here.
- **Production:** not authorized. Nothing in this pass infers production eligibility from the S2 result or the S2-DEP-A deposit (tracker §16.194).

---

## 7. REG-11 and REG-12 — dispositions verified as recorded (no change)

**REG-11 (`NP-06` / `F-4`).** Register row (tracker line 107): **BLOCKED / DEFERRED**; PA disposition **OPTION C (RETAIN DEFERRAL)**, recorded 2026-10-13 (tracker §11, heading line 680). The row also says the deferral is superseded "for the bounded non-authentication baseline by the effective R1 and R2 acts of 2026-10-25, §16.190", and that no formal closure or promotion is recorded. §16.190 (D-6, tracker line 16059) cites "§§16.106–16.116" for the effective bounded non-production R1/R2 acts. Tracker §11.3 states that the 2026-10-13 disposition is effective only on durable publication, and that its effect on Reports' operative state is "none" (already deferral, fail-closed).
- **Reconciled by §16.198 and §16.199 (`CV-CORR-178`/`179`):** tracker §16.107 (2026-10-25) records R1 as "NOT ESTABLISHED" for the state it examined, and §16.112 records R1/R2 effective later. The register row cross-reference now cites §16.112 as primary and §16.190 D-6 as cross-reference; status is unchanged. The §16.116 planned "closure" annotation was not recorded and is pointer-annotated (§16.199); REG-11 is not closed.
- **Decision needed only if the PA wants to reopen or formally close REG-11:** a PA act stating the intended disposition. No such act is recorded.

**REG-12 (`G-2` / `F-4` / `AG-5`; durable user portfolio identity binding; IPD G24).** Current disposition: `DEFERRED` → `AUTHORIZED` (bounded Gate 3) → **`IMPLEMENTED & ACCEPTED` for bounded Gate 3 scope only** (tracker §16.77, `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01`, 2026-10-22). Gate 4 host qualification, result acceptance, Gate 5 admission, runtime enablement, `durable:true` and any `503` lift remain **DEFERRED / NOT GRANTED**. The tracker states that the `companyId` ↔ `ISIN` ↔ G24-ticker **mapping** blocker is **NOT resolved** by either act it records.
- **Decision needed for the open matter:** the mapping blocker has no recorded owner or decision route. The PA must name them. No REG-12 disposition is selected here, because no authoritative decision supplies one.

---

## 8. Corrections in this pass

- **Rulings, designations, dispositions, statuses, gates, acceptance, qualification, admission, authorization, pins:** none changed.
- **Added:** this document, and tracker `§16.197` (`CV-CORR-177`, `CHG-2026-10-29-19`, `V1450`–`V1458`), which records the verified facts and these flags by pointer.
- **Corrected by annotation (not rewritten), `CV-CORR-178`/`179`:** the designation record's basis line, with the dependent S1 handoff and A-Q5 result records (§1); the REG-11 cross-reference (§7); the superseded L2a statements in tracker §16.197; the planned REG-11 closure text in §16.116; the PR #353 "open" status in three record headers. No ruling, status or gate was changed.

---

## 9. Decisions reserved to the PA

0. **S2 admission basis (new, §16.198).** Reconcile `521d5482` §5(a) (candidate `001c3c80` as the basis for S2 evidence acceptance) with the admission of native run `s2-a891802e-20261028T192516Z` at `a891802e` (tracker §16.180, `Q-S2-1` remainder). Ruling required before any S2 acceptance is stated.
1. **Source confirmation (gating).** Did the PA give G4P-1, B-1 (B-Q1), A-O3 (A-Q5 mechanism), A-Q4 = YES, and A-Q6 clearance? If yes, a dated act should record them in the rulings record, citing the sitting response. If no, the designation record, the S1 handoff and the A-Q5 result record need review.
2. **A-Q4.** Yes or no on an authorizing record for the two PR #96 paths; whether `aa43dec2` or the §16.143 disposition `521d5482` satisfies it (§2).
3. **A-Q5 sequencing.** Ratify executed IPD act `0edadb2d`, require a fresh act, or treat it as provisional (§3).
4. **A-Q6.** Whether the §8.2 stop is cleared (§3).
5. **B-Q6** (eligibility of `aa43dec2`).
6. **D-INST.** Adoption of the D-2 successor-instrument identity under DB-B1 (E4), and the A6 requirement before use.
7. **E10.** Render the P-1 capture-authorization act.
8. **S2a.** H-12 adoption.
9. **P1-F.** The P-1 authorization act, only after items 1–8 and the operator steps in §4. It must name one execution commit: `001c3c80` (DA-A1, tracker §16.160) or `a891802e` (ADP-D1, rulings §6). These two adopted positions conflict as written (§16.198).
10. **G4-PIN.** The Gate 4 pin choice, after item 1 is resolved.
11. **REG-11.** Only if the PA wants to reopen or formally close Option C.
12. **REG-12.** Owner and decision route for the `companyId` ↔ `ISIN` ↔ G24-ticker mapping blocker.

---

## 10. Dependency-ordered next steps

> **Dated pointer (2026-10-29, `CV-CORR-182`, tracker §16.202; original text kept).** Under PA ruling PA-19 (consolidated package §3), H-1 to H-9 are PA-WAIVED — NOT A BLOCKER. This applies to the operator steps 3–5 below (A6, P-1-C/P-1-D capture and verification, D1 read-back, H-12 regeneration) and to the S2 deposit. The surviving technical prerequisites are T-1 (successor instrument validation before first use), T-2 (attempt observations for the P1-F act) and T-3 (H-12 artifact for adoption at a pin). The S2-DEP-A deposit is complete per tracker §16.194 (PR #366, `078e50cb`).

1. **PA:** item 1 (source confirmation). Matter A, Matter B and the Gate 4 pin depend on it.
2. **PA:** items 2–4 (A-Q4, A-Q5 sequencing, A-Q6); then item 5 (B-Q6).
3. **PA:** item 6 (D-INST adoption). **Operator:** A6 on the designated host only after that adoption.
4. **PA:** item 7 (E10). **Operator:** P-1-C capture and P-1-D verification under E10; D1 read-back.
5. **PA direction, then operator/IRR:** H-12 regeneration (L2c) at `a891802e`. The fresh native S2 run (L2a) is already executed; its admission is a PA item.
6. **PA:** items 8–9 (S2a, P1-F). P-1 remains NOT AUTHORIZED until P1-F is rendered.
7. **PA, separately:** item 10 (G4-PIN), then the Gate 4 and QE work that follows formal §4.6.

*No IRR step on this chain can proceed without a PA ruling or operator evidence. The first step is PA source confirmation (item 1).*
