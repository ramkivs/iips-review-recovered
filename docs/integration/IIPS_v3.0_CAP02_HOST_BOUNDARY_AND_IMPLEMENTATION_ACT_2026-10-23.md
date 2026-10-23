# IIPS v3.0 — CAP-02 — Host Boundary and Exact-Scope Implementation Act

> ## STATUS: **PREPARED — NOT EFFECTIVE — NO IMPLEMENTATION AUTHORIZED — BLOCKED ON U0–U7**
> This act prepares the exact scope required by item 4 of the effective CAP-02 topology decision. It is
> **not** effective, it authorizes **no** file, and no source change was made under it.
>
> It is blocked because a topology decision cannot manufacture implementation authority, because W-1
> still bars every write, because no broker-import renderer exists in the host repository, and because
> the transport would have to cross a fence that is excluded from CAP-02 scope. Each blocker is named
> exactly at §9, with the act that would clear it.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-HOST-BOUNDARY-IMPLEMENTATION-ACT-2026-10-23-01` |
| **Record type** | Prepared exact-scope implementation act — host composition root, bridge boundary, file manifest, interfaces, tests, exclusions, normative requirements, dependency register |
| **Status** | **PREPARED — NOT EFFECTIVE**; implementation `NOT AUTHORIZED` |
| **Prepared** | `2026-10-23` (UTC) |
| **Governing effective decision** | `IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-EFFECTIVE-2026-10-23-01` (topology and ownership only) |
| **Authority basis for rendering (when rendered)** | Standing grant, `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2, blob `c4c9f7d7…`, as construed by `IIPS-V3-DEC06-…-2026-10-21-01` |
| **Evidence baselines** | IRR `main@9a3f499abc77abc825edf8ee6d673e2b27254ffc`; IPD `main@73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` / tree `66020736…` |
| **Mutation boundary of this record** | Documentation only. No source, test, schema, mapping, migration, store, route, fence, workflow, ref or issue change. IPD untouched. |

---

## 1. What this act would authorize, and what it cannot

**Increment A — host seam, unreachable by construction (would be authorized if this act were rendered
effective at all).** One new IRR host-side module and its test that carry broker-import observations from
the host to the IPD same-host IPC boundary through the already-implemented client, with:

- no route registration;
- no change to `executive-transport.ts`;
- no change to either fence file (byte-identical required);
- no renderer surface of any kind;
- no write path reachable by any product caller.

Increment A is a *seam*, not a capability. It exists so that Increment B can be a small, auditable
change rather than a combined transport + policy + route act. **It is still not authorized by this
record**, because it consumes effort on a component that has no consumer until U0 is decided (§9).

**Increment B — product exposure (deferred, and not authorized).** Registering the seam on a product
route, adding a renderer broker-import surface, and allowing any write to reach IPD. This requires
U0–U7 to be cleared first and cannot be included in the same act.

**This act cannot and does not:** change v1, add an IPC operation, add a field to a wire message,
enable writes, modify the W-1 guard, lift a route fence, create a native host, modify IPD source, or
assert any Gate 4/5 status.

---

## 2. The host composition boundary, verified

### 2.1 What actually composes in RR today

