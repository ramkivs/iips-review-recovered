# IIPS v3.0 — Gate 4 Target-Host Qualification Authority Act — **PROPOSED**

## Proposed bounded act — Windows `scripts/run-tests.mjs` summary-parser remediation + QE-1…QE-11 execution authority

> ## STATUS: **PROPOSED — NOT EFFECTIVE — GRANTS NO AUTHORITY — FOR PROGRAM AUTHORITY DETERMINATION**
>
> - **This document is a proposal.** It is not approved, not rendered, not effective, and it authorizes
>   nothing. It does **not** implement anything, does **not** execute QE-1…QE-11, does **not** make any
>   test pass, and does **not** make Gate 4 authorized or started. **Gate 4 remains `NOT AUTHORIZED /
>   NOT STARTED`** until the Program Authority renders a determination on this proposal and the act is
>   made effective under §9.
> - The effective Gate 3 authority act (`IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02`) and its
>   amendment (`IIPS-V3-G3-AMEND-01-2026-10-22-01`) and the formal Gate 3 acceptance record
>   (`IIPS-V3-G3-ACCEPTANCE-2026-10-22-01`, **`ACCEPTED — BOUNDED GATE 3 IMPLEMENTATION SCOPE ONLY`**)
>   are **not modified, not superseded, not re-opened, and not re-interpreted** by this proposal.
> - **No signature, approval ID, approval timestamp, PA decision, or effective act ID is asserted.** The
>   Act ID is **`PENDING ASSIGNMENT`** — no existing record prescribes an identifier for this instrument.
> - A merge of this proposal into any branch confers **no effectiveness**. Effectiveness is governed
>   exclusively by §9 and requires a separate Program Authority determination.
> - **Reconciliation revision 2:** prepared record `IIPS-V3-G4-QUALIFICATION-AUTHORITY-PROPOSAL-2026-10-22-02`
>   revises the not-yet-determined PR #190 proposal to fix the exact helper path, complete the parser
>   regression matrix, and record the W-1, Node-22, Gate A′ and QE-11 stop boundaries. It changes no
>   governing Gate 3 record and renders no PA decision.

