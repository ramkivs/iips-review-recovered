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
| L-014 | IID-3 | Content/input identity include the assessment timestamp | RESOLVED (2026-11-06, IID-5) | 2026-11-06 |
| L-015 | IID-3 | Two chain heads for one scope are refused, never merged | OPEN | 2026-11-06 |
| L-016 | IID-3 (observed) | NP-04 pin prose and manifest pins disagree; no pin changed by IID-3 | OPEN | 2026-11-06 |
| L-017 | IID-4 | Portfolio context is a read-model snapshot, not a risk model | OPEN | 2026-11-06 |
| L-018 | IID-4 | Missing or stale holdings become unmeasured weight, never zero | OPEN | 2026-11-06 |
| L-019 | IID-4 | Limits policy is operator-supplied; the 10 %/30 % defaults are placeholders | OPEN | 2026-11-06 |
| L-020 | IID-4 | Unsupported subjects (non-equity, unlisted, foreign, merged, delisted) yield no verb | OPEN | 2026-11-06 |
| L-021 | IID-4 | INSUFFICIENT evidence yields no conclusion; PARTIAL cannot increase exposure | OPEN | 2026-11-06 |
| L-022 | IID-4 | Sector exposure depends on a sector reference; CSIP scores are absent for user holdings | OPEN | 2026-11-06 |
| L-023 | IID-4 | A rationale citation that does not resolve is refused or synthesised-and-labelled | OPEN | 2026-11-06 |
| L-024 | IID-4 | Cap ordering, cap conflicts and hysteresis can hold a less conservative verb briefly | OPEN | 2026-11-06 |
| L-025 | IID-4 | No disposition history beyond the chain; hysteresis needs a caller-supplied previous | OPEN | 2026-11-06 |
| L-026 | IID-4 | L-010/L-012/L-013/L-014 apply unchanged to `hd:`/`hc:` chains | OPEN | 2026-11-06 |
| L-027 | IID-4 | Count-based diversification band and correlation coefficients are not computed | OPEN | 2026-11-06 |
| L-028 | IID-5 | Change intelligence covers two report types; cross-model attribution is `UNAVAILABLE` | OPEN | 2026-11-06 |
| L-029 | IID-5 | Materiality thresholds are published defaults; change reports have no substantive grammar | OPEN | 2026-11-06 |
| L-030 | WI-2 | Price observation is single-exchange and operator-transcribed; no second feed corroborates it | OPEN | 2026-11-06 |
| L-031 | WI-2 | Corporate-action table is empty, so "unadjusted price" is a dataset claim, not a verified history | OPEN | 2026-11-06 |
| L-032 | WI-2 | The alignment rule forces a contemporary price; the margin cannot be run against a period-matched historical price | OPEN | 2026-11-06 |
| L-033 | WI-2 (observed) | `mos-policy` freshness window: design R-6.4 says five trading days, implementation uses seven calendar days | OPEN | 2026-11-06 |

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
- **Status:** `RESOLVED (2026-11-06, IID-5)` — implementation, acceptance tests and durable evidence are present, so
  register rule 3 is satisfied (see *Evidence* and *Implementation* below).
- **Downstream phases affected:** IID-4, IID-5 (scheduled refreshes), IID-6 (storage growth).
- **Consequence for user-visible results:** a scheduled refresh that finds identical inputs still appends a version
  whose only difference is its timestamp. The history is not wrong, but it is larger than a content-only digest
  would make it, and `INPUT_CHANGED_CONTENT_IDENTICAL` is correspondingly rare.
- **Required resolution / evidence:** either a versioned "content identity excludes generation metadata" rule with a
  second digest (so byte-level verification survives), or an explicit operator decision that refreshes are
  versions. Must be decided before IID-5's scheduled change reports.
- **Decision (resolved 2026-11-06):** the first option, decided in
  `IIPS_V3_IID_L014_SUBSTANTIVE_IDENTITY_DECISION_2026-11-06.md`. Version identity becomes a **`substantiveDigest`**
  over the canonical payload with a closed, enumerated set of clock-derivable members deleted (grammar
  `assessment-substantive-identity/1`, `disposition-substantive-identity/1`); `payloadDigest` keeps its byte-integrity
  job unchanged and is never narrowed; a clock-only re-run yields the new outcome `CLOCK_ONLY_UNCHANGED` and writes
  nothing. A clock advance that crosses the freshness policy window, or admits a newer price observation, is
  **substantive** and still mints a version. The decision is resolved; the implementation is IID-5's (nine obligations
  `O-1`…`O-9` and ten acceptance tests `AC-L14.1`…`AC-L14.10` in §8 of that document). Until IID-5 ships it and its
  tests pass, this entry stays `OPEN` and the behaviour described above stands unchanged.
- **Implementation (2026-11-06, IID-5):** `substantiveIdentity.ts` (both grammars, closed exclusion lists, minimal
  projection, both digests, both input projections, the O-9 member inventory); the record path in
  `investmentArtifacts.ts` now decides versioning on substantive identity and reports `CLOCK_ONLY_UNCHANGED`; every
  read recomputes and verifies both digests; pre-IID-5 versions are derived on read and labelled `DERIVED`, never
  rewritten. `payloadDigest` and the engine `inputDigest` still cover the clock **by decision** — that is the
  residue the decision preserves, not a remaining gap: the limitation's user-visible consequence (a refresh at a new
  clock appends a version that says nothing new) no longer occurs.
- **Evidence:** `IIPS_V3_IID5_HISTORICAL_CHANGE_INTELLIGENCE_2026-11-06.md` §5/§6 (O and AC matrices);
  `evidence/integration/iid5-historical-change-intelligence-2026-11-06/` (test run, digests, demonstration);
  `substantive-identity.test.ts` (reference digests `08ea8d4a…`, `34240407…`, both grammars, inventory);
  `investment-artifacts.test.ts` ("reports INPUT_CHANGED_CONTENT_IDENTICAL…"); `disposition-records.test.ts`
  ("a re-run at a new clock is NOT a new version"); `change/store.test.ts` (CLOCK_ONLY_UNCHANGED, append, integrity,
  DERIVED).
- **Owner / responsible phase:** IID-3 (composition contract) → IID-5.
- **Last status update:** 2026-11-06 (IID-3) — opened; pinned by
  `assessment-composition.test.ts` ("moves when only the clock moves"). 2026-11-06 (L-014 decision closeout) — decision
  recorded, status qualified, **no status improvement**, no implementation change, IID-5 not started.
  2026-11-06 (IID-5) — implementation shipped and tested; status `RESOLVED`.

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

---

## 6. Entries opened by IID-4 (holding disposition)

IID-4 opened eleven entries. They are numbered from **L-017**, and no earlier entry was modified: `L-001` … `L-016`
appear above exactly as IID-3 left them. Each entry names what the disposition capability cannot do, what the user
sees as a result, and what would be required to close it.

### L-017 — Portfolio context is a snapshot of the read model, not a risk model

- **Originating phase:** IID-4.
- **Description:** a disposition's portfolio context is assembled from one `G2PortfolioView` read: the published
  `weightPercentage` per holding, the published weight sum, the revision and the `lastUpdated` timestamp. It carries
  no volatility, no drawdown, no beta, no currency exposure and no factor model, because the read model publishes
  none of those and IID-4 does not derive them. "Concentration" is therefore a weight, not a risk statement.
- **Affected contracts / outputs:** `PortfolioContextBlock`, `PortfolioFacts`, the G-5 gate, `limits.applied` and
  `portfolioImplication.projected*`, and every verb that depends on a cap.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-5 (change reports inherit the same context), IID-6 (the surface must render
  the absence rather than imply a risk metric).
- **Consequence for user-visible results:** the disposition can say "this position is 9 % of measured portfolio
  value and its issuer is 12 %" but not "this position is 40 % of portfolio risk". A reader must not read the weight
  as a risk contribution.
- **Required resolution / evidence:** a portfolio risk model with its own contract, evidence and limitations —
  out of scope for this phase, and not approximated here.
