# Step 9 — Corrected Acceptance Procedure Readiness Assessment

**Determination: BLOCKED. Not ready for authorized execution.**

The corrected Step 9 procedure cannot be executed against IRR as `main` stands. Three independent
blockers were established from source; **two of them are contradictions inside the accepted
governance record that only a Program Authority decision can resolve.** No amount of operator care,
fixture design or capture discipline removes them.

**This assessment is READ-ONLY.** No POST/PUT/DELETE was issued. No portfolio was recreated. No
database, runtime, owner-binding, source, test or IPD change was made. No gate was advanced.

**Step 9 remains NOT PASSED.** Establishing readiness is not acceptance, and this report establishes
that readiness is **not** presently attainable.

**Repository:** `ramkivs/iips-review-recovered`
**Baseline:** `0ae7ea7634e49b9cbb957109cc0edd8366ad4dac` (verified `ls-remote` == local, tree clean)
**IPD reference:** pin `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19`, inspected **read-only**

---

## 1. Summary of findings

| # | Finding | Consequence |
| :-- | :-- | :-- |
| B1 | Route A writes return `503 WRITE_NOT_AUTHORIZED` unless `IIPS_LOCAL_PERSONAL_USE=1` (IPD `dispatch.ts:437`) | Without the switch the step gets **503**, never 409 |
| B2 | That switch **contradicts** the accepted W-1 policy, which says no environment variable may substitute for a predicate | Setting it to make the test pass is a governance breach, not a test step |
| B3 | The fixture **cannot be created** through IRR — Route A has no create; `portfolio.save` on a missing portfolio is `RESOURCE_UNAVAILABLE` | No isolated fixture can be provisioned via any currently-authorized path |
| B4 | The fixture **cannot be cleaned up** through IRR — Route A exposes no delete | Cleanup requires a direct IPD write, which is out of scope |
| B5 | Step 10's 68-row preview converges to **3 resolved / 65 unresolved, 0 saved**, and 61 of 68 symbols contain spaces | No valid Route A payload is derivable from the only in-repo evidence corpus |

**B3 and B4 alone are sufficient to BLOCKED.** A stale-revision conflict requires an existing
portfolio at a known revision, and the accepted acceptance-qualification status is that no fixture
may be created or destroyed by this work item.

---

## 2. Exact endpoint and request contract (Route A)

**Endpoint:** `POST /api/broker-import/{portfolioId}/holdings`
**Source:** `frontend/server/broker-import/brokerImportHttp.ts` — route parse `matchRoute` `:151-190`
(`leaf === 'holdings'` → `HOLDINGS`), handler gate order §4.

### Request headers (all mandatory)

| Header | Value | Why |
| :-- | :-- | :-- |
| `Content-Type` | `application/json` | Non-simple type is required; `text/plain`, form types are refused as `INDETERMINATE` (`firstPartySignal.ts:61-65,305-311`) |
| `Origin` | `http://127.0.0.1:8787` — **must equal the `Host`** | `compareOriginToHost` must yield `originMatchesHost === true` (`:281-282`, `:317-321`) |
| `Host` | `127.0.0.1:8787` | implicit from the URL; must match `Origin` exactly |

A bare `curl` **without** `Origin` is accepted (`origin === null` → `FIRST_PARTY`), but an `Origin`
that disagrees with `Host` is refused `403`. A **simple** request (no non-simple header, or a
`text/plain` content type) is always `INDETERMINATE` → `403`. This is the single most likely
operator error, and it is masked: the wrong-header case and a genuine cross-site block produce the
identical `403 {"error":"cross-site-request-refused"}`.

### Request body (exact admitted DTO key set)

`BROKER_IMPORT_DTO_KEYS` (`brokerImportBoundary.ts:47-53`) — **exactly** these five, no others:

```json
{
  "expectedRevision": <integer ≥ 0>,
  "mode": "MERGE",
  "holdings": [ { "symbol": "...", "quantity": N, "averageBuyPrice": N, "currentPrice": N } ],
  "contentDigest": "<64 lowercase hex>",   // optional
  "broker": "<≤32 chars>"                   // optional
}
```

