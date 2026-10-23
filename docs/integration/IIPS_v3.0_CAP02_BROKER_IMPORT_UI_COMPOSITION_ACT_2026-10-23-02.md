# IIPS v3.0 — CAP-02 — Broker-Import UI Composition and Transport Act

> ## STATUS: **PREPARED — NOT EFFECTIVE — NO FILE AUTHORIZED — BLOCKED ON B-1 (IPD EXPORT) AND U2–U7**
> This act prepares the exact scope required to make the U0 placement decision operational. It is **not**
> effective, it authorizes **no** file, and no source change was made under it.
>
> It supersedes, **in direction only**, the Increment A/B framing of
> `IIPS-V3-CAP02-HOST-BOUNDARY-IMPLEMENTATION-ACT-2026-10-23-01` (preserved unamended; additive §13
> records the change). It is blocked because the component set it must import does not exist as an IPD
> package export (B-1), because IPD write correctness is unimplemented (U2), and because the W-1
> conjunction is unmet (U3–U6). Each is named exactly at §8.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-2026-10-23-02` |
| **Record type** | Prepared exact-scope implementation act — file manifest, interface direction, transport/route boundary, test manifest, U2 work items, U3–U7 reconciliation, blocker register |
| **Status** | **PREPARED — NOT EFFECTIVE**; implementation `NOT AUTHORIZED`; route admission `NOT GRANTED` |
| **Prepared** | `2026-10-23` (UTC) |
| **Governing decisions** | `IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-EFFECTIVE-2026-10-23-01` (topology/ownership); `IIPS-V3-CAP02-U0-BROKER-IMPORT-UI-PLACEMENT-EFFECTIVE-2026-10-23-01` (placement) |
| **Authority basis for rendering (when rendered)** | Standing grant, `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2, blob `c4c9f7d7…`, as construed by `IIPS-V3-DEC06-…-2026-10-21-01` |
| **Evidence baselines** | IRR `main@e5b91029346603cceb07924cd3dd411cea2dc23d`; IPD `main@73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` / tree `66020736…` |
| **Mutation boundary of this record** | Documentation only. No source, test, schema, mapping, migration, store, route, fence, workflow, ref or issue change. IPD untouched. |

---

## 1. What this act would authorize, and in what order

Three increments. Only the third is an IRR change; the first must be performed in IPD.

**Increment A — IPD export surface (IPD repository; not performable from IRR under R-7).** A governed
package export exposing the broker-import component set and the domain modules it imports, built on a
`main`-resident packaging layer. No behaviour change to the component; no write path; no transport.

**Increment B — IRR composition, transport and refusal-faithful end-to-end path.** A container surface
that renders the IPD component, a `PortfolioStorePort` adapter over IRR's existing `UserPortfolioPort`, a
host-side import boundary, one CAP-02-owned HTTP namespace, a navigation entry, and tests. With W-1 unmet,
every write terminates in IPD `WRITE_NOT_AUTHORIZED` with zero store effect — **that refusal is the
asserted success criterion of Increment B**, not a temporary defect.

**Increment C — durable success path (deferred; not in this act).** Truthful `durable:true` display,
result contract completion and reconciliation. Requires U2 completed, U3, U4, U5, U6 and U7. **Included
here only so that a later reader sees it named and excluded, not omitted.**

**This act cannot and does not:** move or copy an IPD file, re-implement identity/provenance domain in
IRR, change contract v1, add an IPC operation or wire field, add a listener in IPD, change a fence or the
W-1 guard, enable a write, or assert any Gate 4/5/operational status.

---

## 2. Exact file manifest

### 2.1 Increment A — IPD repository (a separate IPD act must name these)

