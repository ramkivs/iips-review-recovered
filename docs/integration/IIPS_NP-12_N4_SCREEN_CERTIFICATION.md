# IIPS NP-12 N4 — DEDICATED SCREEN CAPABILITY CERTIFICATION & PROGRAM AUTHORITY ACCEPTANCE RECORD (`N4-A16`)

| Field | Value |
|---|---|
| **Document ID** | `IIPS-NP-12-N4-SCREEN-CERTIFICATION-v1.0` |
| **Gate ID** | `NP-12 N4-A16 — Dedicated NP-12 N4 Screen Certification & Program Authority Acceptance Gate` |
| **Target Repository** | `https://github.com/ramkivs/iips-review-recovered.git` (`refs/heads/main`) |
| **Target Repository Path** | `docs/integration/IIPS_NP-12_N4_SCREEN_CERTIFICATION.md` |
| **Certified Baseline Commit (`origin/main`)** | `da410d067f117c13d92ce2bde53317a05747e34a` |
| **Certified Baseline Parent Commit** | `9f93c6c8aadb264f433511e85c6c4b64b2469a12` |
| **Certified Baseline Root Tree SHA** | `476315f4065c501feebbd785a53e1c172d2ea61f` |
| **Governing Envelope Record (`N4-A15`)** | `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` (blob `3cd37c8a76db3b1438b7269ac8e9db6aa87fbcc9`, raw SHA-256 `e2f5858130b40e3d4544811c49deca90ff3d4df8d22032118c466be2454626dc`, `27,337` bytes) |
| **Immutable Pre-N4 Anchor (`N4-A1`)** | `f2886a5af43ad8df8676589daef86836039150f5` (root tree `46c1a15bbcd1291701484457d1fe9815d8538888`) |
| **Program Authority** | Ramki (`ramkivs`) |
| **Decision Date** | `2026-10-03` |
| **Certification Decision (`D-N4-A16-CERT-01`)** | **`A — CERTIFICATION ESTABLISHED`** (with explicit Program Authority disposition of `CF-A16-01` and `CF-A16-02`) |
| **Post-Certification Acceptance Decision (`D-N4-A16-ACCEPT-01`)** | **`ACCEPT`** (Program Authority post-certification acceptance granted, subject to durable publication and verification of this artifact on `origin/main`) |
| **Separate E2E-030 Engine Certification Status** | **UNCHANGED / SEPARATE** (`docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md`, blob `0671f15c2493f8760946a884d2e62fcaba53f271`, raw SHA-256 `019c35ce6e1e7730267677f821a747a87a51288ed8b75dc99fc54b1f43bdef5c`, `0` diff) |

---

## 1. Executive Summary & Authority Basis

This record establishes dedicated **NP-12 N4 Cross-Sector Screen Capability Certification** and records explicit **Post-Certification Program Authority Acceptance** for the three-layer NP-12 N4 Screen architecture on `ramkivs/iips-review-recovered` (`refs/heads/main`) at commit `da410d067f117c13d92ce2bde53317a05747e34a`:

1. **`N4-SD` — ScreenDefinition & Predicate AST (`NP12DEF v01`)**
2. **`N4-A10` — Pure Consumer-Side Screen Evaluation Runtime (`NP12MBR v01`, `NP12EXE v01`, `NP12RES v01`)**
3. **`N4-A13` — Deterministic Screen Producer & Engine-to-Screen Translation Adapter (`ScreenProducerAdapter.ts`)**

This certification is executed strictly under the binding **NP-12 N4-A15 Dedicated Screen Certification Envelope** (`NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md`, commit `da410d067f117c13d92ce2bde53317a05747e34a`, blob `3cd37c8a76db3b1438b7269ac8e9db6aa87fbcc9`, raw SHA-256 `e2f5858130b40e3d4544811c49deca90ff3d4df8d22032118c466be2454626dc`) and remains strictly separate from the frozen **IIPS v3.0 E2E-030** 13-sector engine certification (`docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md`, blob `0671f15c2493f8760946a884d2e62fcaba53f271`).

---

## 2. Certified Artifact Manifest (`origin/main` @ `da410d067f117c13d92ce2bde53317a05747e34a`)