| Field | Value |
|---|---|
| **Act ID** | **`PENDING ASSIGNMENT`** — PA to assign at determination. The separate **prepared proposal record ID** is `IIPS-V3-G4-QUALIFICATION-AUTHORITY-PROPOSAL-2026-10-22-02`; it is not an effective-act identifier |
| **Proposal revision** | **Reconciliation revision 2** — supersedes only the initial PR #190 proposal text for future PA consideration; the PR #190 text remains available at commit `e7f667f5fdffbcc95513c1de59164de9792da47b` |
| **Act type** | Proposed Gate 4 target-host qualification authority — cross-repository, bounded, fail-closed: (A) Windows canonical test-wrapper summary-parser remediation; (B) operator execution-and-recording authority for QE-1…QE-11 |
| **Status** | **PROPOSED — NOT EFFECTIVE** — no authority granted |
| **Prepared date** | `2026-10-22` (UTC) |
| **Prepared by** | Arena Agent Mode (preparation, verification, publication only — renders no decision) |
| **Deciding authority required** | **Ramki — Program Authority** (single owner/user; cross-repository capacity). See the PA determination checklist in the evidence packet. |
| **Preparation/publication authority; not execution authority** | Routine investigation, evidence, documentation and publication proceed under the recorded standing grant (F-3 §1.2) and Q1's authorization to work the qualification evidence. Q1 §2 expressly excludes Gate 4 execution, and the later `G3-AMEND-01` §6.4 again requires a separate Gate 4 PA act for runner repair/QE work. **Neither Q1 nor the standing grant makes this act effective.** |
| **Governing predecessors (all preserved, none modified)** | Gate 3 act `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` (blob `4744e6f44e0caea55e980756aeef90a5046ec87e`, SHA-256 `f4992f9ced681ffddd0d8eaf1f3de297f2262f1eb0b3131ce18b95805725abf5`, 51,662 B, **EFFECTIVE**); `G3-AMEND-01` `IIPS-V3-G3-AMEND-01-2026-10-22-01` (blob `85ba78e6cbfe20ed146a53abbfa23a3350140fcf`, SHA-256 `cf6d72b50908c6859d7079b7c7197c88e9d4ed0b6a90813a0b304fcbbd65926a`, 47,104 B, **EFFECTIVE**); Gate 3 acceptance `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` (blob `f3a6c9a3d15985a78a0945ecfc96019b3a5c425a`, SHA-256 `e1433fac9c1d9d2467409c8c3320c8a49eff6f86f6321a144200a96c679a2e40`, 41,277 B — **`ACCEPTED — BOUNDED GATE 3 IMPLEMENTATION SCOPE ONLY`**) |
| **Qualification-definition source** | Gate E write policy rev 1 §4 (`IIPS-V3-G2-GATE-E-PORTFOLIO-WRITE-POLICY-2026-10-18-01`, blob `4a9501bffb49abbbc0ba5b5c4f81d2841812913e`), read with L-IPC-1 §10 (`cab04b6f…`), D-GC (`IIPS-V3-G2-IPD-GATE-C-QUALIFICATION-AUTHORITY-2026-10-17-01`, blob `9befe6d8…`) and G2-D3 option (b). Reproduced in `IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md`. |
| **IPD implementation basis (pinned)** | `ramkivs/iips-production-market-data` `refs/heads/main` @ **`1cceacfff40f22dbc9cd64906bf26a5feac1075e`** (root tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`) — the Gate 3 accepted commit; verified live at preparation (§2) |
| **IRR rendering basis (pinned for revision 2)** | `ramkivs/iips-review-recovered` `refs/heads/main` @ **`4f472283cd6bbedb228d06bfb9a766688c039976`** (tree `137a1b92b537c772d59a6af339d9e48dc42c7cf5`; PR #190 merge; verified live during reconciliation). The initial proposal's `04394f3f…` basis and earlier drift remain recorded at §§2.2–2.3 |
| **Target host** | `desktop-no0nhtp` (the designated Windows deployment host; Gate 3 act §8.3/§11) |
| **Label** | `non-production, single-principal, same-host IPC` — unchanged |
| **Production status** | `NON_PRODUCTION` — production **NOT AUTHORIZED** |

---

## 1. Purpose and exact scope

This proposed act covers **exactly two limbs**, both recorded as outstanding in the effective governance
record (Gate 3 acceptance `…-2026-10-22-01` §7: *"Gate 4 (`QE-1…QE-11` host qualification & Windows
`scripts/run-tests.mjs` summary-parser remediation): `NOT EXECUTED / NOT STARTED` … require their own
Gate 4 authority/execution sequence"*; `G3-AMEND-01` §6.4(1): *"[the] bounded repair of
`scripts/run-tests.mjs`'s Windows summary parsing is **deferred to a separate PA act within Gate 4**"*):

- **Limb A — wrapper remediation.** Investigation and bounded remediation of the identified
  TAP-summary parsing defect in the canonical Windows test wrapper `scripts/run-tests.mjs`, with tests
  covering the relevant summary formats and exit-status handling (§4). **The repair is NOT implemented
  by this proposal and may not be implemented before this act is effective.**
- **Limb B — QE execution authority.** Authorization for the operator to **execute and record** the
  designated target-host end-to-end qualification items **QE-1 through QE-11** at recorded digests,
  with raw output published (§5, and the QE matrix). **QE items are NOT executed by this proposal.**

Everything else is out of scope (§8).

## 2. Rendering basis and baseline verification

### 2.1 Live remote state at preparation (`2026-10-22`, independently verified this pass)

| Repository | Ref | Reported baseline | Verified live SHA (this pass) | Method | Drift |
|---|---|---|---|---|---|
| IPD `ramkivs/iips-production-market-data` | `refs/heads/main` | `1cceacfff40f22dbc9cd64906bf26a5feac1075e` | **`1cceacfff40f22dbc9cd64906bf26a5feac1075e`** | `git ls-remote`; full clone `HEAD`/`git log`; GitHub Actions run list (only `main` push run at that SHA: `39765365164` `success`) | **None** — exact match |
| IRR `ramkivs/iips-review-recovered` | `refs/heads/main` | Initial proposal basis `04394f3ffa88da8a72cb6b9d01f668d9d2650e6f`; earlier reported basis `5a3410eab1a627e56642e82d93fcb875026a3334` | **`4f472283cd6bbedb228d06bfb9a766688c039976`** (revision-2 live check; the ref advanced when PR #190 merged the initial proposal) | `git ls-remote`; fetch/fast-forward of the fixed documentation branch; GitHub compare/commit/Actions APIs; diff audit | **Advanced, documentation-only** — see §§2.2–2.3 |

CI state: IPD `main@1cceacff…` push CI **`39765365164`** `success` (`784` executed / `783` passed / `0` failed). IRR `main@4f472283…` push CI **`39782159580`** `success`; PR #190 head CI **`39781892060`** `success`; earlier IRR CI `39779378820` (at `04394f3…`) and `39771867868` (at `5a3410e…`) also `success`. These are hosted Linux checks, not target-host evidence.

### 2.2 IRR drift record (not silently substituted)

The IRR remote `main` advanced **after** the pass-start verification, from the reported baseline
`5a3410eab1a627e56642e82d93fcb875026a3334` to `04394f3ffa88da8a72cb6b9d01f668d9d2650e6f`.
Intervening commits (all inspected):

| Commit | Summary | Files touched |
|---|---|---|
| `7e614b8ace417d7526c5c69664fe598b872363f7` | docs(g3): Gate 3 acceptance re-verification & recordkeeping reconciliation (§16.78 / CV-CORR-59) | tracker, packet index |
| `7622482147292df9295e5d1c0d6d4d15d8c9d1b6` | Merge PR #188 | — |
| `edbe3700880a1ec97f0a390c0115f12139d1b775` | docs(g3): §16.78.10 publication & remote read-back receipt (CHG-2026-10-22-10, V238–V240) | tracker |
| `04394f3ffa88da8a72cb6b9d01f668d9d2650e6f` | Merge PR #189 | — |

`git diff --name-status 5a3410ea… 04394f3…` = **`2 M`** — `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`, `docs/integration/2026-10-18/BASELINE-AND-DECISION-PACKET-INDEX.md`. **Documentation-only**; no application, test, dependency, route, fence or configuration path changed; every Gate 3 record and safeguard (§7) re-verified intact at `04394f3…` (tracker §16.78 / `CV-CORR-59` is itself a re-verification of `AC-1`…`AC-8`, all `PASS`).

**Initial baseline conclusion.** The IPD pin stood unchanged at `1cceacfff40f22dbc9cd64906bf26a5feac1075e`. The initial proposal did **not** re-pin the Gate 3 accepted baseline; its then-current IRR rendering basis was `04394f3f…`. That statement is retained as the initial drafting record and is carried forward only through the explicit revision-2 drift record below.

### 2.3 Revision-2 drift: the initial Gate 4 proposal merged during reconciliation

Before revision 2 was written, IRR `main` advanced from `04394f3ffa88da8a72cb6b9d01f668d9d2650e6f` to **`4f472283cd6bbedb228d06bfb9a766688c039976`** (tree `137a1b92b537c772d59a6af339d9e48dc42c7cf5`) through **PR #190**, merged at `2026-10-22T12:53:49Z`. Compare `04394f3…4f472283` contains the proposal commit `e7f667f5fdffbcc95513c1de59164de9792da47b` and the merge commit, and changes exactly four Markdown paths: the three Gate 4 proposal documents and the packet index. There are **no product, test, dependency, workflow, route, fence or configuration changes**. PR-head CI `39781892060` and post-merge `main` CI `39782159580` are both `success`.

Revision 2 therefore uses `4f472283…` as its documentation rendering basis and revises the existing proposal instead of creating a competing act. The future QE consumer commit remains to be designated in the rendered act and recorded at run start; this documentation pin is not represented as a qualified consumer commit. Any later non-documentation drift before effectiveness is a stop condition, not an automatic re-pin.

## 3. Evidence-channel separation (preserved exactly; four channels, no substitution)

| Channel | Content | Standing at this proposal |
|---|---|---|
| **1 — Hosted Linux CI (`ubuntu-latest`)** | IPD/IRR GitHub Actions runs (e.g. IPD `39765365164` `784/783/0`; IRR `39779378820`) | Gate 3 acceptance evidence (per `Q3-A`). Establishes **no** Windows or host behaviour |
| **2 — Native-Windows canonical `npm test`** | `npm test` → `node scripts/run-tests.mjs` on the operator's Windows host | **`FAILED` (`NON-PASSING`)** — the suite executed, then the summary parser (`^# tests (\d+)$`) failed against the Windows `node --test` summary output (`ℹ` marker and/or CRLF), tripping the CV-35 zero-test guard. **This remains a failure. It is not a passing canonical run and must never be relabelled as one.** Limb A (§4) is the authorized (proposed) remediation path; only a post-remediation canonical run on the target host can produce channel-2 pass evidence |
| **3 — Native-Windows direct TAP** | `node --test --test-reporter=tap dist/tests/*.js` (log `g3-connection-release-direct-tap-20261022-013113.log`), operator-supplied | `PASS — 754 / 750 passed / 0 failed / 4 skipped (posixOnly), exit 0` — **supplemental defect-remediation evidence only** (`Q3-A`); **not** a canonical passing run, **not** a substitute for channels 1/2, **not** QE evidence |
| **4 — Target-host end-to-end qualification (QE-1…QE-11)** | Host-only execution at recorded digests with raw output published | **Does not exist yet.** Created only by a future authorized execution under Limb B (§5) and closed only by a **separate result-acceptance act** |

No channel substitutes for another. In particular: the direct-TAP run is **not** a passing canonical
`npm test`; hosted CI is **not** host qualification; and a remediated wrapper run is **not** QE evidence.

## 4. Limb A — Windows `scripts/run-tests.mjs` summary-parser remediation (proposed scope)

### 4.1 The defect (confirmed scope — repository evidence)

| Item | Verified value |
|---|---|
| File | IPD `scripts/run-tests.mjs` (the canonical `npm test` wrapper, CV-35/CV-42 guarded runner) |
| Blob at `1cceacfff40f22dbc9cd64906bf26a5feac1075e` | `fe1ab1a30d8cd0060b5fc50d181d6fcc735a3794` (4,974 B, 129 lines; SHA-256 `a677c7da5365b62af06d077eef6e6a6248267fbd1a53b28412135e3e20e0ecf2`) |
| Defective region | Line 111–112: `const output = \`${result.stdout ?? ''}\n${result.stderr ?? ''}\`;` then `const reported = output.match(/^# tests (\d+)$/m);` — and line 126: `const passed = output.match(/^# pass (\d+)$/m);` |
| Observed failure (channel 2) | On native Windows, the runner's summary did not match `^# tests (\d+)$` (recorded cause: the emitted `ℹ` summary marker and/or CRLF line endings, against which a `$`-anchored multiline regex fails before the `\r`), so `executed === null` and the wrapper failed closed: *"the runner reported no test count — the result cannot be trusted"* → non-zero exit (CV-35 guard). The suite itself had passed. |
| Sources | Native-Windows evidence record `IIPS_v3.0_G3_NATIVE_WINDOWS_EVIDENCE_AND_ACCEPTANCE_ELIGIBILITY_2026-10-22.md` §1.2/§3 (**current blob `2f5375d7151482bca791d7aa6c0c45878ba8bed9`**, SHA-256 `11e7500c952e7e0e28b2bb497ef5fd11c10f9cfe147f4b733c8f4a55a394ac5f`, 21,272 B; `4ffbfd97…` is the historical amendment-cited version); `G3-AMEND-01` §6.2 channel 2; Gate 3 acceptance §5 channel 2; tracker §16.78.4 (*"repair deferred to a separate PA act within Gate 4"*) |

**The current Windows canonical `npm test` wrapper failure remains a failure.** Nothing in this act
relabels the supplemental direct-TAP run (channel 3) or any other channel as a passing canonical run.

### 4.2 Smallest appropriate repair (proposed boundary)

If this act is made effective, Limb A authorizes **exactly**:

| # | Path | Permitted change |
|---|---|---|
| 1 | `scripts/run-tests.mjs` (**existing**) | **Summary-parsing region only** (output normalization, summary extraction at lines 111–112/126, the directly associated failure/OK reporting, and adjacent explanatory comments): accept the two recorded `node --test` forms, TAP `# tests\|pass\|fail\|skipped N` and spec `ℹ tests\|pass\|fail\|skipped N`, with LF/CRLF/CR handling. Preserve discovery, source/compiled inventory, stale-build and zero-test guards, child-exit propagation and the existing command interface. A valid zero-failure run prints the existing `[test-guard] OK` form; malformed/incomplete counts, zero tests or a failing run never print `OK` |
| 2 | `tests/g4_run_tests_summary_parsing.test.ts` (**new**; delegated design name `[D]`, not pre-existing) | The complete regression matrix in §4.3, including valid, malformed/incomplete, zero-failure, nonzero-failure, skipped and source-required cases, plus exact child-exit propagation. Fixtures must be synthetic and disposable; no deliberately failing fixture is added to the discovered production test suite |
| 3 (conditional) | `scripts/test-summary-parser.mjs` (**new, optional**; exact delegated design name `[D]`) | May be created **only** to hold a pure, side-effect-free summary parser shared by items 1–2. It must contain no process exit, filesystem, network, child-process, repository-discovery or environment access. If extraction is unnecessary, this path remains absent. It is the **only** permitted helper path; there is no unnamed `scripts/lib/…` alternative |

No fourth product/test path and no second helper is authorized. The optional helper, if used, must be
included in the before/after qualified-surface manifest; if unused, its absence must be recorded.

**Explicitly not authorized under Limb A:** any test-runner redesign or replacement; any change to
`package.json` (scripts/deps/engines/exports), `package-lock.json`, `tsconfig.json`,
`.github/workflows/ci.yml`, `vite.config.ts`, `src/**`, any existing `tests/*` file, any IRR product or
test file, the CV-35/CV-42 guard semantics, or discovery/staleness logic; any CI matrix addition (in
particular **no Windows CI leg** — `Q2-A` froze `ci.yml` at
`aeee464feb76e2d1e9d104e1cae4e5dde37700ad`); IPC, connection-slot, persistence, migration, provisioning
or lifecycle changes; and anything in Gate 3's accepted implementation/test manifests.

### 4.3 Validation obligations and required parser regressions for Limb A (proposed)

From IPD root at the remediation commit: `npm ci --no-audit --no-fund` → `npx tsc --noEmit` →
`npm run build` → `npm test`. The accepted `main@1cceacff…` baseline is **60 source test files / 784
executed / 783 passed / 0 failed / 1 Linux-skipped**. The new test file must be discovered and executed;
its additions must fully explain the count delta. No existing test may be deleted or silently skipped,
and any count decrease, cancellation or unexplained skip stops the run for reconciliation. A successful
full run requires non-zero executed count, zero failures and `[test-guard] OK`.

The new regression file must cover at least this matrix (multiple assertions may be grouped, but no row
may be omitted):

| Required case | Required observable |
|---|---|
| Valid TAP summary, LF and CRLF | `# tests`, `# pass`, `# fail`, `# skipped` parsed as integers; a zero-failure/non-zero-test/exit-0 case reaches the existing `OK` line |
| Valid spec summary, LF and CRLF | `ℹ tests`, `ℹ pass`, `ℹ fail`, `ℹ skipped` handled equivalently; UTF-8 bytes are not mistaken for garbage or a missing count |
| CR-only and surrounding runner noise | Line-ending normalization does not consume adjacent output or accept a count embedded in arbitrary prose |
| Malformed/incomplete summary | Missing, non-numeric, negative or conflicting executed/pass counts fail closed with non-zero status and no `OK`; an incomplete failed run cannot be promoted to success |
| Zero tests | Non-zero status and the existing CV-35 zero-test failure, even if the child exits 0 |
| Zero failures | A valid non-zero-test, `# fail 0` / `ℹ fail 0`, exit-0 run succeeds and reports the actual executed/passed counts |
| Nonzero failures | A valid summary with `fail > 0` never prints `OK`: non-zero child status is propagated exactly, and an inconsistent child-exit-0/fail-count-positive result still fails closed rather than reporting success |
| Skipped tests | A valid non-zero-test, zero-failure run with skips retains the raw skip count, names all skips in the evidence record, and does not relabel skips as passes or failures |
| Source-required/discovery guards | Missing source directory, no source tests, a source test with no compiled counterpart, stale compiled output, and no compiled tests each remain non-zero; the new source test itself must have a compiled counterpart |
| Child failure/signaling | Spawn failure and non-zero child exit remain failures; with a valid executed count, the child's non-zero status is propagated exactly rather than collapsed to `OK` or 0 |

On the **target host**, canonical `npm test` must then be re-run and report
`[test-guard] OK — <n> test(s) executed, <p> passed, exit 0` with non-zero `n`, zero failures and all
skips enumerated. That is channel-2 remediation evidence only, not QE evidence. Hosted
`ubuntu-latest` PR-head and post-merge CI must also stay green (channel 1). Linux/direct-TAP results are
supplementary and cannot substitute for either required channel.

### 4.4 Fail-closed rule for Limb A

If remediation cannot be completed within §4.2's exact paths (including a second helper or any
`src/**` change), if a required §4.3 case cannot be implemented without changing the command interface
or discovery/guard semantics, or if the full-suite count drops without a complete source-level
explanation, the work **stops**, records the blocker and requires a PA amendment. No approximation,
substitution, snapshot of stale `dist`, environment switch or weakening of the CV-35 zero-test guard is
permitted.

