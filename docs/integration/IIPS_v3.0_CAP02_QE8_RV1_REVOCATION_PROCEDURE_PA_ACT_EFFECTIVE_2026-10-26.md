# CAP-02 — QE-8 Revocation Procedure: **Program Authority Decision `RV-1` — Option A — EFFECTIVE UPON PUBLICATION**

> ## STATUS: **PROGRAM AUTHORITY DECISION RENDERED — OPTION A SELECTED.** This act approves the QE-8
> revocation procedure of the decision request **for Option A (disposable-copy revocation) only**. It is
> an authority act: it **executes nothing**. No binding is revoked, touched, copied into a live store or
> inspected; no store exists; no host was contacted; no QE item was executed; no gate moves. U3 remains
> **AUTHORIZED — NOT STARTED**, QE **0/11**, U2-14 **BLOCKED / NOT STARTED** (P-1 unspent), U4 **NOT
> RENDERED**, U5 **NOT GRANTED / NOT INITIATED**, U6 writes **NOT AUTHORIZED**, PF-15 **NOT DESIGNATED**.
> QE-8 changes from `AWAITING PROGRAM AUTHORITY` to **`PROCEDURE APPROVED (RV-1, Option A) — NOT
> EXECUTED`**. Execution remains gated on the unchanged host sequence S2 → single P-1 → PF-15 → S3.