| Path (IPD) | Action | Purpose | Constraint |
|---|---|---|---|
| `package.json` | **modify** | Add a `./portfolio-ui` export entry (exact name fixed by the IPD act) and restore a `main`-resident packaging build | Must not alter the existing `./pit`, `./d114-non-production`, `./persistence` semantics; must not change any runtime behaviour |
| `tsconfig.portfolio-ui-package.json` | **new** | Build entry points for the export | Same compiler settings as the existing package build; no `src/**` behaviour change |
| `src/ui/portfolio_ui_package.ts` | **new** | Re-export surface: broker-import component set, `PortfolioStorePort` types, `SecurityMaster`/quarantine/provenance symbols the component imports | Re-exports only; no new logic; no identity resolution of its own |
| `src/identity/package.ts`, `src/contracts/package.ts` | **new** (or folded into the above) | Narrow export of exactly the symbols the component imports | No widening of identity/provenance API beyond the import graph |
| `tests/portfolio_ui_package.test.ts` | **new** | Export-surface conformance: the exported symbols are the same objects the in-repo components use; no second implementation | Must fail if the export diverges from the source module |

**Not authorized by this act:** any change to `frontend/src/features/portfolio/**`, `src/identity/**`,
`src/contracts/**`, `src/ipc/**`, `src/persistence/**` or any schema. The IPD act may add export plumbing
only.

### 2.2 Increment B — IRR repository (this act, if rendered effective, *and only after* Increment A exists)

| Path (IRR) | Action | Baseline blob | Constraint |
|---|---|---|---|
| `frontend/src/features/portfolio-import/BrokerImportSurface.tsx` | **new** | — | Container only: mounts the IPD component, supplies the port adapter and the security master, renders the truthful durability banner. **No** CSV parsing, mapping, identity logic or digest computation of its own |
| `frontend/src/features/portfolio-import/ipdStorePortAdapter.ts` | **new** | — | Implements IPD `PortfolioStorePort` by delegating to IRR `UserPortfolioPort`. Maps refusals onto the port vocabulary; **never** returns `durability: 'DURABLE'`, never sets `durable: true`, never fills the v1→G2 envelope gap |
| `frontend/src/features/portfolio-import/ipdSecurityMaster.ts` | **new** | — | Obtains the governed security master through the IPD export. No fixture fabrication, no second master, no network call |
| `frontend/src/api/brokerImport.ts` | **new** | — | Typed client for the CAP-02 namespace. Sends broker-observed fields only; asserts no `companyId`/`identityStatus`/`resolutionDisposition`/owner/tenant/credential key |
| `frontend/server/broker-import/routeBoundary.ts` | **new** | — | Route table for `/api/broker-import/**`: owner-context precondition, first-party signal, closed method set, typed refusals. No fence interaction |
| `frontend/server/broker-import/importBoundary.ts` | **new** | — | Host-side use case: accept raw observations, validate shape, call the existing `IpcUserPortfolioPort`, map outcomes to the closed `G2FailureReason` vocabulary, propagate `durability`/`durable` verbatim |
| `frontend/server/executive-transport.ts` | **modify** | `53bc5e37…` | Mount the new route table only. No change to any existing route, binding, or listener; the twelve fenced pairs stay byte-identical in behaviour |
| `frontend/src/app/App.tsx` | **modify** | `a75d69be…` | Add one route (`/user-portfolios/import`) rendering `BrokerImportSurface` **behind an explicit availability gate that is closed until U7**; no other route touched |
| `frontend/src/app/navigation.ts` | **modify** | `62cc125b…` | Add one navigation entry, marked unavailable while the gate is closed |
| `frontend/package.json` | **modify** | `a6a0521c…` | Repin `iips-production-market-data` to the IPD `main` commit produced by Increment A — **only** if that commit is on IPD `main` (see §8 B-1) |

**Must remain byte-identical or behaviourally unchanged:** `server/user-portfolio-transport.ts`
(`51704c12…`), `server/owner-context-unavailable.ts` (`cb8db45d…`), `server/user-portfolio/userPortfolioContract.ts`
(`e6b57bb8…`), `server/user-portfolio/ipcClient.ts` (`c1b885e3…`), `server/user-portfolio/ipcPortAdapter.ts`
(`7881185e…`), `frontend/vite.config.ts` (`a4614f49…`). A diff touching any of them outside the
`executive-transport.ts` mount point fails this act.

