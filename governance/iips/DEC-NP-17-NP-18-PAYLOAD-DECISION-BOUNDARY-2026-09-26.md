# NP-17 / NP-18 — PAYLOAD DECISION BOUNDARY (DURABLE RECORD)

- **Record ID:** `DEC-NP-17-NP-18-PAYLOAD-DECISION-BOUNDARY-2026-09-26`
- **Title:** NP-17 (PAY-01, Company Fundamentals) / NP-18 (PAY-02, Intelligence) — Durable recording of the RAMKI selection set A-0 / B-0 / B-1 / B-2 / B-3 / B-4 and the resulting permitted composition boundary
- **Class:** `GOVERNANCE` / `DECISION BOUNDARY RECORD`
- **Status:** `RECORDED — SELECTIONS DURABLE. NP-17 = OPEN / COMMISSIONING (acquisition limb CLOSED BY DECLINATION). NP-18 = OPEN / COMMISSIONING (exposure/derivation path AUTHORIZED IN PRINCIPLE, NOT IMPLEMENTED, NOT QUALIFIED). THIS RECORD AUTHORIZES NO IMPLEMENTATION MUTATION.`
- **Date/time:** 2026-09-26T17:36:51Z (UTC)
- **Recording branch:** `arena/01a0ddea-iips-review-recovered` (session branch). The authoritative governance branch `arena/01a03e3b-iips-review-recovered` is **NOT** moved by this record.
- **Authoritative baseline SHA:** `3c7568e0437f2a5e7b385833ed0752990286ad87` (commit `D7-TIER3-INDEPENDENCE: RAJI adjudication — NOT SATISFIED (Option-1 evidence absent)`, parent `ffa92dbec24c962482823ccb4d8768fb50955c94`, tree `fdeefa3d0410f1be8bc6c0ae78673ff831994f4a`). Both `arena/01a03e3b-…` and `arena/01a0ddea-…` resolved to this SHA immediately before this record was created.
- **Product evidence baseline:** `origin/phase13-next` @ `1a602d849cc47331d4f61cc366ed0a343f80e287`. Every product fact in §5 was re-derived read-only from this pin in the recording gate. No product fact is inherited from a transcript.
- **Supersession / revision relationship:** none. New record. Amends no dated record. Does **not** modify the D7 disposition, the D7-TIER3-INDEPENDENCE or D7-TIER3-PARITY corpora, the A1 records, the IVM, D14/D15/D25/D36, or E2E-018.
- **Content SHA-256:** self-inclusion is arithmetically impossible; the authoritative SHA-256 of this record as committed is recorded externally in the commit trail and in the gate report. `BYTE-IDENTICAL TO DRAFT: NO` is **not** asserted — this file is the authoritative bytes.

---

## 1. Authority context

This record is created under the explicit gate authority *"NP-17 / NP-18 — DURABLE DECISION BOUNDARY RECORDING GATE"*, which directed that exactly one durable governance decision-boundary record be created under the established `governance/iips` area, recording the RAMKI selection set and nothing beyond it.

Two prior gate determinations remain in force and are **not** altered here:

| Instrument | Determination | State |
|---|---|---|
| `D7-TIER3-INDEPENDENCE-CLOSURE-AUTHORITY-2026-09-26` | authority act, commit `425c7bb62660fb1f4452d85b1e47ca0b143da938` | unchanged |
| `D7-TIER3-INDEPENDENCE-SAI-VERIFICATION-EVIDENCE-RECORD-2026-09-26` | verification evidence, content SHA `21d64c647db8ba54a73dbf114221ee0edb30637c2d5150a9808478d4657e5e2c` | unchanged |
| `D7-TIER3-INDEPENDENCE-RAJI-ADJUDICATION-DETERMINATION-2026-09-26` | **NOT SATISFIED — REMAINS OPEN / NEGATIVE**; no independence established; D7 not closed | unchanged |
| `D7-TIER3-PARITY-*` | **SATISFIED WITH RECORDED QUALIFICATIONS** | unchanged |

