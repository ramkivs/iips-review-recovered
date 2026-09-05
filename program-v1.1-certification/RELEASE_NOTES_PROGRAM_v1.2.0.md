# Release Notes — Program v1.2.0 (Release Candidate — Prepublication)

**Version:** `v1.2.0` — **RELEASE CANDIDATE — PREPUBLICATION** (additive successor, not yet tagged/published)
**Tag (planned):** `program-v1.2.0` — **TAG PLANNED, NOT YET CREATED**
**Release type:** **MINOR successor** to `program-v1.1.0` (10-engine LTS) — *New published standards / major additions* per `governance/VERSIONING_POLICY.md` and `RELEASES.md` (MINOR = New engineering standards)
**Canonical preparation commit:** `da01a82c67df9e1043d32c2855c1898be57a5509` (HEAD == origin/main, clean)
**Predecessor:** `program-v1.1.0` (Tag `program-v1.1.0`, 2026-08-09, 10-engine LTS, `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` ISSUED)
**Date:** **2026-09-05**
**Status:** **RELEASE CANDIDATE — PREPUBLICATION** — **PUBLICATION APPROVED — AWAITING PUBLICATION EXECUTION** (sign-off `2026-09-05`, Engineering Reviewer `Ramki`, Repository Maintainer `Sai`, `Approved for Release`). Notes prepared for `v1.2.0`; `program-v1.1.0` remains historical 10-engine LTS and is not rewritten.

---

## Distinction — Historical vs Successor

**Historical `program-v1.1.0` = 10-engine LTS**
- `IES-006 Banking` · `IES-007 Insurance` · `IES-008 Capital Markets` · `IES-009 Healthcare` · `IES-010 Hospitality` · `IES-011 Energy` · `IES-012 Utilities` · `IES-013 Consumer` · `IES-014 Industrials` · `IES-015 Technology` — all `v1.0.0` FROZEN, `calibrationVersion 1.0.0`
- Platform `325/325` · Observability `33/33` · CI/CD `24/24` — Track 8 `10×10` zero blocking non-conformances
- `PROGRAM_v1.1_LTS_BASELINE.md` `LTS BASELINE FROZEN` (10-engine), `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` `ISSUED`

**Successor `v1.2.0` = 13-engine Release Candidate (additive)**
- **Exact 13-engine scope:** `IES-006` · `IES-007` · `IES-008` · `IES-009` · `IES-010` · `IES-011` · `IES-012` · `IES-013` · `IES-014` · `IES-015` · **`IES-016 Telecommunications (sector.telecom)`** · **`IES-017 Automobile (sector.auto)`** · **`IES-020 Materials & Metals (sector.materials)`** — all `1.0.0` FROZEN, `calibrationVersion 1.0.0`, `sector.banking…sector.materials`
- No engine beyond these 13; no `IES-018/019`.
- Additive, not replacement — `program-v1.1.0` preserved verbatim.

---

## What is new in v1.2.0

**Three deferred sector engines — FROZEN, implemented, and certified:**

### IES-016 Telecommunications — `sector.telecom` — `telecommunications-engine-v1.0.0`
- **Methodology:** D16 M1–M15 v1.0 (`ies-016-telecom/IES-016_FREEZE_MANIFEST.json` `FROZEN 2026-09-04`, historical `9bf91d1`)
- **Calibration:** `telecommunications-calibration-1.0.0` (`IES-016 v1.0`)
- **Frozen evidence:** expected `3cfb9d93f545d45d749cc48c88e25bab23075b013911ea7751212b49f1168ee0` MATCH, replay `92be99526e498d1378d0a158c42009c05bdc24f181e908d28ff009dae7fd34ca` MATCH, oracle `c7c0b0d70390a2f8cc6073988361b8ab84fdc559d9134e9067392f0719c8e01a` MATCH, ontology 8/8, `45/45 MATCH`
- **Live verification:** input `TL-001…008 72/4500/15.2/38/8.5/12/28/4.2` → `composite 68.4 Accumulate SNAP_FF2C2128` deterministic, `byteIdentical` replay

