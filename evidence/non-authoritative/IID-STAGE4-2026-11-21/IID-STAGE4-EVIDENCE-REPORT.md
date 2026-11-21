# IID Stage 4 Windows Verification — Evidence Report

**Evidence date:** 2026-11-21  
**Repository:** `C:\iips-worktrees\IID-current-main`  
**Commit:** `6254399777b1877bfb3634bf8d4ba2769678d002`  
**Scope:** local, single-user, non-production verification only.

## Executive result

Stage 4 host verification was executed and produced useful evidence, but **Stage 4 is not fully accepted**.

- §2–§7 produced host/runtime, HTTP and browser observations.
- §8 independent read-back **FAILED** with `OWNER_CONTEXT_UNAVAILABLE`; independent persistence agreement was not established.
- §9 shutdown check **PASSED** (`HTTP 000` after stop).
- §10.2b–§10.4 confirmed the installed identity set is the approved three-issuer set and all three issuers are `ELIGIBLE`.
- §10.2a product verifier returned `VERIFY-FAIL` solely because the `tsx` runner was absent; its provisioner and resolver probe did not run.

No identity set was provisioned, created, deleted, normalized or modified during this verification. No SQLite database was inspected. No alternate store was tried.

## Evidence register

| Procedure section | Evidence included | Result | Notes |
|---|---|---|---|
| §2.1 checkout | `01-checkout.txt` | Recorded | Clean IRR checkout, commit and Node version as supplied. |
| §2.2 environment names | `02-environment-names.txt` | Recorded | Names only. This is the pre-start shell snapshot, not the later service-process environment. |
| §3 readiness | `source-captures/03-readiness.*` | `READ-PATH READY: NO`; strict exit 1 | Eight findings captured. Reports owner context, NP-04 DB path, F-3 owner carrier, IPD binding, IPC endpoint and local personal-use setting were absent in that diagnostic shell. Identity files validated; dataset directory present but content unverified. Readiness was read-only. |
| §4 transport/runtime | `04-runtime-status.txt` | Runtime observed healthy | Five processes, four loopback listeners, named pipe present. Pipe presence does not prove IPC request/response. No live Dhan credentials or vendor connection. |
| §5 frontend | `05-frontend-status.txt` | HTTP 200 | Frontend 5176 is the established host port; procedure's 5173 was adapted without changing the host port. |
| §6 HTTP routes | `06-http-status.txt` | 10/10 HTTP 200 | Statuses were supplied in the conversation. Complete current-date raw bodies for every route were not all separately preserved as files. |
| §7.1 discovery | `07-ui-observations.txt` and current browser page capture | Observed | Infosys, Marico, KEC and Infosys CIN/ISIN searches resolved to the expected issuer IDs. UI terminology differed from procedure labels. |
| §7.2 assessment | `source-captures/Pasted markdown(20261121-125838).md` | Browser rendered one stored version | Report ID and payload digest recorded. Assessment is 959 days stale, confidence 0.3210, and valuation/MoS were withheld. Not an investment-readiness claim. |
| §7.3 identity coverage | `source-captures/Pasted text(20261121-130006).txt` and `...130301.txt` | Rendered, substantive failure | 0/65 assessed; 65 unresolved; 0 resolved. AGI ISIN is outside roster; most rows lack usable identifiers. AIIL appears in detail table but not headline/source counts. |
| §7.4 investment coverage | `source-captures/Pasted text(20261121-130301).txt` plus `07-ui-observations.txt` | Rendered | 3/3 issuers covered; 3/13 sectors measured; 10 unmeasured. Operator-supplied dataset; rights are OPERATOR_ASSERTED, not independently verified. |
| §7.5 JS-free pages | Current rendered-page captures | Rendered | Investment coverage agrees with §7.4; identity coverage renders the unresolved report. AIIL table/count mismatch retained as finding. |
| §8 independent read-back | `08-chain-readback.txt` | **FAILED** | `OWNER_CONTEXT_UNAVAILABLE`; no report ID, version count or payload digest returned. No persistence agreement with browser result. |
| §9 shutdown | `09-stop-check.txt` | **PASS** | `HTTP 000` after transport stop. |
| §10.2a product verifier | `09-verify-only-transcript.txt` | `VERIFY-FAIL` — prerequisite unavailable | Missing `iips-platform\node_modules\tsx\dist\cli.mjs`. Provisioner exit code not run; resolver probe not run. No mutation. |
| §10.2b file inspection | `09-identity-counts.txt` and verifier transcript | Complete | Three issuers, three securities, five listing entries, zero corporate actions. Roster file 1,992 bytes with recorded SHA-256. |
| §10.3 installed set | Verifier transcript | Matches three-issuer O1 candidate | `eligible-roster.json` SHA-256 `08a5d29cbc6ba01729d4c05488d98ec89ff4027825f51ae5e3bd1a683140ef24`, 1,992 bytes. Not the 2,388-issuer P04 export. |
| §10.4 O1 membership | `09-o1-membership.txt` | **PASS 3/3** | Infosys, Marico and KEC found by governed CIN/ISIN and marked ELIGIBLE. |
| §10.5 wider population | §10.3 evidence | Not applicable | Installed roster is the three-issuer O1 set, not the wider 2,388 population. |