**Decision authority for the selections in §2 is RAMKI.** No selection in this record was inferred, substituted, extended or recommended by the recording agent. `GP-5` remains **NOT ESTABLISHED**. `GP-6` contract designation exists for P-B/P-C/P-D/P-E but **contract-content authoring remains NOT AUTHORIZED**. Neither is altered by this record.

## 2. Exact selections recorded (verbatim)

| ID | Selection | Meaning |
|---|---|---|
| **A-0** | **`A-DECLINE`** | The company-fundamentals data-source gate is **DECLINED**. |
| **B-0** | **`B-1`** | Intelligence: **exposure / derivation only**. |
| **B-1** | Opportunities = **`IMPLEMENTED`** | Exposed from the existing certified `CrossSectorData` / `PipelineResult` path. |
| **B-2** | Risks = **`IMPLEMENTED`** | Restricted to aggregate `avgRisk` + existing risk flags. |
| **B-3** | Rankings = **`IMPLEMENTED`** | Exposed from the existing certified `CrossSectorData` / `PipelineResult` path. |
| **B-4** | **`NO NEW DTO`** | Compose over the existing `CrossSectorData` / `PipelineResult` contract. |

**Not selected, and therefore not recorded as selected:** `A-1`…`A-11` (moot by declination — **no external company-fundamentals provider is named, ranked, recommended or carried forward anywhere in this record**); `B-2-external`; `B-5`; `C-1` (UI03/UI04 identifier binding); `C-2` (the dangling `IIPS-WP-MACRO-03-DECISION.md` citation); `C-3` (`INTEGRATION_VERIFICATION_MATRIX.md:152` vs N+3); `C-4` (recording branch selection beyond the session branch named above). These remain **unresolved** and are carried as open, not as decided.

## 3. Resulting permitted boundary

Permitted, and only this:

1. **Composition over the existing certified read path.** Intelligence surfaces may be composed exclusively from the payload already produced by the governed cross-sector read path described in §5.
2. **Opportunities** may be exposed from the existing certified `opportunity` slice.
3. **Rankings** may be exposed from the existing certified `ranking` slice.
4. **Risks** may be exposed **only** as the existing aggregate `portfolio.avgRisk` plus the existing derived flags (`diversification.flags`, `correlation.flags`, `correlation.concentrationSectors`) and allocation `rulesApplied`.
5. **1:1 mapping only**, consistent with the transport's own recorded semantics: `transportSemantics: '1:1 mapping; transport transformation != decision transformation'`.
6. **`null` → `"unavailable"`**; never `0`, never a fabricated value.

## 4. Explicit exclusions (binding)

**Excluded by A-0 = `A-DECLINE`:**

- No external company-fundamentals provider is authorized. No provider is named.
- No new company-fundamentals acquisition path is authorized.
- No fundamentals ingestion, adapter, connector, credential, cache or persistence.
- The dormant `MarketDataSource` / `DataBoundExecutor` surfaces **remain dormant** and are not activated.
- The existing deterministic feed remains *"deterministic test feed, NOT production market data"*; frozen fixtures remain fixtures and must stay labelled as such.
- The known **7-engine neutral-50** limitation persists and must remain disclosed.
- Research UI03 remains **composition-only** over existing governed/reference data.

**Excluded by B-0 = `B-1`:**

- No external intelligence acquisition source is authorized.
- `ResearchEvents` **S1 / S10 remain in force and are NOT superseded** by this record.

**Excluded by B-2 (hard limit on the `IMPLEMENTED` selection):**

- **No per-company risk.** **No per-sector risk.**
- **No fabricated risk object. No newly computed risk object.** No risk bands, scores, ratings, ranks or quadrants may be derived, inferred or invented.
- No certified per-company or per-sector risk object exists in the platform; anything beyond aggregate `avgRisk` + existing flags would be fabrication and is prohibited.

