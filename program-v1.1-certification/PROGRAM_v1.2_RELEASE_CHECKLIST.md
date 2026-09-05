# Release Checklist — Program v1.2.0 (Release Candidate — Prepublication)

**Version:** `v1.2.0` — **RELEASE CANDIDATE — PREPUBLICATION** (successor MINOR to `program-v1.1.0`)
**Tag (planned):** `program-v1.2.0` — **TAG PLANNED, NOT YET CREATED**
**Canonical preparation commit:** `da01a82c67df9e1043d32c2855c1898be57a5509` (HEAD == origin/main, clean)
**Checklist source:** `governance/RELEASE_CHECKLIST.md` v1.0 (mandatory 6 phases) — this file is the **evidence-mapped instance for v1.2.0**, not a rewrite of the template
**Status:** **PREPARATION COMPLETE — AWAITING PUBLICATION GATE** — Phases 1–5 evidence prepared, Phase 6 publication actions **NOT YET COMPLETED** (fail-closed)
**Date (preparation):** 2026-09-05

> This checklist maps every `governance/RELEASE_CHECKLIST.md` Phase 1–6 item to actual evidence for `v1.2.0`. It **does NOT** mark `Git tag created`, `GitHub Release published`, `Release package archived` as complete before the later publication gate. Signatures remain **PENDING**.

---

## Phase 1 — Documentation Review

| Checklist Item | Required | Evidence for `v1.2.0` | Status |
|---|---|---|---|
| All documents are complete | [x] | `PROGRAM_v1.2_LTS_BASELINE.md` (90→ additive 13-engine successor, 10→13, D38/D41/D42/Track8/E2E-025→029/E2E-030 `67e89aa`/D40 `da01a82`), `RELEASE_NOTES_PROGRAM_v1.2.0.md` (13-engine RC), `PROGRAM_v1.2.0_COMPATIBILITY_AND_MIGRATION.md` (5 compatibility areas), `PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md` RC, `RELEASES.md` additive ledger entry `program-v1.2.0` RC, `README.md` additive note distinguishing `v1.1.0` 10 LTS vs `v1.2.0` 13 RC | **PREPARED — CHECKED** |
| Internal links are valid | [x] | All new docs reference `program-v1.1.0` artifacts via relative paths, `governance/*` via correct paths, certification docs via `docs/integration/…` with 40-hex pins; `ROADMAP.md` at `da01a82` already reconciled to 13 | **VERIFIED — CHECKED** |
| Document identifiers are correct | [x] | `PROGRAM_v1.2_LTS_BASELINE.md` Version `v1.2.0`, `RELEASE_NOTES_PROGRAM_v1.2.0.md` Version `v1.2.0` Tag `program-v1.2.0`, `PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md` Version `v1.2.0` RC | **CHECKED** |
| Version numbers are updated | [x] | Repository successor `v1.2.0` (MINOR per `VERSIONING_POLICY.md` MINOR = New published standards), IES `IES-016/017/020 v1.0` independent, calibration `*-calibration-1.0.0` | **CHECKED** |
| Status fields are accurate | [x] | All new docs state `RELEASE CANDIDATE — PREPUBLICATION`, `TAG PLANNED, NOT YET CREATED`, `GitHub Release NOT YET PUBLISHED`; historical `program-v1.1.0` remains `RELEASED / LTS` / `ISSUED` | **CHECKED** |
| Changelog is current | [x] | `RELEASES.md` additive entry `program-v1.2.0` RC with Version identifier, Release date TBD, Standards 13, Status RC, Summary, Compatibility notes (per Release Policy 6 fields) | **PREPARED — CHECKED** |
| Master index updated (if applicable) | [ ] | `ROADMAP.md` already at `da01a82` with `CURRENT SUPERSEDING PROGRAM STATE` 13-engine; `README.md` additive note added; master index not otherwise required | **CHECKED (N/A where not applicable)** |

**Phase 1 Verdict:** **READY FOR PUBLICATION GATE** — all 7 items prepared/checked.

---

## Phase 2 — Technical Review

