# IIPS v3.0 — IID Implementation Roadmap

**Investment Intelligence & Decision Support Expansion — IID-01 / IID-02 / IID-03**

| Field | Value |
|---|---|
| Record type | Implementation roadmap (design-closure deliverable) |
| Date | 2026-11-05 |
| Repository | `ramkivs/iips-review-recovered` (IRR) |
| Baseline | `c40b7139ea364673fe2d3dea2ee8f85b8a9bc123` |
| Design of record | `docs/integration/IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md` — Part I (architecture) + **Part II (corrections R-1 … R-17, probe record, decision register)** |
| Evidence | `evidence/iid/Q1-NP04-COMPATIBILITY-PROBE-2026-11-05/` |
| Scope | single-user, local, decision-support only. No production concept, no admission step, **no trade execution** |
| Status | roadmap only — no IID functionality is implemented by this document |

---

## 0. What this roadmap assumes

Part II of the design of record settled the open questions. This roadmap is built on those settled
answers and does not restate the architecture:

- **D-1 accepted** — XBRL-first ingestion with CSV as a first-class fallback; no vendor dependency in
  v1; sector-usable coverage is *measured* (R-16) rather than assumed, and methods whose mandatory
  inputs are absent are withheld, not approximated.
- **Q-1 answered by execution** — non-portfolio scope tokens are supported by the pinned NP-04
  artifact; the F2 surrogate approach is not needed. Eight checks recorded in the evidence bundle.
- **R-1 … R-17 applied** — identity is three-level (issuer / security / listing), the financial-period
  contract is explicit, dispositions are scope-split (`HELD` vs `CANDIDATE`), the change comparator
  reports the *observed* delta with separate categorical treatment, and boundary explanations are
  recoverable by reconciliation rather than best-effort hope.

Three facts from the probe shape the implementation order and are used below rather than rediscovered:

| Probe finding | Roadmap consequence |
|---|---|
| NP-04 accepts any non-empty scope token, including whitespace | IRR validates tokens (format + closed prefix set) before any write — IID-3 task 2 |
| NP-04 permits duplicate content and no-op appends | Idempotency is composer-side — IID-3 task 4 |
| NP-04 permits scope drift inside a chain; `validateArtifactChain` rejects it | Chain validation runs on write **and** read — IID-3 tasks 2 and 6 |

---

## 1. Phase map

> **Revision 3 (2026-11-05).** This part is the phase map as originally written. Nine corrections —
> identity, method-level enablement, operating-metric ingestion, NP-04 injection, listing identity and
> corporate actions, reproduction inputs, boundary states, limits/instrument scope, and the split of IID-0
> exit criteria from R-16 coverage — were accepted and are appended as **PART B** at the end of this
> document. **PART B wins on any conflict.**

IDs are stable, but **two phases swap relative to the design refinement's first sequence**, and the
reason is dependency-driven, not cosmetic:

| ID | Phase | Outcome | Size | Owner |
|---|---|---|---|---|
| **IID-0** | Foundations & qualification | Contracts, fixtures, dataset v0, ingestion path, coverage measurement. Unknowns closed. | M | IRR |
| **IID-1** | Identity & coverage | Every holding resolves to an issuer/security or is refused with a named state. | M | IRR |
| **IID-2** | Company assessment (IID-01) | Honest, evidence-backed fundamentals + valuation + risk for a resolved issuer. | L | IRR |
| **IID-3** | Persistence, read transport, thin slice | Assessments durably versioned and readable. **★ M-1** | M | IRR (port) / IPD (store) |
| **IID-4** | Holding disposition (IID-02) | RETAIN / ACCUMULATE / REDUCE / AVOID (and candidate verbs) with rationale and portfolio context. | L | IRR |
| **IID-5** | Change intelligence (IID-03) | What changed between versions, why, and whether it warrants review. **★ M-2** | L | IRR |
| **IID-6** | Product surface | Full UI: assessment, disposition, change timeline, coverage. **★ M-3** | M | IRR |

**Why persistence (IID-3) moved ahead of disposition (old IID-3 → new IID-4).** In the original
sequence nothing could be persisted until *two* engines were finished, so no part of the product
existed until most of the work was done, and the NP-04 integration risk sat unretired behind a large
engine build. Moving persistence and a thin read slice ahead of the disposition engine:

- delivers the first genuine end-to-end capability (§4, M-1) after three phases instead of five, so the
  user has something defensible to use well before the disposition and change engines exist;
- retires the only cross-repository integration risk early, now that its behaviour is known;
- lets the disposition engine be developed against *stored* assessments, which is how it will actually
  run — not against in-memory fixtures only.

Old→new ID mapping for cross-reading with the design refinement: old **IID-2** = new IID-2;
old **IID-3** = new **IID-4**; old **IID-4** = new **IID-3**; IID-5 and IID-6 unchanged (the thin
read slice of old IID-6 now ships inside IID-3).

### 1.1 Dependency graph

```
IID-0 ──► IID-1 ──► IID-2 ──► IID-3 ──★M-1──► IID-4 ──► IID-5 ──★M-2──► IID-6 ──★M-3
  │                                     │                    ▲
  └── coverage exercise (R-16) ─────────┴────────────────────┘
      (gates per-sector enablement, not the phase)
```

Strictly sequential on the critical path; only three things may run in parallel, and all three are
outside it: the R-16 coverage exercise (IID-0, operator-paced), operating-metric entry (IID-2, by
sector), and UI scaffolding against fixtures (IID-6, from IID-3 onward).

### 1.2 Per-sector enablement ladder

Because sector operating metrics are the constraint (R-3, R-16), sectors come online independently.
No phase is blocked by a sector being unavailable.

| Stage | Sectors | Why first |
|---|---|---|
| **G1 — statement-derivable** | Technology, Consumer, Industrials, Materials, Utilities (partly), Auto | Every mandatory method input is computable from P&L / BS / CF |
| **G2 — partial operating metrics** | Energy (reserves optional), Utilities (RAB operator-entered), Healthcare, Hospitality | Some methods withhold; usable output still results |
| **G3 — operating-metric-dependent** | Banking, Insurance, Capital Markets, Telecom | Primary methods need NIM/GNPA, EV/VNB, AUM flows, ARPU; these arrive via operator entry or vendor |

---

## 2. Phase specifications

Each phase below is specified against the same twelve attributes so it can be executed and accepted
without further interpretation.

---

### IID-0 — Foundations & qualification

> **Status (2026-11-05): IMPLEMENTED and evidenced.** Exit criteria were revised to E-0.1 … E-0.11 by
> Revision 3 and all pass; see **§B.J** for the criteria, the delivered file layout and
> `evidence/iid/IID-0-FOUNDATIONS-2026-11-05/`. The criterion set below is the pre-Revision-3 draft and is
> superseded by §B.J where the two differ. R-16 sector coverage (C-16.x) remains open — it is **not** part
> of IID-0.

**Outcome.** The contracts, fixtures, dataset path and unknown-closing evidence exist, so that no
later phase has to invent a data shape or discover a blocker mid-build.

**Functionality delivered.**
1. `contracts/` module: `Observation<T>`, presence/`MissingReason` vocabularies, branded `IssuerId` /
   `SecurityId` / `ListingId` / `PositionKey`, closed `DispositionVerb` unions, invariant validators
   INV-1 … INV-6.
2. Financial-period contract types (R-2) and the closed line-item table with per-item sign and
   duration — types only, no computation.
3. `FundamentalsReadPort` + fail-closed boundary + a local snapshot store reading
   `${IIPS_DATA_DIR}/investment/`.
4. Ingestion tool v0: **file-in only** (XBRL/CSV → normalised periods + manifest). No HTTP client to
   any exchange host.
5. Dataset v0: 3 reference issuers × 5 annual + 8 quarterly periods, deliberately including one
   restatement, one missing mandatory field, one merged/demerged issuer.
6. R-16 coverage report: 13 sectors × 2 issuers × 5 years sample, with per-sector tag coverage and a
   `coverage-report.json`.
7. Q-1 probe evidence (already produced) filed under `evidence/iid/`.