**Excluded by B-4 = `NO NEW DTO`:**

- **Do not create `FundamentalsDTO`. Do not create `IntelligenceDTO`.**
- **Do not create a new endpoint.**
- **Do not recompute or fabricate intelligence.**
- **Do not introduce persistence.**
- No new transport contract, no schema file, no payload file, no adapter.

**Excluded generally:**

- No authorization of persistence, hosting, transport, credentials, provider activation, company-fundamentals acquisition, or new DTO contracts.
- No implementation of UI03 / UI04 in this gate.
- No modification of application source code.
- No creation of fixtures or synthetic payloads.
- No recomputation of bands, quadrants, thresholds or classifications in transport or React.
- No `LIVE` freshness claim over frozen Replay-Baseline inputs; the certified provenance remains `freshness: 'SNAPSHOT'`.
- §19 remains in force: *"if the governed platform does not support a mutation, DO NOT IMPLEMENT IT."*

## 5. Composition boundary — verified chain

The governed path is **already implemented and certified** on the product baseline. Re-derived read-only at `origin/phase13-next` @ `1a602d84…`:

| # | Layer | Location | Verified content |
|---|---|---|---|
| 1 | Client DTO | `frontend/src/api/crossSector.ts:9–26` | `interface CrossSectorData` — `portfolio{…avgRisk…}`, `diversification{band,flags}`, `ranking[]`, `opportunity[]`, `correlation{flags,concentrationSectors}`, `decisions[]`, `provenance` |
| 2 | Client fetch | `frontend/src/api/crossSector.ts:28–32` | `fetchCrossSectorData()` → `authFetch(\`${baseUrl}/api/cross-sector\`)` |
| 3 | Guard surface map | `frontend/server/executive-transport.ts:579–591` | `readSurfaceFor(url)`; **`:585`** `if (path === '/api/cross-sector') return 'cross-sector';` |
| 4 | Guard enforcement | `frontend/server/executive-transport.ts:820, 830` | `const surface = readSurfaceFor(req.url)` → `const principal = await authorizeRead(req, res, surface)` |
| 5 | Guard call | `frontend/server/executive-transport.ts:606–617` | `authorizeRead(...)` → **`:612`** `admin.guardRead(executor, token, surface)`; 401/403 on denial |
| 6 | Route handler | `frontend/server/executive-transport.ts:842–844` | `if (req.url === '/api/cross-sector') { res.writeHead(200); res.end(JSON.stringify(computeCertifiedCrossSector())); return; }` |
| 7 | Payload builder | `frontend/server/executive-transport.ts:499–531` | `computeCertifiedCrossSector()` over `computeCertifiedPlatform()` → `{ engineOutputs, csip: pr }`; comment: *"All values are certified CSIP outputs or certified engine outputs; 1:1 mapping."* |
| 8 | Engine | `iips-platform/src/sector-engines/cross-sector/CrossSectorEngine.ts:31, 56` | `CrossSectorEngine` → `PipelineResult` |
| 9 | Types | `iips-platform/src/sector-engines/cross-sector/types.ts` | `RankedOpportunity`; `PortfolioIntelligenceReport.avgRisk` |
| 10 | Opportunity slice | `iips-platform/src/sector-engines/cross-sector/opportunity/OpportunityEngine.ts` | `top` = `ranked.slice(0, n)` + generated rationale strings |

Certified provenance carried by the payload (`executive-transport.ts:524–528`):
`dataSource: 'certified v2.0 platform (CSIP cross-sector engine) over frozen v1.1 Replay Baseline inputs'` · `freshness: 'SNAPSHOT'` · `calibratedAt: '2026-08-09T00:00:00.000Z'` · `transportSemantics: '1:1 mapping; transport transformation != decision transformation'`.

### 5.1 Correction to the chain as stated in the gate instruction

The gate instruction described the chain as `GET /api/cross-sector -> CrossSectorEngine.run() -> PipelineResult / CrossSectorData -> guardRead('cross-sector')`. The **substance is confirmed**; two locational details are corrected on the evidence:

