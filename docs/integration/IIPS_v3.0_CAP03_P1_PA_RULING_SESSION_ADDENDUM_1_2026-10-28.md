# CAP-03 — PA ruling-session package, Addendum 1: current-state delta, consolidated ruling index, and gated-action register (`2026-10-28`)

> **STATUS: ADDENDUM — PA RULING PREPARATION ONLY. NO PA DECISION IS MADE, CHOSEN, OR IMPLIED.** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.
>
> This addendum does not replace `IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_PACKAGE_2026-10-28.md` (PR #352, blob `e1219f89`). The decision sheets (§5 of that package) and the 77-row register (Table 1) remain the source for options and row content. This addendum (a) records what changed since that package was published, (b) indexes the outstanding reserved rulings by PA sitting, and (c) records the gated-action triggers and the prepared-but-unapplied change scope for IRR-owned revisions. Status is recorded in the master tracker §16.174, not here. Nothing in this addendum authorizes P-1, a capture, a host operation, a PowerShell run, a designation, a pin change, an IPD write, S3, QE, DQ-4, Gate 4, or Gate 5 movement, or any acceptance.

Evidence for every "verified" statement below: `evidence/integration/cap03-ruling-sitting-2026-10-28/01-refs-and-ipd-blob-check.txt` (read-only, this pass). Statements marked *carried* were not re-verified in this pass.

## 1. Current-state delta since PR #352 (verified this pass)

| Item | Earlier recorded | Verified now | Effect on the ruling set |
|---|---|---|---|
| IRR `main` | `82b3f4a5` | `82b3f4a5d31134e40fd3a1a23169a0ca8d638dfc` (unchanged) | none |
| IRR open PRs | — | **1**: PR #353 (OPEN, not draft, not merged), head `f3c2df3…` | PR #353 is documentation-only; its merge is not a PA ruling and needs its own merge authorization |
| IRR check on PR #353 head | — | `Typecheck · Test · Build` **success** on `f3c2df3` (run `40681411042`, recorded in §16.173) | none |
| IPD `main` | `2d0cc005` (PR #105) | **`1ba0740a32e69284d7c524fd6ac8daf5455038d0`** (PR #106 merge). Two commits since `2d0cc005`: `5431ef6` and the merge. Changed files: one (`evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`, +137/−0, additive) | No IPD code, test, manifest, or designated-blob change since `2d0cc005`. IPD open PRs: 0 |
| IRR consumer pin `8eec74ae` | ancestor of IPD `main` | ancestor of `1ba0740a` (verified) | pin unaffected |
| Lead branch `arena/cap03-p1c-p1d-reconciliation-20261027T142404Z` | `40e36ab9` | `40e36ab9` (unchanged; ancestor of `origin/main`) | none |
| PK-01 packet blob (`IIPS_v3.0_CAP03_P1C_P1D_PA_DECISION_PACKET_A-F_2026-10-28.md`) | `796e0c82` | `796e0c82` on IRR `main` | none |
| PF-15 literals `-01` `cbd500a7` / `-02` `3fe9a2dd` | span equality verified in PR #352 pass | unchanged (carried) | none |

### 1.1 IPD PR #106 correction to the 47-file record (IPD-side; read, not adopted by IRR)

PR #106 (IPD, merged `2026-10-28T11:39:13Z`) corrects the IPD record that stated "3 entries not reproduced by any tested transformation":

- `00-preflight-results-provided-in-chat.txt` (`BEE567CB…`) and `s2-ipd-pr-body-20261026T100850Z.md` (`DC54484A…`) **reproduce** under "LF body with its trailing LF removed, then a single trailing CRLF".
- `s2-checkout-verification.txt` (`3FD31FE6…`) reproduces under **none** of the 8 disclosed variants (of the committed blob). Genuinely unreproduced.
- Corrected breakdown of the 46 as-committed `MISMATCH` entries: 43 (CRLF-restored) + 2 (LF body with single trailing CRLF) + 1 (unreproduced). As-committed: 1 `MATCH` / 46 `MISMATCH` of 47. Byte identity with the host originals: not established for 46 of 47 (carried from the record; not changed by the correction).

This agrees with the IRR readback finding (`54d5a56f`, which classified the two files as reproduced under the LF-plus-trailing-CRLF transform) and with the PR #353 reconciliation record §3.5. The "genuinely unreproduced" finding refers to the committed blob. The archive original of `s2-checkout-verification.txt` matches manifest digest `3FD31FE6…` (PR #353 reconciliation record, R-2). Both statements hold; they are not in conflict.

**Not reproduced this pass (conflict recorded, not resolved):** PR #106's validation section states "remote read-back 3/3 blobs MATCH, 12/12 designated blobs identical". Against the act §2.1 designated values (as cited in PA package §5.2), two of the twelve do not match at `2d0cc005` or at `1ba0740a`:

| Path (act §2.1 item) | Designated | Observed at `1ba0740a` | Observed history |
|---|---|---|---|
| `src/persistence/portfolio_store.ts` (item 10) | `4a005b73` | `540d49f2` | `5fc74085` = `4a005b73`; `001c3c80` onward = `540d49f2` |
| `tests/g3_startup_validation.test.ts` (item 12) | `9a5fd9e3` | `edd0305e` | `5fc74085` = `9a5fd9e3`; `001c3c80` onward = `edd0305e` |

IPD's own tracker (line 1812, appended 2026-10-28) states that item 12 resolved to `edd0305e` (the act-authorized bounded modification), not to `9a5fd9e3`, and that the earlier "as designated" characterization was inaccurate. The item-10 position is a Matter A matter (A-Q1–A-Q6). Minimum decision: see §2 row A-Q2. IRR does not choose between the designated and observed values.

*Correction to IRR tracker §16.173.2 (this pass):* that entry paired `tests/g3_gate_a_prime_successor_provisioning.test.ts` with designated `9a5fd9e3`. The designated item-12 path is `tests/g3_startup_validation.test.ts`. The Gate A′ successor test and `src/persistence/gateAPrimeProvisioning.ts` are not among the two items above; their blob changes at `2d0cc005` are recorded as observations (`gateAPrimeProvisioning.ts` is absent at the compiled basis `5fc74085`, present from `001c3c80`; the successor test changed `0ea47e8f → 1fe70466` at `2d0cc005`). Correction recorded additively in §16.174.

## 2. Consolidated index of outstanding reserved rulings (by PA sitting)

Each row names the question, the options **as the governing record defines them** (not chosen), the verified delta, and what the ruling unblocks. "Sitting" is a grouping for PA convenience; it is not a sequence claim beyond the dependencies listed. Row IDs are those of PA package Table 1 and §5.

### Sitting 1 — rulings with no S2 or host dependency

| ID | Question (minimum decision) | Options as recorded | Delta / evidence | Unblocks | Dependencies |
|---|---|---|---|---|---|
| A-Q1 | Is DR-2 a "further act" for item 10 (§5.2)? | yes / no | §1.1 item-10 mismatch persists at `1ba0740a` | A-Q5, A-Q6 | — |
| A-Q2 | Which blob is designated for item 12, and what is the item-10 position? | designate `9a5fd9e3` or `edd0305e` (§5.2, A-O2–A-O5 as the mechanism) | §1.1 table; PR #106 "12/12 identical" claim conflicts with act §2.1 (see C-2 below) | A-Q5 | A-Q1 |
| A-Q3 | Is act §5.1 "exhaustive" repository-wide or workstream-scoped? | repository-wide (then A-F8 out-of-set paths need authorizing records) / workstream-scoped | F-5: PR #102 changed the IPD tracker as well as the two code files | A-Q5 | — |
| A-Q4 | Do the two PR #96 paths need an authorizing act, and does `aa43dec2` documentation satisfy it? | (as recorded in §5.2) | carried | A-Q5 | — |
| A-GAP1 | Which S1 text governs status: Gate 4 act §6 row S1 "BLOCKED — identity values unresolved", or the IPD S1 determination (§12.2) "resolved"? *No Q-ID; authority gap.* | state which governs | S1 determination §12.2 conflicts with act §2.1 row 12 (C-4 below) | any S1 step; P1-EXEC gate | — |
| B-Q4 | Does H-12 regeneration gate L2a? (PA-1 says H-12 adoption is not a P-1 prerequisite; formal §4.6 step 5 requires H-12 at the designated commit.) | yes / no | carried | B-Q1 | — |
| B-Q6 | Is `aa43dec2` eligible as a Matter B candidate at all? | eligible / not eligible | carried | B-Q1 | — |
| C-Q1 | Is A6 runtime commit-independent? (Source does not state it.) | answer from source, or PA scopes an operator confirmation | not re-verified | C-Q2 | — |
| D-Q | Matter D: object of the criterion first (store parent `C:\iips-data\iips` or store path, which must not exist), then method D-1 (ACL inspection as sufficient), D-2 (published non-mutating effective-rights check in a new instrument revision), D-3 (create-and-remove sentinel; express authorization), D-4 (historical REV2 probe; not recommended as sole evidence) | per §5.5 | carried | D-INST; E3 | — |
| E7 | Does DC-C2 replace the native PowerShell 5.1 harness prerequisite for the next attempt (procedure §4.3a line 172), or does the native run remain required (bundle 06 line 6; bundle 10 line 8)? | replace / supplement, for stated scope | procedure line 172 reads "replaces … for that attempt only" | E3; E10 | — |
| E8 | Root path for the capture (procedure hard-codes `D:\iips-evidence` at lines 131, 150, 154, 167, 193, 440, 486; reported root `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`). PA names the root **in writing**; it must not collide with F4 `C:\iips-data\iips\user-portfolio.sqlite` or F5 `C:\iips-evidence\cap03-gate4`. IRR proposes no root. | PA-named root | §1 literals unchanged | E3; E10 | QP1 |
| PF-10 | Procedure line 147 checks the `GATE_A_PRIME_*` wildcard; instrument v2 checks four named flags. Narrow the procedure to the four named flags, or keep the wildcard and change the instrument (new identity; own validation). | narrow / keep + new instrument | carried | E3; E10 | — |
| QP1 (Q-P1) | Confirm the approved byte-level PF-15 literals: F2 (31 bytes, 4 backslashes) `\\.\pipe\iips-user-portfolio-v1`; F4 (39 bytes, 3 backslashes) `C:\iips-data\iips\user-portfolio.sqlite`; F5 (28 bytes, 2 backslashes) `C:\iips-evidence\cap03-gate4`. | confirm, or issue a further act with different values | `-01` and `-02` code-span contents byte-identical for F2, F4, F5 (verified in PR #352 pass); the `-02` "transcription defect" premise is not reproduced in committed bytes (recorded as stated in `-02`; not verified) | E8; E3 | — |
| Q-N1 | Adopt the labels in packet §16.7 N-1 (C-1/C-2/C-3 for Matter C options vs Gate 4 QE/H-12 pin choices), or name the options otherwise. PF-11 and Limb A collisions (packet §11) have no Q-ID and may be included. | adopt / name otherwise | carried | G4-PIN | — |

### Sitting 2 — S2 rulings (these gate Matter B and the Gate 4 S2 Limb A path)

| ID | Question (minimum decision) | Options as recorded | Delta / evidence | Unblocks | Dependencies |
|---|---|---|---|---|---|
| Q-S2-1 | (a) Does candidate-scoped acceptance stand with R-1 not an absolute prerequisite (the record's own §4 analysis)? (b) Is R-1 held absolute, reverting acceptance to "NOT RENDERED" for L2a and requiring a superseding record? (c) What is the clearing condition for R-2? Also D1: close for candidate scope with R-4 as a permanent boundary, or open pending an operator read-back of host originals. Does the PASS stay user-reported or become open? | (a) / (b); R-2 condition as ruled; D1 closed / open; PASS user-reported / open | R-2 clearing condition is met on the record's own terms (archive original matches `3FD31FE6…`, PR #353 reconciliation §3.5); the register itself is not updated until this ruling (O-5). IPD (PR #106) characterizes the host bytes and the 47-entry output as required for **formal** package-consumer acceptance and P-1 admissibility; IRR acceptance §5 treats R-1 as not absolute unless the PA holds it (C-1 below). | P1-A scope; B-Q1; S2-IRRDOC; Q-B5 | — |
| Q-S2-2 (= Q-B7) | Does the 924/920/0/4 run at `001c3c80` satisfy Gate 4 S2 Limb A? Options: (a) yes, by an express PA act (Gate 4 act §6 names the post-merge commit; `001c3c80` is not the Limb A merge commit `a52b47b0`); (b) no, a native canonical `npm test` at the Gate 4 commit under the authority the Gate 4 act provides; (c) PA designates the Gate 4 commit by separate act, then the native run occurs there. | (a) / (b) / (c) | Limb A NOT STARTED (carried). IPD PR #106: "not an IPD implementation blocker" | G4-S2; B-Q1; S2-IRRDOC | — |
| Q-B5 | No substantive decision: PA states which "S2" each requirement refers to (four uses catalogued at packet §16.7 N-2). | labels | carried | — | Q-S2-1 / Q-S2-2 for the affected rows |

### Sitting 3 — sequenced after Sittings 1–2 (not for the same sitting unless PA so orders)

| ID | Question | Options as recorded | Dependencies |
|---|---|---|---|
| A-Q5 | Mechanism and named commit for the Matter A designation change | A-O3 (amended designated list by IPD act naming observed blobs at a named commit) / A-O4 (fresh IPD act superseding §2.1 and §5.1) / A-O5 (IPD code change restoring designated blobs); IRR cannot amend the act or any IPD path | A-Q1–A-Q4 |
| A-Q6 | Is the §8.2 stop cleared by A-Q1–A-Q5, or does execution need a fresh designation first? | cleared / fresh designation first | A-Q5 |
| B-Q1 | Matter B: one choice | B-0 retain `001c3c80` as P-1 coordinate (attempt records no executing identity; DA-A1 receipt element needs waiver or deferral) / B-1 designate one D2 commit or a later `C′` (after Matter A; needs fresh S2 and H-12 at that commit unless Q-B4 says otherwise) / B-2 defer until IPD reports `C′` | A-Q1, A-Q6, B-Q4, B-Q6, Q-S2-1, Q-S2-2 |
| B-Q2 | If B-0: waive or defer the DA-A1 receipt element; head `001c3c80` or merge `1e76f4cf` | — | B-Q1 = B-0 |
| B-Q3 | If B-1: commit and tree (only after A-Q1–A-Q6). `a52b47b0` and `c62dee81` share tree `1467802e` and are **not** interchangeable by tree equivalence. | — | B-Q1 = B-1; A-Q1–A-Q6 |
| B-DESIG | Designation act for the B-1 commit (if chosen) | — | B-Q3 |
| G4-PIN | Gate 4 QE/H-12 pin choice (formal §4.5 C-1/C-2/C-3; labels per Q-N1). NOT DESIGNATED. Not a side effect of B-1. | — | B-Q1; Q-N1 |
| C-Q2 | Pre-attempt observations preparatory only and re-observed in the attempt? Plus option C-1 / C-2 / C-3 (§5.4) | — | C-Q1; B-Q1 for commit-keyed items |
| E10 | Separate PA capture-authorization act naming host, session, root, instrument identity, pins, time window and operator. Not rendered. Not P-1 authorization. | — | B-Q1; A-Q6; E3; E7; E8; PF-10; C-Q2; D-Q; QP1 |

### Conflicts and record statements the PA must see (recorded, not resolved)

| ID | Conflict | Minimum decision | Blocks |
|---|---|---|---|
| C-1 | IPD PR #106 treats the host CRLF bytes and 47-entry output as required for formal package-consumer acceptance; IRR acceptance §5 treats R-1 as not absolute unless the PA holds it. | Q-S2-1 (b) vs (a) | formal acceptance wording only; no operation other than P1-A scope |
| C-2 | PR #106 "12/12 designated blobs identical" vs act §2.1 (10/12 at `1ba0740a`; §1.1 table). | A-Q2 and the item-10 position (IPD-S1 may record correction) | A-Q5 |
| C-3 | Gate 4 status: CV-20 row "NOT AUTHORIZED / NOT ACCEPTED" vs carried summary "AUTHORIZED, NOT STARTED". | PA confirms which text governs | G10 status wording; no Gate 4 action is taken on either text |
| C-4 | S1 determination §12.2 "12/12 resolve as designated" vs act §2.1 row 12 (`edd0305e` vs `9a5fd9e3`). | A-GAP1 | any S1 step |
| C-5 | PA-5 §5.4 "exactly the two files" vs PR #102 also changing the IPD tracker (F-5). | A-Q3 | D2 scope wording |
| C-6 | 48-vs-47 entry count (O-2). | none for PA; operator host artifacts | no Table 1 dependents; non-blocking |
| C-7 | F-1 "typo in my base hash" explanation. Range `888eb375..a9cd18e8` verified; explanation not verified. | none; the anomaly is closed as to the range | none |

## 3. Gated-action register (operator-dependent and authority-gated; exact triggers)

No action in this table was taken in this pass.

| Action | Owner | Exact trigger (all must hold) | Current state |
|---|---|---|---|
| Host operations, A6 runtime, PF preflight, any PowerShell/pwsh, store probe | Operator under PA act | E10 PA capture-authorization act; E3 revision applied; E8/PF-10/E7/QP1 rulings; C-Q1/C-Q2 | not authorized; not started |
| CAP — P-1-C/P-1-D capture | Operator and PA | E10 act; E9 at invocation; PFREG; attempt session only | not started; NOT RENDERED |
| MF — Matter F acceptance of attempt evidence | PA | CAP completed (attempt only) | not applicable before the attempt |
| S2-ORIG — original host bytes and 47-entry verification output | Operator (retrieval); PA (scope) | Operator supplies; PA scope if required by Q-S2-1 | awaiting operator; **no Table 1 dependents** |
| Gate 4 S2 Limb A native canonical `npm test` | Operator (run) and PA (route) | Q-S2-2 answered by PA (route (a), (b) or (c)) | NOT STARTED |
| P-1 authorization act (P1-F) | PA | P1-C established; P1-D verified for the attempt; B-DESIG; DA-A1; L2a; L2c; all gates | not started; **P-1 NOT AUTHORIZED** |
| P1-EXEC — P-1 provisioning on desktop-no0nhtp | Operator and PA | P1-F; A-GAP1; S2a; DA-A1 | blocked |
| S3, QE-1–11, DQ-4 (criteria 7–8 NOT MET; 8/10), Gate 4 (G4-S2, G4-S2A, L2a/L2c), Gate 5 | PA and Operator | the rows in §2 and PA package Table 1, per group | blocked; no movement |
| IPD writes (IPD-S1, A-IPD, IPD-C2, IPD-S2REC if required, IPD-DIST) | IPD owner under a separate IPD prompt | A-Q5 (A-IPD); B-Q1 (IPD-C2); PA direction (IPD-S2REC); separate authorization (IPD-DIST) | IRR does not write IPD; IPD-DIST reported complete by IPD (PR #106, "under the prior pass's authorization" — IPD's statement, not re-verified here) |
| PR #353 merge | Separate merge authorization | Not requested in this pass; repository protection could not be read (HTTP 403 with this token) | OPEN; not merged |
| PF-11 `92d931fb…` diagnosis | PA request | PA request naming PF-11 diagnosis | NOT PASSED, undiagnosed; not requested |

## 4. Prepared change scope for IRR-owned revisions (NOT APPLIED)

The procedure `IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md` (blob `9aae3657`) is governance text. It is not edited in this pass. The scope below records what a revision would touch once the named ruling is made. Each item is applied only after its trigger.

| Revision | Procedure / instrument locations (verified on `main`) | Trigger | Scope limit |
|---|---|---|---|
| E8 root | lines 131, 150 (`$EvidenceParent`), 154 (local fixed NTFS check for `D:`), 167 (sync-client attestation), 193 (`$EvidenceRoot`), 440 (Read-Host text), 486 (expected output directory) | E8 PA-named root in writing; collision check against F4 and F5 | only the PA-named root literal and the checks that name the root |
| PF-10 wildcard | line 147 (`GATE_A_PRIME_*` wildcard) and instrument v2 four-flag check | PF-10 ruling | narrow to four named flags, or keep wildcard with new instrument identity (own validation) |
| E7 harness | §4.3a line 172 | E7 ruling | PA states which governs; procedure text follows the ruling |
| D-INST instrument revision | instrument v2 identity `191f5828` / SHA-256 `13783385` (E4, current sole identity) | D-Q = D-2 and A6 runtime before use | new identity under DB-B1; no change to v2 in place |
| S2-IRRDOC pointers | S2 reconciliation record and tracker | Q-S2-1 and Q-S2-2 rulings | dated pointer only; no in-place rewrite of the S2 acceptance record (`8eee2957`) |
| E3 overall revision | procedure as a whole | C-Q2, D-Q, E7, E8, PF-10, B-Q1, A-Q6 all ruled | applied after all listed rulings |

Note: the procedure's line 131 already carries the text "Under revision 2026-10-28, run §4.3a first". That existing text is not changed by this addendum.

## 5. Status vocabulary used in this addendum

- *complete/verified* — checked this pass against the named ref, with evidence.
- *carried* — recorded in an earlier record, not re-verified in this pass.
- *awaiting PA* / *awaiting operator* / *blocked* / *not started* / *not applicable* — as in PA package Table 1.
- *NOT ESTABLISHED*, *NOT PASSED*, *NOT AUTHORIZED*, *NOT RENDERED* — as recorded; none is changed here.

P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

*End of Addendum 1 as first issued (sections 1–5). Section 6 (post-adoption reconciliation, `CV-CORR-155`) follows. Neither part makes a PA decision or supersedes the PA package.*

## 6. Post-adoption reconciliation (`CV-CORR-155`; status only; no new PA decision)

Added after the formal adoption records were re-read on IRR `main` `82b3f4a5`. Sections 1–5 are unchanged. Evidence: `evidence/integration/cap03-decision-reconciliation-2026-10-28/` (`01`–`04`; row-level table `02-row-reconciliation.tsv`, generated and count-checked by `build_row_reconciliation.py`).

### 6.1 Formal decisions reconciled against their records

| Decision | Authoritative record (blob on IRR `main`) | Status on the record | Reflected in IRR records this pass | Still open |
|---|---|---|---|---|
| **DA-A1** execution-pin reading for the successor act | Adoption record `b39d047e` section 1 | **ADOPTED**, limited to its stated scope | Procedure PF-08 expectation `001c3c80` is unchanged and consistent | A P-1 authorization act must name the execution commit; no P-1 authorization |
| **DB-B1** capture-instrument identity (v2) | Adoption record section 1 | **ADOPTED** | Procedure lines 82–83 and 257 carry `191f5828…` / `13783385…` / 10,990 bytes (verified, `04`) | None for DB-B1. Capture still NOT AUTHORIZED |
| **DC-C2** native-harness prerequisite, next capture only | Adoption record section 1 | **ADOPTED**, next capture only | Procedure section 4.3a (line 172) (verified) | Whether a subsequent capture needs the native run (E7 residual). V1102 OPEN |
| **PA-1** H-12 not a P-1 provisioning prerequisite; terminology | Formal record `3098fb09` section 3 | **ADOPTED** | Procedure has **0** occurrences of "host preflight" (verified). New text uses "P-1-C/P-1-D capture" | None |
| **PA-2** purpose-specific pinning model | Formal record section 4 | **MODEL ADOPTED; NO PIN DESIGNATED** | R1/R2 purpose split recorded; no pin changed; procedure PF-08 unchanged | G4-PIN (C-1/C-2/C-3, PA); B-DESIG; L2a designation |
| **PA-5** Option B (receipt records execution identity separately) | Formal record section 5 | **ADOPTED**; IPD implementation performed by IPD PRs #100–#102 (`CV-CORR-146`) | Receipt `executingCommit` present at candidate `a891802e` (verified, `03`) | Retrospective scope question C-5; any designation (PA) |
| **PA-3d** diagnostics deferred; DC-C2 retained | Formal record section 6 | **ADOPTED (deferred)** | `CommandLine` and `PSModulePath` absent from procedure (verified). `$PID` appears only in the L-1 session check, which the adoption record (section 9.3) classifies as implementing an adopted requirement | Reconsider only on authorized host evidence. V1102 OPEN. PF-11 `92d931fb` NOT PASSED |
| **DQ-6b** Path A (interim, guarded) | DQ-6b act `b41c76f7` | **EFFECTIVE**: six of six elements complete in both loci, per IRR tracker section 16.122 series and IPD tracker (IPD PR #92; mirror receipt on IPD `main`) | Existing IRR record already shows criterion 5 MET; no change needed here | DQ-4 freeze remains NOT ESTABLISHED (criteria 7 and 8 NOT MET) |
| **H-12 R5** adoption | R5 adoption act (2026-10-25) | **ADOPTED** (on its face; effective on publication, CI and read-back as the act states) | Criterion 6 MET in existing IRR record; not re-verified here | H-12 regeneration at a designated commit (S2a) |
| **PF-15** corrected act `-02` (`3fe9a2dd`) | Corrected act `-02` | **EFFECTIVE**; P-1-E SATISFIED | Operative F2/F4/F5 values are those of `-02` (table 5.7; code-span equality verified in PR #352 pass) | Whether PA confirms the values or issues a further act (Q-P1). Premise of a `-01` transcription defect not reproduced; not verified |
| **S2 candidate-scoped disposition** (PA direction 2026-10-26) | Disposition `521d5482` (section 16.143) | **OPERATIVE BASIS ADOPTED**: `001c3c80` / `399fa44a`, candidate-scoped | P-1-A recorded as SATISFIED (candidate-scoped) | Whether R-1 is an absolute prerequisite; D1; PASS status; R-2 register direction (see 6.3) |

### 6.2 Table 1 status corrections (factual; from `02-row-reconciliation.tsv`)

Changed status (from PA package Table 1): **R-02** not started to complete/verified; **DA-A1** implemented to adopted; **IPD-S2REC** disputed to complete (IPD-side; PA direction only if required); **E3** not started to partially applied; **E7** narrowed (next-capture replacement adopted); **Q-S2-1** narrowed (candidate-scoped operative basis adopted; the remainder is PA-reserved); **Q-S2-2** disputed to awaiting PA (Limb A OUTSTANDING, no route adopted); **DQ4** pending to blocked (8/10 criteria met; freeze not established); **G4-PIN** to awaiting PA with its trigger met (6.3); **QP1** values recorded in effective act `-02`, PA confirmation still not recorded; **P1-C** pending to operator (NOT ESTABLISHED); **P1-D** pending to operator (DESIGNATED, NOT VERIFIED FOR THE ATTEMPT).

The 77-row distribution after this pass: COMPLETE 10; AWAIT-PA 33; AWAIT-OPERATOR 9; TECH-BLOCKED 19; SEPARATE-ACT 4 (all IPD-owned: A-IPD, IPD-C2, IPD-DIST, IPD-S1); CLOSED 2 (MF not applicable before attempt; P1-B superseded).

### 6.3 Q-S2-1 premise correction (factual)

Section 5.1 of the PA package states that the record "does not specify" a clearing condition for R-2. The acceptance record's residual table (`8eee2957`, section 5, row `R-2`) does specify one: "original bytes supplied, or PA accepts the corroborating transcript". Per the PR #353 reconciliation record section 3.5, the archive original's SHA-256 equals `3FD31FE6…`. The condition is therefore met on the record's own terms. **The register update itself is not applied in this pass** because it awaits the PA direction on Q-S2-1 (as the directive requires). Option (c) of Q-S2-1 is narrowed accordingly; it is not thereby decided.

### 6.4 G4-PIN decision item (prepared; NOT decided; trigger met)

**Trigger.** Formal record section 8 returns the Gate 4 QE/H-12 pin choice "after `C′` exists". `C′` is the post-correction commit. The receipt correction is present at IPD `a891802e` (PR #100 merge; ancestor of IPD `main`; executing identity fields present; `03`). The trigger is therefore **met**. The formal record also says `C′` is not designated by existence, and that designation needs a separate PA act and the evidence in 6.5. Recency is not a basis; later IPD commits are not evaluated here.

**Choices, exactly as the formal record states them (section 4.5; none made):**
- **C-1:** Accept the post-binding commit `C′` (or `001c3c80` if it becomes the execution pin) as the Gate 4 QE/H-12 content pin, with express scope acceptance of the non-Limb-A content, and regenerate H-12 at that commit.
- **C-2:** Require a Limb A-only QE commit. This requires new IPD implementation authority and a new pin, and is **not authorized** by the record.
- **C-3:** Keep the Gate 4 QE/H-12 pin undesignated until the CAP-03 chain has produced `C′`, and decide C-1 or C-2 then. (The `C′`-exists condition of C-3 is now met; the choice between C-1 and C-2 remains open.)

**Facts the choice rests on (formal record 4.5, carried; verified where stated).** `a52b47b0` is pre-binding (identity constants null). The binding `f9ec0c5` is non-documentary drift requiring express re-designation under Gate 4 section 3.2(4). `001c3c80` carries DR-2 Option A, the S2 fix, and other content outside the Gate 4 Limb A boundary. Between `001c3c80` and `a891802e` (verified): 19 commits; non-evidence paths changed are exactly `src/persistence/gateAPrimeProvisioning.ts` and `tests/g3_gate_a_prime_successor_provisioning.test.ts` (the PA-5 authorized files); 60 evidence paths also changed.

### 6.5 Designation prerequisites (formal record 4.6), status after this pass

| Step | Requirement | Status |
|---|---|---|
| 1 | Commit exists on IPD `main` with exact-head and post-merge CI | `a891802e` exists and is an ancestor of IPD `main`. CI results recorded in the formal record's post-D2 pointer (`40639983508`, `40640127958`; carried, not re-run) |
| 2 | Delta classified (in or out of scope for the purpose) | **PARTIAL.** Non-evidence set (2 files) is within the PA-5 authorized scope. The 60 evidence paths are not individually classified. OPEN |
| 3 | Designated tests run at the candidate (Linux CI; native Windows where the act requires) | **OPEN** for `a891802e`. Not verified in this pass |
| 4 | Separate PA designation act naming commit, tree and blobs | **NOT MADE** |
| 5 | Fresh S2 at `C′` (L2a) and H-12 regeneration (L2c) at that commit | **NOT STARTED** |
| 6 | Receipt, designation and evidence reference the same identities | **NOT APPLICABLE YET** |

Tree identities for reference only (not a basis for choice): `001c3c80` tree `399fa44a`; `a891802e` tree `76f083d7`; IPD `main` `1ba0740a` tree `b3fde03a`.

### 6.6 Gated actions

No change to section 3. Operator-dependent and PA-reserved actions remain as listed there. Specifically: no host run, A6 runtime, PowerShell run, capture, P-1 authorization or execution, S3, QE, DQ4 freeze, Gate 4 or Gate 5 action; no PR #353 merge.

### 6.7 Non-grants and status

No PA decision, adoption, designation, pin change, acceptance, or signature was made or inferred in this section. Recording an adopted decision here reports the status shown on its own authoritative record and does not create authority. No IPD write. No change to `BASIS_COMMIT` or `BASIS_TREE`.

P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

## 7. Consolidated PA sitting packet and post-ruling execution manifest (`CV-CORR-156`; no new PA decision)

Added after IRR `main` `82b3f4a5` and the session branch / PR #353 head `fb7d3088` were re-verified. Sections 1–6 are unchanged. Corrections below are pointers; no historical text was edited. Evidence: `evidence/integration/cap03-ruling-sitting-packet-2026-10-28/` — `01` decision register (one row per PA item, 17 fields), `02` validation output, `03` IPD evidence-path inventory, `04` designated-blob check, `05` remote verification, `06` recommendations (43 rows: the 36 register items plus conflicts C-1 to C-7; each row is a recommendation or an explicit PA choice, none adopted, and Table 1 is unchanged), `build_sitting_checks.py`, `SHA256SUMS.txt`. The register is the packet's source for options, evidence, dependencies and eligibility. The 77-row Table 1 (`cap03-decision-reconciliation-2026-10-28/02-row-reconciliation.tsv`) remains the row register of record.

This section makes no PA decision, chooses no option, designates no commit or pin, grants no authority, records no acceptance, and takes no host, PowerShell, capture, store, or P-1 action.

P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

### 7.0 Conventions and verified refs

- **Refs verified this pass (live, read only).** IRR `main` `82b3f4a5d31134e40fd3a1a23169a0ca8d638dfc`. IRR session branch and PR #353 head `fb7d3088bc7af2ceef3141c017f33f8cbc4c1c28`; PR #353 is OPEN, not draft, not merged, and the only open IRR PR. IPD `main` `1ba0740a32e69284d7c524fd6ac8daf5455038d0`; 0 open IPD PRs. C′ candidate `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` is an ancestor of IPD `main`. Detail: `05-remote-verification.txt`.
- **Label aliases (this section only; none is a decision; Q-N1 stays PA-reserved).** Matter C options are MC-1, MC-2, MC-3 (packet §5.4 C-1…C-3). G4-PIN options are G4P-1, G4P-2, G4P-3 (formal record §4.5 C-1…C-3). Conflicts keep C-1…C-7 (§2). The three "D1" labels are kept apart: S2 D1 (package), ADP-D1 (adoption record §3 D1), and FRM-D1 (formal record §8 D1-C; FRM-D1C is the IPD row 7 citation item).
- **Register items that Table 1 does not carry.** ADP-D1 and ADP-D2 come from adoption record §2 rows 1–2 and §3 D1–D2, each marked OPEN for the PA in its source. FRM-D1C comes from formal record §8 (IPD-owned). They are source-established and are not new decisions. Table 1 itself is not edited.

### 7.1 Corrections and factual findings (pointers; no historical text edited)

1. **C-2 re-verified.** Act §2.1 items 10 and 12 do not match at `1ba0740a`. Item 10 (`src/persistence/portfolio_store.ts`): designated `4a005b73`, observed `540d49f2`. Item 12 (`tests/g3_startup_validation.test.ts`): designated `9a5fd9e3`, observed `edd0305e`. Items 1–9 and 11 match, so 10 of 12 match (`04`). The S1 determination §12.2 statement ("12/12" identical) does not reproduce against the act.
2. **Package F-5 correction (pointer).** Package §6 F-5 says PR #102 "changed the IPD tracker as well as the two code files". Verified: PR #102 (`a9cd18e8`, first parent `db84ac12`) changed only `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`. The two code files were changed by PR #100 (`a891802e`, against its first parent `888eb375`) and by PR #101 (`db84ac12`, against its first parent `a891802e`). The F-5 attribution came from a cumulative range. The PA-5 wording "exactly the two files" (§5.4) therefore remains an open scope question (A-Q3), and this section does not decide it.
3. **Formal record post-D2 pointer.** Its statement that "PR #102 changed only the IPD tracker" is correct against PR #102's first parent (item 2). It is not in conflict with this correction.
4. **Addendum §2 A-GAP1 quotation (pointer).** The text "BLOCKED — identity values unresolved" in §2 is a paraphrase. The verbatim Gate 4 act §6 row S1 (IPD `1ba0740a`) reads: "**BLOCKED** — successor act effective, but its identity values are **unresolved** (successor act §4) and no store exists." The S1 determination §12.2 (IPD `1ba0740a`) reads "`12/12` of the successor act §2.1 paths resolve as designated" and lists `tests/g3_startup_validation.test.ts` at `edd0305e`.
5. **Formal §4.6 step 2 scope (factual).** Step 2 requires classification of "the non-evidence changed-path list". Read literally, the 60 evidence paths fall outside step 2. The directive keeps the classification of the 60 evidence paths as an explicit prerequisite to designation. This section does not decide whether the literal text or the directive governs. The question is folded into A-Q3.
6. **The 60 evidence paths (factual inventory; not a classification).** Between `001c3c80` and `a891802e` there are 60 evidence-path changes: 59 added and 1 modified. All 60 were introduced by 8 of the 17 commits in `001c3c80..888eb375`, which precede the verified D2 baseline `888eb375`. The D2 range `888eb375..a891802e` (2 commits) changes no evidence path. By type: 9 documentary, 35 text records, 6 JSON, 4 `.py`, 4 checksum lists, 1 patch, 1 extensionless checksum list. The non-evidence delta for the same endpoints is exactly the two PA-5 files. Detail: `03`.
7. **Superseded as current (historical records kept).** Package §4.2 identities (IRR `9130dead`, IPD `0616ba2d`) are superseded as current by the values above and remain historical.
8. **Table 1 unchanged.** The 77-row register is not edited in this pass. ADP-D1, ADP-D2 and FRM-D1C are carried in register `01` and in this section.

### 7.2 Sitting structure and dependency order

- **Sitting 1 — independent of S2 and of host work (16 items).** Order as listed: A-Q1 → A-Q2 (after A-Q1, Table 1 dependency) → A-Q3 → A-Q4 → A-GAP1 → ADP-D1 → ADP-D2 → B-Q4 → B-Q6 → C-Q1 → D-Q → QP1 → E8 (after QP1) → E7 → PF10 → Q-N1.
- **Sitting 2 — S2 (5 items; independent of Sitting 1; both sittings must precede B-Q1).** Q-S2-1 and Q-S2-2 are independent of each other; Q-B5 follows both. G4-S2 is the Limb A route (PA) and the native run (operator); the run follows the route. S2-IRRDOC is IRR-owned and follows Q-S2-1 and Q-S2-2.
- **Sitting 3 — sequenced chains (14 items; after Sittings 1 and 2).** A-Q5 → A-Q6 → B-Q1 → B-Q2 (only if B-0) or B-Q3 (only if B-1) → B-DESIG. G4-PIN follows B-Q1 as Table 1 states (see note). C-Q2 follows C-Q1, and its commit-keyed items follow B-Q1. E3 (IRR) follows its listed rulings. D-INST is conditional on D-Q = D-2. IRR-PROC follows E3's ruling set. E10 follows E3. P1-F and L2B follow their listed conditions.
- **Parallel work.** Sittings 1 and 2 may be taken in one sitting. Host and operator work (E5, E6, PF-11D, PFREG, E9, CAP, P1-C, P1-D, S2-ORIG, and the Gate 4 Limb A run) runs in no sitting. Each is gated as §7.4 and §7.5 state.
- **Note G4-PIN ordering.** Table 1 lists a dependency on B-Q1. Formal record §4.5 states, in substance (paraphrase), that the Gate 4 choice is not a side effect of B-1. The register follows Table 1. PA should confirm whether G4-PIN may be taken in Sitting 1, with only Q-N1 and the met C′ condition as prerequisites.
- **Note C-Q2 ordering.** Table 1 splits C-Q2 into commit-independent observations, which may come earlier, and commit-keyed observations, which follow B-Q1. The register keeps the whole item in Sitting 3.

### 7.3 Decision index (generated from register `01`; full fields there)

Columns: item, sitting and order, status, readiness, owner, depends on, question, options as recorded. Options are as the governing record states them. IRR recommends none.

| Item | Sitting · order | Status | Readiness | Owner | Depends on | Question | Options as recorded |
|---|---|---|---|---|---|---|---|
| A-Q1 | 1 · 1 | unresolved | ready | PA | none | Is DR-2 a "further act" for item 10 (portfolio_store.ts) under act s.5.1/s.8.2? | yes / no |
| A-Q2 | 1 · 2 | unresolved | ready | PA | A-Q1 | Which blob is designated for item 12 (tests/g3_startup_validation.test.ts), and what is the item-10 position? | designate 9a5fd9e3 / designate edd0305e; item-10 position per mechanisms A-O2..A-O5 (package s.5.2) |
| A-Q3 | 1 · 3 | unresolved | ready | PA | none | Is act s.5.1 "exhaustive" repository-wide or workstream-scoped? | repository-wide (out-of-set paths then need authorizing records) / workstream-scoped |
| A-Q4 | 1 · 4 | unresolved | ready-with-gap | PA | none | Do the two PR #96 paths need an authorizing act, and does aa43dec2 documentation satisfy it? | yes / no (question as recorded); no further option set is recorded |
| A-GAP1 | 1 · 5 | unresolved (authority gap) | ready | PA | none | Which S1 status text governs? | (a) Gate 4 act s.6 row S1 governs / (b) S1 determination s.12.2 governs |
| ADP-D1 | 1 · 6 | unresolved | ready-with-gap | PA | none | Which artifact is "the final execution commit", does it belong to the P-1 chain or the QE/Gate 4 chain, and must a manifest be regenerated at it before P-1? | none recorded: the adoption record states "Not resolved by this record; OPEN for the PA" |
| ADP-D2 | 1 · 7 | unresolved (open per record) | ready | PA | EXT:C-prime-exists (MET: a891802e) | Does the PA accept the provisioning receipt content as implemented (executingCommit and executingTree beside basisCommit and basisTree), or amend the act? | (a) accept receipt content / (b) amend the act (adoption record s.2 row 2) |
| B-Q4 | 1 · 8 | unresolved | ready | PA | none | Does H-12 regeneration gate L2a? | yes / no |
| B-Q6 | 1 · 9 | unresolved | ready | PA | none | Is aa43dec2 eligible as a Matter B candidate at all? | eligible / not eligible |
| C-Q1 | 1 · 10 | unresolved | ready-with-gap | PA (fact) or operator confirmation as PA scopes | none | Is the A6 runtime commit-independent? (Source does not state it.) | answer from source / PA scopes an operator confirmation (as recorded) |
| D-Q | 1 · 11 | unresolved | ready | PA | none | (1) Object of the criterion: the store parent C:\iips-data\iips, or the store path (which must not exist). (2) Method D-1, D-2, D-3 or D-4. | object: store parent / store path; method: D-1 ACL inspection sufficient / D-2 published non-mutating effective-rights check in a new instrument revision / D-3 create-and-remove sentinel (express authorization) / D-4 historical REV2 probe (not recommended as sole evidence) |
| QP1 | 1 · 12 | unresolved | ready | PA | none | Confirm the approved byte-level PF-15 literals F2 (31 bytes), F4 (39 bytes) and F5 (28 bytes) as recorded in the act -02 code spans (values not re-typed in this packet; see package s.5.7 for the recorded backslash counts). | confirm / further act with different values |
| E8 | 1 · 13 | unresolved | ready-with-gap | PA (root named in writing) | QP1 | Root path for the capture. | a PA-named root only (no option set recorded; must not collide with F4 or F5) |
| E7 | 1 · 14 | unresolved | ready | PA | none | Does DC-C2 replace the native PowerShell 5.1 harness prerequisite for the next attempt only, or does a subsequent capture still need the native run? | replace / supplement (for the stated scope) |
| PF10 | 1 · 15 | unresolved | ready | PA | none | Procedure line 147 checks the GATE_A_PRIME_* wildcard; instrument v2 checks four named flags. Narrow the procedure to the four named flags, or keep the wildcard and change the instrument? | narrow to four named flags / keep wildcard plus new instrument (new identity; own validation) |
| Q-N1 | 1 · 16 | unresolved | ready | PA | none | Adopt the labels in packet s.16.7 N-1 (C-1/C-2/C-3 for Matter C options and for Gate 4 pin choices), or name the options otherwise. PF-11 and Limb A collisions (packet s.11) may be included. | adopt / name otherwise |
| Q-S2-1 | 2 · 17 | unresolved | ready | PA | none | (a) Does candidate-scoped acceptance stand with R-1 not an absolute prerequisite? (b) Is R-1 held absolute? (c) R-2 clearing condition as ruled; D1 closed or open; PASS user-reported or open; register direction. | (a) / (b); R-2 condition as ruled; D1 closed / open; PASS user-reported / open |
| Q-S2-2 | 2 · 18 | unresolved | ready | PA (route); operator (native run) | none | Does the 924/920/0/4 run at 001c3c80 satisfy Gate 4 S2 Limb A? If not, which route? | (a) yes, by express PA act / (b) no: native canonical npm test at the Gate 4 commit under the Gate 4 authority / (c) PA designates the Gate 4 commit by separate act, then the native run (derived from Gate 4 s.6 and packet s.4.6; the packet does not state (c)) |
| Q-B5 | 2 · 19 | unresolved | ready-after-dep | PA | Q-S2-1; Q-S2-2 | Which "S2" does each requirement refer to? (Four uses catalogued at packet s.16.7 N-2.) | labels as PA states them |
| G4-S2 | 2 · 20 | dependent | dependent-on-ruling | PA (route); operator (native run) | Q-S2-2 | Limb A S2 acceptance run (not a PA question; PA owns the route). | per Q-S2-2 route |
| S2-IRRDOC | 2 · 21 | not yet eligible | not-applicable | IRR | Q-S2-1; Q-S2-2 | Apply the S2 pointers and R-2 register update. | n/a (application of rulings) |
| A-Q5 | 3 · 22 | not yet eligible | not-applicable | PA (mechanism); IPD (act, separate prompt) | A-Q1; A-Q2; A-Q3; A-Q4 | Mechanism and named commit for the Matter A designation change. | A-O3 amended designated list by IPD act naming observed blobs at a named commit / A-O4 fresh IPD act superseding act s.2.1 and s.5.1 / A-O5 IPD code change restoring designated blobs |
| A-Q6 | 3 · 23 | not yet eligible | not-applicable | PA | A-Q5 | Is the act s.8.2 stop cleared by A-Q1 to A-Q5, or does execution need a fresh designation first? | cleared / fresh designation first |
| B-Q1 | 3 · 24 | not yet eligible | not-applicable | PA | A-Q1; A-Q6; B-Q4; B-Q6; Q-S2-1; Q-S2-2 | Matter B: one choice. | B-0 retain 001c3c80 as P-1 coordinate (attempt records no executing identity; receipt element needs waiver or deferral) / B-1 designate one D2 commit or a later C-prime (after Matter A; needs fresh S2 and H-12 there unless B-Q4 says otherwise) / B-2 defer until IPD reports C-prime |
| B-Q2 | 3 · 25 | conditional (B-Q1 = B-0) | not-applicable | PA | B-Q1 = B-0 | If B-0: waive or defer the DA-A1 receipt element; head 001c3c80 or merge 1e76f4cf. | waive / defer; head 001c3c80 / merge 1e76f4cf |
| B-Q3 | 3 · 26 | conditional (B-Q1 = B-1) | not-applicable | PA | B-Q1 = B-1; A-Q1 to A-Q6 | If B-1: commit and tree. a52b47b0 and c62dee81 share tree 1467802e and are NOT interchangeable by tree equivalence. | commit and tree as named by PA |
| B-DESIG | 3 · 27 | not yet eligible | not-applicable | PA | B-Q3 (if B-1) | Designation act for the B-1 commit, if chosen. | designate / do not designate (per B-Q1) |
| G4-PIN | 3 · 28 | unresolved (trigger met) | ready-with-gap | PA | EXT:C-prime-exists (MET); Q-N1; B-Q1 (per Table 1, see note) | Gate 4 QE/H-12 content pin: which option? | G4P-1 (= formal C-1): accept C-prime (or 001c3c80 if it becomes the execution pin) as QE/H-12 content pin with express scope acceptance of non-Limb-A content, and regenerate H-12 there / G4P-2 (= formal C-2): Limb A-only QE commit; requires new IPD implementation authority and a new pin (not authorized by the record) / G4P-3 (= formal C-3): keep undesignated until C-prime exists (met) and decide G4P-1 or G4P-2 then |
| L2B | 3 · 29 | not yet eligible | not-applicable | PA (only if required) | none | Is any L2b action required? (Table 1: "PA if required".) | no action required / action required (scope to be stated) |
| C-Q2 | 3 · 30 | conditional (after C-Q1; commit-keyed items after B-Q1) | not-applicable | PA | C-Q1; B-Q1 (for commit-keyed items) | Are pre-attempt observations preparatory and re-observed in the attempt? Choose the Matter C option. | MC-1 (= packet C-1): no host contact before designation and capture authorization / MC-2 (= packet C-2): commit-independent host qualification first (A6, DC-a, DC-b under their own authorization); commit-keyed observations and store contact only in the attempt session / MC-3 (= packet C-3): as MC-2, plus read-only F4 and root observations before the attempt, recorded as preparatory |
| E3 | 3 · 31 | partially applied (revisions 2026-10-28, b, c) | not-applicable | IRR (revision); PA (rulings) | C-Q2; D-Q; E7; E8; PF10; B-Q1; A-Q6; QP1 | Apply the remaining procedure revision (PF-10, root, pins, acceptance text). | n/a (application of rulings) |
| D-INST | 3 · 32 | conditional (D-Q = D-2) | not-applicable | IRR (instrument revision); PA (D-2) | D-Q (= D-2); A6 runtime before use | Successor instrument for D-2 (non-mutating effective-rights check). | not applicable unless D-2 |
| IRR-PROC | 3 · 33 | not yet eligible | not-applicable | IRR | C-Q2; D-Q; E7; E8; PF10; B-Q1; A-Q6; QP1 (same set as E3) | Procedure text change only where a ruling requires it. | n/a |
| E10 | 3 · 34 | not yet eligible | not-applicable | PA | B-Q1; A-Q6; E3; E7; E8; PF10; C-Q2; D-Q; QP1 | Render the capture-authorization act. | not rendered (no option set; PA drafts the act) |
| P1-F | 3 · 35 | not yet eligible | not-applicable | PA | P1-C (operator); P1-D verified for the attempt (operator); B-DESIG; L2a; L2c; ADP-D1; ADP-D2; A-GAP1; S2a (H-12 adoption) | Render the P-1 authorization act. | not rendered |
| FRM-D1C | IPD · 36 | unresolved (IPD-owned) | not-applicable | IPD (separate IPD prompt) | none | Correct the IPD row 7 citation. | n/a (IPD-owned correction) |

Readiness counts (register values): ready 14 (A-Q1, A-Q2, A-Q3, A-GAP1, ADP-D2, B-Q4, B-Q6, D-Q, QP1, E7, PF10, Q-N1, Q-S2-1, Q-S2-2). Ready with a stated evidence gap 5 (A-Q4 carried; ADP-D1 has no options recorded; C-Q1 needs a source fact; E8 needs a PA-named root; G4-PIN choice only, designation not eligible). Ready after a dependency 1 (Q-B5). Dependent 1 (G4-S2). Not yet eligible, conditional, or non-PA 15 (14 items plus FRM-D1C, which is IPD-owned).

### 7.4 Post-ruling execution manifest (dependency-ordered; nothing executed in this pass)

**IRR batch (IRR writes only; each step runs only when its trigger is recorded).**

| Step | Trigger (all must hold) | Owner | Action | Evidence to update |
|---|---|---|---|---|
| I-1 | Q-S2-1 direction recorded | IRR | S2-IRRDOC: dated pointers and the R-2 register update. Acceptance `8eee2957` is not rewritten in place. | S2 reconciliation record (pointer); tracker |
| I-2 | Q-S2-2 outcome recorded | IRR | Record the route and update the Gate 4 S2 status by pointer only. | tracker; Table 1 pointer |
| I-3 | Each ruling recorded | IRR | Update register `01`, regenerate `02`, rerun the checker (V1–V5), re-hash `SHA256SUMS`. | `01`, `02`, `SHA256SUMS`, tracker |
| I-4 | C-Q2, D-Q, E7, E8, PF10, B-Q1, A-Q6 and QP1 all recorded | IRR | E3 procedure revision: PF-10 narrowing or keep; E8 root literals; E7 text; C-Q2 and D-Q text. No change to `BASIS_COMMIT`, `BASIS_TREE` or any pin. | procedure revision block; tracker |
| I-5 | D-Q = D-2 and A6 runtime established before use | IRR | D-INST: new instrument identity under DB-B1. Instrument v2 is not changed in place. | procedure instrument identity; tracker |
| I-6 | A ruling requires a text change | IRR | IRR-PROC: make only that change. | procedure; tracker |
| I-7 | PA designation act names commit, tree, blobs and purpose; formal §4.6 steps 2, 3 and 5 closed | IRR records; IPD and operator run | Record the designation receipt. Re-verify R2 at H-12 regeneration. Update procedure PF-08 only by a later revision. | tracker; procedure revision |
| I-8 | E3 applied and PA renders the E10 act | IRR records; PA renders | Record the E10 receipt. IRR takes no host action. | tracker |

**IPD batch (no IRR write. Each item runs only through a separate IPD prompt after its trigger is recorded. No IPD prompt is created now, because no trigger is recorded. Labels I-n and P-n are labels of this manifest, not register IDs; the Trigger column names the register IDs.)**

| Step | Trigger | Owner | Action | Note |
|---|---|---|---|---|
| P-1 A-IPD | A-Q5 mechanism chosen (A-O3, A-O4 or A-O5) | IPD | IPD act or code change as PA names | IRR does not amend the act |
| P-2 IPD-C2 | B-Q1 chosen; scope per Table 1 | IPD | Per Table 1 row | separate IPD prompt |
| P-3 IPD-S1 | A-Q2 and A-GAP1 recorded | IPD | Correct S1 determination §12.2 wording if PA directs | separate IPD prompt |
| P-5 FRM-D1C | Separate IPD authority | IPD | Correct the IPD row 7 citation | separate IPD prompt |

### 7.5 Gated actions by owner, and conflicts for PA

**Operator-owned (host, no action authorized now).** E5 (A6 runtime): trigger E10 act, E3 applied, E8, PF10, E7, QP1 and C-Q1/C-Q2 ruled. E6 DC-a and DC-b (V1102 OPEN): same trigger. PF-11D: only on a PA request (Table 1 row). PFREG and E9: E10 act and the attempt session. CAP: E10 act and E9 at invocation. P1-C: attempt-session raw bytes read back and accepted under PA capture authority. P1-D: verified for the attempt. S2-ORIG: operator-owned; scope set by the Q-S2-1 ruling. G4-S2 native run: after the Q-S2-2 route.

**PA-owned.** All register rows with owner PA, and the E10 and P1-F acts (not rendered).

**Blocked with no movement (Table 1, TECH-BLOCKED).** S3: S1 and S2a. QE-1 to QE-11: S3 and the Gate 4 chain, plus native-Windows evidence (CI is not a substitute). DQ4: criteria 7 and 8 NOT MET; 8 of 10 met. G4-S2A, L2A, L2C: their prerequisites in the register. G5-ADM: P1-EXEC, S2a, Gate 4 Limb A, QE, Gate 4 acceptance. P1-EXEC: P1-F, A-GAP1, S2a. FINAL: after all groups.

**PR #353 merge.** Separate merge authorization is required and is NOT established. Branch protection could not be read (HTTP 403 with this token). PR #353 is not merged.

**Conflicts (recorded, not resolved; verbatim where quoted).**

- **C-1 (formal acceptance wording).** Keep distinct: formal package-consumer acceptance, candidate-scoped acceptance (`8eee2957`), P-1 admissibility, and Gate 4 S2 Limb A. Q-S2-1 decides R-1 only. No interpretation is adopted by inference.
- **C-2 (designated blobs).** Designated versus observed at `1ba0740a`: `src/persistence/portfolio_store.ts` `4a005b73` versus `540d49f2`; `tests/g3_startup_validation.test.ts` `9a5fd9e3` versus `edd0305e`. Re-verified (`04`). Minimum decision: A-Q2 and the item-10 position. Not accepted without authority, and not changed in IPD by IRR.
- **C-3 (Gate 4 status text).** Four statements, not reconciled. (i) IRR tracker on `main`, CV-20 row (line 1215) and User Portfolio row (line 2686): "Gate 4 (`QE-1…QE-11`) … remain NOT AUTHORIZED / NOT ACCEPTED". (ii) IRR tracker on `main`, U3 row (line 10860): "BLOCKED — AUTHORIZED, NOT STARTED". (iii) IPD unified reconciliation at `1ba0740a` (line 197): "PC — AUTHORIZED, NOT STARTED; QE `0/11`". (iv) Gate 4 act at `1ba0740a`, closing line: "Gate 4 is `AUTHORIZED — NOT STARTED`". PA confirms which text governs. No Gate 4 action is taken on any of them.
- **C-4 (S1 §12.2 versus act row 12).** S1 determination §12.2 says `12/12` resolve as designated and lists `edd0305e` for item 12. Act §2.1 row 12 designates `9a5fd9e3`. Consequence: any S1 step waits on A-GAP1, which decides the governing S1 text.
- **C-5 (PA-5 scope versus PR #102 and the evidence paths).** PA-5 §5.4 says "Changed-file list is exactly the two files in §5.2". Verified facts: the non-evidence delta is the two files (§7.1 items 2 and 6); the tracker change came from PR #102; 60 evidence paths also differ. Minimum decision: A-Q3.
- **C-6 (48-vs-47 entry count) and C-7 (F-1).** Unchanged. No Table 1 dependents. Non-blocking.
- **ADP-D2 (receipt semantics).** Adoption record: "P-1 cannot be authorized until the PA accepts the receipt content or the act is amended." Verified in code at `a891802e`: `executingCommit` and `executingTree` are present. Acceptance is not recorded.

### 7.6 Non-grants and boundary

No PA decision, adoption, designation, pin, acceptance, register update of a PA status, procedure edit, IPD write, merge, host action, PowerShell run, capture, store probe, S3, QE, DQ4 freeze, Gate 4 or Gate 5 movement, or P-1 authorization or execution is made or implied by this section. No change to `BASIS_COMMIT` or `BASIS_TREE`. No tests or builds were run: this pass changed documentation and evidence only, and `frontend/` is unchanged. The checks are the checker's structural, coverage, ordering and read-only IPD checks (`02`).

P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

*End of Addendum 1 section 7 (`CV-CORR-156`). It is the consolidated sitting packet. The package and Addendum 1 sections 1–6 remain as written, with the pointers above.*
