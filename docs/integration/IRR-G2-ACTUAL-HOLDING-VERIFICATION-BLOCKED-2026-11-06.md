# IRR G-2 actual-holding verification — blocked by unavailable live source

**Date:** 2026-11-06

**Scope:** Read-only verification of persisted non-production G-2 portfolios and holdings through IRR's existing IPD IPC adapter; exact stored-identity mapping outcomes; transient quote consumption only for eligible actual holdings.

**Result:** **Not completed against actual records.** No current portfolio or holding rows were returned or inspected. Counts are **undetermined, not zero**. No quote request was made.

## 1. Executive result

The authoritative G-2 storage implementation is IPD's local SQLite store (`node:sqlite` / `DatabaseSync`). IRR does not open that database. Its supported read path is IRR's existing `IpcUserPortfolioPort` over IPD's same-host IPC endpoint, using `portfolio.list`, followed by `portfolio.get` and `portfolio.revisions` only for IDs returned by the list operation.

That path was not available in this Arena Linux workspace: the IPD database-path setting, IPC endpoint, IRR binding precondition, and both IRR market-data transport settings were unset; no database file or local socket was found in the searched workspace/runtime locations; and no Node provider process was present. The historically documented Windows named pipe is host-local and is not mounted into this Linux workspace. Consequently, there was no safe way to reach the existing Windows store via IRR's adapter.

| Verification item | Arena-observed result |
|---|---|
| Current actual portfolio count | **Undetermined — no `portfolio.list` call reached IPD** |
| Current actual holding count | **Undetermined — no actual detail rows were read; not zero** |
| Actual holding-level dispositions | **None available — not evaluated**; no row can be called eligible, ineligible, unmapped, or unresolved from this run |
| Actual D114 identity mappings | **No per-holding results available**; no identity was inferred, backfilled, or changed |
| Actual quote requests / results | **0 requests**; transport configuration absent, and no actual eligible holdings were available to evaluate |
| Portfolio / holding / revision mutations | **None performed** |
| Database opened or provider started by this audit | **No** |

## 2. Authoritative source and read path

### IPD source inspected

The IPD source inspected read-only was commit `f2bb47dc50fc8f16ee8d3354f6f4e8bf995e4bbc` on `arena/aeea3efb-iips-production-market-data`. The remote `main` ref was `f9dac560b821476c417b963c83c80ad0e7747dc7` at verification time; no IPD branch, file, or database was changed. The P7 source extraction used for inspection is `/tmp/ipd-p7-audit`.

The P7 implementation identifies the store as local SQLite (`node:sqlite`) and requires an absolute `IIPS_G3_DATABASE_PATH` for the provider. Startup proceeds through validation, database connection, migration application, audit-chain verification, and IPC bind. The endpoint is a same-host IPC target, not an HTTP/database URL. Startup was deliberately **not** invoked: the sandbox had no verified existing database path, `openDatabase` can create a missing SQLite file, and startup applies the fixed migrations.

### IRR consumer path

The existing IRR route in `frontend/server/user-portfolio-transport.ts` composes `IpcUserPortfolioPort` and uses the local IPC client. It does not open SQLite or fall back to a network host. Required server-owned configuration is:

- IPD provider: `IIPS_G3_DATABASE_PATH` set to the operator-verified, already-existing non-production SQLite file; `IIPS_G2_IPC_ENDPOINT` set to the local endpoint.
- IRR consumer: the **same** `IIPS_G2_IPC_ENDPOINT` and affirmative `IIPS_G3_IPC_BINDING_PROVISIONED=true` only after the IPD binding has been independently confirmed. That flag is a fail-closed local precondition, not evidence that a binding exists.
- If using a bare endpoint name instead of an absolute local endpoint, the implementation additionally requires absolute `IIPS_G3_LOCAL_STATE_DIR`.

For the Windows deployment documented by the operator, the historical designated path is `C:\iips-data\iips\user-portfolio.sqlite` and the named pipe is `\\.\pipe\iips-user-portfolio-v1`. These are cited as **previously documented operator configuration**, not as a file or endpoint observed by Arena today. The existing operator record explicitly says not to reprovision; this audit did not do so.

## 3. Access checks and exact blockers

Only environment-variable **presence** was checked; no values or credentials were printed.

| Setting / check | Result in this workspace |
|---|---|
| `IIPS_G3_DATABASE_PATH` | Unset |
| `IIPS_G2_IPC_ENDPOINT` | Unset |
| `IIPS_G3_LOCAL_STATE_DIR` | Unset |
| `IIPS_G3_IPC_BINDING_PROVISIONED` | Unset |
| `IIPS_G2_IPC_TENANT_HINT` | Unset (optional; not required by this IRR route) |
| `IIPS_MARKET_DATA_TRANSPORT_URL` | Unset |
| `IIPS_MARKET_DATA_TRANSPORT_TOKEN` | Unset; value was neither requested nor exposed |
| IPD Node provider process | None observed by `ps -C node` in this workspace |
| Local IPC sockets | None found in searched `/tmp` and `/run/user` locations |
| SQLite files | None found in the repository, searched `/home/user` locations, IPD source extraction, or mounted `/mnt` roots; the Windows path is not mounted here |
| Environment loading | The inspected IRR server and IPD IPC entrypoint consume `process.env`; no `dotenv`/`--env-file` loader was found in the relevant server source. No `.env` file was found in the bounded repository/home search. |

