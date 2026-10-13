# IIPS v3.0 — Gate C P-2: Execution Handoff (Arena → Designated Non-Production Host), Designation Set `P2-A-D1`

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG12-GATE-C-P2-EXECUTION-HANDOFF-ARENA-TO-NON-PRODUCTION-HOST-2026-10-13-01` |
| Gate / step | **Gate C (`REG-12` / `G-2` / `F-4` / `AG-5`) — prerequisite P-2**, execution step ③–⑤ of the adopted sequence (P-2 request §7.2; worksheet §8) |
| Record type | **Preparation record + execution handoff. RENDERS NO AUTHORITY AND PERFORMS NO P-2 OPERATION.** Creates no key, starts no issuer, creates no runtime database, provisions no P-4, changes no IRR or IPD byte, no pin, no lockfile, no fence, no route, no runtime. |
| Deciding authority | **Ramki** — single owner, sole user and Program Authority of the single-user, personal-use, non-production IIPS platform |
| Recording agent | Arena Agent Mode — read-only investigation, handoff preparation, governance-record publication and verification only, under the attributed standing authorization. **No authority is rendered by the agent.** |
| Date | **2026-10-13** (UTC). Recorded on its actual date; not backdated. |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main` |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not modified; no IPD ref, branch, tag, file or database is written by this record** |
| Verified IRR baseline | `main@33bbb0fac947476bd70993810f730e09018f5f8f` (merge of PR #90 — `GC-D6` corrective publication) — re-verified live this session |
| Verified IPD baselines | `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c`; pin `np04-governed-persistence-windows@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; G24 `arena/01a0e6d9…` and `arena/01a0f308…` both `@6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`); act branch `arena/01a0f839…@12c480b5bf5cfbe0f296fcd12c9189328b915417` — **all four re-verified live and UNCHANGED** |
| Governing records | `GC-D4` (Gate C packet §9.8); `GC-D5`/`GC-D6` act `docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_DESIGNATION_ACT_P2-A-D1_2026-10-13.md`; worksheets/decision request `…_EXECUTION_DESIGNATION_WORKSHEET_…_2026-10-13.md`; P-2 request `…_TRUST_ANCHOR_ISSUER_CONFIGURATION_PA_DECISION_REQUEST_2026-10-13.md` §§7.2–7.4, §12; 1A′ specification `…_S5A_DP1_OPTION_1A_PRIME_BINDING_CONTRACT_AND_PREREQUISITE_SPECIFICATION_2026-10-13.md` §§5, 6, 8, 9, 10; canonical tracker §§15.11–15.13 |
| Status | **P-2 EXECUTION HANDOFF COMPLETE — READY FOR THE DESIGNATED NON-PRODUCTION HOST. No P-2 operation has been performed. `/api/user-portfolios*` remains fail-closed at source-level HTTP `503 owner-context-unavailable`.** |

> **Bottom line.** `GC-D6` closed the P-2 designation act; the ten adopted `P2-A-D1` values are fixed and are **not** re-opened here. This record does the three things that remain before the operator touches the host: it re-verifies the mutable facts (§3), it resolves the **designated non-production host** from the P-2 requirements and existing evidence rather than assuming it (§4), and it resolves every **genuine environment dependency** read-only, including the one that would otherwise force an installation (§5). It then hands over the smallest sufficient, self-contained execution package — six blocks, each with exact commands, expected results, fail-closed checks and the evidence to return (§6–§8) — for execution **by the operator on the designated host**, which is where the loopback trust perimeter, the operator's key custody and the scoped G24 runtime must actually exist. Key material is generated only there; no key byte, token or credential may enter this repository, any record, or this handoff's output.

---

## 1. Purpose, bounded scope, non-goals

### 1.1 Purpose

Continue the already-authorized P-2 establishment sequence under the adopted `P2-A-D1` designations by producing the execution handoff for the designated non-production host, with:

1. the authoritative P-2 establishment requirements read in full (P-2 request §§7.2–7.4; worksheet §§4–8; 1A′ §5.2 `R-2.1…R-2.10`, §5.3, §9) and their **not-yet-verified prerequisites** identified (§4.2);
2. the **designated non-production host** resolved from those requirements and the existing evidence, separating verified facts from unresolved facts (§4);
3. every **genuine environment dependency** resolved by the smallest read-only investigation available from Arena, so that no installation is prescribed unless a verified requirement demands one (§5);
4. the handoff itself: exact execution blocks, expected results, fail-closed checks, and the evidence to return (§6–§7), plus the evidence rules that keep key material, tokens and credentials out of every record (§8).

### 1.2 In scope

Read-only local and remote verification (§3); read-only inspection of the pinned G24 tree in an **Arena scratch clone** (§5.4); authoring of the operator-side tooling **inventory and interface** (§6.0); this record; its publication on the session branch through the established pull-request workflow.

### 1.3 Non-goals (explicit)

This record does **not**:

- generate, store, custody, transfer, print or hash **any** private key material; create an issuer, JWKS endpoint or anchor; start any runtime; create, open, migrate or query any SQLite database;
- perform, or authorize, any P-4 provisioning (no `application_user`, `(publication) issuer+subject` mapping, tenant, membership or audit row);
- grant P-6 implementation authority, execute P-8 qualification, change the User Portfolios HTTP `503` fence or the Option 2F refusal, activate any route/UI, or admit any consumer;
- write the IPD repository in any way, promote G24, merge/re-pin the NP-04 and G24 lineages, or designate a Company Identity Authority;
- reopen any designation question, substitute any adopted value, or re-derive any completed S0–S5 finding;
- place the anchor implementation **inside either repository**: the tooling is operator-side, lives only in the P-2 state root, and is delivered in the operating session — this record carries its **inventory, interfaces and canonical byte hashes**, not its implementation text (worksheet §4.7 boundary preserved).

---

## 2. Authority basis

`GC-D4` (packet §9.8) rendered the P-2 package and all fixed terms; `GC-D5`/`GC-D6` (act, corrected by PR #90, `main@33bbb0f…`) adopted Designation Set `P2-A-D1` in full — `ISSUER`, `JWKS_URI`, the verbatim JWKS trust statement, `RS256`, 2048-bit RSA, custody at `$HOME/.iips-gate-c-p2/anchor/keys/` with `0700`/`0600` and exactly one reader, the generation/destruction method, ≤90-day bounded rotation plus on-demand triggers, `SUBJECT` `p2-principal-0001`, and `IPD_PORTFOLIO_DB_PATH` `$HOME/.iips-gate-c-p2/runtime/portfolio.sqlite`. The act's own §3 states that on durable publication and independent verification of the act, **"the P-2 operator establishment sequence specified in the existing P-2 request §§7.2–7.3 may begin using the adopted designations."** That condition is satisfied: `GC-D6` is closed, durable and independently verified at `main@33bbb0f…`.

What that authorizes is the **establishment sequence itself**: key generation at the designated custody location, JWKS publication under a stable `kid`, start of the scoped non-production G24 runtime from pinned ref `6828155e…` with the four designated values, and the §7.3 establishment verification — by the **operator**, on the designated host. What it does not authorize — P-4 provisioning, P-6 implementation, P-8 qualification, fence or route changes — is restated in §9.

The attributed standing authorization (F-3 source blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`, re-verified unchanged) covers **governance-record preparation, branch publication for review and read-only verification**; it is the basis for this record and for nothing else.

