# Broker Import — implemented behaviour, verification evidence and outstanding limitations

Date: 2026-11-10
Repository: IRR (`ramkivs/iips-review-recovered`)
Branch: `arena/0d6a7417-iips-review-recovered`
IPD pin in IRR at this commit: `d5e20c15059267a3f824b015e37d652084de5a01` (`iips-production-market-data`, `git+ssh`)

**Scope of this record.** What the Broker Import workflow now does, what was verified and how,
what is still not implemented, and what is blocked on another repository. It replaces any
impression that the workflow can commit broker holdings today.

---

## 1. Summary

| Area | Before | After |
|---|---|---|
| Evidence-action outcomes | every distinct server outcome collapsed into one `UNCONFIRMED` | five distinct, separately rendered outcomes |
| Evidence action row | hidden once retention reached `VERIFIED`, leaving a terminal label with no action | stays reachable; the explicit retry is offered in every non-verified state |
| Browser POSTs through the documented Vite proxy | refused `403 cross-site-request-refused` for **every** browser write, including the product's own | accepted when the authority is the same loopback host; a third-party origin is still refused |
| Broker-observed commit | wrote holdings with `identityStatus: 'UNRESOLVED'` and a synthetic `MANUAL:<SYMBOL>` company id, and applied **no** whole-import identity refusal | refused fail-closed with `422 REFUSED_STORE_GUARD`, zero store effect, before any socket is opened |

**The Broker Import workflow still cannot commit holdings.** The governed identity-qualifying
commit path is not reachable from IRR. §6 states exactly why, with the measured evidence, and
§7 states the cross-repository change that would close it.

---

## 2. The two Broker Import surfaces (unchanged, and now documented accurately)

Both are routed in `frontend/src/app/App.tsx`.

### 2.1 `/broker-holdings` — `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx`

A **preview** surface. It parses a CSV in the browser, resolves identity through the IPD-owned
governed master, and retains the *parsed* evidence. It has **no save path at all**: it never
calls `/holdings` and never calls `/revision`. The screen says so in plain words, and it no
longer claims a write-gate outcome code it never observes.

The screen is honest about what retention is not: it is not a save, not a validation, not an
authorization and not durability of holdings. `savedRows` stays 0.

### 2.2 `/user-portfolios/import` — `frontend/src/features/portfolio-import/BrokerImportSurface.tsx`

The **commit** surface. It mounts IPD's `BrokerImportModal` (exported from
`iips-production-market-data/portfolio-ui`) with `IrrBrokerImportStorePortAdapter` over
`POST /api/broker-import/:portfolioId/holdings` and `GET .../revision`.

---

## 3. Evidence retention: five distinct outcomes

`frontend/src/api/brokerEvidenceRetention.ts` previously mapped every failure to `UNCONFIRMED`.
The server already distinguished them, and the browser discarded the distinction. The client
now reads the server's own bounded outcome code (`{ "outcome": "<CODE>" }`) and keeps it.

| State | Meaning | Operator action |
|---|---|---|
| `VERIFIED` | POST acknowledged **and** the read-back matched every field and the acknowledged record digest | none; the record is retained and retrievable |
| `ACKNOWLEDGED_UNVERIFIED` | the store acknowledged the write, but the read-back did not match | re-check; retention is claimed by the store only, never by the browser |
| `NOT_RETAINED` | the store reported this import id is absent (404 `RESOURCE_UNAVAILABLE`) | the explicit retry is offered |
| `TAMPERED` | the store reported the record failed its own digest re-verification (503 `EVIDENCE_TAMPERED`) | never served, never reported as absent; the record must not be edited in place |
| `REFUSED` | the route refused the request (403/400) | nothing was retained under this import |
| `UNAVAILABLE` | the store reported storage unavailable (503 `UNAVAILABLE`) | the outcome is unknown; nothing is claimed either way |
| `CONFLICT` | the store preserved an existing record and refused this snapshot (409) | the original record was not replaced |
| `UNCONFIRMED` | a **transport** fault: the request may or may not have reached the store | re-check by lookup; neither retention nor absence is claimed |

The `UNCONFIRMED` state was narrowed deliberately. A transport fault on the POST leaves the
**write's** outcome genuinely unknown — the request may have committed server-side and only the
acknowledgement was lost — so it is never reported as absence, and never as retention.

### 3.1 The action row stays reachable

The action row used to be rendered only while `retention.state !== 'VERIFIED'`, so a verified
snapshot produced a terminal label with no way to re-check the evidence it had just retained.
It is now rendered whenever a snapshot exists and no attempt is in flight:

- **"Check retained evidence"** — available in every state, including `VERIFIED`.
- **"Retry original evidence snapshot"** — available in every state except `VERIFIED`.

---

## 4. C9 and the operator-local Vite proxy (a real, deployment-level defect)

