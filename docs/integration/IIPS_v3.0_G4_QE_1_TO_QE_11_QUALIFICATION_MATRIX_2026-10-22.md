# IIPS v3.0 — Gate 4 QE-1…QE-11 Qualification Matrix (Prepared Reference — Not Authority)

> ## STATUS: **PREPARED REFERENCE MATRIX — NOT AN AUTHORIZATION — NOT A QUALIFICATION RESULT**
>
> - This matrix reproduces the **existing authoritative QE-1…QE-11 definitions** and maps each item to the
>   fields required for the proposed Gate 4 Target-Host Qualification Authority Act. It **creates no
>   criterion**. Where the authoritative record does not establish a field, the cell is marked **`[GAP]`**
>   and any proposed content is marked **`[P]` (proposed, not pre-existing authority)**.
> - **Gate 4 is `NOT AUTHORIZED / NOT STARTED`.** Nothing here executes, passes, accepts, or qualifies
>   anything. No QE item may be cited as satisfied, and no criterion marked `[P]` may be cited as
>   pre-existing authority.
> - No signature, approval, PA decision, or effective act ID is asserted by this document.
> - **Reconciliation revision 2** preserves every governing criterion and clarifies only execution
>   boundaries: native `win32`/Node 22 preflight, direct-store evidence versus admitted writes, and
>   QE-11 Q1 records-only treatment plus separate result acceptance. No item is executed by the revision.
> - **Final proposal revision 3 (this pass)** preserves every governing criterion verbatim and closes
>   the operational gaps with **proposed** resolutions carried by the final act: the three-tier
>   fence-preserving write mechanism (act §5.5 / determination packet §4.4), `G4-H12-MANIFEST-v2`
>   (32+1-conditional; act §5.2(6) / packet §4.7), evidence rules (act §5.2(7) / packet §4.8), failure
>   handling (act §5.7), durability wording (act §5.6), and two new gap-register entries G-12/G-13.
>   Nothing here executes, passes, accepts, or pre-decides a PA question.

| Field | Value |
|---|---|
| **Document ID** | `IIPS-V3-G4-QE-MATRIX-PREPARED-2026-10-22-03` — prepared-record identifier allocated after a fresh collision census (revision-2 ID `…-02` preserved in history); not an effective-act ID |
| **Document type** | Prepared evidence/definition reference supporting proposed record `IIPS-V3-G4-QUALIFICATION-AUTHORITY-PROPOSAL-2026-10-22-03` (Act ID remains `PENDING ASSIGNMENT`; proposed `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01`) — final proposal revision 3, with the determination packet `IIPS-V3-G4-DETERMINATION-RESOLUTION-PACKET-2026-10-22-01` |
| **Prepared** | `2026-10-22` (UTC), by Arena Agent Mode under the standing PA authorization (F-3 §1.2) — recording/preparation only, no authority rendered |
| **Governing definition source (QE-1…QE-11)** | Gate E write policy rev 1, `IIPS-V3-G2-GATE-E-PORTFOLIO-WRITE-POLICY-2026-10-18-01`, **§4** — IPD `evidence/cross-repository/IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md`, blob `4a9501bffb49abbbc0ba5b5c4f81d2841812913e`, SHA-256 `6385345b98fe33dc294212b37592ff455589b7656aa42bf05fdb29e04c57e7cf`, 16,908 B — at IPD `main@1cceacfff40f22dbc9cd64906bf26a5feac1075e` |
| **Supporting definitions** | L-IPC-1 rev 2 §10 (Q1–Q11) — IPD `evidence/np04/IIPS_v3.0_G2_IPD_LOCAL_PRINCIPAL_OS_IPC_SECURITY_CONTRACT_PROPOSAL_2026-10-16.md`, accepted-text blob `cab04b6f94618c9afad1440882ebf63437fdf6f8` (current file blob `fc8d1cbc9ec96f4f93fce8afbbb659b044f6268f`, SHA-256 `be56e6fdfc21f6382780f6d272e9f3b03d9f612671520e2994bc25b4f135f613`; §10 table verified byte-identical between the two blobs); Gate C rendered decision `IIPS-V3-G2-IPD-GATE-C-QUALIFICATION-AUTHORITY-2026-10-17-01` (D-GC-A…D-GC-I, H-1…H-13) — IPD `evidence/np04/IIPS_v3.0_G2_IPD_GATE_C_QUALIFICATION_AUTHORITY_DECISION_RENDERED_2026-10-17.md`, blob `9befe6d888f6205d8d3df6ed3d873b0c71ee6336`, SHA-256 `3e5a66b8678ee5fbf37a9fffdb05e19b382a66a7def3a49be41947993d4fae70`; G2-D3 (QE-4 precondition) — IPD `evidence/cross-repository/IIPS_V3_G2_GATE2_ACCEPTANCE_AUTHORITY_REQUEST_2026-10-18.md`, blob `0a53865959eaaa6a19f58c3026faecaedd572f0f` |
| **Operative status of source** | Gate E rev 1 **ACCEPTED** by PA (G2-D2, 2026-10-18); its §4 is explicitly "Evidence required for later qualification (Gate 4; **not authorized here**)" |
| **Evidence-class legend** | **`[A]`** = established by the authoritative record cited in the cell · **`[P]`** = proposed by this preparation for PA determination (NOT pre-existing authority) · **`[GAP]`** = not established by any located authoritative record |

