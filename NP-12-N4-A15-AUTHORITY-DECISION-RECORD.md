# NP-12 N4-A15 — Dedicated Screen Certification Envelope, Replay Baseline & Acceptance Authority Decision Record

- **Record Identifier:** `NP-12-N4-A15`
- **Artifact Path:** `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md`
- **Record Type:** Program Authority Governance & Certification-Envelope Decision Record — Durable Publication Act
- **Workstream:** `NP-12` — Governed Cross-Sector Screener (`N4`)
- **Gate:** `NP-12 N4-A15` — Dedicated Screen Certification Envelope, Replay Baseline & Acceptance Authority Gate
- **Program Authority / Signer:** Ramki (Ramakrishnan) — IIPS Application Owner & Program Authority
- **Decision Date:** `2026-10-03`
- **Certification Disposition (`D-A15-03`):** **`OPTION B — DEDICATED NP-12 CERTIFICATION GATE`**
- **Certification-Entry Decisions (`D-N4-CERT-01` .. `D-N4-CERT-10`):** **ALL 10 DECISIONS APPROVED BY PROGRAM AUTHORITY**
- **Acceptance Status (`D-A15-04` / `D-N4-CERT-07`):** **DEFERRED UNTIL POST-CERTIFICATION** (formal Program Authority acceptance remains distinct from certification and is deferred until completion of the dedicated `NP-12` certification gate)
- **Implementation Authority:** **NOT GRANTED BY THIS RECORD** (zero source, test, engine, `renorm()`, runtime, CSIP, fixture, E2E-030, IPD, or production changes authorized)
- **Authoritative Primary Repository (`IRR`):** `ramkivs/iips-review-recovered` (`refs/heads/main`)
- **Authoritative Preparation Baseline (`origin/main`):** `9f93c6c8aadb264f433511e85c6c4b64b2469a12` (parent `8d1426504ffb955e323110963086d8abf385b7df`, root tree `edc930d3f01fac72d5aaf54be94b359cf10964b5`)
- **Immutable `N4-A1` Bound Baseline:** Commit `f2886a5af43ad8df8676589daef86836039150f5` / Tree `46c1a15bbcd1291701484457d1fe9815d8538888` (referenced, **not rebound**)
- **Reference-Only Repository (`IPD`):** `ramkivs/iips-production-market-data` — **REFERENCE-ONLY** (`0` mutations)
- **Production:** **OUT OF SCOPE** (`0` mutations, `0` eligibility or deployment authority)

---

## 1. Gate Identity & Authoritative Baseline Verification

This record captures the explicit Program Authority decisions rendered at:

> **`NP-12 N4-A15` — Dedicated Screen Certification Envelope, Replay Baseline & Acceptance Authority Gate**

following the read-only **`NP-12 N4-A14` — Screen Producer Conformance / Certification Boundary & Acceptance Decision Gate** and the Program Authority's selection of **`D-A15-03 = OPTION B — DEDICATED NP-12 CERTIFICATION GATE`**.

### 1.1 Independently Verified Live Remote Baseline (`origin/main`)