**Ownership.** IRR. Every item is either a pure contract, a local file reader, or measurement. IPD
ownership of ingestion is the *target* state (R-3 migration note); starting there would make IID-0 a
cross-repository change for no immediate benefit.

**Reuse.** `LiveDataRuntime` `DataSnapshot`/`DataSourceMeta` vocabulary; `pitReadPort` /
`pitReadBoundary` / `nonProductionPitStore` pattern; `canonical.ts` canonicalization for digests;
`persistence-service.ts` `IIPS_DATA_DIR` resolution; existing `.gitignore` entry for `.iips-data/`.

**New contracts.** The four contract modules above; `FundamentalsSnapshot` (same field set as
`DataSnapshot`, its own type); `Manifest` with `contentDigest` separated from `lastImportAt` (R-7).

**Dependencies and order.** Nothing blocks it. Probe (0.7) is already done; coverage (0.6) is
operator-paced and is the only item that may outlive the phase — see exit conditions.

**Data sources and persistence.** Operator-supplied XBRL/CSV files only. No persistence writes: the
dataset is files plus a checksummed manifest under the gitignored local data domain. Fixtures
committed under `fixtures/` are tiny (<100 KB each) and synthetic or public-domain extracts.

**Tasks (executable order).**
1. Create `iips-platform/src/investment/contracts/` with types, vocabularies and id parsers/validators.
2. Write `invariants.ts` + property-style tests over generated payloads (INV-1 … INV-6).
3. Define the closed line-item table (`lineItems.ts`): ~40 items with `duration | instant`, sign
   convention, unit and required statements. This is the reference every other phase reads.
4. Implement `fundamentalsReadPort.ts` (contract), `fundamentalsBoundary.ts` (fail-closed resolver),
   `localFundamentalsStore.ts` (manifest-guarded reader; rejects a dataset whose recomputed digest
   does not match the manifest).
5. Implement ingestion v0: XBRL/CSV parse → normalise → write `normalized/periods/*.json` + index +
   manifest. Assert at module level that no exchange host string exists.
6. Build dataset v0 for 3 issuers, including the deliberate defects.
7. Run the R-16 coverage exercise and publish `docs/integration/` report + `coverage-report.json`.
8. Record the Q-1 evidence pointer in the design of record (already done in Part II).

**Tests and acceptance criteria.**

| ID | Criterion |
|---|---|
| AC-0.1 | INV-1 … INV-6 each have a test that fails when violated, and a positive case that passes. |
| AC-0.2 | `parseIssuerId` / `parseSecurityId` / `parseListingId` reject the sector-reference forms (`Banking-H1` …) with a distinct error code, and reject malformed ISIN (bad Luhn) and structurally invalid CIN. |
| AC-0.3 | The line-item table is total: every item used anywhere in the codebase appears in it, asserted by a test that scans normalised fixtures. |
| AC-0.4 | Local store refuses a dataset whose recomputed `contentDigest` ≠ manifest digest (tamper test), and refuses a missing manifest. |
| AC-0.5 | Re-running ingestion on byte-identical inputs produces an **identical** `datasetVersion` and a changed `lastImportAt` (R-7). |
| AC-0.6 | Ingestion module graph contains no `http`/`https` import and no `nseindia.com` / `bseindia.com` string. |
| AC-0.7 | Coverage report exists for ≥4 of 13 sectors with per-line-item coverage percentages; the JSON validates against its own schema. |

**User-visible result.** None yet — and that is correct. Verifiable by: `npm test` in
`iips-platform` and `frontend`, plus the published coverage report.

**Independence.** Fully independent. Not blocked by anything; blocks IID-1.

---

### IID-1 — Identity & coverage

**Status: implemented and evidenced — see §B.J2** (Part B is authoritative; §B.J2 records the actual
acceptance-criteria results, coverage counts and limits).

**Outcome.** For every security the user holds or watches, either a defensible issuer+security
binding exists, or the item is refused with a named, displayable state. No silent substitution, ever.

**Functionality delivered.**
1. Three-level identity (R-1): issuer keyed on CIN with equity-ISIN fallback (`issuerKeyBasis`
   recorded); security keyed on ISIN; listing keyed on exchange+symbol with effective dates.
2. Multiple securities per issuer; `securityClass` gate (`EQUITY` assessable in v1).
3. Resolution ladder with `RESOLVED | AMBIGUOUS | UNMATCHED | INELIGIBLE | OUT_OF_SCOPE_SECURITY |
   STALE_REFERENCE | REJECTED_MALFORMED_ISIN | ISSUER_KEY_CONFLICT`.
4. Corporate-action table + application (split/bonus adjustment, merger re-keying, demerger
   distribution, symbol change, delisting).
5. Coverage computation over read-only G3 holdings, broker-import preview rows and the watchlist.
6. `CompanyIdentityBinding` record emission, referencing listing-map and CA-table versions.

**Ownership.** IRR. Identity *resolution against an IRR-curated eligible roster* is IRR logic; IPD's
D05/`companyId` is consumed as a lookup hint only (D05 is 52 real / 2,198 synthetic rows with no
per-row eligibility discriminator, so it cannot be the analysis universe).

**Reuse.** `G2HoldingView` (symbol, isin, exchange, quantity, marketValue, weightPercentage,
`identityStatus`, `resolutionDisposition`) via the existing read-only IPD IPC path; broker-import
preview types; `G2_UNRESOLVED_WRITE_MESSAGE` semantics; `userPortfolioContract.ts` validation style.

**New contracts.** `IssuerId`/`SecurityId`/`ListingId` branding (from IID-0), `CompanyIdentityBinding`,
`CorporateAction`, `eligible-roster.json` + `listing-map.json` schemas.

**Dependencies and order.** Needs IID-0 contracts. Nothing else. Can proceed in parallel with IID-0
task 6 onward once contracts land.

**Data sources and persistence.** Read-only holdings (G3/broker preview); operator-maintained roster,
listing map and CA table as versioned files in the local data domain with digests. No writes to IPD,
no writes to NP-04.

**Tasks.**
1. ISIN validation (format + Luhn) and CIN structural validation; `ISSUER_KEY_CONFLICT` when a CIN and
   an equity-ISIN disagree about the same security.
2. Roster + listing-map loaders with digest verification and `effectiveFrom`/`effectiveTo` windows.
3. Resolver implementing the ladder; pure function of `(observation, listingMapVersion, caTableVersion, asOf)`.
4. Corporate-action application layer (adjustment factors; merger/demerger re-keying).
5. Coverage service: classify every holding/preview/watchlist row; emit counts by state.
6. Read-only coverage endpoint + minimal coverage view (list + counts, no numbers for unresolved rows).

**Tests and acceptance criteria.**

| ID | Criterion |
|---|---|
| AC-1.1 | All sector-reference forms are rejected as identity input. |
| AC-1.2 | ISIN Luhn rejects single-character corruption; no ISIN→symbol fallback on a miss. |
| AC-1.3 | Two active issuers sharing a symbol ⇒ `AMBIGUOUS`, `issuerId: null`, no assessment producible. |
| AC-1.4 | Symbol matched only outside its effective window ⇒ `STALE_REFERENCE`. |
| AC-1.5 | CIN/equity-ISIN disagreement ⇒ `ISSUER_KEY_CONFLICT`, not a silent pick. |
| AC-1.6 | One issuer with equity + preference securities yields two security bindings under one issuer; only equity is assessable. |
| AC-1.7 | Demerger with one unmapped successor leaves that slice `AMBIGUOUS` while mapped slices resolve; measured weight + unmeasured weight reconcile. |
| AC-1.8 | Split adjustment preserves per-share consistency within 0.01 % across the boundary. |
| AC-1.9 | Resolution is byte-deterministic across 100 shuffled input orderings. |
| AC-1.10 | No resolved binding can be produced from a name match (asserted by construction: no name field is read by the resolver). |

**User-visible result.** A **Coverage** view: "12 holdings assessed · 2 unresolved · 1 out-of-scope
security", with each unresolved row showing its state and the raw observation — no invented numbers.
Verified by loading a portfolio containing deliberately-broken rows.

**Independence.** Blocked by IID-0 (contracts only). Blocks IID-2.

---

### IID-2 — Company assessment (IID-01)