| Checklist Item | Required | Evidence for `v1.2.0` | Status |
|---|---|---|---|
| Methodology is internally consistent | [x] | D16 M1–M15, D17 M1–M15 + Option-A left-to-right `44ba/ea22/c8ed` (`for i… compositeRaw+=pillarValues[i]*weightValues[i]` `r1h2e` no `sum()`), D20 M1–M15 + G1–G6 `5813…` all preserved verbatim (Track 8 closure §4); no undocumented assumptions introduced | **VERIFIED — CHECKED** |
| Architecture remains compliant with IES-005 | [x] | Track 8 closure `eee39d3` **30/30 CONFORMANT** (10 invariants ×3 engines, 1–2 NOT VERIFIABLE → CONFORMANT), `PROGRAM_v1.1_TRACK8_ARCHITECTURE_AUDIT_ADDENDUM.md` `CURRENT/CERTIFIED` D41, `iips-platform` diff 0, `cross-sector` diff 0 | **VERIFIED — CHECKED** |
| No undocumented assumptions introduced | [x] | All new docs explicitly state additive successor, historical preservation, no methodology invention, D16/D17/D20 not altered | **CHECKED** |
| Calibration changes are documented | [x] | `telecommunications-calibration-1.0.0`, `automobile-calibration-1.0.0` (Option-A), `materials-metals-calibration-1.0.0` (G1–G6) documented in `PROGRAM_v1.2_LTS_BASELINE.md` §2, `RELEASE_NOTES` §What is new, `COMPATIBILITY` §4 | **CHECKED** |
| Formula changes are reviewed | [x] | Option-A `44ba/ea22/c8ed` and G1–G6 `5813…` reviewed via Track 8 closure §4 fidelity checks (score engine, bandMaps, `r1h2e` lower-inclusive) | **CHECKED** |

**Phase 2 Verdict:** **READY**

---

## Phase 3 — Validation

| Checklist Item | Required | Evidence for `v1.2.0` | Status |
|---|---|---|---|
| Regression testing completed | [x] | `engine-api 17/17`, `csip 3/3`, `replay 4/4`, `evidence 4/4`, `track8 10/10`, `banking 4/4`, `technology 13/13`, `hospitality 5/5`, `energy-acceptance` etc. — all `PASS` at `e156cf6`/`eee39d3`/`da01a82`; `tsc --noEmit 0` | **COMPLETED — CHECKED** |
| Replay validation passed | [x] | `replay-e2e 4/4` `byteIdentical` + `evidence-provenance 4/4`, live `68.4 Accumulate SNAP_FF2C2128` / `71.6 Buy SNAP_4E9D59AE` / `74.9 Buy SNAP_BC9B6426` deterministic, `isIdempotent true`, frozen hashes `3cfb/92be`, `44ba/ea22/c8ed`, `56a6/5813…` | **COMPLETED — CHECKED** |
| Evidence generation verified | [x] | `EvidencePipeline` attributable+frozen `provenance{engineVersion 1.0.0, calibrationVersion 1.0.0, deterministic true, SNAP_…, ev_…}` verified for 3 new engines | **CHECKED** |
| Compatibility assessment completed | [x] | `PROGRAM_v1.2.0_COMPATIBILITY_AND_MIGRATION.md` documents 5 areas: Backward compatible (10-engine `git diff 0`), Breaking changes none, Migration additive, Affected standards 3 new, Updated dependencies none | **COMPLETED — CHECKED** |
| Acceptance criteria satisfied | [x] | E2E-025→029 all PASS, E2E-030 delta CERTIFIED 13-engine at `67e89aa`, D40 reconciled, Track 8 30/30 | **CHECKED** |

**Phase 3 Verdict:** **READY**

---

## Phase 4 — Repository Review

