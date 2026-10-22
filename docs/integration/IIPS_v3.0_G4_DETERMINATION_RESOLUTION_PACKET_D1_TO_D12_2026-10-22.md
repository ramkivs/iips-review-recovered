# IIPS v3.0 — Gate 4 Determination-Resolution Packet: D-1 through D-12 (Prepared — Recommendations Only)

> ## STATUS: **PREPARED DETERMINATION-RESOLUTION PACKET — RECOMMENDATIONS FOR PROGRAM AUTHORITY — NOT A PA DECISION**
>
> - This packet resolves, from authoritative evidence, every question in the Gate 4 determination set
>   **D-1…D-12** that can be resolved without exercising Program Authority. Each determination receives
>   a recommended decision, the verified facts behind it, the alternatives, the exact proposed act
>   wording, and — where the matter is genuinely PA-only — the precise decision PA must render with a
>   recommended default. **Nothing here is a PA decision.** No Act ID is assigned, no act is made
>   effective, no QE item is executed, and no gate status moves.
> - **Gate 4 remains `NOT AUTHORIZED / NOT STARTED`.** The Windows canonical `npm test` wrapper failure
>   remains a **failure**. Gate 3 remains **`ACCEPTED — BOUNDED GATE 3 IMPLEMENTATION SCOPE ONLY`**.
>   W-1, all HTTP `503` fences, `SESSION_ONLY`/`durable:false`, and every Gate A′/C/5/production
>   non-grant are untouched.
> - Companion instruments: the corrective revision-4 proposal act
>   (`IIPS_v3.0_G4_TARGET_HOST_QUALIFICATION_AUTHORITY_ACT_PROPOSED_2026-10-22.md`, corrective revision 4) and the
>   corrective QE matrix (`IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md`, revision 4),
>   revised in place in the same pass.

| Field | Value |
|---|---|
| **Document ID** | `IIPS-V3-G4-DETERMINATION-RESOLUTION-PACKET-2026-10-22-02` — corrective prepared-record identifier; prior `…-01` is historical; **not an effective-act ID** |
| **Document type** | Determination-resolution and decision-input packet for the proposed Gate 4 Target-Host Qualification Authority Act |
| **Prepared** | `2026-10-22` (UTC), by Arena Agent Mode (investigation, resolution recommendation, documentation, publication only — renders no decision) |
| **Deciding authority** | **Ramki — Program Authority.** PA-only items are isolated in §6 (decision sheet) |
| **Preparation authority** | Standing F-3 §1.2 preparation/documentation/publication grant; Q1 §2 excludes Gate 4 execution; `G3-AMEND-01` §6.4 reserves runner repair/QE work to a separate Gate 4 PA act — all observed here |
| **Publication location** | `ramkivs/iips-review-recovered` `docs/integration/` — the established proposal/decision-input location |

---

## 1. Method and authority boundary

1. **Start from authoritative records.** Every determination below cites its governing source by
   instrument, section, and (where it exists) Git blob/SHA-256 at a named commit. Facts were re-read
   this pass from live repository objects — not copied from earlier summaries.
2. **Resolve through evidence where possible.** Where a fact is determinable from the repositories,
   the record, the source code, or the tests, this packet resolves it and marks the determination
   **`[E]` evidence-resolvable** (recommended decision ready for PA adoption as written).
   Where two accepted records interact and only the Program Authority may choose the reading, the
   determination is **`[P]` PA-only**, and §6 states the exact decision with a recommended default.
3. **No PA decision is fabricated.** Recommended decisions are proposals. Nothing is effective until
   PA renders a determination under act §9.
4. **Stop boundary held.** This pass modified no product, test, runner, dependency, workflow, fence or
   configuration path; implemented no repair; executed no QE item; performed no Windows or
   destructive operation; and touched no IPD ref (IPD was read-only throughout).

## 2. Verified baseline state at this pass (`2026-10-22`)

| Repository | Ref | Verified live SHA | Tree | Method | Drift since the reported proposal baseline |
|---|---|---|---|---|---|
| IPD `ramkivs/iips-production-market-data` | `refs/heads/main` | **`1cceacfff40f22dbc9cd64906bf26a5feac1075e`** | `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9` | `git ls-remote`; full clone `git log`; GitHub API commit read; Actions run list (only push run at that SHA: **`39765365164` `success`**, `784/783/0`) | **None** — exact match to the Gate 3 accepted baseline and the reported pin |
| IRR `ramkivs/iips-review-recovered` | `refs/heads/main` | **`c6ddfccd1e49cb7db9def5b511da385880d60e8a`** | re-recorded at publication | `git ls-remote`; unshallowed fetch; `git log`/`git diff --name-status`; PR/Actions APIs | **Advanced twice during this pass**, both documentation-only: PR **#191** (`4f472283… → 5ad25c6c…`, `2026-10-22T13:19:24Z`, five Markdown paths — revision-2 reconciliation of the three proposal documents + tracker + index) and PR **#192** (`5ad25c6c… → c6ddfccd…`, tracker §16.79.11 receipt + index, two Markdown paths). PR-head/post-merge CI green for both (`39785564954`/`39785813491`; `39786382951`/`39786578832`) |