### 2.3 Excluded without exception

File moves between repositories; any second SecurityMaster or provenance implementation; any new IPC
operation (`broker.import` etc.); any change to contract v1 or its wire fields; any TCP/HTTP/URL listener
in IPD; any change to the W-1 guard; any native shell, preload or `contextBridge`; any schema, migration
or contribution-model change; any fence change; any G24 lineage; any CAP-03 dependency; any IPO Screening
Engine scope.

---

## 3. U1 — the transport and route boundary (determined; admission not granted by the U0 record)

| Element | Determination |
|---|---|
| Renderer → host | The existing product HTTP boundary: relative `/api/...` from the renderer, Vite dev proxy to `127.0.0.1:8787`, same-origin in a built deployment. No new origin, no CORS change, no second port |
| Namespace | **New, CAP-02-owned: `/api/broker-import/**`.** It is *not* `/api/user-portfolios*`; that namespace and its twelve route-method pairs remain fenced and unchanged, and CAP-02 acquires no CAP-03 dependency |
| Methods (proposed) | `POST /api/broker-import/:portfolioId/holdings` (the import), `GET /api/broker-import/:portfolioId/preview` (read-back for the surface). No other method; anything else is a typed refusal, not a 404 that could be mistaken for absence |
| Handler order (mandatory) | 1) first-party signal; 2) `IIPS_G3_IPC_BINDING_PROVISIONED` precondition — absent ⇒ refuse before constructing a port; 3) shape validation that refuses every canonical-identity/owner/tenant/credential key; 4) `IpcUserPortfolioPort` call; 5) outcome mapping with `durable` propagated verbatim |
| Host → IPD | The **existing** contract v1 over the existing `node:net` endpoint via `ipcClient`. No new operation, no new field, no new listener, no retry |
| Identity | `IPD → canonical` only. IRR transmits raw broker observations; `companyId`/`runtimeCompanyId`/`identityStatus`/`resolutionDisposition` are refused at the IRR encoder and again by IPD's C7 scan |
| Binding | IPD-owned per request. IRR's precondition may only refuse earlier |
| Failure vocabulary | Class P (zero bytes / close) ⇒ typed refusal; Class A ⇒ mapped `G2FailureReason`; timeout ⇒ `OUTCOME_UNKNOWN`, never success, never automatic resend |
| What admission requires | This act rendered effective **and** Increment A present. Until then the namespace does not exist and no handler is registered |

The prior transport review's finding that a *new operation* would need a major contract revision is
respected by construction: this boundary adds no operation. The finding that routing through the fenced
503 surfaces is excluded from CAP-02 is respected by using a different namespace.

---

## 4. U2 — IPD write correctness: the exact required work

Re-verified this pass against IPD `main@73fd8c16…`. These are not restatements of prior findings; each is
a code-level gap observed at the current tree.

