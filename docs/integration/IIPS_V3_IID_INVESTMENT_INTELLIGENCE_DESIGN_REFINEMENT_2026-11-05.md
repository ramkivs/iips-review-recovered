# IIPS v3.0 — IID Investment Intelligence & Decision Support
## Consolidated Design Refinement

| Field | Value |
|---|---|
| Record type | **DESIGN REFINEMENT** — architecture (Part I) + consolidated corrections, probe results and decision register (Part II) |
| Revision | **2** — 2026-11-05. Part II supersedes the specific subsections listed in §R0 |
| Implementation sequencing | separate document: `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` |
| Date | 2026-11-05 |
| Repository | `ramkivs/iips-review-recovered` (IRR) @ `c40b7139ea364673fe2d3dea2ee8f85b8a9bc123` |
| Branch / state | read-only inspection; working tree clean at time of writing |
| Supersedes | nothing. Refines the 2026-11-05 read-only assessment of IID-01/IID-02/IID-03 |
| Amends | nothing. Introduces no dependency pin, no schema migration, no code, no persistence write |
| Scope | single-user, local, non-production, decision-support only. **No trade execution.** |
| Companion IPD repository | `ramkivs/iips-production-market-data` (referred to as IPD) |

> **Reading note.** Part I (§0 – Appendix A5) is the architecture of record and is preserved.
> Part II (Revision 2) applies seventeen corrections, records the Q-1 probe executed against the pinned
> NP-04 artifact, and closes the decision register. Where Part II supersedes a Part I subsection, a
> pointer marks the spot. Nothing in Part I is silently rewritten.

### What this document is

One consolidated refinement answering the eight requested items: recommended data source, company identity mapping, three canonical artifact structures, engine/repository responsibilities, implementation sequence, acceptance criteria, and dependencies/unresolved questions. It also carries the *refinement content* the review asked for — disposition semantics (§A1), sector valuation method matrix (§A2), change taxonomy (§A3) — in the appendices so the main body stays decision-oriented.

### Requested output — where each item is answered

| # | Requested item | Section |
|---|---|---|
| 1 | Recommended data source approach | §1 (options §1.2, recommendation §1.3, licensing §1.4, ownership §1.5, dataset contract §1.6) |
| 2 | Company identity mapping design | §2 |
| 3 | Three canonical artifact structures | §3 (`CompanyAssessment` §3.4, `HoldingDisposition` §3.5, `InvestmentChangeReport` §3.6) |
| 4 | Responsibilities of each engine and repository | §4 |
| 5 | Updated implementation sequence | §5 |
| 6 | Concrete acceptance criteria | §6 |
| 7 | Dependencies and unresolved questions | §7 |
| + | Disposition verb definitions (IID-02 refinement) | Appendix A1 |
| + | Sector-appropriate valuation methodologies (IID-01 refinement) | Appendix A2 |
| + | Change taxonomy and attribution (IID-03 refinement) | Appendix A3 |
| + | Decision register / proposed file map | Appendix A4, §8 |

### What this document is not

It is not an authority act, not a certification, not a gate report, and does not reopen any frozen artifact. It creates no implementation obligation. Where a determination is needed from the Program Authority it is marked **DECISION REQUIRED** with a stated recommendation and default so that work is never silently blocked or silently improvised.

### How the reviewed findings are carried forward

The prior assessment established that the 13 sector engines, `CompanyIntelligence`, and `NormalizedHolding` are **sector-reference** intelligence, not individual-security intelligence. That finding is not merely restated here; it is converted into enforceable constraints (§0) that the proposed validators must reject at runtime. Everything else in this document is downstream of it.

---

## 0. Governing constraints (carried forward, now machine-checkable)

These are binding on the design. Each has a stated enforcement mechanism; none is left to convention.

| ID | Constraint | Enforcement |
|---|---|---|
| **C-1** | A sector-reference identifier (`Banking-H1`, `Technology-H1`, …) must **never** be used as, or substituted for, an individual company identifier. | `CompanyId` is a *branded* type. `parseCompanyId()` accepts only `IN:ISIN:<12>` (plus `IN:CIN:<21>` where no ISIN exists) and rejects anything matching `/^[A-Za-z][A-Za-z &-]*-\w\d+$/`. Validator test: the sector-reference ids actually emitted today (`"${sector}-H1"` in `frontend/server/executive-transport.ts` lines 244/381/526, and the `ScreeningPopulation` reference ids) are all rejected. |
| **C-2** | Existing sector-reference conviction / quality / moat / verdict values must not be presented as company-level analysis, nor aggregated into one. | `CompanyAssessment.sectorReferenceView` is a nested, always-present, `evidenceClass: 'SECTOR_REFERENCE'` block that the UI renders in a visually distinct disclosure panel. No assessment field may be *derived* from it (structurally prevented: assessment engines receive `FundamentalsSnapshot` only). |
| **C-3** | Missing information must never become zero, a default, an average, or a fabricated score. | Every numeric field is `Observation<number>` with an explicit presence state (§3.2). Invariants INV-1..INV-6 (§3.3) are validated before composition and again before persistence. |
| **C-4** | Anything that could be read as a trade instruction is out of scope. | Dispositions are *opinions with explanations*; the artifact has no quantity, price, timing, order-type or broker field, and the transport is GET-only. A schema test asserts the absence of an order-shaped key set. |
| **C-5** | No Reports-local store; NP-04 is the only persistence authority. | New composition code receives a `ReportsPersistencePort` by injection (mirrors `frontend/server/reports/np04-adapter.ts`). A test asserts the module graph contains no store construction. |
| **C-6** | Historical assessments are never silently recomputed or rewritten. | Versions are append-only via `appendVersion`; the change view derives exclusively from stored `canonicalPayload` bytes. Ad-hoc diffs are projections, not new records (§3.6). |
| **C-7** | No new approval ceremony, no production admission, no enterprise governance layer. | The whole initiative is scoped to the existing local, non-production runtime. Existing fence semantics (`WRITE_NOT_AUTHORIZED`, 503 fail-closed) are *reused*, not extended. |
| **C-8** | IRR/IPD ownership boundaries are preserved. | Responsibilities table (§4). IRR never writes to IPD stores it does not own; IPD objects are consumed through ports, never re-implemented. |

### 0.1 What already exists and must be reused (not rebuilt)

| Capability | Location | Reused for |
|---|---|---|
| Canonical content identity, payload canonicalization, artifact validation, chain validation | `frontend/server/reports/canonical.ts`, `artifact.ts` | All three new artifact types |
| Five-operation persistence port + fail-closed adapter | `frontend/server/reports/persistence-port.ts`, `np04-adapter.ts`, `persistence.ts` | Assessment/disposition/change persistence |
| Operator-run composition → persist path | `frontend/server/reports/persist-real-reports.ts`, `composition.ts` | Generation CLI (server-side, not an HTTP write surface) |
| Read-only artifact transport + typed client with sanitized failures | `frontend/server/reports-transport.ts`, `frontend/src/api/reports.ts` | Version history read path |
| Version switching UI | `frontend/src/features/reports/ReportDetail.tsx` | Change timeline UI pattern |
| Immutable snapshot vocabulary (`snapshotId`, `dataVersion`, `asOf`, `provider`, `quality ∈ good\|stale\|partial\|unavailable`, `completenessPct`) | `iips-platform/src/distributed/LiveDataRuntime.ts` | Fundamentals snapshot contract (identical field set) |
| PIT read-contract pattern (contract + boundary + non-production store + adapter) | `frontend/server/pit/pitReadContract.ts`, `pitReadBoundary.ts`, `nonProductionPitStore.ts` | Fundamentals read port |
| 13 sector engines (metrics → scoring → calibration → decision → evidence) and their metric vocabularies | `iips-platform/src/sector-engines/*` | Sector method selection, risk overlays, valuation *input* vocabulary |
| `NormalizedHolding` / `OntologyMapper` (sector-reference conviction surface) | `iips-platform/src/sector-engines/cross-sector/` | Portfolio context for dispositions (as a labelled input) |
| Holdings: `G2HoldingView` (`symbol`, `isin?`, `exchange`, `quantity`, `marketValue`, `weightPercentage`, `identityStatus`, `resolutionDisposition`) | `frontend/server/user-portfolio/userPortfolioContract.ts` | Holding subjects |
| Refusal semantics for unresolved identity | `G2_UNRESOLVED_WRITE_MESSAGE`, `brokerImportBoundary.ts` | Unmatched-holding handling |
| Local server-owned data domain (`IIPS_DATA_DIR`, default `<cwd>/.iips-data`, gitignored) | `frontend/server/persistence/persistence-service.ts` | Fundamentals dataset location |

### 0.2 What must not be built

No new public write route. No Reports-local store. No duplicate engine logic (sector engines stay frozen and unimported-modified). No IPO-screening dependency. No LLM-generated disposition basis. No order/trade path. No production deployment, admission, or governance apparatus.

---

## 1. Financial data source: recommendation

### 1.1 The requirement, stated precisely

The analysis needs, per Indian listed company, per fiscal period, with as-filed lineage:

1. **Annual statements** — P&L, balance sheet, cash flow, 5+ years.
2. **Quarterly statements** — 12+ quarters, for trend and staleness.
3. **Dividend history** — declared, ex-date, paid, per share, adjusted for splits/bonus.
4. **Corporate actions** — splits, bonus, mergers, demergers, symbol changes, delisting.
5. **Restatements** — the ability to see that a prior period was revised, when, and to what.
6. **Identity anchors** — ISIN and exchange symbols, so filings can be bound to a company identity.
7. **Point-in-time discipline** — "what was knowable on date D", not "what is known now".

Requirement 5 and 7 are the ones that eliminate most convenient sources: normalized vendor APIs typically expose only the current restated series.

### 1.2 Options assessed

Cost figures are indicative, from vendor-published pages at the time of writing, and must be re-confirmed before any subscription.

| # | Option | Statements (A/Q) | BS + CF | Dividends | History depth | As-filed / restatement lineage | Corps actions & identity | Freshness | Licence & cost | Integration |
|---|---|---|---|---|---|---|---|---|---|---|
| **S1** | **Operator-assisted XBRL filing import** (SEBI-mandated XBRL results, human-downloaded from NSE/BSE filing pages into the local dataset) | ●●● | ●●● (full taxonomy) | ○ (from filings, separate mapping) | 2015→ present, deep | ●●● genuine as-filed, revisions visible as separate filings with filing timestamps | ○ (manual table) | Manual cadence (T+1..T+5 after results) | Free; public disclosures; **no automated collection** (see 1.4) | Medium: XBRL taxonomy mapping per statement type |
| **S2** | **Licensed global fundamentals API** (EODHD fundamentals tier ~€60/mo; All-in-One ~$100/mo) | ●●● | ●●● | ●●● | ~20y claimed; validate India depth | ● (current series; restatement history not exposed) | ●● (splits, dividends, delisted tickers) | Daily | Paid, per-key, personal/internal terms | Low: single JSON adapter |
| **S3** | **Indian vendor API / MCP** (Trendlyne MCP from ~₹299/mo; Drishti from ~₹2,000/mo; Tijori: no public API; Screener: no public API, export only) | ●● | ●● | ●● | 10y typical | ○ | ●● | Daily | Low–medium cost; redistribution often restricted, internal single-user use typical | Low: REST/JSON |
| **S4** | **Institutional (CMIE Prowess, Capitaline, LSEG, Bloomberg)** | ●●● | ●●● | ●●● | 20y+ | ●●● best-in-class | ●●● | Daily | ₹ lakhs/yr; contract-bound, non-redistributable | High: contracts, schemas, seat licensing |
| **S5** | **Broker APIs** (Zerodha Kite, Dhan, Upstox) | ○ | ○ | ○ | — | — | ● (holdings only) | Real-time | Free with account; personal use | Low — but **holdings/prices only, no statements** |
| **S6** | **Exchange direct data feeds** (BSE Self Data Feed, NSE Data & Analytics) | ●● corporate products | ●● | ●● | Vendor-defined | ●● | ●●● | Daily | KYC + agreement + fees; enterprise posture | High |
| **S7** | **Automated scraping** (`nsepython`-style, Screener scrapers, Apify actors) | ●● | ●● | ● | 10–13y | ○ | ○ | On demand | **Rejected** — see 1.4 | Brittle; breaks on layout/anti-bot change |
| **S8** | **Curated manual CSV / operator spreadsheet** | ● (as entered) | ● | ● | As entered | ●●● (operator records filing refs) | ○ | Manual | Free | Trivial; always available |

Legend: ●●● strong, ●● adequate, ● partial, ○ absent.

### 1.3 Recommendation: a tiered, contract-first approach

**Recommended: S1 as the source of record + S8 as the universal fallback, with S2 (or S3) admitted only as an optional accelerator behind the same read contract. Never S7 at runtime.**

Why this ordering, and why not "just buy an API":

1. **Restatement and point-in-time fidelity are the product requirement, not a nicety.** C-6 and the whole of IID-03 depend on being able to say *"the FY24 number changed because a revised filing landed on 2025-08-14"* — which is `DATA_CORRECTION_RESTATEMENT`, not `FUNDAMENTAL`. A normalized vendor series collapses that distinction and would make the change engine systematically lie about causes. Only as-filed documents carry that.
2. **The universe is small.** This is a single-user application. The analysable set is the user's holdings, watchlist and an operator-curated roster — realistically 20–200 companies, not 5,000. XBRL import at ~8 filings per company-year is a few thousand documents: entirely tractable offline, and it never needs to run at request time.
3. **Cost and lock-in are near zero**, which matters for a non-production, non-commercial local tool.
4. **Determinism and replay survive.** The dataset is materialised once into an immutable, checksummed snapshot under `IIPS_DATA_DIR`; analyses read the snapshot, never the network. This is the same discipline `LiveDataRuntime` already imposes on market data.
5. **Vendors remain useful — as data-entry automation, not as the analysis input.** If an API key exists, its output is *written into the dataset* by the ingestion step and then treated identically to operator-entered data. The analysis engine cannot tell the difference, so determinism holds and a vendor can be swapped or dropped without touching analysis code.

**Deliberately rejected:**

| Rejected | Reason |
|---|---|
| Automated scraping of NSE/BSE pages (S7) | NSE's Terms of Use prohibit "systematic or automated data collection activities (including scraping, data mining, data extraction and data harvesting)" without express written consent, and BSE's site refuses non-browser access. This holds even for personal use and applies regardless of whether the underlying disclosures are public. The design must not require a ToS violation to function, and must not silently degrade into one if an endpoint is later wired up. |
| Institutional S4 | Cost and contract overhead are disproportionate for a single-user local tool; no governance benefit for a non-production application. |
| Exchange direct S6 | KYC/agreement-gated; enterprise posture; no capability the local tool needs. |
| Vendors-as-live-dependency (S2/S3 queried during assessment) | Breaks determinism, replay, and offline operation; makes historical versions unreproducible. |

### 1.4 Licensing posture (must be recorded in the dataset manifest)

- Filings are public SEBI/exchange disclosures; the *documents* are public. The *constraint* is on automated collection from exchange websites.
- Therefore: acquisition is **operator-driven** (human download or vendor API), never product-runtime scraping. The ingestion tool is a **local file importer**: given a directory of XBRL/CSV files plus a small `filing-index.json`, it validates, normalises, checksums and snapshots. It contains **no HTTP client to any exchange domain**; a test asserts this (no `nseindia.com` / `bseindia.com` host strings in the ingestion module graph).
- If S2/S3 is used, its licence terms stay in force for that data; the manifest records `provider`, `licence`, `termsUrl`, `retrievedAt`, and whether redistribution is permitted. Nothing is redistributed: the dataset is local and gitignored.
- Personal data risk is low by construction: the dataset holds company financials only, no director names, no shareholding individual names.

### 1.5 Ownership: IPD-owned ingestion, IRR-owned analysis

**Confirmed by the operator, 2026-11-05** (see Part II R-19): ingestion ownership migrates to IPD behind
the read port, and not before — no IID phase requires an IPD change to proceed.

| Layer | Recommended owner | Rationale |
|---|---|---|
| Filing acquisition, validation, normalisation to a canonical period/line-item form, immutable snapshot, checksums, manifest, retention | **IPD** (target state) | IPD already owns market data (PIT D01/D02), the governed security master (D05 `src/identity`), and the immutable snapshot discipline. Fundamentals are reference data *about securities*, and binding a filing to a canonical identity is an identity operation, which is IPD's domain. Splitting normalisation from identity would create a second, unaudited identity map — precisely the failure mode §2 exists to prevent. |
| `FundamentalsReadPort` contract, snapshot consumption, company assessment, holding disposition, change intelligence, artifact composition, transport, UI | **IRR** | Existing IRR ownership: analysis engines, cross-sector intelligence, reports composition and adapter, UI. |
| Artifact persistence | **IPD (NP-04)** via IRR's existing five-operation port | Unchanged from today. |

**Practical sequencing point (important, and the reason this does not become a blocker):** the target state above is a cross-repository change, and this initiative should not be gated on it. Therefore:

- **IID-0..IID-5 are IRR-only.** IRR defines the read contract, ships a *non-production local snapshot store* behind it (exactly the shape of `frontend/server/pit/nonProductionPitStore.ts`), and runs the whole pipeline end to end.
- **The IPD migration, when/if wanted, is an adapter swap** — one module replaced behind an unchanged port — not a rewrite. This mirrors how `ipdPitReadAdapter.ts` already sits behind `pitReadPort.ts`.

This is a recommendation, not a determination. If the Program Authority prefers IRR to own ingestion permanently, nothing in §1.1–§1.4 changes; only the `FundamentalsReadPort` implementer changes, and §4's table row for ingestion moves from IPD to IRR. The design is deliberately owner-agnostic at the port boundary.

### 1.6 Dataset layout and manifest

```
${IIPS_DATA_DIR}/investment/            # gitignored (existing local data domain)
  manifest.json                         # dataset identity, checksums, provider/licence, coverage
  roster/eligible-companies.json        # curated universe: companyId (ISIN-keyed) + sector + listing ids
  identity/listing-map.json             # symbol/scrip -> companyId, with effective dates
  identity/corporate-actions.json       # splits, bonus, mergers, demergers, symbol changes
  filings/index.json                    # filingRef -> {isin, periodEnd, periodType, taxonomy, filedAt, sha256, form}
  filings/payloads/<sha256>.xml|.csv    # immutable as-filed documents
  normalized/periods/<companyId>.json   # canonical line items per period, each with filingRef + basis
  prices/eod.json                       # pinned EOD close per company per date (MoS denominator)
```

> **Superseded by R-7.** `datasetVersion` below embeds a timestamp, which mints a new version on every
> re-import of identical data. Under R-7, dataset identity is the content digest only and the timestamp
> is recorded outside it.

`manifest.json` is the dataset's identity, mirroring `DataSnapshot`:

```jsonc
{
  "datasetSchema": "IIPS_INVESTMENT_FUNDAMENTALS_V1",
  "datasetVersion": "2026-11-05T00:00:00Z+<contentDigest>",   // new version on any content change
  "contentDigest": "sha256:…",                                // over all normalised + index files
  "provider": "operator-xbrl-import",
  "licence": "public-disclosures-local-use",
  "asOf": "2026-11-05T00:00:00Z",
  "knownAsOf": "2026-11-04T23:59:59Z",                        // latest filing timestamp included
  "quality": "good | stale | partial | unavailable",          // same vocabulary as DataSourceMeta
  "completenessPct": 87.5,
  "coverage": { "companies": 42, "annualPeriods": 268, "quarterlyPeriods": 512, "earliestPeriodEnd": "2018-03-31" },
  "excluded": [ { "companyId": "IN:ISIN:…", "reason": "ROSTER_INELIGIBLE" } ]
}
```

Two clocks are separate and both are carried into every artifact: `dataAsOf` (latest period end covered) and `knownAsOf` (latest filing timestamp included). An assessment produced on 2026-11-05 against `knownAsOf` 2026-06-30 is *stale*, and must say so rather than implying current knowledge.

---

## 2. Company identity mapping design

### 2.1 The problem, stated concretely

Today there are three identifier families in play, and they are not interchangeable:

| Family | Example | Source | Meaning | Usable as company identity? |
|---|---|---|---|---|
| Sector reference | `Banking-H1` | `executive-transport.ts` (`${sector}-H1`), `OntologyMapper` | A *sector-analytics placeholder*, one row per sector | **No** (C-1) |
| Broker-observed | `RELIANCE`, `INE002A01018` (optional in broker CSVs) | Broker holdings files | A security as the broker names it | Not directly — must be resolved |
| IPD canonical | `companyId` on `G2HoldingView`, resolved by IPD `src/identity/security_master` | IPD D05 governed master + broker-import identity resolution | IPD's canonical company key | Partly — see 2.3 caveat |

And the user's holdings arrive either as `symbol` (+ optional `isin`) from G3/broker import, or as preview rows from `BrokerHoldingsPreview`.

> **Superseded in part by R-1 and R-8.** The single `CompanyId` below conflates issuer, security and
> listing. R-1 splits them into `IssuerId` (CIN, with equity-ISIN fallback) / `SecurityId` (ISIN) /
> `ListingId`; R-8 replaces `HoldingKey` with the `DispositionSubject` union. The reasoning in §2.2 –
> §2.6 (no name matching, fail closed, corporate actions) is retained.

### 2.2 The identity model

Three levels, explicitly separate, never conflated:

```ts
/** Company (issuer) identity. Branded; only parseCompanyId() may construct it. */
type CompanyId = string & { readonly __brand: 'CompanyId' };
//   IN:ISIN:INE009A01021      equity/debt issuer keyed on ISIN (preferred)
//   IN:CIN:U72200KA1981PLC013115   unlisted/ISIN-less fallback

/** Listing identity: a company *on an exchange*, with its own symbol history. */
type ListingId = string & { readonly __brand: 'ListingId' };
//   IN:NSE:INFY      IN:BSE:500209      IN:NSE:INE009A01021 (ISIN-series form)

/** Holding identity: one position inside one portfolio. */
type HoldingKey = string & { readonly __brand: 'HoldingKey' };
//   <portfolioId>#<CompanyId>#<securityClass>
```

**`securityClass`** is required because a "company" can appear in a portfolio as several distinct securities: `EQUITY`, `PREFERENCE`, `DEBENTURE`, `ETF_UNIT`, `MF_UNIT`, `RIGHTS_ENTITLEMENT`, `WARRANT`. Only `EQUITY` (and, where the sector is financial, optionally `PREFERENCE`) is eligible for a holding disposition. Everything else resolves to `OUT_OF_SCOPE_SECURITY` — resolvable identity, no disposition — rather than being silently treated as equity.

### 2.3 The D05 caveat (must not be skipped)

The governed D05 broad-universe payload contains 2,250 records of which the repository's reconciliation reports **52 real and 2,198 synthetic**, with **no typed per-row real/synthetic eligibility discriminator** in the row contract (recorded in `docs/integration/IIPS_v3.0_PLATFORM_IDENTITY_ELIGIBILITY_CONTRACT_PROPOSAL_2026-10-19.md` §35, §93). Consequences for IID:

1. The company-analysis universe **cannot** be D05. It is the explicit, operator-reviewed **eligible roster** (§1.6), keyed on real ISINs.
2. IPD-resolved `G2HoldingView.companyId` is accepted as *IPD's* identity, but it is **not** trusted to denote a real listed company. It is used as a *lookup hint*, and the binding must be re-established against the eligible roster.
3. Rows saved via operator bypass (`resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS'`) and rows with `identityStatus: 'UNRESOLVED'` are **non-canonical by definition**. They are displayed in the coverage panel, never assessed.

### 2.4 Resolution ladder (deterministic, first match wins, no fuzzy fallback)

```
0. Normalise the observation: uppercase symbol, strip whitespace, validate lengths and character set.
1. Reject non-equity / non-admitted security classes → OUT_OF_SCOPE_SECURITY.
2. If ISIN present:
     a. validate ISIN format + Luhn check digit             → invalid ⇒ REJECTED_MALFORMED_ISIN
     b. exact match in eligible roster                      → RESOLVED (confidence EXACT)
     c. exact match in listing-map, company ineligible      → INELIGIBLE (roster reason)
     d. no match                                            → UNMATCHED  (do NOT fall through to symbol)
3. Else if (exchange, symbol) present:
     a. exact match in listing-map, effective on asOf       → RESOLVED
     b. match only outside effective window                 → STALE_REFERENCE (needs operator review)
     c. matches 2+ active companies                         → AMBIGUOUS (never guess)
     d. no match                                            → UNMATCHED
4. Else if IPD companyId present: look up ISIN via identity binding; then go to 2.
5. Otherwise                                                → UNMATCHED
```

Hard rules, each with a test:

- **No name matching, ever.** Consistent with the existing position that unresolved results are treated as non-usable "rather than falling back to name matching" (`PLATFORM_IDENTITY_ELIGIBILITY_CONTRACT_PROPOSAL` §107).
- **No ISIN→symbol fallback after an ISIN miss.** A wrong ISIN is evidence of a bad record, not an invitation to try another key.
- **`AMBIGUOUS` never resolves to "first match".**
- **A sector reference is rejected at step 1** (C-1 pattern) with `SECTOR_REFERENCE_NOT_A_COMPANY`.
- **Resolution is a pure function of (observation, listing-map version, asOf).** Same inputs ⇒ same output, byte-identically.

### 2.5 States, and exactly what the product does with each

| State | Meaning | Assessment? | Disposition? | UI |
|---|---|---|---|---|
| `RESOLVED` | Bound to an eligible roster company, effective on asOf | Yes | Yes (subject to adequacy gate) | Full surface |
| `AMBIGUOUS` | 2+ active candidates | No | **No** | Coverage panel: "identity ambiguous", candidate list, operator action hint |
| `UNMATCHED` | No candidate | No | **No** | Coverage panel: "not in eligible roster", with the raw observation |
| `INELIGIBLE` | Known company, outside the roster | No | **No** | Coverage panel with roster exclusion reason |
| `OUT_OF_SCOPE_SECURITY` | Resolved company, wrong security class | No | **No** ("not equity") | Labelled row, excluded from totals |
| `STALE_REFERENCE` | Match exists but outside its effective window | No | **No** | Coverage panel: "listing reference has changed; confirm mapping" |
| `REJECTED_MALFORMED_ISIN` | ISIN fails format/Luhn | No | **No** | Coverage panel: "identifier is not a valid ISIN" |

Presentation rule: unresolved holdings are shown as a **separate, clearly non-authoritative block** with an explicit count and no valuation, weight-normalised figures or disposition placeholders. They must never be folded into portfolio totals as zeros — they are "unmeasured", not "zero".

### 2.6 Corporate actions, mergers, demergers, delisting

`identity/corporate-actions.json` is an operator-maintained, versioned table. Each entry:

```ts
interface CorporateAction {
  actionId: string;
  type: 'SPLIT' | 'BONUS' | 'MERGER' | 'DEMERGER' | 'SYMBOL_CHANGE' | 'NAME_CHANGE'
      | 'DELISTING' | 'RIGHTS' | 'BUYBACK';
  effectiveDate: string;                 // ISO date
  subjectCompanyId: CompanyId;            // the entity as it was BEFORE the action
  successors?: { companyId: CompanyId; ratio: number }[];   // MERGER/DEMERGER
  exchangeRatio?: number;                 // shares of successor per share of subject
  listingChange?: { from: ListingId; to: ListingId };
  sourceRef: string;                      // filing/announcement reference
}
```

Handling rules:

| Situation | Behaviour |
|---|---|
| **Split / bonus** | Identity unchanged. Per-share history (EPS, DPS, price) adjusted by the cumulative factor before any per-share comparison. Unadjusted per-share series are a defect, not a variant. |
| **Merger (target → acquirer)** | `subjectCompanyId` becomes terminal: `securityState: 'MERGED'`, `successorCompanyId` recorded. The holding is *re-keyed* to the successor with the exchange ratio, flagged `derivedFromActionId`. The old assessment is retained and marked superseded-by-identity-change, never deleted. |
| **Demerger (1 → n)** | One holding becomes n holdings with stated ratios. If any successor lacks a roster entry, the affected holding goes `AMBIGUOUS` with `demerger_pending_mapping` and gets no disposition. Never split into an unassessed remainder that silently vanishes. |
| **Symbol change** | Listing map gets a new row with `effectiveFrom`; old symbol retains `effectiveTo`. Historical assessments are unaffected (they cite the listing map version they used). |
| **Delisting** | `securityState: 'DELISTED'`, terminal. Last assessment retained for history; no new disposition is generated (`disposition withheld: security_delisted`). |
| **Actions not in the table** | Deterministically *not applied*. The assessment records `corporateActionCoverage: { tableVersion, appliedActionIds[], unappliedDetected }`. If a price move is implausible but no action is known, a `POSSIBLE_UNADJUSTED_CORPORATE_ACTION` data-quality flag is raised — the system flags, it does not guess. |

### 2.7 Binding record (auditable, versioned, carried into every artifact)

```ts
interface CompanyIdentityBinding {
  readonly schemaVersion: 1;
  readonly observation: {                       // exactly what arrived, verbatim
    readonly symbol?: string;
    readonly isin?: string;
    readonly exchange?: 'NSE' | 'BSE';
    readonly ipdCompanyId?: string;             // hint only, never authority
    readonly source: 'USER_PORTFOLIO' | 'BROKER_IMPORT' | 'WATCHLIST' | 'OPERATOR_ROSTER';
  };
  readonly state: IdentityState;                // §2.5
  readonly companyId: CompanyId | null;         // null unless RESOLVED
  readonly listingId: ListingId | null;
  readonly securityClass: SecurityClass;
  readonly method: 'ISIN_EXACT' | 'SYMBOL_EXACT' | 'IPD_COMPANY_ID_BRIDGE' | 'NONE';
  readonly evidence: readonly string[];         // which table rows matched, by id
  readonly candidates?: readonly { companyId: CompanyId; reason: string }[];  // AMBIGUOUS only
  readonly listingMapVersion: string;
  readonly corporateActionTableVersion: string;
  readonly resolvedAt: string;                  // ISO-8601 UTC
}
```

`mappingState` is *not* a confidence score. There is no "80% match". A binding is `RESOLVED` or it is not usable.

### 2.8 Consequences for the existing surfaces (no redesign of them)

- `CompanyIntelligence` (`/research/company/:id`, `/api/company/:sector`) **stays exactly as it is**: sector-reference, presentation-only. The new individual-company surface is a **new route** (`/investment/company/:companyId`) that links *to* the sector view as a labelled disclosure. Overloading the existing route would guarantee C-1/C-2 violations.
- `NormalizedHolding` / CSIP **stays as it is**: sector-reference conviction. It is consumed by the disposition engine as a portfolio-context input, labelled `evidenceClass: 'SECTOR_REFERENCE'`, and it can never set a disposition on its own (§3.4, gate G-4).
- G3 holdings are read-only here. IRR does not attempt to write resolved mappings back into IPD's store; IRR's binding is a *derived view*, recomputed from IPD's rows plus the eligible roster.

### 2.9 Required tests

| ID | Test |
|---|---|
| T-2.1 | Every sector-reference id fixture (`Banking-H1` … `Materials-H1`) is rejected with `SECTOR_REFERENCE_NOT_A_COMPANY`. |
| T-2.2 | ISIN Luhn check digit rejects a single-character corruption of a valid ISIN. |
| T-2.3 | An ISIN miss does not fall through to symbol resolution. |
| T-2.4 | Two active companies sharing a symbol ⇒ `AMBIGUOUS`, no companyId emitted. |
| T-2.5 | Symbol matched only outside its effective window ⇒ `STALE_REFERENCE`. |
| T-2.6 | Demerger with one unmapped successor ⇒ affected holding `AMBIGUOUS`, other successors assessable, totals reconcile. |
| T-2.7 | Split adjusts per-share history such that EPS×shares is unchanged within rounding. |
| T-2.8 | Unresolved holding is absent from the disposition list and appears in coverage with zero numeric fields. |
| T-2.9 | Resolution is byte-deterministic across 100 shuffled input orderings. |

---

## 3. Canonical artifact contracts

### 3.1 Three artifacts, one persistence mechanism

| Artifact | Purpose | `reportType` | `portfolioId` (subject scope) | Chain semantics |
|---|---|---|---|---|
| `CompanyAssessment` | What this company is worth and why, as of a date, under a model version | `investment.company-assessment` | `co:<companyId>` | One chain per company; every re-assessment appends |
| `HoldingDisposition` | What to do with this position and why, with portfolio implications | `investment.holding-disposition` | `hd:<portfolioId>/<companyId>` | One chain per (portfolio, company) |
| `InvestmentChangeReport` | What changed between two stored versions, why, and whether it warrants review | `investment.change-report` | `icr:<subjectScope>` | One chain per subject; boundary reports only |

Why `portfolioId` carries a scope token: NP-04's canonical members are exactly `(reportType, portfolioId, scenario, parameters)`, and `validateArtifactChain()` requires `reportType` and `portfolioId` to be **fixed across a chain**. Chain identity therefore has to live in `portfolioId`, and per-version variation has to live in `scenario`/`parameters`. The scope token is an opaque, non-personal string; it contains no user identifier. **This requires verifying that NP-04 accepts a non-portfolio scope token in `portfolioId`** — the single cheapest unknown in this design, probed in IID-0 (§7, Q-1).

`reportKey` is content identity over the four members only — **not** over `canonicalPayload`. Consequence the design must honour: the *discriminating inputs* (data version, snapshot digest, model version, assessment input digest) must appear in `parameters`, so that a change in any of them necessarily changes `reportKey`. Otherwise two materially different assessments could share a key.

### 3.2 Shared vocabulary

```ts
/** Every numeric in an assessment. A number is never "absent" by being 0. */
type Presence = 'PRESENT' | 'MISSING' | 'NOT_APPLICABLE' | 'NOT_COMPUTABLE' | 'IMPUTED';

interface Observation<T> {
  readonly value: T | null;          // non-null IFF presence === 'PRESENT' | 'IMPUTED'
  readonly presence: Presence;
  readonly reason?: MissingReason;   // closed vocabulary, required when value is null
  readonly source?: SourceRef;       // required when presence === 'PRESENT' | 'IMPUTED'
  readonly periodEnd?: string;
  readonly basis?: 'AS_FILED' | 'RESTATED' | 'DERIVED' | 'IMPUTED';
  readonly filingRef?: string;
  readonly imputation?: { method: string; assumptionRef: string };  // IMPUTED only
}

type MissingReason =
  | 'NOT_REPORTED' | 'NOT_TAGGED_IN_FILING' | 'PERIOD_NOT_COVERED' | 'FILING_UNAVAILABLE'
  | 'STATEMENT_OUT_OF_SCOPE' | 'DIVISION_BY_ZERO' | 'NEGATIVE_BASE' | 'INSUFFICIENT_HISTORY'
  | 'SECTOR_METHOD_NOT_APPLICABLE' | 'SECURITY_CLASS_EXCLUDED' | 'SOURCE_CONFLICT_UNRESOLVED';

interface SourceRef {
  readonly kind: 'FILING' | 'DATASET' | 'DERIVED' | 'OPERATOR_ENTRY' | 'MARKET_PRICE';
  readonly ref: string;              // filingRef / dataset path id / derivation id
  readonly sha256?: string;
  readonly filedAt?: string;
}
```

### 3.3 Invariants (validated before composition and again before persistence)

| ID | Invariant |
|---|---|
| **INV-1** | `value === null` ⟺ `presence !== 'PRESENT' && presence !== 'IMPUTED'`. |
| **INV-2** | `presence` in `{MISSING, NOT_COMPUTABLE, NOT_APPLICABLE}` ⇒ `reason` is set. |
| **INV-3** | `presence === 'PRESENT'` ⇒ `source` is set. A zero is legal only as a sourced zero. |
| **INV-4** | `presence === 'IMPUTED'` ⇒ `imputation.method` and `imputation.assumptionRef` are set, and the field is listed in `assumptions.imputations[]`. |
| **INV-5** | A derived aggregate (moat class, intrinsic range, confidence, dividend verdict, disposition) is `null` unless **all** of its `requiredInputs` are `PRESENT`; the unmet set is reported in `withheld.unmetInputs[]`. |
| **INV-6** | No score, ratio or range may be computed from an `IMPUTED` input unless the consuming method declares `allowsImputation: true`, and then `confidence` is reduced by the declared penalty. |

### 3.4 `CompanyAssessment` (IID-01)

Abridged but complete-in-shape TypeScript. The full payload is the canonical JSON stored in `canonicalPayload`; the flat `parameters` mirror carries the discriminating inputs.

