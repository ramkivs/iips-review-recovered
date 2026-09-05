# Program v1.2.0 — Release Package Manifest (Release Candidate — Prepublication)

**Version:** `v1.2.0` — **RELEASE CANDIDATE — PREPUBLICATION** (successor MINOR to `program-v1.1.0`)
**Tag (planned):** `program-v1.2.0` — **TAG PLANNED, NOT YET CREATED**
**Canonical preparation commit:** `da01a82c67df9e1043d32c2855c1898be57a5509` (HEAD == origin/main, clean)
**Predecessor LTS:** `program-v1.1.0` (Tag `program-v1.1.0`, 2026-08-09, 10-engine LTS)
**Release model:** **MINOR** — *New published standards / major additions* (`governance/VERSIONING_POLICY.md` / `RELEASES.md`)
**Date (preparation):** 2026-09-05
**Status:** **PREPARATION — NO PUBLICATION** — manifest prepared, not yet archived, not yet tagged, not yet published

This manifest identifies the **exact additive release package** for `v1.2.0` without manufacturing hashes or packaging mutable/unverified artifacts.

---

## 1. 13-Engine Certified Scope (exact)

| # | IES | engineId | Version | Calibration | Freeze Manifest | Status |
|---|---|---|---|---|---|---|
| 1 | IES-006 | `sector.banking` | 1.0.0 | `banking-calibration-1.0.0` | `iips-platform` IES-006 v1.0 | FROZEN |
| 2 | IES-007 | `sector.insurance` | 1.0.0 | `insurance-calibration-1.0.0` | `iips-platform` IES-007 v1.0 | FROZEN |
| 3 | IES-008 | `sector.capital-markets` | 1.0.0 | `capital-markets-calibration-1.0.0` | `iips-platform` IES-008 v1.0 | FROZEN |
| 4 | IES-009 | `sector.healthcare` | 1.0.0 | `healthcare-calibration-1.0.0` | `iips-platform` IES-009 v1.0 | FROZEN |
| 5 | IES-010 | `sector.hospitality` | 1.0.0 | `hospitality-calibration-1.0.0` | `ies-010-hospitality/IES-010_FREEZE_MANIFEST.json` | FROZEN |
| 6 | IES-011 | `sector.energy` | 1.0.0 | `energy-calibration-1.0.0` | `ies-011-energy/IES-011_FREEZE_MANIFEST.json` | FROZEN |
| 7 | IES-012 | `sector.utilities` | 1.0.0 | `utilities-calibration-1.0.0` | `ies-012-utilities/IES-012_FREEZE_MANIFEST.json` | FROZEN |
| 8 | IES-013 | `sector.consumer` | 1.0.0 | `consumer-calibration-1.0.0` | `ies-013-consumer/IES-013_FREEZE_MANIFEST.json` | FROZEN |
| 9 | IES-014 | `sector.industrials` | 1.0.0 | `industrials-calibration-1.0.0` | `ies-014-industrials/IES-014_FREEZE_MANIFEST.json` | FROZEN |
| 10 | IES-015 | `sector.technology` | 1.0.0 | `technology-calibration-1.0.0` | `ies-015-technology/IES-015_FREEZE_MANIFEST.json` | FROZEN |
| 11 | IES-016 | `sector.telecom` | 1.0.0 | `telecommunications-calibration-1.0.0` | `ies-016-telecom/IES-016_FREEZE_MANIFEST.json` | **FROZEN 2026-09-04** |
| 12 | IES-017 | `sector.auto` | 1.0.0 | `automobile-calibration-1.0.0` | `ies-017-auto/IES-017_FREEZE_MANIFEST.json` | **FROZEN 2026-09-04 Option-A** |
| 13 | IES-020 | `sector.materials` | 1.0.0 | `materials-metals-calibration-1.0.0` | `ies-020-materials/IES-020_FREEZE_MANIFEST.json` | **FROZEN 2026-09-04 G1–G6** |

No engine beyond these 13; no `IES-018/019`.

---

## 2. Required Release Artifacts — New Additive (v1.2.0)