| ID | Gap observed now | Exact work | Acceptance evidence |
|---|---|---|---|
| **ID-1** | `persistBrokerImport` (`src/persistence/brokerImportPersistence.ts`, blob `59bb09eb…`) requires **caller-supplied** `companyId` + `identityStatus` per holding; the wire refuses exactly those keys (C7, `src/ipc/protocol.ts` blob `f4dc72b1…`). The path is therefore unreachable through v1 | Add **server-side raw-identity resolution**: resolve each raw `{symbol, isin, exchange}` against IPD's security master inside IPD, and construct the canonical vector there. Refuse the whole request with `storeEffect: 'NONE'` and per-holding reasons when resolution is zero or ambiguous | A request carrying only broker-observed fields resolves to canonical holdings IPD-side; a request carrying any canonical key is still refused (C7); zero/ambiguous matches refuse the whole import |
| **ID-2** | No provisioning/source wiring for a resolution source on the write path | Provision the resolution source server-side for the exact store+schema | Provisioning receipt; no env flag or fixture row substitutes |
| **PROV-1** | `portfolio_contributions` (`migrations/001_initial_schema.ts`) has columns `canonical_owner_id, portfolio_id, contribution_id, amount, contributed_at, created_at` — **no** file name, source broker, content digest, lineage digest or contribution semantics. `computeBrokerImportProvenance` hashes them but the store cannot persist them | A mapping/schema act adding lossless provenance columns and the write that fills them | Field-by-field mapping table; no silently dropped field; `fileName`/`sourceBroker`/`importedAt` recoverable from the store |
| **PROV-2** | Contribution-model change is not in the closed Gate 3 manifest | Its own act; DR-4 stays open until then | Separate decision record; manifest amendment names the files |
| **TXN-1** | `persistBrokerImport` calls `writer.list` then `writer.create`/`writer.save`; each store method owns its own writes. There is no request-wide transaction spanning binding revalidation, revision check, idempotency check and every mutation | One `BEGIN IMMEDIATE … COMMIT` per import request, with every check inside it; `ROLLBACK` on any failure | Source evidence of one transaction; no statement outside it |
| **TXN-2** | No fault-injection evidence exists for the import path | Fault injection at each step | Post-failure store state equals pre-request state |
| **TXN-3** | No revocation-race coverage on the import path | Concurrent revocation test | Commit refused after revocation |
| **IDEM-1** | Content-digest idempotency exists in the store (`contribution_id` = content digest) but the import path passes `existing.revision` rather than a caller-supplied expectation | Wire the W-8 content-digest rule through the import path explicitly; assert duplicate ⇒ `ALREADY_IMPORTED_NO_OP` before and after restart | Duplicate import produces no new revision before and after restart |
| **IDEM-2** | `BrokerImportRequest` has **no** `expectedRevision`; `persistBrokerImport` reads `existing.revision` itself | Make `expectedRevision` mandatory (W-5) and refuse omission | Omission refused with a typed code |
| **FAIL-1** | `ipcClient` already never retries; the server path has no reconciliation | Keep no-retry; add reconcile-by-read before any user-initiated retry | Timeout ⇒ outcome unknown; reconciliation read precedes retry |
| **FAIL-2** | Refusal/success/unknown are distinct in the port vocabulary but not asserted end-to-end | Three-state test at adapter and boundary | Three states distinguishable in the UI view model |
| **DUR-1** | No commit-then-ack ordering assertion on the import path | `durable:true` only after an authorized `COMMIT`, and only when Gate 4 acceptance and Gate 5 admission are effective | Ordering test plus gate-state precondition test |

**Manifest position.** These changes lie outside the closed Gate 3 acceptance. U2 therefore requires an
**amended exact Gate 3 manifest** naming each file, plus the separate provenance/schema act (PROV-2).
No authorization is retrofitted onto prior changes and no PR #45 path is retrospectively authorized.

---

## 5. U3–U7 — reconciliation (kept distinct, none satisfied)

| ID | Status at this pass | Why it is not satisfied | Exact next executable action | Acceptance evidence |
|---|---|---|---|---|
| **U3** Gate 4 qualification | `PROPOSED / NOT EFFECTIVE`; execution `NOT AUTHORIZED / NOT STARTED`; proposal basis older than current IPD `main` | W-1(3) requires qualification; hosted Linux CI is not qualification | Render a Gate 4 act at final pins, then run `QE-1`…`QE-11` on the native host | Qualification record naming the exact commits and target host |
| **U4** Gate 4 result acceptance | `NOT RENDERED` | A separate act after U3; a passing run is not acceptance | Separate result-acceptance act citing the run | Acceptance record with the run identity |
| **U5** Gate 5 admission | `NOT GRANTED / NOT INITIATED` | W-1(4) | Admission act naming qualified commits and operations | Admission record |
| **U6** Operational write authorization | `NOT AUTHORIZED`; guard hard-false | W-1 conjunction U3+U4+U5 | The act that records W-1 satisfaction | No flag or fixture may substitute |
| **U7** UI read/result contract | `NOT RENDERED`; `portfolio.analytics` reserved; v1 save result narrower than the G2 shape (`V1_TO_G2_ENVELOPE_GAP`: 7 missing fields, 3 renames) | The UI cannot truthfully display committed state; the IRR adapter refuses rather than fabricate | A contract decision: either extend the v1 result via an authorized contract act, or adopt an IPD-shaped result for the CAP-02 surface and retire the G2 shape for it | Field-by-field resolution table; a successful-save display test that fabricates nothing |