### 4.1 What was wrong

The documented deployment is `npm run dev` (Vite on `:5173`) proxying `/api` to the executive
transport on `:8787` (`docs/OPERATOR_RUNBOOK.md` §3–§4). The Vite proxy forwards with
`changeOrigin: true`, so the transport sees:

```
host: localhost:8787        <- rewritten by the proxy to the transport's authority
origin: http://127.0.0.1:5173   <- the browser's authority, unchanged
```

C9 requires the `Origin` and the `Host` to name the same authority. They never did through the
proxy, so **every browser POST to an owner-scoped write route was refused `403
cross-site-request-refused`** — including the product's own browser. The evidence route and
the broker-import commit route were both affected.

Measured in a real browser before the fix:

```
403 POST /api/broker-import/DEFAULT_PORTFOLIO/evidence
403 POST /api/broker-import/DEFAULT_PORTFOLIO/holdings
```

### 4.2 The fix

`frontend/server/user-portfolio/firstPartySignal.ts` now accepts the browser's authority when
the request travelled through the operator-local proxy. The bound is narrow and **syntactic**,
so it is a property of the code rather than of a configuration value:

- the transport's own `Host` must be a **loopback** authority (`localhost`, `127.0.0.0/8`,
  `[::1]`), and
- the `Origin` must name the **same loopback host**.

`localhost` and `127.0.0.1` are treated as the same machine; every other pair — including
`127.0.0.1` and `127.0.0.2` — is not.

### 4.3 What it does NOT do

- It does not weaken the `Sec-Fetch-Site` signal. A request that says `cross-site` is still
  refused by rule 1, before this comparison is consulted.
- It does not relax the "a simple request carries no first-party assurance" rule. A simple
  request (the shape a cross-site HTML form produces) is still refused.
- It does not accept an `Origin` naming a non-loopback authority, however it is spelled. The
  test is syntactic, so a DNS answer cannot influence it — `localhost.attacker.example` is not
  loopback and is refused.
- It does not grant access, establish an owner context, or authenticate anything. C9 remains
  explicitly *hardening*, never authentication and never authorization.
- It does **not** change `vite.config.ts`. The `changeOrigin: true` value is a pinned
  governance fence (AMEND-01 §8.1(4), C8 posture) and is left exactly as it was.

---

## 5. The identity-qualification gate (fail-closed)

`frontend/server/broker-import/brokerImportIdentityQualification.ts` (new).

### 5.1 The measured defect

IRR's broker-import route sends broker-observed holdings to the IPC operation `portfolio.save`.
On the IPD side that operation is the **manual** personal-holdings path:

- `src/ipc/dispatch.ts` → `case 'portfolio.save'` → `mapManualRequest(payload.holdings, mode)`
- `src/persistence/manualPersonalPortfolio.ts` → `mapManualHolding` stamps every row with
  `sourceBroker: 'manual-personal'`, `identityStatus: 'UNRESOLVED'`,
  `resolutionDisposition: 'MANUAL_PERSONAL_ENTRY'` and `companyId: 'MANUAL:<SYMBOL>'`.

It performs **no** governed identity resolution and applies **no** whole-import identity
refusal. Measured against a real IPD IPC server over a real unix socket, with
`IIPS_LOCAL_PERSONAL_USE=1` and a matching ACTIVE binding:

```
POST /api/broker-import/DEFAULT_PORTFOLIO/holdings  -> 200
stored holding:
  companyId:              "MANUAL:RELIANCE"
  sourceBroker:           "manual-personal"
  identityStatus:         "UNRESOLVED"
  resolutionDisposition:  "MANUAL_PERSONAL_ENTRY"
  securityIdentity:       null
```

and an import containing an unresolvable row (`NOT_A_REAL_TICKER_XYZ` / `INE000A0AAAA`) was
**not** refused by any identity gate — it flowed into `mapManualRequest` like any other row.

That contradicts IRR's own standing policy for every other write surface, which refuses EVERY
batch of unresolved holdings (`refuseUnresolvedPortfolioWrite`,
`frontend/server/user-portfolio/translationBoundary.ts`).

### 5.2 The gate

A broker-observed write is admitted only when the governed whole-import identity gate is
actually applied on the commit path this host reaches. The gate is evaluated after the DTO is
admitted and **before any socket is opened**:

- refusal: `422 { "outcome": "REFUSED_STORE_GUARD", "storeEffect": "NONE", "reason": … }`
- `REFUSED_STORE_GUARD` is already in the IPD-admitted refusal vocabulary, so no new outcome
  code is introduced and the browser adapter needs no new vocabulary.
- the reason names the missing capability and nothing else — no symbol, no company id, no
  internal path, no stack.

