# IIPS v3.0 — NP-06 Reports: One-Pass Decision Execution Record (R1 / R2 / R3 / F-7 / CV-51)

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-ONE-PASS-EXECUTION-2026-10-25-03` |
| **Authority** | Commissioning `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01`; the PA's one-pass instruction of 2026-10-25; rendered R3 decision `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (PR #258, merged `61db73a1800fbc6ffb9e12c59645cfb5dd055396`, post-merge CI `40182258170` `success`, remote blobs read back). This record renders no further decision. |
| **Date** | `2026-10-25` (Asia/Calcutta) |
| **Repository** | IRR only, session branch. IPD read-only throughout; **0 IPD writes**. |

## 1. Starting state — independently verified this pass

| Item | Verified result |
|---|---|
| IRR `main` at start | `3636140c98f0949aee2a0beadfa5f1c026286302` (tree `69c855aec41346d932dbed4bcd89a446d1ca1ea0`), merge of PR #257 |
| PRs #254–#257 | All `MERGED`: #254 merge `f0c14dcb2c216a778920146ad7d18ff534447288`; #255 `0e1b075d72e313e1950dd2f12aa8fbf066e0e1c1`; #256 `65e1814b9732e2cf79338ffaa6d1caf333fd3464`; #257 `3636140c98f0949aee2a0beadfa5f1c026286302` (PR-head CI SUCCESS) |
| Commissioning + receipt | `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01` on `main`, published via PR #254 with receipt PR #255 |
| Prepared decision request | `IIPS-V3-REPORTS-NP06-R1-R2-R3-PA-DECISION-REQUEST-2026-10-25-01` on `main` via PR #256 (receipt PR #257), still correctly labelled PROPOSED at the start of this pass |
| `REG-11` Option C / A2 | Preserved and operative at start; A2 `IIPS-V3-REPORTS-CV21-DQ7A-A2-PA-DISPOSITION-2026-10-25-01` re-read this pass |
| IPD (read-only) | `main@4b5c65a731a66a6fa1260146a55df9ed772953a5` (tree `cf5e85856009360de3ffb9614970c383a26d73ba`); `2e11fa3b…` diverged `26` ahead / `210` behind (merge-base `4d3e1cdca3a33da0ec3be8b336b17128108a502c`), exporting `./pit`, `./d114-non-production`, `./persistence` (built by its `prepare`); pin `2d9130e7…` exporting exactly `./portfolio-ui`, `./pit`, `./d114-non-production` |
| Historical qualification | Branch-only at `39dd43eb…` / tip `6a8afbb2…` (fetched as objects this pass); historical 32/32, 228/228, 14/14 remain source-reported and were **not** re-executed |
| F-7 harness | `frontend/server/reports-restart-harness.ts` (`0df66de2…`) + `reports-restart.test.ts` on `main`, fail-closed form |

## 2. Decisions executed

| Decision | Outcome | Durable reference |
|---|---|---|
| **R1 / D-1** | **Option B SELECTED — NOT EFFECTIVE.** U-1 tenant value, U-2 owner value, U-3 F-3-reuse direction, U-4 fifteen `D-2` §8 elements, U-5 value-act property set are unspecified in the instruction and every authoritative record; none was invented and the F-3 pair was not aliased. `R1` remains **NOT ESTABLISHED**; `REG-11` Option C remains operative; no supersession effected. | `IIPS-V3-REPORTS-NP06-R1-PA-DECISION-2026-10-25-01` (PR #258) |
| **R3 / D-3** | **Option B RENDERED AND EFFECTIVE** on publication + read-back: one second specifier `iips-np04-governed-persistence#2e11fa3b…`; primary pin, broker specifier, Gate 3, existing exports preserved; `CV-23` §5 (a)–(d) recorded; 0 IPD mutations. | `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (PR #258, merge `61db73a1…`, CI `40182258170` SUCCESS) |
| **R2 / D-2** | **NOT RENDERED.** Sequencing (needs effective R1) plus unselected C-3 (authorization predicate) and C-7 (audit disposition); C-2/C-4 prepared only. Published as a prepared/blocked record **before** any dependent implementation, and no security-sensitive behaviour was implemented. The historical authenticated `(tenantId, userId)` contract was expressly **not** equated with any future unauthenticated owner source: the restored binding takes an explicit owner pair as input and derives nothing. | `IIPS-V3-REPORTS-NP06-R2-CONTRACT-DECISION-PREPARED-2026-10-25-01` (PR #258) |

## 3. R3 implementation completed (IRR-side only)

| Path | Change |
|---|---|
| `frontend/package.json` / `package-lock.json` | Exactly one dependency added (`iips-np04-governed-persistence#2e11fa3b…`, lock `resolved` at that commit); primary and broker pins byte-unchanged |
| `frontend/server/reports/persistence-port.ts` | Restored from qualified blob `16d787ea…`, **adapted**: R3-Option-B boundary descriptor and runtime specifier (`iips-np04-governed-persistence/persistence`); five-operation port + fail-closed validator retained |
| `frontend/server/reports/persistence.ts` | Restored from `49f20306…`, **adapted**: owner-pair input instead of the retired `Principal` type (no authentication is asserted or implied); integrity, identity-separation, chain-verification logic retained |
| `frontend/server/reports/np04-adapter.ts` | Restored from `7f7b80a5…` (validated narrowing; never a substitute store) |
| `frontend/server/reports/index.ts` | Restored public surface, with the R3/R1 scope note |
| `frontend/server/reports/reports-persistence-integration.test.ts` | **New** — real-store integration (below) |

Not restored, not wired: any transport, owner resolver/carrier, route, UI, navigation, API client. The fence (blob `981470541812a64c733309f1debec75455d85bee`) is unchanged and remains the only HTTP behaviour.

## 4. Actual test and CI results (executed this pass, not source-claimed)

Environment: Node `v22.22.3`; `npm install` with the sandbox TLS workaround `NODE_EXTRA_CA_CERTS` (not a repository change; not used in CI). The new package's `prepare` built `dist/package/persistence/*` in `node_modules`.

| Command | Result |
|---|---|
| `npx vitest run server/reports/reports-persistence-integration.test.ts` (+ canonical/artifact/fence/composed, same run) | **111 passed / 0 failed** (integration 5, canonical 46, artifact 56, fence 2, composed 2) |
| `npx vitest run server/reports-restart.test.ts` | **5 passed / 0 failed** — fence identical across separate processes; `durableLeg:'not-executed'`, `f7Satisfied:false` still asserted |
| `npm run test:ci` + `node .ci/assert-tests.js` | **102 files / 1,309 passed / 0 failed**; guard `OK` (delta from `main` 101/1,304 = the new integration file, +5) |
| `npm run typecheck` / `typecheck:replay-server` / strict `tsc` on the four new binding files | **0 / 0 / 0** |
| `npm run build` | **exit 0** — chunk `index-Bh4vcGJI.js` `1,590.96 kB` / gzip `222.05 kB`, unchanged (server binding is not in the client bundle) |

Five-operation contract validated against the **real** `GovernedArtifactStore` (not a double): `createInstance` (store-minted instance id ≠ content-derived id; identical content ⇒ same `reportKey`, distinct `reportId`), `appendVersion` (head-only, version 2, single-parent), `resolveById`, `queryByOwner`, `listSupersededBy`; cross-owner resolve/chain/query disclose nothing; resolver fails closed with no `IIPS_NP04_DATABASE_PATH`; **durability verified at persistence level** by close + reopen on a new handle/store/binding with independent re-read.

## 5. F-7 — attempted, **NOT SATISFIED**

The committed harness was executed (above): its durable HTTP legs cannot run because they require an *effective* R1 owner source and an R2 contract, both absent (§2). `durable-read` remains `blocked-R1-R3`-in-substance (now blocked on R1/R2, R3 being admitted); the suite still asserts `f7Satisfied:false`. Persistence-level close/reopen durability (§4) is real evidence about the store binding, and is expressly **not** F-7 satisfaction: F-7 requires the separate-process HTTP restart against the admitted binding under the decided owner contract, plus its positive/negative ownership-boundary legs. **F-7 remains NOT SATISFIED.**

## 6. Acceptance and CV-51

No acceptance criteria are satisfied by this pass beyond R3 consumer admission itself. `CV-51` remains **BLOCKED**: F-7 and capability acceptance are prerequisites, neither exists, and no separate CV-51 act has been rendered. No route/UI work was done; D115/CV-43 was not wired; no production admission is granted or implied.

## 7. Separate statuses

| Status | Result |
|---|---|
| Commissioning | **COMMISSIONED — bounded non-production only** |
| Implementation (current) | **PARTIAL** — domain + admitted persistence binding (unwired, no owner source, no transport) |
| Integration (persistence) | **INTEGRATED at binding level** under effective R3; five-operation contract validated against the real store |
| Qualification | **NOT QUALIFIED** — F-7 NOT SATISFIED |
| Governance authorization | R3 rendered/effective; R1 selected-not-effective; R2 not rendered |
| Capability acceptance | **NOT ACCEPTED** |
| Admission / production readiness | **NOT ADMITTED / NOT PRODUCTION-READY** |

## 8. Remaining genuine blockers (exact authority needed)

1. **R1 effectiveness** — one dated PA effectiveness act supplying U-1 (tenant value), U-2 (owner value) or an express F-3-reuse direction (U-3), and the fifteen `D-2` §8 elements (U-4) with the value-act property set (U-5). Nothing else about Option B is open.
2. **R2 decision** — after (1): PA selections for C-3 (authorization predicate) and C-7 (audit sink or express deferral), adopting prepared C-2/C-4 and the §5.4 replacement rows; published before any transport implementation.
3. **F-7** — after (1)+(2) and transport wiring: execute the harness durable legs in separate processes and obtain a qualification determination.
4. **Acceptance, then CV-51, then production admission** — separate acts, in order.

*Execution support: Arena Agent Mode. No authority rendered beyond recording the PA's rendered selections. Reports is not qualified, not accepted, not admitted, and not production-ready.*
