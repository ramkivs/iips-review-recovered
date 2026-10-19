# IIPS v3.0 — G3-D4 Provisioning-Code Scope
## Program Authority decision record

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-G3-D4-PROVISIONING-CODE-SCOPE-PA-DECISION-2026-10-19-01` |
| Decision | `G3-D4` — whether bounded Gate A provisioning code is included in the implementation scope |
| Program Authority | Ramki, single owner/user and PA |
| Decision date | 2026-10-19 (UTC) |
| PA disposition | **`INCLUDE CODE` — APPROVED** |
| Decision source | Direct PA instruction in the execution request for this work; this is a PA decision, not an Arena recommendation |
| Governing request | IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`, §5.9/§6.1/§9, blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0` |
| Related decision | G3-D2 remains **B — `node:sqlite` — SELECTED AND APPROVED**; storage selection does not execute provisioning |

## 1. Rendered decision

> **G3-D4 — provisioning code: `INCLUDE CODE` — APPROVED.** The later bounded implementation scope may include the code required to provision the authorized local principal/binding and audit boundary within the IPD-owned persistence capability. Inclusion of code is distinct from, and does not authorize or perform, the one-time Gate A′ operator execution.

The code inclusion is limited to the persistence/provisioning boundary established by the current request. It does not create a second owner store, alter the certified IRR reference portfolio, introduce authentication/RBAC/tenant-directory capability, or promote any historical off-main implementation.

## 2. Exact separation from Gate A′ execution

The authoritative current Gate A′ record is:

- `evidence/np04/IIPS_v3.0_G2_IPD_GATE_A_PRIME_PA_DECISION_RENDERED_2026-10-17.md`
- decision ID `IIPS-V3-G2-IPD-GATE-A-PRIME-PA-DECISION-2026-10-17-01`
- status **`APPROVED`**, with rule **P-1 adopted**
- authorization: one bounded execution on the named Windows host `desktop-no0nhtp`, subject to the P-1 path and host conditions
- execution status: **`NOT EXECUTED`**

P-1 requires an absolute path outside Git worktrees, on local fixed NTFS, outside synchronized/temp/removable/network locations, writable without elevation, and absent before execution; a failed precondition stops the act. No Windows store, fixture, browser, localhost, operator-host or Gate A′ evidence is claimed here.

This D4 decision therefore means:

1. provisioning-related code may be included in the later exact Gate 3 file set;
2. the code must be bounded to the authorized A-2/A-3 persistence boundary and tested as specified by the later act;
3. the Windows operator must still perform the separately authorized Gate A′ act under P-1; and
4. no code inclusion is evidence that the operator act occurred or that any binding/store was created.

The older off-main Gate A execution records remain historical evidence of a different, local/off-main act. They are not Windows execution evidence, are not a current qualification baseline, and do not satisfy Gate A′.

## 3. Scope rule for the separate Gate 3 act

The current IPD request proposes `src/persistence/*` for connection/migrations/ledger/schema/transactions, `src/ipc/*` for endpoint/framing/dispatch/refusal mapping, an adapter alongside the existing portfolio port, and new tests T-A through T-J. It also protects `src/identity/*`, the existing `PortfolioStorePort`, the UI `SessionPortfolioStorePort`, and `SESSION_ONLY` labelling.

Those are request-level proposed areas, not a license to guess filenames or schemas. The separate Gate 3 act must name the exact IPD-main file set and tests, including the bounded provisioning code, before implementation begins. The act must preserve:

- IPD ownership of the user-portfolio domain and durable boundary;
- explicit owner/principal and tenant/company context, stable durable identity, auditability, lifecycle and reset/deletion obligations;
- the accepted Gate E W-1 guard and zero-effect refusal behavior; and
- the non-production, `SESSION_ONLY`/`durable:false`, IRR `503`, C8 `NOT MET`, Gate 4/5 and production boundaries.

## 4. Explicit non-effects

- Gate A′ is **not executed** and no Windows/operator evidence is supplied.
- No store, fixture, binding, endpoint, migration, or durable write is created by this record.
- No off-main Gate A/Gate B/G24 code is promoted, cherry-picked, re-pinned, or admitted as the implementation basis.
- No Gate 3 implementation authority, Gate 4 qualification, result acceptance, Gate 5 admission, 503 lift, release, or production authority is granted.
- G3-D2 is preserved exactly and is not reopened.

## 5. Evidence boundary

This is a code-scope decision only. The decision-complete Gate 3 package/act records the separate execution prerequisite and remains explicitly **not effective** until the exact IPD-main basis, file set, tests and other act prerequisites are rendered under the prescribed authority process.

*Rendered as a durable PA decision record; no operator execution is inferred.*