---

## 1. Common execution frame (applies to every QE item)

Established by Gate E §4 preamble: *"Executed on the **Windows deployment host**, after Gate A′
provisioning, against the Gate 3 implementation at recorded digests, with raw output published."*

| Field | Content | Class |
|---|---|---|
| Execution location | Native Windows target host `desktop-no0nhtp` (the deployment host named in Gate 3 act §8.3/§11). D-GC-F: *"Windows laptop is the qualification host; POSIX evidence non-qualifying."* Require the actual provisioned non-elevated account and Node `process.platform === "win32"`; WSL, POSIX, hosted Linux and hosted Windows CI are **not** substitutes for the deployment host. | `[A]` + `[P]` (identity-proof fields) |
| Timing precondition | **After Gate A′ provisioning** (Gate E §4). Gate A′ remains `APPROVED — NOT EXECUTED` (P-1 separate) as of this preparation. Same-host executed evidence must be compatible with the exact current store/migration blobs; no new provisioning entrypoint or Gate A′ re-baseline is authorized here. Absent/incompatible evidence stops the run. | `[A]` + `[P]` (compatibility stop) |
| Implementation basis | The Gate 3 implementation **at recorded digests** — IPD `main@1cceacfff40f22dbc9cd64906bf26a5feac1075e` lineage (accepted by `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01`) plus the final post-merge successor carrying the authorized `scripts/run-tests.mjs` remediation, and the IRR consumer set at the IRR commit designated at execution. Exact digests must be recorded at run start/end; earlier candidate or PR #42 evidence does not transfer. | `[A]` + `[P]` (commit-designation/final-commit rule) |
| Runtime floor (per-item prerequisite for QE-1; applies to all) | Gate 3 act §8.3 requires **Node major 22**, minimum `22.13.0` (therefore `>=22.13.0 <23`), and host `node:sqlite` availability. Re-measure the native executable and run a flag-free in-memory probe. Historical Gate A′ Node `v24.14.0` is not current evidence and does not qualify; no runtime installation/switch or policy amendment is authorized. A green POSIX CI run does **not** establish this. | `[A]` (major/floor) + `[P]` (preflight/stop mechanics) |
| Evidence form | **Raw output published** (Gate E §4). | `[A]` |
| Evidence destination & manifest | Proposed: one new IRR `evidence/integration/gate-4-target-host-qualification-<run-id>/` directory per run, with unedited raw output, UTC commands, per-item records and SHA-256 of every artifact's **actual bytes** plus the recorded IPD/IRR digests. Never normalize line endings before hashing; retain all attempts. **Revision 3:** the format is fixed as `GQ-<yyyymmdd>-<nn>` run IDs with the MANIFEST/`raw/**`/per-item layout and publication/read-back rules of act §5.2(7) + determination packet §4.8 — PA adoption pending. Repository-surface digests use the Git-blob domain of `G4-H12-MANIFEST-v2` (act §5.2(6)). | `[GAP]` + `[P]` (carried into act §5.2(6)–(7)) |
| Fixtures / store safety | Proposed extension of the D-GC-I pattern: destructive items (QE-7 especially) run against **disposable isolated store copies**; the operator's authoritative store is never opened, written, or used for destructive scenarios. Historical D-GC-I text was rendered for the read-only Gate C subset only. **Revision 3:** the extension for QE-4/QE-7 (provenance before write, pre-run backup, one copy per scenario, recovery by fresh copy, retention until acceptance) is fixed in act §5.7 — PA adoption pending. | `[GAP]` + `[P]` (carried into act §5.7) |
| Failure handling (all items) | **`[GAP]`** — no authoritative failure-handling rule for a QE item was located. Proposed fail-closed rule for PA adoption: every item is recorded `PASS` / `FAIL` / `INCONCLUSIVE` against the exact recorded digests; `FAIL`/`INCONCLUSIVE` items are never relabelled or omitted; the run records all items attempted and their raw outputs; escalation is to the Program Authority for disposition (re-run, partial-run acceptance, or abort), and no partial run result may be cited as a Gate 4 qualification. **Revision 3:** the rule is fixed in act §5.7 (statuses `PASS`/`FAIL`/`INCONCLUSIVE`/`INVALID` per ratified H-6; all attempts retained; no relabelling; destructive fixtures per the D-GC-I extension) — PA adoption pending. | `[GAP]` + `[P]` (carried into act §5.7) |
| Result acceptance | **Separate act.** Gate E W-1(3): the run must be "executed on the deployment host **and accepted by a separate result-acceptance act**". Execution of QE-1…QE-11 therefore never makes W-1(3) true by itself. | `[A]` |
| Write-path execution mechanism | **`[GAP]` RESOLVED BY PROPOSAL (revision 3) — PA adoption required.** Current `evaluatePortSaveGuard()` always returns false for W-1(3)/(4); IPC dispatch refuses all four writes before store mutation; no environment flag enables them (T-G proves it). The final act §5.5 adopts the **three-tier fence-preserving mechanism**: **T1** operational endpoint with all fences on (refusals + reads, zero-delta proofs); **T2** disposable-copy harness executing the real compiled store/migration/binding/entrypoint components outside the repository (D-GC-I extended; qualification-fixture measurement only); **T3** the identity-capable session-port boundary for the DP-2 2F/identity limbs (frozen anchor `portfolioStorePort.ts`). Per-item map at act §5.5; every artifact carries a code-path label; structurally unreachable criteria become **limitation findings** (see gaps G-12/G-13), never passes. T2/T3 writes are never admitted endpoint writes, route qualification or a W-1 lift; without PA adoption (packet §6 Q4), each affected item **stops**. | `[A]` (fence + mechanism facts) + `[P]` (mechanism design, adopted into act §5.5, pending PA) |