| Element | Verified fact at the baseline | Blob / location |
|---|---|---|
| **Host composition root** | `frontend/server/executive-transport.ts` — a real Node HTTP server created with `node:http`, route table assembled in one request handler, mounted transports for AI advisory, reports, user portfolios, PIT, and others; `server.listen(port, '127.0.0.1')` (C8 loopback bind); exported as `server` for the runtime integration suite | `53bc5e37e0c5813e7f323c22b82516a8ba7cb6f4` |
| **Host launch** | `npm run server:dev` → `tsx server/executive-transport.ts`; fixed port `8787` in the transport, `NODE_ENV=test` suppresses the listen | `frontend/package.json` |
| **Renderer** | `frontend/src/main.tsx` → React `BrowserRouter` → `App`; no native shell, no preload, no `contextBridge`, no `ipcRenderer` in IRR | `ead99449330ee1ec9666b65015452891ec9c9ee5` |
| **Renderer → host transport** | Browser calls relative `/api/...`; Vite dev server proxies `/api` to `http://localhost:8787`, loopback-bound and loopback-hosts-only | `frontend/vite.config.ts` `a4614f498f6d5239af789e2f69b5410f2536d803` |
| **The bridge that exists today** | Product HTTP namespace `/api/user-portfolios*`, six paths / twelve route-method pairs, all answering `503 owner-context-unavailable` without constructing a port | `user-portfolio-transport.ts` `51704c12…`; `owner-context-unavailable.ts` `cb8db45d…` |
| **Host → IPD transport (built, tested, unwired)** | `frontend/server/user-portfolio/ipcClient.ts` — one connection per call, one request/one response frame, no listener, C7 authority-key refusal, no retry, timeout = `OUTCOME_UNKNOWN` | `c1b885e3173132685090bcd2cbfa4aa8c87fa4ca` |
| **Port adapter (built, tested, unwired)** | `frontend/server/user-portfolio/ipcPortAdapter.ts` — implements `UserPortfolioPort` over the client; refuses to fabricate the v1→G2 envelope gap after any successful save | `7881185e2975139db6d0574a07ddccf829b08eb6` |
| **Frozen contract module** | `frontend/server/user-portfolio/userPortfolioContract.ts` — closed `G2FailureReason` vocabulary and result shapes | `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b` |
| **IRR-local binding precondition** | `ownerContextFromBinding.ts` — `IIPS_G3_IPC_BINDING_PROVISIONED`, default absent ⇒ owner context `NOT_ESTABLISHED` ⇒ fail closed before any upstream call | `296dd5e361bf3a8bac4f45981f667edb344a6e79` |
| **IPD server boundary** | `src/ipc/endpoint.ts` (`node:net`, no TCP/HTTP/URL listener), `src/ipc/dispatch.ts` (`WRITE_NOT_AUTHORIZED` before mutation), `src/ipc/protocol.ts` (closed write set incl. `portfolio.save`) | `e565aa5b…`, `27becc76…`, `f4dc72b1…` |

### 2.2 The two negative findings that decide this act

1. **IRR has no broker-import surface.** `src/api/userPortfolios.ts` exposes only two reads
   (`fetchUserPortfolioSummaries`, `fetchUserPortfolio`); `src/features/user-portfolios/**` renders list
   and detail states; `src/features/portfolio/**` is the certified reference workspace with no holdings
   import. A repository-wide search for `BrokerImport` / `brokerImport` / `broker-import` in IRR `src`
   and `server` returns **no product match**.
2. **The only broker-import UI in the project is an IPD component** —
   `frontend/src/features/portfolio/{BrokerImportModal,portfolioStorePort,import/*}.tsx|ts` — and under
   item 3 of the effective decision there is **no IPD-local host** to run it against the durable store.

**Consequence.** The topology is now settled, but the *product* composition is not: the host and the
broker-import UI are in different repositories. Any transport-first implementation would create a
correct seam with no product consumer, and the first genuinely useful increment requires a product
decision about where the broker-import UI lives (U0). This is recorded rather than papered over.

---

## 3. Boundary statement under the effective topology

| Boundary | Determination |
|---|---|
| Application host | IRR `frontend/server/executive-transport.ts` (Node process) + `frontend/src` renderer; lifecycle owned by that process and the Vite dev/build pipeline |
| Persistence and IPC owner | IPD (`node:sqlite` store + same-host endpoint) — unchanged |
| Host → persistence transport | The existing same-host IPC client; no new listener, no new operation |
| Renderer → host bridge | The existing product HTTP boundary through the Vite proxy; the `/api/user-portfolios*` namespace is **fenced** and is excluded from CAP-02 by the standing exclusion of a CAP-03 route dependency |
| New native bridge | Not created, not assumed, and not needed for Increment A |
| Broker-import UI | **Not present in the host repository.** Placement is U0 |