## 5. Limb B — QE-1…QE-11 execution and recording authority (proposed scope)

### 5.1 What would be authorized

If effective, Limb B authorizes **the operator** (Ramki, on the target host `desktop-no0nhtp`) to
**execute and record** the qualification items **QE-1 through QE-11** exactly as defined by the
governing record (Gate E §4 with its mappings; L-IPC-1 §10 for the QE-11 subset; G2-D3 option (b) for
QE-4), following the field matrix prepared at
`docs/integration/IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md` — measurement and
recording only.

### 5.2 Execution constraints (proposed)

1. **Effectiveness first.** The rendered act must resolve the evidence packet's PA-only items before
   the corresponding work begins. Publication of this proposal, Q1, standing documentation authority,
   hosted CI or a merged PR is not a substitute.
2. **Native host identity, re-measured.** Execute only on `desktop-no0nhtp`, under the provisioned
   single-principal, non-elevated Windows account, with Node reporting `process.platform === "win32"`.
   Record UTC start/end, computer/account identity, Windows caption/build/architecture, Node executable
   path and SHA-256, `process.version`/`process.versions`, and both repository worktree statuses. WSL,
   Linux, macOS, a hosted `windows-latest` runner and a merely similar Windows machine are not the
   designated deployment host and cannot supply Gate 4 evidence.