### 2.1 Certified Implementation & Regression Test Artifacts

| Layer | Repository Path | Bytes | Git Blob SHA-1 | Raw SHA-256 |
|---|---|---:|---|---|
| **N4-SD** | `iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition.ts` | `11,400` | `bced46a602788923a5d534bf4486f02e6ccdeefa` | `0fcd91f7f21b13e6bb29dfdfe0db73e1316636381bff6752b2879c0ff3713c47` |
| **N4-SD** | `iips-platform/tests/regression/np12-n4-screen-definition.test.ts` | `21,521` | `7d1ce430e6cad63e00798d692c920d9db294d436` | `df20e8553d8099326eb4dd1fc435793075b3fcd597075acb517af2f012dc5e6e` |
| **N4-A10** | `iips-platform/src/sector-engines/cross-sector/screen/ScreenMemberInput.ts` | `19,111` | `b5612b932754210fb03a636a93251a68407ffb92` | `b36dbbac3766754eaecf858dd77243f061511c70e26b8daf00eb8a5557ba632c` |
| **N4-A10** | `iips-platform/src/sector-engines/cross-sector/screen/CanonicalFormats.ts` | `11,456` | `2d09676fbc923e667c448d95c79a731fba4de71c` | `9fd03ee2f6f6a4fd720d4366a761aaa9a52c04876bec281b8da9061b31807667` |
| **N4-A10** | `iips-platform/src/sector-engines/cross-sector/screen/ScreenEvaluator.ts` | `4,863` | `252fdc288bd8e1944871de7706c42bd8f70bbbdf` | `2a2450c152d3add7ca2322afea8f8f4fa3fa76e356166b290f26047db6a503c8` |
| **N4-A10** | `iips-platform/src/sector-engines/cross-sector/screen/ScreenExecution.ts` | `9,433` | `8f219eaf5b73eb130fe65d9203c9dc7bfdd17909` | `c855fac6ee23868305311d3f00202fd95ec8bd1c03f587ef690fd70239bc17e7` |
| **N4-A10** | `iips-platform/src/sector-engines/cross-sector/screen/ScreenResult.ts` | `4,894` | `103b391b2a26173f36c917c0d6c908ab69196525` | `942edafb2f7b178307d6957fe562b02c78ad19fd819e4585e0856fe82633bfd4` |
| **N4-A10** | `iips-platform/src/sector-engines/cross-sector/screen/index.ts` | `2,075` | `af3ac962ca63da4610f6f21640a13c9758dfcd2a` | `a26816525a31e720b7d816e0b5a16bef4ab28557df1a74c0fb0ef9fdbf947ab2` |
| **N4-A10** | `iips-platform/tests/regression/np12-n4-a9-screen-runtime.test.ts` | `60,979` | `08dba9a7358b5f0e9d9b1f4a884e87d6f25a6783` | `313c9759eef135595337970ac9033b1a32a63125da583ab3cba5a510ed2bd4bf` |
| **N4-A13** | `iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter.ts` | `43,907` | `2bb7864f930699b16789bbd0ac971a5a342fad67` | `bf9caa24ea91041a13611c5090adbaa0fc96a392cbaa38204e874449b402b948` |
| **N4-A13** | `iips-platform/tests/regression/np12-n4-screen-producer.test.ts` | `45,296` | `ae3bf707e751b92b94cce6470100c860eeec6d5d` | `ca9def39fd393c6b0a0909ad83041b93dd71f9a25a187fe2ea3f4d37dae1434c` |

### 2.2 Governing Authority & Implementation Records in Chain

