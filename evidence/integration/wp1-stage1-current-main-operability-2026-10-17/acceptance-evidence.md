# WP-1 / Stage 1 current-main operability — acceptance evidence

**Execution date:** 2026-10-17 (Asia/Calcutta)
**Disposition:** **NOT PASSED / INCOMPLETE.** Safe separable checks were run against the corrected documentation candidate. A genuinely independent, unassisted reader did not participate; reader acceptance is pending. This record does not claim that no oral guidance would have been needed.

## Tested candidate and reproducibility

- Repository: `ramkivs/iips-review-recovered`; branch `arena/504c6227-iips-review-recovered`.
- Tested documentation candidate: `99f1c1080f5073c91349173fae3469b044a6715f`, based on current `main` `bddadaa37ac9f826601ebc029434e4d1794f49fb`.
- Test was performed from a fresh `git clone --no-hardlinks` at the exact candidate SHA, not from the authoring worktree.
- Candidate file revisions: `docs/OPERATOR_RUNBOOK.md` blob `41152ecda1526dddb7254821c9ca93a907a4ab6e`; tracker blob at the tested candidate `8d8632bfde8587cd33ef63fceb2450ebb5f47bb5`.
- Additive post-validation tracker revision recording the clean-clone results: blob `52d07bedbb2081633d7f058a582bb912bc4aea71`.
- Tracker revision after the explicit user acceptance disposition and redacted disclosure: blob `130ba67a1a3ae8239ccbfb2983066ce1cde240f8`.
- The runbook remained unchanged from the tested candidate through PR #122 publication.
- Toolchain: Node `v22.22.3`; npm `10.9.8`.
- Package-lock pin used by the clean clone: `iips-production-market-data@1.0.0`, Git commit `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (`frontend/package-lock.json`).
- The existing governed owner-context carrier was materialized by the repository helper from existing authority act `IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01` (source blob `f90c9325f49d33f378f3fc0936c28f4979164b2e`), outside the clone; helper digest validation succeeded. No alternate identity was created. Carrier contents, identity values, and digest are deliberately omitted.

## Clean-clone validation

| Check | Result |
|---|---|
| `npm ci` | Passed after retrying the pinned Git dependency fetch with `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt`; the initial attempt failed TLS verification (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`). No package or pin was changed. npm reported 10 audit findings (6 moderate, 2 high, 2 critical); no audit fix was attempted. |
| `npm run typecheck` | Exit 0. |
| `npm run test` | Exit 0; 72 test files / 808 tests passed. The runbook still says 64 files / 705 tests “at current head”; this additional documentation discrepancy is outside the two authorized corrections and was not edited. |
| `npm run build` | Exit 0; Vite build succeeded (main JS chunk 272.97 kB, gzip 78.25 kB). The runbook’s approximate `~257 kB` note is not treated as a build failure and was not edited. |

## Route, reference-data, screener, and PIT probes

- Vite was ready on `0.0.0.0:5173`, API on `0.0.0.0:8787`; the UI shell, `/intelligence/opportunities`, `/intelligence/risks`, `/intelligence/rankings`, `/intelligence/decision-matrix`, and the Vite `/api/health` proxy returned HTTP `200`. The `/intelligence` parent remains group-only; it is not recorded as a built destination.
- With the valid governed carrier, `GET /api/health`, `/api/executive`, `/api/cross-sector`, `/api/portfolio`, `/api/decision-matrix`, `/api/company/Banking`, `/api/evidence/Banking`, `/api/replay/Banking`, `/api/engines`, `/api/watchlists`, `/api/collaboration`, and `/api/settings` returned `200`.
- Banking reference values matched the runbook: `companyId` `Banking-H1`, verdict `Watch`, composite `47.1`; evidence `ev_Banking`; snapshot `snap_Banking`. `/api/engines` listed 13 certified sector engines and no CSIP engine entry. Certified `sector.technology` execution returned `200`, `COMPLETED`, `IES-015`, deterministic provenance; syntactically valid uncertified `sector.unknown` returned `404 DENIED`. A non-sector `/api/company/EV-T` returned `404`.
- Screener conviction definition: HTTP `200`, matched `12/13`, `COMPLETED`, evaluator `NP12-SCREEN-EVALUATOR`; execution-ID prefix `4d0e128b` matched the runbook example. Client-supplied `members` was rejected with `422`.
- Exact runbook empty-predicate definition was POSTed twice: both returned `200`, `13/13`, and the same deterministic execution ID. Actual execution-ID prefix was `c865a116`, and definition-digest prefix `ac7b81f8`; the runbook currently gives `b76227aa` and `1ef5dd80` for that example. This reproducible-value discrepancy is recorded, not “fixed” by changing behavior or broadening the authorized documentation edits.
- Valid D01_QUOTES PIT query returned `200`, `found: true`, resolved as of `2026-02-10T15:30:00.000Z`, data version `v1.0.0-d114-historical`, lineage-hash prefix `3f30ac9858cf`, and the honest `NON_AUTHORITATIVE` identity label. Invalid identity, invalid domain (`INVALID_DOMAIN`), and impossible `asOf` (`INVALID_ASOF`) failed closed with `404`; PIT `POST` returned `405`. The non-production read was not used to enable writes.
- The exact external Macro live-read probe was not run: `api.mospi.gov.in` is outside the sandbox’s permitted outbound-host list. The non-provider unknown-dataset guard `/api/macro/wpi` returned `404`; no external request was attempted.