### IES-017 Automobile — `sector.auto` — `automobile-engine-v1.0.0`
- **Methodology:** D17 M1–M15 v1.0 + **Option-A left-to-right summation re-frozen** (`ies-017-auto/IES-017_FREEZE_MANIFEST.json` `d51b120`, `preservation: Option-A left-to-right for-loop, not sum()`)
- **Frozen triple:** generator `44ba141957eb78654bce0fe3320a709a812291f35b5b7b6a5f342bfe54f27a25` MATCH, expected `ea22807925694aa3e2b97cd2f1b1990cc4235e4e19023b31ae43bdc55314d81d` MATCH, replay `c8ed26c58dc6d2f7db71caa4d8d959cae843ddff0b9dd4e072856ed2e952428f` MATCH
- **Implementation fidelity:** `AutoScoreEngine.ts` explicit `for (let i=0; i<pillarValues.length; i++) compositeRaw += pillarValues[i]*weightValues[i];` + `r1h2e`, **no `sum()` in code** (only comment)
- **Live verification:** input `AU-001…008 125000/8.2/22/18/45/9.5/14/3.1` → `71.6 Buy SNAP_4E9D59AE` deterministic, triple MATCH

### IES-020 Materials & Metals — `sector.materials` — `materials-metals-engine-v1.0.0`
- **Methodology:** D20 M1–M15 v1.0 + **G1–G6 v1.0** (`ies-020-materials/IES-020_FREEZE_MANIFEST.json` `6355949`, later authority-review governing, `domainG 5813060b1440c2ec61a947eb1e20b920ecb0f540699819b17bf718868e181e63` MATCH)
- **Frozen evidence:** generator `9d920fa987b7d042183139dd1fca5634d605f40c5ebcc92f486525c265dde446` MATCH → expected `56a6ad197640c9c9f3f922ffca3897ddd006a7682099f01347cfaa6e0d754025` MATCH, deterministic regeneration
- **G1–G6:** `segments steel/cement/aluminium/diversified` (G1), `archetypeRisk integrated 1.0 / producer 1.1` (G2), 8 metrics bandMaps (G3), `r1h2e` + lower-inclusive/upper-exclusive (G4), `1.0.0` (G5), ontology 8/8 (G6), sector-neutral CSIP zero change
- **Live verification:** input `MM-001…008 65/3200/12.8/42/7.2/18/5.5/22 steel/integrated` → `74.9 Buy SNAP_BC9B6426` deterministic, `9d92…→56a6…` MATCH

**All three:** `FROZEN` via D38 `3165065`, opened via D42 `6d4dbc1` `A — OPEN ALL THREE`, implemented at `6a5d7cc1747a959a781a12c83336be73b71cb542` (33 files, Registry `10→13`), closed via Track 8 `eee39d3` **30/30 CONFORMANT**.

---

## Certification evidence (carried forward)

- **Platform:** `325/325` PASS · Observability `33/33` PASS · CI/CD `24/24` PASS — unchanged, plus Track 8 10×10 zero blocking non-conformances for 10 LTS
- **Track 8 successor:** `PROGRAM_v1.1_TRACK8_ARCHITECTURE_AUDIT_ADDENDUM.md` `CURRENT/CERTIFIED` (D41 `ed97606`) + `PROGRAM_v1.1_TRACK8_IMPLEMENTATION_CLOSURE.md` `CERTIFIED` at `eee39d3` — **10 invariants ×3 new engines =30/30 CONFORMANT** (former 1–2 NOT VERIFIABLE → CONFORMANT), `EngineRegistry 13` correct, zero regression (`banking 4/4`, `technology 13/13`, `track8 10/10`)
- **E2E-025 Engine API** `engine-api-integration` **17/17 PASS** — Registry 13 `FROZEN`, 13× `POST /api/engines/{sector}/execute` each `COMPLETED` with oracle MATCH (`68.4 Accumulate`, `71.6 Buy`, `74.9 Buy`), error paths `sector.unknown` DENIED
- **E2E-026 Product** `csip-product-e2e` **3/3 PASS** — 13-engine aggregation `holdings 13 avgConviction 72.9`, `no duplicate`, `10-engine holdings 10 unchanged`
- **E2E-027 Replay / Determinism** `replay-e2e` **4/4 PASS** + `evidence-provenance` **4/4 PASS** — `fixed 2026-08-09T00:00:00.000Z` + `deterministic` IdProvider, same `requestId → same SNAP/ev_` + `isIdempotent true`, frozen hashes `3cfb/92be`, `44ba/ea22/c8ed` (Option-A), `56a6/9d92` + `5813…` (G1–G6)
- **E2E-028 Cross-Sector** — sector registration `Telecommunications/Automobile/Materials & Metals` PASS, ontology 8/8 PASS, `git diff` platform 0 + cross-sector 0 (no branching), `CrossSectorEngine 3 holdings 71.6` deterministic, ranking contains 13
- **E2E-029 Evidence Provenance** `evidence-provenance` **4/4 PASS** — chain `D38→D41→D42→6a5d7cc→eee39d3→E2E-025→029` with `source provenance IES-016/017/020 1.0.0 deterministic`, `frozen hashes MATCH`, `calibration provenance 1.0.0`, `implementation provenance 6a5d7cc 33 files`, `deterministic ev_…/SNAP_…` no substitution
- **E2E-030** `IIPS_v3.0_E2E-030_CERTIFICATION.md` — **CERTIFIED — 13-ENGINE DELTA** at `67e89aa` (additive to `286f3da` 10-engine LTS), D40 `da01a82` reconciled control-plane to 13 as current certified scope
- **TypeScript:** `iips-platform: tsc --noEmit` **exit 0**

