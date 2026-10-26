# CAP-03 / CAP-02 — PF-15 IPC Endpoint and Local-State Designation: **PA Decision Act** (`2026-10-26`)

> **STATUS: PA DECISION RENDERED. EFFECTIVE ONLY UPON PUBLICATION TO IRR `main`, GREEN EXACT-HEAD AND POST-MERGE CI, AND INDEPENDENT REMOTE READ-BACK.** This is the distinct value-bearing act, not the prepared instrument or the upstream decision request. It authorizes only the PF-15 designation stated here. It does not authorize implementation, P-1, S3, QE execution, acceptance, admission, or production operation.

| Field | Value |
|---|---|
| **Act ID** | `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-01` |
| **Decision-maker** | Ramki — sole owner/user and Program Authority (PA) |
| **PA instruction** | The PA's explicit F1–F6 determinations supplied in the Arena execution directive dated `2026-10-26`; values below are transcribed as approved, not inferred from code or prior proposals. |
| **Governing locus** | `ramkivs/iips-review-recovered`, `refs/heads/main` (effectiveness subject to the publication conditions above) |
| **Prepared instrument** | `docs/integration/IIPS_v3.0_CAP03_PF15_PA_DECISION_ACT_PREPARED_2026-10-26.md`, ID `IIPS-V3-CAP03-PF15-PA-DECISION-ACT-PREPARED-2026-10-26-01` |
| **Preserved upstream request** | `docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_DECISION_REQUEST_2026-10-26.md`, ID `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-DECISION-REQUEST-2026-10-26-01`; not amended by this act |
| **Decision scope** | Shared CAP-03 + CAP-02 Gate 4 S3/QE host boundary on `desktop-no0nhtp`, as established by the repository records cited in §3 |

---

## 1. PA determinations — all six fields rendered

| Field | PA determination (verbatim value where applicable) | Disposition |
|---|---|---|
| **F1 — endpoint design** | **Option A — explicit Windows named-pipe endpoint.** Use the explicit named-pipe namespace; do not use a state-directory-derived resolution mechanism. | **RENDERED** |
| **F2 — `IIPS_G2_IPC_ENDPOINT`** | `\\.\pipe\iips-user-portfolio-v1` | **RENDERED — exact literal preserved** |
| **F3 — `IIPS_G3_LOCAL_STATE_DIR`** | **`N/A`** for Option A; this setting is not used for endpoint resolution. No state-directory requirement is inferred. | **RENDERED**, subject to the condition that no independently established S3/QE contract requires this variable for another purpose. If such a requirement is discovered, stop before execution and obtain a new PA act; do not silently substitute a directory. |
| **F4 — `IIPS_G3_DATABASE_PATH` / P-1 `$StorePath`** | `C:\iips-data\iips\user-portfolio.sqlite` | **RENDERED as intended stable path** for the single P-1 store and subsequent S3/QE. It must be absolute, local fixed NTFS, and outside every worktree. The database, `-wal`, and `-shm` sidecars must not exist before the authorized P-1 attempt. Host properties and absence are **NOT VERIFIED by this repository act**. If any store or sidecar already exists, stop: do not overwrite, delete, reset, or reuse it without the required authority. |
| **F5 — external `$EvidenceRoot`** | `C:\iips-evidence\cap03-gate4` | **RENDERED as intended Gate 4 evidence root.** It must be local fixed NTFS, outside Git worktrees and cloud-synchronized locations, and separate from the completed S2 root `C:\iips-evidence\cap03-s2`. Host properties are **NOT VERIFIED by this repository act**. Do not modify, move, or invalidate the S2 evidence or manifest. |
| **F6 — scope** | **Shared CAP-03 + CAP-02 scope** for the relevant same-host IPC and IPD persistence boundary on `desktop-no0nhtp`. | **RENDERED**; the repository evidence for the shared boundary is summarized in §3. |

### 1.1 Stable-value and drift rule

The F2, F4, and F5 strings above are the approved values. Record them without path normalization in applicable host transcripts and `MANIFEST.json`. Keep F4 stable across the P-1, S3, and applicable QE sequence. A change to F1–F6 requires a new PA act before dependent execution. Any unexpected value drift is `STOP`; technical compatibility is not permission to substitute a value.

## 2. Resolver compatibility and decision validation

