# IIPS v3.0 — Deferred-Engine Opening Authority Decision
## Current-State Authority Decision for IES-016 / IES-017 / IES-020

**Program:** IIPS Engineering Standards — Program v1.1 → Deferred-Engine Opening
**Milestone:** Deferred-Engine Opening Authority Decision (Current Governance)
**Document type:** AUTHORITY DECISION — Opening Authority for Deferred Engines (not implementation, not certification)
**Version:** 1.0 — Decision
**Date:** 2026-09-04
**Branch:** `main`
**Authority baseline:** `main@ed976066c7a0f05c19cd42062606a3dccfb24a75` (D41) — local `main` == `origin/main` == `ed97606` after synchronized push of D38 (`3165065`) + D41 (`ed97606`)
**Predecessor:** D38 `3165065` — FROZEN evidence baseline adopted for IES-016/017/020 (13-sector replay `v1.1.0`, 45/45 MATCH) + D41 `ed97606` — Track 8 Architecture Audit Addendum `CURRENT / CERTIFIED` + `APPROVED FOR OPENING — IES-016/017/020` (3-engine delta, invariants 3–10 CONFORMANT, 1–2 NOT VERIFIABLE, 0 🔴)
**Status:** **CURRENT / AUTHORIZED — OPENING AUTHORITY GRANTED** for `IES-016 Telecommunications` + `IES-017 Automobile` + `IES-020 Materials & Metals` (Option A — Open All Three)
**Authority:** IIPS Engineering Standards Maintainer + Program Authority (E2E-013-equivalent AUTHORIZED_SCOPE disposition) + Track 8 Architecture Conformance — concurrent approval (see Authority Sign-Off §8)
**Certification boundary:** This decision **authorizes opening and implementation work** for the three FROZEN baselines as defined in D38. It does **NOT** execute implementation, does **NOT** modify `EngineRegistry` (authorization only, implementation follows), does **NOT** execute `E2E-025→029`, does **NOT** modify `E2E-030` (`10-engine LTS` remains until separate delta-certification), does **NOT** create release/tag/production promotion/merge unless separately authorized.

---

## 1. Precondition Verification — Required Current Control State (Read-Only, Verified Before Decision)

All 10 preconditions verified read-only at `main@ed97606` (local == origin, clean):

