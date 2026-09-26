# NP-18 — R-2 IMPLEMENTATION RETARGETING AUTHORITY

- **Record ID:** `AUTH-NP-18-R2-IMPLEMENTATION-RETARGETING-AUTHORITY-2026-09-26`
- **Title:** NP-18 (PAY-02, Intelligence) — R-2 retargeting of the implementation target from the governance/session lineage to the product lineage `phase13-next`, superseding **D-6 for the implementation-target dimension only**
- **Class:** `GOVERNANCE` / `IMPLEMENTATION AUTHORITY ACT` (narrow retargeting)
- **Status:** `ISSUED — IMPLEMENTATION TARGET RE-SET TO phase13-next @ 1a602d849cc47331d4f61cc366ed0a343f80e287. THIS ACT DOES NOT IMPLEMENT, CERTIFY, QUALIFY OR RELEASE ANYTHING. NP-18 REMAINS OPEN / COMMISSIONING.`
- **Date/time:** 2026-09-26T18:35:31Z (UTC)
- **Grantor:** RAMKI (selection **R-2**). **Recording agent:** Arena session agent — no discretion exercised; the retargeting and every preserved decision below are RAMKI's, recorded verbatim.
- **Nature:** **NEW authority act. NOT an amendment.** `AUTH-NP-18-INTELLIGENCE-EXPOSURE-IMPLEMENTATION-AUTHORITY-2026-09-26` is **not amended, not edited, not superseded in whole and not re-issued**. It remains present and byte-identical at commit `d44c5c7aab43d1c89da06a6f99c4a9e75e47423d`. This act operates **alongside** it, changing exactly one dimension.
- **Recording branch:** `arena/01a0ddea-iips-review-recovered` **ONLY**. Neither `arena/01a03e3b-iips-review-recovered` (authoritative governance) nor `phase13-next` is moved by this act.
- **Governance parent:** `d44c5c7aab43d1c89da06a6f99c4a9e75e47423d` ← `b8afaeae2daa7a33bc1c8061d04de6b580c77029` ← `3c7568e0437f2a5e7b385833ed0752990286ad87` (authoritative baseline) ← `ffa92dbec24c962482823ccb4d8768fb50955c94`.
- **Content SHA-256:** self-inclusion is arithmetically impossible; the authoritative SHA-256 of this act as committed is recorded externally in the commit trail and the gate report. This file is the authoritative bytes.

---

## 1. Reason for this act — the established forensic finding

The lineage reconciliation gate established, on Git evidence alone, that the issued NP-18 authority act **is not executable as written**:

```text
SESSION
  arena/01a0ddea-iips-review-recovered
  d44c5c7aab43d1c89da06a6f99c4a9e75e47423d
  = GOVERNANCE-RECORDING LINEAGE

PHASE13
  phase13-next
  1a602d849cc47331d4f61cc366ed0a343f80e287
  = PRODUCT IMPLEMENTATION LINEAGE
```

