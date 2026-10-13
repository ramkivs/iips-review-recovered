# IIPS v3.0 — NP-07 Research — ACCEPTANCE AND BASELINE ADMISSION

## Refreshed Acceptance Record — No-Auth Baseline (v2.0)

**Record ID:** NP-07-ACCEPT-01
**Version:** 2.0 — Baseline Refresh (supersedes for publication the v1.0 record of 2026-10-04; that record is preserved unchanged — see §4.2)
**Original Acceptance Decision Date:** **2026-10-04** (decision of the Program Authority; **not re-dated**)
**Refresh & Publication Date:** 2026-10-13 (Asia/Calcutta)
**Repository:** `ramkivs/iips-review-recovered` (**IRR**)
**Ref (this record):** `refs/heads/main` — published via the established PR workflow under `REG-09`
**Status:** **ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE** (scope unchanged; evidence refreshed against the current no-auth baseline)

> ### **NP-07 RESEARCH — ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

---

## 1. Acceptance decision (unchanged; 2026-10-04)

The **NP-07 Research** capability, as qualified by `NP-07-QUAL-01`, was **ACCEPTED INTO THE ACTIVE NON-PRODUCTION IRR FEATURE BASELINE** by Program Authority decision on **2026-10-04**, on the basis of a completed qualification, an implementation residing on authoritative `main`, a regression profile showing no new failures, and explicit authorization by the holder of feature-baseline membership jurisdiction.

**This v2.0 record does not re-make or re-date that decision.** It (a) refreshes the qualification/acceptance *evidence* against the current no-auth IRR baseline, (b) publishes the records to `main` as the separately-authorized act contemplated by the original placement decision (§11), and (c) preserves the established scope and every exclusion.

### What is recorded vs refreshed vs published (explicit distinctions)

| Dimension | State |
| --- | --- |
| **PA disposition (acceptance decision)** | Recorded 2026-10-04; unchanged; preserved |
| **Qualification / acceptance evidence** | **Refreshed 2026-10-13** — 22/22 tests, typecheck, build re-executed at `main@6c2c955`; blobs re-verified (`NP-07-QUAL-01` v2.0 §1.1, §3) |
| **Implementation authority** | None granted by these records (read-only presentational surfaces; no implementation change) |
| **Publication status** | v1.0 records: published on `arena/01a0f351` (2026-10-04), preserved; **v2.0 records: published on `refs/heads/main` (2026-10-13)** via the established PR workflow |
| **Remote verification** | Performed post-merge against `origin/main` (coordinates recorded in the canonical tracker `REG-09` closure entry) |
| **Deferred / unadmitted scope** | Sector route, NP-08 Macro, Reports, Portfolios, production integration, certification, GAP-6 — all excluded/deferred (§10) |

---

## 2. Accepting authority (unchanged)

| Field | Value |
|---|---|
| **Accepting Authority** | **Program Authority — Ramki (Ramakrishnan)** |
| **Authority basis** | `NP-13-D0-01.md` (IRR `main`, `docs/integration/`) — Signer: Ramki (Ramakrishnan), Program Authority; D0 — ESTABLISHED / JURISDICTION DESIGNATED; RATIFIED; 2026-10-02. §1.3 vests feature-baseline DEFINITION + COMPOSITION + MEMBERSHIP in the designated holder; §3.9 confirms membership is within jurisdiction; each exercise must be its own explicit act (§2.3) |
| **Nature of the 2026-10-04 act** | An exercise of **J-3 — baseline MEMBERSHIP**, made as its own explicit act |
| **Authorization** | Explicit acceptance authorization granted by Program Authority during `GATE-NP07-ACCEPTANCE-R1`, 2026-10-04 |
| **Decision date** | **2026-10-04** (preserved; not re-dated by this refresh) |
| **Publication authorization (2026-10-13)** | Program Authority instruction of 2026-10-13 (`REG-09`): refresh the NP-07 qualification and acceptance evidence against the current no-auth baseline and publish the refreshed records through the established PR workflow if all evidence and scope checks pass. The scope checks passed (`NP-07-QUAL-01` v2.0). |

### 2.1 Scoping disclosure — NP-07 is not named in `NP-13-D0-01` (preserved, v1.0 §2.1)

Recorded transparently: **`NP-13-D0-01` contains 0 occurrences of `NP-07`.** Its §4.8 deferred enumeration lists NP-09…NP-13 only. Applying J-3 to NP-07 is recorded as **a reading** of the general membership grant, not an explicit designation. (Unchanged from v1.0.)

### 2.2 Governance disclosure — no dedicated NP-07 governance record exists (preserved, v1.0 §2.2)