| Field | Value |
|---|---|
| Act ID | `IIPS-V3-CAP02-QE8-RV1-REVOCATION-PROCEDURE-PA-ACT-2026-10-26-01` (census before this act: **0** occurrences in IRR and IPD — `evidence/integration/cap02-qe8-rv1-pa-decision-2026-10-26/01-identifier-census.txt`; an in-flight identifier collision with merged PR #295 was reallocated and re-censused with 0 prior occurrences in `04-identifier-collision-and-reallocation.txt`; final allocation `CHG-2026-10-26-08`, `V806`–`V811`, tracker §16.131 / `CV-CORR-111`) |
| Record type | **Program Authority decision act (effective authority).** Not an execution record, qualification result, acceptance, admission or eligibility grant |
| Decision rendered (UTC) | `2026-10-26` |
| Program Authority (PA) | **Ramki** — single owner, sole user and Program Authority of the single-user personal-use IIPS platform; the same capacity that rendered Gate 3, `G3-AMEND-01`, Gate 4, Gate A′ successor, the S1 determination, H-12 R5 adoption and the CAP-03 DQ determinations |
| Preparing capacity | Arena Agent Mode — drafting, verification and publication only; never host execution and never the PA determination itself |
| Disposition of the request | Decision request `IIPS-V3-CAP02-QE8-REVOCATION-PROCEDURE-DECISION-REQUEST-2026-10-26-01` is **granted in part — Option A selected; Options B, C and D not selected** |
| Governing locus | IRR `ramkivs/iips-review-recovered` (`refs/heads/main`); IPD `ramkivs/iips-production-market-data` inspected **read-only** at `main@f5eddbc20b944a098a9060a8e3349c6d10b7843e` and QE pin `8eec74ae27cda09f3c368b9c299895eae41554db` — **zero IPD writes** |
| Governing criteria | Gate E write policy rev 1 §4 QE-8, **W-3**, accepted G2-D5 disposition (IPD blob `4a9501bffb49abbbc0ba5b5c4f81d2841812913e`); Gate 4 act `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01` (blob `66b56fd1…`) §5/§7/§14; Gate A′ successor provisioning act (blob `528de6ae…`) §5/§8/§9; S1 determination (blob `b7746b5e…`) |
| Adopted procedure | Decision request §3.1–§3.7 (minimum no-code procedure), adopted **verbatim and in full**, with the Option A boundary of this act §3 made controlling wherever wording could be read as touching the authoritative store |
| Target identifiers (as named in the request) | binding `binding_id c5808abaffd072d6401ce63ad86c6ac0`; membership `membership_id d25dcc5370100b00766efc5166f65cf3`; principal `ramki-personal-local` — these rows are acted upon **only inside the disposable copy**, never in the authoritative store |
| Evidence | `evidence/integration/cap02-qe8-rv1-pa-decision-2026-10-26/` |

---

## 1. Authority basis — why this act is effective, and what it does not rely on

### 1.1 The two-element basis

1. **Standing grant and its interpretation.** The F-3 mechanism/implementation PA decision
   (`docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md`,
   blob `c4c9f7d7…`) read with `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` rules
   `R-1`–`R-9` (blob `4be3ea57…`): project-wide authority within established scope, with value-selection
   authority **not** exercised by the preparing capacity and genuine uncertainty named rather than
   manufactured (`R-2`, `R-9`).
2. **Express PA instruction for this determination.** On `2026-10-26` the Program Authority, presented
   the four alternatives of request §4 with their full consequences, rendered an **explicit selection of
   Option A — disposable-copy revocation** — and directed that the effective `RV-1` act be drafted and
   published through the authorized repository process. This express selection is the dispositive
   element; it is the same class of one-pass PA instruction under which the H-12 R5 adoption act was
   rendered effective (`IIPS-V3-CAP03-G4-H12-R5-PA-ADOPTION-ACT-2026-10-25-01` §1.1 element 2).

### 1.2 Anti-inference clause (express)

The selection was **not** inferred from, and this act does not treat as approval: the request's
recommendation of Option A; the implemented W-3 wiring; green CI or local revocation tests; the Gate 4
§7 execution/recording grant; the Gate A′ one-use P-1 grant; the S1 value determination; or any earlier
act. The request's own authority analysis (§2) and the independent remote recheck
(`08-remote-authority-recheck.txt`, re-run in `00-remote-baseline-and-authority-recheck.txt`) establish
that none of those instruments delegates this approval, and that no rendered `RV-1` existed in either
locus before this act. The decision is effective solely on §1.1.

### 1.3 Basis re-verified at rendering

The technical basis of the four alternatives was re-read against the live remotes immediately before
this act (`02-ipd-implementation-reverification.txt`): IPD `main` is unchanged at `f5eddbc2…` (zero
commits since `2026-10-26T00:00Z`); `portfolio_store.ts` blob `540d49f2…`, `binding.ts` `96d0079d…` and
`gateAPrimeProvisioning.ts` `2cbce83f…` are byte-identical to the request's citations; W-3
(`BEGIN IMMEDIATE` → `resolveActiveBindingInCurrentTransaction()` → `ResourceUnavailableError`) is present;
the 650-entry tree contains **0** `/revok/i` paths and code search returns 0; `STORE_ALREADY_EXISTS` /
`ALREADY_PROVISIONED` confirm the one-way consequence for the authoritative store. No new evidence
changes any alternative's consequence, so no re-investigation was required or published.

## 2. Verbatim determination — `RV-1` rendered

> **`RV-1`.** The Program Authority hereby **APPROVES** the QE-8 revocation procedure at §3 of
> `IIPS-V3-CAP02-QE8-REVOCATION-PROCEDURE-DECISION-REQUEST-2026-10-26-01`, **applicable to Option A
> (disposable-copy revocation) only**, executable once by operator Ramki on `desktop-no0nhtp` under the
> effective Gate 4 act `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01`, strictly after
> S2 pass → the single P-1 → the PF-15 designation → S3 preflight, bounded and guarded by this act and by
> the request's preconditions (§3.2), permitted action (§3.3), prohibitions (§3.4), evidence set E1–E9
> (§3.5), stop conditions (§3.6) and recovery constraints (§3.7), all adopted verbatim and supplemented
> by the Option A boundary in §3 below. **Options B, C and D are not selected.** This approval
> authorizes only the act described; it grants no restoration, re-activation, re-association, purge,
> second binding, second provision, operation against the authoritative store, operational write, W-1
> relaxation, fence change, H-12 change, acceptance, admission or production eligibility.

## 3. Option A — the disposable-copy boundary (explicit, controlling)

The following boundary makes Option A what it is: a component-classed observation on a throwaway copy,
with the authoritative binding provably untouched. Every clause is a mandatory execution condition.

1. **Two stores, one target role.** After the single P-1 there is exactly one authoritative store
   (the P-1 store holding the sole `ACTIVE` binding/membership). The QE-8 procedure creates **one
   byte-level file copy** of that store at a **distinct absolute path** — local fixed NTFS, outside every
   Git worktree, unsynchronized, non-elevated-writable — recorded verbatim in the evidence. The copy is
   the **only** database the §4 statements may run against. The audit event's `detail.storePathRole` is
   fixed to the literal string **`'disposable-copy'`**; any other value is a stop condition.
2. **Byte identity before any statement.** Before `BEGIN`, the operator records SHA-256 of the
   authoritative store file and of the copy; the two hashes **must be equal**, and both are recorded in
   E1. A mismatch is `NOT EXECUTED — copy not byte-identical`; no transaction opens.
3. **Connection discipline.** The connection that executes the §4 statements is opened against the
   copy path and its `PRAGMA database_list`/opened-file identity is captured in E2 proving the connected
   file is the copy. The authoritative store connection runs **no mutating statement at all** during the
   QE-8 session. If the connected path cannot be proven to be the copy, the operator stops before any
   `UPDATE`.
4. **Process re-pointing is scoped.** The IRR/IPD processes are pointed at the copy **for the QE-8
   limbs only** (revocation, read/write refusal, restart refusal, race). All other QE items continue
   against the authoritative store; after the QE-8 limbs the processes are returned to the authoritative
   store, with the re-point and return both transcripted (PIDs, exit codes, UTC times).
5. **Authoritative-store delta-zero proof.** At session start and again after the QE-8 limbs, the
   authoritative store file SHA-256 is re-measured and its binding/membership tables dumped. The hashes
   must be identical and the authoritative rows must remain exactly one `ACTIVE` binding and one `ACTIVE`
   membership with `revoked_at IS NULL`. Any drift is a FAIL finding and an immediate stop/return to the
   PA; under Option A correct execution makes drift impossible.
6. **No live-service claim for the copy.** The copy is a qualification fixture, not a provisioned
   operational store. Nothing in this act designates it an endpoint target beyond the QE-8 limbs, and
   PF-15 (when rendered) is not implicitly extended to it; the act's own audit/evidence records carry the
   role.
7. **Copy disposition.** The copy is **retained with the QE evidence deposit** in its revoked state
   (retained-and-inaccessible, per G2-D5). This act authorizes **no deletion, purge or reactivation** of
   the copy; any later disposal is a separate governed record. The authoritative store is never disposed
   of.
8. **Evidence ceiling — component only.** Every observation produced under Option A — the race limbs,
   read refusal, write refusal, restart refusal — is **Tier 2 component evidence (T2)**. It is **never
   recorded as a full-path PASS**, never relabelled to raise its class, and never used to claim Gate 4
   completion by itself. The five-class vocabulary (`PASS` · `FAIL` · `INCONCLUSIVE` ·
   `NOT EXECUTED — <reason>` · `INVALID`) governs; a limitation stays a limitation. The runbook hard
   rule "component evidence is never full-path qualification" applies verbatim.

## 4. Scope, preconditions, authorized actions, evidence, stop and recovery (adopted)

### 4.1 Scope (request §3.1, adopted)

One revocation of one binding/membership pair **inside the single disposable copy**, once, in one
transaction, during a single CAP-02 Gate 4 QE run, under the effective Gate 4 act and this act ID.
Nothing else. No product code, route, IPC operation or schema change is authorized; W-1, the fences and
the H-12 manifest are untouched (the copy changes data bytes only, and no manifest-bound source path
changes).

### 4.2 Preconditions (request §3.2, adopted; all must hold)

1. S2 passed (5/5) at IPD `8eec74ae…`/tree `4eba2902…` on `desktop-no0nhtp`;
2. the single P-1 executed successfully with V-A2-1…V-A2-8 recorded (exactly one `ACTIVE` binding and membership in the authoritative store);
3. S3 preflight PF-01…PF-17 passed, including the PA's PF-15 endpoint/local-state designation;
4. QE-1…QE-7 and QE-11 complete or explicitly deferred so no binding-dependent item is stranded;
5. H-12 R5 digests re-verified at run start (`f4649e36…`/`d0be8bef…` + supplement `6c777de6…`);
6. evidence root absolute, outside every worktree, unsynchronized; per-command UTC start/end and exit codes captured;
7. pre-revocation capture complete (store SHA-256; table dumps; audit chain head and row count; content-table row counts; PIDs);
8. the operator records both store paths verbatim and their roles; **plus the Option A conditions of §3** (byte-identical copy hash, proven copy connection, `storePathRole='disposable-copy'`, delta-zero proof plan).

Any failure is `NOT EXECUTED — <reason>`.

### 4.3 Authorized actions (request §3.3, adopted; copy-only)

One `BEGIN IMMEDIATE` … `COMMIT` on the copy connection containing exactly the two `UPDATE` statements
of request §3.3 (binding then its single membership, each guarded to affect **exactly 1** row) plus one
chained audit line via the existing exported `appendAuditEvent` — `eventType
'local_principal_binding.revoked'`, `detail: { bindingId, membershipId, revokedAt, actId:
'IIPS-V3-CAP02-QE8-RV1-REVOCATION-PROCEDURE-PA-ACT-2026-10-26-01', runId, storePathRole:
'disposable-copy', priorStatus: 'ACTIVE', priorAuditHead }` — followed by `COMMIT`. Also authorized: the
single file-level copy operation, the scoped process re-point/return, and the E1–E9 capture. Nothing
else.

### 4.4 Prohibited (request §3.4, adopted and extended)

`DELETE`, `DROP`, `VACUUM`, `PRAGMA writable_schema`, any second `UPDATE`, any binding/membership
`INSERT`, any re-activation, any owner/tenant change, transfer/reassignment, purge or file deletion, any
operation on a store other than the named copy, **any mutating statement against the authoritative
store**, any elevation or enabling flag, any route/`503` change, any W-1 change, any product source
edit, any H-12 manifest change, and any endpoint restart before the post-revocation capture completes.

### 4.5 Evidence (request §3.5 E1–E9, adopted; Option A additions)

E1 pre-revocation dumps + SHA-256 manifest **for both stores with the equality proof**; E2 verbatim
statements and transaction transcript **with the connected-file identity**; E3 audit line + full chain
verification; E4 post-state dump (2 × `REVOKED`, 0 × `ACTIVE` in the copy); E5 read-refusal transcripts
before restart and after both IRR and IPD restarts; E6 write-refusal transcript with zero-effect row
counts; E7 race transcripts for both schedules (revocation-first → `ResourceUnavailableError`, zero
delta; write-first → one legitimate pre-revocation revision then no further commit); E8 G2-D5 posture
observations; E9 run manifest with SHA-256 of every artifact deposited at
`evidence/cross-repository/cap02_gate4_qe_<date>_<run-id>/` per Gate 4 act Q8. **Added:** the
authoritative-store delta-zero record (§3.5) and the re-point/return transcript. All QE-8 observations
are classed **component (T2) — never full-path PASS**.

### 4.6 Stop conditions (request §3.6, adopted; Option A additions)

Any precondition unmet · any changed-row count ≠ 1 · any `ACTIVE` row remaining or a second `ACTIVE`
row appearing in the copy · any post-revocation commit · any digest drift (H-12 or either store) · any
need for a statement outside §4.3 · any audit-chain break · any read or write still succeeding after
revocation · any attempt to re-provision, re-activate, purge or transfer · any temptation to record a
limitation as PASS · **the connected database cannot be proven to be the disposable copy · the copy hash
differs from the authoritative store hash · the authoritative store hash or rows change at all ·
`storePathRole` is not `'disposable-copy'`**. On any stop: preserve raw output, record
`NOT EXECUTED — <reason>` or `FAIL` honestly, and return to the PA. There is no operator override.

### 4.7 Recovery constraints (request §3.7, adopted)

No restoration, re-activation, re-association or purge is authorized. Revoked-binding data in the copy
stays retained-and-inaccessible; regaining access would require a separate G2-D5(4) governed act, which
does not exist. Because the authoritative store is untouched by design, it remains operable for the
other QE items and for any later run; no fresh P-1 act and no new store path are caused by Option A. If
Option A cannot be completed honestly, the operator records the stop and **does not silently substitute
Option B, C or D** — each of those requires its own rendered PA act with its own consequences (B's
irreversibility and spent sole identity; C's implementation act and H-12 regeneration; D's deferral).

## 5. Effect on gates and on independent execution progress

### 5.1 What changes

| Item | Before this act | After this act (still before any host execution) |
|---|---|---|
| RV-1 / QE-8 procedure | PROPOSED — AWAITING PROGRAM AUTHORITY | **APPROVED — Option A effective upon publication; QE-8 `PROCEDURE APPROVED — NOT EXECUTED`** |
| QE executed | 0/11 | **0/11** (no execution authorized or possible from this environment) |
| Revocations executed | 0 | **0** |
| Authoritative binding `c5808…` | untouched | **untouched** (Option A forbids mutating it) |
| P-1 | NOT EXECUTED, unspent | NOT EXECUTED, unspent |

### 5.2 What does not change — independent progress preserved

- **S2 remains a designated-Windows operator task** on `desktop-no0nhtp` (native Windows 11,
  non-elevated Ramki, Node `>=22.13.0 <23`, flag-free `node:sqlite`). This act is **not** a prerequisite
  for S2 and creates no Linux/WSL/CI/alternate-host substitution.
- **P-1 remains blocked until S2 passes**, single-use, then strictly ordered before S3. RV-1 neither
  unblocks nor consumes P-1.
- **PF-15 remains a separate Program Authority decision** (`IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-DECISION-REQUEST-2026-10-26-01`,
  still `NOT DESIGNATED`) required before S3. Rendering RV-1 does not render, imply or substitute for
  PF-15, and PF-15 is not a prerequisite for this act.
- **No QE-8 dependency is imposed on S2, P-1 or S3.** Per request §6, RV-1 blocks QE-8 only; nothing in
  QE-1…QE-7, QE-9…QE-11 depends on it.
- U3 stays **AUTHORIZED — NOT STARTED**; U4 acceptance **NOT RENDERED**; U5 **NOT GRANTED / NOT
  INITIATED**; U6 writes **NOT AUTHORIZED**; `WRITE_NOT_AUTHORIZED`, `evaluatePortSaveGuard()`
  hard-false and all twelve `/api/user-portfolios*` `503` fences are untouched; W-1 remains
  **NOT AUTHORIZED**; the H-12 R5 manifest and its supplement are unchanged.

### 5.3 What this act can never establish

A component (T2) QE-8 observation under Option A is not a full-path revocation qualification, not Gate 4
completion, not U4 acceptance, not Gate 5 admission and not production eligibility. Those remain
separate, evidence-bound acts. CI green, this publication and the W-3 implementation supply none of
them (DEC-06 R-3/R-5).

## 6. Effectiveness and publication

This act becomes **EFFECTIVE in the governing IRR locus** upon: (1) merge to `main` by a regular
2-parent merge (`--merge`); (2) green exact-head CI; (3) green post-merge `main` CI (a documented
concurrency cancellation plus a green superseding run with ancestry established is recorded as such,
not disguised); and (4) independent remote read-back of the merged blobs — identity **and**
completeness. Publication coordinates are recorded exclusively in the post-merge tracker receipt
(§16.131.7); this act self-embeds no PR number, merge commit, CI run or blob identity, per the
§16.130.6 protocol. Until those four conditions hold, the decision is rendered but not yet effective,
and the request's AWAITING state stands. No IPD write is made or required; an IPD-locus cross-receipt
remains optional bookkeeping for an IPD-capable session and is not an effectiveness element of this
IRR-locus act.

## 7. Non-grants and attestation

This act renders one PA determination — the Option A approval of the QE-8 revocation procedure — and
nothing else. It executes no statement, revokes no binding, creates no store or copy, dispatches no host
command, writes no IPD file, moves no gate, claims no QE result, and grants no acceptance, admission,
write or production eligibility. Counts at publication: QE executed **0/11**, revocations executed
**0**, bindings touched **0**, stores/copies created **0**, host commands dispatched **0**, IPD writes
**0**, fence/W-1/manifest changes **0**.

*End of `IIPS-V3-CAP02-QE8-RV1-REVOCATION-PROCEDURE-PA-ACT-2026-10-26-01`. QE-8: procedure **APPROVED
under Option A (disposable copy; component evidence only; authoritative binding untouched)** —
**NOT EXECUTED**; the host sequence S2 → P-1 → PF-15 → S3 is unchanged and remains the next
dependency-respecting path.*
