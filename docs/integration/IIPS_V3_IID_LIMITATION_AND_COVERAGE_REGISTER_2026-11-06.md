# IIPS v3.0 — Investment Intelligence: Limitation and Coverage Register

**Programme:** IIPS v3.0 Investment Intelligence Design (IID)
**Register ID:** `IIPS-V3-IID-LIMITATION-COVERAGE-REGISTER`
**Opened:** 2026-11-06 (IID-3)
**Status of this document:** **AUTHORITATIVE CUMULATIVE RECORD.** One record, continuous across phases. Every
phase from IID-3 onward adds to it and may not delete from it.

---

## 1. What this register is, and what it is not

This is the single place where a limitation on the investment-intelligence capability is recorded, tracked and
closed. It is **not** a phase checklist and it is **not** a per-deliverable caveat list: an entry opened by IID-0
stays in this document until implementation evidence plus acceptance tests justify changing its status, regardless
of whether a later phase happens to use the affected functionality.

Three rules govern it.

1. **Carry-forward is mandatory.** IID-0's and IID-2's limitations (`L-001` … `L-009`) are reproduced here in their
   original intent, with their original numbers. A later phase may not renumber, merge, soften or drop them.
2. **Nothing is closed because it stopped being used.** An entry whose functionality a later phase does not
   exercise is still a limitation of the capability. "We no longer call it" is not resolution.
3. **No status improves without evidence.** `PARTIALLY RESOLVED` and `RESOLVED` require (a) an implementation that
   addresses the entry, (b) an acceptance test that would fail if the implementation regressed, and (c) a pointer in
   the entry's *evidence* field. Absent all three, the status stays `OPEN`.

**Status vocabulary.** `OPEN` — the limitation stands, unchanged. `PARTIALLY RESOLVED` — part of the described gap
is closed by implementation with tests, and the residue is named. `RESOLVED` — the gap is closed, with evidence.
`BLOCKED` — resolution is impossible in the current environment or authority frame; the reason is recorded.

**Per-entry fields.** Id · originating phase · description · affected contracts/metrics/sectors/outputs · status ·
downstream phases affected · consequence for user-visible results · required resolution/evidence · owner or
responsible phase · evidence references · last status update.

---

## 2. Register at a glance

| ID | Originating phase | Short title | Status | Last update |
|----|-------------------|-------------|--------|-------------|
| L-001 | IID-0 | 3 of 13 sectors measured; 10 outstanding (R-16 not complete) | OPEN | 2026-11-06 |
| L-002 | IID-0 | 20 XBRL tags mapped; unmapped tags remain visible gaps | OPEN | 2026-11-06 |
| L-003 | IID-0 | Closed derivation set = 8 items | OPEN | 2026-11-06 |
| L-004 | IID-0 | Synthetic reference dataset validates mechanics only | OPEN | 2026-11-06 |
| L-005 | IID-2 | Bank dividend withheld (`NET_DEBT_TO_EBITDA_UNAVAILABLE`) | OPEN | 2026-11-06 |
| L-006 | IID-0/IID-2 | Restricted cash `NOT_COMPUTABLE: NOT_REPORTED`; schema v1 has no such line item | OPEN | 2026-11-06 |
| L-007 | IID-2 | `DILUTION_PROXY` 0.98 cap is not observed dilution | OPEN | 2026-11-06 |
| L-008 | IID-2 | SOTP not implemented (`METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1`) | OPEN | 2026-11-06 |
| L-009 | IID-0/IID-2 | No real issuer assessed; M-1 is a synthetic persistence demonstration | OPEN | 2026-11-06 |
| L-010 | IID-3 | Chains are located by a bounded head scan, not a chain lookup | OPEN (mitigated, bounded) | 2026-11-06 |
| L-011 | IID-3 | Two scope namespaces (`co:`/`hd:`/`hc:`/`icr:` chain scope vs payload `subjectScope`) | OPEN | 2026-11-06 |
| L-012 | IID-3 | Store-internal `chainId` is not surfaced; chain root `reportId` is the surrogate | OPEN | 2026-11-06 |
| L-013 | IID-3 | Idempotency is decided against the chain head only | OPEN | 2026-11-06 |
| L-014 | IID-3 | Content/input identity include the assessment timestamp | OPEN | 2026-11-06 |
| L-015 | IID-3 | Two chain heads for one scope are refused, never merged | OPEN | 2026-11-06 |
| L-016 | IID-3 (observed) | NP-04 pin prose and manifest pins disagree; no pin changed by IID-3 | OPEN | 2026-11-06 |

