# PKG-02F — G3-D3–G3-D7 decisions and Gate 3 authorization package

**Prepared:** 2026-10-19 UTC
**Repository:** `ramkivs/iips-review-recovered`
**Purpose:** one-pass registration of the PA-approved G3-D3–G3-D7 dispositions and preparation of the separate, decision-complete Gate 3 implementation-authority act.
**Authority status:** the five dispositions below are rendered PA decisions. This packet and the companion act are **not themselves an effective Gate 3 implementation grant**.

## 1. Controlling status and exact bases

| Item | Exact value / status |
|---|---|
| G3-D2 | **B — `node:sqlite` — SELECTED AND APPROVED**, preserved from `docs/integration/IIPS_v3.0_G3_D2_STORAGE_TECHNOLOGY_PA_DECISION_2026-10-19.md`; not reopened or overwritten |
| G3-D3 | **`3b` — APPROVED**; write code may exist only disabled by default behind all four W-1 conditions |
| G3-D4 | **`INCLUDE CODE` — APPROVED**; bounded provisioning code may be included, but Gate A′ execution remains separate |
| G3-D5 | **`REFERENCE ONLY` — APPROVED**; exact CV-20(a)/P7 confirmation is rendered; historical durable line is not a current baseline |
| G3-D6 | **`CONFIRM` — APPROVED**; every G-2 §3 requirement applies in full, including single-user deployment |
| G3-D7 | **`ACCEPT WITH CHANGES` — APPROVED** in IRR capacity; minimal additive, explicitly versioned IPD consumer only |
| IPD `main` inspected | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` |
| IRR `main` inspected | `f9a9c006230d4bfb6ab68f358eb330e2af53c838` |
| G3 request | IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`, blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0` |
| Gate E policy | IPD `evidence/cross-repository/IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md`, accepted W-1–W-16 |
| Contract | IPD `evidence/cross-repository/IIPS_V3_G2_IPD_IRR_PORTFOLIO_CONSUMER_CONTRACT_V1_2026-10-18.md` |
| G-2 architecture | `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` |

## 2. Decision register links

The five decisions are independently durable and intentionally do not replace one another:

1. [G3-D3 write slice](../IIPS_v3.0_G3_D3_WRITE_SLICE_PA_DECISION_2026-10-19.md)
2. [G3-D4 provisioning-code scope](../IIPS_v3.0_G3_D4_PROVISIONING_CODE_SCOPE_PA_DECISION_2026-10-19.md)
3. [G3-D5 reference-only confirmation](../IIPS_v3.0_G3_D5_REFERENCE_ONLY_PA_DECISION_2026-10-19.md)
4. [G3-D6 full G-2 §3 confirmation](../IIPS_v3.0_G3_D6_G2_SECTION_3_CONFIRMATION_PA_DECISION_2026-10-19.md)
5. [G3-D7 IRR scope](../IIPS_v3.0_G3_D7_IRR_SCOPE_PA_DECISION_2026-10-19.md)

The links are repository-relative from `docs/integration/2026-10-18/`; the records are the authority trail. No disposition is an Arena recommendation.

## 3. Consolidated PA result

### 3.1 G3-D3 — `3b`

The future implementation may contain bounded write code, but its presence does not enable a successful write. Every write operation remains subject to the exact conjunctive W-1 guard. Until every W-1 condition is true, IPD must refuse with zero store effect. The default-disabled behavior and each missing-condition case belong in the named Gate 3 test set; a passing CI test is not Gate 4 or Gate 5 evidence.

### 3.2 G3-D4 — `INCLUDE CODE`

The future exact file set may include the code required for IPD-local A-2 binding/provisioning and the A-3 audit boundary. It must extend the existing IPD `PortfolioStore`/portfolio capability and must not add a second durable owner. The one-time Gate A′ execution remains a distinct operator act.

The current Gate A′ decision is `APPROVED` with P-1 adopted and **`NOT EXECUTED`**: `evidence/np04/IIPS_v3.0_G2_IPD_GATE_A_PRIME_PA_DECISION_RENDERED_2026-10-17.md`. No Windows store, fixture, browser, localhost, or operator-host evidence is claimed. Historical off-main Gate A/G24 material is reference evidence only.

### 3.3 G3-D5 — exact formal closure

The required line is recorded verbatim in the D5 record:

> **G3-D5 Off-main 2026-10-07 durable line (CV-20 (a)/R-8(a)) ................... REFERENCE ONLY**

This resolves P7 as `REFERENCE ONLY`. It does not admit, promote, re-pin, cherry-pick or qualify the historical line.

### 3.4 G3-D6 — full G-2 §3 applicability

No single-user exception applies. The full obligation map is in the D6 record: principal/owner; tenant/company context; stable durable identity; restart durability; versioned serialization/deserialization; migrations; lifecycle/retention; reset/deletion; concurrency/version semantics; server authorization; owner/tenant isolation; auditability; and durable contribution/lineage/idempotency preservation. The map names future tests and evidence without inventing schema fields, APIs or migration identifiers.

### 3.5 G3-D7 — bounded IRR consumer

The accepted-with-changes IRR scope is:

- C8 remediation in `frontend/server/executive-transport.ts` and `frontend/vite.config.ts`, while keeping the two 503 fence files byte-stable;
- the exact eight-file IRR consumer/test set named by the D7 record, including `ipcClient.ts`, `ownerContextFromBinding.ts`, `ipcPortAdapter.ts`, `firstPartySignal.ts` and their four tests;
- revision of `frontend/server/user-portfolio/userPortfolioContract.ts` at the existing `G2_CONTRACT_VERSION = '2'` seam, without an invented numeric bump or new unapproved wire fields; and
- continued HTTP `503 owner-context-unavailable` for **all** `/api/user-portfolios*` routes until Gate 5.

IRR remains a consumer. It does not own durable state, create a second store, supply caller identity/scope, retry writes, touch the certified reference portfolio, or add user-owned scoring/analytics.

## 4. W-1 is an exact four-condition gate

The accepted Gate E policy is incorporated without weakening or inference:

1. Gate E policy accepted by the PA;
2. a separate Gate 3 implementation-authority act names the exact repository, IPD-`main` basis, file set and tests for the write path;
3. a Gate 4 qualification run covering Gate E §4 is executed on the deployment host and accepted by a separate result-acceptance act; and
4. a Gate 5 admission act names the qualified IPD and IRR commits and lifts the IRR `503` fence for named operations.

Otherwise IPD returns/refuses `WRITE_NOT_AUTHORIZED` (or an earlier refusal) and performs **zero** store mutations. Current status: condition 1 is accepted; conditions 2–4 are not effective/not executed/not granted. The `3b` disposition cannot change this status.

## 5. Gate 3 act prepared by this package

The companion file [IIPS v3.0 G3 Gate 3 implementation-authority act — proposed](../IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_PROPOSED_2026-10-19.md) is the prescribed separate act document. It is deliberately marked **PROPOSED — NOT EFFECTIVE** and does not authorize implementation.

### 5.1 Immutable cross-repository basis

The proposed act records the inspected IPD `main` SHA `be32d8c95a86b3f03bd382ccde5b6398efb351c6` and IRR baseline `f9a9c006230d4bfb6ab68f358eb330e2af53c838`. The IPD basis is not the historical Gate A/Gate B/G24 off-main line. If either `main` advances before a valid act is rendered, the exact SHA and all dependent evidence must be re-resolved.

### 5.2 IPD implementation set — intentionally not guessed

The current G3 request §6.1 names proposed areas, not a final exact file list:

- `src/persistence/*` for connection, migrations, ledger, schema and transactions;
- `src/ipc/*` for endpoint, framing, dispatch and refusal mapping;
- an additive durable adapter alongside the existing portfolio port;
- new tests T-A through T-J; and
- conditional package/lockfile changes only if explicitly required by the selected technology/runtime/type decision.

The request explicitly says the later Gate 3 act fixes the exact list. Because the authority boundary prohibits inventing filenames, schemas, properties, APIs or migrations, this package does **not** promote those globs into an effective implementation grant. The exact IPD file/test set is a genuine precondition still to be pinned by the separately rendered act.

### 5.3 IRR implementation set fixed by D7

The proposed act may carry the exact IRR set in D7 §2.2, the contract path, and the two C8 source/configuration paths. The 503 fence files are protected invariants. Any change outside that set requires a separate scope decision.

### 5.4 Gate 3-level tests

The act must name and report the fixed test set. At the request level, the acceptance obligations are T-A–T-J:

| ID | Gate 3 obligation | Boundary |
|---|---|---|
| T-A | framing, oversize/malformed/version/unknown/pipelined frames refuse with zero bytes | implementation test, not host qualification |
| T-B | all caller-authority and C7 key forms refused with no store access | implementation test |
| T-C | zero/two/malformed/revoked binding/membership refuses without disclosure | implementation test |
| T-D | missing/foreign/tombstoned reads share the refusal envelope | implementation test |
| T-E | unverified migration, store fault or endpoint collision creates no endpoint | implementation test |
| T-F | IPD opens no TCP/HTTP/URL listener | implementation test |
| T-G | `3b` write code is disabled by default and missing W-1 conditions produce refusal/zero row delta | implementation test |
| T-H | session adapter remains `SESSION_ONLY`/`durable:false`; durable vocabulary only after committed durable reads | implementation test |
| T-I | existing `bi07_*` store-port tests remain green unchanged | regression test |
| T-J | IRR six route paths/twelve route-method pairs remain HTTP 503 and boundary does not call the port | IRR regression/fence test |

These requirements do not establish Windows named-pipe ACL/collision behavior, C5.1/Q9 zero bytes on the host, crash atomicity, restart durability, or revocation-after-restart. Those remain Gate 4/Gate C evidence.

## 6. Gate A′, Gate 4 and Gate 5 sequencing

1. The exact Gate 3 act, if separately rendered effective, authorizes only implementation on the named basis and files.
2. Gate A′ provisioning execution is a separate one-time Windows operator act under P-1. It is currently approved but **not executed**.
3. Gate 4 executes QE-1 through QE-11 and the required Gate C subset on the deployment host at recorded commits, with raw output.
4. A separate result-acceptance act accepts or rejects the Gate 4 result.
5. Gate 5 separately names qualified commits and lifts the 503 only for named operations.

No stage is inferred from another. No current CI or documentation publication is a Gate 4 result.

## 7. Preserved safeguards

| Safeguard | Required current status |
|---|---|
| Non-production / H-18 | preserved; no production eligibility |
| IPD persistence | `SESSION_ONLY` / `durable:false`; no durable claim |
| IRR portfolio routes | HTTP `503 owner-context-unavailable` |
| C8 | **NOT MET** until the C8 remediation is implemented and separately accepted |
| Certified reference portfolio | unchanged; not user-owned and not a backing store |
| PIT | not repurposed as portfolio persistence |
| Gate 4/5 | separate, not executed/not granted |
| Historical off-main line | reference-only; no promotion/reuse as admitted base |
| Baselines | 51-row and 13-item baseline unchanged and not recounted |
| IRR PR #114 | untouched |
| Windows/browser/localhost | no access or validation claimed |

## 8. Blocker to effectiveness

The PA dispositions are now recorded, but the separate Gate 3 act is not validly effective yet. The current authoritative request intentionally leaves the IPD §6.1 paths and §6.2 tests as proposals and requires the act to name the exact post-publication IPD-main SHA, exact file set, tests, dependencies, restrictions, prerequisites and Gate-3-level acceptance evidence. This packet cannot lawfully fill that gap by inventing implementation details.

Accordingly:

- documentation and reconciliation may be published;
- no application change, implementation branch, IPD write code, IRR route/CORS change, provisioning execution or Gate 3 implementation PR is started from this packet; and
- the next effective-authority step is the prescribed separate PA rendering of the exact act after the file/test set is fixed.

This is an evidence-backed authority blocker, not a repeated approval request. The five PA dispositions remain settled.

## 9. Verification performed for this packet

- Read the current IRR `main` at `f9a9c006…` and the current IPD `main` at `be32d8c95…`.
- Read the current G3 request §§3–9 and §13, Gate E W-1–W-16, G-2 §3/architecture/implementation records, accepted consumer contract, and Gate A′ records.
- Confirmed IPD `main` has no `src/persistence/*` or `src/ipc/*` implementation paths and the existing portfolio port remains `SESSION_ONLY`/`durable:false`.
- Confirmed IRR's `/api/user-portfolios*` fence remains HTTP 503 and C8 source/configuration evidence remains **NOT MET**.
- Confirmed no Windows checkout, browser, localhost, operator host, Gate A′, Gate C or Gate 4 execution was performed.
- Confirmed no application/runtime code, dependency, lockfile, listener, route, CORS, persistence or remote ref was changed while preparing this packet.

*End of PKG-02F. It records the five PA decisions and prepares, but does not grant, the separate Gate 3 act.*
