# IIPS v3.0 — CAP-02 — PA Topology and Ownership Decision — **PREPARED FOR DETERMINATION**

> ## STATUS: **PROPOSED — NOT EFFECTIVE — NO IMPLEMENTATION OR OPERATIONAL AUTHORITY**
> This record prepares **one** Program Authority determination: the application-host and
> persistence-owner boundary for future broker-import integration. It records **no** PA selection,
> signature, approval identifier or effective date. Publication of this record publishes a
> **proposal only**. Every item in §3 is conditional on the Program Authority rendering it through
> the project's established direct-selection process.
>
> **This record changes no source, ref, route, fence, schema, identity mapping, migration, store,
> gate, admission or write behaviour.** The broker-import UI continues to report session-only saves
> as `durable:false`.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-DECISION-2026-10-23-01` |
| **Work item** | `CAP-02` — application-host / persistence-owner boundary for future broker-import integration |
| **Record type** | Prepared Program Authority decision (decision request — **not** a decision); topology and ownership disposition; explicit limitation and follow-through schedule |
| **Status** | **PROPOSED / NOT EFFECTIVE** — decision requested; grants nothing |
| **Prepared date** | `2026-10-23` (UTC) |
| **Decision authority required to render** | **Ramki — Program Authority**, single owner/user of the single-user personal-use IIPS platform |
| **Prepared in repository** | `ramkivs/iips-review-recovered`; working branch `arena/96351abc-iips-review-recovered` |
| **IRR evidence baseline** | `ramkivs/iips-review-recovered` `refs/heads/main@a6cec4c5e7dff13a656aba7b8c2c30b010b991c2` (merge of PR #206) |
| **IPD evidence baseline** | `ramkivs/iips-production-market-data` `refs/heads/main@73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`; tree `66020736919befa5e5320550a396187cd351b40e` |
| **Governing records inherited, unamended** | Published G1-B1 (`docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md`, blob `857d14513c3fc2c45f9015145fc7f36cd7ad6141`); G-2 durable user-portfolio architectural decision (blob `7e83946b470bcc6f4751fb1a67e832ac66128c5c`); CAP-02 authority/transport review (†`IIPS-V3-CAP02-AUTHORITY-TRANSPORT-REVIEW-2026-10-23-01`); CAP-02-HOST-01 runtime/composition investigation (†`IIPS-V3-CAP02-HOST01-RUNTIME-COMPOSITION-2026-10-23-01`) |
| **Mutation boundary** | IRR receives this record, one additive addendum to the CAP-02-HOST-01 record (§14) and one additive tracker continuation (§16.84). IPD is read-only and untouched. No source, test, schema, mapping, migration, store, ref, PR, issue or workflow is changed. |
| **Production status** | NON_PRODUCTION — one user, one personal laptop, H-18 scope |

† In-repository paths: `docs/integration/IIPS_v3.0_CAP02_AUTHORITY_TRACEABILITY_AND_TRANSPORT_DECISION_PROPOSAL_2026-10-23.md` and `docs/integration/IIPS_v3.0_CAP02_HOST01_RUNTIME_COMPOSITION_AND_BRIDGE_DISPOSITION_2026-10-23.md`.

---

## 1. The single decision requested

> **May the CAP-02 target topology and ownership boundary be fixed as: IRR retained as the integrated
> IIPS product/application host under G1-B1; IPD retained as the owner of durable portfolio
> persistence and its same-host IPC interface; no independent IPD-local native application host
> created as an assumed prerequisite for CAP-02?**

This question is the unresolved item the CAP-02-HOST-01 investigation recorded at its §5.2 and
§11.2: published G1-B1 selects IRR `main` as the authoritative IIPS product/application host, while
accepted G-2 and consumer-contract v1 assign the user-portfolio domain, durable persistence and IPC
service to IPD. No effective record names an owner, runtime, lifecycle or exact source path for a new
IPD-local native/preload host, and none was found in the verified IPD source or its reachable history.
The two boundaries are therefore established; **the one open question is whether CAP-02 may assume a
second, IPD-local application host in order to reach the durable store.**

The recommendation in §3 answers that question in the negative and states the retention it implies.
It is a **topology and ownership disposition only**. It authorizes no implementation, no transport, no
bridge, no write and no gate movement.

---

## 2. Verified basis

### 2.1 Repository coordinates actually read for this record

| Item | Verified value |
|---|---|
| IRR `origin/main` | `a6cec4c5e7dff13a656aba7b8c2c30b010b991c2` (`git ls-remote`; merge of PR #206) |
| IRR working branch | `arena/96351abc-iips-review-recovered`, clean at `a6cec4c5…` before this record |
| IPD `origin/main` | `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`; tree `66020736919befa5e5320550a396187cd351b40e` (read-only clone) |
| IPD PR #45 | `MERGED`; the investigated IPD baseline is its merge commit. Merge and green CI remain facts, not path authority, qualification or admission. |
| Prior CAP-02 records | Both 2026-10-23 records are present on IRR `main` and their dispositions are inherited **unamended**. Their decision sections remain `PROPOSED / NOT EFFECTIVE`. |

### 2.2 Ownership and host anchors

| Anchor | Verified effect | Limit |
|---|---|---|
| Published **G1-B1**, blob `857d1451…` | §3 Decision **B1 = A**: IRR `main` is the authoritative IIPS product/application host — application shell, product routing, product-level transports and orchestration, integrated IIPS UX, in-process `iips-platform` integration where applicable. | Expressly **not** authoritative for IPD-owned domain data or persistence; grants no provider, identity or taxonomy authority. |
| **G-2** durable user-portfolio architectural decision, blob `7e83946b…` | IPD owns the user-portfolio domain and its durable persistence boundary; the existing IPD `PortfolioStore` is to be extended, not replaced or duplicated; IRR consumes it only through a separately governed additive interface. | Architecture direction only; grants no implementation authority; the storage-technology decision is a separate act (G3-D2). |
| Accepted consumer contract **v1**, IPD blob `163eb1f1…` | Scopes client = IRR server process, server = IPD; defines `portfolio.save` but authorizes no writes; refuses caller-supplied owner/canonical identity; excludes TCP/HTTP/URL listeners. | Does not authorize the IPD browser or any renderer as caller; write operations remain unauthorized. |
| Effective IPD UI store-port act, blob `d0657706…` | Authorizes UI dependency inversion and an asynchronous session port only. | Expressly excludes IPC/client/endpoint/service/transport, durable adapters/stores/writes, provisioning, identity mechanism, route admission and qualification. |
| Effective Gate E write policy **W-1**, IPD blob `4a9501bf…` | Writes require all four: accepted Gate E policy; exact Gate 3 implementation authority; Gate 4 host qualification **and** separate result acceptance; Gate 5 admission. Otherwise refusal with zero mutation. | No effective record satisfies all four; the guard is therefore hard false. |

### 2.3 Current source state at the exact baselines

| Surface | Verified source fact | Not implied |
|---|---|---|
| IPD broker-import UI | `frontend/src/features/portfolio/portfolioStorePort.ts:315` defines `SessionPortfolioStorePort`; `PortfolioWorkspace.tsx:60` and `BrokerImportModal.tsx:63` default to it. No `durable: true` exists in IPD frontend or `src/`. | Not a durable save, not a transport, not qualification. |
| IPD native host / bridge | No Electron, Tauri, preload, `contextBridge`, `ipcRenderer` or native-main composition in package scripts or product source; `scripts` are `build`, `build:tsc`, `build:vite`, `dev`, `test`, `test:direct` only. No script starts UI plus the IPC service. | Not a claim about an uninspected external machine; a repository/composition finding. |
| IPD IPC write path | `src/ipc/protocol.ts` lists `portfolio.save` in the closed write set; `src/ipc/dispatch.ts:231` returns `WRITE_NOT_AUTHORIZED` for every write before mutation. | The operation name existing is not write authorization. |
| IPD endpoint | `src/ipc/endpoint.ts` uses `node:net` only and creates no TCP, HTTP or URL listener; `src/ipc/entrypoint.ts` is a direct-entry module with no product composition caller. | A same-host IPC interface exists; it is not composed with the UI. |
| IPD transaction/provenance | No `BEGIN`/`COMMIT`/`ROLLBACK` in `src/persistence/portfolio_store.ts` or `src/persistence/brokerImportPersistence.ts`; the import helper validates caller-supplied canonical identity claims rather than resolving IPD-side. | Atomicity, identity resolution and provenance remain open prerequisites (§6). |
| IRR fences | `frontend/server/user-portfolio-transport.ts` blob `51704c12a467cd2f718a030b5036bc55c9afa73f` and `frontend/server/owner-context-unavailable.ts` blob `cb8db45d668d28cee7e0a52721001d579a872733`, byte-identical to their recorded identities; six route paths / twelve route-method pairs answer an identical `503 owner-context-unavailable`. | No route is activated by this record. |
| IRR client/adapter | `frontend/server/user-portfolio/ipcClient.ts` and `ipcPortAdapter.ts` remain unwired behind the fence; the adapter refuses the v1 → G2 envelope gap rather than fabricating fields. | Not a reusable CAP-02 bridge. |

### 2.4 What is *not* disputed anywhere in this record

- IPD **is** the persistence owner. G-2 states it; contract v1 states it; the durable store lives there.
- IRR **is** the integrated product/application host under G1-B1, and G1-B1 already carries the
  express limit that host authority does not extend to IPD domain data or persistence.
- No IPD-local native host exists, and no effective record establishes one.
- Gate 4 qualification, Gate 4 result acceptance and Gate 5 admission are not satisfied.

The decision requested in §1 is therefore narrow: it fixes which of the two possible CAP-02 topologies
is the working boundary, and removes "build a second IPD application host" as an unstated assumption.

---

## 3. Proposed disposition — **PROPOSED / NOT EFFECTIVE**

> **Status:** the six items below are the recommended disposition. They are **not** in force. They
> become operative only if the Program Authority selects them, in whole or with recorded amendment,
> and records an effective date. Nothing in this section is an authorization.

**Proposed wording for PA determination (verbatim from the decision request):**

> 1. Retain IRR as the integrated IIPS product/application host under G1-B1.
> 2. Retain IPD as the owner of durable portfolio persistence and its same-host IPC interface.
> 3. Do not create an independent IPD-local native application host as an assumed prerequisite for
>    CAP-02.
> 4. Require any future renderer-to-IPD integration to identify its actual host composition root,
>    lifecycle owner, bridge boundary, and exact implementation files before implementation
>    authorization.
> 5. Keep transport implementation, durable-write correctness, Gate 4 qualification and result
>    acceptance, Gate 5 admission, and operational write authorization as distinct decisions or
>    prerequisites.
> 6. Preserve all existing write-denial behavior and IRR HTTP 503 fences until the relevant
>    authorities and gates permit a change.

### 3.1 Item-by-item meaning, and what each item does *not* do

| Item | If accepted, it fixes | It does **not** |
|---|---|---|
| 1 — IRR retained as integrated host | The integrated IIPS product/application host remains IRR `main` per G1-B1; host authority keeps its existing express limit over IPD data and persistence. | Authorize IRR user-portfolio routes, lift a `503` fence, create a CAP-03 dependency, or grant transport authority. |
| 2 — IPD retained as persistence/IPC owner | The durable store and the same-host IPC interface remain IPD-owned, extended rather than replaced, with IPD-side identity resolution and server-owned binding. | Authorize any write, any store change, any schema/migration, or any caller. |
| 3 — no new IPD-local native host | A second application host is **not** a CAP-02 prerequisite and is not to be assumed in any future manifest. | Prohibit a future PA decision from ever establishing one; this item states the current boundary only. |
| 4 — host composition root must be identified first | Any future manifest names the real host composition root, lifecycle owner, bridge boundary and exact files before implementation authority is sought. | Name those files today; no host path is fabricated by this disposition. |
| 5 — decisions stay distinct | Transport, durable-write correctness, Gate 4 qualification, Gate 4 result acceptance, Gate 5 admission and operational write authorization are separate and non-substitutable. | Pre-satisfy, combine, sequence away or waive any of them. |
| 6 — preserve denial and fences | W-1 write refusal and the IRR `503` fences stay exactly as they are until their own authorities and gates change them. | Permit a temporary, test-only, flag-gated or internal-path exception. |

### 3.2 Interpretation that must travel with any acceptance

Accepting items 1 and 3 together means a future CAP-02 renderer transport would have to live at a host
composition root consistent with G1-B1 — but **it does not select, authorize or scope that work here**,
and it does not convert CAP-02 into an IRR/CAP-03 route dependency. The existing IRR
`/api/user-portfolios*` surfaces are a *consumer* boundary, not a broker-import transport to the IPD
store, and they remain fenced. A future act that proposes an IRR-host composition root must name it
explicitly and obtain its own effective authority; it may not infer it from item 1.

---

## 4. Explicit limitations

The disposition in §3, **if accepted**, would not itself:

1. Authorize new source changes.
2. Authorize a renderer bridge or new transport.
3. Change the existing v1 IPC contract.
4. Approve schema, identity-resolution, provenance, transaction, or durability changes.
5. Authorize broker-import operational writes.
6. Accept Gate 4 results or grant Gate 5 admission.
7. Authorize activation of the existing IRR user-portfolio routes.
8. Retrospectively authorize paths classified as unauthorized under PR #45's effective authority.

Each limitation is binding on every later reader of this record. In particular:

- **v1 is unchanged.** Its client scope, closed write operation set, refused caller-identity keys,
  reserved `portfolio.analytics` operation and no-TCP/HTTP/URL rule all stand. Any change to a wire
  operation, payload field or result shape requires its own contract/Gate E act. Reusing an existing
  operation is not the same as changing it, and neither is authorized here.
- **PR #45's path dispositions are frozen.** The four exact-manifest paths remain bounded authorized
  work; the three `tests/q1_*` files remain Q1 fixture/qualification evidence only;
  `src/persistence/brokerImportPersistence.ts` and the `scripts/run-tests.mjs` change remain outside
  the located effective implementation authority and are not retrospectively ratified. A topology
  decision cannot cure an implementation-authority gap, and this one does not attempt to.
- **No durability claim exists.** A session-only save is not a durable save; a fixture commit is not a
  product commit; SQLite presence is not a durability qualification.

---

## 5. Required follow-through

After the topology decision becomes effective, a **separate exact-scope implementation act** is
required, based on the actual host and transport entry points. That act must name:

| Required content of the later act | Why it cannot be deferred to the implementer's judgement |
|---|---|
| Authorized files, enumerated exactly | The current IPD manifest is closed and the two CAP-02 records name no host path; an unnamed file is unauthorized. |
| Interfaces and their direction | The frontend and backend `PortfolioStorePort` interfaces are not type-compatible; direction and ownership determine who resolves identity and who owns binding. |
| Tests, enumerated exactly | Hosted CI and fixture tests are not target-host qualification; naming them is the only way an act can be audited against what ran. |
| Exclusions | Prevents scope drift into CAP-03, G24, routes, schema, migrations or production. |

Before any claim of **successful durable import behaviour**, the same act (or a separately effective
write act) must resolve and evidence:

1. **Canonical identity** — IPD-side resolution over raw broker observations from an initialized,
   authoritative source; zero or ambiguous matches refuse the whole import with no partial write;
   browser-supplied canonical claims are never trusted.
2. **Provenance** — authoritative file, broker, import-time, content-digest and lineage semantics,
   mapped without silent dropping or semantic change; any contribution-schema change is a separate
   governed act.
3. **Transactionality** — one request / one atomic transaction covering binding revalidation,
   identity-accepted holdings, revision check, idempotency check, and every portfolio, revision,
   holding and contribution mutation, with all-or-nothing rollback and fault injection.
4. **Truthful durability** — a durable acknowledgement only after an authorized transaction actually
   commits, and only once the applicable Gate 4 result acceptance and Gate 5 admission are effective.
   Outcome-unknown must never be rendered as success or failure, and no automatic write retry occurs.

---

## 6. Distinct decisions and prerequisites (unchanged by this record)

| # | Decision or prerequisite | Current state | Relationship to this disposition |
|---|---|---|---|
| D1 | Application-host / persistence-owner topology | **THIS RECORD — PROPOSED / NOT EFFECTIVE** | Would establish the boundary only. |
| D2 | Exact implementation act (files, interfaces, tests, exclusions) | Not prepared | Requires D1 effective first. |
| D3 | UI read/analytics and save-result contract decisions | Open — v1 reserves `portfolio.analytics` and returns a narrower save result than the UI contract requires | Independent of D1; not curable by reuse alone. |
| D4 | Durable-write correctness (identity, provenance, transaction, idempotency, restart, outcome-unknown) | Not established; source-proven gaps remain | Separate prerequisite; D1 grants none of it. |
| D5 | Gate 4 target-host qualification | Authority proposal **PROPOSED / NOT EFFECTIVE**; no native-host run; hosted CI is not a substitute | Separate; unchanged. |
| D6 | Gate 4 result acceptance | **NOT RENDERED** | Separate act after D5; not inferred from test success. |
| D7 | Gate 5 admission | **NOT GRANTED / NOT INITIATED** | Later, separate act. |
| D8 | Operational write authorization (W-1 satisfaction) | **NOT AUTHORIZED** — hard-false guard | Requires D4–D7; no environment flag substitutes. |
| D9 | Operational binding / provisioning | Gate A′ approved but **not executed**; its pinned basis is incompatible with current provisioning/schema; a fresh store carries zero bindings | Separate successor act requested; not a D1 dependency but a real blocker. |

---

## 7. Preserved state and explicit non-grants

```text
Broker-import UI persistence:        SESSION_ONLY / durable:false
IPD write dispatch:                  WRITE_NOT_AUTHORIZED before mutation (all writes)
IRR /api/user-portfolios* routes:    HTTP 503 owner-context-unavailable (6 paths / 12 pairs)
IPC contract v1:                     UNCHANGED (client scope, operations, refused keys)
IPD durable store / schema:          UNCHANGED
Identity resolution / provenance:    UNCHANGED; prerequisites open
Gate 3:                              ACCEPTED for bounded implementation scope only (unchanged)
Gate 4 qualification:                PROPOSED / NOT EFFECTIVE; NOT AUTHORIZED / NOT STARTED
Gate 4 result acceptance:            NOT RENDERED
Gate 5 admission:                    NOT GRANTED / NOT INITIATED
Operational broker-import writes:    NOT AUTHORIZED
PA decision in this record:          PROPOSED / NOT EFFECTIVE
```

**Non-grants preserved:** no CAP-03 status or file change; no G24 revival or promotion; no activation
of IRR user-portfolio routes; no removal or change to any HTTP `503` fence; no schema, identity-mapping,
migration or contribution change; no W-1, Gate 4, result-acceptance, Gate 5, route-admission,
production or successful-write status change; no `durable:true` claim; no retrospective amendment of
PR #45 path dispositions; no Group F workbook search or claim.

**Continuing obligation — stated verbatim:**

> Until the required decisions and gates are effective, the broker-import UI must continue to report
> session-only saves as `durable:false`.

---

## 8. What would make this disposition effective

1. The Program Authority selects the disposition — in whole, or with each amendment recorded
   explicitly — through the project's established direct-selection process.
2. The selection is recorded with an effective date and, where the PA assigns one, an approval
   identifier. A merge, a green CI run, a comment, an issue or this preparation does not supply it.
3. Any amendment is stated as amendment text; silent widening (for example, treating item 1 as
   transport authority, or item 3 as authority for an IRR bridge) is void.
4. Only then may a **separate** exact-scope implementation act be prepared under §5.

Until all four steps occur, this record remains a proposal and readers must treat the current state as
unchanged.

---

## 9. Verification performed for this record

| ID | Verification | Result |
|---|---|---|
| `V344` | Live `git ls-remote` / read-only clone: IRR `main@a6cec4c5…` (PR #206 merge, working branch clean at the same commit); IPD `main@73fd8c16…`, tree `66020736…` | **PASS** |
| `V345` | IPD UI re-inspected at the exact baseline: `SessionPortfolioStorePort` defaults at `portfolioStorePort.ts:315/469`, `PortfolioWorkspace.tsx:60`, `BrokerImportModal.tsx:63`; no `durable: true` in `frontend/src` or `src`; no Electron/Tauri/preload/`contextBridge`/`ipcRenderer` composition and no host launch script | **PASS — session-only, no host** |
| `V346` | IPD IPC re-inspected: `portfolio.save` in the closed write set (`protocol.ts:25/36`), `WRITE_NOT_AUTHORIZED` at `dispatch.ts:231`, `node:net`-only endpoint with no TCP/HTTP/URL listener, direct-entry `entrypoint.ts` with no product composer | **PASS — write refusal and non-composition confirmed** |
| `V347` | IPD persistence helper re-inspected: no `BEGIN`/`COMMIT`/`ROLLBACK` in `portfolio_store.ts` or `brokerImportPersistence.ts`; helper validates caller-supplied canonical identity instead of resolving IPD-side | **PASS — prerequisites remain open** |
| `V348` | Ownership records re-read at their pinned blobs: G1-B1 `857d1451…` §3 (B1 = A, IRR host, expressly not authoritative for IPD data/persistence); G-2 `7e83946b…` §1.1 (IPD owns domain and durable persistence); v1 `163eb1f1…` and W-1 `4a9501bf…` unchanged | **PASS** |
| `V349` | IRR fence preservation: `user-portfolio-transport.ts` `51704c12…` and `owner-context-unavailable.ts` `cb8db45d…` byte-identical to their recorded identities; fence suites re-run (see `V350`) covering six paths / twelve route-method pairs at an identical `503` | **PASS — fences unchanged** |
| `V350` | IRR Linux/Node 22: lockfile install, `npm run typecheck`, `npm run typecheck:replay-server`, `npm run test:ci`, the non-zero test guard and `npm run build` — results recorded in §9.1 | **See §9.1** |
| `V351` | Documentation scope: three documentation paths only (this record, the CAP-02-HOST-01 §14 addendum, tracker §16.84/`CHG-2026-10-23-03`); `git diff --check`; UTF-8, final newline, trailing whitespace, code-fence balance, local-link resolution, table row-width and identifier-uniqueness checks | **PASS — documentation-only** |
| `V352` | Non-grant review: no source, test, schema, mapping, migration, store, route, fence, workflow, ref, PR or issue change; no gate movement; no PA decision rendered; IPD worktree clean | **PASS** |

### 9.1 Executed check results

IRR `frontend/` on Linux with Node 22 and npm 10:

| Command | Result |
|---|---|
| `npm ci --no-audit --no-fund` | 188 packages from the lockfile. The first attempt failed with sandbox `UNABLE_TO_VERIFY_LEAF_SIGNATURE`; it was rerun with the runbook-prescribed `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt`. TLS verification was not disabled and no lockfile changed. |
| `npm run typecheck` | **0** |
| `npm run typecheck:replay-server` | **0** |
| `npm run test:ci` | **87 files / 1,077 passed / 0 failed** |
| `node .ci/assert-tests.js .vitest-report.json` | **guard OK** — 87 files, 1,077 tests, 0 failed |
| `npm run build` | **0** |

These are hosted-Linux repository checks. They confirm the existing fence, client and adapter
behaviour; they are **not** UI-to-IPC composition evidence, transaction atomicity, operational
provisioning or Gate 4 qualification. The equivalent tracker rows in §16.84.5 are authoritative for
this pass.

---

## 10. Next action

**Prepared decision:** `CAP-02 topology/ownership — PROPOSED / NOT EFFECTIVE`.

**Single next governance action:** the Program Authority renders the §3 disposition (or records an
amended disposition) as an effective decision. No source work is authorized before that.

**Immediately after effectiveness (and only then):** prepare the separate exact-scope implementation
act required by §5, naming the actual host composition root, lifecycle owner, bridge boundary, exact
authorized files, interfaces, tests and exclusions — and treating §6 D3–D9 as open prerequisites rather
than as satisfied by the topology decision.

**Until then:** the broker-import UI continues to report session-only saves as `durable:false`; IPD
continues to refuse every write with zero mutation; every IRR `/api/user-portfolios*` route continues
to answer `503 owner-context-unavailable`.

*End of record. Prepared for determination; no PA decision is rendered by this document.*

---

## 11. Addendum — decision rendered (2026-10-23)

**Status of this record:** `PROPOSED / NOT EFFECTIVE` remains the correct description of **this document**. It is preserved unamended as the prepared request and its history. Its request status is now discharged: the Program Authority decision was **rendered** in `docs/integration/IIPS_v3.0_CAP02_PA_TOPOLOGY_AND_OWNERSHIP_DECISION_EFFECTIVE_2026-10-23.md` (`IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-EFFECTIVE-2026-10-23-01`), **EFFECTIVE `2026-10-23`**, under the standing grant transcribed at `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2 (blob `c4c9f7d7…`) as construed by `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01`.

**The effective decision adopts the six §3 items without amendment.** It is a topology and ownership
decision only: it authorizes no source change, bridge, transport, contract change, write, route
activation, gate movement or admission, and it preserves `WRITE_NOT_AUTHORIZED`, all twelve IRR `503`
route-method pairs and the session-only `durable:false` reporting.

**Publication is not rendering.** IRR PR #207 (`9a3f499…`, `2026-10-23T07:04:13Z`) published this
proposal and the CAP-02-HOST-01 §14 addendum. The rendering act is the separate record named above.
The proposal's §8 description of how a disposition becomes effective is superseded only as to *this*
disposition, which has now followed that path; the description remains the correct rule for any future
disposition.