| Artifact | Path (additive) | Purpose | Status |
|---|---|---|---|
| Successor LTS Baseline | `program-v1.1-certification/PROGRAM_v1.2_LTS_BASELINE.md` | Defines 13-engine LTS surface, D42 chain, Track 8 30/30, E2E-025→029/E2E-030 `67e89aa`, MUST PRESERVE, backward compat, migration, rollback | **NEW — PREPARED** |
| Release Notes | `program-v1.1-certification/RELEASE_NOTES_PROGRAM_v1.2.0.md` | Version `v1.2.0` MINOR, date, summary, 13-engine scope, IES-016/017/020, certification evidence, compatibility, migration | **NEW — PREPARED** |
| Compatibility & Migration | `program-v1.1-certification/PROGRAM_v1.2.0_COMPATIBILITY_AND_MIGRATION.md` | 5 areas: Backward compat (fully compatible), Breaking changes none, Migration additive, Affected standards 3 new, Updated dependencies none | **NEW — PREPARED** |
| Readiness Certificate (v1.2) | `program-v1.1-certification/PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md` | 13/13 scope, Track 8 30/30, E2E-025 17/17, 026 3/3, 027 4/4+4/4, 028, 029 4/4, E2E-030 delta, deterministic/replay, frozen manifests — **RELEASE CANDIDATE — PREPUBLICATION** | **NEW — PREPARED** |
| Release Checklist Evidence | `program-v1.1-certification/PROGRAM_v1.2_RELEASE_CHECKLIST.md` | Maps `governance/RELEASE_CHECKLIST.md` Phases 1–6 to evidence; Phases 1–5 largely checked, Phase 6 pending, signatures pending | **NEW — PREPARED** |
| Release Package Manifest | `program-v1.1-certification/PROGRAM_v1.2_RELEASE_PACKAGE_MANIFEST.md` | This file — version, commit, scope, artifacts, frozen, certification, tag, release, archive | **NEW — PREPARED** |
| Ledger Entry | `RELEASES.md` additive section `program-v1.2.0 — 13-Engine Successor LTS (RELEASE CANDIDATE — PREPUBLICATION)` | 6 required fields: Version identifier, Release date TBD, Standards 13, Status RC, Summary, Compatibility notes | **MODIFIED ADDITIVELY — PREPARED** |
| README Note | `README.md` additive section | Distinguishes `program-v1.1.0` 10 LTS vs `v1.2.0` 13 RC, TAG PLANNED | **MODIFIED ADDITIVELY — PREPARED** |

No other files modified in this preparation gate.

---

## 3. Frozen Historical Artifacts — Must Remain Untouched (Not Packaged as New Release Assets)

| Artifact | Path | Status | Note |
|---|---|---|---|
| LTS Baseline v1.1.0 | `program-v1.1-certification/PROGRAM_v1.1_LTS_BASELINE.md` | **FROZEN** 10-engine | Preserved verbatim |
| Final Readiness v1.1.0 | `program-v1.1-certification/PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` | **ISSUED** 10/10 `program-v1.1.0` | Preserved |
| Final Status v1.1.0 | `program-v1.1-certification/PROGRAM_v1.1_FINAL_CERTIFICATION_STATUS.md` | **CLOSED / LTS** | Preserved |
| Release Notes v1.1.0 | `program-v1.1-certification/RELEASE_NOTES_PROGRAM_v1.1.0.md` | Tag `program-v1.1.0` | Preserved |
| Governance Templates | `governance/VERSIONING_POLICY.md`, `governance/RELEASE_CHECKLIST.md` | v1.0 | Templates preserved (checklist instance is new, not overwrite) |
| Existing 10-engine implementations | `iips-platform/src/sector-engines/banking…technology` | `git diff 0` | No modification |
| D38 Freeze Manifests | `ies-016-telecom/IES-016_FREEZE_MANIFEST.json`, `ies-017-auto/…`, `ies-020-materials/…` | **FROZEN 2026-09-04** 45/45 MATCH | Preserved |
| Certification Evidence | `docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` (10+ delta `67e89aa`), `IIPS_v3.0_E2E-025_029_DEFERRED_ENGINE_CERTIFICATION.md` (`e156cf6`), `IIPS_v3.0_OPENING_AUTHORITY_DECISION.md` (`6d4dbc1`), `PROGRAM_v1.1_TRACK8_IMPLEMENTATION_CLOSURE.md` (`eee39d3`) | CERTIFIED | Preserved |

Historical `program-v1.1.0` files are **not** included in `v1.2.0` package as new assets — they remain as historical preservation.

---

## 4. Certification Evidence — Basis for Release

