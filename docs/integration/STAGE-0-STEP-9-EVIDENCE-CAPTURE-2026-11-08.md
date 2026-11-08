# Stage 0 — Step 9 Exact Request/Response Evidence Capture

**Status: STAGE 0 = BLOCKED — the original request/response was not retained.**
No reconstructed or guessed request is substituted.

**Nature:** one-pass investigation, documentation only. **Implementation Authority = NOT GRANTED.**
No source, test, database, carrier, persistence, or runtime-configuration file was modified. IPD was
inspected **read-only** (fresh clone at the pin; zero IPD writes, commits, or PRs).

**Work item:** Stage 0 of the Step 9 correction sequence.

**References:**
- Windows acceptance report — PR #517, `docs/integration/WINDOWS-PERSONAL-PORTFOLIO-OPERATOR-TEST-REPORT-2026-11-08.md`
- Step 9 contract investigation — PR #518, `docs/integration/STEP-9-REVISION-CONFLICT-CONTRACT-INVESTIGATION-2026-11-08.md`
- Authoritative `main` at investigation: **`5e48372fc9f0809dec52773fed87b8554c89687b`**

---

## 0. Coordinates

| Item | Value |
| :-- | :-- |
| IRR repository | `ramkivs/iips-review-recovered` |
| IRR branch | `arena/9c22674e-iips-review-recovered` |
| IRR HEAD = remote `main` | `5e48372fc9f0809dec52773fed87b8554c89687b` (verified `ls-remote` == local) |
| Working tree at start | clean, 0 modified files |
| IPD reference clone | `/tmp/ipd9` at pin `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19` |
| IPD remote `main` | `de8756de1d7d4082e8e144dadf3fb53373b711c6` (pin ≠ `main`; the pin is what IRR resolves) |
| IPD inspection scope | **READ-ONLY.** Zero IPD writes. |

---

## 1. Determination

**STAGE 0 = BLOCKED.**

The exact Step 9 request line, request body, `expectedRevision`, `mode`/`operation`, responding
service, and response body **were never captured and are not retained anywhere in the repository or
its history.** The only surviving record of the observation is a two-token summary written after the
fact: HTTP status `400` and the word `invalid-request`.

Per the work-item instruction — *"If the original request/response was not retained, explicitly
report Stage 0 as BLOCKED by missing historical evidence. Do not substitute a reconstructed or
guessed request"* — this report **does not** propose a request body, and **does not** declare a
confirmed root cause. It records what is evidenced, what is not, and what would be needed.

**Step 9 remains NOT PASSED.** This report does not convert, reclassify, or soften it.

---

## 2. Evidence search — what was examined

Every location that could plausibly retain the exchange was checked. All negative.

| # | Location searched | Method | Result |
| :-- | :-- | :-- | :-- |
| 1 | `evidence/` tree, all subdirectories | `find`, `ls` | No Windows-run or Personal-Portfolio run directory exists. Directories cover CAP-03 S2, IID workstreams, Dhan/WS-A, PA dockets — none covers the 14-step operator sequence. |
| 2 | Any `.har`, `.log`, `.pcap`, transcript file | `git ls-files` | Only CI/test logs from unrelated workstreams (`evidence/cap03-s2/…`, `evidence/integration/np06-…`). **No HTTP capture of any kind.** |
| 3 | Full tracked tree, literal `invalid-request` | recursive `grep` over `.md/.json/.log/.txt/.har/.ps1` | 15 hits. **All are documentation, contract text, or test-report prose.** No hit is an HTTP transcript of Step 9. |
| 4 | Full git history, request-body fragments | `git log --all -S'expectedRevision'`, `git grep` over 50 revisions | Only the PR #518 document I authored. **No committed request body, no `curl` invocation, ever.** |
| 5 | Deleted files across all history | `git log --all --diff-filter=D` filtered for windows/step-9/portfolio | **Empty.** Nothing matching was added then deleted. |
| 6 | Local untracked + gitignored files | `git status --porcelain --ignored` | **Empty.** No local capture on disk. |
| 7 | `.gitignore` exclusion risk | rule inspection | Ignores `logs`, `*.log` — so a capture *could* have existed locally and been excluded from Git. This is a **plausible loss mechanism**, and is recorded as such, but nothing is present to recover. |
| 8 | The operator report itself | full read of §4 and §7 | §4 states operator-supplied values are **"not committed anywhere in the repository"** and that Arena grepped the full tree finding **zero** occurrences. §7 states **"the request body was not captured."** |