The switch `BROKER_IMPORT_IDENTITY_QUALIFIED_PATH_REACHABLE` is `false` by default: the
fail-closed posture is the resting state, and a configuration file existing is not evidence
that the governed path is reachable.

### 5.3 What the gate does NOT do

- It does not weaken, relax or reinterpret IPD's write gate. IPD's W-1 decision still decides
  every write that is actually attempted.
- It does not invent a mapping, infer an identity, or reuse a name/symbol similarity.
- It does not change IPD, the governed master, or any mapping store.
- It does not claim the governed path is unavailable forever. It refuses only while the
  governed path is genuinely unreachable, and reachability is one explicit operator-visible
  switch.

### 5.4 Effect on the Step-9 acceptance operator

`frontend/server/broker-import/step9AcceptanceFixtureOperator.ts` F6 proves that a conflicting
write is refused and leaves the store untouched. It now accepts either fail-closed boundary
and **records which one refused it**, in a new `refusal` field on the evidence record:

- `REVISION_CONFLICT` — the write reached the store and the revision guard refused it;
- `REFUSED_STORE_GUARD` — IRR refused the write before any socket was opened.

The two are never collapsed: the operator does not claim a revision conflict it did not
observe, and it does not claim an identity gate that did not run.

---

## 6. Why the governed commit path is unreachable — the cross-repository blocker

IPD's governed broker-import commit path is `persistBrokerImport`
(`src/persistence/brokerImportPersistence.ts`), reached through `submitBrokerImport` →
`createBrokerImportConsumer` (`src/ipc/brokerImportConsumer.ts`). It is the only path that:

- resolves every holding's identity through the governed P04 → P7 resolver;
- refuses the **whole** import with `REFUSED_UNRESOLVED_IDENTITY` when any row is unresolved
  (Gate E W-6 / DP-2 Option 2F), before any transaction;
- creates the portfolio when it is absent;
- writes the real broker provenance (`brokerImportProvenance`).

It is constructed by IPD's `startIpcServer` and returned on the startup outcome as an
**in-process function** (`outcome.brokerImportConsumer`). It is:

1. **not dispatched as an IPC operation.** IPD's protocol admits exactly seven v1 operations
   and five v2 operations (`src/ipc/protocol.ts`): `portfolio.list`, `portfolio.get`,
   `portfolio.revisions`, `portfolio.create`, `portfolio.save`, `portfolio.reset`,
   `portfolio.delete`. None of them is the broker-import operation.
2. **not exported from the `./portfolio-ui` package subpath** that IRR consumes. The shipped
   package at the pinned commit exports 22 symbols; neither `parseBrokerCsvUpload`,
   `brokerImportPreview`, `brokerImportRequestFromIngress` nor `executeBrokerCsvImport` is
   among them, and `brokerImportApplicationPath.js` is not present in the shipped `dist/package`
   at all. CAP-02 forbids copying IPD's component set into IRR.
3. **not exposed over HTTP.** The `./dhan-server` subpath carries market data and a read-only
   instrument-identity API; it carries no broker-import commit surface.

**A separate, smaller defect:** IRR's broker-import route never creates the portfolio. IPD's
`portfolio.save` requires an existing portfolio (`writeRevision` → `resolvePortfolio` →
`ResourceUnavailableError`), so on a fresh portfolio the save is refused
`404 RESOURCE_UNAVAILABLE`. Only the Step-9 operator fixture calls `portfolio.create`, and it
is a separate tool, not the application path. Measured:

```
callIpc('portfolio.save', …) with no portfolio -> CLASS_A RESOURCE_UNAVAILABLE
```

The governed path would have created it (`if (!existing) transactionWriter.create(...)`).

### 6.1 What is therefore required, and it is not an IRR change

Closing the gap needs an **IPD** change — one of:

- dispatch the broker-import operation over the existing IPC protocol (the governed consumer
  already exists, constructed and authorized with `scope: 'BROKER_OBSERVED_IMPORT'` and the
  server-owned `IIPS_LOCAL_PERSONAL_USE` authorization), or
- export the Stage 4 CSV application path from the `./portfolio-ui` subpath so IRR can reuse
  it by package export rather than by copy, or
- expose the governed commit over an authenticated HTTP surface.

IRR's constraint is explicit: **IRR repository only, no cross-repository writes, no IPD
changes.** The gate keeps IRR fail-closed in the meantime.

---

## 7. Verification

### 7.1 Automated

| Check | Result |
|---|---|
| `npm run test` (full vitest) | **177 files, 2484 tests passed**, 1 skipped, 0 failed |
| `npm run typecheck` | exit 0 |
| `npm run typecheck:replay-server` | exit 0 |
| `npm run typecheck:investment-server` | exit 0 |
| `npm run build` | exit 0, 181 modules transformed |

### 7.2 Browser-level (a real browser, not mocked)