**Ordering.** U0 (done) → B-1 (IPD export) → Increment B with writes refusing (U1 admission inside this
act) → U2 (write correctness) → U3 → U4 → U5 → U6 → Increment C. **U7 must be rendered before Increment C
and before the surface's availability gate is opened**, because the gate exists precisely to prevent a
surface that cannot truthfully display a committed result.

**Why the refusal path may precede U3–U6.** While W-1 refuses every write, the v1→G2 envelope gap is
unreachable (no successful save exists to map), and `durable:true` is unrepresentable. Increment B can
therefore be built and tested end-to-end without touching any gate — which is exactly why it is worth
building first.

---

## 6. Test manifest (Increment B)

| ID | Test | Pass condition |
|---|---|---|
| `T-CB-1` | Reachability and single-authority | The surface imports the IPD export; a static scan finds **no** second broker-import implementation, no duplicated provenance/identity logic, and no copy of an IPD file in IRR |
| `T-CB-2` | Fence byte-identity | `user-portfolio-transport.ts` `51704c12…` and `owner-context-unavailable.ts` `cb8db45d…` unchanged; all twelve route-method pairs still `503` |
| `T-CB-3` | Route isolation | `/api/broker-import/**` is served by the new table only; a request to `/api/user-portfolios*` is unaffected; unknown methods on the new namespace are typed refusals |
| `T-CB-4` | Raw-observation only | A body carrying any canonical-identity/owner/tenant/credential key is refused **before** any socket write; the encoder spy records zero bytes |
| `T-CB-5` | Owner-context fail-closed | With `IIPS_G3_IPC_BINDING_PROVISIONED` absent, the route refuses before constructing a port; no connection attempt is made |
| `T-CB-6` | Refusal mapping | Class P, Class A and W-1 refusals map onto existing `G2FailureReason` members; no new member added |
| `T-CB-7` | No retry | Exactly one connection attempt per call, including on timeout and transport error |
| `T-CB-8` | Outcome unknown | Timeout surfaces as `OUTCOME_UNKNOWN`, never as success or failure, and never resends |
| `T-CB-9` | Truthful durability | Every non-committed path yields `durable:false`; the banner reads session-only/unavailable; no `COMMITTED` wording without a real commit |
| `T-CB-10` | Envelope-gap refusal | A synthetic v1 save success lacking G2 fields throws the recorded gap error instead of fabricating values |
| `T-CB-11` | End-to-end refusal | Renderer → route → `ipcClient` → IPD dispatch yields `WRITE_NOT_AUTHORIZED` with `storeEffect: 'NONE'`; the store is byte-identical before and after |
| `T-CB-12` | Availability gate | The route/navigation entry is unavailable until U7 is effective; the gate cannot be opened by configuration |

**No test in this manifest is evidence of a durable commit.** Each is a refusal, isolation, or
truthfulness test by design.

---

## 7. Explicit exclusions

1. No IPD source change under this act; Increment A and U2 are IPD acts.
2. No file move, copy, or re-implementation of IPD domain in IRR.
3. No contract v1 change, no new operation, no new wire field.
4. No fence change, no route admission outside `/api/broker-import/**`.
5. No native host, preload, `contextBridge` or renderer IPC.
6. No schema, migration, identity-mapping or contribution-model change.
7. No W-1 change, no write enablement, no `durable:true`.
8. No Gate 3 amendment, Gate 4 execution/acceptance, Gate 5 admission, production or operational claim.
9. No G24 lineage, no CAP-03 dependency, no IPO Screening Engine scope.
10. No retrospective authorization of PR #45 paths classified unauthorized.

