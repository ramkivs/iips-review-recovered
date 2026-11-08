# Step 9 — Revision Conflict Contract Investigation (Correction Proposal)

**Status:** INVESTIGATION AND PROPOSAL ONLY. **Implementation Authority = NOT GRANTED.**
No source, test, database, carrier, persistence, or runtime-configuration file was modified in
producing this record. IPD was inspected **read-only**; no IPD commit, branch, or PR exists.

**Work item:** Step 9 of the Windows personal-portfolio operator sequence.
**Symptom as recorded:** expected HTTP 409 `{"error":"revision-conflict"}`; observed HTTP 400
`{"error":"invalid-request"}`.

**Reference:** the merged operator test report
`docs/integration/WINDOWS-PERSONAL-PORTFOLIO-OPERATOR-TEST-REPORT-2026-11-08.md` (PR #517,
merge commit `13536e5`), §7.

---

## 0. Coordinates and verification method

| Item | Value |
| :-- | :-- |
| IRR repository | `ramkivs/iips-review-recovered` |
| IRR `main` at investigation | `13536e5cfb831b0fb9701291785e6340a38dbcd2` (= PR #517 merge) |
| IRR investigation branch | `arena/fff0e8cd-iips-review-recovered` |
| Working tree at investigation start | clean, 0 modified files |
| IPD reference clone | `/tmp/ipd3` at pin `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19` |
| IPD remote `main` | `de8756de…` (note: pin ≠ `main`; the pin is what IRR resolves) |
| IPD inspection scope | **READ-ONLY.** Zero IPD writes. |

All findings below are from reading source at those exact commits. **No write was issued to
reproduce the symptom** — reproducing a stale-revision conflict requires a repeat write, which is
forbidden by the standing constraints. The observation is therefore analysed as recorded, not
re-enacted.

---

## 1. Executive summary

Two things are true, and they are the substance of this proposal:

1. **Both candidate causes previously flagged are real code-level mismatches, but neither one can
   produce the observed 400 on the path Step 9 exercised.** Both are properties of IPD's
   **v2** protocol surface, which IRR does not use — IRR's broker-import adapter speaks **v1**
   exclusively. Confirming them as the cause would have been a false attribution.
2. **The expected result `{"error":"revision-conflict"}` is not a response any implemented IRR route
   can emit for a write.** That token belongs to the G-2 user-portfolio transport, and that
   transport refuses **every** write with HTTP 503 before any body is read. So the acceptance
   expectation, not just the implementation, is unsatisfiable as written.

The genuine defect that *does* exist on the exercised path is a **third, independent skew** that
was not previously identified: **IRR's `REPLACE` mode never reaches IPD.** It is silently collapsed
to `MERGE` on every save. That is a correctness defect with data consequences, and it is the
finding this proposal recommends acting on first.

---

## 2. Which route was exercised — the load-bearing unknown

Step 9's **responding endpoint was not captured**, exactly as for Steps 6, 8, and 14. This matters
because IRR implements **two structurally different** portfolio write surfaces, with **disjoint
error vocabularies**:

| | Route A — broker import | Route B — G-2 user portfolios |
| :-- | :-- | :-- |
| Path | `/api/broker-import/...` | `/api/user-portfolios/{id}/holdings` |
| File | `frontend/server/broker-import/brokerImportHttp.ts` | `frontend/server/user-portfolio-transport.ts` |
| 409 body | `{"outcome":"REVISION_CONFLICT"}` (`:222-223`) | `{"error":"revision-conflict"}` — **unreachable**, see §3 |
| 400 body | `{"error":"invalid-request","field":…,"reason":…}` — **three keys** (`:567`, `:574`) | `{"error":"invalid-request"}` — **bare, one key** (`:161`, `:190`) |
| Write admitted? | Yes, one IPC call | **No** — refused 503 at `:145-146` |

The observed body `{"error":"invalid-request"}` is the **bare** form. Route A cannot emit that
shape: every 400 on Route A carries `field` and `reason`. That is a strong signal that the
observation originated on **Route B's** vocabulary.

But Route B **cannot** return 409, and cannot return 400 for a write either — its write operations
are intercepted at `:145-146`:

```ts
// frontend/server/user-portfolio-transport.ts:145-146
if (route.operation === 'context' || route.operation === 'write' || (method !== 'GET' && method !== 'HEAD')) {
  sendNotAdmitted(res, head);            // → 503 {"error":"operation-not-admitted"}
  return;
}
```

The only bare 400 on Route B is `:161`, reachable **only** for the `detail` and `revisions` **read**
operations when the `portfolioId` fails `isValidPortfolioId` — i.e. a malformed **GET**, not a
write.

**Conclusion on the unknown:** the observation is not reproducible as stated by any single route.
Either (a) the endpoint was Route B and the 400 came from a malformed-id read path, or (b) the
endpoint was Route A and the recorded body was paraphrased rather than captured verbatim — §7 of
the merged report states the body was not captured. This proposal does **not** resolve which, and
does **not** convert the result: **Step 9 remains NOT PASSED.**

**Required before implementation:** capture the responding service, the exact request line (method
+ path), the request body, and the response body verbatim. Without those, any "fix" is aimed at a
guess.

---

## 3. Why the expected 409 `{"error":"revision-conflict"}` is unsatisfiable as written

The hyphenated token is produced in exactly one place in IRR, by `safeErrorCode`
(`user-portfolio-transport.ts:106-108`), which lowercases and hyphenates a closed `G2FailureReason`:

```ts
function safeErrorCode(error: G2Error): string {
  return error.reason.toLowerCase().replace(/_/g, '-');   // REVISION_CONFLICT → 'revision-conflict'
}
```

Its only consumer is `:190`, on the Route B **read** path. `httpStatusFor` does map
`REVISION_CONFLICT → 409` (`:98`), so the mapping exists — but it is only reachable if a `G2Error`
with that reason surfaces from a **read** call, and `sendNotAdmitted` at `:145-146` prevents every
write from ever reaching the port.

Meanwhile Route B's own documentation is explicit that this is deliberate:

```
// frontend/server/user-portfolio-transport.ts:4-11
 * The only admitted operations are read-only list, detail, and revision reads.
 * ... Context discovery and every create/save/reset/delete operation remain unavailable here.
 * In particular, Gate E W-1 remains authoritative: no HTTP write is forwarded or inferred as
 * authorized.
```

So the expectation `{"error":"revision-conflict"}` describes **Route B's read vocabulary applied to
a write**, on a transport whose entire purpose is to refuse that write. It is internally
inconsistent with IRR `main`. **No IRR-local change can make it true without widening write
admission — which is out of scope by standing instruction and would breach Gate E W-1.**

The route that *can* legitimately return 409 is Route A, and its 409 body is
`{"outcome":"REVISION_CONFLICT"}` — a different, already-implemented and already-tested contract
(`brokerImportHttp.test.ts:119`).

---

## 4. Root cause: three independent skews, correctly separated

### 4.1 Candidate cause (1) — `expectedRevision >= 0` vs `>= 1`: REAL skew, WRONG path

IRR admits `0`:

```ts
// frontend/server/broker-import/brokerImportBoundary.ts:203
if (typeof expectedRevision !== 'number' || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
  return refuse('body.expectedRevision', 'expected-revision-non-negative-integer');
}
```

IPD's `>= 1` rule is real:

```ts
// IPD src/ipc/protocol.ts:386
if (typeof expectedRevision !== 'number' || !Number.isSafeInteger(expectedRevision) || expectedRevision < 1 || expectedRevision > V2_MAX_SAFE_INTEGER) {
  refuseV2('payload.expectedRevision must be a safe integer within 1..9007199254740991');
}
```

**But that line is inside `validateSnapshotFraming` (`:1323`), whose only caller is `saveSnapshotV2`
(`:1454`).** IRR never calls `saveSnapshotV2`; its adapter issues `portfolio.save` on the v1
envelope. On the v1 path IPD's own guard is `requireExpectedRevision`, which accepts `>= 0` and
therefore **matches IRR exactly**:

```ts
// IPD src/persistence/manualPersonalPortfolio.ts:149-154
export function requireExpectedRevision(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new InvalidPortfolioRequestError('expectedRevision must be a non-negative integer');
  }
  return value;
}
```

**Verdict: no mismatch on the executed path.** Fixing IRR's validator to `>= 1` would align it with
a rule it never encounters.

### 4.2 Candidate cause (2) — `REPLACE` accepted vs `MERGE`-only: REAL skew, WRONG path

IPD's `MERGE`-only rule is also v2-only (`protocol.ts:389`). On v1, IPD **does** honour `REPLACE`:

```ts
// IPD src/ipc/dispatch.ts:217
const mode = options.mode === 'REPLACE' || payload.operation === 'REPLACE' ? 'REPLACE' : 'MERGE';
```

**Verdict: `REPLACE` is not refused on v1.** This is not the 400 either. But reading that line
exposes the real defect — see 4.3.

### 4.3 The genuine, previously unidentified defect — `REPLACE` is silently collapsed to `MERGE`

`mode` is derived from **`options.mode`** or **`payload.operation`**. IRR's adapter sends
**neither**: it sends top-level `mode`, and it explicitly sends an empty options bag.

```ts
// frontend/server/broker-import/brokerImportV1SaveAdapter.ts:95-104
return {
  portfolioId,
  expectedRevision: dto.expectedRevision,
  mode: dto.mode,              // ← top-level; IPD v1 never reads this key
  holdings: dto.holdings,
  ...
};
```

```ts
// frontend/server/broker-import/brokerImportV1SaveAdapter.ts:143-144
const payload = buildV1SavePayload(portfolioId, dto);
const result: IpcCallResult = await deps.callIpc('portfolio.save', payload, {});   // options = {}
```

`payload.operation` is not an admitted DTO key (`brokerImportBoundary.ts:47-52` admits exactly
`expectedRevision`, `mode`, `holdings`, `contentDigest`, `broker`), and `options` is empty. So at
IPD `dispatch.ts:217` both operands are undefined, `mode` is **always `'MERGE'`**, and
`mapManualRequest(payload.holdings, 'MERGE')` (`:236`) plus
`store.save(... request.operation === 'REPLACE' ? 'REPLACE' : 'MERGE' ...)`
(`portfolio_store.ts:1607-1612`) commit a **MERGE**.

**Consequence: every IRR `REPLACE` save is applied as `MERGE`.** No error is raised, so this is a
**silent wrong-success**, not a 400. It also means:

- Step 8's operator **PASS** for "REPLACE operation" may have been satisfied by a MERGE that did
  not replace anything. That step is already recorded with **endpoint UNKNOWN**; this finding
  strengthens the case for re-verification under its own authority, and **does not** convert it.
- IPD's own duplicate-suppression and `ALREADY_IMPORTED_NO_OP` disposition depend on `operation`,
  so the collapse also perturbs disposition reporting.

This is the finding that actually warrants correction. It is **not** the reported Step 9 symptom,
and it must not be presented as such.

### 4.4 Why a 400 could still legitimately precede a 409 on Route A

Worth recording, because it bounds any future fix. On the v1 path IPD calls `validate()` **before**
the staleness comparison:

```ts
// IPD src/persistence/portfolio_store.ts:1607-1612
save(owner: OwnerRef, portfolioId: string, request: PortfolioSaveRequest, expectedRevision: number): number {
  return this.withTransaction(() => {
    this.validate(request);
    return this.writeRevision(owner, portfolioId, request, /* … */, expectedRevision);
  });
}
```

`validate()` (`:1008-1032`) throws `InvalidPortfolioRequestError` for empty holdings, duplicate
symbols, caller-supplied identity keys, and non-conforming `securityIdentity`; the stale check lives
inside `writeRevision` (`:1086`). A stale revision **with an invalid payload** therefore surfaces as
`INVALID_REQUEST`, never as `REVISION_CONFLICT`. Additionally `mapManualRequest` → `mapManualHolding`
(`manualPersonalPortfolio.ts:55-85`) rejects symbols failing `/^[A-Za-z0-9][A-Za-z0-9._&-]{0,39}$/`
— and IRR's own validator admits any non-empty symbol up to 32 chars
(`brokerImportBoundary.ts:147`). **A broker symbol containing a space passes IRR and is refused by
IPD.** That is a real IRR↔IPD v1 divergence and a plausible producer of a 400 on Route A.

---

## 5. Current vs expected behaviour — table

| Aspect | Current IRR `main` (`13536e5`) | Step 9 expected | Assessment |
| :-- | :-- | :-- | :-- |
| Route A 409 body | `{"outcome":"REVISION_CONFLICT"}` | `{"error":"revision-conflict"}` | Different contract, both defensible; expectation names the wrong route |
| Route B write | 503 `{"error":"operation-not-admitted"}` | 409 on stale revision | Expectation requires write admission that Gate E W-1 forbids |
| Route B 409 | Unreachable on write path | 409 | Unsatisfiable without widening admission |
| `expectedRevision` domain (v1) | `>= 0` | unspecified | Matches IPD v1; the `>= 1` skew is v2-only |
| `REPLACE` | Advertised, **silently applied as MERGE** | Replace semantics | **Genuine defect** — silent wrong-success |
| Symbol grammar | Any non-empty ≤32 chars | (unknown) | Divergence from IPD `/^[A-Za-z0-9][A-Za-z0-9._&-]{0,39}$/` |
| `initialExpectedRevision` | `0` (`BrokerImportSurface.tsx:52`) | a real revision | `0` is admissible at both layers, so it can reach a true 409 — but only with an otherwise-valid payload |

---

## 6. Recommended minimal IRR-owned correction

**The proposal is staged. Stage 0 is mandatory and is not a code change.** No stage is authorized.

### Stage 0 — Capture, before any code change (mandatory)

Capture the Step 9 request line, request body, response body verbatim, and the responding service
(irr host vs IPD). This resolves §2's fork. **Without this, Stages 1–3 are guesses.** No write
repeat is required: the operator may re-run only the **read** capture, or supply the original
transcript. Under standing constraints a repeat stale write is **forbidden**, so if no transcript
exists, Step 9 stays NOT PASSED and un-diagnosed rather than being force-fitted to a theory.

### Stage 1 — Correct the silent `REPLACE` collapse (highest value; smallest safe change)

Change **one file, one function**: `buildV1SavePayload` in
`frontend/server/broker-import/brokerImportV1SaveAdapter.ts:95-104`.

Add the channel IPD v1 actually reads, derived from the already-validated DTO — no new key is
accepted inbound, and no write fence is touched:

```ts
...(dto.mode === 'REPLACE' ? { operation: 'REPLACE' as const } : {})
```

**Guardrails that must hold:**
- `operation` must be **derived from `dto.mode`**, never accepted from the caller. `operation` is
  not in `BROKER_IMPORT_DTO_KEYS` (`:47-52`), so an inbound `operation` is already refused at
  `:184-190` as `field-outside-v1-save-payload`.
- `findRefusedWireKeys` (`:194`) must still pass — `operation` is not in `IPC_REFUSED_WIRE_KEYS`.
- `MERGE` must continue to omit the key entirely, preserving the current exact payload shape.
- This changes only the **outbound payload**, never admission, authorization, or persistence.

*Alternative:* keep `mode` only and send `options:{mode}`. **Rejected** — `options` is
caller-supplied authority by IRR's own doctrine (`ipcClient.ts:257-267` scans nested `options`
specifically to refuse smuggling), and `brokerImportV1SaveAdapter.ts:18` documents "no `options`
bag" as an invariant.

