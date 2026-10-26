# CAP-03 — PF-15 IPC Endpoint / Local-State Directory Designation: **Decision Request (PROPOSED — NOT EFFECTIVE; NO VALUE RENDERED)** (`2026-10-26`)

> ## STATUS: **DECISION REQUEST TO THE PROGRAM AUTHORITY — NOT A DESIGNATION.**
>
> No endpoint value, named pipe, or local-state directory is named, selected, defaulted or inferred
> in this record. PF-15 remains **`NOT DESIGNATED`**, exactly as the IPD host readiness packet
> (`IIPS-V3-CAP03-HOST-READINESS-PACKET-2026-10-24-01`, row PF-15), the H-12 R5 adoption act
> prerequisite table, and master-tracker §§16.123–16.126 record. This packet is authorized
> preparation/documentation under the standing F-3 §1.2 grant and the CAP-03 one-pass instruction;
> rendering the designation is a reserved PA act (the CAP-03 PA decision packet DQ-5 expressly
> reserves endpoint/local-state naming to a PA option A/B determination).

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-DECISION-REQUEST-2026-10-26-01` (census: `0` prior occurrences in IRR and IPD at publication) |
| Tracker registration | Master tracker §16.128; `CV-CORR-108`; `CHG-2026-10-26-04`; verification rows `V767`–`V778` |
| Record type | Decision request / preparation packet — **not** an authority act, not a designation, not an execution receipt |
| Corroborating record | CAP-02 matrix record `IIPS-V3-CAP02-QE-EXECUTION-MATRIX-2026-10-26-01` (§16.127.2) independently records PF-15 as `NOT DESIGNATED`, required pre-S3/QE and exempt for S2 — same disposition, no designation rendered by either workstream |
| Recorded (UTC) | `2026-10-26` |
| Governing locus | IRR `ramkivs/iips-review-recovered`; IPD inspected read-only at `8eec74ae…` and current `main@f5eddbc…` (`0` IPD writes) |
| Blocking item | Host readiness packet **PF-15** — required before `S3` host/runtime preflight and `QE-1…QE-11`; **not** required for `S2` or P-1 |
| Authority search evidence | `evidence/integration/cap03-one-pass-continuation-2026-10-26/03-pf15-authority-search.txt` |

---

## 1. The question put to the Program Authority

Under the adopted sequencing **`S2 → single P-1 → PF-15 → S3 → QE-1…QE-11`**, the PA must render,
before `S3`, the IPC endpoint/local-state configuration for the single-user, same-host IPD↔IRR
transport on `desktop-no0nhtp`. Concretely the designation must answer:

1. The **form and exact value** of `IIPS_G2_IPC_ENDPOINT` on Windows: either
   (A) an absolute named-pipe path under `\\.\pipe\`, or (B) a bare endpoint name resolved against a
   designated state directory.
2. If option B (or otherwise needed), the **absolute local-state directory** for
   `IIPS_G3_LOCAL_STATE_DIR`.
3. The relationship to `IIPS_G3_DATABASE_PATH`: the database path the IPC server opens is the
   P-1-provisioned store (selected at P-1 execution under the DQ-5 rule — absolute, non-existent
   before provisioning, outside every worktree, local fixed NTFS, non-synced). The PF-15 act should
   state whether it confirms that linkage or leaves the database path entirely to the P-1 record.
4. Evidence treatment: how the rendered values and their on-host verification (pipe existence,
   default DACL observation, collision refusal, one-connection cap, same-host-only refusal of any
   network target) are captured in the QE evidence deposit.

## 2. Exhaustive authority search — negative result

The full method and raw output are in `03-pf15-authority-search.txt`. Summary:

| Search | Result |
|---|---|
| Every `PF-15` occurrence, IRR at `main@c7fc7e40` and re-censused at post-advance `main@0329964` (PRs #287/#288; documentation/evidence-only) | only blocker/readiness statements; all say `NOT DESIGNATED` / required before `S3` (tracker §16.123.6, §16.125.3, §16.126.4, §16.127.2; CAP-02 reconciliation 2026-10-26; S2 blocker 2026-10-26); no rendered designation appears at either head |
| Every `PF-15` occurrence, IPD at pin `8eec74ae…` **and** `main@f5eddbc…` | exactly one occurrence: host readiness packet row PF-15 “**NOT DESIGNATED today; execution stops here until named**”; plus tracker/blocker restatements |
| Concrete pipe names / state-directory values in IPD evidence docs | none — the only `\\.\pipe\` strings are mechanism descriptions and the successor-act proposal, never a designated operational value |
| DQ-5 PA confirmation (`IIPS-V3-CAP03-DR2-DQ1-PA-DECISION-2026-10-25-01` §6) | confirms host/operator/runtime and the P-1 store-path *selection process* (execution-time choice, never pre-created/guessed) and consents to the one P-1 execution; **renders no endpoint/local-state value** |
| CAP-03 PA decision packet DQ-5 (`IIPS_V3_CAP03_PA_DECISION_PACKET_DQ1_DQ7_2026-10-24.md`) | endpoint/local-state naming is explicitly reserved to a PA option A/B act naming “host, operator, exact absolute store, endpoint/local-state and raw-evidence location” |
| GitHub code search (`PF-15` in both repositories) | `0` code hits; documentation-only references as above |

**Determination of this pass:** no existing authority designates PF-15. The decision is genuinely
unrendered, and the standing grant withholds value-selection of this kind (F-3 “value-selection
authority NOT EXERCISED”; DEC-06 R-2). Inventing a pipe name or directory would exceed preparation
authority and create an ungoverned configuration, so none is offered below as a default.

## 3. The implemented contract the designation must satisfy (source-verified at `8eec74ae…`)

The mechanism is complete and identical on both sides; the designation only fills operator
configuration that the code deliberately refuses to guess.

### 3.1 IPD server side — `src/ipc/endpoint.ts` (`resolveEndpointTarget`) and `src/ipc/entrypoint.ts`

- Startup order is fixed: validate → connect → migrate (`001`–`004`) → verify audit chain → bind;
  any fault returns a phase-coded outcome and creates no endpoint; no fallback/retry/downgrade.
- Required settings: `IIPS_G3_DATABASE_PATH` (must be an absolute path), `IIPS_G2_IPC_ENDPOINT`;
  `IIPS_G3_LOCAL_STATE_DIR` required only for a bare endpoint name.
- Accepted endpoint forms on `win32`:
  - **absolute** — must begin with `\\.\pipe\` (anything else throws `EndpointConfigurationError`);
  - **bare name** — must match `^[A-Za-z0-9._-]+$` (no `..`); with an absolute state directory it
    resolves to `\\.\pipe\<name>`. The pipe namespace is kernel-managed and non-persistent; the
    state directory is validated for absoluteness but is not part of the pipe path.
- Refused everywhere: URLs (`://`), `host:port`, relative paths, missing/blank values, a
  named-pipe path on POSIX or a POSIX socket path on Windows.