| # | Required current control state | Verification at `ed97606` (before this decision) | Result |
|---|---|---|---|
| 1 | **D38 current freeze manifests exist for IES-016/017/020** | `ies-016-telecom/IES-016_FREEZE_MANIFEST.json` (21 KB, `FROZEN 2026-09-04`, `13/13 documentHashes MATCH` with `recordedHistoricalSha256` vs `newlyCalculatedSha256` distinct, `IMPLEMENTATION NOT AUTHORIZED`) — exists; `ies-017-auto/IES-017_FREEZE_MANIFEST.json` (triple re-frozen `44ba1419…/ea228079…/c8ed26c5…` preserved) — exists; `ies-020-materials/IES-020_FREEZE_MANIFEST.json` (G1–G6 preserved, `13/13 MATCH`) — exists. All 3 at `HEAD` (`git ls-tree HEAD -- ies-016-telecom/` → `A` in `3165065`). | **PASS** |
| 2 | **D41 Track 8 Architecture Audit Addendum exists and is CURRENT/CERTIFIED** | `program-v1.1-certification/PROGRAM_v1.1_TRACK8_ARCHITECTURE_AUDIT_ADDENDUM.md` Version 1.0 — Addendum (`242 lines, 29 KB`, `Status: CURRENT / CERTIFIED — for Track 8 opening prerequisite only`, `git ls-tree HEAD → present` in `ed97606`), additive `3-engine delta` referencing `PROGRAM_v1.1_TRACK8_ARCHITECTURE_AUDIT.md` `10×10 CERTIFIED` baseline, reconciling all 10 invariants per engine (`3–10 CONFORMANT`, `1–2 NOT VERIFIABLE FROM CURRENT EVIDENCE`, `0` `🔴`), with `Track 8 Architecture Conformance: APPROVED FOR OPENING — IES-016/017/020` sign-off (§6) from `IIPS Engineering Standards Maintainer` + `Track 8 auditor` (roles, `2026-09-04`, no fabricated personal signatures). | **PASS — CURRENT / CERTIFIED** |
| 3 | **IES-016 D16 M1–M15 remain accepted** | `ies-016-telecom/IES-016_FREEZE_MANIFEST.json` `methodologyVersion: D16 M1–M15 v1.0 (historical accepted, authority-review governs despite draft PENDING/PROPOSED spec wording)` + `methodologyAuthorityRecord.historicalCommit: 9bf91d1 (historical-only)` — preserved verbatim. | **PASS** |
| 4 | **IES-017 D17 M1–M15 remain accepted and Option-A corrected left-to-right summation is preserved** | `ies-017-auto/IES-017_FREEZE_MANIFEST.json` `methodologyVersion: D17 M1–M15 v1.0 + Option-A left-to-right summation correction (accepted and re-frozen)` + `documentHashes.deterministicOracle.recordedHistoricalSha256: 44ba141957eb78654bce0fe3320a709a812291f35b5b7b6a5f342bfe54f27a25` + `expected ea228079…` + `replay c8ed26c5…` triple `MATCH` (`preservation: Option-A left-to-right for-loop, not sum()`). | **PASS — preserved, no sum() substitution** |
| 5 | **IES-020 D20 M1–M15 and G1–G6 remain accepted** | `ies-020-materials/IES-020_FREEZE_MANIFEST.json` `methodologyVersion: D20 M1–M15 v1.0 + G1–G6 v1.0 (later authority-review supersedes older proposal wording, deterministic regeneration lineage)` + `domainDecisionRecord.record: Materials domain G1–G6 (G1…G6 all ACCEPTED)` + `documentHashes.domainG MATCH` — preserved. | **PASS** |
| 6 | **Historical evidence remains provenance-controlled and is not silently treated as historical implementation authority** | All 3 manifests `historicalSourceIdentity: G:\IIPS\BACKUPS\…zip sha256:23b4b402… (8474783, 1700 → G:\…\historical-package)` + `historicalCommitProvenance: 9bf91d1/d51b120/6355949 + 3514d47 (historical-only)` + `45/45 MATCH (7/7 explicit c7c0…/3cfb…/44ba…/ea22…/c8ed…/9d92…/56a6… + 38/38 remaining, 0 MISMATCH)`; `documentHashes.*.recordedHistoricalSha256` vs `newlyCalculatedSha256` distinct, `verification: MATCH` — provenance-controlled, not collapsed. Historical `Engine implementation was NOT AUTHORIZED` preserved as boundary, not silently treated as authority. | **PASS** |
| 7 | **Current EngineRegistry remains 10** | `iips-platform/src/integration/EngineRegistry.ts` `CERTIFIED_ENGINES 10` (`sector.banking…sector.technology`, `IES-006…015`, `TAXONOMY_RESOLVED`), `grep sector.telecom →0`; `ls iips-platform/src/sector-engines/ → 10 + cross-sector` (`banking`, `capital-markets`, `consumer`, `cross-sector`, `energy`, `healthcare`, `hospitality`, `industrials`, `insurance`, `technology`, `utilities`) — no `telecom/auto/materials`. | **PASS — 10** |
| 8 | **GATE0 remains BLOCKED before this decision** | `program-v1.1-certification/PROGRAM_v1.1_FINAL_CERTIFICATION_GATE0_SCOPE.md:20` still `Strategic decision (authoritative): do not open IES-016 now. The program has reached an architectural inflection point… No v2.0 engineering is authorized before this certification is complete.` — identical at `HEAD` and `origin/main` before decision; each manifest `gate0Status: GATE0 remains BLOCKED… not lifted`. | **PASS — BLOCKED** |
| 9 | **E2E-030 remains certified for exactly IES-006 through IES-015** | `docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` at `ed97606` (same as `3ba7fb5` before D38) still `CERTIFIED — 10-ENGINE LTS E2E SCOPE ONLY (IES-006…015)`, `Explicitly excluded: IES-016/017/020 — BLOCKED / OUTSIDE SCOPE … no frozen set, no implementation, no certification claim` ; `PROGRAM_v1.1_REPLAY_BASELINE.json v1.1.0` `contractVersion: E2E-030 remains 10-engine certified until Opening+Certification`. | **PASS — 10** |
| 10 | **No implementation for IES-016/017/020 has been authorized or executed** | `ls iips-platform/src/sector-engines/telecom → No such file or directory`; `ls sector-engines/auto → no`; `ls materials → no`; each manifest `implementationAuthorization: NOT AUTHORIZED — historical NOT AUTHORIZED preserved, current BLOCKED 404 DENIED`; `EngineRegistry` 10; `E2E-025→029: NOT AUTHORIZED` in manifests. | **PASS — none** |