| Baseline Item | Verified Remote Value (`origin/main`) | Status |
|---|---|---|
| **Authoritative Repository** | `ramkivs/iips-review-recovered` (`refs/heads/main`) | **VERIFIED LIVE** |
| **Baseline Commit (`origin/main`)** | `9f93c6c8aadb264f433511e85c6c4b64b2469a12` | **VERIFIED LIVE** |
| **Parent Commit** | `8d1426504ffb955e323110963086d8abf385b7df` | **VERIFIED LIVE** |
| **Root Tree** | `edc930d3f01fac72d5aaf54be94b359cf10964b5` | **VERIFIED LIVE** |
| **`N4-A1` Immutable Bound Baseline** | Commit `f2886a5af43ad8df8676589daef86836039150f5` / Tree `46c1a15bbcd1291701484457d1fe9815d8538888` | **UNCHANGED (NOT REBOUND)** |
| **`NP-12-A8-S-03-FAILED-BRANCH-AUTHORITY-DECISION-RECORD.md`** | Blob `deecc5593e14f483a91e521fcaab3e3bc445f289` (`12,139` B, SHA-256 `841fdefc078c2f26283828b4880b3af6ea22ad902f8a341547e0be256208729a`) | **VERIFIED LIVE** |
| **`NP-12-N4-A13-IMPLEMENTATION-RECORD.md`** | Blob `ac91d22ac02e0f9a3b50c4a59189862e4d038a1e` (`16,452` B, SHA-256 `4a8f8845fe2d1e01cf5fabb5448aa557a2d0649867c939e9e1453c9b09fd2e96`) | **VERIFIED LIVE** |
| **`ScreenProducerAdapter.ts` (`N4-A13`)** | Blob `2bb7864f930699b16789bbd0ac971a5a342fad67` (`43,907` B, SHA-256 `bf9caa24ea91041a13611c5090adbaa0fc96a392cbaa38204e874449b402b948`) | **VERIFIED LIVE** |
| **`np12-n4-screen-producer.test.ts` (`N4-A13`)** | Blob `ae3bf707e751b92b94cce6470100c860eeec6d5d` (`45,296` B, SHA-256 `ca9def39fd393c6b0a0909ad83041b93dd71f9a25a187fe2ea3f4d37dae1434c`) | **VERIFIED LIVE** |
| **`NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md`** | Blob `e37433d8eb4bf5436bbb4fffc8a873e3538df057` (`28,925` B, SHA-256 `fe85b3904cfbd4009355c80a2c46d748cb7a8463eb4a680ff6bb7031b7350d43`) | **VERIFIED LIVE** |
| **`NP-12-N4-A9-IMPLEMENTATION-RECORD.md` (`N4-A10`)** | Blob `fddbf1f9ce7356261e3fdb8223d70fa3c14d839f` (`26,410` B) | **VERIFIED LIVE** |
| **`N4-A10` Screen Runtime Modules (`6` files + test + fixture)** | Blobs `b5612b93…`, `2d09676f…`, `252fdc28…`, `8f219eaf…`, `103b391b…`, `af3ac962…`, `08dba9a7…`, `4bd6a871…` | **UNCHANGED** |
| **`N4-SD` (`ScreenDefinition.ts` + test + fixture + doc)** | Blobs `bced46a6…`, `7d1ce430…`, `47d0db4f…`, `51f8f19d…` | **UNCHANGED** |
| **`G1–G5` (`ScreeningPopulation.ts`)** | Blob `0163b1d6b8c78f962816b346d6ccad8bfccf7f19` (`10,110` B) | **UNCHANGED** |
| **`IIPS_v3.0_E2E-030_CERTIFICATION.md`** | Blob `0671f15c2493f8760946a884d2e62fcaba53f271` (`41,131` B) | **UNCHANGED** |
| **`PROGRAM_v1.1_REPLAY_BASELINE.json`** | Blob `83faf4f4b37f10d7b65e0736d6c629835fe30489` (`14,382` B) | **UNCHANGED** |

### 1.2 Frozen Governance Context (Not Reopened)

The following remain closed, authoritative, and untouched: `N1`, `N2` (`G1–G5`), `N3`, `N4`, `N4-SD`, `N4-A1`, `N4-A3`, `N4-A5`, `N4-A6`, `N4-A8`, `N4-A9`, `N4-A10`, `N4-A12`, `N4-A13`, `A8-S-03` (`Option A`), and `E2E-030` (`10-Engine LTS` + `13-Engine D42 Delta`).

---

## 2. Resolution of Conformance Items `G-A14-01` (`D-N4-CERT-01`) and `G-A14-02` (`D-N4-CERT-02`)

### 2.1 `D-N4-CERT-01` (`D-A15-01` / `G-A14-01`) — `sector.auto` Growth Constituent Keys

- **Program Authority Selection:** **`A — Confirm ['AU-002', 'AU-003'] as authoritative`**
- **Normative Ruling:**
  1. For `sector.auto` (`Automobile`, `IES-017`), the authoritative `GDS-05` governed growth constituent input key set is:
     ```text
     ['AU-002', 'AU-003']
     ```
  2. This ruling reconciles the descriptive table entry in `NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md` §7 (row 12, which listed `['AU-001', 'AU-004']`), aligns the governance record with the frozen runtime calculation in `AutoScoreEngine.ts:55` (`const growth = renorm(pair(m('AU-002', input['AU-002']), 0.5), pair(m('AU-003', input['AU-003']), 0.5))`), and confirms `GROWTH_CONSTITUENT_INPUT_KEYS_BY_ENGINE_ID['sector.auto'] = ['AU-002', 'AU-003']` in `ScreenProducerAdapter.ts:198`.
  3. Zero modifications are authorized or required to `AutoScoreEngine.ts`, `NP-12-N4-A6-CONTRACT-SPECIFICATION.md`, `N4-A10`, or `ScreenProducerAdapter.ts`.

