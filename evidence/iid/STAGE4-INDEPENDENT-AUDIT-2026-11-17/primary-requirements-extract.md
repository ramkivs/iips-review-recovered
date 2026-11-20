# Pinned primary baseline — verbatim line excerpts

Source blob `e6f756238089c6795c8568b37321f3e55ba60cb2`, SHA-256 `baac4427e543ff7749694e7fb59a4b147cb415b2f7fe3330544ce22a5d0835b6`.
Fetched via GitHub blob API, 122093 bytes; NOT merged implementation authority.

## Original lines 594–650

```text
## 21. Sequenced stages (dependency-driven)

Every stage states: objective · prerequisites · existing implementation · remaining work · acceptance criteria · evidence required · dependencies · can it proceed independently.

### Stage 1 — Runtime and source discovery
- **Objective:** deterministic, per-host truth about what the runtime needs, who owns it and what is missing — before any provisioning or code change.
- **Prerequisites:** none.
- **Existing:** `npm run iid:readiness` (P6-A, merged 2026-11-09), `docs/OPERATOR_RUNBOOK.md` §16, this report.
- **Remaining:** run `npm run iid:readiness -- --strict` **on the operator's Windows host** and record the result; compare `IIPS_DATA_DIR` resolution to the directory the user believes holds the files; re-run the two routes and compare with this report.
- **Acceptance:** `iid:readiness --json` prints the eight findings on the actual host; no `unknown-investigation-required` remains; output stored outside Git.
- **Evidence:** host capture; runbook §16 checklist ticked.
- **Dependencies:** none. **Independent:** yes.

### Stage 2 — Identity readiness
- **Objective:** an installed, validated identity reference set for the intended population, accepted by the platform's own loader.
- **Prerequisites:** Stage 1; **O1 decision** (source & scope of the roster); **O2 decision** if the D05-authenticated-universe bridge is to be considered.
- **Existing:** loader + validators (fail-closed); three validated starting points committed (evidence sets: Infosys, Marico, KEC; synthetic fixture for mechanics only); the readiness gate `identity-files` (P6-A D1).
- **Remaining:**
  1. Decide the population (issuer list, eligibility rules, exclusion reasons) — a data-owner act, not engineering.
  2. Produce/refresh `eligible-roster.json`, `listing-map.json`, `corporate-actions.json` from that decision; validate with the loader; digest them.
  3. Decide refresh cadence + owner (NSE/BSE master events; symbol changes).
  4. Re-run `/identity-coverage` — expect `available: true` and real per-row states for known securities (e.g. a portfolio row for Infosys resolves against the REL-1 roster).
- **Acceptance:** loader reports `available` on the Windows host; a **real** holding (or the broker preview rows) resolves `RESOLVED` or carries a named non-resolved state; counts add up (observed = assessable + unresolved); SF: 0 `ISSUER_KEY_CONFLICT`.
- **Evidence:** directory listing + digests; readiness output flipping `identity-files` to valid; a screenshot/capture of resolved rows (host-supplied).
- **Dependencies:** O1 (and P6-A D1 acting on it); O2 optional. **Independent:** of Stage 3 (can run first); of IPD.
- **Do not:** copy synthetic fixtures into the operational domain; invent identifiers; widen resolver rules to force `RESOLVED`.

### Stage 3 — Investment dataset readiness
- **Objective:** at least one real, digest-verified operator dataset installed at `${IIPS_DATA_DIR}/investment/dataset`, plus the ingestion habit.
- **Prerequisites:** Stage 1; **O3 decision** (which issuer set; accept OPERATOR_SUPPLIED evidence-derived datasets as local operational inputs, with all caveats attached).
- **Existing:** full ingestion path (`cli/ingest.ts`), content-addressed datasets with digests, four committed **real** datasets (REL-1 Infosys incl. price-bearing WI2/WI3 inputs; WI2; WI7 Marico; WI8 KEC), measurement tooling, evidence corpus.
- **Remaining:**
  1. Choose the initial population (recommended: Infosys + Marico + KEC — three sectors, three issuers, smallest honest universe).
  2. Install via `tsx src/investment/cli/ingest.ts --input <bundle>/ingest-input --dataset-dir <IIPS_DATA_DIR>/investment/dataset` (REL-1: use `REL-1-INFOSYS-2026-11-06/dataset/` directly, or rebuild from `ingest-input/`).
  3. Decide and document freshness expectations (dataAsOf FY2024/FY2026 depending on bundle; stale-but-real is still honest).
  4. Add operating metrics for the target sectors (BM_*/NN for Banking etc. require operator entry — Capital Markets/Telecom/Banking are blocked until someone transcribes their metrics; Consumer/Industrials/Technology can start).
- **Acceptance:** `/investment/coverage` lists the installed issuers with non-NONE class (`OPERATOR_SUPPLIED`), sector measurement reflects measured sectors (Technology, Consumer, Industrials), methods usable > 0 for those sectors; `iid:readiness` flips `fundamentals-dataset` to valid; digests recompute.
- **Evidence:** readiness output; page capture (host); manifest listing (paths + digests).
- **Dependencies:** O3. **Independent:** of Stage 2 (can run in parallel); of IPD.
- **Note:** installing the evidence bundles **does not** make them market truth — single-issuer, transcribed, annual-only, no quarterly, corporate-action table empty. Every surface will keep saying so.

### Stage 4 — Coverage readiness
- **Objective:** issuer coverage, completeness, method usability and sector measurement verified on **installed** data, with the 10-scenario demo (§23) passing.
- **Prerequisites:** Stages 2–3.
- **Existing:** all measurement code; `measureCoverage` CLI output embedded in ingest; unmapped-tag visibility; adequacy ladder.
- **Remaining:** run the measurement on the installed data; reconcile against bundle expectations (Infosys: Technology measured, EV_REVENUE withheld absent TM_* metrics; Marico: G1_ENABLED; KEC: G2_PARTIAL); decide whether to enter operating metrics to unlock TM_/IN_/BM_ families; fill corporate actions as events occur; extend tag map only with golden-fixture discipline (L-002 process).
- **Acceptance:** per-sector `measured: true` for Technology/Consumer/Industrials with the methods above usable; unavailable methods carry reasons; completeness/adequacy computed per issuer; zero fabricated figures (spot-check 5 derived values against filings by hand).
- **Evidence:** ingest coverage output; coverage report JSON; hand-check notes.
- **Dependencies:** Stage 3. **Independent:** of IPD (all three chosen issuers avoid metric-dependent methods except IN_/TM_).

### Stage 5 — End-to-end integration
- **Objective:** holdings → identity → dataset → assessment → disposition, and watchlist/finance disclosure, working as one loop on the host.
- **Prerequisites:** Stages 2–4; **IPD-owned:** active binding provisioned + IPC peer listening; user sets `IIPS_G2_IPC_ENDPOINT`, `IIPS_G3_IPC_BINDING_PROVISIONED=true` (only after IPD confirms); reports owner carrier + NP-04 path (`IIPS_NP04_DATABASE_PATH`); F-3 carrier for watchlists if needed.
- **Existing:** every consumer implemented; `iid:readiness` covers all gates; runbook §14–16 gives exact commands.
- **Remaining:** IPD procedure (not IRR's to execute); two carriers materialised (materialisers exist and were proven in P6-A); NP-04 path chosen (accept one-time create/migrate); mint v1 assessments for the three issuers (operator CLI) — **this also populates `/investment/company/:issuerId` for real**; verify a separate-process readback.
- **Acceptance:** `iid:readiness --strict` exits 0; a real portfolio read resolves rows through IPC; an assessment mints, persists, reads back, and a second version diff appears in change intelligence; `/investment/company/IN:CIN:…` renders the chain; no 503 anywhere on the read path.
- **Evidence:** host readiness capture; NP-04 query evidence (empty→nonempty transition recorded); assessment readback logs.
```