**Decisive negative in rows 3 and 4:** the repository has never contained a Step 9 HTTP exchange.

---

## 3. What the surviving record actually says — narrower than a JSON body

This distinction matters and is the most important correction in this report.

The operator report records the Step 9 observation **twice**, and in **both** places it records the
**bare token**, not a JSON body:

- §3 table, line 71: `` **NOT PASSED** — HTTP 400 `invalid-request`, not expected HTTP 409 ``
- §7, line 153: `` Expected HTTP 409, observed **HTTP 400 `invalid-request`**. ``

A search for the literal JSON string `{"error":"invalid-request"}` in the operator report returns
**NOT PRESENT.**

**Consequence:** the claim that the response body was exactly `{"error":"invalid-request"}` was an
**interpretation introduced in PR #518** (the Step 9 investigation), not an operator-captured fact.
PR #518 reasoned from the token's likely JSON envelope. That inference was reasonable, but it is
**not evidence**, and this report records it as *derived, not observed*.

This materially widens what remains possible, because a bare-token record cannot distinguish which
of several emitters produced it — see §4.

---

## 4. Request-to-protocol validation trace (bounded by what is known)

The trace is performed on the **IRR v1 save path as it exists at `5e48372`**, because that is the only
path the UI uses for a portfolio save. It shows what *would* have to be true for each stage to be the
observed 400 — it does **not** assert which stage fired.

### 4.1 The UI's save request (source-established, not capture-established)

`frontend/src/api/brokerImport.ts:287-288` issues exactly one write:

```
POST /api/broker-import/{portfolioId}/holdings
```

and `:337-338` issues the revision read:

```
GET  /api/broker-import/{portfolioId}/revision
```

`BrokerImportSurface.tsx:52` initialises `initialExpectedRevision = 0`, and the surface is mounted
bare (`App.tsx:49 `<BrokerImportSurface />``), so unless the revision read succeeded first the save
carries `expectedRevision: 0`. **This is source-established and was recorded in PR #518; it is not a
capture of what Step 9 actually sent.**

### 4.2 IRR Route A save gate order (`brokerImportHttp.ts`, save handler)

Each gate and the exact body it emits. **None emits a two-key body.**

| Order | Gate | Line | Emitted status/body | Matches bare token? |
| :-- | :-- | :-- | :-- | :-- |
| 1 | method ≠ POST | `:537` | `405 {"error":"method-not-allowed"}` | no |
| 2 | first-party signal | `:545` | `403 {"error":"cross-site-request-refused"}` | no |
| 3 | IPD binding precondition | `:552` | `503 owner-context-unavailable` (via `respondOwnerContextUnavailable`, `:553`) | no |
| 4 | bounded body read | `:557` | `{error}` = `invalid-json` (400) or `request-body-too-large` (413) | **no — never `invalid-request`** |
| 5 | portfolioId shape | `:567` | `400 {error, field, reason}` — **three keys** | no |
| 6 | DTO validation | `:574` | `400 {error, field, reason}` — **three keys** | no |
| 7 | one IPC call → `respondToOutcome` | `:585`, `:590` | `409 {"outcome":"REVISION_CONFLICT"}` / `400 {"outcome":"INVALID_REQUEST"}` | no |

**Finding: the save route is structurally incapable of emitting a bare two-key
`{"error":"invalid-request"}`.** Every 400 carries `field` + `reason`, and every downstream refusal
uses the `outcome` envelope, not `error`.