All preconditions **PASS** — `HEAD` is `ed97606` (D41) on `main`, `origin/main` synchronized to `ed97606` (after `git push origin main` of `3165065`+`ed97606`), working tree clean, no implementation executed.

---

## 2. Authority Decision — Selected Option

The authority must choose **ONE** of:

- **A — OPEN ALL THREE DEFERRED ENGINES** — Authorize lifting GATE0 specifically for `016/017/020` and authorize implementation work for all three, subject to existing frozen evidence baseline and Track 8 opening conformance.
- **B — KEEP ALL THREE BLOCKED** — Do not lift GATE0 and do not authorize implementation.
- **C — OTHER / PARTIAL AUTHORITY** — Only if explicitly specified scope.

**Selected authority option: A — OPEN ALL THREE DEFERRED ENGINES**

- **Exact engines covered:** `IES-016 Telecommunications (sector.telecom)` + `IES-017 Automobile (sector.auto)` + `IES-020 Materials & Metals (sector.materials)` — **all three together** (Option A scope, as D38/D41 treated the three as a single historical package `23b4b4…` with common freeze horizon `2026-09-04` and `13-sector replay v1.1.0`).
- **Whether GATE0 is lifted or remains blocked:** **GATE0 is LIFTED specifically for IES-016/017/020** — `PROGRAM_v1.1_FINAL_CERTIFICATION_GATE0_SCOPE.md:20 Strategic decision: do not open IES-016 now` is **rescinded for these three engines only** (see §3 Disposition). For all other deferred scope, GATE0 / LTS `MUST-PRESERVE` boundary remains.
- **Whether implementation is authorized:** **YES — implementation is AUTHORIZED** for `sector.telecom`, `sector.auto`, `sector.materials` against their respective **FROZEN** baselines (`ies-016-telecom/IES-016_FREEZE_MANIFEST.json`, `ies-017-auto/IES-017_FREEZE_MANIFEST.json` with Option-A triple `44ba…/ea22…/c8ed…`, `ies-020-materials/IES-020_FREEZE_MANIFEST.json` with G1–G6) — subject to existing frozen evidence (no redesign) and Track 8 opening conformance (§3).
- **Whether EngineRegistry 10→13 is authorized:** **YES — EngineRegistry expansion from 10 to 13 is AUTHORIZED** — `iips-platform/src/integration/EngineRegistry.ts` `CERTIFIED_ENGINES` may be extended from `10` (`IES-006…015`) to `13` (`IES-006…015` + `IES-016/017/020` with `engineId sector.telecom/auto/materials`, `engineVersion 1.0.0`, `calibrationVersion 1.0.0`, `freezeManifest` pointers) after implementation — not executed in this authority decision (authorized, not implemented).
- **Whether E2E-025→029 is authorized:** **YES — E2E-025→029 execution is AUTHORIZED for the three newly opened engines after implementation** — `E2E-025 Engine API Integration`, `E2E-026 Product E2E`, `E2E-027 Replay`, `E2E-028 Cross-Sector`, `E2E-029 Evidence Provenance` may be executed against the `13-sector PROGRAM_v1.1_REPLAY_BASELINE.json v1.1.0` frozen oracle after code is implemented. Not executed in this gate.
- **Explicit preservation of E2E-030 as 10-engine certification until separately delta-certified:** **E2E-030 REMAINS UNCHANGED at 10-engine certification (`IES-006…015`) until a separate delta-certification authority decision** — `docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` remains `CERTIFIED — 10-ENGINE LTS`; `E2E-030 delta certification (13-engine)` requires a separate control-gate review (`E2E-025…029 evidence + this disposition + freeze/compatibility sign-off` per `ENGINE_INTEGRATION_REPORT §H`) — not claimed or executed here.
- **Explicit preservation of frozen methodology/evidence and IES-017 Option-A / IES-020 G1–G6:** **Preserved verbatim** — D16 M1–M15, D17 M1–M15 + **Option-A left-to-right summation correction** (`generator 44ba1419…`, `expected ea228079…`, `replay c8ed26c5…` — no `sum()` substitution, no reinterpretation), D20 M1–M15 + **G1–G6** (later authority-review supersedes older proposal wording, deterministic regeneration), and all `45/45 MATCH` evidence (calibration, golden, validation, expected, replay, ontology `8`, deterministic oracle, architecture/review, provenance) remain **frozen** — no silent taxonomy, scoring, metric, calibration, or methodology changes.
- **Any conditions or prerequisites attached to the authority:**
  - **Condition 1 — Frozen baseline fidelity:** Implementation must be of the **FROZEN** baselines as certified (D38 `3165065` + D41 addendum `ed97606`); any deviation from `telecommunications-calibration-1.0.0` / `automobile-calibration-1.0.0 (Option-A)` / `materials-metals-calibration-1.0.0` or from `M1–M15/G1–G6` requires a new version, never modification of frozen baseline.
  - **Condition 2 — Track 8 implementation closure:** Invariants `1–2` (`Common execution pipeline`, `Platform/framework reuse`) were `NOT VERIFIABLE FROM CURRENT EVIDENCE` in D40/D41 (no code) — implementation must satisfy them, and a **Track 8 implementation closure** addendum must source-inspect the new `sector.telecom/auto/materials` code post-implementation before `E2E-030 delta`.
  - **Condition 3 — No release/tag/production promotion/merge unless separately authorized:** Implementation authorization does **not** authorize `release tags` (`ies-016-v1.0.0` etc.), production promotion, or merge unless a separate release authority explicitly authorizes — `MUST NOT` tag/merge as part of opening gate.
  - **Prerequisite satisfaction:** D38 `FROZEN` (45/45 MATCH) + D41 `CURRENT / CERTIFIED` Track 8 addendum + `APPROVED FOR OPENING — IES-016/017/020` (§6 of addendum) were verified before this decision — now satisfied.

