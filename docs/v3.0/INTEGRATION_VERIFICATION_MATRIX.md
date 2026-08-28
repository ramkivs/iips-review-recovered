# PROGRAM v3.0 — ENGINE INTEGRATION VERIFICATION MATRIX

**Milestone:** N — Integration & Scope Reconciliation
**Basis:** reconciled at `3514d47908afa560d6c733d815452adae8bd9e91` (2026-08-20); re-verified unchanged at `85bbd49cd31c215a8fd0e7651b718861944dfe45` (canonical `phase13-next`).
**Nature:** evidence-based reconciliation (read-only findings, rendered as a standing artifact). No engine/platform/server semantics changed.

---

## 1. Summary

- **14 engines implemented**: 13 sector engines + 1 cross-sector engine (CSIP).
- **All 14 classified A** — implemented + certified + runtime-integrated + UI-integrated.
- The Administration UI figure **"13 registered / 13 certified"** is programmatically correct for the **13 sector engines**; **CSIP is intentionally outside that count** (it is the cross-sector layer, not a sector engine).

## 2. Integration classification

| Class | Meaning |
|---|---|
| A | IMPLEMENTED + CERTIFIED + RUNTIME INTEGRATED + UI INTEGRATED |
| B | IMPLEMENTED + CERTIFIED + RUNTIME INTEGRATED, UI INCOMPLETE |
| C | IMPLEMENTED + CERTIFIED, RUNTIME INCOMPLETE |
| D | IMPLEMENTED, CERTIFICATION INCOMPLETE |
| E | PIPELINE / PLANNED |
| F | LEGACY / SUPERSEDED / EMPTY SCAFFOLDING |

## 3. Per-engine matrix

Implementation = `iips-platform/src/sector-engines/<name>/` (Engine + calibration + decision + evidence + metrics + scoring + frozen-assets JSON). Registration/execution = `frontend/server/executive-transport.ts` (`ENGINE_FACTORY` + `runtime.execute`). Certification = governed `PluginMarketplace` registry (`frontend/server/admin-transport.ts`) + per-sector artifacts.