- Binding guarantees: same-host pipe namespace only — no TCP, HTTP or URL listener; fail-closed name
  collision via `FILE_FLAG_FIRST_PIPE_INSTANCE`; one-connection capacity cap; default pipe DACL
  (libuv binds with NULL security attributes) — DACL behavior is explicitly host-only evidence.

### 3.2 IRR client side — `frontend/server/user-portfolio/ipcClient.ts` (`resolveIpcEndpoint`)

- Byte-parallel resolver rules and refusal vocabulary (`ENDPOINT_NOT_CONFIGURED`); same two forms;
  on Windows a bare name resolves to `\\.\pipe\<name>`; configuration is read **per call**, never
  cached (OC-5); no default endpoint and no network fallback.
- The endpoint name is **not a credential**: IPD resolves the owner from its single ACTIVE A-2
  binding on every request (OC-2). The separate IRR precondition
  `IIPS_G3_IPC_BINDING_PROVISIONED` (`ownerContextFromBinding.ts:225`) defaults false; only test
  fixtures set it true — PF-15 does not flip it.

### 3.3 Consequences for a valid designation

A rendered PF-15 act should therefore contain, at minimum:

| # | Required content | Constraint from the code/acts |
|---|---|---|
| 1 | Chosen form: absolute `\\.\pipe\…` path **or** bare name | bare-name charset `[A-Za-z0-9._-]`; absolute form must live under `\\.\pipe\` |
| 2 | Exact endpoint string recorded verbatim | no normalization; same string used by IPD bind and IRR client; no URL/host:port/relative form |
| 3 | If bare name: absolute `IIPS_G3_LOCAL_STATE_DIR` | absolute, local fixed NTFS, outside every Git worktree, non-synced, operator-writable without elevation |
| 4 | Relationship to `IIPS_G3_DATABASE_PATH` / the P-1 store | confirm the provisioned P-1 store is the opened database, or expressly defer to the P-1 record |
| 5 | Relationship to the external evidence root | endpoint/state/db paths recorded verbatim in `MANIFEST.json`; paths are operator paths, not secrets; no credentials in artifacts |
| 6 | Host verification instructions for QE | pipe collision refusal, default-DACL observation, one-connection cap, same-host-only behavior, clean-shutdown disappearance, per-call config reads |
| 7 | Locus and effectiveness | rendered PA act, published with green CI and remote read-back in the governing locus; any later change is a new act (drift = STOP) |

## 4. Options presented for determination (no recommendation asserted as a decision)

- **Option A — absolute named pipe.** Designate a full `\\.\pipe\<name>` string; no state directory
  is needed for endpoint resolution. Fewer moving settings; the pipe path is explicit in every
  transcript. The name still must obey the bare-name-safe character set in practice and must not
  collide with existing pipes (first-instance collision is fail-closed by design).
- **Option B — bare name plus designated local-state directory.** Designate a bare
  `IIPS_G2_IPC_ENDPOINT` and an absolute `IIPS_G3_LOCAL_STATE_DIR`; on Windows the resolver maps the
  pair to `\\.\pipe\<name>` while the directory also serves as the anchored local-state location.
  Mirrors the two-setting design already coded and tested on both sides; introduces one extra
  absolute path whose NTFS/sync/elevation properties must be evidenced.

Either option is compatible with the shipped resolvers; the choice is a PA value-selection act, not
a technical fork — both code paths already exist and are covered by tests. This packet deliberately
does not rank them into a rendered outcome, and supplies no candidate strings.

## 5. Boundary and non-grants

This request does not designate PF-15; name any pipe, directory or database path; start `S3` or any
QE item; change `IIPS_G3_IPC_BINDING_PROVISIONED`; open an endpoint; alter source, tests, package
manifests, pins, routes or fences; write to IPD; consume P-1; or move any gate. PF-15 stays
`NOT DESIGNATED` until the PA renders an act satisfying §3.3, published and remotely read back.
Until then `S3`/QE remain blocked on this item in addition to the host/P-1 chain, and `S2` remains
the single next executable action (which does not depend on PF-15).

*End of `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-DECISION-REQUEST-2026-10-26-01` — PROPOSED, NOT EFFECTIVE; PF-15 NOT DESIGNATED.*
