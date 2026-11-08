# PA Governance Decision — Personal-Use Acceptance Authorization and W-1 Reconciliation

**Decision owner:** Ramki (sole decision owner — architectural, governance, authorization,
acceptance and implementation authority for this application)
**Application:** IIPS v3.0
**Operating model:** Local / Single User / Personal Use
**Production:** Explicitly **OUT OF SCOPE**
**Decision date:** 2026-11-08
**Repository:** `ramkivs/iips-review-recovered`
**Baseline at decision:** `4b725b7b50f9ec1a15d431cdb951a301831abdd3` (verified `ls-remote` == local)
**IPD reference pin (read-only):** `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19`

**Nature of this record:** governance reconciliation, acceptance-scope definition and fixture-lifecycle
proposal. **Documentation only.** No runtime write request was issued in producing it. No portfolio
was created, modified or deleted. No database, carrier or runtime configuration was changed. No IRR
source or test was changed. IPD was inspected **read-only**; zero IPD commits, branches or PRs.

---

## 1. Authority and context

Ramki is the sole decision owner for all architectural, governance, authorization, acceptance and
implementation decisions concerning this personal IIPS application. There are no separate
organizational decision owners or production stakeholders.

The application is intended strictly for Ramki's personal use, on a local single-user environment.
No production authority, production eligibility, hosted operation or multi-user operation follows
from this decision or from any instrument it references.

---

## 2. Decision — W-1 reconciliation

### 2.1 The accepted requirement is preserved, not amended

The Gate 3 Act §7 requirement stands **verbatim and unaltered**:

> **No local flag, environment variable, test result, default configuration or operator assertion
> substitutes for any predicate.**

Source: `docs/integration/IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_EFFECTIVE_2026-10-19-02.md`
§7. This decision **does not modify, relax, supersede or reinterpret** that sentence in any way that
would let a switch stand in for a predicate.

### 2.2 The clarification

`IIPS_LOCAL_PERSONAL_USE=1` is classified as an **additional local runtime enablement condition**. It
occupies a different logical role from the W-1 predicates and does not overlap them:

| | W-1 predicates (1)–(4) | `IIPS_LOCAL_PERSONAL_USE` |
| :-- | :-- | :-- |
| What it is | **Authorization** — permission for a write to exist at all | **Enablement** — a local runtime mode selection |
| Who/what sets it | Separate accepted acts, each naming exact scope | Server process environment, local host only |
| Can it alone permit a write? | NO — all four must hold | **NO** — it independently establishes nothing |
| Direction of effect | Grants | **Only withholds.** Absent ⇒ historical refusal behaviour, byte-for-byte unchanged |

**The precise reconciliation:** the switch is *necessary but never sufficient*. It can only be
considered after the predicates are satisfied, and its presence never substitutes for any of them.

### 2.3 Binding limitations (non-negotiable)

`IIPS_LOCAL_PERSONAL_USE=1`:

1. Does **not** independently establish authorization.
2. Does **not** satisfy, replace or weaken any W-1 predicate.
3. Must **never** bypass identity, ownership, authority, revision or any other mandatory check.
4. Is restricted to the local personal-use environment; it must never be set on a production,
   hosted or multi-user deployment.
5. Confers **no** production authority or eligibility.
6. Does **not** widen write admission at any HTTP route. The G-2 Route B write fence
   (`user-portfolio-transport.ts:145-146`, 503 `operation-not-admitted`) remains authoritative and is
   unaffected by the switch.
7. Does **not** change any refusal vocabulary, status code, or store-effect guarantee.

### 2.4 Verified behaviour under the switch (source-confirmed, not assumed)

At IPD pin `59fdfd1`:

- `dispatch.ts:437` — a v1 write op with `personalUse === false` returns
  `WRITE_NOT_AUTHORIZED` and **returns before any store mutation**. All other checks are unaffected.
