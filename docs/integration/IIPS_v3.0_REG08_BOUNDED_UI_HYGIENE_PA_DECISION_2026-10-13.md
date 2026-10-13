# IIPS v3.0 — REG-08 Bounded Frontend UI Hygiene Correction — Program Authority Decision & Implementation Record

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG08-BOUNDED-UI-HYGIENE-PA-DECISION-01` |
| Decision ID | **`REG-08`** (`IRR-UI-HYGIENE`) |
| Decision | **`APPROVED — bounded implementation authorized`** |
| Program Authority (PA) | **Ramki** — single owner, sole user, and Program Authority of the single-user personal-use IIPS platform |
| Date | 2026-10-13 (Asia/Calcutta) |
| Authoritative repository / branch | `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main` |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — untouched (`main` at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`) |
| Verified baseline `origin/main` | Commit `f970028cf633f561c225d66ae4b3864f48afe656`; root tree `bab9782ed104567e571abccc350c75760ff35dca` (merge of PR #75) |
| Task / publication branch | `arena/b0c55e2b-iips-review-recovered` → Pull Request **#76** → `refs/heads/main` |
| Canonical tracker | [`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`](../../IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md) |
| Environment | Non-production, first-party IRR frontend UI only |

---

## 1. Decision Statement and Authority

**Decision (`REG-08`):** **`APPROVED — bounded implementation authorized`**.

Ramki, as single owner, sole user, and Program Authority (PA), authorizes the narrowly scoped implementation, validation, pull-request publication, and merge to `refs/heads/main` of the two bounded frontend UI hygiene corrections identified under `REG-08` in the 2026-10-13 full-reference IRR/IPD investigation:

1. **Defect 1 (`frontend/src/features/executive/ExecutiveDashboard.tsx`):** Replace naive lowercase display-name interpolation (``engineId: `sector.${d.sector.toLowerCase()}` ``) when constructing `evidenceRefs` with the governed 13-sector canonical engine-ID mapping (`GOVERNED_ENGINE_ID_BY_SECTOR`), correcting the four affected sectors (`Capital Markets` → `sector.capital-markets`, `Telecommunications` → `sector.telecom`, `Automobile` → `sector.auto`, `Materials & Metals` → `sector.materials`) while preserving the remaining nine canonical sector engine IDs.
2. **Defect 2 (`frontend/src/features/ai-advisory/AiAdvisory.tsx`):** Expand the hardcoded 6-sector `<select aria-label="Engine result">` option list (`CERTIFIED_AI_ADVISORY_SECTORS`) to cover all 13 canonical certified sectors/engines in canonical baseline order (`Banking`, `Insurance`, `Capital Markets`, `Healthcare`, `Hospitality`, `Energy`, `Utilities`, `Consumer`, `Industrials`, `Technology`, `Telecommunications`, `Automobile`, `Materials & Metals`), matching the 13 sectors already served by `GET /api/ai-advisory/:sectorKey`.

This record is an **additive, dated governance and implementation record**. It preserves all prior governance records and their original status banners unchanged and does not claim that any earlier record retroactively authorized this work.

---

## 2. Authoritative Canonical 13-Engine / Sector Taxonomy

Verified against:
- `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` (`v1.1.0`)
- `iips-platform/src/integration/EngineRegistry.ts` (`CERTIFIED_ENGINES`)
- `docs/integration/IIPS_v3.0_E2E-030_D42_DELTA_GOVERNANCE_DECISION.md` and `IIPS_v3.0_E2E-030_CERTIFICATION.md` (`D42`)
- `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md` (`G1-B3`: `sector.capital-markets`)
- `frontend/server/executive-transport.ts` (`ENGINE_ID_BY_SECTOR` and `resolveSectorEngine`, remediated server-side in PR #39 `7b2294a5`)
- `frontend/src/features/evidence/EvidenceLanding.tsx` (`GOVERNED_EVIDENCE_SUBJECTS`)

| # | IES | Canonical Sector Display Name / `sectorKey` | Canonical `engineId` | Pre-Fix `ExecutiveDashboard.tsx` `engineId` | Pre-Fix `AiAdvisory.tsx` Selector | Post-Fix `REG-08` Outcome |
|---:|---|---|---|---|---|---|
| 1 | `IES-006` | `Banking` | `sector.banking` | `sector.banking` | Present | Preserved (`sector.banking` · in selector) |
| 2 | `IES-007` | `Insurance` | `sector.insurance` | `sector.insurance` | **Missing** | **Added to selector** (`Insurance`) |
| 3 | `IES-008` | `Capital Markets` | `sector.capital-markets` | **`sector.capital markets` (Defect 1)** | **Missing** | **Fixed (`sector.capital-markets`) & added to selector** |
| 4 | `IES-009` | `Healthcare` | `sector.healthcare` | `sector.healthcare` | **Missing** | **Added to selector** (`Healthcare`) |
| 5 | `IES-010` | `Hospitality` | `sector.hospitality` | `sector.hospitality` | **Missing** | **Added to selector** (`Hospitality`) |
| 6 | `IES-011` | `Energy` | `sector.energy` | `sector.energy` | Present | Preserved (`sector.energy` · in selector) |
| 7 | `IES-012` | `Utilities` | `sector.utilities` | `sector.utilities` | Present | Preserved (`sector.utilities` · in selector) |
| 8 | `IES-013` | `Consumer` | `sector.consumer` | `sector.consumer` | Present | Preserved (`sector.consumer` · in selector) |
| 9 | `IES-014` | `Industrials` | `sector.industrials` | `sector.industrials` | Present | Preserved (`sector.industrials` · in selector) |
| 10 | `IES-015` | `Technology` | `sector.technology` | `sector.technology` | Present (default) | Preserved (`sector.technology` · default in selector) |
| 11 | `IES-016` | `Telecommunications` | `sector.telecom` | **`sector.telecommunications` (Defect 1)** | **Missing** | **Fixed (`sector.telecom`) & added to selector** |
| 12 | `IES-017` | `Automobile` | `sector.auto` | **`sector.automobile` (Defect 1)** | **Missing** | **Fixed (`sector.auto`) & added to selector** |
| 13 | `IES-020` | `Materials & Metals` | `sector.materials` | **`sector.materials & metals` (Defect 1)** | **Missing** | **Fixed (`sector.materials`) & added to selector** |

---

## 3. Authorized Scope and Explicit Exclusions

### 3.1 Authorized Implementation Scope
1. `frontend/src/features/executive/ExecutiveDashboard.tsx`: Define `GOVERNED_ENGINE_ID_BY_SECTOR` for all 13 canonical sectors and resolve `evidenceRefs[].engineId` through `GOVERNED_ENGINE_ID_BY_SECTOR[d.sector] ?? \`sector.${d.sector.toLowerCase()}\``.
2. `frontend/src/features/executive/ExecutiveDashboard.test.tsx`: Add focused `REG-08` regression test verifying all 13 canonical `engineId`s, the 4 corrected sectors, absence of fabricated/taxonomy-resolved IDs, and 1:1 uniqueness.
3. `frontend/src/features/ai-advisory/AiAdvisory.tsx`: Define `CERTIFIED_AI_ADVISORY_SECTORS` with all 13 canonical sectors in baseline order and render all 13 `<option>` elements in the `<select aria-label="Engine result">` control while preserving `DEFAULT_ENGINE_RESULT = 'Technology'`.
4. `frontend/src/features/ai-advisory/AiAdvisory.test.tsx`: Add focused `REG-08` regression tests verifying 13-sector selector completeness, exact `value`/`textContent` correspondence, no duplicates or taxonomy-resolved categories (`IT`, `Chemicals`, `Realty`, `Real Estate`), and `GET /api/ai-advisory/${encodeURIComponent(sector)}` dispatch across newly exposed sectors.
5. `docs/integration/IIPS_v3.0_REG08_BOUNDED_UI_HYGIENE_PA_DECISION_2026-10-13.md` (this record) and `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (canonical E2E tracker and decision register).

### 3.2 Explicit Exclusions and Non-Scope
- **Unused `admin` route constant (`frontend/src/app/routes.ts:27`):** Left **unchanged** as unrelated optional cleanup not required to resolve either defect.
- **No engine-taxonomy redesign or scoring change:** Zero edits to `iips-platform/`, `program-v1.1-certification/`, or server transports (`frontend/server/**`).
- **No IPD mutation or IRR↔IPD mapping:** `ramkivs/iips-production-market-data` and `frontend/package.json` (`#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`) are untouched.
- **No persistence, owner-context, API contract, or HTTP `503` safeguard changes:** `NP-09/10/11` (`F-3`) and `NP-06`/`G-2` (`503 owner-context-unavailable` under `F-4`/`F-5`) are untouched.
- **No production, provider, or authentication changes.**

---

## 4. Validation Requirements, Objective Acceptance Criteria, and Executed Results

| Check / Criterion | Command Executed (`cwd: frontend/`) | Actual Result |
|---|---|---|
| Executive Dashboard UI unit + REG-08 canonical engineId regression suite | `npx vitest run src/features/executive/ExecutiveDashboard.test.tsx` | **PASS** — 1 file, **5/5 tests passed** (`0` failed) |
| AI Advisory UI unit + REG-08 13-sector selector regression suite | `npx vitest run src/features/ai-advisory/AiAdvisory.test.tsx` | **PASS** — 1 file, **6/6 tests passed** (`0` failed) |
| Companion server transport contract verification (unmodified) | `npx vitest run server/ai-advisory-transport.test.ts server/product-transport.test.ts` | **PASS** — 2 files, **22/22 tests passed** (`12/12` AI advisory transport across 13 sectors + `10/10` product transport D42 taxonomy check) |
| Combined focused Vitest run | `npx vitest run src/features/executive/ExecutiveDashboard.test.tsx src/features/ai-advisory/AiAdvisory.test.tsx server/ai-advisory-transport.test.ts server/product-transport.test.ts` | **PASS** — **4 files passed, 33/33 tests passed, 0 failed** |
| Frontend TypeScript typecheck | `npx tsc --noEmit` | **PASS** — exit code `0`, `0` errors |
| Frontend production build | `npm run build` (`tsc -b && vite build`) | **PASS** — exit code `0`, `84` modules transformed |

**Checks intentionally not run (and not claimed):** Unrelated backend persistence/owner-context suites, `iips-platform` regression suite (already verified at `PR #54` `e2cda00b`), and live external provider/Keycloak suites.

---

## 5. Artifact Identities (Verified Pre-Merge & Preserved Across Merge)

Because `main` is at `f970028cf633f561c225d66ae4b3864f48afe656` (first parent of the PR #76 merge), the merged tree on `origin/main` preserves the exact Git blob SHA and raw SHA-256 of every changed file below:

| Path | Status | Lines | Bytes | Git Blob SHA | Raw SHA-256 |
|---|---|---:|---:|---|---|
| `frontend/src/features/executive/ExecutiveDashboard.tsx` | Modified | 155 | 7,805 | `cf7e79ba9907ae6d18807168d90860927ebbf25e` | `dac6867be10bacc1dbc1bc8aa3e94f98f8986fde99958360524d6a638ddb2fac` |
| `frontend/src/features/executive/ExecutiveDashboard.test.tsx` | Modified | 134 | 5,950 | `2fc2cd5eeea41f3afe3c2d008dbaabe9f25f3847` | `212dd864ab6821950a57b545f910bb4dcf50690bb4edf6e77f8266dd6efdf761` |
| `frontend/src/features/ai-advisory/AiAdvisory.tsx` | Modified | 106 | 4,859 | `65f392d644ce6ed41df64c9d64a851f663531674` | `d6ba7310406d079835bd32ce6d591db942bf864722554d84d0cda9ea5eb576ad` |
| `frontend/src/features/ai-advisory/AiAdvisory.test.tsx` | Modified | 128 | 5,127 | `ad68ef30e4cf54ce82c0f53d131619dc59b2f902` | `8ac51c670814d73340a9955af2f9760aa6e7d4fbe58f0397c48a413cdbeecb70` |

---

## 6. E2E Closure Conditions

`REG-08` achieves **`CLOSED / DURABLE / REMOTELY VERIFIED`** status upon satisfaction of all four conditions:
1. **Tested implementation:** Both UI defects corrected in `ExecutiveDashboard.tsx` and `AiAdvisory.tsx` and verified by focused regression tests (`33/33` passing), `tsc --noEmit` (`0`), and `npm run build` (`0`).
2. **Accepted PR:** Published from `arena/b0c55e2b-iips-review-recovered` as Pull Request **#76** to `main` under this PA decision.
3. **Durable remote publication:** Merged to `ramkivs/iips-review-recovered @ refs/heads/main` via `gh pr merge 76 --merge` (no direct push or force-push).
4. **Independent post-merge verification:** Remote `origin/main` merge commit, root tree, and file blobs independently verified against GitHub after merge, and recorded in the canonical tracker (`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`).

```text
DECISION_ID=REG-08
DECISION_STATUS=APPROVED — BOUNDED IMPLEMENTATION AUTHORIZED
PA=Ramki (Single Owner & Program Authority)
DEFECT_1=ExecutiveDashboard.tsx canonical engineId mapping for all 13 sectors (incl. sector.capital-markets, sector.telecom, sector.auto, sector.materials) — FIXED & TESTED
DEFECT_2=AiAdvisory.tsx 13-sector selector coverage matching GET /api/ai-advisory/:sectorKey — FIXED & TESTED
UNRELATED_ROUTES_CLEANUP=routes.ts:27 left unchanged per scope rule
FOCUSED_VALIDATION=4 test files (33/33 pass), tsc --noEmit (exit 0), npm run build (exit 0)
PUBLICATION_ROUTE=arena/b0c55e2b-iips-review-recovered -> PR #76 -> refs/heads/main
```
