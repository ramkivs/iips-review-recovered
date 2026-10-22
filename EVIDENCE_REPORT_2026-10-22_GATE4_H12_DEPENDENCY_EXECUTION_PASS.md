# Gate 4 / H-12 and DR/GOV Dependency Execution Pass

**Prepared:** 2026-10-22 UTC  
**Purpose:** Current-state evidence pass and decision/dependency reconciliation. This is an investigation and preparation record, not an authority act.  
**Repositories:** `ramkivs/iips-review-recovered` (IRR) and `ramkivs/iips-production-market-data` (IPD).

## 1. Executive verdict

- **Critical path:** Gate 4 revision 4 remains `PROPOSED — NOT EFFECTIVE`; Act ID remains `PENDING ASSIGNMENT`. H-12 remains a partial candidate, not adopted. The mandatory parser regression file is absent from both investigated IPD baselines and repository history. Limb A cannot begin until a separate effective PA act authorizes it. No Gate 4 execution or H-12 adoption is evidenced.
- **DR-1–DR-4:** DR-1 is a real prerequisite for GOV-04's Gate A′ successor provisioning and execution; DR-2, DR-3, DR-4 remain distinct PA contract/schema decisions. DR-3's safe current disposition is to keep `durability` and `durable` absent. None is an implementation grant.
- **GOV-04/GOV-05:** GOV-04 ownership source remains non-operational; approved historical Gate A′ basis is inapplicable to current IPD artifacts. GOV-05 remains reference-only and blocked. PR #114 is currently OPEN in IRR and reports `mergeable: CONFLICTING`; it is unrelated to a Gate 5 admission grant.
- **QE-11/Gate C:** No QE-11 execution evidence and no Gate C acceptance. Passing a subset is not acceptance; Gate C acceptance and Gate 4 result acceptance are separate acts. Gate A′ execution, authorized Limb A, finalized/adopted H-12, and the effective Gate 4 grant are prerequisites to the contemplated host qualification sequence.
- **Tracker:** The current main tracker already records the verified dispositions and DR/GOV findings. No factual status was found demonstrably stale in the inspected records, so no tracker edit was made. This report is new evidence preparation, not a tracker/register movement.

## 2. Verified current baselines

Remote refs were fetched/read on 2026-10-22. `git ls-remote` returned:

| Repository/ref | Commit | Tree | Evidence / state |
|---|---|---|---|
| IRR `refs/heads/main` | `922fdc78e14d036588e4208bdc9f5d8ff84b4a1a` | `634996e3051ca6586a2b18d5aef1a7e7ee9ee57f` | Current remote main; CI run `39834832899` completed/success on this SHA. |
| IRR report branch `arena/93c104a6-iips-review-recovered` | `2d55420b3f59f187bec265244515d9ac77b0a963` | (report-branch tree) | Prior published report source commit, fetched and read in full, including appendices. |
| IPD `refs/heads/main` | `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` | `66020736919befa5e5320550a396187cd351b40e` | Current remote main; prior report records post-merge CI `39820730894` success. |
| IPD accepted Gate 3 baseline | `1cceacfff40f22dbc9cd64906bf26a5feac1075e` | `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9` | Accepted implementation pin, ancestry parent of current main. |

PR #114 was checked in the repository that owns that PR: IRR #114 is `OPEN`, title “Browser-only broker preview and bounded NP-18 intelligence views (non-production),” base `main`, head `arena/d57c506a-iips-review-recovered` at `e331995a94b704e078b27a70a36cbc161311fd09`, `mergeable: CONFLICTING` (GitHub reports `mergeStateStatus: UNKNOWN`). Querying #114 in IPD returned “Could not resolve to a PullRequest”; therefore the tracker’s PR #114 lineage is correctly an IRR PR, not an IPD PR.

### Prior evidence reused

Read the complete `EVIDENCE_REPORT_2026-10-22_GATE4_H12_CV-CORR-64_VERIFICATION.md` at report-branch commit `2d55420b3f59f187bec265244515d9ac77b0a963`, all 405 lines including its provenance appendix. Reused its exact-byte manifest checks, CV-CORR-64 merge/CI verification, prior lineage census, and scoped implementation evidence where pins remain current. Cross-checked current IRR/IPD tips and current IRR main CI in this pass. No completed test or host exercise was repeated.