| Evidence | Hash / Pin | Status |
|---|---|---|
| D38 Freeze | `3165065` — `ies-016/017/020` `45/45 MATCH` (7/7 explicit +38/38), `PROGRAM_v1.1_REPLAY_BASELINE.json` 13-sector `v1.1.0` | FROZEN |
| D41 Addendum | `ed97606` — `PROGRAM_v1.1_TRACK8_ARCHITECTURE_AUDIT_ADDENDUM.md` `CURRENT/CERTIFIED` 3–10 CONFORMANT | CERTIFIED |
| D42 Authority | `6d4dbc1` — `IIPS_v3.0_OPENING_AUTHORITY_DECISION.md` `A — OPEN ALL THREE` | AUTHORIZED |
| Implementation | `6a5d7cc1747a959a781a12c83336be73b71cb542` — 33 files, Registry `10→13`, Adapter 13, Option-A `44ba/ea22/c8ed` preserved, G1–G6 `5813…` preserved | COMPLETE |
| Track 8 Closure | `eee39d3cdfc7c1e53b82a1bc4446761a5ff6af63` — **30/30 CONFORMANT** (1–2 NOT VERIFIABLE → CONFORMANT) | CERTIFIED |
| E2E-025→029 | `e156cf6a7b33acd727d1d64c0e8021c0bd67343f` — 17/17, 3/3, 4/4, 4/4 | CERTIFIED |
| E2E-030 Delta | `67e89aa52dabb5819e5f7af9c83787546dafdfb7` (fixup `0e362ed`) — **CERTIFIED — 13-ENGINE DELTA** | CERTIFIED |
| D40 Reconciliation | `da01a82c67df9e1043d32c2855c1898be57a5509` — 62 lines, 13-engine current certified scope reconciled | RECONCILED |
| Deterministic Replay | `sector.telecom 68.4 Accumulate SNAP_FF2C2128` (`3cfb9d93…` / `92be9952…` / `c7c0b0d7…`), `sector.auto 71.6 Buy SNAP_4E9D59AE` (`44ba/ea22/c8ed` left-to-right `for(i…)` `r1h2e`), `sector.materials 74.9 Buy SNAP_BC9B6426` (`56a6ad19…` / `9d920fa9…` / `5813…` G1–G6) | VERIFIED |

**Live oracle hashes (frozen):**

- IES-016: expected `3cfb9d93f545d45d749cc48c88e25bab23075b013911ea7751212b49f1168ee0` MATCH, replay `92be99526e498d1378d0a158c42009c05bdc24f181e908d28ff009dae7fd34ca` MATCH, oracle `c7c0b0d70390a2f8cc6073988361b8ab84fdc559d9134e9067392f0719c8e01a`
- IES-017: triple `44ba141957eb78654bce0fe3320a709a812291f35b5b7b6a5f342bfe54f27a25` / `ea22807925694aa3e2b97cd2f1b1990cc4235e4e19023b31ae43bdc55314d81d` / `c8ed26c58dc6d2f7db71caa4d8d959cae843ddff0b9dd4e072856ed2e952428f` all MATCH
- IES-020: expected `56a6ad197640c9c9f3f922ffca3897ddd006a7682099f01347cfaa6e0d754025` MATCH via `9d920fa987b7d042183139dd1fca5634d605f40c5ebcc92f486525c265dde446`, domainG `5813060b1440c2ec61a947eb1e20b920ecb0f540699819b17bf718868e181e63` MATCH, G1–G6 all ACCEPTED

No hashes manufactured; all from D38 manifests and live verification.

---

## 5. Planned Tag & GitHub Release

| Item | Planned Value | Status |
|---|---|---|
| **Version** | `v1.2.0` | **AUTHORIZED** — MINOR successor (human decision) |
| **Tag** | `program-v1.2.0` | **TAG PLANNED, NOT YET CREATED** — per `RELEASE_CHECKLIST.md` Phase 6 `Git tag planned` checked, `Git tag created` pending |
| **Tag convention** | `program-vMAJOR.MINOR.PATCH` — consistent with predecessor `program-v1.1.0` (`RELEASE_NOTES_PROGRAM_v1.1.0.md` Tag `program-v1.1.0`) | Planned |
| **GitHub Release** | `Program v1.2.0 — 13-Engine Successor LTS (Release Candidate)` at tag `program-v1.2.0` — notes = `RELEASE_NOTES_PROGRAM_v1.2.0.md` + compatibility | **NOT YET PUBLISHED** — `RELEASE_CHECKLIST.md` Phase 6 `GitHub Release published` pending |
| **Release branch** | To be finalized at publication gate | **NOT YET FINALIZED** |