### Stage 2 — Align the symbol grammar (defence in depth)

At `brokerImportBoundary.ts:147`, add IPD's pattern
`/^[A-Za-z0-9][A-Za-z0-9._&-]{0,39}$/` to the IRR symbol rule (also raising the 32-char cap to 40,
or keeping 32 — the tighter value is safer). This converts an IPD-side `INVALID_REQUEST` into an
IRR-side typed refusal with a specific `reason`, so a 400 becomes diagnosable rather than opaque.
It does **not** widen anything.

### Stage 3 — Make the conflict expectation route-correct (documentation only)

Correct the acceptance step, not the code, to name **Route A** and its real body
`{"outcome":"REVISION_CONFLICT"}` with HTTP 409, and to state that **Route B has no write path and
returns 503 by design**. No source change. This is the only honest resolution of
`{"error":"revision-conflict"}`.

**Explicitly NOT recommended:**
- Changing Route B to forward writes (breaches Gate E W-1; forbidden).
- Making Route B return 409 without a write (would fabricate a conflict result).
- Emitting a `{"error":"revision-conflict"}` alias from Route A (duplicates a contract and dilutes
  the closed vocabularies).

---

## 7. Files and functions affected

| File | Function / lines | Stage | Nature |
| :-- | :-- | :-- | :-- |
| `frontend/server/broker-import/brokerImportV1SaveAdapter.ts` | `buildV1SavePayload` `:95-104` | 1 | Add derived `operation` for `REPLACE` |
| `frontend/server/broker-import/brokerImportBoundary.ts` | `validateHolding` `:146-149`; `BROKER_IMPORT_MAX_SYMBOL_LENGTH` `:60` | 2 | Add IPD symbol pattern |
| acceptance step text (docs) | Step 9 row + §7 | 3 | Correct expected route/body |
| `frontend/server/broker-import/brokerImportHttp.ts` | `respondToOutcome` `:205` | — | **Unchanged** — 409 mapping already correct |
| `frontend/server/user-portfolio-transport.ts` | `:145-146`, `:161`, `:190` | — | **Unchanged** — write refusal preserved |

