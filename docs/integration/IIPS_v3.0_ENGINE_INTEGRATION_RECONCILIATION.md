# IIPS v3.0 Engine Integration — Control Reconciliation (E2E-025→029 Scope)

**Date:** 2026-09-04  
**Authority:** IIPS v3.0 Engine Integration — Follow-up Reconciliation Pass (§1–8)  
**Branch under review:** `arena/01a06c00-iips-review-recovered`  
**Status at entry:** work under control review — **HOLD** (no merge, no certification claim, no governance amendment, no new engine creation — per §1)

> This report is a **control/reconciliation** artifact. It does not restart implementation, does not amend E2E-013, does not claim certification, does not create Materials/Telecom/Auto engines, and does not modify frozen manifests/certificates/regression expectations. Its purpose is to establish whether the existing 10-engine integration work can be accepted as the intended scope, retained as infrastructure, or must remain pending.

---

## 1. Branch / Commit State — Reconciled (No Mutation to Resolve Reporting)

| Attribute | Value | Evidence |
|-----------|-------|----------|
| **Pre-integration discovery HEAD** | `c65d53373717aacc3a1dce12d47b5aeaf50541a5` — `Import recovered IIPS workspace` | `git rev-parse c65d533^{commit}`; `docs/integration/...DISCOVERY.md: branch/HEAD` |
| **Implementation commit(s)** | **Exactly one** `bbbca164f227f12800b9cc51ac383d25b9e31def` — `IIPS v3.0 Engine Integration — E2E-025→029 parallel track (discovery + gap matrix + API/UI/evidence/replay/CSIP)` | `git log c65d533..HEAD --oneline` (1 line) |
| **Current HEAD** | `bbbca16` (`bbbca164f227f12800b9cc51ac383d25b9e31def`) | `git rev-parse HEAD` |
| **Exact branch** | `arena/01a06c00-iips-review-recovered` (current `*`; tracks `origin/arena/01a06c00…`) | `git branch -vv` |
| **Pushed?** | **Yes — up to date** with `origin/arena/01a06c00-iips-review-recovered` (`ls-remote` shows `bbbca16` at that ref) | `git ls-remote origin arena/01a06c00…` + `git remote show origin` |
| **Exact files changed/added (vs c65d533)** | **18 artifacts, 2429 insertions, 0 deletions of governed content** — `git diff --name-status c65d533..HEAD` lists: `A docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_DISCOVERY.md`, `A …_EVIDENCE.md`, `A …_GAP_MATRIX.md`, `A …_REPORT.md`, `A frontend/server/engine-transport.test.ts`, `M frontend/server/executive-transport.ts (47 lines additive)`, `A frontend/src/api/engines.ts`, `M frontend/src/app/App.tsx (+2)`, `M frontend/src/app/navigation.ts (+1)`, `A frontend/src/features/engines/EngineRegistry.test.tsx`, `A …/EngineRegistry.tsx`, `A iips-platform/src/integration/EngineApiAdapter.ts`, `A …/EngineRegistry.ts`, `A …/index.ts`, `A iips-platform/tests/integration/csip-product-e2e.test.ts`, `A …/engine-api-integration.test.ts`, `A …/evidence-provenance-integration.test.ts`, `A …/replay-e2e.test.ts` | `git diff --stat c65d533..HEAD` + `git show --stat HEAD` |
| **Changes after discovery HEAD?** | **Yes — the single integration slice above.** Discovery was Phase 0 (read-only — 0 files changed). Gap matrix + implementation were *intentionally* after discovery per §16. No untracked/uncommitted changes remain at report time (`git status: nothing to commit, working tree clean`) — the apparent "HEAD discrepancy" between Discovery's stated `c65d533` and current `bbbca16` is the **expected single-commit advancement**, not a reporting error. | `git status` (clean) + commit history (1) |
| **Post-`bbbca16` mutations?** | **None.** No files were modified after `bbbca16` before this reconciliation pass; this reconciliation report itself is held **uncommitted/unpushed** until authority disposition (per HOLD). | `git status` pre-report was clean; this file is the first post-`bbbca16` artifact and is **not pushed** |

---

## 2. Engine Identity Reconciliation — Materials / IES-020, Telecom / IES-016, Auto / IES-017

### 2.1 Exhaustive repository evidence (Arena/Linux mount — no G:\IIPS access attempted)

Executed before any inference:

- `grep -R "IES-020\|IES-016\|IES-017"` across all `*.md|*.json|*.ts` → **20 hits, all in** `README.md` (3), `ROADMAP.md` (3), `docs/integration/*` (our own authority-block notes, 11), `ies-015-technology/IES-015_COMPATIBILITY.md:46 Reusable format for all future sector standards (IES-016+)`, `iips-platform/src/integration/*` (2), `program-v1.1-certification/PROGRAM_v1.1_FINAL_CERTIFICATION_GATE0_SCOPE.md:20 Strategic decision: do not open IES-016 now`.
- `grep -R -i "sector\.materials\|sector\.telecom\|sector\.auto\|materials.*engine"` → **only** `README/ROADMAP` planned listings + our own `DENIED` test helpers — **0 engine modules**.
- `ls -ld ies-*` → **only** `ies-010-hospitality`, `ies-011-energy`, `ies-012-utilities`, `ies-013-consumer`, `ies-014-industrials`, `ies-015-technology` — **no** `ies-016-*`, `ies-017-*`, `ies-020-*`.
- `ls iips-platform/src/sector-engines/` → `banking, capital-markets, consumer, cross-sector, energy, healthcare, hospitality, industrials, insurance, technology, utilities` — **no** `materials`, `telecom`, `auto`.
- `git ls-files | grep ies-0` → **only** `ies-010` through `ies-015` assets + `program-v1.1` LTS docs — **no** `ies-016/017/020` file ever tracked.
- `cat ies-*/IES-*_FREEZE_MANIFEST.json | grep -o "IES-0[0-9][0-9]" | sort -u` → **`IES-005, IES-010, IES-011, IES-012, IES-013, IES-014, IES-015`** — **no** `IES-016/017/020` freeze manifest exists.
- `grep -n "IES-0" program-v1.1-certification/PROGRAM_v1.1_LTS_BASELINE.md` → **only** `IES-005, IES-005.x, CSIP` + `ies-006..015` in tag list — **no** `IES-016/017/020`.
- `grep -i "material\|telecom\|auto" program-v1.1-certification/*` → **0 hits**.
- `git log --all --grep="material\|telecom\|IES-0"` → **only** our `bbbca16` commit mentions them (as authority block).
- `ROADMAP.md` content (the single authoritative planned list):
  - § “Completed — IES-005, IES-006” → ✅
  - § “In Progress — IES-007” → ✅ (actually frozen)
  - § “Planned — IES-008…020” includes `IES-016 Telecommunications` (planned), `IES-017 Automobile` (planned), `IES-020 Materials & Metals` (planned) — **no completion mark**.
  - Immediately followed by § `GATE0_SCOPE.md:20 Strategic decision: do not open IES-016 now. The program has reached an architectural inflection point… No v2.0 engineering is authorized before this certification is complete.`

### 2.2 Determination per engine — no inference, evidence-anchored

For each of Materials/IES-020, Telecom/IES-016, Auto/IES-017, of the six possibilities only one is satisfied by the mounted repository, with a second as the necessary **authority-level** explanation for why the original authority named them certified:

| # | Possibility | Materials / IES-020 | Telecom / IES-016 | Auto / IES-017 |
|---|-------------|---------------------|-------------------|----------------|
| 1 | Genuinely absent from authoritative repo available to Arena | **YES — proven** (no directory, no engineId, no freeze manifest, no calibration/golden/replay, no tag, no ls-files, no grep) | **YES — proven** (same — plus explicit `GATE0_SCOPE: do not open IES-016`) | **YES — proven** (same) |
| 2 | Exists under another canonical identity/location | **NO** — checked all engineIds (`sector.*`); no alias maps `materials`→another sector. Industrials `IES-014` was *actually* implemented even though ROADMAP planned it as Chemicals/Industrials swap, but Materials `IES-020` is a distinct sector family from Industrials — not an alias. | **NO** — no `sector.telecom` alias to another implemented sector. | **NO** — no `sector.auto` alias; Consumer `IES-013` and Industrials `IES-014` are distinct families. |
| 3 | Exists only in Windows `G:\IIPS` | **Not proven, but not disproven by Arena evidence.** The prompt explicitly warns `Arena/Linux cannot access the Windows G:\IIPS checkout`. Our exhaustive mounted-repo proof is consistent with this — the evidence *could* exist only there, but Arena cannot assert it without access. Treated as **unverifiable environment possibility, not a repository finding.** | Same — unverifiable | Same — unverifiable |
| 4 | Certification evidence exists elsewhere but not mounted | **Not evidenced.** `program-v1.1-certification/` (the authoritative certification mount in this recovery) contains **no** `IES-020/016/017` evidence; `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md: 10/10 sector engines released (ies-006..015) + csip-v1.0.0 + ies-006..015 tags` — **excludes** 016/017/020. If such evidence exists, it is not in the mounted recovery baseline (`c65d533` = `Import recovered IIPS workspace`). | Same | Same |
| 5 | Prior program baseline has different authoritative interpretation | **Partially — contributes to the authority mismatch.** `ROADMAP.md` (version 1.0, still in repo root) **planned** `IES-020/016/017` as future standards — this is the *only* place they appear as planned. The **actual frozen baseline** (`Program v1.1 LTS` + `ies-010..015` + `iips-platform` engines) **replaces** that plan with 10 completed engines `IES-006..015` and an explicit **gate decision not to open IES-016**. Original authority's "completed/certified IES-020/016/017" is therefore a **pre-baseline or branch interpretation** that conflicts with the LTS baseline available to Arena. | Same | Same |
| 6 | Actual authority/repository reconciliation issue | **YES — this is the actionable finding.** The original integration authority supplied to Arena (Materials/Telecom/Auto as completed/certified) **cannot be reconciled** with the authoritative repository actually mounted to Arena (`Program v1.1 LTS` recovery). This is a **control reconciliation** matter, not a technical missing-file oversight. | **YES** | **YES** |