- **Owner / responsible phase:** IID-6 (portfolio analytics), not IID-4.
- **Evidence:** `frontend/server/investment/portfolioContext.ts`; `portfolio-context.test.ts` ("nothing is
  fabricated"); register §6 of this document.

### L-018 — Missing or stale holdings become unmeasured weight, never zero

- **Originating phase:** IID-4.
- **Description:** a holding with `identityStatus: 'UNRESOLVED'`, or one that the read model reports without a
  finite weight, is excluded from the measured base and its weight appears in `unmeasuredWeightPct` as
  `present(100 − publishedWeightSum)`. Every percentage in the context block is a percentage of **measured** value, and
  the block says so in `notes`. Staleness is limited to the `asOf`/`revision` the read model publishes: IID-4 does
  not detect a stale portfolio beyond that, and does not re-read.
- **Affected contracts / outputs:** `unmeasuredWeightPct`, `measuredWeightPct`, `holdingsUnresolved`, G-5,
  every cap check, and `portfolioImplication.currentWeightPct`.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-5, IID-6.
- **Consequence for user-visible results:** with unresolved holdings the exposures are understated relative to the
  whole portfolio; the number is honest about its base but is not a whole-portfolio figure. A zero weight is never
  manufactured for a holding that exists but cannot be measured.
- **Required resolution / evidence:** identity resolution for every imported holding (IPD/broker-import lineage),
  plus a staleness rule with an operator-visible warning.
- **Owner / responsible phase:** IPD (identity and import) with IRR consuming.
- **Evidence:** `portfolioContext.ts`; `portfolio-context.test.ts` ("reports the shortfall…", "reports a MISSING
  weight — not a zero"); `disposition-portfolio.test.ts` ("unmeasured weight is carried as an observation…").

### L-019 — The limits policy is operator-supplied; the defaults are placeholders

- **Originating phase:** IID-4.
- **Description:** the caps are 10 % single-name and 30 % sector in `SYSTEM_DEFAULT_LIMITS`, and every artifact
  records `limits.basis = SYSTEM_DEFAULT` with a version string ending `+system-default`. They are a **safe
  placeholder**, not an inference about any operator's risk appetite. An operator policy is read from
  `${IIPS_DATA_DIR}/investment/policies/limits-policy.json` (R-11); an unreadable or invalid policy **fails closed**
  (`policy_inputs_unavailable`) rather than silently becoming the defaults, and a policy whose `effectiveFrom` is in
  the future does not apply and says so in `limits.notes`.
- **Affected contracts / outputs:** `ResolvedLimits`, `limits.basis`, `limits.digest`, `limits.applied`, the
  CAPACITY gates, and the ACCUMULATE→RETAIN / INITIATE→WATCH caps.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-5 (a policy change is an input change), IID-6.
- **Consequence for user-visible results:** out of the box, a disposition is capped at the placeholder limits. A
  user who never writes a policy gets a disposition measured against numbers nobody chose for them — which is why
  the basis is on every artifact and every response.
- **Required resolution / evidence:** an operator-authored policy with an approval trail, plus a test that a version
  change is visible in `limits.policyVersion`/`digest` (present: "a new policy version changes the caps…").
- **Owner / responsible phase:** operator (policy author), IRR (validation and disclosure).
- **Evidence:** `iips-platform/src/investment/disposition/limits.ts`; `disposition-limits.test.ts`; register §6.

### L-020 — Unsupported subjects yield no verb, with a named reason

- **Originating phase:** IID-4.
- **Description:** a subject whose `securityClass` is not `EQUITY`, whose identity is `UNRESOLVED`/`AMBIGUOUS`, or
  whose `securityState` is `MERGED`, `DELISTED`, `SUSPENDED` or `UNKNOWN` produces a **withheld** disposition with
  `identity_unresolved`, `security_class_excluded`, `security_merged`, `security_delisted`,
  `security_suspended` or `security_state_unknown`. ETFs, REITs, preference shares, unlisted and foreign securities
  are all excluded by the same closed set: they are not dispositioned at all.
- **Affected contracts / outputs:** G-1 and G-2, `disposition.withheld.reasons`, `disposition.verb = null`.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-6 (the surface must show "not dispositioned, because…" rather than a blank).
- **Consequence for user-visible results:** a portfolio containing non-equity instruments shows those holdings
  without any investment assessment. They still consume weight in the exposures, so caps can be breached by
  instruments this phase cannot assess.
- **Required resolution / evidence:** per-security-class assessment methods with their own contracts; until then the
  exclusion is the correct behaviour.
- **Owner / responsible phase:** IID-6 (instrument coverage).
- **Evidence:** `disposition-matrix.test.ts` (identity/class/state rows); `disposition-portfolio.test.ts` (gate
  ordering).

### L-021 — INSUFFICIENT evidence yields no conclusion; PARTIAL cannot increase exposure

- **Originating phase:** IID-4.
- **Description:** at `adequacy = INSUFFICIENT` the disposition carries `verb = null`, `confidence = null`, no
  definition and no band, with `insufficient_data`. At `PARTIAL`, ACCUMULATE and INITIATE are unavailable
  unconditionally (R-9 / AC-4.2); PARTIAL can support RETAIN, REDUCE, AVOID and WATCH only through an independently
  evidenced trigger (a limits breach for REDUCE; a discrete disqualifier for AVOID/AVOID_CANDIDATE).
- **Affected contracts / outputs:** G-3, the verb selector, `disposition.confidence`, the band.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-5, IID-6.
- **Consequence for user-visible results:** for a company with thin filings the capability says "no conclusion",
  which is the correct output and a disappointing one. A user cannot use this phase to justify buying more of a
  company whose evidence is incomplete.
- **Required resolution / evidence:** better evidence (coverage work), not a weaker rule.
- **Owner / responsible phase:** IID-0/IID-2 coverage; IID-4 enforces.
- **Evidence:** `disposition-matrix.test.ts` (PARTIAL and INSUFFICIENT rows, and the AC-4.2 suite);
  `disposition-behaviour.test.ts` ("an INSUFFICIENT assessment yields no confidence and no definition").

### L-022 — Sector exposure depends on a sector reference, and CSIP scores are absent for user holdings

- **Originating phase:** IID-4.
- **Description:** sector exposure can only be summed over holdings whose sector is known. The context block
  publishes `sectorMeasuredWeightPct` and a note stating which share of measured weight the exposure covers. The
  subject's own sector is taken from its assessment payload, never inferred. CSIP's sector-reference context needs
  normalized holdings scored by the frozen sector engines; a user portfolio does not carry those scores, so
  `sectorReferenceContext.normalizedHolding` is `null` and the block is labelled `SECTOR_REFERENCE` with a note that
  it governs nothing.
- **Affected contracts / outputs:** `sectorExposurePct`, `sectorMeasuredWeightPct`, `sectorReferenceContext`,
  CAPACITY_SECTOR, `countBasedSectorExposure`.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-5 (sector-conditioned change attribution), IID-6 (sector panel).
- **Consequence for user-visible results:** the sector cap is enforced over the part of the portfolio whose sectors
  are known; when coverage is partial the cap is stricter or looser than it looks, and the note says which. No
  sector score is displayed for a holding.
- **Required resolution / evidence:** a security→sector reference with published coverage (L-001 interlock), plus
  normalized scoring for user-portfolio holdings.
- **Owner / responsible phase:** IID-0 (sector coverage) → IID-6.
- **Evidence:** `portfolioContext.ts`; `portfolio-context.test.ts` ("says how much of the measured weight carries a
  sector reference"); `disposition-portfolio.test.ts` ("the sector reference is labelled…").

### L-023 — A rationale citation is either resolved or refused

- **Originating phase:** IID-4.
- **Description:** every rationale entry must cite at least one evidence id and one observation reference, and every
  cited id must resolve inside the payload's evidence list. Where the assessment carries no matching evidence entry
  the engine synthesises a disposition-level entry labelled `disposition/rationale-citation`; if any citation still
  fails to resolve after that, the payload is **refused** (`RATIONALE_CITATION_UNRESOLVED`). No observation value is
  ever fabricated to support a claim.
- **Affected contracts / outputs:** `rationale[]`, `evidence[]`, `falsifiers[]`, the engine's error vocabulary.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-6 (rendering evidence links).
- **Consequence for user-visible results:** a synthesised citation is weaker evidence than a field-level one — it
  points at the rationale's own claim rather than at an observed value — and the label says so. The alternative
  (dropping the claim) would hide the reasoning entirely.
- **Required resolution / evidence:** richer assessment evidence so synthesised citations become unnecessary.
- **Owner / responsible phase:** IID-2 evidence contract → IID-4.
- **Evidence:** `rationale.ts`; `disposition-rationale.test.ts` ("every cited evidence id resolves…"); engine's
  citation-closure block.

### L-024 — Cap ordering, cap conflicts and hysteresis can hold a less conservative verb briefly

- **Originating phase:** IID-4.
- **Description:** three behaviours are deliberate and each has a cost. (a) Caps are applied **downward only**
  (ACCUMULATE→RETAIN, INITIATE→WATCH) and are named in `disposition.capsApplied` and the rationale; a cap never
  raises a verb. (b) When two caps bind, the **more conservative** outcome wins by construction, because the
  selector applies the first failing ceiling and records it. (c) Hysteresis (5 pp MoS, 2 pp weight-vs-cap) suppresses
  a verb change until the move clears the margin, waived by a hard trigger or a caps-driven change — so for up to
  one margin the published verb is the PREVIOUS one even though the evidence has already crossed the threshold.
- **Affected contracts / outputs:** `capsApplied`, `gates`, `previous`, the `decisionPath`, `review.triggers`.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-5 (a suppressed change is not a change report), IID-6 (the surface must show
  "held by hysteresis" rather than nothing).
- **Consequence for user-visible results:** a position can sit one point past a threshold and still be shown as
  RETAIN. The `decisionPath` and the hysteresis detail expose why, but a reader who does not open them sees a
  slightly stale verb.
- **Required resolution / evidence:** an operator-visible hysteresis disclosure on the surface, and a recorded
  decision on whether caps-driven changes should bypass hysteresis entirely (they already do).
- **Owner / responsible phase:** IID-4 (engine), IID-6 (surface).
- **Evidence:** `verbs.ts` (`applyHysteresis`); `disposition-behaviour.test.ts` ("a move of less than the MoS margin
  does not flip RETAIN to ACCUMULATE", "a hard trigger overrides hysteresis immediately").

### L-025 — No disposition history beyond the chain; hysteresis needs a caller-supplied previous

- **Originating phase:** IID-4.
- **Description:** IID-4 stores versions but does not query them as a time series: there is no "dispositions over the
  last quarter", no back-test of the verb against outcomes, and no automatic retrieval of the previous verb. The
  engine accepts a `previous` disposition from the caller (the composition layer reads the chain head and passes it),
  which is exactly what makes hysteresis possible — and means a caller that omits it gets an undamped classification.
- **Affected contracts / outputs:** `DispositionEngineInput.previous`, `applyHysteresis`, `review.nextReviewOn`.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-5 (change intelligence is the phase that reads history), IID-6.
- **Consequence for user-visible results:** two callers with different `previous` inputs can obtain different verbs
  from identical evidence. The rule is documented and the chain head is the default source, but it is an input, not a
  derivation.
- **Required resolution / evidence:** a history read path (IID-5) that supplies `previous` from the chain rather than
  from the caller.
- **Owner / responsible phase:** IID-5.
- **Evidence:** `engine.ts` (`previous` input); `disposition-behaviour.test.ts` (hysteresis suite).

### L-026 — L-010, L-012, L-013 and L-014 apply unchanged to `hd:` and `hc:` chains

- **Originating phase:** IID-4 (inherited; the entries themselves remain IID-3's, untouched).
- **Description:** a disposition chain uses the same NP-04 mechanism, so it inherits the same four constraints:
  chains are found by a **bounded head scan** (L-010); the store's `chainId` is **not surfaced** and the root
  `reportId` is the surrogate (L-012); idempotency is decided against the **head only** (L-013); and content identity
  covers the generation timestamp, so **a clock-only re-run is a new version** (L-014). IID-4 adds one refinement and
  one disclosure: the disposition **input digest** excludes the clock, so a clock-only re-run is distinguishable
  (`APPENDED` with an unchanged `inputDigest`), and both digests plus the limits digest travel in provenance.
- **Affected contracts / outputs:** `hd:`/`hc:` chain identity, `RecordResult.outcome`, `payloadDigest`,
  `inputDigest`, provenance.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-5 (scheduled refreshes), IID-6 (storage growth).
- **Consequence for user-visible results:** a scheduled refresh that finds identical evidence still appends a
  disposition version whose only difference is its timestamp, and a very long chain costs more to locate because of
  the bounded scan. Neither is wrong; both are costs.
- **Required resolution / evidence:** L-014's explicit resolution decision (below) must precede IID-5's
  scheduled-refresh and historical-comparison work. Until then IID-4 is limited exactly as IID-3 was, which was the
  condition on which IID-4 was allowed to proceed.
- **Owner / responsible phase:** IID-3 (contract) → IID-5 (decision).
- **Evidence:** `disposition-records.test.ts` ("L-014 — the clock inside content identity is preserved, not
  hidden"); `dispositionComposition.ts` (`dispositionInputDigest` excludes the clock); `LIMITATION-IMPACT.md` in the
  IID-4 evidence folder.

### L-027 — Count-based diversification and correlation are not computed

- **Originating phase:** IID-4.
- **Description:** the context block publishes count-based sector exposure and count-based concentration because
  those are counts over holdings the read model already lists. It does **not** publish a diversification band or
  correlation coefficients: the frozen CSIP analyzers score normalized holdings by conviction/quality/risk, and a
  user portfolio carries no such scores. `diversificationBand` is `null`, `correlationFlags` is empty, and
  `concentrationBand` is `NOT_COMPUTABLE` with a note. No score is invented and no coefficient is defaulted to zero.
- **Affected contracts / outputs:** `countBasedSectorExposure`, `countBasedConcentrationPct`, `diversificationBand`,
  `correlationFlags`, `concentrationBand`.
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-6 (portfolio surface), and any future use of correlation as a disposition
  trigger (it is not one today: a correlation flag may only argue against increasing exposure).
- **Consequence for user-visible results:** the surface cannot say "this portfolio is well diversified" or "these two
  holdings move together". It can say how many holdings sit in each sector.
- **Required resolution / evidence:** normalized scoring for user-portfolio holdings, reusing the frozen CSIP
  analyzers unchanged, with the score provenance published.
- **Owner / responsible phase:** IPD + IID-6; frozen CSIP owners for the analyzers.
- **Evidence:** `portfolioContext.ts`; `portfolio-context.test.ts` ("carries no conviction, quality or risk score it
  was not given", "labels count-based exposure as counts").

---

## 7. What IID-4 changed in this register, and what it did not

**Changed.** Eleven entries (`L-017` … `L-027`) were opened, each with the affected contracts, the user-visible
consequence, the resolution requirement and a test pointer. Two earlier entries were made **enforced in a new
place**: `L-004`/`L-009` (synthetic data, no real issuer) now travel on every disposition response and in every
stored disposition's `datasetClass`; and `L-014`'s consequence is pinned by a test rather than by prose.

**Not changed.** No entry was closed, no status was improved, no numbering moved, no description was softened. In
particular `L-014` is **still `OPEN`** and IID-4 did not resolve it: it recorded the impact on disposition identity
and idempotency, and pinned it with a test, which is all a phase that is not the owner of the decision may do. The
explicit resolution decision remains a prerequisite for IID-5's scheduled refresh and historical comparison.

**L-014 impact on IID-4, stated plainly.** A disposition payload contains `artifact.generatedAt`, so a re-run at a
new clock produces a new `payloadDigest` and therefore a new chain version. The disposition input digest deliberately
excludes the clock, so the pair (`APPENDED`, unchanged `inputDigest`) says "only the generation metadata moved" —
which is a disclosure, not a resolution. Nothing in IID-4 depends on a clock-stable content identity, so the phase
could proceed under `L-014` unchanged.

---

## 8. `L-014` decision closeout (2026-11-06; documentation only)

**What was decided.** `L-014`'s two admissible resolutions (§4: "a versioned *content identity excludes generation
metadata* rule with a second digest, so byte-level verification survives", or "an explicit operator decision that
refreshes are versions") are resolved in favour of the **first**, in
`IIPS_V3_IID_L014_SUBSTANTIVE_IDENTITY_DECISION_2026-11-06.md`:

- version identity becomes a **`substantiveDigest`** over the canonical payload with a **closed, enumerated** set of
  clock-derivable members deleted — `artifact.generatedAt`, `asOf.generatedAt`, `asOf.stalenessDays`,
  `subject.identity.bindingRef` for assessments; `artifact.generatedAt` and `companyAssessmentRef.generatedAt` for
  dispositions;
- `payloadDigest` is **not** narrowed, renamed or redefined: it remains SHA-256 over the stored canonical bytes and
  keeps its tamper-detection job, so the integrity guarantee IID-3 and IID-4 relied on is preserved exactly;
- a re-run whose only movement is generation metadata returns the new outcome **`CLOCK_ONLY_UNCHANGED`** and writes
  nothing;
- a clock advance that crosses the freshness policy window, or admits a newer price observation, remains
  **substantive** and still appends a version — these are changes in what was knowable, not metadata.

**What changed in this register.** One at-a-glance row (`L-014`) and one entry field set (§4 `L-014`: status
qualification, decision pointer, last-status-update line). This section is appended; no earlier section was edited.

**What did not change.** No entry was closed, no status improved (`L-014` remains `OPEN`, now qualified as *decision
resolved / implementation pending*), no numbering moved, no description softened. `L-001`–`L-013` and `L-015`–`L-027`
are byte-identical to their previous text. No implementation, test, API, architecture or IPD change accompanies this
closeout; no stored artifact was rewritten; no historical report was regenerated.

**Not started.** **IID-5 (change intelligence / ★M-2) — NOT STARTED. IID-6 (product surface / ★M-3) — NOT STARTED.**
The decision is a prerequisite for IID-5, not a beginning of it: the nine obligations (`O-1`…`O-9`) and ten acceptance
tests (`AC-L14.1`…`AC-L14.10`) that would discharge `L-014` exist only as requirements, and none of them is
implemented. Until they are implemented and passing, the behaviour recorded in §1 and in §7 of this register remains
the behaviour of the system.

---

## 9. What IID-5 changed in this register (2026-11-06)

**Closed.** `L-014` — `RESOLVED`. The decision's nine obligations (`O-1`…`O-9`) and ten acceptance tests
(`AC-L14.1`…`AC-L14.10`) are implemented and passing; the implementation record is
`IIPS_V3_IID5_HISTORICAL_CHANGE_INTELLIGENCE_2026-11-06.md`, and the evidence bundle is
`evidence/integration/iid5-historical-change-intelligence-2026-11-06/`. Nothing about `L-014`'s *design* changed in
this phase: `payloadDigest` is still SHA-256 over the stored canonical bytes and the engine `inputDigest` is still the
engine's own digest. What changed is that version identity is now decided on the clock-free substantive projection, so
the limitation's consequence is gone.

**Re-audited (post-publication pass, 2026-11-06).** `L-014` stays `RESOLVED`, and the closure statement above was
re-checked against the decision rather than trusted. Three findings, all fixed: the disposition's citation of the
assessment's substantive identity was optional where `O-5` makes it mandatory; `review.nextReviewOn` was excluded
unconditionally instead of "when non-null" as §3.4 specifies; and the decision's own AC-L14.4 pair
(`2026-04-10`→`2026-11-06`) classified `SUBSTANTIVE` because `confidence.combined` was missing from the
freshness-consequence set. Details and the digest movements are in the implementation record §13; nothing in this
register's *design* content changed. One documentation gap in the decision itself is recorded there (§13.4): its §5.2
disposition vector (`126bd28f…`) cannot be reproduced because the fixture it hashed is not published, while all five of
its §5.1 assessment vectors reproduce byte-for-byte. That gap does not reopen `L-014` — the grammar is proven on the
vectors that can be checked — but a reader comparing the two documents should know why that one number does not match.

**Opened.** Two entries, `L-028` and `L-029`, recording what change intelligence genuinely cannot do.

**Not changed.** `L-001`–`L-013` and `L-015`–`L-027` are carried forward with their text, numbers and statuses
intact. No entry was renumbered, merged or softened; `L-014`'s original description is byte-identical and the
decision-closeout section (§8) is untouched.

### L-028 — Change intelligence covers two report types; cross-model attribution is `UNAVAILABLE`

- **Originating phase:** IID-5.
- **Description:** historical comparison is implemented for `investment.company-assessment` and
  `investment.holding-disposition`, the only two artifact types whose substantive grammars the L-014 decision
  defines. A pair whose model or policy identity differs cannot be attributed: computing the 2×2 split needs the
  OLD model run against the NEW data, and this repository holds exactly one build of the frozen engine
  (`assessment-engine/1.0.0`). The comparison still reports every observed delta; only the *split* degrades, to
  `UNAVAILABLE` / `UNATTRIBUTED` with a stated reason. No leg is estimated.
- **Affected contracts:** `attribution.status`, `attribution.cause`, `attribution.legs.model`;
  `reproduction.modelBuildDigest` / `platformCommit` (recorded as `null`).
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-6 (a surface must render `UNAVAILABLE` as unavailable), and any future
  model-version migration, which will produce version pairs nobody can attribute after the fact.
- **Consequence for user-visible results:** a model or policy upgrade shows as a change whose cause is honestly
  unknown. The report says "the model differed and cannot be re-executed here" rather than attributing the movement
  to data.
- **Required resolution / evidence:** durable, executable model builds (or recorded per-version model outputs at both
  inputs) so legs A and B can be evaluated. Evidence today: `change/attribute.ts`;
  `change/comparison.test.ts` ("degrades to UNAVAILABLE when the model or policy identity differs, and estimates no
  leg").
- **Responsible phase:** IID-5 (recording), IID-6 (presentation), platform (engine build retention).

### L-029 — Materiality thresholds are published defaults; change reports have no substantive grammar

- **Originating phase:** IID-5.
- **Description:** two deliberate residues. (a) `materiality-policy/1.0.0`'s thresholds (for example ±5/±10/±25 %
  relative, ±100/±200/±400 basis points, ±2/±5/±10 points of confidence) are design-published defaults, not
  calibrated against realised outcomes; they are versioned and recorded in every report so a reader can disagree with
  the policy rather than with a hidden constant, but the policy itself makes no claim to optimality. (b) The L-014
  decision defines substantive grammars for assessments and dispositions only, so a change report's identity is its
  bytes. Two boundary reports with the same input are byte-identical and idempotent; a change report cannot claim a
  clock-free identity, and none is invented for it.
- **Affected contracts:** `materiality-policy/1.0.0`; `change-comparator/1.0.0`; change-report `payloadDigest`
  (byte identity); `investment.change-report` provenance (`substantive*` members absent).
- **Status:** `OPEN`.
- **Downstream phases affected:** IID-6 (a surface may want user-adjustable materiality), and any future calibration
  work.
- **Consequence for user-visible results:** a movement can be labelled `NOTABLE` where an operator would have called it
  `IMMATERIAL`, and the reverse. The label is always accompanied by the policy version and the observed delta, so the
  disagreement is auditable.
- **Required resolution / evidence:** an outcome-calibrated materiality policy with its own decision record, and — if
  change reports ever need clock-free identity — an extension of the L-014 grammar set. Evidence today:
  `change/materiality.ts`; `change/comparison.test.ts` ("is a versioned policy with declared thresholds per mode",
  "produces byte-identical content for the same pair").
- **Responsible phase:** IID-5 (recording), IID-6 / future calibration.

**Status of IID-6.** **IID-6 (product surface / ★M-3) — IMPLEMENTED, 2026-11-06** (see §10). No limitation listed
above changed status because of it: the surface renders read models that already existed, adds no engine and makes no
new claim about a company. Three specific consequences for this register are recorded there — the coverage
`assertReport` correction, the pre-existing unused broker-preview `POST`, and the fact that a product surface does not
convert a synthetic dataset into a real-issuer claim.

---

## 10. What IID-6 changed in this register (2026-11-06)

**Append-only.** `L-001` … `L-029` keep their identifiers, meanings and statuses. Nothing was renumbered, retired or
silently upgraded, and no new limitation identifier is opened by this phase: a read-only surface cannot create a
limitation about the *engine*, and it does not cure one either.

### 10.1 What the product surface does to existing limitations

| Limitation | Effect of IID-6 |
|---|---|
| `L-001` / R-16 (3 of 13 sectors measured) | Unchanged, and now **visible where the reader needs it**: the coverage page prints `measuredSectors` of `totalSectors` and the outstanding sectors. The surface makes the gap easier to see; it does not reduce it. |
| `L-004` (synthetic reference dataset) | Unchanged. Every company page prints the dataset class and the payload's dataset notice; no surface labels a synthetic result as real. |
| `L-009` (no real issuer assessed) | Unchanged, and repeated on the company page's limitations block rather than left to the register. |
| `L-005` – `L-008`, `L-010` – `L-013` | Unchanged; the company page lists the identifiers the stored envelope actually carries, with the payload's own prose underneath. |
| `L-014` (clock is content, not substance) | Unchanged. The change timeline shows `CLOCK_ONLY_UNCHANGED` pairs as the classification the server sends and never re-derives a pair client-side. |
| `L-021` – `L-027` | Unchanged. The disposition panel prints the withheld state, the gates, the caps and the limits exactly as recorded; it never turns `PARTIAL` adequacy into a verb. |
| `L-028` / `L-029` | Unchanged. The timeline prints `UNAVAILABLE` attribution with its cause and prints the materiality policy version beside every materiality label; it never estimates the split or re-scores a movement. |

### 10.2 A defect fixed, not a limitation opened — `assertReport`

`frontend/src/api/investmentCoverage.ts` ended `assertReport` with a recursive call to itself, and the main read path
never called it, so the coverage view could not render a valid report (preview path) and silently accepted any body
(main path). It was found by the first test that ever fed that page a valid report. It is fixed, and the fix is pinned
by `frontend/src/features/investment/iid6Coverage.test.tsx`. **No limitation entry is added**: a defect that is fixed
and tested is not a limitation, and listing it as one would misrepresent the register's purpose. The full account is
`evidence/iid/IID-6-PRODUCT-SURFACE-2026-11-06/corrections.md` §C-1.

### 10.3 An exception stated precisely — the pre-existing broker-preview `POST`

`evaluateBrokerPreview()` in `investmentCoverage.ts` issues `POST /api/investment/coverage/preview`. It predates this
phase, stores nothing, and is imported by no surface. IID-6 does not use it, does not remove it, and does not route it
through the GET helper (which would misdescribe a POST). The surfaces this phase delivers issue **GET only**, asserted
in seven test files. Recorded so that "no investment `POST`" is a precisely scoped claim rather than an averaged one.

### 10.4 What the surface cannot show, and does not pretend to

- **No cross-issuer boundary total.** Boundary coverage exists per assessment chain; the coverage page says so and
  links to each known issuer instead of printing a number it cannot compute.
- **No scheduled review.** Review dates and armed triggers are read from the stored disposition; nothing schedules
  them. Reconciliation of a missing boundary explanation is an operator CLI action (`ChangeService.reconcile`), named
  in the UI and exposed by no control.
- **No portfolio action.** The portfolio page gains a disposition column and links; it gains no trade, no rebalance,
  no target-weight edit, and no persistence. IPD and `UserPortfolioView` are untouched.
- **No candidate position.** A candidate renders no quantity, no weight and no projected weight, because it has
  none — `NOT_APPLICABLE` is printed with its reason.

### 10.5 Verification for this section

`vitest run src` → 57 files, 546 passed, 1 skipped; `vitest run server/investment` → 14 files, 199 passed;
`npm run typecheck` clean. Captured in `evidence/iid/IID-6-PRODUCT-SURFACE-2026-11-06/test-run.txt`.

---

## 11. IID formal closure — what it does to this register (2026-11-06; documentation only)

**Nothing in `L-001` …. `L-029` changed.** This section is a pointer, not an amendment: no identifier, wording, status
or ordering was touched by the closure work item, and no limitation was closed because the programme's implementation
phases finished.

| Item | Effect |
|---|---|
| `L-001` … `L-013`, `L-015` … `L-027` | untouched; `OPEN` exactly as recorded |
| `L-014` | untouched; `RESOLVED` as recorded by §9 (IID-5 implementation), not by the closure |
| `L-028`, `L-029` | untouched; IID-6 renders them honestly (attribution `UNAVAILABLE` with its cause; materiality policy version printed beside every materiality label) and weakens neither |
| R-16 sector coverage | unchanged: 3 of 13 sectors (`L-001`); no expansion began |
| Production / admission / release | no claim; see closure §1 and §12 |

**Two evidence qualifications the closure records, neither of which is a limitation entry.** They belong to the
*verification* record, not to the product's limitations, and adding them here as limitations would misrepresent the
register's purpose — so they are recorded in the closure document and its bundle instead:

- **AC-X2 (zero-socket measurement) is `OPEN`.** No test asserts zero sockets over an assess → persist → read cycle.
  See `docs/integration/IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md` §6 and
  `evidence/iid/IID-CLOSURE-2026-11-06/AC-X2-ZERO-SOCKET-EVIDENCE.md`.
- **AC-X1 is a qualified PASS** (`frontend` direct; `iips-platform` by explicitly referenced prior evidence, with no
  single `npm test` run at an IID head). See closure §5, qualifications Q-1 … Q-4.

The authoritative closure record is `docs/integration/IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md`; the phase evidence
index is `evidence/iid/README.md`.

---

## 12. IID remaining acceptance evidence — pointer (2026-11-06; documentation and evidence only)

**Nothing in `L-001` … `L-029` changed.** This section is a pointer, not an amendment: no identifier, wording, status or
ordering was touched. It supersedes **two verification statements in §11** — the AC-X2 bullet ("is `OPEN`") and the
AC-X6 qualification it summarises — and nothing else.

| Item | Effect |
|---|---|
| `L-001` … `L-013`, `L-015` … `L-027` | untouched; `OPEN` exactly as recorded |
| `L-014` | untouched; `RESOLVED` as recorded by §9 (IID-5 implementation) |
| `L-028`, `L-029` | untouched; IID-6 renders them honestly |
| R-16 sector coverage | unchanged: 3 of 13 sectors (`L-001`); no expansion began |
| Production / admission / release | no claim |

**The two verification points raised in §11, now resolved:**

- **AC-X2 — `OPEN` in §11, now `PASS` on runtime evidence.** A complete assess → persist → read cycle, run under
  instrumentation in both the test suite and two plain Node processes, opened **no connection to a non-loopback
  destination** and created **no new socket descriptor**, while doing the cycle's real work. A negative control proves
  the instrument registers what it claims. The limitation entries do not move: this closes a verification gate, not a
  limitation, and `L-004` (synthetic dataset) and `L-009` (no real issuer) are untouched by it. See
  `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/AC-X2-RUNTIME-EVIDENCE.md` and closure §6.4.
- **AC-X6 — qualified in §11, now `PASS` with gap G-8 closed as not a breach.** The 100 KB bound governs committed
  *fixtures* (design §I.2 rule 3(b)), and `golden-tech.json` is committed *test evidence* (rule 3(c)); every committed
  fixture is ≤ 42,478 B and the IID fixture corpus is 37,433 B. See
  `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/AC-X6-G8-DETERMINATION.md` and closure §7a.
- **AC-X1 remains a qualified PASS** (Q-1…Q-4, `iips-platform` by referenced prior evidence with no single `npm test` run
  at an IID head). AC-2.6, AC-2.9 and AC-4.7 remain qualified. Nothing above promotes them.

The authoritative closure record is `docs/integration/IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md`; the phase evidence index
is `evidence/iid/README.md`; the roadmap overlay for this work item is §B.Q.

---

## 13. Work Item 1 — real-issuer validation (2026-11-06; evidence only)

**Nothing in `L-001` … `L-029` changed status, identifier, ordering or meaning.** One real Indian listed issuer
(Infosys Limited) was taken from its own audited consolidated Ind AS filings through ingestion, identity, assessment,
composition, persistence and a separate-process read. That is a statement about the *path*; it is not real-dataset
coverage, not a sector measurement and not a production claim, and it closes nothing.

| Item | Effect |
|---|---|
| `L-001` … `L-013`, `L-015` … `L-029` | untouched; unchanged status exactly as recorded |
| `L-004` | **status `OPEN`, wording unchanged in the register.** The artifact CLI now restates this sentence for runs whose snapshot reports `datasetClass = APPROVED_LOCAL_INGESTION`, because on such a run the sentence would be false about the data in hand. The product still ships a synthetic reference dataset, so the limitation itself is untouched — see the justification below |
| `L-009` | **status `OPEN`, wording unchanged in the register**, restated for `APPROVED_LOCAL_INGESTION` on the same grounds. One issuer reached through one operator-supplied path is not general real-issuer coverage, and the product still ships no real dataset |
| `L-014` | untouched; `RESOLVED` as recorded by §9 |
| `L-028`, `L-029` | untouched |
| R-16 sector coverage | unchanged: 3 of 13 sectors; `Technology` was chosen *because* it was already measured, so no expansion began |
| Production / admission / release | no claim |

**Why a restatement is not a modification.** The published summary carried two fixed sentences that asserted the
dataset is synthetic and that no real issuer had been assessed. Both were true of every run before this work item and
false of this one. `L-004`/`L-009` keep their identifiers, subject and direction; only the sentence describing the
data class in hand varies, and the synthetic wording is asserted unchanged by
`frontend/server/investment/cli/realIssuerValidation.test.ts`. The pre-fix output is preserved as evidence so the
defect remains inspectable. Re-running the same command after the change produced `persist UNCHANGED` with identical
payload and input digests: no artifact byte moved.

**Two product defects recorded, deliberately not fixed here** (both need a contract or definition decision that this
evidence-only item does not carry):

- **D-2 — a debt-free issuer cannot be valued or graded.** The capital structure requires all four debt components
  before it will sum them, and dataset schema v1 has no way to say "nil by disclosure". For an issuer that presents
  no borrowings line, gross and net debt are `NOT_COMPUTABLE`, which blocks the DCF enterprise-to-equity bridge, both
  EV methods, intrinsic value, margin of safety, the ROIC−WACC moat dimension and the leverage risk factor. Entering
  `0` was refused: an inferred zero is indistinguishable from a filed zero in the artifact.
- **D-3 — reason-code precision.** With no risk factor generated, the aggregate reports `POLICY_INPUTS_UNAVAILABLE`,
  which states the one dimension that could not be evaluated (leverage) and not the several that were evaluated and
  passed. The reason vocabulary is published and appears in goldens, so it needs its own change.

Evidence: `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/README.md` (disposition, coverage, defects, verification) and
`evidence/real-issuer/README.md` (bundle index).

---

## 14. D-2 nil-by-disclosure — clarification appended (2026-11-06; representation change only)

**No entry in `L-001` … `L-029` was closed, renumbered, reinterpreted or re-statused by this section.** It records
what the D-2 work item changed about the *spelling* of an undisclosed item, and what it did not change about the
limitations recorded above.

**What changed.** Dataset schema v1 had one spelling for "no number here", so a filer that says an item is nil and a
filer whose filing could not be read produced the same observation. A positive declaration of nil is now its own
state — `presence: 'NIL_BY_DISCLOSURE'`, `reason: 'DECLARED_NIL_IN_SOURCE'`, a source reference, the period end and
`value: null` (INV-7) — kept apart from `NOT_REPORTED`, `SOURCE_UNAVAILABLE` (`FILING_UNAVAILABLE`,
`PERIOD_NOT_COVERED`, `STATEMENT_OUT_OF_SCOPE`), `UNMAPPED` (`NOT_TAGGED_IN_FILING`), `NOT_COMPUTABLE` and a
reported zero. One aggregation states the only permission under which a nil may contribute zero (the four debt
components, all from one balance sheet, each nil named in the aggregate's note and published unchanged); the two
claims subtracted in the enterprise-to-equity bridge admit it on the same terms. Everything else still blocks.

**What that means for the register.** The D-2 entry recorded in §13 was a *representation* defect, and it is
corrected. The limitations it was adjacent to are not:

| Entry | Effect of this section |
|---|---|
| `L-001` … `L-029` | untouched; no status, identifier, order or wording changes in the register |
| `L-003` (closed derivation set) | untouched: no derivation was added, and a derived item still cannot be declared nil (`NIL_ON_DERIVED_ITEM`) |
| `L-006` (restricted cash `NOT_COMPUTABLE`) | untouched: it is a *missing line item*, not a declared nil, and it stays `NOT_COMPUTABLE: NOT_REPORTED` |
| `L-009` (no real issuer assessed) | untouched: the D-2 evidence is one issuer's own facts, not real-dataset coverage |
| `L-004` (synthetic reference dataset) | untouched |
| R-16 sector coverage | unchanged: 3 of 13 sectors; `Technology` was used because it was already measured |
| D-3 (reason-code precision, §13) | **still open.** The leverage dimension is now evaluated where net debt resolves, but no factor is emitted for a company that passes, and the aggregate still says `POLICY_INPUTS_UNAVAILABLE`. That vocabulary change needs its own work item |

**What this section explicitly does not claim.** No valuation, no verdict and no real-issuer validation: no market
price is observed in this work item, so the margin of safety still refuses with `NO_PRICE_OBSERVATION`, and the
intrinsic band that now resolves for the Work Item 1 issuer is the already-published policy blend, not a validated
estimate. No artifact was persisted; the Work Item 1 chain and its evidence are unchanged. The Infosys reassessment
and version comparison remain a later work item.

Evidence: `docs/integration/IIPS_V3_IID_D2_NIL_BY_DISCLOSURE_2026-11-06.md` and
`evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/`.

### 14.1 Addendum — PR #487 review (2026-11-06)

The first revision of §14 rested on a nil declaration the FY2024 consolidated statements do not make. The filing
presents no borrowings row and no borrowings note, so there is no wording to quote and the components are
`NOT_REPORTED`; the declaration, and the arithmetic that followed from it, have been withdrawn from the D-2 evidence
bundle. **This addendum changes no register entry**: `L-001` … `L-029` remain untouched in status, identifier, order
and wording, `L-003`, `L-004`, `L-006`, `L-009` and R-16 remain unaffected, and D-3 remains open and unaddressed.

What the review did change is the product's guard: a declared nil now requires the source's quoted wording
(`nilByDisclosure` refuses without it, INV-7 checks it, and the operator path refuses a bare `NIL` with
`NIL_WITHOUT_QUOTED_WORDING`). The D-2 permission therefore applies only where a filer actually states the nil, and
that case is not present in the evidence in hand — the mechanism is verified on synthetic fixtures only.

Evidence: `evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/README.md` (§1, §2) and `.../withdrawn/WHY-WITHDRAWN.md`.

---

## 15. D-3 risk reason-code semantics — clarification appended (2026-11-06; reporting semantics only)

**No entry in `L-001` … `L-029` was closed, renumbered, reinterpreted or re-statused by this section.** It records
what the D-3 work item changed about the *spelling of a risk outcome*, and what it did not change about the
limitations recorded above.

**What changed.** The risk taxonomy published a factor only when a dimension failed. A dimension that passed and a
dimension that could not be evaluated both emitted nothing, so the aggregate had one code — `POLICY_INPUTS_UNAVAILABLE`
— for two opposite situations. Every dimension now publishes its own outcome, and the aggregate separates *how much
ran* (`COMPLETE` / `PARTIAL` / `NONE`) from *what it found* (`PASSED` / `CONCERNS` / `INDETERMINATE`). Two codes were
added where the vocabulary had no accurate spelling — `NO_RISK_FACTOR_IDENTIFIED` and `RISK_EVALUATION_PARTIAL` — and
`POLICY_INPUTS_UNAVAILABLE` is retained, now used only where it is true: nothing could be evaluated.

**What that means for the register.** The D-3 entry recorded in §13 (and left open by §14 and §14.1) was a
*reporting* defect, and it is corrected. The limitations it was adjacent to are not:

| Entry | Effect of this section |
|---|---|
| `L-001` … `L-029` | untouched; no status, identifier, order or wording changes in the register |
| `L-006` (restricted cash `NOT_COMPUTABLE`) | untouched: still a missing line item, still `NOT_COMPUTABLE: NOT_REPORTED`. The new dimension reporting surfaces it *more* clearly, it does not remove it |
| `L-009` (no real issuer assessed) | untouched: the D-3 evidence is one issuer's own facts through one path, not real-dataset coverage |
| `L-016` (thin IID-3 read slice) | untouched |
| `L-004` (synthetic reference dataset) | untouched |
| R-16 sector coverage | unchanged: 3 of 13 sectors; `Technology` was used because it was already measured |
| D-3 (reason-code precision, §13) | **corrected.** Per-dimension status, measurement, blocking reason and inputs are published; completeness and disposition are separate fields; the aggregate reason distinguishes complete, partial and absent evaluation. The permission D-3 *does not* grant: a missing input still cannot pass, be zero, or be neutral |

**The Infosys consequence, recorded as a limitation rather than a result.** On the merged D-2 baseline the
assessment said `POLICY_INPUTS_UNAVAILABLE`; it now says `PARTIAL` / `INDETERMINATE` with two dimensions evaluated and
passed and the leverage dimension blocked by a net debt the filing does not present. **The issuer's risk position is
still not assessable** — this section changes what the product says about that, not whether it is true. No risk score,
no risk grade and no investment conclusion is published for this issuer.

**What this section explicitly does not claim.** No valuation, no verdict, no real-issuer validation, no change to any
formula, threshold, weight, confidence cap or disposition gate. The payload digest of the assessed artifact moves
(`cc91f239197a…` → `8e23f025527e…`) because the payload now carries a field it did not have; a path-by-path
comparison with the Work Item 1 artifact finds exactly two differences, both inside `risk`. The Work Item 1 evidence
and the post-D-2 regression record are unmodified.

Evidence: `docs/integration/IIPS_V3_IID_D3_RISK_REASON_SEMANTICS_2026-11-06.md` and
`evidence/real-issuer/D3-RISK-REASON-SEMANTICS-2026-11-06/`.

---

## 16. Work Item 2 — market-price observation (2026-11-06; data evidence only)

**No entry in `L-001` … `L-029` was closed, renumbered, softened, reinterpreted or re-statused by this section.** It
records the first observation of a market price for the Work Item 1 issuer, the four limitations that observation
exposes, and what the assessment now says — and does not say.

**What changed.** One dataset record was added to the Work Item 1 inputs: a BSE end-of-day close for ISIN
`INE009A01021` on trade date `2026-11-06` (₹1,180.65, `ClsPric`), sourced from
`BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV`. The dataset version moves
`sha256:ca29c835…` → `sha256:0ef4299d…`; the assessment payload moves `8e23f025527e…` → `06be8f6680ec…`; a
path-by-path comparison against a regenerated pre-WI-2 baseline finds thirteen differences, all inside the run clock,
the dataset identity and the `valuation.marginOfSafety` block.

**What it buys, and what it does not.** The margin-of-safety refusal moves from `NO_PRICE_OBSERVATION` to
`INTRINSIC_WITHHELD`: the price limb of that blocker is closed, the value limb is not, because the issuer's borrowings
remain `NOT_REPORTED` (D-2) and the intrinsic range stays withheld. Nothing about the issuer's risk position, moat,
dividends, quality verdict or confidence changed — `PARTIAL` / `INDETERMINATE`, `INSUFFICIENT_EVIDENCE` and `0.4939`
respectively stand exactly as §15 left them.

### 16.1 L-030 — The observation is single-exchange and transcribed

- **Originating phase:** IIPS v3.0 Work Item 2 (2026-11-06).
- **Description:** the price was read from a BSE end-of-day file fetched by an operator-side tool and committed as a
  one-row extract. The NSE archive (`sec_bhavdata_full_06112026.csv`) and the NSE quote API both returned HTTP 500
  from this environment, so **no second feed corroborates the value**, and there is no automatic freshness or
  reconciliation path — the observation is a verified *row*, not a verified *market*. Internal consistency checks
  (session range, last-price agreement, implied VWAP, day-move sanity, ISIN/scrip match) pass; they bound, but do not
  eliminate, transcription risk.
- **Affected contracts / outputs:** `PriceRecord.source = DATASET_EOD`; `valuation.marginOfSafety` for this issuer; any
  future claim that a price is "verified" or "provider-backed".
- **Status:** `OPEN`.
- **Downstream phases affected:** any real-issuer assessment that uses a price; any IID-6 statement about market-data
  readiness.
- **Consequence for user-visible results:** a margin of safety, once computable, will rest on one exchange's file with
  no independent agreement test. The payload names the exact file and row, so the claim is auditable but not
  corroborated.
- **Required resolution / evidence:** a second, independent source for the same instrument and session (NSE bhavcopy,
  or the IPD point-in-time store once populated with real data) agreeing within an explicit tolerance, plus an
  acceptance test that fails when they disagree.
- **Owner / responsible phase:** market-data integration (IPD PIT population), not this work item.
- **Evidence:** `evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06/source/retrieval.json`
  (`alternativesAttempted`, `nseCorroboration`).
- **Last status update:** 2026-11-06 (opened).

### 16.2 L-031 — "Unadjusted" is a statement about an empty table

- **Originating phase:** IIPS v3.0 Work Item 2 (2026-11-06).
- **Description:** the price record carries `adjustment: null`. The engine refuses a price that straddles a
  per-share-affecting corporate action without a matching factor, but that guard can only fire on actions the dataset
  declares — and the dataset's `corporate-actions.json` is empty (`coverage.corporateActions = 0`, `identity/
  corporate-actions.json` carries `actions: []`). Nothing in this work item verifies Infosys's actual action history
  between 2024-03-31 and 2026-11-06, and dataset schema v1 has no dividend-declaration record either (already recorded
  in the payload's `limitations[]`).
- **Affected contracts / outputs:** `PriceRecord.adjustment`; the `UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION` refusal;
  any per-share comparison across an action boundary.
- **Status:** `OPEN`.
- **Downstream phases affected:** every per-share valuation and margin of safety on this issuer; any split/bonus
  handling in a later work item.
- **Consequence for user-visible results:** a margin of safety computed from this price would be correct only if no
  per-share-affecting action occurred in the window — an assumption the evidence does not establish.
- **Required resolution / evidence:** a corporate-action feed (or an operator-declared table) covering the window, with
  an acceptance test showing the guard fires on a real declared action and that the factor is applied, not guessed.
- **Owner / responsible phase:** dataset schema / corporate-action ingestion.
- **Evidence:** `evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06/dataset/corporateActions.json` and
  `dataset/manifest.json` (`coverage.corporateActions`).
- **Last status update:** 2026-11-06 (opened).

### 16.3 L-032 — The margin cannot be run against a period-matched historical price

- **Originating phase:** IIPS v3.0 Work Item 2 (2026-11-06).
- **Description:** design §R-6.4 and `selectPrice()` admit a price only when
  `knownAsOf ≤ price.asOf ≤ generatedAt` and no older than the freshness window. A close from the statement period
  (FY2024) is therefore refused by construction (`PRICE_PREDATES_KNOWLEDGE_CUTOFF`), and so is any close older than
  the window (`PRICE_OUTSIDE_POLICY_WINDOW`). The observation date is consequently the run date, not the period end —
  which is correct for a contemporary margin of safety, but means the product **cannot** answer "what did the margin
  look like when the annual report was published" from this contract, and cannot back-test a valuation against the
  price of the day.
- **Affected contracts / outputs:** `valuation.marginOfSafety`; any historical/back-testing use of the assessment;
  `asOf.knownAsOf` as a knowledge cutoff.
- **Status:** `OPEN`.
- **Downstream phases affected:** any performance-attribution, back-test or vintage-comparison surface; IID-5 change
  intelligence where a price change is an input.
- **Consequence for user-visible results:** a margin of safety is always "today's price against today's value from
  last-filed statements", with the statements' age published separately as stale. It is not a historical series.
- **Required resolution / evidence:** an explicit as-of price query path (a PIT store with a real vintage series), with
  acceptance tests that pin both the admitted window and the refusal of a period-matched price — a *design* decision,
  not a defect to be repaired by widening the window.
- **Owner / responsible phase:** valuation policy / PIT integration.
- **Evidence:** `evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06/README.md` §3;
  `iips-platform/tests/investment/assessment-price.test.ts`.
- **Last status update:** 2026-11-06 (opened).

### 16.4 L-033 — Freshness window: design says five trading days, code uses seven calendar days

- **Originating phase:** IIPS v3.0 Work Item 2 (2026-11-06, observed while establishing the alignment rule).
- **Description:** design §R-6.4 states the default window as "5 trading days"; `VALUATION_POLICY.freshness
  .priceMaxAgeDays` in `assessment/policy.ts` is **7 calendar days**, and `selectPrice()` measures calendar days. The
  implementation is the more permissive of the two in wall-clock terms and the less precise in trading terms (a
  seven-calendar-day window can span a holiday run; a five-trading-day window cannot).
- **Affected contracts / outputs:** the `PRICE_OUTSIDE_POLICY_WINDOW` refusal; `mos-policy/1.0.0`.
- **Status:** `OPEN` (recorded, deliberately not changed).
- **Downstream phases affected:** any consumer that reasons about price freshness or reproduces a refusal boundary.
- **Consequence for user-visible results:** none for this observation (age is 0 days against either reading), but a
  price 6–7 days old would be admitted here where the design text says it should be refused.
- **Required resolution / evidence:** a policy decision on which unit governs, then the version bump and the
  acceptance test that pins it. **Not** taken here: this work item may not change valuation or risk policy.
- **Owner / responsible phase:** valuation policy.
- **Evidence:** `docs/integration/IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md` §R-6.4;
  `iips-platform/src/investment/assessment/policy.ts` (`freshness.priceMaxAgeDays: 7`).
- **Last status update:** 2026-11-06 (opened).

### 16.5 What §16 does not change

| Entry / item | Effect of this section |
|---|---|
| `L-001` … `L-029` | untouched; no status, identifier, order or wording changes |
| `L-004` (synthetic reference dataset) | untouched: this is still one issuer through one operator path |
| `L-006` (restricted cash `NOT_COMPUTABLE`) | untouched: `NOT_REPORTED`, and a price does not supply it |
| `L-009` (no real issuer assessed) | untouched: one issuer, one path, no real-dataset coverage claim |
| `L-014` (identity includes the assessment timestamp) | untouched; `RESOLVED` since IID-5 and not revisited |
| D-2 (nil-by-disclosure, §14) | untouched: the three borrowings components stay `NOT_REPORTED`; **no nil is invented** |
| D-3 (reason-code precision, §13/§15) | untouched: `PARTIAL` / `INDETERMINATE`, leverage dimension still blocked |
| R-16 sector coverage | unchanged: 3 of 13 sectors |
| Margin of safety | **state changed, status not improved**: refusal moves `NO_PRICE_OBSERVATION` → `INTRINSIC_WITHHELD`; still `NOT_COMPUTABLE`, still no band |

**What this section explicitly does not claim.** No valuation, no verdict, no margin of safety, no investment
conclusion, and no production-readiness or provider-backed market data. The intrinsic range remains withheld because
the capital structure is incomplete; the price did not unblock it and was never expected to. No formula, threshold,
weight, confidence cap or risk policy was changed, no IPD implementation was touched, and the Work Item 1, D-2 and
D-3 evidence bundles plus `evidence/iid` are byte-identical to their state on `main` @ `41c4498`.

Evidence: `docs/integration/IIPS_V3_IID_WI2_PRICE_OBSERVATION_2026-11-06.md` and
`evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06/`.

---

## 17. Work Item 3 — borrowings declared nil, and the intrinsic chain (2026-11-06; primary evidence)

**No entry in `L-001` … `L-033` was closed, renumbered, softened, reinterpreted or re-statused by this section.** It
records the primary evidence that closes defect D-2's evidence limb for this issuer, the intrinsic valuation that
evidence unblocks, and the three limitations the publication exposes.

**What changed.** Four columns were added to the Work Item 1 statement rows and four cells were declared on the
2024-03-31 CONSOLIDATED row — `LONG_TERM_BORROWINGS`, `SHORT_TERM_BORROWINGS`,
`CURRENT_MATURITIES_OF_LONG_TERM_DEBT` and `PREFERENCE_CAPITAL` — each carrying the filer's own sentence from the
FY2024 audited consolidated statements (Note 2.11: “The Group has no outstanding borrowings.”; Note 2.12: “The Company
has only one class of shares referred to as equity shares having a par value of ₹5/-.”). Dataset version moves
`sha256:0ef4299d…` → `sha256:21cf2522…`; payload moves `06be8f66…` → `83644bc6…` (51,196 B). A structural comparison
against the Work Item 2 payload finds 96 changed paths, every one attributed to the declaration or to a block
downstream of it, the dataset identity, the run clock or the narrative list.

**What it buys.** Gross debt resolves to ₹8,359 crore (Ind AS 116 lease liabilities; the three declared nils are named
in its note and counted as zero), net debt to **−₹19,342 crore**, and the enterprise-to-equity bridge opens. The
intrinsic range is computed for the first time — ₹875.34 / ₹1,088.97 / ₹1,399.81 per share, spread 48.16 % — and the
margin of safety moves from `INTRINSIC_WITHHELD` to **computed**: −8.42 % vs mid, −34.88 % vs low, band `FAIR`,
`refusal: null`, against the unchanged Work Item 2 close of ₹1,180.65. Two other outputs blocked on the same missing
input also resolve by their published rules: the leverage risk dimension (`PASSED`, −0.47× net debt / EBITDA) and the
dividend coverage verdict (`COVERED`); the moat classification moves `INSUFFICIENT_EVIDENCE` → `NARROW`. Confidence
moves `0.4939` → `0.6736` with the same two caps (`STALE_DATA`, `DILUTION_PROXY`).

**What it does not buy.** No valuation formula, threshold, weight, confidence cap, policy version or dataset schema
changed. No nil was invented: every declaration quotes the filer, the grammar refuses a bare `NIL`
(`NIL_WITHOUT_QUOTED_WORDING`), a nil without provenance (`NIL_WITHOUT_PROVENANCE`) and a nil on a derived item
(`NIL_ON_DERIVED_ITEM`), and the Work Item 1 and Work Item 2 datasets still publish `NOT_REPORTED`. `restrictedCash`
and `associatesAndJV` remain `NOT_COMPUTABLE: NOT_REPORTED`. The band is a distance from a midpoint, not a
recommendation; the payload still declares `decisionSupportOnly` and `noTradeExecution`.

### 17.1 L-034 — The published valuation rests entirely on policy-default inputs, and the design's cap for that is not implemented

- **Originating phase:** IIPS v3.0 Work Item 3 (2026-11-06).
- **Description:** now that an intrinsic value is published, its inputs deserve the same audit as its arithmetic. All
  three weighted methods use `POLICY_DEFAULT` parameters: the discount rate is the policy WACC (Rf 6.9 %, ERP 5.5 %,
  β 1.0, 70/30 weights → 10.677961 %), the terminal growth is 4 %, `PE_RELATIVE` uses a 22× target multiple and
  `EV_EBITDA` a 12× multiple, both flagged `multipleBasis: 'POLICY_DEFAULT'` in `assumptions.methodSpecific`. The
  design requires that a `POLICY_DEFAULT` discount rate “caps confidence” (§R-4.3, design line 1631) and that a
  `POLICY_DEFAULT` target multiple “caps confidence” (line 1634). `assessment/confidence.ts` implements six caps —
  `ADEQUACY_PARTIAL`, `ADEQUACY_INSUFFICIENT`, `STALE_DATA`, `DILUTION_PROXY`, `DIVIDEND_SOURCE_CONFLICT`,
  `HIGH_METHOD_DISAGREEMENT` — and **none of them is a policy-default penalty**; the published formula string lists
  the same six. The components are published, so the disclosure half of §R-4.3 is satisfied; the cap half is not.
- **Affected contracts / outputs:** `confidence.caps` and `confidence.combined` for every assessment whose rate or
  multiples are policy defaults — which, on this dataset, is all of them; `assumptions.discountRate.basis`;
  `assumptions.methodSpecific[*].multipleBasis`.
- **Status:** `RESOLVED` (2026-11-06, **IX** — the authorised policy is in force). The owner's four decisions of
  2026-11-06 supply the value and the rule the entry was waiting for, and the engine now applies them: policy
  `confidence-policy-defaults/1.1.0`, additive by **distinct assumption category**, one aggregate ceiling of **0.35**
  applied once, **no floor**, zero valid. On the committed Infosys assessment the published confidence moves
  `0.6736 → 0.4378`; the two categories charge 0.20 (`DISCOUNT_RATE`, `DCF_FCFF`) and 0.15 (`TARGET_MULTIPLE`,
  `PE_RELATIVE` + `EV_EBITDA` — three triggers, two charges), the sum reaches the ceiling without exceeding it, and the
  payload publishes the category, the rate, the applied flag and the single-ceiling arithmetic. The intrinsic range,
  every method weight and every other cap are unchanged: the penalty prices the *provenance* of the assumption, it does
  not re-value the company. Evidence: §17.7 and `evidence/real-issuer/IX-AUTHORIZED-VALUATION-POLICY-2026-11-06/`.
  **This entry is closed on the mechanism being in force, not on the penalty being "right" in any absolute sense** — it
  is the authorised magnitude, which is what R-4.3 asked the operator to choose.
- **Downstream phases affected:** any consumer that treats `confidence.combined` as a proxy for valuation reliability;
  IID-6 display of confidence next to a published intrinsic value.
- **Consequence for user-visible results:** the confidence of 0.6736 does **not** carry a penalty for the fact that the
  value is a policy-default value rather than an issuer-modelled one. Two assessments, one with an
  operator-supplied WACC and one with the policy default, can currently report the same confidence.
- **Required resolution / evidence:** a policy decision on the cap's name and factor (it is a policy constant, not an
  implementation detail), the corresponding branch in `confidence.ts` and clause in the published formula, plus an
  acceptance test that pins the difference between an `OPERATOR_SET`/`WACC_DERIVED` rate and a `POLICY_DEFAULT` one.
  **Not** taken by Work Item 3, which wrote this entry: it may not change a confidence cap or add a policy constant.
  *(VII's authorisation covers the declaration block and the trigger mechanism recorded below; it does **not** cover a
  factor, which is why the status stays `OPEN`.)*
- **Owner / responsible phase:** valuation and confidence policy.
- **Evidence:** `docs/integration/IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md` lines 1631,
  1634; `iips-platform/src/investment/assessment/confidence.ts` (formula and cap list);
  `iips-platform/src/investment/assessment/policy.ts` lines 102–131; the payload's `assumptions` block in
  `evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/artifact/assessment-payload-wi3.json`.
- **Disposition (VII, 2026-11-06) — mechanism only, status `OPEN`:** `VALUATION_POLICY.policyDefaultAssumptionCaps` declares both caps the design names
  (`POLICY_DEFAULT_WACC`, `POLICY_DEFAULT_MULTIPLE`) with `policyVersion: 'confidence-policy-defaults/1.0.0'` and
  **`factor: null`**; `confidence.assumptionCaps` publishes, per triggered cap, the basis, `applied: false`, the
  triggering `methodId`/`assumption` pairs and the reason `CAP_FACTOR_NOT_SET_IN_POLICY`; the published formula gains a
  clause naming the caps as declared and not applied; `limitations[]` gains the sentence. The cap-application path is
  implemented and unit-tested behind `factor !== null`, so setting the policy constant activates it without further code
  change. No factor was inferred from `STALE_DATA`, `DIVIDEND_SOURCE_CONFLICT` or anywhere else: the design of record
  (lines 1631, 1634) requires a cap and states no magnitude, so inventing one would have moved every published
  confidence figure on a guess. `combined` is therefore `0.6736` before and after, and `caps` still lists only the two
  penalties actually applied — the declaration is kept in a separate member precisely so that "declared" cannot be read
  as "applied". An `OPERATOR_SET` discount rate turns the WACC trigger off (test); an all-policy-default assessment
  triggers both. Evidence: `evidence/real-issuer/VII-VALUATION-INTEGRITY-2026-11-06/` (`runs/05-verification.txt`,
  `artifact/payload-diff-vs-wi3.json`); `iips-platform/tests/investment/assessment-valuation-integrity.test.ts`;
  `frontend/server/investment/cli/valuationIntegrity.test.ts`.
- **What remains open, exactly:** the cap's **magnitude** *and* whether an all-default assessment is capped once or
  once per triggering assumption. Both are policy decisions, not implementation details: the design names the caps
  (lines 585/930) and specifies no factor, and no authorised R-13 decision supplies one. `VALUATION_POLICY.
  policyDefaultAssumptionCaps.factor` is the single place it would be set; setting it is a **model change** that moves
  the published confidence of every assessment. Until that decision exists, the requirement of R-4.3 is **unmet**, the
  payload says `CAP_FACTOR_NOT_SET_IN_POLICY`, and no cap may be described as applied.
- **This work item does not:** invent a factor, select one from an adjacent cap, apply a cap to `confidence.ts`, or
  describe the R-4.3 requirement as satisfied.
- **Last status update:** 2026-11-06 (opened); 2026-11-06 (VII — mechanism prepared and declared in the payload;
  **status stays `OPEN`**, pending an authorised R-13 policy decision).

### 17.2 L-035 — A nil declaration is documentary: the link from the quoted sentence to the component it fills is not machine-checked

- **Originating phase:** IIPS v3.0 Work Item 3 (2026-11-06).
- **Description:** `NIL_BY_DISCLOSURE` guarantees three things mechanically — that wording was supplied, that a
  `filing_ref` and a period exist, and that the item is not a derived one. It does **not** check that the wording is
  *about* that component. Here two mappings are interpretive: a group-level sentence (“The Group has no outstanding
  borrowings.”) is applied to each of three components, and a parent-level sentence about share classes (“The Company
  has only one class of shares …”) is applied to the consolidated `PREFERENCE_CAPITAL` block. Both are argued in
  `source/quotes.json` (`directOrDerived`, `scopeNuance`) and in the bundle README, so a reader can audit them — but a
  later operator could declare, say, a nil long-term borrowing from a sentence about trade payables, and the ingester
  would accept it.
- **Affected contracts / outputs:** `components[*].presence = NIL_BY_DISCLOSURE`, `grossDebt`, `netDebt`, and
  everything downstream of them (`valuation.intrinsic`, `marginOfSafety`, leverage risk dimension, dividend coverage,
  moat).
- **Status:** `OPEN`.
- **Downstream phases affected:** every future real-issuer declaration, and any IID-4/IID-6 surface that presents a
  declaration to a user as established fact.
- **Consequence for user-visible results:** the nil is as good as the operator's mapping. The evidence trail makes a
  wrong mapping *visible* (quoted wording, hashed extract, `filing_ref`, period) but not *impossible*.
- **Required resolution / evidence:** a declaration grammar that binds a nil to a statement section and a line-item
  class (or a review step that records who accepted the mapping), plus acceptance tests for a mismatched
  section/component pair. Not a formula change and not attempted here.
- **Owner / responsible phase:** ingestion grammar (D-2 lineage) with investment research review.
- **Evidence:** `evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/source/quotes.json`;
  `frontend/server/investment/cli/wi3BorrowingsNil.test.ts` (bare-`NIL` refusal);
  `iips-platform` ingestion grammar for `NIL:` cells.
- **Last status update:** 2026-11-06 (opened).

### 17.3 L-036 — Associates/JV enter the enterprise-to-equity bridge as a policy zero that the payload never states

- **Originating phase:** IIPS v3.0 Work Item 3 (2026-11-06), found while verifying the newly published intrinsic value
  against its own published inputs.
- **Description:** `equityValueFromEnterprise` converts enterprise value to equity value by subtracting net debt, NCI
  and preference capital and **adding** `associatesAndJV` at carrying value. Design rule R-4.1 requires associates/JV at
  carrying value; dataset schema v1 has no such line item, so the function's own comment calls the absence "a declared
  policy zero — published in the method's assumptions, rather than a silent omission", and the function does build the
  sentence *"associates/JV carrying value is not recorded in dataset schema v1; treated as zero by policy R-4.1 and
  disclosed"*. That sentence is attached to the **intermediate equity observation**, which `perShare()` replaces with a
  fresh observation; the composed payload therefore carries **no** such statement. What a reader can see is
  `capitalStructure.associatesAndJV = NOT_COMPUTABLE: NOT_REPORTED` and nothing that says the bridge used zero for it.
  The gap cost nothing while the bridge was blocked (Work Item 2); Work Item 3 opens the bridge, so a published
  per-share value now rests on a substitution the payload does not state.
- **Affected contracts / outputs:** `valuation.methods[DCF_FCFF|EV_EBITDA|EV_REVENUE].output.perShare*`,
  `valuation.intrinsic.perShare`, `valuation.marginOfSafety`; `fundamentals.capitalStructure.associatesAndJV`;
  `limitations`.
- **Status:** `PARTIALLY RESOLVED` (updated 2026-11-06, **IX**; first narrowed by VII). Three separate facts, kept
  separate on purpose:
  1. **Disclosure — correct.** The treatment reaches the persisted payload, the per-share observations and
     `limitations[]` with `associates-treatment/1.0.0`, and the payload distinguishes a **policy substitution**
     (`POLICY_ZERO_UNAVAILABLE`) from an **issuer-reported nil** (`DECLARED_NIL`, quoted wording required) and from a
     **filed carrying value** (`CARRYING_VALUE_REPORTED`). IX widened the bridge note to all three treatments, so a
     filed value that lifts each enterprise-derived per-share figure says so on the figure it moved.
  2. **Control — in force.** 180 calendar days from the **source-evidence date** (newest balance-sheet instant, basis
     `DATASET_PERIOD_END`), never from an execution timestamp: the Infosys evidence is 950 days old at the assessment
     clock, so `status` is `REVIEW_DUE` with `reviewRequired: true` and the reason names `2024-09-27`. The flag is inert
     — no value, no nil, no penalty, no confidence, no formula, no verdict — and it is **clock-free in the payload** (the
     age is derived at render time) so the review control cannot mint a version every midnight.
  3. **Quantification — NOT closed.** The carrying value is still unavailable **in the committed issuer evidence**: V2
     can now hold it, but no filing in this bundle states one, so the bridge still substitutes zero and the
     understatement remains unquantified for this issuer. No value is asserted, and no sentence here claims the carrying
     value was established. See §17.7.
- **Downstream phases affected:** every enterprise-value method on every issuer; IID-6 display of a per-share value
  whose inputs are claimed to be published.
- **Consequence for user-visible results:** the intrinsic range is understated by any associates/JV carrying value the
  issuer reports, and a reader cannot tell from the payload that the term was zero. The size is **unquantified** here:
  it needs the issuer's non-current investment schedule, which schema v1 has no field for and this bundle does not
  transcribe.
- **Required resolution / evidence:** either carry the disclosure through composition (done in VII), or add an
  associates/JV line item to the dataset so the term is a reported number (**done in IX**: schema V2). Both contract
  changes are now in place; what the entry still needs is the issuer's filed carrying value, plus the 180-day review
  control that IX put in force as the standing prompt for it.
- **Owner / responsible phase:** assessment contract (valuation composition) with ingestion schema.
- **Evidence:** `iips-platform/src/investment/assessment/capitalStructure.ts` lines 243–286 (the note is built, then
  dropped by `perShare()`); the composed payload
  `evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/artifact/assessment-payload-wi3.json`, where the strings
  "associates/JV carrying value" and "treated as zero by policy" occur **zero** times while
  `capitalStructure.associatesAndJV` is `NOT_COMPUTABLE / NOT_REPORTED`.
- **Disposition (VII, 2026-11-06) — `PARTIALLY RESOLVED`, disclosure only:** the treatment is now recorded where composition reads it.
  `VALUATION_POLICY.associatesTreatment` (`associates-treatment/1.0.0`, basis `CARRYING_VALUE`, `whenUnavailable:
  POLICY_ZERO`) is the single statement of the policy; `describeEquityBridge()` converts it into a
  `capitalStructure.equityBridge` block (`treatment`, `policyVersion`, `substitutedInputs[]`, `note`); `perShare()` now
  carries the note onto every derived per-share observation — the specific line that fixes the defect; and `limitations[]`
  repeats the sentence. `equityValueFromEnterprise` reads the sentence from that block rather than composing its own, so
  the arithmetic and the disclosure cannot drift. **No arithmetic changed:** the term is still `+ associatesAndJV`, still
  zero when the dataset cannot supply it, and the payload says so in words — *"a policy substitution, not an
  issuer-reported nil"* — and names the policy version R-4.1 requires be recorded. The zero is not silent, not described
  as an issuer nil, and nothing was estimated. Verified on the **stored** payload, read back through
  `readVersionWithPayload`, not on the engine's object. Evidence: `evidence/real-issuer/VII-VALUATION-INTEGRITY-2026-11-06/`
  (`artifact/assessment-payload-vii.json`, `artifact/payload-diff-vs-wi3.json`); the same bundle's `numbersUnchanged`
  shows intrinsic, margin of safety and band byte-identical to Work Item 3.
- **Residue that keeps this entry open (updated by IX, 2026-11-06):** `capitalStructure.associatesAndJV` remains
  `NOT_COMPUTABLE: NOT_REPORTED` and `equityBridge.treatment` remains `POLICY_ZERO_UNAVAILABLE` on the published
  payload, so equity value is still understated by an amount **nobody has quantified**, and the payload says so instead
  of holding a silent zero. IX removed the *representational* half of this residue: dataset schema **V2** can hold
  `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` (and the XBRL reader maps the two component captions), so the field
  the magnitude needs now exists and a V2 carrying value flows to the bridge — demonstrated at
  ₹1.6888/share per ₹1,000 crore, with the review control closing. What remains is **the issuer's figure**, which the
  committed filing evidence does not contain. No value was estimated and none is asserted here.
- **Residue restated after WI-4 (2026-11-06, §17.8) — still `PARTIALLY RESOLVED`, now for a sharper reason:** the
  carrying value was sought in the audited consolidated Ind AS statements for FY2024, FY2023 and FY2022 and **no
  equity-accounted interest is recognised in any of them** — no separate balance-sheet caption (Ind AS 1.54(e)), no
  share-of-associates line in profit or loss (Ind AS 1.82(c)), and Note 2.5 decomposing both investment captions
  exhaustively into amortised cost / FVOCI / FVTPL while tying to the filed totals twice in every period. So the
  remaining gap is not "a number nobody has found": there is no filed amount to ingest, and the bridge still applies
  zero for that term — under the **disclosed** `POLICY_ZERO` treatment, not an unstated one (§17.9). Absence was **not**
  converted into a nil, no value was estimated, no V2 observation was created, and the 180-day control remains
  `REVIEW_DUE` on the unchanged `2024-03-31` clock.
- **Last status update:** 2026-11-06 (opened); 2026-11-06 (VII — disclosure-propagation defect corrected;
  `PARTIALLY RESOLVED`, carrying value still unavailable); 2026-11-06 (IX — V2 can hold the item; status unchanged);
  2026-11-06 (WI-4 — issuer statements examined in full for three periods; no equity-accounted interest exists, nothing
  ingested, status unchanged); 2026-11-07 (WI-4 residual — Notes 2.13–2.27 read in both filings; no associate/JV
  relationship, no carrying value, and the "unstated policy zero" description corrected to the disclosed treatment;
  status unchanged, §17.9).

### 17.4 What §17 does not change

| Entry / item | Effect of this section |
|---|---|
| `L-001` … `L-033` | untouched; no status, identifier, order or wording changes |
| `L-003` (derived items are never nil) | untouched and still enforced; all four declarations are on as-filed items |
| `L-004` (synthetic reference dataset) | untouched: still one issuer through one operator path |
| `L-006` (restricted cash `NOT_COMPUTABLE`) | untouched: still `NOT_COMPUTABLE`, and now **quantified** — the filing's ₹348 crore of restricted balances equals ₹8.40/share, 0.77 % of intrinsic mid |
| `L-007` (diluted count is an EPS proxy) | untouched; `DILUTION_PROXY` cap still applied |
| `L-009` (no real-issuer coverage claim) | untouched: one issuer, 3 of 13 sectors |
| `L-030` (single-exchange price) | untouched: the price is the same single BSE record |
| `L-031` (empty corporate-action table) | **untouched in status (`OPEN`), materially changed in effect**: a published margin of safety now assumes unverified share-base continuity from 2024-03-31 to 2026-11-06 |
| `L-033` (freshness unit divergence) | untouched; **no effect** here — the price is 0 days old and inside both the 5-trading-day and 7-calendar-day readings |
| `L-034`, `L-035` | added by this section and **not** fixed here: no confidence cap was introduced and no declaration grammar was changed. *(Updated for `L-034` only by §17.5 and VII: the cap *mechanism* is now prepared and declared in the payload **without a factor**. **§17.7 and IX then applied the owner's authorised rates, so `L-034` is `RESOLVED`; `L-035` remains `OPEN`.**)* |
| D-2 (nil-by-disclosure, §14) | evidence limb **satisfied for this issuer**: the filing states the nil in words, and the declaration is quoted, hashed and referenced |
| D-3 (reason-code precision, §13/§15) | untouched by code; its subject matter moved to `COMPLETE` / `PASSED` because the leverage input is no longer missing |
| Margin of safety | **state changed to computed** — `INTRINSIC_WITHHELD` → `refusal: null`, band `FAIR`, −8.42 % vs mid |
| R-16 sector coverage | unchanged: 3 of 13 sectors |

**What this section explicitly does not claim.** No investment verdict, recommendation, target price or trade
instruction — and no unconditional conclusion: the margin of safety is conditioned on share-base continuity the
dataset cannot verify (`L-031`), on a valuation built entirely from policy-default inputs (`L-034`), on a nil
whose mapping to its component is documentary (`L-035`), and on an associates/JV term the payload silently holds at
zero (`L-036`). `FAIR` is a distance from the midpoint of a range, published beside the symmetric reference. The
statements are 950 days old and the valuation is a policy-default valuation; both are stated in the payload and in
§17.1. No formula, threshold, weight, confidence cap, policy constant or valuation policy version was changed, and the
Work Item 1, D-2, D-3 and Work Item 2 evidence bundles plus `evidence/iid` are byte-identical to their state on
`main` @ `41c4498`.

Evidence: `docs/integration/IIPS_V3_IID_WI3_BORROWINGS_NIL_2026-11-06.md` and
`evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/`.

### 17.5 What the L-034 and L-036 corrections cost the payload grammar (2026-11-06, VII)

Both corrections — one of which (`L-036`) corrects a defect while leaving its limitation open, and the other of which
(`L-034`) prepares a mechanism while leaving its requirement unmet — add **semantic members** to
`investment.company-assessment`, and that is not free: IID-5 pins the
payload's member inventory (O-9) and its reference digests (O-1) precisely so that payload evolution cannot happen
silently. The evolution is taken openly here, in the shape the D-3 precedent established.

| Item | Effect |
|---|---|
| `confidence.assumptionCaps` | **new member**, now enumerated in `ASSESSMENT_MEMBER_INVENTORY` — the grammar decision AC-L14.10 asks for. Enumerated rather than folded into `caps: OPEN` because the block exists to state caps that were *not* applied, which `caps` by definition cannot hold |
| `fundamentals.capitalStructure.equityBridge` | **new member** inside the already-open `capitalStructure` subtree, so the inventory accepts it without a new entry; it is still semantic, so it is inside substantive identity |
| `confidence.formula`, `limitations[]`, per-share `note` | existing members whose **content** changed |
| Substantive digests (M1 vectors C1/C4/C5) | moved: `08ea8d4a…` → `6d295010…` (D-3) → **`33c02caa…`**; `fd9589e4…` → `19a08af3…` → **`df2cacd8…`**; `34240407…` → `0032be68…` → **`7e4251bc…`** |
| Input digests and the disposition digest | **unchanged** — the engine takes no new input and no disposition member moved |
| WI-3 payload digest `83644bc6…` | **unchanged and preserved**; the new Infosys payload is `6a328ef0…` and lives in its own bundle |

Neither earlier layer is rewritten. `substantive-identity.test.ts` reconstructs the pre-disclosure payload from the
current one (`undoDisclosure`), asserts that exactly six paths differ and that they are the disclosed ones, and then
reproduces **both** earlier digest sets byte for byte — the decision's published values through
`preD3(undoDisclosure(…))` and the post-D-3 values through `undoDisclosure(…)`. A reader comparing the L-014 record to
that file still finds the record reproduced. What changed is the payload, because it now says something it did not say
before.

This is the same cost D-3 paid when `risk.evaluation` was added, and the same answer: a grammar decision, a
reconstruction proof, and constants that state the new values instead of reading them back from the implementation.

**Statuses after §17.5:** `L-036` is `PARTIALLY RESOLVED` (disclosure-propagation defect corrected; carrying value
still unavailable, understatement unquantified) and `L-034` is `OPEN` (mechanism prepared; cap factor undecided, no
penalty applied). Neither entry is closed, and neither is described as satisfied.

**Not changed by §17.5:** `L-035` (still `OPEN`), `L-031`, `L-033`, every other limitation, every stored artifact, and
every payload digest other than the one this work item newly published.

### 17.6 The `L-034` and `L-036` decisions, prepared but not taken (2026-11-06, VIII)

This section records a **decision package**, not a decision. Its subject is the one thing VII could not supply: the
**cap factor / granularity** that `L-034` needs, and the **carrying value** that `L-036` cannot hold. Neither is
invented, and neither entry moves.

**What VIII added.** (a) An exact reproduction of the VII baseline from the committed Work Item 3 inputs — intrinsic
875.3394 / 1088.9723 / 1399.8105, margin of safety −8.4187 % vs mid, band `FAIR`, confidence `0.6736` — with 21 fields
checked against the frozen payload, all matching. (b) The four `L-034` alternatives (A no cap until authorised; B one
aggregate cap; C one cap per cap type; D one cap per triggering assumption) with trigger conditions, application
order, repeat behaviour, interaction with the six existing caps, effect on this assessment and on other
configurations, and the code change each requires. (c) The `L-036` source path — which note would disclose the
figure, what the committed evidence actually contains (**nothing**: the three extracted notes never mention
associates/JV), and the exact representational gap. (d) A versioned schema proposal. (e) Five proposed decision
records, each marked as a proposal.

**The finding that changes how `L-034` should be decided.** The prepared mechanism is **already `C`-shaped**:
`assumptionCapsOf()` builds one declaration per cap *type* and the apply loop multiplies once per applied declaration.
Setting `factor` therefore selects "one cap per cap type" (`f²` on this assessment) without any further code change,
while B and D each need an arithmetic and payload change. Setting a number therefore cannot be separated from choosing
a granularity — they are one decision, which is why the draft record `DR-034-1` carries both fields.

**The finding that bounds `L-036`.** The missing term is worth **₹1.6888 per share per ₹1,000 crore** of carrying value
(0.155 % of mid, +0.1679 pp of margin of safety), and the published band would not leave `FAIR` below ₹1,77,654 crore.
That does not make the zero acceptable — R-4.1 requires the term at carrying value and the payload still cannot say how
much it is missing — but it does mean **blocking the bridge** (which would withhold the intrinsic range entirely, as
Work Item 2 did) would cost far more than the disclosure of an unquantified substitution.

**Authority, restated because the temptation to skip it is the main risk to this work item.** Four different
authorities are involved and none of them is a "PA": the policy value (A1) and evidence acceptance (A4) belong to **the
operator** under R-17's vocabulary; the dataset/schema change (A2) belongs to the operator in the interim IRR-only
arrangement with **IPD ingestion** as target owner (design D-2/§1.5); the implementation (A3) belongs to IRR and needs
no separate authorisation (R-17 dropped "authority to implement"). **R-13 does not authorise anything** — it classifies
the change: setting a factor is a `MODEL` change that must be attributed in the change report, once authorised.

**Statuses after §17.6:** `L-034` is **`OPEN`** — the factor and granularity are an undecided operator policy choice,
so no penalty is applied and R-4.3's cap half stays unmet. `L-036` is **`PARTIALLY RESOLVED`** — the disclosure is
corrected and the sensitivity is now quantified, but the carrying value is neither representable in dataset schema v1
nor present in the committed evidence, so the understatement stays unquantified. `L-035` remains `OPEN`.

**Not changed by §17.6:** every other entry and status, every policy constant, every formula, weight and threshold, the
dataset schema, every stored artifact and every payload digest. The single new executable file is
`iips-platform/scripts/viii-valuation-decisions.ts` (investigation only, outside `tsconfig.include`), guarded by
`iips-platform/tests/investment/viiiValuationDecisions.test.ts`, which fails if the policy factor is set without
regenerating the package.

Evidence: `docs/integration/IIPS_V3_IID_VIII_VALUATION_DECISIONS_2026-11-06.md`,
`docs/integration/IIPS_V3_IID_ASSOCIATES_JV_SCHEMA_PROPOSAL_2026-11-06.md` and
`evidence/real-issuer/VIII-VALUATION-DECISIONS-2026-11-06/`.

### 17.7 The authorised policy is implemented, and `L-034` closes (2026-11-06, IX)

Section 17.6 stopped at a decision package because the two things `L-034` and `L-036` needed — a **policy value** and an
**issuer figure** — are not IRR's to invent. Both have now been supplied, and they were supplied by different
authorities, which is the reason this section separates them as sharply as it can:

| What was missing | Who supplied it | What it is now |
|---|---|---|
| the `POLICY_DEFAULT` penalty magnitude and its application rule (`L-034`) | **the owner**, four decisions of 2026-11-06 | policy `confidence-policy-defaults/1.1.0`: additive by distinct assumption category, one aggregate ceiling of **0.35**, **no floor**, zero valid |
| the associates/JV carrying value (`L-036`) | **nobody** — no filed figure exists in the committed evidence | a V2 dataset *can* hold it; the committed Infosys evidence still does not, and no value is asserted |

**`L-034` — closed, because the mechanism is now in force rather than prepared.** The requirement was that a
`POLICY_DEFAULT` assumption must carry a published confidence consequence. The engine previously declared the cap and
applied nothing (`factor: null`, `applied: false`); it now applies a named reduction per distinct category and
publishes the arithmetic. On the same Infosys assessment, at the same clock, with the same evidence:

| | before IX | after IX |
|---|---|---|
| published `confidence.combined` | `0.6736` | **`0.4378`** |
| applied caps | `STALE_DATA`, `DILUTION_PROXY` | `STALE_DATA`, `DILUTION_PROXY`, `POLICY_DEFAULT_WACC`, `POLICY_DEFAULT_MULTIPLE` |
| `assumptionCaps[].applied` | `false` (declared, unapplied) | `true`, with `category` and `penaltyRate` published |
| intrinsic mid / MoS / band | `1088.972274952081` / −8.4187 % / `FAIR` | **unchanged** |

Three triggers, two charges: `DCF_FCFF` carries the `DISCOUNT_RATE` category (0.20) and `PE_RELATIVE` +
`EV_EBITDA` share the single `TARGET_MULTIPLE` category (0.15). The categories sum exactly to the ceiling, so the
ceiling is applied once and is not exceeded; `L-034`'s requirement that a category must not double-charge is satisfied
by construction, not by a guard. `confidenceFloor` is `null`: zero remains a publishable confidence, and the payload
formula says so.

**`L-036` — updated, and deliberately not closed.** Three distinct facts stay distinct, and the register will not
merge them:

1. **The disclosure is correct and now complete.** `associates-treatment/1.0.0` is unchanged, the payload still
   distinguishes a **policy substitution** (`POLICY_ZERO_UNAVAILABLE`) from an **issuer-reported nil**
   (`DECLARED_NIL`, quoted wording required) and from a **filed carrying value** (`CARRYING_VALUE_REPORTED`), and the
   bridge note now travels onto every enterprise-derived per-share figure for all three treatments — a filed value
   that lifts each figure by `carryingValue / shares` says so on the figure it moved, exactly as a policy zero that
   understates it does.
2. **The review control is in force.** 180 calendar days from the **source-evidence date** (`clockStart`, the newest
   balance-sheet instant, basis `DATASET_PERIOD_END`), never from an execution timestamp; the Infosys evidence is
   **950 days** old at the assessment clock, so `status` is `REVIEW_DUE`, `reviewRequired` is `true`, and the reason
   names the date it fell due (`2024-09-27`). The flag is inert: it changes no carrying value, converts no unavailable
   input into a nil, applies no penalty, moves no confidence, formula or verdict.
3. **The carrying value is still not established.** Not for want of a flag, and not for want of a schema — V2 exists —
   but because the committed filing evidence contains no filed associates/JV figure. `L-036` therefore stays
   **`PARTIALLY RESOLVED`**: the *representational* and *control* defects are fixed; the *quantification* defect is not,
   and no register sentence claims it is.

**One architectural consequence worth recording, because it contradicts the obvious design.** The review block in the
payload is **clock-free**: it publishes `clockStart`, `reviewAgeDays`, `reviewDueOn`, `status`, `reviewRequired` and the
reason, but *not* `elapsedDays`, and not the measurement clock. A day count is a pure function of the execution clock,
and a payload member that moves every midnight would mint a version on every re-run — the precise defect
`assessment-substantive-identity/1` closes (L-014, AC-L14.1/AC-L14.2). The age is therefore derived at render time
from `clockStart` and the report's own `asOf`, both of which the payload carries; the *status* stays, because it is a
policy verdict on the evidence (like `asOf.staleBeyondPolicy`) and moves only when the review crosses its date, which is
a disclosure change worth one version. Widening the exclusion set instead was rejected: the identity grammar forbids a
silent extension, and a grammar bump would invalidate every stored `/1` payload.

**V2, and what it does and does not cost.** `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` is `BS` / `INSTANT` /
`INR` / positive magnitude, `reported: true`, and absent from V1. V1 is unchanged — 52 items, same bytes, same digest,
never backfilled — and V2 adds exactly one item (53). Absence is `NOT_REPORTED` (never zero); a nil needs the filer's
quoted wording; a derived value cannot be nil; a V1 dataset that carries the item is refused **by name**
(`LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2`), and a build that does not know V2 refuses the whole dataset rather than
dropping the member. The XBRL reader gained the two component captions (`InvestmentsInAssociates`,
`InvestmentsInJointVentures`) and adds them when both are filed — arithmetic on filed facts, reflected in the coverage
disclosure's mapped-tag count (20 → 22). **No IPD write was made**, no new persistence was added and no stored artifact
changed.

**The blank-scope statement, restated because the temptation is to over-claim.** A V2 carrying value on the Infosys
datasets demonstrates the *schema*, not the *issuer*: ₹1,000 crore of carrying value moves intrinsic mid by
**₹1.6888/share** (`0.7 × carrying value / shares`, the exact bridge arithmetic) and closes the review control, while
`dataConfidence`, the quality verdict, adequacy and the applied-cap list do not move. `modelConfidence` does move
(`0.6342 → 0.6346`), because it is a function of the published per-share spread — arithmetic on published outputs, not a
penalty — and the bundle labels it that way rather than hiding it.

**Statuses after §17.7:** `L-034` → **`RESOLVED`**. `L-036` → **`PARTIALLY RESOLVED`** (unchanged status; the reason
narrows to the missing issuer figure alone). `L-035` → `OPEN`. `L-001` … `L-033` unchanged.

**Not changed by §17.7:** every other entry and status; every D-2/D-3 semantic; the disposition's own adequacy
haircut (which is not the `POLICY_DEFAULT` penalty and does not double-count it); every method weight, threshold and
formula other than the confidence aggregate the owner authorised; every stored artifact and every historical payload
digest; every WI1/WI2/WI3 evidence file.

Evidence: `docs/integration/IIPS_V3_IID_IX_AUTHORIZED_VALUATION_POLICY_2026-11-06.md`,
`evidence/real-issuer/IX-AUTHORIZED-VALUATION-POLICY-2026-11-06/` (regenerable, guarded by
`iips-platform/tests/investment/ixAuthorizedPolicy.test.ts`).

## 17.8 WI-4 — the associates/JV carrying value, sought in the audited statements and not found (2026-11-06; primary evidence, no ingestion)

§17.3 left one sentence standing: the bridge substitutes zero for `associatesAndJV` because **the issuer's figure was
never obtained**, and §17.7 gave the item a home (schema V2). WI-4 went and looked, in the issuer's own audited
consolidated Ind AS statements, for FY2024, FY2023 and FY2022. It found nothing to report — and, more importantly, it
found *why*: the Group recognises no equity-accounted interest in the periods examined. **No dataset was written, no
observation was created and no nil was declared.**

**Documents.** Two audited consolidated Ind AS filings cover the three periods, because each carries a full comparative
column: `consol-fy24-annual-finstatement.pdf` (`INFY-INDAS-CONSOL-FY24`, FY2024 with FY2023 comparatives, statements
dated 2024-04-18) and `consol-fy23-annual-finstatement.pdf` (`INFY-INDAS-CONSOL-FY23`, FY2023 with FY2022 comparatives,
statements dated 2023-04-13). Both audited by Deloitte Haskins & Sells LLP, both in ₹ crore, both from the same issuer
document family the Work Item 3 nil declarations already rest on, so the evidence chain stays on one basis. Read in
full: both balance sheets, both profit-and-loss statements, Note 1.3 *basis of consolidation*, **Note 2.5 *Investments*
and Note 2.5.1 *Details of investments* for all three periods**, and Notes 2.6, 2.7, 2.9, 2.10, 2.11 and 2.12 of the FY2024
statement.

**Three structural tests, all negative.** An equity-accounted interest cannot be recognised without leaving a mark in
three places, and none of the three is marked.

| Test | Requirement | Finding |
|---|---|---|
| Balance-sheet caption | Ind AS 1 para 54(e): *investments accounted for using the equity method* as a separate line item | **absent** in all three years; the only investment captions are the two `Investments` lines (non-current 11,708 / 12,569 / 13,651; current 12,915 / 6,909 / 6,673), both cross-referenced to Note 2.5 |
| Note decomposition | the note must reconcile the captions it serves | **reconciles twice, to the rupee, in every period** — captions: 11,708 + 12,915 = 24,623 · 12,569 + 6,909 = 19,478 · 13,651 + 6,673 = 20,324; measurement categories: 1,759 + 19,620 + 3,244 = 24,623 · 1,920 + 16,012 + 1,546 = 19,478 · 2,122 + 16,007 + 2,195 = 20,324. An exhaustive Ind AS 109 decomposition that ties both ways leaves no room for an unreported fifth component |
| Profit and loss | Ind AS 1 para 82(c) / Ind AS 28: separate *share of profit or loss* and *share of OCI* of associates and joint ventures | **absent** in all three years; the OCI section's five lines are defined-benefit remeasurement, equity instruments at OCI, cash-flow hedges, translation differences and fair-value changes on investments |

Corroborating: Note 1.3 describes consolidation of *the Company, its controlled trusts and its subsidiaries*, line by
line with intra-group elimination, and points to Note 2.25 for the entity list — no associate, no joint venture, no
equity method.

**The figures that look like the answer, and are not.** Every one of these is audited and quotable, which is exactly
why the entry needs them named and refused rather than passed over:

| Candidate | ₹ crore | Why it cannot populate `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` |
|---|---|---|
| Non-current `Investments` FY2024 | 11,708 | aggregate government/tax-free bonds, NCDs, government securities, target-maturity and other funds, and minority preference/equity stakes — fully decomposed, no equity-accounted component |
| Total investments FY2024 / FY2023 / FY2022 | 24,623 / 19,478 / 20,324 | treasury portfolio totals, including current commercial paper, CDs and liquid funds |
| Named holdings total FY2024 / FY2023 / FY2022 | 404 / 365 / 377 | Note 2.5.1's minority stakes and fund interests (Whoop 60, Nivetti 31, Ideaforge equity 113, Global Innovation & Technology Alliance 2, Stellaris 84, House Fund II 107, House Fund III 7; Airviz, Merasport and Tidalscale at nil value) — all carried at fair value, and **fair-value measurement is incompatible with the equity method** |
| Ideaforge equity stake FY2024 | 113 | a listed minority holding of 16,47,314 shares at FVOCI; no significant influence asserted |
| Total assets / total equity FY2024 | 137,814 / 88,461 | issuer-level aggregates |
| Amortised cost / FVOCI / FVTPL FY2024 | 1,759 / 19,620 / 3,244 | measurement categories cutting across asset classes |
| Form AOC-1 | — | an annexure to the standalone statements, absent from the audited consolidated statements and barred from this item in any case |

**Why this is not a nil.** Work Item 3 could declare borrowings nil because the filing said so in words — *"The Group has
no outstanding borrowings."* No such sentence exists here. What exists is an **omission**: a caption that is not there.
The nil grammar requires the filer's own wording, the filing reference and the period, and this line item is a reported
(non-derived) item; an absent line cannot satisfy it. The distinction is also substantive, not pedantic: zero is a
*measurement* of a recognised interest written down to nothing, while "no interest is recognised" is a different fact
about the balance sheet, and only the filing may convert one into the other.

**What WI-4 changed in the product: nothing.** No dataset, no observation, no nil, no V1 backfill, no schema change, no
XBRL change, no bridge change, no policy change, no confidence change. `capitalStructure.associatesAndJV` remains
`NOT_COMPUTABLE: NOT_REPORTED`; `equityBridge.treatment` remains `POLICY_ZERO_UNAVAILABLE`; intrinsic, margin of safety,
band and every confidence member are byte-identical to §17.7; the committed IX package still regenerates exactly, which
`ixAuthorizedPolicy.test.ts` enforces.

**The review control stays on, and it should.** `associates-review/1.0.0` is an authorised requirement keyed to the age
of the source evidence, not a flag that switches off once someone has looked: `status` remains `REVIEW_DUE`,
`clockStart` remains `2024-03-31`, `reviewAgeDays` remains 180 and `elapsedDaysAtRun` remains 950. WI-4 *is* the look the
control demands, and its result is now on the record — for this issuer the policy zero happens to coincide with what the
statements recognise. No implementation defect was found in the control, so there is no basis to move the clock, the
window or the flag semantics, and none was moved.

**What WI-4 could not read, and why it does not change the answer.** The PDF text extraction available to this work item
returns the first 30 pages of each filing, through Note 2.12.4. Notes 2.13–2.27 were therefore not machine-read,
including Note 2.25 *Related party transactions* (p. 50), which lists the Group's entities. The conclusion does not rest
on them: an equity-accounted interest must appear in the balance sheet, in profit or loss **and** in the investments
note, and all three are complete and reconcile to the filed totals. But a related-party roster naming a dormant
associate would be a reason to keep `L-036` open rather than to close it — and it is kept open.

**Statuses after §17.8:** `L-036` → **`PARTIALLY RESOLVED`** (unchanged status; the residue is now precisely stated:
there is no filed amount to substitute, and the payload still applies zero under the disclosed `POLICY_ZERO`
treatment). `L-035` → `OPEN`
(unchanged; no new nil declaration was made, so the documentary-mapping limitation is untouched). `L-001` … `L-034`
unchanged; `L-034` remains `RESOLVED`.

Evidence: `docs/integration/IIPS_V3_IID_WI4_ASSOCIATES_CARRYING_VALUE_2026-11-06.md`,
`evidence/real-issuer/WI4-ASSOCIATES-CARRYING-VALUE-2026-11-06/` (nine verbatim extracts with digests, a nine-quote
provenance record, a machine-readable investigation finding, and a three-period reconciliation), guarded by
`iips-platform/tests/investment/wi4AssociatesEvidence.test.ts`.

## 17.9 WI-4 residual review — Notes 2.13–2.27 read, and the `POLICY_ZERO` wording reconciled (2026-11-07; evidence and documentation only)

§17.8 recorded two residues of its own. Both are now closed as *investigation*, neither as *status*: the notes WI-4
could not machine-read have been read, and one sentence WI-4 wrote about the payload has been corrected because the
implementation it described had already moved on.

### 17.9.1 Notes 2.13–2.27: read, and empty of associates and joint ventures

§17.8 said pages 31–57 could not be read because the extraction available then truncated at 30 pages, and that a
related-party roster naming a dormant associate would be a reason to keep `L-036` open. Both filings are digitally
typeset PDFs with a complete text layer — not scans — so the pages were read in full through a full-document reader of
the *same* PDF, page-anchored to the printed page numbers (`INFY-INDAS-CONSOL-FY24` pp. 31–57;
`INFY-INDAS-CONSOL-FY23` pp. 37–54, which also carries the FY2022 comparatives). Every note was opened and
characterised; Notes 2.19 and 2.25 are transcribed in full in the bundle.

| Note | Pages | Associates / JV content |
|---|---|---|
| 2.13–2.18 — other financial liabilities, trade payables, other liabilities, provisions, income taxes, revenue | 31–38 | none |
| **2.19 Other income, net** | 39–40 | **none** — the note in which a share of an associate's result would appear: interest at amortised cost 1,007, FVOCI interest 1,965, FVTPL gains 285, exchange 100 and 87, tax-refund interest, miscellaneous 207; total 4,711 (2,701) |
| 2.20–2.24 — expenses, leases, employee benefits, EPS, contingent liabilities | 40–49 | none |
| **2.25 Related party transactions** | 50–54 | **none** — the complete related-party universe is subsidiaries (one list, every row 100%-owned or majority-owned and controlled), trusts (post-employment benefit plans, four controlled trusts, Infosys Foundation as a "Trust jointly controlled by KMPs") and KMP with compensation 130 (127). No associates list, no joint-ventures list, no "entities over which KMP exercise significant influence" list |
| **Group-structure annexure** (para 2 of the general instructions, after 2.25) | 52–54 | **none** — blocks are Infosys Limited, Indian Subsidiaries, Foreign Subsidiaries, Subtotal 100%, consolidation adjustment, Controlled Trusts, non-controlling interests. No associates block, no joint-ventures block |
| 2.26–2.27 — segments, function-wise classification | 55–57 | none |

Three distinctions were applied rather than glossed:

1. **A relationship is not a classification.** The only "other related party" named in either year is Infosys
   Foundation, a trust jointly controlled by KMPs — a related party that is not an investee, equity-accounted or
   otherwise.
2. **Dormancy is not a carrying value.** The only dormancy markers are the subsidiary footnotes "(22) Under
   liquidation", "Liquidated effective July 14, 2023" and "Liquidated effective November 1, 2023". Those entities are
   already consolidated line by line — the opposite of a dormant associate held outside consolidation — and none carries
   an equity-method balance.
3. **"Associated enterprises" is a tax phrase.** The single occurrence of the word anywhere in these notes is Note
   2.24.1 (p. 48): *"…payments made to associated enterprises held as liable for withholding of taxes, among others."*
   That is Indian income-tax terminology; it names no entity, asserts no relationship and carries no balance.

**Result: no associate or joint-venture relationship is disclosed, and therefore no recognised carrying value exists to
establish.** No Dataset V2 observation was created, no nil was declared and no dataset changed. The WI-4 answer stands —
now on the complete audited pages rather than on the first thirty.

*Limits, stated rather than buried:* the interior movement tables of Notes 2.21 (leases) and 2.22 (employee benefits),
pp. 41–46, were not re-read; their opening tables and closing pages were. Neither note can present a third-party equity
interest, and neither is a route by which an equity-accounted investment could be missing from the balance sheet, the
investments note and the group-structure annexure at once. Recorded in the bundle as a limit.

### 17.9.2 "Unstated policy zero" was wrong, and is corrected

§17.8 ended its residue with *"the bridge still applies a policy zero that the payload does not state"*, and WI-4's
README and document repeated the claim. **That sentence is inaccurate against the implemented policy.** It was inherited
from §17.3, which described the **Work Item 3** payload correctly: that payload carries no `equityBridge` member at all,
which is the defect VII fixed.

What the implementation actually does, unchanged since VII/IX:

| Where | What it says |
|---|---|
| `VALUATION_POLICY.associatesTreatment` (`policy.ts`) | `policyVersion: associates-treatment/1.0.0`, `basis: CARRYING_VALUE`, `whenUnavailable: POLICY_ZERO` |
| `describeEquityBridge()` (`capitalStructure.ts`) | builds `capitalStructure.equityBridge` with `formula`, `note`, `policyVersion`, `substitutedInputs[]` and `treatment` |
| the composed payload | `treatment: POLICY_ZERO_UNAVAILABLE`; `substitutedInputs[0] = { input: associatesAndJV, presence: NOT_COMPUTABLE, reason: NOT_REPORTED, treatment: POLICY_ZERO }`; the note reads *"…the enterprise-to-equity bridge substitutes zero for that term under policy associates-treatment/1.0.0. This is a policy substitution, not an issuer-reported nil…"* |
| propagation | the same sentence reaches every derived per-share observation and `limitations[]` — four occurrences of "policy substitution" in the persisted payload |

Measured on committed artifacts, not on prose: `equityBridge` occurs **once** in
`evidence/real-issuer/VII-VALUATION-INTEGRITY-2026-11-06/artifact/assessment-payload-vii.json` and **zero** times in
`evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/artifact/assessment-payload-wi3.json` — which is exactly the
before/after boundary.

**Corrected wording, now used in §17.8, the WI-4 document and the WI-4 bundle README:**

> The bridge continues to apply the **disclosed** `POLICY_ZERO` treatment (`POLICY_ZERO_UNAVAILABLE`,
> `associates-treatment/1.0.0`) because no supportable carrying value is available. `L-036` remains
> **`PARTIALLY RESOLVED`** because the underlying amount is unavailable.

Nothing else moved: no valuation arithmetic, no policy semantics, no confidence policy, no review timing, no schema, no
stored payload. `perShare`, intrinsic, margin of safety and band are byte-identical, and `ixAuthorizedPolicy.test.ts`
still rebuilds the committed IX package from committed inputs and requires equality.

### 17.9.3 Statuses after §17.9

`L-036` → **`PARTIALLY RESOLVED`** (unchanged: the amount is still unavailable, and the payload still applies zero —
now described accurately as a disclosed treatment). `L-035` → `OPEN` (unchanged; no nil declaration). `L-001` … `L-034`
unchanged; `L-034` remains `RESOLVED`. The 180-day `associates-review/1.0.0` control is unchanged and still due.

Evidence: `evidence/real-issuer/WI4-ASSOCIATES-CARRYING-VALUE-2026-11-06/` — seven new source extracts (Notes 2.19 and
2.25 for both filings, both group-structure annexures, and a note-by-note sweep of pp. 31–57), sixteen quotes in
`source/quotes.json`, and the `residualReview` block in `artifact/investigation.json`; guarded by
`iips-platform/tests/investment/wi4AssociatesEvidence.test.ts`, which also asserts that the documentation no longer
contains the superseded "unstated" phrasing and that the payload really does disclose the treatment.

## 17.10 WI-5 — second issuer validation: no qualifying nil-by-disclosure (eClerx Services Limited)

**Date.** 2026-11-07 (reviewed and corrected the same day). **Scope.** Technology only, one issuer only; no policy, schema,
confidence, valuation or persistence change.

**Outcome.** Negative. eClerx Services Limited (`L72200MH2000PLC125319`) declares **no** nil on any governed line item in
its audited consolidated statements for FY2024. The bundle's first pass had declared `PREFERENCE_CAPITAL` nil on Note 13's
sentence *"The Company has only one class of equity shares having a par value of Rs 10 per share."*; that declaration was
**withdrawn** after review, because the sentence sits under the heading *"Terms / rights attached to equity shares"* and
speaks about classes of equity shares — it says nothing about preference shares — and nothing else in the filing declares
preference share capital nil (balance sheet p.194, statement of changes in equity pp.201–203, Notes 13, 14, 41, 46 and 47
read; recorded in `evidence/real-issuer/WI5-PREFERENCE-CAPITAL-2026-11-07/source/preference-capital-investigation.txt`).

**What was refused and kept refused.** The consolidated balance sheet carries a filed dash on Borrowings at 2024-03-31
(`Borrowings 17 - 6.77`), recorded as an explicitly reported **zero**, with 6.77/3.08 at 2023-03-31 and 0.50/0.91 at
2022-03-31 as filed; `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` has no caption in any of the three filings and stays empty.
The distinction between a filed zero, a declared nil and an absent caption is the whole subject of the item, and this
issuer supplies one of each.

**Correction and consequences.** The corrected dataset (`sha256:7aa6e3f9…`) yields `PREFERENCE_CAPITAL`
`MISSING`/`NOT_REPORTED` at all three observation points in the payload (`payloadDigest e876296ae0fb…`, artifact v1 in a
fresh governed store, reportId `1c50bcbc-…`). The field-level difference from the withdrawn payload is six paths: the
dataset digest and the preference-capital observation. Adequacy `SUFFICIENT`, quality `MATERIAL_CONCERNS`, combined
confidence **0.3210**, `grossDebt`/`netDebt` `NOT_REPORTED`, valuation and margin of safety unchanged (`PRICE_STALE` on
the 2026-11-06 close) — every one of them identical before and after the withdrawal. Withdrawing an unsupported nil cost
the assessment nothing, which is itself the point: the run never had a debt position resting on it.

**Objective status.** The work item's target — a second issuer with an explicit nil-by-disclosure — remains **unmet**.
WI-5 now demonstrates the refusal path on real data rather than a second positive. `L-036` remains **`PARTIALLY
RESOLVED`**, `L-035` remains **`OPEN`**; `L-001` … `L-034` untouched; the 180-day `associates-review/1.0.0` control
remains due. No status was moved to accommodate this result.

**Evidence.** `evidence/real-issuer/WI5-PREFERENCE-CAPITAL-2026-11-07/` (bundle, `digests.json`), with the withdrawn run
retained under `runs/superseded/` and `artifact/superseded/`; guarded by
`iips-platform/tests/investment/wi5PreferenceCapitalEvidence.test.ts`, `tsc --noEmit` clean, and reproduced from a clean
clone.

## 17.11 WI-6 — second issuer search: no qualifying nil exists in the accessible filings

**Date.** 2026-11-07. **Scope.** IRR only, Technology only, one pass. IPD untouched. No policy, schema, confidence,
valuation or persistence change.

**Outcome: negative, and no data change.** WI-6 was commissioned to produce a second issuer beside Infosys with a
genuinely supported explicit nil-by-disclosure. It did not succeed, and it did not manufacture a success: **no dataset
was ingested, no assessment generated, no artifact persisted, and no nil declared.** Infosys therefore remains the only
issuer on record with a validated explicit nil.

**What was searched.** The candidate register (`evidence/real-issuer/WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07/candidates.json`)
records ten issuers. Primary text was read for Newgen Software (Note 19 Borrowings, p.262: ₹219.92 lakh at 31-Mar-2024 —
non-zero) and Sasken Technologies (consolidated Notes 13–15, 32–34: no borrowings note and no nil wording; its Note
15(c) "only one class of equity shares" is the same scoped construction withdrawn in WI-5). Carried forward unchanged
from the WI-5 pass: TCS, Tata Elxsi, HCLTech, Mphasis, Persistent, LTIMindtree, Happiest Minds and the subsidiary filers.
Rejected on evidence class or scope: Birlasoft (MD&A only; filing unreadable), Tanla (borrowings non-zero), KFin
(front-matter statement; financial-services classification), Capgemini Technology Services India (unlisted).

**The exact blocker.** Zensar Technologies is the one candidate whose secondary evidence has the required form — a
secondary aggregator attributes "The Company does not have any outstanding borrowings as at 31 March 2024 and 31 March
2023" to its notes — and its primary filing could not be read: HTTP 403 from the NSE annual-report archive, HTTP 403
from the storage mirror, HTTP 404 on the BSE annual-report path (`source/access-blockers.txt`). A secondary aggregator
cannot establish a nil under D-2, and it is not shown there whether the sentence sits in the consolidated notes, so the
candidate is recorded as **blocked, not established**. Zensar is the first candidate for the next pass.

**Boundary this adds.** WI-3 shows what a nil needs (an affirmative sentence about the item); WI-5 shows that a sentence
scoped to a different subject cannot carry one; WI-6 shows that an unreadable filing cannot carry one either. All three
belong in the register because all three are ways a nil can be wrong or absent.

**Statuses.** `L-036` remains **`PARTIALLY RESOLVED`**, `L-035` remains **`OPEN`**, `L-001` … `L-034` untouched, and the
180-day `associates-review/1.0.0` control remains due. The WI-6 objective stays open; sector expansion remains deferred.

**Evidence.** `evidence/real-issuer/WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07/` — `candidates.json`, four page-anchored
source extracts, `source/access-blockers.txt`, `runs/commands.txt`, `digests.json` — guarded by
`iips-platform/tests/investment/wi6SecondIssuerSearch.test.ts`, which also verifies that the WI-3 and WI-5 bundles are
byte-unchanged.

## 17.12 WI-6A — Zensar: the primary filing was reached, the consolidated pages were not, and the sentence is standalone

**Date.** 2026-11-07. **Scope.** IRR only, one pass. IPD untouched. No policy, schema, confidence, valuation or
persistence change. PR #502 preserved and left unmerged.

**Outcome: `INVESTIGATED_UNSUCCESSFUL`, and no data change.** WI-6A was commissioned to settle one question — whether
the **consolidated** section of Zensar Technologies' FY2023-24 Integrated Annual Report declares borrowings nil. It is
not settled. The consolidated statements (printed pp.248-321) were **not retrieved** by any reader available to this
environment, so **no observation was created, no nil declared, no dataset ingested, no assessment generated and
nothing persisted.** Zensar is recorded as investigated and unsuccessful; Infosys therefore remains the only issuer on
record with a validated explicit nil.

**What the pass did settle.** The filing's own pagination decides the scope of the sentence that started the work:
standalone statements begin at printed p.176, consolidated statements at printed p.248, and the owner-located sentence
sits at printed pp.246-247. It is therefore a **standalone** declaration — about Zensar Technologies Limited, not the
Group — and D-2 does not permit a standalone declaration to be transferred to consolidated data. That conclusion holds
whatever pp.248-321 contain. It is the WI-5 failure mode one level up: a sentence scoped to *equity* shares could not
carry a preference-capital nil; a sentence scoped to the *parent entity* cannot carry a group nil.

**What was reached, and where it stopped.** The NSE archive URL serves the document to the plain reader — WI-6's "403
from the NSE archive" was a **proxy** refusal, now corrected, with reference `#18.1668dc17.1794028603.32167b5a` recorded
as such. The front matter was read end-to-end from two independent copies of the same document (NSE original and the RPG
Group mirror, identical wording): transmittal letter dated 15 July 2024 with Scrip ID/Symbol `ZENSARTECH`, Scrip Code
`504067`, Series `EQ`; contents spread showing 176 Standalone / 248 Consolidated; Index with Glossary p.322 and SASB
p.327. `CIN` and `ISIN` are absent from the readable window and are recorded as `NOT_VERIFIED_FROM_FILING` rather than
imported from a registry aggregator. Every reader here renders roughly the first 100 KB of text and stops; the one reader
that paginates whole documents is refused by NSE; the mirror, storage, BSE, Wayback and CORS-proxy routes are itemised
with exact statuses in `source/access-log.txt` (fourteen attempts).

**New limitation — `L-037` (`OPEN`).** *Deep-page retrieval of large Indian issuer annual reports is capped by every
available reader.* The direct reader stops after about 55 printed pages; the paginating reader is refused by the NSE
archive. The rule that follows is absolute: **absence of wording beyond the retrieval cap is not evidence of absence**,
and no negative finding about unrendered pages may be inferred from it. This is the mirror image of WI-6 — there, an
unreadable filing could not carry a nil; here, an unreadable filing must not be reported as carrying none.

**Three-period check: `NOT_PERFORMED`.** FY2023-24, FY2022-23 and FY2021-22 are each recorded `NOT_RETRIEVED` in
`periods.json`. The requirement is a confirmation requirement; it cannot substitute for the base period, and three blank
consolidated columns would be three unread periods dressed as a finding. No period is described as nil, zero, debt-free
or silent.

**Boundary this adds.** WI-3 shows what a nil needs; WI-5 shows a sentence scoped to a different subject cannot carry
one; WI-6 shows an unreadable filing cannot carry one; WI-6A shows both at once, and adds that an unreadable filing must
not be converted into a negative finding either. Four distinct ways for a nil to be wrong or absent.

**Statuses.** `L-036` remains **`PARTIALLY RESOLVED`**, `L-035` remains **`OPEN`**, `L-037` is **new and `OPEN`**,
`L-001` … `L-034` untouched, and the 180-day `associates-review/1.0.0` control remains due. The WI-6 objective stays
open; sector expansion remains deferred.

**Evidence.** `evidence/real-issuer/WI6A-ZENSAR-PRIMARY-RECOVERY-2026-11-07/` — `determination.json`, `periods.json`,
three page-anchored source extracts, `source/access-log.txt`, `runs/`, `digests.json` — guarded by
`iips-platform/tests/investment/wi6aZensarRecovery.test.ts`, which also verifies that the WI-3, WI-5 and WI-6 bundles
are byte-unchanged.

## 17.13 WI-6A-S1 — Zensar: the consolidated wording was reported, and could not be read

**Date.** 2026-11-07 (supplement to §17.12, same day). **Scope.** IRR only, one pass. IPD untouched. No policy, schema,
confidence, valuation or persistence change. PR #503 updated; not merged.

**What was reported.** Consolidated Note 27 *Capital Management* — *"The Group didn't have any external borrowings during
the current and previous year."* — at printed pp.304-305 of the FY2023-24 report and at printed pp.320-321 of the
FY2022-23 report (BSE `f1a251aa-…`). Each sentence covers the current and previous year; jointly they would span FY2022,
FY2023 and FY2024.

**What was verified.** Both documents are the right issuer and year (transmittal letters of 15 July 2024 and 17 July
2023, read in full); both cited page ranges fall inside the consolidated statements of their own reports (pp.248-321 and
pp.262-345, from each report's index); the CIN `L72200PN1963PLC012621` from a Zensar Regulation 33 letterhead. **The
sentences themselves were not read** — the only PDF reader here parses 30 pages and they sit ~150 PDF pages in.

**Outcome: unchanged, and no data change.** `INVESTIGATED_UNSUCCESSFUL` / `CONSOLIDATED_NIL_NOT_ESTABLISHED`. **No
observation was created, no nil declared, no dataset ingested, no assessment generated, nothing persisted.** A reported
sentence is a locator, not evidence: its subject ("the Group" or "the Company"), tense and qualifiers cannot be checked
without reading it, and those are what decide a nil — the WI-5 withdrawal turned on exactly a sentence whose subject was
wrong.

**A second blocker, independent of retrieval.** Gross debt sums four components — short-term borrowings, current
maturities, long-term borrowings **and lease liabilities** (`capitalStructure.ts` → `grossDebtOf`). The wording covers
borrowings only; lease liabilities are a separate line and mapping onto them is forbidden. `LEASE_LIABILITIES` would
therefore stay `NOT_REPORTED` and the aggregation contract returns the first uninformative component unchanged: **even a
verified sentence yields no computable gross or net debt**, and the intrinsic chain stays withheld. Three of four
components are not a debt block.

**Mapping prepared, not applied.** `LONG_TERM_BORROWINGS`, `SHORT_TERM_BORROWINGS` and
`CURRENT_MATURITIES_OF_LONG_TERM_DEBT` would take the nil (the mapping WI-3 applied to Infosys); `LEASE_LIABILITIES` and
`PREFERENCE_CAPITAL` stay `NOT_REPORTED`. Two caveats are recorded in advance rather than discovered later: the *external*
qualifier, and a durational statement being used for a point-in-time balance-sheet item. Recorded in
`WI6A-SUPPLEMENTAL-ZENSAR-CONSOLIDATED-2026-11-07/source/quotes-owner-reported.json` under `d2MappingAnalysis`; applied
to nothing.

**`L-037` — generalised, deliberately not closed.** The 30-page boundary now has two independent measurements (the FY24
report stops at printed p.55; the FY23 report at printed p.32) and three fetching paths behind it (direct reader; the
paginating proxy, which fails on these files but reads an 11-page Zensar filing in full; Google's translate proxy, which
returns the file and is still parsed under the same cap). The register provides no resolution criterion for it, so it
stays **`OPEN`**, and the rule stands: absence of wording beyond the cap is never evidence of absence. `L-036` remains
**`PARTIALLY RESOLVED`**, `L-035` remains **`OPEN`**, `L-001` … `L-034` untouched.

**Historical record.** §17.12 and the original WI-6A bundle are preserved unchanged and still verify against their own
digest manifests; this supplement adds a dated finding, it does not rewrite the earlier one.

**What closes this.** A readable rendering of the four printed pages — a page extract in the workspace suffices, because
D-2 anchors a quotation to a page, not to a byte stream — plus the consolidated lease-liability figure for the three
balance-sheet dates. Then the existing governed path, unchanged: ingest → generate → persist → separate-process readback
→ digest verification → three-period confirmation.

**Evidence.** `evidence/real-issuer/WI6A-SUPPLEMENTAL-ZENSAR-CONSOLIDATED-2026-11-07/` — `quotes-owner-reported.json`,
`retrieval-log-supplemental.txt`, `index-locator-corroboration.txt`, `determination-supplemental.json`, `runs/`,
`digests.json` — guarded by `iips-platform/tests/investment/wi6aSupplementalZensar.test.ts`.

## 17.14 WI-6A-S2 — Zensar: the consolidated pages were read, the nil was established and ingested (2026-11-07; primary evidence + governed run)

**Question.** §17.12 and §17.13 left WI-6A at `INVESTIGATED_UNSUCCESSFUL` / `CONSOLIDATED_NIL_NOT_ESTABLISHED` for
two independent reasons: the consolidated Note 27 wording had never been read, and gross debt also needs lease
liabilities, which no route had produced. S2 asked whether the pages can be read at all, and if so what the pipeline
may conclude from them.

**Reading achieved.** Both annual reports were fetched as bytes and their complete per-page text extracted — the
issuer-hosted FY2023-24 report (10,813,579 bytes, sha256 `d52cc3af…`, 167 pages) and the exchange copy of the
FY2022-23 report (15,745,097 bytes, sha256 `cc690832…`, 180 pages; the Wayback capture `20250803083822` serves an
identical hash). Each report prints two printed pages per PDF sheet; the printed-to-PDF calibration is recorded for
every cited page.

**The wording, read verbatim.** Consolidated Note 27 *Capital management*: *"The Group didn’t have any external
borrowings during the current and previous year."* — FY2023-24 printed **pp.304-305 (PDF p.154 of 167)**, FY2022-23
printed **pp.320-321 (PDF p.163 of 180)**. Subject *the Group*, scope consolidated, Ind AS; the 83-character string
hashes to `3c046626…6597cb`, identical to the string §17.13 recorded as reported-but-unread. The entry that recorded
it as unread was accurate when written and is not rewritten.

**Lease liabilities, three dates, three presentations.** Consolidated balance-sheet Note 11(b): non-current 1,228 /
1,904 / 2,348 and current 637 / 826 / 1,005 for 2024-03-31 / 2023-03-31 / 2022-03-31, i.e. **totals 1,865 / 2,730 /
3,353** — each corroborated by the Note 27 liquidity table carrying value and by the Note 33 movement (whose
prior-year row is `[3,353]`).

**Outcome: the nil is established and carried through the governed path.** `LONG_TERM_BORROWINGS`,
`SHORT_TERM_BORROWINGS` and `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` take `NIL_BY_DISCLOSURE` on that sentence (the
WI-3 mapping; the current-maturity leg recorded as deductive). `LEASE_LIABILITIES` takes the filed numbers, not the
nil. `PREFERENCE_CAPITAL` and `NON_CONTROLLING_INTEREST` stay `NOT_REPORTED`: a dash is not a declaration. Three
periods validated, datasetVersion `sha256:a71498da…`, assessment `SUFFICIENT` / `MATERIAL_CONCERNS` / 0.4032,
reportKey `dc9e4f47571d…`, payloadDigest `fbfa5564900a…`, reportId `28b3e5d6-…`, chain valid, head v1, and a
separate-process readback whose recomputed digest matches the stored digest and the chain head.

**What became computable.** `grossDebt` **₹1,865 million `PRESENT`** (the three nil components named in the
aggregation note), cash and investments ₹10,938 million, `netDebt` **−₹9,073 million `PRESENT`** — the first
computable debt position for this issuer — and net debt / EBITDA at −0.8804.

**What did not.** No intrinsic value: `DCF_FCFF` refuses for `INSUFFICIENT_HISTORY` (the FY2022 capital-expenditure
line was not captured; a gap in what was read, not in the filing), and the `EV_EBITDA` per-share leg is
`NOT_COMPUTABLE` — *"enterprise-to-equity conversion blocked by minorityInterest"*. No margin of safety:
`NO_PRICE_OBSERVATION`, no price obtained and none invented. Only the P/E relative band ₹362.56–₹543.84 is produced.
`L-036`'s associates review control fires exactly as designed: `REVIEW_DUE`, clock from 2024-03-31, due 2024-09-27,
age 180 days, treatment unchanged at `POLICY_ZERO` under schema V1.

**Statuses.** `L-037` stays **`OPEN`**: the entry describes a class of deep-page retrieval failure, and one issuer
on one item is not that class. It is updated — these two documents are now readable end to end with their bytes
hashed, so the retrieval limitation no longer attaches to them — and left open, because the register still supplies
no resolution criterion. `L-036` remains **`PARTIALLY RESOLVED`** and `L-035` remains **`OPEN`**; neither was
touched, because no independent evidence about either was produced. No new limitation is opened. `L-001` … `L-034`
untouched.

**How the bytes were obtained, and why it matters to this entry.** This environment still has neither general egress
nor PDF tooling; that measurement, and the routes it ruled out, stand. The fetch and extraction were performed by a
throwaway GitHub Actions job on a temporary workflow file added to this branch for exactly that purpose and deleted
in the same work item — a workaround for the environment, not a change to the evidence standard: the source bytes
are hashed, the page extracts are verbatim tool output with provenance headers, and every page is reproducible from
the two `curl` lines and the `pdftotext` lines recorded in the bundle's `runs/commands.txt`.

**Evidence.** `evidence/real-issuer/WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07/` — `determination-s2.json`,
`source/quotes-verified.json`, `source/source-bytes.json`, `source/page-map.json`, eleven page extracts,
`source/retrieval-log-s2.txt`, `ingest-input/`, `runs/`, `artifact/assessment-payload-zensar-s2.json`, `digests.json`
— guarded by `iips-platform/tests/investment/wi6aS2ConsolidatedPageEvidence.test.ts`. The WI-6A, WI-6A-S1, WI-6,
WI-5 and WI-3 bundles are byte-identical and still verify.

## 17.15 WI-7 — Consumer: the first issuer outside Technology, and a bridge the borrowing note cannot close (2026-11-07; primary evidence + governed run)

**Question.** WI-6A closed the Technology sector with a nil established and a debt position that could be computed. WI-7
asked the opposite question of a different sector: can the governed pipeline be exercised end to end on an issuer whose
disclosures are structurally unlike a software exporter's, without inventing a single input — and what does it refuse?

**Sector: Consumer, and why.** The governed method matrix gives Consumer three methods — `DCF_FCFF` (PRIMARY),
`PE_RELATIVE` (SECONDARY), `EV_EBITDA` (CROSS_CHECK) — and **not one of them declares a mandatory operating metric**.
Consumer is the only sector still unmeasured after Technology with that property; every other one requires at least one
operator- or vendor-sourced metric (Banking `BM_NIM`/`BM_GNPA`/`BM_CET1`, Insurance `IM_EMBEDDED_VALUE`, Capital Markets
`CM_AUM`, Utilities `UM_RAB`/`UM_ALLOWED_ROE`, Energy `EM_LIFTING_COST`, Materials `MM_RESERVE_LIFE`/`MM_COST_POSITION`,
Telecom `TL_SUBSCRIBERS`/`TL_ARPU`, Auto `AU_CAPACITY_UTILISATION`/`AU_MARKET_SHARE`, Healthcare `HC_OCCUPANCY`/`HC_ARPOB`,
Hospitality `HM_REVPAR`, Industrials `IN_BOOK_TO_BILL`). On any of those, a filing-only validation could only demonstrate
that methods are withheld. **Industrials is the recommended next sector**, and `IN_BOOK_TO_BILL` — a governed source for
an order-book metric — is the single thing that stands between it and a statement-only validation.

**Issuer: Marico Limited** (CIN `L15140MH1988PLC049208`, ISIN `INE196A01026`, BSE `531642`, NSE `MARICO`). Identity is a
filing fact: the CIN is printed at PDF p.115 (printed 226-227) of the Integrated Annual Report 2023-24, the ISIN and BSE
code at PDF p.159 (printed 314-315), the NSE symbol at PDF p.5, and the auditor's opinion on the consolidated statements
at PDF p.169 (printed 334-335), B S R & Co. LLP, Ind AS. No listing date is asserted because none is printed. Hindustan
Unilever, Nestlé India, Dabur, Godrej Consumer, Britannia and Colgate-Palmolive were considered and **not fetched** — no
page of their filings was read in this work item, so nothing about them is claimed; the operator reason is recorded in
`determination-wi7.json`, not dressed as a finding.

**The bytes.** Two reports, both HTTP 200, both hashed: FY2023-24 `03cb0db7…7595` (21,087,675 bytes, 259 pages),
FY2022-23 `0f41759d…2b0a` (28,505,144 bytes, 224 pages). A third, FY2021-22 `cd8855e5…a993` (27,915,655 bytes, 200
pages), is fetched and hashed but supplies **no** figure: the FY2021-22 column is read from the FY2022-23 report's
comparative, where that year's auditor's report sits. Each PDF page is a sheet carrying two printed pages, and every
citation gives both. The FY2023-24 report reclassifies the prior year's investing and financing sections against the
FY2022-23 report's own FY2023 column (investing `(865)` vs `(929)`; net increase in cash `(69)` vs `(133)`; operating
cash flow `1,419` in both); each row is taken from one statement and the difference is recorded, not averaged.

**D-2, exercised and not used.** Nothing on the eleven pages read declares borrowings, leases, preference capital or
non-controlling interest nil, so this dataset contains **zero** `NIL:` cells. The nil grammar is not used at all — which
is the honest state for a company that genuinely borrows. What the filing does instead is print a dash:  non-current
borrowings are `– / 2 / –` and there is **no current-maturity line anywhere** in the balance sheet, Note 13(a) or Note
13(b). The dash reading fixed at §17.14 applies unchanged — a dash is neither a number nor a quoted declaration — so
`LONG_TERM_BORROWINGS` is `NOT_REPORTED` for FY2024 and FY2022 and `2` (crore) for FY2023, and
`CURRENT_MATURITIES_OF_LONG_TERM_DEBT` is `NOT_REPORTED` in all three periods. `PREFERENCE_CAPITAL` is `NOT_REPORTED`
too: the balance sheet has an equity share capital line and no preference line, and silence is not a nil. Because the
component resolver takes the newest period that carries information, the published `longTermBorrowings` is the printed
FY2023 ₹2 crore **with its own `periodEnd 2023-03-31`** — a labelled prior-year figure, not a current one.

**Outcome: everything computable was computed, and what is not computable says why.** datasetVersion
`sha256:04c96303…`, `issues.json` `[]`; Consumer measured `G1_ENABLED` with all three of its methods `AVAILABLE`
(statement coverage 91.7 %, operating-metric coverage 100 %); adequacy `SUFFICIENT` (required-field coverage 100 %);
assessment `SUFFICIENT` / `MATERIAL_CONCERNS`, confidence **0.3306** (data 0.85, model 0.125, caps `STALE_DATA`,
`DILUTION_PROXY`, `POLICY_DEFAULT_WACC`, `POLICY_DEFAULT_MULTIPLE`); reportKey `01af3264…`, payloadDigest
`3fd27a98…`, reportId `f110608f-…`, chain valid, head v1, and a separate-process readback whose recomputed digest equals
the stored digest and the chain head. `grossDebt` and `netDebt` are `MISSING` / `NOT_REPORTED` — the current-maturity
component carries nothing — so `DCF_FCFF` computes an enterprise value (FCFF base 13,541,622,333 at WACC 10.68 %, g
4.00 %) and refuses every per-share leg (*"enterprise-to-equity conversion blocked by netDebt"*), `EV_EBITDA` is
`CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable`, and `EV_REVENUE` is excluded by the Consumer policy. The one
per-share figure the run publishes is the P/E band **₹181.69 / ₹227.11 / ₹272.54** (normalised EPS 10.3233 ×
policy-default 22), and it declares itself policy-default. `intrinsic` is `null`; the margin of safety is
`NO_PRICE_OBSERVATION`, no price obtained and none invented. `L-036`'s control fires `REVIEW_DUE` again — clock from
2024-03-31, due 2024-09-27, 180 days, `POLICY_ZERO` — for the same reason it fired on Zensar: schema V1 cannot carry an
associates/JV value and no figure for one was read.

**New limitation — `L-038` (`OPEN`). The enterprise-to-equity bridge needs three borrowing components that a consolidated
balance sheet need not print.** Gross debt requires long-term borrowings, short-term borrowings, current maturities of
long-term debt and lease liabilities, each carrying a number or a quoted nil. A filing that prints one current
`Borrowings` line, a dash in the non-current row and no current-maturity row cannot supply that, so a company reporting
cash, leases, minority interest and borrowings in full still gets no debt figure, no enterprise-to-equity conversion and
no enterprise-derived per-share value. This is a different failure from `L-036` (a term the schema cannot hold) and from
`L-037` (pages that could not be read): it is a gap between what the bridge requires and what an audited balance sheet is
obliged to print, and it is the second structural reason a fully read real issuer can still be unvalued. No grammar change
is proposed in WI-7: the two honest resolutions — a governed grade for a filed dash, or an optional "total borrowings as
filed" component carrying an explicit incompleteness flag — are decisions for this register's owner.

**Statuses after §17.15.** `L-038` is new and **`OPEN`**. `L-035` stays **`OPEN`** and `L-036` stays **`PARTIALLY
RESOLVED`**, both untouched: no independent evidence about either was produced. `L-034` stays `RESOLVED`. `L-037` stays
**`OPEN`** — WI-7 read its pages end to end, which does not test the retrieval cap that entry describes. `L-001` is
**unchanged**: the ingest records "1 of 13 sectors measured" *in this dataset*, which is a dataset-scoped fact, and one
Consumer issuer is not the twelve outstanding sectors of the sector-analytics frame. `L-002` … `L-033` untouched.

**Boundary this adds.** WI-3 shows what a nil needs, WI-5 that a scoped sentence cannot carry one, WI-6 that an unreadable
filing cannot, WI-6A that an unreadable filing must not be turned into a negative finding either. WI-7 adds the fourth
shape of the same discipline in a new sector: **a filing that is fully read, fully audited and perfectly legible can
still fail to carry a component the bridge needs — and the correct answer is to publish the refusal, not a number.**

**Evidence.** `evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/` — `README.md`, `determination-wi7.json`,
`source/source-bytes.json`, `source/page-map.json`, `source/identity-verified.json`, twelve verbatim page extracts,
`ingest-input/` (roster, `periods.csv`, identity sources, `data-extraction.json`), `runs/` (ingest, generate, readback,
commands, guard test, typecheck, clean clone, CI check), `artifact/assessment-payload-marico-wi7.json`, `digests.json` — guarded by
`iips-platform/tests/investment/wi7ConsumerMarico.test.ts`. Record: `docs/integration/IIPS_V3_IID_WI7_CONSUMER_MARICO_2026-11-07.md`.
The WI-3, WI-5, WI-6, WI-6A, WI-6A-S1 and WI-6A-S2 bundles are byte-identical and still verify.

## 17.16 WI-8 — Industrials: gross debt resolves, the cash side does not, and the grid says more than the headline (2026-11-07; primary evidence + governed run)

**Question.** §17.15 ended by recommending Industrials and naming `IN_BOOK_TO_BILL` as the one thing between that sector
and a statement-only validation. WI-8 asked the question the recommendation implied but could not answer: what does the
governed pipeline actually do with an Industrials filing when the order-book metric is *not* printed — and does the
enterprise-value family stand up when the borrowing note is complete?

**Sector: Industrials, and the issuer.** Industrials declares `DCF_FCFF` (PRIMARY), `EV_EBITDA` (SECONDARY) and
`EV_REVENUE` (CROSS_CHECK, mandatory `IN_BOOK_TO_BILL`), and declares **no `PE_RELATIVE`**. **KEC International Limited**
(CIN `L45200MH2005PLC152061`, ISIN `INE389H01022`, NSE `KEC`) was selected because its Note 30 decomposes current
borrowings into demand loans, other short-term borrowings, financial-institution commercial paper *and* current
maturities, while its balance sheet prints no current-investments line — one issuer exercising both halves of the bridge.
Larsen & Toubro (404), Thermax (one report only), ABB, Cummins, Bharat Forge, Siemens and AIA were rejected on retrieval
grounds, each recorded.

**Sources.** Two integrated annual reports, byte-verified: FY2025-26 (18,566,481 bytes, sha256 `ba638897…c820`, 215 pages)
and FY2024-25 (14,873,309 bytes, sha256 `29dfdf83…e1c6`, 206 pages). The FY2023-24 report is a **404**, so FY2024 is the
**comparative column** of the two reports read, stated per row. Auditor Price Waterhouse Chartered Accountants LLP
(FRN `012754N/N500016`) on the **consolidated** statements, Ind AS, signed 2026-05-16. Fifteen verbatim page extracts
with per-page provenance headers; every ingested figure mapped to its printed page, `REPORTED` or `DERIVED`.

**Identity, and one gap left open.** CIN at PDF p.119, ISIN and the two-exchange listing sentence at PDF p.107. Neither
report prints a trading symbol or a BSE scrip code anywhere in 215/206 pages; NSE's own quote-routing payload corroborated
`KEC` on 2026-11-07 (147,213 bytes, `symbol: "KEC"`, `companyName: "KEC-International-Limited"`), while BSE returned a
16,912-byte JavaScript shell containing neither the scrip code nor the company name. The listing map therefore carries
the **NSE leg only**, marked as an operator record with the corroboration named and the BSE absence explained. No scrip
code was invented to make the identity look complete.

**D-2 — the one representation decision.** The balance sheet prints one current-borrowings line (`4,441.86` / `3,342.64` /
`3,552.27`) and Note 30 decomposes it (I `2,638.96`, II `1,122.54`, FI CP `444.76`, III `235.60`, total `4,441.86`). The
dataset records the **partition** — `SHORT_TERM_BORROWINGS` `4,206.26` and `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`
`235.60` — which adds back to the printed line to the paisa. The total in the short-term row *and* section III filled
would double count ₹235.60 crore; the total with section III blank would deny a figure the note prints. Every component
of the partition is printed. `CURRENT_INVESTMENTS`, `NON_CONTROLLING_INTEREST` and `PREFERENCE_CAPITAL` stay
`NOT_REPORTED`; the `*` on Note 10's single non-current investment ("less than rounding off norms") is a sub-rounding
positive amount and is not converted into a nil; business acceptances (`2,120.74` / `1,507.27`) are a separate line and
not inside borrowings, because Note 30's total excludes them.

**Outcome: everything computable was computed, and the bridge refused on the side that had never been tested.**
datasetVersion `sha256:0df73ead…`, `issues.json` `[]`, three periods × 37 reported + 6 derived items, Industrials measured
**`G2_PARTIAL`** — the first `G2_PARTIAL` in the programme — with statement coverage **100 %**, operating-metric coverage
**0 %**, `DCF_FCFF` and `EV_EBITDA` usable and `EV_REVENUE` `WITHHELD` (`MANDATORY_METRIC_MISSING: IN_BOOK_TO_BILL`);
adequacy `SUFFICIENT` (required-field coverage 100 %); assessment `SUFFICIENT` / `MATERIAL_CONCERNS`; confidence
**0.3199** (data 0.70, model 0.0833, caps `STALE_DATA`, `DILUTION_PROXY`, `POLICY_DEFAULT_WACC`); reportKey
`15b68ca5…`, payloadDigest `4f89f0ec…`, reportId `85809cbd-…`, chain valid, head v1, second generate run
`UNCHANGED (no write)`, and a separate-process readback whose recomputed digest equals the stored digest and the chain
head. **`grossDebt` is `PRESENT` at ₹5,377.76 crore — the first time in this programme that a real filing closes the
debt side of the bridge** — while `netDebt` is `MISSING` / `NOT_REPORTED`. `DCF_FCFF` therefore computes an enterprise
value (FCFF base 9,184,155,840 at WACC 10.68 %, g 4.00 %) and refuses every per-share leg (*"enterprise-to-equity
conversion blocked by netDebt"*); `EV_EBITDA` is `CAPITAL_STRUCTURE_INCOMPLETE`; `EV_REVENUE` is withheld for the metric;
`PE_RELATIVE` does not exist in the Industrials matrix at all, so the P/E leg the brief asks for is unsatisfiable by
policy design and no policy was changed to satisfy it. `intrinsic` is `null`; the margin of safety refuses with
`NO_PRICE_OBSERVATION`, no price obtained and none invented. Quality carries `CASH_FLOW_EARNINGS_DIVERGENCE`
(OCF −68 % of profit) and `STALE_STATEMENTS`; risk is `PARTIAL` with `FINANCIAL_LEVERAGE` `NOT_EVALUABLE` because net
debt is unavailable; moat is `INSUFFICIENT_EVIDENCE`; dividends show FCF coverage −5.07 and `netDebtToEbitda`
`NOT_COMPUTABLE`.

**New limitation — `L-039` (`OPEN`). The enterprise-to-equity bridge needs a current-investments line that a balance
sheet need not print.** `cashAndInvestments` is the sum of cash and cash equivalents and current investments, and it
refuses unless both carry a number or a quoted nil. A consolidated balance sheet is under no obligation to print a
current-investments line, so an issuer that reports cash, borrowings, leases *and* current maturities in full can still
have no net debt, no enterprise-to-equity conversion, no enterprise-derived per-share value, no `FINANCIAL_LEVERAGE`
dimension and no `netDebtToEbitda`. This is the mirror of `L-038` on the other side of the same subtraction: WI-7 lost
the debt half, WI-8 loses the cash half, and neither entry subsumes the other. No grammar change is proposed here; the
honest resolutions (a governed "no such line" state distinct from `NOT_REPORTED`, or a printed-footnote basis for
declaring the cash side complete) are decisions for this register's owner.

**`L-040` — `RESOLVED` (corrected 2026-11-07, same day). The sensitivity grid and the DCF evidence claim substituted
zero for unavailable bridge terms; both surfaces are now corrected and regression-guarded.** As found on this run:
`buildSensitivity` evaluated `(EV − (netDebt ?? 0) − (minorityInterest ?? 0) − (preferenceCapital ?? 0) +
(associatesAndJV ?? 0)) / shares`, so on an issuer where every one of those terms is `MISSING` / `NOT_REPORTED`
each `??` substituted zero and the grid's base point read **₹488.34 per share** while the headline per-share was
`NOT_COMPUTABLE`; evidence `EV-DCF_FCFF` at the same time claimed *"DCF_FCFF produced a per-share value from 3
present input(s)"* and declared `supports: …output.perShareMid`, which does not exist. **Root cause:** the grid
re-implemented the enterprise-to-equity bridge inline instead of calling the governed conversion the DCF method's own
per-share leg uses, and the evidence claim was written from the method's applicability rather than from its output —
the D-2 failure mode one level above the dataset, in the pipeline's own arithmetic. **Correction:** the grid now
converts through `equityValueFromEnterprise()` and `perShare()`, so a per-share cell exists only where that governed
conversion could compute one; when it refuses, every cell publishes `value: null`, the grid carries `withheld:
{ presence: NOT_COMPUTABLE, reason, note }` naming the blocking component, and the discounted enterprise value is
retained **per cell as quarantined diagnostic arithmetic** (`enterpriseValue`, rendered as a *"(diagnostic)"* column
and never as a per-share value); the evidence claim now reads *"DCF_FCFF produced no per-share value: NOT_COMPUTABLE
(NOT_REPORTED) — enterprise-to-equity conversion blocked by netDebt"*. Healthy grids serialize in the unchanged
`{ waccBps, growthBps, value }` shape, so **no committed payload digest moved** — the IX authorized-policy artifact
still rebuilds byte-identically. No replacement per-share value was manufactured, and no D-2 semantic, valuation
policy, authorized parameter or unrelated valuation formula changed. The original WI-8 payload stays in the bundle
byte-identical as **superseded, non-authoritative** evidence of the defect; the corrected payload
(`fc50c53e…`, 52,760 bytes) sits beside it with its own run, readback and payload diff. Guarded by
`iips-platform/tests/investment/l040ValuationZeroSubstitution.test.ts` (17 tests) plus the WI-8 bundle guard. The
underlying **`L-039`** is untouched by this correction: the bridge still cannot close for an issuer that prints no
current-investments line, and it still publishes no per-share value when it cannot.

**Statuses after §17.16.** `L-039` is new and **`OPEN`**; `L-040` was opened by this work item and is **`RESOLVED`** by the
valuation-output correction recorded in the entry above (2026-11-07). `L-038` stays **`OPEN`** — the debt half did not
bite here, and this run says nothing about issuers that print a single `Borrowings` line. `L-036` stays **`PARTIALLY
RESOLVED`** (the `REVIEW_DUE` control fires again from 2026-03-31, due 2026-09-27; no filed carrying value exists).
`L-035` and `L-037` stay **`OPEN`**; nothing here tests them. `L-034` stays `RESOLVED`. `L-002` … `L-033` untouched.
`L-001` is **unchanged**: the ingest records "1 of 13 sectors measured" *in this dataset*, a dataset-scoped fact, and the
sector frame still lists Industrials as outstanding because nothing in this work item promotes a sector.

**Boundary this adds.** WI-3 showed what a nil needs, WI-5 that a scoped sentence cannot carry one, WI-6 that an unreadable
filing cannot, WI-6A that an unreadable filing must not be turned into a negative finding either, and WI-7 that a legible
filing can still fail to carry a component the bridge needs. WI-8 adds the fifth shape: **a filing can satisfy one half of
the bridge completely and still fail the other — and the pipeline must publish the half it got, the half it could not get,
and the name of the missing component, rather than netting the two into a number.** It also adds the first evidence that
the pipeline's own arithmetic *did* reach for a zero when the bridge refused — the finding `L-040` recorded, and the
defect the same-day correction removed from the payload rather than footnoted.

**Evidence.** `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/` — `README.md`, `determination-wi8.json`,
`source/source-bytes.json`, `source/page-map.json`, `source/identity-nse-corroboration.json`, fourteen verbatim page
extracts, `ingest-input/` (roster, `periods.csv`, identity sources, `data-extraction.json`), `runs/` (ingest, generate,
idempotency, chain read, readback, findings, commands, guard test, typecheck, clean clone, CI check),
`artifact/assessment-payload-kec-wi8.json` (the original run of record, superseded and non-authoritative),
`artifact/assessment-payload-kec-wi8-l040-corrected.json` with `determination-l040-correction.json` and
`runs/09`–`runs/12` (the L-040 correction run, readback and payload diff), `digests.json` — guarded by
`iips-platform/tests/investment/wi8IndustrialsKec.test.ts` and
`iips-platform/tests/investment/l040ValuationZeroSubstitution.test.ts`. Correction record:
`docs/integration/IIPS_V3_IID_L040_VALUATION_OUTPUT_CORRECTION_2026-11-07.md`. Record:
`docs/integration/IIPS_V3_IID_WI8_INDUSTRIALS_KEC_2026-11-07.md`. The WI-3, WI-5, WI-6, WI-6A, WI-6A-S1, WI-6A-S2 and WI-7
bundles are byte-identical and still verify.

## 17.17 WI-8 / `L-039` — KEC International: the current-investments caption is not printed at all, in any of the three periods (2026-11-07; primary evidence only, no code or dataset change)

**Question.** §17.16 opened `L-039` because the enterprise-to-equity bridge needs a `currentInvestments` amount and KEC's
consolidated balance sheet prints none. §17.16 answered that question from the pages it had already read. The limitation
was not closed, so this work item asked the narrower, harder question the entry left open: **is the caption genuinely
absent from the audited consolidated disclosures, or was it merely unread — and if an amount exists anywhere, in what
form, and does it map to the governed data model without inference?**

**Answer: genuinely absent.** Not "not found in the pages we happened to extract": both reports were converted page by
page and searched as a whole. 421 printed pages (FY2025-26, 215 pages, sha256 `ba638897…c820`, 18,566,481 B; FY2024-25,
206 pages, sha256 `29dfdf83…c1c6`, 14,873,309 B) were tested for `NOTE 10`, `NOTE 17`, `NOTE 18`, `NOTE 19`,
`current investment`, `non-current investment` and `mutual fund`; the hit report is
`evidence/real-issuer/WI8-L039-CASH-SIDE-2026-11-07/source/caption-search-log.txt`. **No page of either report carries a
"current investments" caption.** The `current investment` string occurs only inside Ind AS 107 classification tables,
where it classifies the *non-current* equity investment and the cash and bank balances; the only `mutual fund` hits are
the **shareholding pattern** — mutual funds holding KEC shares, an ownership fact about the issuer and not an asset of it.

**What the statements do print.** The consolidated balance sheet (FY2026: PDF p.117, printed 230–231; FY2025/FY2024:
FY2024-25 report, PDF p.110) presents exactly four current financial-asset captions — trade receivables
`6,474.21 / 5,051.10 / 4,136.62`; cash and cash equivalents `411.26 / 545.69 / 205.10`; bank balances other than (ii)
`100.67 / 110.24 / 68.18`; other financial assets `276.90 / 144.42 / 148.51` — and there is no fifth caption and no
`Loans`. Note 10 (printed 254–255) is headed **"Non-current:"** and contains one unquoted equity holding of 4,900 shares
in the RP Goenka Group Employees Welfare Association, carrying `*` = *"less than rounding off norms adopted by the
Group"*. Note 18 (258–259) itemises the ₹100.67 crore as unpaid-dividend earmarkings `3.06`, three-to-twelve-month bank
deposits `3.20` and margin money / security `94.41`. Note 19 (260–261) itemises sundry deposits `107.53`, interest accrued
on fixed deposits `7.59`, insurance claims `1.25`, marked-to-market forwards and commodity contracts `104.19`,
contractually reimbursable expenses `63.60` and an ECL allowance `(7.26)`. Note 54 (286–287; FY2025 270–271), the Ind AS
107 instrument-level classification of the whole balance sheet, names exactly one investment line — **"Non-current
investment" (`*`)** — and totals cash and bank balances at `511.93` (= `411.26 + 100.67`). The cash-flow statements
(FY2026 p.118, FY2025 p.111) carry capital expenditure, sale-and-leaseback and sale of PPE, and **no investment purchase
or sale line in either year**.

**Mappings considered and refused, each recorded in the bundle:** Note 18 bank balances (a different Schedule III caption
for different instruments; it would import margin money the bridge excludes); Note 10 non-current investments (wrong
caption, non-current, below rounding); Note 19 other financial assets (deposits, accrued interest, insurance claims,
derivatives, reimbursables — no investment instrument); and the two synthetic routes, **`0`** (D-2 and `L-040`: an omitted
caption is `NOT_REPORTED`, never zero) and **`grossDebt − cash` = 49,665,000,000** as a stand-in for net debt (not
published anywhere in the payload; the readback walks every number in it to prove it). **No mapping was applied, no zero
was substituted, and nothing was inferred from totals, prior periods, market data or arithmetic residuals.**

**Outcome: `L-039` stays `OPEN`, unchanged, and nothing else moves.** The re-run used the *same* WI-8 ingest input, the
same `--generated-at` instant and the same governed CLI, so the only possible cause of a difference would have been a code
change and there was none: `datasetVersion` `sha256:0df73ead…82ab` before and after, payload digest `fc50c53e…f370`
before and after (52,760 B, chain length 1, stored equal to recomputed, read back in a separate process),
`grossDebt` `PRESENT` ₹5,377.76 crore, `cashAndCashEquivalents` `PRESENT` ₹411.26 crore, and
`currentInvestments` / `cashAndInvestments` / `netDebt` all `MISSING` / `NOT_REPORTED`. Every dependent output stays
withheld exactly as §17.16 recorded: `intrinsic` `null`; the `DCF_FCFF` per-share leg `NOT_COMPUTABLE` (*"enterprise-to-
equity conversion blocked by netDebt"*) while its enterprise value stands at 9,184,155,840; the sensitivity grid withheld;
`EV_EBITDA` `CAPITAL_STRUCTURE_INCOMPLETE`; `EV_REVENUE` `MANDATORY_METRIC_MISSING: IN_BOOK_TO_BILL`; `FINANCIAL_LEVERAGE`
`NOT_EVALUABLE`; `netDebtToEbitda` `NOT_COMPUTABLE`; margin of safety `NO_PRICE_OBSERVATION`. The WI-8 payload
(`4f89f0ec…`), the `L-040` corrected payload and every earlier bundle are byte-untouched.

**One behavioural finding, recorded and not acted on.** The two governed aggregations treat a declared nil differently:
`grossDebtOf` counts a component the filer declared nil as zero and names it in a note under the capital-structure
aggregation contract, while `sum` — which builds `cashAndInvestments` from cash and current investments — returns the nil
itself, so `cashAndInvestments` and `netDebt` become `NIL_BY_DISCLOSURE`. A filer that states "no current investments" in
its own words therefore still gets no net debt. That is the same family of over-refusal as `L-039`, and accepting a
declared nil as zero on the cash side is a **register-owner decision about the cash-aggregation contract**, not an
evidence question, so it is **not** taken here and no aggregation code was touched. The guard test pins the present
behaviour so that any future change has to be deliberate. It does not affect KEC: KEC declares nothing, so its
`currentInvestments` is `NOT_REPORTED`, not nil.

**What would close `L-039`.** (i) a filing that prints the caption with an amount — the ordinary route and the only one
that is purely evidentiary; (ii) a filing that declares the caption nil in its own words *together with* the cash-side
decision above; or (iii) a register-owner decision to add a governed "the balance sheet presents no such caption" state
distinct from `NOT_REPORTED`, which is a D-2 grammar decision this work item deliberately does not take. Until one of
those happens the honest output is the one already published: gross debt printed, the cash side refused, the blocking
component named, and no number invented.

**Verification.** The bundle `evidence/real-issuer/WI8-L039-CASH-SIDE-2026-11-07/` carries the eleven page extracts with
per-page provenance (`source/`, `page-map.json`, `source-bytes.json`), the re-ingest and re-generate transcripts
(`runs/01`, `runs/02`), the separate-process readback (`runs/03-readback.json`), the suite transcripts (`runs/04`,
`runs/05`, `runs/06`), the machine-readable determination (`determination-l039.json`) and a 22-file `digests.json`. The
guard `iips-platform/tests/investment/l039CashSideEvidence.test.ts` passes 18/18 and fails if any of the above claims
stops being true — including a control page with the caption absent (the bridge refuses) against the same fixture with
the caption present (the bridge closes), so the gate is the evidence rather than the code. The full investment suite
passes **654/654** in 151 suites and `tsc --noEmit` is clean. Local tests are reported separately from CI; the run ids of
the path-filtered `CAP-03` check are cited in the pull-request receipt, and no npm, frontend or IPD run is claimed.

**Statuses after §17.17.** `L-039` remains **`OPEN`** — this entry narrows it from "no caption was found" to "no caption
is printed, the absence was searched for exhaustively across 421 pages, and no existing governed state can honestly say
so". `L-040` stays **`RESOLVED`**, `L-036` **`PARTIALLY RESOLVED`**, `L-038`/`L-035`/`L-037` **`OPEN`**, `L-034`
**`RESOLVED`**, `L-002`…`L-033` and `L-001` untouched. No limitation status, meaning or criterion was redefined, and D-2
and IX policy were not modified.

**Boundary this adds.** WI-3 taught what a nil needs, WI-5 that a scoped sentence cannot carry one, WI-6 that an
unreadable filing cannot, WI-6A that an unreadable filing must not become a negative finding, WI-7 that a legible filing
can fail the debt half, and WI-8 that it can fail the cash half after closing the debt half. This work item adds the
seventh shape: **an absence can itself be established as a fact — exhaustively, with the captions that were looked for and
the ones that were found — and still not be a number.** The register gains no new state and no borrowed total: it gains a
searched, hashed, reproducible record that the caption does not exist, which is what any future owner decision about
`L-039` should be argued from.

## 17.18 WI-7 / `L-038` — Marico re-read: one component closes, a second blocker appears, and the debt side still refuses (2026-11-07; primary evidence + governed run, no contract change)

**Question.** `L-038` was opened at §17.15 on the finding that Marico's consolidated balance sheet prints one current
`Borrowings` line, a dash in the non-current row and no current-maturity row. That finding rested on pages read for the
WI-7 balance sheet and Note 13(a). This work item asked a narrower question that the earlier pass did not: does the
*complete* set of audited consolidated disclosures across FY2024, FY2023 and FY2022 support a period-aligned breakdown of
the four components the governed bridge requires — and if one caption was missed rather than absent, does recovering it
close the bridge?

**What was re-read, and what it found.** Two captions were missed. Note 13(a) **does** carry a current-maturities
caption — *"I. Within one year (Current maturities of long term debt)"* — on PDF p.191 of the FY2023-24 report and p.149 of
the FY2022-23 report; the FY2023 amount is `0` (printed zero, PDF p.150), and FY2024 and FY2022 print dashes. A printed
zero is a qualifying disclosure and maps; a dash still does not. So exactly **one** cell moved: `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`
is `PRESENT 0 @ 2023-03-31` where WI-7 had `MISSING`. That is a genuine, if narrow, correction to §17.15: the caption
existed, and the earlier search did not reach the page that prints it. It does **not** close `L-038`, because the component
set is only complete at one period end: the FY2024 balance sheet prints current borrowings `383` and a non-current dash,
and the FY2022 column prints the same shape from the FY2023 balance sheet. All four components are simultaneously
available **only** at 2023-03-31, and the FY2024 cash figure is not from that date. `grossDebtOf()`'s same-`periodEnd` rule
therefore yields **`NOT_COMPUTABLE` / `PERIOD_MISMATCH`** — not a number, and not a zero.

**Two things the re-read refused, deliberately.** First, the FY2023-24 report prints 528 crore of *total* borrowings nowhere;
across all 229 numbers walked, neither 528 (a gross-debt figure that would sum the FY2024 components across periods) nor 41
(the residual a net-debt figure would need) occurs. Second, and more consequential, **preference capital is a second,
independent blocker.** Note 12(a) does print a preference class — *Preference shares of ₹10/- each 7 / 65* — but only under
*I Authorised share capital*. *II Issued, subscribed and paid-up* prints equity shares only (1,29,41,01,828 shares, total
`129 / 129`) with **no preference row and no dash**. Reading zero out of "the issued total equals the equity line" would be
an inference from a total, which D-2 forbids; nothing in words declares preference capital nil. `PREFERENCE_CAPITAL` stays
`NOT_REPORTED`, so even a debt side at one date would still meet `MISSING: NOT_REPORTED` in the enterprise-to-equity step.
`L-038`'s remedy is therefore not a single component but two.

**A net-debt figure exists in the filing, and it is a different measure.** The FY2022-23 report defines one in terms:
*"Net financial debt is defined as current and non current borrowings"* (Note 29 Capital Management, consolidated, PDF
p.163). It is **borrowing-only**: it subtracts no cash and carries no leases, so it is not the governed net debt and was not
used. Only the ratio row survives that page's layout extraction (`Net debt to equity ratio 0.12 / 0.10`); the amounts —
`Net debt 59 / 95`, `Total equity 3,677 / 3,049`, ratio `0.02 / 0.03` — are printed in the **company** statements' version of
the same note (PDF p.209), a different reporting entity, and were shipped for context only. The FY2023-24 report carries the
string on no page. Multiplying the consolidated ratio by consolidated equity would *imply* ≈475 crore for FY2023; it is
recorded as an observation and used nowhere. This is worth stating precisely because §17.15's recommendation of an *optional
"total borrowings as filed" component* names exactly this measure: the filing already prints one, and the reason it is not in
the dataset is that adopting it is a contract decision, not an evidence question.

**Outcome: `L-038` stays `OPEN`, with the evidence narrowed to two named blockers.** datasetVersion moves
`sha256:04c96303…` → `sha256:433358f3…` on a one-cell correction (`ingest-input/corrections.json` carries the single cell and
its provenance); the payload is a **superseding** artifact, `1a873047…6d59` (54,705 bytes — byte-length identical to WI-7's
`3fd27a98…2343`, because only the debt-side values and their diagnostics moved), and **WI-7's payload and bundle are
byte-identical and still verify**. Before → after: `grossDebt` `MISSING`/`NOT_REPORTED` → `NOT_COMPUTABLE`/`PERIOD_MISMATCH`;
`netDebt` `NOT_REPORTED` → `NOT_COMPUTABLE`; `currentMaturities` `MISSING` → `PRESENT 0 @ 2023-03-31`; `cashAndInvestments`
unchanged at 4,870,000,000; the DCF's enterprise value still computes and every per-share leg is still withheld; `EV_EBITDA`
still `CAPITAL_STRUCTURE_INCOMPLETE`; the sensitivity grid degrades from nine published values (₹107.95–₹187.23) to nine
`null`s carrying `enterpriseValue` diagnostics and `withheld`; the P/E band is unchanged at **₹181.69 / ₹227.11 / ₹272.54**.
Leverage stays `NOT_EVALUABLE`. No number was manufactured anywhere in the chain, and no aggregation code, policy constant,
zero-substitution or persistence mechanism was touched — `capitalStructure.ts` is byte-identical.

**`L-040` is not disturbed, and its finding reaches this bundle.** WI-7's published grid had used the pre-correction
`NCI = 0` substitution (`(185,191,832,952 − 0) / 1,295,713,036 ≈ 142.93`). The corrected code publishes no per-share cell
at all, so the WI-7 grid is now superseded for that second reason as well as the debt one. `L-040` stays **`RESOLVED`**;
`determination-wi7.json` records both supersession reasons and the payload bytes are untouched.

**A contract question this raises, recorded and left undecided — not `L-039`.** The one period at which the component set is
complete is 2023-03-31. Two honest readings follow, and neither is taken here: (a) compute the bridge on that period end and
label it, or (b) keep refusing, as the governed rule does now. Choosing (a) would be a silent change to period-alignment
semantics, which the contract forbids without authority; the governed code chooses (b), and the register records the
alternative as the open question **`DEBT-COMPONENT-PERIOD-ALIGNMENT`** (`UNDECIDED`, undecided-by-design). This is
**distinct** from `L-039`, which is a cash-side nil-propagation question on a different issuer: `L-039`'s finding is not
modified here, and nothing in this work item constrains it.

**The arithmetic behind that hypothetical, corrected on review.** An earlier revision of this section wrote "gross debt
608 crore and net debt −177 crore against that date's cash" without printing the cash figure, which reads as an
inconsistency against the **₹487 crore** the payload publishes for `cashAndInvestments`. It is not an inconsistency, but
the sentence was incomplete and is corrected here; every figure is recomputed in
`runs/10-net-debt-reconciliation.txt` from `ingest-input/data-extraction.json` and the payload. At **2023-03-31** gross
debt is **608 crore** (2 long-term + 473 current + 0 current maturities + 133 leases) and cash plus current investments is
**785 crore** (207 + 578) — a figure the earlier revision never stated — so net debt is 608 − 785 = **−177 crore** at that
same instant. The payload's **487 crore** is `228 + 259` at **2024-03-31**: subtracting it from the 2023 gross debt gives
**+121 crore**, which is not a net-debt figure at any date. The report, the tracker and `determination-l038.json` now carry
both dates and all four amounts.

**A distinct finding that check exposes — `CASH-SIDE-PERIOD-ALIGNMENT`, `UNDECIDED`.** `capitalStructure.ts` applies the
same-instant rule among the four *debt* components only (`grossDebtOf`, line 121); the cash side is
`sum([cash, currentInvestments])` (line 224) and `netDebt = subtract(grossDebt, cashAndInvestments)` (line 225) with no
comparison of the cash periods against the debt periods. Marico never reaches that path, because `grossDebt` is blocked and
`subtract()` returns the blocked minuend — which is why the payload's refusal is honest and why the −177 crore figure is a
hypothetical rather than a governed output. But it means option (a) as originally worded would publish **+121 crore**, the
2024 cash side against the 2023 debt side: relaxing the debt rule alone would create the cross-period arithmetic this
entry refuses. Nothing is decided or changed here — no code, no policy, no dataset value — and the finding is **distinct**
from `L-039`'s nil propagation, which is untouched.

**Statuses after §17.18.** `L-038` stays **`OPEN`** — the completion standard ("resolve only if the required debt components
are supported and the governed calculation chain is verified") is unmet on two independent components, and the entry now
names both. `L-039` is **unchanged**, `L-040` stays **`RESOLVED`**, `L-035` stays **`OPEN`**, `L-036` stays **`PARTIALLY
RESOLVED`**, `L-037` stays **`OPEN`**, `L-034` stays **`RESOLVED`**, `L-001` and `L-002` … `L-033` untouched. No new
limitation identifier was consumed.

**Boundary this adds.** §17.17 established that an absence can be a fact. This work item adds the correction that has to
accompany it: **a search that reports an absence is only as good as its captions, and a caption found late is a finding
about the search, not about the issuer.** One of §17.15's two "missing" components was present all along; recovering it
closed nothing, because a second blocker was sitting behind it, and the honest output of a re-read is sometimes a better
description of the refusal rather than the number that was hoped for.

**Evidence.** `evidence/real-issuer/WI7-L038-DEBT-COMPLETENESS-2026-11-07/` — `README.md`, `determination-l038.json`,
`source/` (nine verbatim page extracts with provenance, `page-map.json`, `fetch-log.txt`, `caption-search-log.txt`,
`source-bytes.json`), `ingest-input/` (the single corrected cell and its corrections manifest), `runs/` (01 ingest, 02
generate, 03 readback, 04 payload diff, 05 tests, 06 typecheck, 07 post-manifest verification, 08 clean clone, 09
reproduction, 10 net-debt reconciliation, `commands.txt`),
`artifact/assessment-payload-marico-l038.json`, `digests.json` (30 files) — guarded by
`iips-platform/tests/investment/l038MaricoDebtCompleteness.test.ts` (26 tests). The WI-7 bundle is untouched and its guard
still passes; the WI-3, WI-5, WI-6, WI-6A, WI-6A-S1, WI-6A-S2, WI-8 and WI-8/`L-039` bundles are byte-identical and still
verify.
