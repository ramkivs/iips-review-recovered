# IIPS Snapshot-to-Live — Evidence and Verification Execution Runbooks

Executable evidence-gathering and technical-verification package for the Snapshot-to-Live
programme, for the **single-user, personal-use application running locally on the owner's
Windows laptop**.

## Authoritative local environment

| Component | Local path / endpoint |
|---|---|
| IRR repository | `C:\tmp\iips-review-recovered` |
| IPD repository | `H:\IIPS\iips-production-market-data` |
| Evidence root | `G:\IIPS-Evidence\` (all logs, manifests, verification reports, generated outputs) |
| IRR API transport | `http://127.0.0.1:8787` — `cd frontend` then `npm run server:dev` (`EXEC_TRANSPORT_PORT`, default 8787) |
| IRR UI | `http://127.0.0.1:5173` — `cd frontend` then `npm run dev` (Vite proxies `/api` → 8787) |
| IPD G3 IPC provider | named pipe `\\.\pipe\iips-user-portfolio-v1`, `IIPS_G3_DATABASE_PATH=C:\iips-data\iips\user-portfolio.sqlite`, provider runtime Node ≥ 22.13 — started in the IPD checkout per IPD operator instructions |
| IPD market-data daemon | `127.0.0.1:8791` loopback — started in the IPD checkout with `npm run start:market-data-daemon` (shared `IIPS_MARKET_DATA_TRANSPORT_TOKEN`, never on a command line) |
| IRR server env | `.env.local` at the IRR repo root (template `.env.example`); loaded by `npm run server:dev` via `--env-file-if-exists`; **values are never printed, committed or placed on command lines** |

## Layout

