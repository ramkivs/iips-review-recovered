# CAP-03 / CAP-02 Shared Host Boundary — PF-15 IPC Endpoint & Local-State Directory Designation: **Prepared Decision-Ready Program Authority Act (`PROPOSED — NOT EFFECTIVE; PF-15 REMAINS NOT DESIGNATED`)** (`2026-10-26`)

> **GOVERNANCE & NON-EFFECTIVENESS NOTICE:** This document is a **decision-ready Program Authority act template (`PROPOSED — NOT EFFECTIVE`)** prepared under standing global authorization after an exhaustive two-locus search across `ramkivs/iips-review-recovered` (IRR `main@e47b58967621377ca92c2123c432a5eb5c5959ad`) and `ramkivs/iips-production-market-data` (IPD `main@f97b17e7d04a0c5c4573c0dbe51da2c4c595d829`) confirmed **zero** effective `PF-15` designations exist. **No endpoint name, named-pipe path, local-state directory path, SQLite store path, or external evidence-root path is invented, selected, inferred, or rendered here.** `PF-15` remains **`NOT DESIGNATED / AWAITING PROGRAM AUTHORITY`**. Standing global authorization covers preparing, validating, reconciling, and publishing this decision-ready record; it **does not** permit an agent to fabricate or impersonate the Program Authority's value-bearing designation.

| Field | Value |
|---|---|
| Prepared Instrument ID | `IIPS-V3-CAP03-PF15-PA-DECISION-ACT-PREPARED-2026-10-26-01` |
| Effective Act ID Upon PA Rendering | *(Reserved — to be stamped on a distinct PA-rendered act, e.g. `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-01`, only after **Ramki** supplies the §5 fields)* |
| Status | **`PREPARED / PROPOSED — NOT EFFECTIVE; AWAITING PROGRAM AUTHORITY VALUE DESIGNATION`** (`PF-15` remains **`NOT DESIGNATED`**) |
| Governing Locus | Primary governance repository `ramkivs/iips-review-recovered` (`refs/heads/main`), cross-referenced in `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (`§16.135`) |
| Preserved Upstream Request & Boundary Records | `docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_DECISION_REQUEST_2026-10-26.md` (`IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-DECISION-REQUEST-2026-10-26-01` + non-decision addendum `IIPS-V3-CAP03-PF15-PA-RESPONSE-NONDECISION-ADDENDUM-2026-10-26-01`, byte-preserved); `docs/integration/IIPS_v3.0_CAP03_PF15_AUTHORITY_AND_S3_QE_READINESS_RECONCILIATION_2026-10-26.md` (`§16.129`); `docs/integration/IIPS_v3.0_CAP03_DQ4_PF15_P1_INDEPENDENT_ADVANCEMENT_2026-10-26.md` (`§16.133`) |
| Verified Repository Baselines (`2026-10-26` UTC) | **IRR `main`:** `e47b58967621377ca92c2123c432a5eb5c5959ad` (root tree `4036a263832124dd9aa13473fbebb80a7d576d86`, PR `#299`, post-merge `main` CI `40316031598` `success`, `0` open PRs) · **IPD `main`:** `f97b17e7d04a0c5c4573c0dbe51da2c4c595d829` (root tree `6da6f82970fd3fb836500776708bbb6ea206baa1`, PR `#97`, post-merge `main` CI `40315422170` `success`, `0` open PRs) |
| Designated Decision-Maker | **Ramki** — sole user, operator on designated Windows 11 host `desktop-no0nhtp`, and **Program Authority (PA)** |

---

## 1. Purpose and Authority Boundary