| Record | Bytes | Git Blob SHA-1 | Raw SHA-256 |
|---|---:|---|---|
| `iips-platform/docs/NP-12-N4-SCREEN-DEFINITION-IMPLEMENTATION.md` | `13,353` | `51f8f19dc3baea6784dc582d3a607668bbcc943c` | `b89a5f3db240b859b2403bd6bf227f3aae9a42525fcee9c2b7359f92de0ba5e5` |
| `NP-12-N4-A6-CONTRACT-SPECIFICATION.md` | `43,422` | `3407ea22eaa15e508744f2e6c4f81097242e0dce` | `2c889c3c5dec346b6c2270c76c746f183804ad78af87d5d26393ba6cc3427531` |
| `NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md` | `46,904` | `5f27c23719d8fb9cc6c86860e6ab7e90ad7a22b4` | `bf3d86332e6c505eaaae57469fd7cb768b8caa4731ed248f1e562bfcd5ff89b1` |
| `NP-12-N4-A9-IMPLEMENTATION-RECORD.md` | `26,410` | `fddbf1f9ce7356261e3fdb8223d70fa3c14d839f` | `92f09840a49afb57ed7660a7933b5bb43271b5a59b9ad3152bbfea99c1e68dd6` |
| `NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md` | `28,925` | `e37433d8eb4bf5436bbb4fffc8a873e3538df057` | `fe85b3904cfbd4009355c80a2c46d748cb7a8463eb4a680ff6bb7031b7350d43` |
| `NP-12-N4-A13-IMPLEMENTATION-RECORD.md` | `16,452` | `ac91d22ac02e0f9a3b50c4a59189862e4d038a1e` | `4a8f8845fe2d1e01cf5fabb5448aa557a2d0649867c939e9e1453c9b09fd2e96` |
| `NP-12-A8-S-03-FAILED-BRANCH-AUTHORITY-DECISION-RECORD.md` | `12,139` | `deecc5593e14f483a91e521fcaab3e3bc445f289` | `841fdefc078c2f26283828b4880b3af6ea22ad902f8a341547e0be256208729a` |
| `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` | `27,337` | `3cd37c8a76db3b1438b7269ac8e9db6aa87fbcc9` | `e2f5858130b40e3d4544811c49deca90ff3d4df8d22032118c466be2454626dc` |

---

## 3. Certification Verification Results Across the Three Binding Surfaces

### 3.1 Surface 1 — `N4-SD` (`ScreenDefinition` & Predicate AST)
- **Command Executed:** `npx tsx --test tests/regression/np12-n4-screen-definition.test.ts`
- **Result:** **`35 / 35` PASS (`0` failures)**
- **Verified Invariants:**
  - Canonical `NP12DEF v01` binary serialization and SHA-256 identity (`sha256()`).
  - Deterministic predicate AST validation (`COMPARISON`, `AVAILABILITY`, `AND`, `OR`, `NOT`).
  - Strict rejection of malformed decimal strings, non-canonical ontology keys, invalid operators, empty logical groups, and population identity mismatches.

### 3.2 Surface 2 — `N4-A10` (Consumer-Side Screen Evaluation Runtime)
- **Command Executed:** `npx tsx --test tests/regression/np12-n4-a9-screen-runtime.test.ts`
- **Result:** **`45 / 45` PASS (`0` failures)**
- **Verified Invariants:**
  - Canonical `NP12MBR v01`, `NP12EXE v01`, and `NP12RES v01` serialization and SHA-256 digests (`inputHash`, `executionId`, `resultId`).
  - Exact rational decimal comparison (`compareCanonicalDecimal`) with no IEEE-754 floating-point coercion in predicate evaluation.
  - Explicit `AVAILABLE` vs `UNAVAILABLE` (`null` value + `UnavailableReasonCode`) handling and `AVAILABILITY_MISMATCH` exclusion.
  - Canonical `G5` ordering (`sector` ASCII ascending, then `referenceId` UTF-8 bytewise ascending) and full permutation invariance.