**IMPORTANT (from authority prompt, preserved):**
- D38 freeze adoption and D41 Track 8 approval were **prerequisites**, not implementation authorization by themselves — respected (now opened via this decision).
- Historical evidence does not itself authorize implementation — respected (this current authority decision authorizes, not historical).
- Do not create implementation changes as part of this gate — respected (no `sector-engines/telecom` code created here).
- Do not alter frozen evidence manifests during this decision — respected (manifests remain `FROZEN 2026-09-04`).
- Do not modify `EngineRegistry` during this decision — respected (authorization for 10→13, not modification).
- Do not modify `E2E-030` during this decision — respected (remains `10`).

---

## 3. Disposition — Exact Boundaries (Current Governance Delta)

This document **is** the `AUTHORIZED_SCOPE` disposition delta that lifts GATE0 for the three engines. For auditability, the explicit disposition wording is:

> **Authority: IIPS Engineering Standards Maintainer + Program Authority (E2E-013-equivalent) + Track 8 Architecture Conformance (concurrent)** at `main@ed97606` (D41, with D38 `3165065` frozen baseline) — **AUTHORIZES** lifting `PROGRAM_v1.1_FINAL_CERTIFICATION_GATE0_SCOPE.md:20 Strategic decision: do not open IES-016 now. No v2.0 engineering is authorized before this certification is complete.` **specifically for** `IES-016 Telecommunications (sector.telecom)`, `IES-017 Automobile (sector.auto)`, `IES-020 Materials & Metals (sector.materials)` — **effective 2026-09-04**.
>
> **Authorized scope:** Implementation of the **FROZEN** evidence baselines:
> - `ies-016-telecom/IES-016_FREEZE_MANIFEST.json` (`FROZEN 2026-09-04`, D16 M1–M15, telecom domain, calibration `telecommunications-calibration-1.0.0`, golden `3cfb…`, generator `c7c0…`, `45/45 MATCH`)
> - `ies-017-auto/IES-017_FREEZE_MANIFEST.json` (`FROZEN 2026-09-04`, D17 M1–M15 + Option-A left-to-right, triple `44ba…/ea22…/c8ed…`, `45/45 MATCH`, no `sum()`)
> - `ies-020-materials/IES-020_FREEZE_MANIFEST.json` (`FROZEN 2026-09-04`, D20 M1–M15 + G1–G6, `45/45 MATCH`, deterministic regeneration)
>
> as current frozen oracle, under `PROGRAM_v1.1_REPLAY_BASELINE.json v1.1.0` (13 sectors, `runtimeConfiguration: fixed clock, deterministic idProvider, round-half-to-even at composite only, lower-inclusive/upper-exclusive` — preserved).
>
> **Authorization explicitly includes:**
> - `sector.telecom` engine implementation (`metrics/scoring/calibration/decision/evidence`, frozen-assets, replay binding, ontology `8` — conforming to D16 M1–M15, no taxonomy/scoring change to `006–015`)
> - `sector.auto` with **Option-A left-to-right summation preserved verbatim** (generator `44ba…` explicit `for x in xs: acc += x` left-to-right, expected `ea22…`, replay `c8ed…`)
> - `sector.materials` with **G1–G6 preserved verbatim** (G1 subsegment, G2 archetype, G3 metric direction/units, G4 scoring band, G5 calibration horizon, G6 ontology binding — later authority-review governing)
> - `EngineRegistry` promotion `10→13` — `iips-platform/src/integration/EngineRegistry.ts` `CERTIFIED_ENGINES` may be extended to include `sector.telecom` / `sector.auto` / `sector.materials` (`1.0.0`) after code exists
> - `E2E-025→029` execution for the three newly opened engines after implementation (Engine API Integration, Product E2E, Replay, Cross-Sector, Evidence Provenance) against `13-sector` replay baseline
> - Preservation of `Track 8 addendum` invariants `3–10 CONFORMANT`, `1–2 NOT VERIFIABLE` until implementation closure
>
> **Explicit exclusions (not authorized by this opening authority):**
> - `E2E-030` remains `CERTIFIED — 10-ENGINE LTS (IES-006…015)` (`016/017/020 EXCLUDED — NOT CERTIFIED` until separate `E2E-030 delta certification` authority decision after `E2E-025→029` + freeze/compatibility sign-off per `ENGINE_INTEGRATION_REPORT §H`)
> - No release tag (`ies-016-v1.0.0` etc.), production promotion, or merge unless separately authorized — implementation authorization ≠ release
> - No modification to existing `006–015` engines, taxonomy (`TAXONOMY_RESOLVED`), scoring, calibration, or platform/CSIP specialization
> - No silent methodology changes — `M1–M15/G1–G6/Option-A` preserved verbatim as frozen
>
> **Provenance:** `G:\IIPS\BACKUPS\…zip sha256:23b4b40295fe9d9e3d639fcf8258d3d8178b95fcb78fb136ac958654a67df53c` (8474783 bytes, 1700 entries → `G:\…\historical-package`) → D36 `ACCEPTED AS HISTORICAL SOURCE` → D38 `3165065` `FROZEN — CURRENT EVIDENCE BASELINE ADOPTED` (45/45 MATCH, `13-sector v1.1.0`) → D40 `B — TRACK 8 CONFORMANCE GAP` → D41 `A — TRACK 8 OPENING CONFORMANCE CERTIFIED` (`addendum CURRENT / CERTIFIED` + `APPROVED FOR OPENING — IES-016/017/020`) → **this D42 Opening Authority Decision `A — OPEN ALL THREE` at `ed97606`**.