| Evidence | Finding |
|---|---|
| `merge-base(session, phase13-next)` | **NONE — root-disjoint** |
| Session root | `c65d53373717aacc3a1dce12d47b5aeaf50541a5` (2026-08-14, *"Import recovered IIPS workspace"*) — shared with `main` |
| Phase13 root | `7325aeda8c9881ebdf2b96f64323998f1c46ba26` (2026-08-12, *"chore: establish durable Phase 12 certified baseline"*) |
| Session commits beyond its root | **99**, of which **99 touch `governance/iips/`** and **0 touch `frontend/`, `iips-platform/` or `docs/`** |
| Session `frontend` subtree OID | **identical at root and tip** (`abfff14b69e6866d707066d3f636c8246b3fc572`) — the product tree has **never** changed on this lineage |
| Session `iips-platform` subtree OID | **identical at root and tip** (`d360fb8285976f923c49a22755ba0179e0407275`) |
| Session product blobs vs `7325aed` | 5 of 6 tested are **byte-identical to phase13's ROOT commit** (`navigation.ts`, `routes.ts`, `App.tsx`, `crossSector.ts`, `CrossSectorIntelligence.tsx`) |
| Prerequisites absent on session | `frontend/src/features/intelligence/` (whole module), `IntelligenceHub.tsx`, `IntelligenceHub.test.tsx`, `navigation.test.ts`, `Sidebar.test.tsx`, `frontend/src/features/research/`, `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`, `PHASE13_N3_READ_AUTHORIZATION_CERTIFICATION.md`, `api/macro.ts`, `MacroContext.tsx`, `server/macro/mospi-source.ts` |
| Session `NavStatus` / `NAV_STATUS_LABEL` / `status` field | **0 occurrences in product code**; session `NavItem` has **no `status` member** |
| Session `guardRead` / `authorizeRead` / `readSurfaceFor` | **0 occurrences in product code** (present only in 16 `governance/iips/*.md` records as specification prose) |
| Session `executive-transport.ts:583` | self-documents *"Minimal dev-mode session mapping (see header note). **NOT production auth.**"* over `/api/cross-sector` |
| Governance corpus distribution | session **113** files under `governance/iips/` vs phase13-next **4** |

**Conclusion recorded:** D-6 = A directed implementation to a branch whose product tree is frozen at the Phase-12 baseline and which has never carried a product commit. Four of the six §6.2 MODIFY targets, and all three §8 test files, do not exist there; the §6.3/§6.4 preservation targets do not exist there; and `/api/cross-sector` is unauthenticated there. Executing the act on the session branch would require introducing prerequisites the act does not authorize.

## 2. R-2 — the retargeting decision (verbatim)

```text
R-2 = SELECTED

IMPLEMENTATION TARGET = phase13-next
BASELINE              = 1a602d849cc47331d4f61cc366ed0a343f80e287
```

## 3. Supersession scope — exactly one dimension

```text
D-6 is superseded ONLY for the implementation-target dimension.

The previous D-6 = A session-branch-only selection is no longer operative
for NP-18 IMPLEMENTATION.

No other D-1 through D-5 decision is changed.
```

**Precision on what is and is not superseded:**

| Dimension | Status after this act |
|---|---|
| **Where NP-18 implementation is committed** | **SUPERSEDED** → `phase13-next` @ `1a602d849cc47331d4f61cc366ed0a343f80e287` |
| Where **governance records** (including this act) are recorded | **UNCHANGED** — `arena/01a0ddea-iips-review-recovered` only |
| Movement of `arena/01a03e3b-iips-review-recovered` | **UNCHANGED** — prohibited; remains `3c7568e0437f2a5e7b385833ed0752990286ad87` |
| D-1, D-1a, D-2, D-3, D-3b, D-4, D-5 | **UNCHANGED** — preserved verbatim in §4 |
| A-0, B-0, B-1, B-2, B-3, B-4 | **UNCHANGED** — remain as durably recorded at `b8afaeae…` |
| The original act's text | **UNCHANGED** — not amended, not re-issued |

D-6 = A therefore **remains operative for governance recording** and is superseded **only** as to the NP-18 implementation target.

## 4. Preserved governing decisions (verbatim, unchanged)

```text
D-1  = A — SAME CERTIFIED SLICES, ALTERNATE FRAMING
D-1a = A — THREE DISTINCT FULL VIEWS
D-2  = A — AUTHORIZE TEST AMENDMENT
D-3  = A — FLIP INTELLIGENCE GROUP STATUS TO IMPLEMENTED
D-3b = LEAVE IVM §7 UNCHANGED AS HISTORICAL RECORD
D-4  = B — LEAVE IVM §6.4 UNCHANGED
D-5  = B — ANNOTATE THE TWO MACRO REFERENCES AS UNRECOVERED EXTERNAL ARTIFACT
```