---

## 3. Entries carried forward from IID-0 and IID-2

### L-001 — Only 3 of 13 sectors are measured

- **Originating phase:** IID-0 (frozen sector engines; R-16).
- **Description:** the frozen sector-analytics engines measure **3 of 13** sectors. The remaining **10** are listed
  in `outstandingSectors` and are **not** measured. Requirement **R-16 is NOT complete**. The counts are actual
  counts, not targets.
- **Affected contracts / metrics / sectors / outputs:** sector-analytics coverage disclosure; every
  sector-conditioned output (method matrices, sector verdicts, composite scores); the investment coverage report;
  any downstream "sector" statement.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4 (holding disposition), IID-5 (change intelligence), IID-6 (production
  readiness); every investment surface that renders a sector reference.
- **Consequence for user-visible results:** an assessment can only place its subject in a measured sector's
  context for 3 of 13 sectors. For the other 10 the sector reference is absent, and must be shown as absent — never
  as a neutral or zero score. Any cross-sector comparison is between measured sectors only.
- **Required resolution / evidence:** incremental engine qualification per sector, each with a population
  reference and a golden set; the count in `outstandingSectors` must fall with evidence, not assertion.
- **Owner / responsible phase:** sector engines owner (frozen); IID-0 for the disclosure contract.
- **Evidence:** `evidence/iid/IID-1-*` (coverage disclosure); `frontend/src/api/investmentCoverage.ts`
  (`measuredSectors`/`totalSectors`/`outstandingSectors`); IID-3 responses carry `L-001` on every read.
- **Last status update:** 2026-11-06 (IID-3) — unchanged; IID-3 neither measures sectors nor claims to.

### L-002 — 20 XBRL tags mapped; unmapped tags remain visible gaps

- **Originating phase:** IID-0.
- **Description:** the ingestion mapping covers **20 XBRL tags**. Tags outside that set are not mapped: they are
  reported as visible gaps (`NOT_TAGGED_IN_FILING`-class reasons, unmapped-tag lists), and are never converted to
  zero, to a proxy, or to a silently ignored fact.
- **Affected contracts:** ingestion/builder tag map; `LineItemId` coverage; completeness and adequacy computation;
  every derived metric that depends on an unmapped tag.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4/IID-5 (both consume the same normalized facts); IID-6.
- **Consequence for user-visible results:** a line item that is filed but unmapped appears as a missing value with
  a reason. Adequacy can therefore be `PARTIAL` for a fully compliant filer, and the user sees a gap where a value
  exists in the source document.
- **Required resolution / evidence:** extend the tag map with per-tag golden fixtures against real filings; prove
  each new tag changes a derived figure in a known direction.
- **Owner / responsible phase:** IID-0 ingestion.
- **Evidence:** IID-0 ingestion evidence; coverage report `xbrlMappedTags`/`unmappedTagsObserved`.
- **Last status update:** 2026-11-06 (IID-3) — unchanged.

### L-003 — The derivation set is closed at 8 items

- **Originating phase:** IID-0.
- **Description:** only **8** derived line items are computed (`derive.ts`). Anything else is `NOT_COMPUTABLE` with
  `DERIVATION_NOT_SUPPORTED`. The closure is deliberate: a derivation that is not in the set is not approximated.