---

## 8. Regression tests (proposal only — none written)

Route A, driven through the existing adapter seam (`deps.callIpc` stub), asserting the exact
outbound frame and the mapped HTTP status:

| # | Case | Expected wire | Expected HTTP |
| :-- | :-- | :-- | :-- |
| T1 | Stale revision, valid payload, `mode:'MERGE'`, `expectedRevision:0`, portfolio at revision 1 | `portfolio.save`, no `operation` key | **409** `{"outcome":"REVISION_CONFLICT"}` |
| T2 | Same, valid payload, `mode:'REPLACE'` | payload **carries `operation:'REPLACE'`** | **200** receipt with replace semantics |
| T3 | `mode:'MERGE'` — assert key **absent** from payload (shape preservation) | no `operation` key | 200 |
| T4 | Inbound body attempts `operation:'REPLACE'` | refused pre-IPC, `reason:'field-outside-v1-save-payload'` | **400** (3-key body) |
| T5 | `expectedRevision` missing / `-1` / `1.5` | refused pre-IPC | **400**, `expected-revision-*` |
| T6 | Symbol with a space (`ASK AUTOMOTIVE`) | refused pre-IPC at Stage 2 (currently forwarded) | **400**, specific `reason` (today: 400 `INVALID_REQUEST` from IPD) |
| T7 | Route B `PUT /api/user-portfolios/{id}/holdings`, any body | no port constructed | **503** `{"error":"operation-not-admitted"}` — **must stay 503** |
| T8 | Route B read 409 mapping intact (`httpStatusFor` `REVISION_CONFLICT`) | — | **409** `{"error":"revision-conflict"}` on the read path only |