- `localPersonalUse.ts:28-30` — `env[IIPS_LOCAL_PERSONAL_USE] === '1'`, read from the server process
  environment only: never from a request, header or flag file.
- With the switch set, the write still passes through, in order: bundle/owner resolution, the closed
  operation set, `requireExpectedRevision`, `mapManualRequest` → `mapManualHolding` (symbol grammar,
  quantity/price ranges), `store.validate`, the **stale-revision check**, the identity-replacement
  guard, then the transaction. **Nothing is short-circuited.**

---

## 3. Revision-cap implication — explicitly documented and assessed

The PA required that the switch's effect on the revision cap be documented and assessed, and that an
unrelated change in revision policy **not** be silently accepted. It is assessed here.

### 3.1 What the switch actually does to the cap

| Element | Value | Source (IPD pin `59fdfd1`) |
| :-- | :-- | :-- |
| `MAX_REVISIONS` (governed D03 cap) | `4` | `portfolio_store.ts:468` |
| `PERSONAL_USE_REVISION_LIMIT` | `1000` | `portfolio_store.ts:469` |
| `revisionCapFor(env)` | `1` ⇒ `1000`, else `4` | `localPersonalUse.ts:33-35` |
| Constructor clamp | `Math.min(requested, PERSONAL_USE_REVISION_LIMIT)` | `portfolio_store.ts:494` |
| Wiring | `new DurablePortfolioStore(db, undefined, { revisionCap: revisionCapFor(env) })` | `dispatch.ts:262` |
| Enforcement | `writeRevision` `:1091-1092`; `saveSnapshotV2` `:1492` | `portfolio_store.ts` |

So with the switch set, the **finite** cap moves `4 → 1000`. Nothing becomes unbounded.

### 3.2 Assessment 1 — the cap has **no effect on Step 9** (this is the reassuring finding)

The stale-revision check **precedes** the cap check inside `writeRevision`:

```ts
// IPD src/persistence/portfolio_store.ts:1085-1092
const current = this.resolvePortfolio(owner, portfolioId);
if (current.currentRevision !== expectedRevision) {
  throw new RevisionConflictError(`expected revision ${expectedRevision} but the portfolio is at …`);
}
if (current.currentRevision >= this.revisionCap && operation !== 'DELETE') {
  throw new RevisionConflictError(`the immutable revision lifecycle is capped at …`);
}
```

Both branches raise `RevisionConflictError` and both map to the same `409
{"outcome":"REVISION_CONFLICT"}` at IRR `brokerImportHttp.ts:222-223`.

**Consequences for Step 9:**

- The expected 409 is produced by the **stale** branch, which is unsatisfiable-by-cap.
- A cap-triggered 409 would be **indistinguishable** from a stale-triggered 409 by status and body
  alone. They are distinguishable only by the portfolio's revision being at the cap.
- Therefore the Step 9 fixture must be created at **revision 1**, far from either cap value (4 or
  1000). At revision 1 with `expectedRevision: 0`, only the stale branch is reachable — the cap
  branch is arithmetically impossible (`1 >= 4` is false, `1 >= 1000` is false).
- **The cap value is therefore irrelevant to Step 9's correctness.** The reconciliation is safe for
  this acceptance purpose.

### 3.3 Assessment 2 — a latent divergence that must be recorded, not silently accepted

IPD's own comment (`localPersonalUse.ts:17-19`) asserts: *"the v2 snapshot contract (D03/D05) and its
cap=4 are untouched; this path is the v1 exchange only."*

**Operationally that is true**: v2 write operations are unconditionally refused at
`dispatch.ts:409-412` before any store call, so `saveSnapshotV2` is unreachable through the
dispatcher.

**Structurally it is imprecise.** The cap is a **single shared instance field** (`revisionCap`)
consumed by *both* `writeRevision` (v1) and `saveSnapshotV2` (v2, `:1492`). When the switch is set,
the v2 primitive's cap is also `1000`, not `4`. The v1/v2 separation is enforced by the *dispatcher's
refusal branch*, not by the cap field. Any future non-dispatch caller of `saveSnapshotV2`, or any
relaxation of that refusal branch, would silently inherit a 1000-revision v2 cap.

