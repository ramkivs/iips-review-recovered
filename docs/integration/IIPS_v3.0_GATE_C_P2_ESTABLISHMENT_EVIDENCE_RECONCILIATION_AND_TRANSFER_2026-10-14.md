# IIPS v3.0 — Gate C / P-2: Establishment Evidence Reconciliation, Transfer Path and Closure Determination

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG12-GATE-C-P2-ESTABLISHMENT-EVIDENCE-RECONCILIATION-2026-10-14-01` |
| Gate / step | **Gate C (`REG-12` / `G-2` / `F-4` / `AG-5`) — prerequisite P-2**, establishment-evidence reconciliation (handoff steps ③–⑤) |
| Record type | **Reconciliation + transfer-path determination + closure determination. RENDERS NO AUTHORITY; PERFORMS NO P-2, P-4, P-6 OR P-8 OPERATION.** Creates no key, issuer, runtime or database; changes no IPD byte; reclassifies no Windows result. |
| Deciding authority | **Ramki** — single owner, sole user and Program Authority of the single-user, personal-use, non-production IIPS platform |
| Recording agent | Arena Agent Mode — read-only verification, reconciliation, publication only, under the attributed standing authorization |
| Date | **2026-10-14** (Asia/Calcutta / UTC 2026-10-13T19:4x) |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` (IRR) / session branch `arena/dd87c5d6-iips-review-recovered`, PR **#91** |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not written; all four reference refs re-verified UNCHANGED** (§2) |
| Governing records | P-2 act `GC-D5`/`GC-D6` (`IIPS_v3.0_GATE_C_P2_EXECUTION_DESIGNATION_ACT_P2-A-D1_2026-10-13.md`); P-2 request §§7.2–7.4; 1A′ specification §5.2 `R-2.1…R-2.10`; the handoff `IIPS_v3.0_GATE_C_P2_EXECUTION_HANDOFF_ARENA_TO_NON_PRODUCTION_HOST_2026-10-13.md` (Blocks A–G, corrections `GC-P2-HANDOFF-D1-CORR-01`, `GC-P2-HANDOFF-F5-CORR-02`); tracker §§15.14–15.16 |
| Status | **WINDOWS RESULTS RECONCILED; EVIDENCE DESTINATION FIXED (IRR); ONE NARROW OPERATOR ACTION REMAINS (§6); F5.2 PRESERVED AS UNRESOLVED — NOT RECLASSIFIED. P-4 NOT DONE; P-6 NOT GRANTED; P-8 NOT DONE. `/api/user-portfolios*` remains fail-closed at HTTP `503 owner-context-unavailable`.** |

---

## 1. Purpose, scope, non-goals

**Purpose.** Reconcile the Windows execution results of the P-2 establishment handoff with the published handoff, fix the **durable evidence destination and transfer path**, and determine what can be closed now. Windows tests are **not** repeated; the Windows filesystem is **not** treated as Arena-readable; no Windows result is reclassified.

**In scope.** Read-only Arena-side verification (§2); reconciliation of the transferred results as operator-attested facts (§3); source-derived classification of the one unresolved result (§4); destination/transfer determination (§5); closure determination and the single remaining action (§6); verification method (§7).

**Non-goals.** No key, issuer, anchor, runtime or database created; no P-4 provisioning; no P-6 authority claimed or exercised; no P-8 qualification performed or claimed; no IPD write of any kind; no change to the pinned IPD source or its build artifacts; no re-run of any Windows diagnostic; no new governance gate or approval step.

---

## 2. Current authoritative state (Arena-verified)

| Item | Verified value |
|---|---|
| IRR `main` (remote) | **`33bbb0fac947476bd70993810f730e09018f5f8f`** — merge of PR #90 (`GC-D6`); unchanged |
| Session branch (remote) | `arena/dd87c5d6-iips-review-recovered` @ **`4aac9de`** (`1acce27` handoff + `4aac9de` D1 correction) |
| PR #91 | **OPEN** — base `main`, head `arena/dd87c5d6-iips-review-recovered`; files: the handoff record + the canonical tracker |
| Fence blobs at branch head | `reports-transport.ts` `98147054…`, `user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…` — **unchanged** |
| Tested 2F blobs at branch head | `userPortfolioContract.ts` `0dec72eb…`, `translationBoundary.ts` `93f602fd…`, `userPortfolioBoundary.ts` `b8024c6b…`, `userPortfolioPort.ts` `ba0001e8…` — byte-identical to tested tree `8bb5bdae…` |
| F-3 carrier / resolver | `a576e5af…` / `9738e9b3…` — unchanged |
| IPD refs (live) | `main` `4d3e1cdc…`; `np04-governed-persistence-windows` `2e11fa3b…`; G24 `arena/01a0e6d9…` and `arena/01a0f308…` both `6828155e…`; act branch `arena/01a0f839…` `12c480b5…` — **all UNCHANGED** |

