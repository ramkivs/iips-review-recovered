# IIPS v3.0 — CAP-02 U7 Read/Result Contract Decision — **RENDERED — EFFECTIVE (IRR CONSUMER CONTRACT FOR THE FIRST CAP-02 SURFACE)**

> ## STATUS: **EFFECTIVE — AS AN IRR-SIDE CONSUMER-CONTRACT DETERMINATION ONLY — IT AUTHORIZES NO IPD CHANGE, NO MODAL MOUNT, AND DOES NOT RESOLVE THE IPD-SIDE MODAL/PORT GAPS**
> This record renders effective the prepared decision
> `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-2026-10-23-01` (blob `68ed97ec9fbaa25a7d3c99c2841d821bb672ffb2`, preserved unamended) for the IRR-owned half of the contract. The provider-side modal/port amendment it identifies remains an **IPD act** and is recorded here as the exact cross-repository prerequisite (§5). The IPD-side independent reconciliation note (IPD PR #48, open, inspected read-only this pass) agrees with this classification and is not contradicted by anything in this record.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` |
| **Decision status** | **EFFECTIVE** — IRR consumer contract for the first CAP-02 surface (§§1–4); provider-side gaps remain open (§5) |
| **Baselines at rendering** | IRR `main@39a0a675eb7323b39b9465c741843a1a05316a31`; IPD `main@554ed6ceaa7422c95806fd1b6e095a24a8554be2` (read-only, re-verified unchanged this pass) |
| **Authority** | Standing PA grant (F-3 §1.2, blob `c4c9f7d7…`) as construed by DEC-06 R-1/R-3/R-6/R-7, plus the current CAP-02 directive of `2026-10-23` instructing this pass to render the U7 decision and reconcile the actual consumer contract |
| **Companion acts** | Composition act `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03`; U1 act `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` |
| **Capacity boundary (R-7)** | IRR may fix its own consumer contract and adapter rules. It may not amend accepted v1, the IPD modal, the IPD port, or any IPD file |
| **Publication** | Session branch → IRR PR → CI → merge under `CHG-2026-10-18-02`; remote read-back required |

---

## 1. The decided IRR consumer contract for the first CAP-02 surface

**Decided, effective 2026-10-23:**

1. **Surface.** The first CAP-02 surface is the IPD-exported `BrokerImportModal`, default-portfolio
   only. No `PortfolioWorkspace`, no G2 list/full view, no revision history, no workspace analytics
   in this surface.
2. **Result contract.** The surface's save result is the **minimal v1 commit receipt**
   `{disposition, revision, durability, durable}` — nothing else. `disposition` keeps the v1
   spelling (`SAVED_NEW_BATCH` | `MERGED_INTO_EXISTING` | `ALREADY_IMPORTED_NO_OP`); a duplicate is
   derived only from `ALREADY_IMPORTED_NO_OP`. No `portfolio` record, `holdingsSavedCount`,
   `totalMarketValue`, `weightSumPercentage`, `provenanceDigest` or `savedAt` may be attached,
   inferred, filled from preview data or synthesized by read-after-write.
3. **Durability.** `durability`/`durable` are accepted only from the authoritative post-commit v1
   receipt, verbatim. `durable:true` wording is permitted only from that receipt. Store-capability
   declarations are never per-operation commit evidence.
4. **Revision.** `expectedRevision` is operationally mandatory for the CAP-02 surface. The
   authoritative source is a revision-only read (`portfolio.list` summary of the exact default
   portfolio) taken immediately before the surface is enabled; races become
   `REVISION_CONFLICT`, never a silently refreshed expectation. **No HTTP GET route is admitted by
   this decision** — the read's admission belongs to a future effective U1/composition amendment
   after the provider prerequisite (§5) is met, because today no honest consumer exists for it.
5. **Refusal.** Refusals are the typed Class A outcomes (§2 of the U1 effective act). No empty
   record, current-time `savedAt`, zero metric or durability placeholder is presented as
   authoritative. `actualRevision` is populated only from an authoritative conflict result.
6. **Unknown.** Outcome-unknown (timeout/transport fault/unrepresentable result) is a distinct
   state: no retry, no `durable:true`, no rollback claim, no ordinary-refusal wording.
   Reconciliation is a separately authorized read before any user-initiated retry.
7. **Provenance gaps.** `fileName`/`importedAt` are not representable in the v1 save payload and
   remain **unresolved C-1/U2 gaps**. They are refused as unknown DTO keys, not silently dropped,
   and no durable-provenance claim is made for the first surface.

## 2. The seven-field / three-rename matrix — disposition unchanged

The matrix belongs to IRR's frozen G2 views (`userPortfolioContract.ts`, blob `e6b57bb8…`), not to
the modal surface. This decision **does not resolve it and does not impose it** on the first
surface:

- The three renames (`holdingsCount`→`totalHoldingsCount` list/detail; `committedAt`→`createdAt`)
  remain **prepared adapter rules only**, applicable solely to a future governed G2 consumer after
  envelope validation and revision-identity checks. They are not implemented by this pass and are
  not globally resolved.
- The seven missing fields (`weightSumPercentage`, `provenanceDigest`, `isSaved` ×2,
  `totalMarketValue`/`provenanceDigest`/`holdingsCount` on revision history) remain
  **unresolved/out of scope** for CAP-02. No v1 read-field expansion is recommended or made for
  this minimal surface; any future full-record consumer needs its own IPD read-contract act.
- G2 list/full view and revision history stay **refused/unavailable** in the CAP-02 surface.

## 3. Provider/consumer mapping for the first surface (authoritative table)

| Concept | Provider source (verified at IPD `554ed6ce…`) | IRR consumer rule |
|---|---|---|
| Save request | v1 `portfolio.save` payload (contract §6) | Exact top-level projection per the U1 effective act §2; broker-observed holding fields only |
| Save success | v1 minimal receipt `{disposition, revision, durability, durable}` | Relay verbatim; `isDuplicate` only from `ALREADY_IMPORTED_NO_OP`; nothing added |
| Save refusal | Class A outcome envelope (`WRITE_NOT_AUTHORIZED`, `REVISION_CONFLICT`, `RESOURCE_UNAVAILABLE`, `INVALID_REQUEST`, `REFUSED_*`, `UNAVAILABLE`) | Map to the U1 §2.2 HTTP table; no record/timestamp/durability fabrication |
| Pre-authorization refusal | Class P: zero bytes, no reason | `503 owner-context-unavailable`, indistinguishable; no reason invented |
| Unknown outcome | IRR-side timeout/EOF/fault; `callIpc` `OUTCOME_UNKNOWN` | Distinct `OUTCOME_UNKNOWN` response state; zero retries |
| Revision token | `portfolio.list` `PortfolioSummary.revision` of the exact default portfolio | Read-only, immediate, exact-ID selection; no cache; absent ID ⇒ surface unavailable; no revision-zero invention |
| Full record / analytics / history | `PortfolioDetail` (lacks `isSaved` in current projection), reserved `portfolio.analytics`, unexposed revision columns | **Not consumed by the first surface**; no substitution or inference |
| Contribution ledger | v1 `PortfolioContribution` (`contributionId`, `amount`, `contributedAt`, `createdAt`) | Not shape-compatible with G2/UI contributions; not presented; C-1/U2 owns the provenance decision |

## 4. What this decision binds in IRR implementation (this pass)

- The trusted-host adapter relays the minimal receipt verbatim and maps every refusal/unknown case
  per the U1 table; an unrepresentable success frame is outcome-unknown, never a fabricated result.
- The browser client exposes the same typed outcome vocabulary and performs no automatic retry.
- No IRR code may present preview totals, counts, digests or timestamps as committed values, or
  derive a durability claim from anything but the authoritative receipt.

## 5. Exact IPD prerequisite (cross-repository blocker — owner: IPD)

The exported modal/port at the pinned commit cannot honestly consume this contract (verified in
source this pass; see the composition act §6 for the file-level findings). **Required IPD act:**
amend the exported `BrokerImportModal`/`PortfolioStorePort` so that (a) the CAP-02 success path
consumes the minimal v1 commit receipt with no preview fallbacks, (b) refusals require no full
`PortfolioRecord` and fabricate no timestamp/zero/empty-provenance placeholders, (c) a distinct
outcome-unknown/reconciliation state exists with zero automatic retry, and (d) displayed durability
is receipt-driven, separate from static store-capability declarations. Optionally thread a
`portfolioId` prop if the default-only surface is later widened.

**Until that act lands on IPD `main` and IRR repins to it:** no `BrokerImportSurface`, no IRR
`PortfolioStorePort` implementation, no revision-read route, and no end-to-end UI composition
claim. IRR's independent work (B-1R, U1 route, browser client, tests) proceeds and is complete
without it.

## 6. Status statement

```text
U7 (IRR consumer contract):     EFFECTIVE — minimal v1 receipt, refusal/unknown rules, revision token
U7 (provider modal/port):       NOT EFFECTIVE — IPD act required (exact scope §5)
G2 seven-field/three-rename:    UNCHANGED — prepared rules only; not resolved by CAP-02
Revision-read HTTP route:       NOT ADMITTED (awaits provider prerequisite + its own act)
fileName/importedAt:            UNRESOLVED C-1/U2 gaps (preserved)
Durable success display:        NOT AUTHORIZED (receipt-driven only; W-1 unmet)
```

*Rendered under the standing grant and the current CAP-02 directive; recorded in the NP-18/DEC-06
form. This decision fixes IRR's consumer contract — it does not amend IPD, mount the modal, or
claim the provider gaps closed.*

---

## 7. Additive verification and activation addendum (2026-10-23, companion to composition act `-04`)

This section is an additive addendum under DEC-06 R-2/R-5: §§1–6 above are preserved verbatim.

1. **§5 provider and package prerequisites satisfied on IPD `main`.** At IPD
   `main@2d9130e76bb0dc89daeefabaf297e27bdaa84250` (tree `4658699180ef161aae3c1b33d3946e918d6fb9b2`,
   merged via PR #58 `16459f465024ca1eb4da4953d8e178eba4269f8e` and PR #59
   `2d9130e76bb0dc89daeefabaf297e27bdaa84250` following PR #54 `88e434474c388fb397ad09878ec6139064fbfffd`),
   the exported `./portfolio-ui` package surface satisfies every requirement of §5:
   - `PortfolioPortSaveSuccess` requires only the minimal `PortfolioCommitReceipt` (`disposition`,
     `revision`, `durability`, `durable`) with `result?: PortfolioSaveResult` optional;
   - `PortfolioPortSaveRefusal` makes `portfolio?: PortfolioRecord`, `durability?`, and `durable?`
     optional and includes `WRITE_NOT_AUTHORIZED` and `RESOURCE_UNAVAILABLE` in
     `PortfolioPortRefusalCode`;
   - `PortfolioPortSaveOutcomeUnknown` (`ok: 'unknown'`, `code: 'OUTCOME_UNKNOWN'`,
     `reconciliationRequired: true`) is a distinct third outcome with zero automatic retry and no
     rollback claim;
   - `PortfolioCommitReceipt`, `PortfolioCommitDisposition`, and `PortfolioPortSaveOutcomeUnknown`
     are directly re-exported by name from `iips-production-market-data/portfolio-ui`;
   - `./pit` and `./d114-non-production` are exported on `main` and resolve all five direct IRR
     PIT/D114 importers.
2. **§1.4 revision-read route admitted and consumer integration authorized.** Companion U1 §7
   admits `GET /api/broker-import/:portfolioId/revision` for the exact §1.4 / §3 revision-only read
   and unknown-outcome reconciliation (`portfolio.list` summary selection of `DEFAULT_PORTFOLIO`,
   returning `{ portfolioId, revision }` only, never inventing revision `0`, never retrying an
   unknown commit, never claiming rollback or receiptless durability, and never fabricating a
   `PortfolioRecord`). Successor composition act
   `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-04` authorizes the B-1R
   repin to `2d9130e76bb0dc89daeefabaf297e27bdaa84250`, the IRR `PortfolioStorePort` adapter, and
   the `BrokerImportModal` mount at `/user-portfolios/import`.
3. **Unchanged boundaries.** §2 (the seven-field/three-rename G2 matrix remains prepared-only and
   out of scope for CAP-02), §1.7 (`fileName`/`importedAt` remain unresolved C-1/U2 gaps and are
   never added as unsupported v1 save fields), `WRITE_NOT_AUTHORIZED`, the unactivated binding
   precondition, `SESSION_ONLY`/`durable:false`, and all twelve `/api/user-portfolios*` 503 fences
   remain unchanged.
