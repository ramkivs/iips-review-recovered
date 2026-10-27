# Live HTTP probe — composed IRR transport at `main@f74af6d4` (`2026-10-27`)

Server: `npx tsx server/executive-transport.ts` (runbook §2 start path) → `listening on 127.0.0.1:8787`.
Every row was executed in this pass with `curl`; the raw capture is `/tmp/probe-results.txt` in the
investigation sandbox (not published — the table below is the record).

| # | Request | Status | Body highlight | Matrix rows |
|---|---|---|---|---|
| 1 | `GET /api/health` | `200` | `{"status":"ok"}` | — |
| 2 | `GET /api/executive` | `200` | `portfolioId PF-REAL`, 13 holdings | 1 |
| 3 | `GET /api/portfolio` | `200` | `PF-REAL`, 13 holdings | 2 |
| 4 | `GET /api/company/banking` | `200` | `Banking-H1`, recommendation `Watch`, conviction `47.1` | 3 |
| 5 | `GET /api/sector/banking` | `404` | `not found` — no such endpoint by design | 4 |
| 6 | `GET /api/cross-sector` | `200` | `avgConviction 72.9` | 5 |
| 7 | `GET /api/engines` | `200` | 13 engines | 6 |
| 8 | `POST /api/engines/sector.banking/execute` | `200` | `status COMPLETED`, snapshot `SNAP_00034F55` | 6 |
| 9 | `POST /api/screener` (governed definition) | `200` | `memberCount 13`, `evaluatorId NP12-SCREEN-EVALUATOR`, population identity `4c781cf0…` | 7, 41 |
| 10 | `POST /api/screener` `{}` | `400` | `missing-definition` | 7 |
| 11 | `POST /api/screener` (coerced identifier) | `422` | `INVALID_IDENTIFIER` | 7 |
| 12 | `GET /api/evidence/banking` | `200` | `referenceOnly: true` | 13 |
| 13 | `GET /api/evidence` | `404` | route absent by design | 13, 14 |
| 14 | `GET /api/replay/banking` | `200` | `original: null`, `NOT_PERFORMED`, reason `SECTOR_REFERENCE_NOT_CAPTURE` | 15 |
| 15 | `GET /api/decision-matrix` | `200` | scatter payload; **no** quadrant/band classification | 17 |
| 16 | `GET /api/ai-advisory/banking` | `200` | `nonAuthoritative: true`, `grounded: true` | 18 |
| 17 | `GET /api/macro/NAS?indicatorCode=1` | `502` | `RETRY_BUDGET_EXHAUSTED` after 4 attempts (no MoSPI egress) | 19 |
| 18 | `GET /api/pit/market-data` `ISIN:INE467B01029:EQ` / `D01_QUOTES` / `asOf 2026-02-10T00:00:00.000Z` | `200` | `found: true`, `resolvedAsOf 2026-01-05T15:30:00.000Z`, full provenance, `isinAuthority NON_AUTHORITATIVE` | 20 |
| 19 | `GET /api/pit/market-data` `…:BL` / same `asOf` | `200` | `found: true` — a **distinct** series for the same ISIN | 20 |
| 20 | `GET /api/pit/market-data` (bad identity / `domain=fundamentals` / date-only `asOf`) | `404` | `INVALID_IDENTITY` / `INVALID_DOMAIN` / `INVALID_ASOF` | 20 |
| 21 | `GET /api/user-portfolios` | `503` | `owner-context-unavailable` | 9, 30 |
| 22 | `GET /api/user-portfolios/import`, `/api/user-portfolios/:id` | `503` | `owner-context-unavailable` | 30 |
| 23 | `GET /api/watchlists` | `503` | `owner-context-unavailable` | 9 |
| 24 | `GET /api/settings` | `503` | `owner-context-unavailable` | 11 |
| 25 | `GET /api/collaboration` | `503` | `owner-context-unavailable` | 10 |
| 26 | `GET /api/reports/context` | `503` | `owner-context-unavailable` | 34, 35, 37 |
| 27 | `POST /api/reports/artifacts` | `503` | `owner-context-unavailable` | 35, 37 |
| 28 | `GET /api/reports`, `/api/reports/summary` | `404` | no unfenced sub-route exists | 34, 37 |
| 29 | `GET /api/broker-import` | `404` | route absent by design | 28 |
| 30 | `GET /api/not-a-route` | `404` | `not found` | — |

## How to read this table

- A `503 owner-context-unavailable` is **correct fail-closed wiring** for the current scope and is recorded
  as such. It is *also* the reason rows 9/10/11/30/35/37 cannot be exercised end-to-end over HTTP in this
  environment: their persistence and recovery evidence comes from the executed separate-process suites,
  which drive the real services (restart block, 15/15).
- A `404` on `/api/sector/*`, `/api/reports`, `/api/broker-import` is **by design**: those capabilities are
  composed client-side from governed routes, or are fenced at the sub-route level, or belong to IPD.
- The `502` on `/api/macro/NAS` is the documented no-egress refusal, not a defect (O-08).
- No authentication surface exists on `main` (verified by tree scan), which is product scope, not a gap.
