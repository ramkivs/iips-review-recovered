# Step 9 — Corrected Acceptance Procedure (Stage 3)

**Status:** ACCEPTANCE-DOCUMENTATION CORRECTION. Issued under Stage 1 + Stage 3 authorization.
**Implementation Authority for Stages 2–3 code is NOT GRANTED beyond this document** — Stage 2
(symbol-grammar alignment) is **explicitly excluded** from this work item and is not implemented.

**Step 9 result remains NOT PASSED.** The historical exchange was never captured (see the Stage 0
report). **Nothing in this document claims the original Step 9 exchange has been reproduced or
explained.** It corrects *what the step should assert*, not what happened.

**References:**
- Windows acceptance report — PR #517, `docs/integration/WINDOWS-PERSONAL-PORTFOLIO-OPERATOR-TEST-REPORT-2026-11-08.md` §7
- Step 9 contract investigation — PR #518, `docs/integration/STEP-9-REVISION-CONFLICT-CONTRACT-INVESTIGATION-2026-11-08.md`
- Stage 0 evidence capture — PR #519, `docs/integration/STAGE-0-STEP-9-EVIDENCE-CAPTURE-2026-11-08.md`
- Baseline `main` for this correction: `4f3caff2e8f5490aa3b195063a5fa77cb527ccc2`

---

## 1. Why this correction is needed

The original Step 9 acceptance check asserted:

> Expected: HTTP 409 `{"error":"revision-conflict"}`

That expectation **does not describe any implemented write contract in IRR.** Per the Stage 0
investigation, the token `revision-conflict` belongs to the **G-2 read-path error vocabulary**
(`user-portfolio-transport.ts:106`, `safeErrorCode`), whose consumer at `:190` is reachable only for
**reads**. Every G-2 write is refused with **503 `operation-not-admitted`** at `:145-146`, so the
409 with that body is unreachable for a save.

The route that genuinely implements revision-conflict detection is **Route A**, and its 409 body uses
a different, closed vocabulary: **`{"outcome":"REVISION_CONFLICT"}`**.

The original step therefore asserted **Route B's read vocabulary against a Route A write**. This
document corrects the assertion.

---

## 2. The two routes, kept strictly distinct

IRR implements two structurally different portfolio surfaces with **disjoint** error vocabularies.
A Step 9 procedure must name which one it is exercising.

| | **Route A — CAP-02 broker import** | **Route B — G-2 user portfolios** |
| :-- | :-- | :-- |
| Base path | `/api/broker-import/{portfolioId}/holdings` | `/api/user-portfolios/{portfolioId}/holdings` |
| Method | `POST` | `PUT` |
| Source | `frontend/server/broker-import/brokerImportHttp.ts` | `frontend/server/user-portfolio-transport.ts` |
| Write admitted? | **Yes** — exactly one `portfolio.save` IPC call, zero retries | **No** — refused before any port is constructed |
| Conflict response | `409 {"outcome":"REVISION_CONFLICT"}` | **None** — writes never reach conflict detection |
| Validation refusal | `400 {"error":"invalid-request","field":…,"reason":…}` (three keys, pre-IPC) | n/a for writes |
| Write refusal | n/a | `503 {"error":"operation-not-admitted"}` |
| Error envelope | `outcome` (closed `BrokerImportSaveTransportOutcome`) | `error` (closed `G2FailureReason`, hyphenated) |

**Rule for any Step 9 procedure: if the step expects a revision conflict, the route under test is
Route A.** Route B has no conflict path and is not the subject of a conflict acceptance check.

---

## 3. Route A — authoritative response vocabulary

Closed set, as implemented. A Step 9 procedure must assert against **these** values only.

| Status | Body | Emitted when | Source |
| --: | :-- | :-- | :-- |
| **409** | `{"outcome":"REVISION_CONFLICT"}` | `expectedRevision` ≠ current revision; detected in IPD's `writeRevision` | `brokerImportHttp.ts:222-223` |
| 200 | `{"disposition","revision","durability","durable"}` | commit, or idempotent no-op (`ALREADY_IMPORTED_NO_OP`) | `:205-214` |
| 400 | `{"outcome":"INVALID_REQUEST"}` | IPD refused the request as inadmissible | `:228-229` |
| 400 | `{"error":"invalid-request","field":…,"reason":…}` | IRR refused the DTO **before any socket** | `:567`, `:574` |
| 403 | `{"error":"cross-site-request-refused"}` | first-party hardening unsatisfied | `:545` |
| 405 | `{"error":"method-not-allowed"}` | method ≠ POST | `:537` |
| 422 | `{"outcome":"REFUSED_UNRESOLVED_IDENTITY"}` / `"REFUSED_STORE_GUARD"` | store guard | `:230-233` |
| 404 | `{"outcome":"RESOURCE_UNAVAILABLE"}` | portfolio absent | `:225-226` |
| 503 | `{"outcome":"WRITE_NOT_AUTHORIZED"}` | IPD refused before mutation, zero store effect | `:218-220` |
| 503 | `owner-context-unavailable` | binding precondition absent, or transport fault | `:552`, `:587` |

