# IIPS v3.0 — `O-05` production-consumer PA decision request — **PROPOSED — NO DECISION RENDERED — NOT EFFECTIVE**

> ## STATUS: **DECISION REQUEST ONLY. NO ROUTE IS SELECTED. NOTHING HERE IS EFFECTIVE.**
>
> This instrument **requests** a Program Authority decision on `O-05` (*"wire a production consumer for the
> durable broker-import leg, then obtain admission"*). It renders **no** decision, selects **no** route,
> authorizes **no** implementation, moves **no** gate, lifts **no** fence, changes **no** admission status
> and alters **no** record. `O-05` remains **`OPEN`**.
>
> **Nothing was implemented in the pass that produced this request.** No consumer was written, no guard was
> touched, no IPC operation was added, no migration or schema changed, no IRR calling surface changed, and
> no test was added or altered. The seven documentation discrepancies identified in the `2026-10-30`
> reassessment are **not** corrected here (see §10); they are separate items and correcting any of them
> would authorize nothing.

| Field | Value |
|---|---|
| **Record type** | Program Authority decision request — `O-05` durable broker-import consumer (capability-matrix row 28) |
| **Request record ID** | `IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-REQUEST-2026-10-30-01` (census immediately before publication: **`0` occurrences** in either repository — the identifier is **assigned to this request**, not to a decision) |
| **Reserved decision ID** | `IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-2026-10-30-01` — **reserved, not assigned.** Census: `0` occurrences in either repository. Must be re-censused by the PA at the moment of issue (§8.4) |
| **Option identifiers** | `O5-A` (Route A), `O5-B` (Route B), `O5-N` (neither). Census: `0` occurrences in either repository |
| **Prepared** | `2026-10-30` (UTC), actual date — not backdated |
| **Deciding authority** | **Ramki — Program Authority**, cross-repository capacity (the capacity that rendered Gate 3 acceptance, the Gate 4 target-host qualification act, the Gate A′ successor provisioning act, `P1-F`, `C4-2`, PA-19 and PA-20) |
| **Repository and locus** | `ramkivs/iips-review-recovered` (**IRR**) — `O-05` is an IRR register item and this request is IRR-published. **IPD is read-only in this pass and was not written.** Route A implementation is IPD-owned and is described here, not performed or staged |
| **IRR baseline** | `refs/heads/main` @ **`238dfa3185fcb77aac1a50e1d8dee60856c9739d`**, tree `e3efd92279f834b1bfe5230e8fe310a38ba40a73`; one open PR (**#382**, not merged, not touched, no `O-05` content) |
| **IPD baseline (read-only)** | `refs/heads/main` @ **`aa356ec222527e78462740fb6c91d34b9ff6cbbc`**, tree `79a9fb6cc4b05b748a402cb604cd3f03419a1d45`; `0` open PRs |
| **Basis documents** | O-05 read-only reassessment `2026-10-30` (`O05_READ_ONLY_REASSESSMENT_2026-10-30.md`); IPD row-28 decision packet `2026-10-28` (`IIPS_V3_CAP03_ROW28_DURABLE_BROKER_IMPORT_ADMISSION_DECISION_PACKET_2026-10-28.md`, **PROPOSED — NOT EFFECTIVE**); Gate 4 act `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01`; Gate A′ successor act; U2 write-guard adapter act; IRR tracker `§16.81.6`, `§16.81.8`, `§16.206` |
| **Supersedes** | **Nothing.** Adds no supersession, no re-scoping, no waiver and no dated pointer to any existing statement |
| **Scope of what is requested** | Non-production, single-user, personal use. **Production remains out of scope.** No route asked for here grants production eligibility, deployment or operation |

---

## 1. Why this request exists

`O-05` (IRR tracker `§16.150.5`, line `13122`) reads:

> `| **O-05** | 28 | IPD durable broker-import leg has no production consumer; admission withheld | `GOV-03`/`BI-08` admission act |`

Two facts are established and are not in dispute:

1. **The durable broker-import leg exists, is tested, and has no non-test consumer.** At IPD `aa356ec2`,
   `DurablePortfolioStorePort` and `persistBrokerImport` have **`0` non-test importers**; the only non-test
   references are the two defining modules themselves and a fence in `scripts/verify-public-package.mjs:268–273`
   that asserts the symbols are absent from the browser bundle.
2. **No effective act authorizes a consumer.** The U2 write-guard adapter act limits itself (*"No new
   configuration, environment switch, authorization token, store bypass, or **write route** is permitted…
   the existing methods, guard logic, durability vocabulary, and **IPC caller behavior remain unchanged**"*);
   the Gate A′ successor act §5.1 says changes to any existing `src/` module are *"Prohibited **without a
   further act**"*; and the `2026-10-28` packet records that wiring ahead of S6b is *"parallel-capable …
   only if the Program Authority expressly authorizes"* it, and that *"that authorization is not requested
   here and **does not** exist."*

The request therefore puts **one** question to the PA, with exactly two bounded routes and a third
"neither" option. It does not re-open the investigation: the census, the code reading, the prerequisite
statuses and the four satisfied prerequisites are taken from the `2026-10-30` reassessment and were not
re-measured except where §11 records a specific check.

### 1.1 What has already moved (recorded so the PA sees current state, not the 2026-10-28 state)

| Row-28 / `§16.81.6` prerequisite | Status today |
|---|---|
| (1) IPD publication of the candidate | **SATISFIED** — IPD PR #45 merged `2026-10-22T17:13:17Z` → `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` |
| (2) first half — an effective Gate 4 qualification authority act | **SATISFIED** — effective `2026-10-23` (`AUTHORIZED — NOT STARTED`) |
| (5) contribution-schema act (migration `004`) | **SATISFIED** — `IIPS-V3-CAP02-U2-PROVENANCE-SCHEMA-ACT-2026-10-23-01`; migration `004` blob `6bad5a50…` (six nullable provenance columns) |
| (6) envelope-gap act | **SATISFIED** — `IIPS-V3-CAP03-DR2-DQ1-PA-DECISION-2026-10-25-01` §2 Option A; IPD PR #89 → `79d06e3c…`; IRR PR #265 merged `2026-10-25T13:47:14Z` |
| (2) second half, (3), (4) — `QE-1`…`QE-11`, Gate 4 result acceptance, Gate 5 (`CV-52`) | **OPEN** — `QE 0/11`; acceptance not rendered; Gate 5 `NOT INITIATED / NOT ADMITTED` |
| Not in row 28's list but required for a durable write: `P-1` provisioning, H-12 adoption, S3, DQ-4 freeze | **OPEN** — `P1-F` rendered, **one attempt, unspent**; H-12 **NOT ADOPTED**; S3 not started; DQ-4 freeze not performed |

**Paid-for clarity:** the Windows-host, PowerShell, operator-presence and Windows/operator-evidence
requirements are **`PA-WAIVED — NOT A BLOCKER`** (PA-19 `§16.202`, PA-20 `§16.205.1`). They are not listed
as blockers anywhere in this request. **A waiver asserts no fact**: no QE item, provisioning attempt,
capture or H-12 artifact exists, and none is claimed.

---

## 2. The question, put once

> **Which route does the Program Authority select for `O-05`:**
> **(A)** a bounded PA authorization to introduce a non-test, shipped-code consumer of the IPD-owned
> `DurablePortfolioStorePort` / `persistBrokerImport` leg, with the consumer demonstrably refusing and with
> no gate, fence, IPC operation, guard or admission status changed;
> **(B)** completion of the S6 governance and acceptance chain (`QE-1`…`QE-11` → Gate 4 result acceptance →
> Gate 5 admission / `CV-52`), with no consumer introduced;
> **(N)** neither, in which case `O-05` remains blocked as recorded and no further action on it is
> authorized by this request.

The routes are **not interchangeable** and §6 states why with governing citations, including the fact that
**neither route alone closes `O-05`**.

---

## 3. What "production consumer" means in this request

> A **non-test, shipped-code** path — code compiled into the non-production application's Node build, not a
> test, not a fixture, not a bare store — that constructs `DurablePortfolioStorePort` and calls
> `persistBrokerImport(port, owner, request)`, so that a caller other than a test reaches the durable
> persistence port and receives its governed outcome.

It is **not** production deployment, **not** production admission, and **not** a substitute for either.
Three properties bound it:

| Property | Consequence |
|---|---|
| The port's write gate is `authorized:false` by construction (`portfolio_store.ts:207–218`, W-1(3)/W-1(4)) | Any such consumer **must** refuse: `persistBrokerImport` catches `WriteNotAuthorizedError` and returns `{ok:false, code:'WRITE_NOT_AUTHORIZED', storeEffect:'NONE'}` (`brokerImportPersistence.ts:333`, `:236`) |
| The refusal happens inside `DurablePortfolioStorePort.assertWritable()` **before** any database transaction or callback (`durablePortfolioStorePort.ts:39–44`, `:62–65`) | Zero store effect: no row created, changed or deleted; `db.isTransaction === false` |
| The only sanctioned host is the IPD Node side (`scripts/verify-public-package.mjs:268–273`; `tests/portfolio_ui_package.test.ts:228–229`) | A browser-side consumer is not merely unwritten — it is forbidden and regression-tested. TCP/IP binding: none of this reaches production |

---

## 4. Route A — bounded PA authorization

### 4.1 The exact implementation boundary requested

**Additive, minimal, and closed at the file level.** If `O5-A` is selected, the authorization would extend
to exactly the following, and to nothing else.

| # | Repository | Path | Change permitted | Purpose |
|---|---|---|---|---|
| **A-1** | **IPD** | `src/ipc/brokerImportConsumer.ts` | **new file.** One exported factory and one exported function: build a `DurablePortfolioStorePort` over the caller's existing `DatabaseSync` handle and delegate to `persistBrokerImport`. No defaults, no environment read, no flag, no retry, no store construction of its own | the consumer itself |
| **A-2** | **IPD** | `src/ipc/entrypoint.ts` | **bounded edit.** Import and invoke the consumer from an existing shipped (non-test) call site on the entrypoint's existing store handle, inside the existing binding/authorisation flow | makes the consumer reachable from shipped code; removes the "definition-only" objection |
| **A-3** | **IPD** | `tests/q1_broker_import_consumer_wiring.test.ts` | **new file.** Asserts: (i) the writer is `DurablePortfolioStorePort`, and the test **fails** if a bare `DurablePortfolioStore` is substituted; (ii) outcome `WRITE_NOT_AUTHORIZED` / `storeEffect:'NONE'`; (iii) row counts unchanged across portfolios, revisions, holdings and contributions; (iv) no transaction begun and the transaction callback not invoked; (v) a static non-test importer census of ≥1 (a shipped import edge exists) | executed evidence for the claims in §4.2 |

**Prohibited without a further act — every one of these is an explicit condition of `O5-A`:**

| Prohibited path or behaviour | Why |
|---|---|
| `src/persistence/portfolio_store.ts` — including `evaluatePortSaveGuard()` and the W-1 conjunction | designated blob `4a005b73…` / `540d49f2…`; the guard must remain hard-`false` (W-1(3)/W-1(4)) |
| `src/ipc/dispatch.ts` — and in particular **any** change to `IPC_WRITE_OPERATIONS` or the refusal branch at `:228–233` | designated blob `27becc76…`; the write set stays exactly `portfolio.create` / `portfolio.save` / `portfolio.reset` / `portfolio.delete` (`protocol.ts:34–39`) |
| `src/ipc/protocol.ts` — no new operation, no change to the closed operation set | contract v1 §6; a new op would be a contract-shape change (a **separate** reserved decision, not Route A) |
| `src/persistence/durablePortfolioStorePort.ts` | needs no change: `withBrokerImportTransaction` already exists and already refuses first |
| migrations `001`–`004`, any schema, `package.json`, lockfiles, `tsconfig*.json`, `vite.config.ts`, `.github/workflows/**` | designated / frozen / out of scope |
| any existing test other than the **new** `A-3` file | avoids disturbing the H-12 candidate surface and the Gate 3 manifest |
| `frontend/**` (IRR), every IRR path, any IRR route or adapter | IRR is a separate ownership domain (§4.3); reaching the IRR UI would require an IPC operation change, which `O5-A` expressly excludes |
| `scripts/run-tests.mjs` and the Limb A boundary | Limb A is exhaustively defined elsewhere (Gate 4 act §4.2); a consumer is **not** Limb A |

### 4.2 What Route A would **not** do — ten express negative determinations

`O5-A`, if selected, **would not**:

| # | Not authorized by Route A | The clause or code that keeps it so |
|---|---|---|
| 1 | **Authorize durable persistence or any successful durable write** | `evaluatePortSaveGuard()` returns literal `authorized:false`; `assertWritable()` throws before any transaction; `persistBrokerImport` maps that to `WRITE_NOT_AUTHORIZED` / `storeEffect:'NONE'` |
| 2 | **Change the existing `authorized:false` guard** | `portfolio_store.ts` is excluded by name (§4.1) and is a designated blob |
| 3 | **Open or modify the IPC write-operation set in `dispatch.ts`** | `dispatch.ts` and `protocol.ts` are excluded; the op set stays the same four writes |
| 4 | **Change existing caller behaviour or introduce an unauthorized write route** | No caller's request/response handling changes; the new call site adds no route, no operation and no response surface. The U2 act's *"no new … write route"* and *"IPC caller behavior remain unchanged"* remain in force for every existing surface |
| 5 | **Satisfy `QE-1`…`QE-11`** | `QE 0/11` is untouched; a consumer that refuses cannot satisfy any admitted-write limb, and component tests are not qualification (Gate 4 act §5 rule 4) |
| 6 | **Constitute Gate 4 result acceptance** | Gate 4 act §14 lists result acceptance as a distinct instrument over executed host evidence; passing tests never supply it (§7) |
| 7 | **Authorize Gate 5 naming or admission of operations** | Gate 5 admits **named** operations (`§16.81.8` item 7); `O5-A` names none and lifts no fence |
| 8 | **Satisfy `CV-52` / G24 admission** | `CV-52` remains `BLOCKED`; the G24 lineage (row 32 / `REG-12`) is untouched and is a different lineage |
| 9 | **Authorize H-12 adoption, S2/Limb A changes or the DQ-4 freeze** | All three are separate instruments (Gate 4 act §8; §4.2 Limb A boundary; IPD tracker `§1352` sequencing). H-12 remains **NOT ADOPTED** |
| 10 | **Grant production eligibility or production deployment authority** | Production remains `NOT ADMITTED`; the scope is non-production, single-user; no `durable:true` claim, no `503` lift, no `V1295` |

**Additionally, and stated because it is easy to overclaim:** Route A would not make the durable write
*observable*, would not create a store or binding (that is `P-1`), would not make the IRR broker-import UI
reach the leg (that needs an IPC operation change, expressly excluded), and would not shorten Route B by a
single step except that a consumer would already exist when the QE chain runs.

### 4.3 Repository ownership, and the no-cross-repository-write rule

| Element | Owner | What Route A does |
|---|---|---|
| `persistBrokerImport`, `DurablePortfolioStorePort`, `DurablePortfolioStore`, migrations `001`–`004`, `src/ipc/*` | **IPD** | implements **inside IPD only**; IPD owns the consumer because IPD owns the leg |
| The IPC transport shape, the operation set, the write gate | **IPD** | unchanged |
| IRR HTTP route, DTO validation, response mapping, browser surface, IRR port adapter | **IRR** | **not touched.** Any IRR calling-surface change is a **separate IRR-owned act** and is not part of `O5-A` |
| Tracker, capability matrix, `CV-*` / `O-*` registers | **IRR** | registration by pointer only, after the act is published |
| Gates, acceptance, admission, pins | **PA** | unchanged |

**No cross-repository writes.** The Route A act authorizes an IPD implementation; the IRR record registers
it by pointer. Neither repository writes to the other, and neither session may write IPD code under an IRR
publication. If the PA wishes the IRR route to reach the consumer, that is a second, IRR-owned act over an
IPC operation that does not yet exist — and the IRR route's own binding precondition
(`brokerImportHttp.ts:236–240`, returns `503 owner-context-unavailable` before any IPC call) means it could
not reach the leg until `P-1` runs anyway.

### 4.4 Evidence Route A must produce before `O-05` may be described as narrowed

| ID | Evidence | Type |
|---|---|---|
| `A-E1` | Merged commit, green PR-head and post-merge CI, remote read-back of every changed blob | publication |
| `A-E2` | The non-test importer census repeated at the merged commit: **≥1** importer of `DurablePortfolioStorePort` or `persistBrokerImport` under `src/` | static, executed |
| `A-E3` | `A-3` test executed: refusal `WRITE_NOT_AUTHORIZED`, `storeEffect:'NONE'`, zero row delta across all four statement classes, no transaction begun | executed (Linux CI acceptable; host evidence is `PA-WAIVED`) |
| `A-E4` | Guard blob unchanged across the change (`portfolio_store.ts` byte-identical), `dispatch.ts` and `protocol.ts` byte-identical, browser-pack forbidden-token check still `forbiddenHits: []` | integrity |
| `A-E5` | Statement that no gate, fence, pin, `BASIS_COMMIT`/`BASIS_TREE`, `CV-*` status or admission status moved | attestation |

### 4.5 Authority analysis — is Route A genuinely available?

**Finding: Route A is available in principle, but not under existing authority. It requires a new,
narrowly scoped PA act. It does not require that act to supersede any prior restriction; it requires the
act to be expressly additive.**

| Apparent restriction | Actual text | Effect on Route A |
|---|---|---|
| Gate A′ successor act §5.1 | *"Prohibited **without a further act**: … any existing `src/` module (including `provisioning.ts`, `binding.ts`, `audit.ts`, `connection.ts`, `portfolio_store.ts`, `dispatch.ts`) … and any IRR path."* | **Conditional, not absolute.** A further act is the lawful route; the clause anticipates it. No supersession needed |
| U2 write-guard adapter act | *"This act authorizes only the adapter method necessary… No new … **write route** is permitted… **IPC caller behavior remain unchanged**."* | Self-limited to that act. A later act may authorize a consumer that adds **no** route and changes **no** caller behaviour — which is exactly the `O5-A` boundary |
| Gate 4 act §4.2 / §4.4 | Limb A boundary is **exhaustive**, and any unlisted path inside it is a stop | Binds **Limb A only**. A consumer is not Limb A and is not asserted to be; `O5-A` expressly excludes the Limb A files |
| Gate 4 act §15.3 | *"Effectiveness authorizes the work named in §§4–13 and **nothing else**."* | Neither authorizes nor forbids a consumer. It simply does not cover one |
| Gate 4 act §15.2 stop conditions | *"…any attempt to make a write succeed through an operational path… stop, record, return to the PA."* | `O5-A` makes no write succeed; a refusing consumer is the opposite of the prohibited attempt |
| `2026-10-28` packet §9 | Wiring ahead of S6b requires express PA authorization which *"does not exist"* | Correct as of its date. The packet is **not effective** and supplies no authority; a new act would supply it. No supersession of an act is involved |
| `CV-39` instruction | *"take no independent **runtime-enablement** action before those separate PA acts"* | Forbids runtime enablement. A consumer that refuses enables no runtime |

**Result:** `O5-A` is **additive**, **supersedes nothing**, and must state that it **does not amend** the Gate 4
act, the Gate A′ successor act, the U2 write-guard adapter act, Gate E W-1, contract v1, or any fence. Its
only "qualification" of existing text is of a **non-effective** packet's statement that no such authorization
exists — which a rendered act makes true by existing.

**One caveat the PA should weigh:** if the PA were to widen `O5-A` to include an IPC operation so that the
IRR UI can reach the consumer, that widened variant **would** modify designated blobs (`dispatch.ts`,
`protocol.ts`) and would engage the Gate 4 act §3.2 commit rule and the successor act §2.1 designation. It
is deliberately **excluded** from `O5-A` and would require its own instrument.

---

## 5. Route B — complete the S6 governance and acceptance chain

### 5.1 The prescribed sequence and its dependencies

Governing text: Gate 4 act §6 (rows `S0`–`S6`), §7 (QE grant and its boundaries), §8 (H-12), §3.2 (four-part
commit rule); `§16.81.6` and `§16.81.8`; CAP-03 IPD tracker `§1352` §6 (freeze → regeneration → run order).

| Step | Action | Owner | Status today | Depends on |
|---|---|---|---|---|
| **B-0** | **DQ-4 freeze** — designates the final CAP-03 pin after DR-2…DR-4r have landed | PA | **not performed** | DR-2/DR-4r closure (both implemented) |
| **B-1** | **S2 / Limb A** — implement → merge → green CI → read-back → native canonical `npm test`; **the QE execution pin is the final post-merge Limb A commit** | PA / IRR+IPD | **AUTHORIZED — NOT STARTED**. `PA-06` admitted the `a891802e` run **as L2a only**, expressly *not* as a Gate 4 Limb A S2 result; `PA-09` open | — |
| **B-2** | **S1 — Gate A′ provisioning (`P-1`)**, one attempt under `P1-F` (identity fixed; `--execution-commit a891802e…`) | operator | **authorized, one attempt, unspent; not executed** | store parent + entrypoint; availability `PA-WAIVED` |
| **B-3** | **S2a — H-12 regeneration at the final commit + separate express PA adoption** | PA | **NOT ADOPTED; no baseline effective** | B-1 and B-2 final commits |
| **B-4** | **S3 — host/runtime preflight** (`win32`, non-elevated, Node `>=22.13.0 <23`, flag-free `node:sqlite`, clean trees at the designated commits) | host executor | not started | B-2, B-3 |
| **B-5** | **S4 — `QE-1`…`QE-11`** executed and recorded under the act's seven-item grant | host executor | **0/11** | B-4 |
| **B-6** | **S5 — evidence integrity**: manifests, before/after digests, byte hashes, publication, independent read-back | host executor + recorder | blocked until B-5 | B-5 |
| **B-7** | **S6a — Gate 4 result-acceptance act** (`W-1(3)`) | **PA** | **not rendered** | B-6 |
| **B-8** | **S6b — Gate 5 admission act (`CV-52`)** naming qualified commits, boundaries, fence state, evidence and **named operations** (`W-1(4)`) | **PA** | **NOT INITIATED / NOT ADMITTED**; `CV-52` `BLOCKED` | B-7 |

Open PA items that are **not** prerequisites of this chain but remain open (recorded for completeness):
`PA-01` (A-Q4 / G4P-1 record conflict), `PA-02` (A-Q4 determination), `PA-03` (sequencing ratification),
`PA-07`, `PA-09` (see B-1), `PA-11`, `PA-17`. `PA-09` **is** on the critical path for B-1.

### 5.2 What Route B can and cannot establish

| Can establish | Cannot establish, on current authority |
|---|---|
| A qualified host run at designated commits with recorded evidence | **A non-test consumer** — Route B adds no code and no call site; state 2 stays "not wired" |
| A Gate 4 result-acceptance act over executed evidence | **A durable write** — `W-1(3)`/`W-1(4)` remain false until B-7/B-8; and QE's admitted-write limbs are, by the act's own words, *"necessarily recorded as limitations under current authority"* (Gate 4 act §5 limitation) |
| A Gate 5 act admitting **named** operations | Admission of the broker-import leg if the act does not **name** those operations (`§16.81.8` item 7: *"lifting named operations only"*) |
| Closure of `CV-52` for the lineages it names | Any effect on row 28 unless the durable import path is one of the named operations **and** a consumer exists to exercise it |

**Consequence:** a completed Route B is a **governance-complete, consumer-empty** outcome. That is a lawful
and useful outcome — it is the only route that can ever move `W-1(3)`/`W-1(4)` — but on its own it does not
satisfy `O-05`'s sentence, because the leg would still have no non-test caller.

### 5.3 The ordering question Route B raises (recorded, not resolved)

`O-05`'s full sentence is *"wire a consumer … **then** obtain admission."* The records admit two readings,
and this request does not choose between them:

1. **Wire-later** — the register's own option B (tracker `:1358`) frames the work as *"the wiring of an
   admitted store"*, i.e. wiring follows admission. Under this reading Route B must complete first, and
   `O-05`'s "then" is temporal.
2. **Wire-first, refuse-only** — the packet's §9 expressly contemplates wiring ahead of S6b under express
   PA authorization. Under this reading `O-05`'s "then" is conjunctive (wire, and separately obtain
   admission), not temporal.

`O5-A` is the lawful form of reading 2 and is safe under either reading because it changes no gate. A PA
that prefers reading 1 can select `O5-B` and defer wiring, at the cost of an `O-05` that stays open after the
whole chain.

---

## 6. Determination — is S6 mandatory before a consumer may be implemented, or an alternative?

**Determination (not an assumption; each element cited):**

> **S6 is mandatory for *admission*. It is not a precondition for *implementing* a consumer. Therefore
> Route B is not a prerequisite of Route A, and Route A is not an alternative to Route B in respect of
> admission. Route A is an alternative to Route B only for the wiring step, and only under a new act.
> Neither route alone closes `O-05`.**

| # | Governing text | What it does, exactly | What it does not do |
|---|---|---|---|
| 1 | Gate 4 act §6, dependency paragraph: *"provisioning precedes qualification …; Limb A precedes the QE execution pin; H-12 adoption follows Limb A and precedes preflight; **acceptance follows execution; admission follows acceptance**"* | orders the steps **inside** the qualification chain | does not say "no implementation before S6", and does not mention a consumer at all |
| 2 | Gate 4 act §15.3: *"Effectiveness authorizes the work named in §§4–13 and nothing else"* | caps the act's own grant | neither authorizes nor forbids a consumer |
| 3 | Gate 4 act §4.4: *"If any of §4.2's conditions cannot hold — an unlisted path becomes necessary … stop and return for PA disposition"* | bounds **Limb A** | not a general bar on implementation |
| 4 | Gate A′ successor act §5.1: *"Prohibited **without a further act**: … any existing `src/` module … and any IRR path"* | makes an act the gateway | does not prohibit the act; expressly contemplates one |
| 5 | U2 write-guard adapter act: *"No new … **write route** is permitted… **IPC caller behavior remain unchanged**"* | scoped to that act and its one-method amendment | does not bind a later, differently scoped act |
| 6 | `2026-10-28` packet §9: *"…only if the Program Authority expressly authorizes wiring ahead of S6b; that authorization is **not** requested here and **does not** exist."* | states the current absence of authority (correct on its date) | is **not an effective act**; supplies no prohibition, only the absence |
| 7 | `CV-39` instruction: *"take no independent **runtime-enablement** action before those separate PA acts"* | forbids runtime enablement ahead of the acts | does not forbid code that cannot enable anything |
| 8 | Gate 4 act §15.2 stop condition: *"any attempt to make a write succeed through an operational path"* | prohibits success-producing paths | is satisfied by a consumer that refuses |
| 9 | Register option B (tracker `:1358`): *"…and the wiring of an admitted store"* | a **register option**, describing one way to sequence the work | is not an act, and does not make wiring-after-admission a universal rule |
| 10 | Gate 4 act §5 limitation: *"QE-2…QE-9's admitted-write limbs will necessarily be recorded as limitations under current authority"* | means Route B records LIMITATION, never PASS, for admitted writes | proves S6 alone cannot demonstrate a durable write |

**Therefore:**

* **Route A requires a new act** (clauses 4 and 5 gate it), and that act needs to **supersede nothing** —
  clause 4 is conditional, clause 5 is self-scoped, and clause 6 is a non-effective packet.
* **Route B is mandatory for admission** (clauses 1, 7 and the S6 dispositions) and **cannot be skipped** by
  doing Route A.
* **Neither route alone closes `O-05`** (clause 9 vs the packet §9 reading; clause 10 for the write).

---

## 7. Route A versus Route B — decision table

| Dimension | **Route A (`O5-A`)** | **Route B (`O5-B`)** |
|---|---|---|
| **Authority required** | **A new, bounded PA implementation act** (§4.5). No supersession; must be expressly additive and must disclaim amendment of the Gate 4 act, the successor act, the U2 act, W-1 and every fence | **No new act beyond the S6 instruments already prescribed**: DQ-4 freeze, `PA-09` disposition, Gate 4 result-acceptance act, Gate 5 act (`CV-52`), H-12 adoption. All reserved to the PA; none routine |
| **Implementation permitted** | Exactly `A-1`…`A-3` (§4.1): one new IPD module, one bounded entrypoint call site, one new test. Nothing else | **None.** Route B authorizes no code; the only permitted implementation in the chain is Limb A's exhausted test-runner change (Gate 4 act §4.2). A consumer is **not** included |
| **Prerequisites** | None technical. Preferable (not required): a store handle exists (`P-1` not needed for the code; needed only to reach the port with a valid owner) | **DQ-4 freeze → Limb A/S2 (+ `PA-09`) → `P-1` (`P1-F`, one attempt) → H-12 regeneration + adoption → S3 preflight → `QE 0/11` → S5 evidence → S6a → S6b.** Host availability/evidence are `PA-WAIVED` but unexecuted |
| **Gates and records affected** | `O-05` description only (state 2 → "consumer exists and refuses"); `§18.1` row 28 remains `BL`; no gate, fence, pin or status moves. H-12 candidate surface changes → regeneration must follow, not precede, adoption | DQ-4 freeze record; Limb A merge is the QE pin; H-12 v3 adopted; `QE 1…11` recorded (0/11 → some PASS/LIMITATION mix); Gate 4 result acceptance rendered (`W-1(3)` true); Gate 5 rendered (`W-1(4)` true for **named** operations); `CV-52` moves only as its act says; row 28's col 15/16 move only if the act names the durable operations |
| **Gates and records explicitly unaffected** | W-1(3)/W-1(4); `evaluatePortSaveGuard`; `IPC_WRITE_OPERATIONS`; `dispatch.ts` and `protocol.ts`; migrations/schema; contract v1; all fences (`IMMUTABLE`, `503`, `durable:true`); `CV-52`/G24; Gate 4 authority/execution/acceptance; Gate 5; `CV-39`; `REG-12`; production | Nothing about the consumer: state 2 remains "not wired"; no code, no route, no IPC op. If Gate 5 names no broker-import operation, row 28 stays `BL` even after admission |
| **Repository ownership** | **IPD** implements (§4.1); IRR registers by pointer; **no cross-repository writes**. IRR calling-surface changes are a **separate IRR act**, excluded | Split as recorded: IPD hosts the Gate 4/Gate 5 acts, the IRR tracker registers them; Limb A is IPD test-runner work; `P-1` is an IPD-owned operator execution; H-12 is an IPD manifest over both loci. IRR publishes the `P1-F`-class authorizations |
| **Evidence required** | `A-E1`…`A-E5` (§4.4): merged commit + CI + read-back; non-test census ≥1; executed refusal test with zero effect; unchanged guard/dispatch/protocol blobs; attestation of no status movement | The full Gate 4 §8/§9 evidence regime: per-item command, exit code, UTC times, host identity, Node version, commit/tree, pre/post row counts, IPC transcripts, restart read-backs, refusal matrices, digest manifests, independent read-back; plus the acceptance and admission acts themselves |
| **Resulting `O-05` status** | **Remains `OPEN`.** Narrowed: state 2 becomes "a non-test consumer exists and demonstrably refuses"; states 3–5 unchanged; the "obtain admission" half untouched | **Remains `OPEN`** unless the Gate 5 act names the durable broker-import operations **and** a consumer exists. With no consumer, a naming would be vacuous; with admitted-write limbs recorded as LIMITATION, no durable write is proven |
| **Principal risks and limitations** | (i) A consumer whose only behaviour is refusal can be misread as progress — mitigated by stating the ten negatives (§4.2) and by not moving any status; (ii) it cannot reach the IRR UI without an IPC op change (excluded), so "the intended application flow reaches it" stays unproven; (iii) it is dead-ish shipped code — a PA may reasonably judge it not worth an act; (iv) it changes an H-12 candidate path, so H-12 regeneration must follow it | (i) Long chain with several PA-only steps and an unspent single attempt (`P1-F` is **single use**; a failed attempt spends it); (ii) admitted-write limbs are structurally LIMITATION, so completion may be an acceptance of limitations; (iii) `PA-09` is unresolved and on the critical path; (iv) completion is governance-heavy and produces no user-visible capability on its own; (v) any non-documentary drift after the QE pin is designated is a **stop** requiring re-designation |
| **What remains unauthorized after completion** | Durable writes; guard change; IPC write set; Gate 4 acceptance; Gate 5 admission; `CV-52`/G24; H-12 adoption; S2/Limb A; DQ-4 freeze; QE; production; `durable:true`; any `503` lift; any IRR change | A consumer and therefore the durable import *path*; the broker-import operations unless named; any write while `W-1` is unmet before B-7; production; `durable:true`; any capability outside the named operations |

**Reading of the table:** Route A is cheap, additive and honest, and it buys exactly one thing — the leg stops
being definition-only. Route B is expensive, mandatory for admission, and buys governance completeness plus
the only lawful path to a true write gate. **`O-05` in full requires A then B (or B then A for the code, with
`O-05` closing only when both are done), and the request deliberately does not pre-empt that ordering choice.**

---

## 8. PA decision wording

### 8.1 What the PA is asked to sign

The PA selects **exactly one** option by marking exactly one box and issuing the act as its own instrument.
The act must reproduce the selected option **verbatim** from §8.2 and must carry the metadata in §8.3–§8.5.
Until that act is issued **and published**, this request remains *PROPOSED — NOT SELECTED — NOT EFFECTIVE*
and none of its content authorizes anything.

### 8.2 The exact selectable text

```
PA DECISION — O-05 DURABLE BROKER-IMPORT CONSUMER
Act ID: IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-2026-10-30-01   (census-verified at issue)

Selected option (mark exactly one):
  [ ]  O5-A — ROUTE A
  [ ]  O5-B — ROUTE B
  [ ]  O5-N — NEITHER

------------------------------------------------------------------
OPTION O5-A — ROUTE A: BOUNDED PA AUTHORIZATION
------------------------------------------------------------------
The Program Authority selects Route A and authorizes ONE bounded implementation act, and nothing else:

1. SCOPE. A non-test, shipped-code consumer of the IPD-owned durable broker-import leg may be added in
   `ramkivs/iips-production-market-data` only, limited to:
   (a) a new file `src/ipc/brokerImportConsumer.ts` exporting one factory and one function that construct
       `DurablePortfolioStorePort` over the caller's existing database handle and delegate to
       `persistBrokerImport`;
   (b) a bounded edit to `src/ipc/entrypoint.ts` introducing the single call site;
   (c) a new file `tests/q1_broker_import_consumer_wiring.test.ts`.
   No other path may change.

2. PROHIBITIONS. This authorization does NOT permit any change to:
   `src/persistence/portfolio_store.ts` (including `evaluatePortSaveGuard()` and the W-1 conjunction);
   `src/ipc/dispatch.ts` (including `IPC_WRITE_OPERATIONS` and its refusal branch);
   `src/ipc/protocol.ts` or the closed operation set; `src/persistence/durablePortfolioStorePort.ts`;
   migrations 001–004 or any schema; `package.json`, any lockfile, `tsconfig*.json`, `vite.config.ts`,
   `.github/workflows/**`; any existing test other than the new file at 1(c); `scripts/run-tests.mjs` or
   any Limb A path; any `frontend/**` or any IRR path.

3. NEGATIVE DETERMINATIONS. This act does NOT and shall not be read to:
   (a) authorize durable persistence or any successful durable write;
   (b) change the existing `authorized:false` guard;
   (c) open or modify the IPC write-operation set in `dispatch.ts`;
   (d) change existing caller behaviour or introduce an unauthorized write route;
   (e) satisfy QE-1 through QE-11;
   (f) constitute Gate 4 result acceptance;
   (g) authorize Gate 5 naming or admission of any operation;
   (h) satisfy CV-52 / G24 admission;
   (i) authorize H-12 adoption, S2/Limb A changes or the DQ-4 freeze;
   (j) grant production eligibility, production deployment or production operation authority.

4. NOTHING AMENDED. This act amends no effective instrument. It does not amend the Gate 4 target-host
   qualification act, the Gate A′ successor provisioning act, the U2 write-guard adapter act, Gate E W-1,
   contract v1, any fence, any pin, `BASIS_COMMIT` or `BASIS_TREE`. It supplies the express authorization
   whose absence the 2026-10-28 row-28 packet recorded; that packet is not effective and is not superseded.

5. REQUIRED EVIDENCE. Before O-05 may be described as narrowed, the implementing pass must publish:
   the merged commit with green PR-head and post-merge CI and remote blob read-back; a repeated non-test
   importer census showing at least one importer under `src/`; the executed refusal test showing
   `WRITE_NOT_AUTHORIZED`, `storeEffect:'NONE'`, zero row delta across all four statement classes and no
   transaction begun; byte-identical `portfolio_store.ts`, `dispatch.ts` and `protocol.ts`; a browser-pack
   forbidden-token check with no hits; and an attestation that no gate, fence, pin, CV-* status or admission
   status moved.

6. STATUS CONSEQUENCE. O-05 remains OPEN. Only its state-2 limb ("a runtime consumer is wired to the
   persistence port") may be recorded as satisfied at code level. The "obtain admission" limb is untouched
   and remains governed by Route B.

------------------------------------------------------------------
OPTION O5-B — ROUTE B: COMPLETE THE S6 CHAIN
------------------------------------------------------------------
The Program Authority selects Route B and directs completion of the S6 governance and acceptance chain in
the prescribed order, with no consumer introduced under this option:

1. Direct the DQ-4 freeze, then Limb A / S2 with a recorded disposition under PA-09, then the single
   P-1 attempt under P1-F, then H-12 regeneration and separate express adoption, then S3 preflight,
   then QE-1 through QE-11, then S5 evidence integrity, then a separate Gate 4 result-acceptance act,
   then a Gate 5 admission act under CV-52.
2. Require that any Gate 5 act name, explicitly and separately, every operation it admits; and record
   whether the durable broker-import operations are among them.
3. Record that QE-2..QE-9 admitted-write limbs will be recorded as limitations under current authority,
   that a limitation is never a pass, and that no durable write may be claimed on the strength of this
   option alone.
4. Record that O-05 remains OPEN under this option unless and until (i) a non-test consumer exists and
   (ii) a Gate 5 act names the durable broker-import operations.
5. Authorize no code change of any kind beyond the already-authorized Limb A boundary.

------------------------------------------------------------------
OPTION O5-N — NEITHER
------------------------------------------------------------------
The Program Authority selects neither route. No authorization issues and none is implied. O-05 remains
OPEN and blocked as recorded in the tracker, with no further action on it authorized by this decision.
The reserved Route A implementation boundary and the Route B sequence above remain unselected proposals
of record only, and may not be acted on, cited as authority, or represented as pending approval.

------------------------------------------------------------------
EFFECTIVENESS
------------------------------------------------------------------
This decision is effective only on publication of this exact text to the authoritative repository's
refs/heads/main with green CI and independent remote read-back. It is not effective on signature, on
drafting, on inclusion in any branch, or on any representation that the PA "intends" an option. It takes
effect on the actual date of publication and is not backdated. It authorizes only what its selected
option states, and nothing else.
```

### 8.3 Decision owner

**Ramki — Program Authority**, in the cross-repository capacity in which the Gate 3 acceptance, the Gate 4
target-host qualification authority act (`2026-10-23`), the Gate A′ successor provisioning act, `P1-F`,
`PA-19`, `PA-20` and `C4-2` were rendered. No agent, session or repository may render, infer or pre-empt
this decision.

### 8.4 Record-identifier requirements

| Requirement | Rule |
|---|---|
| Decision act ID | `IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-2026-10-30-01` is **reserved, not assigned**. The PA (or a pass acting strictly as recorder after the PA states the selection) **must census it in both repositories at the moment of issue** and, if it is no longer `0`, reassign before publication |
| Option identifiers | `O5-A`, `O5-B`, `O5-N` must each remain `0`-occurrence in both repositories until the act is issued; they must not be reused for anything else |
| Tracker registration | A new `§16.*` section and a `CHG-2026-10-30-*` change-log row must be allocated by census at issue time. **This request occupies `§16.218` / `CV-CORR-198` / `CHG-2026-10-30-13` / `V1672`–`V1681`** because PR #382 (head `a63b19b6…`) claims `§16.216`/`§16.217` and declares `CHG-2026-10-30-12`/`V1662`–`V1671` next-free. Any act must not reuse those |
| Uniqueness | One record ID per instrument; no duplicate `## §16.*` heading; no re-use of a V-row; the act must carry its own date and must not be amended after merge (corrections are new records) |
| Option reproduction | The act must reproduce the selected option **verbatim** as written in §8.2; paraphrase is not selection |

### 8.5 Effective-date and publication requirements

| Element | Requirement |
|---|---|
| Effective date | **On publication**, not on drafting, signature, branch push or intent. Publication = merge commit to `refs/heads/main` + green CI + independent remote blob read-back. Actual date, never backdated |
| Primary publication locus | **IRR** `docs/integration/` (as `O-05` is an IRR register item and this request is IRR-published), plus a tracker `§16.*` registration. **IPD is read-only in this framing**; the IPD-side implementation act (Route A) and the IPD-hosted Gate 4/Gate 5 instruments remain IPD-owned and are cited, not written |
| Alternative locus | If the PA elects to publish the act in IPD instead (as the Gate 4 act was), the act is effective in the same way on IPD `main`, and IRR registers it **by pointer** in a new `§16.*` section. Either locus is acceptable; **the act must say which**, and neither repository may edit the other |
| Pre-publication | The act must be issued as **PROPOSED — NOT SELECTED — NOT EFFECTIVE** until merged; no status may be reported as changed before the read-back |
| Post-publication | Independent read-back of commit, tree, changed-file set and every changed blob; a receipt recorded separately; no edit of the act after merge |

---

## 9. What neither route does — shared non-grants

Neither `O5-A` nor `O5-B`, whether selected alone or together, grants or implies:

durable persistence or a successful durable write · any change to `evaluatePortSaveGuard()` or the W-1
conjunction · any change to `IPC_WRITE_OPERATIONS`, `dispatch.ts`'s refusal branch or `protocol.ts`'s closed
operation set · any change to existing caller behaviour or any unauthorized write route · any `QE-1`…`QE-11`
satisfaction by a test, a merge, green CI or an assertion · Gate 4 result acceptance · Gate 5 naming or
admission · `CV-52`/G24 admission · `CV-39` re-opening · `REG-12` promotion · H-12 adoption · S2/Limb A
change · DQ-4 freeze · `PA-09`/`PA-02`/`PA-03` dispositions · any pin, `BASIS_COMMIT` or `BASIS_TREE`
change · any `durable:true` claim · any `503` lift · `V1295` · any `IMMUTABLE` fence change · production
eligibility, deployment or operation · any IRR code change · any IPD write under an IRR publication.

**`P-1-C` NOT ESTABLISHED. `P-1-D` DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. `P-1` NOT EXECUTED / UNSPENT.
No store, no binding row, no QE item, no capture, no H-12 artifact exists. Nothing above is represented as
having happened.**

---

## 10. Documentation reconciliation — seven separate items, **not performed here**

These are recorded so they are not lost, and so no one assumes the request corrected them. **Each is a
separate documentation item. None was edited in this pass. Correcting any of them authorizes nothing and
does not narrow `O-05`.** Line numbers below are those of baseline `238dfa31…`; the tracker registration that
publishes this request shifts later tracker lines by one, so the **section and cell** references are the
authoritative locators.

| # | File (repository) | Exact passage | Current text | Proposed correction | Owner | Status |
|---|---|---|---|---|---|---|
| **S-1** | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (**IRR**) | `§16.150.5`, line `13122`, `O-05` row, 4th cell (boundary) | *"`GOV-03`/`BI-08` admission act"* | Replace the boundary with the actual instruments: **Gate 4 result-acceptance act → Gate 5 admission act (`CV-52`)**, noting `GOV-03` is an implementation work item and `BI-08` an idempotency contract. Preserve the original text via a dated pointer, do not rewrite it | IRR | **NOT CORRECTED** |
| **S-2** | same tracker (**IRR**) | `§16.81.6`, row 2, line `6354` | Gate 4 act *"`PROPOSED — NOT EFFECTIVE`"*, Act ID *"`PENDING ASSIGNMENT`"* | Add a dated pointer recording that the act is **RENDERED / EFFECTIVE** `2026-10-23` as `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01`, disposition `AUTHORIZED — NOT STARTED`. No text replaced | IRR | **NOT CORRECTED** |
| **S-3** | same tracker (**IRR**) | `§18.1` row 28, line `2669`, cell 9 (Persistence) | *"…**unpublished** (IPD `contents:write` denied — `403`) and **not admitted**"* | Add a dated pointer that the candidate was **published** `2026-10-22` (IPD PR #45 → `73fd8c16…`) — as the same row's cell 18 already records. "Not admitted" stands | IRR | **NOT CORRECTED** |
| **S-4** | same tracker (**IRR**) | `§18.1` row 28, line `2669`, cell 17 (Governance) | Six-prerequisite `BL` list whose items (1), (5) and (6) are open | Add a dated pointer that (1) IPD publication, (5) the contribution-schema act (migration `004`) and (6) the envelope-gap act are **satisfied**, and that only the QE execution and the two S6 acts remain. Cell verdict `BL` unchanged | IRR | **NOT CORRECTED** |
| **S-5** | `docs/integration/IIPS_v3.0_CAPABILITY_MATRIX_51X17_RECONSTRUCTION_2026-10-27.md` (**IRR**) | §D outstanding-work table, line `304` (`O-01`, `O-02`, `O-05` rows) | `O-01` *"Deferred to operator"*; `O-02` *"Blocked — must not be attempted"*; `O-05` *"Blocked"* with the `GOV-03`/`BI-08` boundary | Add dated pointers: `P1-F` rendered `2026-10-29` → `P-1` **AUTHORIZED, one attempt, unspent** (§16.206); `O-01`/`O-02` descriptions predate that; `O-05`'s disposition **remains Blocked/Open** but its boundary and reasons follow S-1. No verdict changed | IRR | **NOT CORRECTED** |
| **S-6** | `evidence/cross-repository/IIPS_V3_CAP03_DR2_IPD_PROVIDER_ENVELOPE_VERIFICATION_2026-10-29.md` (**IPD**) | §4, row `WRITE_NOT_AUTHORIZED` on every write op | *"`dispatch.ts` refuses all `IPC_WRITE_OPERATIONS` … via the hard-false `evaluatePortSaveGuard()`"* | Correct to: refusal is by the **closed `IPC_WRITE_OPERATIONS` test at `dispatch.ts:228–233`**; `dispatch.ts` does not call `evaluatePortSaveGuard()` (0 occurrences); the guard governs `DurablePortfolioStorePort`. Add as a **new dated record**, not an edit | **IPD** | **NOT CORRECTED — IPD read-only; requires a separate IPD documentation pass** |
| **S-7** | IPD records closing line (e.g. `IIPS_V3_CAP03_DR2_IPD_PROVIDER_ENVELOPE_VERIFICATION_2026-10-29.md` §8 and its siblings) | *"`P-1-C` NOT ESTABLISHED. `P-1-D` DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. `P-1` NOT EXECUTED / UNSPENT / **NOT AUTHORIZED**."* | "NOT AUTHORIZED" is stale | Correct to: `P-1` **AUTHORIZED, one attempt, not made** (`P1-F`, IRR §16.206, `2026-10-29`); `P-1-C`/`P-1-D` facts unchanged; no attempt occurred. New dated record, not an edit | **IPD** | **NOT CORRECTED — IPD read-only; requires a separate IPD documentation pass** |

**Boundary statement:** S-1…S-7 are documentation corrections. **Correcting them would not authorize the
consumer, would not move `O-05`, and would not pre-empt any option in §8.** S-6 and S-7 cannot be performed
by this session at all (IPD is read-only); they require a separate IPD pass under IPD authority.

---

## 11. Verification register (this pass)

| ID | Check | Method | Result |
|---|---|---|---|
| `V-O05DR-01` | Live baselines read before writing | `git fetch` + `gh api …/branches/main` on both repositories | **PASS** — IRR `238dfa31…`/`e3efd922…`; IPD `aa356ec2…`/`79a9fb6c…` |
| `V-O05DR-02` | Open PRs enumerated; #382 not merged, not touched, carries no `O-05` content | `gh api pulls?state=open`, PR file list | **PASS** — 1 IRR PR (head `a63b19b6…`, 8 files, P-1-F package); 0 IPD PRs |
| `V-O05DR-03` | Identifier census before publication: request ID, reserved decision ID, `O5-A`/`O5-B`/`O5-N`, `§16.218`, `CV-CORR-198`, `CHG-2026-10-30-13`, `V1672`–`V1681` | `grep -rl` over both repositories and over PR #382's tracker blob `8c0d16a9…` | **PASS** — `0` occurrences each; `§16.216`/`§16.217`/`CHG-2026-10-30-11`/`CHG-2026-10-30-12` are **claimed by PR #382** and are skipped |
| `V-O05DR-04` | Route A boundary checked against the designated-blob sets | `PD-1` 15-path list (`§16.206.2`) and successor act `§2.1` 12-blob list | **PASS** — `entrypoint.ts` is in neither designated set; it **is** an H-12 v3 candidate entry, so H-12 regeneration must follow the change |
| `V-O05DR-05` | Route A's refusal behaviour is the code's actual behaviour, not an assumption | `brokerImportPersistence.ts:333` (catch → `WRITE_NOT_AUTHORIZED`) and `:236` (`storeEffect:'NONE'`); `durablePortfolioStorePort.ts:39–44`, `:62–65` | **PASS** |
| `V-O05DR-06` | The gate and the IPC write set are unchanged by this document | `portfolio_store.ts:207–218`; `dispatch.ts:228–233`; `protocol.ts:34–39` re-read | **PASS** — no code changed in either repository |
| `V-O05DR-07` | S6 determination cites effective text only, and no non-effective packet is treated as authority | Gate 4 act §§4.2, 4.4, 5, 6, 7, 8, 14, 15.2, 15.3; successor act §5.1; U2 act; packet §9 marked non-effective; `CV-39`; register option at tracker `:1358` | **PASS** |
| `V-O05DR-08` | Seven documentation discrepancies each located by file + line + owner; none edited | tracker `:13122`, `:6354`, `:2669`; matrix doc `:304`; IPD DR-2 record §4 and closing line | **PASS** (recorded, not corrected) |
| `V-O05DR-09` | No implementation, guard, IPC, migration, schema, test or runtime change; no status moved | `git diff` scope; IPD read-only | **PASS** |
| `V-O05DR-10` | `O-05` remains `OPEN`; no admission authority exercised | tracker `O-05` row unchanged; §16.218 states the status explicitly | **PASS** |

---

## 12. Non-grants and status statement

**Non-grants (exhaustive).** No Program Authority decision, selection, approval, signature or designation.
No admission, acceptance, qualification or release decision. No implementation authority. No change to
`evaluatePortSaveGuard`, the W-1 conjunction, `IPC_WRITE_OPERATIONS`, `dispatch.ts`, `protocol.ts`, any
migration, any schema, any test, any fence, any pin, `BASIS_COMMIT`, `BASIS_TREE`, any `CV-*` register row,
any `§18.1` cell, any gate status, any `O-*` item or any IRR/IPD code path. No write to IPD. No production
authority. No claim that any of the above has occurred.

**Status statement.** `O-05` — **`OPEN`**, unchanged, accurately so: the durable broker-import leg still has
**no non-test consumer**, `evaluatePortSaveGuard()` still returns `authorized:false`, `QE` is still `0/11`,
Gate 4 result acceptance is not rendered, Gate 5 is not initiated, and `CV-52` remains `BLOCKED`. This
request changes none of that and seeks one bounded decision.

*End of `IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-REQUEST-2026-10-30-01`. **PROPOSED — NOT SELECTED — NOT
EFFECTIVE.** No route selected, no implementation authorized, no gate moved, no fence lifted, no admission
granted, `O-05` remains `OPEN`.*