## 3. Dependency graph and execution matrix

```text
PA assigns act ID + renders required Gate 4 determinations + effectiveness (Q1–Q7 etc.)
  ├─ hard: Gate A′ successor basis decision DR-1 → authorized Gate A′ execution + host record (Gate E §4)
  ├─ hard for Limb A: explicit bounded implementation authorization (Q3 / act §4.2)
  │    → implement only runner summary region + mandatory new test (+ conditional pure helper)
  │    → CI, remote read-back, native-Windows canonical npm test
  │    → exact final IPD commit/tree fixed; no inferred future pin
  └─ after Limb A: regenerate and fully validate H-12 at exact candidate; express PA adoption/replacement (Q7)
       → prescribed host/runtime preflight (Node >=22.13.0 <23; node:sqlite)
       → QE-1…QE-11 under effective/re-issued execution grant (Q6)
       → evidence integrity/publication
       ├─ separate Gate C acceptance for QE-11 subset
       └─ separate Gate 4 result acceptance
            → distinct Gate 5 admission decision/prerequisites (not automatic)

Parallel decision preparation now: DR-2 (contract + mappings), DR-3 (durability), DR-4 (004), GOV-05 lineage/PR census.
```

| Item | Type/status | Hard/conditional dependencies | Proceed independently now? | Smallest next action / closure evidence | Invariant until closure |
|---|---|---|---|---|---|
| Gate 4 act effectiveness / ID | PA decision; proposal only | Assignment and explicit rendering under proposal §9 | Decision preparation only | PA assigns unique act ID, renders required decisions and effectiveness record | Not effective, unauthorized/not started |
| Q2 baseline/pin protocol | PA decision and pin discipline | No future IPD pin until authorized Limb A merge/CI/read-back/Windows pass; distinct IRR pins | Yes, prepare decision | PA confirms roles and pin rules; record final commit/tree before preflight | No silent repin/rebase/cherry-pick |
| Q3 Limb A boundary | PA authorization | Gate 4 act effective | Scope review yes; implementation no | PA explicitly authorizes §4.2 bounded paths | Frozen workflow/out-of-scope files unchanged |
| Q4 execution mechanism | PA decision | Act effectiveness | Yes, decision-ready | Render mechanism/limitation rule in act | Fences/refusal remain unchanged |
| Q5 ordered sequence | PA decision | Prerequisite records | Yes, decision-ready | PA resolves any textual ordering conflict and adopts order | No preflight/QE before prerequisite closure |
| Q6 QE-11 grant reissue | PA decision | Effective act, current exact basis; H-12 basis fixed/adopted as required | Prepare only | Reissue subset grant against current immutable bases | No QE-11 execution without grant |
| Q7 H-12 | PA decision + later validation | Limb A final candidate; complete manifest and integrity checks | Candidate analysis yes | After authorized final commit, regenerate/validate, then explicit adoption/replacement | Candidate remains partial/not adopted |
| DR-1 | PA act then authorized provisioning/execution | Current code/schema identity; hard for GOV-04 | Decision preparation yes | Successor bounded act naming exact current commit/tree/tools/schema and host, then separate execution record | No provisioning/host execution claim |
| DR-2 | PA contract and mapping authorization | Before any admitted read claim | Yes | Resolve seven fields + three renames, per-field semantics and explicit IRR mapping authorization | Diagnostic metadata only; refusal/fence behavior unchanged |
| DR-3 | PA disposition | Full conformance claim/result acceptance | Yes | Keep both fields absent unless explicit authoritative disposition | No false persistence claim |
| DR-4 | PA schema/migration act | Before contribution-lineage admitted read | Yes | Decide migration 004 and attribution/backfill/acceptance evidence | No schema/migration change |
| GOV-04 | Investigate now; operational completion blocked | DR-1 successor authority + execution; other contract items apply to read/admission | Yes, investigation completed | DR-1 then authorized provisioning and evidence; resolve DR-2/DR-4 for full read conformance | Source remains non-operational; no claim of provisioning |
| GOV-05 | Downstream admission | Landing; provisioning; Gate 4; QE; acceptance; DR-2/3/4; Gate 5 act | Lineage census yes | Preserve reference-only; admission act only after prerequisites | No lineage promotion or Gate 5 start |