---

## 2. QE item matrix

Each item reproduces the **verbatim authoritative requirement** first, then the required fields.

---

### QE-1

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-1` (Gate E §4; maps to L-IPC-1 §10 `Q5`, policy `W-6`) | `[A]` |
| **Requirement (exact, governing record)** | *"Canonical identity: one match persists; zero/conflicting refused before serialization/port/store with quarantine evidence; caller identity fields refused"* (Gate E §4). W-6 detail: a holding persists only with **exactly one** IPD-side resolution (`Security Master` D05 + `IdentityMappingStore.resolveCompanyId`, blobs `e260fd90d05e5bfcd4bdc037524722c6fccee16d` / `eec60c09e08ec45a29979abf25b21efddef448ae`); zero (`UNMAPPED_IDENTIFIER`) or conflicting (`AMBIGUOUS_COLLISION`) matches refuse the **whole** request with `REFUSED_UNRESOLVED_IDENTITY` before serialization/port/store with per-holding quarantine evidence (DP-2 Option 2F; C12.3–C12.4); caller-supplied `companyId`/`runtimeCompanyId`/`identityStatus`/`resolutionDisposition` refused (Class P); ticker-shaped values never canonical. | `[A]` |
| **Preconditions** | Common frame (§1) incl. Gate A′ provisioning done; single `ACTIVE` A-2 binding + membership provisioned; Security Master D05 coverage present; **host Node patch-floor + `node:sqlite` availability recorded (act §8.3 — this item's named prerequisite)**. | `[A]` |
| **Authorized action proposed** | On the target host, against the recorded digests, operator executes the QE-1 scenario set: (i) persist one holding with exactly one resolution; (ii) submit a holding with zero resolution and one with conflicting resolution and capture the whole-request refusal + per-holding quarantine evidence and its ordering (before serialization/port/store); (iii) submit each caller identity field (top level and nested) and capture Class P refusal; (iv) record `node --version` and `node:sqlite` availability. Bounded to measurement and recording only. | `[P]` |
| **Acceptance criterion** | Observable: exactly-one resolution ⇒ holding persisted (within the qualification mechanism); zero/conflicting ⇒ whole-request refusal (`REFUSED_UNRESOLVED_IDENTITY`) with quarantine evidence (`UNMAPPED_IDENTIFIER` / `AMBIGUOUS_COLLISION`) occurring before serialization/port/store; every caller identity field refused with no store access. Each scenario must show zero partial state. Exact quarantine-evidence **format** not specified by the record. | `[A]` (conditions) + `[GAP]` (format) |
| **Evidence artifact** | Raw output published (Gate E §4). Proposed set: host Node/`node:sqlite` transcript; per-scenario raw logs; refusal envelopes verbatim; SHA-256 manifest. | `[A]` + `[P]` |
| **Execution location** | Native target host `desktop-no0nhtp` only. | `[A]` |
| **Dependencies** | Gate A′ execution + P-1 (upstream); canonical-identity source in the qualified build (W-6). | `[A]` |
| **Failure handling** | Common fail-closed rule (§1) — `[GAP]` in the authoritative record. | `[GAP]`+`[P]` |

---

### QE-2

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-2` (Gate E §4; maps to `Q6`, `W-6`/`W-7`) | `[A]` |
| **Requirement (exact)** | *"DP-2 2F: unresolved or ambiguous write refused; no bypass emitted; no partial revision"* (Gate E §4). W-7: the off-`main` gap (`validateHolding()` defaults `companyId:''`/`identityStatus:'RESOLVED'`/`resolutionDisposition:'CANONICAL_P04'`; Save-Guard `NON_PRODUCTION_OPERATOR_BYPASS` branch) **must not be reused as-is**; `NON_PRODUCTION_OPERATOR_BYPASS` is neither emitted nor accepted (C12.5). | `[A]` |
| **Preconditions** | Common frame; write-path scenarios with unresolved/ambiguous identity inputs; qualification write mechanism resolved (§1 `W-1` gap). | `[A]` + `[GAP]` |
| **Authorized action proposed** | Execute write attempts carrying unresolved and ambiguous holdings; capture whole-request refusal; assert no bypass code/path emitted or accepted anywhere in the run; assert zero revision/holding/contribution rows created (before/after row counts). | `[P]` |
| **Acceptance criterion** | Unresolved/ambiguous write ⇒ refused (DP-2 2F, per W-6 `REFUSED_UNRESOLVED_IDENTITY` family); no `NON_PRODUCTION_OPERATOR_BYPASS` emitted or accepted; no partial revision (W-4: no revision, holding row, contribution row or success response). | `[A]` |
| **Evidence artifact** | Raw output published; proposed: scenario logs, bypass-absence scan transcript, before/after row counts, SHA-256 manifest. | `[A]`+`[P]` |
| **Execution location** | Native target host only. | `[A]` |
| **Dependencies** | QE-1 environment/identity fixtures; qualification write mechanism. | `[A]`/`[GAP]` |
| **Failure handling** | Common rule — `[GAP]` in record. | `[GAP]`+`[P]` |