- **Affected contracts:** `derive.ts` closed set; `derived` on every normalized period; adequacy/completeness;
  valuation inputs that would otherwise be derived.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-2 (method inputs), IID-4, IID-5, IID-6.
- **Consequence for user-visible results:** some conventional ratios are absent even when their components are
  present, because the ratio is not in the closed set. They are shown as absent with a reason, not as estimates.
- **Required resolution / evidence:** add a derivation only with (a) a formula id/version, (b) golden vectors,
  (c) a statement of what it may not be used for.
- **Owner / responsible phase:** IID-0.
- **Evidence:** `iips-platform/src/investment/fundamentals/derive.ts`; IID-0 evidence set.
- **Last status update:** 2026-11-06 (IID-3) — unchanged.

### L-004 — The reference dataset is synthetic

- **Originating phase:** IID-0.
- **Description:** the reference dataset (`provider: iid3-m1-synthetic-reference`, formerly the IID-2 fixtures) is
  **synthetic**. It exercises the mechanics — ingestion, identity, assessment, composition, persistence, transport —
  and validates **no** company. It contains no real filing, no real price and no real corporate action.
- **Affected contracts:** every artefact produced from it; `datasetClass` in provenance; all demonstrated outputs.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5, IID-6 (any demo built on it inherits this).
- **Consequence for user-visible results:** a synthetic assessment is internally consistent and must still be
  presented as synthetic. Its verdicts (`SUFFICIENT`, `FAIR`, `NARROW`, …) say nothing about any real company, and
  the surfaces label the dataset class beside them.
- **Required resolution / evidence:** an approved operator dataset (real filings, licensed; local ingestion path)
  plus a re-run of the same acceptance tests against it, with the sector coverage of L-001 stated.
- **Owner / responsible phase:** data owner / IID-0 ingestion; IID-6 for production readiness.
- **Evidence:** `frontend/server/investment/demo/m1Data.ts` (`M1_DATASET_PROVIDER`);
  `evidence/iid/IID-3-*/m1-demonstration.json` (`dataClass: SYNTHETIC_REFERENCE`).
- **Last status update:** 2026-11-06 (IID-3) — unchanged, and now enforced: the stored provenance records
  `datasetClass`, and the response envelope and the view both display it.

### L-005 — Bank dividends are withheld

- **Originating phase:** IID-2.
- **Description:** for a bank, the dividend verdict is withheld because `NET_DEBT_TO_EBITDA` is
  `NET_DEBT_TO_EBITDA_UNAVAILABLE` — that ratio is not a meaningful bank metric, and the policy has no
  bank-specific substitute. The engine **withholds** the verdict and records the unmet inputs. No arbitrary
  substitution (e.g. borrowings/equity) is made, and none may be introduced without a governed policy revision.
- **Affected contracts:** `dividends.verdict`, `dividends.withheld.unmetInputs`, dividend confidence caps; the
  method matrix for the Banking sector.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4 (disposition rationale), IID-5, IID-6.
- **Consequence for user-visible results:** a bank assessment shows `INSUFFICIENT_EVIDENCE` for dividends with the
  unmet input named. The reader sees why, and must not read the absence as "no dividend" or "uncovered".
- **Required resolution / evidence:** a bank-specific dividend policy (governed revision) with a metric set that is
  meaningful for banks, plus golden cases for both a covered and an uncovered bank.
- **Owner / responsible phase:** IID-2 policy owner (valuation policy), IID-0 for any new line item.
- **Evidence:** IID-2 goldens (BANK: `INSUFFICIENT_EVIDENCE`, conf 0.5609);
  `iips-platform/src/investment/assessment/dividends.ts`; IID-3 responses carry `L-005`.
- **Last status update:** 2026-11-06 (IID-3) — unchanged; IID-3 persists and displays the withholding rather than
  flattening it.

### L-006 — Restricted cash is `NOT_COMPUTABLE: NOT_REPORTED`