### 3.3 Surface 3 — `N4-A13` (Deterministic Screen Producer & Translation Adapter)
- **Command Executed:** `npx tsx --test tests/regression/np12-n4-screen-producer.test.ts`
- **Result:** **`13 / 13` functional, conformance, determinism, G5 ordering, A8-S-03 Option A fail-closed, and differential-parity subtests PASS**; **Subtest 14 (`A13 Protected Surface`) disposed by Program Authority under `CF-A16-01`** (see Section 7).
- **TypeScript Compiler Check (`npm run typecheck`):** **`0` errors**.
- **Verified Invariants Across Subtests 1–13:**
  - All 13 sector engines execute through `produceScreenMemberBinding()` and `executeProducedScreen()` with deterministic clock epoch `2026-08-09T00:00:00.000Z` and deterministic RNG seed `${canonicalSector}:${companyId}`.
  - `sector.auto` growth constituent extraction uses authoritative keys `['AU-002', 'AU-003']` (`D-N4-CERT-01`).
  - `Banking` (`sector.banking`) and `Healthcare` (`sector.healthcare`) emit `growthAvailability: 'UNAVAILABLE'`, `growth: null`, and `growthUnavailableReason: 'NO_APPROVED_GROWTH_INPUTS'` (`N4-A5` / `N4-A6` §3.1).
  - Five engines (`Hospitality`, `Energy`, `Utilities`, `Consumer`, `Industrials`) enforce the governed fail-closed boundary (`PRODUCER_CONFORMANCE_VIOLATION` / `PARTIAL_BATCH_EXECUTION_ABORTED`) when invoked with partial/missing growth inputs under `A12-D02` zero-engine-touch (`D-N4-CERT-02`).
  - `A8-S-03` Option A fail-closed batch abort (`PARTIAL_BATCH_EXECUTION_ABORTED`, `MISSING_POPULATION_MEMBER`, `UNEXPECTED_POPULATION_MEMBER`, `DUPLICATE_POPULATION_MEMBER`, `PRODUCER_EXECUTION_FAILED`) rejects any partial, failed, or mismatched batch before constructing `ScreenExecution` or `ScreenResult`.

---

## 4. 13-Sector Deterministic Replay Verification & Pinned Digest Comparison

### 4.1 Pinned Replay Parameters
- **Authoritative Input Vector Source:** `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` (git blob `83faf4f4b37f10d7b65e0736d6c629835fe30489`, raw SHA-256 `07bc0bce425d150c2da299ae73bc22c751ebf9a29cf521a91bea1f64c5c915f1`, `14,382` bytes).
- **Deterministic Producer Clock Epoch:** `DEFAULT_PRODUCER_CLOCK_EPOCH = '2026-08-09T00:00:00.000Z'`.
- **Deterministic Producer RNG Seed Formula:** `${canonicalSector}:${companyId}` (mapped to 32-bit FNV-1a integer seed via `fnv1a32`).
- **Reference Match-All `ScreenDefinition`:** `definitionId = "NP12-CERT-BASELINE-ALL"`, literal `version = "01"` (serialized under `NP12DEF v01`), `predicates = []`.

### 4.2 Pinned Aggregate Identity Digests (`Expected` vs `Observed`)

| Identity Artifact | Wire Format | Pinned Expected SHA-256 (`N4-A15`) | Observed Certification SHA-256 (`N4-A16`) | Status |
|---|---|---|---|---|
| **13-Member Canonical Population Identity** (`populationIdentity`) | `NP12POP v01` | `4c781cf0af605f1c9c64034b7765a653874478146b29f0a52a5f4e22575ef0ee` | `4c781cf0af605f1c9c64034b7765a653874478146b29f0a52a5f4e22575ef0ee` | **EXACT MATCH** |
| **Reference Match-All `ScreenDefinition`** (`NP12-CERT-BASELINE-ALL`, `version: "01"`, `predicates: []`) | `NP12DEF v01` | `13f17e9c1c80bae027bb026886664422efc861e0b597038fc0820b6a77157de7` | `13f17e9c1c80bae027bb026886664422efc861e0b597038fc0820b6a77157de7` | **EXACT MATCH** |
| **13-Sector `ScreenExecution` Identity** (`executionId`) | `NP12EXE v01` | `9a12519c1a0558a6760fbf439eb14b270249d38b8fac7e7d4211f9d9c3f3499b` | `9a12519c1a0558a6760fbf439eb14b270249d38b8fac7e7d4211f9d9c3f3499b` | **EXACT MATCH** |
| **13-Sector `ScreenResult` Identity** (`resultId`, `13` matched / `0` excluded) | `NP12RES v01` | `f08a3bcabafab058d6ecaae4ec42f2afb06d9743d1c472a5e0ad1a2b8c880011` | `f08a3bcabafab058d6ecaae4ec42f2afb06d9743d1c472a5e0ad1a2b8c880011` | **EXACT MATCH** |