---

## 3. Live re-verification performed this session (mutable facts only)

Method: local `git` object inspection against the published refs; GitHub REST API via `gh` (`git/refs`, `contents`, `git` over HTTPS) for the IPD side; a **read-only scratch clone** of IPD in `/tmp` (outside the workspace, never pushed). Completed S0–S5 investigations were **not** repeated; no application test was re-run in IRR (no IRR application byte changed).

| Item | Verified value | State |
|---|---|---|
| IRR `main` (local == remote) | **`33bbb0fac947476bd70993810f730e09018f5f8f`** — merge of PR #90 (`GC-D6`) | current authoritative tip; matches the task-provided coordinate |
| `GC-D6`-corrected act at `main` | `docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_DESIGNATION_ACT_P2-A-D1_2026-10-13.md` — carries all ten adopted values, the `RS256` + `ipd-user-portfolio-api` parameters and the verbatim §4.3 trust statement | **present as corrected** |
| Fence blobs at `main` | `frontend/server/reports-transport.ts` `981470541812a64c733309f1debec75455d85bee`; `frontend/server/user-portfolio-transport.ts` `51704c12a467cd2f718a030b5036bc55c9afa73f`; `frontend/server/owner-context-unavailable.ts` `cb8db45d668d28cee7e0a52721001d579a872733` | **all unchanged** |
| Tested 2F blobs at `main` | `userPortfolioContract.ts` `0dec72eb750206603196c67f6b27947420d7e6ac`; `translationBoundary.ts` `93f602fd7e78395d3cedb77ff504388a4e65012f`; `userPortfolioBoundary.ts` `b8024c6b6d7a75591a77d032813c7312876a0612`; `userPortfolioPort.ts` `ba0001e88c83b070e4f16a3cdb35d34c82ec0200` | **byte-identical to tested tree `8bb5bdae…`** |
| F-3 carrier / resolver | `a576e5af983c9351e2ea73202ef7f19d61788d13` / `9738e9b393656eec33f849d78f18c606322a4462` | **unchanged** |
| IPD `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | **UNCHANGED** (`pushed_at 2026-10-02T12:50:06Z`) |
| NP-04 pin `np04-governed-persistence-windows` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | **UNCHANGED** |
| G24 `arena/01a0e6d9…` and `arena/01a0f308…` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (both); tree **`eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`** | **UNCHANGED, undrifted** — equals the `G2_LINEAGE.tree` pin held by IRR `userPortfolioContract.ts` |
| Act branch `arena/01a0f839…` | `12c480b5bf5cfbe0f296fcd12c9189328b915417` | **UNCHANGED** |

**Lineage distinction preserved:** NP-04 (`2e11fa3b…`, artifact/report domain) and G24 (`6828155e…`, portfolio/tenancy domain, branch-only reference per `AD-03`) remain distinct stores on separate refs; nothing here merges, converges, re-pins or promotes either.

---

## 4. The designated non-production host (Task B)

### 4.1 What the P-2 requirements actually fix

The P-2 requirements do **not** name a hostname, an OS or a machine account, and this record does not invent one. They fix **properties** that jointly determine the host:

| Requirement | Source | Consequence |
|---|---|---|
| The JWKS endpoint is "served by the operator's own minimal OIDC-compatible signing service, **bound exclusively to IPv4 loopback on the non-production host**" | act §2.2 (trust statement) | the anchor is a loopback service on *the* non-production host |
| The scoped runtime resolves keys from `IPD_OIDC_JWKS_URI` = `http://127.0.0.1:8421/non-production/p2-anchor/jwks.json` — a loopback address | adopted §2.1 values | the scoped runtime must run **on the same host** as the anchor (loopback is not routable across hosts) |
| The scoped runtime is the **G24 runtime started from pinned ref `6828155e…`** with its own `IPD_PORTFOLIO_DB_PATH` | `R-2.9` | the host must hold a working tree of the IPD repository at that exact commit |
| Custody `$HOME/.iips-gate-c-p2/anchor/keys/` "resolved to an absolute path on **the designated host** at establishment", with the state root **outside both the IRR and IPD working trees** | adopted designation 5; worksheet §4.5 | the host holds the operator's IRR **and** IPD working trees, and the operator's OS account is the only reader |
| Exactly one reader: "the designated operator OS account running the anchor" | adopted designation 6 | one interactive human account, running both the anchor and the runtime |

### 4.2 Verified facts vs unresolved facts

**Verified (evidence, not inference):**