---

## 4. Exact file manifest

### 4.1 Increment A — would be authorized only if this act is rendered effective

| Path | Action | Baseline blob | Purpose | Hard constraint |
|---|---|---|---|---|
| `frontend/server/user-portfolio/hostBrokerImportBoundary.ts` | **new** | — (absent) | Host-side use-case module: accepts raw broker-observed holdings + options, validates shape, calls `IpcUserPortfolioPort.saveHoldings`, maps outcomes to the closed `G2FailureReason` vocabulary, propagates `durability`/`durable` truthfully | Exported for tests and future composition only. **Must not** be imported by `executive-transport.ts`, any transport module, or any `src/**` renderer file. No route, no listener, no retry, no cache, no credentials |
| `frontend/server/user-portfolio/hostBrokerImportBoundary.test.ts` | **new** | — (absent) | Behavioural and reachability tests (§6) | Must include a static import-graph assertion that no product module imports the boundary |

**No existing file is modified by Increment A.** In particular the two fence files, the contract module,
`executive-transport.ts`, `vite.config.ts`, the IPC client and the adapter are **read-only** for this
increment; a diff touching any of them fails the act.

### 4.2 Increment B — deferred; naming these files authorizes nothing

| Path | Would-be action | Blocked by |
|---|---|---|
| `frontend/src/features/portfolio/**` (broker-import UI, if placed in IRR) | new renderer surface | U0 (placement), U1 (bridge), U7 (read/result contract) |
| `frontend/src/api/userPortfolios.ts` | add a save/write client call | U1, U7 |
| `frontend/server/executive-transport.ts` | register a CAP-02 route | U1 |
| `frontend/server/user-portfolio-transport.ts` | change the fence | U1 (and forbidden by item 6 while the fence is preserved) |
| IPD `src/persistence/**`, `src/ipc/**` | write correctness | IPD capacity + U2 + Gate 3 manifest amendment |

### 4.3 Excluded without exception

v1 protocol or payload change; any new IPC operation (`broker.import` etc.); any TCP/HTTP/URL listener
in IPD; any change to the W-1 guard; any native shell, preload or `contextBridge`; any IPD source
change under this act; any G24 lineage; any route admission; any schema, mapping or migration change.

---

## 5. Interfaces and direction

| Interface | Direction | Rule |
|---|---|---|
| `UserPortfolioPort` (IRR, `userPortfolioContract.ts`) | host-internal | The seam consumes this interface; it does not redefine it. Frozen exports are not edited |
| `IpcUserPortfolioPort` (IRR adapter) | host → IPD | Used as built. Its envelope-gap refusal stays; the seam must surface the refusal, never fill the gap |
| Contract v1 operations | host → IPD | Only the existing closed set. `portfolio.save` may be used only with exactly its v1 payload semantics; no additional field rides the wire |
| Identity | **IPD → canonical**, never renderer → IPD | The seam sends raw broker observations only. `companyId`, `runtimeCompanyId`, `identityStatus`, `resolutionDisposition`, owner, tenant or credential keys are refused locally before send by the existing C7 encoder and refused again by IPD |
| Binding | **IPD-owned, per request** | The seam never supplies, caches or infers a binding; the IRR-local precondition may only *refuse earlier*, never authorize |
| Durability truth | IPD result → UI | `durable`/`durability` are propagated verbatim. Absent ⇒ `false`. No default-true path may exist |

---

## 6. Test manifest (Increment A)

