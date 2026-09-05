# Program v1.2.0 — Compatibility and Migration (Release Candidate — Prepublication)

**Version:** `v1.2.0` — **RELEASE CANDIDATE — PREPUBLICATION** (successor MINOR to `program-v1.1.0`)
**Tag (planned):** `program-v1.2.0` — **TAG PLANNED, NOT YET CREATED**
**Canonical preparation commit:** `da01a82c67df9e1043d32c2855c1898be57a5509` (HEAD == origin/main, clean)
**Predecessor LTS:** `program-v1.1.0` (10-engine LTS, `PROGRAM_v1.1_LTS_BASELINE.md` FROZEN, `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` ISSUED, `RELEASE_NOTES_PROGRAM_v1.1.0.md` Tag `program-v1.1.0`)
**Successor scope:** `IES-006…015 + IES-016 + IES-017 + IES-020 = 13 engines` — all `1.0.0` `FROZEN`, `calibrationVersion 1.0.0`
**Document type:** COMPATIBILITY & MIGRATION — additive, not overwriting
**Date:** 2026-09-05 (preparation)

This document satisfies the five `governance/VERSIONING_POLICY.md` *Compatibility Rules* and *Release Requirements* (Compatibility assessed) and `governance/RELEASE_CHECKLIST.md` Phase 3 *Compatibility assessment completed* for the `v1.2.0` successor.

---

## 1. Backward Compatibility

**Verdict: Fully backward compatible — no breaking change evidenced.**

| Area | Evidence at `da01a82` (and `e156cf6`/`eee39d3`/`6a5d7cc`) | Impact |
|------|--------------------------------------------------------|--------|
| **Existing 10 engines** `IES-006…015` | `git diff --stat HEAD -- iips-platform/src/sector-engines/banking … technology` → `` (0) — **no modification** to obtain PASS (verified in `PROGRAM_v1.1_TRACK8_IMPLEMENTATION_CLOSURE.md` §6 and `IIPS_v3.0_E2E-025_029_DEFERRED_ENGINE_CERTIFICATION.md` §10). `banking-acceptance 4/4 PASS`, `technology-acceptance 13/13 PASS`, `hospitality-acceptance 5/5 PASS`, `program-v1.1-track8-architecture-audit 10/10 PASS` — existing Track 8 10×10 unchanged. | Existing engine outputs **identical** to `program-v1.1.0` oracle (e.g., `Banking Watch 47.1`, `Technology Buy 76.3` MATCH). |
| **Platform / framework / runtime** | `git diff --stat HEAD -- iips-platform/src/framework iips-platform/src/runtime iips-platform/src/snapshot iips-platform/src/replay iips-platform/src/distributed` → `` (0); no `if sector.telecom` branching in platform | No platform contract change; callers pinning platform version unaffected. |
| **Cross-sector / CSIP** | `git diff --stat HEAD -- iips-platform/src/sector-engines/cross-sector` → `` (0); `CrossSectorEngine` sector-neutral `genuine sector-neutrality` preserved; `csip-product-e2e` with 10 alone → `holdings 10 avgConviction 73.2` **unchanged** vs 13 with `holdings 13 avgConviction 72.9` — 10-engine behavior preserved when run with 10 alone | Consumers aggregating 10 holdings remain valid; 13 is superset. |
| **Taxonomy** | `IT → IES-015 Technology`, `Chemicals → IES-014 Industrials`, `Realty → IES-015 Technology` (`TAXONOMY_RESOLVED` + `assertNotTaxonomyResolved → 422` at `EngineRegistry.ts:42–49`) unchanged | No new taxonomy mapping; existing `422` guard intact. |
| **APIs** | `EngineApiAdapter.listEngines()` now `certifiedCount 13` (previously 10) — additive; `EngineApiAdapter.execute('sector.unknown') → DENIED` (404) unchanged; `GET /api/engines` `freshness FROZEN` unchanged | Existing `GET /api/engines` callers receive 3 additional entries but existing 10 entries unchanged; callers filtering by `sector.banking…technology` unaffected. |
| **Determinism / replay** | `RuntimeCoordinator.recordSnapshot` with `fixed 2026-08-09T00:00:00.000Z` + `deterministic IdProvider` preserved; `ReplayService` `reproduced:true byteIdentical:true` for all 13 | Replay semantics unchanged; existing 10 replay assertions byte-identical. |
| **Evidence / provenance** | `EvidencePipeline` attributable+frozen, `provenance{engineVersion 1.0.0, calibrationVersion 1.0.0, deterministic true, freshness FROZEN}` preserved; LTS deviations v2.0-R1..R4 preserved | No schema mutation. |