### 2.2 `D-N4-CERT-02` (`D-A15-02` / `G-A14-02`) — Five-Engine Live Missing-Growth Fail-Closed Boundary

- **Program Authority Selection:** **`A — Confirm the five-engine fail-closed boundary as the intended governed conformance behavior`**
- **Normative Ruling:**
  1. Under the `A12-D02` Protected-Surface Zero-Diff Invariant (which strictly prohibits modifying any of the 13 frozen sector engines):
     - `adaptExecutionResultToScreenMember()` enforces `GDS-05` (`growthAvailability = "UNAVAILABLE"`, `growth = null` when all governed growth constituent inputs are `undefined` or `null`) across all **11** input-backed engines at the `ExecutionResult` adaptation boundary;
     - Live `produceScreenMember()` normalizes missing growth constituents to `UNAVAILABLE / null` for all **6** input-backed engines whose frozen `ScoreEngine.score()` completes under `undefined` growth metrics (`Insurance`, `Capital Markets`, `Technology`, `Telecommunications`, `Automobile`, `Materials & Metals`), in addition to `Banking` (`GDS-03`) and `Healthcare` (`GDS-04`);
     - Live `produceScreenMember()` **fails closed** (`PRODUCER_ENGINE_EXECUTION_FAILED` / `PRODUCER_DECIMAL_NON_FINITE`) for the **5** frozen engines whose unmodified `ScoreEngine.band()` throws or produces `NaN` when growth constituent inputs are `undefined` (`Hospitality`, `Energy`, `Utilities`, `Consumer`, `Industrials`).
  2. This two-layer boundary is confirmed as the intended and governed conformance behavior under `A12-D02`.
  3. Zero engine modifications, zero reconstruction heuristics, and zero silent growth fabrications are authorized or permitted.

---

## 3. Certification Envelope Definition (`D-N4-CERT-03`, `D-N4-CERT-08`, `D-N4-CERT-09`)

### 3.1 Candidate Scope Included in the Dedicated `NP-12 N4` Certification Envelope (`D-N4-CERT-03`)

Program Authority approves the dedicated **`NP-12 N4` Screen Certification Envelope** covering exactly three durably published layers at `origin/main == 9f93c6c8aadb264f433511e85c6c4b64b2469a12`:

| Layer | Governed Artifacts in Scope | Certification Verification Requirements |
|---|---|---|
| **1. `N4-SD` (Screen Definition)** | `iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition.ts` (`blob bced46a602788923a5d534bf4486f02e6ccdeefa`), `iips-platform/tests/regression/np12-n4-screen-definition.test.ts` (`blob 7d1ce430e6cad63e00798d692c920d9db294d436`), `iips-platform/tests/regression/fixtures/np12-n4-screen-definition-format1.json` (`blob 47d0db4fd5f4faca0025b7b3baceee0f582e4bf6`) | Verify `ScreenDefinition` `(definitionId, version)` opaque identity, `N4-A` ≤6dp fixed-point decimal contract, predicate deduplication/ordering, `G4` `populationIdentity` binding, `NP12DEF v01` canonical byte grammar (`E01–E14` literal vectors), and zero-diff baseline integrity. |
| **2. `N4-A10` (Screen Runtime — Increment 1)** | `iips-platform/src/sector-engines/cross-sector/screen/{ScreenMemberInput,CanonicalFormats,ScreenEvaluator,ScreenExecution,ScreenResult,index}.ts` (`blobs b5612b93…, 2d09676f…, 252fdc28…, 8f219eaf…, 103b391b…, af3ac962…`), `iips-platform/tests/regression/np12-n4-a9-screen-runtime.test.ts` (`blob 08dba9a7…`), `iips-platform/tests/regression/fixtures/np12-n4-a9-screen-runtime-format1.json` (`blob 4bd6a871…`) | Verify `ScreenMemberInput` admission, `NP12MBR v01` (`inputHash`), `NP12EXE v01` (`executionId`), `NP12RES v01` (`resultId`), `ScreenEvaluator` (`NP12-SCREEN-EVALUATOR` / `01` / `01`), `N3 §7` growth sentinel semantics, `G5` verbatim member ordering, `N4-SD` differential decimal parity, and `A8-S-03 Option A` preservation (`45/45` focused tests). |
| **3. `N4-A13` (Screen Producer Adapter — Increment 2)** | `iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter.ts` (`blob 2bb7864f930699b16789bbd0ac971a5a342fad67`), `iips-platform/tests/regression/np12-n4-screen-producer.test.ts` (`blob ae3bf707e751b92b94cce6470100c860eeec6d5d`), `NP-12-N4-A13-IMPLEMENTATION-RECORD.md` (`blob ac91d22ac02e0f9a3b50c4a59189862e4d038a1e`) | Verify 13-engine runtime producer convergence (`GDS-01`..`GDS-12`), `D-N4-CERT-01` (`sector.auto` `['AU-002', 'AU-003']`), `D-N4-CERT-02` (5-engine live missing-growth fail-closed boundary), `SnapshotStore` pillar retrieval with zero fixture reads, `EngineRegistry` version/calibration authority, `GDS-06` 6dp half-to-even serialization, `(sector, referenceId)` composite identity (`("Insurance", "IN-001")` and `("Industrials", "IN-001")`), `N4-A10` byte-exact differential parity, and 13-sector deterministic replay (`14/14` producer tests). |

