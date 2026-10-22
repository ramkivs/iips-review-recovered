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

| Field | Value |
|---|---|
| **Act ID** | **`PENDING ASSIGNMENT`** — PA to assign at determination (working file designation only, non-authoritative: `IIPS-V3-G4-QUALIFICATION-AUTHORITY-ACT-PREPARED-2026-10-22-01`) |
| **Act type** | Proposed Gate 4 target-host qualification authority — cross-repository, bounded, fail-closed: (A) Windows canonical test-wrapper summary-parser remediation; (B) operator execution-and-recording authority for QE-1…QE-11 |
| **Status** | **PROPOSED — NOT EFFECTIVE** — no authority granted |
| **Prepared date** | `2026-10-22` (UTC) |
| **Prepared by** | Arena Agent Mode (preparation, verification, publication only — renders no decision) |
| **Deciding authority required** | **Ramki — Program Authority** (single owner/user; cross-repository capacity). See the PA determination checklist in the evidence packet. |
| **Governing predecessors (all preserved, none modified)** | Gate 3 act `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` (blob `4744e6f44e0caea55e980756aeef90a5046ec87e`, SHA-256 `f4992f9ced681ffddd0d8eaf1f3de297f2262f1eb0b3131ce18b95805725abf5`, 51,662 B, **EFFECTIVE**); `G3-AMEND-01` `IIPS-V3-G3-AMEND-01-2026-10-22-01` (blob `85ba78e6cbfe20ed146a53abbfa23a3350140fcf`, SHA-256 `cf6d72b50908c6859d7079b7c7197c88e9d4ed0b6a90813a0b304fcbbd65926a`, 47,104 B, **EFFECTIVE**); Gate 3 acceptance `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` (blob `f3a6c9a3d15985a78a0945ecfc96019b3a5c425a`, SHA-256 `e1433fac9c1d9d2467409c8c3320c8a49eff6f86f6321a144200a96c679a2e40`, 41,277 B — **`ACCEPTED — BOUNDED GATE 3 IMPLEMENTATION SCOPE ONLY`**) |
| **Qualification-definition source** | Gate E write policy rev 1 §4 (`IIPS-V3-G2-GATE-E-PORTFOLIO-WRITE-POLICY-2026-10-18-01`, blob `4a9501bffb49abbbc0ba5b5c4f81d2841812913e`), read with L-IPC-1 §10 (`cab04b6f…`), D-GC (`IIPS-V3-G2-IPD-GATE-C-QUALIFICATION-AUTHORITY-2026-10-17-01`, blob `9befe6d8…`) and G2-D3 option (b). Reproduced in `IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md`. |
| **IPD implementation basis (pinned)** | `ramkivs/iips-production-market-data` `refs/heads/main` @ **`1cceacfff40f22dbc9cd64906bf26a5feac1075e`** (root tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`) — the Gate 3 accepted commit; verified live at preparation (§2) |
| **IRR rendering basis (pinned)** | `ramkivs/iips-review-recovered` `refs/heads/main` @ **`04394f3ffa88da8a72cb6b9d01f668d9d2650e6f`** (verified live at preparation; drift from the reported baseline `5a3410eab1a627e56642e82d93fcb875026a3334` recorded at §2.2 — documentation-only) |
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
| IRR `ramkivs/iips-review-recovered` | `refs/heads/main` | `5a3410eab1a627e56642e82d93fcb875026a3334` | **`04394f3ffa88da8a72cb6b9d01f668d9d2650e6f`** (pass-start check returned `5a3410e…` exactly; the ref advanced during this pass) | `git ls-remote`; unshallowed fetch; `git log`; diff audit | **Advanced** — see §2.2 |

CI state: IPD `main@1cceacff…` push CI **`39765365164`** `success` (`784` executed / `783` passed / `0` failed). IRR `main` push CI **`39779378820`** `success` (at `04394f3…`); IRR CI `39771867868` `success` (at `5a3410e…`).

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

**Baseline conclusion.** IPD pin stands unchanged at `1cceacfff40f22dbc9cd64906bf26a5feac1075e`. For IRR, the proposed act **does not re-pin the Gate 3 accepted baseline** (that record stands as written); this act's **rendering basis** is the current tip `04394f3ffa88da8a72cb6b9d01f668d9d2650e6f`, and the IRR commit at which any later QE run executes must be designated at act effectiveness and recorded at run start (§5.2). No drift undermines the pins; the movement is recordkeeping-only and is recorded, not substituted.

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
| Sources | Native-Windows evidence record `IIPS_v3.0_G3_NATIVE_WINDOWS_EVIDENCE_AND_ACCEPTANCE_ELIGIBILITY_2026-10-22.md` §1.2/§3 (blob `4ffbfd97…` + `Q3-A` pointer); `G3-AMEND-01` §6.2 channel 2; Gate 3 acceptance §5 channel 2; tracker §16.78.4 (*"repair deferred to a separate PA act within Gate 4"*) |

**The current Windows canonical `npm test` wrapper failure remains a failure.** Nothing in this act
relables the supplemental direct-TAP run (channel 3) or any other channel as a passing canonical run.

### 4.2 Smallest appropriate repair (proposed boundary)

If this act is made effective, Limb A authorizes **exactly**:

| # | Path | Permitted change |
|---|---|---|
| 1 | `scripts/run-tests.mjs` | **Summary-parsing region only** (the output normalization and the two summary matches at lines 111–112/126, plus the adjacent header comment): make the count extraction tolerant of (a) CRLF/CR line endings in the combined runner output and (b) the two known `node --test` summary formats (`# tests N` / `# pass N` TAP style, and `ℹ tests N` / `ℹ pass N` spec style), **while preserving fail-closed semantics exactly**: no count found ⇒ fail (CV-35); zero tests ⇒ fail; runner non-zero ⇒ propagate exit status; success ⇒ `[test-guard] OK — <n> test(s) executed, <p> passed, exit 0`. All discovery, missing/stale-compiled-test guards, messages and exit behaviour otherwise remain unchanged |
| 2 | `tests/g4_run_tests_summary_parsing.test.ts` (**new**; name is a delegated design fix `[D]`, not pre-existing) | Tests covering the relevant TAP summary formats and exit-status handling: LF and CRLF variants of `# tests N`/`# pass N`; spec-style `ℹ tests N`/`ℹ pass N` (LF/CRLF); missing-summary ⇒ non-zero; zero-tests ⇒ non-zero; runner-failure exit propagation; success-path `OK` line |
| 3 (contingent) | At most **one** helper module under `scripts/` (e.g. `scripts/lib/…`) **only if** implementation requires extracting the pure summary-parse function to make it testable without spawning the wrapper recursively | Marked **anticipated, not confirmed**. If implementation needs any file beyond items 1–3, the work **stops** and reports back under §4.4 — no latitude exists for a fourth change class |

**Explicitly not authorized under Limb A:** any test-runner redesign or replacement; any change to
`package.json` (scripts/deps/engines/exports), `package-lock.json`, `tsconfig.json`,
`.github/workflows/ci.yml`, `vite.config.ts`, `src/**`, any existing `tests/*` file, IRR files, the
CV-35/CV-42 guard semantics, or the discovery/staleness logic; any CI matrix addition (in particular
**no Windows CI leg** — `Q2-A` froze `ci.yml` at `aeee464feb76e2d1e9d104e1cae4e5dde37700ad`); IPC,
connection-slot, persistence, or lifecycle changes; anything in Gate 3's accepted manifests.

### 4.3 Validation obligations for Limb A (proposed)

From IPD root at the remediation commit: `npm ci --no-audit --no-fund` → `npx tsc --noEmit` →
`npm run build` → `npm test` (full guarded suite; executed count must be **≥ the current 784** plus the
new tests, `# fail 0`, `[test-guard] OK`); the new test file must appear in the executed set. On the
**target host**, the canonical `npm test` must be re-run and must report `[test-guard] OK — <n> test(s)
executed, <p> passed, exit 0` with non-zero `n` — that run is channel-2 evidence for the remediation
(§3) and is still **not** QE evidence. Hosted `ubuntu-latest` CI must stay green (channel 1).

### 4.4 Fail-closed rule for Limb A

If the remediation cannot be completed within §4.2's boundary (e.g. a fourth file is required, or the
fix would alter guard semantics), the work **stops**, records the exact blocker, and escalates to PA
for an amended scope. No approximation, no substitution, no weakening of the CV-35 zero-test guard.

