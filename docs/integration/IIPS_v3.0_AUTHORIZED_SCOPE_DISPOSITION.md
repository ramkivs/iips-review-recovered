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
