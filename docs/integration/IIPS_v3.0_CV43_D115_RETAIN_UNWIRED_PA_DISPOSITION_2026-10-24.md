# IIPS v3.0 — CV-43 Program Authority Disposition: D115 Retained Unwired

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-CV43-D115-RETAIN-UNWIRED-PA-DISPOSITION-2026-10-24-01` |
| **Existing work item** | `CV-43` — no new CV work-item identifier is created |
| **Decision-maker** | Program Authority (PA) |
| **Decision date** | `2026-10-24` (Asia/Kolkata; no time-of-day supplied) |
| **Decision source** | The PA's explicit approved disposition, issued as a one-pass execution authorization to the operating session on 2026-10-24, prepared against decision package §2 of the same date |
| **Status** | **DECIDED — D115 RETAINED UNWIRED; NO COMPLETION PATH** |
| **Governing locus** | IRR `ramkivs/iips-review-recovered` only; IPD is not modified |
| **IRR baseline verified before preparation** | `main@4cd343704bca039610c9217eaeece35ff0b621f4` (tree `0af9ddcd13984f4a4b1ff367dd63d7c78e60426a`) |
| **Tracker registration** | Master tracker §16.103 (`CV-CORR-85`, `CHG-2026-10-24-14`); verification rows `V549`–`V559` |

> **Rendered PA decision — CV-43: RETAIN `D115` UNWIRED AND REFERENCE-ONLY.**
>
> No completion or wiring path is authorized. No Company Identity Authority is designated.

## 1. Decision

1. `frontend/server/d115-runtime.ts` and `frontend/server/d115-runtime.test.ts` are **RETAINED UNWIRED**. The disposition is *retain-unwired / reference-only*: the module is **not** a product capability, **not** a gate, and **not** a consumer of any route.
2. **No wiring is authorized.** No route, transport, feature, component or service may compose the boundary; no caller may be added. The sole importer remains its own test.
3. **No Company Identity Authority is designated.** `D115-A` remains **ISSUED BUT NOT EFFECTIVE**; `D-2` §5–§6, `D-2` §1 (domain-scoped authorities) and the G2-UI readiness non-authorization ("no `D115` modification or completion") stand unchanged.
4. The `companyId` ↔ `ISIN` ↔ G24-ticker reconciliation recorded against `REG-12` is **NOT resolved** by this record. That is the *mapping* question, owned by `CV-20` / Gate C, and it remains open exactly as recorded.
5. Re-entry requires a later express act naming the bounded domain, the authoritative source and the exact consumer. A universal Company identity authority remains out of scope.
6. `CV-43` is **CLOSED by this dated disposition**. It is a scope decision, not a capability completion.

## 2. Evidence basis (recorded, plus one dated importer census)

The investigation was completed before this record. It is **not repeated**. Recorded evidence plus the freshness re-measurement:

| # | Evidence | Verified value (2026-10-24) |
|---|---|---|
| E1 | `CV-43` register row | `OPEN — no authorized completion path`; "a universal Company identity authority is **not** to be built here" (§16.4) |
| E2 | Module identity | `frontend/server/d115-runtime.ts` — **714** lines; header states it "deliberately contains no Company Identity Authority implementation and no persistence technology"; fail-closed on missing dependencies; declares the trust order Principal → Owner/Account → Tenant → Company Binding → canonical CompanyId → immutable request-scoped `RuntimeCompanyContext` |
| E3 | Test identity | `frontend/server/d115-runtime.test.ts` — **373** lines; the only exercising surface |
| E4 | **Re-measured:** importer census at this head | `grep -rn "d115-runtime"` over `frontend/**/*.ts,tsx` returns **exactly one** importer: `d115-runtime.test.ts`. No route, transport, feature directory or `App.tsx` composition |
| E5 | Ref-universe sweep (completed) | `V31` / §16.20: no ref wires it; test-only reference across the recorded tips; nothing to reuse |
| E6 | Authority state | `D115-A` **ISSUED BUT NOT EFFECTIVE**; **no Company Identity Authority designated** (`D-2` §5, §6); `GC-D2` (Option 2F) in force; the G2-UI readiness record carries "no `D115` modification or completion" |
| E7 | §18 row 22 | implemented/tested (`V`), consumer `NI`, wiring `NW`, disposition `PENDING (CV-43)` — moved by this act only to the disposition cell |

## 3. Explicit non-grants

This record does **not** grant, imply, or schedule:

- any wiring, route composition, consumer admission or caller addition;
- any modification to `frontend/server/d115-runtime.ts` or its test — both remain byte-identical;
- a Company Identity Authority designation, or any CompanyId / ISIN / ticker semantics;
- any amendment to `D-2`, `D115-A`, or the H-4/H-16 errata disposition;
- resolution of the `REG-12` `companyId`/ISIN/ticker mapping blocker;
- any `503` fence change, Gate C / Gate 4 / Gate 5 movement, `durable:true`, result acceptance, or production eligibility;
- any admission of G24 or any other lineage; `CV-52` unchanged;
- any host or operator execution.

## 4. Durable status and effectiveness

This record is effective only when **all** of the following exist: the PA-rendered determination text above; merge to IRR `main` with green exact-head CI; independent remote read-back of the merged blob; and the dated tracker registration (§16.103) with its publication receipt. Until then it is a branch/PR record and `CV-43` keeps its recorded state.

Tracker reconciliation in the same act: §16.4 `CV-43` row; §16.12 counts; §18 row 22; §19. §2 `REG-12` is annotated only to record that the D115 *module disposition* is settled and the *mapping* blocker is **not**. **No other register item moves.**

---

*Prepared by Arena Agent Mode from the PA's approved disposition; recording and publication only. No independent authority is rendered by the recording agent.*
