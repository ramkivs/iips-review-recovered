# PKG-05 — CV-32 PIT UI/API-only disposition packet

**Status:** prepared for product disposition; not a decision and not implementation authority.
**Status update (2026-10-18, UTC):** disposition rendered — **CV-32 CLOSED — API-only for the current scope** (see "Decision recorded" at the end of this packet; tracker §16.55 `CV-CORR-38`; `CHG-2026-10-18-01`). The historical text below is preserved verbatim.
**Date:** 2026-10-18.
**Owner:** IRR product owner for the consuming surface; IPD interface remains unchanged.

## Verified state

- Matrix row 20 and current IRR code establish the read seam `/api/pit/market-data`, bound to the pinned IPD package; it is HTTP/API-only and the identity authority is explicitly `NON_AUTHORITATIVE`.
- Current CV-32 record says the PIT seam answers correctly, `src/api/pit.ts` exists, but no feature consumes it. Row 21 is `NI`/`AP`/`NW` and `NOT SATISFIED`.
- Existing UI/API work and tests do not constitute a mounted product screen. Do not combine CV-32 with CV-22 universe widening or the portfolio decision.

## Separate disposition alternatives

1. **Mount a bounded PIT panel** on an identified company view. Define a single screen, exactly which read-only fields are shown, non-authoritative identity/freshness presentation, and one test that exercises the mounted path through the client/API boundary.
2. **Record API-only** for the current product scope. Preserve the API and its tests; no UI work is commissioned.

The decision owner must select or expressly defer; this packet does not choose. If option 1 is selected, implementation requires its own bounded authorization and closure evidence: mounted screen plus a test covering actual route consumption and honest identity semantics. If option 2 is selected, record the explicit API-only disposition and close CV-32 by documentation. No IPD source change, universe widening, or Group 1/2 act is implied.

---

## Dated addendum (2026-10-18, UTC) — investigation completed; decision-ready comparison

> Additive. The sections above are preserved verbatim. This addendum completes the CV-32 investigation with verified evidence (`evidence/integration/cv32-pit-disposition-2026-10-18/evidence-record.md`) and presents the comparison the decision owner needs. **It does not select an option, does not admit the route, does not commission or remove any UI, and does not treat API availability as UI acceptance.** CV-32 remains `OPEN` / product-owner decision until a disposition is recorded.

### A1. Verified starting point

