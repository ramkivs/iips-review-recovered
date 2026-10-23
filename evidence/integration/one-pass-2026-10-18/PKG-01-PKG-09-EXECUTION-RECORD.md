# One-pass execution record — PKG-01 / PKG-09

**Record type:** execution evidence; not a matrix/tracker disposition or production/Windows/browser acceptance.
**Date:** 2026-10-18 (Asia/Calcutta).
**Original pre-merge baseline at the start of this execution record:** IRR `main@9be364b11631291a8602e07fcbdd0c7a9cc6ed06` (`origin/main` matched at that time); original working branch `arena/d8d34903-iips-review-recovered` began at the same commit. The post-merge, exact-main reconciliation is recorded below.
**IPD main at the original packet check:** `467eb529f52820032b17ea0212c92362a96dfe18` (`origin/main` matched at that time). Current IPD `main` was rechecked read-only at `9130c259ee753bad63611b256f67a470f715e37f`; the four commits after `467eb52` are documentation-only PR #10/#11 changes, and the current portfolio/D05 code state is unchanged.
**Canonical matrix limitation:** the requested `/IIPS/IRR_Arena_Section_18_1_Full_Capability_Matrix_51_Rows.xlsx` is absent from the accessible IRR `main` tree; the supplied baseline counts were not verified against that workbook. The follow-up below updates only supported CV-register statuses and specific Markdown evidence cells; it does not treat that Markdown matrix as a substitute for the workbook or assert its aggregate baseline.

## PKG-01 — route evidence, rows 6 and 18

### Row 6 — Engine registry + engine execution surface

**Starting evidence:** existing `frontend/server/engine-transport.test.ts` made HTTP requests to a minimal test server around `EngineApiAdapter`; matrix E2E `VP` said the composed `POST /api/engines/:id/execute` had not been exercised live.

**Change:** added `frontend/server/live/engine-execution-live-certification.test.ts`. It imports the real exported `server` from `executive-transport.js`, binds an ephemeral port, and exercises the composed route table over HTTP. Six cases cover the 13-engine frozen registry, a valid certified `POST`, provenance/output shape, identical-request determinism, path/body mismatch, uncertified engine refusal, and unsupported API version. It uses fixed fixtures; it makes no provider call, durable write, or production promotion.

### Row 18 — AI advisory over certified results

**Starting evidence:** the existing `frontend/server/live/ai-advisory-live-certification.test.ts` already imports the real composed `executive-transport` server; its three HTTP cases cover the governed non-authoritative DTO, anonymous/invalid-authorization equivalence, and unknown-result 404. The implementation is deterministic and in-process; it does not call an external AI provider.

**Reconciliation:** this is the correct composed HTTP boundary for the stated route contract. It was run at this head and passed. The earlier “not exercised in the V-sweep” evidence remains historically true; the new execution adds current route evidence. This does not establish broader product qualification, admission, browser acceptance, or production authority. No AI implementation or provider settings changed.

### Commands and results

Initial install attempt:

```sh
cd frontend && npm ci --no-audit --no-fund
```

Result: failed only on the sandbox's TLS-intercepting certificate (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` fetching the pinned GitHub dependency). The runbook documents the required CA setting. Retried exactly with that setting:

```sh
cd frontend && NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt npm ci --no-audit --no-fund
```

Result: PASS; 188 packages installed. No package manifest or lockfile changes.

Focused route run:

```sh
cd frontend && npx vitest run \
  server/live/engine-execution-live-certification.test.ts \
  server/live/ai-advisory-live-certification.test.ts \
  server/engine-transport.test.ts
```

Result: **3 files / 15 tests passed** (new composed engine route 6/6; existing composed AI advisory 3/3; adapter-level engine transport 6/6).

Full validation:

```sh
cd frontend && npm test -- --reporter=dot
cd frontend && npm run typecheck
cd frontend && npm run build
```

Results: **73 test files / 814 tests passed**; typecheck passed; production build passed (`tsc -b`, Vite 5.4.21). The suite emitted existing React Router future-flag and React `act(...)` warnings; they were non-failing and unrelated to these route changes.

## PKG-09 — operator reproducibility, row 47

**Original pre-merge clean-clone evidence:** cloned `https://github.com/ramkivs/iips-review-recovered.git` at `main`, commit `9be364b11631291a8602e07fcbdd0c7a9cc6ed06`; clone was clean. This was valid evidence for that commit only; the exact PR #132 merge verification is recorded below. Runtime: Node `v22.22.3`, npm `10.9.8`. A fresh `npm ci` passed when using the documented `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` setting.

The runbook's carrier command was followed with a temporary directory outside the clone. It wrote a 363-byte carrier with SHA-256 `d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4`, matching the pinned value. The documented `npm run server:dev` started on an isolated port. Direct API probes (not browser observations) returned:

| Probe | Result | Meaning |
|---|---:|---|
| `GET /api/health` | 200 | documented transport healthy |
| `GET /api/engines` | 200 | composed registry available |
| `GET /api/watchlists` with carrier | 200 | owner-context carrier resolved |
| `GET /api/user-portfolios` | 503 | correct owner-source/admission fence |
| `GET /api/reports/artifacts` | 503 | correct owner-context Reports fence |
| `GET /api/reports` | 404 | expected: this is not a route; the runbook identifies the specific valid artifact route as 503 |
| `GET /api/watchlists`, `/api/collaboration`, `/api/settings` without carrier | 503 | `owner-context-unavailable` for all three |

All probes were GET-only; no data files were produced in the temporary `IIPS_DATA_DIR`. An initial harness incorrectly expected bare `/api/reports` to return 503; inspection of the runbook and exact route table corrected the probe to `/api/reports/artifacts` (503), while `/api/reports` correctly remains 404. No application defect or route/fence change resulted.

