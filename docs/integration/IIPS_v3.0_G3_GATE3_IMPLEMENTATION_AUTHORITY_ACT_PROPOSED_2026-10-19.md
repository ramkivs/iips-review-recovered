# IIPS v3.0 — Gate 3 implementation-authority act
## Proposed, decision-complete form — **NOT EFFECTIVE**

> **Authority warning:** This document is a prepared act form and reconciliation artifact. It is not a rendered/effective Gate 3 implementation-authority act. It grants no permission to modify IPD or IRR application code. The five G3-D3–G3-D7 PA decisions are recorded separately; they must not be conflated with this act.

| Field | Value |
|---|---|
| Act ID | `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-01` |
| Act type | Gate 3 implementation authority, repository-local and cross-repository bounded |
| Status | **PROPOSED — NOT EFFECTIVE / NOT GRANTED** |
| Prepared date | 2026-10-19 UTC |
| PA decision inputs | G3-D2 B (`node:sqlite`) and G3-D3 `3b`, D4 `INCLUDE CODE`, D5 `REFERENCE ONLY`, D6 `CONFIRM`, D7 `ACCEPT WITH CHANGES` |
| Decision records | `docs/integration/IIPS_v3.0_G3_D2_STORAGE_TECHNOLOGY_PA_DECISION_2026-10-19.md`; G3-D3 through G3-D7 records in `docs/integration/` |
| Governing implementation request | IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`, blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0` |

## 1. Purpose and non-inference

This act form translates the settled PA dispositions into the exact fields required before implementation authority could become effective. It is intentionally conservative:

- a PA scope/architecture disposition is not implementation authority;
- implementation authority is not Gate A′ execution;
- Gate 3 CI is not Gate 4 qualification;
- Gate 4 result acceptance is not Gate 5 admission; and
- Gate 5 admission is the only later act that can lift the named IRR `503` operations.

No code has been authored, enabled, executed, qualified, admitted or released by preparing this form.

## 2. Required authority decision and current result

A valid act must be rendered through the prescribed authority process with the exact repository, immutable IPD-main basis, bounded file set, tests, dependencies, restrictions, prerequisites and acceptance evidence. This form has all settled PA dispositions and the bounded IRR consumer scope, but the IPD request still marks its implementation paths and tests as **proposed**. The exact IPD file/test set is therefore **not pinned**, and this act is not effective.

The missing exact set is a genuine authority blocker. No filename, schema, property, API, migration, runtime version or dependency may be inferred to make the act appear complete.

## 3. Repository and immutable-basis fields

