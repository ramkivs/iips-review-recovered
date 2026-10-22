# IIPS v3.0 — Gate 4 Target-Host Qualification Evidence Packet (Prepared — Not Authority)

> ## STATUS: **PREPARED EVIDENCE PACKET — FOR PROGRAM AUTHORITY DETERMINATION — NOT AUTHORITY**
>
> - This packet supports the **proposed** Gate 4 Target-Host Qualification Authority Act
>   (`IIPS_v3.0_G4_TARGET_HOST_QUALIFICATION_AUTHORITY_ACT_PROPOSED_2026-10-22.md`, **`PROPOSED — NOT
>   EFFECTIVE`**). It records evidence, prerequisites, risks, unresolved decisions, and the exact
>   determinations the Program Authority must make. It grants nothing and accepts nothing.
> - **Gate 4 remains `NOT AUTHORIZED / NOT STARTED`.** The Windows canonical `npm test` wrapper failure
>   remains a **failure**. No QE item is executed or passed. No signature, approval, or PA decision is
>   asserted.

| Field | Value |
|---|---|
| **Document ID** | **`PENDING ASSIGNMENT`** (working file designation only, non-authoritative: `IIPS-V3-G4-EVIDENCE-PACKET-PREPARED-2026-10-22-01`) |
| **Document type** | Prepared evidence packet / decision input for a proposed Gate 4 authority act |
| **Prepared** | `2026-10-22` (UTC), by Arena Agent Mode (preparation/verification/publication only) |
| **Companion documents** | Proposed act (above); QE matrix `IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md` |
| **Publication location** | `ramkivs/iips-review-recovered` `docs/integration/` — the established review/proposal location (precedent: `IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_PROPOSED_2026-10-19.md`, `IIPS_v3.0_G3_AMEND_01_BASIS_DRIFT_AND_EVIDENCE_BOUNDARY_2026-10-22.md`), under the standing PA authorization (F-3 §1.2; `DEC-06` R-1/R-3/R-9) |

---

## 1. Purpose and authority boundary

Prepares, for PA determination, the two-limb Gate 4 proposal: (A) bounded remediation of the canonical
Windows test wrapper `scripts/run-tests.mjs` TAP-summary parsing defect; (B) operator authority to
execute and record QE-1…QE-11 on the designated target host. This packet:

- does **not** implement the repair, execute QE items, or accept any result;
- does **not** modify or supersede the effective Gate 3 act, `G3-AMEND-01`, or
  `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` (**`ACCEPTED — BOUNDED GATE 3 IMPLEMENTATION SCOPE ONLY`**);
- does **not** authorize Gate C acceptance, Gate 4 result acceptance, Gate 5/`CV-52`, production
  eligibility, `durable:true`, or any `503` lift.

## 2. Authoritative source references (independently re-read and re-hashed this pass)

