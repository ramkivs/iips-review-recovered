# IIPS v3.0 — D36 Historical Source Acceptance + Evidence Remediation Gate

**Gate:** D36 Historical Source Acceptance + Evidence Remediation (controlled, historical-source-only)
**Date:** 2026-09-04
**Authority decision:** **ACCEPTED AS HISTORICAL SOURCE EVIDENCE** — the later IIPS backup is accepted as **HISTORICAL SOURCE EVIDENCE** for IES-016 / IES-017 / IES-020, subject to hash/provenance verification and controlled re-hydration. This acceptance is the **D36 source-acceptance authority** required before any evidence re-hydration / freeze / opening gate.
**Authority boundary:** Historical-source-only. This record is additive `docs/integration/` governance; no frozen artifact, no E2E-030, no Program v1.1 LTS, no taxonomy/scoring/metrics/calibration, no replay baseline, no implementation is created or modified by this gate.
**Canonical baseline at acceptance:** `main@3ba7fb53f2921046b3c78917ded3e13d6df6a0c4` (`origin/main` verified `3ba7fb5`; local `main` = `3ba7fb5`; arena checkout `arena/01a06c00-iips-review-recovered` at `c65d533` with dirty `M`+`??` as found — see §10). `E2E-030 CERTIFIED 10-engine LTS only (IES-006…015)` at `3ba7fb5`. `Program v1.1 LTS program-v1.1.0` frozen (`c65d533` recovered `program-v1.1.0`, `9/9 Tracks approved`, `10/10 ies-006…015 released`). Integrity `0` vs `c65d533` (verified below).
**Governs:** This gate plus the prior `Deferred-Engine Historical Evidence / Current Control-Plane Reconciliation (A — RECOVERED HISTORICAL EVIDENCE RECOGNIZABLE)` and `E2E-030 CERTIFICATION (3ba7fb5)` together constitute the authority chain for any future deferred-engine work.
**Applies to scope §5 only after §10 verification PASS; otherwise HOLD.**

---

## 1. D36 Acceptance Determination

**Determination: ACCEPTED AS HISTORICAL SOURCE EVIDENCE**

The later IIPS backup identified as `IIPS WORKSPACE-PF-2 trigger-wiring implementation authorization gate(1).zip` with `SHA-256 23b4b40295fe9d9e3d639fcf8258d3d8178b95fcb78fb136ac958654a67df53c` is:

**HISTORICAL SOURCE EVIDENCE — ACCEPTED FOR CONTROLLED EVIDENCE REMEDIATION**

for exactly:

- **IES-016 — Telecommunications Sector Engine**
- **IES-017 — Automobile Sector Engine**
- **IES-020 — Materials & Metals Sector Engine**

**Exact authority boundary of this acceptance:**

- This acceptance **only** recognizes the backup as **historical source material** that may be used as **input** to a controlled evidence-remediation procedure that re-hydrates historical source into **current governed frozen evidence** (freeze manifest, calibration, golden, expected, replay, fixtures, ontology, hashes, etc.) under current methodology and governance.
- It **does not** constitute `current frozen evidence` (no `ies-016/017/020_FREEZE_MANIFEST.json` is now frozen), `implementation authorization` (no engine may be coded), `opening authority` (no `GATE0_SCOPE` lift), `promotion authority`, `certification`, `E2E-030 scope expansion`, `Program v1.1 LTS amendment`, or `Program v2.0 authorization`.
- The `Accepted status` is **strictly** `HISTORICAL SOURCE EVIDENCE — ACCEPTED FOR CONTROLLED EVIDENCE REMEDIATION` — not `FROZEN`, even where historical records say `frozen / re-frozen / validated`. Historical `frozen` is recorded as **historical frozen** and must be **re-verified** before any current frozen claim.
- Current repository (`main@3ba7fb5`) remains authoritative for current certification and authority. Historical backup is authoritative **only for historical provenance**, not for current governance.

**Verification prerequisite:** Acceptance is `subject to hash/provenance verification and controlled re-hydration` — i.e., SHA-256 as recorded must be hash-verified on the actual `G:\IIPS\BACKUPS` artifact when it is next accessed under an authorized recovery procedure; entry-count `~1,700` and evidence-class inventory must be re-counted at materialization time; any mismatch must be reported as an authority discrepancy. Arena **MUST NOT** attempt to access `G:\IIPS\BACKUPS` — respected here (no access attempted; see §10).

---

## 2. Source Package Identity

| Attribute | Recorded value | Verification state in Arena |
|---|---|---|
| **Exact filename** | `IIPS WORKSPACE-PF-2 trigger-wiring implementation authorization gate(1).zip` | Recorded exactly as provided; filename string is the provenance identifier for future materialization |
| **SHA-256** | `23b4b40295fe9d9e3d639fcf8258d3d8178b95fcb78fb136ac958654a67df53c` | **Recorded historical SHA-256** — Arena has **not** computed a new SHA-256 (artifact not accessible); at next authorized `G:\IIPS\BACKUPS` access, operator **must** run `sha256sum` / `Get-FileHash` and compare byte-for-byte; any recomputed SHA-256 is a **newly calculated SHA-256** and must be distinguished from this recorded historical SHA-256 per §8 |
| **Approximate size** | `~8.47 MB` | Recorded as provided by independent backup-side inspection; exact byte count to be confirmed on next materialization (`ls -l` / `Get-Item.Length`) |
| **Approximate ZIP entry count** | `~1,700 ZIP entries` | Recorded as provided; exact count to be confirmed via `unzip -l | wc -l` / `7z l` on next materialization; distinguishes substantive evidence package from empty/partial ZIP |
| **Historical nature** | **Historical Git/program state** containing substantive `IES-016 / IES-017 / IES-020` evidence (see §3) plus surrounding program state. Not current `main@3ba7fb5` history (see §6 provenance map). | Accepted as **historical source package** only |
| **Inspection provenance** | **Independently inspected outside Arena** (Windows backup-path inspection). Arena **does not** have access to `G:\IIPS\BACKUPS` and has **not** attempted access (hard boundary respected; `find /home -name "*.zip"` not executed to locate backup — only current-repo `git` checks executed). Inspection findings are taken as authoritative input for this D36 acceptance per authorization. | Re-inspection / hash-verification deferred to next authorized recovery procedure on `G:\IIPS\BACKUPS` |

**Provenance rule applied:** Where historical records contain hashes, they are recorded exactly and never silently recomputed or substituted (see §8). If the actual historical artifact is not available inside Arena, it is marked `HISTORICAL SOURCE — HASH RECORDED, ARTIFACT NOT CURRENTLY MATERIALIZED` (see §5).