### 4.3 Pinned 13-Sector Member Outputs & `NP12MBR v01` `inputHash` Comparison (`G5` Canonical Order)

| # | Canonical Sector (`G5`) | `referenceId` | `engineId` | `snapshotId` | `evidenceId` | `conviction` | `quality` | `growthAvailability` / `growth` | Pinned & Observed `NP12MBR v01` `inputHash` (SHA-256) | Match |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | `Automobile` | `AU-001` | `sector.auto` | `SNAP_CFAD3308` | `ev_sector.auto_2026-08-09T00:00:00.000Z` | `"71.6"` | `"71.6"` | `AVAILABLE` / `"71.6"` | `54e52a1fa968cc4c113a5bd41c6eb921416ca1f4799c0e6ca7783159038f6c85` | **PASS** |
| 2 | `Banking` | `BK-001` | `sector.banking` | `SNAP_47584F01` | `ev_sector.banking_2026-08-09T00:00:00.000Z` | `"47.1"` | `"15"` | `UNAVAILABLE` / `null` (`NO_APPROVED_GROWTH_INPUTS`) | `d6bd2c2ff780ee6e5a8fa51b621f2e00714f308348257633e30ccb1e6c51cd17` | **PASS** |
| 3 | `Capital Markets` | `CM-001` | `sector.capital-markets` | `SNAP_F0788252` | `ev_sector.capital-markets_2026-08-09T00:00:00.000Z` | `"84.6"` | `"90"` | `AVAILABLE` / `"82.5"` | `64233405599438f72659397c8238d8894f66868246a9d665198ad3f55ff747e5` | **PASS** |
| 4 | `Consumer` | `CS-001` | `sector.consumer` | `SNAP_1B2F4478` | `ev_sector.consumer_2026-08-09T00:00:00.000Z` | `"79.5"` | `"90"` | `AVAILABLE` / `"75"` | `efa86c6070c660aa55e1c1e2f75041a41c24872b6c0fde7caf4a4b3dec5d1e46` | **PASS** |
| 5 | `Energy` | `EN-001` | `sector.energy` | `SNAP_D0C316AF` | `ev_sector.energy_2026-08-09T00:00:00.000Z` | `"66.9"` | `"75"` | `AVAILABLE` / `"60"` | `cb8c3908f777f1dd83b34c2487034437d07747a46b7bc7b8a2b30c72e88c0c6d` | **PASS** |
| 6 | `Healthcare` | `HC-001` | `sector.healthcare` | `SNAP_A90E3F23` | `ev_sector.healthcare_2026-08-09T00:00:00.000Z` | `"75.5"` | `"90"` | `UNAVAILABLE` / `null` (`NO_APPROVED_GROWTH_INPUTS`) | `20299f5a5b6c919450593060c048d227b9b17f5b337476142d0474a1176c8b13` | **PASS** |
| 7 | `Hospitality` | `HP-001` | `sector.hospitality` | `SNAP_4EA62BEA` | `ev_sector.hospitality_2026-08-09T00:00:00.000Z` | `"79"` | `"40"` | `AVAILABLE` / `"75"` | `123cfe666cb6dd2000c14f5b5483db188e500a7f1d2afe322d048b98ef8dd858` | **PASS** |
| 8 | `Industrials` | `IN-001` | `sector.industrials` | `SNAP_5A81D1B1` | `ev_sector.industrials_2026-08-09T00:00:00.000Z` | `"77.2"` | `"75"` | `AVAILABLE` / `"75"` | `41e8e3fcac105e4e1dc53d3130b021ae8119af0b2a74e687b3b806526cb25089` | **PASS** |
| 9 | `Insurance` | `IN-001` | `sector.insurance` | `SNAP_B617CBA9` | `ev_sector.insurance_2026-08-09T00:00:00.000Z` | `"72.3"` | `"72.2"` | `AVAILABLE` / `"72.5"` | `45170883095c2f3713e93e0c90656d6ceda5b09f0fed00fb352b584ff03c601d` | **PASS** |
| 10 | `Materials & Metals` | `MM-001` | `sector.materials` | `SNAP_319C7278` | `ev_sector.materials_2026-08-09T00:00:00.000Z` | `"74.9"` | `"74.9"` | `AVAILABLE` / `"74.9"` | `fdb38b080e72e379ad68d08f87b24d12f153b52d155d0d55b97238835e694003` | **PASS** |
| 11 | `Technology` | `TE-001` | `sector.technology` | `SNAP_574D773B` | `ev_sector.technology_2026-08-09T00:00:00.000Z` | `"76.3"` | `"85.5"` | `AVAILABLE` / `"75"` | `f3e3dffa0d0b1e1a2f8481acb6c8169366a1a3479bc0c5ca30d9fc31dc83d836` | **PASS** |
| 12 | `Telecommunications` | `TL-001` | `sector.telecom` | `SNAP_5C1E0B10` | `ev_sector.telecom_2026-08-09T00:00:00.000Z` | `"68.4"` | `"68.4"` | `AVAILABLE` / `"68.4"` | `19e089121a87521f3d4e21c9ef876d380a660216a7b37ac45baeae882cdef053` | **PASS** |
| 13 | `Utilities` | `UT-001` | `sector.utilities` | `SNAP_152814EF` | `ev_sector.utilities_2026-08-09T00:00:00.000Z` | `"74.1"` | `"79.5"` | `AVAILABLE` / `"75"` | `6bff5c15c509ef158fa5e72e71c0e69f44b6d9c3be23b3175cb453aa5224e27c` | **PASS** |

