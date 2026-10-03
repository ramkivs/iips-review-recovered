# NP-12 N4-A12 — 13-Engine Producer Convergence Governance & Implementation Authority Decision Record

**Record identifier:** `NP-12-N4-A12`
**Record type:** Program Authority governance & implementation-authority decision record — approved decisions `GDS-01`..`GDS-12` and `A12-D01`..`A12-D03`
**Workstream:** NP-12 — Governed Screener
**Gate:** NP-12 N4-A12 — 13-Engine Producer Convergence Governance & Implementation Authority Decision (Reconciled)
**Program Authority / Signer:** Ramki (Ramakrishnan)
**Mode:** GOVERNANCE & IMPLEMENTATION AUTHORITY DECISION ONLY — **NO IMPLEMENTATION**
**Primary Repository:** `ramkivs/iips-review-recovered` (IRR) — authoritative ref `refs/heads/main`
**IPD:** `ramkivs/iips-production-market-data` — REFERENCE-ONLY, zero mutations
**Production:** OUT OF SCOPE, zero mutations
**Implementation in this gate:** **NONE.** Zero source, test, fixture, runtime, sector-engine, `renorm()`, CSIP, or certification changes performed.
**GDS-01..GDS-12 Governance Status:** **ALL 12 DECISIONS CLOSED / ACCEPTED** (`GDS-03` reconciled to **Option B — Banking `UNAVAILABLE` / `null`**; `GDS-07` reconciled to **Option 2 — Sector-Scoped Composite Key Confirmation**).
**Implementation Authority Status:** **BOUNDED IMPLEMENTATION AUTHORITY GRANTED — INCREMENT 2 (`A12-D01`, `A12-D02`)**. Nothing beyond Section 12 is authorized.
**Publication Status of This Record:** **PUBLICATION AUTHORIZED (`A12-D03`)**. Prepared at `/home/user/NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md` for durable publication to `refs/heads/main` and independent remote verification by the publishing session (per the established `NP-12-N4-A9` §3.3 / §12 / §14.8 publication pattern).

---

## 1. Gate Identity & Repository Scope

- **Gate:** NP-12 N4-A12 — 13-Engine Producer Convergence Governance & Implementation Authority Decision (Reconciled)
- **Primary / Authoritative Repository:** `ramkivs/iips-review-recovered` (IRR), ref `refs/heads/main`, remote `origin`
- **IPD (`ramkivs/iips-production-market-data`):** REFERENCE-ONLY (zero mutation)
- **Production:** OUT OF SCOPE (zero mutation)

---

## 2. Mandatory Live Baseline Verification

Verified against live `ramkivs/iips-review-recovered` (`git fetch origin main` and `git ls-remote origin refs/heads/main`):

