# IIPS v3.0 — CAP-02 QE-1…QE-11 Execution Matrix and Host Prerequisites

> **Disposition: CAP-02 remains PARTIAL / NOT COMPLETE. U3 remains AUTHORIZED — NOT STARTED; QE 0/11;
> U2-14 remains BLOCKED / NOT STARTED; U4 NOT RENDERED; U5 NOT GRANTED / NOT INITIATED; U6 NOT
> AUTHORIZED.** This record audits the governing CAP-02 qualification criteria, publishes the
> criterion-by-criterion execution matrix with exact host/commit/commands/evidence/prerequisite/
> pass-fail terms, reconciles provisioning and V-A2 prerequisites, and dispositions PF-15 and other
> shared prerequisites without importing CAP-03-only requirements. It renders no decision, executes
> no host command, provisions nothing, and moves no gate. The only work executed here is
> documentation, read-only remote verification, repository publication checks, and a derived
> evidence-manifest template with its self-test.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP02-QE-EXECUTION-MATRIX-2026-10-26-01` |
| Tracker registration | Master tracker §16.127; `CV-CORR-107`; `CHG-2026-10-26-03`; verification rows `V753`–`V766` |
| Date | 2026-10-26 (UTC) |
| Locus | IRR authoritative tracker/repository; IPD inspected read-only (zero IPD writes) |
| Scope | Criteria audit, execution matrix, prerequisite reconciliation, host-blocker verification, derived evidence template. No PA decision, implementation, provisioning, host operation, gate movement, or IPD write. |

## 1. Re-verified baseline — the task-cited state stands, with one CAP-03-only supersession

| Repository/ref | Independently observed state | Relevance |
|---|---|---|
| IRR `ramkivs/iips-review-recovered`, `main` | `c7fc7e40e400ab018562b58c2b3b849be298baeb`, tree `d9cb69ec7a030e9f175c2087e92e710d5f069bde`; PRs #283–#286 all `MERGED`; post-merge `main` CI run `40272191685` is `success`; 0 open PRs | Current authority/tracker baseline. Task-cited `main@9e0da3e` (PR #284) is superseded only by the CAP-03 S2 host-recovery probe publication (PRs #285/#286, §16.126), which is documentation/evidence-only, preserves every downstream gate, and moves no CAP-02 status. |
| IPD `ramkivs/iips-production-market-data`, `main` | `f5eddbc20b944a098a9060a8e3349c6d10b7843e`, tree `5c93f1d1e6c4919fa632ff107569ac955f5e052e`; PRs #94/#95 `MERGED`; post-merge `main` CI run `40230772869` is `success`; 0 open PRs | Unchanged from §16.125. Current IPD CAP-02 tracker blob `8a2a4e45615b84e517b65fe2700d4a09cde8c3f7`, 162,478 bytes, SHA-256 `8f85ca5e1e4acc10e19fa77d8ab87c388567a88442c136f5388e76479841351c` — re-read and byte-identical. |
| Designated IPD pin | `8eec74ae27cda09f3c368b9c299895eae41554db` / tree `4eba29029f8d95cfe483e615a7047426b298ce50` | Full-history ancestor of IPD `main` (8 ahead / 0 behind); all 33 intervening paths under `evidence/cross-repository/`; qualified-surface drift **0 files**. |
| Designated IRR consumer pin | `ba64b2d5927c2f872560710cf1474c25a5cde0d5` / tree `5e4262f1cd75bf13b76ced5b45058f31434b5dad` | Ancestor of IRR `main` (20 ahead / 0 behind); all 47 intervening paths tracker/docs/evidence-only; 0 `frontend/` paths; qualified-surface drift **0 files**; fence blobs untouched. |

Preserved boundaries (re-confirmed, not re-decided): DB-C1, U0, B-1/B-1R, U1, U2-1–U2-12 and the
bounded U7 contract/composition are complete at their authorized boundaries; U2-13/W-1 is NOT
AUTHORIZED; U2-14 is BLOCKED / NOT STARTED; U3 is AUTHORIZED / NOT STARTED with QE 0/11; U4 is NOT
RENDERED; U5 is NOT GRANTED / NOT INITIATED; U6 writes are NOT AUTHORIZED. Effective H-12
Alternative A, the S1 identity-value determination, Gate 4 host-qualification authority, and H-12 R5
adoption are applied as written and not reopened.

## 2. Qualification criteria audit — exact terms from the governing records

### 2.1 Criterion sources (authoritative definitions; this record adds none)

| Criterion | Governing definition | Effective execution authority |
|---|---|---|
| QE-1…QE-11 requirements | Gate E write policy rev 1 §4, `IIPS-V3-G2-GATE-E-PORTFOLIO-WRITE-POLICY-2026-10-18-01` (IPD blob `4a9501bffb49abbbc0ba5b5c4f81d2841812913e`): *"Executed on the **Windows deployment host**, after Gate A′ provisioning, against the Gate 3 implementation at recorded digests, with raw output published."* Mappings: L-IPC-1 rev 2 §10 (Q1–Q11), Gate C rendered decision D-GC-A…D-GC-I / H-1…H-13 (IPD blob `9befe6d888f6205d8d3df6ed3d873b0c71ee6336`), G2-D3 option (b) for QE-4 (both IRR and IPD processes stopped/restarted; no OS reboot). | Effective Gate 4 act `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01` (IPD blob `66b56fd1584890525a7250aadd7da449def621e5`): Act ID assigned; Q1–Q12 determined; QE-11 execution grant re-issued on current commits (Q1 records-only; G-12 reading determined); three-tier fence-preserving mechanism adopted (§5); failure classes and fixture controls fixed (§10); durability measurement rule fixed (§11). |
| S2 host verification (5 commands) | Host readiness packet §3 (IPD blob `9d9c5970f66b1c901a2b5d28c02e8c9562078cf2`); H-12 R5 adoption act §7.2; IPD S2 blocker `IIPS-V3-CAP03-G4-H12-R5-S2-HOST-PRECONDITION-BLOCKER-2026-10-25-01` (IPD blob `3bf58cee7dd299f39d4b6de5aa470f0400433071`). | Same acts. S2 is host implementation evidence, not QE and not acceptance. |
| P-1 provisioning + V-A2-1…V-A2-8 | Gate A′ successor act `IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01` (IPD blob `528de6aeddbc8e5f3191be8792f3937d77de4037`) §§5–9; S1 determination `IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01` (IPD blob `b7746b5ed955abcf689ec57ca4a0748c0241ed09`): `ramki-personal-local` / `ipd-personal-local` / `ipd-owner-ramki-personal`. | Successor act + S1 determination (IPD PR #80 merge `d8568b0e…`, receipt PR #81). Value blocker discharged; execution gated by §8 host prerequisites. |
| S3 preflight PF-01…PF-17 | Host readiness packet §2 (IPD blob `9d9c5970…`); Gate 4 act §6 step S3 + §12. | Same acts. PF-15 (endpoint/local-state designation) is `NOT DESIGNATED`; S3 stops there until named. |
| H-12 baseline | H-12 R5 adoption act `IIPS-V3-CAP03-G4-H12-R5-PA-ADOPTION-ACT-2026-10-25-01` (IRR PR #279 merge `ae82be85…`, receipt PR #280; IPD mirror receipt PR #94): manifest blob `f4649e36a81c7013287810cd3202b99586dbd951` / SHA-256 `d0be8bef…`; bound supplement blob `6c777de6f36bfd06ff89373540d755cc367744f2` with 7/7 post-G3 CAP-02 entries (S-1…S-7). G4-AMEND-01 Alternative A (IPD blob `21a0f9eb6cd7b1bbc4849d6dfd26c6c8025d60b8`): 32 IPD + 24 IRR = 56 core + 1 conditional helper. | Adopted and effective in the governing IRR locus; the CAP-02 supplemental inventory is bound. |
| U4 acceptance | Gate E W-1(3); Gate 4 act §§6 (S6), 14. | **No such act exists.** A separate result-acceptance act is required after executed evidence; no run, commit, CI result, or merged PR is acceptance. |

### 2.2 Vocabulary collision — two S1/S2/S3 labelings (reconciled, not redefined)

The effective Gate 4 act §6 labels provisioning-execution `S1`, Limb-A implementation `S2`, H-12
regeneration/adoption `S2a`, and host preflight `S3`. The later effective sequencing (H-12 R5
adoption act §7.2; DQ-4 freeze manifest criterion 7) labels canonical host test/build verification
`S2`, the single provisioning execution `P-1`, and host/runtime preflight `S3`. Both labelings are
preserved as history; the **operational** sequence for the current phase is the later one:

```text
S2 (5 host commands, §2.4) → single bounded P-1 (V-A2-1…V-A2-8, §4) → S3 preflight (PF-01…PF-17
incl. PF-15, §2.5) → QE-1…QE-11 (§3) → evidence integrity → separate Gate C acceptance (QE-11
limb) → separate U4 result acceptance → separate U5 admission.
```

Satisfied history under either labeling: Gate 4 act rendered/effective (S0); Limb A implemented,
published and remote-verified (IPD PR #68 `a52b47b0…`); S1 values determined and bound (PR #80/#81);
H-12 R5 adopted (PRs #279/#280, IPD mirror PR #94). Stop on any failed precondition or command; no
failure is relabelled.

### 2.3 Exact host, operator, runtime, and worktree prerequisites (all steps)

| # | Prerequisite | Required value | Governing clause |
|---|---|---|---|
| H-1 | Host identity | `desktop-no0nhtp` exactly | Gate 4 act §12; Gate A′ act §8 (D-A′-2); readiness PF-01 |
| H-2 | OS / platform | Native Windows 11 Home Single Language; `process.platform === 'win32'`; WSL, Linux, macOS, hosted Windows CI, and any merely similar machine are non-qualifying | Gate 4 act §12; D-GC-F; readiness PF-02/PF-04 |
| H-3 | Operator / elevation | Ramki, non-elevated; administrator-role check `False`; account SID recorded | Gate 4 act §12; readiness PF-03 |
| H-4 | Runtime | Operator-supplied Node `>=22.13.0 <23` (major 22, patch ≥ 22.13.0); `node:sqlite` loads and operates flag-free without warnings; no runtime installation or switch is authorized | Gate 4 act §12; Gate 3 act §§8.1/8.3; readiness PF-04/PF-05/PF-06 |
| H-5 | IPD worktree | Clean full-history checkout at exactly `8eec74ae27cda09f3c368b9c299895eae41554db` / tree `4eba29029f8d95cfe483e615a7047426b298ce50`; `is-shallow=false`; zero tracked changes; remote ancestry verified | Gate 4 act §3.2; readiness PF-07/PF-09 |
| H-6 | IRR worktree | Clean full-history checkout at exactly `ba64b2d5927c2f872560710cf1474c25a5cde0d5` / tree `5e4262f1cd75bf13b76ced5b45058f31434b5dad`; zero tracked changes | Gate 4 act §3.2; readiness PF-08/PF-09 |
| H-7 | Enabling flags | `IIPS_G3_IPC_BINDING_PROVISIONED`, `IIPS_ENABLE_WRITES`, `IIPS_G3_ENABLE_WRITES`, `GATE_E_OVERRIDE` all absent | Readiness PF-10 |
| H-8 | Evidence roots | `$EvidenceRoot` (e.g. `IIPS_RAW_EVIDENCE_ROOT`) absolute, writable, outside every Git worktree, not the store path, not synchronized; raw stdout/stderr, exit codes, UTC timestamps captured per command without normalization | Readiness PF-14; Gate 4 act Q8 |
| H-9 | H-12 before/after | Adopted R5 digest set (manifest `f4649e36…`, supplement `6c777de6…`) recorded at run start and run end; any drift invalidates the run | Gate 4 act Q7 + §3.2(3); D-GC-H H-12 |

### 2.4 S2 — prescribed commands, evidence destinations, pass/fail

Ordered commands at the exact IPD pin (readiness §3; S2 blocker §2). Requires no `$StorePath`, no
PF-15 designation, and consumes no P-1 grant (H-12 R5 act §7.2).

| # | Command | Evidence destination (outside every worktree) | Pass condition |
|---|---|---|---|
| 1 | `npm ci --no-audit --no-fund` | `$EvidenceRoot` raw stdout/stderr + exit code + UTC start/end | exit 0 |
| 2 | `npx tsc --noEmit` | same per-command capture | exit 0 |
| 3 | `npm run build` | same capture + `dist/**` SHA-256 inventory | exit 0 **and** exactly **1,140** `dist/**` files (any other count stops for PA re-designation) |
| 4 | `npm test` (canonical guarded) | same capture (e.g. `s2-canonical-npm-test.txt`) | exit 0; non-zero executed count; zero failures; `[test-guard] OK`; guarded count authoritative — direct TAP supplemental only, never a substitute |
| 5 | `npm run test:package-consumer` | same capture (e.g. `s2-package-consumer.txt`) | exit 0 with consumer `PASS` |

Any non-zero exit stops the sequence with the failure preserved. S2 pass is host implementation
evidence only — not a QE result, not acceptance. Current disposition: **NOT EXECUTED, 0/5**.

### 2.5 S3 — preflight gates before any QE item

All PF-01…PF-17 (readiness §2) must pass after S2 passes and the single P-1 executes: host, OS,
non-elevation, runtime, flag-free SQLite, no runtime switch, both clean trees at the designated
pins, full history, no enabling flags, store-path syntax/state/parent, evidence root,
**PF-15 endpoint/local-state designation**, authority-text confirmation, P-1 unspent register check.
Any failure or ambiguity stops before QE (`NOT EXECUTED — <exact reason>`). Current disposition:
**NOT REACHED**. PF-15 is `NOT DESIGNATED` (see §5).

### 2.6 QE evidence destinations, status vocabulary, and acceptance boundary

- **Deposit:** IPD `evidence/cross-repository/cap02_gate4_qe_<YYYY-MM-DD>_<run-id>/`, raw artifacts
  only (Gate 4 act Q8). Per item: command, exit code, UTC start/end, host identity, Node version,
  commit/tree, pre/post row counts, IPC transcripts, restart read-backs, refusal matrices, digest
  manifests (`sha256sum` output), execution record. Artifacts written once, never edited; corrections
  are new files. Manifest of SHA-256 values is itself hashed. Publication: merge → green CI → remote
  blob read-back → independent second read-back with byte comparison → fresh-clone digest
  reproduction. No credentials; store paths recorded verbatim. IRR-side deposit/registration requires
  a **separate IRR act** (Gate 4 act Q8 limitation / Q12 — deferred, not performed).
- **Status vocabulary (exhaustive):** `PASS` · `FAIL` · `INCONCLUSIVE` · `NOT EXECUTED — <reason>` ·
  `INVALID` (basis/digest drift). No sixth class, no "pass with caveats" (Gate 4 act §10). PASS
  additionally requires an executed scenario at the designated commit on the designated host, with raw
  evidence, in the tier that can reach it (Gate 4 act §5). A limitation finding is never PASS;
  component evidence is never PASS for a full-path criterion. Re-attempts are new attempts with new
  run IDs. Every attempt preserved. Any observed partial state is a FAIL finding.
- **Durability language:** raw output may quote emitted durability fields as measurement with the
  fixed sentence *"This run measured the durability behaviour of the named build at the named commit.
  It does not authorize a `durable:true` product claim, which requires a separate Gate 4
  result-acceptance act."* No product durability claim before U4 (Gate 4 act §11).
- **Acceptance:** execution/recording only. QE-11's "passed and accepted" limb needs a separate Gate C
  result-acceptance act; all QE results need the separate U4 act (Gate 4 act §§7, 14; Gate E W-1(3)).

## 3. QE-1…QE-11 execution matrix

Classification rule: an item is **HOST-ONLY** where any part of its prescribed observation requires
the designated native-Windows host, the provisioned store/binding/endpoint, or real IRR/IPD
processes. **INDEPENDENT** work is limited to preparation, documentation, templates, and
non-qualifying repository checks — it can never produce a QE-relevant observation. All eleven items
are HOST-ONLY for execution; none can be completed independently. Existing Linux/CI/fixture suites
(IPD QE matrix §3: full suite, `g3_*`, `q1_*` families) are implementation evidence only and are
explicitly non-qualifying (Gate 4 act §3 evidence channels; D-GC-F; IPD QE matrix §4 prohibited
substitutes).

| QE | Requirement (governing record, abridged) | Tier(s) / evidence ceiling | Prerequisites (beyond the common S2→P-1→S3→H-12 frame) | Pass / fail conditions | Evidence artifacts | Location |
|---|---|---|---|---|---|---|
| QE-1 | Canonical identity: one match persists; zero/conflicting refused before serialization/port/store with quarantine evidence; caller identity fields refused (Gate E §4; W-6; Q5) | T1 + T3 (T2 store only). Full-path candidate after P-1; durable-path identity integration is a **limitation finding** | Security Master D05 coverage; single ACTIVE binding + membership from P-1; host Node/`node:sqlite` recorded | PASS: exactly-one persists; zero/conflicting → whole-request `REFUSED_UNRESOLVED_IDENTITY` + quarantine (`UNMAPPED_IDENTIFIER`/`AMBIGUOUS_COLLISION`) before serialization/port/store; every caller identity field refused; zero partial state | Node/SQLite transcript; per-scenario raw logs; refusal envelopes verbatim; SHA-256 manifest | HOST-ONLY |
| QE-2 | DP-2 2F: unresolved/ambiguous write refused; no bypass emitted; no partial revision (Gate E §4; W-7) | T3 + T2 (T1 fence limbs). **Component-level** while W-1 refuses all writes; durable-path DP-2 2F a **limitation finding** | QE-1 identity fixtures | PASS: unresolved/ambiguous write refused; no `NON_PRODUCTION_OPERATOR_BYPASS` emitted or accepted; no partial revision (row counts equal) | Scenario logs; bypass-absence scan transcript; before/after row counts; manifest | HOST-ONLY |
| QE-3 | Revision/lifecycle: stale or missing `expectedRevision` rejected; tombstoned portfolio not disclosed; `reset`/`delete` per W-10 (Gate E §4; W-5/W-10) | T1 read/refusal limbs + T2 direct store. **Component-level** for positive write lifecycle | Committed portfolio state; QE-1 binding context | PASS: missing → `INVALID_REQUEST`, zero effect; stale → `REVISION_CONFLICT`, zero effect; tombstoned → `RESOURCE_UNAVAILABLE` indistinguishable from missing/foreign; `reset` preserves identity + governed empty revision; `delete` tombstones with history preserved | Scenario logs; revision-table read-backs; row counts; manifest | HOST-ONLY |
| QE-4 | Create → durable commit → stop **both** IRR and IPD processes → restart both → byte-for-byte equal holdings, contributions, revisions; no OS reboot (Gate E §4; W-11; G2-D3(b)) | T2 + T1 processes/reads. **Component-level only**; durability fields are **measurement** under the fixed non-claim sentence | Durable store from P-1; **both real processes** (IRR consumer + IPD endpoint) as deployed | PASS: byte-for-byte equality across the stop/restart; no partial state. Any observed partial state is FAIL | Pre-stop dump + hashes; stop/restart transcripts (PIDs, exit codes) for both processes; post-restart read-back + hashes; manifest | HOST-ONLY |
| QE-5 | Idempotent re-import: identical `contentDigest` → `ALREADY_IMPORTED_NO_OP`, no new revision, before **and** after restart (Gate E §4; W-8) | T2. **Component-level** | Committed contribution to re-import; restart capability | PASS: no-op + no new revision in both limbs | Save-result envelopes; revision counts before/after; restart transcript; manifest | HOST-ONLY |
| QE-6 | Lineage: contribution SHA-256 lineage + broker attribution identical after restart and after `REPLACE`/`RESET` (Gate E §4; W-13) | T2. **Component-level** | Committed contributions with attribution | PASS: lineage + attribution identical after each transition; history preserved | Lineage dumps per transition; attribution records; manifest | HOST-ONLY |
| QE-7 | Recovery: forced termination during a write leaves the full revision or none; startup refuses on tampered/unverified migrations (Gate E §4; W-12) | T1 startup refusal + T2 destructive disposable-copy test. **Limitation finding** for end-to-end crash atomicity until demonstrated | **Disposable isolated store copies only** (provenance recorded before any write; one copy per scenario; recovery by fresh copy; authoritative store never opened/written/used for destructive scenarios) | PASS: full-or-none, never partial; tampered/unverified migration → refusal (no endpoint, no fallback, non-zero exit). Partial state is FAIL | Kill-timing transcripts; pre/post dumps + hashes; startup refusal transcripts (exit codes); manifest | HOST-ONLY |
| QE-8 | Revocation: after revocation, reads and writes refused incl. after restart; revocation racing a write never yields a post-revocation commit (Gate E §4; W-3; G2-D5) | T1 + T2. **Limitation finding** for write/revocation-race (no binding re-read inside a write transaction); read-refusal limbs separately classifiable | Provisioned ACTIVE binding from P-1 (none exists until then); QE-4 restart pattern; **a PA-approved revocation procedure is additionally required — none is rendered, and the sole operator binding must never be revoked without express authority** (readiness §5) | PASS: post-revocation refusals incl. after restart; no post-revocation commit from the race; G2-D5 five-point posture (denied access; no transfer; no silent deletion; retained-and-inaccessible) | Revocation record (A-3 audit line); refusal transcripts pre/post restart; race transcripts with timestamps; row counts; manifest | HOST-ONLY |
| QE-9 | Refusal matrix: every W-15 condition produces its class; no store effect, row counts before = after (Gate E §4; W-15) | T1 reachable rows + T2/T3 components. **Component-level** for isolated outcomes; **limitation findings** for outcomes masked by write refusal | Fixture inputs for every W-15 condition; QE-1…QE-3 contexts | PASS: every condition produces **its** class (no substitutions); every refusal zero-effect | Refusal-matrix table; per-condition envelopes; row-count pairs; manifest | HOST-ONLY |
| QE-10 | Outcome-unknown: timeout after send → no IRR auto-retry; reconcile-by-read demonstrated (Gate E §4; W-9) | T1 with the actual IRR consumer (T2 supplemental). **Limitation finding** for accepted-write outcome-unknown while W-1 refuses writes | **Separate real IRR and IPD processes**; designated endpoint (PF-15); post-send timeout induction on a disposable instance | PASS: no IRR auto-retry; outcome surfaced as unavailable (never success/failure); reconcile-by-read (`portfolio.get`/`.revisions`/`.list`) demonstrated before any re-attempt | IRR client logs (separate process); endpoint logs; timeout transcript; reconcile transcripts; manifest | HOST-ONLY |
| QE-11 | Gate C read-only subset Q1–Q4/Q9–Q11 passed **and accepted**, incl. C5.1/Q9 zero bytes (Gate E §4; L-IPC-1 §10; D-GC H-1…H-13) | T1 required for host/endpoint items; T2/T3 supplemental. **Measurement only** — test PASS is not Gate C acceptance | Ordered Q11-before → Q2 → Q10 → Q9 → Q3 → Q4 → Q1 → Q11-after; Q9 N ≥ 10 cold + 10 warm with all H-1…H-5 controls; **Q1 records-only** (V-5 inventory + D-GC-B waiver reading in H-13 form; waivers stated as waivers, never proof); fixture copies; adopted H-12 | PASS (measurement): Q2–Q4/Q9–Q11 pass at digests incl. mandatory zero bytes; Q1 records complete; before/after digests equal — **any drift invalidates the run**. Full closure additionally requires the **separate Gate C result-acceptance act**; Gate C stays `PARTIAL — Q5–Q8 DEFERRED` regardless | Gate V inventory + V-E reading (H-13); Q2–Q4/Q9–Q11 raw transcripts; before/after manifests; run manifest | HOST-ONLY |

Current disposition of every row: **NOT RUN — 0/11**. No QE-relevant observation was made in this
pass, and none is claimable from Linux, CI, fixtures, or prior component suites.

## 4. Provisioning prerequisites and V-A2 reconciliation (U2-14)

U2-14 is **BLOCKED / NOT STARTED** — not a missing U2 code criterion but the separate ordered one-use
host prerequisite. The value blocker is discharged (S1 determination effective; binding commit
merged); the execution blockers are the designated host, S2 success, and an execution-time store
path. No provisioning was performed or prematurely prepared in this pass.

| Layer | State |
|---|---|
| Successor basis + entrypoint authority | EFFECTIVE (successor act; implementation published IPD PR #68). Entrypoint refuses unless **all** hold before the DB connection opens: exact `--act-id`; CLI-supplied values equal to compiled constants (`IDENTITY_VALUES_UNRESOLVED`/`MISMATCH` otherwise); no `GATE_A_PRIME_*` environment variable; `win32` + Node `>=22.13.0 <23`; absolute non-existent store path. |
| S1 values | DETERMINED: `ramki-personal-local` / `ipd-personal-local` / `ipd-owner-ramki-personal`; `binding_id c5808abaffd072d6401ce63ad86c6ac0`; `membership_id d25dcc5370100b00766efc5166f65cf3`. CLI-only; never environment. |
| Ordering | P-1 strictly **after S2 passes** and **before S3** (H-12 R5 act §7.2; DQ-4 criterion 7). S2 is NOT EXECUTED, so P-1 is not yet eligible. |
| P-1 procedure (successor act §8, steps 0–6) | 0) preflight capture (hostname, edition, non-elevation, `node -v`, SQLite probe, `git rev-parse HEAD HEAD^{tree}` = designated pin, clean status, module SHA-256); 1) `$StorePath` absolute, outside every worktree, local fixed NTFS, not synchronized, opera
...[truncated 8223 chars]