**Recorded as a latent divergence requiring an IPD-owned decision**, not accepted silently:

- **Owner:** IPD repository. IRR must not and cannot change it.
- **Options:** (a) formally accept the shared-cap coupling on the record; or (b) decouple — give
  `saveSnapshotV2` an explicit independent cap of `MAX_REVISIONS`.
- **Status:** **OPEN.** It does not block Step 9 (§3.2) and does not alter the switch's
  reconciliation (§2).
- **No IPD change is proposed or made by this record.**

---

## 4. Acceptance-only authorization boundary

### 4.1 Authorized (preparation)

Preparation of a controlled Step 9 acceptance mechanism covering exactly:

1. Creation of a uniquely identified, isolated test portfolio.
2. Establishment and verification of its active owner binding.
3. Establishment of a known initial revision.
4. Execution of **one** valid stale-revision conflict request through Route A.
5. Capture of the exact request, response status and response body.
6. Verification that the revision and holdings remain unchanged.
7. Cleanup of the test portfolio and independent verification of removal.

### 4.2 Not authorized (retained verbatim from the decision)

Production deployment or production acceptance; general-purpose write enablement; unrestricted
identity correction; changes to the accepted W-1 predicates; bypassing authorization through
environment variables or test fixtures; reuse or recreation of the deleted historical acceptance
portfolio; changes to unrelated persistence or database architecture; advancement of Gate 4,
Gate 5, DQ-4 or D06.

### 4.3 Scope fence

This authorization is limited to **the acceptance fixture and the single conflict test.** It does
**not** authorize general portfolio writes or broader write admission. It grants no HTTP write route
that does not already exist, and it does not lift the Route B fence.

---

## 5. Fixture lifecycle — smallest technically viable approach

### 5.1 What the readiness investigation established