- **Originating phase:** IID-0 (schema) / IID-2 (use).
- **Description:** restricted cash is reported as `NOT_COMPUTABLE` with reason `NOT_REPORTED`. The schema **v1 has
  no restricted-cash line item**, so the fact cannot be ingested even when a filing discloses it. A possible IID-0
  contract amendment is outstanding. Until then, **cash must not be assumed to be unrestricted**, and net-debt
  figures must not present total cash as free cash.
- **Affected contracts:** `LineItemId` set; capital structure (`cashAndInvestments`); net debt; EV; every valuation
  method that consumes cash; adequacy.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5, IID-6.
- **Consequence for user-visible results:** net debt (and therefore EV-based values) is computed with a cash figure
  whose restriction status is unknown, and the assessment says so. A reader must not treat the equity value as if
  all cash were available.
- **Required resolution / evidence:** an IID-0 schema amendment adding the line item with its own missing-reason
  handling, a policy decision on how net debt treats restricted cash, and goldens proving both branches.
- **Owner / responsible phase:** IID-0 (contract), IID-2 (policy).
- **Evidence:** `iips-platform/src/investment/fundamentals/derive.ts` and assessment goldens (`RESTRICTED_CASH`
  missing entry); IID-3 responses carry `L-006`.
- **Last status update:** 2026-11-06 (IID-3) — unchanged.

### L-007 — `DILUTION_PROXY` 0.98 cap is a proxy, not observed dilution

- **Originating phase:** IID-2.
- **Description:** per-share values apply a dilution proxy capped at **0.98** (i.e. at most a 2% haircut). It is a
  bounded assumption, not an observed share-count path. Actual dilution (ESOPs, convertibles, warrants, QIPs) is
  not modelled.
- **Affected contracts:** intrinsic per-share values, margin of safety, sensitivity grids; the dilution assumption
  in provenance.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5, IID-6.
- **Consequence for user-visible results:** per-share values can be optimistic where real dilution is material, and
  the cap means the haircut never exceeds 2% however large the dilution. The proxy and its cap are disclosed.
- **Required resolution / evidence:** ingest the share-count path (weighted average, ESOP schedule, convertible
  terms) and replace the proxy with a computed dilution, with goldens for a dilutive and non-dilutive case.
- **Owner / responsible phase:** IID-2 (valuation policy), IID-0 (inputs).
- **Evidence:** IID-2 assessment policy/`intrinsic.ts`; IID-2 acceptance matrix; IID-3 responses carry `L-007`.
- **Last status update:** 2026-11-06 (IID-3) — unchanged.

### L-008 — SOTP is not implemented

- **Originating phase:** IID-2.
- **Description:** sum-of-the-parts valuation is **not implemented**. The method appears as
  `METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1` and produces no output. Segment-level values are never manufactured, and
  segment revenue/EBIT is not used to imply a valuation.
- **Affected contracts:** method selection list; method matrix for conglomerate sectors; intrinsic range weighting;
  any per-segment output.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5, IID-6.
- **Consequence for user-visible results:** for a conglomerate, the intrinsic range is built from the methods that
  do exist, and SOTP is shown as not implemented. A user must not read the range as segment-aware.
- **Required resolution / evidence:** segment data ingestion, a segment discount policy, and goldens per segment
  count; until then the string `METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1` must be preserved verbatim.
- **Owner / responsible phase:** IID-2 (engine).
- **Evidence:** IID-2 goldens and acceptance matrix; `iips-platform/src/investment/assessment/methods.ts`;
  IID-3 responses carry `L-008`.
- **Last status update:** 2026-11-06 (IID-3) — unchanged.

### L-009 — No real issuer has been assessed

- **Originating phase:** IID-0/IID-2.
- **Description:** **no real issuer has been assessed** through the investment pipeline. Everything demonstrated —
  including IID-3's M-1 — uses synthetic reference data (L-004). M-1 therefore demonstrates *persistence, read
  transport and the thin slice*: one synthetic company, assessed, durably stored, independently read, versioned, and
  re-read. It does **not** demonstrate an actual issuer assessment, and the two must not be conflated.