---

### QE-3

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-3` (Gate E §4; maps to `Q7`, `W-5`/`W-10`) | `[A]` |
| **Requirement (exact)** | *"Revision and lifecycle: stale or missing `expectedRevision` rejected; tombstoned portfolio not disclosed; `reset` and `delete` semantics as W-10"* (Gate E §4). W-5: missing `expectedRevision` ⇒ `INVALID_REQUEST`; mismatch ⇒ `REVISION_CONFLICT`; `create` starts `revision: 1`/`INITIAL`; each committed mutation increments by exactly 1; revisions immutable. W-10: `reset` preserves portfolio identity with governed empty revision (history preserved); `delete` is a **tombstone** (history preserved; afterwards `RESOURCE_UNAVAILABLE`, never disclosed; no physical erase). | `[A]` |
| **Preconditions** | Common frame; a committed portfolio state to mutate; qualification write mechanism. | `[A]`+`[GAP]` |
| **Authorized action proposed** | Exercise save/reset/delete with missing and stale `expectedRevision`; read a tombstoned portfolio; exercise `reset` and `delete` semantics and capture revision history before/after. | `[P]` |
| **Acceptance criterion** | Missing `expectedRevision` ⇒ `INVALID_REQUEST`, zero store effect; stale ⇒ `REVISION_CONFLICT`, zero store effect; tombstoned portfolio ⇒ `RESOURCE_UNAVAILABLE` with no disclosure (indistinguishable from missing/foreign); `reset` ⇒ identity preserved + new governed empty revision; `delete` ⇒ tombstone with history preserved. | `[A]` |
| **Evidence artifact** | Raw output published; proposed: scenario logs + revision-table read-backs + row counts, SHA-256 manifest. | `[A]`+`[P]` |
| **Execution location** | Native target host only. | `[A]` |
| **Dependencies** | Qualification write mechanism (§1); QE-1 binding context. | `[GAP]`/`[A]` |
| **Failure handling** | Common rule — `[GAP]` in record. | `[GAP]`+`[P]` |

---

### QE-4

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-4` (Gate E §4; maps to `Q8`, `W-11`) | `[A]` |
| **Requirement (exact)** | *"**Create → durable commit → process stop → restart → read-back**, byte-for-byte equal holdings, contributions and revisions"* (Gate E §4). **G2-D3 (PA, 2026-10-18, option (b))** fixes the meaning of "stop both processes": *"stop both the IRR and the IPD processes, then restart both"*; byte-for-byte read-back; **no OS reboot required**; option (c) not selected; any later move to (c) requires documented evidence that (b) is insufficient, recorded by its own act. | `[A]` |
| **Preconditions** | Common frame; durable store provisioned on the host (Gate A′ / P-1 store path); **both real processes** running (IRR consumer and IPD endpoint) as in deployment; qualification write mechanism. | `[A]`+`[GAP]` |
| **Authorized action proposed** | Create portfolio → durable commit → stop **both** IRR and IPD processes → restart **both** → read back holdings, contributions and revisions; compare byte-for-byte (proposed: contentDigest/lineageDigest equality plus raw read-back dumps). | `[P]` |
| **Acceptance criterion** | Byte-for-byte equal holdings, contributions and revisions across the stop/restart of both processes (G2-D3 (b)). No partial state at read-back. | `[A]` |
| **Evidence artifact** | Raw output published; proposed: pre-stop store dump + hashes, stop/restart transcripts for both processes (PIDs, exit codes), post-restart read-back + hashes, SHA-256 manifest. | `[A]`+`[P]` |
| **Execution location** | Native target host only; **real IRR and IPD processes** (not test doubles). | `[A]` |
| **Dependencies** | Gate A′ execution; durable store; IRR consumer build at the designated commit; qualification write mechanism. | `[A]`/`[GAP]` |
| **Failure handling** | Common rule — `[GAP]` in record. | `[GAP]`+`[P]` |

> **Durability-vocabulary note (flagged, not resolved).** W-11 permits the *implementation* to report
> `durability:'DURABLE'`/`durable:true` for committed results, and the QE-4 run will necessarily capture
> such fields in raw output. Gate 3 act §8.4 separately prohibits any **`durable:true` claim** — in UI,
> documentation, tracker, evidence or release note — before the Gate 4 result-acceptance act. Proposed
> reading `[P]` for PA confirmation: raw qualification output may contain the field as emitted by the
> qualified code (that is measurement, not a claim), while no record may **assert** a durable-portfolio
> capability until result acceptance. This reading is **not** established by any located record.