### 3.2 Surfaces Explicitly Excluded from the `NP-12 N4` Certification Envelope

The following remain **outside** the `NP-12 N4` certification envelope:
- Existing `E2E-030` certification (`10-Engine LTS` at `286f3da` + `13-Engine D42 Delta` at `67e89aa`);
- All 13 certified sector engines (`*Engine.ts`, `*ScoreEngine.ts`, `*Metrics.ts`, `*Calibration.ts`, `renorm()`) and their D38 freeze manifests;
- CSIP (`OntologyMapper.ts`, `CrossSectorEngine.ts`, `CrossSectorPlugin.ts`) and `ScreeningPopulation.ts` (consumed read-only as a frozen prerequisite);
- Persistence, storage engines, registries, transport (`frontend/server/executive-transport.ts`), HTTP APIs, and UI surfaces;
- `IPD` (`ramkivs/iips-production-market-data`) and `Production`.

### 3.3 `E2E-030` Separation (`D-N4-CERT-08`) & `A8-S-03` Preservation (`D-N4-CERT-09`)

1. **`D-N4-CERT-08` (`E2E-030` Separation):** Existing `E2E-030` certification remains completely separate, valid, and untouched (`0` diffs). `E2E-030` does **not** certify `NP-12`, and the dedicated `NP-12 N4` certification gate does **not** modify `docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` or `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`.
2. **`D-N4-CERT-09` (`A8-S-03 Option A` Preservation):** `NP-12-A8-S-03-FAILED-BRANCH-AUTHORITY-DECISION-RECORD.md` (`blob deecc5593e14f483a91e521fcaab3e3bc445f289`) governs the failure boundary within the certification envelope: structural/execution failures fail closed with a deterministic typed error (`ScreenProducerError` / `ScreenExecutionError`); no failed `NP12EXE v01` `executionId` and no failed `NP12RES v01` `resultId` are created; `FAILED` remains a lifecycle/error classification outside canonical `NP12RES v01`; member-level invalidity remains `INVALID_MEMBER` within `COMPLETED`.

---

## 4. Certification Replay Baseline & Determinism Requirements (`D-N4-CERT-04`, `D-N4-CERT-05`)

### 4.1 Pinned Replay Baseline Parameters (`D-N4-CERT-04`)

Program Authority approves pinning the following deterministic replay baseline parameters for the dedicated `NP-12 N4` certification gate:

| Replay Parameter | Pinned Certification Value |
|---|---|
| **Source Code Baseline Commit** | `9f93c6c8aadb264f433511e85c6c4b64b2469a12` (code tree `edc930d3f01fac72d5aaf54be94b359cf10964b5`) |
| **Evaluator Identity (`N4-A10`)** | `evaluatorId = "NP12-SCREEN-EVALUATOR"`, `evaluatorVersion = "01"`, `executionSemanticsVersion = "01"` |
| **Producer Clock Convention (`N4-A13`)** | `DEFAULT_PRODUCER_CLOCK_EPOCH = "2026-08-09T00:00:00.000Z"` (`FixedClock`) |
| **Producer Deterministic ID Seed Convention (`N4-A13`)** | `DeterministicIdProvider("${canonicalSector}:${companyId}")` |
| **Canonical Oracle Input Source** | The 13 sector input records from `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` (`blob 83faf4f4b37f10d7b65e0736d6c629835fe30489`), bound to `GOLDEN_BASELINE_IDENTITIES_BY_SECTOR` (`GDS-07 Option 2`) |
| **13-Sector `G4` `populationIdentity`** | `4c781cf0af605f1c9c64034b7765a653874478146b29f0a52a5f4e22575ef0ee` |
| **Reference Match-All `ScreenDefinition` (`NP12-CERT-BASELINE-ALL`, `v01`, `predicates: []`) `NP12DEF v01` Digest** | `13f17e9c1c80bae027bb026886664422efc861e0b597038fc0820b6a77157de7` |
| **Reference 13-Sector `NP12EXE v01` `executionId`** | `9a12519c1a0558a6760fbf439eb14b270249d38b8fac7e7d4211f9d9c3f3499b` |
| **Reference 13-Sector `NP12RES v01` `resultId`** | `f08a3bcabafab058d6ecaae4ec42f2afb06d9743d1c472a5e0ad1a2b8c880011` |

### 4.2 Reference 13-Sector Produced Member Baseline Table (`G5` Canonical Order)

| # | Canonical Sector (`G1`/`G5`) | `referenceId` (`GDS-07`) | `engineId` / Version / Cal. | `snapshotId` | `evidenceId` | `conviction` | `quality` | `growthAvailability` / `growth` | `NP12MBR v01` `inputHash` (SHA-256) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `Automobile` | `AU-001` | `sector.auto` / `1.0.0` / `1.0.0` | `SNAP_CFAD3308` | `ev_sector.auto_2026-08-09T00:00:00.000Z` | `"71.6"` | `"71.6"` | `AVAILABLE` / `"71.6"` | `54e52a1fa968cc4c113a5bd41c6eb921416ca1f4799c0e6ca7783159038f6c85` |
| 2 | `Banking` | `BK-001` | `sector.banking` / `1.0.0` / `1.0.0` | `SNAP_47584F01` | `ev_sector.banking_2026-08-09T00:00:00.000Z` | `"47.1"` | `"15"` | `UNAVAILABLE` / `null` | `d6bd2c2ff780ee6e5a8fa51b621f2e00714f308348257633e30ccb1e6c51cd17` |
| 3 | `Capital Markets` | `CM-001` | `sector.capital-markets` / `1.0.0` / `1.0.0` | `SNAP_F0788252` | `ev_sector.capital-markets_2026-08-09T00:00:00.000Z` | `"84.6"` | `"90"` | `AVAILABLE` / `"82.5"` | `64233405599438f72659397c8238d8894f66868246a9d665198ad3f55ff747e5` |
| 4 | `Consumer` | `CS-001` | `sector.consumer` / `1.0.0` / `1.0.0` | `SNAP_1B2F4478` | `ev_sector.consumer_2026-08-09T00:00:00.000Z` | `"79.5"` | `"90"` | `AVAILABLE` / `"75"` | `efa86c6070c660aa55e1c1e2f75041a41c24872b6c0fde7caf4a4b3dec5d1e46` |
| 5 | `Energy` | `EN-001` | `sector.energy` / `1.0.0` / `1.0.0` | `SNAP_D0C316AF` | `ev_sector.energy_2026-08-09T00:00:00.000Z` | `"66.9"` | `"75"` | `AVAILABLE` / `"60"` | `cb8c3908f777f1dd83b34c2487034437d07747a46b7bc7b8a2b30c72e88c0c6d` |
| 6 | `Healthcare` | `HC-001` | `sector.healthcare` / `1.0.0` / `1.0.0` | `SNAP_A90E3F23` | `ev_sector.healthcare_2026-08-09T00:00:00.000Z` | `"75.5"` | `"90"` | `UNAVAILABLE` / `null` | `20299f5a5b6c919450593060c048d227b9b17f5b337476142d0474a1176c8b13` |
| 7 | `Hospitality` | `HP-001` | `sector.hospitality` / `1.0.0` / `1.0.0` | `SNAP_4EA62BEA` | `ev_sector.hospitality_2026-08-09T00:00:00.000Z` | `"79"` | `"40"` | `AVAILABLE` / `"75"` | `123cfe666cb6dd2000c14f5b5483db188e500a7f1d2afe322d048b98ef8dd858` |
| 8 | `Industrials` | `IN-001` | `sector.industrials` / `1.0.0` / `1.0.0` | `SNAP_5A81D1B1` | `ev_sector.industrials_2026-08-09T00:00:00.000Z` | `"77.2"` | `"75"` | `AVAILABLE` / `"75"` | `41e8e3fcac105e4e1dc53d3130b021ae8119af0b2a74e687b3b806526cb25089` |
| 9 | `Insurance` | `IN-001` | `sector.insurance` / `1.0.0` / `1.0.0` | `SNAP_B617CBA9` | `ev_sector.insurance_2026-08-09T00:00:00.000Z` | `"72.3"` | `"72.2"` | `AVAILABLE` / `"72.5"` | `45170883095c2f3713e93e0c90656d6ceda5b09f0fed00fb352b584ff03c601d` |
| 10 | `Materials & Metals` | `MM-001` | `sector.materials` / `1.0.0` / `1.0.0` | `SNAP_319C7278` | `ev_sector.materials_2026-08-09T00:00:00.000Z` | `"74.9"` | `"74.9"` | `AVAILABLE` / `"74.9"` | `fdb38b080e72e379ad68d08f87b24d12f153b52d155d0d55b97238835e694003` |
| 11 | `Technology` | `TE-001` | `sector.technology` / `1.0.0` / `1.0.0` | `SNAP_574D773B` | `ev_sector.technology_2026-08-09T00:00:00.000Z` | `"76.3"` | `"85.5"` | `AVAILABLE` / `"75"` | `f3e3dffa0d0b1e1a2f8481acb6c8169366a1a3479bc0c5ca30d9fc31dc83d836` |
| 12 | `Telecommunications` | `TL-001` | `sector.telecom` / `1.0.0` / `1.0.0` | `SNAP_5C1E0B10` | `ev_sector.telecom_2026-08-09T00:00:00.000Z` | `"68.4"` | `"68.4"` | `AVAILABLE` / `"68.4"` | `19e089121a87521f3d4e21c9ef876d380a660216a7b37ac45baeae882cdef053` |
| 13 | `Utilities` | `UT-001` | `sector.utilities` / `1.0.0` / `1.0.0` | `SNAP_152814EF` | `ev_sector.utilities_2026-08-09T00:00:00.000Z` | `"74.1"` | `"79.5"` | `AVAILABLE` / `"75"` | `6bff5c15c509ef158fa5e72e71c0e69f44b6d9c3be23b3175cb453aa5224e27c` |

