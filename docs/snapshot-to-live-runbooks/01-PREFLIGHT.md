# Runbook 01 — Sequence 0: Master preflight

**Script:** `tools/windows/snapshot-to-live/00-preflight.ps1`

## 1. Objective
Verify Windows environment, repository availability, required services/servers/ports,
configuration names and input files, and establish the `G:\IIPS-Evidence` root — before any
workstream execution.

## 2. Repository locations
IRR `C:\tmp\iips-review-recovered`; IPD `H:\IIPS\iips-production-market-data`; evidence
`G:\IIPS-Evidence`. The script records both repos' git HEAD + dirty flag (IPD HEAD is
host-observed metadata only — the IPC service attests no build on the wire).

## 3. Input identification
- IRR `.env.local` (names only are read): `IIPS_G2_IPC_ENDPOINT`, `IIPS_G3_IPC_BINDING_PROVISIONED`
  (mandatory); `IIPS_MARKET_DATA_TRANSPORT_URL`, `IIPS_MARKET_DATA_BASE_URL`,
  `IIPS_MARKET_DATA_TRANSPORT_TOKEN`, `IIPS_REPORTS_OWNER_PATH`, `IIPS_NP04_DATABASE_PATH` (per-step).
- Actual-issuer bundle: `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/{dataset,identity}`.
- Any prior `CONSISTENT_CAPTURE` summary under the evidence root or `%LOCALAPPDATA%\IIPS\w11-dep1-capture`.

## 4. Prerequisites
None. Everything is inspected, nothing is started or modified.

## 5. Runtime requirements (inspected, not started)
IRR API `:8787` (`/api/health` → `200 {"status":"ok",...}`); UI `:5173`; IPD daemon `:8791`;
named pipe `\\.\pipe\iips-user-portfolio-v1`; ≥1 process with `ipc\entrypoint.js` in its command line.

## 6. Startup instructions (for the services preflight checks — run before preflight)
```powershell
# IPD G3 IPC provider, in H:\IIPS\iips-production-market-data (Node >= 22.13):
$env:IIPS_G3_DATABASE_PATH = 'C:\iips-data\iips\user-portfolio.sqlite'
$env:IIPS_G2_IPC_ENDPOINT  = '\\.\pipe\iips-user-portfolio-v1'
# <IPD provider start command per IPD operator instructions>
# IPD market-data daemon (needed by steps 04/07):
#   npm run start:market-data-daemon        # loopback 127.0.0.1:8791
# IRR API:
cd C:\tmp\iips-review-recovered\frontend; npm run server:dev    # :8787
# IRR UI (needed by step 12):
npm run dev                                                       # :5173
```

## 7. Basic checks (performed by the script)
`node --version` (≥22; IPD provider needs ≥22.13), `git --version`, `python3 --version`,
OS caption, PowerShell version, repo presence + HEAD, `frontend\node_modules` present
(else `npm ci` in `frontend/`), G: drive writable + free space, env names present, the four
service probes above, prior-capture availability.

## 8. Execution procedure
```powershell
cd C:\tmp\iips-review-recovered\tools\windows\snapshot-to-live
powershell.exe -NoExit -ExecutionPolicy Bypass -File .\00-preflight.ps1
```

## 9. Scripts / invocation
`00-preflight.ps1` (params: `-EvidenceRoot -IrrRoot -IpdRoot -ApiBaseUrl -UiBaseUrl -IpcPipeName -DaemonPort -TimeoutSeconds`, all with the defaults in the README).

## 10. Expected output
`RESULT [PASS|FAIL|BLOCKED] STL-00-PREFLIGHT-<utc> ...` on the console plus the package under
`G:\IIPS-Evidence\snapshot-to-live\00-preflight\<id>\` and `consolidated\latest-00-PREFLIGHT.json`.

## 11. Evidence capture
`execution.json`, `checks.json`, `result.json`, `output\optional-gaps.txt`, `manifest.json`,
`manifest-verify.json`.

## 12. Evidence validation
`manifest-verify.json` (sealed at completion); re-verify any time with
`.\Verify-StlEvidenceManifest.ps1 -EvidenceRoot 'G:\IIPS-Evidence' -All`.

## 13. Result classification
PASS = all mandatory checks pass (optional gaps listed per step); FAIL = mandatory check failed;
BLOCKED = G: evidence root unavailable.

## 14. Downstream impact
PASS establishes execution readiness for steps 01–12. Optional gaps map to specific steps:
daemon 8791 + market-data names → 04 (W06), 07 (W10 qualify leg); UI 5173 → 12 (W17);
reports names → 02 (W03 reports leg), 10 (W15), 11 (W16 W15 leg).

## 15. Unsuccessful / unavailable evidence
If G: is unavailable every later step reports BLOCKED (nothing can be persisted) — re-run 00
after the drive is mounted. If the G3 pipe is absent, steps 01/02/06 report BLOCKED with
resumeRequirement "start the IPD G3 IPC provider…". If no prior capture exists, steps 02/06
run a fresh read-only capture; if that fails with exit 10/11, the resume requirement is a
running, bound provider (B02-class host access).
