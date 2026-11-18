# IID Stage 4 — independent entire-scope audit

**Record type:** audit finding and evidence snapshot; **not** an acceptance, policy or limitation-register decision.
**Audit record date:** 2026-11-17 (UTC). GitHub records returned merge/run timestamps on 2026-11-18; those timestamps are preserved, not silently rewritten to match the record date. This is a **commit-bounded** audit, not a claim about what existed at midnight on 17 November.
**Repository / branch:** `ramkivs/iips-review-recovered`, `arena/5461e5b5-iips-review-recovered`.
**Assessed baseline:** `2ec2e75d0c1c042f646e94cb1ec6e0def21bfb6c` = fetched `origin/main` = starting branch HEAD (PR #594).
**Late remote refresh:** main advanced during publication to `70f76134deba91de4ddca9e932542231b298cdf9` (PR #596); independently reviewed, preserved verbatim, and reconciled on this same branch. No implementation/data changes; §11 records the delta.

**Evidence:** [`evidence/iid/STAGE4-INDEPENDENT-AUDIT-2026-11-17/`](../../evidence/iid/STAGE4-INDEPENDENT-AUDIT-2026-11-17/README.md).

## 1. Conclusion, with the four requested classifications kept separate

**Stage 4 is NOT complete.** Its appropriate overall classification remains **PARTIALLY COMPLETE**. The measurement capability is delivered; the entire acceptance demonstration, fresh operational data, operating-metric requirement and real corporate-action evidence are not all discharged. There is no evidence permitting an independent declaration of complete Stage-4 acceptance. Overall IID operational readiness remains **NOT READY in the records**; the current Windows diagnostic itself is **UNVERIFIED** here. Under PA-01 that diagnostic is not a production-style release prohibition.

- **Completed and recorded closed/discharged:** **S4-R4, S4-R5, S4-R7**. The existing G-7 runtime vocabulary correction, G-14 static remainder, G-10 route correction and G-11 stored/served-chain capability are supported, within their stated boundaries.
- **Recorded closed, but only a bounded requirement satisfied:** **S4-R2** is formally recorded CLOSED **on the assessment path**. Its new transcription and resulting assessment reproduce. The original coverage-availability limb is still withheld; do not describe this as an installed Technology coverage unlock.
- **Open/partially completed:** **S4-R1**, **S4-R3**, and its explicit **S4-R3-Infosys** sub-item. The literal ten-scenario acceptance is not fully established. Freshness capability is tested; freshness acceptance fails on the actual annual valuation basis.
- **Investigations completed, underlying requirement unresolved:** **S4-R6/G-4** and **S4-R8/G-8/L-031**. Tests and inventories are not real operating-metric records or a real event/guard demonstration.
- **Outstanding evidence/gates, separately:** R-1/R-2 host captures; optional R-3/S2-R2 records; S4-R6's contradictory closure formulations; unresolved real-data/source conditions; D4/D5/D6 and host/browser integration evidence. D2/D3 have operator-reported completion, not the old blanket “all D2–D6 outstanding.” O1 and recurring O3 approval ceremonies are **not current blockers**.

No status cell, acceptance criterion, code, financial input, identity input or governance decision is changed by this audit. “UNVERIFIED” below means insufficient proof for the stated claim, not necessarily a product defect or a reopened closed decision.

## 2. How scope and authority were established

The requested starting point was read first: [`IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md`](IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md), **including §§6–12**, not just its opening verdict. It is not the entire Stage-4 register.

Scope was independently assembled from:

1. **Primary baseline §§21, 23, 24**: `IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md`, pinned by CPII-01 §13.2 to GitHub blob `e6f756238089c6795c8568b37321f3e55ba60cb2`. It is **unmerged**, not a file in the assessed tree. Exact API bytes were decoded and verified: 122,093 bytes; SHA-256 `baac4427e543ff7749694e7fb59a4b147cb415b2f7fe3330544ce22a5d0835b6`. Relevant verbatim excerpts are in the audit bundle. Its adoption by merged records establishes the requirement, not implementation delivery.
2. [`CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md`](CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md), §10.1: **B-1 plus G-4/G-6/G-7** belong to Stage 4; B-4–B-7 belong to Stage 5.
3. [`IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md`](IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md) (“register” below): §3 acceptance, §7 **S4-R1–S4-R8**, inherited **R-1–R-4/S2-R1/S2-R2**, §4 **D1–D8**, and **all later addenda**, including G-10/G-11 and R4/R5/R6/R8 updates.
4. [`IID-STAGE4-COVERAGE-MEASUREMENT-EVIDENCE-2026-11-14.md`](IID-STAGE4-COVERAGE-MEASUREMENT-EVIDENCE-2026-11-14.md) (“measurement record” below), the item-specific records and real-issuer bundles, actual production modules/tests, Git history, and GitHub PR/check read-backs.
5. **Prospective governing amendment:** [`IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md`](IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md), especially §§2–4/7. Its G-1…G-11 are **policy-table identifiers**, not baseline gap identifiers. It removes approval ceremony, not provenance, missing-value guards or technical verification.
6. Later O1, NP-04 completion and L-041/L-042 decisions; adopted roadmap [`IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md`](IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md), **C/C.1–C.3**.

Result: **eight numbered Stage-4 items**, one explicit subordinate Infosys item, the acceptance clauses/ten scenarios, and the inherited evidence/dependency registers. **No S4-R9 or S4-R10 is registered.** Baseline G-1…G-15 are cross-walked in §8 so adjacent dependencies are not omitted or misrepresented as new Stage-4 tasks. Implementation-phase IID-0…IID-6 closure is a different register and does not prove operational Stage-4 closure.

## 3. Independent execution and evidence limits

No Windows execution, installed-root access, portfolio-store access, network source retrieval, real mint, IPD write, or data installation was performed. Existing tests use disposable sandbox fixtures/temp roots; those are not the user's installed dataset or host state. The additional audit probe only reads committed input files and calls pure builders/read models/assessment in memory. Its identity parameters are explicitly audit placeholders, **not evidence of resolved identity**; identity proof remains the existing resolver/provisioning tests and host records.

| Check actually performed at audit baseline | Result / boundary |
|---|---|
| Fetch before assessment; local HEAD and remote-main comparison | Both `2ec2e75…`; full history fetched for commit ancestry checks |
| Entire platform IID test glob, from `iips-platform`, serial | **1,589 tests / 329 suites / 1,589 pass / 0 fail / 0 skipped**; `platform-iid.tap` |
| Platform regression command (`src/**/*.test.ts tests/regression/*.test.ts`) | **678/678 pass**, 0 fail; `platform-regression.tap` |
| `tsc --noEmit -p iips-platform/tsconfig.json` | **exit 0**; empty stdout file is paired with the exit receipt |
| Production roster lint `--json` | **19 checked / 0 failed**, two designated fixture rosters excluded; negative/control cases pass in the IID suite |
| Independent in-memory reconstruction | Historical `3ad82918…`, refresh `bdfb2527…`, R2 `69bbc14e…` reproduced exactly; all nine issuer assessments have zero invariant violations |
| GitHub PR read-back | PR states/merge commits/check metadata recorded, and each returned merge commit checked as an ancestor of assessed baseline |
| Frontend dependency-complete CI | GitHub run **44239076051**, head **`f1bd346c22ff7e9ad44f83b097f4bcbf5d7b196e`**, `completed/success`; job metadata confirms private-pin verification, typecheck, full Vitest/nonzero guard, production build all success |
| Fresh local frontend/private-package execution | **NOT PERFORMED / UNVERIFIED as a new audit run**. Historical CI is independently read metadata, not a newly executed frontend suite. Raw run-log download failed on its redirected host; do not claim test-by-test raw-log inspection |
| Current Windows host / browser | **UNVERIFIED**; operator-supplied historical results retain that evidence class |

Toolchain was isolated: Node `v22.22.3`, TypeScript `5.4.5`, tsx `4.23.0`, @types/node `26.1.0`; temporary dependency links were used, no lockfile/dependency definition changed. Initial runs from the repository root exposed path-sensitive tests and missing explicit `iips-platform/node_modules/tsx` tooling, not accepted green results. With the documented working directory and tool links the full IID glob passed. These failed setup attempts are retained in the execution receipt; neither failures nor final passes are host evidence.

## 4. Complete numbered Stage-4 status register

Paths in this table are relative to `docs/integration/` or `iips-platform/` as named. Item evidence directories are under `evidence/real-issuer/` with matching `S4-R…` names. Precise baseline blobs and SHA-256 identities are in `inspected-evidence-inventory.json`.

| Work item / original closure test | Existing formal disposition | Independent audit classification and evidence |
|---|---|---|
| **S4-R1 — ten-scenario demo**; §23 passing, original API **and UI** clauses | **SUBSTANTIALLY DISCHARGED**, recorded **8 demonstrated / 2 partial**, not CLOSED | **PARTIAL; complete acceptance UNVERIFIED.** `iidStage4ScenarioMatrix.test.ts` passes (39 tests); `IID-S4-R1-SCENARIOS-1-5-9-10-EVIDENCE-2026-11-16.md` and `frontend/server/investment/iidStage4S4R1Scenarios.test.ts` provide the second-pass proof. PR **#575** carries the previously omitted second pass; **#584** supplies served-chain/route fixes. §6 below preserves all ten criteria and discrepancies rather than adopting 8/2 as literal full-clause completion |
| **S4-R2 — Infosys borrowings**; Technology EV_EBITDA AVAILABLE **or source NOT_REPORTED with reason** | **CLOSED on assessment path**, explicitly one coverage remainder | **BOUNDED COMPLETION SUPPORTED; full coverage unlock NOT achieved.** PR **#586**, replacement input `S4-R2-INFOSYS-BORROWINGS-2026-11-17/ingest-input`, `s4r2BorrowingsReuse.test.ts` (25 tests in current suite). FY2024 three borrowing terms are source-supported `NIL_BY_DISCLOSURE`; FY2023/FY2022 remain `MISSING/NOT_REPORTED`. R2 dataset `69bbc14e…` gives net debt −₹19,342 crore, EV_EBITDA applied, intrinsic mid ₹1,088.972274952081. **Coverage still WITHHELD / STATEMENT_INPUT_MISSING / NET_DEBT.** Neither FY2024 nil nor an applied assessment is the coverage `AVAILABLE` token. Earlier-period absence is documented, not a proof of a FY2024 source NOT_REPORTED alternative. The formal closure is accurately qualified; unqualified original-criterion closure is **UNVERIFIED**. No host installation proved |
| **S4-R3 — periods/freshness**; quarterlyPeriods > 0 and STALE_STATEMENTS no longer raised | **OPEN**; capability delivered | **PARTIALLY COMPLETE, acceptance NOT MET.** PR **#587** plus #588 receipt; `assessment/freshness.ts`, engine/read-model integration, `s4r3Freshness.test.ts` (23). Candidate `bdfb2527…` has 11 annual + 2 discrete KEC quarters; annual valuation bases remain stale at 17-Nov clock (Infosys 961d, Marico/KEC 231d; KEC newest reported quarter 48d). New fallback/UNKNOWN/sequence-gap behaviour works without policy weakening. Host build/VerifyOnly evidence is candidate verification, not an installation receipt. See NP-04 conflict in §9 |
| **S4-R3-Infosys — explicitly named sub-item**, newer supported source period | **OPEN** | **OPEN.** No newer Infosys period was added by the refresh; latest remains 2024-03-31 in all three audited assemblies. No qualifying newer filing in the inspected scope. This is a source-data residual, not an unimplemented freshness calculator. No external search or source admission was conducted by this audit |
| **S4-R4 — document usable ≠ valuation**, source-level note committed | **CLOSED** | **COMPLETED AND FORMALLY CLOSED.** PR **#589**, `IID-COVERAGE-USABLE-VERSUS-VALUATION-2026-11-17.md`, source note in `coverage/measure.ts`, R4 evidence `coverage-versus-assessment.json`. Note names any annual pair vs latest instant and stricter capital structure. Independent probe confirms historical availability alongside null latest intrinsic. This item never promised to change the derivation rule |
| **S4-R5 — decide existential semantics, amend record/code to match** | **DECIDED—retained / DISCHARGED** | **COMPLETED AND FORMALLY DISCHARGED.** Recorded owner decision in `IID-COVERAGE-AVAILABILITY-SEMANTICS-2026-11-17.md` §1, PR **#590**. `qualificationOf`, per-issuer `methodAvailability`, API types, SPA and JS-free views keep historical vs latest readiness separate; 10 platform tests pass; 7 SPA tests are in dependency-complete CI scope. Independent probe confirms Consumer historical availability need not imply latest readiness. This is not fresh data or guaranteed valuation |
| **S4-R6/G-4 — validated metrics with methods AVAILABLE**, alternatively “record keep withheld” in reassessment §4 | **INVESTIGATED; OPEN**, decision/closure formulation outstanding | **INVESTIGATION COMPLETE; REQUIREMENT UNRESOLVED.** PR **#591**, `IID-S4-R6-OPERATING-METRICS-2026-11-18.md` §§2/7; current 25-test gating suite passes. Source-derived 14/38 metric-gated slots, 0 real metric records, two live missing-metric methods (Technology/Industrials EV_REVENUE), twelve unmeasured without issuers. No source-supported NRR/recurring-share/book-to-bill value was entered. Synthetic probes prove generic capability only. The numeric closure criterion fails; no decision reconciles the alternate criterion. PA-01 makes this an ordinary maintenance choice, not a committee approval |
| **S4-R7/G-14 — static roster lint**, shared authority; reject deliberately misspelled fixture | **COMPLETE / DISCHARGED**, addendum supersedes old NEW row | **COMPLETED AND FORMALLY DISCHARGED.** Original commit `3a3521a9a3497607911cf790a53a4f61b3d2cd0a`, delivered through reconciliation PR **#574**. `scripts/lint-roster-sectors.ts` uses `findInvalidIssuerSectors`; 19 current tests pass, including negative CLI exit and positive controls/read-only checks. Audit run: 19 non-fixture rosters pass. Original historical count was 18, not a present census |
| **S4-R8/G-8 — actions as events occur**, real corporateActions > 0, L-031 real guard/factor proof | **INVESTIGATED / OPEN / event-driven** | **INVESTIGATION COMPLETE; REQUIREMENT UNRESOLVED.** PR **#592**, `IID-S4-R8-CORPORATE-ACTIONS-2026-11-17.md`; 22-test ingestion boundary suite passes. Historical census: 597 tracked real-issuer evidence files, 13 candidate/group findings, 0 admissible canonical events. Generic non-empty-malformed action-file refusal is implemented; real guard/factor/successor proof is not. Synthetic 0.6/0.4 reconciliation is not real corporate-action coverage. All rebuilt assemblies still have 0 actions. L-031 remains OPEN. Do not reinterpret absence of admissible evidence as “no event occurred” |

**Numbered-item accounting:** 3 fully completed/formally closed or discharged; 1 formally closed **with explicit bounded scope**; 2 open/partial numbered items; 2 completed investigations whose requirements remain open. The Infosys row is subordinate to R3, not a ninth numbered task. This accounting records no new closure.

## 5. Acceptance-clause verification (B-1 and primary §21)

| Acceptance/remaining-work clause | Independent result |
|---|---|
| Technology, Consumer, Industrials `measured:true`; reconcile expected stages | **VERIFIED on reproduced committed bytes.** All three assemblies: Consumer G1_ENABLED (3 historical available), Industrials G2_PARTIAL (2), Technology G2_PARTIAL (2). Exactly 3/13 measured; 10 outstanding. The Infosys extra NET_DEBT withholding is genuine, not omitted |
| Methods usable for the named sectors; unavailable methods carry reasons | **VERIFIED as coverage-capability measurement, not valuations.** Seven historical AVAILABLE slots and three WITHHELD slots in measured sectors; 28 further WITHHELD slots with NO_DATA_FOR_SECTOR in the ten UNMEASURED sectors, total 38. UNMEASURED is the sector position, not a third method-state token in `measureCoverage`. Coverage reasons explicitly name absent items/metrics. Source/read-model tests retain reasons; withholding remains fail-closed. Do not turn all 31 non-available slots into measured-sector failures |
| Completeness and adequacy per issuer | **VERIFIED.** Three SUFFICIENT, `requiredFieldCoveragePct=1`, no missing required fields, all nine audit assessment runs zero invariant violations. Statement coverage is fractional and net debt may still be missing. SUFFICIENT is not complete capital structure or fresh data |
| Installed-data measurement | **HISTORICALLY SUPPORTED / CURRENT HOST UNVERIFIED.** Reproduction gives exactly host Stage-3 digest `3ad82918…`; original measurement roots were sandbox installs. Host Stage-3 verification supports byte equivalence at that instant, not a new host route capture. No evidence here establishes which digest the live server now serves |
| Zero fabrication; five derived values checked against filings | **QUALIFIED, not unqualified acceptance.** Original measurement §7 checks 49 derivations/304 transcription cells but §7.4 explicitly says **not original PDFs**. Refresh adds six worked hand checks and committed page excerpts with source locators/hashes; their formula arithmetic and source-extract identity were checked by this audit (see `source-checks.json`). That verifies committed extract/transcription → derived output, not independent PDF authenticity or the entire historical source transcription. Literal original-filing verification for the full acceptance claim remains **UNVERIFIED**; no fabrication was observed in these checks |
| Decide/add operating metrics | **OPEN**, S4-R6/G-4; tests ≠ source-backed values or disposition |
| Quarterly/freshness gap G-6 | **PARTIAL**, R3. Two KEC quarters in refresh assembly; neither the historical nor R2 assembly contains quarters. Annual freshness remains unsatisfied for all three |
| Vocabulary G-7 and static G-14 remainder | **VERIFIED DELIVERED**, runtime validation/read-path warning and same-authority negative lint. Not a certification of all future data |
| Corporate actions as events occur | **OPEN/event-driven**, R8/G-8/L-031. Empty tables cannot prove no intervening event |
| Tag-map changes only under L-002 golden-fixture process | **NOT TRIGGERED by audited Stage-4 work.** No new tag is admitted here. Real XBRL fact inspection is not proof of full real-instance ingestion. L-002 stays OPEN |
| §23 ten-scenario demo passing | **NOT fully established**; detailed audit below. Existing 8/2 is the record's accounting, not a substitute for every original API/UI clause |
| Independent of IPD | **True for measurement capability**, not a waiver of the demo's real-holdings/portfolio clauses. D5/D6 explain residuals; they do not satisfy them |

### Dataset identities — never interchange them

| Assembly independently recomputed | Content digest / dataset version | Periods | Host interpretation |
|---|---|---|---|
| Historical three bundles | `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83` | 9 annual / 0 quarterly | Matches historical Stage-3 host verification |
| Refresh input assembly | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` | 11 annual / 2 quarterly | Candidate build/VerifyOnly proved; NP-04 later reports this digest, but current active installation/read surface unverified |
| R2 replacement Infosys + historical Marico/KEC | `sha256:69bbc14e99cea0e24be568fa923971e7c0536009ab19056f09bf272d437c6fe2` | 9 annual / 0 quarterly | Repository-side assessment correction; no host receipt |

All three: three issuers; zero ingestion issues, operating metrics and corporate actions. Source rights in historical manifests remain `OPERATOR_ASSERTED`, not independent third-party rights verification. The pure audit probe passes no manifest, so its report does **not** establish a rights/dataset-class declaration. Classification capability is separately tested by the L-041 suite.

## 6. All ten original demo scenarios, not just the residual summary

Evidence anchors: primary §23 extract; platform `iidStage4ScenarioMatrix.test.ts`; frontend `iidStage4S4R1Scenarios.test.ts`; register §§14–17 (routes, chain, count); S4-R1 record §§3–6. Every designated synthetic demonstration remains synthetic. No fixture figure is counted as real coverage.

| # / original medium | Supported evidence | Residual against original acceptance, audit classification |
|---|---|---|
| **1 — normal real Infosys holding/history** | Real-bundle ISIN resolves; issuer COVERED; actual CLI/composition-root HTTP chain, second reader, absent 404/idempotence proofs, G-11 CI | **PARTIAL against full original clause.** S4-R1 §3.1 itself leaves `/identity-coverage` **holding row** IPD-owned and calls company rendering “newly unblocked,” not an observed browser journey. Recorded DEMONSTRATED is broader than its own evidence; current host/browser proof **UNVERIFIED** |
| **2 — sparse history, S or two-period issuer** | Fixture adequacy PARTIAL/INSUFFICIENT, financial presence and missing reasons tested | **Fixture API/mechanics demonstrated as designated**. Full original UI colouring/gap rendering is not newly browser-verified by this audit; do not call it real sparse-issuer coverage |
| **3 — covered issuer, unresolved security, S** | In-memory fixture roster omission preserves dataset COVERED and yields UNMATCHED/ISIN_NOT_IN_ROSTER, no assessment promotion | **Fixture mechanics demonstrated**; original side-by-side UI journey **UNVERIFIED** as an executed browser scenario |
| **4 — unmatched/ambiguous, S** | Resolver candidate/reason/count exclusion tests | **Fixture mechanics demonstrated**; exact original visible UI journey **UNVERIFIED** here; nothing resolves by forced roster widening |
| **5 — new imported holding** | Served preview of real admitted issuers and synthetic pre/post provisioning mechanics; honest portfolio-source refusal | **PARTIAL**, as recorded. Import → persisted portfolio refresh → identity re-read through D5/D6 not proved; a preview is not a persisted imported holding |
| **6 — watchlist sector reference** | Current watchlist sector-ref path reports SECTOR_REFERENCE_NOT_AN_IDENTITY, no issuer promotion; fixture matrix/source contracts | **Current contract mechanics demonstrated**; O8 issuer-aware watchlist change is not required or inferred. Full current host add-control/link journey **UNVERIFIED** |
| **7 — merger/demerger, S** | Existing fixtures reconcile successors or reject whole table; invalid weight sum test | **Synthetic demonstration supported as designated**. No real event proof; separate R8/L-031 remains OPEN. Full browser successor block is not newly exercised |
| **8 — specialised sector** | Banking/specialised metric-withholding fixture plus real Consumer/Industrials analogue, specific reasons; current R6 gating tests | **Fixture/real-analogue mechanics demonstrated**, not admitted specialised-sector coverage. UI slot-list browser journey **UNVERIFIED** here |
| **9 — real stale/incomplete KEC** | Real data: net debt NOT_REPORTED, bridge NOT_COMPUTABLE, intrinsic/MoS null, stale flag/cap; SUFFICIENT required-field adequacy reproduced | **Technical explanation verified; literal acceptance divergence UNRESOLVED/UNVERIFIED.** Primary §23 explicitly expects adequacy **PARTIAL**, current engine returns **SUFFICIENT**. Required nine fields exclude debt. No threshold should be changed to make the assertion green; explanatory prose is not evidence of an owner amendment to the literal acceptance text |
| **10 — mixed portfolio** | Real preview counts observed 4/resolved 3/unmatched 1 reconcile; all identities remain separate from coverage; no promotion | **PARTIAL**, as recorded. Full portfolio page showing covered/uncovered/no-financials/unmeasured mixture is not established by those preview counts, nor by a live persisted-holdings journey |

**No replacement aggregate “passing” count is invented.** The record's 8/2 is faithfully reported but cannot support literal complete acceptance: at minimum scenario 1's holding/UI limb, 5/10's portfolio limbs and 9's expected adequacy remain unresolved. The current audit did not execute ten browser journeys. Component/HTTP tests and fixture mechanics must not be relabelled host/browser acceptance.

## 7. Inherited evidence register and runtime dependencies — current reconciliation

| ID | Current audit disposition / evidence required |
|---|---|
| **R-1 host readiness stdout** | **OPEN / current capture UNVERIFIED.** Need diagnostic from actual serving process environment. Old expected D2–D6 all outstanding/strict exit 1 is historical, not a command to force obsolete results. Preserve actual findings, clock, exit status, data root and digest correlation. PA-01 retains verification, removes release-gate ceremony |
| **R-2 host investment + identity served captures** | **OPEN / UNVERIFIED.** Sandbox handler/composition tests are not host captures. Need named routes and actual dataset/identity/observation availability; do not demand a historical 503 if the operator has since provisioned sources |
| **R-3 original install invocation stdout** | **OPEN, optional/superseded in substance**; not recovered by this audit. Nothing blocks on it. Old reinstall prohibition was removed by PA-01; no reinstall is needed to manufacture an old transcript |
| **R-4 L-041/L-042 adjudication** | Formal ceremony **SIMPLIFIED/retired by PA-01**. Underlying defects are now **RESOLVED** by limitation register §§17.27/17.29, not current open gates. L-041 classifier fail-closed regression passes; L-042 Option B/identity re-baseline landed via **#582**. Neither closure is inferred from the abandoned #562 |
| **S2-R1 O1** | **SATISFIED**, not an open prerequisite: `IID-O1-IDENTITY-GOVERNANCE-PA-DECISION-2026-11-16.md`, Stage-2 §14/Stage-4 §13, roadmap C.3. PA-01 had already removed the recording gate. Intended initial population: Infosys, Marico, KEC; no financial qualification implied |
| **S2-R2 extra host transcript detail** | **OPEN / optional**, no new full host stdout/runtime version/asOf detail obtained. Not a Stage-4 measurement blocker |
| **D1 identity-files** | Historical host publication/loader verification **SUPPORTED** (Stage-2 host evidence), three-source digests. Current host finding **UNVERIFIED**, not reopened as a missing implementation |
| **D2 NP-04 assessment store** | **COMPLETE operator-reported for first Infosys persistence**, `IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md` §§1/7. Store payload/files not independently accessible. Repository chain capability additionally supported by #575/#584 CI. Current host diagnostic/path contents **UNVERIFIED** |
| **D3 Reports owner context** | **PASS operator-reported in NP-04 operation**, same record. Not independently re-opened/read by auditor. No basis to repeat “no configured store/carrier anywhere” |
| **D4 F-3 carrier** | **OUTSTANDING in latest completion/roadmap records**; no host watchlist/finance read evidence supplied here. Resolver/materialiser capability is not installed context |
| **D5 active IPD binding** | **OUTSTANDING / external technical prerequisite** for portfolio loop. IRR setting alone cannot provision/verify IPD binding; actual successful portfolio read required |
| **D6 IPC endpoint/live peer** | **OUTSTANDING / external technical prerequisite**. Named pipe/socket configuration does not prove peer liveness. Windows named-pipe handling implementation is not proof of current IPD operation |
| **D7 local-personal-use-enablement** | Operator declaration; **excluded from readiness rule**, not an undisclosed eighth read-critical blocker. Current host declaration **UNVERIFIED** |
| **D8 fundamentals dataset** | Historical host digest verification **SUPPORTED**; current active digest/served capture **UNVERIFIED**. NP-04 reports a later digest, not an installation/readiness capture |

`runtimeReadiness.ts` still has eight findings, **seven read-critical** (D7 excluded). Configuration/filesystem presence alone does not validate dataset content, open the database or probe the Windows pipe. No current “five of seven outstanding” count can be independently asserted after operator-reported D2/D3 completion.

Outstanding Stage-5 evidence remains live holdings → identity → dataset → assessment → disposition, F-3 context where exercised, remaining three-issuer mints if pursued, genuine comparable second version/change diff, and D10/P6-B browser acceptance. None is silently closed by Stage-4 unit tests. Do not repeat the completed Infosys mint to obtain an audit receipt.

## 8. Baseline G-1…G-15 crosswalk (scope completeness, not a new backlog)

| Baseline gap | Stage-4 relevance and current bounded position |
|---|---|
| **G-1 identity reference absence** | Stages 2/O1 establish intended three-issuer set; no claim of full-market reference coverage. Current host capture still R-1/R-2 |
| **G-2 no installed dataset** | Historical Stage-3 installation proved, not still “never on any host.” Current host digest unverified |
| **G-3 holdings/IPD** | D5/D6 residuals; Stage-5 portfolio loop, also limiting literal demos 1/5/10 |
| **G-4 metrics** | Stage-4 core, **OPEN** / R6 investigated |
| **G-5 real XBRL ingestion** | Selected KEC real-instance facts used/checked in refresh; full real-instance production ingestion/tag completeness **UNVERIFIED**, L-002 process not waived |
| **G-6 no quarters** | Historical zero no longer universal; KEC two-quarter refresh exists, **PARTIAL**; freshness still OPEN |
| **G-7 vocabulary split** | Runtime rejection/visible read-path issue **delivered**. No forced mapping from certified baseline spelling to canonical vocabulary |
| **G-8 real corporate actions** | **OPEN**, R8/L-031; not PA-01 G-8 nor formal-closure AC-X6 G-8 |
| **G-9 price freshness design drift** | Existing L-033 limitation, no Stage-4 policy change or closure established; not R3's statement-age capability |
| **G-10 JS-free route mismatch** | **Corrected/delivered**, register §14 / #584: independent identity/investment HTML+JSON routes, route tests. Not a claim of host browser acceptance |
| **G-11 stored/served chain absent** | **RESOLVED in-tree and recorded**, register §15.6, hardening §16, #584. Windows storage is operator-reported; HTTP proof is dependency-complete CI. No host/browser conflation |
| **G-12 fresh holding prices** | No prices in audited combined assemblies; no current fresh holding-price/MoS acceptance proved. Adjacent operational residual, not fixed by R3 statement-age reporting |
| **G-13 import→identity composite** | Served preview/composition proof exists; persisted import→holdings/IPD loop **not proved**, R1 scenarios 5/10 and Stage 5 |
| **G-14 no static lint** | **DISCHARGED** by R7 same-authority lint, plus runtime G-7 protection |
| **G-15 stale limitation disclosures** | Product notice count corrected, but historical L-002 “20”/L-009 wording remains historical/flagged. Current code 22 tags; no tag-map expansion or automatic limitation closure. Not a reason to reopen completed implementation phases |

Stage-4-related source limitations remain separately visible: **L-001** sector breadth, **L-002/L-003** ingestion/metric scope, **L-031** real corporate-action guard, **L-033** price-window drift, **L-038/L-039** latest source-data residuals. Latest §§17.30/17.31 and PRs **#593/#594** leave L-038 and L-039 **OPEN**. Those investigations do not discharge missing Marico preference-capital or KEC current-investments evidence. **L-041/L-042 are RESOLVED**; older open tables must not be copied as current truth. No other limitation is re-adjudicated by this audit.

## 9. Discrepancy register — findings, not unilateral corrections

| Finding | Authority/evidence conflict | Audit treatment |
|---|---|---|
| **A1 — incomplete scenario treated as demonstrated** | S4-R1 §3 says scenario 1 DEMONSTRATED, own table still excludes holding row and only unblocks company rendering | Complete original scenario acceptance **UNVERIFIED**; retain full-clause residual, do not double-counting-eliminate a requirement |
| **A2 — scenario 9 literal expected result** | Primary expects PARTIAL; production + both scenario suites prove SUFFICIENT, debt/bridge still incomplete | Domain explanation supported; acceptance-text reconciliation outstanding. No model/threshold change or inferred owner waiver |
| **A3 — source check stronger in verdict than evidence** | Register says zero fabrication MET; measurement §7.4 expressly checks transcription rather than original filings | Qualified source-extract/arithmetic evidence supported; unqualified original-filing/full-source check **UNVERIFIED** |
| **A4 — R2 closed ≠ coverage available** | Assessment applies nil-aware capital structure; derivation requires numeric PRESENT and still withholds NET_DEBT | Preserve explicit assessment-only formal closure; no coverage or installed-data unlock inferred. R4 documents difference, R5 retained existential semantics; neither changes nil derivation |
| **A5 — O3 approval requirement revived after PA-01** | Requested reassessment §12 says R2 successor needs a fresh O3 declaration; PA-01 §3 G-4 already closed recurring O3 admission gate prospectively | Fresh recurring declaration is **not a current technical blocker**. This does not manufacture independent rights evidence, change source terms or assert installation. R2 input is not historically named in the old O3 declaration; those are distinct facts |
| **A6 — installation position conflicts across records** | Reassessment §§10–12 says Windows installation not performed; NP-04 completion reports an assessment based on `bdfb2527…`. S4-R1 §3.3 calls it “partially-built candidate” without installation evidence | Historical refusals/candidate passes retained; operator-reported use of later bytes acknowledged. Exact successful replacement, backup/verification receipt and current serving-root digest **UNVERIFIED**. Do not say either “definitely still old” or “verified installed now” |
| **A7 — digest transcription typo** | S4-R1 §2 prints `…56266b4a…`; actual test/rebuilt Stage-3 digest is `…56268b4a…` | Documentation typo, **not** dataset divergence; full digests in §5/evidence. No historical record edited |
| **A8 — old all-open tables** | Opening register/table text still says O1, D2–D6, L-041/L-042 open; later O1/NP-04/limitation records supersede these | Apply later bounded evidence and PA-01; do not present historical snapshots as live blocker census |
| **A9 — contradictory R6 closure tests** | Numeric `VALID >0 + AVAILABLE` vs “or recorded decision to keep withheld” | Conflict explicitly identified by existing R6 §7; no disposition selected by auditor; **OPEN** |
| **A10 — stale next-action pointers / PR state** | Reassessment §12 points to R4; R2/R6 addenda point to already processed successors; old docs call #584 draft/#562 open | #584 MERGED, #562 CLOSED **unmerged**; no R9. Current residual next action and adopted next stage are distinguished in §10 |
| **A11 — stale source comments** | Matrix header keeps first-pass narrative; classifier test header says L-041 OPEN despite later formal resolution | Executable tests + latest decisions outrank old commentary; passing tests do not validate stale status prose |
| **A13 — source identity input is not a published runtime set** | L-039 notes direct WI8 runtime loading fails on legacy `entries: []`; provisioner explicitly accepts that empty legacy input and publishes canonical `actions` | Audit directly reproduced runtime `MISSING_REQUIRED_ARRAY/actions` **and** successful provisioner source read (`wi8-identity-boundary.json`). No current standalone WI8 runtime qualification inferred, and no false claim that the historical combined published set is broken. No repair/republication performed |
| **A12 — dates and CI scope** | Remote objects returned timestamps on 18-Nov, document date 17-Nov; recent main check is static-only | Preserve exact commit boundary/timestamps. Main static success is not a full frontend run at this HEAD. Last inspected full frontend CI is at R5; R6/R8 changes are covered by current full platform runs, not invented fresh frontend CI |

## 10. Exact next action and roadmap conclusion

There are two different, authoritative “next” questions; conflating them creates a false completion or a stale plan.

**Within Stage 4:** the register's final S4-R8 addendum and `IID-S4-R8-CORPORATE-ACTIONS-2026-11-17.md` §10 explicitly state:

> owner/operator obtains event-specific source/locator, exact dates/historical identity/terms and applicable rights/admission, then transcribes, validates, publishes, independently reads back and demonstrates the real criterion with before/after digests. Unsupported schema semantics require a governed decision, not a guessed mapping. S4-R8 is the last numbered Stage 4 roadmap row: **no next numbered item is registered**; remaining work is the existing residual/event-driven/operator/owner actions, including the outstanding S4-R6 decision.

This is an evidence requirement for any real event claimed, **not** permission for this audit to fetch/admit/transcribe one, nor a reinstatement of recurring O3 ceremony. Alongside that event-driven action remain freshness/source work, original demo acceptance reconciliation and R-1/R-2 captures. Do not invent S4-R9, repeat the R4 note, force a metric/zero, or mark an investigation closed as a requirement.

**Next adopted operational stage:** roadmap **C.2**, reaffirmed by **C.3**, names **Stage 5 — end-to-end integration**. Its exact hard portfolio prerequisite is **IPD active binding provisioning/verification D5 plus IPC peer/live portfolio read D6**; only after IPD confirmation may the operator set the binding declaration, and an actual portfolio read must verify the path. NP-04 completion §9 agrees and retains Stage-4 residuals in parallel. This existing adoption is **not a Stage-4 completion certificate** and this audit neither starts Stage 5 nor supplies cross-repository authority.

**Final answer:** Stage 4 remains **PARTIALLY COMPLETE**, not formally fully closed; existing partial/open/source/host items above remain. The next numbered Stage-4 task does not exist. The latest Stage-4 residual action is the source-backed event/operator sequence quoted above, with R6 and other residuals parallel; the adopted next operational stage is Stage 5 subject to its actual technical prerequisites. Audit publication changes none of those decisions.

## 11. Late publication refresh — PR #596, no inferred new acceptance

After the initial audit commit/push, a fresh fetch returned main **`70f76134deba91de4ddca9e932542231b298cdf9`**, merge of **PR #596** (2026-11-18T08:18:30Z). Its two-file delta is the W05 Q1–Q7 rights addendum and an unnumbered tracker entry. It changes **no implementation, dataset, identity input, limitation status or Stage-4 acceptance**. The existing Q7 PA-directed evidence-limited closure is preserved, **not rendered or extended by this auditor**; W05 remains NOT COMPLETE/NOT ACCEPTED. Its limits on automated retrieval, direct NSE filing links and redistribution are not treated as a source licence.

Both upstream files are incorporated unchanged. The tracker conflict was resolved as the **complete new-main tracker byte prefix followed by this audit's §16.301 receipt**; the upstream unnumbered entry consumes no CV/CHG/V identifier. No governance content is rewritten. `publication-delta.json` pins both remote blobs and the PR read-back. The original 194-file inventory and test logs remain explicitly bound to the execution baseline `2ec2e75…`; implementation/data bytes are identical at the late main, so there is no unsupported claim of rerunning all suites after a code change.

Publication was narrowed to **verification metadata**: digests, counts, states, boolean check outcomes, source locators and test receipts. No copied filing-row text or full computed coverage/assessment payload dump remains in the final audit bundle. The metadata-only probe was independently rerun and matches the original observation projection; all **131** source/arithmetic/disclosure checks still pass. Worked financial figures quoted in this report refer to the already-published item records, not a newly minted artifact or redistribution authorization. Original source files/artifacts and upstream decisions remain untouched. The initial audit commit remains in Git history; this narrowing does not claim to erase that private-branch publication.

**Effect on conclusion/next action: none.** Stage 4 PARTIALLY COMPLETE; no R9; R8 event/source sequence and the parallel residuals stand. Stage 5 remains the adopted next operational activity, not a certificate that Stage 4 is complete.