### 4.3 Exhaustive enumeration of the bare body

The exact bare form `{ error: 'invalid-request' }` — no other keys — is emitted in only **two**
places in the whole server tree:

| Emitter | Route / method | Reachability |
| :-- | :-- | :-- |
| `brokerImportEvidenceSubmission.ts:45` | `POST /api/broker-import/{id}/evidence` | Requires a query string **or** a malformed `portfolioId`. This is the **Step 11 evidence** route, **not** the save route. |
| `user-portfolio-transport.ts:161` | G-2 `detail` / `revisions` — **GET only** | Reached only for a **read**; every write is intercepted at `:145-146` and returns `503 operation-not-admitted`. |

The third-bare-emitter candidate, `safeErrorCode` (`user-portfolio-transport.ts:106`), produces
`invalid-request` from `G2FailureReason INVALID_REQUEST` at `:190` — but `:145-146` makes that
unreachable for any write.

### 4.4 IPD cannot have produced the token

Verified at pin `59fdfd1`: a recursive grep for `invalid-request` across IPD `src/` returns
**empty**. IPD's refusal vocabulary is `INVALID_REQUEST` inside an IPC frame, surfaced to IRR as
`{outcome:"INVALID_REQUEST"}`. **IPD never emits the hyphenated token over HTTP.**

