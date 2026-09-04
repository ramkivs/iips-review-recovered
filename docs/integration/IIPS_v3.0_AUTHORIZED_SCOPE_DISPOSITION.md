# IIPS v3.0 — Authorized Scope Disposition (Control Record)

**Authority:** IIPS v3.0 — E2E-025→029 AUTHORIZED CONTINUATION + SCOPE DISPOSITION (§2) — Explicit Program Authorization to Continue from HOLD  
**Date:** 2026-09-04  
**Branch:** `arena/01a06c00-iips-review-recovered`  
**Starting HEAD (this continuation):** `bbbca164f227f12800b9cc51ac383d25b9e31def` (single line, grep-able 40-hex)  
**Predecessor control record:** `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md` — authoritative starting state (prior reconciliation held per HOLD)  
**Baseline:** `c65d53373717aacc3a1dce12d47b5aeaf50541a5` (recovered `program-v1.1.0` LTS)  

> Read-only/control record. No engine created, no freeze manifest invented, no taxonomy/scoring/certification altered. This disposition is the controlling executable scope for the remainder of the Engine Integration track until a later authority supplies the three missing engines.

---

## 1. Controlling Executable Integration Scope — Authorized for Continuation

The following baseline is **authorized for executable integration** (API→UI→Evidence→Replay→CSIP) in this continuation. It is the 10-engine `Program v1.1 LTS` baseline already available in Arena, technically integrated at `bbbca16`, and not requiring invention:

| # | Sector Family | IES | engineId | Version | Freeze Manifest | Readiness Certificate | Baseline Inclusion |
|---|---------------|-----|----------|---------|-----------------|----------------------|--------------------|
| 1 | Banking | IES-006 | `sector.banking` | 1.0.0 | `iips-platform` — IES-006 v1.0 (banking) | `program-v1.1-certification` (Banking) | `PROGRAM_v1.1_REPLAY_BASELINE.json` — `sector: Banking, engineId: sector.banking, calibrationVersion: 1.0.0` — `expectedOutput: Watch / 47.1` |
| 2 | Insurance | IES-007 | `sector.insurance` | 1.0.0 | `iips-platform` — IES-007 v1.0 | program-v1.1 (Insurance) | `Insurance / sector.insurance / 72.3 / Buy` |
| 3 | Capital Markets | IES-008 | `sector.capital-markets` | 1.0.0 | `iips-platform` — IES-008 v1.0 | program-v1.1 (Capital Markets) | `Capital Markets / sector.capital-markets` |
| 4 | Healthcare | IES-009 | `sector.healthcare` | 1.0.0 | `iips-platform` — IES-009 v1.0 | program-v1.1 (Healthcare) | `Healthcare / sector.healthcare` |
| 5 | Hospitality | IES-010 | `sector.hospitality` | 1.0.0 | `ies-010-hospitality/IES-010_FREEZE_MANIFEST.json` | `iips-platform/IES010_FINAL_READINESS_CERTIFICATE.md` | `Hospitality / sector.hospitality` |
| 6 | Energy | IES-011 | `sector.energy` | 1.0.0 | `ies-011-energy/IES-011_FREEZE_MANIFEST.json` | `iips-platform/IES011_FINAL_READINESS_CERTIFICATE.md` | `Energy / sector.energy` |
| 7 | Utilities | IES-012 | `sector.utilities` | 1.0.0 | `ies-012-utilities/IES-012_FREEZE_MANIFEST.json` | `iips-platform/IES012_FINAL_READINESS_CERTIFICATE.md` | `Utilities / sector.utilities` |
| 8 | Consumer | IES-013 | `sector.consumer` | 1.0.0 | `ies-013-consumer/IES-013_FREEZE_MANIFEST.json` | `iips-platform/IES013_FINAL_READINESS_CERTIFICATE.md` | `Consumer / sector.consumer` |
| 9 | Industrials | IES-014 | `sector.industrials` | 1.0.0 | `ies-014-industrials/IES-014_FREEZE_MANIFEST.json` | `iips-platform/IES014_FINAL_READINESS_CERTIFICATE.md` | `Industrials / sector.industrials` |
| 10 | Technology | IES-015 | `sector.technology` | 1.0.0 | `ies-015-technology/IES-015_FREEZE_MANIFEST.json` | `iips-platform/IES015_FINAL_READINESS_CERTIFICATE.md` | `Technology / sector.technology / 76.3 / Buy` |