## 4. Program Authority decision register

No decision below is rendered by this report. Recommendations reproduce current proposal/decision preparation and tracker §16.82; they are not approvals.

| ID | Governing source | Recommendation (not decision) | Evidence / dependency impact | Required authority; deferral consequence |
|---|---|---|---|---|
| Gate 4 Act ID / effectiveness (Q1) | `docs/integration/IIPS_v3.0_G4_TARGET_HOST_QUALIFICATION_AUTHORITY_ACT_PROPOSED_2026-10-22.md` §§1, 9; determination packet §6 Q1 | PA assigns the effective act ID and resolves the proposed act; do not use proposal record ID as act ID. | Proposal header says `PROPOSED — NOT EFFECTIVE`; Act ID `PENDING ASSIGNMENT`. Without effectiveness neither Limb A nor QE authority exists. | Program Authority. Deferral blocks both authorized limbs and Gate 4 start. |
| Q2 pin/baseline protocol | Proposal §§2, 5.2; QE matrix revision 4; prior report §§5.1, 5.3 | Preserve separate pins: IPD accepted base `1cceacff…`; current IPD main `73fd8c16…`; IRR QE-consumer `d355d904…`/tree `e631cf…`; IRR proposal/docs `f741298…`/tree `b9e88c…`. Designate future IPD QE commit only after authorized Limb A merge, checks, remote read-back and native-Windows canonical pass, before preflight. | IPD `73fd8c16…` descends from accepted base; it is not the proposed QE commit. IRR consumer and docs pins have different roles. | PA confirms protocol. Deferral forbids choosing candidate/pin and prevents reproducible H-12/QE basis. |
| Q3 scope authorization | Proposal §4.2 and Gate 3 amendment §6.4(1) | If authorized, limit to `scripts/run-tests.mjs` summary-parsing/report region; new `tests/g4_run_tests_summary_parsing.test.ts`; optional `scripts/test-summary-parser.mjs` only as pure side-effect-free helper. | Paths remain named in current proposal; excluded paths/workflow and guard semantics explicitly frozen. New test absent at inspected baselines/history. | PA, separate effective authority. Deferral blocks implementation; scope cannot expand. |
| Q4 execution/limitation rule | Proposal §5.5 and determination packet Q4 | Adopt the proposed fence-preserving tiers and record `limitation` distinctly from PASS; keep refusal/fences active. | Existing write refusals prevent live write-path qualification; prior report documents proposed three-tier method. | PA. Deferral blocks execution where live path cannot be exercised honestly. |
| Q5 ordering | Proposal §§5.2, 5.8, determination packet Q5 | Adopt the evidenced S0→S6 sequence with S2a after Limb A: effectiveness; Gate A′ evidence; Limb A merge/checks/native Windows; H-12 complete validation/adoption; preflight; QE; evidence integrity; separate dispositions. PA must confirm if packet/act text is interpreted differently. | Gate E §4 requires Gate A′ before QE; act §5.2(6) and corrected tracker §16.80.11 place H-12 completion/adoption after Limb A and before preflight/QE. No record makes successful tests formal acceptance. | PA resolves any conflicting ordering. Deferral blocks safely sequencing work. |
| Q6 QE-11 execution grant | Proposal §5 and determination packet Q6 | Re-issue grant for Q1–Q4/Q9–Q11 against named current bases; retain Q1 records-only treatment and separate Gate C acceptance. | Original grant references off-main `cec70802…`; cannot be silently transferred. No QE execution found. | PA. Deferral bars QE-11. |
| Q7 H-12 manifest/adoption | Proposal §5.2(6); H-12 validation record; determination packet Q7 | Defer adoption; after authorized Limb A commit, establish exact file set/digests and complete validation, then PA expressly adopts/replaces. | Current manifest partial only: 55/55 present entries, 9/9 criteria, 10/10 anchors, 17/17 historical items checked; mandatory future test missing. Hash-generation distinction and future identities remain governed by manifest/validation packet; no final candidate exists. | PA. Deferral bars preflight/QE using H-12; never treat absence as pass. |
| DR-1 | Tracker §16.82.3, .5; Gate A′ source record and Gate E §4 | Successor bounded act naming current IPD commit/tree, tool/schema blobs, designated host and minimal issuer entrypoint; explicitly supersede old execution basis. | Old Gate A′ pins at `2ded0e98…` include `src/gate_a` and migration blob not present at current IPD main (`provisioning.ts`/migration 003 differ). Gate E §4 makes completed Gate A′ a hard QE prerequisite. | PA. Deferral blocks GOV-04 operational provisioning and the later QE sequence. |
| DR-2 | Tracker §16.82.4–.5; frozen v1/G2 contract records | v1 minor revision for seven missing fields and three mappings (`holdingsCount→totalHoldingsCount` twice; `committedAt→createdAt`); per-field source/lifecycle semantics, notably `isSaved`; explicit IRR mapping authorization. | Current probe recorded 7 absent + 3 renamed. `renamedInV1` is diagnostic metadata only and does not alter serializer, refusals, HTTP behavior or fence. Adapter refusals are preserved. | PA for contract and IRR mapping. Deferral bars any claim of fully conformant admitted read. |
| DR-3 | Tracker §16.82.5; Gate 3 acceptance record | Keep `durability`/`durable` absent pending authoritative result-acceptance decision; do not say false/true. | SQLite-backed store does not justify `durable:false` claim; `durable:true` explicitly prohibited without authority/evidence. | PA at result-acceptance/conformance boundary. Deferral does not block bounded work but blocks full-conformance claim. |
| DR-4 | Tracker §16.82.5; frozen `G2Contribution` schema | PA authorize migration 004 with frozen attribution fields and refuse-don’t-guess backfill; define validation/acceptance evidence. | Current projection is narrower than frozen contribution contract; attribution includes `sourceBroker`, `fileName`, `contentDigest`, `lineageDigest`, `importedAt`, `holdingsCount`, `totalMarketValue`. | PA for schema/migration; acceptance authority for evidence. Deferral blocks contribution-lineage admitted read. |

