# IIPS v3.0 — G3-D2 Storage Technology Program Authority Decision Record

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-G3-D2-STORAGE-TECHNOLOGY-PA-DECISION-2026-10-19-01` |
| **Decision ID** | `G3-D2` |
| **Subject** | Storage technology — CV-20(c) |
| **Decision-maker** | Program Authority (PA) |
| **Decision date** | `2026-10-19` (UTC date as supplied; no time-of-day was supplied) |
| **Disposition** | **SELECTED AND APPROVED** |
| **Selected option** | **B — `node:sqlite`** |
| **Decision source** | The PA's explicit instruction to the operating session dated 19 October 2026, recorded in this repository without enlarging its scope |
| **Record location** | IRR `ramkivs/iips-review-recovered`, `docs/integration/` |
| **Verified preparation baselines** | IPD `main@be32d8c95a86b3f03bd382ccde5b6398efb351c6`; IRR `main@a967a2a06b710077e26e4320f5c27c490283d43e` |
| **Authority boundary** | Storage-technology selection only. Gate 3 implementation authority remains **NOT GRANTED**. Gate 4 qualification and Gate 5 admission remain separate and **NOT GRANTED**. Production use remains **NOT AUTHORIZED**. |

> **Rendered PA decision.** **G3-D2 — Storage technology (CV-20(c)): OPTION B — `node:sqlite` — SELECTED AND APPROVED.**
>
> This is the Program Authority's decision. Arena records it; Arena did not select, recommend, or approve the technology. The decision is not a proposal, provisional selection, or request for reconfirmation.

## 1. Decision source and exact scope

The Program Authority explicitly instructed on 2026-10-19 that G3-D2's selected and approved storage technology is **Option B — `node:sqlite`**. This record preserves that decision at its stated scope: **storage technology only**.

The decision does not decide or authorize:

- G3-D3 write-slice scope;
- G3-D4 provisioning-code scope or execution of any provisioning act;
- G3-D5's formal one-line confirmation for the historical 2026-10-07 durable line (the current request's CV-20(a)/P7 answer);
- G3-D6's interpretation of G-2 §3 in the single-user non-production mechanism;
- G3-D7 IRR-capacity scope or remediation;
- an exact IPD implementation commit, file set, dependency manifest, schema, migration design, runtime pin, or implementation plan;
- any durable write, implementation, qualification, result acceptance, route admission, HTTP 503 lift, release, production eligibility, or production use.

In particular, the prior CV-20 **Option A — ownership-source designation** is a separate decision axis and remains unchanged. G3-D2 **Option B** selects `node:sqlite` as a storage technology; it does not replace, modify, or reopen the ownership-source designation.

## 2. Governing request and G-2 references

The source decision request is the current IPD `main` artifact:

- `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`
- Request ID: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-REQUEST-2026-10-18-01`
- Verified IPD `main` commit: `be32d8c95a86b3f03bd382ccde5b6398efb351c6`
- Verified request blob: `ac4b402573b165faa771e451bbce6faeeaa4d2e0`
- G3-D2 appears in §§4, 9, 13.3, 13.4, and 15. The exact alternatives remain those in the request: A (`better-sqlite3`), B (`node:sqlite`), C (identify another technology), or DEFER.

The accepted architecture is IRR `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` §3 (blob `7e83946b470bcc6f4751fb1a67e832ac66128c5c` at the verified IRR preparation base). G-2 §3 establishes these requirements for the future durable user-portfolio capability:

1. explicit owner/principal identity;
2. explicit tenant/company context;
3. stable durable portfolio identity;
4. restart-durable persistence;
5. versioned serialization and deserialization;
6. schema/version migration capability;
7. explicit lifecycle and retention semantics;
8. reset and deletion semantics;
9. concurrency and version semantics;
10. server-side authorization;
11. tenant and owner isolation;
12. governed auditability; and
13. durable preservation of required contribution, lineage, and idempotency semantics.

G-2 §3 intentionally does **not** prescribe a storage technology and requires the durable boundary to avoid unnecessary coupling to one. G3-D2 now supplies the PA's technology choice; it does not amend, waive, or narrow any of the thirteen G-2 requirements.