There is no dedicated NP-07 governance / product-contract / persistence-owner designation record on any ref. This acceptance rests on the membership jurisdiction and the `main`-hosted implementation — not on a governance record that does not exist. (Unchanged from v1.0.)

### 2.3 Execution and provenance (preserved)

| Role | Actor |
|---|---|
| **Acceptance decision (authority)** | Ramki (Ramakrishnan) — Program Authority, 2026-10-04 |
| **Refresh, verification, drafting, publication** | `arena-agent` — acting under the 2026-10-13 Program Authority instruction; the agent holds no feature-baseline membership jurisdiction and claims none |

---

## 3. Qualification prerequisite (refreshed)

| Field | Value |
|---|---|
| **Qualification record** | `NP-07-QUAL-01` — `IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md` (v2.0, this publication) |
| **Qualification commits (historical)** | `1a0377481069b16257e341519dd8c4e701365f8e` (v1.0) → `45563a257c83cca7576ac2acc4f8bba6da49b21f` (addendum) — preserved on `arena/01a0f351` |
| **Qualification artifact blob (historical)** | `6c2be92adc57b8a5b9e5e8183dc7d27ecbb251be` (18,310 bytes) — preserved unchanged |
| **Qualification result (unchanged)** | **QUALIFIED — NON-PRODUCTION / IRR** |
| **Refreshed qualification evidence** | 22/22 tests, `tsc --noEmit` 0, `npm run build` 0 at `main@6c2c955`, 2026-10-13 (`NP-07-QUAL-01` v2.0 §3) |

The qualification record's boundary statements remain in force: it grants qualification only — no acceptance, certification, promotion or production readiness.

---

## 4. Accepted coordinates

### 4.1 Current coordinates (refreshed)

| Coordinate | Value |
|---|---|
| **Qualified implementation ref** | IRR **`refs/heads/main`** — **AUTHORITATIVE MAIN** |
| **Refresh coordinate (2026-10-13)** | **`6c2c955a9a3ad0e6d896746beb5062980952ba37`** |
| **Original qualified implementation commit (2026-10-04)** | **`ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`** (preserved as the original execution coordinate) |
| **Qualification record ref (historical)** | IRR `refs/heads/arena/01a0f351-iips-review-recovered` @ `3b5c54c09e06b1e86c93c29ed25508b171591416` (`45563a25…`) |
| **Non-production scope** | NP-07 Research — Company Intelligence · Cross-Sector Intelligence · Engine Registry |

### 4.2 Implementation surface — blob identity re-verified (2026-10-13)

All six dedicated capability/test blobs are **byte-identical** between `main@ac8a751c…` and `main@6c2c955` (table in `NP-07-QUAL-01` v2.0 §1.1). The three registration/transport files (`App.tsx`, `navigation.ts`, `server/engine-transport.test.ts`) changed as recorded there — the `/research` five-route set is complete and unchanged, and the transport-test delta is a one-line comment edit made by the no-auth commit `1f7997e5`. **No source or test file is created, modified, or deleted by this acceptance publication.**

### 4.3 Historical record preservation (v1.0)

The v1.0 acceptance record (blob `1b2df7a7c7b1e01b9d67c0515adecbb933069dbb`, commit `e8752de` on `arena/01a0f351`) is **preserved unchanged** and is **not claimed to be authoritative on `main`**. Its dual-ref statement (records on branch only) was accurate for its time; this v2.0 publication is the separately-authorized `main` publication its §11 deferred.

---

## 5. Accepted scope and Research product boundary (unchanged)

Acceptance covers **exactly the scope qualified by `NP-07-QUAL-01`** — three capabilities, and nothing beyond them. This is the established `Option C-2` scope: company and cross-sector qualification included; sector route and `NP-08` Macro excluded; Engine Registry included exactly as established by the 2026-10-04 records.

| Surface | In scope | Route | Evidence (2026-10-13 refresh) |
| --- | --- | --- | --- |
| **Company Intelligence** | **YES** | `/research/company/:id` (`App.tsx` line 40) | **6/6 passed**, exit 0 |
| **Cross-Sector Intelligence** | **YES** | `/research/cross-sector` (`App.tsx` line 42) | **6/6 passed**, exit 0 |
| **Engine Registry** | **YES** | `/research/engines` (`App.tsx` line 43) | **10/10** = 4/4 (`EngineRegistry.test.tsx`) + 6/6 (`server/engine-transport.test.ts`) |
| **Combined** | — | — | **22/22 passed**, 0 failed, 0 skipped, exit 0 |