T7 is the **anti-regression fence**: it asserts that no correction in this proposal widens write
admission. T2 and T3 are the pair that proves the `REPLACE` fix without altering `MERGE`.

Note for T1: `expectedRevision: 0` is admissible at both layers, so a genuine 409 **is** reachable
via Route A provided the payload passes IPD `validate()`. That is why Stage 0 capture matters — it
tells us whether Step 9's payload was valid, which is the difference between "the 409 path is
broken" and "the 400 correctly rejected an invalid payload."

---

## 9. IPD-protocol compatibility implications

- **Stage 1 is a payload correction on IRR's side only.** It uses a key IPD v1 already reads
  (`dispatch.ts:217`). No IPD change, no protocol version bump, no re-pin. It moves IRR *toward*
  the v1 contract, not away from it.
- **Stage 2** adopts an IPD-owned invariant client-side. Also no IPD change.
- **IRR must not adopt the v2 framing** (`expectedRevision >= 1`, `mode === 'MERGE'`-only). Doing so
  would break `REPLACE` and reject revision `0` on a path that today works.
- **No new wire key is introduced**; `operation` already exists in IPD v1's accepted payload
  vocabulary.

---

## 10. Risks and safeguards

| Risk | Safeguard |
| :-- | :-- |
| Fixing the wrong route (Stage 0 skipped) | Stage 0 is mandatory; Step 9 stays NOT PASSED until captured |
| `REPLACE` fix unintentionally widens admission | `operation` derived from validated `mode` only; inbound `operation` still refused; T4 + T7 assert it |
| Payload shape drift for `MERGE` | T3 asserts key absence; adapter doc invariant `:18` preserved |
| Step 8 "PASS" silently contaminated by the MERGE collapse | Recorded here; re-verification needs its own authority. **No result is converted** |
| Reading the v2 gate as the cause again | §4.1/§4.2 state it is v2/`saveSnapshotV2`-only and unreachable from the v1 adapter |
| Repeat stale write to reproduce | Forbidden. Diagnosis rests on source, not on a new write |