Also preserved unchanged from the durable decision-boundary record `DEC-NP-17-NP-18-PAYLOAD-DECISION-BOUNDARY-2026-09-26` (blob `a5a345a71d5bda24a73934c216d299fb715bbaab`, 14,464 bytes, SHA-256 `bd2f1d4b01adcae245ad17a621219795b962dc207e0146729e612f2a78765e7d`):

```text
A-0 = A-DECLINE   (company-fundamentals data-source gate DECLINED; no provider; no acquisition path)
B-0 = B-1         (intelligence exposure / derivation only; no external intelligence acquisition)
B-1 = Opportunities IMPLEMENTED
B-2 = Risks IMPLEMENTED — aggregate avgRisk + existing flags ONLY
B-3 = Rankings IMPLEMENTED
B-4 = NO NEW DTO — compose over existing CrossSectorData / PipelineResult
```

`ResearchEvents` **S1 / S10 remain in force and are NOT superseded**. `GP-5` remains **NOT ESTABLISHED**. `GP-6` contract-content authoring remains **NOT AUTHORIZED**. The D7-TIER3-INDEPENDENCE disposition remains **NOT SATISFIED — OPEN / NEGATIVE** and is **not** modified. D7-TIER3-PARITY remains **SATISFIED WITH RECORDED QUALIFICATIONS**.

**D-5 remains a SEPARATE Macro-workstream item.** It is **NOT** authorized by this act, **NOT** part of NP-18, and **MUST NOT** be executed under NP-18 implementation authority. It requires its own act.

### 4.1 Preserved D-1a framing (exact)

```text
/intelligence/opportunities
= DISCOVERY / ACTION VIEW
  The existing top-N opportunity slice presented as an Intelligence discovery
  surface, emphasizing opportunity rationale AND stating expressly that it is
  the top-N subset of the same RankedOpportunity[] used by Rankings.
  Not an independent dataset. No new calculations.

/intelligence/risks
= PORTFOLIO RISK VIEW
  Renders ONLY:
    portfolio.avgRisk
    diversification.flags
    correlation.flags
    correlation.concentrationSectors
  Allocation rulesApplied ONLY if already present in the certified payload.
  Must NOT invent or derive: per-company risk, per-sector risk, new risk
  scores, risk classifications, thresholds.

/intelligence/rankings
= ORDERED COMPARISON VIEW
  The existing ranking slice presented as the ordered comparison surface.
  Certified ordering PRESERVED. No new ranking logic.
```

## 5. Preserved implementation boundary (exact, unchanged)

### 5.1 NEW — exactly six files

```text
frontend/src/features/intelligence/IntelligenceOpportunities.tsx
frontend/src/features/intelligence/IntelligenceOpportunities.test.tsx
frontend/src/features/intelligence/IntelligenceRisks.tsx
frontend/src/features/intelligence/IntelligenceRisks.test.tsx
frontend/src/features/intelligence/IntelligenceRankings.tsx
frontend/src/features/intelligence/IntelligenceRankings.test.tsx
```

### 5.2 MODIFY — exactly six existing files

```text
frontend/src/app/App.tsx
frontend/src/app/navigation.ts
frontend/src/features/intelligence/IntelligenceHub.tsx
frontend/src/app/navigation.test.ts
frontend/src/app/Sidebar.test.tsx
frontend/src/features/intelligence/IntelligenceHub.test.tsx
```

### 5.3 ⚠️ ALL LINE ANCHORS MUST BE RE-DERIVED

Because the implementation target is now explicitly `phase13-next`, **every line anchor in the original act (§5, §6.2, §6.3, §6.4, §8.1, §8.2) is re-based to a tree that must be re-verified at execution time.** The implementation gate **MUST**:

1. Re-verify by `git ls-remote` that `phase13-next == 1a602d849cc47331d4f61cc366ed0a343f80e287`.
2. **Re-derive every anchor from the verified `1a602d84…` tree** before editing. No anchor may be reused from a transcript, from the original act, or from any prior gate.
3. **THROW and STOP** if `phase13-next` has advanced, or if any anchor does not resolve as expected.

