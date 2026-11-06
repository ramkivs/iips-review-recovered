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
