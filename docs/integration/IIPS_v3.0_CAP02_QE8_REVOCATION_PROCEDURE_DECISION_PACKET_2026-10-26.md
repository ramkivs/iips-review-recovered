# CAP-02 — QE-8 Revocation Procedure: **Decision Request (PROPOSED — NOT EFFECTIVE; NO APPROVAL RENDERED; NOTHING EXECUTED)**

> ## STATUS: **DECISION REQUIRED — AWAITING PROGRAM AUTHORITY.** No revocation procedure is approved by this
> record. No binding is revoked, touched, copied or inspected. No store exists, no host was contacted, no QE
> item was executed and no gate moves: U3 remains **AUTHORIZED — NOT STARTED**, QE **0/11**, U2-14 **BLOCKED /
> NOT STARTED**, U4 **NOT RENDERED**, U5 **NOT GRANTED / NOT INITIATED**, U6 writes **NOT AUTHORIZED**.
>
> This record exists because QE-8 cannot be executed honestly without an express Program Authority
> determination, and because the determination is **not** one the preparing pass may render for itself. It
> supplies the analysis, the minimum procedure and the alternatives so that the determination can be made in
> one reading.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP02-QE8-REVOCATION-PROCEDURE-DECISION-REQUEST-2026-10-26-01` (census before this record: 0 in IRR, 0 in IPD) |
| Record type | Decision request / procedure draft. **Not** an approval, act, procedure, execution record, qualification result or acceptance |
| Prepared | 2026-10-26 (UTC) |
| Prepared by | Arena Agent Mode — analysis, drafting and publication only; never host execution and never a PA determination |
| Decision owner | **Ramki — Program Authority** (the capacity that rendered Gate 3, `G3-AMEND-01`, Gate 4, Gate A′ successor, the S1 determination and H-12 R5 adoption) |
| Locus | IRR `ramkivs/iips-review-recovered`; IPD inspected read-only (zero IPD writes) |
| Governing criteria | Gate E write policy rev 1 §4 QE-8, **W-3** and the accepted G2-D5 disposition (IPD blob `4a9501bffb49abbbc0ba5b5c4f81d2841812913e`); Gate 4 act `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01` §5/§7/§14 (blob `66b56fd1…`); Gate A′ successor provisioning act §5/§8/§9 (blob `528de6ae…`); S1 determination (blob `b7746b5e…`) |
| Implementation basis examined | IPD `main@f5eddbc20b944a098a9060a8e3349c6d10b7843e` and designated QE pin `8eec74ae27cda09f3c368b9c299895eae41554db` (blobs identical for the paths cited) |
| Evidence | `evidence/integration/cap02-qe8-revocation-and-matrix-integrity-2026-10-26/01-…`, `05-…`, `06-…` |

---

## 1. What the criterion requires, and what the code can actually do

| # | Finding | Evidence |
|---|---|---|
| **F1** | **The criterion.** Gate E §4 QE-8 (verbatim): *"**Revocation:** after binding revocation, writes and reads refused, including after restart; revocation racing a write never yields a post-revocation commit."* Its mechanism is **W-3**: *"The binding (and its single `ACTIVE` membership) is re-read and checked **inside the same immediate/serialized transaction** that performs the mutation. If the binding is not `ACTIVE` at that point, the transaction aborts with no effect. A revocation that commits first therefore always wins over a racing write."* | Gate E §4 / W-3, blob `4a9501bf…`; repeated as `01-…txt` §A–B |
| **F2** | **W-3 is implemented at the designated pin.** `DurablePortfolioStore.withBrokerImportTransaction()` opens `BEGIN IMMEDIATE`, calls `resolveActiveBindingInCurrentTransaction(db)`, refuses `ResourceUnavailableError` on a non-`ACTIVE` binding/membership or owner mismatch, and only then runs the mutation. Implemented under the **effective** U2 transaction/binding revalidation amendment (IPD `evidence/cross-repository/IIPS_V3_CAP02_U2_TRANSACTION_BINDING_REVALIDATION_AMENDMENT_2026-10-23.md`). Blobs: `portfolio_store.ts 540d49f2…`, `binding.ts 96d0079d…` — **identical at pin `8eec74ae` and at `main@f5eddbc2`**. | `05-…txt` |
| **F3** | **No governed revocation operation exists anywhere in the product.** Recursive tree at IPD `main@f5eddbc2` (566 blobs): files matching `/revok/i` = **0**; `src/persistence/*` exports no revoke function; no IPC operation, route, CLI or `package.json` script revokes a binding; no audit event type for revocation is emitted. The only revocation statements in the repository are **test-fixture SQL** (`UPDATE … SET status='REVOKED'`) inside `tests/g3_binding_resolution.test.ts` (L92–95, L287–293) and `tests/q1_broker_import_durability.test.ts` (L415–496). | `05-…txt`, `06-…txt` |
| **F4** | **The sole-binding target is one-way under current authority.** (a) The QE-8 target is *the* sole ACTIVE binding (`binding_id c5808abaffd072d6401ce63ad86c6ac0`, `membership_id d25dcc5370100b00766efc5166f65cf3`; V-A2-2 requires exactly one `ACTIVE` row). (b) After revocation the store file still exists and still contains a binding/membership row, so `provisionActiveBinding` refuses **`STORE_ALREADY_EXISTS`** (file pre-exists) and **`ALREADY_PROVISIONED`** (a row exists in *any* state) before opening any write. (c) Re-activating a revoked row is precisely the *"explicit, governed recovery, reassignment or deletion action"* that G2-D5 point (4) reserves to a separate act — none exists. Therefore revoking the authoritative binding permanently ends that store's operability and requires a **new store path plus a fresh one-use P-1 act**. | `06-…txt`; successor act §8/§9 |
| **F5** | **G2-D5 additionally requires the failure behaviour to be *defined* before qualification.** (5) *"The failure behaviour must be defined and tested before qualification or admission (QE-8)."* This is the effective PA policy that turns "revoke it and see" into "a defined, authorized procedure first". | Gate E blob `4a9501bf…` §6 (G2-D5), line 132 |

**The gap, stated precisely.** The *mechanism* QE-8 measures (W-3) is implemented; the *action* QE-8 requires
(revoking a binding) has **no governed definition, no authorized executor and no approved target**. The
readiness packet's phrase "PA-approved revocation procedure" is therefore correct in substance, but it is a
CAP-03-scoped record whose other statements (no pins, H-12 not adopted) are stale for CAP-02 and are **not**
imported here; the CAP-02 basis is G2-D5(4)(5) plus Gate E §4 directly.

## 2. Authority analysis — why this pass may not approve its own procedure

| Instrument | What it grants | Does it approve a revocation procedure? |
|---|---|---|
| Gate 4 act `…2026-10-23-01` §7 (Q6) | QE-1…QE-11 **execution and recording** on the designated host at designated commits | **No.** It is execution/recording authority. §14 lists what it deliberately does **not** disguise as approval, and the word "revoc…" appears **0 times** in the act. The act's §5 limitation note (written 2026-10-23, before the W-3 wiring landed) even assumes no in-transaction re-read. |
| Gate A′ successor provisioning act §9 | One bounded P-1 execution | **No.** §9 non-grants expressly include *"purge, re-association or restoration of revoked-binding data"*. A revocation procedure is not granted, and the act is consumed by P-1. |
| S1 identity-value determination | The three identity values + deterministic ids | **No.** Value selection only; "revoc…" = 0 matches. |
| H-12 R5 adoption act | The manifest baseline | **No.** Digest adoption only. |
| G2-D5 (PA, 2026-10-18) | The **policy** for revoked-binding data (five points) | **No.** It *requires* a governed action and a defined failure behaviour; it does not define them, and it says of itself: *"approved policy for future implementation… not represented as implemented or tested."* |
| Gate E §4 QE-8 | The acceptance criterion | **No.** A criterion is not a procedure. |

**Determination of this record: no effective instrument approves a QE-8 revocation procedure, and no
instrument delegates that approval.** Implementation authority is not approval authority; CI green, the W-3
wiring, the local revocation tests and the Gate 4 execution grant do not create it. The determination is
therefore the Program Authority's, and this record requests it rather than assuming it.

## 3. The minimum procedure that would satisfy QE-8 (DRAFT — PROPOSED, NOT EFFECTIVE)

Deliberately minimal: it adds **no product code, no route, no IPC operation and no schema change**, so it
disturbs neither W-1, nor the fences, nor the H-12 manifest. Everything below is text a PA act would adopt
verbatim (including the alternative it selects in §4).

### 3.1 Scope
One revocation of **one** binding/membership pair (`c5808abaffd072d6401ce63ad86c6ac0` /
`d25dcc5370100b00766efc5166f65cf3`) on **one** store, once, in **one** transaction, during a single CAP-02
Gate 4 QE run, under the effective Gate 4 act and the approved act ID. Nothing else.

### 3.2 Preconditions (all must hold; any failure is `NOT EXECUTED — <reason>`)
1. S2 passed (5/5) at IPD `8eec74ae…`/tree `4eba2902…` on `desktop-no0nhtp`.
2. The single P-1 was executed successfully and V-A2-1…V-A2-8 are recorded (exactly one ACTIVE binding and membership).
3. S3 preflight PF-01…PF-17 passed, including the PA's PF-15 endpoint/local-state designation.
4. QE-1…QE-7 and QE-11 (or the PA's declared order) are **complete or explicitly deferred** — see §4 consequence table; the procedure must not strand later binding-dependent items.
5. H-12 R5 digests re-verified at run start (`f4649e36…`/`d0be8bef…` + supplement `6c777de6…`).
6. Evidence root absolute, outside every worktree, unsynchronized; per-command UTC start/end and exit codes captured.
7. Pre-revocation capture complete: store file SHA-256; `SELECT` dumps of both tables; audit chain head (`entry_checksum`) and row count; `portfolio_revisions`/holdings/contribution row counts; process PIDs.
8. The operator records the target store path verbatim and whether it is the authoritative P-1 store or a disposable copy (that is the §4 choice).

### 3.3 Exact permitted action (and nothing else)
One `BEGIN IMMEDIATE` … `COMMIT` on the operator's single connection, containing exactly:

```sql
-- 1. binding
UPDATE local_principal_bindings
   SET status = 'REVOKED', revoked_at = :utc, updated_at = :utc
 WHERE binding_id = 'c5808abaffd072d6401ce63ad86c6ac0'
   AND principal_label = 'ramki-personal-local'
   AND status = 'ACTIVE';
-- 2. its single membership
UPDATE local_principal_memberships
   SET status = 'REVOKED', revoked_at = :utc, updated_at = :utc
 WHERE membership_id = 'd25dcc5370100b00766efc5166f65cf3'
   AND binding_id = 'c5808abaffd072d6401ce63ad86c6ac0'
   AND status = 'ACTIVE';
```

plus **one** chained audit line appended with the existing exported `appendAuditEvent` (caller-owned
transaction) — `eventType: 'local_principal_binding.revoked'`, `subjectType:
'local_principal_binding'`, `subjectId: 'ramki-personal-local'`, `detail: { bindingId, membershipId,
revokedAt, actId, runId, storePathRole, priorStatus: 'ACTIVE', priorAuditHead }` — followed by `COMMIT`.

Guards, all mandatory: each `UPDATE` must report **exactly 1** changed row, otherwise `ROLLBACK` and stop; the
audit chain must verify after commit; the store file SHA-256 must change and be re-recorded; the post-state
must be exactly two `REVOKED` rows with `revoked_at` set and **zero** `ACTIVE` rows.

### 3.4 Prohibited under this procedure
`DELETE`, `DROP`, `VACUUM`, `PRAGMA writable_schema`, any second `UPDATE`, any `INSERT` of a binding or
membership, any re-activation (`status='ACTIVE'`), any owner/tenant value change, any transfer/reassignment,
any purge or file deletion, any operation on a store other than the one named, any elevation, any enabling
flag, any route/`503` change, any W-1 change, any product source edit, any endpoint restart before the
post-revocation capture is complete.

### 3.5 Expected evidence (the QE-8 artifact set)
`E1` pre-revocation `SELECT` dump + SHA-256 manifest; `E2` the verbatim statement text and the transaction
transcript (BEGIN…COMMIT, changed-row counts, exit code, UTC timing); `E3` the audit line + full chain
verification; `E4` post-state table dump (2 × `REVOKED`, 0 × `ACTIVE`); `E5` read-refusal transcripts —
`portfolio.get`, `.revisions`, `.list` — before restart and after both IRR and IPD process restarts (QE-4
pattern, PIDs and exit codes recorded); `E6` write-refusal transcript with before/after row counts proving
zero effect; `E7` race transcripts for both schedules (revocation-commits-first → `ResourceUnavailableError`,
zero delta; write-commits-first → legitimate pre-revocation revision, then no further commit); `E8` G2-D5
posture observations (denied access; no transfer; no silent deletion; retained-and-inaccessible); `E9` run
manifest + SHA-256 of every artifact, deposit at `evidence/cross-repository/cap02_gate4_qe_<date>_<run-id>/`
(Gate 4 act Q8). All statuses use the five-class vocabulary; the race is evidence-ceiling **component (T2)**
and is never recorded as a full-path PASS.

### 3.6 Stop conditions (stop, record, return to the PA)
Any precondition unmet · any changed-row count ≠ 1 · any `ACTIVE` row remaining or a second `ACTIVE` row
appearing · any post-revocation commit · any digest drift · any need for a statement outside §3.3 · any
audit-chain break · any read or write still succeeding · any attempt to re-provision, re-activate, purge or
transfer · any temptation to record a limitation as PASS.

### 3.7 Recovery constraints
No restoration, re-activation, re-association or purge is authorized by this procedure. Revoked-binding data
stays retained-and-inaccessible; regaining access requires a **separate** G2-D5(4) governed act. If the target
was the authoritative store, further CAP-02 work requires a **new store path plus a fresh one-use P-1 act**
(F4).

## 4. Alternatives the Program Authority must choose between

| Option | What is approved | Evidence value | Consequence / cost |
|---|---|---|---|
| **A — Revoke on a disposable copy (recommended)** | The §3 procedure, executed once against a **byte copy** of the post-P-1 store at a path outside every worktree; the real IRR/IPD processes are then pointed at the copy for the QE-8 limbs | Tier 2 component evidence for the race + read/write refusal and restart refusal; G2-D5 posture observable | Authoritative binding **untouched**; no H-12 change (data only); later QE items keep their store. Cost: the revocation is not on the authoritative store, so this is component/limitation-classed, **never** a full-path PASS |
| **B — Revoke the sole authoritative binding, ordered last** | The §3 procedure on the P-1 store, only after every other binding-dependent item is complete, with an archived pre-revocation byte copy | Highest fidelity: the only route to a full-path revocation observation on the qualified store | **One-way**: that store can never be provisioned again (F4); a fresh P-1 act + new path is needed for any later CAP-02 run; re-access needs the separate G2-D5(4) act. It also consumes the only identity the platform has |
| **C — Implement a governed revocation entrypoint first** | A new PA implementation act for a product-level revoke operation (IPC/CLI + audit event + tests), then A or B | The durable answer to G2-D5's "explicit governed action"; testable and re-usable | Requires implementation authority, new code and tests, **H-12 manifest regeneration/validation/re-adoption** (a new source path changes the bound manifest) and re-qualification of the affected surface; delays QE-8 |
| **D — Defer QE-8** | Nothing; QE-8 recorded `NOT EXECUTED — no approved revocation procedure` | Honest, zero risk | QE stays **0/11**; U4 cannot be rendered for a complete Gate 4; Gate 5 remains unreachable |

**Recommendation: A now, C after acceptance; B only if the PA requires an authoritative full-path revocation
observation and accepts that the sole identity is spent.** A keeps QE-8 honest and bounded while leaving the
store, the manifest and every downstream gate intact.

## 5. The exact determination requested

> **RV-1.** The Program Authority approves the QE-8 revocation procedure at §3 of
> `IIPS-V3-CAP02-QE8-REVOCATION-PROCEDURE-DECISION-REQUEST-2026-10-26-01`, applicable to **Option ___**
> (A / B / C / D), executable once by operator Ramki on `desktop-no0nhtp` under the effective Gate 4 act
> `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01`, strictly after S2 pass → single P-1 →
> PF-15 designation → S3 preflight, with the evidence set E1–E9, the stop conditions and the recovery
> constraints as written. This approval authorizes **only** the act described; it grants no restoration,
> re-association, purge, second binding, second provision, operational write, W-1 relaxation, fence change,
> acceptance, admission or production eligibility.

Until that text is rendered and published, QE-8 remains **`NOT EXECUTED — no approved revocation procedure`**
and the sole operator binding must not be touched, copied into a live store, or revoked by any means.

## 6. What this request does and does not block

- **Blocks:** QE-8 only. Nothing in QE-1…QE-7, QE-9…QE-11 depends on it, and no other CAP-02 precondition is
  relaxed or satisfied by it.
- **Does not block:** S2, P-1, S3 (PF-15 remains the separate gate), or the preparation work already published.
- **Does not grant:** anything. Approval, when rendered, will still need the evidence and the separate U4
  acceptance.

## 7. Non-grants and attestation

This record renders **no** determination, approves **no** procedure, executes **no** statement, touches
**no** binding, store, host or IPD file, and changes **no** status. It asserts no QE result and no
qualification. Counts: QE executed **0/11**, revocations executed **0**, bindings touched **0**, host
commands dispatched **0**, IPD writes **0**.

*End of `IIPS-V3-CAP02-QE8-REVOCATION-PROCEDURE-DECISION-REQUEST-2026-10-26-01`. QE-8 status:
**AWAITING PROGRAM AUTHORITY — procedure not approved, not executed, sole binding untouched.***