### 4.3 Minimum Reproducibility Requirements for Formal Certification (`D-N4-CERT-05`)

1. **Already Governed & Enforced by Contract (`N4-A5`, `N4-A6`, `N4-A9`, `N4-A12`):**
   - Identical canonical member inputs produce byte-identical `NP12MBR v01` `inputHash`;
   - Identical G5-ordered member inputs and bound `ScreenDefinition` produce byte-identical `NP12EXE v01` `executionId`;
   - Identical `COMPLETED` member outcomes produce byte-identical `NP12RES v01` `resultId`;
   - Audit-only `timestamp` and `requestId` are excluded from all identity preimages;
   - Zero `Date.now()` or `Math.random()` dependency in any identity path;
   - `snapshotId` and `evidenceId` are supplied from the deterministic runtime execution rather than generated by the Screen evaluator;
   - Member ordering follows the governed `G5` comparator (`compareMembers`) verbatim, invariant to caller array permutation.
2. **Explicitly Pinned by This Record for Certification (`D-N4-CERT-04` / `D-N4-CERT-05`):**
   - `DEFAULT_PRODUCER_CLOCK_EPOCH = '2026-08-09T00:00:00.000Z'` and `DeterministicIdProvider("${canonicalSector}:${companyId}")` are pinned as the canonical certification replay clock/seed convention for `ScreenProducerAdapter.produceScreenMember()`, yielding the exact 13-sector `snapshotId`, `evidenceId`, `inputHash`, `populationIdentity`, `executionId`, and `resultId` values recorded in §§4.1–4.2.

---

## 5. Certification Authority, Acceptance Boundary & Durable Publication (`D-N4-CERT-06`, `D-N4-CERT-07`, `D-N4-CERT-10`)