---

## 8. Blocker register — exact next executable actions

| ID | Blocker | Why it blocks | Exact next executable action | Capacity |
|---|---|---|---|---|
| **B-1** | No IPD package export for the component set; IPD `main` has no package-export layer (no `exports` map, no `package.ts` entry points, no package build script), and IRR's current pin `2e11fa3b…` is a **branch-tag-only** commit, not an ancestor of IPD `main` | Every IRR file in §2.2 imports from a subpath that does not exist ⇒ `tsc --noEmit` and `vite build` fail. Executing this act first would break the build | Land Increment A in the IPD repository on `main`, then reconcile the pin per G1-B1 §110 | **IPD** — cannot be performed from IRR (R-7) |
| **U2** | Identity resolution, provenance, transaction and idempotency gaps (§4) | Without it no write can succeed and Increment C is impossible | IPD implementation act inside an amended exact Gate 3 manifest + the PROV-2 schema act | **IPD** |
| **U3–U6** | W-1 conjunction unmet | Operational writes are refused by design | Gate 4 act at final pins → result acceptance → Gate 5 → write authorization | PA / qualification host |
| **U7** | Result/read contract gap | A committed import could not be shown truthfully | Contract decision, then Increment C | PA (IRR) |

**Dependency graph:** `U0 ✓ → B-1 → (this act: Increment B) → U2 → U3 → U4 → U5 → U6 → U7 → Increment C`.
Each arrow is a named act. No arrow may be skipped by reinterpretation of this record.

---

## 9. Rollback boundary

Increment B is revertible by deleting its new files, reverting the three modified files and removing the
navigation entry and route: no migration, no data rewrite, no fence lift, no contract change, and no
change to the session-only default. Increment C would not be revertible by that boundary — removing a
surface does not undo a committed write — so it requires its own rollback analysis. Increment A is
revertible by deleting its export plumbing; it changes no behaviour.

---

## 10. Status and next action

```text
U0 placement:                 DECIDED — EFFECTIVE 2026-10-23
U1 boundary:                  DETERMINED; route NOT ADMITTED
Increment A (IPD export):     PREPARED — NOT AUTHORIZED — IPD capacity
Increment B (IRR composition): PREPARED — NOT AUTHORIZED — blocked by B-1
Increment C (durable success): DEFERRED — blocked by U2–U7
Writes / gates:               UNCHANGED (WRITE_NOT_AUTHORIZED; 12 pairs 503; durable:false)
```

**Next executable action:** land Increment A in the IPD repository. On its return, this act can be
rendered effective without renegotiating its scope, and Increment B becomes buildable — with every write
correctly refused and that refusal asserted end-to-end.

*Prepared under the effective topology and U0 decisions; grants nothing; performs nothing.*

---

## 11. Additive current-source correction — 2026-10-23 (still PREPARED / NOT EFFECTIVE)

A renewed verification at IRR `f53056214d45c850928fbabd51dc6a2adcb64f2b` and initial IPD
`73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` found that the original preparation above was not execution-ready.
During that review IPD independently advanced to `554ed6ceaa7422c95806fd1b6e095a24a8554be2` through PRs #46/#47,
landing the exact Increment A export. B-1 is closed, but the export act expressly does not render this IRR act.
This section is additive; the original sections and all effectiveness guards remain unchanged.

1. **The existing G2 IPC adapter is not byte-stable-compatible with CAP-02 save.** The current IRR adapter sends
   `expectedRevision?` plus `options:{mode,contentDigest,fileName,sourceBroker}`. Accepted v1 requires mandatory
   `expectedRevision` and top-level `mode`, `contentDigest`, `broker`. It also returns a minimal v1 save receipt,
   not the older G2 result that adapter constructs. The proposed reuse in §§2.2 and 3 is therefore withdrawn as
   prepared direction. A future effective act must use a narrow CAP-02 adapter over the existing `callIpc`, or
   record an equivalent wire-conformant boundary; it must not add an IPC operation.