---

### QE-5

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-5` (Gate E §4; maps to `W-8`) | `[A]` |
| **Requirement (exact)** | *"**Idempotent re-import:** identical `contentDigest` → `ALREADY_IMPORTED_NO_OP`, no new revision, before and after restart"* (Gate E §4). W-8: content idempotency (BI-08) with mode ≠ `REPLACE`; `requestId` is correlation only. | `[A]` |
| **Preconditions** | Common frame; a committed contribution to re-import; qualification write mechanism; restart capability (after-restart limb). | `[A]`+`[GAP]` |
| **Authorized action proposed** | Re-import an identical `contentDigest` payload; observe `ALREADY_IMPORTED_NO_OP`; verify no new revision; repeat after a QE-4-style restart. | `[P]` |
| **Acceptance criterion** | Identical `contentDigest` ⇒ `ALREADY_IMPORTED_NO_OP`, no new revision — both before and after restart. | `[A]` |
| **Evidence artifact** | Raw output published; proposed: save-result envelopes, revision counts before/after, restart transcript, SHA-256 manifest. | `[A]`+`[P]` |
| **Execution location** | Native target host only. | `[A]` |
| **Dependencies** | QE-4 restart context (after-restart limb); qualification write mechanism. | `[A]`/`[GAP]` |
| **Failure handling** | Common rule — `[GAP]` in record. | `[GAP]`+`[P]` |

---

### QE-6

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-6` (Gate E §4; maps to `W-13`) | `[A]` |
| **Requirement (exact)** | *"**Lineage:** contribution SHA-256 lineage and broker attribution identical after restart and after `REPLACE`/`RESET`"* (Gate E §4). W-13: `BrokerContributionRecord` SHA-256 lineage, broker attribution and `contentDigest` preserved across restart and across `REPLACE`/`RESET` (new sets start; history is not erased). | `[A]` |
| **Preconditions** | Common frame; committed contributions with attribution; qualification write mechanism. | `[A]`+`[GAP]` |
| **Authorized action proposed** | Record lineage + attribution; restart; perform `REPLACE` and `RESET`; re-read lineage and attribution and compare. | `[P]` |
| **Acceptance criterion** | Contribution SHA-256 lineage and broker attribution identical after restart and after `REPLACE`/`RESET`; prior history preserved. | `[A]` |
| **Evidence artifact** | Raw output published; proposed: lineage dumps (before/after each transition), attribution records, SHA-256 manifest. | `[A]`+`[P]` |
| **Execution location** | Native target host only. | `[A]` |
| **Dependencies** | QE-4 restart context; qualification write mechanism. | `[A]`/`[GAP]` |
| **Failure handling** | Common rule — `[GAP]` in record. | `[GAP]`+`[P]` |

---

### QE-7

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-7` (Gate E §4; maps to `W-12`) | `[A]` |
| **Requirement (exact)** | *"**Recovery:** forced termination during a write leaves either the full revision or none; startup refuses on tampered/unverified migrations"* (Gate E §4). W-12: on restart the store holds either the full committed revision or none of it, with no partial state; startup `validate → connect → migrate → verify → bind`; unverified migrations or store faults ⇒ no endpoint, no fallback; revision conflict recovered by re-read + explicit re-submission. | `[A]` |
| **Preconditions** | Common frame; qualification write mechanism; **disposable store copies for destructive scenarios** (proposed D-GC-I extension — the authoritative store must not be the crash target). | `[A]`+`[GAP]`/`[P]` |
| **Authorized action proposed** | Force-terminate the IPD process mid-write (repeated scenarios); restart; inspect store state for full-or-none; tamper/withhold a migration on a disposable copy and observe startup refusal (no endpoint, non-zero exit). | `[P]` |
| **Acceptance criterion** | After forced termination: full committed revision or none — never partial; startup on tampered/unverified migration refuses (no endpoint, no fallback, non-zero exit). | `[A]` |
| **Evidence artifact** | Raw output published; proposed: kill timing transcripts, pre/post store dumps + hashes, startup refusal transcripts (exit codes), SHA-256 manifest. | `[A]`+`[P]` |
| **Execution location** | Native target host only. | `[A]` |
| **Dependencies** | Qualification write mechanism; migration ledger present (Gate 3 build); disposable fixture stores. | `[GAP]`/`[A]` |
| **Failure handling** | Common rule — `[GAP]` in record. | `[GAP]`+`[P]` |

---

### QE-8

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-8` (Gate E §4; maps to `W-3`, `CV-20 §4.5`) | `[A]` |
| **Requirement (exact)** | *"**Revocation:** after binding revocation, writes and reads refused, including after restart; revocation racing a write never yields a post-revocation commit"* (Gate E §4). W-3: binding re-read and checked **inside the same immediate/serialized transaction** as the mutation; a revocation that commits first always wins. G2-D5 (PA, 2026-10-18, approved in full): revoked-binding data retained-and-inaccessible; reads **and** writes through the revoked binding denied; no auto-transfer; no silent deletion; re-access requires explicit governed action; *"The failure behaviour must be defined and tested before qualification or admission (QE-8)."* | `[A]` |
| **Preconditions** | Common frame; A-2 binding with a governed revocation path (Gate A′ provisioning + its lifecycle/audit); qualification write mechanism. | `[A]`+`[GAP]` |
| **Authorized action proposed** | Revoke the binding; attempt reads and writes (refused); restart both processes (G2-D3 (b) pattern) and re-attempt (still refused); race a write against a revocation and observe no post-revocation commit; verify retained-and-inaccessible data posture per G2-D5. | `[P]` |
| **Acceptance criterion** | Post-revocation: writes and reads refused, including after restart; revocation racing a write never yields a post-revocation commit; G2-D5 five-point disposition behaviour observed (denied access; no transfer; no silent deletion). | `[A]` |
| **Evidence artifact** | Raw output published; proposed: revocation record (A-3 audit line), refusal transcripts pre/post restart, race-run transcripts with timestamps, row counts, SHA-256 manifest. | `[A]`+`[P]` |
| **Execution location** | Native target host only. | `[A]` |
| **Dependencies** | Gate A′ provisioning (binding lifecycle); QE-4 restart pattern; qualification write mechanism. | `[A]`/`[GAP]` |
| **Failure handling** | Common rule — `[GAP]` in record. | `[GAP]`+`[P]` |