## 5. H-12 remediation and validation matrix

The controlling sources are the proposed act §4.2–4.4, §5.2, candidate manifest and `G4-H12-MANIFEST-v2-CANDIDATE-VALIDATION-2026-10-22.md`. The candidate's exact list is authoritative only as a proposal; do not manufacture a final replacement manifest now.

| Artifact / requirement | Current status | Prerequisite and closure evidence |
|---|---|---|
| `scripts/run-tests.mjs` summary parser region only | Existing runner; authorized change not granted | Effective PA act / Q3; bounded diff; parser regression matrix; full prescribed checks; no change to discovery/stale-build/zero-test/exit guards. |
| `tests/g4_run_tests_summary_parsing.test.ts` | Absent at IPD accepted baseline `1cceacff…`, current main `73fd8c16…`, and reported full history | Only after Q3 authorization; test discovered/executed; all TAP/spec LF/CRLF/CR, malformed, zero, failure, skip, source/discovery and child-exit cases; count delta explained. |
| `scripts/test-summary-parser.mjs` | Conditional; absent unless needed | If used, only pure side-effect-free parser, and included in manifest. Absence explicitly recorded if unused. |
| Complete mandatory manifest | Candidate partial; manifest SHA-256 `3eedd70c994271dfc9ac23bd603f7a9e2f273cb1a68d3172cd3a7737344096ae` | After final authorized IPD candidate commit exists: list exact required set per adopted decision; calculate Git blob identity separately from raw deposit-byte SHA-256; define newline handling; regenerate against exact candidate/tree and validate all source, criteria, anchors, runtime/evidence/deposit references. |
| CI | Prior Linux/CI evidence is not Limb A candidate evidence | Green PR-head and post-merge CI for exact authorized change/commit; record run IDs and tested SHA. |
| Native Windows canonical test | Not performed | On `desktop-no0nhtp`, exact candidate, Node `>=22.13.0 <23`, platform/runtime/node:sqlite identity; canonical `npm test`, non-zero test count, zero failures, skips disclosed and guard OK. CI is not a substitute. |
| Executed `dist`/deposit identity and criteria refs | Not final-candidate-bound | Exact candidate/tree identity; generated and raw deposit bytes separately hashed; evidence tied to the same code and criteria identity. |
| H-12 validation/adoption | Not fully validated, not adopted | Full exact-byte validation, all mandatory paths present, and separate express PA adoption/replacement before preflight/QE. |