**Authority basis:** `Program v1.1 LTS` (`program-v1.1.0`, `9/9 Tracks approved`, `10/10 engines released`, tags `ies-006..015`+`program-v1.1.0` verified) — the only certified baseline mounted to Arena (`c65d533`). No `G:\IIPS` inference.

**Prior taxonomy — held (not recreated):**

| Category | Mapping | Separate engine? | Guard |
|----------|---------|------------------|-------|
| IT | IES-015 Technology | NO | `TAXONOMY_RESOLVED.IT` + `assertNotTaxonomyResolved → 422` (`iips-platform/src/integration/EngineRegistry.ts:42–49`) |
| Chemicals | IES-014 Industrials | NO | same — `Chemicals → IES-014 Industrials` |
| Realty / Real Estate | IES-015 Technology | NO | same — `Realty / Real Estate → IES-015 Technology — prompt-resolved` |

---

## 2. Unresolved / Not Available in Current Authoritative Arena Repository — Explicitly Outside Executable Scope

These three remain **outside** the executable implementation scope until their authoritative artifacts are supplied. They must not be silently relabeled, inferred, or fabricated from the 10-engine work:

| Engine | IES | Expected identity if supplied | Repository evidence (Arena) | Control note |
|--------|-----|-------------------------------|-----------------------------|--------------|
| **Telecom** | **IES-016** | `sector.telecom` (hypothetical), freeze `ies-016-telecom/IES-016_FREEZE_MANIFEST.json`, calibration `telecom-calibration-1.0.0`, golden/expected/replay/ontology, `IES016_FINAL_READINESS_CERTIFICATE.md`, tag `ies-016-v1.0.0` | **Absent — plus explicit gate:** `grep IES-016` only in `ROADMAP.md` *Planned* + text `IES-016+` + `program-v1.1-certification/PROGRAM_v1.1_FINAL_CERTIFICATION_GATE0_SCOPE.md:20 Strategic decision: do not open IES-016 now. The program has reached an architectural inflection point… No v2.0 engineering is authorized…` — directly contradicts “completed IES-016”. `ls ies-*` only `010…015`; `ls iips-platform/src/sector-engines/` has no `telecom`; `*_FREEZE_MANIFEST.json` set has no `IES-016`. | Unverifiable via `G:\IIPS` (prompt §3 — Arena cannot access `G:\IIPS`). Not inferred. Current implementation: `EngineApiAdapter.execute('sector.telecom') → DENIED uncertified-capability (404)` — tested. |
| **Auto** | **IES-017** | `sector.auto`, `ies-017-auto/IES-017_FREEZE_MANIFEST.json`, `auto-calibration-1.0.0`, etc. | **Absent.** Same exhaustive negatives; `ROADMAP: IES-017 Automobile — Planned`; no directory/engine/manifest; `grep IES-017` only planned + our block notes. | Same — unverifiable `G:\IIPS`; `404 DENIED`. |
| **Materials** | **IES-020** | `sector.materials`, `ies-020-materials/IES-020_FREEZE_MANIFEST.json`, `materials-calibration-1.0.0`, etc. | **Absent.** Same; `ROADMAP: IES-020 Materials & Metals — Planned`; `grep IES-020` only planned + block notes; `GATE0` gate explains not opening `IES-016` and by extension not `020`. | Same — unverifiable `G:\IIPS`; `POST sector.materials → 404 DENIED`. |

