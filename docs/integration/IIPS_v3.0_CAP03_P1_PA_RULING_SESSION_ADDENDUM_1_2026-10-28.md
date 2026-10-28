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

*End of Addendum 1. It records options as the governing record defines them, verified deltas, and triggers. It makes no PA decision and does not supersede the PA package.*