## Original lines 684–724

```text
## 23. Minimum realistic acceptance scenarios (demonstrate readiness)

For each: API expectation · UI expectation · current truth. **(S) = synthetic fixture only; (R) = real evidence bundle; (––) = cannot run today.**

1. **Normal equity holding, valid identity, complete history (R, Infosys).** API: observation resolves `RESOLVED`; dataset reports 1 issuer COVERED; assessment endpoint returns the chain once minted. UI: `/identity-coverage` shows the holding row RESOLVED with link; `/investment/coverage` shows Infosys row COVERED (Technology measured); `/investment/company/IN:CIN:L85110KA1981PLC013115` renders the version chain. *Today: cannot run — no files/dataset installed (Stages 2–3).*
2. **Valid identity, insufficient history (S or any 2-period issuer).** API: issuer shows financials present, adequacy `PARTIAL/INSUFFICIENT`, `NO_FINANCIALS` excluded states only when truly empty; per-row reason visible. UI: row shows PARTIAL with gaps listed, no verdict-like colouring on missing values. *Today: mechanics testable in fixtures; real demonstration needs an installed sparse dataset.*
3. **Financially covered issuer, unresolved security (S).** API: dataset COVERED; identity row `UNMATCHED`/`ISIN_NOT_IN_ROSTER` (roster deliberately lacking one security); no assessment link. UI: both shown side by side; dependency cell "unresolved". *Today: constructible in fixture-land; demonstrates the separation honestly.*
4. **Unmatched/ambiguous security (S).** API: `UNMATCHED` or `AMBIGUOUS` with candidates listed; totals exclude it from assessable. UI: reason text rendered; nothing classified.
5. **Newly imported holding.** API after import: new observation row; pre-provisioning it is `UNMATCHED` (roster lacks issuer); after roster edit it flips `RESOLVED` with zero code change. UI: import → preview evaluation → portfolio refresh → identity re-read. *Today: preview path works; portfolio path blocked on IPD binding.*
6. **Watchlist-only security.** API: watchlist item observed; resolves `SECTOR_REFERENCE_NOT_AN_IDENTITY` (current) — *not* "unresolved security"; with O8 adopted an issuer row would resolve instead. UI: the add control names the certified space; item does not link to company research (unless underlying id parses — sector refs don't).
7. **Company affected by a corporate action (S).** API: MERGER/DEMERGER row yields successor reconciliation; pre/post rows attributed; ratios reconcile to 1 or the file is rejected wholesale (`SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE`). UI: successor reconciliation block; failure ⇒ whole source set rejected with `AMBIGUOUS_LISTING`-class issues. *Today: validator + tests cover; data absent in all committed bundles (L-031) — real demo pending first transcribed CA.*
8. **Specialised-measurement sector (Banking/Insurance/Capital Markets/Telecom).** API: methods `WITHHELD` with the specific missing metrics (e.g. BM_NIM/GNPA/CET1) even with full statements; sector stage G3_WITHHELD if statements present but metrics absent; never approximated. UI: slot list with reasons; no borrowed Banking verdicts from Technology. *Today: fully demonstrable in fixtures; Marico/KEC show the Consumer/Industrials analogue on real data.*
9. **Stale/incomplete company (R, KEC debt-side).** API: `NOT_REPORTED`/`NOT_COMPUTABLE` components; net debt unresolved ⇒ bridge refuses; adequacy PARTIAL; confidence caps (STALE_DATA). UI: refusal text, missing-with-reason everywhere. *Today: committed in WI-8 bundle; installable to replay locally.*
10. **Mixed portfolio (covered + uncovered).** API: counts split COVERED/NO_FINANCIALS/SECTOR_NOT_MEASURED; identity report counts separately; watchlist rows disclosed as sector refs. UI: a portfolio page with a mixture renders all states simultaneously; totals add up; nothing is promoted. *Today: fixture-constructible; needs Stages 2–3 + binding for real holdings.*

Fixture-vs-real labelling in any demo shown to the owner: fixtures = `SYNTHETIC_FIXTURE` chip; evidence bundles = `OPERATOR_SUPPLIED` with bundle name. **No synthetic figure is to be cited as coverage.**

---

# PART VII — INTEGRATION GAPS, DISCREPANCIES AND UNKNOWNS

## 24. Integration gaps (named, ordered by consequence)

Every gap below is evidence-backed. **C** = confirmed by direct observation here or committed evidence; **U** = unknown (needs the named host/owner). None is papered over by new architecture; each is a provisioning, data, licence or decision item.

| # | Gap | Class | Consequence | Evidence |
|---|---|---|---|---|
| G-1 | **No full-universe identity reference set exists anywhere.** IPD has none (checked at pin `1aee57fe09` and `main`, 2026-11-11, `git/trees?recursive=1`); IRR has synthetic fixtures and three one-issuer operator sets | 1 (C) | IID-01/02/03 cannot classify any real holding | loader run; IPD tree listing; find for `eligible-roster.json` |
| G-2 | **No fundamentals dataset is installed** at `<IIPS_DATA_DIR>/investment/dataset` on this host (and never on any host, operationally) | 2 (C) | IID-01 cannot mint; Investment Coverage reports NONE; assessments 404 | readiness findings; direct runtime call (§11); P6-A |
| G-3 | **Holdings lane unusable**: IPD active binding not provisioned; IPC peer not listening | 3/7 (C for Linux; U for Windows) | Portfolio reads 503; IID-02 blocked; Identity Coverage's HOLDING source missing | readiness `ipd-binding-precondition`, `ipc-endpoint`; P6-A D5/D6 |
| G-4 | **Operating metrics must be operator-entered**; 0 metric records in every committed dataset; sectors requiring metric-qualified methods (all metric columns of §13.1) stay withheld | 1/5 (C) | 14 of 38 slots require at least one operating metric and stay withheld regardless of statements; 24 are statement-only and unlock with data alone | `OPERATING_METRICS` (`OPERATOR_ENTERED` everywhere, zero VENDOR); all WI bundles carry empty `operating-metrics.csv` |
| G-5 | **XBRL ingestion was never exercised on a real India Ind-AS XBRL instance**; every real bundle was PDF-transcribed CSV; `xbrl.ts` is fixture-tested only | 6 (C) | first real XBRL run will surface tag gaps exactly as designed (visible issues) — expect a burst of `UNMAPPED_XBRL_TAG` warnings, not silent pass | ingestion read; WI-3 README ("no Ind AS XBRL instance was reachable") |
| G-6 | **No quarterly data, anywhere** | 1 (C) | quarterly early-warning value absent; all methods calibrated on annual; nothing breaks, but no intra-year freshness either | REL-1 manifest (0 quarterly periods); no bundle contains quarterly |
| G-7 | **Sector spelling split-brain**: certified v1.1 replay baseline universe uses `Automobile`, `Materials & Metals`, `Telecommunications` (grep of `PROGRAM_v1.1_REPLAY_BASELINE.json`-derived membership test); `SectorName` (`operatingMetrics.ts:11`) and every dataset instruction use `Auto`, `Materials`, `Telecom`; roster `sector` is free text (no closed-set validation in `sources.ts`; `IssuerRecord.sector` is typed but the CLI never checks it) and `measure.ts` matches `issuer.sector === sector` exactly | 6 (C) | a roster copied from baseline spellings silently yields **zero sector measurement** with issuers present; no error is raised | `watchlists/governed-reference-universe-membership.test.ts:26`; `operatingMetrics.ts:11-24`; `measure.ts:191`; `sources.ts` (sector unvalidated); `cli/ingest.ts` (no sector check) |
| G-8 | **Corporate actions: empty everywhere**; MERGER/DEMERGER successor reconciliation never run on real data | 1/6 (C) | splits/bonuses/actions silently stale; identity stays `STALE_REFERENCE` until repaired; CA-linked questions stay unanswerable | `corporate-actions.json` empty in fixtures and bundles; CA validator implemented but unproven on real events (L-031) |
| G-9 | **Freshness window drift**: design says five *trading days* for price freshness; code enforces seven *calendar days* | 4/6 (C, design-vs-code) | marginal; a stock 6 calendar days stale passes a 7-day gate that a 5-trading-day design would fail | `L-033`; freshness gate in payload assembly |
| G-10 | **The JS-free `/investment/coverage` HTML still renders the identity-unavailable page**. The SPA route `/investment/coverage` is the Investment Coverage page and is correct; the raw HTML route is the identity handler's minimalist view (identity 503 body), because `investmentCoverageEndpoint` owns no HTML route | 4 (C) | a bookmarked/JS-disabled view claims identity failure while the SPA shows the honest dataset position; misinforms exactly the no-JS operator | `coverageEndpoint.ts` (`COVERAGE_ROUTES.html = '/investment/coverage'`, `renderUnavailableHtml`); `investmentCoverageEndpoint.ts` (JSON-only); `coverage-transport.ts` falls through to the identity binder; separation record known exception — **root cause pinned by code inspection this cycle** |
| G-11 | **`/investment/company/:issuerId` has never served a real chain** — no assessment version exists anywhere operational (HTTP 404 on both candidate grants) | 2/7 (C) | IID-01 read path and change-timeline unexercised in reality; WI-3/WI-8 persisted nothing to a store | readiness `np04-assessment-store`; P6-A D2/D9; `show-investment-chain` unrun against any store |
| G-12 | **No price observation for any holding**; WI-2's single transcribed close is three trading days stale, forces contemporary valuation, and cannot feed period-matched MoS | 1/5 (C) | margin-of-safety unusable operationally (`mos` requires fresh contemporary price); KEC/Marico intrinsic remains null without it | WI2 README; `L-030`–`L-034` |
| G-13 | **Broker-import → identity pipeline never demonstrated end-to-end**: broker rows evaluate in preview only; persistence lane exists (CAP-02/03) but no imported row has been through the resolver in this environment | 7 (C) | the primary user journey is unverified as a flow, only as components | `/api/investment/coverage/preview` (tested); CAP-03 lane docs; no runtime evidence of the composite flow |
| G-14 | **Two subsystems, two sector vocabularies, no lint**: nothing prevents the §G-7 class of defect from re-entering via hand-authored rosters | 4/6 (C) | same silent-failure shape for any future vocabulary drift | as G-7 |
```