2. **U7 blocks the exported modal's save and refusal paths, not merely durable-success display.** Increment A
   exports `BrokerImportModal`, deliberately not `PortfolioWorkspace`. The modal requires a full legacy success
   result; `PortfolioPortSaveRefusal` requires a complete `PortfolioRecord` and durability values; the port has
   no outcome-unknown member; CAP-02 also needs an authoritative revision token. Accepted v1/Class A results do
   not supply the full legacy shapes. Preview fallbacks, empty refusal records/timestamps, `SESSION_ONLY`
   coercion, inferred `isSaved` or current-detail substitution for historical G2 fields is forbidden. The
   unexported workspace's read/analytics requirements stay out of the minimal surface rather than being mounted
   through a deep path.
3. **The proposed preview/read endpoint cannot precede U7.** §3's GET route remains unregistered and is removed
   from the narrow prepared U1 increment. A read endpoint may be prepared only after its authoritative result
   semantics are effective.
4. **The renderer cannot directly consume the Node-only `UserPortfolioPort`.** The browser adapter must use a
   relative HTTP client. The trusted IRR host separately owns the IPC adapter. No `frontend/server/**`,
   `node:net`, `node:sqlite` or persistence import may enter the browser closure.
5. **The first component mount is default-portfolio-only unless IPD changes.** The current
   `BrokerImportModal` saves to literal `DEFAULT_PORTFOLIO`, independently of the workspace's `portfolioId`.
   IRR must not imply arbitrary portfolio selection or build a parallel controller. Threading another ID is an
   IPD component act.
6. **Full durable provenance remains separately blocked.** v1 save has no `fileName` or `importedAt` payload
   field. Those fields may not be added unilaterally, silently asserted as persisted, or avoided through a new
   `broker.import` operation. This is C-1/U2 work before any durable-success increment. The concurrently added
   U2 proposal is `PROPOSED / NOT EFFECTIVE` and does not establish those values' end-to-end source.
7. **Increment A is now independently verified, not merely awaited.** Current IPD `main` package blob
   `f7146b67…` exports `./portfolio-ui`; entry blob `03ffdd46…` re-exports the authoritative modal/port/pipeline
   and governed master. An external consumer at `554ed6ce…` resolved 22 runtime exports and confirmed the default
   `SESSION_ONLY`/`durable:false`. IRR still pins off-`main` `2e11fa3b…`; a repin requires an effective IRR
   manifest and was not performed.

The dependency line in §8 and the next-action wording in §10 must therefore be read with **U7 before any real
custom-port injection/mount**, not only after U6 as the original shorthand suggested. Increment A's landing alone
was not sufficient to render or execute this act: B-1R repin, U1 effectiveness, U7, C-1/U2 for the attempted flow,
current baselines and the exact manifest must all be rechecked.

The current-source assessment and successor prepared records are:

- `docs/integration/IIPS_v3.0_CAP02_HOST_COMPOSITION_AND_TRANSPORT_READINESS_2026-10-23.md`
  (`IIPS-V3-CAP02-HOST-COMPOSITION-TRANSPORT-READINESS-2026-10-23-01`);
- `docs/integration/IIPS_v3.0_CAP02_U1_BROKER_IMPORT_TRANSPORT_AUTHORITY_ACT_PREPARED_2026-10-23.md`
  (`IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-2026-10-23-01`);
- `docs/integration/IIPS_v3.0_CAP02_U7_READ_RESULT_CONTRACT_DECISION_PREPARED_2026-10-23.md`
  (`IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-2026-10-23-01`).

This addendum does not make the act effective, authorize source, admit a route, change a contract, weaken a
fence or satisfy any gate. The UI remains unmounted and `/api/broker-import/**` disabled.
