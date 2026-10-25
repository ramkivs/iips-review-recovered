# IIPS v3.0 — NP-06 Reports Resumption Pass 2: Execution Record and Single-Pass Closeout

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-RESUMPTION-PASS2-EXECUTION-2026-10-25-01` |
| **Record type** | Execution and closeout report. **Renders no decision.** |
| **Authority** | Commissioning `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01` §2 (bounded non-production investigation, integration, testing, qualification evidence, additive tracker registration, ordinary publication path) and §4 (the further acts it does not render). Rendered acts consumed, not re-opened: `IIPS-V3-REPORTS-NP06-R1-PA-DECISION-2026-10-25-01` (`R1-Option B` SELECTED — NOT EFFECTIVE); `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (effective); `IIPS-V3-REPORTS-NP06-R2-CONTRACT-DECISION-PREPARED-2026-10-25-01` (prepared, not rendered). |
| **Date** | `2026-10-25` (Asia/Calcutta) |
| **Repository** | IRR `ramkivs/iips-review-recovered`, session branch `arena/d8afb381-iips-review-recovered` only. IPD **read-only, 0 writes**. |
| **Baseline verified before any change** | `origin/main` = local `HEAD` = **`67739e23108eeac0b0e9ce04427d622779f01a06`**, tree **`1316e8008c65095a65261add4994fc4fa4a79d56`** (merge of PR #260, `2026-10-25T10:02:14Z`); working tree clean; **0** open IRR PRs; post-merge `main` CI run **`40183107424` SUCCESS**. IPD `main` **`4b5c65a731a66a6fa1260146a55df9ed772953a5`**, **0** open IPD PRs. |
| **Evidence annex** | [`evidence/integration/np06-reports-resumption-pass2-2026-10-25/`](../../evidence/integration/np06-reports-resumption-pass2-2026-10-25/MANIFEST.md) — raw command output from this pass, blob digests, and the reproduction script. |

---

## 1. What this pass did, in one paragraph

It re-established the starting state from remote objects, re-ran the completion sweep for the `R1` value-act fields across every authoritative record including a fresh re-fetch of the qualified historical tip, confirmed that **none** of `U-1`…`U-5` (nor `R2`'s `C-3`/`C-7`) has any authoritative determination, published one consolidated seven-field decision request, corrected a stale `R3` label inside the committed F-7 harness without changing any fail-closed behaviour, re-executed the full validation set on the current tree, and registered the result additively in the tracker. It did **not** implement any security-sensitive transport, did **not** lift the fence, did **not** invent an owner, and did **not** claim any gate.

## 2. Starting state — independently verified (closeout category: **completed and remotely verified**)

| Item | Verified value | Method |
|---|---|---|
| IRR `origin/main` | `67739e23108eeac0b0e9ce04427d622779f01a06`, tree `1316e80…` | `git fetch origin main`, `git rev-parse`, `gh api .../git/commits` |
| Open IRR PRs | **0** | `gh pr list --state open` |
| Recent merges | #254 `f0c14dcb…`, #255 `0e1b075d…`, #256 `65e1814b…`, #257 `3636140c…`, #258 `61db73a1…`, #259 `f00e1639…`, #260 `67739e23…` — all `MERGED` | `gh pr list --state merged` |
| CI on the three load-bearing commits | `61db73a1` (R3 decision), `f00e1639` (R3 integration), `67739e23` (receipt) — `Typecheck · Test · Build` **success** on each | `gh api .../commits/<sha>/check-runs` |
| Remote blobs vs the §16.110.4 receipt | `persistence-port.ts` `71148afa…` ✔, integration test `daa488aa…` ✔, fence `981470541812a64c733309f1debec75455d85bee` ✔, R3 decision record `9642ce1b…` ✔, manifest `a0061bce…` ✔ | `gh api .../contents?ref=main`, `git hash-object` |
| Dependency surface | primary pin `#2d9130e7…` exports exactly `./portfolio-ui`, `./pit`, `./d114-non-production`; second specifier `iips-np04-governed-persistence#2e11fa3b…` exports `./persistence` (+`./pit`, `./d114-non-production`), `prepare` = `build:pit-package`; broker pin `#70b24f02…` | `gh api .../contents/package.json?ref=<commit>` |
| IPD | `main@4b5c65a7…`, **0** open PRs, **0** writes this pass | `gh api`, `gh pr list` |

These are fresh measurements on the current `main`, not restatements of prior records.

## 3. `R1` investigation — **NO AUTHORITATIVE DETERMINATION EXISTS** (`U-1`…`U-5` open)

Twelve sources were read this pass (the full table with per-source findings is in the consolidated request §2). The load-bearing results:

| Field | Result |
|---|---|
| `U-1` Reports tenant value | **UNSPECIFIED** — no record anywhere contains one |
| `U-2` Reports owner value | **UNSPECIFIED** — same |
| `U-3` express F-3-reuse direction | **NOT STATED** — and `REG-11` Option C §2(2) makes silence non-approval |
| `U-4` fifteen `D-2` §8 elements | **NOT SUPPLIED as a Reports contract.** The 2026-10-13 Reports element matrix remains 8 unresolved / 2 partial / 2 structural-or-negative / 3 established-against-the-*Option-A*-shape. The only complete fifteen-element contract located in the corpus is the **Portfolios/G24** one (`GATE_C_S5A…`) — a template, not a Reports determination. The effective `R3` act advances elements **14** and **15** (persistence surface); it supplies nothing for 2, 4, 5, 6, 7, 8, 9, 11, 13 |
| `U-5` value-act property set | **CANNOT EXIST** without `U-1`/`U-2`; the carrier's canonical bytes and digest are a function of the values |
| Qualified historical tip | **re-fetched this pass** (`6a8afbb2…`, objects only). Its NP-06 governance doc keys ownership on the **authenticated** principal, records Reports implementation authority as **WITHHELD**, and contains **no** candidate identifier |
| IPD `CAP03-P02` strings | Recorded as **IPD-locus** values for the IPD application; they expressly reject the IRR F-3 pair and create **no** IRR↔IPD equivalence. They are a *candidate the PA could designate* (request §4 `V-3`), not an existing determination for Reports |

**Result: `R1` remains SELECTED — NOT EFFECTIVE / NOT ESTABLISHED.** No value, carrier, digest, or element determination was invented; the F-3 pair was not aliased; no supersession of `REG-11` Option C or of NP-06 `R2`/`C4` was effected.

## 4. `R2` — preserved as blocked (closeout category: **blocked by a specific missing authority decision**)

After the `R1` investigation, `R2`'s prerequisites are unchanged and now precisely enumerable: (1) an *effective* `R1`; (2) `C-3` authorization predicate — **no selection exists anywhere**; (3) `C-7` audit disposition — **no selection exists anywhere**. `C-2` (`401` retired; owner-resolution failure → `503`) and `C-4` (all client-supplied tenant/identity claims → `400`) remain **prepared only**. No security-sensitive transport behaviour was written, and the historical authenticated transport remains unrestorable without reversing the program-wide no-auth decision.

The two unselected fields are consolidated into the same request as `U-1`…`U-5` so one PA act can discharge both gates, with the sequencing preserved: `R2` becomes effective only after `R1`, and only if the act states the §5.4 rows 1–3 replacements.

## 5. Implementation preserved and re-verified (closeout category: **completed; independently re-executed this pass**)

Nothing in the admitted persistence surface was altered. Re-executed on the current tree:

| Command | Result |
|---|---|
| `npx vitest run` on `reports-persistence-integration` + `reports-canonical` + `reports-artifact` + `reports-transport` + `reports-api` | **111 passed / 0 failed** (integration 5, canonical 46, artifact 56, fence 2, composed-route 2) |
| `npx vitest run server/reports-restart.test.ts` (genuinely separate OS processes) | **5 passed / 0 failed** |
| `npm run test:ci` + `node .ci/assert-tests.js .vitest-report.json` | **102 files / 1,309 passed / 0 failed**; guard **OK** |
| `npm run typecheck` | **exit 0** |
| `npm run typecheck:replay-server` | **exit 0** |
| direct `tsc --noEmit --strict` on `persistence-port.ts`, `persistence.ts`, `np04-adapter.ts`, `index.ts`, `reports-restart-harness.ts` | **exit 0** |
| `npm run build` | **exit 0** — 138 modules; `dist/assets/index-Bh4vcGJI.js` 1,590.96 kB / gzip 222.05 kB (unchanged; server modules are not in the client bundle) |

The five-operation persistence contract is exercised against the **real** `GovernedArtifactStore` from `iips-np04-governed-persistence/persistence` with **test-only** owner pairs (`test-tenant-r3` / `test-owner-r3`, `test-owner-foreign`) — binding minting, head-only single-parent supersession, cross-owner non-disclosure, fail-closed resolver with no `IIPS_NP04_DATABASE_PATH`, and close/reopen re-read on a fresh handle.

**Not claimed.** Close/reopen durability is **persistence-level** evidence. It is **not** `F-7`. `F-7` requires a separate-process **HTTP** restart against an effective `R1` owner source and a rendered `R2` contract, plus its positive/negative ownership-boundary legs. Persistence-level durability cannot discharge it and is not presented as doing so.

## 6. One evidence-accuracy correction (closeout category: **completed, not yet independently verified**)

The committed F-7 harness emitted `prerequisites: { R1: 'not-established', R3: 'not-admitted' }` and `durableLeg: 'blocked-R1-R3'` for its reserved durable-read op. That became **stale** when the `R3` act took effect (PR #258) and the binding was integrated (PR #259). A prerequisite label that reports an admitted prerequisite as outstanding is an integrity defect in evidence, even when it errs in the safe direction.

| Path | Before | After |
|---|---|---|
| `frontend/server/reports-restart-harness.ts` | `eb70dc27…` (new) | emits `prerequisites: { R1: 'not-established', R2: 'not-rendered', R3: 'admitted' }`; `durableLeg` for the reserved durable-read op → `'blocked-R1-R2'`; header corrected and the correction itself recorded in the file |
| `frontend/server/reports-restart.test.ts` | `8aa5d84e…` (new) | asserts the corrected object |

**What did not change:** `f7Satisfied: false` is still asserted; `durable-leg` is still `'not-executed'`; the fence dispatch is untouched (blob `98147054…` unchanged); no store is opened and no owner is supplied by the harness; the suite total stays **5**. The change is a label correction, not a gate result, and it grants no authority.

## 7. What was published in this pass (closeout category: **prepared but not effective**)

| Path | Nature |
|---|---|
| `docs/integration/IIPS_v3.0_REPORTS_NP06_R1_FIELD_COMPLETION_PA_DECISION_REQUEST_2026-10-25.md` | **PROPOSED — NOT APPROVED.** The consolidated seven-field request: `U-1`…`U-5` plus `C-3`/`C-7`, with bounded options, exact blanks, and the shape of the single act that would close it. Fills nothing |
| `docs/integration/IIPS_v3.0_REPORTS_NP06_RESUMPTION_PASS2_EXECUTION_RECORD_2026-10-25.md` | This closeout report |
| `evidence/integration/np06-reports-resumption-pass2-2026-10-25/**` | Raw validation output, blob digests, manifest, reproduction script |
| Tracker §16.111 + a dated annotation on §2 `REG-11` + header row | Additive registration. The annotation records that `R3` is rendered, effective and integrated, and leaves `R1`/`R2` exactly as stated |

None of these is a decision, a value act, an admission, or an authority instrument. Publication confers durability only.

## 8. Downstream sequence — where it actually stands

| Step | Status | Blocking prerequisite |
|---|---|---|
| `R1` ownership source | **SELECTED — NOT EFFECTIVE** | `U-1`…`U-5` (§3) |
| `R2` contract shape | **NOT RENDERED** | effective `R1` + `C-3` + `C-7` |
| `F-7` separate-process durable HTTP acceptance | **NOT SATISFIED** | `R1` + `R2` + a transport that exists to restart |
| Capability acceptance | **NOT ACCEPTED** | `F-7` |
| Separate `CV-51` acceptance act | **BLOCKED** | `F-7` + acceptance + its own act |
| Production admission | **NOT ASSESSED — not presumed** | all of the above, in order |

## 9. Remaining blockers, by class

**Blocked by a specific missing authority decision**

1. `U-1` (Reports tenant value) and `U-2` (Reports owner value), or `U-3` (express F-3-reuse direction) — no value exists in any authoritative record.
2. `U-4` — thirteen of the fifteen `D-2` §8 elements for Reports; eight remain unresolved exactly as the 2026-10-13 matrix recorded.
3. `U-5` — the value-act property set, including the carrier mechanism and its recording location.
4. `C-3` — the authorization predicate replacing the `viewer/analyst/admin` role gate.
5. `C-7` — the audit disposition (named replacement sink or express deferral).
6. After those: `F-7`, capability acceptance, `CV-51`, and production admission each require their own act.

**Blocked by a concrete technical or integrity issue**

- None new. Two standing risks are preserved, not introduced: (i) `2e11fa3b…` is a divergent lineage (`26` ahead / `210` behind IPD `main`) that receives no `main`-line fixes, accepted expressly by the effective `R3` act with `R3-Option C` recorded as the convergence target; (ii) no Reports HTTP transport can exist until `R2`, so `F-7`'s durable leg has nothing to exercise.
- The stale-label defect found in §6 is corrected.

## 10. Explicit non-claims

- The HTTP `503` fence (blob `981470541812a64c733309f1debec75455d85bee`) is preserved and remains the **only** Reports HTTP behaviour. No route, navigation entry, API client, or UI was added; `/reports` is not mounted.
- `D115`/`CV-43` was **not** wired; the census of non-test importers remains **0**.
- No pin was changed, no export map was edited, no IPD object was written, no Gate 3 artifact was touched, `CV-23` was not reopened.
- No owner, tenant, principal, membership, or security identifier was created or inferred; `OwnerContext` was not equated with `AuthenticatedOwner`; the F-3 values were not reused.
- Persistence-level close/reopen durability is **not** `F-7`. Separate-process fence evidence is **not** `F-7`. Green CI is **not** qualification, acceptance, or production readiness.
- Reports remains **not qualified, not accepted, not admitted, not production-ready**.

---

*Execution support: Arena Agent Mode — recording, verification, and publication support. No authority rendered. Program Authority: Ramki. **`R1` SELECTED — NOT EFFECTIVE; `R2` unbound; `F-7` NOT SATISFIED; `CV-51` BLOCKED; fence stands.***