---

## 3. Transferred Windows results (operator-transferred — **not** Arena-verified)

The following are recorded **as transferred factual context**. Arena did **not** execute them, did not read the Windows filesystem, and does **not** independently verify them. They are reproduced without alteration, including the unresolved item.

| Activity | Result as transferred |
|---|---|
| Pinned IPD checkout | `G:\IIPS-Production-Market-Data-P2-PIN` |
| Expected commit / tree | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` / `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5` |
| Working tree at investigation | confirmed clean |
| Tooling integrity | all five operator-tooling SHA-256 hashes matched the handoff |
| `npm ci --ignore-scripts` | succeeded |
| TypeScript compilation | four existing test-file errors; exit 2 (**the expected baseline signature**) |
| Build artifacts | both required artifacts present |
| Block D1 | launcher preflight refusal, exit 65, no database (**corrected criterion `…-D1-CORR-01` — PASS at Layer 1**) |
| Block D2 | `PERSISTENCE_CONFIGURATION_INVALID`, exit 1, no listener (**PASS**) |
| F6 fail-closed configuration checks | **PASS — 8 checks, zero failures** |
| F1 health endpoint | established at `/api/ipd/health` |
| F2 loopback JWKS endpoint | established |
| F3 unmapped identity | 403 `IDENTITY_NOT_MAPPED` (the pre-P-4 fail-closed state) |
| F4 negative authentication tests | PASS — eight expected failures |
| **F5.2 JWKS failure test** | **UNRESOLVED** — observed `401 OIDC_KEY_UNAVAILABLE`; expected `401 OIDC_JWKS_UNAVAILABLE`; root cause not established (~30 min spent). **Preserved as unresolved; not classified PASS; not re-investigated here.** |
| Service shutdown | subsequent corrective shutdown verified PASS; ports 8421 and 8099 free |
| P-4 provisioning | **NOT DONE** |
| P-6 implementation authority | **NOT GRANTED** |
| P-8 qualification | **NOT DONE** |
| IPD source or remote changes | **NONE** |

---

## 4. Classification of F5.2 (source- and behaviour-derived; no Windows diagnostics)

**Method.** The pinned build was reproduced in an Arena scratch clone (pin `6828155e…`, tree `eb07ea36…`; `npm ci --ignore-scripts` exit 0; `npx tsc` exit 2 with exactly the four known baseline errors, `dist/` emitted) and the pinned key-resolution and error-mapping paths were exercised **directly** — `JwksClient.getKey` / `OidcVerifier.verifyToken` / `mapDomainError` from `dist/src/**` — with **no key material generated, no runtime started, no database created, no anchor started**. A token header naming an unknown `kid` is resolved before signature verification, so no signing key is required for any case.

| Case | Condition exercised | Thrown | Caller sees |
|---|---|---|---|
| A | JWKS endpoint **unreachable** (loopback connection refused) | raw `TypeError` (fetch rejected) | **500 `INTERNAL_ERROR`** |
| B | endpoint reachable, `{"keys":[]}` | `OidcKeyUnavailableError` | 401 `OIDC_KEY_UNAVAILABLE` |
| C | endpoint reachable, valid JWKS **lacking the token's `kid`** | `OidcKeyUnavailableError` | 401 `OIDC_KEY_UNAVAILABLE` |
| D | endpoint reachable, HTTP **non-OK** response | `OidcJwksUnavailableError` | 401 `OIDC_JWKS_UNAVAILABLE` |
| E | endpoint reachable, 200 but **not a JWKS** body | `OidcJwksUnavailableError` | 401 `OIDC_JWKS_UNAVAILABLE` |

**Classification.** The observed Windows result (`401 OIDC_KEY_UNAVAILABLE`) is emitted **only** by cases B/C — both of which require the JWKS endpoint to have **responded successfully**. It cannot be produced by an unreachable endpoint (A → 500) nor by a non-JWKS/non-OK response (D/E → 401 `OIDC_JWKS_UNAVAILABLE`). Therefore, at F5.2 time the endpoint was **still reachable**, i.e. the intended "anchor stopped" condition was **not in effect**, and the check did not exercise the unreachable-endpoint path. Two consequences follow, both recorded rather than resolved:

1. **The originally published F5 expectation was itself wrong** (as D1's was): with a genuinely stopped loopback endpoint the pinned code returns **500 `INTERNAL_ERROR`** (fail-closed, but not the named class), while **`OIDC_JWKS_UNAVAILABLE` requires an endpoint that responds but does not serve a JWKS**. Corrected as **F5R** in handoff §6.6 (`GC-P2-HANDOFF-F5-CORR-02`), with a mandatory precondition check that makes non-recurrence self-diagnosing: `401 OIDC_KEY_UNAVAILABLE` at F5R ⇒ endpoint still reachable ⇒ precondition failed ⇒ STOP.
2. **The adopted trust statement's wording is narrower than the pinned behaviour**: the act §2.2 states that an unreachable endpoint fails closed with `OidcJwksUnavailableError`; for a connection-refused endpoint the pinned code fails closed with `INTERNAL_ERROR` instead. The **substantive** requirement (`R-2.4`: unreachable ⇒ verification fails closed, **no cached-trust fallback**) is met — nothing is accepted and no cached key is substituted — but the **named class** is produced only in the responding-but-not-a-JWKS case. This is a **recorded wording-vs-behaviour deviation** for Program Authority disposition; no code change is available or authorized (a pinned-source change would be a P-6/IPD-side matter outside P-2).

**Status of F5.2: UNRESOLVED — unchanged.** It is not reclassified as PASS or FAIL; the Windows-side root cause is not pursued further; no further Windows diagnostic is required for the evidence publication (§5).

---

## 5. Evidence destination and transfer path (determined from existing conventions)

**5.1 Destination repository — IRR only.** `ramkivs/iips-review-recovered`, for four independently sufficient reasons: **(a)** P-2 is an IRR-governed Gate C act and every governing record of this sequence (act, handoff, tracker) is IRR-side; **(b)** the P-2 act's preserved boundaries prohibit IPD writes — "No IPD source change, protected-ref change, lineage merge, or repin is authorized by this act" — and all four IPD refs remain unchanged (a precondition this record re-verified); **(c)** the evidence concerns the operator-host anchor, custody and a *scoped non-production* runtime whose state (keys, runtime database) lives **outside both repositories** — it is not IPD-repository state; **(d)** Arena's Git credential is scoped to IRR, so an IPD-side publication would be non-durable from Arena (documented precedent: `NP-15-IPD-SIDE-EVIDENCE-PENDING-IPD-PUBLICATION.md`, 403 on IPD push/contents API). **IPD is not written — not "both", not "in addition".**

**5.2 Folder.** `evidence/integration/gate-c-p2-establishment-2026-10-14/` — the established IRR convention for Gate-C/P-2-scale evidence (`evidence/integration/<slug-with-date>/`; siblings: `integrated-verification-2026-10-11-remediation/`, `e2e-030-replay-remediation-2026-10-11/`, `g2-2-decision-gate/<date>/`, `convergence/2026-10-07/`). Published this session with its intake `MANIFEST.md`, which fixes the exact file set and the never-in-repo rule.

**5.3 Branch / workflow.** The **session branch** `arena/dd87c5d6-iips-review-recovered`, carrying the existing **PR #91** — the established Windows→Git transport mechanism recorded at `PHASE1B-WINDOWS-EVIDENCE-INTAKE-BLOCKED-REPORT.md` §6 ("committing and pushing them … to the session branch (never any other branch)", with `git pull --ff-only` first and a `chore(evidence):` commit). No new branch and no new PR are introduced; nothing is pushed directly to `main`.

**5.4 Established transfer mechanism (documented).** Git is the only channel: Arena cannot read `G:\`, Windows cannot read the Arena sandbox (`docs/FULL_IIPS_BI08_CONVERGENCE_PLAN.md:599`). A Windows-local deposit is invisible by construction; only a committed **and pushed** artifact is durable.

**5.5 Durable vs Windows-only — the actual transfer gap.**

| Already durable (Arena/IRR) | Still confined to Windows |
|---|---|
| The published handoff record with both corrections (`D1-CORR-01`, `F5-CORR-02`) | The raw `Start-Transcript` capture (Blocks A–F) |
| This reconciliation record; the intake `MANIFEST.md`; tracker §§15.14–15.16 | `p2-establishment-result.txt` (operator result summary incl. F5.2 as observed and the shutdown verification) |
| The P-2 act, P-2 request §§7.2–7.3, 1A′ `R-2.1…R-2.10`, tracker | `p2-pin-provenance.txt` (`rev-parse HEAD`/`^{tree}`, `status --porcelain`) |
| The §3 result table (operator-transferred *facts*, not artifacts) | `p2-anchor-key-public.json` (**public** fields only) |
| | `e-keygen.json`, `e-anchor.log`, `e-runtime.log`, `c-tsc.log`, `f-loader.json` (operator-side copies) |

**5.6 Minimum transfer (one commit).** Deposit exactly the four manifest artifacts into the folder of §5.2 and push — nothing else: no archives, no duplicate packages, no checksum files (ordinary Git blob verification suffices), no source changes.

```bat
cd /d <IRR working tree on Windows>
git fetch origin
git checkout arena/dd87c5d6-iips-review-recovered
git pull --ff-only origin arena/dd87c5d6-iips-review-recovered
REM copy the four artifacts into: evidence\integration\gate-c-p2-establishment-2026-10-14\
git add evidence/integration/gate-c-p2-establishment-2026-10-14
git status --porcelain
git commit -m "chore(evidence): deposit P-2 establishment evidence (P2-A-D1) with F5.2 unresolved"
git push origin arena/dd87c5d6-iips-review-recovered
git ls-remote origin refs/heads/arena/dd87c5d6-iips-review-recovered
```

`git status --porcelain` must list **only** the four artifact paths (plus the operator's own additions if any are intended) — no source, configuration, build or IPD path.

---

## 6. Closure determination and the single remaining action

**6.1 What can be closed now.** The **handed-over activity — the Arena → Windows handoff — closes on the §5.6 transfer**: the destination, the file set, the transport procedure and the closure criteria are fixed and published; the Windows results are reconciled against the handoff; both defective acceptance criteria (`D1`, `F5`) are corrected in the authoritative handoff with their replacement criteria pre-verified against the pinned build. Blocks A, C, D (D1 Layer 1, D2), E, F1–F4 and F6 are satisfied as transferred; the state root and its evidence area remain valid and must not be reset.

**6.2 What prevents declaring P-2 establishment *verified-complete*.** One clause of the act's own establishment-verification requirement is not yet established: P-2 request **§7.3(2)**, second half — *unreachable JWKS ⇒ verification fails closed with no cached-trust fallback*. F2 established reachability; F5.2 did **not** establish the unreachable-endpoint half (it exercised a reachable endpoint — §4). `R-2.4` requires that behaviour, so this is a **governing acceptance condition**, not merely a diagnostic.

**\[Scope correction `GC-P2-SCOPE-CORR-01` — recorded `2026-10-14` Asia/Calcutta; disposition record §4, tracker §15.19.\]** F5R is **CLOSED — OUT OF SCOPE** for this single-user application and is **not to be executed**; with that disposition, **no in-scope P-2 acceptance condition remains open** and §6.2's “cannot yet be declared verified-complete” statement is **superseded for current status** by the correction. The paragraph below is preserved as the historical definition of the action; see the disposition record §4 for the determination and §6 for the deposit status.

**6.3 The single remaining action (narrowly scoped, existing authority, no new gate).** Run corrected **F5R** (handoff §6.6 as amended): stop the anchor, **verify it is unreachable** (`F5R_PRE_LISTEN_8421=False`, `F5R_PRE_TCP_8421=False`), mint a token with an unknown `kid`, and observe the response. Expected per §4: **`F5R status=500 code=INTERNAL_ERROR`** — fail-closed, no cached-trust fallback. `401 OIDC_KEY_UNAVAILABLE` ⇒ endpoint still reachable ⇒ precondition failed ⇒ STOP and report. This is the same §7.3(2) check with a corrected precondition and expectation; it requires no configuration change, no restart of the runtime's configuration, no key, no database and no new authorization. It may be run **in the same session** as the evidence deposit (§5.6), and its raw output is added to the same folder as `p2-establishment-f5r.txt`.

**6.4 Subsequent milestones remain untouched by this record.** **P-4** provisioning — NOT DONE and still requires its own sequential express act. **P-6** implementation authority — NOT GRANTED. **P-8** qualification — NOT DONE. The P-8-shaped checks executed during establishment (F3/F4) were establishment verification under the act and do **not** constitute qualification; every artifact carries the label **non-production, single-user, self-asserted delegation**.

**6.5 What is *not* a blocker.** The F5.2 discrepancy itself (an observation against a defective criterion) does not block the evidence publication, and the trust-statement wording deviation of §4(2) does not block it either: both are **recorded** items awaiting Program Authority disposition. Neither justifies new gates, further Windows diagnostics or a code change.

---

## 7. Durable verification (how the published record is confirmed)

From Arena, read-only, at the destination: **PR #91** must show the new record, the evidence folder with its `MANIFEST.md`, and tracker §15.16 — with no other path; **`main` is unaffected until the PA merges the PR** (`main` remains `33bbb0f…`). Each deposited artifact is verified by **ordinary Git verification**: the remote contents API blob SHA must equal the local `git hash-object` of the same path, after which the transcript is inspected **as operator-transferred evidence** and each claim is labelled *operator-attested* (Windows execution, host state, runtime behaviour) or *Arena-verifiable* (pin/tree, blob equality, fence/2F/F-3 invariance, configuration-loader behaviour). Arena **does not** claim independent verification of the Windows execution itself: it verifies the *artifact* and the *reconciliation*, exactly as the IPD intake precedent records ("visual acceptance claims: INTAKEN and ACCEPTED" vs "technical numbers superseded by Arena's authoritative re-execution"). Publication coordinates are recorded post-merge by post-merge verification, never self-embedded.

---

## 8. Validation performed and not performed

**Performed (read-only, this session):** PR/branch/main state and blob verification (§2); live IPD ref verification (§2); reproduction of the pinned build in an Arena scratch clone (pin/tree re-checked; `npm ci --ignore-scripts` exit 0; `npx tsc` exit 2 with exactly the four known baseline errors, `dist/` emitted); the five-case key-resolution classification of §4 executed against the pinned build with no key, no runtime, no database and no anchor; destination determination against the existing evidence/branch/transport conventions (§5).

**Not performed (and none authorized):** no key generated, stored, copied, printed or hashed; no issuer/anchor/JWKS endpoint started; no runtime started; no database created, opened, migrated or written; no credential minted or presented; no Windows diagnostic re-run; no P-4 provisioning; no P-6 implementation; no P-8 qualification; no IPD write of any kind; no change to the pinned IPD source or its build artifacts; the state root was not touched or reset.

**Invariants preserved (verified at this record):** `/api/user-portfolios*` fail-closed at HTTP `503 owner-context-unavailable`; `/api/reports*` unchanged; Option 2F refusal unchanged (2F blobs byte-identical to tested tree `8bb5bdae…`); F-3 remains partition semantics and is not a principal, credential or membership; no caller-controlled canonical identity; no IPD write and no protected-ref change; NP-04 and G24 lineages unmerged; no route/UI activation; no consumer admission; Gate A OPEN; Gate B Option C; R3 OPEN; R4-B CLOSED; no Company Identity Authority; `D115-A` ineffective; `P2`/`P3` OPEN. **No runtime, deployment or production readiness is claimed anywhere.**

---

## 9. Publication and effectiveness

Additive documentation-only change on session branch `arena/dd87c5d6-iips-review-recovered` (from `main@33bbb0f…`): the evidence intake manifest (new), this reconciliation record (new), the handoff §6.6 correction `GC-P2-HANDOFF-F5-CORR-02`, and tracker §15.16 — **no code, test, pin, lockfile, schema, fence, transport, route, UI, tooling or runtime change; no IPD write**. Published through the existing PR #91. Consistent with the program rule, publication coordinates are recorded after merge by independent remote verification, never self-embedded.

*Status: **`WINDOWS RESULTS RECONCILED — EVIDENCE DESTINATION FIXED (IRR evidence/integration/gate-c-p2-establishment-2026-10-14/ via session branch + PR #91) — MINIMUM TRANSFER = ONE COMMIT OF FOUR ARTIFACTS + F5R — F5.2 PRESERVED UNRESOLVED — §7.3(2) UNREACHABLE-JWKS CLAUSE NOT YET ESTABLISHED — P-4 NOT DONE, P-6 NOT GRANTED, P-8 NOT DONE`.***