```ts
interface CompanyAssessmentPayload {
  readonly schemaVersion: 1;
  readonly artifact: {
    readonly kind: 'CompanyAssessment';
    readonly subjectScope: string;             // mirrors portfolioId
    readonly modelVersion: string;             // e.g. 'assessment-engine/1.0.0'
    readonly policyVersion: string;            // method matrix + thresholds
    readonly generatedAt: string;              // ISO-8601 UTC
  };

  readonly subject: {
    readonly companyId: CompanyId;
    readonly legalName: string;
    readonly listings: readonly { listingId: ListingId; exchange: 'NSE' | 'BSE'; symbol: string; active: boolean }[];
    readonly securityClass: SecurityClass;
    readonly securityState: 'ACTIVE' | 'MERGED' | 'DELISTED' | 'SUSPENDED';
    readonly sector: SectorName;               // one of the 13 certified names
    readonly sectorSubsegment: string | null;
    readonly reportingCurrency: 'INR';
    readonly fiscalYearEnd: string;            // '03-31'
    readonly identity: { bindingRef: string; listingMapVersion: string; corporateActionTableVersion: string };
  };

  readonly asOf: {
    readonly generatedAt: string;
    readonly dataAsOf: string;                 // latest period end covered
    readonly knownAsOf: string;                // latest filing timestamp included
    readonly stalenessDays: number;
    readonly staleBeyondPolicy: boolean;
  };

  readonly data: {
    readonly datasetVersion: string;
    readonly contentDigest: string;
    readonly provider: string;
    readonly quality: 'good' | 'stale' | 'partial' | 'unavailable';
    readonly completenessPct: number;
    readonly periodsCovered: { annual: number; quarterly: number; earliestPeriodEnd: string | null };
    readonly corporateActionCoverage: { tableVersion: string; appliedActionIds: readonly string[]; unappliedDetected: readonly string[] };
    readonly restatements: readonly {
      periodEnd: string; field: string;
      asFiled: Observation<number>; restated: Observation<number>;
      revisedOn: string; filingRef: string; direction: 'UP' | 'DOWN' | 'UNCHANGED';
    }[];
  };

  readonly fundamentals: {
    readonly annual: readonly FinancialPeriod[];
    readonly quarterly: readonly FinancialPeriod[];    // condensed: revenue, ebitda, pat, eps, ocf only
    readonly ttm: FinancialPeriod | null;
    readonly trends: {                                  // each Observation-wrapped, 3y/5y where computable
      readonly revenueCagr3y: Observation<number>;
      readonly revenueCagr5y: Observation<number>;
      readonly patCagr3y: Observation<number>;
      readonly ebitdaMarginTrend: Observation<number>;   // bps/yr
      readonly roicTrend: Observation<number>;
      readonly fcfTrend: Observation<number>;
    };
  };

  readonly completeness: {
    readonly statementCoverage: { pnl: Observation<number>; balanceSheet: Observation<number>; cashFlow: Observation<number> };
    readonly requiredFieldCoveragePct: number;
    readonly missingFields: readonly { field: string; reason: MissingReason; periodEnd: string }[];
    readonly adequacy: 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';
    readonly adequacyBasis: readonly string[];          // which gates fired
  };

  readonly quality: {
    readonly flags: readonly { code: QualityFlag; severity: 'HIGH' | 'MEDIUM' | 'LOW'; evidence: string }[];
    readonly verdict: 'CLEAN' | 'MINOR_CONCERNS' | 'MATERIAL_CONCERNS' | 'UNVERIFIED';
  };

  readonly valuation: {
    readonly methodSelection: {
      readonly sector: SectorName;
      readonly considered: readonly {
        methodId: ValuationMethodId;            // 'DCF_FCFF' | 'RESIDUAL_INCOME' | 'P_E' | 'EV_EBITDA' ...
        role: 'PRIMARY' | 'SECONDARY' | 'CROSS_CHECK' | 'NOT_APPLICABLE';
        reason: string;                          // required when NOT_APPLICABLE
      }[];
      readonly policyVersion: string;
    };
    readonly methods: readonly ValuationMethodResult[];
    readonly intrinsic: {
      readonly perShare: { low: Observation<number>; mid: Observation<number>; high: Observation<number> };
      readonly currency: 'INR';
      readonly weighting: readonly { methodId: ValuationMethodId; weight: number }[];
      readonly spreadPct: Observation<number>;      // (high-low)/mid — a disagreement signal
    } | null;                                        // null when INV-5 unmet
    readonly marginOfSafety: {
      readonly price: Observation<number>;           // sourced, dated
      readonly priceAsOf: string | null;
      readonly mosVsMid: Observation<number>;        // (mid - price)/mid
      readonly mosVsLow: Observation<number>;
      readonly band: 'DEEP_DISCOUNT' | 'DISCOUNT' | 'FAIR' | 'PREMIUM' | 'SIGNIFICANT_PREMIUM' | null;
      readonly bandPolicyVersion: string;
    } | null;
    readonly sensitivity: readonly {
      methodId: ValuationMethodId;
      grid: readonly { waccBps: number; growthBps: number; value: number | null }[];
    }[];
  };

  readonly moat: {
    readonly classification: 'WIDE' | 'NARROW' | 'NONE' | 'INSUFFICIENT_EVIDENCE';
    readonly roicWaccSpread: { readonly spread: Observation<number>; readonly consecutiveYearsPositive: number };
    readonly evidence: readonly {
      evidenceId: string;
      dimension: MoatDimension;   // 'PRICING_POWER'|'COST_POSITION'|'SWITCHING_COSTS'|'BRAND'|'NETWORK'|'REGULATORY'|'SCALE'|'RETENTION'
      metric: string;
      periods: readonly string[];
      observed: Observation<number>;
      threshold: number;
      direction: 'ABOVE' | 'BELOW';
      persists: boolean;
    }[];
    readonly withheld: { readonly unmetInputs: readonly string[] } | null;
  };

  readonly dividends: {
    readonly perShareHistory: readonly { periodEnd: string; dps: Observation<number>; basis: 'AS_FILED' | 'SPLIT_ADJUSTED' }[];
    readonly payoutRatio: Observation<number>;
    readonly fcfCoverage: Observation<number>;        // FCF / cash dividends paid
    readonly netDebtToEbitda: Observation<number>;
    readonly consecutiveYearsPaid: number;
    readonly cutsOrSkips: readonly { periodEnd: string; type: 'CUT' | 'SKIP'; magnitudePct: number }[];
    readonly verdict: 'COVERED' | 'STRETCHED' | 'UNCOVERED' | 'NO_DIVIDEND' | 'INSUFFICIENT_EVIDENCE';
    readonly withheld: { readonly unmetInputs: readonly string[] } | null;
  };

  readonly risk: {
    readonly factors: readonly {
      riskId: string;
      category: 'FINANCIAL' | 'EARNINGS_QUALITY' | 'GOVERNANCE' | 'REGULATORY_LEGAL'
              | 'OPERATIONAL' | 'CONCENTRATION' | 'CYCLICALITY' | 'CAPITAL_ALLOCATION';
      severity: 1 | 2 | 3 | 4 | 5;
      likelihood: 1 | 2 | 3 | 4 | 5;
      status: 'NEW' | 'ONGOING' | 'RESOLVED' | 'UNVERIFIED';
      statement: string;                                // deterministic, template-generated
      evidence: readonly { ref: string; observation: Observation<number> }[];
    }[];
    readonly aggregate: Observation<number> | null;     // null when insufficient inputs
  };

  readonly confidence: {
    readonly dataConfidence: number;      // 0-1, from completeness + quality + staleness
    readonly modelConfidence: number;     // 0-1, from method agreement + sensitivity spread
    readonly combined: number;            // 0-1, declared formula + weights in assumptions
    readonly caps: readonly string[];     // e.g. 'ADEQUACY_PARTIAL', 'STALE_DATA', 'IMPUTED_INPUT'
    readonly formula: string;
  };

  readonly assumptions: {
    readonly discountRate: { value: number; basis: 'WACC_DERIVED' | 'OPERATOR_SET' | 'POLICY_DEFAULT'; components: Record<string, number> } | null;
    readonly terminalGrowth: number | null;
    readonly forecastHorizonYears: number | null;
    readonly growthAssumptions: readonly { period: string; revenueGrowth: number; basis: string }[];
    readonly imputations: readonly { field: string; method: string; assumptionRef: string }[];
    readonly methodSpecific: readonly { methodId: ValuationMethodId; assumptions: Record<string, number | string> }[];
    readonly policyVersion: string;
  };

  /** Sector-reference disclosure. Present, labelled, and structurally incapable of driving the above. */
  readonly sectorReferenceView: {
    readonly evidenceClass: 'SECTOR_REFERENCE';
    readonly sectorRefId: string;                      // e.g. 'Banking-H1'
    readonly engineVerdict: string | null;             // frozen sector engine output, unmodified
    readonly composite: number | null;
    readonly note: string;                              // fixed disclosure text
  };

  readonly evidence: readonly {
    readonly evidenceId: string;
    readonly claim: string;                            // what this supports
    readonly supports: readonly string[];              // field paths it backs
    readonly source: SourceRef;
    readonly observationRefs: readonly string[];
  }[];

  readonly limitations: readonly string[];
  readonly disclosure: { readonly decisionSupportOnly: true; readonly noTradeExecution: true; readonly nonProduction: true };
}
```

Flat `parameters` for this artifact (all primitives, so `reportKey` is input-sensitive):

```jsonc
{
  "companyId": "IN:ISIN:INE009A01021",
  "sector": "Technology",
  "dataAsOf": "2026-06-30",
  "knownAsOf": "2026-07-23T17:44:46Z",
  "datasetVersion": "2026-11-05T00:00:00Z+sha256:…",
  "contentDigest": "sha256:…",
  "modelVersion": "assessment-engine/1.0.0",
  "policyVersion": "valuation-policy/1.0.0",
  "inputDigest": "sha256:…",         // digest of (normalised periods + prices + identity binding) actually consumed
  "adequacy": "SUFFICIENT"
}
```

`ValuationMethodResult` (concrete shape, one per applicable method):

```ts
interface ValuationMethodResult {
  readonly methodId: ValuationMethodId;
  readonly applicable: boolean;
  readonly notApplicableReason?: string;
  readonly output: {
    readonly perShareLow: Observation<number>;
    readonly perShareMid: Observation<number>;
    readonly perShareHigh: Observation<number>;
    readonly basis: string;               // deterministic summary of the arithmetic
  } | null;
  readonly inputs: readonly { name: string; observation: Observation<number>; role: 'PRIMARY' | 'SECONDARY' }[];
  readonly assumptions: Record<string, number | string>;
  readonly allowsImputation: boolean;
  readonly evidenceIds: readonly string[];
}
```

> **Superseded in part.** `holdingKey` and the single scope model are replaced by R-8 (`HELD` vs
> `CANDIDATE` subjects); the gate conditions of §A1.2–A1.3 are replaced by the per-verb evidence matrix
> in R-9; `portfolioImpact` is renamed `portfolioImplication` and the interpretation block is added by
> R-10; limits sourcing is specified by R-11. The payload shape below is otherwise retained.

### 3.5 `HoldingDisposition` (IID-02)

```ts
type DispositionVerb = 'RETAIN' | 'ACCUMULATE' | 'REDUCE' | 'AVOID';         // existing positions
type CandidateVerb  = 'INITIATE' | 'WATCH' | 'AVOID_CANDIDATE';              // not held

interface HoldingDispositionPayload {
  readonly schemaVersion: 1;
  readonly artifact: { readonly kind: 'HoldingDisposition'; readonly subjectScope: string;
                       readonly modelVersion: string; readonly policyVersion: string; readonly generatedAt: string };

  readonly subject: {
    readonly holdingKey: HoldingKey;
    readonly portfolioId: string;
    readonly companyId: CompanyId;
    readonly symbol: string;
    readonly exchange: 'NSE' | 'BSE';
    readonly securityClass: SecurityClass;
    readonly heldAsOf: string;
    readonly identityState: IdentityState;           // must be RESOLVED
  };

  readonly scope: {                                   // the existing/new distinction, explicit
    readonly kind: 'EXISTING_HOLDING' | 'NEW_CANDIDATE';
    readonly quantity: Observation<number>;
    readonly averageCost: Observation<number>;
    readonly marketValue: Observation<number>;
    readonly unrealisedGainPct: Observation<number>;
  };

  readonly companyAssessmentRef: {
    readonly reportId: string; readonly chainId: string; readonly reportKey: string;
    readonly artifactVersion: number; readonly generatedAt: string;
    readonly adequacy: 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';
  };

  readonly portfolioContext: {
    readonly portfolioRevision: number | null;
    readonly asOf: string;
    readonly weightPct: Observation<number>;
    readonly companyExposurePct: Observation<number>;  // across all securities of the same company
    readonly sectorExposurePct: Observation<number>;
    readonly topHoldingWeightPct: Observation<number>;
    readonly concentrationBand: Observation<'Very Low'|'Low'|'Moderate'|'Good'|'High'>;
    readonly correlationFlags: readonly { pairWith: CompanyId; coefficient: Observation<number>; note: string }[];
    readonly sectorReferenceContext: {
      readonly evidenceClass: 'SECTOR_REFERENCE';
      readonly normalizedHolding: { conviction: number; quality: number; risk: number } | null;
      readonly note: string;
    };
  };

  readonly disposition: {
    readonly verb: DispositionVerb | CandidateVerb | null;      // null ⇒ withheld
    readonly confidence: number | null;
    readonly horizon: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
    readonly withheld: { readonly reasons: readonly string[]; readonly unmetInputs: readonly string[] } | null;
    readonly gates: readonly { gateId: string; outcome: 'PASS' | 'FAIL' | 'SKIP'; detail: string }[];
    readonly policyVersion: string;
    readonly definitionApplied: string;                          // the exact §A1 definition text version
  };

  readonly rationale: readonly {
    readonly rationaleId: string;
    readonly claim: string;                                      // deterministic template output
    readonly direction: 'SUPPORTS' | 'COUNTERS';
    readonly category: 'FUNDAMENTALS' | 'VALUATION' | 'RISK' | 'QUALITY' | 'MOAT' | 'DIVIDEND'
                | 'PORTFOLIO' | 'CONCENTRATION' | 'CORRELATION' | 'DATA';
    readonly weight: number;
    readonly evidenceIds: readonly string[];                     // ≥1 required
    readonly observationRefs: readonly string[];                 // ≥1 required
  }[];

  readonly falsifiers: readonly { statement: string; trigger: string; observation: string }[];   // "what would change this view"

  readonly portfolioImpact: {                                    // implication, NOT an order
    readonly kind: 'TARGET_WEIGHT_BAND';
    readonly currentWeightPct: Observation<number>;
    readonly targetWeightBand: { low: number; high: number } | null;
    readonly projectedSectorExposurePct: Observation<number>;
    readonly projectedConcentrationPct: Observation<number>;
    readonly projectedTopHoldingPct: Observation<number>;
    readonly deltaNotes: readonly string[];
    readonly notAnInstruction: 'This is a decision-support implication, not an order or a trade instruction.';
  };

  readonly review: {
    readonly nextReviewOn: string | null;
    readonly triggers: readonly { triggerId: string; condition: string; armed: boolean }[];
  };

  readonly evidence: readonly { evidenceId: string; claim: string; source: SourceRef }[];
  readonly limitations: readonly string[];
  readonly disclosure: { readonly decisionSupportOnly: true; readonly noTradeExecution: true; readonly nonProduction: true };
}
```

Flat `parameters`:

```jsonc
{
  "portfolioId": "pf-7f3a",
  "companyId": "IN:ISIN:INE009A01021",
  "securityClass": "EQUITY",
  "scopeKind": "EXISTING_HOLDING",
  "assessmentReportId": "r-…",
  "assessmentReportKey": "…64 hex…",
  "assessmentVersion": 3,
  "portfolioRevision": 12,
  "modelVersion": "disposition-engine/1.0.0",
  "policyVersion": "disposition-policy/1.0.0",
  "inputDigest": "sha256:…",
  "verb": "ACCUMULATE"
}
```

Including `verb` in `parameters` is deliberate: a verb change must change `reportKey`, so the chain's content identity distinguishes "same assessment, same portfolio, different conclusion" from a byte-identical repeat.

> **Amended by R-13 and R-14.** `observed` is defined as the true delta between stored versions with
> attribution kept separate and type-aware (R-13); boundary durability moves from "best effort" to a
> derived-gap + reconciliation protocol (R-14). The eight categories and the persistence policy below
> are retained.

### 3.6 `InvestmentChangeReport` (IID-03)

```ts
type ChangeCategory =
  | 'FUNDAMENTAL' | 'MARKET_VALUATION' | 'RISK_QUALITY' | 'DISPOSITION'
  | 'PORTFOLIO' | 'DATA_CORRECTION_RESTATEMENT' | 'MODEL' | 'IDENTITY_MAPPING';

interface InvestmentChangeReportPayload {
  readonly schemaVersion: 1;
  readonly artifact: { readonly kind: 'InvestmentChangeReport'; readonly subjectScope: string;
                       readonly comparatorVersion: string; readonly generatedAt: string;
                       readonly persistence: 'VERSION_BOUNDARY' | 'EPHEMERAL' };

  readonly comparison: {
    readonly subjectKind: 'CompanyAssessment' | 'HoldingDisposition';
    readonly subjectRef: { readonly companyId: CompanyId | null; readonly portfolioId: string | null; readonly holdingKey: HoldingKey | null };
    readonly from: { readonly reportId: string; readonly reportKey: string; readonly artifactVersion: number; readonly generatedAt: string;
                     readonly dataAsOf: string; readonly knownAsOf: string; readonly modelVersion: string; readonly policyVersion: string };
    readonly to:   { readonly reportId: string; readonly reportKey: string; readonly artifactVersion: number; readonly generatedAt: string;
                     readonly dataAsOf: string; readonly knownAsOf: string; readonly modelVersion: string; readonly policyVersion: string };
    readonly elapsedDays: number;
  };

  /** Attribution: separates "the world changed" from "our model changed". */
  readonly attribution: {
    readonly status: 'COMPUTED' | 'PARTIAL' | 'UNAVAILABLE';
    readonly unavailableReason: string | null;
    readonly dataEffect: readonly DimensionDelta[];      // old model × new data
    readonly modelEffect: readonly DimensionDelta[];     // new model × old data
    readonly interaction: readonly DimensionDelta[];
    readonly reproducedFrom: { readonly datasetVersionUsed: string | null; readonly modelVersionUsed: string | null };
  };

  readonly changes: readonly ChangeItem[];

  readonly summary: {
    readonly materialChangeCount: number;
    readonly byCategory: Readonly<Record<ChangeCategory, number>>;
    readonly narrative: readonly string[];               // deterministic, template-generated
  };

  readonly review: {
    readonly required: boolean;
    readonly priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    readonly reasons: readonly { reasonId: string; statement: string; trigger: string; evidenceIds: readonly string[] }[];
    readonly suggestedFocus: readonly string[];          // which questions to answer, not what to do
  };

  readonly materialityPolicyVersion: string;
  readonly limitations: readonly string[];
  readonly disclosure: { readonly decisionSupportOnly: true; readonly noTradeExecution: true; readonly nonProduction: true };
}

interface ChangeItem {
  readonly changeId: string;
  readonly category: ChangeCategory;
  readonly dimension: string;                          // 'revenueGrowth3y' | 'intrinsic.perShare.mid' | 'verb' | 'weightPct' …
  readonly semanticLabel: string;                      // human meaning, e.g. 'Earnings quality deteriorated'
  readonly previous: { readonly display: string; readonly value: number | string | null; readonly asOf: string; readonly source: SourceRef; readonly presence: Presence };
  readonly current:  { readonly display: string; readonly value: number | string | null; readonly asOf: string; readonly source: SourceRef; readonly presence: Presence };
  readonly delta: { readonly absolute: number | null; readonly relativePct: number | null; readonly unit: string | null };
  readonly direction: 'IMPROVED' | 'WORSENED' | 'NEUTRAL' | 'INDETERMINATE';
  readonly materiality: { readonly band: 'IMMATERIAL' | 'NOTABLE' | 'MATERIAL' | 'CRITICAL';
                          readonly basis: string; readonly thresholdRef: string };
  readonly cause: { readonly classification: 'DATA' | 'MODEL' | 'MARKET' | 'OPERATING' | 'PORTFOLIO' | 'IDENTITY' | 'MIXED' | 'UNATTRIBUTED';
                    readonly explanation: string; readonly attributionEvidence: readonly string[] };
  readonly evidenceIds: readonly string[];
}

interface DimensionDelta { readonly dimension: string; readonly oldModelNewData: number | null; readonly old: number | null;
                           readonly newModelOldData: number | null; readonly observed: number | null; readonly unit: string | null }
```