## 5. Limb B — QE-1…QE-11 execution and recording authority (proposed scope)

### 5.1 What would be authorized

If effective, Limb B authorizes **the operator** (Ramki, on the target host `desktop-no0nhtp`) to
**execute and record** the qualification items **QE-1 through QE-11** exactly as defined by the
governing record (Gate E §4 with its mappings; L-IPC-1 §10 for the QE-11 subset; G2-D3 option (b) for
QE-4), following the field matrix prepared at
`docs/integration/IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md` — measurement and
recording only.

### 5.2 Execution constraints (proposed)

1. **Location:** native target host only (`desktop-no0nhtp`); POSIX/CI evidence is non-qualifying (D-GC-F).
2. **Timing:** after Gate A′ provisioning execution (Gate E §4) and after Limb A has merged and the
   canonical wrapper passes on the target host (proposed sequencing; PA to confirm — checklist item).
3. **Digests:** every item runs against **recorded digests** of the qualified IPD build (descendant of
   `1cceacfff40f22dbc9cd64906bf26a5feac1075e` carrying the Limb A commit) and the designated IRR
   consumer commit (descendant of `04394f3ffa88da8a72cb6b9d01f668d9d2650e6f`); digests recorded at run
   start and end (QE-11/H-12 drift rule: any drift ⇒ run invalid).