IRR `main` `82431e5b28ecc01a778e4f38427cbf294fa8eef5` (code unchanged for this investigation); IPD `main` `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (PR #24, docs-only; its §6 restates CV-32 as an IRR/PA display decision); IRR PRs #137/#138 open and untouched. Tracker: CV-32 `OPEN` (§16.4), matrix row 20 `V/V/V · NI (HTTP only; no UI)`, row 21 `NI/AP/NW · NOT SATISFIED`; §16.20/V31 history-wide absence of any PIT UI or consumer (reused).

### A2. Current state in one table

| Dimension | Verified state | Evidence |
|---|---|---|
| API | `GET /api/pit/market-data?securityId=ISIN:<isin>:<series>&domain=D01_QUOTES\|D02_OHLCV&asOf=<UTC>` — exact-path, GET-only, fail-closed typed misses, IPD provenance verbatim, `payload.securityIdentity.isinAuthority = NON_AUTHORITATIVE`; non-production data (D114 historical + fixtures) | `pit-transport.ts`, `pit/**`; probe table (evidence §5); runbook `:106–107, :162` |
| Tests | **113** API/boundary/runtime/client tests pass (48 + 28 + 27 + 10) on the exact composed server; CI green at `main` | evidence §4; CI run `39140713740` |
| UI | **none** — no route, nav, feature directory, or importer of `src/api/pit.ts` (client is dead code in the bundle); history-wide absence (V31) | `App.tsx:33–61`; `src/features/`; grep; §16.20 |
| Reachable through the intended application? | **No.** Nothing in the application reaches the seam; it is reachable only by direct HTTP (operator probe) | evidence §2 |
| Identity available to a company screen | **None.** `/research/company/:id` is sector-keyed; `CompanyData` has no ISIN; governed universe `canonicalSecurityId` is the sector name; deriving a securityId from sector/company is forbidden (client header; IPD §5.1) | `company.ts:24`, `executive-transport.ts:587`, `pit.ts:7–9` |
| Authority of the route | AD-02 admits package consumption for five server files (server-side, non-production). The live `/api/pit/` dispatch and `pit-transport.ts` are **retained, NOT ADMITTED (P4)**: "activation or admission of this route requires a separate, explicit Program Authority gate; route presence is not admission" | B2 record §3; governance reconciliation §2.1(2)/§2.3; REG-02 row |
| Operator / browser / Windows acceptance | none exists for any PIT surface; Gate A′/C not executed by Arena | — |

### A3. Evidence-based comparison

| | **Option A — bounded, mounted PIT panel** | **Option B — explicit API-only disposition** |
|---|---|---|
| Supporting evidence | A working, tested, fail-closed seam and a typed client exist (`src/api/pit.ts`); a host screen exists (`CompanyIntelligence.tsx`); a mounted-path test is feasible with existing patterns (`pit.test.ts` real-server harness + `CompanyIntelligence.test.tsx` RTL) | Everything the seam needs to be API-only already exists and is tested (113 tests); the runbook already documents the GET as an operator probe; §16.49 `I-1` already records "LIVE (non-production) — no UI consumer" |
| Missing requirements / acceptance criteria | (1) **Identity source** — no ISIN on any IRR screen; needs CV-22 outcome (ISIN-bearing universe + exact identity contract at point of use) **or** a product decision for a manual securityId lookup widget (a different product shape); (2) **P4 route gate** — product consumption of `/api/pit/market-data` must be expressly admitted; (3) bounded authorization for the panel (this packet §"Separate disposition alternatives" (1)); (4) acceptance: exact field list, non-production/`NON_AUTHORITATIVE`/vintage presentation, honest miss states, no live-data substitution; (5) operator browser acceptance on the Windows host | (1) the product owner's explicit one-line disposition; (2) wording that does **not** admit the P4 route or imply UI readiness ("API-only, non-production, operator-probe scope; route admission unchanged") |
| Required implementation / documentation | Code: one component mounted on `CompanyIntelligence` (read-only fields: `securityId/isin/series + isinAuthority`, `domain`, requested `asOf` vs `resolvedAsOf`, `dataVersion`, `qualityState`, `lineageHash` prefix, quote fields `ltp/bid/ask/open/high/low/previousClose/volume/change/pctChange/currency/exchange/symbol`; miss states `NOT_FOUND/INVALID_*`), plus one mounted-path integration test; **no server, contract, adapter, or IPD change**. Docs: PKG-05 decision line, tracker CV-32/§16.12/row 21, runbook §5 row, index | **No code.** Docs only (≈10 lines): PKG-05 decision line; tracker CV-32 row → closed as *API-ONLY (display decision; non-production; route admission unchanged — P4)*; §16.12 open count `4→3`; matrix row 21 Authority/Acceptance → dated decision (`DEFERRED`/`OOS` by decision, not `NOT SATISFIED`); packet index note |
| Relevant tests and results | Existing 113 pass; **0** UI tests exist; the closure test ("exercises the mounted path") does not exist and cannot be written until the identity source is decided (what does the panel query for a sector-keyed page?) | Existing 113 pass and are retained unchanged (packet requirement "preserve the API and its tests") |
| Unresolved decision / authority dependency | Product owner (panel + shape) **and** PA (P4 route gate) **and** CV-22 (identity coverage) — three distinct acts; CV-22 is `DECISION REQUIRED` | Product owner only (one line). Does not touch P4, CV-22, CV-20, Reports, Macro |
| Consequences of selecting | First product-level PIT consumer; shows **non-production** historical data inside the product (must be labelled); creates a per-security expectation on a per-sector page (coherence risk until CV-22 widens identity); adds a UI surface to the Windows acceptance scope; CV-32 stays open until panel + test + acceptance land | PIT stays a server-side, non-production, operator-probe capability; `src/api/pit.ts` remains a tested-but-unconsumed client (kept by packet rule); no user-facing market data in the product (row 21 recorded as a dated decision); fully reversible — a later panel is a **new** item with its own gate; CV-32 closes by documentation |

### A4. Exact remaining gaps and acceptance criteria

| Gap | Option A | Option B |
|---|---|---|
| Identity contract at point of use | **Open** — depends on CV-22 or a manual-entry product decision | not needed |
| P4 route gate (product activation of `/api/pit/market-data`) | **Open** — explicit PA act | not needed (unchanged) |
| Bounded panel authorization + field list + presentation rules | **Open** | not needed |
| Mounted-path test (client → route, honest misses, no substitution) | **Open** (not writable before the identity decision) | not needed |
| Operator browser acceptance (Windows host) | **Open** — not an Arena task | not needed |
| Documentation closure (PKG-05 line, CV-32 row, §16.12, row 21, index) | after the above | **only step** |

> *Dated note (2026-10-18, later): §§A5–A7 below are the pre-decision recommendation and are preserved as rationale. The product owner has since rendered the disposition — see "Decision recorded".*

### A5. Recommended disposition (recommendation only — not a decision)

**Record Option B — explicit API-only — for the current product scope, dated and reversible.** Rationale from the evidence: (i) Option A cannot be closed by CV-32 itself — it is blocked by two acts outside this item (CV-22 identity coverage; P4 route gate) and by an unanswered product-shape question (per-security data on a per-sector page vs. a manual lookup widget); (ii) nothing in the approved requirements names a PIT screen — matrix row 21 is `AP — none commissioned`, and the product's own UI posture excludes PIT addressing as a user capability; (iii) the seam is complete, tested, fail-closed, and documented for operator use, which is exactly what "API-only" records; (iv) Option B costs no code, changes no authority state, and leaves a clean path to a future panel as a new, separately gated item once CV-22 provides an exact identity contract. **If the product owner wants market data visible in the product, Option A should be chosen explicitly and sequenced after CV-22 and the P4 gate — not approximated now.**

### A6. Decision and acceptance still required

1. **Product owner (IRR consuming surface): select Option A, Option B, or expressly defer.** Suggested Option B line: *"CV-32 — API-only for the current scope. The PIT seam remains a server-side, non-production read surface (AD-02 scope; P4 route admission unchanged). No PIT UI is commissioned. Any future panel is a new item requiring an identity contract (CV-22) and the P4 gate."*
2. If **Option A**: additionally (a) PA — P4 gate for product consumption of `/api/pit/market-data`; (b) CV-22 outcome or an explicit manual-securityId product decision; (c) bounded panel authorization (field list / presentation / miss semantics / test); (d) operator browser acceptance on the Windows host after implementation.
3. No operator acceptance is required for Option B (documentation closure only).

### A7. Smallest next action to close CV-32

Product owner records the one-line disposition (A6.1). Then one documentation-only change: PKG-05 decision line; tracker CV-32 row → closed/API-only with the P4 caveat; §16.12 open-item count `4→3`; §18 row 21 Authority/Acceptance → dated decision; packet-index note — published through the standard IRR docs PR once PRs #137/#138 have been disposed (to avoid a competing or mixed PR). No code, test, route, or IPD change.

*Boundaries: no option is approved by this addendum; API availability is not UI acceptance; no browser/Windows evidence is claimed; portfolio persistence, CV-20/CV-22, Reports, Macro, PR #137/#138, the 13-item inventory and the 51-row baseline are untouched.*

---

## Decision recorded (2026-10-18, UTC) — CV-32 CLOSED: API-only for the current scope

**Disposition (product owner, IRR consuming surface):** **CV-32 — API-only for the current scope.** Rendered 2026-10-18 and conveyed to the operating session as the authorizing instruction for this recording act. This packet (together with tracker §16.55 `CV-CORR-38` and change-log row `CHG-2026-10-18-01`) is the IRR record of the decision. The Option A / Option B investigation above is closed by it and is not reopened.

**What the disposition means — and its mandatory restrictions (all preserved):**

1. The PIT API (`GET /api/pit/market-data`; `frontend/server/pit-transport.ts`, `frontend/server/pit/**`, client `frontend/src/api/pit.ts`) remains a **non-production read surface** within the `AD-02` admission: five admitted server/test files, server-side locus, non-production data (D114 historical population + fixtures), `securityIdentity.isinAuthority = NON_AUTHORITATIVE`.
2. **P4 route admission remains unchanged.** The live `/api/pit/` dispatch and `pit-transport.ts` stay *retained, NOT ADMITTED*; activation or admission still requires a separate, explicit Program Authority gate. **Route presence, successful HTTP responses and passing tests do not establish admission.**
3. The API is **not** a user-facing PIT product feature and must not be described as one. Its operator-probe documentation (`docs/OPERATOR_RUNBOOK.md:106–107, :162`) is unchanged.
4. **No PIT UI is implemented, mounted or authorized** by this disposition. `src/api/pit.ts` is retained as a tested, unconsumed client (packet rule: preserve the API and its tests).
5. **Any future mounted panel requires:** a separate, explicitly authorized work item; an established identity contract at the point of use (CV-22); the applicable P4 gate; bounded panel scope (single screen, exact read-only fields, non-authoritative/non-production/vintage presentation, honest typed misses, no live-data substitution, one mounted-path test); and the required operator acceptance. None of these is started, implied or pre-approved here.
6. Not touched: portfolio persistence, CV-20, CV-22, Reports (CV-21), Macro qualification, the 13-item inventory, the 51-row baseline (row 21's cells are updated by this dated decision; the row set is unchanged), PRs #137/#138, IPD. **No production qualification, admission or production eligibility is claimed or implied.**

**Evidence basis:** `evidence/integration/cv32-pit-disposition-2026-10-18/evidence-record.md` (IRR `main@82431e5b28ecc01a778e4f38427cbf294fa8eef5`; IPD `main@be32d8c95a86b3f03bd382ccde5b6398efb351c6`; 119/119 focused tests; GET-only probe; history-wide UI absence per tracker §16.20/V31) and §§A1–A7 above (rationale).

**Register effect (tracker):** CV-32 `OPEN` → **`CLOSED — API-ONLY for the current scope`** (§16.4.3, closed in place); §16.12 closed-by-disposition group `1`, open `4→3`, active outstanding `13→12`, total `35`; §18 row 21 Authority/Evidence/Acceptance → `OOS by dated decision`; §19 category row and §20 row 7 annotated; `CHG-2026-10-18-01`.

**Closure.** CV-32 is **CLOSED by documentation**. Smallest remaining step: none for CV-32. (CV-43, D115, remains a separate open item with its own disposition pending.)

*End of PKG-05 decision record. Documentation-only: no code, test, route, fence, persistence, configuration or IPD file changed.*