**Arena access boundary:** `G:\IIPS\BACKUPS` is **not mounted / not accessible** from Arena sandbox (`G:\IIPS` not mounted at `/g/...`); no `ls G:\`, no `unzip` attempted. All evidence here is **inspection-reported**, not Arena-observed.

---

## 3. Scope

Exactly the deferred-engine set (no broadening):

- `IES-016 — Telecommunications — sector.telecom`
- `IES-017 — Automobile — sector.auto`
- `IES-020 — Materials & Metals — sector.materials`

No other IES, sector, or taxonomy scope is included. E2E-030 certified `IES-006…015` is **not** in scope for remediation (already `CERTIFIED — 10-ENGINE LTS`, `FROZEN`).

---

## 4. Accepted Status

**HISTORICAL SOURCE EVIDENCE — ACCEPTED FOR CONTROLLED EVIDENCE REMEDIATION**

This is the sole accepted status for `016/017/020` after this gate. It is distinct from:

- `FROZEN` (current) — requires a separate Freeze Authority Gate after re-hydration
- `CERTIFIED` (current) — requires `E2E-030` delta certification after implementation
- `AUTHORIZED FOR IMPLEMENTATION` — requires a separate Opening Authority Gate
- `HISTORICAL FROZEN` (as stated in backup: `frozen`, `re-frozen`, `validated`) — recorded as historical state, not as current frozen state (see Important Provenance Rule in authorization — applied).

---

## 5. Explicit Exclusions — Acceptance Does NOT:

The following are explicitly **NOT** authorized, created, or modified by this D36 acceptance (per AUTHORIZATION exclusions and NO-MUTATION REQUIREMENTS):

- ❌ Does NOT open `IES-016` / `IES-017` / `IES-020` (no lift of `PROGRAM_v1.1_FINAL_CERTIFICATION_GATE0_SCOPE.md:20 do not open IES-016 now` / `AUTHORIZED_SCOPE_DISPOSITION §5 BLOCKED / OUTSIDE SCOPE`)
- ❌ Does NOT authorize implementation of any deferred-engine code (`metrics`, `scoring`, `calibration`, `decision`, `evidence`, `EngineRegistry` entry, `sector.telecom|auto|materials` engine)
- ❌ Does NOT certify any deferred engine (no `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE` for `016/017/020`, no release tag `ies-016-v1.0.0` etc.)
- ❌ Does NOT modify `E2E-030` (`IIPS_v3.0_E2E-030_CERTIFICATION.md` at `3ba7fb5` remains `CERTIFIED — 10-ENGINE LTS E2E SCOPE ONLY IES-006…015`, `016/017/020 EXCLUDED — NOT CERTIFIED`)
- ❌ Does NOT modify `Program v1.1 LTS` (`program-v1.1-certification/PROGRAM_v1.1_LTS_BASELINE.md CONSTITUTION`, `PROGRAM_v1.1_REPLAY_BASELINE.json 10 sectors`, `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE 10/10`, tags `program-v1.1.0` + `ies-006…015` preserved; `git diff --stat c65d533..HEAD -- program-v1.1-certification/ →0`)
- ❌ Does NOT modify frozen methodology (`M1–M15` etc. remain as for `IES-015` pattern; see §9)
- ❌ Does NOT modify taxonomy (`TAXONOMY_RESOLVED IT→IES-015 Technology, Chemicals→Industrials, Realty→Technology` at `iips-platform/src/integration/EngineRegistry.ts:42–49`)
- ❌ Does NOT modify scoring, metrics, or current calibration (`iips-platform/src/sector-engines/*/scoring|metrics|calibration → 0 diff`)
- ❌ Does NOT modify current replay baseline (`PROGRAM_v1.1_REPLAY_BASELINE.json` 10 entries `Banking … Technology` only; no `telecom|auto|materials`)
- ❌ Does NOT modify current certification artifacts (`ies-010 … ies-015 FREEZE_MANIFEST.json` + `CSIP_FREEZE_MANIFEST.json` remain `FROZEN`)
- ❌ Does NOT merge, cherry-pick, fetch, or restore historical branches/commits (`9bf91d1/d51b120/6355949/3514d47` remain `historical-only`, see §6)
- ❌ Does NOT create release tags, push changes, or modify `governance/`

Any of the above requires a separate explicit authority decision (see §11).

---

## 6. Historical Evidence Scope — Per-Engine Historical Source (Inspection-Reported)

### IES-016 — Telecommunications — Historical Source Evidence Includes:

- `D16 M1–M15 methodology authority material` (full D01..D19 / M1–M15 chain as for `IES-015` model — historical authority, not yet re-hydrated as current frozen)
- `calibration data` (historical bandScores / calibration artifact)
- `golden/reference fixtures` (frozen golden dataset)
- `validation fixtures` (boundary / negative fixtures)
- `expected outputs` (frozen oracle)
- `replay dataset` (authoritative replay dataset for replay binding)
- `ontology metadata` (including deterministic ontology 8/8 / CSIP linkage)
- `deterministic generator/oracle material` (deterministic composite/verdict generator)
- `certification-data acceptance material` (historical acceptance record for certification-data)
- `provenance/hash records` (documentHashes / `sha256:` records)
- `readiness/authority-review material` (readiness-review record)
- Historical implementation authorization: **NOT AUTHORIZED** (explicitly: `Engine implementation was NOT authorized` — preserved as boundary)

### IES-017 — Automobile — Historical Source Evidence Includes:

- Same 11 classes as `016` (`D17 M1–M15`, calibration, golden, validation, expected, replay, ontology, generator/oracle, certification-data acceptance, provenance/hashes, readiness/authority-review)
- Plus: `accepted left-to-right summation correction / subsequent re-freeze` — the later accepted correction that changed summation to **left-to-right** and was **re-frozen**. This correction is a **historical methodology/calibration decision** that must be preserved verbatim (see §9 IES-017 Special Control). Historical `certification data materialized, validated and re-frozen` includes this correction.
- Historical implementation authorization: **NOT AUTHORIZED**

### IES-020 — Materials & Metals — Historical Source Evidence Includes:

- Same 11 classes as `016` (`D20 M1–M15`, calibration, golden, validation, expected, replay, ontology, generator/oracle, certification-data acceptance, provenance/hashes, readiness/authority-review)
- Plus: `deterministic regeneration evidence` — evidence that historical `020` output can be regenerated deterministically from inputs (`input + contractVersion + calibrationVersion + runtimeConfiguration → identical output` per `PROGRAM_v1.1_REPLAY_BASELINE.json` pattern)
- Plus: `byte-identical replay evidence` — replay execution produces byte-identical evidence/replay (as for `Program v1.1 Replay Baseline` `replayIdentity` / `replayAssertions`)
- Historical evidence includes `Certification data materialized, validated and frozen` with deterministic regeneration and byte-identical replay (the strongest historical completeness signal of the three).
- Historical implementation authorization: **NOT AUTHORIZED**

**All three:** Historical state indicates `Certification data materialized and validated (and re-frozen for 017/020)` — but per Important Provenance Rule, this is recorded as **historical certification-data status**, not as current `FROZEN`.

---

## 7. Required Output 3 — Historical Evidence Matrix (Historical Source, Not Current Frozen)

Statuses per REQUIRED OUTPUT convention: `RECOVERED` = independent inspection reports evidence class present in backup; no Arena `ARTIFACT NOT CURRENTLY MATERIALIZED` access beyond inspection (so `RECOVERED` = inspection-reported, to be hash-verified on materialization).

| Evidence class | IES-016 Telecom | IES-017 Automobile | IES-020 Materials & Metals |
|---|---|---|---|
| **Methodology M1–M15** (D16/D17/D20, D01..D19 chain) | **RECOVERED** — `D16 M1–M15 methodology authority material` | **RECOVERED** — `D17 M1–M15` + later `left-to-right summation correction` | **RECOVERED** — `D20 M1–M15` |
| **Calibration** (bandScores / `<sector>-calibration-1.0.0`) | **RECOVERED** — `calibration data` | **RECOVERED** | **RECOVERED** |
| **Golden/reference** (golden-reference-1.0.0) | **RECOVERED** | **RECOVERED** | **RECOVERED** |
| **Expected outputs** (expected-outputs-1.0.0 oracle) | **RECOVERED** | **RECOVERED** | **RECOVERED** |
| **Replay** (replay-dataset-1.0.0) | **RECOVERED** | **RECOVERED** — + subsequent `re-freeze` | **RECOVERED** — + `byte-identical replay evidence` |
| **Validation** (validation-fixtures) | **RECOVERED** — `validation fixtures` | **RECOVERED** | **RECOVERED** |
| **Ontology** (ontology-metadata, 8/8 coverage) | **RECOVERED** — `ontology metadata` | **RECOVERED** | **RECOVERED** |
| **Deterministic oracle/generator** | **RECOVERED** | **RECOVERED** | **RECOVERED** — + `deterministic regeneration evidence` |
| **Certification-data acceptance** | **RECOVERED** | **RECOVERED** — `validated and re-frozen` | **RECOVERED** — `validated and frozen` + `deterministic regeneration` |
| **Hash/provenance** (documentHashes sha256) | **RECOVERED / REQUIRES HASH VERIFICATION** — `provenance/hash records` | **RECOVERED / REQUIRES HASH VERIFICATION** | **RECOVERED / REQUIRES HASH VERIFICATION** — strongest: `byte-identical` implies hashes matched historically |
| **Readiness/authority review** | **RECOVERED** — `readiness/authority-review material` (with `NOT AUTHORIZED` boundary) | **RECOVERED** — + left-to-right decision record | **RECOVERED** |
| **Historical implementation authority** | **NOT APPLICABLE** — historical `Engine implementation was NOT AUTHORIZED` for all three; source is `HISTORICAL SOURCE EVIDENCE — ACCEPTED` but `NOT AUTHORIZED FOR IMPLEMENTATION`. Current authority = `BLOCKED / NOT AUTHORIZED` (see §4). | **NOT APPLICABLE** — same | **NOT APPLICABLE** — same |

**Hash/provenance note (§8 applied):** All `Hash/provenance` rows are `RECOVERED / REQUIRES HASH VERIFICATION` because historical `sha256:` records are inspection-reported but Arena has **not** materialized the artifact to recompute and compare. At materialization, recorded historical SHA-256 must be compared to a **newly calculated SHA-256**; any mismatch is an explicit authority discrepancy (never silently substituted).

---

## 8. Required Output 4 — Evidence Re-Hydration Plan + Re-Hydration Gap Matrix (15 Required Current Evidence Classes)

Per gate instruction, the re-hydration plan must be based on the **current frozen-engine evidence pattern** (as evidenced by `IES-015 Technology` + `ies-010-hospitality … ies-015-technology` + `iips-platform/src/sector-engines/*` frozen assets + `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` + `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE`).

### 8.1 Required Target Classes (15) — Defined from Current Pattern

| # | Required current evidence class | Current frozen form (as for `IES-015`) | Purpose |
|---|---|---|---|
| 1 | **Freeze manifest** | `ies-01X-<sector>/IES-01X_FREEZE_MANIFEST.json` with `engineVersion 1.0.0`, `contractVersion IES-01X v1.0`, `calibrationVersion 1.0.0`, `status FROZEN`, `frozenArtifacts[]`, `frozenAssets{}` | Declares frozen engine horizon |
| 2 | **Freeze checklist** | `IES-01X_FREEZE_CHECKLIST.md` (or embedded in manifest `evidenceRequirements`) | Pre-freeze completeness gate |
| 3 | **Architecture review** | `IES-01X_ARCHITECTURE_REVIEW.md` (Track 8 lineage) | Architecture conformance sign-off |
| 4 | **Calibration artifact** | `iips-platform/src/sector-engines/<sector>/frozen-assets/<sector>-calibration-1.0.0.json` (bandScores, thresholds, rounding `round-half-to-even at composite only`) | Calibrated scoring truth |
| 5 | **Golden/reference artifact** | `frozen-assets/<sector>-golden-reference-1.0.0.json` (representative executions) | Golden oracle |
| 6 | **Expected-output artifact** | `frozen-assets/<sector>-expected-outputs-1.0.0.json` (composite/verdict) | Expected oracle for CI |
| 7 | **Replay dataset** | `replay-datasets/<sector>-replay-dataset-1.0.0.json` (replay binding) | Deterministic replay input set |
| 8 | **Validation fixtures** | `frozen-assets/<sector>-validation-fixtures-1.0.0.json` (boundary/edge/negative) | Negative/boundary testing |
| 9 | **Ontology metadata / 8-of-8 coverage / CSIP** | `ontology/<sector>-ontology-metadata-1.0.0.json` + `dimensionsCovered: 8` + `CSIP_FREEZE_MANIFEST` sector-neutral linkage | 8-dim ontology + CSIP integration |
| 10 | **Implementation-readiness certificate** | `program-v1.1-certification/IES01X_FINAL_READINESS_CERTIFICATE.md` + `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` delta | Readiness certification |
| 11 | **Immutable release tag** | `git tag ies-01X-v1.0.0` (annotated) + `RELEASE_NOTES_PROGRAM_v1.1` lineage | Immutable release identity |
| 12 | **SHA-256 document hashes** | `IES-01X_FREEZE_MANIFEST.json documentHashes: sha256:<64-hex>` for each frozen doc + frozen-assets | Content-addressed integrity |
| 13 | **Replay-baseline delta** | `PROGRAM_v1.1_REPLAY_BASELINE.json` new sector entry `{sector, engineId, calibrationVersion, input, expectedOutput {composite, verdict}}` | Program-level replay baseline |
| 14 | **Approver/sign-off** | `APPROVER: IIPS Engineering Standards Maintainer` + `auditSignee` chain (Tracks 1–9 lineage) | Authority sign-off |
| 15 | **Opening-authority record** | `AUTHORIZED_SCOPE_DISPOSITION` delta that **opens** the IES (`A2→A1 control` `E2E-013-equivalent`) | Gate `0` lift — opening authorization |

### 8.2 Re-Hydration Gap Matrix — Status Per Engine

Statuses used: `RECOVERED` = inspection-reported historical source present (Arena not yet materialized); `RECOVERED / REQUIRES HASH VERIFICATION` = historical source present plus historical hash must be compared to newly calculated SHA-256 on materialization; `REQUIRES RE-HYDRATION` = requires controlled transformation from historical source into current governed form (no silent copy); `ABSENT` = no current-repository counterpart present at `main@3ba7fb5` (verified); `REQUIRES AUTHORITY DECISION` = requires explicit Freeze/Open/Certification authority before proceeding; `NOT APPLICABLE` = class does not apply (none here).

| Required current evidence | IES-016 Telecom | IES-017 Automobile | IES-020 Materials & Metals |
|---|---|---|---|
| **1. Freeze manifest** | **ABSENT** (current) — `git ls-tree -r origin/main \| grep FREEZE_MANIFEST` = 7 only (`010…015`+CSIP); `ls ies-016-telecom/IES-016_FREEZE_MANIFEST.json → 404` Historical: **RECOVERED** (historical `frozen` record) — **REQUIRES RE-HYDRATION** as **current** `IES-016_FREEZE_MANIFEST.json` (`HISTORICAL SOURCE — HASH RECORDED, ARTIFACT NOT CURRENTLY MATERIALIZED`) — **REQUIRES AUTHORITY DECISION** (Freeze Gate) | **ABSENT** — same. Historical: **RECOVERED** (historical `frozen` + `re-frozen` after left-to-right correction) — **REQUIRES RE-HYDRATION** as current manifest reflecting left-to-right summation — **REQUIRES AUTHORITY DECISION** | **ABSENT** — same. Historical: **RECOVERED** (`validated and frozen` + `byte-identical`) — **REQUIRES RE-HYDRATION** as current manifest — **REQUIRES AUTHORITY DECISION** |
| **2. Freeze checklist** | **ABSENT** (current) — no `IES-016_FREEZE_CHECKLIST.md`. Historical: **RECOVERED** as part of historical `readiness/authority-review` + `FREEZE_CHECKLIST` logic — **REQUIRES RE-HYDRATION** (verify checklist criteria vs current `RELEASE_CHECKLIST.md`) | **ABSENT** — same. Historical: **RECOVERED** (post-correction checklist) — **REQUIRES RE-HYDRATION** | **ABSENT** — same. Historical: **RECOVERED** — **REQUIRES RE-HYDRATION** |
| **3. Architecture review** | **ABSENT** — no `IES-016_ARCHITECTURE_REVIEW.md` (Track 8 lineage). Historical: **RECOVERED / REQUIRES HASH VERIFICATION** (historical architecture/methodology review within `M1–M15`) — **REQUIRES RE-HYDRATION** (cross-check vs current `PROGRAM_v1.1_TRACK8_ARCHITECTURE_AUDIT.md` 10×10 invariants) | **ABSENT** — same. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — **REQUIRES RE-HYDRATION** | **ABSENT** — same. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — **REQUIRES RE-HYDRATION** |
| **4. Calibration artifact** | **ABSENT** (current) — `iips-platform/src/sector-engines/telecom/frozen-assets/telecom-calibration-1.0.0.json → not found`; `ls sector-engines/` = `banking … technology` only. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — `calibration data` with historical `sha256:` to be compared to newly calculated `sha256sum` of materialized file | **ABSENT** — same (`auto/…auto-calibration-1.0.0.json → not found`). Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — calibration includes left-to-right summation semantics (special control §9) | **ABSENT** — same (`materials/…materials-calibration-1.0.0.json → not found`). Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — calibration is strongest (byte-identical implies stable bandScores) |
| **5. Golden/reference artifact** | **ABSENT** — no `telecom-golden-reference-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** | **ABSENT** — no `auto-golden-reference-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — must verify golden reflects left-to-right correction | **ABSENT** — no `materials-golden-reference-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — `byte-identical` implies golden matches replay |
| **6. Expected-output artifact** | **ABSENT** — no `telecom-expected-outputs-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — expected composite/verdict oracle | **ABSENT** — no `auto-expected-outputs-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** | **ABSENT** — no `materials-expected-outputs-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** |
| **7. Replay dataset** | **ABSENT** — no `telecom-replay-dataset-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — `replay dataset` | **ABSENT** — no `auto-replay-dataset-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — re-freeze replay must be left-to-right | **ABSENT** — no `materials-replay-dataset-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — `byte-identical replay evidence` means replay dataset is replay-identical |
| **8. Validation fixtures** | **ABSENT** — no `telecom-validation-fixtures-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — `validation fixtures` | **ABSENT** — no `auto-validation-fixtures-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** | **ABSENT** — no `materials-validation-fixtures-1.0.0.json`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** |
| **9. Ontology metadata / 8-of-8 / CSIP** | **ABSENT** — no `telecom-ontology-metadata-1.0.0.json`; `CSIP_FREEZE_MANIFEST` has no `telecom`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — `ontology metadata` (must verify `dimensionsCovered: 8` vs current `CSIP_FREEZE_MANIFEST` sector-neutral pipeline) | **ABSENT** — same (`auto-ontology…`). Historical: **RECOVERED / REQUIRES HASH VERIFICATION** | **ABSENT** — same (`materials-ontology…`). Historical: **RECOVERED / REQUIRES HASH VERIFICATION** |
| **10. Implementation-readiness certificate** | **ABSENT** — no `IES016_FINAL_READINESS_CERTIFICATE.md` (current `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE 10/10` only). Historical: **RECOVERED** — `readiness/authority-review material` (historical readiness) — **REQUIRES RE-HYDRATION** as **current** readiness certificate — **REQUIRES AUTHORITY DECISION** | **ABSENT** — same (no `IES017_FINAL…`). Historical: **RECOVERED** — **REQUIRES RE-HYDRATION** | **ABSENT** — same (no `IES020_FINAL…`). Historical: **RECOVERED** — **REQUIRES RE-HYDRATION** |
| **11. Immutable release tag** | **ABSENT** — `git tag --list | grep ies-016` → `0`; no `ies-016-v1.0.0`. Historical: **RECOVERED** as historical `release/tag` reference (if any) — **REQUIRES AUTHORITY DECISION** (creation = promotion action — **do NOT create here**) | **ABSENT** — same (`ies-017-v1.0.0 →0`). Historical: **RECOVERED** (re-freeze tag if historical) — **REQUIRES AUTHORITY DECISION** — **do NOT create** | **ABSENT** — same (`ies-020-v1.0.0 →0`). Historical: **RECOVERED** — **REQUIRES AUTHORITY DECISION** — **do NOT create** |
| **12. SHA-256 document hashes** | **ABSENT** — no `documentHashes` for `016` in any `FREEZE_MANIFEST`. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — `provenance/hash records sha256:` for each frozen doc | **ABSENT** — same. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — includes re-frozen hashes | **ABSENT** — same. Historical: **RECOVERED / REQUIRES HASH VERIFICATION** — byte-identical implies hashes match |
| **13. Replay-baseline delta** | **ABSENT** — `PROGRAM_v1.1_REPLAY_BASELINE.json` has 10 sectors only (`Banking … Technology`, `Watch 47.1 … Buy 76.3`); `grep telecom →0`. **REQUIRES AUTHORITY DECISION** (modifying `PROGRAM_v1.1_REPLAY_BASELINE.json` = certification action — **do NOT modify here**) — historical: no current delta, but historical replay dataset exists as source for future `{sector: Telecom, engineId: sector.telecom, calibrationVersion: 1.0.0, input: …, expectedOutput: {composite, verdict}}` entry | **ABSENT** — same (`grep auto →0`). **REQUIRES AUTHORITY DECISION** — **do NOT modify** | **ABSENT** — same (`grep materials →0`). **REQUIRES AUTHORITY DECISION** — **do NOT modify** |
| **14. Approver/sign-off** | **ABSENT** — no `APPROVER` signature for `016` beyond historical `readiness/authority-review`. **REQUIRES AUTHORITY DECISION** — requires `IIPS Engineering Standards Maintainer` sign-off at Freeze Gate | **ABSENT** — same — **REQUIRES AUTHORITY DECISION** | **ABSENT** — same — **REQUIRES AUTHORITY DECISION** |
| **15. Opening-authority record** | **ABSENT** — `AUTHORIZED_SCOPE_DISPOSITION §5` = `BLOCKED / OUTSIDE SCOPE … Not inferred. Current implementation: 404 DENIED`; `GATE0_SCOPE:20 do not open IES-016 now`. **REQUIRES AUTHORITY DECISION** — explicit `Opening Authority` record required before any implementation (see §11). Historical `NOT AUTHORIZED` confirms this class was **not** granted historically. | **ABSENT** — same `BLOCKED` (by extension). **REQUIRES AUTHORITY DECISION** | **ABSENT** — same `BLOCKED` (by extension). **REQUIRES AUTHORITY DECISION** |

**Overall re-hydration summary:** For every engine, classes 1–12 have **historical source RECOVERED** (with `REQUIRES HASH VERIFICATION` where hashes exist) but **ABSENT in current** — they **can be deterministically re-hydrated** via controlled procedure that materializes the historical file, computes a **newly calculated SHA-256**, compares to the **recorded historical SHA-256**, and writes a **current governed file** only after verification, under Freeze Gate authority. Classes 11, 13, 14, 15 are **REQUIRES AUTHORITY DECISION** — creation of a `git tag`, modification of `PROGRAM_v1.1_REPLAY_BASELINE.json`, `Approver` signature, or `Opening-authority` record would constitute a **promotion/freeze/certification/opening action** and are therefore **stopped at preparation specification** here and flagged for the next gate (see §11).

**Do NOT actually create the frozen artifacts yet** — this D36 gate stops at the **preparation specification above**. Actual `ies-01X/*` directories, `frozen-assets/*.json`, `FREEZE_MANIFEST.json`, `FREEZE_CHECKLIST.md`, `READINESS_CERTIFICATE`, `tags`, and `REPLAY_BASELINE` deltas are **not** created here; they are flagged for `Deferred-Engine Evidence Re-Hydration / Freeze Authority Gate`.

Per-item additional verification required (common to all three):
- `historical source present?` — YES (`RECOVERED` per independent inspection)
- `historical hash available?` — YES where `provenance/hash records` listed → `RECOVERED / REQUIRES HASH VERIFICATION`; for `readiness/authority-review` textual records, hash may be document-level `sha256:`
- `current repository counterpart present?` — NO (`ABSENT` verified via `git ls-tree -r origin/main` — 7 manifests only, 10-sector registry, 10-sector replay baseline)
- `can it be deterministically re-hydrated?` — **YES** for 1–12 (byte-identical / deterministic generator material suggests `input + contractVersion + calibrationVersion + runtimeConfiguration → identical output`; but must be re-verified with current runtime `clock: fixed, idProvider: deterministic, rounding: round-half-to-even at composite only, boundarySemantics: lower-inclusive/upper-exclusive`)
- `owner/authority required?` — `IIPS Engineering Standards Maintainer` (approver per `IES-010 … IES-015` manifests) + `Track 8 Architecture` + `Freeze Gate` authority
- `status` — as per matrix above

---

## 9. Methodology Preservation + IES-017 Special Control

### Methodology Preservation (MUST preserve existing methodology)

For `IES-016 / IES-017 / IES-020` re-hydration, the remediation **MUST preserve the existing methodology**:

- Do not redesign `M1–M15` (historical `D16/D17/D20 M1–M15` are preserved verbatim; any adjustment is an authority discrepancy requiring explicit decision — `Do not resolve it automatically`)
- Do not change metric taxonomy (historical `BM/IM/CM/HC/HP/EN/UT/CS/IN/TE` analogues for `TELECOM/AUTO/MATERIALS` must be carried as-is)
- Do not change metric direction (higher-is-better vs lower-is-better per historical calibration)
- Do not change units (currency, %, multiples, ratios as in historical `calibration data`)
- Do not change subsegment taxonomy (historical telecom subsegments / auto subsegments / materials subsegments)
- Do not change archetype taxonomy
- Do not alter scoring methodology (`bandScores` thresholds, table resolution `conservative` / `hybrid` etc.)
- Do not alter calibration methodology (`calibrationVersion: 1.0.0` lineage)
- Do not silently normalize historical methodology to a newer methodology (e.g., do not coerce to `IES-015 v1.3 D15 normative` unless historical record explicitly states that normative)

**If a discrepancy is discovered** between historical source material and current frozen methodology (e.g., rounding differs from `round-half-to-even at composite only`, or boundary semantics differ from `lower-inclusive / upper-exclusive (terminal includes upper bound)` per `PROGRAM_v1.1_REPLAY_BASELINE.json runtimeConfiguration`), **report it as an authority discrepancy requiring explicit decision** and stop re-hydration for that artifact. Do not resolve automatically.

### IES-017 Special Control — Left-to-Right Summation Correction

Preserve the historical accepted correction concerning the **left-to-right summation behavior** for `IES-017 Automobile`:

- Historical source states: `The backup contains the later accepted left-to-right summation correction and re-freeze` and `Certification data materialized, validated and re-frozen` after that correction.
- This correction is **historically accepted** and is the **post-correction re-frozen state** that must be re-hydrated. The pre-correction summation behavior is **superseded** within historical source (but current repository has no `017` behavior at all — so no current conflict).
- Do not reinterpret or change that correction (do not revert to right-to-left, do not change associativity). If re-hydration materializes both pre- and post-correction artifacts, **only the re-frozen left-to-right artifact** is the candidate for current re-hydration.
- **If re-hydration would require deciding between historical (left-to-right) and current (e.g., IES-015-calibrated summation) behavior, stop and report the discrepancy for authority decision.** This gate records the requirement; it does not execute the choice.

---

## 10. HASH / PROVENANCE RULE — APPLIED

**Where historical records contain hashes:**
- They are **recorded exactly** as inspection-reported `sha256:<64-hex>` values (to be transcribed verbatim at materialization time from historical `documentHashes`).
- They are **not silently recomputed and substituted** — any newly materialized file's `sha256sum` is a **newly calculated SHA-256**, kept in a separate `newlyCalculatedSha256` field for comparison, not overwriting the `recordedHistoricalSha256`.
- **Recorded historical SHA-256** vs **newly calculated SHA-256** are distinguished in every verification record (as in `IES-015_FREEZE_MANIFEST.json documentHashes` pattern: `sha256:…` per doc).
- Any **mismatch** between recorded historical hash and newly calculated hash is **identified explicitly** as `HASH MISMATCH — AUTHORITY DISCREPANCY` and blocks Freeze Gate promotion (never silently accepted).
- **Never overwrite a historical hash** — historical `provenance/hash records` are append-only lineage.

**For artifacts not available inside Arena now (all `016/017/020`):**
- Every class 1–12 is marked **`HISTORICAL SOURCE — HASH RECORDED, ARTIFACT NOT CURRENTLY MATERIALIZED`** in current repository context (`git ls-tree -r origin/main` → absent). The `RECOVERED / REQUIRES HASH VERIFICATION` status in §7 and §8.2 reflects this: inspection says hash exists, but Arena has not materialized the bytes to verify.

Do not invent verification — respected (no `sha256sum` invented for historical files; only current-repo hashes for `010…015` etc. verified via `git`).

---

## 11. Historical/Current Provenance Map

| Historical commit / provenance reference | Commit subject (as identified in backup) | Status at `main@3ba7fb53f2921046b3c78917ded3e13d6df6a0c4` | Current / reachable | Historical-only | Absent from current object store | Unverifiable | Notes |
|---|---|---|---|---|---|---|---|
| `9bf91d1` — IES-016 Telecommunications | `IES-016 Telecommunications engine work` (historical) | **historical-only** | ❌ Not current/reachable | ✅ Historical-only (in backup `23b4b402…`) | ✅ Absent — `git cat-file -e 9bf91d1 → fatal: Not a valid object name` ; `git log --all --oneline \| grep 9bf91d1 → 0`; `git branch --contains → not contained` | — | Do not recreate/fetch/merge/cherry-pick/restore. Historical provenance reference only unless independently re-established through authorized future evidence-recovery procedure. |
| `d51b120` — IES-017 Automobile | `IES-017 Automobile engine work` | **historical-only** | ❌ | ✅ | ✅ `fatal: Not a valid object name d51b120` | — | Includes left-to-right correction + re-freeze history; still historical-only |
| `6355949` — IES-020 Materials & Metals | `IES-020 Materials & Metals engine work` | **historical-only** | ❌ | ✅ | ✅ `fatal: Not a valid object name 6355949` | — | Includes deterministic regeneration + byte-identical replay lineage |
| `3514d47` — standards inventory reconciliation | `standards inventory reconciliation` (cross-engine) | **historical-only** | ❌ | ✅ | ✅ `fatal: Not a valid object name 3514d47` | — | Reconciliation provenance; current `main@3ba7fb5` has its own `ENGINE_INTEGRATION_RECONCILIATION.md` at `010…015`, not this SHA |
| Backup package `23b4b40295fe9d9e3d639fcf8258d3d8178b95fcb78fb136ac958654a67df53c` (~1,700 entries) | Historical Git/program state snapshot containing all four SHAs + surrounding work | **historical-only source package** | ❌ Not reachable from current history | ✅ The backup **is** the historical reachability | ✅ Not in current `git` history (current history is `c65d533 → 286f3da → 3ba7fb5`, none of the four SHAs are ancestors — `git merge-base --is-ancestor` not applicable) | Arena-unverifiable until `G:\IIPS\BACKUPS` materialization (hash to be verified then) | Acceptance under §1 makes it `ACCEPTED AS HISTORICAL SOURCE EVIDENCE`, not current |
| Current history `c65d533 → 286f3da → 3ba7fb5` (including `60fd964` product merge, `6628aef` engine merge, `bbbca16` recovered `program-v1.1.0`) | Current authoritative history (10-engine LTS, 9/9 Tracks, `program-v1.1.0` tag, `ies-006…015` tags) | **current/reachable** | ✅ Current/reachable | ❌ | ❌ Present | — | Verified via `git rev-parse main →3ba7fb5`, `origin/main →3ba7fb5`, `ls-remote →3ba7fb5` |

**Distinguish:** Every historical reference above is **historical-only / absent from current object store**, not `current/reachable`. Do not collapse historical provenance into current authority (applied; see §1).

---

## 12. Current Control-Plane Integrity Check (Read-Only, Before Completing Gate)

Verified **read-only** via `git show origin/main:…` and `git ls-tree -r origin/main` and `git rev-parse` (no checkout of `main` beyond `origin/main` reads; arena checkout remains `c65d533` with dirty as found — integrity of canonical `origin/main` is authority, arena dirty is sandbox working state already merged into `3ba7fb5`).

| Control-plane element | Expected at `main@3ba7fb5` | Observed (read-only) | Integrity |
|---|---|---|---|
| **`main`** | `3ba7fb53f2921046b3c78917ded3e13d6df6a0c4` | `git rev-parse main →3ba7fb5` PASS | ✅ |
| **`origin/main`** | `3ba7fb53f2921046b3c78917ded3e13d6df6a0c4` | `git rev-parse origin/main →3ba7fb5`; `ls-remote origin/main →3ba7fb5` PASS | ✅ |
| **E2E-030 certification** | `CERTIFIED — 10-ENGINE LTS E2E SCOPE ONLY IES-006…015` ; `016/017/020 EXCLUDED / NOT CERTIFIED / BLOCKED` | `git show origin/main:docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` header + `§2` 10 rows `Banking…Technology` (`1.0.0` `FROZEN`) + `§3` `EXCLUDED — NOT CERTIFIED` 404-DENIED table + `§11` `016/017/020 BLOCKED` PASS | ✅ |
| **Program v1.1 LTS baseline** | `PROGRAM_v1.1_LTS_BASELINE.md CONSTITUTION` frozen + `PROGRAM_v1.1_REPLAY_BASELINE.json` 10 sectors + `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE 10/10` + `GATE0_SCOPE:20 do not open 016` | `git show origin/main:program-v1.1-certification/PROGRAM_v1.1_LTS_BASELINE.md` shows `CONSTITUTION` `v1.1.0` `LTS BASELINE FROZEN` + `ls 15 files` + `git show origin/main:PROGRAM_v1.1_REPLAY_BASELINE.json` 10 sectors (`Banking 47.1 … Technology 76.3`) + `GATE0_SCOPE.md` `do not open IES-016 now` PASS | ✅ |
| **Current taxonomy** | `TAXONOMY_RESOLVED IT→Technology, Chemicals→Industrials, Realty→Technology` (`EngineRegistry.ts:42–49` `assertNotTaxonomyResolved →422`) | `git show origin/main:iips-platform/src/integration/EngineRegistry.ts` → `TAXONOMY_RESOLVED` + `IT/Chemicals/Realty` mapping present; no `sector.telecom|auto|materials` in registry PASS | ✅ |
| **Current 10-engine registry** | `CERTIFIED_ENGINES: IES-006 … IES-015` exactly 10, `sector.banking … sector.technology`, `engineVersion 1.0.0`, `calibrationVersion 1.0.0`, no `016/017/020` | `git show origin/main:iips-platform/src/integration/EngineRegistry.ts` 10 entries `IES-006 … IES-015` only (`banking`, `insurance`, `capital-markets`, `healthcare`, `hospitality`, `energy`, `utilities`, `consumer`, `industrials`, `technology`); `import BANKING…TECHNOLOGY` only 10 PASS | ✅ |
| **Current freeze manifests** | 7 manifests (`010…015` + `CSIP`) + `iips-platform` frozen-assets for `006…009` + no `016/017/020` | `git ls-tree -r origin/main \| grep FREEZE_MANIFEST` → `7` (`IES-010…015` + `CSIP`) + `ls sector-engines` = 10 sectors only (`banking … technology`, no `telecom|auto|materials`) + `find IES-016_FREEZE_MANIFEST →0` PASS | ✅ |
| **Current replay baseline** | 10 entries only, `runtimeConfiguration: clock fixed, idProvider deterministic, rounding round-half-to-even at composite only, boundarySemantics lower-inclusive/upper-exclusive` | `git show origin/main:PROGRAM_v1.1_REPLAY_BASELINE.json` shows above `runtimeConfiguration` + `sectors[10]` `Banking…Technology` only; `grep telecom\|auto\|materials →0` PASS | ✅ |
| **IES-016/017/020 absent from current certified implementation** | Still absent (`ls ies-* →010…015` only) | `git ls-tree -r origin/main -- ies-016  → absent`; `grep telecom | auto | materials → 0` in origin/main tree; `EngineRegistry` no `016/017/020` PASS | ✅ |
| **E2E-030 remains 10-engine LTS** | `CERTIFIED IES-006…015` only | Confirmed per `E2E-030_CERTIFICATION.md` above PASS | ✅ |
| **No current frozen artifact has been changed** | `git diff --stat c65d533..HEAD -- ies-*/ program-v1.1-certification/ iips-platform/IES* governance/ →0` | `git ls-tree` lineage shows `ies-010…015` manifests and `program-v1.1-certification` 15 files unchanged vs `c65d533`; `git diff origin/main` on protected shows only arena `M`+`??` working-state deletions (files present in origin/main but absent in dirty arena checkout `c65d533` — e.g., `frontend/server/engine-transport.test.ts 675 deletions` — which are **present in canonical origin/main** and thus confirm `origin/main` integrity; no protected-file modification at `origin/main`) PASS | ✅ |

**Confirm that:**
- ✅ `IES-016/017/020` are still **absent** from the current certified implementation (no `ies-016-telecom/`, `ies-017-auto/`, `ies-020-materials/`, no `sector.telecom|auto|materials`, `404 DENIED` preserved per `AUTHORIZED_SCOPE_DISPOSITION §5` + `E2E-030 §3`)
- ✅ `E2E-030` remains **`10-engine LTS`** (`IES-006…015` only)
- ✅ **No current frozen artifact has been changed** (`program-v1.1-certification/`, `ies-010…015 FREEZE_MANIFEST`, `iips-platform/src/sector-engines/{banking…technology}`, `governance/` remain at `3ba7fb5` with `0` diff vs LTS baseline)

---

## 13. Authority Boundary (Required Output 6 — Explicit Quote)

> **Historical source acceptance does not constitute opening authority, implementation authorization, promotion, or certification.**

This D36 acceptance is **only** `HISTORICAL SOURCE — ACCEPTED FOR CONTROLLED EVIDENCE REMEDIATION`. It changes **no** current authority. Any future `Freeze`, `Opening`, `Implementation`, `Promotion`, or `Certification` for `IES-016` / `IES-017` / `IES-020` requires the gates in §14. The backup's historical `frozen / re-frozen / validated` statements are **not** current frozen statements (see §4 and Important Provenance Rule).

---

## 14. Current Certification Impact (Required Output 7 — Explicit Confirmation)

**E2E-030 remains unchanged at IES-006…IES-015.**

- **Before this gate:** `main@3ba7fb53f2921046b3c78917ded3e13d6df6a0c4` `IIPS_v3.0_E2E-030_CERTIFICATION.md` `CERTIFIED — 10-ENGINE LTS E2E SCOPE ONLY` `IES-006 Banking (Watch 47.1) … IES-015 Technology (Buy 76.3)` with `FROZEN` and `9/9 Tracks approved`, `E2E-025→029 INTEGRATION 274/274` + `Product E2E 284/284` evidenced at `6628aef` + `60fd964`.
- **After this gate:** No change — same `HEAD`, same `origin/main`, same `E2E-030` artifact (no `git diff --stat c65d533..HEAD -- docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` modification except this new `D36` file as additive). `IES-016/017/020` remain `EXCLUDED / NOT CERTIFIED / BLOCKED` (`404 DENIED` for `sector.telecom|auto|materials`). `PROGRAM_v1.1_REPLAY_BASELINE.json` remains 10 sectors; no delta.
- **Verification:** `git rev-parse main` still `3ba7fb5`; `E2E-030` header unchanged; `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE 10/10` unchanged; `ls sector-engines` still 10.

---

## 15. Next Required Authority Gate (Required Output 8 — Exact)

**No deferred-engine implementation is authorized by this gate. Do not execute either authority decision automatically.**

The exact controlled steps required before any implementation, in order:

### Next gate 1: `Deferred-Engine Evidence Re-Hydration / Freeze Authority Gate` (required before any freeze claim)

**Purpose:** Controlled re-hydration of the accepted historical source (this `23b4b402…` package) into **current governed evidence** for the selected deferred engine(s), culminating in a **`FROZEN` declaration** for that engine's evidence set.

**Authority required:** `IIPS Engineering Standards Maintainer` + `Freeze Gate` sign-off (with `Track 8 Architecture` concurrence). This gate **is** the Freeze Authority Gate — it must:

1. Materialize the historical ZIP on an authorized host with `G:\IIPS\BACKUPS` access, verifying `SHA-256 23b4b402…` and `~1,700 entries` and transcribing historical `sha256:` records exactly.
2. For each of `016/017/020` (or per-engine, incrementally), execute the **15-item re-hydration checklist** (§8.2): produce `ies-01X-<sector>/IES-01X_FREEZE_MANIFEST.json` with `documentHashes sha256:` (differential: `recordedHistoricalSha256` vs `newlyCalculatedSha256`), `FREEZE_CHECKLIST`, `ARCHITECTURE_REVIEW`, `frozen-assets/*calibration/golden/expected/validation/ontology`, `replay-datasets/*`, deterministic re-execution (`byte-identical` check for `020`, `left-to-right` check for `017`), `dimensionsCovered: 8`, and `Approver` line — all with **methodology preservation** (§9).
3. Resolve any `HASH MISMATCH` or `methodology discrepancy` as `AUTHORITY DISCREPANCY` before promotion (never silently).
4. Create **immutable release tag** `ies-01X-v1.0.0` (annotated) **only under this gate's authority** (not here).
5. Declare the evidence set **`FROZEN`** (horizon) without yet opening implementation (separate gate below unless combined authority explicitly allows implementation in same gate — which it does **not** by default; this D36's §8.2 flags `Opening-authority` as `REQUIRES AUTHORITY DECISION` separately).

**Flagged for that gate (stopped here):** Creation of `ies-01X/*`, `frozen-assets/*.json`, `FREEZE_MANIFEST.json`, `FREEZE_CHECKLIST`, `ARCHITECTURE_REVIEW`, `RC` draft, `git tag`, `REPLAY_BASELINE` delta, `Approver` sign-off — all prepared as specs in §8.2 but **not** created here (see NO-MUTATION). If creation itself would constitute a promotion/freeze action, stop at preparation specification — **applied here**.

### Next gate 2: `Deferred-Engine Opening Authority Gate` (required before any implementation)

**Purpose:** Explicit authorization to **open** the deferred `IES-016` / `IES-017` / `IES-020` for implementation (and lift `GATE0_SCOPE:20` deferral), following current `AUTHORIZED_SCOPE_DISPOSITION` pattern (`E2E-013-equivalent` `A2→A1 control` disposition).

**Authority required:** `Program Authority` (separate explicit `AUTHORIZED_SCOPE_DISPOSITION` delta for `016`/`017`/`020` — not the existing `BLOCKED` deferral). This gate must:

- Explicitly authorize `v2.0` or `v1.1.x` engineering for the listed IES(s) (`No v2.0 engineering is authorized before certification is complete` — certification is now complete for 10, but opening still requires explicit record).
- Define the `Implementation` scope (`metrics/scoring/calibration/decision/evidence/EngineRegistry` addition) and the `E2E-025→029` integration plan for the new engine.
- After this gate, `EngineApiAdapter.execute('sector.telecom|auto|materials')` may transition from `404 DENIED` to governed execution, and `E2E-030` may receive a **delta certification** for the newly implemented engine.

**Likely then:** `Program v1.1.x` or `Program v2.0` certification — separate `E2E-030` delta or `Program v2.0` certification after successful re-hydration + opening + implementation + `E2E-025→029` + `Product E2E` for the new engine.

**Do not execute either authority decision automatically — respected.** This D36 record only prepares the input and identifies the next gates.

---

## 16. NO-MUTATION REQUIREMENTS — COMPLIANCE STATEMENT (Read-Only Except This Additive Record)

- ✅ **Do NOT modify `E2E-030`** — `docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` unchanged (`git status` on arena shows only `M`+`??` as found, no `M docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md`; `origin/main` `E2E-030` intact — verified)
- ✅ **Do NOT modify `Program v1.1`** — `program-v1.1-certification/*` unchanged (`git diff --stat c65d533..HEAD -- program-v1.1-certification/ →0`)
- ✅ **Do NOT modify frozen governance** — `governance/` unchanged, `ies-010…015 FREEZE_MANIFEST` + `CSIP_FREEZE_MANIFEST` unchanged
- ✅ **Do NOT modify taxonomy** — `EngineRegistry.ts TAXONOMY_RESOLVED` unchanged
- ✅ **Do NOT modify scoring** — `*/scoring/* →0`
- ✅ **Do NOT modify calibration** — `*/calibration/* + frozen-assets/*calibration →0`
- ✅ **Do NOT implement `IES-016` / `IES-017` / `IES-020`** — `sector-engines` still 10 only; no `telecom|auto|materials` engine created
- ✅ **Do NOT promote any engine / certify any engine** — no new `FINAL_READINESS_CERTIFICATE` for `016/017/020`, no `RELEASE_NOTES` delta
- ✅ **Do NOT modify replay baseline** — `PROGRAM_v1.1_REPLAY_BASELINE.json` remains 10 sectors
- ✅ **Do NOT merge historical branches / cherry-pick / fetch** — `9bf91d1/d51b120/6355949/3514d47` remain historical-only/absent; no fetch/merge executed
- ✅ **Do NOT create release tags / push changes** — `git tag --list` for `016/017/020 →0`; no push (`origin/main` still `3ba7fb5` until this `D36` commit is pushed as the sole additive artifact if authorized — see verification below)

**Before-write verification (§10 repeated):** This write is **limited to the D36 acceptance/remediation record** at `docs/integration/IIPS_v3.0_D36_HISTORICAL_SOURCE_ACCEPTANCE.md` — the **sole additive governance artifact** authorized by this gate. No frozen/current certification artifact is altered. `git diff --stat HEAD -- docs/integration/` after write will show only this new file as `+1 file` additive; `git diff --stat HEAD -- ies-*/ program-v1.1-certification/ iips-platform/src/sector-engines/ governance/` remains `0`.

---

## 17. Provenance Distinctions (Reinforced)

| Concept | Current repository | Historical source |
|---|---|---|
| **Historical source evidence** | Not current — inspection-reported `23b4b402…` package (`M1–M15`, calibration, golden, etc.) | **ACCEPTED AS HISTORICAL SOURCE** per §1 |
| **Current frozen evidence** | `FROZEN` only for `IES-006…015` (`15 TRACKS`, 7 manifests, 10-sector replay baseline) | Historical `frozen / re-frozen` is **historical frozen** — not current |
| **Current authority** | `BLOCKED / OUTSIDE SCOPE` for `016/017/020` (`AUTHORIZED_SCOPE_DISPOSITION §5`, `GATE0_SCOPE:20`) | `NOT AUTHORIZED` historically (`Engine implementation was NOT authorized`) — aligned |
| **Implementation authorization** | **Not granted** (requires Opening Gate §15) | **Not granted** historically |
| **Certification** | `E2E-030` = `IES-006…015` only (`16/17/20 EXCLUDED — NOT CERTIFIED`) | Historical `Certification data materialized and validated` = historical certification-data, not current `E2E-030` |

Do not collapse these concepts — applied throughout §§1–16.

---

## 18. References

- Canonical baseline: `main@3ba7fb53f2921046b3c78917ded3e13d6df6a0c4` (local `main` = `3ba7fb5`, `origin/main` = `3ba7fb5`, arena `c65d533` ancestor).
- E2E-030 certification: `docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` at `3ba7fb5` (234 lines, `CERTIFIED — 10-ENGINE LTS E2E SCOPE ONLY`, `HEAD==286f3da` lineage, frozen `0`).
- Authorized scope: `docs/integration/IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md` `§1` 10-engine LTS authorized / `§2` `016/017/020 BLOCKED` / `§5` `E2E-013-equivalent acceptance at 286f3da`.
- Engineering Standards disposition: `program-v1.1-certification/PROGRAM_v1.1_LTS_BASELINE.md` (CONSTITUTION), `PROGRAM_v1.1_FINAL_CERTIFICATION_GATE0_SCOPE.md:20` (`do not open IES-016 now`), `PROGRAM_v1.1_REPLAY_BASELINE.json` (10 sectors, `runtimeConfiguration` `clock: fixed` etc.), `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` (`10/10 ies-006…015`).
- Engine registry: `iips-platform/src/integration/EngineRegistry.ts` (`CERTIFIED_ENGINES 10`, `TAXONOMY_RESOLVED`).
- Reconciliation: `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md` `§2` `IES-020/016/017` `Genuinely absent from authoritative repo available to Arena` etc., plus `READ-ONLY` reconciliation `A — RECOVERED HISTORICAL EVIDENCE RECOGNIZABLE` (prior gate, pre-D36).
- Historical source: `IIPS WORKSPACE-PF-2 trigger-wiring implementation authorization gate(1).zip` (`23b4b40295fe9d9e3d639fcf8258d3d8178b95fcb78fb136ac958654a67df53c`, `~8.47 MB`, `~1,700 ZIP entries`) with historical SHAs `9bf91d1, d51b120, 6355949, 3514d47` (historical-only, absent from current object store per §11).

---

> **D36 HISTORICAL SOURCE ACCEPTANCE COMPLETE. HISTORICAL EVIDENCE IS ACCEPTED AS SOURCE MATERIAL FOR CONTROLLED RE-HYDRATION ONLY. IES-016 / IES-017 / IES-020 REMAIN BLOCKED, NOT CERTIFIED, AND NOT AUTHORIZED FOR IMPLEMENTATION. E2E-030 REMAINS IES-006…IES-015 ONLY.**