| Verification Item | N4-A10 / Gate Entry Baseline | Current Live `origin/main` (post-PR #25 NP-13 doc merge) | Status |
|---|---|---|---|
| `origin/main` commit | `a0386fe8bf520891d67a2fb9d44fda1847a8afac` | `dbd4c26a95e848dd89a3e462305ba044fcf973ab` | **VERIFIED LIVE** |
| `origin/main` root tree | `e22f04b0643ba10851147265fcf70acda812c881` | `333bd2992c79b520fad528430b318a5f06f93922` | **VERIFIED LIVE** |
| `N4-A1` bound baseline commit | `f2886a5af43ad8df8676589daef86836039150f5` | `f2886a5af43ad8df8676589daef86836039150f5` | **EXACT MATCH (UNCHANGED)** |
| `N4-A1` bound baseline tree | `46c1a15bbcd1291701484457d1fe9815d8538888` | `46c1a15bbcd1291701484457d1fe9815d8538888` | **EXACT MATCH (UNCHANGED)** |
| `NP-12-N4-A6-CONTRACT-SPECIFICATION.md` | blob `3407ea22eaa15e508744f2e6c4f81097242e0dce` / sha256 `2c889c3c5dec346b6c2270c76c746f183804ad78af87d5d26393ba6cc3427531` | blob `3407ea22eaa15e508744f2e6c4f81097242e0dce` / sha256 `2c889c3c5dec346b6c2270c76c746f183804ad78af87d5d26393ba6cc3427531` | **EXACT MATCH** |
| `NP-12-N4-A8-IMPLEMENTATION-READINESS-DETERMINATION.md` | blob `851783366c2a791aced31161948486a28022e866` / sha256 `182e85e22c6b42abb530178011bd088c8d3858a0fb8b11a536ec0f4408d88979` | blob `851783366c2a791aced31161948486a28022e866` / sha256 `182e85e22c6b42abb530178011bd088c8d3858a0fb8b11a536ec0f4408d88979` | **EXACT MATCH** |
| `NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md` | blob `5f27c23719d8fb9cc6c86860e6ab7e90ad7a22b4` / sha256 `bf3d86332e6c505eaaae57469fd7cb768b8caa4731ed248f1e562bfcd5ff89b1` | blob `5f27c23719d8fb9cc6c86860e6ab7e90ad7a22b4` / sha256 `bf3d86332e6c505eaaae57469fd7cb768b8caa4731ed248f1e562bfcd5ff89b1` | **EXACT MATCH** |
| `NP-12-N4-A9-IMPLEMENTATION-RECORD.md` (N4-A10) | blob `fddbf1f9ce7356261e3fdb8223d70fa3c14d839f` / sha256 `92f09840a49afb57ed7660a7933b5bb43271b5a59b9ad3152bbfea99c1e68dd6` | blob `fddbf1f9ce7356261e3fdb8223d70fa3c14d839f` / sha256 `92f09840a49afb57ed7660a7933b5bb43271b5a59b9ad3152bbfea99c1e68dd6` | **EXACT MATCH** |
| `ScreenMemberInput.ts` | blob `94fc78099869271005da09887ec2c94f56b494e3` | blob `94fc78099869271005da09887ec2c94f56b494e3` | **EXACT MATCH** |
| `CanonicalFormats.ts` | blob `1192be620f48af1b0a66f3564c977406b35bb07a` | blob `1192be620f48af1b0a66f3564c977406b35bb07a` | **EXACT MATCH** |
| `ScreenEvaluator.ts` | blob `41e5874957e50ba7a5e8f8a48420ac348d7a10ac` | blob `41e5874957e50ba7a5e8f8a48420ac348d7a10ac` | **EXACT MATCH** |
| `ScreenExecution.ts` | blob `52c70e2570f17e64c450d3edcaaa290dfde91167` | blob `52c70e2570f17e64c450d3edcaaa290dfde91167` | **EXACT MATCH** |
| `ScreenResult.ts` | blob `b2db3fc4284e57b1b3214b86a93fc4b432b34603` | blob `b2db3fc4284e57b1b3214b86a93fc4b432b34603` | **EXACT MATCH** |
| `screen/index.ts` | blob `06cbda47e183b419ab05bf279f5eb95fb0a36ec5` | blob `06cbda47e183b419ab05bf279f5eb95fb0a36ec5` | **EXACT MATCH** |
| `np12-n4-a9-screen-runtime.test.ts` | blob `46ec7a13b9ed8f2f5143578451bb3336e36e6b73` | blob `46ec7a13b9ed8f2f5143578451bb3336e36e6b73` | **EXACT MATCH** |
| `np12-n4-a9-screen-runtime-format1.json` | blob `3f0de36d5ce55421f459be6f69f55b9db715fa0a` | blob `3f0de36d5ce55421f459be6f69f55b9db715fa0a` | **EXACT MATCH** |
| IRR worktree cleanliness | `git status --porcelain` empty; zero pre-existing local mutations | `git status --porcelain` empty; zero local mutations | **PASS** |

---

## 3. Frozen Decisions and Non-Reopening Rule

The following remain binding, closed, and **MUST NOT** be reopened, amended, or reinterpreted:
- `N1` — Screen Purpose & Product Role
- `N2` / `G1–G5` — Screener Capability Contract (including `G5` deterministic ordering)
- `N3` — Cross-Sector Compatibility Boundary
- `N4` — Canonical Screen Definition Model (`ScreenDefinitionV1`, `NP12DEF`, version `01`)
- `N4-SD` — ScreenDefinition Implementation & Conformance Suite
- `N4-A1` — Live Baseline & Engine Inventory Audit (`f2886a5af43ad8df8676589daef86836039150f5` / tree `46c1a15bbcd1291701484457d1fe9815d8538888`)
- `N4-A3` — Cross-Sector Semantic Compatibility & Score Comparability (`D-A2-1`..`D-A2-7`)
- `N4-A5` — End-to-End Execution, Determinism, Evidence & Failure Semantics (`A5-D01`..`A5-D07`)
- `N4-A6` — Normative Contract Specification (`NP12MBR` / `NP12EXE` / `NP12RES` `v01`, `A6-DR-01`..`A6-DR-06`)
- `N4-A8` — Implementation Readiness & Producer Conformance Audit (`A6-IMPL-01`..`A6-IMPL-10`, `A8-S-01`..`A8-S-06`)
- `N4-A9` — Implementation Authority Decision (`A9-D01`, `A9-D02`, `A9-D03`)
- `N4-A10` — Controlled Increment 1 Implementation (**CLOSED / COMPLETE / DURABLY VERIFIED**)

`A8-S-03` (`FAILED` execution result branch) remains an independent open governance gap and is excluded from N4-A12 and from Increment 2 (`N4-A13`). `N4-A6` is not amended.

---

## 4. Decision GDS-01 — Runtime Pillar Retrieval

- **Decision:** **CONFIRMED — ACCEPTED / ALREADY GOVERNED**
- **Selected Mechanism:**
  ```text
  ExecutionResult.snapshotRef
          ↓
  SnapshotStore.get(snapshotRef)
          ↓
  SnapshotRecord.supportingScores
          ↓
  runtime score.pillars
  ```
- **Rationale:** All 13 certified sector engines pass `score.pillars` into `this.runtime.recordSnapshot(...)`, which `SnapshotService.create()` (`iips-platform/src/snapshot/SnapshotService.ts:41`) stores in `SnapshotRecord.supportingScores` keyed by `ExecutionResult.snapshotRef`. Retrieving runtime pillars from `SnapshotRecord.supportingScores` satisfies `A6-IMPL-10` without modifying the 9 sector engines whose `ExecutionResult.metadata` omits `pillars`.
- **Prohibition:** The producer **MUST NOT** read `*-expected-outputs-1.0.0.json` or `*-golden-reference-1.0.0.json` as an authoritative runtime value source (`A5-D06` / `A6-D06`). Golden fixtures remain test/certification oracles only.
- **Changes existing contract?** No.

---

## 5. Decision GDS-02 — Domain-Pillar → Screen `quality` Mapping

- **Decision:** **APPROVED — EXPLICIT 13-ENGINE `quality` PILLAR BINDING**
- **Selected Option for Healthcare & Hospitality:**
  - **Healthcare (`sector.healthcare`):** **Option B — `'clinical-quality'` → `quality`**
  - **Hospitality (`sector.hospitality`):** **Option B — `'earningsQuality'` → `quality`**
- **Complete 13-Engine Runtime Pillar → Screen `quality` Binding Table:**

| # | Sector (`CANONICAL_SECTORS`) | `engineId` | Runtime `score.pillars` Key Bound to Screen `quality` | Basis |
|---|---|---|---|---|
| 1 | `Banking` | `sector.banking` | `'asset-quality'` | Confirmed GDS-02 domain-pillar binding (`BankingScoreEngine.ts:9-17`) |
| 2 | `Insurance` | `sector.insurance` | `'underwriting'` | Confirmed GDS-02 domain-pillar binding (`InsuranceScoreEngine.ts:6-12`) |
| 3 | `Capital Markets` | `sector.capital-markets` | `'earnings-quality'` | Confirmed GDS-02 domain-pillar binding (`CapitalMarketsScoreEngine.ts:5-11`) |
| 4 | `Healthcare` | `sector.healthcare` | `'clinical-quality'` | **Ramki explicit selection: Option B** (aligned with `HEALTHCARE_ONTOLOGY_METADATA` `'HC-004': 'Quality'` in `HealthcareEngine.ts:21`) |
| 5 | `Hospitality` | `sector.hospitality` | `'earningsQuality'` | **Ramki explicit selection: Option B** (aligned with `HOSPITALITY_ONTOLOGY_METADATA` `earningsQuality: 'Quality'` in `HospitalityEngine.ts:19`) |
| 6 | `Energy` | `sector.energy` | `'quality'` | Canonical runtime pillar key (`EnergyScoreEngine.ts:12-19`) |
| 7 | `Utilities` | `sector.utilities` | `'quality'` | Canonical runtime pillar key (`UtilitiesScoreEngine.ts:12-19`) |
| 8 | `Consumer` | `sector.consumer` | `'quality'` | Canonical runtime pillar key (`ConsumerScoreEngine.ts:12-19`) |
| 9 | `Industrials` | `sector.industrials` | `'quality'` | Canonical runtime pillar key (`IndustrialsScoreEngine.ts:12-19`) |
| 10 | `Technology` | `sector.technology` | `'quality'` | Canonical runtime pillar key (`TechnologyScoreEngine.ts:22-29`) |
| 11 | `Telecommunications` | `sector.telecom` | `'quality'` | Canonical runtime pillar key (`TelecomScoreEngine.ts:12-19`) |
| 12 | `Automobile` | `sector.auto` | `'quality'` | Canonical runtime pillar key (`AutoScoreEngine.ts:12-19`) |
| 13 | `Materials & Metals` | `sector.materials` | `'quality'` | Canonical runtime pillar key (`MaterialsScoreEngine.ts:12-19`) |

- **Explicit Exclusions:** `frontend/server/executive-transport.ts` is not treated as governance authority and is not modified. None of the 13 sector engines is modified.
- **Changes existing contract?** No.

---

## 6. Decision GDS-03 — Banking Growth `50` Classification

- **Decision:** **APPROVED — GDS-03 OPTION B (`UNAVAILABLE` / `null`)**
- **Selected Option:** **Option B**
  ```text
  growthAvailability = "UNAVAILABLE"
  growth = null
  ```
- **Rationale:** Although `BankingScoreEngine.ts:62` emits a hardcoded literal `'growth': 50` in `score.pillars`, `BankingInput` (`BankingMetrics.ts:4-17`) contains no underlying governed Banking growth metric. Per Program Authority's authoritative decision (`GDS-03 Option B`), no underlying governed Banking growth metric is claimed by the Screen producer; the literal runtime Banking pillar of `50` is not classified as available Screen growth, and the producer MUST emit `growthAvailability = "UNAVAILABLE"` and `growth = null` for `sector.banking`.
- **Explicit Exclusions:** `BankingScoreEngine.ts` and `BankingEngine.ts` **MUST NOT** be modified.
- **Changes existing contract?** No — resolves the `A6 §10` Item 2 semantic classification for `sector.banking` under `A6-DR-01`.

---

## 7. Decisions GDS-04 & GDS-05 — Healthcare & Input-Backed Growth Availability Rule

- **Decision:** **APPROVED — GDS-04 HEALTHCARE `UNAVAILABLE` + GDS-05 INPUT-BACKED GROWTH AVAILABILITY RULE**
- **Selected Rule:**
  1. **GDS-04 — Healthcare (`sector.healthcare`):**
     `HealthcareScoreEngine.ts:10-16, 42-56` computes no runtime `growth` pillar. Therefore, for `sector.healthcare`, the producer representation is unconditionally:
     ```text
     growthAvailability = "UNAVAILABLE"
     growth = null
     ```
     No reconstruction from `composite`, `quality`, another pillar, or transport fallback is permitted (`A5-D02` / `A6-D02`).
  2. **GDS-05 — Input-Backed Growth Availability Rule (for the 11 input-backed engines):**
     For every engine whose runtime `growth` pillar is derived from governed input constituents:
     ```text
     if all governed growth constituent inputs in the runtime input record are undefined or null:
         growthAvailability = "UNAVAILABLE"
         growth = null
     else:
         growthAvailability = "AVAILABLE"
         growth = serializeCanonicalDecimal(runtime score.pillars.growth)
     ```
- **Bound Growth Constituent-Input Sets per Engine (Implementation Data):**

| # | Sector | `engineId` | Growth Availability Regime | Governed Growth Constituent Input Keys in `inputs` |
|---|---|---|---|---|
| 1 | `Banking` | `sector.banking` | **GDS-03 Option B** (no governed growth metric) | N/A — always `growthAvailability = "UNAVAILABLE"`, `growth = null` |
| 2 | `Insurance` | `sector.insurance` | **GDS-05 Input-Backed** (`InsuranceScoreEngine.ts:21-22, 30`) | `['IM-003', 'IM-004']` |
| 3 | `Capital Markets` | `sector.capital-markets` | **GDS-05 Input-Backed** (`CapitalMarketsScoreEngine.ts:15, 19, 22`) | `['CM-002', 'CM-006']` |
| 4 | `Healthcare` | `sector.healthcare` | **GDS-04 Structural Absence** (`HealthcareScoreEngine.ts:10-16`) | N/A — always `growthAvailability = "UNAVAILABLE"`, `growth = null` |
| 5 | `Hospitality` | `sector.hospitality` | **GDS-05 Input-Backed** (`HospitalityScoreEngine.ts:47`) | `['revparGrowth']` |
| 6 | `Energy` | `sector.energy` | **GDS-05 Input-Backed** (`EnergyScoreEngine.ts:46-48`) | `['productionGrowth', 'revenueGrowth']` |
| 7 | `Utilities` | `sector.utilities` | **GDS-05 Input-Backed** (`UtilitiesScoreEngine.ts:48-52`) | `['rateBaseGrowth', 'demandGrowth', 'revenueGrowth']` |
| 8 | `Consumer` | `sector.consumer` | **GDS-05 Input-Backed** (`ConsumerScoreEngine.ts:49-53`) | `['revenueGrowth', 'dtcShare', 'innovationIntensity']` |
| 9 | `Industrials` | `sector.industrials` | **GDS-05 Input-Backed** (`IndustrialsScoreEngine.ts:72`) | `['backlog', 'orderGrowth', 'revenueGrowth']` (`IM-006`, `IM-010`, `IM-002`) |
| 10 | `Technology` | `sector.technology` | **GDS-05 Input-Backed** (`TechnologyScoreEngine.ts:81`) | `['revenueGrowth', 'usageGrowth', 'rdIntensity']` (`TM-002`, `TM-012`, `TM-009`) |
| 11 | `Telecommunications` | `sector.telecom` | **GDS-05 Input-Backed** (`TelecomScoreEngine.ts:48`) | `['TL-002', 'TL-003']` |
| 12 | `Automobile` | `sector.auto` | **GDS-05 Input-Backed** (`AutoScoreEngine.ts:49`) | `['AU-001', 'AU-004']` |
| 13 | `Materials & Metals` | `sector.materials` | **GDS-05 Input-Backed** (`MaterialsScoreEngine.ts:56`) | `['MM-002', 'MM-003']` |

- **Explicit Exclusions:** Neither `renorm()` nor any sector engine is modified.
- **Changes existing contract?** No.

---

## 8. Decision GDS-06 — Runtime Float → Canonical Decimal Serialization

- **Decision:** **APPROVED — OPTION A (6dp Round-Half-to-Even at `10^6` Scale)**
- **Selected Option:** **Option A — 6dp Half-to-Even**
- **Exact Rule:**
  1. Verify that the runtime numeric score `x` (`conviction`, `quality`, or available `growth`) is a finite `number` in `[0, 100]`; otherwise fail closed.
  2. Convert `x` using deterministic **round-half-to-even** at scale `10^6` (`1,000,000`), strip trailing fractional zeroes (and the decimal point when the fractional part is zero), and emit canonical decimal text conforming to `N4-A6` (`≤ 6` fractional digits; no silent deviation from `N4-A6` canonical grammar).
  3. Examples:
     - `77.03999999999999` → `"77.04"`
     - `80.76923076923076` → `"80.769231"`
     - `64.33333333333333` → `"64.333333"`
- **Explicit Exclusions:** Do not modify any sector engine.
- **Changes existing contract?** No.

---

## 9. Decision GDS-07 — Member Identity & Sector-Scoped Baseline Identity Confirmation

- **Decision:** **CLOSED / ACCEPTED — SECTOR-SCOPED MEMBER IDENTITY CONFIRMED (GDS-07 OPTION 2)**
- **Selected Mechanism:**
  1. **Caller/Request-Bound Identity Rule:**
     - Canonical member identity token is caller/request-bound `companyId`;
     - Accepted canonical field: `request.companyId` or `inputs.companyId` (falling back to governed `inputs.id` only when caller binds a golden fixture record whose canonical ID is carried in `inputs.id` and matches `companyId`);
     - Optional `referenceId`: if supplied alongside `companyId`, it must equal `companyId` byte-for-byte after validation; if mismatched, fail closed;
     - Fail closed if `companyId` is absent, empty, whitespace-only, non-ASCII, or contains control/NUL characters (`N4-A6 §7.1`);
     - Synthetic `${sector}-H1` identity (`executive-transport.ts:183`) is strictly prohibited.
  2. **Program Authority Final Identity Discriminator Decision (`GDS-07 Option 2 — Sector-Scoped Composite Key Confirmation`):**
     - Exhaustive inspection of `ramkivs/iips-review-recovered` established that frozen `IES-007 Insurance` (`insurance-golden-reference-1.0.0.json:9`, `insurance-expected-outputs-1.0.0.json:6`, `PORTFOLIO_GOLDEN_DATASET.json:13`) and frozen `IES-014 Industrials` (`PROGRAM_v1.1_REPLAY_BASELINE.json:241`, `industrials-golden-reference-1.0.0.json:9`, `industrials-expected-outputs-1.0.0.json:9`, `industrials-replay-dataset-1.0.0.json:16`) both use `"IN-001"` as their primary entity/provider identifier, and no distinct authoritative Industrials entity identifier exists in IRR.
     - Under `N4-A3` (`D-A2-1`), `N4-A6` (`§7.1` / `§9.2`), and `N4-A10` (`ScreenExecution.ts:99-105`, which enforces `DUPLICATE_MEMBER_IDENTITY` on the sector-qualified composite key `${member.sector}\u0000${member.companyId}`), Screen member identity is governed by the composite **`(sector, referenceId)`**.
     - Program Authority confirms that:
       - `("Insurance", "IN-001")`
       - `("Industrials", "IN-001")`
       are **distinct governed Screen member identities** under the existing `N4-A3` / `N4-A6` / `N4-A10` identity model, and both sectors retain their frozen `"IN-001"` identifier.
     - **Explicit Prohibitions:** Do **not** invent `INS-001`; do **not** invent `IND-001`; do **not** modify frozen engine datasets; do **not** modify `PROGRAM_v1.1_REPLAY_BASELINE.json`; do **not** reinterpret the underlying provider/entity identifiers; do **not** broaden `GDS-07` into a global `companyId` namespace decision.
  3. **Approved 13-Sector Golden Baseline Composite Member Identity Binding Table (`(sector, companyId)`):**

| # | Sector (`CANONICAL_SECTORS`) | `engineId` | Bound Golden Baseline `companyId` | Governed Composite Member Identity `(sector, companyId)` | Authoritative IRR Source |
|---|---|---|---|---|---|
| 1 | `Banking` | `sector.banking` | `"BK-001"` | `("Banking", "BK-001")` | `banking-golden-reference-1.0.0.json:9` / `banking-expected-outputs-1.0.0.json:6` |
| 2 | `Insurance` | `sector.insurance` | `"IN-001"` | `("Insurance", "IN-001")` | `insurance-golden-reference-1.0.0.json:9` / `insurance-expected-outputs-1.0.0.json:6` / `PORTFOLIO_GOLDEN_DATASET.json:13` |
| 3 | `Capital Markets` | `sector.capital-markets` | `"CM-001"` | `("Capital Markets", "CM-001")` | `capital-markets-golden-reference-1.0.0.json:9` / `capital-markets-expected-outputs-1.0.0.json:6` |
| 4 | `Healthcare` | `sector.healthcare` | `"HC-001"` | `("Healthcare", "HC-001")` | `healthcare-golden-reference-1.0.0.json:9` / `healthcare-expected-outputs-1.0.0.json:6` |
| 5 | `Hospitality` | `sector.hospitality` | `"HP-001"` | `("Hospitality", "HP-001")` | `PROGRAM_v1.1_REPLAY_BASELINE.json:103` / `hospitality-golden-reference-1.0.0.json:9` |
| 6 | `Energy` | `sector.energy` | `"EN-001"` | `("Energy", "EN-001")` | `PROGRAM_v1.1_REPLAY_BASELINE.json:139` / `energy-golden-reference-1.0.0.json:9` |
| 7 | `Utilities` | `sector.utilities` | `"UT-001"` | `("Utilities", "UT-001")` | `PROGRAM_v1.1_REPLAY_BASELINE.json:175` / `utilities-golden-reference-1.0.0.json:9` |
| 8 | `Consumer` | `sector.consumer` | `"CS-001"` | `("Consumer", "CS-001")` | `PROGRAM_v1.1_REPLAY_BASELINE.json:209` / `consumer-golden-reference-1.0.0.json:9` |
| 9 | `Industrials` | `sector.industrials` | `"IN-001"` | `("Industrials", "IN-001")` | `PROGRAM_v1.1_REPLAY_BASELINE.json:241` / `industrials-golden-reference-1.0.0.json:9` / `industrials-expected-outputs-1.0.0.json:9` |
| 10 | `Technology` | `sector.technology` | `"TE-001"` | `("Technology", "TE-001")` | `PROGRAM_v1.1_REPLAY_BASELINE.json:277` / `technology-golden-reference-1.0.0.json:9` |
| 11 | `Telecommunications` | `sector.telecom` | `"TL-001"` | `("Telecommunications", "TL-001")` | `telecommunications-golden-reference-1.0.0.json:9` / `telecommunications-expected-outputs-1.0.0.json:9` |
| 12 | `Automobile` | `sector.auto` | `"AU-001"` | `("Automobile", "AU-001")` | `automobile-golden-reference-1.0.0.json:9` / `automobile-expected-outputs-1.0.0.json:9` |
| 13 | `Materials & Metals` | `sector.materials` | `"MM-001"` | `("Materials & Metals", "MM-001")` | `materials-metals-golden-reference-1.0.0.json:9` / `materials-metals-expected-outputs-1.0.0.json:9` |

- **Changes existing contract or runtime?** No `N4-A6` contract amendment is required; no `N4-A10` runtime change is required.

---

## 10. Decision GDS-08 — `engineVersion` & `calibrationVersion` Provenance Authority

- **Decision:** **APPROVED — OPTION A (`EngineRegistry.getEngine(result.engineId)`)**
- **Selected Option:** **Option A — Engine Registry**
- **Exact Rule:**
  1. Bind the governed `EngineRegistry` (`iips-platform/src/integration/EngineRegistry.ts`) into the Screen producer adapter.
  2. Look up `const reg = registry.getEngine(result.engineId)`.
  3. Verify `reg.engineId === result.engineId` (and, where `result.metadata.calibrationVersion` is present on the 9 newer engines, verify `String(result.metadata.calibrationVersion) === reg.calibrationVersion`; fail closed on mismatch).
  4. Populate `engineVersion: reg.engineVersion` (`"1.0.0"`) and `calibrationVersion: reg.calibrationVersion` (`"1.0.0"`).
- **Explicit Exclusions:** Do not modify `EngineRegistry.ts`, `EngineApiAdapter.ts`, or any sector engine.
- **Changes existing contract?** No — selects the single authoritative provenance source left open in `NP-12-N4-A9` §8.

---

## 11. Confirmation of GDS-09, GDS-10, GDS-11, and GDS-12

| ID | Item | Status | Governing Rule |
|---|---|---|---|
| **GDS-09** | Runtime Provenance (`snapshotId`, `evidenceId`, `engineId`, `timestamp`) | **CONFIRMED — ALREADY GOVERNED** | Sourced from `result.snapshotRef`, `result.evidenceRef`, `result.engineId`, and `SnapshotStore.get(result.snapshotRef).generatedAt` under deterministic clock/IdProvider (`N4-A9 §11.5`, `N4-A10`). Never fabricate `snap_${sector}`, `ev_${sector}`, or `sector.${sector.toLowerCase()}`. |
| **GDS-10** | Bypass Legacy CSIP Mapping | **CONFIRMED — ALREADY GOVERNED** | Producer constructs `ScreenMemberEvaluationInput` directly and never routes through `OntologyMapper`, `ScreeningPopulation`, or `executive-transport.ts` (`N3`, `N4-A3`, `N4-A6`, `N4-A9`). |
| **GDS-11** | Typecheck Boundary (`iips-platform/src/**`) | **CONFIRMED — ALREADY GOVERNED** | Producer module lives under `iips-platform/src/sector-engines/cross-sector/screen/` inside `iips-platform/tsconfig.json`; `frontend/tsconfig.json` is not modified. |
| **GDS-12** | IPD Reference-Only | **CONFIRMED — ALREADY GOVERNED** | `ramkivs/iips-production-market-data` remains strictly reference-only (`N4-A1`, `N4-A8`, `N4-A9`). |

---

## 12. Bounded Increment 2 Implementation Authority (`A12-D01` .. `A12-D03`)

Program Authority has explicitly approved `A12-D01`, `A12-D02`, and `A12-D03`:

| Decision ID | Decision Scope | Status |
|---|---|---|
| **`A12-D01`** | **Grant Bounded Increment 2 Implementation Authority (`N4-A13`)** for the 13-engine Screen Producer Adapter (`iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter.ts` and `iips-platform/tests/regression/np12-n4-screen-producer.test.ts`), strictly bounded by `GDS-01`..`GDS-12` and the exclusions in §12.2. | **APPROVED** |
| **`A12-D02`** | **Protected-Surface Zero-Diff Invariant:** Zero modifications permitted to all 13 sector engines, `renorm()`, CSIP (`OntologyMapper.ts`, `ScreeningPopulation.ts`, `CrossSectorEngine.ts`, `CrossSectorPlugin.ts`), N4-SD (`ScreenDefinition.ts`), N4-A10 Screen runtime (`ScreenMemberInput.ts`, `CanonicalFormats.ts`, `ScreenEvaluator.ts`, `ScreenExecution.ts`, `ScreenResult.ts`), `executive-transport.ts`, `EngineRegistry.ts`, `EngineApiAdapter.ts`, `frontend/tsconfig.json`, and all freeze/certification artifacts. | **APPROVED** |
| **`A12-D03`** | **Durable Publication Authorization:** Authorize publication of `NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md` to `ramkivs/iips-review-recovered` (`refs/heads/main`) with independent remote verification. | **APPROVED** |

### 12.1 Permitted Files in Increment 2 (`N4-A13`)

Increment 2 (`N4-A13`) is authorized to create/touch **only**:
1. `iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter.ts` (new additive producer adapter module);
2. `iips-platform/src/sector-engines/cross-sector/screen/index.ts` (optional additive barrel re-export of `ScreenProducerAdapter` only, if needed);
3. `iips-platform/tests/regression/np12-n4-screen-producer.test.ts` (new additive conformance & determinism test suite);
4. The N4-A13 implementation record (new governance/implementation record at repo root).

### 12.2 Mandatory Claim Boundary & Certification Disposition

- **Existing certifications preserved untouched:** All 13 sector engines, their frozen reference assets, `PROGRAM_v1.1_REPLAY_BASELINE.json`, E2E-030, D38, and LTS artifacts remain untouched (`0` diff), so their existing certifications are neither invalidated nor modified.
- **No transitive certification claim:** Existing E2E-030 certification does **not** transitively certify the new N4 Screen producer adapter (`ScreenProducerAdapter.ts`). Increment 2 (`N4-A13`) establishes producer-to-`NP12MBR` / `NP12EXE` / `NP12RES` `v01` contract conformance and replay determinism for the `COMPLETED` branch only (`A8-S-03` `FAILED` branch remains excluded).

---

## 13. Pre-Publication Verification & Durability Record

### 13.1 Pre-Commit Verification Checklist (Section 7 / A12 Completion)

| Check | Requirement | Result |
|---|---|---|
| `GDS-03` | Exactly reflects **Option B** (`growthAvailability = "UNAVAILABLE"`, `growth = null`; no underlying governed Banking growth metric claimed) | **PASS** (§6) |
| `GDS-07` | Reflects **Option 2 — Sector-Scoped Composite Key Confirmation** (`("Insurance", "IN-001")` and `("Industrials", "IN-001")` confirmed distinct under `(sector, referenceId)`; frozen `"IN-001"` retained for both; no fabricated IDs; no duplicate-identity claim conflicting with sector-scoped model) | **PASS** (§9) |
| `GDS-01`, `GDS-02`, `GDS-04`..`GDS-06`, `GDS-08`..`GDS-12` | Preserved and match approved decision surface | **PASS** (§4–§11) |
| `A12-D01`..`A12-D03` | Preserved and bounded to Increment 2 | **PASS** (§12) |
| Protected surface / implementation files | Zero implementation, engine, runtime, CSIP, fixture, or certification files modified | **PASS** (`0` files modified) |
| IPD & Production | Untouched | **PASS** (`0` files modified) |

### 13.2 Publication & Remote Durability Status

Following the established `NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md` (§3.3, §12, §14.8) governance publication architecture:
- This reconciled authority record (`NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md`) is prepared in the Arena workspace root (`/home/user/NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md`) with `A12-D03` (`PUBLICATION AUTHORIZED`) and all 12 governance decisions (`GDS-01`..`GDS-12`) closed and accepted.
- Because the sandboxed agent container has no GitHub push credentials (`git push` inside the container has no credentials mounted), the commit, push (`arena/<sessionId>-iips-review-recovered`), PR merge to `refs/heads/main`, and independent remote verification (`git ls-remote origin refs/heads/main`, commit SHA, root tree SHA, blob SHA-1, and SHA-256) are executed via the Arena host GitHub integration / publishing session.
- **Strict Durability Rule:** Until this record is merged to `refs/heads/main` and verified on `origin/main`, `N4-A12` is recorded as **RECONCILED & PUBLICATION AUTHORIZED (`A12-D03`) — AWAITING HOST PR MERGE TO `refs/heads/main`**, and `N4-A13` implementation must begin only from the newly merged `origin/main`.

**End of NP-12 N4-A12 authority decision record.**