| Engine ID | Sector | IES | Class | Evidence | Implementation | Runtime link | Certification evidence | UI surface |
|---|---|---|---|---|---|---|---|---|
| `sector.banking` | Banking | IES-006.2A | **A** | **A2** | `BankingEngine.ts` + calibration/decision/evidence/metrics/scoring + frozen-assets | `ENGINE_FACTORY` + `runtime.execute` | WP1–4 + `reports/` (independent verification + final readiness) + `RELEASE_NOTES_banking-engine-v1.0.0.md` + rc report | Admin registry + Executive + Company Intelligence |
| `sector.insurance` | Insurance | IES-007 | **A** | **A2** | `InsuranceEngine.ts` + … | `ENGINE_FACTORY` + `runtime.execute` | WP1–4 + `reports-insurance/` + release notes | same |
| `sector.capital-markets` | Capital Markets | IES-008 | **A** | **A2** | `CapitalMarketsEngine.ts` + … | `ENGINE_FACTORY` + `runtime.execute` | WP1–4 + `reports-capital-markets/` + `IMPLEMENTATION_REUSE_REPORT_IES008.md` + release notes | same |
| `sector.healthcare` | Healthcare | IES-009 | **A** | **A2** | `HealthcareEngine.ts` + … | `ENGINE_FACTORY` + `runtime.execute` | WP1–4 + `reports-healthcare/` + `IMPLEMENTATION_REUSE_REPORT_IES009.md` + release notes | same |
| `sector.hospitality` | Hospitality | IES-010 | **A** | **A1** | `HospitalityEngine.ts` + … | `ENGINE_FACTORY` + `runtime.execute` | `ies-010-hospitality/` (FREEZE_MANIFEST + READINESS_CERTIFICATE + release notes) + `IES010_FINAL_READINESS_CERTIFICATE.md` + `IES010_INDEPENDENT_VERIFICATION_REPORT.md` | same |
| `sector.energy` | Energy | IES-011 | **A** | **A1** | `EnergyEngine.ts` + … | `ENGINE_FACTORY` + `runtime.execute` | `ies-011-energy/` + `IES011_FINAL_READINESS_CERTIFICATE.md` + `IES011_INDEPENDENT_VERIFICATION_REPORT.md` | same |
| `sector.utilities` | Utilities | IES-012 | **A** | **A1** | `UtilitiesEngine.ts` + … | `ENGINE_FACTORY` + `runtime.execute` | `ies-012-utilities/` + `IES012_FINAL_READINESS_CERTIFICATE.md` + `IES012_INDEPENDENT_VERIFICATION_REPORT.md` | same |
| `sector.consumer` | Consumer | IES-013 | **A** | **A1** | `ConsumerEngine.ts` + … | `ENGINE_FACTORY` + `runtime.execute` | `ies-013-consumer/` + `IES013_FINAL_READINESS_CERTIFICATE.md` + `IES013_INDEPENDENT_VERIFICATION_REPORT.md` | same |
| `sector.industrials` | Industrials | IES-014 | **A** | **A1** | `IndustrialsEngine.ts` + … | `ENGINE_FACTORY` + `runtime.execute` | `ies-014-industrials/` + `IES014_FINAL_READINESS_CERTIFICATE.md` + `IES014_INDEPENDENT_VERIFICATION_REPORT.md` | same |
| `sector.technology` | Technology | IES-015 | **A** | **A1** | `TechnologyEngine.ts` + … | `ENGINE_FACTORY` + `runtime.execute` | `ies-015-technology/` + `IES015_FINAL_READINESS_CERTIFICATE.md` + `IES015_INDEPENDENT_VERIFICATION_REPORT.md` | same |
| `sector.telecommunications` | Telecommunications | IES-016 | **A** | **A2** | `TelecommunicationsEngine.ts` + calibration/decision/evidence/metrics/scoring + frozen-assets | `ENGINE_FACTORY` + `runtime.execute` | `ies-016-telecommunications/` + `TELECOMMUNICATIONS_DISCOVERY_PACK.md` + `TELECOMMUNICATIONS_ENGINE_ACCEPTANCE_MATRIX.md` + `RELEASE_NOTES_IES-016_v1.0.0.md` | same (auto-extended universe) |
| `sector.automobile` | Automobile | IES-017 | **A** | **A2** | `AutomobileEngine.ts` + calibration/decision/evidence/metrics/scoring + frozen-assets | `ENGINE_FACTORY` + `runtime.execute` | `ies-017-automobile/` + `AUTOMOBILE_DISCOVERY_PACK.md` + acceptance matrix + `RELEASE_NOTES_IES-017_v1.0.0.md` | same (auto-extended universe) |
| `sector.materials-metals` | Materials & Metals | IES-020 | **A** | **A2** | `MaterialsMetalsEngine.ts` + calibration/decision/evidence/metrics/scoring + frozen-assets | `ENGINE_FACTORY` + `runtime.execute` | `ies-020-materials-metals/` + `MATERIALS_METALS_DISCOVERY_PACK.md` + acceptance matrix + `RELEASE_NOTES_IES-020_v1.0.0.md` | same (auto-extended universe) |
| CSIP (`CrossSectorEngine`) | Cross-Sector | CSIP | **A** | **A1** | `CrossSectorEngine.ts` + allocation/correlation/diversification/ontology/opportunity/portfolio/ranking/reporting | instantiated directly → `csip.run({ outputs })` (consumes the 13 engine outputs) | `iips-cross-sector/` (FREEZE_MANIFEST + READINESS_CERTIFICATE + TRACEABILITY) + `CSIP_FINAL_READINESS_CERTIFICATE.md` + `CSIP_INDEPENDENT_VERIFICATION_REPORT.md` | Cross-Sector Intelligence + Executive + Decision Matrix + Screener |

Per-engine regression acceptance tests exist for all 14: `iips-platform/tests/regression/<name>-acceptance.test.ts` (+ `cross-sector-acceptance.test.ts`).

### 3.1 Evidence maturity (A1 / A2)

> **Class A capability status is unchanged for all 14 capabilities. A1/A2 represents evidence
> maturity only; A2 does not mean capability failure, de-certification, or evidence-blocked
> capability.**

Authority: `governance/iips/DEC-D5-EVIDENCE-MATURITY.md` (sub-classification authorized as
D5 Option A) and `governance/iips/DEC-D3-MATRIX-REBASELINE.md` (representation authorized as
D3-2). Classification: **A1 — full evidence** (7): IES-010, IES-011, IES-012, IES-013,
IES-014, IES-015, CSIP. **A2 — partial evidence** (7): IES-006.2A, IES-007, IES-008,
IES-009, IES-016, IES-017, IES-020. Evidence-depth provenance: `iips-platform/IES0xx_*`,
`iips-platform/reports*/`, `ies-0xx-*/IES-0xx_FREEZE_MANIFEST.json`,
`iips-platform/tests/regression/`.