---

### QE-9

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-9` (Gate E §4; maps to `W-15`) | `[A]` |
| **Requirement (exact)** | *"**Refusal matrix:** every W-15 condition produces its class and no store effect (row counts before = after)"* (Gate E §4). W-15 exhaustive set — Class P: framing/version/operation violation, caller-supplied authority, binding absent/invalid/ambiguous/revoked, capacity; Class A: `WRITE_NOT_AUTHORIZED` (W-1), `INVALID_REQUEST`, `RESOURCE_UNAVAILABLE`, `REVISION_CONFLICT`, `REFUSED_UNRESOLVED_IDENTITY`, `REFUSED_STORE_GUARD`, `UNAVAILABLE`. *"Every refusal has no store effect."* | `[A]` |
| **Preconditions** | Common frame; qualification write mechanism (for Class A write-family outcomes); fixture inputs for every W-15 condition. | `[A]`+`[GAP]` |
| **Authorized action proposed** | Enumerate every W-15 condition; produce each class; capture store row counts before and after every refusal. | `[P]` |
| **Acceptance criterion** | Every W-15 condition produces **its** class (no substitutions) and row counts before = after for every refusal. | `[A]` |
| **Evidence artifact** | Raw output published; proposed: refusal-matrix table + per-condition envelopes + row-count pairs, SHA-256 manifest. | `[A]`+`[P]` |
| **Execution location** | Native target host only. | `[A]` |
| **Dependencies** | QE-1…QE-3 fixture contexts; qualification write mechanism. | `[A]`/`[GAP]` |
| **Failure handling** | Common rule — `[GAP]` in record. | `[GAP]`+`[P]` |

---

### QE-10

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-10` (Gate E §4; maps to `W-9`) | `[A]` |
| **Requirement (exact)** | *"**Outcome-unknown:** timeout after send yields no IRR auto-retry; reconcile-by-read procedure demonstrated"* (Gate E §4). W-9: IRR must **not** automatically retry any write; timeout/connection loss after send is **outcome-unknown**, surfaced as unavailable, never as success or failure; client reconciles by reading (`portfolio.get`/`portfolio.revisions`/`portfolio.list`) before any re-attempt; known v1 limitation: re-attempted `create` can produce a second portfolio (mitigation: reconcile-by-list before retry). | `[A]` |
| **Preconditions** | Common frame; **separate real IRR and IPD processes** (IRR client → same-host endpoint); a way to induce a post-send timeout (proposed: server-side delay/kill on the disposable instance). | `[A]`+`[P]` |
| **Authorized action proposed** | Induce timeout after send on a write; observe IRR surfaces outcome-unknown (not success/failure) and performs **no** auto-retry; demonstrate the reconcile-by-read procedure before any manual re-attempt. | `[P]` |
| **Acceptance criterion** | No IRR auto-retry after outcome-unknown; outcome surfaced as unavailable (never success/failure); reconcile-by-read procedure demonstrated. | `[A]` |
| **Evidence artifact** | Raw output published; proposed: IRR client logs (separate process), endpoint logs, timeout transcript, reconcile sequence transcripts, SHA-256 manifest. | `[A]`+`[P]` |
| **Execution location** | Native target host only; real separate processes (W-9 is a cross-process behaviour). | `[A]` |
| **Dependencies** | Qualification write mechanism; both processes at designated commits. | `[GAP]`/`[A]` |
| **Failure handling** | Common rule — `[GAP]` in record. | `[GAP]`+`[P]` |

---

### QE-11

