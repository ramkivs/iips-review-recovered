# CAP-03 — S2 reconciliation, identity-value correction, and dependency status — 2026-10-28

> **Record type:** IRR reconciliation record (DOC). It records what the existing evidence does and does not establish at the current Gate 4 designated pin. It makes **no** Program Authority decision, adopts nothing, accepts nothing, and executes nothing.
> **Status of this record:** this pass verified the S2 evidence against the git object model and the IPD source; it did not run S2, P-1, A6, PF preflight, PowerShell, store probes, host capture, or any IPD write.
> **Governing references:** PA designation record pass 2 §4.6 step 5 and row 5; PA rulings record pass 2 Q-S2-1 and Q-S2-2; S2 acceptance record `8eee2957`; tracker §16.132–§16.138, §16.172, §16.177 (`CV-CORR-157`).

## 0. Baseline (verified this pass)

| Object | Identity | Source |
|---|---|---|
| IRR `main` | `82b3f4a5d31134e40fd3a1a23169a0ca8d638dfc` | `git ls-remote` |
| IRR branch before this pass's edits | `2dc54fd4` (open PR #353, not merged) | `git log`, remote read-back |
| IPD `main` | `b9dd6fce48fafba8ca6095debefb62fd54234f85` | `/tmp/ipd-s2` read-only clone |
| S2 run content (2026-10-26) | `8eec74ae27cda09f3c368b9c299895eae41554db`, tree `4eba29029f8d95cfe483e615a7047426b298ce50`, plus the recorded patches in §1.2 | checkout verification; launch-fix record |
| S2 candidate commit (`CV-CORR-112` basis) | `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, tree `399fa44a5f1953c0f61b452420fefb5985426ef1` (committed 2026-10-26 15:32 IST) | IPD git |
| **Designated Gate 4 pin** (designation record pass 2, `G4P-1`) | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (committed 2026-10-28 11:18 IST), tree `76f083d7058e170d8212455c03bad1033136ee68` | IPD git |
| S1 binding commit (identity values) | `f9ec0c5` — ancestor of both `b9dd6fce` and `a891802e` | IPD git `merge-base --is-ancestor` |

Ancestry is linear for the relevant chain: `8eec74ae` → `001c3c80` → `a891802e`, and `001c3c80` → `a891802e` changes exactly two non-evidence files (see §1.3).

## 1. S2 reconciliation

### 1.1 Run inventory (what each transcript establishes)

| Run | Content basis | Result | Status for the designated pin |
|---|---|---|---|
| `s2-04-guarded-npm-test.txt` | `8eec74ae`, unpatched | `924 executed / 919 pass / 1 fail / 4 skipped`; fail: `CAP-02 Increment A — T-PKG-4` (built entry point loads and exposes public names) | Historical failure, preserved. Superseded by the fix run. |
| `s2-fix-05-guarded-npm-test.txt` | `8eec74ae` + test-file patch `ecbc365` only; script unpatched | `924 / 920 pass / 0 fail / 4 skipped`; guard `OK` | Candidate-scoped evidence only. Not a pin run. |
| `s2-npm-launch-fix-suite-20261026T095613Z.txt` (SHA `C5DDFFA2…`) | `8eec74ae` + script patch `e556afde` and test patch `ecbc365` (§1.2) | `924 / 920 pass / 0 fail / 4 skipped` | Candidate-scoped evidence for `001c3c80` content (§1.2). Not a pin run. |
| Designated pin `a891802e` | Not run | — | **Required, not performed** (§1.4). |

Skip inventory: the four skipped tests are POSIX-only (`s2-fix-05`, lines 2912, 2918, 3062, 3068). The Windows-only named-pipe tests report `ok` and are not skipped (§1.5).

### 1.2 Content equivalence of the 2026-10-26 passing run to `001c3c80` (verified by reconstruction)

- The launch-fix record (`s2-npm-launch-fix-20261026T095613Z.txt`) records base `8eec74ae` and its script diff, index `f490ce6..e556afd`. Applying that diff to `8eec74ae` in a temporary index yields script blob `e556afde`, which is the committed `scripts/verify-public-package.mjs` at `a891802e` and `001c3c80`.
- The candidate-publish record (`s2-candidate-publish-20261026T100148Z.txt` lines 70 et seq.) records the test diff, index `c6c38d4..ecbc365`. Applying it to `8eec74ae` yields blob `ecbc365d`, which is the committed `tests/portfolio_ui_package.test.ts`.
- Applying both recorded diffs to `8eec74ae` yields tree `399fa44a5f1953c0f61b452420fefb5985426ef1`, identical to `001c3c80`'s tree (zero-line tree diff).
- **Timing caveat:** the launch-fix suite ran at `2026-10-26T09:56:13Z`; the commit `001c3c80` was created at `10:02Z` (author timestamp 15:32 IST). The tracker's wording "PASS at `001c3c80`" therefore means "at the content later committed as `001c3c80`". The transcripts themselves carry no tree hash; equivalence rests on the recorded diffs above.
- The `fix-05` run did not apply the script patch. Its content is therefore not byte-equal to `399fa44a`; it is cited only as corroboration.

### 1.3 What differs between the tested content and the designated pin

| Path | `001c3c80` blob | `a891802e` blob | Effect on S2 |
|---|---|---|---|
| `scripts/verify-public-package.mjs` | `e556afde` | `e556afde` | none (already in the tested content) |
| `tests/portfolio_ui_package.test.ts` | `ecbc365d` | `ecbc365d` | none (already in the tested content) |
| `src/persistence/gateAPrimeProvisioning.ts` | `2cbce83f` | `5f49936b` | **new production content, executed by the S2 guarded suite** |
| `tests/g3_gate_a_prime_successor_provisioning.test.ts` | `f2d0ab37` | `1f666216` | **new test content, executed by the S2 guarded suite** |

Relative to `8eec74ae`, the pin changes 64 paths in total; all non-evidence changes are the four files above. The two Gate A′ paths are the designated blobs in the designation record. The tested S2 content therefore is not the designated pin's content.

### 1.4 Decision: fresh native S2 at `a891802e` is required

- Designation record pass 2 §4.6 step 5 requires **"evidence at the designated commit: fresh S2 (L2a)"**; its status in that record is "NOT satisfied … not started".
- Q-S2-2 records route (c): an operator native Windows run, which must not start until the designated pin is fixed. The pin is fixed by the designation record pass 2 §1 (Designation A, ruling G4P-1: Gate 4 QE/H-12 content pin `a891802e`). The run is therefore **ELIGIBLE, NOT STARTED**. The P-1 coordinate (Designation B, §2) is separate and is "ruled; not yet effective for reliance".
- The 2026-10-26 transcripts remain valid as candidate-scoped S2 evidence (acceptance `8eee2957`; Q-S2-1). They do not discharge §4.6 step 5 because the pin adds production code and a test file that were never executed in those runs.
- This pass did not run S2. The sandbox is Linux and the designated host is not reachable from it; a Linux or CI run is not native-Windows evidence and is not substituted.

### 1.5 Real named-pipe coverage (answers the open question)

- **Yes, on a Windows host the named-pipe bind is exercised for real.** `tests/g3_no_network_listener.test.ts` `before` hook (lines 61–70) calls `listenIpc(...)`, which calls `server.listen(target.path)` (`src/ipc/endpoint.ts` line 315). The `windowsOnly` test "the Windows endpoint is a named pipe with no filesystem artifact" asserts `handle.server.address()` matches `\\.\pipe\…`. The transcript reports it as `ok 6`, not skipped.
- The bound name is **dynamic**: `iips-g3-nonet-${process.pid}` (test line 30). It is not the designated endpoint.
- The F7 `EADDRINUSE` tests (`tests/g3_startup_validation.test.ts` lines 235–260) use an injected server seam. A real pipe-name collision is **not** exercised.
- The transcripts have **no platform header**. Native-Windows execution is inferred from the skip pattern (exactly the four POSIX-only tests skipped; the `windowsOnly` tests run) and from the tracker's host identification. The host identity is not confirmed in the transcript itself.

### 1.6 Configuration source of the designated endpoint

- The endpoint is set by environment variable `IIPS_G2_IPC_ENDPOINT` (`src/ipc/endpoint.ts` line 25, `IPC_ENDPOINT_SETTING`). An absolute value is accepted only if it begins with `\\.\pipe\` (line 90); otherwise a name is placed under the state directory (line 117).
- The designated literal `\\.\pipe\iips-user-portfolio-v1` is recorded in `evidence/cross-repository/cap02_cap03_unified_reconciliation_2026-10-26/05-pf15-literal-integrity.txt` (`F2`, `IIPS_G2_IPC_ENDPOINT`, RENDERED). It is not hard-coded in `src/`, `scripts/`, `tests/`, or `frontend/` at `8eec74ae`.
- **Not covered by S2:** no test binds `\\.\pipe\iips-user-portfolio-v1`. The only designated-style literal in tests is `\\.\pipe\iips-ipd-user-portfolio-v1` (test lines 181–184), a pure acceptance check with a different name. The validator would accept the designated literal by prefix (inference from lines 90–93); that inference is not a test. Any claim that the designated name is verified needs its own native evidence.

### 1.7 Other S2 evidence points

- **Manifest count.** The operator-reported `47-entry PASS` is recorded as `reported_result = 47` in `01-user-reported-windows-manifest-verification.json`. The raw 47-entry output is not in the record (R-1, OPEN). The in-repository file `s2-evidence-manifest-verification.txt` reports `Manifest entries: 1148`, `Result: FAIL`; its findings are verifier parse artifacts (report header lines such as `UTC:` and `REPOSITORY:` parsed as manifest entries, and `dist` paths reported missing). Its own dist check reads `EXPECTED FILE COUNT: 1140`, `ACTUAL FILE COUNT: 1140`, `FILE COUNT MATCH: True`. This file does not establish a manifest failure, and it does not establish the 47-entry PASS either.
- **Baseline commit.** The checkout verification names expected commit `8eec74ae…` and tree `4eba2902…`, matching the IPD clone. The digest of `s2-checkout-verification.txt` still does not reproduce (R-2, OPEN; CRLF explains only the pin-file digest).

## 2. Identity-value correction (stale IRR statements corrected)

- **Current fact:** `PRINCIPAL_LABEL` = `ramki-personal-local`, `TENANT_ID` = `ipd-personal-local`, `CANONICAL_OWNER_ID` = `ipd-owner-ramki-personal` are **non-null** at `b9dd6fce` (IPD `main`) and at `a891802e` (the designated pin), in `src/persistence/gateAPrimeValidation.ts` lines 50–52. The S1 binding commit `f9ec0c5` is an ancestor of both. The values were determined by the PA's separate S1 identity-value determination (`IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01`, IPD `evidence/cross-repository/IIPS_V3_CAP02_S1_IDENTITY_VALUE_DETERMINATION_EFFECTIVE_2026-10-24.md`).
- **Stale IRR statements corrected by dated bracketed notes (no historical text rewritten):** `IIPS_v3.0_CAP03_IPD_A-Q5_RESULT_RECORD_2026-10-28.md` §3 (identity row) and §4 (scope sentence); `IIPS_v3.0_CAP03_IPD_S1_PUBLICATION_AND_DEPENDENCY_HANDOFF_2026-10-28.md` §3.11; tracker §16.177 is unchanged in text and superseded by §16.178 (`CV-CORR-158`).
- **What the correction does not do:** the S1 determination authorizes the binding commit only. **S1 provisioning execution remains NOT EXECUTED and BLOCKED** (successor act §8: designated Windows host; Node `>=22.13.0 <23`; non-existent P-1 store; no store, row, binding, membership or audit event exists). "S1 identified" and "S1 executed" remain separate statuses.

## 3. IPD durable-write status (item D) — unchanged, refusal preserved

- At `a891802e`, `evaluatePortSaveGuard()` in `src/persistence/portfolio_store.ts` (lines 209–216) returns hard-false with reasons `W-1(3): Gate 4 qualification not accepted` and `W-1(4): Gate 5 admission not accepted`. `WRITE_NOT_AUTHORIZED` is enforced before mutation (`src/ipc/dispatch.ts` line 229; `src/persistence/brokerImportPersistence.ts` line 333).
- Gate 4 qualification: not accepted. Gate 5 admission: not granted (IPD tracker, `b9dd6fce`).
- **No IPD write was made. No change is required.** Durable writes remain refused until Gate 4 and Gate 5 are accepted by their own instruments.

## 4. Dependency matrix (refreshed; S2 and identity rows changed)

Owner / type codes: DOC = IRR records; REPO = repository change; IPD = IPD repository change; OP = operator on the designated host; PA = Program Authority decision.

| # | Item | Status | Owner | Prerequisites | Parallelism | Next action | Closure evidence | Blocker | Type |
|---|---|---|---|---|---|---|---|---|---|
| 3.1 | S1 identification (governing text, identity values, binding commit) | **COMPLETE** (S1 determination effective; `f9ec0c5` on IPD `main`; PR #108 merged `b9dd6fce`) | — | — | — | None | Determination §13; `b9dd6fce`; `f9ec0c5` ancestry | None | DOC (done) |
| 3.2 | S1 provisioning execution | **BLOCKED** (NOT EXECUTED) | OP, then IPD receipt | Designated Windows host; Node `>=22.13.0 <23`; P-1 store absent; successor act §8 | After 3.3 and 3.4 | None until host and authority allow | Execution receipt in IPD (not yet) | Host prerequisite; P-1 not authorized | OP |
| 3.3 | Fresh native S2 (L2a) at `a891802e` | **ELIGIBLE, NOT STARTED** | OP (native Windows) | Designated pin fixed (done); operator host reachable; R-1 raw output supplied with the run | Parallel with 3.4 and 3.5 | Operator run on the designated host at `a891802e`; deposit raw transcript, tree hash `76f083d7`, and R-1 output | Transcript with platform header, tree and commit hashes, 0 fail, guard OK; deposited and read back | Host access (not verified from this sandbox) | OP |
| 3.4 | H-12 regeneration at `a891802e` (L2c) | **NOT ADOPTED AT THIS PIN** (R5 adopted at `8eec74ae`/`ba64b2d5` only); not started | PA (adoption), then IPD/IRR | Pin fixed; full validation | Parallel with 3.3 | PA adoption instrument for the pin, then regeneration | PA act at the pin; regenerated H-12 manifest validated | PA decision not rendered | PA then IPD/IRR |
| 3.5 | R-1 47-entry raw output | **OPEN** (user-reported PASS; raw output absent) | OP | Operator access to the Windows verification output | Parallel | Supply raw output with 3.3 | Raw output deposited, hashed, read back | Operator | OP |
| 3.6 | R-2 checkout-verification digest | **OPEN** (CRLF explains only the pin-file digest) | OP, then PA | Deposited copy at `0df30bc6`; archive original | Parallel | Re-hash original; PA confirms route | Digest reproduction or PA ruling | Operator original not supplied | OP then PA |
| 3.7 | D-INST (D-2 candidate) | **CANDIDATE only** — not parsed, not run, not adopted; A6 NOT RUN | PA, then OP | PA adoption; E10 | Parallel with 3.3 | PA adoption decision | PA act; then host run | PA decision not rendered | PA then OP |
| 3.8 | E10 / host capture preconditions | **NOT RENDERED** | PA | Host root `D:\cap03-p1-capture-20261028-01` existence not verified | — | PA rules E10 | E10 act and host read-back | PA; host access | PA then OP |
| 3.9 | P-1 (provisioning attempt) | **NOT EXECUTED / UNSPENT / NOT AUTHORIZED** (P-1-C NOT ESTABLISHED; P-1-D DESIGNATED, NOT VERIFIED) | PA, then OP | Matter A closed (done per handoff §3.10); fresh S2 at `a891802e` (3.3); H-12 at the pin (3.4); E10; host preconditions | Serial after 3.3, 3.4, 3.8 | None now | PA authorization; P-1 receipt | 3.3, 3.4, 3.8; authority | PA then OP |
| 3.10 | P-2 IPD-C2 | **PARTIAL** (B-Q1 ruled; separate IPD prompt not issued) | IPD (after PA question) | PA question on the remaining trigger | Parallel with 3.3 | Issue PA question | IPD prompt and receipt | PA question not rendered | IPD (after PA) |
| 3.11 | P-5 FRM-D1C | **UNTRIGGERED** | IPD (after PA authority) | Separate IPD authority | — | None | — | No authority recorded | IPD (after PA) |
| 3.12 | IPD durable-write (item D) | **REFUSED — preserved** (W-1(3), W-1(4) hard-false) | — | Gate 4 qualification accepted; Gate 5 admission granted | — | None in this pass | — | Gate 4 and Gate 5 not accepted or granted | — |
| 3.13 | Gate 4 QE-1…QE-11 | **0 of 11 executed**; DQ-4 `PREPARED AND VALIDATED — NOT ESTABLISHED (8/10)` (tracker §16.133, not changed here) | OP (host), PA (acceptance) | 3.3, 3.4, 3.9 as applicable | Largely serial | None now | QE receipts; DQ-4 criteria 7 and 8 met | Host; S2 L2a; H-12 | OP then PA |
| 3.14 | Gate 4 / Gate 5 / G14 | **NOT COMPLETE; NOT GRANTED** | PA | 3.3, 3.4, 3.13 and their own acts | — | None | PA acts | As above | PA |
| 3.15 | IRR reconciliation of S2 and identity status (route C) | **COMPLETE (this pass)** | DOC | — | — | None | This record; tracker §16.178; stale-statement notes | None | DOC (done) |
| 3.16 | PR #353 merge | **NOT AUTHORIZED** — stays OPEN and unmerged | — | Explicit authorization | — | None | — | No authorization | — |

## 5. Critical path (next steps)

1. **OP:** fresh native S2 at `a891802e` on the designated host, with platform header, tree and commit hashes, and R-1 raw output (3.3, 3.5). Parallel with item 2.
2. **PA:** H-12 adoption at the pin (3.4) and E10 / D-INST rulings (3.7, 3.8) — these are PA decisions and are not started.
3. **OP then IPD/IRR:** H-12 regeneration at `a891802e` (3.4), validated and deposited.
4. **PA:** P-1 authorization only after Matter A (met) and items 1 and 3 exist (3.9).
5. **OP:** P-1 and the host preconditions only under that authorization. Then QE-1…QE-11 (3.13), DQ-4 criteria 7 and 8, and the Gate 4 / Gate 5 / G14 instruments (3.14).

## 6. Integrity findings (this pass)

| ID | Finding | Disposition |
|---|---|---|
| F-S2-1 | The passing S2 content (`001c3c80` tree `399fa44a`) is not the designated pin (`a891802e` tree `76f083d7`). The pin adds two Gate A′ files executed by the suite. | Fresh S2 at the pin required (§1.4). Not a decision by this record. |
| F-S2-2 | The tracker's "PASS at `001c3c80`" is accurate only by reconstruction: the run (09:56Z) predates the commit (10:02Z), and the transcripts carry no tree hash. | Equivalence shown in §1.2. Recorded as a caveat. |
| F-S2-3 | The designated endpoint literal `\\.\pipe\iips-user-portfolio-v1` is not bound by any test. The test fixture uses `iips-ipd-user-portfolio-v1` (different name). | Not claimed as verified. Needs native evidence. |
| F-S2-4 | `s2-evidence-manifest-verification.txt` reads `1148 / FAIL`; the cause is verifier parsing of report header lines. The 47-entry PASS is user-reported; raw output absent (R-1). | Verifier defect noted; R-1 stays OPEN. |
| F-S2-5 | Transcripts carry no platform header; native-Windows status is inferred from skip patterns and the tracker's host identification. | Inference stated as inference. |
| F-ID-1 | IRR records stated identity constants `null` (A-Q5 §3, §4; handoff §3.11) after the binding commit made them non-null. | Corrected by dated notes (§2). |
| F-ST-1 | Tracker "Current S2 evidence-publication state" row reads "S2 execution COMPLETE", which describes the historical run and not the pin. | Dated correction prefixed to the row (`CV-CORR-158`). |

## 7. Execution boundaries (this pass)

- **Not executed:** S2 at any commit; P-1; host capture; A6; PF preflight; PowerShell; store probing; CAP; D-INST; any Gate 4 QE; any IPD write.
- **Not decided:** H-12 adoption; A-GAP1 and A-Q5 (preserved as executed, not reopened); D-INST; E10; P-2; P-5.
- **Not merged:** PR #353 stays OPEN.
- **Not declared:** Gate 4, Gate 5, G14, DQ-4 closure.
- **No CI or Linux run was used as native-Windows evidence.**