## Owner-context fail-closed behavior and protected fences

- With the existing governed carrier, watchlists, collaboration, and settings read surfaces returned `200`.
- With the carrier omitted, and separately with a non-regular invalid path (`/dev/null`), health/executive remained available while watchlists, collaboration, settings, user-portfolio surfaces, and Reports artifacts failed closed with HTTP `503`. The invalid-path probe created no carrier or identity.
- Under the valid carrier, user-portfolio `GET` and fenced `POST`, plus summary `GET`, returned `503 owner-context-unavailable`. Reports-artifact `GET` and fenced `POST` returned the same `503` fence. `GET`+`POST /api/reports` and `/api/reports/`, plus `GET`+`POST /api/reports/artifacts/`, retained `404` route behavior. No portfolio persistence or Reports artifact was attempted.

## Watchlist journal and restart

Using a fresh temporary `IIPS_DATA_DIR` outside the clone and the one governed carrier:

| Operation | HTTP / observation |
|---|---|
| Create `wl-runbook` | `201` |
| Add governed `Banking` member | `201` |
| Attempt ungoverned `RELIANCE` member | `404` |
| Journal after writes | 3 lines, 1,140 bytes (contents not emitted) |
| Full API transport stop/start, then read | `200`; `createdAt` unchanged |
| Repeated reads | `200`; journal stayed at 3 lines (reads appended nothing) |

The historical V8 creation `200` remains preserved as historical evidence. Current-baseline creation `201` remains the acceptance expectation; no route or behavior was changed.

## Acceptance boundaries and pending items

- The documentation corrections were tested at the candidate SHA above. The broader WP-1 pass criterion is **not met**: no independent reader participated; reader acceptance remains pending, and the runbook’s 64/705 test-count expectation and empty-screener ID/digest examples differ from this clean-clone run.
- No oral-guidance conclusion is asserted. Safe machine-run checks do not substitute for an independent reader.
- CV-30 and CV-31 remain `COMPLETE`; CV-41 retains its existing completed group-only navigation disposition. No CV status was reopened. The protected user-portfolio and Reports `503` fences remain intact.
- No product code, runtime behavior, or HTTP route implementation, package pin, safety fence, owner authority, IPD, or unrelated record was changed. No Gate C, IPD `npm test`, BP-01/broker-preview or broker-CSV flow, owner-portfolio persistence, P-4/P-6/P-8, Gate B integration, G24 promotion, NP-12 convergence, Operator Drop, or PR #114/#117 merge was performed.

## Subsequent user-directed disposition and redacted disclosure — 2026-10-17

By explicit user direction, the independent-reader criterion is treated as accepted for WP-1 disposition. This is not evidence of an actual reader session: no independent reader participated, and no observations or oral-guidance outcome are asserted. The original execution results and the test-count, screener-example, and bundle-size follow-ups above remain unchanged. Disposition: **ACCEPTED BY USER DIRECTION, WITH FOLLOW-UP ITEMS**.

**Redacted operational disclosure:** earlier runbook inspection and subsequent scope review produced multiple tool outputs containing excerpts of pre-existing text with carrier identity fields. No carrier values or digest were copied into this evidence record or PR body; none are reproduced here. The activity-log output cannot be retracted.