| Authority field | Prepared value | Effect |
|---|---|---|
| IPD repository | `ramkivs/iips-production-market-data` | repository named |
| IPD branch/basis | `refs/heads/main` | main-line re-authoring required by G3-D0/G3-D1 |
| IPD `main` observed at preparation | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` | read-only evidence snapshot; must be re-resolved and re-pinned when the act is rendered |
| IRR repository | `ramkivs/iips-review-recovered` | repository named |
| IRR branch/basis observed | `refs/heads/main` at `f9a9c006230d4bfb6ab68f358eb330e2af53c838` | read-only evidence snapshot; no application change authorized |
| Historical off-main bases | Gate A/Gate B/G24 lineages, including the D5 historical line | **reference only; prohibited as the admitted G3 base** |

A floating `main` label, a superseded IPD SHA, or an off-main line cannot satisfy the basis field. If either repository advances before a valid act is rendered, this table and all file/test evidence must be re-resolved.

## 4. Exact scope that the act would authorize if rendered effective

### 4.1 IPD — exact file set is not yet pinned

The current G3 request §6.1 proposes, but does not fix, the following areas:

- `src/persistence/*` — connection, migrations, ledger, schema and transactions;
- `src/ipc/*` — same-host endpoint, framing, dispatch and Class P/A refusal mapping;
- an additive durable adapter alongside the existing `PortfolioStore`/portfolio capability;
- new tests T-A through T-J; and
- `package.json`/lockfile only if a separate, explicit requirement for the selected `node:sqlite` technology/runtime/type toolchain is named.

The accepted request says the Gate 3 act fixes the exact list. This proposed form does **not** convert those globs into exact authority. The field remains:

> **IPD exact file set: UNPINNED — implementation authority withheld.**

The future exact list must preserve `src/identity/*`, the existing portfolio port and the UI `SessionPortfolioStorePort`/`SESSION_ONLY` label unless a separately rendered scope decision says otherwise. It must extend, not duplicate or replace, the IPD-owned portfolio capability. It must include the D3 default-disabled W-1 gate and the D4 bounded provisioning code if those paths are in the final file list.

### 4.2 IPD — proposed tests to be fixed by the act

The request-level test obligations are listed below. They are not yet an exact executed test command or a Gate 3 result:

| ID | Required coverage | Result required for a future Gate 3 acceptance |
|---|---|---|
| T-A | Oversize (>64 KiB), malformed, `v != 1`, unknown operation and pipelined frames | Class P refusal, zero bytes, connection closed |
| T-B | Each caller-authority and C7 key at top level and in options | refusal, zero bytes, no store access |
| T-C | Zero/two/malformed/`REVOKED` binding or membership | refusal, no owner disclosure |
| T-D | Missing, foreign and tombstoned portfolio reads | indistinguishable `RESOURCE_UNAVAILABLE`, no identifiers |
| T-E | Unverified migration, store fault and endpoint-name collision | no endpoint; non-zero process exit |
| T-F | No TCP, HTTP or URL listener from IPD | verified by test |
| T-G | `3b` default-disabled writes and each missing W-1 condition | `WRITE_NOT_AUTHORIZED`/applicable refusal and zero database row delta |
| T-H | `SESSION_ONLY`/`durable:false` session vocabulary; durable vocabulary only after durable commit | verified by test |
| T-I | Existing `bi07_*` store-port tests | unchanged and passing |
| T-J | IRR six route paths/twelve route-method pairs | all remain HTTP 503; boundary never calls the port |

The act must name the actual paths/commands and record counts, zero failures and the named commits. No current run is claimed.

### 4.3 IRR — bounded consumer set from G3-D7

If and only if a valid act includes the IRR side, its exact bounded consumer set is:

**Implementation and tests:**

- `frontend/server/user-portfolio/ipcClient.ts`;
- `frontend/server/user-portfolio/ownerContextFromBinding.ts`;
- `frontend/server/user-portfolio/ipcPortAdapter.ts`;
- `frontend/server/user-portfolio/firstPartySignal.ts`;
- `frontend/server/user-portfolio/ipcClient.test.ts`;
- `frontend/server/user-portfolio/ownerContextFromBinding.test.ts`;
- `frontend/server/user-portfolio/ipcPortAdapter.test.ts`; and
- `frontend/server/user-portfolio/fenceUnchanged.test.ts`.

**Existing bounded files for the accepted changes:**

- `frontend/server/user-portfolio/userPortfolioContract.ts`, retaining the existing `G2_CONTRACT_VERSION = '2'` seam without an invented numeric bump;
- `frontend/server/executive-transport.ts`, only for C8 loopback/no-wildcard-CORS remediation; and
- `frontend/vite.config.ts`, only for the C8 non-loopback binding remediation.

**Byte-stable exclusions:**

- `frontend/server/owner-context-unavailable.ts`;
- `frontend/server/user-portfolio-transport.ts`; and
- the certified reference portfolio, UI session portfolio store, existing `PortfolioStorePort`, and all unrelated product paths.

All `/api/user-portfolios*` routes remain HTTP `503 owner-context-unavailable` until Gate 5. The IPC client sends no principal, owner, tenant or portfolio-scope authority, re-enforces OC-7/C7, maps refusal without mutation, and never automatically retries a write or falls back to another surface.

## 5. Exact W-1 write guard

The act cannot authorize a successful write merely by naming write code. The accepted Gate E policy requires **all four** conditions:

1. Gate E policy accepted by the Program Authority;
2. a separate Gate 3 implementation-authority act names the exact repository, IPD-`main` basis, file set and tests for the write path;
3. a Gate 4 qualification run covering Gate E §4 is executed on the deployment host and accepted by a separate result-acceptance act; and
4. a Gate 5 admission act names the qualified IPD and IRR commits and lifts the IRR `503` fence for the named operations.

Otherwise the operation is refused and performs **zero** store mutations. Conditions 2–4 are not currently effective. D3 `3b` is therefore a disabled-by-default code-slice disposition, not a write enablement.

## 6. Required restrictions and preserved boundaries

A future effective act must carry every restriction below:

- non-production, H-18 single-user scope only;
- IPD is the user-portfolio owner and durable boundary;
- existing `PortfolioStore`/portfolio capability is extended, not replaced or duplicated;
- PIT and the certified IRR reference portfolio are not repurposed;
- no user-owned scoring/analytics integration;
- no caller-supplied identity, owner, tenant, portfolio scope or canonical company identity;
- accepted canonical identity, binding, isolation, audit, lifecycle, retention, concurrency, lineage, idempotency and migration requirements remain in force;
- IPD is `SESSION_ONLY`/`durable:false` until later qualification/admission evidence supports otherwise;
- IRR HTTP `503` remains in force; C8 is currently **NOT MET**;
- Gate A′ execution is separate and currently **APPROVED, NOT EXECUTED** under P-1;
- Gate 4, separate result acceptance and Gate 5 are separate acts;
- no production, release, enterprise, OIDC, RBAC, multi-user or tenant-directory authority; and
- no off-main implementation is promoted, merged, cherry-picked, re-pinned or admitted as the G3 basis.

## 7. Acceptance boundary for an effective Gate 3 act

Gate 3 acceptance may establish only that the named implementation and tests pass at the named commits in CI. It must record:

1. exact IPD/IRR commit identities;
2. exact file and test list;
3. typecheck, build and guarded test commands from the applicable CI policy;
4. test counts, non-zero executed tests and zero failures;
5. unchanged `SESSION_ONLY`/`durable:false`, 503 and fence assertions; and
6. a statement that no Windows, deployment-host, Gate A′, Gate C, QE-1–QE-11, Gate 4, result-acceptance, Gate 5 or production evidence is thereby established.

It must not claim restart durability, crash atomicity, Windows named-pipe behavior, C5.1/Q9 host zero bytes, revocation-after-restart or admission.

## 8. Downstream acts

| Act | Current status and non-inference |
|---|---|
| Gate A′ provisioning | `APPROVED` with P-1 adopted; **NOT EXECUTED**; separate operator act |
| Gate 3 implementation | **NOT GRANTED**; this proposed form is not effective |
| Gate 4 qualification | **NOT EXECUTED**; Windows/deployment host unavailable in this workstream |
| Gate 4 result acceptance | **NOT ACCEPTED**; separate act required |
| Gate 5 admission | **NOT GRANTED**; 503 cannot lift |
| Production | **NOT AUTHORIZED** |

## 9. Effectiveness blocker and next authority action

The five PA decisions are settled and recorded. The blocker is narrower: the current authority request itself leaves the IPD exact file/test set as a proposal and requires the future act to pin it. The act cannot be made valid by copying a historical off-main file list or inventing implementation details.

**Required next authority action:** render a separate effective Gate 3 act after re-resolving the current IPD-main SHA and fixing the exact IPD file/test/dependency set. Until then, do not implement, commit, push, create an implementation PR, execute Gate A′, run Gate C/4, lift 503, or claim durable capability.

*End of proposed act. `PROPOSED — NOT EFFECTIVE` is the controlling status.*