**Outcome.** For a resolved issuer, a defensible, evidence-backed assessment with explicit gaps —
fundamentals, valuation range, margin of safety, debt and cash-flow position, dividend sustainability,
moat, risk and confidence — with every missing input named rather than zeroed.

**Functionality delivered.**
1. Period normalisation under the R-2 contract: consolidated/standalone, annual/quarterly/TTM,
   duration vs instant, YTD vs discrete, currency/units/scaling, sign conventions, restatement basis,
   taxonomy and `normalizationVersion`.
2. Derived-metric computation (statement-derivable only) with `SOURCE_CONFLICT_UNRESOLVED` handling.
3. Completeness and quality gates → `adequacy ∈ {SUFFICIENT, PARTIAL, INSUFFICIENT}` with fired-gate list.
4. Sector method matrix (R-5 classification, multi-segment/SOTP rules) with per-method `applicable`
   and mandatory-input declarations; methods with a missing mandatory input withhold (R-3).
5. Valuation contracts per method family (R-4): net debt, leases, minority interest, preference
   capital, diluted share count, per-share conversion, formula/version ids, assumption records.
6. Intrinsic range, margin of safety with price alignment (R-6), sensitivity grid.
7. Dividend sustainability with corporate-actions primary + cash-flow corroboration and reported
   conflicts (R-15).
8. Moat evidence set and classification; risk taxonomy factors; confidence with named caps;
   deterministic explanation templates.

**Ownership.** IRR. Pure analysis over an immutable snapshot — no IPD data is fetched at analysis
time, so no cross-repository change is needed even after ingestion ownership migrates.

**Reuse.** `LiveDataRuntime` snapshot semantics; the 13 sector engines' metric vocabularies and
constraint patterns (`*Input` field names, `CAP_RANK` downward-cap precedence) without modifying any
engine file; `canonical.ts` for payload canonicalization; PIT read port for prices.

**New contracts.** `CompanyAssessmentPayload` (Part I §3.4 as corrected by R-2/R-3/R-4/R-5/R-6/R-15),
`FinancialPeriod`, `OperatingMetricObservation`, `ValuationMethodResult`, `MethodPolicy`.

**Dependencies and order.** Needs IID-1 (issuer identity) and IID-0 (contracts, dataset, port).
G2 sectors unblock first (per §1.2); G3 sectors produce `intrinsic: null` until their operating
metrics exist — which is a correct result, not a failure.

**Data sources and persistence.** Local fundamentals dataset (read-only), PIT or dataset EOD prices
with explicit provenance, operator-entered operating metrics with source refs. No persistence writes
in this phase: the engine returns a payload; serialisation is IID-3.

**Tasks.**
1. `normalize/periods.ts`: period algebra (annual/quarterly/TTM, YTD→discrete with checks, instant vs
   duration, FY labelling, non-March FYE), unit conversion with recorded `scaleApplied`.
2. `normalize/derived.ts`: the derived metrics whose definitions are deterministic from statements.
3. `completeness.ts` / `quality.ts`: adequacy gates and quality flags.
4. `valuation/policy.ts` + `sectorMethodMatrix.ts`: per-sector considered/applicable methods with
   `mandatoryMetrics[]`, per R-5 and §A2 of Part I.
5. `valuation/capitalStructure.ts`: net debt, lease treatment (IND AS 116 with pre-116 flagging),
   minority interest, preference capital, diluted share count and per-share guards.
6. `valuation/methods.ts`: one implementation per method family in §A2, each emitting formula id,
   version, inputs with presence, and its own assumptions.
7. `valuation/intrinsic.ts` + `sensitivity.ts`: declared-weight blend, spread, grid, INV-5 suppression.
8. `dividends/sustainability.ts` with reconciliation block (R-15).
9. `moat/` + `risk/` + `assessment/confidence.ts` + `assessment/explain.ts`.
10. `assessment/CompanyAssessmentEngine.ts`: assembles the payload; validates invariants before returning.
11. Golden assessments for the 3 reference issuers, including the restated and the incomplete one.

**Tests and acceptance criteria.**

| ID | Criterion |
|---|---|
| AC-2.1 | A missing mandatory input yields a withheld method with a named `MissingReason`; no method ever substitutes 0 or a previous period's value. |
| AC-2.2 | Consolidated and standalone series are never mixed in one derived metric; the chosen scope is recorded per period and in the payload. |
| AC-2.3 | YTD→discrete derivation is accepted only when the check passes; otherwise `MISSING: DERIVATION_NOT_SUPPORTED`. |
| AC-2.4 | Every per-share output is withheld when the share-count period mismatches the numerator period. |
| AC-2.5 | A bank assessment contains no `DCF_FCFF` result and states the reason; a technology assessment with missing `NRR` withholds the subsegment method that requires it. |
| AC-2.6 | Net debt excludes restricted cash and includes lease liabilities; the pre-116 comparative flag appears when a comparative predates IND AS 116. |
| AC-2.7 | Sensitivity is monotone: WACC↑ ⇒ value↓, terminal growth↑ ⇒ value↑ within the declared domain. |
| AC-2.8 | Moat `WIDE` requires ≥3 consecutive positive ROIC−WACC years **and** ≥2 independent dimensions. |
| AC-2.9 | Dividend verdict requires the corroboration block; a divergent corporate-action vs cash-flow figure raises `DIVIDEND_SOURCE_CONFLICT` and both values remain visible. |
| AC-2.10 | MoS is withheld when the price is older than the policy window or predates `knownAsOf`; a split-affected price without an applied factor is refused, not adjusted silently. |
| AC-2.11 | Byte-identical payload for identical inputs across 3 dataset orderings and 3 process restarts. |
| AC-2.12 | Every `evidence[]` entry is referenced by ≥1 field path, and that path resolves. |

**User-visible result.** A company assessment page (read-only, may be fixture-backed until IID-3):
identity banner, adequacy badge, 5-year and quarterly tables with explicit gaps, valuation range with
sensitivity, MoS band, dividend sustainability, moat evidence, risk factors, and a sector-reference
disclosure block that is visibly separate. Verified against the 3 golden issuers plus one
intentionally-incomplete issuer.

**Independence.** Blocked by IID-0 and IID-1. Blocks IID-3.

---

### IID-3 — Persistence, read transport, thin slice (★ M-1)

**Outcome.** Assessments are durably versioned through NP-04 and readable through a GET-only surface;
the first complete user-facing capability exists.

**Functionality delivered.**
1. `assessmentComposition.ts`: payload → canonical `ReportContent` via existing `composition.ts`;
   flat `parameters` carrying the discriminating digests (so `reportKey` is input-sensitive).
2. Scope-token validation (IRR-side, since NP-04 accepts anything non-empty) and closed `reportType`
   vocabulary.
3. `generate-investment-artifacts.ts` operator CLI: read snapshot → assess → append/`UNCHANGED`.
4. Composer-enforced idempotency (NP-04 does not suppress no-op appends).
5. `investment-transport.ts`: GET/HEAD only, fail-closed 503, sanitized failures, chain validation on read.
6. `api/investment.ts` read-only client with a closed failure vocabulary.
7. Thin assessment view wired to the transport (no write affordances).

**Ownership.** IRR owns composition, CLI, transport and validation. IPD owns the store — IRR receives a
`ReportsPersistencePort` by injection and constructs nothing.

**Reuse.** `composition.ts`, `artifact.ts` (`validateArtifact`, `validateArtifactChain`), `persistence.ts`
(including `toCanonicalArtifact`, which the probe proved is required), `persistence-port.ts`,
`np04-adapter.ts`, `reports-transport.ts` patterns, `noAuthFetch`, `ReportDetail` version-list pattern.

**New contracts.** `ScopeToken`, `ReportTypeRegistry` (the closed set: `investment.company-assessment`,
`investment.holding-disposition`, `investment.change-report`), `ArtifactEnvelope` read model.

**Dependencies and order.** Needs IID-2 payloads. First phase to touch NP-04 — deliberately as early as
possible so the integration is retired while the codebase is small.

**Data sources and persistence.** NP-04 governed store for artifacts (append-only); local dataset for
inputs. Owner pair from the existing owner-context mechanism; IRR derives nothing.