4. **Raw output published** to the designated evidence deposit (proposed: IRR
   `evidence/integration/gate-4-target-host-qualification-<date>/` with a SHA-256 manifest — PA to fix).
5. **QE-11 boundary:** Limb B covers the **execution and recording** of the Q1–Q4/Q9–Q11 measurements
   as QE-11's evidence, including the mandatory **C5.1/Q9 zero-bytes** probe. It does **not** accept
   those results: Gate C **acceptance** remains a separate act (§8), and QE-11's *"and accepted"* limb
   closes only under that separate act. The act, if effective, re-issues the seven-item **execution**
   grant against the current qualified commits (the historical D-GC grant names `cec70802…`, now
   reference-only per G3-D5) — this re-issuance is **`[P]`** and is a PA determination item.
6. **Write-path items (QE-2…QE-9):** execution is subject to the unresolved W-1 qualification-mechanism
   determination (matrix §1 gap G-1). No item may be executed in a manner that weakens W-1, the
   `WRITE_NOT_AUTHORIZED` default, or any fence in the operational configuration.
7. **No result acceptance, no admission, no claims.** A completed run produces a **Gate 4 execution
   record** only. Gate 4 *result acceptance* is a separate act (Gate E W-1(3)); nothing in a run, a
   commit, a CI run, or a merged PR may be cited as acceptance.

## 6. Commit and publication workflow (proposed; explicitly identified)

### 6.1 Limb A (implementation) — target branch: IPD `refs/heads/main`

1. Branch from IPD `main` at `1cceacfff40f22dbc9cd64906bf26a5feac1075e` (or its PA-confirmed successor).
2. Implement exactly §4.2; commit narrowly (wrapper remediation + tests, nothing else; diff-stat proof:
   only the §4.2 paths).
3. Open an IPD pull request into **`ramkivs/iips-production-market-data` `refs/heads/main`** (merge
   commit form, `--merge`; no squash/rebase/force; no direct-to-main commits).
4. Required remote verification: PR-head CI (`typecheck · build · test` + `executed test count`) green
   with non-zero counts and zero failures; post-merge `main` **push** CI green; `git ls-remote` agreement
   with the merge SHA; blob/SHA-256 read-back of `scripts/run-tests.mjs` and the new test file at
   `main`; diff-stat proof that no non-§4.2 path changed; native-Windows canonical `npm test` re-run
   recorded on the target host (channel 2).