| ID | Test | Pass condition |
|---|---|---|
| `T-HB-1` | Reachability | Static import-graph assertion: no file under `frontend/server/` (other than tests) and no file under `frontend/src/` imports the boundary; `executive-transport.ts` blob unchanged |
| `T-HB-2` | Fence byte-identity | `user-portfolio-transport.ts` and `owner-context-unavailable.ts` blobs match `51704c12…` / `cb8db45d…`; all twelve route-method pairs still `503` |
| `T-HB-3` | Raw-observation only | A request carrying any owner/tenant/credential/canonical-identity key is refused **before** send with a typed error; the encoder spy records zero bytes written |
| `T-HB-4` | Refusal mapping | Class P (zero bytes / close), Class A (typed refusal) and W-1 refusal map onto existing `G2FailureReason` members; no new member is added |
| `T-HB-5` | No retry | Exactly one connection attempt per call, including on timeout and on transport error |
| `T-HB-6` | Outcome unknown | A timeout surfaces as `OUTCOME_UNKNOWN`, never as success or failure, and never triggers an automatic resend |
| `T-HB-7` | Truthful durability | A refusal or unknown outcome never yields `durable:true`; a session-only path yields `durable:false` |
| `T-HB-8` | Envelope-gap refusal | A synthetic v1 save success that lacks G2 fields throws the recorded envelope-gap error rather than fabricating values |

**No test in this manifest is evidence of a durable commit.** Every one is a negative/refusal test or a
truthfulness test, by design.

---

## 7. Normative requirements for any later write act

These are the conditions item 5 keeps distinct. They are stated here so a later act can be written
against them, not because any is satisfied.

| ID | Requirement | Acceptance evidence required |
|---|---|---|
| **ID-1** | Canonical identity is resolved **in IPD** from raw broker observations against an initialized authoritative source. Renderer claims are never trusted. | Per-holding resolution evidence; a request with zero or ambiguous matches refuses the **whole** import with `storeEffect: 'NONE'` and per-holding reasons |
| **ID-2** | Resolution source initialization is server-owned and provisioned. | Provisioning receipt for the exact store + schema; no environment flag or fixture row may substitute |
| **PROV-1** | File name, source broker, import time, content digest, lineage digest and contribution semantics are persisted losslessly or explicitly refused. | Field-by-field mapping table against the persisted schema; no silently dropped field; `importedAt` and `fileName` gaps closed by an authorized mapping/schema act |
| **PROV-2** | Contribution-schema changes are their own act. | Separate decision record; DR-4 remains open until then |
| **TXN-1** | One request = one atomic transaction covering binding revalidation, identity-accepted holdings, revision check, idempotency check and every portfolio/revision/holding/contribution mutation. | `BEGIN IMMEDIATE`/`COMMIT`/`ROLLBACK` source evidence; no statement outside the transaction |
| **TXN-2** | Failure after any step rolls back every change. | Fault injection at each step; post-failure store state equals pre-request state |
| **TXN-3** | Binding revocation racing a write cannot commit after revocation. | Concurrent revocation test; commit refused |
| **IDEM-1** | Idempotency is content-digest based (W-8), not `requestId`. | Duplicate import produces no new revision before and after restart |
| **IDEM-2** | `expectedRevision` is mandatory (W-5). | Omission is refused |
| **FAIL-1** | No automatic write retry (W-9). | Timeout ⇒ outcome unknown; reconcile-by-read precedes any user-initiated retry |
| **FAIL-2** | Refusal, success and unknown are distinct in the UI vocabulary. | Three-state test at the adapter and at the boundary |
| **DUR-1** | `durable:true` only after an authorized `COMMIT`, and only when the applicable Gate 4 acceptance and Gate 5 admission are effective. | Commit-then-ack ordering test; gate-state precondition test |
| **READ-1** | `portfolio.analytics` remains unavailable unless separately authorized; no synthesized analytics. | Refusal test; no mixed session/durable view |
| **READ-2** | The v1 save-result gap is refused, not fabricated. | Envelope-gap test (`T-HB-8`) |

---

## 8. Explicit exclusions

1. No v1 contract change, no new operation, no new wire field.
2. No IPD source change under this act — IPD changes require an IPD-capacity act and an amended exact
   Gate 3 manifest.