**Research product boundary:** the `/research/*` route set. `App.tsx` lines 39–43 on authoritative `main` are the complete `/research` set. No feature is admitted merely because it exists in the repository.

---

## 6. Excluded Sector Intelligence scope (unchanged)

> **Sector Intelligence (`/research/sector/:id`) is EXCLUDED and is NOT accepted.**

| Field | Value |
|---|---|
| **Status** | **Not implemented** (re-verified 2026-10-13) |
| **Route state** | `/research/sector/:id` → `<FeaturePlaceholder surface="Sector" />` (`App.tsx` line 41) |
| **Effect** | Not qualified, not accepted, not brought into scope by this record |

---

## 7. NP-08 Macro and adjacent-surface exclusions (named per REG-09)

> **NP-08 Macro (D08/D115 macro workstream) is EXCLUDED from NP-07.** It is a separate, completed baseline (REG-13) and is not part of the Research product boundary. **Reports, Portfolios, and production integration are likewise excluded** — NP-07 acceptance does not expand into any of them.

---

## 8. IPD boundary (refreshed)

> ## **NO IPD DEPENDENCY ESTABLISHED**

Re-verified 2026-10-13 at IPD `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c` (unchanged): **0** NP-07 implementation files · **0** shared blobs · **0** `NP-07` token · **0** `EngineRegistry` product-surface references. The v1.0 §7.1 documentation discrepancy (9 historical-reference token occurrences each for `CompanyIntelligence` / `CrossSectorIntelligence`, all describing pruned-and-not-restored surfaces) remains disclosed; the operative conclusion is unchanged. IPD was not modified.

---

## 9. Evidence basis for acceptance (refreshed)

| # | Evidence | Result |
| --- | --- | --- |
| 1 | Company Intelligence | **6/6 passed**, exit 0 (2026-10-13, `main@6c2c955`) |
| 2 | Cross-Sector Intelligence | **6/6 passed**, exit 0 (2026-10-13) |
| 3 | Engine Registry — `EngineRegistry.test.tsx` | **4/4 passed**, exit 0 (2026-10-13) |
| 4 | Engine Registry — `server/engine-transport.test.ts` | **6/6 passed**, exit 0 (2026-10-13) |
| 5 | All four files combined | **22/22 passed**, 0 failed, 0 skipped, exit 0 (2026-10-13) |
| 6 | Typecheck | **PASS (`tsc --noEmit` exit 0)** (2026-10-13) |
| 7 | Build | **PASS (`npm run build` exit 0)** (2026-10-13) |
| 8 | Implementation blob identity | All 6 dedicated capability/test blobs **identical** `ac8a751c…` → `6c2c955`; registration-file deltas fully accounted (§4.2) |
| 9 | Sector Intelligence | Placeholder intact — exclusion intact |
| 10 | NP-08 Macro / Reports / Portfolios | Not drawn in; exclusions intact (§7) |
| 11 | IPD | Unchanged; **no dependency established** (§8) |
| 12 | Original 2026-10-04 execution | Preserved in `NP-07-QUAL-01` v1.0 (22/22 on both refs at that time) — historical, not restated as current |

---

## 10. Known limitations

1. **Non-production.** The accepted capability is non-production.
2. **No dedicated NP-07 governance record exists** (§2.2).
3. **Sector Intelligence is not implemented and remains excluded** (§6); **NP-08 Macro remains excluded** (§7).
4. **GAP-6 remains open.** The C-1/C-2 durability-convention tension (`NP-13-D0-01` GAP-6) is **not** closed by this publication.
5. **E2E-030 is corroboration, not certification** (preserved).
6. **The `10/10` figure is a test count, not an engine count** (preserved).
7. **Full-suite status is out of scope for the refresh** (`NP-07-QUAL-01` v2.0 §3 note).
8. **The v1.0 §5 token-count discrepancy** remains disclosed as historical (§8).

---

## 11. Placement decision (additively superseded for publication only)

| Field | Value |
|---|---|
| **2026-10-04 placement (preserved)** | Convention **C-2** (branch-now): records placed on `arena/01a0f351-iips-review-recovered`; "`main` publication deferred as a separate, separately-authorized act" |
| **2026-10-13 publication** | That deferred `main` publication is now executed as the separately-authorized act under `REG-09` (Program Authority instruction, 2026-10-13), through the established PR workflow |
| **Not done** | GAP-6 is not resolved; C-1 is not declared supreme; no claim that the v1.0 records were authoritative on `main` before this publication |

---

## 12. Boundary statements (verbatim, preserved)

> This acceptance does not constitute certification, production readiness, or production release

> Promotion of the implementation or acceptance record to `main` is not granted by this act