- **Affected contracts:** every assessment artefact and every surface; M-1 acceptance; any claim of investment
  readiness.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5, IID-6 — IID-6 in particular cannot be declared without it.
- **Consequence for user-visible results:** no real company's assessment has been produced, persisted or displayed.
  A user must be told, on the surface, that inputs are operator-supplied and, in the demonstrated case, synthetic.
- **Required resolution / evidence:** at least one real issuer assessed from an approved local dataset, persisted,
  read back independently and reconciled against the filing by hand; the same acceptance tests re-run unchanged.
- **Owner / responsible phase:** data owner + IID-6; blocked in this environment because no approved real dataset
  exists in the local ingestion path and downloading/scraping exchange data is out of scope.
- **Evidence:** `evidence/iid/IID-3-*/m1-demonstration.json` (`realIssuerAssessment: "NOT PERFORMED — BLOCKED"`);
  every IID-3 response carries `L-009`; the view renders it.
- **Last status update:** 2026-11-06 (IID-3) — unchanged, and made explicit in the M-1 evidence.

---

## 4. Entries opened by IID-3

### L-010 — Chains are located by a bounded head scan, not a chain lookup

- **Originating phase:** IID-3.
- **Description:** the governed persistence boundary exposes five operations and **none of them finds a chain by
  scope or content identity**. `queryByOwner` returns **one row per chain (its current head)**, with cursor paging;
  `listSupersededBy` walks predecessors from a given instance. IRR therefore locates a chain by (a) paging the
  owner's heads, then (b) walking the selected head back to version 1 through `resolveById`. The scan is bounded
  (5,000 heads inspected, 500 versions per chain) and **fails closed** at the bound rather than returning a partial
  view.
- **Affected contracts:** `InvestmentArtifactService.readChain`/`readVersion`/`inventory`; the read transport; the
  operator CLI's chain-head step.
- **Status:** `OPEN` (mitigated: bounded and fail-closed; no silent truncation).
- **Downstream phases affected:** IID-4 (many holding chains per portfolio), IID-5 (change reports over many
  scopes), IID-6 (scale/performance review).
- **Consequence for user-visible results:** read cost grows with the number of chains an owner holds, not with the
  size of one chain. At the bound, reads fail loudly (503) rather than showing an incomplete history. No user-visible
  correctness gap at the demonstrated scale.
- **Required resolution / evidence:** an NP-04-published find-by-chain lookup, or a consumer-side index that is
  itself validated; the bound must be re-justified against the real chain count before IID-6. The current
  behaviour is pinned by `investment-artifacts.test.ts` (scan bounds and refusal).
- **Owner / responsible phase:** NP-04 (surface) / IID-4 (index decision).
- **Last status update:** 2026-11-06 (IID-3) — opened.

### L-011 — Two scope namespaces coexist

