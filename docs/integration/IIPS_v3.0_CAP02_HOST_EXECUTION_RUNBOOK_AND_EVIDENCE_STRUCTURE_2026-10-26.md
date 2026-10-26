# CAP-02 — Host Execution Runbook and Run-Evidence Structure (PREPARED — NOT AUTHORITY; NOTHING EXECUTED)

> ## STATUS: **PREPARATION ONLY.** This runbook is the CAP-02-scoped checklist for the designated Windows
> session. It executes nothing, authorizes nothing, designates no value and claims no result. Gate 4/U3
> remains **AUTHORIZED — NOT STARTED**, QE **0/11**, P-1 **NOT EXECUTED**, S3 **NOT REACHED**, U4/U5/U6
> unchanged. **QE-8 is HELD** until the Program Authority renders `RV-1` (see the QE-8 decision request).

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP02-HOST-EXECUTION-RUNBOOK-AND-EVIDENCE-STRUCTURE-2026-10-26-01` (census: 0 prior occurrences) |
| Type | Operator checklist + evidence-deposit structure. Not an act, not an execution record |
| Designated host | `desktop-no0nhtp`; Windows 11 Home Single Language; **non-elevated** operator Ramki; `process.platform === 'win32'`; Node `>=22.13.0 <23`; flag-free `node:sqlite`; no runtime installation or switch |
| CAP-02 pins | IPD `8eec74ae27cda09f3c368b9c299895eae41554db` / tree `4eba29029f8d95cfe483e615a7047426b298ce50`; IRR consumer `ba64b2d5927c2f872560710cf1474c25a5cde0d5` / tree `5e4262f1cd75bf13b76ced5b45058f31434b5dad` |
| Adopted baseline | H-12 R5 manifest `f4649e36…` / SHA-256 `d0be8bef…`; bound supplement `6c777de6…` |
| Governing acts | Gate 4 act `…2026-10-23-01` (§5 tiers, §6 order, §7 grant, §9 evidence, §10 failure classes, §11 durability, §12 executor); Gate A′ successor act `…2026-10-23-01` (§5 V-A2, §8 steps 0–6, §9 one-use) |
| Companion | `IIPS-V3-CAP02-QE8-MATRIX-INTEGRITY-RECONCILIATION-2026-10-26-01`; `IIPS-V3-CAP02-QE8-REVOCATION-PROCEDURE-DECISION-REQUEST-2026-10-26-01` |

## 0. Hard rules

1. Stop on any failed precondition, command, count, digest or unexpected output. Record it; never relabel it.
2. No substitute environment: not Linux, not WSL, not hosted CI, not another host, not another commit, not a mock.
3. Status vocabulary is exactly `PASS` · `FAIL` · `INCONCLUSIVE` · `NOT EXECUTED — <reason>` · `INVALID`. No other class, no "pass with caveats".
4. A limitation is never a PASS; component evidence is never full-path qualification.
5. Raw output is captured, never normalized. Artifacts are written once; corrections are new files.
6. Nothing here lifts `WRITE_NOT_AUTHORIZED`, any `503` fence, `durable:false`, any enabling flag, or grants acceptance/admission/production eligibility.

## 1. Sequence (order is structural)

```text
S2 (5 commands) → single P-1 (V-A2-1…V-A2-8) → PA renders PF-15 → S3 preflight (PF-01…PF-17)
  → QE-1…QE-7, QE-9, QE-10, QE-11  (any order subject to Q11-before/after digests)
  → QE-8  ONLY if RV-1 is rendered and published (else: NOT EXECUTED — no approved revocation procedure)
  → QE-11 after-digest → evidence integrity → Gate C acceptance (separate act) → U4 (separate act)