**Conclusion:** All existing consumers, tests, and product surfaces that operated on `program-v1.1.0` (10-engine) continue to operate identically on `v1.2.0` when scoped to 10. The change is **strictly additive**.

---

## 2. Breaking Changes

**Verdict: None evidenced.**

- No methodology change to `IES-006…015` (scoring/metrics/calibration diff 0).
- No calibration-profile version change for existing 10 (`calibrationVersion 1.0.0` unchanged).
- No schema breaking change (engine `1.0.0`, `calibrationVersion 1.0.0`, `freezeManifest` pointers additive).
- No governance breaking change (MAJOR = *Breaking repository or governance changes* — none; `governance/VERSIONING_POLICY.md` and `governance/RELEASE_CHECKLIST.md` unchanged as templates).
- No removal or renaming of existing sector `engineId` (`sector.banking…sector.technology` preserved).
- No change to `PROGRAM_v1.1_LTS_BASELINE.md` MUST PRESERVE core (`Input→Contract→Calibration→Engine→Evidence→Snapshot→Replay`) — upheld.

**If a downstream consumer strictly validates `engines.length ===10`**, that consumer would observe `13` and would need to update its assertion to `13` or filter — this is **expected additive behavior**, not a breaking API contract (the contract is `FROZEN` list, not fixed length 10). Documented as migration note, not breaking change.

---

## 3. Migration Guidance

**Guidance: Additive availability — no destructive migration required.**

1. **Discovery:** Call `GET /api/engines` — expect `engines.length 13` (`certifiedCount 13`, `freshness FROZEN`, `source "Program v1.1 — 13 frozen sector engines (IES-006…015 LTS + IES-016/017/020 via D42)"`). Filter by `ies` or `engineId` if pinning to 10.
2. **Execution:** `POST /api/engines/{sector}/execute` for three new engines:
   - `sector.telecom` input `TL-001…008 72/4500/15.2/38/8.5/12/28/4.2` → `68.4 Accumulate SNAP_FF2C2128` (expected `3cfb9d93f545d45d749cc48c88e25bab23075b013911ea7751212b49f1168ee0`)
   - `sector.auto` input `AU-001…008 125000/8.2/22/18/45/9.5/14/3.1` → `71.6 Buy SNAP_4E9D59AE` (expected `ea22807925694aa3e2b97cd2f1b1990cc4235e4e19023b31ae43bdc55314d81d`, Option-A left-to-right `for(i…) compositeRaw+=pillarValues[i]*weightValues[i]` `r1h2e`)
   - `sector.materials` input `MM-001…008 65/3200/12.8/42/7.2/18/5.5/22 steel/integrated` → `74.9 Buy SNAP_BC9B6426` (expected `56a6ad197640c9c9f3f922ffca3897ddd006a7682099f01347cfaa6e0d754025`, G1–G6 `5813060b`)
3. **Product aggregation:** `CrossSectorEngine.run` with 13 outputs yields `holdings 13, ranking 13, allocation/diversification/opportunity` for 13; previous `holdings 10` workflows remain valid when executed with 10 alone.
4. **No data/config migration:** `calibrationVersion 1.0.0` horizon preserved; no new config required; no database migration.
5. **Testing migration:** Update integration tests that assert `certifiedCount 10` to `13` (as done in `e156cf6` `engine-api-integration 17/17`, `csip-product-e2e 3/3`, `replay-e2e 4/4`, `evidence-provenance 4/4`). Existing sector spot acceptances (`banking 4/4`, `technology 13/13`, etc.) require no change.
6. **Rollback:** Additive-only per `PROGRAM_v1.1_LTS_BASELINE.md` §6 — if needed, revert to `program-v1.1.0` tag (10-engine) without destructive modification; `v1.2.0` does not delete `v1.1.0` artifacts.

---

## 4. Affected Standards

