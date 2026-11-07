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