- Scripts: `tools/windows/snapshot-to-live/` (see table below)
- This documentation: `docs/snapshot-to-live-runbooks/`
- Evidence at runtime: `G:\IIPS-Evidence\snapshot-to-live\<NN>-<WORKSTREAM>\<EXECUTION-ID>\` plus
  `G:\IIPS-Evidence\snapshot-to-live\consolidated\` (master checklist + per-step pointers)

## Mandatory execution sequence

| Seq | Workstream | Script |
|---|---|---|
| 0 | Preflight | `00-preflight.ps1` |
| 1 | W02 concurrency/revision-change | `01-w02-concurrency-verify.ps1` |
| 2 | W03 inventory reconcile | `02-w03-inventory-reconcile.ps1` |
| 3 | W04 identity coverage | `03-w04-identity-coverage.ps1` |
| 4 | W06 quote/freshness measure | `04-w06-quote-freshness-measure.ps1` |
| 5 | W05 financial coverage/rights | `05-w05-financial-coverage.ps1` |
| 6 | W09 read-path verify | `06-w09-readpath-verify.ps1` |
| 7 | W10 mapping/qualification | `07-w10-mapping-qualify.ps1` |
| 8 | W13 valuation verify | `08-w13-valuation-verify.ps1` |
| 9 | W11 engine execution | `09-w11-execution.ps1` |
| 10 | W15 disposition readback | `10-w15-disposition-readback.ps1` |
| 11 | W16 lineage/readback | `11-w16-lineage-readback.ps1` |
| 12 | W17 browser/API verify | `12-w17-browser-api-verify.ps1` |

Run everything in order: `RUN-ALL-STL.ps1` — **dependency-aware**: every step whose declared
prerequisites PASS runs and is recorded; only genuine dependents of a non-PASS step are marked
`SKIPPED-BLOCKED-UPSTREAM` (with the blocking step numbers) in
`consolidated\master-checklist.json`. W11 (seq 9) runs with deps `[06]` by default — refusal
recording is independent; `RUN-ALL-STL.ps1 -AttemptActualExecution` gates it on
`[02, 04, 05, 06, 07]`. W16 (seq 11) keeps deps `[04, 06, 08]`; W11/W15 legs are optional
(`OptionalDeps`), not blocking. The exact **first preflight command** (run alone first;
`-NoExit` keeps the terminal open; preflight starts/modifies nothing):

```powershell
cd C:\tmp\iips-review-recovered\tools\windows\snapshot-to-live
powershell.exe -NoExit -ExecutionPolicy Bypass -File .\00-preflight.ps1
```

## Package inventory (reconciled)

`tools/windows/snapshot-to-live/` = **19 files = 18 PowerShell (.ps1/.psm1) + 1 TypeScript
runner** (`stl-host-verify.ts`) — an earlier "18 script files" statement counted only the
PowerShell files while its listing also named the runner. Breakdown: 1 helper module
(`STL-HELPERS.psm1`), 13 sequence scripts (`00-`…`12-`), 2 manifest utilities
(`New-`/`Verify-StlEvidenceManifest.ps1`), 1 master driver (`RUN-ALL-STL.ps1`), 1 Pester test
file (`STL-SCRIPTS.Tests.ps1`), 1 runner (`stl-host-verify.ts`). This directory
(`docs/snapshot-to-live-runbooks/`) = 15 files (README + master runbook + 13 per-step
runbooks). Full per-file table with validation results: `00-MASTER-RUNBOOK.md` §5.

## Host readiness (Arena vs laptop)

- **Executed in Arena:** rule scan over all 18 .ps1/.psm1 (clean); `stl-host-verify.ts` modes
  w13/w16 on synthetic fixtures and mode w11 on the real persisted Infosys dataset
  (`evidence/real-issuer/REL-1-INFOSYS-2026-11-06`) — resolver RESOLVED, refusal
  `QUALIFICATION_NOT_QUALIFIED` recorded verbatim.
- **Laptop-only:** all PowerShell execution. Prerequisites for the first preflight run:
  PowerShell 5.1 + git + node ≥22 + python3 on PATH; IRR `C:\tmp\iips-review-recovered`, IPD
  `H:\IIPS\iips-production-market-data`; `G:\IIPS-Evidence` mounted/writable; `.env.local`
  names loaded into the window (see `00-MASTER-RUNBOOK.md` §0); `frontend\node_modules`
  present. Preflight needs no running services; the full sequence additionally needs API
  :8787, UI :5173, IPD G3 pipe `\\.\pipe\iips-user-portfolio-v1`, IPD daemon :8791, and the
  reports env names. Details: `00-MASTER-RUNBOOK.md` §6.

Seal / independently verify any package:

```powershell
.\New-StlEvidenceManifest.ps1 -PackageDir 'G:\IIPS-Evidence\snapshot-to-live\02-W03\STL-02-W03-...'
.\Verify-StlEvidenceManifest.ps1 -EvidenceRoot 'G:\IIPS-Evidence' -All
```

Host-side computation runner (used by steps 08/09/11; reads only files named on the command
line, makes no live calls):

```powershell
cd C:\tmp\iips-review-recovered
npx tsx tools\windows\snapshot-to-live\stl-host-verify.ts --mode w13 --capture-exact <file> --observations-dir <dir> --out <dir>
```

## Documents

- `00-MASTER-RUNBOOK.md` — master runbook: full matrix, result classification, missing-evidence
  policy, evidence package structure, downstream dependency/unblocking matrix.
- `01-PREFLIGHT.md` … `13-W17.md` — one runbook per sequence step (objective, repository
  locations, inputs, prerequisites, runtime requirements, startup, basic checks, execution,
  scripts, expected output, evidence capture, validation, result classification, downstream
  impact, unsuccessful-evidence consequences).

## Standing rules baked into every script

- No `else` / `elseif` / `finally` / `switch` / `exit` statements; one top-level `try/catch`
  per script; terminal stays open (`-NoExit` invocation); result vocabulary is exactly
  PASS / FAIL / BLOCKED / INCONCLUSIVE.
- Windows-native process execution is centralized in `STL-HELPERS.psm1`: every native launch
  goes through `Invoke-StlNative` / `Start-StlNativeProcess` (executable resolution preferring
  real `.exe` over `.ps1`/`.cmd` wrappers, per-argument quoting, stdout/stderr capture,
  exit-code and timeout handling). npm CLI tools are invoked as **verified `node.exe` +
  `npx-cli.js`** (`Get-StlNodeExe` / `Get-StlNpxCliJs` / `Invoke-StlNpx`) — never by launching
  the `npx.ps1` wrapper through `Process.Start`. Python is discovered by actually executing
  candidates (`Get-StlPythonExe`; registry `PythonCore`, PATH `.exe` entries, `<drive>:\Python*`
  roots; Microsoft Store `WindowsApps` aliases excluded).
- Script-local helper functions are always defined **before** their first call site
  (PowerShell does not hoist function definitions within a script file).
- Mandatory collection parameters carry `[AllowEmptyCollection()]`; mutable collections are
  generic `List[...]`, never fixed-size `@()` arrays that later receive `.Add()`.
- TypeScript suites run against the project's real build layout: compiled output under the
  tsconfig `outDir` (normally `dist\src`, `dist\tests`) after a freshness check and, when
  stale/missing, a **targeted** build only; generated `.js` is never copied into `src`.
  Source-run suites use `tsx` via `Invoke-StlNpx`.
- Scripts never start, stop, restart or configure any service; never write outside
  `G:\IIPS-Evidence`; never print credential/token values, portfolio ids, holding identifiers
  or digest values (digest *equality* is recorded as a boolean).
- The exact owner-bound capture (`LOCAL-ONLY-DO-NOT-PUBLISH`) never leaves the host; only
  sanitized/derived reports go to `G:`.
- Quote consumption respects the single server-side boundary (W-29): one
  `POST /api/dhan/quotes` + one `GET /api/dhan/freshness` per resolved identity, no retry.
- Enforced on the host by `STL-SCRIPTS.Tests.ps1` (`Invoke-Pester .\STL-SCRIPTS.Tests.ps1`).


## Package dependency note (W04)

`03-w04-identity-coverage.ps1` invokes the validated
`tools/windows/W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1` from **one directory above**
`tools/windows/snapshot-to-live/`, together with its sibling `tools/windows/W05-SCRIPT-HELPERS.psm1`.
The package ZIP therefore ships both at `tools/windows/…` and must be extracted **preserving the
`tools/windows/…` relative paths** (not flattened), so `snapshot-to-live\..\W05-STEP1-…` resolves.
The Pester suite (33 static tests: 16 original + 15 targeted W04/W05 regression tests + 2 test-harness regression tests for the R8/R10 scoping fixes) includes a dependency-presence test for this exact path.