`STEP-9-ACCEPTANCE-READINESS-ASSESSMENT-2026-11-08.md` (PR #522) found the loop is not closeable
through IRR's HTTP surface: Route A exposes only `holdings`/`revision`/`evidence`
(`brokerImportHttp.ts:177`) — no `create`, no `delete` — and Route B's `DELETE` is refused
`503 operation-not-admitted`.

However, the underlying **IPD v1 IPC operations already exist**: `portfolio.create` and
`portfolio.delete` are members of `IPC_WRITE_OPERATIONS` (`protocol.ts:58-63`), and IRR already ships
a client that can issue them (`ipcClient.ts:590-610`, `callIpc`). The gap is **exposure**, not
capability.

### 5.2 Recommended approach — one IRR-owned operator script, zero new HTTP routes

**Do not add `create`/`delete` HTTP routes.** That would be exactly the "broader write admission"
this decision excludes.

Instead: a single IRR-owned operator script that drives the existing IPC v1 operations directly,
through IRR's existing exported client. This is the smallest viable approach — it adds no HTTP
surface, no admission change, no fence change, and no IPD change.

| Phase | Operation | Transport | Exercises |
| :-- | :-- | :-- | :-- |
| F1 Create | `portfolio.create` `{portfolioId: "step9-fixture-<UTCstamp>", holdings:[valid], portfolioName:"Step9 acceptance fixture"}` | IPC v1 write | new ID, INITIAL revision **1** |
| F2 Verify binding | `portfolio.list` → assert the fixture is present with `revision: 1` | IPC v1 read | owner binding resolved; known initial revision |
| F3 Conflict test | `POST /api/broker-import/{id}/holdings`, valid payload, `expectedRevision: 0` | **IRR Route A (HTTP)** | the actual Step 9 step |
| F4 Verify no effect | `GET /api/broker-import/{id}/revision` → assert `revision` still `1` | IRR Route A read | zero store effect |
| F5 Verify holdings | `portfolio.get` → compare holdings payload before/after | IPC v1 read | holdings unchanged |
| F6 Cleanup | `portfolio.delete` `{portfolioId, expectedRevision: 1}` | IPC v1 write | tombstone |
| F7 Verify removal | `GET /api/broker-import/{id}/revision` → assert **404 `{"outcome":"RESOURCE_UNAVAILABLE"}`** | IRR Route A read | independent removal proof |

**F3 must run through IRR's HTTP Route A**, not IPC, because Route A is the contract Step 9 asserts.

### 5.3 Semantic precision on "removal" — must not be overstated

`portfolio.delete` **tombstones**, it does not physically erase:

```ts
// IPD src/persistence/portfolio_store.ts:1621-1647
INSERT INTO portfolio_revisions (… operation 'DELETE' …) VALUES (…, expectedRevision + 1, 'tombstone:' || portfolioId, …)
UPDATE portfolios SET status = 'TOMBSTONED', deleted_at = …
```

`list()` filters `AND p.status = 'ACTIVE'` (`:603`), so a tombstoned portfolio becomes invisible to
every read projection. F7 therefore proves **logical removal**, which is what every application-level
read observes. It does **not** prove physical row deletion, and this record does not claim it does.

### 5.4 Fixture identity constraints

- ID must match IPD `/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/` (`dispatch.ts:61`) **and** IRR's
  `validatePortfolioIdParam` (non-blank, ≤128, no `/`, `\`, control chars).
- ID must be **unique per run** (UTC timestamp suffix) and must **not** be the deleted historical
  acceptance portfolio, nor any real portfolio. Uniqueness also makes `create` fail loudly if a prior
  fixture was left behind (`portfolio already exists`, `portfolio_store.ts:1593`).
- The payload must satisfy **IPD's** `mapManualHolding`: `symbol` matching the v1 grammar,
  `quantity` in `(0, 1e9]`, `averageBuyPrice`/`currentPrice` finite in `[0, 1e12]`. These are
  **required by IPD** even though IRR's boundary treats them as optional.

### 5.5 Capture requirement (binding)

F3 must capture, and retain as committed evidence: responding service; HTTP method and exact path;
**full request body** including `expectedRevision` and `mode`; response status; **full response body
verbatim**; and F2/F4/F5/F7 outputs. The original Step 9 failure was undiagnosable precisely because
none of this was captured.

---

## 6. Repository ownership

| Change | Repository | Status |
| :-- | :-- | :-- |
| Operator script driving the lifecycle (§5.2) | **IRR** | **Not implemented** — implementation authority requested (§9) |
| Acceptance evidence record (captured transcript) | **IRR** (`docs/integration/`, `evidence/`) | Not created — requires a run |
| IPD v1 `portfolio.create` / `portfolio.delete` ops | **IPD** | **Already exist — no change proposed** |
| `IIPS_LOCAL_PERSONAL_USE` switch | **IPD** | **Already exists — no change proposed** |
| Shared revision-cap coupling (§3.3) | **IPD** | **OPEN — IPD-owned decision; no change proposed here** |

**No cross-repository change is made or implied by this record.** IRR owns the script; IPD owns the
IPC contract. Any IPD modification would be separately identified, separately authorized and confined
to the exact acceptance requirement — and none is required for this lifecycle as designed.

---

## 7. Remaining technical prerequisites

| # | Prerequisite | Owner | Status |
| :-- | :-- | :-- | :-- |
| P1 | An `ACTIVE` A-2 local-principal binding and one `ACTIVE` membership must pre-exist in IPD | Ramki / IPD runtime | **Unverified** — not observable read-only from IRR |
| P2 | `IIPS_G2_IPC_ENDPOINT` set on the IRR server process (named pipe) | Runtime config | **Not granted** |
| P3 | `IIPS_G3_IPC_BINDING_PROVISIONED` set on the IRR server process | Runtime config | **Not granted** |
| P4 | `IIPS_LOCAL_PERSONAL_USE=1` set on the **IPD** process for the run window | Runtime config | **Authorized in principle by this decision (§2); not yet set** |
| P5 | The operator script (§5.2) exists, with tests | **IRR** | **Not implemented — §9** |
| P6 | IRR server reachable at `127.0.0.1:8787` with first-party headers satisfied | Runtime | Not established |
| P7 | Responding service named in advance and captured | Operator | Not established |
| P8 | IPD decision on the shared-cap divergence (§3.3) | **IPD** | **OPEN — does not block Step 9** |

P1 is the only prerequisite that cannot be examined read-only from IRR; it must be confirmed on the
host before a run.

---

## 8. Wiring and gates

### 8.1 Affected configuration (documented, not changed)

| Setting | Process | Effect |
| :-- | :-- | :-- |
| `IIPS_LOCAL_PERSONAL_USE=1` | **IPD** | Enables v1 writes; raises finite cap 4→1000 |
| `IIPS_G2_IPC_ENDPOINT` | **IRR** | Named-pipe endpoint; absent ⇒ 503 |
| `IIPS_G3_IPC_BINDING_PROVISIONED` | **IRR** | Local fail-closed precondition; absent ⇒ 503 |
| `IIPS_G2_IPC_TENANT_HINT` | IRR | Local diagnostics only; **never transmitted** |

### 8.2 Unchanged gate statuses — preserved verbatim

| Item | Status |
| :-- | :-- |
| **Step 9** | **NOT PASSED** |
| Step 5 | **FAIL** |
| Step 11 | **PARTIAL** |
| Steps 6, 8, 14 | **PASS recorded with endpoint UNKNOWN** |
| **Gate 4** | **AUTHORIZED — NOT STARTED** (QE 0/11) |
| **Gate 5** | **Not initiated** |
| **DQ-4** | **8/10** |
| **D06** | **Unchanged** |

No downstream gate is advanced, and no acceptance result is converted by this record.

---

## 9. Final determination

Four distinct statuses, kept separate:

| Dimension | Determination |
| :-- | :-- |
| **Governance decision recorded** | **YES** — W-1 reconciled (§2); switch classified as enablement, not authorization; binding limitations enumerated; revision-cap implication documented and assessed (§3); acceptance-only boundary defined (§4); fixture lifecycle proposed with repository ownership (§5–6); prerequisites enumerated (§7). |
| **Implementation authority** | **WITHHELD.** The operator script (§5.2) is **not implemented**. Authorization is **requested** for exactly one IRR file plus its tests, scoped to the seven lifecycle phases. No HTTP route, admission, fence, IPD, persistence or runtime change is requested. |
| **Acceptance execution authority** | **NOT EXERCISED / NOT GRANTED for this task.** This instrument authorizes *preparation*. No runtime write request was issued, no fixture created, no portfolio touched. Execution requires its own explicit act once P1–P5 are satisfied. |
| **Step 9 acceptance status** | **NOT PASSED.** Unchanged. Publishing this decision does **not** pass Step 9, does not substitute for evidence, and does not indicate the conflict path works. Step 9 becomes PASS only when a captured, valid, authorized run yields `409 {"outcome":"REVISION_CONFLICT"}` with verified zero store effect. |

**Recommended next act:** grant implementation authority for the single IRR operator script and its
tests under §5.2, then execute the lifecycle once under a separate execution authorization.

---

## 10. Explicit exclusions

This decision does **not** authorize, and this record does **not** perform: production deployment or
production acceptance; general-purpose write enablement; broader write admission; new HTTP write
routes; unrestricted identity correction; changes to the accepted W-1 predicates; bypassing
authorization through environment variables or test fixtures; reuse or recreation of the deleted
historical acceptance portfolio; changes to unrelated persistence or database architecture; any IPD
modification; advancement of Gate 4, Gate 5, DQ-4 or D06; or any runtime acceptance execution.