3. **Runtime is a hard preflight, not a PA latitude.** Gate 3 act §8.3 requires **Node major 22**, with
   minimum **`22.13.0`** (therefore `>=22.13.0 <23`), and flag-free `node:sqlite`. Re-measure the actual
   executable and run an in-memory `DatabaseSync` open/close probe before qualification. Historical
   Gate A′ records report Node **`v24.14.0`** on this host; that is historical, not current proof, and
   **Node 24 does not satisfy the Node-22 policy**. If a compliant Node-22 runtime is not already
   available, stop. This act does not install, switch, upgrade or amend the runtime.
4. **Gate A′ is mandatory and external.** Gate E §4 requires execution after Gate A′ provisioning.
   Require a successful Gate A′ execution record on the same host, with P-1 path preconditions and a
   store/schema compatible with the exact qualified migration blobs. Gate A′ remains
   `APPROVED — NOT EXECUTED`; this act neither executes nor re-bases it. Current `provisioning.ts` has
   no executable entrypoint, and creating one is outside scope. Absent, incompatible or unproven
   provisioning evidence stops Limb B.
5. **Order and final commit.** Complete and merge Limb A first; obtain green PR-head and post-merge
   Linux CI and a passing native-Windows canonical `npm test` at the **exact post-merge IPD commit**.
   Only then start QE. Every QE item must use that same final IPD commit and the rendered-act-designated
   IRR consumer commit. Evidence from an earlier PR head, PR #41, PR #42 or a direct-TAP candidate does
   not transfer to the final commit.