1. **`D-N4-CERT-06` — Certification Authority:**
   - **Program Authority (Ramki / Ramakrishnan)** is the sole Certification Authority for `N4-SD`, `N4-A10`, `N4-A13`, and the combined `NP-12 N4` Screen Certification Envelope. No additional or external authority hierarchy exists or is invented.
2. **`D-N4-CERT-07` — Acceptance Authority & Later Acceptance Boundary:**
   - **Program Authority (Ramki / Ramakrishnan)** is the sole Acceptance Authority.
   - Formal Program Authority Acceptance remains strictly **distinct from certification** and **deferred until after the dedicated `NP-12 N4` Certification Gate is executed and verified** (`D-A15-04 = DO NOT ACCEPT / DEFER`). Neither `N4-A13` nor the combined `NP-12 N4` stack is marked accepted or certified by this preparation record.
3. **`D-N4-CERT-10` — Durable Publication Disposition:**
   - Program Authority authorizes durable publication of this decision record (`NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md`) to `ramkivs/iips-review-recovered` (`refs/heads/main`) to establish the binding certification envelope, `D-N4-CERT-01`/`D-N4-CERT-02` conformance resolutions, and pinned 13-sector replay baseline parameters prior to executing the dedicated `NP-12 N4` Certification Gate.
   - A dedicated certification artifact (`docs/integration/IIPS_NP-12_N4_SCREEN_CERTIFICATION.md` or root equivalent) will be durably published in the subsequent **Dedicated `NP-12 N4` Certification & Acceptance Execution Gate** (`NP-12 N4-A16`).

---

## 6. Complete Decision Register (`D-N4-CERT-01` … `D-N4-CERT-10`)

| Decision ID | Subject | Program Authority Ruling | Status |
|---|---|---|---|
| **`D-N4-CERT-01`** | `G-A14-01` (`sector.auto` growth constituent keys) | **`A — Confirm ['AU-002', 'AU-003'] as authoritative`** (reconciles descriptive `N4-A12` §7 table with frozen `AutoScoreEngine.ts:55` and `N4-A13`; zero code changes) | **APPROVED / CLOSED** |
| **`D-N4-CERT-02`** | `G-A14-02` (5-engine live missing-growth fail-closed boundary under `A12-D02`) | **`A — Confirm the five-engine fail-closed boundary as the intended governed conformance behavior`** (`adaptExecutionResultToScreenMember` total across all 11 input-backed engines; live `produceScreenMember` fails closed on `Hospitality`, `Energy`, `Utilities`, `Consumer`, `Industrials` when `undefined` growth inputs prevent frozen engine execution; zero engine changes) | **APPROVED / CLOSED** |
| **`D-N4-CERT-03`** | Certification envelope scope | **`A — Approve Envelope:`** `N4-SD` + `N4-A10` + `N4-A13` only; `E2E-030`, Production, IPD, persistence, UI, transport, sector engines, `renorm()`, and CSIP ontology excluded | **APPROVED / CLOSED** |
| **`D-N4-CERT-04`** | Certification replay baseline scope | **`A — Approve Replay Baseline Pinning:`** pin commit `9f93c6c8aadb264f433511e85c6c4b64b2469a12`, `DEFAULT_PRODUCER_CLOCK_EPOCH = '2026-08-09T00:00:00.000Z'`, seed `${canonicalSector}:${companyId}`, evaluator identity `NP12-SCREEN-EVALUATOR`/`01`/`01`, and the 13-sector digests in §§4.1–4.2 | **APPROVED / CLOSED** |
| **`D-N4-CERT-05`** | 13-sector deterministic replay requirements | **`A — Approve Determinism Requirements:`** enforce all 9 reproducibility invariants in §4.3 across `N4-SD` (`35/35`), `N4-A10` (`45/45`), and `N4-A13` (`14/14`) | **APPROVED / CLOSED** |
| **`D-N4-CERT-06`** | Certification authority | **`A — Confirm Program Authority (Ramki)`** as sole Certification Authority for `N4-SD`, `N4-A10`, `N4-A13`, and the combined `NP-12 N4` envelope | **APPROVED / CLOSED** |
| **`D-N4-CERT-07`** | Acceptance authority / later acceptance boundary | **`A — Confirm Program Authority (Ramki)`** as sole Acceptance Authority; formal acceptance remains deferred (`D-A15-04`) until completion of the dedicated certification gate | **APPROVED / CLOSED** |
| **`D-N4-CERT-08`** | `E2E-030` separation | **`A — Preserve Strict Separation:`** `E2E-030` remains untouched (`0` diffs) and is never claimed to certify `NP-12` | **APPROVED / CLOSED** |
| **`D-N4-CERT-09`** | `A8-S-03` preservation | **`A — Preserve A8-S-03 Option A:`** structural failures fail closed before `executionId`/`resultId`; `FAILED` is lifecycle/error classification only; `INVALID_MEMBER` remains inside `COMPLETED` | **APPROVED / CLOSED** |
| **`D-N4-CERT-10`** | Durable publication of certification-envelope decision record & future certification artifact | **`A — Authorize Durable Publication:`** publish `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` to `refs/heads/main` now; publish the formal certification & acceptance record in the next gate (`NP-12 N4-A16`) | **APPROVED / CLOSED** |

