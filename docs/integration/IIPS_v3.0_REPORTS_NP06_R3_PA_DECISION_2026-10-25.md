# IIPS v3.0 — NP-06 Reports R3 (D-3): PA Decision — Option B (Second Dependency Specifier)

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` |
| **Decision requested as** | `D-3` in `IIPS-V3-REPORTS-NP06-R1-R2-R3-PA-DECISION-REQUEST-2026-10-25-01` §4 (IRR PR #256, merged `65e1814b9732e2cf79338ffaa6d1caf333fd3464`) |
| **Decision-maker** | Program Authority (PA) — Ramki |
| **Decision date / source** | `2026-10-25` (Asia/Calcutta) — the PA's one-pass instruction of 2026-10-25, which directs *"R3 / D-3: Option B"* and *"Implement the approved IRR-side binding"* while preserving the primary pin, Gate 3 artifacts and existing exports, and forbidding IPD mutation without authority. This decision is independent of `D-1` (decision request, D-3 row). |
| **Decision** | **`R3-Option B` SELECTED AND RENDERED:** add a **second IRR dependency specifier** to the governed NP-04 persistence lineage, keeping the primary pin unchanged. See §1 for the exact authorized surface. |
| **Effectiveness** | Effective as a register instrument **upon publication to `refs/heads/main` and independent remote read-back**, per program convention (§16.70.13). Until that publication the operative register remains `R3 OPEN / NOT ADMITTED`. Publication coordinates are not self-embedded; they are recorded in the tracker receipt after merge. |
| **Governing locus** | IRR `ramkivs/iips-review-recovered` only. **No IPD object is mutated** by this decision or its implementation. |
| **Preserved** | Primary pin `iips-production-market-data#2d9130e76bb0dc89daeefabaf297e27bdaa84250` and its exports `./portfolio-ui`, `./pit`, `./d114-non-production`; broker specifier `iips-broker-import#70b24f029842a7e9b7f615e4d9df7376fd4ff817`; Gate 3 `src/persistence/*` on IPD `main`; `CV-23` (no merge/cherry-pick/rebase/promotion/re-pin of the primary pin, no IPD export-map addition); A2; `REG-11` Option C; the HTTP 503 fence (blob `981470541812a64c733309f1debec75455d85bee`). |
| **Recording agent** | Arena Agent Mode — recording, publication, and bounded execution support. No authority is rendered by the agent. |

## 1. The exact authorized dependency surface

1. **New specifier (exactly one line added to `frontend/package.json`):**
   `"iips-np04-governed-persistence": "github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494"`,
   with the corresponding `frontend/package-lock.json` entries produced by the package manager. This is the specifier name proposed in the decision request §4.3 and is now the decided name.
2. **Consumed subpath:** `iips-np04-governed-persistence/persistence`, which at `2e11fa3b…` declares `types: ./dist/package/persistence/package.d.ts`, `import: ./dist/package/persistence/package.js` and is built by that commit's `prepare` → `build:pit-package` (which includes `src/persistence/package.ts`). Re-verified from the remote this pass: `2e11fa3b…` is `diverged` from IPD `main@4b5c65a731a66a6fa1260146a55df9ed772953a5` (`26` ahead / `210` behind, merge-base `4d3e1cdca3a33da0ec3be8b336b17128108a502c`), and its `src/persistence` contains `db.ts`, `errors.ts`, `identity.ts`, `index.ts`, `package.ts`, `reportKey.ts`, `schema.ts`, `store.ts` (the governed artifact store: `openDatabase(OpenOptions)`, `GovernedArtifactStore`).
3. **Unchanged:** the primary pin, the broker specifier, every existing export, Gate 3, and all IPD state. The pattern is already established in this manifest (two commit pins of the same repository: `iips-broker-import#70b24f02…` beside `iips-production-market-data#2d9130e7…`).
4. **Runtime shape:** a distinct, server-owned database file named only by `IIPS_NP04_DATABASE_PATH` (never the Gate 3 portfolio store's file, never client-supplied). Absent or unresolvable ⇒ fail closed (`503 persistence-unavailable` at any future transport; `null` at the binding resolver). No substitute or Reports-local store may ever be constructed (NP-06 `R3`: a Reports-specific store is prohibited).

## 2. `CV-23` §5 lineage obligations — accepted and recorded

| Element | Recorded value |
|---|---|
| (a) Capability served | NP-06 Reports governed artifact persistence (the five-operation contract, §3) |
| (b) Exact surviving lineage | IPD commit `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`, consumed read-only through the §1 specifier |
| (c) Migration-ledger reconciliation | NP-04's own schema/migrations run only inside its own database file (§1.4). No merge into the Gate 3 ledger; no Gate 3 ledger entry is claimed; Gate 3 artifacts and exports are untouched. |
| (d) Re-pin / qualification path | Persistence-level qualification is by the IRR integration tests rendered under this decision. Eventual convergence, if Reports is ever admitted, is `R3-Option C` (IPD package act on `main`), recorded here as the intended long-term target; it is **not** authorized by this record. If the lineage is abandoned, the §1 specifier must be retired in the same act that converges. |

Residual risk stated in the decision request and accepted expressly: `2e11fa3b…` does not receive `main`-line fixes while it remains a separate lineage.

## 3. Authorized implementation (IRR-side only)

Under this decision the following bounded non-production work is authorized and was directed by the same PA instruction:

1. Restore/adapt the historical Reports persistence binding from the qualified tree (`39dd43eb…` / tip `6a8afbb2…`, blobs `49f20306…` persistence, `16d787ea…` port, `7f7b80a5…` adapter) **adapted to the §1 specifier** (`iips-np04-governed-persistence/persistence`, not the historical primary-pin subpath) and to honest current-baseline semantics: the binding takes an explicit `(tenantId, userId)` owner pair as an input argument. It does **not** resolve an owner, does **not** authenticate, and must not be read as equating the historical authenticated `(tenantId, userId)` contract with any future unauthenticated R1 owner source. Who may supply that pair in production remains exactly what R1/R2 will decide; until then the binding is exercised only with test-only owner pairs.
2. Validate the **five-operation persistence contract** against the real governed store — `createInstance`, `appendVersion`, `resolveById`, `queryByOwner`, `listSupersededBy` — including cross-owner non-disclosure, single-parent supersession, content-vs-instance identity separation, fail-closed resolution when unconfigured, and durability across database close/reopen (persistence level).
3. Additive tracker registration keeping commissioning, implementation, integration, qualification, acceptance, admission and production readiness as separate statuses.

## 4. Expressly not authorized

This decision does **not**: establish an owner (R1), approve an R2 contract shape, wire any transport, resolve an owner per request, lift/edit/retire the 503 fence, mount `/reports` or any Reports route/UI/navigation/client, wire D115/CV-43, claim any part of F-7 (whose durable HTTP legs additionally require an effective R1 and an R2 decision), grant capability acceptance, or grant production admission/deployment. Reports remains unexposed while those prerequisites are unsatisfied.

Options not selected: `R3-Option A` (not viable — no artifact store behind the current pin), `R3-Option C` (IPD package/export act; recorded as convergence target only), `R3-Option D` (retain/no binding).

*Recording agent: Arena Agent Mode — recording, publication, and bounded execution support; no authority rendered. Program Authority: Ramki. **Decision: R3-Option B — second dependency specifier to `2e11fa3b…`; primary pin, Gate 3 and existing exports preserved; no IPD mutation.** Decision date 2026-10-25 (Asia/Calcutta). Effective upon publication to `main` and independent remote read-back.*