3. No route admission and no fence modification.
4. No native host, preload, `contextBridge` or renderer IPC.
5. No schema, migration, identity-mapping or contribution-model change.
6. No W-1 guard change; no write enablement; no `durable:true`.
7. No Gate 3 amendment, Gate 4 execution/acceptance, Gate 5 admission, production or operational
   eligibility claim.
8. No G24 lineage, no CAP-03 dependency, no unrelated workstream.
9. No retrospective authorization of PR #45 paths classified unauthorized.

---

## 9. Dependency register — what must be decided before this act can be effective

| ID | Blocking matter | Why it blocks | Exact act required |
|---|---|---|---|
| **U0** | **Broker-import UI placement.** The only broker-import UI is an IPD component; the host is IRR; no IPD-local host is permitted by item 3. | A transport without a renderer has no product effect; moving a UI component between repositories is a product-scope decision, not an implementation detail | A PA product-scope decision naming the UI's home and, if moved, the exact components to be re-hosted |
| **U1** | **Renderer-to-host bridge authority.** The only bridge is the fenced `/api/user-portfolios*` namespace; CAP-02 excludes a CAP-03 route dependency and a native host does not exist. | Registering the seam would require admitting a fenced route or creating a native host — both outside this act | A PA bridge/route decision, or a CAP-03 route-admission act, depending on U0 |
| **U2** | **IPD write correctness** (ID-1/2, PROV-1/2, TXN-1/2/3, IDEM-1/2). | The IPD import helper accepts caller canonical identity, has no request-wide transaction, and lacks the required provenance | An IPD-capacity implementation act inside an amended exact Gate 3 manifest, plus the separately requested provenance/schema act |
| **U3** | **Gate 4 qualification.** Authority proposal `PROPOSED / NOT EFFECTIVE`; basis older than current IPD `main`; no native-host `QE-1`…`QE-11` run. | W-1 requires Gate 4 qualification **and** separate result acceptance | An effective Gate 4 act at final pins, then a native-host run |
| **U4** | **Gate 4 result acceptance.** | W-1 condition; distinct from U3 | A separate result-acceptance act after the run |
| **U5** | **Gate 5 admission.** | W-1 condition | A later admission act naming qualified commits/operations |
| **U6** | **Operational write authorization.** | The W-1 guard is hard false until U3–U5 | The act that records W-1 satisfaction; no flag or fixture substitutes |
| **U7** | **UI read/result contract.** `portfolio.analytics` is reserved; the v1 save result is narrower than the UI contract. | The UI cannot display committed state truthfully without a decision | A read/result contract decision or a governed UI change |

**No blocker may be cleared by reinterpretation of this record.** Each is a recorded, separately named
act.

---

## 10. Rollback boundary

If Increment A were ever implemented, it would be revertible by deleting its two new files alone: no
migration, no data rewrite, no fence lift, no contract change, and no change to the session-only
default. Increment B is not revertible by that boundary and would require its own rollback analysis
(route removal and a UI-surface removal do not undo a committed write).

---

## 11. Evidence required at execution (not satisfied now)

Composition proof on the real path (host starts, seam loaded, both processes closed cleanly), real
socket round-trip to IPD dispatch, refusal/no-effect evidence, transaction fault injection, restart
read-back, duplicate-before-and-after-restart, outcome-unknown reconciliation, fence byte-identity
regression, and — for any write claim — target-host Gate 4 qualification with separate result
acceptance and Gate 5 admission. Hosted Linux CI is supplementary for all of these and is never
substituted for qualification.

---

## 12. Status and next action

```text
Host composition root:        IDENTIFIED — frontend/server/executive-transport.ts (IRR)
Renderer:                     IDENTIFIED — frontend/src (browser; Vite proxy /api → 127.0.0.1:8787)
Host → IPD transport:         EXISTS, TESTED, UNWIRED (ipcClient + ipcPortAdapter)
Broker-import UI in IRR:      ABSENT (only an IPD component exists)
Bridge:                       FENCED (/api/user-portfolios*, 12 pairs, 503)
Increment A (host seam):      PREPARED, NOT AUTHORIZED
Increment B (product path):   DEFERRED, NOT AUTHORIZED
First blocker:                U0 — broker-import UI placement is a product-scope decision
```