6. **Recorded digests and drift.** The IPD lineage must descend from
   `1cceacfff40f22dbc9cd64906bf26a5feac1075e`; the IRR consumer lineage must descend from the designated
   Gate 3 consumer lineage (revision-2 documentation basis `4f472283…`, not itself a qualification
   claim). Record commit, root tree, qualified-surface blob/SHA-256 manifest, clean status and remote
   ancestry at start and end. Do not mutate either qualified worktree during the run. Any qualified
   surface drift, unexpected repository mutation or source/compiled mismatch invalidates the run under
   QE-11/H-12; later evidence-publication commits must be separately identified and must not be
   represented as the qualified consumer commit.
7. **Raw evidence and safety.** Publish unedited raw output under exactly one new IRR run directory
   `evidence/integration/gate-4-target-host-qualification-<run-id>/`, with UTC command transcripts,
   per-item records, before/after manifests and SHA-256 of the **actual bytes** of every artifact. Do
   not normalize line endings before hashing. Use only synthetic/disposable fixtures and isolated store
   copies; never open or destroy an authoritative/operator store. No secrets, production data or real
   user portfolio data may be captured; if any appears, stop publication and escalate rather than
   silently editing the “raw” log.
8. **QE-11 execution and acceptance are different events.** Re-issue, if PA adopts D-6, only the
   Q1–Q4/Q9–Q11 execution grant against the current qualified commits; the old `cec70802…` grant is not
   reused. Preserve the ordered Q11-before → Q2 → Q10 → Q9 → Q3 → Q4 → Q1 → Q11-after procedure,
   mandatory C5.1/Q9 zero bytes, and `PARTIAL — Q5–Q8 DEFERRED` vocabulary. **Q1 is records-only**:
   collect the V-5 inventory and D-GC-B waiver reading in H-13 form; do not invent a test execution or
   relabel waived measurements as technical PASS. Q11's exact current digest set must be fixed before
   execution (D-7). A separate Gate C result-acceptance act must accept the subset before QE-11's
   “passed and accepted” limb can be satisfied; this act grants no such acceptance and does not make
   Gate C complete.
9. **W-1 fence-preserving write mechanism must be explicit.** At current `main`,
   `evaluatePortSaveGuard()` always returns `authorized:false` for W-1(3)/(4), and IPC dispatch refuses
   all four write operations before store mutation; no environment flag enables them. Existing T-G
   tests call `DurablePortfolioStore` directly. Accordingly: (i) direct-store or disposable-harness
   mutations may be **supporting domain evidence only**; (ii) they are not admitted endpoint writes,
   not route qualification and not a W-1 lift; (iii) they cannot by themselves prove QE-4's real
   two-process sequence or QE-10's post-send outcome-unknown behavior; and (iv) no operational IPC/HTTP
   write may be enabled. Unless the rendered act expressly adopts a fence-preserving mechanism for
   each affected item (D-4), **stop those items for PA clarification**. Do not fabricate a
   qualification mode or report successful admitted writes.