1. **Arena cannot be the host.** Arena is a re-provisionable Linux sandbox (only remote state is durable — `G2-UI-CONSUMER-DURABLE-HANDOFF-2026-10-08.md` §1), it holds no operator account, no custody, and — decisively — **no key material may be generated or handled by an agent** at all (`R-2.7`; worksheet §4.7; §5.3 self-asserted delegation by the single natural person).
2. **Arena and the operator's host do not share a filesystem, runtime or state.** Recorded verbatim in the IPD convergence plan (`docs/FULL_IIPS_BI08_CONVERGENCE_PLAN.md:599`): **"Arena cannot read `G:\`. Windows cannot read the Arena sandbox. Git is the only channel."** The transport is therefore paste/Git-portable text plus returned evidence — never a shared path.
3. **The operator's non-production host is a Windows host, and it is where the IPD working trees live.** Existing evidence: `windows-acceptance-evidence/WINDOWS-FULL-SHELL-VISUAL-ACCEPTANCE-20260923.md` at the G24 pin (worktree `G:\IIPS-IIPS-FULL-SHELL-WINDOWS-ACCEPTANCE`; `npm.cmd test` → 516/516, exit 0); `evidence/operator_drop/windows_bi08_visual_acceptance_manifest.md` (`G:\IIPS-BI07-Windows-Host-Verify`); `evidence/bi07/bi07-final-certification.md` (`G:\IIPS-BI07-Windows-Host-Verify`); the governed-persistence pin itself is named `np04-governed-persistence-windows`; the IPD acceptance record for the G24 lineage's persistence work is a Windows execution record.
4. **The environment facts reported for that host are consistent with the window used here**: Node.js present, `openssl.exe` absent, no WSL distribution installed (the last two are *not* blockers — see §5.1).

**Unresolved (deliberately not guessed, and resolved by execution, not by assumption):**

1. the exact machine identity (hostname/OS build) of the host that will run the anchor and the scoped runtime;
2. the absolute `$HOME` expansion on that host, and the absolute paths of the IRR and IPD working trees in use;
3. whether a working tree at the G24 pin already exists on that host, or must be created (§6 Block A/B);
4. the host's exact Node version/architecture and npm registry reachability;
5. the final ACL state of the custody directories/files after the Windows permission mapping (§5.3).