| Field | Content | Class |
|---|---|---|
| **QE identifier** | `QE-11` (Gate E §4; maps to **Gate C** — the read-only subset) | `[A]` |
| **Requirement (exact)** | *"Q1–Q4 and Q9–Q11 (read-only Gate C subset) passed and accepted, including **C5.1/Q9 zero bytes**"* (Gate E §4). The subset items are defined in **L-IPC-1 §10**: **Q1** Gate V (§9) passed and published on the deployment host; **Q2** startup fail-closed (missing/invalid binding, missing store, unverified migrations ⇒ no endpoint, no fallback); **Q3** claim-refusal matrix (principal/owner/tenant/scope/`companyId`/`identityStatus`/`resolutionDisposition` each refused; no owner disclosed; no write); **Q4** owner/tenant isolation (provisioned principal succeeds; any other/absent binding fails indistinguishably from "not found"); **Q9** C5.1 negative test (a read-only connection receives **no** bytes — no banner, no data); **Q10** no parallel store (inventory confirms exactly one portfolio store); **Q11** drift check (qualified surfaces byte-identical to what was tested; digests recorded). Ratified operational criteria H-1…H-13 (D-GC-H) include: H-1 Q9 repetitions **N ≥ 10 cold + 10 warm**; H-2 idle-timeout closure ≈ 5 s with 0 bytes acceptable (earlier closure recorded and investigated); H-8 Q2 control-first ordering; H-9 Q3 cross-class **byte-identical** outcomes; H-10 Q4 serial-binding fixture design; H-11 Q10 runtime inventory method; H-12 Q11 digest set **"15 implementation files + `package.json` + `tsconfig.json`, before and after; any drift ⇒ run invalid"**; H-13 Q1 recording format. Gate V measurements: V-1/V-3/V-4 re-runs **not required — PA-waived** (D-GC-B; waivers are **not** technical proof); V-6 send half **out of Q1 scope** (D-GC-D); V-E reading recorded per D-GC-B. | `[A]` |
| **Preconditions** | Common frame; Gate V procedure of record applicable to the host; fixture copies C-A/C-B/C-C (H-10); read-only connections for Q9. **`[GAP]` — basis mismatch:** the D-GC execution grant (2026-10-17) names its implementation-under-qualification as `cec7080252183a6a5332efe351e61c254d342a2d` (now **REFERENCE ONLY** under G3-D5). No located record re-issues the seven-item Q1–Q4/Q9–Q11 execution grant against the accepted Gate 3 implementation. The proposed act must (re-)issue it, or PA must otherwise determine. | `[A]` + `[GAP]` |
| **Authorized action proposed** | Execute the ordered Q11-before → Q2 → Q10 → Q9 → Q3 → Q4 → Q1 → Q11-after sequence against the designated commits. **Q1 is records-only:** collect the V-5 endpoint-phase inventory and D-GC-B waiver reading in H-13 form; do not manufacture a Q1 test run or label waived V-1/V-3/V-4 measurements technically passed. Q9 remains mandatory zero-bytes cold/warm N ≥ 10; Q11 uses the PA-fixed current set (evidence packet §13). Recording only — **acceptance is not part of this action**. | `[A]` (records-only/order) + `[P]` (current re-basis) |
| **Acceptance criterion** | Q2–Q4 and Q9–Q11 must pass at the recorded digests (including **C5.1/Q9 zero bytes**); Q1's required records must be complete and published under D-GC-B/H-13 without misrepresenting waivers as test proof; and the subset must then be **accepted** (Gate E §4: *"passed and accepted"*). **`[GAP]` — two open limbs:** (a) H-12's historical 15-file set must be re-based (revision 2 proposes 27 mandatory + one conditional IPD paths, plus IRR identity, in evidence packet §13); (b) the accepted limb requires a **separate Gate C result-acceptance act**, not granted here. The disposition remains `PARTIAL — Q5–Q8 DEFERRED`; QE-11 acceptance is not Gate C completion. | `[A]` (requirements/records-only/partial) + `[GAP]` (digest adoption; acceptance limb) + `[P]` (proposed current set) |
| **Evidence artifact** | Raw output published; proposed: Gate V inventory + V-E reading (H-13 format), Q2–Q4/Q9–Q11 raw transcripts, before/after digest manifests, SHA-256 manifest of the run. | `[A]`+`[P]` |
| **Execution location** | Native target host only (D-GC-F). | `[A]` |
| **Dependencies** | Gate A′ (per common frame); Q11 after-limb runs last (H-12: any drift ⇒ run invalid); Gate C result-acceptance act (for the "accepted" limb — **separate, not granted**). | `[A]` |
| **Failure handling** | Common rule (§1); plus H-12: any before/after digest drift makes the run **invalid** (criterion ratified as operational, D-GC-H). | `[A]` (H-12) + `[GAP]`/`[P]` (rest) |

---

## 3. Unresolved / ambiguous definitions (explicit gap register)