10. **Real-process obligations.** QE-4 uses create → durable commit → stop **both IRR and IPD** →
    restart both → byte-equal holdings/contributions/revisions; no OS reboot is required (G2-D3 option
    (b)). QE-10 requires separate real IRR/IPD processes, no automatic retry, outcome-unknown handling
    and reconcile-by-read. Test doubles or direct-store-only evidence cannot be substituted for these
    real-process obligations.
11. **Qualification is not remediation.** Limb B authorizes measurement/recording only. Any product,
    migration, provisioning, IPC, consumer or configuration defect requires a stop and a separate
    bounded PA act; it may not be fixed inside the QE run.
12. **No result acceptance, admission or capability claim.** A run produces evidence and a
    PASS/FAIL/INCONCLUSIVE record only. Gate 4 result acceptance remains a separate act (W-1(3)); no
    run, commit, CI result or merged PR is acceptance.

### 5.3 Completion conditions (three distinct milestones)

| Milestone | Required conditions | What it does **not** mean |
|---|---|---|
| **Limb A remediation complete** | Exact §4.2 path scope; §4.3 matrix and full suites pass; native-Windows canonical `npm test` passes at the final post-merge IPD commit; PR-head/post-merge CI green; remote commit/tree/blob/SHA-256 read-back matches; no baseline test loss or unexplained skip | Not QE execution, not host qualification, not Gate 4 acceptance |
| **Gate 4 evidence collection successfully executed** | All QE-1…QE-11 pass on the same final recorded IPD/IRR digests; Gate A′ and runtime preflights pass; raw evidence and all attempts are published/read back; no invalidating drift or unresolved INCONCLUSIVE item; QE-11's subset has also received its separate required acceptance | Still not W-1(3), Gate 5, route admission or production eligibility |
| **Gate 4 qualification accepted / W-1(3) satisfied** | A **separate Gate 4 result-acceptance act** accepts the complete executed evidence, including the accepted QE-11 subset, and is itself effective | W-1(4) remains false; operational writes and `503` fences remain unchanged until a separate Gate 5 act |

A failed or incomplete run may be closed only as **FAILED** or **INCONCLUSIVE**, with all outputs
retained. It is not a successful Gate 4 execution and cannot be partially accepted as qualification.

### 5.4 Stop conditions (mandatory)

Stop the affected limb immediately on: an unresolved D-4 write mechanism; absent/incompatible Gate A′
evidence; wrong host/account/platform; Node outside `>=22.13.0 <23` or failed `node:sqlite` probe;
unfixed QE-11 digest set; any digest/worktree drift; missing raw output; any required parser case or
full-suite regression failing; any need for an unlisted file, dependency, runtime installation,
configuration change, real-user fixture or product repair; or any request to lift W-1, a `503` fence,
`SESSION_ONLY`/`durable:false`, PR #42 separation, Gate 5 or production boundaries. Record the exact
stop and evidence; do not improvise around it.

## 6. Commit and publication workflow (proposed; explicitly identified)

### 6.1 Limb A (implementation) — target branch: IPD `refs/heads/main`

1. Branch from IPD `main` at `1cceacfff40f22dbc9cd64906bf26a5feac1075e` (or its PA-confirmed successor).
2. Implement exactly §4.2; commit narrowly (wrapper remediation + tests, nothing else; diff-stat proof:
   only the §4.2 paths).
3. Open an IPD pull request into **`ramkivs/iips-production-market-data` `refs/heads/main`** (merge
   commit form, `--merge`; no squash/rebase/force; no direct-to-main commits).
4. Required remote verification: PR-head CI (`typecheck · build · test` + `executed test count`) green
   with non-zero counts and zero failures; post-merge `main` **push** CI green; `git ls-remote` agreement
   with the merge SHA; blob/SHA-256 read-back of `scripts/run-tests.mjs`, the new test file and the
   optional exact helper (or its recorded absence) at `main`; diff-stat proof that no non-§4.2 path
   changed; native-Windows canonical `npm test` re-run at that **post-merge commit** (channel 2).
5. Record the exact PR head, merge commit, root tree, CI run IDs, counts and read-back digests in the
   evidence deposit. A later commit invalidates the earlier host run for final-commit qualification and
   requires the applicable canonical run and all QE evidence to be repeated at the new final commit.

### 6.2 Limb B (execution record) — target branch: IRR `refs/heads/main`

1. Operator executes QE-1…QE-11 on the target host per §5.2.
2. Deposit raw output + SHA-256 manifest under the designated IRR evidence path (§5.2(7)). Evidence is
   copied out of the qualified worktrees before any publication commit; the qualified worktrees remain
   byte-stable through Q11-after.
3. Publish an execution record to `ramkivs/iips-review-recovered` `refs/heads/main` through the IRR PR
   workflow (PR-head CI green; post-merge `main` push CI green; `git ls-remote` agreement; remote
   SHA-256 read-back), stating exact qualified digests **and separately the evidence-publication
   commits**, commands, per-item PASS/FAIL/INCONCLUSIVE, all attempts and the §8 non-grants.

### 6.3 Change control and evidence identity

