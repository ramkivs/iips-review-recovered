# CAP-03 — `S2 → P-1 → S3 → QE-1…QE-11` Execution & Evidence Readiness Matrix (`2026-10-26`)

> ## STATUS: **PREPARATION ONLY — NOTHING HOST-BOUND EXECUTED — `S2` REMAINS `NOT EXECUTED`; `P-1` UNSPENT; `S3` `NOT REACHED`; QE `0/11`**
>
> This is a consolidated, source-grounded execution/evidence matrix assembled entirely from
> effective acts and re-measured technical facts, plus a fresh Linux clean-build baseline. It
> **executes no host operation, provisions nothing, designates no endpoint or store value, moves
> no gate, and admits nothing.** Every Linux measurement below is explicitly classified as
> non-qualifying repository evidence. The single next dependency-respecting action remains the
> designated operator's native-Windows `S2` run on `desktop-no0nhtp`.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-S2-P1-S3-QE-READINESS-MATRIX-2026-10-26-01` (census: `0` prior occurrences in IRR and IPD at publication) |
| Tracker registration | Master tracker §16.128; `CV-CORR-108`; `CHG-2026-10-26-04`; verification rows `V767`–`V778` |
| Record type | Readiness/execution/evidence matrix — preparation record; not an authority act, not an execution receipt, not a qualification result |
| Workstream scope | CAP-03 / H-12 R5 chain. The parallel CAP-02 matrix record `IIPS-V3-CAP02-QE-EXECUTION-MATRIX-2026-10-26-01` (tracker §16.127, PRs #287/#288) owns CAP-02 U3 criterion wording, its IRR consumer pin and its evidence-manifest schema; the two records cross-reference, never duplicate, and their receipts are not interchangeable |
| Recorded (UTC) | `2026-10-26` |
| Governing locus | `ramkivs/iips-review-recovered` (IRR); IPD inspected strictly read-only (`0` IPD writes) |
| Designated S2 pin | IPD `ramkivs/iips-production-market-data` commit **`8eec74ae27cda09f3c368b9c299895eae41554db`**, tree **`4eba29029f8d95cfe483e615a7047426b298ce50`** |
| Pin currency (re-measured this pass) | Ancestor of IPD `main@f5eddbc20b944a098a9060a8e3349c6d10b7843e`, **8 commits / 33 paths behind; all 33 paths under `evidence/cross-repository/`; 0 qualified-surface paths**; representative qualified blobs (9/9 incl. `package.json`, both Gate A′ modules, `dispatch.ts`, `endpoint.ts`, runner, parser test) byte-identical pin vs `main` |
| Designated host / operator | `desktop-no0nhtp` — native Windows 11 Home Single Language, `process.platform === 'win32'`, non-elevated operator **Ramki**, operator-supplied Node `>=22.13.0 <23`, flag-free `node:sqlite` |
| Effective authority chain | Gate A′ successor provisioning act `IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01`; S1 identity determination `IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01`; Gate 4 act `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01` (Q1–Q12) + `G4-AMEND-01`; CAP-03 one-pass PA decision `IIPS-V3-CAP03-DR2-DQ1-PA-DECISION-2026-10-25-01`; DQ-6b Path A `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01` (`6/6` effective); H-12 R5 PA adoption act `IIPS-V3-CAP03-G4-H12-R5-PA-ADOPTION-ACT-2026-10-25-01` |
| Fresh evidence | `evidence/integration/cap03-one-pass-continuation-2026-10-26/` |

---

## 1. Stage gate map — current state and hard sequence

```text
S2  native-Windows canonical build/test at 8eec74ae…      NOT EXECUTED (host preconditions 1–3 FAIL in every sandbox session)
  └─ P-1  single bounded provisioning (V-A2-1…V-A2-8)     NOT EXECUTED — one attempt, strictly after S2 passes; unspent
       └─ PF-15  PA endpoint/local-state designation     NOT DESIGNATED — separate reserved PA act (decision request published this pass)
            └─ S3  host/runtime preflight (PF-01…PF-17)  NOT REACHED
                 └─ QE-1…QE-11 (Tier 1/2/3; Q11 before/after)  0/11 EXECUTED
                      └─ Gate C acceptance (QE-11 second limb) → Gate 4 result acceptance → Gate 5 admission   separate acts, none initiated
```

Ordering is structural (Gate 4 act §6/Q5; H-12 R5 adoption act; CAP-03 one-pass §5–§6):
**`S2 → one P-1 → PF-15 designation → S3 → QE-1…QE-11`**, then the separate acceptance/admission
acts. `S2` itself requires **no** `$StorePath`, **no** PF-15 designation, and **no** P-1 consumption
(tracker §16.123.6). CAP-02 closure is **not** a hard prerequisite for CAP-03 `S2` (tracker §16.124).

| Gate / item | Current status | Source of truth |
|---|---|---|
| DQ-4 final QE freeze | **PREPARED AND VALIDATED — NOT ESTABLISHED (`8/10`)**; criteria 7 (host sequence) and 8 (native-Windows canonical evidence) unmet | `IIPS-V3-CAP03-DQ4-QE-FREEZE-MANIFEST-2026-10-25-01` §7 |
| H-12 R5 manifest | **ADOPTED** in IRR (`f4649e36…`, SHA-256 `d0be8bef…`) + bound amended-§8 supplement (`6c777de6…`); IPD mirror receipt published (IPD PRs #94/#95) | tracker §16.123; IPD `evidence/cross-repository/IIPS_V3_CAP03_G4_H12_R5_ADOPTION_IPD_MIRROR_RECEIPT_2026-10-25.md` |
| Gate 4 | **AUTHORIZED — NOT STARTED**; QE `0/11` | Gate 4 act §15.3; tracker §16.123.7 |
| Gate 5 / CV-52 | **NOT INITIATED / NOT ADMITTED — BLOCKED (ACTIVE)** | tracker §16.123.7 |
| Writes / fences | `WRITE_NOT_AUTHORIZED` pre-mutation; all twelve `/api/user-portfolios*` `503` fences intact; `durable:false` / `SESSION_ONLY` unchanged; `IIPS_G3_IPC_BINDING_PROVISIONED` defaults false (test-only `true` fixtures) | Gate E W-1; IRR `ownerContextFromBinding.ts:225` |

---

## 2. `S2` — canonical native-Windows verification

### 2.1 Mandatory preconditions (re-measured every session; any FAIL stops the sequence)

| # | Precondition | Required | This Linux sandbox (2026-10-26, fresh) | Verdict here |
|---|---|---|---|---|
| 1 | Host identity | `desktop-no0nhtp` | host is `e2b.local`; `getent`/`ping` exit 2; TCP 22/3389/5985/5986 unresolved | **FAIL** |
| 2 | OS/platform | native Windows 11, `win32` | Debian 12, `linux`; `powershell`/`pwsh`/`cmd.exe` ABSENT | **FAIL** |
| 3 | Operator | Ramki, non-elevated Windows account | `uid 1001(user), groups … sudo …` — Linux container user | **FAIL** |
| 4 | Exact commit/tree | `8eec74ae…` / `4eba2902…` | verified remotely and in a full-history scratch clone; **unverifiable on the host** until host access | UNVERIFIED ON HOST |
| 5 | Clean full-history checkout | `is-shallow=false`, zero tracked modifications | scratch clone non-shallow & clean; host checkout unverified | UNVERIFIED ON HOST |
| 6 | Node `>=22.13.0 <23` + flag-free `node:sqlite` | operator-supplied Windows runtime; loads without an experimental flag | Linux Node `v22.22.3` loads `node:sqlite` with **no flag** but emits `ExperimentalWarning: SQLite is an experimental feature`; not the operator runtime | UNVERIFIED ON HOST |
| 7 | Evidence destination | outside every Git worktree | host directory unverified; all sandbox evidence kept under `/tmp` (outside worktrees) before governed deposit | UNVERIFIED ON HOST |

Raw transcript: `evidence/integration/cap03-one-pass-continuation-2026-10-26/01-host-recovery-probe.txt`.
Preconditions 1–3 are fatal in this environment, exactly as in the 2026-10-25/26 blocker records
(`IIPS-V3-CAP03-G4-H12-R5-S2-HOST-PRECONDITION-BLOCKER-2026-10-26-01` and its IPD counterpart).

### 2.2 The five prescribed commands and their expected outputs

Expected-output values below were **independently re-measured this pass** on Linux at the exact pin
(`10-ipd-8eec-s2-linux-baseline/`). They are a reproducibility baseline and runbook target only —
**not** host evidence; the host transcript is the sole qualifying artifact.

| # | Command (run in order, from the IPD worktree root) | Exit | Expected output / acceptance fact | Linux baseline this pass |
|---|---|---:|---|---|
| 1 | `npm ci --no-audit --no-fund` | 0 | clean install from `package-lock.json`; no manifest/lock change | exit 0 (`01-npm-ci.txt`) |
| 2 | `npx tsc --noEmit` | 0 | silent clean typecheck | exit 0, no output (`02-tsc-noemit.txt`) |
| 3 | `npm run build` (`tsc && vite build && npm run build:portfolio-ui-package && npm run build:pit-package`) | 0 | exactly **1,140** `dist/**` files | exit 0; count **1,140**; fresh build **1,140/1,140 byte-identical** to the H-12 R5 bound `runtime_dist_set` (`03-*`, `06-dist-inventory-byte-verification.txt`) |
| 4 | canonical guarded `npm test` (= `node scripts/run-tests.mjs`) | 0 | TAP `# tests 924 / # pass 923 / # fail 0 / # skipped 1`; guard line `[test-guard] OK — 924 test(s) executed, 923 passed, exit 0` | reproduced exactly (`04-guarded-npm-test.txt`) |
| 5 | `npm run test:package-consumer` | 0 | JSON `"result": "PASS"`; pack shasum **`cc2aa70186b8fd7bc7255452ac8d8b00d094f53e`** (matches bound `npm_pack_tarball_shasum_sha1`) | PASS, identical shasum (`05-package-consumer.txt`) |

Guarded-runner facts (source-verified at the pin, `scripts/run-tests.mjs`): zero-test/missing
`dist/tests`/stale-counterpart all fail closed; the runner invokes Node's test runner with
`--test-reporter=tap` (ratified by Gate 4 act §4.1) and propagates the child exit code. Direct TAP
is supplemental and cannot replace the guarded result. The mandatory parser test
`tests/g4_run_tests_summary_parsing.test.ts` (blob `49e901b6…`) and helper
`scripts/test-summary-parser.mjs` (blob `15c849fa…`) are present at the pin.

### 2.3 Evidence-capture method (host)

- One operator-created evidence root **outside every Git worktree** (e.g. `C:\iips-evidence\cap03-s2\` —
  the actual path is operator-supplied; never a synced folder, never inside a checkout).
- For each command: UTC start/end, exact command line, raw stdout, raw stderr, exit code, Node
  version, host identity — unnormalized, written once, never edited (corrections are new dated files).
- After step 3: a `dist/**` file inventory with per-file SHA-256 (the Q11-before basis); the count
  must be 1,140 and any discrepancy is a STOP for PA re-designation (no silent acceptance of a new count).
- Deposit after the run through the governed IRR/IPD evidence workflow with independent remote read-back.

### 2.4 Failure handling

Any failed precondition or non-zero exit **stops the sequence immediately**. Preserve the raw
failure transcript outside the worktree; do not repair, retry with flags, switch runtime, elevate,
re-point the checkout, or relabel the result. A failed `S2` does not consume P-1 (P-1 was never
entered), but it blocks every downstream stage; disposition returns to the PA. There is no
substitute: no Linux/WSL/CI/alternate host/alternate commit run may be cited as `S2`.

---

## 3. `P-1` — the single bounded provisioning execution (only after `S2` passes)

### 3.1 One-attempt boundary (successor act §9; host packet §4)

- **One execution, one host, one store path.** The authority is **consumed on completion whether the
  act succeeds or fails**. A failure is recorded `FAILED / ROLLED BACK` or `NOT EXECUTED — <reason>`;
  any re-attempt requires a freshly rendered PA act. No standing provisioning capability is created.
- The store path is an operator-chosen **absolute, local fixed-NTFS path outside every Git worktree,
  not cloud-synced, operator-writable without elevation, and non-existent at execution time**
  (`Test-Path` = False, recorded verbatim). It is selected at execution time per DQ-5 — never
  pre-created, guessed, or named in a preparation record.
- Identity values are the three S1-determined compiled constants, supplied as explicit command
  arguments (never environment variables): `principal_label = ramki-personal-local`,
  `tenantId = ipd-personal-local`, `canonicalOwnerId = ipd-owner-ramki-personal`
  (`gateAPrimeValidation.ts:50–52`, `string | null` + null guard retained).
- All authorization checks (act id, arguments, no `GATE_A_PRIME_*` env values, `win32`, Node range,
  path absoluteness/worktree exclusion, store non-existence) run **before any database connection**;
  refusal leaves zero files and zero rows (`gateAPrimeProvisioning.ts` `authorizeExecution`).

### 3.2 Invocation shape (after `npm run build`; compiled entrypoint at the pin)

```text
node dist/src/persistence/gateAPrimeProvisioning.js \
  --mode=execute \
  --act-id=IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01 \
  --store=<absolute non-existent NTFS path> \
  --principal-label=ramki-personal-local \
  --tenant-id=ipd-personal-local \
  --canonical-owner-id=ipd-owner-ramki-personal \
  --actor=<label>
```

Source-verified this pass: the module's `isMain()` guard accepts the compiled `.js` path; the strict
CLI parser allows only `--mode/--act-id/--store/--principal-label/--tenant-id/--canonical-owner-id/
--actor` (`--name=value` form); success performs exactly one `BEGIN IMMEDIATE` → 1 binding row +
1 membership row + 1 hash-chained audit row → `COMMIT`; any error rolls back. Deterministic id
derivation independently reproduced this pass: `binding_id = c5808abaffd072d6401ce63ad86c6ac0`,
`membership_id = d25dcc5370100b00766efc5166f65cf3` (matching tracker §16.95's recorded prefixes).
No `package.json` script or `bin` exposes provisioning (re-verified: `bin: null`, no script contains
`gateAPrime`).

### 3.3 Required evidence checklist — V-A2-1…V-A2-8 (read-only validator report + independent checks)

| Check | Required observation (successor act §6; host packet §4.1) |
|---|---|
| **V-A2-1** | `_migration_ledger` holds `001`–`004` with computed checksums; schema version 004; migration `001` blob `f594a18264c45ccdcbfa2381592820a72d3c453b` unchanged |
| **V-A2-2** | exactly **1** binding row: `status='ACTIVE'`, `revoked_at IS NULL`, deterministic `binding_id` |
| **V-A2-3** | exactly **1** membership row: `ACTIVE`, attached to V-A2-2's binding, tenant/owner equal the S1 named values |
| **V-A2-4** | `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions` all **0** rows |
| **V-A2-5** | exactly **1** hash-chained `audit_events` row: `event_type='local_principal_binding.provisioned'`, `subject_type='local_principal_binding'`, `subject_id=principal_label`, detail = owner pair; chain verifies |
| **V-A2-6** | `resolveActiveBinding()` returns exactly the provisioned context; before provisioning it threw `BindingAbsentError`; a second ACTIVE row is storage-impossible |
| **V-A2-7** | IPC still returns `WRITE_NOT_AUTHORIZED` before mutation; `evaluatePortSaveGuard()` still hard-false; no write became possible |
| **V-A2-8** | a second invocation is refused (zero change, identical store SHA-256); the act is recorded **consumed** — this mandated idempotence/consumption check is not a retry |

Plus raw artifacts: pre-run absence proof (`Test-Path` False, directory listing, store sha256
`ABSENT`), pre-state zero-row/zero-binding counts, verbatim stdout/stderr and exit code of the single
execute invocation, post-run store SHA-256 + byte length, ledger dump, host identity re-measurement,
and remote read-back of every published artifact. Linux harness probes this pass
(`07-p1-validator-failclosed-probe.txt`) show only the refusal paths: validate on a missing store
fails closed with nothing created, and execute on Linux refuses `PLATFORM_UNSUPPORTED` before any SQL.

P-1 never grants: a second identity/binding/membership, multi-user/auth/RBAC, endpoint admission,
operational writes, `durable:true`, Gate C/4/5 acceptance, Gate 5 admission, `TD-7b`, production
eligibility, or any change to `WRITE_NOT_AUTHORIZED` / `IIPS_G3_IPC_BINDING_PROVISIONED`.

---

## 4. PF-15 — IPC endpoint / local-state directory designation (required before `S3`)

**Current state: `NOT DESIGNATED`.** An exhaustive two-locus authority search this pass
(`03-pf15-authority-search.txt`) found no rendered act naming an endpoint value or state directory;
all references state the designation as outstanding. The transport *mechanism* is complete and
fail-closed in both loci — IPD `src/ipc/endpoint.ts` `resolveEndpointTarget` and IRR
`frontend/server/user-portfolio/ipcClient.ts` `resolveIpcEndpoint` share identical rules:

- `IIPS_G2_IPC_ENDPOINT`: either an absolute local target (on Windows **must** be a named pipe under
  `\\.\pipe\`) or a bare name matching `^[A-Za-z0-9._-]+$`; URLs, `host:port`, relative paths and
  unsafe names are refused; there is no default and no network fallback.
- A bare name requires `IIPS_G3_LOCAL_STATE_DIR` set to an **absolute** directory; on Windows it
  resolves to `\\.\pipe\<name>` (kernel-managed, non-persistent namespace; the state directory is
  validated for absoluteness but is not part of the pipe path).
- Same-host only; one-connection capacity; fail-closed name collision (`FILE_FLAG_FIRST_PIPE_INSTANCE`).

A separate decision-request record published this pass
(`IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-DECISION-REQUEST-2026-10-26-01`) specifies the
exact content a valid PA designation must contain. **No value is invented here**; PF-15 is not a
prerequisite for `S2`, and its absence blocks only `S3`/QE.

---

## 5. `S3` — host/runtime preflight (after P-1 and PF-15)

The complete preflight is PF-01…PF-17 from the IPD host readiness packet
(`IIPS-V3-CAP03-HOST-READINESS-PACKET-2026-10-24-01` §2). Any failure or ambiguity ⇒ STOP with
`NOT EXECUTED — <exact reason>`; no retry, repair, fallback, store deletion, elevation or runtime switch.

| PF | Check | Pass condition |
|---|---|---|
| PF-01 | host identity | `hostname` exactly `desktop-no0nhtp` |
| PF-02 | OS edition | designated Windows 11 Home Single Language caption |
| PF-03 | non-elevation | `WindowsPrincipal.IsInRole(Administrator)` = **False**; account SID recorded |
| PF-04 | platform/runtime | `platform='win32'`; Node `>=22.13.0 <23`; arch recorded |
| PF-05 | flag-free SQLite | `node --input-type=module -e "import {DatabaseSync} from 'node:sqlite'; …"` loads without an experimental flag; full output (incl. any warning) recorded verbatim |
| PF-06 | no runtime switch/install | invoked node path inspected; no install/switch evidence |
| PF-07 | IPD clean tree | `git rev-parse HEAD`/`HEAD^{tree}` = `8eec74ae…`/`4eba2902…`; `status --porcelain` empty; `diff --exit-code` clean |
| PF-08 | IRR clean tree | designated IRR consumer pin, same cleanliness checks |
| PF-09 | full history | `git rev-parse --is-shallow-repository` = `false` |
| PF-10 | no enabling flags | `IIPS_G3_IPC_BINDING_PROVISIONED`, `IIPS_ENABLE_WRITES`, `IIPS_G3_ENABLE_WRITES`, `GATE_E_OVERRIDE` all absent |
| PF-11 | store path syntax | absolute, outside every worktree, local fixed NTFS, non-synced, writable without elevation |
| PF-12 | store absence | `Test-Path $StorePath` = False; nothing created by preflight |
| PF-13 | parent location | parent exists; local fixed NTFS; not network/cloud-synced |
| PF-14 | raw evidence location | `$EvidenceRoot` absolute, writable, outside every worktree, distinct from the store |
| PF-15 | endpoint/state designation | the rendered PF-15 PA designation read verbatim — **blocks until rendered** |
| PF-16 | authority text | exact act IDs, pins, store, order, adoption digests confirmed; no placeholder |
| PF-17 | no prior P-1 consumption | consumption register/receipt confirms the single execution is unspent; any prior attempt requires a fresh act |

---

## 6. QE-1…QE-11 — execution tiers, item matrix and evidence discipline

### 6.1 Adopted three-tier mechanism (Gate 4 act §5/Q4) and status

Tier 1 = real IPC endpoint + dispatcher with every production fence on; Tier 2 = real
`DurablePortfolioStore`/domain store on **disposable copies**; Tier 3 = session-port identity refusal
with real SecurityMaster fixtures. **PASS** requires an executed scenario on the designated host at
the pin with raw evidence in the tier that can reach it. **LIMITATION** (structurally unreachable
under current authority) is never a PASS and never a FAIL of the implementer. Component evidence is
never full-path qualification; green CI/Linux runs carry zero QE credit.

| QE | Purpose (abridged Gate E §4 / QE matrix) | Tier(s) | Known evidence ceiling while W-1 refuses | Current |
|---|---|---|---|---|
| QE-1 | canonical identity: exactly one match; zero/conflicting refused before serialization/port/store with quarantine evidence; caller identity fields refused | 1 + 3 | full-path candidate after P-1 | NOT RUN |
| QE-2 | DP-2 2F: unresolved/ambiguous **write** refused; no bypass; no partial revision | 3 + 2 | component only (no admitted write path) | NOT RUN |
| QE-3 | revision/lifecycle: stale/missing `expectedRevision` rejected; tombstone not disclosed; reset/delete per W-10 | 1 + 2 | write semantics component; read isolation at Tier 1 | NOT RUN |
| QE-4 | create → durable commit → **stop both processes** → restart → byte-identical holdings/contributions/revisions (G2-D3 option (b)) | 2 | measurement only; **limitation, never PASS** until U6/acceptance | NOT RUN |
| QE-5 | idempotent re-import: same `contentDigest` → `ALREADY_IMPORTED_NO_OP`, no new revision, before/after restart | 2 | component only | NOT RUN |
| QE-6 | contribution SHA-256 lineage and broker attribution identical after restart and REPLACE/RESET (DQ-3 Option B: store-tier only; no mapping admission) | 2 | component lineage; contributed-read mapping may remain a limitation | NOT RUN |
| QE-7 | forced termination during a write leaves full revision or none; startup refuses tampered/unverified migrations | 2 | disposable copies only; destructive fixture rule (Gate 4 act §10/Q9) | NOT RUN |
| QE-8 | revocation: post-revocation writes/reads refused incl. after restart; revocation racing a write never yields a post-revocation commit | 1 + 2 | limitation until a provisioned ACTIVE binding exists and a PA-approved revocation procedure; never revoke the sole operator binding without express authority | NOT RUN |
| QE-9 | full W-15 refusal matrix with class-correct refusals and **zero store effect** (row counts before = after); C5.1 zero bytes, **N ≥ 10 cold + 10 warm** | 1 + 2 | refusal classes reachable; write-success path unavailable | NOT RUN |
| QE-10 | outcome-unknown: timeout after send ⇒ no IRR auto-retry; reconcile-by-read demonstrated | 1 (with real IRR consumer) | limitation until an authorized write can produce outcome-unknown without mock | NOT RUN |
| QE-11 | Gate C read-only subset Q1–Q4/Q9–Q11 passed **and accepted** (separate act), incl. C5.1/Q9 zero bytes; Q11 before/after digest discipline | 1 | measurement; the “accepted” limb needs a separate Gate C acceptance act (B7) | NOT RUN |

### 6.2 Ordering and run discipline (Gate 4 act §7/Q7; host packet §5)

1. **Q11-before first**: re-read every adopted H-12 digest from the clean trees and record
   `Q11-BEFORE.json` before any QE item.
2. QE-9 cold and warm (C5.1 N ≥ 10 each); every refusal verified with zero store effect.
3. All other items in the authorized order; tier labelled per scenario; every attempt retained,
   including failures (no deletion, no re-run to replace a record).
4. **Q11-after last**: repeat the entire digest read → `Q11-AFTER.json`; any mismatch, missing path,
   unverified set or non-documentary drift invalidates the run (`INVALID`) and stops for PA disposition.
5. Raw output is never normalized; Windows pipe/DACL behaviour is host-only evidence (POSIX CI cannot
   evidence it). Q1 records-only limb carries the historical Gate V record + D-GC-B waivers as
   waivers, never as technical proof (G-12 reading settled in Gate 4 act Q6).

### 6.3 Evidence deposit layout (Gate 4 act §9/Q8; determination packet D-8)

- One directory per run: `evidence/integration/gate-4-target-host-qualification-<run-id>/` with
  `run-id = GQ-<yyyymmdd>-<nn>`; `raw/**` immutable; corrections are new dated files.
- `MANIFEST.json`: commits/trees, host identity and OS edition, elevation state, operator account,
  Node version, exact commands, exit codes, UTC start/end, tool/harness versions, harness hash.
- Per-item `QE-01.md`…`QE-11.md` (interpretation kept separate from raw transcripts),
  `Q11-BEFORE.json` / `Q11-AFTER.json`, `EXECUTION-RECORD.md`, and a manifest of SHA-256 hashes over
  actual deposited bytes (no line-ending normalization; newline form recorded separately).
- No credentials/secrets/real portfolio data; if captured, stop publication and escalate.
- Publication: IRR PR workflow → green exact-head CI → `--merge` → green post-merge CI → independent
  remote Contents/Blobs read-back with byte comparison and fresh-clone digest reproduction.

### 6.4 Failure classes (exhaustive; Gate 4 act §10/Q9)

`PASS` · `FAIL` · `INCONCLUSIVE` · `NOT EXECUTED — <reason>` · `INVALID` (basis/digest drift). There
is no sixth class and no “pass with caveats”. Destructive items (QE-7, QE-4 restart limbs) run only
on disposable isolated copies (one per scenario, provenance recorded, retention until the acceptance
act); the operator's authoritative store is never opened for a destructive scenario, and the copy
inherits no authority.

---

## 7. Stage prerequisite summary

| Stage | All prerequisites that must hold simultaneously |
|---|---|
| `S2` | effective Gate 4 act + H-12 R5 adoption (done); exact pin with 0 qualified drift (re-verified); host `desktop-no0nhtp` accessible to non-elevated Ramki; Node `>=22.13.0 <23` with flag-free `node:sqlite`; clean full-history checkout; external evidence root. **No P-1, PF-15 or store path needed.** |
| `P-1` | `S2` passed; PF-01…PF-14/PF-16/PF-17 satisfied on the host; unspent single execution; S1 constants in the built entrypoint; non-existent absolute NTFS store outside worktrees |
| `S3` | P-1 V-A2-1…V-A2-8 receipt published and read back; **PF-15 designation rendered and effective**; adopted H-12 digests re-readable |
| QE-1…QE-11 | `S3` preflight fully green; Q11-before captured; Tier 1 endpoint available with fences on; disposable-copy controls for Tier 2; evidence deposit layout prepared |
| Gate C / Gate 4 acceptance / Gate 5 | executed QE evidence plus separate rendered acts; passing tests alone never satisfy acceptance; W-1(3)/(4) remain unmet until then |

## 8. Non-grants and scope attestation

This matrix and its evidence do not: execute `S2`, P-1, `S3` or any QE item; select or name a store
path, endpoint or state directory; render the PF-15 designation; establish the DQ-4 freeze (criteria
7–8 remain unmet); start Gate 4 or credit any QE; accept or admit anything; lift a `503` fence;
authorize `durable:true`, operational writes or production eligibility; change source, tests, pins,
routes, fences, the H-12 manifest or any package manifest; or write to the IPD repository. The Linux
build/test/validator measurements are repository hygiene and reproducibility evidence carrying zero
host-qualification credit.

*End of `IIPS-V3-CAP03-S2-P1-S3-QE-READINESS-MATRIX-2026-10-26-01` — preparation only; `S2` NOT EXECUTED; P-1 unspent; PF-15 NOT DESIGNATED; `S3` NOT REACHED; QE 0/11.*