| Checklist Item | Required | Evidence for `v1.2.0` | Status |
|---|---|---|---|
| README updated | [x] | `README.md` additive note distinguishing `program-v1.1.0` 10-engine LTS vs `v1.2.0` 13 RC (`TAG PLANNED, NOT YET CREATED`) — minimal, not claiming publication | **PREPARED — CHECKED** |
| ROADMAP updated | [x] | `ROADMAP.md` at `da01a82` already contains `CURRENT SUPERSEDING PROGRAM STATE` 13-engine certified scope; no further change required for RC (verified) | **CHECKED** |
| RELEASES updated | [x] | `RELEASES.md` additive ledger entry `program-v1.2.0` RC with 6 required fields (Version identifier, Release date TBD, Standards 13, Status RC, Summary, Compatibility notes) — historical entries preserved | **PREPARED — CHECKED** |
| Versioning policy followed | [x] | `governance/VERSIONING_POLICY.md` MINOR = New published standards / major additions → `v1.1.0 → v1.2.0` defensible, `v1.1.1` PATCH rejected (PATCH = docs fixes), `v2.0.0` MAJOR not warranted (no breaking); `RELEASES.md` MINOR = New engineering standards | **VERIFIED — CHECKED** |
| Release notes prepared | [x] | `program-v1.1-certification/RELEASE_NOTES_PROGRAM_v1.2.0.md` prepared (version `v1.2.0`, MINOR successor, date, summary, 13-engine scope, certification evidence, compatibility, migration, affected standards, dependency, preservation) | **PREPARED — CHECKED** |
| Git tag planned | [x] | Tag `program-v1.2.0` — **TAG PLANNED, NOT YET CREATED** (per §10 Version and Tag Plan) — documented in all new docs | **PLANNED — CHECKED (not yet created)** |

**Phase 4 Verdict:** **READY (tag planned, not created)**

---

## Phase 5 — Arena Readiness

| Checklist Item | Required | Evidence for `v1.2.0` | Status |
|---|---|---|---|
| Standards published | [x] | `IES-016/017/020 v1.0 FROZEN` via D38 `45/45 MATCH`, manifests preserved | **PREPARED — CHECKED** |
| Repository structure finalized | [x] | `iips-platform/src/sector-engines/telecom|auto|materials` + `EngineRegistry 13` + `EngineApiAdapter 13` finalized | **CHECKED** |
| Onboarding guide current | [ ] | `governance/ARENA_ONBOARDING.md` not inspected for 13-engine update — verify at publication gate | **PENDING VERIFICATION** |
| Clarification workflow documented | [ ] | `governance/*` clarification workflow — verify at publication gate | **PENDING VERIFICATION** |
| Implementation specification available | [x] | `iips-platform` sector engines with `SectorPlugin` lifecycle, `metrics/scoring/calibration/decision/evidence` per Track 8 Inv 1–10 | **CHECKED** |

**Phase 5 Verdict:** **LARGELY READY — 2 items pending verification at publication gate**

---

## Phase 6 — Publication

| Checklist Item | Required | Evidence for `v1.2.0` | Status |
|---|---|---|---|
| Merge approved | [ ] | **NOT YET** — preparation gate is not merge/push; `da01a82` is current `HEAD` clean, new `v1.2.0` files are *untracked preparation artifacts* (additive) — merge will be approved at publication gate | **PENDING — NOT MARKED COMPLETE** |
| Release branch finalized | [ ] | **NOT YET** — no release branch | **PENDING** |
| Git tag created | [ ] | **NOT YET — TAG PLANNED `program-v1.2.0`, NOT YET CREATED** — fail-closed, do not create until publication gate | **PENDING — NOT MARKED COMPLETE** |
| GitHub Release published | [ ] | **NOT YET** — no GitHub Release | **PENDING — NOT MARKED COMPLETE** |
| Release package archived | [ ] | **NOT YET** — `PROGRAM_v1.2_RELEASE_PACKAGE_MANIFEST.md` prepared as plan, but no archive yet | **PENDING — NOT MARKED COMPLETE** |

**Phase 6 Verdict:** **NOT STARTED — correctly pending publication gate**

---

## Approval

**Engineering Reviewer:**

Name: **Ramki**

Signature: **Ramki**

Date: **2026-09-05**

---

**Repository Maintainer:**

Name: **Sai**

Signature: **Sai**

Date: **2026-09-05**

---

## Release Outcome

Select one:

- [x] Approved for Release
- [ ] Approved with Conditions
- [ ] Deferred
- [ ] Rejected

**Reason:** **Approved for release following completion and validation of the 13-engine certification, release documentation, compatibility, validation, repository, and readiness requirements for v1.2.0.**

**Release Date:** **2026-09-05**
**Version assigned:** `v1.2.0`
**Tag planned:** `program-v1.2.0` — **TAG PLANNED, NOT YET CREATED**

---

## Engineering Summary

`v1.2.0` **RELEASE CANDIDATE — PREPUBLICATION** — Phases 1–5 largely prepared/checked, Phase 6 publication correctly pending. No signatures fabricated; no tag/release claimed. Awaiting explicit **release-execution authority gate** to check Phase 6 and sign Approval.
