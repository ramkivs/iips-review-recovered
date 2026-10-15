# NP-08 / D08 MACRO — V-C5 · D91 §1 NOTICE · ACCEPTANCE RECORD

> **Record ID:** `NP-08-D08-MACRO-V-C5-D91-NOTICE-ACCEPTANCE-RECORD-01`
> **Date:** `2026-10-16` (Asia/Kolkata)
> **Scope:** The D91 §1 Macro data-mode notice **only** on `/research/macro` (one notice, P-1). Not acceptance of live-source availability, broader Macro capability, production qualification, or any other workstream.
> **Disposition:** **ACCEPTED — D91 §1 notice scope only.**
> **Program Authority:** **Ramki** — single owner and Program Authority. The current task instruction explicitly authorizes this bounded acceptance and the merge of implementation PR #110 at its verified head.
> **Recording agent:** Arena Agent Mode — evidence execution and record preparation only. No independent authority, signature, or third-party sign-off is claimed.
> **Governing implementation authority:** `NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`, durably published via PR #109 (merge `b893587619f489e6b1bd234fe17411974a0903e8`).
> **Reviewed implementation baseline:** PR #110 merged to IRR `main` at `9d5d0953f6aee69f2511a5d29f5b7bb0f8b81435` (head `e9279a50b9dbd05c7536284cbd2b5747f132b897`, 3 files, checks green).

## 1. Decision and authority boundary

This record is the separate, bounded acceptance act required by the implementation authority act §10 (VC-3). It does not amend any governed act, grant D91/D88 relief, change Settings or data-mode controls, change transport/API/clients/source adapters, or authorize production, qualification, admission, activation, certification or release. It records only that the D91 §1 notice has been implemented and validated within the authorized scope.

## 2. V-C5 condition reconciliation

| Condition | State | Evidence |
|---|---|---|
| **VC-1** — Authority act durably published and effective | **SATISFIED** | PR #109 merged `2026-10-15`; act present on `main` at `b893587…`; independently verified |
| **VC-2** — Notice implemented and validated | **SATISFIED** | PR #110 merged `2026-10-16` at `9d5d095…`; implementation files present on `main`; focused + full suite, typecheck, build green |
| **VC-3** — Required acceptance and tracker reconciliation | **SATISFIED by this record** | This acceptance record + tracker update (§16.34) durably published |

## 3. Per-criterion disposition (VA-1…VA-10)

| Criterion | Result | Evidence |
|---|---|---|
| VA-1 Visible notice (loaded + refusal) | PASS | `MacroResearch.test.tsx` asserts presence in both states |
| VA-2 Exact wording (strict equality) | PASS | `toBe(...)` on `macro-data-mode-notice` equals the §3 string |
| VA-3 Placement (one, adjacent, not per-panel) | PASS | Single instance; absent inside every panel |
| VA-4 Truthful live-only behaviour | PASS | V59–V61 re-verified ACCURATE; only `/api/macro/{nas,cpi,iip}` requested |
| VA-5 Failure behaviour | PASS | Refusal state keeps notice; no substitution |
| VA-6 No user-selectable data-mode controls | PASS | Negative test (no LIVE/SNAPSHOT/PIT; no form controls) |
| VA-7 Governed-act & fence integrity | PASS | Only 3 intended files changed; fence blobs unchanged |
| VA-8 Suite/type/build | PASS | typecheck, test:ci (761/761), assert-tests OK, build OK |
| VA-9 Responsive | PASS (by construction) | Notice uses padding, no fixed widths, no horizontal overflow |
| VA-10 Change-set review | PASS | Notice code + tests only; nothing deleted/renamed |

## 4. Wording verification (V59–V61)

Re-executed against `main` `b893587619f489e6b1bd234fe17411974a0903e8` and re-confirmed against `9d5d095…`: all **ACCURATE**, no discrepancy. The approved string is rendered verbatim and unaltered.

## 5. Exclusions preserved

No D91/D88 relief, no D91 Relief Determination, no Settings/preference/data-mode change, no transport/API/client/source-adapter change, no `MacroContext.tsx` runtime change, no governed-act or fence change, no IPD change, no legal/licensing/attribution/GODL/M-3 determination, no production qualification, no V-C6/XV-15/CPI missing-index/L-3 or other workstream.

## 6. Tracker reconciliation

`V-C5` is marked **CLOSED** in the authoritative tracker (§16.34) on the basis of VC-1, VC-2 and VC-3 all being durably evidenced and remotely verified. Register/count movement: V-C5 moves from open to closed; no other register item, count, entitlement, legal, qualification or production state is moved.

## 7. Publication

This record is published from the session branch `arena/9dd124b7-iips-review-recovered` through a pull request into `main`, together with the additive tracker entry. Merging is the Program Authority's act. Remote verification of the merge commit, blob and tracker row follows publication.