5. Record the exact merge commit, CI run IDs, counts, and read-back digests in the evidence deposit.

### 6.2 Limb B (execution record) — target branch: IRR `refs/heads/main`

1. Operator executes QE-1…QE-11 on the target host per §5.2.
2. Deposit raw output + SHA-256 manifest under the designated IRR evidence path (§5.2(4)).
3. Publish an execution record to `ramkivs/iips-review-recovered` `refs/heads/main` through the IRR PR
   workflow (PR-head CI green; post-merge `main` push CI green; `git ls-remote` agreement; remote
   SHA-256 read-back), stating exact digests, commands, per-item PASS/FAIL/INCONCLUSIVE, and the §8
   non-grants.

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
- Gate A′ remains `APPROVED — NOT EXECUTED` (P-1 separate); Limb B does not execute Gate A′.
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
| Execution of the Gate C subset measurements Q1–Q4/Q9–Q11 **as QE-11 evidence** | **PROPOSED AUTHORITY** (Limb B §5.2(5)) — PA to confirm the re-issued grant |
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
   PA decision instrument in the established form.
2. **Publication or merge of this proposal confers no effectiveness.** A merged proposal is a published
   proposal. No tracker row, CI run, commit, or PR may be cited as making it effective.
3. Until effective: no repair, no QE execution, no evidence claims, no status movement. The tracker and
   every record continue to report **Gate 4 `NOT AUTHORIZED / NOT STARTED`**.
4. If adopted with changes, the rendered act governs; this proposal remains the historical statement of
   what was put to the Program Authority (the D-GC pattern: proposal preserved, not rewritten).

## 10. Verification index (this preparation)

| ID | Check | Result |
|---|---|---|
| G4-V1 | IPD live `main` = `1cceacfff40f22dbc9cd64906bf26a5feac1075e` (matches reported baseline); only CI run at that SHA is `39765365164` `success` | **Verified** §2.1 |
| G4-V2 | IRR live `main` = `04394f3ffa88da8a72cb6b9d01f668d9d2650e6f`; drift from reported `5a3410ea…` inspected (4 commits, 2 docs-only paths) and recorded | **Verified** §2.2 |
| G4-V3 | Gate E §4 QE-1…QE-11 table re-read at IPD `main` (blob `4a9501bf…`); G2-D3 (b) re-read (blob `0a538659…`); L-IPC-1 §10 Q1–Q11 re-read (accepted `cab04b6f…` == current `fc8d1cbc…` for §10); D-GC/H-1…H-13 re-read (blob `9befe6d8…`) | **Verified** — matrix |
| G4-V4 | Wrapper defect located at `scripts/run-tests.mjs` lines 111–112/126 (blob `fe1ab1a3…`, SHA-256 `a677c7da…`); no test exists for the wrapper today (60 `tests/*.test.ts`, none covering it) | **Verified** §4.1 |
| G4-V5 | Gate 3 acceptance record + G3 act + `G3-AMEND-01` blobs/SHA-256 re-hashed and byte-identical; fence blobs `cb8db45d…`/`51704c12…`/`98147054…` recorded unchanged at `04394f3…` (tracker §16.78 re-verification `AC-1`…`AC-8` all PASS) | **Verified** §7 |
| G4-V6 | Non-grant scan: no language in this document authorizes Gate C acceptance, Gate 4 result acceptance, Gate 5/`CV-52`, production eligibility, `durable:true`, or any `503` lift; the Windows canonical `npm test` is not relabelled; the direct-TAP run is not promoted | **Verified** §3, §8 |
| G4-V7 | No implementation performed; no QE executed; working tree contains documentation-only additions for this proposal | **Verified** |

*End of the proposed Gate 4 Target-Host Qualification Authority Act. **PROPOSED — NOT EFFECTIVE. Gate 4 remains `NOT AUTHORIZED / NOT STARTED`** until a Program Authority determination under §9.*