Driven with **Chromium 153** against the real running stack — the Vite dev server on `:5173`,
proxying to the real IRR executive transport on `:8787`, talking to a **real IPD IPC server**
over a real unix socket, with a real ACTIVE local-principal binding and `IIPS_LOCAL_PERSONAL_USE=1`.

| # | Verified | Observed |
|---|---|---|
| 1 | `/broker-holdings` renders and states preview-only | `Preview only — not saved.`; no write-gate code claimed |
| 2 | the browser really calls the evidence route | `POST …/evidence` → **201** `EVIDENCE_RETAINED` |
| 3 | the retained record is retrieved and verifies | `GET …/evidence/:importId` → **200**; UI: *Evidence retained and retrievable. Holdings not saved.* |
| 4 | "Check retained evidence" stays reachable after `VERIFIED` | present; re-checking re-verifies |
| 5 | a never-retained import id | **404** `RESOURCE_UNAVAILABLE`; not reported as tampered |
| 6 | a malformed import id | the **same opaque 404** |
| 7 | there is no enumeration route | `GET …/evidence` → **405** |
| 8 | the commit is refused by the governed gate | **422** `REFUSED_STORE_GUARD`, `storeEffect: 'NONE'` |
| 9 | the modal shows a definite, non-fabricated outcome | *Persistence refused - REFUSED_STORE_GUARD* |
| 10 | nothing was written | `GET …/revision` → **404**; no portfolio created |
| 11 | the refused commit did not disturb the evidence | `GET …/evidence/:importId` → **200** |
| 12 | a tampered record fails closed | **503** `EVIDENCE_TAMPERED` — never served, never reported as absent |
| 13 | the record is retrievable again once the bytes are restored | **200** |
| 14 | the retained record survives a **transport process restart** | all previously retained records → **200** after a genuine restart |
| 15 | no uncaught script exceptions | none |

### 7.3 What was NOT verified, and why

- **A successful, durable broker-import commit.** It is impossible while §6 holds: the
  governed path is unreachable, and the reachable path cannot apply the identity gate. No
  claim of a successful commit is made anywhere.
- **A browser-to-IPD durable-save end-to-end.** Out of scope and not attempted.
- **Dhan API, live market data, authentication, trading, production acceptance, Gate 4/Gate 5,
  P4/P6/P7 consumers, credential provisioning.** Out of scope.
- **The three unresolved identity cases** (rows 44/51/63) and every existing governance
  disposition are **unchanged**. No identity was inferred, no mapping was added, the
  authenticated master was not altered, and qualification was not bypassed.

### 7.4 Retention is not claimed from passing tests

The tests and the browser run establish that the evidence POST, the digest verification, the
import-id consistency, the retrieval and the cross-process durability **work as implemented**.
They do **not** establish that a particular operator's original evidence is retained; that
requires the original artifact and its identifier. The browser runs above used synthetic CSVs
created for the run, which are clearly identified as such.

---

## 8. Files changed

| File | Change |
|---|---|
| `frontend/server/broker-import/brokerImportIdentityQualification.ts` | **new** — the fail-closed admission gate |
| `frontend/server/broker-import/brokerImportIdentityQualification.test.ts` | **new** — the gate's own tests |
| `frontend/server/broker-import/brokerImportHttp.ts` | the gate is evaluated after DTO admission and before any socket; the module header records the new step |
| `frontend/server/broker-import/brokerImportHttp.test.ts` | the gate's tests; the response-mapping tests inject an admitted gate so they test what they name |
| `frontend/server/broker-import/step9AcceptanceFixtureOperator.ts` | F6 accepts either fail-closed boundary and records which one refused it |
| `frontend/server/broker-import/step9AcceptanceFixtureOperator.test.ts` | harness injects an admitted gate; a new test covers the refusing posture |
| `frontend/server/broker-import/brokerImportModalHostIntegration.test.tsx` | injects an admitted gate so the modal composition test exercises the transport |
| `frontend/server/user-portfolio/firstPartySignal.ts` | the bounded loopback-proxy origin acceptance |
| `frontend/server/user-portfolio/ipcPortAdapter.test.ts` | the proxy-topology tests, including the refusals that must still hold |
| `frontend/src/api/brokerEvidenceRetention.ts` | the distinct retention outcomes |
| `frontend/src/api/brokerEvidenceRetention.test.ts` | the outcome tests |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx` | the action row stays reachable; the distinct outcomes render; the disclosure no longer claims a write-gate code |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.test.tsx` | the reachability and outcome-rendering tests |
| `frontend/src/features/portfolio-import/irrPortfolioStorePortAdapter.ts` | the `REFUSED_STORE_GUARD` message names the governed identity gate |

No identity mapping, governance decision, production behaviour, IPD file, master data or
`evidence/` artifact was changed. `frontend/vite.config.ts` is unchanged.
