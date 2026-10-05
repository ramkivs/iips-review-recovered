# NP-08 / D08 MACRO — FINDING E COMMENT RECTIFICATION ACT

> **Act identifier:** `NP-08-D08-MACRO-PROVIDER-DESIGNATION-COMMENT-RECTIFICATION-ACT-01`
> **Finding:** `E — provider-designation comment reconciliation`
> **Decision date:** `2026-10-05`
> **Act type:** Comment-only factual rectification; non-executable
> **Production:** Out of scope
> **IPD:** Must remain untouched

---

## 1. PURPOSE

This act records and rectifies stale provider-designation commentary in four IRR Macro implementation files.

The comments were written before the durable provider-designation act and stated or implied that MoSPI was not designated. That statement is no longer accurate for the governed D08 Macro scope.

This act does **not** reopen, amend, or reinterpret entitlement, licensing, attribution, provenance, production, or live-E2E governance.

---

## 2. AUTHORITATIVE BASELINE

| Item | Value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` |
| Authoritative investigation ref | `origin/main` |
| `origin/main` commit | `2f8f62be76cff97b17c50b6ca107eaee670c2523` |
| `origin/main` tree | `23d3387c7cd231de25ad8a69e494690cf6ce620f` |
| `origin/main` parent | `630820f8cb22fd279f7d93603e5674fff703b11e` |
| Provider-designation act | `docs/integration/NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT.md` |
| Provider-designation act blob | `300568446c06bb9ff94c0292cf787349571dda6e` |
| Provider-designation act SHA-256 | `de92dabd81925fd9b4856f3b868a9f12a95f15acb7c64326c859d1b348c058b6` |
| Provider-designation act size | 11,629 bytes |
| Provider-designation commit | `630820f8cb22fd279f7d93603e5674fff703b11e` |
| Pre-mutation session branch | `arena/01a10b3c-iips-review-recovered` |
| Pre-mutation session commit | `b21df5cc474aa4cd9c5b9634bf0497bc51cba628` |
| Pre-mutation session tree | `8f28eb8681b9cd18b33c9e929b19d51d84a919e2` |
| Pre-mutation worktree | Clean after reconciliation to the already-published session-branch state |

`origin/main` was independently checked against the live GitHub `main` ref before mutation. The current session branch was reconciled to its already-published remote descendant before this gate began; no Arena-only implementation state was relied upon.

### Publication constraint

The Arena session is fixed to `arena/01a10b3c-iips-review-recovered`. Session control prohibits pushing directly to `origin/main` or switching to another branch. Accordingly, this act and the four comment corrections are published fast-forward to the fixed session branch and independently verified there. Direct `origin/main` publication is not claimed by this act.

---

## 3. AUTHORITY BASIS

The authoritative provider-designation act establishes:

> **MoSPI is the designated provider for D08 Macro NAS / CPI / IIP only.**

The designation does not establish:

- entitlement or licensing permission;
- commercial-use authorization;
- redistribution authorization;
- caching or retention authorization;
- GODL applicability;
- M-3 provenance authority;
- production authorization; or
- authority for WPI, PPI, RBI-sourced data, or any other dataset.

The separate entitlement/licensing decision remains **B — PARTIALLY ESTABLISHED**.

---

## 4. FINDING E — EVIDENCE

Four current implementation files on `origin/main` contained stale provider-designation commentary.

| File | Stale statement found | Surrounding accurate restrictions |
|---|---|---|
| `frontend/server/executive-transport.ts` | `MoSPI is NOT designated` | No entitlement, M-3, production or D08 expansion was implied by the route |
| `frontend/src/api/macro.ts` | `MoSPI is NOT designated by this module` | Source was described as a technical identifier; entitlement, commercial use, redistribution, caching and retention remained ungranted |
| `frontend/src/features/research/MacroContext.tsx` | `MoSPI is NOT designated` | No entitlement, commercial use, redistribution, caching or retention right was granted; M-3 remained unestablished |
| `frontend/server/macro/mospi-source.ts` | `MoSPI provider designation ... NOT DESIGNATED`; technical-source comment also said the identifier was not a provider designation | Entitlement, commercial use, redistribution, caching, retention, M-3, production and boundary expansion remained separate gates |

The stale statements were comment-only factual inconsistencies. No executable behavior depended on them.

### File-specific authoritative baseline coordinates

| File | Origin blob | SHA-256 |
|---|---|---|
| `frontend/server/executive-transport.ts` | `1b98d0510cbcc0dc4ba133068c8605fbbd943092` | `6ac12b575e598e0618dc174c1dd3271246a6d2ebc45e7a6f7d8bc8fb3ba01b3e` |
| `frontend/src/api/macro.ts` | `24c0911c4aeab1b8a3dd207b935ba57455dd3b5c` | `5e056f798b3de66387a7dd3dfbb7ca6ac4d13430aae0d1db5433a1215f26d7ab` |
| `frontend/src/features/research/MacroContext.tsx` | `3fd917d867846106ad354599e888d162fc5bb259` | `1a7019c19661e6f6878ca808e5b5dd3783c97ec0d974a299761f0f82c839810d` |
| `frontend/server/macro/mospi-source.ts` | `e2d7c957799b352ec429f95ea563f51dab231def` | `3b94c747297b634caa97b76677da4da8da1a3d6ebd717d405d62e3d86b94184f` |

---

## 5. RECTIFICATION SCOPE

The stale provider-designation commentary is superseded and corrected only for the D08 Macro provider-designation status:

> **MoSPI is designated for the governed NAS/CPI/IIP Macro scope.**

The corrections preserve the accurate restrictions in each surrounding comment. In particular, provider designation is not converted into entitlement, licensing, commercial-use permission, redistribution permission, GODL applicability, M-3 closure, or production authorization.

The following remain unchanged:

- D08 boundary: NAS / CPI / IIP only;
- WPI/PPI/RBI exclusion;
- no acquisition-logic change;
- no transport or API change;
- no authentication change;
- no retry, timeout or pagination change;
- no dataset-eligibility change;
- no IIP-granularity change;
- no UI disclosure change;
- no entitlement/licensing interpretation change;
- no provenance-authority change;
- no production behavior change; and
- no IPD mutation.

---

## 6. GLOBAL SEARCH CLASSIFICATION

The repository-wide authoritative search found the following categories:

### A — stale and requiring correction

The four implementation files listed in §4. These are the only four files rectified by this act.

### B — historical governance record intentionally preserved

The following records retain historical pre-designation language and are not rewritten:

- `docs/integration/NP-08-D08-MACRO-DATASET-BOUNDARY-ACT.md` — historical boundary-state tables;
- `docs/integration/NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT.md` — historical decision matrix/status;
- `docs/integration/NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT.md` — historical quotation of the prior act's superseded statement.

These records are read together with the later provider-designation act and this rectification act.

### C — valid statement for another scope/date

The D06/D07 governance records that state a D06 provider was not designated remain unrelated to D08 Macro and are not changed.

### D — valid local authority-scope statement

`frontend/server/macro/macro-transport.ts` states that provider designation was not authorized **by that implementation act**. That is a scope statement about the earlier act, not a current claim that MoSPI is undesignated. It is not modified.

---

## 7. IMPLEMENTATION BEHAVIOR

This rectification changes comments only.

No runtime statement, constant, URL, request, response, authentication path, retry policy, pagination logic, dataset allowlist, IIP filter, or UI behavior is changed by Finding E.

---

## 8. DURABILITY REQUIREMENT

The Universal Artifact Durability Invariant applies:

1. Arena-local existence is not durability.
2. The exact authoritative baseline must be verified before mutation.
3. Only the four comment corrections and this act may be changed by this gate.
4. The correction must be committed and fast-forward published to the fixed session branch.
5. Remote commit, parent, tree, changed-file list, blobs and SHA-256 values must be independently verified.
6. Provider and entitlement acts must remain byte-identical.
7. No IPD, production, acquisition, transport, UI, test, entitlement or licensing mutation may occur.

The execution report records the final mutation commit, tree, parent, act blob, corrected-file blobs, SHA-256 values, remote verification, and exact diff.

---

## 9. FINAL GOVERNANCE RECONCILIATION

```text
Provider            = MoSPI designated for NAS/CPI/IIP — ESTABLISHED
Entitlement         = B — PARTIALLY ESTABLISHED / UNCHANGED
Licensing           = UNCHANGED / unresolved
M-3                 = NOT ESTABLISHED / UNCHANGED
D89                 = governance unchanged; implementation unchanged
Live E2E            = C — BLOCKED / UNCHANGED
Production          = NOT AUTHORIZED / UNCHANGED
IPD                 = UNTOUCHED
```

*End of Finding E Provider-Designation Comment Rectification Act.*