| # | Gap | Where | Effect if unresolved |
|---|---|---|---|
| G-1 | **Write-path qualification mechanism** under hard W-1(3)/(4)=false | Gate E W-1 vs §4 write items; current `portfolio_store.ts`/`dispatch.ts`; direct-store-only T-G tests | **Resolution proposed (revision 3):** three-tier mechanism at act §5.5 / determination packet §4.4 with per-item map, labels and limitation findings. PA adoption (packet §6 Q4) still required; without it each affected item stops. No admitted-write reading is available under any option |
| G-2 | **QE-11 Gate C subset re-basis** — D-GC grant names `cec70802…` (REFERENCE ONLY per G3-D5); no record re-issues Q1–Q4/Q9–Q11 execution for the Gate 3 implementation | D-GC act header; G3-D5 | **Resolution proposed (revision 3):** re-issue of the seven-item execution grant against the current qualified commits in act §5.2(8); acceptance stays a separate act — PA to confirm (packet §6 Q6) |
| G-3 | **QE-11 "and accepted" limb** — requires a separate Gate C result-acceptance act; Q1 is records-only, not a fabricated test PASS | Gate E §4; D-GC §7/§11 | QE-11 cannot fully close inside Gate 4 execution; two-act sequence is inherent; Q1 records and waivers must be represented accurately |
| G-4 | **H-12 digest set** (15 files) is historical; current qualified surface set differs | D-GC-H/H-12 vs Gate 3 manifest (22 files + wrapper/new test/config) | **Resolution proposed (revision 3):** `G4-H12-MANIFEST-v2` = **32 mandatory + 1 conditional** (+ frozen anchors, IRR set, runtime manifest; Git-blob + raw-byte hash domains) per act §5.2(6) and determination packet §4.7, amending evidence-packet §13. PA must adopt/replace before execution; any drift invalidates the run |
| G-5 | **Evidence artifact format & destination** for QE raw output | Gate E §4 says only "raw output published" | **Resolution proposed (revision 3):** act §5.2(7) + determination packet §4.8 (run IDs, layout, MANIFEST minimum, raw-byte hashing, read-back) — PA adoption pending |
| G-6 | **Failure handling / re-run rules** for QE items | No located record | **Resolution proposed (revision 3):** act §5.7 (H-6 statuses, all attempts retained, escalation, destructive-fixture extension) — PA adoption pending |
| G-7 | **`durable:true` fields in QE-4 raw output** vs. Gate 3 act §8.4 claim prohibition | W-11 vs act §8.4 | **Resolution proposed (revision 3):** measurement/claim split + fixed non-claim sentence in act §5.6 (determination packet §4.10) — PA adoption pending |
| G-8 | **Destructive-scenario fixture rule** (D-GC-I pattern was rendered for the read-only subset) | D-GC-I scope | **Resolution proposed (revision 3):** D-GC-I extension fixed in act §5.7 — PA adoption pending (packet §6 Q9) |
| G-9 | **QE-4 "both processes" deployment topology** (exact IRR/IPD start configuration on the host) | G2-D3 (b) fixes the stop/restart semantics but not the topology details | Act §5.5/§5.8 fixes the obligations (real IRR ipcClient process + real IPD entrypoint bound to the fixture path, G2-D3(b) stop/restart); exact start configuration and process/pipe evidence remain to be recorded per run (rev-2 packet §14); PA may fix a required topology statement |
| G-10 | **Current native runtime unknown; historical Node 24 conflicts with Node-major-22 policy** | Gate 3 act §8.3 vs historical Gate A′ host record | Re-measure; require `>=22.13.0 <23` and `node:sqlite`; otherwise stop. No implicit runtime amendment/install |
| G-11 | **Compatible same-host Gate A′ execution evidence absent** | Gate E §4; Gate 3 act §11; current `provisioning.ts` has no executable entrypoint | Stop Limb B; separate Gate A′ authority is required for any provisioning action or new entrypoint |
| G-12 | **Q1's "Gate V passed and published on the deployment host" currency for the current basis** — no separate current-basis Gate V record located; the historical Gate V record + D-GC-B waivers are the only located basis (Q1 is records-only per D-GC §7) | L-IPC-1 §10 Q1; D-GC-B/§7; D-GC-H/H-13 | **New (revision 3).** Recommended reading: historical records + D-GC-B waivers carry forward for the records-only Q1 limb, waivers stated as waivers — PA to confirm (packet §6 Q6); alternative: Q1 recorded `INCONCLUSIVE` at run |
| G-13 | **Durable-path behavior gaps found by source inspection:** (a) no canonical-identity resolution in `src/persistence`/`src/ipc` (QE-1/QE-2 durable-path limbs); (b) no in-transaction binding re-check in `portfolio_store.ts`, and no explicit multi-statement `BEGIN`/`COMMIT` (W-3 race property unreachable; QE-7/QE-4 observed store behavior must be recorded as found) | Determination packet §4.4.1 facts 4–6 (verified at IPD `1cceacff…`) | **New (revision 3).** Under act §5.5 these become **limitation findings** carried to result-acceptance — never silent passes, never repaired inside a run. Any observed partial state is a FAIL finding. Fixing either defect requires a **separate implementation act**, not this qualification |

*End of the QE-1…QE-11 qualification matrix, final proposal revision 3. Prepared reference only — **Gate 4 remains `NOT AUTHORIZED / NOT STARTED`**; no item is executed, passed, or accepted; `[P]` cells are proposals for PA determination and `[GAP]` cells are not pre-existing authority.*