**Next executable action:** the Program Authority decides **U0** — where the broker-import UI lives under
the effective topology — and, on that answer, **U1**. Until then this act stays prepared, no file is
authorized, and the session-only `durable:false` behaviour and every fence remain the truthful state.

*Prepared under the effective topology decision; grants nothing; performs nothing.*

---

## 13. Addendum — U0 decided; this act's direction superseded, its status unchanged (`2026-10-23`)

**Additive. §§1–12 are preserved verbatim and continue to record what was prepared and what was not.**

U0 was decided after this act was prepared, in
`IIPS_v3.0_CAP02_U0_BROKER_IMPORT_UI_PLACEMENT_DECISION_EFFECTIVE_2026-10-23.md`
(`IIPS-V3-CAP02-U0-BROKER-IMPORT-UI-PLACEMENT-EFFECTIVE-2026-10-23-01`), effective `2026-10-23`:
the broker-import UI stays IPD-owned and is **hosted through IRR** by governed package export — IPD owns
the components and the import/identity/provenance domain; IRR owns routing, navigation, host process,
transport and the `PortfolioStorePort` implementation. No file moves between repositories.

**Consequences for this act, stated exactly:**

| Item | Effect |
|---|---|
| §9 register item **U0** | **Discharged** by the decision above. No other register item is closed |
| §1 **Increment A** (host seam, `hostBrokerImportBoundary.ts` + test, unreachable by construction) | **Superseded in direction.** Its "must not be imported by any product file" property existed only because no consumer was authorized. A consumer is now *named* (the CAP-02 surface) but still not authorized; the seam is therefore folded into the successor act as part of a whole composition rather than as a standalone unreachable module |
| §1 **Increment B** (product exposure) | **Superseded in direction** by the successor act's Increments B and C, which split refusal-faithful composition from the durable success path; the original's U0–U7 gating is preserved item-for-item |
| §4.2 / §4.3 file lists | **Not authorized then and not authorized now.** They are inherited, renamed and constrained by the successor act |
| §6 tests `T-HB-1`…`T-HB-8` | Inherited; `T-CB-*` in the successor act is a superset |
| §7 normative requirements `ID/PROV/TXN/IDEM/FAIL/DUR/READ` | Inherited unchanged; re-verified at the current IPD tree as §4 of the successor act |
| §8 exclusions, §10 rollback | Inherited unchanged |
| **This act's status** | **PREPARED — NOT EFFECTIVE**, unchanged. It authorizes nothing, then and now |

**Successor act:** `IIPS_v3.0_CAP02_BROKER_IMPORT_UI_COMPOSITION_ACT_2026-10-23-02.md`
(`IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-2026-10-23-02`), also **PREPARED — NOT EFFECTIVE**, blocked
on **B-1** — an IPD package export that does not exist, and an IPD `main` packaging layer that does not
exist — plus U2 and the W-1 conjunction. Its Increment B is deliberately limited to a path on which every
write is refused by IPD with zero store effect, because that path is fully testable and changes no gate.

**What did not change:** `WRITE_NOT_AUTHORIZED` before mutation; all twelve IRR `/api/user-portfolios*`
route-method pairs at `503`; contract v1; the durable store and schema; `SESSION_ONLY` / `durable:false`;
Gate 3's bounded scope; Gate 4 `PROPOSED / NOT EFFECTIVE`; result acceptance `NOT RENDERED`; Gate 5 not
granted; operational writes not authorized; no IPD mutation; no G24 revival; no CAP-03 dependency.

*Addendum rendered under the standing grant; it decides nothing, moves no gate, and authorizes no file.*
