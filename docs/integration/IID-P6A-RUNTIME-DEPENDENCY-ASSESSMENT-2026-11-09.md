# IID P6-A — Runtime Dependency Assessment and Enablement

**Date:** 2026-11-09
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Authoritative baseline:** `main` @ `16b916b4b058bdd43f49225b01d97f46b068830a`
**Environment:** Local / Single-User / Non-Production
**Verification host:** Arena Linux sandbox, Node `22.22.3`, platform `linux`
**Status:** **IRR-owned enablement COMPLETE; P6-A overall NOT COMPLETE** — external dependencies outstanding.

---

## 1. Scope and authority

Investigation, implementation, testing and publication inside IRR only. No IPD repository, schema, API or
persistence change. No production provisioning or acceptance. PRs #527, #528, #530 and #515 were inspected
and **not modified**; nothing was merged.

The unmerged IID implementation chain **#527 → #528 → #530** is *not* an ancestor of this branch. This
branch is cut from authoritative `main`, so it contains the merged IID work (through #529) but **not** the
WI-1/WI-2/WI-2A navigation and discovery changes. The runtime dependencies assessed here are shared by
both; the readiness diagnostic does not depend on the unmerged chain. Integration ordering is unchanged:
#527 → #528 → #530, with this PR independent of them.

## 2. Baseline verification (remote-observed)

| Ref | State | Head / SHA |
| --- | --- | --- |
| `main` | authoritative | `16b916b4b058bdd43f49225b01d97f46b068830a` |
| PR #527 | OPEN, non-draft, CLEAN | `38159d4e461ceb463e3af6444ef73cb1106bff97` |
| PR #528 | OPEN, non-draft, CLEAN | `baa84d3e4618b31b1e145049591ac79cea87e6de` |
| PR #530 | OPEN, non-draft, CLEAN | `40be8d12e86e93bfcac640e208883698259d5b20` |
| PR #529 | **MERGED** 2026-11-09T12:43:53Z | `b1a95132c2b30d3f10f8c99e9d411d0a9cb80866` |
| PR #515 | OPEN, **draft**, DIRTY | `008dfe67d740e91c1691a6512e16af26c9e00104` |

The previously reported `main` SHA was re-verified and is still current. #529 restored the Personal
Portfolio surface, added the `IIPS_LOCAL_PERSONAL_USE` write-path enablement to
`frontend/server/user-portfolio-transport.ts`, and extended `frontend/src/api/userPortfolios.ts`.
#515's `DIRTY` state is caused by #529 landing on `main` and overlapping `userPortfolios.ts`; its head SHA
is unchanged and it was not touched by this work item.

## 3. Dependency ownership matrix

Classification key: **(1)** IRR-owned operational · **(2)** IRR-owned not configured · **(3)** IPD-owned
operational · **(4)** IPD-owned unavailable · **(5)** user-host provisioning required · **(6)** not
applicable · **(7)** unknown, investigation required.

State is for **this verification host only**. An absent setting here is not evidence about the operator's
Windows machine.

| # | Dependency | Purpose | Current state (this host) | Required configuration / data | Repo owner | Execution owner | External dependency | Class | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Identity files (roster, listing map, corporate actions) | Issuer/holding identity for all three capabilities | Absent by default; **valid when the governed fixture set is installed** | `<IIPS_DATA_DIR>/investment/identity/{eligible-roster,listing-map,corporate-actions}.json` from the authoritative issuer source | IRR (loader) | **User host** | Authoritative issuer data | **5** (→1 when installed) | Loader executed: `IDENTITY_SOURCES_VALID`; HTTP coverage no longer reports identity failure |
| D2 | NP-04 assessment store | Assessment artifact chains + version history (IID-01, IID-03) | Package installed; **opens, migrates and queries successfully**; no assessments stored | Absolute `IIPS_NP04_DATABASE_PATH`, outside Git, distinct from Gate 3 store and `IIPS_DATA_DIR` | IRR (composition) / NP-04 (schema) | **User host** | `iips-np04-governed-persistence#2e11fa3b` (installed) | **2** for the path; **5** for population | `openDatabase` OK, all 5 port ops present, `queryByOwner` → `{items:[],nextCursor:null}`; HTTP artifacts `200 []` |
| D3 | Reports owner carrier | Establishes the governed Reports partition before any artifact read | Absent by default; **materialiser produces a carrier the resolver accepts** | `IIPS_REPORTS_OWNER_PATH` → byte-exact 384-byte carrier **file**, outside Git | IRR | **User host** | Governing R1 declaration (in-repo) | **5** (→1 when materialised) | `materialiseReportsOwnerCarrier` + `evaluateReportsOwnerContext` → `ok`; HTTP `/api/reports/context` `200 ESTABLISHED` |
| D4 | F-3 owner context carrier | Scopes watchlists / collaboration to the local user | Absent by default; **materialiser + resolver verified** | `IIPS_OWNER_CONTEXT_PATH` → canonical carrier **file**, distinct pair from D3 | IRR | **User host** | Governing F-3 declaration (in-repo) | **5** (→1 when materialised) | `evaluateOwnerContext` → `ok`; HTTP `/api/watchlists` `200 []` |
| D5 | IPD active owner binding | Ownership authority for portfolio/holding reads (IID-02) | **Not provisioned**; IRR can only read the declaration | IPD provisions the binding; only then `IIPS_G3_IPC_BINDING_PROVISIONED=true` | **IPD** | **IPD** | IPD governed provisioning procedure | **4** | `readBindingPrecondition` → not provisioned; HTTP `/api/user-portfolios` `503 owner-context-unavailable` |
| D6 | Same-host IPC endpoint + live peer | Read-only portfolio/holding retrieval from IPD | Not configured; resolver rejects URL/host:port correctly | `IIPS_G2_IPC_ENDPOINT` = Windows named pipe `\\.\pipe\…` or absolute POSIX socket; IPD listening | IRR (client) | **IPD** (peer) / user host (setting) | Running IPD process | **4** | `resolveIpcEndpoint` → `ENDPOINT_NOT_CONFIGURED`; with a valid but absent socket → `ENDPOINT_RESOLVED_PEER_ABSENT` |
| D7 | IID-0 fundamentals dataset | Input the assessment engine reads when **minting** a version | Absent | `<IIPS_DATA_DIR>/investment/dataset` via existing IID-0 ingestion | IRR (reader) | **User host** | Operator-supplied fundamentals | **5** | Directory absent; assessment minting cannot run. Stored assessments read without it |
| D8 | Local personal-use enablement | Additional condition for the personal-use **write** path and Step 9 operator | Absent by default; accepted when `=1` | `IIPS_LOCAL_PERSONAL_USE=1` in the server process | IRR | **User host** | None | **2** | `step9AcceptanceFixtureOperator.ts:181` gates on it; grants no authority |
| D9 | Assessment records (chain versions) | The actual content IID-01/IID-03 serve | **None stored** | Mint at least one version via the existing operator CLI | IRR (CLI) | **User host** | D2 + D3 + D7 | **7 → 5** | HTTP `404 investment-artifact-not-found`; `404 change-not-found` |
| D10 | Real-issuer browser acceptance | P6-B end-to-end proof | **Not attempted** (out of scope here) | All above + real issuer data + browser journey | IRR | **User host** | All external items | **7** | No browser journey executed; no claim made |

**Not applicable (6):** no dependency in this assessment was classified N/A.

## 4. Runtime configuration findings

- **No `IIPS_*` variable is set in this sandbox by default.** All findings above were produced from an
  explicitly empty environment, then re-produced with configuration supplied per-variable.
- **Configuration loading is correct.** Each dependency already has one authoritative resolver
  (`evaluateOwnerContext`, `evaluateReportsOwnerContext`, `readBindingPrecondition`, `resolveIpcEndpoint`,
  `loadIdentitySourcesFromDir`, `serverOwnedDatabasePath`). No duplicated or conflicting loader was found,
  and none was added.
- **Fail-closed behaviour is correct and was observed, not assumed.** Missing carrier → `503
  owner-context-unavailable`; missing binding → `503`; no stored assessment → `404`. No path, owner pair or
  SQL leaked in any HTTP body inspected.
- **`/api/health` is not a readiness check.** It returns a static `{"status":"ok"}` regardless of every
  dependency above. This was the principal IRR-owned gap.
- **Invalid-configuration handling already exists** and was exercised: a relative NP-04 path is refused;
  a URL or `host:port` IPC endpoint is refused; a non-affirmative binding value is refused; a tampered
  carrier fails its digest.
- **Existing operational mechanisms were reused, not duplicated:** `npm run server:dev`, the two carrier
  materialisers, `generate-investment-artifacts.ts`, `show-investment-chain.ts`, `persist-real-reports.ts`,
  and `docs/OPERATOR_RUNBOOK.md` §2/§3.2/§14. No new startup path, database, identity provider or
  persistence platform was introduced.

## 5. IRR-owned corrections implemented

1. **`frontend/server/investment/runtimeReadiness.ts`** — read-only readiness assessment over the existing
   resolvers. Classifies all eight dependencies into the required ownership categories, states the exact
   next action and its accountable owner, and declares the strongest evidence level actually reached.
2. **`frontend/server/investment/cli/iid-readiness.ts`** — operator CLI (`--json`, `--strict`,
   `--data-dir`), following the existing `show-investment-chain.ts` invocation convention.
3. **`frontend/package.json`** — `npm run iid:readiness` for discoverability alongside `server:dev`.
4. **`docs/OPERATOR_RUNBOOK.md` §16** — exact provisioning steps, the ownership table, what a green finding
   does *not* prove, and a working ordering. Windows PowerShell invocation included.
5. **`frontend/server/investment/iidP6aRuntimeReadiness.test.ts`** — 33 tests.

### Safety properties, deliberately engineered

- **The diagnostic never calls `loadAuthoritativeNp04Persistence()`.** That resolver opens the configured
  database with `createDirectory: true, migrate: true`; calling it from a diagnostic would **create and
  migrate a database as a side effect of asking a question**. Readiness reports configuration plus file
  presence only. A mutation test proves the guard: making the check create the file fails the suite.
- **No disclosure.** Output carries setting *names*, bounded reason codes, counts and booleans — never a
  value, owner/tenant pair, digest, filesystem path or stack trace. A mutation test proves a path leak is
  caught.
- **No authority.** `IIPS_LOCAL_PERSONAL_USE` is reported as a condition and excluded from read-path
  readiness. A declared IPD binding is never reported as verified. Nothing enables a write.

## 6. Tests and exact results

| Scope | Result |
| --- | --- |
| New P6-A suite | **33 passed** |
| Targeted `server/investment/` + `src/app/` | **24 files, 316 passed** |
| Full suite **excluding** the new file (baseline) | **152 passed / 1 skipped files; 2016 passed / 1 skipped tests** |
| Full suite **including** the new file | **153 passed / 1 skipped files; 2049 passed / 1 skipped tests** |
| Delta | **exactly +33 tests, +1 file** |
| `tsc --noEmit` (app / investment-server / replay-server) | **exit 0** ×3 |
| `npm run build` | **success** |

Mutation checks (temporary, reverted): creating the database in the check → **1 failure**; leaking the
identity directory into a reason → **2 failures**. No unrelated full backend suite was run.

## 7. Runtime verification evidence

Evidence levels are reported separately and are **not** promoted into one another.

**Level: configured-runtime (in-process, real files).**
- NP-04: `import` OK; `openDatabase({createDirectory,migrate})` OK; `GovernedArtifactStore` constructed;
  all five contract operations present (`createInstance`, `appendVersion`, `resolveById`, `queryByOwner`,
  `listSupersededBy`); `queryByOwner` on an unused owner → `{"items":[],"nextCursor":null}`. **Schema is
  created and queryable. The store is empty.**
- Both carrier materialisers produced files their resolvers accept (`reason=ok`).
- Governed identity fixture set installed into a scratch data domain → `IDENTITY_SOURCES_VALID`.
- Diagnostic re-run before/after: **no file or directory created** by the diagnostic itself.

**Level: HTTP/service (real transport, `127.0.0.1:8787`, configured environment).**

| Route | Observed | Meaning |
| --- | --- | --- |
| `/api/health` | `200 {"status":"ok"}` | Static; proves nothing about dependencies |
| `/api/reports/context` | `200 … disposition:"ESTABLISHED"` | Reports owner carrier works |
| `/api/reports/artifacts` | `200 {"data":[],"nextCursor":null}` | **NP-04 reachable AND empty** |
| `/api/investment/company/<issuer>` | `404 investment-artifact-not-found` | **IID-01 blocked by absent records, not by code** |
| `/api/investment/company/<issuer>/changes` | `404 change-not-found` | **IID-03 blocked by absent versions** |
| `/api/investment/coverage` | `503 observation-sources-unavailable` | Identity loaded; holdings blocked by IPD binding |
| `/api/user-portfolios` | `503 owner-context-unavailable` | **IID-02 blocked by IPD binding** |
| `/api/watchlists` | `200 {"data":[]}` | Owner-scoped read works with the F-3 carrier |

The transport was started for these observations and **stopped** afterwards.

**Level: real-issuer browser — NOT PERFORMED.** No browser journey was executed. No real-issuer
end-to-end claim is made. Synthetic governed fixtures were used for identity; they do not prove
real-issuer operation.

## 8. External prerequisites and accountable owners

**IPD-owned (separate IPD assignment required):**
1. Provision the active owner binding through IPD's governed procedure (D5). IRR cannot establish or
   assert it.
2. Run the IPD same-host IPC peer so portfolio/holding reads succeed (D6).
3. IPD's independent Gate E W-1 write refusal remains in force; this work item neither changes nor tests
   it.

**User-host provisioning (operator, on the actual machine — Windows steps in runbook §16):**
1. Place the three authoritative identity files (D1). **Do not copy test fixtures into an operational
   data domain.**
2. Materialise both carriers with the existing materialisers; point each variable at its own **file** (D3, D4).
3. Choose the absolute NP-04 path and accept that first opening creates/migrates the database (D2).
4. Import a fundamentals dataset (D7) and mint at least one assessment version (D9), then read it back in
   a separate process.
5. Set `IIPS_G2_IPC_ENDPOINT`; set `IIPS_G3_IPC_BINDING_PROVISIONED=true` **only after** IPD confirms
   provisioning; set `IIPS_LOCAL_PERSONAL_USE=1` only for the local personal write path (D8).
6. Restart the transport after any environment change — `Retry` cannot alter a running process.

## 9. P6-A completion status

**IRR-owned enablement: COMPLETE.** The readiness gap is closed, tested, documented and published.

**P6-A overall: NOT COMPLETE.** Required runtime dependencies remain unverified or unavailable:
- IID-01 Stock Intelligence — **blocked**: no stored assessment records (D9), no minting dataset (D7).
- IID-02 Investment/Holding Decisions — **blocked**: IPD binding and peer unavailable (D5, D6).
- IID-03 Historical Change Intelligence — **blocked**: no stored chain versions (D9).

No readiness is claimed for the three capabilities. The `404`/`503` responses above are correct
fail-closed refusals, not defects.

## 10. Exact prerequisites for P6-B

P6-B real-issuer browser acceptance may begin only when **all** hold:

1. IPD binding provisioned and the IPC peer live; an actual portfolio read returns real holdings.
2. Authoritative identity files installed and `IDENTITY_SOURCES_VALID` against **real** issuer data.
3. Both carriers materialised and accepted on the operator host.
4. NP-04 path configured; **at least one real-issuer assessment version stored and read back in a separate
   process**; a second version exists if change comparison is to be exercised.
5. Fundamentals dataset imported and measured for the issuer under test.
6. `npm run iid:readiness -- --strict` exits `0` on the operator host.
7. A real browser journey is then executed and recorded. Until it is, no browser or end-to-end claim is
   admissible.

Production admission remains **NOT ADMITTED**. Step 9 / Stage 0 status is unchanged by this work item.