1. **`guardRead` is not invoked inside `CrossSectorEngine.ts`.** It is invoked at `frontend/server/executive-transport.ts:612` inside `authorizeRead(...)`, with the surface name `'cross-sector'` resolved at `:585` by `readSurfaceFor()`. Enforcement precedes the handler (`:820` → `:830` → `:842`).
2. **There is no Next.js app-router route.** `frontend/src/app/api/` does not exist on `phase13-next`; `/api/cross-sector` is served by the custom Node `http` transport in `frontend/server/executive-transport.ts`.

Neither correction changes the permitted boundary: same endpoint, same guard surface, same certified engine, same DTO.

### 5.2 Binding composition constraints (K-1 … K-4)

| ID | Constraint | Evidence |
|---|---|---|
| **K-1** | All three slices are **already exposed** at `/api/cross-sector`. Composition is surface-only: no new endpoint, no recomputation, no fabrication, no persistence. | §5 rows 1–7 |
| **K-2** | **Opportunities are NOT an independent dataset.** `opportunity` is `pr.opportunity.top`, and `top` is `ranked.slice(0, n)`; `ranking` is `pr.ranking`. Both map to the identical shape `{ companyId, sector, conviction }`. They must not be presented as two independent datasets. | `executive-transport.ts:517–518`; `OpportunityEngine.ts` |
| **K-3** | **No certified risk object exists.** `avgRisk` is a single aggregate number on `portfolio`; the transport exposes no per-company and no per-sector risk field. B-2 is therefore hard-limited to aggregate + flags. | `crossSector.ts:9–26`; `types.ts` |
| **K-4** | **Slice inventory is limited to what `PipelineResult` actually produces** — `intelligence`, `ranking`, `opportunity`, `allocation`, `diversification`, `correlation`, `evidence`, `reports`. Nothing may be added. | `CrossSectorEngine.ts:31, 56` |

## 6. Resulting states

### NP-17 / PAY-01 — Company Fundamentals

**`OPEN / COMMISSIONING`.**

- Acquisition limb: **CLOSED BY DECLINATION** (A-0 = `A-DECLINE`).
- NP-17 **remains OPEN / COMMISSIONING** because acquisition-dependent acceptance is **not satisfied**.
- NP-17 **is NOT recorded COMPLETE** and cannot be, against an acquisition-dependent acceptance condition.
- Reopening the acquisition limb requires a **fresh authority act**. This record does not reopen it.
- Research UI03 remains composition-only over existing governed/reference data.

### NP-18 / PAY-02 — Intelligence

**`OPEN / COMMISSIONING`.**

- Exposure / derivation path: **AUTHORIZED IN PRINCIPLE** on the terms of §2–§5.
- **NOT IMPLEMENTED. NOT QUALIFIED.** No surface, DTO, endpoint, transport, persistence or nav-status change is executed by this record.
- Passing tests, a DTO type, UI coding, provider-neutral infrastructure, or synthetic fixtures would **not** constitute qualification or a governed payload.
- NP-18 **is NOT recorded COMPLETE**.

## 7. Authorization statement

**This record authorizes NO implementation mutation.**

It creates no DTO, schema, payload file, adapter, endpoint, transport change, UI change, persistence, fixture, credential or provider activation. It modifies no application source code. It implements neither UI03 nor UI04. It changes no navigation status. It marks neither NP-17 nor NP-18 COMPLETE. It does not modify the D7 disposition, any D7 record, `GP-5` or `GP-6`. It does not move the authoritative governance branch.

The only mutation performed in the recording gate was: (a) the authorized local checkout repair aligning the session branch and worktree to the authoritative baseline `3c7568e0437f2a5e7b385833ed0752990286ad87`, and (b) the creation, commit and push of **this one file**.

Execution of the §3 boundary requires a **separate, future authority act** that explicitly grants implementation authority.

---

*End of record.*
