# STL Master Runbook — Snapshot-to-Live evidence & verification package

Scope: W02, W03, W04, W05, W06, W09, W10, W11, W13, W15, W16 (both legs), W17. Single-user
personal application on the owner's Windows laptop. All paths, commands, ports and interfaces
below were verified against the IRR checkout (`C:\tmp\iips-review-recovered`) and its
documentation; IPD-side facts are cited from IRR-held records because IPD is unreachable from
agent sandboxes (403), not because it is down for the operator.

- Scripts: `C:\tmp\iips-review-recovered\tools\windows\snapshot-to-live\`
- Runbooks: `C:\tmp\iips-review-recovered\docs\snapshot-to-live-runbooks\`
- Evidence: `G:\IIPS-Evidence\snapshot-to-live\<NN>-<WS>\<EXEC-ID>\` + `consolidated\`

## 0. How to run

Open one Windows PowerShell 5.1 window in `tools\windows\snapshot-to-live`. Before steps that
use the IPC capture, load the repo `.env.local` names into that window (values stay in the
process, never printed):

```powershell
cd C:\tmp\iips-review-recovered
Select-String -Path .env.local -Pattern '^[A-Za-z_][A-Za-z0-9_]*=' | ForEach-Object {
  $p = $_.Line -split '=', 2
  [Environment]::SetEnvironmentVariable($p[0], $p[1], 'Process')
}
cd tools\windows\snapshot-to-live
```

Start the required services (each in its own window, per `docs/OPERATOR_RUNBOOK.md`):

```powershell
# IPD G3 IPC provider (in H:\IIPS\iips-production-market-data, per IPD operator instructions; Node >= 22.13)
$env:IIPS_G3_DATABASE_PATH = 'C:\iips-data\iips\user-portfolio.sqlite'
$env:IIPS_G2_IPC_ENDPOINT = '\\.\pipe\iips-user-portfolio-v1'
# ... IPD provider start command ...
# IPD market-data daemon (only for step 04/07 identity legs)
#   npm run start:market-data-daemon   (loopback 127.0.0.1:8791)
# IRR API transport
cd C:\tmp\iips-review-recovered\frontend
npm run server:dev        # -> Executive transport listening on :8787
# IRR UI (only for step 12)
npm run dev               # -> http://localhost:5173 (proxies /api -> :8787)
```

The **exact first preflight command** (run it first, alone; `-NoExit` keeps the terminal window
open so the result stays visible; preflight inspects only — it starts/modifies nothing):

```powershell
cd C:\tmp\iips-review-recovered\tools\windows\snapshot-to-live
powershell.exe -NoExit -ExecutionPolicy Bypass -File .\00-preflight.ps1
```

Then run the whole sequence with the dependency-aware driver:

```powershell
powershell.exe -NoExit -ExecutionPolicy Bypass -File .\RUN-ALL-STL.ps1
```

The driver does **not** stop at the first non-PASS: it evaluates each step's declared
dependencies (below), runs every step whose genuine prerequisites PASS (independent
activities complete and are recorded), and marks only true dependents of a non-PASS step as
`SKIPPED-BLOCKED-UPSTREAM` with the exact blocking step numbers. `consolidated\master-checklist.json`
is rewritten after every step and carries a dependency-based execution result for every
sequence step. Resume a range after fixing a prerequisite with
`-FromStep <n> -ToStep 12` (last-known results are read from `consolidated\latest-*.json`).

or one step at a time (terminal stays open via `-NoExit`):

```powershell
powershell.exe -NoExit -ExecutionPolicy Bypass -File .\01-w02-concurrency-verify.ps1
# ... 02 .. 12 in order
```

## 1. Result classification (every script and package)

| Result | Meaning |
|---|---|
| PASS | required evidence/verification was captured AND passed validation |
| FAIL | execution ran but a check failed, evidence mismatched, or an exception occurred |
| BLOCKED | a required input, service, access or prerequisite is unavailable (package names the exact resume requirement) |
| INCONCLUSIVE | execution incomplete; neither pass nor fail (e.g. W17 before the operator completes the browser checklist) |

A recorded *refusal* (e.g. W11 `QUALIFICATION_NOT_QUALIFIED`, a 503 fail-closed route) is honest
evidence and is classified by what the step was supposed to establish — never re-labelled.

## 2. Master execution and downstream dependency matrix

"Unblocked" means the named downstream workstream has its required *input evidence*; it does
not by itself mean the downstream workstream is accepted.

| Seq | WS | Exact activity | Prerequisites | Services required | Script/command | Expected evidence | PASS criteria | If evidence unavailable/fails | Downstream unblocked | Downstream still blocked |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | PREFLIGHT | env, repos, services, ports, config names, inputs, G: root | none | none (inspects only) | `00-preflight.ps1` | `00-preflight/<id>/` + `consolidated/latest-00-PREFLIGHT.json` | all mandatory checks PASS | BLOCKED if G: missing; FAIL on broken mandatory item; optional gaps listed per step | readiness for 01–12 | all steps until fixed |
| 1 | W02 | concurrent IRR captures + IPD race/revision suites | preflight PASS; G3 pipe; env names; `npm ci` in frontend | IPD G3 provider | `01-w02-concurrency-verify.ps1` | two CONSISTENT_CAPTURE summaries agreeing on revision+digest; IPD `stage2_portfolio_read_snapshot` + `g3_portfolio_read_isolation` green | all exit 0, same revision/digest, suites pass | BLOCKED if provider/capture preconditions absent; FAIL on inconsistency | strengthens W09 (step 6) | W09 acceptance without this |
| 2 | W03 | reconcile actual inventory vs captured revision | preflight; API :8787; G3 pipe (for fresh capture); reports env (optional leg) | IRR API, IPD G3 provider | `02-w03-inventory-reconcile.ps1` | capture summary + `/api/user-portfolios*` + revisions + holdings + reports artifacts; `reconciliation.json` | counts reconcile to captured revision; empty/unavailable/unknown distinguished | BLOCKED if no capture obtainable (exit 10/11); FAIL on mismatch | W05, W06, W09 actual-data verification | W05/W06/W09 stay BLOCKED on B02 |
| 3 | W04 | identity coverage vs accepted 1/64 census | preflight; API; step-02 capture | IRR API | `03-w04-identity-coverage.ps1` (drives `W05-STEP1`) | identities route response; census 64 rows / QUALIFIED 1 / MISSING 63; revision drift flag | route 200, census reconciles, no unexplained drift | BLOCKED if API down; FAIL if QUALIFIED≠1 without newer revision (contradicts §16.286 — investigate) | W08 use, W10/W11 qualification bound (≤1) | W10/W11 beyond 1/64 until identity-supplying revision (IPD #163) |
| 4 | W06 | actual per-holding quote+freshness (1 call each per resolved identity) | preflight; daemon :8791; the three IIPS_MARKET_DATA_* settings present-and-nonempty in the MANAGED STARTUP environment (startup-loaded operator window; the script never inspects .env.local); steps 02/03 | IRR API + IPD daemon | `04-w06-quote-freshness-measure.ps1` | `output/observations/<row>/quote-response.json` + `freshness-response.json`; `w06-observation-summary.json` | calls = 2 × resolved identities; verdicts recorded verbatim (STALE/UNKNOWN honest) | BLOCKED if daemon/env absent; FAIL on boundary violation | W12 evaluation, W13 actual valuation (step 8) | W13 actual stays synthetic-only; W12 final decisions wait |
| 5 | W05 | financial coverage + source/rights evidence | preflight; API; step-02 capture | IRR API | `05-w05-financial-coverage.ps1` (drives W05-STEP1..4 + investment-coverage route + platform w05 suites) | w05 step packages + `investment-coverage-route.json` + platform logs | all four W05 steps PASS + route 200 | BLOCKED if API down; FAIL on step failure. Workstream stays IN PROGRESS — NOT ACCEPTED regardless | W10 mapping inputs, W11 prerequisites, W12 D1–D3/θM evaluation | W10/W11/W12 finals wait on W05 completion |
| 6 | W09 | actual persisted-data read path, two read cycles + capture | preflight; API; G3 pipe; env names | IRR API, IPD G3 provider | `06-w09-readpath-verify.ps1` | fresh capture + `read-cycles/cycle-{0,1}` + `cycles-summary.json` | same revision+digest across cycles and vs capture; exactly one history entry at revision | BLOCKED if capture/API absent; FAIL on inconsistency | W09 actual-data acceptance (with W02/W03); feeds 08/11/12 capture ref | downstream actual-data steps |
| 7 | W10 | mapping/qualification evidence | preflight; steps 02–05; platform deps; daemon optional | IRR API (+daemon for qualify leg) | `07-w10-mapping-qualify.ps1` | w10 platform suite log + investment-coverage route + optional single qualify response + `w10-qualification-summary.json` (53/115) | suites exit 0, route 200, verdict recorded | BLOCKED if API down; qualify leg NOT EXECUTED if any gate fails (suites≠0, route≠200, daemon 8791 absent) | records whether W11 (step 9) has a qualified issuer (today: NO) | W11 actual execution until the 62 inputs are authorised |
| 8 | W13 | actual valuation + coverage report (+ W20 gate output) | steps 02/06 (exact capture + observations) | none beyond repo | `08-w13-valuation-verify.ps1` → `stl-host-verify.ts --mode w13` | `w06-coverage-report.json`, `w13-valuation-report.json`, `w20-gate-output.json` | runner exit 0; closed vocabulary; null-never-zero; θM honest (UNESTABLISHED ⇒ gate BLOCKED) | BLOCKED if capture/observations missing; FAIL otherwise | W14 inputs, W16 (step 11), W17 ACTUAL-mode check (step 12) | W14/W17-ACTUAL stay blocked |
| 9 | W11 | engine execution vs actual portfolio-linked input (revision pinned; INFY/Infosys `INE009A01021` row — distinct from the W04-resolved AGI `INE415A01038` holding) | refusal recording: step 06 capture; `-AttemptActualExecution`: steps 02/04/05/06/07 PASS incl. W10-sufficient; platform deps | none beyond repo | `09-w11-execution.ps1` → `stl-host-verify.ts --mode w11` + platform W11 suite | `w11-execution-report.json` with verbatim refusal (`QUALIFICATION_NOT_QUALIFIED` today) or a real report | suite exit 0 + runner exit 0 + outcome recorded | BLOCKED if no capture; FAIL on error | a real report would unblock W14; today records the honest refusal | W14 W11 leg; W11 acceptance also needs W03/B02 + IPD limitations B/C |
| 10 | W15 | disposition recording + identical repeat + owner-scoped readback | preflight; API; run in the STARTUP-LOADED operator window (startup block sets `$env:IIPS_NP04_DATABASE_PATH` / `$env:IIPS_REPORTS_OWNER_PATH` / `$env:IIPS_DATA_DIR` in-window); NP-04 store provisioned + reports context verified via actual `GET /api/reports/context` → 200 (no env-file inspection, no per-var checks in the script); limits policy. Script forwards `--db`/`--owner-carrier`/`--data-root` to the disposition CLI and `--db`/`--owner-carrier` to the chain CLI (`--issuer IN:CIN:L85110KA1981PLC013115`, no `--data-root`) only when the `$env:` value is non-empty; env inheritance otherwise unchanged | IRR API | `10-w15-disposition-readback.ps1 [-IssuerId IN:CIN:L85110KA1981PLC013115]` | run1/run2 logs (UNCHANGED repeat), `api-reports-context.json`, `api-dispositions.json`, `api-reports-artifacts.json`, chain log | runs exit 0, repeat UNCHANGED, routes 200, chain exit 0 | BLOCKED if API down or reports context non-200; FAIL otherwise | W15 readback evidence; W16 W15 envelopes (step 11) | W16 W15 leg |
| 11 | W16 | provenance envelopes + pair classification + staleness over actual artifacts | steps 04, 06, 08 (09, 10 optional legs — W15 readback NOT required) | none beyond repo | `11-w16-lineage-readback.ps1` → `stl-host-verify.ts --mode w16` | `w16-lineage-report.json` (envelopes, pairs, staleness) | runner exit 0; envelopes ≥2 producers; pair classified; UNKNOWN never STALE | BLOCKED if 04/06/08 missing; FAIL otherwise | completes outstanding W16 technical + evidence verification | W16 acceptance review |
| 12 | W17 | actual-data browser/API behaviour + ACTUAL-mode conditions | preflight; API + UI; steps 06/08 | IRR API + UI :5173 | `12-w17-browser-api-verify.ps1` (+ manual browser pass recorded in `browser-checklist.json`) | API mode inputs, component cluster log, browser checklist + screenshot | API 200s, vitest exit 0, badge recorded and consistent with W13 (ACTUAL only if fully valued) | BLOCKED if API/UI down; INCONCLUSIVE until browser checklist completed; FAIL on badge/evidence inconsistency | establishes whether actual-data presentation is demonstrable | W17 acceptance if badge inconsistent |

## 2a. Dependency-aware driver semantics (`RUN-ALL-STL.ps1`)

Genuine evidence-package dependencies (`Deps`) declared by the driver — a dependent step is
`SKIPPED-BLOCKED-UPSTREAM` unless every dependency has a recorded PASS; everything else runs:

| Seq | WS | Deps | Why |
|---|---|---|---|
| 0 | PREFLIGHT | — | readiness only |
| 1 | W02 | 0 | pipe/env/deps readiness |
| 2 | W03 | 0 | API readiness; reuses any prior CONSISTENT capture — independent of 01 |
| 3 | W04 | 0 | cross-reconciles against a step-02 capture only when one exists |
| 4 | W06 | 0, 2 | captured revision/census bounds the per-identity call budget |
| 5 | W05 | 0, 2 | bundle reconciliation |
| 6 | W09 | 0 | produces its own fresh capture — independent of 02 |
| 7 | W10 | 0, 2 | census cross-reference |
| 8 | W13 | 2, 4, 6 | exact capture + W06 observations are genuine inputs |
| 9 | W11 | default **6** only — refusal *recording* is independent of W03/W05/W06/W10; with `-AttemptActualExecution` the driver uses **2, 4, 5, 6, 7** because successful actual execution genuinely needs W03 actual data (B02), W05 rights, W06 observations and a W10-sufficient qualification (53/115 today → refusal is the honest outcome) |
| 10 | W15 | 0 | independent: API + reports context 200; script must run in the startup-loaded operator window so the CLI children inherit the env and the script can forward `--db`/`--owner-carrier`/`--data-root` (chain: `--issuer` + `--db`/`--owner-carrier`, never `--data-root`) as explicit flags; no env-file inspection in the script |
| 11 | W16 | 4, 6, 8 | observations + read cycles + W13 report are genuine inputs; **09/10 are OptionalDeps** — W16 does not hard-require W15 readback (runner `--reports-artifacts`/`--w11-report` legs are optional, recorded absent when missing) |
| 12 | W17 | 0, 6, 8 | capture ref + W13 report decide badge consistency |

Master checklist entry per step: `seq, workstream, script, dependencies, dependencyResults,
optionalDependencies, blockingSteps, ran, result, exitCode, timedOut, packageDir, logTail, note`. Driver child
processes are launched **without** `-NoExit` (so results can be collected); only the driver
itself is invoked with `-NoExit`. Driver overall result: `ALL-PASS` or `COMPLETE-WITH-NONPASS`
(with per-result counts).

## 3. Evidence package structure (every step)

```
G:\IIPS-Evidence\snapshot-to-live\<NN>-<WS>\<STL-NN-WS-yyyyMMddTHHmmssZ>\
  execution.json          execution id, seq, workstream, objective, timestamps, IRR/IPD HEAD + dirty, paths
  checks.json             every check: id, ok, detail
  result.json             result (PASS/FAIL/BLOCKED/INCONCLUSIVE), failed checks, diagnostics, downstreamNote, resumeRequirement
  output\                 captured evidence (route responses verbatim, logs, runner reports, observations, browser\)
  manifest.json           SHA-256 over every package file (except manifest*.json)
  manifest-verify.json    independent recomputation result