**Note on `expectedRevision: 0`.** `0` is admitted by both IRR's validator
(`brokerImportBoundary.ts:203`) and IPD v1's `requireExpectedRevision` (accepts `>= 0`). A genuine
409 **is** reachable with `expectedRevision: 0` provided the payload passes IPD `validate()`.
However IPD runs `validate()` **before** the staleness comparison (`portfolio_store.ts:1607-1612`),
so a stale revision **with an invalid payload** yields `400 INVALID_REQUEST`, not 409. A Step 9
procedure must therefore use a payload that is valid apart from its revision.

---

## 4. Corrected Step 9 procedure

**Preconditions (read-only capture is mandatory — see §6):**

1. Route A is the route under test: `POST /api/broker-import/{portfolioId}/holdings`.
2. A portfolio exists at a **known current revision R ≥ 1**.
3. The payload is **valid in every respect except `expectedRevision`**: non-empty `holdings`, unique
   symbols each matching `/^[A-Za-z0-9][A-Za-z0-9._&-]{0,39}$/` (IPD's grammar — no spaces),
   `quantity` in `(0, 1e9]`, `averageBuyPrice` and `currentPrice` finite and within range.
   *A payload that violates any of these yields 400, not 409, regardless of revision.*
4. `expectedRevision` is set to a value **≠ R** (e.g. `R - 1`, or `0` when `R ≥ 1`).

**Expected result:** HTTP **409** with body **`{"outcome":"REVISION_CONFLICT"}`**, and **zero store
effect** — the portfolio revision is unchanged after the attempt.

**Explicitly NOT the expected result:**
- `{"error":"revision-conflict"}` — this is G-2 **read-path** vocabulary; Route A never emits it.
- `409` with any `error` envelope — Route A's 409 uses the `outcome` envelope.
- `400` — a 400 means the request was refused for a **validation** reason (IRR pre-IPC or IPD
  `validate()`), not a revision conflict. A 400 is a **distinct failure**, not an approximate pass.

**Mode:** a Step 9 conflict probe must state its `mode` and assert it. `MERGE` and `REPLACE` are both
admissible on v1. REPLACE semantics are transmitted via `payload.operation: "REPLACE"` (Stage 1); for
a pure conflict probe, `MERGE` is the simplest choice and carries no `operation` key.

---

## 5. Preserved historical record — NOT PASSED

The original Step 9 result is **preserved unchanged**:

> **Step 9 — NOT PASSED.** Expected HTTP 409; observed HTTP 400 `invalid-request`.

**Grounds for preservation:**

1. The original **request and response were never captured** (Stage 0, PR #519 — BLOCKED). The
   observed body is recorded only as a **bare token**, not as JSON.
2. This correction changes the **expectation**, not the **evidence**. A corrected expectation
   cannot retroactively pass a run whose inputs are unknown.
3. **This document does not claim the original exchange has been reproduced or explained.** No
   request was replayed; no portfolio write was issued; the deleted portfolio was not recreated.

**Step 9 returns PASS only when the corrected procedure in §4 is executed against a captured,
valid request and yields `409 {"outcome":"REVISION_CONFLICT"}` with zero store effect.**

---

## 6. Capture requirements (binding on any re-run)

Stage 0 established that the single greatest obstacle to diagnosing Step 9 was the absence of a
capture. Any re-run must record, and retain as committed evidence:

| # | Field |
| :-- | :-- |
| 1 | Responding service (IRR host vs IPD) |
| 2 | HTTP method and exact path |
| 3 | Full request body, including `expectedRevision` and `mode` |
| 4 | Response status |
| 5 | Full response body, verbatim |
| 6 | Portfolio revision **before** and **after** the attempt (proves zero store effect) |

**A repeat stale write to obtain this is not authorized by this document**; it is a write and needs
its own authorization. Permitted substitutes for the historical case: a saved operator transcript,
browser DevTools export, HAR file, or terminal scrollback.

---

## 7. What this document does not do

- It does **not** implement Stage 2 (symbol-grammar alignment) — explicitly excluded.
- It does **not** change write admission, authorization, persistence architecture, or production
  eligibility.
- It does **not** move Gate 4, Gate 5, DQ-4, D06, or any other downstream status.
- It does **not** recreate or modify the deleted acceptance portfolio.
- It does **not** claim the historical exchange has been reproduced or explained.
- It does **not** convert Step 9 to PASS.

**Preserved verbatim:** Step 9 **NOT PASSED**; Step 5 **FAIL**; Step 11 **PARTIAL**; Steps 6, 8, 14
**PASS recorded with endpoint UNKNOWN**; Gate 4 **AUTHORIZED — NOT STARTED** (QE 0/11); Gate 5 not
initiated; DQ-4 8/10; D06 unchanged.