- One narrow Limb A PR; no direct-to-main implementation commit, force-push, squash/rebase merge,
  PR #42 checkout/reuse, unrelated cleanup or hidden generated-file change. Any scope change requires a
  PA amendment before the commit is made.
- Bind every test log to the exact commit, root tree, runtime and command that produced it. PR-head CI,
  post-merge CI and native-Windows evidence are separate channels and are never interchanged.
- No “final” label attaches to a moving branch name. The final objects are exact commits/trees and
  remote blob/SHA-256 values. Any later code/test change creates a new candidate and requires a new
  final-commit validation sequence.
- Evidence commits and acceptance records are additive. They must not rewrite raw logs, delete failed
  attempts, relabel skips/failures, or silently replace the qualified commit with the publication commit.

## 7. Preserved governance (no conflict, no weakening)

This proposal is **consistent with and subordinate to** the effective Gate 3 record:

- Gate 3 remains **`ACCEPTED — BOUNDED GATE 3 IMPLEMENTATION SCOPE ONLY`** — preserved verbatim; nothing
  here re-opens, re-renders, or amends it. `G3-AMEND-01`'s `Q1-B`/`Q2-A`/`Q3-A` determinations stand.
- The Windows canonical `npm test` failure is **preserved as a failure** (§3) exactly as `Q3-A`
  requires; the direct-TAP run stays supplemental-only.
- **W-1 is untouched.** Its four conjunctive preconditions remain: policy accepted (TRUE); Gate 3 act
  (TRUE); **Gate 4 qualification executed on the deployment host AND accepted by a separate
  result-acceptance act (still FALSE after any run, until acceptance)**; Gate 5 admission (FALSE).
  Every write remains refused (`WRITE_NOT_AUTHORIZED`, zero store effect) in operational configuration.
- `SESSION_ONLY` / `durable:false` stays enforced; **no `durable:true` claim** (act §8.4 preserved).
- All `/api/user-portfolios*` and `/api/reports*` HTTP `503 owner-context-unavailable` fences
  (`cb8db45d…`, `51704c12…`, `98147054…`) remain unchanged; no route lift is created or implied.
- Gate A′ remains `APPROVED — NOT EXECUTED` (P-1 separate); Limb B does not execute Gate A′, add a
  provisioning entrypoint or presume that a store provisioned by the historical off-`main` procedure is
  compatible with current migrations.
- Gate 3's **Node major 22 / minimum 22.13.0** requirement is unchanged. Historical Node `v24.14.0` is
  not silently accepted, and no runtime installation or policy amendment is proposed here.
- `ci.yml` stays byte-identical (`aeee464feb76e2d1e9d104e1cae4e5dde37700ad` — `Q2-A`); no dependency,
  lockfile, `engines`, or configuration change in either repository.
- IPD Draft PR #42, IRR PR #114, and all off-`main` lineages (`6828155e…`/`470cc698…`/`cec70802…`,
  reference-only per G3-D5) remain untouched and unadmitted.

## 8. Scope and non-grants matrix

