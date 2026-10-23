# IIPS v3.0 — CAP-03 One-Pass Prerequisite Resolution, Decision Register & Gate 5 Admission Boundary

> ## STATUS: **INVESTIGATION AND RECONCILIATION COMPLETE — CAP-03 REMAINS BLOCKED**
>
> This record renders **no** successor provisioning act, **no** identity/binding provisioning, **no**
> operational-write authorization, **no** host qualification, **no** result acceptance and **no**
> Gate 5 admission. It lifts **no** HTTP `503` fence. It does not revive, port, cherry-pick or
> re-implement historical G24. Every decision it identifies as outstanding is recorded as
> **prepared / requested — NOT EFFECTIVE** unless a cited prior record is itself effective.
>
> What this record *does* do, under the standing investigation/documentation/publication authority:
> it re-verifies the current authoritative state from the remotes, reconciles every CAP-03
> prerequisite against effective (not proposed) records, eliminates stale and duplicated blockers,
> records the two post-§16.92 cross-repository movements, and publishes the exact, dependency-ordered
> decision sheet the Program Authority must render before CAP-03 can move.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-PREREQUISITE-RESOLUTION-2026-10-23-01` |
| **Tracker registration** | Master tracker §16.93; correction `CV-CORR-76`; change log `CHG-2026-10-23-19`; verification rows `V439`–`V454` |
| **Date** | `2026-10-23` (UTC) |
| **Workstream** | CAP-03 — the fenced IRR durable user-portfolio capability (`/api/user-portfolios*`, tracker `REG-12`, §18 rows 30–34, `CV-52`), whose provider is the IPD Gate 3 same-host IPC line. Historical implementation G24 is **REFERENCE ONLY**. CAP-03 is not CAP-02: CAP-02 (§16.83–§16.92) built the separate `/api/broker-import/**` surface and expressly acquired **no** CAP-03 dependency |
| **Starting IRR `main`** | `409604e4dfefbe6aa966113f52af607995b5f297`, tree `297ce6aebd9a4d93b8e3fc572720aa18a8e682ca` (merge of PR #228; `main` push CI `39959170611` `completed / success`) — re-verified live at pass start and equal to this branch's base |
| **IPD `main` (read-only)** | `bb4101b5d16546a1327227258a947e9cbe463900`, tree `b02ef11c61bb87e64c3effb5d252566f43ef26c5` (merge of IPD PR #61; `main` push CI `39964704258` `success`). This is **newer** than the IPD baseline last recorded in the IRR tracker (`2d9130e7…`, §16.92): IPD PRs #60/#61 are evidence/documentation-only (13 paths, all under `evidence/cross-repository/`, zero `src/`/`tests/`/`package.json` change from `2d9130e7…`), so the IRR package pin `#2d9130e7…` is unaffected, while two CAP-03-relevant decision-preparation records now exist on IPD `main` (§2.3) |
| **Authority exercised** | Standing PA grant (F-3 §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`) as construed by DEC-06 `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` (`R-1`/`R-2`/`R-3`/`R-6`/`R-7`), plus the 2026-10-23 CAP-03 directive to investigate, reconcile, document, test, publish and tracker-reconcile in one pass. That authority is expressly **not** used here to select a provisioning mechanism, provision a binding, authorize writes, lift a fence, qualify a host, accept a result or admit Gate 5 — each is a separate PA-rendered act identified in §10 |
| **Capacity** | IRR records the consumer-side decisions and the tracker; IPD owns the provider contract, the store, provisioning code and its own acts (DEC-06 `R-7`). IPD was inspected read-only only (API + a `/tmp` clone); no IPD file, branch, PR, issue or comment was touched |
| **Final verdict** | **BLOCKED** — with the blocker set reduced to its genuine critical path (§9–§10). No blocker that required only reconciliation remains open |

---

## 1. What CAP-03 is, and what it is not

CAP-03 is the admission of the already-implemented, already-fenced IRR user-portfolio surface:

```text
IRR renderer  →  IRR host (frontend/server/executive-transport.ts)
              →  /api/user-portfolios*            (6 paths / 12 route-method pairs)
              →  IpcUserPortfolioPort             (frontend/server/user-portfolio/ipcPortAdapter.ts)
              →  same-host IPC v1                 (portfolio.list / .get / .revisions / .create /
                                                   .save / .reset / .delete; portfolio.analytics reserved)
              →  IPD DurablePortfolioStore        (node:sqlite; owner resolved by IPD per request
                                                   from its single ACTIVE local-principal binding)
```

- **Scope ceiling.** Single-user, single-principal, same-host, non-production (`H-18`). No multi-user
  architecture, no authentication/RBAC/OIDC, no tenant directory, no network listener is a CAP-03
  prerequisite, and none may be introduced as one.
- **Not CAP-02.** CAP-02's `/api/broker-import/**`, `BrokerImportModal`, modal/port composition act
  `-04`, U1 transport act and U7 minimal-receipt contract are effective and published (§16.88–§16.92),
  and every CAP-02 write still terminates in `WRITE_NOT_AUTHORIZED`. None of that admits a CAP-03
  route, provisions a binding, qualifies a host, accepts a result or grants Gate 5. In particular the
  effective U7 decision *expressly* leaves the frozen G2 seven-field/three-rename matrix unresolved
  (U7 effective record §2) — that matrix is a CAP-03 contract question (DR-2), not a CAP-02 one.
- **Not G24.** G24 (`6828155e…`, HTTP `/api/ipd/*`, `better-sqlite3`, `application_users` /
  `tenant_memberships` / `external_identity_mappings`) is the historical implementation of the same
  product capability. It is off both `main`s and is reference-only (§8). The successor provider is the
  Gate 3 IPC line on IPD `main`; CAP-03 is about *that* line's provisioning, qualification, acceptance
  and admission.

## 2. Phase A — Current authoritative state (re-verified live, 2026-10-23)

### 2.1 Repositories, PRs and CI

| Item | Verified value |
|---|---|
| IRR `refs/heads/main` | `409604e4dfefbe6aa966113f52af607995b5f297` / tree `297ce6aebd9a4d93b8e3fc572720aa18a8e682ca`; `main` CI `39959170611` success |
| This branch | `arena/66950ace-iips-review-recovered` at the same commit/tree; clean worktree at start |
| IPD `refs/heads/main` | `bb4101b5d16546a1327227258a947e9cbe463900` / tree `b02ef11c61bb87e64c3effb5d252566f43ef26c5`; `main` CI `39964704258` success |
| IRR open PRs | **One:** #204 "Gate 4/H-12 dependency and DR/GOV execution report" (head `dee114ae…`, created 2026-10-22, one new root-level evidence file, documentation-only). Its baselines are stale (IRR `922fdc78…`, IPD `73fd8c16…`, PR #114 still open) and its locus duplicates this record. **Disposition: do not merge as-is**; its dependency analysis is superseded by this record at current pins. It is left open and untouched by this pass — closing another session's PR is not required for CAP-03, and no CAP-03 claim in this record depends on it |
| IPD open PRs | **One:** draft #42 (Gate 3 connection-slot candidate, `CONFLICTING`), unchanged and outside every effective act |
| IRR merged PRs since the last CAP-03-adjacent record (§16.82) | The CAP-02 sequence #205–#228 and PR #114 (DB-C1 bounded broker *preview*, §16.91). PR #114's merge is a bounded non-production preview admission; it carries **zero** G24/CAP-03 lineage and admits no CAP-03 route — the §16.82 census line "PR #114 `OPEN`/`CONFLICTING`, an unadmitted historical lineage" is therefore stale *as a census fact* and is corrected here; no status follows from it |
| IPD merged PRs since §16.92's baseline | #60 (`448b097c…` → merge `e2f33263…`, CI `39964246325` success) and #61 (merge `bb4101b5…`) — documentation/evidence only, §2.3 |

### 2.2 Gate and workstream status (effective records only)

| Item | Status | Governing record |
|---|---|---|
| Gate 3 implementation | **ACCEPTED — bounded implementation scope only** | `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` (blob `f3a6c9a3…`); act `…-2026-10-19-02` + `G3-AMEND-01`. Acceptance is not qualification, not result acceptance, not admission |
| Gate A′ provisioning | **APPROVED (2026-10-17, superseded basis) / NOT EXECUTED**; basis proved inapplicable to current `main` | IPD `IIPS-V3-G2-IPD-GATE-A-PRIME-PA-DECISION-2026-10-17-01` (blob `c04f8a30…`, P-1, one execution, no substitution); inapplicability: tracker §16.82 + IPD successor proposal (§4) |
| Gate 4 (U3) | **NOT AUTHORIZED / NOT STARTED**; authority act **PROPOSED — NOT EFFECTIVE**, Act ID `PENDING ASSIGNMENT` | IRR proposal rev. 4, blob `c02093e0…`; QE matrix `b18a48a2…`; D-1…D-12 packet `7d3b143e…` (§6) |
| Gate 4 result acceptance (U4) | **NOT RENDERED** — no such record exists in either repository | Gate E W-1(3); Gate 4 proposal §10 |
| Gate 5 admission (U5 / `CV-52`) | **NOT GRANTED / NOT INITIATED** | Q1-b disposition §4; GOV-05 (§16.81–§16.82); W-1(4) (§7) |
| Operational writes (U6 / Gate E W-1) | **NOT AUTHORIZED** — `evaluatePortSaveGuard()` hard-false; IPD dispatch returns `WRITE_NOT_AUTHORIZED` before any mutation for all four write ops | Gate E rev. 1 (IPD blob `4a9501bf…`) W-1/W-15, re-verified in current IPD `src/ipc/dispatch.ts` (`27becc76…`) this pass |
| IRR `503` fences | **All 12 route-method pairs fenced**; fence blobs byte-identical (§8) | F-4/F-5; Gate 3 act §5.6 |
| `SESSION_ONLY` / `durable:false` (IRR) | Unchanged | Gate 3 act §8.4; CAP-02 `-04` §5 |
| CAP-02 | Broker-import composition **effective and published**; its own U3/U4/U5/U6 remain open and unchanged | §16.88–§16.92. CAP-02 completion proves **nothing** for CAP-03 beyond the shared provider facts it verified |

### 2.3 What changed after the previously recorded CAP-03 investigation

The last integrated CAP-03 prerequisite record in IRR is §16.82 / `CV-CORR-64`
(`IIPS_v3.0_GOV03_MERGE_AND_GOV04_GOV05_RECONCILIATION_2026-10-22.md`, blob `c39748b7…`), which
created **DR-1…DR-4 as requests**. Since then, and only since then:

1. **IPD PR #60/#61 (2026-10-23)** published, on IPD `main`, a decision-ready **successor Gate A′
   proposal** (`IIPS-V3-CAP02-SUCCESSOR-GATE-A-PRIME-PROPOSAL-2026-10-23-01`, blob `9eb99fc6…`,
   **PROPOSED — NOT EFFECTIVE**), a U3/Gate 4 reconciliation (`d1c8c186…`) and a QE-1…QE-11 status
   matrix (`e76d4a3e…`, **0 of 11 executed**), with executed probes proving (a) the 2026-10-17 basis
   schema cannot be opened by current `main`, and (b) no reachable provisioning path exists on
   `main`. These are the first *decision-ready* DR-1 texts; they render nothing.
2. **Migration `004` landed** on IPD `main` under its own effective IPD act
   (`IIPS-V3-CAP02-U2-PROVENANCE-SCHEMA-ACT-2026-10-23-01`, blob `e33279b8…`; migration blob
   `6bad5a50…`). DR-4's *schema* question is therefore partially superseded (§5.4); its *consumer
   contract* question for CAP-03 is not.
3. **CAP-02's U7 decision** (`ae9800c4…`) became effective for the modal surface only and explicitly
   preserved DR-2/DR-3 for any G2 consumer — i.e. for CAP-03.
4. **The Gate 4 proposal's pins went stale:** IPD pin `1cceacff…` is now **33 commits** behind IPD
   `main` (66 files changed), and the proposed IRR QE-consumer pin `d355d904…` no longer matches
   current `ipcPortAdapter.ts` (the §16.82 rename-metadata restoration). Silent re-pinning is
   prohibited by the proposal's own §14.5.

### 2.4 Provenance table — records inspected and their effective status

| Record | Authoritative location (blob at the baseline above) | Status | CAP-03 consequence |
|---|---|---|---|
| Standing PA grant (F-3 §1.2) | IRR `IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` `c4c9f7d7…` | **Effective** (as published) | Authorizes this investigation/documentation/publication; forbids fabricated evidence, weakened safeguards, unrelated scope expansion, unverified success |
| DEC-06 reconciliation | IRR `2026-10-21/DEC-06-…md` `4be3ea57…` | **Effective construction** | R-2: established scope is set by governing boundaries; R-3: authorization ≠ act ≠ proof. This is why the successor act, Gate 4 act, acceptance and admission cannot be "rendered by the grant" where a governing record reserves them |
| D-1 Option C | IRR `PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` `12eeaee9…` (decision `D-1-PERSISTENCE-DOMAIN-OWNERSHIP-DECISION-01`) | **Effective**, non-executable | Portfolio and artifact/report persistence are distinct domains; G24 is the evidence-backed *portfolio lineage*, **not** promoted, **not** main-admitted, no cross-domain identity mapping, future integration only via a separately governed interface (§§1, 6–12). D-1 is a taxonomy decision — it selects no provisioning mechanism for the Gate 3 successor |
| G3-D5 | IRR `IIPS_v3.0_G3_D5_REFERENCE_ONLY_PA_DECISION_2026-10-19.md` `849be80a…` (`IIPS-V3-G3-D5-…-2026-10-19-01`) | **Effective PA decision** | The off-main 2026-10-07 durable line incl. `470cc698…`/`6828155e…` is **REFERENCE ONLY** (CV-20(a)/P7 resolved): not a baseline, not an IPD-main basis, not a Gate 4/5 input, no promotion/merge/cherry-pick/re-pin. Unchanged by this pass |
| G3-D4 | IRR `IIPS_v3.0_G3_D4_PROVISIONING_CODE_SCOPE_PA_DECISION_2026-10-19.md` `b969abab…` | **Effective PA decision** (`INCLUDE CODE`) | Provisioning *code* may be (and was) included in Gate 3 scope; code inclusion is **not** Gate A′ execution and supplies no provisioning evidence |
| Gate A′ 2026-10-17 | IPD `evidence/np04/IIPS_v3.0_G2_IPD_GATE_A_PRIME_PA_DECISION_RENDERED_2026-10-17.md` `c04f8a30…` | **Effective, APPROVED, NOT EXECUTED**, basis superseded | One P-1 execution on its own pinned basis (`2ded0e98…`); §4.9/D-A′-8 forbid substitution. Valid for its artifact; **inapplicable to current `main`** (§4.1) |
| Gate E write policy rev. 1 | IPD `evidence/cross-repository/IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md` `4a9501bf…` | **Accepted (PA, G2-D2)** | W-1's four conjunctive conditions; QE-1…QE-11 definitions (§4); §5 expressly does **not** authorize executing Gate A′/Gate C, durable writes or result acceptance |
| Contract v1 | IPD `evidence/cross-repository/IIPS_V3_G2_IPD_IRR_PORTFOLIO_CONSUMER_CONTRACT_V1_2026-10-18.md` `163eb1f1…` | **Accepted** | Closed op set, Class P/A, result shapes (§6), OC-1…OC-7 owner-context rules, reserved `portfolio.analytics`. The contract CAP-03 must satisfy; DR-2/DR-3 are gaps *against* it and against the frozen IRR G2 types |
| Gate 3 act + acceptance | IRR act `4744e6f4…`; `G3-AMEND-01` `85ba78e6…`; acceptance `f3a6c9a3…` | **Effective; ACCEPTED (bounded implementation only)** | W-1(2) satisfied; W-1(3)/(4) false; runner changes excluded; §6.4(1) defers runner repair to a Gate 4 PA act; schema changes need their own act (§4.7) |
| Q1 portfolio decision + Q1-b | IRR `IIPS_v3.0_Q1_PORTFOLIO_DECISION_ACT_2026-10-22.md` `de786032…`; `IIPS_v3.0_Q1B_OWNERSHIP_SOURCE_DISPOSITION_2026-10-22.md` `5e85b556…` | **Effective** | Ownership source designated (the IPD A-2 binding), operationally **not established**; fences lift only under a Gate 5 act naming qualified commits/operations |
| DR-1…DR-4 | IRR `IIPS_v3.0_GOV03_MERGE_AND_GOV04_GOV05_RECONCILIATION_2026-10-22.md` §3 (`c39748b7…`); tracker §16.82.5 | **Requests — NOT determinations** (unchanged as records) | The four CAP-03 prerequisite questions. Their *current* dispositions after §2.3 are given in §4–§5; none has been rendered by a later effective act except DR-4's IPD schema half |
| IPD successor Gate A′ proposal | IPD `evidence/cross-repository/IIPS_V3_CAP02_SUCCESSOR_GATE_A_PRIME_PROVISIONING_ACT_PROPOSED_2026-10-23.md` `9eb99fc6…` | **PROPOSED — NOT EFFECTIVE** (decision-ready) | The narrowest existing DR-1 text: D-A2-1…D-A2-8, options A/B/C for the entrypoint, V-A2-1…V-A2-8 validation, exact missing determination (§4). Its locus is IPD (security-contract capacity); this IRR record registers it rather than duplicating it |
| IPD U3/Gate 4 reconciliation + QE matrix | IPD `d1c8c186…`, `e76d4a3e…` | Investigative (renders nothing) | Proves 0/11 QE executed, classifies every QE item's blockers B1–B7, and why the Gate 4 act cannot be rendered from an IPD locus |
| IPD U2 provenance/schema act | IPD `e33279b8…` (`IIPS-V3-CAP02-U2-PROVENANCE-SCHEMA-ACT-2026-10-23-01`) | **RENDERED — EFFECTIVE for its exact IPD manifest only** | Migration 004 + read projection landed and tested on IPD; §4 expressly leaves the G2 seven-field/three-rename gap outside its scope; grants no write, Gate 4 or Gate 5 status |
| Gate 4 proposal package (rev. 4) | IRR act `c02093e0…`, QE matrix `b18a48a2…`, evidence packet, D-1…D-12 packet `7d3b143e…` | **PROPOSED — NOT EFFECTIVE**; Act ID `PENDING ASSIGNMENT` | The only Gate 4 text. §9 effectiveness requires a PA determination resolving Q1–Q12 and assigning the Act ID; merge/publication confer nothing; pins now stale (§2.3.4) |
| CAP-02 U7 / U1 / composition acts | IRR U7 `ae9800c4…`; U1 and `-03`/`-04` per §16.88/§16.92 | **Effective for the CAP-02 surface only** | Minimal-receipt consumer contract, broker-import routes, revision-read. U7 §2 preserves DR-2; §1.7 preserves the `fileName`/`importedAt` provenance gap as refused unknown keys. No CAP-03 effect |
| GOV-04/GOV-05 records | IRR `IIPS_v3.0_GOV04_OPERATIONAL_BLOCKERS_AND_GOV05_PREREQUISITES_2026-10-22.md` `b7f90df7…` + §16.81/§16.82 | Investigative/evidence (no decision rendered) | GOV-04 source not operational; GOV-05 prerequisite list 1–7 (item 1, landing, satisfied; 2–7 not). Re-verified and updated by §§4–7 below |
| PR #204 evidence report | IRR branch `arena/0ca71efc-…` `dee114ae…` (not on `main`) | Investigative, **stale, not authoritative** | Superseded by this record; see §2.1 |

No successor record was found that supersedes D-1, G3-D5, Gate E, contract v1, the Gate 3 acceptance
or the Gate 4 proposal's proposed status. No result-acceptance act and no Gate 5 admission act exist
in either repository (census this pass).

## 3. Phase B — The actual dependency chain

```text
[PA determination: successor Gate A′ act]                         (CAP03-P01, DR-1)
  ├─ re-baseline onto a named current IPD commit/tree
  ├─ name principal_label + (tenantId, canonicalOwnerId) verbatim  (CAP03-P02)
  └─ paired implementation authority for ONE provisioning
     entrypoint + validator + tests                                (CAP03-P03)
        → [operator execution on desktop-no0nhtp under P-1]        (CAP03-P04)
             exactly 1 ACTIVE binding + 1 ACTIVE membership + 1 audit row;
             V-A2-1…V-A2-8 receipt; IRR precondition may then be
             affirmatively backed — fences still closed
[PA contract determinations: DR-2, DR-3, DR-4-residual]           (CAP03-P05…P07)
        → bounded provider/consumer implementation at exact pins,
          package/public-surface consumer proof
[PA determination rendering the Gate 4 act effective]             (CAP03-P08)
  Act ID + Q1–Q12 + re-pinned IPD/IRR commits + H-12 adoption
  after Limb A (runner parser repair + mandatory parser test)
        → [QE-1…QE-11 executed on desktop-no0nhtp]                 (CAP03-P09)
             incl. QE-11 Gate C subset; every item PASS / FAIL /
             INCONCLUSIVE recorded; no substitute evidence
        → [separate Gate C acceptance for the QE-11 subset]        (CAP03-P10a)
        → [separate Gate 4 result-acceptance act]                  (CAP03-P10)
             names run, evidence digests, qualified commits;
             only here may durability language become a claim (DR-3)
        → [separate Gate 5 admission act — CV-52]                  (CAP03-P11)
             names qualified commits + named route-method pairs;
             states W-1 disposition operation-by-operation
        → [bounded implementation lifting exactly the admitted     (CAP03-P12)
           pairs; PR/CI/remote read-back; tracker reconciliation]
```

Ordering constraints that are *structural*, not conventional:

1. **Provisioning precedes qualification.** Gate E §4 runs QE items "on the Windows deployment host,
   after Gate A′ provisioning, at recorded digests". QE-8 needs an ACTIVE binding to revoke; QE-4/5/6
   need an operator store the qualified build can open.
2. **The entrypoint precedes provisioning.** On current IPD `main` the sole mutator is brand-gated on
   a module-private symbol and imported by no `src/` module (§4.2). Authority without the entrypoint
   cannot execute; the entrypoint without authority must not.
3. **Contract decisions precede the qualifying build.** Qualifying a consumer that still refuses every
   v1 result (DR-2) would qualify a refusal, not the capability. The pins frozen into the Gate 4 run
   must already contain the DR-2/DR-3/DR-4-residual implementation, or the act must expressly scope
   the affected QE items as limitation findings — a PA choice (Q4), never an implementer's.
4. **Qualification precedes acceptance; acceptance precedes admission; admission precedes any fence
   lift.** Each is a distinct act by a named authority (W-1, Gate 3 act §5.6, Q1-b §4). No step implies
   the next.
5. **Reads and writes are separately admissible.** Gate 5 may admit named read pairs while W-1 still
   refuses writes, or vice versa only if W-1 is fully met. A "generic" lift of `/api/user-portfolios*`
   is not an available act shape.

A technical dependency is not an authorization: every arrow above that begins "[PA …]" is a decision
no agent, test result or prior gate can render.

## 4. Phase C — Successor provisioning basis (DR-1)

### 4.1 The 2026-10-17 act cannot be executed on the current baseline

Re-verified this pass against live refs and the IPD probes published in PR #60:

| 2026-10-17 D-A′-1 pin | At its basis ref `2ded0e98…` / tree `9069045d…` | On IPD `main@bb4101b5…` |
|---|---|---|
| migration `003` `9ba884ac…` | match | `32b125bf…` — **differs** |
| `src/gate_a/provision.ts` `b6f780f6…` | match | **absent** |
| `src/gate_a/validate.ts` `550b9f4b…` | match | **absent** |
| `src/app_identity/local_principal.ts` `710a47e2…` | match | **absent** (no `src/app_identity/`) |

The schemas are mutually incompatible (measured): the approved basis provisions `application_users`,
`tenant_memberships` and `local_principal_audit_events`, none of which exist on `main`; `main`'s
`local_principal_bindings` has different columns (`binding_id`/`principal_label`/`status`); applying
`main`'s migration set over a basis-schema store fails closed (`table portfolio_revisions already
exists`). Identifier and audit semantics also differ (UUIDv4 "never derived" + two A-3 rows, versus
deterministic `sha256(…)[0,32]` ids + one hash-chained `audit_events` row). Executing the old act on
`main` would violate its own no-substitution rule; executing it on the basis ref would contradict
G3-D0/G3-D5 (reference-only) and produce a store the qualified build cannot open. **A successor act
is therefore required; this is a proved fact, not a preference.**

### 4.2 No provisioning mechanism is currently selected *or reachable*

- **No effective decision selects a successor basis.** G3-D4 selected *code inclusion*; D-1 selected a
  domain taxonomy; neither re-baselines Gate A′, names identity values, or authorizes an entrypoint.
  The Gate 4 proposal (§14.6) expressly does **not** authorize "a new `provisioning.ts` entrypoint or
  Gate A′ re-baseline". The IPD successor proposal is decision-ready but **PROPOSED — NOT EFFECTIVE**.
- **The code path is deliberately unreachable.** `src/persistence/provisioning.ts` (`dc844189…`):
  `provisionActiveBinding` refuses with `ProvisioningNotAuthorizedError` before any SQL unless given
  an object carrying the module-private brand; 4/4 forgeable shapes refused with zero row/audit delta
  (IPD probe `01_…`); no `src/` module imports it (static regression `g3_startup_validation`).
  `buildBindingProvisionStatements` is pure text. This fail-closed posture is correct and is preserved.
- **Identity values are a genuine GAP.** The successor act must name `principal_label` and the
  `(tenant_id, canonical_owner_id)` pair verbatim. No effective IPD record fixes them. They may not
  be inferred from hostname/account/SID/e-mail/`companyId`/issuer/subject, and may not be silently
  copied from IRR's F-3 pair (`owner-7f3a91c2`, `irr-domain-4b82d6e1`): D-1/D-2 establish no
  cross-domain identity equivalence, and F-3 forbids inferring an owner from another domain's
  identifier. Reuse is possible only if the PA says so expressly (IPD proposal D-A2-2 **[GAP]**).

### 4.3 Candidate approaches (comparison only — nothing is selected here)

This is the comparison already prepared in the governing records (§16.82 DR-1; IPD proposal D-A2-4),
restated so the PA decision is a single, bounded choice. **This record selects none of them** —
selecting an operational provisioning mechanism is outside the authority exercised here (§2.4, F-3,
DEC-06 R-2), and the CAP-03 directive for this pass states the same boundary.

| Option | Content | Assessment on the evidence |
|---|---|---|
| A — Execute the 2026-10-17 act on its basis ref | No new code; P-1 execution at `2ded0e98…` | Self-defeating: incompatible schema (§4.1), reference-only basis (G3-D0/G3-D5), store unopenable by the build Gate E §4 must qualify |
| B — Bounded successor act on current `main` | New act naming the exact current commit/tree/tool/schema blobs, the verbatim identity values, and **paired** implementation authority for one act-named provisioning entrypoint + validator + tests (brand gate preserved; not importable from `src/ipc/**`/startup; inert without the adopted act; no environment-variable bypass) | The only technically coherent option identified by both prior records — recorded here as their recommendation, **not** as a rendered selection |
| C — Externally mint the brand | No repository change | Impossible by construction (module-private symbol); reduces to B |

If B is adopted, the successor act's minimum contents are already fixed by the IPD proposal and are
adopted here as the *decision-ready checklist* (not as decisions): exact basis commit/tree/blobs;
D-A2-1 principal (one named human operator, label-only on `main` — no `application_users` row may be
assumed); D-A2-2 owner pair verbatim; D-A2-3 permitted state (exactly one ACTIVE binding, one ACTIVE
membership, one hash-chained audit row, nothing else) including the [P] question whether the single
audit row satisfies A-3 semantics; D-A2-4 entrypoint file set/invocation/authorization provenance;
D-A2-5 validation V-A2-1…V-A2-8 and raw-evidence receipt; D-A2-6 host prerequisites (P-1 path rule
re-adopted; `desktop-no0nhtp`; non-elevated; Node `>=22.13.0 <23`; `node:sqlite` without a flag;
endpoint named verbatim); D-A2-7 exclusions (no second identity/tenant/user, no auth machinery, no
portfolio rows, no writes, no `durable:true`, no W-1 change); D-A2-8 gate separations; single
execution, consumed on failure, no repair/re-run.

**No identity or binding was provisioned in this pass; no store was created; no path was selected.**

### 4.4 Exact minimum decision required (DR-1 closure)

> A Program Authority determination, rendered in the IPD locus (security-contract capacity),
> adopting a successor Gate A′ act at a named current IPD commit that **(i)** re-baselines
> provisioning onto that commit, **(ii)** names `principal_label`, `tenantId` and `canonicalOwnerId`
> verbatim, and **(iii)** in the same determination grants the bounded implementation authority for
> the single provisioning entrypoint + validator + tests the act designates.
> **Closure evidence:** the rendered act published and remotely verified; then, separately, the host
> execution receipt with V-A2-1…V-A2-8 (CAP03-P04). The act alone does not provision anything.

## 5. Phase D — Contract prerequisites (DR-2, DR-3, DR-4 and the v1 surface)

Evidence basis: accepted contract v1 (IPD `163eb1f1…`, §6 table), the current IPD implementation
(`src/ipc/{protocol,dispatch}.ts`, `src/persistence/portfolio_store.ts` `4a005b73…` at
`main@bb4101b5…`, inspected read-only), and the current IRR consumer
(`frontend/server/user-portfolio/{userPortfolioContract,ipcPortAdapter,ownerContextFromBinding}.ts`).
No conclusion below rests on a PR description, a test double or G24.

### 5.1 Already settled by effective contract/implementation (no decision needed)

| Question | Settlement |
|---|---|
| Transport / IPC boundary | Same-host IPC v1 only: length-prefixed frames (64 KiB request / 256 KiB response caps), one request and at most one response per connection, closed op set (`list/get/revisions/create/save/reset/delete`), `portfolio.analytics` reserved and refused as unknown. No HTTP provider route, no new listener |
| Caller-controlled identity/authority | Refused Class P at any depth: the 29 certified keys plus C7 additions (`companyId`, `identityStatus`, `resolutionDisposition`, `tenantHint`, …) in `IPC_REFUSED_WIRE_KEYS`; IRR transmits no owner/tenant/principal field and its tenant hint is local-only (OC-1…OC-7; `ownerContextFromBinding.ts`) |
| Binding precondition semantics | IPD resolves the owner per request from its single ACTIVE binding/membership; absent/invalid ⇒ Class P **zero bytes**, no reason disclosed. IRR's `IIPS_G3_IPC_BINDING_PROVISIONED` is a local, fail-closed (`false`) precondition — justification to call, never proof of a binding |
| Refusal vocabulary | Class P (zero bytes) vs Class A closed set (`WRITE_NOT_AUTHORIZED`, `INVALID_REQUEST`, `RESOURCE_UNAVAILABLE`, `REVISION_CONFLICT`, `REFUSED_UNRESOLVED_IDENTITY`, `REFUSED_STORE_GUARD`, `UNAVAILABLE`); every refusal has no store effect (W-15) |
| Revision semantics (write side) | `expectedRevision` mandatory; stale ⇒ `REVISION_CONFLICT` with no mutation; tombstoned/missing/foreign indistinguishable (`RESOURCE_UNAVAILABLE`); MERGE/REPLACE/RESET/DELETE per W-10 |
| Save outcome shape | Minimal receipt `{disposition, revision, durability, durable}`; dispositions `SAVED_NEW_BATCH` / `MERGED_INTO_EXISTING` / `ALREADY_IMPORTED_NO_OP`; duplicate only from the no-op disposition (also the effective CAP-02 U7 consumer rule) |
| Unknown outcome | Distinct state: zero automatic retries, no rollback claim, reconcile-by-read before any user-initiated retry (W-9) |
| Write enablement | All four write ops currently `WRITE_NOT_AUTHORIZED` before mutation — the correct W-1 posture, asserted by tests on both sides |

### 5.2 DR-2 — the G2 read-contract gap: **UNRESOLVED** (blocking any admitted CAP-03 read)

The frozen IRR G2 types (`userPortfolioContract.ts`, blob `e6b57bb8…`) require, and v1 results do
not supply, **7 fields**, and spell 2 properties differently (**3 renames**) — re-verified in source
this pass (`V1_TO_G2_ENVELOPE_GAP`, `ipcPortAdapter.ts`):

| Shape | Missing from v1 | Renamed in v1 |
|---|---|---|
| `G2PortfolioSummary` (`portfolio.list`) | `weightSumPercentage`, `provenanceDigest`, `isSaved` | `holdingsCount` → `totalHoldingsCount` |
| `G2PortfolioView` (`portfolio.get`) | `isSaved` | `holdingsCount` → `totalHoldingsCount` |
| `G2RevisionEntry` (`portfolio.revisions`) | `totalMarketValue`, `provenanceDigest`, `holdingsCount` | `committedAt` → `createdAt` |

Current behaviour is honest refusal: the adapter throws `UPSTREAM_UNAVAILABLE` (contract-envelope
violation) naming the missing fields and fabricates nothing. The cross-repository probe (§16.82)
measured refusals naming exactly 3/1/3 fields. **Classification: decided nowhere; implemented as
refusal; evidence complete; a new PA decision is required.** The prepared alternatives (§16.82 DR-2)
stand: (a) v1 minor revision adding the 7 fields **plus** express IRR mapping authorization for the
3 renames (the prior records' recommendation); (b) duplicate G2-named fields IPD-side (rejected in
prior records: two names for one value); (c) replace the frozen G2 family. Whichever is chosen, the
act must fix per-field source-of-truth and lifecycle semantics — above all `isSaved`
(INITIAL/save/RESET/tombstone rule; never inferred from revision>0 or non-empty holdings),
absent-vs-null-vs-error policy, historical-revision behaviour, and the permitted
producer/adapter/test manifests including re-authorizing the adapter's refusals to become validated
mappings. **No property is chosen here.**

### 5.3 DR-3 — `durability` / `durable` on `PortfolioDetail`: **UNRESOLVED** (blocking a full-conformance claim; not blocking bounded implementation)

Contract v1 §6 lists `durability`/`durable` on `portfolio.get` (and on the save receipt, where the
receipt semantics are already settled, §5.1). The current IPD `PortfolioDetail` omits both; the
conformance suite asserts their absence, so the omission is visible. `DurablePortfolioStorePort`
declaring `durability:'DURABLE'` is a store-capability type property, **not** per-operation commit
evidence and not a wire value. Alternatives (prior records): (a) keep absent, recording every
conformance claim as "ten of twelve detail fields"; (b) a non-claiming literal — with
`durable:false` expressly impermissible as a false statement about a SQLite store; (c) defer to the
result-acceptance act, then emit true values (prior recommendation, with (a) as the interim recorded
position). Until a PA disposition exists, **no `durable:true` claim may be emitted or displayed**
(Gate 3 act §8.4, W-11, Gate 4 proposal D-10 measurement/claim split). No disposition is rendered here.

### 5.4 DR-4 — contribution schema: **PARTIALLY SATISFIED (IPD schema) / UNRESOLVED (CAP-03 consumer)**

- **Satisfied:** migration `004_portfolio_contribution_provenance` exists on IPD `main` under the
  effective IPD act `IIPS-V3-CAP02-U2-PROVENANCE-SCHEMA-ACT-2026-10-23-01`, adding nullable
  `file_name`, `source_broker`, `content_digest`, `lineage_digest`, `imported_at`,
  `contribution_semantics`; historical rows stay `NULL` (never back-filled with invented values); new
  broker imports must supply all six and are rejected without partial effect otherwise; the read
  projection `PortfolioContribution` returns them (nullable), alongside `contributionId`, `amount`,
  `contributedAt`, `createdAt`. The DR-4 *schema act* requested in §16.82 has therefore been rendered
  and executed in the IPD locus for the broker-import provenance purpose. **This pass registers that
  supersession; DR-4 must no longer be cited as "no columns exist".**
- **Unresolved for CAP-03:** the frozen `G2Contribution` requires *non-null* `sourceBroker`,
  `fileName`, `contentDigest`, `lineageDigest`, `importedAt` **plus** `holdingsCount` and
  `totalMarketValue`, which the IPD projection does not carry, and it has no place for IPD's
  `amount`/`semantics`/nullability. The IPD act (§4) expressly excludes this G2 mapping. The remaining
  CAP-03 question is narrow and must be decided, not coded around: either (a) authorize the consumer
  mapping including the nullable→required policy (refuse, omit contribution list, or scope-out) and
  the provenance of `holdingsCount`/`totalMarketValue`, or (b) declare the contribution projection
  out of Gate 5 read scope for the admitted operations. QE-6 (lineage identity after restart and
  after REPLACE/RESET) measures whichever scope is decided.

### 5.5 Contract-decision matrix

| ID | Question | Class* | Downstream consequence if left open |
|---|---|---|---|
| DR-2 | 7 missing fields + 3 renames; `isSaved` lifecycle; adapter mapping authorization | **4 — decision required** | Every CAP-03 read refuses; QE-1/3/4/5 read-backs cannot be consumed; Gate 5 cannot admit any read pair |
| DR-3 | `durability`/`durable` on `PortfolioDetail` before result acceptance | **4 — decision required** | No full v1-conformance claim; QE-4 evidence must carry the measurement/claim split; no `durable:true` anywhere |
| DR-4r | `G2Contribution` compatibility (nullability, `holdingsCount`/`totalMarketValue`, scope in/out) | **3→4 — IPD decision+implementation done; consumer decision required** | `portfolio.get` cannot be mapped honestly; QE-6 scope undefined |
| — | Save request/receipt, refusal/unknown mapping, revision, identity refusal, IPC boundary | **1 — settled** (§5.1) | — |
| — | CAP-02 U7 minimal-receipt rules on the CAP-03 G2 surface | **5 — not applicable** by U7's own §2 | Importing them would silently drop G2 fields |

*Classes: 1 settled by effective contract; 2 settled in implementation only; 3 decided, evidence
incomplete; 4 unresolved, new decision; 5 not applicable. No item in this matrix is class 2 — every
implemented behaviour above traces to contract v1, Gate E, or an effective act.

## 6. Phases E/F — Host qualification (U3/QE-1…QE-11) and result acceptance (U4)

### 6.1 The qualification model is fixed; there is no parallel model to invent

Qualification is Gate E §4 (QE-1…QE-11, blob `4a9501bf…`, re-verified unchanged), reproduced in the
prepared QE matrix (`b18a48a2…`) and executable only under an **effective** Gate 4 act. That act does
not exist: the rev. 4 proposal (`c02093e0…`) is `PROPOSED — NOT EFFECTIVE`, Act ID `PENDING
ASSIGNMENT`, and its §9 requires a PA determination (adopt + assign ID + resolve Q1–Q12 + confirm
pins). Its pins must be re-fixed in that determination: IPD `1cceacff…` is 33 commits stale with
material changes to every measured component (identity resolver, broker-import persistence, store,
binding, migration 004, dispatch); the IRR consumer pin `d355d904…` predates the current adapter.
Limb A (bounded `scripts/run-tests.mjs` TAP-summary parser remediation + mandatory
`tests/g4_run_tests_summary_parsing.test.ts`, currently absent) and H-12 adoption (partial candidate,
not adopted) are *inside* that future act, sequenced S0–S6 per the D-1…D-12 packet.

### 6.2 Evidence ladder — required vs current

| Evidence class | Required for qualification | Current evidence (honestly classified) |
|---|---|---|
| Source implementation | At the exact pinned commits named by the effective act | Exists on both `main`s (Gate 3 line + CAP-02 increments); **no act has designated these commits as the QE basis** |
| Unit / contract tests | Supporting only | Extensive, green (IRR this pass: typechecks 0; 98 files / 1,197 passed; build 0; fence+adapter suites 6 files / 129 passed. IPD at `2d9130e7…`: 875/874/0/1 per PR #60). **Not QE evidence** |
| Public-package consumer validation | For package surfaces consumed by IRR | Done for CAP-02 (`./portfolio-ui`, `./pit`, `./d114-non-production`); not a CAP-03 qualification input |
| Composed-host execution | Real IRR host ↔ real IPD endpoint over IPC | Refusal/isolation behaviour proven with real socket + real adapter against fixture bindings (§16.82 probe; `operationalBinding:false`, `qualified:false`). No admitted end-to-end read exists (DR-2) |
| Actual provider/store execution | The authorized operator store on the target host | **None.** No store, no binding, no endpoint has ever been provisioned |
| Target-host execution | `desktop-no0nhtp`, non-elevated, Node `>=22.13.0 <23`, `node:sqlite` probe, ACL/startup evidence | **None for Gate 4.** Host unreachable from any agent session; historical host Node `v24.14.0` is outside the required major and is not preflight evidence |
| Restart / durability (QE-4/5/6/7) | Stop both processes → restart → byte-equal read-back; idempotent re-import across restart; lineage equality; forced-termination recovery on disposable copies | Local fixture analogues only (disposable temp stores, Linux). A UI or unit pass is **not** persistence evidence |
| Provisioning / binding (QE-8, P-1) | V-A2-1…V-A2-8 receipt (§4.3), revocation incl. after restart, revocation-race rule | Mechanism proven fail-closed and unforgeable; **no ACTIVE binding exists to revoke** |

**QE status: 11 blocked / 11 not run / 0 executed / 0 pass** (IPD matrix `e76d4a3e…`, blocker
classes B1 no effective act, B2 stale pins, B3 no provisioning, B4 no host, B5 Limb A unreconciled,
B6 H-12 not adopted, B7 Gate C acceptance). Item classes under current safeguards: QE-1/QE-11
full-path-capable once unblocked; QE-2/3/5/6/7/9 component-level unless the PA adopts the proposal's
fence-preserving T1/T2/T3 mechanism (Q4); QE-4/QE-8/QE-10 structurally unreachable until their
prerequisites exist (a real commit, a provisioned binding, a real two-process endpoint). Component
evidence is never a PASS for a full-path criterion.

**Qualification authority:** the PA renders the act; the operator (Ramki) executes on
`desktop-no0nhtp`; agent sessions prepare records, publish raw evidence and read back remotes. No
host is qualified by this record, by CI, by simulated IPC, or by compile-only checks. The external
dependency is exact: a reachable designated host meeting D-A2-6, with an operator able to run P-1
provisioning and the QE sequence; its closure condition is the published preflight transcript.

### 6.3 Result acceptance (U4) — criteria and authority

Result acceptance is a **separate PA act after the run**, distinct from (a) Gate 3 implementation
acceptance, (b) Gate 4 authorization, and (c) any test pass. To be renderable it must name: the
effective Gate 4 Act ID; the run ID and immutable evidence packet (raw bytes + digests, before/after
manifests, host/run identity per the proposal's D-8 rules); the exact qualified IPD/IRR
commit/tree/blob manifest; a criterion-by-criterion disposition of QE-1…QE-11 including every
FAIL/INCONCLUSIVE/limitation finding and deviation; the QE-11 Gate C acceptance disposition; and the
durability boundary (what may now be *claimed*, per DR-3/D-10). Independent verification in this
single-operator program means a second read-back from the remote plus fresh-clone digest
reproduction, recorded as such. Acceptance must be withheld if any mandatory criterion is
FAIL/INCONCLUSIVE without an express PA waiver recorded in the act, if pins drifted, or if evidence
rests on a prohibited substitute (mocked IPC, fixture-as-operator-store, Linux/CI-as-host, direct-TAP
promoted to canonical pass, refusal relabelled as a write).

**Status: NOT RENDERED, and not renderable** — there is no run to accept. No acceptance is recorded
or implied by this record, by CAP-02's completion, or by any suite result.

## 7. Phase G — Gate 5 admission boundary (U5 / CV-52)

Gate 5 requires its **own explicit PA admission act**. It is not inferred from implementation,
CAP-02 completion, Gate 3 acceptance, a provisioning decision, host qualification alone, result
acceptance alone, or any G24 record — each of those inferences is prohibited by the records cited in
§2.4 (W-1, Gate 3 act §5.6, Q1-b §4, G3-D5).

The admission act, when its prerequisites exist, must contain at minimum:

1. the accepted Gate 4 result-acceptance act ID and run/evidence digests it relies on;
2. the exact qualified provider and consumer commits/trees (byte-identical to the qualified set);
3. the **named** `/api/user-portfolios*` route-method pairs admitted — and those that stay fenced;
4. the per-operation W-1 disposition (reads vs writes; for any write pair, how W-1(1)–(4) are met);
5. the DR-2/DR-3/DR-4r dispositions as implemented in the qualified commits;
6. durability-claim boundaries, exclusions (analytics stays reserved unless separately acted),
   rollback rule, and the implementation/publication/verification procedure.

Even after admission, what remains prohibited unless separately authorized: production use; any pair
not named; `durable:true` beyond the accepted receipts; authentication/session inference of an owner;
G24 lineage use; schema/migration drift from the qualified bytes.

**Status: NOT INITIATED. CAP-03 stays BLOCKED at this boundary until CAP03-P01…P10 close.** No
speculative admission is prepared as an effective text in this record.

## 8. Phase H — G24 disposition and the 503 fences

- **G24 remains REFERENCE ONLY** (G3-D5 `849be80a…`; D-1 §§2, 6–12). Historical line:
  IPD `0dab1221… → 8c99627… → d4fdb33… → 6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (tree
  `eb07ea36…`, as pinned in the frozen IRR contract header) with the HTTP implementation
  (`src/server/http-server.ts`, `src/app_identity/service.ts`, `src/portfolio/durable-store.ts`) on
  branch-only refs. **Re-verified this pass (IPD, read-only):** `6828155e…` (tip of
  `arena/01a0f308-…`, tag `iips-pin-g24-6828155e`), `c1b955b4…` (`arena/01a0e6d9-…`) and the Gate A′
  basis `2ded0e98…` are **not ancestors of IPD `main@bb4101b5…`**. No G24 commit, file or decision has
  been brought onto either `main`; no document on either `main` presents G24 as an admission
  candidate. Nothing was cherry-picked, rebased, ported or re-implemented in this pass, and no
  replacement HTTP provider route was introduced. IPD was not modified.
- **503 fences — verified in current code, not inherited:** `frontend/server/user-portfolio-transport.ts`
  blob `51704c12a467cd2f718a030b5036bc55c9afa73f` dispatches exactly six paths / twelve
  route-method pairs (`context` GET/HEAD; collection GET/HEAD/POST; item GET/HEAD/DELETE;
  `holdings` PUT; `revisions` GET/HEAD; `reset` POST), validates route/method (404/405 retained) and
  then calls only `respondOwnerContextUnavailable` (`frontend/server/owner-context-unavailable.ts`
  `cb8db45d668d28cee7e0a52721001d579a872733`) — no header, cookie, query or body is read and no port
  is constructed. Frozen contract `userPortfolioContract.ts` `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b`;
  reports fence `reports-transport.ts` `981470541812a64c733309f1debec75455d85bee` — all byte-identical
  to the §16.92 record. Executed this pass on the composed host: fence/adapter/transport suites
  (6 files, 129 tests) green, including all twelve pairs at `503` with an identical body and the
  broker-import host sharing the same server without fence leakage.
  The governing rule is unchanged: **only a Gate 5 admission act may lift named pairs** (Gate 3 act
  §5.6; Q1-b §4). No fence was lifted, no binding provisioned, no operational write enabled, and
  `IIPS_G3_IPC_BINDING_PROVISIONED` still defaults `false`.

## 9. What this pass resolved, and what it deliberately did not

**Resolved within effective authority (reconciliation, no new decision needed):**

1. DR-4's schema half is closed by the effective IPD migration-004 act; the stale "no columns /
   migration 004 not authorized" formulation (tracker §16.81/§16.82 era, PR #204) is withdrawn and
   replaced by the narrow residual DR-4r (§5.4).
2. The GOV-05 census is current: PR #114 is merged as bounded DB-C1 preview (not a G24 candidate);
   GOV-05 prerequisite 1 (landing on IPD `main`) stays satisfied; prerequisites 2–7 map exactly onto
   CAP03-P01…P11 with no duplicates.
3. The two post-§16.92 IPD records (successor proposal; QE status) are registered with exact blobs,
   so DR-1 is no longer "an unwritten act" but a *written, unrendered* one — the minimum decision is
   now a determination on an existing text (§4.4).
4. The Gate 4 staleness is quantified (33 IPD commits; IRR adapter drift), converting "re-pin
   sometime" into an explicit determination item (CAP03-P08) with the §14.5 no-silent-re-pin rule.
5. PR #204 is dispositioned (superseded, do-not-merge-as-is) instead of lingering as a competing locus.
6. CAP-02's effects are fenced off from CAP-03 with record-level citations (U7 §2, §1.7; U1 scope),
   eliminating the "CAP-02 done ⇒ CAP-03 unblocked" non sequitur.

**Deliberately not rendered (genuine authority boundaries — §10 gives the exact acts):** successor
provisioning selection and identity values; the provisioning entrypoint implementation authority;
DR-2/DR-3/DR-4r contract choices; Gate 4 effectiveness (Act ID, Q1–Q12, pins, H-12); host execution;
result acceptance; Gate 5 admission; any fence lift. Rendering any of these here would fabricate a
PA determination the governing records reserve, which F-3 and the CAP-03 directive both prohibit.

## 10. Phase I — Decision-and-dependency register (the actionable closure plan)

Minimum critical path: **P01+P02+P03 (one PA determination) → P04 (host execution) → P05–P07
(contract determinations, parallelizable with P01 drafting) → implementation at final pins → P08 →
P09 → P10 → P11 → P12.** P05–P07 preparation can proceed in parallel with P01–P03; nothing else can
be reordered (§3).

| Item ID | Prerequisite (exact) | Current evidence | Effective decision | Gap | Dependency | Owner / authority | Closure action | Acceptance evidence | Downstream impact | Authority status | Tracker disposition |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CAP03-P01 (=DR-1) | Successor Gate A′ basis selected for current IPD `main` | §16.82 DR-1; IPD successor proposal `9eb99fc6…` D-A2-1…8 (decision-ready); §4.1–4.2 probes | 2026-10-17 act effective for its own basis only; **no successor rendered** | No act names a current commit/tree/schema as the provisioning basis | — (entry point) | Ramki (PA, IPD security-contract capacity) | Render the successor act adopting/ amending the IPD proposal (§4.4) | Published act, remote read-back of its blob at the named IPD commit | Blocks P04, P09, P10, P11 | **Requires PA decision** | §16.93 records as the single DR-1 act; on rendering, new §16.xx effectiveness receipt |
| CAP03-P02 | Verbatim identity values: `principal_label`, `tenantId`, `canonicalOwnerId` | IPD proposal D-A2-1/D-A2-2 **[GAP]**; IRR F-3 pair exists but is another domain's identifiers (D-1/D-2) | None fixes IPD values | Values cannot be invented or copied silently | P01 (same determination) | Ramki (PA) | Name the three values in the P01 act (express reuse of the IRR pair is permissible only if stated) | Values printed in the rendered act; P04 receipt shows exactly those rows | Blocks P04 | **Requires PA decision** | Recorded here as a sub-item of P01, not a separate act |
| CAP03-P03 | Bounded implementation authority for one provisioning entrypoint + validator + tests | `provisioning.ts` brand-gated, zero importers; Gate 4 proposal §14.6 withholds it; IPD proposal D-A2-4 | None names the entrypoint manifest | Act without entrypoint cannot execute | P01 (same determination) | Ramki (PA); IPD implementation capacity | Grant the exact file/test manifest inside P01; implement; verify unreachability regression except the named entrypoint | IPD PR merged at the act's pins; full suite green; forged-authorization refusal tests pass | Blocks P04 | **Requires PA decision** (inseparable from P01) | IPD tracker registers implementation; IRR receipt in the P01 §16.xx |
| CAP03-P04 | Provisioning executed on the designated host | P-1 rule adopted (2026-10-17, to be re-adopted by P01); V-A2-1…8 prepared | Old act's single execution unspent but basis-bound | No store, binding, membership, endpoint or receipt exists; host unreachable to agents | P01–P03 | Operator (Ramki) on `desktop-no0nhtp` | Execute once under P-1; publish raw receipt (command, exit, pre-run absence proof, ledger dump, store sha256, V-A2-1…8) | Receipt + independent remote read-back; exactly 1/1/1 rows; `WRITE_NOT_AUTHORIZED` intact | Blocks P09 (QE-4/5/6/8 especially) | **Not authorized until P01–P03 render** | Execution receipt as its own dated §16.xx subsection |
| CAP03-P05 (=DR-2) | G2 read-contract closure (7 fields, 3 renames, `isSaved` rule, adapter mapping) | §5.2 source verification; probe refusals 3/1/3; U7 §2 preserves the question | None | Provider fields and/or consumer mapping not authorized; semantics unfixed | Independent of P01; must precede P08 pins | Ramki (PA); IPD+IRR implementation | Render the DR-2 act (alternatives §5.2); implement at exact manifests; conformance tests both sides | Merged pins; adapter maps without fabrication; refusal tests for absent/null cases | Blocks any admitted read; blocks P09 read QE items | **Requires PA decision** | DR-2 closed only by the rendered act's receipt |
| CAP03-P06 (=DR-3) | `durability`/`durable` disposition on `PortfolioDetail` | §5.3; fields absent and asserted absent; D-10 split prepared | None | No lawful value can be emitted today | Interim position independent; final value depends on P10 | Ramki (PA) | Render interim (a) explicitly or defer per (c) inside the P08/P10 acts | Act text; conformance claims worded accordingly; no `durable:true` before P10 | Blocks full-conformance claim only | **Requires PA decision** | Record interim position verbatim wherever conformance is claimed |
| CAP03-P07 (=DR-4r) | `G2Contribution` consumer compatibility / scope | §5.4; IPD schema+projection done (`6bad5a50…`, `4a005b73…`) | IPD schema act **effective**; no consumer decision | Nullability + `holdingsCount`/`totalMarketValue` + scope undecided | P05 (same act may cover) | Ramki (PA) | Decide mapping-or-scope-out (§5.4) in the DR-2 act or its own | Mapping tests incl. legacy-NULL rows; QE-6 scope fixed | Blocks `portfolio.get` admission; QE-6 undefined | **Requires PA decision** | DR-4 cited henceforth as "schema closed; DR-4r open" |
| CAP03-P08 | Gate 4 act rendered effective (Act ID, Q1–Q12, fresh pins, Limb A, H-12) | Proposal rev. 4 + D-1…D-12 packet (decision sheet Q1–Q12); staleness §2.3.4/§6.1 | **PROPOSED — NOT EFFECTIVE** | No executor may start; no final IPD/IRR QE pins exist | P01 (basis), P05–P07 implementation, Limb A merge | Ramki (PA) | Determination per proposal §9; then Limb A; then H-12 regeneration + express adoption before preflight | Effective act on IRR `main`; Limb A CI + native-Windows canonical run; adopted H-12 manifest digests | Blocks P09 | **Requires PA decision** | Effectiveness registered as an event (AUTHORIZED ≠ STARTED) |
| CAP03-P09 | QE-1…QE-11 executed on `desktop-no0nhtp` | QE matrix prepared; status 0/11 (§6.2) | Gate E §4 defines; no execution grant effective | Host, store, endpoint, run ID, raw evidence all absent | P04, P08 | Operator under the effective act; agent publishes/reads back | Execute in matrix order (Q11-before first, Q9 cold+warm, Q11-after last); retain every attempt | Raw-byte evidence packet bound to pins/host/run (§6.3 inputs) | Blocks P10 | **Not authorized until P08** | Run registered STARTED→(result) as events |
| CAP03-P10 (incl. P10a) | Separate Gate C acceptance (QE-11 subset) + separate Gate 4 result-acceptance act | Criteria §6.3; no record exists | None | Nothing to accept until P09; acceptance ≠ execution | P09 | Ramki (PA / acceptance authority) | Render acceptance act(s) criterion-by-criterion on the immutable packet | Acceptance act(s) naming Act ID, run, digests, qualified commits, deviations/waivers | Blocks P11; unlocks truthful durability language | **Requires PA decision after P09** | Acceptance ≠ admission recorded explicitly |
| CAP03-P11 (=CV-52) | Gate 5 admission act | Contents fixed §7; GOV-05 prerequisites 2–7 | None; **not initiated** | No qualified+accepted commit set exists to name | P10 | Ramki (PA) | Render admission naming commits and **named pairs only**, per-operation W-1 disposition | Admission act on `main`; only then implementation may begin | Blocks P12; every fence stays until then | **Requires separate PA decision** | Admission registered; `CV-52` moves only here |
| CAP03-P12 | Bounded fence-lift implementation for admitted pairs | Fence/adapter/boundary code exists behind the fence; §8 blobs | Gate 3 act §5.6 (lift only per P11) | Admitted-pair wiring not authorized | P11 | Implementer under P11 manifest | Implement exactly the admitted pairs; full tests; PR/CI/merge; remote blob read-back; tracker receipt | Post-merge `main` CI; per-pair live evidence; unadmitted pairs still `503` | CAP-03 capability live (named scope only) | **Not authorized until P11** | Final receipt; §18 rows 30/34 updated only on this evidence |

**Eliminated as non-blockers:** multi-user/auth infrastructure (out of scope by H-18/D-2); a G24
HTTP revival (prohibited, G3-D5); a CAP-02 dependency (expressly excluded by CAP-02's own acts);
"DR-4 columns missing" (superseded, P07 scope); PR #114's old `OPEN/CONFLICTING` census; PR #204 as
a required merge.

## 11. Verification executed in this pass (summary; rows `V439`–`V454` in tracker §16.93)

Live remote verification of both repositories, PR and CI state; provenance census at exact blobs;
source-level re-verification of the fences, the envelope gap, the binding precondition and the
current IPD dispatch/store/provisioning code (read-only clone); ancestry checks for the G24 and
Gate A′ basis commits; IRR `npm ci` (with the sandbox CA via `NODE_EXTRA_CA_CERTS`, TLS verification
not disabled, lockfiles untouched), both typechecks (0), the fence/adapter/transport suites
(6 files / 129 passed), the full suite (98 files / 1,197 passed / 0 failed) and the production build
(0). These are Linux implementation/fence checks — expressly **not** host qualification evidence.
Zero source, test, schema, route, fence, dependency or IPD change; zero `CV-*` register movements.

## 12. Final verdict

```text
CAP-03 investigation (this pass):  COMPLETE — dependency chain, decision boundaries and
                                   closure register established and published
Successor provisioning basis:      DECISION-READY, NOT SELECTED (IPD proposal; §4.4)
Identity / binding provisioning:   NOT EXECUTED; no store, no row, no path
Contract (DR-2 / DR-3 / DR-4r):    UNRESOLVED — exact questions in §5.5
                                   (DR-4 IPD schema: CLOSED by the IPD act)
Host qualification (Gate 4/U3):    NOT AUTHORIZED / NOT STARTED — 0/11 QE executed
Result acceptance (U4):            NOT RENDERED (nothing to accept)
Gate 5 admission (U5/CV-52):       NOT GRANTED / NOT INITIATED
Operational writes (U6/W-1):       NOT AUTHORIZED — WRITE_NOT_AUTHORIZED verified
G24:                               REFERENCE ONLY — off-main, ancestry verified
HTTP 503 fences (12 pairs):        INTACT — blobs byte-identical, re-executed live

VERDICT: BLOCKED — on CAP03-P01…P11 only, each with a named owner and closure evidence (§10).
```

*Prepared by Arena Agent Mode as an investigation, reconciliation and decision-preparation record.
No Program Authority decision, provisioning, qualification, acceptance, admission, fence lift,
durability claim or production eligibility is made or implied. G24 remains reference-only throughout.*