1. **Why a Program Authority act is genuinely required:** Row `PF-15` of the IPD Host Readiness Packet (`evidence/cross-repository/IIPS_V3_CAP03_HOST_READINESS_PACKET_2026-10-24.md`) and `§16.123.6` / `§16.128` / `§16.129` / `§16.133` establish that before `S3` preflight and `QE-1`…`QE-11` may execute on `desktop-no0nhtp`, the Program Authority must designate the exact same-host IPC endpoint setting (`IIPS_G2_IPC_ENDPOINT`) and, where applicable, the exact local-state directory (`IIPS_G3_LOCAL_STATE_DIR`), together with store-path linkage, raw-evidence treatment, and host verification rules. In IRR PR `#295` (`§16.129.4`), the Program Authority expressly withheld rendering those values (`No decision — leave PF-15 unresolved for now and record what remains needed`).
2. **What this prepared instrument accomplishes:** It consolidates the approved alternatives (**Option A** and **Option B**) and **all seven (7) mandatory PF-15 contents** into one complete, code-verified, turnkey PA act structure, verified directly against both repositories' live endpoint resolvers (`frontend/server/user-portfolio/ipcClient.ts` and IPD `src/ipc/endpoint.ts`), and isolates the exact six PA answer slots (`PA-PF15-F1`…`PA-PF15-F6`) in §5 so that **Ramki** can render an effective PF-15 act in a single step without further framing or re-investigation.
3. **Strict non-impersonation & non-invention rule:** Every concrete endpoint/path slot in §4 and §5 is intentionally marked `<PA-RESERVED: NOT DESIGNATED>`. No default pipe name, directory path, database path, or evidence path is supplied or implied.

---

## 2. Exhaustive Current-Tip Two-Locus PF-15 Authority Search (`2026-10-26`)

An independent full-history and live-API audit was re-executed at the current tips of both authoritative repositories (`evidence/integration/cap03-ipd-pr97-pf15-decision-ready-2026-10-26/01-pf15-two-locus-authority-audit.json`):

| Search Surface | Scope Audited | Finding |
|---|---|---|
| **IRR `main` & all remote refs** | `ramkivs/iips-review-recovered` `main@e47b58967621377ca92c2123c432a5eb5c5959ad` (`1,100+` full-history commits), all remote branches, tags, PRs `#1`–`#299`, PR comments, and issues | **0 effective PF-15 acts.** Every `PF-15` reference records `NOT DESIGNATED` / `PROPOSED — NOT EFFECTIVE` (`§16.123.6`, `§16.125.3`, `§16.126.4`, `§16.127.2`, `§16.128`, `§16.129`, `§16.129.4`, `§16.130`, `§16.131`, `§16.132`, `§16.133`). |
| **IPD `main` & all remote refs** | `ramkivs/iips-production-market-data` `main@f97b17e7d04a0c5c4573c0dbe51da2c4c595d829` (post-PR `#97`), approved pin `8eec74ae27cda09f3c368b9c299895eae41554db`, corrected S2 candidate `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, alias `70b24f029842a7e9b7f615e4d9df7376fd4ff817`, all remote branches, tags, PRs `#1`–`#97`, PR comments (incl. PR `#97` receipt comment `6414952274`), and issues | **0 effective PF-15 acts.** Host readiness packet row `PF-15` states *"NOT DESIGNATED today; execution stops here until named"*; IPD PR `#97` (`evidence/cross-repository/cap03_independent_2026-10-26/04-governance-sources.json` and `README.md`) independently confirms `PF-15` remains **`NOT DESIGNATED`**. |

**Result:** No effective PF-15 decision exists in either locus; proceeding as if `PF-15` were designated is prohibited.

---

## 3. Bilateral Code-Verified Resolver & Transport Semantics (`win32`)

Both IRR (`frontend/server/user-portfolio/ipcClient.ts` → `resolveIpcEndpoint`, blob `c1b885e3173132685090bcd2cbfa4aa8c87fa4ca`, unchanged H-12 R5 entry) and IPD (`src/ipc/endpoint.ts` → `resolveEndpointTarget`, `isWindowsPipeNamespaceOnly`, `settlementPolicyForEndpoint`, `listenIpc`, unchanged H-12 R5 entry) enforce identical, fail-closed endpoint resolution rules on `process.platform === 'win32'`:

1. **Approved Alternative `Option A` — Explicit Windows Named-Pipe Path (`source: 'absolute-path'`):**
   - `IIPS_G2_IPC_ENDPOINT` is set to a trimmed string `<pipePath>` satisfying:
     - `win32Path.isAbsolute(<pipePath>) === true`;
     - `<pipePath>.startsWith('\\\\.\\pipe\\') === true`;
     - `isWindowsPipeNamespaceOnly`: `/^\\\\\.\\pipe\\[^\\/]+$/` (a single flat pipe name after `\\.\pipe\`, containing no embedded `/` or `\`, no URL scheme `://`, and no `host:port`);
   - `IIPS_G3_LOCAL_STATE_DIR` is **not read by either `resolveIpcEndpoint` or `resolveEndpointTarget`** and may be explicitly designated **`N/A — NOT USED FOR ENDPOINT RESOLUTION`** provided no step requires a local-state directory.
   - Resolved wire target in both processes: `{ kind: 'windows-named-pipe', path: '\\\\.\\pipe\\<name>', source: 'absolute-path' }`.

2. **Approved Alternative `Option B` — Bare Endpoint Name + Absolute Local-State Directory (`source: 'name-in-state-directory'`):**
   - `IIPS_G2_IPC_ENDPOINT` is set to a trimmed bare name `<bareName>` satisfying:
     - `/^[A-Za-z0-9._-]+$/.test(<bareName>) === true` (ASCII letters, digits, `.`, `_`, `-` only);
     - `!<bareName>.includes('..')`;
     - not a URL (`://`), not `host:port`, and `win32Path.isAbsolute(<bareName>) === false`.
   - `IIPS_G3_LOCAL_STATE_DIR` **must** be set to a non-empty string `<stateDir>` satisfying `win32Path.isAbsolute(<stateDir>.trim()) === true` on local fixed NTFS on `desktop-no0nhtp`, outside every Git worktree, non-cloud-synced, non-network/SMB, and writable by the non-elevated operator account `Ramki`.
   - On `win32`, both `resolveIpcEndpoint` and `resolveEndpointTarget` validate `IIPS_G3_LOCAL_STATE_DIR` absoluteness and resolve the wire target in the kernel named-pipe namespace to `{ kind: 'windows-named-pipe', path: '\\\\.\\pipe\\<bareName>', source: 'name-in-state-directory' }`, creating **zero** socket files or filesystem endpoint artifacts on disk (`isWindowsPipeNamespaceOnly(target) === true`).

3. **Shared `win32` Transport & Security Invariants Across Both Options:**
   - Transport framing: `IPC_PROTOCOL_VERSION = 1`, 4-byte uint32 BE length prefix, `64 KiB` request cap, `256 KiB` response cap, `5,000 ms` client timeout (`OC-5` per-call config read, zero retries, zero authority keys on wire).
   - Settlement policy: `settlementPolicyForEndpoint(target) === 'flush-guard'` on `win32`.
   - Bind & capacity controls (`listenIpc`): `server.listen(target.path)` (string path only — never a port/TCP/HTTP/URL listener), `server.maxConnections = 1`, `allowHalfOpen: true`, `readableAll`/`writableAll` **never** passed (platform default pipe DACL via libuv `NULL` security attributes), `FILE_FLAG_FIRST_PIPE_INSTANCE` duplicate-bind refusal (`EADDRINUSE` → `EndpointCollisionError`), zero bytes emitted prior to an authorized request, and IRR precondition `IIPS_G3_IPC_BINDING_PROVISIONED` remaining `false` by default in repository code.

---

## 4. Complete Decision-Ready PA Act Specification (All Seven Required Contents)

> **OPERATIVE TEMPLATE CLAUSE (INACTIVE UNTIL PA RENDERING):** Only when **Ramki (Program Authority)** completes the §5 fields in a distinct PA-rendered act in `ramkivs/iips-review-recovered`, and that act passes exact-head CI, merges to `main`, passes post-merge `main` CI, and is independently read back via GitHub API, will the following seven required contents take effect. Until then, every `<PA-RESERVED: NOT DESIGNATED>` placeholder below carries **zero** operational effect.

### 4.1 Required Content (1) — Selected Endpoint Form (`Option A` or `Option B`) and Verbatim `IIPS_G2_IPC_ENDPOINT`

- **Selected Approved Alternative (`PA-PF15-F1`):** `<PA-RESERVED: NOT DESIGNATED — select exactly ONE of "Option A (explicit Windows named-pipe path \\.\pipe\<name>)" OR "Option B (bare endpoint name [A-Za-z0-9._-]+ with absolute IIPS_G3_LOCAL_STATE_DIR)">`
- **Verbatim `IIPS_G2_IPC_ENDPOINT` Value (`PA-PF15-F2`):** `<PA-RESERVED: NOT DESIGNATED>`
- **Mandatory Conformance Constraints:**
  - If **Option A** is selected: `IIPS_G2_IPC_ENDPOINT` must match `/^\\\\\.\\pipe\\[A-Za-z0-9._-]+$/` (or `/^\\\\\.\\pipe\\[^\\/]+$/` with no whitespace, `..`, `://`, or `:port`), dedicated to IIPS Gate 4 qualification on `desktop-no0nhtp` and unoccupied prior to server start.
  - If **Option B** is selected: `IIPS_G2_IPC_ENDPOINT` must match `/^[A-Za-z0-9._-]+$/` with no `'..'`, resolving on `win32` to `\\.\pipe\<IIPS_G2_IPC_ENDPOINT>` (`source: 'name-in-state-directory'`).
  - Both IRR (`frontend/server/user-portfolio/ipcClient.ts`) and IPD (`src/ipc/endpoint.ts`) must receive the **exact byte-identical** `IIPS_G2_IPC_ENDPOINT` string per invocation during `S3` and `QE-1`…`QE-11`.

### 4.2 Required Content (2) — Verbatim `IIPS_G3_LOCAL_STATE_DIR` (or Explicit `N/A` Under Valid `Option A` Only)

- **Verbatim `IIPS_G3_LOCAL_STATE_DIR` Value (`PA-PF15-F3`):** `<PA-RESERVED: NOT DESIGNATED — exact absolute Windows path on local fixed NTFS when Option B is selected or any step requires a local-state directory; OR literal "N/A — Option A selected and no step uses IIPS_G3_LOCAL_STATE_DIR">`
- **Mandatory Conformance Constraints:**
  - Mandatory whenever **Option B** is selected (`resolveIpcEndpoint` and `resolveEndpointTarget` refuse a bare name when `IIPS_G3_LOCAL_STATE_DIR` is unset, empty, or non-absolute under `win32Path.isAbsolute`).
  - When a path is designated, it must reside on a local fixed NTFS volume of `desktop-no0nhtp` (e.g., drive-letter path, never UNC/SMB, removable media, OneDrive/Dropbox/cloud-synced tree, or inside any IRR/IPD Git worktree), exist or be created prior to `S3` by the non-elevated operator `Ramki`, resolve cleanly via `fs.realpathSync.native`, and remain free of Unix-socket or stray endpoint files (`isWindowsPipeNamespaceOnly === true`).
  - May be recorded as `N/A` **only** when **Option A** is selected and no `S3`/`QE` step invokes a bare endpoint name or state-directory helper.

### 4.3 Required Content (3) — Explicit `IIPS_G3_DATABASE_PATH` / Single `P-1` Store Path Linkage (`PF-11`–`PF-13`)

- **Store Path Linkage Rule & Verbatim `IIPS_G3_DATABASE_PATH` (`PA-PF15-F4`):** `<PA-RESERVED: NOT DESIGNATED — exact absolute Windows NTFS SQLite path $StorePath used for the single P-1 execution, OR explicit directive binding IIPS_G3_DATABASE_PATH verbatim to the single P-1 execution record's $StorePath prior to S3>`
- **Mandatory Conformance Constraints:**
  - Prior to the single `P-1` execution (`provisionGateAPrimeStore` / `validateGateAPrimeStore`, `V-A2-1`…`V-A2-8`), `$StorePath` (`PF-11`–`PF-13`) **must not exist** on disk (neither the main DB file nor `-wal`/`-shm` sidecars) so `P-1` provisions a clean `schema_version = 4` store containing the single `ACTIVE` binding `c5808dc261306ffbc5fcfa008fa07228c6161df8a00db721a60ad1a4be4f26b3` (`S1` act `IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01`).
  - Across `S3` and every authoritative-store item of `QE-1`…`QE-11`, `IIPS_G3_DATABASE_PATH` **must equal `$StorePath` byte-for-byte**. Substituting a second authoritative store or running `P-1` a second time is strictly prohibited.
  - For CAP-02 `QE-8` only, effective PA act `IIPS-V3-CAP02-QE8-RV1-REVOCATION-PROCEDURE-PA-ACT-2026-10-26-01` (`§16.131`, **Option A — disposable-copy revocation**) governs: `QE-8` operates exclusively on a byte-verified disposable copy outside the authoritative `$StorePath` (`storePathRole = 'disposable-copy'`, Tier 2 component-only ceiling, authoritative `$StorePath` SHA-256 proven unchanged before and after).

### 4.4 Required Content (4) — Explicit QE Evidence-Deposit & Non-Credential Treatment

- **Evidence-Deposit Rule (Fixed Operative Text):**
  1. The designated `IIPS_G2_IPC_ENDPOINT`, `IIPS_G3_LOCAL_STATE_DIR` (or `N/A`), `IIPS_G3_DATABASE_PATH`, and `$EvidenceRoot` values are **local host locations, not credentials or secrets** (`OC-3`).
  2. They **shall appear verbatim** (unredacted and unaliased) in external raw `S3` and `QE-1`…`QE-11` command transcripts, `Q11-BEFORE.json`, `Q11-AFTER.json`, and `MANIFEST.json`, and their SHA-256 digests and verbatim path literals may be cited in IRR/IPD governance receipts so path identity across `P-1 → S3 → QE-1…QE-11` is cryptographically auditable.
  3. **Hard Prohibition:** Designated endpoint names, directory names, database filenames, environment blocks, and test fixtures **must contain zero credentials, tokens, API keys, passwords, account numbers, or real personal/financial portfolio holdings**; only governed synthetic/deterministic qualification fixtures are permitted.

### 4.5 Required Content (5) — External Raw-Evidence Root (`$EvidenceRoot`, `PF-14`) & `MANIFEST.json` Recording Rule

- **Verbatim External `$EvidenceRoot` (`PA-PF15-F5`):** `<PA-RESERVED: NOT DESIGNATED — exact absolute Windows local fixed NTFS directory outside every IRR/IPD Git worktree, distinct from $StorePath parent and $StateDir, non-cloud-synced>`
- **`MANIFEST.json` Verbatim Recording Rule (Fixed Operative Text):**
  - `$EvidenceRoot` must reside on local fixed NTFS on `desktop-no0nhtp`, outside all Git worktrees (`git rev-parse --is-inside-work-tree` must fail/return false in `$EvidenceRoot`), outside OneDrive/cloud-synced directories, and distinct from `$StorePath` and `IIPS_G3_LOCAL_STATE_DIR`.
  - `$EvidenceRoot\MANIFEST.json` must record verbatim:
    - `selectedOption`: `"Option A"` or `"Option B"`;
    - `IIPS_G2_IPC_ENDPOINT`: exact designated string;
    - `IIPS_G3_LOCAL_STATE_DIR`: exact designated absolute path or `"N/A"`;
    - `resolvedWirePipePath`: exact `\\.\pipe\<name>` returned by `resolveEndpointTarget` / `resolveIpcEndpoint`;
    - `IIPS_G3_DATABASE_PATH`: exact `$StorePath` provisioned by the single `P-1` run, with pre-`S3` and post-`QE` SHA-256 digests (`Q11-BEFORE.json` / `Q11-AFTER.json`);
    - `evidenceRoot`: exact `$EvidenceRoot` path and per-transcript byte counts + SHA-256 digests (`evidence_deposit_set`).

### 4.6 Required Content (6) — Native-Windows Host Verification Instructions on `desktop-no0nhtp`

During `S3` preflight and `QE-1`…`QE-11` on `desktop-no0nhtp` (`process.platform === 'win32'`, non-elevated operator `Ramki`, Node `>=22.13.0 <23` with flag-free `node:sqlite`), the operator shall verify and capture raw transcript proof for all six `windowsPipeDescriptor` / Gate 4 host controls (`V-1`…`V-4`, `Q9`):

1. **Duplicate-Bind / `FILE_FLAG_FIRST_PIPE_INSTANCE` Collision Refusal:** While the primary IPD IPC server holds `resolvedWirePipePath`, a second bind attempt to the same `IIPS_G2_IPC_ENDPOINT` fails closed with `EndpointCollisionError` (`EADDRINUSE`) and mutates neither the live pipe nor `$StorePath`.
2. **Default Windows Named-Pipe DACL & Non-Elevated Same-User Access:** Inspect the live pipe (`[System.IO.Directory]::GetFiles('\\.\pipe\')` + PowerShell `Get-Acl` / `PipeSecurity` SDDL dump where supported by Windows/.NET) confirming `readableAll`/`writableAll` were not applied, the pipe is owned by the non-elevated operator principal on `desktop-no0nhtp` under the platform default named-pipe DACL, and no anonymous/Everyone write widening was introduced.
3. **Single-Concurrent-Connection Cap (`server.maxConnections = 1`):** Open one idle client connection and verify a simultaneous second connection is refused/closed under the single-connection cap without crashing the listener or corrupting subsequent sequential calls.
4. **Same-Host Local-Only / Network-Target Refusal (`T-1`, `OC-3`):** Confirm `server.address()` is the exact `\\.\pipe\<name>` string (zero TCP/UDP ports opened by the IPC listener in `Get-NetTCPConnection -OwningProcess $ServerPid`) and verify both `resolveEndpointTarget` and `resolveIpcEndpoint` throw configuration errors on `http://...`, `tcp://...`, and `127.0.0.1:<port>` inputs.
5. **Clean-Shutdown Pipe Disappearance & Zero Disk Socket Artifacts:** After `handle.stop()`, confirm the pipe entry disappears from `[System.IO.Directory]::GetFiles('\\.\pipe\')` and zero `.sock` or endpoint files were created in `IIPS_G3_LOCAL_STATE_DIR` (if designated) or any worktree.
6. **Per-Call Client Configuration Read & Connection Release (`OC-5`):** Confirm IRR `callIpc` reads `IIPS_G2_IPC_ENDPOINT` (+ `IIPS_G3_LOCAL_STATE_DIR` under Option B) per call, completes sequential read/refusal probes without socket exhaustion under `maxConnections = 1`, and fails closed immediately when `IIPS_G2_IPC_ENDPOINT` is unset.

### 4.7 Required Content (7) — Scope, Rationale, Mandatory Execution Order, Preserved Fences/Pins/Authority, and Effectiveness / Drift `STOP` Rule

1. **Scope Designation (`PA-PF15-F6`):** `<PA-RESERVED: NOT DESIGNATED — confirm whether designation governs CAP-03 S3/QE only OR shared CAP-03 & CAP-02 host S3/QE execution on desktop-no0nhtp per §16.127.2>`
2. **Rationale:** Satisfies `PF-15` (`Host Readiness Packet` §3) without hardcoding machine-local paths in source control, preserving `OC-3`/`OC-5` per-call configuration and keeping repository code environment-independent.
3. **Mandatory Dependency-Ordered Sequence:**
   - `S2` native-Windows validation (completed as component validation on corrected candidate `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, IPD PR `#96` → `1e76f4cf…`; coordinate alignment note below) →
   - **one bounded `P-1` provisioning execution** (`V-A2-1`…`V-A2-8`, single-attempt grant, currently **unspent**) →
   - **distinct PA-rendered `PF-15` act effective on IRR `main`** →
   - **`S3` preflight** on `desktop-no0nhtp` →
   - **`QE-1`…`QE-11`** (`QE-8` strictly on a disposable copy under effective `RV-1` Option A, `§16.131`) →
   - **separate post-execution U4 / CAP-02 / CAP-03 result-acceptance PA acts** →
   - **separate Gate 5 main-admission PA act (`CV-52`)**.
   - *(Note: `P-1` and rendering of `PF-15` are mutually independent prerequisites that both gate `S3`.)*
4. **Preserved Fences, Pins, Manifests, and Non-Grants:**
   - All twelve `/api/user-portfolios*` HTTP `503` route-method fences (`cb8db45d…`, `51704c12…`, `e6b57bb8…`), `IIPS_G3_IPC_BINDING_PROVISIONED = false` default, `WRITE_NOT_AUTHORIZED`, and DR-4r / DQ-3 Option B (`SESSION_ONLY` / `durable: false`) remain **100% intact and unlifted**.
   - Adopted `H-12 R5` manifest (`docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json`, blob `f4649e36a81c7013287810cd3202b99586dbd951`, SHA-256 `d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76`) and IRR pins (`iips-production-market-data#8eec74ae27cda09f3c368b9c299895eae41554db`, `iips-broker-import#70b24f029842a7e9b7f615e4d9df7376fd4ff817`, `iips-np04-governed-persistence#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`) remain **unchanged** unless modified by an explicit PA coordinate/re-pin act.
5. **Locus, Effectiveness, Re-Designation, and Drift `STOP` Rule:**
   - **Effectiveness:** A PF-15 designation becomes effective **only** when rendered by **Ramki (PA)** as a distinct act in `ramkivs/iips-review-recovered`, validated by green exact-head CI, merged to `main` via regular 2-parent merge, validated by green post-merge `main` push CI, and verified by independent remote GitHub API blob/byte/completeness read-back.
   - **No Silent Value Substitution:** Any change to `Option A`/`Option B`, `IIPS_G2_IPC_ENDPOINT`, `IIPS_G3_LOCAL_STATE_DIR`, `IIPS_G3_DATABASE_PATH`, or `$EvidenceRoot` requires a **new** PA act before `S3`/`QE` continues.
   - **Qualified-Surface Drift `STOP` Rule & `8eec74ae…` vs `001c3c80…` Coordinate Note:** Any drift in any `H-12 R5` entry (`32` IPD + `24` IRR) or `G4-AMEND-01` supplemental qualified-surface entry (`7` post-G3 CAP-02 entries + `11` companion guards) causes an immediate **`STOP`**. At IPD `main@f97b17e7…`, all `32/32` IPD H-12 entries, `7/7` post-G3 entries, `11/11` companion guards, and `14/14` alias raw sources are byte-identical to `8eec74ae…`, while IPD PR `#96` (`001c3c80…`) modified two non-H-12 S2 harness/test paths (`scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts`). Before DQ-4 freeze establishment is declared (`criteria 7 & 8`), the PA/operator must ensure checkout coordinate consistency (`8eec74ae…` vs explicit PA coordinate alignment to `001c3c80…`) rather than silently mixing checkouts.

---

## 5. Precise Inventory of Unresolved PA Fields (Turnkey PA Answer Block)

To render `PF-15` effective, **Ramki (Program Authority)** need only supply the six fields below (no other PF-15 framing question remains open):

| Field ID | Reserved Determination Required From PA (**Ramki**) | Allowed Domain / Validation Rule | Current State |
|---|---|---|---|
| **`PA-PF15-F1`** | Endpoint form selection | Exactly **`Option A`** (`\\.\pipe\<name>`) **or** **`Option B`** (bare `[A-Za-z0-9._-]+` + `IIPS_G3_LOCAL_STATE_DIR`) | **`NOT DESIGNATED`** |
| **`PA-PF15-F2`** | Exact verbatim `IIPS_G2_IPC_ENDPOINT` literal | Under Option A: `\\.\pipe\<name>` (`/^\\\\\.\\pipe\\[^\\/]+$/`, no URL/`host:port`). Under Option B: `/^[A-Za-z0-9._-]+$/`, no `'..'`. Zero secrets/PII. | **`NOT DESIGNATED`** |
| **`PA-PF15-F3`** | Exact absolute `IIPS_G3_LOCAL_STATE_DIR` (or `N/A`) | Under Option B (or if any step uses state dir): absolute local fixed NTFS path on `desktop-no0nhtp`, outside all Git worktrees, non-synced, non-elevated writable. Under Option A with no state-dir use: literal `N/A`. | **`NOT DESIGNATED`** |
| **`PA-PF15-F4`** | Exact absolute `IIPS_G3_DATABASE_PATH` (`$StorePath`) linkage | Absolute local fixed NTFS SQLite file path on `desktop-no0nhtp` outside all Git worktrees, non-existent before the single `P-1` run and reused byte-for-byte across `P-1`, `S3`, and `QE-1`…`QE-11` (`QE-8` uses a separate disposable copy per `RV-1` Option A). | **`NOT DESIGNATED`** |
| **`PA-PF15-F5`** | Exact absolute external `$EvidenceRoot` (`PF-14`) | Absolute local fixed NTFS directory on `desktop-no0nhtp` outside all Git worktrees, non-synced, distinct from `$StorePath` parent and `IIPS_G3_LOCAL_STATE_DIR`, holding `MANIFEST.json`, `Q11-BEFORE.json`, `Q11-AFTER.json`, and raw `S3`/`QE` transcripts. | **`NOT DESIGNATED`** |
| **`PA-PF15-F6`** | Workstream scope confirmation | Confirm whether the designated values govern **both** shared CAP-03 and CAP-02 Gate 4 `S3`/`QE-1`…`QE-11` host execution on `desktop-no0nhtp` (recommended per `§16.127.2`) or **CAP-03 only**. | **`NOT DESIGNATED`** |

---

## 6. Operational Effect While Unresolved (`2026-10-26`)

- **`PF-15` Status:** **`NOT DESIGNATED`** (`PROPOSED — NOT EFFECTIVE`).
- **Blocked strictly by `PF-15` (and `P-1`):** `S3` preflight, `QE-1`…`QE-11` (`0/11` executed), DQ-4 criteria `7` & `8` (`DQ-4` remains `8/10 — NOT ESTABLISHED`), Gate 4 result acceptance (`U4` / CAP-03), and Gate 5 admission (`CV-52`).
- **Independent of `PF-15` (not blocked by `PF-15`):** All repository-side documentation/reconciliation/CI validations (completed in this pass), and the single bounded operator-executed `P-1` provisioning step (`V-A2-1`…`V-A2-8`) on `desktop-no0nhtp` (which remains **unspent / NOT EXECUTED** because this Linux cloud sandbox is not `desktop-no0nhtp`).

*End of `IIPS-V3-CAP03-PF15-PA-DECISION-ACT-PREPARED-2026-10-26-01` — PREPARED / PROPOSED — NOT EFFECTIVE; PF-15 REMAINS NOT DESIGNATED.*