**D5-S1 — regression threshold explicitly unquantified (D3-3 = A).** The A1 phrase
*"required regression evidence"* **remains unquantified**. **No numeric threshold is
authorized, and none may be inferred.** The 7/7 split above is unchanged for **any**
threshold from 0 to 4, because every A2 capability already lacks at least one
non-regression artifact. **D5-S1 remains an open methodology sub-gap.**

**UI-surface column semantics (D3-5).** The UI-surface column represents **primary
per-engine UI surfaces for the 13 sector rows; composed cross-sector views belong on the
CSIP row.** Accordingly `Screener` is recorded on the CSIP row: it composes the existing
certified Decision Matrix data (a composed cross-sector view over per-sector engine
details) rather than presenting a single engine's result.

**AI Advisory (D3-4).** A certified non-engine AI Advisory surface exists at
`f63a9b493118643725568a95b86405a5835a30a0`; its matrix treatment is deferred to **D4**. It
is **not** one of the 14 capabilities and has **no row and no placeholder** in this matrix.

## 4. Runtime integration trace (concrete)

```
engine implementation   iips-platform/src/sector-engines/<name>/*Engine.ts (+ identity/manifest)
        ↓
registration            frontend/server/executive-transport.ts — ENGINE_FACTORY (13 sector engines)
        ↓
plugin load/init        plugins.load(ENGINE_FACTORY[id]()) + plugins.initialize(id)
        ↓
execution               runtime.execute(s.engineId, { inputs }) for each sector in
                        program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json (13 sectors)
        ↓
certified transport     /api/executive · /api/portfolio · /api/company/:sector · /api/cross-sector
                        · /api/decision-matrix · /api/evidence/:id · /api/replay/:id · /api/admin/*
        ↓
v3.0 API clients        frontend/src/api/{executive,portfolio,company,crossSector,decisionMatrix,evidence,replay,admin}.ts
        ↓
UI                      ExecutiveDashboard · PortfolioWorkspace · CompanyIntelligence ·
                        CrossSectorIntelligence · DecisionMatrix · EvidenceExplorer ·
                        ReplayExplorer · Administration (Engines & Certification)
```

## 5. Pipeline / legacy classification

| Item | Classification | Note |
|---|---|---|
| IES-016 Telecommunications · IES-017 Automobile · IES-020 Materials & Metals | **A — IMPLEMENTED + CERTIFIED + RUNTIME INTEGRATED + UI INTEGRATED** | promoted on `phase13-next` (IES-016 `9bf91d1`, IES-017 `d51b120`, IES-020 `6355949`); see §3 rows |
| `iips-platform/sector-engines/` (root, `.gitkeep`) + empty `{banking,insurance}` subdirs | **F — EMPTY DUPLICATE** | real engines live in `src/sector-engines/` |
| `iips-platform/shared/`, `iips-platform/runtime/` (`.gitkeep`) | **F — EMPTY SCAFFOLDING** | candidates for pruning |
| `iips-platform/release-candidate` + `-capital-markets` + `-insurance` (RC report + manifest) | **F — SUPERSEDED STAGING** | superseded by canonical implementations |
| 8 empty `iips-platform/release-candidate-*` dirs | **F — EMPTY SCAFFOLDING** | candidates for pruning |

## 6. Known gaps (preserved, not silently fixed)

1. Root README/ROADMAP standards numbering was stale (corrected in this milestone).
2. The "10 registered / 10 certified" headline excludes CSIP (accurate for sector engines; documented here).
3. `/evidence/snapshots` navigation child has no dedicated route (resolves into `/evidence/:id` → transport 404 → error state).
4. Non-admin read endpoints (`/api/executive`, `/api/portfolio`, `/api/company`, `/api/cross-sector`, `/api/decision-matrix`, `/api/evidence`, `/api/replay`) remain dev-mode unauthenticated; only `/api/admin/*` enforces the Bearer/`guardAdmin` boundary. **Hardening these is a separate authorization.**
5. Technology exposes pillars in live engine metadata; the other 9 sectors source pillars from frozen GOLDEN expected-outputs (transparently documented in `executive-transport.ts`).

## 7. Future module scope (unchanged by this milestone)

**Research, Intelligence, Evidence** are **partial** surfaces today (implemented sub-surfaces: Company Intelligence, Cross-Sector Intelligence, Decision Matrix, Evidence Explorer, Replay Explorer; module-level scope remains a future Program v3.0 phase). This milestone only marks them honestly in the navigation model — it implements none of them.