**Limit:** this is clean-clone command/API reproduction by the Arena agent, not an independent human-reader study, Windows checkout, local browser acceptance, or Windows Gate C result. Those observations are not claimed. It is sufficient evidence that the published install, carrier, start, and API-probe instructions execute in this accessible Arena environment; any “uncoached human” usability claim remains unverified.

## Publication boundary

This record reports execution evidence only and grants no qualification/admission/production authority. At the original packet stage it made no canonical-matrix or tracker edit. The later scoped CV-register and Markdown-evidence reconciliation is separate and is recorded in the authoritative tracker at §16.49. The initial baseline `24/9/13/5/0` remains Arena-reported; the canonical workbook needed to verify it was not found in the accessible filesystem or IRR main tree.

## Post-merge reconciliation — PR #132 and PKG-09 exact-main run (2026-10-18 UTC)

### Authoritative refs and CI

- GitHub reports PR #132 `MERGED` at `e9bb64c2e5aa5c888b689f6e40fc5ae3875ccab6`; remote `refs/heads/main` matched that SHA at verification. The merge has first parent `9be364b11631291a8602e07fcbdd0c7a9cc6ed06` and second parent PR head `c8fe209ec691dd3673ba9fbd14fb2dd7fba70ec3`. The PR-head and merge trees are identical (`4bfa34f5f53a243bc63c75b1ab624875423a6bf2`), so the PR-head execution record applies to the merge tree.
- PR CI run `39129320262` at `c8fe209…` and post-merge `main` CI run `39129422038` at `e9bb64c…` both completed successfully. The run metadata shows successful Typecheck, full Vitest, non-zero-test guard, and Production build steps. PR #132's published evidence/description reports the focused run as 3 files / 15 tests and the full run as 73 files / 814 tests; these counts are retained as recorded evidence, not inferred from the green badge alone.
- The packet index exists on this merged tree at `docs/integration/2026-10-18/BASELINE-AND-DECISION-PACKET-INDEX.md`. References to IRR `9be364b…` in the original packet records are pre-merge snapshots, not the present post-merge test target.

### PKG-01 — current composed-route evidence

The merged `frontend/server/live/engine-execution-live-certification.test.ts` imports the exported `server` from `executive-transport.js` and covers six composed HTTP cases. The existing `frontend/server/live/ai-advisory-live-certification.test.ts` covers three composed HTTP cases. PR #132's exact tree and full hosted CI passed; no app behavior or provider call was introduced by the test/evidence change. These establish local non-production route-contract evidence only; neither the route tests nor CI establish browser acceptance, product qualification, admission, release, or production eligibility.

### PKG-09 — exact merged-main reproduction

The previous 9be-only clean-clone transcript did not establish results at the merge commit. The targeted reproduction has now been executed on a fresh clone at exact `main@e9bb64c2e5aa5c888b689f6e40fc5ae3875ccab6`. The full commands, observed statuses/bodies, carrier byte length/SHA-256, server starts, and post-probe data-directory checks are recorded in `PKG-09-CLEAN-CLONE-TRANSCRIPT.md`.

**Disposition: PASS** for the scripted clean-clone/install/carrier/API/fence/integrity/no-data-creation procedure at the exact merge SHA. All calls were GET-only; the valid carrier returned `200` for health, engines, and watchlists, the expected owner-source fences remained `503`, bare `/api/reports` remained `404`, the no-carrier owner-scoped probes returned `503 owner-context-unavailable`, and no `IIPS_DATA_DIR` files were created. This does not satisfy broader WP-1 reader acceptance or Windows/browser Gate C.

**Transcript correction:** the prior transcript's `GET /api/engines` byte count (`4,725`) was not reproduced. At both `9be364b…` and `e9bb64c…`, the body was 4,731 bytes with the same SHA-256 and 13 engines; the PR #132 diff has no runtime or package-lock change. The earlier transcript retained no body hash, so the six-byte measurement variance is not further attributable. It is not a status/body-contract discrepancy.

### PKG-07 — scoped tracker reconciliation and retained boundaries

The CV register is reconciled only for evidence-backed items: `CV-25` (both IPD durable pin tags verified), `CV-35` (IPD fail-closed test runner merged under PR #9), and `CV-42` (IRR and IPD CI workflows present and green on their verified current `main` refs). `§19` is recalculated from those per-item rows; it is a CV work-item register count, not the unavailable 51×17 Excel capability baseline. The repository Markdown evidence cells are updated only for the affected rows. The requested Excel workbook remains absent, and the supplied `24/9/13/5/0` aggregate remains unverified.

IPD was inspected read-only. Its current `main` is `9130c259ee753bad63611b256f67a470f715e37f`; comparison with the packet-time `467eb529…` shows only the IPD path `evidence/cross-repository/IIPS_V3_IPD_IRR_PORTFOLIO_AND_CONSUMER_READINESS_RECONCILIATION_2026-10-18.md` changed in docs-only PRs #10/#11. The session-only portfolio store and D05 source code are unchanged. No IPD file or ref was modified.

No product decision was inferred. CV-20 still needs the Program Authority's ownership-source/qualification decision or dated deferral; CV-21, CV-22, and CV-32 retain their separate product dispositions; Macro qualification still lacks external entitlement/legal evidence and authority; PKG-08 rows 4/14/16 still need distinct retain/defer/commission outcomes. The `503` portfolio/Reports fences, non-authoritative PIT identity, Macro qualification/admission boundary, and production prohibition remain unchanged.
