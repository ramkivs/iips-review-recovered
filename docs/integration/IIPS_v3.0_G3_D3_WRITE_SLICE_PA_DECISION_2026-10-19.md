# IIPS v3.0 — G3-D3 Permitted Write Slice
## Program Authority decision record

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-G3-D3-WRITE-SLICE-PA-DECISION-2026-10-19-01` |
| Decision | `G3-D3` — permitted write slice |
| Program Authority | Ramki, single owner/user and PA |
| Decision date | 2026-10-19 (UTC) |
| PA disposition | **`3b` — APPROVED**: bounded write code may exist, but it is disabled by default and guarded by all four W-1 conditions |
| Decision source | Direct PA instruction in the execution request for this work; this is a PA decision, not an Arena recommendation |
| Governing request | IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`, §5.7/§9, blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0` at the inspected IPD `main` |
| Governing policy | IPD `evidence/cross-repository/IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md`, W-1–W-16 |
| Related prior decision | G3-D2 remains **B — `node:sqlite` — SELECTED AND APPROVED**; this record does not reopen or overwrite it |

## 1. Rendered decision

> **G3-D3 — permitted write slice: `3b` — APPROVED.** The future bounded implementation may contain write code, but the presence of that code must not enable a successful write. The default path is fail-closed. A write operation can be successful only when **all four** W-1 conditions below are true. This record does not itself grant Gate 3 implementation authority, execute a write, qualify a write, admit a write, or lift the IRR HTTP `503` fence.

The four conditions are conjunctive. No condition is implied by another, and no local flag, test result, default configuration, or operator assertion substitutes for any condition.

## 2. Exact W-1 guard

The accepted Gate E policy states:

> A write operation (`portfolio.create`, `portfolio.save`, `portfolio.reset`, `portfolio.delete`) may succeed **only** when all of the following hold:
>
> 1. this policy is **accepted** by the Program Authority (Gate 2);
> 2. a **Gate 3** implementation-authority act names the exact repository, IPD-`main` basis, file set and tests for the write path;
> 3. a **Gate 4** qualification run covering §4 has been executed on the deployment host **and** accepted by a separate result-acceptance act;
> 4. a **Gate 5** admission act names the qualified IPD and IRR commits and lifts the IRR `503` fence for the named operations.
>
> Otherwise IPD returns Class A `WRITE_NOT_AUTHORIZED` (after authorization) or refuses earlier, and performs **zero** store mutations.

For avoidance of doubt, the current status of the four predicates is:

| W-1 predicate | Current status in this workstream |
|---|---|
| Gate E policy accepted | **True as an accepted policy**; acceptance does not by itself authorize implementation or a write |
| Separate Gate 3 act naming exact repository, IPD-main basis, file set and tests | **Not effective**; the act prepared with this packet is explicitly proposed and blocked from effectiveness until its exact implementation set is fixed and rendered through the prescribed process |
| Gate 4 execution and separate result acceptance | **Not executed / not accepted**; no Windows, deployment-host or qualification evidence is claimed |
| Gate 5 admission naming qualified commits and lifting the named 503 operations | **Not granted**; the 503 fence remains in force |

Therefore every present and future unadmitted write remains refused with zero store effect. `3b` does not change that result.

## 3. Bounded scope and enforcement obligation

1. The only permitted write-slice decision is the existence of bounded, disabled-by-default code under a later valid Gate 3 act. It is not permission to add a second store, to replace IPD's portfolio capability, or to alter the certified IRR reference portfolio.
2. The owner/tenant/durable boundary remains IPD-owned. The accepted W-2, W-3, W-4, W-5, W-8, W-9, W-11, W-13, W-14 and W-16 rules remain controlling; this decision does not weaken them.
3. No write may be optimistic, session-labelled as durable, automatically retried, or accepted merely because a request reached an IPC endpoint. A refused or failed write has no revision, holding row, contribution row, or success response.
4. The future Gate 3 act must state the exact implementation files and tests. The current request's §6.1/§6.2 file and test tables are proposals until that act fixes them; no schema, property, API, migration, or filename is invented by this record.
5. The future Gate 3 test plan must exercise the default-disabled path and the absence of each W-1 predicate, and must verify `WRITE_NOT_AUTHORIZED`/the applicable refusal and zero database row delta. Passing those tests is Gate 3 evidence only, not Gate 4 or Gate 5 evidence.

## 4. Explicit non-effects

- No application or runtime file was changed by rendering this decision.
- IPD remains `SESSION_ONLY` / `durable:false` on `main`.
- IRR `/api/user-portfolios*` remains HTTP `503 owner-context-unavailable`.
- Gate A′ remains a separate operator act. It is not executed or implied here.
- Gate 4, separate result acceptance, Gate 5, production, and any 503 lift remain outside this decision.
- The 51-row capability baseline, 13-item inventory, and IRR PR #114 are untouched.

## 5. Evidence boundary and unresolved items

This record confirms a PA disposition and the exact policy guard. It does not establish a Gate 3 act, a durable implementation, a Windows result, restart durability, crash atomicity, revocation qualification, or admission. The exact final IPD file set and test paths remain an input that the separate act must name without relying on the historical off-main line.

*Rendered as a durable PA decision record; no implementation authority is inferred.*