G:\IIPS-Evidence\snapshot-to-live\consolidated\
  latest-<NN>-<WS>.json   pointer to the newest package per step
  master-checklist.json   written by RUN-ALL-STL.ps1 after each step
```

Independent hash verification of one package or the whole tree:

```powershell
.\Verify-StlEvidenceManifest.ps1 -PackageDir 'G:\IIPS-Evidence\snapshot-to-live\02-W03\STL-...'
.\Verify-StlEvidenceManifest.ps1 -EvidenceRoot 'G:\IIPS-Evidence' -All
```

Re-seal after adding operator files (e.g. screenshots): `.\New-StlEvidenceManifest.ps1 -PackageDir <pkg>`.

## 4. Missing-evidence policy (applies to every step)

- A step whose required input is absent reports **BLOCKED**, names the exact missing input and
  the exact resume requirement in `result.json` (`resumeRequirement`), and does not fabricate
  or substitute synthetic data.
- A failed reconciliation reports **FAIL** with the mismatch in `checks.json` — mismatches are
  investigated, never re-labelled (e.g. a W04 census drift contradicting §16.286).
- Downstream steps whose declared dependencies did not PASS report **SKIPPED-BLOCKED-UPSTREAM**
  in the master checklist with the exact blocking step numbers; independent steps (no unmet
  dependency) still run and are recorded — see §2a.
- Existing evidence is reused when it verifies: a prior `CONSISTENT_CAPTURE` summary (or the
  2026-11-22 host capture `d1992178-…` of record) is reused by steps 02/03/06/08/09/11 — no new
  capture is required unless none exists or the revision changed. The blocker is resolved only
  when the named input (B02-class host access, running bound IPD G3 provider, daemon on 8791,
  reports env, UI) is supplied and the re-run verifies.

## 5. Package inventory (reconciled) — 19 script files + 15 runbook files = 34 files

`tools/windows/snapshot-to-live/` contains **19 files: 18 PowerShell (.ps1/.psm1) + 1
TypeScript runner**. The earlier "18 script files" figure counted only the .ps1/.psm1 files
while its component listing also included `stl-host-verify.ts` — hence the apparent 19. Exact
inventory (validation result per file in the last column):

| # | File | Purpose | Seq/WS | Validation |
|---|---|---|---|---|
| 1 | `STL-HELPERS.psm1` | shared helpers (checks, SHA-256, HTTP, native runner, probes, execution pkg, seal/verify, completion) | all | rule scan clean; functions enumerated |
| 2 | `00-preflight.ps1` | env/repo/service/input preflight | 0 PREFLIGHT | rule scan clean; Arena-reviewed; host execution pending |
| 3 | `01-w02-concurrency-verify.ps1` | concurrent captures + IPD race suites | 1 W02 | rule scan clean |
| 4 | `02-w03-inventory-reconcile.ps1` | inventory vs captured revision | 2 W03 | rule scan clean |
| 5 | `03-w04-identity-coverage.ps1` | identity census + revision availability + unresolved enumeration | 3 W04 | rule scan clean; updated this pass |
| 6 | `04-w06-quote-freshness-measure.ps1` | per-resolved-identity quote+freshness (boundary 2 calls) | 4 W06 | rule scan clean |
| 7 | `05-w05-financial-coverage.ps1` | drives W05-STEP1..4 + routes + platform suites | 5 W05 | rule scan clean |
| 8 | `06-w09-readpath-verify.ps1` | two API read cycles + fresh capture consistency | 6 W09 | rule scan clean |
| 9 | `07-w10-mapping-qualify.ps1` | W10 suites + routes + single qualify call | 7 W10 | rule scan clean |
| 10 | `08-w13-valuation-verify.ps1` | `--mode w13` actual valuation + W20 gate | 8 W13 | rule scan clean; runner executed in Arena (synthetic) |
| 11 | `09-w11-execution.ps1` | `--mode w11` + W11 platform suite; refusal vs execution recorded | 9 W11 | rule scan clean; runner executed in Arena (real dataset) |
| 12 | `10-w15-disposition-readback.ps1` | disposition run1/run2 UNCHANGED (one shared arg array, guarded flag forwarding) + API readback routes + chain readback `--issuer` (no `--data-root`); run from the startup-loaded operator window | 10 W15 | rule scan clean |
| 13 | `11-w16-lineage-readback.ps1` | `--mode w16` envelopes/pairs/staleness | 11 W16 | rule scan clean; runner executed in Arena (synthetic) |
| 14 | `12-w17-browser-api-verify.ps1` | API mode inputs + component cluster + browser checklist | 12 W17 | rule scan clean |
| 15 | `New-StlEvidenceManifest.ps1` | seal a package dir → manifest.json | utility | rule scan clean |
| 16 | `Verify-StlEvidenceManifest.ps1` | independent SHA-256 verify (-PackageDir or -EvidenceRoot -All) | utility | rule scan clean |
| 17 | `RUN-ALL-STL.ps1` | dependency-aware master driver + master-checklist.json | driver | rule scan clean; rewritten this pass (deps, no -NoExit in children) |
| 18 | `STL-SCRIPTS.Tests.ps1` | Pester rules R1–R10 on the host | tests | rule scan clean |
| 19 | `stl-host-verify.ts` | offline runner modes w06/w13/w16/w11 | 8/9/11 | **executed in Arena**: w13+w16 synthetic green, w11 real-dataset refusal green |

`docs/snapshot-to-live-runbooks/`: `README.md`, `00-MASTER-RUNBOOK.md`,
`01-PREFLIGHT.md` … `13-W17.md` (13 per-step runbooks) = 15 files.

## 6. Validation record — Arena-side vs laptop-side

**Actually executed in the Arena sandbox (agent environment):**
- rule scan over all 18 .ps1/.psm1 (no else/elseif/finally/switch/exit line-starts, no
  Invoke-Expression/Write-Host/Stop-Process, brace/paren balance): clean after the rewrite;
- `stl-host-verify.ts` executed end-to-end (tsx): `--mode w13` and `--mode w16` against
  **synthetic** capture-shaped fixtures (W13 VALUED 10×250.5=2505, coverage 86.38%, W20 gate
  BLOCKED DENOMINATOR_INDETERMINATE + THETA_M_UNESTABLISHED; w16 envelopes + staleness
  GOOD/30s/120s→FRESH); `--mode w11` against the **real persisted Infosys dataset**
  `evidence/real-issuer/REL-1-INFOSYS-2026-11-06` (resolver RESOLVED
  `IN:CIN:L85110KA1981PLC013115` / `IN:ISIN:INE009A01021` / `IN:NSE:INFY:EQ:EQUITY`;
  execution refused `QUALIFICATION_NOT_QUALIFIED`, recorded verbatim, exit 0). Exit codes 0/2/3
  as specified.

**Synthetic-only validation:** w13/w16 runner modes (fixtures, not live data) — synthetic
verification is never live qualified coverage.

**Package-wide corrective scan (this pass):** rule scan over all 17 non-test .ps1/.psm1 — no
forbidden line-starts, no Invoke-Expression/Write-Host/Stop-Process, brace/paren balanced, no
remaining `npx`-wrapper or bare-`python3` launches, no function called before its definition,
no fixed-size array receiving `.Add()` — result: clean.

**Requires the user's Windows laptop (not runnable in Arena; pwsh/Windows pipes absent):**
all 18 PowerShell files, the Pester suite, and every HTTP/IPC/daemon leg. First run is the
preflight below.

**Consolidated host prerequisites for the first preflight run:**
1. Windows laptop with Windows PowerShell 5.1, `git`, `node` (≥22; ≥22.13 for the IPD
   provider), `python3` on PATH;
2. IRR at `C:\tmp\iips-review-recovered`, IPD at `H:\IIPS\iips-production-market-data`;
3. `G:\IIPS-Evidence` mounted, writable, free space;
4. `.env.local` at the IRR root loaded into the preflight window (names only; values never
   printed) — see §0 loader snippet;
5. `frontend\node_modules` present (else `npm ci` in `frontend/`) — optional-gap item;
6. no services required for preflight itself (it only inspects); for the full sequence also:
   IRR API `:8787`, UI `:5173`, IPD G3 provider on `\\.\pipe\iips-user-portfolio-v1`,
   IPD daemon `:8791`, reports env names (`IIPS_REPORTS_OWNER_PATH`, `IIPS_NP04_DATABASE_PATH`).

**First preflight command (ready to execute; preserves the open terminal via `-NoExit`):**
```powershell
cd C:\tmp\iips-review-recovered\tools\windows\snapshot-to-live
powershell.exe -NoExit -ExecutionPolicy Bypass -File .\00-preflight.ps1
```
Known issue fixed in this pass: the master driver previously passed `-NoExit` to child step
processes, which would have kept each child alive and timed out the driver — children are now
launched with `-NoProfile` only. No remaining issue is known to prevent preflight; the only
preflight failure modes are environmental (G: unmounted → BLOCKED, missing tools → FAIL with
the named item).

## 6a. Corrections applied in the targeted review pass

- **Identity conflict resolved:** the accepted W04 1/64 resolved holding is **AGI Greenpac
  `INE415A01038`** (`ISIN:INE415A01038:EQ`, `holding:DHAN_PORTFOLIO:0001`, §16.286) — verified
  against tracker §16.286/§16.325 records and `docs/integration/B04-…-2026-11-06.md`.
  `INE009A01021` is **Infosys (INFY, holding #30)**, the W11 `REL-1-INFOSYS` dataset issuer — a
  different holding. `03-w04-identity-coverage.ps1`, `04-W04.md`, `08-W10.md`, `10-W11.md`,
  `09-w11-execution.ps1` and `stl-host-verify.ts` now state this distinction explicitly; the W04
  script gained `-ExpectedResolvedSecurityId ISIN:INE415A01038:EQ`, the
  `resolved-identity-matches-accepted` check and `output/identity-evidence-basis.json`
  (historical revision-1 evidence vs. current live route observation, with divergence flag).
- **Driver dependencies corrected:** seq 9 W11 — default deps `[06]` (refusal recording is
  independent); `-AttemptActualExecution` switches to `[02, 04, 05, 06, 07]`. Seq 11 W16 —
  verified W15 readback is NOT a hard prerequisite (optional runner legs); deps stay
  `[4, 6, 8]` with `OptionalDeps [09, 10]` reported in the checklist.

## 6b. Package-wide Windows-compatibility corrections (post-W02-PASS corrective pass)

Triggered by W02 host validation (PASS, `STL-01-W02-20261124T202255Z`) — generic defects fixed
centrally so they cannot recur in steps 02–12. W02 concurrency logic itself was NOT reworked.

| Class | Defect found package-wide | Central correction |
|---|---|---|
| A. npx wrapper | 12 call sites launched `FilePath 'npx'` (resolves to `npx.ps1`; `.NET Process.Start` fails with "The system cannot find the file specified"); 01 also had a raw `ProcessStartInfo` with `FileName = 'npx'` | `Get-StlNodeExe` (verified `node.exe`), `Get-StlNpxCliJs`, `Invoke-StlNpx`, `Start-StlNativeProcess` in `STL-HELPERS.psm1`; all 13 sites now run `node.exe "<npx-cli.js>" <args>`; discovery is path/registry-based, not hardcoded to one machine |
| B. Python alias | `00-preflight.ps1` ran bare `python3` (can resolve to the Microsoft Store `WindowsApps` alias) | `Get-StlPythonExe`: registry `PythonCore` InstallPath, PATH `.exe` entries excluding `WindowsApps`, `<SystemDrive>:\Python*` roots — each verified by actually executing `--version` and matching `Python <n>` |
| C. Empty collections | mandatory `ArrayList`/`List[string]` params rejected valid empty collections | `[AllowEmptyCollection()]` on `Add-StlCheck -Checks`, `Complete-StlExecution -Checks`/`-Diagnostics` |
| D. Fixed-size arrays | `00-preflight` (`$missingRequired/$missingMd/$missingRep`), `04-w06` (`$mdMissing`), `02`, `08`, `09`, `11` initialized `= @()` then used `.Add()`/`+=` | initialized as `[System.Collections.Generic.List[string]]@()`; `+=` on lists replaced with explicit `.Add()` |
| E. Declaration order | functions called before their definition line (`IIf-None`/`Find-StlPriorCapture` in 00, `IIf` in 02, `IIfStr` in 08/09/12 — PowerShell does not hoist within a script file) | script-local helpers moved above the main body (before first use); shared `IIf-StlStr` added to the module |
| F. Process invocation | `Invoke-StlNative` joined arguments with plain spaces (paths with spaces break) and did not resolve wrapper commands | per-argument quoting (`ConvertTo-StlProcessArg`), executable resolution preferring `.exe` (`Resolve-StlExecutablePath`), `Start-StlNativeProcess` for concurrent launches — all central in the module |
| TS build layout | `01-w02` ran `node --test tests\*.test.ts` from IPD source, while those tests import `.js` modules that exist only compiled under `dist\src` (compiled tests live in `dist\tests`) | 01 now reads `outDir` from IPD `tsconfig.json`, checks compiled-test freshness vs newest source mtime, runs `node.exe --test <outDir>\tests\*.test.js`, runs a **targeted** `npm run build` when stale/missing, falls back to `tsx --test tests\...` only if the build cannot produce compiled tests; `.js` is never copied into `src`; no full regression suites |

Files modified: `STL-HELPERS.psm1` (central), `00-preflight.ps1`, `01-w02-concurrency-verify.ps1`,
`02-w03-inventory-reconcile.ps1`, `04-w06-quote-freshness-measure.ps1`,
`05-w05-financial-coverage.ps1`, `06-w09-readpath-verify.ps1`, `07-w10-mapping-qualify.ps1`,
`08-w13-valuation-verify.ps1`, `09-w11-execution.ps1`, `10-w15-disposition-readback.ps1`,
`11-w16-lineage-readback.ps1`, `12-w17-browser-api-verify.ps1`, plus `README.md`, `02-W02.md`.

## 6c. Parser-error and Pester-suite corrections (latest local validation round)

- **STL-HELPERS.psm1 parser errors:** the quoted drive-variable form `$env:'ProgramFiles(x86)'`
  (line 177 of `Get-StlNodeExe`, two occurrences) is rejected by the Windows PowerShell 5.1
  parser; corrected to the universally valid `${env:ProgramFiles(x86)}`. Verified by parsing
  every package file with a real PowerShell grammar (tree-sitter powershell): all 18 .ps1/.psm1
  now parse with zero error nodes (previously the module flagged the `$env:'...'` line).
  Additional hardening in the same pass: `00-preflight.ps1` numeric literal `1GB` rewritten as
  `1073741824`, and its duplicate bare `FilePath 'node'` tool probe replaced with
  `Get-StlNodeExe`; local one-line `IIf`/`IIfStr` helpers in 02/08/09/12 replaced by the shared
  `IIf-StlStr` from the module.
- **`STL-SCRIPTS.Tests.ps1` rewritten as clean Pester 5.x:** discovery fixed
  (`Get-ChildItem -Path $PSScriptRoot -File | Where-Object Extension -in .ps1/.psm1 -and Name
  -ne self` — `-Include` without `-Recurse` did not filter); null-safe line handling in R1–R4
  (`$null -ne $_ -and ('' + $_).TrimStart() -match ...`); R8 now distinguishes workstream
  vocabulary (PASS/FAIL/BLOCKED/INCONCLUSIVE, enforced on every `RESULT [...]` line) from the
  master driver's legitimate `SKIPPED-BLOCKED-UPSTREAM`; R10 is AST-based
  (`Parser::ParseFile` + `FindAll` for `CommandAst` named `Stop-Process`) instead of text
  search; new P0 context parses every file with the real PowerShell parser and asserts zero
  errors, plus P0b imports the module and asserts all 25 exported helpers; new R11 encodes
  the Windows-compat invariants (no `npx`/`python3`/`node` wrapper launches, no `$env:'...'`).
- **W02 acceptance logic untouched:** revision/provenance-digest equality comparison,
  capture-summary discovery and the PASS condition in `01-w02-concurrency-verify.ps1` are
  unchanged; `STL-01-W02-20261124T202255Z` PASS stands.

## 6d. Test-suite null-handling and R8 vocabulary fixes (latest Pester 5.7.1 run: 20 passed / 18 failed)

- **R1–R4 null handling:** every pipeline stage in `STL-SCRIPTS.Tests.ps1` now filters nulls
  *before* any member access (`Where-Object { $null -ne $_ }` at discovery, at `Get-Content`
  read time, and at each per-file pipeline), and the line test casts first
  (`([string]$_).TrimStart() -match ...`), so blank lines and null entries can never reach a
  method call. The exception is removed at the source, not suppressed.
- **R8 vocabulary:** workstream scripts (everything except `RUN-ALL-STL.ps1`) must not contain
  `SKIPPED-BLOCKED-UPSTREAM` and every `RESULT [...]` line they contain must be one of
  PASS/FAIL/BLOCKED/INCONCLUSIVE; the master driver may keep `SKIPPED-BLOCKED-UPSTREAM` as
  checklist bookkeeping for not-run dependent steps, but the suite asserts it is never
  emitted as a `RESULT [SKIPPED-BLOCKED-UPSTREAM]` line. Driver behavior is preserved and
  workstream status validation is not weakened.

## 6e. Pester 5 discovery-phase fix (host run discovered only 5 of 73 tests)

- Root cause: per-file `It` declarations inside `foreach ($file in $script:ScriptFiles)`
  loops run at **discovery** time, but `$script:ScriptFiles` was populated in `BeforeAll`,
  which runs only at execution — so the loops saw `$null` and zero per-file tests were
  discovered. Fix: `ScriptFiles` / `ScriptCode` / `ParseErrors` are now populated at
  **top-level script scope** (Pester 5 executes the whole test script during discovery);
  `BeforeAll` now only imports `STL-HELPERS.psm1` for P0b. A guard `It` asserts exactly
  17 package files are discovered.
- Expected Pester discovery count after the fix: 5 static Its + 4 per-file contexts x 17
  files = **73 tests** (P0 real-parser x17, R1-R4 x17, R5-R7 x17, R11 x17, plus discovery,
  P0b, R8, R9, R10). The previous host run's "5" was discovery-only; it established
  nothing about package validation.

## 6f. Pester 5 static-test rewrite (host run on package (4) still discovered only 5 tests)

- Top-level initialization did NOT fix discovery on the host, so all dynamically generated
  per-file `It` blocks were eliminated. The suite now declares exactly **9 static `It`
  blocks**; each one iterates over the complete 17-file package collection at TEST
  EXECUTION TIME and aggregates every violation (file + line) into a single assertion.
  Expected Pester discovery count: **9**. Coverage: guard (17 files), P0 real-parser x17
  with file/line aggregation, P0b (26 exported helpers), R1-R4 x17, R5-R7 x17, R8 x17,
  R9 x17, R10 AST x17, R11 x17.
- The P0b helper count is asserted as 26 (the module declares 26 functions; an earlier
  note said 25 - ground truth from STL-HELPERS.psm1 is 26).

## 6g. R11 diagnostic-string interpolation fix (host parse error at STL-SCRIPTS.Tests.ps1:206)

- The R11 failure message was a double-quoted string containing a literal `$env:'...'`,
  which PowerShell parses as a variable reference (`$env:`) - a real parse error at char 79.
  Fixed by building the message from single-quoted literals only
  (`': uses $env:' + "'...'" + ' - use the ${env:Name} braces form ...'`), so the diagnostic
  text is literal and the R11 regex (`('\$env:' + "'")`) is unchanged - validation behavior
  preserved. Static 9-test structure, P0/P0b/R1-R11 coverage all retained.

## 6h. Guard/BeforeAll execution-model fix (host Pester 5.7.1: 9 discovered, 8 passed, guard failed 0 != 17)

- Root cause: Pester 5 runs top-level code of a test file only during DISCOVERY and discards
  that scope; BeforeAll is what runs at execution time. The guard read a top-level
  `$script:ScriptFiles` that was therefore empty at execution (and the per-file tests passed
  vacuously over the empty list). Fix: `ScriptFiles`/`ScriptCode` are now populated in
  `BeforeAll`; the guard It and P0 consume the same `$script:ScriptFiles`, and the guard
  additionally cross-checks against a direct enumeration with the identical
  `$PSScriptRoot` + extension + test-file-exclusion expression. Expected count stays 17;
  no other check altered. Expected host result after fix: 9 discovered, 9 passed.

## 6i. W03 inventory-reconcile correction to the actual host response shapes

- `02-w03-inventory-reconcile.ps1` now reads the capture summary as
  `portfolio.revision` + `portfolio.holdingsCountReported` / `portfolio.holdingsArrayLength`
  (never `portfolio.holdingsCount`, which the sanitized summary does not carry).
- API detail is read nested under `portfolio` (`portfolio.revision`, `portfolio.holdings`,
  `portfolio.totalHoldingsCount`, `portfolio.provenanceDigest`).
- `GET .../holdings` is write-only (Allow: PUT): 405 = unsupported, NOT zero holdings; the
  holdings count is reconciled from the portfolio detail only; 503 remains "unavailable".
- Revisions history: exactly one entry at the captured revision (operation recorded, e.g. MERGE,
  entry holdingsCount == capture count) with the same provenanceDigest.
- Digest values are compared by exact string equality across detail, the revisions entry and the
  LOCAL-ONLY exact capture (`LOCAL-ONLY-DO-NOT-PUBLISH/exact-owner-bound-portfolio-capture.json`,
  sha256-verified against `summary.exactCapture.sha256` when recorded) - never fabricated from
  the sanitized summary, which carries only provenanceDigestPresent/Length.
- Reconciliation logic factored into a pure helper `Compare-StlW03Inventory` in
  `STL-HELPERS.psm1` (helper count 26 -> 27) so the Pester suite drives the same code.
- Targeted tests: 6 synthetic fixtures under `tools/windows/snapshot-to-live/tests/fixtures/w03/`
  mirroring the supplied response shapes (incl. the 405 holdings response) + 2 new static Its.
  Suite is now 11 static tests (expected Pester discovery count: 11). W02 capture/evidence and
  the optional reports leg (independently BLOCKED when its env config is absent) unchanged.

## 6j. W04 correction to actual evidence shapes (revision-1 accepted vs revision-4 W03 vs live route)

- `03-w04-identity-coverage.ps1` no longer reads `portfolio.holdingsCount` (absent in the
  sanitized summary) and no longer takes the "last summary encountered" as the baseline. The
  accepted revision-1 capture of record is identified deterministically by capture-id prefix
  `d1992178` (`Find-StlAcceptedCaptureOfRecord`; 0 or >1 matches = recorded problem, never a
  silent pick). The latest live W03 evidence is identified by execution id
  `STL-02-W03-20261125T100309Z` (`Get-StlW03ExecutionEvidence`: PASS / ManifestVerifyOk /
  revision 4 / 65 holdings via holdingsCountReported/holdingsArrayLength).
- Revision availability compares `maxRevisionInHistory` against the ACCEPTED revision 1 (never
  against W03's 4): 4 > 1 = subsequent revision exists = revision availability ONLY, not an
  identity change. Missing input for an identity diff recorded verbatim.
- Cardinality reconciliation (64 vs 65): accepted census 64 (DHAN-scoped rows at revision 1) vs
  W03 portfolio 65 holdings (revision 4) vs coverage-route total 65 items (64 DHAN + 1 AIIL
  default-portfolio item, excluded and recorded) - three populations, never equated.
- Identity semantics preserved: AGI `INE415A01038` / `ISIN:INE415A01038:EQ` /
  `holding:DHAN_PORTFOLIO:0001` / NON_AUTHORITATIVE is the only resolved identity; INFY
  `INE009A01021` (holding #30) is a different identity; recount uses stored
  `securityIdentity.securityId` only, explicit nulls = unresolved, never inferred.
- New pure helpers in STL-HELPERS.psm1 (count 27 -> 30): Find-StlAcceptedCaptureOfRecord,
  Get-StlW03ExecutionEvidence, Compare-StlW04EvidenceBases. Pester suite: 4 new static W04
  fixture tests under tests/fixtures/w04/ (synthetic); expected discovery count now 15.
  W05-STEP1 verbatim route capture + manifest verification unchanged. Runbook 04-W04.md rewritten.

## 6k. W04 Pester host-failure fixes (2 failures)

- Revision-availability test: the negative prose regex matched the phrase inside the negated
  sentence. The helper now exposes structured fields `RevisionAvailabilityOnly = $true` and
  `IdentityChangeProven = $false`; tests assert those fields (availability vs proven identity
  change stay distinct), plus the positive relationship text.
- INFY unresolved row: symbol extraction initialised to '' (not $null), so the `raw.symbol`
  fallback never fired and the symbol came back empty. Fixed: item-level symbol, then
  `raw.symbol` fallback, then ''. Explicit-null stored identity and holding #30 preserved;
  targeted assertions on rowId + symbol + null storedSecurityId added. Expected discovery count
  unchanged: 15 static tests.

## 6l. W04 negative-case hardening (host failure: cmp3.Ok returned $true with missing accepted capture)

- `Compare-StlW04EvidenceBases` now treats a missing accepted baseline as INCOMPLETE evidence,
  never a success: `AcceptedBaselinePresent` flag, machine-readable `ProblemCodes`
  (`MISSING_ACCEPTED_BASELINE`, `ACCEPTED_BASELINE_REVISION_MISMATCH`, ...), and `Ok` requires the
  baseline plus `RevisionComparisonStatus = 'compared-vs-accepted-revision'`.
- Revision comparison is explicitly classified: `compared-vs-accepted-revision` /
  `unavailable-no-usable-revision-entries` (empty history is UNAVAILABLE, not a success) /
  `unavailable-accepted-baseline-missing` / `unavailable-route-not-200`. Graceful, no throw.
- `RevisionAvailabilityOnly` / `IdentityChangeProven` structured fields and the INFY
  `raw.symbol` fallback correction are preserved. Tests extended (null AND empty-object
  baseline, empty-history status assertions); suite still 15 static tests.

## 6m. W04 negative-baseline robustness (host: cmp3.Ok still $true at line 355)

- The accepted baseline is now structural AND content-checked: `AcceptedBaselinePresent` requires
  a non-null `portfolio.revision` AND a `captureId` matching `-AcceptedCaptureIdPrefix`.
  `Ok` can only be true with `RevisionComparisonStatus = 'compared-vs-accepted-revision'`.
- Output carries `HelperVersion = '2.1-negative-baseline'`; the suite asserts it, so a stale
  STL-HELPERS.psm1 imported on the host fails loudly with a clear message instead of a
  misleading Ok.
- Negative cases tested three ways: summary without portfolio, explicit $null, and a
  wrong-captureId summary - all must give Ok=$false + MISSING_ACCEPTED_BASELINE, no throw.
  Empty revision history stays 'unavailable-no-usable-revision-entries'. Valid rev1-vs-rev4
  comparison, RevisionAvailabilityOnly/IdentityChangeProven, and the INFY raw.symbol fallback
  are unchanged. Suite still 15 static tests.

## 6n. W04 runtime dependency recovered into the package (host: w05-step1-present = false)

- Host execution `STL-03-W04-20261125T120447Z` failed because W04 resolves the validated
  `W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1` at `..\W05-STEP1-...` (one level above
  `snapshot-to-live/`), which a standalone package extraction does not contain.
- The original validated script was recovered from the authoritative IRR repository
  (`tools/windows/W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1`, present at base commit
  `22a68a4ac8546149cd9759ab978dec459fcef8aa`), together with its required helper module
  `tools/windows/W05-SCRIPT-HELPERS.psm1`. Both parse with zero errors (grammar proxy in
  Arena; Parser::ParseFile on the host). Route contract verified: `GET <BaseUrl>/api/investment/coverage?asOf=<AsOf>`;
  five-category census validation verified (QUALIFIED/AMBIGUOUS/MISSING_OR_UNRESOLVED/
  EXPIRED_OR_INELIGIBLE/UNAVAILABLE, defaults 1/0/63/0/0); all nine parameters the W04 caller
  passes (-RepoRoot -BaseUrl -AsOf -OutDir -PortfolioId -ExpectedRowCount -ExpectedQualified
  -ExpectedMissingOrUnresolved -TimeoutSeconds) exist with matching names.
- The package ZIP now ships both files at `tools/windows/...` (full relative paths preserved),
  so extraction yields the exact path W04 expects. A 16th static test asserts presence at the
  expected path, zero parser errors, the caller parameter contract, the route contract, the
  five-category vocabulary and the sibling helper module. Expected Pester discovery: 16 (33 after the 6o targeted tests and the 6p harness regression tests).

## 6o. W04 failed-execution correction (host: `STL-03-W04-20261125T121636Z`, W05 FAILED-EXCEPTION "method on a null-valued expression")

- Root cause (code): null-receiver member access in the W05 capture path — a null element in
  `items` reaching `ConvertTo-W05CensusRows` (`$item.raw.PSObject...`), a null `$row` in the
  portfolio-identity loop, a null `$http`/`$gitCommit` result reaching `.Status`/`.ExitCode`
  chains. The raw `identities-route-response.json` was not available, so no line is asserted
  from the message alone; the enriched catch now records exception type, message, stack trace,
  script name/line and invocation context, and every report variable is pre-initialized so a
  failure can never surface as `[null]` array entries.
- Fixes: explicit null guards (a null item element throws a named invalid-shape error; a null
  row fails `portfolio-identity`; null `$http`/`$gitCommit` handled), explicit shape validation
  via `Get-W05ResponseShape` (`report` / `documented-error-payload` / `not-json` /
  `unknown-json-shape`), null/absent `items` = INVALID (never an empty census), captureState
  vocabulary `CAPTURED` / `CAPTURED-UNAVAILABLE` (503) / `FAILED-VALIDATION` /
  `INVALID-RESPONSE-SHAPE` / `FAILED-EXCEPTION`, raw response preserved verbatim whenever it
  exists, output arrays filtered against nulls.
- W04 reader defects fixed: the caller compared W05's result to `'PASS'` while W05 emits
  `OK`/`CAPTURED` — now accepts only `OK`/`CAPTURED`/`ok=true` AND requires the raw response
  file; a failed/unavailable capture is never consumed as a census (route basis UNAVAILABLE,
  counts null, `ROUTE_UNAVAILABLE`; resolved/unresolved outputs record `routeAvailable:false`
  instead of empty-census zeros). The accepted capture is searched by FULL id
  `d1992178-e6e6-4f52-b70a-046db66c446a` (plus prefix fallback) under widened roots; when not
  located the output says `not-located-baseline-unavailable` with revision null — never
  `captureId:""`/`revision:0`. `Get-StlW03ExecutionEvidence` now reads the exact execution's
  `manifest-verify.json` (STL-02-W03-20261125T100309Z: Ok=true, 9/9 — W03 stays PASS with
  manifest verification true; W03 is NOT rerun). `Compare-StlW04EvidenceBases`
  (`HelperVersion 2.2-route-unavailable`) keeps the three bases separate, gates the census on
  route availability, and the cardinality finding makes no other-portfolio/AIIL claim without
  actual route evidence.
- Tests: 15 targeted regression tests added (discovery 16 -> 31; 6p adds 2 more -> 33). Grammar-proxy parse: zero
  error nodes on all 18 package files. W04 itself remains UNACCEPTED until a fresh host
  execution produces a successful `CAPTURED` route capture with the 64/1/63 census evidence.

## 6p. Test-harness defects fixed at source: R8 driver-status scoping + R10 test-file exclusion (host symptom: 10 passed / 2 failed, W09 blocked)

- Root cause: the two earlier manual corrections were applied to the EXTRACTED package copy on
  the host, not to the authoritative source (this repo's `tools/windows/snapshot-to-live/`,
  per §6n), so the next fresh extraction of the published ZIP overwrote them. Two structural
  defects remained in `STL-SCRIPTS.Tests.ps1`: (R8) the old scan rejected
  `SKIPPED-BLOCKED-UPSTREAM` anywhere in `RUN-ALL-STL.ps1`, but that status is the master
  driver's legitimate dependency bookkeeping — only workstream RESULT vocabulary is
  PASS/FAIL/BLOCKED/INCONCLUSIVE; (R10) discovery excluded only `STL-SCRIPTS.Tests.ps1`, so an
  additional Pester file in the extracted package (`STL-SCRIPTS-W09.Tests.ps1`) was scanned
  as an executable and its literal `Stop-Process` test assertion tripped the AST rule.
- Fix (source-level, structural): discovery now classifies files — `$script:ScriptFiles`
  = executable `.ps1/.psm1` with name `-notlike '*.Tests.ps1'` (guard still expects exactly
  17); `$script:TestFiles` = `*.Tests.ps1`, discovered for visibility only and never scanned
  by R1–R11. R8 checks the 4-value RESULT vocabulary + no `SKIPPED-BLOCKED-UPSTREAM` on every
  executable EXCEPT the driver, and for the driver only forbids `RESULT [SKIPPED-BLOCKED-UPSTREAM]`.
  R10 keeps the AST `CommandAst` `Stop-Process` check on executable files only; the helper's
  specifically permitted timeout-kill (`$proc.Kill()` method in `STL-HELPERS.psm1`) is not a
  command and remains permitted under the same rule.
- Regression coverage: two new static Its (`R8-regression`, `R10-regression`) — driver
  bookkeeping accepted / never as RESULT + negative controls, test-file exclusion with a
  synthetic real `Stop-Process` command still caught in an executable and a string literal
  not treated as a command, helper `.Kill()` verified method-not-command. Expected Pester
  discovery: 16 -> 31 -> **33**.
- Validation: grammar-proxy parse 0 error nodes; emulated discovery/R8/R10 with a simulated
  `STL-SCRIPTS-W09.Tests.ps1` present: executable set stays 17, R8/R10 clean. Host Pester run
  (`Invoke-Pester .\STL-SCRIPTS.Tests.ps1`, expect Discovered 33, 0 failed) remains the
  authoritative validation; W09 host execution was NOT performed from Arena (no PowerShell /
  no Windows host here) — W09 remains NOT STARTED until run on the host.

## 6q. Pester host run 20/33 — module-shadow hardening (host: P0b missing IIf-StlStr + 12 CommandNotFoundException Its)

- Host evidence: `Invoke-Pester` on `D:\W04\w05-stl` discovered **33** tests, **20 passed /
  13 failed**; every failure was `CommandNotFoundException` for `Compare-StlW03Inventory` /
  `Find-StlAcceptedCaptureOfRecord` / `Get-StlW03ExecutionEvidence` (fixture + targeted Its)
  plus P0b reporting `IIf-StlStr` not exported.
- Root cause: the extracted dir was MIXED — the new 33-test `STL-SCRIPTS.Tests.ps1` (from the
  6p delta zip) sat next to a STALE `STL-HELPERS.psm1` from an older base extraction, and/or an
  older `STL-HELPERS` module loaded from another path earlier in the session shadowed the
  sibling file (`Get-Command -Module 'STL-HELPERS'` then returns the stale export set).
  Source check: the authoritative `STL-HELPERS.psm1` defines all 30 expected functions
  (incl. `IIf-StlStr` and the W03/W04 comparators), has no `Export-ModuleMember` restriction,
  and the full package ZIP's member verifies the same 30 — so the source and full package are
  consistent; the defect is stale/mixed host extraction + module shadowing.
- Source-level hardening in `STL-SCRIPTS.Tests.ps1` BeforeAll: any loaded `STL-HELPERS` module
  is removed first, then the sibling file is imported by full path with `-Force -PassThru`,
  and `$script:ExportedFunctions` is read from THAT module object's `ExportedCommands`;
  P0b additionally asserts `$script:StlModule.Path` equals the package-dir sibling path and
  that the module exports exactly 30 commands. Discovery count unchanged: **33**.
- Host remediation: re-extract the FULL corrected package (not only the delta zip), or at
  minimum replace `STL-HELPERS.psm1` next to the new test file, then rerun
  `Invoke-Pester .\STL-SCRIPTS.Tests.ps1` (expect 33 discovered / 0 failed).

## 6r. Host Pester run 31/33 — two source-level null-handling bugs fixed (targeted 12 & 13)

- Host evidence: 33 discovered, **31 passed / 2 failed** — targeted 12 (`AcceptedRevision`
  expected `$null`, **got 0**) and targeted 13 (`ManifestVerifyOk` expected `$false` with the
  manifest-verify file absent, **got $true**).
- Root cause 1 (targeted 12): PowerShell variables are **case-insensitive**, so the local
  `$acceptedRevision = $null` in `Compare-StlW04EvidenceBases` was the SAME variable as the
  `[int]$AcceptedRevision = 1` parameter; assigning `$null` to an `[int]`-typed variable
  coerces to **0** — a manufactured revision-0 baseline, exactly what the null-never-zero
  rule forbids. Fix: local renamed to `$acceptedRev` (13 occurrences; parameter untouched),
  with an explanatory comment; targeted 12 additionally asserts `AcceptedRevision -ne 0`.
- Root cause 2 (targeted 13): `Get-StlW03ExecutionEvidence` fell back to `result.json`'s
  `manifestVerifyOk` property when `manifest-verify.json` was absent, so absence was masked
  as verified. Fix: the exact execution's `manifest-verify.json` is now AUTHORITATIVE —
  `ManifestVerifyOk` is `$false` when the file is absent; new output fields
  `ManifestVerifySource` (`manifest-verify.json`|`absent`) and `ManifestVerifyResultJsonOk`
  expose the result.json attestation separately without feeding `ManifestVerifyOk`.
  Targeted 13 asserts all three fields. W03 itself is NOT rerun; with the real file present
  (Ok=true, 9/9) `ManifestVerifyOk` stays `$true`.
- Discovery count unchanged: **33**. Parse: 0 error nodes. Expect host rerun 33/33.

## 6s. W09 implementation corrected to the admitted TWO-GET read contract (host: W09 suite 6/8 — W09-4/W09-7 failed against the obsolete three-GET Read-Cycle)

- Root cause: `06-w09-readpath-verify.ps1` still implemented the obsolete three-GET cycle
  (detail + revisions + a separate holdings-route GET writing its own artifact). The corrected
  contract is exactly TWO GETs per cycle: `/api/user-portfolios/<id>` (detail envelope) +
  `/api/user-portfolios/<id>/revisions`; revision from `portfolio.revision`, digest from
  `portfolio.provenanceDigest`, holdings count from the EMBEDDED `portfolio.holdings`.
- Fix in `06-w09-readpath-verify.ps1`: `Read-Cycle` now issues exactly two `Get-StlHttp` calls,
  preserves only `detail.json` + `revisions.json` verbatim, reads the embedded holdings from the
  detail envelope, drops the separate holdings GET/artifact and `HoldingsStatus` from the cycle
  output, and a missing/null embedded `portfolio.holdings` stays `$null` (never a silent empty
  collection / zero count). Synopsis/description and `07-W09.md` updated to the two-GET contract.
  All prior verification semantics preserved: two sequential cycles, revision + digest equality
  (boolean only, value never recorded), exactly-one-history-entry, capture-vs-API revision and
  holdings-count cross-check, read-only (no write verbs), New/Complete-StlExecution manifest
  envelope, PASS/FAIL/BLOCKED/INCONCLUSIVE vocabulary. Test expectations were NOT modified to fit
  the old implementation - the W09 contract suite (8 tests) now matches the corrected script.
- Validation (Arena static): 0 parser error nodes; exactly 2 `Get-StlHttp` in Read-Cycle; no
  holdings-route GET, no separate holdings artifact, no `HoldingsStatus`; W09-4/W09-7 contract
  assertions hold against the corrected source. Host runs required: main suite 33/33, W09 suite
  8/8. W09 runtime acceptance still requires the host execution evidence - not claimed here.

## 6t. W10 implementation corrected: env-file prerequisite removed, qualify POST gated + 2xx-only success (2026-11-25 directive)

- `07-w10-mapping-qualify.ps1` no longer uses `Get-StlEnvNamesFromEnvFile` and no longer checks
  `.env.local` for `IIPS_MARKET_DATA_TRANSPORT_URL`/`_TOKEN` (or any env name): the startup
  process establishes the runtime environment. The daemon availability check on `127.0.0.1:8791`
  alone decides daemon reachability for the optional leg (recorded as check `ipd-daemon-8791`).
- The qualification `POST /api/dhan/identity/qualify` is issued ONLY when all three gates pass:
  both W10 platform suites exit 0 (not timed out), the investment-coverage route returned HTTP
  200, and the daemon check passed (`$qualifyGateOk`). Any gate failure records the leg as
  NOT EXECUTED with the actual reason (`identity-qualify-leg` check + diagnostic + summary
  `qualifySkipReason`) and issues no POST. At most one POST attempt; no retries.
- HTTP success handling corrected: the response body is preserved verbatim
  (`identity-qualify-response.json`), the actual status recorded (`qualifyHttpStatus`), and the
  request is recorded as successful ONLY for 2xx (`$qualifySucceeded = ($q.Status -ge 200 -and
  $q.Status -lt 300)`, check `identity-qualify-succeeded -Ok $qualifySucceeded`). Non-2xx is
  captured-but-not-successful; success is never inferred from body or attempt. Captured vs
  succeeded vs attempted are separate recorded facts (`qualifyResponseCaptured`,
  `qualifySucceeded`, `qualifyCallMade`).
- PASS semantics preserved: the optional identity-qualify leg is excluded from the PASS
  aggregation — W10 PASS means the required mapping suites + evidence capture succeeded; it never
  implies W11 qualification. Default issuer `ISIN:INE009A01021:EQ` (Infosys/W11 dataset) and the
  AGI `ISIN:INE415A01038:EQ` option, the 53/115 authorised + 62 withheld census, and the negative
  sufficiency verdict as a valid outcome are all unchanged. No W11 changes.
- New contract suite `STL-SCRIPTS-W10.Tests.ps1` (10 static tests: parse, params, no-env-file,
  gate, single POST, 2xx success, non-2xx not-successful, no-retry, preserved semantics, AST
  safety). Executable discovery unchanged: still 17 executables — `*.Tests.ps1` classified
  separately, so the main suite stays 33 tests. Runbooks 08-W10.md updated.
- Validation (Arena static): parser 0 error nodes on script + test file; all 10 contract
  assertions emulated green; R1-R11 invariants re-checked on the edited script. Host runs
  (main 33/33, W09 8/8, W10 10/10, W10 runtime) still required — not claimed here.

## 6u. W10 test-file regex corrections (host Pester 5.7.1 run: W10 suite 7/10 — W10-6/W10-7/W10-9 failed on TEST-source regex defects, implementation NOT defective and unchanged)

- Host failure causes, all in `STL-SCRIPTS-W10.Tests.ps1` (the W10 implementation
  `07-w10-mapping-qualify.ps1` was not at fault and is byte-identical, sha256
  `A835C1BAFD2E79E802EB1931E78F23674A9C05FCDD2864ECD367BE175489E7BA`):
  - W10-6: one assertion pattern was DOUBLE-quoted (`"... -Ok \$qualifySucceeded"`), so
    `$qualifySucceeded` interpolated to empty and the regex ended in a lone backslash
    ("Illegal \ at end of pattern"). Fixed: single-quoted pattern with `''` doubling.
  - W10-7: the negative assertion `Should -Not -Match 'qualifySucceeded[^\r\n]*Body'` used
    case-INsensitive `-Match`, which false-matched the word "body" inside the check-detail
    comment on the same line as `$qualifySucceeded`. Fixed: case-sensitive
    `Should -Not -CMatch '\$qualifySucceeded\s*=\s*[^\r\n]*\$q\.Body'` — fails only if a
    success assignment ever reads `$q.Body`.
  - W10-9: the gate pattern was DOUBLE-quoted (`"if \(\$c\.Id ..."`), so `$c` interpolated
    and the regex became malformed ("Quantifier {x,y} following nothing"). Fixed: single-quoted
    pattern; plus an explicit guard that the It examines ONLY `07-w10-mapping-qualify.ps1`
    (`Split-Path -Leaf` = the W10 script; `$w10` never matches `*.Tests.ps1`).
- Rule reinforced in the file header: EVERY assertion pattern is single-quoted (`\$` stays a
  literal regex-escaped dollar); double-quoted patterns with `$` are forbidden; negative
  body-content assertions use `-CMatch`.
- Re-validation (Arena static): parser 0 error nodes on the test file; every Match/Not-Match/
  CMatch pattern in the edited file emulated against the W10 script — all green; 10 Its;
  POST call sites = 1, HTTP calls = 2, `$qualifySucceeded` assignments exactly
  `[$false, 2xx-gate]`; implementation sha256 unchanged. Expected host result: W10 10/10 with
  main 33/33 and W09 8/8 unchanged. Host run NOT yet performed — not claimed.

## 6v. W10 runtime qualify-request failure corrected (host execution STL-07-W10-20261126T082732Z: HTTP 400 INVALID_REQUEST "Qualify accepts isin, exchange, and symbol only.")

- **Authoritative schema:** `validateDhanIdentityRequest` in
  `frontend/server/market-data/dhanIdentityTransport.ts` accepts ONLY `isin`, `exchange`,
  `symbol` for `POST /api/dhan/identity/qualify` (exchange must be NSE/BSE). The old body
  `{"securityId":…}` was rejected 400 — the script was fixed, the API was not.
- **Authoritative values:** read at runtime from the served identities coverage route
  `GET /api/investment/coverage?asOf=` (preserved verbatim as `identities-route-response.json`):
  the item whose stored `securityIdentity.securityId` equals `-ResolvedSecurityId` supplies
  `raw.isin` / `raw.exchange` / `raw.symbol`. Exchange/symbol are never guessed or derived by
  parsing the securityId string. The POST body is now
  `{"isin":…,"exchange":…,"symbol":…}` and never carries a securityId field.
- **Gates preserved + extended:** POST issued only when suites exit 0 AND investment-coverage
  route = 200 AND daemon 8791 reachable AND issuer values found; otherwise recorded NOT EXECUTED
  with the actual reason, no POST. At most one POST, no retry, verbatim body capture, actual
  status recorded, success = 2xx only.
- **Aggregation fix (task 7):** the old blanket `identity-qualify*` skip let a failed
  `identity-qualify-succeeded` coexist with Result=PASS (failedCheckCount=1). Now only
  `optional-leg-*` bookkeeping checks are skipped; every other check is required, so a non-2xx
  qualify response makes PASS impossible. Unavailable-leg vs successful-call distinction kept.
- **Tests:** `STL-SCRIPTS-W10.Tests.ps1` updated (10 Its): request fields isin/exchange/symbol
  from the coverage response, no securityId in the body/POST line, 4-leg gate + not-executed
  reasons, exactly one POST, 2xx-only success, non-2xx not successful (case-sensitive -CMatch),
  no retry, aggregation (only `optional-leg-*` skipped; failed required check ⇒ non-PASS),
  census/verdict/envelope/vocabulary preserved. Platform suites rerun in Arena:
  mapping 16/16, qualification 34/34. Host Pester rerun pending — not claimed.

## 6w. W10 extraction corrected to the actual captured coverage-response shape (host STL-07-W10-20261126T105422Z: POST correctly withheld — issuer values not extracted)

- **Captured shape (authoritative):** the identities-coverage response uses LITERAL DOTTED
  property names — `raw['securityIdentity.securityId']`, `raw['securityIdentity.isin']`,
  `raw.symbol`, `binding.listingId`; it has NO nested `raw.securityIdentity`, NO `raw.isin`,
  NO `raw.exchange`. INFY row: securityId `ISIN:INE009A01021:EQ`, isin `INE009A01021`, symbol
  `INFY`, listingId `IN:NSE:INFY:EQ:EQUITY`.
- **Fix in `07-w10-mapping-qualify.ps1`:** match the item on the literal
  `raw['securityIdentity.securityId']` property; ISIN from `raw['securityIdentity.isin']`;
  symbol from `raw.symbol`; exchange resolved from `binding.listingId` by
  `Get-StlW10ExchangeFromListingId`, a script-local mirror of the canonical `parseListingId`
  (`iips-platform/src/investment/contracts/ids.ts`): exactly `IN:<EXCHANGE>:<SYMBOL>:<SERIES>:
  <INSTRUMENT>`, closed EXCHANGES (NSE/BSE) / LISTING_SERIES / INSTRUMENT_TYPES vocabularies —
  never guessed, never blindly split. All three values are validated (ISIN grammar
  `^[A-Z]{2}[A-Z0-9]{9}[0-9]$` cross-checked against the securityId ISIN segment, exchange
  NSE/BSE, symbol `^[A-Z0-9&\-]{1,32}$`) before the POST is permitted (gate leg d). The old
  `$raw.isin` / `$raw.exchange` accesses (always null on the captured shape) are gone.
- **Preserved:** four-part gate, one-POST/no-retry, verbatim response capture, actual status
  recording, 2xx-only success, `optional-leg-*`-only aggregation skip (failed required check ⇒
  non-PASS). No API change, no validation weakened.
- **Tests:** `STL-SCRIPTS-W10.Tests.ps1` now 11 Its; new W10-10 verifies the literal dotted
  property names against the actual captured fixture `tests/fixtures/w10/identities-route-item-infy.json`
  (provenance: STL-07-W10-20261126T105422Z) and functionally tests the script's OWN
  listing-ID parser (extracted via AST + `[scriptblock]::Create`): `IN:NSE:INFY:EQ:EQUITY`→NSE,
  two-part/unknown-prefix/unknown-exchange/unknown-series/unknown-instrument all rejected.
  Arena static: parser 0 error nodes; all 11 contract patterns emulated green; listing parser
  emulated 8/8; fixture extraction yields isin=INE009A01021 exchange=NSE symbol=INFY.
  Host Pester + single Windows W10 execution pending — not claimed.

## 7. Host-side script validation

`STL-SCRIPTS.Tests.ps1` (Pester) enforces the script rules on the laptop:
`Invoke-Pester .\STL-SCRIPTS.Tests.ps1`.