Anchors recorded in the original act are retained there as **evidence of the baseline at which they were derived** — they are **not** a substitute for re-derivation.

### 5.4 Preserved test-amendment discipline (D-2 = A)

Amendment authority remains limited to assertions **genuinely rendered obsolete** by the authorized navigation-state transition. The implementation gate **must re-inspect the actual assertion bodies at the verified baseline before editing**, and:

- amend **only** obsolete assertions;
- make **no gratuitous test change**;
- **THROW and STOP if any protected assertion is modified.**

The original act's §8.2 protected set (including the finding that the `status !== 'future'` filter test remains valid because the three new navigable paths contain no `:id`) carries forward **as a discipline**, subject to re-derivation under §5.3.

## 6. Preserved exclusions (unchanged, binding)

### 6.1 Files that MUST NOT be modified

```text
frontend/src/app/routes.ts
frontend/src/api/crossSector.ts
frontend/server/executive-transport.ts
iips-platform/**
docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md
frontend/src/api/macro.ts
frontend/src/features/research/MacroContext.tsx
frontend/src/app/Sidebar.tsx
```

`governance/**` is additionally excluded from modification by the implementation: no governance record may be amended by implementation work, and this act amends none.

### 6.2 Capabilities that remain PROHIBITED

```text
new DTO
new endpoint
new transport
persistence
provider activation
external intelligence acquisition
fundamentals acquisition
synthetic fixtures
recomputation
fabrication
LIVE freshness
governance-record amendment
authoritative governance branch movement
```

Also carried forward unchanged: no new navigation identifier · no schema or payload file · no adapter · no credentials · no hosting · no `iips-platform` change · no hardcoded sectors · no bands/quadrants/thresholds/percentiles/normalizations in transport or React · no recommendations or interpretations beyond certified payload content · `null` → `"unavailable"`, never `0` · provenance carried verbatim · `freshness: 'SNAPSHOT'`, never `LIVE` · the dormant `MarketDataSource` / `DataBoundExecutor` surfaces remain dormant · frozen fixtures remain fixtures and stay labelled · §19 *"if the governed platform does not support a mutation, DO NOT IMPLEMENT IT."*

## 7. Security boundary (explicit)

The implementation target is `phase13-next` **because it contains the governed read-authorization implementation** introduced by:

```text
87f8b59dfb55d2b91155e7628777b3280352fd31
"feat: enforce governed read authorization"        (2026-08-18)
```

That commit introduced `guardRead`, `authorizeRead` and `readSurfaceFor`, is an **ancestor of `phase13-next`**, is **NOT an ancestor of the session branch**, and is the commit certified by `docs/v3.0/phase13-hardening/PHASE13_N3_READ_AUTHORIZATION_CERTIFICATION.md` (N+3), whose §10 live acceptance records `/api/cross-sector -> HTTP 200`, Result: PASS.

**Binding requirements:**

1. The NP-18 implementation **MUST NOT recreate, re-implement, alter, extend, weaken or re-author** that hardening in any way.
2. `frontend/server/executive-transport.ts` is on the **must-not-modify** list (§6.1). `readSurfaceFor` is **NOT** to be extended. **No new guard surface** is to be registered.
3. The implementation **MUST compose over the existing guarded `/api/cross-sector` path exactly as already certified on `phase13-next`** — via the existing `fetchCrossSectorData()` client, which already propagates the Bearer token through `authFetch`.
4. The session/governance lineage's dev-mode unauthenticated transport (*"NOT production auth"*) is **out of scope** and **MUST NOT** be replicated, ported or referenced as a pattern.
5. No new authorization model, no new RBAC, no new executor, no new credential handling.

## 8. Navigation boundary (explicit)

`NavStatus`, `NAV_STATUS_LABEL`, the `status` field on `NavItem`, and the existing `Sidebar.tsx` future-status machinery **are already present on the target baseline `1a602d84…`** (introduced by `9a92015` 2026-08-17 and `d86f7f4` 2026-08-18; `IntelligenceHub` by `5706ec5` 2026-08-19 — all ancestors of `phase13-next`).