---

## 7. Evidence Inventory Consumed Without Duplication or Inflation

| Evidence Surface | Authoritative Location on `origin/main` (`9f93c6c8aadb264f433511e85c6c4b64b2469a12`) | Verified Result | What It Proves (and Boundary) |
|---|---|---|---|
| **`N4-SD` Implementation & Conformance (`35/35`)** | `iips-platform/docs/NP-12-N4-SCREEN-DEFINITION-IMPLEMENTATION.md`, `np12-n4-screen-definition.test.ts`, `np12-n4-screen-definition-format1.json` | `35 / 35` PASS (`E01–E14` literal vectors) | Proves `ScreenDefinition` (`NP12DEF v01`) conformance; does not certify execution or producer layers. |
| **`N4-A10` Screen Runtime Conformance (`45/45`)** | `NP-12-N4-A9-IMPLEMENTATION-RECORD.md`, `np12-n4-a9-screen-runtime.test.ts`, `np12-n4-a9-screen-runtime-format1.json` | `45 / 45` PASS (`6` literal vector scenarios + `N4-SD` differential decimal parity) | Proves engine-free `NP12MBR` / `NP12EXE` / `NP12RES` `v01` runtime conformance (`COMPLETED` branch). |
| **`N4-A13` Screen Producer Conformance (`14/14`)** | `NP-12-N4-A13-IMPLEMENTATION-RECORD.md`, `np12-n4-screen-producer.test.ts`, `ScreenProducerAdapter.ts` | `14 / 14` PASS (`642` total / `600` pass / `42` pre-existing fail / `0` new fail; `tsc --noEmit` `0` errors) | Proves 13-engine producer convergence (`GDS-01`..`GDS-12`), live-input sensitivity, `N4-A10` byte-exact differential parity, and replay determinism. |
| **Protected-Surface Zero-Diff Proof** | `git diff 8d1426504ffb955e323110963086d8abf385b7df..9f93c6c8aadb264f433511e85c6c4b64b2469a12` | `0` modifications to any existing file (`4` additions only) | Proves zero changes to all 13 sector engines, `renorm()`, `N4-SD`, `N4-A10`, CSIP, `EngineRegistry`, `EngineApiAdapter`, and `E2E-030`. |

---

## 8. Explicit Non-Actions & Authority Boundary

This record:
1. Grants **no** implementation authority and performs **no** code, test, fixture, engine, `renorm()`, CSIP, `N4-A6`, `N4-A10`, `N4-A13`, `E2E-030`, `IPD`, or production modifications;
2. Does **not** declare `N4-SD`, `N4-A10`, or `N4-A13` certified or accepted ahead of the dedicated certification gate (`NP-12 N4-A16`);
3. Becomes durably effective upon publication to `ramkivs/iips-review-recovered` `refs/heads/main` and independent remote verification of commit, tree, blob SHA, and raw SHA-256.

---

## 9. Next Gate

> **`NP-12 N4-A16 — Dedicated NP-12 N4 Screen Certification & Program Authority Acceptance Gate`**
>
> Upon durable publication and remote verification of `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` on `refs/heads/main`, `NP-12 N4-A16` will verify the certification envelope (`N4-SD` + `N4-A10` + `N4-A13`) against the pinned 13-sector replay baseline (§4) and execute Program Authority's formal certification and post-certification acceptance decision.

---

**End of NP-12 N4-A15 Authority Decision Record.**