The endpoint and binding precondition being absent means the IRR route would fail closed before making an IPC request. No actual IPC request was attempted. The Windows named pipe described in the operator handoff is outside this Linux process's local IPC namespace; an IPD process on another host cannot be reached through this adapter's local-only endpoint resolution.

A prior Direct P1 consumption record (`docs/integration/IIPS_V3_DIRECT_P1_IRR_CONSUMPTION_RECORD_2026-11-01.md`, §2) contains **user-reported, not Arena-verified** provisioning evidence. It reports that at initial provisioning the Windows store had zero portfolios, revisions, holdings, and contributions. That is a historical report about the initial state, not a current read and not proof that the store still has zero records. It does not change this audit's current result: actual counts remain **unknown**.

## 4. Holding mappings, dispositions, and quotes

There were no actual holding rows to redact or classify. Accordingly, this report does not produce fabricated holding aliases, mapping outcomes, or eligibility results. The actual per-holding disposition list is **unavailable because the authoritative read did not occur**, not an empty list returned by IPD.

The reviewed contract keeps `security_identity` nullable. The additive D114 field represents the exact supplied canonical identity `ISIN:<isin>:<series>`; a stored `NULL` remains unresolved. This audit did not infer identities from symbols or descriptions, backfill rows, alter portfolios, holdings, quantities, cost basis, transactions, or revisions, or save any quote-derived value.

Quote verification was also blocked. IRR's market-data URL and token settings were both absent, and there were no actual holdings on which to establish eligibility. No market-data/Dhan request was attempted. No live connectivity, tradability, or quote consumption is claimed.

## 5. Synthetic evidence is not actual data

The IRR user-portfolio automated tests use synthetic IPC peers and test fixtures; they do not query the operator's SQLite store or Windows named pipe. In particular, the synthetic `p-1` portfolio and its zero-holding summary in `userPortfolioDirectP1Integration.test.ts` are test data only and were excluded from all actual-record counts in this report.

The P7 inspection also covered source/schema and the existing read contract, not a copy of the user's SQLite file. No fixture, migration test, documentation example, or synthetic peer response was used as evidence of persisted actual holdings.

## 6. Minimum safe prerequisites to finish the actual audit

1. **Use the already-existing non-production Windows store.** An authorized operator must confirm the current file at the previously documented path (or identify the actual existing path if it has changed). Do not create, replace, reprovision, copy, or migrate a guessed database. Do not treat the historical initial-zero report as a current count.
2. **Make the supported local IPC read path available on that host.** The IRR consumer must run in the same host/IPC namespace as the existing IPD provider. Confirm the provider is using the verified store and a compatible reviewed IPD build. Because IPD startup applies migrations, do not launch/restart it against the store until the operator has confirmed startup will not cause an unapproved database change; reusing an already-running provider is preferable.
3. **Set only server-owned runtime configuration.** Configure the same local `IIPS_G2_IPC_ENDPOINT` for IPD and IRR. Set IRR's `IIPS_G3_IPC_BINDING_PROVISIONED=true` only after confirming the active binding. Do not send owner/tenant claims from the browser or expose endpoint/credential values in this report.
4. **Run the IRR read sequence.** Call the existing IRR list route; record the count returned. Fetch detail and revisions only for IDs actually returned. Produce stable, redacted per-holding aliases with the stored D114 identity state and exact adapter mapping disposition. Keep provider-specific Dhan identifiers out of browser/report output.
5. **Verify quotes only if enabled and eligible.** Configure authorized non-production `IIPS_MARKET_DATA_TRANSPORT_URL` and `IIPS_MARKET_DATA_TRANSPORT_TOKEN` in the appropriate server runtime without sharing token values. Request quotes only for actual holdings that pass the existing identity/eligibility rules. Record response disposition without persisting quote-derived data.

Until those prerequisites are met, the actual G-2 holding audit remains blocked; no zero-count or mapping conclusion should be substituted.

## 7. IRR-only validation and changes

The source implementation was not altered. One stale assertion in `frontend/server/user-portfolio/userPortfolioDirectP1Integration.test.ts` still expected IPD commit `6004ff81dd1064c5b69b15fde1f3a6c4f44981a0`, while the IRR manifest and lockfile were already pinned to the reviewed P7 commit `f2bb47dc50fc8f16ee8d3354f6f4e8bf995e4bbc`. The IRR test assertion was aligned to the existing P7 pin; no IPD file or dependency pin was changed by this audit.

Validation completed in `frontend/`:

- `npm ci --ignore-scripts` succeeded with Node's system CA enabled; no lockfile change was made.
- Focused `server/user-portfolio` Vitest suite: **12 files, 180 tests passed**. Environment variables for the actual database, IPC endpoint, binding, and market-data transport were explicitly unset for this run. These tests validate IRR behavior against fixtures, not actual records.
- `tsc -p tsconfig.investment-server.json --noEmit`: passed.
- `git diff --check`: passed.
- No `npm audit fix` or dependency update was performed. `npm ci` reported 11 dependency advisories (6 moderate, 3 high, 2 critical); resolving them is outside this read-only data audit.

**Status remains BLOCKED for actual holdings and quotes** until the operator-host IPC prerequisites above are available. No production acceptance, deployment, or broader capability is implied.
