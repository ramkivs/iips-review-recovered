# One-pass execution record — PKG-01 / PKG-09

**Record type:** execution evidence; not a matrix/tracker disposition or production/Windows/browser acceptance.
**Date:** 2026-10-18 (Asia/Calcutta).
**Authoritative IRR main at start:** `9be364b11631291a8602e07fcbdd0c7a9cc6ed06` (`origin/main` matched).
**Working branch:** `arena/d8d34903-iips-review-recovered`, initially at the same commit.
**Authoritative IPD main checked:** `467eb529f52820032b17ea0212c92362a96dfe18` (`origin/main` matched).
**Canonical matrix limitation:** the requested `/IIPS/IRR_Arena_Section_18_1_Full_Capability_Matrix_51_Rows.xlsx` is absent at `/IIPS` and `/home/user`, and no `.xlsx` file exists in the IRR `main` tree. Thus the supplied baseline counts were not verified against that workbook; no canonical matrix/tracker edit is made.

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

**Clean-clone source:** cloned `https://github.com/ramkivs/iips-review-recovered.git` at current `main`, commit `9be364b11631291a8602e07fcbdd0c7a9cc6ed06`; clone was clean. Runtime: Node `v22.22.3`, npm `10.9.8`. A fresh `npm ci` passed when using the documented `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` setting.

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

This record reports evidence only. It does not edit the canonical matrix or authoritative tracker and grants no qualification/admission/production authority. The initial baseline `24/9/13/5/0` remains Arena-reported; the canonical workbook needed to verify it was not found in the accessible filesystem or IRR main tree.