---

## 5. Protected-Surface Integrity & E2E-030 Separation Verification

Direct Git diff inspection (`git diff --name-only 5ca181c7564a063a01265efdfdc5996563888d49..da410d067f117c13d92ce2bde53317a05747e34a -- <protected paths>`) confirms **`0` modifications** across all protected surfaces:

- **All 13 sector engines (`iips-platform/src/sector-engines/{banking,insurance,capital-markets,healthcare,hospitality,energy,utilities,consumer,industrials,technology,telecom,auto,materials}`):** `0` changes (`renorm()` untouched).
- **Frozen `N4-SD` (`iips-platform/src/sector-engines/cross-sector/definition/**`):** `0` changes.
- **Frozen `N4-A10` (`ScreenMemberInput.ts`, `CanonicalFormats.ts`, `ScreenEvaluator.ts`, `ScreenExecution.ts`, `ScreenResult.ts`, `screen/index.ts`):** `0` changes.
- **CSIP & Cross-Sector Core (`CrossSectorEngine.ts`, `CrossSectorPlugin.ts`, `cross-sector/index.ts`, `population/**`, `ontology/**`):** `0` changes.
- **Integration & Transport (`EngineRegistry.ts`, `EngineApiAdapter.ts`, `frontend/server/executive-transport.ts`, `frontend/tsconfig.json`):** `0` changes.
- **Frozen E2E-030 Certification & Replay Baseline (`docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md`, `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`, D38/LTS freeze manifests):** `0` changes.

---

## 6. Full Regression Suite & Failure Baseline Accounting (`§13`)

Running `npm test` inside `iips-platform` at `da410d067f117c13d92ce2bde53317a05747e34a` executes `642` tests across all suites:
- **Passing Tests:** `599`
- **Failing Tests:** `43`, consisting of:
  1. **`42` pre-existing failures** outside NP-12 N4 (`d18-evidence-lineage`, `d19-replay-determinism`, `d20-integrity-RIB`, `d21-ui-contract`, `d38-freeze-verification`, `e2e021-plugin-isolation`, `ies002-interface-contracts`, `ies009-telecom`, `ies010-automotive`, `ies011-materials-metals`), unchanged since `N4-A1` (`f2886a5af43ad8df8676589daef86836039150f5`).
  2. **`1` open-ended whole-repo diff assertion (`CF-A16-01`)** in `np12-n4-screen-producer.test.ts` Subtest 14 (`line 1137`), explicitly disposed by Program Authority below.

---

## 7. Program Authority Disposition of Certification Findings (`CF-A16-01` & `CF-A16-02`)