**Do NOT create tag or GitHub Release in this preparation gate.**

---

## 6. Archive Contents (Planned)

At publication gate, release archive (e.g., `program-v1.2.0.zip` / `program-v1.2.0.tar.gz`) shall contain **additive `v1.2.0` artifacts** plus **references to frozen historical artifacts** (not duplicates):

**Additive `v1.2.0` artifacts (new):**
- `PROGRAM_v1.2_LTS_BASELINE.md`
- `RELEASE_NOTES_PROGRAM_v1.2.0.md`
- `PROGRAM_v1.2.0_COMPATIBILITY_AND_MIGRATION.md`
- `PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md` (RC → ISSUED at publication)
- `PROGRAM_v1.2_RELEASE_CHECKLIST.md` (checked + signed at publication)
- `PROGRAM_v1.2_RELEASE_PACKAGE_MANIFEST.md` (this file, finalized at publication)
- `PROGRAM_v1.2_REPLAY_BASELINE.json` v1.2.0 **or** addendum referencing `PROGRAM_v1.1_REPLAY_BASELINE.json` 13-sector (to be versioned at publication — see §7)

**Frozen historical preservation (references, not new archive copies):**
- `PROGRAM_v1.1_LTS_BASELINE.md` (10-engine)
- `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` / `PROGRAM_v1.1_FINAL_CERTIFICATION_STATUS.md` / `RELEASE_NOTES_PROGRAM_v1.1.0.md`

**Certification evidence (already committed at `da01a82`, included by reference + hash):**
- `docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` (§12–§13 delta `67e89aa`)
- `docs/integration/IIPS_v3.0_E2E-025_029_DEFERRED_ENGINE_CERTIFICATION.md` (`e156cf6`)
- `program-v1.1-certification/PROGRAM_v1.1_TRACK8_IMPLEMENTATION_CLOSURE.md` (`eee39d3`)
- `docs/integration/IIPS_v3.0_OPENING_AUTHORITY_DECISION.md` (`6d4dbc1`)

No mutable/unverified artifacts packaged.

---

## 7. Checksums / Hashes — Where Already Available (Do Not Manufacture)

- Historical backup: `G:\IIPS\BACKUPS\IIPS WORKSPACE-PF-2…zip` `sha256:23b4b40295fe9d9e3d639fcf8258d3d8178b95fcb78fb136ac958654a67df53c` (8474783 bytes, 1700 entries)
- D38 manifests: see §4 hashes above (all `MATCH`, distinct `recordedHistoricalSha256` vs `newlyCalculatedSha256`, `45/45 MATCH`)
- Implementation commit: `6a5d7cc1747a959a781a12c83336be73b71cb542` (`git diff --stat 6a5d7cc^..6a5d7cc` 33 files)
- Closure: `eee39d3cdfc7c1e53b82a1bc4446761a5ff6af63`
- E2E-025→029: `e156cf6a7b33acd727d1d64c0e8021c0bd67343f` (17/17, 3/3, 4/4, 4/4)
- E2E-030 delta: `67e89aa52dabb5819e5f7af9c83787546dafdfb7` (fixup `0e362ed0bd4a358e60d7bdee441e853d093cee2c`)
- D40 reconciliation: `da01a82c67df9e1043d32c2855c1898be57a5509` (62 lines)
- No new archive checksums yet — to be generated at publication gate via `sha256sum` of final artifacts.

Do not manufacture hashes for artifacts not yet archived.

---

## 8. Publication Boundary

- **Tag `program-v1.2.0` NOT created** — `git tag --list` still only `v3.0-phase12-certified` (verified `git tag --list` at `da01a82`)
- **GitHub Release NOT published** — `gh api repos/.../releases` empty for `v1.2.0`
- **No push of release changes** — new `v1.2.0` files are **untracked preparation artifacts** (`git status` shows `??` for 6 new files, `M` for 2 modified additively)
- **No production promotion** — additive-only, D40 withholds promotion
- **No force-push, no ref move/delete**

---

*Additive release-package manifest — does not manufacture hashes, does not package mutable artifacts, preserves `program-v1.1.0`.*