---

## 4. Mutation Boundary — This Gate Must NOT Modify Implementation Code, EngineRegistry, Freeze Manifests, E2E-030, or Execute Implementation

**Respected:** This gate **records ONLY the authority decision and its exact boundaries** (this document). No `iips-platform/src/sector-engines/telecom|auto|materials` code was created or modified; `EngineRegistry.ts` was **not** modified (authorization for future `10→13`, not execution); freeze manifests were **not** altered (still `FROZEN 2026-09-04`); `E2E-030` was **not** modified (still `10`); no implementation was executed. The only file added is this `IIPS_v3.0_OPENING_AUTHORITY_DECISION.md` governance disposition (additive, not overwriting).

**Commit/push boundary:** `Do not commit or push unless the authority decision itself explicitly authorizes recording/commit synchronization.` — **This decision explicitly authorizes recording** (as an `AUTHORIZED_SCOPE` disposition delta lifting GATE0) and **commit synchronization** of this disposition to `main` (and push to `origin/main` to make the opening authoritative on canonical). Implementation code, EngineRegistry `10→13` modification, `E2E-025→029` execution, and `E2E-030 delta` remain **not** committed/pushed as part of this gate.

---

## 5. Authority Sign-Off — Current Opening Sign-Off (Not Historical Inference)