Intervening IRR history is fully inspected: `04394f3… → 4f472283…` (PR #190, initial Gate 4 proposal,
four Markdown paths) → `5ad25c6c…` (PR #191, revision-2 reconciliation, five Markdown paths) →
`c6ddfccd…` (PR #192, receipt, two Markdown paths). **Every movement is documentation-only**; no
application, test, dependency, route, fence, workflow or configuration path changed in any of them,
and the Gate 3 instruments (`4744e6f4…`, `85ba78e6…`, `f3a6c9a3…`) remain byte-identical throughout.

The proposal lineage this packet resolves over: **revision 1** = PR #190 head `e7f667f5fdffbcc95513c1de59164de9792da47b`
at `4f472283…`; **revision 2** = PR #191 head `38d9490d1f39e802a095c1de43b38451884284b7` at `5ad25c6c…`
(tracker §16.79 / `CV-CORR-60`, receipt §16.79.11 / `CHG-2026-10-22-12`, verification rows `V241`–`V255`);
**revision 3** was produced at `c6ddfcc…`; corrective revision 4 is based on live IRR `f741298…` as stated in §7.5.

## 3. Master decision table (one row per determination; no determinations merged)

| # | Exact question | Governing source | Class | Recommended decision (summary) | Act location | Remaining prerequisite / PA item |
|---|---|---|---|---|---|---|
| **D-1** | Has a canonical Gate 4 act identifier been assigned; if not, what identifier should PA assign? | Existing act-ID conventions (`IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02`, `IIPS-V3-G3-AMEND-01-2026-10-22-01`, `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01`, `IIPS-V3-G2-IPD-GATE-C-QUALIFICATION-AUTHORITY-2026-10-17-01`); fresh grep of both repositories | `[E]` fact; `[P]` assignment | **No identifier exists** (verified). Propose `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01`. Keep `PENDING ASSIGNMENT` until PA determines | Act header, §9(1) | PA assigns (or varies) the ID at determination — §6 Q1 |
| **D-2** | What are the exact IPD/IRR baseline pins and how are implementation commits and qualification runs bound to them? | Gate E §4 (“at recorded digests”); Gate 3 act §§2, 10; `G3-AMEND-01` Q1-B | `[E]` (pins); `[P]` (future designation) | Pin IPD **`1cceacfff40f22dbc9cd64906bf26a5feac1075e`** as accepted Gate 3 base; IRR Gate 3 consumer code **`d355d904aa52988e70a98324714886f6a1c0ea2a`** / tree `e631cf3287fc19a2d1c8f73a0eb5f8d640370e27`; and IRR proposal/documentation basis **`f741298fc73372a27c822b7f9018702216b59cfd`** / tree `b9e88cde55c0c8694f42f90c60ae3cbce1a081d2`. The future IPD Limb A/QE commit is designated only after its authorized merge/CI/read-back and before preflight/run. Apply the four-part rule (§4.2): merged+CI+read-back; exact SHAs/trees recorded before run; H-12 before/after; any non-documentary drift stops, never silently re-pins | Act §2.4, §5.2(5)–(6) | PA confirms fixed baseline pins and the designation protocol; the IPD QE commit SHA is recorded after Limb A merge, before QE, not invented at effectiveness — §6 Q2 |
| **D-3** | Is the Limb A wrapper-remediation boundary sufficient, and how is scope enforced? | `G3-AMEND-01` §6.4(1); CV-35/CV-42 wrapper source; tracker §16.78.5 (reporter-forcing treated as scope violation) | `[E]` | **Sufficient as revised**: exactly `scripts/run-tests.mjs` (summary-parsing region) + `tests/g4_run_tests_summary_parsing.test.ts` + conditionally `scripts/test-summary-parser.mjs` (only helper; pure parser). Parser-side fix is the narrow path — forcing `--test-reporter=tap` would change the runner invocation and was previously treated as a scope violation. Enforcement: diff-stat proof, §4.3 regression matrix, forbidden-file byte-stability, §4.4 stop rule | Act §4.2–§4.4 | PA confirms the boundary — §6 Q3 |
| **D-4** | **How do QE-2…QE-9 execute while W-1(3)/(4) refuse every write?** | Gate E W-1/§4; Gate 3 act §7; source at IPD `1cceacff…` (§5 evidence table); D-GC-I fixture pattern; `tests/g3_write_gate.test.ts` | `[E]` mechanism design; `[P]` PA adoption | Adopt the **three-tier fence-preserving mechanism** (§5): Tier 1 endpoint refusals with all fences on; Tier 2 disposable-copy harness executing the real `DurablePortfolioStore`/entrypoint components; Tier 3 the identity-capable session-port boundary. Rejected: qualification-mode/as-if-W-1 (weakens safeguards, contradicts §7 and T-G). Structurally unreachable criteria are recorded as **explicit limitation findings**, never as passes or silent omissions | Act §5.5 (new); §8 rows | PA expressly adopts the mechanism and the limitation-findings rule — §6 Q4 (material) |
| **D-5** | What is the dependency-ordered execution plan, and what needs another act? | Gate E §4 order; Gate 3 act §11 (Gate A′ `APPROVED — NOT EXECUTED`); act §5.2–§5.4 | `[E]` plan; `[P]` Gate A′ confirmation | Order: **S0** PA effectiveness (H-12 adoption deferred) → **S1** external Gate A′ record → **S2** Limb A merge/CI/read-back/native-Windows pass → **S2a** regenerate/validate complete H-12 and obtain distinct PA adoption → **S3** host/runtime preflight → **S4** QE → **S5** evidence integrity → **S6** separate dispositions. No preflight/QE before S2a. Independently authorizable under this act: Limb A, Limb B, records/publication. Requiring other acts/decisions: Gate A′ record, later H-12 PA adoption, Gate C acceptance, Gate 4 result acceptance, Gate 5, any implementation beyond Limb A | Act §5.2(4)–(6), §7 | PA confirms the ordering, Gate A′ evidence requirement and deferred H-12 adoption — §6 Q5/Q7 |
| **D-6** | What is the current QE-11/Gate C subset basis, and which references are stale? | Gate E §4 QE-11; L-IPC-1 §10 Q1–Q11; D-GC §§4–8 (grant names `cec70802…`); G3-D5 (`REFERENCE ONLY`); D-GC-B/D-GC-§7 (Q1 records-only) | `[E]` (staleness); `[P]` (re-issue) | Re-issue the seven-item **execution** grant (Q1–Q4/Q9–Q11) inside Limb B against the designated current commits; keep H-1…H-13 as operational criteria with H-12 re-based per D-7; Q1 stays records-only (V-5 inventory + D-GC-B waiver reading in H-13 form). **Gate C acceptance remains a separate act**; `PARTIAL — Q5–Q8 DEFERRED` vocabulary preserved. Stale references listed in §4.6 | Act §5.2(8) | PA confirms the re-issue and the currency of Q1's Gate-V records basis — §6 Q6 (incl. gap G-12) |
| **D-7** | What is the authoritative Q11/H-12 digest set now? | D-GC-H/H-12 (historical: 15 files + `package.json` + `tsconfig.json` for `cec70802…`); Gate 3 act §§4.1–4.3 (22-file manifest + 10 anchors); packet index rev-2 §13 (27+1) | `[E]` design; `[P]` adoption | Supersede the historical 15-file set (off-`main`, reference-only) only after a complete future candidate is available. Proposed membership is **32 mandatory + 1 conditional** (§4.7: rev-2's 27+1 plus three `src/identity/*` files and two frontend session-port files), with ten Gate 3 frozen anchors, IRR set, criteria references and runtime/evidence manifests. The current candidate has 31/32 mandatory IPD files present; `tests/g4_run_tests_summary_parsing.test.ts` is absent and required, so **defer H-12 adoption**. After Limb A creates it, regenerate and fully validate exact hashes at the final IPD commit; PA must expressly adopt/replace that complete manifest before host preflight/QE. Repository surfaces use **Git blob object ID SHA-1 plus SHA-256 over exact blob bytes, without normalization**; deposit artifacts use **raw-byte SHA-256 without normalization** | Act §5.2(6); matrix §1; packet §4.7, §6 Q7 | Defer adoption now; PA decision on the complete future manifest is a separate hard prerequisite before preflight/QE — §6 Q7 |
| **D-8** | What are the evidence format, destination, metadata and integrity rules? | Gate E §4 (“raw output published”); H-7/H-13 (JSONL + SHA-256 + run id `GQ-<yyyymmdd>-<nn>`); rev-2 packet §§13.3–14 | `[GAP]` in record → `[P]` | Adopt rev-2's deposit layout: one new `evidence/integration/gate-4-target-host-qualification-<run-id>/` per run (`run-id = GQ-<yyyymmdd>-<nn>`), `raw/**` immutable, `MANIFEST.json` with commits/trees/host/runtime/commands/exit codes/tool versions/harness hash, per-item `QE-NN.md` interpretation kept separate from raw, `Q11-BEFORE/AFTER.json`, `EXECUTION-RECORD.md`. SHA-256 of **actual deposited bytes, no line-ending normalization**; source-surface digests via Git blobs (D-7). No secrets/real portfolio data; if captured, stop publication and escalate. Publication through the IRR PR workflow with independent remote read-back (fresh fetch, byte compare) | Act §9 (evidence), §11 | PA adopts the layout/rules — §6 Q8 |
| **D-9** | How do failed/inconclusive/interrupted items and destructive fixtures behave? | No authoritative QE failure rule (matrix gap G-6); H-6 (ratified invalid-vs-failed); D-GC-I fixture boundary; G2-D3(b) (stop both processes) | `[GAP]` → `[P]` | Adopt: statuses `PASS`/`FAIL`/`INCONCLUSIVE`/`INVALID` per H-6, recorded per item at exact digests; all attempts retained; no relabelling, no silent re-run to a pass; partial runs never cited as qualification; escalation to PA (re-run / abort / disposition). QE-4 (process stop/restart of **both real processes**) and QE-7 (forced termination mid-write; migration-tamper startup refusal) are the disruptive/destructive items: disposable isolated store copies only (D-GC-I extended), provenance recorded before any write, pre-run fixture backup, authoritative store never opened, fresh-copy recovery, copies retained until the acceptance act disposes of them. **Neither item is executed by this pass** | Act §10 | PA adopts the failure rule and fixture extension — §6 Q9 |
| **D-10** | What may QE-4 evidence say about `durable:true`? | Gate E W-11; Gate 3 act §8.4 (claim prohibited before result acceptance); `durablePortfolioStorePort` vocabulary (`DURABLE`) | `[P]` reading of two accepted records | Adopt the **measurement/claim split**: raw output may quote response fields the qualified code emits (e.g. `durability: "DURABLE"`) verbatim as **measurement**; no UI, documentation, tracker, evidence-summary or release-note sentence may **assert** durable-portfolio capability until the Gate 4 result-acceptance act; IRR `frontend` stays `SESSION_ONLY`/`durable:false`. Each QE-4 record carries the fixed non-claim sentence in §4.10 | Act §5.6 | PA adopts the reading — §6 Q10 |
| **D-11** | Who may execute and record, and what is demonstrated vs assumed? | Gate 3 act §8.3/§11 (host); D-GC-F (host = Windows laptop); observed capabilities this program | `[E]` facts; `[P]` confirmation | Executor = **Ramki (PA) as operator on `desktop-no0nhtp`**; recording = operator execution record + Arena preparation/publication/remote read-back only. Demonstrated: operator native-Windows runs (channels 2/3) and IPD merges; Arena IRR publication/CI/remote reads and IPD read-only access (no IPD write, no Windows, no native host). Not demonstrated (assumed until preflight): host Node 22.x `>=22.13.0 <23` (historical record says `v24.14.0` — **non-compliant**), `node:sqlite` probe, Gate A′ state. "Independent verification" = second read-back from the remote plus fresh-clone digest reproduction (single-operator honesty recorded) | Act §8 (operator), §5.2(2)–(3) | PA confirms executor/capacity and recording authority — §6 Q11 |
| **D-12** | How are the act and its status registered? | Tracker §16.79/`CV-CORR-60` (rev-2 records-only registration, receipt §16.79.11 complete); packet-index `G4-PROPOSED` row; established §16.xx pattern | `[E]` (records-only already resolved by rev-2); `[P]` (determination-time registration) | Records-only registration of proposal status is already resolved (rev-2, D-12 checkbox). For PA determination: register under the **next free** section `§16.80` / `CV-CORR-61` / `CHG-2026-10-22-13` (census-verified free this pass), following the §16.75/§16.77 pattern: determination + assigned Act ID + effectiveness receipt as actual events; then `AUTHORIZED` (not started) only on effectiveness, `STARTED` only when execution begins, acceptance only when rendered. Preserve all existing section numbers and decision IDs. This pass registers the final proposal only (§16.80) | Tracker §16.80 (this pass); reserved §16.81+ for the determination | PA determination triggers §16.81+ — §6 Q12 |

Class legend: **`[E]`** = resolvable from authoritative evidence (recommended decision stated; PA still adopts by rendering the act); **`[P]`** = requires an express PA choice even though the evidence constrains it.

## 4. Individual determinations

### 4.1 D-1 — Act identity

- **Exact question.** Has any existing record assigned a canonical identifier to the Gate 4
  target-host qualification authority instrument? If not, what identifier is consistent with governance
  convention for PA to assign?
- **Governing source.** Act-identifier conventions across the governance corpus (the four examples in
  §3 D-1); the proposal's own `PENDING ASSIGNMENT` banner; tracker §16.79 (rev-2 records-only IDs).
- **Verified facts.** Fresh grep across both repositories at the verified tips: **no** pre-assigned
  Gate 4 authority-act identifier exists. Prepared-record IDs (`…PROPOSAL…-02`, `…EVIDENCE-PACKET…-02`,
  `…QE-MATRIX…-02`, and this packet's `…DETERMINATION-RESOLUTION…-01`) are explicitly *not* effective-act
  IDs. The convention for effective acts is `IIPS-V3-<GATE>-<INSTRUMENT>-<YYYY-MM-DD>-<NN>`.
- **Recommended decision `[E]` fact / `[P]` assignment.** PA assigns
  **`IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01`** (or a recorded variant) at
  determination. Until then the field stays `PENDING ASSIGNMENT`.
- **Alternatives.** (a) Assign a different ID — consequence: only the string changes; all content
  requirements stand. (b) Leave unassigned indefinitely — consequence: no act can become effective;
  Gate 4 stays blocked (unacceptable as a resting state).
- **Exact proposed act wording.** Header field: `**Act ID** | **PENDING ASSIGNMENT** — proposed for PA
  adoption: IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01`. §9(1): “assigns its Act
  ID”.
- **Remaining prerequisite.** PA determination (§6 Q1). Nothing else.

### 4.2 D-2 — Baseline pins and the qualification-run commit rule

- **Exact question.** What are the exact IPD and IRR pins for this act, and how are implementation
  commits and qualification runs bound to them?
- **Governing source.** Gate E §4 (“against the Gate 3 implementation **at recorded digests**”);
  Gate 3 act §2 (immutable bases) and §10.1 (commit-exact acceptance); `G3-AMEND-01` Q1-B (dual-anchor
  discipline); matrix §1 implementation-basis row.
- **Verified facts.** §2 above: IPD `main@1cceacff…` **zero drift** (tree `b2dd2deb…`, CI `39765365164`
  `success`); IRR Gate 3 accepted implementation commit is `d355d904aa52988e70a98324714886f6a1c0ea2a` / tree `e631cf3287fc19a2d1c8f73a0eb5f8d640370e27`. After it, the sole content commit `11320d92ef755a56226f4cf112f4d9ef8d46fac5` changed tracker text only and was merged at `f741298fc73372a27c822b7f9018702216b59cfd` / tree `b9e88cde55c0c8694f42f90c60ae3cbce1a081d2`; no consumer code/safeguard/acceptance evidence changed.
- **Recommended decision.**
  1. **IPD implementation/qualification pin:** `1cceacfff40f22dbc9cd64906bf26a5feac1075e` (the Gate 3
     accepted commit) — the Limb A branch must descend from it.
  2. **IRR QE consumer code pin:** `d355d904aa52988e70a98324714886f6a1c0ea2a` / tree
     `e631cf3287fc19a2d1c8f73a0eb5f8d640370e27`, the accepted Gate 3 consumer implementation.
  3. **IRR proposal/documentation pin:** `f741298fc73372a27c822b7f9018702216b59cfd` / tree
     `b9e88cde55c0c8694f42f90c60ae3cbce1a081d2` (live documentation tip before this corrective
     proposal; not substituted for the code pin).
  4. **Commit rule (four parts).** (i) The IPD commit whose qualification results will be cited is the
     **final post-merge Limb A commit**: identified, merged `--merge`, PR-head and post-merge CI green,
     `ls-remote`-agreed, blob/SHA-256 read-back done, and the native-Windows canonical `npm test`
     passed *at that commit*, **before** any of its results count as evidence (act §6.1(5)); (ii) the
     **IRR consumer commit** for the run is the fixed accepted Gate 3 code pin `d355d904…`, provided
     the future fully validated, PA-adopted H-12 manifest confirms its blobs unchanged; the exact future IPD execution commit is designated only
     after Limb A merge and before preflight/run; (iii) digests of the qualified-surface
     manifest are recorded at run start **and** run end (H-12: any drift ⇒ run invalid); (iv)
     **non-documentary drift** between effectiveness and execution is a **stop condition** requiring
     PA re-designation — never a silent re-pin.
- **Alternatives.** Re-pinning IPD to a successor now → unnecessary (zero drift) and would sever the
  Gate 3 acceptance identity. Treating the newer IRR documentation tip as a new consumer-code pin is
  unnecessary: its only post-`d355` content commit is tracker-only. Keep the code pin at accepted
  `d355`; separately record documentation tip `f741`. Any IRR H-12 code-blob change is a stop.
- **Exact proposed act wording.** Act §§2.4/5.2(5)–(6): the accepted IPD/IRR code bases, separate IRR documentation tip, and the future IPD commit-designation point.
- **Remaining prerequisite.** PA confirms the fixed bases and designation protocol (§6 Q2). The future IPD hash is not knowable now; it must be recorded only after the authorized Limb A merge, CI, remote read-back and native-Windows pass, before target-host preflight or QE.

### 4.3 D-3 — Limb A implementation boundary

- **Exact question.** Is “summary-parsing region + one focused test + at most one helper” sufficient
  to fix the Windows canonical-wrapper defect, and how is the boundary enforced in review?
- **Governing source.** `G3-AMEND-01` §6.4(1) (repair deferred “to a separate PA act within Gate 4”);
  act §4.2–§4.4; wrapper source at `1cceacff…` (blob `fe1ab1a3…`, 129 lines); CV-35 guard semantics;
  tracker §16.78.5 note that a `--test-reporter=tap` invocation change was treated as a scope
  violation in the rejected v4 artifact.
- **Verified facts.** (1) The defect is exactly the two `$`-anchored multiline matches at lines
  111–112 and 126 against Windows `node --test` summary output (`ℹ` marker and/or CRLF); fail-closed
  behaviour fires correctly — the guard is not the defect, the parser is. (2) No test covers the
  wrapper (60 `tests/*.test.ts`, none referencing it). (3) The wrapper binds `repoRoot` to its own
  location and runs the whole suite — a test that spawns it recursively would be heavy and
  unreliable; extracting a **pure** parser into one helper is the only clean testability route, which
  is why the conditional third path exists. (4) Forcing the TAP reporter in the spawn args would also
  “fix” the symptom but changes the runner invocation — previously treated as a scope violation — and
  is **rejected**. (5) A `.mjs` test file would not be discovered (source scan requires `*.test.ts`);
  the test must be TypeScript per the build/discovery contract.
- **Recommended decision `[E]`.** The boundary is **sufficient as written in act §4.2**: item 1
  wrapper summary-parsing region (normalization + the two matches + directly associated reporting +
  adjacent comments, preserving discovery/inventory/staleness/zero-test guards, child-exit
  propagation and the command interface); item 2 the new test with the full §4.3 matrix; item 3 the
  **single conditional** helper `scripts/test-summary-parser.mjs` (pure: no exit/fs/network/child/env).
  No fourth path, no second helper.
- **Scope-enforcement mechanics (review checklist).** (a) diff-stat proof: only §4.2 paths differ from
  the merge base; (b) forbidden-file byte-stability at the merge commit: `package.json`,
  `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.github/workflows/ci.yml` = `aeee464f…`,
  `src/**`, all existing tests, all IRR files; (c) §4.3 regression matrix complete with count-delta
  accounting (baseline `60 files / 784 executed / 783 passed / 0 failed / 1 skipped`); (d) PR-head +
  post-merge Linux CI green; (e) native-Windows canonical pass at the exact post-merge commit;
  (f) §4.4 fail-closed stop if any of the above cannot hold.
- **Alternatives and consequences.** Widening (runner redesign, reporter forcing, CI changes):
  prohibited — `Q2-A` froze `ci.yml`, and runner redesign exceeds the deferral. Narrowing (no helper):
  only if implementation genuinely keeps the parser inline and testable; consequence — none for
  authority; the conditional path simply stays absent and its absence is recorded.
- **Exact proposed act wording.** Act §4.2 as revised in revision 2, adopted unchanged in revision 3.
- **Remaining prerequisite.** PA confirmation (§6 Q3). **Risk:** none beyond R-4 (parser masking
  broader output drift) — mitigated by the CR/noise and malformed-count cases in §4.3.

### 4.4 D-4 — Write-path qualification mechanism (highest priority)

- **Exact question.** By what mechanism do QE-2 through QE-9 (and the write-related limbs of QE-1,
  QE-8, QE-9) produce the evidence Gate E §4 requires while W-1(3)/(4) keep every operational write
  refused — without weakening W-1, lifting fences, enabling `durable:true`, or inventing a bypass?
- **Governing source.** Gate E W-1 (four conjunctive preconditions) and §4; Gate 3 act §7 (“No local
  flag, environment variable, test result, default configuration or operator assertion substitutes for
  any predicate”); D-GC-I (disposable-copy fixture boundary, approved pattern); act §5.2(9) rev-2
  (stop-rule pending this determination); matrix §1 mechanism row + gap G-1.

#### 4.4.1 Verified implementation facts (IPD `main@1cceacff…`, read this pass)

| # | Fact | Evidence (identity) |
|---|---|---|
| 1 | Every operational write is refused **before any store mutation**: the dispatch checks membership in `IPC_WRITE_OPERATIONS` and answers `WRITE_NOT_AUTHORIZED`, with the in-source comment *"No environment flag, test result or operator assertion can enable writes."* Binding resolution and the C7 caller-key scan run first; the store is never reached. | `src/ipc/dispatch.ts` blob `6c8fcbc81a0e690f4cbb1e863e7ea6b6aea6905e` (SHA-256 `8466c704…`) |
| 2 | The port-level guard is hard-coded false: `evaluatePortSaveGuard()` returns `{authorized:false, reasons:['W-1(3)…','W-1(4)…']}`; `DurablePortfolioStorePort.assertWritable()` throws `WriteNotAuthorizedError` (zero store effect) for create/save/reset/delete. | `src/persistence/portfolio_store.ts` blob `2ee9630127316917d4a3541f6d6b2485f33e2b99` (SHA-256 `22e6065f…`); `src/persistence/durablePortfolioStorePort.ts` blob `97c5bc652765e6fa1aebc7cd7469da2ee92a1c29` |
| 3 | The **underlying domain store implements the full governed write semantics**: owner-scoped CRUD, immutable revisions `1→2→3→4` with cap, `REVISION_CONFLICT`, `InvalidPortfolioRequestError`, `ResourceUnavailableError` (missing ≡ foreign ≡ tombstoned), content-`Digest` idempotency (`ALREADY_IMPORTED_NO_OP` → returns existing revision, no new rows), tombstone `delete`, lineage persistence. The Gate 3 suite already exercises **exactly this** via direct `DurablePortfolioStore` calls on temp databases — the established precedent for direct-store domain testing. | `portfolio_store.ts` (as above); `tests/g3_write_gate.test.ts` blob `9035cbf129d4c1182d3a85f61eabc821b86433bc` (lifecycle/idempotency/tombstone/direct-store tests + IPC refusal + env-flag tests) |
| 4 | **No canonical-identity resolution exists in the durable write path.** Grep of `src/persistence/**` and `src/ipc/**` for `resolveCompanyId` / `SecurityMaster` / `UNMAPPED_IDENTIFIER` / `AMBIGUOUS_COLLISION` returns **zero matches**; `REFUSED_UNRESOLVED_IDENTITY` exists there only as an outcome type in `protocol.ts`. | Direct source inspection at `1cceacff…` |
| 5 | The **identity/DP-2-2F refusal limb lives at the session-port boundary**: `SessionPortfolioStorePort.saveHoldings` refuses caller identity keys (`INVALID_REQUEST`), then runs `evaluatePortSaveGuard(holdings)` returning `REFUSED_UNRESOLVED_IDENTITY` (with per-holding `refusedHoldings` quarantine detail) or `REFUSED_STORE_GUARD` **before any mutation**, then session `REVISION_CONFLICT`, delegating the save only if all pass. This file is a **Gate 3 §4.1 frozen anchor** and is exercised with real `SecurityMaster` fixtures by `tests/bi07_portfolio_store_port.test.ts`. | `frontend/src/features/portfolio/portfolioStorePort.ts` blob `d61f18dfdce12a7f0c4377a3c6d410026d454089`; `src/identity/{security_master,mapping_store,quarantine}.ts` blobs `60030e0c…`/`eec60c09…`/`70c6f658…` |
| 6 | **No binding re-read inside any store write transaction.** `portfolio_store.ts` contains zero `BEGIN`/`COMMIT`/`ROLLBACK` statements and does not import `binding.ts`; W-3's in-transaction re-validation is performed by `resolveActiveBinding`'s `BEGIN IMMEDIATE` read, which dispatch runs **per request before the write refusal**. Consequently (a) the W-3 race property is structurally unreachable through any currently-authorized path, and (b) multi-statement store writes are not wrapped in an explicit transaction by the store itself — **QE-4/QE-7 must record observed behavior as found** (partial state, if observed, is a FAIL finding, not something this pass may fix). | Direct source inspection of `portfolio_store.ts` (whole file), `binding.ts`, `dispatch.ts` |
| 7 | Reads through the production endpoint **work**: `portfolio.list/get/revisions` dispatch with per-request owner resolution — so post-revocation read refusal, tombstone indistinguishability, owner isolation and reconcile-by-read are all observable with every fence on. | `dispatch.ts` (as above) |
| 8 | The IRR side has a **real IPC client** for the two-process items: `frontend/server/user-portfolio/ipcClient.ts`, `ipcPortAdapter.ts` (Gate 3 act §5.1 consumer set). | IRR `frontend/server/user-portfolio/` listing at the designated commit |
| 9 | The accepted T-G evidence and act §7 preclude any as-if-satisfied mode: `tests/g3_write_gate.test.ts` asserts that `IIPS_ENABLE_WRITES`, `IIPS_G3_ENABLE_WRITES`, `GATE_E_OVERRIDE`, `NODE_ENV` **cannot** enable a write. | `g3_write_gate.test.ts` (as above) |

#### 4.4.2 Approaches compared

| Approach | Isolation boundary | Code path exercised | Evidence produced | Risks / prohibited side effects | Verdict |
|---|---|---|---|---|---|
| **A — Three-tier fence-preserving mechanism** (recommended): **T1** operational endpoint with all fences on; **T2** disposable-store-copy harness executing the real compiled store/migration/binding/entrypoint components outside the repository at recorded digests; **T3** the identity-capable session-port boundary with SecurityMaster fixtures | T1 = production configuration unchanged; T2 = D-GC-I extended (absolute path outside both repos, one copy per scenario, provenance before write, authoritative store never opened, synthetic data only, harness never wired into `package.json`/CI, harness source hashed into the deposit; direct store tests are component evidence); T3 = in-process session port + SESSION_ONLY/in-memory store with fixture inputs (component evidence only; the port consumes caller-prepared `identityStatus`/`companyId` and does not invoke `SecurityMaster`/`resolveCompanyId`) | T1: `dispatch.ts` refusal/read paths; T2: `portfolio_store.ts`, `migration_ledger.ts`, `connection.ts`, `binding.ts`, `ipc/entrypoint.ts` (real `dist/` build); T3: `portfolioStorePort.ts` + `src/identity/*` | Tier-labeled observations only; no full-path write/durability/outcome-unknown PASS where W-1 blocks the required operation | None to production: no bytes of W-1 code, fences, env or config change. Risks: mislabeling T2/T3 results as admitted writes (mitigated: mandatory per-scenario code-path labels + limitation-findings rule); fixture escape (mitigated: isolation rules + row-count checks) | **RECOMMENDED — narrowest evidence-sound solution** |
| **B — Qualification-mode / as-if-W-1-satisfied** | Would require a runtime switch making `evaluatePortSaveGuard()`/dispatch authorize inside a “qualification run” | Production write entry | Endpoint-level “successful writes” | **PROHIBITED and rejected**: requires editing the hard-coded guard (Gate 3 act §7; source comment); contradicts T-G's env-flag tests; constitutes W-1 weakening and creates a bypass class the policy expressly forbids; would require product code changes outside both limbs | **Rejected** |
| **C — Split-only** (execute only what current restrictions allow; defer the rest) | Same as T1 | Endpoint only | Partial coverage | Insufficient for a complete result by itself: T1 is necessary for all reachable endpoint behaviors, but does not establish positive write/restart/crash/idempotency/lineage behaviors blocked by W-1. Those remain component evidence or limitation findings; the criterion is not weakened or counted as passed | **T1 retained as an evidence tier; no unreachable criterion is treated as deferred-away or passed** |

#### 4.4.3 Recommended item-by-item mechanism (the D-4 resolution)

Criteria are **not redefined**. Each item executes across the tiers its requirement actually addresses,
with every artifact labeled by code path:

| QE | T1 — actual endpoint, all fences on | T2 — isolated disposable-copy harness | T3 — session/identity boundary | Classification / limitation; no promotion to full-path |
|---|---|---|---|---|
| QE-1 | caller-key refusal and preflight only | store component, no identity resolution | session-only one-match save and unresolved refusal with SecurityMaster fixtures | T2/T3 are **component-level**; durable IPC/persistence identity is a **limitation finding** |
| QE-2 | write-fence/no-bypass refusal and no store effect | row-count/store component | session-port DP-2 2F refusal | **Component-level** T2/T3; durable-path DP-2 2F gate is a **limitation finding** |
| QE-3 | reachable read/refusal limbs (e.g. tombstone/foreign/missing indistinguishability) | direct store stale-revision/reset/delete behavior | — | T2 positive writes are **component-level**; endpoint read subcriteria can be classified separately as **full-path** only if actually demonstrated |
| QE-4 | real processes may stop/restart and read, but dispatch refuses creation | real store commit/restart only on disposable copy | — | **Component-level** only; no full-path commit/read-back while W-1 blocks the required write |
| QE-5 | cannot create initial contribution through endpoint | direct store identical-digest no-op before/after restart | — | **Component-level** only |
| QE-6 | cannot create contribution through endpoint | direct store lineage/attribution transitions and restart | — | **Component-level** only |
| QE-7 | real-entrypoint startup refusal can be tested on tampered/withheld migration fixture | forced termination/store inspection on disposable copy | — | Startup subcriterion may be **full-path** if its complete path/controls pass; crash-atomicity whole criterion remains a **limitation finding** unless demonstrated; any partial state is FAIL |
| QE-8 | post-revocation read refusal; writes remain refused; refusal does not prove race control | component-only race attempt, not W-3 proof | — | **Limitation finding** for in-transaction binding re-read/write race; `portfolio_store.ts` has no explicit transaction and imports no binding resolver |
| QE-9 | reachable refusal/read classes only; class and no-effect capture | isolated store refusal classes/row counts | isolated session-port refusal classes | **Component-level** for T2/T3; **limitation finding** for inaccessible W-15 outcomes; no overall PASS unless every authoritative class/path is demonstrated |
| QE-10 | client no-retry/read reconciliation on reachable outcomes; no accepted write is possible | isolated transport/client harness | — | **Limitation finding** for outcome-unknown after an accepted write; client-only output is **component-level** |
| QE-11 | T1 required for host/endpoint Q2/Q3/Q4/Q9/Q10/Q11; Q1 records-only | fixtures supplemental for Q2/Q4 only | supplemental only | Each Q classified separately; Q9 mandatory; test completion is not Gate C acceptance; separate Gate C and Gate 4 acceptance |

For every QE, the matrix's four labels control: **Full-path qualification** (entire required path and criterion demonstrated), **Component-level evidence** (isolated code path only), **Limitation finding** (required behavior unreachable under pinned implementation/safeguards), or **Invalid/inconclusive run** (prerequisites/controls/evidence not met). Only full-path qualification can satisfy an end-to-end criterion. No QE execution has occurred; the current table is a source-based reachability assessment, not a result.

**Prohibited side effects (all tiers):** no edit to `evaluatePortSaveGuard`, dispatch, or any W-1
path; no environment variable, config value or flag that changes write behavior (T1 proves the
existing negative tests again on the host); no HTTP `503` route lift; no `durable:true` flip;
no write to any authoritative/operator store; no harness committed as a repository runner or wired
into `package.json`/CI; no claim anywhere that a T2/T3 write was an admitted endpoint write.

**Why this is evidence-sound:** every measurement runs against the real qualified components at
recorded digests; the production safeguards are simultaneously demonstrated (T1) rather than
disabled; criteria stay verbatim; where the code cannot produce a specified behavior, the run
produces a **finding**, which is what qualification is for.

- **Exact proposed act wording.** Act **§5.5 (new)** adopts this mechanism with the item-by-item table,
  the labeling rule, the limitation-findings rule, and the prohibited-side-effects list; §5.2(9) is
  re-pointed to §5.5; §8 gains the two mechanism rows shown in the act.
- **PA decision required `[P]`.** Express adoption of the mechanism (no located record authorizes a
  Gate 4 write-fixture harness: D-GC-I was rendered for the read-only Gate C subset). Exact decision
  and proposed resolution: **§6 Q4**.
- **Remaining prerequisite / risk.** If PA declines, rev-2's stop-rule governs: every affected item
  stops for clarification and Gate 4 cannot complete (consequence in §6 Q4).

### 4.5 D-5 — Execution sequencing

- **Exact question.** What is the dependency-ordered plan covering prerequisites/Gate A′, Limb A,
  preflight, QE execution, and evidence disposition — and which steps need another act?
- **Governing source.** Gate E §4 (“Executed on the Windows deployment host, **after Gate A′
  provisioning**…”); Gate 3 act §11 (Gate A′ `APPROVED — NOT EXECUTED`, P-1 preconditions,
  `provisioning.ts` library-only with no executable entrypoint); act §5.2–§5.4; D-GC-F.
- **Verified facts.** Gate A′ has no execution record; its P-1 preconditions are adopted but
  unexecuted; current `provisioning.ts` exposes no entrypoint (creating one is outside both limbs);
  historical Gate A′ host evidence reports Node `v24.14.0`, which exceeds the patch floor but violates required major 22 and is not current target-host preflight evidence.
- **Recommended plan `[E]` (PA confirms `[P]`):**

  | Step | Action | Authority basis | Gate moved? |
  |---|---|---|---|
  | S0 | PA determination → act effective (Act ID assigned; fixed baseline pins, D-4/D-6/D-8/D-9/D-10 and the H-12 deferral protocol confirmed; **no H-12 adoption yet**) | this act §9 | Gate 4 → **AUTHORIZED** (not started) |
  | S1 | **Gate A′ execution record** on `desktop-no0nhtp` (P-1 preconditions; store/schema compatible with exact current migration blobs) | **existing approval only** — `APPROVED — NOT EXECUTED`; **not granted by this act**; execution recorded under its own P-1 record | none (Gate A′ completes on its own record) |
  | S2 | Limb A: branch → implement §4.2 → IPD PR → PR-head CI → `--merge` → post-merge CI → read-back → **native-Windows canonical `npm test` at the post-merge commit** | this act §4/§6.1 | none |
  | S2a | Regenerate the source/criteria/anchor/IRR manifest at exact final IPD + fixed IRR commits; validate every mandatory source path and obtain **distinct express PA adoption/replacement** of membership/hash protocols before preflight. At S3/build, capture exact compiled-runtime (`dist`) hashes before QE; hash evidence-deposit bytes when generated and verify remote read-back after publication. No adoption or required-path absence = stop | act §5.2(6)–(7), packet §4.7/Q7–Q8 | none; H-12 remains a blocker until adopted |
  | S3 | Host/runtime preflight: `win32`, designated non-elevated account, Node 22.x `>=22.13.0 <23` re-measured as Node 22.x `>=22.13.0 <23`, `node:sqlite` probe, exact designated commits and clean worktrees; only after S2a | this act §5.2(2)–(6) | none |
  | S4 | QE-1…QE-11 execution in the authoritative order (Q11-before first per adopted H-12/D-GC-§11, Q9 mandatory cold+warm, Q11-after last), under §5.5 mechanism | this act §5.1–§5.5 + D-6 re-issue | none (execution ≠ acceptance) |
  | S5 | Evidence integrity: manifests, before/after digests, raw-byte hashes, remote publication + independent read-back | act §9 (D-8) | none |
  | S6 | Dispositions: Gate C result-acceptance (for QE-11's “accepted” limb) → Gate 4 result-acceptance (W-1(3)) → Gate 5 | **separate acts — not granted here** | per those acts |

- **Dependencies verified against authoritative definitions:** S1 is the hard Gate E §4 precondition;
  S2 must precede S4 so the canonical runner works at the final commit; S2a follows S2 because the
  mandatory future test cannot be hashed before it exists, and a separate PA adoption is required
  before any host preflight/QE; S3 gates S4; QE-11 depends on D-6 plus an adopted H-12 manifest; S6
  gates W-1(3) and nothing else.
- **Independently authorizable under this act:** Limb A, Limb B, documentation/evidence publication.
  **Requiring another act:** Gate A′ execution (existing approval; own record), any implementation
  beyond Limb A, Gate C acceptance, Gate 4 result acceptance, Gate 5, `503` lift, `durable:true`.
- **Exact proposed act wording.** Act §5.2(4)–(5) as revised, plus §7 preserving Gate A′ non-grant.
- **Remaining prerequisite.** Gate A′ evidence and Node 22.x `>=22.13.0 <23` runtime are hard stops;
  additionally, complete H-12 validation plus express PA adoption must occur after S2 and before S3.
  None is a PA latitude, a silent omission, or a result inferred from publication.

### 4.6 D-6 — QE-11 and Gate C subset re-basing

- **Exact question.** What is the exact current basis for the QE-11 subset (Q1–Q4/Q9–Q11), which
  referenced criteria/evidence are stale, and what acceptance boundary applies?
- **Governing source.** Gate E §4 QE-11; L-IPC-1 §10 (Q definitions); D-GC rendered decision
  (`IIPS-V3-G2-IPD-GATE-C-QUALIFICATION-AUTHORITY-2026-10-17-01`, blob `9befe6d8…`) §§4–8, §11
  (H-1…H-13, ordering), D-GC-B/D-GC-F/D-GC-I; G3-D5 `REFERENCE ONLY`; Gate 3 act §11 (Gate C
  `NOT EXECUTED`).
- **Verified facts.** The D-GC execution grant names `refs/heads/gate-b/local-principal-ipc-implementation @
  cec7080252183a6a5332efe351e61c254d342a2d` (tree `22a7438c…`) — now **reference-only** (G3-D5), not an
  ancestor of IPD `main@1cceacff…`. H-12's “15 implementation files + `package.json` + `tsconfig.json`”
  and D-GC §8 boundary #5 (“fifteen files, tree `22a7438c…`, ref `cec7080`”) are therefore **historical**.
  Still current and applicable: D-GC-F (Windows host; POSIX non-qualifying), D-GC-B (V-waivers govern;
  no V-1/V-3/V-4 re-run), D-GC-§7 (Q1 `AUTHORIZED — records only`; Q5–Q8 deferred ⇒ `PARTIAL — Q5–Q8
  DEFERRED`), H-1…H-11/H-13 as operational criteria, H-6's invalid/failed distinction, Q9 mandatory.
  A Gate V result “passed and published **on the deployment host**” for the *current* basis is **not
  located** as a separate record (see gap G-12).
- **Recommended decision.**
  1. **Re-issue** the seven-item **execution** grant inside this act's Limb B against the designated
     current commits (IPD final Limb A commit + designated IRR consumer commit). The historical grant
     is not reused and not amended.
  2. **H-12 re-based** per D-7; all other H-items carry forward unchanged.
  3. **Q1 records-only** exactly per D-GC §7 + D-GC-B + H-13 (V-5 inventory + waiver reading recorded
     verbatim); no invented test execution; waivers stated as waivers, never as technical proof.
  4. **Acceptance boundary:** Limb B covers **execution and recording only**. QE-11's *“passed and
     accepted”* second limb requires a **separate Gate C result-acceptance act** (prerequisite: the
     completed Q-subset evidence reviewed under the ratified criteria) — **left unauthorized**; Gate C
     stays `PARTIAL` (Q5–Q8 deferred) even after acceptance; **passing tests alone never satisfy
     “accepted.”**
- **Alternatives.** (a) Separate Gate C execution act instead of re-issue here — consequence: a fourth
  instrument and an extra PA round-trip for work this act already sequences; rejected as unnecessary
  but available if PA prefers instrument separation. (b) Reusing the `cec70802…` grant — impossible
  (reference-only lineage; different code).
- **Exact proposed act wording.** Act §5.2(8) as revised in revision 3, including the explicit
  sentence: “Passing tests, a green CI run, or a completed execution record never satisfy QE-11's
  *accepted* limb.”
- **Remaining prerequisite.** PA confirmation of the re-issue (§6 Q6) and disposition of gap G-12
  (Q1 Gate-V currency): recommended reading — the historical Gate V record plus D-GC-B waivers carry
  forward as records for Q1's records-only limb; alternative — Q1 recorded `INCONCLUSIVE` pending a
  current-basis Gate V record. **PA chooses.**

### 4.7 D-7 — Q11/H-12 digest-set re-basing

- **Exact question.** Which artifacts remain authoritative for Q11's drift check, which changed, what
  is added/removed/superseded, and what hashing rules apply?
- **Governing source.** D-GC-H/H-12 + H-7 (hash “of every artifact, harness, and the 15 files”);
  Gate 3 act §4.1 (10 frozen anchors), §4.2 (14 implementation files), §4.3 (8 test files);
  Gate 3 acceptance §3.2 (22-file manifest with per-file Git blob, LF SHA-256 **and** CRLF SHA-256);
  rev-2 packet §13 (27+1 proposal).
- **Verified facts / dispositions.**
  - **Superseded (removed):** the entire historical 15-file Gate B set — off-`main`, `REFERENCE ONLY`
    (G3-D5); not present on `main@1cceacff…`.
  - **Authoritative (carried):** `package.json`, `tsconfig.json` (both were in H-12 then and now);
    the Gate 3 22-file manifest; the 10 §4.1 frozen anchors (`ci.yml` `aeee464f…`, `vite.config.ts`,
    `package-lock.json`, frontend `portfolio-store.ts` `b900a248…`, `portfolioStorePort.ts`
    `d61f18df…`, `src/identity/{security_master,mapping_store,quarantine}` `60030e0c…`/`eec60c09…`/
    `70c6f658…`).
  - **Added:** `scripts/run-tests.mjs` (post-Limb-A), `tests/g4_run_tests_summary_parsing.test.ts`,
    conditional `scripts/test-summary-parser.mjs`.
  - **Gap found in rev-2's 27+1 set:** it omits the identity trio and the two frontend session-port
    files — precisely the code QE-1/QE-2's identity limbs exercise (D-4 facts 4–5).
- **Proposed candidate set `[P]` — not presently eligible for PA adoption:** `G4-H12-MANIFEST-v2`
  1. **32 mandatory IPD paths** = rev-2's 27 (4 `src/ipc/*` + 10 `src/persistence/*` + 8 `tests/g3_*`
     + `scripts/run-tests.mjs` + `tests/g4_run_tests_summary_parsing.test.ts` + `package.json` +
     `package-lock.json` + `tsconfig.json`) **+ 5** (`src/identity/security_master.ts`,
     `src/identity/mapping_store.ts`, `src/identity/quarantine.ts`,
     `frontend/src/features/portfolio/portfolioStorePort.ts`,
     `frontend/src/features/portfolio/portfolio-store.ts`).
  2. **+1 conditional:** `scripts/test-summary-parser.mjs` (present-with-digest or recorded `ABSENT`;
     later appearance = drift).
  3. **+ frozen-anchor record:** `.github/workflows/ci.yml` = `aeee464feb76e2d1e9d104e1cae4e5dde37700ad`
     (recorded as anchor state, per rev-2 §13.1).
  4. **IRR consumer set** exactly per rev-2 §13.2 (consumer files + fence/transport/config identities)
     at the designated IRR commit.
  5. **Runtime-artifact manifest:** executed `dist/**` hashes recorded separately (source digests do
     not prove loaded bytes) — rev-2 §13.1 rule retained.
  6. **Hashing rules:** repository entries use the Git blob object ID (SHA-1) and SHA-256 over the exact bytes returned by `git cat-file blob <commit>:<path>`; **no newline conversion or normalization**. LF, CRLF, mixed LF/CRLF, and bare CR bytes are distinguished and byte-significant; the manifest records counts and newline classification. A Windows `autocrlf` worktree must not be substituted for the pinned Git blob. Deposit artifacts use SHA-256 over actual artifact bytes, without normalization, with newline form recorded separately. Repository-source and compiled-runtime manifests are measured before Q11-before and after Q11-after; each evidence-deposit artifact is hashed when generated and independently re-hashed from remote read-back after publication. Any qualified-surface drift invalidates the run.
- **Adoption gate.** The current candidate has 31 of 32 mandatory IPD paths present; required
  `tests/g4_run_tests_summary_parsing.test.ts` is absent at the accepted baseline. Therefore no current
  adoption is recommended or permitted by this proposal. After authorized Limb A creates and merges
  that test, regenerate the exact candidate at the final IPD commit, verify all present/conditional/
  anchor/criteria/deposit identities, and obtain a distinct express PA adoption/replacement decision
  before host/runtime preflight or any QE. If absent, mismatched, or not PA-adopted, stop before
  preflight/QE; do not treat this as an accepted omission.
- **Alternatives.** Narrower set (rev-2's 27+1): consequence — identity/session-port limbs of
  QE-1/QE-2 would sit outside the drift check. Broader (every repo file): consequence — noise from
  unrelated paths invalidating runs without qualification relevance. Rejected.
- **Exact proposed act wording.** Act §5.2(6) reference to `G4-H12-MANIFEST-v2` as specified in this
  packet §4.7 + packet §13 (revision 3 adds the five paths).
- **Remaining prerequisite.** PA adoption before execution (§6 Q7). **Not approved by this packet.**

### 4.8 D-8 — Evidence format and destination

- **Exact question.** What directory/naming, metadata, raw-vs-normalized, hashing, sensitivity and
  publication rules govern QE evidence?
- **Governing source.** Gate E §4 (“raw output published”); H-7 (raw unedited logs + JSONL + SHA-256
  of every artifact/harness/file-set; run id `GQ-<yyyymmdd>-<nn>`); H-13 (Q1 recording format);
  precedent `evidence/integration/gate-c-p2-establishment-2026-10-14/`; rev-2 packet §§13.3–14.
- **Recommended rules `[P]` (adopt rev-2 + the following).**
  1. **Destination/naming:** exactly one **new** directory per run:
     `evidence/integration/gate-4-target-host-qualification-GQ-<yyyymmdd>-<nn>/` (H-7 run id in the
     directory name; repeated attempts get new run IDs; no existing raw file overwritten).
  2. **Layout:** `raw/**` (unedited stdout/stderr, transcripts, JSONL, process logs — immutable),
     `MANIFEST.json`, `Q11-BEFORE.json`, `Q11-AFTER.json`, `QE-01.md`…`QE-11.md` (procedure, exact
     commands, result, artifact links — interpretation, kept separate from raw), `WINDOWS-CANONICAL-
     TEST.md`, `EXECUTION-RECORD.md` (all attempts, stops, separately-identified evidence-publication
     commits, non-grants), plus the **harness source copy + its SHA-256** if one was used.
  3. **Required metadata (MANIFEST.json):** run id; UTC start/end; IPD/IRR commits + root trees +
     remote ancestry; qualified-surface manifest digests (D-7); host identity fields per rev-2 §14
     (computer/account/OS build/arch); Node `version/platform/arch/execPath` + executable SHA-256 +
     `process.versions`; every command with UTC timestamp and exit status; tool versions (node, npm,
     TypeScript as printed); per-artifact size + SHA-256; harness hash.
  4. **Hashing:** deposit artifacts = SHA-256 of actual bytes, **no line-ending normalization**;
     repository surfaces = Git-blob domain (D-7). The manifest records which domain each hash belongs
     to.
  5. **Raw vs interpretation:** raw is immutable evidence; `QE-NN.md`/`EXECUTION-RECORD.md` are
     interpretation and must link to raw artifacts; no synthesized rows (H-7); failed attempts retained.
  6. **Sensitive host details:** no secrets, credentials, tokens or real/user portfolio data may be
     captured (stop publication and escalate if any appears — rev-2 §5.2(7)); host name/account are
     recorded as already governance-recorded (`desktop-no0nhtp`, designated account); fixture paths
     recorded in full (operator-local, non-secret); no OS-level hardening claims beyond observed output.
  7. **Publication + independent read-back:** deposit copied out of the qualified worktrees after
     Q11-after; published via the IRR PR workflow (PR-head CI green, post-merge `main` push CI green,
     `ls-remote` agreement); **independent read-back** = a second fetch from the remote with
     byte-for-byte SHA-256 comparison of every published artifact against the local originals, recorded
     in the receipt (established §16.77.9/§16.79.11 pattern).
- **Alternatives.** Normalizing line endings before hashing — rejected (destroys byte identity of
  Windows-origin logs; rev-2 already fixed this). Committing raw logs into the qualified worktrees —
  rejected (breaks Q11 worktree stability).
- **Exact proposed act wording.** Act §9 (evidence) adopts these rules by reference to this packet §4.8.
- **Remaining prerequisite.** PA adoption (§6 Q8).

### 4.9 D-9 — Failure handling and destructive fixtures

- **Exact question.** How are failed/inconclusive/interrupted/partial items recorded, and what
  safeguards govern destructive operations (QE-4 process stop/restart; QE-7 forced termination +
  migration tampering)?
- **Governing source.** Matrix §1 failure row (gap G-6: no authoritative rule); H-6 (ratified:
  invalid = control/drift/host failure → discard, record, repeat; failed = valid run missing a
  criterion → record FAIL, never re-run silently to a pass); D-GC-I (fixture boundary, rendered for
  the read-only subset); Gate E W-12 (crash/full-or-none; startup refusal); G2-D3(b) (stop both
  processes; no OS reboot).
- **Verified facts.** QE-4 stops **both real processes** (disruptive by design, non-destructive to
  data); QE-7 force-terminates mid-write and tampers with migration state (destructive **to the store
  under test**); the D-GC-I pattern (disposable copies, provenance before write, one copy per scenario,
  authoritative store never opened/written/used, retention until acceptance act) was approved for
  fixtures in Gate C but its text was rendered for the read-only subset (matrix gap G-8).
- **Recommended rule `[P]` (fail-closed; builds only on ratified H-6).**
  1. **Statuses per item per attempt:** `PASS` / `FAIL` / `INCONCLUSIVE` / `INVALID` (H-6 definitions
     verbatim), always against the exact recorded digests, always with raw output attached.
  2. **No relabelling, no omission, no silent re-run to a pass.** Invalid runs may be repeated after
     the invalidating cause is fixed and recorded (H-6); failed runs may be re-run only as **additional
     attempts**, all retained; the first valid result stands as the finding.
  3. **Partial/interrupted runs:** recorded as `INCONCLUSIVE` with everything captured; **never**
     cited as a Gate 4 qualification or partially accepted as one.
  4. **Escalation:** every `FAIL`/`INCONCLUSIVE`/`INVALID` and every stop escalates to PA for
     disposition (re-run / abort / accept-as-finding at result acceptance). Qualification discovers
     defects; it does not repair them (act §5.2(11)).
  5. **Destructive-fixture extension of D-GC-I (QE-4/QE-7):** disposable isolated store copies at
     absolute paths outside both repositories; source path + source SHA-256 + copy SHA-256 + timestamp
     recorded **before** any write; one copy per scenario; pre-run backup copy; authoritative store
     **never opened, written, or used**; process kills/tampering target only processes bound to
     fixture paths (endpoint names unique per run); recovery = fresh copy from backup/source (no row
     repair, no partial restore); copies + kill transcripts + pre/post dumps retained until the
     acceptance act records disposal (deletion then recorded).
  6. **Not executed by this pass** — specification only.
- **Alternatives.** No fixture extension → QE-7/QE-4 cannot run at all (worse than the risk);
  running destructive cases against the authoritative store → permanently prohibited (D-GC-I).
- **Exact proposed act wording.** Act §10 adopts these six points; §5.4 keeps the stop conditions.
- **Remaining prerequisite.** PA adoption (§6 Q9).

### 4.10 D-10 — `durable:true`: measurement versus claim

- **Exact question.** What may QE evidence record about durability fields, and what remains a
  prohibited claim?
- **Governing source.** Gate E W-11 (durable reported only on durable commit; SESSION_ONLY never
  labelled durable; **no durable-portfolio-capability claim of any kind** in UI, documentation,
  tracker, evidence or release note before the Gate 4 result-acceptance act); Gate 3 act §8.4 (same
  prohibition; `SESSION_ONLY`/`durable:false` vocabulary for the session path); `durability`
  vocabulary test T-H; D-4 facts 2–3 (the durable port labels itself `DURABLE` by design).
- **Verified facts.** QE-4 raw output will necessarily contain fields the qualified code emits (e.g.
  `durability: "DURABLE"` from the durable port, `state: 'DURABLE'` display vocabulary); the IRR
  frontend session path stays `SESSION_ONLY` / `durable: false`; no record currently draws the
  measurement/claim line explicitly (matrix gap G-7).
- **Recommended reading `[P]`.**
  1. **Measurement:** raw qualification output may (and will) contain durability fields exactly as
     emitted; quoting them verbatim in `raw/**` and in `QE-04.md` labeled *“observed response field of
     the qualified durable port under qualification — measurement, not a capability claim”* is
     permitted and required for fidelity.
  2. **Claim:** no narrative in any UI, document, tracker row, evidence summary, execution record or
     release note may assert that durable portfolio capability **exists, is qualified, or is
     available** before the Gate 4 result-acceptance act. Specific fixed sentence for QE-4 records:
     *“Observed persistence behavior on the designated host at the recorded digests; this is a
     measurement, not a durable-portfolio capability claim; no durable capability is claimed until a
     separate Gate 4 result-acceptance act.”*
  3. **Unchanged:** `SESSION_ONLY`/`durable:false` on the session path; W-11's own reporting rule for
     the implementation; act §8.4's prohibition list.
- **Alternatives.** Strip durability fields from raw output — rejected (raw must be unedited);
  treat any quoted field as a claim — rejected (would make QE-4 unpublishable and misreads W-11's
  target: capability claims, not observed output).
- **Exact proposed act wording.** Act §5.6 (new) adopts the three points verbatim.
- **Remaining prerequisite.** PA adoption of the reading (§6 Q10) — two accepted records interact, so
  this is genuinely `[P]`.

### 4.11 D-11 — Executor and recording capacity

- **Exact question.** Who executes and records, which capabilities are demonstrated vs assumed, and
  what are the verification/escalation duties?
- **Governing source.** Gate 3 act §8.3/§11 (host, Node floor); D-GC-F (host); observed session
  capabilities across this program (IPD `403` write boundary recorded at §16.75/acceptance §2.1;
  operator-executed channels 2–3; Arena-published IRR PRs #180–#192 with CI + read-backs).
- **Verified capability table.**

  | Capability | Status |
  |---|---|
  | Operator: native-Windows canonical `npm test` + direct TAP on `desktop-no0nhtp` (channels 2/3) | **Demonstrated** (operator-supplied, recorded) |
  | Operator: IPD ref/PR merges (PR #41) | **Demonstrated** |
  | Arena: IRR documentation publication, CI observation, `ls-remote`, API read-backs | **Demonstrated** (PRs #180–#192) |
  | Arena: IPD writes | **Denied** (`HTTP 403`; read-only throughout) |
  | Arena: native-Windows / host / destructive execution | **Not available — never to be requested** |
  | Host Node 22.x `>=22.13.0 <23` | **Not demonstrated — assumed non-compliant until re-measured** (historical `v24.14.0`) |
  | Host `node:sqlite` flag-free | **Not demonstrated** (preflight probe required) |
  | Gate A′ execution state | **Not executed** (external prerequisite) |

- **Recommended assignment `[P]` confirmation.** **Executor:** Ramki, as operator, on
  `desktop-no0nhtp` only — preflight, QE execution, fixture management, raw capture, execution record
  attestation (actual values, no expected values). **Recorder/preparer:** Arena (this role) —
  packets, act, matrix, evidence deposit assembly support, publication, remote read-back — explicitly
  **not** execution. **Independent verification:** (i) second remote read-back of every published
  artifact (byte compare), (ii) fresh-clone digest reproduction of the qualified-surface manifest;
  recorded honestly as re-verification by the same recording session, not a second human witness.
  **Escalation:** any stop/`FAIL`/`INCONCLUSIVE`/`INVALID` → PA disposition before anything proceeds;
  no Arena-side attempt to perform host operations under any circumstance.
- **Exact proposed act wording.** Act §8 operator row + §5.2(1)–(3) as revised.
- **Remaining prerequisite.** PA confirmation (§6 Q11).

### 4.12 D-12 — Tracker registration

- **Exact question.** How are the act and its status registered — preserving numbering and decision
  IDs — without ever registering authorized/started states before the events?
- **Governing source.** Tracker §16.79/`CV-CORR-60` (rev-2 records-only registration complete,
  receipt §16.79.11/`CHG-2026-10-22-12`/`V253`–`V255`); packet-index `G4-PROPOSED` row; the §16.75 /
  §16.77 pattern (determination section + later receipt subsection; publication coordinates never
  self-embedded).
- **Verified facts.** Records-only registration of proposal status is already resolved (rev-2 D-12
  checkbox `[x]`). Identifier census at this pass: `CV-CORR-60`, `§16.79*`, `CHG-2026-10-22-11`–`12`,
  `V241`–`V255` are **taken**; **`CV-CORR-61`, `§16.80`, `CHG-2026-10-22-13`, `V256`+ are free** (grep
  count 0 in the current tracker).
- **Recommended registration scheme `[P]` at PA determination (exact).**
  1. **This pass:** tracker `§16.80` / `CV-CORR-61` / `CHG-2026-10-22-13` / `V256`+ registers **only**
     that the corrective proposal (revision 4) + this determination packet are published and remain
     `PROPOSED — NOT EFFECTIVE`; Gate 4 `NOT AUTHORIZED / NOT STARTED`; zero register movements; the
     packet-index `G4-PROPOSED` row gains an additive revision-3 qualifier.
  2. **At PA determination:** a new section (next free: `§16.81`) records the determination instrument
     (assigned Act ID, adopted/changed decisions, pin confirmations, D-4/D-6/D-7/D-8/D-9/D-10
     adoptions), followed later by its publication receipt subsection (self-embedding rule), exactly
     as §§16.75/16.77/16.79. Status transitions written **as events occur**: effectiveness →
     `AUTHORIZED — NOT STARTED`; first host command → `STARTED`; Gate C acceptance / Gate 4 result
     acceptance rendered → those statuses in their own sections.
  3. **Preserved:** every existing section number, decision identifier (`Q1-B`/`Q2-A`/`Q3-A`,
     `AC-1`…`AC-8`, `D-GC-*`, `H-1`…`H-13`), register count discipline (`35/9/51×17/17/8/11`), and
     the rule that no row may state authorized/started before the underlying event.
- **Alternatives.** Editing §16.79 in place — rejected (immutable historical section + completed
  receipt). Registering nothing — rejected (task requires recording actual proposal status).
- **Exact proposed act wording.** Act §12 row: “Records-only tracker/index registration of this
  proposal: PERMITTED DOCUMENTATION, NOT GATE AUTHORITY” (retained from rev-2) + §9(3).
- **Remaining prerequisite.** None for this pass; PA determination triggers item 2 (§6 Q12 confirms
  the scheme).

## 5. D-4 implementation-evidence summary (cross-reference)

The full evidence tables, approach comparison and per-item tier map are in §4.4.1–§4.4.3 above; the
operative act wording is act §5.5. Headline: **the production fences are hard-coded and tested as
immutable (facts 1–2, 9); the governed write semantics exist and are directly testable (fact 3); the
identity-refusal limb exists at the frozen session-port boundary (fact 5); the durable path lacks the
identity gate and any in-transaction binding re-check (facts 4, 6).** The three-tier mechanism measures
all of it honestly without touching a safeguard; anything the code cannot produce becomes a
limitation finding for result-acceptance — never a pass, never a bypass.

## 6. PA decision sheet (only genuinely PA-rendered decisions remain)

Recommended defaults are proposals. Nothing is decided until PA renders.

| Q | Decision required | Recommended default | Consequence if declined / altered |
|---|---|---|---|
| **Q1** (D-1) | Assign the Act ID: `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01`? | **Assign as proposed** | No ID → no effectiveness possible; Gate 4 blocked |
| **Q2** (D-2) | Confirm IPD accepted base `1cceacff…`, IRR QE code pin `d355d904…`, IRR proposal/documentation pin `f741298…`, and the four-part rule; designate future IPD Limb A/QE commit only after its merge and before preflight/run | **Confirm as proposed** | Any other pin severs Gate 3 acceptance identity or repeats today's drift problem |
| **Q3** (D-3) | Confirm the exact three-path Limb A boundary + §4.3 matrix + §4.4 stop | **Confirm as written** | Widening breaches `Q2-A`/G3 manifest discipline; narrowing may leave the defect unfixed |
| **Q4** (D-4) | **Adopt the three-tier fence-preserving qualification mechanism** (§4.4.3) with per-scenario code-path labels and the limitation-findings rule | **Adopt as proposed** | Default per rev-2: every affected item **stops**; QE-2…QE-9 cannot execute; Gate 4 cannot complete. Approach B remains rejected regardless |
| **Q5** (D-5) | Confirm S0–S6 plus S2a: Gate A′ evidence, Node 22.x `>=22.13.0 <23`, and complete H-12 validation/express PA adoption after Limb A but before host preflight/QE | **Confirm as proposed; H-12 adoption is deferred, not granted now** | Any omission/reordering violates Gate E §4 or risks an unbound/missing mandatory path; no host preflight/QE without all hard prerequisites |
| **Q6** (D-6) | Re-issue the seven-item QE-11 **execution** grant on current commits; keep acceptance separate; choose G-12 reading (Q1 Gate-V currency) | **Re-issue in this act; G-12 → historical records + waivers carry forward for the records-only Q1 limb** | Alternative: separate Gate C execution act (more instruments); G-12 alternative: Q1 `INCONCLUSIVE` at run |
| **Q7** (D-7) | After Limb A creates mandatory `tests/g4_run_tests_summary_parsing.test.ts`, will PA expressly adopt or replace the regenerated, fully validated H-12 manifest (32 IPD mandatory paths + conditional helper + ten anchors + IRR/criteria/runtime/deposit sets; exact-byte hash domains)? | **Defer adoption now.** Current candidate is incomplete at the pinned baseline; return with full future-tree validation and exact final IPD commit/tree before preflight/QE. | No H-12 adoption means no host preflight/QE; if path remains absent or any digest/set is unverified, stop rather than omit, re-pin silently or claim Q11 support. |
| **Q8** (D-8) | Adopt the evidence layout, metadata minimum, raw-byte hashing, sensitivity and publication/read-back rules | **Adopt as proposed** | Otherwise evidence is unreproducible or unpublishable without a later amendment |
| **Q9** (D-9) | Adopt the failure-status rule and the D-GC-I fixture extension for QE-4/QE-7 | **Adopt as proposed** | Decline → destructive items cannot run; silence leaves matrix gap G-6 open (execution procedurally incomplete) |
| **Q10** (D-10) | Adopt the measurement/claim split + fixed non-claim sentence | **Adopt as proposed** | Unresolved publication conflict stops QE-4 (rev-2 rule) |
| **Q11** (D-11) | Confirm executor (operator on `desktop-no0nhtp`), Arena's preparation-only role, verification and escalation duties | **Confirm as proposed** | Any other assignment conflicts with demonstrated capability boundaries |
| **Q12** (D-12) | Confirm the registration scheme (§16.80 now; §16.81+ at determination; event-driven status transitions) | **Confirm as proposed** | Colliding or premature registrations would violate numbering/status discipline |

Plus the standing determination on the act as a whole: **adopt / adopt-with-changes / reject** —
without which nothing in the package is effective (act §9).

## 7. Verification index (this pass)

| ID | Check | Result |
|---|---|---|
| DR-V1 | IPD live `main` = `1cceacfff40f22dbc9cd64906bf26a5feac1075e`; CI `39765365164` `success` | **Verified** §2 |
| DR-V2 | IRR live `main` re-resolved twice during the pass (`4f472283…` → `5ad25c6c…` → `c6ddfccd…`); both movements audited to Markdown-only diffs with green CI and read-back receipts | **Verified** §2 |
| DR-V3 | Wrapper defect, blobs, no-wrapper-test census re-verified at `1cceacff…` | **Verified** §4.4/§4.3 |
| DR-V4 | D-4 facts 1–9 re-derived from source at `1cceacff…` (dispatch refusal + comment; hard-coded guard; store semantics; zero identity-resolution matches in persistence/ipc; session-port 2F refusal + anchor blob; zero BEGIN/COMMIT/ROLLBACK in `portfolio_store.ts`; working read path; IRR ipcClient presence; T-G env-flag tests) | **Verified** §4.4.1 |
| DR-V5 | Gate E §4 / W-1 / W-11 / L-IPC-1 §10 / D-GC (H-1…H-13, §7 Q1, §8, §11) / G2-D3 re-read at authoritative blobs (`4a9501bf…`, `cab04b6f…`==`fc8d1cbc…` §10, `9befe6d8…`, `0a538659…`) | **Verified** §4 |
| DR-V6 | Gate 3 instruments byte-identical (`4744e6f4…`/`f4992f9c…`; `85ba78e6…`/`cf6d72b5…`; `f3a6c9a3…`/`e1433fac…`); fence blobs `cb8db45d…`/`51704c12…`/`98147054…`; `ci.yml` `aeee464f…` | **Verified** §2, act §7 |
| DR-V7 | Identifier census: `CV-CORR-61`/`§16.80`/`CHG-2026-10-22-13`/`V256`/`-03` records/this packet ID all previously unused | **Verified** §4.12 |
| DR-V8 | Non-grant scan: this packet grants nothing, decides nothing, executes nothing; no PA decision asserted; no effective act overwritten; stop boundary held (documentation-only working tree; IPD read-only; no Windows/QE/destructive execution) | **Verified** §1.4 |
| DR-V9 | Every determination D-1…D-12 appears exactly once in §3, is resolved in §4, and maps to an act location and (if PA-only) a §6 question | **Verified** |

## 8. Stop boundary attestation (this pass)

No modification of `scripts/run-tests.mjs` or any product/test/runner/dependency/workflow/fence path;
no execution of QE-1…QE-11; no process-restart or destructive qualification; no change to W-1, HTTP
`503` fences, or `durable:false`; no Gate A′/Gate C/Gate 5 action; no IPD write of any kind; no
representation of the act as effective; no PA decision fabricated.

*End of the Gate 4 determination-resolution packet D-1…D-12. **Prepared recommendations only — Gate 4
remains `NOT AUTHORIZED / NOT STARTED` until a Program Authority determination makes the final act
effective under its §9.***


## 7. Revision 4 corrective findings and dispositions (supplement; does not alter authority)

### 7.1 D-4 evidence reachability, item by item

The source review at IPD `main@1cceacfff40f22dbc9cd64906bf26a5feac1075e` confirms: (a) `src/ipc/dispatch.ts` checks the write operation set and returns `WRITE_NOT_AUTHORIZED` before store mutation; the code says no environment flag/test/operator assertion enables writes; (b) `evaluatePortSaveGuard()` hard-codes `authorized:false` for W-1(3)/(4); (c) `src/persistence/portfolio_store.ts` has no explicit `BEGIN`/`COMMIT`/`ROLLBACK` and no binding import; (d) no identity resolver/SecurityMaster call exists in the IPD IPC/persistence write path; (e) identity refusal exists at the separate session-port boundary; (f) the W-3 binding check occurs before the write refusal rather than re-read in a transaction enclosing mutation. These are source facts, not QE results. Existing HTTP 503 fences and W-1 refusals remain untouched.

| QE | Required end-to-end behavior | Tier capability and boundary | Current disposition classification | Further authority required? |
|---|---|---|---|---|
| QE-1 | Identity-resolved holding persists; zero/conflicting identity refused with quarantine; caller identity fields refused | T1 proves caller-key refusal only; T2 reaches store but has no identity resolver; T3 exercises SecurityMaster/session-port only | **Limitation finding** for durable IPC/persistence identity; T3 is component-level, not PASS | Yes, separate PA implementation authority to integrate approved resolver in durable path, while preserving DP-2 2F/W-1 and fences |
| QE-2 | DP-2 2F unresolved/ambiguous refusal before serialization/port/store; no bypass or partial revision | T1 proves existing W-1 refusal/no effect; T3 tests session-port identity refusal; neither proves durable path identity | **Limitation finding** for durable path; component evidence only | Same separate identity-path implementation authority |
| QE-3 | Revision/lifecycle, stale revision, tombstone and no-disclosure semantics | T1 can establish the reachable read/refusal limbs; T2 can inspect direct real-store component semantics; no operational write can reach them | **Component-level evidence** for positive write/lifecycle limbs; any exact read-only limb fully exercised at endpoint may be reported separately as full-path, never as overall QE-3 PASS | Separate implementation authority required if criterion requires an admitted application write |
| QE-4 | Commit, stop both real processes, restart, byte-accurate read-back/durability | T1 exercises real process and refusal but cannot create a committed write; T2 tests real compiled store component and restart only in isolated copy | **Component-level evidence** only; no full-path durability qualification | Yes, implementation authority needed for any write enablement beyond this proposed evidence scope; never lift W-1/503 here |
| QE-5 | Identical content digest returns no-op without new revision before/after restart | T2 can test real store method on disposable copy; T1 write is refused; T3 irrelevant | **Component-level evidence** only | Yes, separate authority to create a reachable authorized write path; criterion unchanged |
| QE-6 | SHA-256 lineage and attribution unchanged across restart/REPLACE/RESET | T2 can inspect real store component and fixture; T1 cannot create contribution | **Component-level evidence** only | Yes, same separate write-path authority |
| QE-7 | Forced termination during write yields full revision or none; tampered migration startup refuses | T1 can establish startup refusal through real entrypoint; T2 can destructively probe the actual compiled store only on disposable copies. No explicit multi-statement transaction is present; atomicity cannot be presumed | **Limitation finding** for complete crash-atomic write criterion pending evidence and implementation; startup subcriterion may be reported independently | Yes, separate PA implementation authority if transaction/recovery changes are needed; no fix authorized here |
| QE-8 | Revoked binding blocks reads/writes incl. restart; a revocation racing a write never commits post-revocation | T1 may demonstrate reachable read refusal; write remains fenced; T2 may inspect components but store has no in-transaction binding re-read | **Limitation finding** for write/race criterion; read-only endpoint observations are separate full-path evidence for their own subcriteria | Yes, separate PA authority for transactional binding recheck/write integration |
| QE-9 | Every W-15 condition yields prescribed class and no store effect | T1 proves endpoint classes that are actually reachable; write refusal masks downstream store/identity outcomes; T2/T3 can cover isolated components only | **Component-level evidence** for covered cases; **limitation finding** for inaccessible classes; never claim overall matrix PASS unless all prescribed conditions are demonstrated through required path | Yes if inaccessible classes require code-path integration; not granted |
| QE-10 | Post-send timeout produces outcome-unknown, no IRR auto-retry, reconcile-by-read | IRR client can be tested against real endpoint; because writes refuse, this does not establish outcome-unknown after an accepted write. A disposable harness remains component evidence | **Limitation finding** for the accepted-write end-to-end limb; client no-retry component evidence may be recorded | Yes if a separate authorized implementation/test fixture is needed to meet full criterion; no bypass here |
| QE-11 | Q1–Q4/Q9–Q11 executed per basis and accepted; mandatory Q9 zero bytes | T1 endpoint/host procedure is needed for Q2/Q3/Q4/Q9/Q10/Q11; Q1 records-only. T2/T3 cannot substitute for Q9 or Gate C procedures | Each subcriterion independently gets one of the four matrix classes; Gate C acceptance is separate and not inferred from test passes | Separate Gate C acceptance act; separate Gate 4 result acceptance also remains |

The four evidence classifications are mutually distinguishable: **full-path qualification**, **component-level evidence**, **limitation finding**, **invalid/inconclusive run**. A PASS is permitted only where the actual prescribed complete path and acceptance criterion are satisfied. A T2 or T3 result is never relabeled as full-path. A limitation is not a PASS.

### 7.2 Node runtime finding

The effective Gate 3 act has two conjunctive clauses: §8.1 states **“Required Node major | 22”** and §8.3 states **“Minimum functional runtime for the implementation | Node ≥ `22.13.0`.”** Thus require Node 22.x `>=22.13.0 <23`; `node:sqlite` is flag-free from `v22.13.0`. The earlier QE-1 summary containing only `>=22.13.0` omitted §8.1. The prior conclusion that `v24.14.0` violates the supported major is correct, though its host measurement is historical. Record runtime using `node -p "JSON.stringify({version:process.version,platform:process.platform,arch:process.arch,execPath:process.execPath,versions:process.versions})"`; separately execute a flag-free in-memory `node:sqlite` create/insert/select/close probe and capture command/output/warnings/exit. No target-host preflight was performed.

### 7.3 QE-11 / Gate C

Authoritative subset: Q1–Q4 and Q9–Q11; Q1 is records-only under the rendered D-GC §7/H-13 reading. Q5–Q8 are deferred, so any Gate C subset outcome remains **`PARTIAL — Q5–Q8 DEFERRED`**. Q9 is the mandatory C5.1 no-byte test: cold and warm, N≥10 (10 each per approved H-1), no bytes before valid authorized request; 5 s idle timeout observation, accepted-connections/no-refusal counter, liveness before and after, and InOut valid-frame direction control are required under H-2…H-5. Invalid controls invalidate the run. The rendered Gate C execution-authority basis references the historical `cec70802…`/tree `22a7438c…` basis; it does not authorize substituting current Gate 3 code by implication. Any execution must identify immutable current code and criteria bases under a valid grant. **Passing the prescribed tests does not, by itself, constitute Gate C acceptance.** Test execution, Gate C result acceptance, and Gate 4 result acceptance are three separate states. Stale historical evidence must be superseded by a new run at the designated basis; do not carry forward old runs.

### 7.4 H-12 candidate and baseline split

`G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` is not adopted. It contains exact Git blob SHA-1, exact-byte SHA-256, repository, commit/tree, path, byte size, and line-ending treatment for current present source, criteria and anchor entries; it marks mandatory future summary-parser test `tests/g4_run_tests_summary_parsing.test.ts` absent at the pinned baseline and the helper conditional. It does not invent future Limb A or QE commits or artifacts. Baseline content-integrity validation (record `IIPS-V3-G4-H12-CANDIDATE-VALIDATION-2026-10-22-01`; [report](./G4-H12-MANIFEST-v2-CANDIDATE-VALIDATION-2026-10-22.md)) verified **55/55 present entries, 9/9 criteria references, 10/10 frozen Gate 3 anchors and 17/17 historical entries** with no digest/tree mismatches (candidate manifest SHA-256 `3eedd70c994271dfc9ac23bd603f7a9e2f273cb1a68d3172cd3a7737344096ae`). This is expressly **partial** validation: the one mandatory future IPD test path is absent at the accepted IPD baseline, so the full future qualified tree is not yet validated and the candidate must not be adopted or described as fully validated. Revalidate that path and the complete manifest at the exact final merged Limb A commit before preflight/QE. The historic D-GC H-12 set was 15 files plus `package.json` and `tsconfig.json` on the stale Gate C basis; the candidate re-bases the current Gate 3 IPC/persistence/test surface and the session-port identity surface, adds current IRR consumers/fences/tests/configuration and criteria references, and retains explicit future paths. The candidate JSON carries all 17 historical entries at `cec7080252183a6a5332efe351e61c254d342a2d` and the path-by-path delta: four relative paths overlap (`src/ipc/endpoint.ts`, `src/ipc/entrypoint.ts`, `package.json`, `tsconfig.json`); 13 historical Gate-B implementation/test paths are superseded by the accepted Gate-3 source layout; the current candidate adds its enumerated current IPD, IRR consumer/fence/test/configuration and criteria paths plus one explicitly absent future Limb-A test. Each removal/addition is explained in the JSON. The ten Gate 3 §4.1 frozen anchors are separately recorded at the accepted IPD pin (eight overlap the candidate entries). This is an expanded/rebased proposal, not PA adoption. PA must approve/reject the path list, hash domains, newline policy, required/conditional status, exact IRR code pin, and future IPD commit designation protocol.

### 7.5 Baselines and Gate A′

Live IPD main is `1cceacfff40f22dbc9cd64906bf26a5feac1075e` (accepted Gate 3 implementation; tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`). IRR Gate 3 accepted implementation/evidence basis is `d355d904aa52988e70a98324714886f6a1c0ea2a` (tree `e631cf3287fc19a2d1c8f73a0eb5f8d640370e27`); current proposal/documentation pin is `f741298fc73372a27c822b7f9018702216b59cfd` (tree `b9e88cde55c0c8694f42f90c60ae3cbce1a081d2`). The only post-baseline content commit is `11320d92ef755a56226f4cf112f4d9ef8d46fac5` (tracker-only), merged by `f741298`; no Gate 3 code/safeguard/acceptance evidence changed. IRR QE consumer code pin is fixed at `d355d904aa52988e70a98324714886f6a1c0ea2a` / tree `e631cf3287fc19a2d1c8f73a0eb5f8d640370e27`, subject to unchanged H-12 blobs; the current proposal/documentation pin is `f741298` and is not the consumer code pin. The future IPD Limb A/QE execution commit is unknown now and must be fixed only after authorized merge, green CI, remote read-back and native-Windows canonical `npm test`, before host/runtime preflight. H-12 must then be fully validated and expressly PA-adopted/replaced before preflight; current mandatory future test is absent. Gate A′ is an external hard prerequisite under Gate E §4 and Gate 3 act §11: existing `APPROVED — NOT EXECUTED`; require a separate execution record establishing approved P-1 provisioning against exact compatible migration/store basis before any QE. Gate 4 does not grant Gate A′ or additional provisioning implementation.