**Tasks.**
1. `ScopeToken` validation: `^[a-z]{2,4}:[A-Za-z0-9:+._/-]{1,120}$` plus closed prefix set
   (`co:`, `hd:`, `hc:`, `icr:`); reject whitespace-only.
2. `assessmentComposition.ts` reusing `composeReportContent`; parameters carry `issuerId`, `sector`,
   `dataAsOf`, `knownAsOf`, `datasetVersion`, `contentDigest`, `modelVersion`, `policyVersion`,
   `inputDigest`, `adequacy`.
3. `generate-investment-artifacts.ts`: per issuer, compose → validate → compare with head → `UNCHANGED`
   or `createInstance`/`appendVersion` → write a machine-readable run summary.
4. Idempotency rule + `UNCHANGED` result type.
5. `investment-transport.ts`: `GET /api/investment/company/:issuerId`,
   `GET /api/investment/company/:issuerId/versions/:reportId`, `GET /api/investment/coverage`;
   each read runs `validateArtifactChain` before responding.
6. `frontend/src/api/investment.ts` + thin `SecurityIntelligence` view (assessment + version list only).
7. Operator runbook note in `docs/OPERATOR_RUNBOOK.md` style: how to ingest, assess, read.

**Tests and acceptance criteria.**

| ID | Criterion |
|---|---|
| AC-3.1 | Scope tokens: valid forms accepted, whitespace/invalid rejected before any store call. |
| AC-3.2 | Three appended versions form a contiguous chain; `validateArtifactChain` passes; a deliberately drifted chain (scope changed mid-chain) is rejected on **read**. |
| AC-3.3 | Re-running with an unchanged dataset produces zero new versions and returns `UNCHANGED` (AC-P2). |
| AC-3.4 | A stored version's `canonicalPayload` is byte-identical after two further appends. |
| AC-3.5 | No store construction in the module graph; no SQLite import; port is injected (AC-P4). |
| AC-3.6 | With the NP-04 package unresolvable, every investment route answers 503 with a static message and no substitute store. |
| AC-3.7 | No mutating method exists on any investment route (route-table assertion). |
| AC-3.8 | No partition literal, owner pair, path, SQL text or stack trace in any response or DOM node. |

**User-visible result (★ M-1).** Open `/investment/company/IN:CIN:…` (or by ISIN fallback key) and see:
the assessment, its adequacy, its evidence, its gaps, and a version list with `dataAsOf`/`knownAsOf`/
`modelVersion` per version — all read from the durable store. Verified by: assess issuer A, change one
stored input, re-run, observe version 2 while version 1 is unchanged and still readable.

**Independence.** Blocked by IID-2 (needs a payload). Blocks IID-4, IID-5, IID-6.

---

### IID-4 — Holding disposition (IID-02)

**Outcome.** Every assessable position carries a defensible investment assessment — RETAIN /
ACCUMULATE / REDUCE / AVOID for held positions, INITIATE / WATCH / AVOID_CANDIDATE for candidates —
with traceable rationale, explicit falsifiers, limits checked, and no execution path.

**Functionality delivered.**
1. Corrected subject model (R-8): `HELD` (position-backed) vs `CANDIDATE` (no position, no fabricated
   holding), with separate chain scopes `hd:` and `hc:`.
2. Per-verb evidence thresholds (R-9), including the explicit rule that no exposure-increasing verb may
   rest on `PARTIAL` evidence, and that `WATCH` is the designated candidate state for `PARTIAL`.
3. Limits policy (R-11): versioned, dated, single-name and sector caps with recorded basis; projected
   weight/sector exposure checked for ACCUMULATE/INITIATE.
4. Portfolio context: weight, issuer exposure across securities, sector exposure, concentration band,
   correlation flags — with a labelled sector-reference block that cannot drive the verb.
5. Rationale + counter-arguments + falsifiers, each with ≥1 evidence id and ≥1 observation ref.
6. `portfolioImplication` (R-10 rename): evidence-implied target weight band, projected exposures,
   explicit "not an instruction" semantics block.
7. Gate outcomes recorded per disposition; withholding with named reasons.

**Ownership.** IRR.

**Reuse.** `CompanyAssessment` artifacts (read); existing portfolio analytics for weights, sector
exposure, concentration and correlation (`PortfolioIntelligenceService`, `DiversificationAnalyzer`,
`CorrelationEngine`, `AllocationEngine`) — consumed, not re-derived; `NormalizedHolding` as labelled
context only.

**New contracts.** `DispositionSubject`, `DispositionPolicy` (verbs, thresholds, hysteresis),
`LimitsPolicy`, `HoldingDispositionPayload` (Part I §3.5 as corrected by R-8/R-9/R-10/R-11).

**Dependencies and order.** Needs IID-3 (stored assessments; the engine reads artifacts, not live
engine output) and IID-1 (resolved holdings). G1 sectors first.

**Data sources and persistence.** Read-only G3 holdings; read-only assessment artifacts; limits policy
file; NP-04 for disposition artifacts (same mechanism as IID-3).

**Tasks.**
1. `disposition/subject.ts`: `DispositionSubject` union; candidate subjects carry
   `quantities: NOT_APPLICABLE` (not zero, not missing).
2. `disposition/limits.ts`: policy load, effective dating, basis recording, projected-weight checks.
3. `disposition/gates.ts`: G-1 … G-6 with the R-9 per-verb matrix.
4. `disposition/verbs.ts`: verb selection, downward-only caps (conservatism order AVOID < REDUCE <
   RETAIN < ACCUMULATE), hysteresis with hard-trigger exception.
5. `disposition/portfolioContext.ts`: adapter over existing analytics; unresolved holdings contribute
   to *unmeasured* weight, never to zero.
6. `disposition/rationale.ts` + `falsifiers.ts`: deterministic templates bound to evidence.
7. `disposition/portfolioImpact.ts` → `portfolioImplication`.
8. `dispositionComposition.ts` + CLI extension; read routes
   `GET /api/investment/portfolio/:portfolioId/dispositions` and `…/holding/:securityId`.

**Tests and acceptance criteria.**

| ID | Criterion |
|---|---|
| AC-4.1 | The R-9 per-verb matrix is a table-driven test of ≥16 cases; each returns the specified verb or a specified withholding. |
| AC-4.2 | A `PARTIAL`-adequacy assessment can never yield ACCUMULATE or INITIATE; it may yield RETAIN, REDUCE, AVOID, or `WATCH` (candidate only). |
| AC-4.3 | A `CANDIDATE` subject has no position key, no quantity, and appears only on `hc:` chains. |
| AC-4.4 | The same assessment at 2 % and at 35 % weight yields different verbs only via named gates (`CAPACITY_SINGLE_NAME` / concentration), with the difference explained in the rationale. |
| AC-4.5 | ACCUMULATE is capped to RETAIN when the projected band's high breaches the single-name cap; INITIATE is capped to WATCH when it breaches the sector cap. |
| AC-4.6 | Every disposition carries ≥1 rationale with ≥1 evidence id and ≥1 observation ref, and ≥1 falsifier. |
| AC-4.7 | A schema test asserts no order-shaped key (`order|quantity|side|tif|broker|execution|price` outside observed-position fields). |
| AC-4.8 | AVOID's payload states the interpretation explicitly (`INVESTMENT_ASSESSMENT`, `notAnInstruction`), and `impliedTargetWeightBand` is labelled evidence-implied. |
| AC-4.9 | Limits policy version, effective date and the caps actually applied are recorded in every disposition. |
| AC-4.10 | Unresolved holdings are absent from the disposition set and counted as unmeasured weight in the portfolio summary. |

**User-visible result.** On a portfolio, each holding shows a verb, confidence, rationale, falsifiers
and portfolio implication; the header shows limits in force and unmeasured weight. Verified with a
fixture portfolio spanning G1 and G3 sectors, including one unresolved and one out-of-scope security.

**Independence.** Blocked by IID-3. Blocks IID-5 (change comparator needs both payload types).

---

### IID-5 — Change intelligence (IID-03) (★ M-2 with IID-4)

**Outcome.** Every successive version explains what changed, why, and whether it warrants review —
distinguishing fundamentals from price, data correction from performance, and model change from both.