## Key observed values

### Runtime
- IRR checkout commit: `6254399777b1877bfb3634bf8d4ba2769678d002`.
- Node: `v24.14.0`.
- Frontend: `127.0.0.1:5176`.
- IPD shell: `127.0.0.1:5174`.
- IRR transport: `127.0.0.1:8787`.
- IPD market-data: `127.0.0.1:8791`.
- PID manifest: `H:\IIPS\logs\iips-pids-20261121-180959.json`.
- Named pipe `\\.\pipe\iips-user-portfolio-v1` was present; successful IPC exchange was not established by pipe presence alone.

### Infosys assessment chain
- Scope: `co:IN:CIN:L85110KA1981PLC013115`.
- Report ID: `6b6e2316-d958-4187-9700-c47984a9a10a`.
- Version count in browser: `1`.
- Payload digest: `f80c25de6025aa6e38f64b6b303d78b4a5657ef39a44c863c625b0041f683084`.
- Dataset digest: `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`.
- Data as of: `2024-03-31`; known as of `2026-11-14`; staleness `959` days.
- Adequacy `SUFFICIENT`; quality `MATERIAL_CONCERNS`; confidence `0.3210`; required-field coverage `1.0%`.
- No intrinsic range and no margin of safety because no price observation was available.

### Identity set
- Roster label: merged from the three operator-supplied Infosys, Marico and KEC source sets.
- `eligible-roster.json`: 1,992 bytes; SHA-256 `08a5d29cbc6ba01729d4c05488d98ec89ff4027825f51ae5e3bd1a683140ef24`.
- Counts: 3 issuers, 3 securities, 5 listing entries, 0 corporate actions.
- All three O1 issuer IDs found and `ELIGIBLE`.

## Findings that must remain open

1. **§8 owner context:** The independent CLI failed with `OWNER_CONTEXT_UNAVAILABLE`. The browser's successful display does not substitute for the separate process read-back. This is the primary unresolved Stage 4 persistence finding.
2. **Identity coverage:** All 65 observed holding rows were unresolved. A valid AGI ISIN was outside the three-issuer roster; most other rows lacked usable identifiers.
3. **AIIL count mismatch:** The detailed identity table includes a manual AIIL row while headline/source counts remain 65. Preserve this discrepancy; do not silently reconcile it.
4. **Product verifier limitation:** `tsx` missing from the active checkout prevented the repository verifier and resolver probe. No installation command was run.
5. **Dataset/rights:** Dataset is operator-supplied and non-redistributable; source rights are operator-asserted, not independently verified. Investment coverage is not valuation qualification.
6. **Dhan:** Market-data daemon was available, but credentials/vault/provider were unconfigured and vendor egress disabled. No live Dhan connection is claimed.

## Evidence provenance and limitations

- Files under `source-captures/` are the exact user-provided procedure, topology reference, readiness captures, startup script and rendered page captures copied into this package.
- Section transcripts (`01`–`09`) consolidate outputs supplied directly in this conversation. They are explicitly labelled as conversation-preserved records; they are not represented as original console log files where no original file was supplied.
- Earlier `.out` files from 17 November are not substituted for 21 November response bodies.
- The Stage 2 readiness capture describes the shell in which it ran before the later multi-service startup. Its missing environment variables must not be treated as proof that the later service process lacked those settings.
- No new runtime tests were run while assembling this evidence package.
- The package does not include or redistribute the operator-supplied financial dataset.

## Overall disposition

**Stage 4 evidence assembled; acceptance not complete.** The principal outstanding acceptance item is §8 independent read-back. The Stage 4 identity-set checks confirm the three-issuer O1 roster, but the product resolver probe remains unverified because the `tsx` runner was unavailable.