**Disposition:** The three are recorded here as **unresolved / not available** and **explicitly outside** the executable scope. The 10-engine implementation must not be presented as `Telecom/Auto/Materials completion`. This record is the read-only authority for §3–7 below.

---

## 3. Effect on Prior Work at `bbbca16`

The prior implementation at `bbbca16` (18 files, 2429 insertions) was validated for the 10-engine scope (see reconciliation §4: *parallel integration work that can remain but cannot be accepted as completion of the originally intended 3-engine scope*). Per this authorization, its **10-engine technical work is reclassified from “prerequisite/infrastructure, scope acceptance blocked” to “directly within authorized E2E-025→029 scope”** — without code change, without relabeling the 3 as complete. No rollback required.

**Rule for this continuation:** proceed with the authorized 10-engine scope; preserve the three as explicitly blocked (§2); do not manufacture missing authority for them (Final Control Rule).

---

## 4. Audit Trail (40-hex pins on single lines, grep-able)

```
starting HEAD (this continuation): bbbca164f227f12800b9cc51ac383d25b9e31def
baseline (recovered program-v1.1.0 LTS): c65d53373717aacc3a1dce12d47b5aeaf50541a5
prior reconciliation (held, not yet pushed at start): docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md (pre-existing untracked, now committed with this disposition)
```

All pins in machine-readable evidence (§5 of continuation) remain on single physical lines (no hard-wrapped hashes).

---

## 5. Formal E2E-013-Equivalent Program Authority Acceptance — 2026-09-04

**Authority action:** Formal program authority **ACCEPTS** `IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md` (§1–§4) as the **E2E-013-equivalent control disposition** for the verified scope at `main@60fd96417f7c4ea533c4157e4e72bc53cacff49e`. This is an **acceptance/documentation gate, NOT an implementation or certification gate** — no engine, taxonomy, scoring, metrics, calibration, freeze manifest, certification criteria, or certified engine implementation is created or altered.

**Acceptance invariants verified (pre-acceptance, 2026-09-04):**

- `main` HEAD `60fd96417f7c4ea533c4157e4e72bc53cacff49e` == `origin/main` == local `main`; working tree clean.
- `IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md` present at `73 lines` as reconciled at `60fd964` (authority `E2E-025→029 AUTHORIZED CONTINUATION`, baseline `c65d53373717aacc3a1dce12d47b5aeaf50541a5`, starting HEAD `bbbca164f227f12800b9cc51ac383d25b9e31def`).
- Engine Integration E2E-025→029 and Product E2E present and evidenced (`docs/integration/IIPS_v3.0_*` 12 files + `frontend/server/product-transport.test.ts`), combined evidence `284/284` PASS (`25 platform + 50 sector acceptances + 38 program tracks + 10 frontend engine + 10 product + 151 full frontend → 284` at `bf621bf`/`60fd964`; re-verified at `6628aef` `274/274`).
- IES-016 / IES-017 / IES-020 remain **absent** (`ls ies-*` only `010…015`, `ls sector-engines` no `telecom`/`auto`/`materials`, `IES*_FREEZE_MANIFEST.json` no `016/017/020`, `G:\IIPS` not mounted) and blocked (`404 DENIED` tested).
- Frozen/governance-controlled assets diff vs `c65d53373717aacc3a1dce12d47b5aeaf50541a5` remains `0` (`ies-*/ program-v1.1-certification/ iips-platform/IES* governance/ */scoring|metrics|calibration/`).
- No `E2E-013` artifact exists in recovery checkout; control plane remains `Program v1.1 LTS Baseline` + freeze manifests (per Discovery §1). No `E2E-030` certification artifact exists.

**Accepted disposition — explicitly establishes:**

### In scope

`IES-006…015` — the verified 10-engine `Program v1.1 LTS` baseline (`Banking IES-006 … Technology IES-015`, `sector.banking … sector.technology`, `1.0.0`, `FROZEN`, `PROGRAM_v1.1_REPLAY_BASELINE.json` 10/10) as listed in §1.