---

## 11. Is a separate IPD decision required?

**Partly — and the part that is IPD's is explicitly *not* the cause of Step 9.**

- **Stage 1 (the `REPLACE` collapse) is an IRR defect, not an IPD defect.** IPD v1 behaves as
  documented: it reads `options.mode` or `payload.operation`, and IRR sends neither. A **separate IPD
  decision is therefore NOT required** to fix Stage 1.
- **A separate IPD decision IS required** for one genuine ambiguity: **whether the v1
  `portfolio.save` contract intends `payload.mode` (top-level) as an admitted mode channel.** IRR's
  adapter was written to send it top-level, and IPD ignores it. Either IRR adapts (Stage 1) or IPD
  amends v1 to read the top-level key. Both are defensible; only IPD can rule. **Recommendation:**
  IRR adapts (Stage 1), which needs no IPD change — but the divergence should be recorded as an IPD
  clarification request, raised read-only, under its own authority.
- **A second IPD-side observation** deserves an IPD-owned decision but is **out of IRR's scope**:
  `store.save` runs `validate()` **before** the staleness comparison, so a stale write with an
  invalid payload yields `INVALID_REQUEST` rather than `REVISION_CONFLICT`. This is arguably correct
  (fail fast on malformed input) and arguably wrong (a caller learning "your revision is stale"
  matters more). **IRR must not reimplement staleness** to compensate — conflict detection is
  IPD-owned (`portfolio_store.ts:1086`).

---

## 12. Explicit non-authorization

This record **proposes**. It does not authorize, and it makes no change to:

- any IRR source or test file;
- write admission, write fences, or authorization checks;
- broker-import import machinery, portfolio writes, or broker connectivity;
- any database, carrier, persistence layer, or runtime configuration;
- the Windows acceptance sequence (not rerun; no write repeated);
- IPD (inspected read-only; zero writes, zero commits).

**Results preserved verbatim:** Step 9 remains **NOT PASSED**; Steps 5 **FAIL**, 11 **PARTIAL**;
Steps 6, 8, 14 **PASS recorded with endpoint UNKNOWN**; Gate 4 **AUTHORIZED — NOT STARTED**
(QE 0/11); Gate 5 not initiated; DQ-4 8/10; D06 unchanged.

**Implementation Authority = NOT GRANTED.**