**Operative determination.** The designated non-production host is **the single operator Windows host that holds the IPD working tree containing pin `6828155e…` and on which the anchor and the scoped G24 runtime will be loopback-colocated** — i.e. the machine the §4.2 evidence above already places at the `G:\` worktrees. This record does **not** treat "the PowerShell session in front of the operator" as that host by assumption: **Block A verifies host identity, `$HOME` resolution, working-tree isolation and the pin checkout, and fails closed if any of them is not the host the P-2 requirements describe.** If Block A is run on a machine without the pinned IPD working tree, the correct outcome is a recorded `FAIL` and a move to the right host — never a substitution of a different machine, and never a silent substitution of a different G24 commit.

---

## 5. Genuine environment dependencies and their resolution (Task D)

Each item below was resolved by the **smallest read-only investigation available from Arena** — local source inspection, the vendored pin, the pinned tree's compiled loaders, and the public npm registry metadata/tarball. Nothing was installed or prescribed that a verified requirement does not demand.

### 5.1 No `openssl.exe`, no WSL — and none is required

Adopted designation 7 permits generation by **"OpenSSL 3.x `genpkey` **or** the specified program primitive"**, and worksheet §4.7 defines that primitive as **the program's own Node primitive** (`crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })`, PKCS#8 PEM, public JWK `{…jwk, kid, alg:'RS256', use:'sig'}` — exactly `tests/g24_test_support.ts` `c3b11ee7…` at the pin). Node.js is available on the host. ⇒ **The Node primitive is used; `openssl.exe` and WSL are not required and must not be installed for this purpose.**

### 5.2 The one dependency that could have forced an install — resolved: it does not

The pinned G24 runtime's persistence layer imports **`better-sqlite3@13.0.3`** (IPD `package.json` at the pin; `src/persistence/connection.ts` is the only holder of the native handle). This is a native module, so it is the only real candidate for a toolchain requirement. Verified read-only from the published package:

| Fact | Value | Source |
|---|---|---|
| `engines.node` | **`>=22`** | `registry.npmjs.org/better-sqlite3/13.0.3` metadata |
| Prebuilt binaries **shipped inside the npm tarball** | **8** platform binaries, including **`prebuilds/win32-x64.node`** and `prebuilds/win32-arm64.node` | tarball listing (`…/better-sqlite3-13.0.3.tgz`, `package/prebuilds/*`) |
| Loader that selects the prebuild | `lib/win32-x64.js` → `require('../prebuilds/win32-x64.node')`; `lib/binding.js` falls back to `prebuilds/<platform>-<arch>.node` before any node-gyp path | package contents |
| `dependencies` | `node-addon-api ^8.0.0` (pure JS, no build) | metadata |
| `install` script | **none defined** — but `binding.gyp` is present, so npm's default behaviour would still attempt `node-gyp rebuild`, which requires a compiler/Python on Windows | metadata + npm default behaviour |

**Resolution (no installation needed):** install with **`npm ci --ignore-scripts`**. That skips npm's default `binding.gyp` rebuild and leaves the shipped `win32-x64.node` prebuild in place, which the library loads at runtime. This was **verified end-to-end in Arena on the pinned tree** (§5.4): the equivalent Linux path installed cleanly with `--ignore-scripts`, and `require('better-sqlite3')` loaded the shipped prebuild (SQLite 3.53.4) with no compiler involved. ⇒ **No Python, no Visual Studio Build Tools, no `node-gyp`, no OpenSSL, no WSL.** Node.js must be **≥ 22**; if the host has less, that is a genuine, verified requirement — but it is an environment change, so Block A stops and reports rather than silently installing.

### 5.3 Windows has no POSIX modes — the adopted `0700`/`0600` maps to NTFS ACLs

Adopted designations 5–6 fix **exactly one reader** (the operator OS account running the anchor) enforced by filesystem permissions at `0700` (directories) / `0600` (key files). Windows does not implement POSIX mode bits; the equivalents used here are:

- `icacls <dir> /inheritance:r /grant:r "<operatorAccount>:(OI)(CI)F"` for each custody directory (no inherited access; the operator account is the only granted principal);
- `icacls <keyFile> /inheritance:r /grant:r "<operatorAccount>:F"` for each key file;
- the resulting `icacls` listing is captured verbatim as evidence, and any principal that survives the tightening is **recorded explicitly, never silently accepted**;
- the platform limitation is recorded honestly: NTFS ACLs are the control, but a local Administrator can take ownership of any file (the same class of limitation as `root` on POSIX). The record states the limitation rather than claiming forensic equivalence to `0600`.

A second Windows-specific mapping follows from the same rule: the adopted destruction procedure (`shred -u -n 1 --remove=wipesync` "where available", worksheet §4.7(d)) has **no Windows equivalent**, and the worksheet already requires the operator to *"rely on full-disk encryption or host-level secure erase for those layers — and the record must state that limitation rather than claim forensic erasure."* On this host: overwrite-in-place followed by delete, with the storage-layer limitation stated in the record.

### 5.4 The pinned tree was reproduced read-only in an Arena scratch clone

Because the runtime must be started from an exact commit, and because a failed build would waste the operator's establishment window, the pin was reproduced **outside the workspace, in a scratch clone, with no push and no IPD write**:

| Check | Observed | Meaning for the handoff |
|---|---|---|
| `git rev-parse HEAD` / `^{tree}` at the pin | `6828155ec…` / `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5` | the pin and its tree are intact and match the IRR-side `G2_LINEAGE.tree` |
| `npm ci --ignore-scripts` | **exit 0**, 30 packages, `prebuilds/*` present | §5.2 resolution confirmed; the build path needs no compiler |
| `require('better-sqlite3')` | loads the shipped prebuild; SQLite **3.53.4** | native layer functional under Node 22 |
| `npx tsc` | **exit 2 with exactly 4 pre-existing baseline errors** — `tests/wsi_iu1_pit_series_aware_keying.test.ts:104` (×1), `tests/wsj_iu3_pit_read_boundary.test.ts:302,311,315` (×3) — **matching the NP-04 governance record verbatim**; `dist/` **is still emitted** (`noEmitOnError` is not set) | the build is expected to be **non-zero but successful**; Block C checks *the exact 4 errors and the emitted artifacts*, never a bare exit code |
| `dist/src/server/http-server.js` imports | only `node:http` + `src/**` modules | the runtime needs **no frontend build** (the `frontend/…/types.js` import is type-only and erased) |
| Module surface | `http-server.js` exports `IpdHttpServer`, **`startIpdServer(env)`** (loadIpdHttpConfig → loadOidcTrustConfig → initializePersistence → listen); `bootstrap.js` exports `initializePersistence`; `oidc-verifier.js` exports `OidcVerifier` | one exact entry point exists for the scoped runtime — **no IPD source change is required** |
| Compiled loader matrix (`src/auth/config.js`, `src/persistence/config.js`, `src/server/config.js`) executed directly | 8/8 fail-closed checks PASS (see Block F) | §7.3(1) is executable read-only, and the designated values are accepted while every malformed variant is rejected |

### 5.5 Platform note carried into the handoff

`IPD_PORTFOLIO_DB_PATH` is validated with Node's **platform-native** `path.isAbsolute()`. A Windows absolute path (`C:\…`) is therefore accepted on Windows and rejected as relative elsewhere (and vice versa). This is expected behaviour, not a defect; the operator's evidence must show the *designated* absolute path being accepted on the designated host.

---

## 6. The handoff (Task C)

### 6.0 Operator-side tooling — inventory, interfaces and integrity

The anchor implementation, the token-minting tool, the configuration check and the runtime launcher are **operator-side tooling outside both repositories** (worksheet §4.7). They are delivered in the operating session, transcribed by the operator **into the P-2 state root only**, and are never committed to IRR or IPD, never imported by IRR code, and never re-implemented in this record.

| File (written under `$HOME\.iips-gate-c-p2\…`) | Purpose | Interface | Lines |
|---|---|---|---|
| `anchor\new-anchor-key.mjs` | one-time RSA-2048 key generation directly into custody | `node new-anchor-key.mjs <custodyDirAbs> <kid>`; refuses to overwrite (`wx` + existence pre-check, exit 66); prints one JSON line: `kid`, `keyPath`, `modulusBits`, `publicJwkSha256`, `publicJwk` — **never** private bytes | 32 |
| `anchor\anchor-jwks.mjs` | the minimal signing service's **public** surface: serves the JWKS document only | binds `127.0.0.1:8421`; `GET /non-production/p2-anchor/jwks.json` → `{"keys":[…]}`, other paths 404; prints one JSON line with `kid`, `keyCount`, `documentSha256` | 39 |
| `anchor\mint-token.mjs` | short-lived establishment-verification bearer for the fixed subject, plus the negative variants | `node mint-token.mjs <custodyDirAbs> <kid> [--iss=][--aud=][--sub=][--ttl=][--alg=][--kid-out=][--nbf=][--break-sig]`; writes **stdout only**, nothing to disk; defaults `iss`/`aud`/`sub` = the adopted designations, `ttl` 300 s | 48 |
| `runtime\check-config-failclosed.mjs` | §7.3(1) read-only fail-closed matrix against the pinned tree's own loaders | `node check-config-failclosed.mjs <abs path to pinned dist>`; prints one JSON line per check + a summary; exit 0 only if all pass | 43 |
| `runtime\run-scoped-runtime.mjs` | starts the pinned runtime through its own `startIpdServer(env)` after requiring the six environment variables to be present and non-blank; graceful `SIGINT`/`SIGTERM` close | `node run-scoped-runtime.mjs <abs path to pinned dist/src/server/http-server.js>`; prints one JSON line with the effective bind, issuer, audience, JWKS URI and database path | 29 |

**Integrity of the transcribed tooling.** Each file is written with **LF** line endings (normalisation command in Block B) and the operator returns each file's SHA-256 in the evidence. Canonical LF byte hashes of the delivered tooling:

```
53ba22d2742e002439e246e656074d6f173428fe9daf0a9409918b30b330c6e2  anchor-jwks.mjs
5d403f6e769fffaa78bfe714ab0b65ae9b59165c5d889963f632591d6ed823dd  check-config-failclosed.mjs
d37ee4b2b9f49084732010aa41b04912826a86a0a41faced4e4ed7758b08904c  mint-token.mjs
19f5e02f988968e0d342efecb8f452b80bd11b7668b08bdb1f26c0a5ddecc3c6  new-anchor-key.mjs
0a231e63a3c5712a7002d0043f8fb71c818e9cc15aed78e238b885ddce5b37a6  run-scoped-runtime.mjs
```
A hash **mismatch means the executed bytes differ from the delivered bytes** — the deviation is recorded and returned, not silently ignored.

**Common variables — set at the top of *each* PowerShell console used below** (Blocks E and F use two consoles: the anchor and the scoped runtime each keep one, and the verification commands run in a third):

```powershell
$stateRoot = Join-Path $env:USERPROFILE '.iips-gate-c-p2'
$custody   = "$stateRoot\anchor\keys"
$ev        = "$stateRoot\evidence"
$me        = (whoami)
$ipdPath   = '<absolute path of the IPD working tree that holds the pin>'   # operator supplies
$kid       = '<the kid created in Block E, e.g. p2-rsa-2026-10-13-01>'      # operator supplies after Block E
```

### 6.1 Block A — host and prerequisite verification (read-only; creates nothing)

Establishes the host's identity and resolves the §4.2 unresolved facts. **STOP conditions**: any FAIL below ends the run; report the observed values.

```powershell
$ErrorActionPreference='Stop'
function Chk($id,$ok,$detail){ "{0} STATUS={1} {2}" -f $id,($(if($ok){'PASS'}else{'FAIL'})),$detail }

$me   = (whoami)
$os   = Get-CimInstance Win32_OperatingSystem
$node = (node -v); $npm = (npm -v)
$nodeMajor = [int](node -p "process.versions.node.split('.')[0]")

Chk 'A1 host'    $true "hostname=$env:COMPUTERNAME user=$me os=$($os.Caption) build=$($os.BuildNumber)"
Chk 'A2 node 22' ($nodeMajor -ge 22) "node=$node npm=$npm (better-sqlite3@13.0.3 engines.node >=22 — verified)"
Chk 'A3 arch'    $true "arch=$env:PROCESSOR_ARCHITECTURE (prebuilds shipped for win32-x64 and win32-arm64)"
Chk 'A4 home'    ($env:USERPROFILE -match '^[A-Za-z]:\\') "USERPROFILE=$env:USERPROFILE resolved=$((Resolve-Path $env:USERPROFILE).Path)"

foreach ($p in 8421,8099,8080) {
  $busy = Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue
  Chk "A5 port $p" (-not $busy) "listening=$([bool]$busy)"
}
# If the NetTCPIP module is unavailable, substitute: netstat -ano | findstr ":8421 :8099 :8080"  (no output = free)

$ipdPath = '<absolute path of the IPD working tree that holds the pin>'   # operator supplies
$irrPath = '<absolute path of the IRR working tree in use>'               # operator supplies
Chk 'A6 pin' (Test-Path (Join-Path $ipdPath '.git')) "ipdPath=$ipdPath"
Chk 'A7 irr' (Test-Path (Join-Path $irrPath '.git')) "irrPath=$irrPath"

$stateRoot = Join-Path $env:USERPROFILE '.iips-gate-c-p2'
Chk 'A8 state-root outside trees' (-not ($stateRoot -like "$ipdPath*") -and -not ($stateRoot -like "$irrPath*")) "stateRoot=$stateRoot"
Chk 'A9 state-root absent' (-not (Test-Path $stateRoot)) "exists=$(Test-Path $stateRoot)  (true means a prior attempt exists — STOP and report)"
```

Pin verification (the G24 commit itself), **run in the IPD working tree**:

```powershell
git -C $ipdPath rev-parse HEAD
git -C $ipdPath rev-parse 'HEAD^{tree}'
git -C $ipdPath status --porcelain
```
Expected: head **`6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`**, tree **`eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`**, porcelain empty. If the working tree is not at the pin, create the scoped checkout **in Block B** rather than moving it — the operator's existing checkouts are not to be disturbed.

### 6.2 Block B — state root, custody, ACLs and tooling transcription

```powershell
$stateRoot = Join-Path $env:USERPROFILE '.iips-gate-c-p2'
$ev = Join-Path $stateRoot 'evidence'; New-Item -ItemType Directory -Force $ev | Out-Null
$dirs = @($stateRoot, "$stateRoot\anchor", "$stateRoot\anchor\keys", "$stateRoot\runtime", $ev)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force $d | Out-Null }
$me = (whoami)
foreach ($d in @($stateRoot,"$stateRoot\anchor","$stateRoot\anchor\keys","$stateRoot\runtime")) {
  icacls $d /inheritance:r /grant:r "${me}:(OI)(CI)F" | Out-Null
  "ACL-DIR $d"; icacls $d
}
```
Then write the five tooling files (from the operating session's handoff text) with a PowerShell here-string per file (`Set-Content -LiteralPath $f -Value @'…'@ -NoNewline -Encoding utf8`), then normalise them to LF and hash them:

```powershell
$files = @("$stateRoot\anchor\new-anchor-key.mjs","$stateRoot\anchor\anchor-jwks.mjs",
           "$stateRoot\anchor\mint-token.mjs","$stateRoot\runtime\check-config-failclosed.mjs",
           "$stateRoot\runtime\run-scoped-runtime.mjs")
foreach ($f in $files) {
  $txt = (Get-Content -Raw -LiteralPath $f) -replace "`r`n","`n"
  [IO.File]::WriteAllText($f, $txt)
  "TOOLING {0} {1}" -f (Get-FileHash $f -Algorithm SHA256).Hash.ToLower(), (Split-Path $f -Leaf)
}
```
Expected: five `TOOLING` lines; the four listed in §6.0 must match their canonical hashes, and any mismatch is reported (§6.0). ACLs on the key file are applied in Block C, immediately after generation.

### 6.3 Block C — build the scoped runtime from the pin (or create the scoped checkout)

If the Block A working tree is already at the pin, run the build there; otherwise create a dedicated scoped checkout first:

```powershell
# only if no pin working tree exists yet (creates a LOCAL checkout; writes nothing to the IPD remote)
git clone https://github.com/ramkivs/iips-production-market-data.git $ipdPath
git -C $ipdPath fetch origin refs/heads/arena/01a0e6d9-iips-production-market-data
git -C $ipdPath checkout --detach 6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4
```
Build (both paths):

```powershell
Set-Location $ipdPath
npm ci --ignore-scripts
npx tsc *> "$ev\c-tsc.log"; "TSC_EXIT=$LASTEXITCODE"
$errs = Select-String -Path "$ev\c-tsc.log" -Pattern 'error TS'
"TSC_ERRORS=$($errs.Count)"
$errs | ForEach-Object { $_.Line }
"HTTP_SERVER_JS_EXISTS=" + (Test-Path "$ipdPath\dist\src\server\http-server.js")
"BSQ3_PREBUILD_EXISTS=" + (Test-Path "$ipdPath\node_modules\better-sqlite3\prebuilds\win32-x64.node")
```
**Fail-closed checks:** `TSC_EXIT` may be `2` — expected — but the log must contain **exactly the 4 known baseline errors** (`wsi_iu1_pit_series_aware_keying` ×1, `wsj_iu3_pit_read_boundary` ×3) and **both** existence checks must be `True`. **Any other error, a count other than 4, or a missing artifact ⇒ STOP and report.**

### 6.4 Block D — fail-closed startup controls, executed **before** the first successful start

These prove the runtime *cannot* start half-configured, and that a failed start creates no database.

```powershell
$g24 = "$ipdPath\dist\src\server\http-server.js"
$env:IPD_HTTP_HOST='127.0.0.1'; $env:IPD_HTTP_PORT='8099'
$env:IPD_OIDC_AUDIENCE='ipd-user-portfolio-api'
$env:IPD_PORTFOLIO_DB_PATH = "$stateRoot\runtime\portfolio.sqlite"
$env:IPD_OIDC_JWKS_URI = 'http://127.0.0.1:8421/non-production/p2-anchor/jwks.json'

# D1 — issuer absent: must fail before persistence is touched
Remove-Item Env:IPD_OIDC_ISSUER -ErrorAction SilentlyContinue
node "$stateRoot\runtime\run-scoped-runtime.mjs" $g24; "D1_EXIT=$LASTEXITCODE"
"D1_DB_CREATED=" + (Test-Path $env:IPD_PORTFOLIO_DB_PATH)

# D2 — issuer present, database path relative: must fail at configuration validation
$env:IPD_OIDC_ISSUER = 'http://127.0.0.1:8421/non-production/p2-anchor'
$env:IPD_PORTFOLIO_DB_PATH = 'runtime/portfolio.sqlite'
node "$stateRoot\runtime\run-scoped-runtime.mjs" $g24; "D2_EXIT=$LASTEXITCODE"
"D2_LISTENER_8099=" + [bool](Get-NetTCPConnection -State Listen -LocalPort 8099 -ErrorAction SilentlyContinue)
$env:IPD_PORTFOLIO_DB_PATH = "$stateRoot\runtime\portfolio.sqlite"
```
Expected: `D1_EXIT=1` with `OidcConfigurationError … OIDC_CONFIGURATION_INVALID` and `D1_DB_CREATED=False`; `D2_EXIT=1` with `PersistenceConfigurationError … PERSISTENCE_CONFIGURATION_INVALID` and `D2_LISTENER_8099=False`. **Any listener, any zero exit, or any database file ⇒ STOP and report.**

### 6.5 Block E — key generation, JWKS publication, scoped runtime start

Key generation into custody (one time; never repeated in place):

```powershell
$kid = 'p2-rsa-' + (Get-Date -Format 'yyyy-MM-dd') + '-01'
$custody = "$stateRoot\anchor\keys"
node "$stateRoot\anchor\new-anchor-key.mjs" $custody $kid *> "$ev\e-keygen.json"
Get-Content "$ev\e-keygen.json"
icacls "$custody\$kid.pem" /inheritance:r /grant:r "${me}:F" | Out-Null
"ACL-KEY $custody\$kid.pem"; icacls "$custody\$kid.pem"
```
Expected: one `P2_ANCHOR_KEY_CREATED` JSON object (kid, `modulusBits: 2048`, `publicJwkSha256`, `publicJwk`), plus an ACL listing naming only the operator account. **The `.pem` file is never opened, printed, copied or hashed.**

Anchor start (dedicated console; leave running for Blocks F1–F4):

```powershell
node "$stateRoot\anchor\anchor-jwks.mjs" $custody $kid *> "$ev\e-anchor.log"
```
Expected: `{"event":"P2_ANCHOR_LISTENING","host":"127.0.0.1","port":8421,"path":"/non-production/p2-anchor/jwks.json","kid":"…","keyCount":1,"documentSha256":"…"}`.

Scoped runtime start (second dedicated console):

```powershell
$env:IPD_OIDC_ISSUER      = 'http://127.0.0.1:8421/non-production/p2-anchor'
$env:IPD_OIDC_JWKS_URI    = 'http://127.0.0.1:8421/non-production/p2-anchor/jwks.json'
$env:IPD_OIDC_AUDIENCE    = 'ipd-user-portfolio-api'
$env:IPD_PORTFOLIO_DB_PATH= "$env:USERPROFILE\.iips-gate-c-p2\runtime\portfolio.sqlite"
$env:IPD_HTTP_HOST='127.0.0.1'; $env:IPD_HTTP_PORT='8099'
node "$env:USERPROFILE\.iips-gate-c-p2\runtime\run-scoped-runtime.mjs" $g24 *> "$ev\e-runtime.log"
```
Expected: `{"event":"P2_SCOPED_RUNTIME_LISTENING", …,"httpPort":8099,"databasePath":"…\\runtime\\portfolio.sqlite", …}` and `Get-ChildItem $env:USERPROFILE\.iips-gate-c-p2\runtime` shows **only** `portfolio.sqlite` (plus a transient `-journal` while writing).

### 6.6 Block F — §7.3 establishment verification (fail-closed, read-only)

```powershell
$iss = 'http://127.0.0.1:8421/non-production/p2-anchor'
function St($e){ try { [int]$e.Exception.Response.StatusCode } catch { try { [int]$e.Exception.Response.StatusCode.value__ } catch { -1 } } }
function Bd($e){
  $m = $null
  if ($e.ErrorDetails -and $e.ErrorDetails.Message) { $m = $e.ErrorDetails.Message }
  elseif ($e.Exception.Response) { try { $sr = New-Object IO.StreamReader($e.Exception.Response.GetResponseStream()); $m = $sr.ReadToEnd() } catch {} }
  if ($m) { try { return ($m | ConvertFrom-Json).error } catch { return $m } }
  return 'NO_BODY'
}
function Sha256([string]$text){ $b=[Text.Encoding]::UTF8.GetBytes($text); ([BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($b))).Replace('-','').ToLower() }

# F1 health (no credential required)
$h = Invoke-WebRequest 'http://127.0.0.1:8099/api/ipd/health' -UseBasicParsing
"F1 $($h.StatusCode) $($h.Content)"        # expect 200 {"status":"UP","mode":"NON_PRODUCTION","persistence":"CONNECTED"}

# F2 JWKS reachable from the host + loopback-only proof
$j = Invoke-WebRequest "$iss/jwks.json" -UseBasicParsing
"F2 $($j.StatusCode) documentSha256=$(Sha256 $j.Content)"
$lan = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1).IPAddress
try { $x = Invoke-WebRequest "http://${lan}:8421/non-production/p2-anchor/jwks.json" -UseBasicParsing -TimeoutSec 3; "F2_LOOPBACK_ONLY=FAIL (served on $lan)" } catch { "F2_LOOPBACK_ONLY=PASS ($($_.Exception.Message))" }

# F3 positive round-trip for the fixed subject (pre-P-4: expect 403 IDENTITY_NOT_MAPPED)
$tok = node "$stateRoot\anchor\mint-token.mjs" $custody $kid
try { $p = Invoke-WebRequest 'http://127.0.0.1:8099/api/ipd/portfolios' -Headers @{ Authorization = "Bearer $tok" } -UseBasicParsing
      "F3_POSITIVE=$($p.StatusCode)" } catch { "F3_POSITIVE status=$(St $_) code=$(Bd $_)" }   # expect 403 IDENTITY_NOT_MAPPED
$tok = $null

# F4 negative controls — each must be 401 with its named code
$cases = @(
  @{n='F4a no credential';   t=$null},
  @{n='F4b malformed';       t='not.a.token'},
  @{n='F4c alg none';        t=(node "$stateRoot\anchor\mint-token.mjs" $custody $kid --alg=none)},
  @{n='F4d unknown kid';     t=(node "$stateRoot\anchor\mint-token.mjs" $custody $kid --kid-out=p2-rsa-unknown-01)},
  @{n='F4e broken signature';t=(node "$stateRoot\anchor\mint-token.mjs" $custody $kid --break-sig)},
  @{n='F4f wrong issuer';    t=(node "$stateRoot\anchor\mint-token.mjs" $custody $kid --iss=http://127.0.0.1:9999/not-the-anchor)},
  @{n='F4g audience iips-spa';t=(node "$stateRoot\anchor\mint-token.mjs" $custody $kid --aud=iips-spa)},
  @{n='F4h expired';         t=(node "$stateRoot\anchor\mint-token.mjs" $custody $kid --ttl=-60)}
)
foreach ($c in $cases) {
  $hdr = @{}; if ($c.t) { $hdr.Authorization = "Bearer $($c.t)" }
  try { $r = Invoke-WebRequest 'http://127.0.0.1:8099/api/ipd/portfolios' -Headers $hdr -UseBasicParsing
        "$($c.n) UNEXPECTED=$($r.StatusCode)" } catch { "$($c.n) status=$(St $_) code=$(Bd $_)" }
}
```
Expected: `F3_POSITIVE=403 IDENTITY_NOT_MAPPED` (the credential verified and the fixed subject resolved, with no mapping yet — the pre-P-4 fail-closed state, **not** a write); `F4a OIDC_TOKEN_MISSING`, `F4b OIDC_TOKEN_MALFORMED`, `F4c OIDC_ALGORITHM_REJECTED`, `F4d OIDC_KEY_UNAVAILABLE`, `F4e OIDC_SIGNATURE_INVALID`, `F4f OIDC_ISSUER_MISMATCH`, `F4g OIDC_AUDIENCE_MISMATCH` (the `iips-spa` exclusion proven in terms), `F4h OIDC_TOKEN_EXPIRED` — **all 401**. Then, with the anchor stopped (Ctrl+C in its console), one further check:

```powershell
$tok2 = node "$stateRoot\anchor\mint-token.mjs" $custody $kid --kid-out=p2-rsa-unknown-02
try { $r = Invoke-WebRequest 'http://127.0.0.1:8099/api/ipd/portfolios' -Headers @{Authorization="Bearer $tok2"} -UseBasicParsing; "F5 UNEXPECTED=$($r.StatusCode)" } catch { "F5 status=$(St $_) code=$(Bd $_)" }   # expect 401 OIDC_JWKS_UNAVAILABLE
$tok2 = $null
```
Expected `F5 … 401 OIDC_JWKS_UNAVAILABLE` — the forced refresh fails against the stopped anchor and **no cached key is substituted** (the no-fallback rule of `R-2.4` and the act's trust statement, proven rather than asserted). Restart the anchor afterwards.

Finally, the §7.3(1) read-only loader matrix against the pinned tree:

```powershell
node "$stateRoot\runtime\check-config-failclosed.mjs" "$ipdPath\dist" *> "$ev\f-loader.json"
Get-Content "$ev\f-loader.json"
```
Expected: eight checks, **all `PASS`**, summary `{"checks":8,"failed":0}`, exit 0.

### 6.7 Block G — evidence capture and shutdown

```powershell
Start-Transcript -Path "$ev\p2-establishment-transcript-$(Get-Date -Format 'yyyy-MM-dd').txt" -Append
# re-run the Chk/status lines and collect: Block A outputs, ACL listings, tooling hashes,
# TSC_EXIT/TSC_ERRORS, D1/D2 outputs, key-generation JSON, anchor + runtime startup JSON,
# F1–F5 status/code lines, loader matrix, and `Get-ChildItem $stateRoot\runtime`
Stop-Transcript
```
Shutdown: Ctrl+C in the runtime console (graceful; the launcher closes the server and persistence), then Ctrl+C in the anchor console. The anchor does not need to be running for the evidence to be valid — but it must remain running for F1–F4.

---

## 7. Evidence to return

The operator returns the raw captured outputs (the transcript plus `e-keygen.json`, `e-anchor.log`, `e-runtime.log`, `c-tsc.log`, `f-loader.json`), which **must** contain:

1. host identity, OS build, operator account, resolved `$HOME`; Node/npm versions and architecture;
2. the IPD and IRR working-tree paths and the **pin commit + tree** verification (Block A);
3. the state-root path with the outside-both-working-trees result, and the `icacls` listings for each custody directory and for the key file;
4. the five tooling SHA-256 values (§6.0) with any deviation stated;
5. `TSC_EXIT`, `TSC_ERRORS`, the four expected error lines, and both artifact-existence checks;
6. `D1`/`D2` exit codes, error codes, listener and database-file results;
7. the key-generation JSON (`kid`, `modulusBits`, `publicJwkSha256`, public JWK) — and **nothing** derived from the private key;
8. the anchor startup JSON and the runtime startup JSON, including the effective bind, issuer, audience, JWKS URI and database path;
9. `F1`–`F5` status codes and error codes exactly as observed, plus the loader-matrix summary;
10. a `Get-ChildItem` listing of `$stateRoot\runtime` showing `portfolio.sqlite` only;
11. a final statement of what was **not** done: no P-4 provisioning, no mapping/tenant/membership/audit row, no P-6 implementation, no P-8 qualification, no fence, route, UI or consumer change, no IPD write, no key/token material in any file returned or recorded.

**Never in the evidence, in this record, or in any return channel:** private key bytes or any hash derived from them, bearer tokens (the minted token is assigned to a variable, never echoed, never written), credentials, or secret material of any kind.

---

## 8. Custody, lifecycle and destruction — preserved exactly

The adopted procedure is **restated, not modified**: one key per generation event, generated by the operator on the designated host into `…\anchor\keys\` under the ACL mapping of §5.3; stable unique `kid` per key (`p2-rsa-<yyyy-mm-dd>-01` form); exactly one active signing key at a time; rotation at most every 90 days from activation plus the adopted on-demand triggers, always publishing the new public key under a new `kid` **before** first use and retaining superseded public keys until the last token they signed expires; compromise ⇒ rotate and revoke the mapping where warranted (a P-4-path action). Destruction remains: withdraw the JWKS entry, then overwrite-in-place and unlink after the last token expires — on this host **without forensic erasure claims**, relying on full-disk encryption or host-level secure erase for the storage layers that copy-on-write and wear levelling defeat, exactly as worksheet §4.7(d) requires the record to state.

---

## 9. Boundaries preserved by this handoff

- P-2 establishment does **not** authorize P-4 provisioning: no `application_user`, no `(issuer, subject)` mapping, no tenant, no membership, no `mapping_audit_events` row — Blocks A–G create none, and the expected `403 IDENTITY_NOT_MAPPED` proves the absence rather than hiding it.
- P-6 implementation authority and P-8 qualification remain separate; the runtime is exercised only through its existing routes, and no IRR application byte is touched.
- `/api/user-portfolios*` remains fail-closed at source-level HTTP `503 owner-context-unavailable`; Option 2F's pre-port refusal of unresolved or ambiguous writes is unchanged; no forwarded-identity trust, caller-controlled identity resolution, audience alias, symmetric fallback, or second issuer is introduced anywhere.
- No IPD ref, branch, tag, file or record is written by this record; the scoped checkout of Block C is a local build artifact area (its `node_modules/` and `dist/` are ignored by the IPD `.gitignore`), and G24 is not promoted.
- Anchor and runtime bind **IPv4 loopback only**; any widening (external bind, tunnel, proxy) would falsify the trust statement and is excluded.
- Every artifact downstream carries the label **non-production, single-user, self-asserted delegation**; no runtime, deployment or production readiness is claimed from any result.

---

## 10. Validation performed and not performed

**Performed (read-only, this session):** live ref and blob verification (§3); resolution of the host requirements from the governing texts (§4); the environment-dependency investigation, including the public npm package inspection and the npm default-rebuild behaviour (§5.1–§5.3, §5.5); reproduction of the pinned tree in an Arena scratch clone — `npm ci --ignore-scripts` (exit 0), `better-sqlite3` prebuild load (SQLite 3.53.4), `npx tsc` (exit 2 with exactly the 4 known baseline errors, `dist/` emitted), module-surface inspection, and the **loader fail-closed matrix executed successfully (8/8)** against the pinned tree's compiled loaders (§5.4); static syntax verification of the four delivered tooling files; the canonical SHA-256 hash manifest (§6.0).

**Not performed (and none authorized):** no key generated, stored, copied, printed or hashed anywhere; no issuer, JWKS endpoint or anchor started; no runtime started; no database created, opened, migrated or written; no credential minted or presented; no P-4 provisioning; no P-6 implementation; no P-8 qualification; no application test re-run in IRR; no IPD write of any kind (the scratch clone is outside the workspace and was never pushed).

**Invariants preserved (verified at this record):** `/api/user-portfolios*` fail-closed at HTTP `503 owner-context-unavailable`; `/api/reports*` unchanged; Option 2F refusal unchanged (2F blobs byte-identical to the tested tree `8bb5bdae…`); F-3 remains partition semantics and is not a principal, credential or membership; no caller-controlled canonical identity; no live IPD write and no protected-ref change; NP-04 and G24 lineages unmerged and un-re-pinned; no route/UI activation; no consumer admission; Gate A OPEN; Gate B Option C; R3 OPEN; R4-B CLOSED; no Company Identity Authority; `D115-A` ineffective; `P2`/`P3` OPEN. **No runtime, deployment or production readiness is claimed anywhere in this record.**

---

## 11. Publication and effectiveness

Additive documentation-only change on session branch `arena/dd87c5d6-iips-review-recovered` (from `main@33bbb0f…`): this record plus a pointer in the canonical tracker (§15.14). **No code, test, pin, lockfile, schema, fence, transport, route, UI, tooling-implementation or runtime path is added to either repository; no IPD write.** Publication follows the established pull-request workflow; consistent with the program rule, publication coordinates are completed after merge by independent remote verification, never self-embedded.

*Status: **`P-2 EXECUTION HANDOFF COMPLETE — HOST AND ENVIRONMENT DEPENDENCIES RESOLVED, SIX-BLOCK OPERATOR PACKAGE READY — NO P-2 OPERATION PERFORMED — P-4/P-6/P-8 UNAFFECTED — /api/user-portfolios* REMAINS FAIL-CLOSED AT HTTP 503 owner-context-unavailable`.***