**Persistence policy (decision D-6):**

| Kind | Persisted? | Why |
|---|---|---|
| `VERSION_BOUNDARY` — the change from version *n−1* to *n*, produced at the moment version *n* is created | **Yes**, appended to the subject's `icr:` chain | The *explanation of record* at that moment depends on the model/policy then in force. Re-deriving it later under a new comparator version would silently rewrite history. |
| `EPHEMERAL` — any ad-hoc comparison the user requests (v2→v7, or a range across a year) | **No** | A deterministic projection over stored payloads. Persisting it would create unbounded records for zero evidential value. It carries `persistence: 'EPHEMERAL'`, is never assigned a `reportId`, and is served from the read transport. |

Both are computed by the *same* comparator from *stored* `canonicalPayload` bytes (§A3). Neither ever re-reads the source dataset to establish what a stored version said (C-6).

### 3.7 Identity, versioning, as-of and provenance requirements

| Requirement | `CompanyAssessment` | `HoldingDisposition` | `InvestmentChangeReport` |
|---|---|---|---|
| Subject identity | `companyId` (branded) + listing ids + identity binding ref | `holdingKey` + `companyId` + assessment ref | both endpoint refs verbatim |
| Durable identity | `reportId` from NP-04 only | same | same (boundary only) |
| Content identity | `reportKey` over 4 members incl. input digest | same | same |
| Version | `artifactVersion`, `supersedesReportId` single-parent | same | same |
| As-of clocks | `dataAsOf` **and** `knownAsOf` **and** stale flag | portfolio `asOf` + assessment ref's clocks | both endpoints' clocks |
| Dataset provenance | `datasetVersion` + `contentDigest` + `provider` + `quality` + `completenessPct` | inherited via assessment ref | both endpoints' + comparator's own dataset need |
| Model provenance | `modelVersion` + `policyVersion` in payload **and** `parameters` | same | both endpoints' |
| Assumptions | full `assumptions` block incl. every imputation | policy version + definition text version | referenced, not restated |
| Evidence | `evidence[]` with ids; every claim traceable | `rationale[].evidenceIds` non-empty | `changes[].evidenceIds` non-empty |
| Disclosure | decision-support / no-trade / non-production flags | same | same |

### 3.8 Append semantics (idempotency and chain integrity)

1. Compose content → validate invariants → `reportKey`.
2. `listSupersededBy(current)` → if the current version's `reportKey` equals the new one **and** the input digest matches, this is a **no-op**: return `{ status: 'UNCHANGED', reportId: current.reportId }`. No new version. Rationale: a repeated assessment run on an unchanged dataset is not an event.
3. Otherwise `appendVersion(…, supersedesReportId = current.reportId, content)`.
4. First assessment for a subject → `createInstance(...)`.
5. After append, produce the `VERSION_BOUNDARY` change report comparing the previous and new versions and append it to the `icr:` chain (best-effort; a comparator failure never rolls back the assessment — it records `comparisonUnavailable` in the read surface).

`validateArtifactChain()` from `artifact.ts` is reused unchanged for all three chains: contiguity, single-parent supersession, immutable ownership, fixed `reportType` + `portfolioId`.

---

## 4. Responsibilities: engines and repositories

### 4.1 Division of responsibility

| Component | Owner | Location (proposed) | Responsibility | Explicitly NOT its job |
|---|---|---|---|---|
| Fundamentals acquisition & snapshot | **IPD** (target) / IRR interim | `src/fundamentals/*` (IPD) · `frontend/server/investment/localFundamentalsStore.ts` (IRR interim) | Validate, normalise, checksum, version, retain as-filed documents; publish `manifest.json` | Scoring, valuation, any opinion |
| `FundamentalsReadPort` contract | IRR declares, IPD satisfies | `frontend/server/investment/fundamentalsReadPort.ts` | The only read surface for fundamentals; fail-closed boundary | Any I/O of its own |
| Identity resolution & corporate-action application | **IRR** (reads IPD identity as a hint) | `iips-platform/src/investment/identity/` | ISIN/symbol → `companyId`; ambiguity; action application | Mutating IPD identity; writing mappings back |
| Normalisation to analysis form | IRR | `iips-platform/src/investment/fundamentals/` | Period alignment, TTM, derived ratios, completeness, quality flags | Fetching data |
| Valuation | IRR | `iips-platform/src/investment/valuation/` | Sector method matrix, intrinsic range, MoS, sensitivity | Choosing what to do with a holding |
| Moat / dividends / risk | IRR | `iips-platform/src/investment/{moat,dividends,risk}/` | Evidence-based classification | Narrative generation beyond deterministic templates |
| Company Assessment engine | IRR | `iips-platform/src/investment/assessment/` | Compose the assessment payload + confidence | Persistence, transport |
| Holding Disposition engine | IRR | `iips-platform/src/investment/disposition/` | Apply disposition policy to assessment + portfolio context | Reading portfolios directly (it receives a snapshot) |
| Change comparator | IRR | `iips-platform/src/investment/change/` | Semantic comparison, attribution, materiality, review triggers | Recomputing stored versions |
| Artifact composition | IRR | `frontend/server/investment/*Composition.ts` | Payload → `ReportContent` via existing `composition.ts` | Minting `reportId` |
| Persistence | **IPD (NP-04)** via IRR port | existing `persistence-port.ts` / `np04-adapter.ts` | Append-only chains | Any IRR-local store |
| Read transport | IRR | `frontend/server/investment/investment-transport.ts` | GET-only read of artifacts + derived projections | Writes, generation |
| Generation CLI | IRR | `frontend/server/investment/generate-investment-artifacts.ts` | Operator-run precompute (assess → persist) | Being reachable over HTTP |
| UI | IRR | `frontend/src/features/investment/` | Present assessment, disposition, change timeline, coverage | Computing anything |

### 4.2 Engine responsibilities in detail

**Fundamentals normaliser** — turns as-filed documents into period records. Emits, for every line item: the value with `presence`, `basis` and `filingRef`; never a zero-fill; never a silent currency/unit change; never an unadjusted comparison across a split. Conflicts between two filings for the same (period, field) are retained as a `SOURCE_CONFLICT_UNRESOLVED` observation, not averaged.

**Completeness & quality gate** — computes `adequacy`. Any engine downstream reads `adequacy` and may withhold. No engine may *raise* adequacy.

**Valuation engine** — per-sector method selection (§A2), each method returning a per-share range with its own inputs and assumptions; the blended intrinsic is a declared weighted combination, suppressed entirely when any weighted method is unavailable (INV-5). Margin of safety is `null` if the price is missing; the engine never assumes yesterday's price.

**Moat engine** — evidence-count based; needs ≥2 independent dimensions persisting over ≥3 years plus a positive ROIC−WACC spread persisting ≥3 years for `WIDE`. A single strong year yields `INSUFFICIENT_EVIDENCE`, never `WIDE`.

**Dividend engine** — sustainability is a joint function of payout ratio, FCF coverage, leverage and history. Payout ratio alone never yields `COVERED`.

**Risk engine** — closed taxonomy, evidence-backed factors, explicit `UNVERIFIED` state. No risk factor without an observation or a filing reference.

**Confidence** — a declared formula over data and model confidence, with named caps (`ADEQUACY_PARTIAL`, `STALE_DATA`, `IMPUTED_INPUT`, `HIGH_METHOD_DISAGREEMENT`). Confidence is never raised to "look decisive"; its components are always exposed.

**Disposition engine** — ordered gates then verb selection (§A1). It cannot emit a verb when: identity unresolved, adequacy `INSUFFICIENT`, intrinsic `null`, required portfolio context missing, or security class not equity. It always emits ≥1 rationale with ≥1 evidence id, and always emits falsifiers.

**Change comparator** — pure function over two stored payloads plus, for attribution only, the ability to re-run the *previous* model version against the *new* dataset and vice versa. If either leg is unavailable, attribution degrades to `PARTIAL`/`UNAVAILABLE` and causal claims are suppressed — never guessed.

### 4.3 Reuse ledger (what is consumed vs what is built)

| Consumed unchanged | Built new |
|---|---|
| `canonical.ts` (`deriveReportKey`, `canonicalizePayload`) | `contracts/` (Observation, invariants, branded ids, closed vocabularies) |
| `artifact.ts` (`validateArtifact`, `validateArtifactChain`) | identity resolver + corporate actions |
| `persistence-port.ts`, `np04-adapter.ts`, `persistence.ts` | fundamentals read port + local snapshot store |
| `reports-transport.ts` patterns (fail-closed, sanitized errors) | investment read transport (GET only) |
| `reports.ts` client patterns (`noAuthFetch`, closed failure vocabulary, no partition literals) | `api/investment.ts` client |
| `pitReadContract.ts` / `pitReadBoundary.ts` pattern | `fundamentalsReadPort.ts` / boundary |
| `LiveDataRuntime` `DataSnapshot`/`DataSourceMeta` vocabulary | `FundamentalsSnapshot` (same fields, its own type) |
| `userPortfolioContract.ts` (`G2HoldingView`), `BrokerHoldingsPreview` | holding → subject assembly |
| `OntologyMapper` / `NormalizedHolding` (as labelled context only) | disposition portfolio context adapter |
| `ReportDetail.tsx` version-switch pattern, `ReportsWorkspace` list pattern | `SecurityIntelligence`, `ChangeTimeline`, `CoveragePanel` |
| 13 sector engines' metric vocabularies + verdict vocabulary | sector method matrix mapping, risk overlay mapping |

No sector engine file is modified. Where the assessment needs a sector-engine metric, it *maps into* the engine's declared input vocabulary (e.g. `TechnologyInput.evEbitda`) or reads the frozen output — it never edits or forks the engine.

---

## 5. Updated implementation sequence

Seven phases. Each is independently valuable, independently testable, and stops cleanly. Phases IID-0..IID-5 are IRR-only; nothing here requires an IPD change to proceed.

### IID-0 — Foundations and unknowns (no user-visible change)

| Item | Deliverable |
|---|---|
| 0.1 | Data-source decision recorded (§1.3 recommendation accepted/modified/refused) |
| 0.2 | **NP-04 scope-token probe**: in a throwaway DB, `createInstance` with `portfolioId = 'co:IN:ISIN:INE009A01021'`; record acceptance/rejection of the token, and behaviour on a duplicate `reportKey` |
| 0.3 | `contracts/` module: `Observation`, branded ids, closed vocabularies, `validate*` for INV-1..INV-6, golden vectors |
| 0.4 | Fundamentals dataset v0: 3 reference companies × 5 annual periods + 8 quarters, one deliberate restatement, one deliberately missing field, one demerger, checksums, manifest |
| 0.5 | `fundamentalsReadPort.ts` + `localFundamentalsStore.ts` (fail-closed boundary, no network) |

**Exit:** probe results recorded; dataset validates against its manifest; invariant and boundary tests green; no HTTP host string in the ingestion/read module graph.

### IID-1 — Identity and coverage

| Item | Deliverable |
|---|---|
| 1.1 | `identity/isin.ts`: format + Luhn |
| 1.2 | `identity/resolver.ts`: ladder §2.4, states §2.5 |
| 1.3 | `identity/corporateActions.ts`: table load, adjustment, merger/demerger re-keying |
| 1.4 | `CompanyIdentityBinding` emission + eligibility roster loader |
| 1.5 | Coverage computation over G3 holdings + broker preview (read-only), including bypass/unresolved rows |

**Exit:** tests T-2.1..T-2.9 green; coverage page shows every holding in exactly one state; no disposition can be produced for a non-`RESOLVED` holding.

### IID-2 — CompanyAssessment (IID-01)

| Item | Deliverable |
|---|---|
| 2.1 | `fundamentals/normalize.ts`, `periods.ts` (annual/quarterly/TTM, period alignment) |
| 2.2 | `fundamentals/completeness.ts` (adequacy gates), `quality.ts` (flags, verdict) |
| 2.3 | `valuation/sectorMethodMatrix.ts` (§A2), `methods.ts`, `intrinsic.ts`, `sensitivity.ts` |
| 2.4 | `moat/`, `dividends/`, `risk/` |
| 2.5 | `assessment/CompanyAssessmentEngine.ts`, `confidence.ts`, `explain.ts` (deterministic templates) |
| 2.6 | Golden assessments for the 3 reference companies, including the restated and the incomplete one |

**Exit:** assessments reproduce byte-identically; every withheld value names its unmet inputs; no zero appears without a source; determinism test over shuffled dataset ordering.

### IID-3 — HoldingDisposition (IID-02)

| Item | Deliverable |
|---|---|
| 3.1 | `disposition/policy.ts`: §A1 definitions, gate order, weight bands, horizons — versioned |
| 3.2 | Portfolio context adapter (weights, exposure, concentration, correlation from existing CSAS/CSIP surfaces) |
| 3.3 | `disposition/HoldingDispositionEngine.ts`, `portfolioImpact.ts` (target-weight bands only) |
| 3.4 | Rationale + falsifier generation with evidence linkage |
| 3.5 | Candidate path: existing-vs-new scope, `INITIATE`/`WATCH`/`AVOID_CANDIDATE` |

**Exit:** policy fixture matrix (§A1 table) produces exactly the specified verb or a stated withholding; no verb without ≥1 evidence-backed rationale; no order-shaped field in the payload.

### IID-4 — Persistence and read transport

| Item | Deliverable |
|---|---|
| 4.1 | `assessmentComposition.ts`, `dispositionComposition.ts`, `changeComposition.ts` |
| 4.2 | `generate-investment-artifacts.ts` operator CLI (assess → append; idempotent no-op) |
| 4.3 | `investment-transport.ts`: GET-only read surface, sanitized failures, 503 fail-closed |
| 4.4 | `frontend/src/api/investment.ts` client (closed failure vocabulary) |

Endpoints (all `GET`/`HEAD`; no `POST` exists on this surface):

```
GET /api/investment/coverage
GET /api/investment/company/:companyId                      → current assessment + version list
GET /api/investment/company/:companyId/versions/:reportId    → one stored version, verbatim payload
GET /api/investment/company/:companyId/changes?from=&to=     → ephemeral change projection
GET /api/investment/portfolio/:portfolioId/dispositions      → current disposition per RESOLVED holding
GET /api/investment/portfolio/:portfolioId/holding/:companyId
GET /api/investment/portfolio/:portfolioId/holding/:companyId/changes?from=&to=
```

**Exit:** chain contiguity holds across ≥3 appended versions; UNCHANGED no-op emits no version; a stored version's payload is byte-identical before and after later appends; no store construction in the module graph; no `POST`/`PUT`/`DELETE` route.

### IID-5 — Change intelligence (IID-03)

| Item | Deliverable |
|---|---|
| 5.1 | `change/classify.ts`: 8-category taxonomy (§A3) |
| 5.2 | `change/attribute.ts`: 2×2 attribution matrix |
| 5.3 | `change/materiality.ts` (policy-versioned thresholds), `review.ts` (triggers, priority) |
| 5.4 | Boundary-report emission on append; ephemeral projection for ad-hoc ranges |
| 5.5 | Category fixture suite: one fixture per category, including a restatement and a model-version bump |

**Exit:** every fixture classifies as specified; a payload-only formatting change produces zero semantic items; stored history is unaffected by dataset changes.

### IID-6 — UI integration

| Item | Deliverable |
|---|---|
| 6.1 | `/investment/company/:companyId` — Security Intelligence (identity banner, adequacy badge, fundamentals, valuation + sensitivity, moat, dividends, risk, evidence) |
| 6.2 | Disposition panel: verb, confidence, rationale, falsifiers, portfolio impact (target-weight band), withheld state |
| 6.3 | Change timeline: version list + semantic diff by category + review flags |
| 6.4 | Coverage panel: unresolved/ambiguous/ineligible/stale/out-of-scope holdings, dataset freshness |
| 6.5 | Sector-reference disclosure block (C-2), linked to the existing `/research/company/:id` |
| 6.6 | Portfolio detail integration: per-holding disposition entry point |

**Exit:** every degraded state renders a sanitized message and no fabricated number; no write affordance anywhere; sector-reference values visibly separated and labelled.

### 5.1 Dependency graph

```
IID-0 ──► IID-1 ──► IID-2 ──► IID-3 ──► IID-4 ──► IID-6
              │                  │           ▲
              └──────────────────┴──► IID-5 ┘
```
IID-5 depends on IID-2/IID-3 payload shapes and IID-4's stored-version reader. IID-6 depends on IID-4 being read-complete; it can begin against fixtures before IID-5 finishes.

---

## 6. Acceptance criteria

Each criterion is written to be falsifiable by a named test. `P` = phase.

### 6.1 Correctness and honesty (applies to all phases)

| ID | Criterion | Verification |
|---|---|---|
| AC-C1 | No numeric field anywhere in an assessment or disposition has value `0` unless `presence === 'PRESENT'` and a `source` is attached. | `contracts/invariants.test.ts` · INV-1/INV-3 over every golden vector |
| AC-C2 | Every `null` numeric carries a `reason` from the closed vocabulary. | INV-2 property test over generated payloads |
| AC-C3 | Every withheld aggregate names its unmet inputs and the unmet set is non-empty. | INV-5 test: delete one required input per aggregate, assert null + named input |
| AC-C4 | No imputation occurs without a recorded method and assumption reference, and any consumer of it shows a reduced confidence. | INV-4/INV-6 tests |
| AC-C5 | Identical inputs (dataset digest + model + policy + portfolio revision) produce byte-identical `canonicalPayload`, `reportKey`, and artifact content. | determinism test, 3 shuffles of dataset ordering + 3 process restarts |
| AC-C6 | No assessment or disposition field is derived from a sector-reference value. | structural test: engines' input type has no path to `sectorReferenceView`; plus a mutation test that perturbing the sector composite changes no assessment field |

### 6.2 Identity (P-IID-1)

| ID | Criterion |
|---|---|
| AC-I1 | A sector-reference id (`Banking-H1` etc.) is rejected as a company identity; no artifact can be composed for it. |
| AC-I2 | Invalid ISIN (bad Luhn) is rejected before any lookup; a valid-ISIN miss does not fall back to symbol. |
| AC-I3 | `AMBIGUOUS` yields no `companyId` and therefore no assessment and no disposition. |
| AC-I4 | A holding via operator bypass or with IPD `identityStatus: 'UNRESOLVED'` is displayed in coverage only, with zero numeric fields. |
| AC-I5 | Demerger with an unmapped successor yields `AMBIGUOUS` for the affected slice while the mapped slice remains assessable; portfolio totals reconcile to 100% of *measured* weight with unmeasured weight stated separately. |
| AC-I6 | Split adjustment preserves per-share consistency: EPS × shares within 0.01% across the action boundary. |

### 6.3 CompanyAssessment (P-IID-2)