**Binding requirements:**

1. They **must be handled exactly according to the original NP-18 authority act** — flipped where authorized, preserved where the act orders preservation.
2. **No new navigation machinery is authorized.** Nothing may be created, imported or back-ported to supply navigation-state behaviour that the target baseline already provides.
3. `NavStatus = 'implemented' | 'partial' | 'future'` **must NOT be narrowed or deleted**; `NAV_STATUS_LABEL` **must NOT be altered**; the `'future'` machinery **must be retained as still-supported**.
4. `frontend/src/app/Sidebar.tsx` **must NOT be modified** — its `isFuture` branch is retained as valid, still-supported code.
5. The authorized navigation-state transition is limited to: the **Intelligence group** `partial → implemented` (D-3 = A) and the **three children** Opportunities / Risks / Rankings `future → implemented`. No other navigation entry, group, label, path, `minRole` or status may change. Research and Evidence remain `partial`.
6. `frontend/src/app/routes.ts` **must NOT be modified** — the identifiers `intelligenceOpportunities`, `intelligenceRisks`, `intelligenceRankings` already exist there.

## 9. Qualification boundary (explicit)

```text
NP-18 remains OPEN / COMMISSIONING.

This act authorizes implementation targeting phase13-next.
It does not certify implementation.
It does not qualify implementation.
It does not authorize release.
```

Passing tests, components existing, routes resolving, or navigation status flipping do **not** constitute certification or qualification. Qualification requires a **separate, subsequent evidence and adjudication gate**, which remains outstanding. NP-18 must not be reported as `QUALIFIED`, `CERTIFIED`, `COMPLETE` or `RELEASED` under this act.

**NP-17 is unaffected:** `OPEN / COMMISSIONING`, acquisition limb `CLOSED BY DECLINATION` (A-0 = `A-DECLINE`). This act neither reopens nor advances NP-17.

## 10. IVM preservation (D-3b = LEAVE, D-4 = B)

`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` is **preserved unchanged in its entirety** on the target baseline:

- **§6.4 (line 152)** — preserved as historical Milestone-N evidence, consistent with its own section title *"Known gaps (preserved, not silently fixed)"* and its express reservation *"Hardening these is a separate authorization."* **No supersession annotation.**
- **§7 (lines 155–157)** — preserved unchanged as the historical Milestone-N record, notwithstanding that implementing NP-18 makes *"it implements none of them"* historical. **No supersession annotation.**

Implementing NP-18 therefore creates a **known, accepted, documented divergence** between IVM §7 and the navigation state. That divergence is **intentional** under D-3b and is **not** a defect to be silently fixed.

Note: the IVM does **not exist** on the governance/session lineage; this preservation obligation attaches to the **target baseline** `phase13-next`.

## 11. Mandatory rendering constraints (carried forward, binding)

1. **1:1 mapping only.** React performs presentational operations only (sort/filter/group/format), per the `CrossSectorIntelligence.tsx` precedent: *"NO ranking/normalization/percentile/opportunity/risk/confidence/comparison/threshold/allocation logic in the frontend."*
2. **`null` → `"unavailable"`.** Never `0`. Never a fabricated value. No `null` may be converted into numeric data.
3. **Provenance carried verbatim**: `dataSource: 'certified v2.0 platform (CSIP cross-sector engine) over frozen v1.1 Replay Baseline inputs'`, `freshness: 'SNAPSHOT'`, `calibratedAt: '2026-08-09T00:00:00.000Z'`, `transportSemantics: '1:1 mapping; transport transformation != decision transformation'`. **No `LIVE` claim.**
4. **K-2 — Opportunity/Ranking identity (binding).** `/intelligence/opportunities` **must state expressly** that it renders the **top-N slice of the same `RankedOpportunity[]`** as `/intelligence/rankings`. **Opportunities and Rankings remain slices of the same certified data** and **MUST NOT** be presented as two independent datasets.
5. **K-3 — Aggregate-risk-only (binding).** Risks render **only** aggregate `portfolio.avgRisk` plus existing `diversification.flags`, `correlation.flags`, `correlation.concentrationSectors` (and allocation `rulesApplied` only if already certified). **No per-company risk. No per-sector risk. No fabricated or newly computed risk object.** No certified per-company or per-sector risk object exists; anything further is fabrication and is prohibited.
6. **K-4 — `PipelineResult` slice constraint (binding).** Slice inventory limited to what `PipelineResult` actually produces. Nothing may be added.
7. **D-1 = A framing honesty (binding).** Alternate framing **must not be represented as new data or new intelligence capability.** Each surface must make clear that it is an **alternate presentation of the existing certified `/research/cross-sector` data**.
8. **No hardcoded sectors. No derived values. No recommendations or interpretations** beyond certified payload content.

