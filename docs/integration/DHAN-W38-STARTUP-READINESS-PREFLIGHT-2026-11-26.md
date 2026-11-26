# DHAN W-38 — Startup Readiness Preflight (IRR, 2026-11-26)

## 1. Status

**W-38 implementation and targeted/synthetic verification: COMPLETE.**
**Owner-operated E4 acceptance: NOT PERFORMED** — no live daemon, Windows host or credential material was used in this sandbox. The preflight is proven against IPD's own validated client and a synthetic loopback diagnostics response; the owner's one-command dry-run on the configured machine remains the operational acceptance.

| Milestone | Status |
|---|---|
| Implementation | **COMPLETE** |
| Local verification | **COMPLETE** — re-verified on the final branch head before publication (see §6). |
| Published to GitHub | **COMPLETE** — branch `arena/8f80ee85-iips-review-recovered`, implementation commit `40135a4f3047cecbc11fd335a058170c993f55f6`, CI-visibility commit `00ec13c5f0bdfaf899b8545eea6f1f13130da223`, PR [#653](https://github.com/ramkivs/iips-review-recovered/pull/653). |
| Merged into IRR `main` | **COMPLETE** — merge commit `961e1f80538941924106ff396c3fd0c883b00577`, merged 2026-11-26T05:38:30Z; W-38 files confirmed present on `main` through the GitHub contents API. |
| Operational acceptance | **PENDING** — W-36 E3 five-service Windows evidence and the W-38 owner dry-run. A successful merge establishes publication only, not operational acceptance. |

## 2. Authority and prerequisites

- Authoritative roadmap: `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` §7.2, W-38. This record is additive and does not rewrite the historical roadmap.
- W-09 and W-11 are satisfied for this scope: the pinned package publishes the validated `MarketDataTransportClient.diagnostics()` operation, and IRR resolves the documented loopback transport settings through `resolveIpdMarketDataTransportConfig`.
- **W-36 verification (required by this task):** the launcher-startable daemon prerequisite is **established at code level** on public IPD `main@6fa282bae9d996d7d85d22eef7a35e7bc41887b9`:
  - `windows-setup/03-Start-IipsServers.ps1` accepts `-StartMarketDataDaemon` and `-MarketDataPort` (default 8791), refuses a port already held by another process, starts `dist/src/providers/dhan/dhan_local_daemon.js` through the existing `Start-IipsService` helper, waits for the daemon's own bind line and authenticated `GET /v1/health`, asserts the listening PID equals the started PID, and records `marketDataPort` in the run manifest.
  - `windows-setup/06-Stop-IipsServers.ps1` includes port 8791 and `dhan_local_daemon.js`, so stop matches start.
  - The implementation landed in IPD commit `97850ea9db4f1bb1bdf6ca3cd0c18b83788307a9` (“give 03 ownership of the market-data daemon”), with IPD suite 2,119 executed / 2,115 passed / 0 failed / 4 skipped and PowerShell validator 342 pass / 0 fail as reported in that commit. IPD's `DHAN-W11-IPD-DAEMON-CONFIGURATION-AND-OPERATIONS.md` §6.4 records the ownership gap and its resolution.
  - **Evidence boundary:** that commit explicitly performed no live request, service start/stop/restart or host change. The E3 five-service Windows start → verify → stop → restart transcript required by roadmap W-36 is **not** in IRR-held evidence. W-38's implementation does not depend on that transcript; the owner dry-run does.

## 3. Implementation

| Path | Role |
|---|---|
| `frontend/server/market-data/dhanStartupPreflight.ts` | Seven checks, one authenticated diagnostics read, fixed-text report. |
| `frontend/server/market-data/dhanStartupPreflightCli.ts` | Operator entrypoint; exit 0 only when all checks PASS. |
| `frontend/server/market-data/dhanStartupPreflight.test.ts` | Success, disclosure and nine deliberately broken/malformed configurations. |
| `frontend/package.json` | `npm run w38:preflight` command. |
| `frontend/tsconfig.replay-server.json` | Strict typecheck closure for the new modules. |
| `frontend/server/market-data/quoteConsumptionBoundary.test.ts` | Closed caller allowlist extended with the diagnostics-only preflight module. |
| `docs/OPERATOR_RUNBOOK.md` | Command usage and interpretation. |
| this record + authoritative roadmap | Completion evidence and status. |

The preflight performs **exactly one** `GET /v1/diagnostics` through IPD's own `MarketDataTransportClient`. It adds no second client, no vendor request, no provider credential read and no verification probe. All reported provider facts are IPD's governed enumerations/counts; downstream checks that cannot be evaluated after a failed prerequisite are reported `CONFIG-MISSING` rather than guessed.

### Check semantics

| Check | PASS | FAIL | CONFIG-MISSING |
|---|---|---|---|
| `transport-config` | settings present, loopback HTTP and token hygiene accepted | malformed or non-loopback address | token/address absent |
| `daemon-reachable` | loopback daemon answered the diagnostics read | connection refused or timed out | transport unusable |
| `token-auth` | daemon accepted the bearer credential | IPD code `UNAUTHENTICATED` (HTTP 401) | no accepted/authenticated answer |
| `backend-active-ready` | IPD `service: UP` | IPD `service: DOWN` | no usable payload |
| `instrument-mappings` | `qualifiedMappingsLoaded > 0` | count is zero | count absent |
| `provider-state` | `CONFIGURED` / `CREDENTIALS_RESOLVED` / `AUTHENTICATED` / `OPERATIONAL` | `EXPIRED` / `DEGRADED` / `UNAVAILABLE` | `UNCONFIGURED` |
| `token-expiry` | `CREDENTIALS_RESOLVED` | `CREDENTIALS_EXPIRED`, `EXPIRED` or production refusal | unconfigured/incomplete/unavailable/not-resolved |

D-7's diagnostics wire does not publish a numeric seconds-to-expiry value. W-38 therefore reports expiry *proximity* only from the governed resolution outcome and provider state; it does not invent a countdown or read a carrier. This limit is stated in the report and in the module contract.

### Disclosure

The report renders only fixed sentences and governed enumerations/counts. It never renders the transport credential, a Dhan credential, a URL, a filesystem/carrier path, a vault-scheme reference, a raw provider message or an exception string. A source-level guard rejects vault-scheme strings in non-test server modules; the report test asserts the serialized output contains none of these classes.

## 4. Command usage

From `frontend/`, with the server-side transport settings present in the process environment or a local env file:

```sh
npm run w38:preflight
```

Output is seven `PASS` / `FAIL` / `CONFIG-MISSING` lines plus `RESULT READY` or `RESULT NOT_READY`. Exit status 0 means all seven checks passed; any other status means the owner must read the precise failing line. The command is observation-only: no refresh, quote, historical request or verification probe is issued.

## 5. Test evidence

`server/market-data/dhanStartupPreflight.test.ts`: **11/11 passed**.

- Successful readiness: seven distinct PASS checks, `RESULT READY`, exactly one `/v1/diagnostics` request and zero other calls.
- Disclosure assertion: serialized report contains no synthetic token, bearer string, vault-scheme reference, Windows/POSIX path, URL or raw rejection message.
- Broken configurations (each naming the precise failing check):
  1. missing transport credential → `CONFIG-MISSING` everywhere, zero requests;
  2. non-loopback daemon address → transport `FAIL`, zero requests;
  3. unreachable daemon → reachability `FAIL`, authentication `CONFIG-MISSING`;
  4. rejected transport token → authentication `FAIL` with HTTP 401, downstream `CONFIG-MISSING`;
  5. backend `DOWN` → backend `FAIL` only;
  6. zero qualified mappings → mapping check `FAIL` only;
  7. expired token outcome → expiry `FAIL` only;
  8. unusable provider state → provider-state `FAIL` only;
  9. malformed diagnostics payload → daemon answered / token accepted, downstream `CONFIG-MISSING` (fail-closed validator diagnostic).

CLI smoke runs: with no configuration, exit 1 and seven `CONFIG-MISSING` lines; with a synthetic loopback daemon serving a valid diagnostics payload, exit 0 and seven `PASS` lines with `RESULT READY`. Neither output contained a credential, path or vault-scheme reference.

## 6. Verification gates

- `npm run typecheck:replay-server` — PASS (new modules included in the strict closure).
- `npm run typecheck:portfolio-capture` — PASS.
- Focused architectural guards: `quoteConsumptionBoundary.test.ts` 41/41 PASS; `dhanNoDhanEnv.test.ts` 7/7 PASS.
- `npm run build` (broker-import + `tsc -b` + Vite + browser-bundle gate) — PASS.
- `npm run test:browser-bundle` — 3/3 PASS.
- Full `npx vitest run` — **247 files passed, 1 skipped; 3,638 tests passed, 1 skipped**.
- Two initially failing architectural guards were corrected runs: the new module's comment no longer contains a literal vault-scheme string, and the closed transport-composition caller allowlist now names the diagnostics-only preflight module.

## 7. Final W-38 position

IRR W-38 is implemented, safe by construction, and green under the full local suite, strict typechecks, production build and disclosure/guard tests. The roadmap W-38 row is updated with this evidence. Operational acceptance (E4 owner dry-run on the configured Windows machine, including a live daemon and the W-36 five-service evidence) remains outstanding and is explicitly not claimed by this record.

## 8. Publication and merge record

- Branch: `arena/8f80ee85-iips-review-recovered` (the W-38 publication branch; the repository's session branch name is fixed).
- Commits: `40135a4f3047cecbc11fd335a058170c993f55f6` (W-38 implementation, CLI, tests, script/typecheck/allowlist/runbook/roadmap/evidence) and `00ec13c5f0bdfaf899b8545eea6f1f13130da223` (CI token-verification fix).
- PR: [#653](https://github.com/ramkivs/iips-review-recovered/pull/653), base `main`, merged 2026-11-26T05:38:30Z as merge commit `961e1f80538941924106ff396c3fd0c883b00577`.
- Initial PR checks failed at the CI step that asserted IPD was private; IPD is now public. Both workflows were changed to verify that the scoped token can read the repository without asserting a particular visibility, while still requiring a successful authenticated `gh api` call. Re-run results: `Typecheck · Test · Build` PASS (3m52s), `Windows runner · SQLite lifecycle · local IPC · child-process restart` PASS (3m18s), `Python compile · source/evidence/tracker validation` PASS (39s). No W-38 test or build step failed.
- Post-merge runs on `961e1f80538941924106ff396c3fd0c883b00577`: CI run `45762924238` PASS; CAP-03 static checks run `45762924237` PASS; Windows compatibility run `45762924428` PASS. Merge state was `CLEAN`/`MERGEABLE` with all required checks green.
- Presence on `main` verified through the GitHub contents API for the new evidence document and the three new W-38 modules; `frontend/package.json` on `main` contains the `w38:preflight` script.
- Next roadmap step: W-36 E3 / W-38 owner dry-run, then W-37 after W-38 acceptance.