| Item | Standing under this proposal |
|---|---|
| `scripts/run-tests.mjs` summary-parser remediation (§4.2 items 1–3) | **PROPOSED AUTHORITY** (Limb A) — not effective until §9 |
| Tests for TAP/spec summary formats + exit-status handling | **PROPOSED AUTHORITY** (Limb A) |
| Typecheck / build / focused tests / full suite / documentation & evidence capture for the repair | **PROPOSED AUTHORITY** (Limb A) |
| Narrow commit + publication workflow (§6) with named target branches and remote verification | **PROPOSED AUTHORITY** |
| Operator execution + recording of QE-1…QE-11 at recorded digests on the target host | **PROPOSED AUTHORITY** (Limb B) |
| Execution of the Gate C subset measurements Q1–Q4/Q9–Q11 **as QE-11 evidence** | **PROPOSED AUTHORITY** (Limb B §5.2(8)) — PA to confirm the re-issued grant; Q1 records-only |
| Direct `DurablePortfolioStore` calls in a disposable harness | **SUPPORTING EVIDENCE ONLY, SUBJECT TO D-4** — never admitted IPC/HTTP writes, route qualification or a W-1 lift; insufficient alone for QE-4/QE-10 real-process obligations |
| Any qualification-mode write enablement, environment flag or W-1 override | **NOT AUTHORIZED BY THIS PROPOSAL** — no such current mechanism exists; affected QE items stop unless PA expressly renders a fence-preserving mechanism |
| Runtime installation/switch or acceptance of Node 24 as Gate 3's required runtime | **NOT AUTHORIZED** — Node `>=22.13.0 <23` preflight; non-compliance stops execution |
| Records-only tracker/index registration of this proposal and its non-effective status | **PERMITTED DOCUMENTATION, NOT GATE AUTHORITY** — no PA decision or execution status is inferred |
| **Gate C acceptance / Gate C result acceptance** | **NOT AUTHORIZED** — separate act |
| **Gate 4 result acceptance** (W-1(3) closure) | **NOT AUTHORIZED** — separate act |
| **Gate 5 admission / `CV-52` / any HTTP `503` route-fence lift or removal** | **NOT AUTHORIZED** — separate act naming qualified commits |
| **Production eligibility / release readiness / certification** | **NOT AUTHORIZED** |
| **`durable:true` claim** (UI, documentation, tracker, evidence, release note) | **PROHIBITED** until the Gate 4 result-acceptance act (act §8.4) |
| **Gate A′ execution** (P-1 provisioning) | **NOT AUTHORIZED here** — remains `APPROVED — NOT EXECUTED`, separate act (prerequisite for Limb B) |
| **Gate A′ or any unrelated admission decision (incl. IPD Draft PR #42, P11, Row 26)** | **NOT AUTHORIZED** |
| Implementation of the wrapper repair **during the preparation of this proposal** | **NOT DONE — prohibited** (stop boundary) |
| Execution of QE-1…QE-11 **during the preparation of this proposal** | **NOT DONE — prohibited** (stop boundary) |
| Unrelated implementation or architectural expansion: test-runner refactoring, IPC changes, connection-slot lifecycle changes, CI matrix changes, dependency changes, fence changes, W-1 weakening | **NOT AUTHORIZED** |
| Modification or supersession of the effective Gate 3 act, `G3-AMEND-01`, or the Gate 3 acceptance record | **NOT AUTHORIZED / NOT DONE** — preserved byte-identical |
| Any tracker/record statement that Gate 4 is authorized or started | **NOT AUTHORIZED** — Gate 4 stays `NOT AUTHORIZED / NOT STARTED` until §9 |

## 9. Effectiveness rule (PA determination required)

1. This act becomes effective **only** upon an express Program Authority determination that adopts it
   (in whole or with recorded changes), assigns its Act ID, and confirms or revises the pinned baselines
   and the `[P]`/`[GAP]` items flagged in the QE matrix and the evidence packet — recorded as a distinct
   PA decision instrument in the established form. Q1 and the standing preparation/publication grant do
   **not** supply this specific Gate 4 execution or runner-modification decision.
2. **Publication or merge of this proposal confers no effectiveness.** A merged proposal is a published
   proposal. No tracker row, CI run, commit, or PR may be cited as making it effective.
3. Until effective: no repair, no QE execution, no QE result/evidence-of-execution claims and no gate
   status movement. Records-only registration of the proposal is permitted and must continue to report
   **Gate 4 `NOT AUTHORIZED / NOT STARTED`**.
4. If adopted with changes, the rendered act governs; this proposal remains the historical statement of
   what was put to the Program Authority (the D-GC pattern: proposal preserved, not rewritten).

## 10. Verification index (this preparation)

| ID | Check | Result |
|---|---|---|
| G4-V1 | IPD live `main` = `1cceacfff40f22dbc9cd64906bf26a5feac1075e` (matches reported baseline); only CI run at that SHA is `39765365164` `success` | **Verified** §2.1 |
| G4-V2 | Revision-2 IRR live `main` = `4f472283cd6bbedb228d06bfb9a766688c039976` (tree `137a1b92…`); PR #190 compare = four Markdown paths only; PR-head CI `39781892060` and post-merge CI `39782159580` green. Earlier `5a3410ea…` → `04394f3…` documentation drift retained | **Verified** §§2.1–2.3 |
| G4-V3 | Gate E §4 QE-1…QE-11 table re-read at IPD `main` (blob `4a9501bf…`); G2-D3 (b) re-read (blob `0a538659…`); L-IPC-1 §10 Q1–Q11 re-read (accepted `cab04b6f…` == current `fc8d1cbc…` for §10); D-GC/H-1…H-13 re-read (blob `9befe6d8…`) | **Verified** — matrix |
| G4-V4 | Wrapper defect located at `scripts/run-tests.mjs` lines 111–112/126 (blob `fe1ab1a3…`, SHA-256 `a677c7da…`); no test exists for the wrapper today (60 `tests/*.test.ts`, none covering it) | **Verified** §4.1 |
| G4-V5 | Gate 3 acceptance record + G3 act + `G3-AMEND-01` blobs/SHA-256 re-hashed and byte-identical; fence blobs `cb8db45d…`/`51704c12…`/`98147054…` recorded unchanged at the current IRR documentation basis | **Verified** §7 |
| G4-V6 | Non-grant scan: no language in this document authorizes Gate C acceptance, Gate 4 result acceptance, Gate 5/`CV-52`, production eligibility, `durable:true`, or any `503` lift; the Windows canonical `npm test` is not relabelled; the direct-TAP run is not promoted | **Verified** §3, §8 |
| G4-V7 | No implementation performed; no QE executed; working-tree changes are documentation-only | **Verified** |
| G4-V8 | Current `evaluatePortSaveGuard()` is hard-coded false for W-1(3)/(4); dispatch refuses all four writes before mutation; T-G durable-write tests call `DurablePortfolioStore` directly. Proposal therefore bars admitted-write claims and stops affected QE items absent D-4 | **Verified from current source** §5.2(9) |
| G4-V9 | Gate 3 §8.3 requires Node major 22/minimum 22.13.0; historical Gate A′ host record says Node `v24.14.0`. Revision 2 makes native re-measurement and `>=22.13.0 <23` a preflight/stop, with no runtime amendment | **Verified from records; host not re-measured by Arena** §5.2(3) |
| G4-V10 | D-GC §7 marks Q1 `AUTHORIZED — records only`; §11 orders Q11-before/after and requires separate acceptance; Q5–Q8 remain deferred | **Verified** §5.2(8) |
| G4-V11 | Fresh census found no `CV-CORR-60`, `§16.79`, `V241`, `CHG-2026-10-22-11` or revision-2 record-ID collisions; exact optional helper/test paths are absent at IPD `main` | **Verified; allocation is records-only, not an Act-ID assignment** |

*End of the proposed Gate 4 Target-Host Qualification Authority Act. **PROPOSED — NOT EFFECTIVE. Gate 4 remains `NOT AUTHORIZED / NOT STARTED`** until a Program Authority determination under §9.*