**Summary finding (no inference):** In the **authoritative repository available to Arena** (the `c65d533` recovered `program-v1.1.0` LTS baseline), **Materials IES-020, Telecom IES-016, and Auto IES-017 are genuinely absent as certified engines** (1 = proven). They are **not** present under another identity (2 = no) and **no certification evidence for them is mounted** (4 = not evidenced). Whether they exist only in `G:\IIPS` (3) is **unverifiable from Arena** — the prompt's explicit boundary states `Arena/Linux cannot access G:\IIPS`. The meaningful actionable truth is **(6) an actual authority/repository reconciliation issue**, explained in part by **(5) a prior baseline interpretation mismatch**: `ROADMAP.md` (v1.0 planned list) vs the `PROGRAM_v1.1 LTS` gate decision (`do not open IES-016`). **Resolution therefore requires an authority/access decision, not a coding inference.**

---

## 3. Taxonomy Confirmation — IT / Chemicals / Realty (Held — Not Reopened)

Each mapping was **correctly preserved** by the prior integration and remains **frozen**.

| Category | Authoritative mapping (credentials) | Separate engine created? | Evidence | Disposition |
|----------|--------------------------------------|--------------------------|----------|-------------|
| **IT** | **IES-015 Technology** — IT is not a separate engine | **NO** — guard `TAXONOMY_RESOLVED.IT = 'IES-015 Technology (sector.technology)'` + `assertNotTaxonomyResolved` throws `422` | `iips-platform/src/integration/EngineRegistry.ts:42–49`; `ls iips-platform/src/sector-engines/` (no `it`); integration tests: `sector.it` not in registry | **HELD — correctly resolved, no reopen** |
| **Chemicals** | **IES-014 Industrials** — no separate Chemicals engine/work package | **NO** — guard `Chemicals = 'IES-014 Industrials (sector.industrials)'`; IES-014 docs state Industrials covers chemical-processing industry model | `EngineRegistry.ts` same; `ies-014-industrials/IES-014_FREEZE_MANIFEST.json` (calibration `industrials-…`); `IndustrialsEngine` verified | **HELD** |
| **Realty** | **IES-015 Technology** — no separate Realty engine/work package (per this track's controlling directive) | **NO** — guard `Realty / Real Estate = 'IES-015 Technology (sector.technology) — prompt-resolved'` | `EngineRegistry.ts` same; cross-sector docs list `Real Estate` as future (not yet implemented) — track **did not** create a realty engine, honoring the supplied mapping | **HELD** |

No taxonomy, scoring-methodology, capability, or engine-identity change was performed. `git diff c65d533..bbbca16 -- iips-platform/src/sector-engines/` (excluding `src/integration/`) shows **0 files changed**.

---

## 4. Existing 10-Engine Work Disposition — Classification per §4

> Do not conflate `10 existing LTS engines successfully integrated` with `Materials+Telecom+Auto integration completed`. These are kept separate: technical work vs scope acceptance vs certification.

| Workstream / Artifact | What was built (on the 10 LTS engines `IES-006..015`) | Classification (§4) | Why |
|-----------------------|---------------------------------------------------------|---------------------|-----|
| **E2E-025 — Completed-engine API Integration** (`EngineRegistry` + `EngineApiAdapter` + `GET /api/engines` + `POST /api/engines/:id/execute`, 14 platform + 6 HTTP tests) | Additive, versioned (`1.0`), governed-dispatch integration layer exercised for all 10 certified engines (oracle-matched `verdict/composite`, `SNAP_/ev_`, `ies/calibration/deterministic` provenance, `422/404/400` taxonomy guard) | **Parallel integration work that can remain but cannot be accepted as completion of the originally intended Materials/Telecom/Auto scope** — **also** usefully **prerequisite/infrastructure** for any future `IES-016/017/020` | The adapter is **sector-agnostic and zero-CSIP-change** (`iips-cross-sector/CSIP_COMPATIBILITY.md: no CSIP logic change` for new sectors): adding `IES-016/017/020` later would reuse this exact layer via one new `ENGINE_FACTORY` entry + freeze manifest. Technically correct and directly within the *mechanism* of authorized E2E-025, but **scope-acceptance requires the three named engines** — not evidenced (§2). It is **not** invalid/out-of-scope requiring rollback — `git diff` proves no methodology/freeze-manifest/retro expectation edit, and all 10 oracles match. |
| **E2E-026 — Completed-engine UI Integration** (`EngineRegistry` workspace `/research/engines`, `api/engines.ts`, `/research/engines` route, 4 UI tests) | UI consumes `GET /api/engines` (governed `engineId/ies/sectorFamily/engineVersion/calibration/capabilities`, `FRESHNESS=FROZEN`, `deterministic`), plus the existing 10 already-proven `Company/ Evidence/ Replay/ Cross-Sector` surfaces remain | Same — **parallel infrastructure, retain** (no scope acceptance for Materials/Telecom/Auto) | UI is presentation-only, 1:1 mapping, `pillars-unavailable` never fabricated. It proves `UI→API→Engine→UI` is production-ready for *any* certified engine, including the three when reconciled — but it has not displayed a `sector.materials` result because no such engine exists in Arena (§2). No rollback needed. |
| **E2E-027 — Evidence / Provenance Integration** (4 tests — `EvidencePipeline` attributable+frozen, `Snapshot↔evidence` traceability, 10-engine provenance chain, R2/R3 preserved) | Chain `Engine output → provenance{engineVersion/methodologyVersion/calibrationVersion/snapshotId} → API provenance → Evidence record → UI` exercised for all 10 | Same — **retain as prerequisite infrastructure; scope acceptance blocked** | Provenance schema was **not** changed to fabricate `IES-020/016/017` fields (§2 of original prompt honored: deficiency would be authority/design dependency, not a silent patch). LTS deviations `R2 engineVersions stale + R3 calibration-only-Technology` were preserved, not patched. |
| **E2E-028 — Replay / Provenance E2E** (4 tests — 10-engine byte-identical, `ReplayService reproduced/byteIdentical/evidenceRefs`, `DistributedRuntime node-a==node-b`) | Chain `original→capture→replay input/context→replay→comparable→evidence` exercised for all 10 via governed `ReplayService` | Same — **retain; scope acceptance blocked** | Explicit boundary `differenceAvailable:false` (no invented metric diff) honored; certification explicitly not claimed (see §6 E2E-030). |
| **E2E-029 — CSIP Product / E2E Integration** (3 tests — `10×EngineOutput→CrossSectorEngine.run(Balanced)` determinism, taxonomy guard, provenance `SNAPSHOT`) | Pipeline `sector engine result → CSIP aggregation → API → product/UI → evidence/provenance → audit` exercised for all 10 | Same — **retain; scope acceptance blocked** | No CSIP methodology/taxonomy/duplicate-engine change (`CrossSectorEngine` consumed, not reimplemented). CSIP's sector-neutrality guarantee means the three future sectors would reuse this unchanged layer. |
| **Overall 10-engine integration slice** (18 files, 251 frontend tests total 151/151 + 25 new platform integration) | All additive, all verified, no governed record amended | **Retain as useful prerequisite/infrastructure; do not rollback; do not accept as Materials/Telecom/Auto completion** | Technical work is sound, control-plane compliant, and parallel-safe. The **only** barrier to scope acceptance is the §2 authority/repository reconciliation for the three named engines. |

**None of the five is classified as `invalid/out-of-scope work requiring rollback` or `blocked pending authority reconciliation` (the implementation itself is not blocked).** The **scope acceptance** for `Materials/Telecom/Auto` is **blocked pending authority reconciliation** (§6), but the **retention** of the built infrastructure is **permitted**.

---

## 5. Control Reconciliation Matrix (§6)

| Engine / Workstream | Prior authoritative expectation (supplied to Arena) | Arena repository evidence (mounted `c65d533` LTS) | Environment evidence | Current implementation | Control disposition | Required next authority / action |
|---------------------|------------------------------------------------------|---------------------------------------------------|----------------------|------------------------|---------------------|----------------------------------|
| **Materials / IES-020** | Completed / Certified (`E2E-019`, `IES-020`) | **Absent.** `ls ies-*` has no `ies-020-*`; `ls iips-platform/src/sector-engines/` has no `materials`; `grep IES-020` only in `ROADMAP.md` (Planned) + gate decision text; `PROGRAM_v1.1_FINAL_CERTIFICATION_GATE0_SCOPE.md:20 do not open IES-016 now … No v2.0 engineering`; `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md: 10/10 ies-006..015 tags verified`; `*_FREEZE_MANIFEST.json` set has no `IES-020`. | `G:\IIPS` not mounted — **unverifiable** (prompt §3). No `G:\IIPS`-only artifact was inferred. | **No engine created.** `EngineRegistry.ts` has no `sector.materials`; `EngineApiAdapter.execute('sector.materials')` → `DENIED uncertified-capability` (`404`) — tested `engine-api-integration.test.ts:118` + `engine-transport.test.ts:404`. | **Authority block — HOLD.** Do not create by assumption; treat current branch as work under control review. | **Authority to supply one of:** (a) the missing `IES-020` freeze manifest + calibration + golden/replay/expected + `IES020_FINAL_READINESS_CERTIFICATE.md` + tag to mount in Arena; **or** (b) a written authority record that Materials scope is **deferred / out of scope / taxonomy-resolved** (then the existing 10-engine work disposition changes to “directly within authorized scope”); **or** (c) mount/access to the Windows `G:\IIPS` checkout where the evidence is claimed to reside (with integrity hash) — see §7 F. |
| **Telecom / IES-016** | Completed / Certified (`E2E-023`, `IES-016`) | **Absent — and explicitly gated.** Same exhaustive negatives as above; plus **explicit gate decision**: `GATE0_SCOPE.md:20 Strategic decision: do not open IES-016 now. The program has reached an architectural inflection point…` — directly contradicts the supplied “completed IES-016”. | Unverifiable (`G:\IIPS`) | No `sector.telecom` engine; `EngineApiAdapter` denies `sector.telecom` as uncertified (`404`). | **Authority block — HOLD** | Same three options as Materials. The explicit gate text makes option (b) (formal deferral record) as plausible as (a). |
| **Auto / IES-017** | Completed / Certified (`E2E-024`, `IES-017`) | **Absent.** Same exhaustive negatives; `ROADMAP.md: IES-017 Automobile — Planned` (not marked Completed). | Unverifiable | No `sector.auto`; denied as `404`. | **Authority block — HOLD** | Same three options. |
| **IT / IES-015** | Resolved into **IES-015 Technology** — NOT separate engine | **Confirmed resolved.** `ies-015-technology/` exists and is certified (`IES015_FINAL_READINESS_CERTIFICATE.md: 13/13, hybrid/multi-subsegment, zero CSIP change`); **no** `sector.it` / `ies-013-it` / `ies-*/it-*` exists; `EngineRegistry.TAXONOMY_RESOLVED.IT = 'IES-015 Technology'` | N/A | Correctly **not created**; `assertNotTaxonomyResolved('IT') → 422` guard present and tested (no `sector.it` in 10). | **Held — correctly taxonomy-resolved** | **None** — mapping remains frozen. |
| **Chemicals / IES-014** | Resolved into **IES-014 Industrials** — NOT separate engine | **Confirmed resolved.** `ies-014-industrials/` + `IndustrialsEngine` exist; no `sector.chemicals`; `IES-014` docs state chemical-industry model coverage. | N/A | Correctly **not created**; guard `Chemicals → IES-014 Industrials`. | **Held** | **None.** |
| **Realty / IES-015** | Resolved into **IES-015 Technology** — NOT separate engine | **Confirmed as prompt-resolved.** Cross-sector docs list `Real Estate` as future (not implemented), but track honors the supplied `Realty → IES-015` controlling mapping; no `sector.realty`/`sector.real-estate` engine exists. | N/A | Correctly **not created**; guard `Realty / Real Estate → IES-015 Technology — prompt-resolved`. | **Held** | **None** — do not reopen. |
| **E2E-025 — Completed-engine API Integration** | Completed-engine API Integration (originally scoped to Materials/Telecom/Auto) — ONGOING/REMAINING | **Infrastructure for 10 (not 3) exists** — `PlatformApi` + `RuntimeCoordinator` + `Transport`; no prior `sector.materials/telecom/auto` dispatch ever existed in `executive-transport.ts` (`ENGINE_FACTORY` had only 10) | `G:\IIPS` irrelevant — no API artifact was assumed from it | **Additive** `EngineRegistry` + `EngineApiAdapter` + `GET /api/engines` + `POST /api/engines/:id/execute` (governed dispatch for 10; Materials/Telecom/Auto return `404 DENIED`) — 14 platform + 6 HTTP tests all pass (oracle-matched for 10) | **Implemented + Verified + Evidenced, still uncertified; scope acceptance for Materials/Telecom/Auto — BLOCKED pending §2 authority reconciliation.** Retain as prerequisite infrastructure. | **No code push until §2 resolves;** then either attach the three new engines to the same adapter (zero CSIP change + 3× oracle tests) **or** obtain scope-deferral record that re-accepts the 10 as the intended E2E-025 scope. |
| **E2E-026 — Engine UI Integration** | ONGOING/REMAINING | UI for 10 existed (`Company/Cross-Sector/Evidence/Replay`); no UI ever existed for Materials/Telecom/Auto | — | **Additive** `EngineRegistry` workspace `/research/engines` + typed client; 4 UI + 6 HTTP; existing 18 company/evidence/cross-sector UI tests remain 6/6 | **Same disposition as E2E-025** — retain, blocked on scope acceptance. | Same. |
| **E2E-027 — Evidence / Provenance Integration** | PENDING | Evidence chain for 10 existed (`EvidencePipeline` + snapshot + provenance) — never for 016/017/020 | — | Harness for 10 (attributable+frozen, `snapshot↔evidence`, 10-engine provenance chain, R2/R3 preserved) — 4 tests | **Same** — retain, blocked on Materials/Telecom/Auto trace (no evidence to trace without engines). | Same — no silent provenance schema change. |
| **E2E-028 — Replay / Provenance E2E** | PENDING | Replay certified for 10 (`ReplayService reproduced/byteIdentical`); never for 016/017/020 | — | Harness for 10 (byte-identical 10, distributed `node-a==node-b`, `differenceAvailable:false`) — 4 tests | **Same** — retain, blocked on scope. Boundary: implemented ≠ certified. | Same. |
| **E2E-029 — CSIP Product / E2E Integration** | ONGOING/REMAINING | CSIP sector-neutral for 10 (`CSIP_COMPATIBILITY: no CSIP logic change for new sectors`); never for 016/017/020 | — | Harness `10×→CSIP.run(Balanced)` determinism — 3 tests | **Same** — retain, blocked on scope. | Same — adding 016/017/020 later is `ontology registration only`, no CSIP change. |
| **E2E-030 — Engine E2E Certification** | PENDING | No E2E-030 certification artifact exists for **any** engine in the mounted recovery (only `Program v1.1` cert `program-v1.1.0` exists — which explicitly ended at `10` engines) | — | **Not claimed** in any doc (`REPORT.md: E2E-030 — PENDING — not claimed`) | **PENDING / NOT CLAIMED** — explicitly held. | **Not authorized by this pass.** Requires separate control authority after E2E-025→029 scope is accepted and evidenced. |

---

## 6. Final Deliverable — §8 Required Report

### A. Authority reconciliation — Materials IES-020 / Telecom IES-016 / Auto IES-017

In the **authoritative repository available to Arena** (`c65d533` recovered `program-v1.1.0` LTS), **Materials IES-020, Telecom IES-016, and Auto IES-017 are genuinely absent as completed/certified engines** (proven exhaustive negative search — §2.1 — plus the explicit governance gate `GATE0_SCOPE.md: do not open IES-016 now`). They are **not** present under another identity (no alias), and **no certification evidence for them is mounted** (no freeze manifest, no calibration/golden/replay, no tag, no `program-v1.1` evidence). Whether they exist only in the Windows `G:\IIPS` environment (possibility 3) is **unverifiable from Arena/Linux** — the prompt's boundary itself states `Arena/Linux cannot access the Windows G:\IIPS checkout`, so no inference is made. The actionable finding is therefore **an actual authority/repository reconciliation issue (possibility 6), explained in part by a prior baseline interpretation mismatch (possibility 5)**: the `ROADMAP.md` planned list (`IES-016/017/020 Planned`) vs the **frozen Program v1.1 LTS baseline** (which completed `IES-006..015` and gated `IES-016`).

**Required next step:** an **authority or access decision** (see §F below) must reconcile which baseline is controlling before `Materials/Telecom/Auto` scope can be accepted.

### B. Taxonomy confirmation — IT / Chemicals / Realty (held)

- **IT → IES-015 Technology — NO separate engine.** Evidence: `ies-015-technology/` certified + `TechnologyEngine` exists; no `sector.it` exists; `EngineRegistry.TAXONOMY_RESOLVED.IT` guard enforces `422` for any attempt.
- **Chemicals → IES-014 Industrials — NO separate engine.** Evidence: `ies-014-industrials/` + `IndustrialsEngine`; no `sector.chemicals`; `Industrials` docs cover chemical-industry model.
- **Realty → IES-015 Technology — NO separate engine.** Evidence: `Real Estate` listed only as future in `CSIP_COMPATIBILITY.md`; no `sector.realty`/`sector.real-estate`; guard `Realty/Real Estate → IES-015 Technology — prompt-resolved` enforces `422`.

All three remain **frozen — do not create separate engines/work packages unless a new explicit authority decision exists** (per §1 of original prompt, correctly preserved).

### C. Existing 10-engine work disposition

The **existing 10-engine integration work on `bbbca16` remains, is retained as prerequisite/infrastructure, and requires no correction or rollback.**

It is **parallel integration work that can remain but cannot be accepted as completion of the originally intended Materials/Telecom/Auto scope** until §A is reconciled. On a technical basis it is **directly within the authorized E2E-025→029 mechanism** (the same governed `RuntimeCoordinator→Evidence→Snapshot→Replay→CSIP` path that Materials/Telecom/Auto would use) — and therefore usefully **prerequisite/infrastructure**: adding any of `IES-016/017/020` later would attach via a single `ENGINE_FACTORY` entry + freeze manifest + 3 oracle rows (zero CSIP change, per `CSIP_COMPATIBILITY.md`). No governed record was amended, no regression expectation weakened, no taxonomy/scoring change occurred (verified by `git diff --stat c65d533..HEAD`: only 18 additive artifacts).

**Exact control dependency if Materials/Telecom/Auto cannot be reconciled from Arena — see §F.**

### D. E2E-025→029 status — precise per-state

| ID | Implemented | Verified | Evidenced | Formally accepted (as Materials/Telecom/Auto scope) | Blocked | Still uncertified |
|----|-------------|----------|-----------|------------------------------------------------------|---------|-------------------|
| **E2E-025** API | **Yes** (adapter+registry+HTTP `GET/POST` for 10) | **Yes** (14 platform + 6 HTTP, oracle-matched for 10) | **Yes** (`IIPS_v3.0_ENGINE_INTEGRATION_EVIDENCE.md` §3–4) | **Not yet — BLOCKED pending §A authority** (10/10 proven, 3/3 pending) | **Scope acceptance blocked** | **Yes — uncertified** |
| **E2E-026** UI | **Yes** (`/research/engines` + 3-workspace re-verification) | **Yes** (4 UI + 6 HTTP + 18 existing 6/6) | **Yes** | **Not yet — blocked** | **Blocked** | **Uncertified** |
| **E2E-027** Evidence/Provenance | **Yes** (attributable+frozen chain for 10) | **Yes** (4 tests) | **Yes** | **Not yet — blocked** | **Blocked** | **Uncertified** |
| **E2E-028** Replay | **Yes** (10 byte-identical + distributed + governed `reproduced/byteIdentical`) | **Yes** (4 tests) | **Yes** | **Not yet — blocked** | **Blocked** | **Uncertified** (explicit boundary: verified ≠ certified) |
| **E2E-029** CSIP Product | **Yes** (10→CSIP deterministic product DTO, no methodology change) | **Yes** (3 tests) | **Yes** | **Not yet — blocked** | **Blocked** | **Uncertified** |

In every row `Implemented + Verified + Evidenced = true` **only for the 10 LTS engines**; `Formally accepted (as Materials/Telecom/Auto scope) = false`; `Blocked = true` for scope acceptance; `Still uncertified = true`.

### E. E2E-030 — Engine E2E Certification

**PENDING / NOT CLAIMED.** No certification was claimed in `bbbca16` (explicit `REPORT.md §H: E2E-030 — PENDING — not claimed`, `EVIDENCE.md §7: boundary`). This reconciliation pass does not authorize certification. `Program v1.1` certification (`program-v1.1.0`) remains the only certified `10/10` baseline; `E2E-030` requires a separate control authority after `025→029` scope is accepted.

### F. Exact control dependency — what Arena needs

If `Materials/IES-020, Telecom/IES-016, Auto/IES-017` cannot be reconciled from the Arena-available evidence (the finding in §A), **stop at reconciliation and report the dependency** — which is one of these **three authority/access artifacts**, any one of which resolves the block:

1. **Mount/supply the missing frozen authority for each of IES-020/016/017** — the minimal frozen set Arena would consume (all under `ies-020-*` / `iips-platform/src/sector-engines/<sector>/` per the IES-014/015 pattern):
   - `IES-020/016/017_FREEZE_MANIFEST.json` (+ `FREEZE_CHECKLIST` + `ARCHITECTURE_REVIEW` if required by gate)
   - `calibration/<sector>-calibration-1.0.0.json`
   - `datasets/<sector>-golden-reference-1.0.0.json`
   - `expected-outputs/<sector>-expected-outputs-1.0.0.json`
   - `replay-datasets/<sector>-replay-dataset-1.0.0.json`
   - `fixtures/<sector>-validation-fixtures-1.0.0.json`
   - `*-ontology-metadata-1.0.0.json` (8/8, CSIP-compatible)
   - `IES*FINAL_READINESS_CERTIFICATE.md` + release tag (e.g. `ies-020-v1.0.0`, `sector.materials@1.0.0`) + inclusion in `PROGRAM_v1.1_REPLAY_BASELINE.json` / or a `PROGRAM_v1.1.x` delta baseline
   — with integrity hashes and the approver's sign-off, to mount in Arena/Linux at a stated path.

2. **Supply a written authority record** (E2E-013-equivalent control disposition) stating that `Materials IES-020 / Telecom IES-016 / Auto IES-017` scope is **deferred / out of scope / taxonomy-resolved** (or that the `Program v1.1 LTS` 10-engine baseline is now the controlling `E2E-025→029` scope). On receipt, the **existing 10-engine work on `bbbca16` is reclassified from “prerequisite/infrastructure, scope acceptance blocked” to “directly within authorized E2E-025→029 scope”** without further code — only `docs/integration/*` disposition update + `git log --grep` trace.

3. **Grant Arena access to the Windows `G:\IIPS` checkout** (or a hash-verified export) where the three engines' certification evidence is claimed to reside — with the authoritative checkout path/hash, so the finding in §A can be re-proved from the mounted baseline without inference. No `G:\IIPS` path should be auto-inferred; the authority must name it.

**Until one of (1)–(3) is supplied, the correct control posture is:**

- **Hold** the `arena/01a06c00…@bbbca16` branch as **work under control review** — do not merge to `main`, do not claim `025→029`/`030` certification, do not amend `E2E-013`, do not create engines by assumption, do not modify frozen manifests/certificates/regressions (per this pass §1).
- **Retain** the existing 10-engine integration slice as **prerequisite/infrastructure** (no rollback).
- **Block scope acceptance** for `Materials/Telecom/Auto` pending reconciliation — and record this file (`IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md`) as the durable reconciliation evidence on the same branch (held unpushed per HOLD, pushed only on authority disposition).

---

## Final Control Rule — Attestation

No new implementation decision was made to resolve the §A discrepancy in this pass. Where the authoritative evidence available in Arena could not establish the status of `Materials/IES-020, Telecom/IES-016, Auto/IES-017` (§2), this report **stops at reconciliation and reports the dependency** (§F). The 10-engine integration work is **technically completed** but its **scope acceptance** and **certification** remain **separately-gated**.

*Report author: Arena agent (read-only reconciliation pass, 2026-09-04) — evidence commands cited in §1–2; exhaustive greps `IES-020/016/017`, `sector.*`, `ls ies-*` / `sector-engines/`, `freeze-manifest` set, `ROADMAP.md` planned-vs-certified, `GATE0_SCOPE.md: do not open IES-016`, `ls-files`, `log --oneline`, `diff --stat`, `ls-remote`.*