```

## 2. Preconditions (PF-01…PF-17, abbreviated as executed at S3)

| Group | Checks |
|---|---|
| Host/OS | hostname `desktop-no0nhtp`; Windows 11 Home Single Language; `process.platform === 'win32'` |
| Operator | Ramki, **non-elevated** (administrator check `False`), account SID recorded |
| Runtime | Node major 22, `>=22.13.0 <23`; `node:sqlite` loads flag-free; record any `ExperimentalWarning` verbatim; binary path recorded (no switch) |
| Trees | IPD clean full-history checkout at the designated pin/tree (`git rev-parse HEAD HEAD^{tree}`, `git status --porcelain` empty, `is-shallow = false`); IRR worktree clean at its pin |
| Flags | `IIPS_G3_IPC_BINDING_PROVISIONED`, `IIPS_ENABLE_WRITES`, `IIPS_G3_ENABLE_WRITES`, `GATE_E_OVERRIDE` all **absent** |
| Store/evidence | store path absolute, outside every worktree, local fixed NTFS, unsynchronized, non-elevated-writable; evidence root absolute, outside every worktree, unsynchronized |
| **PF-15** | IPC endpoint / local-state designation **rendered by a PA act** — blocks S3 and QE, not S2 or P-1 |
| Authority | act text confirmations; P-1 register check (unspent) |

## 3. S2 — five commands (all exit 0 required)

```powershell
$RunId        = "cap02-g4-<yyyymmdd>-01"
$EvidenceRoot = "D:\iips-evidence\$RunId"      # absolute, outside every worktree, never synchronized
New-Item -ItemType Directory -Force -Path $EvidenceRoot | Out-Null
function Stamp { (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') }
function Run-Step($Name, [scriptblock]$Block) {
  $out = Join-Path $EvidenceRoot ("s2-{0}.txt" -f $Name)
  "$Name start $(Stamp)" | Tee-Object -FilePath $out -Append
  & $Block *>&1 | Tee-Object -FilePath $out -Append
  $code = $LASTEXITCODE
  "$Name exit $code at $(Stamp)" | Tee-Object -FilePath $out -Append
  if ($code -ne 0) { throw "S2 $Name exit $code — STOP" }
}
Run-Step '01-npm-ci'            { npm ci --no-audit --no-fund }
Run-Step '02-tsc-noemit'       { npx tsc --noEmit }
Run-Step '03-build'            { npm run build }
$distCount = (Get-ChildItem dist -Recurse -File | Measure-Object).Count   # must equal 1140
Run-Step '04-guarded-npm-test' { npm test }        # guard tail + TAP summary recorded verbatim
Run-Step '05-package-consumer' { npm run test:package-consumer }          # consumer "PASS"
```

Any non-zero exit, guard anomaly (zero tests / stale counterpart / missing summary) or `dist` count ≠ 1,140
stops the sequence. Record actual numbers; never normalize to a reference.

## 4. P-1 — the single bounded provisioning execution (one attempt, consumed on completion)

```powershell
# 0) preflight capture -> p1-00-preflight.txt
hostname; node -v; node -e "const{DatabaseSync}=require('node:sqlite');const d=new DatabaseSync(':memory:');d.close();console.log('ok')"
git rev-parse HEAD; git rev-parse "HEAD^{tree}"; git status --porcelain
Get-FileHash src/persistence/gateAPrimeProvisioning.ts,src/persistence/provisioning.ts,src/persistence/binding.ts -Algorithm SHA256
# 1) store path must NOT pre-exist; record Test-Path = False
# 2) read-only pre-state (bindings = 0, memberships = 0)
node dist/persistence/gateAPrimeProvisioning.js --mode=validate --act-id <ACT_ID> --store <ABS_PATH> `
     --principal-label ramki-personal-local --tenant-id ipd-personal-local `
     --canonical-owner-id ipd-owner-ramki-personal --actor ramki      *>&1 | Tee-Object "$EvidenceRoot\p1-02-validate-pre.txt"
# 3) THE single provisioning invocation (verbatim capture + exit code + store sha256/size)
node dist/persistence/gateAPrimeProvisioning.js --mode=execute  --act-id <ACT_ID> --store <ABS_PATH> `
     --principal-label ramki-personal-local --tenant-id ipd-personal-local `
     --canonical-owner-id ipd-owner-ramki-personal --actor ramki      *>&1 | Tee-Object "$EvidenceRoot\p1-03-execute.txt"
# 4) read-only V-A2-1..V-A2-8 report
node dist/persistence/gateAPrimeProvisioning.js --mode=validate --act-id <ACT_ID> --store <ABS_PATH> ... `
     *>&1 | Tee-Object "$EvidenceRoot\p1-04-validate-post.txt"
# 5) post-state: table counts; WRITE_NOT_AUTHORIZED still returned; evaluatePortSaveGuard() still hard-false;
#    second invocation refused with zero change (V-A2-8) -> p1-05-post-state.txt
```

Records: exactly 1 binding (`ACTIVE`, `revoked_at IS NULL`, `c5808abaffd072d6401ce63ad86c6ac0`), 1 membership
(`d25dcc5370100b00766efc5166f65cf3`), 1 audit row `local_principal_binding.provisioned`, chain verifies, four
content tables all `0`, store SHA-256, act consumed. **No retry** without a fresh PA act.

## 5. QE-1…QE-11 — per-item checklist (all HOST-ONLY; all record tier per scenario)

| QE | Scenario to execute | Evidence files | Hold/gate |
|---|---|---|---|
| QE-1 | one-match persist; zero/conflicting → whole-request `REFUSED_UNRESOLVED_IDENTITY` + quarantine (`UNMAPPED_IDENTIFIER` / `AMBIGUOUS_COLLISION`) before serialization/port/store; caller identity fields refused | `qe-01-*.log`, refusal envelopes, row counts | — |
| QE-2 | DP-2 2F unresolved/ambiguous write refused; no `NON_PRODUCTION_OPERATOR_BYPASS` emitted or accepted; no partial revision | `qe-02-*.log`, bypass scan, row counts | — |
| QE-3 | missing `expectedRevision` → `INVALID_REQUEST`; stale → `REVISION_CONFLICT`; tombstoned → `RESOURCE_UNAVAILABLE` indistinguishable; `reset` governed empty revision; `delete` tombstone with history | `qe-03-*.log`, revision read-backs | — |
| QE-4 | create → durable commit → stop **both** IRR and IPD processes → restart both → byte-equal holdings/contributions/revisions; **no OS reboot** | pre-stop dump + hashes, PIDs/exit codes, post-restart read-back | durability fields = measurement only |
| QE-5 | identical `contentDigest` re-import → `ALREADY_IMPORTED_NO_OP`, no new revision, before **and** after restart | `qe-05-*.log`, revision counts | — |
| QE-6 | lineage + broker attribution identical after restart and after `REPLACE`/`RESET` | lineage dumps per transition | — |
| QE-7 | forced termination mid-write → full revision or none; tampered/unverified migration → startup refusal, non-zero exit | kill-timing, startup refusal transcripts | **disposable copies only** |
| **QE-8** | **HELD** — requires `RV-1`; then per the approved procedure (Option A/B/C) with evidence E1–E9 | revocation record + audit line, refusal transcripts, race transcripts | **PA act required** |
| QE-9 | every W-15 condition produces **its** class; zero store effect (before = after row counts); C5.1 N ≥ 10 cold + 10 warm | refusal-matrix table, row-count pairs | — |
| QE-10 | post-send timeout → outcome-unknown surfaced (never success/failure); **no IRR auto-retry**; reconcile-by-read (`portfolio.get` / `.revisions` / `.list`) before any re-attempt | IRR client log (separate process), endpoint log, timeout transcript | — |
| QE-11 | Q11-before digests → Q2 → Q10 → Q9 → Q3 → Q4 → Q1 → Q11-after; Q1 records-only (V-5 inventory + D-GC-B waivers as **waivers**) | `Q11-BEFORE.json`, `Q11-AFTER.json`, Q-transcripts | any drift = `INVALID` |

## 6. Run-evidence structure (deposit)

```text
evidence/cross-repository/cap02_gate4_qe_<yyyy-mm-dd>_<run-id>/
  MANIFEST.json                     # every artifact + SHA-256 + UTC times + host/Node/commit/tree
  SHA256SUMS.txt                    # sha256sum output; manifest hashed last
  EXECUTION-RECORD.md               # ordered transcript index, per-item status, tier, stop conditions hit
  00-preflight/                     # host, OS, non-elevation, node -v, sqlite probe, flags absent, trees clean
  10-s2/                            # s2-01..05 + dist count + dist inventories before/after
  20-p1/                            # p1-00..05 + V-A2-1..8 report + store sha256
  30-s3/                            # PF-01..PF-17 evidence
  40-qe/QE-01.md … QE-11.md         # per item: command, exit code, UTC, host, Node, commit/tree, status, tier
  50-raw/                           # raw stdout/stderr per command, unedited
  60-digests/                       # Q11-before/after, store hashes, chain verifications
```

Publication chain: green exact-head CI → regular merge → green post-merge CI → independent remote
blob/byte read-back → **second read-back with a completeness check** (the §3 lesson: identity ≠
completeness). No credentials; store paths recorded verbatim.

## 7. Stop / no-substitution table

| Situation | Action |
|---|---|
| Any PF mismatch | STOP before commands; `NOT EXECUTED — <reason>` |
| Any command non-zero exit | STOP at that step; preserve raw output |
| `dist` count ≠ 1,140 | STOP; PA re-designation required |
| Guard anomaly | FAIL by design; preserve transcript; STOP |
| Non-documentary drift from pinned tree | `INVALID`; STOP |
| QE-8 reached without `RV-1` | `NOT EXECUTED — no approved revocation procedure`; continue with other items |
| Any post-revocation commit observed (QE-8) | FAIL finding; STOP; PA disposition |
| Temptation to use Linux/WSL/CI/another host/commit/mock | prohibited; result does not count |

*End of `IIPS-V3-CAP02-HOST-EXECUTION-RUNBOOK-AND-EVIDENCE-STRUCTURE-2026-10-26-01`. Preparation only: no
host command dispatched, no store, no binding, no QE result, no acceptance, no gate moved.*