**Therefore the observed token is IRR-owned vocabulary.** Whatever produced it was an IRR route (or
something asserting IRR's vocabulary), not IPD.

### 4.5 The v1 protocol facts (unchanged, re-verified at the pin)

- `dispatch.ts:217` — v1 derives mode from **`options.mode`** or **`payload.operation`**, defaulting
  to `MERGE`. It does **not** read top-level `payload.mode`.
- `portfolio_store.ts:1607-1612` — `save()` calls `validate(request)` **before** `writeRevision(...)`,
  so a stale revision with an invalid payload yields `INVALID_REQUEST`, never `REVISION_CONFLICT`.

Both confirm PR #518's findings on the mechanism. **Neither was confirmed as Step 9's trigger**,
because no request exists to test against them.

---

## 5. Directly evidenced vs. unknown

### Directly evidenced (artifact-backed)

| Fact | Provenance |
| :-- | :-- |
| Step 9 was recorded as `NOT PASSED` with HTTP **400** | Operator report §3 line 71 |
| The observed token was `invalid-request` | Operator report §3/§7 — bare token only |
| The expected result was HTTP **409** "revision conflict" | Operator report §3 |
| The request body was **not** captured | Operator report §7, explicit |
| Operator-supplied values were never committed | Operator report §4, explicit; corroborated by rows 3–7 of §2 |
| No Step 9 HTTP capture exists in tree, history, or locally | §2 rows 3–6 |
| The IRR save route cannot emit a bare two-key body | §4.2 |
| The bare body has exactly two emitters, neither the save route | §4.3 |
| IPD never emits `invalid-request` | §4.4, verified at pin |
| IRR's adapter sends top-level `mode`; IPD v1 ignores it | §4.5 (mechanism), PR #518 |

### Not evidenced — remains UNKNOWN

| Unknown | Why it matters |
| :-- | :-- |
| **Responding service** (IRR server / Vite proxy / IPD / other) | Determines which route model applies at all |
| **HTTP method and exact path** | Save vs evidence vs G-2 read are three different contracts |
| **Request body**, incl. `expectedRevision`, `mode`, `holdings` | Needed to test any hypothesis |
| **Whether `expectedRevision` was `0`** | The single most discriminating field |
| **Full response body** (bare vs three-key vs `outcome` envelope) | Narrows the emitter from 7 candidates to 1 |
| **Whether Step 9 was driven through the UI at all** | Steps 6/8/14 were served by an unidentified endpoint; Step 9 may share that origin |
| **Whether a Vite proxy rewrote or synthesised the response** | `vite.config.ts` proxies all `/api`; a proxy error would not be IRR source |

**Recorded explicitly: the Step 9 responding endpoint is UNKNOWN, consistent with the treatment
already applied to Steps 6, 8, and 14. This report does not infer it.**

---

## 6. Root cause

**No confirmed root cause.** Stage 0 cannot confirm one, because the discriminating inputs are
absent.

What *can* be stated with confidence, and is stronger than PR #518's position:

1. The observation's **token is IRR vocabulary**, so the responder was IRR or something echoing it
   — **not IPD**. This rules out the "IPD rejected the frame" family of explanations outright.
2. The **save route cannot produce that body shape**, which casts genuine doubt on the assumption
   that Step 9 exercised the save route at all. The evidence route (`:45`) and the G-2 read
   (`:161`) both *can*, and neither is a portfolio save.
3. PR #518's two candidate causes were already shown to be **v2-only and unreachable** from IRR's
   v1 adapter; Stage 0 does not disturb that finding, and adds no support for them.

**Most defensible current statement:** the recorded result is consistent with Step 9 **not having
reached IRR's save path**, and therefore with the acceptance step having targeted a different route
or service than the one whose 409 contract it asserted. **This is a hypothesis, not a finding**, and
is flagged as the primary thing the missing capture would settle.

---

## 7. Prerequisites for proceeding to Stage 1

Stage 1 (the `REPLACE` correction proposed in PR #518) is **independent of Step 9's root cause** — it
is a defect established from source, not from the observation. Even so, it must not proceed until:

| # | Prerequisite | Rationale |
| :-- | :-- | :-- |
| P1 | **Supply the original Step 9 transcript**, or a deliberate decision to proceed without it | Converts Stage 0 from BLOCKED to PASS; without it, Stage 1 fixes a real defect but **not necessarily Step 9's** |
| P2 | Capture **at minimum**: responding service, method, exact path, request body, response status, full response body | Six fields; the body alone resolves 5 of the 7 §5 unknowns |
| P3 | **Read-only capture only** — no repeat stale write | Reproducing the conflict requires a forbidden repeat write. Permitted substitutes: the operator's saved transcript, browser DevTools export, HAR, or terminal scrollback |
| P4 | Explicit statement of whether Step 9 used the UI or a direct HTTP call | Determines whether `BrokerImportSurface.tsx:52`'s `expectedRevision = 0` was even in play |
| P5 | Bounded impact statement for Step 8 | PR #518 §4.3 shows `REPLACE` collapses to `MERGE`; Step 8's PASS may be affected. **Not converted here** |
| P6 | Separate implementation authority for Stage 1 | **NOT GRANTED.** This report does not confer it |

**If P1 resolves as "no transcript exists and none can be produced":** the honest disposition is that
Step 9 remains **NOT PASSED and undiagnosed**, and Stage 1 may still be authorized *on its own
merits as a source-established defect* — with the Step 9 acceptance step corrected (PR #518 Stage 3)
to name Route A and its real `{"outcome":"REVISION_CONFLICT"}` body. That combination is coherent
and does not require inventing a request.

---

## 8. Explicit non-authorization

This record makes no change to:

- any IRR source or test file;
- write admission, write fences, or authorization checks;
- broker-import machinery, portfolio writes, or broker connectivity;
- any database, carrier, persistence layer, or runtime configuration;
- the deleted portfolio (not recreated); no successful acceptance operation repeated;
- any POST/PUT/DELETE/write request (none issued during this investigation);
- IPD (read-only; zero writes, zero commits, zero PRs);
- Stages 1–3 (none implemented).

**Qualifications preserved verbatim:** Step 9 **NOT PASSED**; Step 5 **FAIL**; Step 11 **PARTIAL**;
Steps 6, 8, 14 **PASS recorded with endpoint UNKNOWN**; Gate 4 **AUTHORIZED — NOT STARTED**
(QE 0/11); Gate 5 not initiated; DQ-4 8/10; D06 unchanged. **No downstream gate is moved.**

**STAGE 0 = BLOCKED. Implementation Authority = NOT GRANTED.**