| Source | Repository / path | Blob (SHA-1) | SHA-256 / size | Role |
|---|---|---|---|---|
| Gate E write policy rev 1 `IIPS-V3-G2-GATE-E-PORTFOLIO-WRITE-POLICY-2026-10-18-01` (ACCEPTED, G2-D2) | IPD `evidence/cross-repository/IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md` | `4a9501bffb49abbbc0ba5b5c4f81d2841812913e` | `6385345b98fe33dc294212b37592ff455589b7656aa42bf05fdb29e04c57e7cf`, 16,908 B | **QE-1…QE-11 definitions (§4)**; W-1…W-16 |
| L-IPC-1 rev 2 (accepted text) | IPD `evidence/np04/IIPS_v3.0_G2_IPD_LOCAL_PRINCIPAL_OS_IPC_SECURITY_CONTRACT_PROPOSAL_2026-10-16.md` | accepted `cab04b6f94618c9afad1440882ebf63437fdf6f8`; current `fc8d1cbc9ec96f4f93fce8afbbb659b044f6268f` | current `be56e6fd…`, 61,993 B (§10 table verified identical in both blobs) | Q1–Q11 definitions (QE-11 subset) |
| Gate C rendered decision `IIPS-V3-G2-IPD-GATE-C-QUALIFICATION-AUTHORITY-2026-10-17-01` (D-GC-A…I, H-1…H-13) | IPD `evidence/np04/IIPS_v3.0_G2_IPD_GATE_C_QUALIFICATION_AUTHORITY_DECISION_RENDERED_2026-10-17.md` | `9befe6d888f6205d8d3df6ed3d873b0c71ee6336` | `3e5a66b8678ee5fbf37a9fffdb05e19b382a66a7def3a49be41947993d4fae70`, 26,914 B | Seven-item subset grant + operational criteria (basis caveat: names `cec70802…`) |
| Gate 2 acceptance request (G2-D1…D5; G2-D3 = Q8 option (b)) | IPD `evidence/cross-repository/IIPS_V3_G2_GATE2_ACCEPTANCE_AUTHORITY_REQUEST_2026-10-18.md` | `0a53865959eaaa6a19f58c3026faecaedd572f0f` | `ef23a0e6…`, 19,676 B | QE-4 precondition |
| Gate 3 Implementation-Authority Act `…-2026-10-19-02` (**EFFECTIVE**) | IRR `docs/integration/IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_EFFECTIVE_2026-10-19-02.md` | `4744e6f44e0caea55e980756aeef90a5046ec87e` | `f4992f9ced681ffddd0d8eaf1f3de297f2262f1eb0b3131ce18b95805725abf5`, 51,662 B | Accepted implementation scope; §6 QE mapping; §8.3 host Node floor; §8.4 durability vocabulary; §11 downstream statuses |
| `G3-AMEND-01` `…-2026-10-22-01` (**EFFECTIVE**) | IRR `docs/integration/IIPS_v3.0_G3_AMEND_01_AMENDMENT_AND_PA_DETERMINATION_2026-10-22.md` | `85ba78e6cbfe20ed146a53abbfa23a3350140fcf` | `cf6d72b50908c6859d7079b7c7197c88e9d4ed0b6a90813a0b304fcbbd65926a`, 47,104 B | `Q1-B`/`Q2-A`/`Q3-A`; §6.4(1) wrapper repair deferred to a Gate 4 act |
| Gate 3 Acceptance Record `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` | IRR `docs/integration/IIPS_v3.0_G3_GATE3_ACCEPTANCE_RECORD_2026-10-22.md` | `f3a6c9a3d15985a78a0945ecfc96019b3a5c425a` | `e1433fac9c1d9d2467409c8c3320c8a49eff6f86f6321a144200a96c679a2e40`, 41,277 B | **Authoritative Gate 3 acceptance reference** |
| Native-Windows evidence record (`CV-CORR-55` §10 + `Q3-A` pointer) | IRR `docs/integration/IIPS_v3.0_G3_NATIVE_WINDOWS_EVIDENCE_AND_ACCEPTANCE_ELIGIBILITY_2026-10-22.md` | `4ffbfd97cafa64e5ad0f5a5d9ea090bfc74373f1` (as recorded in `G3-AMEND-01` §2) | 20,226 B (as recorded) | Windows wrapper failure + direct-TAP evidence |
| Master tracker / decision register (authoritative) | IRR `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | current at `04394f3…` (`a1b983f2…` at PR #188 era; re-read this pass) | — | §16.77/§16.78 Gate 3 acceptance + re-verification; Gate 4 outstanding-action rows |
| Wrapper under remediation | IPD `scripts/run-tests.mjs` | `fe1ab1a30d8cd0060b5fc50d181d6fcc735a3794` | `a677c7da5365b62af06d077eef6e6a6248267fbd1a53b28412135e3e20e0ecf2`, 4,974 B | Limb A target |
| Standing authorization (F-3 §1.2) | IRR `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` | `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` (as recorded) | — | Publication/recording authority basis |

## 3. Baseline SHAs (exact) and drift record

| Pin | Value | Status |
|---|---|---|
| IPD `main` (implementation basis) | **`1cceacfff40f22dbc9cd64906bf26a5feac1075e`** (tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`) | Reported baseline **verified live, zero drift** (`git ls-remote` + clone + CI `39765365164` `success`) |
| IRR `main` — reported baseline | `5a3410eab1a627e56642e82d93fcb875026a3334` | Verified live **at pass start** — exact match |
| IRR `main` — rendering basis | **`04394f3ffa88da8a72cb6b9d01f668d9d2650e6f`** | Remote advanced during the pass; drift = 4 documentation-only commits (PRs #188/#189: tracker §16.78/`CV-CORR-59` + receipt; `git diff --name-status` = 2 modified docs paths). **Recorded, not substituted**; proposed act §2.2 carries the full list |
| Gate 3 accepted IPD commit (unchanged) | `1cceacfff40f22dbc9cd64906bf26a5feac1075e` | Same as implementation basis |
| IRR commits for QE runs | **Designated at act effectiveness; recorded at run start** (descendants of the pins) | `[P]` — PA determination item |
| Wrapper blob at basis | `fe1ab1a30d8cd0060b5fc50d181d6fcc735a3794` | Verified |

## 4. Gate 3 acceptance reference and preserved determinations

- **Authoritative acceptance reference:** `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` —
  **`ACCEPTED — BOUNDED GATE 3 IMPLEMENTATION SCOPE ONLY`**, rendered under
  `IIPS-V3-G3-AMEND-01-2026-10-22-01` §§9–10 (`AC-1`…`AC-8`), effective on publication with green CI +
  remote read-back (tracker §16.77.4/§16.77.9). Re-verified 2026-10-22 (tracker §16.78 / `CV-CORR-59`):
  all eight `AC` conditions `PASS` at `IPD main@1cceacff…` / `IRR main@5a3410e…`.
- **Preserved verbatim:** the accepted IPD manifest (22 files) and IRR manifest; `SESSION_ONLY` /
  `durable:false`; the 29-key caller-authority guard; the W-1 write refusal; the `503` fences
  (`cb8db45d668d28cee7e0a52721001d579a872733`, `51704c12a467cd2f718a030b5036bc55c9afa73f`,
  `981470541812a64c733309f1debec75455d85bee`); `Q3-A`'s three-channel separation and the deferral of the
  wrapper repair to *"a separate PA act within Gate 4"* (`G3-AMEND-01` §6.4(1)) — which is exactly the
  act proposed here. Nothing in this packet changes any of it.

## 5. Known Windows wrapper failure evidence (channel 2 — preserved as FAILED)

| Fact | Detail | Source |
|---|---|---|
| What failed | Canonical Windows `npm test` (`node scripts/run-tests.mjs`) on the operator host, run against `3eb13ed…` + patch `5745647e…` (code blobs identical to `main@1cceacff…`: `8466c704…`, `ffbce918…`, `6ae6a2ac…`) | Acceptance record §5 channel 2 |
| How it failed | Test runner executed cleanly (**the suite itself passed**), then the summary regex `^# tests (\d+)$` failed against the Windows `node --test` summary output — recorded cause: Unicode `ℹ` summary marker and/or CRLF line endings (a `$`-anchored multiline regex fails before a trailing `\r`) — tripping the CV-35 guard *"the runner reported no test count — the result cannot be trusted"* → non-zero exit | `G3-AMEND-01` §6.2 ch.2; native-Windows record §1.2/§3 |
| Current standing | **`FAILED` (`NON-PASSING`) — remains a failure.** Never represented as passing; the supplemental direct-TAP run (`754 / 750 passed / 0 failed / 4 skipped (posixOnly)`, exit 0, operator-supplied) is **not** a canonical pass | `Q3-A` (effective); acceptance record §5 |
| Defect location (verified) | IPD `scripts/run-tests.mjs` lines 111–112 (`const reported = output.match(/^# tests (\d+)$/m)`) and 126 (`const passed = output.match(/^# pass (\d+)$/m)`); blob `fe1ab1a3…` | Direct inspection at `1cceacff…` |
| Existing coverage | **None.** The 60 `tests/*.test.ts` at `1cceacff…` contain no test of the wrapper's summary parsing or exit-status handling | Direct inspection |

## 6. Test and CI evidence inventory (channels kept distinct)

| Channel | Evidence | Standing |
|---|---|---|
| Hosted Linux CI | IPD `main@1cceacff…` push run `39765365164` `success` — `784` executed / `783` passed / `0` failed / `1` `windowsOnly` skip (jobs `119779358586`, `119779508517`); IRR `main` push runs `39779378820` (at `04394f3…`), `39771867868` (at `5a3410e…`) `success` | Gate 3 acceptance evidence (`Q3-A`); no Windows/host behaviour established |
| Native-Windows canonical `npm test` | **FAILED** (§5) | Failure preserved; Limb A is the remediation path; post-remediation host re-run is the acceptance evidence for the repair |
| Native-Windows direct TAP | `754 / 750 / 0 / 4`, exit 0 (operator-supplied; log `g3-connection-release-direct-tap-20261022-013113.log`) | Supplemental defect-remediation corroboration only |
| Target-host QE (channel 4) | **None exists** | Created only by authorized Limb B execution; closed only by separate result acceptance |
| Local POSIX reproduction | Recorded in acceptance record §5 (e.g. `784 / 783 / 0 / 1`) | Supplementary; never native-Windows or host evidence |

## 7. Prerequisites for Gate 4 execution (as established)

1. **This proposed act made effective** by PA determination (§9 of the act).
2. **Gate A′ provisioning executed** on the target host — Gate E §4 places the QE run *"after Gate A′
   provisioning"*; Gate A′ remains `APPROVED — NOT EXECUTED`, P-1 separate (act §11). **PA must confirm
   this ordering (checklist D-5).**
3. **Limb A merged** (wrapper remediation) and the canonical `npm test` observed passing on the target
   host (proposed sequencing so the canonical runner works for evidence capture — PA to confirm).
4. **Target host `desktop-no0nhtp`** available to the operator; host Node ≥ `22.13.0` and `node:sqlite`
   availability recorded (act §8.3 — QE-1 prerequisite).
5. **Recorded digests** of the qualified IPD and IRR builds (§5.2 of the act).
6. **Qualification write mechanism** resolved (§9 D-4) for write-path items.
7. **Evidence deposit destination fixed** (§9 D-8).

## 8. Risks

| # | Risk | Mitigation in the proposal |
|---|---|---|
| R-1 | `node:sqlite` is Stability 1.1 (experimental warning) — behaviour on the Windows host unverified | QE-1 prerequisite records host availability; risk carried from G3-D2, not reopened |
| R-2 | W-1 circularity: write-path QE items need successful writes while W-1(3)/(4) are false | Unresolved decision D-4; no item may weaken W-1 in operational configuration |
| R-3 | QE-11 "and accepted" limb cannot close in-execution → multi-act sequence risk (run → Gate C acceptance → Gate 4 result acceptance) | Sequencing made explicit (matrix gap G-3; act §5.2(5)) |
| R-4 | Wrapper fix could mask broader output-format drift or alter Linux behaviour | §4.2 narrows to the summary-parsing region; §4.3 keeps full-suite + hosted-CI regression obligations; §4.4 fail-closed stop |
| R-5 | Evidence line-ending ambiguity (LF blobs vs CRLF Windows working tree — acceptance record tracked both SHA-256s) | Evidence deposit must state LF/CRLF convention per artifact (checklist D-8) |
| R-6 | Operator-supplied evidence class (Arena cannot observe the host) | Recorded limitation; digest-anchored run records + PA acceptance act |
| R-7 | Parallel recordkeeping drift (remote `main` moved during this pass) | Drift recorded (act §2.2); pins are exact SHAs |
| R-8 | Destructive scenarios (QE-7) damaging operator data | Proposed disposable-fixture rule (matrix §1; D-GC-I extension) — PA to confirm (D-9) |

## 9. Unresolved decisions (PA determination required — no default assumed)

| # | Question | Options on the record |
|---|---|---|
| D-1 | Adopt this proposed act (whole / with changes / reject)? Assign its Act ID (currently PENDING) | — |
| D-2 | Confirm or revise the pinned baselines (IPD `1cceacff…`; IRR rendering `04394f3…`; designate the QE-run IRR commit) | — |
| D-3 | Confirm Limb A's exact boundary (`scripts/run-tests.mjs` + one `tests/g4_run_tests_summary_parsing.test.ts` + at most one `scripts/` helper) and the stop-and-escalate rule | Adopt as written / narrow / widen (widening needs justification) |
| **D-4** | **How do write-path QE items (QE-2…QE-9) execute while W-1(3)/(4) remain false?** | (a) bounded qualification-mode configuration on the host (W-1 evaluated as-if satisfied strictly inside the qualification run, non-production); (b) store-layer execution with the IPC write gate verified separately; (c) other — PA fixes the mechanism |
| D-5 | Sequencing: Gate A′ execution before QE run? Limb A before QE run? | Adopt Gate E §4 order ("after Gate A′ provisioning") + proposed Limb-A-first order / alternative |
| D-6 | QE-11 Gate C subset: re-issue the Q1–Q4/Q9–Q11 **execution** grant against the current qualified commits (the D-GC grant names `cec70802…`, now reference-only)? And confirm Gate C **acceptance** stays a separate act | Re-issue in this act / separate Gate C execution act |
| D-7 | H-12 digest set re-base for Q11: designate the exact qualified-surface file set (historical: 15 files + `package.json` + `tsconfig.json` for `cec70802…`; current manifest is 22 files + wrapper + …) | PA fixes the set |
| D-8 | Evidence artifact format + destination (proposed: IRR `evidence/integration/gate-4-target-host-qualification-<date>/` + SHA-256 manifest + LF/CRLF statement per artifact) | Adopt / replace |
| D-9 | Failure-handling rule (proposed: PASS/FAIL/INCONCLUSIVE per item at recorded digests; no relabeling; all attempts recorded; escalation to PA) + destructive-fixture rule | Adopt / replace |
| D-10 | Durability-vocabulary reading for QE-4 raw output (`durable:true` fields as measurement vs claim; act §8.4) | Adopt the proposed reading / replace |
| D-11 | Confirm executor identity/capacity (operator = Program Authority on `desktop-no0nhtp`; recording authority for the execution record) | — |
| D-12 | Whether a master-tracker note/section is authorized at act effectiveness (this preparation registered in the packet index only; the tracker was deliberately not modified — see §11) | Authorize tracker registration at effectiveness / index-only |

## 10. Verified vs. assumed vs. open

| Fact class | Items |
|---|---|
| **Independently verified this pass** | IPD and IRR live `main` refs + the drift audit; wrapper file/blob/SHA-256 and the exact defective lines; absence of wrapper tests; Gate E §4 / L-IPC-1 §10 / D-GC / G2-D3 source blobs and the byte-identity of the §10 table across blobs; Gate 3 acceptance + G3 act + `G3-AMEND-01` blobs/SHA-256/sizes; CI run states (IPD `39765365164`, IRR `39779378820`/`39771867868`); fence-blob standing per tracker §16.78; no pre-assigned Gate 4 act identifier exists in either repository (grep across both) |
| **Assumed / operator-supplied (not Arena-observed)** | The native-Windows wrapper failure cause (`ℹ`/CRLF) and the direct-TAP counts; host configuration; anything about `desktop-no0nhtp` beyond the recorded facts |
| **Open (see §9)** | D-1…D-12 — including the material W-1 qualification-mechanism question (D-4) and the QE-11 grant re-basis (D-6) |

## 11. Validation record of this packet (pre-publication)

| Check | Result |
|---|---|
| Both baseline SHAs re-confirmed at drafting; drift recorded (not substituted) | **PASS** — act §2 |
| Every cited governance artifact and QE definition exists at its authoritative location (blob reads in a full IPD clone at `1cceacff…` and in IRR at `04394f3…`) | **PASS** — §2 |
| Proposed scope conflicts with the effective Gate 3 act / `G3-AMEND-01`? | **NONE** — Limb A is the repair those instruments expressly deferred to a Gate 4 act; manifests, `Q2-A`, fences, W-1 all preserved (act §7) |
| Language scan: no accidental authorization of Gate C acceptance, Gate 4 result acceptance, Gate 5/`CV-52`, production eligibility, `durable:true`, or route-fence removal | **PASS** — act §8 non-grants matrix; status banners on all three documents |
| Windows canonical `npm test` kept recorded FAILED; direct-TAP not relabelled | **PASS** — act §3 |
| No implementation performed; no QE executed; no tracker modification | **PASS** — stop boundaries held |
| Document-structure checks + `git diff --check` on the publication diff | **PASS** (recorded at publication) |

## 12. PA determination checklist (the exact determinations required before effectiveness)

- [ ] **D-1** — Render the determination on the proposed act (adopt / adopt-with-changes / reject); assign the **Act ID**; record it in the established PA decision form. *(Nothing is effective until this is done.)*
- [ ] **D-2** — Confirm/revise pins: IPD `1cceacfff40f22dbc9cd64906bf26a5feac1075e`; IRR rendering `04394f3ffa88da8a72cb6b9d01f668d9d2650e6f`; designate the QE-run IRR commit rule.
- [ ] **D-3** — Confirm Limb A file boundary and the §4.4 stop-and-escalate rule.
- [ ] **D-4** — **Fix the write-path qualification mechanism** (W-1(3)/(4)=false vs QE-2…QE-9) — material; execution cannot proceed without it.
- [ ] **D-5** — Confirm sequencing (Gate A′ → Limb A → QE run) and the P-1 relationship.
- [ ] **D-6** — Confirm the QE-11 Gate C subset execution grant re-issue (and that Gate C **acceptance** remains separate).
- [ ] **D-7** — Designate the Q11/H-12 qualified-surface digest set for the current implementation.
- [ ] **D-8** — Fix the evidence artifact format, deposit destination, and LF/CRLF hash convention.
- [ ] **D-9** — Adopt or replace the failure-handling rule and the destructive-fixture rule.
- [ ] **D-10** — Adopt or replace the QE-4 durability-vocabulary reading (measurement vs claim).
- [ ] **D-11** — Confirm executor identity/capacity and recording authority for the execution record.
- [ ] **D-12** — Decide whether tracker registration is authorized at effectiveness (this preparation is registered in the packet index only).

*End of the Gate 4 evidence packet. Prepared for PA determination — **Gate 4 remains `NOT AUTHORIZED / NOT STARTED`**; the Windows canonical `npm test` wrapper failure remains a failure; no QE item is executed or accepted.*