**Functionality delivered.**
1. Eight-category taxonomy including `IDENTITY_MAPPING`; declared dimension map with type
   (`ADDITIVE | ORDINAL | NOMINAL`) and materiality thresholds.
2. `observed` is the real delta between the two stored versions (R-13); attribution is a separate,
   additive-verified block; categories with no meaningful arithmetic are reported categorically.
3. 2×2 attribution with a **reproduction pre-check** (R-12): if the stored version cannot be reproduced
   from its recorded model/build + dataset, attribution is `UNAVAILABLE` and causes are `UNATTRIBUTED`.
4. Reproducibility metadata in every artifact (model version, build digest, platform commit, dependency
   pins, runtime range, config/policy digest, dataset version).
5. Materiality policy, review triggers and priority.
6. Boundary reports at version boundaries **plus** derived gap detection and a reconciliation command
   (R-14) — no assessment can exist without a recoverable explanation, and gaps are visible not silent.
7. Ephemeral comparisons for arbitrary version ranges (never persisted).

**Ownership.** IRR.

**Reuse.** Stored artifacts via the existing port; `validateArtifactChain`; `ReportDetail`'s version
selection pattern; `canonicalizePayload` for reproduction digests.

**New contracts.** `ChangeItem` (numeric) and `CategoricalChangeItem`, `AttributionBlock`,
`MaterialityPolicy`, `ReproductionRecord`, `ChangeReportPayload` (Part I §3.6 as corrected by R-12/R-13/R-14).

**Dependencies and order.** Needs IID-3 (stored versions) and IID-4 (disposition payloads) for the
`DISPOSITION` category. Assessment-only change reports can be built before IID-4 completes — the
`DISPOSITION` category simply has no items until then.

**Data sources and persistence.** Stored artifacts only, plus the recorded dataset version for the
attribution legs. Boundary reports persisted on `icr:` chains; ephemeral reports never persisted.

**Tasks.**
1. `change/dimensionMap.ts`: dimension paths, types, units, thresholds, equivalence classes.
2. `change/compare.ts`: semantic comparison; categorical handling; presence transitions as first-class items.
3. `change/reproduce.ts`: reproduce `v_old` from its recorded model+build+dataset; digest compare.
4. `change/attribute.ts`: 2×2 with additivity verification and degradation.
5. `change/materiality.ts` + `change/review.ts`.
6. `changeComposition.ts`: boundary reports on append; `EPHEMERAL` projections for ranges.
7. `reconcile-boundaries.ts` CLI: scan chains, find unexplained versions, generate
   `VERSION_BOUNDARY_RECONSTRUCTED` reports where the original model is unavailable.
8. Read routes: `/changes?from=&to=` and `boundaryCoverage` in the assessment read model.

**Tests and acceptance criteria.**

| ID | Criterion |
|---|---|
| AC-5.1 | One fixture per category yields exactly that category's items: `FUNDAMENTAL`, `MARKET_VALUATION`, `RISK_QUALITY`, `DISPOSITION`, `PORTFOLIO`, `DATA_CORRECTION_RESTATEMENT`, `MODEL`, `IDENTITY_MAPPING`. |
| AC-5.2 | `observed` equals `to.value − from.value` for additive dimensions, computed from payloads, independent of attribution. |
| AC-5.3 | When attribution is computable, `dataEffect + modelEffect + interaction = observed` within 1e-9; when not additive, `attribution.additive: false`. |
| AC-5.4 | A model-version bump with identical data ⇒ `MODEL` only; a restated prior period ⇒ `DATA_CORRECTION_RESTATEMENT` only. |
| AC-5.5 | Categorical changes carry no numeric attribution; ordinal ones carry direction from the declared scale, nominal ones report `INDETERMINATE`. |
| AC-5.6 | Reproduction mismatch (`v_old` not reproducible) ⇒ `attribution.status: 'UNAVAILABLE'`, `cause: 'UNATTRIBUTED'`, reason recorded. |
| AC-5.7 | Serialisation-only or key-order-only differences produce zero semantic items. |
| AC-5.8 | Boundary coverage: after N appends, `boundaryCoverage` reports N−1 explained boundaries; after deleting* a boundary from a scratch DB and running reconcile, coverage returns to N−1 — *scratch DB only, since NP-04 forbids delete. In practice: simulate a failed boundary append by injecting a comparator error, then reconcile. |
| AC-5.9 | An assessment is never lost because its boundary failed: the assessment version exists, coverage reports the gap, and reconcile fills it with a `RECONSTRUCTED` boundary. |
| AC-5.10 | Changing the source dataset after versions are stored does not change a reported diff of those versions (AC-H7). |
| AC-5.11 | Ephemeral comparisons are never persisted and carry no `reportId`. |

**User-visible result (★ M-2, with IID-4).** A change timeline per holding/company: version pairs with
their clocks and model versions side by side, items grouped by category, materiality badges, review
flags and focus questions — and a visible "explanation missing for version 3 — run reconcile" state
when applicable.

**Independence.** Partially parallel with IID-4 (assessment-only categories first); the `DISPOSITION`
category and M-2 complete after IID-4.

---

### IID-6 — Product surface

**Outcome.** The three capabilities are usable together, in one coherent, honest interface.

**Functionality delivered.**
1. `/investment/company/:issuerId`: full assessment surface (valuation + sensitivity, dividend,
   moat evidence, risk taxonomy, assumptions, confidence components).
2. Disposition panel with rationale, falsifiers, limits in force, portfolio implication.
3. Change timeline + version comparison (with categorical/numeric rendering differences).
4. Coverage panel: unresolved/ambiguous/ineligible/stale/out-of-scope, dataset freshness, boundary coverage.
5. Candidate flow: assess a non-held security, WATCH/INITIATE, with no fabricated position.
6. Portfolio integration: per-holding disposition entry point from `UserPortfolioDetail`.
7. Sector-reference disclosure block (C-2) linking to the existing `/research/company/:id`.
8. Degraded-state and absent-value affordances throughout; keyboard/a11y pass.

**Ownership.** IRR.

**Reuse.** `AppShell` routing, `ReportsWorkspace`/`ReportDetail` patterns, sanitized shell state
components, existing chart/decision components, `noAuthFetch`.

**New contracts.** None — read models already exist. UI-only view models.

**Dependencies and order.** Needs IID-3 (thin slice, already wired); the rest can be built against
fixtures in parallel with IID-4/IID-5 and connected as their routes land. Do not defer all UI to the end.

**Data sources and persistence.** Read-only transport only.

**Tasks.**
1. Promote the thin slice into the full assessment surface.
2. Disposition panel + candidate panel.
3. Change timeline with category grouping and materiality rendering.
4. Coverage panel + freshness/boundary-coverage display.
5. Portfolio detail integration.
6. Absent-value and degraded-state pass; a11y and keyboard pass.
7. Route table + navigation entry; `/investment/coverage`.

**Tests and acceptance criteria.**

| ID | Criterion |
|---|---|
| AC-6.1 | No write affordance on any investment surface (AC-U1). |
| AC-6.2 | Every degraded state renders a static sanitized message with no fabricated number (AC-U2). |
| AC-6.3 | Absent values render as "not available — <reason>", never `0`, `-`, or an ambiguous dash (AC-U4). |
| AC-6.4 | Sector-reference values appear only in the labelled disclosure block, with no visual hierarchy implying company analysis (AC-U3). |
| AC-6.5 | The change timeline always shows both versions' `dataAsOf` / `knownAsOf` / model version (AC-U5). |
| AC-6.6 | Direction and materiality are not encoded by colour alone (AC-U6). |
| AC-6.7 | A candidate assessment is reachable without a portfolio and never displays a fabricated position. |

**User-visible result (★ M-3).** The complete workflow: portfolio → holding → company →
fundamentals → valuation → risk → disposition → portfolio implication → change history, all read-only.

**Independence.** Blocked by IID-3 for the first slice; remaining panels track IID-4/IID-5.

---

## 3. Cross-phase gates

Applies to every phase; a phase is not accepted while any of these fails.