### 7.1 `CF-A16-01` — Open-Ended Whole-Repo `git diff 5ca181c` Assertion in `np12-n4-screen-producer.test.ts` Subtest 14
- **Finding:** Subtest 14 (`np12-n4-screen-producer.test.ts:1137–1160`) executes `git diff 5ca181c7564a063a01265efdfdc5996563888d49 --name-only` across the entire repository and asserts that every changed path since `5ca181c7564a063a01265efdfdc5996563888d49` is in a 3-file allowlist (`ScreenProducerAdapter.ts`, `np12-n4-screen-producer.test.ts`, `NP-12-N4-A13-IMPLEMENTATION-RECORD.md`). Because four authorized governance markdown records were committed to `refs/heads/main` after `5ca181c7564a063a01265efdfdc5996563888d49` (`docs/integration/NP-13-D1-CM-B-DECISION-01.md`, `docs/integration/NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01.md`, `NP-12-A8-S-03-FAILED-BRANCH-AUTHORITY-DECISION-RECORD.md`, and `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md`), Subtest 14 reports `unexpected modified file "NP-12-A8-S-03-FAILED-BRANCH-AUTHORITY-DECISION-RECORD.md"`.
- **Program Authority Disposition (`D-N4-A16-CERT-01`):** Program Authority rules that `CF-A16-01` is a non-functional commit-range assumption in Subtest 14 caused solely by subsequent governance markdown publications on `refs/heads/main`; actual protected-surface integrity (`Section 5`) is independently verified at **`0` diffs**, and all `13/13` functional, conformance, determinism, G5 ordering, A8-S-03 Option A fail-closed, and differential-parity subtests in `np12-n4-screen-producer.test.ts` pass (`100%`). `CF-A16-01` is formally disposed and does not block certification.

### 7.2 `CF-A16-02` — Literal `ScreenDefinitionInput.version` Field (`"01"`) under `NP12DEF v01`
- **Finding:** `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` §4.1's table header abbreviated the `NP12-CERT-BASELINE-ALL` version as `v01`, whereas the literal `ScreenDefinitionInput.version` string that produces the pinned `NP12DEF v01` digest `13f17e9c1c80bae027bb026886664422efc861e0b597038fc0820b6a77157de7` (and `executionId = 9a12519c1a0558a6760fbf439eb14b270249d38b8fac7e7d4211f9d9c3f3499b`, `resultId = f08a3bcabafab058d6ecaae4ec42f2afb06d9743d1c472a5e0ad1a2b8c880011`) is `"01"` (serialized under the `NP12DEF v01` wire header).
- **Program Authority Disposition (`D-N4-A16-CERT-01`):** Confirmed. The canonical `ScreenDefinitionInput.version` value for `NP12-CERT-BASELINE-ALL` is `"01"`.

---

## 8. Recorded Program Authority Decisions (`N4-A16`)

| Decision ID | Scope | Recorded Program Authority Decision (Ramki) |
|---|---|---|
| **`D-N4-A16-CERT-01`** | Dedicated NP-12 N4 Screen Certification Determination (`N4-SD` + `N4-A10` + `N4-A13`) | **`A — CERTIFICATION ESTABLISHED`** (with explicit Program Authority disposition of `CF-A16-01` and `CF-A16-02`) |
| **`D-N4-A16-ACCEPT-01`** | Post-Certification Program Authority Acceptance of the Certified NP-12 N4 Screen Capability | **`ACCEPT`** (Post-certification Program Authority acceptance granted, subject to durable publication and verification of `docs/integration/IIPS_NP-12_N4_SCREEN_CERTIFICATION.md` on `origin/main`) |

---

## 9. Durability & Remote Publication Governance Notice

In accordance with standing repository governance:
1. Direct `git push` from the sandbox environment is prohibited.
2. This certification and acceptance record (`docs/integration/IIPS_NP-12_N4_SCREEN_CERTIFICATION.md`) is prepared and verified in the workspace for durable publication to `ramkivs/iips-review-recovered` (`refs/heads/main`) on top of `da410d067f117c13d92ce2bde53317a05747e34a`.
3. Durable remote closure is achieved upon publication of `docs/integration/IIPS_NP-12_N4_SCREEN_CERTIFICATION.md` to `origin/main` and post-publication verification of the resulting commit SHA, parent SHA (`da410d067f117c13d92ce2bde53317a05747e34a`), root tree SHA, blob SHA, and raw SHA-256.