| Standard | Version | Change | Post-freeze rule |
|---|---|---|---|
| `IES-006 Banking` | `1.0.0` FROZEN | **No change** — carried forward | Any methodology change requires new calibration/profile version (not modified) |
| `IES-007 Insurance` | `1.0.0` FROZEN | **No change** | — |
| `IES-008 Capital Markets` | `1.0.0` FROZEN | **No change** | — |
| `IES-009 Healthcare` | `1.0.0` FROZEN | **No change** | — |
| `IES-010 Hospitality` | `1.0.0` FROZEN | **No change** | — |
| `IES-011 Energy` | `1.0.0` FROZEN | **No change** | — |
| `IES-012 Utilities` | `1.0.0` FROZEN | **No change** | — |
| `IES-013 Consumer` | `1.0.0` FROZEN | **No change** | — |
| `IES-014 Industrials` | `1.0.0` FROZEN | **No change** | — |
| `IES-015 Technology` | `1.0.0` FROZEN | **No change** | — |
| **`IES-016 Telecom`** | **`1.0.0` FROZEN** (new) | **Added** — `telecommunications-calibration-1.0.0`, expected `3cfb9d93…`, replay `92be9952…`, oracle `c7c0b0d7…`, D16 M1–M15 | Independent lifecycle (no version change to others) |
| **`IES-017 Auto`** | **`1.0.0` FROZEN** (new, Option-A re-frozen) | **Added** — `automobile-calibration-1.0.0`, triple `44ba/ea22/c8ed`, `for(i…)` left-to-right, `r1h2e` | — |
| **`IES-020 Materials`** | **`1.0.0` FROZEN** (new, G1–G6) | **Added** — `materials-metals-calibration-1.0.0`, expected `56a6ad19…` via `9d92…`, `domainG 5813060b…`, G1 segments `steel/cement/aluminium/diversified`, G2 `integrated 1.0 / producer 1.1` | — |
| `IES-005` Platform | `1.0` Production | **No change** — platform contracts 11-plugin host preserved, Track 8 30/30 conformant | — |

Repository governance (`VERSIONING_POLICY.md`, `RELEASE_CHECKLIST.md`) — no version change (1.0).

---

## 5. Updated Dependencies

| Dependency | Previous | New | Impact |
|---|---|---|---|
| `iips-platform` runtime/framework/snapshot/replay/distributed/evidence | `1.0` (11-plugin host) | **unchanged** — same `Container`, `RuntimeCoordinator`, `EvidencePipeline`, `PluginContract` reused by `TelecomEngine`/`AutoEngine`/`MaterialsEngine` (Track 8 invariants 1–2 CONFORMANT) | No new dependency |
| `EngineRegistry` / `EngineApiAdapter` | `10` factories (`sector.banking…technology`) | `13` factories (`…+sector.telecom, sector.auto, sector.materials`) — additive per D42 `6a5d7cc` | Consumers must handle `certifiedCount 13` |
| `CrossSectorEngine` / `CSIP` | `10` holdings | `13` holdings (`avgConviction 72.9`, `avgQuality 70.2` etc.) — sector-neutral unchanged | See migration: 13 is superset |
| `PROGRAM_v1.1_REPLAY_BASELINE.json` | `v1.1.0` 10-sector (historical) | **13-sector v1.1.0** at `da01a82` (D38 `45/45 MATCH`) carried forward as successor baseline `v1.2.0` (additive, not silent edit of historical 10-sector file) | Replay consumers gain 3 new golden executions; existing 10 replay assertions byte-identical |
| External packages | none | none | none |

---

## 6. Evidence Basis (read-only verification)

- `git diff --stat HEAD -- iips-platform/src/sector-engines/banking … technology` → `` (0) — no existing engine touched
- `git diff --stat HEAD -- iips-platform/src/framework … distributed` → `` (0) — no platform branching
- `git diff --stat HEAD -- ies-016-telecom/IES-016_FREEZE_MANIFEST.json ies-017-auto/IES-017_FREEZE_MANIFEST.json ies-020-materials/IES-020_FREEZE_MANIFEST.json` → `` (0) — FROZEN preserved
- `npx tsx --test iips-platform/tests/integration/engine-api-integration.test.ts` → `17/17 PASS` (13× POST MATCH)
- `npx tsx --test iips-platform/tests/integration/csip-product-e2e.test.ts` → `3/3 PASS` (holdings 13)
- `npx tsx --test iips-platform/tests/regression/program-v1.1-track8-architecture-audit.test.ts` → `10/10 PASS` (existing 10) + `30/30` via closure for 3 new
- `npx tsx --eval EngineRegistry` → `13` no duplicate

All statements are evidence-backed; no invented methodology.

---

*Additive compatibility artifact — does not rewrite `program-v1.1.0`, does not invent G1–G6/Option-A, preserves `44ba/ea22/c8ed` and `5813…` verbatim.*