| ID | Gate |
|---|---|
| AC-X1 | `npm test` (frontend, `iips-platform`) green; `npm run typecheck` clean. |
| AC-X2 | Zero sockets opened during a full ingest-free assess → persist → read cycle. |
| AC-X3 | No new dependency without a recorded pin; no exchange-domain dependency. |
| AC-X4 | No modification to any file under `iips-platform/src/sector-engines/` (diff assertion). |
| AC-X5 | No new persistence store, no SQLite import outside IPD, no second artifact store. |
| AC-X6 | Dataset and artifacts external to git; committed fixtures each <100 KB. |
| AC-X7 | Every artifact written in a phase passes `validateArtifact` + `validateArtifactChain` on write and on read. |

---

## 4. Milestones

### M-1 — "One company, honestly assessed, durably versioned" (end of IID-3)

The earliest genuinely useful end-to-end capability. Delivers **IID-01** for a real issuer, end to end,
with no disposition and no change engine yet.

Demonstrable capability: run one ingestion, one assessment command, open one page; see fundamentals with
their gaps, a valuation range and margin of safety where the evidence supports it, the risk and dividend
picture, the evidence chain, and a durable version list. Then change one stored input, re-run, and see
version 2 with version 1 intact and readable.

Why here: it exercises contracts → identity → analysis → persistence → read for real, which is where the
integration risk lives; and it produces something the user can rely on before the two larger engines exist.

### M-2 — "Every holding has a defensible view, and every version explains itself" (end of IID-5)

Delivers **IID-02** and **IID-03** as backends. Demonstrable via routes/CLI plus the thin UI: each
resolved holding carries a verb with rationale and limits; each version pair carries a categorised change
report with review flags.

### M-3 — "The product" (end of IID-6)

Full surface, coverage panel, candidate flow, portfolio integration.

---

## 5. Delivery mechanics

- One branch (`arena/08238a84-iips-review-recovered` in this session), one phase per commit series;
  each commit states the phase ID and the ACs it satisfies.
- Evidence per phase under `evidence/iid/<phase>/`: test output summary, plus any probe or report JSON.
- The design of record is amended by *appending* a correction section when implementation reveals a
  contract error — never by silently changing a settled contract mid-phase.
- The coverage report (R-16) is refreshed whenever a new sector is enabled, and the per-sector stage in
  §1.2 is updated with it.

---

## 6. Out of scope (unchanged)

No trade execution, order sizing, brokerage integration or execution API. No production deployment,
admission step or enterprise governance layer. No multi-user/auth. No tax/charges/goals-based overlay
(v1). No IPO-screening dependency. No modification of frozen sector engines. No second persistence store.
No vendor dependency required for v1.

---

# PART B — Revision 3 amendments (authoritative)

**Appended 2026-11-05.** Part A above (phases IID-0 … IID-6, gates, milestones) remains the phase map.
Part B corrects it in the nine places raised in review. **Where Part A and Part B differ, Part B wins.**
Nothing in Part B adds a phase, a repository, a service, a dependency or an approval step.

**Status of this roadmap.** IID-0 and IID-1 are **implemented and evidenced** (§B.J, §B.J2). IID-2 … IID-6
are **not started**. The R-16 sector-coverage deliverable is **not** part of IID-0 or IID-1 and remains
open (§B.K).

## B.0 Reading order

| If you need… | Read |
|---|---|
| what changed in the phases | §B.A … §B.I (one review finding each) |
| whether IID-0 is done | §B.J (E-0.1 … E-0.11 with evidence) |
| whether IID-1 is done | §B.J2 (AC-1.1 … AC-1.10 with evidence) |
| what is still outstanding | §B.K (C-16.1 … C-16.5) and §B.L |
| the reasoning behind a correction | design of record, Part III §A … §I |

## B.A Artifact-chain and version identity (corrects the identity mechanics of IID-3 and IID-5)

Four identities are now required and must not collapse into one:

| Identity | What it identifies | Held by | Stable across versions? |
|---|---|---|---|
| chain | one subject under one report type (issuer + report type + scope / portfolio + security) | `reportKey` → NP-04 `chainId` | **yes, invariant** |
| version | one immutable assessment of that chain | NP-04 `reportId`, `artifactVersion`, `supersedesReportId` | no |
| content | the canonical payload | `payloadDigest` | no |
| input | every input that produced it | `inputDigest` | no |

Behaviour is closed:

| Situation | Action |
|---|---|
| recomputation yields an identical `payloadDigest` | `UNCHANGED` — no new version |
| `payloadDigest` differs | `appendVersion`, **carrying the same `reportKey`** |
| `inputDigest` differs but `payloadDigest` is identical | `UNCHANGED` + `INPUT_CHANGED_CONTENT_IDENTICAL` |
| different subject or report type | `createInstance` (a new chain) |

`parameters` is a closed, stable-only set (`subjectKey`, `issuerId`, `sector` / `portfolioId`,
`securityId` / `subjectKind`). Dates, digests, versions, adequacy and the verb are **excluded** — if they
were included, every reassessment would mint a new chain and the chain would stop being a chain.
Idempotency is decided on `payloadDigest`, never on `reportKey` or on a timestamp.

*A roadmap consequence:* IID-3's persistence tasks gain a `reportKey`-stability test and an
`UNCHANGED` short-circuit; IID-5's change intelligence compares payloads within one chain and never
reasons across chains.

## B.B Method-level enablement (corrects the per-sector ladder, §1.2 of Part A)

**Sector staging enables a sector for measurement. It never asserts that every method in that sector is
usable.** Each method carries its own state:

```
methodAvailability[] { methodId, state: AVAILABLE | WITHHELD,
                       reason?: MANDATORY_METRIC_MISSING | METRIC_UNVALIDATED | STATEMENT_INPUT_MISSING
                              | SEGMENT_DATA_INSUFFICIENT | POLICY_NEEDS_OPERATOR_INPUT | SECTOR_PROVISIONAL,
                       missing[] }
```

A sector in which every method is withheld is `PROVISIONAL` with `intrinsic: null` — reported, never
silently omitted. The staged ladder (G1 → G2 → G3) is unchanged as a rollout order; it no longer implies
completeness for any sector.

**Implemented in IID-0** as `coverage/methodMatrix.ts` (38 method declarations across 13 sectors, each
listing its mandatory statement items and mandatory metrics separately) and `coverage/measure.ts`
(per-method availability, closed withheld reasons, `missing[]`).

## B.C Operating-metric ingestion v1 (extends IID-0 item 4 and IID-1)

Operating metrics are supplied as a structured file — `operating-metrics.csv` — with one observation per
row and a fixed column set:

```
issuer_id, metric_id, value, unit, period_end, statement_scope, source_class, source_ref,
observed_at, entered_at, note
```

- `source_class ∈ { COMPUTED_FROM_STATEMENTS, OPERATOR_ENTERED, VENDOR }`; the two non-computed classes
  **require** a `source_ref` (a row without one is rejected).
- `metric_id` is closed (33 ids in IID-0, `contracts/operatingMetrics.ts`); an unknown id is an error,
  not a dropped row.
- Validation: unit match, per-metric range, cross-field consistency (GNPA ≥ NNPA, CAR ≥ CET1,
  RevPAR ≈ ADR × occupancy within 5%). A failing observation becomes `METRIC_UNVALIDATED` with its value
  withheld; **only the metrics implicated in the violation** are withheld, so a clean neighbour is not
  punished for its neighbour's error.
- Two observations of the same metric/period/scope with different values are **both retained**, marked
  `SOURCE_CONFLICT_UNRESOLVED`, and excluded from gating. Nothing is silently overwritten.
- Reproducibility: the metric file's bytes are inside `contentDigest`; the records are inside
  `operatingMetricDigest`; each record carries `observedAt`, `enteredAt` and `sourceRef`.
- **No vendor dependency, no network I/O.** Operator transcription from a filing or a presentation is a
  first-class, attributed source.

## B.D NP-04 runtime injection (constrains IID-3; changes no ownership boundary)

The composition point already exists and is reused rather than rebuilt:

| Concern | Existing artefact | IID obligation |
|---|---|---|
| port contract | `frontend/server/reports/persistence-port.ts` (`ReportsPersistencePort`, five operations) | consume as-is |
| adapter | `frontend/server/reports/np04-adapter.ts` (`adaptNp04Store`, `resolveAuthoritativeNp04Port()`) | resolve, never re-implement |
| composition | `frontend/server/reports/composition.ts` (`loadAuthoritativeNp04Persistence()`) | the single injection point |
| transports | `frontend/server/reports-transport.ts`, CLI `persist-real-reports.ts` pattern | both use the same port |
| failure mode | `{ available: false, reason, boundary }` → HTTP 503 | fail closed; no fallback store |

IRR **must not** construct persistence, open SQLite, or import the NP-04 package directly. If the adapter
cannot load, the degraded state is reported with its reason; the assessment code never degrades to a
weaker store. IID-0 touches none of this.

## B.E Listing identity and corporate actions (extends IID-0 item 1 and IID-1)

Listing identity is a four-part key, never a two-part one:

```
IN:<EXCHANGE>:<SYMBOL>:<SERIES>:<INSTRUMENT>      e.g. IN:NSE:INFY:EQ:EQUITY
```

Two-part forms (`IN:NSE:INFY`) are rejected as `INCOMPLETE_LISTING_ID`, because defaulting series or
instrument class would let an equity and its preference shares resolve to one listing. Overlapping
effective windows for one key raise `AMBIGUOUS_LISTING`.

Corporate actions are a closed set that includes the per-share-affecting events review asked for:
`SPLIT, BONUS, CONSOLIDATION, RIGHTS, BUYBACK_TENDER, BUYBACK_OPEN_MARKET, MERGER, DEMERGER,
SYMBOL_CHANGE, NAME_CHANGE, DELISTING, PREFERENCE_REDEMPTION, CAPITAL_REDUCTION`. Each carries
`perShareComparable` and, where applicable, `adjustmentFactor` + `factorBasis`. A boundary with
`perShareComparable: false` and no factor means per-share series are **not comparable** across it: the
consumer reports `NOT_COMPARABLE`, never a performance change. A missing factor is a reported warning, not
a zero.

## B.F Reproduction across every input (corrects IID-5's reproduction scope)

Reproduction covers inputs, not just code:

| Component | Digest / field |
|---|---|
| identity mappings | `identityMappingDigest` |
| corporate-action table and factors applied | `corporateActionTableDigest` + `appliedActions[]` |
| sector classification and segment allocation | `classificationDigest` |
| price observations and their provenance | dataset `contentDigest` + source refs |
| operating-metric observations | `operatingMetricDigest` |
| normalisation and taxonomy mapping | `taxonomyMapDigest` + `normalizationVersion` |
| valuation, disposition, limits, materiality, freshness policies | `valuationPolicyDigest`, `dispositionPolicyDigest`, `limitsPolicyDigest`, `materialityPolicyDigest`, `freshnessPolicyDigest` |
| engine | `modelVersion`, `modelBuildDigest`, `platformCommit`, `dependencyPins`, `runtime` |

Reproduction result ∈ `EXACT | MISMATCH | UNAVAILABLE`. Only `EXACT` permits attribution in IID-03's
change explanation; `MISMATCH` reports a divergence, and `UNAVAILABLE` reports that it could not be
attempted. Attribution is never inferred from timing or from a partial match.

## B.G Boundary reconciliation states (corrects IID-4 / IID-5 reconciliation)

Four closed states, each with a distinct meaning:

| State | Meaning | Guarantee |
|---|---|---|
| `EXPLAINED` | a corporate action or a recorded event accounts for the change | attributable at ingestion time |
| `RECONSTRUCTED` | the explanation was derived afterwards by `reconcile-boundaries` and is labelled as such | never presented as contemporaneous |
| `UNATTRIBUTED` | only the observed deltas are known | no cause is invented |
| `UNAVAILABLE` | explanation could not be attempted (missing action table, missing price history) | an explicit gap, never an empty timeline |

An assessment is persisted **before** reconciliation runs, so a failed explanation can never lose the
assessment. Gaps stay visible through `boundaryCoverage.missing[]` and can be resolved later without
rewriting history.

## B.H Limits policy and instrument scope (corrects IID-2 / IID-6 presentation)

- Policy defaults are **system defaults**, not the user's investment preferences. Every assessment exposes
  `limitsApplied { policyVersion, basis: SYSTEM_DEFAULT | OPERATOR_CONFIG }`.
- Configuration path (when the operator wants it): `${IIPS_DATA_DIR}/investment/policies/limits-policy.json`.
  Absent file ⇒ system defaults, disclosed as such. No settings UI is required by this roadmap.
- Instrument scope is disclosed per security: listed equity **assessable** (SME listed equity
  assessable-but-thin); preference shares, debentures, ETFs, mutual-fund units, REIT/InvIT units,
  warrants and rights entitlements `OUT_OF_SCOPE_SECURITY`; unlisted `INELIGIBLE (NOT_LISTED)`; foreign
  issuers `NON_INDIAN_ISSUER_OUT_OF_V1`. An out-of-scope instrument is named as such in the dataset
  (`SecurityRecord.status`), never dropped silently and never assessed by proxy.

## B.I Acceptance criteria and test efficiency

**I.1 IID-0 exit criteria are separate from the R-16 coverage deliverable.** E-0.x (§B.J) qualify the
foundations; C-16.x (§B.K) qualify 13-sector coverage. Completing IID-0 does not complete R-16, and the
roadmap no longer implies it does.

**I.2 Local file writes are permitted in IID-0.** The dataset is operator files plus a checksummed
manifest under the gitignored local data domain. Artefact persistence starts at IID-3 with NP-04; no
Reports-local store is created at any point.

**I.3 AC-X2 is "zero external network connections", loopback distinguished.** No outbound connection of any
kind is required by IID-0 (the CLI is file-in/file-out). Loopback to a locally-started process is not an
external connection and is not what AC-X2 forbids; a connection to any non-loopback host is.

**I.4 Three data classes, kept apart.**

| Class | Where | Committed? |
|---|---|---|
| user data and artefacts | `${IIPS_DATA_DIR}/investment/**` | no — gitignored (`.iips-data/`) |
| small synthetic fixtures | `iips-platform/tests/investment/fixtures/` (<100 KB total) | yes |
| sanitized test evidence | `evidence/iid/**` | yes |

**I.5 Targeted per-phase tests; integration at milestones.** Each phase runs its own targeted tests plus
`tsc --noEmit`; broad suites run at M-1 … M-3, not on every change. No phase re-runs another phase's
acceptance suite as a substitute for its own.

**I.6 Insufficient evidence cannot produce an unsupported positive *or negative* conclusion.**
`adequacy = INSUFFICIENT` ⇒ no verb, no `AVOID`, no `AVOID_CANDIDATE`; a withheld valuation forbids any
price-versus-value claim; `AVOID` requires a positively evidenced disqualifier (an as-filed fact), never
mere absence; a `PARTIAL` candidate yields `WATCH`. Enforced by `CONCL-1` / `CONCL-2`
(`contracts/invariants.ts`) and tested.

## B.J IID-0 — revised exit criteria and actual status

| ID | Criterion | Status | Evidence |
|---|---|---|---|
| E-0.1 | Identity contracts: branded ids, sector-reference rejection with a distinct code, ISIN Luhn, CIN structure, four-part listing key | **PASS** | `tests/investment/contracts.test.ts` |
| E-0.2 | Observation contract: missing is `null` + closed reason, never zero; imputation needs method + assumption ref | **PASS** | `contracts.test.ts` |
| E-0.3 | INV-1 … INV-6 and CONCL-1/CONCL-2 validators, gate that withholds and names its unmet inputs | **PASS** | `contracts.test.ts` |
| E-0.4 | Closed line-item table (52 items) + closed derivation set; derived items rejected if filed | **PASS** | `contracts.test.ts`, `ingestion.test.ts` |
| E-0.5 | Period contract: scope, scale (per-share never scaled), YTD → discrete, TTM refusal | **PASS** | `contracts.test.ts` |
| E-0.6 | File-in ingestion v0 (CSV + XBRL): unmapped tags counted, duration discipline, unknown ids rejected, conflicts retained | **PASS** | `ingestion.test.ts` |
| E-0.7 | `FundamentalsReadPort` + fail-closed resolution + read-only local snapshot + tamper detection | **PASS** | `boundary.test.ts` |
| E-0.8 | Deterministic dataset identity: `datasetVersion == contentDigest`, clock- and order-independent | **PASS** | `dataset-identity.test.ts`, `cli.test.ts` |
| E-0.9 | Coverage foundation: 13 sectors reported, completed vs outstanding separated, per-method availability | **PASS** | `coverage.test.ts`, `coverage-report.json` |
| E-0.10 | Constraints as tests: no network, no SQLite, no NP-04/Reports/sector-engine import from `src/investment` | **PASS** | `constraints.test.ts` |
| E-0.11 | No regression in an existing frozen-vocabulary consumer | **PASS** | `np12-sector-reference-population.test.ts` 42/42 |