## 6. DR/GOV findings

### DR-1 and GOV-04

The tracker §16.82.3–.5 records prior artifact comparison: Gate A′ approved historical basis (`2ded0e98…` / `9069045d…`) pins `src/gate_a/provision.ts`, `src/gate_a/validate.ts`, and migration 003 blobs absent/different at current IPD main `73fd8c16…` (current `provisioning.ts` blob `dc844189…`, migration 003 `32b125bf…`, no `src/gate_a/`). Its no-substitution condition prevents running current artifacts under that old approval. **Recommendation:** DR-1 successor act, then separate host-scoped provisioning execution record with host/runtime, exact code/schema, commands/results, store/binding evidence. No operational provisioning is claimed.

DR-1 is the direct hard blocker for GOV-04 because Gate E §4 requires completed Gate A′ provisioning before QE; any other readiness/conformance issue (DR-2/DR-4, and DR-3 for full-conformance claims) remains separately unresolved. The ownership source was previously observed as 0 bindings/memberships and endpoint zero bytes; that prior evidence is reused, not represented as a new live host probe.

### DR-2

Tracker §16.82.4–.5 corrects the rename metadata: `G2PortfolioSummary.totalHoldingsCount`, `G2PortfolioView.totalHoldingsCount`, and `G2RevisionEntry.createdAt` differ from v1 names. The three `renamedInV1` entries are diagnostic-only; no refusal path, serializer or route consumes this metadata. Preserve recorded refusal/fence behavior. Seven missing fields and the mappings require explicit contract semantics and IRR mapping authorization; adding fields in IPD alone is insufficient.

### DR-3

Keep both `durability` and `durable` absent until a specific authoritative decision supports a truthful statement. `durable:true` is forbidden; `durable:false` is also not a safe substitute for the actual SQLite persistence semantics. No persistence/wire change made.

### DR-4

Migration `004` is not authorized or implemented. Required decision: schema/migration scope, attribution columns matching frozen `G2Contribution`, refuse-don’t-guess backfill, contribution lineage, affected artifacts, and acceptance evidence. No schema change made.

### GOV-05

Current IPD main landing is satisfied (`73fd8c16…`), but landing is not qualification. Remaining recorded gates: applicable provisioning authority/execution (DR-1); effective Gate 4 act; QE-1…QE-11 on deployment host; separate result acceptance; DR-2/DR-3/DR-4 decisions as applicable; and Gate 5 admission act naming qualified commits. Historical G24/NP-04 lineages remain unpromoted. Tracker §16.82.6 identifies `6828155e…` and `2e11fa3b…` as not ancestors of IPD main, `c1b955b4…` branch-only, and IRR `470cc698…` branch-only. PR #114 check is recorded above. Gate 5 not initiated.

## 7. QE-11, Gate C, Gate 4 and Gate 5 sequence

**Evidence-backed order in the current proposal/tracker; conditional on PA rendering and any explicit ordering resolution:**