- **Originating phase:** IID-3.
- **Description:** a **chain scope token** (`co:`/`hd:`/`hc:`/`icr:` — the persistence chain identity, which is the
  artifact's `portfolioId`) and the IID-2 payload's **`artifact.subjectScope`** (currently `hc:<issuerId>`, a label
  for what the payload is about) are different namespaces that happen to share a prefix vocabulary. A company
  assessment's chain scope is `co:<issuerId>`; its payload says `hc:<issuerId>`.
- **Affected contracts:** `ScopeToken`/`REPORT_TYPE_REGISTRY`; composition; the transport route
  (`/api/investment/company/:issuerId`); any future consumer of `portfolioId`.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4 (`hd:`), IID-5 (`icr:`), IID-6.
- **Consequence for user-visible results:** none today — the two are surfaced separately and the drift check
  compares `provenance.issuerId` to the chain scope subject. The risk is a future consumer treating
  `subjectScope` as a chain identity, which would file artifacts under the wrong chain. The read path refuses a
  member whose scope disagrees, so the failure would be loud.
- **Required resolution / evidence:** either rename the payload field to make its role explicit, or drop it in a
  versioned payload revision; a guard test that a payload `subjectScope` can never be used as a chain scope.
- **Owner / responsible phase:** IID-3 (composition) → IID-4.
- **Last status update:** 2026-11-06 (IID-3) — opened.

### L-012 — Store-internal `chainId` is not surfaced

- **Originating phase:** IID-3.
- **Description:** NP-04 assigns a durable `chainId`, but the canonical artifact shape (`CanonicalReportArtifact`)
  does not carry it and IRR may not invent one. The read model therefore publishes the **chain root `reportId`**
  plus the content-derived `reportKey` as the stable chain identifier, and never `chainId`.
- **Affected contracts:** `InvestmentChainView.chainRootReportId`; the response `scope` block; the CLI summary.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5, IID-6; any audit that wants to reconcile against the store's own
  chain identifier.
- **Consequence for user-visible results:** an auditor sees `reportKey` + root `reportId` rather than the store's
  `chainId`; both are stable and version-invariant, so no user-facing claim depends on the difference.
- **Required resolution / evidence:** publish `chainId` through the canonical artifact shape (an NP-04/consumer
  contract change), with a test that it is invariant across versions.
- **Owner / responsible phase:** NP-04 (shape) / IID-3.
- **Last status update:** 2026-11-06 (IID-3) — opened.

### L-013 — Idempotency is decided against the chain head only

- **Originating phase:** IID-3.
- **Description:** a submission is `UNCHANGED` when its content identity equals the **current head's**. Content
  identical to an *older* version is not recognised as already-stored: it is appended as a new version (the chain
  records "we went back to an earlier content"), because no operation searches the chain by content identity and
  doing so by re-walking the chain would still not prove the store contains no equal artifact elsewhere.
- **Affected contracts:** `RecordOutcome` (`UNCHANGED` vs `APPENDED`); the CLI's `persist` step; version counts.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5 (both will re-run over changing inputs), IID-6.
- **Consequence for user-visible results:** a revert can show up as a new version whose content equals an earlier
  one. Version history stays truthful (it is what happened) but is not deduplicated by content.
- **Required resolution / evidence:** either a documented policy that reverts are versions (and no change), or a
  content-identity lookup at the boundary; either way a test pinning the chosen behaviour.
- **Owner / responsible phase:** IID-3 → IID-4.
- **Last status update:** 2026-11-06 (IID-3) — opened; behaviour pinned by
  `investment-artifacts.test.ts` ("UNCHANGED" case only against the head).

### L-014 — Content and input identity include the assessment timestamp

- **Originating phase:** IID-3.
- **Description:** `payloadDigest` is SHA-256 over the **stored canonical payload bytes**, and that payload contains
  `asOf.generatedAt`. The IID-2 engine's `inputDigest` likewise covers `generatedAt`, which is one of its inputs.
  Consequently a re-run over identical inputs at a **different clock** produces different digests and therefore a
  new content version. Excluding fields from `payloadDigest` was rejected deliberately: the digest must be
  recomputable from the stored bytes alone, which is what makes a post-hoc store edit detectable.
- **Affected contracts:** `payloadDigest`, `inputDigest`, `UNCHANGED`/`INPUT_CHANGED_CONTENT_IDENTICAL` outcomes;
  the CLI's `--generated-at`; version counts.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5 (scheduled refreshes), IID-6 (storage growth).
- **Consequence for user-visible results:** a scheduled refresh that finds identical inputs still appends a version
  whose only difference is its timestamp. The history is not wrong, but it is larger than a content-only digest
  would make it, and `INPUT_CHANGED_CONTENT_IDENTICAL` is correspondingly rare.
- **Required resolution / evidence:** either a versioned "content identity excludes generation metadata" rule with a
  second digest (so byte-level verification survives), or an explicit operator decision that refreshes are
  versions. Must be decided before IID-5's scheduled change reports.
- **Owner / responsible phase:** IID-3 (composition contract) → IID-5.
- **Last status update:** 2026-11-06 (IID-3) — opened; pinned by
  `assessment-composition.test.ts` ("moves when only the clock moves").

### L-015 — Two chain heads for one scope are refused, never merged

- **Originating phase:** IID-3.
- **Description:** the boundary permits two separate instances with **identical canonical content** (instance
  identity is independent of content identity). If a store ever holds **more than one chain head for the same
  scope and report type**, this surface cannot know which is authoritative and **fails closed** with
  `CHAIN_INVALID` rather than merging or picking the newest.
- **Affected contracts:** `findChainArtifacts`; the read transport (503 integrity); the CLI's chain-head step.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5, IID-6 (operational repair procedure is not defined).
- **Consequence for user-visible results:** a duplicate chain makes the issuer unreadable (503) until an operator
  resolves it. That is deliberate — two histories presented as one would be worse — but no repair tool exists.
- **Required resolution / evidence:** an operator repair procedure (identify, adjudicate, quarantine) with a
  documented effect on the surviving chain, plus a test that the repair is legible.
- **Owner / responsible phase:** IID-3 → IID-6 operations.
- **Last status update:** 2026-11-06 (IID-3) — opened; pinned by `investment-artifacts.test.ts`
  ("refuses to choose between two chain heads").

### L-016 — NP-04 pin prose and manifest pins disagree (observed, not changed)

- **Originating phase:** IID-3 (observation; the discrepancy predates this phase).
- **Description:** the persistence boundary's prose cites a **primary** pin of `8eec74ae…`, while
  `frontend/package.json` carries `iips-production-market-data#279d1eed…` plus the R3 second specifier
  `iips-np04-governed-persistence#2e11fa3b…`. IID-3 resolved the boundary through the **existing** adapter and the
  existing specifier and **changed no pin**; it reports the discrepancy instead of silently "fixing" prose or pins.
- **Affected contracts:** NP-04 dependency declarations, `NP04_BOUNDARY` prose, the R3 decision record, any audit
  that reads a pin from one place and verifies it in another.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-4, IID-5, IID-6; CAP-03 tracker.
- **Consequence for user-visible results:** none directly. The risk is traceability: a reader may believe the
  consumer runs the primary pin when it runs the R3 specifier.
- **Required resolution / evidence:** a governed reconciliation note (as CAP-03 DQ-4 did for the primary pin) that
  states which pin each consumer resolves, with the manifest checked in CI.
- **Owner / responsible phase:** NP-04/CAP-03 owner; IID-3 reported it.
- **Last status update:** 2026-11-06 (IID-3) — opened by observation.

---

## 5. What IID-3 changed in this register, and what it did not

**Changed.** Nine new entries (`L-010` … `L-016`, i.e. seven new entries plus the observation) were opened, each
with an affected-contract list, a user-visible consequence, a resolution requirement and a test pointer. `L-004` and
`L-009` were made **enforced rather than advisory**: the stored provenance now records `datasetClass`, the response
envelope carries `limitations`, and the view renders the limitations beside the assessment.

**Not changed.** No entry was closed. No status was improved. No entry's description was softened. `L-001`'s counts
(3 measured, 10 outstanding), `L-002`'s count (20 tags), `L-003`'s count (8 derivations), `L-005`'s reason code
(`NET_DEBT_TO_EBITDA_UNAVAILABLE`), `L-006`'s reason (`NOT_COMPUTABLE: NOT_REPORTED`), `L-007`'s cap (0.98) and
`L-008`'s string (`METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1`) appear verbatim in this document and in the code that
carries them forward.

**IID-3's own new limitation that is not a limitation.** IID-3 also made three things *stronger*, which is recorded
here so the boundary is clear: scope tokens are validated before any store call; every read revalidates the whole
chain and recomputes stored digests from stored bytes; and there is no mutating route at all. Those are acceptance
criteria (`AC-3.1`…`AC-3.8`), not register entries.