The accepted, technology-neutral Gate E write policy is IPD `evidence/cross-repository/IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md` (blob `4a9501bffb49abbbc0ba5b5c4f81d2841812913e` at IPD `main`). Its W-1/W-11/W-12/W-13/W-16 obligations continue to apply. The accepted consumer contract is IPD `evidence/cross-repository/IIPS_V3_G2_IPD_IRR_PORTFOLIO_CONSUMER_CONTRACT_V1_2026-10-18.md` (blob `163eb1f18ce023bb9a06917de99ca279fdb86bf7`). The accepted security contract that constrains the future same-host IPC path is IPD `evidence/np04/IIPS_v3.0_G2_IPD_LOCAL_PRINCIPAL_OS_IPC_SECURITY_CONTRACT_PROPOSAL_2026-10-16.md`, **L-IPC-1 revision 2**, accepted with changes for one user / one personal laptop / non-production. The accepted contract text is blob `cab04b6f94618c9afad1440882ebf63437fdf6f8`; the current file including dated notes is blob `fc8d1cbc9ec96f4f93fce8afbbb659b044f6268f`; acceptance decision `evidence/np04/IIPS_v3.0_G2_IPD_SECURITY_CONTRACT_ACCEPTANCE_DECISION_2026-10-16.md` is blob `f708630436358097c11c167d3d8ab1a6c8a54095`. Acceptance is not host demonstration, operability, implementation authority, provisioning authority, qualification, route admission, or production authority. L-IPC-1’s Windows platform waivers are waivers, not technical proof; its remaining Gate 4 requirements continue to apply.

## 3. Verified preparation baseline and source currency

The record was prepared after fetching the live authoritative heads:

| Repository | Verified `main` base for this record | Verification |
|---|---|---|
| IPD `ramkivs/iips-production-market-data` | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` | `git ls-remote` and a clean depth-1 clone of `main` returned the same commit |
| IRR `ramkivs/iips-review-recovered` | `a967a2a06b710077e26e4320f5c27c490283d43e` | `git fetch origin main`, `git ls-remote`, and local `origin/main` agreed |

The current IPD request blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0` is **identical** to the blob cited by the published PKG-02D packet. Its G3-D2 alternatives and response wording have not materially changed since PKG-02D. The new PA answer supersedes PKG-02D's historical `DECISION REQUIRED` status for G3-D2 only; PKG-02D remains preserved as the decision-preparation record it was when prepared. No IPD file or ref was changed while preparing this IRR record.

The G3-D0 PA disposition remains the authority for the implementation-basis principle: IPD `main` is the future authoring basis; the off-`main` Gate B lineage is reference-only for the intended G3 path; a separate Gate 3 act must still name the exact then-current IPD `main` SHA, bounded file set, tests, dependencies, restrictions, prerequisites, and acceptance evidence. G3-D2 does not alter G3-D0 or grant the Gate 3 act.

## 4. Decision consequences and implementation prerequisites

### 4.1 What Option B selects

The selected technology is Node's built-in `node:sqlite` module, using SQLite through Node's own runtime API. The selection is not for the off-`main` G24 `better-sqlite3` implementation and does not authorize promotion, copying, cherry-picking, or admission of that lineage.