1. **Entry:** PA resolves proposal questions, assigns act ID and makes Gate 4 act effective. Until then no Limb A/QE authority.
2. **Gate A′:** DR-1-compatible successor act as needed, then separate authorized Gate A′ provisioning execution and evidence record. Gate E §4 requires completed provisioning before QE.
3. **Limb A:** only after authorization, exact bounded implementation; CI, remote read-back, then canonical native-Windows test. Fix exact candidate SHA/tree; no guessed future pin.
4. **H-12 S2a:** regenerate final manifest against that exact candidate and complete all byte/hash/domain checks; obtain express PA adoption/replacement. No preflight/QE until this closes (act §5.2(6), tracker §16.80.11).
5. **Preflight:** designated deployment host and prescribed Node 22.x `>=22.13.0`, node:sqlite, identity/source/runtime checks; no host preflight was done in this pass.
6. **QE-1…QE-11:** execute only under effective/reissued grant and exact immutable code/criteria pins; keep PASS/FAIL/INCONCLUSIVE/INVALID and limitation distinct; retain all attempts. QE-11 covers the prescribed Q1–Q4 and Q9–Q11 subset, Q1 records-only, Q5–Q8 deferred; H-1…H-13 retained; required C5.1/Q9 controls per governing criteria. Passing tests alone is not Gate C acceptance.
7. **Evidence integrity/publication:** bind raw outputs and manifests to exact code/criteria/tree and host/run identity.
8. **Separate acceptances:** Gate C acceptance for QE-11 subset is separate; Gate 4 result acceptance is also separate. Neither is implied by successful execution. Neither grants production authority.
9. **Gate 5:** only after applicable qualification and acceptance evidence plus a separate admission decision naming qualified commits and satisfying all GOV-05 prerequisites. No automatic advancement.

The proposal + its determination packet establish this proposed sequence. If the PA interprets the relationship between Gate 4 effectiveness, H-12 adoption, QE-11 and Gate C differently, that is an explicit unresolved PA ordering decision; no technical success resolves it.

## 8. Work completed in this pass

- Fetched current IRR remote refs and report branch; verified `main` remains `922fdc78…`; independently checked current IRR main CI run `39834832899` success and IPD `main` remains `73fd8c16…`.
- Read the complete published 405-line verification report including appendix before relying on it; reused relevant prior checks rather than rerunning host/test work.
- Re-read the current proposal boundary and tracker §16.82; consolidated Q1–Q7, DR-1–DR-4, GOV-04/05 dependencies, H-12 requirements and sequence above.
- Re-queried PR #114 in IRR and confirmed OPEN/conflicting; checked IPD and confirmed #114 is not an IPD PR.
- No source/product/test/workflow/schema/fence changes; no tracker edit, as no stale status requiring correction was established; no Gate 4/host/QE/adoption/acceptance/admission operation.
- Prepared this report. It is not yet published to IRR main; no publication is claimed.

## 9. Outstanding blockers — minimum action

| Blocker | Owner/authority | Minimum unblocking action |
|---|---|---|
| Gate 4 proposal has no effective act ID or determination | Program Authority | Render the proposal's decisions, assign effective act ID and record effectiveness under §9. |
| Limb A has no implementation grant | Program Authority | Explicitly authorize exact §4.2 paths and constraints; no scope expansion. |
| H-12 lacks mandatory test and complete final candidate | Depends on PA authorization, then implementer + PA | Authorize/complete Limb A; bind final commit; regenerate/full validate; obtain express adoption. |
| Gate A′ old basis mismatches current IPD | Program Authority, then designated host operator | Render DR-1 successor act; separately execute and record compatible provisioning. |
| QE-11 grant does not transfer to current pins | Program Authority | Reissue the bounded grant against fixed commits/criteria after prerequisites. |
| Contract/schema questions DR-2/DR-3/DR-4 | Program Authority | Render per-decision dispositions; migration only under separate authorization. |
| Gate C and Gate 4 acceptance not rendered | Acceptance authority | After valid execution, issue separate acceptance act(s) on exact evidence. |
| Gate 5 admission prerequisites unmet | Program Authority/admission authority | Close all prerequisite evidence, then separate admission decision. |

## 10. Boundary confirmation

- **Gate 4 authorization/start:** remains not effective, unauthorized, not started.
- **H-12 validation/adoption:** partial baseline content-integrity only; full validation blocked; not adopted.
- **QE-11:** not executed; no fresh grant evidenced.
- **Gate C acceptance:** not accepted; separate act remains required.
- **Gate 5 initiation/admission:** not initiated; lineages remain reference-only.
- **Production authorization:** absent.
- **Security/admission fences:** unchanged; no fence behavior or refusal path was modified.
- **Governance-register movements:** none in this pass; tracker was not changed.

**Authority boundary:** all recommendations above are preparation only. No PA decision, implementation authority, validation, acceptance, admission or production authorization is created by this report.