*(The second statement is preserved as the wording of the 2026-10-04 acceptance act. The 2026-10-13 publication is a separate act of publication of the records themselves — not a promotion of the implementation, which already resides on `main`.)*

### 12.1 Corollaries (preserved)

| Distinction | Statement |
| --- | --- |
| Acceptance ≠ Qualification | Separate acts (`NP-07-QUAL-01` / `NP-07-ACCEPT-01`) |
| Acceptance ≠ Certification | No certification; E2E-030 is not NP-07 certification |
| Acceptance ≠ Production readiness | Non-production only |
| Acceptance ≠ Sector Intelligence inclusion | Excluded |
| Acceptance ≠ NP-08 Macro inclusion | Excluded |
| Acceptance ≠ Reports / Portfolios / production integration | Excluded |
| Acceptance ≠ IPD admission | No IPD artifact admitted; no IPD dependency |
| Acceptance ≠ GAP-6 closure | GAP-6 remains open |

---

## 13. Pre-publication recheck (2026-10-13, all passed)

| # | Check | Result |
| --- | --- | --- |
| 1 | Off-main v1.0 records located and re-read | **PASS** — `arena/01a0f351@3b5c54c0…`, blobs `6c2be92a…` / `1b2df7a7…` |
| 2 | Implementation coordinate re-verified | **PASS** — `main@6c2c955…`; 6/6 dedicated blobs identical; registration deltas accounted |
| 3 | NP-07 suites re-executed at the current baseline | **PASS** — 22/22, exit 0 |
| 4 | Typecheck / build re-executed | **PASS** — both exit 0 |
| 5 | Scope matches qualification (no expansion) | **PASS** — three capabilities; sector route and NP-08 Macro excluded |
| 6 | No-auth baseline confirmed; surfaces auth-free | **PASS** — zero auth references in the three surfaces |
| 7 | IPD untouched | **PASS** — `4d3e1cd…` unmutated |
| 8 | No competing NP-07 acceptance act | **PASS** — the only prior act is v1.0 (`NP-07-ACCEPT-01`), preserved |
| 9 | Publication via established PR workflow | **PASS** — see §15 |

---

## 14. Mutation summary of this refresh/publication act

| Item | Value |
|---|---|
| Files added | **2** — this record and `NP-07-QUAL-01` v2.0 (plus the `REG-02/03/05/06` reconciliation record and the canonical tracker update in the same PR) |
| Source changes | **0** |
| Test changes | **0** |
| Changes to v1.0 records | **0** (preserved on `arena/01a0f351`) |
| IPD changes | **0** |

**This act carries no implementation change.** Nothing under `frontend/` or `iips-platform/` is touched.

---

## 15. References

| Ref | Coordinate |
|---|---|
| Qualification (v2.0, this publication) | `docs/integration/IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md` |
| Qualification (v1.0, historical) | `1a0377481069b16257e341519dd8c4e701365f8e` → `45563a257c83cca7576ac2acc4f8bba6da49b21f` — blob `6c2be92adc57b8a5b9e5e8183dc7d27ecbb251be` on `arena/01a0f351-iips-review-recovered@3b5c54c09e06b1e86c93c29ed25508b171591416` |
| Acceptance (v1.0, historical) | `e8752de` on `arena/01a0f351-iips-review-recovered` — blob `1b2df7a7c7b1e01b9d67c0515adecbb933069dbb` |
| Implementation (refresh coordinate) | IRR `main` `6c2c955a9a3ad0e6d896746beb5062980952ba37` |
| Implementation (original coordinate) | IRR `main` `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` |
| Membership jurisdiction | `NP-13-D0-01.md` (IRR `main`) — §1.3, §2.1, §2.3, §3.9, §7.4, GAP-6 |
| Acceptance gate | `GATE-NP07-ACCEPTANCE-R1` (2026-10-04) |
| Refresh & publication authority | `REG-09`, Program Authority instruction 2026-10-13 (canonical tracker) |
| IPD reference baseline | `ramkivs/iips-production-market-data` @ `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — reference only, 0 mutations |
| Publication coordinates | PR head / merge commit / post-merge verification recorded in the canonical tracker (`REG-09` closure entry) — verified live after merge (self-referential coordinates cannot be embedded in the blobs they hash) |

---

*Recording agent: Arena Agent Mode — refresh, verification and publication only; no authority is rendered by the agent. Acceptance decision: Program Authority — Ramki, 2026-10-04. Refresh & publication authorized: Program Authority, 2026-10-13.*

**End of acceptance record `NP-07-ACCEPT-01` (v2.0).**