The current IRR resolver `frontend/server/user-portfolio/ipcClient.ts` (`resolveIpcEndpoint`) and the read-only current IPD resolver `src/ipc/endpoint.ts` (`resolveEndpointTarget`) accept an absolute Windows path under `\\.\pipe\` as a `windows-named-pipe` target with `source: 'absolute-path'`. The exact F2 value is absolute under Node's `path.win32`, has the required pipe namespace prefix and flat single-name form, and contains no whitespace, URL scheme, `host:port`, or `..` segment. Both resolvers return the supplied absolute target verbatim and do not require or read `IIPS_G3_LOCAL_STATE_DIR` for this form. This validates compatibility; it does not prove the pipe is free or running on Windows.

The following design constraints are retained from the bilateral implementation and governing records; their operational Windows behavior remains subject to designated-host verification:

- **Collision safety:** first-instance protection (`FILE_FLAG_FIRST_PIPE_INSTANCE` or the established equivalent) and `EADDRINUSE`/collision refusal remain fail-closed. Do not connect to, replace, or silently reuse an unexpected existing pipe.
- **Pipe security:** retain the platform default restrictive pipe DACL. Do not pass or enable broad `readableAll` or `writableAll` access.
- **Capacity and transport:** retain `maxConnections = 1`; bind only the local named-pipe path; introduce no TCP, HTTP, URL, or other network listener.
- **Lifecycle and client discipline:** designated-host S3/QE evidence must verify pipe disappearance after clean shutdown and the established per-call client configuration/read/release behavior. The resolver is read per call; no default, network fallback, or retry is introduced.
- **Write and route fences:** this act changes no implementation or authorization predicate. Preserve `WRITE_NOT_AUTHORIZED`, all existing `/api/user-portfolios*` HTTP `503` fences, and `durable: false` until separate governed acceptance/admission authorizes any change.

## 3. Shared CAP-02 / CAP-03 scope evidence (F6)

F6 is supported by repository-verifiable architecture records, not by an assumption that separate product labels imply separate infrastructure:

1. `docs/integration/IIPS_v3.0_CAP02_HOST_COMPOSITION_AND_TRANSPORT_READINESS_2026-10-23.md` §4.1 identifies the existing IRR same-host IPC client (`frontend/server/user-portfolio/ipcClient.ts`) and IPD `src/ipc/**` / `src/persistence/**` as the persistence boundary; §5 states the CAP-02 transport is over the **existing same-host v1 IPC endpoint**.
2. `docs/integration/IIPS_v3.0_CAP02_HOST_BOUNDARY_AND_IMPLEMENTATION_ACT_2026-10-23.md` identifies IPD as persistence/IPC owner and CAP-02's host-to-persistence transport as the existing same-host IPC client, with no new listener.
3. `docs/integration/IIPS_v3.0_CAP02_HOST_EXECUTION_RUNBOOK_AND_EVIDENCE_STRUCTURE_2026-10-26.md` places CAP-02 Gate 4 work on the same designated Windows host and sequences the same S2/P-1/PF-15/S3/QE boundary.
4. The bilateral resolver records establish that IRR and IPD resolve the same `IIPS_G2_IPC_ENDPOINT` setting and use the same local IPC transport contract.

**F6 finding:** These sources establish a shared host IPC/persistence boundary for the scope named in this act. The approved Option A endpoint therefore governs both CAP-03 and CAP-02 Gate 4 S3/QE use of that boundary on `desktop-no0nhtp`. This is a configuration designation only; it does not admit either workstream or authorize an operation.

## 4. Store and evidence handling

- **P-1 path:** F4 names the intended one-time `$StorePath`. The PA act does not claim the path's parent filesystem characteristics or that the DB/sidecars are absent. Those facts must be checked on the designated host under the governing P-1 procedure immediately before execution. If the DB or sidecars exist, stop without mutation.
- **P-1 authority:** PF-15 does not grant or consume P-1. Follow the separate effective Gate A′ successor act and all prerequisites. **P-1 execution remains NOT AUTHORIZED** while that separate act's identity-value or other authorization prerequisites remain unresolved. An unspent attempt is not by itself execution authorization.
- **QE-8:** preserve the effective `RV-1` Option A disposable-copy boundary. QE-8 may use only the byte-verified disposable copy and must not mutate the authoritative F4 store.
- **Evidence root:** use F5 only after the designated operator verifies its host-side properties. Keep it outside every Git worktree and cloud-synchronized location, and separate from the S2 evidence root. Record F1–F6 and the actual run facts verbatim in the Gate 4 manifest. Do not put credentials, secrets, or real portfolio data in evidence.
- **S2 evidence:** this act does not modify or invalidate `C:\iips-evidence\cap03-s2` or its reported verified manifest.

## 5. Execution order, effectiveness, and non-grants

The established sequence remains: completed S2 evidence → any separately authorized single P-1 run → effective PF-15 designation → S3 preflight → QE-1…QE-11 (with QE-8 on a disposable copy) → separate acceptance acts → separate Gate 5 decision. P-1 and PF-15 are distinct prerequisites; this act does not relax their order or other host prerequisites.

This distinct PA act becomes effective only after publication to IRR `refs/heads/main` by the established PR process, green exact-head CI, regular merge, green post-merge `main` CI, and independent remote GitHub object/blob and content-completeness read-back. Until those conditions are satisfied, it is rendered but not effective. After effectiveness, it establishes only the PF-15 configuration designation. It does **not**:

- authorize implementation changes, the P-1 execution, S3, QE-1…QE-11, or any separate acceptance/admission;
- assert that the Windows host, environment variables, endpoint collision state, filesystem, database absence, or evidence-root properties have been inspected;
- change the approved baseline pin, code, routes, write gates, fences, `durable: false`, or any production/non-production qualification;
- authorize credentials, multi-user support, authentication/RBAC, network services, or real portfolio data in evidence.

Any later value change requires a new PA act. If F4/F5 host checks fail or any resolver/contract incompatibility is found before use, stop and return for a distinct authority disposition; do not amend the upstream request or silently substitute values.

*End of `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-01` — rendered by the PA; effective only after the specified publication and read-back conditions.*
