# CAP-03 PA ruling-session package — PA ruling preparation only (2026-10-28)

**Status of this document: PA ruling preparation only.** Read-only preparation for a Program Authority (PA) ruling session. It is not a PA decision, designation act, pin, execution authorization, capture authorization, or gate acceptance, and it grants no authority. It was prepared as a read-only investigation output and is published in IRR documentation under the routine documentation authorization; the publication record is tracker §16.171 (`CV-CORR-151`, `CHG-2026-10-28-15`). IPD was not written. "This pass" in §§1–7 refers to the read-only investigation pass; the publication pass is recorded in tracker §16.171.

**Required status (exact):** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

## 1. Identities and refs (verified this pass unless marked carried)

| Item | Identity | Basis |
|---|---|---|
| IRR `ramkivs/iips-review-recovered` `main` | `9130deadcdd929f6210a5e4275267f63afd07c3d` (PR #351 merge); tree `b4ad4d67d5ecc06823bc5a189b6eac6ac35d1a48` (carried) | `git ls-remote` this pass; open PRs 0 (`gh pr list`) |
| IPD `ramkivs/iips-production-market-data` `main` | `0616ba2d8466e0a6837ca06073b656486fc84f54` (PR #104 merge, `2026-10-28T08:22:41Z`); tree `731cd2c64e50b6fe50aa4ba07439cfc6eaded634` | `ls-remote` and `rev-parse` this pass; open PRs 0 |
| IPD runtime at `main` | `0616ba2d` runtime paths (`src`, `tests`, `scripts`, `package*.json`, `tsconfig`, `vite.config.ts`, `.github`) identical to `a9cd18e8` | `git diff --stat a9cd18e8..0616ba2d -- <paths>`: no output |
| Compiled basis (not an execution pin) | `5fc74085ade980846ff4a07b36415b6d49446486`; tree `7226ef0033b3a7049169d8fcf9bcbc9908e2590b` | Successor act §2; procedure line 127 |
| Candidate-scoped operative basis and P-1 coordinate | `001c3c80618f2ee1d40e9a90912237e1a06e7b58`; tree `399fa44a5f1953c0f61b452420fefb5985426ef1` | CV-CORR-123 §§2, 5 (carried) |
| IRR packet | `docs/integration/IIPS_v3.0_CAP03_P1C_P1D_PA_DECISION_PACKET_A-F_2026-10-28.md` blob `796e0c82` | `git ls-tree origin/main` this pass |
| IRR formal record | `docs/integration/IIPS_v3.0_CAP03_P1_PA_FORMAL_DECISION_RECORD_2026-10-28.md` blob `3098fb09` | same |
| PF-15 acts | `-02` blob `3fe9a2dd` (corrected, current); `-01` blob `cbd500a7` (corrected by `-02`; preserved) | `git rev-parse origin/main:<path>` |
| Successor act (IPD) | `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md`, blob `528de6ae` (carried) | IPD `0616ba2d` |

### 1.1 D2 PR chain (IPD, all merged; ancestry of `0616ba2d` verified this pass)

| PR | Head | Merge | Tree (merge) | Note |
|---|---|---|---|---|
| #100 (D2) | `f722d7d4` | `a891802e` (2026-10-28T05:48:27Z) | `76f083d7` | executing identity recorded separately from compiled basis; code change |
| #101 (D2 follow-up) | `d2782f23` | `db84ac12` (06:09:51Z) | `831f00e0` | bind executing identity to the executing repository; code change |
| #102 (designated-blob correction and D2 publication record) | `a58dbc42` | `a9cd18e8` (06:30:22Z) | `546c8cea` | IPD tracker documentation change; current IPD runtime reference |
| #103 (evidence-only) | `753017d2` | `aa43dec2` (07:44:32Z) | `244f87bf` | PR #96 record in IPD tracker; runtime same as `a9cd18e8` (carried) |
| #104 (evidence-only) | `f4f3343b` | `0616ba2d` (08:22:41Z) | `731cd2c6` | S2 47-file hash-verification record; current IPD main |

Diff facts verified this pass: `888eb375..a9cd18e8` changes `src/persistence/gateAPrimeProvisioning.ts`, `tests/g3_gate_a_prime_successor_provisioning.test.ts`, and `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`. No file is added under `src/`, `tests/` or `scripts/` in that range. `001c3c80..db84ac12`: 62 files changed, 2 of them runtime (carried figure, reconfirmed). The earlier empty result for the same range came from a mistyped base hash in my command, not from git; the anomaly recorded in the prior session memory is closed.

### 1.2 Candidate identities for Matter B (factual; no candidate is designated)

| Ref | Role | Tree | Ancestor of IPD `0616ba2d` | S2 evidence bound | Designation status |
|---|---|---|---|---|---|
| `5fc74085` | Compiled basis | `7226ef00` | Yes | n/a | Not an execution pin (procedure line 127) |
| `8eec74ae` | L2b IPD primary (carried) | `4eba2902` | Yes | No | L2b NOT ESTABLISHED (carried) |
| `001c3c80` | PR #96 head; DA-A1 coordinate | `399fa44a` | Yes | Yes (candidate-scoped, CV-CORR-123) | Candidate-scoped operative basis only |
| `1e76f4cf` | PR #96 merge on `main` | `7003a282` | Yes | No (S2 bound to head) | Not designated (B-F6) |
| `f722d7d4` / `a891802e` | PR #100 head / merge | `76f083d7` (both) | Yes | No | Not designated |
| `d2782f23` / `db84ac12` | PR #101 head / merge | `831f00e0` (both) | Yes | No | Not designated |
| `a58dbc42` / `a9cd18e8` | PR #102 head / merge (current runtime) | `546c8cea` (both) | Yes | No | Not designated |
| `aa43dec2` | PR #103 merge (evidence-only; B-O4 eligibility question Q-B6) | `244f87bf` | Yes | No | Not designated |
| `0616ba2d` | PR #104 merge (evidence-only; current IPD main) | `731cd2c6` | Yes | No (hash record only; not S2 evidence) | Not designated; identical runtime to `a9cd18e8` |
| `c62dee81` / `a52b47b0` | Gate 4 QE pin candidates (`c62dee81`; Limb A merge `a52b47b0`) | `1467802e` (both) | Yes | n/a | Gate 4 QE pin NOT DESIGNATED; equal trees are not interchangeable identities |
| `C′` | Post-correction commit | not reported | n/a | n/a | Does not exist yet in any report |

Equal trees are not interchangeable commit identities. Recency is not a criterion. Candidate rows apply the §4.6 rules unchanged.

## 2. Table 1 — consolidated CAP-03 outstanding-work and dependency register

One row per work item or decision. Status classes are those requested; the verbatim status is shown after the dash. Primary owner is the first-named owner. Parallelizable: Y (can run alongside others), N, or - (not applicable). Full evidence references are in the source documents named in the Evidence column.

| # | ID — title | Stage/gate | Owner | Current status (class — verbatim; verified vs reported) | Authoritative evidence | Outstanding action | Dependencies | Blocker / decision and authorized resolver | Parallel | Group | Next eligible action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **R-01** — Live refs and open PRs (IRR, IPD) | Discovery | IRR | **complete/verified** | ls-remote + gh pr list this pass: IRR main 9130dead, IPD main 0616ba2d, 0 open PRs each | Re-verify at start of any later action | none | none | Y | G1 (Cross-repo discovery) | None (done) |
| 2 | **R-02** — IRR lead branch arena/cap03-p1c-p1d-reconciliation-20261027T142404Z at 40e36ab9 | Discovery | IRR | **not started** | Named as lead in prior session memory; ancestor of origin/main (carried); not inspected | Inspect read-only only if a PA ruling or IRR task requires it | R-01 | none (not required by any open decision) | Y | G1 (Cross-repo discovery) | Only on request |
| 3 | **PK-01** — PA packet currency and consolidated package (this pass) | PA packet | IRR | **implemented** | Packet blob 796e0c82 (§§0-16); formal record blob 3098fb09; status matrix f0b53690 (carried, PA-5 shown OPEN, superseded) | Publish later only in an authorized write pass; no edits this pass | R-01 | write authority not granted this pass | N | G2 (PA packet prep) | Next write pass, if authorized |
| 4 | **Q-N1** — Label collision C-1/C-2/C-3 (Matter C options vs Gate 4 QE/H-12 pin choices); PF-11 and Limb A collisions in packet §11 have no Q-ID | Naming | PA | **awaiting PA** | Packet §16.7 N-1; §5.3; formal record §4.5 | Adopt labels or name options otherwise; labels only | none | PA | Y | G2 (PA packet prep) | PA ruling |
| 5 | **S2-DEP** — S2 deposit: IRR PR #310 merge 47133fe4 (57 files; manifest 53 entries) | S2 | IRR | **complete/verified** | Tracker §16.144 (carried); exact-head run 40359958909 success (carried) | None | none | none | - | G3 (S2 retrieval and hash verification) | None |
| 6 | **Q-S2-1** — S2 acceptance of record: candidate-scoped ACCEPTED vs 'full S2 NOT RENDERED'; R-1 (47-entry output absent); R-2 (checkout digest does not reproduce); D1 open or closed | S2 (P-1-A) | PA | **disputed** | CV-CORR-124 acceptance record A2, A3, R-1 to R-4; unified record lines 55, 103-104, 123; tracker line 16; packet §16.6 S-1 to S-6 | PA ruling. IRR does not infer | S2-DEP | PA (Q-S2-1) | N (before Matter B and Q-B5) | G3 (S2 retrieval and hash verification) | PA ruling |
| 7 | **Q-S2-2** — Does the 924/920/0/4 npm test at 001c3c80 satisfy Gate 4 S2 Limb A? (same question as Q-B7) | Gate 4 S2 | PA | **disputed** | Gate 4 act §6 row S2 (IPD, line 197); acceptance record line 42 and A7 (NOT MET); packet §16.7 N-2 | PA yes or no. If no: native run at the Gate 4 commit under the Gate 4 act (separate authority) | Q-S2-1 (defines S2) | PA | Y (with Q-S2-1) | G3 (S2 retrieval and hash verification) | PA ruling |
| 8 | **Q-B5** — Naming: which 'S2' each requirement refers to (N-2). No substantive decision | Naming | PA | **awaiting PA** | Packet §16.7 N-2; §15.6 B-F10 | Label mapping only | Q-S2-1; Q-S2-2 | PA | Y (after Q-S2-1, Q-S2-2) | G3 (S2 retrieval and hash verification) | PA ruling |
| 9 | **S2-ORIG** — Original S2 evidence retrieval and hash verification (host path C:\iips-evidence\cap03-s2\; 47-entry verification output) | S2 | Operator | **awaiting operator** | IPD 0616ba2d record: 1 MATCH, 43 CRLF-restored, 3 unexplained; IRR readback 54d5a56f: 52 reproduced, 1 not; Arena has no read-only route to the host; 0 Actions artifacts in either repo | Read-only retrieval only if PA scopes it under Q-S2-1. Not run | Q-S2-1 | PA (scope) and Operator (action) | N | G3 (S2 retrieval and hash verification) | Hold until Q-S2-1 ruling |
| 10 | **S2-IRRDOC** — Record Q-S2-1 and Q-S2-2 outcomes in IRR (pointers and supersession only) | S2 | IRR | **not started** | Packet §16.6 | Add dated pointer after ruling; no in-place rewrite | Q-S2-1; Q-S2-2 | PA ruling | N | G12 (IRR-owned batches) | After ruling |
| 11 | **IPD-S2REC** — IPD hash record: '3 unexplained' overstates (2 of the 3 reproduce under LF body + single trailing CRLF, per IRR readback test) | S2 | IPD | **disputed** | IPD evidence/cross-repository/cap03_s2_47file_hash_verification_2026-10-28 (0616ba2d); IRR readback (transform stated) | IPD correction only if PA requires it. IRR does not edit IPD records | Q-S2-1 | PA (if required), then IPD | Y | G13 (IPD-owned batches) | None unless PA requires |
| 12 | **A-Q1** — Q-A1: is DR-2 (PA §2, two-path manifest) a 'further act' under successor act §5.1 for portfolio_store.ts and the q1 test? | Matter A | PA | **awaiting PA** | Successor act §5.1 (blob 528de6ae); DR-2 record lines 9, 11; packet A-F2, A-F3 | Yes or no | none | PA | Y | G4 (Matter A and B post-ruling) | PA ruling |
| 13 | **A-Q2** — Q-A2: item 12 designated blob: 9a5fd9e3 (act §2.1 as written) or edd0305e (§5.1 item 4 modification) | Matter A | PA | **awaiting PA** | Act §§2.1, 5.1; IPD S1 determination §12.2 lists edd0305e as designated (re-read this pass; packet S-5 carried) | Designate one blob | none | PA | Y | G4 (Matter A and B post-ruling) | PA ruling |
| 14 | **A-Q3** — Q-A3: is the act §5.1 'exhaustive' clause repository-wide or workstream-scoped? If repository-wide, the authorizing record for each out-of-set path | Matter A | PA | **awaiting PA** | Act §§3, 5.1; packet A-F6, A-F8 (eight paths and the IPD tracker) | Ruling; per-path authority if repository-wide | none | PA | Y | G4 (Matter A and B post-ruling) | PA ruling |
| 15 | **A-Q4** — Q-A4: do the two PR #96 paths (verify-public-package.mjs; portfolio_ui_package.test.ts) require an authorizing act? Does IPD aa43dec2 documentation satisfy it? | Matter A | PA | **awaiting PA** | CV-CORR-123 §2 ('not an implementation grant'); IPD aa43dec2 record (documentation only) | Ruling | none | PA | Y | G4 (Matter A and B post-ruling) | PA ruling |
| 16 | **A-GAP1** — Gate 4 act §6 S1 reads 'BLOCKED: identity values unresolved' (act effective 2026-10-23); IPD S1 determination (2026-10-24) asserts resolved values; the determination is not audited (packet A-F7). No Q-ID exists | Matter A / S1 | PA | **disputed** | Gate 4 act line 196 (IPD 0616ba2d); S1 determination (IPD, effective 2026-10-24); packet A-F7 | PA to state which governs S1 status. Not inferred | none | PA | Y | G4 (Matter A and B post-ruling) | PA ruling |
| 17 | **A-Q5** — Q-A5: mechanism A-O1 to A-O5; if an IPD-side act is needed, which commit it names | Matter A | PA | **awaiting PA** | Packet §15.5 | Choose one option | A-Q1 to A-Q4 | PA | N | G4 (Matter A and B post-ruling) | After A-Q1 to A-Q4 |
| 18 | **A-Q6** — Q-A6: is the §8.2 stop cleared by Q-A1 to Q-A5, or does any execution need a fresh designation first? (§8.2 literally met at 001c3c80, a891802e, db84ac12, a9cd18e8, aa43dec2, 0616ba2d: 10 of 12 match) | Matter A | PA | **awaiting PA** | Act §8.2; packet A-F5 | Ruling | A-Q1 to A-Q5 | PA | N | G4 (Matter A and B post-ruling) | After A-Q5 |
| 19 | **A-IPD** — IPD-side act for items 10 and 12 (options A-O3 or A-O4), if PA chooses it | Matter A | IPD | **not started** | Packet §15.5 (IRR cannot amend act or IPD paths) | Separate IPD pass naming the commit | A-Q5 | PA decision, then IPD | N | G13 (IPD-owned batches) | None until PA chooses |
| 20 | **D2-REV** — Read-only review of D2 PRs #100-#102 against PA-5 §§5.2-5.4: correctness; T-8; dist count (1,140, not re-measured); changed-file list includes an IPD tracker change in PR #102 (PA-5 wording is 'exactly the two files') | Matter B (D2 implementation) | IPD (review); PA (acceptance) | **implemented** | Merged: a891802e, db84ac12, a9cd18e8 (CI reported green, carried). This pass: 888eb375..a9cd18e8 changes gateAPrimeProvisioning.ts, g3 successor test, IPD tracker. Correctness NOT REVIEWED; no PA acceptance record | Separate IPD read-only review; then PA acceptance decision. PA question not yet numbered | A-Q3 (tracker scope) | IPD and PA | Y (read-only review) | G13 (IPD-owned batches) | IPD review pass, when scheduled |
| 21 | **B-Q4** — Q-B4: does H-12 regeneration (L2c) gate L2a, or belong to a later act (PA-1)? | Matter B | PA | **awaiting PA** | Formal record lines 42, 101, 149; packet B-F9 | Ruling | none | PA | Y | G4 (Matter A and B post-ruling) | PA ruling |
| 22 | **B-Q6** — Q-B6: is IPD aa43dec2 eligible as a B-1 candidate row (B-O4)? Default: §4.6 step 5 applies | Matter B | PA | **awaiting PA** | Packet §16.8 (B-O4; option only) | Yes or no | none | PA | Y | G4 (Matter A and B post-ruling) | PA ruling |
| 23 | **B-Q1** — Q-B1: choose B-0 (retain 001c3c80), B-1 (designate a D2 commit or C′), or B-2 (defer) | Matter B | PA | **awaiting PA** | Packet §15.6 options; IRR does not infer | One choice | Q-S2-1; Q-S2-2; A-Q1 to A-Q6; B-Q4; B-Q6 | PA | N | G4 (Matter A and B post-ruling) | PA ruling, after its dependencies |
| 24 | **B-Q2** — Q-B2 (only if B-0): waive or defer the DA-A1 receipt element; does the coordinate name head 001c3c80 or merge 1e76f4cf? | Matter B | PA | **not started** — conditional | Packet B-F2, B-F6 | Ruling | B-Q1 = B-0 | PA | N | G4 (Matter A and B post-ruling) | Only if B-0 |
| 25 | **B-Q3** — Q-B3 (only if B-1): which commit and tree (packet §15.3 rows 3-6, §16.3, or C′) | Matter B | PA | **not started** — conditional | Packet §15.3, §16.3; formal §4.6 | Ruling naming commit and tree | B-Q1 = B-1; A-Q1 to A-Q6 | PA | N | G4 (Matter A and B post-ruling) | Only if B-1 |
| 26 | **B-DESIG** — Designation act for the chosen commit (§4.6 step 4) | Matter B | PA | **not started** | Formal §4.6 | PA act | B-Q3 | PA | N | G4 (Matter A and B post-ruling) | Only after B-Q3 |
| 27 | **DA-A1** — DA-A1 receipt: executingCommit/executingTree capability present at a9cd18e8 (static); no receipt at any commit; 001c3c80 lacks the element | Matter B | IPD (capability); Operator (receipt at execution) | **implemented** — implemented (capability, static read); receipt NOT EXECUTED | Packet B-F2, B-F3; formal row L2a. Not tested this pass | None now; a receipt is produced only at P-1 execution | B-Q2 or B-Q3 | PA (waiver) and Operator | N | G4 (Matter A and B post-ruling) | Only at P-1 execution |
| 28 | **C-Q1** — Q-C1 (packet §5.5 Q1): is A6 runtime commit-independent? Source does not state it | Matter C | PA (fact); Operator (host run) | **awaiting PA** | Formal record §7; procedure §6.3; packet §5.2 | Answer from source, or PA scopes an operator confirmation | none | PA | Y | G5 (PF and host readiness) | PA ruling |
| 29 | **C-Q2** — Matter C (packet §5.5 Q2): pre-attempt observations are preparatory only and re-observed in the attempt? Plus option choice C-1, C-2 or C-3 | Matter C | PA | **awaiting PA** | Packet §5.2-5.5 (IRR recommendation C-2, conditional on C-Q1; not a decision) | PA ruling | C-Q1; B-Q1 for commit-keyed items | PA | N | G5 (PF and host readiness) | After C-Q1 |
| 30 | **D-Q** — Matter D: non-mutating effective-write method (D-1 to D-4) and the object of the criterion (store parent or store path; §6.2 'Open') | Matter D | PA | **awaiting PA** | Packet §6.2-6.4 (IRR recommendation D-2; not a decision); PF status record | Ruling: object first, then method | none | PA | Y | G5 (PF and host readiness) | PA ruling |
| 31 | **D-INST** — D-2 instrument revision (if chosen): new instrument identity under DB-B1; A6 runtime before use | Matter D / PF | IRR | **not started** — not started (conditional) | Packet §6.3; procedure lines 82-83 | IRR revises and publishes only after D-Q ruling | D-Q; A6 (E5) | PA (decision) then IRR | N | G12 (IRR-owned batches) | Only after D-Q |
| 32 | **E7** — Native PowerShell harness: does DC-C2 replace (procedure §4.3a line 172) or supplement (bundle 06 line 6; bundle 10 line 8) the native prerequisite for the next capture? | PF / E7 | PA | **awaiting PA** | Packet §7.2 E7, §15.7 | Ruling | none | PA | Y | G5 (PF and host readiness) | PA ruling |
| 33 | **E8** — Root path: procedure D:\iips-evidence (lines 131, 150, 154, 167, 193, 440, 486) vs reported C:\IIPS-EVIDENCE\cap03-p1-20261027-02. Any root must be checked against the PF-15 F4 and F5 literals | PF / E8 | PA (choice); IRR (procedure) | **awaiting PA** | Packet §7.2 E8, §15.7; PF-15 literals (Q-P1) | PA names the root in writing | Q-P1 | PA | Y | G5 (PF and host readiness) | PA ruling |
| 34 | **PF10** — PF-10 coverage: procedure line 147 checks GATE_A_PRIME_* wildcard; instrument v2 lines 91-98 check four named flags | PF / PF-10 | PA | **awaiting PA** | Packet §15.7; procedure lines 146-148; instrument v2 | Narrow the procedure to four flags, or keep wildcard and change instrument (new identity) | none | PA | Y | G5 (PF and host readiness) | PA ruling |
| 35 | **QP1** — Q-P1: confirm the approved byte-level F2, F4, F5 values (F2 31 B; F4 39 B; F5 28 B). Span equality of -01 and -02 verified this pass; -02 'transcription defect' premise not reproduced | PF-15 literals | PA | **awaiting PA** | PF-15 -01 (blob cbd500a7) and -02 (blob 3fe9a2dd); packet §16.11 | Confirm, or issue a further act. Do not normalize | none | PA | Y | G5 (PF and host readiness) | Before any host use of F2, F4 or F5 |
| 36 | **E3** — Procedure revision to settled pins, step-0 scope, PF-07/08, PF-10, root, instrument identity and acceptance criteria | PF | IRR | **not started** — not started (deliberately) | Packet §7.2 E3; procedure blob 9aae3657 (do not edit) | IRR revision only after rulings | C-Q2, D-Q, E7, E8, PF10, B-Q1, A-Q6 | IRR (after PA rulings) | N | G12 (IRR-owned batches) | After rulings |
| 37 | **E4** — Instrument identity: v2 191f5828 / SHA-256 13783385 is the current sole identity (DB-B1) | PF | PA (adoption); IRR | **complete/verified** — current; unchanged | Packet §7.2 E4; procedure lines 82-83 | None; any change needs PA adoption | D-INST; PF10 | PA | N | G12 (IRR-owned batches) | None |
| 38 | **E5** — A6 runtime test on host (formal §7) | PF / host | Operator | **blocked** — NOT RUN (no pwsh in sandbox) | Formal record §7; packet §7.2 E5 | Operator run under host authorization only | C-Q1; E10 | Operator and host authorization | N | G5 (PF and host readiness) | Blocked: host authorization |
| 39 | **E6** — DC-a and DC-b (V1102) in the attempt session. Native run 92d931fb NOT PASSED, undiagnosed. Deferral (PA-3d) does not waive the check | PF / host | Operator; PA (any diagnostic) | **pending** — pending (V1102 OPEN) | Formal record §6; packet §7.2 E6 | Operator in attempt session | E10 | Operator and PA | N | G5 (PF and host readiness) | Blocked: attempt session |
| 40 | **PF-11D** — Diagnosis of native PF-11 run 92d931fb (undiagnosed). DC-C2 is not reopened solely for PA-3d diagnostics | PF / host | PA (on request); Operator | **blocked** — NOT PASSED; undiagnosed | Formal record §6; directive | Diagnose only if PA requests it | none | PA | Y (if requested) | G5 (PF and host readiness) | Only on PA request |
| 41 | **PFREG** — PF register: PF-01 and PF-03 reported at capture, not read back; PF-02, 04, 05, 06, 08, 09, 10 NOT EVIDENCED; PF-07 and PF-16 UNVERIFIED; PF-14 INSUFFICIENT (reported root); PF-15 SATISFIED (P-1-E) | PF / host | Operator | **pending** | PF status record (carried); reported root C:\IIPS-EVIDENCE\cap03-p1-20261027-02 | Attempt-session observation; no read-back now | E10; E8; A-Q6 | Operator | N | G5 (PF and host readiness) | Blocked: attempt session |
| 42 | **E9** — Live IRR and IPD identity check and PF-17 register read immediately before invocation (procedure §4.4, §4.5) | PF / host | Operator | **not applicable** — not applicable now | Procedure §4.4-4.5 | Attempt session only | E10 | Operator | N | G5 (PF and host readiness) | Attempt session only |
| 43 | **E10** — Separate PA capture-authorization act naming host, session, root, instrument identity, pins, time window and operator | Capture | PA | **not started** — not started (NOT RENDERED) | Formal record §§3-8; status matrix; packet §7.2 E10 | PA act (only after E1 to E8 settle) | B-Q1; A-Q6; E3; E7; E8; PF10; C-Q2; D-Q; QP1 | PA | N | G5 (PF and host readiness) | After rulings |
| 44 | **CAP** — P-1-C/P-1-D capture (read-only preflight, procedure); not P-1 authorization | Capture | Operator | **not started** — not started (not authorized) | Formal §3.3; procedure | Attempt session only, under E10 | E10; E3; E9; PFREG | Operator and PA | N | G5 (PF and host readiness) | Blocked: E10 |
| 45 | **MF** — Matter F acceptance of P-1-C and P-1-D (attempt-session evidence) | Capture | PA | **not applicable** — not applicable before the attempt | Packet §8 (specified, not accepted) | None now | CAP | PA | N | G5 (PF and host readiness) | None now |
| 46 | **P1-A** — P-1-A: S2 satisfied (candidate-scoped) | P-1 | PA | **accepted under scope** | Formal §8 (carried) | None; subject to Q-S2-1 | Q-S2-1 | PA | - | G6 (P-1) | None now |
| 47 | **P1-B** — P-1-B: satisfied at 001c3c80; superseded for execution by C′ (C′ not designated) | P-1 | PA | **superseded** — superseded (for execution) | Formal §8 (carried) | None | B-Q1 | PA | - | G6 (P-1) | None now |
| 48 | **P1-C** — P-1-C: NOT ESTABLISHED | P-1 | PA / Operator | **pending** | Formal §8 (carried) | Establish only through CAP and MF | CAP; MF | PA | N | G6 (P-1) | After CAP and MF |
| 49 | **P1-D** — P-1-D: DESIGNATED; NOT VERIFIED FOR THE ATTEMPT | P-1 | PA / Operator | **pending** | Formal §8 (carried) | Verify in attempt session | CAP | PA | N | G6 (P-1) | After CAP |
| 50 | **P1-E** — P-1-E: SATISFIED (PF-15 corrected act -02; blob 3fe9a2dd; receipts 121605234743, 121606348075 carried) | P-1 | PA | **complete/verified** | PF-15 -02 bytes read this pass; receipts carried | None (residual is Q-P1) | none | PA | - | G6 (P-1) | None |
| 51 | **P1-F** — P-1-F: UNSPENT; act NOT RENDERED | P-1 | PA | **not started** | Formal §8 (carried) | P-1 authorization act (PA) after all gates | P1-C; P1-D; B-DESIG; DA-A1; L2a; L2c | PA | N | G6 (P-1) | After prerequisites |
| 52 | **P1-EXEC** — Single P-1 provisioning execution (Gate 4 S1 on desktop-no0nhtp). NOT EXECUTED / UNSPENT / NOT AUTHORIZED. Also gated by A-GAP1 | P-1 / S1 | Operator | **blocked** | Gate 4 act §6 row S1 (IPD line 196); formal §3.3 | None; not authorized | P1-F; A-GAP1; S2a; DA-A1 | PA and Operator | N | G6 (P-1) | None |
| 53 | **S3** — S3 host/runtime preflight (win32, non-elevated, Node >=22.13.0 <23, flag-free node:sqlite, clean trees at designated commits) | S3 | Operator | **blocked** | Gate 4 act §6 row S3 (IPD line 199): BLOCKED until S1 and S2a; formal §3.3 | None now | P1-EXEC; S2a | Operator | N | G7 (S3) | None |
| 54 | **QE-1** — canonical identity: exactly one match; zero or conflicting refused before serialization, port or store | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 55 | **QE-2** — DP-2 2F: unresolved or ambiguous write refused; no bypass; no partial revision | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 56 | **QE-3** — revision and lifecycle: stale or missing expectedRevision rejected; tombstone not disclosed | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 57 | **QE-4** — create, durable commit, stop both processes, restart, byte-identical holdings (G2-D3 option b) | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 58 | **QE-5** — idempotent re-import: same contentDigest gives ALREADY_IMPORTED_NO_OP | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 59 | **QE-6** — contribution SHA-256 lineage and broker attribution identical after restart and REPLACE/RESET | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 60 | **QE-7** — forced termination during a write leaves full revision or none; tampered migrations refused | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 61 | **QE-8** — revocation: post-revocation writes and reads refused, including after restart | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 62 | **QE-9** — full W-15 refusal matrix with zero store effect; C5.1 zero bytes; N >= 10 cold and 10 warm | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 63 | **QE-10** — outcome-unknown: timeout after send gives no IRR auto-retry; reconcile-by-read demonstrated | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 64 | **QE-11** — Gate C read-only subset Q1-Q4 and Q9-Q11 passed and accepted (separate act) | QE | Operator (execution); IRR (evidence) | **blocked** | Matrix §6 (lines 244-254): NOT RUN; 0/11 executed | None now | S3 | S3 (Gate 4 §6 S4) | N | G8 (QE-1 to QE-11) | None |
| 65 | **DQ4** — DQ-4 freeze: criteria 7 (host sequence S2 to P-1 to S3) and 8 (native-Windows canonical evidence) unmet; 8/10 carried | DQ-4 | PA | **pending** | DQ-4 manifest §7 (interim, dated 2026-10-25: 6/10 at its date); matrix (8/10 carried; later increments not re-verified this pass) | None now; freeze act only after criteria 7 and 8 | P1-EXEC; S2a; Gate 4 S2 Limb A | PA and Operator | N | G9 (DQ-4 and freeze) | None |
| 66 | **G4-S2** — Gate 4 S2 Limb A: native canonical npm test at the post-merge commit (Limb A merge a52b47b0 present, carried) | Gate 4 S2 | Operator | **not started** — not started (AUTHORIZED) | Gate 4 act §6 row S2 (line 197) | Native run at the Gate 4 commit only when authorized | Q-S2-2 | Operator and PA | N | G10 (Gate 4) | After Q-S2-2 |
| 67 | **G4-S2A** — S2a: H-12 regeneration at the final IPD and IRR commits, with separate express PA adoption (adoption not rendered) | Gate 4 S2a | IRR; PA (adoption) | **not started** — not started (AUTHORIZED) | Gate 4 act §6 row S2a (line 198); formal PA-1 | Regenerate only after designation | B-Q4; B-DESIG; L2c | IRR and PA | N | G10 (Gate 4) | After designation |
| 68 | **L2A** — L2a: fresh S2 evidence at the designated commit (formal §4.6 step 5) | S2 (L2a) | Operator; IRR | **not started** | Formal §4.6; row L2a | None until designation | B-DESIG | Operator | N | G10 (Gate 4) | After B-DESIG |
| 69 | **L2C** — L2c: H-12 regeneration with full validation at the designated commit (formal row L2c) | H-12 (L2c) | IRR | **not started** | Formal row L2c; PA-1 (adoption and gating per B-Q4) | None until designation and B-Q4 | B-DESIG; B-Q4 | IRR and PA | N | G10 (Gate 4) | After B-DESIG and B-Q4 |
| 70 | **G4-PIN** — Gate 4 QE/H-12 pin choice (formal §4.5, labelled C-1/C-2/C-3 there; see Q-N1). NOT DESIGNATED | Gate 4 pin | PA | **awaiting PA** | Formal §4.5; packet B-F11. QE pin a52b47b0 and c62dee81 share tree 1467802e | Ruling. Not a side effect of B-1 | B-Q1; Q-N1 | PA | N | G10 (Gate 4) | After B-Q1 |
| 71 | **L2B** — L2b: CAP-03 / Path A DR-track (IPD primary 8eec74ae; alias 70b24f02) NOT ESTABLISHED (carried) | Gate 4 / DQ-6b | PA | **pending** | Formal record (carried); DQ-4 manifest | PA ruling if required | none known | PA | Y | G10 (Gate 4) | PA ruling if required |
| 72 | **G5-ADM** — Gate 5 admission: NOT ADMITTED. Requires QE results, separate Gate C acceptance and Gate 4 result acceptance | Gate 5 | PA | **blocked** | Lifecycle matrix §1 (carried); Gate 5 text not read this pass | None | QE-1 to QE-11; Gate 4 acceptance | PA | N | G11 (Gate 5) | None |
| 73 | **IRR-PROC** — IRR-owned procedure and documentation revisions after rulings (procedure, instrument v2 successor if chosen, record pointers) | Cross-stage | IRR | **not started** | Procedure (do not edit ahead of decisions) | Write only after rulings, in an authorized write pass | rulings in G2, G3, G4, G5 | PA rulings | N | G12 (IRR-owned batches) | After rulings |
| 74 | **IPD-C2** — Future IPD implementation (C′), separate prompt: smallest correct change, T-10 to T-13 tests, dist gate 1,140 unless separately authorized | IPD implementation | IPD | **not started** | User directive (future prompt); not in scope now | Only when a separate IPD prompt is issued | B-Q1 = B-2, or B-1 that needs C′ | PA and separate IPD prompt | N | G13 (IPD-owned batches) | Not in scope |
| 75 | **IPD-DIST** — dist entry-count gate (1,140, PA-5 §5.3) not re-measured; build not run; not authorized here | IPD | IPD | **pending** | Formal §5.3 (carried); not measured this pass | Measure only under separate authorization | D2-REV | IPD and separate authorization | Y | G13 (IPD-owned batches) | None now |
| 76 | **IPD-S1** — IPD correction of S1 §12.2 and readiness-request 12/12 statements (packet S-5; IPD owns) | S1 | IPD | **disputed** | S1 determination §12.2 (lines 328-334); packet S-5 (re-read this pass) | IPD correction only if PA requires it | A-Q2; A-GAP1 | PA (if required), then IPD | Y | G13 (IPD-owned batches) | None unless PA requires |
| 77 | **FINAL** — Final cross-stage reconciliation after rulings and each publication | Final | IRR | **not started** | All Table 1 rows | Reconcile statuses once rulings and receipts exist | all G2 to G13 items | PA and each owner | N | G14 (Final reconciliation) | After rulings |

Reported-only items (not verified in this pass): user-reported Windows 47-entry `PASS`; CI and receipts (carried); PF-01 and PF-03 at capture; the DQ-4 increments after the 2026-10-25 manifest; Gate 5 text. Each is labelled carried or reported in its row.

## 3. Table 2 — one-pass execution grouping (14 groups)

The request names 14 categories, not 15; the 14 are used as named. Matters C to F are placed in G5, and the Gate 4 pin and L2b items in G10. If a fifteenth category was intended, it has not been invented here.

| Group | Purpose | Items | Repository / owner | Can start now | Prerequisites | Combinable | Must remain separate | Expected deliverable | Stop condition |
|---|---|---|---|---|---|---|---|---|---|
| **G1** Cross-repo discovery | Re-verify live refs and open PRs; locate the lead branch | R-01 (done); R-02 | IRR (read-only) | Yes (R-01 done this pass) | none | Combinable with G2 read-only checks | Separate from every write and host step | Ref and PR table with evidence basis | Any ref moved: re-verify before relying on any report |
| **G2** PA packet prep | Keep the packet, naming and ruling sheets ruling-ready | PK-01; Q-N1 | IRR (prep); PA (ruling) | Prep: done this pass. Q-N1: PA ruling now | R-01 | Q-N1 with G3 rulings in the same PA sitting | IRR publication stays separate from PA rulings | Ruling-ready package; naming labels ruled | Any request to edit the operative procedure or record a ruling |
| **G3** S2 original-evidence retrieval and hash verification | Settle S2 status; decide whether original host bytes are needed | S2-DEP (done); Q-S2-1; Q-S2-2 (= Q-B7); Q-B5; S2-ORIG; S2-IRRDOC; IPD-S2REC | PA (rulings); Operator (retrieval); IPD (record only if PA requires); IRR (pointers) | Rulings: yes. Retrieval: no (needs PA scope and an operator) | Q-S2-1 before S2-ORIG; Q-S2-2 may follow Q-S2-1 | Q-S2-1 with Q-S2-2; Q-B5 after both | Retrieval and host read-back stay separate from rulings; no host preflight | PA ruling record for Q-S2-1, Q-S2-2; if scoped, retrieved originals with hashes | Host action not scoped by PA; treating the user-reported PASS as verified |
| **G4** Matter A and B post-ruling work | Settle successor-act authority, then choose the candidate; no designation before rulings | A-Q1 to A-Q6; A-GAP1; B-Q4; B-Q6; B-Q1; B-Q2 or B-Q3 if triggered; B-DESIG; DA-A1 (execution only) | PA (rulings); IPD (only any IPD-side act); Operator (DA-A1 receipt at execution) | Rulings A-Q1 to A-Q4, A-GAP1, B-Q4, B-Q6: yes. A-Q5, A-Q6, B-Q1 to B-Q3: no | A-Q1 to A-Q4 before A-Q5; A-Q1 to A-Q6 and Q-S2-1/2 before B-Q1 | A-Q1 to A-Q4 together; B-Q4 with B-Q6 | Matter A (IPD act), Matter B (designation) and DA-A1 (execution) stay separate | Rulings; designation act only if B-1 is chosen | Any designation before A-Q6 and B-Q1; any IRR write to an IPD path |
| **G5** PF and host readiness (Matters C to F pre-decision; E7; E8; PF-10; Q-P1; host items) | Settle capture prerequisites; keep every host step blocked | C-Q1; C-Q2; D-Q; D-INST; E7; E8; PF10; QP1; E3; E4; E5; E6; PF-11D; PFREG; E9; E10; CAP; MF | PA (rulings, E10); IRR (procedure, after rulings); Operator (host) | Rulings C-Q1, D-Q, E7, E8, PF10, QP1: yes. All host items: no | E8 after QP1 (F4 and F5 check); E3 after rulings; E10 after E3 and rulings | E7, E8, PF10, QP1 in one sitting; C-Q1 with D-Q | Every host run (E5, E6, CAP) separate from rulings; E10 separate from both | PA rulings; later a procedure revision (IRR) and an E10 act (PA) | Any preflight, capture, pwsh, store probe, or procedure edit before rulings |
| **G6** P-1 | Single provisioning attempt (Gate 4 S1); not authorized | P1-A to P1-F; P1-EXEC | PA (P-1 authorization act); Operator | No | P1-C and P1-D (after CAP and MF); DA-A1; L2a; L2c; B-DESIG; A-GAP1; S2a; P-1 authorization act | None (keep this group separate) | Each P-1 attempt is its own authorized act | P-1 authorization act; one attempt record | Any P-1 step without the authorization act; any second attempt |
| **G7** S3 | Gate 4 S3 host/runtime preflight | S3 | Operator | No | P1-EXEC; S2a | None | Separate from CAP and from P-1 | S3 record | Any S3 step before S1 and S2a |
| **G8** QE-1 to QE-11 | Execute the 11 QE items (all NOT RUN, 0/11) | QE-1 to QE-11 | Operator (execution); IRR (evidence) | No | S3 | Tiers only, as in the matrix §6 | Q11 before/after ordering; destructive items (QE-4 restart limbs, QE-7) separate | Per-item evidence files | Any QE item before S3 |
| **G9** DQ-4 and freeze | Freeze after criteria 7 and 8 are met | DQ4 | PA; Operator | No | P1-EXEC; S2a; G4-S2 | None | Freeze act separate from evidence | Freeze act (PA) | Drift (DQ-4.4): stop and re-designate |
| **G10** Gate 4 | S2 Limb A native run; S2a; L2a; L2c; pin choice; L2b | G4-S2; G4-S2A; L2A; L2C; G4-PIN; L2B | Operator; IRR; PA | L2B ruling if required: yes. Others: no | Q-S2-2 for G4-S2; B-DESIG for L2A and L2C; B-Q1 for G4-PIN | None | Native S2 Limb A, fresh S2 (L2a) and H-12 (L2c) stay separate | Each Gate 4 record | IRR movement of any Gate 4 status |
| **G11** Gate 5 | Admission (not admitted) | G5-ADM | PA | No | QE-1 to QE-11; separate Gate C acceptance; Gate 4 result acceptance | None | Admission act separate | Admission act (PA) | Any admission before QE results and acceptance |
| **G12** IRR-owned batches | Record rulings; revise the procedure and any instrument successor after rulings | D-INST; S2-IRRDOC; E3; IRR-PROC | IRR (after PA rulings) | No (after rulings only) | The relevant rulings in G2 to G5 | Pointers in one write pass | Procedure revision separate from record pointers and any instrument successor | Write pass with publication receipts | Edits ahead of decisions; any change to BASIS_COMMIT, BASIS_TREE, or compiled-basis constants |
| **G13** IPD-owned batches | IPD-side acts and record corrections; read-only D2 review | D2-REV; A-IPD; IPD-S2REC; IPD-S1; IPD-DIST; IPD-C2 | IPD (separate passes); PA (decisions) | D2-REV: yes, as a separate read-only pass. Others: no | A-Q5 for A-IPD; PA for IPD-S1 and IPD-S2REC; separate authorization for IPD-DIST; separate prompt for IPD-C2 | Each item separate | IRR never writes to IPD; each IPD item is its own pass | Review record (IPD); IPD act or correction when required | Any IPD write from IRR; any build or dist measurement without authorization |
| **G14** Final cross-stage reconciliation | Consolidate statuses after rulings and receipts | FINAL | IRR | No | All G2 to G13 items | None | Last step | Final register | Before rulings and receipts exist |

## 4. Status summary

### 4.1 Counts computed from Table 1 (77 rows)

By execution group: G1 Cross-repo discovery 2; G2 PA packet prep 2; G3 S2 retrieval and hash verification 5; G4 Matter A and B post-ruling 14; G5 PF and host readiness 15; G6 P-1 7; G7 S3 1; G8 QE-1 to QE-11 11; G9 DQ-4 and freeze 1; G10 Gate 4 6; G11 Gate 5 1; G12 IRR-owned batches 5; G13 IPD-owned batches 6; G14 Final reconciliation 1.

By primary owner: PA 38; Operator 21; IRR 11; IPD 7.

By status class: awaiting PA 19; not started 18; blocked 16; pending 7; disputed 5; complete/verified 4; implemented 3; not applicable 2; awaiting operator 1; accepted under scope 1; superseded 1.

Parallelizable: Y 24; N 48; not applicable 4.

### 4.2 Identities and exact status

- IRR `main` `9130dead`; IPD `main` `0616ba2d`; open PRs 0 in both repositories.
- P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.
- No execution pin is designated. `001c3c80` remains the candidate-scoped operative basis and P-1 coordinate under CV-CORR-123, unchanged. `C′` does not exist in any report.

### 4.3 Immediate work (no PA decision needed; read-only)

- Only read-only work is eligible now: the packet and this register are current; a separate IPD read-only D2 review (`D2-REV`) may be scheduled as its own pass. IRR has no open write item that does not depend on a ruling.

### 4.4 Parallel work (PA rulings that do not depend on each other)

- Q-S2-1; Q-S2-2 (= Q-B7); Q-B5 after both; Q-N1.
- Matter A: A-Q1, A-Q2, A-Q3, A-Q4, and A-GAP1 (in one sitting). B-Q4, B-Q6.
- Matter C: C-Q1 (A6 commit-independence). Matter D: D-Q (object first, then method).
- E7, E8 (after Q-P1 for the F4/F5 check), PF-10, Q-P1 (before any host use of F2, F4 or F5).

### 4.5 PA-blocked work

- Designation chain: A-Q5, A-Q6, B-Q1, then B-Q2 or B-Q3 (conditional), B-DESIG.
- Dependent on the designation: L2a fresh S2, L2c H-12 regeneration, S2a adoption, DA-A1 receipt at execution.
- Procedure revision E3 (after C-Q2, D-Q, E7, E8, PF10, B-Q1); instrument successor D-INST (after D-Q).
- E10 capture authorization; P-1 authorization act; Gate 4 pin choice (G4-PIN); L2b (if required); DQ-4 freeze; Gate 5 admission.

### 4.6 Operator-blocked work (no host access from Arena; none authorized now)

- A6 runtime test (E5); DC-a and DC-b / V1102 (E6); PF-11 `92d931fb` diagnosis (only on PA request); PF register (PFREG); PF-14 root and PF-17 read at the attempt (E9); CAP; P-1 provisioning; S3; QE-1 to QE-11; Gate 4 S2 Limb A; original S2 retrieval (S2-ORIG, only if PA scopes it).

### 4.7 Stopped work (stop conditions in force)

- No host preflight, capture, PowerShell or `pwsh`, store probe, or P-1 step.
- No designation, pin, or `C′`. No change to `BASIS_COMMIT`, `BASIS_TREE`, or compiled-basis constants.
- No procedure edit (E3), no instrument revision (D-INST), no successor-act edit, no DR-2 amendment.
- No IRR write to IPD; no IPD build, test, or dist measurement under this pass.
- No S3, QE, DQ-4, Gate 4 or Gate 5 movement. No merge, closure, or PR action.

### 4.8 Recommended next action (dependency rationale)

Hold one PA ruling sitting, in this order (the same order as packet §16.11, with the independent items grouped):

1. **S2 first:** Q-S2-1; then Q-S2-2 (= Q-B7); then Q-B5. These define which S2 each requirement refers to, and Matter B's option set depends on them.
2. **Matter A:** A-Q1 to A-Q4 and A-GAP1 (independent of each other), then A-Q5 and A-Q6. B-1 cannot be designated before A-Q6.
3. **Matter B:** B-Q4 and B-Q6, then B-Q1, and B-Q2 or B-Q3 only if their trigger is chosen.
4. **Matter C, Matter D, E7, E8, PF-10:** C-Q1 first (it decides whether C-2 is available), then C-Q2 and the option choice; D-Q (object first). E8 after Q-P1, because any root must be checked against the F4 and F5 literals.
5. **Q-N1, Q-B5, Q-P1:** naming labels and the approved literal values. Q-P1 must be ruled before any host use of F2, F4 or F5.

Rationale: no downstream item can move until the S2 status and the Matter A stop are answered. Designation (B-DESIG), fresh S2 (L2a) at the designated commit, H-12 (L2c), the procedure revision (E3), E10, P-1, S3, QE and Gate 5 all sit behind those answers. Items 4 and 5 can be decided in the same sitting, but the procedure cannot be revised until they are.

No host, capture, P-1, pin designation, IRR procedure revision, or IPD write is recommended until the relevant rulings exist. Publication of this package and its tracker pointer is complete (tracker §16.171). Any further IRR write requires its own authorization.

## 5. Decision sheets (for PA; none decided)

The options are those recorded in the packet. Where the packet records an IRR recommendation, it is labelled as such and is not a decision. IRR does not choose an option for PA.

### 5.1 S2 — Q-S2-1, Q-S2-2 (= Q-B7), Q-B5

Facts (verified this pass unless carried): CV-CORR-124 renders candidate-scoped ACCEPTED on `001c3c80` / `399fa44a`. A2: 46 of 47 digests reproduce (carried). A3 / R-1: the 47-entry verification output is absent from the deposit and IRR `main`; PASS is user-reported. R-2: `s2-checkout-verification.txt` digest `3FD31FE6…` does not reproduce. R-3: two contiguous captures, neither at the committed SHA. R-4: host CRLF, committed LF. The unified record says 'full S2 evidence acceptance NOT RENDERED' and D1 PENDING. Tracker line 16 says 'COMPLETE AND CLOSED on the user's reported PASS'.

Digest facts (carried from the 0616ba2d pass; NOT re-run this pass; IRR `origin/main` SHA256SUMS, 53 entries): 7 match as committed; 43 match with CRLF restored; 2 match under 'LF body with a single trailing CRLF' (a transform IPD did not test; IRR readback states it); 1 (`s2-checkout-verification.txt`) matches under no tested transform. This is consistent with IRR readback `54d5a56f` (52 reproduced, 1 not). The IPD record (`0616ba2d`) counts 47 transferred entries: 1 MATCH, 43 CRLF-restored, 3 unexplained. Its '3 unexplained' overstates the unexplained set (see IPD-S2REC). Host byte identity is NOT established.

Q-S2-1 options (PA): (a) confirm candidate-scoped acceptance stands, with R-1 not an absolute prerequisite (the record's own §4 analysis); (b) hold R-1 absolute, in which case acceptance reverts to 'NOT RENDERED' for L2a and a superseding record is needed; (c) state the clearing condition for R-2 (the record does not specify one). Also decide D1: closed for candidate scope with R-4 as a permanent boundary, or open pending an operator read-back of the host originals. Decide whether the PASS stays user-reported or becomes open.

Q-S2-2 / Q-B7 options (PA): (a) yes: the 924/920/0/4 run at `001c3c80` satisfies Gate 4 S2 Limb A. This requires an express PA act, since Gate 4 act §6 names the post-merge commit and `001c3c80` is not the Limb A merge commit (`a52b47b0`); (b) no: a native canonical `npm test` at the Gate 4 commit, under the authority the Gate 4 act provides; (c) PA designates the Gate 4 commit by separate act, then the native run occurs there (derived from Gate 4 §6 and packet §4.6; the packet does not state this option).

Q-B5 (no substantive decision): PA states which 'S2' each requirement refers to. The four uses are catalogued in packet §16.7 N-2.

### 5.2 Matter A — Q-A1 to Q-A6 (and A-GAP1)

Facts: packet §15.4 A-F1 to A-F8 (carried; A-F5 re-checked this pass). Post-basis items 10 (`portfolio_store.ts`, `540d49f2` vs designated `4a005b73`) and 12 (`tests/g3_startup_validation.test.ts`, `edd0305e` vs designated `9a5fd9e3`) differ at all six IPD refs from `001c3c80` to `0616ba2d`. The act's §8.2 stop is literally met there. At basis `5fc74085`, all 12 match.

Re-read this pass: IPD S1 determination §12.2 (lines 328–334) states the twelve designated blobs resolve 'as designated' and lists `edd0305e` for item 12. Act §2.1 designates `9a5fd9e3`. The packet records this as S-5. The statement is carried; IPD owns any correction (IPD-S1).

Options (packet §15.5): A-O1 record only; A-O2 PA ruling that DR-2 is the 'further act' for item 10 and the q1 test; A-O3 amended designated-blob list (IPD act) naming the observed blobs at a named commit; A-O4 fresh IPD act superseding §2.1 and §5.1; A-O5 reversion (IPD code change restoring the designated blobs). IRR cannot amend the act or any IPD path.

Minimum rulings: Q-A1 (is DR-2 a 'further act'; yes or no); Q-A2 (designate `9a5fd9e3` or `edd0305e`); Q-A3 (is §5.1 'exhaustive' repository-wide or workstream-scoped; if repository-wide, the record authorizing each out-of-set path in A-F8); Q-A4 (do the two PR #96 paths need an authorizing act; does `aa43dec2` documentation satisfy it); Q-A5 (mechanism and named commit); Q-A6 (is the §8.2 stop cleared by Q-A1 to Q-A5, or does execution need a fresh designation first).

A-GAP1 (no packet Q-ID; authority gap): Gate 4 act §6 row S1 reads 'BLOCKED — identity values unresolved' (act effective 2026-10-23). The IPD S1 determination (effective 2026-10-24) asserts resolved identity values. Packet A-F7 notes that the determination is not audited. PA should state which text governs the S1 status before any S1 step. IRR does not infer it.

### 5.3 Matter B — Q-B1 to Q-B4 and Q-B6 (and B-O4)

Options (packet §15.6): B-0 retain `001c3c80` as P-1 coordinate (attempt records no executing identity; DA-A1 receipt element needs waiver or deferral); B-1 designate one D2 commit or a later `C′` (must follow Matter A; needs fresh S2 and H-12 at that commit unless Q-B4 says otherwise); B-2 defer until IPD reports `C′`. B-O4 (option only): add `aa43dec2` as a B-1 candidate row. Q-B6 asks whether it is eligible at all.

Minimum rulings: Q-B1 (one choice); Q-B2 (if B-0: waive or defer the DA-A1 receipt element; head `001c3c80` or merge `1e76f4cf`); Q-B3 (if B-1: commit and tree, only after Q-A1 to Q-A6); Q-B4 (does H-12 regeneration gate L2a; PA-1 says H-12 adoption is not a P-1 prerequisite, while formal §4.6 step 5 requires H-12 at the designated commit); Q-B6 (eligibility of `aa43dec2`).

Gate 4 QE/H-12 pin (formal §4.5; labelled C-1, C-2, C-3 there): separate from Matter B and not a side effect of B-1.

### 5.4 Matter C — pre-designation host observation (packet §5)

Options: C-1 no host contact before designation and capture authorization; C-2 commit-independent host qualification first (A6, DC-a and DC-b under their own authorization), with commit-keyed observations and store contact only in the attempt session; C-3 as C-2, plus read-only F4 and root observations before the attempt, recorded as preparatory. Packet recommendation (IRR; not a decision): C-2, conditional on A6 being commit-independent; if not, C-1 applies to A6.

Open questions: C-Q1 (is A6 runtime commit-independent; the source does not state it); C-Q2 (are pre-attempt observations preparatory and re-observed in the attempt).

### 5.5 Matter D — non-mutating effective-write method (packet §6)

Options: D-1 ACL inspection as sufficient (accept the v2 `Get-Acl` dump; no effective-access result); D-2 published non-mutating effective-rights check in a new instrument revision (new identity under DB-B1; A6 before use); D-3 create-and-remove sentinel (writes into a directory; needs express authorization); D-4 rely on the historical REV2 probe (not verifiable; not recommended as sole evidence). Packet recommendation (IRR; not a decision): D-2, with D-1 as supporting evidence. First, PA must state the object of the criterion: the store parent `C:\iips-data\iips` or the store path, which must not exist (open in the record).

### 5.6 Matter E — capture authorization (packet §7)

E1 is row B-Q1; E2 is the Matter A rows (A-Q1 to A-Q6); E3 to E10 and E7, E8 have their own rows; E11 (attempt-session declaration) is inside CAP and E9. The capture authorization (E10) is not rendered and is not P-1 authorization. A capture does not spend the attempt, does not satisfy P-1-C or P-1-D, and does not authorize provisioning (procedure line 435).

E7 (native harness): does DC-C2 replace the native PowerShell 5.1 prerequisite for the next attempt (procedure §4.3a line 172), or does the native run remain required before a subsequent capture (bundle 06 line 6; bundle 10 line 8)? PA must state which governs.

E8 (root): procedure hard-codes `D:\iips-evidence` (lines 131, 150, 154, 167, 193, 440, 486; line 154 checks local fixed NTFS). The reported 10-27-02 root is `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`. PF-15 F5 is `C:\iips-evidence\cap03-gate4` (Gate 4 evidence root). PA chooses the root in writing; any root must be checked against the F4 and F5 literals and must not collide with them. IRR proposes no root.

PF-10: procedure line 147 checks the `GATE_A_PRIME_*` wildcard; instrument v2 (lines 91–98) checks the four named flags only. PA chooses: narrow the procedure to the four named flags, or keep the wildcard and change the instrument (new identity; own validation).

### 5.7 Naming and PF-15 literals — Q-N1, Q-B5, Q-P1

Q-N1: adopt the labels in packet §16.7 N-1, or name the options otherwise. Two further collisions are recorded in packet §11 (`PF-11`, `Limb A`) and have no Q-ID; PA may include them.

Q-P1 — the approved byte-level PF-15 literals as they appear in the committed acts (code spans; exact):

- F2 (31 bytes, 4 backslashes): `\\.\pipe\iips-user-portfolio-v1`
- F4 (39 bytes, 3 backslashes): `C:\iips-data\iips\user-portfolio.sqlite`
- F5 (28 bytes, 2 backslashes): `C:\iips-evidence\cap03-gate4`

Result this pass: the code-span contents of `-01` (blob `cbd500a7`) and `-02` (blob `3fe9a2dd`) are byte-identical for F2, F4 and F5. The `-02` act's 'transcription defect' premise for `-01` is not reproduced in the committed bytes. Treat that premise as recorded in the `-02` act, not as verified. PA either confirms these literal values or issues a further act with different values. IRR does not normalize or re-derive them.

### 5.8 Matter F — acceptance evidence (packet §8)

Specified, not accepted. Acceptance requires one attempt session's observations (P-1-C, P-1-D). No ruling is needed before the attempt.

## 6. Facts and conflicts recorded this pass (not resolved here)

- **F-1 (D2 anomaly closed).** The prior-memory anomaly was a typo in my base hash, not a git result. `888eb375..a9cd18e8` changes the two code files and the IPD tracker. See §1.1.
- **F-2 (S1 §12.2).** Carried packet S-5, re-read this pass; see §5.2 and row IPD-S1.
- **F-3 (Gate 4 S1 vs S1 determination).** See A-GAP1 (no Q-ID).
- **F-4 (duplicate question).** Q-S2-2 and Q-B7 ask the same question; recorded once in Table 1 with both IDs.
- **F-5 (IPD tracker in D2).** PR #102 changed the IPD tracker as well as the two code files. PA-5 §5.4 wording is 'exactly the two files'. Whether an evidence record falls within that wording is open (D2-REV; Q-A3 scope).
- **F-6 (IPD '3 unexplained').** The IPD record overstates the unexplained set; 2 of its 3 reproduce under the LF-plus-trailing-CRLF transform. IPD owns any correction (IPD-S2REC). IRR records it and does not edit it.
- **F-7 (DQ-4 count).** The manifest §7 table (dated 2026-10-25, interim) shows 6 of 10 met at its date. The 8/10 figure in the 2026-10-26 matrix is carried; the later increments (criterion 5 via the DQ-6b element-6 receipt; criterion 6 via the H-12 R5 adoption) are not re-verified in this pass.
- **F-8 (QE detail).** Read this pass: matrix §6 lines 244–254. All 11 NOT RUN; 0/11.
- **F-9 (Gate 5 text).** Not read this pass. Status carried from the lifecycle matrix.
- **F-10 (category count).** The request names 14 categories, not 15. Table 2 uses the 14 named.
- **F-11 (naming).** 'C-1/C-2/C-3' names both the Matter C options and the Gate 4 QE/H-12 pin choices (N-1).
- **F-12 (L2b).** Carried; not re-verified in this pass.

## 7. Verification record (investigation pass; read-only; carried into publication)

- IRR `git ls-remote` `main` → `9130dead`; `gh pr list --state open` → 0.
- IPD `git ls-remote` `main` → `0616ba2d`; `gh pr list --state open` → 0; `gh pr view` #100–#104 (state, merge time, merge and head identities).
- IPD scratch clone `/tmp/ipd-inv` (blobless, `0616ba2d`): `rev-parse` of commit, tree and designated paths; `merge-base --is-ancestor` for D2 candidates; `git diff --name-status` and `--stat` over `888eb375..a9cd18e8` and `a9cd18e8..0616ba2d` (runtime paths); `git show 0616ba2d:` successor act §§2, 2.1, 5.1, 8.2; Gate 4 act lines 190–200; S1 determination lines 190–196 and 319–345.
- IRR `git show origin/main:` for packet §§4–8, 14–16 (grep and range reads), formal record §§3.3, 8 and PA-5 lines, PF-15 `-01` and `-02` code-span byte comparison (python), procedure lines listed in §5, lifecycle matrix §6.
- IRR SHA256SUMS digest recomputation (53 entries) at `origin/main` in the prior pass (carried, not re-run).
- Not executed in this pass: any build, test, `npm`, `node --test`, `pwsh`, host command, capture, store probe, merge, closure, or PR or repository write.

## 8. Non-grants and boundary

Nothing in this document is a PA decision, a designation, a pin, a capture or P-1 authorization, an evidence acceptance, or a gate movement. Standing constraints remain: IRR-only writes; IPD read-only; no change to `BASIS_COMMIT` or `BASIS_TREE`; no invented approvals or signatures; production out of scope; V1102 remains OPEN; PF-11 `92d931fb` remains NOT PASSED and undiagnosed; A6 runtime NOT RUN; DC-C2 is not reopened for PA-3d diagnostics; A6 remains conformed without a deviation ruling.
