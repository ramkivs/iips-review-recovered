# IIPS v3.0 — G3-D5 Historical Durable Line
## Program Authority decision record

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-G3-D5-HISTORICAL-DURABLE-LINE-PA-DECISION-2026-10-19-01` |
| Decision | `G3-D5` — CV-20(a) / P7 treatment of the off-main 2026-10-07 durable line |
| Program Authority | Ramki, single owner/user and PA |
| Decision date | 2026-10-19 (UTC) |
| PA disposition | **`REFERENCE ONLY` — APPROVED** |
| Decision source | Direct PA instruction in the execution request for this work; this is a PA decision, not an Arena recommendation |
| Governing request | IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`, §13.3/§15 and §9, blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0` |
| Historical references | G-2 durable portfolio implementation record, the historical 2026-10-07 line, and the G3-D0 disposition; exact source records remain preserved at their recorded commits |

## 1. Exact PA confirmation line

The required CV-20(a)/P7 wording is:

> **G3-D5 Off-main 2026-10-07 durable line (CV-20 (a)/R-8(a)) ................... REFERENCE ONLY**

This is the formal PA confirmation requested by the authoritative Gate 3 request. P7 is therefore **RESOLVED — REFERENCE ONLY** for the current decision register. No `OTHER` interpretation and no `DEFER` is substituted.

## 2. Meaning of `REFERENCE ONLY`

The historical line, including the reported off-main commits `470cc698` / `6828155e` where cited by the existing records, may be used only to understand history and to reconcile the decision trail. It is not:

- a current implementation or qualification baseline;
- an IPD-`main` basis;
- an admission, durable-capability result, Gate 4 result, or Gate 5 input;
- permission to promote, merge, cherry-pick, re-pin, or continue the off-main code; or
- a substitute for the new exact Gate 3 act on IPD `main`.

G3-D0 remains preserved: the historical Gate B/D4 grant and its designated ref are not erased or misstated, but the off-main line is superseded as the intended G3 implementation basis. This record does not rewrite the historical records.

## 3. Boundary and dependencies

- The PA-selected G3-D2 storage technology, **B — `node:sqlite`**, is preserved and unrelated to this reference-only classification.
- G3-D3, G3-D4, G3-D6 and G3-D7 are separate PA dispositions recorded in their own records.
- The future implementation must extend IPD's existing `PortfolioStore`/portfolio capability rather than duplicate it or repurpose PIT/certified IRR reference holdings.
- Historical evidence cannot satisfy current W-1, Gate 4, result-acceptance or Gate 5 requirements.

## 4. Explicit non-effects

No code, branch, remote ref, schema, store, fixture, route, dependency, fence or runtime behavior is changed by this decision. IPD remains `SESSION_ONLY` / `durable:false`; IRR remains HTTP `503`; C8 remains **NOT MET**; Gate 3 is not granted; Gate A′, Gate C, Gate 4, result acceptance and Gate 5 remain separate and unexecuted/not granted as applicable.

The 51-row baseline, 13-item inventory and IRR PR #114 are untouched.

*Rendered as the formal CV-20(a)/P7 PA confirmation; historical evidence remains preserved and reference-only.*