## 12. Express statements required by the granting gate

- **This act authorizes implementation targeting `phase13-next`. It does not certify, does not qualify, and does not authorize release.**
- **NP-18 remains `OPEN / COMMISSIONING`.**
- **D-1 / D-1a alternate framing must not be represented as new data or new intelligence capability.**
- **Opportunities and Rankings remain slices of the same certified data.**
- **Risks remain aggregate `avgRisk` + existing flags only.**
- **`null` → `"unavailable"`. Provenance remains `SNAPSHOT`; no `LIVE` claim.**
- **No new DTO. No new endpoint. No new transport. No persistence. No synthetic fixtures. No provider.**
- **No implementation was performed in this gate.** No product file was created or modified. No DTO, endpoint, transport, platform change, fixture or credential was introduced.
- **No governance record was amended.** The original NP-18 act and the durable decision-boundary record remain byte-identical.
- **The authoritative governance branch was not moved. `phase13-next` was not moved.**

## 13. Execution conditions for the future implementation gate

1. **Verify by `git ls-remote`**, never by local remote-tracking refs (this repository is cloned with the single-branch refspec `+refs/heads/main:refs/remotes/origin/main`, so tracking refs go stale and `--not --remotes` checks give false negatives):
   - `phase13-next == 1a602d849cc47331d4f61cc366ed0a343f80e287`
   - `arena/01a03e3b-iips-review-recovered == 3c7568e0437f2a5e7b385833ed0752990286ad87`
2. **Re-derive every line anchor** from the verified `1a602d84…` tree (§5.3). **THROW** if the baseline differs.
3. **Re-inspect the actual test assertion bodies** before amending; amend only obsolete assertions; **THROW** if any protected assertion would change.
4. **Forensic scope check** after implementation: `git status --short`, `git diff --name-status`, `git diff --stat`, `git diff`. Require **exactly 6 new files + at most 6 modified files + 0 unauthorized files**. **THROW** on any forbidden file, any new DTO/endpoint/transport/platform/persistence/provider/fixture, any `LIVE` claim, any derived intelligence calculation, any independent-dataset treatment of Opportunities vs Rankings, any per-company or per-sector risk, or any `null` converted to fabricated numeric data.
5. **Execution path requirement (material, recorded for honesty):** this act is **recorded** on `arena/01a0ddea-iips-review-recovered` but **authorizes implementation on `phase13-next`**. The recording agent's Arena session is fixed to `arena/01a0ddea-iips-review-recovered` and **cannot push to `phase13-next`**. Execution therefore requires an operator or execution path holding authority to commit and push to `phase13-next`. This act does not itself confer that access, and no such access is assumed.
6. **This environment has re-cloned the governed checkout five times between turns.** A checkout repair performed in one turn does not survive into the next. Re-alignment, implementation, validation, commit and push must be **atomic within a single turn**.
7. **Fail closed.** If any invariant fails: `THROW` · `STOP` · no pass claim · no qualification claim · no partial-success claim.

---

*End of act. This act retargets an existing bounded implementation authority. It implements nothing, certifies nothing, qualifies nothing and releases nothing.*