The official Node.js docs [`doc/api/sqlite.md` at tag `v22.22.3`](https://github.com/nodejs/node/blob/v22.22.3/doc/api/sqlite.md) identify `node:sqlite` as added in `v22.5.0`, say the `--experimental-sqlite` flag is no longer required starting in `v22.13.0`, and still label the module **Stability 1.1 — Active development**. The introduction is also recorded in the [v22.5.0 docs](https://github.com/nodejs/node/blob/v22.5.0/doc/api/sqlite.md). The same Node release, as run in the Arena Linux sandbox for a bounded API smoke test, exposed `DatabaseSync`, `exec`, and `prepare`; a direct module load emitted:

```text
ExperimentalWarning: SQLite is an experimental feature and might change at any time
```

A disposable local SQLite file was used only for a sandbox smoke test: `BEGIN IMMEDIATE` + insert + `ROLLBACK` left zero rows; a second `BEGIN IMMEDIATE` + insert + `COMMIT` was readable after closing and reopening the database connection. Observed sandbox versions were Node `v22.22.3` and SQLite `3.51.3`. This establishes only that basic API calls worked in that Linux sandbox. It is **not** a Windows test, application test, crash test, independent-process restart test, durability qualification, or deployment-host result.

### 4.2 Runtime and dependency facts; unresolved host evidence

Verified from the current IPD repository:

- `.github/workflows/ci.yml` uses `actions/setup-node` with `node-version: '22'` on `ubuntu-latest`. This selects the Node 22 major line; it is not an exact patch-version pin.
- Current `package.json` has no `engines` field, and the repository has no `.nvmrc` or `.node-version` file. No exact project-supported Node patch version is established by those files.
- Current `package.json` has no `better-sqlite3` or other SQLite runtime dependency; its runtime `dependencies` contain `react-router-dom` only. `node:sqlite` is supplied by Node itself and does not require an npm native-driver dependency.
- The current lockfile resolves `@types/node` to `22.20.4`; that package contains `node:sqlite` declarations including `DatabaseSync`. No package or lockfile change was made in this recording task.

**Technical boundaries, not a project support policy:** Node's docs establish module availability starting at `v22.5.0`; if the application must load `node:sqlite` without the `--experimental-sqlite` flag, the documented threshold is `v22.13.0`. Neither fact sets an IPD-approved runtime floor or guarantees the full API subset the future implementation will use. The separate Gate 3 act must name the exact supported runtime/version range and API behavior; a future Windows host must be checked on that exact runtime.

**Not established:** the exact Node version installed on the user's Windows deployment host, the host architecture/Windows build, whether its Node binary exposes the same `node:sqlite` API, how its runtime emits the warning, or its file-system, locking, and crash-recovery behavior. Arena did not access or run tests on that host.

The G3-D2 selection does not silently establish a project runtime pin. Before the separate Gate 3 act, the act must identify the exact Node version or bounded version policy against which code and CI are accepted, and state the APIs/behavior it relies on. Before Gate 4, the Windows operator must provide host evidence for the exact deployment Node binary and the selected API. The Node v22.22.3 sandbox result is not a substitute.

**Operator evidence needed later (not executed here):** on the designated non-production Windows deployment host, capture the Windows version/build and architecture; `node --version`; `node -p "JSON.stringify({version:process.version,platform:process.platform,arch:process.arch,sqlite:process.versions.sqlite})"`; and the un-suppressed stdout/stderr from a disposable, non-production `node:sqlite` probe on that exact Node binary (module import, `DatabaseSync`, required prepared-statement APIs, `BEGIN IMMEDIATE`, commit/rollback, close/reopen, and the ExperimentalWarning). Record the exact command, working directory, timestamp, exit status, and raw output. Later Gate 4 evidence must additionally execute the governed application-level Windows qualification; this diagnostic probe alone is not qualification or result acceptance.

### 4.3 Initialization, provisioning, transactions, and durability

The current G3 request proposes the startup order **`validate → connect → migrate → verify → bind`**. A store fault, unverified migration, or endpoint-name collision must create no endpoint and must not fall back. It proposes one operator-local database file, a single writer, immediate/serialized transactions, commit-on-acknowledge, and startup verification of a migration ledger. The selected technology does not decide who provisions the local principal binding or whether provisioning code is included.

G3-D4 remains the decision on whether provisioning **code** is included in the bounded Gate 3 scope. Provisioning execution is a separate, one-time operator act on the Windows host; the request records it as approved but **NOT EXECUTED**. Neither selecting `node:sqlite` nor recording this decision executes provisioning or creates an A-2 binding.

Gate E continues to require, if and when a write path is separately authorized:

- re-read and validate the single `ACTIVE` binding inside the same immediate/serialized transaction as the mutation (W-3);
- one request per transaction, at most one new immutable revision, all-or-nothing outcome, and zero state change for refused/failed writes (W-4);
- the stated concurrency, immutable revision, expected-revision, idempotency, and no-retry/outcome-unknown semantics (W-5/W-8/W-9);
- acknowledge success only after durable commit; do not label the current `SESSION_ONLY` path durable (W-11);
- crash/kill recovery to either the full committed revision or none, and no endpoint on migration/store startup faults (W-12);
- persistence of contribution SHA-256 lineage, broker attribution, and `contentDigest` across restart and governed lifecycle operations (W-13); and
- the accepted audit and retention rules (W-14/W-16).

These are contract obligations, not implementation details supplied by G3-D2. No database schema, column/property names, migration algorithm, backup automation, journal mode, or per-file design is decided here.

### 4.4 Bounded file set, dependencies, tests, and acceptance remain for the Gate 3 act

The current request's §3/§6 lists are **proposals**, not the final authorization file set. For Option B, §6.1 proposes `src/persistence/*`, `src/ipc/*`, a durable adapter alongside the existing portfolio port, new tests, and an explicitly conditional `package.json`/lockfile line item. It expressly leaves `src/identity/*` unchanged and protects the existing UI/session store and its `SESSION_ONLY` label. The exact file list, including any IRR files if G3-D7 is accepted, is not yet fixed. Do not expand the list by inference.

Because `node:sqlite` is built into Node, no third-party SQLite runtime package is inherent in Option B. The Gate 3 act must nevertheless state explicitly whether `package.json`, the lockfile, the Node version declaration, or type tooling change; any required change must be in that act's bounded scope. No dependency or lockfile was changed here.

The proposed Gate 3 tests in request §6.2 remain the acceptance floor to be fixed by the act:

- **T-A/T-B/T-C/T-D:** malformed or oversized framing, caller-authority refusal, invalid/ambiguous/revoked bindings, and indistinguishable missing/foreign/tombstoned reads fail closed;
- **T-E/T-F:** failed startup/migration/store/collision creates no endpoint and exits non-zero; IPD creates no TCP/HTTP/URL listener;
- **T-G/T-H:** the selected G3-D3 write slice remains refused or disabled by default with zero row delta; the UI remains `SESSION_ONLY`/`durable:false`, and only committed durable-store results may use the durable vocabulary;
- **T-I/T-J:** existing `bi07_*` store-port suites pass unchanged and the IRR user-portfolio boundary continues to return 503 without calling the port.

The Gate 3 act must name the exact tests and commits and require CI typecheck, build, guarded tests, a non-zero executed-test count, zero failures, and the recorded counts. A green Gate 3 CI run is not Gate 4 qualification.

Gate E §4 and the current request reserve Windows and durability claims for later qualification. Among the specific later tests are **QE-3** lifecycle/revision behavior; **QE-4** create → durable commit → stop both IRR and IPD processes → restart both → byte-for-byte read-back; **QE-5/QE-6** idempotency and lineage after restart; **QE-7** forced termination during a write and rejection of tampered/unverified migrations; **QE-8** revocation including races and restart; **QE-9/QE-10** refusal/no-effect and outcome-unknown/no-auto-retry; and the read-only Gate C subset including C5.1/Q9 zero bytes. Gate 3 tests do not prove these Gate 4 results.

## 5. Explicit non-authorization and preserved safeguards

This decision record grants **no** Gate 3 implementation authority and authorizes no implementation PR. In particular:

- IPD portfolio persistence on `main` remains `SESSION_ONLY` / `durable: false` (current blobs `d61f18dfdce12a7f0c4377a3c6d410026d454089` and `3bf852b99e300a8dfa71d3b1b04ed0f7b947b4a5` at IPD `main@be32d8c9…`). No `src/persistence`, `src/ipc`, `src/user_portfolio`, `src/auth`, or `src/app_identity` implementation paths were present on that head.
- IRR `/api/user-portfolios*` remains fail-closed with HTTP `503 owner-context-unavailable` (current IRR blobs `51704c12a467cd2f718a030b5036bc55c9afa73f` and `cb8db45d668d28cee7e0a52721001d579a872733`).
- C8 remains **NOT MET** at IRR `main`: the executive transport emits wildcard CORS, its server listens without a loopback host, and Vite is configured for `0.0.0.0`. G3-D7 remains outstanding; G3-D2 does not fix C8.
- Gate 4 qualification and result acceptance are separate subsequent stages; Gate 5 admission and any 503 lift are separate. No qualification, admission, release-readiness, or production-eligibility claim is made.
- The existing 51-row baseline and 13-item inventory are unchanged and are not redefined by this record.
- IRR PR #114 is unrelated and untouched. No IPD repository content or ref was modified.

## 6. Recording and publication boundary

This is an additive IRR-side record of the Program Authority's explicit decision, prepared against the verified bases in §3 and accompanied by the reconciliation packet `docs/integration/2026-10-18/PKG-02E-G3-D2-DECISION-AND-GATE3-RECONCILIATION.md`. The record changes no product, test, runtime, frontend, API, persistence, package, lockfile, listener, CORS, or production behavior. Publication facts (PR, merge commit, CI, and post-merge remote read-back) are recorded additively in the packet index and repository tracker after they are actually verified.