**Engine Integration E2E-025→029 and Product E2E are: TECHNICALLY COMPLETE + MERGED + EVIDENCED but remain distinct from formal E2E-030 certification.** Engine slice merged at `6628aef67d1fdbf27ac8da31758bd60589c2e440` (18+3+1 files, `274/274` at `e47dc4c`), Product slice merged at `60fd96417f7c4ea533c4157e4e72bc53cacff49e` (5 files `955` at `471fd1b966ff641aac5c896dfe73f4c845122933` + reconciliation `bf621bf15b2b6881740b1e4f40a0769974e2c07e`), both on canonical `main`.

### Explicitly deferred / outside current scope

- **IES-016 Telecom** — `sector.telecom` — **BLOCKED / OUTSIDE SCOPE**
- **IES-017 Auto** — `sector.auto` — **BLOCKED / OUTSIDE SCOPE**
- **IES-020 Materials** — `sector.materials` — **BLOCKED / OUTSIDE SCOPE**

These remain **BLOCKED / OUTSIDE SCOPE** with **no authorization to begin v2.0 engineering** before the applicable certification/control conditions are satisfied (`PROGRAM_v1.1_FINAL_CERTIFICATION_GATE0_SCOPE.md:20 Strategic decision: do not open IES-016 now. No v2.0 engineering is authorized before certification is complete`). No frozen set, no engine implementation, no `G:\IIPS` inference is authorized by this acceptance.

### Taxonomy — preserved without modification

- `IT → IES-015 Technology` (`TAXONOMY_RESOLVED.IT`)
- `Chemicals → IES-014 Industrials` (`TAXONOMY_RESOLVED.Chemicals`)
- `Realty / Real Estate → IES-015 Technology` (`TAXONOMY_RESOLVED['Real Estate']`)

Guard `assertNotTaxonomyResolved → 422` (`iips-platform/src/integration/EngineRegistry.ts:42–49`) unchanged. No taxonomy mapping created, altered, or exposed as a separate engine.

### Certification boundary — preserved

**E2E-030 = PENDING / NOT CLAIMED.** Technical completion and merge of E2E-025→029 + Product at `60fd964` do **not** constitute certification. No `E2E-030` certification artifact has been created or claimed by this acceptance. Certification remains a separate authority gate requiring explicit `E2E-030` control-gate review (E2E-025…029 evidence + this `E2E-013`-equivalent disposition + freeze/compatibility sign-off).

**Effect of this acceptance:** The existing 10-engine technical work is now **formally accepted** under this `E2E-013`-equivalent disposition without further code change; no rollback is required; no new `E2E-013` artifact file is invented (acceptance is recorded additively in this authoritative disposition structure, per artifact discipline). All future scope or certification decisions must reference this §5 acceptance at `main@60fd964`.

**Post-acceptance invariants (for verification after commit):** frozen/governance diff `0`, taxonomy held, `016/017/020` still `404 BLOCKED`, `E2E-030` still `PENDING`, no placeholder/future-pin, evidence `284/284` intact, working tree clean.

**Audit pins (single-line, grep-able 40-hex):**

```
pre-acceptance HEAD: 60fd96417f7c4ea533c4157e4e72bc53cacff49e
engine slice merge: 6628aef67d1fdbf27ac8da31758bd60589c2e440
product slice head: 471fd1b966ff641aac5c896dfe73f4c845122933
product reconciliation: bf621bf15b2b6881740b1e4f40a0769974e2c07e
authorized disposition: docs/integration/IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md (§1–§4)
acceptance record: docs/integration/IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md §5 (this section)
baseline: c65d53373717aacc3a1dce12d47b5aeaf50541a5
starting HEAD (continuation): bbbca164f227f12800b9cc51ac383d25b9e31def
```
