# IIPS v3.0 — Governance Reconciliation (REG-02, REG-03, REG-05, REG-06) — Program Authority Decision Record

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-GOVERNANCE-RECONCILIATION-PA-DECISION-01` |
| Decision IDs | **`REG-02`** (`G1-B2` / `AD-02`), **`REG-03`** (`G2-2-AD-06`), **`REG-05`** (`NP-01-DISP`), **`REG-06`** (`NP-05`) |
| Decision | **`RECONCILED — bounded dispositions recorded`** (each item's exact disposition is in §2–§5) |
| Program Authority (PA) | **Ramki** — single owner, sole user, and Program Authority of the single-user personal-use IIPS platform |
| Date | 2026-10-13 (Asia/Calcutta) |
| Authoritative repository / branch | `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main` |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not modified by this record set** (`origin/main` at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`, verified 2026-10-13) |
| Verified IRR baseline at investigation | Commit `6c2c955a9a3ad0e6d896746beb5062980952ba37` (merge of PR #76, `origin/main` tip, verified 2026-10-13) |
| Task / publication branch | `arena/47b82a3f-iips-review-recovered` → Pull Request → `refs/heads/main` |
| Canonical tracker | [`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`](../../IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md) |
| Record type | Program Authority governance-reconciliation decision record. **Additive. Records dispositions and status clarifications only.** Grants no implementation, promotion, merge, activation, identity, persistence-replacement, or production authority. |
| Environment | Non-production. Production is out of scope. |

---

## 1. Purpose and Authority

This record disposes of the four remaining bounded governance items carried as `DECISION REQUIRED` in the canonical tracker — `REG-02`, `REG-03`, `REG-05` and `REG-06` — and issues the additive post-publication status clarification called for by the G2-2 follow-on table (H-2, H-3, H-14). It records each decision additively; all historical records named below are preserved byte-for-byte unchanged.

Ramki, as Program Authority, renders these dispositions under the standing authority established for this task. Each disposition is bounded exactly as stated. Nothing in this record reopens the completed work listed in the tracker's Completed-Work Protection List.

**Evidence classes distinguished in this record:** (a) *PA disposition* — the decision rendered here; (b) *qualification / acceptance evidence* — the separately published NP-07 records (REG-09); (c) *implementation authority* — **none granted by this record**; (d) *publication status* — §2.2; (e) *remote verification* — coordinates verified against `origin` refs on 2026-10-13; (f) *deferred / unadmitted scope* — §2.3, §3.4, §4.3, §5.4.

---

## 2. REG-02 — PIT / D114 Narrow Non-Production Admission: Preservation, Status Clarification, and P4 Disposition

### 2.1 PA disposition

1. **The already-published narrow non-production admission (`AD-02`) is preserved unchanged.** It admits non-production IRR consumption of IPD `./pit` and `./d114-non-production` at the exact package pin `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (`frontend/package.json:15`, verified 2026-10-13), for **exactly the five named files** (B2 record §1):
   - `frontend/server/pit/ipdPitReadAdapter.ts`
   - `frontend/server/pit/nonProductionPitStore.ts`
   - `frontend/server/pit/nonProductionRuntimePitStore.ts`
   - `frontend/server/pit/pitRuntimeIntegration.test.ts`
   - `frontend/server/pit/pitD114RuntimeIntegration.test.ts`
   All five verified present on `origin/main` at `6c2c955` (2026-10-13). Server-side locus only; non-production data only; admitted symbols exactly as recorded in G2-2 §2.

2. **`/api/pit/company/:companyId` and the live `/api/pit/` dispatch are RETAINED and remain NOT ADMITTED** (PA direction `P4`, preserved). The dispatch wiring (`frontend/server/executive-transport.ts:727–731`, dynamic import of `./pit-transport`) is retained in the repository state — not removed, disabled, reverted or modified. Runtime behaviour, route protection and end-to-end behaviour remain **UNPROVEN**. **Activation or admission of this route requires a separate, explicit Program Authority gate.** Route presence is not admission.

3. **No scope expansion.** `./persistence` is **not admitted** by `AD-02`; the admitted file list is not expanded; no production readiness is implied; no pin change, identity use or `D115` use is authorized.

### 2.2 Additive post-publication status clarification (errata note for G2-2 §8, H-2 / H-3 / H-14)

The two governing records are durably published on IRR `main` and verified there, but their internal status banners still read as pre-publication drafts. The historical wording is preserved verbatim in those files; **this section is the additive correction**. The banners are **stale as to publication and effectiveness status only**:

| Record | Blob on `origin/main` (verified 2026-10-13) | Publication act (verified) | Stale banner text (preserved in the file) | Corrected status |
|---|---|---|---|---|
| `docs/integration/IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md` | `2803c1c219a91230750cb18f2c52a7d4ace314db` | Commit `800789957f2a3cf4e28d5dfff49d92f29d6a7671` ("docs: publish IIPS G1 authority decisions", Ramaki, 2026-10-09), on `main` since that commit | Status row: "**PREPARED — NOT IN FORCE**" (H-3); §7: "IRR `main`: NOT PUBLISHED by the agent" (H-2); §6: "Scopes whose G1 basis is still session-only…" (H-14) | **PUBLISHED on `main`** (H-2/H-14 as scoped). The PIT/D114 admission (`AD-02`) is **IN FORCE** at its exact scope since the G2-2 record became effective (below). |
| `docs/integration/IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` | `2f89bbc94c0040e33a354893e99f8761636d526e` | Merge `eb05e25f19dfc5fda79fee4b89ba3c36b9b61464` (PR #51, 2026-10-10); post-merge reference checks published via PR #53 (merge `3064a90f181d37b50b08b333989926826ff28880`, `evidence/integration/g2-2-decision-gate/2026-10-10/g2_2_checks_output_post-merge.txt`) | Status row: "**CANDIDATE R2, REVISION 3 … NOT APPROVED FOR MERGE — NOT PUBLISHED — NOT AUTHORITATIVE**"; PR title: "DRAFT: not approved; do not merge" | **PUBLISHED on `main` and independently reference-checked.** Under the record's own §10/P5 effectiveness rule (merged to `refs/heads/main` + independently verified there), **`AD-01`, `AD-02`, `AD-03` and `AD-04` are effective** at their recorded scopes. `AD-06` was left OPEN by that record and is disposed by §3 below; `AD-20` remains OPEN. |

**Explicitly not done:** no historical record is edited, rewritten or retroactively re-dated; the PR #51 title/state conflict remains a recorded lineage fact (G2-2 §1A, Q2); no retrospective promotion is implied.

### 2.3 Unadmitted / deferred scope preserved (fail-closed)

- Live `/api/pit/` dispatch, `pit-transport.ts`, and `/api/pit/company/:companyId` — **NOT ADMITTED** (P4); retained; activation requires a separate explicit gate.
- `./persistence`, `0dab1221…`, `6828155…`, IPD `main` `4d3e1cd…` — not admitted as pin or surface for PIT/D114.
- Production data, network acquisition paths, identity/tenancy/`D115` use — excluded.

---

## 3. REG-03 — IPD Persistence Provenance (`AD-06`) and the Two-Lineage Hosting / Admission Boundary

### 3.1 PA disposition

**`AD-06` is reconciled and closed at the lineage and domain-role level.** The provenance of the IRR package pin `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` is established from repository evidence (§3.2) as a distinct NP-04 artifact/report persistence line — not as a variant of, or successor to, the G24 portfolio line `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`. The two lines are **two separate, evidence-backed persistence domain lineages** exactly as `D-1` Option C already recognized (`docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`, blob `0c4f27b365c47839ec66f4ec6b34ec1c0f72ad2a`, published by commit `80a4dc9`, 2026-10-06). **Both refs are preserved. No merge, cherry-pick, promotion, re-pin or replacement of either implementation is authorized or implied.**

### 3.2 Verified lineage facts (IPD, 2026-10-13)

| Fact | Evidence |
|---|---|
| Pin line (`./pit`, `./d114-non-production`, `./persistence` package exports) | `refs/heads/np04-governed-persistence-windows` @ `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (verified branch tip). Commits: `246cb94` → `3137426` ("NP-04 governed persistence implementation", Ramaki, 2026-10-02) with `d61ff9c` ("NP-04: common governed persistence capability", Ramaki, 2026-10-02) merged at `bd5229d`, exposed at `2e11fa3` ("Expose NP-04 persistence package"). `d61ff9c`'s parent is IPD `main` tip `4d3e1cdca3a33da0ec3be8b336b17128108a502c`. |
| G24 portfolio line | `refs/heads/arena/01a0e6d9-iips-production-market-data` and `refs/heads/arena/01a0f308-iips-production-market-data` @ `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (both verified tips). Commits: `0dab122` (merge of PR #6, IU-6 D114 PIT population) → `8c99627` ("NP04-G24: non-production durable persistence implementation") → `d4fdb33` (migration 002) → `6828155` ("NP04-G32: canonical NP04 governance authority record"). |
| Ancestry (verified) | IPD `main` tip `4d3e1cd` **is an ancestor of both** `2e11fa3b` and `6828155e`; neither of `2e11fa3b` / `6828155e` is an ancestor of the other; neither is contained in IPD `main`; their merge-base is `246cb944e174dee09b7c08ffa93bfa672dca059c`. |
| Distinct `src/persistence` implementations (verified) | Pin: `{db,errors,identity,index,package,reportKey,schema,store}.ts` — `GovernedArtifactStore` / reportKey, `node:sqlite`, WAL (D-1 §3). G24: `{bootstrap,config,connection,errors,index,migrations/*}.ts` — `better-sqlite3`, rollback journal, migration runner (D-1 §2). `git diff` of `src/persistence` between the refs: 17 files changed, +1,105/−1,081 (lineages diff at 50 files +1,842/−8,184 per D-1 §4). |

### 3.3 Hosting and admission boundary (adopted from D-1, unchanged)

| Domain | Hosted lineage | Standing |
|---|---|---|
| **Portfolio / tenancy (G24)** | `6828155e…` (G24 line) | Non-production G-2 consumption **reference only** (`AD-03`). Not the package pin; not admitted to IPD `main`; dispatch (`/api/user-portfolios/`) not admitted (`P3`); fenced at HTTP `503 owner-context-unavailable`. |
| **Artifact / report (GovernedArtifactStore)** | `2e11fa3b…` (pin line) | The IRR package pin. `./persistence` consumed only by the fenced Governed Reports seam (`AD-01` presence-only; runtime fenced at HTTP `503 owner-context-unavailable`). `./pit` + `./d114-non-production` admitted only at `AD-02`'s exact scope. |
| **IPD `main`** | — | **Neither lineage is admitted to IPD `main`.** Promotion-authority act `2606185923f6cbd3f4df5c3af200f54d40ed4bbc` (on `arena/01a0f839`, verified) prohibits baseline/main promotion of the NP04 lineage and permits only a fast-forward of the Phase-A unit into `arena/01a0e6d9` (which already points at `6828155e`); its coverage of IRR PR #42 remains **NOT ESTABLISHED** (`Q2` / `AD-20`, unchanged). |

### 3.4 Preserved unresolved items (NOT closed by this decision)

1. **The `src/persistence` implementation conflict is NOT reconciled.** The two implementations remain distinct, non-interchangeable and unmerged (`D-1` §1). Convergence (if ever) is owned by `REG-11` / `REG-12` (`AD-20` remains **OPEN**).
2. **The IU-6 repin rationale is unrecorded.** The reason IRR's dependency moved `0dab1221…` → `2e11fa3b…` is not recorded in any authority act (B2 §5 item 2, UNPROVEN). Recorded here as an unexplained historical fact; **no rationale is invented**.
3. **No package/API, identity or security-boundary reconciliation** between the domains (D-1 §7–§9, preserved).

---

## 4. REG-05 — Phase 14.1 Workflow Product Disposition (`NP-01-DISP`)

### 4.1 PA disposition

**Workflow is recorded as `HISTORICAL-ONLY` for the current product baseline.** `NP-01` product convergence is **not commissioned** and is not part of the current single-user no-auth baseline (`H-18`).

### 4.2 Basis (verified 2026-10-13)

1. **Historical recognition preserved.** `REG-04` (`CLOSED`) recognizes commit `52315b29`, archived in `v3.0-phase14.1-certified-snapshot.tar.gz` at `refs/heads/phase14.1-recovery-deposit@c115d1f49454a171c24ec61bab5e28f0ceea1df5` (remote tip verified intact, 2026-10-13), as a historical milestone — `HISTORICAL / NON-CONVERGED — NOT ON MAIN`. That recognition is not reopened.
2. **No compatible no-auth design gate exists.** The retrospective (`docs/integration/PHASE14.1-RETROSPECTIVE-HISTORICAL-RECOGNITION.md`, §M–§P) admits no current convergence; its §O future-gate boundary requires separate explicit authority for any current-main path. The archived snapshot depends on deleted OIDC/Keycloak modules (`secured-executor.ts`, `keycloakAdapter.ts`, `admin-transport.ts` — all verified absent from current `main`); the global no-auth transition (commit `1f7997e5e325d94124f39f7458e27957197cbfb2`, PR #61 merge `139c5b8d`) grants no Workflow commission. **No evidence of a separately approved, compatible no-auth/F-3 Workflow design gate exists in either repository.**
3. **Current state unchanged.** No `/workflows` route is mounted (`frontend/src/app/App.tsx`, `routes.ts`, `navigation.ts` — verified). `iips-platform/src/distributed/WorkflowRuntime.ts` remains an unadmitted, unchanged platform library file (deterministic composition layer, no authentication dependency) — presence is not admission.

### 4.3 Boundary

- The OIDC/Keycloak-dependent workflow snapshot is **not restored** as-is; no workflow code is recreated, merged or cherry-picked.
- No certificates are modified; historical recognition (REG-04) is not reopened or restated as current status.
- Any future Workflow product work (including a re-architecture for the no-auth/F-3 owner-context + `D-1` persistence baseline) requires its own **explicit design gate** — **deferred, not commissioned**.

---

## 5. REG-06 — Operator Drop Capability Disposition (`NP-05`)

### 5.1 PA disposition

**`OperatorDropParser` remains an internal IPD library primitive. Product admission is `DEFERRED`.**

### 5.2 Verified facts (IPD `main@4d3e1cd`, 2026-10-13)

| Item | Evidence |
|---|---|
| Implementation | `src/operator_drop/parser.ts` (blob `c9950cd08f9cf9acc0b7e6a44789e76c57b1c971`), `src/operator_drop/index.ts` (blob `e263a8553a23be0fb27e7f4de3d83660b56e9c98`) — offline bootstrap / fallback ingestion (P16-08 / AD-17), `LOCAL_FIXTURE_AND_OFFLINE_DEV` mode |
| Tests | `tests/wsb_operator_drop.test.ts` (blob `1ef0fd7f4e0fa1beb32550e2182725412136433a`), `tests/non_production_operator_identity_bypass.test.ts` (blob `9571b8f0ad53845ce284efdd7b83550e45623d5a`) |
| Consumption | In-package internal use only: `src/oq/synthetic_failover.ts` (`handleOperatorDropFallback`) and `src/oq/oq_suite_runner.ts:294` (IPD OQ failover/quality harness); `src/index.ts:18` re-exports the module barrel. **0 product/runtime ingestion callers; 0 IRR consumers.** |
| Packaging | IPD `main` `package.json` has **no `exports` and no `main` field** — no package subpath exports exist. |
| Data/identity | No PIT SQLite store writes; unqualified `symbol` / `isin` (`RawMarketRecord`) — no series-qualified ISIN bindings, no company/security-identifier mappings. |

*Note on the tracker's earlier "0 runtime callers" shorthand:* precise consumption is as stated above — internal OQ failover-harness references exist inside IPD; there are zero product-side runtime callers and zero IRR consumers.

### 5.3 Product admission: DEFERRED

The existing authoritative evidence does **not** establish an approved manual-ingestion requirement for the IRR product baseline. The `GOV-REC-2026-NON-PROD-OPERATOR-BYPASS-01` record (`evidence/operator_drop/NON_PRODUCTION_SINGLE_OPERATOR_IDENTITY_BYPASS.md`, effective 2026-09-22) authorizes only an IPD **non-production single-operator identity bypass** for offline visual acceptance; the D114 stage-5 act leaves `AD-17 / M-2` resolution **NOT AUTHORIZED**. Product admission is therefore **deferred, fail-closed**.

### 5.4 Not granted

No runtime callers; no package exports; no PIT writes; no company/security-identifier mappings; **no IPD implementation code changes of any kind**. Promotion to a product capability would additionally require PIT store write integration, series-qualified ISIN resolution and package export — none of which is authorized here.

---

## 6. What This Record Does Not Do

- No application code changed (this record set is documentation only).
- No IPD ref, branch, tag or file changed; no pin change; no promotion.
- No route activated; no identity mapping introduced; no persistence authority changed.
- No legacy authentication-dependent code restored.
- No completion is claimed beyond the dispositions recorded here: `REG-02` remains open only for the explicitly deferred P4 route gate; `REG-03` leaves `AD-20` and persistence convergence open; `REG-05` leaves any future Workflow gate uncommissioned; `REG-06` leaves product admission deferred.

## 7. Evidence Index (coordinates verified 2026-10-13)

| Coordinate | Value |
|---|---|
| IRR `origin/main` at investigation | `6c2c955a9a3ad0e6d896746beb5062980952ba37` |
| IPD `origin/main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` |
| B2 admission record | blob `2803c1c219a91230750cb18f2c52a7d4ace314db`, published by `800789957f2a3cf4e28d5dfff49d92f29d6a7671` |
| G2-2 convergence record | blob `2f89bbc94c0040e33a354893e99f8761636d526e`, published by merge `eb05e25f19dfc5fda79fee4b89ba3c36b9b61464` (PR #51); post-merge checks PR #53 (`3064a90f181d37b50b08b333989926826ff28880`) |
| D-1 | blob `0c4f27b365c47839ec66f4ec6b34ec1c0f72ad2a`, commit `80a4dc9`, 2026-10-06 |
| IPD pin | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (`np04-governed-persistence-windows`, tip verified) |
| IPD G24 reference | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (`arena/01a0e6d9`, `arena/01a0f308`, tips verified) |
| Merge-base (pin ↔ G24) | `246cb944e174dee09b7c08ffa93bfa672dca059c` |
| Promotion-authority act | `2606185923f6cbd3f4df5c3af200f54d40ed4bbc` on `arena/01a0f839-iips-production-market-data` |
| Phase 14.1 deposit | `refs/heads/phase14.1-recovery-deposit@c115d1f49454a171c24ec61bab5e28f0ceea1df5` (tip verified) |
| Operator Drop blobs | `c9950cd0…` (parser), `e263a855…` (index), `1ef0fd7f…` (wsb test), `9571b8f0…` (identity-bypass test) |

---

*Recording agent: Arena Agent Mode — evidence investigation, preparation and verification only; no authority is rendered by the agent. Program Authority: Ramki. Dispositions recorded 2026-10-13 (Asia/Calcutta).*