Extra key ⇒ `400 {"error":"invalid-request","field":…,"reason":"field-outside-v1-save-payload"}`
(`:184-190`). `operation` is **not** an admitted inbound key (Stage 1 derives it internally).

### Holding requirements — the trap that must be respected

IPD's `mapManualRequest` runs **before** `store.save`, and `validate()` runs **before** the staleness
comparison. A payload that is invalid in any respect yields `400 INVALID_REQUEST`, **never 409**.

| Field | Required by IPD | Constraint | Source |
| :-- | :-- | :-- | :-- |
| `symbol` | **yes** | `/^[A-Za-z0-9][A-Za-z0-9._&-]{0,39}$/` | `manualPersonalPortfolio.ts:29,62` |
| `quantity` | **yes** | finite, `0 < q ≤ 1e9` | `:64-67` |
| `averageBuyPrice` | **yes** | finite, `0 ≤ p ≤ 1e12` | `:69-73` |
| `currentPrice` | **yes** | finite, `0 ≤ p ≤ 1e12` | `:70-74` |
| holdings count | — | `1..200` | `:30,124-126` |
| duplicate symbols | — | refused | `:128-131` |

**Critical:** `quantity`, `averageBuyPrice` and `currentPrice` are **required by IPD** even though
IRR's boundary treats them as **optional** (`brokerImportBoundary.ts:183-189`). Omit them and IRR
accepts, IPD refuses `400` — which presents exactly as the Step 9 symptom. A payload drawn naively
from `{symbol}` alone would reproduce the original failure for a *different* reason and look like a
regression.

### Revision-conflict response contract

**Expected:** `HTTP 409`, body exactly `{"outcome":"REVISION_CONFLICT"}`
(`brokerImportHttp.ts:222-223`), with **zero store effect** (refusal precedes any mutation in
`writeRevision`, IPD `portfolio_store.ts:1086-1090`).

**Not** `{"error":"revision-conflict"}` — that is G-2 read-path vocabulary and unreachable for a
write, as established in PR #518/#519 and corrected in PR #520 Stage 3.

---

## 3. Minimum isolated fixture specification

A fixture satisfying the procedure requires **all** of:

| Property | Value | Establishable today? |
| :-- | :-- | :-- |
| `portfolioId` | opaque, non-blank, ≤128, no `/` or `\`, no control chars (`brokerImportBoundary.ts:140-154`) | chosen by IPD on create |
| Owner | IPD's single `ACTIVE` A-2 local-principal binding + one `ACTIVE` membership | **pre-existing; not creatable here** |
| Current revision `R` | known and `≥ 1` | requires a committed create or prior save |
| Holdings | ≥1 valid holding per §2 | derivable |
| Isolation | must not be the deleted acceptance portfolio, nor any owner's real portfolio | **no create path** (B3) |

**The fixture is not specifiable as an isolated artifact**, because creating it requires
`portfolio.create` — a write operation that is (a) not exposed by any IRR route, (b) refused by
IRR's mount, and (c) refused by IPD under W-1. See B3.

---

## 4. Owner binding and authorization

### IRR-side precondition

`IIPS_G3_IPC_BINDING_PROVISIONED ∈ {"true","1","yes"}` (`ownerContextFromBinding.ts:213-225`),
otherwise `503 owner-context-unavailable` **before any IPC connection is attempted**. This is a
local fail-closed precondition, explicitly **not** authentication and **not** proof of a binding.

### IPC endpoint

`IIPS_G2_IPC_ENDPOINT` (`userPortfolioContract.ts:178`) — named pipe `\\.\pipe\<name>` on Windows.
Absent ⇒ `IpcClientError` ⇒ `503 owner-context-unavailable`.

### IPD-side owner resolution

IPD resolves the owner **per request** from its own `ACTIVE` binding/membership. IRR transmits no
owner and cannot; `IPC_REFUSED_WIRE_KEYS` makes a substituted owner a hard refusal. **No operator
step can establish this** — it must pre-exist.

### The write gate (decisive)

IPD `dispatch.ts:437`:

```ts
if ((IPC_WRITE_OPERATIONS as readonly string[]).includes(envelope.op)) {
  if (!personalUse) { await writeGuarded(classAFrame(envelope.op, 'WRITE_NOT_AUTHORIZED', requestId)); return; }
```

`personalUse = env[IIPS_LOCAL_PERSONAL_USE] === '1'` (`localPersonalUse.ts:28-30`), read from the
**server process environment only**, never from a request, header or flag file.

While unset, **every** v1 write — `portfolio.create/save/reset/delete` — returns
`503 {"outcome":"WRITE_NOT_AUTHORIZED","storeEffect":"NONE"}` before any revision comparison. Step 9
can therefore never reach 409. This is B1.

---

## 5. The governance contradiction (B2) — the reason this is BLOCKED, not merely blocked

`docs/integration/IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_EFFECTIVE_2026-10-19-02.md` §7
states, of the four W-1 predicates:

> Because W-1(3) and W-1(4) remain false, **every write is refused with zero store effect** …
> **No local flag, environment variable, test result, default configuration or operator assertion
> substitutes for any predicate.** G3-D3 `3b` is a disabled-by-default code-slice disposition, not
> write enablement.

Yet IPD at pin `59fdfd1` implements exactly such a flag — `IIPS_LOCAL_PERSONAL_USE=1` — documented
in `localPersonalUse.ts:1-24` as the "explicitly authorized switch" under a **2026-11-08** Program
Authority instruction, and it raises the revision cap from 4 to 1000.

**These two records cannot both govern the same execution.** Until a Program Authority act states
which instrument is authoritative for an acceptance run, setting `IIPS_LOCAL_PERSONAL_USE=1` to reach
the 409 would violate the accepted W-1 text, and not setting it guarantees a 503. There is no
third option. **This is a decision, not an investigation finding I can resolve.**

---

## 6. Execution sequence (for when the blockers are resolved)

Recorded so the procedure is ready, **not** as authorization to run it.

**Phase R — read-only capture (safe today):**

```
R1  GET /api/broker-import/{portfolioId}/revision
      → 200 {"portfolioId":"…","revision":<R>}
    Confirms existence and establishes R. Refused 404 if absent; 503 if binding unset.
R2  Record R, the exact timestamp, and the responding service.
```

The revision route requires only that the first-party decision **not** be `NOT_FIRST_PARTY`
(`brokerImportHttp.ts:496-497`) — a weaker gate than the save. Unlike the save, `GET` with no
`Origin`/`Sec-Fetch-Site` is admissible.

**Phase W — the single write (NOT authorized):**

```
W1  POST /api/broker-import/{R_portfolioId}/holdings
    Content-Type: application/json
    Origin: http://127.0.0.1:8787
    body: valid payload (§2), mode "MERGE",
          expectedRevision = R - 1  (or 0 when R ≥ 1)
      → EXPECT 409 {"outcome":"REVISION_CONFLICT"}
```

`expectedRevision: 0` is admissible at both layers, so a genuine 409 is reachable with it; `R - 1`
is preferred where `R ≥ 2` because it exercises a non-zero stale value.

**Phase V — verification (read-only):**

```
V1  GET /api/broker-import/{portfolioId}/revision
      → 200, revision must STILL be R   (proves zero store effect)
V2  Capture the verbatim 409 status + body, the exact request line, and V1's output.
```

---

## 7. Zero-side-effect verification

On a 409, IPD throws `RevisionConflictError` from `writeRevision` **before** any insert
(`portfolio_store.ts:1085-1090`); the store is unchanged by construction. Two independent checks:

1. **Revision identity** — V1 returns the same `R`. Necessary but not sufficient.
2. **Absence of a new contribution/revision row** — `cover: portfolio.revisions` read before and
   after must be byte-identical in length.

**Not verifiable from IRR alone:** IRR exposes no row-count or audit surface. Proving *no* row was
appended requires either an IPD-side read (out of scope, IPD is read-only here) or the operator's
direct database inspection (**a database access this assessment is not authorized to perform**).
IRR's own test suite proves zero-store-effect with a real store (`brokerImportHttp.test.ts`
`REVISION_CONFLICT` mapping; IPD `g3_write_gate.test.ts` row-delta assertions), but that is
in-process evidence, not acceptance evidence.

**Recorded honestly:** check 1 is establishable; check 2 is **not** establishable under current
authorization.

---

## 8. Cleanup

Route A exposes exactly three leaves — `holdings`, `revision`, `evidence` (`:177`). **There is no
`portfolio.delete`, no `portfolio.reset` and no `portfolio.create`.** Route B's `DELETE` is present
in its route table but refused `503 operation-not-admitted` at `:145-146`.

Removing the fixture therefore requires a direct IPD `portfolio.delete` write — a write outside IRR
entirely, in a repository this work item treats as read-only. **B4.**

If the fixture were an *existing* portfolio, no cleanup would be needed (a refused write leaves
nothing), but the fixture would then not be isolated, and §3's isolation requirement fails.

---

## 9. Required authorizations — none of which are granted

| # | Authorization | Status |
| :-- | :-- | :-- |
| A1 | Resolve B2: which instrument governs writes for an acceptance run (W-1 §7 text vs `IIPS_LOCAL_PERSONAL_USE`) | **NOT DECIDED — PA required** |
| A2 | Authorize setting `IIPS_LOCAL_PERSONAL_USE=1` on the IPD process for the run window | NOT GRANTED |
| A3 | Authorize creation of an isolated fixture (`portfolio.create`) | NOT GRANTED — no path exists anyway (B3) |
| A4 | Authorize the single `portfolio.save` write that is the test itself | NOT GRANTED |
| A5 | Authorize fixture deletion (direct IPD write) | NOT GRANTED |
| A6 | Authorize direct database inspection for the row-delta proof | NOT GRANTED |
| A7 | Authorize an owner binding/membership if none `ACTIVE` | NOT GRANTED — and this work item may not change owner bindings |
| A8 | Authorize setting `IIPS_G3_IPC_BINDING_PROVISIONED` and `IIPS_G2_IPC_ENDPOINT` | runtime config — NOT GRANTED |
| A9 | Name the responding service and the verification method in advance | NOT ESTABLISHED |

---

## 10. What *is* established (so the eventual run is cheap)

- The exact endpoint, method, header set, DTO key set and holding field requirements (§2).
- The exact expected response: `409 {"outcome":"REVISION_CONFLICT"}` with zero store effect.
- The three traps that would otherwise produce a misleading result: simple-request `403`; missing
  `quantity`/`averageBuyPrice`/`currentPrice` ⇒ `400` that mimics the original symptom; and
  `expectedRevision` must be paired with an otherwise-valid payload.
- The read-only preflight (`R1`) and post-check (`V1`) that need no write authority.
- Stage 1 and Stage 2 are implemented and merge-verified on `main`, so the adapter now transmits
  `REPLACE` correctly and refuses inadmissible symbols locally — neither is what blocks Step 9.

## 11. Explicitly unresolved — not guessed

| Open question | Why unresolved |
| :-- | :-- |
| Whether `IIPS_LOCAL_PERSONAL_USE` is lawfully settable for acceptance | B2 contradiction; PA-only |
| How an isolated fixture is to be created | No route in IRR; `create` is a refused write |
| How that fixture is to be removed | No route in IRR; `delete` is a refused write |
| Which service answers the run | Not previously captured (Step 0); must be fixed in advance |
| Whether any `ACTIVE` binding/membership currently exists | Not observable read-only from IRR |

---

## 12. Determination

**BLOCKED.** Not ready for authorized execution.

The corrected procedure is now precisely specified and would be cheap to run, but it cannot be run:
the write it depends on is gated by a switch whose use contradicts the accepted W-1 policy, the
fixture it needs cannot be created through any authorized path, and the cleanup it requires has no
implemented route. Those are governance and capability gaps, not documentation gaps.

**Recommended next decision, in order:** (1) a Program Authority ruling on B2; (2) if writes are
authorized for acceptance, an act naming the fixture lifecycle (create → test → delete) and who may
execute each; (3) then this procedure, unchanged, executed once with full capture.

**Step 9 remains NOT PASSED.** Preserved verbatim: Step 5 **FAIL**; Step 11 **PARTIAL**; Steps 6, 8,
14 **PASS recorded with endpoint UNKNOWN**; Gate 4 **AUTHORIZED — NOT STARTED** (QE 0/11); Gate 5 not
initiated; DQ-4 8/10; D06 unchanged. No downstream gate is advanced by this report.