| ID | Criterion |
|---|---|
| AC-A1 | Sector method matrix: for each of the 13 sectors, the selected primary/secondary/cross-check methods and explicit `NOT_APPLICABLE` reasons match §A2. A bank assessment contains no `DCF_FCFF` result and states why. |
| AC-A2 | `intrinsic` is `null` unless every weighted method has `applicable && output != null`; `marginOfSafety` is `null` unless price and intrinsic mid are `PRESENT`. |
| AC-A3 | Sensitivity grid is monotone in the expected direction: higher WACC ⇒ lower value; higher terminal growth ⇒ higher value (within the method's declared domain). |
| AC-A4 | Moat `WIDE` requires ≥3 consecutive positive ROIC−WACC spread years **and** ≥2 independent evidence dimensions; a single year or single dimension yields `NARROW`/`INSUFFICIENT_EVIDENCE`. |
| AC-A5 | Dividend `COVERED` requires payout ratio, FCF coverage and leverage all `PRESENT`; payout-ratio-only data yields `INSUFFICIENT_EVIDENCE`. |
| AC-A6 | A restatement creates a new `datasetVersion`, is listed in `data.restatements[]` with both `asFiled` and `restated` observations, and does **not** by itself change `adequacy`. |
| AC-A7 | Staleness: an assessment whose `knownAsOf` is older than policy allows sets `asOf.staleBeyondPolicy = true` and caps `confidence.caps` with `STALE_DATA`. |
| AC-A8 | Every `evidence[]` entry is referenced by at least one field; no orphan evidence; every rationale/claim field path resolves to a real path in the payload. |
| AC-A9 | The `assumptions` block lists every number a method consumed that is not an observed input (discount rate, terminal growth, horizon, method-specific). |

### 6.4 HoldingDisposition (P-IID-3)

| ID | Criterion |
|---|---|
| AC-D1 | The four verbs are emitted only in the exact conditions of §A1; the policy fixture matrix (≥12 cases) passes case-by-case. |
| AC-D2 | A new candidate never receives `RETAIN`/`ACCUMULATE`/`REDUCE`; it receives `INITIATE`/`WATCH`/`AVOID_CANDIDATE` or a withholding. |
| AC-D3 | Disposition is withheld (`verb: null`) when identity unresolved, adequacy `INSUFFICIENT`, intrinsic `null`, or required portfolio context missing — each with a named reason. |
| AC-D4 | Every disposition carries ≥1 rationale with ≥1 evidence id and ≥1 observation ref, and ≥1 falsifier. Counter-arguments are present when a `COUNTERS` condition is met. |
| AC-D5 | Portfolio implications use target-weight bands only; a schema test asserts absence of keys matching `/order|quantity|shares|price|broker|execution|side|tif/i` outside the observed-position block. |
| AC-D6 | Concentration and correlation influence the verb as specified: the same assessment with 2% weight and with 35% weight does not necessarily yield the same verb, and the delta is explained by a rationale naming the portfolio dimension. |

### 6.5 Persistence and immutability (P-IID-4)

| ID | Criterion |
|---|---|
| AC-P1 | `createInstance` once, `appendVersion` twice: chain is contiguous 1..3, each `supersedesReportId` points at the immediately prior `reportId`, `validateArtifactChain` passes. |
| AC-P2 | Re-running generation with an unchanged dataset/model/policy produces **zero** new versions and reports `UNCHANGED`. |
| AC-P3 | A version's stored `canonicalPayload` is byte-identical when read back after two further appends. |
| AC-P4 | No IRR-local store exists: a source-graph test asserts no `openDatabase`, no SQLite import, no `fs` write of artifacts, and that the composition modules receive the port by injection. |
| AC-P5 | With the NP-04 package unresolvable, the read transport answers 503 with a static message and constructs no substitute store. |
| AC-P6 | The read transport exposes no mutating method on any investment route. |
| AC-P7 | The investment surface leaks no partition literal, owner pair, filesystem path, SQL text or stack trace in any response or DOM node. |

### 6.6 Change intelligence (P-IID-5)

| ID | Criterion |
|---|---|
| AC-H1 | One fixture per category produces exactly that category's items and no others: `FUNDAMENTAL`, `MARKET_VALUATION`, `RISK_QUALITY`, `DISPOSITION`, `PORTFOLIO`, `DATA_CORRECTION_RESTATEMENT`, `MODEL`, `IDENTITY_MAPPING`. |
| AC-H2 | A change that alters only serialisation order or whitespace produces zero semantic items (the comparator is semantic, not structural). |
| AC-H3 | A model-version bump with identical data classifies as `MODEL` and its `cause.classification = 'MODEL'`; it is never reported as a fundamental change. |
| AC-H4 | A restated prior period classifies as `DATA_CORRECTION_RESTATEMENT`, not `FUNDAMENTAL`, even though the displayed number changed. |
| AC-H5 | Attribution: when both legs are computable, `dataEffect + modelEffect + interaction == observed` within 1e-9 relative tolerance. When a leg is unavailable, `attribution.status` is `PARTIAL`/`UNAVAILABLE`, the reason is stated, and `cause.classification` is `UNATTRIBUTED` rather than guessed. |
| AC-H6 | Review flags fire exactly on the declared triggers: disposition change, adequacy downgrade, MoS band crossing, new HIGH-severity risk, any restatement, identity change, model change beyond tolerance. |
| AC-H7 | Changing the source dataset after versions are stored does not change the reported diff (proves diff-from-stored, not diff-from-current). |
| AC-H8 | An ephemeral comparison is never persisted and never assigned a `reportId`; a boundary comparison always is. |

### 6.7 UI (P-IID-6)

| ID | Criterion |
|---|---|
| AC-U1 | No write affordance on any investment surface: no button, form, or state transition that persists anything. |
| AC-U2 | Every degraded state (dataset missing, artifact missing, identity unresolved, adequacy insufficient, port unavailable) renders a static, sanitized message with no fabricated values. |
| AC-U3 | Sector-reference values are in a visually distinct disclosure block labelled as sector-level reference intelligence, with a link to the existing sector view; no visual hierarchy implies it is company analysis. |
| AC-U4 | Absent values render as an explicit "not available — <reason category>" affordance, never as `0`, `-`, or a dash that reads as zero. |
| AC-U5 | The change timeline shows the two versions' `dataAsOf`/`knownAsOf`/model versions side by side, so the user can see whether a change is data or model. |
| AC-U6 | Keyboard navigation reaches every evidence link; no colour-only encoding of direction or materiality. |

### 6.8 Cross-cutting gates

| ID | Criterion |
|---|---|
| AC-X1 | `npm test` in `frontend` and `iips-platform` pass with the new suites; `npm run typecheck` clean. |
| AC-X2 | No network access at analysis or read time: a test asserts zero sockets opened during a full assess→persist→read cycle. |
| AC-X3 | No new dependency added without a pin recorded; no dependency on an exchange domain. |
| AC-X4 | Dataset is external to git: the local data directory is ignored; only small fixtures are committed, each <100 KB. |
| AC-X5 | No change to any file under `iips-platform/src/sector-engines/` — enforced by a diff assertion in the review checklist. |

---

## 7. Dependencies and unresolved questions

### 7.1 External dependencies (all already satisfied, none new)

| Dependency | Version/pin in use | Needed for |
|---|---|---|
| `iips-np04-governed-persistence` | `#2e11fa3b…` (existing second specifier) | all persistence |
| `iips-production-market-data` | `#279d1eed…` (existing primary pin) | PIT prices for MoS denominator, D114 |
| `iips-broker-import` | `#07e86a4f…` (existing alias) | holdings ingestion (already working) |
| React Router / Vitest / tsx | existing | UI, tests, CLI |

No new package is required by this design. If a licensed data API is adopted (§1.5, optional), it is a build-time/ingestion-time tool, not an analysis-time dependency.

> **Closed by R-19 (Part II).** Q-1 is answered by execution; Q-5, Q-8, Q-11 and Q-12 are resolved by
> R-6, R-16, R-15 and R-8 respectively; Q-9 and Q-10 are closed as out of scope / decided. The table
> below is preserved as the record of what was open at Revision 1 and the defaults that applied.

### 7.2 Unresolved questions, each with a stated default so nothing blocks

| ID | Question | Why it matters | Default if unanswered |
|---|---|---|---|
| **Q-1** | Does NP-04 accept a non-portfolio scope token in `portfolioId` (e.g. `co:IN:ISIN:…`)? Does it reject or dedupe a repeated `reportKey` on `createInstance`? | Determines the chain-scoping mechanism for all three artifacts | Probe in IID-0.2. Fallback F1: scope token encoded in `parameters` with `portfolioId = 'investment'` and one chain per artifact type (loses per-subject chains but keeps append-only). Fallback F2: surrogate scope id `scope-<sha256(scope)[0:16]>`, which is definitely opaque and fixed. |
| **Q-2** | Is the eligible roster D05-derived, user-derived (holdings ∪ watchlist), or operator-curated? | Defines the analysis universe and coverage expectations | Operator-curated file, seeded from holdings ∪ watchlist, capped at 200, every row requiring an ISIN |
| **Q-3** | Who owns fundamentals ingestion: IPD (target) or IRR (interim)? | Cross-repo work vs speed | IRR interim behind `FundamentalsReadPort`; IPD migration is a later adapter swap |
| **Q-4** | Is a licensed vendor adopted, and which one? | Data entry effort only — not analysis correctness | None in v1; XBRL + manual CSV. Vendor may be added later without touching engines |
| **Q-5** | Price source for margin of safety: PIT D01/D02 or the dataset's pinned EOD? | Consistency of MoS across versions | PIT if a snapshot exists for `knownAsOf`; else dataset `prices/eod.json`; else MoS withheld with reason |
| **Q-6** | Sector valuation method matrix — accepted as drafted in §A2? | Core of IID-01 | Adopt §A2 as `valuation-policy/1.0.0`; it is versioned, so a later revision is a normal `MODEL` change, not a rework |
| **Q-7** | Materiality thresholds (§A3 defaults) accepted? | Drives review-flag noise | Adopt defaults as `materiality-policy/1.0.0` |
| **Q-8** | Is a restatement's prior-period revision always available in the chosen source, or only sometimes? | Determines how often `DATA_CORRECTION_RESTATEMENT` can actually fire | Design assumes "sometimes"; absence yields `MISSING` with `FILING_UNAVAILABLE`, never a silent adoption of the restated figure |
| **Q-9** | Should the disposition consider the user's stated goals/risk profile? | Scope creep vs usefulness | **No** in v1. Portfolio context is exposure/concentration/correlation only. Goals-based overlay is a separate future capability |
| **Q-10** | Should ephemeral change reports ever be persisted? | Record volume vs audit value | No (§3.6). Reconsider only if a review workflow needs a signed snapshot of a review decision |
| **Q-11** | Dividends: derive from XBRL cash-flow (`Dividend paid`) or from a separate corporate-actions dividend table? | Accuracy of per-share DPS and coverage | Corporate-actions table primary; cash-flow total as corroboration. Disagreement ⇒ `SOURCE_CONFLICT_UNRESOLVED`, both shown |
| **Q-12** | Does the UI need deep-linking from a broker-import preview row into an assessment before the portfolio is saved? | UX vs the refusal semantics for unsaved holdings | Preview rows are resolvable but not dispositionable until saved; the preview link opens the company assessment only |

### 7.3 Known risks and mitigations

| Risk | Mitigation |
|---|---|
| Scope creep into a full research terminal | The four-verb vocabulary, the withholding gates, and the three artifact types are the whole product surface. Anything else is out of scope by construction. |
| Method-matrix bikeshedding blocks IID-2 | Matrix is a versioned policy artifact; the first version just has to be defensible, and every later change is a `MODEL` change with a change report |
| Change-report noise (every price tick) | Hysteresis + materiality bands (§A1.4, §A3.4); price-only changes are `MARKET_VALUATION` and immaterial below the band |
| Data entry becoming the project | Universe is capped and roster-curated; missing data degrades to `PARTIAL` adequacy and withheld valuation rather than blocking the build |
| Silent "helpful" defaults creeping in | INV-1..INV-6 validated at composition and again before persistence; a single test file enumerates every numeric field path and asserts its invariant |
| The assessment looking authoritative | Every artifact carries confidence components, assumptions, limitations, staleness and adequacy; the UI must surface adequacy adjacent to the verb, not in a footnote |
| Someone later wiring an exchange scraper into ingestion | Test AC-X2/§1.4 asserts no exchange host strings in the module graph; ingestion is file-in only |

---

## 8. Proposed file map

```
iips-platform/src/investment/                 # pure, deterministic, no I/O
  contracts/{types,ids,codes,observation,invariants,validate}.ts
  identity/{isin,resolver,corporateActions}.ts
  fundamentals/{normalize,periods,completeness,quality,derived}.ts
  valuation/{sectorMethodMatrix,methods,intrinsic,sensitivity}.ts
  moat/{evidence,classify}.ts
  dividends/{sustainability}.ts
  risk/{taxonomy,detect}.ts
  assessment/{CompanyAssessmentEngine,confidence,explain}.ts
  disposition/{policy,HoldingDispositionEngine,portfolioImpact,rationale}.ts
  change/{classify,compare,attribute,materiality,review}.ts
  fixtures/                                    # golden vectors, tiny, committed

frontend/server/investment/                    # adapters, composition, transport
  fundamentalsReadPort.ts                      # contract + fail-closed boundary
  localFundamentalsStore.ts                    # non-production snapshot reader
  identityBinding.ts                           # G2HoldingView / preview -> binding
  portfolioContext.ts                          # weights, exposure, concentration, correlation
  assessmentComposition.ts
  dispositionComposition.ts
  changeComposition.ts
  generate-investment-artifacts.ts             # operator CLI (tsx), no HTTP
  investment-transport.ts                      # GET/HEAD only
  *.test.ts

frontend/src/
  api/investment.ts                            # read-only client, closed failure vocabulary
  features/investment/{SecurityIntelligence,DispositionPanel,ChangeTimeline,CoveragePanel}.tsx
  app/App.tsx                                  # + /investment/company/:companyId, /investment/coverage

${IIPS_DATA_DIR}/investment/                   # gitignored, external to git (§1.6)
  manifest.json roster/ identity/ filings/ normalized/ prices/
```

Configuration: existing `IIPS_DATA_DIR` only. No new environment variable is strictly required; an optional `IIPS_INVESTMENT_DATASET_DIR` may override the default subdirectory.

---

## Appendix A1 — Disposition semantics (policy `disposition-policy/1.0.0`)

### A1.1 The two vocabularies, and why they are separate

| Scope | Vocabulary | Rationale |
|---|---|---|
| `EXISTING_HOLDING` | `RETAIN`, `ACCUMULATE`, `REDUCE`, `AVOID` | Each verb presupposes a position whose weight can be held, raised, lowered, or exited |
| `NEW_CANDIDATE` | `INITIATE`, `WATCH`, `AVOID_CANDIDATE` | `RETAIN` is meaningless for a zero position; reusing it would let "do nothing" mean two different things. `WATCH` is the honest state for "insufficient evidence to act, no disqualifying condition" |
| Either | `null` + `withheld` | Fails closed; never a fifth verb |

Correspondence (documented, not interchangeable): `ACCUMULATE` ↔ `INITIATE` (same criteria, different starting weight), `AVOID` ↔ `AVOID_CANDIDATE` (same disqualification), `RETAIN` has no candidate analogue, `WATCH` has no existing-holding analogue.

> **Superseded by R-9** for the *evidence thresholds* (which verb requires which adequacy), and by
> **R-10** for semantics (a disposition is an investment assessment, never a trade instruction). The
> gate *sequence* below is retained as the evaluation order; R-9 changes what each verb requires, not
> the order in which gates are checked. The hysteresis rule in §A1.4 is unaffected.

### A1.2 Gate order (evaluated first-to-last; a `FAIL` withholds)

| Gate | Condition to pass | On fail |
|---|---|---|
| **G-1 Identity** | `identityState === 'RESOLVED'`, `securityClass === 'EQUITY'` | withhold: `identity_unresolved` / `security_class_excluded` |
| **G-2 Security state** | `securityState === 'ACTIVE'` | withhold: `security_merged` / `security_delisted` / `security_suspended` |
| **G-3 Data adequacy** | `assessment.adequacy === 'SUFFICIENT'` | withhold: `insufficient_data` + unmet inputs |
| **G-4 Valuation present** | `intrinsic.perShare.mid` and `marginOfSafety.mosVsMid` both `PRESENT` | withhold: `valuation_unavailable` |
| **G-5 Portfolio context** | for `EXISTING_HOLDING`: `weightPct` and `sectorExposurePct` `PRESENT` | withhold: `portfolio_context_unavailable` |
| **G-6 Policy capacity** | single-name cap and sector cap evaluable | withhold: `policy_inputs_unavailable` |

After the gates, the verb is selected by the rules below, then subjected to **downward caps only** (`AVOID` < `REDUCE` < `RETAIN` < `ACCUMULATE`; caps take the minimum, mirroring the frozen sector engines' `CAP_RANK` precedence pattern).

### A1.3 Verb definitions

| Verb | Exact meaning | Entry conditions (all required unless marked) | Portfolio implication | Horizon / review |
|---|---|---|---|---|
| **RETAIN** | "Continue to own at approximately the current weight; nothing in the evidence justifies changing it." | Adequacy `SUFFICIENT`; `mosVsMid` in `[−5%, +15%)` (FAIR); `quality.verdict ∈ {CLEAN, MINOR_CONCERNS}`; no `UNRESOLVED` risk factor of severity ≥4; moat `∈ {WIDE, NARROW}`; dividends not `UNCOVERED`; weight within caps | Target band centred on current weight, ±5% relative | MEDIUM/LONG; next results |
| **ACCUMULATE** | "Increase exposure toward a higher target band because the price is below assessed intrinsic value by more than policy requires, and the company passes quality and evidence tests." | Gates pass; `mosVsMid ≥ +15%` (DISCOUNT or DEEP_DISCOUNT); moat `∈ {WIDE, NARROW}`; `quality.verdict ∈ {CLEAN, MINOR_CONCERNS}`; dividend not `UNCOVERED`; **projected** weight ≤ single-name cap; projected sector exposure ≤ sector cap; no `UNRESOLVED` severity-5 risk | Target band `[w + 0.25w, w + 0.50w]` where the multiple is set by MoS depth (DISCOUNT ×1.25, DEEP_DISCOUNT ×1.50); illustrative only | MEDIUM/LONG; next results or price band cross |
| **REDUCE** | "Decrease exposure toward a lower target band while continuing to own, because price now exceeds assessed value, or the position has become too large, or a specific deterioration has occurred." | Any one of: `mosVsMid ≤ −10%` (PREMIUM/SIGNIFICANT_PREMIUM); weight > single-name cap; dividend `UNCOVERED` with rising `netDebtToEbitda`; moat downgraded with spread turning negative; new `UNRESOLVED` severity-4+ risk | Target band `[w × 0.5, w × 0.75]`; explicitly non-zero | SHORT/MEDIUM; on the triggering evidence, not a calendar |
| **AVOID** | "The security no longer meets the minimum criteria for continued ownership." Not "sell today" — it states that continued ownership is not supported by the evidence. | Any one of: `quality.verdict === 'MATERIAL_CONCERNS'` with a named HIGH-severity flag; `mosVsMid ≤ −25%` **and** fundamentals deteriorating; `UNRESOLVED` severity-5 risk (e.g. going-concern, unresolved regulatory action); adequacy `SUFFICIENT` but FCF negative across ≥2 periods with leverage above the sector alert *and* dividend `UNCOVERED` | Target band `[0, 0]`; portfolio impact shows the exposure that the evidence does not support | Immediate review required; no execution implied or offered |
| **INITIATE** (candidate) | "Meets the same tests as ACCUMULATE, from a zero position." | ACCUMULATE conditions plus projected sector exposure within cap | Entry target band `[0.5c, c]` where `c` = single-name cap scaled by MoS depth; illustrative only | MEDIUM/LONG |
| **WATCH** (candidate) | "No disqualifying condition, but the evidence or the price does not yet justify a position." | Gates pass; one or more of: adequacy `PARTIAL`; `mosVsMid ∈ [0%, +15%)`; moat `INSUFFICIENT_EVIDENCE`; quality `UNVERIFIED` | No target band | Re-evaluated at each dataset version; explicit armed triggers (price band, next results, adequacy upgrade) |
| **AVOID_CANDIDATE** | "Fails the minimum investment criteria; do not initiate." | Mirror of `AVOID` | No target band | Re-evaluated only when a triggering evidence changes state |

### A1.4 Hysteresis (prevents disposition flapping)

A verb change between consecutive versions requires the governing metric to cross the threshold **by a margin** (default 5 percentage points on `mosVsMid`, 2 points on weight-vs-cap) **unless** a hard trigger fires (new severity ≥4 risk, adequacy downgrade, quality verdict change, restatement, identity change), in which case the change is immediate. The applied margin is recorded in `disposition.policyVersion` and the gate detail, so a change report can distinguish "a genuine reclassification" from "a 1% price move crossed a line".

### A1.5 What a disposition is not

Not a trade instruction; not a quantity, price, timing or order type; not a prediction of future price; not tax-, charge-, liquidity- or goal-aware in v1; not a substitute for the frozen sector engine's sector-level verdict; not derived from sector-reference conviction. Every disposition carries confidence components, at least one falsifier, and the definition version applied.

---

## Appendix A2 — Sector valuation method matrix (`valuation-policy/1.0.0`)

| Sector | Primary | Secondary | Cross-check | Explicitly NOT applicable (with reason) | Key inputs beyond statements |
|---|---|---|---|---|---|
| **Banking** | Residual income / P-B vs sustainable ROE | P/E on normalised earnings | Dividend discount | `DCF_FCFF` (deposit-funded balance sheet: FCFF is not meaningful); `EV_EBITDA` (debt is operating raw material) | NIM, GNPA/NNPA, CET1, CASA, credit cost |
| **Insurance** | P/EV | Appraisal value (EV + VNB multiple) | P/E on normalised PAT | `DCF_FCFF`; `EV_EBITDA` (float-funded) | VNB, VNB margin, persistency, solvency, combined ratio |
| **Capital Markets** | P/E | EV/EBITDA (brokers) / % of AUM (asset managers) | Dividend discount for high payout | `DCF_FCFF` for pure asset-light distributors (capital-light, FCF ≈ earnings; not informative) | AUM, net flows, cost-to-income, recurring % |
| **Healthcare** | EV/EBITDA | DCF (FCFF) on capex-cycle cash flows | P/E | — | Occupancy, ARPOB, payer mix, bed additions |
| **Hospitality** | EV/EBITDA (lease-adjusted) | DCF | NAV for owned-asset-heavy models | `P/B` (book does not reflect asset value) | Occupancy, ADR, RevPAR, management vs owned mix |
| **Energy** | EV/EBITDAX | NAV of reserves (DCF on production profile) | P/CF; dividend discount for integrated | `P/B`; `EV/Revenue` (commodity price distortion) | Reserves, reserve replacement, lifting cost, realisations |
| **Utilities** | RAB multiple / regulated-asset-value | Dividend discount | EV/EBITDA; DCF on allowed-ROE cash flows | `P/B` (book ≠ regulated asset base) | Rate base growth, allowed ROE, regulatory posture, SAIDI |
| **Consumer** | DCF (FCFF) | P/E | EV/EBITDA; dividend discount for staples | `EV/Revenue` (margin heterogeneity across staples/discretionary/luxury) | Price vs volume contribution, brand loyalty, channel mix |
| **Industrials** | EV/EBITDA (mid-cycle normalised) | DCF | P/E | Trailing-only multiples without cycle normalisation (not a method) | Order book, book-to-bill, aftermarket share, project risk |
| **Technology** | DCF with explicit growth fade | EV/EBITDA | EV/Revenue for growth subsegments; FCF yield | `P/B`; `EV/EBITDA` alone for high-growth SaaS (understates) — must be declared per subsegment | Recurring %, NRR, gross margin, R&D intensity, customer concentration |
| **Telecom** | EV/EBITDA | DCF (long capex horizon) | EV/subscriber | `P/B`; `P/E` as primary (D&A policy distorts) | ARPU, subscribers, capex intensity, spectrum/AGR exposure |
| **Auto** | P/E (mid-cycle) | EV/EBITDA (mid-cycle) | DCF | Peak-cycle trailing multiples without normalisation | Volumes, utilisation, market share, dealer network |
| **Materials** | EV/EBITDA (mid-cycle) | P/B vs through-cycle ROE | Replacement cost / NAV | `DCF_FCFF` on spot commodity prices (price-taking ⇒ circular) | Cost position (quartile), reserve life, commodity trend |

Rules: (a) the matrix is a *selection policy*, not a formula library — each method's arithmetic lives in `valuation/methods.ts`; (b) a method marked `NOT_APPLICABLE` for a sector may never contribute to the blend, and its reason is emitted; (c) subsegment overrides (e.g. Technology growth vs mature) must be declared in the method-selection record, never applied silently; (d) a blended intrinsic requires every weighted method to be `PRESENT`, and the blend weights are declared in `valuation.intrinsic.weighting`.

---

## Appendix A3 — Change taxonomy, attribution and materiality

### A3.1 The eight categories

| Category | What is compared (from stored payloads) | Classification rule | Attribution leg expected |
|---|---|---|---|
| **FUNDAMENTAL** | Revenue/EPS/margin/OCF/FCF/leverage/segment mix, trends and CAGR | Underlying reported values moved, and the movement is not explained by a restatement | `data` |
| **MARKET_VALUATION** | Price, `mosVsMid`, `mosVsLow`, band, implied multiples | Price or a market multiple moved; fundamentals unchanged | `data` (price is in the dataset) |
| **RISK_QUALITY** | `risk.factors[]` (new/resolved/severity), `quality.flags`, `quality.verdict`, moat class, adequacy | A factor appeared, resolved, or changed severity; a flag toggled; adequacy changed | `data` |
| **DISPOSITION** | Verb, confidence, gate outcomes, policy version | Verb or confidence band or gate outcome changed | mixed |
| **PORTFOLIO** | Weight, company exposure, sector exposure, concentration band, correlation flags, portfolio revision | Portfolio-level values changed while the company assessment did not | `portfolio` |
| **DATA_CORRECTION_RESTATEMENT** | `restatements[]`, `basis` transitions, prior-period revisions, source corrections | A prior period's value changed *and* a restating filing is the cause | `data`, but the change is attributed to correction, not performance |
| **MODEL** | `modelVersion`, `policyVersion`, method selection, thresholds, confidence formula | Model/policy version differs, or the same inputs produce different outputs across versions | `model` |
| **IDENTITY_MAPPING** | `companyId`, listing ids, security class, corporate-action application, listing-map version | The subject's identity binding changed | `identity` |

`IDENTITY_MAPPING` is an addition to the seven requested categories. Without it, a re-mapping (symbol change, merger, correction) presents as a fundamental collapse, which is the single most misleading thing this report could do.

### A3.2 Attribution: 2×2 matrix

For versions `v_old` and `v_new` with models `m_old`, `m_new` and datasets `d_old`, `d_new`:

|  | `d_old` | `d_new` |
|---|---|---|
| `m_old` | observed `v_old` | **A** = old model × new data |
| `m_new` | **B** = new model × old data | observed `v_new` |

- `dataEffect  = A − v_old`
- `modelEffect = B − v_old`
- `interaction = v_new − A − B + v_old`
- Identity check: `dataEffect + modelEffect + interaction = v_new − v_old` (AC-H5).

Requirements and degradations: **A** needs `d_old` to be retrievable — which the immutable `datasetVersion` + `contentDigest` make possible. **B** needs the old model version to still be runnable. If **A** is unavailable → `status: 'PARTIAL'`, no data-vs-model split; if **B** is unavailable → `status: 'PARTIAL'`; if neither → `UNAVAILABLE`, and every changed dimension's `cause.classification` is `UNATTRIBUTED`. *Re-running a model for attribution never alters or supersedes the stored version; it is a diagnostic, produced on the fly, and its inputs are recorded in `attribution.reproducedFrom`.*

### A3.3 Semantic comparison, not structural diff

The comparator walks a **declared semantic dimension map** (dimension path → comparison operator → unit → materiality threshold). Consequences:

- Re-serialisation, key reordering, added optional fields with identical value, or float formatting changes produce **no items** (AC-H2).
- A changed dimension with an unchanged *meaning* (e.g. intrinsic mid moved 0.4%, below band) is emitted as `IMMATERIAL` or suppressed per policy — it is never silently dropped, because `summary.byCategory` must reconcile with `changes[]`.
- Categorical dimensions compare by value plus declared equivalence classes (e.g. `DISCOUNT` ≈ `DISCOUNT`; `FAIR` → `DISCOUNT` is a band crossing and material).
- `Observation` presence transitions are first-class changes: `PRESENT → MISSING` is `WORSENED`/`MATERIAL` (evidence disappeared), never "value 0".

### A3.4 Default materiality thresholds (`materiality-policy/1.0.0`)

| Dimension | NOTABLE | MATERIAL | CRITICAL |
|---|---|---|---|
| Revenue / EPS / OCF (annual) | ±5% | ±10% | ±25% |
| Growth trend (CAGR / bps-per-year) | ±100 bps | ±200 bps | ±400 bps |
| Margin (EBITDA / operating) | ±50 bps | ±100 bps | ±250 bps |
| Leverage (net debt / EBITDA) | ±0.25× | ±0.5× | +1.0× |
| Intrinsic per-share mid | ±5% | ±10% | ±20% |
| Margin of safety (`mosVsMid`) | ±5 pp | ±10 pp | band crossing into/out of DISCOUNT |
| Moat class | — | any class change | `WIDE → NONE` |
| Risk factor | any change | new/removed severity ≥3 | new severity 5 |
| Dividend verdict | any change | `COVERED → STRETCHED/UNCOVERED` | `→ UNCOVERED` with rising leverage |
| Adequacy | any change | downgrade | downgrade to `INSUFFICIENT` |
| Disposition verb | any change | any change | `→ AVOID` / `AVOID_CANDIDATE` |
| Weight vs cap | ±2 pp | cap breach | cap breach + concentration band change |

### A3.5 Review triggers

`review.required = true` when any of: verb change; adequacy downgrade; MoS band crossing; intrinsic change ≥ MATERIAL; any restatement; identity change; model/policy change beyond tolerance; new severity ≥4 risk; a previously `UNRESOLVED` high-severity risk resolving; portfolio weight breaching a cap. `review.priority` = `HIGH` for CRITICAL items or any `AVOID`, `MEDIUM` for ≥2 MATERIAL items, `LOW` for a single MATERIAL item, else `NONE`. `review.suggestedFocus` lists *questions to answer* ("was the margin decline volume-led or price-led?"), never actions to take.

---

## Appendix A4 — Decision register (proposed, for acceptance or amendment)

| ID | Decision | Where |
|---|---|---|
| D-1 | Data source: operator-assisted XBRL as source of record + manual CSV fallback; vendor API optional as data-entry accelerator only; no runtime scraping | §1.3, §1.4 |
| D-2 | Target ownership: IPD owns ingestion/snapshot; IRR owns analysis; interim IRR-only behind `FundamentalsReadPort` | §1.5 |
| D-3 | Company identity is ISIN-keyed (`IN:ISIN:…`), branded, never a sector reference | §2.2, C-1 |
| D-4 | No fuzzy/name matching; ambiguity fails closed to `AMBIGUOUS` | §2.4 |
| D-5 | Three artifact types with scope-token chains on NP-04; `reportKey` inputs include data/model/policy/input digests | §3.1, §3.4–3.6 |
| D-6 | Boundary change reports are persisted; ad-hoc comparisons are ephemeral projections | §3.6 |
| D-7 | Disposition vocabulary is scope-split (4 verbs / 3 candidate verbs) with withholding as `null` | §A1.1 |
| D-8 | Hysteresis on verb changes, hard triggers exception | §A1.4 |
| D-9 | Valuation method matrix per sector, versioned policy | §A2 |
| D-10 | Eight change categories including `IDENTITY_MAPPING` | §A3.1 |
| D-11 | Attribution via 2×2 matrix; degrades to `UNAVAILABLE` rather than guessing | §A3.2 |
| D-12 | Sector-reference intelligence is disclosed in a labelled block and can never drive the assessment or the disposition | C-2, §4.3 |

## Appendix A5 — Closing scope statement (Revision 1)

This document is a design refinement. It changes no code, adds no dependency, performs no persistence
write, and creates no implementation obligation. It preserves the finding that the 13 sector engines and
the cross-sector intelligence layer are **sector-reference** intelligence; it does not treat their
conviction, quality, moat or verdict values as company-level analysis, and it converts that distinction
into validators that must be enforced in code.

> **Superseded by Part II §R-21** for the closing statement of Revision 2. The minimum next action
> recorded here (accept D-1, authorise Q-1) has been discharged: D-1 was accepted and the Q-1 probe was
> executed and recorded in §R-18.

---
---

# PART II — Revision 2 (2026-11-05)

**Consolidated correction, probe results and decision register.**

Part I remains the architecture of record. This part applies seventeen corrections arising from design
review, records the results of the Q-1 probe that was run against the pinned NP-04 artifact, and closes
the decision register. It does **not** reopen Part I's architecture, its reuse plan, or its three
artifact families.

Implementation sequencing is not in this part: it lives in
`docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md`.

## R0. What this revision supersedes

| Part I location | Status after this revision |
|---|---|
| §1.6 dataset manifest (`datasetVersion` includes a timestamp) | **Superseded by R-7** |
| §2.2 `CompanyId`, `HoldingKey`, `securityClass` naming | **Superseded by R-1 and R-8** |
| §2.7 `CompanyIdentityBinding` (single `companyId`) | **Amended by R-1** (three identity levels) |
| §3.4 `CompanyAssessment` fields for periods / metrics / valuation / dividends | **Amended by R-2, R-3, R-4, R-5, R-6, R-15** |
| §3.5 `HoldingDisposition` (`holdingKey`, portfolio impact, semantics) | **Superseded by R-8, R-10, R-11** |
| §3.6 change report (`observed` meaning, persistence policy) | **Amended by R-13, R-14** |
| §3.7 provenance requirements | **Extended by R-12** (build/runtime/config identity) |
| §A1.1–A1.3 disposition gates and verb conditions | **Superseded by R-9** (evidence thresholds) and **R-10** (semantics) |
| §A1.4 hysteresis | Retained unchanged |
| §A2 sector method matrix | Retained; **amended by R-5** (multi-segment/SOTP) and executed under **R-4** contracts |
| §A3 change categories | Retained; **amended by R-13** (additive/ordinal/nominal treatment) |
| §7.2 unresolved questions | **Closed by R-19** |
| Governance vocabulary throughout | **Reduced by R-17** |

## R-17 Governance and terminology simplification (applied to this part and the roadmap)

This is a single-user local application. The vocabulary of enterprise governance is removed from the
IID scope, because it adds ceremony without changing behaviour.

| Removed / replaced | Replaced with |
|---|---|
| "Program Authority", "PA determination", "PA act", "DECISION REQUIRED" | "the operator" (the single user) and "recommended; confirm or amend" |
| "production admission", "NOT ADMITTED", "production restriction", "gate report", "certification" | dropped entirely from IID scope |
| "approved roster" | "eligible roster" (an operator-maintained data file) |
| "authority to implement" | dropped — implementation proceeds on the roadmap |

**Retained constraints — these are technical, not ceremonial, and stay binding:** NP-04 as the only
artifact store; append-only lineage with chain validation; IRR/IPD ownership boundaries; no automatic
trading or execution path; read-only product surfaces; no fabricated values; the `WRITE_NOT_AUTHORIZED`
/ 503 fences that already exist in the runtime. Terminology referring to *existing frozen engine files*
("frozen", "certified v1.1 baseline") is retained where it names a fact about those files.

---

## R-1. Identity model: issuer, security, listing

Part I conflated issuer and security under one `CompanyId` built from an ISIN. That is wrong in two
directions: an issuer is not a security, and a security is not a listing. Corrected model:

```ts
/** The legal issuer. Fundamentals and assessments attach HERE. */
type IssuerId  = string & { __brand: 'IssuerId' };
//   IN:CIN:U72200KA1981PLC013115          primary form — MCA company identifier
//   IN:EQISIN:INE009A01021                fallback — issuer keyed by its primary EQUITY ISIN

/** A tradable security issued by an issuer. Holdings attach HERE. */
type SecurityId = string & { __brand: 'SecurityId' };
//   IN:ISIN:INE009A01021                  equity
//   IN:ISIN:INE009A01021*P                preference (illustrative namespace for non-equity)

/** A security as listed on one exchange. Prices and symbols attach HERE. */
type ListingId = string & { __brand: 'ListingId' };
//   IN:NSE:INFY      IN:BSE:500209
```

Rules:

1. **Issuer key basis is explicit and recorded.** Every issuer carries
   `issuerKeyBasis: 'CIN' | 'EQUITY_ISIN'`. The basis is part of identity, so a later CIN discovery is a
   recorded migration (alias row, `IDENTITY_MAPPING` change) — never a silent re-key that orphans history.
2. **One issuer, many securities.** `securities[]` on the issuer, each with its own `SecurityId`,
   `securityClass`, and `listings[]`. In v1 only `EQUITY` is assessable; others resolve to
   `OUT_OF_SCOPE_SECURITY` (resolvable, not assessable, never merged into equity figures).
3. **CIN validation is structural, not checksum.** 21 characters: listing status (1) + NIC-2004 industry
   code (5) + state code (2) + incorporation year (4) + ownership type (3) + registration number (6) +
   company type suffix (`PLC`/`PVT`/`OPC`/`LLP`…). CIN has no check digit, so validation is structural
   plus roster confirmation. A CIN/equity-ISIN disagreement produces `ISSUER_KEY_CONFLICT`, which
   withholds the issuer rather than picking a winner.
4. **ISIN validation is format + Luhn** over the expanded alphanumeric body (letters A=10…Z=35).
5. **Artifact subjects use `IssuerId`.** A holding references `SecurityId` and denormalises `IssuerId`.
6. **Chain scope tokens carry the level** so a chain cannot be misread:
   `co:<IssuerId>`, `hd:<portfolioId>/<SecurityId>`, `hc:<selector>/<SecurityId>`,
   `icr:<subjectScope>`. The probe confirmed all of these are accepted by NP-04.

Consequence for Part I §2.2/§2.5/§2.7: read `CompanyId` as `IssuerId`, and read `CompanyIdentityBinding`
as binding `(IssuerId, SecurityId, ListingId?)` rather than a single company key.

## R-2. Financial-period contract

Fundamentals are only comparable if these attributes are explicit per period. Every `FinancialPeriod`
carries all of them; a missing attribute is a normalisation defect, not a default.

| Attribute | Closed values / rule |
|---|---|
| `statementScope` | `CONSOLIDATED` \| `STANDALONE`. Policy: prefer `CONSOLIDATED` where published for the period; else `STANDALONE` with the substitution recorded. **Never mixed within one derived series.** A metric derived across mixed scopes is a defect; a comparative-series mismatch yields `MISSING: SCOPE_MISMATCH`. |
| `periodType` | `ANNUAL` \| `QUARTER` \| `TTM`. |
| `durationType` | `DURATION` (P&L, cash flow) \| `INSTANT` (balance sheet). Declared per line item, not per period. |
| `periodStart` / `periodEnd` | ISO dates. Fiscal year labelled by its **ending** year (`FY2026` = 2025-04-01 … 2026-03-31). Non-March year-ends supported; both bounds always explicit. |
| `quarterForm` | `YTD` \| `DISCRETE`. Indian filings commonly report cumulative YTD. `DISCRETE = Q(year, k) − Q(year, k−1)` **only when both are present and same-scope**; otherwise `MISSING: DERIVATION_NOT_SUPPORTED`. An annual figure is never used to derive Q4 by subtraction without the same check. |
| `currency` | `INR` for v1. A non-INR reporter ⇒ `PERIOD_CURRENCY_UNSUPPORTED`, adequacy `INSUFFICIENT`, no valuation. |
| `scale` | Source scale (`UNIT`, `THOUSAND`, `LAKH`, `MILLION`, `CRORE`) plus `scaleApplied: { from, to, factor }`. Stored canonical unit is INR. **No silent scaling.** |
| `signConvention` | Amounts are stored as declared in `lineItems.ts`: expenses/revenue as positive magnitudes with a declared `flow`; capex positive as outflow; dividends paid positive. No item may be stored as a negative magnitude where the line-item table declares positive. |
| `basis` | `AS_FILED` \| `RESTATED` \| `DERIVED`. Both as-filed and restated are retained for a restated period; analysis uses `RESTATED` when present, and the transition is reported (R-15, R-13). |
| `taxonomy` | `INDAS` \| `IGAAP` \| `INDAS_BANKING` \| `INDAS_INSURANCE` \| `OTHER`, per filing. |
| `normalizationVersion` | Version of the tag→line-item mapping used (`in-fin/1.0.0`). A change here is a `MODEL` change, so a normalisation fix never masquerades as a fundamental improvement. |
| `filingRef` | Immutable reference to the as-filed document (with `sha256`, `filedAt`). |

TTM = the most recent four `DISCRETE` quarters at the same `statementScope`; if any is unavailable,
`TTM = null` with reason. `INSTANT` items have no TTM.

## R-3. Sector operating metrics: sourcing, alignment, lineage, validation

Part I required sector-appropriate analysis but did not separate what is computable from statements from
what is not. That separation is the difference between an honest assessment and a fabricated one.

**Two coverage measures, reported separately and never combined into one score:**

- `statementCoverage` — proportion of the sector's mandatory *statement* line items present for the period.
- `operatingMetricCoverage` — proportion of the sector's mandatory *operating* metrics present, per metric.

**Three source classes** (`metricSourceClass`), each with mandatory lineage:

| Class | Meaning | Lineage required | Examples |
|---|---|---|---|
| `COMPUTED_FROM_STATEMENTS` | Deterministic from the normalised statements | formula id + input refs | EBITDA margin, debt/EBITDA, ROIC, ROCE, FCF yield, P/E, EV/EBITDA, interest cover, payout ratio |
| `OPERATOR_ENTERED` | Read from filing notes, investor presentation or the annual report and keyed in by the operator | `sourceRef` (document + page/locator) + `enteredAt` | NIM, GNPA/NNPA, CET1, CASA, VNB margin, EV, persistency, combined ratio, ARPU, occupancy, ADR/RevPAR, order book, capacity utilisation, reserve life, RAB, subscriber count, AUM |
| `VENDOR` | Supplied by a licensed API, written into the dataset at ingestion | provider + licence + retrievedAt | as above, when a vendor is adopted |

Each metric observation carries `metricDefinitionId` + `metricVersion` + `periodEnd` + `statementScope` +
`unit`. Two rules make the numbers trustworthy:

1. **Period and scope alignment.** An operating metric must match the period's `periodEnd` and
   `statementScope`. A metric dated to a different period, or computed on a different scope, yields
   `MISSING: PERIOD_MISMATCH` / `SCOPE_MISMATCH` — never forwarded as if aligned.
2. **Range and cross-field validation.** Closed plausibility ranges per metric (e.g. occupancy and
   persistency 0–100, ADR > 0, GNPA ≥ NNPA, CET1 > 0, reserve life > 0), plus cross-field checks
   (GNPA ≥ NNPA; CAR ≥ CET1; RevPAR ≈ occupancy × ADR within tolerance). A metric failing validation is
   retained but marked `METRIC_UNVALIDATED` and cannot satisfy a method's mandatory-input requirement.

**Withholding rule (this is the operative consequence).** Every valuation method declares
`mandatoryMetrics[]` with `requiredSourceClass` and `minimumDefinition`. If any mandatory metric is not
`PRESENT`, or is present only as `METRIC_UNVALIDATED`, or is present at an insufficient source class for
that method, the method is `applicable: false` with a named reason. If every method for the sector is
inapplicable, `intrinsic = null`, `marginOfSafety = null`, and any disposition is withheld — the
assessment still publishes fundamentals, dividends, risk and the adequacy explanation.

**Honest scope statement.** For banking, insurance, capital markets and telecom, the *primary* method
depends on operator-entered metrics. Until those are entered, those sectors produce `PARTIAL`
assessments with valuation withheld. This is a designed outcome, not a defect: it is visible in
`operatingMetricCoverage` and in the per-sector ladder of the roadmap, and it is the reason the roadmap
enables sectors in stages rather than claiming 13-sector coverage on day one.

## R-4. Valuation contracts

Part I specified which methods apply per sector; it did not specify what they compute. Each method below
is a contract: formula, mandatory inputs, per-share conversion, and the withholding trigger.

### R-4.1 Shared capital-structure block (mandatory for every enterprise-value method)

| Input | Definition | Rule |
|---|---|---|
| `netDebt` | (short-term borrowings + current maturities of long-term debt + long-term borrowings + **lease liabilities**) − (cash & cash equivalents + liquid / fair-value investments) | **Excludes** restricted cash, margin money, and balances held for regulatory purposes. Both components are recorded so the subtraction is auditable. |
| `leaseTreatment` | `IND_AS_116_CAPITALISED` \| `PRE_116_FLAGGED` \| `OPERATING_LEASE_OFF_BS` | A comparative period predating IND AS 116 is flagged; it is not silently restated into the new basis. |
| `minorityInterest` | Balance-sheet non-controlling interest at the latest instant | Required for EV→equity; if absent, EV methods withhold. |
| `preferenceCapital` | Redeemable and non-redeemable preference at carrying value | Deducted from EV. |
| `associatesAndJV` | Share of associates/JV | Policy: included at carrying value; the policy version is recorded. |
| `dilutedShares` | Issued equity shares at `periodEnd`, split/bonus adjusted, plus dilutive potential shares (ESOP, convertible instruments) at period end | If dilutive potential is unavailable: basic count with `DILUTION_PROXY` flag and a confidence cap. |
| `shareCountPeriod` | The period the count belongs to | If it differs from the numerator's period ⇒ `SHARE_COUNT_PERIOD_MISMATCH` ⇒ **per-share outputs withheld** (enterprise-level outputs may still publish). |

`equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV`,
`perShare(X) = X / dilutedShares`.

### R-4.2 Methods

| `methodId` | Formula (per share unless stated) | Mandatory inputs | Withholding trigger |
|---|---|---|---|
| `DCF_FCFF` | `FCFF_t = EBIT_t(1−t) + D&A_t − capex_t − ΔNWC_t`; `EV = Σ FCFF_t/(1+WACC)^t + TV/(1+WACC)^n`, `TV = FCFF_{n+1}/(WACC−g)`; then §R-4.1 to per share | 3y EBIT/D&A/capex/NWC, tax rate, WACC, `g`, horizon | any input missing; `WACC ≤ g`; `g` above the policy cap |
| `RESIDUAL_INCOME` | `V = BV_0 + Σ (ROE_t − COE)·BV_{t−1}/(1+COE)^t + TV`; `TV = (ROE_{n+1}−COE)·BV_n/((COE−g)(1+COE)^n)` | book value per share, ROE path, COE, `g` | COE missing; book value missing |
| `DDM` | Two-stage: `V = Σ D_t/(1+r)^t + D_{n+1}/((r−g)(1+r)^n)` | DPS history, payout policy, `r`, `g` | dividend history < 3y; `r ≤ g` |
| `P_E` | `V = normalisedEPS × targetMultiple`; `normalisedEPS` = mean of 3–5y EPS excluding items flagged as one-off | EPS series, one-off flags, target multiple (observed or policy) | EPS history < 3y; no defensible multiple |
| `EV_EBITDA` | `EV = EBITDA_midCycle × multiple` → §R-4.1 | `EBITDA`, multiple, capital structure block | EBITDA ≤ 0; structure incomplete |
| `EV_EBITDAX` | as above using EBITDAX (EBITDA + exploration write-offs) | EBITDAX, multiple, structure block | as above |
| `EV_REVENUE` | `EV = revenue × multiple` → §R-4.1 | revenue, multiple, structure block | revenue missing; multiple unsupported by subsegment policy |
| `EV_SUBSCRIBER` | `EV = subscribers × valuePerSubscriber` → §R-4.1 | subscriber count (operating metric), benchmark value per subscriber | subscriber metric missing/unvalidated |
| `P_B` | `V = BVPS × targetPB`, target from `(ROE−g)/(COE−g)` | BVPS, ROE, COE, `g` | ROE or COE missing; ROE ≤ g |
| `P_EV` | `V = (EV_company × targetMultiple_ev + appraisalOfVNB) / shares` → per share | embedded value, VNB, multiple | EV or VNB missing |
| `P_AUM` | `V = AUM × targetMultiple / shares` | AUM (operating metric), multiple | AUM missing |
| `RAB` | `V = (RAB × targetRABMultiple − netDebt)/shares` | regulatory asset base (operator-entered), allowed ROE, multiple | RAB missing |
| `NAV_RESERVES` | `NAV = Σ_t PV(net production_t × (price_t − liftingCost_t)) − netDebt`, then per share | reserves, production profile, price deck, lifting cost | reserves or production missing |
| `SOTP` | `V = Σ_segments (segmentMetric × segmentMultiple) − netDebt − minority − pref + non-operating assets`, per share | per-segment financials, per-segment multiple, ≥3 periods | see R-5 conditions |

Every method result carries `formulaId`, `formulaVersion`, `inputs[]` (each an `Observation` with
presence), `assumptions{}`, `allowsImputation`, and `evidenceIds[]`.

### R-4.3 Assumption policy

| Assumption | Allowed basis | Constraint |
|---|---|---|
| `discountRate` (WACC) | `WACC_DERIVED` (risk-free + β×ERP; post-tax cost of debt at market weights) \| `OPERATOR_SET` \| `POLICY_DEFAULT` | a `POLICY_DEFAULT` must be recorded with its components and caps confidence |
| `terminalGrowth` (g) | `DERIVED` \| `POLICY_DEFAULT` | hard cap: `g ≤ longRunNominalGdpGrowth` (policy value); exceeding it is a **rejection**, not a warning |
| `forecastHorizon` | `POLICY_DEFAULT` (5y typical, 10y for infrastructure/telecom) | recorded per method |
| `targetMultiple` | `OBSERVED` (peer/historical, with source) \| `POLICY_DEFAULT` | `POLICY_DEFAULT` caps confidence |
| `taxRate` | `EFFECTIVE` (reported) \| `STATUTORY` | recorded |
| One-off / exception items | `OPERATOR_FLAGGED` or `DERIVED` from a declared rule | a `normalisedEPS` may not exclude items without a recorded basis |

No assumption may be varied between methods for the same assessment without appearing in
`assumptions.methodSpecific[]`. A change to any policy value is a `MODEL` change (see R-13).

## R-5. Sector classification, multi-segment business and sum-of-parts

Part I assigned one sector per issuer. Real listed companies are frequently multi-segment, which changes
which methods are legitimate.

1. **Primary sector** comes from the eligible roster, normalised to one of the 13 names, and drives the
   default method set and the sector-engine mapping.
2. **Segment data**: `segments[] = { name, sector, revenue, ebit, assets, periodEnd, sourceRef }` from
   filing segment notes or operator entry.
3. **Classification rules**: if the largest segment is < 60 % of revenue ⇒ `MULTI_SEGMENT` flag; if two or
   more segments are each ≥ 25 % ⇒ `SOTP_CANDIDATE`.
4. **SOTP is available only when**: every segment with ≥ 10 % of revenue has an assigned sector, and each
   has ≥ 3 periods of segment financials. Otherwise `SOTP.applicable = false` with reason
   `SEGMENT_DATA_INSUFFICIENT`, and the assessment uses the single blended method set for the primary
   sector.
5. **No unexplained conglomerate discount.** If a discount is applied, it is an explicit assumption with a
   policy id. If not applied, the assessment says so.
6. Segment-level classification never changes the issuer's identity or its `primarySector`; it only adds
   evidence and enables `SOTP`.

## R-6. Data freshness and price alignment

1. **Freshness is per series and per metric, not global.** The payload carries
   `freshnessByStatement { pnl, balanceSheet, cashFlow } = { lastPeriodEnd, daysSincePeriodEnd, staleBeyondPolicy }`
   and `freshnessByMetric[]` for operating metrics. `asOf.knownAsOf` remains the single knowledge cutoff.
2. **Per-statement staleness policy** (versioned, in `freshness-policy`): a P&L older than ~200 days past
   period end, or a balance sheet older than ~250 days, is `staleBeyondPolicy` and caps confidence with
   `STALE_DATA`.
3. **Price observations are first-class**:
   `PriceObservation { value, currency, asOf, kind: 'CLOSE' | 'VWAP' | 'LAST', source: 'PIT_D01' | 'DATASET_EOD', snapshotId | datasetVersion, adjustment: { factor, corporateActionId } | null }`.
4. **Alignment rule.** The price used for margin of safety must satisfy `knownAsOf ≤ price.asOf ≤ generatedAt`
   and be no older than the policy window (default 5 trading days). Otherwise `PRICE_STALE` and
   **margin of safety is withheld** — never computed from a stale or mismatched price.
5. **No substitution of any kind**: not yesterday's close, not another listing's price, not an unadjusted
   price across a split or bonus. If a corporate action falls between the price date and the period end, an
   adjustment factor is required or the price is refused.
6. **Reproducibility**: a stored assessment records the exact price observation it used, so its margin of
   safety can be verified later without re-reading a live feed.

## R-7. Dataset identity: content digest vs import time

Part I's manifest folded a timestamp into `datasetVersion`, which would mint a new version on every
re-import of identical data and generate pointless artifact versions.

Corrected:

- `contentDigest = sha256(canonical(roster, listing-map, corporate-actions, filing-index minus volatile
  fields, all normalised period records, price records))`.
- `datasetVersion = contentDigest` (optionally prefixed by the schema id). **Identity is content only.**
- `lastImportAt`, `importRunId`, file mtimes, and index ordering are recorded **outside** the digest and
  are explicitly listed in `digestScope.excluded[]`.
- Consequence: re-importing the same files, or re-keying the same content in a different order, produces
  the same `datasetVersion`; the composer then returns `UNCHANGED` (probe P-7 confirms NP-04 will happily
  append a duplicate, so the composer must prevent it).

## R-8. Holding and candidate identity

Part I required a `holdingKey` for every disposition, which forces a candidate to pretend it is already a
holding. Corrected subject model:

```ts
type DispositionSubject =
  | { readonly kind: 'HELD';
      readonly portfolioId: string;
      readonly positionKey: PositionKey;      // `${portfolioId}#${SecurityId}`
      readonly securityId: SecurityId;
      readonly issuerId: IssuerId; }
  | { readonly kind: 'CANDIDATE';
      readonly issuerId: IssuerId;
      readonly securityId: SecurityId;
      readonly contextPortfolioId: string | null;   // may be null: no portfolio involved
      readonly origin: 'WATCHLIST' | 'ROSTER' | 'SCREEN'; };
```

- A `CANDIDATE` has **no** position key and no position facts. Quantity, average cost, market value and
  unrealised P&L are `NOT_APPLICABLE` — explicitly not `MISSING`, and certainly not `0`.
- Chain scopes stay separate: `hd:<portfolioId>/<SecurityId>` for held, `hc:<contextPortfolioId|none>/<SecurityId>`
  for candidates. A candidate can never appear on a held chain, and vice versa.
- A candidate becomes a holding through a real portfolio save (IPD), which creates a *new* `hd:` subject;
  it does not inherit the candidate's chain.

## R-9. Disposition adequacy: the per-verb evidence matrix

Part I said all dispositions require `SUFFICIENT` adequacy, and separately offered `WATCH` on `PARTIAL`
evidence. Those two statements cannot both hold. Resolved by stating the requirement **per verb**:

| Verb | Scope | Identity | Adequacy required | Valuation required | Portfolio context | Additional |
|---|---|---|---|---|---|---|
| `RETAIN` | HELD | RESOLVED | `SUFFICIENT` | MoS present | required | no unresolved severity ≥ 4 risk |
| `ACCUMULATE` | HELD | RESOLVED | **`SUFFICIENT` only** | MoS ≥ +15 % | required | within caps; no unresolved severity 5 |
| `REDUCE` | HELD | RESOLVED | `SUFFICIENT` **or** `PARTIAL` when the reduction trigger is itself independently evidenced (concentration breach, limits breach) | MoS present **unless** the trigger is a limits breach | required | — |
| `AVOID` | HELD | RESOLVED | `SUFFICIENT`, **or** `PARTIAL` when the disqualifier is a discrete evidenced fact (e.g. an as-filed going-concern note) | not required when the disqualifier is qualitative-but-evidenced | not required | disqualifier must cite evidence |
| `INITIATE` | CANDIDATE | RESOLVED | **`SUFFICIENT` only** | MoS ≥ +15 % | caps require exposure context | within sector cap |
| `WATCH` | CANDIDATE | RESOLVED | **`PARTIAL` or `SUFFICIENT`** | not required | informational only | no disqualifying condition |
| `AVOID_CANDIDATE` | CANDIDATE | RESOLVED | `SUFFICIENT` or `PARTIAL` with a discrete evidenced disqualifier | not required | not required | disqualifier cites evidence |

Two invariants fall out, and are the testable core of the correction:

- **No exposure-increasing verb may rest on `PARTIAL` evidence.** `ACCUMULATE` and `INITIATE` demand
  `SUFFICIENT`; nothing else does.
- **`WATCH` is the designated state for a candidate whose evidence is `PARTIAL`.** It is not "RETAIN for a
  zero position", it carries no target band, and it is re-evaluated at the next dataset version.

A `PARTIAL` assessment of a *held* position may therefore yield at most `RETAIN`, or `REDUCE`/`AVOID` when
a discrete evidenced trigger exists.

## R-10. Disposition semantics: an investment assessment, never a trade instruction

Every disposition payload carries an explicit interpretation block:

```ts
readonly interpretation: {
  readonly nature: 'INVESTMENT_ASSESSMENT';
  readonly notAnInstruction: 'This is an investment assessment, not a trade instruction, order, or recommendation to transact at a price or time.';
  readonly noExecutionPath: true;
  readonly verbsMean: Readonly<Record<DispositionVerb | CandidateVerb, string>>;  // the exact R-9/A1.3 text
};
```

Specifically for **AVOID**: it means *"the evidence no longer supports continued ownership"* (or, for a
candidate, *"the evidence does not support initiating"*). It does **not** mean sell now, sell in full, sell
at a price, or sell at all within any timeframe. Part I's phrasing "target band `[0,0]`" implied an action
and is replaced by:

```ts
readonly impliedTargetWeightBand: { low: number; high: number } | null;
// interpreted as: the exposure the evidence would support, nothing more
```

`portfolioImpact` is renamed **`portfolioImplication`** for the same reason: it describes what a verb
implies about exposure, not what to do. No investment surface offers an order, a quantity, a price, a
broker link or a timing control.

## R-11. Portfolio limits: source, configuration, effective dates, checking

1. **Source.** A versioned `limits-policy` file in the local data domain:
   `{ policyVersion, effectiveFrom, singleNameMaxPct, sectorMaxPct: { <sector>: pct }, cashBufferPct?, minPositionPct? }`.
   Operator-editable; digest-recorded; dated.
2. **Precedence.** Explicit policy file → `disposition-policy` defaults (single-name 10 %, sector 30 %,
   recorded with `basis: 'POLICY_DEFAULT'`) → if neither is readable, the gates fail with
   `policy_inputs_unavailable` and no verb is emitted. A default is never presented as an operator choice.
3. **Every disposition records** `limitsPolicyVersion`, `effectiveFrom`, and the resolved caps actually
   applied, so a later limits change does not retroactively alter a stored assessment.
4. **Checking.** `ACCUMULATE` and `INITIATE` are checked against the **projected** weight band's high end
   and the projected sector exposure at that same high end, using the same price as the assessment. On
   breach: `ACCUMULATE → RETAIN` with gate `CAPACITY_SINGLE_NAME` (or → `RETAIN` with `CAPACITY_SECTOR`),
   and `INITIATE → WATCH`. The cap that fired is named in the gate outcome and in a rationale line.
5. **Effective dating** means an assessment produced under limits L1 stays interpretable after L2 ships;
   the change report will classify any resulting verb change as `PORTFOLIO`, not `MODEL`.

## R-12. Historical reproducibility

Reproducing a stored assessment requires more than a model version string. Every artifact carries:

```ts
readonly reproduction: {
  readonly modelVersion: string;
  readonly modelBuildDigest: string;        // sha256 of the built engine bundle, or the source commit
  readonly platformCommit: string;          // IRR commit that produced the payload
  readonly dependencyPins: readonly { name: string; specifier: string; resolvedCommit: string }[];
  readonly runtime: { node: string; range: string };
  readonly configDigest: string;            // sha256 over policy + limits + method matrix + thresholds + normalisation version
  readonly datasetVersion: string;
  readonly entrypointVersion: string;
};
```

Use in change intelligence (R-13): before any attribution is claimed, the comparator **reproduces**
`v_old` from its recorded `modelBuildDigest` + `datasetVersion` + `configDigest` and compares the
recomputed payload digest against the stored one.

- Match ⇒ attribution may be computed.
- Mismatch or non-reproducible model ⇒ `attribution.status = 'UNAVAILABLE'`, reason recorded, every
  affected dimension's `cause.classification = 'UNATTRIBUTED'`. **No inferred attribution.** A partially
  reproducible case (one leg available) is `PARTIAL` and claims only the leg it can prove.

## R-13. Change intelligence: `observed` and categorical treatment

Part I left `observed` ambiguous between "the stored delta" and "the attribution sum". Corrected:

1. **`observed` is the real delta between the two stored versions**, computed from their payloads:
   `observed = { from, to, absolute: to − from, relativePct, unit }`. It never depends on attribution and
   is available even when attribution is `UNAVAILABLE`.
2. **Attribution is separate and additive-verified.** `dataEffect + modelEffect + interaction` must equal
   `observed.absolute` within tolerance; if the dimension is not additive (ratios, ordinals, presence
   transitions), `attribution.additive = false` and no split is asserted.
3. **Dimension types are declared**, which is what makes the treatment principled rather than ad hoc:

| Type | Examples | Treatment |
|---|---|---|
| `ADDITIVE` | revenue, EBITDA, PAT, OCF, FCF, net debt, per-share values | numeric delta + attribution split |
| `RATIO` | margins, CAGR, ROIC, leverage, MoS | numeric delta; attribution *not* additive — reported as a level change with both legs shown, never summed |
| `ORDINAL` | moat (`NONE<NARROW<WIDE`), adequacy, quality verdict, materiality, disposition conservatism (`AVOID<REDUCE<RETAIN<ACCUMULATE`) | categorical item with `direction` from the declared scale |
| `NOMINAL` | sector, verb identity, security state, method applicability, flag presence | categorical item, `direction: 'INDETERMINATE'`, cause from the change set rather than arithmetic |
| `PRESENCE` | any `Observation` transitioning `PRESENT ↔ MISSING` | always `MATERIAL` when it goes `PRESENT → MISSING`; never rendered as a numeric change |

4. **Categorical changes are a separate item type** (`CategoricalChangeItem`) with `from`/`to` labels,
   an `equivalenceClass` for tolerated renames, and no numeric attribution. `DISPOSITION` changes take
   their cause from the dimensions that moved in the same comparison, and say so
   (`cause.basis: 'FROM_CHANGESET'`).

## R-14. Version-boundary durability and reconciliation

Part I treated the boundary report as "best effort", which allowed a persisted assessment to exist with no
recoverable explanation. Corrected protocol:

1. **Order and authority.** Append the assessment **first**; it is the record of truth and is never blocked
   by the comparator. Then append the boundary report on `icr:<subjectScope>`.
2. **No ledger, no new store.** "Does version N have an explanation?" is *derived*: a boundary report
   exists for N iff some artifact on `icr:<subjectScope>` has `comparison.to.reportId == N.reportId`.
   Gap detection therefore needs no additional persistence, and cannot drift from the artifacts.
3. **Coverage is surfaced, not hidden.** The read model exposes
   `boundaryCoverage { versions, explained, missing: [reportId…] }`, and the UI shows an explicit
   "explanation unavailable for version N" state rather than an empty timeline.
4. **Reconciliation command.** `reconcile-boundaries` scans every subject chain, finds unexplained
   versions, and generates the missing boundary reports:
   - if the version's recorded model is still reproducible ⇒ a normal `VERSION_BOUNDARY` report;
   - otherwise ⇒ `VERSION_BOUNDARY_RECONSTRUCTED`, with `attribution.status = 'UNAVAILABLE'` and a
     recorded reason. A reconstructed explanation is labelled, never presented as contemporaneous.
5. **Why not two-phase commit.** NP-04 has no distributed transaction across chains; a two-phase approach
   would risk losing an assessment to protect a commentary artifact. Assessment durability wins; the
   boundary is recoverable and its absence is visible.
6. **Automatic retry.** The generation CLI runs reconciliation at the end of every run, so the normal case
   self-heals within the same command.

## R-15. Dividend sourcing and conflict reporting

Retained from Part I with the conflict handling made explicit:

- **Primary**: the corporate-actions table (declaration / ex-date / record date / paid amount, split and
  bonus adjusted).
- **Corroboration**: XBRL cash-flow `dividends paid`, divided by the period's diluted share count to give
  an implied DPS.
- **Reconciliation block** on every assessment:
  `{ dpsDeclared, dpsImplied, deltaPct, status: 'CONSISTENT' | 'DIVERGENT' | 'NOT_COMPARABLE', reason }`.
- `NOT_COMPARABLE` when the scopes differ (cash flow may include dividends to non-controlling interests,
  or the payment may fall in a different period than the declaration).
- `DIVERGENT` (|delta| > 10 %, or a sign contradiction) raises `DIVIDEND_SOURCE_CONFLICT`, keeps **both**
  values visible, and caps dividend confidence.
- Neither source overwrites the other. When only one is present, sustainability may be computed from it
  with `basis` recorded and the corroboration field marked `MISSING` with a reason.

## R-16. Coverage validation before relying on the source model

D-1 is qualified by measurement, not assertion. The exercise:

| Dimension | Specification |
|---|---|
| Sample | 13 sectors × 2 issuers × 5 annual periods + 8 quarterly periods (≈26 issuers, ≈338 period records) |
| Measured | filing availability rate; tag coverage per mandatory line item; consolidated vs standalone availability; quarterly YTD/discrete form; restatement incidence; dividend + corporate-action availability; operating-metric derivability per sector; unit/scale variance; taxonomy versions encountered |
| Per-sector output | `statementCoverage`, `operatingMetricCoverage`, `usableMethodCount`, and a stage assignment `G1 \| G2 \| G3` |
| Gate | a sector below 70 % coverage of its *mandatory method inputs* is `PROVISIONAL`: its valuation is withheld by policy until coverage improves |
| Artifacts | `coverage-report.json` (machine-readable, versioned) + a short published report; refreshed whenever a sector is enabled |
| Effect on scope | the per-sector ladder in the roadmap §1.2 is populated from this report, not from expectation |

This is the mechanism by which D-1 is "accepted with demonstrated coverage": the acceptance stands, and
each sector's usability is an evidenced fact with a date, not a promise.

## R-18. Q-1 probe: results and design decision

**Executed** against `iips-production-market-data@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (the NP-04
specifier IRR already depends on), Node `v22.22.3`, in throwaway `mkdtemp` databases only. No existing
NP-04 database, Reports store or persisted report was opened, modified, migrated or recreated. Evidence:
`evidence/iid/Q1-NP04-COMPATIBILITY-PROBE-2026-11-05/` (`probe.ts`, `probe-result.json`, `README.md`).

| Check | Result |
|---|---|
| Non-portfolio scope-token acceptance | **Accepted** for `co:IN:ISIN:…`, `hd:pf-…/IN:ISIN:…`, `icr:co:IN:ISIN:…`, `+`-separated and bare forms; `:` and `/` both safe; token round-trips byte-identically |
| Duplicate `reportKey` behaviour | **Permitted** — identical content twice yields the same `reportKey`, two distinct `reportId`s and two distinct chains, each at v1 |
| `appendVersion` behaviour | **Head-only, single-parent**; stale-parent append ⇒ `PersistenceSupersessionError`; unknown parent ⇒ `PersistenceNotFoundError`; prior row bytes unchanged; `listSupersededBy` returns current + history |
| Artifact-chain validation | IRR `validateArtifact` / `validateArtifactChain` **accept** NP-04 rows after the normalization the adapter already performs; a spoofed owner pair is rejected |
| Independent chains per subject | **Confirmed** — three scope tokens ⇒ three chains; advancing one leaves the others untouched |
| Extra: empty vs whitespace `portfolioId` | empty rejected; **whitespace accepted** ⇒ IRR must validate token format itself |
| Extra: append with unchanged `reportKey` | **Accepted** as a new version ⇒ idempotency must be composer-enforced |
| Extra: scope drift within a chain | NP-04 **permits** it; `validateArtifactChain` **rejects** it ⇒ chain validation is load-bearing on write *and* read |

**Design decision.** The scope-token mechanism in Part I §3.1 is **supported and adopted**; fallback F2 is
**not** required and is withdrawn. Four implementation obligations follow from the probe and are binding:
token-format validation in IRR; composer-side idempotency; chain validation on read as well as write; and
reuse of the existing `toCanonicalArtifact` normalization rather than validating raw NP-04 rows.

## R-19. Decision register (closed)

| ID | Decision | Outcome |
|---|---|---|
| **D-1** | Financial-data source | **ACCEPTED.** XBRL-first as primary; CSV first-class fallback; vendor APIs optional accelerators only, never an analysis-time dependency; no subscription required for v1. **Qualified as follows:** (a) per-sector coverage demonstrated by R-16 before that sector is enabled; (b) sector operating metrics sourced as R-3 with explicit source classes and lineage; (c) methods whose mandatory inputs are unavailable are withheld, never approximated (R-3, R-4); (d) a sector below the coverage gate stays `PROVISIONAL` with valuation withheld. |
| **Q-1** | NP-04 scope-token compatibility | **AUTHORIZED and ANSWERED — SUPPORTED.** Probe executed as recorded in R-18. F2 withdrawn. Four implementation obligations adopted (R-18). |
| D-3 | Issuer-keyed identity | Retained, refined: `IssuerId` on CIN with equity-ISIN fallback (R-1) |
| D-4 | No fuzzy/name matching; fail closed | Retained unchanged |
| D-5 | Three artifacts on scope-token chains; `reportKey` inputs include digests | Retained; mechanism confirmed by probe (R-18) |
| D-6 | Boundary reports persisted; ad-hoc comparisons ephemeral | Retained, extended by R-14 (derived gap detection + reconciliation) |
| D-7 | Scope-split disposition vocabulary with `null` withholding | Retained, extended by R-8 (candidate subject) and R-9 (per-verb evidence) |
| D-8 | Hysteresis with hard triggers | Retained unchanged |
| D-9 | Sector valuation method matrix | Retained; formulas specified in R-4, multi-segment/SOTP in R-5 |
| D-10 | Eight change categories | Retained; treatment by dimension type in R-13 |
| D-11 | 2×2 attribution, degrading to unavailable | Retained; reproduction pre-check added (R-12) |
| D-12 | Sector-reference disclosure cannot drive analysis | Retained unchanged |
| Q-2 | Roster content | Operator-maintained file seeded from holdings ∪ watchlist, capped at 200, ISIN required (unchanged; a data decision, not a technical blocker) |
| Q-4 | Vendor adoption | Deferred by D-1; no v1 dependency |
| Q-5 | Price source for MoS | **Resolved by R-6**: PIT snapshot when one exists for `knownAsOf`; else dataset EOD with recorded provenance; otherwise MoS withheld |
| Q-8 | Restatement availability | **Resolved operationally by R-16**: measured, not assumed; absence yields `FILING_UNAVAILABLE`, never a silent adoption of the restated figure |
| Q-9 | Goals/risk-profile overlay | Closed as out of scope for v1 |
| Q-10 | Persisting ephemeral comparisons | Closed: no (R-14 keeps the boundary-only rule) |
| Q-11 | Dividend source | **Resolved by R-15** (corporate actions primary, cash-flow corroboration, conflicts reported) |
| Q-12 | Preview-row deep link | **Resolved**: preview rows resolve and may show a company assessment; they are not dispositionable until saved (R-8) |

**Genuinely open (non-blocking):** confirmation that issuer identity should be CIN-primary with equity-ISIN
fallback (R-1) rather than always ISIN-primary — a one-line change to `issuerKeyBasis` policy if the
operator prefers otherwise; and the operator's limits-policy values (R-11), which have recorded defaults.

## R-20. Risk and dependency summary (material only)

| # | Risk | Why it is material | Mitigation / consequence |
|---|---|---|---|
| 1 | **Operating-metric availability** for banking, insurance, capital markets, telecom | Their primary methods cannot be computed from XBRL; this is the largest correctness risk, and it is not solvable by better parsing | R-3 source classes + mandatory-input withholding + R-16 measurement; those sectors ship `PARTIAL` with valuation withheld until metrics are entered. Roadmap enables sectors in stages rather than claiming 13-sector coverage. |
| 2 | **XBRL tag and taxonomy heterogeneity** (IND AS revisions, per-company tagging variance) | Normalisation errors would surface as fundamental changes | `normalizationVersion` recorded per period; a normalisation change classifies as `MODEL`; R-16 measures tag coverage per line item before a sector is enabled |
| 3 | **Consolidated vs standalone inconsistency** across issuers and periods | Mixing them silently invalidates comparisons | R-2 scope rule with `SCOPE_MISMATCH` refusal; scope recorded per period |
| 4 | **Price alignment and staleness** | A stale or split-unadjusted price produces a wrong margin of safety, which is the number most likely to drive a decision | R-6 alignment window + mandatory corporate-action factor + MoS withheld on any doubt; price observation stored inside the artifact |
| 5 | **Restatement visibility** depends on re-filings being present in the dataset | A restatement that is invisible would be misclassified as performance | R-16 measures incidence; absence yields `FILING_UNAVAILABLE`; the comparator reports what it can prove and marks the rest `UNATTRIBUTED` |
| 6 | **Reproduction identity** (build digest, dependency pins, config digest) depends on the build process recording them | Without it, historical attribution degrades — and a degraded attribution that *looks* computed is worse than none | R-12 metadata is mandatory on every artifact; mismatch forces `UNAVAILABLE` + `UNATTRIBUTED`; identities are additive to the payload, so early phases must not omit them |
| 7 | **Operator data-entry burden** (filings, operating metrics, corporate actions) | Effort, not correctness — but it determines whether the tool is used | Universe cap (200), roster curation, `WATCH`/`PARTIAL` states that degrade honestly instead of blocking, file-in ingestion that needs no network |
| 8 | **Graph/scope creep** into a research terminal or an execution tool | The two ways this design could lose its integrity | Four-verb vocabulary, withholding gates, GET-only transport, schema tests asserting no order-shaped keys and no write affordance |

**Dependency notes.** No new package is required for any phase. The only cross-repository dependency is
already in place (`iips-np04-governed-persistence`). Ingestion ownership migration to IPD is a later
adapter swap behind `FundamentalsReadPort` and is deliberately not on the critical path — no phase of the
roadmap requires an IPD change to proceed.

## R-21. Closing statement for Revision 2

Part I's architecture stands: three artifact families on NP-04, sector-reference intelligence kept
structurally separate, missing data never fabricated, no execution path. Revision 2 closes the questions
that were open, corrects the identity and period contracts that were underspecified, specifies the
valuation arithmetic, and replaces "best effort" with a reconciliation protocol whose gaps are visible.

The design is now implementable without further decisions. Sequencing is in the roadmap; the recommended
starting point is IID-0, and the first user-visible milestone is M-1 at the end of IID-3.
