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
> - **Revision 2** reconciles the parallel PR #190 baseline, exact helper/test scope, all required parser
>   cases, the hard W-1 write fence, Node major 22 versus historical Node 24, Gate A′ provisioning, and
>   QE-11's records-only Q1 plus separate acceptance. It supplies no execution evidence.
> - **Revision 3 (this pass)** completes the packet after the D-1…D-12 determination-resolution pass:
>   every checklist item now carries its recommended resolution and pointer to the companion
>   determination packet (`IIPS_v3.0_G4_DETERMINATION_RESOLUTION_PACKET_D1_TO_D12_2026-10-22.md`,
>   record `IIPS-V3-G4-DETERMINATION-RESOLUTION-PACKET-2026-10-22-01`), the D-4 fence-preserving
>   mechanism is defined (act §5.5), and the D-7/D-8/D-9/D-10 resolutions are folded into the act.
>   It supplies no PA decision and no execution evidence.

| Field | Value |
|---|---|
| **Document ID** | `IIPS-V3-G4-EVIDENCE-PACKET-PREPARED-2026-10-22-03` — prepared-record identifier allocated after a fresh collision census (revision-2 ID `…-02` preserved in history); **not an effective-act ID** |
| **Document type** | Prepared evidence packet / decision input for a proposed Gate 4 authority act — **final proposal revision 3** (D-1…D-12 resolved in the companion determination packet) |
| **Prepared** | `2026-10-22` (UTC), by Arena Agent Mode (preparation/verification/publication only) |
| **Companion documents** | Proposed act (above), prepared proposal record `IIPS-V3-G4-QUALIFICATION-AUTHORITY-PROPOSAL-2026-10-22-03` (Act ID remains `PENDING ASSIGNMENT` — proposed: `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01`); QE matrix `IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md`, prepared record `IIPS-V3-G4-QE-MATRIX-PREPARED-2026-10-22-03`; **determination packet `IIPS_v3.0_G4_DETERMINATION_RESOLUTION_PACKET_D1_TO_D12_2026-10-22.md`**, record `IIPS-V3-G4-DETERMINATION-RESOLUTION-PACKET-2026-10-22-01` (D-1…D-12 resolutions + PA decision sheet §6) |
| **Publication location** | `ramkivs/iips-review-recovered` `docs/integration/` — the established review/proposal location, under the standing preparation/publication grant (F-3 §1.2) and Q1's evidence-work authorization. Q1 §2 excludes Gate 4 execution; `G3-AMEND-01` §6.4 independently requires the later, separate Gate 4 PA act. `DEC-06`'s specific P11 admission determination is not reused as Gate 4 authority |

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
| Native-Windows evidence record (`CV-CORR-55` §10 + additive `Q3-A`/acceptance pointers) | IRR `docs/integration/IIPS_v3.0_G3_NATIVE_WINDOWS_EVIDENCE_AND_ACCEPTANCE_ELIGIBILITY_2026-10-22.md` | **current `2f5375d7151482bca791d7aa6c0c45878ba8bed9`**; historical `4ffbfd97cafa64e5ad0f5a5d9ea090bfc74373f1` is only the version cited in `G3-AMEND-01` §2 | current SHA-256 `11e7500c952e7e0e28b2bb497ef5fd11c10f9cfe147f4b733c8f4a55a394ac5f`, **21,272 B** | Windows wrapper failure + direct-TAP evidence; historical body preserved with later status pointers |
| Master tracker / decision register (authoritative) | IRR `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | revision-2 basis at `4f472283…`; §16.79 / `CV-CORR-60` added by this records-only revision | — | §16.77/§16.78 Gate 3 acceptance + re-verification; §16.79 separates Gate 4 proposal/effectiveness/execution/acceptance |
| Wrapper under remediation | IPD `scripts/run-tests.mjs` | `fe1ab1a30d8cd0060b5fc50d181d6fcc735a3794` | `a677c7da5365b62af06d077eef6e6a6248267fbd1a53b28412135e3e20e0ecf2`, 4,974 B | Limb A target |
| Standing authorization (F-3 §1.2) | IRR `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` | `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` (as recorded) | — | Publication/recording authority basis |

## 3. Baseline SHAs (exact) and drift record

| Pin | Value | Status |
|---|---|---|
| IPD `main` (implementation basis) | **`1cceacfff40f22dbc9cd64906bf26a5feac1075e`** (tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`) | Reported baseline **verified live, zero drift** (`git ls-remote` + clone + CI `39765365164` `success`) |
| IRR `main` — reported baseline | `5a3410eab1a627e56642e82d93fcb875026a3334` | Verified live **at pass start** — exact match |
| IRR `main` — initial proposal rendering basis | `04394f3ffa88da8a72cb6b9d01f668d9d2650e6f` | Historical initial-proposal pin; earlier drift from `5a3410e…` was four documentation-only commits (PRs #188/#189), retained in act §2.2 |
| IRR `main` — revision-2 rendering basis | **`4f472283cd6bbedb228d06bfb9a766688c039976`** (tree `137a1b92b537c772d59a6af339d9e48dc42c7cf5`) | Live-verified PR #190 merge of the initial Gate 4 proposal. Compare from `04394f3…`: exactly four Markdown paths, no product/test/config paths; PR-head CI `39781892060` and post-merge CI `39782159580` `success`. **Recorded, not silently substituted** (act §2.3) |
| IRR `main` — revision-3 drafting basis | **`c6ddfccd1e49cb7db9def5b511da385880d60e8a`** (PR #192) | Live-verified this pass after PRs #191/#192 (both documentation-only, CI green, receipts at §16.79.11). Publication tip of revision 3 recorded post-merge in tracker §16.80.7. Recorded, not silently substituted |
| Gate 3 accepted IPD commit (unchanged) | `1cceacfff40f22dbc9cd64906bf26a5feac1075e` | Same as implementation basis |
| IRR commits for QE runs | **Designated at act effectiveness; recorded at run start** (descendants of the designated consumer lineage) | `[P]` — PA determination item; neither documentation rendering pin is itself a qualified consumer commit |
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
| Hosted Linux CI | IPD `main@1cceacff…` push run `39765365164` `success` — `784` executed / `783` passed / `0` failed / `1` `windowsOnly` skip (jobs `119779358586`, `119779508517`); IRR `main@4f472283…` push run `39782159580` and PR #190 head run `39781892060` `success`; earlier IRR runs `39779378820`/`39771867868` also `success` | Gate 3/records-publication evidence only; no Windows/host behaviour established |
| Native-Windows canonical `npm test` | **FAILED** (§5) | Failure preserved; Limb A is the remediation path; post-remediation host re-run is the acceptance evidence for the repair |
| Native-Windows direct TAP | `754 / 750 / 0 / 4`, exit 0 (operator-supplied; log `g3-connection-release-direct-tap-20261022-013113.log`) | Supplemental defect-remediation corroboration only |
| Target-host QE (channel 4) | **None exists** | Created only by authorized Limb B execution; closed only by separate result acceptance |
| Local POSIX reproduction | Recorded in acceptance record §5 (e.g. `784 / 783 / 0 / 1`) | Supplementary; never native-Windows or host evidence |

## 7. Prerequisites for Gate 4 execution (as established)

1. **This proposed act made effective** by PA determination (§9 of the act).
2. **Gate A′ provisioning executed** on the target host — Gate E §4 places the QE run *"after Gate A′
   provisioning"*; this ordering is established, not optional. Gate A′ remains
   `APPROVED — NOT EXECUTED`, P-1 separate. Its evidence must be same-host and compatible with the exact
   current migration/store blobs. This package neither executes Gate A′ nor authorizes a new
   `provisioning.ts` entrypoint; absent/incompatible evidence is a stop.
3. **Limb A merged** and canonical `npm test` observed passing on the target host at the exact
   post-merge IPD commit, with PR-head/post-merge Linux CI green. Earlier candidate evidence does not
   transfer to a later final commit.
4. **Target host `desktop-no0nhtp`** re-measured as native `win32`, under the provisioned non-elevated
   account. Runtime must be **Node major 22, `>=22.13.0 <23`**, with flag-free `node:sqlite`. The
   historical Node `v24.14.0` report is not current evidence and does not qualify; no runtime install or
   Gate 3 runtime amendment is included.
5. **Recorded digests** of the final qualified IPD and IRR builds, clean worktrees and remote ancestry
   at start/end (act §5.2). Qualified-surface drift invalidates the run.
6. **Qualification write mechanism adopted** — the three-tier fence-preserving mechanism now defined
   at act §5.5 (determination packet §4.4), PA adoption at packet §6 Q4. Direct-store/session-port
   evidence is qualification-fixture measurement only and cannot be represented as admitted IPC
   writes or as QE-4/QE-10 real-process proof; without adoption, or outside its boundaries, affected
   items stop.
7. **Evidence deposit rules and Q11 digest set fixed** (act §5.2(6)–(7): `G4-H12-MANIFEST-v2`,
   32+1-conditional; determination packet §4.7–§4.8); raw bytes hashed without normalization, all
   attempts retained, synthetic/disposable fixtures only.

## 8. Risks

| # | Risk | Mitigation in the proposal |
|---|---|---|
| R-1 | `node:sqlite` is Stability 1.1 (experimental warning) — behaviour on the Windows host unverified | QE-1 prerequisite records host availability; risk carried from G3-D2, not reopened |
| R-2 | W-1 circularity: write-path QE items need successful writes while W-1(3)/(4) are false | Unresolved decision D-4; no item may weaken W-1 in operational configuration |
| R-3 | QE-11 "and accepted" limb cannot close in-execution → multi-act sequence risk (run → Gate C acceptance → Gate 4 result acceptance) | Sequencing made explicit (matrix gap G-3; act §5.2(8)) |
| R-4 | Wrapper fix could mask broader output-format drift or alter Linux behaviour | §4.2 narrows to the summary-parsing region; §4.3 keeps full-suite + hosted-CI regression obligations; §4.4 fail-closed stop |
| R-5 | Evidence line-ending ambiguity (LF blobs vs CRLF Windows working tree — acceptance record tracked both SHA-256s) | Hash the actual artifact bytes without normalization; record observed line-ending form separately as metadata, never as a substitute hash |
| R-6 | Operator-supplied evidence class (Arena cannot observe the host) | Recorded limitation; digest-anchored run records + PA acceptance act |
| R-7 | Parallel recordkeeping drift (remote `main` moved during both proposal passes) | Both drift records retained (act §§2.2–2.3); revision-2 pins exact `4f472283…`; later non-documentation drift stops rather than auto-re-pinning |
| R-8 | Destructive scenarios (QE-7) damaging operator data | Proposed disposable-fixture rule (matrix §1; D-GC-I extension) — PA to confirm (D-9) |
| R-9 | Historical host Node `v24.14.0` conflicts with Gate 3's Node-major-22 policy | Native re-measurement; require `>=22.13.0 <23` and `node:sqlite`; stop rather than treat Node 24 as compliant or install/switch runtimes under this act |
| R-10 | Historical Gate A′ provisioning basis/tooling may not match accepted `main` migrations; current library has no executable entrypoint | Require compatible executed Gate A′ evidence on the same host; otherwise stop for separate Gate A′ authority. No implicit re-baseline or provisioning implementation |
| R-11 | Direct-store tests could be misread as successful admitted writes | Classify them as supporting domain evidence only; D-4 must expressly resolve each write-path item or the item stops. Operational dispatch remains `WRITE_NOT_AUTHORIZED` |

## 9. Determination status after the D-1…D-12 resolution pass (revision 3)

The full resolutions (facts, alternatives, exact act wording) are in the companion determination
packet (`IIPS_v3.0_G4_DETERMINATION_RESOLUTION_PACKET_D1_TO_D12_2026-10-22.md` §4) with the PA
decision sheet at its §6. Summary of where each stands **after revision 3**:

| # | Question | Status after revision 3 |
|---|---|---|
| D-1 | Act identity | **Resolved for recommendation `[E]` fact:** no identifier exists; proposed `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01`. Assignment remains **PA-only** (packet Q1) |
| D-2 | Pins + commit rule | **Resolved `[E]` + `[P]`:** IPD `1cceacff…` (zero drift); revision-3 IRR drafting basis `c6ddfccd…` (publication tip recorded at §16.80); four-part commit rule in act §5.2(5)–(6). PA confirms/designates (Q2) |
| D-3 | Limb A boundary | **Resolved `[E]`:** three-path boundary sufficient as written (act §4.2–§4.4); reporter-forcing rejected as a scope violation; review-enforcement checklist fixed. PA confirms (Q3) |
| **D-4** | Write-path mechanism | **Resolved `[E]` mechanism:** three-tier fence-preserving mechanism defined item-by-item at act §5.5 (T1 endpoint refusals / T2 disposable harness on real store+entrypoint / T3 session-port identity boundary), with code-path labels and limitation findings; hard facts at determination packet §4.4.1; Approach B (qualification-mode) rejected. **PA adoption remains material** (Q4); without it, affected items stop |
| D-5 | Sequencing | **Resolved `[E]` plan:** S0–S6 in determination packet §4.5; Gate A′ external and not granted; Node-22 preflight hard. PA confirms (Q5) |
| D-6 | QE-11 re-basing | **Resolved `[E]` + `[P]`:** re-issue of the seven-item execution grant in act §5.2(8); acceptance separate; Q1 records-only; gap G-12 (Gate-V currency) flagged with a recommended reading. PA confirms (Q6) |
| D-7 | H-12 digest set | **Resolved `[P]` proposal:** `G4-H12-MANIFEST-v2` = §13's 27+1 **plus five** identity/session-port files = **32 mandatory + 1 conditional**, two hash domains (act §5.2(6); determination packet §4.7). PA adopts/replaces (Q7) |
| D-8 | Evidence format | **Resolved `[P]` proposal:** run id `GQ-<yyyymmdd>-<nn>`, layout §13.3, MANIFEST minimum, raw-byte hashing, sensitivity and publication/read-back rules (act §5.2(7); determination packet §4.8). PA adopts (Q8) |
| D-9 | Failure handling | **Resolved `[P]` proposal:** PASS/FAIL/INCONCLUSIVE/INVALID + H-6 discipline + D-GC-I fixture extension for QE-4/QE-7 (act §5.7; determination packet §4.9). PA adopts (Q9) |
| D-10 | Durability wording | **Resolved `[P]` reading:** measurement/claim split + fixed non-claim sentence (act §5.6; determination packet §4.10). PA adopts (Q10) |
| D-11 | Executor capacity | **Resolved `[E]` facts + `[P]` confirmation:** capability table (determination packet §4.11); operator = PA on `desktop-no0nhtp`; Arena preparation-only; host Node/`node:sqlite`/Gate A′ unproven until preflight. PA confirms (Q11) |
| D-12 | Tracker registration | **Records-only registration resolved** (revision 2, checkbox at §12); determination-time scheme fixed: §16.80 now / §16.81+ at determination / event-driven status transitions (determination packet §4.12). PA confirms scheme (Q12) |

**No entry above is a PA decision.** Every `[P]` item, and the adoption of the act as a whole,
requires PA's express determination under act §9.

## 10. Verified vs. assumed vs. open

| Fact class | Items |
|---|---|
| **Independently verified this pass** | IPD and IRR live `main` refs + both drift audits, including PR #190's four-Markdown-path compare; wrapper file/blob/SHA-256 and exact defective lines; absence of wrapper tests; Gate E §4 / L-IPC-1 §10 / D-GC / G2-D3 source blobs; Gate 3 acceptance + act + amendment identities; CI states (IPD `39765365164`; IRR `39782159580`, `39781892060`, `39779378820`, `39771867868`); hard W-1 guard/dispatch source and direct-store-only T-G writes; Q1 records-only text; no revision-2 prepared-record or tracker-ID collisions |
| **Assumed / operator-supplied (not Arena-observed)** | The native-Windows wrapper failure cause (`ℹ`/CRLF) and direct-TAP counts; current host configuration/runtime; anything about `desktop-no0nhtp` beyond recorded facts. Historical Node `v24.14.0` is not represented as a current measurement |
| **Open (see §9)** | PA-only **D-1…D-11** — especially W-1 mechanism D-4, compatible Gate A′ evidence/sequencing D-5, QE-11 grant re-basis D-6 and exact Q11 set D-7. **D-12 is resolved only as records-only proposal registration**, not as act effectiveness |

## 11. Validation record of this packet (pre-publication)

| Check | Result |
|---|---|
| Both baseline SHAs re-confirmed at drafting; drift recorded (not substituted) | **PASS** — act §2 |
| Every cited governance artifact and QE definition exists at its authoritative location (blob reads in a read-only IPD clone at `1cceacff…` and in IRR through revision-2 basis `4f472283…`) | **PASS** — §2 |
| Proposed scope conflicts with the effective Gate 3 act / `G3-AMEND-01`? | **NONE** — Limb A is the repair those instruments expressly deferred to a Gate 4 act; manifests, `Q2-A`, fences, W-1 all preserved (act §7) |
| Language scan: no accidental authorization of Gate C acceptance, Gate 4 result acceptance, Gate 5/`CV-52`, production eligibility, `durable:true`, or route-fence removal | **PASS** — act §8 non-grants matrix; status banners on all three documents |
| Windows canonical `npm test` kept recorded FAILED; direct-TAP not relabelled | **PASS** — act §3 |
| No implementation performed; no QE executed; tracker/index edits are records-only and retain `PROPOSED — NOT EFFECTIVE` / `NOT AUTHORIZED / NOT STARTED` | **PASS** — stop boundaries held; D-12 does not move a gate |
| Required valid/malformed/incomplete/zero-failure/nonzero-failure/skipped/source-required parser cases present; exact helper path named; Node-major-22 and Q1 records-only stops present | **PASS** — revision-2 reconciliation |
| Local IRR documentation-regression validation | **PASS on Linux Node `v22.22.3`** — initial npm codeload CA failure recorded; CA-preserving `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` rerun succeeded without disabling TLS; typecheck `0`; **87 files / 1,077 tests / 0 failed**; `assert-tests` `OK`; build `0`, 94 modules. **Not Windows/QE evidence** |
| Document-structure checks + `git diff --check` on the publication diff | **PASS** (recorded at publication) |

## 12. PA determination checklist (the exact determinations required before effectiveness)

Recommended resolutions for every item are stated in the determination packet §4/§6; the checkboxes
below remain **unchecked until PA actually determines** (except D-12's records-only sub-item):

- [ ] **D-1** — Render the determination on the proposed act (adopt / adopt-with-changes / reject); assign the **Act ID** — *recommended: `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01`*; record it in the established PA decision form. *(Nothing is effective until this is done.)*
- [ ] **D-2** — Confirm/revise pins: IPD `1cceacfff40f22dbc9cd64906bf26a5feac1075e`; revision-3 IRR drafting basis `c6ddfccd1e49cb7db9def5b511da385880d60e8a` (publication tip recorded at §16.80); adopt the four-part commit rule; designate the final QE-run IPD/IRR commits — *recommended: confirm as proposed*.
- [ ] **D-3** — Confirm the three exact Limb A paths (third path conditional), complete §4.3 parser matrix and §4.4 stop rule — *recommended: confirm as written; reporter-forcing rejected*.
- [ ] **D-4** — **Adopt the item-by-item fence-preserving write mechanism (act §5.5 / determination packet §4.4) with code-path labels and limitation findings.** Direct-store/session-port results are qualification-fixture measurement only, never admitted-write evidence; if not adopted, affected items stop — *recommended: adopt as proposed; Approach B (qualification-mode) rejected*.
- [ ] **D-5** — Confirm compatible same-host Gate A′ evidence and sequencing S0–S6 (Gate A′ → merged Limb A/final-commit Windows pass → preflight → QE); any new Gate A′ action is separate — *recommended: confirm as proposed*.
- [ ] **D-6** — Confirm the QE-11 Gate C subset execution grant re-issue against current commits, Q1 records-only treatment, gap G-12 reading, and separate Gate C **acceptance** — *recommended: re-issue in this act; G-12 → historical records + waivers carry forward; acceptance separate*.
- [ ] **D-7** — Adopt or explicitly replace the Q11/H-12 digest set before execution — *recommended: `G4-H12-MANIFEST-v2` = 32 mandatory + 1 conditional (+ frozen anchors, IRR set, runtime manifest; two hash domains) per act §5.2(6) and determination packet §4.7, amending the §13 base set*.
- [ ] **D-8** — Fix the evidence run-ID (`GQ-<yyyymmdd>-<nn>`), destination, MANIFEST minimum, raw-byte SHA-256 convention (no line-ending normalization) and publication/read-back rules — *recommended: adopt act §5.2(7) + determination packet §4.8*.
- [ ] **D-9** — Adopt or replace the failure-handling rule (PASS/FAIL/INCONCLUSIVE/INVALID + H-6) and the D-GC-I destructive-fixture extension for QE-4/QE-7 — *recommended: adopt act §5.7*.
- [ ] **D-10** — Adopt or replace the QE-4 durability-vocabulary reading (measurement vs claim + fixed non-claim sentence); unresolved publication conflict stops QE-4 — *recommended: adopt act §5.6*.
- [ ] **D-11** — Confirm executor identity/capacity (operator = Program Authority on `desktop-no0nhtp`; Arena preparation/recording/publication only) and the verification/escalation duties — *recommended: confirm per determination packet §4.11*.
- [x] **D-12 (records-only sub-item)** — **Resolved:** the tracker/index may record this proposal and its non-effective/not-started status under standing documentation authority. This checkbox is not a PA adoption and confers no execution authority.
- [ ] **D-12 (determination-time scheme)** — Confirm the registration scheme: tracker §16.80 for this proposal; §16.81+ for the determination; event-driven `AUTHORIZED → STARTED → ACCEPTED` transitions only as events occur — *recommended: confirm per determination packet §4.12*.

---

## 13. Proposal for D-7 — exact Q11/H-12 qualified-surface set (revision-2 base set; revision-3 amendment below)

This is a **[P] decision input**, not a claim that H-12 already names these files. It re-bases the
historical 15-file `cec70802…` set onto the accepted Gate 3 implementation and the proposed Limb A
surface. PA must adopt or replace this list before execution; the same list must be used before and
after the run, and any drift invalidates the run.

> **Revision-3 amendment (D-7 resolution).** The operative recommendation is now
> **`G4-H12-MANIFEST-v2` = the 27 mandatory paths below + `scripts/test-summary-parser.mjs`
> conditional (unchanged) + five additional mandatory paths** — `src/identity/security_master.ts`
> (`60030e0c…`), `src/identity/mapping_store.ts` (`eec60c09…`), `src/identity/quarantine.ts`
> (`70c6f658…`), `frontend/src/features/portfolio/portfolioStorePort.ts` (`d61f18df…`),
> `frontend/src/features/portfolio/portfolio-store.ts` (`b900a248…`) — **= 32 mandatory + 1
> conditional**, because QE-1/QE-2's identity limbs exercise exactly that code (determination packet
> §4.4.1 facts 4–5). Two hash domains are fixed there as well: Git-blob hashes (`git cat-file blob`)
> for repository surfaces; raw-byte SHA-256 without normalization for deposit artifacts. The
> revision-2 tables remain as the base; the amendment is part of the same proposed set.

### 13.1 IPD source/test/configuration manifest — 27 mandatory paths

| Group | Exact paths |
|---|---|
| Gate 3 IPC implementation (4) | `src/ipc/dispatch.ts`; `src/ipc/endpoint.ts`; `src/ipc/entrypoint.ts`; `src/ipc/protocol.ts` |
| Gate 3 persistence implementation (10) | `src/persistence/audit.ts`; `src/persistence/binding.ts`; `src/persistence/connection.ts`; `src/persistence/durablePortfolioStorePort.ts`; `src/persistence/migration_ledger.ts`; `src/persistence/migrations/001_initial_schema.ts`; `src/persistence/migrations/002_audit_event_sequence.ts`; `src/persistence/migrations/003_local_principal_bindings.ts`; `src/persistence/portfolio_store.ts`; `src/persistence/provisioning.ts` |
| Gate 3 tests (8) | `tests/g3_binding_resolution.test.ts`; `tests/g3_caller_authority.test.ts`; `tests/g3_durability_vocabulary.test.ts`; `tests/g3_ipc_framing.test.ts`; `tests/g3_no_network_listener.test.ts`; `tests/g3_portfolio_read_isolation.test.ts`; `tests/g3_startup_validation.test.ts`; `tests/g3_write_gate.test.ts` |
| Limb A (2 mandatory) | `scripts/run-tests.mjs`; `tests/g4_run_tests_summary_parsing.test.ts` |
| Runtime/test configuration (3) | `package.json`; `package-lock.json`; `tsconfig.json` |

**Conditional twenty-eighth path:** `scripts/test-summary-parser.mjs`. If Limb A uses the helper, it is
present in both manifests with its digest. If Limb A does not use it, both manifests record it
`ABSENT`; its later appearance is drift. No other helper is permitted.

For each path record Git blob SHA-1, SHA-256 and byte size. Also record the IPD commit/root tree,
`.github/workflows/ci.yml` frozen blob `aeee464feb76e2d1e9d104e1cae4e5dde37700ad`, and the executed
`dist` artifact hashes in a separate runtime-artifact manifest. Source digests alone do not prove which
compiled bytes were loaded; the runtime manifest closes that evidence gap without authorizing checked-
in `dist` changes.

### 13.2 IRR consumer and fence identity

Record the designated IRR consumer commit/root tree and before/after blob + SHA-256 manifest for the
Gate 3 consumer set (`ipcClient.ts`, `ownerContextFromBinding.ts`, `ipcPortAdapter.ts`, their tests and
associated contract/port/fence files identified by the Gate 3 act), plus
`frontend/server/owner-context-unavailable.ts`, `frontend/server/user-portfolio-transport.ts`,
`frontend/server/reports-transport.ts`, `frontend/server/executive-transport.ts`,
`frontend/package.json`, `frontend/package-lock.json` and `frontend/vite.config.ts`. The full Gate 3
act §5 list controls the consumer-set membership; this paragraph does not add or remove a product file
from that act. Any consumer/fence drift invalidates the run. Evidence-publication commits are recorded
separately and are not substituted for the qualified IRR consumer commit.

### 13.3 Evidence-deposit file classes

If D-8 is adopted, each run directory contains only new evidence files under:

- `evidence/integration/gate-4-target-host-qualification-<run-id>/raw/**` — unedited stdout/stderr,
  PowerShell transcripts, JSON/JSONL measurements and process logs;
- `…/MANIFEST.json` — run ID, UTC times, exact commits/trees, host/runtime fields, artifact names,
  sizes and SHA-256 values;
- `…/Q11-BEFORE.json` and `…/Q11-AFTER.json` — the §13.1/§13.2 source and runtime-artifact manifests;
- `…/QE-01.md` through `…/QE-11.md` — per-item procedure, exact commands, result and artifact links;
- `…/WINDOWS-CANONICAL-TEST.md` — channel-2 final-commit result, counts and all skips;
- `…/EXECUTION-RECORD.md` — all attempts, failures/stops, separate evidence-publication commit IDs and
  non-grants.

Raw evidence is collected outside the qualified worktrees and copied into a separate documentation
worktree only after Q11-after. No existing raw file may be overwritten; a repeated attempt receives a
new run ID.

## 14. Revision-2 host/runtime preflight — evidence template, not executed output

The following fields and read-only probes are the minimum proposed way to prove the environment. They
are **commands for a later authorized operator run**, not commands executed by Arena and not results.
The operator must publish the actual raw output; no expected value below may be copied into evidence as
though observed.

| Evidence field | Proposed native-Windows probe / required record |
|---|---|
| UTC and host | `(Get-Date).ToUniversalTime().ToString('o')`; `$env:COMPUTERNAME`; require actual `desktop-no0nhtp` |
| Principal and elevation | `whoami`; `whoami /groups`; record the exact provisioned account and group/elevation evidence; require the designated non-elevated single principal |
| OS | `Get-CimInstance Win32_OperatingSystem \| Select-Object Caption,Version,BuildNumber,OSArchitecture`; record raw values, with no minimum build invented |
| Native Node identity | `node -p "JSON.stringify({version:process.version,platform:process.platform,arch:process.arch,execPath:process.execPath,versions:process.versions})"`; require `platform:"win32"` and Node `>=22.13.0 <23` |
| Node executable integrity | `(Get-FileHash -Algorithm SHA256 (Get-Command node).Source).Hash`; bind the probe and every later test/QE command to the same `execPath` |
| `node:sqlite` | A flag-free in-memory `DatabaseSync` probe that creates a table, commits one synthetic row, reads it back and closes the database; publish version/warning/output/exit code. No host file is created |
| Repository identity | In each qualified worktree: `git rev-parse HEAD 'HEAD^{tree}'`; `git status --porcelain=v1 --untracked-files=all`; `git diff --exit-code`; `git diff --cached --exit-code`; `git ls-remote origin refs/heads/main`; record exact values and remote ancestry |
| Build/test binding | `npm ci --no-audit --no-fund`, typecheck/build/canonical-test commands as applicable, each with UTC start/end, exit code and raw log; hash executed `dist` artifacts per §13.1 |
| Native process/pipe evidence | During the relevant QE items, record real IRR/IPD process IDs, start/stop/restart transitions, endpoint name and named-pipe transport results. Linux/WSL/CI output is non-qualifying |

**Preflight failure is a stop, not an inconclusive pass.** In particular, Node `v24.x`, `win32` not
reported, a different host/account, a failed SQLite probe, an unclean qualified worktree or an
unrecorded executable/runtime change prevents Gate 4 execution. Installing or switching Node is not
authorized by this package; a compliant runtime must be supplied under separate environment control
before the preflight is repeated.

*End of the Gate 4 evidence packet, final proposal revision 3 (D-1…D-12 resolutions carried in the companion determination packet). Prepared for PA determination — **Gate 4 remains `NOT AUTHORIZED / NOT STARTED`**; the Windows canonical `npm test` wrapper failure remains a failure; no QE item is executed or accepted; §14 contains no observed host output; no PA decision is asserted anywhere in this packet.*