---

## Compatibility

**Backward compatibility:** **Fully backward compatible.** 10-engine LTS behavior preserved (`git diff --stat HEAD -- iips-platform/src/sector-engines/banking…technology` 0, `10/10` audit PASS). Existing callers pinning `GET /api/engines` 10 remain valid; new callers discover 13.

**Breaking changes:** **None evidenced.** No platform branching, no cross-sector contamination, no CSIP logic change, no taxonomy change (`IT→015, Chemicals→014, Realty→015` held, `422` guard), no frozen-oracle violation.

**Affected standards:** `IES-016 v1.0`, `IES-017 v1.0 (Option-A)`, `IES-020 v1.0 (G1–G6)` — each `FROZEN v1.0` independent lifecycle per `VERSIONING_POLICY.md` (no version change to `IES-005…015`).

**Updated dependencies:** None — reuses `iips-platform` runtime/framework/snapshot/replay/distributed + `CrossSectorEngine` + `EngineApiAdapter` unchanged (13 factories).

---

## Migration guidance

**Additive availability — no destructive migration required:**

- Discover via `GET /api/engines` (now 13, `certifiedCount 13`, `freshness FROZEN`).
- Execute via `POST /api/engines/sector.telecom|sector.auto|sector.materials/execute` with frozen inputs (e.g., above TL/AU/MM) → `COMPLETED` `68.4 Accumulate` / `71.6 Buy` / `74.9 Buy`.
- Product aggregation `CrossSectorEngine.run` now yields `holdings 13` (previously 10) — callers filtering by sector remain unaffected; callers aggregating all holdings observe 3 additional entries.
- No config, calibration, or data migration required; `calibrationVersion 1.0.0` horizon preserved.
- Rollback remains additive-only per `PROGRAM_v1.1_LTS_BASELINE.md` §6 — `program-v1.1.0` (10-engine) remains preserved as historical LTS.

---

## Dependency impact

- No new external dependencies.
- No change to `banking…technology` frozen assets.
- `PROGRAM_v1.1_REPLAY_BASELINE.json` 13-sector (`version 1.1.0` at `da01a82`, to be versioned as `1.2.0` or addendum at publication) carried forward — no new runtime configuration.

---

## Frozen `program-v1.1.0` preservation

- `program-v1.1.0` remains **historical 10-engine LTS** — `PROGRAM_v1.1_LTS_BASELINE.md` (10-engine FROZEN), `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` (`ISSUED` 10/10), `PROGRAM_v1.1_FINAL_CERTIFICATION_STATUS.md` (`CLOSED / LTS`), `RELEASE_NOTES_PROGRAM_v1.1.0.md` (Tag `program-v1.1.0`) — **all preserved verbatim, not rewritten**. This `v1.2.0` is **additive successor**, not replacement.

---

## Release-boundary statement

**This is RELEASE CANDIDATE preparation, not publication.** Tag `program-v1.2.0` is **PLANNED, NOT YET CREATED**; GitHub Release **NOT YET PUBLISHED**; production **NOT PROMOTED**. Publication requires separate **release-execution authority gate** after `RELEASE_CHECKLIST.md` sign-off (see `PROGRAM_v1.2_RELEASE_CHECKLIST.md` / `PROGRAM_v1.2.0_COMPATIBILITY_AND_MIGRATION.md` / `PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md` — all `RELEASE CANDIDATE — PREPUBLICATION`).

*Additive release notes — does not rewrite `program-v1.1.0`, does not invent methodology, preserves D16/D17+Option-A/D20+G1–G6 verbatim.*