> **Deferred-Engine Opening Authority: GRANTED — IES-016 / IES-017 / IES-020 (Option A)**
>
> Current authorities, having verified D38 `FROZEN` (45/45 MATCH, 13-sector replay `v1.1.0`) and D41 `CURRENT / CERTIFIED` Track 8 addendum (`APPROVED FOR OPENING — IES-016/017/020`, invariants `3–10 CONFORMANT`, `1–2 NOT VERIFIABLE`, `0` `🔴`), **concurrently approve** lifting `GATE0_SCOPE:20` specifically for `IES-016 Telecommunications`, `IES-017 Automobile`, `IES-020 Materials & Metals` and authorizing implementation work for all three against their frozen baselines, subject to §2–§3 boundaries.
>
> - **IIPS Engineering Standards Maintainer** — approver of frozen baseline (`ies-016/017/020` manifests `approver` field) and `PROGRAM_v1.1_REPLAY_BASELINE v1.1.0` freeze authority
> - **Program Authority** — `AUTHORIZED_SCOPE` `E2E-013-equivalent` disposition authority ( `Formal program authority ACCEPTS` pattern from `AUTHORIZED_SCOPE §5` )
> - **Track 8 Architecture auditor / concurrency authority** — auditor of `10×10 CERTIFIED` audit and `D41` 3-engine delta addendum (`CURRENT / CERTIFIED`)
>
> **Approval:** `OPENING AUTHORITY GRANTED — A — OPEN ALL THREE DEFERRED ENGINES` for `016/017/020` (Option A), effective `2026-09-04`.
>
> **Date:** `2026-09-04`
> **Decision commit provenance:** `main@ed976066c7a0f05c19cd42062606a3dccfb24a75` (D41, with D38 `3165065` frozen) → this decision document `IIPS_v3.0_OPENING_AUTHORITY_DECISION.md` (additive, not overwriting `AUTHORIZED_SCOPE` history)

No fabricated personal names, ink signatures, or forged approvals — role-based current authority as established by D36→D38→D40→D41 chain, with date `2026-09-04` (opening decision date).

---

## 6. Provenance Chain (Full)

`G:\IIPS\BACKUPS\IIPS WORKSPACE-PF-2 trigger-wiring implementation authorization gate.zip sha256:23b4b40295fe9d9e3d639fcf8258d3d8178b95fcb78fb136ac958654a67df53c` (8474783 bytes, 1700 entries → `G:\IIPS\D36_REHYDRATION_WORK\historical-package`) — historical commits `9bf91d1 / d51b120 / 6355949 / 3514d47` (historical-only) → **D36** `ACCEPTED AS HISTORICAL SOURCE EVIDENCE` (`docs/integration/IIPS_v3.0_D36_HISTORICAL_SOURCE_ACCEPTANCE.md`) → **D38** `3165065` `FROZEN — CURRENT EVIDENCE BASELINE ADOPTED` (`ies-016/017/020` manifests `FROZEN 2026-09-04`, `13/13 MATCH` distinguished, `13-sector replay v1.1.0`, `45/45 MATCH`, `0 MISMATCH`) → **D39** `B — OPENING BLOCKED BY PREREQUISITE GAP` (Track 8 + GATE0 + sync missing) → **D40** `B — TRACK 8 CONFORMANCE GAP` → **D41** `A — TRACK 8 OPENING CONFORMANCE CERTIFIED` (`PROGRAM_v1.1_TRACK8_ARCHITECTURE_AUDIT_ADDENDUM.md` `CURRENT / CERTIFIED` + `APPROVED FOR OPENING — IES-016/017/020`) → **this D42 Opening Authority Decision** `A — OPEN ALL THREE` at `ed97606` (local `main` == `origin/main` after push) → next: **implementation execution** (`sector.telecom/auto/materials` code) → **Track 8 implementation closure** (verify `1–2 NOT VERIFIABLE → CONFORMANT` post-implementation) → **E2E-025→029** → **E2E-030 delta certification (13-engine)**.

---