**Executed:** `tsc --noEmit` exit 0; **91/91** targeted IID-0 tests pass; **42/42** NP-12 regression tests
pass. Evidence: `evidence/iid/IID-0-FOUNDATIONS-2026-11-05/`.

**Delivered code (branch `arena/08238a84-iips-review-recovered`):**

```
iips-platform/src/investment/
  contracts/     ids.ts observation.ts invariants.ts disposition.ts lineItems.ts period.ts
                 operatingMetrics.ts index.ts
  fundamentals/  canonical.ts types.ts manifest.ts derive.ts errors.ts
  ingestion/     csv.ts xml.ts xbrl.ts builder.ts writer.ts
  port/          fundamentalsReadPort.ts localSnapshotStore.ts
  coverage/      methodMatrix.ts measure.ts
  cli/           ingest.ts
```

**Known limits of IID-0, stated rather than implied:** the XBRL tag map covers 20 tags and the derivation
set 8 items — both are deliberately small and closed, and unmapped tags are counted so the gap is visible;
the reference dataset is synthetic; nothing here produces an assessment, a valuation or a disposition.

## B.J2 IID-1 — acceptance criteria and actual status

**Implemented 2026-11-05** on branch `arena/08238a84-iips-review-recovered`, on top of IID-0. Evidence:
`evidence/iid/IID-1-IDENTITY-COVERAGE-2026-11-05/` (report JSON, rendered view, summary, test logs).

| ID | Criterion | Status | Evidence |
|---|---|---|---|
| AC-1.1 | All sector-reference forms rejected as identity input | **PASS** | `identity-resolver.test.ts` (`Banking-H1`, `Technology-H3`, `Capital Markets-R2`, `Utilities-REF12`, sector reference in any position) |
| AC-1.2 | ISIN Luhn rejects single-character corruption; no ISIN→symbol fallback on a miss | **PASS** | `identity-resolver.test.ts` (exhaustive position × substitution sweep, none resolves; structural vs checksum failure distinguished; unknown-but-valid ISIN never falls back to a resolvable symbol) |
| AC-1.3 | Two active issuers sharing a symbol ⇒ `AMBIGUOUS`, `issuerId: null`, no assessment | **PASS** | `identity-resolver.test.ts`; row H-04 |
| AC-1.4 | Symbol matched only outside its effective window ⇒ `STALE_REFERENCE` | **PASS** | `identity-resolver.test.ts`; rows H-06, W-06; date-driven re-resolution |
| AC-1.5 | CIN/equity-ISIN disagreement ⇒ `ISSUER_KEY_CONFLICT`, never a silent pick | **PASS** | `identity-resolver.test.ts`; row H-03 |
| AC-1.6 | One issuer with equity + preference ⇒ two bindings, only equity assessable | **PASS** | `identity-resolver.test.ts`; rows W-01 / W-02 |
| AC-1.7 | Demerger with an unmapped successor: that slice unresolved while mapped slices resolve; measured + unmeasured weight reconcile | **PASS** | `identity-corporate-actions.test.ts`; `CA-BODHI-DEMERGER-2025` (0.6 measured / 0.4 unmeasured) |
| AC-1.8 | Split adjustment preserves per-share consistency within 0.01 % | **PASS** | `identity-corporate-actions.test.ts` (price **and** per-share earnings; an unadjusted split is caught) |
| AC-1.9 | Byte-deterministic across 100 shuffled input orderings | **PASS** | `identity-coverage.test.ts` (100 shuffles byte-identical; reversed roster/listing-map orderings identical) |
| AC-1.10 | No resolved binding from a name match | **PASS** | `identity-resolver.test.ts` (resolver reads no name field; an exact name match with a wrong identifier stays unresolved) |
| Rev-3 §E | `AMBIGUOUS_LISTING` for one listing carrying several securities | **PASS** | `identity-resolver.test.ts`; row B-04 |
| Rev-3 | Corporate-action extensions (symbol change, delisting, rights, buybacks, bonus, consolidation) and versioned CA data | **PASS** | `identity-sources.test.ts`, `identity-corporate-actions.test.ts` |

**Coverage measured on the synthetic reference set at `asOf 2026-11-05`:** 18 observed rows — 4 resolved,
9 unresolved, 6 holdings in scope, 1 out-of-scope security, 4 ineligible; per source HOLDING 6/2/4/2,
BROKER_PREVIEW 4/1/3/1, WATCHLIST 8/1/7/1 (observed/resolved/unresolved/assessable). State sum equals
observed. Every unresolved row carries a state, a reason code and display text, and the raw observation.

**Executed:** `tsc --noEmit` exit 0; **195/195** investment tests (104 IID-1 + 91 IID-0 re-run);
**42/42** NP-12 regression tests.

**Delivered code:**

```
iips-platform/src/investment/identity/
  types.ts sources.ts corporateActions.ts resolver.ts coverage.ts coverageView.ts
  coverageEndpoint.ts index.ts
iips-platform/scripts/iid1-coverage-report.ts
frontend/server/investment/coverage-transport.ts
frontend/server/investment/sources.ts
frontend/src/api/investmentCoverage.ts
frontend/src/features/investment/InvestmentCoveragePage.tsx
```

Routes: `GET /api/investment/coverage`, `GET /investment/coverage` (server-rendered, no JS),
`POST /api/investment/coverage/preview` (evaluates preview rows held by the client; persists nothing).
SPA surface `/identity-coverage`.

**Limits carried, not resolved:** reference data is synthetic (`SYNTHETIC_FIXTURE`); R-16 sector coverage
remains 3 of 13 with ten `outstandingSectors` (C-16.x stays OPEN); the XBRL map stays at 20 tags and the
derivation set at 8 items; broker-preview coverage is request-scoped; the frontend test runner and Vite
build were not executable in the implementation sandbox (`frontend/` has no `node_modules`), so those two
browser modules were type-checked only. Identity coverage is not financial coverage and does not close it.

## B.K R-16 sector coverage — still outstanding

| ID | Criterion | Status |
|---|---|---|
| C-16.1 | All 13 sectors measured against real filings for ≥2 issuers × 5 years | **OPEN** (3 of 13 measured on synthetic fixtures) |
| C-16.2 | Per-sector tag coverage published, with unmapped tags listed | **OPEN** (mechanism exists; only Technology has XBRL-tag evidence) |
| C-16.3 | Per-method availability published per sector with withheld reasons | mechanism **DONE** (IID-0), sector population **OPEN** |
| C-16.4 | Every operating-metric gap that withholds a primary method recorded as an operator task | **OPEN** |
| C-16.5 | Coverage report schema-validated and reproduced byte-identically from the same inputs | mechanism **DONE** (deterministic JSON), full-population run **OPEN** |

`outstandingSectors` in the generated report names the ten sectors with no measurement. That list is the
honest state of R-16, not a failure of IID-0.

## B.L Explicitly not started

IID-1 (identity & coverage), IID-2 (company assessment / IID-01), IID-3 (persistence, read transport,
thin slice / ★M-1), IID-4 (holding disposition / IID-02), IID-5 (change intelligence / IID-03 / ★M-2),
IID-6 (product surface / ★M-3). No NP-04 database, persisted report or IPD artefact was created, modified
or read in this pass; the Q-1 probe was not repeated; no frozen sector engine file was modified.
